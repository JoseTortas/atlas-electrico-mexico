/**
 * Auditoría de atributos por capa; jamás equiparar combustible con tecnología de planta.
 * Los nombres son familias tecnológicas identificables en la denominación de PrimSource,
 * NO una certificación de la tecnología individual de cada central.
 */
const unavailable=s=>!s||/^(dato no disponible|sin dato|desconocido)$/i.test(String(s).trim());
const basicNormalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const ALIASES=new Map([
 ['mexico','Estado de México'],['estado de mexico','Estado de México'],['district federal','Ciudad de México'],
 ['distrito federal','Ciudad de México'],['ciudad de mexico','Ciudad de México'],['cdmx','Ciudad de México'],
 ['coahuila','Coahuila de Zaragoza'],['michoacan','Michoacán de Ocampo'],['veracruz','Veracruz de Ignacio de la Llave']
]);
export function normalizedStateName(value){
 if(unavailable(value))return '';
 const name=String(value).trim();return ALIASES.get(basicNormalize(name))||basicNormalize(name);
}
export function identifiableTechnologyFromSource(primarySource){
 const v=basicNormalize(primarySource);
 const direct={hydroelectric:'Hidroeléctrica',hydro:'Hidroeléctrica',wind:'Eólica',geothermal:'Geotérmica',nuclear:'Nucleoeléctrica',
  'solar photovoltaic':'Solar fotovoltaica','photovoltaic':'Solar fotovoltaica'};
 return direct[v]??null;
}
export function auditGenerationPlants(plants){
 const items=(plants||[]).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&p.lat>=14&&p.lat<=33&&p.lon>=-119&&p.lon<=-86);
 const states=new Set(items.map(p=>normalizedStateName(p.state)).filter(Boolean));
 const sources=new Set(items.map(p=>p.source).filter(s=>!unavailable(s)));
 const withMW=items.filter(p=>Number.isFinite(p.mw)&&p.mw>=0);
 const techFamilies=new Set(items.map(p=>identifiableTechnologyFromSource(p.source)).filter(Boolean));
 const explicitTech=new Set(items.map(p=>p.technology).filter(s=>!unavailable(s)));
 return {points:items.length,states:states.size,primarySources:sources.size,withMW:withMW.length,
  identifiableTechnologyFamilies:[...techFamilies].sort((a,b)=>a.localeCompare(b,'es')),
  explicitTechnologyTypes:explicitTech.size,
  meets15points:items.length>=15,meets5states:states.size>=5,meets4Sources:sources.size>=4,
  fourTechnologiesProven:explicitTech.size>=4};
}
export function auditProdesenCatalog(catalog){
 const plants=Array.isArray(catalog)?catalog:catalog?.plants??[];
 return {plants:plants.length,states:new Set(plants.map(p=>normalizedStateName(p.state)).filter(Boolean)).size,
  technologies:[...new Set(plants.map(p=>p.technology).filter(s=>!unavailable(s)))].sort((a,b)=>a.localeCompare(b,'es')),
  withIndividualMW:plants.filter(p=>Number.isFinite(p.installedMW)&&p.installedMW>0).length,
  withCoordinates:plants.filter(p=>Number.isFinite(p.coordinates?.lat)&&Number.isFinite(p.coordinates?.lon)).length};
}
export function auditMapSources({generation=0,transmissionCities=0,distributionFacilities=0}={}){
 return [{key:'generation',value:generation,kind:'centrales 2017'},
  {key:'transmission',value:transmissionCities,kind:'ciudades de gerencia 2017'},
  {key:'distribution',value:distributionFacilities,kind:'instalaciones 2026'}];
}
