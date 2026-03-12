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