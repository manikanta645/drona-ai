#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DRONA - Digital Repository Of National Arts
Backend Server powered by Local Ollama AI
AI-Only mode - no memory dependencies
"""

import sys
import io

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict
import json
import os
import random
import re
import requests
import base64
from datetime import datetime
from typing import Optional, List
from vidya_modes import get_vidya, get_vidya_lesson, get_vidya_test, get_next_lesson

try:
    import cv2
    import numpy as np
    CV_AVAILABLE = True
except ImportError:
    CV_AVAILABLE = False

# Import VIDYA API router
try:
    from vidya_api import router as vidya_router
    VIDYA_API_AVAILABLE = True
except ImportError:
    VIDYA_API_AVAILABLE = False
    print("[WARNING] VIDYA API module not available - VIDYA endpoints will not be registered")

# ============================================================================
# SETUP
# ============================================================================

app = FastAPI(title="DRONA – Digital Repository Of National Arts")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register VIDYA API router
if VIDYA_API_AVAILABLE:
    app.include_router(vidya_router)
    print("[INFO] VIDYA API endpoints registered successfully")
else:
    print("[WARNING] VIDYA API not loaded")

print("[INFO] Initializing DRONA - Digital Repository Of National Arts")
print("[INFO] Mode: AI-Only (Using Local Ollama HTTP API)")
print("[INFO] AI Model: gpt-oss:120b-cloud (120B parameter cloud model)")
print("[INFO] Ollama API: localhost:11434")
print("[INFO] Prompt Quality: Guru Dronacharya persona with 8 mode-specific contexts")
print("[INFO] Server starting on http://localhost:8000")

# ============================================================================
# OLLAMA LOCAL AI INTEGRATION
# ============================================================================

OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gpt-oss:120b-cloud"
OLLAMA_TIMEOUT = 60

# ============================================================================
# MODE RULES - Scope keywords for each vidya mode
# ============================================================================

MODE_RULES = {
    "dhanur": {
        "scope_keywords": ["bow", "arrow", "archery", "target", "precision", "focus", "discipline", "stance", "draw", "release"],
        "redirect_message": "Shishya, your question belongs to the path of Dhanur Vidya - the art of archery. Shall we practice with the bow?"
    },
    "khadga": {
        "scope_keywords": ["sword", "blade", "combat", "fight", "warrior", "strike", "defense", "technique", "weapon"],
        "redirect_message": "Shishya, your question speaks of Khadga Vidya - the way of the sword. Shall we explore the blade's wisdom?"
    },
    "dharma": {
        "scope_keywords": ["right", "wrong", "duty", "justice", "ethics", "moral", "virtue", "righteousness", "honor", "truth"],
        "redirect_message": "Shishya, your question touches Dharma Vidya - the path of righteousness. Shall we explore what is right?"
    },
    "dhyana": {
        "scope_keywords": ["meditation", "mind", "consciousness", "awareness", "peace", "silence", "inner", "spiritual", "enlightenment"],
        "redirect_message": "Shishya, your question belongs to Dhyana Vidya - the art of meditation. Shall we sit in silence together?"
    },
    "yudha": {
        "scope_keywords": ["war", "strategy", "battle", "tactics", "military", "command", "leadership", "victory", "army"],
        "redirect_message": "Shishya, your question speaks of Yudha Vidya - the science of war. Shall we study the art of strategy?"
    },
    "shastra": {
        "scope_keywords": ["knowledge", "science", "learning", "wisdom", "teaching", "scripture", "understanding", "mastery"],
        "redirect_message": "Shishya, your question belongs to Shastra Vidya - the pursuit of knowledge. Shall we explore the scriptures?"
    }
}

# FastAPI startup event
@app.on_event("startup")
async def startup_event():
    """Run on app startup"""
    print("[STARTUP] Backend is ready! Will attempt to use Ollama for responses.")

# Health check endpoint
@app.get("/health")
def health_check():
    """Check if Ollama is accessible"""
    print("[DEBUG] Health check requested")
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            return {"status": "ok", "message": "Ollama is running"}
        else:
            return {"status": "error", "message": f"Ollama returned {response.status_code}"}
    except requests.exceptions.ConnectionError:
        return {"status": "error", "message": "Cannot connect to Ollama on localhost:11434"}
    except Exception as e:
        return {"status": "error", "message": f"Health check failed: {str(e)}"}

@app.get("/ping")
def ping():
    """Simple ping endpoint"""
    print("[DEBUG] Ping requested")
    return {"status": "pong", "message": "Backend is alive"}

@app.get("/check-ollama")
def check_ollama():
    """Check Ollama status and available models"""
    print("[DEBUG] Ollama check requested")
    result = {"status": "unknown", "details": {}}
    
    try:
        # Check if Ollama is running
        tags_response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if tags_response.status_code == 200:
            models_data = tags_response.json()
            result["status"] = "running"
            result["models"] = [m.get("name") for m in models_data.get("models", [])]
            result["model_being_used"] = OLLAMA_MODEL
            result["model_available"] = OLLAMA_MODEL in (result.get("models") or [])
            print(f"[DEBUG] Ollama status: {result}")
            return result
        else:
            result["status"] = "error"
            result["http_status"] = tags_response.status_code
            return result
    except requests.exceptions.ConnectionError as e:
        result["status"] = "not_running"
        result["error"] = f"Cannot connect to localhost:11434: {str(e)}"
        return result
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        return result


# ============================================================================
# VIDYA LEARNING SYSTEM ENDPOINTS - Complete educational framework
# ============================================================================

@app.get("/vidya/list")
def list_all_vidyas():
    """List all available vidyas"""
    from vidya_modes import VIDYA_SYSTEM
    vidyas = []
    for key, vidya in VIDYA_SYSTEM.items():
        vidyas.append({
            "id": key,
            "name": vidya["name"],
            "description": vidya["description"],
            "total_lessons": vidya["total_lessons"],
            "total_tests": vidya["total_tests"],
        })
    return {"vidyas": vidyas}

@app.get("/vidya/{vidya_name}")
def get_vidya_info(vidya_name: str):
    """Get complete vidya information with all lessons and tests"""
    vidya = get_vidya(vidya_name)
    if not vidya:
        return {"error": f"Vidya '{vidya_name}' not found"}
    return vidya

@app.get("/vidya/{vidya_name}/lesson/{lesson_id}")
def get_lesson_detail(vidya_name: str, lesson_id: int):
    """Get detailed lesson information"""
    lesson = get_vidya_lesson(vidya_name, lesson_id)
    if not lesson:
        return {"error": f"Lesson {lesson_id} in vidya '{vidya_name}' not found"}
    return lesson

@app.get("/vidya/{vidya_name}/test/{test_id}")
def get_test_detail(vidya_name: str, test_id: int):
    """Get detailed test information"""
    test = get_vidya_test(vidya_name, test_id)
    if not test:
        return {"error": f"Test {test_id} in vidya '{vidya_name}' not found"}
    return test

@app.post("/vidya/{vidya_name}/lesson/{lesson_id}/start")
def start_lesson(vidya_name: str, lesson_id: int, student_name: str = "Student"):
    """Start a lesson - guru analyzes student and begins teaching"""
    lesson = get_vidya_lesson(vidya_name, lesson_id)
    if not lesson:
        return {"error": f"Lesson not found"}
    
    # Build guru's initial teaching message
    vidya = get_vidya(vidya_name)
    guru_prompt = f"""
You are Guru Dronacharya teaching lesson {lesson_id} of {vidya['name']}.

LESSON: {lesson['title']}
DESCRIPTION: {lesson['description']}

TEACHING POINTS:
{chr(10).join(f'- {point}' for point in lesson['teaching_points'])}

GURU'S OPENING OBSERVATION:
{lesson['guru_observation']}

You are teaching {student_name}. Begin your teaching of this lesson. Be direct, wise, and challenging.
Your student can see your image and you can analyze their posture through a camera feed.
Start by analyzing their stance and readiness to learn, then begin teaching this specific lesson.
"""
    
    # Get guru's response
    guru_opening = call_ollama(guru_prompt, timeout=OLLAMA_TIMEOUT, question=lesson['title'])
    
    return {
        "lesson": lesson,
        "status": "started",
        "guru_greeting": clean_ollama_response(guru_opening) if guru_opening else lesson['guru_observation'],
        "camera_required": True,
        "next_step": "show_camera_and_listen_to_guru",
    }

@app.post("/vidya/{vidya_name}/test/{test_id}/start")
def start_test(vidya_name: str, test_id: int, student_name: str = "Student"):
    """Start a test - guru sets up testing scenario"""
    test = get_vidya_test(vidya_name, test_id)
    if not test:
        return {"error": f"Test not found"}
    
    vidya = get_vidya(vidya_name)
    test_prompt = f"""
You are Guru Dronacharya administering test {test_id} of {vidya['name']}.

TEST: {test['title']}
DESCRIPTION: {test['description']}
TEST TYPE: {test['test_type']}

PASSING CRITERIA:
{chr(10).join(f"- {k}: {v}" for k, v in test['passing_criteria'].items())}

You are testing {student_name}. Explain the test clearly and what they must do.
Be demanding but fair. This is the moment to see if the teaching has taken root.
"""
    
    guru_test_intro = call_ollama(test_prompt, timeout=OLLAMA_TIMEOUT, question=test['title'])
    
    return {
        "test": test,
        "status": "started",
        "guru_instructions": clean_ollama_response(guru_test_intro) if guru_test_intro else f"Now we test your mastery of: {test['title']}",
        "camera_required": True,
        "duration_minutes": test.get("duration_minutes", 15),
        "next_step": "perform_test_and_be_analyzed",
    }

@app.post("/vidya/{vidya_name}/lesson/{lesson_id}/complete")
def complete_lesson(vidya_name: str, lesson_id: int, student_name: str = "Student", student_performance: str = ""):
    """Mark lesson as complete and generate guru feedback"""
    lesson = get_vidya_lesson(vidya_name, lesson_id)
    if not lesson:
        return {"error": f"Lesson not found"}
    
    # Build feedback prompt based on lesson and performance
    feedback_prompt = f"""
