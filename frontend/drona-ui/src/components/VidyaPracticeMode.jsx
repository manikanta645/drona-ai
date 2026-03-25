import React, { useState, useEffect, useRef } from 'react';
import './VidyaPracticeMode.css';

const VidyaPracticeMode = ({ 
  studentName, 
  vidyaId, 
  vidyaName, 
  vidyaIcon,
  askDrona, 
  speak,
  detectLanguage,
  isLoading,
  chatHistory = []
}) => {
  const [cameraAllowed, setCameraAllowed] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [cameraActive, setCameraActive] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [metrics, setMetrics] = useState({
    readiness: 0,
    posture: 0,
    focus: 0,
    breathing: 0
  });
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionScore, setSessionScore] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // Practice prompts for each vidya
  const practiceGuides = {
    dhanur: {
      setup: 'Find a space where you can safely practice your archery stance. You will stand and hold your position.',
      focus: 'Focus on your stance, balance, and breathing. I will analyze your form.',
      cue: 'Take your stance now. Remember: feet shoulder-width apart, knees slightly bent, back straight.'
    },
    khadga: {
      setup: 'Clear some space for sword practice. Ensure nothing is in your way.',
      focus: 'Show me your sword work. Perform strikes, defenses, and transitions.',
      cue: 'Begin your practice. Show me fluid, controlled movements. Let the sword be an extension of your will.'
    },
    gada: {
      setup: 'Get ready for mace practice. You can use an imaginary mace or light object.',
      focus: 'Show me controlled power. Your movements should be strong yet precise.',
      cue: 'Begin your mace practice. Powerful, controlled, purposeful. Each strike has intention.'
    },
    dhyana: {
      setup: 'Find a quiet, comfortable place to sit. Your meditation space should be peaceful.',
      focus: 'I will guide you through meditation. Show me your daily practice.',
      cue: 'Sit in your meditation posture. Close your eyes when ready. Focus on your breath.'
    },
    yudha: {
      setup: 'This is strategy practice. No physical movement needed. Be prepared to discuss.',
      focus: 'We will analyze strategic scenarios together. Show your thinking.',
      cue: 'Walk me through a strategy. Consider terrain, timing, and your advantages.'
    },
    dharma: {
      setup: 'Prepare for a dharma reflection session. You need only silence and honesty.',
      focus: 'We will explore your understanding of duty and righteousness.',
      cue: 'Close your eyes and center yourself. We will begin our dharma dialogue.'
    }
  };

  const currentGuide = practiceGuides[vidyaId] || practiceGuides.dhanur;

  const speakText = (text) => {
    if (!speak || !text) return;
    const lang = typeof detectLanguage === 'function' ? detectLanguage(text) : 'en';
    speak(text, lang);
  };

  // Request camera access
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraAllowed(true);
      
      const welcomeMessage = `Great! Your camera is ready. ${currentGuide.setup} 
      
${currentGuide.cue}

When you're ready, click "Start Practice Session" to begin.`;
      askDrona(welcomeMessage);
      speakText(welcomeMessage);
    } catch (err) {
      alert('Camera access denied. Please allow camera access to continue.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  // Simulate form analysis  
  const analyzeForm = () => {
    const readiness = Math.floor(Math.random() * 25) + 75; // 75-100
    const posture = Math.floor(Math.random() * 30) + 70; // 70-100
    const focus = Math.floor(Math.random() * 30) + 70; // 70-100
    const breathing = Math.floor(Math.random() * 20) + 80; // 80-100

    setMetrics({
      readiness,
      posture,
      focus,
      breathing
    });

    return { readiness, posture, focus, breathing };
  };

  // Start session
  const startSession = () => {
    setCameraActive(true);
    setSessionActive(true);
    setSessionTime(0);
    setSessionEnded(false);

    const startPrompt = `${studentName} has begun a practice session for ${vidyaName}.

${currentGuide.focus}

I will provide real-time feedback as they practice. They will see their metrics: readiness (0-100), posture quality (0-100), focus level (0-100), and breathing quality (0-100).

Guide them to improve their practice. Make specific observations about what you see. Encourage and correct as needed.

Practice session duration: 5-10 minutes`;
    
    askDrona(startPrompt);
    speakText(currentGuide.cue);

    // Analyze form every 3 seconds
    const analysisInterval = setInterval(() => {
      analyzeForm();
    }, 3000);

    // Auto-end session after 10 minutes
    const autoEnd = setTimeout(() => {
      endSession();
      clearInterval(analysisInterval);
    }, 10 * 60 * 1000);

    timerRef.current = { analysisInterval, autoEnd };
  };

  // End session
  const endSession = () => {
    setSessionActive(false);
    stopCamera();
    
    const avgScore = Math.round(
      (metrics.readiness + metrics.posture + metrics.focus + metrics.breathing) / 4
    );
    setSessionScore(avgScore);
    setSessionEnded(true);

    const endPrompt = `${studentName}'s practice session has ended.

Session Statistics:
- Readiness: ${metrics.readiness}/100
- Posture Quality: ${metrics.posture}/100
- Focus Level: ${metrics.focus}/100
- Breathing Quality: ${metrics.breathing}/100
- Overall Score: ${avgScore}/100

Please provide comprehensive feedback on their practice session:
1. What they did well
2. Specific areas for improvement
3. Guidance for their next practice
4. Encouragement and recognition of their effort

Be a supportive guru who sees their growth.`;

    askDrona(endPrompt);
    speakText(`Practice complete. Your overall score is ${avgScore} out of 100.`);
  };

  // Timer effect
  useEffect(() => {
    if (sessionActive) {
      const timer = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMetricColor = (value) => {
    if (value >= 85) return '#4caf50'; // Green
    if (value >= 70) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div className="vidya-practice-mode-container">
      <div className="practice-mode-header">
        <h1>{vidyaIcon} {vidyaName} - Practice Mode</h1>
        <p className="student-info">Shishya: {studentName}</p>
      </div>

      <div className="practice-mode-layout">
        {/* Camera/Practice Area */}
        <div className="practice-main">
          {!cameraAllowed ? (
            // Camera Request
            <div className="camera-request">
              <div className="camera-icon">📹</div>
              <h2>Camera Access Required</h2>
              <p>To practice with Guru Dronacharya, we need access to your camera.</p>
              <p>The camera will only be used to analyze your form and provide feedback during your practice session.</p>
              
              <div className="camera-info">
                <h3>✓ What we analyze:</h3>
                <ul>
                  <li>Your stance and posture alignment</li>
                  <li>Your focus and concentration level</li>
                  <li>Your breathing patterns</li>
                  <li>Your form quality and execution</li>
                </ul>
              </div>

              <button className="btn-allow-camera" onClick={requestCameraAccess}>
                Allow Camera Access
              </button>
            </div>
          ) : !sessionActive ? (
            // Pre-session
            <div className="practice-pre-session">
              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video-preview"
                />
              </div>

              <div className="session-setup">
                <h2>Prepare for Practice</h2>
                <p className="setup-text">{currentGuide.setup}</p>
                
                <div className="focus-area">
                  <h3>🎯 What to Focus On:</h3>
                  <p>{currentGuide.focus}</p>
                </div>

                <div className="tips">
                  <h3>💡 Tips:</h3>
                  <ul>
                    <li>Find good lighting so the camera can see you clearly</li>
                    <li>Position yourself so your full body is visible</li>
                    <li>Make sure there's space around you for movement</li>
                    <li>Wear comfortable clothing you can move in</li>
                  </ul>
                </div>

                <button className="btn-start-session" onClick={startSession}>
                  Start Practice Session
                </button>
              </div>
            </div>
          ) : sessionActive && !sessionEnded ? (
            // Active Session
            <div className="practice-session-active">
              <div className="session-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="video-active"
                />
                <div className="session-timer">
                  <span className="timer-icon">⏱️</span>
                  <span className="timer-value">{formatTime(sessionTime)}</span>
                </div>
              </div>

              <div className="real-time-analysis">
                <h3>📊 Real-Time Analysis</h3>
                
                <div className="metric-display">
                  <div className="metric">
                    <label>Readiness</label>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${metrics.readiness}%`,
                          backgroundColor: getMetricColor(metrics.readiness)
                        }}
                      />
                    </div>
                    <span className="metric-value">{metrics.readiness}%</span>
                  </div>

                  <div className="metric">
                    <label>Posture</label>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${metrics.posture}%`,
                          backgroundColor: getMetricColor(metrics.posture)
                        }}
                      />
                    </div>
                    <span className="metric-value">{metrics.posture}%</span>
                  </div>

                  <div className="metric">
                    <label>Focus</label>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${metrics.focus}%`,
                          backgroundColor: getMetricColor(metrics.focus)
                        }}
                      />
                    </div>
                    <span className="metric-value">{metrics.focus}%</span>
                  </div>

                  <div className="metric">
                    <label>Breathing</label>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${metrics.breathing}%`,
                          backgroundColor: getMetricColor(metrics.breathing)
                        }}
                      />
                    </div>
                    <span className="metric-value">{metrics.breathing}%</span>
                  </div>
                </div>
              </div>

              <button className="btn-end-session" onClick={endSession}>
                End Session
              </button>
            </div>
          ) : (
            // Session Ended - Results
            <div className="practice-session-results">
              <div className="results-banner">
                <div className="results-icon">✓</div>
                <div className="results-text">Practice Session Complete!</div>
              </div>

              <div className="final-metrics">
                <h3>Your Performance:</h3>
                <div className="metric-results-grid">
                  <div className="metric-result">
                    <span className="metric-label">Readiness</span>
                    <span className="metric-val">{metrics.readiness}%</span>
                  </div>
                  <div className="metric-result">
                    <span className="metric-label">Posture</span>
                    <span className="metric-val">{metrics.posture}%</span>
                  </div>
                  <div className="metric-result">
                    <span className="metric-label">Focus</span>
                    <span className="metric-val">{metrics.focus}%</span>
                  </div>
                  <div className="metric-result">
                    <span className="metric-label">Breathing</span>
                    <span className="metric-val">{metrics.breathing}%</span>
                  </div>
                </div>

                <div className="overall-score">
                  <span className="score-label">Overall Score</span>
                  <span className="score-value">{sessionScore}/100</span>
                </div>
              </div>

              <button 
                className="btn-practice-again"
                onClick={() => {
                  setCameraActive(false);
                  setSessionEnded(false);
                  setSessionTime(0);
                  setMetrics({ readiness: 0, posture: 0, focus: 0, breathing: 0 });
                  setCameraAllowed(false);
                }}
              >
                Practice Again
              </button>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="practice-chat">
          <h3>💬 Guru's Guidance</h3>
          <div className="practice-chat-history">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-item ${msg.type}`}>
                <span className="chat-emoji">{msg.type === 'guru' ? '🧙' : '👤'}</span>
                <div className="chat-msg">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-item guru loading">
                <span className="chat-emoji">🧙</span>
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VidyaPracticeMode;
