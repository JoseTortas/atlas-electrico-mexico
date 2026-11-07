import {number,barChart,metric,escapeHTML} from './charts.js';
const E=escapeHTML;
export const NATIONAL_GROUPS={all:'Todas las tecnologías',fosil:'Fuentes fósiles',limpia:'Energías limpias (normativa)',renovable:'Renovables',limpia_no_renovable:'Nuclear',limpia_segun_normativa:'Cogeneración eficiente'};
export const isClean=t=>t.category!=='fosil';
export function nationalYearTotals(data,year){return data.totals[String(year)]||null;}
export function nationalTechnologyRows(data,year,{group='all',search=''}={}){
 if(!data?.technologies||!nationalYearTotals(data,year))return [];
 let term=String(search).trim().toLocaleLowerCase('es');
 return data.technologies.filter(t=>(group==='all'||group==='fosil'&&t.category==='fosil'||group==='limpia'&&isClean(t)||group==='renovable'&&t.category==='renovable'||group===t.category)&&(!term||t.name.toLocaleLowerCase('es').includes(term)))
 .map(t=>({...t,gwh:t.generationGWh[String(year)],share:t.generationGWh[String(year)]/nationalYearTotals(data,year).generationGWh*100,variation:year>2022?(t.generationGWh[String(year)]/t.generationGWh[String(year-1)]-1)*100:null})).sort((a,b)=>b.gwh-a.gwh);
}
export function nationalCSV(rows,year){return '\uFEFF'+['Año,Tecnología,Categoría,GWh,Participación del total (%),Variación respecto al año anterior (%)',...rows.map(x=>[year,'"'+x.name.replaceAll('"','""')+'"',x.category,x.gwh,x.share.toFixed(4),x.variation===null?'':x.variation.toFixed(4)].join(','))].join('\r\n');}
export function validateNationalGeneration(data){
 if(!data?.metadata?.sourceURL?.startsWith('https://sidof.segob.gob.mx')||data.technologies.length!==12)return false;
 if(new Set(data.technologies.map(x=>x.id)).size!==12)return false;
 return [2022,2023,2024].every(year=>{let a=nationalYearTotals(data,year);if(!a||a.generationGWh!==a.cleanGWh+a.fossilGWh)return false;
 return data.technologies.reduce((s,t)=>s+t.generationGWh[String(year)],0)===a.generationGWh &&
 data.technologies.filter(isClean).reduce((s,t)=>s+t.generationGWh[String(year)],0)===a.cleanGWh;});
}
function table(rows,year){return `<div class="scroll-x"><table class="compare-table national-table"><thead><tr><th>Tecnología</th><th>GWh</th><th>% SEN</th><th>Variación interanual</th></tr></thead><tbody>${rows.map(x=>`<tr><td><strong>${E(x.name)}</strong><span class="catalog-sub">${x.category==='fosil'?'Fósil':x.category==='renovable'?'Renovable':x.category==='limpia_no_renovable'?'Limpia no renovable':'Limpia según normativa'}</span></td><td>${number(x.gwh)}</td><td>${number(x.share,2)} %</td><td>${x.variation===null?'No aplica':`${x.variation>=0?'+':''}${number(x.variation,2)} %`}</td></tr>`).join('')}</tbody></table></div>`;}
export function nationalGenerationSection(d){const y=2024, t=nationalYearTotals(d,y), clean=t.cleanGWh/t.generationGWh*100;
 return `<section class="section" id="nationalGenerationSection"><div class="section-heading"><div><span class="eyebrow">SERIE NACIONAL VERIFICADA · SENER 2025</span><h2>Generación neta inyectada al SEN, 2022–2024</h2><p>Doce tecnologías con el mismo criterio y fuente. Excluye generación distribuida y autoabasto local. No se mezcla con generación bruta CFE.</p></div><span class="tag">GWh · OBSERVADO</span></div>
 <div class="grid-4">${metric('Generación SEN 2024',number(t.generationGWh)+' GWh','SENER · DOF 2025, tabla 2.2')}${metric('Energía limpia 2024',number(t.cleanGWh)+' GWh',number(clean,2)+' % del SEN')}${metric('Generación fósil 2024',number(t.fossilGWh)+' GWh',number(100-clean,2)+' % del SEN')}${metric('Cambio neto 2024/2023','+'+number((t.generationGWh/d.totals['2023'].generationGWh-1)*100,2)+' %','Cálculo de una serie homogénea')}</div>
 <div class="grid-2 section"><article class="panel"><h3>Evolución nacional en GWh</h3>${barChart([2022,2023,2024].map(x=>({name:String(x),value:d.totals[x].generationGWh})),{unit:'GWh'})}</article><article class="panel"><h3>Participación limpia 2022–2024</h3>${barChart([2022,2023,2024].map(x=>({name:String(x),value:d.totals[x].cleanGWh/d.totals[x].generationGWh*100})),{unit:'%',decimals:2})}</article></div>
 <article class="panel section"><div class="section-heading"><div><h3>Explora las 12 tecnologías</h3><p>Cambia el año, la categoría o el criterio. La tabla muestra siete registros; la gráfica conserva todas las tecnologías que coinciden con el filtro.</p></div><button class="button secondary" type="button" id="nationalExport">Exportar datos filtrados CSV</button></div>
 <div class="national-controls"><label class="field">Año<select id="nationalYear"><option>2022</option><option>2023</option><option selected>2024</option></select></label><label class="field">Grupo<select id="nationalGroup"><option value="all">Todas las tecnologías</option><option value="fosil">Fósiles</option><option value="limpia">Limpias según normativa</option><option value="renovable">Renovables</option><option value="limpia_no_renovable">Nuclear</option><option value="limpia_segun_normativa">Cogeneración eficiente</option></select></label><label class="field">Buscar tecnología<input id="nationalSearch" type="search" placeholder="Ciclo combinado, eólica..."></label><label class="field">Ordenar gráfica por<select id="nationalMetric"><option value="gwh">Generación (GWh)</option><option value="share">Participación del SEN (%)</option></select></label></div>
 <div class="grid-2"><div><div id="nationalChart" aria-live="polite"></div></div><div><div id="nationalFilteredSummary" aria-live="polite"></div><div id="nationalTable" aria-live="polite"></div><div class="national-pagination"><button class="button secondary" type="button" id="nationalPrev">Anterior</button><span id="nationalPageLabel"></span><button class="button secondary" type="button" id="nationalNext">Siguiente</button></div></div></div>
 <div class="focus-note note-warning">La categoría «energía limpia» es normativa e incluye nuclear y cogeneración eficiente; no equivale a renovables. En la matriz SENER la cogeneración eficiente se cuenta como limpia conforme a los criterios de la fuente; no significa que su combustible sea renovable.</div>
 <div class="source">SENER, <em>Plan de Desarrollo del Sector Eléctrico 2025–2039</em>, DOF 17/10/2025, Tabla 2.2, p. 21. <a target="_blank" rel="noopener noreferrer" href="${E(d.metadata.sourceURL)}">Consultar fuente oficial</a>. Valores observados, no proyecciones.</div></article>
 <div class="focus-note section">Nota histórica: PRODESEN 2023–2037 reportaba 340,713 GWh y 31.2% limpio para 2022 con otra cobertura/metodología. La serie DOF 2025 presenta 333,964 GWh y 26.68% limpio en 2022. Las dos referencias se conservan separadas; no se interpreta la diferencia como crecimiento o pérdida de energía.</div></section>`;}
