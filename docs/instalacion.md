# Guía de Instalación de DayhoffDock

Esta guía detalla los pasos necesarios para instalar y configurar DayhoffDock en un entorno Linux. El sistema combina AutoDock Vina, MGLTools y Flask, resolviendo el desafío de compatibilidad entre Python 2.7 (requerido por MGLTools) y Python 3 (usado por Flask).

## Requisitos del Sistema

- Ubuntu/Debian Linux
- Acceso root/sudo
- 4GB RAM mínimo
- 2GB espacio en disco
- Conexión a Internet

## 1. Instalación de Dependencias

### 1.1 AutoDock Vina

```bash
sudo apt-get install autodock-vina
```

### 1.2 MGLTools

```bash
# Descargar MGLTools
wget http://mgltools.scripps.edu/downloads/tars/releases/REL1.5.7/mgltools_Linux-x86_64_1.5.7.tar.gz

# Extraer y configurar
tar -xvf mgltools_Linux-x86_64_1.5.7.tar.gz
cd mgltools_Linux-x86_64_1.5.7
./install.sh

# Agregar al PATH
echo 'export PATH=$PATH:/ruta/absoluta/a/mgltools_Linux-x86_64_1.5.7/bin' >> ~/.bashrc
source ~/.bashrc
```

> **Nota importante**: Reemplaza `/ruta/absoluta/a/` con la ruta real de instalación en tu sistema.

### 1.3 RDKit y PyMOL

```bash
sudo apt-get install librdkit-dev
sudo apt-get install pymol
```

## 2. Configuración de Entornos Python

DayhoffDock necesita manejar dos versiones de Python: 2.7 para MGLTools y 3.x para Flask. Utilizaremos pyenv para gestionar estas versiones.

### 2.1 Instalar Dependencias para pyenv

```bash
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev \
liblzma-dev python3-openssl git
```

### 2.2 Instalar pyenv

```bash
curl https://pyenv.run | bash

# Configurar ~/.bashrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

### 2.3 Instalar Python 2.7.18 y 3.x

```bash
# Python 2.7.18 para MGLTools
pyenv install 2.7.18

# Para el proyecto, usar Python 3 del sistema o instalarlo con pyenv
# Por ejemplo, para Python 3.8:
pyenv install 3.8.12

# Verificar las versiones instaladas
pyenv versions
```

## 3. Configuración del Proyecto Flask

### 3.1 Clonar el Repositorio (si aplica)

Si tienes acceso a un repositorio, puedes clonarlo. De lo contrario, crea una estructura de directorios para el proyecto:

```bash
# Opción 1: Clonar repositorio
git clone https://github.com/usuario/dayhoffdock.git
cd dayhoffdock

# Opción 2: Crear estructura manualmente
mkdir -p dayhoffdock/{static,templates,uploads/{results}}
cd dayhoffdock
```

### 3.2 Crear Entorno Virtual

```bash
# Configurar Python 3 como versión para el proyecto
pyenv local 3.8.12  # O la versión que hayas instalado

# Crear entorno virtual
python -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt  # Si existe requirements.txt
```

Si no tienes un archivo `requirements.txt`, puedes crear uno con el siguiente contenido:

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

### 3.3 Configurar Entorno para MGLTools

Edita el archivo de activación del entorno virtual para añadir la ruta de MGLTools:

```bash
nano venv/bin/activate
```

Añade la siguiente línea al final del archivo (ajusta la ruta según tu instalación):

```bash
export PATH="$PATH:/ruta/absoluta/a/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24"
```

### 3.4 Ajustar Permisos

```bash
chmod +x /ruta/absoluta/a/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_receptor4.py
chmod +x /ruta/absoluta/a/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_ligand4.py
```

## 4. Creación de Wrapper para MGLTools

Dado que MGLTools requiere Python 2.7 y nuestra aplicación Flask usa Python 3, necesitamos crear un wrapper:

```python
#!/usr/bin/env python3
# prepare_receptor_wrapper.py

import subprocess
import sys
import os

def run_prepare_receptor():
    # Ruta al script original
    script_path = "/ruta/absoluta/a/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_receptor4.py"
    
    # Cambiar temporalmente a Python 2.7
    os.environ["PYENV_VERSION"] = "2.7.18"
    
    # Construir y ejecutar el comando
    cmd = ["python", script_path] + sys.argv[1:]
    subprocess.call(cmd)

if __name__ == "__main__":
    run_prepare_receptor()
```

También necesitamos crear un wrapper similar para el ligando:

```python
#!/usr/bin/env python3
# prepare_ligand_wrapper.py

import subprocess
import sys
import os

def run_prepare_ligand():
    # Ruta al script original
    script_path = "/ruta/absoluta/a/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_ligand4.py"
    
    # Cambiar temporalmente a Python 2.7
    os.environ["PYENV_VERSION"] = "2.7.18"
    
    # Construir y ejecutar el comando
    cmd = ["python", script_path] + sys.argv[1:]
    subprocess.call(cmd)

if __name__ == "__main__":
    run_prepare_ligand()
```

Haz ambos scripts ejecutables:

```bash
chmod +x prepare_receptor_wrapper.py
chmod +x prepare_ligand_wrapper.py
```

## 5. Estructura del Proyecto

El proyecto debe tener la siguiente estructura:

```
dayhoffdock/
├── app.py                         # Archivo principal de Flask
├── requirements.txt               # Dependencias
├── prepare_receptor_wrapper.py    # Wrapper para prepare_receptor4.py
├── prepare_ligand_wrapper.py      # Wrapper para prepare_ligand4.py
├── venv/                          # Entorno virtual
├── static/                        # Archivos estáticos
│   ├── css/                       # Hojas de estilo
│   ├── js/                        # Archivos JavaScript
│   └── images/                    # Imágenes
├── templates/                     # Plantillas HTML
└── uploads/                       # Directorio para subir archivos
    └── results/                   # Almacena resultados de docking
```

## 6. Verificación de la Instalación

Una vez completados los pasos anteriores, verifica que todo esté correctamente configurado:

```bash
# Verificar AutoDock Vina
vina --version

# Verificar MGLTools
which prepare_receptor4.py

# Verificar pyenv
pyenv versions

# Probar el wrapper
python3 prepare_receptor_wrapper.py --help
python3 prepare_ligand_wrapper.py --help
```

## 7. Ejecutar la Aplicación

```bash
# Activar entorno virtual
source venv/bin/activate

# Ejecutar Flask en modo desarrollo
python app.py
```

La aplicación debería estar disponible en `http://localhost:8084`.

## Solución de Problemas Comunes

### Error: ImportError: No module named MolKit

Este error ocurre porque `prepare_receptor4.py` requiere Python 2.7. Verifica que:

1. Hayas instalado Python 2.7.18 con pyenv
2. El wrapper esté configurado correctamente
3. La ruta a MGLTools en el wrapper sea la correcta

### Error al ejecutar AutoDock Vina

Si recibes un error al ejecutar Vina, verifica:

1. Que AutoDock Vina esté instalado correctamente
2. Que los archivos PDBQT estén generados correctamente
3. Que la configuración tenga parámetros válidos

### Problemas de permisos con archivos temporales

Si hay errores de permisos, asegúrate de que:

1. La aplicación tenga permisos de escritura en la carpeta `uploads`
2. Los scripts wrapper tengan permisos de ejecución

## Siguiente paso

Una vez instalado, consulta la guía de uso para aprender a utilizar DayhoffDock para tus proyectos de docking molecular.
