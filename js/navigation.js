// Navigation entre sections
class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.section');
        this.init();
    }

    init() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e, link));
        });
    }

    handleNavigation(e, link) {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Mettre à jour la navigation active
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Afficher la section cible
        this.sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetSection) {
                section.classList.add('active');
            }
        });
        
        // Charger les rapports si nécessaire
        if (targetSection === 'missions') {
            rapportsManager.chargerRapportsMissions();
        } else if (targetSection === 'divert') {
            rapportsManager.chargerRapportsDivert();
        }
    }
}

// Initialiser la navigation
const navigation = new Navigation();