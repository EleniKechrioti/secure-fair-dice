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