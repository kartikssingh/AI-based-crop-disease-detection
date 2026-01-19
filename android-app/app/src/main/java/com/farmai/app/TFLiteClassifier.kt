package com.farmai.app

import android.content.Context
import android.graphics.Bitmap
import org.tensorflow.lite.Interpreter
import org.tensorflow.lite.support.common.FileUtil
import java.nio.ByteBuffer

class TFLiteClassifier(private val context: Context) {

    private var interpreter: Interpreter? = null
    private var labels: List<String> = emptyList()
    private val preprocessor = ImagePreprocessor() // This calls your helper file

    // 1. Load Model dynamically based on Crop Name
    fun loadModel(cropName: String) {
        try {
            val modelName = "${cropName}_model.tflite"
            val labelName = "${cropName}_labels.txt"

            // Load TFLite Model from assets
            val mappedByteBuffer = FileUtil.loadMappedFile(context, modelName)
            val options = Interpreter.Options()
            interpreter = Interpreter(mappedByteBuffer, options)

            // Load Labels from assets
            labels = FileUtil.loadLabels(context, labelName)

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // 2. The Prediction Logic
    fun predict(bitmap: Bitmap): String {
        if (interpreter == null) return "Error: Model not loaded"

        // A. Preprocess: Resize & Normalize
        val inputBuffer: ByteBuffer = preprocessor.convertBitmapToByteBuffer(preprocessor.resizeBitmap(bitmap))

        // B. Output Buffer: Holds probabilities
        val outputBuffer = Array(1) { FloatArray(labels.size) }

        // C. Run Inference
        interpreter?.run(inputBuffer, outputBuffer)

        // D. Find the highest probability
        val result = outputBuffer[0]
        var maxIndex = -1
        var maxProb = 0.0f

        for (i in result.indices) {
            if (result[i] > maxProb) {
                maxProb = result[i]
                maxIndex = i
            }
        }

        return if (maxIndex != -1) {
            labels[maxIndex] // e.g., "Potato___Early_blight"
        } else {
            "Unknown Disease"
        }
    }

    fun close() {
        interpreter?.close()
    }
}