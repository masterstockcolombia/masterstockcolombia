document.addEventListener('DOMContentLoaded', () => {
    const modeOptions = document.querySelectorAll('.mode-option');
    const generateBtn = document.getElementById('generateBtn');
    const loader = document.getElementById('loader');
    const btnText = document.getElementById('btnText');
    const outputContent = document.getElementById('outputContent');
    const statusText = document.getElementById('statusText');
    const statusBadge = document.getElementById('statusBadge');
    const statusDot = statusBadge.querySelector('.dot');
    const chips = document.querySelectorAll('.chip');
    const webhookUrlInput = document.getElementById('webhookUrl');
    const copyBtn = document.getElementById('copyBtn');
    const contentIdeaInput = document.getElementById('contentIdea');

    let selectedMode = 'youtube';
    let injectedRadarHook = null;

    // Chip Selection (Multi-select)
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('active');
        });
    });

    // Mode Selection
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            modeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedMode = option.getAttribute('data-mode');
        });
    });

    function updateStatus(text, color) {
        statusText.textContent = text;
        statusDot.style.background = color;
        statusBadge.style.borderColor = color + '44';
    }

    // Generate Action
    generateBtn.addEventListener('click', async () => {
        const webhookUrl = webhookUrlInput.value.trim();
        const contentIdea = contentIdeaInput.value.trim();
        const activeChips = document.querySelectorAll('.chip.active');
        const queries = Array.from(activeChips).map(c => c.getAttribute('data-query'));

        if (!webhookUrl) {
            alert('Please enter your n8n Webhook URL first.');
            return;
        }

        // Must have at least one input source
        if (queries.length === 0 && !injectedRadarHook && !contentIdea) {
            alert('Please select an Intel Chip, input a Content Idea, or load a hook from the Radar.');
            return;
        }

        // UI Feedback
        generateBtn.disabled = true;
        loader.style.display = 'block';
        btnText.textContent = 'RESEARCHING TOPICS...';
        updateStatus('Conducting Research...', '#f59e0b');
        outputContent.innerHTML = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted);">
            <i class="fa-solid fa-brain fa-spin" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-primary);"></i>
            <p>Architecting strategic content based on viral patterns...</p>
        </div>`;

        try {
            // Include radar hook if available
            const requestBody = {
                content_type: selectedMode,
                queries: queries,
                content_idea: contentIdea
            };

            if (injectedRadarHook) {
                requestBody.radar_hook = injectedRadarHook;
            }

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            let rawResult = "";
            if (Array.isArray(data) && data.length > 0) {
                rawResult = data[0].output || data[0].text || JSON.stringify(data[0]);
            } else {
                rawResult = data.output || data.text || JSON.stringify(data);
            }

            let formattedText = rawResult
                .replace(/\\n/g, '\n')
                .replace(/\*\*\*(.*?)\*\*\*/g, '<em style="color: var(--accent-secondary);">$1</em>')
                .replace(/\*\*(.*?)\*\*/g, '<strong style="color: white; font-weight: 700;">$1</strong>')
                .replace(/### (.*?)\n/g, '<h4 style="color: var(--accent-primary); margin: 25px 0 10px 0; font-family: Outfit; font-size: 1.2rem;">$1</h4>')
                .replace(/## (.*?)\n/g, '<h3 style="color: white; margin: 30px 0 15px 0; font-family: Outfit; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; font-size: 1.5rem;">$1</h3>')
                .replace(/^\- (.*?)$/gm, '<li style="margin-left: 20px; margin-bottom: 12px; color: #d1d5db; list-style-type: square; padding-left: 10px;">$1</li>')
                .replace(/\n\n/g, '<div style="margin-bottom: 24px;"></div>')
                .replace(/\n/g, '<br>');

            outputContent.innerHTML = `
                <div class="generated-text">
                    <header style="margin-bottom: 30px; border-left: 4px solid var(--accent-primary); padding-left: 20px;">
                        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--accent-primary); font-weight: 800;">MASTERSTOCK STRATEGY ENGINE</span>
                        <h2 style="margin-top: 5px; margin-bottom: 0;">${selectedMode.replace('_', ' ').toUpperCase()}</h2>
                    </header>
                    <div style="color: #e5e7eb; line-height: 1.8;">${formattedText}</div>
                </div>
            `;

            updateStatus('Masterpiece Ready', '#10b981');

            // Clear hook after generation if it was used
            injectedRadarHook = null;
        } catch (error) {
            console.error('Error:', error);
            outputContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #ef4444; margin-bottom: 20px;"></i>
                    <h2 style="color: #ef4444">Intelligence Interrupted</h2>
                    <p style="color: var(--text-muted)">${error.message}</p>
                </div>
            `;
            updateStatus('System Error', '#ef4444');
        } finally {
            generateBtn.disabled = false;
            loader.style.display = 'none';
            btnText.textContent = 'GENERATE MASTERPIECE';
        }
    });

    // Copy to Clipboard
    copyBtn.addEventListener('click', () => {
        const text = outputContent.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981"></i> Copied to Clipboard';
            copyBtn.style.borderColor = '#10b981';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.borderColor = 'var(--border-color)';
            }, 2000);
        });
    });

    // Cross-module bridge
    window.addEventListener('message', (event) => {
        if (event.data.type === 'LOAD_HOOK') {
            injectedRadarHook = event.data.hook;
            outputContent.innerHTML = `
                <div style="text-align:center; padding: 40px; border: 1px dashed var(--accent-primary); border-radius: 16px; background: rgba(59, 130, 246, 0.05); animation: pulse 2s infinite;">
                    <i class="fa-solid fa-satellite-dish" style="font-size: 2.5rem; color: var(--accent-primary); margin-bottom: 15px;"></i>
                    <h3 style="color: var(--accent-primary); font-family: Outfit;">Radar Hook Synchronized</h3>
                    <p style="margin-top:15px; color: white; font-style: italic; font-size: 1.1rem; line-height: 1.6;">"${injectedRadarHook}"</p>
                    <div style="margin-top:25px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="height: 1px; flex: 1; background: var(--border-color);"></span>
                        <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Ready for Architecture</span>
                        <span style="height: 1px; flex: 1; background: var(--border-color);"></span>
                    </div>
                </div>
            `;
            updateStatus('Intelligence Injected', '#3b82f6');
        }
    });
});
