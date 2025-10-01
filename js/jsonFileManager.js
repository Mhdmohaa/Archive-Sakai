// jsonFileManager.js - Version GitHub Pages
class JsonFileManager {
    constructor() {
        this.reports = [];
        this.jsonFile = 'sakai_reports.json';
    }

    async loadAllReports() {
        try {
            console.log('📁 Tentative de chargement depuis GitHub Pages...');
            
            // Essayer de charger depuis le fichier JSON
            const response = await fetch(this.jsonFile);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
                    this.reports = data.reports;
                    console.log(`✅ ${this.reports.length} rapports chargés depuis ${this.jsonFile}`);
                    
                    // Charger les images depuis localStorage
                    this.reports.forEach(report => {
                        report.images = imageManager.getReportImages(report.id);
                    });
                    
                    this.saveToLocalStorage(data);
                    return this.reports;
                }
            }
            
            // Si le fichier JSON n'est pas disponible, charger depuis localStorage
            console.log('📁 Fichier JSON non disponible, chargement du cache...');
            await this.loadFromLocalStorage();
            
        } catch (error) {
            console.log('❌ Erreur chargement fichier, utilisation du cache:', error);
            await this.loadFromLocalStorage();
        }
        
        return this.reports;
    }

    async loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('sakai_reports');
            if (saved) {
                const data = JSON.parse(saved);
                this.reports = data.reports || [];
                
                this.reports.forEach(report => {
                    report.images = imageManager.getReportImages(report.id);
                });
                
                console.log(`📱 ${this.reports.length} rapports chargés depuis le cache`);
            } else {
                console.log('📱 Aucun rapport dans le cache');
                this.reports = [];
            }
        } catch (error) {
            console.error('Erreur chargement cache:', error);
            this.reports = [];
        }
    }

    saveToLocalStorage(data = null) {
        const dataToSave = data || {
            lastUpdated: new Date().toISOString(),
            totalReports: this.reports.length,
            reports: this.reports.map(report => {
                const { images, mediaFiles, ...reportWithoutImages } = report;
                
                // Garder imageFiles pour la référence
                if (report.imageFiles) {
                    reportWithoutImages.imageFiles = report.imageFiles;
                }
                
                return reportWithoutImages;
            })
        };
        localStorage.setItem('sakai_reports', JSON.stringify(dataToSave));
    }

    async saveReport(reportData) {
        try {
            console.log('🔄 Création du rapport...');
            
            const reportId = Date.now();
            const reportToSave = {
                id: reportId,
                ...reportData,
                savedAt: new Date().toISOString(),
                visibility: reportData.visibility || 'all',
                images: [] // Pour les données base64 (affichage)
            };

            // Sauvegarder les images si présentes
            if (reportData.mediaFiles && reportData.mediaFiles.length > 0) {
                console.log('🖼️ Sauvegarde des images...');
                const savedImages = await imageManager.saveReportImages(reportData, reportId);
                reportToSave.images = savedImages; // Pour l'affichage immédiat
                
                // Ajouter les noms de fichiers pour le JSON (pour votre référence manuelle)
                reportToSave.imageFiles = savedImages.map(img => ({
                    fileName: img.fileName,
                    originalName: img.originalName,
                    type: img.type,
                    size: img.size
                }));
            }

            // Ajouter le nouveau rapport
            this.reports.unshift(reportToSave);

            // Télécharger le nouveau fichier JSON avec les infos images
            this.downloadUpdatedFile();

            return {
                success: true,
                report: reportToSave,
                message: 'Rapport sauvegardé! Fichier JSON téléchargé avec les références images.'
            };

        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            return { success: false, error: error.message };
        }
    }

    downloadUpdatedFile() {
        const data = {
            lastUpdated: new Date().toISOString(),
            totalReports: this.reports.length,
            reports: this.reports.map(report => {
                // Inclure les infos des fichiers images dans le JSON téléchargé
                const { images, mediaFiles, ...reportForDownload } = report;
                
                // Garder imageFiles pour votre référence
                if (report.imageFiles) {
                    reportForDownload.imageFiles = report.imageFiles;
                }
                
                return reportForDownload;
            })
        };

        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sakai_reports.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ Nouveau fichier JSON téléchargé avec références images!');
        
        // Sauvegarder aussi dans localStorage
        this.saveToLocalStorage(data);
    }

    getAllReports() {
        return this.reports;
    }

    getReportsByCategory(category) {
        return this.reports.filter(report => report.category === category);
    }

    getReport(reportId) {
        return this.reports.find(report => report.id === parseInt(reportId));
    }

    async deleteReport(reportId) {
        // Supprimer les images du rapport
        imageManager.deleteReportImages(reportId);
        
        // Supprimer le rapport
        this.reports = this.reports.filter(r => r.id !== parseInt(reportId));
        
        // Re-télécharger le fichier mis à jour
        this.downloadUpdatedFile();
        
        return { success: true };
    }

    async refreshReports() {
        await this.loadAllReports();
        return { success: true, count: this.reports.length };
    }
}

// Instance globale
const jsonFileManager = new JsonFileManager();
window.jsonFileManager = jsonFileManager;

console.log('✅ JsonFileManager corrigé chargé!');