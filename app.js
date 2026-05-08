/**
 * SST Paraguay - Sistema de Gestión SST
 * Versión 4.6.1 - Executive Legal Edition
 */

console.log("SST: Cargando v4.6.1...");

document.addEventListener('DOMContentLoaded', function() {
    
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        med: document.getElementById('medico-modal'),
        regMed: document.getElementById('registro-medico-modal'),
        regMtess: document.getElementById('registro-mtess-modal')
    };

    // --- GENERADOR PROFESIONAL ---
    function generateProfessionalPDF(type, customData = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const company = (currentUser ? currentUser.company : "EMPRESA DE PRUEBA").toUpperCase();
        const ruc = currentUser ? currentUser.ruc : "80000000-1";
        const date = new Date().toLocaleDateString('es-PY');

        // 1. Cabecera Estética
        doc.setFillColor(0, 26, 78); // Azul Primario
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("PORTAL SG-SST PARAGUAY", 20, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("SISTEMA AUTOMATIZADO DE GESTIÓN DE RIESGOS LABORALES", 20, 28);
        
        // 2. Información de Empresa
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(company, 20, 55);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("RUC: " + ruc, 20, 60);
        doc.text("FECHA DE EMISIÓN: " + date, 150, 60);
        doc.line(20, 65, 190, 65);

        // 3. Contenido según tipo
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        
        if (type === 'POLITICA') {
            doc.text("POLÍTICA INTERNA DE SEGURIDAD Y SALUD", 105, 80, { align: 'center' });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const body = `La Dirección de ${company}, consciente de su responsabilidad social y legal según la Ley 5804/17 y el Decreto 14.390/92, establece los siguientes compromisos:\n\n` +
                `• PROTEGER la integridad física y mental de todos los colaboradores mediante la prevención de riesgos.\n` +
                `• CUMPLIR estrictamente con las normativas vigentes emanadas del MTESS e IPS.\n` +
                `• CAPACITAR de forma continua al personal en materia de higiene y seguridad.\n` +
                `• PROVEER todos los recursos técnicos y económicos para la gestión de riesgos.\n` +
                `• FOMENTAR una cultura de prevención que garantice un ambiente laboral digno y seguro.\n\n` +
                `Esta política será difundida y revisada anualmente para asegurar su mejora continua.`;
            doc.text(body, 20, 95, { maxWidth: 170, lineHeightFactor: 1.5 });
            
            // Firmas
            doc.line(40, 220, 90, 220);
            doc.text("Firma del Responsable", 65, 225, { align: 'center' });
            doc.line(120, 220, 170, 220);
            doc.text("Sello de la Empresa", 145, 225, { align: 'center' });
        } 
        
        else if (type === 'IPERC') {
            doc.text("MATRIZ TÉCNICA DE RIESGOS (IPERC)", 105, 80, { align: 'center' });
            doc.setFontSize(10);
            const hazards = [
                ['Caídas', 'Mecánico', '2', '2', 'MODERADO', 'Señalización'],
                ['Electricidad', 'Físico', '1', '3', 'ALTO', 'Mantenimiento'],
                ['Posturas', 'Ergonómico', '3', '1', 'LEVE', 'Pausas Activas'],
                ['Ruido', 'Físico', '2', '2', 'MODERADO', 'Uso de EPP']
            ];
            doc.autoTable({
                startY: 90,
                head: [['Peligro', 'Riesgo', 'Prob', 'Sev', 'Nivel', 'Control']],
                body: hazards,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [0, 26, 78] }
            });
        }

        else if (type === 'EMO') {
            doc.text("ORDEN DE EXAMEN MÉDICO (EMO)", 105, 80, { align: 'center' });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text(`TRABAJADOR: ${customData.nombre}`, 20, 100);
            doc.text(`CÉDULA I.: ${customData.ci}`, 20, 110);
            doc.text(`TIPO DE EXAMEN: ${customData.tipo}`, 20, 120);
            doc.setFontSize(10);
            doc.text(`De conformidad con la Res. MTESS 03/2022, se solicita la realización de los estudios pertinentes según el protocolo de riesgos del puesto de trabajo.`, 20, 140, { maxWidth: 170 });
        }

        // 4. Pie de página
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Documento generado por SST PARAGUAY - Gestión Profesional de Riesgos", 105, 285, { align: 'center' });
        
        doc.save(`${type}_OFICIAL.pdf`);
    }

    // --- BINDINGS ---
    const binds = {
        'btn-politica': () => generateProfessionalPDF('POLITICA'),
        'btn-iperc': () => {
            const c = document.getElementById('iperc-content');
            if(c) c.innerHTML = '<p class="p-4 text-center text-xs opacity-50">Generando vista técnica...</p>';
            modals.iperc.classList.remove('hidden');
            setTimeout(() => {
                if(c) c.innerHTML = '<div class="bg-blue-50 p-4 rounded-xl text-xs">Vista previa cargada. Haga clic en Descargar PDF para el informe oficial.</div>';
            }, 500);
        },
        'btn-print-iperc': () => generateProfessionalPDF('IPERC'),
        'btn-medico': () => modals.med.classList.remove('hidden'),
        'btn-mtess': () => modals.mtess.classList.remove('hidden'),
        'nav-inspecciones': () => modals.ins.classList.remove('hidden'),
        'nav-calendar': () => modals.calendar.classList.remove('hidden')
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

    // EMO Form
    const medF = document.getElementById('medico-form');
    if(medF) {
        medF.onsubmit = (e) => {
            e.preventDefault();
            generateProfessionalPDF('EMO', {
                nombre: document.getElementById('med-trabajador').value,
                ci: document.getElementById('med-ci').value,
                tipo: document.getElementById('med-tipo').value
            });
            modals.med.classList.add('hidden');
        };
    }

    // Login (Mock persistencia)
    const loginF = document.getElementById('login-form');
    if(loginF) {
        loginF.onsubmit = (e) => {
            e.preventDefault();
            const u = document.getElementById('login-user').value;
            const p = document.getElementById('login-pass').value;
            const users = JSON.parse(localStorage.getItem('sst_users')) || [];
            const found = users.concat([{id:'admin',pass:'admin123',company:'SST Admin'}]).find(x=>x.id===u && x.pass===p);
            if(found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error");
        };
    }

    if(currentUser) {
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if(lbl) lbl.innerText = currentUser.company;
    }
});
