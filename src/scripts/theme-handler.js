// Theme toggle functionality
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  // Check for saved theme preference or use device preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Set initial theme - default to light mode
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    document.documentElement.classList.remove('light-theme');
  } else {
    // Default to light mode when no preference is saved
    document.documentElement.classList.add('light-theme');
  }
  
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
}

// Apply theme from local storage without waiting for DOM content loaded
function applyThemeImmediately() {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
  } else if (savedTheme === 'dark') {
    document.documentElement.classList.remove('light-theme');
  } else {
    // Default to light mode when no preference is saved
    document.documentElement.classList.add('light-theme');
  }
}

// Call this function immediately
applyThemeImmediately();

// Setup the toggle when DOM is ready
document.addEventListener('DOMContentLoaded', setupThemeToggle);
