import React, { useState, useEffect } from 'react';
import './ShastraMode.css';
import dronaImage from '../assets/dronacharya.jpg';

const ShastraMode = ({ 
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
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/shastra');
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
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/shastra/${lessonId}`,
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
          vidya_id: 'shastra',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'Scripture study completed',
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
      <div className="shastra-container">
        <div className="shastra-header">
          <h1>📚 Shastra Vidya - Sacred Texts</h1>
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
          ) : <p>All scripture lessons completed!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="shastra-container">
        <div className="shastra-header"><h1>{selectedLesson?.name}</h1></div>
        <div className="explain-section">
          <img src={dronaImage} alt="Guru" className="guru-avatar" />
          <p>{selectedLesson?.explanation || 'Learn the sacred text'}</p>
          <button onClick={() => setPhase('demonstrate')}>See Explanation →</button>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="shastra-container">
        <div className="shastra-header"><h1>Teaching</h1></div>
        <div className="demonstrate-section">
          <p>{selectedLesson?.demonstration || 'Teaching content'}</p>
          <button onClick={() => setPhase('practice')}>Begin Study →</button>
        </div>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="shastra-container">
        <div className="shastra-header"><h1>Study: {selectedLesson?.name}</h1></div>
        <div className="practice-section">
          <p>Study and reflect on the sacred text...</p>
          <button onClick={handleSubmitPractice} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Study'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="shastra-container">
        <div className="shastra-header"><h1>Result</h1></div>
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

export default ShastraMode;
