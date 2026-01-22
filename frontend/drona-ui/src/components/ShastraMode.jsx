import React, { useRef, useEffect, useState } from 'react';
import './ShastraMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const ShastraMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false }) => {
  const scrollContainerRef = useRef(null);
  const [selectedText, setSelectedText] = useState('rigveda');
  const [versesStudied, setVersesStudied] = useState(0);

  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  const texts = [
    { id: 'rigveda', name: 'Rigveda', emoji: '📖', desc: 'Hymns & Mantras' },
    { id: 'yajurveda', name: 'Yajurveda', emoji: '📜', desc: 'Ritual Knowledge' },
    { id: 'samaveda', name: 'Samaveda', emoji: '🎵', desc: 'Chants & Melodies' },
    { id: 'atharvaveda', name: 'Atharvaveda', emoji: '✨', desc: 'Mystical Knowledge' }
  ];

  const handleStudyVerse = () => {
    setVersesStudied(v => v + 1);
    const selectedVeda = texts.find(t => t.id === selectedText);
    askDrona(`Teach me a verse from ${selectedVeda.name}. Explain its deeper meaning.`);
  };

  return (
    <div className="shastra-container">
      <div className="shastra-header">
        <h1 className="shastra-title">📚 Shastra Vidya - Ancient Texts & Wisdom</h1>
        <p className="shastra-subtitle">Unlock the knowledge of the sacred scriptures</p>
      </div>

      <div className="shastra-content">
        {/* Left: Text Selection */}
        <div className="texts-panel">
          <h2 className="panel-title">Sacred Texts</h2>
          <div className="text-grid">
            {texts.map((t) => (
              <div
                key={t.id}
                className={`text-card ${selectedText === t.id ? 'active' : ''}`}
                onClick={() => setSelectedText(t.id)}
              >
                <div className="text-emoji">{t.emoji}</div>
                <div className="text-name">{t.name}</div>
                <div className="text-desc">{t.desc}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Middle: Guru & Texts Display */}
        <div className="library-center">
          <div className={`scholar-avatar ${isLoading ? 'teaching' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="wisdom-aura"></div>}
          </div>
          <p className="scholar-name">Vedic Scholar</p>

          {/* Sacred Text Scroll */}
          <div className="scroll-container">
            <div className="scroll-header">
              {texts.find(t => t.id === selectedText)?.emoji} {texts.find(t => t.id === selectedText)?.name}
            </div>
            <div className="verse-display" ref={scrollContainerRef}>
              {chatHistory.slice(-5).map((msg, idx) => (
                <div key={idx} className={`verse-msg ${msg.type}`}>
                  <p>{msg.text}</p>
                </div>
              ))}
              {isLoading && (
                <div className="loading-verse">
                  <div className="verse-loader">ॐ</div>
                  <p>Reflecting on sacred knowledge...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Study Controls */}
        <div className="study-controls">
          <div className="current-text">
            <h3>Current Text</h3>
            <div className="text-display">
              {texts.find(t => t.id === selectedText)?.emoji}
            </div>
            <p className="text-name-display">{texts.find(t => t.id === selectedText)?.name}</p>
          </div>

          <div className="study-box">
            <h3>Study Verse</h3>
            <button 
              className="study-btn"
              onClick={handleStudyVerse}
              disabled={isLoading}
            >
              📚 Study Now
            </button>
            <p className="study-hint">Engage with sacred wisdom</p>
          </div>

          <div className="knowledge-paths">
            <h3>Knowledge Paths</h3>
            <div className="paths-list">
              <div className="path">Reading</div>
              <div className="path">Reflection</div>
              <div className="path">Mastery</div>
            </div>
          </div>

          <div className="progress-box">
            <h3>Study Progress</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, versesStudied * 20)}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.min(100, versesStudied * 20)}% Complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShastraMode;
