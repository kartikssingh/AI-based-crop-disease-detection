import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Capture from './pages/Capture'
import Result from './pages/Result'

function App() {
  return (
    <div className="min-h-screen bg-green-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/capture" element={<Capture />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  )
}

export default App
