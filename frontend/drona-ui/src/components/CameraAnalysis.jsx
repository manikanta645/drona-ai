import React, { useState, useEffect, useRef } from 'react';
import './CameraAnalysis.css';

/**
 * CAMERA ANALYSIS - Real-time student analysis using camera
 * Guru analyzes student's posture, form, readiness, and provides feedback
 */
function CameraAnalysis({ studentName, mode = 'posture_analysis', onAnalysis }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [permission, setPermission] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const streamRef = useRef(null);

  // Request camera access
  useEffect(() => {
    requestCameraAccess();
    return () => {
      stopCamera();
    };
  }, []);

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission(true);
      setError(null);

      // Start continuous analysis
      startAnalysis();
    } catch (err) {
      setError(`Camera access denied: ${err.message}`);
      setPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    
    // Analyze student in real-time
    const analysisInterval = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Draw video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Simulate posture analysis (in production, would use ML model)
        const analysis_result = simulatePostureAnalysis();
        
        setAnalysis(analysis_result);
        
        if (onAnalysis) {
          onAnalysis(analysis_result);
        }

        // Generate feedback from analysis
        generateGuruFeedback(analysis_result);
      }
    }, 2000); // Analyze every 2 seconds

    return () => clearInterval(analysisInterval);
  };

  const simulatePostureAnalysis = () => {
    // This is a simulation - in production, use ML pose detection (TensorFlow.js or similar)
    // For demo, return analysis data
    return {
      timestamp: new Date(),
      readiness_level: Math.random() * 0.8 + 0.4, // 0.4 - 1.0
      posture_score: Math.random() * 0.9 + 0.3, // 0.3 - 1.2
      alignment: {
        spine: Math.random() > 0.5 ? 'good' : 'needs_correction',
        shoulders: Math.random() > 0.5 ? 'level' : 'uneven',
        feet: Math.random() > 0.5 ? 'grounded' : 'shifting',
      },
      focus_level: Math.random() * 0.7 + 0.3,
      breathing: {
        rate: Math.floor(Math.random() * 6 + 12), // 12-18 breaths per minute
        depth: Math.random() > 0.5 ? 'deep' : 'shallow',
      },
      observations: [
        'Standing with confidence',
        'Eyes focused on the task',
        'Minimal body sway',
        'Breathing becoming steady',
      ],
    };
  };

  const generateGuruFeedback = (analysisData) => {
    const feedbackLines = [];
    
    if (analysisData.readiness_level > 0.8) {
      feedbackLines.push("Your presence is focused. You are ready to learn.");
    } else if (analysisData.readiness_level > 0.6) {
      feedbackLines.push("Good readiness. Center yourself a bit more.");
    } else {
      feedbackLines.push("Your mind wanders. Bring your focus back to this moment.");
    }

    if (analysisData.alignment.spine === 'good') {
      feedbackLines.push("Your spine is straight - this is the foundation.");
    } else {
      feedbackLines.push("Straighten your spine. The spine is the pillar of all practice.");
    }

    if (analysisData.breathing.depth === 'deep') {
      feedbackLines.push("Good breathing. Deep breath means a calm mind.");
    } else {
      feedbackLines.push("Breathe more deeply. Let the breath steady your mind.");
    }

    setFeedback(feedbackLines.join(' '));
  };

  if (!permission) {
    return (
      <div className="camera-permission-denied">
        <div className="permission-message">
          <p>Camera access is required for the guru to analyze your form and guide your practice.</p>
          <p className="permission-info">Guru Dronacharya needs to see you to teach you effectively.</p>
          <button onClick={requestCameraAccess} className="btn-allow-camera">
            Allow Camera Access
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="camera-error">
        <p className="error-message">{error}</p>
        <button onClick={requestCameraAccess} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="camera-analysis-container">
      {/* STUDENT VIDEO FEED */}
      <div className="video-feed-wrapper">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="student-video-feed"
        />
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          style={{ display: 'none' }}
        />
        <div className="video-label">
          <span className="student-name">{studentName}</span>
          <span className="video-status">● Live</span>
        </div>
      </div>

      {/* REAL-TIME ANALYSIS DISPLAY */}
      {analysis && (
        <div className="analysis-overlay">
          <div className="analysis-metrics">
            <div className="metric">
              <span className="metric-label">Readiness</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${analysis.readiness_level * 100}%` }}
                />
              </div>
              <span className="metric-value">{Math.round(analysis.readiness_level * 100)}%</span>
            </div>

            <div className="metric">
              <span className="metric-label">Posture</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${Math.min(analysis.posture_score * 100, 100)}%` }}
                />
              </div>
              <span className="metric-value">{Math.round(analysis.posture_score * 100)}%</span>
            </div>

            <div className="metric">
              <span className="metric-label">Focus</span>
              <div className="metric-bar">
                <div
                  className="metric-fill"
                  style={{ width: `${analysis.focus_level * 100}%` }}
                />
              </div>
              <span className="metric-value">{Math.round(analysis.focus_level * 100)}%</span>
            </div>
          </div>

          {/* ALIGNMENT CHECKS */}
          <div className="alignment-check">
            <div className={`check-item ${analysis.alignment.spine === 'good' ? 'good' : 'needs-correction'}`}>
              <span className="check-icon">{'✓'}</span>
              <span className="check-label">Spine: {analysis.alignment.spine}</span>
            </div>
            <div className={`check-item ${analysis.alignment.shoulders === 'level' ? 'good' : 'needs-correction'}`}>
              <span className="check-icon">{'✓'}</span>
              <span className="check-label">Shoulders: {analysis.alignment.shoulders}</span>
            </div>
            <div className={`check-item ${analysis.alignment.feet === 'grounded' ? 'good' : 'needs-correction'}`}>
              <span className="check-icon">{'✓'}</span>
              <span className="check-label">Feet: {analysis.alignment.feet}</span>
            </div>
          </div>

          {/* BREATHING DISPLAY */}
          <div className="breathing-info">
            <span className="breathing-label">Breathing Rate: {analysis.breathing.rate} breaths/min</span>
            <span className={`breathing-depth ${analysis.breathing.depth}`}>
              {analysis.breathing.depth.charAt(0).toUpperCase() + analysis.breathing.depth.slice(1)} Breath
            </span>
          </div>
        </div>
      )}

      {/* GURU'S LIVE FEEDBACK */}
      {feedback && (
        <div className="guru-feedback-box">
          <h4 className="feedback-title">Guru's Observation</h4>
          <p className="feedback-text">{feedback}</p>
        </div>
      )}

      {/* OBSERVATIONS LIST */}
      {analysis && (
        <div className="observations">
          <h4>Guru's Observations:</h4>
          <ul>
            {analysis.observations.map((obs, idx) => (
              <li key={idx}>{obs}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CameraAnalysis;
