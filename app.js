/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 5.1 - Modo Global (Sin Login) - Todos los Módulos
 */

console.log("SST v5.1: Cargando todos los módulos...");

document.addEventListener('DOMContentLoaded', function() {

    // ──────────────────────────────────────────────────────────
    //  GENERADOR DE PDF PROFESIONAL (Paraguay Legal)
    // ──────────────────────────────────────────────────────────
    function generatePDF(type, custom) {
        if (!window.jspdf) { alert("Librería PDF no cargada. Verifica tu conexión."); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const fecha = new Date().toLocaleDateString('es-PY');

        // Cabecera institucional
        doc.setFillColor(0, 31, 95);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("PORTAL SG-SST PARAGUAY", 20, 14);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Sistema Automatizado de Gestión de Riesgos Laborales", 20, 22);
        doc.text("Fecha: " + fecha, 165, 22);

        doc.setTextColor(0, 0, 0);
        doc.line(15, 38, 195, 38);

        // ── POLÍTICA DE SST ──────────────────────────────────
        if (type === 'POLITICA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 55, { align: 'center' });
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);

            const parrafos = [
                "La organización, en cumplimiento de la Ley 5804/17 y el Decreto 14.390/92 del Poder Ejecutivo de la República del Paraguay, asume los siguientes compromisos en materia de Seguridad y Salud en el Trabajo:",
                "1. LEGALIDAD: Garantizar el cumplimiento estricto de toda la normativa vigente emitida por el Ministerio de Trabajo, Empleo y Seguridad Social (MTESS), el Instituto de Previsión Social (IPS) y organismos relacionados.",
                "2. PREVENCIÓN: Identificar, evaluar y controlar de forma sistemática los peligros y riesgos presentes en todas las operaciones de la empresa, aplicando controles de eliminación, sustitución, ingeniería, administración y uso de EPP.",
                "3. MEJORA CONTINUA: Revisar periódicamente el Sistema de Gestión de SST para mejorar continuamente el desempeño y alcanzar mayores estándares de bienestar laboral.",
                "4. PARTICIPACIÓN: Fomentar la participación activa de los trabajadores a través de la Comisión Interna de Prevención de Accidentes (CIPA) y los programas de capacitación en HST.",
                "5. RECURSOS: Asignar los recursos humanos, materiales y económicos necesarios para la efectiva gestión de la seguridad y salud en el trabajo.",
                "Esta política es de cumplimiento obligatorio para todo el personal, contratistas y visitantes de la organización y será revisada anualmente por la dirección general."
            ];

            let y = 68;
            parrafos.forEach(p => {
                const lines = doc.splitTextToSize(p, 170);
                doc.text(lines, 20, y);
                y += lines.length * 5 + 4;
            });

            // Sección de firmas
            y = Math.max(y + 15, 220);
            doc.line(30, y, 90, y);
            doc.line(120, y, 180, y);
            doc.setFontSize(9);
            doc.text("Gerente / Director General", 60, y + 5, { align: 'center' });
            doc.text("Responsable de SST", 150, y + 5, { align: 'center' });
        }

        // ── PLAN DE CONTINGENCIA ─────────────────────────────
        else if (type === 'CONTINGENCIA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("PLAN DE CONTINGENCIA Y EMERGENCIAS", 105, 55, { align: 'center' });
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);

            const secciones = [
                ["ALCANCE", "Aplica a todas las instalaciones, personal, visitantes y contratistas de la organización."],
                ["BRIGADISTAS", "Se conformarán brigadas de: Evacuación, Primeros Auxilios y Contra Incendios, con al menos 2 integrantes por turno."],
                ["PUNTO DE REUNIÓN", "El punto de reunión se ubicará en zona exterior segura, señalizada con cartel verde reflectivo."],
                ["PROCEDIMIENTO GENERAL", "1. Detectar la emergencia. 2. Activar la alarma. 3. Evacuación ordenada. 4. Llamar al 911. 5. No reingresar hasta autorización."],
                ["CONTACTOS DE EMERGENCIA", "Bomberos: 132 | Policía: 911 | IPS: (021) 229-9999 | SEME: (021) 204-800"]
            ];

            let y = 68;
            secciones.forEach(([titulo, texto]) => {
                doc.setFont("helvetica", "bold"); doc.text(titulo + ":", 20, y); y += 6;
                doc.setFont("helvetica", "normal");
                const lines = doc.splitTextToSize(texto, 170);
                doc.text(lines, 25, y);
                y += lines.length * 5 + 6;
            });
        }

        // ── MATRIZ IPERC ─────────────────────────────────────
        else if (type === 'IPERC') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("MATRIZ IPERC - EVALUACIÓN DE RIESGOS", 105, 55, { align: 'center' });
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text("Normativa: Decreto 14.390/92 - Identificación de Peligros y Evaluación de Riesgos", 20, 63);

            const filas = [
                ['Caídas a nivel', 'Mecánico', 'Desorden en piso', 2, 2, 4, 'MODERADO', 'Señalización y 5S'],
                ['Caídas en altura', 'Mecánico', 'Trabajo en plataformas', 1, 4, 4, 'ALTO', 'Arnés homologado'],
                ['Contacto eléctrico', 'Físico', 'Tableros expuestos', 1, 4, 4, 'ALTO', 'Bloqueo LOTO'],
                ['Posturas forzadas', 'Ergonómico', 'Trabajo sedentario', 3, 2, 6, 'MODERADO', 'Pausas activas'],
                ['Ruido industrial', 'Físico', 'Maquinaria pesada', 2, 2, 4, 'MODERADO', 'Protectores auditivos'],
                ['Sustancias químicas', 'Químico', 'Uso de solventes', 2, 3, 6, 'IMPORTANTE', 'Guantes y mascarilla'],
                ['Incendio', 'Físico', 'Materiales inflamables', 1, 5, 5, 'CRITICO', 'Extintor y simulacros'],
            ];

            doc.autoTable({
                startY: 70,
                head: [['Peligro', 'Tipo', 'Fuente', 'P', 'S', 'N', 'Nivel', 'Control']],
                body: filas,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [0, 31, 95], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [240, 245, 255] },
                columnStyles: { 3: { halign: 'center' }, 4: { halign: 'center' }, 5: { halign: 'center' } }
            });
        }

        // ── EMO (EXAMEN MÉDICO) ──────────────────────────────
        else if (type === 'EMO') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("ORDEN DE EXAMEN MÉDICO OCUPACIONAL", 105, 55, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("Resolución MTESS 03/2022 | Decreto 5078/2021", 105, 63, { align: 'center' });

            const campos = [
                ["Trabajador:", custom.nombre || "---"],
                ["Cédula de Identidad:", custom.ci || "---"],
                ["Tipo de Examen:", custom.tipo || "Periódico"],
                ["Fecha de Orden:", fecha]
            ];
            let y = 78;
            campos.forEach(([label, val]) => {
                doc.setFont("helvetica", "bold"); doc.text(label, 20, y);
                doc.setFont("helvetica", "normal"); doc.text(val, 80, y);
                y += 10;
            });
            doc.text("Se instruye al trabajador indicado realizarse los estudios correspondientes al tipo de examen indicado, en clínica habilitada por el IPS.", 20, y + 10, { maxWidth: 170 });
            doc.line(30, 220, 90, 220); doc.line(120, 220, 180, 220);
            doc.text("Firma del Médico Ocupacional", 60, 226, { align: 'center' });
            doc.text("Responsable de RRHH", 150, 226, { align: 'center' });
        }

        // ── POE / PTA / AUDITORÍA ────────────────────────────
        else if (type === 'POE_ALTURAS') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("PROCEDIMIENTO OPERATIVO ESTÁNDAR", 105, 55, { align: 'center' });
            doc.text("TRABAJO EN ALTURAS", 105, 63, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const pasos = ["1. Verificar que el trabajador esté capacitado y habilitado.", "2. Inspeccionar el arnés y línea de vida antes de cada uso.", "3. Utilizar plataformas certificadas y con barandas.", "4. Nunca trabajar solo en altura.", "5. Ante cualquier anomalía, detener el trabajo y reportar."];
            let y = 78;
            pasos.forEach(p => { doc.text(p, 20, y, { maxWidth: 170 }); y += 10; });
        }

        else if (type === 'MTESS_FORM') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("DECLARACIÓN DE ACCIDENTE DE TRABAJO (MTESS)", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const campos = [
                ["Trabajador:", custom.trabajador || "---"], ["C.I.:", custom.ci || "---"],
                ["Cargo:", custom.cargo || "---"], ["Fecha del Accidente:", custom.fecha || "---"],
                ["Lugar:", custom.lugar || "---"], ["Descripción:", custom.desc || "---"]
            ];
            let y = 75;
            campos.forEach(([l, v]) => { doc.setFont("helvetica", "bold"); doc.text(l, 20, y); doc.setFont("helvetica", "normal"); doc.text(v, 70, y, { maxWidth: 120 }); y += 12; });
        }

        // Pie de página
        doc.setFontSize(7); doc.setTextColor(150);
        doc.text("SST Paraguay - Gestión Profesional de Riesgos | www.sstparaguay.com.py", 105, 287, { align: 'center' });

        doc.save(type + "_SST_Paraguay.pdf");
        console.log("PDF generado:", type);
    }

    // ──────────────────────────────────────────────────────────
    //  MODALES (todos los del HTML)
    // ──────────────────────────────────────────────────────────
    function openModal(id) {
        const m = document.getElementById(id);
        if (m) { m.classList.remove('hidden'); m.classList.add('opacity-100'); }
        else console.warn("Modal no encontrado:", id);
    }
    function closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('hidden');
    }

    // Cerrar todos los modales al hacer click en [id^="close-"]
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            // El modal padre del botón close
            const parent = btn.closest('[id$="-modal"]') || btn.closest('.fixed');
            if (parent) parent.classList.add('hidden');
        });
    });

    // ──────────────────────────────────────────────────────────
    //  BINDINGS COMPLETOS (todos los IDs del HTML)
    // ──────────────────────────────────────────────────────────
    function bind(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
        else console.warn("Elemento no encontrado:", id);
    }

    // Módulo: Gestión Documental
    bind('btn-politica', () => generatePDF('POLITICA'));
    bind('btn-contingencia', () => generatePDF('CONTINGENCIA'));

    // Módulo: Matriz IPERC (hay 2 botones con este ID en el HTML, uno en hero y uno en módulos)
    document.querySelectorAll('#btn-iperc').forEach(el => {
        el.addEventListener('click', () => openModal('iperc-modal'));
    });
    bind('btn-print-iperc', () => generatePDF('IPERC'));

    // Módulo: Vigilancia Médica
    bind('btn-medico', () => openModal('medico-modal'));
    bind('btn-registro-medico', () => openModal('registro-medico-modal'));

    // Módulo: EPPs
    bind('btn-epp', () => {
        alert("📦 EPPs: Módulo de registro de entrega en desarrollo.\nPor ahora puede registrar entregas en el formulario de Inspección.");
    });

    // Módulo: CIPA
    bind('btn-cipa', () => {
        alert("👥 CIPA: Conforme a la normativa, se generará el Libro de Actas en la próxima versión.");
    });

    // Módulo: Formularios MTESS
    bind('btn-mtess', () => openModal('mtess-modal'));
    bind('btn-registro-mtess', () => openModal('registro-mtess-modal'));

    // Módulo: Procedimientos y Permisos
    bind('btn-altura', () => generatePDF('POE_ALTURAS'));
    bind('btn-pta-altura', () => {
        alert("📋 PTA Alturas: Se generará el Permiso de Trabajo en la próxima versión.");
    });
    bind('btn-auditoria', () => {
        alert("🔍 Auditoría: Procedimiento de Auditoría Interna en desarrollo.");
    });

    // Navegación inferior
    bind('nav-dashboard', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    bind('nav-reportar', () => openModal('mtess-modal'));
    bind('nav-calendar', () => openModal('calendar-modal'));
    bind('nav-inspecciones', () => openModal('inspeccion-modal'));

    // Botón inspección también en hero si existe
    bind('btn-inspeccion', () => openModal('inspeccion-modal'));
    bind('btn-reportar', () => openModal('mtess-modal'));
    bind('btn-historial-inspeccion', () => openModal('historial-inspeccion-modal'));

    // Logout
    bind('btn-logout', () => { sessionStorage.clear(); window.location.reload(); });

    // ──────────────────────────────────────────────────────────
    //  FORMULARIOS
    // ──────────────────────────────────────────────────────────

    // Formulario EMO (Examen Médico)
    const medForm = document.getElementById('medico-form');
    if (medForm) {
        medForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generatePDF('EMO', {
                nombre: document.getElementById('med-trabajador')?.value,
                ci: document.getElementById('med-ci')?.value,
                tipo: document.getElementById('med-tipo')?.value
            });
            closeModal('medico-modal');
        });
    }

    // Formulario MTESS
    const mtessForm = document.getElementById('mtess-form');
    if (mtessForm) {
        mtessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            generatePDF('MTESS_FORM', {
                trabajador: document.getElementById('pdf-trabajador')?.value,
                ci: document.getElementById('pdf-ci')?.value,
                cargo: document.getElementById('pdf-cargo')?.value,
                fecha: document.getElementById('pdf-fecha')?.value,
                lugar: document.getElementById('pdf-lugar')?.value,
                desc: document.getElementById('pdf-desc')?.value
            });
            closeModal('mtess-modal');
        });
    }

    // Formulario Inspección
    const insForm = document.getElementById('inspeccion-form');
    if (insForm) {
        insForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const record = {
                fecha: document.getElementById('ins-fecha')?.value,
                tipo: document.getElementById('ins-tipo')?.value,
                area: document.getElementById('ins-area')?.value,
                resp: document.getElementById('ins-responsable')?.value,
                obs: document.getElementById('ins-obs')?.value
            };
            const data = JSON.parse(localStorage.getItem('sst_inspecciones')) || [];
            data.push(record);
            localStorage.setItem('sst_inspecciones', JSON.stringify(data));
            updateDashboard();
            alert("✅ Inspección guardada correctamente.");
            closeModal('inspeccion-modal');
        });
    }

    // ──────────────────────────────────────────────────────────
    //  DASHBOARD
    // ──────────────────────────────────────────────────────────
    function updateDashboard() {
        const ins = JSON.parse(localStorage.getItem('sst_inspecciones')) || [];
        const acc = JSON.parse(localStorage.getItem('sst_registros_mtess')) || [];

        const cIns = document.getElementById('stat-ins-count');
        if (cIns) cIns.innerText = ins.length;

        const tf = document.getElementById('stat-tf');
        if (tf) tf.innerText = (acc.length * 0.5).toFixed(1);

        const ts = document.getElementById('stat-ts');
        if (ts) ts.innerText = (acc.length * 0.15).toFixed(1);

        const actList = document.getElementById('recent-activity-list');
        if (actList) {
            const all = [
                ...ins.map(i => ({ t: `Inspección: ${i.tipo}`, d: i.fecha, c: 'bg-blue-500' })),
                ...acc.map(a => ({ t: `Accidente: ${a.trabajador}`, d: a.fecha, c: 'bg-red-500' }))
            ].sort((a, b) => new Date(b.d) - new Date(a.d)).slice(0, 5);

            actList.innerHTML = all.length === 0
                ? '<p class="text-xs italic p-4 text-center opacity-50">Sin actividad reciente. Crea tu primera inspección.</p>'
                : all.map(a => `
                    <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                        <div class="w-1 h-8 ${a.c} rounded-full"></div>
                        <div class="text-[11px] flex-1">
                            <p class="font-bold">${a.t}</p>
                            <p class="opacity-60">${a.d}</p>
                        </div>
                    </div>
                `).join('');
        }
    }

    updateDashboard();
    console.log("SST v5.1: Todos los módulos vinculados correctamente.");
});
