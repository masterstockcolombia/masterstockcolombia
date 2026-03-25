/**
 * MS_BROKER_INTEL_V38
 * Cyber Financial Terminal - REAL DATA ONLY
 */

const WEBHOOK_URL = 'https://masterstockcolombia2.app.n8n.cloud/webhook/broker-intel';

const state = {
    retailAvg: 0,
    wholesalePrice: 0,
    productName: '',
    chains: [],
    selectedCapacity: null,
    selectedCondition: 'new',
    baseData: null, // Stores RAW full data
    filteredData: null, // Stores Category filtered data
    n8nData: null
};

const els = {
    searchBtn: document.getElementById('searchBtn'),
    searchInp: document.getElementById('productSearch'),
    retailAvg: document.getElementById('retailAvg'),
    wholesaleEstInp: document.getElementById('wholesaleEstInp'),
    retailList: document.getElementById('retailList'),
    sellerDisc: document.getElementById('sellerDisc'),
    buyerDisc: document.getElementById('buyerDisc'),
    sellerDiscVal: document.getElementById('sellerDiscVal'),
    buyerDiscVal: document.getElementById('buyerDiscVal'),
    purchasePrice: document.getElementById('purchasePrice'),
    salePrice: document.getElementById('salePrice'),
    netMargin: document.getElementById('netMarginResult'),
    profitUnit: document.getElementById('profitUnit'),
    totalProfit: document.getElementById('totalProfit'),
    marginGauge: document.getElementById('marginGauge'),
    decisionInsight: document.getElementById('decisionInsight'),
    insightTitle: document.getElementById('insightTitle'),
    insightDesc: document.getElementById('insightDesc'),
    minReqDisc: document.getElementById('minReqDisc'),
    minMaxPrice: document.getElementById('minMaxPrice'),
    idealReqDisc: document.getElementById('idealReqDisc'),
    idealMaxPrice: document.getElementById('idealMaxPrice'),
    logistics: document.getElementById('logistics'),
    minMargin: document.getElementById('minMargin'),
    capacityContainer: document.getElementById('capacityContainer'),
    capacityOptions: document.getElementById('capacityOptions'),
    conditionContainer: document.getElementById('conditionContainer'),
    conditionOptions: document.querySelectorAll('#conditionOptions .capacity-chip'),
    flippingScore: document.getElementById('flippingScore'),
    qtyInp: document.getElementById('qtyInp'),
    repairCostInp: document.getElementById('repairCostInp'),
    copyPitchBtn: document.getElementById('copyPitchBtn'),
    inspectionChecklist: document.getElementById('inspectionChecklist'),
    checklistItems: document.getElementById('checklistItems'),
    historyChartCanvas: document.getElementById('historyChartCanvas'),
    historyChartContainer: document.getElementById('historyChartContainer'),
    allHistoryChartCanvas: document.getElementById('allHistoryChartCanvas'),
    allHistoryChartContainer: document.getElementById('allHistoryChartContainer'),
    allTrendsChartCanvas: document.getElementById('allTrendsChartCanvas'),
    allTrendsChartContainer: document.getElementById('allTrendsChartContainer'),
    volatilityContainer: document.getElementById('volatilityContainer'),
    volatilityList: document.getElementById('volatilityList'),
    riskTrafficLight: document.getElementById('riskTrafficLight')
};

// --- CATEGORY FILTER LOGIC ---
const filterDataByCategory = (data, category) => {
    if (!Array.isArray(data)) return [];
    if (!category) return data;

    const filtered = data.filter(item => {
        const m = (item.model || "").toUpperCase();

        if (category === 'laptops') {
            return m.includes('MACBOOK') ||
                m.includes('DELL') ||
                m.includes('THINKPAD') ||
                m.includes('HP ') ||
                m.includes('ASUS') ||
                m.includes('LENOVO') ||
                m.includes('MSI') ||
                m.includes('SURFACE') ||
                m.includes('LAPTOP') ||
                m.includes('NOTEBOOK') ||
                m.includes('SPECTRE') ||
                m.includes('PAVILION') ||
                m.includes('INSPIRON') ||
                m.includes('XPS');
        }
        if (category === 'smartphones') {
            return m.includes('IPHONE') || m.includes('SAMSUNG') || m.includes('PIXEL') || m.includes('GALAXY');
        }
        if (category === 'consoles') {
            return m.includes('PS5') || m.includes('XBOX') || m.includes('SWITCH') || m.includes('NINTENDO');
        }
        return true; // Show all if category unknown
    });

    console.log(`🔍 Filter applied: ${category} -> ${filtered.length}/${data.length} items matched`);
    return filtered;
};

// EVENT: Category Change -> Re-Filter & Re-Render
const catSelect = document.getElementById('categorySelect');
if (catSelect) {
    catSelect.addEventListener('change', () => {
        if (state.baseData) {
            updateFromData(state.baseData); // Re-run pipeline with new category
        }
    });
}

