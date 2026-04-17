import { getResult } from './benchmark-core.js';

const MENU_SEARCH = 'benchmarkit-search';
const MENU_COMPARE = 'benchmarkit-compare';

function isServiceWorkerGlobalScope() {
    return typeof ServiceWorkerGlobalScope !== 'undefined' && self instanceof ServiceWorkerGlobalScope;
}

async function runBenchmarkFetch(request) {
    if (chrome.offscreen && isServiceWorkerGlobalScope()) {
        return offscreenRun(request);
    }
    return getResult(request.selectedStr, request.productType);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getBenchmark' && request._offscreenRelay) {
        return false;
    }

    if (request.action === 'getBenchmark') {
        runBenchmarkFetch(request)
            .then(async (res) => {
                if (res?.result) {
                    await appendHistoryRecord(request, res.result);
                }
                sendResponse(res);
            })
            .catch((e) => {
                console.error(e);
                sendResponse({ result: null, error: String(e) });
            });
        return true;
    }

    if (request.action === 'addToCompare') {
        handleAddToCompare(request)
            .then(sendResponse)
            .catch((e) => sendResponse({ ok: false, error: String(e) }));
        return true;
    }

    if (request.action === 'GET_STATS') {
        getStats().then(sendResponse);
        return true;
    }

    if (request.action === 'RESET_ALL') {
        resetAllStorage().then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false, error: String(e) }));
        return true;
    }

    if (request.action === 'REMOVE_COMPARE_ITEM') {
        removeCompareItem(request.id).then(() => sendResponse({ ok: true })).catch((e) => sendResponse({ ok: false }));
        return true;
    }

    if (request.action === 'CLEAR_COMPARE') {
        chrome.storage.local.set({ compareItems: [] }).then(() => sendResponse({ ok: true }));
        return true;
    }

    return false;
});

async function appendHistoryRecord(request, result) {
    const { history = [] } = await chrome.storage.local.get('history');
    const entry = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
        ts: Date.now(),
        query: request.selectedStr,
        productType: request.productType,
        productName: result?.productName || request.selectedStr,
        url: result?.url
    };
    history.unshift(entry);
    await chrome.storage.local.set({ history: history.slice(0, 500) });
}

async function handleAddToCompare(request) {
    const res = await runBenchmarkFetch({
        action: 'getBenchmark',
        selectedStr: request.selectedStr,
        productType: request.productType
    });
    if (!res?.result) {
        return { ok: false, error: 'Benchmark data not found' };
    }
    const { compareItems = [] } = await chrome.storage.local.get('compareItems');
    const item = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        ts: Date.now(),
        query: request.selectedStr,
        productType: request.productType,
        result: res.result
    };
    compareItems.unshift(item);
    await chrome.storage.local.set({ compareItems: compareItems.slice(0, 8) });
    return { ok: true };
}

async function getStats() {
    const { history = [] } = await chrome.storage.local.get('history');
    const counts = { cpu: 0, gpu: 0, mobile: 0 };
    for (const h of history) {
        if (counts[h.productType] !== undefined) {
            counts[h.productType]++;
        }
    }
    return { counts, total: history.length };
}

async function resetAllStorage() {
    await chrome.storage.local.set({
        history: [],
        compareItems: [],
        settings: {
            autoIconEnabled: true,
            customIconRegex: '',
            customMatchProductType: 'cpu'
        }
    });
}

async function removeCompareItem(id) {
    const { compareItems = [] } = await chrome.storage.local.get('compareItems');
    await chrome.storage.local.set({
        compareItems: compareItems.filter((x) => x.id !== id)
    });
}

async function offscreenRun(request) {
    await chrome.offscreen.createDocument({
        url: chrome.runtime.getURL('background/offscreen.html'),
        reasons: ['WORKERS'],
        justification: 'Workaround of using the DOM on Chromium service worker'
    });
    await new Promise((resolve) => setTimeout(resolve, 75));
    let result;
    try {
        result = await chrome.runtime.sendMessage({
            action: 'getBenchmark',
            selectedStr: request.selectedStr,
            productType: request.productType,
            _offscreenRelay: true
        });
    } finally {
        try {
            await chrome.offscreen.closeDocument();
        } catch (e) {
            /* ignore */
        }
    }
    return result;
}

function setupContextMenus() {
    if (!chrome.contextMenus) return;
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: MENU_SEARCH,
            title: 'Search benchmark with BenchmarkIt!',
            contexts: ['selection']
        });
        chrome.contextMenus.create({
            id: MENU_COMPARE,
            title: 'Add selection to BenchmarkIt comparison',
            contexts: ['selection']
        });
    });
}

chrome.runtime.onInstalled.addListener(() => {
    setupContextMenus();
    ensureDefaultSettings();
});

if (chrome.runtime.onStartup) {
    chrome.runtime.onStartup.addListener(() => {
        setupContextMenus();
    });
}

setupContextMenus();
ensureDefaultSettings();

async function ensureDefaultSettings() {
    const { settings } = await chrome.storage.local.get('settings');
    if (!settings) {
        await chrome.storage.local.set({
            settings: {
                autoIconEnabled: true,
                customIconRegex: '',
                customMatchProductType: 'cpu'
            }
        });
    }
}

if (chrome.contextMenus && chrome.contextMenus.onClicked) {
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const text = (info.selectionText || '').trim();
    if (!text || !tab?.id) return;
    if (info.menuItemId === MENU_SEARCH) {
        chrome.tabs.sendMessage(tab.id, { action: 'contextSearch', text }).catch(() => {});
    }
    if (info.menuItemId === MENU_COMPARE) {
        chrome.tabs.sendMessage(tab.id, { action: 'contextAddCompare', text }).catch(() => {});
    }
});
}
