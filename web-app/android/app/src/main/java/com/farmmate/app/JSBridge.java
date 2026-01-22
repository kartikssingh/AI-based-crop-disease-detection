package com.farmmate.app;

import android.util.Log;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import org.json.JSONObject;
import org.json.JSONException;

public class JSBridge {
    private static final String TAG = "FarmMateJSBridge";
    private Context context;
    private WebView webView;
    private TFLiteClassifier tfLiteClassifier;
    private AdviceRepository adviceRepository;
    private String currentCrop = "tomato";
    private String currentLanguage = "en";
    
    public JSBridge(Context context, WebView webView) {
        this.context = context;
        this.webView = webView;
        this.tfLiteClassifier = new TFLiteClassifier(context);
        this.adviceRepository = new AdviceRepository(context);
        Log.d(TAG, "✅ JSBridge initialized");
    }
    
    @JavascriptInterface
    public String testConnection() {
        Log.d(TAG, "🔗 testConnection called");
        return "JSBridge is working! Connected to Android";
    }
    
    @JavascriptInterface
    public void setCurrentCrop(String crop) {
        Log.d(TAG, "🌱 setCurrentCrop: " + crop);
        this.currentCrop = crop;
        Toast.makeText(context, "Crop set to: " + crop, Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public void setCurrentLanguage(String langCode) {
        Log.d(TAG, "🌐 Language set to: " + langCode);
        this.currentLanguage = langCode;
    }
    
    @JavascriptInterface
    public void openCamera() {
        Log.d(TAG, "📸 openCamera called");
        if (context instanceof AppCompatActivity) {
            AppCompatActivity activity = (AppCompatActivity) context;
            activity.runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    if (intent.resolveActivity(activity.getPackageManager()) != null) {
                        Log.d(TAG, "✅ Starting camera...");
                        activity.startActivityForResult(intent, 1001);
                    } else {
                        Log.e(TAG, "❌ No camera app found");
                        Toast.makeText(context, "No camera app found", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "❌ Camera error: " + e.getMessage());
                    Toast.makeText(context, "Camera error", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
    
    @JavascriptInterface
    public void openGallery() {
        Log.d(TAG, "🖼️ openGallery called");
        if (context instanceof AppCompatActivity) {
            AppCompatActivity activity = (AppCompatActivity) context;
            activity.runOnUiThread(() -> {
                try {
                    Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                    intent.setType("image/*");
                    Log.d(TAG, "✅ Starting gallery...");
                    activity.startActivityForResult(Intent.createChooser(intent, "Select Picture"), 1002);
                } catch (Exception e) {
                    Log.e(TAG, "❌ Gallery error: " + e.getMessage());
                    Toast.makeText(context, "Gallery error", Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
    
    @JavascriptInterface
    public String classifyImage(String base64Image, String cropType) {
        Log.d(TAG, "🎯 classifyImage called");
        Log.d(TAG, "📏 Image length: " + (base64Image != null ? base64Image.length() : 0));
        Log.d(TAG, "🌱 Crop type: " + cropType);
        
        try {
            // Decode base64 to bitmap
            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            
            if (bitmap == null) {
                Log.e(TAG, "❌ Failed to decode image");
                return getErrorResponse("Failed to decode image");
            }
            
            Log.d(TAG, "✅ Image decoded. Size: " + bitmap.getWidth() + "x" + bitmap.getHeight());
            
            // Resize to 224x224 (common ML input size)
            Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 224, 224, true);
            
            // Map maize to corn for model loading
            String modelCropType = cropType;
            if ("maize".equalsIgnoreCase(cropType)) {
                modelCropType = "corn";
                Log.d(TAG, "🌽 MAPPING: maize -> corn");
            }
            
            Log.d(TAG, "🤖 Calling TFLiteClassifier with crop: " + modelCropType);
            
            // Classify using TFLite - PASS THE MAPPED CROP TYPE
            String[] result = tfLiteClassifier.classifyImage(resizedBitmap, modelCropType);
            
            if (result == null || result.length < 2) {
                Log.e(TAG, "❌ Classification failed");
                return getErrorResponse("Classification failed");
            }
            
            String diseaseName = result[0];
            float confidence = Float.parseFloat(result[1]);
            
            Log.d(TAG, "✅ Classification successful!");
            Log.d(TAG, "🦠 Disease: " + diseaseName);
            Log.d(TAG, "📊 Confidence: " + confidence);
            
            // Get advice from database
            JSONObject advice = adviceRepository.getAdvice(modelCropType, diseaseName, currentLanguage);
            
            // Build response JSON
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("crop", modelCropType);  // Use mapped crop
            response.put("disease", diseaseName);
            response.put("confidence", Math.round(confidence * 100));
            
            if (advice != null) {
                response.put("advice_cause", advice.optString("cause", ""));
                response.put("advice_cure", advice.optString("cure", ""));
                response.put("advice_suggestions", advice.optString("suggestions", ""));
            }
            
            Log.d(TAG, "✅ Returning JSON response");
            return response.toString();
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Exception in classifyImage: " + e.getMessage());
            e.printStackTrace();
            return getErrorResponse("Error: " + e.getMessage());
        }
    }
    
    @JavascriptInterface
    public void speak(String text, String language) {
        Log.d(TAG, "🔊 TTS: " + text.substring(0, Math.min(50, text.length())) + "...");
        Toast.makeText(context, "TTS: " + text.substring(0, Math.min(50, text.length())) + "...", Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public void stopSpeaking() {
        Log.d(TAG, "🔇 TTS stop");
    }
    
    // Helper method to handle image capture result - UPDATED
    public void handleImageResult(Intent data, boolean fromCamera) {
        Log.d(TAG, "🖼️ handleImageResult - fromCamera: " + fromCamera);
        
        try {
            Bitmap bitmap = null;
            
            if (fromCamera) {
                // Camera returns thumbnail in extras
                if (data != null && data.getExtras() != null) {
                    bitmap = (Bitmap) data.getExtras().get("data");
                    Log.d(TAG, "📸 Got camera thumbnail");
                } else {
                    Log.e(TAG, "❌ Camera data is null");
                    sendErrorToJS("Camera returned no image");
                    return;
                }
            } else {
                // Gallery returns URI
                if (data != null && data.getData() != null) {
                    Uri selectedImage = data.getData();
                    Log.d(TAG, "🖼️ Loading gallery image from URI");
                    try {
                        bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), selectedImage);
                    } catch (SecurityException e) {
                        Log.e(TAG, "❌ Permission error: " + e.getMessage());
                        sendErrorToJS("Permission denied for gallery");
                        return;
                    }
                } else {
                    Log.e(TAG, "❌ Gallery data is null");
                    sendErrorToJS("Gallery returned no image");
                    return;
                }
            }
            
            if (bitmap != null) {
                Log.d(TAG, "✅ Image loaded. Size: " + bitmap.getWidth() + "x" + bitmap.getHeight());
                
                // Convert to base64
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 70, byteArrayOutputStream);
                byte[] byteArray = byteArrayOutputStream.toByteArray();
                String base64Image = Base64.encodeToString(byteArray, Base64.DEFAULT);
                
                Log.d(TAG, "📊 Base64 length: " + base64Image.length());
                
                // Send to JavaScript
                final String jsCode = "javascript:handleImageCaptured('data:image/jpeg;base64," + base64Image + "')";
                webView.post(() -> {
                    Log.d(TAG, "🔄 Sending to JavaScript...");
                    webView.evaluateJavascript(jsCode, null);
                });
            } else {
                Log.e(TAG, "❌ Failed to load image");
                sendErrorToJS("Failed to load image");
            }
        } catch (Exception e) {
            Log.e(TAG, "❌ Error in handleImageResult: " + e.getMessage());
            e.printStackTrace();
            sendErrorToJS("Error: " + e.getMessage());
        }
    }
    
    private void sendErrorToJS(String error) {
        final String jsError = "javascript:handleImageCaptured(null, '" + error + "')";
        webView.post(() -> {
            webView.evaluateJavascript(jsError, null);
        });
    }
    
    private String getErrorResponse(String error) {
        Log.e(TAG, "🚨 Error: " + error);
        try {
            JSONObject response = new JSONObject();
            response.put("success", false);
            response.put("error", error);
            return response.toString();
        } catch (JSONException e) {
            return "{\"success\":false,\"error\":\"JSON error\"}";
        }
    }
}