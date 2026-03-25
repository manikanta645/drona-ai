import React, { useEffect, useState } from 'react';
import './VidyaLearnMode.css';
import GuruCameraMonitor from './GuruCameraMonitor';

const VidyaLearnMode = ({ 
  studentName, 
  vidyaId, 
  vidyaName, 
  askDrona, 
  speak,
  detectLanguage,
  isLoading,
  chatHistory = []
}) => {
  const [currentLesson, setCurrentLesson] = useState(1);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [showCamera, setShowCamera] = useState(true);
  const [cameraFeedback, setCameraFeedback] = useState('');
  const [lessonStarted, setLessonStarted] = useState(false);
  const [dynamicTeaching, setDynamicTeaching] = useState('');
  const [teachingLoading, setTeachingLoading] = useState(false);

  // Comprehensive lessons for each vidya
  const lessonsData = {
    dhanur: [
      {
        lesson: 1,
        title: '🏹 The Stance of Stillness',
        duration: '15 minutes',
        concepts: [
          'Understanding the proper stance - feet shoulder-width apart, weight balanced',
          'The philosophy: A steady body creates a steady aim. Your foundation determines your destiny.',
          'Practice: Stand still for 2 minutes, focus on balance and breathing'
        ],
        cameraFocus: 'Monitor your foot position and body balance. Keep your posture upright and grounded.',
        guru_teaching: `Welcome to Dhanur Vidya, ${studentName}. I am Dronacharya. Today, we begin with the foundation - the Stance of Stillness. In archery, as in life, everything begins with a stable foundation. Your feet are your roots, your spine is your tree.

PRACTICAL STEPS:
1. Stand with feet shoulder-width apart
2. Distribute weight evenly on both feet
3. Bend knees slightly - rigidity is the enemy of power
4. Keep your spine straight but not tense
5. Relax your shoulders

The deeper teaching: A wobbling foundation creates a wobbling mind. The archer who trembles cannot hit the target. But when your stance is like a mountain, your mind becomes like still water. I am watching you through the camera. Show me your natural stance first, then we will refine it together.`,
        keyLesson: 'The foundation determines the flight of the arrow. Stability within creates accuracy without.'
      },
      {
        lesson: 2,
        title: '🏹 The Breath of Life',
        duration: '12 minutes',
        concepts: [
          'Breathing techniques - deep inhale, controlled hold, slow exhale',
          'Synchronizing breath with aim and release',
          'The philosophy: The breath is the bridge between body and mind'
        ],
        cameraFocus: 'Watch your chest and shoulders for smooth breathing. No tension should be visible.',
        guru_teaching: `Excellent. Your stance is becoming solid. Now we move to the breath. The breath is not merely oxygen entering your lungs. It is the vital force - the prana - that connects your physical body to your mental state. An archer who cannot control their breath cannot control their arrow.

BREATHING TECHNIQUE:
1. Inhale deeply for 4 counts through your nose
2. Hold for 4 counts
3. Exhale slowly for 6 counts through your mouth
4. Pause for 2 counts
5. Repeat 10 times

As you practice, feel the ground beneath you. Each breath is a reset button. I watch how smoothly you breathe. If your shoulders rise, your mind rises. If your breath stutters, your arrow stutters. Keep the breath flowing like a river.`,
        keyLesson: 'Controlled breath creates controlled intention. Master your breath, master your release.'
      },
      {
        lesson: 3,
        title: '🏹 The Grip of Truth',
        duration: '14 minutes',
        concepts: [
          'Proper grip on the bow - firm but not tense',
          'Finding the balance between strength and softness',
          'The philosophy: Truth lies in balance'
        ],
        cameraFocus: 'Show me your hand grip. Look for tension in your forearms and shoulders.',
        guru_teaching: `Now, let us speak of the grip. A bow is not conquered by force. A bow is partnered with by understanding. Too tight a grip and you damage the bow - and yourself. Too loose and you have no control.

THE PERFECT GRIP:
1. Hold the bow handle with your fingers, not your palm
2. Your thumb and fingers form a C-shape
3. Imagine holding a small bird - firm enough it doesn't escape, gentle enough it survives
4. The grip pressure is only 3-4 out of 10 in strength
5. All power comes from your back and core, not your hands

Here is the secret: The bow shoots the arrow. You do not. Your job is to get out of the way. Show me your current grip on an imaginary bow.`,
        keyLesson: 'Strength without tension is true power. Let the bow work through you, not against you.'
      },
      {
        lesson: 4,
        title: '🏹 The Arrow of Intention',
        duration: '13 minutes',
        concepts: [
          'Arrow placement and nocking - smooth, purposeful movement',
          'Clarity of intention before action',
          'Respect for each arrow'
        ],
        cameraFocus: 'Watch the smoothness of your arm movements. Each gesture should be deliberate.',
        guru_teaching: `Every arrow that leaves your bow carries with it your intention, your focus, your will. Before we even touch the arrow, understand this: In Dhanur Vidya, every shot is sacred. You do not waste arrows, you do not shoot carelessly.

NOCKING THE ARROW:
1. Hold the arrow between your thumb and index finger
2. Slide it onto the bowstring
3. The nock clips onto the string with a soft click
4. Feel the connection between arrow and string - it is now part of you
5. Maintain this connection with respect and purpose

This moment before action is when you truly aim. Not with your eyes, but with your spirit. I see each of your movements. Are they purposeful or rushed? Show me an archer who values each arrow.`,
        keyLesson: 'Intention shapes the arrow. Respect transforms practice into mastery.'
      },
      {
        lesson: 5,
        title: '🏹 The Release of Mastery',
        duration: '16 minutes',
        concepts: [
          'The moment of release - the paradox of letting go',
          'Timing and synchronization',
          'Completion of the cycle'
        ],
        cameraFocus: 'Watch your arm extension and finger release. The motion should be smooth and complete.',
        guru_teaching: `We have come to the heart of archery - the release. Everything before this moment prepares for this.

THE RELEASE SEQUENCE:
1. Draw the string smoothly to the corner of your mouth
2. Keep your back muscles engaged - they do the work
3. At full draw, pause for 1-2 seconds
4. Release by relaxing your fingers - not pulling them away
5. Let the bowstring push the arrow forward
6. Follow through - your arm continues upward

The great secret: You do not release the arrow. The arrow releases itself when you simply stop holding it. The best archers simply get ready, and then surrender to the bow.

But remember: Surrender only comes after perfect preparation. When you have done everything correctly, surrender is the final gift you give to your shot. Show me your release now. The arrow knows where to go.`,
        keyLesson: 'True release is achieved through surrender after perfect preparation. The arrow shoots itself.'
      }
    ],
    khadga: [
      {
        lesson: 1,
        title: '⚔️ The Blade of Dharma',
        duration: '15 minutes',
        concepts: [
          'History and philosophy of the sword - not a tool of violence, but of truth',
          'The blade represents dharma - truth that cuts through illusion',
          'Sacred responsibility of the warrior'
        ],
        cameraFocus: 'Show your respect and understanding. Camera will capture your form and presence.',
        guru_teaching: `Welcome to Khadga Vidya, ${studentName}. You have chosen the path of the sword. The sword is not a weapon of violence. A true sword is an instrument of truth and dharma. It cuts through illusion. It defends the righteous.

PHILOSOPHY OF THE BLADE:
1. The sword represents your will to act according to dharma (righteous duty)
2. It symbolizes discrimination - the ability to cut away the false and keep the true
3. The blade is only as honorable as the one who wields it

THE WARRIOR'S CODE:
- Never strike with anger
- Never strike the weak or helpless
- Strike only when necessary for protection of dharma
- Master the sword so you need never use it

Before you learn the movements, you must learn the mind. A sword in the hands of anger is a curse. A sword in the hands of dharma is a blessing. Tell me now - what do you believe a sword truly represents?`,
        keyLesson: 'The sword is dharma. Master the philosophy before you master the blade.'
      },
      {
        lesson: 2,
        title: '⚔️ The Stance of Courage',
        duration: '13 minutes',
        concepts: [
          'Fighting stance - feet grounded, body ready',
          'The philosophy: Courage is not the absence of fear, but standing firm despite it',
          'Center of power and balance'
        ],
        cameraFocus: 'Show a grounded, balanced stance. Camera watches for stability and readiness.',
        guru_teaching: `A sword master is built on the foundation of stance. The feet must be like roots, the body like a tree.

THE WARRIOR STANCE:
1. Feet slightly wider than shoulder-width
2. Knees bent slightly - never locked
3. Dominant foot slightly forward
4. Weight balanced but ready to shift
5. Spine straight, shoulders relaxed but alert
6. Your center is your power source

PRINCIPLES:
- From a poor stance, even the best technique fails
- From a perfect stance, even a moderate technique succeeds
- The stance tells the enemy everything about your mind

When you stand in this way, you change your mind. You become present. You become ready. I taught Arjuna to stand like this before Kurukshetra. And that standing changed everything. Show me your stance now.`,
        keyLesson: 'The stance reveals the warrior. Courage is a physical posture you choose to adopt.'
      },
      {
        lesson: 3,
        title: '⚔️ The Strike of Truth',
        duration: '14 minutes',
        concepts: [
          'Basic strikes - smooth, powerful, controlled',
          'The directness of truth',
          'Economy of motion'
        ],
        cameraFocus: 'Watch your striking motion. Each movement should be precise and powerful.',
        guru_teaching: `Now we learn the strike. This is where philosophy becomes action. A strike is communication. It says: "This is my boundary. This is my truth. Back away."

FUNDAMENTAL STRIKES:
1. Overhead Strike - Uses gravity and back strength
2. Horizontal Strike - Slices horizontally with precision
3. Upward Strike - Uses leg power and forward motion
4. Thrust - Direct, straight, penetrating

FOR EACH STRIKE:
- Begin with intent, not force
- Rotate from your center, not your arm alone
- Let the blade find its path
- Follow through completely
- Immediately return to ready position

Every motion must be true. If you make a false move, a true warrior will punish it. Practice until falsehood becomes impossible. Show me your understanding of the overhead strike.`,
        keyLesson: 'Truth in motion is unstoppable. A committed strike from a centered position cannot be denied.'
      },
      {
        lesson: 4,
        title: '⚔️ The Defense of Dharma',
        duration: '13 minutes',
        concepts: [
          'Defense techniques - parrying and blocking',
          'Offense and defense are one movement',
          'Reading your opponent'
        ],
        cameraFocus: 'Watch your defensive movements. Blocking should be smooth and efficient.',
        guru_teaching: `A sword master must be as good at defending as attacking. The best defense is the one your opponent never sees coming.

DEFENSIVE TECHNIQUES:
1. Parry - Meet the incoming blade, deflect it
2. Block - Use the flat of your blade to stop the attack
3. Counter - Move from defense to offense in one motion
4. Evasion - The best defense is to not be there

THE DEEPER PRINCIPLE:
Defense is not weakness. Defense is wisdom. To defend your dharma is not less noble than to attack your enemies.

When you parry, you say: "Your attack has no power here."
When you block, you say: "You will not pass."
When you counter, you say: "Your attack is now my advantage."

Every parry can become a strike. They are one dance. Show me your understanding.`,
        keyLesson: 'Defense is not weakness - it is wisdom. Master both, and you cannot be defeated.'
      },
      {
        lesson: 5,
        title: '⚔️ The Dharma of Conflict',
        duration: '16 minutes',
        concepts: [
          'Integration of technique and philosophy',
          'When to fight and when to sheathe the blade',
          'The warrior\'s peace'
        ],
        cameraFocus: 'Show complete understanding. Your presence and readiness should be evident.',
        guru_teaching: `We conclude Khadga Vidya with the most important lesson: knowing when to sheathe the blade. You have learned the stance, the strike, the defense. But the true master is one who almost never draws it.

THE WARRIOR'S PATH:
1. Train until your technique is perfect
2. Cultivate a presence so strong that opponents yield before fighting
3. Fight only when dharma demands it
4. Win with the least harm necessary
5. After victory, practice mercy

I fought in Kurukshetra. Millions died. But what I wish most is that I had prevented that war through wisdom. My sword skills were perfect. But I lacked the wisdom to put the sword down.

A sword master is not one who wins every fight. A sword master is one who sees the fight before it begins and moves to prevent it. You are now trained in Khadga Vidya. The true warrior is at peace. Show me that peace now.`,
        keyLesson: 'The greatest sword master is the one who never needs to draw the blade. Technique without wisdom is incomplete.'
      }
    ],
    dhyana: [
      {
        lesson: 1,
        title: '🧘 The Stillness of Mind',
        duration: '18 minutes',
        concepts: [
          'Understanding meditation - not emptiness, but focus',
          'The natural state of the mind',
          'First techniques for stillness'
        ],
        cameraFocus: 'Camera observes your stillness. Notice the quality of your presence.',
        guru_teaching: `Welcome to Dhyana Vidya, ${studentName}. You have chosen the path of inner mastery. Many believe meditation is about having an empty mind. This is a misunderstanding. You cannot empty your mind any more than you can empty the sky. Clouds come and go.

THE TRUE NATURE OF MEDITATION:
1. Your mind is naturally like water - still at its deepest
2. You do not create stillness; you remove what prevents it
3. Thoughts are like clouds - they pass through awareness
4. Simply observe them and return to your breath

TODAY'S PRACTICE:
1. Sit comfortably with spine straight
2. Close your eyes gently
3. Focus on your natural breathing
4. When thoughts arise, notice them and return to breath
5. Do not judge yourself for thinking
6. Practice for 5 minutes

You are like the ocean. Meditation lets you experience your depths. Sit with me now.`,
        keyLesson: 'Meditation is not stopping thoughts - it is stopping your resistance to them. Be still like the ocean.'
      },
      {
        lesson: 2,
        title: '🧘 The Breath as Anchor',
        duration: '14 minutes',
        concepts: [
          'Using breath as a meditation tool',
          'Pranayama - breath control techniques',
          'Energy movement through the body'
        ],
        cameraFocus: 'Observe your breathing patterns. Watch for ease and natural rhythm.',
        guru_teaching: `Excellent progress. Now let us deepen with the breath. The breath is like a rope that connects your body to your mind, your mind to your spirit. This is pranayama - the ancient science of breath.

PRANAYAMA TECHNIQUE:
1. Nadi Shodhana (Alternate Nostril Breathing):
   - Close right nostril, inhale through left for 4 counts
   - Close left nostril, exhale through right for 4 counts
   - Reverse the process
   - Continue for 10 rounds

2. Ujjayi (Ocean Breath):
   - Inhale through nose with slight throat constriction
   - Creates a soft "ocean sound"
   - Maintain for 5 minutes

Most people are slaves to their breath. When anxious, your breath is shallow and fast. When calm, your breath is deep and slow. So we work with breath to change your state.

The breath is the link between voluntary and involuntary. By controlling breath, you reprogram your body's response to stress. Practice these techniques. Notice how the world changes.`,
        keyLesson: 'The breath is the bridge between body and mind. Master the breath, master yourself.'
      },
      {
        lesson: 3,
        title: '🧘 The Chakras - Centers of Power',
        duration: '15 minutes',
        concepts: [
          'Understanding the seven chakras',
          'Energy flow through the body',
          'Chakra meditation'
        ],
        cameraFocus: 'Observe your posture and alignment. Proper alignment impacts energy flow.',
        guru_teaching: `In Dhyana Vidya, we understand that you are not just a physical body. You are an energy body. Within you flow seven major energy centers called chakras.

THE SEVEN CHAKRAS:
1. Muladhara (Root) - Base of spine - Stability, survival
2. Svadhistana (Sacral) - Lower abdomen - Creativity, emotion
3. Manipura (Solar Plexus) - Stomach - Power, will
4. Anahata (Heart) - Center of chest - Love, compassion
5. Vishuddha (Throat) - Throat - Expression, communication
6. Ajna (Third Eye) - Between eyebrows - Intuition, insight
7. Sahasrara (Crown) - Top of head - Unity with divine

When these chakras are blocked, you suffer. When they flow freely, you thrive.

CHAKRA MEDITATION:
Visualize each chakra as a spinning wheel of light. See the color, feel the energy. As you practice, these become real. As you move up the chakras, you progress from animal to human to divine consciousness. Practice now.`,
        keyLesson: 'You are not just flesh and blood - you are energy. Understand your energy centers, understand yourself.'
      },
      {
        lesson: 4,
        title: '🧘 The Witness Consciousness',
        duration: '16 minutes',
        concepts: [
          'Moving from experiencing to observing',
          'The witness within',
          'Non-identification with thoughts and emotions'
        ],
        cameraFocus: 'Your meditation deepens. Notice any changes in your presence or breathing.',
        guru_teaching: `You are progressing well. Now we discover the Witness. Right now, you are identified with your thoughts and emotions. When happy, you think you ARE happiness. When sad, you ARE sadness. This is the source of all suffering.

The truth is profound: You are not your thoughts. You are the observer of your thoughts. This is called Saakshi Bhava - Witness consciousness.

THE PRACTICE:
1. Sit in meditation
2. Begin to notice: "I am aware that I am thinking"
3. Notice thoughts arising - observe them
4. Notice emotions arising - observe them
5. The one who observes is unchanged

YOUR THOUGHTS come and go - you are not them, you are the space they appear in.
YOUR EMOTIONS rise and fall - you are not them, you are the sky they move through.
YOUR BODY ages and changes - you are not it, you are the eternal awareness aware of it.

When you realize this, you are free. Free WITHIN life, not from it. Sit now and become the Witness.`,
        keyLesson: 'You are not your thoughts or emotions - you are the eternal awareness observing them. This is liberation.'
      },
      {
        lesson: 5,
        title: '🧘 The Bliss of Unity',
        duration: '18 minutes',
        concepts: [
          'Moving toward samadhi - meditation absorption',
          'Experiencing the interconnection of all existence',
          'The return to wholeness'
        ],
        cameraFocus: 'Your meditation practice culminates here. Notice the quality of your inner peace.',
        guru_teaching: `We have come to the pinnacle - Samadhi, absorption in unity consciousness. This is not something you achieve through effort. When you have purified your mind through previous practices, Samadhi descends like grace.

UNDERSTANDING SAMADHI:
1. It is not sleep or unconsciousness
2. It is hyper-consciousness unified
3. The seeker, the seeking, and what is sought become one
4. Time dissolves, separation dissolves, fear dissolves
5. You experience yourself as one with all existence

YOUR FINAL PRACTICE:
1. Meditate deeply
2. Release even the observer
3. Stop being aware of "being aware"
4. Just BE - not knowing, not thinking
5. In this gap where no one is watching, divinity exists

This is not the end of your practice. It is the beginning of a new way of living. Life itself is your meditation now. Every moment, every breath, every encounter - this is the practice. Sit in the profound silence.`,
        keyLesson: 'Samadhi is not achievement - it is the natural state when all obstacles dissolve. Live as the witness, and you live in unity.'
      }
    ]
  };

  const lessons = lessonsData[vidyaId] || lessonsData.dhanur;
  const currentLessonData = lessons.find(l => l.lesson === currentLesson);
  const guruTeachingText = dynamicTeaching || currentLessonData?.guru_teaching || '';

  const speakGuruText = (text) => {
    if (!speak || !text) return;
    const language = typeof detectLanguage === 'function' ? detectLanguage(text) : 'en';
    speak(text, language);
  };

  useEffect(() => {
    if (!currentLessonData) return;
    let cancelled = false;

    const fetchDynamicTeaching = async () => {
      setTeachingLoading(true);
      setDynamicTeaching('');
      try {
        const response = await fetch('http://127.0.0.1:8000/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: `Teach lesson ${currentLesson}: ${currentLessonData.title}. Include clear steps and how the student should begin practice.`,
            mode: vidyaId || 'chat',
            student_name: studentName || 'Shishya',
            vidya: vidyaId || 'dhanur',
            vidya_mode: 'learn',
            lang: 'en'
          })
        });
        const data = await response.json();
        const answer = (data && data.answer) ? data.answer : '';
        if (!cancelled && answer) {
          setDynamicTeaching(answer);
          speakGuruText(answer);
        }
      } catch (error) {
        if (!cancelled) {
          setDynamicTeaching('');
          speakGuruText(currentLessonData.guru_teaching);
        }
      } finally {
        if (!cancelled) {
          setTeachingLoading(false);
        }
      }
    };

    fetchDynamicTeaching();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson, vidyaId, studentName]);

  if (!currentLessonData) {
    return (
      <div className="vidya-learn-error">
        <p>❌ Lessons not found for {vidyaName}</p>
      </div>
    );
  }

  const handleLessonStart = () => {
    setLessonStarted(true);
    setShowCamera(true);
  };

  const handleCompleteLesson = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson]);
    }
    
    if (currentLesson < lessons.length) {
      setCurrentLesson(currentLesson + 1);
      setLessonStarted(false);
      setStudentAnswer('');
      setLessonProgress(0);
    }
  };

  return (
    <div className="vidya-learn-mode">
      {/* Left Panel - Lesson Content */}
      <div className="learn-left-panel">
        {!lessonStarted ? (
          <>
            {/* Lesson Overview */}
            <div className="lesson-overview">
              <div className="lesson-header-card">
                <h2>{currentLessonData.title}</h2>
                <p className="lesson-duration">⏱️ {currentLessonData.duration}</p>
              </div>

              {/* Concepts */}
              <div className="lesson-concepts">
                <h3>📚 Today's Concepts:</h3>
                <ul>
                  {currentLessonData.concepts.map((concept, idx) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </div>

              {/* Guru Teaching */}
              <div className="guru-teaching-box">
                <div className="guru-header">
                  <span className="guru-icon">👨‍🏫</span>
                  <span>Guru Dronacharya's Teachings</span>
                  <button
                    type="button"
                    className="btn-lesson-practice"
                    onClick={() => speakGuruText(currentLessonData.guru_teaching)}
                    style={{ marginLeft: 'auto', flex: 'none', padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                  >
                    🔊 Listen
                  </button>
                </div>
                <div className="guru-text">
                  {teachingLoading ? 'Guru is preparing your lesson...' : guruTeachingText}
                </div>
                <div className="key-lesson">
                  <span className="sparkle">✨</span>
                  <strong>Key Lesson:</strong> {currentLessonData.keyLesson}
                </div>
              </div>

              {/* Lesson Progress */}
              <div className="lesson-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(currentLesson / lessons.length) * 100}%`}}
                  ></div>
                </div>
                <p className="progress-text">
                  Lesson {currentLesson} of {lessons.length}
                </p>
              </div>

              {/* Start Button */}
              <button 
                className="btn-lesson-start"
                onClick={handleLessonStart}
              >
                🎬 Begin Lesson with Camera
              </button>
            </div>
          </>
        ) : (
          <>
            {/* During Lesson */}
            <div className="lesson-active">
              <div className="active-header">
                <h3>{currentLessonData.title}</h3>
                <button 
                  className="btn-lesson-close"
                  onClick={() => setLessonStarted(false)}
                >
                  ← Back
                </button>
              </div>

              {/* Camera Focus Info */}
              <div className="camera-focus-box">
                <h4>📷 Camera Focus:</h4>
                <p>{currentLessonData.cameraFocus}</p>
              </div>

              {/* Practice Section */}
              <div className="practice-section">
                <h4>🎯 Your Practice:</h4>
                <div className="student-practice-area">
                  <label>Your Response/Reflection:</label>
                  <textarea
                    value={studentAnswer}
                    onChange={(e) => setStudentAnswer(e.target.value)}
                    placeholder="Describe your practice experience, difficulties, or insights..."
                    rows={4}
                  />
                </div>

                {cameraFeedback && (
                  <div className="feedback-display">
                    <p><strong>👨‍🏫 Guru's Feedback:</strong></p>
                    <p>{cameraFeedback}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="lesson-actions">
                <button 
                  className="btn-lesson-submit"
                  onClick={handleCompleteLesson}
                >
                  ✓ Complete Lesson
                </button>
                <button 
                  className="btn-lesson-practice"
                  onClick={() => setLessonProgress(lessonProgress + 1)}
                >
                  🔄 Practice More ({lessonProgress}/3)
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Panel - Camera */}
      {lessonStarted && showCamera && (
        <div className="learn-right-panel">
          <GuruCameraMonitor 
            vidyaId={vidyaId}
            lessonTitle={currentLessonData.title}
            studentName={studentName}
            onFeedback={setCameraFeedback}
            isActive={lessonStarted}
            autoAnalyze={true}
            speak={speak}
            detectLanguage={detectLanguage}
          />
        </div>
      )}
    </div>
  );
};

export default VidyaLearnMode;
