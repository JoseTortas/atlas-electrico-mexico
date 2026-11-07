/**
 * MAP-001 / Leaflet map lifecycle and explicit tile loading diagnostics.
 * Geographic overlays are intentionally absent until official geometry exists.
 */
const MEXICO_BOUNDS = [[14.4, -118.5], [32.8, -86.5]];
let activeMap = null;
let observer = null;
let pendingFrames = [];
let mapGeneration = 0;

function clearMap() {
  for (const id of pendingFrames) cancelAnimationFrame(id);
  pendingFrames = [];
  if (observer) { observer.disconnect(); observer = null; }
  if (activeMap) { activeMap.remove(); activeMap = null; }
}
function noticeFor(el) {
  let note = el.parentElement?.querySelector('.map-load-notice');
  if (!note) {
    note = document.createElement('div');
    note.className = 'map-load-notice';
    note.setAttribute('role', 'status');
    el.insertAdjacentElement('afterend', note);
  }
  return note;
}
function showNotice(el, msg) {
  const note = noticeFor(el);
  note.textContent = msg;
  note.hidden = false;
}
function hideNotice(el) {
  const note = el.parentElement?.querySelector('.map-load-notice');
  if (note) note.hidden = true;
}

export function getActiveMap() { return activeMap; }

export function drawMap(id) {
  clearMap();
  const generation = ++mapGeneration;
  const el = document.getElementById(id);
  if (!el) return;
  hideNotice(el);

  if (!window.L) {
    el.innerHTML = '<div class="empty"><strong>Mapa base no disponible</strong>No se pudo cargar la biblioteca Leaflet. Los indicadores y simuladores siguen disponibles.</div>';
    showNotice(el, 'La biblioteca JavaScript Leaflet no se descargó. Revisa la conexión o el bloqueo de recursos externos.');
    return null;
  }

  const map = L.map(el, {
    scrollWheelZoom: false,
    zoomControl: true,
    attributionControl: true,
    zoomSnap: 1
  });
  activeMap = map;
  const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
    maxZoom: 18,
    minZoom: 3,
    tileSize: 256,
    keepBuffer: 2
  });
  let loaded = 0;
  let errors = 0;
  tiles.on('tileload', () => { loaded++; if (errors === 0) hideNotice(el); });
  tiles.on('tileerror', () => { errors++; });
  tiles.on('load', () => {
    if (generation !== mapGeneration) return;
    if (errors > 0) {
      showNotice(el, `No se descargaron ${errors} teselas de OpenStreetMap. Revisa la conexión o los permisos de red. No se muestran ubicaciones ni conexiones sin verificar.`);
    }
  });
  tiles.addTo(map);

  const fitOnce = () => {
    if (generation !== mapGeneration || !el.isConnected || activeMap !== map) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;
    map.fitBounds(MEXICO_BOUNDS, { padding: [16, 16], animate: false });
    map.invalidateSize({ pan: false, animate: false });

    // Detect a broken/overridden Leaflet stylesheet before the user sees mosaics.
    const pane = map.getPane('tilePane');
    if (pane && getComputedStyle(pane).position !== 'absolute') {
      showNotice(el, 'No se aplicó correctamente el CSS del mapa. Comprueba la ruta css/leaflet-layout.css.');
    }
  };
  pendingFrames.push(requestAnimationFrame(() => {
    pendingFrames.push(requestAnimationFrame(fitOnce));
  }));

  if ('ResizeObserver' in window) {
    observer = new ResizeObserver(() => {
      if (generation !== mapGeneration || !map._loaded) return;
      // Leaflet recalculates the tile pane after the container changes size.
      map.invalidateSize({ pan: false, animate: false });
    });
    observer.observe(el);
  }
  return map;
}
