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
            const desc = document.getElementById('pdf-desc').value;
            const date = new Date().toLocaleDateString('es-PY');

            // Build PDF content
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 45, 123);
            doc.text("MINISTERIO DE TRABAJO, EMPLEO Y SEGURIDAD SOCIAL", 15, 20);
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Declaración Oficial de Accidente de Trabajo", 15, 30);
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de Reporte: ${date}`, 15, 45);
            
            doc.line(15, 50, 195, 50);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. DATOS DE LA EMPRESA", 15, 60);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Razón Social: ${empresa}`, 15, 70);
            doc.text(`R.U.C.: ${ruc}`, 15, 77);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. DATOS DEL TRABAJADOR", 15, 90);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Nombre y Apellido: ${trabajador}`, 15, 100);
            doc.text(`Cédula de Identidad: ${ci}`, 15, 107);
            
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("3. DESCRIPCIÓN DEL SUCESO", 15, 120);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            
            // split text to fit page
            const splitDesc = doc.splitTextToSize(desc, 180);
            doc.text(splitDesc, 15, 130);
            
            doc.line(15, 240, 80, 240);
            doc.text("Firma del Empleador / Representante", 15, 245);
            
            // Save PDF
            doc.save(`MTESS_Reporte_${ci}.pdf`);
            
            // Change button state to success
            const btn = mtessForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> PDF Generado';
            btn.classList.replace('bg-blue-600', 'bg-emerald-600');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-blue-600');
                mtessForm.reset();
                closeMtessFunc();
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
