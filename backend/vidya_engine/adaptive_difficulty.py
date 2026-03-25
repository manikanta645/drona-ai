"""
DRONA-AI: Adaptive Difficulty System
Dynamically adjusts lesson difficulty based on student performance.
Author: DRONA-AI System
"""

from typing import Dict, Optional
from .models import StudentProfile, Lesson, DifficultyLevel


class AdaptiveDifficultyManager:
    """
    Adaptively adjusts difficulty based on student performance.
    Keeps students in optimal challenge zone (not too easy, not too hard).
    """
    
    def __init__(self):
        """Initialize adaptive difficulty manager"""
        self.min_difficulty_adjustment = 0.5  # 50% - half difficulty
        self.max_difficulty_adjustment = 1.5  # 150% - increased difficulty
        self.adjustment_step = 0.1
        self.performance_thresholds = self._initialize_thresholds()
    
    def _initialize_thresholds(self) -> Dict:
        """
        Initialize performance thresholds that trigger difficulty adjustments.
        """
        return {
            "significantly_above": 90,  # Performance is 90+
            "well_above": 85,           # Performance is 85-89
            "above": 75,                # Performance is 75-84
            "target": 70,               # Target performance zone
            "below": 60,                # Performance below 60
            "struggling": 40             # Performance below 40
        }
    
    def adjust_difficulty(self, student_profile: StudentProfile, lesson_id: str):
        """
        Adjust difficulty for next lesson attempt based on recent performance.
        
        Args:
            student_profile: Student profile to adjust
            lesson_id: Current lesson ID
        """
        
        if lesson_id not in student_profile.completed_lessons:
            return
        
        lesson_progress = student_profile.completed_lessons[lesson_id]
        last_score = lesson_progress.last_score
        
        # Get adjustment direction
        adjustment = self._calculate_adjustment(last_score, student_profile)
        
        # Apply adjustment
        student_profile.difficulty_adjustment = max(
            self.min_difficulty_adjustment,
            min(
                self.max_difficulty_adjustment,
                student_profile.difficulty_adjustment + adjustment
            )
        )
    
    def _calculate_adjustment(self, score: float, student_profile: StudentProfile) -> float:
        """
        Calculate difficulty adjustment based on performance.
        
        Returns:
            Adjustment value (positive = easier, negative = harder)
        """
        
        thresholds = self.performance_thresholds
        
        # If significant success, increase difficulty
        if score >= thresholds["significantly_above"]:
            return self.adjustment_step * 2  # Double step for major success
        
        # If well above target, increase difficulty moderately
        elif score >= thresholds["well_above"]:
            return self.adjustment_step
        
        # If above target but within comfort zone, slight increase
        elif score >= thresholds["above"]:
            return self.adjustment_step * 0.5
        
        # In target zone, maintain difficulty
        elif score >= thresholds["target"]:
            return 0.0
        
        # Below target, reduce difficulty
        elif score >= thresholds["below"]:
            return -self.adjustment_step * 0.5
        
        # Significantly below target, reduce difficulty more
        elif score >= thresholds["struggling"]:
            return -self.adjustment_step
        
        # Critical failure, reduce significantly
        else:
            return -self.adjustment_step * 2
    
    def apply_difficulty_modifiers(
        self,
        lesson: Lesson,
        student_profile: StudentProfile
    ) -> Dict:
        """
        Generate difficulty modifiers based on adjustment factor.
        
        Args:
            lesson: Lesson being modified
            student_profile: Student profile with difficulty adjustment
        
        Returns:
            Dictionary of modifiers to apply
        """
        
        adjustment = student_profile.difficulty_adjustment
        modifiers = {}
        
        # Time constraint modifier
        if adjustment < 1.0:
            # Easier: more time
            modifiers["time_multiplier"] = 1.0 + (1.0 - adjustment) * 0.5
        else:
            # Harder: less time
            modifiers["time_multiplier"] = 1.0 - (adjustment - 1.0) * 0.3
        
        # Precision requirement modifier
        modifiers["precision_threshold"] = 70 + (adjustment - 1.0) * 20
        
        # Stability requirement modifier
        modifiers["stability_threshold"] = 70 + (adjustment - 1.0) * 15
        
        # Movement constraints (harder mode)
        if adjustment > 1.2:
            modifiers["movement_restricted"] = True
            modifiers["max_arm_movement"] = 10  # degrees
        else:
            modifiers["movement_restricted"] = False
            modifiers["max_arm_movement"] = 30
        
        # Retry policy modifier
        if adjustment < 0.8:
            modifiers["max_attempts"] = 10  # More attempts for struggling students
        elif adjustment < 1.0:
            modifiers["max_attempts"] = 7
        else:
            modifiers["max_attempts"] = 5
        
        return modifiers
    
    def adjust_based_on_patterns(self, student_profile: StudentProfile):
        """
        Adjust difficulty based on performance patterns.
        
        Args:
            student_profile: Student profile to adjust
        """
        
        # Check for learning plateau
        if student_profile.consecutive_failures >= 4:
            # Student is struggling, make it easier
            student_profile.difficulty_adjustment = max(
                self.min_difficulty_adjustment,
                student_profile.difficulty_adjustment - 0.2
            )
        
        # Check for rapid success
        if student_profile.consecutive_successes >= 3:
            # Student is progressing well, increase difficulty
            student_profile.difficulty_adjustment = min(
                self.max_difficulty_adjustment,
                student_profile.difficulty_adjustment + 0.15
            )
    
    def get_difficulty_description(self, adjustment: float) -> str:
        """
        Get human-readable difficulty description.
        """
        
        if adjustment <= 0.6:
            return "Foundational (Very Easy)"
        elif adjustment <= 0.8:
            return "Beginner (Easy)"
        elif adjustment <= 0.95:
            return "Guided (Moderate)"
        elif adjustment <= 1.05:
            return "Standard Difficulty"
        elif adjustment <= 1.2:
            return "Challenge (Hard)"
        elif adjustment <= 1.4:
            return "Master Challenge (Very Hard)"
        else:
            return "Elite Challenge (Extreme)"
    
    def suggest_next_lesson_readiness(
        self,
        student_profile: StudentProfile,
        current_lesson_progress
    ) -> bool:
        """
        Determine if student is ready to move to next lesson.
        
        Args:
            student_profile: Student profile
            current_lesson_progress: Current lesson's progress data
        
        Returns:
            True if ready to move to next lesson
        """
        
        # Must have minimum score
        if current_lesson_progress.best_score < 75:
            return False
        
        # If difficulty is too high, focus on current lesson
        if student_profile.difficulty_adjustment > 1.3:
            return False
        
        # If struggling significantly, don't move forward
        if student_profile.consecutive_failures >= 2:
            return False
        
        return True


