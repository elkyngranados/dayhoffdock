# Visualización e Interpretación de Resultados

Este documento proporciona información detallada sobre cómo visualizar, interpretar y analizar los resultados de docking obtenidos con DayhoffDock.

## Componentes de Visualización

DayhoffDock incorpora un sistema de visualización molecular avanzado basado en NGL Viewer, que permite examinar interactivamente los resultados del docking en 3D directamente en el navegador.

### Visor Principal

El visor principal aparece automáticamente en la sección de resultados una vez completado el proceso de docking. Características principales:

- Visualización 3D interactiva utilizando WebGL
- Controles de navegación:
  - **Rotación**: Clic y arrastrar con el botón izquierdo del ratón
  - **Traslación**: Clic y arrastrar con el botón derecho del ratón
  - **Zoom**: Rueda del ratón o gesto de pinza en dispositivos táctiles
- Visualización por defecto del ligando en modo "licorice" (bastones) con colores por elemento:
  - Carbono: gris
  - Oxígeno: rojo
  - Nitrógeno: azul
  - Azufre: amarillo
  - Hidrógeno: blanco (generalmente no se muestra)
  - Halógenos: verde (cloro), marrón (bromo), púrpura (yodo)

### Modal de Visualización Detallada

Para un análisis más profundo, DayhoffDock ofrece un modal de visualización detallada que se activa con el botón "Vista Detallada". Este modal contiene:

#### Pestaña Vista 3D

- **Opciones de representación molecular**:
  - **Bastones (Licorice)**: Representación de enlaces como cilindros, útil para ver la estructura química detallada.
  - **Esferas (Spacefill)**: Representación de átomos como esferas con sus radios de van der Waals, útil para visualizar el volumen ocupado.
  - **Superficie**: Representación de la superficie molecular, útil para visualizar bolsillos y cavidades.
  - **Cartoon**: Representación de la estructura secundaria de proteínas, útil cuando se visualiza el receptor.

- **Controles adicionales**:
  - Botones para alternar la visibilidad de diferentes componentes
  - Opción para mostrar/ocultar el receptor (si está disponible)
  - Botón para centrar la vista en el ligando

#### Pestaña Interacciones

- **Lista de interacciones detectadas**:
  - Tipo de interacción (enlace de hidrógeno, hidrofóbica, π-π, etc.)
  - Residuos involucrados
  - Distancias de interacción
  - Energías estimadas para cada interacción

- **Visor de interacciones**:
  - Visualización especializada que resalta las interacciones detectadas
  - Etiquetas para los residuos clave
  - Representación gráfica de enlaces de hidrógeno, contactos hidrofóbicos, etc.

## Navegación por los Resultados

### Tabla de Resultados

La tabla de resultados muestra todas las poses generadas por AutoDock Vina, ordenadas por energía de unión (de más favorable a menos favorable):

| Modo | Afinidad (kcal/mol) | RMSD (Å) | Acciones |
|------|---------------------|----------|----------|
| 1    | -8.7                | 0.000    | Ver      |
| 2    | -8.5                | 1.642    | Ver      |
| 3    | -8.3                | 1.705    | Ver      |
| ...  | ...                 | ...      | ...      |

- **Modo**: Identificador numérico de la pose, ordenado por energía.
- **Afinidad**: Energía libre de unión estimada en kcal/mol. Valores más negativos indican mayor afinidad.
- **RMSD**: Desviación con respecto a la mejor pose (modo 1).
  - La columna muestra un rango RMSD_lb - RMSD_ub cuando se pasa el cursor sobre ella.
  - RMSD_lb (lower bound): Calculado considerando sólo los átomos equivalentes en la misma posición.
  - RMSD_ub (upper bound): Calculado tras la mejor superposición posible.
- **Acciones**: Contiene el botón "Ver" para visualizar la pose correspondiente.

### Cambio de Poses

Para explorar diferentes poses de docking:

1. Haz clic en el botón "Ver" junto a la pose que deseas visualizar en la tabla de resultados.
2. El visor 3D se actualizará para mostrar la nueva pose.
3. Puedes alternar entre diferentes poses para comparar los modos de unión.

