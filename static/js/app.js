/**
 * Global Application State
 * @typedef {Object} AppState
 * @property {boolean} isAuthenticated - Tracks if the user session is active.
 * @property {boolean} isProcessingTurn - Mutex lock to prevent multiple roll executions.
 * @property {string} lang - Current active localization locale ('el' or 'en').
 */
const AppState = {
    isAuthenticated: false,
    isProcessingTurn: false,
    lang: 'el'
};

/**
 * FontAwesome icons mapping for standard D6 faces.
 * Index maps to (Dice Value - 1).
 * @constant {string[]}
 */
const DICE_FACES = [
    '<i class="fas fa-dice-one"></i>', '<i class="fas fa-dice-two"></i>',
    '<i class="fas fa-dice-three"></i>', '<i class="fas fa-dice-four"></i>',
    '<i class="fas fa-dice-five"></i>', '<i class="fas fa-dice-six"></i>'
];

/**
 * Localization Dictionary (i18n) containing all application strings.
 * Built with Vanilla JS to prevent CDN loading failures.
 * @constant {Object}
 */
const translations = {
    el: {
        pageTitle: "Τίμια Ψηφιακά Ζάρια",
        appTitle: "Τίμια Ψηφιακά Ζάρια",
        statusOffline: "Μη συνδεδεμένος",
        statusOnline: "Συνδεδεμένος",
        boardTitle: "Ταμπλό Παιχνιδιού",
        localRollTitle: "Η δική σου ρίψη",
        btnRoll: "Ρίψη Ζαριού",
        serverRollTitle: "Αντίπαλος (Server)",
        serverWait: "Αναμονή ρίψης παίκτη...",
        termTitle: "Terminal Πρωτοκόλλου",
        termInit: "Σύστημα σε αναμονή αυθεντικοποίησης...",
        loginTitle: "Είσοδος",
        lblUsername: "Username",
        lblPassword: "Password",
        btnLogin: "Είσοδος",
        txtNoAcc: "Δεν έχετε λογαριασμό;",
        btnSwitchReg: "Εγγραφή",
        regTitle: "Νέα Εγγραφή",
        lblFirst: "Όνομα",
        lblLast: "Επίθετο",
        btnSignup: "Εγγραφή",
        txtHasAcc: "Έχετε ήδη λογαριασμό;",
        btnSwitchLog: "Είσοδος",
        btnRestart: "Έναρξη Νέου Γύρου",
        
        toastAuthReqTitle: "Απαιτείται Σύνδεση",
        toastAuthReqDesc: "Πρέπει να συνδεθείτε στον λογαριασμό σας για να παίξετε.",
        toastRegSuccessTitle: "Επιτυχής Εγγραφή",
        toastRegSuccessDesc: "Ο λογαριασμός δημιουργήθηκε. Παρακαλώ συνδεθείτε.",
        toastLoginSuccessTitle: "Καλωσήρθατε",
        toastLoginSuccessDesc: "Επιτυχής σύνδεση στο σύστημα.",
        
        logAuthReq: "Αίτημα εγγραφής χρήστη στο σύστημα...",
        logAuthSuccess: "Επιτυχής αυθεντικοποίηση. Έναρξη συνεδρίας.",
        logAwaitRoll: "Αναμονή ρίψης ζαριού από τον παίκτη...",
        logRolling: "Ρίψη τοπικού ζαριού...",
        logGenRA: "Παραγωγή τυχαίου string rA (Παίκτης).",
        logSendCommit: "Αποστολή αιτήματος δέσμευσης στον Server...",
        logRecvRB: "Λήψη τυχαίου string rB από Server.",
        logCalcHash: "Υπολογισμός h_commit = SHA256(Roll || rA || rB)...",
        logSendHash: "Αποστολή h_commit στον Server (Commit Phase).",
        logRevealOpen: "Αποκάλυψη του τοπικού ζαριού και του rA (Open Phase).",
        logVerify: "Ο Server επαληθεύει το Hash... [ΕΠΙΤΥΧΙΑ]",
        logNewRound: "--- Αρχικοποίηση νέου γύρου ---",
        termDisclaimer: "Αυτό το παιχνίδι χρησιμοποιεί ένα Πρωτόκολλο Δέσμευσης (Commitment Scheme). Και τα δύο μέρη δεσμεύονται σε μια τιμή πριν την αποκαλύψουν, εξασφαλίζοντας ότι κανένα δεν μπορεί να αλλάξει τη ρίψη του αφού δει τη ρίψη του άλλου.",
        
        // Dynamic string generators
        logLocalResult: (val) => `Τοπικό αποτέλεσμα: [${val}]`,
        srvProcessing: () => "Επεξεργασία...",
        srvRevealed: () => "Ο Server αποκάλυψε το ζάρι",
        logServerReveal: (val) => `Ο Server αποκάλυψε το αποτέλεσμά του: [${val}]`,
        
        modWinTitle: "Νικητής!",
        modWinDesc: (c, s) => `Το <strong>${c}</strong> κερδίζει το <strong>${s}</strong>.<br>Η κρυπτογραφική επαλήθευση ολοκληρώθηκε επιτυχώς.`,
        modLoseTitle: "Ηττηθήκατε",
        modLoseDesc: (c, s) => `Ο Server επικράτησε με <strong>${s}</strong> έναντι του <strong>${c}</strong>.`,
        modDrawTitle: "Ισοπαλία",
        modDrawDesc: (c) => `Και τα δύο μέρη έφεραν <strong>${c}</strong>.`
    },
    en: {
        pageTitle: "Fair Digital Dice",
        appTitle: "Fair Digital Dice",
        statusOffline: "Offline",
        statusOnline: "Online",
        boardTitle: "Game Board",
        localRollTitle: "Your Roll",
        btnRoll: "Roll Dice",
        serverRollTitle: "Opponent (Server)",
        serverWait: "Waiting for player to roll...",
        termTitle: "Protocol Terminal",
        termInit: "System awaiting authentication...",
        loginTitle: "Secure Login",
        lblUsername: "Username",
        lblPassword: "Password",
        btnLogin: "Login",
        txtNoAcc: "Don't have an account?",
        btnSwitchReg: "Register",
        regTitle: "New Registration",
        lblFirst: "First Name",
        lblLast: "Last Name",
        btnSignup: "Sign Up",
        txtHasAcc: "Already have an account?",
        btnSwitchLog: "Login",
        btnRestart: "Start New Round",

        toastAuthReqTitle: "Authentication Required",
        toastAuthReqDesc: "You must be logged in to participate in the protocol.",
        toastRegSuccessTitle: "Registration Successful",
        toastRegSuccessDesc: "Account created successfully. Please login.",
        toastLoginSuccessTitle: "Welcome",
        toastLoginSuccessDesc: "Successfully authenticated to the system.",

        logAuthReq: "Initiating user registration request...",
        logAuthSuccess: "Authentication successful. Session established.",
        logAwaitRoll: "Awaiting initial dice roll from the client...",
        logRolling: "Executing local physical roll simulation...",
        logGenRA: "Generating random cryptographic nonce rA (Client)...",
        logSendCommit: "Transmitting commitment request to Server...",
        logRecvRB: "Received server nonce rB.",
        logCalcHash: "Calculating h_commit = SHA256(Roll || rA || rB)...",
        logSendHash: "Transmitting h_commit payload to Server (Commit Phase).",
        logRevealOpen: "Revealing local Roll & rA to Server (Open Phase).",
        logVerify: "Server successfully verified Hash signature. [VERIFIED]",
        logNewRound: "--- Initialization of new cryptographic round ---",
        termDisclaimer: "This game uses a Commitment Scheme. Both parties commit to a value before revealing, ensuring neither can change their roll after seeing the other's.",
        
        // Dynamic string generators
        logLocalResult: (val) => `Local result captured: [${val}]`,
        srvProcessing: () => "Processing...",
        srvRevealed: () => "Server revealed value",
        logServerReveal: (val) => `Server revealed its committed result: [${val}]`,
        
        modWinTitle: "Winner!",
        modWinDesc: (c, s) => `Your roll of <strong>${c}</strong> defeats the server's <strong>${s}</strong>.<br>Cryptographic verification completed successfully.`,
        modLoseTitle: "Defeat",
        modLoseDesc: (c, s) => `The Server won with a roll of <strong>${s}</strong> against your <strong>${c}</strong>.`,
        modDrawTitle: "Draw",
        modDrawDesc: (c) => `Both parties committed to a roll of <strong>${c}</strong>.`
    }
};

