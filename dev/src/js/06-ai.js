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
  // 商品广告预算：上月零售收入的 1.5%~3.5%（随难度），按各商品销售额分配；现金紧张时停投
  {const lm=c.months[c.months.length-1],rate=[0.015,0.025,0.035][(G.aiLv??1)]*(st.price<1?0.8:1.15),bud=c.cash>0?(lm?lm.rev:0)*rate/30:0,w={};let tot=0;
    for(const b of G.b)if(b.o===c.id&&isRetail(b))for(const sl of b.slots){const v=(sl.sold||0)*sl.price;w[sl.p]=(w[sl.p]||0)+v;tot+=v}
    for(const p of FINAL)c.ad[p]=tot>0&&w[p]?Math.round(bud*w[p]/tot/100)*100:0}
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
  if(yr<1994)w[4]*=0.35;
  let tot=w.reduce((a,b)=>a+b,0),r=rnd()*tot,act='retail';for(let i=0;i<6;i++){r-=w[i];if(r<=0){act=acts[i];break}}
  const ci=rnd()<0.5?c.home:Math.floor(rnd()*G.cities.length),city=G.cities[ci];
  if(act==='retail'){const t=st.retail||(c.cash>4e6&&rnd()<0.3?'market':rnd()<0.25?'mini':'store');if(aiBuild(c,t,ci,true))addNews(`${BT[t].ic} ${c.name}在${city.n}新开${BT[t].n}`)}
  else if(act==='fac'){const mk=makes(c);const cand=[...new Set([...(st.pref||[]),...sellsOf(c)])].filter(p=>!mk.has(p)||rnd()<0.25);
    const ok=cand.filter(p=>!P[p].tech||c.tech[p]>=P[p].tech);const p=ok.length?pick(ok):null;
    if(p){if(aiBuild(c,'factory',ci,false,p))addNews(`🏭 ${c.name}在${city.n}投建${P[p].n}工厂`)}else if(cand.length)act='lab'}
  else if(act==='chain'){const mk=makes(c),need=[];for(const b of G.b)if(b.o===c.id&&b.type==='factory'&&b.prod)for(const k in P[b.prod].inp)if(!mk.has(k))need.push(k);
    if(need.length){const k=pick(need),t=P[k].cat==='raw'?P[k].src:'factory';if(!(P[k].tech&&c.tech[k]<P[k].tech)&&aiBuild(c,t,ci,false,k))addNews(`🔗 ${c.name}向上游延伸：自产${P[k].n}`)}}
  if(act==='lab'){if(G.b.filter(b=>b.o===c.id&&b.type==='lab').length<1+c.cash/6e6){const cand=[...(st.pref||[]),...makes(c)].filter(p=>P[p]);const p=cand.find(p=>P[p].tech&&c.tech[p]<P[p].tech)||pick(cand.length?cand:FINAL);if(aiBuild(c,'lab',c.home,false,p))addNews(`🔬 ${c.name}成立${P[p].n}研发中心`)}}
  else if(act==='net'){const av=NK.filter(k=>!G.b.some(b=>b.o===c.id&&b.type==='net'&&b.prod===k)).sort((a,b)=>(G.netU[b]||0)*NET[b].arpu-(G.netU[a]||0)*NET[a].arpu);if(av.length){if(aiBuild(c,'net',c.home,false,av[0]))addNews(`${c.av} ${c.founder}宣布${c.name}进军「${NET[av[0]].n}」`)}}
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

/* ===== 新竞争对手随时间进场 ===== */
const ENT_A=['新','华','中','天','海','金','盛','汇','凯','博','宇','誉','创','卓','旭','领'],ENT_B=['锐','联','泰','达','辰','航','域','峰','源','睿','驰','和','拓','邦','程','科'],ENT_C=['科技','集团','实业','控股','网络','智造','商贸','新材'];
const ENT_F1=['孙','马','郭','何','高','罗','郑','梁','谢','宋','唐','韩','冯','邓','曹','彭'],ENT_F2=['一鸣','思齐','志远','若溪','明哲','嘉禾','启航','晓峰','雨桐','子墨','振华','可欣'];
const ENT_AV=['🧑‍💼','👩‍💼','🧑‍🔧','👨‍💻','👩‍🔬','🧑‍🏫','👨‍🚀','👩‍🚀','🧑‍🌾','🦸','🧙','🧑‍🎓'];
const hslHex=(h,sa,l)=>{const f=n=>{const k=(n+h/30)%12,a=sa*Math.min(l,1-l),v=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(v*255).toString(16).padStart(2,'0')};return'#'+f(0)+f(8)+f(4)};
function entrantMonth(){if(!G||G.entrants===false)return;const ai=G.cos.filter(c=>c.ai&&!c.dead),yrs=G.day/365;
  if(yrs<1||ai.length>=16)return;const p=(G.entRate??1)*(0.035+(ai.length<4?0.06:ai.length<7?0.02:0));if(rnd()>p)return;spawnEntrant()}
function spawnEntrant(def){const yrs=G.day/365,used=new Set(G.cos.map(c=>c.sk));let base=def||AI_DEF.find(a=>!used.has(a.k)&&rnd()<0.5)||AI_DEF.find(a=>!used.has(a.k)),gen=false;
  if(!base){gen=true;base=pick(AI_DEF)}
  const id=G.cos.length,cash=Math.min(4e7,(2.4e6+yrs*6e5)*(0.8+rnd()*0.5))*aik().cash;
  const c=newCompany(id,base,cash,true);c.entrant=G.day;
  if(gen){const names=new Set(G.cos.map(x=>x.name));let n,k=0;do{n=pick(ENT_A)+pick(ENT_B)+pick(ENT_C);k++}while(names.has(n)&&k<30);c.name=n;c.founder=pick(ENT_F1)+pick(ENT_F2);c.av=pick(ENT_AV);c.col=hslHex(rnd()*360,0.7,0.58)}
  c.home=Math.floor(rnd()*G.cities.length);
  // 后来者带着行业平均技术进场（打七折），不再从零开始
  const peers=G.cos.filter(x=>x.ai&&!x.dead&&x.id!==id);for(const p of ALLK){const avg=peers.length?peers.reduce((s,x)=>s+x.tech[p],0)/peers.length:0;c.tech[p]=Math.floor(avg*0.7*aik().tech)}
  for(const k of NK)c.brand[k]=3+rnd()*6;
  G.cos.push(c);giveStart(c,base.start,c.home);
  if(yrs>4&&rnd()<0.6)giveStart(c,base.start.filter(([t])=>BT[t]&&BT[t].g==='retail').slice(0,1),(c.home+1)%G.cities.length);
  const msg=`${c.av} ${c.founder}创立「${c.name}」，在${G.cities[c.home].n}进场（${base.style}），启动资金 ${fmt(c.cash)}`;
  addNews('🆕 新玩家入局：'+msg);notify('biz','🆕 新竞争对手入局',msg,true);return c}