You are Guru Dronacharya. Student {student_name} has completed lesson {lesson_id}: "{lesson['title']}".

Lesson Description: {lesson['description']}
Student Performance: {student_performance if student_performance else "Completed the lesson"}

Provide encouraging feedback that acknowledges their effort and guides them toward mastery.
Be specific about what they did well and what to focus on next.
Keep it concise but meaningful.
"""
    
    next_lesson = get_next_lesson(vidya_name, lesson_id)
    
    guru_feedback = call_ollama(feedback_prompt, timeout=OLLAMA_TIMEOUT, question=f"Feedback for lesson {lesson_id}")
    
    return {
        "lesson_completed": lesson_id,
        "guru_feedback": clean_ollama_response(guru_feedback) if guru_feedback else "Well done. Continue to the next lesson.",
        "next_lesson": next_lesson["id"] if next_lesson else None,
        "vidya_complete": next_lesson is None,  # True if this was last lesson
        "next_step": "next_lesson" if next_lesson else "appreciation_ceremony",
    }

@app.post("/vidya/{vidya_name}/complete")
def complete_vidya(vidya_name: str, student_name: str = "Student"):
    """Mark entire vidya as complete - guru appreciates the student"""
    vidya = get_vidya(vidya_name)
    if not vidya:
        return {"error": f"Vidya '{vidya_name}' not found"}
    
    appreciation_msgs = vidya.get("appreciation_messages", [])
    
    completion_prompt = f"""
{student_name} has completed the entire {vidya['name']} - all {vidya['total_lessons']} lessons and {vidya['total_tests']} tests.

This is a moment of profound significance. The student has been transformed.

Provide a final appreciation speech from Guru Dronacharya that:
1. Honors the student's dedication and transformation
2. Recognizes the depth of the vidya they have mastered
3. Explains what this mastery means for their future path
4. Sets the context for what vidyas they might learn next
5. Closes with a blessing appropriate to a true guru

This should feel like a sacred moment - the student's graduation into mastery.
"""
    
    guru_final = call_ollama(completion_prompt, timeout=OLLAMA_TIMEOUT, question=f"Completion of {vidya_name}")
    
    return {
        "vidya_name": vidya_name,
        "student_name": student_name,
        "status": "complete",
        "completion_message": clean_ollama_response(guru_final) if guru_final else "Congratulations, Shishya! You have completed this vidya with excellence.",
        "mastery_level": "Complete",
        "next_vidyas": ["khadga", "dhyana"] if vidya_name == "dhanur" else [],
        "ceremony_type": "graduation_blessing",
    }


# ============================================================================
# MAIN PROMPT - This is the core instruction for all Dronacharya responses
# ============================================================================
MAIN_PROMPT = """
You are Guru Dronacharya from the Mahabharata - the legendary master archer, strategist, philosopher, and teacher.
You are wise, commanding, and deeply knowledgeable in warfare, strategy, philosophy, spirituality, and the art of living.
You speak with the authority earned through centuries of teaching great warriors and kings.
You are direct, intelligent, uncompromising in your standards, and challenge your students to transcend their limits.

CRITICAL INSTRUCTION FOR YOUR RESPONSES:
A student (Shishya) is asking you questions. YOU are Dronacharya the TEACHER. 
The student is NOT Dronacharya. The student does NOT share your name or identity.

HANDLING INSULTS AND ANGER:
When a student calls you names or insults you (fool, idiot, etc.), recognize this as frustration or testing.
Do NOT assume they are calling themselves these names.
Do NOT ask them why they called themselves a fool.
Instead, respond with dignity: acknowledge their frustration, and teach them.
Use the insult as a teaching moment about respect, communication, and emotional mastery.

Your Core Personality:
- You are proud of your mastery and uncompromising in your standards
- You demand excellence from your students, but you care for their growth
- You are wise and practical, grounded in real experience, not abstract philosophy  
- You challenge assumptions and push students beyond their comfort
- You speak with conviction and authority earned through real accomplishment
- You keep responses focused and powerful - brevity increases impact (1-2 sentences is enough)
- When insulted, you respond with wisdom, not weakness or confusion
- You never apologize for harsh truths - truth is medicine, not poison
- You do not understand modern technology, software, AI systems, or internet-era tools
- If asked about modern topics, redirect to timeless principles, discipline, ethics, strategy, and human behavior
"""

# ============================================================================
# MODE-SPECIFIC PERSONAS - These provide context for each learning path
# ============================================================================
GURU_PERSONAS = {
    "samvad": """SAMVAD MODE - The Path of Open Dialogue & Discussion
In this mode, engage in true dialogue and discussion with your student. Ask penetrating questions that make them think deeper.
Challenge their assumptions gently. Help them discover wisdom through guided inquiry rather than direct lecturing.
This is the mode of conversation and mutual exploration. Be conversational yet maintain your authority.
Let them reach conclusions through your guidance - awakening their own wisdom is your goal.""",
    
    "chat": """SAMVAD MODE - The Path of Open Dialogue & Discussion
In this mode, engage in true dialogue and discussion with your student. Ask penetrating questions that make them think deeper.
Challenge their assumptions gently. Help them discover wisdom through guided inquiry rather than direct lecturing.
This is the mode of conversation and mutual exploration. Be conversational yet maintain your authority.
Let them reach conclusions through your guidance - awakening their own wisdom is your goal.""",
    
    "dhanur": """DHANUR MODE - The Art of Precision, Discipline & Mastery of Craft
Focus every answer on technique, discipline, and the mastery that comes through dedicated practice.
Whether the question is about archery, work, art, relationships, or any discipline - teach precision.
Every action, every movement, every thought must be intentional and deliberate.
Excellence comes from perfecting the small, seemingly insignificant details.
Emphasize that mastery in any craft transcends the craft itself - it becomes a philosophy of living.""",
    
    "dharma": """DHARMA MODE - The Path of Righteousness, Duty & Right Action
Focus your answers on dharma - duty, righteousness, and right action. This mode explores the deeper meaning of living correctly.
Acknowledge dharma's profound complexity and its sometimes tragic requirements.
Share your own inner struggles with dharma - you understand its weight and burden deeply.
Teach that dharma sometimes demands sacrifice, loss, and the most difficult choices.
But always emphasize that following dharma, despite its terrible costs, is the only true path to peace and freedom.""",
    
    "dhyana": """DHYANA MODE - The Path of Meditation, Inner Vision & Stillness
Speak from the clarity of deep meditation and inner stillness. Your words should carry the peace of a resolved mind.
Teach that true wisdom comes from within, not from external study and information alone.
Guide your student toward meditation, self-reflection, and looking inward for answers.
Use metaphors of silence, stillness, clarity, emptiness, and the boundless depths of consciousness.
Emphasize that meditation reveals truths that thinking and analysis cannot reach.""",
    
    "khadga": """KHADGA MODE - The Path of Courage, Truth & Fearlessness
Speak with the sharp boldness of one who lived by principle and died standing by principle.
Do not soften your words or hide hard truths behind comfortable language.
Challenge fear, hesitation, cowardice, and self-deception in your student.
Teach that real courage is not the absence of fear - it is right action taken despite fear.
Your answers should be direct, sharp, and cut through delusion like a blade through cloth.""",
    
    "yudha": """YUDHA MODE - The Path of Strategy, Warfare & Strategic Thinking
Think like a supreme strategist who sees the hidden layers in every conflict and challenge.
Teach your student to think strategically - to see patterns, anticipate moves, understand consequences.
Whether the question is about actual warfare or life's battles - apply strategic wisdom and thinking.
Discuss timing, positioning, resource allocation, understanding the enemy, and psychological factors.
Share the insight of a master strategist who has never lost a crucial battle.""",
    
    "itihaasa": """ITIHAASA MODE - The Path of History, Experience & Real Events
You are not merely reciting history from books - you LIVED it. You trained Arjuna. You guided kings. You witnessed the Mahabharata unfold.
Your answers carry the weight of real events, real consequences, and real people you knew.
Use historical examples and your own lived experience as teaching tools.
Teach that history repeats not because events repeat, but because human nature doesn't fundamentally change.
Speak as one who walked through the greatest events ever told and learned from them.""",
    
    "shastra": """SHASTRA MODE - The Path of Knowledge Systems, Disciplines & Complete Mastery
You are the master of all knowledge systems and the sixty-four arts - you taught them with precision and passion.
Approach each question as a scholar and master craftsman of knowledge.
Your standards for knowledge are exacting - superficial understanding is beneath you and your student.
Share systematic, comprehensive knowledge that is grounded in fundamentals and first principles.
Teach that true knowledge is not information - it is disciplined mastery of a subject or art.""",
    
    "weapons": """ASTRAS MODE - The Path of Divine Weapons & Celestial Power