/**
 * Localization Service
 * Handles switching between EN and EL and updating the DOM elements dynamically.
 */
const LocalizationService = {
    /**
     * Toggles the active application language and triggers a DOM re-render.
     */
    toggleLanguage() {
        AppState.lang = AppState.lang === 'el' ? 'en' : 'el';
        const dict = translations[AppState.lang];
        
        // Update language UI elements
        document.getElementById('lang-icon').innerText = AppState.lang === 'el' ? '🇬🇧' : '🇬🇷';
        document.getElementById('lang-text').innerText = AppState.lang === 'el' ? 'EN' : 'EL';
        
        // Scan the DOM and replace strings based on data-i18n tags
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.innerText = dict[key];
            }
        });

        // Manually update dynamically changing session text
        if (AppState.isAuthenticated) {
            document.getElementById('user-status-text').innerText = dict.statusOnline;
        }
    }
};

/**
 * UI Manager
 * Utility service for rendering toast notifications and logging to the terminal.
 */
const UIManager = {
    /**
     * Appends a log entry to the cryptographic terminal.
     * @param {string} msgKey - Translation dictionary key or literal string.
     * @param {string} [colorClass="text-slate-300"] - Tailwind CSS class for text color.
     */
    logTerminal(msgKey, colorClass = "text-slate-300") {
        const terminal = document.getElementById('protocol-logs');
        const logEntry = document.createElement('div');
        logEntry.className = colorClass;
        
        // Check if key exists in dictionary, otherwise use literal text
        const text = translations[AppState.lang][msgKey] || msgKey;
        logEntry.innerHTML = `> ${text}`;
        
        terminal.appendChild(logEntry);
        terminal.scrollTop = terminal.scrollHeight; // Auto-scroll to bottom
    },

    /**
     * Renders an animated toast notification in the UI.
     * @param {string} titleKey - Key for the toast title.
     * @param {string} descKey - Key for the toast description.
     * @param {string} [type="error"] - Defines the visual theme ("error", "success", "info").
     */
    showToast(titleKey, descKey, type = "error") {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const title = translations[AppState.lang][titleKey] || titleKey;
        const desc = translations[AppState.lang][descKey] || descKey;

        const borderColors = { error: 'border-rose-500', success: 'border-emerald-500', info: 'border-blue-500' };
        const iconColors = { error: '<i class="fas fa-exclamation-circle text-rose-500"></i>', success: '<i class="fas fa-check-circle text-emerald-500"></i>' };

        toast.className = `bg-slate-800 border-l-4 ${borderColors[type]} p-4 rounded shadow-xl flex items-start gap-3 w-80 transform transition-all duration-300 translate-x-full opacity-0 pointer-events-auto`;
        toast.innerHTML = `<div class="mt-0.5 text-lg">${iconColors[type]}</div><div><h4 class="font-bold text-slate-100">${title}</h4><p class="text-sm text-slate-400 mt-1">${desc}</p></div>`;
        
        container.appendChild(toast);
        
        // Request animation frame for smooth sliding entrance
        requestAnimationFrame(() => toast.classList.remove('translate-x-full', 'opacity-0'));
        
        // Remove DOM node after delay
        setTimeout(() => {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
};

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


/**
 * Cryptographic Utilities for the Client (Browser)
 */
const CryptoUtils = {
    generateNonce(length = 16) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
    },
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
};

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
 * Core Game Engine
 * Orchestrates the cryptographic commitment protocol and resolves the winner.
 */
const GameEngine = {
    /**
     * Validates game state and initiates the local roll sequence.
     */
    handleRollAction() {
        if (!AppState.isAuthenticated) {
            UIManager.showToast("toastAuthReqTitle", "toastAuthReqDesc", "error");
            return;
        }
        
        if (AppState.isProcessingTurn) return; // Mutex check prevents spam-clicking

        AppState.isProcessingTurn = true;
        document.getElementById('btn-roll').classList.add('opacity-50', 'cursor-not-allowed');
        
        this.executeLocalRoll();
    },

    /**
     * Simulates the physical hardware roll and captures the local entropy value.
     */
    executeLocalRoll() {
        UIManager.logTerminal("logRolling", "text-yellow-400");
        const localResult = Math.floor(Math.random() * 6) + 1;
        const diceElement = document.getElementById('local-dice');
        
        let animationFrames = 0;
        const rollInterval = setInterval(() => {
            diceElement.innerHTML = DICE_FACES[Math.floor(Math.random() * 6)];
            animationFrames++;
            
            if (animationFrames > 12) {
                clearInterval(rollInterval);
                diceElement.innerHTML = DICE_FACES[localResult - 1];
                
                const logText = translations[AppState.lang].logLocalResult(localResult);
                UIManager.logTerminal(logText, "text-white");
                
                this.initiateCryptographicProtocol(localResult);
            }
        }, 80);
    },

    /**
     * Executes the mock sequence of the Coin-Flipping Commitment Protocol over network.
     * @param {number} clientValue - The locally generated dice roll.
     */
    async initiateCryptographicProtocol(clientValue) {
        const dict = translations[AppState.lang];

        try {
            // --- STEP 1: INITIALIZATION ---
            UIManager.logTerminal("logSendCommit", "text-blue-300");
            document.getElementById('server-status').innerText = dict.srvProcessing();
            
            const initRes = await fetch('/api/game/init/', { method: 'POST', headers: getApiHeaders() });
            if (!initRes.ok) throw new Error("Initialization failed");
            const initData = await initRes.json();
            const serverNonce = initData.server_nonce; // (r_B)
            UIManager.logTerminal("logRecvRB", "text-purple-300");

            // --- CLIENT LOCAL CRYPTO ---
            UIManager.logTerminal("logGenRA", "text-blue-300");
            const clientNonce = CryptoUtils.generateNonce(); // (r_A)
            
            UIManager.logTerminal("logCalcHash", "text-blue-300");
            // h_commit = SHA256(V_A || r_A || r_B)
            const h_commit = await CryptoUtils.sha256(`${clientValue}${clientNonce}${serverNonce}`);

            // --- STEP 2: COMMIT PHASE ---
            UIManager.logTerminal("logSendHash", "text-blue-300");
            const commitRes = await fetch('/api/game/commit/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({ h_commit: h_commit })
            });
            if (!commitRes.ok) throw new Error("Commitment failed");
            const commitData = await commitRes.json();
            const serverValue = commitData.server_roll; // (V_B)

            // Ενημέρωση του UI με τη ρίψη του Server
            const serverDiceElement = document.getElementById('server-dice');
            serverDiceElement.innerHTML = DICE_FACES[serverValue - 1];
            serverDiceElement.classList.replace('text-slate-600', 'text-rose-500');
            document.getElementById('server-status').innerText = dict.srvRevealed();
            UIManager.logTerminal(dict.logServerReveal(serverValue), "text-rose-400");

            // --- STEP 3: REVEAL (OPEN) PHASE ---
            UIManager.logTerminal("logRevealOpen", "text-blue-300");
            const revealRes = await fetch('/api/game/reveal/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({
                    client_roll: clientValue,
                    client_nonce: clientNonce
                })
            });
            
            if (!revealRes.ok) {
                UIManager.logTerminal("Cryptographic Verification FAILED (Hash Mismatch)", "text-rose-500 font-bold");
                throw new Error("Verification failed");
            }
            
            const revealData = await revealRes.json();
            UIManager.logTerminal("logVerify", "text-emerald-400 font-bold");
            
            // Εμφάνιση του τελικού αποτελέσματος
            setTimeout(() => this.presentResultModal(clientValue, serverValue), 1000);

        } catch (error) {
            console.error("Game Error:", error);
            UIManager.showToast("Σφάλμα Πρωτοκόλλου", "Η επικοινωνία με τον Server απέτυχε.", "error");
            this.resetState();
        }
    },

    /**
     * Evaluates the condition logic and renders the outcome payload to the DOM.
     * @param {number} clientVal - Local client value.
     * @param {number} serverVal - Remote server value.
     */
    presentResultModal(clientVal, serverVal) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        const icon = document.getElementById('modal-icon');
        const dict = translations[AppState.lang];
        
        modal.classList.replace('modal-inactive', 'modal-active');

        // Determine outcome
        if (clientVal > serverVal) {
            icon.innerHTML = '🏆';
            title.innerText = dict.modWinTitle;
            title.className = "text-4xl font-black mb-4 text-emerald-400 uppercase tracking-wide";
            desc.innerHTML = dict.modWinDesc(clientVal, serverVal);
        } else if (clientVal < serverVal) {
            icon.innerHTML = '💀';
            title.innerText = dict.modLoseTitle;
            title.className = "text-4xl font-black mb-4 text-rose-500 uppercase tracking-wide";
            desc.innerHTML = dict.modLoseDesc(clientVal, serverVal);
        } else {
            icon.innerHTML = '🤝';
            title.innerText = dict.modDrawTitle;
            title.className = "text-4xl font-black mb-4 text-yellow-400 uppercase tracking-wide";
            desc.innerHTML = dict.modDrawDesc(clientVal);
        }
    },

    /**
     * Clears the board state and initializes the environment for a new round.
     */
    resetState() {
        document.getElementById('result-modal').classList.replace('modal-active', 'modal-inactive');
        document.getElementById('local-dice').innerHTML = '<i class="fas fa-dice-d6"></i>';
        document.getElementById('server-dice').innerHTML = '<i class="fas fa-question-circle"></i>';
        document.getElementById('server-dice').className = 'text-7xl my-6 text-slate-600 transition-colors duration-300';
        document.getElementById('server-status').innerText = translations[AppState.lang].serverWait;
        document.getElementById('btn-roll').classList.remove('opacity-50', 'cursor-not-allowed');
        
        AppState.isProcessingTurn = false; // Release mutex lock
        UIManager.logTerminal("logNewRound", "text-slate-500 italic mt-2 mb-1");
    }
};

// Initialize i18n placeholders on load
window.onload = () => {
    const dict = translations[AppState.lang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.innerText = dict[key];
        }
    });
};