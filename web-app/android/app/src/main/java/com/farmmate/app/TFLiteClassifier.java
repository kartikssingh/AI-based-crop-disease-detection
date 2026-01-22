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
        Log.d(TAG, "✅ TFLiteClassifier initialized");
    }
    
    public String[] classifyImage(Bitmap bitmap, String cropType) {
        Log.d(TAG, "==============================================");
        Log.d(TAG, "🤖 classifyImage() called");
        Log.d(TAG, "🌱 Crop type: " + cropType);
        Log.d(TAG, "📐 Bitmap size: " + bitmap.getWidth() + "x" + bitmap.getHeight());
        
        try {
            // Load model and labels for the specific crop
            Log.d(TAG, "🔍 Loading model for crop: " + cropType);
            loadModel(cropType);
            
            if (tflite == null) {
                Log.e(TAG, "❌ Model not loaded for crop: " + cropType);
                return new String[]{"Model not loaded", "0.0"};
            }
            
            Log.d(TAG, "✅ Model loaded successfully");
            Log.d(TAG, "🔄 Preprocessing image...");
            
            // Preprocess the image
            ByteBuffer inputBuffer = convertBitmapToByteBuffer(bitmap);
            
            Log.d(TAG, "▶️ Running inference...");
            
            // Run inference
            float[][] output = new float[1][labels.size()];
            tflite.run(inputBuffer, output);
            
            Log.d(TAG, "✅ Inference complete");
            Log.d(TAG, "📊 Number of labels: " + labels.size());
            
            // Get top prediction
            float[] probabilities = output[0];
            
            // Log all probabilities for debugging
            for (int i = 0; i < Math.min(5, probabilities.length); i++) {
                Log.d(TAG, "   Label[" + i + "]: " + labels.get(i) + " = " + probabilities[i]);
            }
            
            int maxIndex = getMaxIndex(probabilities);
            float confidence = probabilities[maxIndex];
            
            String diseaseName = labels.get(maxIndex);
            
            Log.d(TAG, "🎯 TOP PREDICTION:");
            Log.d(TAG, "   Disease: " + diseaseName);
            Log.d(TAG, "   Confidence: " + confidence + " (" + (confidence * 100) + "%)");
            Log.d(TAG, "   Index: " + maxIndex);
            
            return new String[]{diseaseName, String.valueOf(confidence)};
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Error classifying image: " + e.getMessage(), e);
            e.printStackTrace();
            return new String[]{"Error: " + e.getMessage(), "0.0"};
        } finally {
            // Close interpreter to free memory
            if (tflite != null) {
                Log.d(TAG, "🗑️ Closing interpreter...");
                tflite.close();
                tflite = null;
                labels.clear();
                Log.d(TAG, "✅ Interpreter closed");
            }
        }
    }
    
    private void loadModel(String cropType) throws IOException {
        // FIX: Ensure consistent naming
        String modelFile;
        String labelFile;
        
        // Map crop names to file names
        if ("corn".equalsIgnoreCase(cropType) || "maize".equalsIgnoreCase(cropType)) {
            modelFile = "corn_model.tflite";
            labelFile = "corn_labels.txt";
            Log.d(TAG, "🌽 Mapping crop '" + cropType + "' to corn model");
        } else if ("potato".equalsIgnoreCase(cropType)) {
            modelFile = "potato_model.tflite";
            labelFile = "potato_labels.txt";
        } else if ("rice".equalsIgnoreCase(cropType)) {
            modelFile = "rice_model.tflite";
            labelFile = "rice_labels.txt";
        } else if ("tomato".equalsIgnoreCase(cropType)) {
            modelFile = "tomato_model.tflite";
            labelFile = "tomato_labels.txt";
        } else {
            // Default to tomato if unknown crop
            modelFile = "tomato_model.tflite";
            labelFile = "tomato_labels.txt";
            Log.w(TAG, "⚠️ Unknown crop '" + cropType + "', defaulting to tomato");
        }
        
        Log.d(TAG, "📦 Loading model: " + modelFile);
        Log.d(TAG, "🏷️ Loading labels: " + labelFile);
        
        // Load model
        try {
            MappedByteBuffer modelBuffer = loadModelFile(modelFile);
            if (modelBuffer == null || modelBuffer.capacity() == 0) {
                throw new IOException("Model buffer is empty or null");
            }
            
            Log.d(TAG, "📏 Model buffer size: " + modelBuffer.capacity() + " bytes");
            
            Interpreter.Options options = new Interpreter.Options();
            options.setNumThreads(4); // Use 4 threads for faster inference
            
            tflite = new Interpreter(modelBuffer, options);
            Log.d(TAG, "✅ Model loaded successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to load model: " + e.getMessage(), e);
            throw e;
        }
        
        // Load labels
        labels.clear();
        AssetManager assetManager = context.getAssets();
        try (InputStream labelsInput = assetManager.open(labelFile);
             BufferedReader reader = new BufferedReader(new InputStreamReader(labelsInput))) {
            
            String line;
            int lineCount = 0;
            while ((line = reader.readLine()) != null) {
                labels.add(line.trim());
                lineCount++;
                if (lineCount <= 5) { // Log first 5 labels
                    Log.d(TAG, "   Label[" + (lineCount-1) + "]: " + line.trim());
                }
            }
            Log.d(TAG, "✅ Loaded " + labels.size() + " labels");
            
        } catch (Exception e) {
            Log.e(TAG, "❌ Failed to load labels: " + e.getMessage(), e);
            throw e;
        }
    }
    
    private MappedByteBuffer loadModelFile(String modelFile) throws IOException {
        Log.d(TAG, "📂 Loading model file from assets: " + modelFile);
        
        AssetManager assetManager = context.getAssets();
        
        // Check if file exists
        try {
            InputStream testStream = assetManager.open(modelFile);
            int fileSize = testStream.available();
            testStream.close();
            Log.d(TAG, "📊 Model file exists, size: " + fileSize + " bytes");
        } catch (IOException e) {
            Log.e(TAG, "❌ Model file not found in assets: " + modelFile);
            throw e;
        }
        
        // Read the entire file into a byte array
        InputStream inputStream = assetManager.open(modelFile);
        byte[] modelData = new byte[inputStream.available()];
        inputStream.read(modelData);
        inputStream.close();
        
        Log.d(TAG, "📥 Model data read: " + modelData.length + " bytes");
        
        if (modelData.length == 0) {
            throw new IOException("Model file is empty: " + modelFile);
        }
        
        // Create a ByteBuffer and wrap it as MappedByteBuffer
        ByteBuffer buffer = ByteBuffer.allocateDirect(modelData.length);
        buffer.order(ByteOrder.nativeOrder());
        buffer.put(modelData);
        buffer.rewind();
        
        Log.d(TAG, "✅ Model buffer created, capacity: " + buffer.capacity() + " bytes");
        
        return (MappedByteBuffer) buffer;
    }
    
    private ByteBuffer convertBitmapToByteBuffer(Bitmap bitmap) {
        Log.d(TAG, "🎨 Converting bitmap to ByteBuffer...");
        
        // Resize if needed
        Bitmap resizedBitmap;
        if (bitmap.getWidth() != IMAGE_SIZE || bitmap.getHeight() != IMAGE_SIZE) {
            resizedBitmap = Bitmap.createScaledBitmap(bitmap, IMAGE_SIZE, IMAGE_SIZE, true);
            Log.d(TAG, "🔄 Resized bitmap to: " + IMAGE_SIZE + "x" + IMAGE_SIZE);
        } else {
            resizedBitmap = bitmap;
        }
        
        ByteBuffer inputBuffer = ByteBuffer.allocateDirect(
                BATCH_SIZE * IMAGE_SIZE * IMAGE_SIZE * NUM_CHANNELS * NUM_BYTES_PER_CHANNEL);
        inputBuffer.order(ByteOrder.nativeOrder());
        
        int[] intValues = new int[IMAGE_SIZE * IMAGE_SIZE];
        resizedBitmap.getPixels(intValues, 0, IMAGE_SIZE, 0, 0, IMAGE_SIZE, IMAGE_SIZE);
        
        Log.d(TAG, "🎨 Processing " + intValues.length + " pixels...");
        
        int pixel = 0;
        for (int i = 0; i < IMAGE_SIZE; ++i) {
            for (int j = 0; j < IMAGE_SIZE; ++j) {
                final int val = intValues[pixel++];
                
                // Extract RGB values and normalize to [-1, 1]
                float r = ((val >> 16) & 0xFF) / 255.0f * 2.0f - 1.0f;
                float g = ((val >> 8) & 0xFF) / 255.0f * 2.0f - 1.0f;
                float b = (val & 0xFF) / 255.0f * 2.0f - 1.0f;
                
                inputBuffer.putFloat(r);
                inputBuffer.putFloat(g);
                inputBuffer.putFloat(b);
            }
        }
        
        inputBuffer.rewind();
        Log.d(TAG, "✅ ByteBuffer created, capacity: " + inputBuffer.capacity() + " bytes");
        
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