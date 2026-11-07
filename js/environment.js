import {escapeHTML,number,barChart} from './charts.js';

export function validateEmissionsDocument(doc){
  if(!doc?.metadata?.sourceURL?.startsWith('https://www.ipcc.ch/') || !Array.isArray(doc.technologies)) return false;
  const ids=new Set();
  for(const r of doc.technologies){
    if(!r.resourceId || ids.has(r.resourceId)||r.unit!=='gCO₂eq/kWh'||!Number.isFinite(r.lifeCycleMedian)||r.lifeCycleMedian<0) return false;
    if(r.directMedian!==null && (!Number.isFinite(r.directMedian)||r.directMedian<0))return false;
    if(r.lifeCycleMin>r.lifeCycleMedian || r.lifeCycleMedian>r.lifeCycleMax) return false;
    ids.add(r.resourceId);
  }
  return doc.technologies.length>=7;
}
export function emissionByResource(doc,resourceId){return doc?.technologies?.find(x=>x.resourceId===resourceId)||null;}
export const emissionRows=(doc,ids,mode='lifeCycleMedian')=>{
 const validModes=['lifeCycleMedian','directMedian'];if(!validModes.includes(mode))return [];
 return doc.technologies.filter(x=>ids.includes(x.resourceId)&&x[mode]!=null).map(x=>({name:x.name,value:x[mode]})).sort((a,b)=>b.value-a.value);
};
export function renderEnvironmentSection(doc){
 if(!validateEmissionsDocument(doc))return '<div class="focus-note note-warning">Factores ambientales: dato no disponible. Falta validar fuente y límites del análisis.</div>';
 const m=doc.metadata;
 return `<section class="section" id="environmentSection"><div class="section-heading"><div><h2>Emisiones por tecnología: referencia IPCC</h2><p>Selecciona las emisiones <strong>directas</strong> (operación) o de <strong>ciclo de vida</strong> (incluye etapas anteriores y posteriores). Referencias internacionales, no inventario mexicano.</p></div><span class="tag">FUENTE COMPLEMENTARIA · 2014</span></div>
 <div class="grid-2"><article class="panel"><div class="field"><label for="environmentMode">Alcance de emisiones</label><select id="environmentMode"><option value="lifeCycleMedian">Ciclo de vida · mediana</option><option value="directMedian">Directas · mediana cuando consta</option></select></div><div id="environmentChart" aria-live="polite"></div><div class="source">${escapeHTML(m.institution)} · ${escapeHTML(m.document)} · Tabla ${escapeHTML(m.table)} · p. ${m.printedPage} (PDF p. ${m.pdfPage}). <a href="${escapeHTML(m.sourceURL)}" target="_blank" rel="noopener noreferrer">Ver documento oficial</a></div></article>
 <article class="panel"><h3>¿Por qué los dos valores no son equivalentes?</h3><div class="mini-stat"><span>Directas</span><strong>Durante la operación</strong></div><div class="mini-stat"><span>Ciclo de vida</span><strong>Incluye la cadena de suministro</strong></div><p>Las medianas provienen de tecnologías definidas (por ejemplo, <em>carbón pulverizado</em> y <em>gas en ciclo combinado</em>). Un valor directo de cero en la tabla <strong>no</strong> implica que una central carezca de impacto ambiental.</p><p>La biomasa dedicada tiene emisiones directas <strong>no disponibles</strong> en esta tabla y una mediana de ciclo de vida de 230 gCO₂eq/kWh, cuya interpretación depende del origen y manejo del recurso.</p><p>El intervalo hidroeléctrico de ciclo de vida es particularmente amplio: 1 a 2,200 gCO₂eq/kWh. No debe generalizarse su mediana a cualquier embalse.</p><div class="focus-note note-warning">No multiplicar estas medianas internacionales por los GWh nacionales para declarar emisiones reales de México. Eso produciría estimaciones no verificadas.</div></article></div></section>`;
}
export function wireEnvironment(doc){
 const select=document.getElementById('environmentMode'),out=document.getElementById('environmentChart');
 if(!select||!out||!validateEmissionsDocument(doc))return;
 const draw=()=>{
  const mode=select.value;
  const rows=emissionRows(doc,doc.technologies.map(x=>x.resourceId),mode);
  out.innerHTML=barChart(rows,{unit:'gCO₂eq/kWh',decimals:0})+`<p class="small muted">${mode==='lifeCycleMedian'?'Rangos mínimo-máximo disponibles en el comparador inferior.':'El valor directo de biomasa dedicada no consta en la tabla: se excluye sin asignarle 0.'}</p>`;
 };
 select.addEventListener('change',draw);draw();
}
export function emissionComparisonHTML(selected,doc){
 if(!validateEmissionsDocument(doc))return '';
 const rows=selected.map(resource=>({resource,em:emissionByResource(doc,resource.id)}));
 return `<div class="scroll-x"><table class="compare-table" aria-label="Emisiones IPCC por tecnología"><thead><tr><th>Recurso / tecnología IPCC comparable</th><th>Directas · mediana</th><th>Ciclo de vida · mediana</th><th>Intervalo ciclo de vida</th></tr></thead><tbody>${rows.map(({resource,em})=>`<tr><td><strong>${escapeHTML(resource.name)}</strong><br>${em?escapeHTML(em.name):'<span class="muted">Tecnología específica no documentada</span>'}</td><td>${em?.directMedian==null?'Dato no disponible':number(em.directMedian)}</td><td>${em?number(em.lifeCycleMedian):'Dato no disponible'}</td><td>${em?number(em.lifeCycleMin,em.lifeCycleMin%1?1:0)+'–'+number(em.lifeCycleMax):'Dato no disponible'}</td></tr>`).join('')}</tbody></table></div><p class="source">Unidad: gCO₂eq/kWh. IPCC AR5 Grupo III, Anexo III, Tabla A.III.2, p. 1335 (PDF p. 7). ${rows.filter(x=>x.em).map(x=>escapeHTML(x.em.note)).join(' ')}</p>`;
}
