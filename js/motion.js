/* NEXUS ENERGY 0.18.3 | Desplazamiento estable.
   Evitamos ocultar contenido bajo IntersectionObserver: en páginas muy largas
   el navegador puede retrasar la pintura de secciones durante scroll rápido.
   Las animaciones independientes (tarjetas 3D, logo, barras, hover) se mantienen. */
let progressBar = null;
let progressFrame = 0;
function paintProgress() {
  progressFrame = 0;
  if (!progressBar) progressBar = document.querySelector('.reading-progress');
  if (!progressBar) return;
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const percent = max ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  // Solo se transforma una barra de 2px; no se invalidan estilos del documento.
  progressBar.style.transform = `scaleX(${percent.toFixed(5)})`;
}
function requestProgress() {
  if (!progressFrame) progressFrame = window.requestAnimationFrame(paintProgress);
}
export function initMotion() {
  progressBar = document.querySelector('.reading-progress');
  window.addEventListener('scroll', requestProgress, {passive: true});
  window.addEventListener('resize', requestProgress, {passive: true});
  requestProgress();
}
export function refreshMotion() {
  // Ya no ocultamos tarjetas ni títulos al entrar/salir del viewport.
  // Animación de portada y encabezado se resuelve en CSS, una sola vez.
  document.querySelectorAll('main .motion-enter').forEach(el => {
    el.classList.remove('motion-enter');
    el.classList.remove('motion-visible');
    el.style.removeProperty('--motion-delay');
  });
  requestProgress();
}
