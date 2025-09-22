// Mobile layout debugging helper
document.addEventListener('DOMContentLoaded', () => {
  // Create debug toggle button
  const mobileDebugButton = document.createElement('button');
  mobileDebugButton.innerText = 'Debug Mobile Layout';
  mobileDebugButton.style.position = 'fixed';
  mobileDebugButton.style.bottom = '130px';
  mobileDebugButton.style.right = '10px';
  mobileDebugButton.style.zIndex = '9999';
  mobileDebugButton.style.padding = '5px 10px';
  mobileDebugButton.style.fontSize = '12px';
  mobileDebugButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  mobileDebugButton.style.color = 'white';
  mobileDebugButton.style.border = '1px solid #444';
  mobileDebugButton.style.borderRadius = '4px';
  document.body.appendChild(mobileDebugButton);
  
  // Toggle debug mode
  let debugMode = false;
  mobileDebugButton.addEventListener('click', () => {
    debugMode = !debugMode;
    mobileDebugButton.innerText = debugMode ? 'Hide Mobile Debug' : 'Debug Mobile Layout';
    mobileDebugButton.style.backgroundColor = debugMode ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    // Toggle debug visualizations
    const profileContainer = document.querySelector('.profile-container');
    const profileImage = document.querySelector('.profile-image-container');
    const profileText = document.querySelector('.profile-text');
    
    if (debugMode) {
      // Add debug styling
      if (profileContainer) {
        profileContainer.style.outline = '2px solid blue';
        profileContainer.style.backgroundColor = 'rgba(0, 0, 255, 0.1)';
      }
      
      if (profileImage) {
        profileImage.style.outline = '2px solid green';
        profileImage.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
      }
      
      if (profileText) {
        profileText.style.outline = '2px solid purple';
        profileText.style.backgroundColor = 'rgba(128, 0, 128, 0.1)';
      }
      
      // Log dimensions and alignment info
      if (window.innerWidth <= 768) {
        console.log('Mobile Layout Active');
        if (profileContainer) {
          const rect = profileContainer.getBoundingClientRect();
          console.log('Profile Container:', {
            width: rect.width,
            height: rect.height,
            display: getComputedStyle(profileContainer).display,
            flexDirection: getComputedStyle(profileContainer).flexDirection,
            justifyContent: getComputedStyle(profileContainer).justifyContent,
            alignItems: getComputedStyle(profileContainer).alignItems,
            gap: getComputedStyle(profileContainer).gap
          });
        }
      } else {
        console.log('Desktop Layout Active - resize browser to see mobile layout');
      }
    } else {
      // Remove debug styling
      if (profileContainer) {
        profileContainer.style.outline = '';
        profileContainer.style.backgroundColor = '';
      }
      
      if (profileImage) {
        profileImage.style.outline = '';
        profileImage.style.backgroundColor = '';
      }
      
      if (profileText) {
        profileText.style.outline = '';
        profileText.style.backgroundColor = '';
      }
    }
  });
});
