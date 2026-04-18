# Guía de Uso Básico de DayhoffDock

Esta guía te ayudará a utilizar las funciones básicas de DayhoffDock para realizar estudios de acoplamiento molecular. Cubriremos desde la interfaz de usuario hasta la interpretación de resultados.

## Interfaz Principal

La interfaz principal de DayhoffDock está diseñada para ser intuitiva y directa. Está compuesta por varias secciones:

1. **Cabecera**: Contiene el título de la aplicación y la navegación principal.
2. **Sección de carga de archivos**: Permite subir los archivos del receptor y ligando.
3. **Sección de progreso**: Muestra el estado del proceso de docking.
4. **Sección de resultados**: Muestra los resultados del docking cuando el proceso finaliza.

## Paso 1: Preparación de los Archivos

Antes de comenzar, necesitarás tener listos los archivos para el receptor y el ligando:

### Formatos aceptados:

- **Receptor**: PDB (.pdb) o PDBQT (.pdbqt)
- **Ligando**: MOL2 (.mol2), SDF (.sdf) o PDBQT (.pdbqt)
- **Configuración** (opcional): archivo de texto (.txt) con parámetros específicos

### Preparando los archivos:

- **Receptor**: Debe ser una estructura limpia, preferiblemente con hidrógenos añadidos. Si usas un archivo PDB, DayhoffDock lo convertirá automáticamente a PDBQT.
- **Ligando**: Debe tener todos los hidrógenos y preferiblemente estar en una conformación energéticamente favorable.

> **Consejo**: Para mejores resultados, limpia tu estructura de proteína eliminando moléculas de agua no esenciales, ligandos y otros componentes no relevantes. Programas como PyMOL, UCSF Chimera o Discovery Studio pueden ayudarte con esto.

## Paso 2: Carga de Archivos

1. En la interfaz principal, verás tres cajas para subir archivos:

   ![Sección de carga de archivos](ruta_a_imagen_ejemplo_carga.png)

2. Haz clic en la caja del **Receptor** para subir el archivo de tu proteína.
3. Haz clic en la caja del **Ligando** para subir el archivo de tu molécula pequeña.
4. Opcionalmente, puedes hacer clic en la caja de **Configuración** para subir un archivo de configuración personalizado.

> **Nota**: Si no subes un archivo de configuración, DayhoffDock utilizará una configuración por defecto que centra la caja de búsqueda en el origen (0,0,0) con un tamaño de 20Å × 20Å × 20Å.

### Ejemplo de archivo de configuración:

```
center_x = 15.4
center_y = 53.2
center_z = 16.8
size_x = 20.0
size_y = 20.0
size_z = 20.0
exhaustiveness = 8
num_modes = 9
energy_range = 3
```

## Paso 3: Iniciar el Docking

1. Una vez que hayas cargado los archivos necesarios, haz clic en el botón **Iniciar Docking**.
2. Verás una barra de progreso que indica que el proceso ha comenzado.
3. El tiempo de procesamiento varía según la complejidad de tus moléculas, pero generalmente toma entre 30 segundos y varios minutos.

> **Importante**: No cierres el navegador durante el proceso de docking, ya que la tarea se ejecuta en el servidor y los resultados se enviarán a tu navegador una vez completada.

## Paso 4: Visualización de Resultados

Una vez completado el docking, verás la sección de resultados con dos paneles principales:

### Panel de Energías de Afinidad

Este panel muestra una tabla con los resultados de todas las poses generadas durante el docking:

- **Modo**: Número de la pose, ordenado por energía de afinidad.
- **Afinidad (kcal/mol)**: Energía de unión estimada. Valores más negativos indican unión más fuerte.
- **RMSD**: Desviación respecto a la mejor pose (en Å).
- **Acciones**: Botones para visualizar cada pose específica.

### Panel de Visualización 3D

Este panel muestra una representación 3D interactiva de la mejor pose del ligando en el sitio de unión:

- Puedes rotar, hacer zoom y pan utilizando el ratón.
- El ligando se muestra en modo "bastones" con colores por elemento.
- El receptor no se muestra por defecto para mayor claridad, pero puede visualizarse en el modo de vista detallada.

### Botones de Acción

- **Descargar Resultados**: Permite descargar el archivo PDBQT con todas las poses generadas.
- **Vista Detallada**: Abre un modal con opciones avanzadas de visualización.

## Paso 5: Análisis Detallado

Al hacer clic en **Vista Detallada**, se abrirá un modal con más opciones:

### Pestañas

- **Vista 3D**: Visualización avanzada con múltiples modos de representación.
- **Interacciones**: Análisis de las interacciones proteína-ligando.

### Controles de Visualización

En la pestaña **Vista 3D**, tienes varias opciones de representación:

