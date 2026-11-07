/**
 * Catálogo público CANIE/NACEI de centrales eléctricas: referencia histórica AGOSTO 2017.
 * Proveedor: SENER (México), Natural Resources Canada y DOE (Estados Unidos).
 * La capacidad MW de 2017 NO es una medición para 2023/2024.
 * El mapa base (OSM) es independiente de la capa de centrales.
 */
export const NACEI_SERVICE = 'https://geoappext.nrcan.gc.ca/arcgis/rest/services/NACEI/energy_infrastructure_of_north_america_en/MapServer';
export const NACEI_SOURCE = 'https://open.canada.ca/data/en/dataset/40fbe40c-01cd-49d3-8add-0d20ed64c90d';
export const NACEI_RENEW_SOURCE = 'https://open.canada.ca/data/en/dataset/490db619-ab58-4a2a-a245-2376ce1840de';
export const NACEI_LAYERS = Object.freeze({all:15,renewable:28});
export const NACEI_FIELDS = 'OBJECTID,Country,Facility,Owner,City,County,StateProv,Total_MW,PrimSource,PrimRenew,Latitude,Longitude,Period';
export const NACEI_REFERENCE_YEAR = 2017;
export const NACEI_PUBLICATION = 'Agosto de 2017';
export const NACEI_SOURCE_ES = 'https://base.energia.gob.mx/nacei/mapas_infraestructura_energetica.aspx';

const normalizeCountry = (v) => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
const isMexico = (v) => ['mexico', 'mex'].includes(normalizeCountry(v));
const layerName = layer => layer === 'renewable' ? 'Renovables ≥1 MW' : 'Centrales ≥100 MW';

/** Normalizar GeoJSON o REST JSON de ArcGIS con coordenadas reales del registro oficial. */
export function normalizeNaceiFeatures(collection, layer='all') {
  if (!(layer in NACEI_LAYERS)) throw new Error('Capa geográfica no reconocida.');
  let rows;
  if (collection?.type === 'FeatureCollection' && Array.isArray(collection.features)) {
    rows = collection.features.map(f => ({props:f.properties ?? {}, xy:f.geometry?.type === 'Point' ? f.geometry.coordinates : null, fallbackId:f.id}));
  } else if (Array.isArray(collection?.features)) {
    rows = collection.features.map(f => ({props:f.attributes ?? {},xy:f.geometry && Number.isFinite(Number(f.geometry.x)) && Number.isFinite(Number(f.geometry.y)) ? [Number(f.geometry.x),Number(f.geometry.y)] : null,fallbackId:undefined}));
  } else {
    throw new Error('La respuesta oficial no tiene estructura GeoJSON/ArcGIS válida.');
  }
  const seen = new Set();
  const result=[];
  for (const {props:p,xy,fallbackId} of rows) {
    if (!isMexico(p.Country)) continue;
    const lat=Number(xy?.[1] ?? p.Latitude);
    const lon=Number(xy?.[0] ?? p.Longitude);
    // Límites amplios únicamente para detectar errores de campo/hemisferio, NO para inferir ubicaciones.
    if (!Number.isFinite(lat)||!Number.isFinite(lon)||lat<14||lat>33||lon< -119||lon> -86) continue;
    const mw=p.Total_MW == null || String(p.Total_MW).trim()==='' ? null : Number(p.Total_MW);
    if (mw!==null && (!Number.isFinite(mw)||mw<0)) continue;
    const name=String(p.Facility ?? '').trim();
    if (!name) continue;
    const id=`${layer}:${String(p.OBJECTID ?? fallbackId ?? `${name}-${lat}-${lon}`)}`;
    if (seen.has(id))continue;
    seen.add(id);
    result.push({id,name,state:String(p.StateProv ?? 'Dato no disponible').trim() || 'Dato no disponible',
      city:String(p.City ?? p.County ?? 'Dato no disponible').trim() || 'Dato no disponible',
      source:String((layer==='renewable' ? p.PrimRenew || p.PrimSource : p.PrimSource || p.PrimRenew) ?? 'Dato no disponible').trim() || 'Dato no disponible',
      mw,lat,lon,owner:String(p.Owner ?? 'Dato no disponible').trim() || 'Dato no disponible',
      period:String(p.Period ?? NACEI_PUBLICATION).trim() || NACEI_PUBLICATION,layer});
  }
  return result;
}

export function filterNaceiPlants(plants,{source='',state='',search='',minimumMW=0}={}) {
  const q=String(search).trim().toLocaleLowerCase('es');
  const threshold=Number(minimumMW)||0;
  return plants.filter(x=>(!source||x.source===source)&&(!state||x.state===state)&&(!threshold||(x.mw!==null&&x.mw>=threshold))&&(!q||[x.name,x.city,x.state,x.owner].some(s=>s.toLocaleLowerCase('es').includes(q))));
}

