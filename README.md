# NEXUS ENERGY | Atlas Eléctrico de México

**Entrega académica TE1020 · sitio estático para GitHub Pages · versión 0.18.1.**

La aplicación contiene los módulos Recursos energéticos, Generación, Transmisión, Distribución y ¿Sabías que? Incluye 20 fichas verificables, simuladores y una cronología de reformas.

## Publicación rápida

1. Descomprime este ZIP. El archivo `index.html` debe quedar directamente dentro de `NEXUS_ENERGY_SITIO_GITHUB_PAGES`, junto a `assets`, `css`, `data`, `docs` y `js`.
2. Si lo tienes en la computadora, copia **`inegi_estados_web.geojson`** desde `data` de tu Alpha 0.18.1 a **`data`** de esta carpeta, antes de subir. La copia ligera es la recomendada para GitHub; no copies el original de 27.50 MiB desde el navegador, porque GitHub limita las subidas web a 25 MiB por archivo.
3. Opcionalmente, copia **`nacei_2017_all.json`** y **`nacei_2017_renewable.json`** a `data` solamente si fueron descargados desde CANIE y validados. Si no existen, la web intentará consultar el servicio oficial en línea.
4. En GitHub crea un repositorio **público** (por ejemplo `atlas-electrico-mexico`). En el repositorio haz clic en **Add file → Upload files**. Arrastra **todo el contenido descomprimido**, manteniendo las carpetas relativas. No subas el ZIP en lugar de los archivos.
5. Pulsa **Commit changes**. En **Settings → Pages**, selecciona **Deploy from a branch**, **main**, **/(root)** y **Save**.
6. Comprueba en Pages el enlace del sitio, con formato `https://TU_USUARIO.github.io/atlas-electrico-mexico/`. Revisa que se abran todos los módulos.

**IMPORTANTE:** `index.html` debe estar directamente en la **raíz del repositorio** (no dentro de otra carpeta). Las rutas de CSS, JS y JSON son relativas y compatibles con GitHub Pages. No hace falta `npm`, Python ni ningún servidor para publicar.

## Dependencias y límites de información

- Leaflet se carga desde un CDN y el mapa base requiere conexión a Internet.
- El mapa de generación consulta CANIE/NACEI histórico 2017 si no hay copias locales verificadas; fallos del servicio externo no detienen los demás módulos.
- Los límites INEGI son **estatales**, no límites oficiales de CFE ni CENACE. Se pueden mostrar mediante la copia ligera local o el servicio oficial remoto.
- Las sedes regionales de CFE Transmisión son referencias urbanas históricas; no son posiciones precisas de subestaciones. Los puntos de Distribución corresponden a instalaciones verificadas, no a polígonos divisionales.
- El código de la capa INEGI simplificada puede tener límites aproximados de visualización. No se presenta como cartografía vectorial de precisión.
- Los números, años, alcances y referencias se detallan en `docs/`.

No incluyas datos personales en el repositorio público. Este paquete no contiene credenciales, formularios privados ni funciones de backend.


## v0.18.1 · Mejoras visuales
- Reemplaza la marca JPEG sobre fondo negro con el logo PNG transparente `assets/img/nexus-energy-transparente.png`.
- Se rediseña la tarjeta de marca con retícula, iluminación y movimiento sutil.
- Se agrega secuencia de flujo eléctrico a la portada, microanimaciones de gráficas y tarjetas y barra de lectura.
- En «¿Sabías que?» las 20 tarjetas tienen dos caras accesibles: frente con pregunta/cifra y reverso con explicación, fuente oficial y gráfica expandible. Los datos no se modifican.
- Se respetan las preferencias `prefers-reduced-motion` y el funcionamiento de Leaflet.
- Para publicar, extraer el ZIP y subir su contenido completo a la raíz de GitHub Pages. Si ya se había descargado `inegi_estados_web.geojson`, conservarlo en `data/`.


## Tipografía Alpha 0.18.1
Los títulos mayores usan Michroma, el contenido y navegación Manrope y los indicadores Rajdhani. Las fuentes se cargan desde Google Fonts con alternativas del sistema si falla la conexión. No se alteraron los datos.
