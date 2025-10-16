// Content script for BenchmarkIt extension
// Handles text selection and product name detection

// Product name detection patterns
const PRODUCT_PATTERNS = {
    cpu: [
        // Intel patterns
        /intel\s+core\s+i[3-9]-\d+[a-z]*/i,
        /intel\s+core\s+ultra\s+\d+\s+\d+[a-z]*/i,
        /intel\s+core\s+ultra\s+\d+\s+プロセッサー\s+\d+[a-z]*/i,
        /intel\s+core\s+ultra\s+\d+\s+processor\s+\d+[a-z]*/i,
        /intel\s+pentium/i,
        /intel\s+celeron/i,
        /intel\s+xeon/i,
        /intel\s+n\d+[a-z]*/i,
        /core\s+i[3-9]\s+\d+[a-z]*/i,
        /core\s+i[3-9]\s+\d+[a-z]{1,3}/i,
        /core\s+ultra\s+\d+\s+\d+[a-z]*/i,
        /core\s+ultra\s+\d+\s+プロセッサー\s+\d+[a-z]*/i,
        /core\s+ultra\s+\d+\s+processor\s+\d+[a-z]*/i,
        /i[3-9]-\d+[a-z]*/i,
        /pentium\s+g\d+/i,
        /celeron\s+g\d+/i,
        /xeon\s+e\d+/i,
        /xeon\s+w\d+/i,
        /n\d+[a-z]*/i,
        
        // AMD patterns
        /amd\s+ryzen\s+\d+\s+\d+[a-z]*/i,
        /amd\s+ryzen\s+ai\s+\w+/i,
        /amd\s+ryzen\s+threadripper\s+pro\s+\d+[a-z]*/i,
        /amd\s+epyc\s+\d+[a-z]*/i,
        /amd\s+athlon/i,
        /amd\s+a[4-9]/i,
        /ryzen\s+\d+\s+\d+[a-z]*/i,
        /ryzen\s+ai\s+\w+/i,
        /ryzen\s+threadripper\s+pro\s+\d+[a-z]*/i,
        /epyc\s+\d+[a-z]*/i,
        /athlon\s+\d+[a-z]*/i,
        /a[4-9]\d+[a-z]*/i,
        
        // Apple Silicon
        /apple\s+m[1-9]\s+pro/i,
        /apple\s+m[1-9]\s+max/i,
        /apple\s+m[1-9]/i,
        /m[1-9]\s+pro/i,
        /m[1-9]\s+max/i,
        /m[1-9]/i,

        // Qualcomm Snapdragon
        /qualcomm\s+snapdragon\s*\d+[a-z]*/i,
        /snapdragon\s*\d+[a-z]*/i,
        
        // MediaTek
        /mediatek\s+(helio|dimensity)\s*\w+/i,
        /helio\s+\w+/i,
        /dimensity\s+\w+/i,
        
        // Samsung Exynos
        /samsung\s+exynos\s*\d+[a-z]*/i,
        /exynos\s*\d+[a-z]*/i,
        
        // Apple A-series
        /apple\s+a\d+[a-z]*/i,
        /a\d+[a-z]*/i,
        
        // HiSilicon Kirin
        /hisilicon\s+kirin\s*\d+[a-z]*/i,
        /kirin\s*\d+[a-z]*/i
    ],
    
    gpu: [
        // NVIDIA patterns
        /nvidia\s+geforce\s+(rtx|gtx|gts)\s*\d+[a-z]*/i,
        /nvidia\s+quadro/i,
        /nvidia\s+tesla/i,
        /geforce\s+(rtx|gtx|gts)\s*\d+[a-z]*/i,
        /quadro\s+\w+/i,
        /tesla\s+\w+/i,
        /rtx\s*\d+[a-z]*/i,
        /gtx\s*\d+[a-z]*/i,
        /gts\s*\d+[a-z]*/i,
        
        // AMD patterns
        /amd\s+radeon\s+(rx|hd|r[3-9])\s*\d+[a-z]*/i,
        /amd\s+radeon\s+\d+[a-z]*/i,
        /radeon\s+(rx|hd|r[3-9])\s*\d+[a-z]*/i,
        /radeon\s+\d+[a-z]*/i,
        /rx\s*\d+[a-z]*/i,
        /hd\s*\d+[a-z]*/i,
        /r[3-9]\s*\d+[a-z]*/i,
        
        // Intel patterns
        /intel\s+(arc|iris|uhd)\s*(graphics\s*)?\d+[a-z]*/i,
        /arc\s+\w+/i,
        /iris\s+\w+/i,
        /uhd\s+graphics\s+\d+[a-z]*/i,
        /uhd\s+\d+[a-z]*/i
    ],
    
    mobile: [
        // iPhone patterns
        /iphone\s*\d+[a-z]*\s*(pro\s*max|pro|plus|mini)?/i,
        
        // Samsung Galaxy patterns
        /samsung\s+galaxy\s+(s|note|a|z|fold)\d+[a-z]*/i,
        /galaxy\s+(s|note|a|z|fold)\d+[a-z]*/i,
        
        // Google Pixel patterns
        /google\s+pixel\s*\d+[a-z]*/i,
        /pixel\s*\d+[a-z]*/i,
        
        // OnePlus patterns
        /oneplus\s+\d+[a-z]*/i,
        
        // Xiaomi patterns
        /xiaomi\s+(mi|redmi|poco)\s+\w+/i,
        /mi\s+\d+[a-z]*/i,
        /redmi\s+\w+/i,
        /poco\s+\w+/i,
        
        // Huawei patterns
        /huawei\s+(mate|p|nova)\d+[a-z]*/i,
        /mate\s*\d+[a-z]*/i,
        /p\d+[a-z]*/i,
        /nova\s*\d+[a-z]*/i,
        
        // Oppo patterns
        /oppo\s+(find|reno|a)\d+[a-z]*/i,
        /find\s*\d+[a-z]*/i,
        /reno\s*\d+[a-z]*/i,
        
        // Vivo patterns
        /vivo\s+(x|y|v)\d+[a-z]*/i,
        /x\d+[a-z]*/i,
        /y\d+[a-z]*/i,
        /v\d+[a-z]*/i
    ]
};

// Function to normalize text for better matching
function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/[™®©]/g, '') // Remove trademark symbols
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/[_]/g, ' ') // Replace underscores with spaces (keep hyphens for processor names)
        .trim();
}

// Function to detect product type from selected text
function detectProductType(text) {
    const normalizedText = normalizeText(text);
    
    for (const [productType, patterns] of Object.entries(PRODUCT_PATTERNS)) {
        for (const pattern of patterns) {
            if (pattern.test(normalizedText)) {
                return productType;
            }
        }
    }
    
    return null;
}

