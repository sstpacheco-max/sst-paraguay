/**
 * SST Paraguay - Sistema de Gestión SST
 * Versión 5.0 - REVERSION (Global Mode)
 * Se elimina el sistema de usuarios para simplificar el uso.
 */

console.log("SST: Sistema v5.0 (Modo Global) - Todo en uno.");

document.addEventListener('DOMContentLoaded', function() {
    
    // --- DATOS DE EJEMPLO INICIALES ---
    const defaultInspecciones = [
        { fecha: '2026-05-01', tipo: 'Extintores', area: 'Planta Baja', percent: 100, resp: 'Ing. Pacheco' },
        { fecha: '2026-05-05', tipo: 'EPP', area: 'Depósito', percent: 90, resp: 'Ing. Pacheco' }
    ];

    // --- BASE DE DATOS (GLOBAL) ---
    function getAllData(key) {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        if (data.length === 0 && key === 'sst_inspecciones') return defaultInspecciones;
        return data;
    }

    function saveData(key, item) {
        const data = JSON.parse(localStorage.getItem(key)) || [];
        data.push(item);
        localStorage.setItem(key, JSON.stringify(data));
        updateDashboard();
    }

    // --- ELEMENTOS UI ---
    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        med: document.getElementById('medico-modal'),
        regMed: document.getElementById('registro-medico-modal'),
        regMtess: document.getElementById('registro-mtess-modal'),
        calendar: document.getElementById('calendar-modal')
    };

    // --- GENERADOR PDF PROFESIONAL (Basado en v4.7.1) ---
    function generatePDF(type, custom = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const company = "SST PARAGUAY - GESTIÓN GLOBAL";
        const date = new Date().toLocaleDateString('es-PY');

        doc.setFillColor(0, 31, 95);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255);
        doc.setFontSize(20);
        doc.text("SST PARAGUAY - DOCUMENTO OFICIAL", 105, 20, { align: 'center' });

        doc.setTextColor(40);
        doc.setFontSize(10);
        doc.text("EMPRESA: " + company, 20, 45);
        doc.text("FECHA: " + date, 160, 45);
        doc.line(20, 50, 190, 50);

        if (type === 'POLITICA') {
            doc.setFontSize(16);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 70, { align: 'center' });
            doc.setFontSize(11);
            const body = `La empresa se compromete a cumplir con la Ley 5804/17 y el Decreto 14.390/92, garantizando un entorno seguro y saludable para todos sus trabajadores a través de la prevención constante y el cumplimiento de las normativas vigentes.`;
            doc.text(body, 20, 85, { maxWidth: 170 });
        }

        if (type === 'IPERC') {
            doc.setFontSize(16);
            doc.text("MATRIZ TÉCNICA IPERC", 105, 70, { align: 'center' });
            doc.autoTable({
                startY: 80,
                head: [['Peligro', 'Riesgo', 'Nivel', 'Control']],
                body: [['Caídas', 'Mecánico', 'Medio', 'Limpieza'], ['Electricidad', 'Físico', 'Alto', 'Mantenimiento']],
                headStyles: { fillColor: [0, 31, 95] }
            });
        }

        doc.save(`${type}_SST_PARAGUAY.pdf`);
    }

    // --- ACTUALIZACIÓN DASHBOARD ---
    function updateDashboard() {
        const ins = getAllData('sst_inspecciones');
        const count = document.getElementById('stat-ins-count');
        if (count) count.innerText = ins.length;

        const list = document.getElementById('recent-activity-list');
        if (list) {
            list.innerHTML = ins.map(i => `
                <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3 mb-2">
                    <div class="w-1 h-8 bg-blue-600 rounded-full"></div>
                    <div class="text-[10px]">
                        <strong>Inspección: ${i.tipo}</strong><br>
                        <span class="opacity-60">${i.fecha} - ${i.area}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    // --- BINDINGS ---
    const binds = {
        'btn-politica': () => generatePDF('POLITICA'),
        'btn-iperc': () => {
            const cont = document.getElementById('iperc-content');
            if(cont) cont.innerHTML = `<div class="p-4 text-xs bg-blue-50 rounded-xl">Vista técnica lista. Use el botón Descargar PDF para el reporte oficial.</div>`;
            modals.iperc.classList.remove('hidden');
        },
        'btn-print-iperc': () => generatePDF('IPERC'),
        'btn-medico': () => modals.med.classList.remove('hidden'),
        'btn-mtess': () => modals.mtess.classList.remove('hidden'),
        'nav-inspecciones': () => modals.ins.classList.remove('hidden'),
        'nav-calendar': () => modals.calendar.classList.remove('hidden'),
        'nav-dashboard': () => window.scrollTo({top:0, behavior:'smooth'})
    };

    Object.keys(binds).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = binds[id];
    });

    // Closers
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.onclick = () => {
            const m = document.getElementById(btn.id.replace('close-','').replace('-modal','')+'-modal') || document.getElementById(btn.id.replace('close-',''));
            if(m) m.classList.add('hidden');
        };
    });

    // Formulario Inspección
    const insForm = document.getElementById('inspeccion-form');
    if(insForm) {
        insForm.onsubmit = (e) => {
            e.preventDefault();
            saveData('sst_inspecciones', {
                fecha: document.getElementById('ins-fecha').value,
                tipo: document.getElementById('ins-tipo').value,
                area: document.getElementById('ins-area').value,
                resp: document.getElementById('ins-responsable').value
            });
            alert("¡Inspección Guardada con Éxito!");
            modals.ins.classList.add('hidden');
        };
    }

    // Formulario MTESS
    const mtessForm = document.getElementById('mtess-form');
    if(mtessForm) {
        mtessForm.onsubmit = (e) => {
            e.preventDefault();
            generatePDF('MTESS_REPORT');
            alert("Reporte Generado");
            modals.mtess.classList.add('hidden');
        };
    }

    // Inicialización
    updateDashboard();
    
    // Escondemos overlays de login/registro si existen
    const loginOverlay = document.getElementById('login-overlay');
    if(loginOverlay) loginOverlay.classList.add('hidden');
    const registerModal = document.getElementById('register-modal');
    if(registerModal) registerModal.classList.add('hidden');
});
