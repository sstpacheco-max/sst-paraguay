/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 4.3 - Full Integration Edition
 */

console.log("SST: Iniciando Sistema v4.3...");

window.onerror = function(msg, url, lineNo) {
    console.error("SST ERROR:", msg, "en", url, "línea:", lineNo);
    return false;
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("SST: DOM Listo.");

    // --- DATOS DE CONFIGURACIÓN ---
    const checklistData = {
        'Instalaciones': [
            { item: 'Orden y Limpieza', desc: 'Pasillos y áreas libres de obstáculos.' },
            { item: 'Iluminación', desc: 'Niveles adecuados para la tarea.' },
            { item: 'Extintores', desc: 'Carga vigente y acceso despejado.' }
        ],
        'Maquinaria': [
            { item: 'Resguardos', desc: 'Partes móviles con protección.' },
            { item: 'Parada de Emergencia', desc: 'Funciona y es visible.' }
        ],
        'EPP': [
            { item: 'Uso de Casco', desc: 'Personal en área de riesgo.' },
            { item: 'Calzado de Seguridad', desc: 'Suela antideslizante.' }
        ],
        'Eléctrico': [
            { item: 'Tableros', desc: 'Cerrados y señalizados.' },
            { item: 'Cables', desc: 'Sin cables expuestos.' }
        ]
    };

    // --- ESTADO GLOBAL ---
    let currentUser = null;
    try {
        currentUser = JSON.parse(sessionStorage.getItem('sst_current_user'));
    } catch(e) { console.error("SST: Error sesión", e); }

    // --- ELEMENTOS ---
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const ipercModal = document.getElementById('iperc-modal');
    const insModal = document.getElementById('inspeccion-modal');
    const mtessModal = document.getElementById('mtess-modal');
    const calendarModal = document.getElementById('calendar-modal');
    const historialModal = document.getElementById('historial-inspeccion-modal');

    // --- FUNCIONES CORE ---

    function getStoredUsers() {
        const stored = JSON.parse(localStorage.getItem('sst_users')) || [];
        if (!stored.find(u => u.id === 'admin')) {
            stored.push({ id: 'admin', pass: 'admin123', role: 'admin', company: 'Admin Global' });
        }
        return stored;
    }

    function getFilteredData(key) {
        const raw = JSON.parse(localStorage.getItem(key)) || [];
        if (!currentUser || currentUser.role === 'admin') return raw;
        return raw.filter(item => item.companyId === currentUser.id);
    }

    function saveDataWithCompany(key, data) {
        const raw = JSON.parse(localStorage.getItem(key)) || [];
        if (currentUser) data.companyId = currentUser.id;
        raw.push(data);
        localStorage.setItem(key, JSON.stringify(raw));
        updateDashboardStats();
    }

    function updateDashboardStats() {
        if (!currentUser) return;
        const inspections = getFilteredData('sst_inspecciones');
        const accidents = getFilteredData('sst_registros_mtess');

        const insCount = document.getElementById('stat-ins-count');
        if (insCount) insCount.innerText = inspections.length;

        const location = document.getElementById('stat-location');
        if (location) location.innerText = currentUser.address || 'Asunción';

        const tf = document.getElementById('stat-tf');
        const ts = document.getElementById('stat-ts');
        if (tf) tf.innerText = (accidents.length * 0.5).toFixed(1);
        if (ts) ts.innerText = (accidents.length * 0.15).toFixed(1);

        const activityList = document.getElementById('recent-activity-list');
        if (activityList && activityList.id === 'recent-activity-list') {
             const allActivity = [
                ...inspections.map(i => ({ title: `Inspección: ${i.tipo}`, date: i.fecha, color: 'bg-emerald-500', label: 'Completado' })),
                ...accidents.map(a => ({ title: `Accidente: ${a.trabajador}`, date: a.fecha, color: 'bg-secondary', label: 'Reportado' }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
            
            if (allActivity.length === 0) {
                activityList.innerHTML = `<p class="text-xs italic p-4 text-center">Sin actividad reciente.</p>`;
            } else {
                activityList.innerHTML = allActivity.map(act => `
                    <div class="bg-surface-container-low p-4 rounded-2xl flex items-center gap-4">
                        <div class="w-1 h-8 rounded-full ${act.color}"></div>
                        <div class="flex-1 text-xs">
                            <p class="font-bold text-primary">${act.title}</p>
                            <p class="opacity-60">${act.date}</p>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    function initDashboard() {
        if (!currentUser) return;
        const label = document.getElementById('company-name-label');
        if (label) label.innerText = `${currentUser.company} | ${currentUser.role.toUpperCase()}`;
        updateDashboardStats();
        if (typeof renderCalendar === 'function') renderCalendar();
    }

    // --- BINDING DE EVENTOS ---

    // Login
    if (loginForm) {
        loginForm.onsubmit = function(e) {
            e.preventDefault();
            const user = document.getElementById('login-user').value;
            const pass = document.getElementById('login-pass').value;
            const found = getStoredUsers().find(u => u.id === user && u.pass === pass);
            if (found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error de acceso");
        };
    }

    // Registro
    const btnShowReg = document.getElementById('btn-show-register');
    if (btnShowReg) btnShowReg.onclick = () => registerModal.classList.remove('hidden');
    const closeReg = document.getElementById('close-register-modal');
    if (closeReg) closeReg.onclick = () => registerModal.classList.add('hidden');
    
    if (registerForm) {
        registerForm.onsubmit = function(e) {
            e.preventDefault();
            const users = getStoredUsers();
            const newUser = {
                id: document.getElementById('reg-user').value,
                pass: document.getElementById('reg-pass').value,
                role: 'user',
                company: document.getElementById('reg-company').value,
                ruc: document.getElementById('reg-ruc').value,
                address: document.getElementById('reg-address').value,
                workers: document.getElementById('reg-workers').value,
                risk: document.getElementById('reg-risk').value,
                activity: document.getElementById('reg-activity').value
            };
            if (users.find(u => u.id === newUser.id)) return alert("Usuario duplicado");
            users.push(newUser);
            localStorage.setItem('sst_users', JSON.stringify(users));
            alert("¡Empresa Registrada!");
            registerModal.classList.add('hidden');
        };
    }

    // Navigation Buttons (Bottom & Dashboard)
    const navBinds = {
        'nav-dashboard': () => window.scrollTo({ top: 0, behavior: 'smooth' }),
        'nav-reportar': () => mtessModal.classList.remove('hidden'),
        'nav-calendar': () => calendarModal.classList.remove('hidden'),
        'nav-inspecciones': () => insModal.classList.remove('hidden'),
        'btn-iperc': () => {
            renderIperc();
            ipercModal.classList.remove('hidden');
        },
        'btn-reportar': () => mtessModal.classList.remove('hidden'),
        'btn-inspeccion': () => {
            renderChecklist(document.getElementById('ins-tipo').value);
            insModal.classList.remove('hidden');
        },
        'btn-historial-inspeccion': () => historialModal.classList.remove('hidden')
    };

    Object.keys(navBinds).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = navBinds[id];
    });

    // Close Modals
    const closers = {
        'close-iperc-modal': ipercModal,
        'close-inspeccion-modal': insModal,
        'close-mtess-modal': mtessModal,
        'close-calendar-modal': calendarModal,
        'close-historial-inspeccion-modal': historialModal
    };
    Object.keys(closers).forEach(id => {
        const el = document.getElementById(id);
        if (el && closers[id]) el.onclick = () => closers[id].classList.add('hidden');
    });

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) btnLogout.onclick = () => { sessionStorage.removeItem('sst_current_user'); window.location.reload(); };

    // IPERC Matrix
    function renderIperc() {
        const ipercContent = document.getElementById('iperc-content');
        if (!ipercContent || !currentUser) return;
        const hazards = [
            { p: 'Posturas Ergonómicas', r: 'Biológico', l: 'Medio', m: 'Pausas activas' },
            { p: 'Riesgo Eléctrico', r: 'Físico', l: 'Alto', m: 'Mantenimiento' }
        ];
        ipercContent.innerHTML = `
            <table class="w-full text-xs border">
                <tr class="bg-primary text-white">
                    <th class="p-2">Peligro</th><th class="p-2">Riesgo</th><th class="p-2">Nivel</th><th class="p-2">Control</th>
                </tr>
                ${hazards.map(h => `<tr><td class="p-2 border">${h.p}</td><td class="p-2 border">${h.r}</td><td class="p-2 border font-bold">${h.l}</td><td class="p-2 border italic">${h.m}</td></tr>`).join('')}
            </table>
        `;
    }

    const btnPrintIperc = document.getElementById('btn-print-iperc');
    if (btnPrintIperc) {
        btnPrintIperc.onclick = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("MATRIZ IPERC: " + (currentUser.company || "Empresa"), 10, 10);
            doc.save("Matriz_IPERC.pdf");
        };
    }

    // Inspecciones Logic
    function renderChecklist(tipo) {
        const container = document.getElementById('ins-checklist-container');
        if (!container) return;
        const data = checklistData[tipo] || [];
        container.innerHTML = data.map(d => `
            <div class="bg-white p-2 rounded border mb-2 text-xs">
                <label class="flex items-center gap-2">
                    <input type="checkbox" class="ins-check" data-item="${d.item}"> <strong>${d.item}</strong>
                </label>
            </div>
        `).join('');
    }

    const insTipoSelect = document.getElementById('ins-tipo');
    if (insTipoSelect) insTipoSelect.onchange = (e) => renderChecklist(e.target.value);

    const insFormReal = document.getElementById('inspeccion-form');
    if (insFormReal) {
        insFormReal.onsubmit = function(e) {
            e.preventDefault();
            const checks = document.querySelectorAll('.ins-check');
            let comp = 0;
            checks.forEach(c => { if(c.checked) comp++; });
            const p = ((comp / checks.length) * 100).toFixed(1);
            saveDataWithCompany('sst_inspecciones', {
                fecha: document.getElementById('ins-fecha').value,
                tipo: insTipoSelect.value,
                percent: p
            });
            alert("Guardado con éxito");
            insModal.classList.add('hidden');
        };
    }

    // MTESS Report
    const mtessFormReal = document.getElementById('mtess-form');
    if (mtessFormReal) {
        mtessFormReal.onsubmit = function(e) {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("REPORTE MTESS", 10, 10);
            doc.text("Trabajador: " + document.getElementById('pdf-trabajador').value, 10, 20);
            saveDataWithCompany('sst_registros_mtess', { trabajador: document.getElementById('pdf-trabajador').value, fecha: new Date().toLocaleDateString() });
            doc.save("Reporte_Accidente.pdf");
            alert("Reporte Generado");
            mtessModal.classList.add('hidden');
        };
    }

    // Inicio
    if (currentUser) {
        if (loginOverlay) loginOverlay.classList.add('hidden');
        initDashboard();
    }
});
