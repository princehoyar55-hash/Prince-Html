import { auth, db, checkAuthGuard, logoutUser } from "./firebase.js";
import { ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

checkAuthGuard(false);

let activeUser = null;
let currentApiConfig = null;
let currentCompiledCode = "";

// Track Active Session State Elements
onAuthStateChanged(auth, (user) => {
    if (user) {
        activeUser = user;
        document.getElementById('user-badge').innerText = user.email;
        loadHistoricalSnapshots(user.uid);
    }
});

// Sync Active System API Configuration Settings
onValue(ref(db, "api_settings"), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        currentApiConfig = data;
    }
});

// Configure UI Interactivity Actions
document.getElementById('logout-btn').addEventListener('click', logoutUser);

// Audio Dictation Engine Interactivity Architecture
const micBtn = document.getElementById('mic-btn');
const promptInput = document.getElementById('prompt-input');

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => micBtn.classList.add('listening');
    recognition.onend = () => micBtn.classList.remove('listening');
    recognition.onresult = (event) => {
        promptInput.value += event.results[0][0].transcript;
    };

    micBtn.addEventListener('click', () => {
        recognition.start();
    });
} else {
    micBtn.style.display = 'none'; // Hide if browser lacks compatibility
}

// Global UI Interactivity Controls Configuration
document.getElementById('generate-btn').addEventListener('click', handleCodeGenerationWorkflow);
document.getElementById('copy-btn').addEventListener('click', copyCodeToClipboardDevice);
document.getElementById('zip-btn').addEventListener('click', compileAndDownloadZipPackage);

/**
 * Executes requests against dynamic runtime backends
 */
async function handleCodeGenerationWorkflow() {
    const prompt = promptInput.value.trim();
    if (!prompt) return alert("System Warning: Target code deployment string cannot be blank.");
    if (!currentApiConfig || !currentApiConfig.active_provider) {
        return alert("Configuration Alert: Missing active orchestration router. Visit Admin to update keys.");
    }

    const loader = document.getElementById('loader');
    const outputDisplay = document.getElementById('code-output');
    loader.style.display = 'flex';

    const provider = currentApiConfig.active_provider;
    const key = currentApiConfig[`key_${provider}`];
    
    // Safety Fallback Injection Routine
    if (!key && provider === 'openai' && currentApiConfig.key_groq) {
        console.warn("Primary path routing disrupted. Swapping parameters to Groq Failover Pipeline...");
        executeAiPipeline('groq', currentApiConfig.key_groq, prompt, loader, outputDisplay);
    } else {
        executeAiPipeline(provider, key, prompt, loader, outputDisplay);
    }
}

async function executeAiPipeline(provider, apiKey, prompt, loader, outputDisplay) {
    let endpoint = "";
    let body = {};
    const formattedPrompt = `${prompt}. System directive: Output valid deployment code. Ensure you provide fully modular HTML structure components, inside CSS blocks and dynamic script elements within a structured markdown container block notation sequence.`;

    if (provider === 'openai') {
        endpoint = "https://api.openai.com/v1/chat/completions";
        body = {
            model: "gpt-4o",
            messages: [{ role: "user", content: formattedPrompt }]
        };
    } else if (provider === 'groq') {
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        body = {
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: formattedPrompt }]
        };
    } else {
        // Custom endpoint definitions default map
        endpoint = currentApiConfig.custom_endpoint || "";
        body = { model: "default", messages: [{ role: "user", content: formattedPrompt }] };
    }

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        const result = await response.json();
        const outputText = result.choices[0].message.content;
        
        currentCompiledCode = outputText;
        outputDisplay.textContent = currentCompiledCode;

        // Archive Output Record to Cloud Pipeline Engine Instance
        if(activeUser) {
            push(ref(db, `users_history/${activeUser.uid}`), {
                prompt: prompt,
                code: currentCompiledCode,
                timestamp: Date.now()
            });
        }
    } catch (err) {
        console.error("Pipeline breakdown error context: ", err);
        outputDisplay.textContent = `CRITICAL COMPILATION SYSTEM ERROR: Execution failed on runtime stack router.\nParameters: ${err.message}`;
    } finally {
        loader.style.display = 'none';
    }
}

function copyCodeToClipboardDevice() {
    if(!currentCompiledCode) return;
    navigator.clipboard.writeText(currentCompiledCode);
    alert("Asset bundle system payload mapped out cleanly to operational clip clipboard memory buffer.");
}

/**
 * Builds standard layout systems into downloadable ZIP bundles dynamically
 */
function compileAndDownloadZipPackage() {
    if(!currentCompiledCode) return alert("Operation Fault: Request payload array has resolved empty.");
    
    const zip = new JSZip();
    
    // Extract asset segments cleanly, parsing structure trees seamlessly
    const htmlCleanStr = currentCompiledCode.replace(/```html|```css|```javascript|```/g, "");

    zip.file("index.html", htmlCleanStr);
    zip.file("readme.md", `# Compiled Release Bundle\nCreated securely via Prince AI Toolkit processing clusters on: ${new Date().toISOString()}`);
    
    zip.generateAsync({ type: "blob" }).then((zipBinaryBlob) => {
        const linkElement = document.createElement("a");
        linkElement.href = URL.createObjectURL(zipBinaryBlob);
        linkElement.download = `prince_release_manifest_${Date.now()}.zip`;
        linkElement.click();
    });
}

function loadHistoricalSnapshots(uid) {
    onValue(ref(db, `users_history/${uid}`), (snapshot) => {
        const container = document.getElementById('history-container');
        container.innerHTML = "";
        const items = snapshot.val();

        if(!items) {
            container.innerHTML = `<p style="color: var(--text-muted); font-size:14px; text-align:center;">No history artifacts compiled.</p>`;
            return;
        }

        Object.keys(items).forEach(key => {
            const entry = items[key];
            const card = document.createElement('div');
            card.className = "history-card";
            card.innerHTML = `
                <div style="overflow: hidden; max-width: 70%;">
                    <h4 style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${entry.prompt}</h4>
                    <small style="color: var(--text-muted);">${new Date(entry.timestamp).toLocaleDateString()}</small>
                </div>
                <div style="display:flex; gap: 8px;">
                    <button class="btn-secondary" style="padding:4px 8px; font-size:12px;" onclick="document.getElementById('code-output').textContent = \`${btoa(entry.code)}\`; window.reloadFromHistory('${btoa(entry.code)}')">Load</button>
                    <button class="btn-danger" style="padding:4px 8px; font-size:12px;" id="del-${key}">Del</button>
                </div>
            `;
            container.appendChild(card);

            document.getElementById(`del-${key}`).addEventListener('click', () => {
                remove(ref(db, `users_history/${uid}/${key}`));
            });
        });
    });
}

window.reloadFromHistory = (base64Code) => {
    currentCompiledCode = atob(base64Code);
    document.getElementById('code-output').textContent = currentCompiledCode;
};
