# Estructura del Proyecto DayhoffDock

Este documento describe en detalle la organización de archivos y directorios del proyecto DayhoffDock, para ayudar a desarrolladores y usuarios a entender cómo está estructurada la aplicación.

## Visión General

DayhoffDock sigue una estructura típica de aplicación Flask con algunas particularidades para manejar la integración con AutoDock Vina y MGLTools. La organización está diseñada para separar claramente la lógica de la aplicación, las vistas, los assets estáticos y los datos temporales y permanentes.

## Estructura de Directorios Principal

```
dayhoffdock/
├── app.py                         # Punto de entrada principal de la aplicación Flask
├── docking.py                     # Lógica principal de docking molecular
├── prepare_receptor_wrapper.py    # Wrapper para prepare_receptor4.py (Python 2.7)
├── prepare_ligand_wrapper.py      # Wrapper para prepare_ligand4.py (Python 2.7)
├── requirements.txt               # Dependencias de Python
├── venv/                          # Entorno virtual de Python
├── static/                        # Archivos estáticos
├── templates/                     # Plantillas HTML
└── uploads/                       # Directorio para archivos subidos
```

## Archivos Principales

### app.py

Este es el punto de entrada de la aplicación Flask. Importa la lógica de docking y configura las rutas de la aplicación web. Contiene código básico para iniciar el servidor Flask.

### docking.py

Contiene la clase `DockingEngine` y las rutas de la API que maneja el proceso de docking. Incluye:

- Configuración de Flask y directorios
- Clase `DockingEngine` para manejar el proceso de docking
- Endpoints para upload de archivos, docking, descarga y visualización
- Lógica para interpretación de resultados
- Manejo de archivos temporales

### prepare_receptor_wrapper.py / prepare_ligand_wrapper.py

Wrappers de Python 3 que invocan scripts de Python 2.7 de MGLTools para preparar receptores y ligandos para docking.

### requirements.txt

Lista todas las dependencias de Python necesarias para el proyecto, incluyendo:

```
Flask
Werkzeug
rdkit
pandas
numpy
python-dotenv
gunicorn
pytest
black
flake8
itsdangerous
click
python-dateutil
loguru
rdkit-pypi
pillow
```

## Directorio `static`

Contiene todos los assets estáticos de la aplicación, organizados por tipo:

```
static/
├── css/                           # Hojas de estilo CSS
│   ├── styles.css                 # Estilos principales
│   ├── modal.css                  # Estilos para ventanas modales
│   ├── education.css              # Estilos para sección educativa
│   └── tutorials.css              # Estilos para tutoriales
├── js/                            # Archivos JavaScript
│   ├── main.js                    # Script principal
│   ├── visualization.js           # Lógica de visualización molecular
│   ├── education.js               # Scripts para sección educativa
│   └── examples.js                # Manejo de ejemplos predefinidos
└── images/                        # Imágenes e ilustraciones
    ├── docking_overview.png       # Ilustración general del docking
    ├── docking_process.png        # Diagrama del proceso de docking
    ├── molecular_interactions.png # Ilustración de interacciones moleculares
    └── [otras imágenes...]        # Otras ilustraciones y assets
```

### Detalles de JavaScript

#### main.js

Contiene la lógica principal de la interfaz de usuario:
- Manejo del formulario de upload
- Procesamiento de solicitudes de docking
- Visualización de resultados
- Control de la interfaz de usuario

#### visualization.js

Implementa el módulo de visualización molecular usando NGL Viewer:
- Visualización 3D de poses de docking
- Análisis de interacciones
- Diferentes modos de visualización
- Captura y descarga de imágenes

#### education.js

Maneja la interactividad de la sección educativa:
- Navegación de la tabla de contenidos
- Resaltado de código
- Imágenes interactivas
- Animaciones

#### examples.js

Gestiona la carga de ejemplos predefinidos:
- Carga ejemplos desde la API
- Almacenamiento en sessionStorage
- Notificaciones

## Directorio `templates`

Contiene todas las plantillas HTML de la aplicación:

```
templates/
├── index.html                     # Página principal
├── education.html                 # Sección educativa
├── tutorials.html                 # Lista de tutoriales
└── tutorial_in_progress.html      # Plantilla para tutoriales en desarrollo
```

### index.html

Página principal que incluye:
- Formulario de upload de archivos
- Sección de progreso
- Visualización de resultados
- Modal para visualización detallada

### education.html

Una guía completa sobre docking molecular, con secciones como:
- Introducción al docking molecular
- Fundamentos teóricos
- Proceso de docking
- Algoritmos de docking
- Funciones de puntuación
- AutoDock Vina
- Interpretación de resultados
- Interacciones moleculares
- Limitaciones y consideraciones
- Aplicaciones
- Glosario

### tutorials.html

Presenta tutoriales paso a paso y ejemplos prácticos:
- Tutoriales para diferentes niveles
- Ejemplos precargados
- Referencia rápida de parámetros

## Directorio `uploads`

Almacena archivos subidos por los usuarios y resultados de docking:

```
uploads/
├── [archivos_temporales]          # Archivos subidos por usuarios
└── results/                       # Resultados de docking
    └── [resultados_docking]       # Archivos PDBQT con resultados
```

## Modelo de datos

### Archivos temporales

El sistema utiliza un diccionario `TEMP_FILES` para rastrear archivos temporales:

```python
TEMP_FILES = {
    'ID_único': {
        'path': 'ruta/al/archivo',
        'expires': datetime,
        'filename': 'nombre_original.pdbqt'
    }
}
```

Estos archivos se limpian automáticamente mediante un thread en segundo plano.

### Resultados de docking

Los resultados de docking incluyen:
- Archivo PDBQT con múltiples poses
- Energías de unión por pose
- Valores RMSD
- Interacciones identificadas

## Flujo de Datos

1. **Input**: El usuario sube archivos de receptor (.pdb/.pdbqt) y ligando (.mol2/.sdf/.pdbqt)
2. **Preparación**: Los archivos se preparan usando los wrappers de MGLTools
3. **Docking**: AutoDock Vina realiza el docking molecular
4. **Procesamiento**: DayhoffDock procesa y estructura los resultados
5. **Visualización**: NGL Viewer se utiliza para visualizar el resultado
6. **Análisis**: Se realiza un análisis de interacciones (simplificado en esta versión)
7. **Output**: El usuario puede descargar los resultados o exportar imágenes

## Conclusión

La estructura del proyecto DayhoffDock facilita la separación de responsabilidades y permite mantener un código organizado y fácil de mantener. El sistema está diseñado para ser escalable y permitir la adición de nuevas funcionalidades en el futuro.

Para el desarrollo, es recomendable seguir esta estructura organizada y utilizar ramas Git para nuevas características, siguiendo un flujo de trabajo GitFlow.
