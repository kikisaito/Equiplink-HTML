function abrirRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    limpiarErrores();
    limpiarCampos();
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('modalRegistro');
    if (event.target === modal) {
        cerrarRegistro();
    }
});

function mostrarError(elementId, mensaje) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = mensaje;
        errorElement.style.display = 'block';
    }
}

function ocultarError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function limpiarErrores() {
    ocultarError('errorUsuario');
    ocultarError('errorTipoUsuario');
    ocultarError('errorCorreo');
    ocultarError('errorContrasena');
}

function limpiarCampos() {
    document.getElementById('usuario').value = '';
    document.getElementById('tipoUsuario').value = '';
    document.getElementById('correo').value = '';
    document.getElementById('contrasena').value = '';
    document.getElementById('tipoUsuario').selectedIndex = 0;
}

function validarRegistro() {
    let isValid = true;
    limpiarErrores();

    const usuario = document.getElementById('usuario').value.trim();
    const tipoUsuario = document.getElementById('tipoUsuario').value;
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim(); // <- aquí se captura bien

    if (usuario === '') {
        mostrarError('errorUsuario', 'El nombre de usuario es obligatorio.');
        isValid = false;
    } else if (usuario.length < 3) {
        mostrarError('errorUsuario', 'El usuario debe tener al menos 3 caracteres.');
        isValid = false;
    }

    if (tipoUsuario === '' || tipoUsuario === 'Selecciona un tipo') {
        mostrarError('errorTipoUsuario', 'Debe seleccionar un tipo de usuario.');
        isValid = false;
    }

    if (correo === '') {
        mostrarError('errorCorreo', 'El correo electrónico es obligatorio.');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarError('errorCorreo', 'Ingrese un correo electrónico válido.');
        isValid = false;
    }

    if (contrasena === '') {
        mostrarError('errorContrasena', 'La contraseña es obligatoria.');
        isValid = false;
    } else if (contrasena.length < 6) {
        mostrarError('errorContrasena', 'La contraseña debe tener al menos 6 caracteres.');
        isValid = false;
    }

    if (isValid) {
        registrarUsuario(usuario, tipoUsuario, correo, contrasena);
    }

    return false;
}

async function registrarUsuario(usuario, tipoUsuario, correo, contrasena) {
    const API_URL = 'http://localhost:8000/api/usuarios';

    let rol;
    if (tipoUsuario === 'comprador') {
        rol = 'cliente';
    } else if (tipoUsuario === 'compania') {
        rol = 'proveedor';
    } else {
        rol = 'cliente';
    }

    const userData = {
        nombre: usuario,
        correo: correo,
        contraseña: contrasena, // <- aquí la clave corregida
        rol: rol
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Registro exitoso:', data);
            alert('¡Registro exitoso! Ya puedes iniciar sesión.');
            cerrarRegistro();
        } else {
            const errorData = await response.text();
            console.error('Error en el registro:', response.status, errorData);
            alert('Error al registrar usuario: ' + errorData);
        }
    } catch (error) {
        console.error('Error de red:', error);
        alert('No se pudo conectar con el servidor.');
    }
}

function irALogin() {
    cerrarRegistro();
    alert('Redirigiendo a la página de inicio de sesión (simulado).');
}
