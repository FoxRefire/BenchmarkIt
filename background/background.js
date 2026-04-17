chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(chrome.offscreen) {
        offscreenRun(request).then(d => sendResponse(d))
    } else {
        if (request.action === "getBenchmark") {
            console.log('getBenchmark called with:', request.selectedStr, request.productType);
            getResult(request.selectedStr, request.productType).then(result => {
                console.log('getResult result:', result);
                sendResponse(result);
            });
        }
    }
    return true;
});

async function getResult(text, productType) {
    text = normalizeText(text);
    if (productType === "cpu") {
        let result = await getCPUPassmark(text);
        return {
            result: result
        };
    } else if (productType === "gpu") {
        let result = await getGPUPassmark(text);
        return {
            result: result
        };
    } else if (productType === "mobile") {
        let result = await getMobileNanoReview(text);
        return {
            result: result
        };
    }
}

async function offscreenRun(request) {
    await chrome.offscreen.createDocument({
        url: '/background/offscreen.html',
        reasons: ['WORKERS'],
        justification: 'Workaround of using the DOM on Chromium service worker'
    })
    let result = await chrome.runtime.sendMessage(request)
    await chrome.offscreen.closeDocument()
    return result
}

// Function to normalize text for better matching
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[™®©]/g, '') // Remove trademark symbols
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[_]/g, ' ') // Replace underscores with spaces (keep hyphens for processor names)
        .trim();
}

async function getProductLinkByDDG(text, provider) {
    const searchQuery = {
        cpubenchmark: "cpu.php?cpu= site:www.cpubenchmark.net",
        videocardbenchmark: "gpu.php?gpu= site:www.videocardbenchmark.net",
        nanoreview: "site:nanoreview.net"
    }
    const filterQuery = {
        cpubenchmark: "cpu.php?cpu=",
        videocardbenchmark: "gpu.php?gpu=",
        nanoreview: "/en/phone/"
    }
    const searchUrl = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(`${text} ${searchQuery[provider]}`);
    const response = await fetch(searchUrl).then(response => response.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    const searchResults = doc.querySelectorAll("a.result__url")
    for (let i = 0; i < 10; i++) {
        const url = new URL(searchResults[i].href).searchParams.get("uddg");
        if (url.includes(filterQuery[provider])) {
            return url;
        }
    }
}

async function getCPUPassmark(text) {
    let response, url;
    url = "https://www.cpubenchmark.net/cpu.php?cpu=" + encodeURIComponent(text);
    response = await fetch(url);
    if (!response.ok) {
        url = await getProductLinkByDDG(text, "cpubenchmark")
        response = await fetch(url);
    }
    response = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return {
        productName: doc.querySelector("div.productheader h1")?.innerText,
        multiCoreScore: doc.querySelector("div.right-desc > div:nth-child(3)")?.innerText,
        singleCoreScore: doc.querySelector("div.right-desc > div:nth-child(5)")?.innerText,
        url: url
    };
}

async function getGPUPassmark(text) {
    let response, url;
    url = "https://www.videocardbenchmark.net/gpu.php?gpu=" + encodeURIComponent(text);
    response = await fetch(url);

    if (!response.ok || !response.url.includes("gpu.php")) {
        let gpuId = await findGpuIdFromGPUList(text);
        url = `https://www.videocardbenchmark.net/gpu.php?id=${gpuId}`;
        response = await fetch(url);
    }
    response = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return {
        productName: doc.querySelector(".main-cmps-head h1")?.innerText,
        score: doc.querySelector("div.right-desc > span:nth-child(3)")?.innerText,
        url: url
    };
}

async function findGpuIdFromGPUList(text) {
    let response = await fetch("https://www.videocardbenchmark.net/gpu_list.php").then(r => r.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const allGPUs = Array.from(doc.querySelectorAll("#cputable td:nth-child(1) a"));
    console.log('allGPUs:', allGPUs);
    const foundGpu = allGPUs.find(gpu => normalizeText(gpu.innerText).includes(text));
    console.log('foundGpu:', foundGpu);
    return new URL(foundGpu.href).searchParams.get("id");

}

async function getMobileNanoReview(text) {
    let response, url;
    url = await getProductLinkByDDG(text, "nanoreview")
    console.log('url:', url);
    response = await fetch(url).then(r => r.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    let antutu = Array.from(doc.querySelectorAll(".score-bar")).filter(e => e?.querySelector(".score-bar-name")?.innerText.includes("AnTuTu Benchmark 11"))[0]
    let geekbench_s = Array.from(doc.querySelectorAll(".score-bar")).filter(e => e?.querySelector(".score-bar-name")?.innerText.includes("Geekbench 6 (Single-Core)"))[0]
    let geekbench_m = Array.from(doc.querySelectorAll(".score-bar")).filter(e => e?.querySelector(".score-bar-name")?.innerText.includes("Geekbench 6 (Multi-Core)"))[0]
    let geekbench_g = Array.from(doc.querySelectorAll(".score-bar")).filter(e => e?.querySelector(".score-bar-name")?.innerText.includes("Compute Score (GPU)"))[0]
    return {
        productName: doc.querySelector(".title-h1")?.innerText,
        antutu: antutu.querySelector(".score-bar-result-number")?.innerText,
        geekbench_s: geekbench_s.querySelector(".score-bar-result-number")?.innerText,
        geekbench_m: geekbench_m.querySelector(".score-bar-result-number")?.innerText,
        geekbench_g: geekbench_g.querySelector(".score-bar-result-number")?.innerText,
        url: url
    };
}