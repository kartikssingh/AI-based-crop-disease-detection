// Crop service
const crops = [
    {
        id: 'tomato',
        name: 'Tomato',
        icon: '🍅',
        color: 'from-red-500 to-orange-500'
    },
    {
        id: 'potato',
        name: 'Potato',
        icon: '🥔',
        color: 'from-purple-500 to-pink-500'
    },
    {
        id: 'corn',
        name: 'Corn',
        icon: '🌽',
        color: 'from-yellow-500 to-green-500'
    },
    {
        id: 'rice',
        name: 'Rice',
        icon: '🌾',
        color: 'from-green-600 to-emerald-500'
    }
];

// ALTERNATIVE: If Home.jsx shows "Maize" but you want to keep "corn" as ID
// You have two options:

const cropService = {
    getAllCrops() {
        return crops;
    },
    
    getCropById(id) {
        // Handle maize -> corn mapping
        if (id === 'maize') {
            id = 'corn';
        }
        return crops.find(crop => crop.id === id);
    },
    
    setCurrentCrop(cropId) {
        console.log('🌱 cropService.setCurrentCrop called with:', cropId);
        
        // FIX: Map maize to corn for consistent model loading
        let mappedCropId = cropId;
        if (cropId === 'maize') {
            mappedCropId = 'corn';
            console.log('🌽 MAPPING: maize -> corn');
        }
        
        localStorage.setItem('currentCrop', mappedCropId);
        if (window.nativeBridge) {
            console.log('📱 Calling nativeBridge.setCurrentCrop with:', mappedCropId);
            window.nativeBridge.setCurrentCrop(mappedCropId);
        } else {
            console.warn('⚠️ nativeBridge not available');
        }
    },
    
    getCurrentCrop() {
        const cropId = localStorage.getItem('currentCrop') || 'tomato';
        console.log('🌱 cropService.getCurrentCrop returning:', cropId);
        return cropId;
    },
    
    // NEW: Helper method to get display name
    getDisplayName(cropId) {
        if (cropId === 'corn') {
            return 'Maize'; // Display as Maize but use corn as ID
        }
        const crop = this.getCropById(cropId);
        return crop ? crop.name : cropId;
    }
};

export default cropService;