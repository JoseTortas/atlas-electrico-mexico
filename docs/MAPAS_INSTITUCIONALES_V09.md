# Alpha 0.9 | Cartografía institucional enlazada

## Transmisión

- Fuente institucional: CENACE, *Diagramas Unifilares del SEN 2020–2025*, abril 2021, página 2 del PDF, mapa **Regiones del Sistema Eléctrico Nacional**.
- URL: https://www.cenace.gob.mx/Docs/10_PLANEACION/DiagramasUnifilares/Mod%20Gral%20Planeaci%C3%B3n%202020-2025%20Diagramas%20Unifilares%20RNT%20y%20RGD%20del%20MEM.pdf
- La figura muestra diez regiones de control, **no** cuatro polígonos oficialmente descargados de sistemas eléctricos. El módulo mantiene los cuatro sistemas según PRODESEN. No se han dibujado rutas.
- Interacción nueva: alternar mapa Leaflet y figura PDF original; selector de sistema actualiza un panel informativo sobre el mapa base.

## Distribución

- Fuente institucional: CFE Distribución, *Programa de Ampliación y Modernización de RGD 2023–2037*, Figura III.1, p. 7 impresa; Tabla III.1, pp. 8–9, estadística observada 2022.
- URL: https://www.cfe.gob.mx/distribucion/cumplimiento/Documents/PAM%20RGD%202023-2037%20vf.pdf
- 16 divisiones y sus seis agregados oficiales; no atribuirlos a entidades federativas completas ni a polígonos sin shapefile.
- Interacción nueva: selector y comparador actualizan automáticamente la tarjeta sobre el mapa base; botón de mapa institucional abre la figura oficial dentro del módulo; enlace externo como respaldo cuando el navegador bloquea el PDF embebido.

## Integridad geoespacial

Los dos PDFs se visualizan como **documentos originales de referencia**, sin superponerlos a teselas de OpenStreetMap mediante supuesta georreferenciación. Esta es una solución cartográfica de consulta, no un reemplazo de GeoJSON de límites exactos. **Pendiente** obtener el shape/geopackage firmado o publicado por cada titular para mapas vectoriales exactos. El sitio funciona si falla el servicio PDF: botón de abrir original externo y Leaflet quedan disponibles.

En ningún momento se generan coordenadas, distancias ni nuevas trayectorias de red. La fuente CFE 2022 y CENACE 2021 mantienen sus fechas distintas.
