"""
DRONA-AI VIDYA SYSTEM - QUICK START GUIDE
Complete reference for using the teaching system
"""

# ============================================================================
# QUICK START - 5 MINUTES
# ============================================================================

from vidya_engine import create_teaching_system, StudentProfile, StudentLevel

# 1. Initialize
system = create_teaching_system()
student = StudentProfile(student_id="s001", name="Arjuna", level=StudentLevel.BEGINNER)

# 2. Get lesson
lessons = system.lesson_engine.get_lessons("dhanur")
lesson = lessons[0]

# 3. Run complete teaching session
results = system.run_teaching_loop(
    student_profile=student,
    lesson=lesson,
    pose_frames=[],  # Add real pose data here
    time_taken=30.0
)

# 4. Access results
print(results["completion_message"])

# THAT'S IT! You have a complete teaching session


# ============================================================================
# CORE CONCEPTS
# ============================================================================

"""
1. VIDYA - Discipline of study
   - dhanur (archery)
   - khadga (sword)
   - dhyana (meditation)
   - dharma (ethics)
   - yudha (strategy)
   - shastra (knowledge)
   - itihaasa (history)
   - astras (weapons)

2. LESSON - Unit of instruction
   - Lesson has: name, description, instructions, evaluation criteria
   - Each lesson has difficulty level
   - Prerequisites chain lessons together
   - Camera may or may not be required

3. PERFORMANCE - Measurement of student work
   - Pose data from camera (if applicable)
   - Text answers (if applicable)
   - Time taken
   - Scoring: 0-100 scale

4. FEEDBACK - Guru's guidance
   - Specific corrections
   - Encouragement
   - Next steps
   - Tone matches discipline

5. PROGRESS - Student learning journey
   - Best score per lesson
   - Attempt history
   - Improvement tracking
   - Overall score calculation

6. DIFFICULTY - Adaptive challenge level
   - Factors from 0.5 (very easy) to 1.5 (very hard)
   - Adjusts based on performance
   - Modifies time, precision, stability requirements
"""


# ============================================================================
# KEY APIs
# ============================================================================

"""
LESSON ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lesson_engine.get_lessons(vidya)
    Get all lessons for a Vidya
    
lesson_engine.get_lesson(lesson_id)
    Get specific lesson by ID
    
lesson_engine.get_next_lesson(student_profile)
    Get recommended next lesson for student
    
lesson_engine.check_prerequisites(lesson, student_profile)
    Check if student can attempt lesson


POSE ANALYZER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pose_analyzer.analyze_frame(frame, vidya)
    Analyze single image frame
    Returns: PoseData
    
pose_analyzer.analyze_pose_over_time(frames, duration)
    Analyze multiple frames
    Returns: List[PoseData]
    
pose_validator.validate_pose(pose_data, vidya)
    Check if pose meets requirements
    Returns: (is_valid, errors_list)


EVALUATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

evaluator.evaluate_performance(student, lesson, pose_data, answers, time)
    Full performance evaluation
    Returns: PerformanceData with score
    
evaluator.determine_pass(performance, lesson)
    Check if score meets passing threshold
    Returns: Boolean


FEEDBACK ENGINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

feedback_engine.generate_feedback(student, lesson, performance)
    Create guru feedback
    Returns: GuruFeedback
    
feedback_engine.get_feedback_for_display(feedback)
    Format feedback for UI
    Returns: Formatted string


PROGRESS TRACKER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

progress_tracker.update_progress(student, lesson_id, performance)
    Update student progress after attempt
    
progress_tracker.get_performance_summary(student)
    Get dashboard data
    Returns: Dict with overall stats
    
progress_tracker.identify_strengths_weaknesses(student)
    Analyze performance patterns
    Updates: student.strengths, student.weaknesses


DIFFICULTY MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

difficulty_manager.adjust_difficulty(student, lesson_id)
    Update difficulty after attempt
    
difficulty_manager.apply_difficulty_modifiers(lesson, student)
    Get modifiers to apply
    Returns: Dict with time_multiplier, thresholds, etc.
    
difficulty_manager.get_difficulty_description(adjustment)
    Human-readable difficulty level
    Returns: String (e.g., "Challenge (Hard)")


TEACHING LOOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

teaching_system.run_teaching_loop(student, lesson, poses, answers, time)
    Complete 9-phase teaching session
    Returns: Dict with full results


teaching_system.explain_lesson(lesson, student)
    Get lesson explanation
    
teaching_system.demonstrate_lesson(lesson)
    Get demonstration
    
teaching_system.start_practice_session(student, lesson)
    Begin practice, returns: TeachingSession
    
teaching_system.observe_and_analyze(session, poses, answers, time)
    Evaluate attempt, returns: PerformanceData
    
teaching_system.generate_feedback(session, performance)
    Create feedback, returns: GuruFeedback
    
teaching_system.determine_retry(student, lesson, performance)
    Should student retry? Returns: Boolean
    
teaching_system.mark_lesson_complete(student, session)
    Finalize lesson, update progress
    
teaching_system.suggest_next_lesson(student)
    Get next lesson path
    
teaching_system.get_student_dashboard(student)
    Get dashboard data
"""


