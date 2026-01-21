// Language service
const languages = {
    en: { code: 'en', name: 'English', icon: '🇺🇸' },
    te: { code: 'te', name: 'తెలుగు', icon: '🇮🇳' },
    hi: { code: 'hi', name: 'हिन्दी', icon: '🇮🇳' }
};

const translations = {
    en: {
        welcome: "Welcome to Farm AI",
        selectCrop: "Select Your Crop",
        captureImage: "Capture Image",
        takePhoto: "Take Photo",
        chooseGallery: "Choose from Gallery",
        diseaseDetected: "Disease Detected",
        confidence: "Confidence",
        causes: "Causes",
        treatment: "Treatment",
        suggestions: "Suggestions",
        speakAdvice: "Speak Advice",
        goBack: "Go Back",
        tomato: "Tomato",
        potato: "Potato",
        corn: "Corn",
        rice: "Rice"
    },
    te: {
        welcome: "ఫార్మ్ AI కి స్వాగతం",
        selectCrop: "మీ పంటను ఎంచుకోండి",
        captureImage: "ఇమేజ్ క్యాప్చర్ చేయండి",
        takePhoto: "ఫోటో తీయండి",
        chooseGallery: "గ్యాలరీ నుండి ఎంచుకోండి",
        diseaseDetected: "వ్యాధి గుర్తించబడింది",
        confidence: "నమ్మకం",
        causes: "కారణాలు",
        treatment: "చికిత్స",
        suggestions: "సూచనలు",
        speakAdvice: "సలహాను మాట్లాడండి",
        goBack: "వెనక్కి వెళ్ళండి",
        tomato: "టమోటో",
        potato: "బంగాళాదుంప",
        corn: "మొక్కజొన్న",
        rice: "వరి"
    },
    hi: {
        welcome: "फार्म AI में आपका स्वागत है",
        selectCrop: "अपनी फसल चुनें",
        captureImage: "छवि कैप्चर करें",
        takePhoto: "फोटो लें",
        chooseGallery: "गैलरी से चुनें",
        diseaseDetected: "रोग का पता चला",
        confidence: "विश्वास",
        causes: "कारण",
        treatment: "इलाज",
        suggestions: "सुझाव",
        speakAdvice: "सलाह बोलें",
        goBack: "वापस जाएं",
        tomato: "टमाटर",
        potato: "आलू",
        corn: "मक्का",
        rice: "चावल"
    }
};

const languageService = {
    getLanguages() {
        return languages;
    },
    
    getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    },
    
    setLanguage(langCode) {
        localStorage.setItem('language', langCode);
        if (window.nativeBridge) {
            window.nativeBridge.setCurrentLanguage(langCode);
        }
    },
    
    translate(key) {
        const lang = this.getCurrentLanguage();
        return translations[lang]?.[key] || key;
    }
};

export default languageService;