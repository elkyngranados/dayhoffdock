# Introducción a DayhoffDock

## ¿Qué es DayhoffDock?

DayhoffDock es una aplicación web para modelado molecular que integra AutoDock Vina, MGLTools y Flask, permitiendo realizar simulaciones de acoplamiento molecular (docking) a través de una interfaz web intuitiva y educativa. La plataforma está diseñada tanto para fines educativos como para investigadores que necesitan una herramienta accesible para realizar docking molecular.

## Características principales

- **Interfaz web intuitiva**: Permite cargar receptores y ligandos a través de una interfaz sencilla.
- **Visualización 3D interactiva**: Visualiza los resultados del docking en tiempo real usando tecnología WebGL.
- **Análisis de interacciones**: Identifica y visualiza las interacciones clave entre el ligando y el receptor.
- **Sección educativa**: Incluye una guía completa sobre los principios del docking molecular.
- **Tutoriales prácticos**: Tutoriales paso a paso para aprender a utilizar la herramienta.
- **Ejemplos predefinidos**: Incluye ejemplos reales para experimentar rápidamente.

## Componentes del sistema

DayhoffDock está construido sobre varios componentes clave:

1. **AutoDock Vina**: Motor de docking molecular de código abierto desarrollado por The Scripps Research Institute.
2. **MGLTools**: Conjunto de herramientas para preparar archivos para docking molecular.
3. **Flask**: Framework web de Python que sirve como backend del sistema.
4. **RDKit**: Biblioteca para quimioinformática que proporciona funcionalidades para trabajar con moléculas.
5. **NGL Viewer**: Visor molecular basado en WebGL para visualización 3D interactiva.

## Arquitectura técnica

La aplicación sigue una arquitectura cliente-servidor:

- **Backend**: Desarrollado en Python usando Flask, maneja las solicitudes de docking, procesa los archivos moleculares y ejecuta AutoDock Vina.
- **Frontend**: Interfaz web responsive desarrollada con HTML, CSS y JavaScript que proporciona una experiencia de usuario fluida.
- **Procesamiento de datos**: Utiliza RDKit y otras bibliotecas para preparar y analizar estructuras moleculares.
- **Visualización**: Implementa NGL Viewer para renderizar modelos moleculares 3D interactivos en el navegador.

## Casos de uso

DayhoffDock es útil para:

- **Educación**: Estudiantes que aprenden los fundamentos del modelado molecular.
- **Investigación preliminar**: Científicos que necesitan realizar experimentos rápidos de docking.
- **Enseñanza**: Profesores que quieren demostrar conceptos de acoplamiento molecular.
- **Visualización**: Investigadores que necesitan visualizar interacciones proteína-ligando.

## Requisitos del sistema

Para ejecutar DayhoffDock en un servidor local o en la nube, se necesitan los siguientes componentes:

- Sistema operativo: Linux (preferiblemente Ubuntu/Debian)
- Python 3.x para Flask y componentes del servidor
- Python 2.7 para MGLTools (gestionado internamente)
- AutoDock Vina
- Bibliotecas adicionales como RDKit, NumPy, Pandas
- Espacio en disco: mínimo 2GB
- RAM: mínimo 4GB

En las siguientes secciones de la documentación, exploraremos en detalle la instalación, configuración y uso de DayhoffDock.
