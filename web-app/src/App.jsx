import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Result from './pages/Result'
import nativeBridge from './services/nativeBridge'

function App() {
  // Initialize native bridge globally
  if (typeof window !== 'undefined') {
    window.nativeBridge = nativeBridge
    
    // Test Android connection
    setTimeout(() => {
      if (window.nativeBridge.isAndroid) {
        console.log('✅ Android bridge initialized successfully')
        window.nativeBridge.testConnection()
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Android App Container */}
      <div className="w-full max-w-md mx-auto min-h-screen bg-white shadow-sm">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </div>
    </div>
  )
}

export default App