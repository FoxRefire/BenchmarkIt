function escapeHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function badgeClass(type) {
    if (type === 'cpu') return 'cpu';
    if (type === 'gpu') return 'gpu';
    return 'mobile';
}

function scoreBlock(productType, result) {
    if (!result) return '<p class="p-muted">No data</p>';
    if (productType === 'cpu') {
        return `
            <div class="p-kv"><span class="p-muted">Multi‑core</span><span>${escapeHtml(result.multiCoreScore || '—')}</span></div>
            <div class="p-kv"><span class="p-muted">Single‑core</span><span>${escapeHtml(result.singleCoreScore || '—')}</span></div>
        `;
    }
    if (productType === 'gpu') {
        return `
            <div class="p-kv"><span class="p-muted">Score</span><span>${escapeHtml(result.score || '—')}</span></div>
        `;
    }
    return `
        <div class="p-kv"><span class="p-muted">AnTuTu 11</span><span>${escapeHtml(result.antutu || '—')}</span></div>
        <div class="p-kv"><span class="p-muted">GB6 Single</span><span>${escapeHtml(result.geekbench_s || '—')}</span></div>
        <div class="p-kv"><span class="p-muted">GB6 Multi</span><span>${escapeHtml(result.geekbench_m || '—')}</span></div>
        <div class="p-kv"><span class="p-muted">GB6 GPU</span><span>${escapeHtml(result.geekbench_g || '—')}</span></div>
    `;
}

function render(items) {
    const grid = document.getElementById('compare-grid');
    const empty = document.getElementById('compare-empty');
    grid.innerHTML = '';

    if (!items.length) {
        empty.hidden = false;
        grid.hidden = true;
        return;
    }

    empty.hidden = true;
    grid.hidden = false;

    for (const item of items) {
        const type = item.productType || 'cpu';
        const card = document.createElement('div');
        card.className = 'p-item';
        const title = item.result?.productName || item.query || 'Unknown';
        const url = item.result?.url;
        const linkLabel = type === 'mobile' ? 'NanoReview' : 'PassMark';

        const top = document.createElement('div');
        top.className = 'p-row';
        top.style.justifyContent = 'space-between';
        top.style.marginBottom = '8px';

        const badge = document.createElement('span');
        badge.className = `p-badge ${badgeClass(type)}`;
        badge.textContent = type;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'p-btn danger';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', async () => {
            await chrome.runtime.sendMessage({ action: 'REMOVE_COMPARE_ITEM', id: item.id });
            await refresh();
        });

        top.appendChild(badge);
        top.appendChild(removeBtn);

        const h3 = document.createElement('h3');
        h3.textContent = title;

        const q = document.createElement('p');
        q.className = 'p-muted';
        q.style.margin = '0 0 10px';
        q.style.fontSize = '12px';
        q.textContent = `Query: ${item.query || ''}`;

        const scores = document.createElement('div');
        scores.innerHTML = scoreBlock(type, item.result);

        const actions = document.createElement('div');
        actions.className = 'p-row';
        actions.style.marginTop = '10px';
        if (url) {
            const a = document.createElement('a');
            a.className = 'p-btn primary';
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.textContent = `Open ${linkLabel}`;
            actions.appendChild(a);
        }

        card.appendChild(top);
        card.appendChild(h3);
        card.appendChild(q);
        card.appendChild(scores);
        card.appendChild(actions);
        grid.appendChild(card);
    }
}

async function refresh() {
    const { compareItems = [] } = await chrome.storage.local.get('compareItems');
    render(compareItems);
}

document.getElementById('clear-compare').addEventListener('click', async () => {
    if (!confirm('Remove all comparison items?')) return;
    await chrome.runtime.sendMessage({ action: 'CLEAR_COMPARE' });
    await refresh();
});

document.getElementById('open-history').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/history.html') });
});

document.getElementById('open-settings').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('pages/options.html') });
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.compareItems) {
        refresh();
    }
});

refresh();
