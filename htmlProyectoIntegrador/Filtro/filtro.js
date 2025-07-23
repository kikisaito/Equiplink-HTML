document.addEventListener('DOMContentLoaded', function() {
    
    // Obtener los elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const productGrid = document.getElementById('productGrid');
    const productCards = productGrid.getElementsByClassName('product-card');

    // Función para filtrar los productos
    function filtrarProductos() {
        // Obtener el término de búsqueda y convertirlo a minúsculas para una comparación sin distinción de mayúsculas/minúsculas
        const terminoBusqueda = searchInput.value.toLowerCase();

        // Iterar sobre cada tarjeta de producto
        for (let i = 0; i < productCards.length; i++) {
            const card = productCards[i];
            
            // Obtener el nombre del producto del atributo data-nombre y convertirlo a minúsculas
            const nombreProducto = card.dataset.nombre.toLowerCase();

            // Comprobar si el nombre del producto incluye el término de búsqueda
            if (nombreProducto.includes(terminoBusqueda)) {
                // Si coincide, mostrar la tarjeta
                card.style.display = 'flex'; 
            } else {
                // Si no coincide, ocultar la tarjeta
                card.style.display = 'none';
            }
        }
    }

    // El evento 'keyup' se dispara cada vez que el usuario suelta una tecla
    searchInput.addEventListener('keyup', filtrarProductos);

});