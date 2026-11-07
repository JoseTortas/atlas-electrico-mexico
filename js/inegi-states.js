/**
 * Límites estatales INEGI. Las coordenadas de la geometría son [longitud, latitud]
 * en EPSG:4326. Su integridad NO implica que sean límites operativos CFE/CENACE.
 *
 * Verificación estricta de cada vértice y cada anillo del archivo original:
 * cantidad, tipos GeoJSON, nombres, cierres y rangos geográficos.
 * No se simplifican ni alteran geometrías. No verifica autointersecciones topológicas.
 */
export const INEGI_GEO_URL='https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgee/';
export const INEGI_GEO_LOCAL='data/inegi_estados_2025.geojson';
export const INEGI_GEO_WEB='data/inegi_estados_web.geojson';
const MIN_LON=-119, MAX_LON=-86, MIN_LAT=14, MAX_LAT=34;
const GEO_EPS=1e-8;
let cached=null;
const nameOf=f=>String(f?.properties?.nomgeo??f?.properties?.NOMGEO??f?.properties?.nombre??f?.properties?.NOMBRE??'').trim();
export function inspectInegiGeoJSON(data,{require32=false}={}){
 if(data?.type!=='FeatureCollection'||!Array.isArray(data.features))throw Error('La respuesta no es GeoJSON FeatureCollection.');
 if(require32&&data.features.length!==32)throw Error(`INEGI devolvió ${data.features.length} geometrías; se esperaban 32 entidades.`);
 const names=new Set();
 const bounds={minLon:Infinity,minLat:Infinity,maxLon:-Infinity,maxLat:-Infinity};
 const summary={features:data.features.length,polygons:0,multiPolygons:0,rings:0,vertices:0,bounds,states:[]};
 for(const [i,f] of data.features.entries()){
  if(f?.type!=='Feature')throw Error(`Entidad ${i+1}: objeto GeoJSON Feature inválido.`);
  if(!['Polygon','MultiPolygon'].includes(f?.geometry?.type))throw Error(`Entidad ${i+1}: geometría no poligonal o ausente.`);
  const name=nameOf(f);
  if(!name)throw Error(`Entidad ${i+1}: nombre geoestadístico vacío.`);
  const key=name.toLocaleLowerCase('es').normalize('NFC');
  if(names.has(key))throw Error(`Nombre geoestadístico duplicado: ${name}.`);
  names.add(key); summary.states.push(name);
  const multi=f.geometry.type==='MultiPolygon';
  const polys=multi?f.geometry.coordinates:[f.geometry.coordinates];
  if(!Array.isArray(polys)||polys.length===0)throw Error(`${name}: geometría sin polígonos.`);
  if(multi)summary.multiPolygons++;
  for(const [pidx,poly] of polys.entries()){
   summary.polygons++;
   if(!Array.isArray(poly)||poly.length===0)throw Error(`${name}: polígono ${pidx+1} sin anillos.`);
   for(const [ridx,ring] of poly.entries()){
    summary.rings++;
    if(!Array.isArray(ring)||ring.length<4)throw Error(`${name}: anillo ${ridx+1} incompleto.`);
    let first=null,last=null;
    for(const [vidx,pos] of ring.entries()){
     if(!Array.isArray(pos)||pos.length<2||!Number.isFinite(pos[0])||!Number.isFinite(pos[1]))throw Error(`${name}: coordenada ${vidx+1} inválida.`);
     const [lon,lat]=pos;
     if(lon<MIN_LON||lon>MAX_LON||lat<MIN_LAT||lat>MAX_LAT)throw Error(`${name}: coordenadas fuera del marco nacional (${lon}, ${lat}).`);
     bounds.minLon=Math.min(bounds.minLon,lon);bounds.maxLon=Math.max(bounds.maxLon,lon);
     bounds.minLat=Math.min(bounds.minLat,lat);bounds.maxLat=Math.max(bounds.maxLat,lat);
     summary.vertices++;
     if(vidx===0)first=pos;
     last=pos;
    }
    if(Math.abs(first[0]-last[0])>GEO_EPS||Math.abs(first[1]-last[1])>GEO_EPS)throw Error(`${name}: el anillo ${ridx+1} no está cerrado.`);
   }
  }
 }
 return summary;
}
export function validateInegiGeoJSON(data,options={}){
 inspectInegiGeoJSON(data,options);
 return data;
}
export async function loadInegiGeoJSON({fetcher=fetch,allowRemote=true}={}){
 if(cached)return cached;
 for(const [url,origin] of [[INEGI_GEO_WEB,'copia ligera para visualización, derivada del original INEGI'],[INEGI_GEO_LOCAL,'archivo original local INEGI'],...(allowRemote?[[INEGI_GEO_URL,'servicio oficial de INEGI']]:[])]){
  const ac=new AbortController();const timeout=setTimeout(()=>ac.abort(),22000);
  try{const r=await fetcher(url,{signal:ac.signal});if(!r.ok)throw Error(`HTTP ${r.status}`);
   const raw=await r.json();const data=validateInegiGeoJSON(raw,{require32:true});cached={data,origin};return cached;
  }catch(err){console.warn('Límites INEGI:',origin,err.message);}finally{clearTimeout(timeout);}
 }
 throw Error('No se pudo cargar la capa de límites oficiales. Usa npm run sync:estados para guardar un archivo local, o vuelve a intentar cuando el servicio INEGI esté disponible.');
}
function labelFeature(feature){return nameOf(feature).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');}
export function wireInegiStates(map,key){
 const toggle=document.getElementById(`inegiToggle-${key}`),status=document.getElementById(`inegiStatus-${key}`);
 if(!toggle||!status)return;
 let layer=null,sequence=0;
 const notify=t=>status.textContent=t;
 toggle.addEventListener('click',async()=>{
  if(!map||!window.L){notify('Mapa Leaflet no disponible.');return;}
  if(layer){map.removeLayer(layer);layer=null;toggle.setAttribute('aria-pressed','false');toggle.textContent='Mostrar límites estatales INEGI';notify('Límites estatales ocultos.');return;}
  const seq=++sequence;toggle.disabled=true;notify('Consultando geometría estatal oficial…');
  try{const {data,origin}=await loadInegiGeoJSON();if(!map.getContainer().isConnected||seq!==sequence)return;
   layer=L.geoJSON(data,{style:()=>({color:'#00a6ff',weight:1.4,opacity:.82,fill:false}),
    onEachFeature:(f,l)=>l.bindPopup(`<strong>${labelFeature(f)}</strong><p>Área geoestadística estatal · INEGI, Marco Geoestadístico. Fecha precisa de corte: no verificada en el archivo.</p><p><b>No es</b> un límite de distribución CFE ni un sistema eléctrico CENACE. Si usas la copia ligera, su trazo es aproximado para visualización.</p>`)}).addTo(map);
   layer.bringToBack(); // límites detrás de los marcadores eléctricos; no capturar clics sobre centrales.
   toggle.setAttribute('aria-pressed','true');toggle.textContent='Ocultar límites estatales INEGI';notify(`${data.features.length} entidades federativas · ${origin}. La versión ligera es aproximada; no representa divisiones CFE ni sistemas eléctricos.`);
  }catch(err){notify(`La capa no se cargó: ${err.message}`);}finally{toggle.disabled=false;}
 });
}
