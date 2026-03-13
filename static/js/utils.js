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
        const iconColors = { 
            error: '<i class="fas fa-exclamation-circle text-rose-500"></i>', 
            success: '<i class="fas fa-check-circle text-emerald-500"></i>',
            info: '<i class="fas fa-info-circle text-blue-500"></i>' 
        };

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