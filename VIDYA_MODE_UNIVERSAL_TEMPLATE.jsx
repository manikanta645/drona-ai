/**
 * UNIVERSAL VIDYA MODE TEMPLATE
 * Use this pattern for: KhadgaMode, DharmaMode, DhyanaMode, GadaMode, YudhaMode, ShastraMode, IthihasaMode, AstraMode
 * 
 * Just change:
 * 1. Component name (e.g., KhadgaMode)
 * 2. CSS import path (e.g., './KhadgaMode.css')
 * 3. vidya_id in fetch calls (e.g., 'khadga' instead of 'dhanur')
 * 4. Phase content (explain, demonstrate, practice are vidya-specific)
 * 5. CSS styling to match vidya theme
 */

import React, { useRef, useEffect, useState } from 'react';
import './[VidyaMode].css';  // Change to actual CSS file
import dronacharya from '../assets/dronacharya.jpg';

const [VidyaModeName] = ({ 
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
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState('encouraging');
  const [lessonPassed, setLessonPassed] = useState(false);
  
  // Camera state
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  // ============================================================================
  // INITIALIZATION - LOAD LESSONS
  // ============================================================================

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      // CHANGE THIS: Replace 'dhanur' with actual vidya_id (khadga, dharma, dhyana, etc)
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/dhanur');
      const data = await response.json();
      
      if (data.lessons) {
        setAllLessons(data.lessons);
        console.log(`📚 Loaded ${data.lessons.length} lessons`);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      setError('Could not load lessons. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // GET AVAILABLE LESSONS
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
      
      let studentId = localStorage.getItem('studentId');
      if (!studentId) {
        studentId = studentName.replace(/\s+/g, '_').toLowerCase();
        localStorage.setItem('studentId', studentId);
      }
      
      // CHANGE THIS: Replace 'dhanur' with actual vidya_id
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
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setError('Could not start session');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // PHASE TRANSITIONS
  // ============================================================================

  const handleExplanationRead = () => {
    setPhase('demonstrate');
  };

  const handleDemonstrationComplete = () => {
    setPhase('practice');
  };

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
      
      let videoData = null;
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        videoData = canvasRef.current.toDataURL('image/jpeg');
      }
      
      const timeTaken = (new Date() - sessionStartTime) / 1000;
      const studentId = localStorage.getItem('studentId') || studentName.replace(/\s+/g, '_').toLowerCase();
      
      // CHANGE THIS: Replace 'dhanur' with actual vidya_id
      const response = await fetch(
        `http://127.0.0.1:8000/api/vidya/submit-practice/${sessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            vidya_id: 'dhanur',  // CHANGE THIS
            lesson_id: selectedLesson.lesson_id,
            text_answer: 'Practice attempt submitted',
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

  // ============================================================================
  // FEEDBACK PHASE
  // ============================================================================

  const handleRetry = () => {
    setAttemptNumber(attemptNumber + 1);
    setPerformanceScore(null);
    setGuruFeedback('');
    setPhase('practice');
  };

  const handleNextLesson = () => {
    if (lessonPassed) {
      setCompletedLessons([...completedLessons, selectedLesson.lesson_id]);
      onLessonComplete(selectedLesson.lesson_id);
      
      setPhase('select');
      setSelectedLesson(null);
      setAttemptNumber(1);
    }
  };

  // ============================================================================
  // RENDER PHASES
  // ============================================================================

  if (phase === 'select') {
    const availableLessons = getAvailableLessons();
    
    return (
      <div className="vidya-container">
        <div className="vidya-header">
          <h1 className="vidya-title">🏹 [Vidya Name] - [Description]</h1>
          <p className="vidya-subtitle">Master this ancient art</p>
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
            <p className="completion-message">🎓 Congratulations! You have completed all lessons!</p>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="vidya-container">
        <div className="vidya-header">
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

  if (phase === 'demonstrate') {
    return (
      <div className="vidya-container">
        <div className="vidya-header">
          <h1>🎬 Watch the Master</h1>
        </div>
        
        <div className="phase-container">
          <div className="demonstration-section">
            <img src={dronacharya} alt="Master" className="demo-avatar" />
            <p className="demo-text">
              Watch carefully as I demonstrate the technique. Pay attention to every detail.
            </p>
            
            <div className="demo-steps">
              <h3>Key Points to Observe:</h3>
              <ul>
                <li>Proper posture and positioning</li>
                <li>Correct technique application</li>
                <li>Timing and rhythm</li>
                <li>Common mistakes to avoid</li>
                <li>Tips for mastery</li>
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

  if (phase === 'practice') {
    return (
      <div className="vidya-container">
        <div className="vidya-header">
          <h1>🏋️ Practice Time</h1>
          <p>Attempt {attemptNumber}</p>
        </div>

        <div className="practice-section">
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
              <button className="camera-btn start-btn" onClick={handleStartCamera}>
                Start Camera
              </button>
              <button className="camera-btn stop-btn" onClick={handleStopCamera}>
                Stop Camera
              </button>
            </div>
          </div>

          <div className="guru-guidance">
            <img src={dronacharya} alt="Guru" className="guru-small" />
            <p>Practice carefully. Submit when ready.</p>
          </div>

          <button 
            className="submit-practice-button"
            onClick={handleRecordPractice}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Practice'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="vidya-container">
        <div className="vidya-header">
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
          </div>

          <div className="feedback-actions">
            {lessonPassed ? (
              <button className="next-lesson-button" onClick={handleNextLesson}>
                ✓ Next Lesson →
              </button>
            ) : (
              <button className="retry-button" onClick={handleRetry}>
                🔄 Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
};

export default [VidyaModeName];
