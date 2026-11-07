# NEXUS ENERGY · Alpha 0.18 — Interacciones y marca

## Cambios visuales
- Se coloca la marca **PNG transparente** en barra lateral y favicon.
- Nuevo contenedor de marca con retícula azul y halo; no hay un rectángulo negro dentro de la imagen.
- Portada: perspectiva técnica, flujo de energía animado y lectura más clara.
- Gráficas, botones, navegación y cronología con transiciones suaves.
- Barra de progreso de lectura y animaciones de entrada en indicadores y encabezados.
- «¿Sabías que?»: 20 tarjetas con animación 3D de doble cara. Cara A = pregunta y dato; cara B = explicación, fuente y gráfica interactiva.
- Preferencia de movimiento reducido: animaciones desactivadas o instantáneas mediante `prefers-reduced-motion`.

## Integridad académica
- Los JSON de `data/` **no se modificaron** respecto de Alpha 0.17.
- Se preservaron las funciones Leaflet (MAP-001), las fichas cartográficas y los simuladores.
- No se han añadido cifras, coordenadas o resultados inventados.

## GitHub Pages
1. Descomprime el ZIP y sube el contenido, con `index.html` en la raíz de tu repositorio.
2. **Conserva tu archivo `data/inegi_estados_web.geojson`** que generaste en tu computadora: no está en este paquete porque no estaba disponible en el proyecto fuente del ZIP.
3. Haz commit, comprueba que la portada indique **0.18**, visita `#facts` y gira una tarjeta.
4. Si el navegador conserva la anterior versión, pulsa `Ctrl + F5`.

## Pruebas
- Renderizado estático en Chromium (escritorio 1365/1440 px y móvil 390 px).
- Interacciones `wireFacts`: giro y regreso, gráfica expandible, filtros de categoría, atributos de accesibilidad; sin errores JS en el entorno de prueba.
- Módulos JS pasan `node --check`.
- Los servicios externos de Leaflet/CANIE/INEGI no se retestearon en Internet en esta iteración.
