import json
import os
import time
from typing import Tuple, Optional
from sentence_transformers import SentenceTransformer
import chromadb


class RAGEngine:
    def __init__(self):
        """
        DRONA's Self-Learning Memory Engine.
        Handles knowledge storage, retrieval, and synchronization with vector DB.
        """
        self.data_path = os.path.join("data", "memory.json")
        self.db_path = os.path.join("data", "chroma_db")
        os.makedirs("data", exist_ok=True)

        print("🧠 Loading SentenceTransformer embeddings model (MiniLM-L6-v2)...")
        start_time = time.time()
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        print(f"✅ Model loaded in {time.time() - start_time:.2f}s")

        # Initialize ChromaDB persistent client
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_or_create_collection(name="drona_memory")

        # Ensure JSON memory exists
        if not os.path.exists(self.data_path):
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump([], f, indent=4, ensure_ascii=False)

        # Load and sync any pre-existing memory
        self._sync_data()

    # ------------------------------------------------------------------
    def _read_memory_file(self) -> list:
        """Safely read JSON memory file."""
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            print("⚠️ Corrupted memory.json, resetting file.")
            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump([], f)
            return []
        except Exception as e:
            print(f"⚠️ Error reading memory.json: {e}")
            return []

    # ------------------------------------------------------------------
    def _sync_data(self):
        """Sync JSON memory into Chroma vector DB at startup."""
        try:
            data = self._read_memory_file()
            chroma_ids = set(self.collection.get()["ids"])
            new_entries = [d for d in data if d["topic"] not in chroma_ids]

            for item in new_entries:
                emb = self.embedder.encode(item["text"]).tolist()
                self.collection.add(
                    documents=[item["text"]],
                    ids=[item["topic"]],
                    embeddings=[emb],
                    metadatas=[{"source": "memory.json"}],
                )

            if new_entries:
                print(f"📚 Synced {len(new_entries)} new items into DRONA memory.")
            else:
                print("📖 Memory is up-to-date.")
        except Exception as e:
            print(f"⚠️ Sync error: {e}")

    # ------------------------------------------------------------------
    def _is_greeting_or_small_talk(self, query: str) -> bool:
        """Check if query is a greeting or small talk that shouldn't trigger RAG search."""
        greeting_keywords = [
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening",
            "namaste", "namaskar", "greetings", "hey there", "howdy",
            "thanks", "thank you", "thanks a lot", "thank you very much",
            "ok", "okay", "yes", "yeah", "no", "nope", "sure", "alright",
            "bye", "goodbye", "see you", "tata", "see ya"
        ]
        query_lower = query.lower().strip()
        # Remove punctuation for checking
        query_clean = query_lower.replace("!", "").replace("?", "").replace(".", "").replace(",", "")
        
        # Check if it's just a greeting or very short (< 10 chars after cleaning)
        if len(query_clean) < 10:
            for greeting in greeting_keywords:
                if greeting in query_clean:
                    return True
        
        # If query is very short and doesn't contain question words, likely not a real question
        if len(query_clean.split()) <= 2:
            question_words = ["what", "who", "when", "where", "why", "how", "which", "tell", "explain", "describe"]
            has_question_word = any(word in query_clean for word in question_words)
            if not has_question_word:
                return True
        
        return False

    # ------------------------------------------------------------------
    def search(self, query: str, similarity_threshold: float = 0.5) -> Tuple[Optional[str], Optional[str]]:
        """
        Find the most relevant piece of stored knowledge for a query.
        Returns: (topic, content) only if similarity is above threshold.
        
        Args:
            query: The search query
            similarity_threshold: Minimum cosine similarity (0-1) to consider a match. Default 0.5.
        """
        try:
            # Skip search for greetings and small talk
            if self._is_greeting_or_small_talk(query):
                print(f"ℹ️ Skipping RAG search for greeting/small talk: '{query}'")
                return None, None
            
            # Check if collection has any documents
            collection_count = self.collection.count()
            if collection_count == 0:
                print("ℹ️ No stored knowledge yet.")
                return None, None
            
            query_emb = self.embedder.encode(query).tolist()
            result = self.collection.query(
                query_embeddings=[query_emb], 
                n_results=1,
                include=["documents", "ids", "distances", "metadatas"]
            )

            if result and result.get("documents") and len(result["documents"][0]) > 0:
                # Get the distance (lower = more similar)
                # ChromaDB uses L2 distance for normalized vectors
                # For normalized vectors with L2 distance:
                # - Distance 0.0 = identical (similarity 1.0)
                # - Distance ~1.0 = moderately similar (similarity ~0.5)
                # - Distance ~1.4 = orthogonal (similarity ~0.0)
                # - Distance 2.0+ = opposite (similarity negative)
                distance = result.get("distances", [[1.5]])[0][0] if result.get("distances") else 1.5
                
                # Convert L2 distance to similarity score (approximate for normalized vectors)
                # Cosine similarity ≈ 1 - (distance^2 / 2) for normalized vectors
                if distance <= 1.414:  # sqrt(2) = maximum for normalized vectors
                    similarity = 1.0 - (distance**2 / 2.0)
                else:
                    similarity = 0.0
                
                # Also use direct distance threshold as fallback (distance < 1.0 is usually relevant)
                distance_threshold = 1.0
                is_relevant = similarity >= similarity_threshold or distance < distance_threshold
                
                if is_relevant:
                    topic = result["ids"][0][0]
                    text = result["documents"][0][0]
                    print(f"🔍 Found related topic: {topic} (similarity: {similarity:.3f}, distance: {distance:.3f})")
                    return topic, text
                else:
                    print(f"ℹ️ Found topic but relevance too low (similarity: {similarity:.3f}, distance: {distance:.3f})")
                    return None, None

        except Exception as e:
            print(f"⚠️ Search error: {e}")

        print("ℹ️ No relevant topic found.")
        return None, None

    # ------------------------------------------------------------------
    def save_new_topic(self, topic: str, text: str):
        """
        Add a new piece of knowledge to DRONA’s memory and persist in both JSON + Chroma.
        """
        try:
            data = self._read_memory_file()

            # prevent duplicates
            if any(item["topic"].lower() == topic.lower() for item in data):
                print(f"ℹ️ Topic '{topic}' already exists, skipping.")
                return

            new_item = {"topic": topic, "text": text, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}
            data.append(new_item)

            with open(self.data_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)

            emb = self.embedder.encode(text).tolist()
            self.collection.add(
                documents=[text],
                ids=[topic],
                embeddings=[emb],
                metadatas=[{"source": "auto-learned"}],
            )

            print(f"🪔 DRONA learned new topic: {topic}")

        except Exception as e:
            print(f"⚠️ Error saving topic '{topic}': {e}")

    # ------------------------------------------------------------------
    def export_knowledge(self, export_path="data/exported_knowledge.json"):
        """Export all stored knowledge as JSON for easy sharing or fine-tuning."""
        try:
            data = self._read_memory_file()
            with open(export_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            print(f"📤 Exported {len(data)} knowledge entries to {export_path}")
        except Exception as e:
            print(f"⚠️ Export error: {e}")

    # ------------------------------------------------------------------
    def count_entries(self) -> int:
        """Return total learned topics."""
        try:
            return len(self.collection.get()["ids"])
        except Exception:
            return 0
