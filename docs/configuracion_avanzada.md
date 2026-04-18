# Configuración Avanzada de DayhoffDock

Este documento describe las opciones avanzadas de configuración para DayhoffDock, que permiten personalizar y optimizar los procesos de docking molecular según las necesidades específicas de cada proyecto.

## Archivo de Configuración

El archivo de configuración es un archivo de texto plano que permite definir parámetros específicos para AutoDock Vina. DayhoffDock utiliza estos parámetros para controlar el proceso de docking.

### Parámetros Básicos

```
receptor = receptor.pdbqt    # Nombre del archivo receptor (opcional, se puede omitir)
ligand = ligando.pdbqt       # Nombre del archivo ligando (opcional, se puede omitir)
out = resultado.pdbqt        # Nombre del archivo de salida (opcional)

# Centro de la caja de búsqueda (obligatorio si se usa un archivo de configuración)
center_x = 15.4
center_y = 53.2
center_z = 16.8

# Dimensiones de la caja en Ångstroms (obligatorio si se usa un archivo de configuración)
size_x = 20.0
size_y = 20.0
size_z = 20.0
```

### Parámetros Avanzados

```
# Controla la exhaustividad de la búsqueda (valor por defecto: 8)
exhaustiveness = 16

# Número máximo de modos de unión (poses) a generar (valor por defecto: 9)
num_modes = 15

# Rango de energía máximo entre el mejor y peor modo en kcal/mol (valor por defecto: 3)
energy_range = 4

# Seed para generador de números aleatorios (por defecto: genera automáticamente)
seed = 42

# Realizar optimización local (valor por defecto: yes)
local_only = no

# Número de CPUs a utilizar (valor por defecto: todos los disponibles)
cpu = 4
```

## Explicación Detallada de los Parámetros

### Parámetros de la Caja de Búsqueda

La caja de búsqueda define el espacio donde se buscará la mejor posición del ligando:

- **center_x, center_y, center_z**: Define el centro de la caja de búsqueda en coordenadas cartesianas (Å).
  - *Recomendación*: Centra la caja en el sitio activo conocido o en el ligando cristalográfico.

- **size_x, size_y, size_z**: Define las dimensiones de la caja en cada eje (Å).
  - *Recomendación*: La caja debe ser lo suficientemente grande para permitir la rotación del ligando (típicamente 20-30Å para moléculas pequeñas).

### Parámetros de Búsqueda

- **exhaustiveness**: Controla la exhaustividad de la búsqueda.
  - *Valor por defecto*: 8
  - *Recomendación*: 
    - Estudios preliminares o screening: 8
    - Estudios detallados: 16-32
    - Sistemas complejos o críticos: 32-64
  - *Impacto*: A mayor valor, mejor exploración del espacio conformacional, pero mayor tiempo de cálculo (relación aproximadamente lineal).

- **num_modes**: Número máximo de poses a generar.
  - *Valor por defecto*: 9
  - *Recomendación*: 
    - Estudios preliminares: 9-10
    - Análisis detallado: 15-20
  - *Impacto*: Afecta la diversidad de resultados, útil para identificar diferentes modos de unión potenciales.

- **energy_range**: Ventana de energía para filtrar resultados (kcal/mol).
  - *Valor por defecto*: 3
  - *Recomendación*: 
    - 3-4 para la mayoría de aplicaciones
    - 5-6 para explorar modos alternativos
  - *Impacto*: Solo se reportan poses con energía dentro de este rango respecto al mejor resultado.

- **seed**: Semilla para el generador de números aleatorios.
  - *Valor por defecto*: Generado automáticamente
  - *Recomendación*: 
    - Usar un valor fijo para reproducibilidad
    - Ejecutar múltiples veces con diferentes semillas para evaluar consistencia
  - *Impacto*: Afecta el punto de inicio de la búsqueda aleatoria.

- **local_only**: Realizar solo optimización local.
  - *Valor por defecto*: no
  - *Recomendación*: Mantener en "no" salvo que se tenga una buena pose inicial
  - *Impacto*: "yes" restringe la búsqueda a optimización local alrededor de la posición inicial.

- **cpu**: Número de CPUs a utilizar.
  - *Valor por defecto*: Todos los disponibles
  - *Recomendación*: Ajustar según los recursos del sistema
  - *Impacto*: A más CPUs, mayor velocidad de cálculo.

## Configuración de la Caja de Búsqueda

La configuración correcta de la caja de búsqueda es crucial para obtener resultados relevantes:

### Métodos para Determinar el Centro de la Caja

1. **A partir de un ligando co-cristalizado**:
   ```bash
   # Utilizando PyMOL
   center_of_mass ligand_cocristallizado
   
   # Resultado ejemplo:
   # Center: (15.32, 53.41, 16.95)
   ```

2. **A partir de residuos del sitio activo**:
   ```bash
   # Utilizando PyMOL
   center_of_mass resid 102+154+156+189
   ```

3. **A partir de información estructural publicada**: Consultar literatura científica que describa el sitio activo.

### Determinación del Tamaño de la Caja

1. **Método basado en el ligando**:
   - Mide las dimensiones máximas del ligando
   - Añade 10Å en cada dirección para permitir rotación y traslación

