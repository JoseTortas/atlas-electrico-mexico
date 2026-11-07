import {getActiveMap} from './maps.js';
import {number,escapeHTML} from './charts.js';

const e=escapeHTML;
/** Primary source documents, not GIS polygon or line layers. */
export const OFFICIAL_MAPS=Object.freeze({
 transmission:{url:'https://www.cenace.gob.mx/Docs/10_PLANEACION/DiagramasUnifilares/Mod%20Gral%20Planeaci%C3%B3n%202020-2025%20Diagramas%20Unifilares%20RNT%20y%20RGD%20del%20MEM.pdf',anchor:'page=2',caption:'CENACE, Diagramas unifilares del SEN 2020–2025, PDF p. 2 (regiones de control).'},
 distribution:{url:'https://www.cfe.gob.mx/distribucion/cumplimiento/Documents/PAM%20RGD%202023-2037%20vf.pdf',anchor:'page=11',caption:'CFE Distribución, PAM RGD 2023–2037, Figura III.1, p. 7 impresa. La posición de página depende del visor.'}
});
const DIVISION_NAMES=['Baja California','Noroeste','Norte','Golfo Norte','Golfo Centro','Bajío','Jalisco','Centro Occidente','Centro Sur','Centro Oriente','Oriente','Sureste','Peninsular','Valle de México Norte','Valle de México Centro','Valle de México Sur'];
function distributionDocument(src){
 // The user's own CFE Annual Report 2022 contains the actual colored map,
 // at printed p. 140 / PDF p. 141. Its original figure is bundled locally.
 // Do not embed remote PDFs: the CFE host may prohibit cross-origin frames.
 return `<div class="institutional-fallback" role="group" aria-label="Cartografía original de CFE Distribución">
  <div class="reference-title"><span class="reference-kicker">CFE · INFORME ANUAL 2022 · P. 140</span><strong>Mapa oficial de las 16 divisiones de distribución</strong></div>
  <figure class="cfe-original-figure"><img src="assets/img/cfe-divisiones-2022-mapa-oficial.png" width="650" height="377" loading="lazy" alt="Mapa publicado por CFE en 2022: México dividido por colores en las 16 divisiones de Distribución, con leyenda identificando Baja California, Noroeste, Norte, Golfo Norte, Golfo Centro, Bajío, Jalisco, Centro Occidente, Centro Sur, Centro Oriente, Oriente, Sureste, Peninsular y tres divisiones del Valle de México."><figcaption>Figura original extraída del <em>Informe Anual CFE 2022</em>, p. 140 impresa (p. 141 del PDF). Imagen de consulta documental, no georreferenciada.</figcaption></figure>
  <details class="reference-details"><summary>Consultar los nombres de las 16 divisiones</summary><div class="reference-grid">${DIVISION_NAMES.map((name,i)=>`<div class="reference-division"><span>${String(i+1).padStart(2,'0')}</span>${e(name)}</div>`).join('')}</div></details>
  <div class="focus-note note-warning">Los colores son las divisiones representadas por CFE en 2022. Esta imagen no contiene geometrías GIS; los puntos visibles en el mapa interactivo corresponden solamente a instalaciones con coordenadas verificadas.</div>
 </div><p class="small muted">Otra referencia oficial: ${e(src.caption)} Se ofrece como enlace directo porque el navegador puede bloquear el PDF incrustado.</p>
 <a class="reference-link" target="_blank" rel="noopener noreferrer" href="${e(src.url)}#${src.anchor}">Abrir Figura III.1 del PAM RGD 2023–2037 en CFE</a>`;
}
/** The official PDF is a reference document, never a falsely registered overlay. */
export function officialMapWidget(id){
 const src=OFFICIAL_MAPS[id];
 const isDistribution=id==='distribution';
 return `<div class="map-modes" role="group" aria-label="Tipo de cartografía">
 <button type="button" class="map-mode active" data-map-view="base" aria-pressed="true">Mapa interactivo</button>
 <button type="button" class="map-mode" data-map-view="official" aria-pressed="false">${isDistribution?'Referencia oficial':'Mapa institucional'}</button></div>
 <div class="official-document" id="${id}Official" hidden>
 <div class="source-map-label">${isDistribution?'DOCUMENTACIÓN ORIGINAL · CFE':'MAPA ORIGINAL · NO GEOJSON · CENACE'}</div>
 ${isDistribution?distributionDocument(src):`<iframe title="Cartografía oficial CENACE" data-official-url="${e(src.url)}#${src.anchor}&view=FitH" loading="lazy" referrerpolicy="no-referrer" allow="fullscreen"></iframe>
 <p class="small muted">${e(src.caption)} El PDF es una referencia, no una capa GeoJSON.</p>
 <a class="reference-link" target="_blank" rel="noopener noreferrer" href="${e(src.url)}#${src.anchor}">Abrir mapa original en otra pestaña</a>`}
 </div>`;
}
export function wireOfficialMap(id){
 const panel=document.getElementById(id+'MapCard'); if(!panel)return;
 const buttons=[...panel.querySelectorAll('[data-map-view]')];
 const base=panel.querySelector('.geo-map-base'); const official=panel.querySelector('.official-document');
 buttons.forEach(btn=>btn.addEventListener('click',()=>{
  const isOfficial=btn.dataset.mapView==='official';
  buttons.forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  base.hidden=isOfficial;official.hidden=!isOfficial;
  if(isOfficial){const frame=official.querySelector('iframe'); if(frame&&!frame.hasAttribute('src'))frame.src=frame.dataset.officialUrl;}
  else {const map=getActiveMap(); if(map)requestAnimationFrame(()=>map.invalidateSize({pan:false,animate:false}));}
 }));
}
const METRIC={mediumVoltageKm:['Líneas MT','km'],servicesThousand:['Servicios','miles'],salesGWh:['Ventas','GWh'],stepdownSubstationMVA:['Transformación AT/MT','MVA'],distributionNetworkMVA:['Transformación RGD','MVA'],mediumVoltageCircuits:['Circuitos MT','circuitos']};
export function updateDistributionMap(divisions, selected, key='mediumVoltageKm'){
 const el=document.getElementById('distributionMapData');if(!el)return;
 const unit=METRIC[key]||METRIC.mediumVoltageKm;
 const x=divisions.find(v=>v.name===selected);
 const total=divisions.reduce((sum,v)=>sum+(v.observed2022?.[key]||0),0);
 el.innerHTML=x?`<span class="map-readout-kicker">CFE · DIVISIÓN · 2022</span><b>${e(x.name)}</b><strong>${number(x.observed2022[key])} ${e(unit[1])}</strong><small>${e(unit[0])} · cifra regional, no dato de la instalación</small>`:
 `<span class="map-readout-kicker">CFE · 16 DIVISIONES · 2022</span><b>${e(unit[0])}</b><strong>${number(total)} ${e(unit[1])}</strong><small>Total de las 16 divisiones · CFE Tabla III.1</small>`;
}
export function updateTransmissionMap(system){
 const el=document.getElementById('transmissionMapData');if(!el)return;
 el.innerHTML=system?`<span class="map-readout-kicker">SISTEMA ELÉCTRICO · SENER</span><b>${e(system.name)}</b><small>${e(system.short)} · descripción verificada, sin polígono atribuido</small>`:
 `<span class="map-readout-kicker">SENER · PRODESEN</span><b>4 sistemas eléctricos</b><small>1 SIN y tres sistemas adicionales identificados · sin rutas inventadas</small>`;
}
