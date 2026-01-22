from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_engine import RAGEngine
from transformers import pipeline
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
from deep_translator import GoogleTranslator

# -------------------------------------------------------
# DRONA Multilingual Backend – Enhanced with Translator Fallback
# -------------------------------------------------------

app = FastAPI(title="DRONA – Digital Repository Of National Arts (Multilingual Enhanced)")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Engine
rag = RAGEngine()

# Universal model: Any → English
translator_to_en = pipeline("translation", model="Helsinki-NLP/opus-mt-mul-en")

# English → Indian languages (Hugging Face)
translation_models = {
    "hi": "Helsinki-NLP/opus-mt-en-hi",  # Hindi
    "ta": "Helsinki-NLP/opus-mt-en-ta",  # Tamil
    "bn": "Helsinki-NLP/opus-mt-en-bn",  # Bengali
    "ml": "Helsinki-NLP/opus-mt-en-ml",  # Malayalam
    "kn": "Helsinki-NLP/opus-mt-en-kn",  # Kannada
    "gu": "Helsinki-NLP/opus-mt-en-gu",  # Gujarati
    "mr": "Helsinki-NLP/opus-mt-en-mr",  # Marathi
    "pa": "Helsinki-NLP/opus-mt-en-pa",  # Punjabi
    # Telugu will use GoogleTranslator fallback
}

supported_langs = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "ml": "Malayalam",
    "kn": "Kannada",
    "gu": "Gujarati",
    "mr": "Marathi",
    "pa": "Punjabi"
}


class Query(BaseModel):
    question: str
    lang: str = "en"  # default English


@app.get("/")
def root():
    return {
        "message": "🪔 Welcome to DRONA – Multilingual Enhanced Edition with Indian Script Support!",
        "languages_supported": supported_langs
    }


@app.post("/ask")
def ask_drona(q: Query):
    lang = q.lang.lower()

    # Step 1: Translate question → English
    translated_question = q.question
    if lang != "en":
        translated_question = translator_to_en(q.question)[0]["translation_text"]

    # Step 2: Retrieve cultural info
    topic, text = rag.search(translated_question)
    base_answer = (
        f"Namaste 🙏\n\nAccording to Indian culture:\n\n{text}\n\n"
        f"🪔 (Topic: {topic})"
    )

    # Step 3: Translate answer → target language
    translated_answer = base_answer
    if lang != "en":
        try:
            if lang in translation_models:
                # Use Hugging Face model if available
                model_name = translation_models[lang]
                translator_local = pipeline("translation", model=model_name)
                translated_answer = translator_local(base_answer)[0]["translation_text"]
            else:
                # Use Google Translator for languages like Telugu
                translated_answer = GoogleTranslator(source="en", target=lang).translate(base_answer)
        except Exception:
            # Always fallback to Google Translator
            translated_answer = GoogleTranslator(source="en", target=lang).translate(base_answer)

    # Step 4: Convert Hindi output to Devanagari script
    if lang == "hi":
        translated_answer = transliterate(translated_answer, sanscript.ITRANS, sanscript.DEVANAGARI)

    return {
        "language": supported_langs.get(lang, "English"),
        "answer": translated_answer
    }
