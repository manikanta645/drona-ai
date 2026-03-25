"""
DRONA-AI: Core Data Models
Core data structures for the VIDYA teaching system.
Author: DRONA-AI System
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from enum import Enum


class DifficultyLevel(Enum):
    """Difficulty levels for lessons"""
    BEGINNER = 1
    INTERMEDIATE = 2
    ADVANCED = 3


class StudentLevel(Enum):
    """Student proficiency levels"""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class VidyaMode(Enum):
    """Vidya teaching modes"""
    DHANUR = "dhanur"
    KHADGA = "khadga"
    DHYANA = "dhyana"
    DHARMA = "dharma"
    YUDHA = "yudha"
    SHASTRA = "shastra"
    ITIHAASA = "itihaasa"
    ASTRAS = "astras"


class PracticeMode(Enum):
    """Practice mode selection based on performance"""
    LEARNING = "learning"
    PRACTICE = "practice"
    CHALLENGE = "challenge"
    CORRECTION = "correction"
    OBSERVATION = "observation"


@dataclass
class PoseData:
    """Pose detection results from camera analysis"""
    timestamp: float
    shoulder_alignment: float  # 0-100
    arm_angle: float  # degrees
    spine_straight: bool
    head_position: str  # "forward", "tilted_left", "tilted_right"
    body_balanced: bool
    stability_score: float  # 0-100
    movement_detected: bool
    confidence: float  # 0-100 (model confidence)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "timestamp": self.timestamp,
            "shoulder_alignment": self.shoulder_alignment,
            "arm_angle": self.arm_angle,
            "spine_straight": self.spine_straight,
            "head_position": self.head_position,
            "body_balanced": self.body_balanced,
            "stability_score": self.stability_score,
            "movement_detected": self.movement_detected,
            "confidence": self.confidence
        }


@dataclass
class Lesson:
    """Lesson structure for a VIDYA"""
    lesson_id: str
    vidya: str  # dhanur, khadga, dhyana, etc.
    name: str
    description: str
    instruction: str
    practice_task: str
    evaluation_criteria: List[str]  # List of what to evaluate
    difficulty: DifficultyLevel
    duration_seconds: int  # Expected duration
    prerequisites: List[str] = field(default_factory=list)
    camera_required: bool = True
    keywords: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "lesson_id": self.lesson_id,
            "vidya": self.vidya,
            "name": self.name,
            "description": self.description,
            "instruction": self.instruction,
            "practice_task": self.practice_task,
            "evaluation_criteria": self.evaluation_criteria,
            "difficulty": self.difficulty.value,
            "duration_seconds": self.duration_seconds,
            "prerequisites": self.prerequisites,
            "camera_required": self.camera_required
        }


@dataclass
class PerformanceData:
    """Performance metrics for a single attempt"""
    lesson_id: str
    attempt_number: int
    pose_data: List[PoseData]
    time_taken: float  # seconds
    answer_data: Optional[Dict] = None  # text answers for theory
    raw_score: float = 0.0  # 0-100
    final_score: float = 0.0  # 0-100
    mistakes: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    feedback_tags: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "lesson_id": self.lesson_id,
            "attempt_number": self.attempt_number,
            "pose_data": [p.to_dict() for p in self.pose_data] if self.pose_data else [],
            "time_taken": self.time_taken,
            "answer_data": self.answer_data,
            "raw_score": self.raw_score,
            "final_score": self.final_score,
            "mistakes": self.mistakes,
            "strengths": self.strengths,
            "feedback_tags": self.feedback_tags,
            "timestamp": self.timestamp.isoformat()
        }


@dataclass
class LessonProgress:
    """Progress tracking for a single lesson"""
    lesson_id: str
    attempts: int = 0
    best_score: float = 0.0
    last_score: float = 0.0
    completed: bool = False
    completed_at: Optional[datetime] = None
    improvement: bool = False
    attempt_history: List[float] = field(default_factory=list)
    performance_data: List[PerformanceData] = field(default_factory=list)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "lesson_id": self.lesson_id,
            "attempts": self.attempts,
            "best_score": self.best_score,
            "last_score": self.last_score,
            "completed": self.completed,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "improvement": self.improvement,
            "attempt_history": self.attempt_history
        }


@dataclass
class StudentProfile:
    """Complete student profile and progress tracking"""
    student_id: str
    name: str
    level: StudentLevel = StudentLevel.BEGINNER
    current_vidya: Optional[str] = None
    current_lesson: Optional[str] = None
    
    # Progress tracking
    progress_scores: Dict[str, float] = field(default_factory=dict)  # vidya -> score
    strengths: List[str] = field(default_factory=list)
    weaknesses: List[str] = field(default_factory=list)
    completed_lessons: Dict[str, LessonProgress] = field(default_factory=dict)
    attempt_history: List[PerformanceData] = field(default_factory=list)
    overall_score: float = 0.0
    
    # Adaptive system
    current_mode: PracticeMode = PracticeMode.LEARNING
    difficulty_adjustment: float = 1.0  # 1.0 = normal, <1 = easier, >1 = harder
    retry_count: int = 0
    consecutive_successes: int = 0
    consecutive_failures: int = 0
    
    # Metadata
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "student_id": self.student_id,
            "name": self.name,
            "level": self.level.value,
            "current_vidya": self.current_vidya,
            "current_lesson": self.current_lesson,
            "progress_scores": self.progress_scores,
            "strengths": self.strengths,
            "weaknesses": self.weaknesses,
            "overall_score": self.overall_score,
            "current_mode": self.current_mode.value,
            "difficulty_adjustment": self.difficulty_adjustment,
            "consecutive_successes": self.consecutive_successes,
            "consecutive_failures": self.consecutive_failures
        }
    
    def get_vidya_score(self, vidya: str) -> float:
        """Get score for a specific vidya"""
        return self.progress_scores.get(vidya, 0.0)
    
    def get_completed_lessons_count(self) -> int:
        """Get total completed lessons"""
        return sum(1 for lesson in self.completed_lessons.values() if lesson.completed)


@dataclass
class GuruFeedback:
    """Feedback generated by the AI guru"""
    feedback_id: str
    student_id: str
    lesson_id: str
    score: float  # Student score
    performance_result: Dict  # Raw performance data
    main_feedback: str  # Primary feedback message
    corrections: List[str]  # Specific corrections
    encouragement: str  # Motivational message
    next_steps: str  # What to do next
    tone: str  # "calm", "encouraging", "strict", "philosophical", etc.
    vidya_specific_teaching: str  # Vidya-specific wisdom
    timestamp: datetime = field(default_factory=datetime.now)
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "feedback_id": self.feedback_id,
            "student_id": self.student_id,
            "lesson_id": self.lesson_id,
            "score": self.score,
            "main_feedback": self.main_feedback,
            "corrections": self.corrections,
            "encouragement": self.encouragement,
            "next_steps": self.next_steps,
            "tone": self.tone,
            "vidya_specific_teaching": self.vidya_specific_teaching,
            "timestamp": self.timestamp.isoformat()
        }


@dataclass
class TeachingSession:
    """A complete teaching session for a lesson"""
    session_id: str
    student_id: str
    lesson_id: str
    vidya: str
    started_at: datetime = field(default_factory=datetime.now)
    completed_at: Optional[datetime] = None
    performances: List[PerformanceData] = field(default_factory=list)
    feedbacks: List[GuruFeedback] = field(default_factory=list)
    is_completed: bool = False
    final_score: float = 0.0
    
    def to_dict(self) -> Dict:
        """Convert to dictionary"""
        return {
            "session_id": self.session_id,
            "student_id": self.student_id,
            "lesson_id": self.lesson_id,
            "vidya": self.vidya,
            "started_at": self.started_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "is_completed": self.is_completed,
            "final_score": self.final_score,
            "attempt_count": len(self.performances)
        }