export function summarizeNaceiPlants(plants){
  const sumKnownMW=plants.reduce((a,p)=>a+(p.mw===null?0:p.mw),0);
  const countKnownMW=plants.filter(p=>p.mw!==null).length;
  const states=new Set(plants.map(p=>p.state)).size;
  const bySource=Object.entries(plants.reduce((out,p)=>(out[p.source]=(out[p.source]||0)+1,out),{}))
    .map(([source,count])=>({source,count})).sort((a,b)=>b.count-a.count||a.source.localeCompare(b.source));
  return {count:plants.length,states,countKnownMW,sumKnownMW,bySource};
}

/** Para Node: descargar snapshot verificado, sin alteraciones de coordenadas o capacidad. */
export async function queryNaceiService(layer='all',{fetcher=fetch,timeoutMs=22000,pageSize=500}={}){
  if (!(layer in NACEI_LAYERS)) throw new Error('Capa geográfica no reconocida.');
  const all=[];
  // Limitar al país en la consulta, volver a validar país y coordenadas localmente.
  for(let offset=0; offset<10000; offset+=pageSize){
    const u=new URL(`${NACEI_SERVICE}/${NACEI_LAYERS[layer]}/query`);
    u.searchParams.set('where',"Country = 'Mexico'");
    u.searchParams.set('outFields',NACEI_FIELDS);
    u.searchParams.set('returnGeometry','true');
    u.searchParams.set('outSR','4326');
    u.searchParams.set('orderByFields','OBJECTID ASC');
    u.searchParams.set('resultOffset',String(offset));
    u.searchParams.set('resultRecordCount',String(pageSize));
    u.searchParams.set('f','json');
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs);
    let body;
    try{
      const r=await fetcher(u.toString(),{signal:controller.signal,headers:{Accept:'application/json'}});
      if(!r.ok) throw new Error(`El servicio CANIE respondió HTTP ${r.status}.`);
      body=await r.json();
    }finally{clearTimeout(timer);}
    if(body.error) throw new Error(`El servicio CANIE devolvió: ${body.error.message||'error no especificado'}`);
    if(!Array.isArray(body.features))throw new Error('El proveedor no devolvió una lista de centrales.');
    const count=body.features.length;
    all.push(...normalizeNaceiFeatures(body,layer));
    if(count<pageSize && !body.exceededTransferLimit)break;
    if(offset+pageSize>=10000)throw new Error('La consulta excedió el límite de páginas previsto. No se publican resultados incompletos.');
  }
  const unique=[...new Map(all.map(x=>[x.id,x])).values()];
  if(!unique.length)throw new Error('El servicio no devolvió centrales mexicanas con coordenadas verificables.');
  return unique;
}

/** Busca snapshot en la carpeta data/, luego consulta CANIE directamente. */
const cache=new Map();
export async function fetchNaceiPlants(layer='all',{refresh=false}={}){
  if(!(layer in NACEI_LAYERS))throw new Error('Capa geográfica no reconocida.');
  if(!refresh && cache.has(layer))return cache.get(layer);
  if(!refresh){
    try{
      const r=await fetch(`data/nacei_2017_${layer}.json`,{cache:'no-cache'});
      if(r.ok){
        const doc=await r.json();
        if(doc?.metadata?.provider!=='CANIE/NACEI'||doc.metadata?.referenceYear!==2017||doc.metadata?.layer!==layer||!Array.isArray(doc.plants))throw new Error('Metadatos locales incorrectos.');
        // El snapshot procede del mismo normalizador, pero volver a validar cada posición.
        const safe=doc.plants.filter(p=>p.layer===layer&&p.name&&Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=14&&p.lat<=33&&p.lon>=-119&&p.lon<=-86&&(p.mw===null||(Number.isFinite(p.mw)&&p.mw>=0)));
        if(safe.length!==doc.plants.length||!safe.length)throw new Error('El archivo local contiene registros inválidos.');
        const result={plants:safe,origin:'snapshot local',sourceUrl:doc.metadata.sourceUrl};
        cache.set(layer,result);return result;
      }
    }catch(err){console.warn('Snapshot CANIE no disponible:',err.message);}
  }
  const plants=await queryNaceiService(layer);
  const result={plants,origin:'servicio GIS oficial',sourceUrl:layer==='renewable'?NACEI_RENEW_SOURCE:NACEI_SOURCE};
  cache.set(layer,result);return result;
}

export function buildNaceiSnapshot(plants,layer){
  return {metadata:{provider:'CANIE/NACEI',referenceYear:NACEI_REFERENCE_YEAR,publication:NACEI_PUBLICATION,
      layer,description:layerName(layer),sourceUrl:layer==='renewable'?NACEI_RENEW_SOURCE:NACEI_SOURCE,
      serviceLayerUrl:`${NACEI_SERVICE}/${NACEI_LAYERS[layer]}`,coordinateReference:'EPSG:4326',
      methodology:'Consulta de registros oficiales; validación de país y coordenadas; no son datos de 2023/2024'},
    plants};
}