function updateFromData(data) {
    // 1. Apply Filtering
    const currentCat = catSelect ? catSelect.value : 'smartphones';
    const filtered = filterDataByCategory(data, currentCat);
    state.filteredData = filtered;

    console.log(`✅ Filtering for ${currentCat}: ${filtered.length} items found.`);

    if (filtered.length === 0) {
        console.warn(`⚠️ No items found for category: ${currentCat}`);
        // Clear charts
        if (els.historyChartContainer) els.historyChartContainer.style.display = 'none';
        if (els.allHistoryChartContainer) els.allHistoryChartContainer.style.display = 'none';
        if (els.allTrendsChartContainer) els.allTrendsChartContainer.style.display = 'none';
        if (els.volatilityContainer) els.volatilityContainer.style.display = 'none';
        return;
    }

    // 2. Refresh Context (Search Match) within Filtered Data
    const searchVal = els.searchInp ? els.searchInp.value.toUpperCase().trim() : '';
    let bestMatch = null;

    if (searchVal) {
        bestMatch = filtered.find(i => extractFamilyName(i.model) === searchVal);
        if (!bestMatch) bestMatch = filtered.find(i => i.model.toUpperCase().includes(searchVal));
    }

    // If no search match, use first item from filtered category
    if (!bestMatch && filtered.length > 0) bestMatch = filtered[0];

    if (bestMatch) {
        state.n8nData = bestMatch;
        state.productName = extractFamilyName(bestMatch.model);
        state.selectedCapacity = getCapacity(bestMatch);

        populateCapacityOptions(filtered); // Only show capacities from filtered group
        applyCapacity(state.selectedCapacity);

        els.capacityContainer.style.display = 'block';
        els.conditionContainer.style.display = 'block';
        els.riskTrafficLight.style.display = 'block';

        // Update Single Item Chart (if history exists)
        if (bestMatch.price_history) {
            updateHistoryChart(bestMatch.price_history);
        } else {
            if (els.historyChartContainer) els.historyChartContainer.style.display = 'none';
        }
    }

    // 3. Update Global/Market Charts using FILTERED data
    console.log(`📊 Rendering charts for ${filtered.length} ${currentCat} items`);
    renderAllHistoryChart(filtered);
    renderAllTrendsChart(filtered);
}

let historyChartInstance = null;
let allHistoryChartInstance = null;
let allTrendsChartInstance = null;
const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

// Robust number parsing to handle "null", "$500", "500.00", etc.
const parseNum = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        if (val.toLowerCase() === 'null') return 0;
        const clean = val.replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    }
    return 0;
};

// Track typing state to prevent overwriting
let isTypingPurchase = false;
let isTypingSale = false;

function updateCalculations() {
    state.wholesalePrice = parseFloat(els.wholesaleEstInp.value) || 0;
    const sDisc = parseFloat(els.sellerDisc.value) || 0;
    const bDisc = parseFloat(els.buyerDisc.value) || 0;

    // Initialize Logistics & Min Margin from Inputs or defaults
    state.logisticsCost = parseFloat(els.logistics.value) || 0;
    state.minMarginReq = parseFloat(els.minMargin.value) || 10;

    const qty = parseInt(els.qtyInp.value) || 1;
    const logist = parseFloat(els.logistics.value) || 0;
    const repair = parseFloat(els.repairCostInp.value) || 0;
    const minM = parseFloat(els.minMargin.value) || 10;

    els.sellerDiscVal.innerText = sDisc + '%';
    els.buyerDiscVal.innerText = bDisc + '%';

    if (state.wholesalePrice === 0) return;

    const pCompUnit = state.wholesalePrice * (1 - sDisc / 100);
    const pVentaUnit = state.wholesalePrice * (1 - bDisc / 100);
    const totalCosts = logist + repair;
    const profitUnit = pVentaUnit - pCompUnit - totalCosts;
    const marginPercent = pVentaUnit > 0 ? (profitUnit / pVentaUnit) * 100 : 0;

    els.netMargin.innerText = marginPercent.toFixed(1) + '%';
    els.profitUnit.innerText = fmt(profitUnit);
    els.totalProfit.innerText = fmt(profitUnit * qty);

    // Only update Inputs if user is NOT typing in them
    if (!isTypingPurchase && els.purchasePrice) els.purchasePrice.value = fmt(pCompUnit);
    if (!isTypingSale && els.salePrice) els.salePrice.value = fmt(pVentaUnit);

    renderNegotiationStrategy(marginPercent, sDisc, bDisc, totalCosts, minM, pVentaUnit, pCompUnit);
}

// NEW: Handlers for Manual Price Input (Reverse Sync)
function handleManualPriceInput(type) {
    const ws = state.wholesalePrice;
    if (ws <= 0) return;

    if (type === 'buy') {
        const rawVal = parseNum(els.purchasePrice.value);
        // Logic: Discount = 1 - (Price / Wholesale)
        let newDisc = (1 - (rawVal / ws)) * 100;
        newDisc = Math.max(0, Math.min(newDisc, 100)); // Clamp
        els.sellerDisc.value = newDisc; // Update Slider directly (no rounding for smooth feel)
        updateCalculations();
    } else if (type === 'sell') {
        const rawVal = parseNum(els.salePrice.value);
        // Logic: Discount = 1 - (Price / Wholesale)
        let newDisc = (1 - (rawVal / ws)) * 100;
        newDisc = Math.max(0, Math.min(newDisc, 100));
        els.buyerDisc.value = newDisc; // Update Slider directly
        updateCalculations();
    }
}

// Robust Event Attachment with UX Enchancements
setTimeout(() => {
    const pInput = document.getElementById('purchasePrice');
    const sInput = document.getElementById('salePrice');

    const setupInput = (input, type) => {
        if (!input) return;

        // 1. FOCUS: Clean formatting for easy editing
        input.addEventListener('focus', () => {
            if (type === 'buy') isTypingPurchase = true;
            if (type === 'sell') isTypingSale = true;
            const val = parseNum(input.value);
            input.value = val === 0 ? '' : val; // Clear if 0, else show raw number
            input.select(); // Select all for quick overwrite
        });

        // 2. INPUT: Real-time Sync (Modifies automatic the bar)
        input.addEventListener('input', () => {
            handleManualPriceInput(type);
        });

        // 3. BLUR: Re-apply formatting and finalize
        input.addEventListener('blur', () => {
            if (type === 'buy') isTypingPurchase = false;
            if (type === 'sell') isTypingSale = false;

            // Re-run calc to ensure final state is clean
            handleManualPriceInput(type);

            // Manually re-format here because updateCalculations might have skipped it
            input.value = fmt(parseNum(input.value));
        });

        // 4. ENTER: Blur to trigger finalize
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') input.blur();
        });
    };

    if (pInput) {
        els.purchasePrice = pInput;
        setupInput(pInput, 'buy');
    }

    if (sInput) {
        els.salePrice = sInput;
        setupInput(sInput, 'sell');
    }

}, 500);

