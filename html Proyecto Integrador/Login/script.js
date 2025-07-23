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
  const errorGeneral = document.getElementById("errorGeneral");

  errorCorreo.textContent = "";
  errorContrasena.textContent = "";
  errorGeneral.textContent = "";

  let valido = true;

  if (correo === "") {
    errorCorreo.textContent = "*Campo vacío";
    valido = false;
  }

  if (contrasena === "") {
    errorContrasena.textContent = "*Campo vacío";
    valido = false;
  }

  if (!valido) return false;

  // Petición a la API
  fetch("http://localhost:8000/api/usuarios/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ correo: correo, contrasena: contrasena })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirigir a la página principal o dashboard
        console.log("Login exitoso");
        window.location.href = "./cliente/cliente.html";
      } else {
        errorGeneral.textContent = data.message || "Credenciales incorrectas";
      }
    })
    .catch(error => {
      errorGeneral.textContent = "Error de conexión con el servidor";
    });

  return false; // Prevenir el envío normal del formulario
}
