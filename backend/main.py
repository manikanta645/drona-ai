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
import subprocess
import re
import requests
from datetime import datetime
from typing import Optional, List

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
OLLAMA_MODEL = "gpt-oss:120b-cloud"  # Using cloud model available in your Ollama
OLLAMA_TIMEOUT = 120  # 120 seconds timeout for responses

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

MODE_NAMES = {
    "samvad": "Samvad",
    "dhanur": "Dhanur",
    "dharma": "Dharma",
    "dhyana": "Dhyana",
    "khadga": "Khadga",
    "yudha": "Yudha",
    "itihaasa": "Itihaasa",
    "shastra": "Shastra",
    "weapons": "Astras",
}

# ============================================================================
# MODE-SPECIFIC RULES & SCOPE DEFINITIONS
# ============================================================================
MODE_RULES = {
    "dhanur": {
        "focus": "Archery, bow technique, aim, focus, precision",
        "scope_keywords": ["arrow", "bow", "aim", "archery", "target", "precision", "focus"],
        "out_of_scope_redirect": "Shishya, this is DHANUR mode - the path of archery and precision. We study the bow, aim, and focus. For other knowledge, visit the appropriate mode.",
    },
    "khadga": {
        "focus": "Sword mastery, combat, technique, courage, truth",
        "scope_keywords": ["sword", "blade", "combat", "courage", "technique", "fight", "fearless"],
        "out_of_scope_redirect": "Shishya, this is KHADGA mode - the path of the sword and fearlessness. For that knowledge, visit another path.",
    },
    "dharma": {
        "focus": "Righteousness, duty, ethics, moral law, virtue",
        "scope_keywords": ["dharma", "duty", "righteous", "virtue", "ethics", "moral", "law"],
        "out_of_scope_redirect": "Shishya, this is DHARMA mode - we explore righteousness and duty. For other topics, seek the appropriate mode.",
    },
    "dhyana": {
        "focus": "Meditation, inner peace, mindfulness, spirituality",
        "scope_keywords": ["meditation", "peace", "stillness", "mind", "spirit", "consciousness", "inner"],
        "out_of_scope_redirect": "Shishya, this is DHYANA mode - the path of meditation and inner vision. For other knowledge, visit another mode.",
    },
    "yudha": {
        "focus": "War, strategy, tactics, military wisdom",
        "scope_keywords": ["war", "strategy", "tactics", "battle", "military", "timing", "positioning"],
        "out_of_scope_redirect": "Shishya, this is YUDHA mode - the path of strategy and warfare. For other knowledge, seek another mode.",
    },
    "shastra": {
        "focus": "Sacred texts, classical knowledge, philosophy, disciplines",
        "scope_keywords": ["text", "knowledge", "philosophy", "discipline", "learning", "vedas", "upanishad"],
        "out_of_scope_redirect": "Shishya, this is SHASTRA mode - the path of sacred knowledge and texts. For other topics, visit another mode.",
    },
    "itihaasa": {
        "focus": "History, stories, ancient events, lived experience",
        "scope_keywords": ["story", "history", "happened", "ancient", "event", "mahabharata", "ramayana"],
        "out_of_scope_redirect": "Shishya, this is ITIHAASA mode - the path of ancient stories and lived wisdom. For other topics, seek another mode.",
    },
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

def call_ollama(prompt: str, timeout: int = 60) -> Optional[str]:
    """Call Ollama HTTP API with the given prompt. Returns response or None if fails."""
    try:
        print(f"[DEBUG] Calling Ollama API at {OLLAMA_API_URL}")
        print(f"[DEBUG] Using model: {OLLAMA_MODEL}")
        
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
        
        print(f"[DEBUG] Ollama HTTP status code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                if "response" in data:
                    result = data["response"].strip()
                    print("[DEBUG] Ollama response received successfully")
                    return result
                else:
                    print("[ERROR] Ollama response missing 'response' field")
                    return None
            except Exception as e:
                print(f"[ERROR] Failed to parse Ollama JSON response: {str(e)}")
                return None
        else:
            print(f"[ERROR] Ollama HTTP error: {response.status_code}")
            print(f"[DEBUG] Response body: {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        print(f"[ERROR] Ollama request timeout after {timeout}s")
        return None
    except requests.exceptions.ConnectionError:
        print("[ERROR] Cannot connect to Ollama - is it running on localhost:11434?")
        return None
    except Exception as e:
        print(f"[ERROR] Ollama API error: {str(e)}")
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
    "dhyana": "Dhyana - Meditation",
    "itihasa": "Itihasa - Stories of the Ancients",
    "astras": "Astras - Divine Weapons",
    "khadga": "Khadga - Sword Mastery",
    "dhanur": "Dhanur - Archery",
    "dharma": "Dharma - Philosophy and Duty",
    "yudha": "Yudha - Strategy and Warfare",
    "shastra": "Shastra - Sacred Texts",
    "chat": "Samvad",
}

MODE_DESCRIPTIONS = {
    "dhyana": "the path of inner vision, where we quiet the mind and see beyond illusion",
    "itihasa": "the eternal stories that hold the wisdom of the ancients",
    "astras": "the study of power itself, knowledge that walks the edge between mastery and ruin",
    "khadga": "the way of the blade, where truth is inscribed in steel",
    "dhanur": "the archer's path, where precision and focus are teachers",
    "dharma": "the eternal law, the exploration of what is right and your duty",
    "yudha": "strategy and the art of war, where true victory is won before the first blade is drawn",
    "shastra": "the sacred texts, words inscribed by seers who touched the divine",
    "chat": "our open samvad, where you may speak freely without hierarchy",
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
        if mode not in GURU_PERSONAS:
            print(f"[DEBUG] Invalid mode '{mode}', defaulting to 'samvad'")
            mode = "samvad"
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
            print(f"[DEBUG] Vidya {q.vidya_mode.upper()} mode - {q.vidya}")
            print(f"[DEBUG] Current mode: vidya | Vidya type: {q.vidya}")
        else:
            # STANDARD MODE: Use regular guru prompt with current mode
            ai_prompt = build_guru_prompt(q.question, mode, combined_history)
            print(f"[DEBUG] Standard mode - {mode}")
            print(f"[DEBUG] Current mode: {mode} | Vidya: {q.vidya or 'none'}")
        
        print(f"[DEBUG] Sending prompt to Ollama API...")
        print(f"[DEBUG] Prompt length: {len(ai_prompt)} characters")
        
        ai_response = call_ollama(ai_prompt, timeout=OLLAMA_TIMEOUT)
        if ai_response:
            final_answer = clean_ollama_response(ai_response)
            print(f"[DEBUG] Response processed successfully")
        else:
            print(f"[ERROR] Ollama returned no response")
            final_answer = "I apologize, Shishya. The connection to divine knowledge faltered. Please try again."

        # -----------------------------------------------------------------
        # Persist interaction
        # -----------------------------------------------------------------
        if q.student_name:
            ConversationLog.save_student_interaction(q.student_name, q.question, final_answer, mode, lang)

        print(f"[DEBUG] Response ready to return")
        return {
            "language": supported_langs.get(lang, "English"),
            "mode": mode_name,
            "answer": final_answer,
            "ai_used": True
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
