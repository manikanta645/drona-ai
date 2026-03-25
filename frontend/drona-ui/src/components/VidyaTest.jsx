import React, { useState, useEffect, useRef } from 'react';
import './VidyaTest.css';
import CameraAnalysis from './CameraAnalysis';

/**
 * VIDYA TEST - Test execution with guru assessment and real-time analysis
 */
function VidyaTest({ vidya, testId, studentName, guruInstructions, onComplete, onCancel }) {
  const [test, setTest] = useState(null);
  const [testState, setTestState] = useState('introduction'); // introduction, executing, analysis, reflection
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [studentFeedback, setStudentFeedback] = useState('');
  const timerRef = useRef(null);

  // Load test data
  useEffect(() => {
    const testData = vidya.tests.find(t => t.id === testId);
    setTest(testData);
    if (testData) {
      setTimeRemaining(testData.duration_minutes * 60);
    }
  }, [testId, vidya]);

  // Timer management
  useEffect(() => {
    if (testState === 'executing' && testStarted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(t => {
          if (t <= 1) {
            endTest();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [testState, testStarted]);

  const startTest = () => {
    setTestStarted(true);
    setTestState('executing');
  };

  const endTest = () => {
    setTestState('analysis');
    // Simulate performance analysis
    simulateTestPerformance();
  };

  const simulateTestPerformance = () => {
    if (!test) return;

    const performanceData = {
      test_name: test.title,
      duration: test.duration_minutes,
      time_taken: Math.floor((test.duration_minutes * 60 - timeRemaining) / 60),
      accuracy: Math.random() * 0.4 + 0.6, // 60-100%
      consistency: Math.random() * 0.3 + 0.65, // 65-95%
      form_quality: Math.random() * 0.25 + 0.7, // 70-95%
      results: [],
    };

    // Check against passing criteria
    Object.keys(test.passing_criteria).forEach(criterion => {
      performanceData.results.push({
        criterion: criterion,
        target: test.passing_criteria[criterion],
        achieved: Math.random() > 0.3,
      });
    });

    setPerformance(performanceData);
  };

  const completeTest = () => {
    // Determine if test passed
    const passed = performance && 
      performance.results.filter(r => r.achieved).length >= Math.ceil(performance.results.length * 0.8);
    
    if (onComplete) {
      onComplete({
        test_id: testId,
        test_name: test.title,
        passed: passed,
        performance: performance,
        feedback: studentFeedback,
      });
    }
  };

  if (!test) {
    return <div className="test-loading">Loading test...</div>;
  }

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const totalDuration = test.duration_minutes * 60;
  const progressPercent = ((totalDuration - timeRemaining) / totalDuration) * 100;

  // INTRODUCTION PHASE
  if (testState === 'introduction') {
    return (
      <div className="vidya-test-container introduction-phase">
        <div className="test-header">
          <h2 className="test-title">{test.title}</h2>
          <p className="test-description">{test.description}</p>
        </div>

        <div className="guru-instructions-box">
          <h3>Guru's Instructions</h3>
          <p className="instructions">{guruInstructions}</p>
        </div>

        <div className="test-criteria">
          <h3>Passing Criteria:</h3>
          <ul>
            {Object.keys(test.passing_criteria).map(key => (
              <li key={key} className="criteria-item">
                <span className="criteria-key">{key}:</span>
                <span className="criteria-value">{test.passing_criteria[key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="test-info">
          <div className="info-box">
            <h4>Duration</h4>
            <p>{test.duration_minutes} minutes</p>
          </div>
          <div className="info-box">
            <h4>Type</h4>
            <p>{test.test_type}</p>
          </div>
        </div>

        <div className="test-actions">
          <button className="btn-start-test" onClick={startTest}>
            Ready to Take Test
          </button>
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  // EXECUTING PHASE - Test in progress with camera analysis
  if (testState === 'executing') {
    return (
      <div className="vidya-test-container executing-phase">
        <div className="test-header-executing">
          <h2>{test.title}</h2>
          <div className="test-timer-status">
            <div className="timer-display">
              <span className="timer-value">{minutes}:{seconds.toString().padStart(2, '0')}</span>
              <span className="timer-label">Time Remaining</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CAMERA ANALYSIS DURING TEST */}
        <div className="test-camera-section">
          <CameraAnalysis
            studentName={studentName}
            mode="stress_accuracy"
            onAnalysis={(analysis) => {
              // Real-time performance tracking during test
            }}
          />
        </div>

        <div className="test-monitoring">
          <h3>Guru is Watching</h3>
          <p>Your form, accuracy, and consistency are being observed and assessed.</p>
        </div>

        <div className="test-actions-executing">
          <button className="btn-stop-test" onClick={endTest}>
            Complete Test
          </button>
        </div>
      </div>
    );
  }

  // ANALYSIS PHASE - Test results and guru feedback
  if (testState === 'analysis' && performance) {
    const passed = performance.results.filter(r => r.achieved).length >= Math.ceil(performance.results.length * 0.8);

    return (
      <div className="vidya-test-container analysis-phase">
        <div className={`test-result ${passed ? 'passed' : 'failed'}`}>
          <h2>{passed ? '🎉 Test Passed!' : '⚠️ Test Not Passed'}</h2>
        </div>

        <div className="performance-summary">
          <div className="summary-box">
            <h4>Accuracy</h4>
            <p className="metric-value">{Math.round(performance.accuracy * 100)}%</p>
          </div>
          <div className="summary-box">
            <h4>Consistency</h4>
            <p className="metric-value">{Math.round(performance.consistency * 100)}%</p>
          </div>
          <div className="summary-box">
            <h4>Form Quality</h4>
            <p className="metric-value">{Math.round(performance.form_quality * 100)}%</p>
          </div>
          <div className="summary-box">
            <h4>Time Used</h4>
            <p className="metric-value">{performance.time_taken}/{performance.duration} min</p>
          </div>
        </div>

        <div className="criteria-results">
          <h3>Evaluation Against Criteria:</h3>
          <ul>
            {performance.results.map((result, idx) => (
              <li key={idx} className={`result-item ${result.achieved ? 'achieved' : 'not-achieved'}`}>
                <span className="result-icon">{result.achieved ? '✓' : '✗'}</span>
                <span className="result-criterion">{result.criterion}</span>
                <span className="result-target">{result.target}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="guru-feedback-on-test">
          <h3>Guru's Feedback</h3>
          <div className="feedback-message">
            {passed ? (
              <p>
                Well done, Shishya. You have demonstrated mastery of this test.
                Your dedication is visible in your form. Continue forward.
              </p>
            ) : (
              <p>
                Not yet, Shishya. The test revealed areas needing more practice.
                This is not failure - it is opportunity. Practice the lesson again,
                then return for the test.
              </p>
            )}
          </div>
        </div>

        <div className="reflection-on-test">
          <h4>Your Reflection:</h4>
          <textarea
            className="reflection-notes"
            placeholder="What did this test teach you? Where did you struggle? What will you practice?"
            value={studentFeedback}
            onChange={(e) => setStudentFeedback(e.target.value)}
          />
        </div>

        <div className="test-actions-result">
          <button className="btn-accept" onClick={completeTest}>
            {passed ? 'Continue to Next Lesson' : 'Retake Lesson & Retry Test'}
          </button>
          <button className="btn-cancel" onClick={onCancel}>Return to Menu</button>
        </div>
      </div>
    );
  }

  return null;
}

export default VidyaTest;