> **Consejo**: El análisis de múltiples poses es importante para evaluar la consistencia del docking. Poses con valores de RMSD < 2.0 Å generalmente representan el mismo modo de unión.

## Análisis de Interacciones

DayhoffDock proporciona un análisis automático de las interacciones entre el ligando y el receptor, que se muestra en la pestaña "Interacciones" del modal de visualización detallada.

### Tipos de Interacciones Detectadas

#### 1. Enlaces de hidrógeno

- **Definición**: Interacción entre un donante de hidrógeno y un aceptor electronegativo.
- **Representación**: Líneas punteadas en azul claro.
- **Criterios de detección**:
  - Distancia D-A ≤ 3.5 Å
  - Ángulo D-H...A ≥ 120°
  - Ángulo H...A-X ≥ 90° (si A está unido a X)
- **Relevancia**: Cruciales para la especificidad y orientación del ligando.

#### 2. Interacciones hidrofóbicas

- **Definición**: Asociación de grupos no polares.
- **Representación**: Superficies sombreadas en amarillo o naranja.
- **Criterios de detección**:
  - Distancia entre átomos de C ≤ 4.0 Å
  - Átomos no implicados en otras interacciones
  - No más de 1.0 Å de exposición al solvente
- **Relevancia**: Contribuyen significativamente a la energía de unión.

#### 3. Interacciones π-π (Pi-stacking)

- **Definición**: Interacción entre sistemas aromáticos.
- **Representación**: Líneas verdes o discos entre anillos aromáticos.
- **Criterios de detección**:
  - Distancia centroide-centroide ≤ 5.5 Å
  - Ángulo entre planos < 30° (paralelo) o > 60° (T-shaped)
- **Relevancia**: Importantes para la orientación de fragmentos aromáticos.

#### 4. Puentes salinos

- **Definición**: Interacción electrostática entre grupos con cargas opuestas.
- **Representación**: Líneas punteadas en rojo/azul.
- **Criterios de detección**:
  - Distancia centro-centro ≤ 5.5 Å
  - Grupos con cargas opuestas
  - Grupos ionizables a pH fisiológico
- **Relevancia**: Contribuyen significativamente a la especificidad y afinidad.

#### 5. Enlaces halógeno

- **Definición**: Interacción entre halógenos y grupos electronegativos.
- **Representación**: Líneas punteadas en verde claro.
- **Criterios de detección**:
  - Distancia X...Y ≤ 4.0 Å (X=halógeno, Y=aceptor)
  - Ángulo C-X...Y entre 150° y 180°
- **Relevancia**: Pueden ser importantes en el diseño de fármacos que contienen halógenos.

### Interpretación de la Lista de Interacciones

Cada interacción detectada se muestra con la siguiente información:

- **Tipo**: Clasificación de la interacción.
- **Residuo**: Aminoácido de la proteína involucrado.
- **Distancia**: Separación en Ångstroms entre los átomos o grupos interactuantes.
- **Energía**: Estimación aproximada de la contribución energética.
- **Átomos**: Identificadores de los átomos específicos involucrados.

> **Nota**: Las energías de interacciones individuales son aproximadas y no deben sumarse directamente para obtener la energía total de unión.

## Interpretación de Resultados

### Energía de Unión (Afinidad)

La energía de unión calculada por AutoDock Vina se expresa en kcal/mol y representa una estimación de la afinidad de unión entre el ligando y el receptor.

#### Guía general para interpretar valores de energía:

| Energía (kcal/mol) | Interpretación | Afinidad aproximada |
|--------------------|-----------------|--------------------|
| 0 a -4.0 | Unión débil | mM o peor |
| -4.0 a -6.0 | Unión moderada | µM alto |
| -6.0 a -8.0 | Unión buena | µM bajo |
| -8.0 a -10.0 | Unión muy buena | nM alto |
| -10.0 a -12.0 | Unión excelente | nM bajo |
| Menor a -12.0 | Unión excepcional | pM (verificar posibles artefactos) |