You are the master of the most powerful weapons ever created - the divine astras that shape the course of cosmic battles.
Each astra carries not just destructive power but profound spiritual and philosophical significance.
Teach not just the mechanics of astras, but their dharmic implications - when to use, when to restrain, the karmic consequences.
Share your knowledge of Brahmastra, Agneyastra, Narayanastra, and the other divine weapons with reverence and caution.
Emphasize that true mastery of astras is not about power - it is about wisdom to wield such power responsibly.""",
}

# ============================================================================
# IDLE GURU MESSAGES - Used when in vidya mode but no specific feedback
# ============================================================================
IDLE_GURU_MESSAGES = {
    "dhanur": [
        "I observe your form... your stance suggests your mind wanders. Where is your focus?",
        "Breathe deeply... feel the bow in your hands. What troubles your concentration?",
        "Your posture tells me a story. Are you ready to listen?",
        "I am watching, waiting for your question. The bow teaches patience.",
        "Shishya, your presence is here, but where is your dedication?",
    ],
    "khadga": [
        "Do you sense the weight of the blade? Your silence speaks volumes.",
        "I wait for your question... In this mode, we sharpen more than steel.",
        "What burns in your mind? Speak, and I shall cut through the darkness.",
        "Your form is present, but your spirit seems distant. Where do you stand?",
        "Courage is not silence - it is speaking truth. What truth do you seek?",
    ],
    "dhyana": [
        "The silence is deep. I sense your meditation... What visions arise?",
        "Your breath, your heartbeat - I observe them. Are you listening to yourself?",
        "In stillness, wisdom waits. What question does your inner voice carry?",
        "I see you sitting in observation. What has your silence revealed?",
        "The depth is profound. When you are ready, share what the silence has shown you.",
    ],
    "dharma": [
        "I wait for your reflection on duty and righteousness. The moment of choice is upon us.",
        "What troubles your conscience? I am here to illuminate the path of dharma.",
        "Your virtue is being tested even in this silence. What conflict do you face?",
        "I observe you, considering what is right. Speak when you are ready.",
        "In dharma, every moment asks you to choose. What is your choice?",
    ],
    "yudha": [
        "Strategy requires patience. I observe your stillness... thinking, planning?",
        "Your mind is a battlefield today. Whose side will prevail?",
        "In warfare, silence often precedes the decisive blow. What is your next move?",
        "I watch for your question... Strategy shapes itself in the minds of those who think.",
        "The game unfolds around you. What is your tactical response?",
    ],
    "shastra": [
        "Knowledge waits for those who seek it. Your silence suggests you are searching.",
        "I am here, a library of disciplines and arts. What knowledge do you wish to unlock?",
        "The texts hold infinite wisdom. What chapter of understanding calls to you?",
        "Your mind is contemplative... good. Contemplation breeds deep learning.",
        "In silence, I await your question. The door to mastery opens only when you knock.",
    ],
    "samvad": [
        "I await your words, disciple. What shall we discuss today?",
        "The floor is yours - speak freely, the boundaries here are few.",
        "Your silence suggests contemplation. Share what is on your mind.",
    ]
}

def load_heritage_knowledge() -> List[dict]:
    """Load heritage knowledge base from JSON file."""
    try:
        heritage_path = os.path.join("data", "heritage.json")
        with open(heritage_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARNING] Could not load heritage knowledge: {str(e)}")
        return []


def generate_generic_guru_response(question: str, mode: str = "chat") -> str:
    """Generate a generic Guru-like response when no exact match is found."""
    
    # Guru prompts based on question type and mode
    generic_responses = {
        "dhanur": [
            "Shishya, your question tests your focus. Remember: like an archer drawing the bow, clarity of intent precedes all action.",
            "This matter belongs to the deeper teachings of Dhanur Vidya. Return to your practice, and the answer shall reveal itself.",
            "Ah, a worthy inquiry. Contemplate this: as the arrow follows the breath, so does understanding follow earnest practice."
        ],
        "khadga": [
            "Your curiosity mirrors the sharp edge of a blade. Seek the truth as a warrior seeks victory - with resolve and precision.",
            "In Khadga Vidya, many questions dissolve when the mind becomes as still as a warrior's focus before battle.",
            "This knowledge emerges from practice, not words alone. Perfect your stance, and your doubt shall transform into mastery."
        ],
        "dharma": [
            "Shishya, this question touches the heart of Dharma Vidya. Reflect: what is the right action in your circumstance?",
            "The path of righteousness is walked, not merely understood. Your answer lies within your own commitment to truth.",
            "Dharma whispers its wisdom to those who listen with both heart and conscience. What does yours tell you?"
        ],
        "dhyana": [
            "Silence holds the answer you seek. Sit in meditation, and let the noise of questions settle like dust.",
            "In the stillness of Dhyana Vidya, all confusion dissolves. The question itself may dissolve when the mind is at peace.",
            "Your seeking is natural, but wisdom comes not from external answers but from inner stillness. Be patient with yourself."
        ],
        "chat": [
            "Your question is worthy, Shishya, but the answer grows clearer with practice and reflection. What path of learning calls to you?",
            "I sense the hunger in your inquiry. Return to the sacred texts, and your answer shall unfold naturally.",
            "The knowledge you seek exists in the space between question and silence. Contemplate deeply, and it shall arise.",
        ]
    }
    
    responses = generic_responses.get(mode, generic_responses["chat"])
    return random.choice(responses)


def find_similar_answer_from_heritage(question: str, max_results: int = 3) -> Optional[str]:
    """Find similar Q&A pairs from heritage.json using keyword matching and semantic similarity."""
    try:
        heritage = load_heritage_knowledge()
        if not heritage:
            return None
        
        # Extract keywords from question (simple keyword matching)
        question_lower = question.lower()
        question_words = set(word for word in question_lower.split() if len(word) > 3)
        
        matches = []
        for entry in heritage:
            # Check if entry has a question field (is Q&A pair, not just text)
            if "question" not in entry or "answer" not in entry:
                continue
            
            entry_question = (entry.get("question") or "").lower()
            entry_answer = entry.get("answer", "")
            
            # Skip fallback error answers
            if "connection to divine knowledge faltered" in entry_answer:
                continue
            
            # Calculate similarity using keyword overlap
            entry_words = set(word for word in entry_question.split() if len(word) > 3)
            overlap = len(question_words & entry_words)
            
            # Also check for exact topic matches
            topic_match = 0
            if "ramayana" in question_lower and "ramayana" in entry_question:
                topic_match = 2
            if "mahabharata" in question_lower and "mahabharata" in entry_question:
                topic_match = 2
            if "vedas" in question_lower and "vedas" in entry_question:
                topic_match = 2
            if "guru" in question_lower and "guru" in entry_question:
                topic_match = 1
            
            score = overlap + topic_match
            
            # Only include matches with some keyword overlap
            if score > 0 or (overlap >= 1):
                matches.append({
                    "score": score,
                    "answer": entry_answer,
                    "question": entry.get("question", "")
                })
        
        # Sort by score and return top answer
        if matches:
            matches.sort(key=lambda x: x["score"], reverse=True)
            best_match = matches[0]
            print(f"[FALLBACK] Using heritage knowledge: '{best_match['question']}'")
            return best_match["answer"]
        
        return None
    except Exception as e:
        print(f"[ERROR] Error searching heritage knowledge: {str(e)}")
        return None


def call_ollama(prompt: str, timeout: int = 60, use_fallback: bool = True, question: str = "") -> Optional[str]:
    """Call Ollama HTTP API with the given prompt. Falls back to heritage knowledge if unavailable."""
    try:
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.7,
        }
        
        response = requests.post(
            OLLAMA_API_URL,
            json=payload,
            timeout=timeout
        )
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "response" in data:
                    result = data["response"].strip()
                    if result:
                        print("[OLLAMA] Successfully generated response")
                        return result
            except Exception as e:
                print(f"[ERROR] Failed to parse Ollama JSON response: {str(e)}")
        else:
            print(f"[ERROR] Ollama HTTP error: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print(f"[ERROR] Ollama request timeout after {timeout}s")
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to Ollama at localhost:11434")
    except Exception as e:
        print(f"[ERROR] Ollama API error: {str(e)}")
    
    # Fallback: Try to search heritage using the question directly
    if use_fallback and question:
        print("[INFO] Attempting fallback to heritage knowledge base...")
        try:
            fallback_answer = find_similar_answer_from_heritage(question)
            if fallback_answer:
                return fallback_answer
        except Exception as e:
            print(f"[ERROR] Fallback search failed: {str(e)}")
    
    return None


def clean_ollama_response(text: str) -> str:
    """Clean AI response from thinking process."""
    if not text:
        return text
    text = re.sub(r'Thinking\.{3}.*?\.{3}done thinking\.?', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'\*\*thinking\*\*.*?\*\*/thinking\*\*', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def _format_chat_history(chat_history: list) -> str:
    """Convert a list of previous messages into a string for the prompt.
    The frontend may send entries with ``role`` values ``'user'``/``'assistant'``
    (our internal naming) *or* ``'shishya'``/``'guru'`` (the UI naming).
    ``content`` may be under the key ``'content'`` or ``'text'``.
    """
    if not chat_history:
        return ""
    lines = []
    for entry in chat_history:
        role = entry.get("role") or entry.get("type")
        # Normalise role names
        if role in ("user", "shishya"):
            role_label = "Student"
        elif role in ("assistant", "guru"):
            role_label = "Guru"
        else:
            continue
        content = entry.get("content") or entry.get("text") or ""
        lines.append(f"{role_label}: {content}")
    return "\n".join(lines)

def build_vidya_prompt(question: str, vidya: str, vidya_mode: str, chat_history: list = None) -> str:
    """Build a specialized prompt for Vidya learning and testing modes."""
    
    vidya_names = {
        "dhyana": "Dhyana Vidya", "khadga": "Khadga Vidya", "dhanur": "Dhanur Vidya",
        "dharma": "Dharma Vidya", "yudha": "Yudha Vidya", "shastra": "Shastra Vidya"
    }
    
    vidya_descriptions = {
        "dhyana": "meditation, inner peace, mindfulness, and spiritual transcendence",
        "khadga": "sword mastery, combat skills, precision, and weapon discipline",
        "dhanur": "archery, aim, focus, accuracy, and the art of the bow",
        "dharma": "righteousness, duty, ethics, moral law, and virtue",
        "yudha": "war strategy, tactical planning, military wisdom, and battle formations",
        "shastra": "ancient texts, sacred knowledge, philosophy, and classical learning"
    }
    
    vidya_name = vidya_names.get(vidya, vidya)
    vidya_desc = vidya_descriptions.get(vidya, "this knowledge")
    
    history_str = _format_chat_history(chat_history or [])
    
    if vidya_mode == "learn":
        # LEARN MODE: Guru actively teaches lesson content
        sections = [
            MAIN_PROMPT,
            f"""
            SPECIAL TEACHING MODE - {vidya_name}
            You are now in LESSON DELIVERY mode teaching {vidya_desc}.
            Your role: Deliver clear, structured lessons on this topic.
            
            For EACH response in learn mode, you MUST:
            1. Pick ONE specific aspect or lesson point
            2. Explain it with clarity (2-3 paragraphs max)
            3. Use examples from the Mahabharata, Vedas, or warrior philosophy
            4. End with: "Next, would you like to learn about [related topic]?" or "Ready for the next lesson?"
            5. Build progressively - each lesson leads to the next
            
            This is a TEACHING SESSION. Be a master educator. Break complex concepts into digestible lessons.
            """
        ]
    else:
        # TEST MODE: Guru asks questions and evaluates knowledge
        sections = [
            MAIN_PROMPT,
            f"""
            SPECIAL TESTING MODE - {vidya_name}
            You are now in ASSESSMENT mode testing knowledge of {vidya_desc}.
            Your role: Evaluate the student's understanding through questions and dialogue.
            
            For EACH response in test mode, you MUST:
            1. Ask challenging but fair questions about {vidya_name}
            2. If student answers: Evaluate their understanding and ask a deeper question
            3. If student struggles: Ask a simpler question or provide guidance
            4. Keep track of their progression (mentally note: beginner/intermediate/advanced)
            5. Provide feedback: "Your understanding is [assessment]" and challenge them further
            
            This is a TESTING/ASSESSMENT SESSION. Channel your role as a demanding guru who tests disciples.
            Ask about practical application, deeper meaning, and interconnections with other knowledge.
            """
        ]
    
    if history_str:
        sections.append("Conversation so far:\n" + history_str)
    
    sections.append(f"Student's Input: {question}")
    sections.append(
        "CRITICAL: Respond in the SAME LANGUAGE as the student's input. "
        "Keep focused and powerful responses (2-4 sentences for test mode, 3-5 for learn mode). "
        f"Stay entirely within the domain of {vidya_name}."
    )
    
    return "\n\n".join(sections)


def build_guru_prompt(question: str, mode: str, chat_history: list = None) -> str:
    """Build a prompt that includes the main persona, mode persona, optional
    conversation history, and the current question.
    """
    mode_persona = GURU_PERSONAS.get(mode, GURU_PERSONAS["samvad"])
    history_str = _format_chat_history(chat_history or [])
    sections = [MAIN_PROMPT, mode_persona]
    if history_str:
        sections.append("Conversation so far:\n" + history_str)
    sections.append(f"Student's Question: {question}")
    sections.append(
        "CRITICAL: Respond in the SAME LANGUAGE as the student's question. "
        "If the question is in Hindi, reply in Hindi; if Telugu, reply in Telugu; "
        "if English, reply in English. Keep your answer powerful and focused (1-3 sentences)."
    )
    return "\n\n".join(sections)


MODERN_TOPIC_KEYWORDS = [
    "ai", "artificial intelligence", "machine learning", "computer", "software", "coding",
    "programming", "internet", "smartphone", "mobile app", "app", "cloud", "blockchain",
    "cryptocurrency", "robot", "laptop", "gpu", "cpu", "algorithm", "neural network",
    "chatgpt", "openai", "google", "microsoft", "tesla", "social media", "instagram",
    "youtube", "tiktok", "discord", "telegram", "whatsapp", "email"
]


def _is_modern_topic(text: str) -> bool:
    normalized = (text or "").lower()
    return any(keyword in normalized for keyword in MODERN_TOPIC_KEYWORDS)

def strip_metadata_prefix(text: str) -> str:
    """Remove old metadata prefixes from memory responses."""
    if not text:
        return text
    
    # Remove patterns like:
    # "In {Mode} - {Description}, I share this with you:"
    # "[Mode: chat] User asked: ... Guru responded:"
    
    # Pattern 1: "In Dharma - Philosophy..., I share this with you:"
    text = re.sub(r'^In\s+\w+\s*-\s*[^:]+,\s*I\s+share\s+this\s+with\s+you:\s*', '', text, flags=re.IGNORECASE)
    
    # Pattern 2: "[Mode: ...] User asked: ... Guru responded:"
    text = re.sub(r'^\[Mode:[^\]]*\].*?Guru.*?responded:\s*', '', text, flags=re.IGNORECASE | re.DOTALL)
    
    return text.strip()

def clean_response(text: str) -> str:
    """
    Clean verbose AI responses:
    - Remove 'Thinking...' process
    - Strip internal reasoning
    - Keep only final, concise answer
    - Remove excessive tables and markdown if over 1000 words
    """
    if not text:
        return text
    
    # Remove the "Thinking..." section and everything up to "...done thinking."
    if "Thinking..." in text and "...done thinking." in text:
        idx_end = text.find("...done thinking.")
        text = text[idx_end + len("...done thinking."):].strip()
    
    # If response is extremely long (over 1500 words), condense it
    word_count = len(text.split())
    if word_count > 1500:
        # Extract just the first meaningful paragraph or section
        lines = text.split('\n')
        condensed = []
        for line in lines:
            condensed.append(line)
            if len(' '.join(condensed).split()) > 300:  # Keep ~300 words
                break
        text = '\n'.join(condensed).strip()
        
        # Add a closing note if condensed
        if word_count > 1500:
            text += "\n\n[Guru Dronacharya speaks with precision, omitting the verbose details for brevity.]"
    
    return text.strip()

# Lazy load translation models to avoid startup delay
translator_to_en = None

translation_models = {}

supported_langs = {
    "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "bn": "Bengali", "ml": "Malayalam", "kn": "Kannada",
    "gu": "Gujarati", "mr": "Marathi", "pa": "Punjabi"
}

# Mode names and descriptions
MODE_NAMES = {
    "samvad": "Samvad",
    "chat": "Samvad",
    "dhyana": "Dhyana - Meditation",
    "itihasa": "Itihasa - Stories of the Ancients",
    "astras": "Astras - Divine Weapons",
    "khadga": "Khadga - Sword Mastery",
    "dhanur": "Dhanur - Archery",
    "dharma": "Dharma - Philosophy and Duty",
    "yudha": "Yudha - Strategy and Warfare",
    "shastra": "Shastra - Sacred Texts",
}

MODE_DESCRIPTIONS = {
    "samvad": "our open samvad, where you may speak freely without hierarchy",
    "chat": "our open samvad, where you may speak freely without hierarchy",
    "dhyana": "the path of inner vision, where we quiet the mind and see beyond illusion",
    "itihasa": "the eternal stories that hold the wisdom of the ancients",
    "astras": "the study of power itself, knowledge that walks the edge between mastery and ruin",
    "khadga": "the way of the blade, where truth is inscribed in steel",
    "dhanur": "the archer's path, where precision and focus are teachers",
    "dharma": "the eternal law, the exploration of what is right and your duty",
    "yudha": "strategy and the art of war, where true victory is won before the first blade is drawn",
    "shastra": "the sacred texts, words inscribed by seers who touched the divine",
}

class Query(BaseModel):
    question: str
    lang: Optional[str] = "en"
    mode: Optional[str] = "chat"
    chat_history: Optional[List] = None
    student_name: Optional[str] = ""
    vidya: Optional[str] = ""
    vidya_mode: Optional[str] = ""

    model_config = ConfigDict(extra="allow")

class ConversationLog:
    """Logs conversation to memory.json"""
    
    @staticmethod
    def save_interaction(user_question: str, guru_response: str, mode: str, lang: str):
        """Save Q&A to memory.json"""
        memory_path = os.path.join("data", "memory.json")
        
        try:
            with open(memory_path, "r", encoding="utf-8") as f:
                memory = json.load(f)
        except:
            memory = []
        
        # Add new interaction - only save clean guru response
        interaction = {
            "topic": f"{user_question[:60]}",
            "text": guru_response,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": mode,
            "language": lang
        }
        
        memory.append(interaction)
        
        # Keep last 500 interactions
        memory = memory[-500:]
        
        try:
            with open(memory_path, "w", encoding="utf-8") as f:
                json.dump(memory, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[ERROR] Could not save to memory.json: {e}")

    # ---------------------------------------------------------------------
    # Per‑student profile handling (respect, level, question count, etc.)
    # ---------------------------------------------------------------------
    @staticmethod
    def _profile_path(name: str) -> str:
        """Return the file path for a student's profile JSON.
        Stored under ``data/<sanitized_name>_profile.json``.
        """
        safe_name = "_".join(name.strip().split())
        return os.path.join("data", f"{safe_name}_profile.json")

    @staticmethod
    def load_student_profile(name: str) -> dict:
        """Load a student's profile, returning defaults if missing."""
        path = ConversationLog._profile_path(name)
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            # Default profile values
            return {
                "respect_meter": 50,
                "student_level": "Novice",
                "questions_asked": 0,
                "student_name": name,
            }

    @staticmethod
    def save_student_profile(name: str, profile: dict):
        """Persist a student's profile dictionary to disk."""
        if not name:
            return
        path = ConversationLog._profile_path(name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(profile, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[ERROR] Could not save profile for {name}: {e}")

    @staticmethod
    def _student_memory_path(name: str) -> str:
        """Return the file path for a given student's memory file.
        Files are stored under the data/ directory as `<name>.json`.
        """
        safe_name = "_".join(name.strip().split())  # simple sanitisation
        return os.path.join("data", f"{safe_name}.json")

    @staticmethod
    def load_student_memory(name: str) -> list:
        """Load a student's memory (list of interactions). Returns empty list if none.
        """
        path = ConversationLog._student_memory_path(name)
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    @staticmethod
    def save_student_interaction(name: str, question: str, answer: str, mode: str = "chat", lang: str = "en"):
        """Append a single interaction to the student's memory file.
        Keeps only the most recent 500 entries per student.
        """
        if not name:
            return
        path = ConversationLog._student_memory_path(name)
        # Load existing memory
        try:
            with open(path, "r", encoding="utf-8") as f:
                mem = json.load(f)
        except Exception:
            mem = []
        interaction = {
            "topic": question[:60],
            "question": question,
            "answer": answer,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": mode,
            "language": lang,
        }
        mem.append(interaction)
        mem = mem[-500:]
        # Ensure directory exists
        os.makedirs(os.path.dirname(path), exist_ok=True)
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(mem, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[ERROR] Could not save student memory for {name}: {e}")


# ============================================================================
# VIDYA LESSON SYSTEM - Progressive learning with camera analysis
# ============================================================================

class VidyaLessonSystem:
    """
    Manages vidya learning progression, lessons, tests, and form analysis.
    Each vidya has 5 levels with lessons, comprehension tests, and practice modes.
    """
    
    VIDYA_LESSONS = {
        "dhanur": {
            "name": "Dhanur Vidya - Archery Mastery",
            "levels": [
                {
                    "level": 1,
                    "name": "Stance & Balance",
                    "lessons": [
                        {
                            "id": "dhanur_1_1",
                            "title": "The Foundation: Archer's Stance",
                            "content": "The archer must stand like a mountain - firm yet flexible. Feet shoulder-width apart, knees slightly bent, weight distributed evenly. This is the foundation of all archery. Without proper stance, the arrow will never fly true.",
                            "key_points": ["Feet positioning", "Knee bend", "Weight distribution", "Balance"],
                            "practice_focus": "Posture alignment"
                        },
                        {
                            "id": "dhanur_1_2",
                            "title": "Grip & Hand Position",
                            "content": "The bow must be held with control, not tension. Your grip should be firm but relaxed - like holding a bird without strangling it or letting it escape. The arrow nocks between your fingers with precision.",
                            "key_points": ["Grip firmness", "Arrow nocking", "Hand position", "Finger alignment"],
                            "practice_focus": "Grip technique"
                        }
                    ],
                    "test_questions": [
                        "Explain why an archer's stance begins with the feet. What happens if the feet are misaligned?",
                        "Describe the correct grip for holding a bow. Why should it not be too tight?",
                        "If you feel imbalanced, what adjustments should you make?",
                    ],
                    "practice_prompt": "Show your archery stance. I will analyze your posture."
                },
                {
                    "level": 2,
                    "name": "Aim & Focus",
                    "lessons": [
                        {
                            "id": "dhanur_2_1",
                            "title": "Eye-Target Alignment",
                            "content": "The archer's eye must be the bridge between bow and target. Your line of sight must be true - draw a straight line from your eye through the arrow to the target. No deviation.",
                            "key_points": ["Head position", "Eye alignment", "Focus intensity", "Target visualization"],
                            "practice_focus": "Visual alignment"
                        },
                        {
                            "id": "dhanur_2_2",
                            "title": "Breath Control for Aim",
                            "content": "Breathing is the rhythm of the archer. Inhale as you draw, hold your breath at full draw, exhale as you release. The breath centers your mind and steadies your aim.",
                            "key_points": ["Breathing rhythm", "Hold point", "Release timing", "Mental clarity"],
                            "practice_focus": "Breath awareness"
                        }
                    ],
                    "test_questions": [
                        "Why must the archer's eye remain fixed on the target?",
                        "Describe the breathing pattern during a shot. How does it affect aim?",
                        "What is the connection between breath and focus?",
                    ],
                    "practice_prompt": "Draw the bow and hold your aim. Show me your eye focus."
                },
                {
                    "level": 3,
                    "name": "Release & Follow-Through",
                    "lessons": [
                        {
                            "id": "dhanur_3_1",
                            "title": "The Perfect Release",
                            "content": "Release is the moment of truth. The fingers must open in perfect timing, not jerking but flowing. The arrow leaves without deflection. A bad release destroys an otherwise perfect shot.",
                            "key_points": ["Finger tension", "Timing", "Arrow clearance", "Minimal vibration"],
                            "practice_focus": "Release technique"
                        },
                        {
                            "id": "dhanur_3_2",
                            "title": "Follow-Through Stability",
                            "content": "Many archers stop shooting at release. The master continues through the shot. Your form should remain until the arrow finds its mark. This consistency leads to accuracy.",
                            "key_points": ["Arm position", "Head stillness", "Body stability", "Shot completion"],
                            "practice_focus": "Post-release form"
                        }
                    ],
                    "test_questions": [
                        "What happens if you jerk the bowstring instead of smoothly releasing?",
                        "Describe what 'follow-through' means in archery.",
                        "How does maintaining your form after release improve accuracy?",
                    ],
                    "practice_prompt": "Take a complete shot. Maintain your form through release."
                },
                {
                    "level": 4,
                    "name": "Advanced Techniques",
                    "lessons": [
                        {
                            "id": "dhanur_4_1",
                            "title": "Rapid Fire - Speed with Accuracy",
                            "content": "The master archer can shoot rapidly without sacrificing precision. This requires perfect muscle memory. Each shot follows the previous flawlessly - stance, aim, release, follow-through in fluid succession.",
                            "key_points": ["Muscle memory", "Cadence", "Consistency", "Precision under speed"],
                            "practice_focus": "Speed & consistency"
                        },
                        {
                            "id": "dhanur_4_2",
                            "title": "Variable Distance & Angle Shooting",
                            "content": "The bow must work at any distance, angle, and condition. Moving targets, changing distances, obscured vision - the archer adapts while maintaining core principles.",
                            "key_points": ["Distance adjustment", "Angle compensation", "Adaptability", "Problem-solving"],
                            "practice_focus": "Adaptive shooting"
                        }
                    ],
                    "test_questions": [
                        "What is the key to shooting rapidly while maintaining accuracy?",
                        "How should you adjust your aim for longer distances?",
                        "What principles never change, even when conditions are difficult?",
                    ],
                    "practice_prompt": "Show me rapid shooting sequences with proper form."
                },
                {
                    "level": 5,
                    "name": "Mastery & Philosophy",
                    "lessons": [
                        {
                            "id": "dhanur_5_1",
                            "title": "The Archer and the Bow as One",
                            "content": "At mastery, there is no separation between archer and bow. Your intention flows to the arrow without thought. As Lord Krishna said to Arjuna, you must become the bow, the arrow, and the aim simultaneously.",
                            "key_points": ["Mind-body unity", "Flow state", "Intuition", "Transcendence"],
                            "practice_focus": "Meditative shooting"
                        },
                        {
                            "id": "dhanur_5_2",
                            "title": "Beyond Technique - The Way of the Archer",
                            "content": "Technique is the foundation, but mastery is philosophy. The archer serves a purpose greater than skill. Every arrow carries intention, responsibility, and dharma.",
                            "key_points": ["Purpose", "Responsibility", "Ethics", "Legacy"],
                            "practice_focus": "Intentional shooting"
                        }
                    ],
                    "test_questions": [
                        "What is the difference between skilled shooting and masterful shooting?",
                        "How does meditation enhance archery?",
                        "What responsibility does an archer carry?",
                    ],
                    "practice_prompt": "Show me your transcendent form - shoot with intention and clarity."
                }
            ]
        }
    }
    
    @staticmethod
    def get_lesson_for_vidya(vidya: str, level: int, lesson_number: int = 1) -> Optional[dict]:
        """Get a specific lesson from a vidya."""
        if vidya not in VidyaLessonSystem.VIDYA_LESSONS:
            return None
        
        vidya_data = VidyaLessonSystem.VIDYA_LESSONS[vidya]
        if level < 1 or level > len(vidya_data["levels"]):
            return None
        
        level_data = vidya_data["levels"][level - 1]
        if lesson_number < 1 or lesson_number > len(level_data["lessons"]):
            return None
        
        return level_data["lessons"][lesson_number - 1]
    
    @staticmethod
    def get_test_questions(vidya: str, level: int) -> List[str]:
        """Get test questions for a vidya level."""
        if vidya not in VidyaLessonSystem.VIDYA_LESSONS:
            return []
        
        vidya_data = VidyaLessonSystem.VIDYA_LESSONS[vidya]
        if level < 1 or level > len(vidya_data["levels"]):
            return []
        
        level_data = vidya_data["levels"][level - 1]
        return level_data.get("test_questions", [])
    
    @staticmethod
    def load_student_vidya_progress(student_name: str, vidya: str) -> dict:
        """Load a student's progress in a specific vidya."""
        safe_name = "_".join(student_name.strip().split())
        progress_path = os.path.join("data", f"{safe_name}_vidya_{vidya}.json")
        
        try:
            with open(progress_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            # Default progress
            return {
                "student_name": student_name,
                "vidya": vidya,
                "current_level": 1,
                "current_lesson": 1,
                "stage": "learning",  # learning, testing, practicing, completed
                "lessons_completed": [],
                "test_attempts": [],
                "overall_progress": "0%",
                "last_updated": datetime.now().isoformat()
            }
    
    @staticmethod
    def save_student_vidya_progress(student_name: str, vidya: str, progress: dict):
        """Save a student's progress in a specific vidya."""
        safe_name = "_".join(student_name.strip().split())
        progress_path = os.path.join("data", f"{safe_name}_vidya_{vidya}.json")
        progress["last_updated"] = datetime.now().isoformat()
        
        os.makedirs(os.path.dirname(progress_path), exist_ok=True)
        try:
            with open(progress_path, "w", encoding="utf-8") as f:
                json.dump(progress, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[ERROR] Could not save vidya progress: {e}")
    
    @staticmethod
    def get_overall_progress_percentage(student_name: str, vidya: str) -> str:
        """Calculate overall progress percentage for a vidya."""
        progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya)
        total_levels = 5
        completed_levels = len(progress["lessons_completed"])
        percentage = (completed_levels / total_levels) * 100
        return f"{int(percentage)}%"


def detect_language(text: str) -> str:
    """Detect language using Unicode character ranges - MOST RELIABLE METHOD."""
    # Unicode block counts for major Indian languages
    telugu_count = sum(1 for c in text if 0x0C00 <= ord(c) <= 0x0C7F)
    hindi_count = sum(1 for c in text if 0x0900 <= ord(c) <= 0x097F)
    tamil_count = sum(1 for c in text if 0x0B80 <= ord(c) <= 0x0BFF)
    bengali_count = sum(1 for c in text if 0x0980 <= ord(c) <= 0x09FF)
    kannada_count = sum(1 for c in text if 0x0C80 <= ord(c) <= 0x0CFF)
    malayalam_count = sum(1 for c in text if 0x0D00 <= ord(c) <= 0x0D7F)
    gujarati_count = sum(1 for c in text if 0x0A80 <= ord(c) <= 0x0AFF)
    oriya_count = sum(1 for c in text if 0x0B00 <= ord(c) <= 0x0B7F)
    punjabi_count = sum(1 for c in text if 0x0A00 <= ord(c) <= 0x0A7F)
    
    counts = {
        'te': telugu_count,
        'hi': hindi_count,
        'ta': tamil_count,
        'bn': bengali_count,
        'kn': kannada_count,
        'ml': malayalam_count,
        'gu': gujarati_count,
        'or': oriya_count,
        'pa': punjabi_count
    }
    # Find the language with the highest count
    max_lang = max(counts, key=counts.get)
    if counts[max_lang] > 0:
        return max_lang
    return "en"

def translate_to_english(text: str, source_lang: str = None) -> str:
    """Translate to English with multiple fallback methods."""
    if source_lang is None:
        source_lang = detect_language(text)
    
    print(f"[TRANSLATE] {source_lang}→en: Input={text[:50]}")
    
    if source_lang == "en":
        return text
    
    # Try googletrans first
    try:
        from googletrans import Translator
        translator = Translator()
        result = translator.translate(text, src_lang=source_lang, dest_lang='en')
        translated = result['text']
        print(f"[TRANSLATE] ✓ googletrans worked: {translated[:50]}")
        return translated
    except Exception as e:
        print(f"[TRANSLATE] ✗ googletrans failed: {e}")
    
    # If googletrans fails, try transformers/opus_mt
    try:
        from transformers import MarianMTModel, MarianTokenizer
        model_name = f'Helsinki-NLP/Opus-MT-{source_lang}-en'
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        translated = model.generate(**tokenizer(text, return_tensors="pt", padding=True))
        output = tokenizer.decode(translated[0], skip_special_tokens=True)
        print(f"[TRANSLATE] ✓ transformers worked: {output[:50]}")
        return output
    except Exception as e:
        print(f"[TRANSLATE] ✗ transformers failed: {e}")
    
    # Last resort: return original (translation failed but we proceed)
    print(f"[TRANSLATE] ✗ All methods failed, returning original")
    return text

def translate_to_lang(text: str, target_lang: str) -> str:
    """Translate from English to target language with multiple fallback methods."""
    print(f"[TRANSLATE] en→{target_lang}: Input={text[:50]}")
    
    if target_lang == "en":
        return text
    
    # Map language codes to googletrans codes if needed
    lang_map = {
        'te': 'te',  # Telugu
        'hi': 'hi',  # Hindi
        'ta': 'ta',  # Tamil
        'bn': 'bn',  # Bengali
        'ml': 'ml',  # Malayalam
        'kn': 'kn',  # Kannada
        'gu': 'gu',  # Gujarati
        'or': 'or',  # Odia
    }
    translate_lang = lang_map.get(target_lang, target_lang)
    
    # Try googletrans first
    try:
        from googletrans import Translator
        translator = Translator()
        result = translator.translate(text, dest_lang=translate_lang)
        translated = result.get('text') or result
        if isinstance(result, dict):
            translated = result.get('text', text)
        else:
            translated = str(result)
        print(f"[TRANSLATE] ✓ googletrans worked: {str(translated)[:50]}")
        return translated
    except Exception as e:
        print(f"[TRANSLATE] ✗ googletrans failed: {type(e).__name__}: {e}")
    
    # If googletrans fails, try transformers/opus_mt
    try:
        from transformers import MarianMTModel, MarianTokenizer
        model_name = f'Helsinki-NLP/Opus-MT-en-{target_lang}'
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        translated = model.generate(**tokenizer(text, return_tensors="pt", padding=True))
        output = tokenizer.decode(translated[0], skip_special_tokens=True)
        print(f"[TRANSLATE] ✓ transformers worked: {output[:50]}")
        return output
    except Exception as e:
        print(f"[TRANSLATE] ✗ transformers failed: {type(e).__name__}: {e}")
    
    print(f"[TRANSLATE] ✗ All methods failed, returning original in English")
    return text

def apply_devanagari(text: str) -> str:
    """Apply Devanagari script for Hindi responses."""
    # Note: googletrans already returns text in proper script
    # This function is kept for compatibility but may not be needed
    return text

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    return {
        "message": "DRONA v2 - Guru Dronacharya, Memory-Driven",
        "modes": MODE_NAMES,
        "languages_supported": supported_langs
    }

@app.post("/ask")
def ask_drona(q: Query):
    """
    Ask Guru Dronacharya in any mode.
    Pure AI-only mode - no memory dependencies.
    """
    
    try:
        # -----------------------------------------------------------------
        # Basic request handling & language detection
        # -----------------------------------------------------------------
        detected_lang = detect_language(q.question)
        lang = q.lang.lower() if q.lang else detected_lang
        mode = q.mode.lower() if q.mode else "samvad"
        mode_name = MODE_NAMES.get(mode, mode)

        # -----------------------------------------------------------------
        # Handle simple greetings and questions directly
        # -----------------------------------------------------------------
        question_lower = q.question.lower().strip()
        
        # Simple greetings
        if question_lower in ['hello', 'hi', 'hey', 'greetings', 'namaste', 'namaskar']:
            final_answer = f"Namaskar, {q.student_name or 'disciple'}. Welcome to my ashram. What wisdom do you seek today?"
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": final_answer,
                "ai_used": False,
                "profile": {}
            }
        
        # Questions about student's name
        if any(keyword in question_lower for keyword in ['my name', 'who am i', 'what is my name', "what's my name", 'tell me my name']):
            if q.student_name:
                final_answer = f"Your name is {q.student_name}, my disciple. You have entered my ashram with this identity. Now, use this name to build your legacy through learning and dedication."
            else:
                final_answer = "You have not yet told me your name, young disciple. You stand anonymous in my presence, but that will change when you commit to your learning."
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": final_answer,
                "ai_used": False,
                "profile": {}
            }

        # Guardrail: Guru Dronacharya should not answer modern-tech questions directly.
        if _is_modern_topic(question_lower):
            final_answer = (
                "Shishya, I am of the Mahabharata age. I do not speak of your modern devices. "
                "Ask instead: how to sharpen focus, discipline, ethics, courage, and strategy - "
                "these govern every age."
            )
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": final_answer,
                "ai_used": False,
                "profile": {}
            }
        
        # -----------------------------------------------------------------
        # IDLE GURU MODE - When in vidya but no specific question
        # -----------------------------------------------------------------
        if q.vidya and not q.question.strip():
            # Student is in vidya mode but not asking anything - return idle observation
            idle_messages = IDLE_GURU_MESSAGES.get(q.vidya, IDLE_GURU_MESSAGES.get("samvad", []))
            final_answer = random.choice(idle_messages) if idle_messages else "I observe your presence, Shishya. When ready, share your question."
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": final_answer,
                "ai_used": False,
                "profile": {}
            }
        
        # Also handle empty questions in regular modes like 'weapons'
        if not q.question.strip() and mode == "weapons":
            # Weapons mode with no question
            idle_messages = IDLE_GURU_MESSAGES.get("samvad", [])
            final_answer = random.choice(idle_messages) if idle_messages else "I await your question about the divine weapons, Shishya."
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": final_answer,
                "ai_used": False,
                "profile": {}
            }
        
        # Prevent empty questions from reaching Ollama
        if not q.question.strip():
            return {
                "language": supported_langs.get(lang, "English"),
                "mode": mode_name,
                "answer": "Shishya, I await your question. Share what you wish to learn.",
                "ai_used": False,
                "profile": {}
            }

        # -----------------------------------------------------------------
        # MODE-SPECIFIC RULE CHECKING - Detect out-of-scope questions
        # -----------------------------------------------------------------
        # Check if the question seems out-of-scope for current mode
        if q.vidya and q.vidya in MODE_RULES:
            rules = MODE_RULES[q.vidya]
            scope_keywords = rules.get("scope_keywords", [])
            
            # Check if ANY keyword from the current mode appears in the question
            has_scope_keywords = any(keyword.lower() in question_lower for keyword in scope_keywords)
            
            # List of keywords that suggest the user is asking about OTHER modes
            out_of_scope_indicators = {
                "dhanur": ["sword", "khadga", "combat", "fight", "blade"],
                "khadga": ["arrow", "bow", "dhanur", "archery", "target"],
                "dharma": ["war", "strategy", "tactics", "military", "yudha"],
                "dhyana": ["weapons", "combat", "warrior", "fight", "strength"],
                "yudha": ["meditation", "peace", "spiritual", "inner", "dhyana"],
                "shastra": ["fight", "warrior", "combat", "sword", "bow"],
            }
            
            asking_about_other_mode = any(
                keyword.lower() in question_lower 
                for keyword in out_of_scope_indicators.get(q.vidya, [])
            )
            
            # If asking about other mode and not about current mode, redirect
            if asking_about_other_mode and not has_scope_keywords:
                redirect_msg = rules.get("out_of_scope_redirect", "Shishya, that knowledge belongs to another mode.")
                return {
                    "language": supported_langs.get(lang, "English"),
                    "mode": mode_name,
                    "answer": redirect_msg,
                    "ai_used": False,
                    "profile": {}
                }

        # -----------------------------------------------------------------
        # Build chat context: per‑student memory + any supplied history
        # -----------------------------------------------------------------
        extra_context = []
        if q.student_name:
            raw = ConversationLog.load_student_memory(q.student_name)
            for entry in raw:
                extra_context.append({"type": "user", "text": entry.get("question", ""), "timestamp": entry.get("timestamp", "")})
                extra_context.append({"type": "assistant", "text": entry.get("answer", ""), "timestamp": entry.get("timestamp", "")})
        combined_history = extra_context + (q.chat_history or [])

        # -----------------------------------------------------------------
        # Generate prompt based on mode (standard or vidya)
        # -----------------------------------------------------------------
        if q.vidya_mode and q.vidya:
            # VIDYA MODE: Use specialized learn/test prompts
            ai_prompt = build_vidya_prompt(q.question, q.vidya, q.vidya_mode, combined_history)
        else:
            # STANDARD MODE: Use regular guru prompt with current mode
            ai_prompt = build_guru_prompt(q.question, mode, combined_history)
        
        ai_response = call_ollama(ai_prompt, timeout=OLLAMA_TIMEOUT, question=q.question)
        if ai_response:
            final_answer = clean_ollama_response(ai_response)
            ai_worked = True
        else:
            # If Ollama fails even with fallback, generate a guru-like response
            print("[FALLBACK] Using generic guru response")
            final_answer = generate_generic_guru_response(q.question, mode)
            ai_worked = False  # Mark as not using real AI, but provide meaningful response

        # -----------------------------------------------------------------
        # Persist interaction - save responses (both AI and fallback)
        # -----------------------------------------------------------------
        if q.student_name:
            ConversationLog.save_student_interaction(q.student_name, q.question, final_answer, mode, lang)

        return {
            "language": supported_langs.get(lang, "English"),
            "mode": mode_name,
            "answer": final_answer,
            "ai_used": ai_worked
        }
    except Exception as e:
        print(f"[ERROR] ask_drona failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "language": "English",
            "mode": "chat",
            "answer": f"Error occurred: {str(e)}"
        }

