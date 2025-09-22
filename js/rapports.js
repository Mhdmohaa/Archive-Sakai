// Gestion des rapports - Version corrigée
class RapportsManager {
    constructor() {
        console.log('RapportsManager initialisé');
        this.missionGrid = document.getElementById('missions-grid');
        this.divertGrid = document.getElementById('divert-grid');
        
        this.init();
    }

    init() {
        // Vérifier sur quelle page on est et charger les rapports appropriés
        if (window.location.pathname.includes('missions.html') && this.missionGrid) {
            console.log('Chargement des rapports de mission');
            this.chargerRapportsMissions();
        }
        
        if (window.location.pathname.includes('divert.html') && this.divertGrid) {
            console.log('Chargement des rapports divert');
            this.chargerRapportsDivert();
        }
    }

    chargerRapportsMissions() {
        if (!this.missionGrid) {
            console.error('ERREUR: Element missions-grid non trouvé');
            return;
        }
        
        this.missionGrid.innerHTML = '';
        
        if (!rapports.missions || rapports.missions.length === 0) {
            console.log('Aucun rapport de mission trouvé');
            this.afficherAucunRapport(this.missionGrid, 'mission');
            return;
        }
        
        console.log(`${rapports.missions.length} rapports de mission à charger`);
        rapports.missions.forEach(mission => {
            const card = this.creerCarteRapport(mission, 'mission');
            this.missionGrid.appendChild(card);
        });
    }

    chargerRapportsDivert() {
        if (!this.divertGrid) {
            console.error('ERREUR: Element divert-grid non trouvé');
            return;
        }
        
        this.divertGrid.innerHTML = '';
        
        if (!rapports.divert || rapports.divert.length === 0) {
            console.log('Aucun rapport divert trouvé');
            this.afficherAucunRapport(this.divertGrid, 'divert');
            return;
        }
        
        console.log(`${rapports.divert.length} rapports divert à charger`);
        rapports.divert.forEach(divert => {
            const card = this.creerCarteRapport(divert, 'divert');
            this.divertGrid.appendChild(card);
        });
    }

    afficherAucunRapport(container, type) {
        const message = document.createElement('div');
        message.className = 'no-reports';
        message.innerHTML = `
            <div class="no-reports-icon">${type === 'mission' ? '🩸' : '🌑'}</div>
            <h3>Aucun rapport disponible</h3>
            <p>${type === 'mission' ? 'Les archives sanguinaires sont actuellement vides.' : 'Aucune observation n\'a encore été archivée dans le sang.'}</p>
            <a href="nouveau-rapport.html" class="btn">Créer le premier rapport</a>
        `;
        container.appendChild(message);
    }

    creerCarteRapport(rapport, type) {
        const card = document.createElement('div');
        card.className = `card ${type}-card`;
        card.setAttribute('data-id', rapport.id);
        
        if (type === 'mission') {
            card.innerHTML = `
                <h3>${rapport.titre}</h3>
                <div class="mission-date">Date: ${rapport.date}</div>
                <div class="mission-objective">Objectif: ${rapport.objectif}</div>
            `;
        } else {
            card.innerHTML = `
                <h3>${rapport.titre}</h3>
                <div class="divert-date">Date: ${rapport.date}</div>
                <div class="divert-zone">Zone: ${rapport.zone}</div>
            `;
        }
        
        return card;
    }
}

// Initialisation automatique si on est sur une page de rapports
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si on est sur une page qui nécessite les rapports
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('missions.html') || currentPage.includes('divert.html')) {
        console.log('Page de rapports détectée:', currentPage);
        new RapportsManager();
    }
});