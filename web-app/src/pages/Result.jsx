import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { Volume2, Shield, AlertTriangle, RotateCcw, CheckCircle } from 'lucide-react'

export default function Result() {
  const navigate = useNavigate()

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
                <h2 className="text-xl font-bold text-gray-800 mt-1">Early Blight</h2>
                <p className="text-sm text-gray-500">Tomato • Leaf Disease</p>
              </div>
            </div>
            
            {/* Confidence Badge */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center">
                <span className="text-lg font-bold text-red-600">92%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Confidence</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                style={{ width: '92%' }}
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
          
          {/* Treatment Content */}
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-700">
                Remove infected leaves immediately and dispose them properly
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-700">
                Apply organic fungicide every 7 days for effective control
              </p>
            </div>
            
            <div className="flex items-start">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mr-3 mt-0.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
              <p className="text-sm text-gray-700">
                Maintain proper spacing between plants for air circulation
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Beautiful Design */}
        <div className="space-y-3 pt-2">
          {/* Voice Button */}
          <button
            className="
              w-full h-14 rounded-xl
              bg-gradient-to-r from-blue-600 to-indigo-500
              text-white text-base font-semibold
              shadow-md hover:shadow-lg
              transition-shadow duration-150
              flex items-center justify-center
            "
          >
            <Volume2 className="w-5 h-5 mr-3" />
            Listen in Local Language
          </button>

          {/* Restart Button */}
          <button
            onClick={() => navigate('/')}
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