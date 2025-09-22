// Gestion des modales - Version corrigée
class ModalManager {
    constructor() {
        this.modal = document.getElementById('rapport-modal');
        this.modalTitre = document.getElementById('modal-titre');
        this.modalContenu = document.getElementById('modal-contenu');
        this.closeModal = document.querySelector('.close-modal');
        
        if (this.modal) {
            this.init();
        }
    }

    init() {
        this.closeModal.addEventListener('click', () => this.fermerModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.fermerModal();
            }
        });
        
        // Fermer avec la touche Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.fermerModal();
            }
        });
    }

    ouvrirRapport(rapport, type) {
        if (!this.modal) {
            console.log('Modal non trouvée');
            return;
        }
        
        this.modalTitre.textContent = rapport.titre;
        
        let preuvesHTML = '';
        if (rapport.preuves && rapport.preuves.length > 0) {
            preuvesHTML = this.genererPreuvesHTML(rapport.preuves);
        }
        
        this.modalContenu.innerHTML = rapport.contenu + preuvesHTML;
        this.modal.style.display = 'block';
        
        // Empêcher le défilement du body quand la modale est ouverte
        document.body.style.overflow = 'hidden';
    }

    genererPreuvesHTML(preuves) {
        return `
            <div class="modal-section">
                <h3>Preuves</h3>
                <div class="preuves-grid">
                    ${preuves.map(preuve => `
                        <div class="preuve-item">
                            ${preuve.type === 'image' 
                                ? `<img src="${preuve.src}" alt="${preuve.legende}" onerror="this.style.display='none'">` 
                                : `<video controls><source src="${preuve.src}" type="video/mp4">Vidéo non supportée</video>`}
                            <div class="preuve-legende">${preuve.legende}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    fermerModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
}

// Initialiser le gestionnaire de modales si la modal existe sur la page
if (document.getElementById('rapport-modal')) {
    const modalManager = new ModalManager();
}