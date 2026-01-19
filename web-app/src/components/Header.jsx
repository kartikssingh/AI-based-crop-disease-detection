import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Header({ title, subtitle, showBack = false }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3">
      <div className="flex items-center">
        {/* Back Button */}
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mr-3 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Title */}
        <div className="flex-1">
          <h1 className="text-white text-lg font-bold">{title}</h1>
          {subtitle && (
            <p className="text-white/90 text-xs">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}