import React, { useRef, useEffect, useState } from 'react';
import './DhyanaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const DhyanaMode = ({ studentName, studentLevel, respectMeter, askDrona, chatHistory = [], isLoading = false, cameraActive = false, videoRef = null }) => {
  const scrollContainerRef = useRef(null);
  const localVideoRef = useRef(null);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [chatHistory]);

  // Session timer
  useEffect(() => {
    let interval;
    if (sessionActive) {
      interval = setInterval(() => {
        setSessionTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSession = () => {
    setSessionActive(true);
    setSessionTime(0);
    setBreathCount(0);
    askDrona('Guide me through a meditation session');
  };

  const handleEndSession = () => {
    setSessionActive(false);
    askDrona(`I completed a ${formatTime(sessionTime)} meditation session. Provide feedback on my practice.`);
  };

  return (
    <div className="dhyana-container">
      {/* Header */}
      <div className="dhyana-header">
        <h1 className="dhyana-title">🧘 Dhyana Vidya - Meditation</h1>
        <p className="dhyana-subtitle">Master the art of inner stillness and consciousness</p>
      </div>

      <div className="dhyana-content">
        {/* Left: Camera & Posture */}
        <div className="camera-section">
          {videoRef ? (
            <div className="camera-frame">
              <video ref={videoRef} autoPlay playsInline muted className="meditation-video" />
              <div className="posture-indicator">🧘 Posture Tracking Active</div>
            </div>
          ) : (
            <div className="camera-placeholder">
              <div className="placeholder-icon">📹</div>
              <p>Camera Feed</p>
            </div>
          )}
        </div>

        {/* Middle: Guru & Guidance */}
        <div className="guru-meditation-section">
          <div className={`meditation-avatar ${isLoading ? 'speaking' : ''}`}>
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="avatar-image" />
            {isLoading && <div className="meditation-aura"></div>}
          </div>
          <p className="guru-name">Āchārya Droṇāchārya</p>
          
          <div className="guidance-scroll" ref={scrollContainerRef}>
            {chatHistory.slice(-5).map((msg, idx) => (
              <div key={idx} className={`guidance-bubble ${msg.type}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isLoading && (
              <div className="loading-meditation">
                <div className="om-pulse">ॐ</div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Session Controls */}
        <div className="session-controls">
          {/* Session Timer */}
          <div className="control-box timer-box">
            <h3>⏱️ Session Time</h3>
            <div className="timer-display">{formatTime(sessionTime)}</div>
            <div className="timer-buttons">
              <button 
                className="control-btn start-btn" 
                onClick={handleStartSession}
                disabled={sessionActive || isLoading}
              >
                ▶️ Start
              </button>
              <button 
                className="control-btn end-btn" 
                onClick={handleEndSession}
                disabled={!sessionActive || isLoading}
              >
                ⏹️ End
              </button>
            </div>
          </div>

          {/* Breath Focus */}
          <div className="control-box breath-box">
            <h3>🫁 Breath Focus</h3>
            <div className="breath-guide">
              <p>4 Count Cycle:</p>
              <ul>
                <li>Inhale: 4 counts</li>
                <li>Hold: 4 counts</li>
                <li>Exhale: 4 counts</li>
              </ul>
            </div>
            <div className="breath-count-display">Cycles: {breathCount}</div>
            <button 
              className="control-btn increment-btn"
              onClick={() => setBreathCount(b => b + 1)}
              disabled={!sessionActive}
            >
              + Count Breath
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DhyanaMode;
