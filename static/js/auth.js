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
    async register(event) {
        event.preventDefault();

        const firstName = document.getElementById('register-firstname').value.trim();
        const lastName = document.getElementById('register-lastname').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();

        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Registration failed');
                return;
            }

            alert('Registration successful. Please login.');
            this.toggleForms();
        } catch (error) {
            console.error(error);
            alert('Server error during registration');
        }

        /** UIManager.logTerminal("logAuthReq", "text-blue-400");
        *
        * setTimeout(() => {
        *     UIManager.showToast("toastRegSuccessTitle", "toastRegSuccessDesc", "success");
        *     this.toggleForms();
        * }, 600);
        */
    },

    /**
     * Simulates the authentication payload validation and activates the session.
     * @param {Event} event - HTML Form submission event.
     */
    async authenticate(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Login failed');
                return;
            }

            AppState.isAuthenticated = true; // Unlock the game state
            localStorage.setItem('logged_in_user', data.user);

            // Transition layout views
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('game-section').classList.remove('opacity-80');

            const dict = translations[AppState.lang];
            const statusContainer = document.getElementById('user-status-container');
            statusContainer.classList.replace('bg-slate-700', 'bg-slate-800');
            statusContainer.innerHTML = `${dict.statusOnline} (${data.user})`; // `<i class="fas fa-user-check text-emerald-400 mr-1"></i> <span id="user-status-text" data-i18n="statusOnline">${dict.statusOnline}</span>`

            UIManager.logTerminal("logAuthSuccess", "text-emerald-400 font-bold");
            UIManager.logTerminal("logAwaitRoll");
            UIManager.showToast("toastLoginSuccessTitle", "toastLoginSuccessDesc", "success");
        } catch (error){
            console.error(error);
            alert('Server error during login');
        }
    }
};
