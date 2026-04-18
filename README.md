# DayhoffDock

<div align="center">

![DayhoffDock Logo](static/favicon.ico)

**Plataforma Web de Docking Molecular Educativa en Español**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.0-green.svg)](https://flask.palletsprojects.com/)
[![AutoDock Vina](https://img.shields.io/badge/AutoDock%20Vina-1.2.5-orange.svg)](https://vina.scripps.edu/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](#english) | [Español](#español)

</div>

---

# Español

## 📋 Descripción

**DayhoffDock** es una interfaz gráfica web para realizar simulaciones de docking molecular utilizando AutoDock Vina. Diseñada específicamente para estudiantes y educadores de habla hispana, esta herramienta integra:

- 🧪 **Motor de Docking**: AutoDock Vina para simulaciones de acoplamiento molecular
- 🔬 **Visualización 3D**: Representación interactiva de complejos proteína-ligando usando NGL Viewer
- 📚 **Módulo Educativo**: Guía teórica completa sobre docking molecular
- 🎓 **Tutoriales**: Videos paso a paso para aprender a usar la plataforma
- 🔍 **Análisis de Interacciones**: Detección y visualización de interacciones moleculares

## ✨ Características Principales

### Simulación de Docking
- ✅ Múltiples formatos de entrada: PDB, MOL2, SDF, PDBQT para ligandos
- ✅ Preparación automática de receptor y ligando (hidrogenación, cargas, minimización)
- ✅ Conversión automática de formatos
- ✅ Configuración personalizable del espacio de búsqueda
- ✅ Resultados con energías de afinidad y RMSD

### Visualización 3D
- 🎨 Múltiples modos de visualización: bastones, esferas, superficies, ribbon
- 🔄 Visualización interactiva con rotación, zoom y traslación
- 👁️ Representación selectiva de cadenas laterales en el sitio de unión
- 💾 Descarga de resultados en formatos PDB y PDBQT
- 📸 Exportación de imágenes en alta resolución

### Análisis de Interacciones
- 🔗 Detección automática de múltiples tipos de interacciones:
  - Puentes de hidrógeno
  - Interacciones hidrofóbicas
  - Puentes salinos
  - Apilamiento π-π
  - Enlaces halógenos
  - Coordinación metálica
- 🎯 Sistema de resaltado interactivo para explorar interacciones individuales
- 📏 Visualización de distancias y energías
- 📊 Resumen estadístico de interacciones

### Módulo Educativo
- 📖 Guía teórica completa en español
- 🎬 Tutoriales en video
- 📚 Glosario de términos
- 🔬 Aplicaciones en investigación

## 🖥️ Requisitos del Sistema

### Software Requerido
- **Python**: 3.8 o superior
- **MGLTools**: 1.5.7 (con Python 2.7)
- **AutoDock Vina**: 1.2.5 o superior
- **Navegador Web**: Chrome 90+, Firefox 88+, Safari 14+, o Edge 90+

### Librerías Python
```
Flask==2.3.0
RDKit>=2023.03.1
Werkzeug==2.3.0
```

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone https://github.com/NahojG/Docking.git
cd Docking
```

### 2. Crear Entorno Virtual
```bash
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 4. Instalar AutoDock Vina
**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install autodock-vina
```

**macOS (usando Homebrew):**
```bash
brew install autodock-vina
```

**Windows:**
Descarga el binario desde [AutoDock Vina](https://vina.scripps.edu/) y añádelo al PATH.

### 5. Instalar MGLTools
Descarga MGLTools 1.5.7 desde [MGLTools](http://mgltools.scripps.edu/downloads) e instálalo.

**Configurar rutas en `docking.py`:**
```python
self.python2_path = "/usr/bin/python2.7"  # Ruta a Python 2.7
self.mgltools_path = "/opt/mgltools_x86_64Linux2_1.5.7"  # Ruta a MGLTools
```

### 6. Ejecutar la Aplicación
```bash
python docking.py
```

La aplicación estará disponible en: **http://localhost:5000**

## 📖 Uso

### Realizar un Docking

1. **Subir Archivos**:
   - **Receptor**: Archivo PDB o PDBQT de la proteína objetivo
   - **Ligando**: Archivo PDB, MOL2, SDF o PDBQT de la molécula a acoplar
   - **Configuración** (opcional): Archivo .txt con parámetros de docking

2. **Archivo de Configuración** (ejemplo):
```txt
receptor=SVSP.pdb
center_x=-3.079
center_y=-6.399
center_z=1.810
size_x=24
size_y=24
size_z=24
exhaustiveness=20
```

3. **Iniciar Docking**: Click en el botón "Iniciar Docking"

4. **Visualizar Resultados**:
   - Tabla con energías de afinidad para cada pose
   - Visualización 3D del complejo
   - Click en "Vista Detallada" para análisis profundo

5. **Explorar Interacciones**:
   - Pestaña "Interacciones" en el modal de visualización
   - Click en "Resaltar" para ver cada interacción en 3D

## 📁 Estructura del Proyecto

```
Docking/
├── docking.py                 # Aplicación Flask principal
├── templates/
│   ├── index.html            # Página principal
│   ├── education.html        # Módulo educativo
│   └── tutorials.html        # Tutoriales
├── static/
│   ├── css/
│   │   ├── styles.css        # Estilos principales
│   │   ├── modal.css         # Estilos del modal
│   │   └── interactions.css  # Estilos de interacciones
│   ├── js/
│   │   ├── main.js          # Lógica principal
│   │   ├── visualization.js # Sistema de visualización 3D
│   │   └── examples.js      # Ejemplos
│   └── images/              # Recursos gráficos
├── uploads/                  # Archivos temporales (auto-generado)
├── requirements.txt          # Dependencias Python
└── README.md                # Este archivo
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Flask 2.3.0**: Framework web
- **AutoDock Vina 1.2.5**: Motor de docking molecular
- **RDKit 2023.03.1**: Manipulación de estructuras moleculares
- **MGLTools 1.5.7**: Preparación de archivos PDBQT

### Frontend
- **HTML5/CSS3**: Interfaz de usuario
- **JavaScript ES6+**: Lógica del cliente
- **NGL Viewer 2.4.0**: Visualización 3D molecular
- **Font Awesome 6.4.0**: Iconos

## 🔬 Validación

El sistema ha sido validado usando el conjunto de datos PDBbind refined set con las siguientes tasas de éxito:
- **Exhaustiveness 8**: 78% (RMSD ≤ 2.0 Å)
- **Exhaustiveness 16**: 85% (RMSD ≤ 2.0 Å)
- **Exhaustiveness 32**: 89% (RMSD ≤ 2.0 Å)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🐛 Reportar Problemas

Si encuentras algún bug o tienes sugerencias, por favor abre un [issue](https://github.com/NahojG/Docking/issues) en GitHub.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## ✍️ Autores

- **Johan Granados** - [@NahojG](https://github.com/NahojG)
- **Andrés Pereañez**
- **Lina Preciado**

## 📚 Citación

Si utilizas DayhoffDock en tu investigación o enseñanza, por favor cita:

```bibtex
@software{dayhoffdock2025,
  title={DayhoffDock: A Web-Based Molecular Docking Platform for Spanish-Speaking Students},
  author={Granados, Johan and Pereañez, Andrés and Preciado, Lina},
  year={2025},
  url={https://github.com/NahojG/Docking}
}
```

## 🙏 Agradecimientos

- AutoDock Vina team por el excelente software de docking
- NGL Viewer developers por la biblioteca de visualización
- Comunidad de código abierto

## 📧 Contacto

Para preguntas o colaboraciones, contacta a través de GitHub Issues o por correo electrónico.

---

# English

## 📋 Description

**DayhoffDock** is a web-based graphical interface for performing molecular docking simulations using AutoDock Vina. Specifically designed for Spanish-speaking students and educators, this tool integrates:

- 🧪 **Docking Engine**: AutoDock Vina for molecular coupling simulations
- 🔬 **3D Visualization**: Interactive representation of protein-ligand complexes using NGL Viewer
- 📚 **Educational Module**: Complete theoretical guide on molecular docking
- 🎓 **Tutorials**: Step-by-step videos to learn how to use the platform
- 🔍 **Interaction Analysis**: Detection and visualization of molecular interactions

## ✨ Key Features

### Docking Simulation
- ✅ Multiple input formats: PDB, MOL2, SDF, PDBQT for ligands
- ✅ Automatic receptor and ligand preparation (hydrogenation, charges, minimization)
- ✅ Automatic format conversion
- ✅ Customizable search space configuration
- ✅ Results with binding affinities and RMSD values

### 3D Visualization
- 🎨 Multiple visualization modes: sticks, spheres, surfaces, ribbon
- 🔄 Interactive visualization with rotation, zoom, and translation
- 👁️ Selective representation of side chains in the binding site
- 💾 Download results in PDB and PDBQT formats
- 📸 High-resolution image export

### Interaction Analysis
- 🔗 Automatic detection of multiple interaction types:
  - Hydrogen bonds
  - Hydrophobic interactions
  - Salt bridges
  - π-π stacking
  - Halogen bonds
  - Metal coordination
- 🎯 Interactive highlighting system to explore individual interactions
- 📏 Distance and energy visualization
- 📊 Statistical summary of interactions

### Educational Module
- 📖 Complete theoretical guide in Spanish
- 🎬 Video tutorials
- 📚 Terminology glossary
- 🔬 Research applications

## 🖥️ System Requirements

### Required Software
- **Python**: 3.8 or higher
- **MGLTools**: 1.5.7 (with Python 2.7)
- **AutoDock Vina**: 1.2.5 or higher
- **Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Python Libraries
```
Flask==2.3.0
RDKit>=2023.03.1
Werkzeug==2.3.0
```

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/NahojG/Docking.git
cd Docking
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install AutoDock Vina
**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install autodock-vina
```

**macOS (using Homebrew):**
```bash
brew install autodock-vina
```

**Windows:**
Download the binary from [AutoDock Vina](https://vina.scripps.edu/) and add it to PATH.

### 5. Install MGLTools
Download MGLTools 1.5.7 from [MGLTools](http://mgltools.scripps.edu/downloads) and install it.

**Configure paths in `docking.py`:**
```python
self.python2_path = "/usr/bin/python2.7"  # Path to Python 2.7
self.mgltools_path = "/opt/mgltools_x86_64Linux2_1.5.7"  # Path to MGLTools
```

### 6. Run the Application
```bash
python docking.py
```

The application will be available at: **http://localhost:5000**

## 📖 Usage

### Performing a Docking

1. **Upload Files**:
   - **Receptor**: PDB or PDBQT file of the target protein
   - **Ligand**: PDB, MOL2, SDF, or PDBQT file of the molecule to dock
   - **Configuration** (optional): .txt file with docking parameters

2. **Configuration File** (example):
```txt
receptor=SVSP.pdb
center_x=-3.079
center_y=-6.399
center_z=1.810
size_x=24
size_y=24
size_z=24
exhaustiveness=20
```

3. **Start Docking**: Click the "Iniciar Docking" button

4. **View Results**:
   - Table with binding affinities for each pose
   - 3D visualization of the complex
   - Click "Vista Detallada" for in-depth analysis

5. **Explore Interactions**:
   - "Interacciones" tab in the visualization modal
   - Click "Resaltar" to view each interaction in 3D

## 📁 Project Structure

```
Docking/
├── docking.py                 # Main Flask application
├── templates/
│   ├── index.html            # Main page
│   ├── education.html        # Educational module
│   └── tutorials.html        # Tutorials
├── static/
│   ├── css/
│   │   ├── styles.css        # Main styles
│   │   ├── modal.css         # Modal styles
│   │   └── interactions.css  # Interaction styles
│   ├── js/
│   │   ├── main.js          # Main logic
│   │   ├── visualization.js # 3D visualization system
│   │   └── examples.js      # Examples
│   └── images/              # Graphic resources
├── uploads/                  # Temporary files (auto-generated)
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## 🛠️ Technologies Used

### Backend
- **Flask 2.3.0**: Web framework
- **AutoDock Vina 1.2.5**: Molecular docking engine
- **RDKit 2023.03.1**: Molecular structure manipulation
- **MGLTools 1.5.7**: PDBQT file preparation

### Frontend
- **HTML5/CSS3**: User interface
- **JavaScript ES6+**: Client-side logic
- **NGL Viewer 2.4.0**: 3D molecular visualization
- **Font Awesome 6.4.0**: Icons

## 🔬 Validation

The system has been validated using the PDBbind refined set with the following success rates:
- **Exhaustiveness 8**: 78% (RMSD ≤ 2.0 Å)
- **Exhaustiveness 16**: 85% (RMSD ≤ 2.0 Å)
- **Exhaustiveness 32**: 89% (RMSD ≤ 2.0 Å)

## 🤝 Contributing

Contributions are welcome. Please:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Bug Reports

If you find any bugs or have suggestions, please open an [issue](https://github.com/NahojG/Docking/issues) on GitHub.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## ✍️ Authors

- **Johan Granados** - [@NahojG](https://github.com/NahojG)
- **Andrés Pereañez**
- **Lina Preciado**

## 📚 Citation

If you use DayhoffDock in your research or teaching, please cite:

```bibtex
@software{dayhoffdock2025,
  title={DayhoffDock: A Web-Based Molecular Docking Platform for Spanish-Speaking Students},
  author={Granados, Johan and Pereañez, Andrés and Preciado, Lina},
  year={2025},
  url={https://github.com/NahojG/Docking}
}
```

## 🙏 Acknowledgments

- AutoDock Vina team for the excellent docking software
- NGL Viewer developers for the visualization library
- Open-source community

## 📧 Contact

For questions or collaborations, contact through GitHub Issues or email.

---

<div align="center">

**Desarrollado con ❤️ para la comunidad educativa hispanohablante**

**Developed with ❤️ for the Spanish-speaking educational community**

© 2025 DayhoffDock | [GitHub](https://github.com/NahojG/Docking)

</div>
