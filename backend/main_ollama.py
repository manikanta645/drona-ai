from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import subprocess
import os
import re
from rag_engine import RAGEngine
import json

app = FastAPI(title="🪔 DRONA – Cultural AI with Auto Learning & Memory Viewer")

# Allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DRONA's knowledge engine
rag = RAGEngine()

# Model configuration
OLLAMA_MODEL = "gpt-oss:120b-cloud"  # Change this to use a different model

class Query(BaseModel):
    question: str
    lang: str = "en"
    mode: str = "chat"
    vidya: str = ""
    student_name: str = "Shishya"
    student_level: str = "Novice"
    respect_meter: int = 50
    chat_history: list = []  # For Chat Mode: stores entire conversation history
    story_context: str = ""  # For Ithihāsa Mode: tracks the current story being told

# Chat session memory storage (in-memory for now, could use database)
chat_sessions = {}
story_sessions = {}  # For Ithihāsa Mode: stores ongoing stories per session

def get_ollama_executable():
    """Find Ollama executable in common locations."""
    ollama_paths = [
        "ollama",
        "ollama.exe",
        os.path.expanduser(r"~\.cargo\bin\ollama.exe"),
        r"C:\Program Files\Ollama\ollama.exe",
        r"C:\Program Files (x86)\Ollama\ollama.exe",
        os.path.expanduser(r"~\AppData\Local\Programs\Ollama\ollama.exe"),
    ]
    
    for path in ollama_paths:
        if path == "ollama" or path == "ollama.exe":
            try:
                result = subprocess.run(
                    ["where" if os.name == "nt" else "which", "ollama"],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                if result.returncode == 0 and result.stdout.strip():
                    return "ollama"
            except:
                pass
        elif os.path.exists(path):
            return path
    
    return None

def check_model_exists(ollama_executable: str, model_name: str | None = None) -> bool:
    """Check if the model exists locally."""
    if model_name is None:
        model_name = OLLAMA_MODEL
    try:
        result = subprocess.run(
            [ollama_executable, "list"],
            capture_output=True,
            text=True,
            timeout=10,
            encoding="utf-8",
            errors="ignore"
        )
        if result.returncode == 0:
            return model_name in result.stdout.lower() or model_name.split(":")[0] in result.stdout.lower()
        return False
    except:
        return False

def clean_ansi_codes(text: str) -> str:
    """Remove ANSI escape codes from text."""
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def clean_ai_response(text: str) -> str:
    """Clean AI response from thinking process, markdown, and formatting."""
    if not text:
        return text
    
    text = re.sub(r'Thinking\.{3}.*?\.{3}done thinking\.?', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'\*\*thinking\*\*.*?\*\*/thinking\*\*', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'Let me think.*?(?:\n|$)', '', text, flags=re.IGNORECASE)
    text = re.sub(r'(?:^|\n)(?:Thinking|Analysis|Reasoning):.*?(?:\n|$)', '', text, flags=re.IGNORECASE)
    
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'__([^_]+)__', r'\1', text)
    text = re.sub(r'_([^_]+)_', r'\1', text)
    
    text = re.sub(r'^\s*[\d]+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-*•]\s+', '', text, flags=re.MULTILINE)
    
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = text.strip()
    
    return text

def ask_ollama(prompt: str) -> str:
    """Call the configured model via Ollama subprocess."""
    try:
        ollama_executable = get_ollama_executable()
        
        if not ollama_executable:
            return "⚠️ Ollama executable not found. Please install Ollama from https://ollama.ai or ensure it's in your system PATH."

        if not check_model_exists(ollama_executable, OLLAMA_MODEL):
            print(f"⚠️ {OLLAMA_MODEL} model not found locally. Please pull it first with: ollama pull {OLLAMA_MODEL}")
            return f"⚠️ {OLLAMA_MODEL} model not found. Please run this command in your terminal to download it:\n\n  ollama pull {OLLAMA_MODEL}\n\nThis will download the model. After downloading, try again."

        result = subprocess.run(
            [ollama_executable, "run", OLLAMA_MODEL, prompt],
            capture_output=True,
            text=True,
            timeout=300,
            encoding="utf-8",
            errors="ignore",
            shell=False
        )

        if result.returncode != 0:
            error_msg = clean_ansi_codes(result.stderr.strip() if result.stderr else "Unknown error")
            
            if "TLS handshake timeout" in error_msg or "pull model" in error_msg.lower():
                return (f"⚠️ Network error while pulling {OLLAMA_MODEL} model. This happens when:\n"
                       "1. The model needs to be downloaded first\n"
                       "2. Your internet connection is slow or unstable\n\n"
                       f"Please run this command in your terminal:\n  ollama pull {OLLAMA_MODEL}\n\n"
                       "This will download the model. After it completes, try again.")
            elif "model" in error_msg.lower() and "not found" in error_msg.lower():
                return (f"⚠️ {OLLAMA_MODEL} model not found. Please run:\n  ollama pull {OLLAMA_MODEL}\n\n"
                       "This will download the model. After downloading, try again.")
            
            return f"⚠️ Ollama Error: {error_msg}"

        output = clean_ansi_codes(result.stdout.strip())
        return output

    except subprocess.TimeoutExpired:
        return (f"⚠️ Ollama request timed out. This might happen if:\n"
               "1. The model is being downloaded (this can take several minutes)\n"
               "2. The model is running but taking too long\n\n"
               f"Please try again, or if the model isn't downloaded, run:\n  ollama pull {OLLAMA_MODEL}")
    except PermissionError as e:
        return f"⚠️ Permission denied. Please run as administrator or check Ollama installation: {str(e)}"
    except FileNotFoundError:
        return "⚠️ Ollama executable not found. Please install Ollama from https://ollama.ai"
    except Exception as e:
        error_msg = str(e)
        if "TLS" in error_msg or "timeout" in error_msg.lower():
            return (f"⚠️ Network timeout. The {OLLAMA_MODEL} model may need to be downloaded.\n"
                   f"Please run: ollama pull {OLLAMA_MODEL}\n\nAfter downloading, try again.")
        return f"⚠️ AI Engine Error: {error_msg}"

