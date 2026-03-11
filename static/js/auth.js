/**
 * Helper για τα API Requests (Ο Dev 1 θα βάλει εδώ το JWT Token του αργότερα)
 */
function getApiHeaders() {
    return {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` // Για τον Dev 1
    };
}

/**
 * Authentication Service
 * Handles user registration, login mechanics, and layout switching.
 */
const AuthService = {
    /**
     * Toggles visibility between the Login and Registration forms.
     */
    toggleForms() {
        document.getElementById('form-login').classList.toggle('hidden');
        document.getElementById('form-register').classList.toggle('hidden');
    },

    /**
     * Simulates the registration workflow.
     * @param {Event} event - HTML Form submission event.
     */
    register(event) {
        event.preventDefault();
        UIManager.logTerminal("logAuthReq", "text-blue-400");
        
        setTimeout(() => {
            UIManager.showToast("toastRegSuccessTitle", "toastRegSuccessDesc", "success");
            this.toggleForms();
        }, 600);
    },

    /**
     * Simulates the authentication payload validation and activates the session.
     * @param {Event} event - HTML Form submission event.
     */
    authenticate(event) {
        event.preventDefault();
        AppState.isAuthenticated = true; // Unlock the game state
        
        // Transition layout views
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('game-section').classList.remove('opacity-80');
        
        const dict = translations[AppState.lang];
        const statusContainer = document.getElementById('user-status-container');
        statusContainer.classList.replace('bg-slate-700', 'bg-slate-800');
        statusContainer.innerHTML = `<i class="fas fa-user-check text-emerald-400 mr-1"></i> <span id="user-status-text" data-i18n="statusOnline">${dict.statusOnline}</span>`;
        
        UIManager.logTerminal("logAuthSuccess", "text-emerald-400 font-bold");
        UIManager.logTerminal("logAwaitRoll");
        UIManager.showToast("toastLoginSuccessTitle", "toastLoginSuccessDesc", "success");
    }
};
