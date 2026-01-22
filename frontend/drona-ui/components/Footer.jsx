import React from "react";
import texture from "../assets/footer_texture.png";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundImage: `url(${texture})`,
        backgroundSize: "cover",
        color: "gold",
        textAlign: "center",
        padding: "1rem",
        fontFamily: "Noto Serif, serif",
      }}
    >
      🪔 DRONA © 2025 – Preserving India’s Eternal Knowledge
    </footer>
  );
}
