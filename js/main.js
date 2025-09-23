// Navigation et fonctionnalités principales
document.addEventListener('DOMContentLoaded', function() {
    console.log('Archives de Sakai - Chargement terminé');
    
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
            reportForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Récupération des données du formulaire
                const title = document.getElementById('report-title').value;
                const type = document.getElementById('report-type').value;
                const date = document.getElementById('report-date').value;
                const content = document.getElementById('report-content').value;
                const location = document.getElementById('report-location').value;
                const objective = document.getElementById('report-objective').value;
                const visibility = document.getElementById('report-visibility').value;
                
                // Validation
                if (!title || !type || !date || !content || !location || !visibility) {
                    showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
                    return;
                }
                
                const reportData = {
                    title: title,
                    type: type,
                    date: date,
                    content: content,
                    location: location,
                    objective: objective,
                    visibility: visibility,
                    status: 'completed'
                };
                
                // Enregistrement
                if (saveReport(reportData)) {
                    showNotification('Rapport scellé dans le sang avec succès!', 'success');
                    this.reset();
                    
                    // Remettre la date du jour
                    const dateInput = document.getElementById('report-date');
                    if (dateInput) {
                        const today = new Date().toISOString().split('T')[0];
                        dateInput.value = today;
                    }
                    
                    // Afficher le modal de confirmation
                    const modal = document.getElementById('confirmation-modal');
                    if (modal) {
                        modal.style.display = 'block';
                        
                        // Gérer les boutons du modal
                        document.getElementById('btn-new-report').addEventListener('click', function() {
                            modal.style.display = 'none';
                            reportForm.reset();
                            const dateInput = document.getElementById('report-date');
                            if (dateInput) {
                                const today = new Date().toISOString().split('T')[0];
                                dateInput.value = today;
                            }
                        });
                        
                        document.getElementById('btn-view-reports').addEventListener('click', function() {
                            if (type === 'mission') {
                                window.location.href = 'missions.html';
                            } else {
                                window.location.href = 'divert.html';
                            }
                        });
                        
                        // Fermer le modal avec la croix
                        document.querySelector('.modal-close').addEventListener('click', function() {
                            modal.style.display = 'none';
                        });
                        
                        // Fermer le modal en cliquant à l'extérieur
                        window.addEventListener('click', function(e) {
                            if (e.target === modal) {
                                modal.style.display = 'none';
                            }
                        });
                    }
                } else {
                    showNotification('Erreur lors de l\'enregistrement', 'error');
                }
            });
            
            // Gestion du bouton brouillon
            const draftBtn = document.getElementById('btn-draft');
            if (draftBtn) {
                draftBtn.addEventListener('click', function() {
                    showNotification('Brouillon sauvegardé localement', 'success');
                });
            }
        }
    }
    
    // Simulation de sauvegarde
    function saveReport(reportData) {
        try {
            // Récupérer les rapports existants
            const existingReports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            
            // Ajouter le nouveau rapport
            reportData.id = Date.now();
            reportData.timestamp = new Date().toISOString();
            existingReports.push(reportData);
            
            // Sauvegarder
            localStorage.setItem('sakai_reports', JSON.stringify(existingReports));
            
            // Mettre à jour les statistiques
            updateMissionStats();
            
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            return false;
        }
    }
    
    // Mise à jour des statistiques des missions
    function updateMissionStats() {
        // Pour la page missions.html
        if (window.location.pathname.includes('missions.html')) {
            const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            const missionReports = reports.filter(r => r.type === 'mission');
            
            const totalMissions = document.getElementById('total-missions');
            const lastUpdate = document.getElementById('last-update');
            
            if (totalMissions) {
                totalMissions.textContent = missionReports.length;
            }
            
            if (lastUpdate && missionReports.length > 0) {
                const latestReport = missionReports.reduce((latest, report) => {
                    return new Date(report.timestamp) > new Date(latest.timestamp) ? report : latest;
                }, missionReports[0]);
                
                lastUpdate.textContent = new Date(latestReport.timestamp).toLocaleDateString('fr-FR');
            } else if (lastUpdate) {
                lastUpdate.textContent = '--/--/----';
            }
        }
        
        // Pour la page divert.html
        if (window.location.pathname.includes('divert.html')) {
            const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            const divertReports = reports.filter(r => r.type === 'zone' || r.type === 'divers');
            
            const totalDivert = document.getElementById('total-divert');
            const lastUpdateDivert = document.getElementById('last-update-divert');
            
            if (totalDivert) {
                totalDivert.textContent = divertReports.length;
            }
            
            if (lastUpdateDivert && divertReports.length > 0) {
                const latestReport = divertReports.reduce((latest, report) => {
                    return new Date(report.timestamp) > new Date(latest.timestamp) ? report : latest;
                }, divertReports[0]);
                
                lastUpdateDivert.textContent = new Date(latestReport.timestamp).toLocaleDateString('fr-FR');
            } else if (lastUpdateDivert) {
                lastUpdateDivert.textContent = '--/--/----';
            }
        }
    }
    
    // Gestion des filtres pour Divert
    function initDivertFilters() {
        const visibilityFilter = document.getElementById('divert-visibility');
        if (visibilityFilter) {
            visibilityFilter.addEventListener('change', function() {
                filterDivertReports();
            });
        }
    }
    
    // Gestion des filtres pour Missions
    function initMissionFilters() {
        const visibilityFilter = document.getElementById('mission-visibility');
        if (visibilityFilter) {
            visibilityFilter.addEventListener('change', function() {
                filterMissionReports();
            });
        }
    }
    
    // Filtrer les rapports Divert
    function filterDivertReports() {
        const visibilityFilter = document.getElementById('divert-visibility');
        const selectedVisibility = visibilityFilter ? visibilityFilter.value : 'all';
        
        const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
        let divertReports = reports.filter(r => r.type === 'zone' || r.type === 'divers');
        
        // Appliquer le filtre de visibilité
        if (selectedVisibility !== 'all') {
            divertReports = divertReports.filter(report => report.visibility === selectedVisibility);
        }
        
        const divertContainer = document.getElementById('divert-container');
        if (!divertContainer) return;
        
        if (divertReports.length === 0) {
            divertContainer.innerHTML = `
                <div class="no-reports">
                    <div class="no-reports-icon">🌑</div>
                    <h3>Aucun rapport divert disponible</h3>
                    <p>Aucune observation n'a encore été archivée dans le sang</p>
                </div>
            `;
        } else {
            divertContainer.innerHTML = divertReports.map(report => `
                <div class="report-card divert-card">
                    <div class="report-header">
                        <h3>${report.title}</h3>
                        <span class="report-type-badge">${getTypeLabel(report.type)}</span>
                        <span class="report-visibility-badge ${report.visibility}">${getVisibilityLabel(report.visibility)}</span>
                    </div>
                    <div class="report-meta">
                        <span class="report-date">${new Date(report.date).toLocaleDateString('fr-FR')}</span>
                        <span class="report-location">${report.location || 'Non spécifié'}</span>
                    </div>
                    <div class="report-content">
                        ${report.objective ? `<p class="report-objective"><strong>Objectif:</strong> ${report.objective}</p>` : ''}
                        <p>${report.content.substring(0, 120)}...</p>
                    </div>
                    <div class="report-footer">
                        <span class="report-status">Statut: ${report.status || 'Complété'}</span>
                        <div class="report-actions">
                            <button onclick="viewReport(${report.id})" class="btn-view">📖 Voir</button>
                            <button onclick="deleteReport(${report.id})" class="btn-delete">🗑️ Supprimer</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Mettre à jour les statistiques
        updateMissionStats();
    }
    
    // Filtrer les rapports Missions
    function filterMissionReports() {
        const visibilityFilter = document.getElementById('mission-visibility');
        const selectedVisibility = visibilityFilter ? visibilityFilter.value : 'all';
        
        const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
        let missionReports = reports.filter(r => r.type === 'mission');
        
        // Appliquer le filtre de visibilité
        if (selectedVisibility !== 'all') {
            missionReports = missionReports.filter(report => report.visibility === selectedVisibility);
        }
        
        const missionsContainer = document.getElementById('missions-container');
        if (!missionsContainer) return;
        
        if (missionReports.length === 0) {
            missionsContainer.innerHTML = `
                <div class="no-reports">
                    <div class="no-reports-icon">🩸</div>
                    <h3>Aucun rapport de mission disponible</h3>
                    <p>Les archives sanguinaires sont actuellement vides</p>
                </div>
            `;
        } else {
            missionsContainer.innerHTML = missionReports.map(report => `
                <div class="report-card mission-card">
                    <div class="report-header">
                        <h3>${report.title}</h3>
                        <span class="report-visibility-badge ${report.visibility}">${getVisibilityLabel(report.visibility)}</span>
                    </div>
                    <div class="report-meta">
                        <span class="report-date">${new Date(report.date).toLocaleDateString('fr-FR')}</span>
                        <span class="report-location">${report.location || 'Non spécifié'}</span>
                    </div>
                    <div class="report-content">
                        <p>${report.content.substring(0, 150)}...</p>
                    </div>
                    <div class="report-footer">
                        <span class="report-status">Statut: ${report.status || 'Complété'}</span>
                        <div class="report-actions">
                            <button onclick="viewReport(${report.id})" class="btn-view">📖 Voir</button>
                            <button onclick="deleteReport(${report.id})" class="btn-delete">🗑️ Supprimer</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Mettre à jour les statistiques
        updateMissionStats();
    }
    
    // Chargement des rapports
    function loadReports() {
        const missionsContainer = document.getElementById('missions-container');
        const divertContainer = document.getElementById('divert-container');
        
        if (!missionsContainer && !divertContainer) return;
        
        try {
            const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            
            // Trier par date décroissante
            reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Générer l'affichage pour missions.html
            if (missionsContainer) {
                filterMissionReports(); // Utiliser la fonction de filtrage
            }
            
            // Générer l'affichage pour divert.html
            if (divertContainer) {
                filterDivertReports(); // Utiliser la fonction de filtrage
            }
            
            // Mettre à jour les statistiques
            updateMissionStats();
            
        } catch (error) {
            console.error('Erreur chargement rapports:', error);
            if (missionsContainer) missionsContainer.innerHTML = '<p>Erreur lors du chargement des rapports.</p>';
            if (divertContainer) divertContainer.innerHTML = '<p>Erreur lors du chargement des rapports.</p>';
        }
    }
    
    // Helper functions
    function getTypeLabel(type) {
        const labels = {
            'zone': 'Rapport sur Zone',
            'divers': 'Rapport Divers',
            'mission': 'Mission'
        };
        return labels[type] || type;
    }
    
    function getVisibilityLabel(visibility) {
        const labels = {
            'standard': 'Standard',
            'power': 'Gerant Pouvoir',
            'sphere': 'Gerant Sphere',
            'moons': 'Lune'
        };
        return labels[visibility] || visibility;
    }
    
    // Affichage des notifications
    function showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Styles pour la notification
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
        
        // Auto-suppression après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Fonctions globales
    window.viewReport = function(reportId) {
        const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
            let content = `Rapport: ${report.title}\n\n`;
            content += `Type: ${getTypeLabel(report.type)}\n`;
            content += `Date: ${new Date(report.date).toLocaleDateString('fr-FR')}\n`;
            content += `Localisation: ${report.location || 'Non spécifié'}\n`;
            content += `Visibilité: ${getVisibilityLabel(report.visibility)}\n`;
            
            if (report.objective) {
                content += `\nObjectif:\n${report.objective}\n`;
            }
            
            content += `\nContenu:\n${report.content}`;
            
            alert(content);
        }
    };
    
    window.deleteReport = function(reportId) {
        if (confirm('Supprimer ce rapport définitivement?')) {
            const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            const filteredReports = reports.filter(r => r.id !== reportId);
            
            localStorage.setItem('sakai_reports', JSON.stringify(filteredReports));
            loadReports();
            showNotification('Rapport supprimé', 'success');
        }
    };
    
    // Initialisation
    setActiveNavLink();
    animateOnScroll();
    initReportForm();
    initDivertFilters();
    initMissionFilters();
    
    // Charger les rapports si on est sur la page des missions ou divert
    if (window.location.pathname.includes('missions.html') || 
        window.location.pathname.includes('divert.html')) {
        loadReports();
    }
    
    // Mettre la date du jour dans le formulaire nouveau rapport
    if (window.location.pathname.includes('nouveau-rapport.html')) {
        const dateInput = document.getElementById('report-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Cacher le modal par défaut
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
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
    
    .report-visibility-badge {
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
        white-space: nowrap;
    }
    
    .report-visibility-badge.standard { background: #2d5a27; }
    .report-visibility-badge.power { background: #5a4d27; }
    .report-visibility-badge.sphere { background: #8b4513; }
    .report-visibility-badge.moons { background: #8b0000; }
    
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
    
    .btn-view, .btn-delete {
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
    
    .btn-view:hover, .btn-delete:hover {
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
    
    .modal-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1.5rem;
        justify-content: center;
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