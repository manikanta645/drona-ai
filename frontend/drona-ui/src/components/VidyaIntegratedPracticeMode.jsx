/**
 * VIDYA INTEGRATED PRACTICE MODE
 * Complete integration of VIDYA backend with frontend
 * Demonstrates full teaching loop: Explain → Demonstrate → Practice → Evaluate → Feedback
 * 
 * This component can be used as a template for all Vidya-specific modes
 */

import React, { useState, useEffect, useRef } from 'react';
import './VidyaPracticeMode.css';
import vidyaAPI from '../utils/vidyaAPI';

const VidyaIntegratedPracticeMode = ({ 
  studentId,
  vidyaId = 'dhanur',
  lessonId = 'stance',
  startVidyaSession,
  submitVidyaPractice,
  endVidyaSession,
  isLoading = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [lessonPhase, setLessonPhase] = useState('explanation');  // explanation, demonstration, practice, evaluation, feedback
  const [performanceScore, setPerformanceScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [practiceData, setPracticeData] = useState(null);
  const [poseData, setPoseData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  // ============================================================================
  // PHASE 1: INITIALIZATION - Get Lesson Details
  // ============================================================================
  
  useEffect(() => {
    const initializeLesson = async () => {
      try {
        const lessonData = await vidyaAPI.lesson.get(vidyaId, lessonId);
        setLesson(lessonData);
      } catch (error) {
        console.error('Failed to load lesson:', error);
        setFeedback('Unable to load lesson. Please try again.');
      }
    };

    if (!sessionActive && lesson === null) {
      initializeLesson();
    }
  }, [vidyaId, lessonId, sessionActive, lesson]);

  // ============================================================================
  // PHASE 2: EXPLANATION - Guru Explains the Lesson
  // ============================================================================

  const handleStartLesson = async () => {
    try {
      const session = await startVidyaSession(vidyaId, lessonId, studentId);
      setSessionData(session);
      setSessionActive(true);
      setLessonPhase('explanation');
      setSessionTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);

      setFeedback('');
    } catch (error) {
      console.error('Failed to start session:', error);
      setFeedback('Unable to start lesson. Please try again.');
    }
  };

  const handleExplanationComplete = () => {
    setLessonPhase('demonstration');
    setFeedback('Watch as I demonstrate the technique...');
  };

  // ============================================================================
  // PHASE 3: DEMONSTRATION - Guru Shows How to Do It
  // ============================================================================

  const handleDemonstrationComplete = () => {
    setLessonPhase('practice');
    setFeedback(`Now it's your turn, Shishya. Show me what you've learned.\n\n${lesson?.practice_task || ''}`);
  };

  // ============================================================================
  // PHASE 4: PRACTICE - Student Performs the Task
  // ============================================================================

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        setVideoError('');
        setLessonPhase('practice');
      }
    } catch (error) {
      console.error('Camera access error:', error);
      setVideoError('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    return canvas.toDataURL('image/jpeg');
  };

  const handleSubmitPractice = async () => {
    if (!cameraActive && !practiceData) {
      setFeedback('Please practice first before submitting.');
      return;
    }

    try {
      setLoading(true);
      setLessonPhase('evaluation');
      
      // Capture current frame as evidence
      const frameImage = await captureFrame();
      
      // In a real scenario, frameImage would be sent to backend for pose analysis
      const result = await submitVidyaPractice(
        poseData || { landmarks: [], frame_timestamp: Date.now() / 1000 },
        practiceData?.text,
        studentId
      );

      setPerformanceScore(result.performance_score);
      setLessonPhase('feedback');
      
      // Generate detailed feedback
      setFeedback(result.feedback);
      
      handleFeedback(result);
    } catch (error) {
      console.error('Failed to submit practice:', error);
      setFeedback('Error submitting practice. Please try again.');
    }
  };

  // ============================================================================
  // PHASE 5: FEEDBACK - Guru Provides Personalized Feedback
  // ============================================================================

  const handleFeedback = (result) => {
    // Format feedback for display
    let feedbackText = `\n📊 Your Performance Score: ${result.performance_score}/100\n`;
    
    if (result.passed) {
      feedbackText += '\n✨ Excellent! You have mastered this lesson.\n';
      feedbackText += `\nYour tone today: ${result.tone}\n`;
      if (result.encouragement) {
        feedbackText += `\nGuru says: "${result.encouragement}"\n`;
      }
      if (result.next_steps) {
        feedbackText += `\nNext: ${result.next_steps.join(', ')}\n`;
      }
    } else {
      feedbackText += '\n🔄 You need more practice. Let us try again.\n';
      if (result.corrections && result.corrections.length > 0) {
        feedbackText += '\nCorrections needed:\n';
        result.corrections.forEach((correction) => {
          feedbackText += `  • ${correction}\n`;
        });
      }
      if (result.next_steps) {
        feedbackText += `\nTry: ${result.next_steps.join(', ')}\n`;
      }
    }

    setFeedback(feedbackText);
  };

  const handleRetry = () => {
    setAttemptNumber(attemptNumber + 1);
    setPracticeData(null);
    setPoseData(null);
    setPerformanceScore(null);
    setLessonPhase('practice');
    setFeedback(`Attempt ${attemptNumber + 1}. Show me your technique again.`);
  };

  const handleNextLesson = async () => {
    try {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
      await endVidyaSession();
      setSessionActive(false);
      setLessonPhase('explanation');
      setFeedback('');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  // ============================================================================
  // RENDER PHASES
  // ============================================================================

  const renderExplanationPhase = () => (
    <div className="phase-container explanation-phase">
      <div className="guru-speaks">
        <h2>🧑‍🏫 Guru's Explanation</h2>
        {lesson && (
          <>
            <p className="lesson-title">{lesson.name}</p>
            <p className="lesson-description">{lesson.description}</p>
            <div className="instructions">
              <h3>Instructions:</h3>
              <p>{lesson.instructions}</p>
            </div>
            <div className="lesson-details">
              <p><strong>Difficulty:</strong> Level {lesson.difficulty}/5</p>
              <p><strong>Estimated Time:</strong> {lesson.estimated_time} seconds</p>
            </div>
          </>
        )}
      </div>
      <button 
        className="phase-button next-phase"
        onClick={handleExplanationComplete}
        disabled={isLoading}
      >
        I Understand → See Demonstration
      </button>
    </div>
  );

  const renderDemonstrationPhase = () => (
    <div className="phase-container demonstration-phase">
      <div className="guru-demonstrates">
        <h2>👨‍🏫 Guru Demonstrates</h2>
        <div className="demo-video">
          <div className="placeholder">
            {lesson?.name} - Demonstration Video
          </div>
          <p className="demo-description">
            {lesson?.description}
          </p>
        </div>
      </div>
      <button 
        className="phase-button next-phase"
        onClick={handleDemonstrationComplete}
        disabled={isLoading}
      >
        I'm Ready → Start Practice
      </button>
    </div>
  );

  const renderPracticePhase = () => (
    <div className="phase-container practice-phase">
      <h2>🎯 Your Practice</h2>
      
      {!cameraActive ? (
        <div className="camera-setup">
          <p className="practice-task">{lesson?.practice_task}</p>
          <button 
            className="camera-button start-camera"
            onClick={startCamera}
            disabled={isLoading}
          >
            📷 Start Camera
          </button>
          {videoError && <p className="error">{videoError}</p>}
        </div>
      ) : (
        <div className="practice-session">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="practice-video"
          />
          <div className="practice-controls">
            <p className="timer">Time: {sessionTime}s</p>
            <button 
              className="camera-button stop-camera"
              onClick={stopCamera}
            >
              ⏹️ Stop Camera
            </button>
            <button 
              className="phase-button submit"
              onClick={handleSubmitPractice}
              disabled={isLoading}
            >
              {isLoading ? 'Analyzing...' : '✅ Submit Practice'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEvaluationPhase = () => (
    <div className="phase-container evaluation-phase">
      <h2>📊 Evaluation in Progress</h2>
      <div className="loading-animation">
        <div className="spinner"></div>
        <p>Guru is analyzing your performance...</p>
      </div>
    </div>
  );

  const renderFeedbackPhase = () => (
    <div className="phase-container feedback-phase">
      <h2>💬 Guru's Feedback</h2>
      
      <div className="score-display">
        <div className="score-circle">
          <span className="score-number">{performanceScore}</span>
          <span className="score-label">/100</span>
        </div>
        <div className="score-indicator">
          {performanceScore >= 80 ? '✨ Mastered' : performanceScore >= 60 ? '📈 Good Progress' : '🔄 Needs Practice'}
        </div>
      </div>

      <div className="feedback-text">
        {feedback.split('\n').map((line, idx) => (
          line.trim() !== '' && <p key={idx}>{line}</p>
        ))}
      </div>

      <div className="action-buttons">
        {performanceScore >= 80 ? (
          <button 
            className="phase-button next-lesson"
            onClick={handleNextLesson}
            disabled={isLoading}
          >
            ⭐ Next Lesson
          </button>
        ) : (
          <button 
            className="phase-button retry"
            onClick={handleRetry}
            disabled={isLoading}
          >
            🔄 Retry (Attempt {attemptNumber + 1})
          </button>
        )}
      </div>
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!sessionActive) {
    return (
      <div className="vidya-practice-container">
        <div className="pre-session">
          <h2>🏹 {vidyaId.toUpperCase()} Vidya</h2>
          <p>Prepare yourself to learn from the Guru.</p>
          <button 
            className="start-session-button"
            onClick={handleStartLesson}
            disabled={isLoading || !lesson}
          >
            {isLoading ? 'Preparing...' : '🙏 Begin Lesson'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vidya-practice-container">
      <div className="session-header">
        <h3>{lesson?.name}</h3>
        <div className="session-info">
          <span className="phase-indicator">Phase: {lessonPhase}</span>
          <span className="attempt-indicator">Attempt: {attemptNumber}</span>
        </div>
      </div>

      {lessonPhase === 'explanation' && renderExplanationPhase()}
      {lessonPhase === 'demonstration' && renderDemonstrationPhase()}
      {lessonPhase === 'practice' && renderPracticePhase()}
      {lessonPhase === 'evaluation' && renderEvaluationPhase()}
      {lessonPhase === 'feedback' && renderFeedbackPhase()}
    </div>
  );
};

export default VidyaIntegratedPracticeMode;
