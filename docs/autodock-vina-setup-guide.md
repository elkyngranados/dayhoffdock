# Modelado Molecular con AutoDock Vina y Flask

Esta guía detalla la configuración de un entorno para modelado molecular que combina AutoDock Vina, MGLTools y Flask, resolviendo el desafío de compatibilidad entre Python 2.7 (requerido por MGLTools) y Python 3 (usado por Flask).

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#-requisitos-del-sistema)
- [Instalación de Dependencias](#-instalación-de-dependencias)
  - [AutoDock Vina](#-autodock-vina)
  - [MGLTools](#️-mgltools)
  - [RDKit y PyMOL](#-rdkit-y-pymol)
- [Configuración de Entornos Python](#-configuración-de-entornos-python)
- [Configuración del Proyecto Flask](#-configuración-del-proyecto-flask)
- [Resolución de Errores](#-resolución-de-errores)
- [Verificación](#-verificación)

## 🖥️ Requisitos del Sistema

- Ubuntu/Debian Linux
- Acceso root/sudo
- 4GB RAM mínimo
- 2GB espacio en disco
- Conexión a Internet

## 📦 Instalación de Dependencias

### 🔬 AutoDock Vina

```bash
sudo apt-get install autodock-vina
```

### 🛠️ MGLTools

```bash
# Descargar MGLTools
wget http://mgltools.scripps.edu/downloads/tars/releases/REL1.5.7/mgltools_Linux-x86_64_1.5.7.tar.gz

# Extraer y configurar
tar -xvf mgltools_Linux-x86_64_1.5.7.tar.gz
cd mgltools_Linux-x86_64_1.5.7
./install.sh

# Agregar al PATH
echo 'export PATH=$PATH:/path/to/mgltools_Linux-x86_64_1.5.7/bin' >> ~/.bashrc
source ~/.bashrc
```

⚠️ **Nota**: Reemplaza `/path/to/` con la ruta real de instalación.

### 🧪 RDKit y PyMOL

```bash
sudo apt-get install librdkit-dev
sudo apt-get install pymol
```

## 🐍 Configuración de Entornos Python

### Instalar Dependencias para pyenv

```bash
sudo apt install -y make build-essential libssl-dev zlib1g-dev \
libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev \
liblzma-dev python3-openssl git
```

### Instalar pyenv

```bash
curl https://pyenv.run | bash

# Configurar ~/.bashrc
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.bashrc
echo 'export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc
```

### Instalar Python 2.7.18 y 3.x

```bash
# Python 2.7.18 para MGLTools
pyenv install 2.7.18

# Para el proyecto, usar Python 3 del sistema
python3 --version
```

## 🚀 Configuración del Proyecto Flask

### Crear Entorno Virtual

```bash
# Navegar al directorio del proyecto
cd /path/to/your/project

# Crear entorno virtual con Python 3
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

### Configurar Entorno para MGLTools

```bash
# Agregar path de MGLTools al entorno virtual
nano venv/bin/activate
```

Agregar la línea:
```bash
export PATH="$PATH:/home/dayhoff/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24"
```

### Ajustar Permisos

```bash
chmod +x /home/dayhoff/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_receptor4.py
```

## ⚡ Resolución de Errores

### Error: ImportError: No module named MolKit

Este error ocurre porque `prepare_receptor4.py` requiere Python 2.7. La solución es crear un wrapper:

```python
#!/usr/bin/env python3
# prepare_receptor_wrapper.py

import subprocess
import sys
import os

def run_prepare_receptor():
    # Ruta al script original
    script_path = "/home/nahoj/mgltools_x86_64Linux2_1.5.7/MGLToolsPckgs/AutoDockTools/Utilities24/prepare_receptor4.py"
    
    # Cambiar temporalmente a Python 2.7
    os.environ["PYENV_VERSION"] = "2.7.18"
    
    # Construir y ejecutar el comando
    cmd = ["python", script_path] + sys.argv[1:]
    subprocess.call(cmd)

if __name__ == "__main__":
    run_prepare_receptor()
```

Hacer ejecutable:
```bash
chmod +x prepare_receptor_wrapper.py
```

### Uso en Flask

```python
# En tu aplicación Flask
import subprocess

def prepare_receptor(pdb_file):
    cmd = ["python3", "prepare_receptor_wrapper.py", "-r", pdb_file]
    subprocess.run(cmd)
```

## ✅ Verificación

```bash
# Verificar AutoDock Vina
vina --version

# Verificar MGLTools
which prepare_receptor4.py

# Verificar pyenv
pyenv versions

# Probar el wrapper
python3 prepare_receptor_wrapper.py --help
```

## 📁 Estructura del Proyecto

```
tu-proyecto/
├── venv/
├── prepare_receptor_wrapper.py
├── requirements.txt
├── app.py
├── templates/
└── static/
```

## 🔍 Notas Importantes

- Esta configuración mantiene Python 3 para Flask y Python 2.7 para MGLTools
- El wrapper introduce un mínimo overhead pero asegura la compatibilidad
- Asegura manejar adecuadamente los paths y permisos

## 📝 Ejemplo de requirements.txt

```txt
Flask==2.0.1
numpy==1.21.0
pandas==1.3.0
matplotlib==3.4.2
# Otras dependencias de tu proyecto
```

## 🚀 Ejecutar la Aplicación

```bash
# Activar entorno virtual
source venv/bin/activate

# Ejecutar Flask
python app.py
```

## 📄 Licencia

MIT License

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o envía un pull request.

## 📞 Contacto

Para soporte adicional, abre un issue en este repositorio.