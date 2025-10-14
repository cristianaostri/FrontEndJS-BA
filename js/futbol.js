document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los elementos con la clase .time-slot
    const timeSlots = document.querySelectorAll('.time-slot');

    // Itera sobre cada uno de los turnos
    timeSlots.forEach(slot => {
        // Agrega un detector de eventos 'click' a cada uno
        slot.addEventListener('click', () => {
            // Verifica si el turno está disponible antes de hacer algo
            if (slot.classList.contains('available')) {
                // Alterna la clase 'selected' para marcarlo/desmarcarlo
                slot.classList.toggle('selected');

                // Opcional: Muestra en consola el turno seleccionado
                if (slot.classList.contains('selected')) {
                    const day = slot.dataset.day;
                    const time = slot.dataset.time;
                    console.log(`Turno seleccionado: Día ${day} a las ${time}:00 hs.`);
                }
            }
        });
        
    });
});