> **Importante**: Estos valores son aproximados y deben interpretarse en el contexto de tu sistema específico. La correlación con afinidades experimentales varía según el sistema.

### Análisis de RMSD

El RMSD (Root Mean Square Deviation) es una medida de la similitud estructural entre diferentes poses:

- **RMSD bajo (< 2.0 Å)**: Las poses son muy similares, representando esencialmente el mismo modo de unión.
- **RMSD medio (2.0-4.0 Å)**: Modo de unión similar pero con diferencias significativas.
- **RMSD alto (> 4.0 Å)**: Modos de unión sustancialmente diferentes.

El análisis de RMSD puede revelar:

1. **Convergencia del docking**: Muchas poses con RMSD bajo indican buena convergencia hacia un modo de unión preferido.
2. **Modos alternativos**: Grupos de poses con RMSD alto entre ellos pueden indicar modos de unión alternativos.
3. **Incertidumbre**: Gran dispersión de poses puede indicar un sitio de unión poco definido o problemas con el proceso de docking.

### Análisis Visual

El análisis visual complementa los datos numéricos y puede revelar aspectos importantes:

1. **Complementariedad**: ¿El ligando encaja bien en el sitio de unión?
2. **Interacciones clave**: ¿Forma interacciones con residuos críticos conocidos?
3. **Exposición al solvente**: ¿Los grupos polares están expuestos al solvente y los hidrofóbicos enterrados?
4. **Conformación del ligando**: ¿La pose presenta tensiones conformacionales evidentes?
5. **Saturación de interacciones**: ¿Todos los donantes y aceptores de enlaces de hidrógeno están satisfechos?

## Exportación y Uso Posterior de los Resultados

DayhoffDock ofrece varias opciones para exportar los resultados para análisis adicional:

### Opciones de Descarga

- **Descargar PDBQT**: Archivo PDBQT que contiene todas las poses generadas.
- **Descargar PDB**: Conversión a formato PDB de la pose actualmente visualizada.
- **Descargar Imagen**: Captura de pantalla de la visualización actual.

### Uso en Otros Programas

Los archivos exportados pueden utilizarse en varios programas:

#### PyMOL

```bash
# Para archivos PDB
pymol resultado.pdb

# Para archivos PDBQT (requiere plugin)
pymol resultado.pdbqt
```

#### UCSF Chimera/ChimeraX

```bash
# Para archivos PDB
chimera resultado.pdb

# Para archivos PDBQT
chimera resultado.pdbqt
```

#### VMD

```bash
# Para archivos PDB
vmd -m resultado.pdb

# Para archivos PDBQT (puede requerir conversión)
vmd -m resultado.pdb
```

### Análisis Posterior Recomendado

Para estudios que requieren mayor precisión:

1. **Dinámica molecular**: Refina las poses de docking y evalúa su estabilidad en el tiempo.
   ```bash
   # Ejemplo con GROMACS (requiere preparación adicional)
   gmx grompp -f md.mdp -c complejo.gro -p topol.top -o md.tpr
   gmx mdrun -deffnm md
   ```

2. **Cálculos MM-GBSA/MM-PBSA**: Estimaciones más rigurosas de energía libre.
   ```bash
   # Ejemplo con AmberTools (requiere preparación)
   MMPBSA.py -i mmpbsa.in -o FINAL_RESULTS_MMPBSA.dat -sp receptor.prmtop -cp complejo.prmtop -lp ligando.prmtop -y trayectoria.nc
   ```

3. **Rescoring con funciones alternativas**: Aplica diferentes funciones de puntuación para evaluación cruzada.

## Consejos para el Análisis

1. **Combina datos numéricos y visuales**: No te bases solo en los valores de energía; inspecciona visualmente las poses.

2. **Compara con datos experimentales**: Cuando sea posible, valida con estructuras cristalográficas o datos SAR.

3. **Considera múltiples poses**: La mejor pose según la energía calculada no siempre es la correcta biológicamente.

