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
                
                const formData = new FormData(this);
                const reportData = {
                    title: formData.get('title'),
                    type: formData.get('type'),
                    date: formData.get('date'),
                    content: formData.get('content'),
                    status: formData.get('status')
                };
                
                // Simulation d'enregistrement
                if (saveReport(reportData)) {
                    showNotification('Rapport enregistré avec succès!', 'success');
                    this.reset();
                } else {
                    showNotification('Erreur lors de l\'enregistrement', 'error');
                }
            });
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
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            return false;
        }
    }
    
    // Affichage des notifications
    function showNotification(message, type = 'info') {
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
    
    // Chargement des rapports
    function loadReports() {
        const reportsContainer = document.getElementById('reports-container');
        if (!reportsContainer) return;
        
        try {
            const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
            
            if (reports.length === 0) {
                reportsContainer.innerHTML = `
                    <div class="no-reports">
                        <p>Aucun rapport enregistré pour le moment.</p>
                        <a href="nouveau-rapport.html" class="btn-new-report">Créer un premier rapport</a>
                    </div>
                `;
                return;
            }
            
            // Trier par date décroissante
            reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Générer l'affichage
            reportsContainer.innerHTML = reports.map(report => `
                <div class="report-card">
                    <div class="report-header">
                        <h3>${report.title}</h3>
                        <span class="report-type ${report.type}">${report.type}</span>
                    </div>
                    <div class="report-meta">
                        <span>Date: ${new Date(report.date).toLocaleDateString('fr-FR')}</span>
                        <span class="report-status ${report.status}">${report.status}</span>
                    </div>
                    <div class="report-content">
                        <p>${report.content.substring(0, 200)}...</p>
                    </div>
                    <div class="report-actions">
                        <button onclick="viewReport(${report.id})" class="btn-view">Voir</button>
                        <button onclick="deleteReport(${report.id})" class="btn-delete">Supprimer</button>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Erreur chargement rapports:', error);
            reportsContainer.innerHTML = '<p>Erreur lors du chargement des rapports.</p>';
        }
    }
    
    // Fonctions globales
    window.viewReport = function(reportId) {
        const reports = JSON.parse(localStorage.getItem('sakai_reports') || '[]');
        const report = reports.find(r => r.id === reportId);
        
        if (report) {
            alert(`Rapport: ${report.title}\n\n${report.content}`);
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
    
    // Charger les rapports si on est sur la page des missions
    if (window.location.pathname.includes('missions.html') || 
        window.location.pathname.includes('divert.html')) {
        loadReports();
    }
    
    // Effet de saisie pour le titre hero
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        heroTitle.style.animation = 'typing 3s steps(20)';
    }
});

// Animation de frappe pour le titre
const style = document.createElement('style');
style.textContent = `
    @keyframes typing {
        from { width: 0 }
        to { width: 100% }
    }
    
    .no-reports {
        text-align: center;
        padding: 3rem;
        color: #888;
    }
    
    .report-card {
        background: #1a1a1a;
        border: 1px solid #8b0000;
        border-radius: 10px;
        padding: 1.5rem;
        margin-bottom: 1rem;
    }
    
    .report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .report-type {
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        font-weight: bold;
    }
    
    .report-type.mission { background: #2d5a27; }
    .report-type.divert { background: #5a4d27; }
    
    .report-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: #888;
    }
    
    .report-status {
        padding: 0.2rem 0.6rem;
        border-radius: 10px;
        font-size: 0.8rem;
    }
    
    .report-status.completed { background: #2d5a27; }
    .report-status.pending { background: #5a4d27; }
    .report-status.failed { background: #5a2727; }
    
    .report-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }
    
    .btn-view, .btn-delete {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
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
    }
`;
document.head.appendChild(style);