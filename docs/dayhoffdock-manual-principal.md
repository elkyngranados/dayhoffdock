# DayhoffDock: Manual de la Página Principal

## Índice
1. [Introducción a la Interfaz Principal](#introducción-a-la-interfaz-principal)
2. [Barra de Navegación](#barra-de-navegación)
3. [Sección de Carga de Archivos](#sección-de-carga-de-archivos)
   - [Carga del Receptor](#carga-del-receptor)
   - [Carga del Ligando](#carga-del-ligando)
   - [Archivo de Configuración](#archivo-de-configuración)
   - [Iniciar el Proceso de Docking](#iniciar-el-proceso-de-docking)
4. [Sección de Progreso](#sección-de-progreso)
5. [Sección de Resultados](#sección-de-resultados)
   - [Tabla de Energías de Afinidad](#tabla-de-energías-de-afinidad)
   - [Visor Molecular 3D](#visor-molecular-3d)
   - [Opciones de Descarga](#opciones-de-descarga)
6. [Modal de Visualización Detallada](#modal-de-visualización-detallada)
   - [Pestaña Vista 3D](#pestaña-vista-3d)
   - [Pestaña Interacciones](#pestaña-interacciones)
   - [Opciones de Exportación](#opciones-de-exportación)
7. [Sección Informativa](#sección-informativa)
8. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

## Introducción a la Interfaz Principal

La página principal de DayhoffDock es el punto central desde donde realizará los experimentos de docking molecular. La interfaz está diseñada para ser intuitiva y fácil de usar, incluso para principiantes en modelado molecular. 

La página está organizada en secciones claramente definidas que guían al usuario a través del flujo de trabajo completo de docking, desde la carga de archivos hasta el análisis de resultados.

## Barra de Navegación

En la parte superior de la interfaz, encontrará la barra de navegación que contiene:

- **Título y Logo**: El nombre "DayhoffDock" junto con un ícono atómico.
- **Descripción**: Breve descripción del sistema como "Sistema de simulación de docking molecular".
- **Enlaces de Navegación**:
  - **Inicio**: Lleva a la página principal (donde se realiza el docking).
  - **Guía Educativa**: Lleva a la sección con información teórica sobre docking molecular.
  - **Tutoriales**: Lleva a la sección con tutoriales prácticos y ejemplos.

La barra de navegación está presente en todas las páginas para permitir un acceso rápido a cualquier sección.

## Sección de Carga de Archivos

Esta es la primera sección operativa de la página principal, donde debe subir los archivos necesarios para realizar el docking. Está compuesta por tres cajas de carga de archivos y un botón de envío.

### Carga del Receptor

La primera caja es para subir el archivo del receptor (proteína diana):

1. **Formatos aceptados**: PDB (.pdb) o PDBQT (.pdbqt)
2. **Procedimiento**:
   - Haga clic en la caja etiquetada como "Receptor"
   - Se abrirá un explorador de archivos
   - Navegue hasta donde tenga almacenado su archivo de proteína
   - Seleccione el archivo y haga clic en "Abrir"
   - El nombre del archivo aparecerá debajo de la caja indicando que se ha cargado correctamente

3. **Recomendaciones para el archivo de receptor**:
   - Asegúrese de que la estructura esté limpia (sin ligandos no deseados, moléculas de agua no esenciales)
   - Verifique que los átomos de hidrógeno estén añadidos si son relevantes para las interacciones
   - Es preferible utilizar estructuras de alta resolución (< 2.5Å para cristalografía)
   - Si utiliza un archivo PDB, DayhoffDock lo convertirá automáticamente a PDBQT

### Carga del Ligando

La segunda caja es para subir el archivo del ligando (molécula pequeña):

1. **Formatos aceptados**: MOL2 (.mol2), SDF (.sdf) o PDBQT (.pdbqt)
2. **Procedimiento**:
   - Haga clic en la caja etiquetada como "Ligando"
   - Se abrirá un explorador de archivos
   - Navegue hasta donde tenga almacenado su archivo del ligando
   - Seleccione el archivo y haga clic en "Abrir"
   - El nombre del archivo aparecerá debajo de la caja indicando que se ha cargado correctamente

3. **Recomendaciones para el archivo de ligando**:
   - Asegúrese de que la estructura contenga todos los átomos de hidrógeno
   - Verifique que el estado de protonación sea apropiado para el pH fisiológico (o relevante para su sistema)
   - Es recomendable que el ligando esté en una conformación energéticamente favorable
   - Si tiene múltiples conformaciones, considere realizar múltiples experimentos de docking

### Archivo de Configuración

La tercera caja es opcional y permite cargar un archivo de configuración personalizado:

1. **Formato aceptado**: Archivo de texto (.txt)
2. **Procedimiento**:
   - Haga clic en la caja etiquetada como "Configuración"
   - Se abrirá un explorador de archivos
   - Navegue hasta donde tenga almacenado su archivo de configuración
   - Seleccione el archivo y haga clic en "Abrir"
   - El nombre del archivo aparecerá debajo de la caja indicando que se ha cargado correctamente

3. **Ejemplo de archivo de configuración**:
   ```
   center_x = 15.4
   center_y = 53.2
   center_z = 16.8
   size_x = 20.0
   size_y = 20.0
   size_z = 20.0
   exhaustiveness = 16
   num_modes = 15
   energy_range = 4
   ```

4. **Parámetros principales**:
   - **center_x, center_y, center_z**: Coordenadas del centro de la caja de búsqueda en Ångstroms
   - **size_x, size_y, size_z**: Dimensiones de la caja de búsqueda en Ångstroms
   - **exhaustiveness**: Controla la exhaustividad de la búsqueda (valores más altos = mejor exploración pero más tiempo)
   - **num_modes**: Número máximo de modos de unión (poses) a generar
   - **energy_range**: Rango de energía máximo entre el mejor y peor modo en kcal/mol

5. **Configuración por defecto**:
   Si no proporciona un archivo de configuración, DayhoffDock utilizará los siguientes valores predeterminados:
   - Centro de la caja de búsqueda en (0,0,0)
   - Tamaño de la caja de 20Å × 20Å × 20Å
   - Exhaustividad: 8
   - Número de modos: 9
   - Rango de energía: 3 kcal/mol

### Iniciar el Proceso de Docking

Una vez que haya cargado los archivos necesarios (receptor y ligando son obligatorios, configuración es opcional):

1. Haga clic en el botón "Iniciar Docking" ubicado debajo de las cajas de carga
2. Los archivos se enviarán al servidor para procesamiento
3. La sección de progreso se hará visible, mostrando que el proceso ha comenzado

## Sección de Progreso

Esta sección aparece automáticamente después de iniciar el docking y proporciona información sobre el estado actual del proceso:

1. **Barra de progreso**:
   - Una barra animada que indica que el proceso está en marcha
   - No representa un porcentaje específico debido a la naturaleza del algoritmo

2. **Texto de estado**:
   - Muestra mensajes como "Iniciando proceso de docking...", "Procesando..." o "Finalizado"
   - Le informa sobre la etapa actual del proceso

3. **Duración**:
   - El tiempo de procesamiento varía según:
     - El tamaño y complejidad del receptor y ligando
     - Los parámetros de docking (especialmente la exhaustividad)
     - La carga actual del servidor
   - Normalmente oscila entre 30 segundos para sistemas simples hasta varios minutos para sistemas complejos

La sección de progreso se cerrará automáticamente cuando el proceso haya finalizado y será reemplazada por la sección de resultados.

## Sección de Resultados

Esta sección aparece automáticamente una vez que el proceso de docking ha finalizado con éxito. Muestra todos los resultados generados y permite visualizar e interactuar con ellos.

### Tabla de Energías de Afinidad

En el lado izquierdo de la sección de resultados, encontrará una tabla que muestra todas las poses de docking generadas:

1. **Columnas de la tabla**:
   - **Modo**: Identificador numérico de la pose (1, 2, 3, etc.)
   - **Afinidad (kcal/mol)**: Energía libre de unión estimada. Valores más negativos indican unión más fuerte
   - **RMSD (Å)**: Desviación cuadrática media respecto a la mejor pose
     - Al pasar el cursor sobre este valor, se muestran los valores RMSD_lb (lower bound) y RMSD_ub (upper bound)
     - RMSD_lb: Calculado considerando sólo los átomos equivalentes en la misma posición
     - RMSD_ub: Calculado tras la mejor superposición posible
   - **Acciones**: Contiene un botón "Ver" que permite visualizar la pose correspondiente

2. **Interpretación de los valores de energía**:
   - **0 a -4.0 kcal/mol**: Unión débil o no significativa
   - **-4.0 a -6.0 kcal/mol**: Unión moderada
   - **-6.0 a -8.0 kcal/mol**: Unión buena
   - **-8.0 a -10.0 kcal/mol**: Unión muy buena
   - **-10.0 a -12.0 kcal/mol**: Unión excelente
   - **Por debajo de -12.0 kcal/mol**: Unión excepcionalmente fuerte (verificar posibles artefactos)

3. **Análisis de RMSD**:
   - Valores por debajo de 2.0Å generalmente indican poses similares (mismo modo de unión)
   - Valores entre 2.0-4.0Å sugieren modos de unión diferentes pero relacionados
   - Valores por encima de 4.0Å indican modos de unión sustancialmente diferentes

### Visor Molecular 3D

En el lado derecho de la sección de resultados, encontrará un visor molecular interactivo:

1. **Visualización inicial**:
   - Automáticamente muestra la pose mejor puntuada (Modo 1)
   - El ligando se visualiza en modo "bastones" (licorice) con colores por elemento:
     - Carbono: gris
     - Oxígeno: rojo
     - Nitrógeno: azul
     - Azufre: amarillo
     - Hidrógeno: blanco (generalmente no se muestra)
     - Halógenos: verde (cloro), marrón (bromo), púrpura (yodo)

2. **Controles de navegación**:
   - **Rotación**: Clic izquierdo y arrastrar
   - **Traslación**: Clic derecho y arrastrar
   - **Zoom**: Rueda del ratón o gesto de pinza en dispositivos táctiles

3. **Cambio de poses**:
   - Para ver diferentes poses, haga clic en el botón "Ver" junto a la pose deseada en la tabla
   - El visor se actualizará para mostrar la nueva pose seleccionada

### Opciones de Descarga

Debajo del visor molecular, encontrará dos botones:

1. **Descargar Resultados**:
   - Descarga un archivo PDBQT que contiene todas las poses generadas
   - Este archivo puede abrirse con software como PyMOL, VMD o AutoDockTools para análisis adicional

2. **Vista Detallada**:
   - Abre un modal con opciones avanzadas de visualización y análisis
   - Proporciona herramientas adicionales no disponibles en la vista principal

## Modal de Visualización Detallada

Al hacer clic en "Vista Detallada", se abre un modal que ofrece funciones avanzadas de visualización y análisis. Este modal está organizado en pestañas para una exploración más exhaustiva de los resultados.

### Pestaña Vista 3D

Esta pestaña proporciona una visualización molecular avanzada:

1. **Visor 3D ampliado**:
   - Ocupa la mayor parte del modal para una mejor visualización
   - Mantiene los mismos controles de navegación (rotación, traslación, zoom)

2. **Modos de visualización**:
   - **Bastones (Licorice)**: Representación de enlaces como cilindros, muestra la estructura química detallada
   - **Esferas (Spacefill)**: Representación de átomos como esferas con radios de van der Waals, muestra el volumen ocupado
   - **Superficie**: Representación de la superficie molecular, útil para visualizar bolsillos y cavidades
   - **Cartoon**: Representación de la estructura secundaria de proteínas (si se muestra el receptor)

3. **Barra de controles**:
   - Botones para alternar entre los diferentes modos de visualización
   - El modo activo se resalta en azul

### Pestaña Interacciones

Esta pestaña está dedicada al análisis de las interacciones proteína-ligando:

1. **Lista de interacciones**:
   - Panel izquierdo que muestra todas las interacciones detectadas
   - Cada interacción incluye:
     - **Tipo**: Clasificación de la interacción (enlace de hidrógeno, hidrofóbica, etc.)
     - **Residuo**: Aminoácido de la proteína involucrado
     - **Distancia**: Separación en Ångstroms entre los átomos o grupos interactuantes
     - **Energía**: Estimación aproximada de la contribución energética

2. **Codificación por colores**:
   - Cada tipo de interacción tiene un color distintivo:
     - **Azul**: Enlaces de hidrógeno
     - **Naranja**: Interacciones hidrofóbicas
     - **Púrpura**: Interacciones π-π (pi-stacking)
     - **Rojo**: Puentes salinos
     - **Verde**: Enlaces halógeno

3. **Visor de interacciones 3D**:
   - Panel derecho que muestra una visualización especializada de las interacciones
   - Destaca visualmente las interacciones con líneas punteadas o superficies
   - Muestra etiquetas para los residuos involucrados

### Opciones de Exportación

En la parte inferior del modal, encontrará opciones para exportar los resultados:

1. **Descargar PDBQT**:
   - Descarga el archivo PDBQT con todas las poses generadas
   - Mismo comportamiento que el botón "Descargar Resultados" de la vista principal

2. **Descargar PDB**:
   - Convierte y descarga la pose actualmente visualizada en formato PDB
   - Útil para software que no admite directamente el formato PDBQT

3. **Descargar Imagen**:
   - Captura y descarga una imagen de la visualización actual
   - Útil para incluir en presentaciones, informes o publicaciones

4. **Cerrar**:
   - Cierra el modal y vuelve a la vista principal
   - No afecta a los resultados, que seguirán disponibles en la página principal

## Sección Informativa

En la parte inferior de la página principal, encontrará una sección informativa que proporciona enlaces a recursos educativos:

1. **Mensaje informativo**:
   - Pregunta "¿Quieres aprender más sobre docking molecular?"
   - Invita a explorar los recursos adicionales disponibles

2. **Enlaces a recursos**:
   - **Guía Educativa**: Enlace a la sección con información teórica detallada
   - **Tutoriales Prácticos**: Enlace a la sección con tutoriales paso a paso

Esta sección es especialmente útil para nuevos usuarios que desean profundizar su conocimiento sobre docking molecular y cómo interpretar correctamente los resultados.

## Solución de Problemas Comunes

### Archivos no se cargan correctamente

**Problema**: Al intentar cargar un archivo, no aparece el nombre debajo de la caja de carga.

**Soluciones**:
1. Verifique que el formato del archivo sea compatible (PDB/PDBQT para receptor, MOL2/SDF/PDBQT para ligando)
2. Asegúrese de que el tamaño del archivo no exceda el límite de 16MB
3. Intente con un navegador diferente
4. Verifique los permisos del archivo en su sistema

### El proceso de docking no inicia

**Problema**: Al hacer clic en "Iniciar Docking", no aparece la sección de progreso o aparece un error.

**Soluciones**:
1. Asegúrese de haber cargado tanto el receptor como el ligando (ambos son obligatorios)
2. Verifique que su conexión a Internet esté funcionando correctamente
3. Intente recargar la página y cargar los archivos nuevamente
4. Si utiliza un archivo de configuración, verifique que tenga el formato correcto

### Error durante el procesamiento

**Problema**: Aparece un mensaje de error durante el proceso de docking.

**Mensajes comunes y soluciones**:
1. **"Error en prepare_receptor"**:
   - El archivo del receptor podría estar dañado o no ser válido
   - Verifique que la estructura no tenga átomos o residuos incompletos
   - Intente limpiar la estructura con herramientas como PyMOL o Chimera antes de subirla

2. **"Error en prepare_ligand"**:
   - El archivo del ligando podría estar dañado o no ser válido
   - Verifique que la estructura esté completa y tenga todos los hidrógenos
   - Intente re-generar el archivo con herramientas como OpenBabel o RDKit

3. **"Error en el docking"**:
   - Si está utilizando un archivo de configuración, verifique que los parámetros sean válidos
   - La caja de búsqueda podría estar fuera de la proteína o ser demasiado pequeña
   - El ligando podría ser demasiado grande para la caja especificada

### Problemas con la visualización

**Problema**: El visor 3D no muestra nada o se ve incorrectamente.

**Soluciones**:
1. Asegúrese de que su navegador tenga WebGL habilitado
2. Actualice su navegador a la última versión
3. Si está utilizando una GPU integrada, verifique que los controladores estén actualizados
4. Intente con un navegador diferente (Chrome o Firefox funcionan mejor con WebGL)
5. Deshabilite extensiones del navegador que puedan estar interfiriendo
