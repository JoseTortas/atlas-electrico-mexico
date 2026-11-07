# Alpha 0.15 · Validación de cartografía oficial (INEGI)

## Alcance

El usuario informó que `npm run sync:estados` descargó correctamente un archivo local en su computadora. **Esta entrega no contiene dicho archivo**, porque no se adjuntó a la conversación; por tanto, **no se puede certificar aquí el contenido binario concreto que descargó el usuario**. La versión v0.15 incorpora un auditor que ejecuta esa verificación en su equipo sin depender de Internet.

### Pasos sin volver a descargar

1. Extrae esta versión en una carpeta nueva.
2. Copia el archivo **`inegi_estados_2025.geojson`** desde la carpeta `data` de tu Alpha 0.14 a la carpeta `data` de esta Alpha 0.15.
3. En una terminal, dentro de la carpeta del proyecto, ejecuta **`npm run audit:mapas`**. No requiere Internet.
4. Debe reportar **32 entidades** y contadores de polígonos, anillos, vértices y extensión geográfica. Guarda el reporte en `docs/RESULTADOS_AUDITORIA_MAPAS.txt`.
5. Ejecuta **`npm test`** para validar los demás módulos.
6. Usa `python -m http.server 8000` y abre `http://localhost:8000/#generation`, después `#transmission` y `#distribution`. En cada uno activa **Mostrar límites estatales INEGI**. El control debe indicar **archivo local oficial** si el GeoJSON copiado se encontró y validó.

Si omitiste copiar el archivo, el comando `npm run audit:mapas` fallará con instrucciones para encontrarlo. Si no lo tienes, puedes usar `npm run sync:estados` desde esta nueva carpeta para descargarlo. El Atlas no requiere npm para funcionar si el archivo existe.

### Criterios inspeccionados automáticamente

- FeatureCollection GeoJSON.
- Exactamente 32 entidades cuando se solicita el archivo completo.
- Una identidad nominal única y no vacía por entidad.
- Cada Feature contiene Polygon o MultiPolygon.
- Cada anillo contiene al menos cuatro posiciones y cierra sobre su punto inicial.
- **Todas** las posiciones tienen longitud/latitud finitas en el encuadre razonable de México, no únicamente la primera de cada entidad.
- Integración estructural en las tres vistas y presencia del CSS Leaflet local que corrigió MAP-001.

### Límites de la auditoría

- No valida topología exhaustiva (autointersecciones), precisión de límites con una fuente de campo ni la antigüedad del GeoJSON descargado; no modifica la geometría de INEGI.
- No sustituye la comprobación visual en Leaflet, la carga de mosaicos OSM ni la selección de controles.
- **Un contorno estatal no es la superficie de una división CFE ni la de un sistema eléctrico CENACE**.
- Los marcadores CANIE 2017, las ciudades sede CFE Transmisión 2017 y los almacenes de CFE Distribución 2026 conservan sus alcances diferentes.

### Observación de los tres mapas

| Vista | Activar INEGI | Comprobar elementos existentes | Advertencias obligatorias |
|---|---|---|---|
| Generación | Contornos de 32 estados con zoom normal | Puntos de centrales CANIE y filtros | MW históricos 2017, no 2024; fuente primaria no es tecnología automáticamente |
| Transmisión | Contornos de 32 estados sin ocultar controles | 9 ciudades sede y comparadores históricos | Ciudades no son subestaciones; no hay líneas GIS verificadas |
| Distribución | Contornos de 32 estados; activar mapa institucional y volver | 9 instalaciones de Golfo Centro y 16 divisiones en directorio | Estados no son divisiones CFE; mapa institucional es una imagen local |

**Resultado:** esta iteración endurece la comprobación cartográfica, pero no declara cerrados los pendientes de geometrías operativas ni de capacidades individuales recientes.
