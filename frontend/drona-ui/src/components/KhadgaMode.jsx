import React, { useRef, useEffect, useState } from 'react';
import './KhadgaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const KhadgaMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);
  const [selectedStance, setSelectedStance] = useState('neutral');
  const [strikeCount, setStrikeCount] = useState(0);
  const [stance] = useState([
    { id: 'neutral', name: 'Neutral Stance', emoji: '🧑‍🦯', desc: 'Ready position' },
    { id: 'attack', name: 'Attack Stance', emoji: '⚔️', desc: 'Offensive form' },
    { id: 'defense', name: 'Defense Stance', emoji: '🛡️', desc: 'Protective form' },
    { id: 'parry', name: 'Parry Stance', emoji: '↪️', desc: 'Counter-block form' }
  ]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const handlePracticeStrike = () => {
    setStrikeCount(s => s + 1);
    askDrona(`I just performed a strike from ${selectedStance} stance. Evaluate my technique.`);
  };

  const handleStanceChange = (newStance) => {
    setSelectedStance(newStance);
    askDrona(`I am transitioning to ${stance.find(s => s.id === newStance).name}. Guide me.`);
  };

  return (
    <div className="khadga-container">
      {/* Header */}
      <div className="khadga-header">
        <h1 className="khadga-title">🗡️ Khadga Vidya - Sword Mastery</h1>
        <p className="khadga-subtitle">Master the art of the divine blade</p>
      </div>

      <div className="khadga-content">
        {/* Left: Stance Selector */}
        <div className="stance-panel">
          <h2 className="panel-title">Stances</h2>
          <div className="stance-grid">
            {stance.map((s) => (
              <div
                key={s.id}
                className={`stance-card ${selectedStance === s.id ? 'active' : ''}`}
                onClick={() => handleStanceChange(s.id)}
              >
                <div className="stance-emoji">{s.emoji}</div>
                <div className="stance-name">{s.name}</div>
                <div className="stance-desc">{s.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Middle: Guru & Visualization */}
        <div className="training-center">
          <div className={`sword-avatar ${isLoading ? 'teaching' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="training-aura"></div>}
          </div>
          <p className="trainer-name">Āchārya Droṇāchārya</p>

          {/* Sword Visualization */}
          <div className="sword-visualization">
            <div className={`sword-display ${selectedStance}`}>
              <div className="sword-icon">⚔️</div>
              <div className="stance-label">{stance.find(s => s.id === selectedStance)?.name}</div>
            </div>
          </div>

          {/* Training Feedback */}
          <div className="feedback-scroll" ref={scrollContainerRef}>
            {chatHistory.slice(-5).map((msg, idx) => (
              <div key={idx} className={`feedback-bubble ${msg.type}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="loading-training">
                <div className="sword-spin">⚔️</div>
                <p>Analyzing technique...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Training Controls */}
        <div className="training-controls">
          <div className="current-stance-box">
            <h3>Current Stance</h3>
            <div className="current-stance-display">
              {stance.find(s => s.id === selectedStance)?.emoji}
            </div>
            <p className="current-stance-name">{stance.find(s => s.id === selectedStance)?.name}</p>
          </div>

          <div className="practice-box">
            <h3>Practice Strike</h3>
            <button 
              className="strike-btn"
              onClick={handlePracticeStrike}
              disabled={isLoading}
            >
              ⚡ Execute Strike
            </button>
            <p className="practice-hint">Perform a strike in your current stance</p>
          </div>

          <div className="techniques-box">
            <h3>Techniques Mastered</h3>
            <div className="techniques-list">
              <div className="technique-item">Thrust</div>
              <div className="technique-item">Slash</div>
              <div className="technique-item">Parry</div>
              <div className="technique-item">Riposte</div>
            </div>
          </div>

          <div className="progress-box">
            <h3>Session Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, strikeCount * 10)}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.min(100, strikeCount * 10)}% Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KhadgaMode;
