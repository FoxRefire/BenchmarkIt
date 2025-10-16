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
            passmark: passmark
        };
    } else if (productType === "gpu") {
        let passmark = await getGPUPassmark(text);
        return {
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
        .replace(/[_]/g, ' ') // Replace underscores with spaces (keep hyphens for processor names)
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
    console.log('response:', response);
    if (!response.ok || !response.url.includes("gpu.php")) {
        let gpuId = await findGpuIdFromGPUList(text);
        console.log('gpuId:', gpuId);
        response = await fetch(`https://www.videocardbenchmark.net/gpu.php?id=${gpuId}`);
    }
    response = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    return {
        productName: doc.querySelector(".main-cmps-head h1")?.innerText,
        score: doc.querySelector("div.right-desc > span:nth-child(3)")?.innerText,
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