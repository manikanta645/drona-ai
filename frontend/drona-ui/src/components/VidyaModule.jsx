import React, { useState, useEffect, useRef } from 'react';
import './VidyaModule.css';
import VidyaLesson from './VidyaLesson';
import VidyaTest from './VidyaTest';

/**
 * VIDYA MODULE - Complete Learning System
 * Manages progression through vidya lessons and tests with guru guidance
 */
function VidyaModule({ vidya_name, student_name, onExit }) {
  const [vidya, setVidya] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(1);
  const [currentTest, setCurrentTest] = useState(1);
  const [screen, setScreen] = useState('intro'); // intro, lesson, test, appreciation
  const [guruMessage, setGuruMessage] = useState('');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load vidya information on mount
  useEffect(() => {
    loadVidya();
  }, [vidya_name]);

  const loadVidya = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://127.0.0.1:8000/vidya/${vidya_name}`);
      const data = await response.json();
      setVidya(data);
      setError(null);
    } catch (err) {
      setError(`Could not load vidya: ${err.message}`);
      console.error('Vidya loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startLesson = async (lessonId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vidya/${vidya_name}/lesson/${lessonId}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_name }),
        }
      );
      const data = await response.json();
      setGuruMessage(data.guru_greeting);
      setCurrentLesson(lessonId);
      setScreen('lesson');
    } catch (err) {
      setError(`Failed to start lesson: ${err.message}`);
    }
  };

  const startTest = async (testId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vidya/${vidya_name}/test/${testId}/start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_name }),
        }
      );
      const data = await response.json();
      setGuruMessage(data.guru_instructions);
      setCurrentTest(testId);
      setScreen('test');
    } catch (err) {
      setError(`Failed to start test: ${err.message}`);
    }
  };

  const completeLesson = async (performance) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vidya/${vidya_name}/lesson/${currentLesson}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_name, student_performance: performance }),
        }
      );
      const data = await response.json();
      
      setCompletedLessons([...completedLessons, currentLesson]);
      setGuruMessage(data.guru_feedback);
      
      if (data.vidya_complete) {
        handleVidyaComplete();
      } else {
        // Move to corresponding test
        setScreen('test');
        startTest(currentLesson);
      }
    } catch (err) {
      setError(`Failed to complete lesson: ${err.message}`);
    }
  };

  const completeTest = async (performance) => {
    try {
      setCompletedTests([...completedTests, currentTest]);
      
      // If all tests done, complete vidya
      if (vidya && completedTests.length + 1 >= vidya.total_tests) {
        handleVidyaComplete();
      } else {
        // Move to next lesson
        const nextLessonId = currentLesson + 1;
        if (vidya && nextLessonId <= vidya.total_lessons) {
          startLesson(nextLessonId);
        }
      }
    } catch (err) {
      setError(`Failed to complete test: ${err.message}`);
    }
  };

  const handleVidyaComplete = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/vidya/${vidya_name}/complete`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_name }),
        }
      );
      const data = await response.json();
      setGuruMessage(data.completion_message);
      setScreen('appreciation');
    } catch (err) {
      setError(`Failed to complete vidya: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="vidya-loading">Loading Vidya...</div>;
  }

  if (error) {
    return (
      <div className="vidya-error">
        <p>{error}</p>
        <button onClick={onExit}>Back to Main</button>
      </div>
    );
  }

  if (!vidya) {
    return (
      <div className="vidya-error">
        <p>Vidya not found</p>
        <button onClick={onExit}>Back to Main</button>
      </div>
    );
  }

  // INTRO SCREEN - Choose starting point
  if (screen === 'intro') {
    return (
      <div className="vidya-container">
        <div className="vidya-header">
          <h1 className="vidya-title">{vidya.name}</h1>
          <p className="vidya-description">{vidya.description}</p>
          <p className="student-name">Shishya (Student): {student_name}</p>
        </div>

        <div className="vidya-progression">
          <div className="lessons-grid">
            <h3>Lessons ({vidya.total_lessons})</h3>
            {vidya.lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`lesson-button ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}
                onClick={() => startLesson(lesson.id)}
                title={lesson.description}
              >
                <span className="lesson-number">{lesson.id}</span>
                <span className="lesson-title">{lesson.title}</span>
                {completedLessons.includes(lesson.id) && <span className="check">✓</span>}
              </button>
            ))}
          </div>

          <div className="tests-grid">
            <h3>Tests ({vidya.total_tests})</h3>
            {vidya.tests.map((test) => (
              <button
                key={test.id}
                className={`test-button ${completedTests.includes(test.id) ? 'completed' : ''} ${
                  completedLessons.includes(test.lesson_id) ? 'unlocked' : 'locked'
                }`}
                onClick={() => (completedLessons.includes(test.lesson_id) ? startTest(test.id) : null)}
                disabled={!completedLessons.includes(test.lesson_id)}
                title={test.description}
              >
                <span className="test-number">{test.id}</span>
                <span className="test-title">{test.title}</span>
                {completedTests.includes(test.id) && <span className="check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="vidya-actions">
          <button className="btn-exit" onClick={onExit}>Return to Main</button>
          <div className="progress-info">
            <p>Lessons Completed: {completedLessons.length}/{vidya.total_lessons}</p>
            <p>Tests Completed: {completedTests.length}/{vidya.total_tests}</p>
          </div>
        </div>
      </div>
    );
  }

  // LESSON SCREEN
  if (screen === 'lesson') {
    return (
      <VidyaLesson
        vidya={vidya}
        lessonId={currentLesson}
        studentName={student_name}
        guruGreeting={guruMessage}
        onComplete={completeLesson}
        onCancel={() => setScreen('intro')}
      />
    );
  }

  // TEST SCREEN
  if (screen === 'test') {
    return (
      <VidyaTest
        vidya={vidya}
        testId={currentTest}
        studentName={student_name}
        guruInstructions={guruMessage}
        onComplete={completeTest}
        onCancel={() => setScreen('intro')}
      />
    );
  }

  // APPRECIATION CEREMONY SCREEN
  if (screen === 'appreciation') {
    return (
      <div className="vidya-container appreciation-ceremony">
        <div className="appreciation-header">
          <h1>🙏 Sampurna Shiksha 🙏</h1>
          <h2>Complete Mastery Achieved</h2>
        </div>

        <div className="appreciaton-message">
          <div className="guru-image-area">
            <div className="guru-silhouette">🧘 Guru Dronacharya 🧘</div>
          </div>
          <div className="guru-speaks">
            <p className="appreciation-text">{guruMessage}</p>
          </div>
        </div>

        <div className="vidya-completion-stats">
          <div className="stat-box">
            <h3>Lessons Mastered</h3>
            <p>{completedLessons.length}/{vidya.total_lessons}</p>
          </div>
          <div className="stat-box">
            <h3>Tests Passed</h3>
            <p>{completedTests.length}/{vidya.total_tests}</p>
          </div>
          <div className="stat-box">
            <h3>Status</h3>
            <p>Complete Master</p>
          </div>
        </div>

        <div className="completion-actions">
          <button className="btn-return" onClick={() => setScreen('intro')}>Return to Vidya Menu</button>
          <button className="btn-exit" onClick={onExit}>Return to Main</button>
        </div>
      </div>
    );
  }
}

export default VidyaModule;
