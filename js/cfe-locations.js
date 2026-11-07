/**
 * CFE distribution georeferences: documented facilities only.
 * These are NOT polygon centroids, divisional headquarters, substations or network routes.
 * Values come verbatim from the 2026 CFE Golfo Centro warehouse directory.
 */
import {escapeHTML} from './charts.js';
const e=escapeHTML;
const MEXICO_BOUNDS=[[14.4,-118.5],[32.8,-86.5]];

export function validateCFELocations(data){
 const arr=data?.points??[];
 if(!Array.isArray(arr))return [];
 const ids=new Set();
 return arr.filter(p=>{
  if(!p || !p.id || ids.has(p.id) || !p.division || !p.sourceURL || !p.address)return false;
  if(!Number.isFinite(p.lat)||!Number.isFinite(p.lon))return false;
  if(p.lat<14 || p.lat>33 || p.lon< -119 || p.lon> -86)return false;
  ids.add(p.id);return true;
 });
}
function facilityPopup(p){
 return `<div class="facility-popup"><strong>${e(p.name)}</strong><p>${e(p.locality)}, ${e(p.state)}</p><p>${e(p.address)}</p><p class="small">Código CFE: ${e(p.id)} · División: ${e(p.division)}</p><p class="small"><b>Coordenadas documentadas:</b> ${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</p><a href="${e(p.sourceURL)}" target="_blank" rel="noopener noreferrer">CFE · directorio oficial (2026), anexo 2</a><p class="small">Punto de instalación, no límite geográfico de la división.</p></div>`;
}
export function wireDistributionFacilities(map,rawData){
 const records=validateCFELocations(rawData);
 const byId=new Map(records.map(p=>[p.id,p]));
 const countFor=division=>records.filter(p=>p.division===division).length;
 const label=document.getElementById('distributionFacilitiesCount');
 const preview=document.getElementById('distributionFacilitiesPreview');
 const fitButton=document.getElementById('distributionFacilitiesFit');
 let selected='';
 const layer=map&&window.L?L.layerGroup().addTo(map):null;
 const markers=new Map();
 if(layer){
  for(const p of records){
   const marker=L.circleMarker([p.lat,p.lon],{
    radius:7,weight:2,color:'#0b2d52',fillColor:'#00a6ff',fillOpacity:.96,opacity:1,
    className:'nexus-cfe-location'
   }).bindPopup(facilityPopup(p),{maxWidth:300});
   marker.addTo(layer);
   markers.set(p.id,marker);
  }
 }
 function focus(id){
  const p=byId.get(id),marker=markers.get(id);
  if(!p||!map||!marker)return;
  map.setView([p.lat,p.lon],Math.max(map.getZoom(),12),{animate:false});
  marker.openPopup();
 }
 function showList(list){
  if(!preview)return;
  const visible=list.slice(0,3);
  preview.innerHTML=list.length?`<div class="facility-head">Instalaciones documentadas por CFE · 2026 <span> ${list.length} registros</span></div><div class="facility-sample">${visible.map(p=>`<button type="button" class="facility-item" data-cfe-id="${e(p.id)}"><strong>${e(p.name)}</strong><span>${e(p.locality)} · ${e(p.state)}</span></button>`).join('')}</div>${list.length>3?`<details class="facility-more"><summary>Ver las otras ${list.length-3} ubicaciones verificadas</summary><div class="facility-sample">${list.slice(3).map(p=>`<button type="button" class="facility-item" data-cfe-id="${e(p.id)}"><strong>${e(p.name)}</strong><span>${e(p.locality)} · ${e(p.state)}</span></button>`).join('')}</div></details>`:''}`:
   `<p class="small muted">No hay instalaciones con coordenadas oficiales integradas para esta división. El directorio y los indicadores regionales siguen disponibles; no se coloca un marcador ficticio.</p>`;
 }
 function fitAvailable(){
  const subset=selected?records.filter(p=>p.division===selected):records;
  if(!map||!window.L||!subset.length)return;
  map.fitBounds(L.latLngBounds(subset.map(p=>[p.lat,p.lon])),{
   padding:[32,32],maxZoom:10,animate:false
  });
 }
 function selectDivision(division=''){
  selected=division;
  const subset=selected?records.filter(p=>p.division===selected):records;
  if(layer){
   layer.clearLayers();
   for(const p of subset)markers.get(p.id)?.addTo(layer);
  }
  if(label)label.textContent=`${subset.length} instalaciones verificadas · ${selected||'todas las divisiones'}`;
  if(fitButton)fitButton.disabled=!subset.length||!map;
  showList(subset);
  if(map&&selected){
   if(subset.length)fitAvailable();
   else map.fitBounds(MEXICO_BOUNDS,{padding:[16,16],animate:false});
  }
 }
 preview?.addEventListener('click',evt=>{
  const button=evt.target.closest('[data-cfe-id]');
  if(button)focus(button.dataset.cfeId);
 });
 fitButton?.addEventListener('click',fitAvailable);
 selectDivision();
 return {selectDivision,countFor,records,focus};
}
