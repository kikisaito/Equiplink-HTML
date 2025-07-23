document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const historialBusquedaForm = document.getElementById('historialBusquedaForm');
    const historialBusquedaTableBody = document.querySelector('#historialBusquedaTable tbody');
    const filterUsuarioIdInput = document.getElementById('filterUsuarioId');
    const filterTerminoInput = document.getElementById('filterTermino');
    const btnFilterUsuario = document.getElementById('btnFilterUsuario');
    const btnFilterTermino = document.getElementById('btnFilterTermino');
    const btnClearHistorialUsuario = document.getElementById('btnClearHistorialUsuario');
    const btnClearFilters = document.getElementById('btnClearFilters');

    // Base URL de tu API
    const BASE_API_URL = 'http://localhost:8000/api/historial-busquedas'; // ¡AJUSTA ESTA URL SI TU SERVIDOR NO ESTÁ EN LOCALHOST:8080!

    // --- Funciones para interactuar con la API ---

    // Obtener todo el historial de búsquedas o historial filtrado
    async function fetchHistorial(url = BASE_API_URL) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error al cargar historial: ${response.status} - ${errorData}`);
            }
            const historial = await response.json();
            displayHistorial(historial);
        } catch (error) {
            console.error('Error fetching historial:', error);
            alert('Error al cargar el historial de búsquedas: ' + error.message);
            historialBusquedaTableBody.innerHTML = '<tr><td colspan="5">Error al cargar datos.</td></tr>';
        }
    }

    // Registrar una nueva búsqueda
    async function registrarBusqueda(busquedaData) {
        try {
            const response = await fetch(BASE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(busquedaData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Tu controlador devuelve JSON en errores
                throw new Error(`Error al registrar búsqueda: ${response.status} - ${errorData}`);
            }

            const savedBusqueda = await response.json();
            console.log('Búsqueda registrada exitosamente:', savedBusqueda);
            alert('Búsqueda registrada exitosamente!');
            historialBusquedaForm.reset(); // Limpiar el formulario
            fetchHistorial(); // Actualizar la lista
        } catch (error) {
            console.error('Error al registrar búsqueda:', error);
            alert('Error al registrar búsqueda: ' + error.message);
        }
    }

    // Eliminar una búsqueda por ID
    async function eliminarBusqueda(idBusqueda) {
        try {
            const response = await fetch(`${BASE_API_URL}/${idBusqueda}`, {
                method: 'DELETE'
            });

            if (response.status === 204) { // NO_CONTENT
                console.log(`Búsqueda con ID ${idBusqueda} eliminada con éxito.`);
                alert(`Búsqueda eliminada con éxito!`);
                fetchHistorial(); // Actualizar la lista
            } else if (response.ok) { // Si retorna 200 OK con algún cuerpo, lo manejamos
                 console.log(`Búsqueda con ID ${idBusqueda} eliminada con éxito (respuesta 200 OK).`);
                 alert(`Búsqueda eliminada con éxito!`);
                 fetchHistorial();
            } else {
                const errorData = await response.json();
                throw new Error(`Error al eliminar búsqueda: ${response.status} - ${errorData}`);
            }
        } catch (error) {
            console.error('Error en eliminarBusqueda:', error);
            alert('Error al eliminar la búsqueda: ' + error.message);
        }
    }

    // Limpiar historial de un usuario
    async function limpiarHistorialUsuario(idUsuario) {
        try {
            const response = await fetch(`${BASE_API_URL}/usuario/${idUsuario}`, {
                method: 'DELETE'
            });

            if (response.status === 204) { // NO_CONTENT
                console.log(`Historial del usuario ${idUsuario} limpiado con éxito.`);
                alert(`Historial del usuario ${idUsuario} limpiado con éxito!`);
                fetchHistorial(); // Actualizar la lista
            } else if (response.ok) { // Si retorna 200 OK con algún cuerpo, lo manejamos
                console.log(`Historial del usuario ${idUsuario} limpiado con éxito (respuesta 200 OK).`);
                alert(`Historial del usuario ${idUsuario} limpiado con éxito!`);
                fetchHistorial();
            }else {
                const errorData = await response.json();
                throw new Error(`Error al limpiar historial: ${response.status} - ${errorData}`);
            }
        } catch (error) {
            console.error('Error en limpiarHistorialUsuario:', error);
            alert('Error al limpiar el historial del usuario: ' + error.message);
        }
    }

    // --- Funciones para manipular el DOM ---

    // Mostrar historial en la tabla
    function displayHistorial(historial) {
        historialBusquedaTableBody.innerHTML = ''; // Limpiar tabla
        if (historial.length === 0) {
            historialBusquedaTableBody.innerHTML = '<tr><td colspan="5">No hay búsquedas registradas para el filtro actual.</td></tr>';
            return;
        }

        historial.forEach(busqueda => {
            const row = historialBusquedaTableBody.insertRow();
            row.insertCell().textContent = busqueda.idBusqueda;
            // Accedemos al ID de Usuario desde el objeto anidado
            row.insertCell().textContent = busqueda.usuario ? busqueda.usuario.idUsuario : 'N/A'; 
            row.insertCell().textContent = busqueda.terminoBusqueda;
            row.insertCell().textContent = busqueda.fechaBusqueda ? new Date(busqueda.fechaBusqueda).toLocaleString() : 'N/A';

            const actionsCell = row.insertCell();
            
            // Botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('btn-danger', 'btn-small');
            deleteButton.addEventListener('click', async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar la búsqueda con ID: ${busqueda.idBusqueda}?`)) {
                    await eliminarBusqueda(busqueda.idBusqueda);
                }
            });
            actionsCell.appendChild(deleteButton);
        });
    }

    // --- Manejadores de eventos ---

    // Manejar el envío del formulario de registro de búsqueda
    historialBusquedaForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar recarga de página

        const idUsuario = document.getElementById('idUsuario').value;
        const terminoBusqueda = document.getElementById('terminoBusqueda').value;

        // Construir el objeto HistorialBusqueda según el modelo Java
        const nuevaBusqueda = {
            usuario: { idUsuario: parseInt(idUsuario) }, // Solo necesitamos el ID del usuario
            terminoBusqueda: terminoBusqueda
        };
        
        await registrarBusqueda(nuevaBusqueda);
    });

    // Manejar filtro por ID de Usuario
    btnFilterUsuario.addEventListener('click', () => {
        const idUsuario = filterUsuarioIdInput.value;
        if (idUsuario) {
            fetchHistorial(`${BASE_API_URL}/usuario/${idUsuario}`);
        } else {
            alert('Por favor, ingresa un ID de Usuario para filtrar.');
        }
    });

    // Manejar filtro por Término de Búsqueda
    btnFilterTermino.addEventListener('click', () => {
        const termino = filterTerminoInput.value;
        if (termino) {
            fetchHistorial(`${BASE_API_URL}/buscar?termino=${encodeURIComponent(termino)}`);
        } else {
            alert('Por favor, ingresa un término de búsqueda para filtrar.');
        }
    });

    // Manejar limpieza de historial por ID de Usuario
    btnClearHistorialUsuario.addEventListener('click', async () => {
        const idUsuario = filterUsuarioIdInput.value;
        if (idUsuario) {
            if (confirm(`¿Estás seguro de que quieres limpiar todo el historial de búsqueda del usuario con ID: ${idUsuario}?`)) {
                await limpiarHistorialUsuario(idUsuario);
            }
        } else {
            alert('Por favor, ingresa el ID de Usuario para limpiar su historial.');
        }
    });

    // Manejar botón para mostrar todo el historial y limpiar filtros
    btnClearFilters.addEventListener('click', () => {
        filterUsuarioIdInput.value = ''; // Limpiar campo de usuario
        filterTerminoInput.value = ''; // Limpiar campo de término
        fetchHistorial(); // Cargar todo el historial
    });

    // Cargar todo el historial de búsqueda al cargar la página inicialmente
    fetchHistorial();
});