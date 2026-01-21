package com.farmmate.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Enable debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Add JSBridge to WebView
        getBridge().getWebView().post(() -> {
            WebView webView = getBridge().getWebView();
            JSBridge jsBridge = new JSBridge(this, webView);
            webView.addJavascriptInterface(jsBridge, "Android");
            
            // Test connection
            webView.evaluateJavascript("window.AndroidBridge = window.Android || {};", null);
        });
    }
}