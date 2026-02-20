// -----------------------------------------------------------------------
// N8N CODE NODE SNIPPET - DATA NORMALIZER
// Copy this logic into a "Code" node in your n8n workflow
// placed *after* your scraping step and *before* the Response or Webhook node.
// -----------------------------------------------------------------------

/* 
   OBJECTIVE: 
   Take an array of items (e.g. from Amazon/eBay) that might have messy titles like 
   "iPhone 12 Pro Max 256GB Unlocked Blue"
   and split them into clean structured fields:
   - model: "iPhone 12 Pro Max"
   - capacity: "256GB"
   - color: "Blue" (optional)
*/

return items.map(item => {
    const rawName = item.json.model || item.json.title || "";

    // 1. EXTRACT CAPACITY
    let capacity = "256GB"; // Default fallback
    if (rawName.match(/1\s?TB/i)) capacity = "1TB";
    else if (rawName.match(/512\s?GB/i)) capacity = "512GB";
    else if (rawName.match(/256\s?GB/i)) capacity = "256GB";
    else if (rawName.match(/128\s?GB/i)) capacity = "128GB";
    else if (rawName.match(/64\s?GB/i)) capacity = "64GB";

    // 2. CLEAN MODEL NAME
    // Remove capacity, "Unlocked", "Renewed", "Premium" from the name to clean it up
    let cleanModel = rawName
        .replace(/(\d{2,3})\s?GB/gi, "") // Remove 256GB
        .replace(/1\s?TB/gi, "")      // Remove 1TB
        .replace(/Unlocked/gi, "")
        .replace(/Renewed/gi, "")
        .replace(/Premium/gi, "")
        .replace(/Apple/gi, "")       // Remove brand if you want just model
        .replace(/\s\s+/g, " ")       // Remove double spaces
        .trim();

    // 3. COLOR EXTRACTION (Simple)
    const colors = ["Graphite", "Silver", "Gold", "Pacific Blue", "Sierra Blue", "Alpine Green", "Deep Purple", "Space Black", "Natural Titanium", "Blue Titanium"];
    let detectedColor = "Generic";
    colors.forEach(c => {
        if (rawName.toLowerCase().includes(c.toLowerCase())) detectedColor = c;
    });

    // 4. PRICE SANITIZATION
    // Ensure all price fields are Numbers, not Strings "$1,200.00"
    const cleanPrice = (val) => {
        if (!val) return 0;
        if (typeof val === 'number') return val;
        return parseFloat(val.toString().replace(/[^0-9.]/g, '')) || 0;
    };

    return {
        json: {
            ...item.json,                  // Keep original data
            model_clean: cleanModel,       // New clean name
            capacity_clean: capacity,     // New clean capacity
            color_clean: detectedColor,

            // Overwrite messy prices with clean numbers if validation needed
            cheapest_new: cleanPrice(item.json.cheapest_new),
            cheapest_renewed: cleanPrice(item.json.cheapest_renewed),
            base_market_value: cleanPrice(item.json.base_market_value)
        }
    }
});
