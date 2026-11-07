# Alpha 0.16 · Optimización de INEGI y auditoría de centrales

**NEXUS ENERGY · TE1020 · Noviembre de 2026**

## 1. Qué está confirmado

El propietario ejecutó `npm run audit:mapas` sobre el archivo original INEGI en su computadora. Resultado compartido:

- 32 entidades y 32 nombres únicos.
- 398 polígonos (32 entidades multipartes), 400 anillos y 1,014,750 vértices revisados.
- 27.50 MiB; lon [-118.36526, -86.71041], lat [14.53210, 32.71865].
- Verificación estructural correcta y pruebas visuales de Leaflet correctas en los tres módulos, según reporte del propietario.

El archivo original fue descargado **por el usuario en su computadora**, no está incluido en este ZIP porque el entorno de construcción no logró acceder al servicio. Su nombre `inegi_estados_2025.geojson` proviene de la convención de la versión anterior; **el año exacto de actualización de las geometrías servidas dinámicamente no se ha comprobado**. No se debe citar diciembre de 2025 como fecha de corte automáticamente.

Fuente primaria: [INEGI, Servicio Web del Catálogo Único de Claves Geoestadísticas](https://www.inegi.org.mx/servicios/catalogounico/), consulta vectorial [Áreas Geoestadísticas Estatales](https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgee/).

## 2. La copia optimizada

### Objetivo

Disminuir el costo de descarga, parsing y dibujo de más de un millón de puntos al representar México completo en un navegador. **No es una sustitución del documento oficial**.

### Procedimiento

1. Colocar el archivo INEGI descargado en `data/inegi_estados_2025.geojson`.
2. Ejecutar `npm run optimize:estados` desde la raíz del proyecto.
3. Se validan el original y la copia. El script mantiene 32 entidades, polígonos y anillos; impone un error relativo máximo aproximado del 2 % del área planar de cada anillo y preserva el archivo original.
4. Produce `data/inegi_estados_web.geojson` y `docs/RESULTADOS_OPTIMIZACION_ESTADOS.txt` con pesos, vértices, tolerancia y sumas SHA-256.
5. El mapa intenta primero `inegi_estados_web.geojson`, luego el original local y, solo si no existen, el servicio remoto de INEGI. `npm run audit:mapas` coteja ambas capas.

### Limitación geométrica importante

Douglas–Peucker aplicado a anillos individuales **NO garantiza** que límites compartidos entre estados conserven una topología sin espacios, cruces o solapamientos. Por ello, el archivo simplificado se etiqueta como una **copia cartográfica para visualización nacional**. El error de área usado para decidir si se simplifica un anillo **no es un control de precisión geodésica ni jurídica**. No usar la copia para calcular áreas, jurisdicciones, líneas eléctricas o divisiones de CFE. El original permanece intacto.

La Alpha 0.16 contiene el **código y pruebas sintéticas** del optimizador; el valor real de compresión dependerá del archivo de 27.50 MiB generado por el usuario. No reportar un tamaño final antes de ejecutar el script sobre ese archivo.

## 3. Auditoría reproducible de la generación

Comando: `npm run audit:centrales`. Deja el resultado en `docs/RESULTADOS_AUDITORIA_CENTRALES.txt`.

**PRODESEN 2024–2038, anexo 1, cuadro A1.9, inventario correspondiente a 2023:**

- 31 centrales documentadas, 18 entidades, 6 tecnologías diferenciadas.
- Solo una capacidad instalada individual explícita en el catálogo *seleccionado para esta aplicación*.
- Cero pares de coordenadas individuales en `data/generation.json`.
- Se comprueban tecnologías y entidades de ese catálogo, **no se generan puntos para Leaflet**.

**CANIE/NACEI, agosto de 2017:**

- Capa ArcGIS 15: centrales >=100 MW; capa 28: renovables >=1 MW.
- Los registros pueden ofrecer `Facility`, `StateProv`, `PrimSource`, `Total_MW`, `Latitude` y `Longitude`.
- El frontend cuenta **sobre los registros realmente cargados** cuántas centrales tienen coordenadas válidas, en cuántas entidades están y cuántas tienen MW publicados.
- `PrimSource` describe una **fuente energética**, no la tecnología de la instalación: gas natural no prueba ciclo combinado; solar sin especificar no prueba fotovoltaica. Algunas denominaciones identifican familias como hidroeléctrica, eólica, geotérmica y nuclear, pero no certifican por sí solas un expediente tecnológico individual.
- Las dos capas CANIE se auditan **por separado**, sin sumar indiscriminadamente registros que pudieran repetirse.

El script señala `PENDIENTE CANIE` cuando no hay snapshots verificados en el proyecto. Para obtenerlos con Internet: `npm run sync:geo`, luego `npm run audit:centrales`. La herramienta no convierte la captura de 2017 en un inventario de 2024 o 2026.

Fuentes: [CANIE/NACEI ≥100 MW](https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer/15), [CANIE/NACEI renovables](https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer/28), [PRODESEN 2024–2038 Anexo 1](https://base.energia.gob.mx/PRODESEN2024/prodesen24-38A1.PDF).

## 4. Fuentes de posible ampliación, pero aún NO integradas como geometrías

- **CNE, permisos de generación (2026):** [documentación oficial](https://www.gob.mx/cne/documentos/estadisticas-e-informacion-en-materia-de-permisos-de-electricidad). Un registro de permisos incluye campos de tecnología, entidad y municipio, pero **no puede tratarse como ubicación puntual confirmada** ni como potencia actual en operación sin conciliación.
- **CENACE, información de red:** [mapa del sitio institucional](https://www.cenace.gob.mx/MapaSitio.aspx), que enlaza secciones sobre topología de red y documentación. No se identificó en el trabajo de esta iteración un GeoJSON o SHP verificable de libre publicación con los cuatro sistemas y sus trayectorias precisas.
- **CFE Distribución:** el mapa oficial de las 16 divisiones del Informe Anual 2022 permanece como imagen de referencia; no equivale a un vector GIS. Sus nueve instalaciones verificadas de Golfo Centro permanecen como puntos, no como límites divisionales.

## 5. Estado de cumplimiento cartográfico

| Módulo | Geometría en Leaflet | Datos documentados | Por resolver |
|---|---|---|---|
| Generación | Marcadores CANIE 2017, si carga el servicio/snapshot | Nombres, coordenadas y MW históricos; 31 centrales PRODESEN 2023 como tabla independiente | Verificar mínimos sobre captura real; disponer de potencia y tecnología actuales para **los mismos puntos** si la actividad lo exige |
| Transmisión | Nueve referencias de ciudades sede de gerencias 2017, límites estatales INEGI | Cuatro sistemas con cifras separadas, indicadores regionales | Polígonos de sistemas y trazados oficiales de líneas |
| Distribución | Nueve almacenes CFE Golfo Centro 2026, límites estatales INEGI | 16 divisiones con estadística 2022, mapa institucional local | Límites vectoriales de 16 divisiones y ubicaciones verificables adicionales |

**Importante:** las pruebas visuales del usuario confirman la capa original INEGI. La copia optimizada requiere una prueba visual adicional después de ejecutarse localmente.
