/**
 * VIDYA API CLIENT
 * Handles all API calls to the DRONA backend VIDYA system
 * Manages student sessions, lessons, performance tracking, and feedback
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const VIDYA_API = `${API_BASE_URL}/api/vidya`;

// ============================================================================
// ERROR HANDLING
// ============================================================================

class VidyaAPIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'VidyaAPIError';
    this.status = status;
    this.data = data;
  }
}

const handleAPIError = async (response) => {
  const data = await response.json();
  throw new VidyaAPIError(
    data.detail || 'API Error',
    response.status,
    data
  );
};

// ============================================================================
// STUDENT MANAGEMENT
// ============================================================================

export const studentAPI = {
  /**
   * Create a new student profile
   */
  create: async (name, level = 'beginner', currentVidya = 'dhanur') => {
    const response = await fetch(`${VIDYA_API}/student/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        level,
        current_vidya: currentVidya
      })
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Get student profile and progress
   */
  get: async (studentId) => {
    const response = await fetch(`${VIDYA_API}/student/${studentId}`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Get student learning dashboard
   */
  getDashboard: async (studentId) => {
    const response = await fetch(`${VIDYA_API}/dashboard/${studentId}`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// LESSON MANAGEMENT
// ============================================================================

export const lessonAPI = {
  /**
   * Get all lessons for a Vidya
   */
  getAll: async (vidyaId) => {
    const response = await fetch(`${VIDYA_API}/lessons/${vidyaId}`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Get specific lesson details
   */
  get: async (vidyaId, lessonId) => {
    const response = await fetch(`${VIDYA_API}/lesson/${vidyaId}/${lessonId}`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Get next recommended lesson for student
   */
  getNextLesson: async (studentId) => {
    const response = await fetch(`${VIDYA_API}/next-lesson/${studentId}`, {
      method: 'POST'
    });
    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// POSE ANALYSIS
// ============================================================================

export const poseAPI = {
  /**
   * Analyze pose from landmarks
   */
  analyze: async (landmarks, frameTimestamp, frameBase64 = null) => {
    const response = await fetch(`${VIDYA_API}/analyze-pose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landmarks,
        frame_timestamp: frameTimestamp,
        video_frame_base64: frameBase64
      })
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Validate pose against Vidya-specific rules
   */
  validate: async (vidyaId, landmarks, frameTimestamp) => {
    const response = await fetch(`${VIDYA_API}/validate-pose/${vidyaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landmarks,
        frame_timestamp: frameTimestamp
      })
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// PERFORMANCE EVALUATION
// ============================================================================

export const performanceAPI = {
  /**
   * Submit performance and get evaluation
   */
  submit: async (
    studentId,
    vidyaId,
    lessonId,
    poseData = null,
    textAnswer = null,
    timeTaken = 0,
    attemptNumber = 1
  ) => {
    const response = await fetch(`${VIDYA_API}/evaluate-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        vidya_id: vidyaId,
        lesson_id: lessonId,
        pose_data: poseData,
        text_answer: textAnswer,
        time_taken: timeTaken,
        attempt_number: attemptNumber
      })
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// FEEDBACK
// ============================================================================

export const feedbackAPI = {
  /**
   * Generate guru feedback based on performance
   */
  generate: async (
    studentId,
    vidyaId,
    performanceScore,
    mistakes = [],
    strengths = []
  ) => {
    const response = await fetch(
      `${VIDYA_API}/generate-feedback?` +
      `student_id=${studentId}&` +
      `vidya_id=${vidyaId}&` +
      `performance_score=${performanceScore}` +
      `${mistakes.length > 0 ? `&mistakes=${JSON.stringify(mistakes)}` : ''}` +
      `${strengths.length > 0 ? `&strengths=${JSON.stringify(strengths)}` : ''}`
    );

    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

export const progressAPI = {
  /**
   * Get student progress in a Vidya
   */
  getVidyaProgress: async (studentId, vidyaId) => {
    const response = await fetch(`${VIDYA_API}/progress/${studentId}/${vidyaId}`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// ADAPTIVE DIFFICULTY
// ============================================================================

export const difficultyAPI = {
  /**
   * Adjust difficulty based on performance
   */
  adjust: async (studentId, vidyaId) => {
    const response = await fetch(`${VIDYA_API}/adjust-difficulty/${studentId}/${vidyaId}`, {
      method: 'POST'
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// TEACHING SESSION
// ============================================================================

export const sessionAPI = {
  /**
   * Start a new teaching session
   */
  start: async (studentId, vidyaId, lessonId) => {
    const response = await fetch(
      `${VIDYA_API}/start-session/${studentId}/${vidyaId}/${lessonId}`,
      { method: 'POST' }
    );

    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Submit practice attempt and get feedback
   */
  submitPractice: async (
    sessionId,
    studentId,
    vidyaId,
    lessonId,
    poseData = null,
    textAnswer = null,
    timeTaken = 0,
    attemptNumber = 1
  ) => {
    const response = await fetch(`${VIDYA_API}/submit-practice/${sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        vidya_id: vidyaId,
        lesson_id: lessonId,
        pose_data: poseData,
        text_answer: textAnswer,
        time_taken: timeTaken,
        attempt_number: attemptNumber
      })
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * End a teaching session
   */
  end: async (sessionId) => {
    const response = await fetch(`${VIDYA_API}/end-session/${sessionId}`, {
      method: 'POST'
    });

    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// UTILITY
// ============================================================================

export const utilityAPI = {
  /**
   * Get all available Vidyas
   */
  getVidyas: async () => {
    const response = await fetch(`${VIDYA_API}/vidyas`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await fetch(`${VIDYA_API}/health`);
    if (!response.ok) await handleAPIError(response);
    return response.json();
  }
};

// ============================================================================
// EXPORT ALL APIS
// ============================================================================

export const vidyaAPI = {
  student: studentAPI,
  lesson: lessonAPI,
  pose: poseAPI,
  performance: performanceAPI,
  feedback: feedbackAPI,
  progress: progressAPI,
  difficulty: difficultyAPI,
  session: sessionAPI,
  utility: utilityAPI,
  VidyaAPIError
};

export default vidyaAPI;
