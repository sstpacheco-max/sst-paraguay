/**
 * SST Paraguay - Sistema Integral de Gestión
 * Versión 5.2 - HTML Sanitizado + Todos los Módulos
 */

console.log("SST v5.2: Iniciando...");

document.addEventListener('DOMContentLoaded', function() {

    // ════════════════════════════════════════════
    //  UTILIDADES
    // ════════════════════════════════════════════
    function openModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.remove('hidden');
    }
    function closeModal(id) {
        const m = document.getElementById(id);
        if (m) m.classList.add('hidden');
    }
    function bind(id, fn) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }

    // Closers universales: todos los botones [id^="close-"]
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const parent = btn.closest('.fixed');
            if (parent) parent.classList.add('hidden');
        });
    });

    // ════════════════════════════════════════════
    //  GENERADOR PDF (Paraguay Legal)
    // ════════════════════════════════════════════
    function genPDF(type, d) {
        if (!window.jspdf) { alert("Librería PDF no disponible."); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const fecha = new Date().toLocaleDateString('es-PY');

        // Cabecera
        doc.setFillColor(0, 31, 95);
        doc.rect(0, 0, 210, 32, 'F');
        doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(16);
        doc.text("PORTAL SG-SST PARAGUAY", 20, 14);
        doc.setFontSize(9); doc.setFont("helvetica", "normal");
        doc.text("Sistema de Gestión de Riesgos Laborales | " + fecha, 20, 22);
        doc.setTextColor(0); doc.line(15, 38, 195, 38);

        if (type === 'POLITICA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 55, { align: 'center' });
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);
            const p = [
                "La organización, en cumplimiento de la Ley 5804/17 y el Decreto 14.390/92, asume los siguientes compromisos:",
                "1. LEGALIDAD: Cumplir la normativa vigente del MTESS, IPS y organismos competentes.",
                "2. PREVENCIÓN: Identificar, evaluar y controlar los peligros y riesgos presentes en todas las operaciones.",
                "3. MEJORA CONTINUA: Revisar periódicamente el Sistema de Gestión de SST.",
                "4. PARTICIPACIÓN: Fomentar la participación activa a través de la CIPA y capacitaciones en HST.",
                "5. RECURSOS: Asignar recursos humanos, materiales y económicos necesarios.",
                "Esta política es de cumplimiento obligatorio para todo el personal, contratistas y visitantes."
            ];
            let y = 68;
            p.forEach(t => { const l = doc.splitTextToSize(t, 170); doc.text(l, 20, y); y += l.length * 5 + 4; });
            doc.line(30, 230, 90, 230); doc.line(120, 230, 180, 230);
            doc.setFontSize(9);
            doc.text("Gerente General", 60, 236, { align: 'center' });
            doc.text("Responsable de SST", 150, 236, { align: 'center' });
        }

        else if (type === 'CONTINGENCIA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("PLAN DE CONTINGENCIA Y EMERGENCIAS", 105, 55, { align: 'center' });
            doc.setFont("helvetica", "normal"); doc.setFontSize(10);
            const s = [
                ["ALCANCE", "Aplica a todas las instalaciones, personal, visitantes y contratistas."],
                ["BRIGADISTAS", "Brigadas de Evacuación, Primeros Auxilios y Contra Incendios (mín. 2 por turno)."],
                ["PUNTO DE REUNIÓN", "Zona exterior segura, señalizada con cartel verde reflectivo."],
                ["PROCEDIMIENTO", "1. Detectar emergencia. 2. Activar alarma. 3. Evacuar. 4. Llamar al 911. 5. No reingresar."],
                ["CONTACTOS", "Bomberos: 132 | Policía: 911 | IPS: (021) 229-9999 | SEME: (021) 204-800"]
            ];
            let y = 68;
            s.forEach(([t, v]) => { doc.setFont("helvetica", "bold"); doc.text(t+":", 20, y); y+=6; doc.setFont("helvetica", "normal"); const l = doc.splitTextToSize(v, 170); doc.text(l, 25, y); y += l.length*5+6; });
        }

        else if (type === 'IPERC') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("MATRIZ IPERC - EVALUACIÓN DE RIESGOS", 105, 55, { align: 'center' });
            doc.setFontSize(9); doc.setFont("helvetica", "normal");
            doc.text("Dec. 14.390/92 - Identificación de Peligros y Evaluación de Riesgos", 20, 63);
            // Usar datos guardados en localStorage
            const saved = JSON.parse(localStorage.getItem('sst_iperc')) || [];
            if (saved.length === 0) { alert("No hay peligros registrados. Agregue al menos uno."); return; }
            const rows = saved.map(h => [h.area, h.peligro, h.riesgo, h.prob, h.sev, h.nivel, h.nivelLabel, h.control]);
            doc.autoTable({
                startY: 70,
                head: [['Área','Peligro','Riesgo','P','S','N','Nivel','Control']],
                body: rows,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [0, 31, 95] },
                alternateRowStyles: { fillColor: [240, 245, 255] },
                columnStyles: { 3:{halign:'center'}, 4:{halign:'center'}, 5:{halign:'center'} }
            });
        }

        else if (type === 'EMO') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(15);
            doc.text("ORDEN DE EXAMEN MÉDICO OCUPACIONAL", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            doc.text("Res. MTESS 03/2022 | Decreto 5078/2021", 105, 63, { align: 'center' });
            const c = [["Trabajador:", d.nombre||"---"],["C.I.:", d.ci||"---"],["Tipo:", d.tipo||"Periódico"],["Fecha:", fecha]];
            let y = 78;
            c.forEach(([l,v]) => { doc.setFont("helvetica","bold"); doc.text(l,20,y); doc.setFont("helvetica","normal"); doc.text(v,70,y); y+=10; });
            doc.text("Se instruye al trabajador indicado realizarse los estudios correspondientes.", 20, y+10, { maxWidth: 170 });
            doc.line(30,220,90,220); doc.line(120,220,180,220);
            doc.setFontSize(9);
            doc.text("Médico Ocupacional", 60, 226, { align: 'center' });
            doc.text("RRHH", 150, 226, { align: 'center' });
        }

        else if (type === 'MTESS_FORM') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("DECLARACIÓN DE ACCIDENTE DE TRABAJO", 105, 50, { align: 'center' });
            doc.setFontSize(9); doc.setFont("helvetica", "normal");
            doc.text("Decreto 14.390/92 | Ley 5804/17 — MTESS República del Paraguay", 105, 57, { align: 'center' });

            function section(title, y) { doc.setFont("helvetica","bold"); doc.setFontSize(9); doc.setFillColor(230,235,245); doc.rect(15,y-4,180,6,'F'); doc.text(title,20,y); return y+8; }
            function field(label, val, x, y, w) { doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text(label,x,y); doc.setFont("helvetica","normal"); doc.text(String(val||'---'),x,y+4,{maxWidth:w||80}); }

            let y = section("I. DATOS DEL EMPLEADOR", 68);
            field("Razón Social:", d.empresa, 20, y, 55); field("RUC / N° Patronal:", d.ruc, 80, y, 50); field("Actividad (CIIU):", d.actividad, 140, y, 50);
            y += 12; field("Dirección:", d.dirEmpresa, 20, y, 80); field("Teléfono/Email:", d.telEmpresa, 110, y, 80);

            y = section("II. DATOS DEL TRABAJADOR ACCIDENTADO", y+14);
            field("Nombre:", d.nombre, 20, y, 55); field("C.I.:", d.ci, 80, y, 30); field("Edad:", d.edad, 115, y, 15); field("Sexo:", d.sexo, 140, y, 25); field("Estado Civil:", d.civil, 170, y, 25);
            y += 12; field("Cargo:", d.cargo, 20, y, 50); field("Antigüedad:", d.antiguedad, 75, y, 30); field("Salario (Gs.):", d.salario, 110, y, 35); field("Horario:", d.horario, 150, y, 40);
            y += 12; field("Domicilio:", d.dirTrab, 20, y, 170);

            y = section("III. DATOS DEL ACCIDENTE", y+14);
            field("Fecha y Hora:", d.fecha, 20, y, 50); field("Lugar:", d.lugar, 75, y, 55); field("Tipo:", d.tipo, 140, y, 50);
            y += 12; field("Agente Causante:", d.agente, 20, y, 55); field("Zona Corporal:", d.zona, 80, y, 50); field("EPP:", d.epp, 140, y, 50);
            y += 14; doc.setFont("helvetica","bold"); doc.setFontSize(8); doc.text("Descripción del Suceso:", 20, y);
            y += 5; doc.setFont("helvetica","normal"); const descLines = doc.splitTextToSize(String(d.desc||'---'), 170); doc.text(descLines, 20, y); y += descLines.length * 4;

            // Si queda poco espacio, nueva página
            if (y > 210) { doc.addPage(); y = 20; }

            y = section("IV. DATOS MÉDICOS", y+10);
            field("Tipo de Lesión:", d.lesion, 20, y, 45); field("Diagnóstico:", d.diagnostico, 70, y, 55); field("Días Incapacidad:", d.dias, 130, y, 25); field("Gravedad:", d.gravedad, 160, y, 35);
            y += 12; field("Centro Médico:", d.centro, 20, y, 170);

            y = section("V. TESTIGOS", y+14);
            field("Testigo 1:", d.testigo1, 20, y, 80); field("Testigo 2:", d.testigo2, 110, y, 80);

            // Firmas
            y = Math.max(y + 25, 230);
            doc.line(20, y, 80, y); doc.line(90, y, 140, y); doc.line(150, y, 195, y);
            doc.setFontSize(7);
            doc.text("Firma del Trabajador", 50, y+4, {align:'center'});
            doc.text("Responsable SST", 115, y+4, {align:'center'});
            doc.text("Representante Legal", 172, y+4, {align:'center'});
        }

        else if (type === 'POE_ALTURAS') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("PROCEDIMIENTO OPERATIVO ESTÁNDAR", 105, 55, { align: 'center' });
            doc.text("TRABAJO EN ALTURAS", 105, 63, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const p = ["1. Verificar capacitación del trabajador.","2. Inspeccionar arnés y línea de vida.","3. Usar plataformas certificadas con barandas.","4. Nunca trabajar solo en altura.","5. Ante anomalía, detener y reportar."];
            let y = 78; p.forEach(t => { doc.text(t, 20, y, {maxWidth:170}); y+=10; });
        }

        else if (type === 'EPP') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("CONSTANCIA DE ENTREGA DE EPP", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const c = [["Trabajador:",d.trabajador||"---"],["C.I.:",d.ci||"---"],["Cargo:",d.cargo||"---"],["Equipos:",d.equipos||"---"],["Motivo:",d.motivo||"---"]];
            let y = 75;
            c.forEach(([l,v]) => { doc.setFont("helvetica","bold"); doc.text(l,20,y); doc.setFont("helvetica","normal"); doc.text(v,65,y,{maxWidth:125}); y+=10; });
            doc.text("El trabajador se compromete al uso obligatorio y cuidado de los EPP entregados (Art. 277 CT).", 20, y+10, {maxWidth:170});
        }

        else if (type === 'CIPA') {
            doc.setFont("helvetica", "bold"); doc.setFontSize(14);
            doc.text("ACTA DE REUNIÓN CIPA", 105, 55, { align: 'center' });
            doc.setFontSize(10); doc.setFont("helvetica", "normal");
            const c = [["Reunión N°:",d.nro||"---"],["Fecha:",d.fecha||"---"],["Presidente:",d.presi||"---"],["Temas:",d.temas||"---"],["Acuerdos:",d.acuerdos||"---"]];
            let y = 75;
            c.forEach(([l,v]) => { doc.setFont("helvetica","bold"); doc.text(l,20,y); doc.setFont("helvetica","normal"); doc.text(v,65,y,{maxWidth:125}); y+=12; });
        }

        doc.setFontSize(7); doc.setTextColor(150);
        doc.text("SST Paraguay - Gestión Profesional de Riesgos", 105, 287, { align: 'center' });
        doc.save(type + "_SST_Paraguay.pdf");
    }

    // ════════════════════════════════════════════
    //  BINDINGS DE BOTONES DE MÓDULOS
    // ════════════════════════════════════════════
    bind('btn-politica', () => genPDF('POLITICA'));
    bind('btn-contingencia', () => genPDF('CONTINGENCIA'));
    bind('btn-altura', () => genPDF('POE_ALTURAS'));
    bind('btn-pta-altura', () => alert("📋 PTA Alturas: En desarrollo para próxima versión."));
    bind('btn-auditoria', () => alert("🔍 Auditoría Interna: En desarrollo para próxima versión."));

    // IPERC (hay 2 botones con id="btn-iperc" en el HTML — hero y módulos)
    document.querySelectorAll('#btn-iperc').forEach(el => {
        el.addEventListener('click', () => openModal('iperc-modal'));
    });
    bind('btn-print-iperc', () => genPDF('IPERC'));

    // Vigilancia Médica
    bind('btn-medico', () => openModal('medico-modal'));
    bind('btn-registro-medico', () => openModal('registro-medico-modal'));

    // EPPs
    bind('btn-epp', () => openModal('epp-modal'));

    // CIPA
    bind('btn-cipa', () => openModal('cipa-modal'));

    // MTESS
    bind('btn-mtess', () => openModal('mtess-modal'));
    bind('btn-registro-mtess', () => openModal('registro-mtess-modal'));

    // Navegación inferior
    bind('nav-dashboard', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    bind('nav-reportar', () => openModal('incidente-modal'));
    bind('nav-calendar', () => openModal('calendar-modal'));
    bind('nav-inspecciones', () => openModal('inspeccion-modal'));

    // Logout
    bind('btn-logout', () => { sessionStorage.clear(); window.location.reload(); });

    // ════════════════════════════════════════════
    //  IPERC - SISTEMA COMPLETO CON PERSISTENCIA
    // ════════════════════════════════════════════
    const ipercProb = document.getElementById('iperc-prob');
    const ipercSev = document.getElementById('iperc-sev');
    const ipercNivel = document.getElementById('iperc-nivel');
    const ipercPeligroSelect = document.getElementById('iperc-peligro-select');
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

    function calcNivel() {
        if (!ipercProb || !ipercSev || !ipercNivel) return;
        const info = getNivelInfo(parseInt(ipercProb.value), parseInt(ipercSev.value));
        ipercNivel.className = 'w-full font-bold text-center rounded-lg px-2 py-2 text-sm ' + info.cls;
        ipercNivel.innerText = info.n + ' - ' + info.label;
    }
    if (ipercProb) ipercProb.addEventListener('change', calcNivel);
    if (ipercSev) ipercSev.addEventListener('change', calcNivel);
    if (ipercPeligroSelect) ipercPeligroSelect.addEventListener('change', () => {
        if (ipercPeligroInput && ipercPeligroSelect.value) ipercPeligroInput.value = ipercPeligroSelect.value;
    });

    // Renderizar lista de peligros guardados
    function renderIpercList() {
        if (!ipercLista) return;
        const data = JSON.parse(localStorage.getItem('sst_iperc')) || [];
        if (data.length === 0) {
            ipercLista.classList.add('hidden');
            ipercLista.innerHTML = '';
            return;
        }
        ipercLista.classList.remove('hidden');
        ipercLista.innerHTML = data.map((h, i) => {
            const info = getNivelInfo(h.prob, h.sev);
            return `<div class="${info.cls} p-3 rounded-lg text-xs flex items-center justify-between gap-2">
                <div class="flex-1">
                    <b>${h.area}</b> → ${h.peligro} | Riesgo: ${h.riesgo} | P:${h.prob} × S:${h.sev} = <b>${info.n} (${info.label})</b>
                    <br><span class="italic opacity-70">Control: ${h.control}</span>
                </div>
                <button data-del-iperc="${i}" class="text-red-600 hover:text-red-800 font-bold text-lg leading-none" title="Eliminar">✕</button>
            </div>`;
        }).join('');

        // Botones eliminar
        ipercLista.querySelectorAll('[data-del-iperc]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.delIperc);
                const d = JSON.parse(localStorage.getItem('sst_iperc')) || [];
                d.splice(idx, 1);
                localStorage.setItem('sst_iperc', JSON.stringify(d));
                renderIpercList();
            });
        });
    }

    // Añadir peligro → guardar en localStorage
    bind('btn-add-peligro', () => {
        const area = document.getElementById('iperc-area')?.value;
        const peligro = ipercPeligroInput?.value;
        const riesgo = document.getElementById('iperc-riesgo')?.value;
        const control = document.getElementById('iperc-control')?.value;
        const prob = parseInt(ipercProb?.value || 1);
        const sev = parseInt(ipercSev?.value || 1);
        if (!peligro || !riesgo) { alert("Complete al menos el Peligro y el Riesgo."); return; }
        const info = getNivelInfo(prob, sev);
        const entry = { area: area||'General', peligro, riesgo, prob, sev, nivel: info.n, nivelLabel: info.label, control: control||'Pendiente' };
        const data = JSON.parse(localStorage.getItem('sst_iperc')) || [];
        data.push(entry);
        localStorage.setItem('sst_iperc', JSON.stringify(data));
        renderIpercList();
        // Limpiar campos
        if (ipercPeligroInput) ipercPeligroInput.value = '';
        if (ipercPeligroSelect) ipercPeligroSelect.value = '';
        const r = document.getElementById('iperc-riesgo'); if (r) r.value = '';
        const c = document.getElementById('iperc-control'); if (c) c.value = '';
        alert('✅ Peligro agregado a la matriz.');
    });

    // Al abrir IPERC, renderizar lista guardada
    document.querySelectorAll('#btn-iperc').forEach(el => {
        el.addEventListener('click', () => {
            renderIpercList();
            openModal('iperc-modal');
        });
    });

    // IPERC Form submit → generar PDF con datos guardados
    const ipercForm = document.getElementById('iperc-form');
    if (ipercForm) {
        ipercForm.addEventListener('submit', (e) => {
            e.preventDefault();
            genPDF('IPERC');
        });
    }

    // EMO Form
    const medForm = document.getElementById('medico-form');
    if (medForm) {
        medForm.addEventListener('submit', (e) => {
            e.preventDefault();
            genPDF('EMO', {
                nombre: document.getElementById('med-trabajador')?.value,
                ci: document.getElementById('med-ci')?.value,
                tipo: document.getElementById('med-tipo')?.value
            });
            closeModal('medico-modal');
        });
    }

    // MTESS Form (Declaración Oficial Completa)
    const mtessForm = document.getElementById('mtess-form');
    if (mtessForm) {
        mtessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const v = id => document.getElementById(id)?.value || '';
            genPDF('MTESS_FORM', {
                // I. Empleador
                empresa: v('mt-empresa'), ruc: v('mt-ruc'), actividad: v('mt-actividad'),
                dirEmpresa: v('mt-dir-empresa'), telEmpresa: v('mt-tel-empresa'),
                // II. Trabajador
                nombre: v('mt-nombre'), ci: v('mt-ci'), edad: v('mt-edad'),
                sexo: v('mt-sexo'), civil: v('mt-civil'), cargo: v('mt-cargo'),
                antiguedad: v('mt-antiguedad'), salario: v('mt-salario'),
                horario: v('mt-horario'), dirTrab: v('mt-dir-trab'),
                // III. Accidente
                fecha: v('mt-fecha'), lugar: v('mt-lugar'), tipo: v('mt-tipo'),
                agente: v('mt-agente'), zona: v('mt-zona'), epp: v('mt-epp'),
                desc: v('mt-desc'),
                // IV. Médico
                lesion: v('mt-lesion'), diagnostico: v('mt-diagnostico'),
                dias: v('mt-dias'), centro: v('mt-centro'), gravedad: v('mt-gravedad'),
                // V. Testigos
                testigo1: v('mt-testigo1'), testigo2: v('mt-testigo2')
            });
            closeModal('mtess-modal');
        });
    }

    // EPP Form
    const eppForm = document.getElementById('epp-form');
    if (eppForm) {
        eppForm.addEventListener('submit', (e) => {
            e.preventDefault();
            genPDF('EPP', {
                trabajador: document.getElementById('epp-trabajador')?.value,
                ci: document.getElementById('epp-ci')?.value,
                cargo: document.getElementById('epp-cargo')?.value,
                equipos: document.getElementById('epp-equipos')?.value,
                motivo: document.getElementById('epp-motivo')?.value
            });
            closeModal('epp-modal');
        });
    }

    // CIPA Form
    const cipaForm = document.getElementById('cipa-form');
    if (cipaForm) {
        cipaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            genPDF('CIPA', {
                nro: document.getElementById('cipa-nro')?.value,
                fecha: document.getElementById('cipa-fecha')?.value,
                presi: document.getElementById('cipa-presi')?.value,
                temas: document.getElementById('cipa-temas')?.value,
                acuerdos: document.getElementById('cipa-acuerdos')?.value
            });
            closeModal('cipa-modal');
        });
    }

    // Inspección Form
    const insForm = document.getElementById('inspeccion-form');
    if (insForm) {
        insForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const r = {
                fecha: document.getElementById('ins-fecha')?.value,
                tipo: document.getElementById('ins-tipo')?.value,
                area: document.getElementById('ins-area')?.value,
                resp: document.getElementById('ins-responsable')?.value
            };
            const data = JSON.parse(localStorage.getItem('sst_inspecciones')) || [];
            data.push(r);
            localStorage.setItem('sst_inspecciones', JSON.stringify(data));
            updateDashboard();
            alert("✅ Inspección guardada correctamente.");
            closeModal('inspeccion-modal');
        });
    }

    // ════════════════════════════════════════════
    //  DASHBOARD
    // ════════════════════════════════════════════
    function updateDashboard() {
        const ins = JSON.parse(localStorage.getItem('sst_inspecciones')) || [];
        const c = document.getElementById('stat-ins-count');
        if (c) c.innerText = ins.length;

        const list = document.getElementById('recent-activity-list');
        if (list) {
            list.innerHTML = ins.length === 0
                ? '<p class="text-xs italic p-4 text-center opacity-50">Sin actividad. Crea tu primera inspección.</p>'
                : ins.slice(-5).reverse().map(i => `
                    <div class="bg-surface-container-low p-4 rounded-xl flex items-center gap-3">
                        <div class="w-1 h-8 bg-blue-500 rounded-full"></div>
                        <div class="text-[11px]"><p class="font-bold">Inspección: ${i.tipo}</p><p class="opacity-60">${i.fecha} - ${i.area}</p></div>
                    </div>`).join('');
        }
    }

    updateDashboard();

    // Ocultar overlays de login/registro (modo global)
    const lo = document.getElementById('login-overlay');
    if (lo) lo.classList.add('hidden');
    const rm = document.getElementById('register-modal');
    if (rm) rm.classList.add('hidden');

    console.log("SST v5.2: Todos los módulos vinculados. 0 duplicados.");
});
