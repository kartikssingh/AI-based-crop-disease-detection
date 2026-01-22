// Native Bridge Service - Handles communication with Android
class NativeBridge {
    constructor() {
        this.isAndroid = typeof window.Android !== 'undefined';
        this.imageCaptureCallback = null;
        
        console.log('============================================');
        console.log('🚀 NativeBridge Constructor');
        console.log('🔍 typeof window.Android:', typeof window.Android);
        console.log('📱 isAndroid:', this.isAndroid);
        console.log('🌐 User Agent:', navigator.userAgent);
        console.log('🏠 Window location:', window.location.href);
        console.log('🔗 window object keys (first 10):', Object.keys(window).slice(0, 10));
        
        if (this.isAndroid) {
            console.log('✅ Android bridge DETECTED');
            this.testConnection();
        } else {
            console.warn('🌐 Running in browser mode - Android NOT detected');
            console.warn('⚠️ Mock data will be used for testing');
        }
    }
    
    testConnection() {
        if (this.isAndroid) {
            try {
                const result = window.Android.testConnection();
                console.log('✅ Bridge test:', result);
                return true;
            } catch (error) {
                console.error('❌ Bridge test failed:', error);
                return false;
            }
        }
        return false;
    }
    
    setCurrentCrop(crop) {
        console.log('🌱 nativeBridge.setCurrentCrop called with:', crop);
        
        // FIX: Map maize to corn for consistent model loading
        let mappedCrop = crop;
        if (crop === 'maize') {
            mappedCrop = 'corn';
            console.log('🌽 MAPPING: maize -> corn');
        }
        
        if (this.isAndroid) {
            window.Android.setCurrentCrop(mappedCrop);
            console.log('📱 Called Android.setCurrentCrop with:', mappedCrop);
        }
    }
    
    setCurrentLanguage(langCode) {
        console.log('🗣️ nativeBridge.setCurrentLanguage called with:', langCode);
        if (this.isAndroid) {
            window.Android.setCurrentLanguage(langCode);
        }
    }
    
    openCamera(callback) {
        console.log('📸 nativeBridge.openCamera called');
        if (this.isAndroid) {
            this.imageCaptureCallback = callback;
            window.Android.openCamera();
        } else {
            this.browserImageCapture(callback, true);
        }
    }
    
    openGallery(callback) {
        console.log('🖼️ nativeBridge.openGallery called');
        if (this.isAndroid) {
            this.imageCaptureCallback = callback;
            window.Android.openGallery();
        } else {
            this.browserImageCapture(callback, false);
        }
    }
    
    browserImageCapture(callback, useCamera) {
        console.log('🌐 Browser mode image capture, useCamera:', useCamera);
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        if (useCamera) {
            input.capture = 'environment';
        }
        
        input.onchange = async (e) => {
            console.log('📁 File input changed event fired');
            console.log('📁 Event target:', e.target);
            console.log('📁 Files:', e.target.files);
            
            const file = e.target.files[0];
            if (file) {
                console.log('📄 File selected:', file.name, 'Size:', file.size, 'Type:', file.type);
                try {
                    console.log('🔄 Starting image conversion...');
                    const base64 = await this.convertImageToBase64(file);
                    console.log('✅ Image converted to base64, length:', base64.length);
                    console.log('✅ First 50 chars:', base64.substring(0, 50));
                    console.log('✅ Calling callback with base64 data and null error');
                    callback(base64, null);
                } catch (error) {
                    console.error('❌ Image conversion error:', error);
                    console.error('❌ Error message:', error.message);
                    console.error('❌ Error stack:', error.stack);
                    callback(null, error.message);
                }
            } else {
                console.warn('⚠️ No file selected');
                callback(null, 'No file selected');
            }
        };
        
        input.onerror = (error) => {
            console.error('❌ File input error:', error);
            callback(null, 'Failed to open file picker');
        };
        
        console.log('🖱️ Triggering file input click');
        try {
            input.click();
            console.log('✅ File input click triggered successfully');
        } catch (error) {
            console.error('❌ Failed to trigger file input click:', error);
            callback(null, 'Failed to open file picker: ' + error.message);
        }
    }
    
    // UPDATED: Remove default value to force passing cropType
    async classifyImage(base64Image, cropType) {
        console.log('==============================================');
        console.log('🎯 nativeBridge.classifyImage called');
        console.log('📱 isAndroid:', this.isAndroid);
        console.log('🌱 Crop type parameter:', cropType);
        console.log('📏 Image data length:', base64Image ? base64Image.length : 0);
        
        // Validate image data
        if (!base64Image) {
            console.error('❌ ERROR: base64Image is required but not provided!');
            return {
                error: 'Image data is required',
                success: false
            };
        }
        
        if (!cropType) {
            console.error('❌ ERROR: cropType is required but not provided!');
            // Try to get from localStorage as fallback
            cropType = localStorage.getItem('currentCrop') || 'tomato';
            console.log('🔄 Using fallback cropType from localStorage:', cropType);
        }
        
        // FIX: Map maize to corn
        let mappedCropType = cropType;
        if (cropType === 'maize') {
            mappedCropType = 'corn';
            console.log('🌽 MAPPING: maize -> corn');
        }
        
        console.log('🌱 Mapped crop type for model:', mappedCropType);
        
        // Clean base64 - remove data URI prefix if present
        let cleanBase64 = base64Image;
        if (base64Image.includes(',')) {
            cleanBase64 = base64Image.split(',')[1];
            console.log('🔧 Cleaned base64 from data URI format');
        }
        
        if (this.isAndroid) {
            console.log('📱 ANDROID MODE - Calling native TFLite classifier');
            try {
                // Pass both image and crop type to Android
                console.log('🤖 Calling Android.classifyImage with crop:', mappedCropType);
                const result = await window.Android.classifyImage(cleanBase64, mappedCropType);
                console.log('✅ Android.classifyImage returned:', typeof result);
                console.log('✅ Result:', result);
                
                // Handle both string and object responses
                if (typeof result === 'string') {
                    const parsedResult = JSON.parse(result);
                    console.log('✅ Parsed JSON result:', parsedResult);
                    return parsedResult;
                }
                return result;
            } catch (error) {
                console.error('❌ Classification error:', error);
                return {
                    error: 'Classification failed: ' + error.message,
                    success: false
                };
            }
        } else {
            // Mock data for browser testing
            console.log('🌐 BROWSER MODE - Returning MOCK data for testing');
            console.log('⚠️ This is NOT the ML model - it\'s test data only!');
            const mockResult = this.getMockClassification(mappedCropType);
            console.log('🎭 Mock result:', mockResult);
            return mockResult;
        }
    }
    