# ============================================================================
# DATA FLOW DIAGRAMS
# ============================================================================

"""
COMPLETE TEACHING SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. GET LESSON
   UI → lesson_engine.get_lesson(id)
   ← Lesson object

2. EXPLAIN
   UI → teaching_system.explain_lesson(lesson, student)
   ← Explanation text

3. DEMONSTRATE
   UI → teaching_system.demonstrate_lesson(lesson)
   ← Demo video/instructions

4. PRACTICE (CAPTURE)
   Camera captures student
   ← List of PoseData objects

5. ANALYZE
   pose_engine.analyze_frame() for each frame
   ← PoseData with metrics

6. EVALUATE
   evaluator.evaluate_performance(student, lesson, poses, answers, time)
   ← PerformanceData with score

7. FEEDBACK
   feedback_engine.generate_feedback(student, lesson, performance)
   ← GuruFeedback object

8. COMPLETE
   teaching_system.mark_lesson_complete(student, session)
   progress_tracker.update_progress(student, lesson_id, performance)
   difficulty_manager.adjust_difficulty(student, lesson_id)
   ← Updated StudentProfile

9. NEXT
   teaching_system.suggest_next_lesson(student)
   ← Next Lesson or None


FEEDBACK GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Score     → Performance Level → Feedback Template → Corrections
                     ↓              ↓
Score >= 85:  excellent      praise                    refinement
Score 70-84:  good           encouraging               targeted fixes
Score 50-69:  improving      patient                   step-by-step
Score <50:    struggling     supportive                basics review

Corrections sourced from:
- Performance.mistakes (what went wrong)
- Lesson.evaluation_criteria (what to focus on)
- Vidya.wisdom.corrections (discipline-specific guidance)


DIFFICULTY ADJUSTMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Performance Score     →  Adjustment Change   →  New Factor   →  Effect
──────────────────       ──────────────────      ──────────     ────────
Score >= 90             +0.20 (step ×2)        1.0 → 1.2      Harder
Score 85-89             +0.10 (normal step)    1.0 → 1.1      More challenging
Score 75-84             +0.05 (half step)      1.0 → 1.05     Slightly harder
Score 70-74             0.00 (maintain)        1.0 → 1.0      Same
Score 60-69             -0.05 (half step)      1.0 → 0.95     Slightly easier
Score 40-59             -0.10 (normal step)    1.0 → 0.9      More help
Score < 40              -0.20 (step ×2)        1.0 → 0.8      Much easier

Modification examples:
- Time multiplier: 1.5 (50% more time), 0.7 (30% less time)
- Precision threshold: +20 (harder), -10 (easier)
- Stability requirement: +15 (harder), -10 (easier)
"""


# ============================================================================
# COMMON PATTERNS
# ============================================================================

"""
PATTERN 1: Get lessons for a Vidya
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lessons = teaching_system.lesson_engine.get_lessons("dhanur")

for lesson in lessons:
    print(f"{lesson.name}: {lesson.description}")
    print(f"  Difficulty: {lesson.difficulty.name}")
    print(f"  Prerequisites: {lesson.prerequisites}")


PATTERN 2: Execute a complete lesson attempt
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Get lesson
lesson = teaching_system.lesson_engine.get_lesson("dhanur_001")

# Check prerequisites
if not teaching_system.lesson_engine.check_prerequisites(lesson, student):
    print("You must complete prerequisites first!")
    return

# Collect pose frames from camera
pose_frames = capture_from_camera()  # Your camera code

# Run full loop
results = teaching_system.run_teaching_loop(
    student_profile=student,
    lesson=lesson,
    pose_frames=pose_frames,
    time_taken=30.0
)

# Show results
print(results["completion_message"])
print(results["feedback"]["main_feedback"])
print(f"Should retry: {results['should_retry']}")


PATTERN 3: Manual control of each phase
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# Phase 1: Explain
explanation = teaching_system.explain_lesson(lesson, student)
# → Show to student

# Phase 2: Demonstrate
demo = teaching_system.demonstrate_lesson(lesson)
# → Show to student

# Phase 3: Let student practice (camera captures here)
session = teaching_system.start_practice_session(student, lesson)

# Phase 4-5: Analyze
performance = teaching_system.observe_and_analyze(
    session,
    pose_frames,
    time_taken=30.0
)

# Phase 6: Generate feedback
feedback = teaching_system.generate_feedback(session, performance)

# Phase 7: Decide
if teaching_system.determine_retry(student, lesson, performance):
    # Have student try again
    session2 = teaching_system.start_practice_session(student, lesson)
    # ... repeat
else:
    # Mark complete
    teaching_system.mark_lesson_complete(student, session)


PATTERN 4: Check adaptive difficulty
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

difficulty = student.difficulty_adjustment
level = teaching_system.difficulty_manager.get_difficulty_description(difficulty)
print(f"Current difficulty: {level}")

modifiers = teaching_system.difficulty_manager.apply_difficulty_modifiers(
    lesson, student
)

print(f"Time allowed: {lesson.duration_seconds * modifiers['time_multiplier']} seconds")
print(f"Precision needed: {modifiers['precision_threshold']}")


PATTERN 5: Track student progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

summary = teaching_system.progress_tracker.get_performance_summary(student)

print(f"Overall: {summary['overall_score']:.1f}%")
print(f"Completed: {summary['completed_lessons']} lessons")
print(f"Attempts: {summary['total_attempts']}")
print(f"Current mode: {summary['current_mode']}")

if summary['consecutive_successes'] >= 3:
    print("Great momentum! Keep going!")
elif summary['consecutive_failures'] >= 2:
    print("Take a break and come back refreshed.")


PATTERN 6: Get student dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

dashboard = teaching_system.get_student_dashboard(student)

print(f"Student: {dashboard['student_name']}")
print(f"Score: {dashboard['overall_score']:.1f}%")
print(f"Level: {dashboard['level']}")
print(f"Mode: {dashboard['current_mode']}")
print(f"Strengths: {', '.join(dashboard['strengths'])}")
print(f"Weaknesses: {', '.join(dashboard['weaknesses'])}")
"""