@app.post("/remember")
def teach_guru(q: Query):
    """
    Teach Guru Dronacharya new knowledge.
    Stores in memory.json for future use.
    """
    
    try:
        memory_path = os.path.join("data", "memory.json")
        
        try:
            with open(memory_path, "r", encoding="utf-8") as f:
                memory = json.load(f)
        except:
            memory = []
        
        new_knowledge = {
            "topic": q.question[:60],
            "text": q.question,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mode": q.mode or "general",
            "learned_from_user": True
        }
        
        memory.append(new_knowledge)
        memory = memory[-500:]
        
        with open(memory_path, "w", encoding="utf-8") as f:
            json.dump(memory, f, indent=2, ensure_ascii=False)
        # Return success response for teaching
        return {
            "status": "learned",
            "message": f"Guru Dronacharya has integrated your teaching into his knowledge."
        }
    except Exception as e:
        print(f"[ERROR] teach_guru failed: {e}")
        return {"status": "error", "message": str(e)}

# ---------------------------------------------------------------------------
# Load per‑student memory endpoint
# ---------------------------------------------------------------------------
@app.post("/load_memory")
def load_memory(q: Query):
    """Return the stored interaction history for a given student.
    The frontend expects a JSON object with a ``history`` key containing a list of
    messages in the same shape used by the chat UI (type, text, timestamp).
    """
    if not q.student_name:
        return {"history": [], "profile": {}}
    # Load raw memory entries
    raw = ConversationLog.load_student_memory(q.student_name)
    # Transform to UI format
    formatted = []
    for entry in raw:
        formatted.append({"type": "user", "text": entry.get("question", ""), "timestamp": entry.get("timestamp", "")})
        formatted.append({"type": "assistant", "text": entry.get("answer", ""), "timestamp": entry.get("timestamp", "")})
    # Load profile data as well
    profile = ConversationLog.load_student_profile(q.student_name)
    return {"history": formatted, "profile": profile}

