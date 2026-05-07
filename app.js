document.addEventListener('DOMContentLoaded', () => {
    // Animate the Pulse Number
    animateValue(document.querySelector('.pulse-number'), 100, 142, 1500);

    // Form Submission
    const form = document.getElementById('novedad-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            // "Saving" state
            btn.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span> Procesando...';
            
            setTimeout(() => {
                btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ¡Registrado en MTESS!';
                btn.classList.replace('bg-primary', 'bg-emerald-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.replace('bg-emerald-600', 'bg-primary');
                    form.reset();
                    // Cerrar modal automáticamente
                    closeFunc();
                }, 2000);
            }, 1000);
        });
    }

    // Modal Logic
    const btnReportar = document.getElementById('btn-reportar');
    const modal = document.getElementById('incidente-modal');
    const closeModalBtn = document.getElementById('close-modal');

    const closeFunc = () => {
        if (!modal) return;
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    if(btnReportar && modal && closeModalBtn) {
        btnReportar.addEventListener('click', () => {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeModalBtn.addEventListener('click', closeFunc);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeFunc();
        });
    }

    // MTESS PDF Generator Logic
    const btnMtess = document.getElementById('btn-mtess');
    const mtessModal = document.getElementById('mtess-modal');
    const closeMtessBtn = document.getElementById('close-mtess-modal');
    const mtessForm = document.getElementById('mtess-form');

    const closeMtessFunc = () => {
        if (!mtessModal) return;
        mtessModal.classList.add('opacity-0');
        mtessModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            mtessModal.classList.add('hidden');
        }, 300);
    };

    if (btnMtess && mtessModal && closeMtessBtn) {
        btnMtess.addEventListener('click', () => {
            mtessModal.classList.remove('hidden');
            setTimeout(() => {
                mtessModal.classList.remove('opacity-0');
                mtessModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeMtessBtn.addEventListener('click', closeMtessFunc);
        mtessModal.addEventListener('click', (e) => {
            if (e.target === mtessModal) closeMtessFunc();
        });
    }

    if (mtessForm) {
        mtessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Access jsPDF from window
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('pdf-empresa').value;
            const ruc = document.getElementById('pdf-ruc').value;
            const trabajador = document.getElementById('pdf-trabajador').value;
            const ci = document.getElementById('pdf-ci').value;
            
            // Technical fields
            const cargo = document.getElementById('pdf-cargo').value;
            const antiguedad = document.getElementById('pdf-antiguedad').value;
            const fechaHora = document.getElementById('pdf-fecha').value;
            const lugar = document.getElementById('pdf-lugar').value;
            const agente = document.getElementById('pdf-agente').value;
            const zona = document.getElementById('pdf-zona').value;
            const epp = document.getElementById('pdf-epp').value;
            const fotoInput = document.getElementById('pdf-foto');
            
            const desc = document.getElementById('pdf-desc').value;
            const date = new Date().toLocaleDateString('es-PY');

            // Build PDF content
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 45, 123);
            doc.text("MINISTERIO DE TRABAJO, EMPLEO Y SEGURIDAD SOCIAL", 15, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Declaración Jurada de Accidentes Laborales", 15, 28);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de Emisión: ${date}`, 15, 38);
            
            doc.line(15, 42, 195, 42);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("1. DATOS DE LA EMPRESA", 15, 50);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Razón Social: ${empresa}`, 15, 58);
            doc.text(`N° Patronal MTESS / R.U.C.: ${ruc}`, 100, 58);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("2. DATOS DEL TRABAJADOR", 15, 70);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Nombre y Apellido: ${trabajador}`, 15, 78);
            doc.text(`C.I.: ${ci}`, 130, 78);
            doc.text(`Cargo / Ocupación: ${cargo}`, 15, 85);
            doc.text(`Antigüedad: ${antiguedad}`, 130, 85);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("3. DETALLES TÉCNICOS DEL ACCIDENTE", 15, 97);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            
            // Format datetime if provided
            let fechaHoraStr = fechaHora;
            if(fechaHora) {
                const dt = new Date(fechaHora);
                fechaHoraStr = dt.toLocaleString('es-PY');
            }
            
            doc.text(`Fecha y Hora del Evento: ${fechaHoraStr}`, 15, 105);
            doc.text(`Lugar Exacto: ${lugar}`, 100, 105);
            doc.text(`Agente Causante: ${agente}`, 15, 112);
            doc.text(`Zona Afectada: ${zona}`, 100, 112);
            doc.text(`Uso de EPP al momento: ${epp}`, 15, 119);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("4. DESCRIPCIÓN DEL SUCESO", 15, 131);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            
            // split text to fit page
            const splitDesc = doc.splitTextToSize(desc, 180);
            doc.text(splitDesc, 15, 139);
            
            let currentY = 139 + (splitDesc.length * 6);
            
            const finishPDF = () => {
                doc.line(15, 260, 80, 260);
                doc.text("Firma del Empleador / Representante", 15, 265);
                
                doc.line(110, 260, 175, 260);
                doc.text("Firma del Trabajador", 110, 265);
                
                // Save PDF
                doc.save(`MTESS_Reporte_${ci}.pdf`);
                
                // Change button state to success
                const btn = mtessForm.querySelector('button[type="submit"]');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Reporte Generado';
                btn.classList.replace('bg-blue-600', 'bg-emerald-600');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.replace('bg-emerald-600', 'bg-blue-600');
                    mtessForm.reset();
                    closeMtessFunc();
                }, 2500);
            };

            // Process image if exists
            if (fotoInput && fotoInput.files && fotoInput.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const imgData = event.target.result;
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.text("5. EVIDENCIA FOTOGRÁFICA", 15, currentY + 10);
                    
                    // Add image scaled
                    doc.addImage(imgData, 'JPEG', 15, currentY + 16, 120, 80);
                    finishPDF();
                };
                reader.readAsDataURL(fotoInput.files[0]);
            } else {
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.text("5. EVIDENCIA FOTOGRÁFICA: No adjunta.", 15, currentY + 10);
                finishPDF();
            }
        });
    }

    // EPP Modal Logic
    const btnEpp = document.getElementById('btn-epp');
    const eppModal = document.getElementById('epp-modal');
    const closeEppBtn = document.getElementById('close-epp-modal');
    const eppForm = document.getElementById('epp-form');

    const closeEppFunc = () => {
        if (!eppModal) return;
        eppModal.classList.add('opacity-0');
        eppModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => eppModal.classList.add('hidden'), 300);
    };

    if (btnEpp && eppModal && closeEppBtn) {
        btnEpp.addEventListener('click', () => {
            eppModal.classList.remove('hidden');
            setTimeout(() => {
                eppModal.classList.remove('opacity-0');
                eppModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeEppBtn.addEventListener('click', closeEppFunc);
        eppModal.addEventListener('click', (e) => {
            if (e.target === eppModal) closeEppFunc();
        });
    }

    if (eppForm) {
        eppForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const trabajador = document.getElementById('epp-trabajador').value;
            const ci = document.getElementById('epp-ci').value;
            const cargo = document.getElementById('epp-cargo').value;
            const equipos = document.getElementById('epp-equipos').value;
            const motivo = document.getElementById('epp-motivo').value;
            const date = new Date().toLocaleDateString('es-PY');

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("REGISTRO DE ENTREGA DE EQUIPOS DE PROTECCIÓN PERSONAL", 15, 20);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text("En cumplimiento de las disposiciones del Ministerio de Trabajo, Empleo y Seguridad Social", 15, 27);
            doc.text("y el Art. 277 del Código del Trabajo de la República del Paraguay.", 15, 32);
            
            doc.line(15, 36, 195, 36);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. DATOS DEL TRABAJADOR", 15, 45);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Nombre y Apellido: ${trabajador}`, 15, 53);
            doc.text(`Cédula de Identidad: ${ci}`, 120, 53);
            doc.text(`Cargo / Sector: ${cargo}`, 15, 60);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. DETALLE DE EQUIPOS ENTREGADOS", 15, 75);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Motivo de la entrega: ${motivo}`, 15, 83);
            doc.text(`Fecha de entrega: ${date}`, 120, 83);
            
            doc.setFont("helvetica", "bold");
            doc.text("Equipos proporcionados:", 15, 93);
            doc.setFont("helvetica", "normal");
            const splitEquipos = doc.splitTextToSize(equipos, 170);
            doc.text(splitEquipos, 15, 101);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            let yConstancia = 110 + (splitEquipos.length * 5);
            const constancia = "CONSTANCIA Y COMPROMISO: Hago constar que he recibido de la empresa los Equipos de Protección Personal (EPP) arriba descritos, los cuales se encuentran en buen estado y son adecuados. Me comprometo a utilizarlos de forma permanente durante mi jornada laboral, cuidarlos, mantenerlos y solicitar su reemplazo cuando presenten deterioro, asumiendo la responsabilidad en caso de accidente por no utilizarlos según normativas del MTESS.";
            const splitConstancia = doc.splitTextToSize(constancia, 175);
            doc.text(splitConstancia, 15, yConstancia);
            
            doc.line(30, yConstancia + 40, 90, yConstancia + 40);
            doc.setFont("helvetica", "bold");
            doc.text("Firma del Trabajador", 40, yConstancia + 45);
            doc.setFont("helvetica", "normal");
            doc.text(`Aclaración: ${trabajador}`, 30, yConstancia + 50);
            doc.text(`C.I.: ${ci}`, 30, yConstancia + 55);
            
            doc.line(110, yConstancia + 40, 170, yConstancia + 40);
            doc.setFont("helvetica", "bold");
            doc.text("Firma del Responsable SST", 115, yConstancia + 45);

            doc.save(`Acta_EPP_${ci}.pdf`);
            
            const btn = eppForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Generado';
            btn.classList.replace('bg-amber-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-amber-600');
                eppForm.reset();
                closeEppFunc();
            }, 2500);
        });
    }

    // CIPA Modal Logic
    const btnCipa = document.getElementById('btn-cipa');
    const cipaModal = document.getElementById('cipa-modal');
    const closeCipaBtn = document.getElementById('close-cipa-modal');
    const cipaForm = document.getElementById('cipa-form');

    const closeCipaFunc = () => {
        if (!cipaModal) return;
        cipaModal.classList.add('opacity-0');
        cipaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => cipaModal.classList.add('hidden'), 300);
    };

    if (btnCipa && cipaModal && closeCipaBtn) {
        btnCipa.addEventListener('click', () => {
            cipaModal.classList.remove('hidden');
            setTimeout(() => {
                cipaModal.classList.remove('opacity-0');
                cipaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeCipaBtn.addEventListener('click', closeCipaFunc);
        cipaModal.addEventListener('click', (e) => {
            if (e.target === cipaModal) closeCipaFunc();
        });
    }

    if (cipaForm) {
        cipaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const nro = document.getElementById('cipa-nro').value;
            const fecha = document.getElementById('cipa-fecha').value;
            const presi = document.getElementById('cipa-presi').value;
            const temas = document.getElementById('cipa-temas').value;
            const acuerdos = document.getElementById('cipa-acuerdos').value;

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(107, 33, 168); // Purple
            doc.text("COMISIÓN INTERNA DE PREVENCIÓN DE ACCIDENTES", 15, 20);
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`ACTA DE REUNIÓN - ${nro}`, 15, 30);
            
            doc.line(15, 35, 195, 35);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de la Reunión: ${fecha}`, 15, 45);
            doc.text(`Presidente de Sesión: ${presi}`, 15, 52);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. TEMAS TRATADOS EN LA SESIÓN", 15, 65);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const splitTemas = doc.splitTextToSize(temas, 175);
            doc.text(splitTemas, 15, 73);
            
            let yAcuerdos = 73 + (splitTemas.length * 6) + 10;
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. CONCLUSIONES Y ACUERDOS", 15, yAcuerdos);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const splitAcuerdos = doc.splitTextToSize(acuerdos, 175);
            doc.text(splitAcuerdos, 15, yAcuerdos + 8);
            
            let yFirmas = yAcuerdos + 8 + (splitAcuerdos.length * 6) + 40;
            
            doc.line(20, yFirmas, 80, yFirmas);
            doc.setFont("helvetica", "bold");
            doc.text("Presidente CIPA", 35, yFirmas + 5);
            
            doc.line(110, yFirmas, 170, yFirmas);
            doc.text("Secretario CIPA", 125, yFirmas + 5);
            
            doc.save(`Acta_CIPA_${nro.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = cipaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Acta Generada';
            btn.classList.replace('bg-purple-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-purple-600');
                cipaForm.reset();
                closeCipaFunc();
            }, 2500);
        });
    }

    // IPERC Modal Logic
    const btnIperc = document.getElementById('btn-iperc');
    const ipercModal = document.getElementById('iperc-modal');
    const closeIpercBtn = document.getElementById('close-iperc-modal');
    const ipercForm = document.getElementById('iperc-form');
    
    const prob = document.getElementById('iperc-prob');
    const sev = document.getElementById('iperc-sev');
    const nivelDiv = document.getElementById('iperc-nivel');
    
    const ipercPeligroSelect = document.getElementById('iperc-peligro-select');
    const ipercPeligro = document.getElementById('iperc-peligro');
    const ipercRiesgo = document.getElementById('iperc-riesgo');
    const ipercControl = document.getElementById('iperc-control');
    const btnAddPeligro = document.getElementById('btn-add-peligro');
    const ipercLista = document.getElementById('iperc-lista');
    let ipercHazards = [];

    const hazardDict = {
        "Ruido elevado": { riesgo: "Hipoacusia, estrés", control: "Uso de protector auditivo (tapón/copa), aislamiento acústico, pausas." },
        "Piso mojado / irregular": { riesgo: "Caída a nivel, contusiones", control: "Señalización, limpieza inmediata, calzado antideslizante." },
        "Partículas en proyección": { riesgo: "Lesión ocular, ceguera", control: "Uso de anteojos de seguridad Z87+, pantallas protectoras." },
        "Carga manual pesada": { riesgo: "Lumbalgia, hernias", control: "Uso de carritos, capacitación en levantamiento, pausas activas." },
        "Trabajos en altura": { riesgo: "Caída a distinto nivel, muerte", control: "Arnés de seguridad con doble cabo, línea de vida, barandas." },
        "Contacto eléctrico": { riesgo: "Electrocución, quemaduras", control: "Puesta a tierra, disyuntores diferenciales, guantes dieléctricos, bloqueo LOTO." },
        "Polvo en suspensión": { riesgo: "Neumoconiosis, alergias", control: "Uso de respiradores N95, sistema de extracción localizada." },
        "Posturas prolongadas": { riesgo: "Trastornos musculoesqueléticos", control: "Sillas ergonómicas, pausas activas cada 2 horas, rotación." }
    };

    if (ipercPeligroSelect) {
        ipercPeligroSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val && hazardDict[val]) {
                ipercPeligro.value = val;
                ipercRiesgo.value = hazardDict[val].riesgo;
                ipercControl.value = hazardDict[val].control;
            } else if (val === "Otro") {
                ipercPeligro.value = "";
                ipercRiesgo.value = "";
                ipercControl.value = "";
                ipercPeligro.focus();
            }
        });
    }

    const calculateNivel = () => {
        if (!prob || !sev || !nivelDiv) return;
        const p = parseInt(prob.value) || 1;
        const s = parseInt(sev.value) || 1;
        const result = p * s;
        let text = "";
        let bgColor = "";
        let textColor = "";

        if (result <= 2) {
            text = result + " - TRIVIAL / BAJO";
            bgColor = "bg-emerald-100";
            textColor = "text-emerald-800";
        } else if (result <= 4) {
            text = result + " - MODERADO";
            bgColor = "bg-amber-100";
            textColor = "text-amber-800";
        } else if (result == 6) {
            text = result + " - IMPORTANTE / ALTO";
            bgColor = "bg-orange-100";
            textColor = "text-orange-800";
        } else {
            text = result + " - INTOLERABLE / CRÍTICO";
            bgColor = "bg-rose-100";
            textColor = "text-rose-800";
        }

        nivelDiv.className = `w-full font-bold text-center rounded-lg px-2 py-2 text-sm ${bgColor} ${textColor}`;
        nivelDiv.innerText = text;
    };

    if (prob && sev) {
        prob.addEventListener('change', calculateNivel);
        sev.addEventListener('change', calculateNivel);
    }

    const renderHazardsList = () => {
        if (!ipercLista) return;
        if (ipercHazards.length === 0) {
            ipercLista.classList.add('hidden');
            ipercLista.innerHTML = "";
            return;
        }
        ipercLista.classList.remove('hidden');
        ipercLista.innerHTML = ipercHazards.map((h, i) => `
            <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-outline-variant/30 shadow-sm text-sm">
                <div>
                    <span class="font-bold text-slate-800">${h.peligro}</span>
                    <p class="text-xs text-slate-500">${h.riesgo} | Nivel: ${h.nivelText}</p>
                </div>
                <button type="button" onclick="window.removeHazard(${i})" class="text-rose-500 hover:text-rose-700 p-1">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        `).join('');
    };

    window.removeHazard = (index) => {
        ipercHazards.splice(index, 1);
        renderHazardsList();
    };

    if (btnAddPeligro) {
        btnAddPeligro.addEventListener('click', () => {
            if (!ipercPeligro.value || !ipercRiesgo.value || !ipercControl.value) {
                alert("Por favor complete el peligro, riesgo y medidas de control antes de añadir.");
                return;
            }
            const p = parseInt(prob.value) || 1;
            const s = parseInt(sev.value) || 1;
            ipercHazards.push({
                peligro: ipercPeligro.value,
                riesgo: ipercRiesgo.value,
                control: ipercControl.value,
                p: p,
                s: s,
                nivelText: nivelDiv.innerText
            });
            // Reset fields
            ipercPeligro.value = "";
            ipercRiesgo.value = "";
            ipercControl.value = "";
            if (ipercPeligroSelect) ipercPeligroSelect.value = "";
            prob.value = "1";
            sev.value = "1";
            calculateNivel();
            renderHazardsList();
        });
    }

    const closeIpercFunc = () => {
        if (!ipercModal) return;
        ipercModal.classList.add('opacity-0');
        ipercModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => ipercModal.classList.add('hidden'), 300);
    };

    if (btnIperc && ipercModal && closeIpercBtn) {
        btnIperc.addEventListener('click', () => {
            ipercModal.classList.remove('hidden');
            setTimeout(() => {
                ipercModal.classList.remove('opacity-0');
                ipercModal.querySelector('div').classList.remove('scale-95');
            }, 10);
            calculateNivel(); // initialize
        });

        closeIpercBtn.addEventListener('click', closeIpercFunc);
        ipercModal.addEventListener('click', (e) => {
            if (e.target === ipercModal) closeIpercFunc();
        });
    }

    if (ipercForm) {
        ipercForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (ipercHazards.length === 0) {
                alert("Debe añadir al menos 1 peligro a la matriz (Botón 'Añadir a la Matriz').");
                return;
            }
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({ orientation: "landscape" });
            
            const area = document.getElementById('iperc-area').value || 'N/A';
            const puesto = document.getElementById('iperc-puesto').value || 'N/A';
            const tarea = document.getElementById('iperc-tarea').value || 'N/A';
            const date = new Date().toLocaleDateString('es-PY');

            const drawHeaders = (y) => {
                doc.setFillColor(241, 245, 249);
                doc.rect(15, y, 265, 12, 'F');
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0, 0, 0);
                doc.text("ÁREA / SECTOR", 18, y + 8);
                doc.text("PUESTO / TAREA", 55, y + 8);
                doc.text("PELIGRO", 100, y + 8);
                doc.text("RIESGO ASOCIADO", 145, y + 8);
                doc.text("EVALUACIÓN", 190, y + 8);
                doc.text("MEDIDAS DE CONTROL", 225, y + 8);
            };

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(225, 29, 72);
            doc.text("MATRIZ DE IDENTIFICACIÓN DE PELIGROS Y EVALUACIÓN DE RIESGOS (IPERC)", 15, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text("Según metodología de evaluación y exigencias del Decreto 14.390/92 MTESS (Paraguay)", 15, 27);
            doc.text(`Fecha de Evaluación: ${date}`, 230, 27);
            
            doc.line(15, 30, 280, 30);
            drawHeaders(35);
            
            let currentY = 52;
            
            ipercHazards.forEach((h, index) => {
                if (currentY > 170) {
                    doc.line(15, 47, 15, currentY - 5);
                    doc.line(280, 47, 280, currentY - 5);
                    doc.line(15, currentY - 5, 280, currentY - 5);
                    
                    doc.addPage('landscape');
                    drawHeaders(15);
                    currentY = 32;
                }

                doc.setFontSize(9);
                const splitArea = doc.splitTextToSize(index === 0 ? area : '"', 32);
                const splitPuesto = doc.splitTextToSize(index === 0 ? `Puesto: ${puesto}\nTarea: ${tarea}` : '"', 40);
                const splitPeligro = doc.splitTextToSize(h.peligro, 40);
                const splitRiesgo = doc.splitTextToSize(h.riesgo, 40);
                const splitNivel = doc.splitTextToSize(`P:${h.p} | S:${h.s}\n${h.nivelText}`, 30);
                const splitControl = doc.splitTextToSize(h.control, 50);

                const lines = Math.max(splitPeligro.length, splitRiesgo.length, splitControl.length, splitNivel.length, splitPuesto.length);
                const rowHeight = lines * 4 + 4;

                doc.setFont("helvetica", "normal");
                doc.text(splitArea, 18, currentY);
                doc.text(splitPuesto, 55, currentY);
                doc.text(splitPeligro, 100, currentY);
                doc.text(splitRiesgo, 145, currentY);
                
                doc.setFont("helvetica", "bold");
                if ((h.p * h.s) >= 6) doc.setTextColor(220, 38, 38);
                doc.text(splitNivel, 190, currentY);
                doc.setTextColor(0, 0, 0);
                
                doc.setFont("helvetica", "normal");
                doc.text(splitControl, 225, currentY);

                // Grid lines for this row
                doc.line(15, currentY - 5, 280, currentY - 5); // top of row
                
                // Vertical lines
                doc.line(15, currentY - 5, 15, currentY + rowHeight - 5);
                doc.line(52, currentY - 5, 52, currentY + rowHeight - 5);
                doc.line(97, currentY - 5, 97, currentY + rowHeight - 5);
                doc.line(142, currentY - 5, 142, currentY + rowHeight - 5);
                doc.line(187, currentY - 5, 187, currentY + rowHeight - 5);
                doc.line(222, currentY - 5, 222, currentY + rowHeight - 5);
                doc.line(280, currentY - 5, 280, currentY + rowHeight - 5);

                currentY += rowHeight;
            });
            
            // Bottom line for last row
            doc.line(15, currentY - 5, 280, currentY - 5);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text("Documento generado automáticamente a través del Sistema Integrado SG-SST.", 15, currentY + 3);

            doc.save(`Matriz_IPERC_${puesto.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = ipercForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Matriz IPERC Generada';
            btn.classList.replace('bg-rose-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-rose-600');
                ipercForm.reset();
                ipercHazards = [];
                renderHazardsList();
                calculateNivel();
                closeIpercFunc();
            }, 2500);
        });
    }

    // Contingency Plan Modal Logic
    const btnContingencia = document.getElementById('btn-contingencia');
    const contingenciaModal = document.getElementById('contingencia-modal');
    const closeContingenciaBtn = document.getElementById('close-contingencia-modal');
    const contingenciaForm = document.getElementById('contingencia-form');

    const closeContingenciaFunc = () => {
        if (!contingenciaModal) return;
        contingenciaModal.classList.add('opacity-0');
        contingenciaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => contingenciaModal.classList.add('hidden'), 300);
    };

    if (btnContingencia && contingenciaModal && closeContingenciaBtn) {
        btnContingencia.addEventListener('click', () => {
            contingenciaModal.classList.remove('hidden');
            setTimeout(() => {
                contingenciaModal.classList.remove('opacity-0');
                contingenciaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeContingenciaBtn.addEventListener('click', closeContingenciaFunc);
        contingenciaModal.addEventListener('click', (e) => {
            if (e.target === contingenciaModal) closeContingenciaFunc();
        });
    }

    if (contingenciaForm) {
        contingenciaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('cont-empresa').value;
            const ruc = document.getElementById('cont-ruc').value;
            const direccion = document.getElementById('cont-direccion').value;
            const lider = document.getElementById('cont-lider').value;
            const tel = document.getElementById('cont-tel').value;
            const punto = document.getElementById('cont-punto').value;
            const date = new Date().toLocaleDateString('es-PY');

            // Cover Page
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 78, 216); // blue-700
            doc.text("PLAN DE CONTINGENCIA", 105, 50, null, null, "center");
            doc.text("Y EVACUACIÓN", 105, 62, null, null, "center");
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(`Empresa: ${empresa}`, 105, 90, null, null, "center");
            doc.text(`RUC: ${ruc}`, 105, 100, null, null, "center");
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text(`Dirección: ${direccion}`, 105, 115, null, null, "center");
            
            doc.setFontSize(10);
            doc.text(`Generado el: ${date}`, 105, 270, null, null, "center");
            
            // Page 2: Content
            doc.addPage();
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 78, 216);
            doc.text("1. OBJETIVO Y ALCANCE", 20, 20);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            const objText = `El presente Plan de Contingencia y Evacuación tiene como objetivo principal salvaguardar la vida y la integridad física de los trabajadores de ${empresa}, así como proteger los bienes materiales y el medio ambiente en caso de emergencias, en estricto cumplimiento del Decreto 14.390/92 del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS) de la República del Paraguay.`;
            doc.text(doc.splitTextToSize(objText, 170), 20, 30);
            
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 78, 216);
            doc.text("2. ROLES Y RESPONSABILIDADES", 20, 60);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text(`Líder de Brigada / Responsable: ${lider}`, 20, 70);
            doc.text(`Teléfono de Contacto: ${tel}`, 20, 77);
            doc.text("Responsabilidades:", 20, 87);
            doc.text("- Activar la alarma general de evacuación.", 25, 94);
            doc.text("- Coordinar con servicios de emergencia externos.", 25, 101);
            doc.text("- Dirigir la evacuación hacia el Punto de Encuentro.", 25, 108);
            doc.text("- Realizar el conteo final del personal evacuado.", 25, 115);

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 78, 216);
            doc.text("3. NÚMEROS DE EMERGENCIA NACIONAL (PARAGUAY)", 20, 135);
            
            doc.setFillColor(241, 245, 249);
            doc.rect(20, 142, 170, 35, 'F');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
            doc.text("Bomberos Voluntarios (CBVP):", 25, 152);
            doc.text("132", 150, 152);
            doc.text("Policía Nacional:", 25, 162);
            doc.text("911", 150, 162);
            doc.text("Emergencias Médicas (SEME):", 25, 172);
            doc.text("141", 150, 172);

            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(29, 78, 216);
            doc.text("4. PROCEDIMIENTO DE EVACUACIÓN", 20, 195);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            const procText = `Ante la señal de alarma, todo el personal debe abandonar sus tareas inmediatamente, desconectar equipos si es posible, y dirigirse por las rutas de evacuación señalizadas (color verde) de forma rápida pero sin correr. No utilice ascensores.`;
            doc.text(doc.splitTextToSize(procText, 170), 20, 205);
            
            doc.setFont("helvetica", "bold");
            doc.text(`PUNTO DE ENCUENTRO: ${punto}`, 20, 230);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text("Generado por Sistema Integrado SG-SST Paraguay.", 20, 280);

            doc.save(`Plan_Contingencia_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = contingenciaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Plan PDF Generado';
            btn.classList.replace('bg-blue-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-blue-600');
                contingenciaForm.reset();
                closeContingenciaFunc();
            }, 2500);
        });
    }

    // Politica SST Modal Logic
    const btnPolitica = document.getElementById('btn-politica');
    const politicaModal = document.getElementById('politica-modal');
    const closePoliticaBtn = document.getElementById('close-politica-modal');
    const politicaForm = document.getElementById('politica-form');

    const closePoliticaFunc = () => {
        if (!politicaModal) return;
        politicaModal.classList.add('opacity-0');
        politicaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => politicaModal.classList.add('hidden'), 300);
    };

    if (btnPolitica && politicaModal && closePoliticaBtn) {
        btnPolitica.addEventListener('click', () => {
            politicaModal.classList.remove('hidden');
            setTimeout(() => {
                politicaModal.classList.remove('opacity-0');
                politicaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closePoliticaBtn.addEventListener('click', closePoliticaFunc);
        politicaModal.addEventListener('click', (e) => {
            if (e.target === politicaModal) closePoliticaFunc();
        });
    }

    if (politicaForm) {
        politicaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('pol-empresa').value;
            const ruc = document.getElementById('pol-ruc').value;
            const autoridad = document.getElementById('pol-autoridad').value;
            const actividad = document.getElementById('pol-actividad').value;
            const date = new Date().toLocaleDateString('es-PY');

            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(67, 56, 202); // indigo-700
            doc.text("POLÍTICA DE SEGURIDAD Y", 105, 40, null, null, "center");
            doc.text("SALUD EN EL TRABAJO", 105, 52, null, null, "center");
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(empresa, 105, 70, null, null, "center");
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`RUC: ${ruc} | Actividad: ${actividad}`, 105, 78, null, null, "center");
            
            doc.line(20, 85, 190, 85);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            
            const p1 = `${empresa}, dedicada a la actividad de ${actividad}, asume el compromiso de proteger la integridad física, mental y social de todos sus colaboradores, contratistas y visitantes, proporcionando condiciones de trabajo seguras y saludables.`;
            doc.text(doc.splitTextToSize(p1, 170), 20, 100);

            const p2 = `Para cumplir con este propósito, la Alta Dirección se compromete a:`;
            doc.text(p2, 20, 125);
            
            doc.setFont("helvetica", "bold");
            doc.text("1. Cumplimiento Legal:", 25, 135);
            doc.setFont("helvetica", "normal");
            doc.text("Cumplir estrictamente con la legislación nacional vigente, en particular la Ley 5804/17 y el Decreto 14.390/92 del Ministerio de Trabajo, Empleo y Seguridad Social (MTESS), así como las normativas de IPS aplicables.", 30, 142, { maxWidth: 160 });

            doc.setFont("helvetica", "bold");
            doc.text("2. Prevención de Riesgos:", 25, 160);
            doc.setFont("helvetica", "normal");
            doc.text("Identificar los peligros, evaluar y valorar los riesgos, estableciendo los controles necesarios para prevenir accidentes de trabajo y enfermedades profesionales.", 30, 167, { maxWidth: 160 });

            doc.setFont("helvetica", "bold");
            doc.text("3. Mejora Continua:", 25, 185);
            doc.setFont("helvetica", "normal");
            doc.text("Mejorar continuamente el desempeño del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST).", 30, 192, { maxWidth: 160 });

            doc.setFont("helvetica", "bold");
            doc.text("4. Participación y Capacitación:", 25, 205);
            doc.setFont("helvetica", "normal");
            doc.text("Promover la consulta y participación activa de los trabajadores, garantizando su capacitación continua en materia de prevención de riesgos laborales.", 30, 212, { maxWidth: 160 });

            const p3 = `Esta política debe ser comunicada, entendida y aplicada por todo el personal de la empresa y estará disponible para las partes interesadas.`;
            doc.text(doc.splitTextToSize(p3, 170), 20, 235);
            
            doc.line(65, 265, 145, 265);
            doc.setFont("helvetica", "bold");
            doc.text(autoridad, 105, 272, null, null, "center");
            doc.setFont("helvetica", "normal");
            doc.text("Máxima Autoridad / Representante Legal", 105, 278, null, null, "center");

            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text(`Aprobado el: ${date}`, 20, 290);
            
            doc.save(`Politica_SST_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = politicaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Política Generada';
            btn.classList.replace('bg-indigo-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-indigo-600');
                politicaForm.reset();
                closePoliticaFunc();
            }, 2500);
        });
    }

    // POE Altura Modal Logic
    const btnAltura = document.getElementById('btn-altura');
    const alturaModal = document.getElementById('altura-modal');
    const closeAlturaBtn = document.getElementById('close-altura-modal');
    const alturaForm = document.getElementById('altura-form');

    const closeAlturaFunc = () => {
        if (!alturaModal) return;
        alturaModal.classList.add('opacity-0');
        alturaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => alturaModal.classList.add('hidden'), 300);
    };

    if (btnAltura && alturaModal && closeAlturaBtn) {
        btnAltura.addEventListener('click', () => {
            alturaModal.classList.remove('hidden');
            setTimeout(() => {
                alturaModal.classList.remove('opacity-0');
                alturaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeAlturaBtn.addEventListener('click', closeAlturaFunc);
        alturaModal.addEventListener('click', (e) => {
            if (e.target === alturaModal) closeAlturaFunc();
        });
    }

    if (alturaForm) {
        alturaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('alt-empresa').value;
            const responsable = document.getElementById('alt-responsable').value;
            const date = new Date().toLocaleDateString('es-PY');

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(14, 116, 144); // cyan-700
            doc.text("PROCEDIMIENTO OPERATIVO ESTANDARIZADO (POE)", 105, 30, null, null, "center");
            doc.setFontSize(16);
            doc.text("TRABAJOS EN ALTURAS (> 1.8m)", 105, 40, null, null, "center");
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text(`Empresa: ${empresa}`, 20, 60);
            doc.text(`Responsable SST: ${responsable}`, 20, 70);
            doc.text(`Fecha: ${date}`, 20, 80);
            
            doc.line(20, 85, 190, 85);

            doc.setFont("helvetica", "bold");
            doc.text("1. OBJETIVO", 20, 100);
            doc.setFont("helvetica", "normal");
            const objText = `Establecer las medidas preventivas y los pasos a seguir para garantizar la integridad física de los trabajadores que realicen tareas a una altura igual o superior a 1.8 metros, previniendo caídas a distinto nivel.`;
            doc.text(doc.splitTextToSize(objText, 170), 25, 110);

            doc.setFont("helvetica", "bold");
            doc.text("2. EQUIPOS DE PROTECCIÓN REQUERIDOS", 20, 135);
            doc.setFont("helvetica", "normal");
            doc.text("- Arnés de seguridad de cuerpo entero.", 25, 145);
            doc.text("- Cabo de vida doble con amortiguador de impacto.", 25, 155);
            doc.text("- Casco de seguridad con barbiquejo.", 25, 165);
            doc.text("- Calzado de seguridad antideslizante.", 25, 175);

            doc.setFont("helvetica", "bold");
            doc.text("3. PROCEDIMIENTO DE TRABAJO", 20, 195);
            doc.setFont("helvetica", "normal");
            doc.text("1. Inspeccionar el arnés y las eslingas antes de cada uso.", 25, 205);
            doc.text("2. Delimitar y señalizar el área de trabajo en el nivel inferior.", 25, 215);
            doc.text("3. Enganchar los mosquetones a un punto de anclaje firme por encima del hombro.", 25, 225);
            doc.text("4. Mantener siempre al menos un mosquetón anclado durante el desplazamiento.", 25, 235);
            doc.text("5. Suspender las tareas en caso de lluvia, tormenta eléctrica o vientos fuertes.", 25, 245);

            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text("Generado por Sistema Integrado SG-SST Paraguay.", 20, 280);

            doc.save(`POE_Alturas_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = alturaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Generado';
            btn.classList.replace('bg-cyan-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-cyan-600');
                alturaForm.reset();
                closeAlturaFunc();
            }, 2500);
        });
    }

    // Procedimiento Auditoria Modal Logic
    const btnAuditoria = document.getElementById('btn-auditoria');
    const auditoriaModal = document.getElementById('auditoria-modal');
    const closeAuditoriaBtn = document.getElementById('close-auditoria-modal');
    const auditoriaForm = document.getElementById('auditoria-form');

    const closeAuditoriaFunc = () => {
        if (!auditoriaModal) return;
        auditoriaModal.classList.add('opacity-0');
        auditoriaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => auditoriaModal.classList.add('hidden'), 300);
    };

    if (btnAuditoria && auditoriaModal && closeAuditoriaBtn) {
        btnAuditoria.addEventListener('click', () => {
            auditoriaModal.classList.remove('hidden');
            setTimeout(() => {
                auditoriaModal.classList.remove('opacity-0');
                auditoriaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeAuditoriaBtn.addEventListener('click', closeAuditoriaFunc);
        auditoriaModal.addEventListener('click', (e) => {
            if (e.target === auditoriaModal) closeAuditoriaFunc();
        });
    }

    if (auditoriaForm) {
        auditoriaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('aud-empresa').value;
            const lider = document.getElementById('aud-lider').value;
            const date = new Date().toLocaleDateString('es-PY');

            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(15, 118, 110); // teal-700
            doc.text("PROCEDIMIENTO DE AUDITORÍA INTERNA", 105, 30, null, null, "center");
            doc.setFontSize(14);
            doc.text("SISTEMA DE GESTIÓN SST", 105, 40, null, null, "center");
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "normal");
            doc.text(`Empresa: ${empresa}`, 20, 60);
            doc.text(`Auditor Líder: ${lider}`, 20, 70);
            doc.text(`Fecha: ${date}`, 20, 80);
            
            doc.line(20, 85, 190, 85);

            doc.setFont("helvetica", "bold");
            doc.text("1. OBJETIVO", 20, 100);
            doc.setFont("helvetica", "normal");
            const objText = `Definir la metodología para la planificación, ejecución y reporte de las auditorías internas del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), para determinar su eficacia y nivel de cumplimiento normativo.`;
            doc.text(doc.splitTextToSize(objText, 170), 25, 110);

            doc.setFont("helvetica", "bold");
            doc.text("2. FASES DE LA AUDITORÍA", 20, 135);
            doc.setFont("helvetica", "normal");
            doc.text("A) Planificación: Elaboración y aprobación del Plan de Auditoría anual.", 25, 145);
            doc.text("B) Ejecución: Reunión de apertura, revisión documental, entrevistas y visita a planta.", 25, 155);
            doc.text("C) Cierre: Reunión de cierre y presentación de hallazgos preliminares.", 25, 165);
            doc.text("D) Reporte: Emisión del Informe Final de Auditoría y No Conformidades.", 25, 175);

            doc.setFont("helvetica", "bold");
            doc.text("3. CRITERIOS DE AUDITORÍA", 20, 195);
            doc.setFont("helvetica", "normal");
            doc.text("- Decreto N° 14.390/92: Reglamento General Técnico de Seguridad y Medicina.", 25, 205);
            doc.text("- Ley N° 5.804/17: Sistema Nacional de Prevención de Riesgos Laborales.", 25, 215);
            doc.text("- Resoluciones vigentes del Ministerio de Trabajo (MTESS).", 25, 225);
            doc.text("- Resoluciones del Instituto de Previsión Social (IPS).", 25, 235);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.text("Generado por Sistema Integrado SG-SST Paraguay.", 20, 280);

            doc.save(`Proc_Auditoria_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            const btn = auditoriaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Generado';
            btn.classList.replace('bg-teal-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-teal-600');
                auditoriaForm.reset();
                closeAuditoriaFunc();
            }, 2500);
        });
    }
});

// Helper for counting up numbers
function animateValue(obj, start, end, duration) {
    if(!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        obj.innerHTML = Math.floor(ease * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
