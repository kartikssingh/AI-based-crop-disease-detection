package com.farmmate.app;

import android.os.Bundle;
import android.content.Intent;
import android.webkit.WebView;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "FarmMateMainActivity";
    private JSBridge jsBridge;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        Log.d(TAG, "🚀 MainActivity onCreate");
        
        // Enable debugging
        WebView.setWebContentsDebuggingEnabled(true);
        
        // Add JSBridge to WebView
        getBridge().getWebView().post(() -> {
            WebView webView = getBridge().getWebView();
            jsBridge = new JSBridge(this, webView);
            webView.addJavascriptInterface(jsBridge, "Android");
            
            Log.d(TAG, "✅ JSBridge added to WebView");
            
            // Test connection
            webView.evaluateJavascript("window.AndroidBridge = window.Android || {};", null);
        });
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        Log.d(TAG, "📸 onActivityResult called");
        Log.d(TAG, "   Request Code: " + requestCode);
        Log.d(TAG, "   Result Code: " + resultCode);
        Log.d(TAG, "   Data: " + (data != null ? "has data" : "null"));
        
        if (resultCode == RESULT_OK) {
            if (requestCode == 1001) { // Camera request code
                Log.d(TAG, "✅ Camera photo received");
                if (jsBridge != null) {
                    if (data != null) {
                        jsBridge.handleImageResult(data, true); // true = from camera
                    } else {
                        Log.e(TAG, "❌ Camera data is null");
                        // Send error to JavaScript
                        sendErrorToJS("Camera returned no image");
                    }
                } else {
                    Log.e(TAG, "❌ JSBridge is null");
                }
            } else if (requestCode == 1002) { // Gallery request code
                Log.d(TAG, "✅ Gallery image selected");
                if (jsBridge != null) {
                    if (data != null && data.getData() != null) {
                        jsBridge.handleImageResult(data, false); // false = from gallery
                    } else {
                        Log.e(TAG, "❌ Gallery data is null");
                        sendErrorToJS("Gallery returned no image");
                    }
                } else {
                    Log.e(TAG, "❌ JSBridge is null");
                }
            }
        } else {
            Log.w(TAG, "⚠️ Activity result cancelled or failed");
            sendErrorToJS("Camera/gallery cancelled");
        }
    }
    
    private void sendErrorToJS(String error) {
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            final String jsError = "javascript:handleImageCaptured(null, '" + error + "')";
            webView.post(() -> {
                webView.evaluateJavascript(jsError, null);
            });
        }
    }
}