// saveReport.js - Système de sauvegarde 100% JavaScript
class LocalReportSaver {
    constructor() {
        this.basePath = 'data/';
        this.reportsPath = this.basePath + 'reports/';
        this.mediaPath = this.basePath + 'media/';
        this.initFileSystem();
    }

    // Initialiser le système
    initFileSystem() {
        if (!localStorage.getItem('sakai_reports_index')) {
            localStorage.setItem('sakai_reports_index', '[]');
        }
        if (!localStorage.getItem('sakai_drafts')) {
            localStorage.setItem('sakai_drafts', '[]');
        }
    }

    // Sauvegarder un rapport
    async saveReport(reportData) {
        try {
            // Générer un nom de fichier unique
            const fileName = this.generateFileName(reportData.category, reportData.subcategory, reportData.title);
            const filePath = this.reportsPath + fileName + '.json';
            
            // Préparer les données
            const reportToSave = {
                id: reportData.id || Date.now(),
                ...reportData,
                savedAt: new Date().toISOString(),
                filePath: filePath,
                visibility: reportData.visibility || 'all'
            };

            // Gérer les médias
            if (reportData.mediaFiles && reportData.mediaFiles.length > 0) {
                reportToSave.mediaPaths = await this.saveMediaFiles(reportData.mediaFiles, fileName);
            }

            // 1. Sauvegarder dans localStorage
            await this.saveToLocalStorage(reportToSave);
            
            // 2. Télécharger le fichier JSON automatiquement
            this.downloadJSONFile(reportToSave, fileName);
            
            // 3. Télécharger les médias s'il y en a
            if (reportToSave.mediaPaths && reportToSave.mediaPaths.length > 0) {
                this.downloadMediaFiles(reportToSave.mediaPaths, fileName);
            }

            return {
                success: true,
                filePath: filePath,
                report: reportToSave,
                message: 'Rapport sauvegardé et fichiers téléchargés!'
            };

        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            return { success: false, error: error.message };
        }
    }

