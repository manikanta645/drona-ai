import React, { useRef, useEffect, useState } from 'react';
import './KhadgaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

/**
 * KhadgaMode - FULLY INTEGRATED WITH BACKEND VIDYA ENGINE
 * Sword Technique Mastery
 */
const KhadgaMode = ({ 
  studentName, 
  studentLevel, 
  respectMeter = 50,
  studentProfile = null,
  onRespectMeterChange = () => {},
  onLessonComplete = () => {}
}) => {
  const [phase, setPhase] = useState('select');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(studentProfile?.lessons_completed || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [lessonPassed, setLessonPassed] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/khadga');
      const data = await response.json();
      if (data.lessons) {
        setAllLessons(data.lessons);
        console.log(`📚 Loaded ${data.lessons.length} Khadga lessons`);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      setError('Could not load lessons.');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLessons = () => allLessons.filter(lesson => !completedLessons.includes(lesson.lesson_id));

  const handleSelectLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setError('');
    setPhase('explain');
    await startSession(lesson.lesson_id);
  };

  const startSession = async (lessonId) => {
    try {
      setLoading(true);
      let studentId = localStorage.getItem('studentId');
      if (!studentId) {
        studentId = studentName.replace(/\s+/g, '_').toLowerCase();
        localStorage.setItem('studentId', studentId);
      }
      
      const response = await fetch(
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/khadga/${lessonId}`,
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

  const handleRecordPractice = async () => {
    try {
      setLoading(true);
      const timeTaken = (new Date() - sessionStartTime) / 1000;
      const studentId = localStorage.getItem('studentId') || studentName.replace(/\s+/g, '_').toLowerCase();
      
      const response = await fetch(`http://127.0.0.1:8000/api/vidya/submit-practice/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          vidya_id: 'khadga',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'Sword technique practice submitted',
          time_taken: timeTaken,
          attempt_number: attemptNumber
        })
      });
      
      const result = await response.json();
      if (result.performance_score !== undefined) {
        setPerformanceScore(result.performance_score);
        setGuruFeedback(result.feedback);
        setLessonPassed(result.passed);
        if (result.passed && result.performance_score >= 80) {
          onRespectMeterChange(Math.floor(result.performance_score / 20));
        }
        setPhase('feedback');
      }
    } catch (error) {
      console.error('Error submitting practice:', error);
      setError('Could not submit practice');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'select') {
    const availableLessons = getAvailableLessons();
    return (
      <div className="khadga-container">
        <div className="khadga-header">
          <h1 className="khadga-title">⚔️ Khadga Vidya - Sword Mastery</h1>
          <p className="khadga-subtitle">Master the art of the divine blade</p>
          <p className="student-info">Level: {studentLevel} | Respect: {respectMeter} | Completed: {completedLessons.length}/{allLessons.length}</p>
        </div>
        <div className="lesson-selection">
          <h2>Sword Techniques</h2>
          {loading ? <p>Loading...</p> : availableLessons.length > 0 ? (
            <div className="lessons-grid">
              {availableLessons.map(lesson => (
                <div key={lesson.lesson_id} className="lesson-card" onClick={() => handleSelectLesson(lesson)}>
                  <h3>{lesson.name}</h3>
                  <p>{lesson.description}</p>
                  <p className="difficulty">Level: {lesson.difficulty}</p>
                </div>
              ))}
            </div>
          ) : <p className="completion-message">🎓 All Khadga lessons completed!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="khadga-container">
        <div className="khadga-header"><h1>📖 {selectedLesson?.name}</h1></div>
        <div className="phase-container">
          <div className="guru-section">
            <img src={dronacharya} alt="Guru" className="guru-avatar" />
            <h2>Āchārya Droṇāchārya</h2>
          </div>
          <div className="explanation-section">
            <h3>Lesson Instructions</h3>
            <p>{selectedLesson?.instructions}</p>
            <h3>Practice Task</h3>
            <p>{selectedLesson?.practice_task}</p>
            <button className="phase-button next-button" onClick={() => setPhase('demonstrate')} disabled={loading}>
              I Understand →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="khadga-container">
        <div className="khadga-header"><h1>🎬 Watch the Master</h1></div>
        <div className="phase-container">
          <div className="demonstration-section">
            <img src={dronacharya} alt="Master" className="demo-avatar" />
            <p className="demo-text">Watch my sword technique carefully. Every movement matters.</p>
            <button className="phase-button next-button" onClick={() => setPhase('practice')} disabled={loading}>
              Ready to Practice →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="khadga-container">
        <div className="khadga-header"><h1>⚔️ Practice Time - Attempt {attemptNumber}</h1></div>
        <div className="practice-section">
          <video ref={videoRef} autoPlay playsInline className="practice-video" />
          <canvas ref={canvasRef} className="hidden-canvas" />
          <div className="camera-controls">
            <button className="camera-btn start-btn" onClick={async () => {
              const stream = await navigator.mediaDevices.getUserMedia({ video: { ideal: 1280 } });
              videoRef.current.srcObject = stream;
              streamRef.current = stream;
            }}>Start Camera</button>
            <button className="camera-btn stop-btn" onClick={() => {
              if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            }}>Stop Camera</button>
          </div>
          <button className="submit-practice-button" onClick={handleRecordPractice} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Practice'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="khadga-container">
        <div className="khadga-header"><h1>📋 Guru's Feedback</h1></div>
        <div className="feedback-section">
          <img src={dronacharya} alt="Guru" className="guru-avatar" />
          <div className="score-circle" style={{background: lessonPassed ? 'linear-gradient(135deg, #22863a 0%, #28a745 100%)' : 'linear-gradient(135deg, #c41e3a 0%, #e81c3f 100%)'}}>
            <p className="score-value">{performanceScore?.toFixed(0)}</p>
            <p className="score-label">Score</p>
          </div>
          <div className="feedback-text-box">
            <p>{guruFeedback}</p>
          </div>
          <button onClick={lessonPassed ? () => { setCompletedLessons([...completedLessons, selectedLesson.lesson_id]); onLessonComplete(selectedLesson.lesson_id); setPhase('select'); } : () => { setAttemptNumber(attemptNumber + 1); setPhase('practice'); }}>
            {lessonPassed ? '✓ Next Lesson →' : '🔄 Try Again'}
          </button>
        </div>
      </div>
    );
  }
};

export default KhadgaMode;
