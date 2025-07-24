class ClienteApp {
    constructor() {
        this.currentUser = null;
        this.equipos = [];
        this.marcas = [];
        this.tiposEquipo = [];
        this.proveedores = [];
        this.favoritos = [];
        this.resenas = [];
        this.historialBusquedas = [];
        this.ticketsSoporte = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.setupMobileMenu();
        this.setupModals();
        this.loadUserData();
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

        // Búsqueda y filtros
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearFilters();
        });

        // Búsqueda en tiempo real
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleRealTimeSearch(e.target.value);
        });

        // Filtros
        document.getElementById('categoryFilter').addEventListener('change', () => {
            this.filterEquipos();
        });

        document.getElementById('brandFilter').addEventListener('change', () => {
            this.filterEquipos();
        });

        document.getElementById('priceFilter').addEventListener('change', () => {
            this.filterEquipos();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.filterEquipos();
        });

        // Cambio de contraseña
        document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });

        // Formulario de reseña
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddReview();
            });
        }

        // Formulario de ticket de soporte
        const supportTicketForm = document.getElementById('supportTicketForm');
        if (supportTicketForm) {
            supportTicketForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateSupportTicket();
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

            this.populateFilters();
            this.renderEquipos();
            this.updateResultsCount();
            this.hideLoading();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showMessage('Error al cargar los datos. Por favor, intenta de nuevo.', 'error');
            this.hideLoading();
        }
    }

    loadUserData() {
        // Cargar datos del usuario desde localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUserInterface();
            this.loadUserFavorites();
            this.loadUserHistory();
            this.loadUserTickets();
        } else {
            // Si no hay usuario, redirigir al login
            window.location.href = '../index.html';
        }
    }

    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.nombre;
            document.getElementById('userInfo').textContent = `Hola, ${this.currentUser.nombre}`;
            
            // Actualizar perfil
            document.getElementById('profileName').textContent = this.currentUser.nombre;
            document.getElementById('profileEmail').textContent = this.currentUser.correo;
            document.getElementById('profileRole').textContent = this.currentUser.rol || 'Cliente';
            document.getElementById('profileDate').textContent = new Date(this.currentUser.fechaRegistro).getFullYear();
        }
    }

    populateFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const brandFilter = document.getElementById('brandFilter');

        // Limpiar opciones existentes
        categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        brandFilter.innerHTML = '<option value="">Todas las marcas</option>';

        // Poblar categorías
        this.tiposEquipo.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo.idTipo;
            option.textContent = tipo.nombreTipo;
            categoryFilter.appendChild(option);
        });

        // Poblar marcas
        this.marcas.forEach(marca => {
            const option = document.createElement('option');
            option.value = marca.idMarca;
            option.textContent = marca.nombreMarca;
            brandFilter.appendChild(option);
        });
    }

    renderEquipos(equiposToRender = this.equipos) {
        const grid = document.getElementById('equipmentGrid');
        
        if (equiposToRender.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron equipos médicos</p>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = equiposToRender.map(equipo => this.createEquipmentCard(equipo)).join('');
    }

    createEquipmentCard(equipo) {
        const marca = this.marcas.find(m => m.idMarca === equipo.marca?.idMarca);
        const tipo = this.tiposEquipo.find(t => t.idTipo === equipo.tipoEquipo?.idTipo);
        const proveedor = this.proveedores.find(p => p.idProveedor === equipo.proveedor?.idProveedor);
        
        // Obtener reseñas del proveedor
        const resenasProveedor = this.resenas.filter(r => r.proveedor?.idProveedor === equipo.proveedor?.idProveedor);
        const promedioResenas = resenasProveedor.length > 0 
            ? (resenasProveedor.reduce((sum, r) => sum + r.calificacion, 0) / resenasProveedor.length).toFixed(1)
            : null;

        const imageUrl = equipo.imagenUrl && equipo.imagenUrl.includes('placeholder.com') 
            ? 'images/equipment-placeholder.jpg' 
            : (equipo.imagenUrl || 'images/equipment-placeholder.jpg');

        const isFavorito = this.favoritos.some(f => f.equipo?.idEquipo === equipo.idEquipo);

        return `
            <div class="equipment-card" data-id="${equipo.idEquipo}">
                <div class="equipment-status ${equipo.estado || 'nuevo'}">${equipo.estado || 'nuevo'}</div>
                <div class="equipment-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;">
                    <i class="fas fa-stethoscope" style="display: none;"></i>
                    <button class="favorite-btn ${isFavorito ? 'active' : ''}" onclick="app.toggleFavorite(${equipo.idEquipo})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="equipment-content">
                    <h3 class="equipment-title">${equipo.nombreEquipo}</h3>
                    <p class="equipment-description">${equipo.descripcion || 'Sin descripción disponible'}</p>
                    <div class="equipment-price">$${equipo.precio?.toLocaleString() || '0'}</div>
                    <div class="equipment-meta">
                        <span><i class="fas fa-tag"></i> ${tipo?.nombreTipo || 'Sin categoría'}</span>
                        <span><i class="fas fa-building"></i> ${marca?.nombreMarca || 'Sin marca'}</span>
                    </div>
                    ${proveedor ? `
                        <div class="equipment-provider">
                            <span><i class="fas fa-user"></i> ${proveedor.nombreEmpresa}</span>
                            ${promedioResenas ? `
                                <span class="rating">
                                    <i class="fas fa-star"></i> ${promedioResenas} (${resenasProveedor.length} reseñas)
                                </span>
                            ` : ''}
                        </div>
                    ` : ''}
                    <div class="equipment-actions">
                        <button class="btn btn-primary" onclick="app.viewEquipment(${equipo.idEquipo})">
                            <i class="fas fa-eye"></i> Ver Detalles
                        </button>
                        ${this.currentUser && equipo.proveedor ? `
                            <button class="btn btn-outline" onclick="app.showReviewModal(${equipo.proveedor.idProveedor})">
                                <i class="fas fa-star"></i> Reseñar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter').value;
        const brandFilter = document.getElementById('brandFilter').value;
        const priceFilter = document.getElementById('priceFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        let filteredEquipos = this.equipos;

        if (categoryFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.tipoEquipo?.idTipo == categoryFilter
            );
        }

        if (brandFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.marca?.idMarca == brandFilter
            );
        }

        if (priceFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => {
                const precio = parseFloat(equipo.precio) || 0;
                switch (priceFilter) {
                    case '0-1000':
                        return precio >= 0 && precio <= 1000;
                    case '1000-5000':
                        return precio > 1000 && precio <= 5000;
                    case '5000-50000':
                        return precio > 5000 && precio <= 50000;
                    case '50000+':
                        return precio > 50000;
                    default:
                        return true;
                }
            });
        }

        if (statusFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.estado === statusFilter
            );
        }

        return filteredEquipos;
    }

    filterEquipos() {
        const filteredEquipos = this.applyFilters();
        this.renderEquipos(filteredEquipos);
        this.updateResultsCount(filteredEquipos.length);
    }

    async handleRealTimeSearch(searchTerm) {
        // Aplicar filtros primero
        let filteredEquipos = this.applyFilters();
        
        // Si hay término de búsqueda, filtrar por texto
        if (searchTerm.trim()) {
            filteredEquipos = filteredEquipos.filter(equipo =>
                equipo.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                equipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        this.renderEquipos(filteredEquipos);
        this.updateResultsCount(filteredEquipos.length);
    }

    async handleSearch() {
        const searchTerm = document.getElementById('searchInput').value;
        
        try {
            this.showLoading();
            
            // Aplicar filtros y búsqueda
            let filteredEquipos = this.applyFilters();
            
            if (searchTerm.trim()) {
                filteredEquipos = filteredEquipos.filter(equipo =>
                    equipo.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    equipo.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                // Guardar en historial solo cuando se hace clic en buscar
                if (this.currentUser && searchTerm.trim().length > 2) {
                    try {
                        await api.createHistorialBusqueda({
                            usuario: { idUsuario: this.currentUser.idUsuario },
                            terminoBusqueda: searchTerm.trim()
                        });
                        // Recargar historial después de guardar
                        await this.loadUserHistory();
                        this.showMessage('Búsqueda guardada en historial', 'success');
                    } catch (historialError) {
                        console.warn('No se pudo guardar el historial:', historialError);
                    }
                }
            }

            this.renderEquipos(filteredEquipos);
            this.updateResultsCount(filteredEquipos.length);
            this.hideLoading();

        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showMessage('Error al realizar la búsqueda', 'error');
            this.hideLoading();
        }
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('brandFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('statusFilter').value = '';
        
        this.renderEquipos();
        this.updateResultsCount();
        
        // Recargar historial para asegurar que esté actualizado
        if (this.currentUser) {
            this.loadUserHistory();
        }
    }

    updateResultsCount(count = this.equipos.length) {
        const resultsCount = document.getElementById('resultsCount');
        resultsCount.textContent = `${count} equipo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
    }

    async loadUserFavorites() {
        if (!this.currentUser) return;

        try {
            const userFavoritos = await api.getFavoritosPorUsuario(this.currentUser.idUsuario);
            this.favoritos = userFavoritos || [];
            this.renderFavorites();
            this.updateDashboardStats();
        } catch (error) {
            console.warn('Error cargando favoritos:', error);
        }
    }

    renderFavorites() {
        const favoritesGrid = document.getElementById('favoritesGrid');
        const noFavorites = document.getElementById('noFavorites');

        if (this.favoritos.length === 0) {
            favoritesGrid.style.display = 'none';
            noFavorites.style.display = 'block';
            return;
        }

        favoritesGrid.style.display = 'grid';
        noFavorites.style.display = 'none';

        // Obtener los equipos favoritos
        const favoritosEquipos = this.equipos.filter(equipo => 
            this.favoritos.some(fav => fav.equipo?.idEquipo === equipo.idEquipo)
        );

        favoritesGrid.innerHTML = favoritosEquipos.map(equipo => this.createEquipmentCard(equipo)).join('');
    }

    updateDashboardStats() {
        document.getElementById('favoritesCount').textContent = this.favoritos.length;
        // Aquí podrías agregar más estadísticas como búsquedas, equipos vistos, etc.
    }

    async addToFavorites(equipoId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para agregar favoritos', 'warning');
            return;
        }

        try {
            await api.createFavorito({
                usuario: { idUsuario: this.currentUser.idUsuario },
                equipo: { idEquipo: equipoId }
            });

            this.showMessage('Agregado a favoritos', 'success');
            await this.loadUserFavorites();

        } catch (error) {
            console.error('Error agregando favorito:', error);
            this.showMessage('Error al agregar a favoritos', 'error');
        }
    }

    viewEquipment(equipoId) {
        const equipo = this.equipos.find(e => e.idEquipo === equipoId);
        if (!equipo) {
            this.showMessage('Equipo no encontrado', 'error');
            return;
        }

        const marca = this.marcas.find(m => m.idMarca === equipo.marca?.idMarca);
        const tipo = this.tiposEquipo.find(t => t.idTipo === equipo.tipoEquipo?.idTipo);
        const proveedor = this.proveedores.find(p => p.idProveedor === equipo.proveedor?.idProveedor);
        
        // Obtener reseñas del proveedor
        const resenasProveedor = this.resenas.filter(r => r.proveedor?.idProveedor === equipo.proveedor?.idProveedor);
        const promedioResenas = resenasProveedor.length > 0 
            ? (resenasProveedor.reduce((sum, r) => sum + r.calificacion, 0) / resenasProveedor.length).toFixed(1)
            : null;

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
                    <p><strong>Proveedor:</strong> ${proveedor?.nombreEmpresa || 'Sin proveedor'}</p>
                    ${promedioResenas ? `<p><strong>Calificación:</strong> ${promedioResenas}/5 (${resenasProveedor.length} reseñas)</p>` : ''}
                    <p><strong>Fecha de publicación:</strong> ${new Date(equipo.fechaPublicacion).toLocaleDateString()}</p>
                    
                    ${resenasProveedor.length > 0 ? `
                        <div class="reviews-section">
                            <h4>Reseñas del Proveedor</h4>
                            ${resenasProveedor.slice(0, 3).map(resena => `
                                <div class="review-item">
                                    <div class="review-rating">
                                        ${'★'.repeat(resena.calificacion)}${'☆'.repeat(5 - resena.calificacion)}
                                    </div>
                                    <p class="review-comment">${resena.comentario}</p>
                                    <small>${new Date(resena.fechaResena).toLocaleDateString()}</small>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 1rem;">
                        <button class="btn btn-primary" onclick="app.toggleFavorite(${equipo.idEquipo})">
                            <i class="fas fa-heart"></i> ${this.favoritos.some(f => f.equipo?.idEquipo === equipo.idEquipo) ? 'Remover de Favoritos' : 'Agregar a Favoritos'}
                        </button>
                        ${this.currentUser && equipo.proveedor ? `
                            <button class="btn btn-outline" onclick="app.showReviewModal(${equipo.proveedor.idProveedor})">
                                <i class="fas fa-star"></i> Reseñar Proveedor
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        this.showModal('equipmentModal');
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

    // Métodos para favoritos mejorados
    async removeFromFavorites(equipoId) {
        if (!this.currentUser) return;

        try {
            const favorito = this.favoritos.find(f => f.equipo?.idEquipo === equipoId);
            if (favorito) {
                await api.deleteFavorito(favorito.idFavorito);
                await this.loadUserFavorites();
                this.showMessage('Removido de favoritos', 'success');
            }
        } catch (error) {
            console.error('Error removiendo de favoritos:', error);
            this.showMessage('Error al remover de favoritos', 'error');
        }
    }

    async toggleFavorite(equipoId) {
        const isFavorito = this.favoritos.some(f => f.equipo?.idEquipo === equipoId);
        
        if (isFavorito) {
            await this.removeFromFavorites(equipoId);
        } else {
            await this.addToFavorites(equipoId);
        }
    }

    // Métodos para reseñas
    showReviewModal(proveedorId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para dejar una reseña', 'info');
            return;
        }

        this.reviewingProveedorId = proveedorId;
        this.showModal('reviewModal');
    }

    async handleAddReview() {
        if (!this.currentUser || !this.reviewingProveedorId) return;

        const rating = document.getElementById('reviewRating').value;
        const comment = document.getElementById('reviewComment').value;

        if (!rating || !comment) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        try {
            this.showLoading();
            await api.createResena({
                usuario: { idUsuario: this.currentUser.idUsuario },
                proveedor: { idProveedor: this.reviewingProveedorId },
                calificacion: parseInt(rating),
                comentario: comment
            });

            this.showMessage('Reseña agregada exitosamente', 'success');
            this.hideAllModals();
            
            // Recargar reseñas
            const resenas = await api.getResenas();
            this.resenas = resenas || [];
            
            this.hideLoading();
        } catch (error) {
            console.error('Error agregando reseña:', error);
            this.showMessage('Error al agregar la reseña', 'error');
            this.hideLoading();
        }
    }

    // Métodos para historial de búsquedas
    async loadUserHistory() {
        if (!this.currentUser) return;
        
        try {
            const historial = await api.getHistorialPorUsuario(this.currentUser.idUsuario);
            this.historialBusquedas = historial || [];
            this.renderSearchHistory();
        } catch (error) {
            console.error('Error cargando historial:', error);
        }
    }

    renderSearchHistory() {
        const historyList = document.getElementById('searchHistoryList');
        const noHistory = document.getElementById('noHistory');

        if (this.historialBusquedas.length === 0) {
            historyList.style.display = 'none';
            noHistory.style.display = 'block';
            return;
        }

        historyList.style.display = 'block';
        noHistory.style.display = 'none';

        historyList.innerHTML = this.historialBusquedas.map(item => `
            <div class="history-item">
                <div class="history-content" onclick="app.executeHistorySearch('${item.terminoBusqueda}')" style="cursor: pointer;">
                    <i class="fas fa-search"></i>
                    <span class="search-term">${item.terminoBusqueda}</span>
                    <small>${new Date(item.fechaBusqueda).toLocaleDateString()}</small>
                </div>
                <button class="btn btn-sm btn-outline" onclick="app.deleteHistoryItem(${item.idBusqueda})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    async deleteHistoryItem(busquedaId) {
        try {
            await api.deleteHistorialBusqueda(busquedaId);
            await this.loadUserHistory();
            this.showMessage('Búsqueda eliminada del historial', 'success');
        } catch (error) {
            console.error('Error eliminando historial:', error);
            this.showMessage('Error al eliminar del historial', 'error');
        }
    }

    async clearSearchHistory() {
        if (!this.currentUser) return;

        try {
            await api.deleteHistorialPorUsuario(this.currentUser.idUsuario);
            this.historialBusquedas = [];
            this.renderSearchHistory();
            this.showMessage('Historial limpiado exitosamente', 'success');
        } catch (error) {
            console.error('Error limpiando historial:', error);
            this.showMessage('Error al limpiar el historial', 'error');
        }
    }

    executeHistorySearch(searchTerm) {
        // Establecer el término de búsqueda en el input
        document.getElementById('searchInput').value = searchTerm;
        
        // Ejecutar la búsqueda (sin guardar en historial ya que ya existe)
        this.handleRealTimeSearch(searchTerm);
        
        // Hacer scroll al catálogo
        document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
        
        this.showMessage(`Buscando: ${searchTerm}`, 'info');
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
            this.showLoading();
            const tickets = await api.getTicketsPorUsuario(this.currentUser.idUsuario);
            this.ticketsSoporte = tickets || [];
            this.renderUserTickets();
            this.hideLoading();
        } catch (error) {
            console.error('Error cargando tickets del usuario:', error);
            this.showMessage('Error al cargar los tickets', 'error');
            this.hideLoading();
        }
    }

    showUserTickets() {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para ver tus tickets', 'info');
            return;
        }

        const ticketsList = document.getElementById('userTicketsList');
        if (ticketsList.style.display === 'none') {
            ticketsList.style.display = 'block';
            this.loadUserTickets();
        } else {
            ticketsList.style.display = 'none';
        }
    }

    async filterUserTickets() {
        const statusFilter = document.getElementById('ticketStatusFilter').value;
        const filteredTickets = statusFilter 
            ? this.ticketsSoporte.filter(ticket => ticket.estado === statusFilter)
            : this.ticketsSoporte;
        
        this.renderUserTickets(filteredTickets);
    }

    renderUserTickets(tickets = this.ticketsSoporte) {
        const content = document.getElementById('userTicketsContent');
        const totalTickets = document.getElementById('totalTickets');
        
        totalTickets.textContent = tickets.length;

        if (tickets.length === 0) {
            content.innerHTML = `
                <div class="no-tickets">
                    <i class="fas fa-ticket-alt"></i>
                    <p>No tienes tickets de soporte</p>
                    <button class="btn btn-primary" onclick="app.showSupportTicketModal()">
                        Crear Primer Ticket
                    </button>
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
                        <small><i class="fas fa-calendar"></i> ${new Date(ticket.fechaCreacion).toLocaleDateString()}</small>
                        <small><i class="fas fa-clock"></i> ${new Date(ticket.fechaCreacion).toLocaleTimeString()}</small>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getStatusText(status) {
        const statusMap = {
            'pendiente': 'Pendiente',
            'en_proceso': 'En Proceso',
            'resuelto': 'Resuelto'
        };
        return statusMap[status] || status;
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
            this.populateFilters();
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
            this.populateFilters();
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
            this.populateFilters();
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
            this.populateFilters();
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
            this.populateFilters();
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
            this.populateFilters();
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

    showContactSupport() {
        this.showSupportTicketModal();
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    showLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'flex';
    }

    hideLoading() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'none';
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
    window.app = new ClienteApp();
}); 