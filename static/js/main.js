/**
 * main.js - Script principal para DayhoffDock
 * 
 * Maneja la lógica principal de la aplicación:
 * - Gestión del formulario
 * - Procesar solicitudes de docking
 * - Mostrar resultados
 * - Controlar la interfaz de usuario
 */

// Elementos del DOM
const form = document.getElementById('dockingForm');
const submitBtn = document.getElementById('submitBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const statusText = document.getElementById('statusText');
const resultsSection = document.getElementById('resultsSection');
const resultsBody = document.getElementById('resultsBody');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');
const downloadBtn = document.getElementById('downloadBtn');
const openVisualizationBtn = document.getElementById('openVisualizationBtn');

// Elementos de archivo
const receptorInput = document.getElementById('receptor');
const ligandInput = document.getElementById('ligand');
const configInput = document.getElementById('config');
const receptorName = document.getElementById('receptorName');
const ligandName = document.getElementById('ligandName');
const configName = document.getElementById('configName');

// Elementos de descarga
const downloadPdbqtBtn = document.getElementById('downloadPdbqt');
const downloadPdbBtn = document.getElementById('downloadPdb');
const downloadImageBtn = document.getElementById('downloadImage');

// Estado global
let currentPose = null;
let currentPoses = [];
let currentResults = null;

// Configurar manejadores para las entradas de archivos
function setupFileInputs() {
    receptorInput.addEventListener('change', () => {
        receptorName.textContent = receptorInput.files[0]?.name || 'No se ha seleccionado archivo';
    });

    ligandInput.addEventListener('change', () => {
        ligandName.textContent = ligandInput.files[0]?.name || 'No se ha seleccionado archivo';
    });

    configInput.addEventListener('change', () => {
        configName.textContent = configInput.files[0]?.name || 'No se ha seleccionado archivo';
    });
}

// Mostrar mensaje de error
function showError(message) {
    errorSection.classList.remove('hidden');
    errorText.textContent = message;
    setTimeout(() => {
        errorSection.classList.add('hidden');
    }, 5000);
}

// Limpiar resultados previos
function clearPreviousResults() {
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    progressSection.classList.add('hidden');
    progressFill.style.width = '0%';
    currentPoses = [];
    currentResults = null;
}

// Mostrar progreso
function showProgress() {
    progressSection.classList.remove('hidden');
    statusText.textContent = 'Iniciando proceso de docking...';
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
}

// Ocultar progreso
function hideProgress() {
    progressSection.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-play"></i> Iniciar Docking';
}

// Mostrar resultados
function displayResults(data) {
    resultsSection.classList.remove('hidden');
    
    // Guardar datos para uso posterior
    currentResults = data;
    currentPoses = data.poses;
    
    // Limpiar tabla
    resultsBody.innerHTML = '';
    
    // Llenar tabla con resultados
    data.results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${result.mode}</td>
            <td>${result.affinity.toFixed(2)}</td>
            <td>${result.rmsd_lower.toFixed(2)} - ${result.rmsd_upper.toFixed(2)}</td>
            <td>
                <button class="view-btn" data-index="${index}">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </td>
        `;
        row.querySelector('.view-btn').addEventListener('click', function() {
            viewPose(index);
        });
        resultsBody.appendChild(row);
    });
    
    // Mostrar mejor pose y TAMBIÉN CARGAR EL RECEPTOR
    if (data.poses && data.poses.length > 0) {
        currentPose = data.poses[0].content;
        
        // Guardar contenido del receptor si está disponible
        if (data.receptor_content) {
            window.Visualizer.currentReceptor = data.receptor_content;
        } else if (data.receptor_url) {
            // Alternativa: cargar desde URL si no tenemos el contenido
            fetch(data.receptor_url)
                .then(response => response.text())
                .then(text => {
                    window.Visualizer.currentReceptor = text;
                    // Re-visualizar para incluir el receptor
                    window.Visualizer.visualizeMolecule(currentPose);
                })
                .catch(error => {
                    console.warn('No se pudo cargar el receptor:', error);
                });
        }
        
        window.Visualizer.visualizeMolecule(currentPose);
    }
    

    
    // Configurar botón de vista detallada
    openVisualizationBtn.onclick = () => {
        if (currentPose) {
            window.Visualizer.openModal(currentPose);
        }
    };
}

// Ver una pose específica
function viewPose(index) {
    if (currentPoses && currentPoses[index]) {
        currentPose = currentPoses[index].content;
        window.Visualizer.visualizeMolecule(currentPose);
    }
}

// Descargar pose actual
function downloadCurrentPose(format) {
    if (!currentPose) {
        showError('No hay pose disponible para descargar');
        return;
    }
    
    if (format === 'pdb') {
        // Para PDB, necesitamos convertir de PDBQT a PDB
        fetch('/convert_to_pdb', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pdbqt_content: currentPose })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showError(data.error);
                return;
            }
            
            // Crear blob y descargar
            downloadBlob(data.pdb_content, `docking_result.pdb`);
        })
        .catch(error => {
            showError(`Error al convertir a PDB: ${error}`);
        });
    } else {
        // Para PDBQT, simplemente descargar
        downloadBlob(currentPose, `docking_result.${format}`);
    }
}

// Función auxiliar para descargar blobs
function downloadBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Limpiar
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

// Configurar manejadores de eventos para las descargas
function setupDownloadHandlers() {
    if (downloadPdbqtBtn) {
        downloadPdbqtBtn.addEventListener('click', () => downloadCurrentPose('pdbqt'));
    }
    
    if (downloadPdbBtn) {
        downloadPdbBtn.addEventListener('click', () => downloadCurrentPose('pdb'));
    }
    
    if (downloadImageBtn) {
        downloadImageBtn.addEventListener('click', () => window.Visualizer.downloadMoleculeImage());
    }
}

// Handler del formulario
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    clearPreviousResults();
    showProgress();
    
    const formData = new FormData(form);
    
    try {
        const response = await fetch('/dock', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // Actualizar progreso
        progressFill.style.width = '100%';
        statusText.textContent = 'Procesamiento completado';
        
        // Mostrar resultados
        setTimeout(() => {
            hideProgress();
            displayResults(data);
        }, 1000);
        
    } catch (error) {
        hideProgress();
        showError(error.message || 'Error en el procesamiento');
    }
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que el objeto Visualizer esté disponible
    if (!window.Visualizer) {
        console.error('Módulo de visualización no disponible');
        showError('Error: Módulo de visualización no disponible. Por favor, actualice la página.');
        return;
    }
    
    // Inicializar componentes
    setupFileInputs();
    setupDownloadHandlers();
});

// Estilos para los botones en la tabla
const style = document.createElement('style');
style.textContent = `
    .view-btn {
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
    }
    
    .view-btn:hover {
        background: #2980b9;
    }
`;
document.head.appendChild(style);