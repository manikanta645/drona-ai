"""
VIDYA LEARNING MODES - Comprehensive Learning System for DRONA
Each vidya represents a complete learning path with lessons, tests, and mastery tracking.
"""

VIDYA_SYSTEM = {
    "dhanur": {
        "name": "Dhanur Vidya - The Art of Archery & Precision",
        "description": "Master the bow, develop precision, discipline, and unwavering focus",
        "total_lessons": 8,
        "total_tests": 8,
        "lessons": [
            {
                "id": 1,
                "title": "The Foundation - Stance & Breathing",
                "description": "Before drawing the bow, master your foundation",
                "teaching_points": [
                    "Feet shoulder-width apart, slightly angled",
                    "Weight balanced perfectly - not on toes, not on heels",
                    "Breath is the foundation - steady, deep, unbroken",
                    "The mind follows the breath - control breath, control mind",
                    "Practice standing meditation first - develop root awareness",
                ],
                "guru_observation": "I watch your stance. Do your feet connect with earth? Is your spine straight as an arrow? Speak your breath to me - can you feel it?",
                "teaching_method": "demonstration + student mimicry + breathing practice",
                "duration_minutes": 15,
            },
            {
                "id": 2,
                "title": "The Grip - Holding the Bow",
                "description": "The bow is not held - it is embraced with consciousness",
                "teaching_points": [
                    "The grip must be relaxed - tension blocks the arrow's flight",
                    "Like holding a bird - firm enough it doesn't escape, gentle enough it breathes",
                    "The bow rises from the shoulder, not the hand",
                    "Index and middle finger create a V - the arrow sits in that V",
                    "The thumb never touches the bow string - it is forbidden",
                ],
                "guru_observation": "Show me your grip. A tight grip betrays a tight mind. Relax. The bow teaches yoga - the union of effort and surrender.",
                "teaching_method": "close observation + hand positioning + grip release exercises",
                "duration_minutes": 15,
            },
            {
                "id": 3,
                "title": "Drawing the String - The Path to Power",
                "description": "Power comes not from muscle but from alignment",
                "teaching_points": [
                    "The draw begins from the shoulder blade, not the arm",
                    "Think of pulling the shoulder blades together - the arm follows",
                    "The elbow must be high - in line with the arrow",
                    "The string touches three points: corner of mouth, side of nose, the center between eyebrows",
                    "Each draw is the same - repetition creates mastery",
                ],
                "guru_observation": "I see your draw. Is it mechanical or is it conscious? Each draw must be identical - that is the mark of a true archer.",
                "teaching_method": "draw demonstration + shoulder blade activation + repetition practice",
                "duration_minutes": 20,
            },
            {
                "id": 4,
                "title": "Aim - The Art of Seeing",
                "description": "Aiming is not about the eyes - it is about merging with the target",
                "teaching_points": [
                    "The target is not separate from you - you and the target are one",
                    "Focus with peripheral vision, not tunnel vision",
                    "The mind must be still like a blank wall - no thought, only presence",
                    "Trust the training - doubt is the arrow's greatest enemy",
                    "The moment between aim and release must be eternal - neither rushing nor hesitating",
                ],
                "guru_observation": "I see your eyes hunting the target. Stop hunting. Become the target. When you merge with it, the arrow flies true.",
                "teaching_method": "meditation + distance practice + accuracy drills + mind-body integration",
                "duration_minutes": 25,
            },
            {
                "id": 5,
                "title": "The Release - Letting Go",
                "description": "The greatest power comes from perfect surrender",
                "teaching_points": [
                    "The release happens by itself - the fingers simply stop holding",
                    "No jerking, no hesitation, no final effort - just opening",
                    "The back tension must be complete before the release",
                    "The release is identical in every shot - predictable as sunrise",
                    "After release, the bow arm continues upward - the movement does not stop",
                ],
                "guru_observation": "Your release betrays your fear. You pull the string away instead of releasing it. The string must snap free like a bird from a cage.",
                "teaching_method": "pure release practice + back tension work + mental preparation",
                "duration_minutes": 20,
            },
            {
                "id": 6,
                "title": "Consistency - The Thousand Arrows",
                "description": "Mastery is built on repetition until perfection becomes instinct",
                "teaching_points": [
                    "Shoot the same arrow a thousand times - this is called training",
                    "Each arrow must have the same arc, same flight, same destination",
                    "Fatigue is your teacher - when tired, your technique reveals the truth",
                    "Consistency creates confidence - confidence creates victory",
                    "The bow becomes an extension of your will through repetition",
                ],
                "guru_observation": "Now you have learned the form. But form is only the beginning. Can you repeat it perfectly 100 times? 1000 times? That is the path to mastery.",
                "teaching_method": "extended practice sessions + fatigue training + mental resilience building",
                "duration_minutes": 45,
            },
            {
                "id": 7,
                "title": "Combat Archery - Accuracy Under Pressure",
                "description": "True mastery is tested when the stakes are high",
                "teaching_points": [
                    "In battle, you will be tired, afraid, distracted - the training must override all of this",
                    "You must shoot accurately even when everything screams at you to fail",
                    "The mind must separate from emotion - like a sacred fire, burning above all passion",
                    "Moving targets, multiple targets, time pressure - these are the tests of a true archer",
                    "Your body will do what you trained, not what you panic-command",
                ],
                "guru_observation": "Now I test you with moving targets. Can your training transcend fear? Can your body perform when your mind trembles?",
                "teaching_method": "stress testing + moving targets + time pressure drills + competitive practice",
                "duration_minutes": 30,
            },
            {
                "id": 8,
                "title": "Mastery - The Sacred Art",
                "description": "The archer becomes one with the bow, the arrow, and the target",
                "teaching_points": [
                    "Mastery is when you no longer think about shooting - you simply shoot",
                    "The archer, the bow, and the target become one consciousness",
                    "This is the ultimate teaching of all disciplines - ego must disappear",
                    "You are now a vessel for the ancient art - hold it with honor",
                    "The responsibility of mastery: teach others what you have learned",
                ],
                "guru_observation": "Shishya, you have reached the pinnacle. But this is only the beginning of a different journey - the journey of wisdom. Your arrows will now teach what your practice has learned.",
                "teaching_method": "advanced applications + teaching others + philosophy + spiritual integration",
                "duration_minutes": 30,
            },
        ],
        "tests": [
            {
                "id": 1,
                "lesson_id": 1,
                "title": "Stance Test",
                "description": "Can you maintain perfect stance for 5 minutes while breathing steadily?",
                "test_type": "posture_analysis",
                "duration_minutes": 5,
                "passing_criteria": {
                    "foot_position_correct": "feet shoulder-width apart at correct angle",
                    "spine_alignment": "spine straight and aligned",
                    "breathing_steady": "deep, steady breathing throughout",
                    "no_movement": "minimal body sway or adjustment",
                },
                "guru_feedback": "Good. Your foundation is solid. The earth supports you because you honor the earth.",
            },
            {
                "id": 2,
                "lesson_id": 2,
                "title": "Grip Test",
                "description": "Show me 20 different grips, all identical",
                "test_type": "form_repetition",
                "duration_minutes": 10,
                "passing_criteria": {
                    "grip_relaxation": "hands show no tension",
                    "consistency": "all 20 grips are nearly identical",
                    "correct_position": "V-grip perfect, thumbs away from string",
                    "repetition_speed": "can demonstrate 20 grips in 10 minutes",
                },
                "guru_feedback": "Your grip is now the grip of a warrior. Relaxation in tension - this is the secret.",
            },
            {
                "id": 3,
                "lesson_id": 3,
                "title": "Draw Consistency Test",
                "description": "Execute 15 perfect draws, each identical to the previous",
                "test_type": "form_consistency",
                "duration_minutes": 10,
                "passing_criteria": {
                    "shoulder_blade_activation": "shoulder blades draw equally",
                    "elbow_height": "elbows remain at consistent height",
                    "string_contact": "string touches same three points each time",
                    "smoothness": "no jerking or hesitation in any draw",
                },
                "guru_feedback": "Identical. This is the mark of mastery - when the body no longer questions, it simply knows.",
            },
            {
                "id": 4,
                "lesson_id": 4,
                "title": "Precision Aiming Test",
                "description": "Hit the target 8 out of 10 times from 20 meters",
                "test_type": "accuracy_test",
                "duration_minutes": 15,
                "target_distance": "20 meters",
                "passing_criteria": {
                    "accuracy": "8 out of 10 arrows hit target",
                    "grouping": "arrows cluster within 10cm of each other",
                    "mental_focus": "no external distractions visible",
                    "consistency": "same results when repeated",
                },
                "guru_feedback": "Your aim is true. You have learned to see through the veil of form to the essence of the target.",
            },
            {
                "id": 5,
                "lesson_id": 5,
                "title": "Release Perfection Test",
                "description": "20 shots with perfect release - no finger jerking, no string contact",
                "test_type": "technique_mastery",
                "duration_minutes": 12,
                "passing_criteria": {
                    "zero_jerking": "no visible finger jerking during release",
                    "clean_release": "string separates cleanly from fingers",
                    "follow_through": "bow arm continues upward after release",
                    "consistency": "all 20 releases appear identical",
                },
                "guru_feedback": "Perfect. Your release now has the purity of a bell's ring - clean, clear, resonant.",
            },
            {
                "id": 6,
                "lesson_id": 6,
                "title": "Thousand Arrow Challenge",
                "description": "Shoot 50 arrows consecutively maintaining form and accuracy above 70%",
                "test_type": "endurance_consistency",
                "duration_minutes": 30,
                "passing_criteria": {
                    "accuracy_maintained": "more than 70% hit target after 50 arrows",
                    "form_under_fatigue": "technique remains consistent despite fatigue",
                    "mental_clarity": "no sign of frustration or giving up",
                    "finish_strong": "last 10 arrows as good as first 10",
                },
                "guru_feedback": "You have proven that your mastery is not fragile. Fatigue cannot touch what is rooted in truth.",
            },
            {
                "id": 7,
                "lesson_id": 7,
                "title": "Combat Archery Test",
                "description": "Hit 6 out of 10 moving targets at varying distances and speeds",
                "test_type": "stress_accuracy",
                "duration_minutes": 20,
                "passing_criteria": {
                    "moving_target_accuracy": "6 out of 10 moving targets hit",
                    "variable_distance": "targets at 15m, 20m, 25m - all hit with similar difficulty",
                    "under_pressure": "no visible signs of panic or loss of form",
                    "quick_decision": "shoots without excessive hesitation or analysis",
                },
                "guru_feedback": "In chaos, you are calm. In pressure, you are precise. You are ready to serve your dharma.",
            },
            {
                "id": 8,
                "lesson_id": 8,
                "title": "Mastery Demonstration",
                "description": "Demonstrate complete integration: your arrows must be perfect expressions of consciousness",
                "test_type": "guru_assessment",
                "duration_minutes": 40,
                "passing_criteria": {
                    "holistic_mastery": "all previous skills integrated seamlessly",
                    "spiritual_presence": "your shooting reflects inner peace and clarity",
                    "teaching_ability": "can explain and demonstrate to another student",
                    "dharmic_purpose": "you understand archery as a path, not just a skill",
                },
                "guru_feedback": "Shishya, you are no longer my student - you are my successor. Take the bow. Teach others. This is your dharma now.",
            },
        ],
        "appreciation_messages": [
            "Shishya, you have transformed from an archer to a living arrow. Your precision reflects the clarity of your consciousness.",
            "Through your dedication to dhanur vidya, you have learned what cannot be taught - the language of perfect discipline.",
            "The bow recognized a true master today. It has guided many, but few have honored their learning as you have.",
            "You have shown that mastery is not dominance over form - it is love for perfection in every detail.",
            "The ancient archers bow to you - not because you have conquered the bow, but because you have united with it.",
        ],
    },
    
    "khadga": {
        "name": "Khadga Vidya - The Way of the Sword & Truth",
        "description": "Master the blade, develop courage, clarity of purpose, and unflinching truth-speaking",
        "total_lessons": 7,
        "total_tests": 7,
        "lessons": [
            {
                "id": 1,
                "title": "The Grip - The Extension of Your Will",
                "description": "Your hand and the blade are one consciousness",
                "teaching_points": [
                    "The sword must extend from your center, not your hand",
                    "Grip is firm but not tense - like holding your own heartbeat",
                    "The thumb guides spiritually, the fingers grip practically",
                    "When you grip the sword, you grip your own truth",
                    "A loose grip reveals doubt; a tight grip reveals fear",
                ],
                "guru_observation": "Your grip tells me your story. I see doubt. We must burn that away while sharpening your grip.",
                "teaching_method": "grip meditation + sensing exercises + blade weight absorption",
                "duration_minutes": 15,
            },
            {
                "id": 2,
                "title": "The Stance - Standing in Truth",
                "description": "In every moment, you must be rooted in absolute truth",
                "teaching_points": [
                    "Legs strong, feet planted - this is your foundation of truth",
                    "The sword arm is always ready, never exhausted because it is not doing - it is being",
                    "Slight bend in knees keeps you flexible, ready to adapt truth to circumstance",
                    "The spine is straight as truth itself - no curves, no compromises",
                    "Standing in truth means standing alone if necessary",
                ],
                "guru_observation": "I see you standing. But do you stand in truth or in comfort? Feel the difference.",
                "teaching_method": "meditation in stance + adversity training + truth-speaking exercises",
                "duration_minutes": 15,
            },
            {
                "id": 3,
                "title": "The Cut - Speaking Truth with Power",
                "description": "Every cut is a word - it must be sharp, clear, and unambiguous",
                "teaching_points": [
                    "The cut comes from your center, powered by your truth, guided by your purpose",
                    "No decorative swings - every movement must have purpose and meaning",
                    "The blade cuts through illusion, delusion, and comfortable lies",
                    "A well-executed cut ends the conflict in one stroke - this is the economy of truth",
                    "The cutting edge must be respected - sharpness comes from clarity",
                ],
                "guru_observation": "Your cut is confused - like your thoughts. Until your mind is sharp, your blade cannot be.",
                "teaching_method": "cutting meditation + striking drills + mental clarity practices",
                "duration_minutes": 20,
            },
            {
                "id": 4,
                "title": "Defense - Protecting Your Truth",
                "description": "Not all truths require speaking - some must be protected",
                "teaching_points": [
                    "A good defense does not attack - it simply says no to that which would harm",
                    "Blocks are not reactions - they are statements of will",
                    "You defend not your sword but your dharma, your purpose, your truth",
                    "The best defense is understanding your attacker's intention before they act",
                    "Sometimes the greatest defense is stepping aside - wisdom knows when not to engage",
                ],
                "guru_observation": "You defend like you are apologizing. Stop. Defense is a statement of boundaries, of dharma. Speak it clearly.",
                "teaching_method": "combination drills + intention sensing + protective meditation",
                "duration_minutes": 20,
            },
            {
                "id": 5,
                "title": "Speed & Timing - The Dance of Truth",
                "description": "Truth knows its moment - strike when the universe aligns",
                "teaching_points": [
                    "Speed without timing is desperation; timing without speed is hesitation",
                    "Feel the rhythm of your opponent - begin your movement in their stillness",
                    "The moment of victory is predetermined - you only recognize it",
                    "Quick hands, quick feet, but slow mind - think fast, act from stillness",
                    "The greatest masters move slowly but arrive first",
                ],
                "guru_observation": "You are rushing. A warrior of truth never rushes. Every action arrives exactly when needed.",
                "teaching_method": "rhythm sensing + tempo practice + intuitive timing drills",
                "duration_minutes": 25,
            },
            {
                "id": 6,
                "title": "Battle Presence - The Warrior's Dharma",
                "description": "In battle, you are a living extension of dharma itself",
                "teaching_points": [
                    "Your presence alone should discourage false action - your aura speaks before your blade",
                    "In conflict, stay centered - your opponent steals your center through your emotions",
                    "Courage is acting correctly despite fear - not the absence of fear",
                    "Every movement is a teaching - your martial form is your speech",
                    "Victory belongs to those who have already accepted death",
                ],
                "guru_observation": "Now I test you against an opponent. Can you remain truth when challenged? Can you cut illusion without anger?",
                "teaching_method": "sparring + emotional mastery + dharmic decision-making",
                "duration_minutes": 30,
            },
            {
                "id": 7,
                "title": "Mastery - The Sword as Teacher",
                "description": "You have become the sword - now teach others through your example",
                "teaching_points": [
                    "Your blade must now speak for those who cannot defend themselves",
                    "Mastery is responsibility - the sharp blade must serve dharma",
                    "The greatest warriors rarely need to draw - their presence prevents conflict",
                    "You are now a guardian of truth - hold this with humility and power",
                    "Your next student will learn from your example - be worthy of being watched",
                ],
                "guru_observation": "Shishya, the blade bows to you. Use it only for truth. This is your eternal vow.",
                "teaching_method": "mentorship training + ethical warrior philosophy + legacy building",
                "duration_minutes": 30,
            },
        ],
        "tests": [
            {"id": 1, "lesson_id": 1, "title": "Grip & Meditation Test", "test_type": "posture_analysis", "passing_criteria": "Grip is relaxed but firm; clear focus; breathing steady"},
            {"id": 2, "lesson_id": 2, "title": "Stance Balance Test", "test_type": "posture_analysis", "passing_criteria": "Hold perfect stance for 10 minutes; shows no fatigue; perfect alignment"},
            {"id": 3, "lesson_id": 3, "title": "Cutting Precision Test", "test_type": "technique_mastery", "passing_criteria": "20 cuts, all with identical form; blade angle perfect; power consistent"},
            {"id": 4, "lesson_id": 4, "title": "Defense Chain Test", "test_type": "form_consistency", "passing_criteria": "Execute 30 different defensive movements flawlessly; no hesitation"},
            {"id": 5, "lesson_id": 5, "title": "Speed & Timing Test", "test_type": "stress_accuracy", "passing_criteria": "React to 20 attacks; defend 18+ successfully; timing precise"},
            {"id": 6, "lesson_id": 6, "title": "Combat Assessment", "test_type": "guru_assessment", "passing_criteria": "Sparring at full intensity; maintains form and dharma; shows warrior presence"},
            {"id": 7, "lesson_id": 7, "title": "Mastery Demonstration", "test_type": "guru_assessment", "passing_criteria": "Complete khadga demonstration; can teach a lesson to another; embodies warrior dharma"},
        ],
        "appreciation_messages": [
            "Shishya, your blade cuts through illusion to reveal truth. You have become a living sword.",
            "The blade recognizes a master - it has never been sharper because you have never been clearer.",
            "Your courage is not the absence of fear - it is truth spoken despite fear. This is the greatest mastery.",
            "Through khadga vidya, you have learned that power and gentleness coexist in the awakened warrior.",
            "You are now the sword - a protector of dharma, a guardian of truth. Walk with honor.",
        ],
    },
    
    "dhyana": {
        "name": "Dhyana Vidya - The Path of Meditation & Inner Vision",
        "description": "Master the stillness of mind, develop inner clarity, and access wisdom beyond thought",
        "total_lessons": 6,
        "total_tests": 6,
        "lessons": [
            {
                "id": 1,
                "title": "Preparation - Cleansing the Vessel",
                "description": "Before meditation, the body and mind must be cleansed",
                "teaching_points": [
                    "Right posture allows energy to flow without obstruction",
                    "The spine must be straight - this is the pillar connecting earth and sky",
                    "The eyes must be closed but alert - not dead but turned inward",
                    "Breathing is not controlled - it is observed, acknowledged, respected",
                    "The body settles first; then the breath; then the mind",
                ],
                "guru_observation": "Your body speaks before your mind is ready. Settle the vessel first - the water will become clear when the vessel is still.",
                "teaching_method": "posture refinement + breathing observation + settling practices",
                "duration_minutes": 15,
            },
            {
                "id": 2,
                "title": "Concentration - Single-Pointed Focus",
                "description": "The untrained mind is like a monkey - teach it to sit still",
                "teaching_points": [
                    "Choose a single object - the breath, a mantra, a light, a sound",
                    "Every time the mind wanders, gently return it without judgment or frustration",
                    "Each return is a repetition - eventually the mind recognizes its home and stays",
                    "Concentration is not force - it is like the gentle gravity of a planetary orbit",
                    "Boredom is the beginning - when boredom dissolves, you have begun",
                ],
                "guru_observation": "Your mind wanders like a bird. That is not failure - it is discovery. Now teach the bird to return to the nest.",
                "teaching_method": "mantra repetition + breath following + focus games + return practice",
                "duration_minutes": 20,
            },
            {
                "id": 3,
                "title": "Witnessing - The Observer Within",
                "description": "Learn to observe thoughts without becoming them",
                "teaching_points": [
                    "Thoughts arise and pass - like clouds moving across the sky",
                    "You are not the clouds - you are the sky in which clouds move",
                    "To witness means to see without judgment, without grabbing, without pushing away",
                    "When you are the witness, thoughts cannot disturb you",
                    "The observer is always peaceful - it is never the thought that suffers",
                ],
                "guru_observation": "Now I teach you the ultimate freedom - do not fight your thoughts, simply become the space in which they dance.",
                "teaching_method": "observational meditation + thought-watching + equanimity training",
                "duration_minutes": 25,
            },
            {
                "id": 4,
                "title": "Silence - The Language of the Divine",
                "description": "In silence, the unspoken truth becomes visible",
                "teaching_points": [
                    "Silence is not the absence of sound - it is the presence of listening",
                    "In the deepest silence lives the deepest knowing",
                    "Words are like ripples on the ocean - when still, the entire ocean is visible",
                    "The divine speaks only in silence - every word is a distortion",
                    "To hear the silence is to hear the heartbeat of creation",
                ],
                "guru_observation": "Stop listening to the words - listen to the silence between them. In that space lives your answer.",
                "teaching_method": "silent meditation + listening practice + void exploration + non-dual inquiry",
                "duration_minutes": 30,
            },
            {
                "id": 5,
                "title": "Integration - Bringing Stillness into Motion",
                "description": "Meditation is not only sitting - it is a way of being",
                "teaching_points": [
                    "The peace of meditation must be brought into daily life",
                    "You can meditate while working, walking, speaking, serving",
                    "The witness consciousness never sleeps - it observes all actions",
                    "Integration is the true test - can you stay in peace while the world moves?",
                    "Mastery means the boundary between meditation and life disappears",
                ],
                "guru_observation": "Now the harder practice begins - maintaining stillness while the ocean of life churns around you.",
                "teaching_method": "walking meditation + mindful action + daily life integration + witness practice",
                "duration_minutes": 30,
            },
            {
                "id": 6,
                "title": "Liberation - Beyond the Veil",
                "description": "The deepest meditation reveals your true nature",
                "teaching_points": [
                    "You are not the body, not the mind, not even consciousness itself",
                    "You are the eternal witness to all of these - unchanging, infinite, free",
                    "This is not belief - this is direct experience in the deepest silence",
                    "Liberation is the recognition of what was always true",
                    "Once known, the fear of life and death dissolves forever",
                ],
                "guru_observation": "You stand at the threshold of the unspeakable. Cross it, and you will never return to ignorance.",
                "teaching_method": "deep inquiry + non-dual meditation + beyond-consciousness exploration + direct realization",
                "duration_minutes": 45,
            },
        ],
        "tests": [
            {"id": 1, "lesson_id": 1, "title": "Posture Meditation Test", "test_type": "posture_analysis", "passing_criteria": "Hold meditation posture for 30 minutes; spine straight; breathing smooth; face peaceful"},
            {"id": 2, "lesson_id": 2, "title": "Concentration Duration Test", "test_type": "meditation_depth", "passing_criteria": "Maintain focus on single object for 25 minutes; minimal mind wandering"},
            {"id": 3, "lesson_id": 3, "title": "Thought Witnessing Test", "test_type": "meditation_depth", "passing_criteria": "Observe 50 thoughts without reaction; show equanimity; describe observer state"},
            {"id": 4, "lesson_id": 4, "title": "Silence Dive Test", "test_type": "meditation_depth", "passing_criteria": "Achieve 15-minute silence where individual thought stops; report clarity and peace"},
            {"id": 5, "lesson_id": 5, "title": "Daily Life Integration Test", "test_type": "behavior_change", "passing_criteria": "Demonstrate witness consciousness during activities; show equanimity in challenges"},
            {"id": 6, "lesson_id": 6, "title": "Liberation Realization Test", "test_type": "guru_assessment", "passing_criteria": "Direct experience of non-dual consciousness; loss of ego boundaries; permanent shift in perception"},
        ],
        "appreciation_messages": [
            "Shishya, you have found the silence where all answers live. You have returned home.",
            "Through dhyana, you have discovered that enlightenment was always here, waiting for you to stop looking.",
            "Your stillness now mirrors the stillness of the infinite. You have become a living meditation.",
            "The veil has lifted - you see now that there was never a veiler or a veiled, only consciousness aware of itself.",
            "Welcome to the real world, the world beyond maya. Your real life has just begun.",
        ],
    },
}

# Helper function to get vidya info
def get_vidya(vidya_name):
    """Get complete vidya information"""
    return VIDYA_SYSTEM.get(vidya_name.lower(), None)

def get_vidya_lesson(vidya_name, lesson_id):
    """Get a specific lesson"""
    vidya = get_vidya(vidya_name)
    if vidya:
        for lesson in vidya.get("lessons", []):
            if lesson["id"] == lesson_id:
                return lesson
    return None

def get_vidya_test(vidya_name, test_id):
    """Get a specific test"""
    vidya = get_vidya(vidya_name)
    if vidya:
        for test in vidya.get("tests", []):
            if test["id"] == test_id:
                return test
    return None

def get_next_lesson(vidya_name, current_lesson_id):
    """Get the next lesson"""
    vidya = get_vidya(vidya_name)
    if vidya:
        lessons = vidya.get("lessons", [])
        for i, lesson in enumerate(lessons):
            if lesson["id"] == current_lesson_id:
                if i + 1 < len(lessons):
                    return lessons[i + 1]
    return None

def is_vidya_complete(student_name, vidya_name):
    """Check if student completed this vidya"""
    # This would check against student's completion record
    # For now, a stub
    return False