# ============================================================================
# TROUBLESHOOTING
# ============================================================================

"""
PROBLEM: "Lesson not found"
SOLUTION:
  - Check lesson_id spelling
  - Use get_lessons(vidya) to see available lessons
  - Lesson IDs are like: "dhanur_001", "khadga_002", etc.

PROBLEM: "Prerequisites not met"
SOLUTION:
  - Complete prerequisite lessons first
  - Use check_prerequisites() before attempting
  - See lesson.prerequisites for requirements

PROBLEM: "Performance score too low"
SOLUTION:
  - Check pose data is being captured correctly
  - Verify pose metrics (shoulder_alignment, stability_score, etc.)
  - Use lower difficulty level
  - Try again - minor adjustments matter

PROBLEM: "No next lesson"
SOLUTION:
  - All lessons in current Vidya are completed
  - Use lesson_engine.get_lessons() to see available Vidyas
  - Student has completed all content

PROBLEM: "Pose detection not working"
SOLUTION:
  - MediaPipe may not be installed: pip install mediapipe
  - Create PoseAnalyzer with use_simulation=True for testing
  - Check camera permissions and frame capture

PROBLEM: "Student profile not saving"
SOLUTION:
  - Always call save_student_to_db() after lesson completion
  - Use to_dict() to serialize before saving
  - Check database connection

PROBLEM: "Feedback seems generic"
SOLUTION:
  - Feedback generation requires performance.mistakes
  - Make sure evaluation_engine identifies mistakes correctly
  - Check if vidya-specific wisdom loaded (wisdom dict)
  - Score level affects feedback type (check thresholds)
"""


# ============================================================================
# PERFORMANCE OPTIMIZATION
# ============================================================================

"""
SLOW POSE DETECTION?
  - Reduce MediaPipe model_complexity (default is 1)
  - Skip every Nth frame instead of analyzing all
  - Use GPU acceleration if available
  - Increase batch size for processing

SLOW EVALUATION?
  - Evaluation is typically <100ms
  - Check if you're analyzing too many frames
  - Consider caching decision matrices

SLOW FEEDBACK GENERATION?
  - Feedback generation is typically <50ms
  - Pre-compute feedback templates
  - Cache vidya wisdom dictionaries

DATABASE BOTTLENECK?
  - Batch save operations
  - Use connection pooling
  - Index student_id and lesson_id fields
  - Consider NoSQL for flexibility

MEMORY ISSUES?
  - Don't keep full session history in memory
  - Archive old performances to database
  - Clear pose_frames after processing
  - Use generators for large datasets
"""


# ============================================================================
# EXTENDING THE SYSTEM
# ============================================================================

"""
ADD A NEW VIDYA:
  1. Add lessons to lesson_engine._initialize_all_lessons()
  2. Add wisdom dict to GuruFeedbackEngine.vidya_wisdom
  3. Add evaluation weights if needed
  4. Test with integration_example.py

ADD A NEW LESSON:
  1. Create Lesson object with proper criteria
  2. Set evaluation_criteria based on what to measure
  3. Set prerequisites for sequencing
  4. Add to appropriate _create_*_lessons() method

ADD A NEW EVALUATION METRIC:
  1. Add to pose_engine output
  2. Update evaluation_engine scoring
  3. Maybe update adaptive_difficulty
  4. Update feedback_engine corrections

ADD A NEW FEEDBACK TYPE:
  1. Create feedback template
  2. Add to performance_level mapping
  3. Link to vidya and score range
  4. Test with different scores

INTEGRATE NEW CAMERA SYSTEM:
  1. Extend PoseAnalyzer
  2. Override analyze_frame()
  3. Return PoseData with your metrics
  4. Rest of system works unchanged
"""


print(__doc__)
