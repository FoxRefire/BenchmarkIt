function fmtDate(ts) {
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(ts));
    } catch (e) {
        return new Date(ts).toLocaleString();
    }
}

function badgeClass(type) {
    if (type === 'cpu') return 'cpu';
    if (type === 'gpu') return 'gpu';
    return 'mobile';
}

function renderTable(rows) {
    const body = document.getElementById('history-body');
    const empty = document.getElementById('history-empty');
    const wrap = document.getElementById('history-table-wrap');
    body.innerHTML = '';

    if (!rows.length) {
        empty.hidden = false;
        wrap.hidden = true;
        return;
    }

    empty.hidden = true;
    wrap.hidden = false;

    for (const row of rows) {
        const tr = document.createElement('tr');
        const type = row.productType || 'cpu';

        const tdWhen = document.createElement('td');
        tdWhen.textContent = fmtDate(row.ts);

        const tdType = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `p-badge ${badgeClass(type)}`;
        badge.textContent = type;
        tdType.appendChild(badge);

        const tdQuery = document.createElement('td');
        tdQuery.textContent = row.query || '';

        const tdProduct = document.createElement('td');
        tdProduct.textContent = row.productName || '';

        const tdLink = document.createElement('td');
        if (row.url) {
            const a = document.createElement('a');
            a.href = row.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = 'Open';
            tdLink.appendChild(a);
        } else {
            const span = document.createElement('span');
            span.className = 'p-muted';
            span.textContent = '—';
            tdLink.appendChild(span);
        }

        tr.appendChild(tdWhen);
        tr.appendChild(tdType);
        tr.appendChild(tdQuery);
        tr.appendChild(tdProduct);
        tr.appendChild(tdLink);
        body.appendChild(tr);
    }
}

async function refresh() {
    const { history = [] } = await chrome.storage.local.get('history');
    renderTable(history);
}

document.getElementById('clear-history').addEventListener('click', async () => {
    if (!confirm('Clear all search history?')) return;
    await chrome.storage.local.set({ history: [] });
    await refresh();
});

document.getElementById('open-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/options.html') });
});

document.getElementById('open-compare').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/compare.html') });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.history) {
        refresh();
    }
});

refresh();
