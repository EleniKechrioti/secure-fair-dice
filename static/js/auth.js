/**
 * Helper function for attaching JWT Authorization headers to outgoing API requests.
 * @returns {Object} HTTP headers required for secure JSON communication.
 */
function getApiHeaders() {
    return {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` // Un-comment when Dev 1 activates JWT on the Backend
    };
}

/**
 * Authentication Service
 * Handles user registration, login mechanics, JSON Web Token (JWT) management, and layout switching.
 */
const AuthService = {
    
    /**
     * Toggles visibility between the Login and Registration forms in the UI.
     */
    toggleForms() {
        document.getElementById('form-login').classList.toggle('hidden');
        document.getElementById('form-register').classList.toggle('hidden');
    },

    /**
     * Executes the user registration workflow by sending a POST request to the Backend API.
     * @param {Event} event - HTML Form submission event.
     */
    async register(event) {
        event.preventDefault();

        // Extract and trim user input from the DOM
        const firstName = document.getElementById('register-firstname').value.trim();
        const lastName = document.getElementById('register-lastname').value.trim();
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();

        try {
            UIManager.logTerminal("logAuthReq", "text-blue-400");

            // Transmit user data to the registration endpoint
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

            // Handle server-side validation errors (e.g., username already exists)
            if (!response.ok) {
                UIManager.showToast("errRegTitle", data.error || "errRegFallback", "error");
                return;
            }

            // Registration successful: Notify user and switch back to Login form
            UIManager.showToast("toastRegSuccessTitle", "toastRegSuccessDesc", "success");

            setTimeout(() => {
                this.toggleForms();
            }, 600); // 600ms delay for a smooth visual transition

        } catch (error) {
            console.error("Registration Exception:", error);
            UIManager.showToast("errServerTitle", "errServerDesc", "error");
        }
    },

    /**
     * Executes the authentication workflow, retrieves the JWT token, and activates the user session.
     * @param {Event} event - HTML Form submission event.
     */
    async authenticate(event) {
        event.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        try {
            // Transmit credentials to the authentication endpoint
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            // Handle invalid credentials
            if (!response.ok) {
                UIManager.showToast("errLoginTitle", data.error || "errLoginFallback", "error");
                return;
            }

            // Authentication successful: Activate game state and store session data
            AppState.isAuthenticated = true; // Unlock the game state
            localStorage.setItem('logged_in_user', data.user);
            // localStorage.setItem('jwt_token', data.access); // save the actual JWT token here

            // Transition layout views (Hide auth panel, reveal game board)
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('game-section').classList.remove('opacity-80');
            document.getElementById('btn-logout').classList.remove('hidden'); // Reveal logout button

            // Update user status badge
            const dict = translations[AppState.lang];
            const statusContainer = document.getElementById('user-status-container');
            statusContainer.classList.replace('bg-slate-700', 'bg-slate-800');
            statusContainer.innerHTML = `${dict.statusOnline} (${data.user})`;

            // Initialize protocol terminal logs
            UIManager.logTerminal("logAuthSuccess", "text-emerald-400 font-bold");
            UIManager.logTerminal("logAwaitRoll");
            UIManager.showToast("toastLoginSuccessTitle", "toastLoginSuccessDesc", "success");
            
        } catch (error){
            console.error("Login Exception:", error);
            UIManager.showToast("errServerTitle", "errServerDesc", "error");
        }
    },

    /**
     * Executes the Client-side Logout process.
     * Clears user session, removes JWT tokens from local storage, and resets the UI to default state.
     */
    logout() {
        const dict = translations[AppState.lang];

        // Clear session state and securely remove tokens from browser memory
        AppState.isAuthenticated = false;
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('logged_in_user');

        // Reset UI Layout (Hide game board, show login form)
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('game-section').classList.add('opacity-80');
        document.getElementById('btn-logout').classList.add('hidden'); // Hide logout button

        // Reset Status Badge to Offline state
        const statusContainer = document.getElementById('user-status-container');
        statusContainer.classList.replace('bg-slate-800', 'bg-slate-700');
        statusContainer.innerHTML = `<i class="fas fa-user-circle mr-1"></i> <span id="user-status-text">${dict.statusOffline}</span>`;

        // Clear Protocol Terminal logs to prevent data leakage between sessions
        document.getElementById('protocol-logs').innerHTML = `<div>> <span>${dict.termInit}</span></div>`;

        // Provide visual feedback to the user
        UIManager.showToast("toastLogoutTitle", "toastLogoutDesc", "info");
    }
};