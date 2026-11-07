import {metric,panel,number,barChart,escapeHTML} from './charts.js';
import {officialMapWidget,wireOfficialMap,updateDistributionMap} from './official-maps.js';
import {wireDistributionFacilities} from './cfe-locations.js';
const e=escapeHTML;
export function calculateTransformer(VpV,ratio,SkVA){if(![VpV,ratio,SkVA].every(Number.isFinite)||VpV<=0||ratio<=0||SkVA<=0)return null;let Vs=VpV/ratio,Ip=SkVA*1e3/VpV,Is=SkVA*1e3/Vs;return {Vs,Ip,Is,powerW:SkVA*1e3};}
export function renderDistribution({indicators:i,distribution:d}){let dist=i.distribution;return `<div class="page-heading"><span class="eyebrow">MÓDULO 03 / DE LA RED AL USUARIO</span><h1>Distribución eléctrica</h1><p>Se distinguen indicadores nacionales de CFE para 2024 y estadísticas oficiales por las 16 divisiones correspondientes a 2022. Los polígonos territoriales exactos siguen pendientes de una fuente geográfica vectorial verificada.</p></div>
<div class="grid-4">${metric('Usuarios CFE, 2024',number(dist.users.value,1)+' millones','Informe Anual CFE 2024, p.95')}${metric('Redes generales CFE','≈ 901 mil km','Cifra redondeada · p.95')}${metric('Divisiones / Zonas','16 / 150','CFE 2024, p.95')}${metric('Pérdidas incl. alta tensión',number(dist.lossesPct.value,2)+' %','CFE 2024, p.96')}</div>
<section class="section grid-2">${panel('Pérdidas con alta tensión, 2022–2024',`${barChart(dist.lossesSeries.map((x,j)=>({name:String(2022+j),value:x.value})),{unit:'%',decimals:2})}<div class="source">CFE, Informe Anual 2024, p.96 (PDF 99). Alcance CFE Distribución; no representa exclusivamente MT+BT.</div>`)}${panel('Líneas de media y baja tensión, 2024',`${barChart([{name:'Media tensión',value:dist.mediumKm.value},{name:'Baja tensión',value:dist.lowKm.value}],{unit:'km'})}<div class="source">CFE, Informe Anual 2024, p.97 (PDF 100). Total MT+BT: ${number(dist.mediumKm.value+dist.lowKm.value)} km. Las cifras se conservan por categoría.</div>`)}</section>
<section class="section"><div class="section-heading"><div><h2>Continuidad del servicio eléctrico</h2><p>SAIDI expresa duración media de las interrupciones por usuario; SAIFI expresa frecuencia media de interrupciones. No son porcentajes.</p></div><span class="tag silver">CFE DISTRIBUCIÓN · 2022–2024</span></div><div class="grid-2">${panel('SAIDI: duración media',`${barChart(Object.entries(dist.continuity.SAIDI).map(([name,value])=>({name,value})),{unit:'min/cliente',decimals:3})}<div class="source">${e(dist.continuity.source)}. CFE Distribución, dato nacional.</div>`)}${panel('SAIFI: frecuencia media',`${barChart(Object.entries(dist.continuity.SAIFI).map(([name,value])=>({name,value})),{unit:'int./cliente',decimals:3})}<div class="source">${e(dist.continuity.source)}. CFE Distribución, dato nacional.</div>`)}</div></section>
<section class="section"><div class="section-heading"><div><h2>16 divisiones de CFE Distribución</h2><p>Nombres oficiales incluidos en el Manual de Organización General de CFE Distribución, actualizado en mayo de 2024.</p></div><span class="tag">DIRECTORIO DOCUMENTADO</span></div><div class="grid-2"><div class="panel"><label class="field">Seleccionar división<select id="divisionSelect"><option value="">Todas las divisiones</option>${d.divisions.map(x=>`<option value="${e(x.name)}">${e(x.name)}</option>`).join('')}</select></label><div id="distributionDivisions" class="division-grid">${d.divisions.map(x=>`<div class="division-chip">${e(x.name)}</div>`).join('')}</div><div class="source">CFE, Manual de Organización General de CFE Distribución, p. 14, Estructura orgánica. <a href="${e(d.source.url)}" target="_blank" rel="noopener noreferrer">Ver documento oficial</a>.</div></div><div class="panel" id="distributionMapCard">${officialMapWidget('distribution')}<div class="geo-map-base"><div class="inegi-controls"><button id="inegiToggle-distribution" type="button" class="map-mode" aria-pressed="false">Mostrar límites estatales INEGI</button><span id="inegiStatus-distribution" class="small muted" role="status">Capa vectorial opcional: estados, no regiones eléctricas.</span></div><div class="map-with-readout"><div id="distributionMap" class="map" role="region" aria-label="Mapa base de México para divisiones de distribución"></div><div id="distributionMapData" class="map-data-readout" role="status" aria-live="polite"></div></div><div class="focus-note note-warning map-overlay" id="divisionNote">Nueve instalaciones de Golfo Centro cuentan con coordenadas documentadas por CFE (2026). No son los límites de una división. Los datos regionales corresponden a 2022.</div><div class="facilities-tools"><button id="distributionFacilitiesFit" type="button" class="map-mode">Acercar a instalaciones verificadas</button><span class="small muted" id="distributionFacilitiesCount" role="status">9 instalaciones documentadas · 1 división</span></div><div class="facilities-preview" id="distributionFacilitiesPreview" aria-live="polite"></div><div class="source">Cartografía de referencia: <a href="${e(d.regionalStats2022.sourceURL)}" target="_blank" rel="noopener noreferrer">CFE, Figura III.1, p. 7</a>. Los marcadores son instalaciones publicadas por CFE con coordenadas en 2026; las estadísticas regionales son de 2022 y no corresponden individualmente a esos puntos. No hay polígonos georreferenciados de las 16 divisiones.</div></div></div></section>
<section class="section grid-2">${panel('Infraestructura de transformación CFE 2024',`${metric('Transformadores de distribución',number(dist.distributionTransformers.value),'CFE · p. 97')}${metric('Capacidad de transformación asociada',number(dist.transformerCapacity.value)+' MVA','CFE · p. 97')}<div class="focus-note">La capacidad instalada de transformadores en MVA no es generación de energía en GWh.</div>`)}${panel('Pérdidas: dos alcances distintos',`${barChart([{name:'Incl. alta tensión',value:dist.lossesPct.value},{name:'MT + BT',value:dist.lossesMTBT.value}],{unit:'%',decimals:2})}<div class="source">CFE, Informe Anual 2024, p.96. No se suman ni se restan directamente para inferir pérdidas de alta tensión porque sus bases de cálculo son diferentes.</div>`)}</section>

<section class="section" aria-labelledby="regional2022Heading"><div class="section-heading"><div><h2 id="regional2022Heading">Comparador regional documentado · 2022</h2><p>Información observada de las 16 divisiones. La gráfica muestra solo las primeras seis para mantener la pantalla legible; la lista completa permanece disponible en filtros y CSV.</p></div><span class="tag">CFE · TABLA III.1 · 2022</span></div>
<div class="grid-2"><div class="panel">
<div class="form-grid"><label class="field">Indicador regional <select id="divisionMetric"><option value="mediumVoltageKm">Líneas de media tensión (km)</option><option value="servicesThousand">Servicios (miles)</option><option value="salesGWh">Ventas de electricidad (GWh)</option><option value="stepdownSubstationMVA">Subestaciones AT/MT (MVA)</option><option value="distributionNetworkMVA">Transformación en redes (MVA)</option><option value="mediumVoltageCircuits">Circuitos de media tensión</option></select></label>
<label class="field">División a examinar<select id="divisionFocus"><option value="">Seleccionar una división</option>${d.divisions.map(x=>`<option value="${e(x.name)}">${e(x.name)}</option>`).join('')}</select></label></div>
<h3 style="margin-top:20px">Seis valores mayores</h3><div id="divisionRanking" aria-live="polite"></div><div id="divisionFocusData" class="regional-focus"></div>
<div class="source">CFE Distribución, <em>Programa de Ampliación y Modernización de las RGD 2023–2037</em>, Tabla III.1, pp. 8–9. <a href="${e(d.regionalStats2022.sourceURL)}" target="_blank" rel="noopener noreferrer">Fuente oficial</a>. Datos de 2022, no de 2024.</div></div>
<div class="panel"><div class="flex region-tools"><label class="field region-search">Buscar división<input id="divisionSearch" type="search" placeholder="Ej. Peninsular" aria-label="Buscar división en la tabla"></label><button id="divisionCsv" type="button" class="button secondary">Exportar las 16 divisiones (CSV)</button></div><div id="divisionTable" aria-live="polite" class="regional-table-wrap"></div><div class="flex table-pagination"><button id="divisionPrev" type="button" class="button secondary">Anterior</button><span id="divisionPageInfo" class="muted small"></span><button id="divisionNext" type="button" class="button secondary">Siguiente</button></div><div class="focus-note">El número de servicios está expresado en miles de contratos de suministro. No debe confundirse con número de habitantes ni con los usuarios nacionales reportados para 2024.</div></div></div></section>

<section class="section"><div class="section-heading"><div><h2>Simulador de transformador ideal</h2><p>Calcula magnitudes RMS para un transformador monofásico ideal. Los datos iniciales son didácticos, no de un equipo en servicio.</p></div><span class="tag">SIMULACIÓN</span></div><div class="grid-2"><div class="panel"><div class="form-grid"><label class="field">Tensión primaria Vp (V RMS)<input id="transformerVp" type="number" min="0.001" step="100" value="13200"></label><label class="field">Relación de espiras Np/Ns<input id="transformerRatio" type="number" min="0.001" step="1" value="110"></label><label class="field">Potencia aparente S (kVA)<input id="transformerS" type="number" min="0.001" step="1" value="25"></label></div><div class="divider"></div><div class="focus-note">Vp / Vs = Np / Ns<br>Vp × Ip = Vs × Is = S (transformador ideal)</div><p class="small">Supone eficiencia de 100 %, sin pérdidas eléctricas ni magnéticas, sin corriente magnetizante, sin saturación y sin caída de tensión. En circuitos trifásicos cambian las relaciones de línea/fase según la conexión.</p></div><div class="panel"><div id="transformerResults" aria-live="polite"></div><div class="divider"></div><h3>Relación de corrientes</h3><div id="transformerChart"></div><div class="source">RESULTADO DE SIMULACIÓN · no representa un transformador real de CFE.</div></div></div></section>`;}
export function wireDistribution(ctx,map){wireOfficialMap('distribution');const facilities=wireDistributionFacilities(map,ctx.distribution_locations);updateDistributionMap(ctx.distribution.divisions,'');const sel=document.getElementById('divisionSelect');sel?.addEventListener('change',()=>{let s=sel.value;updateDistributionMap(ctx.distribution.divisions,s,document.getElementById('divisionMetric')?.value);facilities.selectDivision(s);let list=document.getElementById('distributionDivisions');let d=ctx.distribution.divisions.filter(x=>!s||x.name===s);list.innerHTML=d.map(x=>`<div class="division-chip">${e(x.name)}</div>`).join('');document.getElementById('divisionNote').textContent=s?`${s}: ${facilities.countFor(s)} instalaciones georreferenciadas en la capa documental de 2026. Las estadísticas divisionales de 2022 se consultan en el comparador; no se atribuyen a almacenes. Sin polígonos territoriales oficiales.`:'Se muestran instalaciones oficiales documentadas (2026), no límites de divisiones. Los polígonos siguen pendientes de geometría institucional verificable.'});let ids=['transformerVp','transformerRatio','transformerS'];const update=()=>{let ans=calculateTransformer(...ids.map(id=>document.getElementById(id).valueAsNumber)),out=document.getElementById('transformerResults'),chart=document.getElementById('transformerChart');if(!ans){out.innerHTML='<div class="focus-note note-warning">Introduce valores positivos para tensión, relación de espiras y potencia aparente.</div>';chart.innerHTML='';return;}out.innerHTML=`<div class="grid-2"><div class="sim-result"><span>Tensión secundaria Vs</span><b>${number(ans.Vs,2)} V</b></div><div class="sim-result"><span>Corriente primaria Ip</span><b>${number(ans.Ip,3)} A</b></div><div class="sim-result"><span>Corriente secundaria Is</span><b>${number(ans.Is,3)} A</b></div><div class="sim-result"><span>Potencia aparente ideal</span><b>${number(ans.powerW/1e3,2)} kVA</b></div></div>`;chart.innerHTML=barChart([{name:'Primaria',value:ans.Ip},{name:'Secundaria',value:ans.Is}],{unit:'A',decimals:2});};ids.forEach(id=>document.getElementById(id)?.addEventListener('input',update));update();wireRegionalDistribution(ctx.distribution);}