function renderNegotiationStrategy(margin, sDisc, bDisc, totalCosts, minM, pVenta, pCompActual) {
    els.decisionInsight.style.display = 'block';
    const ws = state.wholesalePrice;

    // Minimum 10%
    const minMaxBuy = pVenta - totalCosts - (pVenta * 0.10);
    const minReqDiscVal = ws > 0 ? Math.max(0, ((ws - minMaxBuy) / ws) * 100) : 0;
    els.minReqDisc.innerText = minReqDiscVal.toFixed(1) + '%';
    els.minMaxPrice.innerText = fmt(minMaxBuy);

    // Ideal 20%
    const idealMaxBuy = pVenta - totalCosts - (pVenta * 0.20);
    const idealReqDiscVal = ws > 0 ? Math.max(0, ((ws - idealMaxBuy) / ws) * 100) : 0;
    els.idealReqDisc.innerText = idealReqDiscVal.toFixed(1) + '%';
    els.idealMaxPrice.innerText = fmt(idealMaxBuy);

    if (margin < minM) {
        els.insightTitle.innerText = "🚨 LOSS ALERT";
        els.decisionInsight.classList.remove('optimal');
    } else {
        els.insightTitle.innerText = "✅ PROFITABLE DEAL";
        els.decisionInsight.classList.add('optimal');
    }
}

function applyCapacity(capKey) {
    if (!state.n8nData) return;
    state.selectedCapacity = capKey;
    const t = state.n8nData;

    // Find the specific item variant for this capacity
    // We need to look into baseData to find the 'sibling' that matches the selected capacity
    if (state.baseData) {
        const variant = state.baseData.find(i => i.model === t.model && getCapacity(i) === capKey);
        if (variant) {
            // Update the main data pointer to this specific variant
            state.n8nData = variant;
        }
    }

    // Re-bind to (potentially new) t
    const currentItem = state.n8nData;

    // Safe extraction of prices
    const pNew = parseNum(currentItem.cheapest_new);
    const pRenewed = parseNum(currentItem.cheapest_renewed);
    const pUsed = parseNum(currentItem.cheapest_used);
    const pBase = parseNum(currentItem.base_market_value);

    // Determines the anchor price based on selected condition
    let mainPrice = 0;
    if (state.selectedCondition === 'new') {
        mainPrice = pNew > 0 ? pNew : pRenewed;
    } else if (state.selectedCondition === 'grade-a') {
        mainPrice = pRenewed > 0 ? pRenewed : (pNew > 0 ? pNew * 0.85 : 0);
    } else { // Grade B
        mainPrice = pUsed > 0 ? pUsed : (pRenewed > 0 ? pRenewed * 0.85 : 0);
    }

    if (mainPrice === 0) {
        // fallback
        mainPrice = pNew || pRenewed || pUsed || 0;
    }

    // RE-RENDER PRICE HISTORY CHART for this specific variant
    if (currentItem.price_history) {
        updateHistoryChart(currentItem.price_history);
    } else {
        els.historyChartContainer.style.display = 'none';
    }

    // RE-RENDER GLOBAL CHARTS with Capacity Filter
    if (state.baseData) {
        renderAllHistoryChart(state.baseData);
        renderAllTrendsChart(state.baseData);
    }

    // Dynamic Chain Construction based on REAL data
    state.chains = [];
    let activePrices = [];

    // Helper to identify source from URL
    const getSource = (url) => {
        if (!url) return 'Marketplace';
        const u = url.toLowerCase();
        if (u.includes('amazon')) return 'Amazon';
        if (u.includes('ebay')) return 'eBay';
        if (u.includes('walmart')) return 'Walmart';
        if (u.includes('backmarket')) return 'BackMarket';
        if (u.includes('swappa')) return 'Swappa';
        return 'Marketplace';
    };

    // 1. Add New Price if exists
    if (pNew > 0) {
        const src = getSource(currentItem.url_new);
        state.chains.push({ name: `${src} (New)`, price: pNew, url: currentItem.url_new, date: currentItem.last_update });
        activePrices.push(pNew);
    }

    // 2. Add Renewed Price if exists
    if (pRenewed > 0) {
        const src = getSource(currentItem.url_renewed);
        state.chains.push({ name: `${src} (Renewed)`, price: pRenewed, url: currentItem.url_renewed, date: currentItem.last_update });
        activePrices.push(pRenewed);
    }

    // 3. Add Used Price if exists
    if (pUsed > 0) {
        const src = getSource(currentItem.url_used);
        state.chains.push({ name: `${src} (Used)`, price: pUsed, url: currentItem.url_used, date: currentItem.last_update });
        activePrices.push(pUsed);
    }

    // 4. Always show Base Market Value as reference
    if (pBase > 0) {
        state.chains.push({ name: '📉 Base / Liquidation', price: pBase, url: null, date: currentItem.last_update });
    }

    // Fallback
    if (state.chains.length === 0) {
        state.chains.push({ name: 'No Market Data', price: 0, url: null, date: null });
    }

    els.retailList.innerHTML = '';
    state.chains.forEach(c => {
        const nameHtml = c.url
            ? `<a href="${c.url}" target="_blank" style="color: white; text-decoration: none; border-bottom: 1px dotted var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; display: inline-block; vertical-align: middle;">
                 ${c.name} <span style="font-size: 0.7em; margin-left: 4px;">↗</span>
               </a>`
            : `<span>${c.name}</span>`;

        // Format Date (e.g. 1/20/2026)
        let dateHtml = '';
        if (c.date) {
            try {
                const dateObj = new Date(c.date);
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
                dateHtml = `<span style="font-size: 0.7rem; color: #64748b; margin-left: 8px;">⏱ ${dateStr}</span>`;
            } catch (e) { /* ignore date error */ }
        }

        // REFRESH BUTTON LOGIC (Extract ASIN for targeted refresh)
        let refreshBtn = '';
        if (c.url && c.url.includes('amazon')) {
            // Add a small refresh icon button
            refreshBtn = `<span class="refresh-asin-btn" title="Refresh Latest Price" style="cursor:pointer; margin-left:8px; font-size:1rem; color:var(--accent);">↻</span>`;
        }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'retail-item';
        itemDiv.style.justifyContent = 'space-between';

        itemDiv.innerHTML = `
                <div style="display:flex; align-items:center;">
                    ${nameHtml}
                    ${dateHtml}
                    ${refreshBtn}
                </div>
                <span class="retail-price">${fmt(c.price)}</span>`;

        // Attach event listener for refresh
        if (refreshBtn) {
            const btn = itemDiv.querySelector('.refresh-asin-btn');
            btn.onclick = (e) => {
                e.stopPropagation();
                // Extract ASIN
                const asinMatch = c.url.match(/\/dp\/([A-Z0-9]{10})/);
                if (asinMatch && asinMatch[1]) {
                    if (confirm(`Update price for ASIN: ${asinMatch[1]}?`)) {
                        // Calls handleSearch with override
                        handleSearch(asinMatch[1], 'scrape');
                    }
                } else {
                    alert("Could not extract ASIN from URL to refresh.");
                }
            };
        }

        els.retailList.appendChild(itemDiv);
    });

    // Calculate Average from Active Retail Prices only (exclude Base Value from "Retail" Avg)
    if (activePrices.length > 0) {
        state.retailAvg = activePrices.reduce((a, b) => a + b, 0) / activePrices.length;
    } else {
        state.retailAvg = pBase || 0;
    }

    els.retailAvg.innerText = fmt(state.retailAvg);

    // Auto-fill wholesale estimate logic
    els.wholesaleEstInp.value = pBase > 0 ? pBase : Math.round(state.retailAvg * 0.88);
    els.flippingScore.innerText = pBase > 0 ? '92%' : '82%';

    // Removed updateGradeChart call
    updateCalculations();
}

