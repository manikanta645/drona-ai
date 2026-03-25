# VIDYA SYSTEM INTEGRATION GUIDE
## Complete End-to-End Implementation Manual

**Version:** 1.0  
**Last Updated:** March 20, 2026  
**Status:** Production Ready  

---

## 📋 TABLE OF CONTENTS

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Backend Setup](#backend-setup)
4. [Frontend Integration](#frontend-integration)
5. [Component Integration Examples](#component-integration-examples)
6. [API Reference](#api-reference)
7. [Teaching Loop Implementation](#teaching-loop-implementation)
8. [Deployment & Testing](#deployment--testing)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 SYSTEM OVERVIEW

The VIDYA system is a complete AI-powered teaching platform that implements the 9-phase teaching loop:

```
Explain → Demonstrate → Practice → Observe → Analyze → Feedback → Retry → Pass → Next Lesson
```

### Key Features:
- ✅ Real-time pose analysis (MediaPipe integration)
- ✅ Adaptive difficulty scaling
- ✅ Multi-dimensional performance evaluation
- ✅ AI guru feedback with discipline-specific tones
- ✅ Progress tracking & analytics
- ✅ Student profile management
- ✅ Session-based learning
- ✅ RESTful API architecture

---

## 🏗️ ARCHITECTURE

### Backend Structure:
```
backend/
├── main.py                    # FastAPI app with CORS
├── vidya_api.py              # Complete VIDYA API endpoints
├── requirements.txt          # Python dependencies
└── vidya_engine/
    ├── models.py             # Data structures
    ├── lesson_engine.py      # Lesson management
    ├── pose_engine.py        # Pose detection & analysis
    ├── evaluation_engine.py  # Performance scoring
    ├── feedback_engine.py    # AI feedback generation
    ├── progress_tracker.py   # Analytics
    ├── adaptive_difficulty.py# Difficulty scaling
    └── teaching_loop.py      # Main orchestrator
```

### Frontend Structure:
```
frontend/drona-ui/src/
├── utils/
│   └── vidyaAPI.js           # API client
├── components/
│   ├── VidyaIntegratedPracticeMode.jsx  # Template component
│   ├── DhanurMode.jsx        # Archery submode
│   ├── KhadgaMode.jsx        # Sword submode
│   ├── DhyanaMode.jsx        # Meditation submode
│   └── ...                   # Other submodes
└── App.js                    # Session management
```

### Data Flow:
```
Student Interaction
        ↓
Frontend Component (React)
        ↓
vidyaAPI Client (JavaScript)
        ↓
RESTful API (FastAPI)
        ↓
VIDYA Engine (Python)
        ↓
Database/Storage
        ↓
Response with Feedback & Evaluation
```

---

## 🚀 BACKEND SETUP

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Verify VIDYA Engine Modules

Ensure all modules are present:
```bash
python -c "from vidya_engine.models import StudentProfile; print('✓ Models loaded')"
python -c "from vidya_engine.lesson_engine import LessonEngine; print('✓ Lesson engine loaded')"
```

### Step 3: Start Backend Server

```bash
python main.py
```

Expected output:
```
[INFO] Initializing DRONA - Digital Repository Of National Arts
[INFO] Mode: AI-Only (Using Local Ollama HTTP API)
[INFO] VIDYA API endpoints registered successfully
[INFO] Server starting on http://localhost:8000
```

### Step 4: Verify API Health

```bash
curl http://localhost:8000/api/vidya/health
```

Response:
```json
{
  "status": "healthy",
  "service": "VIDYA API",
  "students_count": 0,
  "active_sessions": 0
}
```

---

## 💻 FRONTEND INTEGRATION

### Step 1: Import API Client in App.js

```javascript
import vidyaAPI from './utils/vidyaAPI';
```

### Step 2: Add Session State to App.js

Already done! The following state variables are added:
```javascript
const [studentId, setStudentId] = useState(localStorage.getItem('studentId') || '');
const [sessionId, setSessionId] = useState(null);
const [currentSessionData, setCurrentSessionData] = useState(null);
const [vidyaSessionActive, setVidyaSessionActive] = useState(false);
const [currentLesson, setCurrentLesson] = useState(null);
const [attemptNumber, setAttemptNumber] = useState(1);
const [sessionStartTime, setSessionStartTime] = useState(null);
const [guruFeedback, setGuruFeedback] = useState('');
const [lessonPassed, setLessonPassed] = useState(false);
const [studentProfile, setStudentProfile] = useState(null);
const [vidyaProgress, setVidyaProgress] = useState({});
```

### Step 3: Session Management Functions

Functions are already added to App.js:

```javascript
// Initialize student profile
await initializeVidyaStudent(studentName, 'beginner');

// Get student profile
await getStudentProfile();

// Start a teaching session
await startVidyaSession('dhanur', 'stance');

// Submit practice attempt
await submitVidyaPractice(poseData, textAnswer);

// End session
await endVidyaSession();

// Get progress
await getVidyaProgress('dhanur');
```

### Step 4: Pass Functions to Components

```javascript
<VidyaIntegratedPracticeMode
  studentId={studentId}
  vidyaId="dhanur"
  lessonId="stance"
  startVidyaSession={startVidyaSession}
  submitVidyaPractice={submitVidyaPractice}
  endVidyaSession={endVidyaSession}
  isLoading={loading}
/>
```

---

## 📦 COMPONENT INTEGRATION EXAMPLES

### Example 1: Update DhanurMode to Use Backend

**Before (Chatbot-based):**
```javascript
const handleShootArrow = () => {
  const newAccuracy = Math.min(100, accuracy + Math.random() * 20);
  setAccuracy(newAccuracy);
  askDrona(`I fired a shot. Accuracy: ${newAccuracy.toFixed(0)}%`);
};
```

**After (Backend-integrated):**
```javascript
const handleShootArrow = async () => {
  const poseData = {
    landmarks: mediaPipeLandmarks, // From camera
    frame_timestamp: Date.now() / 1000
  };
  
  try {
    const result = await submitVidyaPractice(poseData, 'arrow_shot');
    
    setAccuracy(result.performance_score);
    setFeedback(result.feedback);
    
    if (result.passed) {
      setLessonComplete(true);
    } else {
      setAttemptNumber(attemptNumber + 1);
    }
  } catch (error) {
    console.error('Failed to record shot:', error);
  }
};
```

### Example 2: Complete DhanurMode with Backend

```javascript
import React, { useState, useEffect, useRef } from 'react';
import './DhanurMode.css';
import vidyaAPI from '../utils/vidyaAPI';

const DhanurMode = ({ 
  studentId,
  startVidyaSession,
  submitVidyaPractice,
  endVidyaSession
}) => {
  const [sessionActive, setSessionActive] = useState(false);
  const [lesson, setLesson] = useState(null);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState('');
  const videoRef = useRef(null);

  // Load lesson on mount
  useEffect(() => {
    loadLesson();
  }, []);

  const loadLesson = async () => {
    try {
      const lesson = await vidyaAPI.lesson.get('dhanur', 'stance');
      setLesson(lesson);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    }
  };

  const handleStartSession = async () => {
    try {
      const session = await startVidyaSession('dhanur', 'stance', studentId);
      setSessionActive(true);
      setFeedback(lesson?.instructions);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const handleShootArrow = async () => {
    if (!sessionActive) return;

    try {
      // In real implementation, capture from camera
      const poseData = await capturePoseFromVideo(videoRef.current);
      
      const result = await submitVidyaPractice(
        poseData,
        null,
        studentId
      );

      setAccuracy(result.performance_score);
      setFeedback(result.feedback);

      if (result.passed) {
        setFeedback('✨ Lesson Complete! Moving to next...');
        setTimeout(() => {
          endVidyaSession();
          setSessionActive(false);
        }, 2000);
      }
    } catch (error) {
      setFeedback('Error recording shot. Please try again.');
    }
  };

  if (!sessionActive) {
    return (
      <div className="dhanur-container">
        <button onClick={handleStartSession}>Start Dhanur Lesson</button>
        {lesson && <p>{lesson.description}</p>}
      </div>
    );
  }

  return (
    <div className="dhanur-container">
      <h2>🏹 Dhanur Vidya - Archery</h2>
      <div className="accuracy-display">
        <p>Accuracy: {accuracy.toFixed(0)}%</p>
      </div>
      <div className="feedback-box">
        <p>{feedback}</p>
      </div>
      <button onClick={handleShootArrow}>
        Fire Arrow
      </button>
    </div>
  );
};

export default DhanurMode;
```

### Example 3: Initialize Student on App Load

In `App.js`, add to useEffect:

```javascript
useEffect(() => {
  if (studentName && !studentId) {
    // Initialize new student in VIDYA system
    initializeVidyaStudent(studentName, 'beginner')
      .then((sid) => {
        console.log('Student initialized:', sid);
        getStudentProfile(sid);
      })
      .catch((error) => console.error('Initialization failed:', error));
  }
}, [studentName, studentId]);
```

---

## 📚 API REFERENCE

### Student Management

#### Create Student
```javascript
const response = await vidyaAPI.student.create(
  'Arjun',           // name
  'beginner',        // level
  'dhanur'          // currentVidya
);
// Returns: { student_id, student_name, level, message }
```

#### Get Student Profile
```javascript
const profile = await vidyaAPI.student.get(studentId);
// Returns: { student_id, name, level, current_vidya, overall_score, ... }
```

#### Get Student Dashboard
```javascript
const dashboard = await vidyaAPI.student.getDashboard(studentId);
// Returns: { overall_score, lessons_completed, vidya_progress, ... }
```

### Lesson Management

#### Get All Lessons
```javascript
const lessons = await vidyaAPI.lesson.getAll('dhanur');
// Returns: { vidya_id, total_lessons, lessons: [...] }
```

#### Get Lesson Details
```javascript
const lesson = await vidyaAPI.lesson.get('dhanur', 'stance');
// Returns: { name, description, instructions, practice_task, ... }
```

#### Get Next Lesson
```javascript
const next = await vidyaAPI.lesson.getNextLesson(studentId);
// Returns: { lesson_id, name, description, ... }
```

### Session Management

#### Start Session
```javascript
const session = await vidyaAPI.session.start(
  studentId,
  'dhanur',      // vidyaId
  'stance'      // lessonId
);
// Returns: { session_id, status, explanation, demonstration, ... }
```

#### Submit Practice
```javascript
const result = await vidyaAPI.session.submitPractice(
  sessionId,
  studentId,
  'dhanur',
  'stance',
  poseData,      // optional
  textAnswer,    // optional
  timeTaken,     // seconds
  attemptNumber
);
// Returns: { performance_score, passed, feedback, corrections, ... }
```

#### End Session
```javascript
const result = await vidyaAPI.session.end(sessionId);
// Returns: { session_id, status, duration, student_progress }
```

### Performance & Feedback

#### Analyze Pose
```javascript
const analysis = await vidyaAPI.pose.analyze(
  landmarks,     // Array of keypoints
  frameTimestamp,
  frameBase64   // optional
);
```

#### Submit Performance
```javascript
const evaluation = await vidyaAPI.performance.submit(
  studentId,
  'dhanur',
  'stance',
  poseData,
  textAnswer,
  timeTaken,
  attemptNumber
);
```

#### Generate Feedback
```javascript
const feedback = await vidyaAPI.feedback.generate(
  studentId,
  'dhanur',
  performanceScore,
  mistakes,
  strengths
);
// Returns: { performance_level, feedback_text, tone, corrections, ... }
```

---

## 🧠 TEACHING LOOP IMPLEMENTATION

### Phase 1: EXPLANATION
Guru explains the lesson to the student.

```javascript
// Backend: teaching_loop.py
explanation = teaching_loop_controller.explain_lesson(student, lesson)

// Frontend: Display explanation
<div className="explanation-phase">
  <h2>Guru's Explanation</h2>
  <p>{sessionData.explanation}</p>
</div>
```

### Phase 2: DEMONSTRATION
Guru shows how to do it.

```javascript
// Backend: teaching_loop.py
demonstration = teaching_loop_controller.demonstrate_lesson(lesson)

// Frontend: Show video/animation
<video src={demonstration.video_url}></video>
```

### Phase 3: PRACTICE
Student practices the skill.

```javascript
// Frontend: Capture pose from camera
const poseData = await capturePoseFromVideo(videoRef.current);

// Submit to backend
const result = await submitVidyaPractice(poseData);
```

### Phase 4: OBSERVE & ANALYZE
Backend analyzes performance.

```javascript
# Backend: evaluation_engine.py
evaluation = performance_evaluator.evaluate_performance(
    student_profile=student,
    pose_data=pose_data,
    answer_data=answer_data,
    time_taken=time_taken
)
```

### Phase 5: FEEDBACK
AI guru provides personalized feedback.

```javascript
// Backend: feedback_engine.py
feedback = feedback_engine.generate_feedback(
    student_profile=student,
    performance_score=score,
    mistakes=mistakes,
    strengths=strengths,
    vidya_id=vidya_id
)

// Frontend: Display feedback
<div className="feedback-phase">
  <p>{feedback.feedback_text}</p>
</div>
```

### Phase 6: RETRY or PASS
Based on score, student retries or passes.

```javascript
if (performanceScore >= 80) {
  // Phase 7 & 8: PASS & Next Lesson
  const nextLesson = await lessonAPI.getNextLesson(studentId);
} else {
  // Phase 6: RETRY
  setAttemptNumber(attemptNumber + 1);
  resetPracticeUI();
}
```

---

## 🚢 DEPLOYMENT & TESTING

### Backend Testing

```bash
# Test API endpoints
python -m pytest backend/tests/

# Manual test
curl -X POST http://localhost:8000/api/vidya/student/create \
  -H "Content-Type: application/json" \
  -d '{"name": "Arjun", "level": "beginner"}'
```

### Frontend Testing

```bash
# Start frontend
cd frontend/drona-ui
npm start

# Test in browser
http://localhost:3000
```

### Integration Test

```javascript
// Test complete flow
(async () => {
  // 1. Create student
  const student = await vidyaAPI.student.create('Test Student', 'beginner');
  console.log('✓ Student created');

  // 2. Start session
  const session = await vidyaAPI.session.start(
    student.student_id,
    'dhanur',
    'stance'
  );
  console.log('✓ Session started');

  // 3. Submit practice
  const result = await vidyaAPI.session.submitPractice(
    session.session_id,
    student.student_id,
    'dhanur',
    'stance',
    null,
    'practiced',
    30,
    1
  );
  console.log('✓ Practice submitted');

  // 4. Check feedback
  console.log('Feedback:', result.feedback);
})();
```

---

## 🔧 TROUBLESHOOTING

### Issue 1: API Connection Failed

```
Error: Failed to fetch from API
```

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/api/vidya/health`
2. Check CORS settings in main.py
3. Verify API_BASE_URL in vidyaAPI.js

### Issue 2: Student ID Not Persisting

```
Error: Student ID lost after reload
```

**Solution:**
```javascript
// Ensure localStorage is set
localStorage.setItem('studentId', response.student_id);

// Retrieve on app load
const studentId = localStorage.getItem('studentId');
```

### Issue 3: Camera Access Denied

```
Error: Camera permission denied
```

**Solution:**
1. Check browser permissions
2. Use HTTPS (required for camera)
3. Fallback to pose simulation

### Issue 4: Pose Analysis Not Working

```
Error: Landmarks not properly formatted
```

**Solution:**
```javascript
// Ensure landmarks are in correct format
const landmarks = [
  { x: 0.5, y: 0.5, z: 0.0, visibility: 1.0 },
  // ... 32 more landmarks
];

// Verify with backend
const analysis = await vidyaAPI.pose.analyze(landmarks, Date.now() / 1000);
```

### Issue 5: Session Timeout

```
Error: Session not found
```

**Solution:**
1. Check session TTL (Time To Live) settings
2. Extend session on each API call
3. Implement session refresh

---

## 📊 MONITORING & ANALYTICS

### Track Student Progress

```javascript
// Get student analytics
const progress = await vidyaAPI.progress.getVidyaProgress(studentId, 'dhanur');
console.log('Lessons completed:', progress.lessons_completed);
console.log('Average score:', progress.average_score);
console.log('Best score:', progress.best_score);
console.log('Improvement trend:', progress.improvement_trend);
```

### Monitor API Performance

```javascript
// Add timing to API calls
const start = performance.now();
const result = await vidyaAPI.session.start(studentId, vidyaId, lessonId);
const duration = performance.now() - start;
console.log(`API call took ${duration}ms`);
```

---

## 🎓 BEST PRACTICES

1. **Always initialize student** before starting sessions
2. **Store studentId** in localStorage for persistence
3. **Handle errors gracefully** with user-friendly messages
4. **Implement loading states** during async operations
5. **Track session time** for adaptive difficulty
6. **Cache lesson data** to reduce API calls
7. **Implement retry logic** for failed requests
8. **Monitor API performance** and optimize slow endpoints
9. **Test with real camera** for pose analysis
10. **Validate input data** before sending to backend

---

## 🚀 NEXT STEPS

1. ✅ Update remaining mode components (KhadgaMode, DhyanaMode, etc.)
2. ✅ Implement voice commands for hands-free operation
3. ✅ Add analytics dashboard
4. ✅ Implement gamification (badges, leaderboards)
5. ✅ Add media storage (video recordings, progress reports)
6. ✅ Deploy to production server
7. ✅ Monitor student engagement and adjust difficulty
8. ✅ Gather feedback and iterate

---

**For support and questions, refer to the main README.md or contact the development team.**
