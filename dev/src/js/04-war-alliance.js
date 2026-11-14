/* ===== 股权联盟 / 商战 ===== */
const stake=(h,t)=>{if(h===t||!G)return 0;return(h===0?(G.hold[t]||0):((G.own&&G.own[h]||{})[t]||0))/SHARES};
const ownCostVal=c=>{const o=G.ownCost&&G.ownCost[c.id];if(!o)return 0;let v=0;for(const t in o)if(!G.cos[t].dead)v+=o[t];return v};
let WH=new Map(),GRP={};
const relK=(a,b)=>a<b?a+'_'+b:b+'_'+a;
const relOf=(a,b)=>(G.rel&&G.rel[relK(a,b)])||0;
const addRel=(a,b,v)=>{G.rel=G.rel||{};const k=relK(a,b);G.rel[k]=clamp((G.rel[k]||0)+v,-100,100)};
const ctrlOf=x=>{for(const c of G.cos)if(!c.dead&&c.id!==x&&stake(c.id,x)>=0.51)return c.id;return -1};
function buildWar(){WH=new Map();GRP={};const al=G.cos.filter(c=>!c.dead);
  // 股权联盟：互相持股 ≥20% 连通
  let gid=0;for(const c of al){if(GRP[c.id]!=null)continue;const q=[c.id];GRP[c.id]=gid;while(q.length){const x=q.pop();for(const d of al){if(GRP[d.id]!=null)continue;if(stake(x,d.id)>=0.2||stake(d.id,x)>=0.2){GRP[d.id]=gid;q.push(d.id)}}}gid++}
  for(const w of G.wars||[]){const A=G.cos[w.a],B=G.cos[w.b];if(!A||!B||A.dead||B.dead)continue;
    const side=(p,enemy)=>{const m=new Map([[p,1]]);for(const c of al){if(c.id===p||c.id===enemy||GRP[c.id]===GRP[enemy])continue;if(stake(p,c.id)>=0.51||ctrlOf(c.id)===p)m.set(c.id,1);else if(GRP[c.id]===GRP[p])m.set(c.id,0.5)}return m};
    const sa=side(w.a,w.b),sb=side(w.b,w.a);
    const put=(x,y,f)=>{if(stake(y,x)>=0.3)return;const k=x*100+y;WH.set(k,Math.max(WH.get(k)||0,w.w*f))};
    for(const [x,f] of sa)for(const [y] of sb)put(x,y,f);
    for(const [x,f] of sb)for(const [y] of sa)put(x,y,f)}}
const warH=(x,y)=>WH.get(x*100+y)||0;
const atWar=(a,b)=>(G.wars||[]).some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a));
function sectorOf(c){const n={};G.b.forEach(b=>{if(b.o===c.id){const s2=sectOf(b.type);if(s2!=='rd'&&s2!=='logi')n[s2]=(n[s2]||0)+1}});const k=Object.keys(n).sort((a,b)=>n[b]-n[a])[0];return k?SECT[k].n:'-'}