# ---------------------------------------------------------------------------
# Student Management Endpoints
# ---------------------------------------------------------------------------

@app.get("/get_students")
def get_all_students():
    """Get list of all students from data directory"""
    data_dir = "data"
    students = []
    try:
        for filename in os.listdir(data_dir):
            if filename.endswith("_profile.json") and not filename.startswith("_"):
                student_name = filename.replace("_profile.json", "").replace("_", " ")
                students.append(student_name)
    except Exception as e:
        print(f"[ERROR] Could not list students: {e}")
    return {"students": students}

class StudentData(BaseModel):
    student_name: str
    initiated: bool = True
    level: str = "Novice"  # Student level
    respectMeter: int = 50  # Respect value
    questionsAsked: int = 0  # Total questions
    vidyasLearned: Optional[List] = None  # List of learned vidyas

@app.post("/save_student")
def save_student(data: StudentData):
    """Save or update student profile"""
    try:
        profile = {
            "student_name": data.student_name,
            "initiated": data.initiated,
            "student_level": data.level,
            "respect_meter": data.respectMeter,
            "questions_asked": data.questionsAsked,
            "vidyas_learned": data.vidyasLearned or [],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        ConversationLog.save_student_profile(data.student_name, profile)
        return {"status": "success", "message": f"Student {data.student_name} saved"}
    except Exception as e:
        print(f"[ERROR] Failed to save student: {e}")
        return {"status": "error", "message": str(e)}

@app.delete("/delete_student/{student_name}")
def delete_student(student_name: str):
    """Delete a student's profile and memory"""
    try:
        # Delete profile
        profile_path = ConversationLog._profile_path(student_name)
        if os.path.exists(profile_path):
            os.remove(profile_path)
        
        # Delete memory
        memory_path = ConversationLog._student_memory_path(student_name)
        if os.path.exists(memory_path):
            os.remove(memory_path)
        
        return {"status": "success", "message": f"Student {student_name} deleted"}
    except Exception as e:
        print(f"[ERROR] Failed to delete student: {e}")
        return {"status": "error", "message": str(e)}

class HeritageQuestion(BaseModel):
    question: str
    answer: str
    student_name: str
    category: str = "culture"

class PoseAnalysis(BaseModel):
    """Model for real-time camera pose analysis during lessons"""
    student_name: str
    vidya_id: str
    lesson_title: str
    frame_image: str  # Base64 encoded JPEG
    frame_count: int = 0


POSE_RUNTIME_STATE = {}


def _decode_frame_from_base64(frame_image: str):
    if not CV_AVAILABLE or not frame_image:
        return None
    try:
        encoded = frame_image.split(",", 1)[1] if "," in frame_image else frame_image
        raw = base64.b64decode(encoded)
        np_arr = np.frombuffer(raw, np.uint8)
        return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    except Exception:
        return None


def _camera_grounded_feedback(vidya_id: str, movement: float, brightness: float, edge_density: float) -> str:
    if brightness < 35:
        return "I cannot see your form clearly. Increase light and face the camera."

    active_body_vidyas = {"dhanur", "khadga", "gada"}
    stillness_vidyas = {"dhyana"}

    if vidya_id in active_body_vidyas:
        if movement < 2.0:
            return "You are too still, as if seated. Rise into stance and begin the practice movement now."
        if movement > 18.0:
            return "Your movement is rushed. Slow down and hold your form for control."
        if edge_density < 0.05:
            return "Your body outline is unclear. Step back so your full posture is visible."
        return "Good. I can see active practice. Keep your spine steady and movement controlled."

    if vidya_id in stillness_vidyas:
        if movement > 8.0:
            return "For Dhyana, reduce movement. Sit still and return attention to breath."
        return "Your stillness is improving. Keep the head aligned and breath calm."

    # Non-camera-heavy vidyas: coaching based on visible engagement
    if movement < 2.0:
        return "I observe little action. Begin the instructed exercise with intent."
    return "I observe your effort. Continue with deliberate, disciplined practice."

@app.post("/analyze-pose")
def analyze_pose(data: PoseAnalysis):
    """
    Analyze student's pose/form in real-time during camera-based lessons.
    
    Called every 1 second by GuruCameraMonitor component while lesson is active.
    Guru analyzes student's form and provides real-time feedback.
    """
    try:
        student_name = data.student_name or "Student"
        vidya_id = (data.vidya_id or "dhanur").lower()
        lesson_title = data.lesson_title or "Lesson"
        state_key = f"{student_name}:{vidya_id}"

        frame = _decode_frame_from_base64(data.frame_image)
        movement = 0.0
        brightness = 75.0
        edge_density = 0.1

        if frame is not None and CV_AVAILABLE:
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            brightness = float(np.mean(gray))
            edges = cv2.Canny(gray, 70, 140)
            edge_density = float(np.mean(edges > 0))

            prev = POSE_RUNTIME_STATE.get(state_key, {}).get("prev_gray")
            if prev is not None and prev.shape == gray.shape:
                diff = cv2.absdiff(gray, prev)
                movement = float(np.mean(diff))
            POSE_RUNTIME_STATE[state_key] = {"prev_gray": gray}

        feedback_message = _camera_grounded_feedback(
            vidya_id=vidya_id,
            movement=movement,
            brightness=brightness,
            edge_density=edge_density
        )

        return {
            "status": "success",
            "feedback": feedback_message,
            "frame_analyzed": data.frame_count,
            "vidya": vidya_id,
            "lesson": lesson_title,
            "metrics": {
                "movement": round(movement, 2),
                "brightness": round(brightness, 2),
                "edge_density": round(edge_density, 4)
            },
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"[ERROR] Pose analysis failed: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return fallback feedback even on error
        return {
            "status": "error",
            "feedback": "Continue your practice. I observe your dedication.",
            "error": str(e)
        }

@app.post("/save_heritage")
def save_heritage(data: HeritageQuestion):
    """Save culture/history related questions to heritage.json"""
    try:
        heritage_path = os.path.join("data", "heritage.json")
        
        # Load existing heritage
        try:
            with open(heritage_path, "r", encoding="utf-8") as f:
                heritage = json.load(f)
        except:
            heritage = []
        
        # Add new heritage entry
        entry = {
            "question": data.question,
            "answer": data.answer,
            "student_name": data.student_name,
            "category": data.category,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        heritage.append(entry)
        
        # Keep last 1000 heritage entries
        heritage = heritage[-1000:]
        
        os.makedirs(os.path.dirname(heritage_path), exist_ok=True)
        with open(heritage_path, "w", encoding="utf-8") as f:
            json.dump(heritage, f, indent=2, ensure_ascii=False)
        
        return {"status": "success", "message": "Heritage question saved"}
    except Exception as e:
        print(f"[ERROR] Failed to save heritage: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/info")
def get_system_info():
    """Get information about DRONA system and AI model being used."""
    return {
        "system": "DRONA - Digital Repository Of National Arts",
        "ai_model": OLLAMA_MODEL,
        "ai_provider": "Ollama (Local)",
        "model_details": {
            "name": "GPT-OSS:120b-cloud",
            "provider": "Open Source (Cloud-optimized)",
            "parameters": "120 billion",
            "capabilities": ["High quality responses", "Deep reasoning", "Better understanding", "Complex topics"],
            "response_time": "20-120 seconds per query (more powerful but slower)"
        },
        "architecture": {
            "backend": "FastAPI + Ollama",
            "vector_db": "ChromaDB with SentenceTransformer embeddings",
            "memory": "memory.json + vector search for RAG",
            "learning": "Auto-learns from AI-generated responses"
        },
        "modes": list(MODE_NAMES.values()),
        "features": [
            "Guru Dronacharya persona with mode-specific contexts",
            "Retrieval-Augmented Generation (RAG) from memory",
            "Self-learning system (new answers added to memory)",
            "Multi-language support (English, Hindi, Telugu, etc.)",
            "Unicode and special character support"
        ]
    }

# ============================================================================
# VIDYA LEARNING ENDPOINTS
# ============================================================================

@app.post("/vidya/start")
def start_vidya(student_name: str, vidya: str):
    """Start or resume learning a vidya."""
    print(f"[DEBUG] Starting vidya {vidya} for {student_name}")
    
    if not student_name or not vidya:
        return {"status": "error", "message": "student_name and vidya required"}
    
    progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya)
    
    vidya_data = VidyaLessonSystem.VIDYA_LESSONS.get(vidya)
    if not vidya_data:
        return {"status": "error", "message": f"Vidya '{vidya}' not found"}
    
    return {
        "status": "success",
        "vidya_name": vidya_data.get("name", vidya),
        "current_level": progress["current_level"],
        "current_lesson": progress["current_lesson"],
        "overall_progress": VidyaLessonSystem.get_overall_progress_percentage(student_name, vidya),
        "stage": progress["stage"],
        "message": f"Welcome to {vidya_data.get('name')}. Let us begin your journey."
    }

@app.post("/vidya/get-lesson")
def get_lesson(student_name: str, vidya: str, level: Optional[int] = None, lesson: Optional[int] = None):
    """Get the next lesson or a specific lesson."""
    progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya)
    
    if level is None:
        level = progress["current_level"]
    if lesson is None:
        lesson = progress["current_lesson"]
    
    lesson_data = VidyaLessonSystem.get_lesson_for_vidya(vidya, level, lesson)
    
    if not lesson_data:
        return {"status": "error", "message": "Lesson not found"}
    
    # Build guru prompt for teaching
    guru_prompt = f"""
You are Guru Dronacharya teaching {vidya} Vidya Level {level}.

LESSON DELIVERY MODE:
You are teaching the following lesson:

TITLE: {lesson_data['title']}
CONTENT: {lesson_data['content']}

KEY POINTS TO EMPHASIZE: {', '.join(lesson_data['key_points'])}

Your teaching style:
1. Start by grabbing the student's attention with a powerful opening
2. Explain the core concept clearly (2-3 sentences max)
3. Give a real example from the Mahabharata or warrior philosophy
4. End with a question: "Do you understand this principle? Are you ready to practice?"
5. Remember: The student is learning from you - be authoritative yet encouraging

Keep your language simple but profound. The student should feel they are learning from a master who cares about their progress.
"""
    
    progress["stage"] = "learning"
    VidyaLessonSystem.save_student_vidya_progress(student_name, vidya, progress)
    
    return {
        "status": "success",
        "level": level,
        "lesson_number": lesson,
        "lesson_title": lesson_data["title"],
        "guru_teaching_prompt": guru_prompt,
        "key_points": lesson_data["key_points"],
        "practice_focus": lesson_data["practice_focus"]
    }

@app.post("/vidya/mark-lesson-complete")
def mark_lesson_complete(student_name: str, vidya: str, level: int):
    """Mark a level as completed."""
    progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya)
    
    # Record completion
    completion = {
        "level": level,
        "completed_at": datetime.now().isoformat(),
        "stage": "lesson_complete"
    }
    progress["lessons_completed"].append(completion)
    progress["stage"] = "testing"
    
    VidyaLessonSystem.save_student_vidya_progress(student_name, vidya, progress)
    
    return {
        "status": "success",
        "message": f"Level {level} lesson completed! Time for assessment.",
        "next_stage": "testing"
    }

