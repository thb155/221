/* ================= AI ================= */
const makes=c=>new Set(G.b.filter(b=>b.o===c.id&&b.prod&&P[b.prod]).map(b=>b.prod));
const sellsOf=c=>{const s=new Set();for(const b of G.b)if(b.o===c.id&&isRetail(b))b.slots.forEach(x=>s.add(x.p));return s};
function aiFillSlots(c,b){const max=BT[b.type].slots,have=new Set(b.slots.map(s=>s.p));
  const own=[...makes(c)].filter(p=>P[p].cat==='final'),pref=(c.style.pref||[]),pool=G.day<300?BASIC:FINAL;
  const cand=[...new Set([...own,...pref.filter(()=>rnd()<0.75),...[...pool].sort(()=>rnd()-0.5)])].filter(p=>!have.has(p));
  while(b.slots.length<max&&cand.length){const p=cand.shift();b.slots.push({p,price:Math.round(refNow(p)*c.style.price*aik().price*(0.95+rnd()*0.1)),sold:0})}}
function aiPrice(c){let hot=false;for(const k of WH.keys())if(Math.floor(k/100)===c.id){hot=true;break}
  for(const b of G.b){if(b.o!==c.id)continue;
  if(isRetail(b))for(const s of b.slots){const cap=BT[b.type].cap*lvMul(b.lv),lo=G.imp[s.p]*(hot?1.02:1.08),hi=refNow(s.p)*1.7*c.style.price;
    const sm=aik().smart;if(hot)s.price*=0.97;else if(s.sold>=cap*0.93)s.price*=1.04+0.02*sm;else if(s.sold<cap*0.3)s.price*=0.965-0.01*sm;else if(sm&&s.sold<cap*0.7)s.price*=1-0.01*sm;if(sm>0.4&&s.price<G.imp[s.p]*1.15&&s.sold<cap*0.5)s.price=G.imp[s.p]*1.15;s.price=clamp(s.price*(1+(rnd()-0.5)*0.01),lo,hi)}
  if(isRent(b)){const ref=refRent(b);if(b.occ>0.95)b.rent*=1.03;else if(b.occ<0.7)b.rent*=0.97;b.rent=clamp(b.rent,ref*0.5,ref*2)}}}
function aiBuild(c,type,ci,central,prod){const city=G.cities[ci],lot=findLot(city,central);if(!lot)return null;
  const cost=BT[type].cost+landPrice(city,lot.x,lot.y);if(c.cash<cost+4e5)return null;const b=placeBuilding(c,type,ci,lot.x,lot.y,false);if(!b)return null;setupB(c,b,prod);return b}
