// Function to show product information with modern UI
async function showInfo(selectedStr, productType) {
    // Show loading modal first
    showLoadingModal();
    
    try {
    let response = await chrome.runtime.sendMessage({
        action: "getBenchmark",
        selectedStr: selectedStr,
        productType: productType
    });
        
    console.log('response:', response, 'productType:', productType);
        
        // Hide loading modal
        hideLoadingModal();
        
        if (response && response.passmark) {
            showModernModal(response, productType);
        } else {
            showErrorModal('Benchmark data not found');
        }
    } catch (error) {
        console.error('Error fetching benchmark:', error);
        hideLoadingModal();
        showErrorModal('Failed to fetch data');
    }
}

// Function to show loading modal
function showLoadingModal() {
    const modal = document.createElement('div');
    modal.id = 'benchmarkit-loading-modal';
    modal.innerHTML = `
        <div class="benchmarkit-modal-overlay">
            <div class="benchmarkit-modal-content loading">
                <div class="benchmarkit-spinner"></div>
                <p>Fetching benchmark data...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    addModalStyles();
}

// Function to hide loading modal
function hideLoadingModal() {
    const modal = document.getElementById('benchmarkit-loading-modal');
    if (modal) {
        modal.remove();
    }
}

// Function to show modern modal with benchmark data
function showModernModal(data, productType) {
    const modal = document.createElement('div');
    modal.id = 'benchmarkit-modal';
    console.log('data:', data);
    
    const productName = data.passmark.productName || 'Unknown Product';
    const passmark = data.passmark || {};
    
    let scoreContent = '';
    if (productType === 'cpu') {
        const multiCore = passmark.multiCoreScore || 'N/A';
        const singleCore = passmark.singleCoreScore || 'N/A';
        scoreContent = `
            <div class="benchmarkit-score-item">
                <div class="benchmarkit-score-label">Multi-Core Score</div>
                <div class="benchmarkit-score-value">${multiCore}</div>
            </div>
            <div class="benchmarkit-score-item">
                <div class="benchmarkit-score-label">Single-Core Score</div>
                <div class="benchmarkit-score-value">${singleCore}</div>
            </div>
        `;
    } else if (productType === 'gpu') {
        const score = passmark.score || 'N/A';
        scoreContent = `
            <div class="benchmarkit-score-item">
                <div class="benchmarkit-score-label">Benchmark Score</div>
                <div class="benchmarkit-score-value">${score}</div>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="benchmarkit-modal-overlay">
            <div class="benchmarkit-modal-content">
                <div class="benchmarkit-modal-header">
                    <h3>${productName}</h3>
                    <button class="benchmarkit-close-btn" id="benchmarkit-close-btn">×</button>
                </div>
                <div class="benchmarkit-modal-body">
                    <div class="benchmarkit-product-type">${productType.toUpperCase()}</div>
                    <div class="benchmarkit-scores">
                        ${scoreContent}
                    </div>
                    <div class="benchmarkit-footer">
                        <a href="https://www.cpubenchmark.net/" target="_blank" class="benchmarkit-link">
                            View Details on PassMark
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    addModalStyles();
    
    // Add close functionality
    const closeModal = () => {
        const modal = document.getElementById('benchmarkit-modal');
        if (modal) {
            modal.remove();
        }
    };
    
    // Close button click
    const closeBtn = modal.querySelector('#benchmarkit-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    // Close on overlay click
    modal.querySelector('.benchmarkit-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Function to show error modal
function showErrorModal(message) {
    const modal = document.createElement('div');
    modal.id = 'benchmarkit-error-modal';
    
    modal.innerHTML = `
        <div class="benchmarkit-modal-overlay">
            <div class="benchmarkit-modal-content error">
                <div class="benchmarkit-error-icon">⚠️</div>
                <h3>Error</h3>
                <p>${message}</p>
                <button class="benchmarkit-btn benchmarkit-btn-primary" id="benchmarkit-error-ok-btn">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add styles
    addModalStyles();
    
    // Add close functionality
    const closeErrorModal = () => {
        const modal = document.getElementById('benchmarkit-error-modal');
        if (modal) {
            modal.remove();
        }
    };
    
    // OK button click
    const okBtn = modal.querySelector('#benchmarkit-error-ok-btn');
    if (okBtn) {
        okBtn.addEventListener('click', closeErrorModal);
    }
    
    // Close on overlay click
    modal.querySelector('.benchmarkit-modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeErrorModal();
        }
    });
    
    // Close on Escape key
    const escapeHandler = (e) => {
        if (e.key === 'Escape') {
            closeErrorModal();
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Function to add modal styles
function addModalStyles() {
    if (document.getElementById('benchmarkit-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'benchmarkit-modal-styles';
    styles.textContent = `
        .benchmarkit-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100000;
            animation: benchmarkit-fadeIn 0.3s ease-out;
        }
        
        .benchmarkit-modal-content {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow: hidden;
            animation: benchmarkit-slideIn 0.3s ease-out;
        }
        
        .benchmarkit-modal-content.loading {
            padding: 40px;
            text-align: center;
        }
        
        .benchmarkit-modal-content.error {
            padding: 30px;
            text-align: center;
        }
        
        .benchmarkit-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            border-bottom: 1px solid #e5e7eb;
            background: #f8fafc;
        }
        
        .benchmarkit-modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
        }
        
        .benchmarkit-close-btn {
            background: none;
            border: none;
            font-size: 24px;
            color: #6b7280;
            cursor: pointer;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s ease;
        }
        
        .benchmarkit-close-btn:hover {
            background: #e5e7eb;
            color: #374151;
        }
        
        .benchmarkit-modal-body {
            padding: 24px;
        }
        
        .benchmarkit-product-type {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .benchmarkit-scores {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 24px;
        }
        
        .benchmarkit-score-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        
        .benchmarkit-score-label {
            font-weight: 500;
            color: #374151;
        }
        
        .benchmarkit-score-value {
            font-size: 18px;
            font-weight: 700;
            color: #1f2937;
        }
        
        .benchmarkit-footer {
            text-align: center;
        }
        
        .benchmarkit-link {
            color: #3b82f6;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border: 1px solid #3b82f6;
            border-radius: 6px;
            display: inline-block;
            transition: all 0.2s ease;
        }
        
        .benchmarkit-link:hover {
            background: #3b82f6;
            color: white;
        }
        
        .benchmarkit-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .benchmarkit-btn-primary {
            background: #3b82f6;
            color: white;
        }
        
        .benchmarkit-btn-primary:hover {
            background: #2563eb;
        }
        
        .benchmarkit-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: benchmarkit-spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        
        .benchmarkit-error-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        @keyframes benchmarkit-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes benchmarkit-slideIn {
            from { 
                opacity: 0;
                transform: translateY(-20px) scale(0.95);
            }
            to { 
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        @keyframes benchmarkit-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
            .benchmarkit-modal-content {
                width: 95%;
                margin: 20px;
            }
            
            .benchmarkit-modal-header,
            .benchmarkit-modal-body {
                padding: 16px;
            }
            
            .benchmarkit-score-item {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }
        }
    `;
    
    document.head.appendChild(styles);
}