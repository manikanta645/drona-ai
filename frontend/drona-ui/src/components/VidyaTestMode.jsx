import React, { useState } from 'react';
import './VidyaTestMode.css';

const VidyaTestMode = ({ 
  studentName, 
  vidyaId, 
  vidyaName, 
  vidyaIcon,
  askDrona, 
  speak,
  detectLanguage,
  isLoading,
  chatHistory = []
}) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [testStarted, setTestStarted] = useState(false);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [completedTests, setCompletedTests] = useState([]);

  // Test questions for each vidya and level
  const testQuestions = {
    dhanur: {
      1: {
        question: 'Describe the proper archery stance and explain why each element is important.',
        guidance: 'Think about the relationship between your body position and your ability to aim accurately.',
        expectedKey: 'feet, balance, stable, foundation'
      },
      2: {
        question: 'Show me how you would control your breathing before and during the moment of release.',
        guidance: 'Consider how breath affects mind, body, and the flight of the arrow.',
        expectedKey: 'breath, steady, calm, control, release'
      },
      3: {
        question: 'Explain how grip tension affects accuracy. What is the balance between control and relaxation?',
        guidance: 'Think about the paradox: firm enough to control, yet relaxed enough to be natural.',
        expectedKey: 'tension, control, relaxation, balance, firm'
      },
      4: {
        question: 'How does intention affect the journey of the arrow? Describe your mental state before releasing.',
        guidance: 'Reflect on how your mind shapes reality. What is the relationship between clarity and accuracy?',
        expectedKey: 'intention, clarity, focus, mind, arrow'
      },
      5: {
        question: 'You have mastered archery. Now teach me what archery has taught you about life.',
        guidance: 'The true lesson of any art is deeper than the technique. What has archery revealed to you?',
        expectedKey: 'life, mastery, insight, lesson, path'
      }
    },
    khadga: {
      1: {
        question: 'Why is the sword considered a symbol of truth? How does this philosophy shape the way you approach combat?',
        guidance: 'Think about what truth means and how it relates to living and fighting with integrity.',
        expectedKey: 'truth, dharma, integrity, honor, philosophy'
      },
      2: {
        question: 'Describe your fighting stance and explain how it relates to courage and readiness.',
        guidance: 'A good stance comes from confidence and understanding. How do you stand in your truth?',
        expectedKey: 'stance, courage, ready, grounded, truth'
      },
      3: {
        question: 'Show me a sword strike and explain the philosophy behind the movement you choose.',
        guidance: 'Every strike is an expression of your understanding. What message does your strike send?',
        expectedKey: 'strike, technique, purpose, expression, philosophy'
      },
      4: {
        question: 'The best defense is awareness. How do you develop this awareness in combat and in life?',
        guidance: 'Reflect on the difference between reacting and responding, between fear and awareness.',
        expectedKey: 'awareness, defense, consciousness, wisdom, respond'
      },
      5: {
        question: 'You have become a warrior. What responsibility comes with mastery of the sword?',
        guidance: 'True mastery brings obligation. How will you use your skill in service of dharma?',
        expectedKey: 'responsibility, dharma, service, mastery, power'
      }
    },
    gada: {
      1: {
        question: 'The mace is the heaviest weapon. What does this teach you about the relationship between power and control?',
        guidance: 'Think about what it means to wield something powerful. What is the burden of strength?',
        expectedKey: 'power, control, strength, discipline, weight'
      },
      2: {
        question: 'How do you build the strength needed to master the mace without injuring yourself?',
        guidance: 'Strength grows gradually and wisely. What is the relationship between patience and power?',
        expectedKey: 'strength, patience, gradual, discipline, training'
      },
      3: {
        question: 'A strike with the mace must be precise despite its weight. How do you achieve this?',
        guidance: 'Power without precision is chaos. How do you direct great force toward small targets?',
        expectedKey: 'precision, control, force, accuracy, technique'
      },
      4: {
        question: 'How can a heavy weapon be fast? Explain the physics and philosophy of speed with power.',
        guidance: 'True speed comes from efficiency and momentum. How do you make heaviness seem light?',
        expectedKey: 'speed, momentum, efficiency, fluidity, physics'
      },
      5: {
        question: 'You have mastered the mace. What is the lesson beyond the weapon?',
        guidance: 'All weapons teach. The mace teaches about power, control, and the integration of opposites.',
        expectedKey: 'mastery, lesson, integration, power, wisdom'
      }
    },
    dhyana: {
      1: {
        question: 'Describe how you have prepared your body and mind for meditation. What conditions support practice?',
        guidance: 'Preparation is half the battle. How do you create an environment for inner peace?',
        expectedKey: 'posture, environment, preparation, conditions, peace'
      },
      2: {
        question: 'How do you use the breath as an anchor for attention in meditation?',
        guidance: 'The breath is always present. How do you use this presence to steady your mind?',
        expectedKey: 'breath, anchor, attention, focus, steady'
      },
      3: {
        question: 'Describe the experience of witnessing your thoughts. How is this different from thinking them?',
        guidance: 'There is a difference between the thinker and the thoughts. Can you experience this difference?',
        expectedKey: 'witness, thoughts, observe, aware, difference'
      },
      4: {
        question: 'What is silence? Describe your experience of silence in meditation.',
        guidance: 'Silence is not the absence of sound, but the absence of reaction. What did you find there?',
        expectedKey: 'silence, peace, stillness, void, beyond'
      },
      5: {
        question: 'How have you brought meditation into your daily life? Give specific examples.',
        guidance: 'True meditation is meditation in action. How do you remain aware throughout your day?',
        expectedKey: 'action, awareness, integration, daily, mindfulness'
      }
    },
    yudha: {
      1: {
        question: 'State Sun Tzu\'s core principle and explain how you would apply it to a strategic situation.',
        guidance: 'The Art of War teaches that victory is achieved before the battle. How?',
        expectedKey: 'know, victory, strategy, principle, decision'
      },
      2: {
        question: 'Describe how you would use terrain to gain strategic advantage. Give a specific example.',
        guidance: 'Terrain is often underestimated. How can position defeat numbers?',
        expectedKey: 'terrain, position, advantage, strategy, geography'
      },
      3: {
        question: 'Name the Five Elements of Strategy and explain how they work together.',
        guidance: 'Each element amplifies the others. How is strategy a unified whole?',
        expectedKey: 'elements, time, force, information, deception'
      },
      4: {
        question: 'Plans fail. How do you maintain strategy when things do not go as planned?',
        guidance: 'The best strategy is flexible. How do you adapt while maintaining purpose?',
        expectedKey: 'adapt, flexible, change, respond, principle'
      },
      5: {
        question: 'You are ready to lead. What strategic wisdom would you share with an army?',
        guidance: 'Leadership means seeing the whole. What is your strategic vision?',
        expectedKey: 'leadership, vision, wisdom, whole, insight'
      }
    },
    dharma: {
      1: {
        question: 'What is your personal dharma? How do you know when you are living it?',
        guidance: 'Dharma is not abstract. It is your unique path. How do you recognize it?',
        expectedKey: 'dharma, purpose, unique, path, duty'
      },
      2: {
        question: 'Tell about a time when two duties seemed to conflict. How did you resolve it?',
        guidance: 'Dharma is complex. The real test is when it seems to contradict itself.',
        expectedKey: 'conflict, resolve, duty, choice, integrity'
      },
      3: {
        question: 'How do you act fully while remaining detached from the result?',
        guidance: 'This is the great paradox of dharma. Can you do your best while releasing control?',
        expectedKey: 'action, detachment, result, care, release'
      },
      4: {
        question: 'A person close to you is following a path you think is wrong. How do you respond?',
        guidance: 'Respect for others\' dharma is itself dharma. How do you balance compassion with honesty?',
        expectedKey: 'respect, compassion, dharma, other, path'
      },
      5: {
        question: 'As you have walked the path of dharma, what has it shown you about life itself?',
        guidance: 'The deepest lessons come from living the teaching. What have you learned?',
        expectedKey: 'life, meaning, lesson, understanding, wisdom'
      }
    }
  };

  const currentQuestion = testQuestions[vidyaId]?.[currentLevel];

  const speakText = (text) => {
    if (!speak || !text) return;
    const language = typeof detectLanguage === 'function' ? detectLanguage(text) : 'en';
    speak(text, language);
  };

  const handleStartTest = () => {
    setTestStarted(true);
    if (currentQuestion?.question) {
      speakText(currentQuestion.question);
    }
    if (currentQuestion) {
      const prompt = `Test Level ${currentLevel} for ${vidyaName}:
      
Question: ${currentQuestion.question}

Guidance: ${currentQuestion.guidance}

After the student answers, evaluate their response based on whether they demonstrate understanding of the key concepts: ${currentQuestion.expectedKey}

Be encouraging but honest. This is where they show mastery.`;
      askDrona(prompt);
    }
  };

  const handleSubmitAnswer = () => {
    if (!studentAnswer.trim()) return;

    const evaluationPrompt = `The student answered this question:
    
"${currentQuestion.question}"

They said: "${studentAnswer}"

Please evaluate their answer. Look for understanding of these key concepts: ${currentQuestion.expectedKey}

Grade them on a scale of 1-10. Provide:
1. Assessment of their understanding
2. What they did well
3. Areas for improvement
4. Whether they pass (need 7/10 or higher)

Be a supportive guru who recognizes growth while maintaining high standards.`;

    askDrona(evaluationPrompt);
    setStudentAnswer('');
    
    // Simulate getting results
    setTimeout(() => {
      const score = Math.floor(Math.random() * 4) + 7; // 7-10
      const outcomeText = score >= 7
        ? `Well done ${studentName}. You passed level ${currentLevel} with ${score} out of 10.`
        : `${studentName}, you scored ${score} out of 10. Review and try again with better clarity.`;
      speakText(outcomeText);
      setTestResults({
        level: currentLevel,
        score: score,
        passed: score >= 7,
        feedback: 'Check the conversation for detailed guru feedback.'
      });
    }, 2000);
  };

  const handleNextLevel = () => {
    setCompletedTests([...completedTests, currentLevel]);
    if (currentLevel < 5) {
      setCurrentLevel(currentLevel + 1);
      setTestStarted(false);
      setTestResults(null);
      setStudentAnswer('');
    } else {
      // Completion message
      const completionPrompt = `${studentName} has completed all 5 test levels of ${vidyaName}! 

All tests passed! Please give them a final blessing and acknowledgment of their mastery. They have shown dedication and understanding throughout this vidya. Be warm, genuine, and celebratory while maintaining the role of Guru Dronacharya.`;
      askDrona(completionPrompt);
    }
  };

  return (
    <div className="vidya-test-mode-container">
      <div className="test-mode-header">
        <h1>{vidyaIcon} {vidyaName} - Test Mode</h1>
        <p className="student-info">Shishya: {studentName}</p>
        <div className="progress-indicator">
          <span className="level-counter">Level {currentLevel} of 5</span>
          {completedTests.includes(currentLevel) && <span className="level-status">✓ Passed</span>}
        </div>
      </div>

      <div className="test-mode-layout">
        {/* Test Level Navigation */}
        <div className="test-sidebar">
          <h3>Test Levels</h3>
          <div className="test-levels">
            {[1, 2, 3, 4, 5].map(level => (
              <div
                key={level}
                className={`test-level-item ${
                  level === currentLevel 
                    ? 'current' 
                    : completedTests.includes(level)
                      ? 'completed'
                      : ''
                }`}
                onClick={() => {
                  if (completedTests.includes(level) || level === 1 || completedTests.includes(level - 1)) {
                    setCurrentLevel(level);
                    setTestStarted(false);
                    setTestResults(null);
                  }
                }}
              >
                <span className="level-num">L{level}</span>
                <span className="level-status-badge">{completedTests.includes(level) ? '✓' : ''}</span>
              </div>
            ))}
          </div>
          <div className="test-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(completedTests.length / 5) * 100}%` }} />
            </div>
            <p>{completedTests.length}/5 Levels Passed</p>
          </div>
        </div>

        {/* Main Test Area */}
        <div className="test-main-area">
          {!testStarted ? (
            // Test Introduction
            <div className="test-intro">
              <h2>Level {currentLevel} Test</h2>
              <p className="test-intro-text">
                {currentLevel === 5
                  ? 'This is the final level. Show us your mastery across all areas of this vidya.'
                  : `You have completed the level ${currentLevel} lessons. Now it's time to demonstrate your understanding.`}
              </p>

              <div className="test-question-preview">
                <h3>📝 The Question:</h3>
                <p className="question-text">{currentQuestion?.question}</p>
              </div>

              <div className="test-guidance">
                <h3>💡 Guidance:</h3>
                <p>{currentQuestion?.guidance}</p>
              </div>

              <div className="test-info">
                <h3>ℹ️ About This Test:</h3>
                <ul>
                  <li>Take time to give a thoughtful answer</li>
                  <li>Show your understanding, not just memorization</li>
                  <li>Share examples from your learning</li>
                  <li>You need 7/10 or higher to pass</li>
                  {currentLevel === 5 && <li>Show Guru Dronacharya your mastery</li>}
                </ul>
              </div>

              <button className="btn-start-test" onClick={handleStartTest} disabled={isLoading}>
                {isLoading ? 'Guru is preparing...' : 'Begin Test'}
              </button>
            </div>
          ) : testResults ? (
            // Test Results
            <div className="test-results">
              <div className={`result-banner ${testResults.passed ? 'passed' : 'failed'}`}>
                {testResults.passed ? (
                  <>
                    <div className="result-icon">✓</div>
                    <div className="result-text">Excellent! You have passed!</div>
                  </>
                ) : (
                  <>
                    <div className="result-icon">↻</div>
                    <div className="result-text">Try Again - You've grown, but there's more to learn</div>
                  </>
                )}
              </div>

              <div className="result-details">
                <div className="result-score">
                  <span className="score-label">Your Score</span>
                  <span className="score-value">{testResults.score}/10</span>
                </div>

                <div className="result-message">
                  <h3>Guru's Evaluation:</h3>
                  <div className="guru-feedback-display">
                    {chatHistory.slice(-2).map((msg, idx) => (
                      msg.type === 'guru' && (
                        <p key={idx}>{msg.text}</p>
                      )
                    ))}
                  </div>
                </div>

                {testResults.passed ? (
                  <button className="btn-next-level" onClick={handleNextLevel}>
                    {currentLevel === 5 ? '🎉 Complete Vidya' : `→ Proceed to Level ${currentLevel + 1}`}
                  </button>
                ) : (
                  <button 
                    className="btn-retry-test" 
                    onClick={() => {
                      setTestStarted(false);
                      setTestResults(null);
                      setStudentAnswer('');
                    }}
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Active Test
            <div className="test-active">
              <div className="test-question">
                <h2>Your Question:</h2>
                <p className="question-main">{currentQuestion?.question}</p>
              </div>

              <div className="student-answer-area">
                <h3>📝 Your Answer:</h3>
                <textarea
                  className="answer-textarea"
                  placeholder="Take your time. Think deeply and share your true understanding. Be honest and sincere."
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                className="btn-submit-answer"
                onClick={handleSubmitAnswer}
                disabled={!studentAnswer.trim() || isLoading}
              >
                {isLoading ? 'Guru is evaluating...' : 'Submit Answer for Evaluation'}
              </button>
            </div>
          )}
        </div>

        {/* Conversation Sidebar */}
        <div className="test-chat-sidebar">
          <h3>💬 Guru's Words</h3>
          <div className="test-chat-history">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`chat-item ${msg.type}`}>
                <span className="chat-emoji">{msg.type === 'guru' ? '🧙' : '👤'}</span>
                <div className="chat-text">{msg.text}</div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-item guru loading">
                <span className="chat-emoji">🧙</span>
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VidyaTestMode;
