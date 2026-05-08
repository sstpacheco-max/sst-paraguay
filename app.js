/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 4.4 - Resilience Mode
 */

console.log("SST: Iniciando v4.4...");

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS ---
    const checklistData = {
        'Instalaciones': [{item:'Orden',desc:'Limpieza'},{item:'Luces',desc:'Niveles'},{item:'Salidas',desc:'Despejadas'}],
        'Maquinaria': [{item:'Protección',desc:'Física'},{item:'Parada',desc:'Emergencia'}],
        'EPP': [{item:'Casco',desc:'Uso'},{item:'Calzado',desc:'Punta acero'}],
        'Eléctrico': [{item:'Tableros',desc:'Cerrados'},{item:'Cables',desc:'Aislados'}]
    };

    // --- SESIÓN ---
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    // --- ELEMENTOS ---
    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        calendar: document.getElementById('calendar-modal'),
        med: document.getElementById('medico-modal')
    };

    // --- FUNCIONES CORE ---
    function getStoredUsers() {
        const s = JSON.parse(localStorage.getItem('sst_users')) || [];
        if(!s.find(u=>u.id==='admin')) s.push({id:'admin',pass:'admin123',role:'admin',company:'Admin Global'});
        return s;
    }

    function getFilteredData(k) {
        const r = JSON.parse(localStorage.getItem(k)) || [];
        if(!currentUser || currentUser.role==='admin') return r;
        return r.filter(i => i.companyId === currentUser.id);
    }

    function saveData(k, d) {
        const r = JSON.parse(localStorage.getItem(k)) || [];
        if(currentUser) d.companyId = currentUser.id;
        r.push(d);
        localStorage.setItem(k, JSON.stringify(r));
        updateDashboard();
    }

    function updateDashboard() {
        if(!currentUser) return;
        const ins = getFilteredData('sst_inspecciones');
        const acc = getFilteredData('sst_registros_mtess');
        
        const elIns = document.getElementById('stat-ins-count');
        if(elIns) elIns.innerText = ins.length;
        
        const elLoc = document.getElementById('stat-location');
        if(elLoc) elLoc.innerText = currentUser.address || 'Asunción';

        const tf = document.getElementById('stat-tf');
        if(tf) tf.innerText = (acc.length * 0.5).toFixed(1);

        const actList = document.getElementById('recent-activity-list');
        if(actList) {
            const all = [
                ...ins.map(i=>({t:`Inspección: ${i.tipo}`, d:i.fecha, c:'bg-emerald-500'})),
                ...acc.map(a=>({t:`Accidente: ${a.trabajador}`, d:a.fecha, c:'bg-secondary'}))
            ].sort((a,b)=>new Date(b.d)-new Date(a.d)).slice(0,5);
            
            actList.innerHTML = all.length ? all.map(a=>`
                <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                    <div class="w-1 h-6 ${a.c}"></div>
                    <div class="text-[11px] flex-1"><strong>${a.t}</strong><br><span class="opacity-60">${a.d}</span></div>
                </div>
            `).join('') : '<p class="text-xs italic p-4 text-center">Sin actividad.</p>';
        }
    }

    // --- BINDINGS ---
    
    // Clear System (Fix caching/session issues)
    const btnClear = document.getElementById('btn-clear-system');
    if(btnClear) {
        btnClear.onclick = () => {
            if(confirm("¿Limpiar todos los datos temporales del sistema?")){
                sessionStorage.clear();
                localStorage.removeItem('sst_current_user');
                alert("Sistema reiniciado. Por favor recarga la página.");
                window.location.reload();
            }
        };
    }

    // Nav & Action Buttons
    const actionBinds = {
        'nav-dashboard': () => window.scrollTo(0,0),
        'nav-reportar': () => modals.mtess.classList.remove('hidden'),
        'nav-calendar': () => modals.calendar.classList.remove('hidden'),
        'nav-inspecciones': () => modals.ins.classList.remove('hidden'),
        'btn-iperc': () => { renderIperc(); modals.iperc.classList.remove('hidden'); },
        'btn-reportar': () => modals.mtess.classList.remove('hidden'),
        'btn-inspeccion': () => { renderIns(document.getElementById('ins-tipo').value); modals.ins.classList.remove('hidden'); }
    };

    Object.keys(actionBinds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = actionBinds[id];
    });

    // Closers
    const closers = ['close-iperc-modal','close-inspeccion-modal','close-mtess-modal','close-calendar-modal','close-medico-modal'];
    closers.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = () => {
            const m = document.getElementById(id.replace('close-','').replace('-modal','')+'-modal');
            if(m) m.classList.add('hidden');
        };
    });

    // Login
    const lForm = document.getElementById('login-form');
    if(lForm) {
        lForm.onsubmit = (e) => {
            e.preventDefault();
            const u = document.getElementById('login-user').value;
            const p = document.getElementById('login-pass').value;
            const found = getStoredUsers().find(x=>x.id===u && x.pass===p);
            if(found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error de credenciales");
        };
    }

    // Registro
    const btnShowReg = document.getElementById('btn-show-register');
    if(btnShowReg) btnShowReg.onclick = () => registerModal.classList.remove('hidden');
    if(registerForm) {
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const users = getStoredUsers();
            const n = {
                id: document.getElementById('reg-user').value,
                pass: document.getElementById('reg-pass').value,
                company: document.getElementById('reg-company').value,
                address: document.getElementById('reg-address').value,
                risk: document.getElementById('reg-risk').value,
                role: 'user'
            };
            if(users.find(x=>x.id===n.id)) return alert("Usuario ocupado");
            users.push(n);
            localStorage.setItem('sst_users', JSON.stringify(users));
            alert("Empresa Creada");
            registerModal.classList.add('hidden');
        };
    }

    // IPERC
    function renderIperc() {
        const c = document.getElementById('iperc-content');
        if(!c) return;
        c.innerHTML = `
            <table class="w-full text-[10px] border">
                <tr class="bg-primary text-white"><th>Peligro</th><th>Riesgo</th><th>Control</th></tr>
                <tr><td class="p-2 border">Ergonómico</td><td class="p-2 border">Medio</td><td class="p-2 border">Pausas</td></tr>
            </table>
        `;
    }

    const btnPrint = document.getElementById('btn-print-iperc');
    if(btnPrint) {
        btnPrint.onclick = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.text("IPERC - " + (currentUser ? currentUser.company : "SST"), 10,10);
            doc.save("IPERC.pdf");
        };
    }

    // Logout
    const btnLogout = document.getElementById('btn-logout');
    if(btnLogout) btnLogout.onclick = () => { sessionStorage.clear(); window.location.reload(); };

    // Init
    if(currentUser) {
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if(lbl) lbl.innerText = currentUser.company;
        updateDashboard();
    }
});
