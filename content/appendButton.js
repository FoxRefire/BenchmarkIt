// Function to create and show info icon
const LONG_PRESS_MS = 550;

// Inline SVG: emoji (ℹ️) often renders as empty/tofu on Android Firefox; vector works everywhere.
function infoIconSvg(px) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${px}" height="${px}" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
}

function isCoarsePointer() {
    try {
        return (
            window.matchMedia('(pointer: coarse)').matches ||
            window.matchMedia('(hover: none)').matches
        );
    } catch (e) {
        return 'ontouchstart' in window;
    }
}

/** Place away from Android selection handles: right edge sits on the end handle; use below + large tap target on touch. */
function positionInfoIcon(icon, rect, coarse) {
    const gap = coarse ? 14 : 8;
    const size = coarse ? 46 : 28;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const vw = document.documentElement.clientWidth || window.innerWidth;
    const vh = window.innerHeight;

    icon.style.width = `${size}px`;
    icon.style.height = `${size}px`;

    if (coarse) {
        const svgPx = Math.round(size * 0.48);
        icon.innerHTML = infoIconSvg(svgPx);
        let left = rect.left + rect.width / 2 - size / 2 + scrollX;
        let top = rect.bottom + gap + scrollY;
        const bottomSpace = vh - rect.bottom;
        if (bottomSpace < size + gap + 8) {
            top = rect.top + scrollY - gap - size;
        }
        const margin = 6;
        left = Math.max(scrollX + margin, Math.min(left, scrollX + vw - size - margin));
        icon.style.left = `${left}px`;
        icon.style.top = `${top}px`;
    } else {
        icon.innerHTML = infoIconSvg(16);
        icon.style.left = `${rect.right + scrollX + 5}px`;
        icon.style.top = `${rect.top + scrollY - 2}px`;
    }
}

function showInfoIcon(selectedText, productType, selection) {
    removeExistingIcon();

    const coarse = isCoarsePointer();
    const icon = document.createElement('div');
    icon.id = 'benchmarkit-info-icon';
    icon.style.cssText = `
        position: absolute;
        background: #007bff;
        color: white;
        border-radius: 50%;
        width: ${coarse ? 46 : 28}px;
        height: ${coarse ? 46 : 28}px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        z-index: 2147483647;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        transition: all 0.2s ease;
        user-select: none;
        pointer-events: auto;
        touch-action: none;
    `;

    let longPressTimer = null;
    let longPressCompleted = false;
    let pointerDownAt = 0;
    let activePointerId = null;

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
        activePointerId = e.pointerId;
        pointerDownAt = e.timeStamp || performance.now();
        longPressCompleted = false;
        clearLongPressTimer();
        try {
            icon.setPointerCapture(e.pointerId);
        } catch (err) {
            /* ignore */
        }
        longPressTimer = setTimeout(() => {
            longPressTimer = null;
            longPressCompleted = true;
            addToCompareQueue(selectedText, productType);
            removeExistingIcon();
        }, LONG_PRESS_MS);
    });

    function finishPointer(e) {
        if (e.pointerId != null && activePointerId != null && e.pointerId !== activePointerId) {
            return;
        }
        clearLongPressTimer();
        try {
            if (icon.hasPointerCapture?.(e.pointerId)) {
                icon.releasePointerCapture(e.pointerId);
            }
        } catch (err) {
            /* ignore */
        }
        activePointerId = null;

        if (longPressCompleted) {
            return;
        }

        const start = pointerDownAt;
        const end = e.timeStamp || performance.now();
        if (end - start < LONG_PRESS_MS) {
            e.preventDefault();
            e.stopPropagation();
            showInfo(selectedText, productType);
            removeExistingIcon();
        }
    }

    icon.addEventListener('pointerup', (e) => finishPointer(e));
    icon.addEventListener('pointercancel', (e) => {
        clearLongPressTimer();
        try {
            if (icon.hasPointerCapture?.(e.pointerId)) {
                icon.releasePointerCapture(e.pointerId);
            }
        } catch (err) {
            /* ignore */
        }
        activePointerId = null;
    });

    icon.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
    });

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    positionInfoIcon(icon, rect, coarse);

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
