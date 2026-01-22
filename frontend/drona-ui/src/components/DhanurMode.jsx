import React, { useRef, useEffect, useState } from 'react';
import './DhanurMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const DhanurMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);
  const [selectedTechnique, setSelectedTechnique] = useState('aimed');
  const [arrowsShot, setArrowsShot] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [techniques] = useState([
    { id: 'aimed', name: 'Aimed Shot', emoji: '🎯', desc: 'Precision targeting' },
    { id: 'rapid', name: 'Rapid Fire', emoji: '🏹', desc: 'Multiple arrows' },
    { id: 'curved', name: 'Curved Shot', emoji: '↪️', desc: 'Trajectory control' },
    { id: 'power', name: 'Power Shot', emoji: '💥', desc: 'Maximum force' }
  ]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const handleShootArrow = () => {
    const newAccuracy = Math.min(100, accuracy + Math.random() * 20);
    setArrowsShot(a => a + 1);
    setAccuracy(newAccuracy);
    askDrona(`I fired a ${selectedTechnique} shot. Accuracy: ${newAccuracy.toFixed(0)}%. Provide feedback.`);
  };

  const handleTechniqueChange = (technique) => {
    setSelectedTechnique(technique);
    askDrona(`I am switching to ${techniques.find(t => t.id === technique).name}. Guide my aim.`);
  };

  return (
    <div className="dhanur-container">
      {/* Header */}
      <div className="dhanur-header">
        <h1 className="dhanur-title">🏹 Dhanur Vidya - Archery Mastery</h1>
        <p className="dhanur-subtitle">Perfect your aim and command the bow</p>
      </div>

      <div className="dhanur-content">
        {/* Left: Technique Selector */}
        <div className="technique-panel">
          <h2 className="panel-title">Techniques</h2>
          <div className="technique-grid">
            {techniques.map((t) => (
              <div
                key={t.id}
                className={`technique-card ${selectedTechnique === t.id ? 'active' : ''}`}
                onClick={() => handleTechniqueChange(t.id)}
              >
                <div className="technique-emoji">{t.emoji}</div>
                <div className="technique-name">{t.name}</div>
                <div className="technique-desc">{t.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Middle: Archery Visualization */}
        <div className="range-center">
          <div className={`archer-avatar ${isLoading ? 'aiming' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="aim-aura"></div>}
          </div>
          <p className="archer-name">Āchārya Droṇāchārya</p>

          {/* Target Visualization */}
          <div className="target-zone">
            <div className="target-circle outer"></div>
            <div className="target-circle middle"></div>
            <div className="target-circle center"></div>
            <div className="target-bullseye">🎯</div>
          </div>

          {/* Guidance Feed */}
          <div className="guidance-feed" ref={scrollContainerRef}>
            {chatHistory.slice(-5).map((msg, idx) => (
              <div key={idx} className={`guidance-msg ${msg.type}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="loading-archery">
                <div className="arrow-flight">→</div>
                <p>Analyzing trajectory...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Range Controls */}
        <div className="range-controls">
          <div className="current-technique-box">
            <h3>Current Technique</h3>
            <div className="current-tech-display">
              {techniques.find(t => t.id === selectedTechnique)?.emoji}
            </div>
            <p className="current-tech-name">{techniques.find(t => t.id === selectedTechnique)?.name}</p>
          </div>

          <div className="shoot-box">
            <h3>Fire Arrow</h3>
            <button 
              className="shoot-btn"
              onClick={handleShootArrow}
              disabled={isLoading}
            >
              🏹 Release Arrow
            </button>
            <p className="shoot-hint">Draw and release your bow</p>
          </div>

          <div className="stance-box">
            <h3>Stances</h3>
            <div className="stances-list">
              <div className="stance-item">Standing</div>
              <div className="stance-item">Kneeling</div>
              <div className="stance-item">Mounted</div>
            </div>
          </div>

          <div className="accuracy-box">
            <h3>Range Performance</h3>
            <div className="accuracy-bar">
              <div 
                className="accuracy-fill" 
                style={{ width: `${accuracy}%` }}
              ></div>
            </div>
            <p className="accuracy-percent">{accuracy.toFixed(1)}% Accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DhanurMode;
