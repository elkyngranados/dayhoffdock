// Script para la sección educativa de DayhoffDock

document.addEventListener('DOMContentLoaded', function() {
    // Navegación de la tabla de contenidos
    setupTableOfContents();
    
    // Destacar código de sintaxis
    highlightCodeBlocks();
    
    // Manejo de imágenes interactivas
    setupInteractiveImages();
    
    // Inicializar animaciones
    initAnimations();
});

/**
 * Configura la navegación de la tabla de contenidos
 */
function setupTableOfContents() {
    const tocLinks = document.querySelectorAll('.toc-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Manejo de clics en los enlaces de la tabla de contenidos
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Obtener el ID de la sección objetivo desde el atributo href
            const targetId = this.getAttribute('href').substring(1);
            
            // Desactivar todos los enlaces y secciones
            tocLinks.forEach(l => l.classList.remove('active'));
            contentSections.forEach(s => s.classList.remove('active'));
            
            // Activar el enlace clickeado y la sección correspondiente
            this.classList.add('active');
            document.getElementById(targetId).classList.add('active');
            
            // Actualizar la URL sin recargar la página
            window.history.pushState(null, null, `#${targetId}`);
            
            // Scroll al inicio de la sección en dispositivos móviles
            if (window.innerWidth < 992) {
                document.querySelector('.content-panel').scrollTop = 0;
                window.scrollTo(0, document.querySelector('.content-panel').offsetTop - 20);
            }
        });
    });
    
    // Verificar si hay un hash en la URL al cargar
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.toc-link[href="#${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }
    
    // Manejo de scroll para destacar la sección activa
    if (window.innerWidth >= 992) {
        window.addEventListener('scroll', debounce(function() {
            highlightActiveSectionOnScroll();
        }, 100));
    }
}

/**
 * Detecta qué sección está visible y actualiza la tabla de contenidos
 */
function highlightActiveSectionOnScroll() {
    const scrollPosition = window.scrollY;
    const contentSections = document.querySelectorAll('.content-section.active');
    
    if (contentSections.length === 0) return;
    
    const contentPanel = document.querySelector('.content-panel');
    const contentPanelTop = contentPanel.offsetTop;
    const contentPanelBottom = contentPanelTop + contentPanel.offsetHeight;
    
    // Si estamos fuera del área de contenido, no hacer nada
    if (scrollPosition < contentPanelTop || scrollPosition > contentPanelBottom) {
        return;
    }
    
    const activeSection = document.querySelector('.content-section.active');
    const sectionLinks = document.querySelectorAll('.toc-link');
    
    // Encontrar subsecciones dentro de la sección activa
    const subsections = activeSection.querySelectorAll('h3, h4');
    let currentSubsection = null;
    
    // Encontrar la última subsección que ha pasado la parte superior de la ventana
    for (let i = 0; i < subsections.length; i++) {
        const subsection = subsections[i];
        const subsectionTop = subsection.offsetTop;
        
        if (scrollPosition >= subsectionTop - 100) {
            currentSubsection = subsection;
        } else {
            break;
        }
    }
    
    // Si se encontró una subsección, actualizar el texto actual en la barra de navegación
    if (currentSubsection) {
        const currentSectionTitle = document.querySelector('.current-section');
        if (currentSectionTitle) {
            currentSectionTitle.textContent = currentSubsection.textContent;
        }
    }
}

/**
 * Función para debounce (limitar la frecuencia de ejecución)
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Destaca los bloques de código para mejor legibilidad
 */
function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre code');
    
    codeBlocks.forEach(block => {
        // Añadir clases para diferentes partes de la sintaxis
        const content = block.innerHTML;
        let highlighted = content
            // Comentarios
            .replace(/(#.*)/g, '<span class="code-comment">$1</span>')
            // Palabras clave
            .replace(/(import|from|def|class|if|else|elif|for|while|try|except|return|and|or|not|in|is)/g, '<span class="code-keyword">$1</span>')
            // Cadenas
            .replace(/(".*?")/g, '<span class="code-string">$1</span>')
            .replace(/('.*?')/g, '<span class="code-string">$1</span>')
            // Números
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>')
            // Funciones
            .replace(/(\w+)(\()/g, '<span class="code-function">$1</span>$2');
        
        block.innerHTML = highlighted;
    });
    
    // Añadir estilos para el destacado de sintaxis
    const style = document.createElement('style');
    style.textContent = `
        .code-comment { color: #6a737d; }
        .code-keyword { color: #d73a49; font-weight: bold; }
        .code-string { color: #032f62; }
        .code-number { color: #005cc5; }
        .code-function { color: #6f42c1; }
    `;
    document.head.appendChild(style);
}

/**
 * Configura imágenes interactivas donde corresponda
 */
function setupInteractiveImages() {
    const interactiveImages = document.querySelectorAll('.interactive-image');
    
    interactiveImages.forEach(img => {
        img.addEventListener('click', function() {
            // Si la imagen tiene un modal asociado, mostrarlo
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('visible');
                }
            }
            
            // Alternativamente, podríamos ampliar la imagen
            if (this.classList.contains('zoomable')) {
                if (this.classList.contains('zoomed')) {
                    this.classList.remove('zoomed');
                } else {
                    this.classList.add('zoomed');
                }
            }
        });
    });
}

/**
 * Inicializa animaciones para elementos específicos
 */
function initAnimations() {
    // Añadir animaciones a elementos clave
    const animatedElements = document.querySelectorAll('.animation-trigger');
    
    animatedElements.forEach(el => {
        // Crear un observador de intersección para activar animaciones cuando elementos están en el viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    // Opcionalmente, desconectar después de animar
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 }); // Gatillar cuando al menos 20% del elemento es visible
        
        observer.observe(el);
    });
    
    // Animaciones para ecuaciones matemáticas
    const equations = document.querySelectorAll('.equation');
    equations.forEach(eq => {
        eq.classList.add('highlight-animation');
        
        // Quitar la animación después de un tiempo o al hacer clic
        setTimeout(() => {
            eq.classList.remove('highlight-animation');
        }, 5000);
        
        eq.addEventListener('click', function() {
            this.classList.remove('highlight-animation');
        });
    });
}

/**
 * Establece una conexión entre las secciones educativas y el simulador
 */
function connectWithSimulator() {
    const simulatorLinks = document.querySelectorAll('.simulator-link');
    
    simulatorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const config = JSON.parse(this.getAttribute('data-config') || '{}');
            const exampleType = this.getAttribute('data-example');
            
            // Almacenar la configuración en sessionStorage
            if (Object.keys(config).length > 0) {
                sessionStorage.setItem('dockingConfig', JSON.stringify(config));
            }
            
            // Redirigir al simulador, opcionalmente cargando un ejemplo
            if (exampleType) {
                window.location.href = `${window.location.origin}/?example=${exampleType}`;
            } else {
                window.location.href = window.location.origin;
            }
        });
    });
}
