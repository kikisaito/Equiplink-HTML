// Abre el modal de login
function abrirLogin() {
  // Usamos classList.add para la animación CSS
  document.getElementById("modalFondo").classList.add("active");
}

// Cierra el modal de login
function cerrarLogin() {
  // Usamos classList.remove para la animación CSS
  document.getElementById("modalFondo").classList.remove("active");
  // Retrasamos la redirección para que la animación de cierre se vea
  setTimeout(() => {
    window.location.href = ""; // Asegúrate que esta ruta sea correcta para tu 'index.html'
  }, 300); // Duración de la transición en milisegundos
}

// Valida el formulario de login
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault(); // Previene el envío por defecto del formulario (recarga de página)

  // Obtener los valores de los campos
  const correo = document.getElementById("correo").value.trim();
  // CAMBIO CLAVE AQUÍ: Referencia al ID correcto del input HTML
  const contrasena = document.getElementById("contraseña").value.trim(); 

  // Referencias a los elementos donde se mostrarán los errores
  const errorCorreo = document.getElementById("errorCorreo");
  const errorContrasena = document.getElementById("errorContrasena"); // Mantener el ID del span para el error
  const errorGeneral = document.getElementById("errorGeneral");

  // Limpiar mensajes de error anteriores
  errorCorreo.textContent = "";
  errorContrasena.textContent = "";
  errorGeneral.textContent = "";

  let valido = true;

  // Validaciones del lado del cliente
  if (correo === "") {
    errorCorreo.textContent = "*Campo vacío";
    valido = false;
  }

  if (contrasena === "") {
    errorContrasena.textContent = "*Campo vacío";
    valido = false;
  }

  // Si alguna validación falló, detener la ejecución de la petición
  if (!valido) return false; // Retornar false para el onsubmit

  // Petición a la API para iniciar sesión
  fetch("http://localhost:8000/api/usuarios/login", { // Asegúrate que la URL de tu API sea correcta
    method: "POST",
    headers: {
      "Content-Type": "application/json" // Indicar que estamos enviando JSON
    },
    // CAMBIO CLAVE AQUÍ: La clave en el JSON debe ser "contraseña" para coincidir con el backend
    body: JSON.stringify({ correo: correo, contraseña: contrasena }) 
  })
    .then(response => {
      // Manejar respuestas HTTP: si no es 2xx, lanza un error con el mensaje del servidor
      if (response.ok) {
        return response.json(); // Si la respuesta es exitosa, parsear el JSON
      } else {
        // Si hay un error, leer el cuerpo del error (asumiendo que es JSON) y lanzar una excepción
        return response.json().then(errorData => {
          throw new Error(errorData.message || "Credenciales incorrectas o error desconocido.");
        });
      }
    })
    .then(data => {
      // Si la petición fue exitosa y la API devuelve un 'success' (o similar)
      // En tu caso, tu API devuelve el usuario si es exitoso, o un JSON de error si no.
      console.log("Login exitoso. Datos del usuario:", data);
      alert("¡Inicio de sesión exitoso!");
      // Redirigir a la página de cliente (asegúrate de que esta ruta sea correcta)
      window.location.href = "."; 
    })
    .catch(error => {
      // Capturar cualquier error que ocurra durante la petición o el procesamiento de la respuesta
      // CAMBIO AQUÍ: Agregado console.error para una depuración más detallada
      console.error("Error completo en el login (JS Catch):", error); 
      // Mostrar el mensaje de error al usuario
      errorGeneral.textContent = error.message || "Error de conexión con el servidor. Inténtalo de nuevo.";
    });

  return false; // Prevenir el envío normal del formulario (importante para onsubmit)
});

// Mostrar el modal automáticamente al cargar la página
window.onload = function() {
  abrirLogin(); // Llama a la función para mostrar el modal con la animación
};