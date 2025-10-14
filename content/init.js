// Function to handle text selection
function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    if (selectedText.length > 0 && selectedText.length < 50) {
        const productType = detectProductType(selectedText);
        
        if (productType) {
            showInfoIcon(selectedText, productType, selection);
        }
    } else {
        // Remove icon if no valid selection
        removeExistingIcon();
    }
}

// Listen for text selection events
document.addEventListener('mouseup', handleTextSelection);
document.addEventListener('keyup', handleTextSelection);