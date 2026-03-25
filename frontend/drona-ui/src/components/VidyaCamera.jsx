import React, { useRef, useEffect, useState } from 'react';
import './VidyaCamera.css';

const VidyaCamera = ({ 
  vidya, 
  mode = 'practice',
  onFrameCapture = null,
  showFeedback = true,
  analysisMode = 'realtime'
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [permission, setPermission] = useState('pending');
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Initialize camera
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
          setPermission('granted');
        }
      } catch (error) {
        console.error('Camera access denied:', error);
        setPermission('denied');
      }
    };

    if (permission === 'pending') {
      initializeCamera();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [permission]);

  // Analyze current frame
  const captureFrame = async () => {
    if (!cameraActive || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const video = videoRef.current;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // In a real implementation, this would send to backend for vision analysis
    // For now, we'll simulate analysis
    setIsAnalyzing(true);
    setTimeout(() => {
      simulateAnalysis();
      setIsAnalyzing(false);
    }, 1000);
  };

  // Simulate form analysis (in production, send to Ollama vision API)
  const simulateAnalysis = () => {
    const analyses = {
      dhanur: {
        posture_score: Math.floor(Math.random() * 30) + 70, // 70-100
        issues: ['shoulder-alignment', 'grip-tension'],
        feedback: 'Your stance shows improvement. Lower your shoulders slightly and relax your grip.',
        positives: ['Balance is good', 'Head position is correct']
      },
      khadga: {
        posture_score: Math.floor(Math.random() * 20) + 75,
        issues: ['elbow-angle'],
        feedback: 'Your sword arm angle is improving. Extend your elbow slightly more.',
        positives: ['Footwork is solid', 'Guard position is strong']
      },
      gada: {
        posture_score: Math.floor(Math.random() * 25) + 70,
        issues: ['weight-distribution'],
        feedback: 'Shift your weight forward slightly during the swing.',
        positives: ['Grip is firm', 'Core stability is good']
      }
    };

    const analysis = analyses[vidya] || analyses.dhanur;
    setAnalysisData(analysis);
    setFeedback(analysis.feedback);
  };

  if (permission === 'denied') {
    return (
      <div className="camera-permission-denied">
        <div className="denied-content">
          <h3>📹 Camera Access Required</h3>
          <p>This practice mode requires camera access to analyze your form.</p>
          <p>Please enable camera permissions in your browser settings.</p>
          <p className="camera-help">
            Note: We only analyze your form in real-time. No recording is saved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="vidya-camera-container">
      <div className="camera-layout">
        {/* Video Feed Section */}
        <div className="video-section">
          <div className="video-wrapper">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="video-feed"
            />
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              style={{ display: 'none' }}
            />
            
            {/* Analysis Overlay */}
            {analysisData && (
              <div className="analysis-overlay">
                <div className="score-badge">
                  <span className="score-label">Form Score</span>
                  <span className={`score-value ${analysisData.posture_score >= 80 ? 'excellent' : 'good'}`}>
                    {analysisData.posture_score}%
                  </span>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="analyzing-indicator">
                <div className="spinner"></div>
                <p>Analyzing your form...</p>
              </div>
            )}
          </div>

          <div className="camera-controls">
            <button
              className="capture-btn"
              onClick={captureFrame}
              disabled={!cameraActive || isAnalyzing}
            >
              {isAnalyzing ? '⏳ Analyzing...' : '📸 Analyze Form'}
            </button>
          </div>
        </div>

        {/* Feedback Section */}
        {showFeedback && (
          <div className="feedback-section">
            {analysisData ? (
              <div className="analysis-feedback">
                <div className="feedback-header">
                  <h3>Guru's Analysis</h3>
                  <div className={`score-indicator ${analysisData.posture_score >= 80 ? 'excellent' : 'good'}`}>
                    {analysisData.posture_score}% 
                    {analysisData.posture_score >= 85 ? ' ⭐' : analysisData.posture_score >= 75 ? ' ✓' : ''}
                  </div>
                </div>

                {/* What's Good */}
                <div className="positives-box">
                  <h4>✅ What's Good</h4>
                  <ul>
                    {analysisData.positives.map((pos, idx) => (
                      <li key={idx}>{pos}</li>
                    ))}
                  </ul>
                </div>

                {/* Main Feedback */}
                <div className="feedback-message">
                  <p className="guru-voice">
                    <strong>Dronacharya:</strong> "{analysisData.feedback}"
                  </p>
                </div>

                {/* Areas to Improve */}
                {analysisData.issues.length > 0 && (
                  <div className="issues-box">
                    <h4>🎯 Areas to Improve</h4>
                    <ul>
                      {analysisData.issues.map((issue, idx) => (
                        <li key={idx}>
                          {issue.replace(/-/g, ' ').toUpperCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Practice Tips */}
                <div className="practice-tips">
                  <h4>💪 Practice Tips</h4>
                  <p>Try again with the feedback in mind. Each repetition refines your form.</p>
                </div>
              </div>
            ) : (
              <div className="feedback-empty">
                <div className="empty-state">
                  <h3>📸 Ready for Analysis</h3>
                  <p>Click "Analyze Form" to let Guru Dronacharya evaluate your technique.</p>
                  <p className="camera-hint">Position yourself clearly in the camera frame first.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VidyaCamera;