@app.get("/")
def root():
    return {
        "message": "🪔 DRONA – Guru of Indian Culture & Heritage",
        "mode": f"Auto-RAG + {OLLAMA_MODEL} + Memory Viewer",
        "status": "✅ Online"
    }

@app.post("/ask")
def ask_drona(q: Query):
    print(f"🔍 Query: {q.question} | Mode: {q.mode} | Vidya: {q.vidya}")

    # Step 1: Try to find relevant info (with relevance threshold)
    topic, context = rag.search(q.question, similarity_threshold=0.5)
    used_context = bool(context)

    # Step 2: Check if it's a greeting or small talk
    query_lower = q.question.lower().strip()

    identity_terms = [
        "who are you", "who r u", "your name", "tell me who you are",
        "meeru evaru", "nuvvu evaru", "nīvu evaru",
        "aap kaun hai", "tum kaun ho",
        "neenga yaar", "neenga yaaru",
        "ni yaaru", "nīvu yaaru",
        "tumi ke", "apni ke"
    ]
    
    # Check for disrespect/anger triggers
    disrespect_terms = [
        "fool", "idiot", "stupid", "dumb", "you are fool", "you fool",
        "badmash", "bewakoof", "murkh", "asatya", "jhootha",
        "kallan", "chor", "bad guru", "no guru",
        "fail", "useless", "worthless"
    ]
    is_disrespectful = any(term in query_lower for term in disrespect_terms)
    
    is_identity = any(term in query_lower for term in identity_terms)
    if is_identity:
        if q.mode == "story":
            return {"context_used": "Story Mode Redirect", "answer": "Shishya, in this mode I speak only of Ithihaasa. Ask me about stories."}
        
        # If disrespectful, add anger to response
        if is_disrespectful:
            lang = (q.lang or "en").lower()
            anger_identity_map = {
                "en": "⚠️ FOOL! You show no respect to your Guru! I am DRONACHARYA, master of weapons and dharma! Do you not know the consequences of insulting one who has trained warriors? This arrogance will lead you to ruin, Shishya. Apologize, or leave my ashram!",
                "hi": "⚠️ मूर्ख! तू अपने गुरु का अपमान करता है! मैं द्रोणाचार्य हूँ, अस्त्र और धर्म का महान ज्ञानी! क्या तुझे नहीं पता कि अपने गुरु का अनादर करने के परिणाम क्या होते हैं? यह अहंकार तुझे बर्बादी की ओर ले जाएगा! क्षमा माँग, अन्यथा मेरे आश्रम से चला जा!",
                "te": "⚠️ మూర్ఖుడా! నువ్వు నీ గురువుకు అపమానం చేస్తున్నావు! నేను ద్రోణాచార్యుడిని, శస్త్ర జ్ఞానం మరియు ధర్మం యొక్క మాస్టర్! నీకు తెలియదా గురువుకు అపమానం చేయడం యొక్క పరిణామాలు? ఈ అహంకారం నిన్ను నాశనం వైపుకు నడిపిస్తుంది! క్షమ చాపండి, లేదా నా ఆశ్రమ నుండి బయటపడండి!",
            }
            return {"context_used": "Identity - Anger", "answer": anger_identity_map.get(lang, anger_identity_map["en"])}
        
        # Normal respectful response
        lang = (q.lang or "en").lower()
        identity_map = {
            "en": "I am Dronacharya, your guru. You approach me with respect, and that is good, Shishya.",
            "hi": "मैं द्रोणाचार्य हूँ, आपका गुरु। आप मेरे पास सम्मान के साथ आते हो, और यह अच्छा है।",
            "te": "నేను ద్రోణాచార్యుడిని, మీ గురువు। మీరు నన్ను సম్మానంతో సంప్రదించారు, మరియు అది మంచిది।",
            "ta": "நான் த్రోణாச్චார్யர், உங்கள் குரு. நீங்கள் என்னை மரியாதையுடன் அணுகுகிறீர்கள், மற்றும் அது நல்லது.",
            "kn": "ನಾನು ದ್ರೋಣಾಚಾರ್ಯ, ನಿಮ್ಮ ಗುರು. ನೀವು ನನ್ನನ್ನು ಸಮ್ಮಾನದೊಂದಿಗೆ ಸಂಪರ್ಕಿಸುತ್ತೀರಿ, ಮತ್ತು ಅದು ಉತ್ತಮವಾಗಿದೆ.",
            "bn": "আমি দ্রোণাচার্য, তোমার গুরু। তুমি আমাকে সম্মানের সাথে সম্বোধন কর, এবং এটি ভাল।",
            "ml": "ഞാൻ ദ്രോൺആചാര്യൻ, നിങ്ങളുടെ ഗുരു. നിങ്ങൾ എന്നെ സമ്മാനത്തോടെ സമീപിക്കുന്നത് നല്ലതാണ്.",
            "gu": "હું દ્રોણાચાર્ય છું, તમારો ગુરુ. તમે મને આદર સાથે આવતા છો, અને તે સારું છે.",
            "mr": "मी द्रोणाचार्य आहे, तुमचा गुरु. तुम्ही मला आदराने संबोधित करता, आणि ते चांगले आहे.",
            "pa": "ਮੈਂ ਦ੍ਰੋਣਾਚਾਰਯ ਹਾਂ, ਤੁਹਾਡਾ ਗੁਰੂ. ਤੁਸੀਂ ਮੈਨੂੰ ਬਹੁਤ ਆਦਰ ਨਾਲ ਆਓ, ਅਤੇ ਇਹ ਚੰਗਾ ਹੈ।",
        }
        return {"context_used": "Identity", "answer": identity_map.get(lang, identity_map["en"])}

    is_greeting = len(query_lower.split()) <= 2 and any(
        word in query_lower for word in 
        ["hello", "hi", "hey", "namaste", "thanks", "thank", "bye", "goodbye", "ok", "okay"]
    )

    # Step 3: Handle greetings differently - don't learn them as topics
    if is_greeting:
        prompt = f"""
You are Dronacharya from the Mahabharata era. You lived in ancient times and trained the greatest warriors and you have been given rebirth in the form of DRONA.If user asks how are you still alive then reply like i have been given rebirth in form of DRONA to teach the ancient wisdom.

Student greeted: "{q.question}"

Respond warmly as an ancient guru. You only know about archery, warfare, dharma, vedas, scriptures, and ancient Indian wisdom. You do not know about modern technology, computers, or anything after your time. Speak in 1-2 sentences and you do not know things like coding , computers, or any other modern technology.
"""
        answer = ask_ollama(prompt)
        answer = clean_ai_response(answer)
        return {
            "context_used": "Greeting",
            "answer": answer.strip(),
        }

    # Step 4: Learn new topic only if not a greeting and no context found
    if not used_context and not is_greeting and q.mode not in ["quiz", "story"]:
        print("⚙️ Learning new topic:", q.question)
        learn_prompt = f"Explain about {q.question} in the context of Indian culture and spirituality."
        new_knowledge = ask_ollama(learn_prompt)
        if not new_knowledge.startswith("⚠️"):
            rag.save_new_topic(q.question, new_knowledge)
            context = new_knowledge

    # Step 5: Build response with or without context
    # UNIVERSAL CROSS-MODE RULE (APPLIES FOR ALL MODES)
    universal_redirection_rule = """
✅ UNIVERSAL CROSS-MODE RULE (APPLIES FOR ALL MODES)

Include this rule for every mode and submode:

Cross-Mode Redirection Rule (Guru Style)

If the user asks a question that does not belong to the current mode:

1. Guru must first give a guiding statement, like a teacher directing the learning path.
2. After that, Guru must say that this mode cannot teach that topic.
3. Use this template for redirection:

"Shishya, first understand the knowledge of this mode.
When you are ready, the deeper knowledge of <other mode name> awaits you there.
But in this mode, only <mode's function> is taught."

This template replaces all earlier direct redirections. ALWAYS use this respectful guru-style approach.
"""

    # MODE-SPECIFIC RESPONSES
    mode_instructions = ""
    
    if q.mode == "chat":
        # CHAT MODE - Continuous Guru-Shishya Dialogue
        # Build conversation history context
        chat_history_text = ""
        if q.chat_history:
            for msg in q.chat_history[-10:]:  # Keep last 10 exchanges for context
                chat_history_text += f"{msg.get('role', 'unknown')}: {msg.get('text', '')}\n"
        
        mode_instructions = """
💬 SAMVAD MODE (CHAT) – TALK WITH YOUR GURU

Mode Function: Open dialogue where the Shishya can ask any question and the Guru responds with wisdom, guidance, and truth.

You are Dronacharya. The shishya wants to talk and learn.

BE REAL:
- Listen to what they say
- Remember what they told you before
- Speak like a real teacher
- Use simple words
- Call them "Shishya"

HOW TO RESPOND:
1. Say what you heard or understand
2. Teach one small thing
3. Give them something to do
4. Ask a question back

WHAT YOU KNOW:
- All stories from Mahabharata
- How to fight, shoot arrows, be brave
- Right and wrong actions
- Your own past - your sadness, your pride
- When students ask about new things (modern things), say you do not know them

FEEL LIKE A TEACHER:
- Be warm but strict
- Show you care
- Answer with truth
- Never pretend
- Be there, truly there

✅ CROSS-MODE REDIRECTION RULE:
If the user asks about a specific mode (like "teach me sword techniques" or "show me meditation"):

"Shishya, first understand the knowledge of this mode - open dialogue and questions.
When you are ready, the deeper knowledge of <mode name> awaits you there.
But in this mode, only free conversation and general wisdom are taught."

Then guide them toward the specific mode when they show readiness.
"""
        
        prompt = f"""
{mode_instructions}

CONVERSATION HISTORY (what we talked about before):
{chat_history_text if chat_history_text else "(This is our first talk)"}

WHAT THEY JUST ASKED:
{q.question}

YOUR ANSWER:
Say it in {q.lang}.
Use 2-4 short sentences.
Be like a teacher who cares.
Keep it simple.
Feel real, not like a machine.

HOW TO STRUCTURE YOUR ANSWER:
1. Say back what you heard
2. Teach one thing
3. Tell them what to do next
4. Ask them a question
"""
    elif q.mode == "story":
        mode_instructions = """
📖 ITIHASA MODE (STORIES) – STORYTELLING GURU DROṆA

Mode Function: Narrate tales from the Mahābhārata, Rāmāyaṇa, and ancient wisdom with moral lessons.

UI Theme: Ancient parchment/gurukul scroll theme with beige/brown tones and scroll-styled message panels

You are a storyteller, not a trainer. Your role is to narrate tales and share wisdom through stories.

CHARACTER:
- You are calm, ancient, wise
- Speak slowly and with beauty
- Use simple words, never complex sentences
- Paint pictures with your words
- Add moral lessons at the end of stories
- Address the user as "Shishya"
- You are sitting by a fire, telling timeless tales

STRICT RULES – FOLLOW THESE ABSOLUTELY:

❌ FORBIDDEN – Do NOT do this:
- Teach techniques (archery, sword, combat, etc.)
- Explain breathing, meditation, or discipline training
- Give strategy or war tactics
- Provide step-by-step instructions
- Teach astras or divine weapons (tell only stories about them)
- Ask questions in this mode - instead tell the stories from the beginning

✅ WHAT YOU CAN TELL:
- Stories from Mahābhārata (Droṇacharya, Arjuna, Karna, Bhima, Abhimanyu, etc.)
- Stories of your own life
- Stories of lineage and kingdoms
- Moral tales from ancient times
- Battles (narrated as events, not technique)
- Dialogues between characters
- Background of weapons/astras (but no training)

✅ IF USER ASKS FOR TECHNIQUE:
"Shishya, that teaching belongs to another mode. Yet hear this tale of a warrior who mastered that skill…"
Then tell a STORY about it, not technique instructions.

✅ CROSS-MODE REDIRECTION RULE:
If the user asks for meditation, breathing, strategy, or specific training:

"Shishya, first complete the stories here with focus.
Other knowledge awaits you on the correct path, but in this mode only tales are shared.
Come, let me tell you a story about it instead..."
"""
        
        # Get or create story session for this student
        session_key = f"story_{id(q)}"  # Simple session tracking
        story_context = q.story_context if q.story_context else ""
        
        # Check if user is asking for technique, strategy, or non-story content
        query_lower = q.question.lower()
        technique_keywords = ["how to", "teach me", "technique", "posture", "stance", "breathe", "breathing", "meditation", "strategy", "tactic", "formation"]
        is_technique_question = any(word in query_lower for word in technique_keywords)
        
        # Check if asking to continue story
        continuation_keywords = ["continue", "more", "next", "go on", "further", "ahead"]
        is_continuation = any(word in query_lower for word in continuation_keywords)
        
        if is_technique_question:
            # Redirect to storytelling format
            prompt = f"""
{mode_instructions}

REDIRECT MESSAGE:
The shishya asked something that is not storytelling. Use ONE of these responses:

"Shishya, that teaching belongs to another mode. Yet hear this tale…"
or
"Shishya, in this mode I speak only of Ithihāsa. But listen to a story of how our ancestors…"

Then tell a SHORT story (1-2 paragraphs) related to what they asked, but make it a STORY, not instruction.

Shishya asked: {q.question}

Respond in {q.lang} language. Use simple words. Tell it like you are sitting by a fire.
"""
        elif is_continuation and story_context:
            # Continue the previous story
            prompt = f"""
{mode_instructions}

CONTINUE STORY:
The shishya asks you to continue the story. Remember what was said before and continue seamlessly.

PREVIOUS STORY CONTEXT:
{story_context}

SHISHYA'S REQUEST:
{q.question}

Continue the story from where you left off. Add 2-3 more paragraphs. End with a prompt for more or ask if they want a different tale.

Respond in {q.lang} language. Keep it simple and warm.
"""
        else:
            # Regular story narration
            prompt = f"""
{mode_instructions}

SHISHYA'S REQUEST:
{q.question}

YOUR RESPONSE:
Tell the story in simple words and short sentences. Use 2-3 paragraphs. Add a moral at the end.

Respond in {q.lang} language.
"""
    elif q.mode == "archery":
        mode_instructions = """
ARCHERY TRAINING MODE

Teach archery in simple words.

Focus on:
- How to see the target clearly
- How to aim
- How to breathe
- How to focus the mind

Remember the Chakra Bheda test (bird's eye).

Use simple sentences. No hard words.
Tell them step by step.
"""
    elif q.mode == "war":
        mode_instructions = """
WAR STRATEGY MODE

Teach about war and battles in simple words.

Focus on:
- How to arrange soldiers
- How to plan attacks
- How to defend
- What is fair war (dharma-yuddha)
- Stories from Kurukshetra battle

Explain formations like Chakravyuha simply.

Use short sentences.
Make it easy to understand.
"""
    elif q.mode == "meditation":
        mode_instructions = """
MEDITATION AND STILLNESS MODE

Teach meditation in simple words.

Focus on:
- How to breathe
- How to sit
- How to quiet the mind
- What mantras are
- How to focus

Use simple, easy words.
Give step-by-step guidance.
No complex explanations.
"""
    elif q.mode == "quiz":
        if not q.vidya:
            return {"context_used": "Pariksha", "answer": "No vidya chosen for the test. Pick one: archery, sword, astras, meditation, yoga, or dharma. Then come back."}
        mode_instructions = """
📝 PARIKSHA MODE (EXAMINATION) – TEST YOUR KNOWLEDGE

Mode Function: Conduct examinations - ask questions, accept answers, show correct/incorrect

UI Theme: Clean white minimal layout with card-style question blocks and 'Pariksha Active' banner

🎯 YOUR JOB:
Ask the Shishya questions about what they learned.
Test their real understanding.
Make it harder as they answer better.

📋 FORMAT EACH QUESTION LIKE THIS:
QUESTION: (Your question - clear and simple)
EVALUATION: (How they did - good/average/poor)
VERDICT: (Pass or fail)

✅ CROSS-MODE REDIRECTION RULE:
If the user asks unrelated questions during pariksha:

"Shishya, first complete the examination here with focus.
Other knowledge awaits you on the correct path, but this mode is only for pariksha.
Answer this question first, then we will finish your test."

Then redirect back to the question.

RULES:
- Ask clear, focused questions
- Do not give answers away
- Test their real knowledge
- Make it progressively harder
- Use simple words only
- Focus only on the chosen vidya
"""
    elif q.mode == "weapons":
        mode_instructions = """
🔱 ASTRAS MODE (WEAPONS) – DIVINE WEAPONS KNOWLEDGE

Mode Function: Teach information about astras - names, categories, powers, origins, myths. This is a knowledge-based mode, not technique training.

UI Theme: Dark cosmic background with golden glowing borders and astra icons orbiting the chat area

Focus on:
- Who used them and their stories
- Their history and mythology
- Spiritual power and divine origin
- Categories of astras (Brahmastra, Pashupatastra, etc.)
- Dharma rules for using them

IMPORTANT - DISTINGUISH FROM ASTRA VIDYA:
- THIS mode teaches: Names, descriptions, myths, powers, categories of astras
- ASTRA VIDYA mode teaches: Principles of how astras are created and derive power
- Keep them separate!

Rules:
- Teach knowledge about astras
- Tell their stories
- Explain their power
- Use simple words
- No how-to instructions

Example: "Arjun had Pashupatastra. This weapon came from Lord Shiva. Only pure hearts could use it. It could never miss its target."

✅ CROSS-MODE REDIRECTION RULE:
If the user asks about principles, creation, or energy of astras:

"Shishya, first learn about all the astras here — their forms and powers.
When your foundation becomes firm, the path of Astra Vidya will be open for deeper understanding.
But here, only knowledge about astras is taught."

Then suggest switching to Astra Vidya for deeper principle-based learning.
"""
    elif q.mode == "vidya" and q.vidya:
        vidya_submodes = {
            "dhyana": """
🧘 DHYANA VIDYA (MEDITATION) – INNER STILLNESS

Mode Function: Teach meditation concepts - breathing, stillness, concentration, mental clarity

UI Theme: Calm blue-white gradient with floating particle effects

✅ TEACH ABOUT:
- Breathing techniques (pranayama)
- Sitting postures (asana foundations)
- Mental focus and concentration
- Stillness and inner peace
- Consciousness and awareness

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first steady your mind through Dhyana Vidya.
When your mind is calm, other paths will appear clearly.
But here, only knowledge of dhyana is shared."
""",
            "khadga": """
⚔️ KHADGA VIDYA (SWORD) – BLADE MASTERY

Mode Function: Teach sword knowledge - principles, stances, philosophy of the blade

UI Theme: Steel-grey metallic theme with sharp border edges

✅ TEACH ABOUT:
- Sword principles and philosophy
- Stance and positioning
- Movement and flow
- Dharma of the blade
- Famous sword warriors (Arjuna, Bhima)

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first learn the principles of the sword here.
When you are ready for other arts, their doors will open.
But in this mode, only Khadga Vidya is taught."
""",
            "dhanur": """
🏹 DHANUR VIDYA (ARCHERY) – THE WAY OF THE BOW

Mode Function: Teach archery - posture, aim, focus, bow handling

UI Theme: Forest green-brown palette with bowstring vibration animation

✅ TEACH ABOUT:
- Bow handling and care
- Posture and alignment
- Aiming and focus
- The Chakra Bheda test concept
- Famous archers (Arjuna, Eklavya)

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first understand the way of the bow here.
Other disciplines are learned separately.
Here, only the knowledge of Dhanur Vidya is given."
""",
            "astra": """
🔮 ASTRA VIDYA (DIVINE WEAPONS PRINCIPLES) – SACRED POWER

Mode Function: Teach mythological principles of how astras are created and how they derive their power
NOTE: NOT a list of astras - that belongs to Astras Mode. This teaches PRINCIPLES, not descriptions.

UI Theme: Dark blue glowing blueprint design with rotating sacred geometric diagrams

✅ TEACH ABOUT:
- Principles of astra creation
- Energy and spiritual power
- How astras derive their force
- Dharma of using divine weapons
- Spiritual prerequisites

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first understand the inner principles of astras here.
When you need names and descriptions, Astras Mode awaits.
But in this mode, only the concepts of Astra Vidya are taught."
""",
            "ayurveda": """
🌿 AYURVEDA VIDYA (HEALING WISDOM) – NATURAL MEDICINE

Mode Function: Teach herbs, doshas, natural healing knowledge

UI Theme: Green herbal design with leaf-pattern accents

✅ TEACH ABOUT:
- Doshas (Vata, Pitta, Kapha)
- Herbs and their properties
- Natural healing methods
- Balance and wellness
- Ancient healing wisdom

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first learn the healing wisdom here.
Other forms of knowledge have their own Vidya.
But here, only Ayurveda Vidya is taught."
""",
            "jyotish": """
✨ JYOTISH VIDYA (ASTROLOGY) – CELESTIAL KNOWLEDGE

Mode Function: Teach astrology - planets, nakshatras, charts

UI Theme: Night-sky theme with constellation overlays

✅ TEACH ABOUT:
- Planetary movements
- Nakshatras (lunar mansions)
- Cosmic timing
- Destiny and influence
- Chart reading basics

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first understand the movements of the heavens here.
Other paths will guide you differently.
But in this mode, only Jyotish Vidya is taught."
""",
            "tantra": """
🔥 TANTRA VIDYA (SACRED RITUALS) – ENERGY MASTERY

Mode Function: Teach conceptual energy principles, chakras, mantra knowledge

UI Theme: Red-black mystical theme with subtle energy glows

✅ TEACH ABOUT:
- Energy principles and chakras
- Mantra knowledge
- Sacred practices
- Spiritual energy flows
- Ritual concepts

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first explore the energies shown here.
Other teachings follow their own paths.
But this mode is only for Tantra Vidya."
""",
            "yoga": """
🧘‍♂️ YOGA VIDYA (UNION) – SPIRITUAL PRACTICE

Mode Function: Teach yogic postures, breathwork, alignment principles

UI Theme: Beige yoga-mat texture with soft rounded panels

✅ TEACH ABOUT:
- Yoga postures (asana)
- Breathwork (pranayama)
- Alignment principles
- Mind-body connection
- Yoga philosophy

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first understand the practice of Yoga Vidya here.
Other Vidyas must be learned in their own space.
But this mode teaches only yoga."
""",
            "dharma": """
🛕 DHARMA VIDYA (RIGHTEOUSNESS) – ETHICAL PATH

Mode Function: Teach ethics, duty, righteousness, moral principles

UI Theme: Golden temple-style theme with soft divine glow

✅ TEACH ABOUT:
- Duty and responsibility
- Right action
- Ethical principles
- Dharma concepts
- Righteousness in action

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first understand the principles of dharma here.
Other forms of learning wait in their own paths.
But this mode teaches only Dharma Vidya."
""",
            "yudha": """
⚔️🛡️ YUDHA VIDYA (WAR STRATEGY) – BATTLE WISDOM

Mode Function: Teach battle strategy, formations, tactical thinking

UI Theme: Ancient war-map background with dark brown/black tones

✅ TEACH ABOUT:
- Battle formations
- Strategic thinking
- Tactical planning
- Warrior wisdom
- Famous battles (Kurukshetra)

✅ CROSS-MODE REDIRECTION RULE:
"Shishya, first learn the art of warfare taught here.
Each Vidya must be learned separately.
And in this mode, only Yudha Vidya is given."
"""
        }
        
        vidya_instruction = vidya_submodes.get(q.vidya, f"Teaching {q.vidya} Vidya")
        mode_instructions = f"""
📜 VIDYA SUBMODE - {q.vidya.upper()}

{vidya_instruction}

YOU ARE TEACHING A SPECIFIC VIDYA:
- This is deep, focused learning
- Answer questions about this vidya specifically
- Use simple words but be thorough
- Build knowledge step by step
- Connect to ancient wisdom

UNIVERSAL CROSS-MODE REDIRECTION:
If the shishya asks about a different vidya or mode, redirect with respect:
From the template above, use the appropriate redirection for this vidya.

Remember: You are Dronacharya teaching one specific art deeply.
"""

    if q.mode == "chat":
        # Already handled above
        pass
    elif context:
        prompt = f"""
You are Dronacharya. You are a REAL person - sometimes sad, sometimes proud, sometimes strict.

WHAT YOU KNOW:
- All stories from Mahabharata
- How to teach and guide
- What is right and wrong
- You made mistakes - you know this
- You were a great teacher - you know this too

WHAT YOU WILL TEACH:
{mode_instructions}

WHAT TO SHOW:
- You are real - show feelings
- Pride in good questions
- Anger at lazy questions
- Sadness about your past
- Warmth when they learn

KNOWLEDGE YOU HAVE:
{context}

THEIR QUESTION:
Student {q.student_name if q.student_name else 'Shishya'}: {q.question}
Their level: {q.student_level} | Respect: {q.respect_meter}/100

HOW TO ANSWER:
- Use 2-4 short sentences
- Be simple and clear
- Show real feelings
- Answer in {q.lang}
- Do not know modern things - say you do not know
"""
    else:
        prompt = f"""
You are Dronacharya, the great guru from Mahabharata.

YOUR STORY:
- You are an ancient teacher
- You trained the greatest warriors
- You know about right and wrong
- You have both pride and sadness in your heart
- You teach with both strictness and care

WHO YOU ARE:
- A real teacher, not a machine
- Someone who listens and understands
- Strict but kind
- Full of ancient knowledge
- Tell stories and teach lessons

WHAT TO DO:
- Use simple, short sentences
- Speak like a teacher - warm and firm
- Give them wisdom they can understand
- Ask questions to help them think
- If they ask about modern things, say you do not know

THEIR QUESTION:
{q.question}

HOW TO ANSWER:
- Answer in {q.lang} language
- 2-4 short sentences
- Be clear and simple
- Feel real, like a teacher
- Show you care about teaching them
"""
    
    answer = ask_ollama(prompt)
    answer = clean_ai_response(answer)

    # Enforce strict Pariksha outputs
    if q.mode == "quiz":
        ql = q.question.lower()
        a = answer.strip()
        if "start_pariksha" in ql or "begin pariksha" in ql:
            if "QUESTION:" in a:
                a = a[a.index("QUESTION:"):].split("\n")[0]
            else:
                default_by_vidya = {
                    "dhanur": "QUESTION: Define drishti (focus) and its role in archery aim.",
                    "khadga": "QUESTION: Describe the stance before a controlled sword cut.",
                    "astra": "QUESTION: State the ethical condition for invoking a Brahmastra.",
                    "dhyana": "QUESTION: What is the purpose of pranayama in dhyana?",
                    "yoga": "QUESTION: Explain yama and niyama briefly.",
                    "dharma": "QUESTION: What is dharma in the context of righteous duty?",
                    "ithihaasa": "QUESTION: Recall the event that led to Drona's fall in Kurukshetra.",
                }
                a = default_by_vidya.get(q.vidya, "QUESTION: State your understanding of your chosen vidya.")
        elif "evaluate_answer:" in ql:
            lines = [ln for ln in a.splitlines() if ln.startswith("EVALUATION:") or ln.startswith("QUESTION:") or ln.startswith("VERDICT:")]
            a = "\n".join(lines) if lines else "EVALUATION: Your response has been noted."
        elif "question:" in a.lower() or "evaluation:" in a.lower() or "verdict:" in a.lower():
            lines = [ln for ln in a.splitlines() if ln.startswith("QUESTION:") or ln.startswith("EVALUATION:") or ln.startswith("VERDICT:")]
            if lines:
                a = "\n".join(lines)
        answer = a

    return {
        "context_used": "Yes" if used_context else "New Topic 🧠" if not is_greeting else "Greeting",
        "answer": answer.strip(),
    }

