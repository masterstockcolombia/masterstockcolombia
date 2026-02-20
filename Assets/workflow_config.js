/**
 * MasterStock Workflow Configuration
 * Defines the specific N8N webhook URLs for each action.
 * User must replace these with their actual Production URLs.
 */
window.WORKFLOW_CONFIG = {
    // 1. READ ONLY (Sync Live) -> Handled by legacy WEBHOOK_URL in code (as requested)
    // READ: "...", 

    // 2. UPDATE TAGS (Assign Leads) -> 02_Update_Tags.json
    // ✨ THIS IS THE KEY WORKFLOW YOU REQUESTED ✨
    UPDATE: "https://masterstockcolombiamail3.app.n8n.cloud/webhook/leadsusa",

    // 3. RECATEGORIZE (Recategorize Others) -> 03_Recategorize.json
    RECATEGORIZE: "https://masterstockcolombia2.app.n8n.cloud/webhook/cc33-recategorize"
};

console.log("✅ Workflow Config Loaded:", window.WORKFLOW_CONFIG);
