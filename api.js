class API {
    constructor() {
        this.baseURL = 'http://localhost:8000/api';
        this.headers = {
            'Content-Type': 'application/json'
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Métodos para Marcas
    async getMarcas() {
        return this.request('/marcas');
    }

    async getMarca(id) {
        return this.request(`/marcas/${id}`);
    }

    async createMarca(marcaData) {
        return this.request('/marcas', {
            method: 'POST',
            body: JSON.stringify(marcaData)
        });
    }

    async updateMarca(id, marcaData) {
        return this.request(`/marcas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(marcaData)
        });
    }

    async deleteMarca(id) {
        return this.request(`/marcas/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Tipos de Equipo
    async getTiposEquipo() {
        return this.request('/tipos-equipo');
    }

    async getTipoEquipo(id) {
        return this.request(`/tipos-equipo/${id}`);
    }

    async createTipoEquipo(tipoData) {
        return this.request('/tipos-equipo', {
            method: 'POST',
            body: JSON.stringify(tipoData)
        });
    }

    async updateTipoEquipo(id, tipoData) {
        return this.request(`/tipos-equipo/${id}`, {
            method: 'PUT',
            body: JSON.stringify(tipoData)
        });
    }

    async deleteTipoEquipo(id) {
        return this.request(`/tipos-equipo/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Proveedores
    async getProveedores() {
        return this.request('/proveedores');
    }

    async getProveedor(id) {
        return this.request(`/proveedores/${id}`);
    }

    async createProveedor(proveedorData) {
        return this.request('/proveedores', {
            method: 'POST',
            body: JSON.stringify(proveedorData)
        });
    }

    async updateProveedor(id, proveedorData) {
        return this.request(`/proveedores/${id}`, {
            method: 'PUT',
            body: JSON.stringify(proveedorData)
        });
    }

    async deleteProveedor(id) {
        return this.request(`/proveedores/${id}`, {
            method: 'DELETE'
        });
    }

    async validarProveedor(id) {
        return this.request(`/proveedores/${id}/validar`, {
            method: 'PATCH'
        });
    }

    // Métodos para Equipos Médicos
    async getEquiposMedicos() {
        return this.request('/equipos-medicos');
    }

    async getEquipoMedico(id) {
        return this.request(`/equipos-medicos/${id}`);
    }

    async createEquipoMedico(equipoData) {
        return this.request('/equipos-medicos', {
            method: 'POST',
            body: JSON.stringify(equipoData)
        });
    }

    async updateEquipoMedico(id, equipoData) {
        return this.request(`/equipos-medicos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(equipoData)
        });
    }

    async deleteEquipoMedico(id) {
        return this.request(`/equipos-medicos/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Usuarios
    async getUsuarios() {
        return this.request('/usuarios');
    }

    async getUsuario(id) {
        return this.request(`/usuarios/${id}`);
    }

    async createUsuario(usuarioData) {
        return this.request('/usuarios', {
            method: 'POST',
            body: JSON.stringify(usuarioData)
        });
    }

    async updateUsuario(id, usuarioData) {
        return this.request(`/usuarios/${id}`, {
            method: 'PUT',
            body: JSON.stringify(usuarioData)
        });
    }

    async deleteUsuario(id) {
        return this.request(`/usuarios/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Reseñas
    async getResenas() {
        return this.request('/resenas');
    }

    async getResena(id) {
        return this.request(`/resenas/${id}`);
    }

    async createResena(resenaData) {
        return this.request('/resenas', {
            method: 'POST',
            body: JSON.stringify(resenaData)
        });
    }

    async updateResena(id, resenaData) {
        return this.request(`/resenas/${id}`, {
            method: 'PUT',
            body: JSON.stringify(resenaData)
        });
    }

    async deleteResena(id) {
        return this.request(`/resenas/${id}`, {
            method: 'DELETE'
        });
    }

    async getResenasPorProveedor(idProveedor) {
        return this.request(`/resenas/proveedor/${idProveedor}`);
    }

    async getResenasPorUsuario(idUsuario) {
        return this.request(`/resenas/usuario/${idUsuario}`);
    }

    // Métodos para Favoritos
    async getFavoritos() {
        return this.request('/favoritos');
    }

    async getFavorito(id) {
        return this.request(`/favoritos/${id}`);
    }

    async createFavorito(favoritoData) {
        return this.request('/favoritos', {
            method: 'POST',
            body: JSON.stringify(favoritoData)
        });
    }

    async deleteFavorito(id) {
        return this.request(`/favoritos/${id}`, {
            method: 'DELETE'
        });
    }

    async getFavoritosPorUsuario(idUsuario) {
        return this.request(`/favoritos/usuario/${idUsuario}`);
    }

    async getFavoritosPorEquipo(idEquipo) {
        return this.request(`/favoritos/equipo/${idEquipo}`);
    }

    // Métodos para Historial de Búsquedas
    async getHistorialBusquedas() {
        return this.request('/historial-busquedas');
    }

    async getHistorialBusqueda(id) {
        return this.request(`/historial-busquedas/${id}`);
    }

    async createHistorialBusqueda(historialData) {
        return this.request('/historial-busquedas', {
            method: 'POST',
            body: JSON.stringify(historialData)
        });
    }

    async deleteHistorialBusqueda(id) {
        return this.request(`/historial-busquedas/${id}`, {
            method: 'DELETE'
        });
    }

    async getHistorialPorUsuario(idUsuario) {
        return this.request(`/historial-busquedas/usuario/${idUsuario}`);
    }

    async buscarHistorial(termino) {
        return this.request(`/historial-busquedas/buscar?termino=${encodeURIComponent(termino)}`);
    }

    async deleteHistorialPorUsuario(idUsuario) {
        return this.request(`/historial-busquedas/usuario/${idUsuario}`, {
            method: 'DELETE'
        });
    }

    // Métodos para Tickets de Soporte
    async getTicketsSoporte() {
        return this.request('/soporte');
    }

    async getTicketSoporte(id) {
        return this.request(`/soporte/${id}`);
    }

    async createTicketSoporte(ticketData) {
        return this.request('/soporte', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    }

    async deleteTicketSoporte(id) {
        return this.request(`/soporte/${id}`, {
            method: 'DELETE'
        });
    }

    async getTicketsPorUsuario(idUsuario) {
        return this.request(`/soporte/usuario/${idUsuario}`);
    }

    async getTicketsPorEstado(estado) {
        return this.request(`/soporte/estado/${estado}`);
    }

    async updateEstadoTicket(id, estado) {
        return this.request(`/soporte/${id}/estado?estado=${estado}`, {
            method: 'PATCH'
        });
    }
}

// Crear instancia global de la API
const api = new API(); 