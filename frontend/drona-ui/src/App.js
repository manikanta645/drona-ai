import React, { useState, useEffect, useRef } from "react";
import { franc } from "franc-min";
import Lottie from "lottie-react";
import "./App.css";
import guruAnimation from "./assets/guru.json";
import bgMusic from "./assets/meditation_music.mp3";
import studentMemory from "./studentMemory";
import IthihasaMode from "./components/IthihasaMode";
import DhyanaMode from "./components/DhyanaMode";
import KhadgaMode from "./components/KhadgaMode";
import DhanurMode from "./components/DhanurMode";
import DharmaMode from "./components/DharmaMode";
import YudhaMode from "./components/YudhaMode";
import ShastraMode from "./components/ShastraMode";
import GadaMode from "./components/GadaMode";
import VidyaHub from "./components/VidyaHub";

const API_URL = "http://127.0.0.1:8000/ask";

function App() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [cameraError, setCameraError] = useState("");
  
  // Multi-Student System
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [allStudents, setAllStudents] = useState(studentMemory.getAllStudents());
  const [studentName, setStudentName] = useState(studentMemory.getCurrentStudent() || '');
  const [isInitiated, setIsInitiated] = useState(false);
  const [showInitiation, setShowInitiation] = useState(!studentName);
  
  // Dhyana Vidya - New Calm Design
  // eslint-disable-next-line no-unused-vars
  const [showAura, setShowAura] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [focusDepth, setFocusDepth] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [motionStability, setMotionStability] = useState(3);
  // eslint-disable-next-line no-unused-vars
  const [showVignette, setShowVignette] = useState(false);
  
  // Proactive Guru System
  const [currentMode, setCurrentMode] = useState('chat'); // chat, archery, war, meditation, story, weapons, vidya
  const [currentVidya, setCurrentVidya] = useState(''); // dhyana, khadga, dhanur, gada, astra, etc.
  const [showVidyaSelector, setShowVidyaSelector] = useState(false); // Toggle vidya submodes visibility
  // eslint-disable-next-line no-unused-vars
  const [greetingShown, setGreetingShown] = useState(false); // Track if greeting has been shown once
  
  // Vidya Learning/Testing System
  const [vidyaMode, setVidyaMode] = useState(null); // 'learn' or 'test'
  const [showVidyaSelection, setShowVidyaSelection] = useState(false); // Show learn/test selection modal
  const [vidyaTestScore, setVidyaTestScore] = useState(0); // Track test score
  const [vidyaTestAnswers, setVidyaTestAnswers] = useState([]); // Store test answers
  // eslint-disable-next-line no-unused-vars
  const [vidyaTestActive, setVidyaTestActive] = useState(false); // Is test in progress
  // eslint-disable-next-line no-unused-vars
  const [lessonContent, setLessonContent] = useState(''); // Current lesson content
  
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const chatEndRef = useRef(null);
  const vidyaBtnRef = useRef(null);
  const guruVoiceCacheRef = useRef({});
  const lastGuruVoiceNameRef = useRef(null);
  const guruVoiceDebugOnceRef = useRef(false);
  // eslint-disable-next-line no-unused-vars
  const [vidyaFlyoutTop, setVidyaFlyoutTop] = useState(0);
  const [currentAstra, setCurrentAstra] = useState('Brahmastra');
  const [astraSegments, setAstraSegments] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showAstraLock, setShowAstraLock] = useState(false);
  const [bookmarkedAstras, setBookmarkedAstras] = useState([]);
  const [activeAstraTab, setActiveAstraTab] = useState('element');
  const [astraSearchQuery, setAstraSearchQuery] = useState(''); // Search query for astras
  const [astraList] = useState([
    { name: 'Brahmastra', element: 'Universal', icon: '🌟', color: 'gold' },
    { name: 'Agneyastra', element: 'Fire', icon: '🔥', color: 'orange' },
    { name: 'Varunastra', element: 'Water', icon: '💧', color: 'cyan' },
    { name: 'Vayavyastra', element: 'Wind', icon: '💨', color: 'lightblue' },
    { name: 'Narayanastra', element: 'Celestial', icon: '✨', color: 'violet' },
    { name: 'Pashupatastra', element: 'Divine', icon: '🔱', color: 'purple' },
    { name: 'Indrastra', element: 'Lightning', icon: '⚡', color: 'yellow' },
    { name: 'Soma Astra', element: 'Lunar', icon: '🌙', color: 'silver' },
  ]);
  const [storyHistory, setStoryHistory] = useState([
    {
      role: 'guru',
      text: "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?",
    },
  ]);

  // ✨ ITHIHAASA STORY CHAPTER TRACKING
  // eslint-disable-next-line no-unused-vars
  const [currentStoryId, setCurrentStoryId] = useState(''); // e.g., "mahabharata", "ramayana"
  // eslint-disable-next-line no-unused-vars
  const [currentChapter, setCurrentChapter] = useState(0); // Current chapter number (0-based)
  // eslint-disable-next-line no-unused-vars
  const [totalChapters, setTotalChapters] = useState(0); // Total chapters in story
  // eslint-disable-next-line no-unused-vars
  const [storyState, setStoryState] = useState({}); // Additional story metadata

  const langMap = {
    eng: "en",
    hin: "hi",
    tam: "ta",
    tel: "te",
    ben: "bn",
    mal: "ml",
    kan: "kn",
    guj: "gu",
    mar: "mr",
    pan: "pa",
  };

  // Camera Configuration - Define which modes have camera enabled
  const CAMERA_CONFIG = {
    camera_enabled: ['dhyana', 'khadga', 'dhanur', 'astra', 'yudha', 'yoga'],
    camera_optional: [],
    camera_disabled: ['astras', 'vidya', 'chat', 'story', 'archery', 'war', 'meditation', 'ayurveda', 'jyotish', 'tantra', 'dharma']
  };

  // Camera configuration defined above - helper functions reserved for future use

  // Detect Indian language
  const detectLanguage = (text) => {
    const code = franc(text);
    if (/[ऀ-ॿ]/.test(text)) return "hi";
    if (/[అ-ఽ౿]/.test(text)) return "te";
    if (/[அ-ஶ]/.test(text)) return "ta";
    if (/[ಅ-೿]/.test(text)) return "kn";
    if (/[ം-ൿ]/.test(text)) return "ml";
    if (/[અ-૱]/.test(text)) return "gu";
    if (/[প-ৡ]/.test(text)) return "bn";
    if (/[ਮ-ੴ]/.test(text)) return "pa";
    return langMap[code] || "en";
  };

  // Student Initiation Handler
  // Handle selecting an existing student
  const handleSelectStudent = (name) => {
    const studentData = studentMemory.getStudentData(name);
    if (!studentData) return;

    // Set student data
    setStudentName(name);
    setIsInitiated(studentData.initiated || false);
    setChatHistory(studentData.chatHistory || []);
    
    // Update current student
    studentMemory.setCurrentStudent(name);
    setShowStudentSelector(false);
    setShowInitiation(!studentData.initiated);
  };

  // Handle creating a new student
  const handleCreateStudent = (name) => {
    if (!name.trim()) return;
    
    // Create new student
    const created = studentMemory.createStudent(name);
    if (!created) {
      alert('Student already exists or invalid name!');
      return;
    }

    // Save to backend
    fetch('http://127.0.0.1:8000/save_student', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_name: name,
        initiated: false
      })
    }).catch(err => console.log('Backend save failed:', err));

    // Select the new student
    setAllStudents(studentMemory.getAllStudents());
    handleSelectStudent(name);
  };

  // Handle student initiation (entering the ashram)
  const handleInitiation = (name) => {
    if (!name.trim()) return;

    // Update student data
    studentMemory.updateStudentData(name, {
      initiated: true,
      chatHistory: []
    });

    setStudentName(name);
    setIsInitiated(true);
    setShowInitiation(false);
    studentMemory.setCurrentStudent(name);
    
    // Start with empty chat - guru only speaks when student asks
    setChatHistory([]);
    studentMemory.updateStudentData(name, { chatHistory: [] });
  };

  // Handle switching to student selector
  const handleSwitchStudent = () => {
    setShowStudentSelector(true);
  };

  // Handle deleting a student
  const handleDeleteStudent = (name) => {
    if (window.confirm(`Are you sure you want to delete ${name}'s profile? This cannot be undone.`)) {
      // Delete from backend
      fetch(`http://127.0.0.1:8000/delete_student/${name}`, {
        method: 'DELETE'
      }).catch(err => console.log('Backend delete failed:', err));
      
      // Delete from localStorage
      studentMemory.deleteStudent(name);
      setAllStudents(studentMemory.getAllStudents());
      
      // If deleting current student, switch to selector
      if (studentName === name) {
        setShowStudentSelector(true);
        setStudentName('');
        setIsInitiated(false);
        setChatHistory([]);
      }
    }
  };

  // Handle deleting only the chat history (clears UI but keeps backend files)
  const handleDeleteChat = () => {
    if (window.confirm(`Delete chat history from UI? Backend files will be preserved for system records.`)) {
      // Clear from UI
      setChatHistory([]);
      
      // Clear from localStorage
      if (studentName) {
        studentMemory.updateStudentData(studentName, {
          chatHistory: []
        });
      }
    }
  };

  // Initialize app - load student if available, show selector otherwise
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // 🎵 Ensure voices are loaded for text-to-speech
    let voicesUnsubscribe = null;
    if (window.speechSynthesis) {
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
      voicesUnsubscribe = () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    }

    // Handle student initialization
    const currentStudent = studentMemory.getCurrentStudent();
    
    if (currentStudent) {
      // Load existing student
      handleSelectStudent(currentStudent);
      
      // Send welcome message
      setTimeout(() => {
        const welcomeMessage = {
          type: 'guru',
          text: `Welcome back, ${currentStudent}. Your guru has been waiting for you. What wisdom do you seek today?`,
          timestamp: new Date().toLocaleTimeString()
        };
        setChatHistory(prev => {
          if (prev.length === 0) {
            speak(welcomeMessage.text, 'en');
            return [welcomeMessage];
          }
          return prev;
        });
      }, 1000);
    } else {
      // No student active - show selector
      setShowStudentSelector(true);
      setShowInitiation(false);
    }

    // Cleanup function for voice listener
    return () => {
      if (voicesUnsubscribe) {
        voicesUnsubscribe();
      }
    };
  }, []);


  // Astra Mode Button Handlers
  const toggleBookmarkAstra = () => {
    if (bookmarkedAstras.includes(currentAstra)) {
      setBookmarkedAstras(bookmarkedAstras.filter(a => a !== currentAstra));
    } else {
      setBookmarkedAstras([...bookmarkedAstras, currentAstra]);
    }
  };

  const navigateToPreviousAstra = () => {
    const currentIndex = astraList.findIndex(a => a.name === currentAstra);
    if (currentIndex > 0) {
      const prevAstra = astraList[currentIndex - 1];
      setCurrentAstra(prevAstra.name);
      askDrona(`Tell me about ${prevAstra.name}. What are its powers and characteristics?`);
    }
  };

  const navigateToNextAstra = () => {
    const currentIndex = astraList.findIndex(a => a.name === currentAstra);
    if (currentIndex < astraList.length - 1) {
      const nextAstra = astraList[currentIndex + 1];
      setCurrentAstra(nextAstra.name);
      askDrona(`Tell me about ${nextAstra.name}. What are its powers and characteristics?`);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const sendDailyWisdom = () => {
    // DISABLED: Do not send automatic unsolicited wisdom messages
    // Guru only speaks when student asks a question
    return;
  };

  // Get theme class based on mode and vidya
  const getThemeClass = () => {
    if (currentMode === 'weapons') return 'astras-theme';

    if (currentMode === 'vidya') {
      switch(currentVidya) {
        case 'dhyana': return 'dhyana-theme';
        case 'khadga': return 'khadga-theme';
        case 'dhanur': return 'dhanur-theme';
        case 'astra': return 'astra-theme';
        case 'ayurveda': return 'ayurveda-theme';
        case 'jyotish': return 'jyotish-theme';
        case 'tantra': return 'tantra-theme';
        case 'yoga': return 'yoga-theme';
        case 'yudha': return 'yudha-theme';
        case 'dharma': return 'dharma-theme';
        default: return 'vidya-theme';
      }
    }
    return '';
  };

  // eslint-disable-next-line no-unused-vars
  const sendInitialGuruMessage = () => {
    // DISABLED: Do not send automatic unsolicited messages
    // Guru only speaks when student asks a question
    return;
  };

  // 🎙️ Clean text for TTS - remove emojis, special chars, brackets, numbers
  const cleanTextForTTS = (text, lang) => {
    if (!text) return "";
    // ⚡ OPTIMIZED: Minimal regex operations for speed
    let cleaned = text
      .replace(/[\p{Emoji}]/gu, '')           // Remove emojis
      .replace(/\[.*?\]/g, '')                // Remove [brackets]
      .replace(/\(.*?\)/g, '')                // Remove (parentheses)
      .replace(/\s+/g, ' ')                   // Collapse spaces
      .trim();
    return cleaned;
  };

  // 🎙️ Voice gender detection (STRICT)
  // We MUST not pick female voices when user wants male.
  const isFemaleVoice = (voiceName) => {
    if (!voiceName) return false;
    const name = voiceName.toLowerCase();
    const femaleIndicators = [
      "female", "zira", "hazel", "susan", "linda", "heather", "priya",
      "neha", "priyanka", "sara", "helen", "catherine", "kate", "anna",
      "emily", "lisa", "michelle", "jane", "monica", "karen", "samantha",
      "victoria", "sarah", "lucy", "woman", "women", "girl", "lady",
      "narrator female",
      // Common Indian-English female voice name on Windows
      "heera",
      // Common Microsoft India female voices
      "neerja"
    ];
    return femaleIndicators.some(indicator => name.includes(indicator));
  };

  // Only return true when we have strong evidence it's male.
  const isMaleVoice = (voiceName) => {
    if (!voiceName) return false;
    const name = voiceName.toLowerCase();
    if (isFemaleVoice(name)) return false;
    const maleIndicators = [
      "male", "ravi", "david", "mark", "james", "daniel", "paul", "john",
      "peter", "michael", "thomas", "richard", "george", "hemant", "arjun",
      "vikram", "aditya", "raj", "mohan", "kumar", "narrator male",
      // Common Microsoft India male voices
      "prabhat"
    ];
    return maleIndicators.some(indicator => name.includes(indicator));
  };

  // 🎙️ Get a sample Indian language voice to match tone
  const getIndianLanguageVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    // Try to get a voice from any Indian language to match its tone
    const indianLangs = ["hi-IN", "te-IN", "ta-IN", "bn-IN", "ml-IN", "kn-IN", "gu-IN", "mr-IN", "pa-IN"];
    
    for (const langCode of indianLangs) {
      const voice = voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
      if (voice) {
        console.log("🎯 Reference Indian voice found:", voice.name, "| Lang:", voice.lang);
        return voice;
      }
    }
    
    // Fallback: any voice with IN locale
    const fallback = voices.find(v => v.lang.toUpperCase().includes("IN") && !v.lang.toLowerCase().startsWith("en"));
    if (fallback) {
      console.log("🎯 Reference Indian voice (fallback):", fallback.name, "| Lang:", fallback.lang);
    }
    return fallback;
  };

  // 🎙️ Extract provider name from voice name (e.g., "Microsoft Ravi" -> "Microsoft")
  const getVoiceProvider = (voiceName) => {
    if (!voiceName) return null;
    const name = voiceName.trim();
    // Common providers
    const providers = ["Microsoft", "Google", "Amazon", "Apple", "Nuance", "IBM", "Microsoft", "Speech"];
    for (const provider of providers) {
      if (name.toLowerCase().startsWith(provider.toLowerCase())) {
        return provider;
      }
    }
    // If no known provider, return first word
    return name.split(" ")[0];
  };

  // 🎙️ Get best voice for language
  const getBestVoiceForLang = (lang) => {
    const voices = window.speechSynthesis.getVoices();
    const langMap = {
      "hi": ["hi-IN", "Hindi", "India"],
      "te": ["te-IN", "Telugu", "India"],
      "ta": ["ta-IN", "Tamil", "India"],
      "bn": ["bn-IN", "Bengali", "India"],
      "ml": ["ml-IN", "Malayalam", "India"],
      "kn": ["kn-IN", "Kannada", "India"],
      "gu": ["gu-IN", "Gujarati", "India"],
      "mr": ["mr-IN", "Marathi", "India"],
      "pa": ["pa-IN", "Punjabi", "India"],
      "en": ["en-IN", "English", "India"]
    };

    const langCodes = langMap[lang] || ["en-IN", "English"];
    const targetLangCode = langCodes[0];
    const targetLangName = langCodes[1];
    
    // Special handling for English - FORCE MALE VOICES ONLY (Guru Dronacharya tone)
    if (lang === "en") {
      // FIRST: Get ALL male English voices (filter female voices OUT)
      const allMaleEnglishVoices = voices.filter(v => {
        const vLang = v.lang.toLowerCase();
        return (vLang.startsWith("en") || vLang === "en-in") && isMaleVoice(v.name);
      });
      
      console.log("🔍 Available MALE English voices:", allMaleEnglishVoices.map(v => `${v.name} (${v.lang})`));
      
      // If NO male voices found, log all voices and filter more aggressively
      if (allMaleEnglishVoices.length === 0) {
        const allEnglishVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
        console.warn("⚠️ NO MALE ENGLISH VOICES FOUND! Available English voices:", 
                     allEnglishVoices.map(v => `${v.name} (${v.lang}) [${isMaleVoice(v.name) ? 'MALE' : 'FEMALE'}]`));
        
        // Try to find voices that are NOT obviously female
        const nonFemaleVoices = allEnglishVoices.filter(v => {
          const name = v.name.toLowerCase();
          return !name.includes("female") && 
                 !name.includes("zira") && 
                 !name.includes("hazel") && 
                 !name.includes("susan") &&
                 !name.includes("linda") &&
                 !name.includes("heather") &&
                 !name.includes("priya") &&
                 !name.includes("neha") &&
                 !name.includes("priyanka") &&
                 !name.includes("sara") &&
                 !name.includes("helen") &&
                 !name.includes("catherine") &&
                 !name.includes("kate") &&
                 !name.includes("anna") &&
                 !name.includes("emily") &&
                 !name.includes("lisa") &&
                 !name.includes("michelle") &&
                 !name.includes("jane") &&
                 !name.includes("monica");
        });
        
        if (nonFemaleVoices.length > 0) {
          // Prefer en-IN, then any non-female
          const preferred = nonFemaleVoices.find(v => v.lang.toLowerCase() === "en-in") || nonFemaleVoices[0];
          console.log("⚠️ Using non-female English voice (no male found):", preferred.name, "| Lang:", preferred.lang);
          return preferred;
        }
        
        // Last resort: Use ANY English voice (will be filtered by pitch)
        if (allEnglishVoices.length > 0) {
          const fallback = allEnglishVoices.find(v => v.lang.toLowerCase() === "en-in") || allEnglishVoices[0];
          console.error("⚠️⚠️ CRITICAL: Using ANY English voice (likely female) - will use deep pitch:", fallback.name);
          return fallback;
        }
      }
      
      // If we have male voices, now try to match with Indian language voice provider
      if (allMaleEnglishVoices.length > 0) {
        const referenceVoice = getIndianLanguageVoice();
        
        if (referenceVoice) {
          const refName = referenceVoice.name;
          const refProvider = getVoiceProvider(refName);
          console.log("🔍 Matching MALE English voice to:", refName, "| Provider:", refProvider);
          
          // Priority 1: MALE voice with EXACT same name (multilingual)
          const sameVoiceEnglish = allMaleEnglishVoices.find(v => v.name === refName);
          if (sameVoiceEnglish) {
            console.log("✅ Found EXACT same MALE voice for English:", sameVoiceEnglish.name, "| Lang:", sameVoiceEnglish.lang);
            return sameVoiceEnglish;
          }
          
          // Priority 2: MALE voices from same provider
          if (refProvider) {
            const providerMaleVoices = allMaleEnglishVoices.filter(v => {
              const vProvider = getVoiceProvider(v.name);
              return vProvider && vProvider.toLowerCase() === refProvider.toLowerCase();
            });
            
            if (providerMaleVoices.length > 0) {
              console.log(`✅ Found ${providerMaleVoices.length} MALE English voices from same provider (${refProvider})`);
              
              // Prefer en-IN male voice from same provider
              const maleENIN = providerMaleVoices.find(v => v.lang.toLowerCase() === "en-in");
              if (maleENIN) {
                console.log("🕉️ Using MALE en-IN voice from same provider for Guru Dronacharya:", maleENIN.name);
                return maleENIN;
              }
              
              // Use first male voice from same provider
              console.log("🕉️ Using MALE English voice from same provider for Guru Dronacharya:", providerMaleVoices[0].name);
              return providerMaleVoices[0];
            }
            
            // Priority 3: MALE voice with loose provider match
            const looseMatchMale = allMaleEnglishVoices.find(v => {
              const vName = v.name.toLowerCase();
              return vName.includes(refProvider.toLowerCase()) || 
                     vName.includes(refProvider.toLowerCase().slice(0, 4));
            });
            if (looseMatchMale) {
              console.log("🕉️ Found MALE loose provider match for Guru Dronacharya:", looseMatchMale.name);
              return looseMatchMale;
            }
          }
          
          // Priority 4: MALE en-IN voice
          const maleENIN = allMaleEnglishVoices.find(v => v.lang.toLowerCase() === "en-in");
          if (maleENIN) {
            console.log("🕉️ Using MALE en-IN voice for Guru Dronacharya:", maleENIN.name);
            return maleENIN;
          }
          
          // Priority 5: Any MALE English voice (last resort for male)
          console.log("🕉️ Using MALE English voice for Guru Dronacharya:", allMaleEnglishVoices[0].name, "| Lang:", allMaleEnglishVoices[0].lang);
          return allMaleEnglishVoices[0];
        } else {
          // No reference voice, but we have male voices - prefer en-IN
          const maleENIN = allMaleEnglishVoices.find(v => v.lang.toLowerCase() === "en-in");
          if (maleENIN) {
            console.log("🕉️ Using MALE en-IN voice for Guru Dronacharya:", maleENIN.name);
            return maleENIN;
          }
          console.log("🕉️ Using MALE English voice for Guru Dronacharya:", allMaleEnglishVoices[0].name);
          return allMaleEnglishVoices[0];
        }
      }
      
      // This should NEVER happen now - we have fallbacks above
      // But just in case, return null and let speak() handle it
      console.error("❌ CRITICAL: No English voices found at all!");
      return null;
    }
    
    // For other languages (Indian languages):
    // Priority 1: Exact match with Indian locale (e.g., "hi-IN", "te-IN")
    let voice = voices.find(v => 
      v.lang.toLowerCase() === targetLangCode.toLowerCase()
    );
    
    // Priority 2: Language match with Indian locale (e.g., starts with "hi" and contains "IN")
    if (!voice) {
      voice = voices.find(v => {
        const voiceLang = v.lang.toLowerCase();
        const targetBase = targetLangCode.split("-")[0].toLowerCase();
        return voiceLang.startsWith(targetBase) && voiceLang.includes("in");
      });
    }
    
    // Priority 3: Language name match (e.g., name contains "Hindi", "Telugu")
    if (!voice) {
      voice = voices.find(v => 
        v.name.toLowerCase().includes(targetLangName.toLowerCase()) &&
        (v.lang.includes("IN") || v.lang.toLowerCase().includes(targetLangCode.split("-")[0].toLowerCase()))
      );
    }
    
    // Priority 4: Any voice with matching base language code
    if (!voice) {
      voice = voices.find(v => 
        v.lang.toLowerCase().startsWith(targetLangCode.split("-")[0].toLowerCase())
      );
    }
    
    // Fallback: First available voice
    if (!voice && voices.length > 0) {
      voice = voices[0];
    }
    
    return voice;
  };

  // 🎙️ OPTIMIZED TEXT-TO-SPEECH - Fast & Fluent
  const speak = (text, lang) => {
    if (!window.speechSynthesis || !text) return;
    
    lang = lang || detectLanguage(text) || "en";
    const cleanedText = cleanTextForTTS(text, lang);
    if (!cleanedText.trim()) return;

    // Cancel any pending TTS first
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(cleanedText);
    
    // ⚡ SIMPLE Language Code Mapping
    const langMap = { hi: "hi-IN", te: "te-IN", ta: "ta-IN", bn: "bn-IN", ml: "ml-IN", kn: "kn-IN", gu: "gu-IN", mr: "mr-IN", pa: "pa-IN", en: "en-IN" };
    utter.lang = langMap[lang] || "en-IN";

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const targetLang = (utter.lang || "en-IN").toLowerCase();
      const targetBase = targetLang.split("-")[0];

      // Use "not-female" pool for stability; strict male token detection can miss legit male voices.
      const notFemale = voices.filter(v => !isFemaleVoice(v.name));
      const maleVoices = notFemale.filter(v => isMaleVoice(v.name));

      const cacheKey = targetLang;
      // Do NOT cache en-IN; we want the strict selector every time (prevents "robot" getting stuck).
      if (targetLang !== "en-in") {
        const cachedName = guruVoiceCacheRef.current?.[cacheKey];
        if (cachedName) {
          const cachedVoice =
            maleVoices.find(v => v.name === cachedName) ||
            notFemale.find(v => v.name === cachedName);
          if (cachedVoice) {
            utter.voice = cachedVoice;
            utter.lang = cachedVoice.lang || utter.lang;
          }
        }
      }

      // Always keep a stable "perfect" English male voice as global fallback.
      // This matches the earlier strict logic: prefer Ravi + provider family, with a one-time debug dump.
      const referenceVoice = getIndianLanguageVoice();
      const refProvider = referenceVoice ? getVoiceProvider(referenceVoice.name) : null;
      const providerMatch = (v) => {
        if (!refProvider) return false;
        const p = getVoiceProvider(v.name);
        return p && p.toLowerCase() === refProvider.toLowerCase();
      };

      const enInNotFemale = notFemale.filter(v => (v.lang || "").toLowerCase() === "en-in");
      const enInMaleVoices = maleVoices.filter(v => (v.lang || "").toLowerCase() === "en-in");

      if (!guruVoiceDebugOnceRef.current) {
        guruVoiceDebugOnceRef.current = true;
        console.log("🎧 TTS en-IN candidates (not-female):", enInNotFemale.map(v => `${v.name} (${v.lang})`));
        console.log("🎧 TTS en-IN male candidates:", enInMaleVoices.map(v => `${v.name} (${v.lang})`));
        console.log("🎯 Reference voice/provider:", referenceVoice?.name, "| provider:", refProvider);
      }

      const scoreEnglishMale = (v) => {
        const n = (v.name || "").toLowerCase();
        let s = 0;
        // Prefer Ravi first (typical Indian-accent male on Windows), then David.
        if (n.includes("ravi")) s += 100;
        else if (n.includes("david")) s += 92;
        else if (n.includes("hemant")) s += 88;
        else if (n.includes("arjun")) s += 86;
        else if (n.includes("vikram")) s += 84;
        else if (n.includes("aditya")) s += 82;
        else s += 70;

        // Strongly prefer matching the provider family of the reference Indian voice (keeps the same accent "feel").
        if (providerMatch(v)) s += 18;
        // Provider hint: Microsoft voices on Windows tend to be the most stable.
        if (n.includes("microsoft")) s += 6;
        return s;
      };

      // Strict preference: Ravi en-IN, then same-provider male en-IN, then other male fallbacks.
      // IMPORTANT: do not fall back to not-female for en-IN, otherwise we can still land on a female voice.
      const englishMale =
        enInMaleVoices.find(v => (v.name || "").toLowerCase().includes("ravi")) ||
        enInMaleVoices.find(v => (v.name || "").toLowerCase().includes("prabhat")) ||
        enInMaleVoices.find(v => providerMatch(v)) ||
        [...enInMaleVoices].sort((a, b) => scoreEnglishMale(b) - scoreEnglishMale(a))[0] ||
        // If there is no en-IN male voice at all, fall back to any IN-locale male voice (keeps male, may lose accent)
        maleVoices.find(v => (v.lang || "").toUpperCase().includes("IN")) ||
        maleVoices[0] ||
        null;

      if (!utter.voice) {
        const pickFirst = (pool) => (pool && pool.length > 0 ? pool[0] : null);

        const exactMale = maleVoices.filter(v => (v.lang || "").toLowerCase() === targetLang);
        const baseMale = maleVoices.filter(v => (v.lang || "").toLowerCase().startsWith(targetBase));
        const exactNotFemale = notFemale.filter(v => (v.lang || "").toLowerCase() === targetLang);
        const baseNotFemale = notFemale.filter(v => (v.lang || "").toLowerCase().startsWith(targetBase));

        // STRICT: never pick non-male voices. If no male voice exists for that language,
        // fall back to the stable English male voice (keeps Guru male always).
        const chosen =
          // For English: use strict englishMale cascade every time
          (targetLang === "en-in" ? englishMale : null) ||
          // Otherwise: exact/base male
          pickFirst(exactMale) ||
          pickFirst(baseMale) ||
          // If no male voice exists for that language, allow not-female in-language (still prevents female drift)
          pickFirst(exactNotFemale) ||
          pickFirst(baseNotFemale) ||
          // Final fallback: English male cascade
          englishMale;

        if (chosen) {
          utter.voice = chosen;
          if (chosen.lang) utter.lang = chosen.lang;
          if (targetLang !== "en-in") {
            guruVoiceCacheRef.current[cacheKey] = chosen.name;
          }
        }
      }

      if (lastGuruVoiceNameRef.current !== utter.voice?.name) {
        lastGuruVoiceNameRef.current = utter.voice?.name;
        console.log("🎯 TTS Guru voice:", utter.voice?.name, "| Lang:", utter.voice?.lang, "| Target:", targetLang);
      }
    }

    // ⚡ Natural guru delivery (avoid robotic pitch)
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    // Speak!
    try {
      window.speechSynthesis.speak(utter);
    } catch (err) {
      console.log("TTS error:", err);
    }
  };

  // 🎤 Speech Recognition (Voice Input)
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    // Configure recognition
    recognitionInstance.continuous = false; // Stop after one result
    recognitionInstance.interimResults = false; // Only return final results
    recognitionInstance.lang = 'en-US'; // Default, will be auto-detected
    
    // Start listening
    recognitionInstance.onstart = () => {
      setIsListening(true);
      console.log("🎤 Speech recognition started...");
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("🎤 Speech recognized:", transcript);
      setQuestion(transcript);
      setIsListening(false);
      
      // Auto-submit the question
      setTimeout(() => {
        askDrona(transcript);
      }, 500);
    };

    recognitionInstance.onerror = (event) => {
      console.error("🎤 Speech recognition error:", event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert("No speech detected. Please try again.");
      } else if (event.error === 'not-allowed') {
        alert("Microphone permission denied. Please enable microphone access.");
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      console.log("🎤 Speech recognition ended");
    };

    try {
      recognitionInstance.start();
      recognitionRef.current = recognitionInstance;
    } catch (err) {
      console.error("🎤 Failed to start recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  // 📹 Camera functions
  const startCamera = async () => {
    try {
      setCameraError("");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
        
        // Guru acknowledges seeing the student
        setTimeout(() => {
          const visionMessage = {
            type: 'guru-proactive',
            text: `Good, ${studentName || 'young one'}. Now I can see you. Your guru watches as you seek knowledge.`,
            timestamp: new Date().toLocaleTimeString()
          };
          setChatHistory(prev => [...prev, visionMessage]);
          speak(`Good, ${studentName || 'young one'}. Now I can see you. Your guru watches as you seek knowledge.`, 'en');
        }, 1000);
      }
    } catch (err) {
      console.error("📹 Camera error:", err);
      if (err.name === 'NotAllowedError') {
        setCameraError("Camera permission denied. Grant access so your guru can see you.");
      } else if (err.name === 'NotFoundError') {
        setCameraError("No camera found on this device.");
      } else {
        setCameraError("Unable to access camera: " + err.message);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setCameraError("");
  };



  const isAstraRelevant = (text) => {
    const t = text.toLowerCase();
    const astras = ['brahmastra','agneyastra','vayavyastra','narayanastra','pashupatastra','varunastra','astra'];
    if (!t.trim()) return false;
    if (astras.some(a => t.includes(a))) return true;
    return ['explain','tell','how','why','rules','dharma','invoke','used','kurukshetra'].some(k => t.includes(k));
  };




  // eslint-disable-next-line no-unused-vars
  const hasLearnedAnything = () => {
    return !!currentVidya || astraSegments.length > 0;
  };
  // eslint-disable-next-line no-unused-vars
  const getLearnedSubject = () => {
    if (currentVidya) return currentVidya;
    if (astraSegments.length > 0) return currentAstra;
    return null;
  };
  const addAstraSegment = (text) => {
    setAstraSegments(prev => {
      const next = [...prev, { text, timestamp: new Date().toLocaleTimeString() }];
      return next;
    });
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };





  // 🌅 Reset story history for story restart
  const resetStoryHistory = () => {
    setStoryHistory([
      {
        role: 'guru',
        text: "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?",
      },
    ]);
    // Reset chapter tracking
    setCurrentStoryId('');
    setCurrentChapter(0);
    setTotalChapters(0);
    setStoryState({});
  };

  // Alias for restart button - same as resetStoryHistory
  const restartStory = resetStoryHistory;

  // ✨ Continue Story - Used by "Continue" button in Ithihaasa Mode
  const continueStory = async () => {
    // Simple: just ask for next part of story
    const continuePrompt = "Continue the story...";
    
    // Add to story history  
    setStoryHistory(prev => [...prev, { role: 'shishya', text: continuePrompt }]);
    
    // Ask the backend for next chapter
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: continuePrompt,
          lang: 'en',
          student_name: studentName,
          mode: 'samvad',
          vidya: 'itihaasa',
          vidya_mode: 'learn',
          chat_history: storyHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.answer) {
        const guruMessage = { role: 'guru', text: data.answer };
        setStoryHistory(prev => [...prev, guruMessage]);
        
        // Save to student memory
        if (studentName) {
          const studentData = studentMemory.getStudentData(studentName);
          studentData.story_history = storyHistory;
          studentMemory.setStudentData(studentName, studentData);
        }
      } else {
        setStoryHistory(prev => [...prev, { role: 'guru', text: 'The story continues, but my thoughts are unclear. Try again.' }]);
      }
    } catch (error) {
      console.error('Error continuing story:', error);
      setStoryHistory(prev => [...prev, { role: 'guru', text: 'Forgive me, Shishya. I seem to have lost my train of thought.' }]);
    } finally {
      setLoading(false);
    }
  };

  // 🌅 Ask backend
  const askDrona = async (questionText = null) => {
    try {
      // Safely convert to string and trim
      let finalQuestion = '';
      if (typeof questionText === 'string') {
        finalQuestion = questionText.trim();
      } else if (typeof question === 'string') {
        finalQuestion = question.trim();
      } else if (questionText && typeof questionText.toString === 'function') {
        finalQuestion = questionText.toString().trim();
      } else if (question && typeof question.toString === 'function') {
        finalQuestion = question.toString().trim();
      }
      
      if (!finalQuestion) return;

      if (currentMode === 'weapons' && !isAstraRelevant(finalQuestion)) {
        setShowAstraLock(true);
        const msg = { type: 'guru', text: 'Shishya, this is Astra Vidhya. Maintain your focus on astras alone.', timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, msg]);
        setTimeout(() => setShowAstraLock(false), 2000);
        return;
      }
      
      setLoading(true);
      const lang = detectLanguage(finalQuestion);

      // Add user message to chat
      const userMessage = {
        type: 'user',
        text: finalQuestion,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, userMessage]);
      
      // If in story mode, also add to story history
      if (currentMode === 'story') {
        setStoryHistory(prev => [...prev, { role: 'shishya', text: finalQuestion }]);
      }
      setQuestion(""); // Clear input

      // Check if student is asking about their name
      const questionLower = finalQuestion.toLowerCase();
      const nameKeywords = ['my name', 'what is my name', 'who am i', 'i am', 'my name is', 'what\'s my name', 'tell me my name'];
      const isNameQuestion = nameKeywords.some(keyword => questionLower.includes(keyword));
      
      let responseText = "No response from DRONA.";
      
      // If asking about name, respond directly
      if (isNameQuestion && studentName) {
        responseText = `Your name is ${studentName}, my disciple. You have entered my ashram with this identity. Now, use this name to build your legacy through learning and dedication.`;
      } else {
        // Send to backend for other questions
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            question: finalQuestion, 
            lang,
            student_name: studentName,
            mode: currentMode,
            vidya: currentVidya,
            vidya_mode: vidyaMode  // Pass learn/test mode
          }),
        });
        const data = await response.json();
        responseText = data.answer || "No response from DRONA.";
      }
      
      // Add guru message to chat
      const guruMessage = {
        type: 'guru',
        text: responseText,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => {
        const updated = [...prev, guruMessage];
        // Save to student memory
        if (studentName) {
          studentMemory.updateStudentData(studentName, {
            chatHistory: updated
          });
          
          // Save student profile to backend
          fetch('http://127.0.0.1:8000/save_student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              student_name: studentName,
              initiated: true
            })
          }).catch(err => console.log('Backend save failed:', err));
        }
        return updated;
      });
      
      // Check if question is related to culture/history and save to heritage
      const heritageKeywords = ['culture', 'history', 'tradition', 'festival', 'mythology', 'mahabharata', 'ramayana', 'dharma', 'vedas', 'upanishad', 'ashram', 'guru', 'kundalini', 'chakra', 'yoga', 'ayurveda', 'tantra', 'mantra', 'ritual', 'ceremony'];
      const isHeritageQuestion = heritageKeywords.some(keyword => questionLower.includes(keyword));
      
      if (isHeritageQuestion && studentName) {
        fetch('http://127.0.0.1:8000/save_heritage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: finalQuestion,
            answer: responseText,
            student_name: studentName,
            category: 'culture'
          })
        }).catch(err => console.log('Heritage save failed:', err));
      }
      
      // If in story mode, also add to story history
      if (currentMode === 'story') {
        setStoryHistory(prev => [...prev, { role: 'guru', text: responseText }]);
      } else if (currentMode === 'weapons') {
        addAstraSegment(responseText);
      }
      
      // 🔊 TEXT-TO-SPEECH FOR ALL MODES
      // Always speak the guru response regardless of mode
      const speakLang = lang || "en";
      if (speak && responseText && responseText.trim()) {
        console.log(`[TTS] Speaking in mode: ${currentMode}, lang: ${speakLang}`);
        speak(responseText, speakLang);
      }
    } catch (err) {
      const errorMessage = {
        type: 'error',
        text: "⚠️ Unable to reach DRONA backend. Make sure it's running.",
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Test submission handler for vidya test mode
  const handleTestSubmit = async () => {
    if (!question.trim()) return;
    
    setVidyaTestAnswers([...vidyaTestAnswers, question]);
    setVidyaTestScore(Math.min(vidyaTestScore + 1, 10));
    
    await askDrona();
    setQuestion('');
  };

  // 🎶 Background meditation sound auto-start & initialize voices
  useEffect(() => {
    // Initialize available voices
    const initVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      console.log("🎙️ Available voices:", voices.length);
      voices.forEach((v, i) => {
        console.log(`  ${i}: ${v.name} (${v.lang})`);
      });
    };

    // Load voices when available
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = initVoices;
    }
    initVoices();

    const audio = new Audio(bgMusic);
    audio.loop = true;
    audio.volume = 0.2;
    audio.play().catch(() => {
      console.log("⚠️ Autoplay blocked by browser");
    });
    
    // Cleanup function
    return () => {
      audio.pause();
      // Stop speech recognition if active
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      // Stop camera if active
      stopCamera();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Send daily wisdom after initiation
  useEffect(() => {
    if (isInitiated) {
      // DISABLED: Do not send automatic messages
      // Guru only speaks when student asks a question
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated]);

  // Reset ALL chat and mode-specific state when switching modes
  useEffect(() => {
    // Clear chat history completely
    setChatHistory([]);
    setQuestion('');
    setLoading(false);
    
    // Clear story history on mode change
    setStoryHistory([
      {
        role: 'guru',
        text: "Shishya, sit close. Today I shall unfold the tales of old—the stories that shaped warriors and kings. Which tale calls to you? A warrior's journey? A battle? A hidden lesson?",
      },
    ]);
    
    // Clear Astra segments
    setAstraSegments([]);
    
    // Clear current Vidya
    setCurrentVidya('');
    
    // Reset form and UI states
    setShowAstraLock(false);

    // CAMERA LIFECYCLE: Stop camera if exiting vidya mode
    if (currentMode !== 'vidya') {
      stopCamera();
    }
  }, [currentMode]);

  useEffect(() => {
    if (isInitiated && false) {
    }
  }, [isInitiated, currentMode]);

  // Send initial guru message when switching to chat mode
  useEffect(() => {
    if (currentMode === 'chat') {
      // DISABLED: Do not send automatic messages
      // Guru only speaks when student asks a question
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMode]);

  // Auto-start camera when switching to vidya modes that require it
  useEffect(() => {
    if (currentMode === 'vidya' && currentVidya) {
      if (CAMERA_CONFIG.camera_enabled.includes(currentVidya)) {
        startCamera();
      } else if (CAMERA_CONFIG.camera_optional.includes(currentVidya)) {
        // For optional camera modes, show a button but don't auto-start
        setCameraActive(false);
      } else {
        stopCamera();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVidya, currentMode]);

  // Simulate motion stability for Dhyana Vidya
  useEffect(() => {
    if (currentMode === 'vidya' && currentVidya === 'dhyana' && cameraActive) {
      const interval = setInterval(() => {
        // Simulate motion detection: randomly update stability (3-5 active dots)
        setMotionStability(Math.floor(Math.random() * 3) + 3);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [currentMode, currentVidya, cameraActive]);

  useEffect(() => {
    const updateFlyoutTop = () => {
      if (vidyaBtnRef.current) {
        const rect = vidyaBtnRef.current.getBoundingClientRect();
        setVidyaFlyoutTop(rect.top - 50);
      }
    };
    updateFlyoutTop();
    window.addEventListener('resize', updateFlyoutTop);
    return () => window.removeEventListener('resize', updateFlyoutTop);
  }, [currentMode]);

  return (
    <div className="drona-app">
      <div className="background-aura"></div>

      {/* Student Selector Modal */}
      {showStudentSelector && (
        <div className="student-selector-modal">
          <div className="student-selector-content">
            <h2>🙏 Select Your Disciple Profile</h2>
            <p className="selector-subtitle">Welcome to Dronacharya's Ashram</p>
            
            {/* Existing Students */}
            {allStudents.length > 0 && (
              <div className="students-list">
                <p className="list-title">📚 Your Past Learning:</p>
                {allStudents.map(name => {
                  return (
                    <div key={name} className="student-item">
                      <button
                        className="student-btn"
                        onClick={() => handleSelectStudent(name)}
                      >
                        <span className="student-name">{name}</span>
                      </button>
                      <button
                        className="delete-student-btn"
                        onClick={() => handleDeleteStudent(name)}
                        title={`Delete ${name}'s profile`}
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* New Student Input */}
            <div className="new-student-section">
              <p className="section-title">🌟 Begin New Journey:</p>
              <input
                type="text"
                placeholder="Enter your name as new disciple..."
                className="new-student-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateStudent(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                className="create-student-btn"
                onClick={(e) => {
                  const input = e.target.previousSibling;
                  handleCreateStudent(input.value);
                  input.value = '';
                }}
              >
                Enter Ashram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar - Mode Selector */}
      {isInitiated && (
        <div className="mode-sidebar">
          {/* Student Management Buttons */}
          <div className="student-controls">
            <button
              className="switch-student-btn"
              onClick={handleSwitchStudent}
              title="Switch to a different student"
            >
              🔄 Switch Student
            </button>
            <button
              className="delete-chat-btn"
              onClick={handleDeleteChat}
              title="Clear chat from UI (backend preserved)"
            >
              🗑️ Clear Chat
            </button>
          </div>

          <h3 className="sidebar-title">Training Modes</h3>
          
          {/* Mode Selector */}
          <div className="mode-list">
            <button 
              className={`mode-btn ${currentMode === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentMode('chat')}
            >
              💬 Samvad (Chat)
            </button>
            <button 
              className={`mode-btn ${currentMode === 'story' ? 'active' : ''}`}
              onClick={() => setCurrentMode('story')}
            >
              📖 Itihasa (Stories)
            </button>
            <button 
              className={`mode-btn ${currentMode === 'weapons' ? 'active' : ''}`}
              onClick={() => setCurrentMode('weapons')}
            >
              🗡️ Astras (Weapons)
            </button>
            <button 
              className={`mode-btn ${currentMode === 'vidya' ? 'active' : ''}`}
              onClick={() => {
                if (currentMode === 'vidya') {
                  // Toggle off
                  setCurrentMode('chat');
                  setShowVidyaSelector(false);
                  setVidyaMode(null);
                  setCurrentVidya('');
                  setShowVidyaSelection(false);
                } else {
                  // Toggle on - show Learn/Test selection modal first
                  setCurrentMode('vidya');
                  setVidyaMode(null);
                  setCurrentVidya('');
                  setShowVidyaSelector(false);
                  setShowVidyaSelection(true);
                }
              }}
              ref={vidyaBtnRef}
            >
              🕉️ Vidya (Knowledge)
            </button>

          </div>

        </div>
      )}

        {/* Learn/Test Selection Modal - First Choice */}
        {isInitiated && showVidyaSelection && currentMode === 'vidya' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              padding: '50px',
              borderRadius: '15px',
              textAlign: 'center',
              color: '#fff',
              border: '2px solid #ffd966',
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{fontSize: '2rem', marginBottom: '30px', color: '#ffd966'}}>
                🎓 Choose Your Path
              </h2>
              <p style={{marginBottom: '40px', fontSize: '1.1rem', color: '#d0d0d0'}}>
                How would you like to engage with the Vidyas?
              </p>
              
              <button 
                onClick={() => {
                  setVidyaMode('learn');
                  setShowVidyaSelection(false);
                  setShowVidyaSelector(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ffd966 0%, #ffed4e 100%)',
                  border: 'none',
                  color: '#1a1a2e',
                  padding: '15px 40px',
                  margin: '10px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255,217,102,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📚 Learn Vidya (Lesson by Lesson)
              </button>
              
              <button 
                onClick={() => {
                  setVidyaMode('test');
                  setShowVidyaSelection(false);
                  setShowVidyaSelector(true);
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: '#fff',
                  padding: '15px 40px',
                  margin: '10px',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102,126,234,0.3)'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ❓ Test Vidya (Guru Tests You)
              </button>
              
              <button 
                onClick={() => {
                  setShowVidyaSelection(false);
                  setCurrentMode('chat');
                }}
                style={{
                  background: 'transparent',
                  border: '2px solid #d0d0d0',
                  color: '#d0d0d0',
                  padding: '12px 30px',
                  margin: '10px',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#ffd966';
                  e.target.style.color = '#ffd966';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#d0d0d0';
                  e.target.style.color = '#d0d0d0';
                }}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      {/* Original VidyaHub - for traditional vidya modes */}
      {isInitiated && currentMode === 'vidya' && showVidyaSelector && (
        <div className="vidya-mode-wrapper">
          <VidyaHub 
            studentName={studentName}
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            isLoading={loading}
            vidyaMode={vidyaMode}
              speak={speak}
              detectLanguage={detectLanguage}
          />
          <button 
            className="vidya-close-btn"
            onClick={() => {
              setCurrentMode('chat');
              setShowVidyaSelector(false);
              setVidyaMode(null);
              setCurrentVidya('');
            }}
            title="Return to Chat"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area - Hidden when vidya selector is showing */}
      <div
        className={`main-content ${isInitiated ? 'with-sidebar' : ''}`}
        style={currentMode === 'vidya' && showVidyaSelector ? { display: 'none' } : undefined}
      >

      {/* Initiation Modal */}
      {showInitiation && (
        <div className="initiation-modal">
          <div className="initiation-content">
            <h2>🙏 Welcome to Dronacharya's Ashram, {studentName}</h2>
            <p className="initiation-text">
              I am Dronacharya, reborn from the age of Mahabharata. I trained the greatest warriors - 
              Arjuna, Bhima, Duryodhana. I fought in the Kurukshetra war and fell when I heard false news 
              of my beloved son Ashwatthama's death.
            </p>
            <p className="initiation-text">
              Now I return to guide students in the eternal wisdom of dharma, warfare, and the Vedas. 
              You are now entering my gurukul. Are you ready to learn?
            </p>
            <button 
              className="initiation-btn"
              onClick={() => {
                handleInitiation(studentName);
              }}
              autoFocus
            >
              Yes, I am Ready 🙏
            </button>
          </div>
        </div>
      )}

      <div className="guru-container">
        <Lottie animationData={guruAnimation} loop={true} className="guru-lottie" />
        <h1 className="drona-title">🪔 DRONA – THE DIGITAL GURU OF INDIAN WISDOM</h1>

        <p className="sanskrit-text">
          “विद्या ददाति विनयं, विनयाद् याति पात्रताम्”<br />
          <span className="sanskrit-meaning">
            (Knowledge gives humility, and humility brings worthiness)
          </span>
        </p>

        <p className="subtitle">
          Ask in <b>any Indian language</b> — తెలుగు, हिंदी, தமிழ், বাংলা — and DRONA will answer in the same tongue.
        </p>

        {/* Mode-Specific Header */}
        {isInitiated && currentMode !== 'chat' && currentMode !== 'vidya' && (
          <div className="mode-header">
            {currentMode === 'story' && <h2 className="mode-title">📖 Itihasa - Stories from Mahabharata</h2>}

            {currentMode === 'weapons' && <h2 className="mode-title">🗡️ Astras - Secrets of Celestial Weapons</h2>}
          </div>
        )}

        {/* Chat History - MODE-SPECIFIC UI */}
        {currentMode === 'chat' && (
          <div className={`chat-container ${getThemeClass()}`}>
            {chatHistory.length === 0 && (
              <div className="chat-welcome">
                <p>🙏 Shishya, you have approached your guru. In which art or wisdom do you desire instruction?</p>
              </div>
            )}
            
            {chatHistory.map((message, index) => (
              <div key={index} className={`chat-message ${message.type}`}>
                {message.type === 'user' && (
                  <div className="message-content user-message">
                    <div className="message-header">
                      <span className="message-label">You</span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                )}
                {message.type === 'guru' && (
                  <div className="message-content guru-message">
                    <div className="message-header">
                      <span className="message-label">🕉️ Guru Dronacharya</span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                )}
                {(message.type === 'guru-proactive' || message.type === 'guru-wisdom') && (
                  <div className="message-content guru-message proactive">
                    <div className="message-header">
                      <span className="message-label">🕉️ Guru Dronacharya speaks...</span>
                      <span className="message-time">{message.timestamp}</span>
                    </div>
                    <p className="proactive-text">{message.text}</p>
                  </div>
                )}
                {message.type === 'error' && (
                  <div className="message-content error-message">
                    <p>{message.text}</p>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="chat-message guru">
                <div className="message-content guru-message loading">
                  <p>🙏 Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}

        {/* ARCHERY MODE UI */}
        {currentMode === 'archery' && (
          <div className="archery-training-ui">
            <div className="target-area">
              <div className="target">
                <div className="bullseye"></div>
              </div>
              <p className="target-instruction">🎯 Focus on the center. See only the target.</p>
            </div>
            <div className="archery-chat">
              {chatHistory.slice(-5).map((message, index) => (
                <div key={index} className="archery-message">
                  <strong>{message.type === 'user' ? 'You' : 'Guru'}:</strong> {message.text}
                </div>
              ))}
              {loading && <div className="archery-message">Guru is evaluating your focus...</div>}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* WAR STRATEGY MODE UI */}
        {currentMode === 'war' && (
          <div className="war-strategy-ui">
            <div className="battlefield">
              <div className="formation-display">
                <div className="formation chakravyuha">
                  <span>⚫⚫⚫</span>
                  <span>⚫🎯⚫</span>
                  <span>⚫⚫⚫</span>
                </div>
                <p className="formation-label">⚔️ Chakravyuha Formation</p>
              </div>
            </div>
            <div className="war-chat">
              {chatHistory.slice(-4).map((message, index) => (
                <div key={index} className="war-message">
                  <span className="war-label">{message.type === 'user' ? '🧘 Student' : '⚔️ Commander Drona'}:</span>
                  <p>{message.text}</p>
                </div>
              ))}
              {loading && <div className="war-message">Analyzing battlefield strategy...</div>}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* MEDITATION MODE UI */}
        {currentMode === 'meditation' && (
          <div className="meditation-ui">
            <div className="meditation-center">
              <div className="chakra-circle">
                <div className="om-center">🕉️</div>
                <div className="energy-pulse"></div>
              </div>
              <p className="meditation-guide">Close your eyes. Breathe deeply. Find your center.</p>
            </div>
            <div className="meditation-chat">
              {chatHistory.slice(-3).map((message, index) => (
                <div key={index} className="meditation-message">
                  {message.text}
                </div>
              ))}
              {loading && <div className="meditation-message">...silence...</div>}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}




        {/* ITIHAAASA (STORIES) MODE UI */}
        {currentMode === 'story' && (
          <IthihasaMode 
            studentName={studentName}
            language={detectLanguage("story")}
            speak={speak}
            askDrona={askDrona}
            detectLanguage={detectLanguage}
            storyHistory={storyHistory}
            resetStoryHistory={resetStoryHistory}
            restartStory={restartStory}
            continueStory={continueStory}
            isLoading={loading}
          />
        )}

        {/* ASTRAS MODE UI - Celestial Weapons with Mystical Design */}
        {currentMode === 'weapons' && (
          <div className={`astras-mode-container ${getThemeClass()}`}>
            {/* Animated particle background */}
            <div className="astras-particle-bg">
              <div className="particle"></div>
              <div className="particle"></div>
              <div className="particle"></div>
            </div>

            {/* Main 3-panel layout */}
            <div className="astras-main-layout">
              
              {/* LEFT PANEL - Astra List */}
              <div className="astras-left-panel">
                <div className="panel-header">
                  <h2 className="panel-title">⚡ Divine Astras</h2>
                </div>

                {/* Search Bar */}
                <div className="astra-search-box">
                  <input 
                    type="text" 
                    placeholder="Search astras..." 
                    className="astra-search-input"
                    value={astraSearchQuery}
                    onChange={(e) => setAstraSearchQuery(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>

                {/* Astra List */}
                <div className="astra-cards-container">
                  {astraList
                    .filter((astra) => 
                      astra.name.toLowerCase().includes(astraSearchQuery.toLowerCase())
                    )
                    .map((astra) => (
                    <div
                      key={astra.name}
                      className={`astra-card ${currentAstra === astra.name ? 'active-card' : ''}`}
                      onClick={() => {
                        setCurrentAstra(astra.name);
                        askDrona(`Tell me about ${astra.name}. What are its powers and characteristics?`);
                      }}
                    >
                      <div className="card-icon">{astra.icon}</div>
                      <div className="card-content">
                        <h4 className="card-name">{astra.name}</h4>
                        <p className="card-element">{astra.element}</p>
                      </div>
                      {currentAstra === astra.name && <div className="active-indicator"></div>}
                    </div>
                  ))}
                  
                  {/* No Results Message */}
                  {astraList.filter((astra) => astra.name.toLowerCase().includes(astraSearchQuery.toLowerCase())).length === 0 && (
                    <div className="astra-no-results">
                      <p>🔍 No astras found</p>
                      <small>Try a different search term</small>
                    </div>
                  )}
                </div>
              </div>

              {/* CENTER PANEL - Astra Details */}
              <div className="astras-center-panel">
                <div className="astra-details-box">
                  
                  {/* Astra Title */}
                  <div className="astra-title-section">
                    <h1 className="astra-name-title">{currentAstra}</h1>
                    <p className="astra-subtitle">
                      {[
                        { name: 'Brahmastra', subtitle: 'The Ultimate Universal Weapon' },
                        { name: 'Agneyastra', subtitle: 'The Fire Arrow of Destruction' },
                        { name: 'Varunastra', subtitle: 'The Water Weapon of Control' },
                        { name: 'Vayavyastra', subtitle: 'The Wind Storm of Chaos' },
                        { name: 'Narayanastra', subtitle: 'The Celestial Shower' },
                        { name: 'Pashupatastra', subtitle: 'The Divine Animal Weapon' },
                        { name: 'Indrastra', subtitle: 'The Lightning of Heaven' },
                        { name: 'Soma Astra', subtitle: 'The Lunar Healing Weapon' },
                      ].find(a => a.name === currentAstra)?.subtitle || ''}
                    </p>
                  </div>

                  {/* Description Area - Scrollable */}
                  <div className="astra-description-area">
                    {astraSegments.length > 0 ? (
                      astraSegments.map((seg, idx) => (
                        <div key={idx} className="description-block">
                          <p>{seg.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="description-block placeholder">
                        <p>Click an astra to learn its secrets...</p>
                      </div>
                    )}
                    {loading && (
                      <div className="description-block loading">
                        <p>🔮 Unveiling sacred knowledge from the ancient texts...</p>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* TTS/Audio Button */}
                  <div className="astra-audio-controls">
                    <button className="tts-button" onClick={() => speak(astraSegments.map(s => s.text).join(' '))}>
                      <span className="audio-icon">🔊</span>
                      <span className="audio-text">Listen to Explanation</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANEL - Visual Display */}
              <div className="astras-right-panel">
                <div className="visual-container">
                  {/* Animated Element Visualization */}
                  <div className="element-animation-box">
                    {currentAstra === 'Agneyastra' && (
                      <div className="astra-visual flames-animation">
                        <div className="flame"></div>
                        <div className="flame"></div>
                        <div className="flame"></div>
                      </div>
                    )}
                    {currentAstra === 'Varunastra' && (
                      <div className="astra-visual water-animation">
                        <div className="water-wave"></div>
                        <div className="water-wave"></div>
                      </div>
                    )}
                    {currentAstra === 'Vayavyastra' && (
                      <div className="astra-visual wind-animation">
                        <div className="wind-ring"></div>
                        <div className="wind-ring"></div>
                      </div>
                    )}
                    {(currentAstra === 'Brahmastra' || currentAstra === 'Narayanastra') && (
                      <div className="astra-visual celestial-animation">
                        <div className="star-burst"></div>
                      </div>
                    )}
                    {currentAstra === 'Pashupatastra' && (
                      <div className="astra-visual animal-animation">
                        <div className="pulsing-aura"></div>
                      </div>
                    )}
                    {currentAstra === 'Indrastra' && (
                      <div className="astra-visual lightning-animation">
                        <div className="lightning-bolt"></div>
                      </div>
                    )}
                    {currentAstra === 'Soma Astra' && (
                      <div className="astra-visual lunar-animation">
                        <div className="moon-glow"></div>
                      </div>
                    )}
                  </div>

                  {/* Info Tabs */}
                  <div className="astra-info-tabs">
                    <div className="tab-buttons">
                      <button 
                        className={`tab-btn ${activeAstraTab === 'element' ? 'active' : ''}`}
                        onClick={() => setActiveAstraTab('element')}
                      >
                        Element
                      </button>
                      <button 
                        className={`tab-btn ${activeAstraTab === 'effects' ? 'active' : ''}`}
                        onClick={() => setActiveAstraTab('effects')}
                      >
                        Effects
                      </button>
                      <button 
                        className={`tab-btn ${activeAstraTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveAstraTab('notes')}
                      >
                        Notes
                      </button>
                    </div>
                    <div className="tab-content">
                      {/* Element Tab */}
                      {activeAstraTab === 'element' && (
                        <div className="tab-pane">
                          <p className="tab-label">⚡ Element Type:</p>
                          <p className="tab-value">
                            {[
                              { name: 'Brahmastra', element: 'Universal Creation' },
                              { name: 'Agneyastra', element: 'Pure Fire' },
                              { name: 'Varunastra', element: 'Pure Water' },
                              { name: 'Vayavyastra', element: 'Pure Air' },
                              { name: 'Narayanastra', element: 'Divine Energy' },
                              { name: 'Pashupatastra', element: 'Animal Divine' },
                              { name: 'Indrastra', element: 'Electricity' },
                              { name: 'Soma Astra', element: 'Lunar Energy' },
                            ].find(a => a.name === currentAstra)?.element || ''}
                          </p>
                          <p className="tab-description">
                            {[
                              { name: 'Brahmastra', desc: 'The ultimate universal weapon with creation energy that can destroy everything in its path.' },
                              { name: 'Agneyastra', desc: 'Pure fire element channeled into a divine weapon, capable of creating destructive heat and flames.' },
                              { name: 'Varunastra', desc: 'The water element weapon that controls vast torrents and floods of divine water.' },
                              { name: 'Vayavyastra', desc: 'Wind-powered weapon that summons devastating wind storms and cyclones.' },
                              { name: 'Narayanastra', desc: 'Divine celestial energy that falls like a shower of devastating power.' },
                              { name: 'Pashupatastra', desc: 'Divine animal energy channeled through this powerful astral weapon.' },
                              { name: 'Indrastra', desc: 'Lightning and electricity element weapon of Lord Indra, king of the gods.' },
                              { name: 'Soma Astra', desc: 'Lunar energy weapon with healing and nocturnal properties.' },
                            ].find(a => a.name === currentAstra)?.desc || ''}
                          </p>
                        </div>
                      )}

                      {/* Effects Tab */}
                      {activeAstraTab === 'effects' && (
                        <div className="tab-pane">
                          <p className="tab-label">💥 Battlefield Effects:</p>
                          <ul className="tab-list">
                            {[
                              { 
                                name: 'Brahmastra', 
                                effects: [
                                  'Destroys entire armies',
                                  'No counter weapon exists',
                                  'Universal annihilation',
                                  'Can only be used once per day'
                                ]
                              },
                              { 
                                name: 'Agneyastra', 
                                effects: [
                                  'Creates blazing inferno',
                                  'Burns multiple targets',
                                  'Can be countered by water astras',
                                  'Causes mass destruction'
                                ]
                              },
                              { 
                                name: 'Varunastra', 
                                effects: [
                                  'Summons torrential floods',
                                  'Traps opponents in water',
                                  'Can extinguish fire astras',
                                  'Control of all water bodies'
                                ]
                              },
                              { 
                                name: 'Vayavyastra', 
                                effects: [
                                  'Creates wind storms',
                                  'Disperses formations',
                                  'Uncontrollable chaos',
                                  'Affects large areas'
                                ]
                              },
                              { 
                                name: 'Narayanastra', 
                                effects: [
                                  'Celestial shower of power',
                                  'Multiplies with counter attacks',
                                  'Divine judgment weapon',
                                  'Cannot be defeated by force'
                                ]
                              },
                              { 
                                name: 'Pashupatastra', 
                                effects: [
                                  'Animal fury unleashed',
                                  'Devastating power',
                                  'Rare and ancient',
                                  'Ultimate destruction'
                                ]
                              },
                              { 
                                name: 'Indrastra', 
                                effects: [
                                  'Lightning strikes',
                                  'Electrical devastation',
                                  'Cannot miss target',
                                  'Instant destruction'
                                ]
                              },
                              { 
                                name: 'Soma Astra', 
                                effects: [
                                  'Lunar night empowerment',
                                  'Healing properties',
                                  'Reduces fighting power by day',
                                  'Night warrior advantage'
                                ]
                              },
                            ].find(a => a.name === currentAstra)?.effects.map((effect, idx) => (
                              <li key={idx} className="effect-item">{effect}</li>
                            )) || []}
                          </ul>
                        </div>
                      )}

                      {/* Notes Tab */}
                      {activeAstraTab === 'notes' && (
                        <div className="tab-pane">
                          <p className="tab-label">📖 Historical Notes:</p>
                          <p className="tab-description">
                            {[
                              { name: 'Brahmastra', notes: 'Creator of universes. Known users: Arjuna, Drona. Once used, destroys all life in target area. Most feared weapon in the Mahabharata.' },
                              { name: 'Agneyastra', notes: 'Fire arrow used frequently in battles. User: Drona taught this to many warriors. Can be counter-attacked by water astras like Varunastra.' },
                              { name: 'Varunastra', notes: 'Water element weapon of great power. Used to flood battlefields. Counters fire-based astras. Associated with Lord Varuna.' },
                              { name: 'Vayavyastra', notes: 'Wind storm weapon. Creates chaos. Cannot be controlled once released. Mentioned in various battle descriptions.' },
                              { name: 'Narayanastra', notes: 'Celestial weapon from Lord Narayana. Multiplies with each counter-attack. Cannot be defeated by conventional means.' },
                              { name: 'Pashupatastra', notes: 'Lord Shiva\'s weapon. Incredibly rare and powerful. Used only in dire circumstances. One of the most destructive forces known.' },
                              { name: 'Indrastra', notes: 'King of gods\' weapon. Lightning-based power. Never misses target. Associated with Lord Indra and thunderstorms.' },
                              { name: 'Soma Astra', notes: 'Moon god\'s weapon. Grants advantage during night. Has healing properties. Used by nocturnal warriors.' },
                            ].find(a => a.name === currentAstra)?.notes || ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sacred Symbol */}
                  <div className="sacred-symbol">
                    <p className="symbol-text">🕉️</p>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="astras-bottom-bar">
              <button 
                className="action-btn nav-prev" 
                title="Previous Astra"
                onClick={navigateToPreviousAstra}
                disabled={astraList.findIndex(a => a.name === currentAstra) === 0}
              >
                ⬅️ Prev
              </button>
              <button 
                className={`action-btn bookmark-btn ${bookmarkedAstras.includes(currentAstra) ? 'bookmarked' : ''}`}
                title={bookmarkedAstras.includes(currentAstra) ? 'Remove Bookmark' : 'Bookmark this Astra'}
                onClick={toggleBookmarkAstra}
              >
                {bookmarkedAstras.includes(currentAstra) ? '⭐ Bookmarked' : '☆ Bookmark'}
              </button>
              <button 
                className="action-btn" 
                onClick={() => setCurrentMode('chat')} 
                title="Return to Chat Mode"
              >
                🏠 Home
              </button>
              <button 
                className="action-btn next-btn" 
                title="Next Astra"
                onClick={navigateToNextAstra}
                disabled={astraList.findIndex(a => a.name === currentAstra) === astraList.length - 1}
              >
                Next ➡️
              </button>
            </div>

          </div>
        )}

        {/* ============ VIDYA TRAINING - FULL SCREEN MODE WITH LIVE CAMERA ============ */}
        {currentMode === 'vidya' && currentVidya === 'dhyana' && (
          <DhyanaMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'khadga' && (
          <KhadgaMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'dhanur' && (
          <DhanurMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'dharma' && (
          <DharmaMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'yudha' && (
          <YudhaMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'shastra' && (
          <ShastraMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {currentMode === 'vidya' && currentVidya === 'gada' && (
          <GadaMode 
            studentName={studentName} 
            askDrona={(msg) => { setQuestion(msg); setTimeout(askDrona, 100); }}
            chatHistory={chatHistory}
            isLoading={loading}
            vidyaMode={currentVidya}
          />
        )}

        {/* ============ VIDYA TRAINING UI - SPLIT SCREEN DESIGN ============ */}
        {currentMode === 'vidya' && vidyaMode && (
          <div className="vidya-split-container">
            {/* LEFT PANEL - CONTENT DISPLAY */}
            <div className="vidya-left-panel">
              {/* HEADER */}
              <div className="vidya-training-header">
                <div className="header-title">
                  <span className="mode-icon">{vidyaMode === 'learn' ? '📚' : '🎯'}</span>
                  <div className="header-text">
                    <h2>{currentVidya.toUpperCase()}</h2>
                    <p>{vidyaMode === 'learn' ? 'Learning Mode' : 'Testing Mode'}</p>
                  </div>
                </div>
                <button 
                  className="btn-exit-vidya" 
                  onClick={() => {
                    setCurrentMode('chat');
                    setShowVidyaSelector(false);
                    setVidyaMode('');
                    setCurrentVidya('');
                  }}
                >
                  ✕ Exit
                </button>
              </div>

              {/* MODE-SPECIFIC PROGRESS BAR */}
              {vidyaMode === 'learn' && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span className="progress-title">📖 Lessons Completed</span>
                    <span className="progress-count">{chatHistory.filter(msg => (msg.role || msg.type) === 'guru').length} lessons</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${Math.min((chatHistory.filter(msg => (msg.role || msg.type) === 'guru').length / 10) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              )}

              {vidyaMode === 'test' && (
                <div className="test-header-stats">
                  <div className="stat-card">
                    <span className="stat-label">Score</span>
                    <span className="stat-value">{vidyaTestScore}<small>/10</small></span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Accuracy</span>
                    <span className="stat-value">{Math.round((vidyaTestScore / 10) * 100)}<small>%</small></span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Questions</span>
                    <span className="stat-value">{chatHistory.filter(msg => (msg.role || msg.type) === 'guru').length}<small>/10</small></span>
                  </div>
                </div>
              )}

              {/* CONTENT AREA */}
              <div className="vidya-content-main">
                {vidyaMode === 'learn' && (
                  <div className="lesson-display">
                    <div className="lesson-content">
                      {chatHistory.filter(msg => (msg.role || msg.type) === 'guru').length > 0 ? (
                        chatHistory.filter(msg => (msg.role || msg.type) === 'guru').slice(-1).map((msg, idx) => (
                          <div key={idx} className="lesson-text-animate">
                            {msg.content || msg.text}
                          </div>
                        ))
                      ) : (
                        <div className="lesson-placeholder">
                          <p>👨‍🏫 Drona is ready to teach you...</p>
                          <p><small>Ask a question to start your {currentVidya} learning journey</small></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {vidyaMode === 'test' && (
                  <div className="question-display">
                    <div className="question-content">
                      {chatHistory.filter(msg => (msg.role || msg.type) === 'guru').length > 0 ? (
                        chatHistory.filter(msg => (msg.role || msg.type) === 'guru').slice(-1).map((msg, idx) => (
                          <div key={idx} className="question-text-animate">
                            <p className="question-prompt">❓ Question</p>
                            {msg.content || msg.text}
                          </div>
                        ))
                      ) : (
                        <div className="question-placeholder">
                          <p>🎯 Ready to test your knowledge?</p>
                          <p><small>Answer questions to assess your {currentVidya} mastery</small></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* FOOTER - ACTION BUTTONS */}
              <div className="vidya-content-footer">
                {vidyaMode === 'learn' && (
                  <button 
                    className="btn-action btn-next-lesson"
                    onClick={() => {
                      setQuestion(`What's the next concept I should learn in ${currentVidya}?`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    <span className="btn-icon">➡️</span>
                    <span className="btn-text">{loading ? 'Loading...' : 'Next Lesson'}</span>
                  </button>
                )}
                {vidyaMode === 'test' && (
                  <button 
                    className="btn-action btn-next-question"
                    onClick={() => {
                      setQuestion(`Next question please`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    <span className="btn-icon">➡️</span>
                    <span className="btn-text">{loading ? 'Loading...' : 'Next Question'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT PANEL - CHAT/INTERACTION */}
            <div className="vidya-right-panel">
              {/* CHAT HEADER */}
              <div className="chat-header">
                <h3>💬 Interaction with Drona</h3>
                <div className="mode-switch-buttons">
                  <button
                    className={`mode-toggle ${vidyaMode === 'learn' ? 'active' : ''}`}
                    onClick={() => setVidyaMode('learn')}
                  >
                    📖 Learn
                  </button>
                  <button
                    className={`mode-toggle ${vidyaMode === 'test' ? 'active' : ''}`}
                    onClick={() => setVidyaMode('test')}
                  >
                    🎯 Test
                  </button>
                </div>
              </div>

              {/* CHAT HISTORY */}
              <div className="chat-history">
                {chatHistory.length === 0 ? (
                  <div className="chat-empty">
                    <p>No conversation yet</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => {
                    const role = msg.role || msg.type;
                    const content = msg.content || msg.text;
                    return (
                      <div key={idx} className={`chat-message ${role}`}>
                        <div className="message-avatar">
                          {role === 'guru' ? '🧙' : '👤'}
                        </div>
                        <div className="message-content">
                          <p>{content}</p>
                          <span className="message-time">
                            {msg.timestamp && typeof msg.timestamp === 'string' ? msg.timestamp : new Date().toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div className="chat-message guru loading-message">
                    <div className="message-avatar">🧙</div>
                    <div className="message-content">
                      <div className="loading-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QUICK ACTION BUTTONS */}
              {vidyaMode === 'learn' && (
                <div className="quick-actions">
                  <button 
                    className="quick-btn"
                    onClick={() => {
                      setQuestion(`Tell me more about the last concept you explained`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    📖 More Details
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => {
                      setQuestion(`Can you give me an example of this?`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    💡 Examples
                  </button>
                </div>
              )}

              {vidyaMode === 'test' && (
                <div className="quick-actions">
                  <button 
                    className="quick-btn"
                    onClick={() => {
                      setQuestion(`Can you explain the correct answer?`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    🤔 Explain
                  </button>
                  <button 
                    className="quick-btn"
                    onClick={() => {
                      setQuestion(`I want to learn more about this topic`);
                      askDrona();
                    }}
                    disabled={loading}
                  >
                    📚 Learn More
                  </button>
                </div>
              )}

              {/* INPUT AREA */}
              <div className="chat-input-area">
                {vidyaMode === 'learn' && (
                  <input
                    type="text"
                    className="chat-input"
                    placeholder="Ask Drona anything about this topic..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        askDrona();
                      }
                    }}
                    disabled={loading}
                  />
                )}
                {vidyaMode === 'test' && (
                  <textarea
                    className="chat-input"
                    placeholder="Type your answer here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey && !loading) {
                        handleTestSubmit();
                      }
                    }}
                    disabled={loading}
                    rows={3}
                  />
                )}
                <div className="input-button-group">
                  {vidyaMode === 'learn' ? (
                    <button 
                      className="btn-send"
                      onClick={askDrona}
                      disabled={loading || !question.trim()}
                    >
                      📤 Ask
                    </button>
                  ) : (
                    <button 
                      className="btn-send btn-submit"
                      onClick={() => {
                        if (question.trim()) {
                          setVidyaTestAnswers([...vidyaTestAnswers, question]);
                          setVidyaTestScore(vidyaTestScore + 1);
                          askDrona();
                          setQuestion('');
                        }
                      }}
                      disabled={loading || !question.trim()}
                    >
                      ✅ Submit Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentMode !== 'quiz' && (
          <div className="input-box">
            <input
              type="text"
              placeholder={currentMode === 'story' ? 'Ask Ithihaasa: "Tell me a story about..." or "Continue"' : 'Ask your question here...'}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  askDrona();
                }
              }}
            />
            <button 
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={loading}
              title={isListening ? "Stop listening (🛑)" : "Click to speak (🎤)"}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
            <button onClick={() => askDrona()} disabled={loading}>
              {loading ? "🙏 Thinking..." : "Ask Guru"}
            </button>
          </div>
        )}

        <footer>
          <span>✨ Powered by Ollama + DRONA RAG Engine</span>
          <br />
          <span>Multilingual AI · Ancient Knowledge · Modern Intelligence</span>
        </footer>
      </div>
    </div>
    </div>

  );
}

export default App;

