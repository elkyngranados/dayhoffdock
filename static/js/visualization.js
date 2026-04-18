/**
 * visualization.js - Módulo de visualización molecular para DayhoffDock
 *
 * Este archivo contiene las funciones relacionadas con la visualización
 * molecular utilizando NGL Viewer.
 * VERSIÓN MEJORADA: Muestra cadenas laterales del sitio de unión
 */

// Objeto Visualizer con todas las funcionalidades de visualización
const Visualizer = {
    // Visores
    mainViewer: null,
    modalViewer: null,
    interactionsViewer: null,

    // Estado
    currentPose: null,
    currentReceptor: null,
    currentViewMode: 'stick',
    viewersInitialized: false,
    loadedComponents: {
        main: { ligand: null, receptor: null },
        modal: { ligand: null, receptor: null },
        interactions: { ligand: null, receptor: null }
    },

    // Elementos DOM
    elements: {
        viewer: document.getElementById('viewer'),
        modalViewer: document.getElementById('modalViewer'),
        interactionsViewer: document.getElementById('interactionsViewer'),
        modal: document.getElementById('visualizationModal'),
        interactionsList: document.getElementById('interactionsList')
    },

    /**
     * Inicializa el visor principal
     */
    initMainViewer: function () {
        if (!this.elements.viewer) {
            console.error('Elemento viewer no encontrado');
            return false;
        }

        try {
            // Limpiar cualquier contenido previo
            while (this.elements.viewer.firstChild) {
                this.elements.viewer.removeChild(this.elements.viewer.firstChild);
            }

            // Crear nuevo visor
            this.mainViewer = new NGL.Stage(this.elements.viewer, { backgroundColor: "white" });

            if (!this.mainViewer) {
                console.error('No se pudo crear el visor NGL principal');
                return false;
            }

            // Configuración adicional
            this.mainViewer.setParameters({
                quality: "medium",
                antialias: true,
                impostor: true
            });

            return true;
        } catch (error) {
            console.error('Error inicializando visor principal:', error);
            return false;
        }
    },

    /**
     * Inicializa los visores del modal
     */
    initModalViewers: function () {
        console.log("Inicializando visores modales");

        if (!this.elements.modalViewer || !this.elements.interactionsViewer) {
            console.error('Elementos de visores del modal no encontrados');
            return false;
        }

        try {
            // Limpiar contenido previo de los visores
            while (this.elements.modalViewer.firstChild) {
                this.elements.modalViewer.removeChild(this.elements.modalViewer.firstChild);
            }

            while (this.elements.interactionsViewer.firstChild) {
                this.elements.interactionsViewer.removeChild(this.elements.interactionsViewer.firstChild);
            }

            // Crear nuevos visores con fondo blanco
            this.modalViewer = new NGL.Stage(this.elements.modalViewer, {
                backgroundColor: "white",
                tooltip: true
            });

            this.interactionsViewer = new NGL.Stage(this.elements.interactionsViewer, {
                backgroundColor: "white",
                tooltip: true
            });

            if (!this.modalViewer || !this.interactionsViewer) {
                console.error('No se pudieron crear los visores del modal');
                return false;
            }

            // Configuración común para ambos visores
            const viewers = [this.modalViewer, this.interactionsViewer];
            viewers.forEach(viewer => {
                viewer.setParameters({
                    quality: "medium",
                    antialias: true,
                    impostor: true
                });

                // Permitir controles de mouse y teclado
                viewer.mouseControls.add("scroll", NGL.MouseActions.ZOOM);
                viewer.mouseControls.add("drag", NGL.MouseActions.ROTATE);
            });

            console.log("Visores modales inicializados correctamente");
            this.viewersInitialized = true;
            return true;
        } catch (error) {
            console.error('Error inicializando visores del modal:', error);
            return false;
        }
    },

    /**
     * Crea un blob a partir de contenido PDBQT/PDB
     */
    createBlobFromContent: function (content) {
        return new Blob([content], { type: 'text/plain' });
    },

    /**
     * ELIMINADA: loadReceptorFile() - Ahora usamos receptor_content del response
     * El receptor ya viene en data.receptor_content desde el backend (docking.py:392)
     * y se guarda en Visualizer.currentReceptor desde main.js
     */

    /**
     * Visualiza una molécula en el visor principal
     */
    visualizeMolecule: async function (pdbqtContent) {
        if (!this.mainViewer) {
            if (!this.initMainViewer()) {
                showError('Error al inicializar el visor 3D');
                return;
            }
        }

        try {
            // Guardar el contenido actual del ligando
            this.currentPose = pdbqtContent;

            // Limpiar viewer
            this.mainViewer.removeAllComponents();

            // El receptor debe venir de main.js que lo obtiene del response
            if (!this.currentReceptor) {
                console.warn("No hay receptor disponible. Asegúrate de que el backend envíe receptor_content");
            }

            // Cargar ligando y receptor (si está disponible)
            const ligandComponent = await this.loadMolecule(
                this.mainViewer,
                pdbqtContent,
                'pdbqt',
                'main',
                'ligand'
            );

            let receptorComponent = null;
            if (this.currentReceptor) {
                // El receptor siempre viene en formato PDB limpio desde el backend
                const ext = 'pdb';
                receptorComponent = await this.loadMolecule(
                    this.mainViewer,
                    this.currentReceptor,
                    ext,
                    'main',
                    'receptor'
                );
            }

            // Centrar vista en el ligando
            if (ligandComponent) {
                ligandComponent.autoView(2);
            }

        } catch (error) {
            console.error('Error al visualizar molécula:', error);
            showError('Error al visualizar la molécula: ' + error.message);
        }
    },

    /**
     * Carga una molécula en un visor específico
     */
    loadMolecule: async function (viewer, content, extension, viewerType, moleculeType) {
        return new Promise((resolve, reject) => {
            const blob = this.createBlobFromContent(content);
            const blobUrl = URL.createObjectURL(blob);

            // Opciones de carga optimizadas
            const loadOptions = {
                ext: extension,
                firstModelOnly: true
            };

            viewer.loadFile(blobUrl, loadOptions).then(component => {
                // Guardar referencia al componente
                this.loadedComponents[viewerType][moleculeType] = component;

                // Aplicar representación según el tipo de molécula
                if (moleculeType === "ligand") {
                    // Ligando en modo stick LIMPIO - SIN HIDRÓGENOS
                    component.addRepresentation("licorice", {
                        quality: "high",
                        colorScheme: "element",
                        radius: 0.25,
                        multipleBond: "symmetric",
                        sele: "not hydrogen"  // CRÍTICO: Excluir hidrógenos
                    });
                } else if (moleculeType === "receptor") {
                    // Receptor: Cartoon para estructura general - SIN HIDRÓGENOS
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        smoothSheet: true,
                        radiusHelical: 1.0,
                        radiusSheet: 0.6,
                        opacity: 0.9,
                        sele: "protein and not hydrogen"  // Sin hidrógenos
                    });

                    // NUEVO: Cadenas laterales del sitio de unión - SIN HIDRÓGENOS
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15,
                        sele: "protein and sidechain and (within 5 of ligand) and not hydrogen",  // Sin hidrógenos
                        opacity: 0.8
                    });

                    // NO agregar etiquetas aquí - solo aparecerán al resaltar interacciones
                }

                // Liberar el URL del blob
                URL.revokeObjectURL(blobUrl);
                resolve(component);
            }).catch(err => {
                URL.revokeObjectURL(blobUrl);
                reject(err);
            });
        });
    },

    /**
     * Abre el modal con visualización detallada
     */
    openModal: async function (pdbqtContent) {
        console.log("Abriendo modal con visualización detallada");

        // Actualizar pose actual
        this.currentPose = pdbqtContent;

        // Mostrar modal primero para que los visores tengan dimensiones correctas
        this.elements.modal.classList.remove('hidden');
        this.elements.modal.classList.add('visible');

        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';

        // Inicializar visores si no están listos
        if (!this.modalViewer || !this.interactionsViewer) {
            console.log("Inicializando visores del modal...");
            this.initModalViewers();
        }

        // Verificar que tenemos el receptor (debe venir de main.js)
        if (!this.currentReceptor) {
            console.warn("No hay receptor disponible para el modal");
        }

        // Permitir que el DOM se actualice antes de renderizar
        setTimeout(() => {
            // Forzar redimensionamiento de los visores
            if (this.modalViewer) this.modalViewer.handleResize();
            if (this.interactionsViewer) this.interactionsViewer.handleResize();

            console.log("Renderizando molécula en el modal");

            // Renderizar solo en la pestaña activa (más simple y confiable)
            const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || '3d';
            if (activeTab === '3d') {
                this.renderMolecule(this.modalViewer, pdbqtContent, this.currentViewMode);
            } else {
                this.renderInteractions(this.interactionsViewer, pdbqtContent);
            }

            // Analizar y mostrar interacciones
            this.analyzeInteractions(pdbqtContent);
        }, 300);
    },

    /**
     * Cierra el modal de visualización
     */
    closeModal: function () {
        this.elements.modal.classList.remove('visible');

        // Limpiar cualquier resaltado activo
        this.clearInteractionHighlights();

        setTimeout(() => {
            this.elements.modal.classList.add('hidden');
            // Restaurar scroll del body
            document.body.style.overflow = '';
        }, 300);
    },

    /**
     * Renderiza una molécula en un visor específico
     */
    renderMolecule: async function (viewer, pdbqtContent, viewMode = 'stick') {
        if (!viewer) {
            console.error('Visor no inicializado');
            return;
        }

        console.log(`Renderizando molécula en modo: ${viewMode}`);

        try {
            // Limpiar viewer
            viewer.removeAllComponents();

            // Determinar el tipo de visor para guardar las referencias correctamente
            let viewerType = 'main';
            if (viewer === this.modalViewer) {
                viewerType = 'modal';
            } else if (viewer === this.interactionsViewer) {
                viewerType = 'interactions';
            }

            // Cargar el ligando usando loadMolecule para consistencia
            const ligandComponent = await this.loadMolecule(
                viewer,
                pdbqtContent,
                'pdbqt',
                viewerType,
                'ligand'
            );
            console.log("Ligando cargado correctamente");

            // Si tenemos el receptor, cargarlo también usando loadMolecule
            let receptorComponent = null;
            if (this.currentReceptor) {
                // El receptor siempre viene en formato PDB limpio desde el backend
                receptorComponent = await this.loadMolecule(
                    viewer,
                    this.currentReceptor,
                    'pdb',
                    viewerType,
                    'receptor'
                );
                console.log("Receptor cargado correctamente en modal");
            }

            // Ahora aplicar el modo de vista específico (cambiar representaciones)
            if (viewMode !== 'stick') {
                // Solo cambiar si no es el modo por defecto
                if (ligandComponent) {
                    this.applyViewMode(viewer, ligandComponent, viewMode, "ligand");
                }
                if (receptorComponent) {
                    this.applyViewMode(viewer, receptorComponent, viewMode, "receptor");
                }
            }

            // Si tenemos el ligando, enfocamos en él
            if (ligandComponent) {
                ligandComponent.autoView(2);
            }

        } catch (error) {
            console.error('Error al renderizar molécula:', error);
            if (viewer === this.mainViewer) {
                showError('Error al renderizar la molécula: ' + error.message);
            }
        }
    },

    /**
     * Cambia el modo de visualización
     */
    changeViewMode: function (mode) {
        console.log(`Cambiando modo de visualización a: ${mode}`);

        // Actualizar modo actual
        this.currentViewMode = mode;

        // Actualizar botones
        const viewButtons = document.querySelectorAll('.view-control-btn');
        viewButtons.forEach(btn => btn.classList.remove('active'));

        // Activar el botón correspondiente
        const buttonMap = {
            'stick': document.getElementById('stickView'),
            'sphere': document.getElementById('sphereView'),
            'surface': document.getElementById('surfaceView'),
            'cartoon': document.getElementById('cartoonView')
        };

        if (buttonMap[mode]) {
            buttonMap[mode].classList.add('active');
        }

        // Rerenderizar si hay un componente cargado
        if (this.modalViewer && this.currentPose) {
            console.log("Aplicando nuevo modo de visualización");
            this.renderMolecule(this.modalViewer, this.currentPose, this.currentViewMode);
        }
    },

    /**
     * Aplica un modo de visualización a un componente - VERSIÓN MEJORADA
     */
    applyViewMode: function (viewer, component, mode, componentType) {
        if (!viewer || !component) return;

        console.log(`Aplicando modo ${mode} a ${componentType}`);

        // Eliminar representaciones existentes
        component.removeAllRepresentations();

        // Aplicar representaciones según el tipo de componente y modo
        if (componentType === "ligand") {
            switch (mode) {
                case 'stick':
                    component.addRepresentation("licorice", {
                        quality: "high",
                        colorScheme: "element",
                        radius: 0.25,
                        multipleBond: "symmetric",
                        sele: "not hydrogen"  // Sin hidrógenos
                    });
                    break;
                case 'sphere':
                    component.addRepresentation("spacefill", {
                        quality: "high",
                        colorScheme: "element",
                        scale: 0.7,
                        sele: "not hydrogen"  // Sin hidrógenos
                    });
                    break;
                case 'surface':
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15,
                        sele: "not hydrogen"  // Sin hidrógenos
                    });
                    component.addRepresentation("surface", {
                        surfaceType: "ms",
                        colorScheme: "element",
                        opacity: 0.5,
                        sele: "not hydrogen"  // Sin hidrógenos
                    });
                    break;
                case 'cartoon':
                    // Para ligandos, siempre usar licorice sin hidrógenos
                    component.addRepresentation("licorice", {
                        quality: "high",
                        colorScheme: "element",
                        radius: 0.25,
                        multipleBond: "symmetric",
                        sele: "not hydrogen"  // Sin hidrógenos
                    });
                    break;
            }
        } else if (componentType === "receptor") {
            // *** RECEPTOR - CON CADENAS LATERALES DEL SITIO DE UNIÓN - SIN HIDRÓGENOS ***
            switch (mode) {
                case 'stick':
                    // Cartoon + cadenas laterales del sitio
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        smoothSheet: true,
                        radiusHelical: 1.0,
                        radiusSheet: 0.6,
                        opacity: 0.9,
                        sele: "protein and not hydrogen"  // Sin hidrógenos
                    });
                    // Cadenas laterales cercanas al ligando en licorice
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15,
                        sele: "protein and sidechain and (within 5 of ligand) and not hydrogen",  // Sin hidrógenos
                        opacity: 0.8
                    });
                    break;
                case 'sphere':
                    // Cartoon + esferas del sitio de unión
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        opacity: 0.8,
                        sele: "protein and not hydrogen"  // Sin hidrógenos
                    });
                    component.addRepresentation("spacefill", {
                        quality: "medium",
                        colorScheme: "element",
                        scale: 0.5,
                        sele: "protein and (within 5 of ligand) and not hydrogen",  // Sin hidrógenos
                        opacity: 0.7
                    });
                    break;
                case 'surface':
                    // Cartoon + superficie del sitio de unión
                    component.addRepresentation("cartoon", {
                        quality: "medium",
                        colorScheme: "chainname",
                        opacity: 0.7,
                        sele: "protein and not hydrogen"  // Sin hidrógenos
                    });
                    component.addRepresentation("surface", {
                        quality: "medium",
                        colorScheme: "hydrophobicity",
                        opacity: 0.4,
                        sele: "protein and (within 8 of ligand) and not hydrogen"  // Sin hidrógenos
                    });
                    // Cadenas laterales para ver detalles
                    component.addRepresentation("licorice", {
                        quality: "low",
                        colorScheme: "element",
                        radius: 0.1,
                        sele: "protein and sidechain and (within 5 of ligand) and not hydrogen",  // Sin hidrógenos
                        opacity: 0.6
                    });
                    break;
                case 'cartoon':
                    // Cartoon + cadenas laterales destacadas del sitio de unión
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        smoothSheet: true,
                        radiusHelical: 1.0,
                        radiusSheet: 0.6,
                        opacity: 0.9,
                        sele: "protein and not hydrogen"  // Sin hidrógenos
                    });
                    // Cadenas laterales del sitio de unión
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15,
                        sele: "protein and sidechain and (within 5 of ligand) and not hydrogen",  // Sin hidrógenos
                        opacity: 0.8
                    });
                    // NO agregar etiquetas aquí - solo aparecerán al resaltar
                    break;
            }
        }
    },

    /**
     * Renderiza interacciones en el visor de interacciones
     */
    renderInteractions: async function (viewer, pdbqtContent) {
        if (!viewer) {
            console.error('Visor de interacciones no inicializado');
            return;
        }

        try {
            // Limpiar viewer
            viewer.removeAllComponents();

            // Cargar ligando y receptor (si está disponible)
            const ligandComponent = await this.loadMolecule(
                viewer,
                pdbqtContent,
                'pdbqt',
                'interactions',
                'ligand'
            );

            let receptorComponent = null;
            if (this.currentReceptor) {
                // El receptor siempre viene en formato PDB limpio desde el backend
                const ext = 'pdb';
                receptorComponent = await this.loadMolecule(
                    viewer,
                    this.currentReceptor,
                    ext,
                    'interactions',
                    'receptor'
                );

                // Resaltar sitios potenciales de interacción (DESHABILITADO temporalmente)
                // if (receptorComponent && ligandComponent) {
                //     this.highlightInteractionSites(viewer, receptorComponent, ligandComponent);
                // }
            }

            // Centrar vista en el ligando
            if (ligandComponent) {
                ligandComponent.autoView(2);
            }

        } catch (error) {
            console.error('Error al renderizar interacciones:', error);
        }
    },

    /**
     * Resalta sitios potenciales de interacción
     */
    highlightInteraction: function (index) {
        console.log(`🎯 Resaltando interacción ${index}`);

        // Limpiar resaltados previos
        this.clearInteractionHighlights();

        // Obtener datos de la interacción desde el DOM - buscar específicamente .interaction-item
        const interactionItem = document.querySelector(`.interaction-item[data-index="${index}"]`);
        if (!interactionItem) {
            console.warn("No se encontró la interacción:", index);
            console.log("Elementos con data-index:", document.querySelectorAll(`[data-index="${index}"]`));
            return;
        }

        console.log("✅ Elemento de interacción encontrado:", interactionItem);

        // Extraer información de la interacción
        const interactionData = this.extractInteractionData(interactionItem);
        console.log("Datos de la interacción:", interactionData);

        // Resaltar en la lista
        this.highlightInteractionInList(index);

        // Resaltar en el visor 3D
        this.highlightInteractionIn3D(interactionData);

        // Mostrar información detallada
        this.showInteractionDetails(interactionData);
    },

    /**
     * Extrae datos de la interacción desde el elemento DOM
     */
    extractInteractionData: function (interactionElement) {
        console.log("🔍 Elemento de interacción:", interactionElement);
        console.log("HTML del elemento:", interactionElement.innerHTML);

        const typeElement = interactionElement.querySelector('.interaction-type');
        const residueElement = interactionElement.querySelector('.interaction-residue');
        const distanceElement = interactionElement.querySelector('.interaction-distance');
        const energyElement = interactionElement.querySelector('.interaction-energy');
        const atomsElement = interactionElement.querySelector('.interaction-atoms');

        console.log("Sub-elementos encontrados:", {
            typeElement,
            residueElement,
            distanceElement,
            energyElement,
            atomsElement
        });

        // Limpiar texto - eliminar emojis y espacios extras
        const cleanText = (text) => {
            if (!text) return '';
            // Eliminar emojis (cualquier carácter no ASCII)
            return text.replace(/[^\x00-\x7F]/g, '').trim();
        };

        const residueText = residueElement ? cleanText(residueElement.textContent) : '';
        const distanceText = distanceElement ? cleanText(distanceElement.textContent) : '';
        const energyText = energyElement ? cleanText(energyElement.textContent) : '';
        const atomsText = atomsElement ? cleanText(atomsElement.textContent) : '';

        return {
            type: typeElement ? typeElement.textContent.trim() : '',
            residue: residueText,
            distance: distanceText,
            energy: energyText,
            atoms: atomsText ? atomsText.split('↔').map(atom => atom.trim()).filter(a => a) : [],
            class: interactionElement.className.split(' ').find(cls =>
                ['h-bond', 'hydrophobic', 'salt-bridge', 'pi-stacking', 'halogen-bond', 'metal-coordination'].includes(cls)
            ) || 'other'
        };
    },

    /**
     * Resalta la interacción en la lista
     */
    highlightInteractionInList: function (index) {
        // Quitar highlight previo
        document.querySelectorAll('.interaction-item').forEach(item => {
            item.classList.remove('highlighted', 'active-interaction');
        });

        // Resaltar la interacción actual - selector específico
        const targetItem = document.querySelector(`.interaction-item[data-index="${index}"]`);
        if (targetItem) {
            targetItem.classList.add('highlighted', 'active-interaction');
            targetItem.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });

            // Efecto de pulso
            targetItem.style.animation = 'pulse-highlight 1s ease-in-out';
            setTimeout(() => {
                targetItem.style.animation = '';
            }, 1000);
        }
    },

    /**
     * Resalta la interacción en el visor 3D - VERSIÓN CORREGIDA
     */
    highlightInteractionIn3D: function (interactionData) {
        // El modal usa la clase 'visible', no 'active'
        if (!this.modalViewer || !document.getElementById('visualizationModal').classList.contains('visible')) {
            console.log("⚠️ Modal no abierto. Por favor abre la Vista Detallada primero.");
            alert("Por favor abre la Vista Detallada primero para ver el resaltado de interacciones.");
            return;
        }

        console.log("✅ Modal está abierto, procediendo a resaltar");
        // Resaltar directamente en el visor activo
        this.performHighlight3D(interactionData);
    },

    /**
     * Realiza el resaltado 3D (función auxiliar)
     */
    performHighlight3D: function (interactionData) {
        try {
            console.log("🌟 Resaltando en 3D:", interactionData);

            // Determinar qué visor usar según la pestaña activa
            const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || '3d';
            const viewer = activeTab === '3d' ? this.modalViewer : this.interactionsViewer;
            const viewerType = activeTab === '3d' ? 'modal' : 'interactions';

            if (!viewer) {
                console.warn("Visor no disponible");
                return;
            }

            console.log(`Resaltando en pestaña: ${activeTab}, usando visor: ${viewerType}`);

            // Limpiar resaltados previos de forma simple
            if (this.highlightRepresentations && this.highlightRepresentations.length > 0) {
                console.log("Limpiando resaltados anteriores...");
                this.clearInteractionHighlights();
            }

            // Buscar y resaltar el residuo en el visor activo
            this.highlightResidue(interactionData.residue, viewer, viewerType);

            // Buscar y resaltar átomos específicos (si están disponibles)
            if (interactionData.atoms && interactionData.atoms.length >= 2) {
                this.highlightAtoms(interactionData.atoms, viewer, viewerType);
            }

            // Enfocar la cámara en la región de interacción
            this.focusOnInteraction(interactionData, viewer, viewerType);

            // Mostrar línea de distancia si es posible
            this.showDistanceLine(interactionData, viewer, viewerType);

        } catch (error) {
            console.error("Error resaltando en 3D:", error);
        }
    },

    /**
     * Resalta un residuo específico en el visor - VERSIÓN MEJORADA
     */
    highlightResidue: function (residueInfo, viewer, viewerType) {
        // Si no se pasa visor, usar modalViewer por defecto
        viewer = viewer || this.modalViewer;
        viewerType = viewerType || 'modal';

        if (!viewer || !residueInfo) {
            console.warn("No se puede resaltar: visor o residuo no disponible");
            return;
        }

        try {
            // Extraer número del residuo (ej: "ASP25" -> "25", también soporta "ASP25A" con cadena)
            const residueMatch = residueInfo.match(/([A-Z]{3})(\d+)([A-Z])?/);
            if (!residueMatch) {
                console.warn(`Formato de residuo no válido: ${residueInfo}`);
                return;
            }

            const [, residueName, residueNumber, chain] = residueMatch;
            console.log(`🎯 Resaltando residuo: ${residueName} ${residueNumber}${chain || ''} en visor ${viewerType}`);

            // Buscar componentes cargados del receptor según el visor
            const receptorComponent = this.loadedComponents[viewerType]?.receptor;
            if (!receptorComponent) {
                console.error(`❌ Componente del receptor no encontrado en ${viewerType}`);
                return;
            }

            // Construir selector NGL adecuado
            let selector = `${residueNumber}`;
            if (chain) {
                selector += `:${chain}`;
            }

            console.log(`Usando selector NGL: ${selector}`);

            // *** RESALTADO COMPLETO: Cadenas laterales + superficie + etiqueta ***

            // 1. Cadenas laterales del residuo en licorice destacado
            const sidechainRepr = receptorComponent.addRepresentation("licorice", {
                sele: `${selector} and sidechain`,
                colorScheme: "element",
                radius: 0.3,
                opacity: 1.0
            });

            // 2. Backbone del residuo
            const backboneRepr = receptorComponent.addRepresentation("licorice", {
                sele: `${selector} and backbone`,
                color: "#ff6b6b",
                radius: 0.25,
                opacity: 1.0
            });

            // 3. Superficie destacada para el residuo completo (semi-transparente)
            const surfaceRepr = receptorComponent.addRepresentation("surface", {
                sele: `${selector}`,
                color: "#ff4757",
                opacity: 0.3,
                surfaceType: "vws"
            });

            // 4. Etiqueta en el carbono alfa
            const labelRepr = receptorComponent.addRepresentation("label", {
                sele: `${selector} and .CA`,
                labelType: "text",
                labelText: `${residueName}${residueNumber}`,
                fontWeight: "bold",
                fontSize: 18,
                color: "#ffffff",
                backgroundColor: "#e74c3c",
                backgroundMargin: 4,
                backgroundOpacity: 0.9,
                xOffset: 0.5,
                yOffset: 0.5,
                zOffset: 0
            });

            // 5. Bola en el carbono alfa para mejor visibilidad
            const caRepr = receptorComponent.addRepresentation("spacefill", {
                sele: `${selector} and .CA`,
                color: "#e74c3c",
                scale: 1.5,
                opacity: 0.8
            });

            // Guardar referencias para limpieza posterior junto con el componente
            if (!this.highlightRepresentations) {
                this.highlightRepresentations = [];
            }
            // Guardar tanto la representación como el componente para poder eliminarla correctamente
            this.highlightRepresentations.push(
                {repr: sidechainRepr, component: receptorComponent},
                {repr: backboneRepr, component: receptorComponent},
                {repr: surfaceRepr, component: receptorComponent},
                {repr: labelRepr, component: receptorComponent},
                {repr: caRepr, component: receptorComponent}
            );

            // Enfocar en el residuo con transición suave (incluyendo ligando cercano)
            setTimeout(() => {
                const ligandComponent = this.loadedComponents[viewerType].ligand;
                if (ligandComponent) {
                    // Enfocar en el residuo Y el ligando
                    receptorComponent.autoView(`${selector} or ligand`, 2000);
                } else {
                    receptorComponent.autoView(selector, 2000);
                }
            }, 300);

            console.log(`✅ Residuo ${residueName}${residueNumber} resaltado correctamente en ${viewerType}`);

        } catch (error) {
            console.error("Error resaltando residuo:", error);
            // Mostrar error al usuario
            this.showInteractionInfo({
                type: "Error",
                residue: residueInfo,
                distance: "N/A",
                energy: "Error al resaltar"
            });
        }
    },

    /**
     * Resalta átomos específicos - simplificado
     */
    highlightAtoms: function (atomsList, viewer, viewerType) {
        // Si no se pasa visor, usar modalViewer por defecto
        viewer = viewer || this.modalViewer;
        viewerType = viewerType || 'modal';

        if (!viewer || !atomsList) return;

        try {
            console.log("💚 Resaltando ligando en verde");

            const ligandComponent = this.loadedComponents[viewerType].ligand;
            if (ligandComponent) {
                // Resaltar ligando con superficie verde brillante
                const ligandSurface = ligandComponent.addRepresentation("surface", {
                    color: "#00ff88", // Verde neón brillante
                    opacity: 0.6,
                    surfaceType: "ms"
                });

                // Contorno destacado en verde más oscuro
                const ligandOutline = ligandComponent.addRepresentation("licorice", {
                    color: "#00cc66", // Verde más oscuro para contraste
                    radius: 0.35,
                    opacity: 1.0
                });

                // Bolas en átomos clave para mayor visibilidad
                const ligandSpheres = ligandComponent.addRepresentation("ball+stick", {
                    color: "#00ff88",
                    radius: 0.2,
                    opacity: 0.8
                });

                if (!this.highlightRepresentations) {
                    this.highlightRepresentations = [];
                }
                // Guardar junto con el componente
                this.highlightRepresentations.push(
                    {repr: ligandSurface, component: ligandComponent},
                    {repr: ligandOutline, component: ligandComponent},
                    {repr: ligandSpheres, component: ligandComponent}
                );
            }

        } catch (error) {
            console.error("Error resaltando átomos:", error);
        }
    },

    /**
     * Enfoca la cámara en la región de interacción
     */
    focusOnInteraction: function (interactionData, viewer, viewerType) {
        // Si no se pasa visor, usar modalViewer por defecto
        viewer = viewer || this.modalViewer;
        viewerType = viewerType || 'modal';

        if (!viewer) return;

        try {
            // Si tenemos información del residuo, enfocar ahí
            if (interactionData.residue) {
                const residueMatch = interactionData.residue.match(/\d+/);
                if (residueMatch) {
                    const residueNumber = residueMatch[0];
                    const receptorComponent = this.loadedComponents[viewerType].receptor;
                    const ligandComponent = this.loadedComponents[viewerType].ligand;

                    if (receptorComponent && ligandComponent) {
                        // Crear una selección que incluya el residuo y el ligando
                        const combinedSelection = `${residueNumber} or ligand`;
                        receptorComponent.autoView(combinedSelection, 1500); // 1.5 segundos de transición
                        return;
                    }
                }
            }

            // Fallback: enfocar en el ligando
            const ligandComponent = this.loadedComponents[viewerType].ligand;
            if (ligandComponent) {
                ligandComponent.autoView(1000);
            }

        } catch (error) {
            console.error("Error enfocando interacción:", error);
        }
    },

    /**
     * Muestra una línea de distancia entre átomos - IMPLEMENTACIÓN COMPLETA
     */
    showDistanceLine: function (interactionData, viewer, viewerType) {
        // Si no se pasa visor, usar modalViewer por defecto
        viewer = viewer || this.modalViewer;
        viewerType = viewerType || 'modal';

        if (!viewer || !interactionData.distance) return;

        try {
            console.log("📏 Mostrando línea de distancia:", interactionData.distance);

            const receptorComponent = this.loadedComponents[viewerType].receptor;
            const ligandComponent = this.loadedComponents[viewerType].ligand;

            if (!receptorComponent || !ligandComponent) {
                console.warn("Componentes no disponibles para mostrar línea");
                return;
            }

            // Intentar extraer posiciones de los átomos
            const residueMatch = interactionData.residue.match(/([A-Z]{3})(\d+)/);
            if (!residueMatch) return;

            const [, residueName, residueNumber] = residueMatch;

            // Crear shape para la línea de distancia
            const shape = new NGL.Shape('distance-line');

            // Obtener estructura del receptor y ligando
            const receptorStructure = receptorComponent.structure;
            const ligandStructure = ligandComponent.structure;

            // Encontrar átomo del receptor (carbono alfa del residuo)
            const receptorAtomSet = receptorStructure.getAtomSetWithinSelection(
                new NGL.Selection(`${residueNumber} and .CA`),
                1
            );

            // Encontrar átomo más cercano del ligando
            let receptorPos = null;
            let ligandPos = null;

            // Obtener posición del carbono alfa del receptor
            receptorAtomSet.forEach(atomIndex => {
                const atom = receptorStructure.getAtomProxy(atomIndex);
                receptorPos = atom.positionToVector3();
            });

            if (!receptorPos) {
                console.warn("No se pudo obtener posición del residuo");
                return;
            }

            // Encontrar átomo más cercano del ligando
            let minDistance = Infinity;
            ligandStructure.eachAtom(atom => {
                const atomPos = atom.positionToVector3();
                const dist = receptorPos.distanceTo(atomPos);
                if (dist < minDistance) {
                    minDistance = dist;
                    ligandPos = atomPos.clone();
                }
            });

            if (!ligandPos) {
                console.warn("No se pudo obtener posición del ligando");
                return;
            }

            // Determinar color según tipo de interacción
            const colorMap = {
                "Hydrogen Bond": [0.3, 0.6, 1.0],      // Azul
                "Hydrophobic Interaction": [0.8, 0.8, 0.2], // Amarillo
                "Salt Bridge": [1.0, 0.3, 0.3],        // Rojo
                "Pi-Stacking": [0.6, 0.3, 0.8],        // Púrpura
                "Halogen Bond": [0.3, 0.8, 0.6],       // Verde azulado
                "Metal Coordination": [0.9, 0.5, 0.1], // Naranja
                "Pi-Cation": [0.7, 0.4, 0.9]           // Violeta
            };

            const color = colorMap[interactionData.type] || [0.5, 0.5, 0.5];

            // Dibujar cilindro (línea) entre las posiciones
            shape.addCylinder(
                [receptorPos.x, receptorPos.y, receptorPos.z],
                [ligandPos.x, ligandPos.y, ligandPos.z],
                color,
                0.05  // Radio del cilindro
            );

            // Dibujar esferas en los extremos
            shape.addSphere(
                [receptorPos.x, receptorPos.y, receptorPos.z],
                color,
                0.15
            );
            shape.addSphere(
                [ligandPos.x, ligandPos.y, ligandPos.z],
                color,
                0.15
            );

            // Agregar el shape al visor correcto
            const shapeComp = viewer.addComponentFromObject(shape);
            shapeComp.addRepresentation('buffer');

            // Guardar referencia para limpieza
            if (!this.distanceShapes) {
                this.distanceShapes = [];
            }
            this.distanceShapes.push(shapeComp);

            // Agregar etiqueta con la distancia en el punto medio
            const midPoint = {
                x: (receptorPos.x + ligandPos.x) / 2,
                y: (receptorPos.y + ligandPos.y) / 2,
                z: (receptorPos.z + ligandPos.z) / 2
            };

            const labelShape = new NGL.Shape('distance-label');
            labelShape.addLabel(
                [midPoint.x, midPoint.y, midPoint.z],
                color,
                1.2,
                interactionData.distance
            );

            const labelComp = viewer.addComponentFromObject(labelShape);
            labelComp.addRepresentation('buffer');
            this.distanceShapes.push(labelComp);

            console.log(`✅ Línea de distancia dibujada: ${interactionData.distance}`);

            // Mostrar también en panel de información
            this.showInteractionInfo(interactionData);

        } catch (error) {
            console.error("Error mostrando línea de distancia:", error);
            // Fallback: solo mostrar en panel de información
            this.showInteractionInfo(interactionData);
        }
    },

    /**
     * Muestra información de la interacción en el visor
     */
    showInteractionInfo: function (interactionData) {
        // Crear o actualizar panel de información
        let infoPanel = document.querySelector('.interaction-info-panel');
        if (!infoPanel) {
            infoPanel = document.createElement('div');
            infoPanel.className = 'interaction-info-panel';
            const modalViewer = document.getElementById('modalViewer');
            modalViewer.appendChild(infoPanel);
        }

        const typeIcon = this.getInteractionIcon(interactionData.type);

        infoPanel.innerHTML = `
        <div class="interaction-info-content">
            <i class="${typeIcon}"></i>
            <div class="interaction-info-text">
                <strong>${interactionData.type}</strong>
                <div class="interaction-info-details">
                    ${interactionData.residue} • ${interactionData.distance} • ${interactionData.energy}
                </div>
            </div>
            <button onclick="window.Visualizer.clearInteractionHighlights()" class="close-info-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    },

    /**
     * Muestra detalles adicionales de la interacción
     */
    showInteractionDetails: function (interactionData) {
        console.log("📋 Mostrando detalles de la interacción");

        // Mostrar en consola para debug
        console.table({
            "Tipo": interactionData.type,
            "Residuo": interactionData.residue,
            "Distancia": interactionData.distance,
            "Energía": interactionData.energy,
            "Átomos": interactionData.atoms.join(" ↔ ")
        });

        // Actualizar título de la sección de visualización
        const sectionTitle = document.querySelector('#view3d-content .section-title.secondary');
        if (sectionTitle) {
            const originalHTML = sectionTitle.innerHTML;
            sectionTitle.innerHTML = `<i class="fas fa-cube"></i> Visualización 3D - ${interactionData.type}`;

            // Restaurar título original después de 5 segundos
            setTimeout(() => {
                sectionTitle.innerHTML = originalHTML;
            }, 5000);
        }
    },

    /**
     * Limpia todos los resaltados de interacciones
     */
    clearInteractionHighlights: function () {
        console.log("🧹 Limpiando resaltados de interacciones");

        try {
            // Limpiar representaciones de resaltado usando removeRepresentation
            if (this.highlightRepresentations) {
                this.highlightRepresentations.forEach(item => {
                    try {
                        if (item && item.component && item.repr) {
                            // Usar removeRepresentation del componente - método más seguro
                            item.component.removeRepresentation(item.repr);
                        }
                    } catch (e) {
                        console.warn("Error eliminando representación:", e);
                    }
                });
                this.highlightRepresentations = [];
            }

            // Limpiar líneas de distancia (shapes) - intentar en ambos visores
            if (this.distanceShapes) {
                this.distanceShapes.forEach(shape => {
                    try {
                        // Intentar remover de ambos visores
                        if (shape) {
                            if (this.modalViewer) {
                                try {
                                    this.modalViewer.removeComponent(shape);
                                } catch (e) {
                                    // Shape no está en este visor, continuar
                                }
                            }
                            if (this.interactionsViewer) {
                                try {
                                    this.interactionsViewer.removeComponent(shape);
                                } catch (e) {
                                    // Shape no está en este visor, continuar
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("Error eliminando shape de distancia:", e);
                    }
                });
                this.distanceShapes = [];
            }

            // Limpiar resaltados en la lista
            document.querySelectorAll('.interaction-item').forEach(item => {
                item.classList.remove('highlighted', 'active-interaction');
                item.style.transform = '';
                item.style.boxShadow = '';
            });

            // Limpiar panel de información
            const infoPanel = document.querySelector('.interaction-info-panel');
            if (infoPanel) {
                infoPanel.remove();
            }

            // NO restaurar vista automáticamente - dejar la cámara donde está
            // Esto previene el parpadeo y permite al usuario mantener su vista actual

        } catch (error) {
            console.error("Error limpiando resaltados:", error);
        }
    },

    /**
     * Inicialización para agregar listeners de eventos
     */
    setupInteractionHighlighting: function () {
        // Limpiar resaltados al cambiar de modo de vista
        const viewButtons = document.querySelectorAll('.view-control-btn');
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Pequeño delay para que se complete el cambio de vista
                setTimeout(() => {
                    this.clearInteractionHighlights();
                }, 500);
            });
        });

        // Limpiar al cerrar modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.clearInteractionHighlights();
            });
        }

        // Agregar tecla de escape para limpiar highlights
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.classList.contains('visible')) {
                this.clearInteractionHighlights();
            }
        });
    },

    /**
     * Añade etiquetas a residuos clave - SIMPLIFICADO
     */
    addResidueLabels: function (receptorComponent) {
        try {
            // Solo etiquetas, sin representaciones adicionales
            const labelRepr = receptorComponent.addRepresentation("label", {
                sele: "protein and (ARG, ASP, LYS, GLU, HIS, TYR, SER, THR) and (within 5 of ligand) and .CA",
                labelType: "text",
                labelText: "%[resname]%[resno]",
                fontWeight: "bold",
                fontSize: 12,
                color: "#3498db",
                xOffset: 1,
                yOffset: 0,
                zOffset: 0
            });

        } catch (error) {
            console.warn('Error al añadir etiquetas:', error);
        }
    },

    /**
     * Analiza y muestra interacciones
     */
    analyzeInteractions: function (pdbqtContent) {
        console.log("=== INICIANDO ANÁLISIS DE INTERACCIONES ===");

        // Limpiar interacciones previas
        this.elements.interactionsList.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Analizando interacciones...</p>';

        // Verificar datos disponibles
        console.log("Datos disponibles para análisis:");
        console.log("- PDBQT Content:", pdbqtContent ? `${pdbqtContent.length} caracteres` : "NO DISPONIBLE");
        console.log("- Receptor Content:", this.currentReceptor ? `${this.currentReceptor.length} caracteres` : "NO DISPONIBLE");

        // Verificar que tenemos receptor (debe venir del response inicial)
        if (!this.currentReceptor) {
            console.error("No hay contenido del receptor disponible");
            this.showInteractionsError("El receptor no está disponible. Esto puede deberse a un error en el proceso de docking.");
            return;
        }

        // Preparar datos para el análisis
        const requestData = {
            pdbqt_content: pdbqtContent,
            receptor_content: this.currentReceptor
        };

        console.log("Enviando solicitud de análisis al servidor...");

        // Solicitar análisis al servidor
        fetch('/analyze_interactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        })
            .then(response => {
                console.log("Respuesta del servidor recibida:", response.status);

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                return response.json();
            })
            .then(data => {
                console.log("Datos de interacciones recibidos:", data);

                if (data.error) {
                    console.error('Error en el análisis de interacciones:', data.error);
                    this.showInteractionsError(data.error);
                    return;
                }

                // Mostrar interacciones
                const interactions = data.interactions || [];
                console.log(`Procesando ${interactions.length} interacciones`);

                if (interactions.length === 0) {
                    this.showNoInteractionsFound();
                } else {
                    this.displayInteractions(interactions);
                }
            })
            .catch(error => {
                console.error('Error al analizar interacciones:', error);
                this.showInteractionsError(`Error de conexión: ${error.message}`);
            });
    },

    /**
     * Muestra error en la sección de interacciones
     */
    showInteractionsError: function (errorMessage) {
        this.elements.interactionsList.innerHTML = `
        <div class="interactions-error">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Error en el Análisis</h4>
            <p>${errorMessage}</p>
            <button onclick="window.Visualizer.retryInteractionsAnalysis()" class="retry-btn">
                <i class="fas fa-redo"></i> Reintentar
            </button>
        </div>
    `;
    },

    /**
     * Muestra mensaje cuando no se encuentran interacciones
     */
    showNoInteractionsFound: function () {
        this.elements.interactionsList.innerHTML = `
        <div class="no-interactions">
            <i class="fas fa-search"></i>
            <h4>Sin Interacciones Detectadas</h4>
            <p>No se detectaron interacciones significativas entre el ligando y el receptor.</p>
            <p><small>Esto puede deberse a:</small></p>
            <ul>
                <li>Distancia excesiva entre moléculas</li>
                <li>Orientación no favorable</li>
                <li>Limitaciones del método de análisis</li>
            </ul>
            <button onclick="window.Visualizer.retryInteractionsAnalysis()" class="retry-btn">
                <i class="fas fa-redo"></i> Reintentar Análisis
            </button>
        </div>
    `;
    },

    /**
     * Muestra las interacciones detectadas
     */
    displayInteractions: function (interactions) {
        console.log("Mostrando interacciones en la interfaz");

        // Limpiar contenedor
        this.elements.interactionsList.innerHTML = '';

        // Crear header
        const header = document.createElement('div');
        header.className = 'interactions-header';
        header.innerHTML = `
        <h4><i class="fas fa-link"></i> ${interactions.length} Interacción(es) Detectada(s)</h4>
        <button onclick="window.Visualizer.exportInteractions()" class="export-btn">
            <i class="fas fa-download"></i> Exportar
        </button>
    `;
        this.elements.interactionsList.appendChild(header);

        // Crear lista de interacciones
        interactions.forEach((interaction, index) => {
            const interactionEl = document.createElement('div');
            interactionEl.className = `interaction-item ${interaction.class || 'other'} clickable-interaction`;
            interactionEl.setAttribute('data-index', index);

            // Crear icono según el tipo
            const iconClass = this.getInteractionIcon(interaction.type);

            interactionEl.innerHTML = `
            <div class="interaction-header-item">
                <i class="${iconClass}"></i>
                <span class="interaction-type">${interaction.type}</span>
            </div>
            <div class="interaction-details">
                <div class="interaction-residue">
                    🧬 ${interaction.residue}
                </div>
                <div class="interaction-distance">
                    📏 ${interaction.distance}
                </div>
                <div class="interaction-energy">
                    ⚡ ${interaction.energy}
                </div>
                ${interaction.atoms ? `
                <div class="interaction-atoms">
                    ⚛️ ${interaction.atoms.join(' ↔ ')}
                </div>
                ` : ''}
            </div>
            <div class="interaction-actions">
                <button class="highlight-btn" onclick="window.Visualizer.highlightInteraction(${index})" title="Resaltar en vista 3D">
                    <i class="fas fa-search-plus"></i> Resaltar
                </button>
            </div>
        `;

            // Agregar event listener para click en toda la interacción
            interactionEl.addEventListener('click', (e) => {
                // Prevenir propagación si se clickea el botón
                if (e.target.closest('.highlight-btn')) {
                    return;
                }
                this.highlightInteraction(index);
            });

            // Agregar efecto hover
            interactionEl.addEventListener('mouseenter', () => {
                interactionEl.style.transform = 'translateX(4px)';
                interactionEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });

            interactionEl.addEventListener('mouseleave', () => {
                if (!interactionEl.classList.contains('highlighted')) {
                    interactionEl.style.transform = '';
                    interactionEl.style.boxShadow = '';
                }
            });

            this.elements.interactionsList.appendChild(interactionEl);
        });

        // Agregar estadísticas
        this.addInteractionStatistics(interactions);

        // Inicializar el setup de highlighting
        this.setupInteractionHighlighting();
    },

    /**
     * Obtiene el icono apropiado para cada tipo de interacción
     */
    getInteractionIcon: function (interactionType) {
        const iconMap = {
            "Hydrogen Bond": "fas fa-link",
            "Hydrophobic Interaction": "fas fa-oil-can",
            "Salt Bridge": "fas fa-bolt",
            "Pi-Stacking": "fas fa-layer-group",
            "Halogen Bond": "fas fa-atom",
            "Metal Coordination": "fas fa-magnet"
        };
        return iconMap[interactionType] || "fas fa-circle";
    },

    /**
     * Agrega estadísticas de las interacciones
     */
    addInteractionStatistics: function (interactions) {
        // Contar tipos de interacciones
        const stats = {};
        interactions.forEach(interaction => {
            const type = interaction.type;
            stats[type] = (stats[type] || 0) + 1;
        });

        const statsEl = document.createElement('div');
        statsEl.className = 'interaction-statistics';
        statsEl.innerHTML = `
        <h5><i class="fas fa-chart-pie"></i> Resumen de Interacciones</h5>
        <div class="stats-grid">
            ${Object.entries(stats).map(([type, count]) => `
                <div class="stat-item">
                    <i class="${this.getInteractionIcon(type)}"></i>
                    <span class="stat-label">${type}</span>
                    <span class="stat-count">${count}</span>
                </div>
            `).join('')}
        </div>
    `;

        this.elements.interactionsList.appendChild(statsEl);
    },

    /**
     * Reintenta el análisis de interacciones
     */
    retryInteractionsAnalysis: function () {
        if (this.currentPose) {
            console.log("Reintentando análisis de interacciones...");
            this.analyzeInteractions(this.currentPose);
        } else {
            this.showInteractionsError("No hay pose disponible para analizar");
        }
    },

    /**
     * Exporta las interacciones a un archivo
     */
    exportInteractions: function () {
        // Obtener las interacciones actuales del DOM
        const interactionItems = document.querySelectorAll('.interaction-item');
        const interactions = [];

        interactionItems.forEach(item => {
            const type = item.querySelector('.interaction-type').textContent;
            const residue = item.querySelector('.interaction-residue').textContent.replace('🧬 ', '');
            const distance = item.querySelector('.interaction-distance').textContent.replace('📏 ', '');
            const energy = item.querySelector('.interaction-energy').textContent.replace('⚡ ', '');

            interactions.push({ type, residue, distance, energy });
        });

        // Crear contenido CSV
        const csvContent = [
            'Tipo,Residuo,Distancia,Energía',
            ...interactions.map(i => `"${i.type}","${i.residue}","${i.distance}","${i.energy}"`)
        ].join('\n');

        // Descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interacciones_docking.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Descarga imagen de la molécula
     */
    downloadMoleculeImage: function () {
        // Obtener visor actual según pestaña activa
        const activeTab = document.querySelector('.tab-btn.active')?.getAttribute('data-tab') || '3d';
        const viewer = activeTab === '3d' ? this.modalViewer : this.interactionsViewer;

        if (!viewer) {
            showError('El visor 3D no está disponible');
            return;
        }

        try {
            // Capturar imagen
            viewer.makeImage({
                factor: 4,
                antialias: true,
                trim: false,
                transparent: false
            }).then(blob => {
                if (!blob) {
                    showError('No se pudo generar la imagen');
                    return;
                }

                // Crear URL para la descarga
                const url = URL.createObjectURL(blob);

                // Crear enlace de descarga
                const a = document.createElement('a');
                a.href = url;
                a.download = 'docking_visualization.png';
                document.body.appendChild(a);
                a.click();

                // Limpiar
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            }).catch(error => {
                console.error('Error al capturar imagen:', error);
                showError('Error al generar la imagen');
            });
        } catch (error) {
            console.error('Error al descargar imagen:', error);
            showError('Error al generar la imagen: ' + error.message);
        }
    },

    /**
     * Maneja eventos de redimensionamiento de la ventana
     */
    handleResize: function () {
        // Actualizar tamaño de los visores
        if (this.mainViewer) this.mainViewer.handleResize();
        if (this.modalViewer) this.modalViewer.handleResize();
        if (this.interactionsViewer) this.interactionsViewer.handleResize();
    },

    /**
     * Comprueba si NGL Viewer está disponible
     */
    checkNGLSupport: function () {
        if (typeof NGL === 'undefined') {
            console.error('NGL Viewer no está cargado correctamente');
            showError('Error: La biblioteca de visualización 3D no está disponible. Por favor, actualice la página o contacte al administrador.');
            return false;
        }
        return true;
    },

    /**
     * Inicializa los eventos del módulo de visualización
     */
    setupEvents: function () {
        // Añadir handler para redimensionar los visores
        window.addEventListener('resize', () => this.handleResize());

        // Eventos para los botones de cambio de vista
        const viewModes = ['stick', 'sphere', 'surface', 'cartoon'];
        viewModes.forEach(mode => {
            const btn = document.getElementById(`${mode}View`);
            if (btn) {
                btn.addEventListener('click', () => this.changeViewMode(mode));
            }
        });

        // Evento para cerrar el modal
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }

        // Tecla ESC para cerrar modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.modal.classList.contains('visible')) {
                this.closeModal();
            }
        });

        // Evitar que clicks en el content del modal lo cierren
        this.elements.modal.addEventListener('click', (e) => {
            if (e.target === this.elements.modal) {
                this.closeModal();
            }
        });

        // Eventos de pestañas del modal
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase activa de todas las pestañas
                tabBtns.forEach(b => b.classList.remove('active'));
                const tabContents = document.querySelectorAll('.tab-content');
                tabContents.forEach(c => c.classList.remove('active'));

                // Añadir clase activa a la pestaña clickeada
                btn.classList.add('active');
                const tabId = btn.getAttribute('data-tab');
                const contentElement = document.getElementById(`${tabId}-content`);

                if (contentElement) {
                    contentElement.classList.add('active');

                    // Crear un pequeño retraso para permitir que la pestaña sea visible
                    setTimeout(() => {
                        // Renderizar cada vez que cambias de pestaña (simple pero funcional)
                        if (tabId === '3d' && this.modalViewer && this.currentPose) {
                            console.log("Cambiando a pestaña 3D, renderizando");
                            this.modalViewer.handleResize();
                            this.renderMolecule(this.modalViewer, this.currentPose, this.currentViewMode);
                        } else if (tabId === 'interactions' && this.interactionsViewer && this.currentPose) {
                            console.log("Cambiando a pestaña Interacciones, renderizando");
                            this.interactionsViewer.handleResize();
                            this.renderInteractions(this.interactionsViewer, this.currentPose);
                        }
                    }, 100);
                }
            });
        });
    },

    /**
     * Inicializa el módulo de visualización
     */
    init: function () {
        if (!this.checkNGLSupport()) {
            return false;
        }

        // Inicializar eventos
        this.setupEvents();

        return true;
    }
};

// Inicializar módulo cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', () => {
    Visualizer.init();
});

// Exportar el objeto Visualizer para uso externo
window.Visualizer = Visualizer;