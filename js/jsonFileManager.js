// jsonFileManager.js - Lit le fichier JSON directement avec gestion des images
class JsonFileManager {
    constructor() {
        this.reports = [];
        this.jsonFile = 'sakai_reports.json';
    }

    // Charger depuis le fichier JSON
    async loadAllReports() {
        try {
            console.log('📁 Chargement du fichier JSON...');
            
            const response = await fetch(this.jsonFile);
            
            if (response.ok) {
                const data = await response.json();
                this.reports = data.reports || [];
                console.log(`✅ ${this.reports.length} rapports chargés depuis ${this.jsonFile}`);
                
                // Pour chaque rapport, charger ses images depuis localStorage
                this.reports.forEach(report => {
                    report.images = imageManager.getReportImages(report.id);
                });
                
                this.saveToLocalStorage(data);
            } else {
                console.log('📁 Fichier JSON non trouvé, chargement du cache...');
                await this.loadFromLocalStorage();
            }
            
        } catch (error) {
            console.log('❌ Erreur chargement fichier, utilisation du cache:', error);
            await this.loadFromLocalStorage();
        }
        
        return this.reports;
    }

    // Charger depuis localStorage (fallback)
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
            }
        } catch (error) {
            console.error('Erreur chargement cache:', error);
            this.reports = [];
        }
    }

    // Sauvegarder dans localStorage
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

    // Sauvegarder un rapport (télécharge le nouveau JSON)
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

    // Télécharger le fichier JSON mis à jour
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

    // Obtenir tous les rapports
    getAllReports() {
        return this.reports;
    }

    // Obtenir les rapports par catégorie
    getReportsByCategory(category) {
        return this.reports.filter(report => report.category === category);
    }

    // Obtenir un rapport spécifique
    getReport(reportId) {
        return this.reports.find(report => report.id === parseInt(reportId));
    }

    // Supprimer un rapport
    async deleteReport(reportId) {
        // Supprimer les images du rapport
        imageManager.deleteReportImages(reportId);
        
        // Supprimer le rapport
        this.reports = this.reports.filter(r => r.id !== parseInt(reportId));
        
        // Re-télécharger le fichier mis à jour
        this.downloadUpdatedFile();
        
        return { success: true };
    }

    // Actualiser les rapports
    async refreshReports() {
        await this.loadAllReports();
        return { success: true, count: this.reports.length };
    }
}

// Instance globale
const jsonFileManager = new JsonFileManager();
window.jsonFileManager = jsonFileManager;

console.log('✅ JsonFileManager chargé!');