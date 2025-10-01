// simpleManager.js - Gestionnaire ultra-simplifié
class SimpleManager {
    constructor() {
        this.reports = [];
        this.loadFromLocalStorage();
    }

    // Charger depuis localStorage
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('sakai_reports');
            if (saved) {
                this.reports = JSON.parse(saved);
                console.log(`${this.reports.length} rapports chargés`);
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
            this.reports = [];
        }
    }

    // Sauvegarder dans localStorage
    saveToLocalStorage() {
        localStorage.setItem('sakai_reports', JSON.stringify(this.reports));
    }

    // Sauvegarder un rapport
    async saveReport(reportData) {
        try {
            const reportToSave = {
                id: Date.now(),
                ...reportData,
                savedAt: new Date().toISOString(),
                visibility: reportData.visibility || 'all'
            };

            // Ajouter le rapport
            this.reports.unshift(reportToSave);
            
            // Sauvegarder dans localStorage
            this.saveToLocalStorage();
            
            // Télécharger le fichier JSON
            this.downloadFile();
            
            return {
                success: true,
                report: reportToSave,
                message: 'Rapport sauvegardé!'
            };

        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            return { success: false, error: error.message };
        }
    }

    // Télécharger le fichier JSON
    downloadFile() {
        const data = {
            lastUpdated: new Date().toISOString(),
            totalReports: this.reports.length,
            reports: this.reports
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
        
        console.log('Fichier téléchargé: sakai_reports.json');
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
        this.reports = this.reports.filter(r => r.id !== parseInt(reportId));
        this.saveToLocalStorage();
        this.downloadFile(); // Re-télécharger le fichier mis à jour
        return { success: true };
    }

    // Actualiser
    async refreshReports() {
        this.loadFromLocalStorage();
        return { success: true, count: this.reports.length };
    }
}

// Instance globale
const simpleManager = new SimpleManager();
window.simpleManager = simpleManager;