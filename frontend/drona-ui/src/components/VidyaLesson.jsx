import React, { useState, useEffect, useRef } from 'react';
import './VidyaLesson.css';
import CameraAnalysis from './CameraAnalysis';

/**
 * VIDYA LESSON - Individual lesson teaching with guru guidance and camera analysis
 */
function VidyaLesson({ vidya, lessonId, studentName, guruGreeting, onComplete, onCancel }) {
  const [lesson, setLesson] = useState(null);
  const [guruMessage, setGuruMessage] = useState(guruGreeting);
  const [showCamera, setShowCamera] = useState(true);
  const [studentReady, setStudentReady] = useState(false);
  const [lesson_phase, setLessonPhase] = useState('introduction'); // introduction, teaching, practice, reflection, completion
  const [practiceTime, setPracticeTime] = useState(0);
  const [notes, setNotes] = useState('');
  const timerRef = useRef(null);

  // Load lesson data
  useEffect(() => {
    const lessonData = vidya.lessons.find(l => l.id === lessonId);
    setLesson(lessonData);
  }, [lessonId, vidya]);

  // Timer for lesson duration
  useEffect(() => {
    if (lesson_phase === 'practice') {
      timerRef.current = setInterval(() => {
        setPracticeTime(t => t + 1);
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [lesson_phase]);

  const handleCameraAnalysis = (analysis) => {
    // Camera analysis shows student's posture, form, readiness
    if (analysis.readiness_level && analysis.readiness_level > 0.7) {
      setStudentReady(true);
    }
  };

  const startPractice = () => {
    setLessonPhase('practice');
    setPracticeTime(0);
  };

  const completePractice = () => {
    setLessonPhase('reflection');
    const minutes = Math.floor(practiceTime / 60);
    const seconds = practiceTime % 60;
    const performanceNote = `Practiced for ${minutes}m ${seconds}s with visible improvement in form.`;
    setNotes(performanceNote);
  };

  const submitLesson = () => {
    if (onComplete) {
      onComplete(notes);
    }
  };

  if (!lesson) {
    return <div className="lesson-loading">Loading lesson...</div>;
  }

  return (
    <div className="vidya-lesson-container">
      {/* GURU SECTION - Shows guru's face and voice */}
      <div className="guru-teaching-section">
        <div className="guru-video-area">
          <div className="guru-placeholder">
            <div className="guru-icon">🧙</div>
            <div className="guru-name">Guru Dronacharya</div>
            <div className="guru-status">Teaching Live</div>
          </div>
        </div>

        <div className="guru-speech">
          <h3 className="lesson-title">{lesson.title}</h3>
          <p className="lesson-description">{lesson.description}</p>
          
          <div className="guru-message-box">
            <p className="guru-text">{guruMessage}</p>
          </div>

          <div className="teaching-points">
            <h4>Key Points to Master:</h4>
            <ul>
              {lesson.teaching_points.map((point, idx) => (
                <li key={idx} className="teaching-point">
                  <span className="point-number">{idx + 1}.</span>
                  <span className="point-text">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* STUDENT SECTION - Camera and analysis */}
      <div className="student-analysis-section">
        <h3 className="section-title">Guru's Analysis of You</h3>
        
        {showCamera && (
          <CameraAnalysis
            studentName={studentName}
            mode="posture_analysis"
            onAnalysis={handleCameraAnalysis}
          />
        )}

        {!showCamera && (
          <div className="camera-placeholder">
            <p>Camera Access Required</p>
            <button onClick={() => setShowCamera(true)} className="btn-enable-camera">
              Enable Camera
            </button>
          </div>
        )}
      </div>

      {/* LESSON PHASE INDICATOR */}
      <div className="lesson-phase-indicator">
        <div className={`phase ${lesson_phase === 'introduction' ? 'active' : 'done'}`}>
          <span>1. Introduction</span>
        </div>
        <div className={`phase ${lesson_phase === 'teaching' ? 'active' : 'done'}`}>
          <span>2. Teaching</span>
        </div>
        <div className={`phase ${lesson_phase === 'practice' ? 'active' : 'done'}`}>
          <span>3. Practice</span>
        </div>
        <div className={`phase ${lesson_phase === 'reflection' ? 'active' : 'done'}`}>
          <span>4. Reflection</span>
        </div>
        <div className={`phase ${lesson_phase === 'completion' ? 'active' : ''}`}>
          <span>5. Completion</span>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="lesson-actions">
        {lesson_phase === 'introduction' && (
          <>
            <button
              className="btn-ready"
              onClick={() => {
                setLessonPhase('teaching');
              }}
            >
              I'm Ready to Learn
            </button>
            <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          </>
        )}

        {lesson_phase === 'teaching' && (
          <>
            <button
              className="btn-practice"
              onClick={startPractice}
            >
              Begin Practice
            </button>
            <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          </>
        )}

        {lesson_phase === 'practice' && (
          <>
            <div className="practice-timer">
              <span>Practice Time: {Math.floor(practiceTime / 60)}m {practiceTime % 60}s</span>
            </div>
            <button
              className="btn-complete-practice"
              onClick={completePractice}
            >
              Complete Practice
            </button>
          </>
        )}

        {lesson_phase === 'reflection' && (
          <>
            <div className="reflection-area">
              <h4>Practice Complete!</h4>
              <p>What did you learn from your practice? (Optional notes)</p>
              <textarea
                className="reflection-notes"
                placeholder="Describe your experience, what challenged you, what felt good..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button
              className="btn-submit-lesson"
              onClick={submitLesson}
            >
              Submit Lesson & Get Feedback
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VidyaLesson;
