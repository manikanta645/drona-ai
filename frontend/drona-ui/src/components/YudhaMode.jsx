import React, { useRef, useEffect, useState } from 'react';
import './YudhaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const YudhaMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);
  const [selectedStrategy, setSelectedStrategy] = useState('defense');
  const [battleCount, setBattleCount] = useState(0);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const strategies = [
    { id: 'defense', name: 'Defense', emoji: '🛡️', desc: 'Protect your position' },
    { id: 'offense', name: 'Offense', emoji: '⚔️', desc: 'Attack strategy' },
    { id: 'deception', name: 'Deception', emoji: '🎭', desc: 'Cunning tactics' },
    { id: 'retreat', name: 'Retreat', emoji: '🏃', desc: 'Strategic withdrawal' }
  ];

  const handleExecuteStrategy = () => {
    setBattleCount(b => b + 1);
    askDrona(`I am executing ${strategies.find(s => s.id === selectedStrategy).name} strategy. Analyze the battle outcome.`);
  };

  return (
    <div className="yudha-container">
      <div className="yudha-header">
        <h1 className="yudha-title">⚔️ Yudha Vidya - War Strategy & Tactics</h1>
        <p className="yudha-subtitle">Master the art of battle and command</p>
      </div>

      <div className="yudha-content">
        {/* Left: Strategy Selection */}
        <div className="strategy-panel">
          <h2 className="panel-title">Battle Strategies</h2>
          <div className="strategy-grid">
            {strategies.map((s) => (
              <div
                key={s.id}
                className={`strategy-card ${selectedStrategy === s.id ? 'active' : ''}`}
                onClick={() => setSelectedStrategy(s.id)}
              >
                <div className="strategy-emoji">{s.emoji}</div>
                <div className="strategy-name">{s.name}</div>
                <div className="strategy-desc">{s.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Middle: Guru & Battle Field */}
        <div className="battlefield-center">
          <div className={`commander-avatar ${isLoading ? 'strategizing' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="strategy-aura"></div>}
          </div>
          <p className="commander-name">Āchārya Droṇāchārya</p>

          {/* Battlefield Visualization */}
          <div className="battle-map">
            <div className={`army-formation ${selectedStrategy}`}>
              <div className="troop">🗡️</div>
              <div className="troop">🛡️</div>
              <div className="troop">🏹</div>
            </div>
          </div>

          {/* Strategy Feedback */}
          <div className="feedback-area" ref={scrollContainerRef}>
            {chatHistory.slice(-5).map((msg, idx) => (
              <div key={idx} className={`feedback-msg ${msg.type}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="loading-battle">
                <div className="battle-loader">⚔️</div>
                <p>Analyzing battle strategy...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Battle Controls */}
        <div className="battle-controls">
          <div className="current-strategy">
            <h3>Current Strategy</h3>
            <div className="strategy-display">
              {strategies.find(s => s.id === selectedStrategy)?.emoji}
            </div>
            <p className="strategy-name-display">{strategies.find(s => s.id === selectedStrategy)?.name}</p>
          </div>

          <div className="execute-box">
            <h3>Execute Strategy</h3>
            <button 
              className="execute-btn"
              onClick={handleExecuteStrategy}
              disabled={isLoading}
            >
              ⚔️ Deploy Forces
            </button>
            <p className="execute-hint">Execute your chosen strategy</p>
          </div>

          <div className="formations-box">
            <h3>Army Formations</h3>
            <div className="formations-list">
              <div className="formation">Phalanx</div>
              <div className="formation">Wedge</div>
              <div className="formation">Circle</div>
            </div>
          </div>

          <div className="victory-box">
            <h3>Victory Progress</h3>
            <div className="victory-bar">
              <div 
                className="victory-fill" 
                style={{ width: `${Math.min(100, battleCount * 25)}%` }}
              ></div>
            </div>
            <p className="victory-text">{Math.min(100, battleCount * 25)}% Victory</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YudhaMode;
