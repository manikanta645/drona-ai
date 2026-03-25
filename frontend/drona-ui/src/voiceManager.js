/**
 * Voice/TTS Utility Module
 * Handles text-to-speech using browser's Web Speech API
 * Supports 9+ Indian languages for multilingual teaching
 */

class VoiceManager {
  constructor() {
    // Check if browser supports Web Speech API
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;
    const speechSynthesis = window.speechSynthesis || window.webkitSpeechSynthesis;
    
    this.supported = !!(SpeechSynthesisUtterance && speechSynthesis);
    this.synth = speechSynthesis;
    this.currentUtterance = null;
    this.isPlaying = false;
    
    if (this.supported) {
      console.log('🔊 [VOICE] Web Speech API available - TTS enabled');
      this.loadVoices();
    } else {
      console.warn('⚠️ [VOICE] Web Speech API not supported in this browser');
    }
    
    // Language code to browser voice name mapping
    this.languageVoiceMap = {
      'en': 'en-US',
      'hi': 'hi-IN',    // Hindi
      'ta': 'ta-IN',    // Tamil
      'te': 'te-IN',    // Telugu
      'bn': 'bn-IN',    // Bengali
      'kn': 'kn-IN',    // Kannada
      'ml': 'ml-IN',    // Malayalam
      'mr': 'mr-IN',    // Marathi
      'gu': 'gu-IN',    // Gujarati
      'pa': 'pa-IN',    // Punjabi (Punjabi)
    };
  }
  
  loadVoices() {
    if (!this.supported) return;
    
    // Load voices when they're available
    if ('onvoiceschanged' in this.synth) {
      this.synth.onvoiceschanged = () => {
        const voices = this.synth.getVoices();
        console.log(`🔊 [VOICE] ${voices.length} voices available`);
      };
    }
  }
  
  /**
   * Speak text in specified language
   * @param {string} text - Text to speak
   * @param {string} language - Language code (en, hi, ta, te, bn, kn, ml, mr, gu, pa)
   * @param {number} rate - Speech rate (0.5-2.0), default 0.8
   * @param {number} pitch - Pitch level (0-2), default 1.0
   */
  speak(text, language = 'en', rate = 0.8, pitch = 1.0) {
    if (!this.supported) {
      console.warn('⚠️ [VOICE] Web Speech API not supported');
      return false;
    }
    
    // Stop current speech if any
    this.stop();
    
    try {
      const utterance = new (window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance)(text);
      
      // Set language
      const lang = this.languageVoiceMap[language] || 'en-US';
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1.0;
      
      // Find suitable voice for the language
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(voice => voice.lang.startsWith(lang.split('-')[0]));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Set up event handlers
      utterance.onstart = () => {
        this.isPlaying = true;
        console.log(`🔊 [VOICE] Speaking in ${language}...`);
      };
      
      utterance.onend = () => {
        this.isPlaying = false;
        console.log('🔊 [VOICE] Speech finished');
      };
      
      utterance.onerror = (event) => {
        this.isPlaying = false;
        console.error(`❌ [VOICE] Error: ${event.error}`);
      };
      
      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (error) {
      console.error('❌ [VOICE] Error initiating speech:', error);
      return false;
    }
  }
  
  /**
   * Stop current speech
   */
  stop() {
    if (this.supported && this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      console.log('🔊 [VOICE] Speech stopped');
    }
  }
  
  /**
   * Check if voice is currently playing
   */
  isVoicePlaying() {
    return this.isPlaying || (this.synth && this.synth.speaking);
  }
  
  /**
   * Get available voices based on language
   */
  getAvailableVoices(language) {
    if (!this.supported) return [];
    const voices = this.synth.getVoices();
    const lang = this.languageVoiceMap[language] || 'en-US';
    return voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
  }
}

// Create global instance
export const voiceManager = new VoiceManager();

// Export for use in components
export default voiceManager;
