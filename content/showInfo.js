// Function to show product information (experimental alert)
async function showInfo(selectedStr, productType) {
    let response = await chrome.runtime.sendMessage({
        action: "getBenchmark",
        selectedStr: selectedStr,
        productType: productType
    });
    console.log('response:', response, 'productType:', productType);
    alert(`response: ${JSON.stringify(response)} \n productType: ${productType}`);
}