class DifficultyScalingEngine:
    """
    Scales lesson difficulty by modifying requirements and constraints.
    """
    
    def __init__(self):
        """Initialize scaling engine"""
        self.difficulty_multipliers = {
            DifficultyLevel.BEGINNER: 1.0,
            DifficultyLevel.INTERMEDIATE: 1.2,
            DifficultyLevel.ADVANCED: 1.5
        }
    
    def scale_pose_requirements(
        self,
        base_requirements: Dict,
        difficulty_adjustment: float
    ) -> Dict:
        """
        Scale pose requirements based on difficulty.
        
        Args:
            base_requirements: Base pose requirements
            difficulty_adjustment: Current difficulty adjustment factor
        
        Returns:
            Scaled requirements
        """
        
        scaled = base_requirements.copy()
        
        # Increase precision requirements for harder difficulty
        if "shoulder_alignment_min" in scaled:
            scaled["shoulder_alignment_min"] += (difficulty_adjustment - 1.0) * 10
        
        if "stability_threshold" in scaled:
            scaled["stability_threshold"] += (difficulty_adjustment - 1.0) * 15
        
        # For easier difficulty, be more lenient
        if difficulty_adjustment < 1.0:
            for key in scaled:
                if "min" in key.lower() or "threshold" in key.lower():
                    scaled[key] -= (1.0 - difficulty_adjustment) * 5
        
        return scaled
    
    def scale_time_constraint(
        self,
        base_duration: float,
        difficulty_adjustment: float
    ) -> float:
        """
        Scale time constraint based on difficulty.
        
        Args:
            base_duration: Base duration in seconds
            difficulty_adjustment: Current difficulty adjustment factor
        
        Returns:
            Adjusted duration
        """
        
        # Harder = less time, Easier = more time
        if difficulty_adjustment > 1.0:
            # Reduce time by up to 30%
            reduction = (difficulty_adjustment - 1.0) * 0.3
            return base_duration * (1.0 - reduction)
        else:
            # Increase time by up to 50%
            increase = (1.0 - difficulty_adjustment) * 0.5
            return base_duration * (1.0 + increase)
    
    def get_success_criteria(
        self,
        base_criteria: float,
        difficulty_adjustment: float
    ) -> float:
        """
        Get required score threshold based on difficulty.
        
        Args:
            base_criteria: Base passing score (usually 70-80)
            difficulty_adjustment: Current difficulty adjustment factor
        
        Returns:
            Adjusted required score
        """
        
        if difficulty_adjustment > 1.0:
            # Higher requirement for harder difficulty
            increase = (difficulty_adjustment - 1.0) * 20
            return min(95, base_criteria + increase)
        else:
            # Lower requirement for easier difficulty
            decrease = (1.0 - difficulty_adjustment) * 10
            return max(50, base_criteria - decrease)
