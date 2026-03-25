import React, { useRef, useState, useEffect } from 'react';
import './DhyanaMode.css';
import dronacharya from '../assets/dronacharya.jpg';

const DhyanaMode = ({ 
  studentName, 
  studentLevel, 
  respectMeter = 50,
  studentProfile = null,
  onRespectMeterChange = () => {},
  onLessonComplete = () => {}
}) => {
  const audioRef = useRef(null);
  const [phase, setPhase] = useState('select');
  const [allLessons, setAllLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(studentProfile?.lessons_completed || []);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [performanceScore, setPerformanceScore] = useState(null);
  const [guruFeedback, setGuruFeedback] = useState('');
  const [lessonPassed, setLessonPassed] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  useEffect(() => {
    loadLessons();
    
    // Cleanup audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/vidya/lessons/dhyana');
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
        `http://127.0.0.1:8000/api/vidya/start-session/${studentId}/dhyana/${lessonId}`,
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

  const submitPractice = async () => {
    try {
      setLoading(true);
      const timeTaken = (new Date() - sessionStartTime) / 1000;
      const studentId = localStorage.getItem('studentId') || studentName.replace(/\s+/g, '_').toLowerCase();
      
      const response = await fetch(`http://127.0.0.1:8000/api/vidya/submit-practice/${sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          vidya_id: 'dhyana',
          lesson_id: selectedLesson.lesson_id,
          text_answer: 'Meditation practice completed',
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

  // 🎵 Background Meditation Audio Controls
  const toggleMeditationAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  if (phase === 'select') {
    return (
      <div className="dhyana-container">
        <div className="dhyana-header">
          <h1>🧘 Dhyana Vidya - Meditation</h1>
          <p>Level: {studentLevel} | Respect: {respectMeter} | Done: {completedLessons.length}/{allLessons.length}</p>
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
          ) : <p>All completed!</p>}
        </div>
      </div>
    );
  }

  if (phase === 'explain') {
    return (
      <div className="dhyana-container">
        <div className="dhyana-header"><h1>{selectedLesson?.name}</h1></div>
        <div className="phase-container">
          <img src={dronacharya} alt="Guru" className="guru-avatar" />
          <p>{selectedLesson?.instructions}</p>
          <button onClick={() => setPhase('demonstrate')}>Continue →</button>
        </div>
      </div>
    );
  }

  if (phase === 'demonstrate') {
    return (
      <div className="dhyana-container">
        <div className="dhyana-header"><h1>Demonstration</h1></div>
        <button onClick={() => setPhase('practice')}>Ready →</button>
      </div>
    );
  }

  if (phase === 'practice') {
    return (
      <div className="dhyana-container">
        <div className="dhyana-header"><h1>Practice #{attemptNumber}</h1></div>
        
        {/* 🎵 Background Meditation Audio Player */}
        <div className="meditation-audio-section">
          <audio 
            ref={audioRef}
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            loop
            onEnded={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }
            }}
          />
          
          <button 
            className="meditation-audio-btn"
            onClick={toggleMeditationAudio}
            title={isAudioPlaying ? "Pause meditation audio" : "Play meditation audio"}
          >
            {isAudioPlaying ? '⏸️ Pause Meditation' : '▶️ Play Meditation'}
          </button>
          <p className="meditation-hint">
            {isAudioPlaying ? '🎵 Meditation audio is playing...' : 'Click to play meditation background audio'}
          </p>
        </div>

        <div className="meditation-practice-area">
          <p className="meditation-instruction">Sit in a comfortable position. Close your eyes. Breathe steadily.</p>
          <button onClick={submitPractice} disabled={loading} className="meditation-submit-btn">
            {loading ? 'Submitting...' : 'Meditation Complete'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'feedback') {
    return (
      <div className="dhyana-container">
        <div style={{background: lessonPassed ? 'green' : 'red'}} className="score-circle">
          {performanceScore?.toFixed(0)}
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
          {lessonPassed ? 'Next' : 'Retry'}
        </button>
      </div>
    );
  }
};

export default DhyanaMode;