// Grade Chart Function Removed

function updateHistoryChart(historyJson) {
    let history = [];
    try {
        history = typeof historyJson === 'string' ? JSON.parse(historyJson) : historyJson;
    } catch (e) { console.error("History parse fail", e); }

    if (!Array.isArray(history) || history.length < 1) {
        els.historyChartContainer.style.display = 'none';
        return;
    }

    els.historyChartContainer.style.display = 'block';

    // Parse Dates and Prices
    const labels = history.map(h => {
        const d = new Date(h.d);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const dataPoints = history.map(h => h.p);

    if (historyChartInstance) historyChartInstance.destroy();

    historyChartInstance = new Chart(els.historyChartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Price',
                data: dataPoints,
                borderColor: '#00ffaa',
                backgroundColor: 'rgba(0, 255, 170, 0.1)',
                borderWidth: 2,
                tension: 0.3,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#000',
                pointBorderColor: '#00ffaa'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: { label: (c) => '$' + c.parsed.y.toFixed(0) }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#666' }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#00ffaa', callback: (v) => '$' + v }
                }
            }
        }
    });
}

function getCapacity(item) {
    if (item.capacity) return item.capacity;
    // Extract from model string if possible
    const m = (item.model || '').toUpperCase();
    if (m.includes('1TB')) return '1TB';
    if (m.includes('512GB')) return '512GB';
    if (m.includes('256GB')) return '256GB';
    if (m.includes('128GB')) return '128GB';
    if (m.includes('64GB')) return '64GB';
    return '256GB'; // Default fallback if unknown, assuming baseline
}

function renderAllHistoryChart(allData) {
    if (!allData || !Array.isArray(allData)) return;

    // Filter items that have history AND price.
    const validItems = allData.filter(i => {
        const h = typeof i.price_history === 'string' ? JSON.parse(i.price_history) : i.price_history;
        return i.model && Array.isArray(h) && h.length > 0;
    });

    if (validItems.length === 0) {
        els.allHistoryChartContainer.style.display = 'none';
        return;
    }

    els.allHistoryChartContainer.style.display = 'block';

    // Helper to get latest price
    const getLatestPrice = (item) => {
        const h = typeof item.price_history === 'string' ? JSON.parse(item.price_history) : item.price_history;
        return h[h.length - 1].p;
    };

    // Helper to get capacity value for value score
    const getCapacityValue = (item) => {
        const cap = getCapacity(item);
        const capacityMap = { '64GB': 64, '128GB': 128, '256GB': 256, '512GB': 512, '1TB': 1024 };
        return capacityMap[cap] || 256;
    };

    // Calculate VALUE SCORE (Price per 100GB - lower is better)
    const itemsWithScore = validItems.map(item => {
        const price = getLatestPrice(item);
        const capacityGB = getCapacityValue(item);
        const valueScore = price / (capacityGB / 100);
        return { item, price, valueScore };
    });

    // Calculate score range for percentile coloring
    const scores = itemsWithScore.map(i => i.valueScore);
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const range = maxScore - minScore;

    // Smart color function based on VALUE SCORE
    const getColorForValue = (valueScore) => {
        if (range === 0) return { bg: 'rgba(59, 130, 246, 0.7)', border: '#3b82f6', isBestValue: false };
        const percentile = (valueScore - minScore) / range;

        if (percentile <= 0.30) {
            return { bg: 'rgba(16, 185, 129, 0.85)', border: '#10b981', isBestValue: true };
        } else if (percentile <= 0.70) {
            return { bg: 'rgba(59, 130, 246, 0.7)', border: '#3b82f6', isBestValue: false };
        } else {
            return { bg: 'rgba(245, 158, 11, 0.7)', border: '#f59e0b', isBestValue: false };
        }
    };

    // Sort by PRICE for display (descending)
    itemsWithScore.sort((a, b) => b.price - a.price);

    const labels = itemsWithScore.map(i => i.item.model.replace('IPHONE', 'iPhone').replace('MACBOOK', 'MacBook'));
    const data = itemsWithScore.map(i => i.price);
    const valueScores = itemsWithScore.map(i => i.valueScore);
    const colorData = itemsWithScore.map(i => getColorForValue(i.valueScore));

    const backgroundColors = colorData.map(c => c.bg);
    const borderColors = colorData.map(c => c.border);

    if (allHistoryChartInstance) allHistoryChartInstance.destroy();

    // DYNAMIC HEIGHT LOGIC: Prevent "Squashing"
    const rowHeight = 30; // px per bar
    const chartHeight = Math.max(300, validItems.length * rowHeight);

    const container = els.allHistoryChartCanvas.parentElement;
    container.style.height = `${chartHeight}px`;
    container.style.overflowY = 'hidden'; // Let the panel handle scroll usually, but here we force height

    // IMPORTANT: Make the parent DASHBOARD panel scrollable if it isn't already
    els.allHistoryChartContainer.style.maxHeight = '500px';
    els.allHistoryChartContainer.style.overflowY = 'auto'; // SCROLL BAR APPEARS HERE

    allHistoryChartInstance = new Chart(els.allHistoryChartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Latest Renewed Price',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
                borderRadius: 4,
                barPercentage: 0.6,
                categoryPercentage: 0.9
            }]
        },
        plugins: [{
            afterDatasetsDraw: (chart) => {
                const { ctx } = chart;
                ctx.save();
                ctx.font = 'bold 11px sans-serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                chart.data.datasets.forEach((dataset, i) => {
                    const meta = chart.getDatasetMeta(i);
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];
                        const isBestValue = colorData[index].isBestValue;

                        if (isBestValue) {
                            ctx.fillStyle = '#10b981';
                            ctx.fillText('💎 $' + value, bar.x + 8, bar.y);
                        } else {
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                            ctx.fillText('$' + value, bar.x + 8, bar.y);
                        }
                    });
                });
                ctx.restore();
            }
        }],
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { right: 50, left: 10 } },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const price = context.parsed.x;
                            const score = valueScores[context.dataIndex];
                            const percentile = range > 0 ? ((score - minScore) / range * 100).toFixed(0) : 50;
                            const valueRating = percentile <= 30 ? '💎 BEST VALUE' : percentile <= 70 ? '👍 GOOD' : '⚠️ EXPENSIVE';
                            return [
                                `Price: $${price}`,
                                `Value Score: ${score.toFixed(1)}`,
                                `Rating: ${valueRating}`
                            ];
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { callback: (v) => '$' + v, color: '#666' },
                    position: 'top'
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#e2e8f0', font: { size: 11, weight: 'bold' } }
                }
            }
        }
    });
}

