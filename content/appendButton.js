// Function to create and show info icon
function showInfoIcon(selectedText, productType, selection) {
    // Remove existing icon if any
    removeExistingIcon();
    
    const icon = document.createElement('div');
    icon.id = 'benchmarkit-info-icon';
    icon.innerHTML = 'ℹ️';
    icon.style.cssText = `
        position: absolute;
        background: #007bff;
        color: white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: all 0.2s ease;
        user-select: none;
        pointer-events: auto;
    `;
    
    // Add hover effect
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1)';
        icon.style.background = '#0056b3';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
        icon.style.background = '#007bff';
    });
    
    // Add click handler
    icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Icon clicked!', selectedText, productType);
        showInfo(selectedText, productType);
        removeExistingIcon();
    });
    
    // Add mousedown handler as backup
    icon.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Icon mousedown!', selectedText, productType);
        showInfo(selectedText, productType);
        removeExistingIcon();
    });
    
    // Position the icon near the selection
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    icon.style.left = (rect.right + window.scrollX + 5) + 'px';
    icon.style.top = (rect.top + window.scrollY - 2) + 'px';
    
    document.body.appendChild(icon);
    console.log('Icon created and added to DOM:', icon);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        removeExistingIcon();
    }, 5000);
}

// Function to remove existing icon
function removeExistingIcon() {
    const existingIcon = document.getElementById('benchmarkit-info-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
}