import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Camera, Upload, Zap, Image, X } from 'lucide-react'

export default function Capture() {
  const navigate = useNavigate()
  const [imagePreview, setImagePreview] = useState(null)
  const [sourceType, setSourceType] = useState('camera') // 'camera' or 'gallery'

  const handleCapture = () => {
    // For demo - simulate image capture
    setImagePreview('demo-image')
    setSourceType('camera')
    // In real app: Launch camera via bridge
  }

  const handleGalleryPick = () => {
    // For demo - simulate gallery pick
    setImagePreview('gallery-image')
    setSourceType('gallery')
    // In real app: Launch gallery picker via bridge
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
  }

  const handleAnalyze = () => {
    if (imagePreview) {
      navigate('/result')
    } else {
      alert('Please capture or select an image first')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Scan Crop"
        subtitle="Capture or select leaf image"
        showBack={true}
      />

      <div className="flex-1 p-4 space-y-4 overflow-hidden">
        {/* Source Selection */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSourceType('camera')}
            className={`
              flex-1 h-12 rounded-lg flex items-center justify-center
              ${sourceType === 'camera' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
              }
            `}
          >
            <Camera className="w-4 h-4 mr-2" />
            Camera
          </button>
          
          <button
            onClick={() => setSourceType('gallery')}
            className={`
              flex-1 h-12 rounded-lg flex items-center justify-center
              ${sourceType === 'gallery' 
                ? 'bg-emerald-500 text-white' 
                : 'bg-gray-100 text-gray-700 border border-gray-200'
              }
            `}
          >
            <Image className="w-4 h-4 mr-2" />
            Gallery
          </button>
        </div>

        {/* Camera/Gallery Preview */}
        <div className="relative">
          <div className="w-full h-64 bg-gradient-to-b from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg">
            {imagePreview ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Preview Image */}
                  <div className="w-56 h-56 rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-300/20 border-2 border-white/20 flex items-center justify-center">
                    <div className="text-5xl">🍃</div>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  {/* Source Indicator */}
                  <div className="absolute -top-2 -left-2 px-2 py-1 bg-emerald-500 text-white text-xs rounded-full">
                    {sourceType === 'camera' ? '📸 Captured' : '🖼️ From Gallery'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center mx-auto mb-4">
                    {sourceType === 'camera' ? (
                      <Camera className="w-8 h-8 text-white/60" />
                    ) : (
                      <Image className="w-8 h-8 text-white/60" />
                    )}
                  </div>
                  <p className="text-white/70 text-sm">
                    {sourceType === 'camera' 
                      ? 'Ready to capture leaf image' 
                      : 'Select leaf image from gallery'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {!imagePreview ? (
            <>
              {sourceType === 'camera' ? (
                <button
                  onClick={handleCapture}
                  className="w-full h-12 rounded-lg bg-white border-2 border-emerald-500 text-emerald-700 font-semibold flex items-center justify-center shadow-sm"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture Image
                </button>
              ) : (
                <button
                  onClick={handleGalleryPick}
                  className="w-full h-12 rounded-lg bg-white border-2 border-emerald-500 text-emerald-700 font-semibold flex items-center justify-center shadow-sm"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Pick from Gallery
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleAnalyze}
              className="w-full h-12 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-semibold flex items-center justify-center shadow-md"
            >
              <Zap className="w-5 h-5 mr-2" />
              Analyze Disease
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center mr-2">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Best Results</h3>
              <p className="text-xs text-gray-500">For accurate detection</p>
            </div>
          </div>
          
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1 mr-2"></div>
              Clear, well-lit leaf images
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1 mr-2"></div>
              Focus on affected areas
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1 mr-2"></div>
              Avoid blurry photos
            </li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">100%</div>
            <div className="text-xs text-gray-500">Offline</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">3</div>
            <div className="text-xs text-gray-500">Languages</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <div className="text-sm font-bold text-emerald-600">AI</div>
            <div className="text-xs text-gray-500">Powered</div>
          </div>
        </div>
      </div>
    </div>
  )
}