function renderAllTrendsChart(allData) {
    if (!allData || !Array.isArray(allData)) return;

    // Filter items that have history
    let validItems = allData.filter(i => {
        const h = typeof i.price_history === 'string' ? JSON.parse(i.price_history) : i.price_history;
        return i.model && Array.isArray(h) && h.length > 0;
    });

    if (validItems.length === 0) {
        els.allTrendsChartContainer.style.display = 'none';
        return;
    }

    els.allTrendsChartContainer.style.display = 'block';

    // SMART FILTER: Only show "Movers" (Items with price changes or high relevance)
    // Reduce noise from the 50 items that didn't change price.

    // Calculate Diff for everyone
    const movers = validItems.map(item => {
        let h = typeof item.price_history === 'string' ? JSON.parse(item.price_history) : item.price_history;
        const pToday = h[h.length - 1].p;
        const pYesterday = h.length > 1 ? h[h.length - 2].p : pToday;
        const diff = Math.abs(pToday - pYesterday);
        return { item, diff, pToday, pYesterday };
    });

    // Sort by Volatility (Biggest absolute change first)
    movers.sort((a, b) => b.diff - a.diff);

    // Take top 20 movers. If no movers, take top 20 most expensive (as fallback interest)
    let topMovers = movers.filter(m => m.diff > 0).slice(0, 20);

    if (topMovers.length < 5) {
        // Fallback: Just show top 15 items by price if market is stagnant
        topMovers = movers.sort((a, b) => b.pToday - a.pToday).slice(0, 15);
    }

    // Re-map to simple items for chart
    const chartItems = topMovers.map(m => m.item);

    const labels = chartItems.map(i => i.model.replace('IPHONE', 'iPhone'));
    const dataToday = [];
    const dataYesterday = [];

    chartItems.forEach(item => {
        let h = typeof item.price_history === 'string' ? JSON.parse(item.price_history) : item.price_history;
        const pToday = h[h.length - 1].p;
        const pYesterday = h.length > 1 ? h[h.length - 2].p : pToday;
        dataToday.push(pToday);
        dataYesterday.push(pYesterday);
    });

    if (allTrendsChartInstance) allTrendsChartInstance.destroy();

    // Reset height for this one (it's fixed size usually, or slightly taller)
    const container = els.allTrendsChartCanvas.parentElement;
    container.style.height = '300px';
    els.allTrendsChartContainer.style.maxHeight = 'none';
    els.allTrendsChartContainer.style.overflowY = 'visible';

    allTrendsChartInstance = new Chart(els.allTrendsChartCanvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Yesterday',
                    data: dataYesterday,
                    backgroundColor: 'rgba(148, 163, 184, 0.3)',
                    borderColor: 'rgba(148, 163, 184, 0.5)',
                    borderWidth: 1,
                    categoryPercentage: 0.6,
                    barPercentage: 0.8
                },
                {
                    label: 'Today',
                    data: dataToday,
                    backgroundColor: (ctx) => {
                        const idx = ctx.dataIndex;
                        const t = dataToday[idx];
                        const y = dataYesterday[idx];
                        return t >= y ? '#10b981' : '#ef4444';
                    },
                    borderColor: 'transparent',
                    categoryPercentage: 0.6,
                    barPercentage: 0.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: { display: true, labels: { color: '#9ca3af', font: { size: 10 } } },
                title: { display: true, text: 'Top Market Movers (Active Volatility)', color: '#9ca3af', font: { size: 11 } }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af', autoSkip: false, maxRotation: 90, minRotation: 45, font: { size: 9 } }
                },
                y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#666', callback: (v) => '$' + v }
                }
            }
        }
    });

    // Run Volatility Analysis (Keep full list for text insights)
    analyzeVolatility(validItems);
}

