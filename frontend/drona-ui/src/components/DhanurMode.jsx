import React, { useRef, useEffect, useState } from 'react';
import './DhanurMode.css';
import dronacharya from '../assets/dronacharya.jpg';
import voiceManager from '../voiceManager';

/**
 * DhanurMode - FULLY INTEGRATED WITH BACKEND VIDYA ENGINE
 * 
 * Features:
 * - Loads lessons from backend
 * - Tracks completed lessons in student profile
 * - Prevents lesson repetition
 * - Gets real feedback from guru engine
 * - Updates respect meter based on performance
 * - Implements 5-phase teaching loop
 * - TEXT-TO-SPEECH: Guru speaks in student's language
 */
const DhanurMode = ({ 
  studentName, 
  studentLevel, 
  respectMeter = 50,
  studentProfile = null,
  onRespectMeterChange = () => {},
  onLessonComplete = () => {}
}) => {
  const scrollContainerRef = useRef(null);
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [phase, setPhase] = useState('select'); // select, explain, demonstrate, practice, feedback
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(studentProfile?.lessons_completed || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Session state
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  
  // Performance tracking
  const [selectedTechnique, setSelectedTechnique] = useState('aimed');
  const [accuracy, setAccuracy] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('encouraging');
  const [lessonPassed, setLessonPassed] = useState(false);
  
  // Camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  
  const techniques = [
    { id: 'aimed', name: 'Aimed Shot', emoji: '🎯', desc: 'Precision targeting' },
    { id: 'rapid', name: 'Rapid Fire', emoji: '🏹', desc: 'Multiple arrows' },
    { id: 'curved', name: 'Curved Shot', emoji: '↪️', desc: 'Trajectory control' },
    { id: 'power', name: 'Power Shot', emoji: '💥', desc: 'Maximum force' }
  ];

  // ============================================================================
  // INITIALIZATION - LOAD LESSONS
  // ============================================================================

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/dhanur');
      const data = await response.json();
      
      if (data.lessons) {
        setAllLessons(data.lessons);
        console.log(`📚 Loaded ${data.lessons.length} Dhanur lessons`);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      setError('Could not load lessons. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // GET NEXT AVAILABLE LESSON
  // ============================================================================

  const getAvailableLessons = () => {
    return allLessons.filter(lesson => !completedLessons.includes(lesson.lesson_id));
  };

  // ============================================================================
  // PHASE 1: SELECT LESSON
  // ============================================================================

  const handleSelectLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setError('');
    setPhase('explain');
    await startSession(lesson.lesson_id);
  };

  // ============================================================================
  // START SESSION WITH BACKEND
  // ============================================================================

  const startSession = async (lessonId) => {
    try {
      setLoading(true);
      
      // Get or create student ID from localStorage
      let studentId = localStorage.getItem('studentId');
      if (!studentId) {
        studentId = studentName.replace(/\s+/g, '_').toLowerCase();
        localStorage.setItem('studentId', studentId);
      }
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/dhanur/${lessonId}`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      
      if (data.session_id) {
        setSessionId(data.session_id);
        setSessionStartTime(new Date());
        setAttemptNumber(1);
        setPerformanceScore(null);
        setGuruFeedback('');
        setLessonPassed(false);
        
        console.log(`✅ Session started: ${data.session_id}`);
        console.log('📖 Explanation:', data.explanation);
        
        // Get student's language preference or default to English
        const studentLanguage = localStorage.getItem('studentLanguage') || 'en';
        
        // Use browser TTS to speak lesson introduction and explanation
        if (voiceManager.supported) {
          console.log('🔊 Starting voice narration in', studentLanguage);
          
          // Create intro text
          const introText = `Welcome to ${data.lesson_name}. Let us begin our practice today.`;
          
          // Speak intro
          voiceManager.speak(introText, studentLanguage, 0.7);
          
          // After intro finishes, speak the explanation
          setTimeout(() => {
            if (data.explanation) {
              voiceManager.speak(data.explanation, studentLanguage, 0.75);
            }
          }, 3000); // Wait 3 seconds for intro to finish
        } else {
          console.warn('⚠️ Voice/TTS not supported in this browser');
        }
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Could not start session');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PHASE 2: EXPLAIN
  // ============================================================================

  const handleExplanationRead = () => {
    setPhase('demonstrate');
  };

  // ============================================================================
  // PHASE 3: DEMONSTRATE
  // ============================================================================

  const handleDemonstrationComplete = () => {
    setPhase('practice');
  };

  // ============================================================================
  // PHASE 4: PRACTICE
  // ============================================================================

  const handleStartCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setError('Camera access denied');
    }
  };

  const handleStopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleRecordPractice = async () => {
    try {
      setLoading(true);
      
      // Simulate capturing video frame
      let videoData = null;
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        videoData = canvasRef.current.toDataURL('image/jpeg');
      }
      
      // Get time taken
      const timeTaken = (new Date() - sessionStartTime) / 1000;
      
      // Submit practice attempt to backend
      const studentId = localStorage.getItem('studentId') || studentName.replace(/\s+/g, '_').toLowerCase();
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/vidya/submit-practice/${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            vidya_id: 'dhanur',
            lesson_id: selectedLesson.lesson_id,
            text_answer: `Performed ${selectedTechnique} technique with ${accuracy.toFixed(0)}% accuracy`,
            time_taken: timeTaken,
            attempt_number: attemptNumber
          })
        }
      );
      
      const result = await response.json();
      
      if (result.performance_score !== undefined) {
        setPerformanceScore(result.performance_score);
        setGuruFeedback(result.feedback);
        setFeedbackTone(result.tone || 'encouraging');
        setLessonPassed(result.passed);
        
        // Update respect meter based on performance
        if (result.passed && result.performance_score >= 80) {
          const respectIncrease = Math.floor(result.performance_score / 20);
          onRespectMeterChange(respectIncrease);
        }
        
        setPhase('feedback');
        
        console.log(`✅ Performance Score: ${result.performance_score}`);
      }
    } catch (error) {
      console.error('Error submitting practice:', error);
      setError('Could not submit practice attempt');
    } finally {
      setLoading(false);
    }
  };

  const handleShootArrow = () => {
    const newAccuracy = Math.min(100, accuracy + Math.random() * 20);
    setAccuracy(newAccuracy);
  };

  const handleTechniqueChange = (technique) => {
    setSelectedTechnique(technique);
  };

  // ============================================================================
  // PHASE 5: FEEDBACK
  // ============================================================================

  const handleRetry = () => {
    setAttemptNumber(attemptNumber + 1);
    setAccuracy(0);
    setPerformanceScore(null);
    setGuruFeedback('');
    setPhase('practice');
  };

  const handleNextLesson = () => {
    if (lessonPassed) {
      // Mark lesson as completed
      setCompletedLessons([...completedLessons, selectedLesson.lesson_id]);
      onLessonComplete(selectedLesson.lesson_id);
      
      // Reset for next lesson
      setPhase('select');
      setSelectedLesson(null);
      setAttemptNumber(1);
      setAccuracy(0);
    }
  };

  // ============================================================================
  // RENDER - PHASE SELECTION
  // ============================================================================

  if (phase === 'select') {
    const availableLessons = getAvailableLessons();
    
    return (
      <div className="dhanur-container">
        <div className="dhanur-header">
          <h1 className="dhanur-title">🏹 Dhanur Vidya - Archery Mastery</h1>
          <p className="dhanur-subtitle">Perfect your aim and command the bow</p>
          <p className="student-info">
            Level: {studentLevel} | Respect: {respectMeter} | Completed: {completedLessons.length}/{allLessons.length}
          </p>
        </div>

        <div className="lesson-selection">
          <h2>Available Lessons</h2>
          {loading ? (
            <p>Loading lessons...</p>
          ) : availableLessons.length > 0 ? (
            <div className="lessons-grid">
              {availableLessons.map(lesson => (
                <div key={lesson.lesson_id} className="lesson-card" onClick={() => handleSelectLesson(lesson)}>
                  <h3>{lesson.name}</h3>
                  <p>{lesson.description}</p>
                  <p className="difficulty">Level: {lesson.difficulty}</p>
                  <p className="time">~{lesson.estimated_time} min</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="completion-message">🎓 Congratulations! You have completed all Dhanur lessons!</p>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - EXPLANATION PHASE
  // ============================================================================

  if (phase === 'explain') {
    return (
      <div className="dhanur-container">
        <div className="dhanur-header">
          <h1>📖 {selectedLesson?.name}</h1>
        </div>
        
        <div className="phase-container">
          <div className="guru-section">
            <img src={dronacharya} alt="Āchārya Droṇāchārya" className="guru-avatar" />
            <h2>Āchārya Droṇāchārya</h2>
          </div>
          
          <div className="explanation-section">
            <h3>Lesson Instructions</h3>
            <p>{selectedLesson?.instructions}</p>
            
            <h3>Practice Task</h3>
            <p>{selectedLesson?.practice_task}</p>
            
            <h3>Evaluation Criteria</h3>
            <p>{selectedLesson?.evaluation_criteria}</p>
            
            <button 
              className="phase-button next-button"
              onClick={handleExplanationRead}
              disabled={loading}
            >
              I Understand →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - DEMONSTRATION PHASE
  // ============================================================================

  if (phase === 'demonstrate') {
    return (
      <div className="dhanur-container">
        <div className="dhanur-header">
          <h1>🎬 Watch the Master</h1>
        </div>
        
        <div className="phase-container">
          <div className="demonstration-section">
            <img src={dronacharya} alt="Dronacharya demonstrating" className="demo-avatar" />
            <p className="demo-text">
              Watch carefully as I demonstrate the proper form and technique for {selectedLesson?.name}.
              Pay attention to every movement and the principles behind them.
            </p>
            
            <div className="demo-steps">
              <h3>Key Points to Observe:</h3>
              <ul>
                <li>Body Posture - Stand firm and centered</li>
                <li>Grip - Hold steady and controlled</li>
                <li>Aim - Focus on the target</li>
                <li>Release - Smooth and precise</li>
                <li>Follow-through - Complete the motion</li>
              </ul>
            </div>
            
            <button 
              className="phase-button next-button"
              onClick={handleDemonstrationComplete}
              disabled={loading}
            >
              Ready to Practice →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - PRACTICE PHASE
  // ============================================================================

  if (phase === 'practice') {
    return (
      <div className="dhanur-container">
        <div className="dhanur-header">
          <h1>🏹 Practice Time</h1>
          <p>Attempt {attemptNumber}</p>
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

          {/* Middle: Camera/Practice Area */}
          <div className="range-center">
            <div className="camera-section">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="practice-video"
              />
              <canvas 
                ref={canvasRef} 
                className="hidden-canvas"
              />
              
              <div className="camera-controls">
                <button 
                  className="camera-btn start-btn"
                  onClick={handleStartCamera}
                >
                  Start Camera
                </button>
                <button 
                  className="camera-btn stop-btn"
                  onClick={handleStopCamera}
                >
                  Stop Camera
                </button>
              </div>
            </div>

            <div className="practice-display">
              <div className="accuracy-meter">
                <p className="accuracy-label">Accuracy</p>
                <div className="accuracy-bar">
                  <div className="accuracy-fill" style={{ width: `${accuracy}%` }}></div>
                </div>
                <p className="accuracy-value">{accuracy.toFixed(0)}%</p>
              </div>

              <button 
                className="shoot-button"
                onClick={handleShootArrow}
                disabled={loading}
              >
                🏹 Practice Shot
              </button>
            </div>

            {/* Right: Guru Avatar */}
            <div className="guru-area">
              <img src={dronacharya} alt="Guru" className="guru-avatar-practice" />
              <p className="guru-guidance">
                {accuracy < 30 && "Your aim is off. Adjust your position."}
                {accuracy >= 30 && accuracy < 60 && "Better. Keep practicing."}
                {accuracy >= 60 && accuracy < 80 && "Good form! Almost there."}
                {accuracy >= 80 && "Excellent! Submit your attempt."}
              </p>
            </div>
          </div>

          <button 
            className="submit-practice-button"
            onClick={handleRecordPractice}
            disabled={loading || accuracy < 60}
          >
            {loading ? 'Submitting...' : 'Submit Attempt (Accuracy must be 60%+)'}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER - FEEDBACK PHASE
  // ============================================================================

  if (phase === 'feedback') {
    return (
      <div className="dhanur-container">
        <div className="dhanur-header">
          <h1>📋 Guru's Feedback</h1>
        </div>

        <div className="feedback-section">
          <img src={dronacharya} alt="Guru" className="guru-avatar" />
          
          <div className="score-display">
            <div className={`score-circle ${lessonPassed ? 'passed' : 'failed'}`}>
              <p className="score-value">{performanceScore.toFixed(0)}</p>
              <p className="score-label">Score</p>
            </div>
          </div>

          <div className="feedback-text-box">
            <p className="feedback-text">{guruFeedback}</p>
            <p className={`feedback-tone tone-${feedbackTone}`}>
              Tone: {feedbackTone}
            </p>
          </div>

          <div className="feedback-actions">
            {lessonPassed ? (
              <button 
                className="next-lesson-button"
                onClick={handleNextLesson}
              >
                ✓ Next Lesson →
              </button>
            ) : (
              <button 
                className="retry-button"
                onClick={handleRetry}
              >
                🔄 Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default DhanurMode;
