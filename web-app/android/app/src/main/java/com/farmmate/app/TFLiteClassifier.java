package com.farmmate.app;

import android.content.Context;
import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.util.Log;
import org.tensorflow.lite.Interpreter;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class TFLiteClassifier {
    private static final String TAG = "TFLiteClassifier";
    private static final int IMAGE_SIZE = 224;
    private static final int NUM_CHANNELS = 3;
    private static final int NUM_BYTES_PER_CHANNEL = 4; // Float
    private static final int BATCH_SIZE = 1;
    
    private Interpreter tflite;
    private List<String> labels = new ArrayList<>();
    private Context context;
    
    public TFLiteClassifier(Context context) {
        this.context = context;
    }
    
    public String[] classifyImage(Bitmap bitmap, String cropType) {
        try {
            // Load model and labels for the specific crop
            loadModel(cropType);
            
            if (tflite == null) {
                Log.e(TAG, "Model not loaded for crop: " + cropType);
                return new String[]{"Unknown", "0.0"};
            }
            
            // Preprocess the image
            ByteBuffer inputBuffer = convertBitmapToByteBuffer(bitmap);
            
            // Run inference
            float[][] output = new float[1][labels.size()];
            tflite.run(inputBuffer, output);
            
            // Get top prediction
            float[] probabilities = output[0];
            int maxIndex = getMaxIndex(probabilities);
            float confidence = probabilities[maxIndex];
            
            String diseaseName = labels.get(maxIndex);
            
            Log.d(TAG, "Prediction for " + cropType + ": " + diseaseName + " (" + confidence + ")");
            
            return new String[]{diseaseName, String.valueOf(confidence)};
            
        } catch (Exception e) {
            Log.e(TAG, "Error classifying image: " + e.getMessage());
            e.printStackTrace();
            return new String[]{"Error", "0.0"};
        } finally {
            // Close interpreter to free memory
            if (tflite != null) {
                tflite.close();
                tflite = null;
            }
        }
    }
    
    private void loadModel(String cropType) throws IOException {
        String modelFile = cropType + "_model.tflite";
        String labelFile = cropType + "_labels.txt";
        
        Log.d(TAG, "Loading model: " + modelFile + " and labels: " + labelFile);
        
        // Load model
        try {
            MappedByteBuffer modelBuffer = loadModelFile(modelFile);
            tflite = new Interpreter(modelBuffer);
            Log.d(TAG, "Model loaded successfully");
        } catch (Exception e) {
            Log.e(TAG, "Failed to load model: " + e.getMessage());
            throw e;
        }
        
        // Load labels
        labels.clear();
        AssetManager assetManager = context.getAssets();
        try (InputStream labelsInput = assetManager.open(labelFile);
             BufferedReader reader = new BufferedReader(new InputStreamReader(labelsInput))) {
            
            String line;
            while ((line = reader.readLine()) != null) {
                labels.add(line.trim());
            }
            Log.d(TAG, "Loaded " + labels.size() + " labels");
            
        } catch (Exception e) {
            Log.e(TAG, "Failed to load labels: " + e.getMessage());
            throw e;
        }
    }
    
    private MappedByteBuffer loadModelFile(String modelFile) throws IOException {
        AssetManager assetManager = context.getAssets();
        InputStream inputStream = assetManager.open(modelFile);
        
        byte[] modelData = new byte[inputStream.available()];
        inputStream.read(modelData);
        inputStream.close();
        
        ByteBuffer buffer = ByteBuffer.allocateDirect(modelData.length);
        buffer.order(ByteOrder.nativeOrder());
        buffer.put(modelData);
        buffer.rewind();
        
        return (MappedByteBuffer) buffer;
    }
    
    private ByteBuffer convertBitmapToByteBuffer(Bitmap bitmap) {
        Bitmap resizedBitmap = Bitmap.createScaledBitmap(bitmap, IMAGE_SIZE, IMAGE_SIZE, true);
        
        ByteBuffer inputBuffer = ByteBuffer.allocateDirect(
                BATCH_SIZE * IMAGE_SIZE * IMAGE_SIZE * NUM_CHANNELS * NUM_BYTES_PER_CHANNEL);
        inputBuffer.order(ByteOrder.nativeOrder());
        
        int[] intValues = new int[IMAGE_SIZE * IMAGE_SIZE];
        resizedBitmap.getPixels(intValues, 0, resizedBitmap.getWidth(), 0, 0, 
                                resizedBitmap.getWidth(), resizedBitmap.getHeight());
        
        int pixel = 0;
        for (int i = 0; i < IMAGE_SIZE; ++i) {
            for (int j = 0; j < IMAGE_SIZE; ++j) {
                final int val = intValues[pixel++];
                
                // Normalize pixel values to [-1, 1] (common for MobileNet)
                inputBuffer.putFloat(((val >> 16) & 0xFF) / 255.0f * 2.0f - 1.0f); // R
                inputBuffer.putFloat(((val >> 8) & 0xFF) / 255.0f * 2.0f - 1.0f);  // G
                inputBuffer.putFloat((val & 0xFF) / 255.0f * 2.0f - 1.0f);         // B
            }
        }
        
        inputBuffer.rewind();
        return inputBuffer;
    }
    
    private int getMaxIndex(float[] array) {
        int maxIndex = 0;
        float maxValue = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > maxValue) {
                maxValue = array[i];
                maxIndex = i;
            }
        }
        return maxIndex;
    }
}