// Abre el modal de login
function abrirLogin() {
  document.getElementById("modalFondo").style.display = "flex";
}

// Cierra el modal de login
function cerrarLogin() {
  // document.getElementById("modalFondo").style.display = "none";
  window.location.href = "../index.html";
}

// Valida el formulario de login
function validarLogin() {
  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value.trim();
  const errorCorreo = document.getElementById("errorCorreo");
  const errorContrasena = document.getElementById("errorContrasena");

  errorCorreo.textContent = "";
  errorContrasena.textContent = "";

  let valido = true;

  if (correo === "") {
    errorCorreo.textContent = "*Campo vacío";
    valido = false;
  }

  if (contrasena === "") {
    errorContrasena.textContent = "*Campo vacío";
    valido = false;
  }

  return valido;
}
