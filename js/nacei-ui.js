import {auditGenerationPlants} from './map-audit.js';
/** Mapa de centrales oficiales CANIE/NACEI 2017. Datos 2017, NO 2023-2024. */
import {fetchNaceiPlants,filterNaceiPlants,summarizeNaceiPlants,NACEI_SOURCE,NACEI_RENEW_SOURCE,NACEI_LAYERS} from './nacei.js';
import {escapeHTML,number} from './charts.js';
import {getActiveMap} from './maps.js';
const e=escapeHTML;
const WMS='https://geoappext.nrcan.gc.ca/arcgis/services/NACEI/energy_infrastructure_of_north_america_en/MapServer/WMSServer';
const safeCSV=v=>{
  const s=String(v??'');
  const literal=/^\s*[=+@\-]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s) ? "'"+s : s;
  return '"'+literal.replaceAll('"','""')+'"';
};
const formatMW=mw=>mw===null?'Dato no disponible':number(mw,1)+' MW';
const sourceStyle=source=>{
  if(/solar/i.test(source))return {color:'#e6ac50',label:'Solar'};
  if(/wind/i.test(source))return {color:'#69bfd8',label:'Eólica'};
  if(/hydro/i.test(source))return {color:'#00A6FF',label:'Hidráulica'};
  if(/geotherm/i.test(source))return {color:'#ce8e63',label:'Geotérmica'};
  if(/nuclear/i.test(source))return {color:'#b69eec',label:'Nuclear'};
  if(/natural gas/i.test(source))return {color:'#d78c7a',label:'Gas natural'};
  if(/coal|petrol/i.test(source))return {color:'#9a9d9e',label:'Fósil'};
  if(/biomass/i.test(source))return {color:'#8dc0a5',label:'Biomasa'};
  return {color:'#d1d5db',label:'Otra fuente'};
};
function csvFile(rows,layer){
  const fields=['name','state','city','source','mw','lat','lon','owner','period'];
  const csv=[fields.join(','),...rows.map(p=>fields.map(k=>safeCSV(p[k]??'')).join(','))].join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;
  a.download=`NEXUS_CANIE_${layer}_2017_Mexico.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),500);
}
function optionsFor(plants,key,allLabel){
  return `<option value="">${e(allLabel)}</option>`+[...new Set(plants.map(p=>p[key]))].sort((a,b)=>a.localeCompare(b,'es'))
    .map(x=>`<option value="${e(x)}">${e(x)}</option>`).join('');
}
export function wireNaceiMap(map){
  const get=id=>document.getElementById(id);
  const btn=get('naceiLoad'),layerSel=get('naceiLayer'),regionSel=get('naceiState'),sourceSel=get('naceiSource');
  const search=get('naceiSearch'),status=get('naceiStatus'),list=get('naceiResults'),filters=get('naceiFilters');
  const summary=get('naceiSummary'),chart=get('naceiChart'),exportBtn=get('naceiExport'),centerBtn=get('naceiRecenter'),minimum=get('naceiMinimum');
  if(!btn||!map)return;
  let plants=[],group=null,wms=null,loadingId=0, currentLayer='all', selected=[];
  const ownsMap=()=>map===getActiveMap()&&map.getContainer().isConnected;
  const setStatus=t=>{if(status) status.textContent=t;};
  const removeLayers=()=>{if(group){group.remove();group=null;}if(wms){wms.remove();wms=null;}};
  const activeFilters=()=>({source:sourceSel.value,state:regionSel.value,search:search.value,minimumMW:minimum.value});
  const focusResults=()=>{if(!ownsMap()||!selected.length)return;
    map.fitBounds(window.L.latLngBounds(selected.map(p=>[p.lat,p.lon])),{padding:[30,30],maxZoom:9,animate:true});};
  function draw(){
    if(!ownsMap()||!group)return;
    selected=filterNaceiPlants(plants,activeFilters());
    group.clearLayers();
    for(const p of selected){
      const style=sourceStyle(p.source);
      window.L.circleMarker([p.lat,p.lon],{radius:5.5,weight:1.4,color:'#09273d',fillColor:style.color,fillOpacity:.92})
        .bindPopup(`<strong>${e(p.name)}</strong><div>${e(p.city)} · ${e(p.state)}</div><div>Fuente primaria: ${e(p.source)}</div><div>Capacidad histórica: ${formatMW(p.mw)}</div><div>Coordenadas oficiales: ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}</div><small>CANIE/NACEI, agosto 2017. No son datos actuales.</small><div><a href="${p.layer==='renewable'?NACEI_RENEW_SOURCE:NACEI_SOURCE}" target="_blank" rel="noopener noreferrer">Ficha de la fuente oficial</a></div>`)
        .addTo(group);
    }
    const stats=summarizeNaceiPlants(selected);
    const coverage=auditGenerationPlants(plants);
    const coverageEl=get('naceiCoverage');
    if(coverageEl)coverageEl.innerHTML=`<div class="map-audit"><strong>Comprobación cartográfica · inventario CANIE 2017</strong><div class="map-audit-grid"><span>${coverage.points} centrales con coordenadas ${coverage.meets15points?'✓':'· faltan registros'}</span><span>${coverage.states} entidades ${coverage.meets5states?'✓':'· insuficientes'}</span><span>${coverage.primarySources} fuentes primarias ${coverage.meets4Sources?'✓':'· insuficientes'}</span><span>${coverage.withMW} capacidades individuales en MW</span><span>${coverage.identifiableTechnologyFamilies.length} familias tecnológicas sugeridas por denominación</span><span>4 tecnologías explícitas por central: ${coverage.fourTechnologiesProven?'verificadas':'no demostrado'}</span></div><p class="small">Cobertura calculada sobre <b>toda la capa cargada</b> antes de filtros. Familias reconocibles: ${e(coverage.identifiableTechnologyFamilies.join(', ')||'no identificadas')}. La fuente primaria no demuestra automáticamente la tecnología de cada central. El catálogo PRODESEN 2023 se audita por separado.</p></div>`;
    setStatus(`${stats.count} de ${plants.length} centrales georreferenciadas en la consulta histórica de 2017. Datos de CANIE/NACEI.`);
    summary.innerHTML=`<div class="geo-metrics"><div><strong>${number(stats.count)}</strong><span>centrales filtradas</span></div><div><strong>${number(stats.states)}</strong><span>entidades</span></div><div><strong>${number(stats.sumKnownMW,1)} MW</strong><span>suma de capacidades declaradas${stats.countKnownMW<stats.count?' (parcial)':''}</span></div></div><p class="small">Se suman únicamente los MW presentes en los registros filtrados. No es la capacidad nacional ni una medición de 2024.</p>`;
    const top=stats.bySource.slice(0,7),max=Math.max(1,...top.map(x=>x.count));
    chart.innerHTML=top.length?`<h3>Distribución de centrales por fuente primaria · 2017</h3><div class="geo-source-chart">${top.map(x=>`<div class="geo-source-row"><span title="${e(x.source)}">${e(x.source)}</span><div class="geo-source-track"><div style="width:${(100*x.count/max).toFixed(1)}%;background:${sourceStyle(x.source).color}"></div></div><strong>${number(x.count)}</strong></div>`).join('')}</div>`:'';
    const shown=selected.slice(0,80);
    list.innerHTML=shown.length?`<div class="scroll-x"><table class="compare-table catalog-table geo-results"><thead><tr><th>Central · 2017</th><th>Estado</th><th>Fuente primaria</th><th>MW publicados</th><th>Mapa</th></tr></thead><tbody>${shown.map(p=>`<tr><td><strong>${e(p.name)}</strong></td><td>${e(p.state)}</td><td>${e(p.source)}</td><td>${formatMW(p.mw)}</td><td><button class="geo-locate" type="button" data-geo-id="${e(p.id)}" aria-label="Ver ${e(p.name)} en el mapa">Ver</button></td></tr>`).join('')}</tbody></table></div><p class="small">Tabla limitada a 80 filas para facilitar la lectura. El mapa muestra las ${selected.length} centrales que cumplen los filtros.</p>`:'<div class="focus-note note-warning">No hay centrales que cumplan esos filtros.</div>';
    list.querySelectorAll('[data-geo-id]').forEach(b=>b.addEventListener('click',()=>{
      const p=selected.find(x=>x.id===b.dataset.geoId);if(!p||!ownsMap())return;
      map.setView([p.lat,p.lon],10,{animate:true});
      group.eachLayer(m=>{if(m.getLatLng()?.lat===p.lat&&m.getLatLng()?.lng===p.lon)m.openPopup();});
      map.getContainer().scrollIntoView({behavior:'smooth',block:'center'});
    }));
    exportBtn.disabled=!selected.length;centerBtn.disabled=!selected.length;
  }
  function wmsFallback(choice,reason){
    if(!ownsMap())return;
    try{
      // Imágenes de puntos reales del mismo servicio oficial: no se inventan coordenadas.
      wms=window.L.tileLayer.wms(WMS,{layers:String(NACEI_LAYERS[choice]),format:'image/png',transparent:true,version:'1.1.1',attribution:'CANIE/NACEI · agosto 2017',opacity:.85});
      wms.addTo(map);
      filters.hidden=true;summary.innerHTML='';chart.innerHTML='';list.innerHTML='';if(get('naceiCoverage'))get('naceiCoverage').innerHTML='';
      setStatus(`No fue posible descargar atributos y coordenadas (${reason}). Se intentará mostrar la capa cartográfica WMS oficial de 2017 sin datos individuales ni filtros. Si el mapa no muestra puntos, el servicio podría estar bloqueado o no disponible.`);
    }catch{setStatus(`Consulta geográfica no disponible: ${reason}. No se dibujan coordenadas ficticias.`);}
  }
  async function loadLayer({refresh=false}={}){
    if(!ownsMap())return;
    const id=++loadingId;const choice=layerSel.value;currentLayer=choice;
    removeLayers();btn.disabled=true;btn.textContent='Consultando…';
    filters.hidden=true;summary.innerHTML='';chart.innerHTML='';list.innerHTML='';if(get('naceiCoverage'))get('naceiCoverage').innerHTML='';
    exportBtn.disabled=true;centerBtn.disabled=true;
    setStatus('Consultando coordenadas y capacidades CANIE/NACEI 2017. Puede tardar unos segundos.');
    try{
      const response=await fetchNaceiPlants(choice,{refresh});
      if(!ownsMap()||id!==loadingId)return;
      plants=response.plants;
      regionSel.innerHTML=optionsFor(plants,'state','Todas las entidades');
      sourceSel.innerHTML=optionsFor(plants,'source','Todas las fuentes');
      minimum.value='0';search.value='';
      group=window.L.layerGroup().addTo(map);
      filters.hidden=false;draw();
      const src=get('naceiOrigin');if(src)src.textContent=`Origen de registros: ${response.origin}. Publicación CANIE/NACEI: agosto 2017. No corresponde a la capacidad 2024.`;
    }catch(err){if(ownsMap()&&id===loadingId)wmsFallback(choice,err.message);}
    finally{if(ownsMap()&&id===loadingId){btn.disabled=false;btn.textContent='Reintentar consulta oficial';}}
  }
  [regionSel,sourceSel,minimum].forEach(control=>control.addEventListener('change',draw));
  search.addEventListener('input',draw);
  layerSel.addEventListener('change',()=>loadLayer());
  btn.addEventListener('click',()=>loadLayer({refresh:true}));
  centerBtn.addEventListener('click',focusResults);
  exportBtn.addEventListener('click',()=>{if(selected.length)csvFile(selected,currentLayer);});
  // Carga automática: el usuario ve centrales verificables al abrir el módulo, sin otro clic.
  loadLayer();
}
