/**
 * SST Paraguay - Sistema de Gestión SST
 * Versión 4.6 - Cumplimiento Legal Paraguay (Dec. 14390/92)
 */

console.log("SST: Sistema v4.6 (Legal PY) Iniciando...");

document.addEventListener('DOMContentLoaded', function() {
    
    // --- ESTADO ---
    let currentUser = null;
    try { currentUser = JSON.parse(sessionStorage.getItem('sst_current_user')); } catch(e){}

    const modals = {
        iperc: document.getElementById('iperc-modal'),
        ins: document.getElementById('inspeccion-modal'),
        mtess: document.getElementById('mtess-modal'),
        med: document.getElementById('medico-modal'),
        regMed: document.getElementById('registro-medico-modal'),
        regMtess: document.getElementById('registro-mtess-modal')
    };

    // --- FUNCIONES LEGALES ---

    function getIpercData() {
        const risk = currentUser ? currentUser.risk : 'Medio';
        // Basado en Matriz de Probabilidad x Severidad
        return [
            { id: 1, p: 'Caídas al mismo nivel', r: 'Mecánico', prob: 2, sev: 2, nivel: 'Moderado', c: 'Orden y Limpieza Constante' },
            { id: 2, p: 'Contacto Eléctrico', r: 'Físico', prob: 1, sev: 3, nivel: risk === 'Alto' ? 'Crítico' : 'Alto', c: 'Mantenimiento Preventivo Trimestral' },
            { id: 3, p: 'Posturas Forzadas', r: 'Ergonómico', prob: 3, sev: 1, nivel: 'Leve', c: 'Pausas Activas cada 2 horas' }
        ];
    }

    function generateParaguayPDF(type, customData = {}) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const company = currentUser ? currentUser.company : "EMPRESA NO REGISTRADA";
        const ruc = currentUser ? currentUser.ruc : "800XXXXX-X";

        // Encabezado Legal
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text("REPÚBLICA DEL PARAGUAY", 105, 15, { align: 'center' });
        doc.text("SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO", 105, 20, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);

        if (type === 'POLITICA') {
            doc.setFontSize(16);
            doc.text("POLÍTICA NACIONAL DE SEGURIDAD Y SALUD", 105, 40, { align: 'center' });
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const text = `La empresa ${company}, con RUC ${ruc}, en cumplimiento con la Ley 5804/17 y el Decreto 14.390/92, se compromete a:\n\n1. Garantizar la salud y seguridad de todos los trabajadores.\n2. Cumplir con las normativas vigentes del MTESS y el IPS.\n3. Promover la prevención de riesgos laborales en todos los niveles.\n4. Proveer los Equipos de Protección Individual (EPI) necesarios.\n5. Fomentar la participación activa de la Comisión Interna (CIPA).`;
            doc.text(text, 20, 60, { maxWidth: 170 });
        } 
        
        else if (type === 'IPERC') {
            doc.setFontSize(16);
            doc.text("MATRIZ DE IDENTIFICACIÓN DE PELIGROS (IPERC)", 105, 40, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Empresa: ${company} | RUC: ${ruc}`, 20, 50);
            
            const data = getIpercData();
            const rows = data.map(d => [d.p, d.r, d.prob, d.sev, d.nivel, d.c]);
            
            doc.autoTable({
                startY: 60,
                head: [['Peligro', 'Tipo', 'P', 'S', 'Nivel', 'Control Recomendado']],
                body: rows,
                theme: 'striped',
                headStyles: { fillColor: [0, 45, 123] }
            });
        }

        else if (type === 'EMO') {
            doc.setFontSize(16);
            doc.text("ORDEN DE EXAMEN MÉDICO OCUPACIONAL", 105, 40, { align: 'center' });
            doc.setFontSize(11);
            doc.text(`Por la presente se autoriza al trabajador ${customData.nombre} (C.I. ${customData.ci}) a realizarse el examen médico tipo ${customData.tipo}, conforme a la Res. MTESS 03/2022.`, 20, 60, { maxWidth: 170 });
        }

        doc.save(`${type}_${company.replace(/\s/g, '_')}.pdf`);
    }

    // --- BINDINGS ---

    const actions = {
        'btn-politica': () => generateParaguayPDF('POLITICA'),
        'btn-contingencia': () => generateParaguayPDF('CONTINGENCIA'),
        'btn-iperc': () => {
            const cont = document.getElementById('iperc-content');
            if(cont) {
                const data = getIpercData();
                cont.innerHTML = `
                    <table class="w-full text-xs border-collapse">
                        <tr class="bg-primary text-white">
                            <th class="p-2 border">Peligro</th><th class="p-2 border">Prob</th><th class="p-2 border">Sev</th><th class="p-2 border">Nivel</th>
                        </tr>
                        ${data.map(d => `<tr><td class="p-2 border">${d.p}</td><td class="p-2 border text-center">${d.prob}</td><td class="p-2 border text-center">${d.sev}</td><td class="p-2 border font-bold">${d.nivel}</td></tr>`).join('')}
                    </table>
                `;
            }
            modals.iperc.classList.remove('hidden');
        },
        'btn-print-iperc': () => generateParaguayPDF('IPERC'),
        'btn-medico': () => modals.med.classList.remove('hidden'),
        'btn-mtess': () => modals.mtess.classList.remove('hidden'),
        'nav-inspecciones': () => modals.ins.classList.remove('hidden'),
        'nav-calendar': () => modals.calendar.classList.remove('hidden')
    };

    Object.keys(actions).forEach(id => {
        const el = document.getElementById(id);
        if(el) el.onclick = actions[id];
    });

    // Closers
    document.querySelectorAll('[id^="close-"]').forEach(btn => {
        btn.onclick = () => {
            const mId = btn.id.replace('close-','').replace('-modal','')+'-modal';
            const m = document.getElementById(mId) || document.getElementById(btn.id.replace('close-',''));
            if(m) m.classList.add('hidden');
        };
    });

    // EMO Form
    const medForm = document.getElementById('medico-form');
    if(medForm) {
        medForm.onsubmit = (e) => {
            e.preventDefault();
            generateParaguayPDF('EMO', {
                nombre: document.getElementById('med-trabajador').value,
                ci: document.getElementById('med-ci').value,
                tipo: document.getElementById('med-tipo').value
            });
            modals.med.classList.add('hidden');
        };
    }

    // Login (Persistencia)
    const lForm = document.getElementById('login-form');
    if(lForm) {
        lForm.onsubmit = (e) => {
            e.preventDefault();
            const u = document.getElementById('login-user').value;
            const p = document.getElementById('login-pass').value;
            const found = (JSON.parse(localStorage.getItem('sst_users')) || []).concat([{id:'admin',pass:'admin123',company:'Admin'}]).find(x=>x.id===u && x.pass===p);
            if(found) {
                sessionStorage.setItem('sst_current_user', JSON.stringify(found));
                window.location.reload();
            } else alert("Error");
        };
    }

    if(currentUser) {
        const overlay = document.getElementById('login-overlay');
        if(overlay) overlay.classList.add('hidden');
        const lbl = document.getElementById('company-name-label');
        if(lbl) lbl.innerText = currentUser.company;
    }
});
