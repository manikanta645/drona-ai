import React from "react";
import templeCard from "../assets/knowledge_temple.png";

export default function KnowledgeCards() {
  return (
    <div className="knowledge-section">
      <h2>📚 Learned Wisdom</h2>
      <div className="card-grid">
        <div className="card">
          <img src={templeCard} alt="Temples" />
          <p>Indian Temples</p>
        </div>
        <div className="card">
          <img src={templeCard} alt="Festivals" />
          <p>Festivals of India</p>
        </div>
      </div>
    </div>
  );
}
