document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LECTURA Y CONFIGURACIÓN DE DATOS DINÁMICOS ---
    
    const PRECIO_UNITARIO = 30000;
    
    // Obtener los datos del localStorage
    const reservationsJSON = localStorage.getItem('tempReservations');
    const totalAmountString = localStorage.getItem('tempTotal'); 
    
    let reservations = [];
    let TOTAL_A_PAGAR = 0;

    if (reservationsJSON && totalAmountString) {
        // ✅ Parsear el JSON y el Total
        reservations = JSON.parse(reservationsJSON);
        TOTAL_A_PAGAR = parseInt(totalAmountString);
    } else {
        // Fallback: Si no hay datos (ej: el usuario accede directamente a pagar.html)
        console.error('No se encontraron datos de reserva. Usando un slot de ejemplo.');
        reservations = [{ day: 'Viernes', time: '15:00', price: PRECIO_UNITARIO }];
        TOTAL_A_PAGAR = PRECIO_UNITARIO;
    }

    const CANTIDAD_SLOTS = reservations.length;
    
    // --- 2. Referencias del DOM ---
    const debitoRadio = document.getElementById('radio-debito');
    const mpRadio = document.getElementById('radio-mp');
    const debitoFormContainer = document.getElementById('debito-form-container');
    const nextButton = document.getElementById('next-button');
    const finalTotalElement = document.getElementById('final-total');
    
    // Contenedores del resumen: Usamos el contenedor que tiene el primer ítem
    const summaryListContainer = document.querySelector('.order-summary');
    const summaryDivider = document.querySelector('.summary-divider');
    
    // --- 3. Renderizar las Reservas y Actualizar el Total ---
    
    const formatCurrency = (amount) => {
        return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
    };

    // ❌ Eliminar el contenido estático que no necesitamos (ej: el primer summary-item)
    // Es mejor reconstruir toda la lista para evitar errores:
    const pluralText = CANTIDAD_SLOTS === 1 ? 'Hora' : 'Horarios';
    // Creamos un fragmento de HTML con los ítems dinámicos
    const reservationItemsHTML = reservations.map((reserva, index) => {
        return `
            <div class="summary-item">
                <span class="item-name">Reserva Cancha ${index + 1} ${pluralText}: ${reserva.day}  ${reserva.time}</span>
                <span class="item-value">${formatCurrency(reserva.price)}</span>
            </div>
        `;
    }).join('');

    // Insertamos la lista de reservas justo antes del divisor
    if (summaryListContainer && summaryDivider) {
         // Antes de insertar, eliminamos cualquier contenido anterior del resumen que no sea el header/footer
        let currentItem = summaryListContainer.firstElementChild;
        while (currentItem !== summaryDivider) {
            let nextItem = currentItem.nextElementSibling;
            if (currentItem.classList && currentItem.classList.contains('summary-item')) {
                 currentItem.remove();
            }
            currentItem = nextItem;
        }


        // Insertamos el nuevo contenido de la reserva
        summaryDivider.insertAdjacentHTML('beforebegin', reservationItemsHTML);
        
        // Opcional: Mostrar el subtotal total de slots
        const subtotalHTML = `
            <div class="summary-item">
                <span class="item-name">Subtotal (${CANTIDAD_SLOTS} Horarios)</span>
                <span class="item-value">${formatCurrency(TOTAL_A_PAGAR)}</span>
            </div>
        `;
        summaryDivider.insertAdjacentHTML('beforebegin', subtotalHTML);
        
    }
    
    // Actualizar el total visible
    finalTotalElement.textContent = formatCurrency(TOTAL_A_PAGAR);
    nextButton.textContent = `Pagar ${formatCurrency(TOTAL_A_PAGAR)}`;


    // --- 4. Lógica de Manejo de Pago (Se mantiene) ---
    
    function handlePaymentMethodChange() {
        if (debitoRadio.checked) {
            debitoFormContainer.style.display = 'block';
            nextButton.textContent = `Pagar ${formatCurrency(TOTAL_A_PAGAR)}`;

        } else if (mpRadio.checked) {
            debitoFormContainer.style.display = 'none';
            nextButton.textContent = `Continuar con Mercado Pago`;
        }
    }
    
    function handleNextButtonClick(event) {
        event.preventDefault();

        if (debitoRadio.checked) {
            alert(`Procesando pago con Tarjeta por ${formatCurrency(TOTAL_A_PAGAR)}. (Datos: ${document.getElementById('card-number').value})`);
            
        } else if (mpRadio.checked) {
            const MP_REDIRECT_URL = 'https://www.mercadopago.com.ar/checkout/v1/redirect_url_ejemplo';
            alert('Redirigiendo a Mercado Pago para pago.');
            window.location.href = MP_REDIRECT_URL;
        }
    }

    // --- Event Listeners y Ejecución Inicial ---
    
    document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    nextButton.addEventListener('click', handleNextButtonClick);

    // Inicializar el estado de la página
    handlePaymentMethodChange(); 
});