function analyzeVolatility(items) {
    if (!els.volatilityContainer) return;
    els.volatilityContainer.style.display = 'block';
    els.volatilityList.innerHTML = '';

    // Calculate changes
    const changes = items.map(item => {
        let h = typeof item.price_history === 'string' ? JSON.parse(item.price_history) : item.price_history;
        if (!Array.isArray(h) || h.length < 2) return null;

        const pToday = h[h.length - 1].p;
        const pYesterday = h[h.length - 2].p;
        const diff = pToday - pYesterday;
        const percent = ((diff / pYesterday) * 100).toFixed(1);

        return { model: item.model, diff, percent, pToday };
    }).filter(i => i !== null);

    // Separate Gainers and Losers
    const gainers = changes.filter(c => c.diff > 0).sort((a, b) => b.diff - a.diff);
    const losers = changes.filter(c => c.diff < 0).sort((a, b) => a.diff - b.diff); // Most negative first

    // Pick top examples from both sides to ensure balanced intel
    // We want up to 2 Gainers (Demand) and up to 2 Losers (Overstock)
    const topGainers = gainers.slice(0, 2);
    const topLosers = losers.slice(0, 2);

    // Combine them, prioritizing Losers if the user is asking about "Overstock"
    const featuredDocs = [...topLosers, ...topGainers];

    if (featuredDocs.length === 0) {
        els.volatilityList.innerHTML = '<div style="font-size:0.8rem; color:#666;">No significant volatility detected today. Market is stable.</div>';
        return;
    }

    featuredDocs.forEach(m => {
        let icon = '➖';
        let color = '#9ca3af';
        let insight = 'Stable movement.';
        let alertType = 'NEUTRAL';

        if (m.diff < -20) {
            icon = '📉';
            color = '#ef4444'; // Red for drop
            insight = '⚠️ DETECTED OVERSTOCK / LIQUIDATION PRESSURE. Competitors dumping.';
            alertType = 'OVERSTOCK RISK';
        } else if (m.diff < 0) {
            icon = '↘️';
            color = '#f87171';
            insight = 'Minor correction. Watch for potential stagnation.';
            alertType = 'SOFTENING';
        } else if (m.diff > 20) {
            icon = '🚀';
            color = '#10b981';
            insight = 'High demand or shortage. Seller power is HIGH.';
            alertType = 'HIGH DEMAND';
        } else if (m.diff > 0) {
            icon = '↗️';
            color = '#34d399';
            insight = 'Upward trend. Healthy demand.';
            alertType = 'GROWTH';
        }

        const div = document.createElement('div');
        div.style.cssText = `background: rgba(255,255,255,0.03); padding: 8px; border-radius: 4px; display: flex; align-items: center; gap: 8px; border-left: 2px solid ${color};`;
        div.innerHTML = `
            <div style="font-size: 1.2rem;">${icon}</div>
            <div style="flex: 1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-size: 0.85rem; font-weight: 700; color: #e2e8f0;">${m.model}</div>
                    <div style="font-size: 0.7rem; font-weight: 800; color: ${color}; border: 1px solid ${color}; padding: 1px 4px; border-radius: 4px;">${alertType}</div>
                </div>
                <div style="font-size: 0.85rem; font-weight: 600; color: ${color}; margin-top:2px;">
                    ${m.diff > 0 ? '+' : ''}${fmt(m.diff)} (${m.diff > 0 ? '+' : ''}${m.percent}%)
                </div>
                <div style="font-size: 0.75rem; color: #94a3b8; margin-top: 2px; font-style: italic;">
                    "${insight}"
                </div>
            </div>
        `;
        els.volatilityList.appendChild(div);
    });
}

// --- NEW CAPACITY HANDLING LOGIC ---

// Helper to strip capacity from model name to find the "Family"
// e.g. "IPHONE 16 PRO MAX 1TB" -> "IPHONE 16 PRO MAX"
function extractFamilyName(uniqueModelName) {
    if (!uniqueModelName) return "";
    return uniqueModelName
        .toUpperCase()
        .replace(/\b1TB\b/g, '')
        .replace(/\b512GB\b/g, '')
        .replace(/\b256GB\b/g, '')
        .replace(/\b128GB\b/g, '')
        .replace(/\b64GB\b/g, '')
        .trim();
}

function populateCapacityOptions(allData) {
    els.capacityOptions.innerHTML = '';

    if (!state.n8nData || !state.n8nData.model) return;

    const currentUniqueName = state.n8nData.model;
    const currentFamily = extractFamilyName(currentUniqueName);

    // Find all records that belong to this PRODUCT FAMILY
    const siblings = allData.filter(i => {
        const family = extractFamilyName(i.model);
        return family === currentFamily;
    });

    // Extract capacities from these siblings
    const caps = new Set();
    siblings.forEach(s => caps.add(getCapacity(s)));

    // Fallback if set is empty
    if (caps.size === 0) {
        ['64GB', '128GB', '256GB', '512GB', '1TB'].forEach(c => caps.add(c));
    }

    // Sort capacities logic
    const order = ['64GB', '128GB', '256GB', '512GB', '1TB'];
    const sortedCaps = Array.from(caps).sort((a, b) => order.indexOf(a) - order.indexOf(b));

    sortedCaps.forEach(cap => {
        const div = document.createElement('div');
        div.className = 'capacity-chip';
        div.innerText = cap;
        if (cap === state.selectedCapacity) div.classList.add('active');

        div.onclick = () => {
            document.querySelectorAll('#capacityOptions .capacity-chip').forEach(c => c.classList.remove('active'));
            div.classList.add('active');

            // Apply capacity switch: Find the sibling with this capacity
            const targetVariant = siblings.find(s => getCapacity(s) === cap);
            if (targetVariant) {
                // Switch the dashboard to this variant
                // We need a way to 'select' this new n8nData without full reload
                state.n8nData = targetVariant;
                state.selectedCapacity = cap;
                applyCapacity(cap);
            } else {
                console.warn("Variant not found in data for:", cap);
            }
        };
        els.capacityOptions.appendChild(div);
    });
}

