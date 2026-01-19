export default function Result() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Diagnosis Result</h2>

      <p><strong>Crop:</strong> Tomato</p>
      <p><strong>Disease:</strong> Early Blight</p>
      <p><strong>Confidence:</strong> 92%</p>

      <div className="mt-4 p-3 bg-white rounded shadow">
        Remove infected leaves and apply organic fungicide.
      </div>
    </div>
  )
}
