// Additional JavaScript functions for MasterStock Intelligence Dashboard
// Add these functions to the main script section

// ==================== SCRAPPER SOURCE FUNCTIONS ====================

function showScrapperSources() {
    const modal = document.getElementById('scrapperModal');
    if (!modal) {
        console.error('Scrapper modal not found');
        return;
    }

    // Calculate scrapper stats
    const stats = {};
    const scrapperColors = {
        'google maps scrapper': { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', color: '#10b981' },
        'linkedin scrapper': { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', color: '#3b82f6' },
        'facebook scrapper': { bg: 'rgba(139, 92, 246, 0.1)', border: '#8b5cf6', color: '#8b5cf6' },
        'default': { bg: 'rgba(156, 163, 175, 0.1)', border: '#9ca3af', color: '#9ca3af' }
    };

    allLeads.forEach(lead => {
        const scrapper = lead.scrapper || 'google maps scrapper';
        if (!stats[scrapper]) {
            stats[scrapper] = { count: 0, buyers: 0, sellers: 0 };
        }
        stats[scrapper].count++;
        if (isLeadBuyer(lead)) stats[scrapper].buyers++;
        if (isLeadSeller(lead)) stats[scrapper].sellers++;
    });

    let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    Object.entries(stats).forEach(([scrapper, data]) => {
        const percentage = ((data.count / allLeads.length) * 100).toFixed(1);
        const colors = scrapperColors[scrapper.toLowerCase()] || scrapperColors['default'];

        html += `
            <div style="background: ${colors.bg}; padding: 15px; border-radius: 8px; border: 1px solid ${colors.border};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <div style="font-weight: 600; color: ${colors.color}; font-size: 1rem; text-transform: capitalize;">
                            ${scrapper}
                        </div>
                        <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 4px;">
                            ${data.count} leads (${percentage}% of total)
                        </div>
                    </div>
                    <div style="font-size: 1.8rem; color: ${colors.color}; font-weight: 700;">
                        ${data.count}
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="flex: 1;">
                        <div style="font-size: 0.7rem; color: #9ca3af;">Buyers</div>
                        <div style="font-size: 0.9rem; font-weight: 600; color: #10b981;">${data.buyers}</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 0.7rem; color: #9ca3af;">Sellers</div>
                        <div style="font-size: 0.9rem; font-weight: 600; color: #8b5cf6;">${data.sellers}</div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    document.getElementById('scrapperStats').innerHTML = html;
    modal.style.display = 'flex';
}

function closeScrapperModal() {
    const modal = document.getElementById('scrapperModal');
    if (modal) modal.style.display = 'none';
}

// ==================== HELPER FUNCTIONS ====================

function cancelTeamSetup() {
    document.getElementById('teamNamesSection').style.display = 'none';
    document.getElementById('teamCountSection').style.display = 'block';
    document.getElementById('teamCountInput').value = '';
}

// ==================== UPDATE RENDER TABLE FUNCTION ====================
// This function needs to be updated in the main script to include scrapper and assignee columns

// Add this to the renderTable function where table rows are created:
/*
Example row rendering with new columns:

row.innerHTML = `
    <td class="select-cell"><input type="checkbox" data-id="${l.Rank || l.id}" onchange="handleRowSelect(this)"></td>
    <td style="font-weight:600; color:white;">${l.Company || l.company || 'Unknown'}</td>
    <td>${l.State || l.state || '-'}</td>
    <td><span class="badge-cat">${l.businessCategory || 'N/A'}</span></td>
    <td>${l.topProducts || '-'}</td>
    <td>${l.overstockFit === 'TRUE' ? '✓' : '-'}</td>
    <td>${l.VelocityScore || '-'}</td>
    <td><span style="font-size:0.75rem; color:#10b981; background:rgba(16,185,129,0.1); padding:2px 6px; border-radius:4px;">${l.scrapper || 'google maps scrapper'}</span></td>
    <td><span style="font-size:0.75rem; color:#f59e0b; background:rgba(245,158,11,0.1); padding:2px 6px; border-radius:4px; font-weight:600;">${l.assignee || 'Unassigned'}</span></td>
    <td style="font-size:0.75rem; color:#9ca3af;">${(l.Justification || l.justification || '').substring(0, 50)}...</td>
    <td style="font-weight:700; color:${getScoreColor(l.OverstockScore)};">${l.OverstockScore || 0}</td>
`;
*/

// ==================== EXPORT TO CSV UPDATE ====================
// Update the exportToCSV function to include new columns

function exportToCSVUpdated() {
    const headers = [
        'Company', 'State', 'Category', 'Products', 'Overstock Fit',
        'Velocity', 'Scrapper', 'Assignee', 'Justification', 'Score',
        'Email', 'Phone', 'Website', 'Buying Capacity', 'Lead Type'
    ];

    let csv = headers.join(',') + '\n';

    filteredLeads.forEach(lead => {
        const row = [
            lead.Company || lead.company || '',
            lead.State || lead.state || '',
            lead.businessCategory || '',
            lead.topProducts || '',
            lead.overstockFit || '',
            lead.VelocityScore || '',
            lead.scrapper || 'google maps scrapper',
            lead.assignee || 'Unassigned',
            (lead.Justification || lead.justification || '').replace(/,/g, ';'),
            lead.OverstockScore || 0,
            lead.Email || lead.email || '',
            lead.Phone || lead.phone || '',
            lead.Website || lead.website || '',
            lead.BuyingCapacity || '',
            lead.LeadType || ''
        ];

        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `masterstock_leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// ==================== SYNC TO GOOGLE SHEETS ====================
// Function to sync assignee data back to Google Sheets

async function syncAssigneesToSheet() {
    if (!WEBHOOK_URL) {
        console.error('Webhook URL not configured');
        return;
    }

    try {
        const leadsWithAssignees = allLeads.map(lead => ({
            id: lead.Rank || lead.id,
            company: lead.Company || lead.company,
            assignee: lead.assignee || '',
            scrapper: lead.scrapper || 'google maps scrapper'
        }));

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'update_assignees',
                leads: leadsWithAssignees
            })
        });

        if (response.ok) {
            console.log('✅ Assignees synced to Google Sheets');
            return true;
        } else {
            console.error('Failed to sync assignees');
            return false;
        }
    } catch (error) {
        console.error('Error syncing assignees:', error);
        return false;
    }
}

console.log('✅ Additional dashboard functions loaded');
