/**
 * visualization.js - Módulo de visualización molecular para DayhoffDock
 * 
 * Este archivo contiene las funciones relacionadas con la visualización
 * molecular utilizando NGL Viewer.
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
     * Carga el archivo del receptor desde la carpeta temporal
     */
    loadReceptorFile: async function () {
        try {
            // Intentamos cargar el receptor.pdbqt desde la carpeta temporal
            const response = await fetch('/uploads/receptor.pdbqt');
            if (response.ok) {
                return await response.text();
            }

            // Si no encontramos el receptor en formato pdbqt, intentamos con pdb
            const response2 = await fetch('/uploads/receptor.pdb');
            if (response2.ok) {
                return await response2.text();
            }

            console.warn('No se pudo cargar el archivo del receptor');
            return null;
        } catch (error) {
            console.error('Error al cargar el receptor:', error);
            return null;
        }
    },

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

            // Intentar cargar el receptor si no lo tenemos ya
            if (!this.currentReceptor) {
                console.log("Intentando cargar el receptor desde la carpeta temporal...");
                this.currentReceptor = await this.loadReceptorFile();
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
                const ext = this.currentReceptor.includes('PDBQT') ? 'pdbqt' : 'pdb';
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

            viewer.loadFile(blobUrl, { ext: extension }).then(component => {
                // Guardar referencia al componente
                this.loadedComponents[viewerType][moleculeType] = component;

                // Aplicar representación LIMPIA según el tipo de molécula
                if (moleculeType === "ligand") {
                    // Ligando siempre en modo stick limpio
                    component.addRepresentation("licorice", {
                        quality: "high",
                        colorScheme: "element",
                        radius: 0.25,
                        multipleBond: "symmetric"
                    });
                } else if (moleculeType === "receptor") {
                    // Receptor en modo cartoon LIMPIO por defecto
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        smoothSheet: true,
                        radiusHelical: 1.0,
                        radiusSheet: 0.6,
                        opacity: 0.9,
                        sele: "protein"
                    });

                    // Solo cadenas laterales cercanas - EVITAR backbone
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.12,
                        sele: "(protein and sidechain and not backbone and within 4 of ligand and not hydrogen and not (resname ACE or NME)) and not (resno < 5 or resno > 500)",
                        opacity: 0.8
                    });
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

        // Si aún no tenemos el receptor, intentamos cargarlo
        if (!this.currentReceptor) {
            console.log("Cargando receptor para el modal...");
            this.currentReceptor = await this.loadReceptorFile();
        }

        // Permitir que el DOM se actualice antes de renderizar
        setTimeout(() => {
            // Forzar redimensionamiento de los visores
            if (this.modalViewer) this.modalViewer.handleResize();
            if (this.interactionsViewer) this.interactionsViewer.handleResize();

            console.log("Renderizando molécula en el modal");

            // Renderizar en la pestaña activa
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

            // Crear blob con el contenido PDBQT para el ligando
            const blob = this.createBlobFromContent(pdbqtContent);
            const blobUrl = URL.createObjectURL(blob);

            // Cargar el ligando
            let ligandComponent = null;
            try {
                ligandComponent = await viewer.loadFile(blobUrl, { ext: "pdbqt" });
                console.log("Ligando cargado correctamente");

                // Guardar referencia al componente
                if (viewer === this.modalViewer) {
                    this.loadedComponents.modal.ligand = ligandComponent;
                } else if (viewer === this.interactionsViewer) {
                    this.loadedComponents.interactions.ligand = ligandComponent;
                } else if (viewer === this.mainViewer) {
                    this.loadedComponents.main.ligand = ligandComponent;
                }

                // Aplicar estilo según modo de vista
                this.applyViewMode(viewer, ligandComponent, viewMode, "ligand");
            } finally {
                // Liberar el URL del blob
                URL.revokeObjectURL(blobUrl);
            }

            // Si tenemos el receptor, cargarlo también
            if (this.currentReceptor) {
                // Crear blob para el receptor
                const receptorBlob = this.createBlobFromContent(this.currentReceptor);
                const receptorUrl = URL.createObjectURL(receptorBlob);

                // Determinar la extensión del archivo por las primeras líneas
                const ext = this.currentReceptor.includes('PDBQT') ? 'pdbqt' : 'pdb';

                try {
                    const receptorComponent = await viewer.loadFile(receptorUrl, { ext: ext });
                    console.log("Receptor cargado correctamente");

                    // Guardar referencia al componente
                    if (viewer === this.modalViewer) {
                        this.loadedComponents.modal.receptor = receptorComponent;
                    } else if (viewer === this.interactionsViewer) {
                        this.loadedComponents.interactions.receptor = receptorComponent;
                    } else if (viewer === this.mainViewer) {
                        this.loadedComponents.main.receptor = receptorComponent;
                    }

                    // Aplicar estilo según modo de vista
                    this.applyViewMode(viewer, receptorComponent, viewMode, "receptor");
                } finally {
                    // Liberar el URL del blob
                    URL.revokeObjectURL(receptorUrl);
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
     * Aplica un modo de visualización a un componente
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
                        multipleBond: "symmetric"
                    });
                    break;
                case 'sphere':
                    component.addRepresentation("spacefill", {
                        quality: "high",
                        colorScheme: "element",
                        scale: 0.7
                    });
                    break;
                case 'surface':
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15
                    });
                    component.addRepresentation("surface", {
                        surfaceType: "ms",
                        colorScheme: "element",
                        opacity: 0.5
                    });
                    break;
                case 'cartoon':
                    // Para ligandos, siempre usar licorice
                    component.addRepresentation("licorice", {
                        quality: "high",
                        colorScheme: "element",
                        radius: 0.25,
                        multipleBond: "symmetric"
                    });
                    break;
            }
        } else if (componentType === "receptor") {
            switch (mode) {
                case 'stick':
                    // Solo sticks para toda la proteína - SIN cartoon
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.15,
                        sele: "protein"
                    });
                    break;
                case 'sphere':
                    // Solo esferas para átomos cercanos + cartoon para el resto
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        opacity: 0.8,
                        sele: "(protein and sidechain and not backbone and within 4 of ligand and not hydrogen and not (resname ACE or NME)) and not (resno < 5 or resno > 500)",
                    });
                    component.addRepresentation("spacefill", {
                        quality: "medium",
                        colorScheme: "element",
                        scale: 0.6,
                        sele: "(protein and sidechain and not backbone and within 4 of ligand and not hydrogen and not (resname ACE or NME)) and not (resno < 5 or resno > 500)",
                    });
                    break;
                case 'surface':
                    // Superficie principal + cartoon para estructura
                    component.addRepresentation("cartoon", {
                        quality: "medium",
                        colorScheme: "chainname",
                        opacity: 0.7,
                        sele: "protein"
                    });
                    component.addRepresentation("surface", {
                        quality: "low",
                        colorScheme: "hydrophobicity",
                        opacity: 0.4,
                        sele: "(protein and sidechain and not backbone and within 4 of ligand and not hydrogen and not (resname ACE or NME)) and not (resno < 5 or resno > 500)",
                    });
                    break;
                case 'cartoon':
                    // Ribbon principal SIN superposiciones
                    component.addRepresentation("cartoon", {
                        quality: "high",
                        colorScheme: "chainname",
                        smoothSheet: true,
                        radiusHelical: 1.0,
                        radiusSheet: 0.6,
                        opacity: 0.9,
                        sele: "protein"
                    });
                    // Solo cadenas laterales importantes - EXCLUIR backbone
                    component.addRepresentation("licorice", {
                        quality: "medium",
                        colorScheme: "element",
                        radius: 0.12,
                        sele: "(protein and sidechain and not backbone and within 4 of ligand and not hydrogen and not (resname ACE or NME)) and not (resno < 5 or resno > 500)",
                        opacity: 0.8
                    });
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
                const ext = this.currentReceptor.includes('PDBQT') ? 'pdbqt' : 'pdb';
                receptorComponent = await this.loadMolecule(
                    viewer,
                    this.currentReceptor,
                    ext,
                    'interactions',
                    'receptor'
                );

                // Resaltar sitios potenciales de interacción
                if (receptorComponent && ligandComponent) {
                    this.highlightInteractionSites(viewer, receptorComponent, ligandComponent);
                }
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

        // Obtener datos de la interacción desde el DOM
        const interactionItem = document.querySelector(`[data-index="${index}"]`);
        if (!interactionItem) {
            console.warn("No se encontró la interacción:", index);
            return;
        }

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
        const typeElement = interactionElement.querySelector('.interaction-type');
        const residueElement = interactionElement.querySelector('.interaction-residue');
        const distanceElement = interactionElement.querySelector('.interaction-distance');
        const energyElement = interactionElement.querySelector('.interaction-energy');
        const atomsElement = interactionElement.querySelector('.interaction-atoms');

        // Limpiar texto y extraer valores
        const residueText = residueElement ? residueElement.textContent.replace(/[🧬\s]/g, '') : '';
        const distanceText = distanceElement ? distanceElement.textContent.replace(/[📏\s]/g, '') : '';
        const energyText = energyElement ? energyElement.textContent.replace(/[⚡\s]/g, '') : '';
        const atomsText = atomsElement ? atomsElement.textContent.replace(/[⚛️\s]/g, '') : '';

        return {
            type: typeElement ? typeElement.textContent.trim() : '',
            residue: residueText,
            distance: distanceText,
            energy: energyText,
            atoms: atomsText.split('↔').map(atom => atom.trim()),
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

        // Resaltar la interacción actual
        const targetItem = document.querySelector(`[data-index="${index}"]`);
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
     * Resalta la interacción en el visor 3D
     */
    highlightInteractionIn3D: function (interactionData) {
        if (!this.modalViewer) {
            console.warn("Visor modal no disponible");
            return;
        }

        try {
            console.log("🌟 Resaltando en 3D:", interactionData);

            // Buscar y resaltar el residuo
            this.highlightResidue(interactionData.residue);

            // Buscar y resaltar átomos específicos (si están disponibles)
            if (interactionData.atoms && interactionData.atoms.length >= 2) {
                this.highlightAtoms(interactionData.atoms);
            }

            // Enfocar la cámara en la región de interacción
            this.focusOnInteraction(interactionData);

            // Mostrar línea de distancia si es posible
            this.showDistanceLine(interactionData);

        } catch (error) {
            console.error("Error resaltando en 3D:", error);
        }
    },

    /**
     * Resalta un residuo específico en el visor
     */

    highlightResidue: function (residueInfo) {
        if (!this.modalViewer || !residueInfo) return;

        try {
            // Extraer número del residuo (ej: "ASP25" -> "25")
            const residueMatch = residueInfo.match(/([A-Z]{3})(\d+)/);
            if (!residueMatch) return;

            const [, residueName, residueNumber] = residueMatch;
            console.log(`🎯 Enfocando residuo: ${residueName} ${residueNumber}`);

            // Buscar componentes cargados del receptor
            const receptorComponent = this.loadedComponents.modal.receptor;
            if (!receptorComponent) {
                console.warn("Componente del receptor no encontrado");
                return;
            }

            // Crear selección específica para el residuo - SOLO cadenas laterales
            const residueSelection = `${residueNumber} and sidechain and not hydrogen`;

            // RESALTADO LIMPIO - Solo ball+stick para cadenas laterales
            const highlightRepr = receptorComponent.addRepresentation("ball+stick", {
                sele: residueSelection,
                color: "#ff4757", // Rojo brillante
                scale: 1.5,
                opacity: 1.0,
                radius: 0.3
            });

            // Superficie sutil solo para este residuo
            const surfaceRepr = receptorComponent.addRepresentation("surface", {
                sele: `${residueNumber}`,
                color: "#ff6b6b",
                opacity: 0.2,
                surfaceType: "vws"
            });

            // Etiqueta en el carbono alfa
            const labelRepr = receptorComponent.addRepresentation("label", {
                sele: `${residueNumber} and .CA`,
                labelType: "text",
                labelText: `${residueName}${residueNumber}`,
                fontWeight: "bold",
                fontSize: 14,
                color: "#ffffff",
                backgroundColor: "#ff4757",
                backgroundMargin: 2,
                xOffset: 0,
                yOffset: 0,
                zOffset: 1
            });

            // Guardar referencias para limpieza posterior
            if (!this.highlightRepresentations) {
                this.highlightRepresentations = [];
            }
            this.highlightRepresentations.push(highlightRepr, surfaceRepr, labelRepr);

            // Enfocar en el residuo con transición suave
            setTimeout(() => {
                receptorComponent.autoView(`${residueNumber}`, 2000);
            }, 300);

        } catch (error) {
            console.error("Error resaltando residuo:", error);
        }
    },


    /**
     * Resalta átomos específicos
     */
    highlightAtoms: function (atomsList) {
        if (!this.modalViewer || !atomsList) return;

        try {
            console.log("🔵 Resaltando átomos:", atomsList);

            const ligandComponent = this.loadedComponents.modal.ligand;
            if (ligandComponent) {
                // Resaltar ligando con representación SEPARADA
                const ligandHighlight = ligandComponent.addRepresentation("ball+stick", {
                    color: "#2ed573", // Verde brillante
                    scale: 1.3,
                    opacity: 1.0,
                    radius: 0.35
                });

                // Halo sutil sin superposición
                const ligandHalo = ligandComponent.addRepresentation("surface", {
                    color: "#2ed573",
                    opacity: 0.15,
                    surfaceType: "ms"
                });

                if (!this.highlightRepresentations) {
                    this.highlightRepresentations = [];
                }
                this.highlightRepresentations.push(ligandHighlight, ligandHalo);
            }

        } catch (error) {
            console.error("Error resaltando átomos:", error);
        }
    },



    /**
     * Enfoca la cámara en la región de interacción
     */
    focusOnInteraction: function (interactionData) {
        if (!this.modalViewer) return;

        try {
            // Si tenemos información del residuo, enfocar ahí
            if (interactionData.residue) {
                const residueMatch = interactionData.residue.match(/\d+/);
                if (residueMatch) {
                    const residueNumber = residueMatch[0];
                    const receptorComponent = this.loadedComponents.modal.receptor;
                    const ligandComponent = this.loadedComponents.modal.ligand;

                    if (receptorComponent && ligandComponent) {
                        // Crear una selección que incluya el residuo y el ligando
                        const combinedSelection = `${residueNumber} or ligand`;
                        receptorComponent.autoView(combinedSelection, 1500); // 1.5 segundos de transición
                        return;
                    }
                }
            }

            // Fallback: enfocar en el ligando
            const ligandComponent = this.loadedComponents.modal.ligand;
            if (ligandComponent) {
                ligandComponent.autoView(1000);
            }

        } catch (error) {
            console.error("Error enfocando interacción:", error);
        }
    },

    /**
     * Muestra una línea de distancia entre átomos (experimental)
     */
    showDistanceLine: function (interactionData) {
        if (!this.modalViewer || !interactionData.distance) return;

        try {
            console.log("📏 Mostrando línea de distancia:", interactionData.distance);

            // Por ahora, mostrar la distancia en el título del visor
            this.showInteractionInfo(interactionData);

        } catch (error) {
            console.error("Error mostrando línea de distancia:", error);
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
        const sectionTitle = document.querySelector('#3d-content .section-title.secondary');
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
            // Limpiar representaciones de resaltado
            if (this.highlightRepresentations) {
                this.highlightRepresentations.forEach(repr => {
                    try {
                        if (repr && typeof repr.dispose === 'function') {
                            repr.dispose();
                        }
                    } catch (e) {
                        console.warn("Error eliminando representación:", e);
                    }
                });
                this.highlightRepresentations = [];
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

            // Restaurar vista general sin recrear representaciones
            if (this.modalViewer && this.loadedComponents.modal.ligand) {
                this.loadedComponents.modal.ligand.autoView(1500);
            }

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
     * Añade etiquetas a residuos clave
     */
    addResidueLabels: function (receptorComponent) {
        try {
            const sele = new NGL.Selection("protein and (ARG, ASP, LYS, GLU, HIS, TYR, SER, THR) and (within 5 of ligand)");
            const atomSet = receptorComponent.structure.getAtomSetWithinSelection(sele);
            const atomIndices = atomSet.toArray();

            if (atomIndices.length > 0) {
                // Limitar a máximo 7 etiquetas para no saturar la vista
                const labelCount = Math.min(atomIndices.length, 7);
                const uniqueResidues = new Set();

                for (let i = 0; i < atomIndices.length; i++) {
                    const index = atomIndices[i];
                    const atom = receptorComponent.structure.getAtomProxy(index);
                    const resname = atom.resname;
                    const resno = atom.resno;
                    const residueId = `${resname}${resno}`;

                    // Evitar etiquetas duplicadas para el mismo residuo
                    if (!uniqueResidues.has(residueId) && uniqueResidues.size < labelCount) {
                        uniqueResidues.add(residueId);

                        // Añadir etiqueta al carbono alfa
                        receptorComponent.addRepresentation("label", {
                            sele: `${resno} and .CA`,
                            labelType: "text",
                            labelText: residueId,
                            fontWeight: "bold",
                            fontSize: 14,
                            color: "#3498db",
                            xOffset: 1,
                            yOffset: 0,
                            zOffset: 0
                        });
                    }
                }
            }
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

        // Si no tenemos receptor, intentar obtenerlo
        if (!this.currentReceptor) {
            console.warn("No hay contenido del receptor disponible, intentando cargar...");
            this.loadReceptorFile().then(receptorContent => {
                if (receptorContent) {
                    this.currentReceptor = receptorContent;
                    console.log("Receptor cargado exitosamente");
                    this.analyzeInteractions(pdbqtContent); // Reintentar
                } else {
                    this.showInteractionsError("No se pudo cargar el contenido del receptor");
                }
            });
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
            const residue = item.querySelector('.interaction-residue').textContent.replace('Residuo: ', '');
            const distance = item.querySelector('.interaction-distance').textContent.replace('Distancia: ', '');
            const energy = item.querySelector('.interaction-energy').textContent.replace('Energía estimada: ', '');

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
     * Resalta una interacción específica en el visor 3D
     */
    highlightInteraction: function (index) {
        console.log(`🎯 Resaltando interacción ${index}`);

        // Limpiar resaltados previos
        this.clearInteractionHighlights();

        // Obtener datos de la interacción desde el DOM
        const interactionItem = document.querySelector(`[data-index="${index}"]`);
        if (!interactionItem) {
            console.warn("No se encontró la interacción:", index);
            return;
        }

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
                        // Rerenderizar el visor apropiado si es necesario
                        if (tabId === '3d' && this.modalViewer && this.currentPose) {
                            console.log("Cambiando a pestaña 3D, renderizando molécula");
                            this.modalViewer.handleResize();
                            this.renderMolecule(this.modalViewer, this.currentPose, this.currentViewMode);
                        } else if (tabId === 'interactions' && this.interactionsViewer && this.currentPose) {
                            console.log("Cambiando a pestaña Interacciones, renderizando interacciones");
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