function getDefaultSettings() {
    return {
        autoIconEnabled: true,
        customIconRegex: '',
        customMatchProductType: 'cpu'
    };
}

let settingsCache = getDefaultSettings();

function resolveProductType(text) {
    let productType = detectProductType(text);
    if (!productType && settingsCache.customIconRegex) {
        try {
            const re = new RegExp(settingsCache.customIconRegex, 'i');
            if (re.test(normalizeText(text))) {
                productType = settingsCache.customMatchProductType || 'cpu';
            }
        } catch (e) {
            /* invalid regex in settings */
        }
    }
    return productType;
}

function handleTextSelection() {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    if (!settingsCache.autoIconEnabled) {
        removeExistingIcon();
        return;
    }

    if (selectedText.length === 0 || selectedText.length >= 50) {
        removeExistingIcon();
        return;
    }

    const productType = resolveProductType(selectedText);
    if (productType) {
        showInfoIcon(selectedText, productType, selection);
    } else {
        removeExistingIcon();
    }
}

async function loadSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    settingsCache = { ...getDefaultSettings(), ...settings };
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.settings) {
        settingsCache = { ...getDefaultSettings(), ...changes.settings.newValue };
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'contextSearch') {
        (async () => {
            await loadSettings();
            const text = (request.text || '').trim();
            if (!text) return;
            const productType = resolveProductType(text);
            if (!productType) {
                showErrorModal('Could not detect product type. Refine your selection or adjust settings.');
                return;
            }
            showInfo(text, productType);
        })();
        sendResponse({ ok: true });
        return true;
    }

    if (request.action === 'contextAddCompare') {
        (async () => {
            await loadSettings();
            const text = (request.text || '').trim();
            if (!text) return;
            const productType = resolveProductType(text);
            if (!productType) {
                showErrorModal('Could not detect product type. Refine your selection or adjust settings.');
                return;
            }
            await addToCompareQueue(text, productType);
        })();
        sendResponse({ ok: true });
        return true;
    }

    return false;
});

loadSettings().then(() => {
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    // Touch / Android: selection often completes without a synthetic mouseup; selectionchange covers that.
    let selectionDebounce = null;
    document.addEventListener('selectionchange', () => {
        if (selectionDebounce) clearTimeout(selectionDebounce);
        selectionDebounce = setTimeout(() => {
            selectionDebounce = null;
            handleTextSelection();
        }, 80);
    });
});