    // Générer un nom de fichier
    generateFileName(category, subcategory, title) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const cleanTitle = title.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        return `${category}_${subcategory}_${cleanTitle}_${timestamp}`;
    }

    // Télécharger le fichier JSON
    downloadJSONFile(report, fileName) {
        const dataStr = JSON.stringify(report, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`📁 Fichier JSON téléchargé: ${fileName}.json`);
    }

    // Sauvegarder les médias
    async saveMediaFiles(mediaFiles, baseName) {
        const mediaPaths = [];
        
        for (let i = 0; i < mediaFiles.length; i++) {
            const file = mediaFiles[i];
            const extension = this.getFileExtension(file.name);
            const mediaFileName = `${baseName}_media_${i}${extension}`;
            const mediaPath = this.mediaPath + mediaFileName;
            
            try {
                await this.saveMediaFile(file, mediaPath);
                mediaPaths.push({
                    originalName: file.name,
                    savedPath: mediaPath,
                    type: file.type,
                    size: file.size
                });
            } catch (error) {
                console.error(`Erreur sauvegarde média:`, error);
            }
        }
        
        return mediaPaths;
    }

    // Télécharger les fichiers média
    downloadMediaFiles(mediaPaths, baseName) {
        mediaPaths.forEach((media, index) => {
            const mediaData = localStorage.getItem(`media_${media.savedPath}`);
            if (mediaData) {
                const mediaObj = JSON.parse(mediaData);
                const a = document.createElement('a');
                a.href = mediaObj.data;
                a.download = `${baseName}_media_${index}${this.getFileExtension(media.originalName)}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
    }

    // Sauvegarder un média
    async saveMediaFile(file, path) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const mediaData = {
                        name: file.name,
                        type: file.type,
                        data: e.target.result,
                        savedAt: new Date().toISOString()
                    };
                    localStorage.setItem(`media_${path}`, JSON.stringify(mediaData));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur lecture fichier'));
            reader.readAsDataURL(file);
        });
    }

    // Obtenir l'extension
    getFileExtension(filename) {
        return '.' + filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    }

    // Sauvegarder dans localStorage
    async saveToLocalStorage(report) {
        const fileData = {
            content: JSON.stringify(report),
            savedAt: new Date().toISOString(),
            path: report.filePath
        };
        localStorage.setItem(`file_${report.filePath}`, JSON.stringify(fileData));
        this.updateReportsIndex(report);
    }

    // Mettre à jour l'index
    updateReportsIndex(report) {
        try {
            const indexKey = 'sakai_reports_index';
            let index = JSON.parse(localStorage.getItem(indexKey) || '[]');
            
            const existingIndex = index.findIndex(item => item.id === report.id);
            if (existingIndex !== -1) {
                index[existingIndex] = {
                    id: report.id,
                    category: report.category,
                    subcategory: report.subcategory,
                    title: report.title,
                    date: report.date,
                    visibility: report.visibility,
                    filePath: report.filePath,
                    savedAt: report.savedAt
                };
            } else {
                index.push({
                    id: report.id,
                    category: report.category,
                    subcategory: report.subcategory,
                    title: report.title,
                    date: report.date,
                    visibility: report.visibility,
                    filePath: report.filePath,
                    savedAt: report.savedAt
                });
            }
            
            index.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
            localStorage.setItem(indexKey, JSON.stringify(index));
        } catch (error) {
            console.error('Erreur index:', error);
        }
    }

    // Charger tous les rapports
    loadAllReports() {
        try {
            const indexKey = 'sakai_reports_index';
            const index = JSON.parse(localStorage.getItem(indexKey) || '[]');
            
            const reports = index.map(indexItem => {
                try {
                    const fileData = localStorage.getItem(`file_${indexItem.filePath}`);
                    if (fileData) {
                        const parsedData = JSON.parse(fileData);
                        return JSON.parse(parsedData.content);
                    }
                } catch (error) {
                    console.error(`Erreur chargement:`, error);
                }
                return null;
            }).filter(report => report !== null);
            
            return reports;
        } catch (error) {
            console.error('Erreur chargement rapports:', error);
            return [];
        }
    }

    // Charger un rapport
    loadReport(reportId) {
        try {
            const reports = this.loadAllReports();
            return reports.find(report => report.id === parseInt(reportId) || report.id === reportId);
        } catch (error) {
            console.error('Erreur chargement rapport:', error);
            return null;
        }
    }

    // Supprimer un rapport
    async deleteReport(reportId) {
        try {
            const indexKey = 'sakai_reports_index';
            let index = JSON.parse(localStorage.getItem(indexKey) || '[]');
            const reportToDelete = index.find(item => item.id === parseInt(reportId) || item.id === reportId);
            
            if (reportToDelete) {
                localStorage.removeItem(`file_${reportToDelete.filePath}`);
                
                const report = this.loadReport(reportId);
                if (report && report.mediaPaths) {
                    report.mediaPaths.forEach(media => {
                        localStorage.removeItem(`media_${media.savedPath}`);
                    });
                }
                
                index = index.filter(item => item.id !== parseInt(reportId) && item.id !== reportId);
                localStorage.setItem(indexKey, JSON.stringify(index));
                
                return { success: true };
            }
            
            return { success: false, error: 'Rapport non trouvé' };
        } catch (error) {
            console.error('Erreur suppression:', error);
            return { success: false, error: error.message };
        }
    }

    // Exporter tous les rapports
    exportAllReports() {
        try {
            const reports = this.loadAllReports();
            const exportData = {
                exportedAt: new Date().toISOString(),
                totalReports: reports.length,
                reports: reports
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sakai_reports_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.error('Erreur export:', error);
            return { success: false, error: error.message };
        }
    }
}

// Instance globale
const reportSaver = new LocalReportSaver();
window.reportSaver = reportSaver;