// Lead Assignment System for MasterStock Intelligence
// This file handles the dynamic assignment of leads to team members

const ASSIGNMENT_STATE = {
    teamMembers: [],
    assignmentMode: 'auto', // 'auto' or 'manual'
    lastAssignmentIndex: 0,
    currentActiveAssignee: 'ALL'
};

// Initialize assignment system
function initAssignmentSystem() {
    // Load saved team members from localStorage
    const savedMembers = localStorage.getItem('ms_team_members');
    if (savedMembers) {
        ASSIGNMENT_STATE.teamMembers = JSON.parse(savedMembers);
        updateAssigneeDropdown();
        updateTeamButtons(); // New: Update the button bar
    }

    // Load saved assignments
    reapplyAssignments();
}

// Re-map saved assignments back to allLeads
function reapplyAssignments() {
    const savedAssignments = localStorage.getItem('ms_lead_assignments');
    if (savedAssignments) {
        const assignments = JSON.parse(savedAssignments);
        allLeads.forEach(lead => {
            const id = lead.Rank || lead.id;
            if (assignments[id]) {
                lead.asignee = assignments[id];
                lead.assignee = assignments[id]; // Keep both for safety
            }
        });
    }
}

// Update the filter dropdown in the UI
function updateAssigneeDropdown() {
    const dropdown = document.getElementById('fltAssignee');
    if (!dropdown) return;

    dropdown.innerHTML = '<option value="ALL">All Team Members</option>';
    ASSIGNMENT_STATE.teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member;
        option.textContent = member;
        dropdown.appendChild(option);
    });
}

// NEW: Update the prominent team member buttons
function updateTeamButtons() {
    const container = document.getElementById('dynamicTeamButtons');
    if (!container) return;

    const stats = getAssignmentStats();
    container.innerHTML = '';

    ASSIGNMENT_STATE.teamMembers.forEach(member => {
        const memberStats = stats[member] || { total: 0 };
        const isActive = ASSIGNMENT_STATE.currentActiveAssignee === member;

        const btn = document.createElement('button');
        btn.className = `team-btn ${isActive ? 'active' : ''}`;
        btn.onclick = () => setAssigneeFilter(member);
        btn.innerHTML = `<span>👤 ${member}</span> <span class="count-badge">${memberStats.total}</span>`;
        container.appendChild(btn);
    });

    // Update the "All" button status
    const btnAll = document.getElementById('btnTeamAll');
    if (btnAll) {
        btnAll.classList.toggle('active', ASSIGNMENT_STATE.currentActiveAssignee === 'ALL');
    }
}

// NEW: Set the assignee filter and update entire dashboard
function setAssigneeFilter(name) {
    ASSIGNMENT_STATE.currentActiveAssignee = name;

    // Update the dropdown filter to sync both UIs
    const dropdown = document.getElementById('fltAssignee');
    if (dropdown) {
        dropdown.value = name;
    }

    // Update button visual state
    updateTeamButtons();

    // Trigger the platform-wide filter
    if (typeof filterByAdvanced === 'function') {
        filterByAdvanced();
    }
}

// Open assignment modal
function openAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (!modal) return;

    modal.style.display = 'flex';
    renderTeamMembersList();
}

// Close assignment modal
function closeAssignmentModal() {
    const modal = document.getElementById('assignmentModal');
    if (modal) modal.style.display = 'none';
}