export const DIVISION_METRICS = {
  mediumVoltageKm:{label:'Líneas de media tensión',unit:'km'},
  servicesThousand:{label:'Servicios',unit:'miles'},
  salesGWh:{label:'Ventas de electricidad',unit:'GWh'},
  stepdownSubstationMVA:{label:'Capacidad AT/MT',unit:'MVA'},
  distributionNetworkMVA:{label:'Capacidad de redes',unit:'MVA'},
  mediumVoltageCircuits:{label:'Circuitos de media tensión',unit:'circuitos'}
};
export function divisionRanking(divisions,key,limit=6){
 if(!DIVISION_METRICS[key])return [];
 return divisions.filter(x=>Number.isFinite(x.observed2022?.[key]))
 .map(x=>({name:x.name,value:x.observed2022[key]}))
 .sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name,'es')).slice(0,limit);
}
export function divisionCSV(divisions){
 const columns=['División','AT/MT MVA','Circuitos MT','Longitud MT km','Redes MVA','Servicios miles','Ventas GWh','Año'];
 const quote=x=>'"'+String(x).replaceAll('"','""')+'"';
 return [columns.map(quote).join(','),...divisions.map(x=>[
 x.name,...['stepdownSubstationMVA','mediumVoltageCircuits','mediumVoltageKm','distributionNetworkMVA','servicesThousand','salesGWh'].map(k=>x.observed2022?.[k]??''),2022
 ].map(quote).join(','))].join('\r\n');
}
function wireRegionalDistribution(d){
 const divisions=d.divisions;
 const metricSel=document.getElementById('divisionMetric');
 const focusSel=document.getElementById('divisionFocus');
 const search=document.getElementById('divisionSearch');
 const table=document.getElementById('divisionTable');
 const prev=document.getElementById('divisionPrev');
 const next=document.getElementById('divisionNext');
 let page=0;
 const update=()=>{
   const key=metricSel.value;
   updateDistributionMap(divisions,document.getElementById('divisionSelect')?.value||'',key);
   const info=DIVISION_METRICS[key];
   document.getElementById('divisionRanking').innerHTML=barChart(divisionRanking(divisions,key),{unit:info.unit});
   const focus=divisions.find(x=>x.name===focusSel.value);
   const focusEl=document.getElementById('divisionFocusData');
   focusEl.innerHTML=focus?`<h3>${e(focus.name)} · 2022</h3><div class="grid-2">${[
     ['AT/MT',focus.observed2022.stepdownSubstationMVA,'MVA'],
     ['Circuitos MT',focus.observed2022.mediumVoltageCircuits,'circuitos'],
     ['Líneas MT',focus.observed2022.mediumVoltageKm,'km'],
     ['Capacidad RGD',focus.observed2022.distributionNetworkMVA,'MVA'],
     ['Servicios',focus.observed2022.servicesThousand,'miles'],
     ['Ventas',focus.observed2022.salesGWh,'GWh']
    ].map(x=>`<div class="regional-mini"><span>${e(x[0])}</span><strong>${number(x[1])} ${e(x[2])}</strong></div>`).join('')}</div>`:'<p class="small muted">Selecciona una división para ver los seis indicadores oficiales publicados.</p>';
   const filt=divisions.filter(x=>x.name.toLocaleLowerCase('es').includes(search.value.trim().toLocaleLowerCase('es'))).sort((a,b)=>b.observed2022[key]-a.observed2022[key]);
   const pages=Math.max(1,Math.ceil(filt.length/8));page=Math.min(page,pages-1);
   table.innerHTML=`<table class="regional-table"><thead><tr><th scope="col">División</th><th scope="col">${e(info.label)} (${e(info.unit)})</th></tr></thead><tbody>${filt.slice(page*8,page*8+8).map(x=>`<tr><td>${e(x.name)}</td><td>${number(x.observed2022[key])}</td></tr>`).join('')||'<tr><td colspan="2">Sin resultados.</td></tr>'}</tbody></table>`;
   document.getElementById('divisionPageInfo').textContent=`${filt.length} divisiones · página ${page+1} de ${pages}`;
   prev.disabled=page===0;next.disabled=page>=pages-1;
 };
 metricSel?.addEventListener('change',()=>{page=0;update()});
 focusSel?.addEventListener('change',()=>{document.getElementById('divisionSelect').value=focusSel.value;document.getElementById('divisionSelect').dispatchEvent(new Event('change'));update()});
 search?.addEventListener('input',()=>{page=0;update()});
 prev?.addEventListener('click',()=>{page=Math.max(0,page-1);update()});
 next?.addEventListener('click',()=>{page++;update()});
 document.getElementById('divisionCsv')?.addEventListener('click',()=>{
  const blob=new Blob(['\ufeff'+divisionCSV(divisions)],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cfe_divisiones_2022_tabla_III_1.csv';a.click();URL.revokeObjectURL(url);
 });
 update();
}