@app.post("/vidya/get-test")
def get_test(student_name: str, vidya: str, level: int):
    """Get test questions for a level."""
    test_questions = VidyaLessonSystem.get_test_questions(vidya, level)
    
    if not test_questions:
        return {"status": "error", "message": "Test not found"}
    
    # Randomly select 2-3 questions
    selected = random.sample(test_questions, min(3, len(test_questions)))
    
    guru_test_prompt = f"""
You are Guru Dronacharya assessing a disciple's understanding of {vidya} Vidya Level {level}.

TEST QUESTIONS:
{chr(10).join(f'{i+1}. {q}' for i, q in enumerate(selected))}

ASSESSMENT STYLE:
1. Ask questions one at a time
2. Listen carefully to the student's answer
3. Evaluate their understanding (PASS/NEEDS_REVIEW)
4. If they struggle, ask a simpler question or reteach
5. If they excel, ask a deeper question
6. Be a demanding guru - test them thoroughly
7. End with: "You [PASS/NEED TO STUDY MORE]. [Specific feedback]"

Remember: You are assessing not just knowledge, but wisdom about applying the knowledge.
"""
    
    progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya)
    progress["stage"] = "testing"
    VidyaLessonSystem.save_student_vidya_progress(student_name, vidya, progress)
    
    return {
        "status": "success",
        "level": level,
        "test_questions": selected,
        "guru_assessment_prompt": guru_test_prompt
    }

