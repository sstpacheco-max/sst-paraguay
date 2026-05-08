/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 5.3.2 - Final Stable
 */

console.log("SST v5.3.2: Iniciando motor de estabilidad...");

document.addEventListener('DOMContentLoaded', function() {

    // ════════════════════════════════════════════
    //  UTILIDADES
    // ════════════════════════════════════════════
    function openModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.remove('hidden');
        void m.offsetWidth; // Force reflow
        m.classList.remove('opacity-0');
        const inner = m.querySelector('.transform');
        if (inner) inner.classList.remove('scale-95');
    }

    function closeModal(id) {
        const m = document.getElementById(id);
        if (!m) return;
        m.classList.add('opacity-0');
        const inner = m.querySelector('.transform');
        if (inner) inner.classList.add('scale-95');
        setTimeout(() => m.classList.add('hidden'), 300);
    }

    function bind(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    // Closers universales
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.fixed');
            if (modal) closeModal(modal.id);
        });
    });

    // ════════════════════════════════════════════
    //  MOTOR DE GENERACIÓN PDF
    // ════════════════════════════════════════════
    function genPDF(type, d) {
        if (!window.jspdf) { alert("Error: Librería PDF no cargada."); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const hoy = new Date().toLocaleDateString('es-PY');

        // Cabecera Corporativa
        doc.setFillColor(0, 31, 95);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text("PORTAL SG-SST PARAGUAY", 20, 14);
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("Sistema de Gestión de Riesgos Laborales — Ley 5804/17 | " + hoy, 20, 22);
        doc.setTextColor(0); doc.line(15, 38, 195, 38);

        // Lógica por tipo de reporte
        if (type === 'POLITICA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const p = [
                `La organización ${(d && d.empresa) ? d.empresa : '---'}, con RUC ${(d && d.ruc) ? d.ruc : '---'}, en cumplimiento del Decreto 14.390/92, asume:`,
                "1. LEGALIDAD: Cumplir con todas las normativas de Seguridad y Salud vigentes en Paraguay.",
                "2. PREVENCIÓN: Identificar y mitigar los riesgos laborales en todas las áreas operativas.",
                "3. MEJORA CONTINUA: Evaluar y mejorar el desempeño del SG-SST anualmente.",
                "4. CAPACITACIÓN: Garantizar el entrenamiento en HST de todos los colaboradores.",
                "5. RECURSOS: Proveer los recursos necesarios para un ambiente de trabajo seguro.",
                `Actividad declarada: ${(d && d.actividad) ? d.actividad : 'Gestión SST General'}.`
            ];
            let y = 68;
            p.forEach(t => { const l = doc.splitTextToSize(t, 170); doc.text(l, 20, y); y += l.length * 5 + 4; });
            doc.line(30, 230, 90, 230); doc.line(120, 230, 180, 230);
            doc.text((d && d.autoridad) ? d.autoridad : "Gerente General", 60, 236, { align: 'center' });
            doc.text("Responsable de SST", 150, 236, { align: 'center' });
        }

        else if (type === 'CONTINGENCIA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(16);
            doc.text("PLAN DE CONTINGENCIA CONTRA RIESGOS LABORALES", 105, 50, { align: 'center' });
            doc.setFontSize(14);
            doc.text(d.empresa || "LA EMPRESA", 105, 60, { align: 'center' });
            
            doc.setFontSize(10); doc.setFont("helvetica", "bold");
            doc.text("1. INTRODUCCIÃ“N Y BASE LEGAL", 20, 75);
            doc.setFont("helvetica", "normal");
            const intro = "El presente plan se establece en cumplimiento con el Decreto NÂ° 14.390/92 (Reglamento General TÃ©cnico de Seguridad, Higiene y Medicina en el Trabajo) y la Ley NÂ° 5804/17 del Sistema Nacional de PrevenciÃ³n de Riesgos Laborales. Su objetivo es preservar la integridad fÃ­sica del personal y bienes de la instituciÃ³n.";
            doc.text(doc.splitTextToSize(intro, 170), 20, 82);

            doc.setFont("helvetica", "bold");
            doc.text("2. ALCANCE Y OBJETIVOS", 20, 100);
            doc.setFont("helvetica", "normal");
            doc.text("- Alcance: Instalaciones de " + (d.lugar || "la sede central") + ".", 25, 107);
            doc.text("- Objetivos: Identificar amenazas, asignar responsabilidades y establecer flujogramas de respuesta.", 25, 114);

            doc.setFont("helvetica", "bold");
            doc.text("3. IDENTIFICACIÃ“N DE AMENAZAS", 20, 125);
            const threats = [];
            if (d.chkFuego) threats.push("Incendio / ExplosiÃ³n");
            if (d.chkMedica) threats.push("Emergencia MÃ©dica");
            if (d.chkElectrico) threats.push("Contacto ElÃ©ctrico / Cortocircuito");
            if (d.chkQuimico) threats.push("Derrame de Sustancias QuÃ­micas");
            doc.setFont("helvetica", "normal");
            doc.text("Amenazas detectadas: " + (threats.join(", ") || "Ninguna especificada"), 25, 132);

            doc.setFont("helvetica", "bold");
            doc.text("4. ESTRUCTURA DE BRIGADAS Y RESPONSABILIDADES", 20, 145);
            doc.autoTable({
                startY: 150,
                head: [['Cargo', 'Nombre del Responsable']],
                body: [
                    ['Jefe de Emergencias', d.jefe || '---'],
                    ['LÃ­der Brigada de Incendio', d.brigIncendio || '---'],
                    ['Primeros Auxilios', 'Personal Designado'],
                    ['Punto de ReuniÃ³n Final', d.punto || '---']
                ],
                theme: 'striped',
                headStyles: { fillColor: [0, 51, 153] }
            });

            doc.setFont("helvetica", "bold");
            doc.text("5. PROTOCOLO GENERAL DE EVACUACIÃ“N", 20, doc.autoTable.previous.finalY + 15);
            doc.setFont("helvetica", "normal");
            const proto = "1. ALARMA: ActivaciÃ³n de sirena o aviso sonoro. 2. ABANDONO: Salida en fila, sin correr, siguiendo rutas señalizadas. 3. REUNIÃ“N: Conteo de personal en el Punto de ReuniÃ³n: " + (d.punto || "Exterior") + ". 4. CONTROL: Solo reingresar tras autorizaciÃ³n del Jefe de Emergencias.";
            doc.text(doc.splitTextToSize(proto, 170), 20, doc.autoTable.previous.finalY + 22);

            doc.setFont("helvetica", "bold");
            doc.text("6. TELÃ‰FONOS DE EMERGENCIA (NACIONAL)", 20, doc.autoTable.previous.finalY + 45);
            doc.setFontSize(9);
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 50,
                body: [
                    ['Bomberos Voluntarios', '132', 'PolicÃ­a Nacional', '911'],
                    ['SEME (Ambulancia)', '141', 'IPS Emergencias', '(021) 229 9999']
                ],
                styles: { halign: 'center' }
            });
        }

        else if (type === 'IPERC') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("MATRIZ IPERC - IDENTIFICACIÓN DE PELIGROS", 105, 55, { align: 'center' });
            const saved = JSON.parse(localStorage.getItem('sst_iperc')) || [];
            if (saved.length === 0) { alert("No hay datos en la matriz."); return; }
            const rows = saved.map(h => [h.area, h.peligro, h.riesgo, h.prob, h.sev, h.nivel, h.nivelLabel, h.control]);
            doc.autoTable({
                startY: 65,
                head: [['Área','Peligro','Riesgo','P','S','N','Nivel','Control']],
                body: rows,
                styles: { fontSize: 7 },
                headStyles: { fillColor: [0, 31, 95] }
            });
        }

        else if (type === 'EMO') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("ORDEN DE EXAMEN MÉDICO OCUPACIONAL", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const c = [["Trabajador:", d.nombre], ["C.I.:", d.ci], ["Tipo:", d.tipo], ["Fecha:", hoy]];
            let y = 70;
            c.forEach(([l,v]) => { doc.setFont("helvetica","bold"); doc.text(l,20,y); doc.setFont("helvetica","normal"); doc.text(v||'---',60,y); y+=10; });
            doc.text("Se solicita la realización de los estudios médicos pertinentes para el cargo.", 20, y+10);
        }

        else if (type === 'MTESS_FORM') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("DECLARACIÓN DE ACCIDENTE DE TRABAJO (MTESS)", 105, 50, { align: 'center' });
            
            const tableData = [
                [{ content: 'I. DATOS DEL EMPLEADOR', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['Empresa:', d.empresa || '---', 'RUC:', d.ruc || '---'],
                ['Actividad:', d.actividad || '---', 'Dirección:', d.dirEmpresa || '---'],
                ['Teléfono:', d.telEmpresa || '---', '', ''],
                
                [{ content: 'II. DATOS DEL TRABAJADOR', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['Nombre:', d.nombre || '---', 'C.I.:', d.ci || '---'],
                ['Edad:', d.edad || '---', 'Sexo:', d.sexo || '---'],
                ['Estado Civil:', d.civil || '---', 'Cargo:', d.cargo || '---'],
                ['Antigüedad:', d.antiguedad || '---', 'Salario:', d.salario || '---'],
                ['Horario:', d.horario || '---', 'Domicilio:', d.dirTrab || '---'],
                
                [{ content: 'III. DATOS DEL ACCIDENTE', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['Fecha/Hora:', d.fecha || '---', 'Lugar:', d.lugar || '---'],
                ['Tipo:', d.tipo || '---', 'Agente:', d.agente || '---'],
                ['Zona Afectada:', d.zona || '---', 'Usaba EPP:', d.epp || '---'],
                ['Descripción:', { content: d.desc || '---', colSpan: 3 }],
                
                [{ content: 'IV. DATOS MÉDICOS', colSpan: 4, styles: { fillColor: [240, 240, 240], fontStyle: 'bold' } }],
                ['Lesión:', d.lesion || '---', 'Diagnóstico:', d.diagnostico || '---'],
                ['Días Incap.:', d.dias || '---', 'Centro Médico:', d.centro || '---'],
                ['Gravedad:', d.gravedad || '---', '', '']
            ];

            doc.autoTable({
                startY: 60,
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2 },
                columnStyles: { 0: { fontStyle: 'bold', width: 30 }, 2: { fontStyle: 'bold', width: 30 } }
            });
        }

        else if (type === 'POE_ALTURAS') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("POE: TRABAJO SEGURO EN ALTURAS", 105, 50, { align: 'center' });
            doc.setFontSize(9); doc.setFont("helvetica", "normal");
            const txt = "Este procedimiento establece los requisitos mínimos de seguridad para trabajos sobre 1.80m, incluyendo el uso obligatorio de arnés de cuerpo completo, línea de vida y puntos de anclaje certificados (Dec. 14.390/92).";
            doc.text(doc.splitTextToSize(txt, 170), 20, 60);
            doc.setFont("helvetica","bold"); doc.text("Requisitos Obligatorios:", 20, 80);
            const r = ["1. Certificado médico de aptitud.", "2. Capacitación teórica/práctica.", "3. Permiso de Trabajo (PTA) firmado.", "4. EPP contra caídas inspeccionado."];
            r.forEach((t, i) => doc.text(t, 25, 88 + (i*6)));
        }

        else if (type === 'PTA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("PERMISO DE TRABAJO EN ALTURAS (PTA)", 105, 50, { align: 'center' });
            doc.setFontSize(8); doc.setFont("helvetica", "normal");
            doc.text("VÁLIDO SOLO PARA LA FECHA Y TAREA INDICADA", 105, 56, { align: 'center' });
            
            function ptaF(l, v, x, y) { doc.setFont("helvetica","bold"); doc.text(l,x,y); doc.setFont("helvetica","normal"); doc.text(String(v||'---'),x,y+4); }
            ptaF("Empresa:", d.empresa, 20, 70); ptaF("Área:", d.area, 100, 70);
            ptaF("Trabajador:", d.trab1, 20, 85); ptaF("Altura:", d.altura, 100, 85);
            ptaF("Tarea:", d.tarea, 20, 100);
            
            doc.text("EPP Verificado: " + (d.chkArnes ? '[SÍ]' : '[NO]'), 20, 115);
            doc.text("Línea Vida: " + (d.chkLinea ? '[SÍ]' : '[NO]'), 70, 115);
            doc.text("Anclaje: " + (d.chkAnclaje ? '[SÍ]' : '[NO]'), 120, 115);
        }

        else if (type === 'EPP') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("CONSTANCIA DE ENTREGA DE EPP", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            doc.text("Trabajador: " + d.trabajador, 20, 75);
            doc.text("C.I.: " + d.ci, 20, 85);
            doc.text("Equipos Entregados: " + d.equipos, 20, 100, { maxWidth: 170 });
        }

        else if (type === 'CIPA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("ACTA DE COMITÉ CIPA", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            doc.text("Acta N°: " + d.nro, 20, 75);
            doc.text("Fecha: " + d.fecha, 100, 75);
            doc.text("Temas Tratados: " + d.temas, 20, 95, { maxWidth: 170 });
        }

        // Footer y Salvar
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text("SST PARAGUAY - Cumplimiento Normativo Profesional", 105, 285, { align: 'center' });
        
        // Finalización y Guardado (Método de Máxima Compatibilidad)
        const safeName = String(type || 'Reporte').replace(/[^a-z0-9]/gi, '_');
        const fileName = `${safeName}_SST_PY_${new Date().getTime()}.pdf`;

        console.log("Generando PDF para descarga:", fileName);
        
        try {
            const pdfBlob = doc.output('blob');
            
            // Si el navegador es Internet Explorer o Edge antiguo
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveOrOpenBlob(pdfBlob, fileName);
            } else {
                // Para navegadores modernos, forzamos octet-stream para asegurar la descarga del archivo
                const blob = new Blob([pdfBlob], { type: 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                
                setTimeout(() => {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                }, 2000);
            }
            console.log("Descarga iniciada.");
            alert("SST Paraguay: Reporte generado con éxito.\nArchivo: " + fileName);
        } catch (err) {
            console.error("Error crítico en descarga:", err);
            // Último recurso: abrir en ventana nueva
            doc.output('dataurlnewwindow');
        }
    }

    // ════════════════════════════════════════════
    //  BINDINGS Y LOGICA DE MODULOS
    // ════════════════════════════════════════════
    
    // Dash Buttons
    bind('btn-politica', () => openModal('politica-modal'));
    bind('btn-contingencia', () => openModal('contingencia-modal'));
    bind('btn-altura', () => genPDF('POE_ALTURAS'));
    bind('btn-pta-altura', () => openModal('pta-modal'));
    bind('btn-medico', () => openModal('medico-modal'));
    bind('btn-epp', () => openModal('epp-modal'));
    bind('btn-mtess', () => openModal('mtess-modal'));
    bind('btn-cipa', () => openModal('cipa-modal'));
    bind('nav-inspecciones', () => openModal('inspeccion-modal'));

    // IPERC Logic
    const ipercProb = document.getElementById('iperc-prob');
    const ipercSev = document.getElementById('iperc-sev');
    const ipercNivel = document.getElementById('iperc-nivel');
    const ipercPeligroInput = document.getElementById('iperc-peligro');
    const ipercLista = document.getElementById('iperc-lista');

    function getNivelInfo(p, s) {
        const n = p * s;
        if (n <= 1) return { n, label: 'TRIVIAL', cls: 'bg-emerald-100 text-emerald-800' };
        if (n <= 2) return { n, label: 'TOLERABLE', cls: 'bg-green-100 text-green-800' };
        if (n <= 4) return { n, label: 'MODERADO', cls: 'bg-amber-100 text-amber-800' };
        if (n <= 6) return { n, label: 'IMPORTANTE', cls: 'bg-orange-100 text-orange-800' };
        return { n, label: 'INTOLERABLE', cls: 'bg-red-100 text-red-800' };
    }

    function renderIpercList() {
        if (!ipercLista) return;
        const data = JSON.parse(localStorage.getItem('sst_iperc')) || [];
        if (data.length === 0) { ipercLista.innerHTML = ''; return; }
        ipercLista.innerHTML = data.map((h, i) => {
            const info = getNivelInfo(h.prob, h.sev);
            return `<div class="${info.cls} p-3 rounded-lg text-[10px] flex justify-between">
                <div><b>${h.area}</b>: ${h.peligro} (Nivel: ${info.n})</div>
                <button onclick="window.delIperc(${i})" class="text-red-600 font-bold">✕</button>
            </div>`;
        }).join('');
    }

    window.delIperc = (idx) => {
        const d = JSON.parse(localStorage.getItem('sst_iperc')) || [];
        d.splice(idx, 1);
        localStorage.setItem('sst_iperc', JSON.stringify(d));
        renderIpercList();
    };

    bind('btn-add-peligro', () => {
        const p = ipercPeligroInput?.value;
        const area = document.getElementById('iperc-area')?.value;
        if (!p) return alert("Ingrese el peligro");
        const prob = parseInt(ipercProb.value);
        const sev = parseInt(ipercSev.value);
        const data = JSON.parse(localStorage.getItem('sst_iperc')) || [];
        data.push({ area, peligro: p, prob, sev, riesgo: 'General', nivel: prob*sev, nivelLabel: getNivelInfo(prob,sev).label, control: 'EPP' });
        localStorage.setItem('sst_iperc', JSON.stringify(data));
        renderIpercList();
        ipercPeligroInput.value = '';
    });

    document.querySelectorAll('#btn-iperc').forEach(b => b.addEventListener('click', () => { renderIpercList(); openModal('iperc-modal'); }));
    bind('btn-print-iperc', () => genPDF('IPERC'));

    // Form Handlers
    const setupForm = (id, type, modalId, fieldsMap) => {
        const f = document.getElementById(id);
        if (!f) return;
        f.addEventListener('submit', (e) => {
            e.preventDefault();
            const d = {};
            for (let k in fieldsMap) {
                const el = document.getElementById(fieldsMap[k]);
                d[k] = el ? (el.type === 'checkbox' ? el.checked : el.value) : '';
            }
            genPDF(type, d);
            closeModal(modalId);
        });
    };

    setupForm('politica-form', 'POLITICA', 'politica-modal', { empresa: 'pol-empresa', ruc: 'pol-ruc', autoridad: 'pol-autoridad', actividad: 'pol-actividad' });
    setupForm('contingencia-form', 'CONTINGENCIA', 'contingencia-modal', { 
        empresa: 'cont-empresa', 
        lugar: 'cont-lugar', 
        punto: 'cont-punto',
        jefe: 'cont-jefe',
        brigIncendio: 'cont-brig-incendio',
        chkFuego: 'cont-chk-fuego',
        chkMedica: 'cont-chk-medica',
        chkElectrico: 'cont-chk-electrico',
        chkQuimico: 'cont-chk-quimico'
    });
    setupForm('medico-form', 'EMO', 'medico-modal', { nombre: 'med-trabajador', ci: 'med-ci', tipo: 'med-tipo' });
    setupForm('epp-form', 'EPP', 'epp-modal', { trabajador: 'epp-trabajador', ci: 'epp-ci', equipos: 'epp-equipos' });
    setupForm('cipa-form', 'CIPA', 'cipa-modal', { nro: 'cipa-nro', fecha: 'cipa-fecha', temas: 'cipa-temas' });
    setupForm('mtess-form', 'MTESS_FORM', 'mtess-modal', { 
        empresa:'mt-empresa', ruc:'mt-ruc', actividad:'mt-actividad', dirEmpresa:'mt-dir-empresa', telEmpresa:'mt-tel-empresa',
        nombre:'mt-nombre', ci:'mt-ci', edad:'mt-edad', sexo:'mt-sexo', civil:'mt-civil', cargo:'mt-cargo', antiguedad:'mt-antiguedad', salario:'mt-salario', horario:'mt-horario', dirTrab:'mt-dir-trab',
        fecha:'mt-fecha', lugar:'mt-lugar', tipo:'mt-tipo', agente:'mt-agente', zona:'mt-zona', epp:'mt-epp', desc:'mt-desc',
        lesion:'mt-lesion', diagnostico:'mt-diagnostico', dias:'mt-dias', centro:'mt-centro', gravedad:'mt-gravedad'
    });
    // PTA Form Completo
    const ptaForm = document.getElementById('pta-form');
    if (ptaForm) {
        ptaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = id => document.getElementById(id)?.value || '';
            const chk = id => document.getElementById(id)?.checked || false;
            genPDF('PTA', {
                empresa: v('pta-empresa'), area: v('pta-area'), trab1: v('pta-trab1'), 
                altura: v('pta-altura'), tarea: v('pta-tarea'),
                chkArnes: chk('pta-chk-arnes'), chkLinea: chk('pta-chk-linea'), 
                chkAnclaje: chk('pta-chk-anclaje'), chkCasco: chk('pta-chk-casco'),
                chkSenal: chk('pta-chk-señal'), chkRescate: chk('pta-chk-rescate')
            });
            closeModal('pta-modal');
        });
    }

    // Dashboard Update
    function updateDashboard() {
        const ins = JSON.parse(localStorage.getItem('sst_inspecciones')) || [];
        const c = document.getElementById('stat-ins-count');
        if (c) c.innerText = ins.length;
        const list = document.getElementById('recent-activity-list');
        if (list) list.innerHTML = ins.length ? ins.slice(-3).map(i => `<div class='p-2 bg-slate-50 rounded text-[10px]'>${i.tipo} - ${i.area}</div>`).join('') : '<p class="text-[10px] opacity-50">Sin actividad.</p>';
    }
    updateDashboard();

    // Final Setup
    const overlays = ['login-overlay', 'register-modal'];
    overlays.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); });

    console.log("SST v5.3.2: Sistema estabilizado.");
});
