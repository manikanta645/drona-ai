import React, { useEffect, useRef, useState } from 'react';
import './GuruCameraMonitor.css';

const GuruCameraMonitor = ({ 
  vidyaId, 
  lessonTitle,
  studentName,
  onFeedback,
  speak,
  detectLanguage,
  isActive = true,
  autoAnalyze = true
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const analysisIntervalRef = useRef(null);
  const lastSpokenFeedbackRef = useRef('');
  const lastSpokenAtRef = useRef(0);

  // Initialize camera
  useEffect(() => {
    if (!isActive) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 720 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        setFeedback('📷 Camera access required for guru feedback');
      }
    };

    initCamera();

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const videoElement = videoRef.current;
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Auto-analyze frames every second
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!autoAnalyze || !cameraActive || !isActive) return;

    analysisIntervalRef.current = setInterval(() => {
      if (!analyzing) {
        analyzeFrame();
      }
    }, 1000); // Analyze every second

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [autoAnalyze, cameraActive, isActive, analyzing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Capture and analyze frame
  const analyzeFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return;

    try {
      setAnalyzing(true);
      setFrameCount(prev => prev + 1);

      const context = canvasRef.current.getContext('2d');
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const imageData = canvasRef.current.toDataURL('image/jpeg', 0.7);

      // Send to backend for guru analysis
      const response = await fetch('http://localhost:8000/analyze-pose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_name: studentName,
          vidya_id: vidyaId,
          lesson_title: lessonTitle,
          frame_image: imageData,
          frame_count: frameCount
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.feedback) {
          setFeedback(data.feedback);
          if (onFeedback) {
            onFeedback(data.feedback);
          }
          if (speak) {
            const now = Date.now();
            if (
              data.feedback !== lastSpokenFeedbackRef.current &&
              now - lastSpokenAtRef.current > 4500
            ) {
              const lang = typeof detectLanguage === 'function' ? detectLanguage(data.feedback) : 'en';
              speak(data.feedback, lang);
              lastSpokenFeedbackRef.current = data.feedback;
              lastSpokenAtRef.current = now;
            }
          }
        }
      }
    } catch (error) {
      console.error('Pose analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="guru-camera-monitor">
      <div className="camera-container">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-feed"
          />
          <canvas
            ref={canvasRef}
            width={720}
            height={480}
            style={{ display: 'none' }}
          />
          
          {!cameraActive && (
            <div className="camera-error">
              <p>📷 Camera not available</p>
              <p>Enable camera access for guru feedback</p>
            </div>
          )}
        </div>

      </div>

      {feedback && (
        <div className="guru-feedback-dock">
          <div className="feedback-card">
            <div className="feedback-header">
              <span className="guru-icon">👨‍🏫</span>
              <span className="guru-title">Drona's Observation</span>
            </div>
            <div className="feedback-content">
              <p>{feedback}</p>
            </div>
            <div className="feedback-footer">
              <span className="frame-count">Frame: {frameCount}</span>
              {analyzing && <span className="analyzing">🔍 Analyzing...</span>}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="camera-status-bar">
        <div className="status-item">
          <span className={`indicator ${cameraActive ? 'active' : 'inactive'}`}></span>
          <span>{cameraActive ? 'Camera Active' : 'Camera Inactive'}</span>
        </div>
        <div className="status-item">
          <span className="frame-indicator">{frameCount} frames analyzed</span>
        </div>
        <div className="status-item">
          {analyzing && (
            <span className="analyzing-spinner">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuruCameraMonitor;
