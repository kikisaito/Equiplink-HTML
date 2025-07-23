class EquipLinkApp {
    constructor() {
        this.currentUser = null;
        this.equipos = [];
        this.marcas = [];
        this.tiposEquipo = [];
        this.proveedores = [];
        this.favoritos = [];
        this.resenas = [];
        this.ticketsSoporte = [];
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadInitialData();
        this.setupMobileMenu();
        this.setupModals();
        this.setupContactForm();
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

        // Botones de autenticación
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });

        document.getElementById('registerBtn').addEventListener('click', () => {
            this.showModal('registerModal');
        });

        // Formularios de autenticación
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
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

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }
    }

    showModal(modalId) {
        this.hideAllModals();
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    async loadInitialData() {
        try {
            this.showLoading();
            
            const [equipos, marcas, tiposEquipo, proveedores, resenas, ticketsSoporte] = await Promise.all([
                api.getEquiposMedicos(),
                api.getMarcas(),
                api.getTiposEquipo(),
                api.getProveedores(),
                api.getResenas(),
                api.getTicketsSoporte()
            ]);

            this.equipos = equipos || [];
            this.marcas = marcas || [];
            this.tiposEquipo = tiposEquipo || [];
            this.proveedores = proveedores || [];
            this.resenas = resenas || [];
            this.ticketsSoporte = ticketsSoporte || [];

            this.populateFilters();
            this.renderEquipos();
            this.hideLoading();

        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
            this.showMessage('Error al cargar los datos. Por favor, intenta de nuevo.', 'error');
            this.hideLoading();
        }
    }

    populateFilters() {
        const categorySelect = document.getElementById('categoryFilter');
        const brandSelect = document.getElementById('brandFilter');

        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
            this.tiposEquipo.forEach(tipo => {
                const option = document.createElement('option');
                option.value = tipo.idTipo;
                option.textContent = tipo.nombreTipo;
                categorySelect.appendChild(option);
            });
        }

        if (brandSelect) {
            brandSelect.innerHTML = '<option value="">Todas las marcas</option>';
            this.marcas.forEach(marca => {
                const option = document.createElement('option');
                option.value = marca.idMarca;
                option.textContent = marca.nombreMarca;
                brandSelect.appendChild(option);
            });
        }
    }

    renderEquipos(equiposToRender = this.equipos) {
        const grid = document.getElementById('equipmentGrid');
        if (!grid) return;

        if (equiposToRender.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron equipos</p>
                    <p>Intenta ajustar los filtros de búsqueda</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = equiposToRender.map(equipo => this.createEquipmentCard(equipo)).join('');
        this.updateResultsCount(equiposToRender.length);
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
                        ${this.currentUser ? `
                            <button class="btn btn-outline" onclick="app.showReviewModal(${equipo.proveedor?.idProveedor})">
                                <i class="fas fa-star"></i> Reseñar
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    filterEquipos() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const brandFilter = document.getElementById('brandFilter')?.value || '';
        const priceFilter = document.getElementById('priceFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        let filteredEquipos = this.equipos;

        // Filtro por búsqueda
        if (searchTerm) {
            filteredEquipos = filteredEquipos.filter(equipo =>
                equipo.nombreEquipo.toLowerCase().includes(searchTerm) ||
                equipo.descripcion?.toLowerCase().includes(searchTerm) ||
                this.marcas.find(m => m.idMarca === equipo.marca?.idMarca)?.nombreMarca.toLowerCase().includes(searchTerm) ||
                this.tiposEquipo.find(t => t.idTipo === equipo.tipoEquipo?.idTipo)?.nombreTipo.toLowerCase().includes(searchTerm)
            );
        }

        // Filtro por categoría
        if (categoryFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.tipoEquipo?.idTipo == categoryFilter
            );
        }

        // Filtro por marca
        if (brandFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.marca?.idMarca == brandFilter
            );
        }

        // Filtro por precio
        if (priceFilter) {
            const maxPrice = parseFloat(priceFilter);
            filteredEquipos = filteredEquipos.filter(equipo => 
                parseFloat(equipo.precio) <= maxPrice
            );
        }

        // Filtro por estado
        if (statusFilter) {
            filteredEquipos = filteredEquipos.filter(equipo => 
                equipo.estado === statusFilter
            );
        }

        this.renderEquipos(filteredEquipos);
    }

    handleRealTimeSearch(searchTerm) {
        if (searchTerm.length >= 2) {
            this.filterEquipos();
        } else if (searchTerm.length === 0) {
            this.renderEquipos();
        }
    }

    async handleSearch() {
        const searchTerm = document.getElementById('searchInput')?.value;
        if (!searchTerm || searchTerm.trim() === '') {
            this.showMessage('Por favor, ingresa un término de búsqueda', 'info');
            return;
        }

        try {
            this.showLoading();
            
            // Registrar búsqueda en historial si hay usuario logueado
            if (this.currentUser) {
                try {
                    await api.createHistorialBusqueda({
                        usuario: { idUsuario: this.currentUser.idUsuario },
                        terminoBusqueda: searchTerm
                    });
                } catch (error) {
                    console.error('Error registrando búsqueda:', error);
                }
            }

            this.filterEquipos();
            this.hideLoading();

        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showMessage('Error al realizar la búsqueda', 'error');
            this.hideLoading();
        }
    }

    clearFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');
        const brandFilter = document.getElementById('brandFilter');
        const priceFilter = document.getElementById('priceFilter');
        const statusFilter = document.getElementById('statusFilter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (brandFilter) brandFilter.value = '';
        if (priceFilter) priceFilter.value = '';
        if (statusFilter) statusFilter.value = '';

        this.renderEquipos();
    }

    updateResultsCount(count = this.equipos.length) {
        const countElement = document.getElementById('resultsCount');
        if (countElement) {
            countElement.textContent = `${count} equipo${count !== 1 ? 's' : ''} encontrado${count !== 1 ? 's' : ''}`;
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            this.showLoading();
            const usuarios = await api.getUsuarios();
            const usuario = usuarios.find(u => u.correo === email && u.contraseña === password);

            if (usuario) {
                this.currentUser = usuario;
                localStorage.setItem('currentUser', JSON.stringify(usuario));
                this.hideAllModals();
                this.showMessage('Inicio de sesión exitoso', 'success');
                this.updateAuthUI();
                await this.loadUserFavorites();
                
                setTimeout(() => {
                    if (usuario.rol === 'proveedor') {
                        window.location.href = '../htmlProyectoIntegrador/proveedor/proveedor.html';
                    } else {
                        window.location.href = 'cliente.html';
                    }
                }, 1000);
            } else {
                this.showMessage('Credenciales incorrectas', 'error');
            }
            this.hideLoading();
        } catch (error) {
            console.error('Error en login:', error);
            this.showMessage('Error al iniciar sesión', 'error');
            this.hideLoading();
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        try {
            this.showLoading();
            const newUser = await api.registerUsuario({
                nombre: name,
                correo: email,
                contraseña: password,
                rol: role
            });

            this.currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            this.hideAllModals();
            this.showMessage('Registro exitoso', 'success');
            this.updateAuthUI();
            
            setTimeout(() => {
                if (newUser.rol === 'proveedor') {
                    window.location.href = '../htmlProyectoIntegrador/proveedor/proveedor.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            }, 1000);
            this.hideLoading();
        } catch (error) {
            console.error('Error en registro:', error);
            this.showMessage('Error al registrarse', 'error');
            this.hideLoading();
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.nav-auth');
        const userInfo = document.getElementById('userInfo');
        const supportBtn = document.getElementById('supportBtn');
        const myTicketsBtn = document.getElementById('myTicketsBtn');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (this.currentUser) {
            if (authButtons) {
                authButtons.innerHTML = `
                    <span>Hola, ${this.currentUser.nombre}</span>
                    <button onclick="app.showSupportTicketModal()" class="btn btn-outline">
                        <i class="fas fa-headset"></i> Soporte
                    </button>
                    <button onclick="app.showUserTickets()" class="btn btn-outline">
                        <i class="fas fa-ticket-alt"></i> Mis Tickets
                    </button>
                    <button onclick="app.logout()" class="btn btn-outline">Cerrar Sesión</button>
                `;
            }
            if (userInfo) {
                userInfo.textContent = `Hola, ${this.currentUser.nombre}`;
            }
            if (supportBtn) supportBtn.style.display = 'inline-block';
            if (myTicketsBtn) myTicketsBtn.style.display = 'inline-block';
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
        } else {
            if (authButtons) {
                authButtons.innerHTML = `
                    <button id="loginBtn" class="btn btn-outline">Iniciar Sesión</button>
                    <button id="registerBtn" class="btn btn-primary">Registrarse</button>
                `;
            }
            if (userInfo) {
                userInfo.textContent = '';
            }
            if (supportBtn) supportBtn.style.display = 'none';
            if (myTicketsBtn) myTicketsBtn.style.display = 'none';
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
        }
    }

    logout() {
        this.currentUser = null;
        this.favoritos = [];
        localStorage.removeItem('currentUser');
        this.updateAuthUI();
        this.renderEquipos();
        this.showMessage('Sesión cerrada exitosamente', 'success');
    }

    async loadUserFavorites() {
        if (!this.currentUser) return;
        
        try {
            const userFavoritos = await api.getFavoritosPorUsuario(this.currentUser.idUsuario);
            this.favoritos = userFavoritos || [];
        } catch (error) {
            console.error('Error cargando favoritos:', error);
        }
    }

    async addToFavorites(equipoId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para agregar favoritos', 'info');
            return;
        }

        try {
            await api.createFavorito({
                usuario: { idUsuario: this.currentUser.idUsuario },
                equipo: { idEquipo: equipoId }
            });
            
            await this.loadUserFavorites();
            this.renderEquipos();
            this.showMessage('Agregado a favoritos', 'success');
        } catch (error) {
            console.error('Error agregando a favoritos:', error);
            this.showMessage('Error al agregar a favoritos', 'error');
        }
    }

    async removeFromFavorites(equipoId) {
        if (!this.currentUser) return;

        try {
            const favorito = this.favoritos.find(f => f.equipo?.idEquipo === equipoId);
            if (favorito) {
                await api.deleteFavorito(favorito.idFavorito);
                await this.loadUserFavorites();
                this.renderEquipos();
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
        if (modalContent) {
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
        }

        this.showModal('equipmentModal');
    }

    showReviewModal(proveedorId) {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para dejar una reseña', 'info');
            return;
        }

        // Guardar el ID del proveedor para la reseña
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

    async handleContactForm() {
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;

        if (!name || !email || !message) {
            this.showMessage('Por favor, completa todos los campos', 'error');
            return;
        }

        this.showMessage('Mensaje enviado exitosamente. Te contactaremos pronto.', 'success');
        document.getElementById('contactForm').reset();
    }

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
            const tickets = await api.getTicketsSoporte();
            this.ticketsSoporte = tickets || [];
            
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
            const userTickets = await api.getTicketsPorUsuario(this.currentUser.idUsuario);
            return userTickets || [];
        } catch (error) {
            console.error('Error cargando tickets del usuario:', error);
            return [];
        }
    }

    showUserTickets() {
        if (!this.currentUser) {
            this.showMessage('Debes iniciar sesión para ver tus tickets', 'info');
            return;
        }

        this.loadUserTickets().then(tickets => {
            const modalContent = document.getElementById('userTicketsContent');
            if (modalContent) {
                if (tickets.length === 0) {
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
                            ${tickets.map(ticket => `
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
        });
    }

    showLoading() {
        const loadingIndicator = document.getElementById('loading');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingIndicator = document.getElementById('loading');
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
    window.app = new EquipLinkApp();
}); 