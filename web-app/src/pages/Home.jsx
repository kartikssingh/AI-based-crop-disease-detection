import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        🌾 Crop Disease Detection
      </h1>

      <button
        onClick={() => navigate('/capture')}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Start Diagnosis
      </button>
    </div>
  )
}
