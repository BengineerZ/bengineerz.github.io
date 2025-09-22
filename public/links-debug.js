// Profile links spacing debug helper
document.addEventListener('DOMContentLoaded', () => {
  // Create debug toggle button
  const linkDebugButton = document.createElement('button');
  linkDebugButton.innerText = 'Debug Links';
  linkDebugButton.style.position = 'fixed';
  linkDebugButton.style.bottom = '100px';
  linkDebugButton.style.right = '10px';
  linkDebugButton.style.zIndex = '9999';
  linkDebugButton.style.padding = '5px 10px';
  linkDebugButton.style.fontSize = '12px';
  linkDebugButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  linkDebugButton.style.color = 'white';
  linkDebugButton.style.border = '1px solid #444';
  linkDebugButton.style.borderRadius = '4px';
  document.body.appendChild(linkDebugButton);
  
  // Toggle debug mode
  let debugMode = false;
  linkDebugButton.addEventListener('click', () => {
    debugMode = !debugMode;
    linkDebugButton.innerText = debugMode ? 'Hide Debug' : 'Debug Links';
    linkDebugButton.style.backgroundColor = debugMode ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    // Toggle debug outlines on links
    const links = document.querySelectorAll('.profile-link');
    const linksContainer = document.querySelector('.profile-links');
    const linkItems = document.querySelectorAll('.link-item');
    const desktopItems = document.querySelectorAll('.desktop-only');
    
    if (debugMode) {
      // Add outlines to see element boundaries
      links.forEach((link, i) => {
        link.style.outline = '1px solid green';
        link.style.backgroundColor = `rgba(0, ${50 + i * 50}, 0, 0.1)`;
        
        // Show measurements
        const rect = link.getBoundingClientRect();
        console.log(`Link ${i}: Height=${rect.height}px, Margin=${getComputedStyle(link).marginBottom}`);
      });
      
      if (linksContainer) {
        linksContainer.style.outline = '1px solid blue';
        linksContainer.style.backgroundColor = 'rgba(0, 0, 255, 0.05)';
        console.log('Links Container Gap:', getComputedStyle(linksContainer).gap);
      }
      
      // Highlight all link items
      linkItems.forEach((item, i) => {
        item.style.outline = '1px solid orange';
        item.style.backgroundColor = `rgba(255, ${100 + i * 50}, 0, 0.1)`;
        
        // Log margins
        console.log(`Link Item ${i}:`, {
          marginTop: getComputedStyle(item).marginTop,
          marginBottom: getComputedStyle(item).marginBottom
        });
      });
      
      // Highlight desktop-only items
      desktopItems.forEach((item, i) => {
        item.style.outline = '1px solid red';
        item.style.backgroundColor = 'rgba(255, 0, 0, 0.05)';
      });
    } else {
      // Remove debug styling
      links.forEach(link => {
        link.style.outline = '';
        link.style.backgroundColor = '';
      });
      
      if (linksContainer) {
        linksContainer.style.outline = '';
        linksContainer.style.backgroundColor = '';
      }
      
      linkItems.forEach(item => {
        item.style.outline = '';
        item.style.backgroundColor = '';
      });
      
      desktopItems.forEach(item => {
        item.style.outline = '';
        item.style.backgroundColor = '';
      });
    }
  });
});