    // UPDATED: Accepts language parameter
    speak(text, language = 'en') {
        console.log('🔊 nativeBridge.speak called:', text.substring(0, 50) + '...');
        if (this.isAndroid) {
            window.Android.speak(text, language);
        } else {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = this.getLanguageCode(language);
                window.speechSynthesis.speak(utterance);
            }
        }
    }
    
    stopSpeaking() {
        console.log('🔇 nativeBridge.stopSpeaking called');
        if (this.isAndroid) {
            window.Android.stopSpeaking();
        } else {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    }
    
    convertImageToBase64(file) {
        console.log('🔄 Converting image to base64');
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const resizedBase64 = await this.resizeImage(e.target.result, 800);
                    resolve(resizedBase64);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }
    
    resizeImage(dataURL, maxSize) {
        return new Promise((resolve, reject) => {
            console.log('🖼️ resizeImage called, maxSize:', maxSize);
            const img = new Image();
            
            img.onload = () => {
                console.log('✅ Image loaded for resizing:', img.width, 'x', img.height);
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = (height * maxSize) / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = (width * maxSize) / height;
                            height = maxSize;
                        }
                    }
                    
                    console.log('📐 Resizing to:', width, 'x', height);
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }
                    
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const resizedDataURL = canvas.toDataURL('image/jpeg', 0.7);
                    console.log('✅ Resized image base64 length:', resizedDataURL.length);
                    resolve(resizedDataURL);
                } catch (error) {
                    console.error('❌ Error during resizing:', error);
                    reject(error);
                }
            };
            
            img.onerror = (error) => {
                console.error('❌ Image load error:', error);
                reject(new Error('Failed to load image: ' + (error.message || 'unknown')));
            };
            
            img.onabort = () => {
                console.error('❌ Image load aborted');
                reject(new Error('Image loading was aborted'));
            };
            
            console.log('🔗 Setting image source...');
            img.src = dataURL;
        });
    }
    
    // UPDATED: Accepts crop type parameter
    getMockClassification(cropType = 'tomato') {
        console.log('🎭 Generating mock classification for crop:', cropType);
        
        const mockData = {
            tomato: {
                success: true,
                crop: 'tomato',
                disease: 'Early_blight',
                confidence: 92,
                advice_cause: 'Caused by fungus Alternaria solani. Spread by rain splash.',
                advice_cure: 'Apply fungicides like azoxystrobin or mancozeb.',
                advice_suggestions: 'Use mulch to prevent soil splash. Rotate crops.'
            },
            potato: {
                success: true,
                crop: 'potato',
                disease: 'Late_blight',
                confidence: 85,
                advice_cause: 'Caused by fungus Phytophthora infestans.',
                advice_cure: 'Apply copper-based fungicides.',
                advice_suggestions: 'Remove infected plants immediately.'
            },
            corn: {
                success: true,
                crop: 'corn',
                disease: 'Northern_Leaf_Blight',
                confidence: 78,
                advice_cause: 'Caused by fungus Exserohilum turcicum.',
                advice_cure: 'Apply fungicides with active ingredients like chlorothalonil.',
                advice_suggestions: 'Plant resistant varieties.'
            },
            rice: {
                success: true,
                crop: 'rice',
                disease: 'Bacterial_Leaf_Blight',
                confidence: 90,
                advice_cause: 'Caused by bacteria Xanthomonas oryzae.',
                advice_cure: 'Apply copper-based bactericides.',
                advice_suggestions: 'Use disease-free seeds.'
            }
        };
        
        // Handle maize -> corn mapping
        if (cropType === 'maize') {
            cropType = 'corn';
        }
        
        const result = mockData[cropType] || mockData.tomato;
        console.log('🎭 Mock result:', result);
        return result;
    }
    
    // Helper: Convert language code to SpeechSynthesis format
    getLanguageCode(lang) {
        const languageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'te': 'te-IN'
        };
        return languageMap[lang] || 'en-US';
    }
}

const nativeBridge = new NativeBridge();

if (typeof window !== 'undefined') {
    // Global handler for image capture from Android
    window.handleImageCaptured = function(base64Image, error) {
        console.log('📸 handleImageCaptured called');
        console.log('   Base64 length:', base64Image ? base64Image.length : 'null');
        console.log('   Error:', error || 'none');
        
        if (nativeBridge.imageCaptureCallback) {
            console.log('✅ Calling image capture callback');
            nativeBridge.imageCaptureCallback(base64Image, error);
            nativeBridge.imageCaptureCallback = null;
        } else {
            console.warn('⚠️ No callback registered for image capture');
        }
    };
}

export default nativeBridge;