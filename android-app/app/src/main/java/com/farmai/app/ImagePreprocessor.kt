package com.farmai.app

import android.graphics.Bitmap
import java.nio.ByteBuffer
import java.nio.ByteOrder

class ImagePreprocessor {

    // Configuration must match your Python training script!
    private val MODEL_INPUT_SIZE = 224
    private val BATCH_SIZE = 1
    private val PIXEL_SIZE = 3 // RGB
    private val FLOAT_SIZE = 4 // Float32

    /**
     * 1. RESIZE: Scales the huge camera image down to 224x224
     */
    fun resizeBitmap(originalImage: Bitmap): Bitmap {
        return Bitmap.createScaledBitmap(originalImage, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE, true)
    }

    /**
     * 2. CONVERT: Turns the image into a ByteBuffer for TFLite
     */
    fun convertBitmapToByteBuffer(bitmap: Bitmap): ByteBuffer {
        val byteBuffer = ByteBuffer.allocateDirect(
            BATCH_SIZE * MODEL_INPUT_SIZE * MODEL_INPUT_SIZE * PIXEL_SIZE * FLOAT_SIZE
        )
        byteBuffer.order(ByteOrder.nativeOrder())

        val intValues = IntArray(MODEL_INPUT_SIZE * MODEL_INPUT_SIZE)
        bitmap.getPixels(intValues, 0, bitmap.width, 0, 0, bitmap.width, bitmap.height)

        var pixel = 0
        for (i in 0 until MODEL_INPUT_SIZE) {
            for (j in 0 until MODEL_INPUT_SIZE) {
                val validPixel = intValues[pixel++]

                // Extract R-G-B and Normalize (0-255 -> 0.0-1.0)
                // This math MUST match your Python training normalization!
                val r = (validPixel shr 16 and 0xFF)
                val g = (validPixel shr 8 and 0xFF)
                val b = (validPixel and 0xFF)

                byteBuffer.putFloat(r / 255.0f)
                byteBuffer.putFloat(g / 255.0f)
                byteBuffer.putFloat(b / 255.0f)
            }
        }
        return byteBuffer
    }
}