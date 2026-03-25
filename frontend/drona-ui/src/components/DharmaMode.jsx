import React, { useRef, useState, useEffect } from 'react';
import './DharmaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const DharmaMode = ({ 
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

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/dharma');
      const data = await response.json();
      if (data.lessons) {
        setAllLessons(data.lessons);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Could not load lessons');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableLessons = () => allLessons.filter(l => !completedLessons.includes(l.lesson_id));

  const handleSelectLesson = async (lesson) => {
    setSelectedLesson(lesson);
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
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/dharma/${lessonId}`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setSessionStartTime(new Date());
        setAttemptNumber(1);
      }
    } catch (error) {
      setError('Error starting session');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPractice = async () => {
    try {
      setLoading(true);
      const timeTaken = (new Date() - sessionStartTime) / 1000;
      const studentId = localStorage.getItem('studentId') || studentName.replace(/\s+/g, '_').toLowerCase();
      
      const response = await fetch(`http://127.0.0.1:8000/api/vidya/submit-practice/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          vidya_id: 'dharma',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'Philosophy lesson completed',
          time_taken: timeTaken,
          attempt_number: attemptNumber
        })
      });
      
      const result = await response.json();
      if (result.performance_score !== undefined) {
        setPerformanceScore(result.performance_score);
        setGuruFeedback(result.feedback);
        setLessonPassed(result.passed);
        if (result.passed) {
          onRespectMeterChange(Math.floor(result.performance_score / 20));
        }
        setPhase('feedback');
      }
    } catch (error) {
      setError('Error submitting');
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'select') {
    const available = getAvailableLessons();
    return (
      <div className="dharma-container">
        <div className="dharma-header">
          <h1>⚖️ Dharma Vidya - The Path of Righteousness</h1>
          <p>Level: {studentLevel} | Respect: {respectMeter} | Completed: {completedLessons.length}/{allLessons.length}</p>
        </div>
        <div className="lesson-selection">
          {loading ? <p>Loading...</p> : available.length > 0 ? (
            <div className="lessons-grid">
              {available.map(l => (
                <div key={l.lesson_id} className="lesson-card" onClick={() => handleSelectLesson(l)}>
                  <h3>{l.name}</h3>
                  <p>{l.description}</p>
                </div>
              ))}
            </div>
          ) : <p>All Dharma lessons completed!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="dharma-container">
        <div className="dharma-header"><h1>📖 {selectedLesson?.name}</h1></div>
        <div className="phase-container">
          <img src={dronacharya} alt="Guru" className="guru-avatar" />
          <div>
            <h3>Lesson</h3>
            <p>{selectedLesson?.instructions}</p>
            <button className="next-button" onClick={() => setPhase('demonstrate')}>Continue →</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="dharma-container">
        <div className="dharma-header"><h1>🎬 Wisdom</h1></div>
        <div className="phase-container">
          <img src={dronacharya} alt="Master" className="demo-avatar" />
          <button className="next-button" onClick={() => setPhase('practice')}>Ready →</button>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="dharma-container">
        <div className="dharma-header"><h1>Practice - Attempt {attemptNumber}</h1></div>
        <button className="submit-button" onClick={handleSubmitPractice} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="dharma-container">
        <div className="dharma-header"><h1>Feedback</h1></div>
        <div className="feedback-section">
          <div className="score-circle" style={{background: lessonPassed ? 'green' : 'red'}}>
            <p>{performanceScore?.toFixed(0)}</p>
          </div>
          <p>{guruFeedback}</p>
          <button onClick={lessonPassed ? () => {
            setCompletedLessons([...completedLessons, selectedLesson.lesson_id]);
            onLessonComplete(selectedLesson.lesson_id);
            setPhase('select');
          } : () => {
            setAttemptNumber(attemptNumber + 1);
            setPhase('practice');
          }}>
            {lessonPassed ? 'Next →' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }
};

export default DharmaMode;