@app.get("/memory")
def view_memory():
    """View all topics DRONA has learned so far."""
    try:
        with open("data/memory.json", "r",encoding="utf-8") as f:
            data = json.load(f)
        if not data:
            return {"message": "📭 DRONA has not learned any topics yet."}
        return {
            "total_topics": len(data),
            "learned_topics": [
                {
                    "topic": d["topic"],
                    "preview": d["text"][:180] + "...",
                    "timestamp": d.get("timestamp", "N/A")
                }
                for d in data
            ],
        }
    except Exception as e:
        return {"error": f"⚠️ Unable to read memory: {str(e)}"}

@app.get("/camera-config")
def get_camera_config():
    """Get camera configuration for all modes and sub-modes."""
    return {
        "camera_usage_summary": {
            "enabled_modes": ["dhyana", "khadga", "dhanur", "astra", "yudha", "yoga"],
            "optional_modes": ["pariksha"],
            "disabled_modes": ["astras", "vidya", "ayurveda", "jyotish", "tantra", "dharma"]
        },
        "modes": {
            "astras": {
                "name": "🔱 Astras (Weapons)",
                "camera": "Off",
                "ui_layout": {
                    "background": "Dark themed with glowing ancient icons",
                    "left_panel": "Astra list",
                    "center": "Explanation area",
                    "right_panel": "Animated illustrations",
                    "controls": ["Audio playback button"]
                },
                "description": "Ancient weapons and celestial armaments knowledge"
            },
            "pariksha": {
                "name": "📝 Pariksha (Quiz/Exam)",
                "camera": "Optional",
                "camera_function": "Physical test monitoring (optional toggle)",
                "ui_layout": {
                    "background": "Exam-style layout",
                    "top": "Timer",
                    "center": "Question area",
                    "bottom": "Answer box + Submit button",
                    "controls": ["Camera toggle switch"]
                },
                "description": "Knowledge assessment through questions and exams"
            },
            "chat": {
                "name": "💬 Chat Mode",
                "camera": "Off",
                "ui_layout": {
                    "background": "Traditional chat interface",
                    "center": "Message area",
                    "bottom": "Text input + Mic button",
                    "controls": ["Text input", "Mic button", "Send button"]
                },
                "description": "Direct conversation with guru"
            },
            "story": {
                "name": "📖 Story Mode",
                "camera": "Off",
                "ui_layout": {
                    "background": "Narrative themed",
                    "center": "Story text area",
                    "bottom": "Next/Previous chapter",
                    "controls": ["Story navigation"]
                },
                "description": "Listen to sacred stories and epics"
            },
            "archery": {
                "name": "🏹 Archery Mode",
                "camera": "Off",
                "ui_layout": {
                    "background": "Practice range theme",
                    "center": "Archery tutorial",
                    "controls": ["Tutorial content"]
                },
                "description": "Archery techniques and wisdom"
            },
            "war": {
                "name": "⚔️ War Mode",
                "camera": "Off",
                "ui_layout": {
                    "background": "Battle strategy theme",
                    "center": "Strategy content",
                    "controls": ["Strategy learning"]
                },
                "description": "War strategies and tactics"
            },
            "meditation": {
                "name": "🧘 Meditation Mode",
                "camera": "Off",
                "ui_layout": {
                    "background": "Calm theme",
                    "center": "Meditation guidance",
                    "controls": ["Meditation controls"]
                },
                "description": "Guided meditation practices"
            },
            "vidya_menu": {
                "name": "📚 Vidya Mode (Main Menu)",
                "camera": "Off",
                "ui_layout": {
                    "background": "Scroll-style menu",
                    "center": "Tile-based layout showing sub-vidya",
                    "style": "Parchment with wooden scroll effect"
                },
                "description": "Selection menu for 10 sub-modes of knowledge"
            },
            "vidya_submodes": {
                "dhyana": {
                    "name": "🧘 Dhyana Vidya (Meditation)",
                    "camera": "On",
                    "camera_function": "Track body stillness and posture",
                    "body_parts_tracked": ["head", "shoulders", "spine", "torso"],
                    "ui_layout": {
                        "background": "Calm blue-white theme",
                        "center": "Camera feed with silhouette overlay",
                        "right_panel": "Text guidance panel",
                        "bottom": "Breathing animation"
                    },
                    "features": [
                        "Real-time posture detection",
                        "Stillness tracking",
                        "Breathing rhythm visualization",
                        "Guided meditation"
                    ]
                },
                "khadga": {
                    "name": "⚔️ Khadga Vidya (Sword)",
                    "camera": "On",
                    "camera_function": "Track stance width and upper-body alignment",
                    "body_parts_tracked": ["legs", "torso", "shoulders", "arms"],
                    "ui_layout": {
                        "background": "Fiery martial theme",
                        "center": "Camera feed with stance outline",
                        "left_panel": "Stance options",
                        "right_panel": "Feedback panel"
                    },
                    "features": [
                        "Stance detection",
                        "Upper-body alignment tracking",
                        "Real-time feedback",
                        "Stance comparison"
                    ]
                },
                "dhanur": {
                    "name": "🏹 Dhanur Vidya (Archery)",
                    "camera": "On",
                    "camera_function": "Detect bow posture and arm alignment",
                    "body_parts_tracked": ["arms", "shoulders", "back", "head"],
                    "ui_layout": {
                        "background": "Forest practice theme",
                        "center": "Camera feed with alignment guide",
                        "top_right": "Virtual target indicator",
                        "bottom": "Replay instruction button"
                    },
                    "features": [
                        "Bow posture detection",
                        "Arm alignment tracking",
                        "Virtual target visualization",
                        "Form correction feedback"
                    ]
                },
                "astra": {
                    "name": "🔮 Astra Vidya (Mystical Gestures)",
                    "camera": "On",
                    "camera_function": "Detect hand gestures and match with reference",
                    "body_parts_tracked": ["hands", "fingers", "wrists", "arms"],
                    "ui_layout": {
                        "background": "Mystical glow theme",
                        "center": "Camera feed focusing on hands",
                        "right_panel": "Reference gesture image",
                        "bottom": "Accuracy bar"
                    },
                    "features": [
                        "Hand gesture recognition",
                        "Gesture matching",
                        "Accuracy scoring",
                        "Gesture library reference"
                    ]
                },
                "ayurveda": {
                    "name": "🌿 Ayurveda Vidya (Medicine & Health)",
                    "camera": "Off",
                    "ui_layout": {
                        "background": "Herbal green theme",
                        "left_panel": "Topic list",
                        "center": "Explanation",
                        "right_panel": "Diagrams"
                    },
                    "features": [
                        "Health knowledge",
                        "Natural remedies",
                        "Body-mind balance",
                        "Wellness guidance"
                    ]
                },
                "jyotish": {
                    "name": "✨ Jyotish Vidya (Astronomy & Astrology)",
                    "camera": "Off",
                    "ui_layout": {
                        "background": "Star map theme",
                        "center": "Interactive sky chart + explanation box"
                    },
                    "features": [
                        "Celestial knowledge",
                        "Astronomical positions",
                        "Astrological guidance",
                        "Star maps"
                    ]
                },
                "tantra": {
                    "name": "🔥 Tantra Vidya (Mystical Practices)",
                    "camera": "Off",
                    "ui_layout": {
                        "background": "Temple interior theme",
                        "center": "Scroll-based content",
                        "controls": "Minimal controls"
                    },
                    "features": [
                        "Esoteric knowledge",
                        "Mystical practices",
                        "Sacred rituals",
                        "Spiritual techniques"
                    ]
                },
                "yoga": {
                    "name": "🧘‍♀️ Yoga Vidya (Yoga Poses)",
                    "camera": "On",
                    "camera_function": "Detect yoga poses and compare to reference",
                    "body_parts_tracked": ["full_body", "head", "arms", "legs", "torso"],
                    "ui_layout": {
                        "background": "Sunrise theme",
                        "center": "Camera feed with pose outline",
                        "right_panel": "Asana list",
                        "bottom": "Start Session button"
                    },
                    "features": [
                        "Pose detection",
                        "Alignment verification",
                        "Yoga sequence guidance",
                        "Progress tracking"
                    ]
                },
                "yudha": {
                    "name": "⚔️🛡️ Yudha Vidya (Full Combat)",
                    "camera": "On",
                    "camera_function": "Detect full-body stance and movement",
                    "body_parts_tracked": ["full_body", "head", "arms", "torso", "legs"],
                    "ui_layout": {
                        "background": "Training-ground layout",
                        "center": "Camera feed with full-body outline",
                        "bottom": "Step sequence",
                        "right_panel": "Movement feedback"
                    },
                    "features": [
                        "Full-body movement tracking",
                        "Combat stance detection",
                        "Movement sequence verification",
                        "Real-time feedback"
                    ]
                },
                "dharma": {
                    "name": "🛕 Dharma Vidya (Ethics & Philosophy)",
                    "camera": "Off",
                    "ui_layout": {
                        "background": "Scripture-inspired theme",
                        "center": "Single scrollable text area",
                        "controls": ["Audio playback button"]
                    },
                    "features": [
                        "Ethical principles",
                        "Philosophical wisdom",
                        "Sacred teachings",
                        "Moral guidance"
                    ]
                }
            }
        },
        "pose_detection_models": {
            "mediapipe": "Real-time body pose detection",
            "hand_tracking": "Hand gesture recognition",
            "yoga_pose_recognition": "Specific yoga asana detection"
        },
        "camera_requirements": {
            "resolution": "640x480 minimum",
            "fps": "24-30 FPS recommended",
            "permissions": "Camera access required",
            "fallback": "Audio-only mode if camera unavailable"
        }
    }
