// Verificar si hay un ejemplo para cargar desde la URL o sessionStorage
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si hay un parámetro de ejemplo en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const exampleParam = urlParams.get('example');
    
    if (exampleParam) {
        // Verificar si tenemos datos del ejemplo en sessionStorage
        const exampleData = JSON.parse(sessionStorage.getItem('dockingExample') || '{}');
        
        if (Object.keys(exampleData).length > 0) {
            // Mostrar notificación de ejemplo cargado
            showNotification(`Ejemplo cargado: ${exampleData.description || exampleParam}`);
            
            // Aquí se añadiría el código para cargar los archivos del ejemplo
            // Pero necesitaríamos modificar el frontend para manejar archivos precargados
            console.log('Cargando ejemplo:', exampleData);
            
            // Limpiar sessionStorage después de cargar
            sessionStorage.removeItem('dockingExample');
        } else {
            // Si no hay datos en sessionStorage, hacer una solicitud al servidor
            fetch(`/examples/${exampleParam}`)
                .then(response => response.json())
                .then(data => {
                    showNotification(`Ejemplo cargado: ${data.description || exampleParam}`);
                    console.log('Cargando ejemplo:', data);
                    // Aquí cargaríamos los archivos
                })
                .catch(error => {
                    console.error('Error cargando el ejemplo:', error);
                });
        }
    }
});

// Función para mostrar notificaciones
function showNotification(message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Añadir al DOM
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Configurar cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    });
    
    // Auto-cierre después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}