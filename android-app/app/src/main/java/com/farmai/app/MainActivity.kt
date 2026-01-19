package com.farmai.app

import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // 1. Find the WebView from our layout
        val webView = findViewById<WebView>(R.id.webView)

        // 2. Configure Settings
        val settings = webView.settings
        settings.javaScriptEnabled = true  // Essential for React
        settings.domStorageEnabled = true  // Essential for saving data locally
        settings.allowFileAccess = true

        // 3. Connect the "Bridge"
        // This allows JavaScript to call window.Android.detectDisease()
        webView.addJavascriptInterface(JSBridge(this), "Android")

        // 4. Set Clients (Keeps navigation inside the app, not opening Chrome)
        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        // 5. Load the Web App
        // NOTE: This file does not exist yet! We will create it in the next phase.
        webView.loadUrl("file:///android_asset/index.html")
    }
}