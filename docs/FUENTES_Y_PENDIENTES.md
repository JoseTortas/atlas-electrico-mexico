# Evidencia territorial y ambiental pendiente

## Generación

**Disponible:** SENER, PRODESEN 2024–2038, Anexo 1, Cuadro A1.9 (31 plantas seleccionadas del inventario de 74); nombre, municipio, entidad, región de control y tecnología, corte 2023. CFE informa potencia de Laguna Verde: 1,608 MW en 2024.

**Actualizado en Alpha 0.7:** fuente oficial histórica CANIE/NACEI de agosto 2017 localizada, con las capas ArcGIS 15 (centrales ≥100 MW) y 28 (renovables ≥1 MW). La consulta se inicia automáticamente al abrir Generación, mediante el servicio ArcGIS histórico de 2017, con alternativa de snapshot local verificable y fallback visual WMS. La visualización de la capa en el navegador fue confirmada por el usuario en la Alpha 0.7; la disponibilidad futura del servidor externo no está garantizada. Ver `docs/CATALOGOS_GEOREFERENCIADOS.md`. No equiparar esos puntos/capacidades a las centrales PRODESEN de 2023 sin una validación de identidad y año.

**Para completar mapa de 15 o más plantas con capacidad actual comparable:** tabla o shapefile/GeoJSON oficial de centrales con identificador estable, nombre, coordenadas WGS84 (latitud/longitud), tecnología, capacidad instalada en MW, año de vigencia e institución/fuente. Validar cruces por nombre/id antes de colocar puntos. Una municipalidad o imagen de mapa no autoriza un punto preciso. Referencia para localizar mapas públicos: https://base.energia.gob.mx/nacei/mapas_infraestructura_energetica.aspx (SENER, datos históricos; verificar vigencia).

## Transmisión

**Disponible:** distinción entre SIN, SIBC, SIBCS y SIMUL de PRODESEN 2024–2038 (Anexo 1 p.155); líneas por tensión (Cuadro A1.1, p.156), bancos de transformación (Cuadro A1.2, p.157); CFE Informe 2024 longitudes 2022–2024. **Alpha 0.8:** pronóstico por 10 Gerencias de Control Regional 2024, 2030 y 2038, SENER Cuadro 3.7 p. 81, explícitamente proyección y con máximo no coincidente.

**Para mapa de infraestructura:** trazado oficial georreferenciado de la RNT con nivel de tensión, identificación del circuito y vigencia; polígonos oficiales de regiones de control o límites de sistemas. No aproximar conexiones ni representar como ruta real un diagrama unifilar.

## Distribución

**Disponible:** nombres oficiales 16 divisiones en Manual CFE (28 mayo de 2024), p.14; indicadores nacionales CFE Informe 2024 pp.95–97. **Alpha 0.8:** seis indicadores observados por cada una de las 16 divisiones, año 2022, extraídos de la Tabla III.1, pp. 8–9 del PAM RGD 2023–2037 de CFE. Sus seis sumatorias coinciden con los agregados oficiales.

**Para mapa de divisiones:** polígonos oficiales de CFE en GeoJSON/shapefile con nombre y vigencia; años posteriores comparables de indicadores regionales y pérdidas/continuidad específicas por división. No usar límites estatales como sustitutos.

## Recursos y emisiones

**Disponible parcialmente:** SENER PRODESEN 2023–2037, capítulo 4, p.59: generación nacional 2022 340,713 GWh; fósil 68.8 %, limpia 31.2 %. **Pendiente:** generación nacional por recurso/tecnología comparable para 2023–2024 con GWh y metodología; factores de emisión directos y de ciclo de vida documentados, con año, alcance y unidades de CO₂e/kWh. En ausencia de datos, mostrar “Dato no disponible”, no estimar.

## Reglas de integridad

1. Diferenciar dato observado, proyección y simulación.
2. No asignar a un elemento individual el agregado de una tecnología o división.
3. Validar EPSG/CRS geográfico antes de proyectar coordenadas con Leaflet.
4. Mantener archivo de origen, institución, año, fecha de corte y página/tablas.
5. Validar polígonos y líneas con herramientas GIS antes de publicarlos.
