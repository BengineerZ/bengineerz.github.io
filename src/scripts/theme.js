// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Update button state based on current theme
  updateButtonState();
  
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('light-theme');
    
    // Save preference to local storage
    if (document.documentElement.classList.contains('light-theme')) {
      localStorage.setItem('theme', 'light');
    } else {
      localStorage.setItem('theme', 'dark');
    }
    
    updateButtonState();
  });
  
  function updateButtonState() {
    const isLightTheme = document.documentElement.classList.contains('light-theme');
    themeToggle.setAttribute('aria-pressed', isLightTheme.toString());
  }
});
