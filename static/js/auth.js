/**
 * Helper function for attaching JWT Authorization headers to outgoing API requests.
 * @returns {Object} HTTP headers required for secure JSON communication.
 */
function getApiHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    };
}

function validatePasswordPolicy(password, username) {
    const commonPasswords = [
        "12345678",
        "123456789",
        "password",
        "Aa123456",
        "1234567890",
        "password123",
        "Pass@123",
        "admin123",
        "12345678910",
        "P@ssw0rd",
        "Password",
        "Aa@123456"
    ];

    if (!password) {
        return "The password is mandatory.";
    }

    if (password.length < 8) {
        return "The password must have at least 8 characters.";
    }

    if (password.length > 64) {
        return "The password must have a maximum of 64 characters.";
    }

    if (commonPasswords.includes(password.toLowerCase())) {
        return "The password is very common. Choose a stronger password.";
    }

    if (username && password.toLowerCase().includes(username.toLowerCase())) {
        return "The password must not contain the username.";
    }

    return null;
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
        
        if (!firstName || !lastName || !username || !password) {
            UIManager.showToast("errRegTitle", "All fields are required", "error");
            return;
        }

        const passwordError = validatePasswordPolicy(password, username);
        if (passwordError) {
            UIManager.showToast("errRegTitle", passwordError, "error");
            return;
        }

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

            localStorage.setItem("jwt_token", data.token); // save the actual JWT token here
            localStorage.setItem("logged_in_user", data.user);

            // Authentication successful: Activate game state and store session data
            AppState.isAuthenticated = true; // Unlock the game state

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
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('logged_in_user');
        AppState.isAuthenticated = false;

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
    },

    /**
     * Checks if there is an active session in localStorage during page load.
     * If a token is found, it restores the UI to the "Logged In" state.
     */
    checkExistingSession() {
        const token = localStorage.getItem('jwt_token');
        const user = localStorage.getItem('logged_in_user');

        if (token && user) {
            // Reinstantiate the JavaScript memory state to reflect an active session
            AppState.isAuthenticated = true;

            // Restore UI to reflect logged-in status
            document.getElementById('auth-section').classList.add('hidden');
            document.getElementById('game-section').classList.remove('opacity-80');
            document.getElementById('btn-logout').classList.remove('hidden');

            // Restore user status badge with username
            const dict = translations[AppState.lang];
            const statusContainer = document.getElementById('user-status-container');
            statusContainer.classList.replace('bg-slate-700', 'bg-slate-800');
            statusContainer.innerHTML = `<i class="fas fa-user-check text-emerald-400 mr-1"></i> <span id="user-status-text">${dict.statusOnline} (${user})</span>`;

            // Log session restoration in the protocol terminal for transparency
            UIManager.logTerminal("Active session found. Automatic reconnection.", "text-emerald-400 italic");
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    AuthService.checkExistingSession();
});