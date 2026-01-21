package com.farmmate.app;

import android.content.Context;
import android.content.res.AssetManager;
import android.util.Log;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

public class AdviceRepository {
    private static final String TAG = "AdviceRepository";
    private Context context;
    private JSONObject englishData;
    private JSONObject hindiData;
    private JSONObject teluguData;
    
    public AdviceRepository(Context context) {
        this.context = context;
        loadAllData();
    }
    
    private void loadAllData() {
        englishData = loadJsonFile("english.json");
        hindiData = loadJsonFile("hindi.json");
        teluguData = loadJsonFile("telugu.json");
    }
    
    private JSONObject loadJsonFile(String fileName) {
        try {
            AssetManager assetManager = context.getAssets();
            InputStream inputStream = assetManager.open(fileName);
            BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
            StringBuilder stringBuilder = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                stringBuilder.append(line);
            }
            reader.close();
            inputStream.close();
            
            return new JSONObject(stringBuilder.toString());
        } catch (IOException | JSONException e) {
            Log.e(TAG, "Error loading " + fileName + ": " + e.getMessage());
            return new JSONObject();
        }
    }
    
    public JSONObject getAdvice(String cropType, String diseaseName, String language) {
        try {
            JSONObject langData;
            switch (language) {
                case "hi":
                    langData = hindiData;
                    break;
                case "te":
                    langData = teluguData;
                    break;
                default:
                    langData = englishData;
                    break;
            }
            
            if (!langData.has(cropType)) {
                Log.e(TAG, "Crop not found in data: " + cropType);
                return createDefaultAdvice(cropType, diseaseName);
            }
            
            JSONObject cropData = langData.getJSONObject(cropType);
            
            // Try to find exact disease name
            if (cropData.has(diseaseName)) {
                return cropData.getJSONObject(diseaseName);
            }
            
            // Try to find by similar name (case insensitive)
            String[] keys = getKeys(cropData);
            for (String key : keys) {
                if (key.equalsIgnoreCase(diseaseName) || 
                    diseaseName.toLowerCase().contains(key.toLowerCase()) ||
                    key.toLowerCase().contains(diseaseName.toLowerCase())) {
                    return cropData.getJSONObject(key);
                }
            }
            
            // Return first disease for this crop as fallback
            if (keys.length > 0) {
                return cropData.getJSONObject(keys[0]);
            }
            
        } catch (JSONException e) {
            Log.e(TAG, "JSON error: " + e.getMessage());
        }
        
        return createDefaultAdvice(cropType, diseaseName);
    }
    
    private String[] getKeys(JSONObject jsonObject) {
        int length = jsonObject.length();
        String[] keys = new String[length];
        java.util.Iterator<String> iterator = jsonObject.keys();
        int i = 0;
        while (iterator.hasNext()) {
            keys[i++] = iterator.next();
        }
        return keys;
    }
    
    private JSONObject createDefaultAdvice(String cropType, String diseaseName) {
        try {
            JSONObject defaultAdvice = new JSONObject();
            defaultAdvice.put("cause", "Fungal/bacterial infection due to weather conditions.");
            defaultAdvice.put("cure", "Apply appropriate fungicide/pesticide. Remove infected leaves.");
            defaultAdvice.put("suggestions", "Maintain proper spacing. Water in morning. Rotate crops.");
            return defaultAdvice;
        } catch (JSONException e) {
            return new JSONObject();
        }
    }
}