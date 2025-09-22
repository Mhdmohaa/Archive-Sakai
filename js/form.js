// Gestion du formulaire - Version corrigée
class FormManager {
    constructor() {
        this.form = document.getElementById('nouveau-rapport-form');
        if (this.form) {
            this.init();
        }
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Mettre la date du jour par défaut
        const dateInput = document.getElementById('date-rapport');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const type = document.getElementById('type-rapport').value;
        const titre = document.getElementById('titre-rapport').value;
        const date = document.getElementById('date-rapport').value;
        const contenu = document.getElementById('contenu-rapport').value;
        const preuves = document.getElementById('preuves-rapport').files;
        
        // Validation basique
        if (!type || !titre || !date || !contenu) {
            this.afficherMessage('Veuillez remplir tous les champs obligatoires.', 'error');
            return;
        }
        
        // Simuler l'envoi du rapport
        this.simulerEnvoiRapport({ type, titre, date, contenu, preuves });
    }

    simulerEnvoiRapport(rapport) {
        // Afficher un message de confirmation stylé
        this.afficherMessage(
            `Rapport "${rapport.titre}" scellé dans le sang avec succès.\n\nCes données seront archivées dans la base sanguinaire des Veilleurs.`, 
            'success'
        );
        
        // Réinitialiser le formulaire
        this.form.reset();
        
        // Remettre la date du jour
        const dateInput = document.getElementById('date-rapport');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }

    afficherMessage(message, type) {
        // Créer un message stylé
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            background: ${type === 'success' ? 'var(--blood-dark)' : '#8b0000'};
            border: 2px solid ${type === 'success' ? 'var(--blood-light)' : '#ff4444'};
            box-shadow: var(--shadow-heavy);
        `;
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // Supprimer le message après 5 secondes
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialiser le gestionnaire de formulaire si le formulaire existe
if (document.getElementById('nouveau-rapport-form')) {
    const formManager = new FormManager();
}