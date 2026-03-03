import React, { useRef, useEffect } from 'react';
import './IthihasaMode.css';

const IthihasaMode = ({ studentName, studentLevel, respectMeter, language, speak, askDrona, storyHistory = [], resetStoryHistory, isLoading = false }) => {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom when new story content arrives
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [storyHistory]);

  // Handle sending message to guru - uses parent's askDrona function
  const handleContinueStory = () => {
    askDrona('Continue');
  };

  // Handle Restart Story button
  const handleRestartStory = () => {
    if (resetStoryHistory) {
      resetStoryHistory();
    }
  };

  return (
    <div className="ithihasa-container">
      {/* Header with Mode Lock */}
      <div className="ithihasa-header">
        <h1 className="ithihasa-title">📖 Ithihāsa Mode: Stories of the Ancients</h1>
        <p className="ithihasa-subtitle">Ask only about stories in this mode, Shishya.</p>
      </div>

      <div className="ithihasa-content">
        {/* Guru Avatar Section */}
        <div className="guru-section">
          <div className={`guru-avatar ${isLoading ? 'speaking' : ''}`}>
            <div className="guru-placeholder">
              🧔‍♂️
            </div>
            {isLoading && <div className="guru-aura"></div>}
          </div>
          <div className="guru-subtitle">
            Āchārya Droṇāchārya
          </div>
        </div>

        {/* Story Scroll Area */}
        <div className="story-scroll-container" ref={scrollContainerRef}>
          <div className="story-content">
            {storyHistory.map((entry, index) => (
              <div
                key={index}
                className={`story-paragraph ${entry.role}`}
                style={{
                  animation: `fadeIn 0.6s ease-in-out ${index * 0.1}s forwards`,
                  opacity: 0,
                }}
              >
                {entry.role === 'guru' ? (
                  <div className="guru-speech">
                    <span className="guru-label">Guru speaks:</span>
                    <p>{entry.text}</p>
                  </div>
                ) : (
                  <div className="shishya-speech">
                    <span className="shishya-label">Shishya asks:</span>
                    <p>{entry.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Loading Animation */}
          {isLoading && (
            <div className="loading-animation">
              <div className="om-symbol">ॐ</div>
              <p>The guru is speaking...</p>
            </div>
          )}
        </div>

        {/* Story Controls */}
        <div className="story-controls">
          <button
            className="story-button continue-btn"
            onClick={handleContinueStory}
            disabled={isLoading}
            title="Ask the guru to continue the current story"
          >
            Continue Story →
          </button>
          <button
            className="story-button restart-btn"
            onClick={handleRestartStory}
            disabled={isLoading}
            title="Restart the story from the beginning"
          >
            Restart Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default IthihasaMode;
