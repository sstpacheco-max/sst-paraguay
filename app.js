/**
 * SST Paraguay - Sistema de Gestión SST
 * Versión 4.7.1 - Legal Full Content (No placeholders)
 */

console.log("SST: Iniciando v4.7.1 - Full Legal Text...");

document.addEventListener('DOMContentLoaded', function() {
    
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        med: document.getElementById('medico-modal'),
        calendar: document.getElementById('calendar-modal')
    };

    function generateFullLegalPDF(type, customData = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const company = (currentUser ? currentUser.company : "EMPRESA DE PRUEBA").toUpperCase();
        const ruc = currentUser ? currentUser.ruc : "80000000-1";
        const date = new Date().toLocaleDateString('es-PY');

        // Estética Profesional (Cabecera)
        doc.setFillColor(0, 31, 95);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.text("SST PARAGUAY - DOCUMENTO OFICIAL", 105, 18, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Garantizando Entornos Laborales Seguros bajo Normativa Vigente", 105, 26, { align: 'center' });

        // Meta Información
        doc.setTextColor(40);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("EMPRESA:", 20, 45);
        doc.text("RUC:", 20, 50);
        doc.text("FECHA:", 160, 50);
        
        doc.setFont("helvetica", "normal");
        doc.text(company, 45, 45);
        doc.text(ruc, 45, 50);
        doc.text(date, 175, 50);
        doc.line(20, 55, 190, 55);

        if (type === 'POLITICA') {
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 75, { align: 'center' });
            
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const bodyText = `La empresa ${company}, consciente de su responsabilidad social y legal con sus colaboradores, establece la presente Política de Seguridad y Salud en el Trabajo, asumiendo los siguientes compromisos fundamentales:\n\n` +
                `1. CUMPLIMIENTO LEGAL: Asegurar el cumplimiento estricto de la Ley 5804/17, el Decreto 14.390/92 y demás normativas complementarias emitidas por el Ministerio de Trabajo, Empleo y Seguridad Social (MTESS) y el IPS.\n\n` +
                `2. PREVENCIÓN DE RIESGOS: Identificar, evaluar y controlar los peligros y riesgos presentes en todas las actividades de la empresa, priorizando la eliminación de los mismos o la implementación de controles de ingeniería y administrativos eficientes.\n\n` +
                `3. MEJORA CONTINUA: Implementar procesos de mejora continua en el desempeño del Sistema de Gestión de SST para elevar los estándares de protección y bienestar de nuestros trabajadores.\n\n` +
                `4. CAPACITACIÓN Y PARTICIPACIÓN: Promover la formación constante del personal en materia de prevención y fomentar la participación activa a través de la Comisión Interna de Prevención de Accidentes (CIPA).\n\n` +
                `5. RECURSOS: Proveer los recursos humanos, técnicos y financieros necesarios para la implementación efectiva de los planes de prevención y respuesta ante emergencias.\n\n` +
                `Esta Política es de cumplimiento obligatorio para todo el personal, contratistas y visitantes de la organización.`;
            
            doc.text(bodyText, 20, 90, { maxWidth: 170, align: 'justify', lineHeightFactor: 1.4 });

            // Firmas
            doc.setFontSize(10);
            doc.line(30, 240, 90, 240);
            doc.text("FIRMA DIRECTOR / GERENTE", 60, 245, { align: 'center' });
            doc.line(120, 240, 180, 240);
            doc.text("SELLO DE LA ORGANIZACIÓN", 150, 245, { align: 'center' });
        }

        if (type === 'IPERC') {
            doc.setFontSize(15);
            doc.text("MATRIZ TÉCNICA IPERC - EVALUACIÓN DE RIESGOS", 105, 75, { align: 'center' });
            const rows = [
                ['Instalaciones', 'Caídas al mismo nivel', 'Mecánico', 'Medio', 'Orden y Limpieza'],
                ['Oficinas', 'Posturas Sedentarias', 'Ergonómico', 'Leve', 'Pausas Activas'],
                ['Taller', 'Contacto Eléctrico', 'Físico', 'Alto', 'Mantenimiento'],
                ['Logística', 'Sobreesfuerzo', 'Ergonómico', 'Moderado', 'Uso de Fajas'],
                ['General', 'Incendio / Explosión', 'Físico', 'Crítico', 'Extintores y Plan de Emergencia']
            ];
            doc.autoTable({
                startY: 85,
                head: [['Sector', 'Peligro', 'Tipo', 'Riesgo', 'Control Sugerido']],
                body: rows,
                headStyles: { fillColor: [0, 31, 95] },
                styles: { fontSize: 8 }
            });
        }

        doc.save(`${type}_OFICIAL_PARAGUAY.pdf`);
    }

    // --- BINDINGS ---
    const binds = {
        'btn-politica': () => generateFullLegalPDF('POLITICA'),
        'btn-iperc': () => modals.iperc.classList.remove('hidden'),
        'btn-print-iperc': () => generateFullLegalPDF('IPERC'),
        'btn-medico': () => modals.med.classList.remove('hidden'),
        'btn-mtess': () => modals.mtess.classList.remove('hidden'),
        'btn-logout': () => { sessionStorage.clear(); window.location.reload(); }
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

    // Login logic
    const lForm = document.getElementById('login-form');
    if(lForm) {
        lForm.onsubmit = (e) => {
            e.preventDefault();
            const u = document.getElementById('login-user').value;
            const p = document.getElementById('login-pass').value;
            const users = JSON.parse(localStorage.getItem('sst_users')) || [];
            const found = users.concat([{id:'admin',pass:'admin123',company:'Admin SST'}]).find(x=>x.id===u && x.pass===p);
            if(found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error de acceso");
        };
    }

    if(currentUser) {
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if(lbl) lbl.innerText = currentUser.company;
    }
});
