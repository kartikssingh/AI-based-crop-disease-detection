package com.farmai.app

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class TTSManager(context: Context) {

    private var tts: TextToSpeech? = null
    private var isLoaded = false

    init {
        // Initialize Android's native Text-To-Speech engine
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Set default language to English (India)
                // You can change this dynamically later if you have Hindi/Telugu strings
                val result = tts?.setLanguage(Locale("en", "IN"))

                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    println("TTS: Language not supported")
                } else {
                    isLoaded = true
                }
            } else {
                println("TTS: Initialization failed")
            }
        }
    }

    // 1. Speak the text
    fun speak(text: String) {
        if (isLoaded) {
            // QUEUE_FLUSH means "Interrupt whatever is currently being said and say this instead"
            tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    // 2. Stop speaking (e.g., when user leaves the screen)
    fun stop() {
        tts?.stop()
    }

    // 3. Clean up memory
    fun shutdown() {
        tts?.shutdown()
    }
}