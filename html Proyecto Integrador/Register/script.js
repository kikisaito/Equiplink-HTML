function validarRegistro() {
  // Obtener valores de los campos
  let usuario = document.getElementById("usuario").value.trim();
  let tipoUsuario = document.getElementById("tipoUsuario").value; // Nuevo campo
  let correo = document.getElementById("correo").value.trim();
  let contrasena = document.getElementById("contrasena").value.trim();

  // Obtener elementos de error
  let errorUsuario = document.getElementById("errorUsuario");
  let errorTipoUsuario = document.getElementById("errorTipoUsuario"); // Nuevo span de error
  let errorCorreo = document.getElementById("errorCorreo");
  let errorContrasena = document.getElementById("errorContrasena");

  // Limpiar errores previos
  errorUsuario.textContent = "";
  errorTipoUsuario.textContent = ""; // Limpiar nuevo error
  errorCorreo.textContent = "";
  errorContrasena.textContent = "";

  let valido = true;

  // Validación de Usuario
  if (usuario === "") {
    errorUsuario.textContent = "*Campo vacío";
    valido = false;
  }

  if (tipoUsuario === "") {
    errorTipoUsuario.textContent = "*Debes seleccionar un tipo de usuario";
    valido = false;
  }

  // Validación de Correo
  if (correo === "") {
    errorCorreo.textContent = "*Campo vacío";
    valido = false;
  }

  // Validación de Contraseña
  if (contrasena === "") {
    errorContrasena.textContent = "*Campo vacío";
    valido = false;
  }

  return valido;
}

function abrirRegistro() {
  document.getElementById("modalRegistro").style.display = "flex";
}

function cerrarRegistro() {
  document.getElementById("modalRegistro").style.display = "none";
}

function irALogin() {
  console.log("Cambiando a Login...");
}