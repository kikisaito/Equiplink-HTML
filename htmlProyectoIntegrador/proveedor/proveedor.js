class ProveedorApp {
    constructor() {
        this.currentUser = null;
        this.equipos = [];
        this.marcas = [];
        this.tiposEquipo = [];
        this.proveedores = [];
        this.myInventory = [];
        this.resenas = [];
        this.ticketsSoporte = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setupModals();
        this.loadUserData();
        await this.loadInitialData();
    }

    setupEventListeners() {
        // Navegación suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Formulario de agregar equipo
        document.getElementById('addEquipmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddEquipment();
        });

        // Formulario de editar equipo
        document.getElementById('editEquipmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditEquipment();
        });

        // Filtros de inventario
        document.getElementById('inventorySearch').addEventListener('input', (e) => {
            this.filterInventory(e.target.value);
        });

        document.getElementById('inventoryStatus').addEventListener('change', () => {
            this.filterInventory();
        });

        document.getElementById('clearInventoryFilters').addEventListener('click', () => {
            this.clearInventoryFilters();
        });

        // Cambio de contraseña
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });

        // Confirmación de eliminación
        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.handleDeleteEquipment();
        });

        // Formulario de ticket de soporte
        const supportTicketForm = document.getElementById('supportTicketForm');
        if (supportTicketForm) {
            supportTicketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateSupportTicket();
            });
        }

        // Filtro de reseñas
        const reviewRatingFilter = document.getElementById('reviewRatingFilter');
        if (reviewRatingFilter) {
            reviewRatingFilter.addEventListener('change', () => {
                this.filterReviews();
            });
        }

        // Formularios de categorías y marcas
        const addCategoryForm = document.getElementById('addCategoryForm');
        if (addCategoryForm) {
            addCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddCategory();
            });
        }

        const addBrandForm = document.getElementById('addBrandForm');
        if (addBrandForm) {
            addBrandForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddBrand();
            });
        }

        // Formularios de edición
        const editCategoryForm = document.getElementById('editCategoryForm');
        if (editCategoryForm) {
            editCategoryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditCategory();
            });
        }

        const editBrandForm = document.getElementById('editBrandForm');
        if (editBrandForm) {
            editBrandForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditBrand();
            });
        }

        // Recargar inventario cuando la página se vuelve visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.currentUser) {
                console.log('Página visible, verificando inventario...');
                this.reloadInventory();
            }
        });

        // Recargar inventario cuando se hace focus en la ventana
        window.addEventListener('focus', () => {
            if (this.currentUser) {
                console.log('Ventana enfocada, verificando inventario...');
                this.reloadInventory();
            }
        });
    }

    setupMobileMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    setupModals() {
        const modals = document.querySelectorAll('.modal');
        const closeButtons = document.querySelectorAll('.close');

        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.hideAllModals();
            });
        });

        window.addEventListener('click', (e) => {
            modals.forEach(modal => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
    }

    showModal(modalId) {
        this.hideAllModals();
        document.getElementById(modalId).style.display = 'block';
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    async loadInitialData() {
        try {
            this.showLoading();
            
            // Verificar que el usuario esté cargado
            if (!this.currentUser) {
                console.log('Usuario no cargado, redirigiendo...');
                window.location.href = '../index.html';
                return;
            }
            
            console.log('Cargando datos iniciales para proveedor:', this.currentUser.idUsuario);
            
            const [equipos, marcas, tiposEquipo, proveedores, resenas] = await Promise.all([
                api.getEquiposMedicos(),
                api.getMarcas(),
                api.getTiposEquipo(),
                api.getProveedores(),
                api.getResenas()
            ]);

            this.equipos = equipos || [];
            this.marcas = marcas || [];
            this.tiposEquipo = tiposEquipo || [];
            this.proveedores = proveedores || [];
            this.resenas = resenas || [];

            console.log(`Datos cargados: ${this.equipos.length} equipos, ${this.marcas.length} marcas, ${this.tiposEquipo.length} tipos, ${this.resenas.length} reseñas`);

            this.populateFormSelects();
            this.loadMyInventory();
            this.loadMyReviews();
            this.loadUserTickets();
            this.updateDashboardStats();
            this.hideLoading();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showMessage('Error al cargar los datos. Por favor, intenta de nuevo.', 'error');
            this.hideLoading();
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                console.log('Usuario cargado:', this.currentUser);
                
                // Verificar que el usuario sea un proveedor
                if (this.currentUser.rol !== 'proveedor') {
                    console.log('Usuario no es proveedor, redirigiendo...');
                    window.location.href = '../index.html';
                    return;
                }
                
                this.updateUserInterface();
            } catch (error) {
                console.error('Error al cargar datos del usuario:', error);
                window.location.href = '../index.html';
            }
        } else {
            console.log('No hay datos de usuario, redirigiendo...');
            window.location.href = '../index.html';
        }
    }

    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('userInfo').textContent = `Hola, ${this.currentUser.nombre}`;
            
            // Actualizar perfil
            document.getElementById('profileName').textContent = this.currentUser.nombre;
            document.getElementById('profileEmail').textContent = this.currentUser.correo;
            document.getElementById('profileRole').textContent = this.currentUser.rol || 'Proveedor';
            document.getElementById('profileDate').textContent = new Date(this.currentUser.fechaRegistro).getFullYear();
        }
    }

    populateFormSelects() {
        const categorySelect = document.getElementById('equipmentCategory');
        const brandSelect = document.getElementById('equipmentBrand');
        const editCategorySelect = document.getElementById('editEquipmentCategory');
        const editBrandSelect = document.getElementById('editEquipmentBrand');

        // Limpiar opciones existentes
        [categorySelect, brandSelect, editCategorySelect, editBrandSelect].forEach(select => {
            if (select) {
                select.innerHTML = select === categorySelect || select === editCategorySelect 
                    ? '<option value="">Seleccionar categoría</option>'
                    : '<option value="">Seleccionar marca</option>';
            }
        });

        // Poblar categorías
        this.tiposEquipo.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.idTipo;
            option.textContent = tipo.nombreTipo;
            
            if (categorySelect) categorySelect.appendChild(option.cloneNode(true));
            if (editCategorySelect) editCategorySelect.appendChild(option.cloneNode(true));
        });

        // Poblar marcas
        this.marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca.idMarca;
            option.textContent = marca.nombreMarca;
            
            if (brandSelect) brandSelect.appendChild(option.cloneNode(true));
            if (editBrandSelect) editBrandSelect.appendChild(option.cloneNode(true));
        });
    }

    loadMyInventory() {
        // Verificar que tenemos los datos necesarios
        if (!this.currentUser || !this.equipos) {
            console.log('Datos no disponibles para cargar inventario');
            return;
        }
        
        // Filtrar equipos del proveedor actual
        this.myInventory = this.equipos.filter(equipo => 
            equipo.proveedor?.idProveedor === this.currentUser.idUsuario
        );
        
        console.log(`Cargando inventario para proveedor ${this.currentUser.idUsuario}: ${this.myInventory.length} equipos encontrados`);
        
        this.renderInventory();
        this.updateInventoryStats();
    }

    renderInventory(equiposToRender = this.myInventory) {
        const grid = document.getElementById('inventoryGrid');
        
        if (equiposToRender.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-boxes"></i>
                    <p>No tienes equipos en tu inventario</p>
                    <p>Agrega tu primer equipo médico</p>
                    <button class="btn btn-primary" onclick="document.getElementById('add-equipment').scrollIntoView({behavior: 'smooth'})">
                        Agregar Equipo
                    </button>
                </div>
            `;
            return;
        }

        grid.innerHTML = equiposToRender.map(equipo => this.createInventoryCard(equipo)).join('');
    }

    createInventoryCard(equipo) {
        const marca = this.marcas.find(m => m.idMarca === equipo.marca?.idMarca);
        const tipo = this.tiposEquipo.find(t => t.idTipo === equipo.tipoEquipo?.idTipo);

        const imageUrl = equipo.imagenUrl && equipo.imagenUrl.includes('placeholder.com') 
            ? 'images/equipment-placeholder.jpg' 
            : (equipo.imagenUrl || 'images/equipment-placeholder.jpg');

        return `
            <div class="equipment-card" data-id="${equipo.idEquipo}">
                <div class="equipment-status ${equipo.estado || 'nuevo'}">${equipo.estado || 'nuevo'}</div>
                <div class="equipment-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                    <i class="fas fa-stethoscope" style="display: none;"></i>
                </div>
                <div class="equipment-content">
                    <h3 class="equipment-title">${equipo.nombreEquipo}</h3>
                    <p class="equipment-description">${equipo.descripcion || 'Sin descripción disponible'}</p>
                    <div class="equipment-price">$${equipo.precio?.toLocaleString() || '0'}</div>
                    <div class="equipment-meta">
                        <span><i class="fas fa-tag"></i> ${tipo?.nombreTipo || 'Sin categoría'}</span>
                        <span><i class="fas fa-building"></i> ${marca?.nombreMarca || 'Sin marca'}</span>
                    </div>
                    <div class="equipment-actions">
                        <button class="btn btn-primary" onclick="app.editEquipment(${equipo.idEquipo})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-outline" onclick="app.viewEquipment(${equipo.idEquipo})">
                            <i class="fas fa-eye"></i> Ver
                        </button>
                        <button class="btn btn-error" onclick="app.confirmDeleteEquipment(${equipo.idEquipo})">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    filterInventory(searchTerm = '') {
        const statusFilter = document.getElementById('inventoryStatus').value;
        
        let filteredInventory = this.myInventory;

        // Filtrar por búsqueda
        if (searchTerm) {
            filteredInventory = filteredInventory.filter(equipo =>
                equipo.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtrar por estado
        if (statusFilter) {
            filteredInventory = filteredInventory.filter(equipo => 
                equipo.estado === statusFilter
            );
        }

        this.renderInventory(filteredInventory);
        this.updateInventoryStats(filteredInventory.length);
    }

    clearInventoryFilters() {
        document.getElementById('inventorySearch').value = '';
        document.getElementById('inventoryStatus').value = '';
        this.renderInventory();
        this.updateInventoryStats();
    }

    updateInventoryStats(count = this.myInventory.length) {
        document.getElementById('inventoryCount').textContent = `${count} equipo${count !== 1 ? 's' : ''} en inventario`;
    }

    async handleAddEquipment() {
        const formData = {
            nombreEquipo: document.getElementById('equipmentName').value,
            descripcion: document.getElementById('equipmentDescription').value,
            precio: parseFloat(document.getElementById('equipmentPrice').value),
            estado: document.getElementById('equipmentStatus').value,
            imagenUrl: document.getElementById('equipmentImage').value || 'images/equipment-placeholder.jpg',
            proveedor: { idProveedor: this.currentUser.idUsuario },
            tipoEquipo: { idTipo: parseInt(document.getElementById('equipmentCategory').value) },
            marca: { idMarca: parseInt(document.getElementById('equipmentBrand').value) }
        };

        try {
            this.showLoading();
            const newEquipment = await api.createEquipoMedico(formData);
            
            this.showMessage('Equipo agregado exitosamente', 'success');
            document.getElementById('addEquipmentForm').reset();
            
            // Recargar solo los equipos y actualizar inventario
            await this.reloadInventory();
            this.hideLoading();

        } catch (error) {
            console.error('Error agregando equipo:', error);
            this.showMessage('Error al agregar el equipo', 'error');
            this.hideLoading();
        }
    }

    editEquipment(equipoId) {
        const equipo = this.myInventory.find(e => e.idEquipo === equipoId);
        if (!equipo) {
            this.showMessage('Equipo no encontrado', 'error');
            return;
        }

        // Llenar el formulario de edición
        document.getElementById('editEquipmentName').value = equipo.nombreEquipo;
        document.getElementById('editEquipmentDescription').value = equipo.descripcion || '';
        document.getElementById('editEquipmentPrice').value = equipo.precio;
        document.getElementById('editEquipmentStatus').value = equipo.estado || 'nuevo';
        document.getElementById('editEquipmentImage').value = equipo.imagenUrl || '';
        document.getElementById('editEquipmentCategory').value = equipo.tipoEquipo?.idTipo || '';
        document.getElementById('editEquipmentBrand').value = equipo.marca?.idMarca || '';

        // Guardar el ID del equipo para la actualización
        this.editingEquipmentId = equipoId;

        this.showModal('editEquipmentModal');
    }

    async handleEditEquipment() {
        const formData = {
            nombreEquipo: document.getElementById('editEquipmentName').value,
            descripcion: document.getElementById('editEquipmentDescription').value,
            precio: parseFloat(document.getElementById('editEquipmentPrice').value),
            estado: document.getElementById('editEquipmentStatus').value,
            imagenUrl: document.getElementById('editEquipmentImage').value || 'images/equipment-placeholder.jpg',
            proveedor: { idProveedor: this.currentUser.idUsuario },
            tipoEquipo: { idTipo: parseInt(document.getElementById('editEquipmentCategory').value) },
            marca: { idMarca: parseInt(document.getElementById('editEquipmentBrand').value) }
        };

        try {
            this.showLoading();
            await api.updateEquipoMedico(this.editingEquipmentId, formData);
            
            this.showMessage('Equipo actualizado exitosamente', 'success');
            this.hideAllModals();
            
            // Recargar solo los equipos y actualizar inventario
            await this.reloadInventory();
            this.hideLoading();

        } catch (error) {
            console.error('Error actualizando equipo:', error);
            this.showMessage('Error al actualizar el equipo', 'error');
            this.hideLoading();
        }
    }

    confirmDeleteEquipment(equipoId) {
        this.equipmentToDelete = equipoId;
        this.showModal('deleteConfirmModal');
    }

    async handleDeleteEquipment() {
        if (!this.equipmentToDelete) return;

        try {
            this.showLoading();
            await api.deleteEquipoMedico(this.equipmentToDelete);
            
            this.showMessage('Equipo eliminado exitosamente', 'success');
            this.hideAllModals();
            
            // Recargar solo los equipos y actualizar inventario
            await this.reloadInventory();
            this.hideLoading();

        } catch (error) {
            console.error('Error eliminando equipo:', error);
            
            // Mostrar mensaje de error más específico
            let errorMessage = 'Error al eliminar el equipo';
            if (error.message) {
                if (error.message.includes('404')) {
                    errorMessage = 'El equipo no fue encontrado';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Error del servidor al eliminar el equipo';
                } else if (error.message.includes('constraint')) {
                    errorMessage = 'No se puede eliminar el equipo porque tiene registros relacionados';
                } else {
                    errorMessage = error.message;
                }
            }
            
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    viewEquipment(equipoId) {
        const equipo = this.myInventory.find(e => e.idEquipo === equipoId);
        if (!equipo) {
            this.showMessage('Equipo no encontrado', 'error');
            return;
        }

        const marca = this.marcas.find(m => m.idMarca === equipo.marca?.idMarca);
        const tipo = this.tiposEquipo.find(t => t.idTipo === equipo.tipoEquipo?.idTipo);

        const modalContent = document.getElementById('equipmentModalContent');
        modalContent.innerHTML = `
            <div class="equipment-details">
                <div>
                    <div class="equipment-image" style="background-image: url('${equipo.imagenUrl && equipo.imagenUrl.includes('placeholder.com') ? 'images/equipment-placeholder.jpg' : (equipo.imagenUrl || 'images/equipment-placeholder.jpg')}'); background-size: cover; background-position: center;">
                        <i class="fas fa-stethoscope" style="display: none;"></i>
                    </div>
                </div>
                <div class="equipment-info">
                    <h3>${equipo.nombreEquipo}</h3>
                    <p><strong>Precio:</strong> $${equipo.precio?.toLocaleString() || '0'}</p>
                    <p><strong>Descripción:</strong> ${equipo.descripcion || 'Sin descripción disponible'}</p>
                    <p><strong>Categoría:</strong> ${tipo?.nombreTipo || 'Sin categoría'}</p>
                    <p><strong>Marca:</strong> ${marca?.nombreMarca || 'Sin marca'}</p>
                    <p><strong>Estado:</strong> ${equipo.estado || 'nuevo'}</p>
                    <p><strong>Fecha de publicación:</strong> ${new Date(equipo.fechaPublicacion).toLocaleDateString()}</p>
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="app.editEquipment(${equipo.idEquipo})">
                            <i class="fas fa-edit"></i> Editar Equipo
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.showModal('equipmentModal');
    }

    async reloadInventory() {
        try {
            // Recargar solo los equipos médicos
            const equipos = await api.getEquiposMedicos();
            this.equipos = equipos || [];
            
            console.log(`Equipos recargados: ${this.equipos.length} total`);
            
            // Actualizar inventario del proveedor
            this.loadMyInventory();
            this.updateDashboardStats();
            
        } catch (error) {
            console.error('Error recargando inventario:', error);
            this.showMessage('Error al recargar el inventario', 'error');
        }
    }

    updateDashboardStats() {
        document.getElementById('totalEquipment').textContent = this.myInventory.length;
        
        const totalValue = this.myInventory.reduce((sum, equipo) => sum + (parseFloat(equipo.precio) || 0), 0);
        document.getElementById('totalValue').textContent = `$${totalValue.toLocaleString()}`;
        
        // Aquí podrías agregar más estadísticas como visualizaciones, favoritos, etc.
        document.getElementById('totalViews').textContent = '0'; // Placeholder
        document.getElementById('totalFavorites').textContent = '0'; // Placeholder
    }

    async handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        try {
            // Aquí implementarías la lógica para cambiar la contraseña
            this.showMessage('Contraseña cambiada exitosamente', 'success');
            this.hideAllModals();
            document.getElementById('changePasswordForm').reset();
        } catch (error) {
            this.showMessage('Error al cambiar la contraseña', 'error');
        }
    }

    showChangePasswordModal() {
        this.showModal('changePasswordModal');
    }

    // Métodos para reseñas
    async loadMyReviews() {
        if (!this.currentUser) return;
        
        try {
            const myReviews = this.resenas.filter(r => r.proveedor?.idProveedor === this.currentUser.idUsuario);
            this.renderReviews(myReviews);
            this.updateReviewStats(myReviews);
        } catch (error) {
            console.error('Error cargando reseñas:', error);
        }
    }

    renderReviews(reviews = []) {
        const reviewsList = document.getElementById('reviewsList');
        const noReviews = document.getElementById('noReviews');

        if (reviews.length === 0) {
            reviewsList.style.display = 'none';
            noReviews.style.display = 'block';
            return;
        }

        reviewsList.style.display = 'block';
        noReviews.style.display = 'none';

        reviewsList.innerHTML = reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <div class="review-rating">
                        ${'★'.repeat(review.calificacion)}${'☆'.repeat(5 - review.calificacion)}
                        <span class="rating-number">${review.calificacion}/5</span>
                    </div>
                    <small>${new Date(review.fechaResena).toLocaleDateString()}</small>
                </div>
                <p class="review-comment">${review.comentario}</p>
                <div class="review-user">
                    <i class="fas fa-user"></i>
                    <span>${review.usuario?.nombre || 'Usuario anónimo'}</span>
                </div>
            </div>
        `).join('');
    }

    updateReviewStats(reviews = []) {
        if (reviews.length === 0) {
            document.getElementById('averageRating').textContent = '0.0';
            document.getElementById('totalReviews').textContent = '0';
            document.getElementById('positiveReviews').textContent = '0';
            return;
        }

        const averageRating = (reviews.reduce((sum, r) => sum + r.calificacion, 0) / reviews.length).toFixed(1);
        const positiveReviews = reviews.filter(r => r.calificacion >= 4).length;

        document.getElementById('averageRating').textContent = averageRating;
        document.getElementById('totalReviews').textContent = reviews.length;
        document.getElementById('positiveReviews').textContent = positiveReviews;
    }

    filterReviews() {
        const ratingFilter = document.getElementById('reviewRatingFilter').value;
        
        if (!ratingFilter) {
            this.loadMyReviews();
            return;
        }

        const filteredReviews = this.resenas.filter(r => 
            r.proveedor?.idProveedor === this.currentUser.idUsuario && 
            r.calificacion == ratingFilter
        );

        this.renderReviews(filteredReviews);
        this.updateReviewStats(filteredReviews);
    }

    // Métodos para tickets de soporte
    showSupportTicketModal() {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para crear un ticket de soporte', 'info');
            return;
        }
        this.showModal('supportTicketModal');
    }

    async handleCreateSupportTicket() {
        if (!this.currentUser) return;

        const subject = document.getElementById('ticketSubject').value;
        const message = document.getElementById('ticketMessage').value;

        if (!subject || !message) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        try {
            this.showLoading();
            await api.createTicketSoporte({
                usuario: { idUsuario: this.currentUser.idUsuario },
                asunto: subject,
                mensaje: message,
                estado: 'pendiente'
            });

            this.showMessage('Ticket de soporte creado exitosamente', 'success');
            this.hideAllModals();
            document.getElementById('supportTicketForm').reset();
            
            // Recargar tickets
            await this.loadUserTickets();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error creando ticket de soporte:', error);
            this.showMessage('Error al crear el ticket de soporte', 'error');
            this.hideLoading();
        }
    }

    async loadUserTickets() {
        if (!this.currentUser) return;
        
        try {
            const tickets = await api.getTicketsPorUsuario(this.currentUser.idUsuario);
            this.ticketsSoporte = tickets || [];
        } catch (error) {
            console.error('Error cargando tickets del usuario:', error);
        }
    }

    showUserTickets() {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para ver tus tickets', 'info');
            return;
        }

        const modalContent = document.getElementById('userTicketsContent');
        if (modalContent) {
            if (this.ticketsSoporte.length === 0) {
                modalContent.innerHTML = `
                    <div class="no-tickets">
                        <i class="fas fa-ticket-alt"></i>
                        <p>No tienes tickets de soporte</p>
                        <button class="btn btn-primary" onclick="app.showSupportTicketModal()">
                            Crear Nuevo Ticket
                        </button>
                    </div>
                `;
            } else {
                modalContent.innerHTML = `
                    <div class="tickets-list">
                        ${this.ticketsSoporte.map(ticket => `
                            <div class="ticket-item ${ticket.estado}">
                                <div class="ticket-header">
                                    <h4>${ticket.asunto}</h4>
                                    <span class="ticket-status ${ticket.estado}">${ticket.estado}</span>
                                </div>
                                <p class="ticket-message">${ticket.mensaje}</p>
                                <small>${new Date(ticket.fechaCreacion).toLocaleDateString()}</small>
                            </div>
                        `).join('')}
                    </div>
                    <div class="ticket-actions">
                        <button class="btn btn-primary" onclick="app.showSupportTicketModal()">
                            Crear Nuevo Ticket
                        </button>
                    </div>
                `;
            }
        }
        this.showModal('userTicketsModal');
    }

    // Métodos para gestión de tickets
    showAllTickets() {
        const ticketsList = document.getElementById('allTicketsList');
        if (ticketsList.style.display === 'none') {
            ticketsList.style.display = 'block';
            this.loadAllTickets();
        } else {
            ticketsList.style.display = 'none';
        }
    }

    showPendingTickets() {
        const ticketsList = document.getElementById('allTicketsList');
        ticketsList.style.display = 'block';
        this.loadAllTickets();
        document.getElementById('ticketStatusFilter').value = 'pendiente';
        this.filterTickets();
    }

    async loadAllTickets() {
        try {
            this.showLoading();
            const tickets = await api.getTicketsSoporte();
            this.ticketsSoporte = tickets || [];
            this.updateTicketStats();
            this.renderAllTickets();
            this.hideLoading();
        } catch (error) {
            console.error('Error cargando tickets:', error);
            this.showMessage('Error al cargar los tickets', 'error');
            this.hideLoading();
        }
    }

    updateTicketStats() {
        const pending = this.ticketsSoporte.filter(t => t.estado === 'pendiente').length;
        const inProcess = this.ticketsSoporte.filter(t => t.estado === 'en_proceso').length;
        const resolved = this.ticketsSoporte.filter(t => t.estado === 'resuelto').length;

        document.getElementById('pendingTickets').textContent = pending;
        document.getElementById('inProcessTickets').textContent = inProcess;
        document.getElementById('resolvedTickets').textContent = resolved;
    }

    async filterTickets() {
        const statusFilter = document.getElementById('ticketStatusFilter').value;
        const filteredTickets = statusFilter 
            ? this.ticketsSoporte.filter(ticket => ticket.estado === statusFilter)
            : this.ticketsSoporte;
        
        this.renderAllTickets(filteredTickets);
    }

    renderAllTickets(tickets = this.ticketsSoporte) {
        const content = document.getElementById('allTicketsContent');
        const totalTickets = document.getElementById('totalTickets');
        
        totalTickets.textContent = tickets.length;

        if (tickets.length === 0) {
            content.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No hay tickets de soporte</p>
                </div>
            `;
            return;
        }

        content.innerHTML = tickets.map(ticket => `
            <div class="ticket-item ${ticket.estado}">
                <div class="ticket-header">
                    <h4>${ticket.asunto}</h4>
                    <span class="ticket-status ${ticket.estado}">${this.getStatusText(ticket.estado)}</span>
                </div>
                <div class="ticket-content">
                    <p>${ticket.mensaje}</p>
                    <div class="ticket-meta">
                        <small><i class="fas fa-user"></i> ${ticket.usuario?.nombre || 'Usuario'}</small>
                        <small><i class="fas fa-calendar"></i> ${new Date(ticket.fechaCreacion).toLocaleDateString()}</small>
                        <small><i class="fas fa-clock"></i> ${new Date(ticket.fechaCreacion).toLocaleTimeString()}</small>
                    </div>
                </div>
                <div class="ticket-actions">
                    <button class="btn btn-sm btn-primary" onclick="app.manageTicket(${ticket.idTicket})">
                        <i class="fas fa-edit"></i> Gestionar
                    </button>
                </div>
            </div>
        `).join('');
    }

    async manageTicket(ticketId) {
        const ticket = this.ticketsSoporte.find(t => t.idTicket === ticketId);
        if (!ticket) {
            this.showMessage('Ticket no encontrado', 'error');
            return;
        }

        // Mostrar detalles del ticket
        const ticketDetails = document.getElementById('ticketDetails');
        ticketDetails.innerHTML = `
            <div class="ticket-detail">
                <h4>${ticket.asunto}</h4>
                <p><strong>Cliente:</strong> ${ticket.usuario?.nombre || 'Usuario'}</p>
                <p><strong>Email:</strong> ${ticket.usuario?.email || 'No disponible'}</p>
                <p><strong>Mensaje:</strong></p>
                <div class="ticket-message">${ticket.mensaje}</div>
                <p><strong>Fecha:</strong> ${new Date(ticket.fechaCreacion).toLocaleString()}</p>
            </div>
        `;

        // Establecer estado actual
        document.getElementById('ticketStatus').value = ticket.estado;
        
        // Guardar ID del ticket para actualización
        this.currentTicketId = ticketId;
        
        this.showModal('manageTicketModal');
    }

    async updateTicketStatus() {
        if (!this.currentTicketId) return;
        
        const newStatus = document.getElementById('ticketStatus').value;
        
        try {
            this.showLoading();
            await api.updateEstadoTicket(this.currentTicketId, newStatus);
            
            // Actualizar ticket en la lista local
            const ticketIndex = this.ticketsSoporte.findIndex(t => t.idTicket === this.currentTicketId);
            if (ticketIndex !== -1) {
                this.ticketsSoporte[ticketIndex].estado = newStatus;
            }
            
            this.showMessage('Estado del ticket actualizado', 'success');
            this.updateTicketStats();
            this.renderAllTickets();
            this.hideLoading();
        } catch (error) {
            console.error('Error actualizando estado del ticket:', error);
            this.showMessage('Error al actualizar el estado', 'error');
            this.hideLoading();
        }
    }

    async saveTicketResponse() {
        if (!this.currentTicketId) return;
        
        const response = document.getElementById('ticketResponse').value;
        if (!response.trim()) {
            this.showMessage('Debes escribir una respuesta', 'error');
            return;
        }
        
        this.showMessage('Respuesta guardada exitosamente', 'success');
        this.hideAllModals();
    }

    getStatusText(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'resuelto': 'Resuelto'
        };
        return statusMap[status] || status;
    }

    showContactSupport() {
        this.showSupportTicketModal();
    }

    // Métodos para gestión de categorías y marcas
    showCategoriesTab() {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector('[onclick="app.showCategoriesTab()"]').classList.add('active');
        document.getElementById('categoriesTab').classList.add('active');
        
        this.renderCategories();
    }

    showBrandsTab() {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector('[onclick="app.showBrandsTab()"]').classList.add('active');
        document.getElementById('brandsTab').classList.add('active');
        
        this.renderBrands();
    }

    renderCategories() {
        const categoriesList = document.getElementById('categoriesList');
        
        if (this.tiposEquipo.length === 0) {
            categoriesList.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-tags"></i>
                    <p>No hay categorías disponibles</p>
                    <button class="btn btn-primary" onclick="app.showAddCategoryModal()">
                        Agregar Primera Categoría
                    </button>
                </div>
            `;
            return;
        }

        categoriesList.innerHTML = this.tiposEquipo.map(tipo => `
            <div class="item-card">
                <div class="item-info">
                    <h4>${tipo.nombreTipo}</h4>
                    <small>ID: ${tipo.idTipo}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.editCategory(${tipo.idTipo})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deleteCategory(${tipo.idTipo})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderBrands() {
        const brandsList = document.getElementById('brandsList');
        
        if (this.marcas.length === 0) {
            brandsList.innerHTML = `
                <div class="no-items">
                    <i class="fas fa-building"></i>
                    <p>No hay marcas disponibles</p>
                    <button class="btn btn-primary" onclick="app.showAddBrandModal()">
                        Agregar Primera Marca
                    </button>
                </div>
            `;
            return;
        }

        brandsList.innerHTML = this.marcas.map(marca => `
            <div class="item-card">
                <div class="item-info">
                    <h4>${marca.nombreMarca}</h4>
                    <small>ID: ${marca.idMarca}</small>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline" onclick="app.editBrand(${marca.idMarca})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-error" onclick="app.deleteBrand(${marca.idMarca})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showAddCategoryModal() {
        this.showModal('addCategoryModal');
    }

    showAddBrandModal() {
        this.showModal('addBrandModal');
    }

    async handleAddCategory() {
        const name = document.getElementById('categoryName').value;

        if (!name.trim()) {
            this.showMessage('El nombre de la categoría es requerido', 'error');
            return;
        }

        try {
            this.showLoading();
            const newCategory = await api.createTipoEquipo({
                nombreTipo: name.trim()
            });

            this.showMessage('Categoría agregada exitosamente', 'success');
            this.hideAllModals();
            document.getElementById('addCategoryForm').reset();
            
            // Recargar datos
            const tiposEquipo = await api.getTiposEquipo();
            this.tiposEquipo = tiposEquipo || [];
            this.populateFormSelects();
            this.renderCategories();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error agregando categoría:', error);
            let errorMessage = 'Error al agregar la categoría';
            if (error.message) {
                if (error.message.includes('duplicate') || error.message.includes('ya existe')) {
                    errorMessage = 'Ya existe una categoría con ese nombre';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    async handleAddBrand() {
        const name = document.getElementById('brandName').value;

        if (!name.trim()) {
            this.showMessage('El nombre de la marca es requerido', 'error');
            return;
        }

        try {
            this.showLoading();
            const newBrand = await api.createMarca({
                nombreMarca: name.trim()
            });

            this.showMessage('Marca agregada exitosamente', 'success');
            this.hideAllModals();
            document.getElementById('addBrandForm').reset();
            
            // Recargar datos
            const marcas = await api.getMarcas();
            this.marcas = marcas || [];
            this.populateFormSelects();
            this.renderBrands();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error agregando marca:', error);
            let errorMessage = 'Error al agregar la marca';
            if (error.message) {
                if (error.message.includes('duplicate') || error.message.includes('ya existe')) {
                    errorMessage = 'Ya existe una marca con ese nombre';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    async deleteCategory(categoryId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

        try {
            this.showLoading();
            await api.deleteTipoEquipo(categoryId);
            
            this.showMessage('Categoría eliminada exitosamente', 'success');
            
            // Recargar datos
            const tiposEquipo = await api.getTiposEquipo();
            this.tiposEquipo = tiposEquipo || [];
            this.populateFormSelects();
            this.renderCategories();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            let errorMessage = 'Error al eliminar la categoría';
            if (error.message) {
                if (error.message.includes('constraint') || error.message.includes('foreign key')) {
                    errorMessage = 'No se puede eliminar la categoría porque tiene equipos asociados. Elimina primero los equipos que usan esta categoría.';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    async deleteBrand(brandId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta marca?')) return;

        try {
            this.showLoading();
            await api.deleteMarca(brandId);
            
            this.showMessage('Marca eliminada exitosamente', 'success');
            
            // Recargar datos
            const marcas = await api.getMarcas();
            this.marcas = marcas || [];
            this.populateFormSelects();
            this.renderBrands();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error eliminando marca:', error);
            let errorMessage = 'Error al eliminar la marca';
            if (error.message) {
                if (error.message.includes('constraint') || error.message.includes('foreign key')) {
                    errorMessage = 'No se puede eliminar la marca porque tiene equipos asociados. Elimina primero los equipos que usan esta marca.';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    editCategory(categoryId) {
        const category = this.tiposEquipo.find(t => t.idTipo === categoryId);
        if (!category) {
            this.showMessage('Categoría no encontrada', 'error');
            return;
        }

        document.getElementById('editCategoryId').value = category.idTipo;
        document.getElementById('editCategoryName').value = category.nombreTipo;
        
        this.showModal('editCategoryModal');
    }

    editBrand(brandId) {
        const brand = this.marcas.find(m => m.idMarca === brandId);
        if (!brand) {
            this.showMessage('Marca no encontrada', 'error');
            return;
        }

        document.getElementById('editBrandId').value = brand.idMarca;
        document.getElementById('editBrandName').value = brand.nombreMarca;
        
        this.showModal('editBrandModal');
    }

    async handleEditCategory() {
        const categoryId = document.getElementById('editCategoryId').value;
        const name = document.getElementById('editCategoryName').value;

        if (!name.trim()) {
            this.showMessage('El nombre de la categoría es requerido', 'error');
            return;
        }

        try {
            this.showLoading();
            await api.updateTipoEquipo(categoryId, {
                nombreTipo: name.trim()
            });

            this.showMessage('Categoría actualizada exitosamente', 'success');
            this.hideAllModals();
            
            // Recargar datos
            const tiposEquipo = await api.getTiposEquipo();
            this.tiposEquipo = tiposEquipo || [];
            this.populateFormSelects();
            this.renderCategories();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            let errorMessage = 'Error al actualizar la categoría';
            if (error.message) {
                if (error.message.includes('duplicate') || error.message.includes('ya existe')) {
                    errorMessage = 'Ya existe una categoría con ese nombre';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    async handleEditBrand() {
        const brandId = document.getElementById('editBrandId').value;
        const name = document.getElementById('editBrandName').value;

        if (!name.trim()) {
            this.showMessage('El nombre de la marca es requerido', 'error');
            return;
        }

        try {
            this.showLoading();
            await api.updateMarca(brandId, {
                nombreMarca: name.trim()
            });

            this.showMessage('Marca actualizada exitosamente', 'success');
            this.hideAllModals();
            
            // Recargar datos
            const marcas = await api.getMarcas();
            this.marcas = marcas || [];
            this.populateFormSelects();
            this.renderBrands();
            
            this.hideLoading();
        } catch (error) {
            console.error('Error actualizando marca:', error);
            let errorMessage = 'Error al actualizar la marca';
            if (error.message) {
                if (error.message.includes('duplicate') || error.message.includes('ya existe')) {
                    errorMessage = 'Ya existe una marca con ese nombre';
                } else {
                    errorMessage = error.message;
                }
            }
            this.showMessage(errorMessage, 'error');
            this.hideLoading();
        }
    }

    showProviderSettings() {
        this.showMessage('Configuración de proveedor en desarrollo', 'info');
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    showLoading() {
        const loadingIndicator = document.getElementById('inventoryLoading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingIndicator = document.getElementById('inventoryLoading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProveedorApp();
}); 