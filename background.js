chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBenchmark") {
        console.log('getBenchmark called with:', request.selectedStr, request.productType);
        getResult(request.selectedStr, request.productType).then(result => {
            console.log('getResult result:', result);
            sendResponse(result);
        });
    }
    return true;
});

async function getResult(text, productType) {
    text = normalizeText(text);
    if (productType === "cpu") {
        let passmark = await getCPUPassmark(text);
        return {
            productName: passmark.productName,
            passmark: passmark
        };
    } else if (productType === "gpu") {
        let passmark = await getGPUPassmark(text);
        return {
            productName: passmark.productName,
            passmark: passmark
        };
    }
}

// Function to normalize text for better matching
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[™®©]/g, '') // Remove trademark symbols
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .trim();
}

async function getProductLinkByDDG(text, provider) {
    const processRule = {
        cpubenchmark: "cpu.php?cpu= site:www.cpubenchmark.net",
        videocardbenchmark: "gpu.php?gpu= site:www.videocardbenchmark.net"
    }
    return await extractFirstLinkFromDuckDuckGo(`${text} ${processRule[provider]}`);
}

async function extractFirstLinkFromDuckDuckGo(query) {
    const url = "https://html.duckduckgo.com/html/?q=" + encodeURIComponent(query);
    const response = await fetch(url).then(response => response.text());
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return doc.querySelector("a.result__url")?.innerText;
}

async function getCPUPassmark(text) {
    let response;
    response = await fetch("https://www.cpubenchmark.net/cpu.php?cpu=" + encodeURIComponent(text));
    if (!response.ok) {
        text = await getProductLinkByDDG(text, "cpubenchmark").then(u => u.match(/cpu\.php\?cpu=(.*)/)?.[1]);
        response = await fetch(`https://www.cpubenchmark.net/cpu.php?cpu=${text}`);
    }
    response = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return {
        productName: doc.querySelector("div.productheader h1")?.innerText,
        multiCoreScore: doc.querySelector("div.right-desc > div:nth-child(3)")?.innerText,
        singleCoreScore: doc.querySelector("div.right-desc > div:nth-child(5)")?.innerText,
    };
}

async function getGPUPassmark(text) {
    let response;
    response = await fetch("https://www.videocardbenchmark.net/gpu.php?gpu=" + encodeURIComponent(text));
    if (!response.ok) {
        text = await getProductLinkByDDG(text, "videocardbenchmark").then(u => u.match(/gpu\.php\?gpu=(.*)/)?.[1]);
        response = await fetch(`https://www.videocardbenchmark.net/gpu.php?gpu=${text}`);
    }
    response = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return {
        productName: doc.querySelector("div.productheader h1")?.innerText,
        score: doc.querySelector("div.right-desc > span:nth-child(3)")?.innerText,
    };
}