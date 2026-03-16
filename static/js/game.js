/**
 * Core Game Engine
 * Orchestrates the cryptographic commitment protocol (Coin-Flipping over network)
 * and resolves the final winner after secure verification.
 */
const GameEngine = {
    /**
     * Validates game state and initiates the local roll sequence.
     * Acts as a gatekeeper to ensure users are authenticated and prevents race conditions.
     */
    handleRollAction() {
        // Enforce authentication before allowing interaction
        if (!AppState.isAuthenticated) {
            UIManager.showToast("toastAuthReqTitle", "toastAuthReqDesc", "error");
            return;
        }
        
        // Mutex lock: Prevent the user from spam-clicking the roll button 
        // while an async cryptographic round is already in progress.
        if (AppState.isProcessingTurn) return; 

        AppState.isProcessingTurn = true;
        document.getElementById('btn-roll').classList.add('opacity-50', 'cursor-not-allowed');
        
        this.executeLocalRoll();
    },

    /**
     * Simulates the physical hardware roll visually.
     * Generates the local plaintext value (V_A) that will be committed later.
     */
    executeLocalRoll() {
        UIManager.logTerminal("logRolling", "text-yellow-400");
        
        // Generate the actual local dice roll (V_A: 1 to 6)
        const localResult = Math.floor(Math.random() * 6) + 1;
        const diceElement = document.getElementById('local-dice');
        
        // Visual animation loop to simulate rolling
        let animationFrames = 0;
        const rollInterval = setInterval(() => {
            diceElement.innerHTML = DICE_FACES[Math.floor(Math.random() * 6)];
            animationFrames++;
            
            if (animationFrames > 12) {
                clearInterval(rollInterval);
                // Display final local result
                diceElement.innerHTML = DICE_FACES[localResult - 1];
                
                const logText = translations[AppState.lang].logLocalResult(localResult);
                UIManager.logTerminal(logText, "text-white");
                
                // Proceed to the actual network and cryptographic protocol
                this.initiateCryptographicProtocol(localResult);
            }
        }, 80);
    },

    /**
     * Executes the strict 3-phase Hash-based Commitment Protocol over the network.
     * Guarantees fairness by preventing both Client and Server from altering their values.
     * * @param {number} clientValue - The locally generated dice roll (V_A).
     */
    async initiateCryptographicProtocol(clientValue) {
        const dict = translations[AppState.lang];

        try {
            // PHASE 1: INITIALIZATION
            // Request the Server's random nonce (r_B)
            UIManager.logTerminal("logSendCommit", "text-blue-300");
            document.getElementById('server-status').innerText = dict.srvProcessing();
            
            const initRes = await fetch('/api/game/init/', { method: 'POST', headers: getApiHeaders() });
            if (!initRes.ok) throw new Error("Initialization failed");
            const initData = await initRes.json();
            
            const serverNonce = initData.server_nonce; // Server's entropy (r_B)
            UIManager.logTerminal("logRecvRB", "text-purple-300");

            // CLIENT LOCAL CRYPTO OPERATIONS
            // Generate r_A and calculate Hash(V_A || r_A || r_B)
            UIManager.logTerminal("logGenRA", "text-blue-300");
            const clientNonce = CryptoUtils.generateNonce(); // Client's entropy (r_A)
            
            UIManager.logTerminal("logCalcHash", "text-blue-300");
            const h_commit = await CryptoUtils.sha256(`${clientValue}${clientNonce}${serverNonce}`);

            // PHASE 2: COMMITMENT
            // Send Hash to lock in our choice, receive Server's plaintext roll (V_B)
            UIManager.logTerminal("logSendHash", "text-blue-300");
            const commitRes = await fetch('/api/game/commit/', {
                method: 'POST',
                headers: getApiHeaders(),
                body: JSON.stringify({ h_commit: h_commit })
            });
            if (!commitRes.ok) throw new Error("Commitment failed");
            const commitData = await commitRes.json();
            
            const serverValue = commitData.server_roll; // Server's revealed roll (V_B)

            // Update UI to show the Server's locked-in roll
            const serverDiceElement = document.getElementById('server-dice');
            serverDiceElement.innerHTML = DICE_FACES[serverValue - 1];
            serverDiceElement.classList.replace('text-slate-600', 'text-rose-500');
            document.getElementById('server-status').innerText = dict.srvRevealed();
            UIManager.logTerminal(dict.logServerReveal(serverValue), "text-rose-400");

            // PHASE 3: REVEAL (OPEN)
            // Send V_A and r_A in plaintext so Server can verify the initial Hash
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
                // If the Server detects tampering, it aborts the game
                UIManager.logTerminal("Cryptographic Verification FAILED (Hash Mismatch)", "text-rose-500 font-bold");
                throw new Error("Verification failed");
            }
            
            const revealData = await revealRes.json();
            UIManager.logTerminal("logVerify", "text-emerald-400 font-bold");
            
            // Verification successful, show the winner
            setTimeout(() => this.presentResultModal(clientValue, serverValue), 1000);

        } catch (error) {
            console.error("Game Protocol Error:", error);
            // Dynamic error handling based on locale
            UIManager.showToast(dict.errServerTitle || "Σφάλμα", dict.errServerDesc || "Αποτυχία", "error");
            this.resetState();
        }
    },

    /**
     * Evaluates the win/loss/draw condition and renders the outcome payload to the DOM modal.
     * * @param {number} clientVal - Local client value (V_A).
     * @param {number} serverVal - Remote server value (V_B).
     */
    presentResultModal(clientVal, serverVal) {
        const modal = document.getElementById('result-modal');
        const title = document.getElementById('modal-title');
        const desc = document.getElementById('modal-desc');
        const icon = document.getElementById('modal-icon');
        const dict = translations[AppState.lang];
        
        modal.classList.replace('modal-inactive', 'modal-active');

        // Determine outcome and apply thematic styling
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
     * Clears the board state, releases the mutex lock, and initializes the environment for a new round.
     */
    resetState() {
        document.getElementById('result-modal').classList.replace('modal-active', 'modal-inactive');
        document.getElementById('local-dice').innerHTML = '<i class="fas fa-dice-d6"></i>';
        document.getElementById('server-dice').innerHTML = '<i class="fas fa-question-circle"></i>';
        document.getElementById('server-dice').className = 'text-7xl my-6 text-slate-600 transition-colors duration-300';
        document.getElementById('server-status').innerText = translations[AppState.lang].serverWait;
        document.getElementById('btn-roll').classList.remove('opacity-50', 'cursor-not-allowed');
        
        AppState.isProcessingTurn = false; // Release the mutex lock to allow next roll
        UIManager.logTerminal("logNewRound", "text-slate-500 italic mt-2 mb-1");
    }
};