package com.farmai.app

import android.content.Context
import android.webkit.JavascriptInterface
import android.graphics.BitmapFactory
import android.util.Base64
import org.json.JSONObject

class JSBridge(private val context: Context) {

    // Initialize our helper classes
    private val classifier = TFLiteClassifier(context)
    private val repository = AdviceRepository(context)
    private val tts = TTSManager(context)

    /**
     * 1. THE MAIN FUNCTION
     * Called from React as: window.Android.detectDisease("corn", "base64String...", "en")
     */
    @JavascriptInterface
    fun detectDisease(cropName: String, base64Image: String, languageCode: String): String {
        try {
            // A. Load the correct model (e.g., "corn_model.tflite")
            classifier.loadModel(cropName)

            // B. Clean the Base64 String (Remove "data:image/jpeg;base64," prefix if present)
            val cleanBase64 = if (base64Image.contains(",")) {
                base64Image.split(",")[1]
            } else {
                base64Image
            }

            // C. Convert Base64 String -> Bitmap Image
            val decodedBytes = Base64.decode(cleanBase64, Base64.DEFAULT)
            val bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)

            // D. Run AI Inference
            val predictedLabel = classifier.predict(bitmap)

            // E. Get Advice from Database
            // Returns a JSON string { "disease_name":..., "causes":..., "cures":... }
            val adviceJsonString = repository.getAdvice(predictedLabel, languageCode)

            return adviceJsonString

        } catch (e: Exception) {
            e.printStackTrace()
            // Return an error JSON if something crashes
            return "{ \"error\": \"${e.message}\" }"
        }
    }

    /**
     * 2. VOICE: Speak text
     * Called from React as: window.Android.speak("Hello farmer")
     */
    @JavascriptInterface
    fun speak(text: String) {
        tts.speak(text)
    }

    /**
     * 3. VOICE: Stop speaking
     */
    @JavascriptInterface
    fun stopSpeaking() {
        tts.stop()
    }
}