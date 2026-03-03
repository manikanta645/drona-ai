import React, { useRef, useEffect, useState } from 'react';
import './GadaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const GadaMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);
  const [selectedStrike, setSelectedStrike] = useState('power');
  const [strikesDelivered, setStrikesDelivered] = useState(0);
  const [damageOutput, setDamageOutput] = useState(0);
  const [techniques] = useState([
    { id: 'power', name: 'Power Strike', emoji: '💪', desc: 'Maximum force blow' },
    { id: 'spinning', name: 'Spinning Attack', emoji: '🌪️', desc: 'Rotating momentum' },
    { id: 'defense', name: 'Defensive Block', emoji: '🛡️', desc: 'Shield with mace' },
    { id: 'overhead', name: 'Overhead Smash', emoji: '⬆️', desc: 'High-impact strike' }
  ]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const handleDeliverStrike = () => {
    const newDamage = Math.min(100, damageOutput + Math.random() * 25);
    setStrikesDelivered(s => s + 1);
    setDamageOutput(newDamage);
    askDrona(`I delivered a ${techniques.find(t => t.id === selectedStrike).name}. Impact: ${newDamage.toFixed(0)}%. Evaluate my form.`);
  };

  const handleTechniqueChange = (technique) => {
    setSelectedStrike(technique);
    askDrona(`I am switching to ${techniques.find(t => t.id === technique).name}. Guide my stance.`);
  };

  return (
    <div className="gada-container">
      {/* Header */}
      <div className="gada-header">
        <h1 className="gada-title">🔨 Gada Vidya - Mace Mastery</h1>
        <p className="gada-subtitle">Master the art of the mighty mace and crushing strikes</p>
      </div>

      <div className="gada-content">
        {/* Left: Technique Selector */}
        <div className="technique-panel">
          <h2 className="panel-title">Strike Techniques</h2>
          <div className="technique-grid">
            {techniques.map((t) => (
              <div
                key={t.id}
                className={`technique-card ${selectedStrike === t.id ? 'active' : ''}`}
                onClick={() => handleTechniqueChange(t.id)}
              >
                <div className="technique-emoji">{t.emoji}</div>
                <div className="technique-name">{t.name}</div>
                <div className="technique-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat/Feedback */}
        <div className="feedback-panel">
          <div className="feedback-header">
            <img src={dronacharya} alt="Dronacharya" className="guru-image" />
            <div className="guru-info">
              <h3>Dronacharya's Guidance</h3>
              <p className="student-name">Student: {studentName}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">Strikes Delivered</span>
              <span className="stat-value">{strikesDelivered}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Impact Level</span>
              <span className="stat-value">{damageOutput.toFixed(0)}%</span>
            </div>
          </div>

          {/* Chat History */}
          <div className="chat-container" ref={scrollContainerRef}>
            {chatHistory.length === 0 ? (
              <div className="empty-state">
                <p>Begin your Gada training...</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.role}`}>
                  <span className="message-role">{msg.role === 'guru' ? 'Guru: ' : 'You: '}</span>
                  {msg.text}
                </div>
              ))
            )}
            {isLoading && <div className="loading-indicator">Guru is thinking...</div>}
          </div>

          {/* Action Button */}
          <button 
            onClick={handleDeliverStrike} 
            className="action-button"
            disabled={isLoading}
          >
            {isLoading ? 'Awaiting Guidance...' : `Deliver ${techniques.find(t => t.id === selectedStrike).name}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GadaMode;