export function wireNationalGeneration(d){
 let ids=['nationalYear','nationalGroup','nationalSearch','nationalMetric'];if(!document.getElementById('nationalYear'))return;
 let page=0,perPage=7,rows=[];
 function draw(){const year=Number(document.getElementById('nationalYear').value),group=document.getElementById('nationalGroup').value,search=document.getElementById('nationalSearch').value,metric=document.getElementById('nationalMetric').value;
 rows=nationalTechnologyRows(d,year,{group,search});let n=Math.max(1,Math.ceil(rows.length/perPage));page=Math.max(0,Math.min(page,n-1));
 document.getElementById('nationalChart').innerHTML=rows.length?barChart(rows.map(x=>({name:x.name,value:metric==='share'?x.share:x.gwh})),{unit:metric==='share'?'%':'GWh',decimals:metric==='share'?2:0}):'<p class="empty">No hay tecnologías que coincidan con los filtros.</p>';
 let sum=rows.reduce((s,x)=>s+x.gwh,0),tot=d.totals[year].generationGWh;
 document.getElementById('nationalFilteredSummary').innerHTML=`<div class="mini-stat"><span>Tecnologías mostradas en gráfica</span><strong>${rows.length} de 12</strong></div><div class="mini-stat"><span>Generación del filtro</span><strong>${number(sum)} GWh</strong></div><div class="mini-stat"><span>Participación del filtro en el SEN</span><strong>${number(sum/tot*100,2)} %</strong></div>`;
 document.getElementById('nationalTable').innerHTML=table(rows.slice(page*perPage,(page+1)*perPage),year);
 document.getElementById('nationalPageLabel').textContent=`Página ${page+1} de ${n}`;
 document.getElementById('nationalPrev').disabled=page===0;document.getElementById('nationalNext').disabled=page>=n-1;
 }
 ids.forEach(id=>document.getElementById(id).addEventListener(id==='nationalSearch'?'input':'change',()=>{page=0;draw()}));
 document.getElementById('nationalPrev').addEventListener('click',()=>{page--;draw()});
 document.getElementById('nationalNext').addEventListener('click',()=>{page++;draw()});
 document.getElementById('nationalExport').addEventListener('click',()=>{const y=Number(document.getElementById('nationalYear').value),csv=nationalCSV(rows,y),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`nexus_sener_generacion_nacional_${y}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});draw();
}
