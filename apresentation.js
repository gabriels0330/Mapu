function selectTheme(theme) {
    localStorage.setItem('selectedTheme', theme);
    const fileName = `${theme}_q_1.html`;
    window.location.href = fileName;
}
function navigateTo(page) {
    window.location.href = page;
}