- **Bastones**: Visualización tipo stick, útil para ver la estructura.
- **Esferas**: Visualización espacial que muestra el volumen ocupado.
- **Superficie**: Muestra la superficie molecular.
- **Cartoon**: Útil cuando se incluye la proteína para ver su estructura secundaria.

### Análisis de Interacciones

En la pestaña **Interacciones**, puedes ver:

- Lista de interacciones detectadas (enlaces de hidrógeno, hidrofóbicas, etc.)
- Visualización 3D de las interacciones
- Detalles sobre residuos involucrados, distancias y energías estimadas

### Opciones de Descarga

Desde el modal de vista detallada, puedes:

- Descargar el resultado en formato PDBQT
- Descargar el resultado convertido a PDB
- Capturar y descargar una imagen de la visualización actual

## Interpretación de Resultados

### Energía de Unión

La energía de unión (afinidad) estimada por AutoDock Vina se expresa en kcal/mol. Como referencia aproximada:

| Energía (kcal/mol) | Interpretación |
|--------------------|----------------|
| 0 a -4.0 | Unión débil o no significativa |
| -4.0 a -6.0 | Unión moderada |
| -6.0 a -8.0 | Unión buena |
| -8.0 a -10.0 | Unión muy buena |
| -10.0 a -12.0 | Unión excelente |
| Menor a -12.0 | Unión excepcionalmente fuerte (verificar posibles artefactos) |

> **Importante**: Estos valores son aproximados y deben interpretarse en el contexto de tu sistema específico.

### RMSD

El RMSD (Root Mean Square Deviation) indica la diferencia estructural entre poses:

- **RMSD lower bound (lb)**: Valor mínimo de RMSD considerando sólo átomos equivalentes.
- **RMSD upper bound (ub)**: Valor máximo de RMSD tras la mejor superposición posible.

Poses con RMSD < 2Å generalmente se consideran pertenecientes al mismo modo de unión.

### Interacciones

Las interacciones detectadas te dan información sobre cómo el ligando se une al receptor:

- **Enlaces de hidrógeno**: Fundamentales para la especificidad. Distancias típicas: 2.5-3.5 Å.
- **Interacciones hidrofóbicas**: Contribuyen significativamente a la energía de unión.
- **Interacciones π-π**: Entre anillos aromáticos, importantes para la estabilidad. Distancias típicas: 3.5-4.5 Å.
- **Puentes salinos**: Interacciones electrostáticas entre grupos con cargas opuestas. Distancias típicas: 2.8-4.0 Å.
- **Enlaces halógeno**: Interacciones entre halógenos y grupos electronegativos. Distancias típicas: 3.0-4.0 Å.

## Consejos Prácticos

### Mejorar la Precisión del Docking

1. **Conocer el sitio activo**: Si conoces la ubicación del sitio activo o de unión, proporciona coordenadas precisas en el archivo de configuración.
2. **Ajustar parámetros de exhaustividad**: Aumenta el valor de `exhaustiveness` (8-32) para búsquedas más completas en casos críticos.
3. **Tamaño apropiado de la caja**: Define una caja lo suficientemente grande para acomodar el ligando, pero no excesivamente amplia.
4. **Validación**: Cuando sea posible, valida tu protocolo mediante re-docking de ligandos conocidos.

### Cuándo Desconfiar de los Resultados

Debes ser cauteloso si observas:

- Energías de unión extremadamente bajas (< -15 kcal/mol)
- Poses que no forman interacciones con residuos clave conocidos
- Gran dispersión en las poses (poca convergencia)
- Poses con conformaciones ligando muy tensionadas o poco realistas

### Exportación e Integración con Otros Programas

Los resultados descargados son compatibles con:

- **PyMOL**: Importa directamente archivos PDBQT o PDB
- **VMD**: Admite archivos PDB
- **Chimera/ChimeraX**: Admite archivos PDB
- **Discovery Studio**: Prefiere archivos PDB

## Limitaciones Actuales

- La aplicación trata el receptor como rígido
- No admite docking con flexibilidad de cadenas laterales
- Limitaciones en el tamaño de los archivos (máximo 16MB)
- No incluye optimización posterior por dinámica molecular

## Siguientes Pasos

Para análisis más avanzados, considera:

1. **Validación**: Compara los resultados con datos experimentales cuando sea posible
2. **Refinamiento**: Refina las poses obtenidas mediante dinámica molecular
3. **Rescoring**: Aplica métodos de puntuación más precisos como MM-GBSA o FEP
4. **Análisis SAR**: Relaciona los resultados con datos de relación estructura-actividad

Para información más detallada, consulta la sección educativa de DayhoffDock o los tutoriales prácticos.
