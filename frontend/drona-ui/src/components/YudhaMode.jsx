import React, { useState, useEffect } from 'react';
import './YudhaMode.css';
import dronaImage from '../assets/dronacharya.jpg';

const YudhaMode = ({ 
  studentName, 
  studentLevel, 
  respectMeter = 50,
  studentProfile = null,
  onRespectMeterChange = () => {},
  onLessonComplete = () => {}
}) => {
  const [phase, setPhase] = useState('select');
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(studentProfile?.lessons_completed || []);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [lessonPassed, setLessonPassed] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/yudha');
      const data = await response.json();
      if (data.lessons) setAllLessons(data.lessons);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAvailable = () => allLessons.filter(l => !completedLessons.includes(l.lesson_id));

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
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/yudha/${lessonId}`,
        { method: 'POST' }
      );
      
      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);
        setSessionStartTime(new Date());
        setAttemptNumber(1);
      }
    } catch (error) {
      console.error('Error:', error);
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
          vidya_id: 'yudha',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'War strategy practice',
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
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'select') {
    return (
      <div className="yudha-container">
        <div className="yudha-header">
          <h1>⚔️ Yudha Vidya - War Strategy</h1>
          <p>Level: {studentLevel} | Respect: {respectMeter} | Completed: {completedLessons.length}/{allLessons.length}</p>
        </div>
        <div className="lesson-selection">
          {loading ? <p>Loading...</p> : getAvailable().length > 0 ? (
            <div className="lessons-grid">
              {getAvailable().map(l => (
                <div key={l.lesson_id} className="lesson-card" onClick={() => handleSelectLesson(l)}>
                  <h3>{l.name}</h3>
                  <p>{l.description}</p>
                </div>
              ))}
            </div>
          ) : <p>All war strategy lessons completed!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="yudha-container">
        <div className="yudha-header"><h1>{selectedLesson?.name}</h1></div>
        <div className="explain-section">
          <img src={dronaImage} alt="Guru" className="guru-avatar" />
          <p>{selectedLesson?.explanation || 'Learn war strategy'}</p>
          <button onClick={() => setPhase('demonstrate')}>See Strategy →</button>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="yudha-container">
        <div className="yudha-header"><h1>Strategy</h1></div>
        <div className="demonstrate-section">
          <p>{selectedLesson?.demonstration || 'Strategy demonstration'}</p>
          <button onClick={() => setPhase('practice')}>Plan Battle →</button>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="yudha-container">
        <div className="yudha-header"><h1>Practice: {selectedLesson?.name}</h1></div>
        <div className="practice-section">
          <p>Plan and execute your strategy...</p>
          <button onClick={handleSubmitPractice} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Strategy'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="yudha-container">
        <div className="yudha-header"><h1>Result</h1></div>
        <div className="feedback-section" style={{background: lessonPassed ? '#2ecc71' : '#e74c3c', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px'}}>
          <h2>Score: {performanceScore?.toFixed(0)}</h2>
          <p>{guruFeedback}</p>
          <button onClick={lessonPassed ? () => {
            setCompletedLessons([...completedLessons, selectedLesson.lesson_id]);
            onLessonComplete(selectedLesson.lesson_id);
            setPhase('select');
          } : () => {
            setAttemptNumber(attemptNumber + 1);
            setPhase('practice');
          }} style={{marginTop: '15px', padding: '10px 20px'}}>
            {lessonPassed ? 'Next Lesson →' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }
};

export default YudhaMode;
