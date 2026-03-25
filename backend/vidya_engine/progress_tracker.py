"""
DRONA-AI: Progress Tracking System
Tracks student improvement, identifies patterns, and guides learning path.
Author: DRONA-AI System
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime
from .models import (
    StudentProfile, LessonProgress, PerformanceData, PracticeMode
)


class ProgressTracker:
    """
    Comprehensive progress tracking system.
    Monitors improvement, identifies struggling areas, and tracks patterns.
    """
    
    def __init__(self):
        """Initialize progress tracker"""
        self.improvement_threshold = 10  # Minimum score improvement
        self.plateau_threshold = 3  # Attempts without improvement
    
    def update_progress(
        self,
        student_profile: StudentProfile,
        lesson_id: str,
        performance_data: PerformanceData
    ):
        """
        Update student progress with new performance data.
        
        Args:
            student_profile: Student profile to update
            lesson_id: Lesson ID
            performance_data: New performance data
        """
        
        # Get or create lesson progress
        if lesson_id not in student_profile.completed_lessons:
            student_profile.completed_lessons[lesson_id] = LessonProgress(lesson_id=lesson_id)
        
        lesson_progress = student_profile.completed_lessons[lesson_id]
        
        # Update metrics
        lesson_progress.attempts += 1
        lesson_progress.attempt_history.append(performance_data.final_score)
        lesson_progress.performance_data.append(performance_data)
        
        # Update best score
        if performance_data.final_score > lesson_progress.best_score:
            lesson_progress.best_score = performance_data.final_score
        
        lesson_progress.last_score = performance_data.final_score
        
        # Check if improving
        if lesson_progress.attempts >= 2:
            previous_score = lesson_progress.attempt_history[-2]
            improvement = performance_data.final_score - previous_score
            lesson_progress.improvement = improvement > self.improvement_threshold
        
        # Check if completed
        if performance_data.final_score >= 80:
            lesson_progress.completed = True
            lesson_progress.completed_at = datetime.now()
        
        # Update student overall metrics
        self._update_overall_metrics(student_profile)
        self._update_student_mode(student_profile)
    
    def _update_overall_metrics(self, student_profile: StudentProfile):
        """Update overall student metrics"""
        
        # Calculate overall score
        if student_profile.completed_lessons:
            completed = [
                p.best_score for p in student_profile.completed_lessons.values()
                if p.completed
            ]
            if completed:
                student_profile.overall_score = sum(completed) / len(completed)
        
        # Update vidya scores
        for lesson_id, lesson_progress in student_profile.completed_lessons.items():
            # Parse vidya from lesson_id (e.g., "dhanur_001" -> "dhanur")
            vidya = lesson_id.split("_")[0] if "_" in lesson_id else "unknown"
            
            if vidya not in student_profile.progress_scores:
                student_profile.progress_scores[vidya] = 0.0
            
            # Update with best score from this lesson
            student_profile.progress_scores[vidya] = max(
                student_profile.progress_scores[vidya],
                lesson_progress.best_score
            )
    
    def _update_student_mode(self, student_profile: StudentProfile):
        """
        Update student's practice mode based on performance pattern.
        """
        
        if student_profile.overall_score >= 85:
            student_profile.current_mode = PracticeMode.CHALLENGE
        elif student_profile.overall_score >= 70:
            student_profile.current_mode = PracticeMode.PRACTICE
        elif student_profile.consecutive_failures >= 3:
            student_profile.current_mode = PracticeMode.CORRECTION
        else:
            student_profile.current_mode = PracticeMode.LEARNING
    
    def track_attempt_sequence(
        self,
        student_profile: StudentProfile,
        lesson_id: str,
        new_score: float
    ):
        """
        Track sequence of attempts to identify patterns.
        Updates consecutive successes/failures.
        """
        
        if lesson_id not in student_profile.completed_lessons:
            return
        
        lesson_progress = student_profile.completed_lessons[lesson_id]
        
        # Check if improving
        if len(lesson_progress.attempt_history) >= 1:
            previous_score = lesson_progress.attempt_history[-1]
            
            if new_score >= 70:  # Passing score
                if previous_score >= 70:
                    # Continued success
                    student_profile.consecutive_successes += 1
                    student_profile.consecutive_failures = 0
                else:
                    # Recovered from failure
                    student_profile.consecutive_failures = 0
                    student_profile.consecutive_successes = 1
            else:  # Failing
                if previous_score < 70:
                    # Continued failure
                    student_profile.consecutive_failures += 1
                    student_profile.consecutive_successes = 0
                else:
                    # Regression
                    student_profile.consecutive_successes = 0
                    student_profile.consecutive_failures = 1
    
    def identify_strengths_weaknesses(self, student_profile: StudentProfile):
        """
        Analyze performance data to identify strengths and weaknesses.
        """
        
        strength_scores = {}
        weakness_scores = {}
        
        for lesson_id, lesson_progress in student_profile.completed_lessons.items():
            vidya = lesson_id.split("_")[0] if "_" in lesson_id else "unknown"
            
            if lesson_progress.best_score >= 80:
                if vidya not in strength_scores:
                    strength_scores[vidya] = []
                strength_scores[vidya].append(lesson_progress.best_score)
            elif lesson_progress.best_score < 70:
                if vidya not in weakness_scores:
                    weakness_scores[vidya] = []
                weakness_scores[vidya].append(lesson_progress.best_score)
        
        # Update student profile
        student_profile.strengths = [
            f"{name.capitalize()} (avg: {sum(scores)/len(scores):.0f}%)"
            for name, scores in strength_scores.items()
        ]
        
        student_profile.weaknesses = [
            f"{name.capitalize()} (avg: {sum(scores)/len(scores):.0f}%)"
            for name, scores in weakness_scores.items()
        ]
    
    def get_improvement_trend(self, lesson_progress: LessonProgress) -> float:
        """
        Calculate improvement trend for a lesson.
        
        Returns:
            Positive = improving, Negative = declining, 0 = stable
        """
        
        if len(lesson_progress.attempt_history) < 2:
            return 0.0
        
        # Simple linear trend
        first_half = lesson_progress.attempt_history[:len(lesson_progress.attempt_history)//2]
        second_half = lesson_progress.attempt_history[len(lesson_progress.attempt_history)//2:]
        
        first_avg = sum(first_half) / len(first_half)
        second_avg = sum(second_half) / len(second_half)
        
        return second_avg - first_avg
    
    def get_learning_velocity(self, student_profile: StudentProfile) -> float:
        """
        Calculate how quickly student is learning overall.
        
        Returns:
            Positive value indicating learning speed
        """
        
        velocities = []
        
        for lesson_progress in student_profile.completed_lessons.values():
            trend = self.get_improvement_trend(lesson_progress)
            if trend != 0:
                velocities.append(trend)
        
        if velocities:
            return sum(velocities) / len(velocities)
        
        return 0.0
    
    def detect_plateau(self, lesson_progress: LessonProgress) -> bool:
        """
        Detect if student performance has plateaued on a lesson.
        
        Returns:
            True if plateaued (no improvement after multiple attempts)
        """
        
        if len(lesson_progress.attempt_history) < self.plateau_threshold:
            return False
        
        # Check last N attempts
        recent = lesson_progress.attempt_history[-self.plateau_threshold:]
        
        # If all recent attempts have variance < 5 points, it's a plateau
        variance = max(recent) - min(recent)
        
        return variance < 5
    
    def get_recommendation(self, student_profile: StudentProfile, lesson_id: str) -> str:
        """
        Get recommendation for student based on their performance.
        
        Args:
            student_profile: Student profile
            lesson_id: Current lesson ID
        
        Returns:
            Recommendation string
        """
        
        if lesson_id not in student_profile.completed_lessons:
            return "Begin this lesson."
        
        lesson_progress = student_profile.completed_lessons[lesson_id]
        
        # Check completion
        if lesson_progress.completed:
            return "Lesson completed. Move to next lesson."
        
        # Check plateau
        if self.detect_plateau(lesson_progress):
            return "You've plateaued here. Try a different approach or take a break."
        
        # Check performance level
        if lesson_progress.best_score >= 80:
            return "Almost there! One more focused attempt."
        elif lesson_progress.best_score >= 60:
            return "You're making progress. Keep practicing this technique."
        elif lesson_progress.attempts >= 5:
            return "Consider reviewing the basics before trying again."
        else:
            return "Practice again. You'll find your rhythm."
    
    def calculate_estimated_completion_time(
        self,
        student_profile: StudentProfile,
        remaining_lessons: int
    ) -> float:
        """
        Estimate time to complete remaining lessons based on velocity.
        
        Args:
            student_profile: Student profile
            remaining_lessons: Number of lessons left
        
        Returns:
            Estimated time in hours
        """
        
        # Average lesson time estimate
        avg_attempt_duration = 10  # minutes per attempt
        avg_attempts_per_lesson = (
            sum(p.attempts for p in student_profile.completed_lessons.values()) /
            len(student_profile.completed_lessons)
            if student_profile.completed_lessons else 1
        )
        
        time_per_lesson = avg_attempt_duration * avg_attempts_per_lesson
        
        return (time_per_lesson * remaining_lessons) / 60  # Convert to hours
    
    def get_performance_summary(self, student_profile: StudentProfile) -> Dict:
        """
        Generate a comprehensive performance summary.
        """
        
        completed_count = sum(
            1 for p in student_profile.completed_lessons.values()
            if p.completed
        )
        
        total_lessons = len(student_profile.completed_lessons)
        total_attempts = sum(
            p.attempts for p in student_profile.completed_lessons.values()
        )
        
        return {
            "overall_score": student_profile.overall_score,
            "completed_lessons": completed_count,
            "total_lessons": total_lessons,
            "total_attempts": total_attempts,
            "average_attempts_per_lesson": total_attempts / total_lessons if total_lessons > 0 else 0,
            "consecutive_successes": student_profile.consecutive_successes,
            "consecutive_failures": student_profile.consecutive_failures,
            "current_mode": student_profile.current_mode.value,
            "difficulty_adjustment": student_profile.difficulty_adjustment,
            "strengths": student_profile.strengths,
            "weaknesses": student_profile.weaknesses
        }
