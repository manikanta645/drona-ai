import os
import json
from sentence_transformers import SentenceTransformer
import chromadb

def load_dataset(dataset_path, db_path="data/chroma_db"):
    """Load and embed any JSON dataset into DRONA’s ChromaDB memory."""
    if not os.path.exists(dataset_path):
        print(f"❌ Dataset not found at {dataset_path}")
        return

    print(f"🌸 Loading dataset: {dataset_path}")
    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    client = chromadb.PersistentClient(path=db_path)
    collection = client.get_or_create_collection(name="cultural_knowledge")

    with open(dataset_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    added = 0
    for item in data:
        topic = item.get("topic")
        text = item.get("text")

        if not topic or not text:
            continue

        # Skip duplicates
        existing = collection.get(ids=[topic])
        if existing and existing.get("ids"):
            continue

        embedding = embedder.encode(text).tolist()
        collection.add(
            documents=[text],
            ids=[topic],
            embeddings=[embedding]
        )
        added += 1

    print(f"✅ Successfully added {added} new cultural entries to DRONA memory.")
    print("🧠 Knowledge base enrichment complete!")


if __name__ == "__main__":
    # Create folders if missing
    os.makedirs("data", exist_ok=True)
    dataset_files = [f for f in os.listdir("data") if f.endswith(".json")]

    if not dataset_files:
        print("⚠️ No JSON files found in /data folder.")
    else:
        print(f"📚 Found {len(dataset_files)} dataset(s) in /data:")
        for file in dataset_files:
            print(f" → {file}")
            load_dataset(os.path.join("data", file))
