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

const cropService = {
    getAllCrops() {
        return crops;
    },
    
    getCropById(id) {
        return crops.find(crop => crop.id === id);
    },
    
    setCurrentCrop(cropId) {
        localStorage.setItem('currentCrop', cropId);
        if (window.nativeBridge) {
            window.nativeBridge.setCurrentCrop(cropId);
        }
    },
    
    getCurrentCrop() {
        return localStorage.getItem('currentCrop') || 'tomato';
    }
};

export default cropService;