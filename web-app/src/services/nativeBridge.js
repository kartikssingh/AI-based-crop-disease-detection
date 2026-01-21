// Native Bridge Service - Handles communication with Android
class NativeBridge {
    constructor() {
        this.isAndroid = typeof window.Android !== 'undefined';
        this.imageCaptureCallback = null;
        
        if (this.isAndroid) {
            console.log('✅ Android bridge detected');
            this.testConnection();
        } else {
            console.warn('🌐 Running in browser mode - using mock data');
        }
    }
    
    testConnection() {
        if (this.isAndroid) {
            try {
                const result = window.Android.testConnection();
                console.log('Bridge test:', result);
                return true;
            } catch (error) {
                console.error('Bridge test failed:', error);
                return false;
            }
        }
        return false;
    }
    
    setCurrentCrop(crop) {
        if (this.isAndroid) {
            window.Android.setCurrentCrop(crop);
            console.log('🌱 Crop set to:', crop);
        }
    }
    
    setCurrentLanguage(langCode) {
        if (this.isAndroid) {
            window.Android.setCurrentLanguage(langCode);
            console.log('🗣️ Language set to:', langCode);
        }
    }
    
    openCamera(callback) {
        if (this.isAndroid) {
            this.imageCaptureCallback = callback;
            window.Android.openCamera();
        } else {
            this.browserImageCapture(callback, true);
        }
    }
    
    openGallery(callback) {
        if (this.isAndroid) {
            this.imageCaptureCallback = callback;
            window.Android.openGallery();
        } else {
            this.browserImageCapture(callback, false);
        }
    }
    
    browserImageCapture(callback, useCamera) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        if (useCamera) {
            input.capture = 'environment';
        }
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const base64 = await this.convertImageToBase64(file);
                    callback(base64);
                } catch (error) {
                    callback(null, error.message);
                }
            }
        };
        
        input.click();
    }
    
    async classifyImage(base64Image) {
        if (this.isAndroid) {
            try {
                const result = await window.Android.classifyImage(base64Image);
                return JSON.parse(result);
            } catch (error) {
                return {
                    error: 'Classification failed: ' + error.message,
                    success: false
                };
            }
        } else {
            // Mock data for browser testing
            return this.getMockClassification();
        }
    }
    
    speak(text) {
        if (this.isAndroid) {
            window.Android.speak(text);
        } else {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            }
        }
    }
    
    stopSpeaking() {
        if (this.isAndroid) {
            window.Android.stopSpeaking();
        } else {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
        }
    }
    
    convertImageToBase64(file) {
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
            const img = new Image();
            img.onload = () => {
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
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const resizedDataURL = canvas.toDataURL('image/jpeg', 0.7);
                resolve(resizedDataURL);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataURL;
        });
    }
    
    getMockClassification() {
        return {
            success: true,
            crop: 'tomato',
            disease: 'Early_blight',
            confidence: 92,
            predictions: [
                { disease: 'Early_blight', confidence: 92 },
                { disease: 'Late_blight', confidence: 5 },
                { disease: 'Tomato_healthy', confidence: 3 }
            ],
            advice_cause: 'Caused by fungus Alternaria solani. Spread by rain splash.',
            advice_cure: 'Apply fungicides like azoxystrobin or mancozeb.',
            advice_suggestions: 'Use mulch to prevent soil splash. Rotate crops.'
        };
    }
}

const nativeBridge = new NativeBridge();

if (typeof window !== 'undefined') {
    window.handleImageCaptured = function(base64Image) {
        if (nativeBridge.imageCaptureCallback) {
            nativeBridge.imageCaptureCallback(base64Image);
            nativeBridge.imageCaptureCallback = null;
        }
    };
}

export default nativeBridge;