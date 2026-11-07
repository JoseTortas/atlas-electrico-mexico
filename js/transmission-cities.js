/**
 * CFE transmisión 2017: source-backed REGIONAL CITY references ONLY.
 * These coordinates mark the city, not CFE offices, substations, towers or lines.
 * Never treat historic region aggregates as individual-site attributes.
 */
import {escapeHTML,number,barChart} from './charts.js';
const e=escapeHTML;
export function validateTransmissionRegionCities(raw){
 const p=raw?.points;
 if(!Array.isArray(p))return [];
 const seen=new Set();
 return p.filter(x=>{
  if(!x||typeof x.id!=='string'||seen.has(x.id)||typeof x.region!=='string'||typeof x.city!=='string')return false;
  if(x.kind!=='ciudad_sede_referencia'||x.isPhysicalInstallation!==false||x.year!==2017)return false;
  if(!Number.isFinite(x.lat)||!Number.isFinite(x.lon)||x.lat<14||x.lat>33||x.lon < -119||x.lon > -86)return false;
  if(!Number.isInteger(x.substations2017)||x.substations2017<0||!Number.isFinite(x.linesKm2017)||x.linesKm2017<0)return false;
  seen.add(x.id);return true;
 });
}
function regionPopup(x,meta){
 return `<div class="facility-popup"><strong>GRT ${e(x.region)} (2017)</strong><p><b>Ciudad sede:</b> ${e(x.city)}, ${e(x.state)}</p><p class="small">${number(x.substations2017)} subestaciones atendidas por la gerencia y ${number(x.linesKm2017,2)} km de líneas, <b>totales regionales de 2017</b>.</p><p class="small"><b>Marcador:</b> referencia geográfica de la ciudad, NO la sede física ni una subestación.</p><p class="small">Fuentes: <a target="_blank" rel="noopener noreferrer" href="${e(meta.sourceURL)}#page=58">CFE, anexo 1, p. 58</a>; <a target="_blank" rel="noopener noreferrer" href="${e(meta.coordinateSourceURL)}">referencia geográfica urbana</a>.</p></div>`;
}
export function wireTransmissionRegionCities(map,raw){
 const arr=validateTransmissionRegionCities(raw),meta=raw?.metadata??{};
 const byId=new Map(arr.map(x=>[x.id,x]));
 const selector=document.getElementById('transRegionCitySelect');
 const preview=document.getElementById('transRegionCityPreview');
 const count=document.getElementById('transRegionCityCount');
 const fit=document.getElementById('transRegionCityFit');
 const metric=document.getElementById('transRegionCityMetric');
 const chart=document.getElementById('transRegionCityChart');
 const layer=map&&window.L?L.layerGroup().addTo(map):null;
 const markers=new Map();
 if(layer)for(const x of arr){
  const m=L.circleMarker([x.lat,x.lon],{radius:7,weight:2,color:'#072f4f',fillColor:'#00a6ff',fillOpacity:.93,opacity:1,className:'nexus-trans-city'}).bindPopup(regionPopup(x,meta),{maxWidth:315});
  markers.set(x.id,m);m.addTo(layer);
 }
 function focus(id){const x=byId.get(id);if(!x||!map||!markers.has(id))return;map.setView([x.lat,x.lon],Math.max(map.getZoom(),8),{animate:false});markers.get(id).openPopup();}
 function renderRegion(id=''){
  const list=id?arr.filter(x=>x.id===id):arr;
  if(layer){layer.clearLayers();list.forEach(x=>markers.get(x.id)?.addTo(layer));}
  if(count)count.textContent=`${list.length} ciudad${list.length===1?'':'es'} sede de referencia · 2017`;
  if(fit)fit.disabled=!map||list.length===0;
  const measure=metric?.value==='substations2017'?'substations2017':'linesKm2017';
  const chartRows=[...arr].sort((a,b)=>b[measure]-a[measure]).map(x=>({name:x.region,value:x[measure]}));
  if(chart)chart.innerHTML=barChart(chartRows,{unit:measure==='linesKm2017'?'km':'subestaciones',decimals:measure==='linesKm2017'?2:0})+'<div class="source">CFE, Plan de Negocios 2018–2022, Anexo 1, Tabla A.1.1, p. 58. Agregados históricos (2017), no cifras de 2024. Suma de filas: 107,042.23 km; total impreso CFE: 107,042.22 km (diferencia 0.01 km).</div>';
  if(preview){const shown=list.slice(0,4);preview.innerHTML=list.length?`<div class="facility-head">Gerencias regionales · sedes urbanas<span>${list.length} ciudades</span></div><div class="facility-sample">${shown.map(x=>`<button type="button" class="facility-item" data-trans-region="${e(x.id)}"><strong>${e(x.region)}</strong><span>${e(x.city)} · ${e(x.state)}</span></button>`).join('')}</div>${list.length>4?`<details class="facility-more"><summary>Ver las ${list.length-4} ciudades restantes</summary><div class="facility-sample">${list.slice(4).map(x=>`<button type="button" class="facility-item" data-trans-region="${e(x.id)}"><strong>${e(x.region)}</strong><span>${e(x.city)} · ${e(x.state)}</span></button>`).join('')}</div></details>`:''}`:'<p>No hay datos de ciudades sede para esta selección.</p>';}
  if(map&&id){const x=byId.get(id);if(x)map.setView([x.lat,x.lon],7,{animate:false});}
 }
 function fitAll(){const list=selector?.value?arr.filter(x=>x.id===selector.value):arr;if(!map||!list.length||!window.L)return;map.fitBounds(L.latLngBounds(list.map(x=>[x.lat,x.lon])),{padding:[35,35],maxZoom:9,animate:false});}
 selector?.addEventListener('change',()=>renderRegion(selector.value));
 metric?.addEventListener('change',()=>renderRegion(selector?.value??''));
 fit?.addEventListener('click',fitAll);
 preview?.addEventListener('click',evt=>{const btn=evt.target.closest('[data-trans-region]');if(btn)focus(btn.dataset.transRegion);});
 renderRegion();
 return {records:arr,focus,fitAll,selectRegion:renderRegion};
}