// Set number of team members
function setTeamMemberCount() {
    const countInput = document.getElementById('teamCountInput');
    const count = parseInt(countInput.value);
    if (!count || count < 1 || count > 20) {
        alert('Please enter a valid number between 1 and 20');
        return;
    }

    document.getElementById('teamCountSection').style.display = 'none';
    document.getElementById('teamNamesSection').style.display = 'block';

    const container = document.getElementById('teamNamesContainer');
    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Team Member ${i + 1} Name`;
        input.className = 'team-name-input';
        input.id = `teamName${i}`;
        container.appendChild(input);
    }
}

// Save team members
function saveTeamMembers() {
    const inputs = document.querySelectorAll('.team-name-input');
    const names = [];

    inputs.forEach(input => {
        const name = input.value.trim();
        if (name) names.push(name);
    });

    if (names.length === 0) {
        alert('Please enter at least one team member name');
        return;
    }

    ASSIGNMENT_STATE.teamMembers = names;
    localStorage.setItem('ms_team_members', JSON.stringify(names));

    updateAssigneeDropdown();
    updateTeamButtons(); // New

    document.getElementById('teamNamesSection').style.display = 'none';
    document.getElementById('teamCountSection').style.display = 'block';
    document.getElementById('teamCountInput').value = '';

    redistributeLeads();

    alert(`✅ Team members saved! Leads redistributed among ${names.length} people.`);
    closeAssignmentModal();
}

function redistributeLeads() {
    if (ASSIGNMENT_STATE.teamMembers.length === 0) {
        alert('Please set up team members first');
        return;
    }

    const members = ASSIGNMENT_STATE.teamMembers;
    const numMembers = members.length;

    const buyersOnly = [];
    const sellersOnly = [];
    const both = [];
    const neither = [];

    allLeads.forEach(l => {
        const isB = isLeadBuyer(l);
        const isS = isLeadSeller(l);
        if (isB && isS) both.push(l);
        else if (isB) buyersOnly.push(l);
        else if (isS) sellersOnly.push(l);
        else neither.push(l);
    });

    allLeads.forEach(l => l.assignee = null);

    let gIdx = 0;
    const assignArray = (arr) => {
        arr.forEach(lead => {
            lead.assignee = members[gIdx % numMembers];
            lead.asignee = lead.assignee; // Sync both fields
            gIdx++;
        });
    };

    assignArray(both);
    assignArray(buyersOnly);
    assignArray(sellersOnly);
    assignArray(neither);

    const assignments = {};
    allLeads.forEach(lead => {
        const id = lead.Rank || lead.id;
        if (lead.asignee || lead.assignee) assignments[id] = lead.asignee || lead.assignee;
    });
    localStorage.setItem('ms_lead_assignments', JSON.stringify(assignments));

    updateTeamButtons(); // New: Reflect new counts

    if (typeof filterByAdvanced === 'function') {
        filterByAdvanced();
    } else if (typeof renderDashboard === 'function') {
        renderDashboard(allLeads);
    }

    console.log(`✅ Redistributed ${allLeads.length} leads.`);

    // AUTO-SYNC to Cloud after redistribution
    // syncAssignmentsToCloud(); // Disabled to prevent double-execution (User clicks Update Tags manually)
}

// NEW: Sync Assignments to Cloud (Excel)
async function syncAssignmentsToCloud() {
    if (!allLeads || allLeads.length === 0) return;

    const btn = document.getElementById('btnSyncAssignments');
    const originalText = btn ? btn.innerHTML : "Sync to Cloud";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "⏳ Syncing to Excel...";
    }

    const assignmentsToSync = allLeads
        .filter(l => l.asignee || l.assignee)
        .map(l => ({
            Company: l.Company || l.company || l.title || "Unknown",
            role: l.role || "UNKNOWN",
            // Fix: Prioritize 'assignee' (System) over 'asignee' (Import)
            asignee: l.assignee || l.asignee || "",
            businessCategory: l.businessCategory || "",
            SecondaryTag: l.SecondaryTag || ""
        }));

    console.log("SYNC DEBUG: Payload prepared", assignmentsToSync); // Debug log

    if (assignmentsToSync.length === 0) {
        if (btn) {
            btn.innerHTML = "No assignments to sync";
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
        }
        return;
    }

    // Send ALL data in one batch (User Request)
    const CHUNK_SIZE = 5000; // Increased to cover all leads
    let successCount = 0;

    try {
        const chunk = assignmentsToSync; // Send everything
        if (btn) btn.innerHTML = `📤 Syncing ${chunk.length} items...`;

        // Nuclear Option: no-cors to bypass file:// restrictions
        // MAP Company -> company (lowercase) to match Excel column exactly
        const normalizedChunk = chunk.map(item => ({
            ...item,
            company: item.Company,
            Company: item.Company
        }));

        const bodyStr = JSON.stringify({ items: normalizedChunk, action: 'UPDATE_TAGS' });
        console.log("SYNC DEBUG: Sending Payload Size:", bodyStr.length);

        // Add action to URL for foolproof routing
        const targetUrl = (window.WORKFLOW_CONFIG && window.WORKFLOW_CONFIG.UPDATE)
            ? window.WORKFLOW_CONFIG.UPDATE
            : (WEBHOOK_URL + "?action=UPDATE_TAGS");

        if (!confirm(`🚀 Ready to Send ${chunk.length} leads to Cloud?`)) return;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = targetUrl;
        form.target = '_blank';
        form.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'body';
        input.value = bodyStr;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();

        setTimeout(() => document.body.removeChild(form), 1000);

        alert(`🚀 Sent ${chunk.length} leads! Check the new tab.`);

        if (btn) {
            btn.innerHTML = `✅ Request Sent! (${successCount})`;
            btn.style.background = "#059669";
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.background = "";
            }, 5000);
        }
    } catch (e) {
        console.error("Cloud Sync Error:", e);
        alert("SYNC FAILURE:\n" + e.toString());
        if (btn) {
            btn.innerHTML = "❌ Sync Failed";
            btn.style.background = "#dc2626";
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                btn.style.background = "";
            }, 5000);
        }
    }
}

// Manual assignment
function assignLeadManually(leadId, assignee) {
    const lead = allLeads.find(l => l.Rank === leadId || l.id === leadId);
    if (lead) {
        lead.assignee = assignee;
        const savedAssignments = localStorage.getItem('ms_lead_assignments');
        let assignments = savedAssignments ? JSON.parse(savedAssignments) : {};
        assignments[leadId] = assignee;
        localStorage.setItem('ms_lead_assignments', JSON.stringify(assignments));

        updateTeamButtons(); // Reflect changes
        if (typeof filterByAdvanced === 'function') filterByAdvanced();

        // AUTO-SYNC single lead to cloud (using the bulk function for now as it's safe)
        syncAssignmentsToCloud();
    }
}

// Stats for badges
function getAssignmentStats() {
    const stats = {};
    ASSIGNMENT_STATE.teamMembers.forEach(member => {
        stats[member] = { total: 0, buyers: 0, sellers: 0 };
    });

    allLeads.forEach(lead => {
        if (lead.assignee && stats[lead.assignee]) {
            stats[lead.assignee].total++;
            if (isLeadBuyer(lead)) stats[lead.assignee].buyers++;
            if (isLeadSeller(lead)) stats[lead.assignee].sellers++;
        }
    });

    return stats;
}

function renderTeamMembersList() {
    const container = document.getElementById('currentTeamList');
    if (!container) return;

    if (ASSIGNMENT_STATE.teamMembers.length === 0) {
        container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 20px;">No team members configured yet.</p>';
        return;
    }

    const stats = getAssignmentStats();
    let html = '<div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">';

    ASSIGNMENT_STATE.teamMembers.forEach((member, index) => {
        const memberStats = stats[member] || { total: 0, buyers: 0, sellers: 0 };
        html += `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 700; color: white; font-size: 1rem;">${member}</div>
                    <div style="font-size: 0.8rem; color: #9ca3af; margin-top: 4px;">
                        ${memberStats.total} leads (${memberStats.buyers} buyers, ${memberStats.sellers} sellers)
                    </div>
                </div>
                <button onclick="removeTeamMember(${index})" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                    Remove
                </button>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function removeTeamMember(index) {
    if (confirm(`Remove ${ASSIGNMENT_STATE.teamMembers[index]} from the team?`)) {
        ASSIGNMENT_STATE.teamMembers.splice(index, 1);
        localStorage.setItem('ms_team_members', JSON.stringify(ASSIGNMENT_STATE.teamMembers));
        updateAssigneeDropdown();
        updateTeamButtons();

        if (ASSIGNMENT_STATE.teamMembers.length > 0) {
            redistributeLeads();
        } else {
            allLeads.forEach(l => l.assignee = null);
            localStorage.removeItem('ms_lead_assignments');
            if (typeof filterByAdvanced === 'function') filterByAdvanced();
        }

        renderTeamMembersList();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initAssignmentSystem();

    // Auto-wire Recategorize Button if found
    setTimeout(() => {
        const allBtns = document.querySelectorAll('button');
        const recatBtn = Array.from(allBtns).find(b => b.textContent && b.textContent.toLowerCase().includes('recategorize'));
        if (recatBtn) {
            console.log("✅ Recategorize Button Found & Wired");
            recatBtn.onclick = recategorizeOthers;
        } else {
            console.log("⚠️ Recategorize Button NOT found via text search");
        }
    }, 1000);
});

// NEW: Recategorize Others Logic
async function recategorizeOthers() {
    if (!allLeads || allLeads.length === 0) return;

    // Find Button for UI Feedback
    const allBtns = document.querySelectorAll('button');
    const btn = Array.from(allBtns).find(b => b.textContent && b.textContent.toLowerCase().includes('recategorize'));
    const originalText = btn ? btn.innerHTML : "Recategorize Others";

    const others = allLeads.filter(l =>
        !l.businessCategory ||
        l.businessCategory === 'Other' ||
        l.businessCategory === 'Unknown' ||
        l.businessCategory.toLowerCase() === 'unknown'
    );

    if (others.length === 0) {
        alert("No 'Other/Unknown' leads found to recategorize.");
        return;
    }

    if (!confirm(`Found ${others.length} leads to recategorize. Send to AI?`)) return;

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "🧠 AI Processing...";
    }

    // Payload
    const items = others.map(l => ({
        company: l.Company || l.company || "Unknown",
        justification: l.Justification || l.justification || "",
        topProducts: l.topProducts || ""
    }));

    try {
        const targetUrl = (window.WORKFLOW_CONFIG && window.WORKFLOW_CONFIG.RECATEGORIZE)
            ? window.WORKFLOW_CONFIG.RECATEGORIZE
            : null;

        if (!targetUrl) throw new Error("Recategorize Workflow URL not configured in workflow_config.js");

        // Chunking for Recategorize (Safe Size)
        const CHUNK_SIZE = 5;
        let successCount = 0;

        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);
            if (btn) btn.innerHTML = `🧠 Processing ${i}/${items.length}...`;

            const bodyStr = JSON.stringify({ items: chunk, action: 'RECATEGORIZE' });

            await fetch(targetUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: bodyStr
            });

            successCount += chunk.length;
            await new Promise(r => setTimeout(r, 1000));
        }

        if (btn) {
            btn.innerHTML = `✅ Sent ${successCount} Leads!`;
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }

    } catch (e) {
        console.error("Recategorize Error:", e);
        alert("Failed: " + e.message);
        if (btn) {
            btn.innerHTML = "❌ Failed";
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }
    }
}

