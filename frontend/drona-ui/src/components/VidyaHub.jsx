import React, { useState } from 'react';
import './VidyaHub.css';
import dronaImage from '../assets/dronacharya.jpg';
import VidyaLearnMode from './VidyaLearnMode';
import VidyaTestMode from './VidyaTestMode';
import VidyaPracticeMode from './VidyaPracticeMode';

const VidyaHub = ({ studentName, askDrona, isLoading, vidyaMode, speak, detectLanguage }) => {
  const [selectedVidya, setSelectedVidya] = useState(null);
  const [selectedMode, setSelectedMode] = useState(vidyaMode || null);
  const [vidyaList] = useState([
    {
      id: 'dhanur',
      name: '🏹 Dhanur Vidya',
      subtitle: 'Archery Mastery - Aim, Focus, Precision',
      description: 'Master the art of the bow. Learn stance, aim, release, and the philosophy of precision.',
      levels: 5,
      hasCamera: true,
      icon: '🏹'
    },
    {
      id: 'khadga',
      name: '⚔️ Khadga Vidya',
      subtitle: 'Sword Mastery - Combat, Courage, Truth',
      description: 'Wield the blade with skill and honor. Learn technique, strategy, and the warrior\'s code.',
      levels: 5,
      hasCamera: true,
      icon: '⚔️'
    },
    {
      id: 'gada',
      name: '🔨 Gada Vidya',
      subtitle: 'Mace Mastery - Power, Discipline, Strength',
      description: 'Command the mace with strength and control. Learn power techniques and warrior discipline.',
      levels: 5,
      hasCamera: true,
      icon: '🔨'
    },
    {
      id: 'dhyana',
      name: '🧘 Dhyana Vidya',
      subtitle: 'Meditation - Inner Peace, Mindfulness',
      description: 'Find stillness within. Learn meditation, breathing, and the art of inner vision.',
      levels: 5,
      hasCamera: true,
      icon: '🧘'
    },
    {
      id: 'yudha',
      name: '♟️ Yudha Vidya',
      subtitle: 'War Strategy - Tactics, Planning, Wisdom',
      description: 'Think like a great strategist. Learn tactics, formations, and the art of war.',
      levels: 5,
      hasCamera: false,
      icon: '♟️'
    },
    {
      id: 'dharma',
      name: '⚖️ Dharma Vidya',
      subtitle: 'Righteousness - Ethics, Duty, Values',
      description: 'Walk the path of dharma. Learn ethics, righteousness, and the meaning of duty.',
      levels: 5,
      hasCamera: false,
      icon: '⚖️'
    },
  ]);

  const modes = [
    { id: 'learn', name: 'Learn', icon: '📖', desc: 'Guru teaches you lesson by lesson' },
    { id: 'test', name: 'Test', icon: '❓', desc: 'Guru tests your understanding' },
    { id: 'practice', name: 'Practice', icon: '🎯', desc: 'Show your form, get feedback' }
  ];

  const selectedVidyaData = vidyaList.find(v => v.id === selectedVidya);

  if (!selectedVidya) {
    // Landing page - Select Vidya
    return (
      <div className="vidya-hub-container">
        <div className="vidya-header">
          <h1 className="vidya-main-title">🎓 The Nine Vidyas</h1>
          <p className="vidya-main-subtitle">Choose your path of learning with Guru Dronacharya</p>
        </div>

        <div className="guru-welcome-card">
          <img src={dronaImage} alt="Dronacharya" className="guru-welcome-image" />
          <div className="guru-welcome-text">
            <h2>Welcome, {studentName}</h2>
            <p>"I am Dronacharya, master of all arts. Each vidya is a path to mastery. Choose wisely."</p>
          </div>
        </div>

        <div className="vidya-grid">
          {vidyaList.map(vidya => (
            <div
              key={vidya.id}
              className="vidya-card"
              onClick={() => setSelectedVidya(vidya.id)}
            >
              <div className="vidya-card-emoji">{vidya.icon}</div>
              <h3 className="vidya-card-name">{vidya.name}</h3>
              <p className="vidya-card-subtitle">{vidya.subtitle}</p>
              <p className="vidya-card-desc">{vidya.description}</p>
              <div className="vidya-card-footer">
                <span className="vidya-levels">📊 {vidya.levels} Levels</span>
                {vidya.hasCamera && <span className="vidya-camera-badge">📹 Camera</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedMode) {
    // Mode selection page - ONLY show modes matching vidyaMode filter, or all if no filter
    const filteredModes = vidyaMode 
      ? modes.filter(mode => mode.id === vidyaMode)
      : modes;

    return (
      <div className="vidya-mode-container">
        <button className="back-button" onClick={() => setSelectedVidya(null)}>← Back to Vidyas</button>
        
        <div className="vidya-mode-header">
          <h1>{selectedVidyaData.name}</h1>
          <p>{selectedVidyaData.description}</p>
        </div>

        <div className="vidya-guru-instruction">
          <img src={dronaImage} alt="Dronacharya" className="guru-instruction-image" />
          <div className="guru-instruction-text">
            <h3>"Choose your path wisely, disciple."</h3>
            <p>{vidyaMode === 'learn' ? `"Let us learn ${selectedVidyaData.name} step by step, from the foundations."` : vidyaMode === 'test' ? `"Now I will test your mastery of ${selectedVidyaData.name}. Are you ready?"` : '"Each mode is a different way to master this vidya."'}</p>
          </div>
        </div>

        <div className="mode-cards">
          {filteredModes.map(mode => (
            <div
              key={mode.id}
              className="mode-card"
              onClick={() => setSelectedMode(mode.id)}
            >
              <div className="mode-icon">{mode.icon}</div>
              <h3 className="mode-name">{mode.name}</h3>
              <p className="mode-desc">{mode.desc}</p>
              <button className="mode-select-btn">Start {mode.name}</button>
            </div>
          ))}
        </div>

        {!vidyaMode && (
          <div className="mode-info-box">
            <h4>ℹ️ What Each Mode Offers:</h4>
            <ul>
              <li><strong>Learn:</strong> Guru teaches you progressively from basics to mastery (5 levels)</li>
              <li><strong>Test:</strong> Guru assesses your knowledge with challenging questions</li>
              <li><strong>Practice:</strong> You show your form, and Guru analyzes and corrects you (with camera)</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Active learning mode
  return (
    <div className="vidya-learning-container">
      <div className="learning-header">
        <button className="back-button" onClick={() => setSelectedMode(null)}>← Back to Modes</button>
        <h1>{selectedVidyaData.icon} {selectedVidyaData.name} - {selectedMode.toUpperCase()}</h1>
      </div>

      <div className="learning-layout">
        {/* Render mode-specific components */}
        {selectedMode === 'learn' && (
          <VidyaLearnMode 
            vidyaId={selectedVidya}
            vidyaName={selectedVidyaData.name}
            studentName={studentName}
            askDrona={askDrona}
            speak={speak}
            detectLanguage={detectLanguage}
          />
        )}
        {selectedMode === 'test' && (
          <VidyaTestMode 
            vidyaId={selectedVidya}
            vidyaName={selectedVidyaData.name}
            studentName={studentName}
            askDrona={askDrona}
            speak={speak}
            detectLanguage={detectLanguage}
          />
        )}
        {selectedMode === 'practice' && (
          <VidyaPracticeMode 
            vidyaId={selectedVidya}
            vidyaName={selectedVidyaData.name}
            studentName={studentName}
            askDrona={askDrona}
            speak={speak}
            detectLanguage={detectLanguage}
          />
        )}
      </div>
    </div>
  );
};

export default VidyaHub;
