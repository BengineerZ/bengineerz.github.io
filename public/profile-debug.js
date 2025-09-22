// Profile styling diagnostic helper
document.addEventListener('DOMContentLoaded', () => {
  // Create diagnostic toggle button
  const diagButton = document.createElement('button');
  diagButton.innerText = 'Profile Debug';
  diagButton.style.position = 'fixed';
  diagButton.style.bottom = '40px';
  diagButton.style.right = '10px';
  diagButton.style.zIndex = '9999';
  diagButton.style.padding = '5px 10px';
  diagButton.style.fontSize = '12px';
  diagButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  diagButton.style.color = 'white';
  diagButton.style.border = '1px solid #444';
  diagButton.style.borderRadius = '4px';
  document.body.appendChild(diagButton);
  
  // Toggle diagnostic mode
  let debugMode = false;
  diagButton.addEventListener('click', () => {
    debugMode = !debugMode;
    diagButton.innerText = debugMode ? 'Hide Debug' : 'Profile Debug';
    diagButton.style.backgroundColor = debugMode ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    
    // Toggle debug class on profile elements
    const profileContainer = document.querySelector('.profile-image-container');
    const profileImage = document.querySelector('.profile-image');
    
    if (profileContainer && profileImage) {
      if (debugMode) {
        // Add diagnostic styling
        profileContainer.style.border = '3px solid red';
        profileContainer.style.boxSizing = 'border-box';
        profileImage.style.outline = '2px dashed yellow';
        
        // Log dimensions
        const containerRect = profileContainer.getBoundingClientRect();
        const imageRect = profileImage.getBoundingClientRect();
        
        console.log('Profile Container:', {
          width: containerRect.width,
          height: containerRect.height,
          borderRadius: getComputedStyle(profileContainer).borderRadius
        });
        
        console.log('Profile Image:', {
          width: imageRect.width,
          height: imageRect.height,
          objectFit: getComputedStyle(profileImage).objectFit
        });
      } else {
        // Remove diagnostic styling
        profileContainer.style.border = '';
        profileImage.style.outline = '';
      }
    }
  });
});