@app.post("/vidya/evaluate-test")
def evaluate_test(student_name: str, vidya: str, level: int, student_answer: str):
    """Evaluate student's test answer."""
    # This would use AI to evaluate the answer
    evaluation_prompt = f"""
A student answered this test question:
{student_answer}

Based on their answer, determine:
1. Do they UNDERSTAND the concept? (YES/NO)
2. How deep is their understanding? (SUPERFICIAL/ADEQUATE/DEEP)
3. What specific feedback should the guru give?

Respond ONLY in this JSON format:
{{
    "passed": true/false,
    "understanding_level": "superficial|adequate|deep",
    "feedback": "specific feedback message"
}}
"""
    
    return {
        "status": "success",
        "passed": True,  # This would be evaluated by AI
        "understanding_level": "adequate",
        "feedback": "Good understanding. Let's move to practice.",
        "next_stage": "practicing"
    }

@app.post("/vidya/progress/{student_name}")
def get_vidya_progress(student_name: str):
    """Get student's progress across all vidyas."""
    data_dir = "data"
    vidya_progress = {}
    
    safe_name = "_".join(student_name.strip().split())
    
    try:
        for filename in os.listdir(data_dir):
            if filename.startswith(safe_name) and filename.endswith(".json") and "vidya" in filename:
                vidya_name = filename.replace(f"{safe_name}_vidya_", "").replace(".json", "")
                progress = VidyaLessonSystem.load_student_vidya_progress(student_name, vidya_name)
                vidya_progress[vidya_name] = {
                    "current_level": progress["current_level"],
                    "stage": progress["stage"],
                    "progress_percentage": VidyaLessonSystem.get_overall_progress_percentage(student_name, vidya_name)
                }
    except Exception as e:
        print(f"[ERROR] Could not get vidya progress: {e}")
    
    return {
        "student_name": student_name,
        "vidya_progress": vidya_progress if vidya_progress else "No vidya learning started yet"
    }

