/**
 * Simplificación Douglas–Peucker local y conservadora para una COPIA cartográfica.
 * No modifica la fuente INEGI. No garantiza conservación de topología entre estados.
 * Jamás usar el resultado para medir superficies, establecer jurisdicciones o hacer GIS de precisión.
 */
const squaredDistance = (a,b)=>{const dx=a[0]-b[0],dy=a[1]-b[1];return dx*dx+dy*dy;};
function distanceToSegmentSquared(p,a,b){
 const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy;
 if(l2===0)return squaredDistance(p,a);
 const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2));
 const x=a[0]+dx*t,y=a[1]+dy*t;
 return (p[0]-x)**2+(p[1]-y)**2;
}
function rdp(path,toleranceSquared){
 const keep=new Uint8Array(path.length);keep[0]=1;keep[path.length-1]=1;
 const segments=[[0,path.length-1]];
 while(segments.length){
  const [start,end]=segments.pop();let best=-1,bestD=toleranceSquared;
  for(let i=start+1;i<end;i++){
   const d=distanceToSegmentSquared(path[i],path[start],path[end]);
   if(d>bestD){best=i;bestD=d;}
  }
  if(best>=0){keep[best]=1;segments.push([start,best],[best,end]);}
 }
 return path.filter((_,i)=>keep[i]);
}
export function signedRingArea(ring){
 let sum=0;
 for(let i=0;i<ring.length-1;i++)sum+=(ring[i][0]*ring[i+1][1]-ring[i+1][0]*ring[i][1]);
 return sum/2;
}
function reduceClosedRing(original,tolerance){
 const pts=original.slice(0,-1);
 if(pts.length<8)return original;
 let split=1,largest=-Infinity;
 for(let i=1;i<pts.length;i++){
  const d=squaredDistance(pts[0],pts[i]);if(d>largest){largest=d;split=i;}
 }
 const left=rdp(pts.slice(0,split+1),tolerance*tolerance);
 const right=rdp(original.slice(split),tolerance*tolerance);
 const output=left.concat(right.slice(1));
 if(output.length<4)return original;
 // No alterar el punto de cierre, ni crear anillos vacíos.
 if(output[0][0]!==output.at(-1)[0]||output[0][1]!==output.at(-1)[1])return original;
 return output;
}
export function simplifyRingConservatively(original,{tolerance=0.002,maximumAreaError=0.02}={}){
 if(!Array.isArray(original)||original.length<8)return {ring:original,areaError:0,retained:true};
 const originalArea=signedRingArea(original);
 if(Math.abs(originalArea)<tolerance*tolerance*12)return {ring:original,areaError:0,retained:true};
 let tol=tolerance;
 for(let retry=0;retry<5;retry++,tol/=2){
  const candidate=reduceClosedRing(original,tol);
  const newArea=signedRingArea(candidate);
  const err=Math.abs(newArea-originalArea)/Math.abs(originalArea);
  if(candidate.length>=4&&newArea*originalArea>0&&err<=maximumAreaError){
   return {ring:candidate,areaError:err,retained:candidate.length===original.length};
  }
 }
 return {ring:original,areaError:0,retained:true};
}
export function simplifyInegiForDisplay(source,{tolerance=0.002,maximumAreaError=0.02}={}){
 if(!Number.isFinite(tolerance)||tolerance<0.0001||tolerance>0.005)throw Error('Tolerancia fuera del intervalo seguro 0.0001–0.005 grados.');
 const report={toleranceDegrees:tolerance,maximumAreaError,ringCount:0,preservedRings:0,reducedRings:0,maxRelativeRingAreaError:0};
 const simplified={...source,features:source.features.map(f=>{
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  const reduced=polys.map(poly=>poly.map(ring=>{
   const result=simplifyRingConservatively(ring,{tolerance,maximumAreaError});
   report.ringCount++;
   if(result.retained)report.preservedRings++;else report.reducedRings++;
   report.maxRelativeRingAreaError=Math.max(report.maxRelativeRingAreaError,result.areaError);
   return result.ring;
  }));
  return {...f,geometry:{...f.geometry,coordinates:f.geometry.type==='Polygon'?reduced[0]:reduced}};
 })};
 return {data:simplified,report};
}
