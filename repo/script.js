// --- Constants and State ---
const STORAGE_KEY = 'mseval_data_v2';
let evaluations = [];

// --- DOM Elements ---
const form = document.getElementById('evalForm');
const historyList = document.getElementById('historyList');
const statsArea = document.getElementById('statsArea');
const exportBtn = document.getElementById('exportBtn');
const importFile = document.getElementById('importFile');
const clearBtn = document.getElementById('clearBtn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderHistory();
    setupSliders();
    
    // Set today's date automatically
    document.getElementById('date').valueAsDate = new Date();
});

// --- Event Listeners ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newEval = {
        id: Date.now(),
        studentName: document.getElementById('studentName').value,
        date: document.getElementById('date').value,
        rotation: document.getElementById('rotation').value,
        scores: {
            hx: parseInt(document.getElementById('hxScore').value),
            pe: parseInt(document.getElementById('peScore').value),
            ddx: parseInt(document.getElementById('ddxScore').value),
            tx: parseInt(document.getElementById('txScore').value),
            prof: parseInt(document.getElementById('profScore').value)
        },
        comments: document.getElementById('comments').value
    };

    evaluations.unshift(newEval); // Add to top of list
    saveData();
    renderHistory();
    form.reset();
    document.getElementById('date').valueAsDate = new Date(); // Reset date to today
    setupSliders(); // Reset slider visuals
});

// Export Data
exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(evaluations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `MSEVAL_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// Import Data
importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                if (confirm(`Import ${importedData.length} evaluations? This will ADD to your existing data.`)) {
                    evaluations = [...importedData, ...evaluations];
                    saveData();
                    renderHistory();
                    alert('Import successful!');
                }
            } else {
                alert('Invalid file format.');
            }
        } catch (err) {
            alert('Error reading file.');
        }
    };
    reader.readAsText(file);
});

// Clear Data
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete ALL evaluations? This cannot be undone.')) {
        evaluations = [];
        saveData();
        renderHistory();
    }
});

// Delegation for Delete Buttons in History
historyList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const id = parseInt(e.target.parentElement.getAttribute('data-id'));
        evaluations = evaluations.filter(ev => ev.id !== id);
        saveData();
        renderHistory();
    }
});

// --- Helper Functions ---

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
}

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        evaluations = JSON.parse(data);
    }
}

function renderHistory() {
    historyList.innerHTML = '';
    statsArea.innerHTML = '';

    if (evaluations.length === 0) {
        historyList.innerHTML = '<p style="text-align:center; color:#6b7280;">No evaluations recorded yet.</p>';
        return;
    }

    // Calculate Stats
    const total = evaluations.length;
    let sum = 0;
    evaluations.forEach(ev => {
        const avg = (ev.scores.hx + ev.scores.pe + ev.scores.ddx + ev.scores.tx + ev.scores.prof) / 5;
        sum += avg;
    });
    const overallAvg = (sum / total).toFixed(2);
    
    statsArea.innerHTML = `
        <span><strong>${total}</strong> Evaluations</span> | 
        <span>Avg Score: <strong>${overallAvg} / 5</strong></span>
    `;

    // Render List
    evaluations.forEach(ev => {
        const avgScore = ((ev.scores.hx + ev.scores.pe + ev.scores.ddx + ev.scores.tx + ev.scores.prof) / 5).toFixed(1);
        
        const div = document.createElement('div');
        div.className = 'eval-item';
        div.setAttribute('data-id', ev.id);
        
        div.innerHTML = `
            <button class="delete-btn">Delete</button>
            <h3>${ev.studentName}</h3>
            <div class="meta">${ev.date} - ${ev.rotation}</div>
            <div class="scores-display">Avg: ${avgScore} | Hx:${ev.scores.hx} PE:${ev.scores.pe} DDx:${ev.scores.ddx} Tx:${ev.scores.tx} Prof:${ev.scores.prof}</div>
            <div class="comments-display"><em>${ev.comments || 'No comments added.'}</em></div>
        `;
        historyList.appendChild(div);
    });
}

// Slider Logic
function setupSliders() {
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const output = document.getElementById(slider.id.replace('Score', 'Output'));
        slider.addEventListener('input', () => {
            output.value = slider.value;
        });
    });
}