function aiMonth(c){
  const st=c.style;
  for(const b of G.b.filter(b=>b.o===c.id&&(isRetail(b)||b.type==='factory'))){const op=opCost(b);
    if(isRetail(b)&&b.hist.length>=40){const r=b.hist.slice(-30).reduce((x,y)=>x+y,0)/30;if(r*0.3<op&&rnd()<0.5){c.cash+=sellVal(b);removeBuilding(b);addNews(`🔻 ${c.name}关闭了${G.cities[b.c].n}一家亏损门店`)}}
    else if(b.type==='factory'&&b.hist.length>=40&&b.hist.slice(-30).every(v=>v<1)){c.cash+=sellVal(b);removeBuilding(b)}}
  if(baseNW(c)<-2e6){bankrupt(c);return}
  // 缺钱卖楼
  if(c.loan>3e6&&c.cash<5e5){const re=G.b.filter(b=>b.o===c.id&&isRE(b));if(re.length){const b=pick(re);c.cash+=sellVal(b);c.loan=Math.max(0,c.loan-sellVal(b));removeBuilding(b);addNews(`🏚️ ${c.name}资金紧张，抛售${G.cities[b.c].n}一处物业`)}}
  // 研发加速 & 门店补货
  for(const p of new Set([...sellsOf(c),...makes(c)]))if(rnd()<(0.04+0.12*st.tech)*aik().tech){c.rp[p]+=techNeed(c.tech[p]);checkTech(c,p)}
  for(const b of G.b)if(b.o===c.id&&isRetail(b)&&b.slots.length<BT[b.type].slots&&rnd()<0.3)aiFillSlots(c,b);
  if(c.loan>Math.max(1e6,baseNW(c)))return;
  const nAI=G.cos.filter(x=>x.ai&&!x.dead).length,cnt=G.b.filter(b=>b.o===c.id).length;
  if(!(c.cash>1.1e6&&rnd()<0.5*st.exp*aik().exp&&cnt<6+G.day/200*st.exp*aik().exp*Math.min(1,Math.sqrt(5/nAI))))return aiUpgrade(c);
  const yr=yearNow(),acts=['retail','fac','chain','lab','net','re'],w=st.w.slice();
  if(!NK.some(k=>yr>=NET[k].year))w[4]=0;
  let tot=w.reduce((a,b)=>a+b,0),r=rnd()*tot,act='retail';for(let i=0;i<6;i++){r-=w[i];if(r<=0){act=acts[i];break}}
  const ci=rnd()<0.5?c.home:Math.floor(rnd()*G.cities.length),city=G.cities[ci];
  if(act==='retail'){const t=st.retail||(c.cash>4e6&&rnd()<0.3?'market':rnd()<0.25?'mini':'store');if(aiBuild(c,t,ci,true))addNews(`${BT[t].ic} ${c.name}在${city.n}新开${BT[t].n}`)}
  else if(act==='fac'){const mk=makes(c);const cand=[...new Set([...(st.pref||[]),...sellsOf(c)])].filter(p=>!mk.has(p)||rnd()<0.25);
    const ok=cand.filter(p=>!P[p].tech||c.tech[p]>=P[p].tech);const p=ok.length?pick(ok):null;
    if(p){if(aiBuild(c,'factory',ci,false,p))addNews(`🏭 ${c.name}在${city.n}投建${P[p].n}工厂`)}else if(cand.length)act='lab'}
  else if(act==='chain'){const mk=makes(c),need=[];for(const b of G.b)if(b.o===c.id&&b.type==='factory'&&b.prod)for(const k in P[b.prod].inp)if(!mk.has(k))need.push(k);
    if(need.length){const k=pick(need),t=P[k].cat==='raw'?P[k].src:'factory';if(!(P[k].tech&&c.tech[k]<P[k].tech)&&aiBuild(c,t,ci,false,k))addNews(`🔗 ${c.name}向上游延伸：自产${P[k].n}`)}}
  if(act==='lab'){if(G.b.filter(b=>b.o===c.id&&b.type==='lab').length<1+c.cash/6e6){const cand=[...(st.pref||[]),...makes(c)].filter(p=>P[p]);const p=cand.find(p=>P[p].tech&&c.tech[p]<P[p].tech)||pick(cand.length?cand:FINAL);if(aiBuild(c,'lab',c.home,false,p))addNews(`🔬 ${c.name}成立${P[p].n}研发中心`)}}
  else if(act==='net'){const av=NK.filter(k=>yr>=NET[k].year&&!G.b.some(b=>b.o===c.id&&b.type==='net'&&b.prod===k));if(av.length){if(aiBuild(c,'net',c.home,false,av[0]))addNews(`${c.av} ${c.founder}宣布${c.name}进军「${NET[av[0]].n}」`)}}
  else if(act==='re'){const short=[...G.cities].sort((a,b)=>(b.re?.fa||0)-(a.re?.fa||0))[0],hot=[...G.cities].sort((a,b)=>b.trend-a.trend)[0],cc=rnd()<0.5?short.id:rnd()<0.6?hot.id:ci,ccity=G.cities[cc],t=(ccity.re?.fa||1)>0.85&&rnd()<0.7?'apt':(ccity.re?.fo||1)>0.85&&rnd()<0.6?'office':rnd()<0.5?'land':'apt';
    if(aiBuild(c,t,cc,t!=='land'))addNews(`${BT[t].ic} ${c.name}在${G.cities[cc].n}${t==='land'?'拿下一块地':'开发'+BT[t].n}`)}
  if(G.b.some(b=>b.o===c.id&&b.type==='net')&&usersOf(c)>=capOf(c)*0.75&&c.cash>9e5)aiBuild(c,'dc',c.home,false);
  {const fc=G.b.filter(b=>b.o===c.id&&b.type==='factory').length;if(fc&&rnd()<0.25){const cnt2={};G.b.forEach(b=>{if(b.o===c.id&&isRetail(b))cnt2[b.c]=(cnt2[b.c]||0)+1});const tgt=Object.keys(cnt2).map(Number).find(ci=>cnt2[ci]>=2&&!G.b.some(b=>b.o===c.id&&b.type==='wh'&&b.c===ci));if(tgt!=null&&c.cash>8e5&&aiBuild(c,'wh',tgt,false))addNews(`📦 ${c.name}在${G.cities[tgt].n}建成物流中心`)}}
  aiUpgrade(c);
}
function aiUpgrade(c){
  if(c.cash>2.5e6&&rnd()<0.3){const st2=G.b.filter(b=>b.o===c.id&&b.type!=='land'&&b.lv<4&&b.hist.length>30);if(st2.length){const b=pick(st2),cost=BT[b.type].cost*0.6*b.lv;c.cash-=cost;b.bc+=cost*0.8;b.lv++;G.cities[b.c].dirty=true}}
  for(const k of NK)if(c.users[k]>0&&rnd()<0.2)c.monet[k]=clamp(c.monet[k]+(rnd()<0.5?-0.1:0.1),0.6,1.6);
  if(c.loan>0&&c.cash>c.loan+1.5e6){c.cash-=c.loan;c.loan=0}
}

