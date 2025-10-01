// jsonFileManager.js - Version corrigée
class JsonFileManager {
    constructor() {
        this.reports = [];
        this.jsonFile = 'sakai_reports.json';
    }

    // Charger depuis le fichier JSON - VERSION CORRIGÉE
    async loadAllReports() {
        try {
            console.log('📁 Chargement du fichier JSON...');
            
            const response = await fetch(this.jsonFile);
            
            if (response.ok) {
                const data = await response.json();
                
                // VÉRIFICATION IMPORTANTE : seulement si le fichier a des rapports
                if (data.reports && Array.isArray(data.reports) && data.reports.length > 0) {
                    this.reports = data.reports;
                    console.log(`✅ ${this.reports.length} rapports chargés depuis ${this.jsonFile}`);
                    
                    // Pour chaque rapport, charger ses images depuis localStorage
                    this.reports.forEach(report => {
                        report.images = imageManager.getReportImages(report.id);
                    });
                    
                    this.saveToLocalStorage(data);
                } else {
                    // Fichier existe mais vide ou invalide - charger du cache
                    console.log('📁 Fichier JSON vide ou invalide, chargement du cache...');
                    await this.loadFromLocalStorage();
                }
            } else {
                // Fichier n'existe pas - charger du cache
                console.log('📁 Fichier JSON non trouvé, chargement du cache...');
                await this.loadFromLocalStorage();
            }
            
        } catch (error) {
            console.log('❌ Erreur chargement fichier, utilisation du cache:', error);
            await this.loadFromLocalStorage();
        }
        
        return this.reports;
    }

    // Le reste du code reste identique...
    async loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('sakai_reports');
            if (saved) {
                const data = JSON.parse(saved);
                this.reports = data.reports || [];
                
                // Charger les images pour chaque rapport
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

    // Les autres méthodes restent identiques...
    saveToLocalStorage(data = null) {
        const dataToSave = data || {
            lastUpdated: new Date().toISOString(),
            totalReports: this.reports.length,
            reports: this.reports.map(report => {
                // Ne pas sauvegarder les données images dans le JSON principal
                const { images, ...reportWithoutImages } = report;
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
                images: [] // Initialiser le tableau d'images
            };

            // Sauvegarder les images si présentes
            if (reportData.mediaFiles && reportData.mediaFiles.length > 0) {
                console.log('🖼️ Sauvegarde des images...');
                reportToSave.images = await imageManager.saveReportImages(reportData, reportId);
            }

            // Ajouter le nouveau rapport
            this.reports.unshift(reportToSave);

            // Télécharger le nouveau fichier JSON
            this.downloadUpdatedFile();

            return {
                success: true,
                report: reportToSave,
                message: 'Rapport sauvegardé! Fichier JSON téléchargé.'
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
                // Ne pas inclure les données images dans le JSON téléchargé
                const { images, ...reportWithoutImages } = report;
                return reportWithoutImages;
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
        
        console.log('✅ Nouveau fichier JSON téléchargé!');
        
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