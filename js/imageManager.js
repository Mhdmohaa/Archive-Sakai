// imageManager.js - Gestionnaire d'images pour les rapports
class ImageManager {
    constructor() {
        this.imagesBasePath = 'images/';
    }

    // Sauvegarder les images d'un rapport
    async saveReportImages(reportData, reportId) {
        if (!reportData.mediaFiles || reportData.mediaFiles.length === 0) {
            return [];
        }

        const savedImages = [];

        for (let i = 0; i < reportData.mediaFiles.length; i++) {
            const file = reportData.mediaFiles[i];
            if (file.type.startsWith('image/')) {
                const imageInfo = await this.saveImage(file, reportId, i);
                if (imageInfo) {
                    savedImages.push(imageInfo);
                }
            }
        }

        return savedImages;
    }

    // Sauvegarder une image
    async saveImage(file, reportId, index) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const fileName = this.generateImageName(file.name, reportId, index);
                    const imageInfo = {
                        originalName: file.name,
                        fileName: fileName,
                        path: this.imagesBasePath + fileName,
                        type: file.type,
                        size: file.size,
                        data: e.target.result // Stocker en base64 pour l'affichage
                    };

                    // Sauvegarder dans localStorage
                    this.saveToLocalStorage(imageInfo);
                    
                    resolve(imageInfo);
                    
                } catch (error) {
                    console.error('Erreur sauvegarde image:', error);
                    resolve(null);
                }
            };
            
            reader.onerror = () => {
                console.error('Erreur lecture image');
                resolve(null);
            };
            
            reader.readAsDataURL(file);
        });
    }

    // Générer un nom d'image unique
    generateImageName(originalName, reportId, index) {
        const extension = originalName.split('.').pop();
        const timestamp = new Date().getTime();
        return `report_${reportId}_${index}_${timestamp}.${extension}`;
    }

    // Sauvegarder dans localStorage
    saveToLocalStorage(imageInfo) {
        const key = `image_${imageInfo.fileName}`;
        localStorage.setItem(key, JSON.stringify(imageInfo));
    }

    // Charger une image depuis localStorage
    loadImage(fileName) {
        const key = `image_${fileName}`;
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
    }

    // Obtenir toutes les images d'un rapport
    getReportImages(reportId) {
        const images = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('image_') && key.includes(`report_${reportId}_`)) {
                try {
                    const imageData = JSON.parse(localStorage.getItem(key));
                    images.push(imageData);
                } catch (error) {
                    console.error('Erreur chargement image:', error);
                }
            }
        }
        
        return images;
    }

    // Supprimer les images d'un rapport
    deleteReportImages(reportId) {
        const keysToDelete = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('image_') && key.includes(`report_${reportId}_`)) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ ${keysToDelete.length} images supprimées pour le rapport ${reportId}`);
    }
}

// Instance globale
const imageManager = new ImageManager();
window.imageManager = imageManager;

console.log('✅ ImageManager chargé!');