"""
DRONA-AI: Teaching Loop Controller
Implements the core teaching loop: Explain → Demonstrate → Practice → Observe → 
Analyze → Feedback → Retry → Pass → Next Lesson
Author: DRONA-AI System
"""

import uuid
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

from .models import (
    StudentProfile, Lesson, PerformanceData, PoseData, GuruFeedback,
    TeachingSession, LessonProgress
)
from .lesson_engine import LessonEngine
from .pose_engine import PoseAnalyzer, PoseValidator
from .evaluation_engine import PerformanceEvaluator
from .feedback_engine import GuruFeedbackEngine
from .progress_tracker import ProgressTracker
from .adaptive_difficulty import AdaptiveDifficultyManager


class TeachingPhase(Enum):
    """Phases of the teaching loop"""
    EXPLAIN = "explain"
    DEMONSTRATE = "demonstrate"
    PRACTICE = "practice"
    OBSERVE = "observe"
    ANALYZE = "analyze"
    FEEDBACK = "feedback"
    RETRY_DECISION = "retry_decision"
    NEXT_LESSON = "next_lesson"


class TeachingLoopController:
    """
    Central orchestrator for the teaching system.
    Implements the complete teaching loop for each lesson.
    """
    
    def __init__(self):
        """Initialize teaching loop controller with all engines"""
        self.lesson_engine = LessonEngine()
        self.pose_analyzer = PoseAnalyzer()
        self.pose_validator = PoseValidator()
        self.evaluator = PerformanceEvaluator()
        self.feedback_engine = GuruFeedbackEngine()
        self.progress_tracker = ProgressTracker()
        self.difficulty_manager = AdaptiveDifficultyManager()
        
        self.active_sessions: Dict[str, TeachingSession] = {}
    
    # ==================== PHASE 1: EXPLAIN ====================
    def explain_lesson(self, lesson: Lesson, student_profile: StudentProfile) -> str:
        """
        Phase 1: EXPLAIN - Guru explains the lesson to student.
        
        Args:
            lesson: Lesson to explain
            student_profile: Student learning the lesson
        
        Returns:
            Explanation text
        """
        
        explanation_parts = [
            f"🧠 LESSON: {lesson.name}",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"{lesson.description}",
            "",
            f"📝 WHAT YOU WILL LEARN:",
            f"{lesson.instruction}",
            "",
            f"🎯 YOUR TASK:",
            f"{lesson.practice_task}",
            "",
        ]
        
        # Add vidya-specific wisdom
        vidya_wisdom = self._get_vidya_introduction(lesson.vidya)
        if vidya_wisdom:
            explanation_parts.append(f"💡 WISDOM FOR THIS PRACTICE:")
            explanation_parts.append(vidya_wisdom)
            explanation_parts.append("")
        
        # Add prerequisites reminder if any
        prerequisites = self.lesson_engine.get_prerequisites(lesson)
        if prerequisites and len(prerequisites) > 0:
            explanation_parts.append(f"📚 FOUNDATION (Prerequisite):")
            for prereq in prerequisites:
                explanation_parts.append(f"  • {prereq.name}")
            explanation_parts.append("")
        
        explanation_parts.append("Press READY when you are prepared to begin practice.")
        
        return "\n".join(explanation_parts)
    
    def _get_vidya_introduction(self, vidya: str) -> str:
        """Get intro wisdom for a vidya"""
        intros = {
            "dhanur": "The archer must be like a mountain - immovable, steady, focused. Every detail matters.",
            "khadga": "The sword becomes an extension of your will. Move with grace, strike with intention.",
            "dhyana": "Meditation is not effort. It is surrender to what is. Let go, and clarity comes.",
            "dharma": "Dharma is the righteous path. It is not always the easy path, but it is the true path.",
            "yudha": "War is won in the mind before it is won on the field. Strategy beats strength.",
            "shastra": "Knowledge is power. Understand the principles, and you understand everything.",
            "itihaasa": "The past teaches the present. Stories carry wisdom across generations.",
            "astras": "Divine weapons are not tools of destruction - they are expressions of cosmic law."
        }
        return intros.get(vidya, "Begin with focus and intention.")
    
    # ==================== PHASE 2: DEMONSTRATE ====================
    def demonstrate_lesson(self, lesson: Lesson) -> str:
        """
        Phase 2: DEMONSTRATE - Show student what correct form looks like.
        
        Args:
            lesson: Lesson to demonstrate
        
        Returns:
            Demonstration guidance
        """
        
        demo_text = f"""
🎬 DEMONSTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Watch carefully as I demonstrate the correct form:

{lesson.instruction}

KEY POINTS TO OBSERVE:
"""
        
        # Add key points based on evaluation criteria
        for criterion in lesson.evaluation_criteria[:3]:
            demo_text += f"\n  ✓ {criterion.replace('_', ' ').title()}"
        
        demo_text += """

[VIDEO/ANIMATION WOULD PLAY HERE]

Take your time to study this. Replay as many times as needed.
When ready, you will practice it yourself.
"""
        
        return demo_text
    
    # ==================== PHASE 3: PRACTICE ====================
    def start_practice_session(
        self,
        student_profile: StudentProfile,
        lesson: Lesson
    ) -> TeachingSession:
        """
        Phase 3: PRACTICE - Student begins practice.
        Creates a teaching session to track the practice attempt.
        
        Args:
            student_profile: Student profile
            lesson: Lesson to practice
        
        Returns:
            TeachingSession object
        """
        
        session = TeachingSession(
            session_id=str(uuid.uuid4()),
            student_id=student_profile.student_id,
            lesson_id=lesson.lesson_id,
            vidya=lesson.vidya,
            started_at=datetime.now()
        )
        
        self.active_sessions[session.session_id] = session
        
        return session
    
    def practice_instructions(self, lesson: Lesson) -> str:
        """Get practice mode instructions"""
        return f"""
🏋️ PRACTICE TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your task: {lesson.practice_task}

FOCUS AREAS:
{chr(10).join(f"  • {c.replace('_', ' ').title()}" for c in lesson.evaluation_criteria[:3])}

Now perform the practice. The camera will observe you.
Duration: approximately {lesson.duration_seconds} seconds.

Begin when ready. Show your best form.
"""
    
    # ==================== PHASE 4 & 5: OBSERVE + ANALYZE ====================
    def observe_and_analyze(
        self,
        session: TeachingSession,
        pose_frames: List[PoseData],
        answer_data: Optional[Dict] = None,
        time_taken: float = 0.0
    ) -> PerformanceData:
        """
        Phases 4-5: OBSERVE + ANALYZE - Capture and evaluate performance.
        
        Args:
            session: Teaching session
            pose_frames: List of PoseData from observation
            answer_data: Text answers if applicable
            time_taken: Total time taken
        
        Returns:
            PerformanceData with evaluation results
        """
        
        lesson = self.lesson_engine.get_lesson(session.lesson_id)
        student_profile = self._get_or_create_student_profile(session.student_id)
        
        # Evaluate performance
        performance = self.evaluator.evaluate_performance(
            student_profile,
            lesson,
            pose_frames,
            answer_data,
            time_taken
        )
        
        # Store in session
        session.performances.append(performance)
        
        return performance
    
    # ==================== PHASE 6: FEEDBACK ====================
    def generate_feedback(
        self,
        session: TeachingSession,
        performance: PerformanceData
    ) -> GuruFeedback:
        """
        Phase 6: FEEDBACK - Generate guru feedback.
        
        Args:
            session: Teaching session
            performance: Performance data to provide feedback on
        
        Returns:
            GuruFeedback object
        """
        
        lesson = self.lesson_engine.get_lesson(session.lesson_id)
        student_profile = self._get_or_create_student_profile(session.student_id)
        
        # Generate comprehensive feedback
        feedback = self.feedback_engine.generate_feedback(
            student_profile,
            lesson,
            performance
        )
        
        session.feedbacks.append(feedback)
        
        return feedback
    
    # ==================== PHASE 7: RETRY DECISION ====================
    def determine_retry(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        performance: PerformanceData
    ) -> bool:
        """
        Phase 7: RETRY DECISION - Should student retry or move forward?
        
        Args:
            student_profile: Student profile
            lesson: Current lesson
            performance: Latest performance
        
        Returns:
            True if should retry, False if should move forward
        """
        
        # Get passing criteria
        threshold = self.evaluator.evaluation_thresholds.get(
            lesson.difficulty, 75
        )
        
        # If passed, no retry needed
        if performance.final_score >= threshold:
            return False
        
        # If failed multiple times, offer strategic retreat
        if performance.attempt_number >= 5:
            return False  # Force progression or allow break
        
        # Otherwise, encourage retry
        return True
    
    # ==================== PHASE 8: COMPLETION ====================
    def mark_lesson_complete(
        self,
        student_profile: StudentProfile,
        session: TeachingSession
    ):
        """
        Phase 8: Mark lesson as completed or schedule retry.
        Updates student profile and progress.
        """
        
        if not session.performances:
            return
        
        best_performance = max(
            session.performances,
            key=lambda p: p.final_score
        )
        
        lesson = self.lesson_engine.get_lesson(session.lesson_id)
        
        # Update progress
        self.progress_tracker.update_progress(
            student_profile,
            session.lesson_id,
            best_performance
        )
        
        # Update tracking
        self.progress_tracker.track_attempt_sequence(
            student_profile,
            session.lesson_id,
            best_performance.final_score
        )
        
        # Adjust difficulty for next attempt
        self.difficulty_manager.adjust_difficulty(student_profile, session.lesson_id)
        
        # Mark session complete
        session.completed_at = datetime.now()
        session.is_completed = True
        session.final_score = best_performance.final_score
    
    # ==================== PHASE 9: NEXT LESSON ====================
    def suggest_next_lesson(self, student_profile: StudentProfile) -> Optional[Lesson]:
        """
        Phase 9: NEXT LESSON - Suggest what to do next.
        
        Args:
            student_profile: Student profile
        
        Returns:
            Next lesson or None
        """
        
        next_lesson = self.lesson_engine.get_next_lesson(student_profile)
        return next_lesson
    
    def completion_message(
        self,
        student_profile: StudentProfile,
        session: TeachingSession
    ) -> str:
        """Generate completion message"""
        
        lesson = self.lesson_engine.get_lesson(session.lesson_id)
        best_performance = max(
            session.performances,
            key=lambda p: p.final_score
        )
        
        message_parts = [
            "✨ LESSON COMPLETE ✨",
            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
            f"Lesson: {lesson.name}",
            f"Final Score: {best_performance.final_score:.1f}/100",
            f"Attempts: {len(session.performances)}",
            ""
        ]
        
        # Progress summary
        progress = self.progress_tracker.get_performance_summary(student_profile)
        message_parts.append(f"Overall Progress: {progress['overall_score']:.1f}%")
        message_parts.append(f"Lessons Completed: {progress['completed_lessons']}/{progress['total_lessons']}")
        message_parts.append("")
        
        # Next steps
        next_lesson = self.suggest_next_lesson(student_profile)
        if next_lesson:
            message_parts.append(f"📚 Next Lesson: {next_lesson.name}")
        else:
            message_parts.append("🎓 All lessons in this Vidya completed!")
        
        return "\n".join(message_parts)
    
    # ==================== FULL TEACHING LOOP ====================
    def run_teaching_loop(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        pose_frames: List[PoseData],
        answer_data: Optional[Dict] = None,
        time_taken: float = 0.0
    ) -> Dict:
        """
        Run complete teaching loop for one lesson attempt.
        
        Args:
            student_profile: Student
            lesson: Lesson to teach
            pose_frames: Captured pose data
            answer_data: Text answers if applicable
            time_taken: Time taken
        
        Returns:
            Results dictionary with all phases
        """
        
        # Phase 1: Explain (already done in UI, returning here for reference)
        explanation = self.explain_lesson(lesson, student_profile)
        
        # Phase 2: Demonstrate
        demonstration = self.demonstrate_lesson(lesson)
        
        # Phase 3: Practice starts (capture begins)
        session = self.start_practice_session(student_profile, lesson)
        
        # Phase 4-5: Observe + Analyze
        performance = self.observe_and_analyze(
            session, pose_frames, answer_data, time_taken
        )
        
        # Phase 6: Feedback
        feedback = self.generate_feedback(session, performance)
        
        # Phase 7: Retry Decision
        should_retry = self.determine_retry(student_profile, lesson, performance)
        
        # Phase 8: Completion
        if not should_retry or performance.final_score >= 80:
            self.mark_lesson_complete(student_profile, session)
        
        # Phase 9: Next Lesson
        next_lesson = self.suggest_next_lesson(student_profile)
        
        # Return complete results
        return {
            "session_id": session.session_id,
            "explanation": explanation,
            "demonstration": demonstration,
            "performance": performance.to_dict(),
            "feedback": feedback.to_dict(),
            "should_retry": should_retry,
            "next_lesson": next_lesson.to_dict() if next_lesson else None,
            "completion_message": self.completion_message(student_profile, session),
            "student_progress": self.progress_tracker.get_performance_summary(student_profile)
        }
    
    # ==================== HELPER METHODS ====================
    def _get_or_create_student_profile(self, student_id: str) -> StudentProfile:
        """
        Get or create student profile (placeholder for DB integration).
        """
        # In real implementation, this would fetch from database
        return StudentProfile(
            student_id=student_id,
            name=f"Student_{student_id}"
        )
    
    def get_student_dashboard(self, student_profile: StudentProfile) -> Dict:
        """
        Get comprehensive student dashboard data.
        """
        
        summary = self.progress_tracker.get_performance_summary(student_profile)
        
        return {
            "student_name": student_profile.name,
            "overall_score": student_profile.overall_score,
            "level": student_profile.level.value,
            "current_vidya": student_profile.current_vidya,
            "current_mode": student_profile.current_mode.value,
            "difficulty_level": self.difficulty_manager.get_difficulty_description(
                student_profile.difficulty_adjustment
            ),
            "progress": summary,
            "strengths": student_profile.strengths,
            "weaknesses": student_profile.weaknesses
        }
