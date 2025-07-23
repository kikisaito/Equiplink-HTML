document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const favoritoForm = document.getElementById('favoritoForm');
    const favoritosTableBody = document.querySelector('#favoritosTable tbody');
    const filterUsuarioIdInput = document.getElementById('filterUsuarioId');
    const filterEquipoIdInput = document.getElementById('filterEquipoId');
    const btnFilterUsuario = document.getElementById('btnFilterUsuario');
    const btnFilterEquipo = document.getElementById('btnFilterEquipo');
    const btnClearFilters = document.getElementById('btnClearFilters');

    // Base URL de tu API
    const BASE_API_URL = 'http://localhost:8000/api/favoritos'; // ¡AJUSTA ESTA URL SI TU SERVIDOR NO ESTÁ EN LOCALHOST:8080!

    // --- Funciones para interactuar con la API ---

    // Obtener todos los favoritos o favoritos filtrados
    async function fetchFavoritos(url = BASE_API_URL) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Error al cargar favoritos: ${response.status} - ${errorData}`);
            }
            const favoritos = await response.json();
            displayFavoritos(favoritos);
        } catch (error) {
            console.error('Error fetching favoritos:', error);
            alert('Error al cargar los favoritos: ' + error.message);
            favoritosTableBody.innerHTML = '<tr><td colspan="5">Error al cargar datos.</td></tr>';
        }
    }

    // Crear un nuevo favorito
    async function createFavorito(favoritoData) {
        try {
            const response = await fetch(BASE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(favoritoData)
            });

            if (!response.ok) {
                const errorData = await response.json(); // Tu controlador devuelve JSON en errores
                throw new Error(`Error al guardar favorito: ${response.status} - ${errorData}`);
            }

            const savedFavorito = await response.json();
            console.log('Favorito guardado exitosamente:', savedFavorito);
            alert('Favorito guardado exitosamente!');
            favoritoForm.reset(); // Limpiar el formulario
            fetchFavoritos(); // Actualizar la lista
        } catch (error) {
            console.error('Error al guardar favorito:', error);
            alert('Error al guardar favorito: ' + error.message);
        }
    }

    // Eliminar un favorito por ID
    async function deleteFavorito(idFavorito) {
        try {
            const response = await fetch(`${BASE_API_URL}/${idFavorito}`, {
                method: 'DELETE'
            });

            if (response.status === 204) { // NO_CONTENT
                console.log(`Favorito con ID ${idFavorito} eliminado con éxito.`);
                alert(`Favorito eliminado con éxito!`);
                fetchFavoritos(); // Actualizar la lista
            } else if (response.ok) { // Si retorna 200 OK con algún cuerpo, lo manejamos
                 console.log(`Favorito con ID ${idFavorito} eliminado con éxito (respuesta 200 OK).`);
                 alert(`Favorito eliminado con éxito!`);
                 fetchFavoritos();
            } else {
                const errorData = await response.json();
                throw new Error(`Error al eliminar favorito: ${response.status} - ${errorData}`);
            }
        } catch (error) {
            console.error('Error en deleteFavorito:', error);
            alert('Error al eliminar el favorito: ' + error.message);
        }
    }

    // --- Funciones para manipular el DOM ---

    // Mostrar favoritos en la tabla
    function displayFavoritos(favoritos) {
        favoritosTableBody.innerHTML = ''; // Limpiar tabla
        if (favoritos.length === 0) {
            favoritosTableBody.innerHTML = '<tr><td colspan="5">No hay favoritos registrados para el filtro actual.</td></tr>';
            return;
        }

        favoritos.forEach(fav => {
            const row = favoritosTableBody.insertRow();
            row.insertCell().textContent = fav.idFavorito;
            // Accedemos a los IDs de Usuario y Equipo directamente desde los objetos anidados
            row.insertCell().textContent = fav.usuario ? fav.usuario.idUsuario : 'N/A'; 
            row.insertCell().textContent = fav.equipo ? fav.equipo.idEquipo : 'N/A';
            row.insertCell().textContent = fav.fechaAgregado ? new Date(fav.fechaAgregado).toLocaleString() : 'N/A';

            const actionsCell = row.insertCell();
            
            // Botón de eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('btn-danger', 'btn-small');
            deleteButton.addEventListener('click', async () => {
                if (confirm(`¿Estás seguro de que quieres eliminar el favorito con ID: ${fav.idFavorito}?`)) {
                    await deleteFavorito(fav.idFavorito);
                }
            });
            actionsCell.appendChild(deleteButton);
        });
    }

    // --- Manejadores de eventos ---

    // Manejar el envío del formulario de creación
    favoritoForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar recarga de página

        const idUsuario = document.getElementById('idUsuario').value;
        const idEquipo = document.getElementById('idEquipo').value;

        // Construir el objeto Favorito según el modelo Java
        // Solo necesitamos enviar los IDs de usuario y equipo anidados
        const nuevoFavorito = {
            usuario: { idUsuario: parseInt(idUsuario) },
            equipo: { idEquipo: parseInt(idEquipo) }
        };
        
        await createFavorito(nuevoFavorito);
    });

    // Manejar filtro por ID de Usuario
    btnFilterUsuario.addEventListener('click', () => {
        const idUsuario = filterUsuarioIdInput.value;
        if (idUsuario) {
            fetchFavoritos(`${BASE_API_URL}/usuario/${idUsuario}`);
        } else {
            alert('Por favor, ingresa un ID de Usuario para filtrar.');
        }
    });

    // Manejar filtro por ID de Equipo
    btnFilterEquipo.addEventListener('click', () => {
        const idEquipo = filterEquipoIdInput.value;
        if (idEquipo) {
            fetchFavoritos(`${BASE_API_URL}/equipo/${idEquipo}`);
        } else {
            alert('Por favor, ingresa un ID de Equipo para filtrar.');
        }
    });

    // Manejar botón para mostrar todos los favoritos y limpiar filtros
    btnClearFilters.addEventListener('click', () => {
        filterUsuarioIdInput.value = ''; // Limpiar campo de usuario
        filterEquipoIdInput.value = ''; // Limpiar campo de equipo
        fetchFavoritos(); // Cargar todos los favoritos
    });

    // Cargar todos los favoritos al cargar la página inicialmente
    fetchFavoritos();
});