# Cartografía y trazabilidad · Alpha 0.14

## Qué cambió

La aplicación incorpora **una capa opcional de límites geoestadísticos estatales de INEGI** a los mapas Leaflet de Generación, Transmisión y Distribución. La capa incluye polígonos oficiales del Marco Geoestadístico (metadatos del servicio: diciembre de 2025) y se obtiene de `https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgee/`.

**Importante:** los 32 polígonos son límites **estatales** y **no corresponden** a:
- los cuatro sistemas eléctricos de SENER/CENACE;
- las diez regiones de control de CENACE;
- las nueve gerencias históricas CFE Transmisión;
- las 16 divisiones de CFE Distribución;
- las líneas de transmisión o sus subestaciones.

El mapa usa `L.geoJSON` con contornos, sin rellenar superficies, para no tapar los marcadores de centrales ni centros de CFE. La consulta es **bajo demanda**, no se activa al abrir cada módulo.

## Fuente vectorial

- INEGI, [Servicio Web del Catálogo Único de Claves Geoestadísticas](https://www.inegi.org.mx/servicios/catalogounico/), apartado de geometrías estatales.
- Endpoint: `https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgee/`.
- INEGI, [Guía de consulta GeoJSON](https://www.inegi.org.mx/servicios/descargas/Consulta_info_vectorial.pdf), pp. 1–2.
- Estructura esperada: FeatureCollection con **32** polígonos o multipolígonos y nombres de entidades. El código valida geometría, cantidad, unicidad de nombres y un control geográfico básico.
- La respuesta total puede ser grande. Para no depender de CORS, el usuario puede guardar el archivo oficial localmente mediante `npm run sync:estados` y volver a comprobar la web.
- **Limitación de esta entrega:** la descarga completa al contenedor de desarrollo estuvo bloqueada por DNS; el ZIP no contiene un archivo GeoJSON estatal sin descargar. El navegador del usuario puede consultarlo directamente si el servicio permite CORS. La sincronización local en su computadora ofrece una alternativa independiente de CORS.

## Datos ya integrados en mapas

### 01 · Generación

- Capa CANIE/NACEI, agosto 2017, centrales ≥100 MW y renovables ≥1 MW. `https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer` (capas 15 y 28).
- Los puntos y sus MW proceden de atributos devueltos por CANIE, no de estimaciones. La tabla se mantiene limitada para evitar saturación; los puntos filtrados permanecen en el mapa.
- Nuevo indicador de cobertura **sobre todos los registros de la capa descargada, antes de aplicar filtros**: puntos válidos, estados distintos, fuentes primarias distintas y centrales con MW conocidos.
- El umbral pedagógico de 15 centrales y 5 entidades puede comprobarse al cargar; la condición de cuatro **tecnologías** no se infiere de cuatro **fuentes primarias**. La capa histórica 2017 no valida por sí misma el inventario actual.

### 02 · Transmisión

- Nueve ciudades sede de gerencias regionales de CFE Transmisión, año 2017 (Plan de Negocios 2018–2022, Anexo 1, p. 58). La coordenada representa una **referencia urbana**, no una subestación ni una línea.
- Datos regionales de longitud y subestaciones, año 2017, y estadísticas de 2023/2024 en gráficos separados. Los contornos INEGI solo aportan orientación administrativa.
- Cartografía institucional CENACE disponible en la pestaña correspondiente. No se traza la red operacional ni se construyen trayectorias.

### 03 · Distribución

- Nueve ubicaciones de almacenes de División Golfo Centro, coordenadas publicadas por CFE en 2026.
- Indicadores verificables para las **16 divisiones** publicados por CFE para 2022. Ninguna estadística divisional se atribuye a un almacén individual.
- Mapa oficial de las divisiones desde el Informe Anual CFE 2022, imagen local. No se superpone sobre Leaflet por carecer de georreferenciación vectorial verificable.
- La nueva capa INEGI muestra estados, **no** divisiones. Las otras quince divisiones no reciben centros ni coordenadas inventados.

## Pruebas y pendientes

1. `npm test` verifica lógica, estructura, calculadoras y atributos de mapas.
2. `npm run sync:estados` obtiene una copia oficial de los 32 polígonos desde INEGI en `data/inegi_estados_2025.geojson` (necesita Internet). La aplicación preferirá ese archivo local.
3. `npm run sync:geo` descarga, si está disponible, snapshots CANIE 2017 de las centrales (también requiere Internet).
4. En navegador: revisar que el botón **Mostrar límites estatales INEGI** agregue contornos sin ocultar puntos; pulsarlo otra vez los desactiva. Verificar CORS, zoom, móvil, selección de plantas y filtros.
5. Pendientes: archivo GIS oficial de las **16 divisiones**, inventario de centrales contemporáneo con coordenadas y MW y trazados oficiales publicables de transmisión. Sin estos documentos, no se puede declarar completa la georreferenciación de las regiones eléctricas.

Estos límites y fuentes tienen fecha distinta; no son una sola base homogénea. Los indicadores SEN/CFE de 2022–2024 no se asignan directamente a puntos del catálogo CANIE 2017.
