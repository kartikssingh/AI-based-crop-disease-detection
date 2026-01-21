import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Globe } from 'lucide-react'
// ADD THIS IMPORT
import cropService from '../services/cropService'

const crops = [
  { 
    name: 'Tomato', 
    id: 'tomato',  // ADD THIS LINE
    emoji: '🍅',
    color: 'bg-gradient-to-br from-rose-50 via-white to-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    iconColor: 'bg-rose-100'
  },
  { 
    name: 'Potato', 
    id: 'potato',  // ADD THIS LINE
    emoji: '🥔',
    color: 'bg-gradient-to-br from-amber-50 via-white to-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'bg-amber-100'
  },
  { 
    name: 'Maize', 
    id: 'corn',  // CHANGE THIS: 'maize' → 'corn'
    emoji: '🌽',
    color: 'bg-gradient-to-br from-yellow-50 via-white to-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'bg-yellow-100'
  },
  { 
    name: 'Rice', 
    id: 'rice',  // ADD THIS LINE
    emoji: '🌾',
    color: 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'bg-emerald-100'
  },
]

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
]

export default function Home() {
  const navigate = useNavigate()
  const [selectedLang, setSelectedLang] = useState('en')

  const selectedLanguage = languages.find(lang => lang.code === selectedLang)

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="FarmMate AI"
        subtitle="Offline Crop Disease Detection"
        showBack={false}
      />

      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center mr-3">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h3 className="text-gray-800 font-bold">Welcome Farmer</h3>
              <p className="text-gray-600 text-xs">Select crop to diagnose diseases</p>
            </div>
          </div>
        </div>

        {/* Crop Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-gray-800 font-bold text-lg">Select Crop</h2>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
              {crops.length} crops
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {crops.map((crop) => (
              <button
                key={crop.name}
                // CHANGE THIS LINE - ADD CROP SERVICE
                onClick={() => {
                  cropService.setCurrentCrop(crop.id);  // Use crop.id instead of name
                  navigate('/capture');
                }}
                className={`
                  h-32 rounded-xl ${crop.color}
                  border ${crop.borderColor}
                  flex flex-col items-center justify-center
                  shadow-sm
                  active:bg-gray-50
                `}
              >
                <div className={`w-12 h-12 rounded-lg ${crop.iconColor} flex items-center justify-center mb-2`}>
                  <span className="text-2xl">{crop.emoji}</span>
                </div>
                <div className={`text-base font-bold ${crop.textColor}`}>{crop.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">2s</div>
            <div className="text-xs text-gray-500">Scan</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">100%</div>
            <div className="text-xs text-gray-500">Offline</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">AI</div>
            <div className="text-xs text-gray-500">Powered</div>
          </div>
        </div>

        {/* Language Selector - Takes minimal space */}
        <div className="mt-auto pt-2">
          <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-100 shadow-sm">
            <div className="flex items-center">
              <Globe className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-xs text-gray-600">Language:</span>
            </div>
            
            <div className="flex space-x-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`
                    px-2 py-1 rounded text-xs font-medium transition-colors
                    ${selectedLang === lang.code 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  {lang.flag} {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}