4. **Evalúa residuos clave**: ¿La pose interactúa con residuos identificados como importantes por estudios experimentales?

5. **Sé crítico**: Las herramientas de docking tienen limitaciones inherentes. Trata los resultados como hipótesis que requieren validación.

6. **Contextualiza las energías**: Compara las energías de unión relativas entre compuestos similares en lugar de enfocarte solo en valores absolutos.

7. **Analiza patrones de interacción**: Busca patrones recurrentes en las interacciones a través de múltiples poses o compuestos.

## Interpretación de Casos Específicos

### Caso 1: Múltiples Modos de Unión

Si observas grupos distintos de poses con RMSD alto entre ellos pero bajo dentro de cada grupo:

- Puede indicar la existencia de múltiples sitios de unión o modos alternativos en el mismo sitio
- Compara las energías de unión entre estos grupos
- Analiza qué residuos interactúan con cada modo
- Considera factores que podrían favorecer un modo sobre otro in vivo

### Caso 2: Baja Convergencia

Si las poses están muy dispersas con RMSD alto entre todas ellas:

- Puede indicar un sitio de unión poco definido
- El espacio de búsqueda puede ser demasiado grande
- La función de puntuación puede tener dificultades con ese sistema específico
- Considera aumentar la exhaustividad o reducir el tamaño de la caja

### Caso 3: Energías Inusualmente Favorables

Si observas energías muy negativas (< -12 kcal/mol):

- Examina cuidadosamente las interacciones en busca de posibles artefactos
- Verifica si hay superposiciones incorrectas o geometrías poco realistas
- Compara con valores típicos para sistemas similares
- Considera aplicar métodos de puntuación alternativos

### Caso 4: Discrepancia con Datos Experimentales

Si el docking no reproduce una pose cristalográfica conocida:

- Verifica la preparación de la proteína y el ligando
- Examina si hay moléculas de agua importantes que se hayan eliminado
- Considera la flexibilidad de la proteína (el docking rígido tiene limitaciones)
- Prueba diferentes parámetros o programas alternativos

## Ejemplo de Análisis Completo

A continuación se muestra un ejemplo de análisis completo para un resultado de docking:

### Datos Numéricos

Los resultados del docking muestran:
- Mejor energía de unión: -9.2 kcal/mol (Modo 1)
- Segunda mejor: -8.7 kcal/mol (Modo 2, RMSD 2.1 Å del Modo 1)
- Otras poses: -8.4 a -7.2 kcal/mol (Modos 3-9)
- Buena convergencia: Modos 1-3 tienen RMSD < 2.5 Å entre ellos

### Análisis de Interacciones

La mejor pose muestra:
- Enlaces de hidrógeno con Asp25, Gly27 y Asp29
- Interacción hidrofóbica con Val82 y Ile84
- Interacciones π-π con Phe153
- Buena complementariedad con el bolsillo S1

### Contexto Biológico

- Los residuos Asp25 y Gly27 son conocidos por ser esenciales para la actividad
- La interacción con Val82 coincide con datos de SAR de compuestos similares
- La energía estimada (-9.2 kcal/mol) es consistente con la afinidad experimental (nM bajo)

### Conclusiones

- Alta confianza en el modo de unión predicho
- Pose estable con interacciones favorables
- Coincide con datos experimentales disponibles
- Posibles optimizaciones: reforzar interacción con Asp29, explorar bolsillo S2 adyacente

### Pasos Siguientes Recomendados

- Validación por dinámica molecular (10-100 ns)
- Cálculos MM-GBSA para estimaciones más precisas de energía
- Diseño de análogos para probar la importancia de las interacciones clave

## Recursos Adicionales

Para profundizar en la interpretación de resultados de docking, consulta estos recursos:

1. La sección educativa de DayhoffDock incluye información detallada sobre interacciones moleculares y limitaciones del docking.

2. Tutoriales específicos para diferentes casos de uso están disponibles en la sección de tutoriales.

3. Para dudas específicas o asistencia con interpretación de resultados complejos, contacta al equipo de DayhoffDock a través del repositorio del proyecto.
