document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH SYSTEM ---
    const getStoredUsers = () => {
        const stored = JSON.parse(localStorage.getItem('sst_users')) || [];
        // Default Admin always exists
        if (!stored.find(u => u.id === 'admin')) {
            stored.push({ id: 'admin', pass: 'admin123', role: 'admin', company: 'Global' });
        }
        return stored;
    };

    let currentUser = JSON.parse(sessionStorage.getItem('sst_current_user'));
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    
    // Registration elements
    const btnShowRegister = document.getElementById('btn-show-register');
    const registerModal = document.getElementById('register-modal');
    const closeRegisterBtn = document.getElementById('close-register-modal');
    const registerForm = document.getElementById('register-form');

    const handleLogin = (e) => {
        e.preventDefault();
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const users = getStoredUsers();

        const found = users.find(u => u.id === user && u.pass === pass);
        if (found) {
            sessionStorage.setItem('sst_current_user', JSON.stringify(found));
            currentUser = found;
            loginOverlay.classList.add('opacity-0', 'pointer-events-none');
            setTimeout(() => loginOverlay.classList.add('hidden'), 500);
            initDashboard();
        } else {
            loginError.classList.remove('hidden');
            setTimeout(() => loginError.classList.add('hidden'), 3000);
        }
    };

    if (loginForm) loginForm.onsubmit = handleLogin;

    // Registration Logic
    if (btnShowRegister && registerModal) {
        btnShowRegister.onclick = () => registerModal.classList.remove('hidden');
        closeRegisterBtn.onclick = () => registerModal.classList.add('hidden');
    }

    if (registerForm) {
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const users = getStoredUsers();
            const newUser = {
                id: document.getElementById('reg-user').value,
                pass: document.getElementById('reg-pass').value,
                role: 'user',
                company: document.getElementById('reg-company').value,
                ruc: document.getElementById('reg-ruc').value,
                address: document.getElementById('reg-address').value,
                workers: document.getElementById('reg-workers').value,
                risk: document.getElementById('reg-risk').value,
                activity: document.getElementById('reg-activity').value
            };

            if (users.find(u => u.id === newUser.id)) {
                return alert("El nombre de usuario ya existe.");
            }

            users.push(newUser);
            localStorage.setItem('sst_users', JSON.stringify(users));
            alert("¡Empresa Registrada con éxito! Ahora puedes iniciar sesión.");
            registerModal.classList.add('hidden');
            registerForm.reset();
        };
    }


    const getFilteredData = (key) => {
        const raw = JSON.parse(localStorage.getItem(key)) || [];
        if (!currentUser || currentUser.role === 'admin') return raw;
        // Usamos .id (username) para aislamiento total
        return raw.filter(item => item.companyId === currentUser.id);
    };

    // Helper to save data with company tag
    const saveDataWithCompany = (key, data) => {
        const raw = JSON.parse(localStorage.getItem(key)) || [];
        if (currentUser) data.companyId = currentUser.id;
        raw.push(data);
        localStorage.setItem(key, JSON.stringify(raw));
        // Actualizar dashboard inmediatamente tras guardar
        updateDashboardStats();
    };

    const animateValue = (obj, start, end, duration) => {
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Logout Logic
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.onclick = () => {
            sessionStorage.removeItem('sst_current_user');
            window.location.reload();
        };
    }

    const updateDashboardStats = () => {
        const inspections = getFilteredData('sst_inspecciones');
        const accidents = getFilteredData('sst_registros_mtess');
        const events = getFilteredData('sst_events');

        // Update counts
        const insCount = document.getElementById('stat-ins-count');
        if (insCount) insCount.innerText = inspections.length;

        const location = document.getElementById('stat-location');
        if (location) location.innerText = currentUser.address || 'No definida';

        // Update TF/TS (Fictional calculation based on data)
        const tf = document.getElementById('stat-tf');
        const ts = document.getElementById('stat-ts');
        if (tf) tf.innerText = (accidents.length * 0.5).toFixed(1);
        if (ts) ts.innerText = (accidents.length * 0.15).toFixed(1);

        // Recent Activity
        const activityList = document.getElementById('recent-activity-list');
        if (activityList) {
            const allActivity = [
                ...inspections.map(i => ({ title: `Inspección: ${i.tipo}`, date: i.fecha, color: 'bg-emerald-500', label: 'Completado' })),
                ...accidents.map(a => ({ title: `Accidente: ${a.trabajador}`, date: a.fecha, color: 'bg-secondary', label: 'Reportado' }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

            if (allActivity.length === 0) {
                activityList.innerHTML = `<p class="text-xs italic text-on-surface-variant p-4">No hay actividad reciente.</p>`;
            } else {
                activityList.innerHTML = allActivity.map(act => `
                    <div class="bg-surface-container-low p-5 rounded-2xl flex items-center gap-4 group hover:bg-surface-container transition-colors duration-200">
                        <div class="w-2 h-10 rounded-full ${act.color}"></div>
                        <div class="flex-1">
                            <p class="font-bold text-primary">${act.title}</p>
                            <p class="text-xs text-on-surface-variant">${act.date}</p>
                        </div>
                        <span class="bg-surface-container-highest px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">${act.label}</span>
                    </div>
                `).join('');
            }
        }
    };

    const initDashboard = () => {
        if (!currentUser) return;
        
        // Update UI with company name
        const companyLabel = document.querySelector('header p.text-xs');
        if (companyLabel) companyLabel.innerText = `SST ${currentUser.company} (${currentUser.role.toUpperCase()})`;
        
        updateDashboardStats();
        
        // Re-render components with filtered data

        if (typeof renderCalendar === 'function') renderCalendar();
        if (typeof renderRegistroMedico === 'function') renderRegistroMedico();
        if (typeof renderRegistroMtess === 'function') renderRegistroMtess();
        if (typeof renderHistorialIns === 'function') renderHistorialIns();
        
        // Animación de bienvenida
        animateValue(document.querySelector('.pulse-number'), 100, 142, 1500);
    };

    // Auto-login if session exists
    if (currentUser) {
        loginOverlay.classList.add('hidden');
        initDashboard();
    }

    // Form Submission (MTESS Simple)
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
                
                // GUARDAR EN LOCAL STORAGE
                const newRecord = {
                    fecha: fechaHora,
                    empresa,
                    trabajador,
                    cedula: ci,
                    lugar,
                    estado: "Declarado al MTESS"
                };
                
                saveDataWithCompany('sst_registros_mtess', newRecord);
                
                if (typeof renderRegistroMtess === 'function') {
                    renderRegistroMtess();
                }

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
            doc.text("1. NORMATIVA Y OBJETIVO", 20, 100);
            doc.setFont("helvetica", "normal");
            const objText = `En estricto cumplimiento del Decreto 14.390/92, la Resolución MTESS N° 835/2016 y estándares internacionales, este POE establece los lineamientos técnicos obligatorios para la emisión del Permiso de Trabajo en Alturas (PTA) y el uso correcto de sistemas anticaídas.`;
            doc.text(doc.splitTextToSize(objText, 170), 25, 110);

            doc.setFont("helvetica", "bold");
            doc.text("2. NIVELES DE RIESGO EN TRABAJOS EN ALTURA", 20, 135);
            doc.setFont("helvetica", "normal");
            doc.text("Nivel Bajo: Tareas en plataformas aprobadas con barandas perimetrales o andamios certificados. Riesgo controlado.", 25, 145, { maxWidth: 165 });
            doc.text("Nivel Medio: Trabajos en techos planos o inclinados con líneas de vida instaladas. Requiere PTA y sistema A-B-C completo.", 25, 155, { maxWidth: 165 });
            doc.text("Nivel Alto: Trabajos en suspensión, torres eléctricas o zonas sin anclaje fijo. Requiere PTA, vigía permanente y Plan de Rescate inmediato.", 25, 165, { maxWidth: 165 });

            doc.setFont("helvetica", "bold");
            doc.text("3. REQUISITOS PARA PERMISO DE TRABAJO (PTA)", 20, 185);
            doc.setFont("helvetica", "normal");
            doc.text("A) Evaluación Médica: Certificado de aptitud médica para trabajos en altura.", 25, 195);
            doc.text("B) Verificación A-B-C: Inspección del Anclaje, Arnés de Cuerpo Completo y Conectores.", 25, 205);
            doc.text("C) Supervisión: Ninguna tarea a +1.8m inicia sin firma de autorización en el PTA.", 25, 215);

            doc.setFont("helvetica", "bold");
            doc.text("4. PROCEDIMIENTO DE EJECUCIÓN", 20, 230);
            doc.setFont("helvetica", "normal");
            doc.text("1. Delimitar y señalizar el área de trabajo en el nivel inferior.", 25, 240);
            doc.text("2. Enganchar los mosquetones por encima del hombro.", 25, 250);
            doc.text("3. Suspender tareas en caso de lluvia, tormenta eléctrica o vientos fuertes (>40km/h).", 25, 260);

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

    // Permiso PTA Alturas Modal Logic
    const btnPtaAltura = document.getElementById('btn-pta-altura');
    const ptaAlturaModal = document.getElementById('pta-altura-modal');
    const closePtaAlturaBtn = document.getElementById('close-pta-altura-modal');
    const ptaAlturaForm = document.getElementById('pta-altura-form');

    const closePtaAlturaFunc = () => {
        if (!ptaAlturaModal) return;
        ptaAlturaModal.classList.add('opacity-0');
        ptaAlturaModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => ptaAlturaModal.classList.add('hidden'), 300);
    };

    if (btnPtaAltura && ptaAlturaModal && closePtaAlturaBtn) {
        btnPtaAltura.addEventListener('click', () => {
            ptaAlturaModal.classList.remove('hidden');
            setTimeout(() => {
                ptaAlturaModal.classList.remove('opacity-0');
                ptaAlturaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closePtaAlturaBtn.addEventListener('click', closePtaAlturaFunc);
        ptaAlturaModal.addEventListener('click', (e) => {
            if (e.target === ptaAlturaModal) closePtaAlturaFunc();
        });
    }

    if (ptaAlturaForm) {
        ptaAlturaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const trabajador = document.getElementById('pta-trabajador').value;
            const supervisor = document.getElementById('pta-supervisor').value;
            const lugar = document.getElementById('pta-lugar').value;
            const riesgo = document.getElementById('pta-riesgo').value;
            
            const dateObj = new Date();
            const dateStr = dateObj.toLocaleDateString('es-PY');
            const timeStr = dateObj.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });

            // Generar número de permiso aleatorio para que sea realista
            const numPermiso = Math.floor(100000 + Math.random() * 900000);

            // Borde del documento (estilo certificado)
            doc.setDrawColor(234, 88, 12); // orange-600
            doc.setLineWidth(1);
            doc.rect(10, 10, 190, 277);

            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(234, 88, 12); 
            doc.text("PERMISO DE TRABAJO EN ALTURAS (PTA)", 105, 25, null, null, "center");
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`N° PTA-${numPermiso}`, 105, 33, null, null, "center");
            
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text("Documento oficial en cumplimiento con el Decreto 14.390/92 (MTESS Paraguay)", 105, 40, null, null, "center");
            
            doc.line(15, 45, 195, 45);

            // DATOS GENERALES
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. DATOS DE LA TAREA", 20, 55);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Fecha de Emisión: ${dateStr}`, 25, 65);
            doc.text(`Hora de Inicio Autorizada: ${timeStr}`, 110, 65);
            doc.text(`Lugar de Trabajo: ${lugar}`, 25, 75);
            doc.text(`Nivel de Riesgo: ${riesgo}`, 110, 75);

            // PERSONAL
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. PERSONAL INVOLUCRADO", 20, 90);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Trabajador Autorizado: ${trabajador}`, 25, 100);
            doc.text(`Supervisor / Emisor del Permiso: ${supervisor}`, 25, 110);

            // CHECKLIST
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("3. VERIFICACIÓN Y CHECKLIST (SISTEMA A-B-C)", 20, 125);
            doc.setFontSize(11);
            
            // Checkboxes simulados
            const yStart = 135;
            doc.setFont("helvetica", "bold");
            doc.text("[ X ]", 25, yStart);
            doc.setFont("helvetica", "normal");
            doc.text("Evaluación Médica (Apto para Alturas) - Vigente.", 35, yStart);

            doc.setFont("helvetica", "bold");
            doc.text("[ X ]", 25, yStart + 10);
            doc.setFont("helvetica", "normal");
            doc.text("A (Anclaje): Punto seguro verificado (Resistencia min. 5000 lbs).", 35, yStart + 10);

            doc.setFont("helvetica", "bold");
            doc.text("[ X ]", 25, yStart + 20);
            doc.setFont("helvetica", "normal");
            doc.text("B (Body Support): Arnés inspeccionado, sin cortes ni quemaduras.", 35, yStart + 20);

            doc.setFont("helvetica", "bold");
            doc.text("[ X ]", 25, yStart + 30);
            doc.setFont("helvetica", "normal");
            doc.text("C (Conectores): Eslingas/Cabos de vida con amortiguador en buen estado.", 35, yStart + 30);

            doc.setFont("helvetica", "bold");
            doc.text("[ X ]", 25, yStart + 40);
            doc.setFont("helvetica", "normal");
            doc.text("Condiciones climáticas favorables (Sin lluvias ni vientos fuertes).", 35, yStart + 40);

            // DECLARACION
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("4. AUTORIZACIÓN Y DECLARACIÓN", 20, 190);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const decl = "El supervisor abajo firmante certifica que ha inspeccionado personalmente el área de trabajo y los equipos de protección, encontrándolos en condiciones óptimas para realizar la tarea de manera segura. El trabajador declara haber entendido el procedimiento (POE) y estar en óptimas condiciones físicas y mentales hoy.";
            doc.text(doc.splitTextToSize(decl, 160), 25, 200);

            // FIRMAS
            doc.line(30, 250, 90, 250);
            doc.setFont("helvetica", "bold");
            doc.text(trabajador, 60, 255, null, null, "center");
            doc.setFont("helvetica", "normal");
            doc.text("Firma del Trabajador Autorizado", 60, 260, null, null, "center");

            doc.line(120, 250, 180, 250);
            doc.setFont("helvetica", "bold");
            doc.text(supervisor, 150, 255, null, null, "center");
            doc.setFont("helvetica", "normal");
            doc.text("Firma del Supervisor (Emisor)", 150, 260, null, null, "center");

            // Validez
            doc.setFontSize(9);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(220, 38, 38); // red
            doc.text("VÁLIDO ÚNICAMENTE POR ESTA JORNADA LABORAL", 105, 270, null, null, "center");

            doc.save(`PTA_Alturas_${trabajador.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr.replace(/\//g, '-')}.pdf`);
            
            const btn = ptaAlturaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Permiso Emitido';
            btn.classList.replace('bg-orange-600', 'bg-emerald-600');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-orange-600');
                ptaAlturaForm.reset();
                closePtaAlturaFunc();
            }, 2500);
        });
    }

    // Orden Médica EMO Logic
    const btnMedico = document.getElementById('btn-medico');
    const medicoModal = document.getElementById('medico-modal');
    const closeMedicoBtn = document.getElementById('close-medico-modal');
    const medicoForm = document.getElementById('medico-form');

    const closeMedicoFunc = () => {
        if (!medicoModal) return;
        medicoModal.classList.add('opacity-0');
        medicoModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => medicoModal.classList.add('hidden'), 300);
    };

    if (btnMedico && medicoModal && closeMedicoBtn) {
        btnMedico.addEventListener('click', () => {
            medicoModal.classList.remove('hidden');
            setTimeout(() => {
                medicoModal.classList.remove('opacity-0');
                medicoModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeMedicoBtn.addEventListener('click', closeMedicoFunc);
        medicoModal.addEventListener('click', (e) => {
            if (e.target === medicoModal) closeMedicoFunc();
        });
    }

    if (medicoForm) {
        medicoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('med-empresa').value;
            const trabajador = document.getElementById('med-trabajador').value;
            const cedula = document.getElementById('med-cedula').value;
            const puesto = document.getElementById('med-puesto').value;
            const tipo = document.querySelector('input[name="med-tipo"]:checked').value;
            
            const dateStr = new Date().toLocaleDateString('es-PY');

            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(4, 120, 87); // emerald-700
            doc.text("ORDEN DE EXAMEN MÉDICO OCUPACIONAL", 105, 30, null, null, "center");
            
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(`En cumplimiento de la Res. MTESS N° 03/2022 y Dec. N° 5078/2021`, 105, 40, null, null, "center");
            doc.line(15, 45, 195, 45);

            // DATOS DE LA EMPRESA
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("1. DATOS DE LA EMPRESA SOLICITANTE", 20, 55);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Razón Social: ${empresa}`, 25, 65);
            doc.text(`Fecha de Emisión de la Orden: ${dateStr}`, 25, 75);

            // DATOS DEL TRABAJADOR
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("2. DATOS DEL TRABAJADOR", 20, 95);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Nombre y Apellido: ${trabajador}`, 25, 105);
            doc.text(`C.I. N°: ${cedula}`, 25, 115);
            doc.text(`Puesto de Trabajo: ${puesto}`, 25, 125);

            // TIPO DE EXAMEN Y REQUERIMIENTOS
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("3. TIPO DE EXAMEN Y ESTUDIOS SOLICITADOS", 20, 145);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.text(`Se solicita a la clínica/profesional de salud ocupacional realizar el siguiente examen:`, 25, 155);
            
            doc.setFontSize(13);
            doc.setFont("helvetica", "bold");
            doc.text(`[ X ] EXAMEN ${tipo.toUpperCase()}`, 35, 165);
            
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            if (tipo === 'Admisional') {
                doc.text("De acuerdo al Art. 3 de la Res. 03/2022, el examen admisional debe incluir:", 25, 180);
                doc.text("- Examen clínico con énfasis ocupacional.", 35, 190);
                doc.text("- Hemograma completo.", 35, 200);
                doc.text("- Eritrosedimentación.", 35, 210);
                doc.text("- Perfil lipídico y Glicemia.", 35, 220);
                doc.text("- Tipificación sanguínea.", 35, 230);
            } else {
                doc.text("De acuerdo al Art. 4 de la Res. 03/2022, el examen periódico debe incluir:", 25, 180);
                doc.text("- Examen clínico con énfasis en riesgos del puesto.", 35, 190);
                doc.text("- Hemograma completo.", 35, 200);
                doc.text("- Otros estudios complementarios según criterio del médico laboral.", 35, 210);
            }

            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            const note = "Nota a la Clínica: Los resultados médicos son confidenciales y pertenecen al trabajador. A la empresa solo se le debe remitir el 'Certificado de Aptitud Médica Ocupacional' indicando si es APTO, APTO CON RESTRICCIONES, o NO APTO.";
            doc.text(doc.splitTextToSize(note, 160), 20, 250);

            // FIRMAS
            doc.line(70, 280, 140, 280);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Firma y Sello de la Empresa", 105, 285, null, null, "center");

            doc.save(`Orden_EMO_${tipo}_${trabajador.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
            
            // GUARDAR EN LOCAL STORAGE
            const newRecord = {
                fecha: dateStr,
                empresa,
                trabajador,
                cedula,
                puesto,
                tipo,
                estado: "Orden Emitida" // Default
            };
            
            saveDataWithCompany('sst_registros_medicos', newRecord);
            
            // ACTUALIZAR TABLA SI ESTÁ ABIERTA
            renderRegistroMedico();

            const btn = medicoForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Orden Emitida';
            btn.classList.replace('bg-emerald-600', 'bg-emerald-800');
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-800', 'bg-emerald-600');
                medicoForm.reset();
                closeMedicoFunc();
            }, 2500);
        });
    }

    // Registro Médico (Excel/Tabla) Logic
    const btnRegistroMedico = document.getElementById('btn-registro-medico');
    const registroMedicoModal = document.getElementById('registro-medico-modal');
    const closeRegistroMedicoBtn = document.getElementById('close-registro-medico');
    const tbodyRegistro = document.getElementById('registro-medico-body');
    const btnExportCsv = document.getElementById('btn-export-csv');

    const renderRegistroMedico = () => {
        if (!tbodyRegistro) return;
        const registros = JSON.parse(localStorage.getItem('sst_registros_medicos')) || [];
        
        if (registros.length === 0) {
            tbodyRegistro.innerHTML = `<tr><td colspan="6" class="px-4 py-8 text-center text-on-surface-variant italic">No hay registros de órdenes emitidas todavía.</td></tr>`;
            return;
        }

        tbodyRegistro.innerHTML = registros.reverse().map(reg => `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="px-4 py-3">${reg.fecha}</td>
                <td class="px-4 py-3 font-medium">${reg.trabajador}</td>
                <td class="px-4 py-3">${reg.cedula}</td>
                <td class="px-4 py-3">${reg.puesto}</td>
                <td class="px-4 py-3">
                    <span class="px-2 py-1 rounded text-xs font-bold ${reg.tipo === 'Admisional' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
                        ${reg.tipo}
                    </span>
                </td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                        ${reg.estado}
                    </span>
                </td>
            </tr>
        `).join('');
    };

    const closeRegistroMedicoFunc = () => {
        if (!registroMedicoModal) return;
        registroMedicoModal.classList.add('opacity-0');
        registroMedicoModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => registroMedicoModal.classList.add('hidden'), 300);
    };

    if (btnRegistroMedico && registroMedicoModal && closeRegistroMedicoBtn) {
        btnRegistroMedico.addEventListener('click', () => {
            renderRegistroMedico();
            registroMedicoModal.classList.remove('hidden');
            setTimeout(() => {
                registroMedicoModal.classList.remove('opacity-0');
                registroMedicoModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeRegistroMedicoBtn.addEventListener('click', closeRegistroMedicoFunc);
        registroMedicoModal.addEventListener('click', (e) => {
            if (e.target === registroMedicoModal) closeRegistroMedicoFunc();
        });
    }

    if (btnExportCsv) {
        btnExportCsv.addEventListener('click', () => {
            const registros = getFilteredData('sst_registros_medicos');
            if (registros.length === 0) {
                alert("No hay datos para exportar.");
                return;
            }

            // Crear CSV Header
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Fecha Orden,Empresa,Trabajador,Cedula,Puesto,Tipo Examen,Estado\n";

            // Añadir filas
            registros.forEach(r => {
                const row = `"${r.fecha}","${r.empresa}","${r.trabajador}","${r.cedula}","${r.puesto}","${r.tipo}","${r.estado}"`;
                csvContent += row + "\n";
            });

            // Descargar archivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Registro_Vigilancia_Medica_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Registro MTESS (Excel/Tabla) Logic
    const btnRegistroMtess = document.getElementById('btn-registro-mtess');
    const registroMtessModal = document.getElementById('registro-mtess-modal');
    const closeRegistroMtessBtn = document.getElementById('close-registro-mtess');
    const tbodyRegistroMtess = document.getElementById('registro-mtess-body');
    const btnExportMtessCsv = document.getElementById('btn-export-mtess-csv');

    const renderRegistroMtess = () => {
        if (!tbodyRegistroMtess) return;
        const registros = getFilteredData('sst_registros_mtess');
        
        if (registros.length === 0) {
            tbodyRegistroMtess.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-on-surface-variant italic">No hay declaraciones de accidentes emitidas todavía.</td></tr>`;
            return;
        }

        tbodyRegistroMtess.innerHTML = registros.reverse().map(reg => `
            <tr class="hover:bg-surface-container-highest transition-colors">
                <td class="px-4 py-3">${reg.fecha}</td>
                <td class="px-4 py-3 font-medium">${reg.trabajador}</td>
                <td class="px-4 py-3">${reg.cedula}</td>
                <td class="px-4 py-3">${reg.lugar}</td>
                <td class="px-4 py-3 text-center">
                    <span class="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
                        ${reg.estado}
                    </span>
                </td>
            </tr>
        `).join('');
    };

    const closeRegistroMtessFunc = () => {
        if (!registroMtessModal) return;
        registroMtessModal.classList.add('opacity-0');
        registroMtessModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => registroMtessModal.classList.add('hidden'), 300);
    };

    if (btnRegistroMtess && registroMtessModal && closeRegistroMtessBtn) {
        btnRegistroMtess.addEventListener('click', () => {
            renderRegistroMtess();
            registroMtessModal.classList.remove('hidden');
            setTimeout(() => {
                registroMtessModal.classList.remove('opacity-0');
                registroMtessModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        });

        closeRegistroMtessBtn.addEventListener('click', closeRegistroMtessFunc);
        registroMtessModal.addEventListener('click', (e) => {
            if (e.target === registroMtessModal) closeRegistroMtessFunc();
        });
    }

    if (btnExportMtessCsv) {
        btnExportMtessCsv.addEventListener('click', () => {
            const registros = getFilteredData('sst_registros_mtess');
            if (registros.length === 0) {
                alert("No hay datos para exportar.");
                return;
            }

            // Crear CSV Header
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Fecha del Evento,Empresa,Trabajador,Cedula,Lugar,Estado\n";

            // Añadir filas
            registros.forEach(r => {
                const row = `"${r.fecha}","${r.empresa}","${r.trabajador}","${r.cedula}","${r.lugar}","${r.estado}"`;
                csvContent += row + "\n";
            });

            // Descargar archivo
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Registro_Accidentes_MTESS_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // --- CALENDAR LOGIC ---
    const btnCalendar = document.getElementById('btn-calendar');
    const calendarModal = document.getElementById('calendar-modal');
    const closeCalendarBtn = document.getElementById('close-calendar-modal');
    const calendarDays = document.getElementById('calendar-days');
    const calendarMonthYear = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    
    const newEventModal = document.getElementById('new-event-modal');
    const btnNewEvent = document.getElementById('btn-new-event');
    const cancelEventBtn = document.getElementById('cancel-event');
    const eventForm = document.getElementById('event-form');
    const eventList = document.getElementById('event-list');

    let currentDate = new Date();
    let selectedDate = new Date();

    const renderCalendar = () => {
        if (!calendarDays) return;
        calendarDays.innerHTML = '';
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        calendarMonthYear.innerText = `${monthNames[month]} ${year}`;
        
        // Cargar eventos
        const events = getFilteredData('sst_events');

        // Empty slots for first week
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'h-16 md:h-24';
            calendarDays.appendChild(empty);
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            const fullDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const dayEvents = events.filter(e => e.date === fullDate);
            
            dayEl.className = `h-16 md:h-24 border border-outline-variant/10 rounded-xl p-1 flex flex-col items-center justify-start cursor-pointer hover:bg-surface-container transition-colors relative ${fullDate === new Date().toISOString().split('T')[0] ? 'bg-primary-fixed border-primary/20' : 'bg-surface-container-lowest'}`;
            
            dayEl.innerHTML = `
                <span class="text-xs font-bold ${fullDate === new Date().toISOString().split('T')[0] ? 'text-primary' : 'text-on-surface'}">${day}</span>
                <div class="flex flex-wrap gap-1 mt-1 justify-center">
                    ${dayEvents.map(e => `<div class="w-1.5 h-1.5 rounded-full ${getEventTypeColor(e.type)}"></div>`).join('')}
                </div>
            `;
            
            dayEl.onclick = () => {
                selectedDate = new Date(year, month, day);
                updateEventSidebar(fullDate);
                // Highlight selected
                document.querySelectorAll('#calendar-days > div').forEach(d => d.classList.remove('ring-2', 'ring-primary'));
                dayEl.classList.add('ring-2', 'ring-primary');
            };
            
            calendarDays.appendChild(dayEl);
        }
    };

    const getEventTypeColor = (type) => {
        switch(type) {
            case 'Capacitación': return 'bg-blue-500';
            case 'Inspección': return 'bg-amber-500';
            case 'Auditoría': return 'bg-teal-500';
            case 'Simulacro': return 'bg-rose-500';
            case 'Mantenimiento': return 'bg-purple-500';
            default: return 'bg-slate-500';
        }
    };

    const updateEventSidebar = (dateStr) => {
        const events = getFilteredData('sst_events');
        const dayEvents = events.filter(e => e.date === dateStr);
        
        if (dayEvents.length === 0) {
            eventList.innerHTML = `<p class="text-xs text-on-surface-variant italic text-center mt-10">No hay actividades para el ${dateStr}.</p>`;
        } else {
            eventList.innerHTML = dayEvents.map((e, index) => `
                <div class="bg-white p-3 rounded-xl border border-outline-variant/20 shadow-sm flex items-center gap-3">
                    <div class="w-2 h-8 rounded-full ${getEventTypeColor(e.type)}"></div>
                    <div class="flex-1">
                        <p class="text-xs font-bold text-primary">${e.title}</p>
                        <p class="text-[10px] text-on-surface-variant uppercase font-bold">${e.type}</p>
                    </div>
                    <button onclick="deleteSstEvent('${dateStr}', ${index})" class="text-outline hover:text-error transition-colors">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            `).join('');
        }
    };

    // Global delete for onclick
    window.deleteSstEvent = (date, index) => {
        let events = JSON.parse(localStorage.getItem('sst_events')) || [];
        const companyEvents = events.filter(e => currentUser.role === 'admin' || e.companyId === currentUser.company);
        const dayEvents = companyEvents.filter(e => e.date === date);
        const itemToDelete = dayEvents[index];
        
        events = events.filter(e => e !== itemToDelete);
        localStorage.setItem('sst_events', JSON.stringify(events));
        renderCalendar();
        updateEventSidebar(date);
    };

    if (btnCalendar && calendarModal) {
        btnCalendar.onclick = (e) => {
            e.preventDefault();
            calendarModal.classList.remove('hidden');
            setTimeout(() => {
                calendarModal.classList.remove('opacity-0');
                calendarModal.querySelector('div').classList.remove('scale-95');
                renderCalendar();
            }, 10);
        };
        
        closeCalendarBtn.onclick = () => {
            calendarModal.classList.add('opacity-0');
            calendarModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => calendarModal.classList.add('hidden'), 300);
        };
    }

    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        };
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        };
    }

    if (btnNewEvent) {
        btnNewEvent.onclick = () => {
            document.getElementById('event-date').value = selectedDate.toISOString().split('T')[0];
            newEventModal.classList.remove('hidden');
            setTimeout(() => {
                newEventModal.classList.remove('opacity-0');
                newEventModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        };
    }

    if (cancelEventBtn) {
        cancelEventBtn.onclick = () => {
            newEventModal.classList.add('opacity-0');
            newEventModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => newEventModal.classList.add('hidden'), 300);
        };
    }

    if (eventForm) {
        eventForm.onsubmit = (e) => {
            e.preventDefault();
            const title = document.getElementById('event-title').value;
            const type = document.getElementById('event-type').value;
            const date = document.getElementById('event-date').value;
            
            saveDataWithCompany('sst_events', { title, type, date });
            
            eventForm.reset();
            cancelEventBtn.click();
            renderCalendar();
            updateEventSidebar(date);
        };
    }

    // --- INSPECTION LOGIC ---
    const btnInspeccion = document.getElementById('btn-inspeccion');
    const inspeccionModal = document.getElementById('inspeccion-modal');
    const closeInspeccionBtn = document.getElementById('close-inspeccion-modal');
    const inspeccionForm = document.getElementById('inspeccion-form');
    const selectTipoIns = document.getElementById('ins-tipo');
    const checklistContainer = document.getElementById('ins-checklist-container');
    const checklistTitle = document.getElementById('ins-checklist-title');

    const checklistData = {
        'Extintores': [
            { item: "Ubicación visible y señalizada", desc: "El extintor está en su lugar asignado y tiene cartel." },
            { item: "Acceso libre de obstáculos", desc: "No hay objetos obstruyendo el paso al extintor." },
            { item: "Manómetro en rango verde", desc: "La presión es la correcta según el indicador." },
            { item: "Manguera y boquilla en buen estado", desc: "Sin grietas, obstrucciones o roturas." },
            { item: "Precinto de seguridad intacto", desc: "El seguro no ha sido removido." },
            { item: "Vencimiento vigente", desc: "La carga anual no ha expirado." }
        ],
        'Botiquín': [
            { item: "Gasa estéril y vendas", desc: "Existencia de material de curación básico." },
            { item: "Antisépticos (Alcohol/Iodo)", desc: "Líquidos para desinfección presentes y vigentes." },
            { item: "Guantes de látex/nitrilo", desc: "Mínimo 2 pares para bioseguridad." },
            { item: "Tijera y pinza", desc: "Instrumentos limpios y sin óxido." },
            { item: "Cinta adhesiva/Esparadrapo", desc: "Material para fijación de vendas." },
            { item: "Medicamentos vigentes", desc: "Sin fármacos con fecha de vencimiento cumplida." }
        ],
        'Orden y Limpieza': [
            { item: "Pasillos despejados", desc: "Vías de evacuación libres de cajas o materiales." },
            { item: "Herramientas ordenadas", desc: "Cada herramienta en su panel o caja asignada." },
            { item: "Residuos clasificados", desc: "Basureros con bolsas y etiquetas correspondientes." },
            { item: "Iluminación adecuada", desc: "Lámparas limpias y funcionando." },
            { item: "Suelos secos y limpios", desc: "Sin manchas de aceite o agua que causen resbalones." },
            { item: "Señalética visible", desc: "Carteles de seguridad limpios y sin daños." }
        ],
        'Herramientas': [
            { item: "Mangos sin astillas/roturas", desc: "Partes de agarre en buen estado físico." },
            { item: "Sin grasa o aceite", desc: "Superficies de contacto limpias para evitar resbales." },
            { item: "Filos/Puntas afiladas", desc: "Herramientas de corte con el filo necesario." },
            { item: "Sin piezas sueltas", desc: "Cabezales de martillos o partes móviles firmes." },
            { item: "Almacenamiento seguro", desc: "Herramientas guardadas con fundas o protectores." }
        ]
    };

    const renderInspeccionChecklist = (tipo) => {
        if (!checklistContainer) return;
        const data = checklistData[tipo] || [];
        checklistTitle.innerText = `Checklist: ${tipo}`;
        checklistContainer.innerHTML = data.map((d, i) => `
            <div class="bg-white p-3 rounded-xl border border-outline-variant/15 space-y-2">
                <label class="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" class="mt-1 ins-check" data-item="${d.item}" checked>
                    <div class="text-xs flex-1"><span class="font-bold block">${d.item}</span> ${d.desc}</div>
                </label>
                <input type="text" class="ins-obs-item w-full bg-surface-container-low border-0 rounded-lg px-3 py-1.5 text-[11px] outline-none" placeholder="Observación específica (opcional)">
            </div>
        `).join('');
    };

    const closeInspeccionFunc = () => {
        if (!inspeccionModal) return;
        inspeccionModal.classList.add('opacity-0');
        inspeccionModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => inspeccionModal.classList.add('hidden'), 300);
    };

    if (btnInspeccion && inspeccionModal) {
        btnInspeccion.onclick = () => {
            renderInspeccionChecklist(selectTipoIns.value);
            inspeccionModal.classList.remove('hidden');
            setTimeout(() => {
                inspeccionModal.classList.remove('opacity-0');
                inspeccionModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        };
        closeInspeccionBtn.onclick = closeInspeccionFunc;
    }

    if (selectTipoIns) {
        selectTipoIns.onchange = (e) => renderInspeccionChecklist(e.target.value);
    }

    if (inspeccionForm) {
        inspeccionForm.onsubmit = (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const tipo = document.getElementById('ins-tipo').value;
            const resp = document.getElementById('ins-responsable').value;
            const area = document.getElementById('ins-area').value;
            const fecha = document.getElementById('ins-fecha').value;
            const obsGeneral = document.getElementById('ins-obs').value;
            
            const checks = document.querySelectorAll('.ins-check');
            const obsItems = document.querySelectorAll('.ins-obs-item');
            let compliantCount = 0;
            const items = [];

            checks.forEach((c, i) => {
                if (c.checked) compliantCount++;
                items.push({
                    text: c.dataset.item,
                    checked: c.checked,
                    obs: obsItems[i].value || "Sin observaciones"
                });
            });

            const percent = ((compliantCount / items.length) * 100).toFixed(1);

            // PDF
            doc.setFillColor(37, 99, 235); // Blue 600
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(`INFORME DE INSPECCIÓN: ${tipo.toUpperCase()}`, 105, 20, null, null, "center");
            doc.setFontSize(10);
            doc.text("Gestión de Seguridad y Salud en el Trabajo - SST Paraguay", 105, 30, null, null, "center");

            doc.setTextColor(0,0,0);
            doc.setFontSize(11);
            doc.text("1. DATOS DE LA INSPECCIÓN", 15, 50);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Inspector: ${resp}`, 20, 58);
            doc.text(`Área: ${area}`, 20, 64);
            doc.text(`Fecha: ${fecha}`, 130, 58);
            
            // Compliance Box
            doc.setDrawColor(37, 99, 235);
            doc.rect(130, 62, 65, 12);
            doc.setFont("helvetica", "bold");
            doc.text(`CUMPLIMIENTO: ${percent}%`, 162.5, 70, null, null, "center");

            doc.setFontSize(11);
            doc.text("2. DETALLE DE HALLAZGOS", 15, 85);
            
            let y = 95;
            doc.setFillColor(245, 245, 245);
            doc.rect(15, y-4, 180, 6, 'F');
            doc.setFontSize(8);
            doc.text("ESTADO", 20, y);
            doc.text("CRITERIO EVALUADO", 50, y);
            doc.text("OBSERVACIONES", 130, y);
            y += 8;

            items.forEach(item => {
                doc.setFont("helvetica", item.checked ? "normal" : "bold");
                if(!item.checked) doc.setTextColor(200, 0, 0);
                doc.text(item.checked ? "OK" : "NO OK", 20, y);
                doc.setTextColor(0,0,0);
                doc.text(item.text, 50, y);
                
                const splitObs = doc.splitTextToSize(item.obs, 65);
                doc.text(splitObs, 130, y);
                y += Math.max(splitObs.length * 4, 6);

                if (y > 275) { doc.addPage(); y = 20; }
            });

            y += 10;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("3. CONCLUSIONES Y RECOMENDACIONES", 15, y);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(doc.splitTextToSize(obsGeneral || "Se recomienda corregir los hallazgos en un plazo no mayor a 48 horas.", 180), 20, y+8);

            doc.save(`Inspeccion_${tipo}_${area.replace(/\s/g, '_')}.pdf`);

            // Save to History (LocalStorage)
            try {
                const nuevaIns = { 
                    fecha: fecha || new Date().toISOString().split('T')[0], 
                    tipo: tipo || 'Inspección', 
                    area: area || 'General', 
                    resp: resp || 'N/A', 
                    percent: percent || "0.0" 
                };
                saveDataWithCompany('sst_inspecciones', nuevaIns);
                console.log("Inspección guardada con éxito:", nuevaIns);
            } catch (err) {
                console.error("Error al guardar inspección:", err);
            }

            const sbtn = inspeccionForm.querySelector('button[type="submit"]');
            sbtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> ¡Guardado!';
            sbtn.classList.replace('bg-blue-700', 'bg-emerald-600');
            
            setTimeout(() => {
                sbtn.innerHTML = '<span class="material-symbols-outlined">description</span> Finalizar y Generar PDF';
                sbtn.classList.replace('bg-emerald-600', 'bg-blue-700');
                inspeccionForm.reset();
                closeInspeccionFunc();
                renderHistorialIns(); // Update table if open
            }, 2000);
        };
    }

    // Historial Inspecciones Logic
    const btnHistorialIns = document.getElementById('btn-historial-inspeccion');
    const historialInsModal = document.getElementById('historial-inspeccion-modal');
    const closeHistorialInsBtn = document.getElementById('close-historial-inspeccion');
    const tbodyHistorialIns = document.getElementById('historial-inspeccion-body');
    const btnExportInsCsv = document.getElementById('btn-export-ins-csv');

    const renderHistorialIns = () => {
        if (!tbodyHistorialIns) return;
        const inspecciones = getFilteredData('sst_inspecciones');
        
        if (inspecciones.length === 0) {
            tbodyHistorialIns.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-on-surface-variant italic">No hay inspecciones registradas aún.</td></tr>`;
            return;
        }

        tbodyHistorialIns.innerHTML = inspecciones.map(ins => {
            const p = parseFloat(ins.percent || 0);
            return `
            <tr class="hover:bg-blue-50 transition-colors">
                <td class="px-4 py-3">${ins.fecha}</td>
                <td class="px-4 py-3 font-bold text-blue-700">${ins.tipo}</td>
                <td class="px-4 py-3">${ins.area}</td>
                <td class="px-4 py-3">${ins.resp}</td>
                <td class="px-4 py-3 text-center font-bold ${p < 70 ? 'text-red-600' : 'text-emerald-600'}">${ins.percent}%</td>
            </tr>
        `}).reverse().join('');
    };

    if (btnHistorialIns && historialInsModal) {
        btnHistorialIns.onclick = () => {
            renderHistorialIns();
            historialInsModal.classList.remove('hidden');
            setTimeout(() => {
                historialInsModal.classList.remove('opacity-0');
                historialInsModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        };
        closeHistorialInsBtn.onclick = () => {
            historialInsModal.classList.add('opacity-0');
            historialInsModal.querySelector('div').classList.add('scale-95');
            setTimeout(() => historialInsModal.classList.add('hidden'), 300);
        };
    }

    if (btnExportInsCsv) {
        btnExportInsCsv.onclick = () => {
            const inspecciones = getFilteredData('sst_inspecciones');
            if (inspecciones.length === 0) return alert("No hay datos para exportar");

            let csv = "Fecha,Tipo,Area,Responsable,Cumplimiento\n";
            inspecciones.forEach(ins => {
                csv += `${ins.fecha},${ins.tipo},${ins.area},${ins.resp},${ins.percent}%\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Historial_Inspecciones_SST.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }

    // --- AUDIT LOGIC ---
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
        btnAuditoria.onclick = () => {
            auditoriaModal.classList.remove('hidden');
            setTimeout(() => {
                auditoriaModal.classList.remove('opacity-0');
                auditoriaModal.querySelector('div').classList.remove('scale-95');
            }, 10);
        };
        closeAuditoriaBtn.onclick = closeAuditoriaFunc;
    }

    if (auditoriaForm) {
        auditoriaForm.onsubmit = (e) => {
            e.preventDefault();
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            const empresa = document.getElementById('aud-empresa').value;
            const lider = document.getElementById('aud-lider').value;
            const fecha = document.getElementById('aud-fecha').value;
            const alcance = document.getElementById('aud-alcance').value;
            const obsGeneral = document.getElementById('aud-obs').value;
            
            // Get checklist items and individual observations
            const checks = document.querySelectorAll('.aud-check');
            const obsItems = document.querySelectorAll('.aud-obs-item');
            const items = [];
            let compliantCount = 0;

            checks.forEach((c, index) => {
                const isChecked = c.checked;
                if (isChecked) compliantCount++;
                items.push({
                    text: c.dataset.item,
                    checked: isChecked,
                    observation: obsItems[index].value || "Sin observaciones"
                });
            });

            const totalItems = items.length;
            const compliancePercent = ((compliantCount / totalItems) * 100).toFixed(1);

            // --- PDF DESIGN ---
            // Header
            doc.setFillColor(0, 128, 128); // Teal
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("INFORME DE AUDITORÍA SST", 105, 20, null, null, "center");
            doc.setFontSize(10);
            doc.text("Basado en el Decreto 14.390/92 - Paraguay", 105, 30, null, null, "center");

            // Info Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("1. INFORMACIÓN GENERAL", 15, 50);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.text(`Empresa Auditada: ${empresa}`, 20, 58);
            doc.text(`Auditor Líder: ${lider}`, 20, 64);
            doc.text(`Fecha: ${fecha}`, 130, 58);
            doc.text(`Alcance: ${alcance}`, 130, 64);

            // Compliance Percentage Box
            doc.setDrawColor(0, 128, 128);
            doc.setLineWidth(0.5);
            doc.rect(130, 15, 65, 15);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(255, 255, 255);
            doc.text(`CUMPLIMIENTO: ${compliancePercent}%`, 162.5, 25, null, null, "center");

            // Checklist Section
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("2. VERIFICACIÓN DE CUMPLIMIENTO LEGAL", 15, 75);
            
            doc.setFontSize(8);
            let y = 85;
            
            // Table Header
            doc.setFillColor(240, 240, 240);
            doc.rect(15, y-4, 180, 6, 'F');
            doc.text("ESTADO", 20, y);
            doc.text("REQUISITO EVALUADO", 45, y);
            doc.text("HALLAZGOS / OBSERVACIONES", 120, y);
            y += 8;

            items.forEach(item => {
                const status = item.checked ? "CUMPLE" : "NO CUMPLE";
                doc.setFont("helvetica", item.checked ? "bold" : "normal");
                if (!item.checked) doc.setTextColor(180, 0, 0);
                doc.text(status, 20, y);
                doc.setTextColor(0, 0, 0);
                
                doc.setFont("helvetica", "normal");
                doc.text(item.text, 45, y);
                
                const splitObs = doc.splitTextToSize(item.observation, 70);
                doc.text(splitObs, 120, y);
                
                const lineIncrease = Math.max(splitObs.length * 4, 6);
                y += lineIncrease;
                
                // Add page if needed
                if (y > 270) {
                    doc.addPage();
                    y = 20;
                }
            });

            // General Findings
            y += 10;
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("3. CONCLUSIONES Y RECOMENDACIONES GENERALES", 15, y);
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const splitObsGeneral = doc.splitTextToSize(obsGeneral || "Se recomienda continuar con el plan de mejora continua y seguimiento de No Conformidades.", 180);
            doc.text(splitObsGeneral, 20, y + 10);

            // Footer / Signatures
            const footerY = 265;
            doc.line(40, footerY, 90, footerY);
            doc.text("Firma Auditor", 65, footerY + 5, null, null, "center");
            
            doc.line(120, footerY, 170, footerY);
            doc.text("Firma Responsable Empresa", 145, footerY + 5, null, null, "center");

            doc.save(`Informe_Auditoria_${empresa.replace(/\s/g, '_')}.pdf`);
            
            // UI Feedback
            const btn = auditoriaForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="material-symbols-outlined">done_all</span> Informe Generado';
            btn.classList.replace('bg-teal-600', 'bg-emerald-600');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.replace('bg-emerald-600', 'bg-teal-600');
                auditoriaForm.reset();
                closeAuditoriaFunc();
            }, 2000);
        };
    }

    // IPERC Matrix Logic
    const btnIperc = document.getElementById('btn-iperc');
    const ipercModal = document.getElementById('iperc-modal');
    const closeIpercBtn = document.getElementById('close-iperc-modal');
    const ipercContent = document.getElementById('iperc-content');
    const btnPrintIperc = document.getElementById('btn-print-iperc');

    const generateIpercData = () => {
        const risk = currentUser.risk || 'Medio';
        const activity = currentUser.activity || 'General';
        
        // Simulación de peligros por actividad
        let hazards = [
            { p: 'Posturas forzadas', r: 'Ergonómico', l: 'Bajo', m: 'Pausas activas' },
            { p: 'Contacto eléctrico', r: 'Eléctrico', l: 'Medio', m: 'Mantenimiento preventivo' }
        ];

        if (risk === 'Alto' || risk === 'Muy Alto') {
            hazards.push({ p: 'Caídas a distinto nivel', r: 'Mecánico', l: 'Alto', m: 'Uso de arnés y líneas de vida' });
            hazards.push({ p: 'Atrapamiento por maquinaria', r: 'Mecánico', l: 'Alto', m: 'Guardas de seguridad' });
        }

        return hazards;
    };

    const renderIperc = () => {
        if (!ipercContent) return;
        const hazards = generateIpercData();
        
        ipercContent.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-primary text-white text-[10px] uppercase">
                            <th class="p-3 border border-white/20">Peligro Identificado</th>
                            <th class="p-3 border border-white/20">Riesgo Asociado</th>
                            <th class="p-3 border border-white/20">Nivel de Riesgo</th>
                            <th class="p-3 border border-white/20">Medida de Control Propuesta</th>
                        </tr>
                    </thead>
                    <tbody class="text-xs">
                        ${hazards.map(h => `
                            <tr class="border-b border-outline-variant/10">
                                <td class="p-3 font-bold text-primary">${h.p}</td>
                                <td class="p-3">${h.r}</td>
                                <td class="p-3 font-black ${h.l === 'Alto' ? 'text-red-600' : 'text-orange-500'}">${h.l}</td>
                                <td class="p-3 italic text-on-surface-variant">${h.m}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 text-[11px] text-blue-800">
                <strong>Nota:</strong> Esta matriz ha sido generada automáticamente basada en el perfil de <strong>${currentUser.company}</strong> (Riesgo ${currentUser.risk}). Se recomienda validación por un profesional matriculado.
            </div>
        `;
    };

    if (btnIperc && ipercModal) {
        btnIperc.onclick = () => {
            renderIperc();
            ipercModal.classList.remove('hidden');
        };
        closeIpercBtn.onclick = () => ipercModal.classList.add('hidden');
    }

    if (btnPrintIperc) {
        btnPrintIperc.onclick = () => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('l', 'mm', 'a4');
            const hazards = generateIpercData();

            doc.setFontSize(18);
            doc.text(`MATRIZ IPERC - ${currentUser.company.toUpperCase()}`, 148.5, 20, null, null, "center");
            
            doc.setFontSize(10);
            doc.text(`RUC: ${currentUser.ruc} | Riesgo: ${currentUser.risk} | Trabajadores: ${currentUser.workers}`, 148.5, 28, null, null, "center");
            
            let y = 40;
            doc.setFillColor(0, 45, 123);
            doc.rect(10, y, 277, 8, 'F');
            doc.setTextColor(255,255,255);
            doc.setFontSize(9);
            doc.text("PELIGRO", 15, y+5);
            doc.text("RIESGO", 80, y+5);
            doc.text("NIVEL", 150, y+5);
            doc.text("CONTROL", 200, y+5);

            doc.setTextColor(0,0,0);
            y += 15;
            hazards.forEach(h => {
                doc.text(h.p, 15, y);
                doc.text(h.r, 80, y);
                doc.text(h.l, 150, y);
                doc.text(doc.splitTextToSize(h.m, 80), 200, y);
                y += 12;
            });

            doc.save(`IPERC_${currentUser.company.replace(/\s/g, '_')}.pdf`);
        };
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
