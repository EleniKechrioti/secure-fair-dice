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