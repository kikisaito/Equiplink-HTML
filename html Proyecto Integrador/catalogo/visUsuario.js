// visUsuario.js

let isCompanyUser = false; // Estado de la sesión de compañía

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos de filtro HTML
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const aplicarPrecioFiltroBtn = document.getElementById('aplicarPrecioFiltro');
    const tipoEquipoFiltroSelect = document.getElementById('tipoEquipoFiltro');
    const clearFiltersBtn = document.getElementById('clearFilters');

    // Referencias a elementos de la interfaz de compañía
    const loginCompanyBtn = document.getElementById('loginCompanyBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const addEquipoBtn = document.getElementById('addEquipoBtn');
    const hiddenOnCompanyElements = document.querySelectorAll('.hidden-on-company');

    // Referencias al modal
    const equipoModal = document.getElementById('equipoModal');
    const closeButton = equipoModal.querySelector('.close-button');
    const equipoForm = document.getElementById('equipoForm');
    const modalTitle = document.getElementById('modalTitle');

    // Inicializar estado de usuario al cargar la página
    isCompanyUser = localStorage.getItem('isCompanyUser') === 'true';
    updateUIForUserRole();

    // Cargar dinámicamente los tipos de equipo al inicio
    loadTiposEquipo();

    // Al cargar la página, la primera acción es siempre mostrar el catálogo de equipos médicos.
    fetchEquiposMedicos();

    // --- Event Listeners para la simulación de sesión ---
    loginCompanyBtn.addEventListener('click', () => {
        isCompanyUser = true;
        localStorage.setItem('isCompanyUser', 'true');
        updateUIForUserRole();
        alert('¡Has iniciado sesión como usuario Compañía!');
        fetchEquiposMedicos(); // Recargar equipos para mostrar/ocultar botones de eliminar
    });

    logoutBtn.addEventListener('click', () => {
        isCompanyUser = false;
        localStorage.removeItem('isCompanyUser');
        updateUIForUserRole();
        alert('Has cerrado sesión.');
        fetchEquiposMedicos(); // Recargar equipos para mostrar/ocultar botones de eliminar
    });

    // --- Event Listeners para los filtros ---
    aplicarPrecioFiltroBtn.addEventListener('click', () => {
        const filters = getFilterParams();
        fetchEquiposMedicos(filters);
    });

    tipoEquipoFiltroSelect.addEventListener('change', () => {
        const filters = getFilterParams();
        fetchEquiposMedicos(filters);
    });

    clearFiltersBtn.addEventListener('click', () => {
        minPriceInput.value = '';
        maxPriceInput.value = '';
        tipoEquipoFiltroSelect.value = '';
        fetchEquiposMedicos();
    });

    // --- Event Listeners para el Modal de Agregar/Editar ---
    addEquipoBtn.addEventListener('click', () => {
        openEquipoModal(); // Abre el modal en modo "agregar"
    });

    closeButton.addEventListener('click', () => {
        closeEquipoModal();
    });

    // Cerrar modal al hacer clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === equipoModal) {
            closeEquipoModal();
        }
    });

    // Manejar el envío del formulario del modal
    equipoForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita que la página se recargue

        const equipoId = document.getElementById('equipoId').value;
        const equipoData = {
            nombreEquipo: document.getElementById('nombreEquipo').value,
            descripcion: document.getElementById('descripcion').value,
            precio: parseFloat(document.getElementById('precio').value),
            estado: document.getElementById('estado').value,
            imagenUrl: document.getElementById('imagenUrl').value,
            // Asumiendo que tu backend espera objetos anidados con solo el ID
            proveedor: { idProveedor: parseInt(document.getElementById('proveedorId').value) },
            tipoEquipo: { idTipo: parseInt(document.getElementById('tipoEquipoId').value) },
            marca: { idMarca: parseInt(document.getElementById('marcaId').value) }
        };

        if (equipoId) {
            // Modo edición
            await updateEquipoMedico(parseInt(equipoId), equipoData);
        } else {
            // Modo creación
            await createEquipoMedico(equipoData);
        }
        closeEquipoModal(); // Cierra el modal después de guardar
    });

    // --- Funciones de interfaz de usuario ---

    // Función para actualizar la UI según el rol del usuario
    function updateUIForUserRole() {
        if (isCompanyUser) {
            loginCompanyBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            addEquipoBtn.classList.remove('hidden');
            hiddenOnCompanyElements.forEach(el => el.classList.add('hidden'));
        } else {
            loginCompanyBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            addEquipoBtn.classList.add('hidden');
            hiddenOnCompanyElements.forEach(el => el.classList.remove('hidden'));
        }
        // Llamar a fetchEquiposMedicos para que las tarjetas se re-rendericen con/sin el botón de eliminar
        fetchEquiposMedicos(getFilterParams());
    }

    function openEquipoModal(equipo = null) {
        equipoForm.reset(); // Limpiar formulario
        if (equipo) {
            modalTitle.textContent = 'Editar Equipo Médico';
            document.getElementById('equipoId').value = equipo.idEquipo;
            document.getElementById('nombreEquipo').value = equipo.nombreEquipo;
            document.getElementById('descripcion').value = equipo.descripcion;
            document.getElementById('precio').value = equipo.precio;
            document.getElementById('estado').value = equipo.estado;
            document.getElementById('imagenUrl').value = equipo.imagenUrl;
            document.getElementById('proveedorId').value = equipo.proveedor ? equipo.proveedor.idProveedor : '';
            document.getElementById('tipoEquipoId').value = equipo.tipoEquipo ? equipo.tipoEquipo.idTipo : '';
            document.getElementById('marcaId').value = equipo.marca ? equipo.marca.idMarca : '';
        } else {
            modalTitle.textContent = 'Agregar Nuevo Equipo';
            document.getElementById('equipoId').value = '';
        }
        equipoModal.classList.remove('hidden');
    }

    function closeEquipoModal() {
        equipoModal.classList.add('hidden');
    }

    /**
     * ========================================
     * FUNCIONES PARA OBTENER Y MOSTRAR EQUIPOS
     * ========================================
     */

    function getFilterParams() {
        const minPrice = minPriceInput.value;
        const maxPrice = maxPriceInput.value;
        const tipoEquipo = tipoEquipoFiltroSelect.value;

        const filters = {};
        if (minPrice) {
            filters.minPrice = parseFloat(minPrice);
        }
        if (maxPrice) {
            filters.maxPrice = parseFloat(maxPrice);
        }
        if (tipoEquipo) {
            filters.tipoEquipo = parseInt(tipoEquipo);
        }
        return filters;
    }

    async function fetchEquiposMedicos(filters = {}) {
        const catalogo = document.querySelector('.catalogo');
        catalogo.innerHTML = '<p>Cargando equipos médicos...</p>';

        try {
            let url = 'http://localhost:8000/api/equipos-medicos';

            const queryParams = new URLSearchParams();
            for (const key in filters) {
                if (filters.hasOwnProperty(key) && filters[key] !== null && filters[key] !== undefined) {
                    queryParams.append(key, filters[key]);
                }
            }

            if (queryParams.toString()) {
                url += `?${queryParams.toString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`¡Error HTTP! Estado: ${response.status} - ${response.statusText}`);
            }

            const equipos = await response.json();
            displayEquiposMedicos(equipos);

        } catch (error) {
            console.error('Error al obtener los equipos médicos:', error);
            catalogo.innerHTML = '<p>Lo sentimos, no pudimos cargar los equipos en este momento. Inténtalo de nuevo más tarde.</p>';
        }
    }

    async function loadTiposEquipo() {
        const tipoEquipoSelect = document.getElementById('tipoEquipoFiltro');
        tipoEquipoSelect.innerHTML = '<option value="">Todos</option>';

        try {
            const response = await fetch('http://localhost:8000/api/tipos-equipo');
            if (!response.ok) {
                throw new Error(`Error al cargar tipos de equipo: ${response.status}`);
            }
            const tipos = await response.json();
            tipos.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipo;
                option.textContent = tipo.nombreTipo;
                tipoEquipoSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar tipos de equipo:', error);
        }
    }

    function displayEquiposMedicos(equipos) {
        const catalogo = document.querySelector('.catalogo');
        catalogo.innerHTML = '';

        if (equipos.length === 0) {
            catalogo.innerHTML = '<p>No hay equipos médicos disponibles que coincidan con los filtros.</p>';
            return;
        }

        equipos.forEach(equipo => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('producto');
            productDiv.dataset.idEquipo = equipo.idEquipo;

            const img = document.createElement('img');
            img.src = equipo.imagenUrl || 'imagenes/placeholder.png';
            img.alt = equipo.nombreEquipo || 'Equipo médico';

            const namePara = document.createElement('p');
            namePara.textContent = equipo.nombreEquipo;

            const priceSpan = document.createElement('span');
            priceSpan.textContent = `$${parseFloat(equipo.precio).toFixed(2)}`;

            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('product-details');

            if (equipo.marca && equipo.marca.nombreMarca) {
                const brandPara = document.createElement('p');
                brandPara.textContent = `Marca: ${equipo.marca.nombreMarca}`;
                detailsDiv.appendChild(brandPara);
            }
            if (equipo.tipoEquipo && equipo.tipoEquipo.nombreTipo) {
                const typePara = document.createElement('p');
                typePara.textContent = `Tipo: ${equipo.tipoEquipo.nombreTipo}`;
                detailsDiv.appendChild(typePara);
            }

            productDiv.appendChild(img);
            productDiv.appendChild(namePara);
            productDiv.appendChild(priceSpan);
            productDiv.appendChild(detailsDiv);

            // Botones de acción (Editar y Eliminar) - Visibles solo para usuarios de compañía
            if (isCompanyUser) {
                const actionsDiv = document.createElement('div');
                actionsDiv.classList.add('product-actions');

                const editButton = document.createElement('button');
                editButton.innerHTML = '<i class="fas fa-edit"></i>'; // Icono de editar
                editButton.classList.add('edit-btn', 'btn-secondary-outline');
                editButton.title = "Editar Equipo";
                editButton.addEventListener('click', () => {
                    openEquipoModal(equipo); // Abre el modal en modo "editar" con los datos del equipo
                });
                actionsDiv.appendChild(editButton);

                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Icono de basura
                deleteButton.classList.add('delete-btn', 'btn-danger');
                deleteButton.title = "Eliminar Equipo";
                deleteButton.addEventListener('click', async (event) => {
                    event.stopPropagation();
                    const idToDelete = parseInt(productDiv.dataset.idEquipo);
                    if (idToDelete) {
                        await deleteEquipoMedico(idToDelete);
                    }
                });
                actionsDiv.appendChild(deleteButton);
                productDiv.appendChild(actionsDiv);
            }

            catalogo.appendChild(productDiv);
        });
    }

    /**
     * ====================================================
     * FUNCIONES CRUD COMPLETAS (activadas para compañía)
     * ====================================================
     */

    async function getEquipoMedicoById(idEquipo) {
        // Esta función podría usarse para precargar datos en un formulario de edición
        try {
            const response = await fetch(`http://localhost:8000/api/equipos-medicos/${idEquipo}`);
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Equipo con ID ${idEquipo} no encontrado.`);
                    return null;
                }
                throw new Error(`Error HTTP! Estado: ${response.status} - ${response.statusText}`);
            }
            const equipo = await response.json();
            return equipo;
        } catch (error) {
            console.error(`Error al obtener equipo con ID ${idEquipo}:`, error);
            return null;
        }
    }

    async function createEquipoMedico(equipoData) {
        if (!isCompanyUser) {
            alert('Permiso denegado. Solo usuarios Compañía pueden agregar equipos.');
            return null;
        }
        try {
            const response = await fetch('http://localhost:8000/api/equipos-medicos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(equipoData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al crear equipo: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
            }

            const createdEquipo = await response.json();
            console.log('Equipo creado con éxito:', createdEquipo);
            fetchEquiposMedicos();
            alert('Equipo creado con éxito!');
            return createdEquipo;
        } catch (error) {
            console.error('Error en createEquipoMedico:', error);
            alert('Error al crear el equipo: ' + error.message);
            return null;
        }
    }

    async function updateEquipoMedico(idEquipo, updates) {
        if (!isCompanyUser) {
            alert('Permiso denegado. Solo usuarios Compañía pueden actualizar equipos.');
            return null;
        }
        try {
            const response = await fetch(`http://localhost:8000/api/equipos-medicos/${idEquipo}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al actualizar equipo con ID ${idEquipo}: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
            }

            const updatedEquipo = await response.json();
            console.log(`Equipo con ID ${idEquipo} actualizado con éxito:`, updatedEquipo);
            fetchEquiposMedicos();
            alert('Equipo actualizado con éxito!');
            return updatedEquipo;
        } catch (error) {
            console.error(`Error en updateEquipoMedico para ID ${idEquipo}:`, error);
            alert(`Error al actualizar el equipo ${idEquipo}: ` + error.message);
            return null;
        }
    }

    async function deleteEquipoMedico(idEquipo) {
        if (!isCompanyUser) {
            alert('Permiso denegado. Solo usuarios Compañía pueden eliminar equipos.');
            return false;
        }
        if (!confirm(`¿Estás seguro de que quieres eliminar el equipo con ID ${idEquipo}? Esta acción es irreversible.`)) {
            return false;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/equipos-medicos/${idEquipo}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error al eliminar equipo con ID ${idEquipo}: ${response.status} - ${response.statusText}. Detalles: ${errorText}`);
            }

            if (response.status !== 204) {
                 // Si tu backend envía un JSON de confirmación, puedes leerlo aquí:
                 // const confirmation = await response.json();
                 // console.log("Confirmación de eliminación:", confirmation);
            }

            console.log(`Equipo con ID ${idEquipo} eliminado con éxito.`);
            fetchEquiposMedicos();
            alert('Equipo eliminado con éxito!');
            return true;
        } catch (error) {
            console.error(`Error en deleteEquipoMedico para ID ${idEquipo}:`, error);
            alert(`Error al eliminar el equipo ${idEquipo}: ` + error.message);
            return false;
        }
    }
});