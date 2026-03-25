import React, { useEffect, useState } from 'react';
import './AstraMode.css';
import dronaImage from '../assets/dronacharya.jpg';

const AstraMode = ({ 
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
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [lessonPassed, setLessonPassed] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [demonstration, setDemonstration] = useState('');
  const [practiceMode, setPracticeMode] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = React.useRef(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/astra');
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
    setDemonstration(lesson.demonstration || 'Ancient weapon technique being demonstrated...');
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
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/astra/${lessonId}`,
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
          vidya_id: 'astra',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'Practiced weapon technique',
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
      <div className="astra-container">
        <div className="astra-header">
          <h1 className="astra-title">⚡ Astra Vidya - Celestial Weapons</h1>
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
          ) : <p>All weapons mastered!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="astra-container">
        <div className="astra-header">
          <h1>{selectedLesson?.name}</h1>
        </div>
        <div className="explain-section">
          <img src={dronaImage} alt="Guru" className="guru-avatar" />
          <div className="explanation">
            <h2>Learn: {selectedLesson?.name}</h2>
            <p>{selectedLesson?.explanation || 'Understanding the celestial weapon...'}</p>
          </div>
          <button onClick={() => setPhase('demonstrate')}>See Demonstration →</button>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="astra-container">
        <div className="astra-header"><h1>Demonstration</h1></div>
        <div className="demonstrate-section">
          <div className="demo-display">
            <div className="demo-box">
              {demonstration}
            </div>
            <div className="key-points">
              <h3>Key Points:</h3>
              <ul>
                <li>Focus on accuracy</li>
                <li>Master the technique sequence</li>
                <li>Understand the cosmic energy flow</li>
              </ul>
            </div>
          </div>
          <button onClick={() => setPracticeMode(true)}>Practice Now →</button>
        </div>
      </div>
    );
  }

  if (phase === 'practice' || practiceMode) {
    return (
      <div className="astra-container">
        <div className="astra-header"><h1>Practice: {selectedLesson?.name}</h1></div>
        <div className="practice-section">
          <div className="practice-area">
            <video ref={videoRef} width="400" height="300" style={{border: '2px solid orange', borderRadius: '8px'}} />
            <div className="timer">Practice Time: {recordingTime}s</div>
          </div>
          <div className="practice-controls">
            <button onClick={() => {
              setRecordingTime(recordingTime + 1);
              setTimeout(() => {}, 1000);
            }}>
              Recording...
            </button>
          </div>
          <button onClick={handleSubmitPractice} disabled={loading} style={{marginTop: '10px'}}>
            {loading ? 'Submitting...' : 'Submit Practice'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="astra-container">
        <div className="astra-header"><h1>Weapon Mastery Result</h1></div>
        <div className="feedback-section" style={{background: lessonPassed ? '#2ecc71' : '#e74c3c', color: 'white', padding: '20px', textAlign: 'center', borderRadius: '8px'}}>
          <h2>Score: {performanceScore?.toFixed(0)}</h2>
          <p>{guruFeedback}</p>
          <button onClick={lessonPassed ? () => {
            setCompletedLessons([...completedLessons, selectedLesson.lesson_id]);
            onLessonComplete(selectedLesson.lesson_id);
            setPhase('select');
          } : () => {
            setAttemptNumber(attemptNumber + 1);
            setPracticeMode(false);
            setPhase('demonstrate');
          }} style={{marginTop: '15px', padding: '10px 20px', fontSize: '16px'}}>
            {lessonPassed ? 'Next Weapon →' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }
};

export default AstraMode;
