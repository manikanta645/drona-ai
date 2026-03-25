import React, { useState, useEffect } from 'react';
import './LearnVidya.css';

const LearnVidya = ({ studentName, vidyaName = 'dhanur', askDrona, isLoading }) => {
  const [currentLessonId, setCurrentLessonId] = useState(1);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [vidyaData, setVidyaData] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('intro'); // intro, lesson, practice, test, complete
  const [lessonNotes, setLessonNotes] = useState('');
  const [testScore, setTestScore] = useState(null);
  const [gurusFeedback, setGurusFeedback] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [videoTime, setVideoTime] = useState(0);
  const [practiceTime, setPracticeTime] = useState(0);
  const API_URL = "http://127.0.0.1:8000";

  // Load vidya data on mount
  useEffect(() => {
    const loadVidya = async () => {
      try {
        const response = await fetch(`${API_URL}/vidya/${vidyaName}`);
        const data = await response.json();
        setVidyaData(data);
      } catch (err) {
        console.error('Error loading vidya:', err);
      } finally {
        setLoadingData(false);
      }
    };
    
    loadVidya();
  }, [vidyaName]);

  // Timer for online video playback/watching
  useEffect(() => {
    if (currentPhase === 'lesson' && videoTime < 180) {
      const interval = setInterval(() => {
        setVideoTime(v => v + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPhase, videoTime]);

  // Timer for practice
  useEffect(() => {
    if (currentPhase === 'practice' && practiceTime < 900) {
      const interval = setInterval(() => {
        setPracticeTime(v => v + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentPhase, practiceTime]);

  const getCurrentLesson = () => {
    return vidyaData?.lessons?.find(l => l.id === currentLessonId);
  };

  const getCurrentTest = () => {
    return vidyaData?.tests?.find(t => t.lesson_id === currentLessonId);
  };

  const handleStartLesson = async () => {
    setCurrentPhase('lesson');
    setVideoTime(0);
    
    // Call backend to start lesson
    try {
      const response = await fetch(`${API_URL}/vidya/${vidyaName}/lesson/${currentLessonId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName })
      });
      const data = await response.json();
      askDrona(data.guru_greeting);
    } catch (err) {
      console.error('Error starting lesson:', err);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      const response = await fetch(`${API_URL}/vidya/${vidyaName}/lesson/${currentLessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName,
          student_performance: lessonNotes
        })
      });
      const data = await response.json();
      
      setCompletedLessons(prev => [...prev, currentLessonId]);
      setGurusFeedback(data.guru_feedback);
      setCurrentPhase('test');
      
      askDrona(data.guru_feedback);
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  const handleStartPractice = () => {
    setCurrentPhase('practice');
    setPracticeTime(0);
    askDrona('I am beginning my practice now. Guide me through this lesson key points.');
  };

  const handleCompletePractice = () => {
    askDrona(`I have practiced for ${Math.floor(practiceTime / 60)} minutes. Please evaluate my progress.`);
    setCurrentPhase('ready-for-test');
  };

  const handleStartTest = async () => {
    try {
      const response = await fetch(`${API_URL}/vidya/${vidyaName}/test/${currentLessonId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName })
      });
      const data = await response.json();
      
      setCurrentPhase('test-executing');
      askDrona(data.guru_instructions);
    } catch (err) {
      console.error('Error starting test:', err);
    }
  };

  const handleCompleteTest = async () => {
    // Simulate test performance
    const performance = {
      accuracy: Math.floor(Math.random() * 40) + 70, // 70-90%
      consistency: Math.floor(Math.random() * 30) + 70, // 70-95%
      form_quality: Math.floor(Math.random() * 35) + 65, // 65-95%
      time_used_seconds: practiceTime
    };

    try {
      const response = await fetch(`${API_URL}/vidya/${vidyaName}/test/${currentLessonId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: studentName,
          performance_metrics: performance
        })
      });
      const data = await response.json();
      
      setTestScore(data.score);
      setCompletedTests(prev => [...prev, currentLessonId]);
      
      if (data.passed) {
        setCurrentPhase('test-passed');
        askDrona(`Congratulations! You passed this test with ${data.score}% score. ${data.guru_feedback}`);
        
        // Move to next lesson
        if (data.next_lesson) {
          setCurrentLessonId(data.next_lesson.id);
        }
      } else {
        setCurrentPhase('test-failed');
        askDrona(`You did not pass this test. ${data.guru_feedback} Try again.`);
      }
    } catch (err) {
      console.error('Error completing test:', err);
    }
  };

  const handleNextLesson = () => {
    setCurrentPhase('intro');
    setLessonNotes('');
    setPracticeTime(0);
    setTestScore(null);
  };

  const handleCompleteVidya = async () => {
    try {
      const response = await fetch(`${API_URL}/vidya/${vidyaName}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_name: studentName })
      });
      const data = await response.json();
      
      setCurrentPhase('vidya-complete');
      askDrona(data.completion_message);
    } catch (err) {
      console.error('Error completing vidya:', err);
    }
  };

  if (loadingData) {
    return <div className="vidya-loading">Loading your vidya...</div>;
  }

  if (!vidyaData) {
    return <div className="vidya-error">Error loading vidya data</div>;
  }

  const lesson = getCurrentLesson();
  const test = getCurrentTest();

  return (
    <div className="learn-vidya-container" style={{backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M50,50 L60,30 L70,50 L50,50" fill="rgba(255,217,102,0.05)"/></pattern></defs><rect width="1200" height="800" fill="%231a1a2e"/><rect width="1200" height="800" fill="url(%23pattern)"/></svg>')`}}>
      
      {/* Header */}
      <div className="vidya-header">
        <h1>🎓 {vidyaData.name}</h1>
        <p className="vidya-subtitle">{vidyaData.description}</p>
        <div className="progress-bar">
          <div className="progress" style={{width: `${(completedLessons.length / vidyaData.lessons.length) * 100}%`}}></div>
        </div>
        <p className="progress-text">Lessons: {completedLessons.length}/{vidyaData.lessons.length} | Tests: {completedTests.length}/{vidyaData.tests.length}</p>
      </div>

      {/* Intro Phase */}
      {currentPhase === 'intro' && lesson && (
        <div className="vidya-phase intro-phase">
          <div className="lesson-card">
            <h2>📖 Lesson {currentLessonId}: {lesson.title}</h2>
            <p className="lesson-description">{lesson.description}</p>
            
            <div className="teaching-points">
              <h3>Key Learning Points:</h3>
              <ul>
                {lesson.teaching_points.map((point, i) => (
                  <li key={i}>✓ {point}</li>
                ))}
              </ul>
            </div>

            <p className="guru-observation">
              <strong>Guru's Observation:</strong> {lesson.guru_observation}
            </p>

            <div className="phase-buttons">
              <button className="btn-primary" onClick={handleStartLesson} disabled={isLoading}>
                {isLoading ? '...' : 'Start Learning'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Phase */}
      {currentPhase === 'lesson' && lesson && (
        <div className="vidya-phase lesson-phase">
          <div className="lesson-content">
            <div className="guru-section">
              <div className="guru-placeholder">🧙 Guru Teaching</div>
              <p>Watch the guru teaching video and listen to the teaching points being explained.</p>
              <p className="watch-time">Watch time: {Math.floor(videoTime / 60)}:{String(videoTime % 60).padStart(2, '0')}</p>
            </div>

            <div className="practice-section">
              <h3>Now it's your turn to learn</h3>
              <button className="btn-primary" onClick={handleStartPractice}>
                Begin Practice Session
              </button>
              <p className="hint">Practice the movements and techniques shown by the guru</p>
            </div>
          </div>
        </div>
      )}

      {/* Practice Phase */}
      {currentPhase === 'practice' && (
        <div className="vidya-phase practice-phase">
          <div className="practice-container">
            <div className="camera-placeholder">📹 Your Practice Space</div>
            <p className="practice-timer">Practice time: {Math.floor(practiceTime / 60)}:{String(practiceTime % 60).padStart(2, '0')}</p>
            
            <div className="metrics">
              <div className="metric">
                <label>Focus Level</label>
                <div className="meter-bar">
                  <div className="meter-fill" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                </div>
              </div>
              <div className="metric">
                <label>Form Quality</label>
                <div className="meter-bar">
                  <div className="meter-fill" style={{width: `${Math.random() * 35 + 65}%`}}></div>
                </div>
              </div>
            </div>

            <textarea 
              className="reflection-notes"
              placeholder="Reflect on your practice. What did you notice? What challenges did you face?"
              value={lessonNotes}
              onChange={(e) => setLessonNotes(e.target.value)}
            ></textarea>

            <button className="btn-primary" onClick={handleCompletePractice}>
              Complete Practice
            </button>
          </div>
        </div>
      )}

      {/* Ready for Test */}
      {currentPhase === 'ready-for-test' && test && (
        <div className="vidya-phase test-intro-phase">
          <div className="test-intro-card">
            <h2>🎯 Test {test.lesson_id}: {test.title}</h2>
            <p>{test.description}</p>
            
            <div className="test-criteria">
              <h3>Passing Criteria:</h3>
              <div className="criteria-grid">
                {Object.entries(test.passing_criteria).map(([key, value]) => (
                  <div key={key} className="criteria-item">
                    <span>{key.replace(/_/g, ' ')}:</span>
                    <strong>{value}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <p className="test-duration">Duration: {test.duration_minutes} minutes</p>

            <button className="btn-primary" onClick={handleStartTest} disabled={isLoading}>
              {isLoading ? '...' : 'Start Test'}
            </button>
          </div>
        </div>
      )}

      {/* Test Executing */}
      {currentPhase === 'test-executing' && (
        <div className="vidya-phase test-executing-phase">
          <div className="test-container">
            <div className="camera-placeholder">📹 Test Recording</div>
            <p className="test-status">Performing test... Show your mastery!</p>
            
            <div className="live-metrics">
              <div className="metric">
                <label>Accuracy</label>
                <div className="meter-bar">
                  <div className="meter-fill" style={{width: `${Math.random() * 40 + 60}%`}}></div>
                </div>
              </div>
              <div className="metric">
                <label>Consistency</label>
                <div className="meter-bar">
                  <div className="meter-fill" style={{width: `${Math.random() * 30 + 65}%`}}></div>
                </div>
              </div>
              <div className="metric">
                <label>Form Quality</label>
                <div className="meter-bar">
                  <div className="meter-fill" style={{width: `${Math.random() * 35 + 60}%`}}></div>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={handleCompleteTest}>
              Complete Test
            </button>
          </div>
        </div>
      )}

      {/* Test Results - Passed */}
      {currentPhase === 'test-passed' && (
        <div className="vidya-phase test-results-phase">
          <div className="results-card passed">
            <h2>✅ Test Passed!</h2>
            <p className="score">Score: {testScore}%</p>
            <p className="message">Excellent work, Shishya! You have demonstrated mastery of this lesson.</p>
            
            {currentLessonId < vidyaData.lessons.length ? (
              <button className="btn-primary" onClick={handleNextLesson}>
                Continue to Lesson {currentLessonId + 1}
              </button>
            ) : (
              <button className="btn-success" onClick={handleCompleteVidya}>
                Complete Vidya & Receive Blessing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Test Results - Failed */}
      {currentPhase === 'test-failed' && (
        <div className="vidya-phase test-results-phase">
          <div className="results-card failed">
            <h2>❌ Test Not Passed</h2>
            <p className="score">Score: {testScore}%</p>
            <p className="message">Do not be discouraged, Shishya. Review the lesson and try again.</p>
            
            <button className="btn-primary" onClick={() => {
              setCurrentPhase('intro');
              setPracticeTime(0);
              setLessonNotes('');
            }}>
              Review Lesson & Retake Test
            </button>
          </div>
        </div>
      )}

      {/* Vidya Complete */}
      {currentPhase === 'vidya-complete' && (
        <div className="vidya-phase completion-phase">
          <div className="completion-card">
            <h2>🏆 {vidyaData.name} - MASTERED!</h2>
            <p className="completion-message">
              You have completed all lessons and tests with excellence.
            </p>
            
            <div className="achievement-stats">
              <div className="stat">
                <div className="stat-value">{completedLessons.length}</div>
                <div className="stat-label">Lessons Completed</div>
              </div>
              <div className="stat">
                <div className="stat-value">{completedTests.length}</div>
                <div className="stat-label">Tests Passed</div>
              </div>
              <div className="stat">
                <div className="stat-value">⭐️</div>
                <div className="stat-label">Master Status</div>
              </div>
            </div>

            <p className="blessing-text">
              Om Namah Shivaya 🙏
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnVidya;
