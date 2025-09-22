// Scroll debugging helper
document.addEventListener('DOMContentLoaded', () => {
  // Create debug indicator
  const debugElement = document.createElement('div');
  debugElement.style.position = 'fixed';
  debugElement.style.bottom = '10px';
  debugElement.style.right = '10px';
  debugElement.style.padding = '5px 10px';
  debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  debugElement.style.color = 'white';
  debugElement.style.fontFamily = 'monospace';
  debugElement.style.fontSize = '12px';
  debugElement.style.zIndex = '9999';
  debugElement.style.borderRadius = '4px';
  debugElement.textContent = 'Scroll Debug: OK';
  document.body.appendChild(debugElement);

  // Check if scrolling is available
  function updateScrollStatus() {
    const windowHeight = window.innerHeight;
    const bodyHeight = document.body.scrollHeight;
    const isScrollable = bodyHeight > windowHeight;
    
    debugElement.textContent = `Scroll Debug: ${isScrollable ? 'Scrollable' : 'Not Scrollable'}`;
    debugElement.style.backgroundColor = isScrollable ? 'rgba(0, 128, 0, 0.7)' : 'rgba(255, 0, 0, 0.7)';
    
    debugElement.innerHTML = `
      Scroll Debug:<br>
      Window: ${windowHeight}px<br>
      Content: ${bodyHeight}px<br>
      Status: ${isScrollable ? 'Scrollable' : 'Not Scrollable'}<br>
      Overflow-Y: ${getComputedStyle(document.body).overflowY}
    `;
  }

  // Update on resize and initially
  window.addEventListener('resize', updateScrollStatus);
  updateScrollStatus();
});
