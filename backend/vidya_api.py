"""
DRONA-AI VIDYA API
Clean modular API over the vidya_engine teaching system.
"""

from __future__ import annotations

import uuid
import time
from dataclasses import asdict
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from vidya_engine.models import (
    PoseData,
    StudentLevel,
    StudentProfile,
    PracticeMode,
)
from vidya_engine.lesson_engine import LessonEngine
from vidya_engine.pose_engine import PoseAnalyzer
from vidya_engine.evaluation_engine import PerformanceEvaluator
from vidya_engine.feedback_engine import GuruFeedbackEngine
from vidya_engine.progress_tracker import ProgressTracker
from vidya_engine.adaptive_difficulty import AdaptiveDifficultyManager
from vidya_engine.teaching_loop import TeachingLoopController

try:
    from voice_module import init_voice_module
    VOICE_ENABLED = True
except ImportError:
    VOICE_ENABLED = False


router = APIRouter(prefix="/api/vidya", tags=["VIDYA"])

# Engines
lesson_engine = LessonEngine()
pose_analyzer = PoseAnalyzer()
evaluator = PerformanceEvaluator()
feedback_engine = GuruFeedbackEngine()
progress_tracker = ProgressTracker()
difficulty_manager = AdaptiveDifficultyManager()
teaching_loop = TeachingLoopController()
voice_module = init_voice_module() if VOICE_ENABLED else None

# In-memory stores (swap with DB later)
students_db: Dict[str, StudentProfile] = {}
sessions_db: Dict[str, Dict[str, Any]] = {}


class StudentCreateRequest(BaseModel):
    name: str
    level: str = "beginner"
    current_vidya: str = "dhanur"


class PoseFeatureRequest(BaseModel):
    shoulder_alignment: float = 80
    arm_angle: float = 160
    spine_straight: bool = True
    head_position: str = "forward"
    body_balanced: bool = True
    stability_score: float = 75
    movement_detected: bool = False
    confidence: float = 90


class PerformanceRequest(BaseModel):
    student_id: str
    vidya_id: str
    lesson_id: str
    pose_frames: List[PoseFeatureRequest] = Field(default_factory=list)
    text_answer: Optional[str] = None
    time_taken: float = 0.0


class ModeSelectRequest(BaseModel):
    student_id: str


def _parse_level(level: str) -> StudentLevel:
    normalized = (level or "").strip().lower()
    if normalized == "advanced":
        return StudentLevel.ADVANCED
    if normalized == "intermediate":
        return StudentLevel.INTERMEDIATE
    return StudentLevel.BEGINNER


