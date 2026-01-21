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
    }
    
    @JavascriptInterface
    public String testConnection() {
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
        this.currentLanguage = langCode;
    }
    
    @JavascriptInterface
public void openCamera() {
        Log.d(TAG, "📸 openCamera called");
    if (context instanceof AppCompatActivity) {
        AppCompatActivity activity = (AppCompatActivity) context;
        activity.runOnUiThread(() -> {
            Intent intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
            if (intent.resolveActivity(activity.getPackageManager()) != null) {
                activity.startActivityForResult(intent, 1001);
            } else {
                Toast.makeText(context, "No camera app found", Toast.LENGTH_SHORT).show();
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
                Intent intent = new Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI);
                intent.setType("image/*");
                activity.startActivityForResult(Intent.createChooser(intent, "Select Picture"), 1002);
            });
        }
    }
    
    @JavascriptInterface
    public String classifyImage(String base64Image, String cropType) {
        Log.d(TAG, "Image data length: " + (base64Image != null ? base64Image.length() : 0));
        Log.d(TAG, "🎯 classifyImage called for crop: " + cropType);
        try {
            // Decode base64 to bitmap
            byte[] decodedBytes = Base64.decode(base64Image, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.length);
            
            if (bitmap == null) {
                return getErrorResponse("Failed to decode image");
            }
            
            // Resize to 224x224 (common ML input size)
            Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, 224, 224, true);
            
            // Classify using TFLite
            String[] result = tfLiteClassifier.classifyImage(resizedBitmap, cropType);
            
            if (result == null || result.length < 2) {
                return getErrorResponse("Classification failed");
            }
            
            String diseaseName = result[0];
            float confidence = Float.parseFloat(result[1]);
            
            // Get advice from database
            JSONObject advice = adviceRepository.getAdvice(cropType, diseaseName, currentLanguage);
            
            // Build response JSON
            JSONObject response = new JSONObject();
            response.put("success", true);
            response.put("crop", cropType);
            response.put("disease", diseaseName);
            response.put("confidence", Math.round(confidence * 100));
            
            if (advice != null) {
                response.put("advice_cause", advice.optString("cause", ""));
                response.put("advice_cure", advice.optString("cure", ""));
                response.put("advice_suggestions", advice.optString("suggestions", ""));
            }
            
            return response.toString();
            
        } catch (Exception e) {
            e.printStackTrace();
            return getErrorResponse("Error: " + e.getMessage());
        }
    }
    
    @JavascriptInterface
    public void speak(String text, String language) {
        // We'll implement TTS later - for now just show toast
        Toast.makeText(context, "TTS: " + text.substring(0, Math.min(50, text.length())) + "...", Toast.LENGTH_SHORT).show();
    }
    
    @JavascriptInterface
    public void stopSpeaking() {
        // Stop TTS if needed
    }
    
    // Helper method to handle image capture result
    public void handleImageResult(Intent data, boolean fromCamera) {
        try {
            Bitmap bitmap;
            if (fromCamera) {
                bitmap = (Bitmap) data.getExtras().get("data");
            } else {
                Uri selectedImage = data.getData();
                bitmap = MediaStore.Images.Media.getBitmap(context.getContentResolver(), selectedImage);
            }
            
            if (bitmap != null) {
                // Convert to base64
                ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 70, byteArrayOutputStream);
                byte[] byteArray = byteArrayOutputStream.toByteArray();
                String base64Image = Base64.encodeToString(byteArray, Base64.DEFAULT);
                
                // Send to JavaScript
                final String jsCode = "javascript:handleImageCaptured('data:image/jpeg;base64," + base64Image + "')";
                webView.post(() -> webView.evaluateJavascript(jsCode, null));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private String getErrorResponse(String error) {
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