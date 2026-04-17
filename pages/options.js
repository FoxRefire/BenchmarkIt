const DEFAULTS = {
    autoIconEnabled: true,
    customIconRegex: '',
    customMatchProductType: 'cpu'
};

function getEl(id) {
    return document.getElementById(id);
}

async function loadSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    const s = { ...DEFAULTS, ...settings };
    getEl('auto-icon').checked = !!s.autoIconEnabled;
    getEl('custom-regex').value = s.customIconRegex || '';
    getEl('custom-type').value = s.customMatchProductType || 'cpu';
}

async function saveSettings(partial) {
    const { settings = {} } = await chrome.storage.local.get('settings');
    const next = { ...DEFAULTS, ...settings, ...partial };
    await chrome.storage.local.set({ settings: next });
}

getEl('auto-icon').addEventListener('change', async () => {
    await saveSettings({ autoIconEnabled: getEl('auto-icon').checked });
});

let regexTimer = null;
getEl('custom-regex').addEventListener('input', () => {
    clearTimeout(regexTimer);
    regexTimer = setTimeout(async () => {
        await saveSettings({ customIconRegex: getEl('custom-regex').value.trim() });
    }, 350);
});

getEl('custom-type').addEventListener('change', async () => {
    await saveSettings({ customMatchProductType: getEl('custom-type').value });
});

getEl('reset-all').addEventListener('click', async () => {
    if (!confirm('Reset search history, comparison list, and settings to defaults?')) return;
    await chrome.runtime.sendMessage({ action: 'RESET_ALL' });
    await loadSettings();
});

loadSettings();
