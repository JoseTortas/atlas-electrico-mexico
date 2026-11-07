# Inventario geográfico de centrales: fuente, método y límites

**Corte de la fuente: agosto 2017. Aplicación Alpha 0.7, noviembre 2026.**

## 1. Fuente seleccionada

La Secretaría de Energía (México) participa en la Cooperación de América del Norte en Información Energética (CANIE/NACEI) con Natural Resources Canada y el Departamento de Energía de EE.UU. El portal oficial de SENER lista las centrales de 100 MW o más y las renovables de 1 MW o más. Natural Resources Canada mantiene un servicio ArcGIS REST de estas capas.

- SENER: https://base.energia.gob.mx/nacei/mapas_infraestructura_energetica.aspx
- Catálogo ≥100 MW, capa **15**: https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer/15
- Catálogo renovable ≥1 MW, capa **28**: https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer/28
- Registro oficial del dataset: https://open.canada.ca/data/en/dataset/40fbe40c-01cd-49d3-8add-0d20ed64c90d
- Registro renovable: https://open.canada.ca/data/en/dataset/490db619-ab58-4a2a-a245-2376ce1840de

Las capas publican atributos: `OBJECTID`, `Country`, `Facility`, `Owner`, `City`, `StateProv`, `Latitude`, `Longitude`, `Total_MW`, `PrimSource`, `PrimRenew`, `Period`. ArcGIS indica referencia espacial **EPSG:4326**, geometría puntual, formato JSON/GeoJSON, consulta avanzada y paginación. La licencia del servicio permite uso con atribución.

## 2. Tratamiento técnico

El código `js/nacei.js` consulta `Country = 'Mexico'` mediante ArcGIS REST y solicita coordenadas y atributos originales por lotes. Luego verifica país México, valores finitos, intervalo geográfico de control de errores, capacidad en MW no negativa y nombre no vacío. Evita duplicados por identificador oficial. **No infiere** coordenadas desde municipio, estado, nombre o geocodificación automática. Los puntos de un archivo local deben proceder de la misma normalización.

Al entrar en Generación, `js/nacei-ui.js` usa un archivo local `data/nacei_2017_<capa>.json` si existe y es válido; de otra manera consulta el servicio. Permite filtros, popups y exportación de subconjuntos. La suma de MW se identifica como suma de *registros con capacidad disponible*; no se presenta como potencia total de México.

Si la consulta de atributos falla, el mapa intenta mostrar un servicio WMS oficial de las mismas capas. WMS renderiza puntos en imagen, pero NO provee registros para filtrar o hacer una estadística por central. Se muestra la limitación de forma explícita.

`scripts/sincronizar-canie.mjs` se incluye para que los registros oficiales se puedan guardar en el proyecto y minimizar dependencias externas en la entrega final. La sincronización no se ha ejecutado con red exitosa en este entorno, por lo que **no se ha creado aquí un inventario local que se haga pasar por verificado**.

## 3. Límites de interpretación

- Publicación de **2017**. No sirve por sí sola para certificar potencia, tecnología u operación **2023/2024/2026**.
- `PrimSource` representa **fuente energética primaria** y no equivale a tecnología de generación (por ejemplo, ciclo combinado).
- No unir automáticamente registros CANIE de 2017 con el catálogo PRODESEN (corte 2023). Requeriría conciliación de instalaciones, identificadores, fechas, cambio de nombre y diferencias de potencia.
- Una misma central puede aparecer en los dos catálogos (≥100 MW y renovable ≥1 MW); se presentan como **capas alternativas**, sin sumar ambas.
- Las 31 centrales listadas en PRODESEN 2023 no reciben puntos sintetizados.

## 4. Para completar el inventario actual

CENACE, en respuesta oficial de transparencia de 2024, remite a CRE para la consulta de información de coordenadas, permisos y tecnologías: https://www.cenace.gob.mx/Docs/Transparencia/RespuestaSolicitud/331002624000135.pdf . Verificar vigencia y correlación permiso/operación antes de tomar capacidades o puntos como datos observados.

Siguen pendientes trazados oficiales de la Red Nacional de Transmisión y polígonos de las 16 divisiones territoriales de CFE Distribución. No dibujarlos con rutas o bordes inventados.
