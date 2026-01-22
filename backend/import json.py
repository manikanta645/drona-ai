import json
import numpy as np
from sentence_transformers import SentenceTransformer, util

class RAGEngine:
    def __init__(self, data_path="data/heritage.json"):
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        with open(data_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)
        self.texts = [d["text"] for d in self.data]
        self.embeddings = self.model.encode(self.texts, convert_to_tensor=True)

    def search(self, query, top_k=1):
        query_embedding = self.model.encode(query, convert_to_tensor=True)
        hits = util.semantic_search(query_embedding, self.embeddings, top_k=top_k)[0]
        top = self.data[hits[0]["corpus_id"]]
        return top
