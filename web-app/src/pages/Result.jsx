import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Volume2, Shield, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react'
import nativeBridge from '../services/nativeBridge'
import { useState, useEffect } from 'react'
import languageService from '../services/languageService'  // ADD THIS IMPORT

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const { result, image, crop } = location.state || {}  // ADDED crop from state
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState('en')

  // Get language from localStorage or default to 'en'
  useEffect(() => {
    const lang = localStorage.getItem('selectedLanguage') || 'en'
    setCurrentLanguage(lang)
  }, [])

  // Default mock data if no result from capture
  const defaultResult = {
    disease: 'Early Blight',
    confidence: 92,
    crop: 'Tomato',
    advice_cause: 'Caused by fungus Alternaria solani. Spreads through rain splash and infected debris.',
    advice_cure: 'Apply fungicides like azoxystrobin or mancozeb. Remove infected leaves immediately.',
    advice_suggestions: 'Use mulch to prevent soil splash. Rotate crops regularly. Maintain proper spacing between plants.'
  }

  const displayResult = result || defaultResult

  const handleSpeak = () => {
    if (isSpeaking) {
      nativeBridge.stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      
      // Get localized text based on current language
      const speechText = languageService.getLocalizedText(
        displayResult.disease, 
        displayResult, 
        currentLanguage
      )
      
      // If languageService returns object, extract text
      const textToSpeak = typeof speechText === 'object' 
        ? `${speechText.disease || displayResult.disease}. ${speechText.cure || displayResult.advice_cure}`
        : speechText || `${displayResult.disease}. ${displayResult.advice_cure}`
      
      nativeBridge.speak(textToSpeak, currentLanguage)
      
      // Reset speaking state after 10 seconds
      setTimeout(() => {
        setIsSpeaking(false)
      }, 10000)
    }
  }

  const handleRestart = () => {
    nativeBridge.stopSpeaking()
    navigate('/')
  }

  useEffect(() => {
    // Cleanup speech when component unmounts
    return () => {
      nativeBridge.stopSpeaking()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Diagnosis Complete"
        subtitle="AI-based offline analysis"
        showBack={true}
      />

      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Success Indicator */}
        <div className="text-center py-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 mb-3 shadow-md">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Analysis Complete</h3>
          <p className="text-sm text-gray-500">Results ready in 2.3 seconds</p>
        </div>

        {/* Image Preview if available */}
        {image && (
          <div className="bg-white rounded-xl p-2 border border-gray-100 shadow-sm">
            <img 
              src={image} 
              alt="Analyzed Leaf" 
              className="w-full h-40 object-cover rounded-lg"
            />
            {/* Display crop info if available */}
            {crop && (
              <div className="mt-2 text-center">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                  {crop.charAt(0).toUpperCase() + crop.slice(1)} Leaf
                </span>
              </div>
            )}
          </div>
        )}

        {/* Disease Card - Beautiful Design */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-500"></div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Detected Disease</span>
                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  {displayResult.disease?.replace(/_/g, ' ')}
                </h2>
                <p className="text-sm text-gray-500">
                  {(crop || displayResult.crop || 'Tomato').charAt(0).toUpperCase() + (crop || displayResult.crop || 'Tomato').slice(1)} • Leaf Disease
                </p>
              </div>
            </div>
            
            {/* Confidence Badge */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">
                  {displayResult.confidence}{displayResult.confidence.toString().includes('%') ? '' : '%'}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Confidence</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                style={{ 
                  width: `${typeof displayResult.confidence === 'number' 
                    ? displayResult.confidence 
                    : parseInt(displayResult.confidence) || 50}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span className="font-medium">High Accuracy</span>
            </div>
          </div>
        </div>

        {/* Treatment Plan - Beautiful Design */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Recommended Treatment</h3>
              <p className="text-sm text-gray-500">Follow these instructions</p>
            </div>
          </div>
          
          {/* Treatment Content - Dynamic from result */}
          <div className="space-y-3">
            {displayResult.advice_cure && (
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">
                  {displayResult.advice_cure}
                </p>
              </div>
            )}
            
            {displayResult.advice_suggestions && (
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">
                  {displayResult.advice_suggestions}
                </p>
              </div>
            )}
            
            {displayResult.advice_cause && (
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-700">
                  <strong>Causes:</strong> {displayResult.advice_cause}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Beautiful Design */}
        <div className="space-y-3 pt-2">
          {/* Voice Button */}
          <button
            onClick={handleSpeak}
            className={`
              w-full h-14 rounded-xl
              ${isSpeaking 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-500' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-500'
              }
              text-white text-base font-semibold
              shadow-md hover:shadow-lg
              transition-all duration-150
              flex items-center justify-center
            `}
          >
            <Volume2 className="w-5 h-5 mr-3" />
            {isSpeaking ? 'Stop Listening' : 'Listen in Local Language'}
          </button>

          {/* Restart Button */}
          <button
            onClick={handleRestart}
            className="
              w-full h-14 rounded-xl
              border-2 border-emerald-500
              text-emerald-700 text-base font-semibold
              hover:bg-emerald-50
              transition-colors duration-150
              flex items-center justify-center
            "
          >
            <RotateCcw className="w-5 h-5 mr-3" />
            Diagnose Another Crop
          </button>
        </div>
      </div>
    </div>
  )
}