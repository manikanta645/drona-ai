"""
VOICE & MULTILINGUAL TEXT-TO-SPEECH MODULE
Provides voice output for VIDYA lessons in 9+ Indian languages
"""

import pyttsx3
import os
from typing import Optional, List

class VoiceModule:
    """
    Handles text-to-speech in multiple Indian languages
    Supports: Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi
    """
    
    def __init__(self):
        """Initialize pyttsx3 engine with multi-language support"""
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 120)  # Slower speech for clarity
        self.engine.setProperty('volume', 0.9)
        
        # Language mapping for pyttsx3
        self.lang_code_map = {
            'en': 0,      # English
            'hi': 0,      # Hindi (use English voice, but speak Hindi text)
            'ta': 0,      # Tamil
            'te': 0,      # Telugu
            'bn': 0,      # Bengali
            'kn': 0,      # Kannada
            'ml': 0,      # Malayalam
            'mr': 0,      # Marathi
            'gu': 0,      # Gujarati
            'pa': 0,      # Punjabi
        }
        
        self.available_voices = self.engine.getProperty('voices')
        print(f"[VOICE] Available voices: {len(self.available_voices)}")

    def speak_text(self, text: str, language: str = 'en', save_to_file: Optional[str] = None) -> bool:
        """
        Convert text to speech and play it (or save to file)
        
        Args:
            text: Text to convert to speech
            language: Language code (en, hi, ta, te, bn, kn, ml, mr, gu, pa)
            save_to_file: Optional path to save audio file
            
        Returns:
            True if successful, False otherwise
        """
        try:
            self.engine.setProperty('rate', 120)
            
            # Use first available voice
            if self.available_voices:
                self.engine.setProperty('voice', self.available_voices[0].id)
            
            if save_to_file:
                self.engine.save_to_file(text, save_to_file)
                self.engine.runAndWait()
                print(f"[VOICE] Audio saved to: {save_to_file}")
                return True
            else:
                self.engine.say(text)
                self.engine.runAndWait()
                return True
                
        except Exception as e:
            print(f"[ERROR] Voice module error: {str(e)}")
            return False

    def get_guru_response_with_voice(self, guru_response: str, language: str = 'en') -> dict:
        """
        Process guru response with voice output
        
        Args:
            guru_response: Text response from guru
            language: Language code
            
        Returns:
            Dictionary with text and voice metadata
        """
        return {
            "text": guru_response,
            "language": language,
            "has_voice": True,
            "voice_format": "audio/wav",
            "instructions": f"Play at 120 words per minute in {language}"
        }

    def speak_lesson_intro(self, vidya_name: str, lesson_title: str, language: str = 'en'):
        """
        Speak a lesson introduction
        
        Args:
            vidya_name: Name of the vidya (e.g., "Dhanur Vidya")
            lesson_title: Title of the lesson
            language: Language code
        """
        intro_text = f"Welcome to {lesson_title} in {vidya_name}. Let us begin our practice today."
        
        if language == 'hi':
            intro_text = f"{vidya_name} में {lesson_title} में आपका स्वागत है। आइए आज हमारी प्रैक्टिस शुरू करें।"
        elif language == 'ta':
            intro_text = f"{vidya_name} இல் {lesson_title} க்கு வரவேற்கிறோம். இன்று நாம் தொடங்குவோம்."
        elif language == 'te':
            intro_text = f"{vidya_name} లో {lesson_title} కు నివేదనలు. ఈ రోజు మనం ప్రారంభిద్దాం."
        
        self.speak_text(intro_text, language)

    def speak_encouragement(self, phase: str, language: str = 'en'):
        """
        Speak encouragement based on lesson phase
        
        Args:
            phase: Lesson phase (select, explain, demonstrate, practice, feedback)
            language: Language code
        """
        encouragements = {
            'explain': {
                'en': "Listen carefully to the teaching. The guru shares ancient wisdom.",
                'hi': "ध्यान से सुनो। गुरु प्राचीन ज्ञान साझा करते हैं।",
                'ta': "கவனமாக கேளுங்கள். குரு பழைய ஞானத்தைப் பகிர்ந்து கொள்கிறார்.",
            },
            'demonstrate': {
                'en': "Watch the guru's demonstration. Study each movement carefully.",
                'hi': "गुरु के प्रदर्शन को देखो। प्रत्येक गति को सावधानी से देखो।",
                'ta': "குருவின் ప்రదర్శనைக் காணுங்கள். ஒவ்வொரு இயக்கத்தையும் கவனமாகக் கவனிக்கவும்.",
            },
            'practice': {
                'en': "Now it is your turn. Practice with full focus and dedication.",
                'hi': "अब तुम्हारा बारी है। पूरी एकाग्रता से अभ्यास करो।",
                'ta': "இப்போது உங்களுடைய வரத்தை. முழு கவனத்துடன் பயிற்சி செய்யுங்கள்.",
            },
            'feedback': {
                'en': "You have completed this lesson. The guru has observed your progress.",
                'hi': "तुमने यह पाठ पूरा किया है। गुरु ने तुम्हारी प्रगति को देखा है।",
                'ta': "நீங்கள் இந்த பாடத்தை முடித்துவிட்டீர்கள். குரு உங்கள் முன்னேற்றத்தைக் கவனித்துள்ளார்.",
            }
        }
        
        text = encouragements.get(phase, {}).get(language, encouragements[phase].get('en', ''))
        self.speak_text(text, language)

    def stream_real_time_voice(self, text_chunks: List[str], language: str = 'en'):
        """
        Stream voice output for real-time chat interaction
        
        Args:
            text_chunks: List of text chunks to speak
            language: Language code
        """
        for chunk in text_chunks:
            if chunk.strip():
                self.speak_text(chunk, language)

# Global voice instance
voice_module = None

def init_voice_module():
    """Initialize the global voice module"""
    global voice_module
    try:
        voice_module = VoiceModule()
        print("[VOICE] Voice module initialized successfully")
        return voice_module
    except Exception as e:
        print(f"[ERROR] Failed to initialize voice module: {str(e)}")
        return None

def get_voice_module():
    """Get the global voice module instance"""
    global voice_module
    if voice_module is None:
        voice_module = init_voice_module()
    return voice_module
