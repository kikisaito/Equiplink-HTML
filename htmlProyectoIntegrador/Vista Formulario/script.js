// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    
    // Manejo del archivo
    const fileInput = document.getElementById('fileInput');
    const fileText = document.getElementById('fileText');

    if (fileInput && fileText) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                if (files.length === 1) {
                    fileText.textContent = `Seleccionado: ${files[0].name}`;
                } else {
                    fileText.textContent = `Seleccionados: ${files.length} archivos`;
                }
            } else {
                fileText.textContent = 'Seleccionar archivo · No se ha seleccionado ningún archivo';
            }
        });
    }

    // Manejo del formulario
    const equipmentForm = document.getElementById('equipmentForm');
    if (equipmentForm) {
        equipmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Animación del botón
            const submitBtn = document.querySelector('.submit-btn');
            if (submitBtn) {
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Publicando...';
                submitBtn.style.opacity = '0.7';
                
                // Simular envío
                setTimeout(() => {
                    alert('¡Equipamiento registrado exitosamente!');
                    submitBtn.textContent = originalText;
                    submitBtn.style.opacity = '1';
                }, 1500);
            }
        });
    }

    // Agregar validación en tiempo real
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.style.borderColor = '#e53e3e';
            } else {
                this.style.borderColor = '#e2e8f0';
            }
        });
    });
});

// Función para validar formulario (opcional)
function validateForm() {
    const requiredFields = document.querySelectorAll('.form-input[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e53e3e';
            isValid = false;
        } else {
            field.style.borderColor = '#e2e8f0';
        }
    });
    
    return isValid;
}