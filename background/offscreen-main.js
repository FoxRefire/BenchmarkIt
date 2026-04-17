import { getResult } from './benchmark-core.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getBenchmark' && request._offscreenRelay) {
        getResult(request.selectedStr, request.productType).then((res) => sendResponse(res));
        return true;
    }
    return false;
});