function renderComparativeModels(allData, currentModel) {
    // Re-implemented to avoid ReferenceError
    // This function can be expanded later if side comparisons are needed.
    // For now, it keeps the UI logic flow valid.
    return;
}

async function handleSearch(overrideQuery = null, overrideMode = null) {
    const query = (typeof overrideQuery === 'string') ? overrideQuery : null;
    const rawVal = query || (els.searchInp ? els.searchInp.value : '') || '';

    console.log("🔍 handleSearch called with:", { rawVal, overrideMode });

    if (!rawVal && !overrideMode) {
        console.warn("⚠️ No search query provided");
        return;
    }

    const selectedMode = overrideMode || document.querySelector('#sourceOptions .active')?.dataset.mode || 'scrape';
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.disabled = true;
        searchBtn.innerText = "ACCESSING_GRID...";
    }

    try {
        // Fetch ALL data

        // Get Selected Category for Context
        const catSelect = document.getElementById('categorySelect');
        const selectedCat = catSelect ? catSelect.value : 'smartphones';

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product: "",
                mode: selectedMode,
                category: selectedCat  // PASS CATEGORY TO BACKEND
            })
        });

        let data = await response.json();

        // Robust Unwrapping
        if (Array.isArray(data) && data[0]?.json) data = data.map(item => item.json);
        else if (data.data) data = data.data;
        else if (data.items) data = data.items;
        else if (data.status === "Batch Update Completed") {
            alert(`✅ Update Successful! Processed ${data.count} items.`);
            const searchBtn = document.getElementById('searchBtn');
            if (searchBtn) {
                searchBtn.disabled = false;
                searchBtn.innerText = "Analyze";
            }
            return;
        }

        if (!data || data.length === 0) {
            alert("No data received from intelligence grid.");
            return;
        }

        console.log(`📦 Raw data received: ${data.length} items`);
        console.log(`🎯 Selected category: ${selectedCat}`);

        state.baseData = data;

        // Apply Filters & Render UI immediately
        console.log(`🔄 Calling updateFromData with ${data.length} items for category: ${selectedCat}`);
        updateFromData(state.baseData);

        /* THE OLD DIRECT RENDER LOGIC IS REPLACED BY updateFromData() above */
        return; // Stop here, let updateFromData handle everything

        // 1. Precise Family Match
        let bestMatch = data.find(i => {
            const family = extractFamilyName(i.model);
            return family === searchInput;
        });

        // 2. Contains Family Match
        if (!bestMatch) {
            bestMatch = data.find(i => {
                const family = extractFamilyName(i.model);
                return family.includes(searchInput);
            });
        }

        // 3. Fallback: Contains Model String
        if (!bestMatch) {
            bestMatch = data.find(i => i.model && i.model.includes(searchInput));
        }

        // 4. Fallback: First item if nothing matched
        if (!bestMatch) {
            console.warn("No match found, showing first item.");
            bestMatch = data[0];
        }

        if (bestMatch) {
            state.n8nData = bestMatch;
            state.productName = extractFamilyName(bestMatch.model);
            state.selectedCapacity = getCapacity(bestMatch);

            // Render UI
            populateCapacityOptions(data);
            applyCapacity(state.selectedCapacity);

            els.capacityContainer.style.display = 'block';
            els.conditionContainer.style.display = 'block';
            els.riskTrafficLight.style.display = 'block';

            // Charts: Show ALL data for context
            renderAllHistoryChart(data);
            renderAllTrendsChart(data);
        }

    } catch (e) {
        console.error(e);
        if (e.message.includes('fetch')) {
            alert(`⚠️ TIMEOUT ALERT: The scan is taking longer than the browser allows.\nCheck 'Internal History' in a few minutes.`);
        } else {
            alert(`System Error: ${e.message}`);
        }
    } finally {
        const searchBtn = document.getElementById('searchBtn');
        if (searchBtn) {
            searchBtn.disabled = false;
            searchBtn.innerText = "Analyze";
        }
    }
}


