/**
 * SST Paraguay - Sistema de Gestión SST
 * Versión 4.7 - Hybrid Mode (Isolation + Sample Data)
 */

console.log("SST: Iniciando v4.7...");

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS DE EJEMPLO (Para que no se vea vacío) ---
    const sampleInspections = [
        { fecha: '2026-05-01', tipo: 'Extintores', area: 'Administración', percent: 100 },
        { fecha: '2026-05-04', tipo: 'EPP', area: 'Producción', percent: 85 }
    ];

    // --- SESIÓN ---
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    // --- FUNCIONES DE BASE DE DATOS ---
    function getStoredData(key) {
        let data = JSON.parse(localStorage.getItem(key)) || [];
        
        // Si no hay datos y es un usuario nuevo, inyectamos ejemplos
        if (data.length === 0 && (key === 'sst_inspecciones')) {
            return sampleInspections;
        }

        // Filtrado Multi-tenant (Solo si no es admin)
        if (currentUser && currentUser.id !== 'admin') {
            return data.filter(item => item.companyId === currentUser.id);
        }
        
        return data; // Admin ve TODO
    }

    function saveData(key, data) {
        let raw = JSON.parse(localStorage.getItem(key)) || [];
        if (currentUser) data.companyId = currentUser.id;
        raw.push(data);
        localStorage.setItem(key, JSON.stringify(raw));
        updateUI();
    }

    // --- GENERADOR PDF PROFESIONAL ---
    function generatePDF(type, data = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const company = (currentUser ? currentUser.company : "SST Paraguay").toUpperCase();
        
        // Cabecera Legal Paraguay
        doc.setFillColor(0, 26, 78);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setTextColor(255);
        doc.setFontSize(18);
        doc.text("SST PARAGUAY - DOCUMENTO OFICIAL", 20, 20);
        
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text("EMPRESA: " + company, 20, 45);
        doc.text("NORMATIVA: LEY 5804/17 - DEC. 14390/92", 20, 50);
        doc.line(20, 55, 190, 55);

        if (type === 'POLITICA') {
            doc.setFontSize(14);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD OCUPACIONAL", 105, 70, { align: 'center' });
            doc.setFontSize(10);
            const text = `La empresa ${company} se compromete a salvaguardar la integridad de sus trabajadores, cumpliendo con los estándares nacionales de prevención de riesgos...`;
            doc.text(text, 20, 85, { maxWidth: 170 });
        }

        if (type === 'IPERC') {
            doc.setFontSize(14);
            doc.text("MATRIZ IPERC (IDENTIFICACIÓN DE RIESGOS)", 105, 70, { align: 'center' });
            doc.autoTable({
                startY: 80,
                head: [['Peligro', 'Tipo', 'Nivel', 'Control']],
                body: [['Caídas', 'Mecánico', 'Medio', 'Limpieza'], ['Corte', 'Mecánico', 'Alto', 'EPP']],
                headStyles: { fillColor: [0, 26, 78] }
            });
        }

        doc.save(`${type}_OFICIAL.pdf`);
    }

    // --- ACTUALIZACIÓN UI ---
    function updateUI() {
        if (!currentUser) return;
        
        const ins = getStoredData('sst_inspecciones');
        const count = document.getElementById('stat-ins-count');
        if (count) count.innerText = ins.length;

        const activity = document.getElementById('recent-activity-list');
        if (activity) {
            activity.innerHTML = ins.map(i => `
                <div class="bg-surface-container-low p-3 rounded-xl flex items-center gap-3 mb-2">
                    <div class="w-1 h-6 bg-blue-500"></div>
                    <div class="text-[10px]"><strong>${i.tipo}</strong> - ${i.fecha}</div>
                </div>
            `).join('');
        }
    }

    // --- BINDINGS ---
    const actionMap = {
        'btn-politica': () => generatePDF('POLITICA'),
        'btn-contingencia': () => generatePDF('CONTINGENCIA'),
        'btn-iperc': () => {
            const m = document.getElementById('iperc-modal');
            if (m) m.classList.remove('hidden');
        },
        'btn-print-iperc': () => generatePDF('IPERC'),
        'nav-inspecciones': () => {
             const m = document.getElementById('inspeccion-modal');
             if (m) m.classList.remove('hidden');
        },
        'btn-medico': () => {
            const m = document.getElementById('medico-modal');
            if (m) m.classList.remove('hidden');
        },
        'btn-logout': () => {
            sessionStorage.clear();
            window.location.reload();
        }
    };

    Object.keys(actionMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onclick = actionMap[id];
    });

    // Closers
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.onclick = () => {
            const m = document.getElementById(btn.id.replace('close-','').replace('-modal','')+'-modal') || document.getElementById(btn.id.replace('close-',''));
            if(m) m.classList.add('hidden');
        };
    });

    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const u = document.getElementById('login-user').value;
            const p = document.getElementById('login-pass').value;
            const users = JSON.parse(localStorage.getItem('sst_users')) || [];
            const found = users.concat([{id:'admin',pass:'admin123',company:'Admin SST'}]).find(x=>x.id===u && x.pass===p);
            if (found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error de acceso");
        };
    }

    // Registro
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.onsubmit = (e) => {
            e.preventDefault();
            const users = JSON.parse(localStorage.getItem('sst_users')) || [];
            const n = {
                id: document.getElementById('reg-user').value,
                pass: document.getElementById('reg-pass').value,
                company: document.getElementById('reg-company').value,
                ruc: document.getElementById('reg-ruc').value,
                address: document.getElementById('reg-address').value,
                risk: document.getElementById('reg-risk').value
            };
            users.push(n);
            localStorage.setItem('sst_users', JSON.stringify(users));
            alert("¡Empresa Registrada! Inicia sesión ahora.");
            document.getElementById('register-modal').classList.add('hidden');
        };
    }

    // Init
    if (currentUser) {
        const overlay = document.getElementById('login-overlay');
        if (overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if (lbl) lbl.innerText = currentUser.company;
        updateUI();
    }
});
