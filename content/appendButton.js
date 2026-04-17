// Function to create and show info icon
const LONG_PRESS_MS = 550;

function showInfoIcon(selectedText, productType, selection) {
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
        touch-action: none;
    `;

    let longPressTimer = null;
    let suppressNextClick = false;

    function clearLongPressTimer() {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            longPressTimer = null;
        }
    }

    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1)';
        icon.style.background = '#0056b3';
    });

    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
        icon.style.background = '#007bff';
    });

    icon.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        try {
            icon.setPointerCapture(e.pointerId);
        } catch (err) {
            /* ignore */
        }
        suppressNextClick = false;
        clearLongPressTimer();
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            suppressNextClick = true;
            addToCompareQueue(selectedText, productType);
            removeExistingIcon();
        }, LONG_PRESS_MS);
    });

    function endLongPress(e) {
        clearLongPressTimer();
        if (e && e.pointerId != null) {
            try {
                if (icon.releasePointerCapture && icon.hasPointerCapture?.(e.pointerId)) {
                    icon.releasePointerCapture(e.pointerId);
                }
            } catch (err) {
                /* ignore */
            }
        }
    }

    icon.addEventListener('pointerup', (e) => endLongPress(e));
    icon.addEventListener('pointercancel', (e) => endLongPress(e));

    icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (suppressNextClick) {
            suppressNextClick = false;
            return;
        }
        showInfo(selectedText, productType);
        removeExistingIcon();
    });

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    icon.style.left = (rect.right + window.scrollX + 5) + 'px';
    icon.style.top = (rect.top + window.scrollY - 2) + 'px';

    document.body.appendChild(icon);

    setTimeout(() => {
        removeExistingIcon();
    }, 5000);
}

function removeExistingIcon() {
    const existingIcon = document.getElementById('benchmarkit-info-icon');
    if (existingIcon) {
        existingIcon.remove();
    }
}
