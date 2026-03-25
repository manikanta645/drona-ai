"""
DRONA-AI VIDYA Engine - Main Package
Complete implementation of the DRONA-AI teaching system.
Author: DRONA-AI System
"""

from .models import (
    StudentProfile, Lesson, PerformanceData, PoseData, GuruFeedback,
    LessonProgress, TeachingSession, DifficultyLevel, StudentLevel,
    VidyaMode, PracticeMode
)

from .lesson_engine import LessonEngine
from .pose_engine import PoseAnalyzer, PoseValidator
from .evaluation_engine import PerformanceEvaluator
from .feedback_engine import GuruFeedbackEngine
from .progress_tracker import ProgressTracker
from .adaptive_difficulty import AdaptiveDifficultyManager, DifficultyScalingEngine
from .teaching_loop import TeachingLoopController, TeachingPhase

__version__ = "1.0.0"
__author__ = "DRONA-AI System"

__all__ = [
    # Models
    "StudentProfile",
    "Lesson",
    "PerformanceData",
    "PoseData",
    "GuruFeedback",
    "LessonProgress",
    "TeachingSession",
    "DifficultyLevel",
    "StudentLevel",
    "VidyaMode",
    "PracticeMode",
    # Engines
    "LessonEngine",
    "PoseAnalyzer",
    "PoseValidator",
    "PerformanceEvaluator",
    "GuruFeedbackEngine",
    "ProgressTracker",
    "AdaptiveDifficultyManager",
    "DifficultyScalingEngine",
    "TeachingLoopController",
    "TeachingPhase",
]

def create_teaching_system():
    """
    Factory function to create a complete DRONA-AI teaching system.
    
    Returns:
        TeachingLoopController with all systems initialized
    """
    return TeachingLoopController()
