function openPage(path) {
    chrome.tabs.create({ url: chrome.runtime.getURL(path) });
}

async function refreshStats() {
    try {
        const stats = await chrome.runtime.sendMessage({ action: 'GET_STATS' });
        if (!stats) return;
        document.getElementById('stat-cpu').textContent = String(stats.counts.cpu || 0);
        document.getElementById('stat-gpu').textContent = String(stats.counts.gpu || 0);
        document.getElementById('stat-mobile').textContent = String(stats.counts.mobile || 0);
        document.getElementById('stat-total').textContent = String(stats.total || 0);
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('open-history').addEventListener('click', () => {
    openPage('pages/history.html');
});

document.getElementById('open-compare').addEventListener('click', () => {
    openPage('pages/compare.html');
});

document.getElementById('open-settings').addEventListener('click', () => {
    openPage('pages/options.html');
});

refreshStats();

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.history) {
        refreshStats();
    }
});
