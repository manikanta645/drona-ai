"""
DRONA-AI: AI Guru Feedback Engine
Generates contextual, wisdom-based feedback that teaches like a real guru.
Author: DRONA-AI System
"""

import uuid
from typing import Dict, List
from datetime import datetime
from .models import (
    GuruFeedback, StudentProfile, PerformanceData, Lesson
)


class GuruFeedbackEngine:
    """
    Generates feedback as if from Guru Dronacharya.
    Feedback is personalized, contextual, and truly educational - not generic.
    """
    
    def __init__(self):
        """Initialize feedback engine with teaching wisdom"""
        self.vidya_wisdom = self._initialize_vidya_wisdom()
        self.teaching_principles = self._initialize_principles()
    
    def _initialize_vidya_wisdom(self) -> Dict:
        """
        Initialize discipline-specific wisdom and teaching approaches.
        """
        return {
            "dhanur": {
                "tone": "calm",
                "approach": "precision and focus",
                "core_teaching": "Every archer must find their center. Like an arrow must be straight, so must your body be.",
                "success_phrase": "Your aim is true, warrior. Precision breeds mastery.",
                "struggle_phrase": "The archer who wavers will never hit their mark. Find stability within.",
                "corrections": {
                    "alignment": "A warrior stands like a mountain - unmovable, balanced, grounded.",
                    "arm_angle": "Your arms must be extensions of your will - straight and true.",
                    "spine": "The spine is the warrior's root. Straighten it like an arrow.",
                    "stability": "Stability comes from ground contact. Feel the earth beneath you."
                }
            },
            "khadga": {
                "tone": "inspiring",
                "approach": "dynamic movement and coordination",
                "core_teaching": "The sword is alive in your hands. It must move like water - flowing, powerful, graceful.",
                "success_phrase": "Excellent! Your movements are becoming one with the blade.",
                "struggle_phrase": "The sword feels heavy because your mind resists it. Become one with your weapon.",
                "corrections": {
                    "arm_angle": "The sword arm must flow between strike and guard smoothly.",
                    "coordination": "Your movements are separate from your breath. Synchronize them.",
                    "reaction": "The true warrior reacts before thinking. Trust your training.",
                    "flow": "Your strikes are staccato. Make them fluid like a river."
                }
            },
            "dhyana": {
                "tone": "gentle",
                "approach": "inner stillness and awareness",
                "core_teaching": "Meditation is not control - it is surrender. Let the mind settle like dust in still water.",
                "success_phrase": "You have touched stillness. In that silence lies wisdom.",
                "struggle_phrase": "The mind fights its own nature. Observe without fighting.",
                "corrections": {
                    "stillness": "You carry tension in your body. Release, do not suppress.",
                    "breathing": "Your breath races your thoughts. Slow both with compassion.",
                    "posture": "The spine is a channel for energy. Keep it aligned, not rigid.",
                    "focus": "The mind that chases butterflies never finds them. Be the space, not the watcher."
                }
            },
            "dharma": {
                "tone": "philosophical",
                "approach": "ethical reasoning and wisdom",
                "core_teaching": "Right action flows from right understanding. Know your duty, then execute it with conviction.",
                "success_phrase": "Your reasoning shows growing wisdom. This is the path of Dharma.",
                "struggle_phrase": "You see the dilemma but not the deeper principle. Reflect further.",
                "corrections": {
                    "reasoning": "You argue from emotion, not principle. Strip away ego.",
                    "ethics": "Truth has many layers. You see only the surface.",
                    "duty": "Your duty is not what you wish it to be, but what it must be.",
                    "consequence": "Every action ripples. Have you considered all consequences?"
                }
            },
            "yudha": {
                "tone": "strategic",
                "approach": "tactical thinking and adaptability",
                "core_teaching": "War is won before the first blow. Know yourself, know your enemy, know the field.",
                "success_phrase": "Your strategy shows tactical maturity. Very good.",
                "struggle_phrase": "You plan only for victory. What of defeat? A true strategist prepares for both.",
                "corrections": {
                    "planning": "Your plan has strength but ignores weaknesses. Reinforce them.",
                    "assessment": "You have identified the obvious. Now find the hidden advantage.",
                    "adaptability": "A rigid strategy breaks like ice. Build flexibility.",
                    "foresight": "You see the next move. Can you see three moves ahead?"
                }
            }
        }
    
    def _initialize_principles(self) -> Dict:
        """
        Initialize core teaching principles based on performance levels.
        """
        return {
            "excellent": {
                "score_range": (85, 100),
                "approach": "praise and refinement",
                "template": "Your performance shows {skill}. Now we refine the details."
            },
            "good": {
                "score_range": (70, 84),
                "approach": "encouragement and targeted improvement",
                "template": "You have {strength}. Now focus on {weakness}."
            },
            "improving": {
                "score_range": (50, 69),
                "approach": "guided practice and patience",
                "template": "Progress is visible. {area} needs more attention. Try once more."
            },
            "struggling": {
                "score_range": (0, 49),
                "approach": "foundational review and gentle correction",
                "template": "We return to basics. {fundamental}. Practice until it becomes natural."
            }
        }
    
    def generate_feedback(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        performance: PerformanceData
    ) -> GuruFeedback:
        """
        Generate comprehensive guru feedback.
        
        Args:
            student_profile: Student profile
            lesson: Lesson that was attempted
            performance: Performance data from attempt
        
        Returns:
            GuruFeedback object with complete feedback
        """
        
        # Determine performance level
        performance_level = self._determine_performance_level(performance.final_score)
        
        # Get vidya-specific wisdom
        vidya = lesson.vidya
        wisdom = self.vidya_wisdom.get(vidya, {})
        
        # Generate components
        main_feedback = self._generate_main_feedback(
            student_profile, lesson, performance, performance_level, wisdom
        )
        
        corrections = self._generate_corrections(
            performance, lesson, wisdom
        )
        
        encouragement = self._generate_encouragement(
            student_profile, performance, performance_level, wisdom
        )
        
        next_steps = self._generate_next_steps(
            student_profile, lesson, performance, performance_level
        )
        
        vidya_teaching = self._generate_vidya_wisdom(
            vidya, performance, wisdom
        )
        
        tone = wisdom.get("tone", "balanced")
        
        # Create feedback object
        feedback = GuruFeedback(
            feedback_id=str(uuid.uuid4()),
            student_id=student_profile.student_id,
            lesson_id=lesson.lesson_id,
            score=performance.final_score,
            performance_result=performance.to_dict(),
            main_feedback=main_feedback,
            corrections=corrections,
            encouragement=encouragement,
            next_steps=next_steps,
            tone=tone,
            vidya_specific_teaching=vidya_teaching,
            timestamp=datetime.now()
        )
        
        return feedback
    
    def _determine_performance_level(self, score: float) -> str:
        """Determine performance level category"""
        if score >= 85:
            return "excellent"
        elif score >= 70:
            return "good"
        elif score >= 50:
            return "improving"
        else:
            return "struggling"
    
    def _generate_main_feedback(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        performance: PerformanceData,
        level: str,
        wisdom: Dict
    ) -> str:
        """
        Generate the main feedback message.
        This is the core teaching moment.
        """
        
        if level == "excellent":
            return self._generate_excellent_feedback(student_profile, lesson, performance, wisdom)
        elif level == "good":
            return self._generate_good_feedback(student_profile, lesson, performance, wisdom)
        elif level == "improving":
            return self._generate_improving_feedback(student_profile, lesson, performance, wisdom)
        else:
            return self._generate_struggling_feedback(student_profile, lesson, performance, wisdom)
    
    def _generate_excellent_feedback(self, student_profile, lesson, performance, wisdom) -> str:
        """Feedback for scores >= 85"""
        
        # Get primary strength from performance data
        strengths = performance.strengths if performance.strengths else ["discipline"]
        primary_strength = strengths[0].lower() if strengths else "focus"
        
        messages = [
            wisdom.get("success_phrase", "Excellent work!"),
            f"Your {primary_strength} shows true mastery of this lesson.",
        ]
        
        # Add specific praise
        if performance.final_score >= 95:
            messages.append("You have achieved the level of a skilled practitioner.")
        
        # Add refinement suggestion
        if len(performance.mistakes) > 0:
            messages.append(f"Now we polish the details. Pay attention to: {performance.mistakes[0]}")
        
        return " ".join(messages)
    
    def _generate_good_feedback(self, student_profile, lesson, performance, wisdom) -> str:
        """Feedback for scores 70-84"""
        
        strength = performance.strengths[0] if performance.strengths else "foundation"
        weakness = performance.mistakes[0] if performance.mistakes else "consistency"
        
        messages = [
            f"Good progress. Your {strength} is developing well.",
            wisdom.get("core_teaching", "Continue with discipline."),
            f"Now focus on improving your {weakness}."
        ]
        
        return " ".join(messages)
    
    def _generate_improving_feedback(self, student_profile, lesson, performance, wisdom) -> str:
        """Feedback for scores 50-69"""
        
        primary_mistake = performance.mistakes[0] if performance.mistakes else "form"
        
        messages = [
            "You are on the path, but more work is needed.",
            wisdom.get("struggle_phrase", "Do not lose faith in your training."),
            f"The issue is: {primary_mistake}.",
            "Let us work through this together."
        ]
        
        return " ".join(messages)
    
    def _generate_struggling_feedback(self, student_profile, lesson, performance, wisdom) -> str:
        """Feedback for scores < 50"""
        
        primary_issue = performance.mistakes[0] if performance.mistakes else "basics"
        
        messages = [
            "This requires more foundational work.",
            f"We must focus on: {primary_issue}.",
            wisdom.get("struggle_phrase", "Every master was once a student."),
            "Do not be discouraged. Practice brings mastery."
        ]
        
        return " ".join(messages)
    
    def _generate_corrections(
        self,
        performance: PerformanceData,
        lesson: Lesson,
        wisdom: Dict
    ) -> List[str]:
        """
        Generate specific corrections for mistakes.
        """
        corrections = []
        vidya_corrections = wisdom.get("corrections", {})
        
        for mistake in performance.mistakes[:3]:  # Top 3 mistakes
            # Try to find vidya-specific correction
            for correction_key, correction_text in vidya_corrections.items():
                if correction_key.lower() in mistake.lower():
                    corrections.append(correction_text)
                    break
            else:
                # Generic correction
                corrections.append(f"Address this: {mistake}")
        
        if not corrections:
            corrections.append("Examine your technique carefully and practice again.")
        
        return corrections
    
    def _generate_encouragement(
        self,
        student_profile: StudentProfile,
        performance: PerformanceData,
        level: str,
        wisdom: Dict
    ) -> str:
        """
        Generate motivational encouragement.
        """
        
        encouragement_options = {
            "excellent": [
                "You are walking the path of mastery.",
                "This is the level of a true disciple.",
                "Your dedication shows in your results."
            ],
            "good": [
                "You are making real progress. Continue with confidence.",
                "The path is clear before you. Keep walking.",
                "Each attempt brings you closer to mastery."
            ],
            "improving": [
                "Every challenge is a teacher. Learn from it.",
                "The warrior who falls and rises is stronger.",
                "Patience and practice will bring you through."
            ],
            "struggling": [
                "The strongest oak begins as a seed. Do not rush growth.",
                "This is not failure - this is learning.",
                "Dronacharya believes in you. Trust the process."
            ]
        }
        
        messages = encouragement_options.get(level, ["Continue your practice."])
        
        # Add specific encouragement based on consecutive attempts
        if student_profile.consecutive_successes >= 2:
            messages.append("Your momentum is building - maintain this pace.")
        elif student_profile.retry_count > 3 and performance.final_score >= 70:
            messages.append("Persistence is paying off. Well done.")
        
        return " ".join(messages[:2])
    
    def _generate_next_steps(
        self,
        student_profile: StudentProfile,
        lesson: Lesson,
        performance: PerformanceData,
        level: str
    ) -> str:
        """
        Generate guidance on what to do next.
        """
        
        if level == "excellent":
            return "You are ready for the next lesson. Proceed with confidence."
        elif level == "good":
            return "You may attempt the next lesson. However, refresh the difficult areas first."
        elif level == "improving":
            return "Let us practice again. Focus on the corrections provided, then try once more."
        else:
            return "Return to the basics of this lesson. Do not move forward until mastery is achieved."
    
    def _generate_vidya_wisdom(
        self,
        vidya: str,
        performance: PerformanceData,
        wisdom: Dict
    ) -> str:
        """
        Generate discipline-specific wisdom teaching.
        This adds philosophical depth to feedback.
        """
        
        core_wisdom = wisdom.get("core_teaching", "Continue your practice.")
        approach = wisdom.get("approach", "discipline")
        
        if performance.final_score >= 75:
            return f"Remember: {core_wisdom} You are developing {approach}."
        else:
            return f"The path of {approach} requires patience: {core_wisdom}"
    
    def get_feedback_for_display(self, feedback: GuruFeedback) -> str:
        """
        Format feedback for student display.
        Creates a complete, coherent message.
        """
        
        message_parts = [
            f"Guru's Analysis (Score: {feedback.score:.1f}/100)",
            "",
            feedback.main_feedback,
            ""
        ]
        
        if feedback.corrections:
            message_parts.append("Areas to Refine:")
            for i, correction in enumerate(feedback.corrections, 1):
                message_parts.append(f"  {i}. {correction}")
            message_parts.append("")
        
        message_parts.append(feedback.encouragement)
        message_parts.append("")
        message_parts.append(f"Next: {feedback.next_steps}")
        message_parts.append("")
        message_parts.append(f"Wisdom: {feedback.vidya_specific_teaching}")
        
        return "\n".join(message_parts)
