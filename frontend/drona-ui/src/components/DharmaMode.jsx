import React, { useRef, useEffect } from 'react';
import './DharmaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const DharmaMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const dharmaTopics = [
    { id: 'duty', name: 'Duty & Responsibility', emoji: '⚖️' },
    { id: 'virtue', name: 'Virtue & Character', emoji: '✨' },
    { id: 'truth', name: 'Truth & Honesty', emoji: '🕉️' },
    { id: 'sacrifice', name: 'Sacrifice & Service', emoji: '🙏' }
  ];

  return (
    <div className="dharma-container">
      <div className="dharma-header">
        <h1 className="dharma-title">⚖️ Dharma Vidya - The Path of Righteousness</h1>
        <p className="dharma-subtitle">Understand duty, virtue, and eternal law</p>
      </div>

      <div className="dharma-content">
        {/* Left: Philosophy Topics */}
        <div className="philosophy-panel">
          <h2 className="panel-title">Principles of Dharma</h2>
          <div className="dharma-topics">
            {dharmaTopics.map((topic) => (
              <button
                key={topic.id}
                className="dharma-topic-btn"
                onClick={() => askDrona(`Teach me about ${topic.name} in the context of Dharma`)}
                disabled={isLoading}
              >
                <span className="topic-emoji">{topic.emoji}</span>
                <span className="topic-text">{topic.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Center: Guru & Teaching */}
        <div className="teaching-center">
          <div className={`philosopher-avatar ${isLoading ? 'pondering' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="wisdom-aura"></div>}
          </div>
          <p className="teacher-name">Āchārya Droṇāchārya</p>

          {/* Philosophy Scroll */}
          <div className="philosophy-scroll" ref={scrollContainerRef}>
            {chatHistory.slice(-6).map((msg, idx) => (
              <div key={idx} className={`philosophy-bubble ${msg.type}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="loading-wisdom">
                <div className="om-glow">ॐ</div>
                <p>The guru contemplates...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Student Insights */}
        <div className="insights-panel">
          <div className="insight-box">
            <h3>Your Level</h3>
            <div className="level-badge">{studentLevel}</div>
          </div>

          <div className="insight-box">
            <h3>Respect Earned</h3>
            <div className="respect-badge">{respectMeter}</div>
          </div>

          <div className="insight-box">
            <h3>Student Name</h3>
            <div className="name-display">{studentName || 'Shishya'}</div>
          </div>

          <div className="insight-box">
            <h3>Path to Dharma</h3>
            <div className="dharma-path">
              <div className="path-step">Understanding</div>
              <div className="path-step">Practice</div>
              <div className="path-step">Mastery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DharmaMode;
