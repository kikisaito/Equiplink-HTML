function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Cierra cualquier modal por su ID
function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Adicional: Si el modal de filtro tiene la confirmación abierta, la oculta también.
        if (modalId === 'modalFiltro') {
            ocultarConfirmacionFiltro();
        }
    }
}


// Función para manejar la selección de equipo (solo uno activo a la vez)
function seleccionarEquipo(botonSeleccionado) {
    // Busca todos los botones de equipo dentro del mismo contenedor
    const botones = botonSeleccionado.parentElement.querySelectorAll('.btn-equipo');
    // Quita la clase 'activo' de todos
    botones.forEach(boton => {
        boton.classList.remove('activo');
    });
    // Añade la clase 'activo' solo al botón clickeado
    botonSeleccionado.classList.add('activo');
}

// Muestra la capa de confirmación
function mostrarConfirmacionFiltro() {
    const confirmacion = document.getElementById('confirmacionFiltro');
    if (confirmacion) {
        confirmacion.style.display = 'flex'; // Usamos flex para centrar el contenido
    }
}

// Oculta la capa de confirmación
function ocultarConfirmacionFiltro() {
    const confirmacion = document.getElementById('confirmacionFiltro');
    if (confirmacion) {
        confirmacion.style.display = 'none';
    }
}

// Función que se ejecuta al confirmar los filtros
function aplicarFiltros() {
    console.log("Filtros aplicados. Aquí iría la lógica para buscar y mostrar resultados.");
    // 1. Oculta la confirmación
    ocultarConfirmacionFiltro();
    // 2. Cierra el modal principal de filtros
    cerrarModal('modalFiltro');
}

// Limpia todos los campos del formulario de filtros
function limpiarFiltros() {
    document.getElementById('minPrecio').value = '';
    document.getElementById('maxPrecio').value = '';
    document.getElementById('anoModelo').value = '';
    document.getElementById('infoGarantia').value = '';

    // Quita la selección de cualquier botón de equipo
    const botones = document.querySelectorAll('#modalFiltro .btn-equipo');
    botones.forEach(boton => {
        boton.classList.remove('activo');
    });

    console.log("Filtros limpiados.");
}