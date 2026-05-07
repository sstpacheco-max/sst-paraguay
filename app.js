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
