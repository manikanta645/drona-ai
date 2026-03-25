"""
DRONA-AI: Lesson Engine
Manages lesson structure, progression, and course design for all Vidya disciplines.
Author: DRONA-AI System
"""

import json
from typing import List, Optional, Dict
from .models import Lesson, DifficultyLevel, StudentProfile


class LessonEngine:
    """
    Central hub for lesson management.
    Handles lesson definitions, progression, and course structure.
    """
    
    def __init__(self):
        """Initialize lesson engine with all vidya courses"""
        self.lessons_db: Dict[str, List[Lesson]] = {}
        self._initialize_all_lessons()
    
    def _initialize_all_lessons(self):
        """Initialize complete lesson sets for all vidya disciplines"""
        self.lessons_db["dhanur"] = self._create_dhanur_lessons()
        self.lessons_db["khadga"] = self._create_khadga_lessons()
        self.lessons_db["dhyana"] = self._create_dhyana_lessons()
        self.lessons_db["dharma"] = self._create_dharma_lessons()
        self.lessons_db["yudha"] = self._create_yudha_lessons()
        self.lessons_db["shastra"] = self._create_shastra_lessons()
        self.lessons_db["itihaasa"] = self._create_itihaasa_lessons()
        self.lessons_db["astras"] = self._create_astras_lessons()
    
    def _create_dhanur_lessons(self) -> List[Lesson]:
        """
        Create Dhanur Vidya (Archery) lessons.
        Focus: stance, aim, breathing, focus control.
        """
        return [
            Lesson(
                lesson_id="dhanur_001",
                vidya="dhanur",
                name="Archer's Stance",
                description="Learn the foundational standing posture for archery",
                instruction="Stand with feet shoulder-width apart, spine straight, shoulders relaxed but aligned",
                practice_task="Hold the archer's stance for 30 seconds without movement",
                evaluation_criteria=["shoulder_alignment", "spine_straight", "body_balance", "stability"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=30,
                camera_required=True,
                keywords=["stance", "posture", "balance"]
            ),
            Lesson(
                lesson_id="dhanur_002",
                vidya="dhanur",
                name="Arm Positioning",
                description="Correct arm angle and positioning for drawing",
                instruction="Raise both arms to shoulder height, create 90-degree angles at elbows",
                practice_task="Maintain arm position while keeping shoulders stable for 20 seconds",
                evaluation_criteria=["arm_angle", "shoulder_alignment", "stability"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=20,
                prerequisites=["dhanur_001"],
                camera_required=True,
                keywords=["arms", "angle", "draw"]
            ),
            Lesson(
                lesson_id="dhanur_003",
                vidya="dhanur",
                name="Breath Control",
                description="Learn rhythmic breathing for focus and stability",
                instruction="Breathe in for 4 counts, hold for 4 counts, exhale for 4 counts",
                practice_task="Complete 5 breathing cycles while maintaining stance",
                evaluation_criteria=["breath_pattern", "body_stability", "focus"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=45,
                prerequisites=["dhanur_001", "dhanur_002"],
                camera_required=True,
                keywords=["breathing", "rhythm", "focus"]
            ),
            Lesson(
                lesson_id="dhanur_004",
                vidya="dhanur",
                name="Focus and Aim",
                description="Develop focus while aiming at target",
                instruction="Fix gaze on target point, maintain steady body position",
                practice_task="Hold aim for 10 seconds without blinking or moving",
                evaluation_criteria=["head_position", "body_stability", "focus_duration"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=40,
                prerequisites=["dhanur_001", "dhanur_002", "dhanur_003"],
                camera_required=True,
                keywords=["focus", "aim", "target"]
            ),
            Lesson(
                lesson_id="dhanur_005",
                vidya="dhanur",
                name="Advanced Draw Technique",
                description="Master the complete archery draw motion",
                instruction="From stance, smoothly draw while maintaining body alignment",
                practice_task="Perform 3 complete draw cycles with perfect form",
                evaluation_criteria=["motion_smoothness", "arm_angle", "spine_alignment", "stability_throughout"],
                difficulty=DifficultyLevel.ADVANCED,
                duration_seconds=60,
                prerequisites=["dhanur_001", "dhanur_002", "dhanur_003", "dhanur_004"],
                camera_required=True,
                keywords=["draw", "technique", "motion"]
            )
        ]
    
    def _create_khadga_lessons(self) -> List[Lesson]:
        """
        Create Khadga Vidya (Sword) lessons.
        Focus: coordination, reaction, arm movement, combat awareness.
        """
        return [
            Lesson(
                lesson_id="khadga_001",
                vidya="khadga",
                name="Sword Grip Fundamentals",
                description="Learn proper sword handling and grip",
                instruction="Hold sword with firm but relaxed grip, arm extended at shoulder height",
                practice_task="Maintain grip and arm position for 25 seconds",
                evaluation_criteria=["grip_firmness", "arm_angle", "wrist_alignment"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=25,
                camera_required=True,
                keywords=["grip", "control", "weapon"]
            ),
            Lesson(
                lesson_id="khadga_002",
                vidya="khadga",
                name="Basic Strikes",
                description="Master fundamental sword strike patterns",
                instruction="Perform overhead strike with controlled motion",
                practice_task="Execute 5 strikes with proper form and control",
                evaluation_criteria=["strike_power", "form_consistency", "motion_control"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=30,
                prerequisites=["khadga_001"],
                camera_required=True,
                keywords=["strike", "attack", "power"]
            ),
            Lesson(
                lesson_id="khadga_003",
                vidya="khadga",
                name="Reaction Time Training",
                description="Build quick reflexes and reaction speed",
                instruction="Respond to visual signals with sword movements",
                practice_task="Complete 10 reaction exercises within time limit",
                evaluation_criteria=["reaction_speed", "accuracy", "consistency"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=45,
                prerequisites=["khadga_001", "khadga_002"],
                camera_required=True,
                keywords=["reaction", "speed", "reflex"]
            ),
            Lesson(
                lesson_id="khadga_004",
                vidya="khadga",
                name="Coordination and Flow",
                description="Develop smooth coordinated movements",
                instruction="Link basic strikes into flowing combination",
                practice_task="Execute 3-strike combination smoothly",
                evaluation_criteria=["flow_quality", "timing", "coordination"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=40,
                prerequisites=["khadga_001", "khadga_002", "khadga_003"],
                camera_required=True,
                keywords=["coordination", "flow", "combination"]
            )
        ]
    
    def _create_dhyana_lessons(self) -> List[Lesson]:
        """
        Create Dhyana Vidya (Meditation) lessons.
        Focus: stillness, breathing, posture, mental clarity.
        No camera required for most - focus on internal state.
        """
        return [
            Lesson(
                lesson_id="dhyana_001",
                vidya="dhyana",
                name="Meditation Posture",
                description="Learn proper sitting position for meditation",
                instruction="Sit in lotus or cross-legged position, spine straight, hands on knees",
                practice_task="Maintain posture for 5 minutes without moving",
                evaluation_criteria=["posture_alignment", "stillness", "breathing_pattern"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=300,
                camera_required=False,
                keywords=["posture", "sitting", "alignment"]
            ),
            Lesson(
                lesson_id="dhyana_002",
                vidya="dhyana",
                name="Breath Awareness",
                description="Develop awareness of breath patterns",
                instruction="Focus attention on natural breathing without controlling it",
                practice_task="Maintain breath focus for 10 minutes",
                evaluation_criteria=["focus_quality", "breath_rhythm", "mental_clarity"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["breath", "awareness", "focus"]
            ),
            Lesson(
                lesson_id="dhyana_003",
                vidya="dhyana",
                name="Mind Stillness",
                description="Achieve mental stillness and clarity",
                instruction="Allow mind to settle into peaceful stillness",
                practice_task="Sit in stillness for 15 minutes with minimal thought",
                evaluation_criteria=["mental_clarity", "stillness_quality", "presence"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=900,
                prerequisites=["dhyana_001", "dhyana_002"],
                camera_required=False,
                keywords=["stillness", "clarity", "meditation"]
            )
        ]
    
    def _create_dharma_lessons(self) -> List[Lesson]:
        """
        Create Dharma Vidya (Ethics & Philosophy) lessons.
        Focus: moral reasoning, decision-making, philosophy.
        No camera required - text-based evaluation.
        """
        return [
            Lesson(
                lesson_id="dharma_001",
                vidya="dharma",
                name="The Warrior's Code",
                description="Learn principles of righteous duty",
                instruction="Study the concept of Satya (truth) in all situations",
                practice_task="Explain how Satya applies to your current challenge",
                evaluation_criteria=["understanding", "reasoning", "application"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["truth", "code", "principles"]
            ),
            Lesson(
                lesson_id="dharma_002",
                vidya="dharma",
                name="Duty and Responsibility",
                description="Understand personal and social duties",
                instruction="Analyze responsibilities in your role",
                practice_task="Create a personal duty framework",
                evaluation_criteria=["clarity", "comprehensiveness", "wisdom"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=900,
                prerequisites=["dharma_001"],
                camera_required=False,
                keywords=["duty", "responsibility", "role"]
            ),
            Lesson(
                lesson_id="dharma_003",
                vidya="dharma",
                name="Moral Dilemmas",
                description="Navigate complex ethical situations",
                instruction="Analyze a moral dilemma from multiple perspectives",
                practice_task="Propose resolution with philosophical reasoning",
                evaluation_criteria=["reasoning_quality", "perspective_balance", "wisdom"],
                difficulty=DifficultyLevel.ADVANCED,
                duration_seconds=1200,
                prerequisites=["dharma_001", "dharma_002"],
                camera_required=False,
                keywords=["ethics", "dilemma", "reasoning"]
            )
        ]
    
    def _create_yudha_lessons(self) -> List[Lesson]:
        """
        Create Yudha Vidya (Strategy) lessons.
        Focus: strategic thinking, decision-making, planning.
        """
        return [
            Lesson(
                lesson_id="yudha_001",
                vidya="yudha",
                name="Strategic Assessment",
                description="Learn to assess situations strategically",
                instruction="Analyze strengths, weaknesses, opportunities, threats",
                practice_task="Perform SWOT analysis on a given scenario",
                evaluation_criteria=["analysis_depth", "insight", "clarity"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["strategy", "assessment", "analysis"]
            ),
            Lesson(
                lesson_id="yudha_002",
                vidya="yudha",
                name="Tactical Planning",
                description="Develop tactical strategies for specific situations",
                instruction="Create a battle plan considering terrain, resources, opposition",
                practice_task="Develop a complete tactical strategy",
                evaluation_criteria=["feasibility", "creativity", "thoroughness"],
                difficulty=DifficultyLevel.INTERMEDIATE,
                duration_seconds=900,
                prerequisites=["yudha_001"],
                camera_required=False,
                keywords=["tactics", "planning", "strategy"]
            )
        ]
    
    def _create_shastra_lessons(self) -> List[Lesson]:
        """
        Create Shastra Vidya (Knowledge/Scripture) lessons.
        Focus: knowledge acquisition, explanation, understanding.
        """
        return [
            Lesson(
                lesson_id="shastra_001",
                vidya="shastra",
                name="Vedic Wisdom",
                description="Learn from ancient scriptures",
                instruction="Study foundational concepts from Vedic texts",
                practice_task="Explain a Vedic concept in your own words",
                evaluation_criteria=["understanding", "accuracy", "clarity"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["scripture", "knowledge", "wisdom"]
            )
        ]
    
    def _create_itihaasa_lessons(self) -> List[Lesson]:
        """
        Create Itihaasa Vidya (History/Epic Tales) lessons.
        Focus: storytelling, narrative understanding, history.
        """
        return [
            Lesson(
                lesson_id="itihaasa_001",
                vidya="itihaasa",
                name="Mahabharata Fundamentals",
                description="Learn the epic story of the Mahabharata",
                instruction="Study the main narrative and key characters",
                practice_task="Summarize a key chapter from Mahabharata",
                evaluation_criteria=["accuracy", "completeness", "understanding"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["history", "epic", "story"]
            )
        ]
    
    def _create_astras_lessons(self) -> List[Lesson]:
        """
        Create Astras Vidya (Divine Weapons) lessons.
        Focus: weapon knowledge, symbolism, mastery concepts.
        """
        return [
            Lesson(
                lesson_id="astras_001",
                vidya="astras",
                name="Divine Weapons Fundamentals",
                description="Learn about divine weapons and their powers",
                instruction="Study the symbolism and power of celestial weapons",
                practice_task="Describe three divine weapons and their significance",
                evaluation_criteria=["knowledge", "understanding", "depth"],
                difficulty=DifficultyLevel.BEGINNER,
                duration_seconds=600,
                camera_required=False,
                keywords=["weapons", "divine", "power"]
            )
        ]
    
    def get_lessons(self, vidya: str) -> List[Lesson]:
        """
        Get all lessons for a vidya.
        
        Args:
            vidya: Vidya name (dhanur, khadga, etc.)
        
        Returns:
            List of Lesson objects
        """
        return self.lessons_db.get(vidya, [])
    
    def get_lesson(self, lesson_id: str) -> Optional[Lesson]:
        """
        Get a specific lesson by ID.
        
        Args:
            lesson_id: Lesson ID
        
        Returns:
            Lesson object or None
        """
        for lessons in self.lessons_db.values():
            for lesson in lessons:
                if lesson.lesson_id == lesson_id:
                    return lesson
        return None
    
    def get_next_lesson(self, student_profile: StudentProfile) -> Optional[Lesson]:
        """
        Get the next lesson for a student based on their profile.
        
        Args:
            student_profile: Current student profile
        
        Returns:
            Next Lesson or None if all completed
        """
        # Get current vidya's lessons
        vidya = student_profile.current_vidya
        if not vidya:
            # Start with first vidya
            vidya = "dhanur"
            student_profile.current_vidya = vidya
        
        lessons = self.get_lessons(vidya)
        
        # Find next uncompleted lesson
        for lesson in lessons:
            if lesson.lesson_id not in student_profile.completed_lessons:
                return lesson
            elif not student_profile.completed_lessons[lesson.lesson_id].completed:
                return lesson
        
        # If all lessons in current vidya are completed, move to next
        vidya_order = ["dhanur", "khadga", "dhyana", "dharma", "yudha", "shastra", "itihaasa", "astras"]
        current_index = vidya_order.index(vidya) if vidya in vidya_order else 0
        
        if current_index < len(vidya_order) - 1:
            next_vidya = vidya_order[current_index + 1]
            student_profile.current_vidya = next_vidya
            next_lessons = self.get_lessons(next_vidya)
            return next_lessons[0] if next_lessons else None
        
        # All vidyas completed
        return None
    
    def get_prerequisites(self, lesson: Lesson) -> List[Lesson]:
        """
        Get prerequisite lessons for a lesson.
        
        Args:
            lesson: Lesson object
        
        Returns:
            List of prerequisite Lesson objects
        """
        prerequisites = []
        for prereq_id in lesson.prerequisites:
            prereq = self.get_lesson(prereq_id)
            if prereq:
                prerequisites.append(prereq)
        return prerequisites
    
    def check_prerequisites(self, lesson: Lesson, student_profile: StudentProfile) -> bool:
        """
        Check if student has completed all prerequisites.
        
        Args:
            lesson: Lesson to check
            student_profile: Student profile
        
        Returns:
            True if all prerequisites met
        """
        for prereq_id in lesson.prerequisites:
            if prereq_id not in student_profile.completed_lessons:
                return False
            if not student_profile.completed_lessons[prereq_id].completed:
                return False
        return True
