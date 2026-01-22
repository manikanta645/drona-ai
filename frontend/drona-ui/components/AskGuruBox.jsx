// src/components/AskGuruBox.jsx
import React, { useState } from "react";
import askButton from "../assets/ask_button.png";

export default function AskGuruBox({ onAsk }) {
  const [question, setQuestion] = useState("");

  return (
    <div className="ask-guru">
      <input
        type="text"
        placeholder="Ask Guru DRONA..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />
      <img
        src={askButton}
        alt="Ask"
        className="ask-btn"
        onClick={() => onAsk(question)}
      />
    </div>
  );
}
