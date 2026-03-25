"""
DRONA-AI: Performance Evaluation Engine
Combines pose data, text answers, and timing to evaluate student performance.
Author: DRONA-AI System
"""

import numpy as np
from typing import Dict, List, Optional, Tuple
from .models import (
    PerformanceData, PoseData, StudentProfile, Lesson, DifficultyLevel
)


class PerformanceEvaluator:
    """
    Evaluates student performance across different dimensions.
    Combines quantitative metrics (pose, time) with qualitative assessment.
    """
    
    def __init__(self):
        """Initialize evaluator with weight configurations"""
        self.metric_weights = self._initialize_weights()
        self.evaluation_thresholds = self._initialize_thresholds()
    
    def _initialize_weights(self) -> Dict:
        """
        Initialize weights for different metrics by vidya.
        Weights must sum to 1.0 for each vidya.
        """
        return {
            "dhanur": {
                "pose_accuracy": 0.50,
                "stability": 0.25,
                "timing": 0.15,
                "consistency": 0.10
            },
            "khadga": {
                "motion_quality": 0.40,
                "reaction_speed": 0.30,
                "form_consistency": 0.20,
                "power": 0.10
            },
            "dhyana": {
                "stillness": 0.40,
                "breathing_pattern": 0.30,
                "mental_clarity": 0.20,
                "duration": 0.10
            },
            "dharma": {
                "reasoning_depth": 0.40,
                "ethical_awareness": 0.30,
                "clarity": 0.20,
                "wisdom": 0.10
            },
            "yudha": {
                "strategic_thinking": 0.40,
                "planning_quality": 0.30,
                "feasibility": 0.20,
                "creativity": 0.10
            }
        }
    
    def _initialize_thresholds(self) -> Dict:
        """
        Initialize score thresholds for passing lessons.
        """
        return {
            DifficultyLevel.BEGINNER: 70,
            DifficultyLevel.INTERMEDIATE: 75,
            DifficultyLevel.ADVANCED: 85
        }
    
    def evaluate_performance(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        pose_data_list: List[PoseData],
        answer_data: Optional[Dict] = None,
        time_taken: float = 0.0
    ) -> PerformanceData:
        """
        Comprehensive performance evaluation.
        
        Args:
            student_profile: Student profile
            lesson: Lesson being evaluated
            pose_data_list: List of PoseData from camera
            answer_data: Text/theory answers if applicable
            time_taken: Time taken to complete lesson
        
        Returns:
            PerformanceData with scores and feedback
        """
        
        # Determine attempt number
        attempt_num = len(student_profile.completed_lessons.get(lesson.lesson_id, {}).performance_data or []) + 1
        
        # Initialize performance data
        performance = PerformanceData(
            lesson_id=lesson.lesson_id,
            attempt_number=attempt_num,
            pose_data=pose_data_list,
            answer_data=answer_data,
            time_taken=time_taken
        )
        
        # Evaluate based on vidya
        if lesson.camera_required and pose_data_list:
            performance = self._evaluate_pose_based(
                performance, lesson, student_profile, pose_data_list
            )
        elif answer_data:
            performance = self._evaluate_text_based(
                performance, lesson, student_profile, answer_data
            )
        else:
            performance.raw_score = 0.0
        
        # Apply time penalty if applicable
        performance = self._apply_time_adjustments(performance, lesson, time_taken)
        
        # Calculate final score
        performance.final_score = min(100, max(0, performance.raw_score))
        
        # Generate feedback tags
        performance.feedback_tags = self._generate_feedback_tags(performance, lesson)
        
        # Identify strengths and mistakes
        performance.strengths, performance.mistakes = self._identify_strengths_mistakes(
            performance, lesson, pose_data_list
        )
        
        return performance
    
    def _evaluate_pose_based(
        self,
        performance: PerformanceData,
        lesson: Lesson,
        student_profile: StudentProfile,
        pose_data_list: List[PoseData]
    ) -> PerformanceData:
        """
        Evaluate performance based on pose data.
        """
        
        if not pose_data_list:
            performance.raw_score = 0.0
            return performance
        
        vidya = lesson.vidya
        weights = self.metric_weights.get(vidya, {})
        
        scores = {}
        
        # Calculate pose accuracy
        pose_score = self._calculate_pose_accuracy(pose_data_list, lesson)
        scores["pose_accuracy"] = pose_score
        
        # Calculate stability
        stability_score = self._calculate_stability(pose_data_list)
        scores["stability"] = stability_score
        
        # Calculate consistency
        consistency_score = self._calculate_consistency(pose_data_list)
        scores["consistency"] = consistency_score
        
        # Calculate reaction/timing (if applicable)
        timing_score = self._calculate_timing_accuracy(pose_data_list, lesson)
        scores["timing"] = timing_score
        
        # Weighted average based on vidya
        raw_score = 0.0
        for metric, weight in weights.items():
            score_key = metric if metric in scores else metric.split("_")[0]
            if score_key in scores:
                raw_score += scores[score_key] * weight
        
        performance.raw_score = raw_score
        return performance
    
    def _evaluate_text_based(
        self,
        performance: PerformanceData,
        lesson: Lesson,
        student_profile: StudentProfile,
        answer_data: Dict
    ) -> PerformanceData:
        """
        Evaluate text-based answers (dharma, yudha, etc.)
        """
        
        # Extract answers
        answer_text = answer_data.get("answer", "")
        
        if not answer_text:
            performance.raw_score = 0.0
            return performance
        
        # Evaluate based on criteria
        score = self._evaluate_answer_quality(
            answer_text,
            lesson,
            student_profile
        )
        
        performance.raw_score = score
        return performance
    
    def _calculate_pose_accuracy(self, pose_data_list: List[PoseData], lesson: Lesson) -> float:
        """
        Calculate accuracy of pose against lesson requirements.
        
        Returns:
            Score 0-100
        """
        if not pose_data_list:
            return 0.0
        
        vidya = lesson.vidya
        
        if vidya == "dhanur":
            return self._calculate_dhanur_accuracy(pose_data_list)
        elif vidya == "khadga":
            return self._calculate_khadga_accuracy(pose_data_list)
        elif vidya == "dhyana":
            return self._calculate_dhyana_accuracy(pose_data_list)
        else:
            return 50.0  # Default
    
    def _calculate_dhanur_accuracy(self, pose_data_list: List[PoseData]) -> float:
        """
        Calculate Dhanur (archery) accuracy.
        Focus: shoulder alignment, spine straightness, arm angle.
        """
        accuracies = []
        
        for pose in pose_data_list:
            # Shoulder alignment score (0-100)
            alignment_score = pose.shoulder_alignment
            
            # Arm angle score (prefer 170+)
            arm_angle_score = min(100, (pose.arm_angle / 170) * 100)
            
            # Spine straightness bonus
            spine_bonus = 10 if pose.spine_straight else 0
            
            # Balance bonus
            balance_bonus = 5 if pose.body_balanced else 0
            
            pose_accuracy = (alignment_score * 0.5 + arm_angle_score * 0.3 + spine_bonus + balance_bonus) / 1.3
            accuracies.append(min(100, pose_accuracy))
        
        return np.mean(accuracies) if accuracies else 0.0
    
    def _calculate_khadga_accuracy(self, pose_data_list: List[PoseData]) -> float:
        """
        Calculate Khadga (sword) accuracy.
        Focus: arm angle, balance, dynamic movement.
        """
        accuracies = []
        
        for pose in pose_data_list:
            # Arm angle for sword (140-180 degrees)
            arm_score = 100 if 140 <= pose.arm_angle <= 180 else abs(pose.arm_angle - 160) * -0.5 + 100
            arm_score = max(0, min(100, arm_score))
            
            # Balance is crucial
            balance_score = 100 if pose.body_balanced else 50
            
            # Alignment
            alignment_score = pose.shoulder_alignment
            
            pose_accuracy = (arm_score * 0.4 + balance_score * 0.4 + alignment_score * 0.2)
            accuracies.append(min(100, pose_accuracy))
        
        return np.mean(accuracies) if accuracies else 0.0
    
    def _calculate_dhyana_accuracy(self, pose_data_list: List[PoseData]) -> float:
        """
        Calculate Dhyana (meditation) accuracy.
        Focus: stillness, alignment, minimal movement.
        """
        accuracies = []
        
        for pose in pose_data_list:
            # Stillness (no movement)
            stillness_score = 100 if not pose.movement_detected else 50
            
            # Perfect alignment
            alignment_score = pose.shoulder_alignment
            
            # Spine straightness critical
            spine_bonus = 20 if pose.spine_straight else 0
            
            pose_accuracy = (stillness_score * 0.5 + alignment_score * 0.3 + spine_bonus) / 1.3
            accuracies.append(min(100, pose_accuracy))
        
        return np.mean(accuracies) if accuracies else 0.0
    
    def _calculate_stability(self, pose_data_list: List[PoseData]) -> float:
        """
        Calculate stability score from pose data.
        
        Returns:
            Score 0-100
        """
        if not pose_data_list:
            return 0.0
        
        stability_scores = [pose.stability_score for pose in pose_data_list]
        return np.mean(stability_scores)
    
    def _calculate_consistency(self, pose_data_list: List[PoseData]) -> float:
        """
        Calculate consistency across all poses.
        Lower variance = higher consistency.
        
        Returns:
            Score 0-100 (100 = perfectly consistent)
        """
        if len(pose_data_list) < 2:
            return 100.0
        
        # Calculate variance in key metrics
        arm_angles = [pose.arm_angle for pose in pose_data_list]
        alignments = [pose.shoulder_alignment for pose in pose_data_list]
        
        arm_variance = np.var(arm_angles)
        alignment_variance = np.var(alignments)
        
        # Convert variance to consistency score (lower variance = higher score)
        max_variance = 100  # Maximum acceptable variance
        consistency = 100 - (arm_variance + alignment_variance) / 2
        consistency = max(0, min(100, consistency))
        
        return consistency
    
    def _calculate_timing_accuracy(self, pose_data_list: List[PoseData], lesson: Lesson) -> float:
        """
        Calculate timing accuracy (how well student follows time constraints).
        
        Returns:
            Score 0-100
        """
        if not pose_data_list or len(pose_data_list) < 2:
            return 50.0
        
        # This is a placeholder - would integrate with lesson timing requirements
        return 75.0
    
    def _apply_time_adjustments(
        self,
        performance: PerformanceData,
        lesson: Lesson,
        time_taken: float
    ) -> PerformanceData:
        """
        Apply adjustments based on time taken.
        """
        
        # Too fast might indicate not taking seriously
        if time_taken < lesson.duration_seconds * 0.5:
            performance.raw_score *= 0.85
        
        # Too slow might indicate struggle (slight penalty)
        elif time_taken > lesson.duration_seconds * 2:
            performance.raw_score *= 0.95
        
        return performance
    
    def _generate_feedback_tags(self, performance: PerformanceData, lesson: Lesson) -> List[str]:
        """
        Generate tags for feedback to guide guru feedback generation.
        """
        tags = []
        
        if performance.final_score >= 85:
            tags.append("excellent")
        elif performance.final_score >= 70:
            tags.append("good")
        elif performance.final_score >= 50:
            tags.append("needs_improvement")
        else:
            tags.append("poor")
        
        # Add specific tags based on mistakes
        for mistake in performance.mistakes:
            if "alignment" in mistake.lower():
                tags.append("alignment_issue")
            if "balance" in mistake.lower():
                tags.append("balance_issue")
            if "stability" in mistake.lower():
                tags.append("stability_issue")
            if "movement" in mistake.lower():
                tags.append("movement_issue")
        
        return tags
    
    def _identify_strengths_mistakes(
        self,
        performance: PerformanceData,
        lesson: Lesson,
        pose_data_list: List[PoseData]
    ) -> Tuple[List[str], List[str]]:
        """
        Identify student strengths and mistakes.
        """
        strengths = []
        mistakes = []
        
        if not pose_data_list:
            return strengths, mistakes
        
        # Average metrics
        avg_alignment = np.mean([p.shoulder_alignment for p in pose_data_list])
        avg_stability = np.mean([p.stability_score for p in pose_data_list])
        avg_arm_angle = np.mean([p.arm_angle for p in pose_data_list])
        
        # Check strengths
        if avg_alignment > 85:
            strengths.append("Excellent shoulder alignment")
        if avg_stability > 80:
            strengths.append("Strong body stability")
        if performance.final_score >= 80:
            strengths.append("Consistent performance")
        
        # Check mistakes
        if avg_alignment < 75:
            mistakes.append("Shoulder alignment needs adjustment")
        if avg_stability < 70:
            mistakes.append("Body stability is weak")
        if not pose_data_list[0].spine_straight:
            mistakes.append("Spine needs to be straighter")
        if not pose_data_list[0].body_balanced:
            mistakes.append("Body balance issue detected")
        
        return strengths, mistakes
    
    def _evaluate_answer_quality(
        self,
        answer_text: str,
        lesson: Lesson,
        student_profile: StudentProfile
    ) -> float:
        """
        Evaluate quality of text-based answer.
        Uses length, keywords, and depth indicators.
        
        Returns:
            Score 0-100
        """
        
        score = 50.0  # Base score
        
        # Length indicates effort
        word_count = len(answer_text.split())
        if word_count < 10:
            score -= 30
        elif word_count < 50:
            score -= 10
        elif word_count > 500:
            score += 10
        
        # Depth indicators
        depth_words = ["because", "therefore", "thus", "however", "consequently", "analysis"]
        for word in depth_words:
            if word.lower() in answer_text.lower():
                score += 5
        
        # Check for key concepts (basic check)
        if "key" in answer_text.lower() or "important" in answer_text.lower():
            score += 5
        
        # Punctuation and structure
        if answer_text.count(".") >= 2:
            score += 5
        
        return min(100, score)
    
    def determine_pass(self, performance: PerformanceData, lesson: Lesson) -> bool:
        """
        Determine if student passed the lesson.
        
        Args:
            performance: Performance data
            lesson: Lesson
        
        Returns:
            True if passed (score >= threshold)
        """
        threshold = self.evaluation_thresholds.get(lesson.difficulty, 75)
        return performance.final_score >= threshold
