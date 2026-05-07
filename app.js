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
