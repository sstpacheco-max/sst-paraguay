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