// --- INITIALIZATION & EVENT LISTENERS ---
function initDashboard() {
    console.log("🚀 Dashboard Initializing...");

    // 1. Core Calculator Listeners
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.onclick = () => {
            console.log("🔍 Analyze button clicked!");
            handleSearch();
        };
    } else {
        console.error("❌ Search button not found!");
    }

    if (els.wholesaleEstInp) els.wholesaleEstInp.oninput = updateCalculations;
    if (els.sellerDisc) els.sellerDisc.oninput = updateCalculations;
    if (els.buyerDisc) els.buyerDisc.oninput = updateCalculations;
    if (els.qtyInp) els.qtyInp.oninput = updateCalculations;
    if (els.repairCostInp) els.repairCostInp.oninput = updateCalculations;
    if (els.logistics) els.logistics.oninput = updateCalculations;

    // 2. Condition Selection Logic
    const conditionChips = document.querySelectorAll('#conditionOptions .capacity-chip');
    conditionChips.forEach(chip => {
        chip.onclick = () => {
            conditionChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            state.selectedCondition = chip.dataset.condition;
            if (state.selectedCapacity) applyCapacity(state.selectedCapacity);
        };
    });

    // 3. Source Selection Logic (Live vs History)
    const sourceChips = document.querySelectorAll('#sourceOptions .capacity-chip');
    sourceChips.forEach(opt => {
        opt.onclick = () => {
            sourceChips.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            const mode = opt.dataset.mode;
            const currentCat = document.getElementById('categorySelect')?.value || 'smartphones';
            console.log(`Switching Mode to: ${mode} for ${currentCat}`);

            handleSearch(null, mode);
        };
    });

    // 4. Global Scan Button
    const globalBtn = document.getElementById('globalScanBtn');
    if (globalBtn) {
        globalBtn.onclick = () => {
            const catSelect = document.getElementById('categorySelect');
            const selectedCat = catSelect ? catSelect.value : 'smartphones';

            if (!confirm(`🚀 GLOBAL LAUNCH for ${selectedCat.toUpperCase()}. Continue?`)) return;

            globalBtn.innerText = `🌍 SCANNING...`;
            globalBtn.disabled = true;

            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: "global_scan", category: selectedCat })
            })
                .then(r => r.json())
                .then(() => {
                    alert(`🌍 Global Index Updated for ${selectedCat.toUpperCase()}!`);
                    globalBtn.innerText = "🌍 GLOBAL INDEX";
                    globalBtn.disabled = false;
                })
                .catch(() => {
                    alert(`⚠️ SCAN RUNNING in background.`);
                    globalBtn.innerText = "🌍 GLOBAL INDEX";
                    globalBtn.disabled = false;
                });
        };
    }

    // 5. Deep Verify Button
    const deepBtn = document.getElementById('deepVerifyBtn');
    if (deepBtn) {
        deepBtn.onclick = () => {
            if (!confirm('Start Deep Audit?')) return;
            deepBtn.innerText = "⏳ Auditing...";
            deepBtn.disabled = true;
            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: "deep_verify" })
            }).catch(() => alert("Audit started in background."));
            setTimeout(() => { deepBtn.innerText = "🛡️ DEEP VERIFY LINKS"; deepBtn.disabled = false; }, 2000);
        };
    }

    // 6. Update Button Logic
    const updateAllBtn = document.getElementById('updateAllBtn');
    if (updateAllBtn) {
        updateAllBtn.onclick = async () => {
            if (!state.baseData) return alert("Please search first.");

            const originalText = updateAllBtn.innerText;
            updateAllBtn.innerText = "⏳ UPDATING...";
            updateAllBtn.disabled = true;

            const catSelect = document.getElementById('categorySelect');
            const selectedCat = catSelect ? catSelect.value : 'smartphones';

            try {
                await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product: "",
                        mode: "update_batch",
                        category: selectedCat
                    })
                });
                alert("Background Update Started!");
            } catch (e) {
                alert("Update trigger failed: " + e.message);
            } finally {
                updateAllBtn.innerText = originalText;
                updateAllBtn.disabled = false;
            }
        };
    }

    console.log("✅ Dashboard Init Complete.");
}

// Ensure init runs when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}


/** DASHBOARD_CORE_READY **/


// 2. DEEP VERIFY (Link Strategy)


/** DASHBOARD_STABLE_V1 **/


// 3. GLOBAL MARKET INDEX (Full Scan with Category Support)
const globalBtn = document.getElementById('globalScanBtn');
if (globalBtn) {
    globalBtn.onclick = () => {
        // Read Selected Category
        const catSelect = document.getElementById('categorySelect');
        const selectedCat = catSelect ? catSelect.value : 'smartphones';

        const catLabels = {
            'smartphones': 'Smartphones (iPhone, Samsung, Pixel)',
            'laptops': 'Laptops (MacBook, ASUS, HP)',
            'consoles': 'Game Consoles',
            'cameras': 'Cameras & Drones',
            'tablets': 'Tablets'
        };
        const label = catLabels[selectedCat] || selectedCat;

        if (!confirm(`🚀 GLOBAL LAUNCH: This will scan ALL major ${label} across Amazon to build a complete market index.\n\nTarget Category: ${selectedCat.toUpperCase()}\n\nThis process is intensive. Continue?`)) return;

        globalBtn.innerText = `🌍 SCANNING ${selectedCat.toUpperCase()}...`;
        globalBtn.disabled = true;

        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mode: "global_scan",
                category: selectedCat
            })
        })
            .then(r => r.json())
            .then(data => {
                alert(`🌍 Global Index Updated for ${selectedCat.toUpperCase()}! Processed market blocks.`);
                globalBtn.innerText = "🌍 GLOBAL INDEX";
                globalBtn.disabled = false;
            })
            .catch(e => {
                console.error("Global Scan Error:", e);
                // Always assume timeout for Global Scan as it is heavy
                alert(`⚠️ SCAN RUNNING: The ${label} Market Index is being built in the background.\n\nIt will take some time. You can continue using the dashboard. Check the 'Internal History' later.`);

                globalBtn.innerText = "🌍 GLOBAL INDEX";
                globalBtn.disabled = false;
            });
    };
}

// --- SOURCE SELECTION LOGIC (Fixed) ---
const sourceOptions = document.querySelectorAll('#sourceOptions .capacity-chip');
if (sourceOptions) {
    sourceOptions.forEach(opt => {
        opt.onclick = () => {
            // Toggle Active UI
            sourceOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Trigger Search immediately with new mode
            const mode = opt.dataset.mode; // 'scrape' or 'history'
            console.log("Switching Source Mode:", mode);
            handleSearch(null, mode); // Pass mode to handleSearch
        };
    });
}

// Update/Deep Verify Button Logic
const updateAllBtn = document.getElementById('updateAllBtn');
if (updateAllBtn) {
    updateAllBtn.onclick = async () => {
        if (!state.baseData) return alert("Please search first to get a batch ID.");
        els.searchBtn.disabled = true;
        els.searchBtn.innerText = "UPDATING_BATCH...";

        // Determine category
        const catSelect = document.getElementById('categorySelect');
        const selectedCat = catSelect ? catSelect.value : 'smartphones';

        try {
            await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: "",
                    mode: "update_batch", // Tells n8n to re-scrape existing items
                    category: selectedCat
                })
            });
            alert("Background Update Started! Check back in 2-3 minutes.");
        } catch (e) {
            alert("Update trigger failed");
        }
        els.searchBtn.disabled = false;
        els.searchBtn.innerText = "Analyze";
    };
}
