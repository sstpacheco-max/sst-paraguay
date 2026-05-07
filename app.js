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
            btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Guardando...';
            lucide.createIcons();
            
            setTimeout(() => {
                btn.innerHTML = '<i data-lucide="check"></i> ¡Registrado!';
                btn.classList.add('bg-success');
                lucide.createIcons();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('bg-success');
                    form.reset();
                    lucide.createIcons();
                }, 2000);
            }, 1000);
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
