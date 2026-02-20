/**
 * MASTERSTOCK PLATFORM USA - CENTRAL CONFIGURATION
 */

const MASTERSTOCK_CONFIG = {
    // 📊 DASHBOARD: Webhook para leer leads y actualizar tags
    DASHBOARD_WEBHOOK: "https://masterstockusa-mail.app.n8n.cloud/webhook/leadsusa",

    // 🏹 HUNTER TRIGGER: El que lanza la búsqueda (POST)
    HUNTER_TRIGGER_WEBHOOK: "https://masterstockusa.app.n8n.cloud/webhook/hunter-trigger",

    // 📡 MISSION STATUS: El que verifica si terminó (GET)
    MISSION_STATUS_WEBHOOK: "https://masterstockusa.app.n8n.cloud/webhook/mission-status",

    // 🚀 INSTANTLY OUTREACH: Webhook para enviar leads a campaña (POST)
    INSTANTLY_WEBHOOK: "https://masterstockusa-mail.app.n8n.cloud/webhook/leadsusa",

    // 📄 GOOGLE SHEET: Enlace directo
    GOOGLE_SHEET_URL: "https://docs.google.com/spreadsheets/d/1iSSIAzzbyzdxQRsWhf3fR0tZWpd-MIeHiU7awTn9aBI/edit#gid=216201294"
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MASTERSTOCK_CONFIG;
}
