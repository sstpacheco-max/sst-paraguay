/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 4.5 - Full Module Integration
 */

console.log("SST: Sistema v4.5 en línea.");

document.addEventListener('DOMContentLoaded', function() {
    
    // --- ESTADO Y DATOS ---
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        calendar: document.getElementById('calendar-modal'),
        med: document.getElementById('medico-modal'),
        regMed: document.getElementById('registro-medico-modal'),
        regMtess: document.getElementById('registro-mtess-modal'),
        histIns: document.getElementById('historial-inspeccion-modal')
    };

    // --- FUNCIONES CORE ---
    function getStoredUsers() {
        const s = JSON.parse(localStorage.getItem('sst_users')) || [];
        if(!s.find(u=>u.id==='admin')) s.push({id:'admin',pass:'admin123',role:'admin',company:'Admin Global'});
        return s;
    }

    function saveData(k, d) {
        const r = JSON.parse(localStorage.getItem(k)) || [];
        if(currentUser) d.companyId = currentUser.id;
        r.push(d);
        localStorage.setItem(k, JSON.stringify(r));
    }

    // --- GENERADORES PDF (MOCK) ---
    function generateSimplePDF(title, filename) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text(title, 20, 30);
        doc.setFontSize(12);
        doc.text("Empresa: " + (currentUser ? currentUser.company : "SST Paraguay"), 20, 50);
        doc.text("Fecha de Generación: " + new Date().toLocaleDateString(), 20, 60);
        doc.text("Este es un documento oficial generado por el Sistema SST v4.5", 20, 80);
        doc.save(filename + ".pdf");
    }

    // --- BINDINGS DE MÓDULOS (Captura de IDs del Screenshot) ---
    const moduleBinds = {
        // Gestión Documental
        'btn-politica': () => generateSimplePDF("POLÍTICA DE SST", "Politica_SST"),
        'btn-contingencia': () => generateSimplePDF("PLAN DE CONTINGENCIA", "Plan_Contingencia"),
        
        // Matriz IPERC
        'btn-iperc': () => { renderIperc(); modals.iperc.classList.remove('hidden'); },
        
        // Vigilancia Médica
        'btn-medico': () => modals.med.classList.remove('hidden'),
        'btn-registro-medico': () => modals.regMed.classList.remove('hidden'),
        
        // EPPs y CIPA
        'btn-epp': () => alert("Módulo de Gestión de EPPs: Registre entregas y stock de equipos."),
        'btn-cipa': () => alert("Módulo CIPA: Registre actas de conformación y reuniones mensuales."),
        
        // Formularios MTESS
        'btn-mtess': () => modals.mtess.classList.remove('hidden'),
        'btn-registro-mtess': () => modals.regMtess.classList.remove('hidden'),
        
        // Procedimientos
        'btn-altura': () => generateSimplePDF("POE TRABAJO EN ALTURAS", "POE_Alturas"),
        'btn-pta-altura': () => generateSimplePDF("PERMISO DE TRABAJO (PTA) ALTURAS", "PTA_Alturas"),
        'btn-auditoria': () => generateSimplePDF("PROCEDIMIENTO DE AUDITORÍA", "Proc_Auditoria")
    };

    Object.keys(moduleBinds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = moduleBinds[id];
    });

    // Navigation & Closers
    const navBinds = {
        'nav-dashboard': () => window.scrollTo({top:0, behavior:'smooth'}),
        'nav-reportar': () => modals.mtess.classList.remove('hidden'),
        'nav-calendar': () => modals.calendar.classList.remove('hidden'),
        'nav-inspecciones': () => modals.ins.classList.remove('hidden'),
        'btn-inspeccion': () => modals.ins.classList.remove('hidden'),
        'btn-historial-inspeccion': () => modals.histIns.classList.remove('hidden')
    };
    Object.keys(navBinds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = navBinds[id];
    });

    // Closers Dinámicos
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.onclick = () => {
            const mId = btn.id.replace('close-','');
            const m = document.getElementById(mId + '-modal') || document.getElementById(mId);
            if(m) m.classList.add('hidden');
        };
    });

    // IPERC Render
    function renderIperc() {
        const c = document.getElementById('iperc-content');
        if(!c) return;
        const hazards = [
            {p:'Caídas a nivel', r:'Mecánico', l:'Medio', c:'Orden y limpieza'},
            {p:'Ruido excesivo', r:'Físico', l:'Alto', c:'Uso de protectores'},
            {p:'Posturas fijas', r:'Ergonómico', l:'Bajo', c:'Pausas activas'}
        ];
        c.innerHTML = `
            <table class="w-full text-xs border-collapse">
                <tr class="bg-primary text-white">
                    <th class="p-2 border">Peligro</th><th class="p-2 border">Riesgo</th><th class="p-2 border">Nivel</th><th class="p-2 border">Control</th>
                </tr>
                ${hazards.map(h => `<tr><td class="p-2 border">${h.p}</td><td class="p-2 border">${h.r}</td><td class="p-2 border font-bold">${h.l}</td><td class="p-2 border italic">${h.c}</td></tr>`).join('')}
            </table>
        `;
    }

    // PDF IPERC
    const btnPrintIperc = document.getElementById('btn-print-iperc');
    if(btnPrintIperc) btnPrintIperc.onclick = () => generateSimplePDF("MATRIZ IPERC", "Matriz_IPERC");

    // Login & Registro (Mismo que v4.4 pero verificado)
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
            } else alert("Credenciales incorrectas");
        };
    }

    // Init UI
    if(currentUser) {
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if(lbl) lbl.innerText = currentUser.company;
    }
});
