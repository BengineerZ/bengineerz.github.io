// Alignment debugging helper
document.addEventListener('DOMContentLoaded', () => {
  // Create alignment toggle button
  const alignButton = document.createElement('button');
  alignButton.innerText = 'Show Alignment';
  alignButton.style.position = 'fixed';
  alignButton.style.bottom = '70px';
  alignButton.style.right = '10px';
  alignButton.style.zIndex = '9999';
  alignButton.style.padding = '5px 10px';
  alignButton.style.fontSize = '12px';
  alignButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  alignButton.style.color = 'white';
  alignButton.style.border = '1px solid #444';
  alignButton.style.borderRadius = '4px';
  document.body.appendChild(alignButton);
  
  // Toggle debug mode
  let alignDebugMode = false;
  alignButton.addEventListener('click', () => {
    alignDebugMode = !alignDebugMode;
    alignButton.innerText = alignDebugMode ? 'Hide Alignment' : 'Show Alignment';
    alignButton.style.backgroundColor = alignDebugMode ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    // Toggle debug outlines on navigation items
    const navItems = document.querySelectorAll('.nav-item');
    const themeToggle = document.querySelector('#theme-toggle');
    const themeWrapper = document.querySelector('.theme-toggle-wrapper');
    
    if (alignDebugMode) {
      // Add outlines to see element boundaries
      navItems.forEach(item => {
        item.style.outline = '1px solid green';
        item.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
      });
      
      if (themeToggle) {
        themeToggle.style.outline = '1px solid blue';
        themeToggle.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
      }
      
      if (themeWrapper) {
        themeWrapper.style.outline = '1px solid red';
        themeWrapper.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
      }
      
      // Log dimensions and positions
      console.log('Navigation Items:');
      navItems.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        console.log(`Item ${i}: Height=${rect.height}px, Top=${rect.top}px, Bottom=${rect.bottom}px`);
      });
      
      if (themeToggle) {
        const rect = themeToggle.getBoundingClientRect();
        console.log('Theme Toggle:', {
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom
        });
      }
    } else {
      // Remove debug styling
      navItems.forEach(item => {
        item.style.outline = '';
        item.style.backgroundColor = '';
      });
      
      if (themeToggle) {
        themeToggle.style.outline = '';
        themeToggle.style.backgroundColor = '';
      }
      
      if (themeWrapper) {
        themeWrapper.style.outline = '';
        themeWrapper.style.backgroundColor = '';
      }
    }
  });
});
