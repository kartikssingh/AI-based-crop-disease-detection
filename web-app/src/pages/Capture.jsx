import { useNavigate } from 'react-router-dom'

export default function Capture() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">
        Capture Crop Image
      </h2>

      <div className="h-64 bg-gray-300 rounded mb-4 flex items-center justify-center">
        Camera Preview (placeholder)
      </div>

      <button
        onClick={() => navigate('/result')}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Analyze Image
      </button>
    </div>
  )
}