2. **Método basado en el sitio activo**:
   - Selecciona todos los residuos dentro de 5Å del ligando conocido
   - Mide las dimensiones de esta selección
   - Añade 5-10Å adicionales

3. **Recomendaciones generales**:
   - Ligandos pequeños: caja de 20×20×20Å
   - Ligandos medianos: caja de 25×25×25Å
   - Péptidos o ligandos grandes: caja de 30×30×30Å o mayor

> **Importante**: Una caja demasiado grande reduce la eficiencia y precisión de la búsqueda, mientras que una caja demasiado pequeña puede restringir artificialmente las conformaciones exploradas.

## Configuración para Casos Específicos

### Docking en Sitios Poco Definidos

Si no conoces el sitio exacto de unión:

```
# Centro aproximado de la proteína
center_x = 0.0
center_y = 0.0
center_z = 0.0

# Caja grande para explorar toda la superficie
size_x = 40.0
size_y = 40.0
size_z = 40.0

# Mayor exhaustividad para compensar el espacio más grande
exhaustiveness = 24

# Más poses para capturar diferentes sitios potenciales
num_modes = 20
```

### Docking para Screening Virtual

Para evaluar rápidamente muchos compuestos:

```
# Parámetros de alta velocidad para screening
exhaustiveness = 8
num_modes = 5
energy_range = 3
```

### Docking de Alta Precisión

Para estudios detallados de un número limitado de compuestos:

```
# Parámetros para máxima precisión
exhaustiveness = 32
num_modes = 20
energy_range = 5
```

## Preparación de Múltiples Configuraciones

Para estudios sistemáticos, puede ser útil preparar múltiples archivos de configuración. Ejemplo de script bash para generar múltiples configuraciones:

```bash
#!/bin/bash
# Genera configuraciones para diferentes centros de caja

# Coordenadas base del centro
BASE_X=15.4
BASE_Y=53.2
BASE_Z=16.8

# Dimensiones de la caja
SIZE=20.0

# Parámetros comunes
EXHAUST=16
MODES=10
ENERGY=4

# Genera desplazamientos en diferentes direcciones
for DX in -5 0 5; do
  for DY in -5 0 5; do
    for DZ in -5 0 5; do
      # Calcula nuevas coordenadas
      X=$(echo "$BASE_X + $DX" | bc)
      Y=$(echo "$BASE_Y + $DY" | bc)
      Z=$(echo "$BASE_Z + $DZ" | bc)
      
      # Nombre del archivo
      FILENAME="config_${X}_${Y}_${Z}.txt"
      
      # Genera el archivo de configuración
      cat > $FILENAME << EOF
center_x = $X
center_y = $Y
center_z = $Z
size_x = $SIZE
size_y = $SIZE
size_z = $SIZE
exhaustiveness = $EXHAUST
num_modes = $MODES
energy_range = $ENERGY
EOF
      
      echo "Generado archivo $FILENAME"
    done
  done
done
```

## Uso en la Interfaz de DayhoffDock

Para utilizar un archivo de configuración personalizado en DayhoffDock:

1. Crea el archivo de texto con los parámetros deseados
2. En la interfaz de DayhoffDock, sube el archivo en la caja de "Configuración"
3. Los parámetros de este archivo tendrán preferencia sobre los valores por defecto

> **Nota**: Si no especificas un archivo de configuración, DayhoffDock utilizará configuración por defecto centrada en (0,0,0) con un tamaño de 20Å×20Å×20Å y exhaustividad de 8.

## Ejemplos de Archivos de Configuración

### Ejemplo 1: Configuración Estándar para Inhibidor de Quinasa

```
# Configuración para docking EGFR-Gefitinib
center_x = 15.32
center_y = 53.41
center_z = 16.95
size_x = 20.0
size_y = 20.0
size_z = 20.0
exhaustiveness = 16
num_modes = 10
energy_range = 3
```

### Ejemplo 2: Configuración para Docking de Alta Precisión

```
# Configuración de alta precisión
center_x = 15.32
center_y = 53.41
center_z = 16.95
size_x = 24.0
size_y = 24.0
size_z = 24.0
exhaustiveness = 32
num_modes = 20
energy_range = 5
seed = 42
cpu = 8
```

### Ejemplo 3: Configuración para Screening Virtual

```
# Configuración para screening rápido
center_x = 15.32
center_y = 53.41
center_z = 16.95
size_x = 18.0
size_y = 18.0
size_z = 18.0
exhaustiveness = 8
num_modes = 5
energy_range = 3
```

## Consideraciones Finales

- La selección de parámetros óptimos depende del sistema específico y los objetivos del estudio
- Para estudios rigurosos, se recomienda realizar un análisis de sensibilidad variando los parámetros
- Los tiempos de cálculo aumentan significativamente con valores altos de exhaustividad y tamaños grandes de caja
- Para moléculas muy grandes o sistemas complejos, considera dividir el problema en partes más manejables

Si necesitas ayuda para configuraciones específicas o problemas particulares, consulta la sección educativa de DayhoffDock o ponte en contacto con el equipo de desarrollo.