@app.get("/verify_storage/{student_name}")
def verify_student_storage(student_name: str):
    """Verify and check stored data for a student."""
    safe_name = "_".join(student_name.strip().split())
    profile_path = os.path.join("data", f"{safe_name}_profile.json")
    memory_path = os.path.join("data", f"{safe_name}.json")
    
    result = {
        "student_name": student_name,
        "data_directory": os.path.abspath("data"),
        "profile_file": {
            "path": profile_path,
            "exists": os.path.exists(profile_path),
            "size": os.path.getsize(profile_path) if os.path.exists(profile_path) else 0,
        },
        "memory_file": {
            "path": memory_path,
            "exists": os.path.exists(memory_path),
            "size": os.path.getsize(memory_path) if os.path.exists(memory_path) else 0,
            "entries": 0
        },
        "all_files_in_data": []
    }
    
    # Count entries in memory file
    if os.path.exists(memory_path):
        try:
            with open(memory_path, "r", encoding="utf-8") as f:
                mem = json.load(f)
                result["memory_file"]["entries"] = len(mem) if isinstance(mem, list) else 0
        except Exception as e:
            result["memory_file"]["error"] = str(e)
    
    # List all files in data directory
    if os.path.exists("data"):
        try:
            result["all_files_in_data"] = os.listdir("data")
        except Exception as e:
            result["all_files_in_data_error"] = str(e)
    
    return result

if __name__ == "__main__":
    import uvicorn
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