def _student_or_404(student_id: str) -> StudentProfile:
    student = students_db.get(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


def _lesson_or_404(lesson_id: str):
    lesson = lesson_engine.get_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


def _to_pose_data(frame: PoseFeatureRequest) -> PoseData:
    return PoseData(
        timestamp=time.time(),
        shoulder_alignment=frame.shoulder_alignment,
        arm_angle=frame.arm_angle,
        spine_straight=frame.spine_straight,
        head_position=frame.head_position,
        body_balanced=frame.body_balanced,
        stability_score=frame.stability_score,
        movement_detected=frame.movement_detected,
        confidence=frame.confidence,
    )


def _select_mode(student: StudentProfile) -> PracticeMode:
    # Rules:
    # Low score -> Practice, High score -> Challenge,
    # repeated mistakes -> Correction, idle -> Observation.
    if student.consecutive_failures >= 3:
        return PracticeMode.CORRECTION
    if student.overall_score >= 85:
        return PracticeMode.CHALLENGE
    if student.overall_score <= 45:
        return PracticeMode.PRACTICE
    if student.last_activity and (datetime.now() - student.last_activity).total_seconds() > 1800:
        return PracticeMode.OBSERVATION
    return PracticeMode.LEARNING


@router.post("/student/create")
async def create_student(request: StudentCreateRequest):
    student_id = str(uuid.uuid4())
    student = StudentProfile(
        student_id=student_id,
        name=request.name,
        level=_parse_level(request.level),
        current_vidya=request.current_vidya,
    )
    students_db[student_id] = student
    return {"success": True, "student_id": student_id, "student": student.to_dict()}


@router.get("/student/{student_id}")
async def get_student(student_id: str):
    return _student_or_404(student_id).to_dict()


@router.get("/lessons/{vidya_id}")
async def get_lessons(vidya_id: str):
    lessons = lesson_engine.get_lessons(vidya_id)
    return {
        "vidya": vidya_id,
        "count": len(lessons),
        "lessons": [lesson.to_dict() for lesson in lessons],
    }


@router.get("/lesson/{vidya_id}/{lesson_id}")
async def get_lesson(vidya_id: str, lesson_id: str):
    lesson = _lesson_or_404(lesson_id)
    if lesson.vidya != vidya_id:
        raise HTTPException(status_code=404, detail="Lesson not found in requested vidya")
    return lesson.to_dict()


@router.post("/next-lesson/{student_id}")
async def get_next_lesson(student_id: str):
    student = _student_or_404(student_id)
    next_lesson = lesson_engine.get_next_lesson(student)
    return {"next_lesson": next_lesson.to_dict() if next_lesson else None}


@router.post("/select-mode")
async def select_mode(payload: ModeSelectRequest):
    student = _student_or_404(payload.student_id)
    student.current_mode = _select_mode(student)
    return {"mode": student.current_mode.value}


@router.post("/analyze-pose")
async def analyze_pose(frame: PoseFeatureRequest):
    # Required shape requested by product spec.
    arm_straight = frame.arm_angle >= 165
    result = {
        "arm_straight": arm_straight,
        "body_balanced": frame.body_balanced,
        "spine_straight": frame.spine_straight,
        "stability_score": frame.stability_score,
        "head_position": frame.head_position,
        "shoulder_alignment": frame.shoulder_alignment,
    }
    return result


@router.post("/start-session/{student_id}/{vidya_id}/{lesson_id}")
async def start_session(student_id: str, vidya_id: str, lesson_id: str):
    student = _student_or_404(student_id)
    lesson = _lesson_or_404(lesson_id)
    if lesson.vidya != vidya_id:
        raise HTTPException(status_code=400, detail="lesson_id does not belong to vidya_id")

    student.current_vidya = vidya_id
    student.current_lesson = lesson_id
    student.last_activity = datetime.now()

    explanation = teaching_loop.explain_lesson(lesson, student)
    demonstration = teaching_loop.demonstrate_lesson(lesson)

    session_id = str(uuid.uuid4())
    sessions_db[session_id] = {
        "student_id": student_id,
        "vidya_id": vidya_id,
        "lesson_id": lesson_id,
        "started_at": datetime.now().isoformat(),
        "attempts": 0,
    }
    return {
        "session_id": session_id,
        "lesson": lesson.to_dict(),
        "teaching_loop": {
            "explain": explanation,
            "demonstrate": demonstration,
            "practice_task": lesson.practice_task,
        },
    }


@router.post("/submit-practice/{session_id}")
async def submit_practice(session_id: str, request: PerformanceRequest):
    session = sessions_db.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    student = _student_or_404(request.student_id)
    lesson = _lesson_or_404(request.lesson_id)

    pose_data = [_to_pose_data(f) for f in request.pose_frames]
    perf = evaluator.evaluate_performance(
        student_profile=student,
        lesson=lesson,
        pose_data_list=pose_data,
        answer_data={"answer": request.text_answer} if request.text_answer else None,
        time_taken=request.time_taken,
    )

    feedback = feedback_engine.generate_feedback(student, lesson, perf)
    progress_tracker.update_progress(student, lesson.lesson_id, perf)
    progress_tracker.track_attempt_sequence(student, lesson.lesson_id, perf.final_score)
    progress_tracker.identify_strengths_weaknesses(student)
    difficulty_manager.adjust_difficulty(student, lesson.lesson_id)
    student.current_mode = _select_mode(student)
    student.last_activity = datetime.now()

    session["attempts"] += 1
    passed = perf.final_score >= 80
    should_retry = not passed and session["attempts"] < 5
    next_lesson = lesson_engine.get_next_lesson(student) if passed else None

    return {
        "score": perf.final_score,
        "passed": passed,
        "should_retry": should_retry,
        "mistakes": perf.mistakes,
        "strengths": perf.strengths,
        "feedback_tags": perf.feedback_tags,
        "guru_feedback": feedback.to_dict(),
        "current_mode": student.current_mode.value,
        "difficulty_adjustment": student.difficulty_adjustment,
        "next_lesson": next_lesson.to_dict() if next_lesson else None,
        "progress": progress_tracker.get_performance_summary(student),
    }


@router.post("/evaluate-performance")
async def evaluate_performance_only(request: PerformanceRequest):
    student = _student_or_404(request.student_id)
    lesson = _lesson_or_404(request.lesson_id)
    pose_data = [_to_pose_data(f) for f in request.pose_frames]
    perf = evaluator.evaluate_performance(
        student_profile=student,
        lesson=lesson,
        pose_data_list=pose_data,
        answer_data={"answer": request.text_answer} if request.text_answer else None,
        time_taken=request.time_taken,
    )
    return {
        "score": perf.final_score,
        "passed": perf.final_score >= 80,
        "mistakes": perf.mistakes,
        "strengths": perf.strengths,
        "feedback_tags": perf.feedback_tags,
    }


@router.get("/dashboard/{student_id}")
async def dashboard(student_id: str):
    student = _student_or_404(student_id)
    return teaching_loop.get_student_dashboard(student)


@router.post("/adjust-difficulty/{student_id}/{vidya_id}")
async def adjust_difficulty(student_id: str, vidya_id: str):
    student = _student_or_404(student_id)
    current = student.current_lesson
    if current:
        difficulty_manager.adjust_difficulty(student, current)
    return {
        "vidya_id": vidya_id,
        "difficulty_adjustment": student.difficulty_adjustment,
        "difficulty_description": difficulty_manager.get_difficulty_description(
            student.difficulty_adjustment
        ),
    }


@router.get("/vidyas")
async def get_vidyas():
    return {
        "vidyas": [
            {"id": "dhanur", "name": "Dhanur Vidya", "camera": True},
            {"id": "khadga", "name": "Khadga Vidya", "camera": True},
            {"id": "dhyana", "name": "Dhyana Vidya", "camera": True},
            {"id": "dharma", "name": "Dharma Vidya", "camera": False},
            {"id": "yudha", "name": "Yudha Vidya", "camera": False},
            {"id": "shastra", "name": "Shastra Vidya", "camera": False},
            {"id": "itihaasa", "name": "Itihaasa", "camera": False},
            {"id": "astras", "name": "Astras Vidya", "camera": False},
        ]
    }


@router.post("/tts/speak")
async def tts_speak(text: str, language: str = "en"):
    if not VOICE_ENABLED or voice_module is None:
        return {"success": False, "has_voice": False, "message": "Voice module not available"}
    try:
        voice_module.speak_text(text, language)
        return {"success": True, "has_voice": True, "language": language}
    except Exception as exc:
        return {"success": False, "has_voice": False, "message": str(exc)}


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "students": len(students_db),
        "sessions": len(sessions_db),
        "voice_enabled": VOICE_ENABLED and voice_module is not None,
    }