// NEW: Sync Leads to Instantly.ai
async function syncLeadsToInstantly(leadsInput) {
    // If called without args (e.g. from button without params), try to find filteredLeads in global scope
    // Best practice: Pass it from HTML onclick="syncLeadsToInstantly(filteredLeads)"

    // Check if we received data, if not, try global allLeads or filteredLeads if reachable (but it's let)
    // We rely on the button passing 'filteredLeads'
    const sourceLeads = Array.isArray(leadsInput) ? leadsInput : (typeof allLeads !== 'undefined' ? allLeads : []);

    if (sourceLeads.length === 0) {
        alert("No leads available to send.");
        return;
    }

    // 1. Filter Valid Leads (Must have Email)
    const validLeads = sourceLeads.filter(l => {
        const email = l.Email || l.email || "";
        return email && email.includes("@") && email.length > 5;
    });

    if (validLeads.length === 0) {
        alert("No leads with valid Emails found in the selection.");
        return;
    }

    // 2. Prepare Payload
    const payloadItems = validLeads.map(l => ({
        email: l.Email || l.email,
        firstName: (l.Assignee || l.assignee || "").split(" ")[0] || "Friend", // Fallback name
        companyName: l.Company || l.company,
        phone: l.Phone || l.phone,
        website: l.Website || l.website,
        customVariables: {
            role: l.role || "UNKNOWN",
            businessCategory: l.businessCategory || "Other",
            city: l.city || l.City,
            state: l.State || l.state,
            score: l.OverstockScore || 0
        }
    }));

    // 3. User Confirmation
    if (!confirm(`🚀 Ready to push ${payloadItems.length} leads to Instantly.ai?\n(Filtered from ${sourceLeads.length} total)`)) return;

    // 4. Send to Webhook
    const btn = document.querySelector('button[onclick*="syncLeadsToInstantly"]');
    const originalText = btn ? btn.innerHTML : "🚀 Send to Instantly";

    if (btn) {
        btn.disabled = true;
        btn.innerHTML = "📧 Sending...";
    }

    try {
        const webhookUrl = (typeof MASTERSTOCK_CONFIG !== 'undefined' && MASTERSTOCK_CONFIG.INSTANTLY_WEBHOOK)
            ? MASTERSTOCK_CONFIG.INSTANTLY_WEBHOOK
            : "https://masterstockcolombiamail3.app.n8n.cloud/webhook/leadsusa"; // Fallback

        // Send one big batch
        const bodyStr = JSON.stringify({ leads: payloadItems, action: "ADD_TO_CAMPAIGN" });

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = webhookUrl;
        form.target = '_blank';
        form.style.display = 'none';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'body';
        input.value = bodyStr;
        form.appendChild(input);

        document.body.appendChild(form);
        form.submit();
        setTimeout(() => document.body.removeChild(form), 2000);

        if (btn) {
            btn.innerHTML = "✅ Sent!";
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }

    } catch (e) {
        console.error("Instantly Sync Error:", e);
        alert("Error: " + e.message);
        if (btn) {
            btn.innerHTML = "❌ Error";
            setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 3000);
        }
    }
}
