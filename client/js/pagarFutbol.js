document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN ---
    const PRECIO_UNITARIO = 30000;
    const SERVER_URL = "http://localhost:3000"; 
    // TU PUBLIC KEY DE VENDEDOR
    const PUBLIC_KEY = "APP_USR-e9d2f9d6-6ca7-4aea-8dbe-758ea522b4e2"; 

    // --- VARIABLES ---
    let reservations = [];
    let TOTAL_A_PAGAR = 0;
    let PREFERENCE_ID = null;

    // --- DOM REFERENCES ---
    // Botones y Radios
    const radioDebito = document.getElementById('radio-debito');
    const radioMp = document.getElementById('radio-mp');
    const mainActionBtn = document.getElementById('main-action-btn');
    const backBtn = document.getElementById('back-btn');
    
    // Contenedores
    const selectionContainer = document.getElementById('selection-container'); // Radios + Form Débito
    const debitoFormContainer = document.getElementById('debito-form-container');
    const mpBrickContainer = document.getElementById('mp-brick-container'); // Donde va el brick
    const loadingMessage = document.getElementById('loading-message');
    const walletBrickTarget = document.getElementById('walletBrick_container');

    // Resumen
    const finalTotalElement = document.getElementById('final-total');
    const summaryDivider = document.querySelector('.summary-divider');
    const summaryListContainer = document.querySelector('.order-summary');

    // --- 1. CARGA DE DATOS ---
    const reservationsJSON = localStorage.getItem('tempReservations');
    const totalAmountString = localStorage.getItem('tempTotal');

    if (reservationsJSON && totalAmountString) {
        reservations = JSON.parse(reservationsJSON);
        TOTAL_A_PAGAR = parseInt(totalAmountString);
    } else {
        reservations = [{ day: 'Prueba', time: '00:00', price: PRECIO_UNITARIO }];
        TOTAL_A_PAGAR = PRECIO_UNITARIO;
    }

    // --- 2. RENDERIZADO RESUMEN ---
    const formatCurrency = (val) => `$${val.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
    
    function renderSummary() {
        if (!summaryListContainer) return;
        // Limpiamos ítems anteriores si los hubiera (para evitar duplicados al recargar)
        // Nota: Si summaryDivider es tu referencia, asegúrate de no duplicar insertando múltiples veces.
        
        const itemsHTML = reservations.map((res, i) => `
            <div class="summary-item">
                <span class="item-name">Cancha ${i+1}: ${res.day} ${res.time}</span>
                <span class="item-value">${formatCurrency(res.price)}</span>
            </div>`).join('');
        
        summaryDivider.insertAdjacentHTML('beforebegin', itemsHTML);
        if (finalTotalElement) finalTotalElement.textContent = formatCurrency(TOTAL_A_PAGAR);
        updateButtonText();
    }

    function updateButtonText() {
        if (radioDebito.checked) {
            mainActionBtn.textContent = `Pagar ${formatCurrency(TOTAL_A_PAGAR)} con Tarjeta`;
        } else {
            mainActionBtn.textContent = `Generar botón de Mercado Pago`;
        }
    }

    // --- 3. LÓGICA DE NAVEGACIÓN (UI) ---

    // Cambio entre Débito y MP (Radio Buttons)
    function handleMethodChange() {
        if (radioDebito.checked) {
            debitoFormContainer.style.display = 'block';
        } else {
            debitoFormContainer.style.display = 'none';
        }
        updateButtonText();
    }

    // Ir a la vista de Brick (Oculta selección, muestra MP y Flecha)
    function showBrickView() {
        selectionContainer.style.display = 'none'; // Ocultar radios
        mainActionBtn.style.display = 'none';      // Ocultar botón principal
        
        mpBrickContainer.style.display = 'block';  // Mostrar contenedor MP
        backBtn.style.display = 'block';           // MOSTRAR FLECHA ATRÁS
    }

    // Volver a la vista de Selección (Reset)
    function handleBackClick() {
        // Limpiar el Brick para que se regenere limpio si entra de nuevo
        walletBrickTarget.innerHTML = ''; 
        PREFERENCE_ID = null; // Reseteamos preferencia para forzar nueva si es necesario

        mpBrickContainer.style.display = 'none';
        backBtn.style.display = 'none';            // OCULTAR FLECHA

        selectionContainer.style.display = 'block'; // Volver a mostrar radios
        mainActionBtn.style.display = 'block';      // Volver a mostrar botón
        mainActionBtn.disabled = false;
        mainActionBtn.textContent = "Generar botón de Mercado Pago";
    }

    // --- 4. MERCADO PAGO ---
    const mp = new MercadoPago(PUBLIC_KEY, { locale: "es-AR" });
    const bricksBuilder = mp.bricks();

    async function loadMercadoPago() {
        mainActionBtn.disabled = true;
        mainActionBtn.textContent = "Cargando...";
        
        // Mostrar vista de carga/brick inmediatamente para mejor UX
        showBrickView();
        loadingMessage.style.display = 'block';

        try {
            const orderData = {
                title: `Reserva Complejo Q (${reservations.length} turnos)`,
                quantity: 1,
                price: TOTAL_A_PAGAR
            };

            const response = await fetch(`${SERVER_URL}/create_preference`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });
            
            const data = await response.json();
            
            if (data.id) {
                PREFERENCE_ID = data.id;
                loadingMessage.style.display = 'none';
                
                // Renderizar Brick
                bricksBuilder.create("wallet", "walletBrick_container", {
                    initialization: { preferenceId: PREFERENCE_ID },
                    customization: { 
                        visual: { 
                            // CAMBIO AQUÍ: 'default' pone el botón AZUL oficial
                            buttonBackground: 'default', 
                            borderRadius: '16px' 
                        },
                        texts: {
                            action: 'pay',
                            valueProp: 'security_safety',
                        }
                    }
                });
            }
        } catch (error) {
            console.error(error);
            alert("Error al cargar Mercado Pago. Intenta nuevamente.");
            handleBackClick(); // Volver atrás si falla
        }
    }

    // --- 5. MANEJO DEL CLICK PRINCIPAL ---
    mainActionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (radioDebito.checked) {
            alert("Lógica de pago con Tarjeta (Simulada)");
        } else {
            // El usuario eligió MP y confirmó -> Vamos a la vista de Brick
            loadMercadoPago();
        }
    });

    // --- INITIALIZATION ---
    renderSummary();
    
    // Listeners
    radioDebito.addEventListener('change', handleMethodChange);
    radioMp.addEventListener('change', handleMethodChange);
    backBtn.addEventListener('click', handleBackClick); // Listener de la flecha

    handleMethodChange(); // Set estado inicial
});