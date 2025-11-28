document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. CONSTANTES Y ESTADO GLOBAL ---
    
    const MAX_RESERVATIONS = 2; 
    const nextButton = document.querySelector('.siguiente');
    
    // Función auxiliar para obtener todos los slots seleccionados
    const getSelectedSlots = () => document.querySelectorAll('.time-slot.selected');

    // 2. Inicializar la escucha de eventos en TODOS los slots clicables
    const timeSlots = document.querySelectorAll('.time-slot');

    timeSlots.forEach(slot => {
        // Solo añadimos el listener a slots que no están ya reservados/pendientes al inicio
        if (slot.classList.contains('available') || slot.classList.contains('selected')) {
             slot.addEventListener('click', handleReservationClick);
        }
    });
    
    // Inicializar el botón Siguiente como deshabilitado
    if (nextButton) {
        nextButton.disabled = true;
        // Asignar el evento de redirección/guardado al botón
        nextButton.addEventListener('click', redirectToPayment);
    }

    // Aseguramos el estado visual inicial
    updateSlotVisuals();


    /**
     * Función que maneja el clic y aplica la limitación de 2 reservas.
     */
    function handleReservationClick(event) {
        const clickedSlot = event.currentTarget;
        const currentSelected = getSelectedSlots().length;
        
        // El slot debe estar disponible o ya seleccionado (para desmarcar)
        if (!clickedSlot.classList.contains('available') && !clickedSlot.classList.contains('selected')) {
            return; 
        }

        // --- Lógica de SELECCIÓN/DES-SELECCIÓN ---

        if (clickedSlot.classList.contains('selected')) {
            // Caso 1: DES-SELECCIÓN (Siempre permitido)
            clickedSlot.classList.remove('selected');
            clickedSlot.classList.add('available');
            
        } else if (currentSelected < MAX_RESERVATIONS) {
            // Caso 2: SELECCIÓN VÁLIDA (Dentro del límite)
            clickedSlot.classList.add('selected');
            clickedSlot.classList.remove('available');
            
        } else {
            // Caso 3: LÍMITE ALCANZADO (No permitimos la selección)
            alert(`Solo puedes seleccionar un máximo de ${MAX_RESERVATIONS} horarios por semana.`);
            return; 
        }
        
        // 3. Actualizar el estado visual de los slots y el botón
        updateSlotVisuals();
        updateNextButtonState(); 
    }
    
    /**
     * Habilita/deshabilita visualmente los slots cuando se alcanza el límite.
     */
    function updateSlotVisuals() {
        const currentSelected = getSelectedSlots().length;
        const slotsToUpdate = document.querySelectorAll('.time-slot.available');

        if (currentSelected >= MAX_RESERVATIONS) {
            // Deshabilita visualmente el resto de los slots disponibles
            slotsToUpdate.forEach(slot => {
                slot.classList.add('limit-reached'); 
            });
        } else {
            // Restaura la apariencia normal
            slotsToUpdate.forEach(slot => {
                slot.classList.remove('limit-reached');
            });
        }
    }

    /**
     * Gestiona el estado de habilitación del botón "Siguiente".
     */
    function updateNextButtonState() {
        const currentSelected = getSelectedSlots().length;

        if (nextButton) {
            // El botón se habilita si hay 1 o 2 slots seleccionados
            nextButton.disabled = currentSelected === 0; 
        }
    }
    
    /**
     * Función que guarda los datos y navega a la página de pago.
     */
    function redirectToPayment() {
        // Aseguramos que haya algo seleccionado antes de guardar y redirigir
        if (getSelectedSlots().length === 0) {
            alert("Selecciona al menos un horario para continuar.");
            return;
        }
        saveReservationData(); 
        window.location.href = '../html/futbolPago.html'; 
    }
    
    // --- (Aquí iría la función getDayName auxiliar) ---
    function getDayName(dayNumber) {
        const days = {
            '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves',
            '5': 'Viernes', '6': 'Sábado', '7': 'Domingo'
        };
        return days[dayNumber] || 'Día Desconocido';
    }

    // La función saveReservationData es la que habías proporcionado
    function saveReservationData() {
        const selectedSlots = getSelectedSlots(); // Usar la función auxiliar
        const reservations = [];
        const PRECIO_UNITARIO = 30000; 
    
        selectedSlots.forEach(slot => {
            const day = slot.getAttribute('data-day');
            const time = slot.getAttribute('data-time');
            
            reservations.push({
                day: getDayName(day),
                time: `${time}:00`,
                price: PRECIO_UNITARIO 
            });
        });
    
        const totalSlots = reservations.length;
        const totalAmount = totalSlots * PRECIO_UNITARIO;
    
        localStorage.setItem('tempReservations', JSON.stringify(reservations));
        localStorage.setItem('tempTotal', totalAmount);
    }
});