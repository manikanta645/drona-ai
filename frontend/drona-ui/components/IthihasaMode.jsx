import React, { useState, useRef, useEffect } from 'react';
import './IthihasaMode.css';
import dronaImage from '../src/assets/dronacharya.jpg';

const IthihasaMode = ({ studentName, studentLevel, respectMeter, language }) => {
  const [storyText, setStoryText] = useState(
    "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?"
  );
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [storyHistory, setStoryHistory] = useState([
    {
      role: 'guru',
      text: "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?",
    },
  ]);
  const [currentStoryContext, setCurrentStoryContext] = useState('');
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new story content arrives
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [storyHistory]);

  // Handle sending message to guru
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to history
    const userMessage = userInput.trim();
    setStoryHistory((prev) => [
      ...prev,
      { role: 'shishya', text: userMessage },
    ]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          lang: language || 'en',
          student_name: studentName || 'Shishya',
          student_level: studentLevel || 'Novice',
          respect_meter: respectMeter || 50,
          mode: 'story',
          story_context: currentStoryContext,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch story');

      const data = await response.json();
      const guruResponse = data.answer || 'The guru falls silent, lost in thought...';

      // Add guru response to history
      setStoryHistory((prev) => [
        ...prev,
        { role: 'guru', text: guruResponse },
      ]);

      // Update story context for continuation
      setCurrentStoryContext(guruResponse);
      setStoryText(guruResponse);
    } catch (error) {
      console.error('Error fetching story:', error);
      const errorMessage =
        'Shishya, forgive me. The connection to the ancient library is broken. Please try again.';
      setStoryHistory((prev) => [
        ...prev,
        { role: 'guru', text: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Continue Story button
  const handleContinueStory = () => {
    setUserInput('Continue');
    const formEvent = {
      preventDefault: () => {},
    };
    setTimeout(() => handleSendMessage(formEvent), 0);
  };

  // Handle Restart Story button
  const handleRestartStory = () => {
    setStoryText(
      "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?"
    );
    setStoryHistory([
      {
        role: 'guru',
        text: "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?",
      },
    ]);
    setCurrentStoryContext('');
    setUserInput('');
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
              <img src={dronaImage} alt="Āchārya Droṇāchārya" className="guru-image" />
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

        {/* Shishya Input Area */}
        <form className="shishya-input-area" onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask the Guru…"
              className="stone-tablet-input"
              disabled={isLoading}
              maxLength={200}
            />
            <button
              type="submit"
              className="send-button"
              disabled={isLoading || !userInput.trim()}
              title="Send your question to the guru"
            >
              🕉️
            </button>
          </div>
          <div className="character-count">
            {userInput.length}/200
          </div>
        </form>
      </div>
    </div>
  );
};

export default IthihasaMode;
