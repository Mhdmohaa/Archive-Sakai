// Navigation et fonctionnalités principales
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Archives de Sakai - Chargement terminé');
    
    // Charger les rapports depuis le fichier JSON
    await jsonFileManager.loadAllReports();
    
    // Gestion de la navigation active
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    // Animation des cartes au scroll
    function animateOnScroll() {
        const cards = document.querySelectorAll('.identity-card, .power-card, .method-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
    
    // Gestion du formulaire nouveau rapport
    function initReportForm() {
        const reportForm = document.getElementById('new-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // Récupération des données du formulaire
                const category = document.getElementById('report-category').value;
                const subcategory = document.getElementById('report-subcategory').value;
                const title = document.getElementById('report-title').value;
                const date = document.getElementById('report-date').value;
                const content = document.getElementById('report-content').value;
                const location = document.getElementById('report-location').value;
                const objective = document.getElementById('report-objective').value;
                const visibility = document.getElementById('report-visibility').value || 'all';
                const evidenceInput = document.getElementById('report-evidence');
                const notes = document.getElementById('report-notes').value;
                
                // Validation
                if (!category || !subcategory || !title || !date || !content || !location) {
                    showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
                    return;
                }
                
                // Préparer les données
                const reportData = {
                    category: category,
                    subcategory: subcategory,
                    title: title,
                    date: date,
                    content: content,
                    location: location,
                    objective: objective,
                    visibility: visibility,
                    notes: notes,
                    status: 'finalisé',
                    timestamp: new Date().toISOString()
                };
                
                // Gérer les fichiers média
                if (evidenceInput && evidenceInput.files.length > 0) {
                    reportData.mediaFiles = Array.from(evidenceInput.files);
                }
                
                // Afficher un indicateur de chargement
                const submitBtn = document.getElementById('btn-submit');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '🩸 Sauvegarde en cours...';
                submitBtn.disabled = true;
                
                try {
                    // Sauvegarder le rapport
                    const result = await jsonFileManager.saveReport(reportData);
                    
                    if (result.success) {
                        showNotification('Rapport scellé dans le sang! Fichier JSON téléchargé.', 'success');
                        
                        // Afficher le modal de confirmation
                        const modal = document.getElementById('confirmation-modal');
                        if (modal) {
                            modal.style.display = 'block';
                            
                            // Gérer les boutons du modal
                            document.getElementById('btn-new-report').addEventListener('click', function() {
                                modal.style.display = 'none';
                                reportForm.reset();
                                setDefaultDate();
                                submitBtn.innerHTML = originalText;
                                submitBtn.disabled = false;
                            });
                            
                            document.getElementById('btn-view-reports').addEventListener('click', function() {
                                if (category === 'pouvoir') {
                                    window.location.href = 'pouvoir.html';
                                } else {
                                    window.location.href = 'sphere.html';
                                }
                            });
                            
                            // Fermer le modal avec la croix
                            document.querySelector('.modal-close').addEventListener('click', function() {
                                modal.style.display = 'none';
                                submitBtn.innerHTML = originalText;
                                submitBtn.disabled = false;
                            });
                            
                            // Fermer le modal en cliquant à l'extérieur
                            window.addEventListener('click', function(e) {
                                if (e.target === modal) {
                                    modal.style.display = 'none';
                                    submitBtn.innerHTML = originalText;
                                    submitBtn.disabled = false;
                                }
                            });
                        }
                    } else {
                        throw new Error(result.error);
                    }
                } catch (error) {
                    console.error('Erreur sauvegarde:', error);
                    showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            });
            
            // Gestion du bouton brouillon
            const draftBtn = document.getElementById('btn-draft');
            if (draftBtn) {
                draftBtn.addEventListener('click', function() {
                    showNotification('Brouillon sauvegardé localement', 'success');
                });
            }
            
            // Définir la date du jour par défaut
            setDefaultDate();
        }
    }
    
    function setDefaultDate() {
        const dateInput = document.getElementById('report-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
    
    // Mise à jour des statistiques
    function updateStats() {
        // Statistiques pour pouvoir.html
        if (window.location.pathname.includes('pouvoir.html')) {
            const pouvoirReports = jsonFileManager.getReportsByCategory('pouvoir');
            
            const totalPouvoir = document.getElementById('total-pouvoir');
            const lastUpdatePouvoir = document.getElementById('last-update-pouvoir');
            
            if (totalPouvoir) totalPouvoir.textContent = pouvoirReports.length;
            if (lastUpdatePouvoir) {
                lastUpdatePouvoir.textContent = pouvoirReports.length > 0 ? 
                    new Date(pouvoirReports[0].savedAt).toLocaleDateString('fr-FR') : '--/--/----';
            }
        }
        
        // Statistiques pour sphere.html
        if (window.location.pathname.includes('sphere.html')) {
            const sphereReports = jsonFileManager.getReportsByCategory('sphere');
            
            const totalSphere = document.getElementById('total-sphere');
            const lastUpdateSphere = document.getElementById('last-update-sphere');
            
            if (totalSphere) totalSphere.textContent = sphereReports.length;
            if (lastUpdateSphere) {
                lastUpdateSphere.textContent = sphereReports.length > 0 ? 
                    new Date(sphereReports[0].savedAt).toLocaleDateString('fr-FR') : '--/--/----';
            }
        }
    }
    
    // Gestion des filtres pour Pouvoir
    function initPouvoirFilters() {
        const subcategoryFilter = document.getElementById('pouvoir-subcategory');
        const visibilityFilter = document.getElementById('pouvoir-visibility');
        
        [subcategoryFilter, visibilityFilter].forEach(filter => {
            if (filter) filter.addEventListener('change', filterPouvoirReports);
        });
    }
    
    // Gestion des filtres pour Sphere
    function initSphereFilters() {
        const subcategoryFilter = document.getElementById('sphere-subcategory');
        const visibilityFilter = document.getElementById('sphere-visibility');
        
        [subcategoryFilter, visibilityFilter].forEach(filter => {
            if (filter) filter.addEventListener('change', filterSphereReports);
        });
    }
    
    // Filtrer les rapports Pouvoir
    function filterPouvoirReports() {
        const subcategoryFilter = document.getElementById('pouvoir-subcategory');
        const visibilityFilter = document.getElementById('pouvoir-visibility');
        
        const selectedSubcategory = subcategoryFilter ? subcategoryFilter.value : 'all';
        const selectedVisibility = visibilityFilter ? visibilityFilter.value : 'all';
        
        let pouvoirReports = jsonFileManager.getReportsByCategory('pouvoir');
        
        // Appliquer les filtres
        if (selectedSubcategory !== 'all') {
            pouvoirReports = pouvoirReports.filter(report => report.subcategory === selectedSubcategory);
        }
        
        if (selectedVisibility !== 'all') {
            pouvoirReports = pouvoirReports.filter(report => report.visibility === selectedVisibility);
        }
        
        displayReports(pouvoirReports, 'pouvoir-container');
        updateStats();
    }
    
    // Filtrer les rapports Sphere
    function filterSphereReports() {
        const subcategoryFilter = document.getElementById('sphere-subcategory');
        const visibilityFilter = document.getElementById('sphere-visibility');
        
        const selectedSubcategory = subcategoryFilter ? subcategoryFilter.value : 'all';
        const selectedVisibility = visibilityFilter ? visibilityFilter.value : 'all';
        
        let sphereReports = jsonFileManager.getReportsByCategory('sphere');
        
        // Appliquer les filtres
        if (selectedSubcategory !== 'all') {
            sphereReports = sphereReports.filter(report => report.subcategory === selectedSubcategory);
        }
        
        if (selectedVisibility !== 'all') {
            sphereReports = sphereReports.filter(report => report.visibility === selectedVisibility);
        }
        
        displayReports(sphereReports, 'sphere-container');
        updateStats();
    }
    
    // Afficher les rapports
function displayReports(reports, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (reports.length === 0) {
        const category = containerId.includes('pouvoir') ? 'Pouvoir' : 'Sphere';
        container.innerHTML = `
            <div class="no-reports">
                <div class="no-reports-icon">${category === 'Pouvoir' ? '⚡' : '🪐'}</div>
                <h3>Aucun rapport ${category} disponible</h3>
                <p>Les archives ${category.toLowerCase()} sont actuellement vides</p>
            </div>
        `;
    } else {
        container.innerHTML = reports.map(report => {
            // Vérifier si le rapport vient du JSON (a une propriété savedAt)
            const isFromJSON = report.savedAt && !report.isLocal;
            
            return `
            <div class="report-card ${report.category}-card">
                <div class="report-header">
                    <h3>${report.title}</h3>
                    <span class="report-type-badge">${getSubcategoryLabel(report.subcategory)}</span>
                </div>
                <div class="report-meta">
                    <span class="report-date">${new Date(report.date).toLocaleDateString('fr-FR')}</span>
                    <span class="report-location">${report.location || 'Non spécifié'}</span>
                </div>
                <div class="report-category-info">
                    <span class="report-visibility-badge ${report.visibility}">${getVisibilityLabel(report.visibility)}</span>
                </div>
                
                ${report.imageFiles && report.imageFiles.length > 0 ? `
                    <div class="report-media">
                        <strong>🖼️ Images référencées:</strong> ${report.imageFiles.length} image(s)
                        <div class="image-references">
                            ${report.imageFiles.map(img => `
                                <div class="image-reference">
                                    <span class="image-name">${img.originalName}</span>
                                    <small class="image-info">${img.type} - ${Math.round(img.size / 1024)} KB</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${report.images && report.images.length > 0 ? `
                    <div class="report-media">
                        <strong>🖼️ Images intégrées:</strong> ${report.images.length} image(s)
                        <div class="image-previews">
                            ${report.images.slice(0, 3).map(image => `
                                <img src="${image.data}" alt="${image.originalName}" class="image-preview">
                            `).join('')}
                            ${report.images.length > 3 ? `<span>+ ${report.images.length - 3} autres</span>` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="report-content">
                    ${report.objective ? `<p class="report-objective"><strong>Objectif:</strong> ${report.objective}</p>` : ''}
                    <p>${report.content.substring(0, 120)}...</p>
                </div>
                <div class="report-footer">
                    <span class="report-status">Statut: ${report.status || 'Complété'}</span>
                    <div class="report-actions">
                        <button onclick="viewReport(${report.id})" class="btn-view">📖 Voir</button>
                        ${!isFromJSON ? `<button onclick="deleteReport(${report.id})" class="btn-delete">🗑️ Supprimer</button>` : ''}
                        ${(report.images && report.images.length > 0) || (report.imageFiles && report.imageFiles.length > 0) ? `
                            <button onclick="viewMedia(${report.id})" class="btn-media">🖼️ Médias</button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `}).join('');
    }
}
    
    // Chargement des rapports
    function loadReports() {
        if (window.location.pathname.includes('pouvoir.html')) {
            filterPouvoirReports();
        } else if (window.location.pathname.includes('sphere.html')) {
            filterSphereReports();
        }
    }
    
    // Helper functions
    function getSubcategoryLabel(subcategory) {
        const labels = {
            'mission': 'Rapport de Mission',
            'divert': 'Rapport Divert'
        };
        return labels[subcategory] || subcategory;
    }
    
    function getVisibilityLabel(visibility) {
        const labels = {
            'all': '👁️ Tout le monde',
            'power': '⚡ Gerant Pouvoir',
            'sphere': '🪐 Gerant Sphere',
            'moons': '🌙 Lune'
        };
        return labels[visibility] || visibility;
    }
    
    // Affichage des notifications
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#2d5a27' : '#5a2727'};
            color: white;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Fonctions globales
    window.viewReport = function(reportId) {
        const report = jsonFileManager.getReport(reportId);
        
        if (report) {
            let content = `Rapport: ${report.title}\n\n`;
            content += `Catégorie: ${report.category === 'pouvoir' ? 'Pouvoir' : 'Sphere'}\n`;
            content += `Type: ${getSubcategoryLabel(report.subcategory)}\n`;
            content += `Date: ${new Date(report.date).toLocaleDateString('fr-FR')}\n`;
            content += `Localisation: ${report.location || 'Non spécifié'}\n`;
            content += `Visibilité: ${getVisibilityLabel(report.visibility)}\n`;
            
            if (report.objective) {
                content += `\nObjectif:\n${report.objective}\n`;
            }
            
            content += `\nContenu:\n${report.content}`;
            
            if (report.notes) {
                content += `\n\nNotes supplémentaires:\n${report.notes}`;
            }
            
            if (report.images && report.images.length > 0) {
    content += `\n\n🖼️ Images (${report.images.length} image(s)):\n`;
    report.images.forEach(image => {
        content += `- ${image.originalName} (${image.type})\n`;
    });
}
            
            // Créer une fenêtre modale pour afficher le rapport
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.cssText = `
                background: #1a1a1a;
                padding: 2rem;
                border-radius: 10px;
                border: 2px solid #8b0000;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
            `;
            
            modalContent.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #ff6b6b; margin: 0;">📖 Rapport Complet</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                <div style="white-space: pre-wrap; font-family: monospace; line-height: 1.4;">${content}</div>
                <div style="margin-top: 1rem; text-align: center;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 0.5rem 1rem; background: #8b0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Fermer</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Fermer en cliquant à l'extérieur
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
    };
    
    window.viewMedia = function(reportId) {
    const report = jsonFileManager.getReport(reportId);
    
    if (report && report.images && report.images.length > 0) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.cssText = `
            background: #1a1a1a;
            padding: 2rem;
            border-radius: 10px;
            border: 2px solid #8b0000;
            max-width: 90vw;
            max-height: 90vh;
            overflow-y: auto;
            color: white;
        `;
        
        let mediaContent = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: #ff6b6b; margin: 0;">🖼️ Images du Rapport</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Rapport:</strong> ${report.title}
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
        `;
        
        report.images.forEach(image => {
            mediaContent += `
                <div style="text-align: center;">
                    <img src="${image.data}" 
                         alt="${image.originalName}" 
                         style="max-width: 100%; max-height: 200px; border: 1px solid #8b0000; border-radius: 5px; margin-bottom: 0.5rem;">
                    <div style="font-size: 0.8rem; color: #ccc;">
                        ${image.originalName}<br>
                        ${Math.round(image.size / 1024)} KB
                    </div>
                </div>
            `;
        });
        
        mediaContent += `
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 0.5rem 1rem; background: #8b0000; color: white; border: none; border-radius: 5px; cursor: pointer;">Fermer</button>
            </div>
        `;
        
        modalContent.innerHTML = mediaContent;
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
};
    
    window.deleteReport = async function(reportId) {
        if (confirm('Supprimer ce rapport définitivement?')) {
            const result = await jsonFileManager.deleteReport(reportId);
            if (result.success) {
                loadReports();
                showNotification('Rapport supprimé', 'success');
            } else {
                showNotification('Erreur lors de la suppression: ' + result.error, 'error');
            }
        }
    };
    
    // Actualiser les rapports
    window.refreshReports = async function() {
        const result = await jsonFileManager.refreshReports();
        loadReports();
        showNotification(`Rapports actualisés (${result.count} rapports)`, 'success');
    };
    
    // Initialisation
    setActiveNavLink();
    animateOnScroll();
    initReportForm();
    initPouvoirFilters();
    initSphereFilters();
    loadReports();
});

// Styles CSS injectés
const style = document.createElement('style');
style.textContent = `
    .no-reports {
        text-align: center;
        padding: 4rem 2rem;
        grid-column: 1 / -1;
        background: rgba(26, 26, 26, 0.5);
        border-radius: 10px;
        border: 2px dashed rgba(139, 0, 0, 0.3);
        margin: 2rem 0;
    }
    
    .no-reports-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.7;
    }
    
    .no-reports h3 {
        color: #ff6b6b;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .no-reports p {
        color: #888;
        font-size: 1rem;
        margin-bottom: 0;
    }
    
    .no-reports-actions {
        margin-top: 2rem;
    }
    
    .report-card {
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        border: 1px solid #8b0000;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .report-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px rgba(139, 0, 0, 0.4);
        border-color: #ff0000;
    }
    
    .report-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
        gap: 1rem;
    }
    
    .report-header h3 {
        color: #ff6b6b;
        margin: 0;
        flex: 1;
    }
    
    .report-type-badge {
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        background: #5a4d27;
        white-space: nowrap;
    }
    
    .report-category-info {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }
    
    .report-visibility-badge {
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        white-space: nowrap;
    }
    
    .report-visibility-badge.all { background: #2d5a27; }
    .report-visibility-badge.power { background: #5a4d27; }
    .report-visibility-badge.sphere { background: #8b4513; }
    .report-visibility-badge.moons { background: #8b0000; }
    
    .report-media {
        padding: 0.5rem;
        background: rgba(139, 0, 0, 0.1);
        border-radius: 5px;
        margin-bottom: 1rem;
        border-left: 3px solid #8b0000;
    }
    
    .report-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #888;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .report-content {
        margin-bottom: 1rem;
        line-height: 1.5;
    }
    
    .report-content p {
        margin-bottom: 0.5rem;
    }
    
    .report-objective {
        font-style: italic;
        color: #aaa;
        margin-bottom: 0.5rem;
    }
    
    .report-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }
    
    .report-status {
        padding: 0.2rem 0.6rem;
        border-radius: 10px;
        font-size: 0.8rem;
        background: rgba(139, 0, 0, 0.3);
        border: 1px solid rgba(139, 0, 0, 0.5);
    }
    
    .report-actions {
        display: flex;
        gap: 0.5rem;
    }
    
    .btn-view, .btn-delete, .btn-media {
        padding: 0.4rem 0.8rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.8rem;
    }
    
    .btn-view {
        background: #2d5a27;
        color: white;
    }
    
    .btn-delete {
        background: #5a2727;
        color: white;
    }
    
    .btn-media {
        background: #5a4d27;
        color: white;
    }
    
    .btn-view:hover, .btn-delete:hover, .btn-media:hover {
        transform: translateY(-2px);
        opacity: 0.9;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: #2d5a27;
        color: white;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideIn 0.3s ease;
    }
    
    .notification.error {
        background: #5a2727;
    }
    
    /* Modal styles */
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
    }
    
    .modal-content {
        background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
        margin: 10% auto;
        padding: 0;
        border: 2px solid #8b0000;
        border-radius: 10px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    
    .modal-header {
        background: linear-gradient(135deg, #2b0000, #1a0000);
        padding: 1.5rem;
        border-bottom: 1px solid #8b0000;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h3 {
        color: #ff6b6b;
        margin: 0;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
    }
    
    .modal-body {
        padding: 2rem;
    }
    
    .file-saved-info {
        background: rgba(139, 0, 0, 0.1);
        padding: 1rem;
        border-radius: 5px;
        margin: 1rem 0;
        border-left: 3px solid #8b0000;
    }
    
    .file-saved-info p {
        margin: 0.5rem 0;
    }
    
    .download-info {
        background: rgba(45, 90, 39, 0.2);
        padding: 1rem;
        border-radius: 5px;
        margin: 1rem 0;
        border-left: 3px solid #2d5a27;
    }
    
    .download-info p {
        margin: 0.5rem 0;
        color: #aaffaa;
    }
    
    .next-steps {
        background: rgba(90, 77, 39, 0.2);
        padding: 1rem;
        border-radius: 5px;
        margin: 1rem 0;
        border-left: 3px solid #5a4d27;
    }
    
    .next-steps h4 {
        color: #ffd700;
        margin-bottom: 0.5rem;
    }
    
    .next-steps ul {
        margin: 0;
        padding-left: 1.5rem;
    }
    
    .next-steps li {
        margin: 0.3rem 0;
        color: #ffd700;
    }
    
    .next-steps code {
        background: rgba(0, 0, 0, 0.3);
        padding: 0.2rem 0.4rem;
        border-radius: 3px;
        font-family: monospace;
        color: #ff6b6b;
    }
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    
    .pouvoir-grid, .sphere-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
        margin-top: 2rem;
    }
    
    .form-actions {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }
    .image-previews {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
    flex-wrap: wrap;
}

.image-preview {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #8b0000;
    border-radius: 5px;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.image-preview:hover {
    transform: scale(1.1);
}

.report-media {
    padding: 0.5rem;
    background: rgba(139, 0, 0, 0.1);
    border-radius: 5px;
    margin-bottom: 1rem;
    border-left: 3px solid #8b0000;
}
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);