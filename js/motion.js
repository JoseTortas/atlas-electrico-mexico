// Progressive enhancement for lightweight, accessible motion.
let observer=null;
const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function updateReadingProgress(){
 const max=document.documentElement.scrollHeight-window.innerHeight;
 const percent=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
 document.documentElement.style.setProperty('--reading-progress',`${(percent*100).toFixed(2)}%`);
}
export function initMotion(){
 window.addEventListener('scroll',updateReadingProgress,{passive:true});
 window.addEventListener('resize',updateReadingProgress,{passive:true});
 updateReadingProgress();
}
export function refreshMotion(){
 observer?.disconnect();observer=null;
 updateReadingProgress();
 if(reduced()||!('IntersectionObserver' in window))return;
 // Never animate elements that contain Leaflet, because transforms can displace tiles.
 const targets=Array.from(document.querySelectorAll('main .page-heading, main .section-heading, main .metric, main .module-card, main .fact-flip'));
 observer=new IntersectionObserver(items=>{
  items.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-visible');observer?.unobserve(e.target)}});
 },{threshold:.08,rootMargin:'0px 0px 55px 0px'});
 targets.forEach((el,i)=>{
  el.classList.add('motion-enter');
  el.style.setProperty('--motion-delay',`${Math.min(i%5,4)*50}ms`);
  observer.observe(el);
 });
}
