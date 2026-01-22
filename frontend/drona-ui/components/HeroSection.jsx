// src/components/HeroSection.jsx
import React from "react";
import "./HeroSection.css";
import auraVideo from "../assets/aura_background.mp4";
import guru from "../assets/dronacharya.png";
import logo from "../assets/drona_logo.png";

export default function HeroSection() {
  return (
    <section className="hero-section">
      <video autoPlay loop muted playsInline className="aura-video">
        <source src={auraVideo} type="video/mp4" />
      </video>

      <div className="hero-overlay">
        <img src={logo} alt="DRONA Logo" className="drona-logo" />
        <img src={guru} alt="Guru Dronacharya" className="guru-image" />

        <h1 className="hero-title">🪔 DRONA – The Digital Guru of Indian Wisdom</h1>
        <p className="hero-subtitle">
          Ask anything about Indian Culture, Temples, Festivals, and Knowledge.
        </p>
      </div>
    </section>
  );
}
