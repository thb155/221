/* ================= 模拟 ================= */
function addInv(c,p,q,ql,ci){if(q<=0)return;const v=c.inv[p];v.ql=(v.q*v.ql+q*ql)/(v.q+q);v.q+=q;ci=ci??(c.home||0);const cv=c.ci[ci][p];cv.ql=(cv.q*cv.ql+q*ql)/(cv.q+q);cv.q+=q}
const KM=[[0,1200,1400,1900,1400,180],[1200,0,2100,1800,2100,1300],[1400,2100,0,1700,140,1300],[1900,1800,1700,0,1600,1900],[1400,2100,140,1600,0,1300],[180,1300,1300,1900,1300,0]];
const CIDX=()=>G.cities.map((_,i)=>i);
let LOG={org:{},wh:{}};
function buildLogi(){const org={},wh={};for(const b of G.b){if(b.type==='wh'){((wh[b.o]=wh[b.o]||{})[b.c]=wh[b.o][b.c]||[]).push(b)}
  else if(b.prod&&P[b.prod]&&(b.type==='factory'||b.type==='farm'||b.type==='mine'||b.type==='forest')){((org[b.o]=org[b.o]||{})[b.prod]=org[b.o][b.prod]||[]).push(b)}}LOG={org,wh}}
const tileD=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
const hasWh=(c,ci)=>!!(LOG.wh[c.id]&&LOG.wh[c.id][ci]&&LOG.wh[c.id][ci].length);
const interFr=(c,v,from,to)=>from===to?0:v*(0.03+KM[from][to]/1000*0.025)*(hasWh(c,to)?0.5:1);
function lastMile(c,p,dst){const v=G.imp[p],pts=((LOG.org[c.id]&&LOG.org[c.id][p])||[]).filter(x=>x.c===dst.c).concat((LOG.wh[c.id]&&LOG.wh[c.id][dst.c])||[]);
  if(!pts.length)return v*0.02;let d=1e9;for(const x of pts)if(x!==dst)d=Math.min(d,tileD(x,dst));if(d>=1e9)d=0;return v*Math.min(0.04,0.0015*d)}
const cityOrder=dc=>[dc,...CIDX().filter(x=>x!==dc).sort((x,y)=>KM[x][dc]-KM[y][dc])];
function frUnit(c,p,dst){if(!dst)return 0;const v=G.imp[p],lm=lastMile(c,p,dst);for(const ci of cityOrder(dst.c))if(c.ci[ci][p].q>1)return lm+interFr(c,v,ci,dst.c);return lm}
const whCapCity=(c,ci)=>((LOG.wh[c.id]&&LOG.wh[c.id][ci])||[]).reduce((s2,b)=>s2+3000*lvMul(b.lv),0);
const whCap=c=>(LOG.wh[c.id]?Object.values(LOG.wh[c.id]).flat():[]).reduce((s2,b)=>s2+3000*lvMul(b.lv),0);
const capCity=(c,ci)=>Math.min(c.maxStock,1000+whCapCity(c,ci));
const stockCap=c=>CIDX().reduce((s2,ci)=>s2+capCity(c,ci),0);
function cityTake(c,p,ci,n){const cv=c.ci[ci][p],g=Math.min(cv.q,n);if(g<=0)return 0;cv.q-=g;const v=c.inv[p];v.q=Math.max(0,v.q-g);return g}
function take(c,p,need,b){const dc=b?b.c:(c.home||0),val=G.imp[p];let got=0,qs=0,src=-1,best=0,fr=0;const lm=b?lastMile(c,p,b):0;
  for(const ci of cityOrder(dc)){if(got>=need)break;const cv=c.ci[ci][p];if(cv.q<=0)continue;const ql=cv.ql,g=cityTake(c,p,ci,need-got);got+=g;qs+=g*ql;fr+=g*(lm+interFr(c,val,ci,dc))}
  if(got>0){src=c.id;best=got;if(b&&fr>0){c.cash-=fr;c.m.logi=(c.m.logi||0)+fr;segAcc(b,'cogs',fr)}}
  if(got<need&&b&&c.cash>0)for(const o of G.cos){if(o===c||o.dead||(!o.ai&&!o.b2b)||warH(o.id,c.id)||warH(c.id,o.id))continue;
    const unit=val*(o.ai?0.95:(o.b2bk||0.95));
    for(const ci of cityOrder(dc)){if(got>=need)break;const ov=o.ci[ci][p],avail=ov.q-100;if(avail<=0)continue;const frO=val*0.02+(ci===dc?0:val*(0.03+KM[ci][dc]/1000*0.025));if(unit+frO>=val)continue;
      const ql=ov.ql,n=cityTake(o,p,ci,Math.min(need-got,avail)),pay=n*unit;o.cash+=pay;o.m.whole+=pay;if(o.id===0)o.m.b2b=(o.m.b2b||0)+pay;c.cash-=pay+n*frO;c.m.purch+=pay;c.m.logi=(c.m.logi||0)+n*frO;segAcc(b,'cogs',n*frO);
      qs+=n*ql;if(n>best){best=n;src=o.id}got+=n}
    if(got>=need)break}
  if(got<need&&c.autoImport&&c.cash>0){const r=need-got,cost=r*val;c.cash-=cost;c.m.purch+=cost;got+=r;qs+=r*(G.qm+qrefOf(p)-50);if(r>best)src=-1}
  return{got,ql:got>0?qs/got:G.qm,src}}
const ORD={wh:2,farm:0,forest:0,mine:0,factory:1,lab:2,net:2,dc:2,land:2,apt:2,office:2,mini:3,store:3,market:3};
function simDay(){
  G.day++;const d0=new Date(G.date);G.date+=864e5;const d1=new Date(G.date);
  G.qm=Math.min(95,G.qm+0.008);
  MM=MM||macroMods();buildLogi();buildWar();
  for(const c of G.cos)c._nb=0;for(const b of G.b){const c=G.cos[b.o];if(c)c._nb++}
  G.fl={};PK.forEach(p=>G.fl[p]={s:0,d:0});if(!G.sd){G.sd={};PK.forEach(p=>G.sd[p]={s:0,d:0})}
  const alive=G.cos.filter(c=>!c.dead);
  const fo=b=>P[b.prod]?.cat==='mid'?0:1;
  const bs=[...G.b].sort((a,b)=>(ORD[a.type]-ORD[b.type])||(a.type==='factory'&&b.type==='factory'?fo(a)-fo(b):0));
  // 地产供需
  const reS={};for(const city of G.cities){let sa=0,so=0,soc=0,biz=0;for(const b of G.b){if(b.c!==city.id)continue;if(b.type==='apt')sa+=units(b);else if(b.type==='office'){so+=units(b);soc+=units(b)*(b.occ||0)}else if(b.type!=='land')biz++}
    ensureGrid(city);const cap=city.dcap+sa*25,jobs=biz*150+soc*20+city.pop*0.3,attr=clamp(jobs/(city.pop*0.45),0.6,1.4);
    city.cap=cap;city.attr=attr;city.biz=biz;city.pop+=(cap*0.97-city.pop)*(city.pop<cap*0.97?0.006*attr:0.002)+city.pop*city.g*0.3;
    const ten=Math.max(0,city.pop-city.dcap*0.9)/25,od=30+biz*6+city.pop/2000;
    reS[city.id]={fa:sa?clamp(ten/sa*1.05*MM.apt,0.15,1.1):1.1,fo:so?clamp(od/so*MM.office,0.15,1.1):1.1,sa,so};city.re=reS[city.id]}
  for(const b of bs){
    const c=G.cos[b.o];const op=opCost(b)*wageOp(c)*(1-0.15*exS(c,'coo'))*scaleF(c);c.cash-=op;c.m.op+=op;segAcc(b,'op',op);b.out=0;
    if(isRetail(b)||b.type==='dc'||b.type==='land')continue;
    if(isRent(b)){const s=reS[b.c],f=b.type==='apt'?s.fa:s.fo,ref=refRent(b);const tg=clamp(0.97*Math.pow(ref/Math.max(1,b.rent),1.6)*f,0,1);b.occ+=(tg-b.occ)*0.03;
      const r=units(b)*b.occ*b.rent*(c.perk==='re'?1.06:1)*(1+0.1*exS(c,'cre'));c.cash+=r;c.m.rent+=r;segAcc(b,'rev',r);b.out=r;b.hist.push(r);if(b.hist.length>60)b.hist.shift();continue}
    if(!b.prod){b.hist.push(0);if(b.hist.length>60)b.hist.shift();continue}
    const pk=c.perk==='ind'?1.06:1;
    if(b.type==='farm'||b.type==='forest'||b.type==='mine'){const q=P[b.prod].rate*lvMul(b.lv)*pk*effOf(c)*(1+0.1*exS(c,'coo'))*(0.9+rnd()*0.2);addInv(c,b.prod,q,techQ(c.tech[b.prod]),b.c);segAcc(b,'rev',q*G.imp[b.prod]);b.out=q;G.fl[b.prod].s+=q}
    else if(b.type==='factory'){const pp=P[b.prod];
      if(!(pp.tech&&c.tech[b.prod]<pp.tech)){const n=pp.rate*lvMul(b.lv)*pk*effOf(c)*(1+0.1*exS(c,'coo'));let ratio=1;
        for(const k in pp.inp){const can=c.inv[k].q+(c.autoImport&&c.cash>0?1e12:0);ratio=Math.min(ratio,can/(pp.inp[k]*n))}
        const made=n*Math.max(0,ratio);
        if(made>0){let qs=0,qw=0;for(const k in pp.inp){const r=take(c,k,pp.inp[k]*made,b);segAcc(b,'cogs',pp.inp[k]*made*G.imp[k]);qs+=r.ql*pp.inp[k];qw+=pp.inp[k];G.fl[k].d+=pp.inp[k]*made}segAcc(b,'rev',made*G.imp[b.prod]);addInv(c,b.prod,made,0.5*(qs/qw)+0.5*techQ(c.tech[b.prod]),b.c);b.out=made;G.fl[b.prod].s+=made}
        if(b.out>0&&Q===2&&b.c===G.cur&&rnd()<0.5)smoke.push(mkSmoke(b))}}
    else if(b.type==='lab'||b.type==='net'){const pts=lvMul(b.lv)*(c.perk==='tech'?1.12:1)*MM.rd*effOf(c)*(1+0.6*exS(c,'cto'));c.rp[b.prod]+=pts;b.out=pts;checkTech(c,b.prod)}
    b.hist.push(b.out);if(b.hist.length>60)b.hist.shift();
  }
  // 零售
  const storeRev={};
  for(const city of G.cities){city.sales={};city.avgP=city.avgP||{};
    for(const p of FINAL){const rf=refNow(p),ap=city.avgP[p]||rf;const D=P[p].dem*city.pop/50000*city.dmul[p]*clamp(rf/ap,0.5,1.6)*MM.dem*(MM.demP[p]||1);const list=[];
      for(const b of G.b){if(b.c!==city.id||!isRetail(b))continue;for(const s of b.slots){if(s.p!==p)continue;const c=G.cos[b.o];const v=c.inv[p];
        if(!(v.q>1||(c.autoImport&&c.cash>0))){s.sold=0;s.share=0;continue}const q=v.q>=40?v.ql:G.qm;
        const base=traffic(city,b.x,b.y)*(c.perk==='sales'?1.06:1)*(1+0.08*exS(c,'retail'))*(0.85+0.15*b.lv)*(b.type==='market'?1.25:b.type==='mini'?0.8:1),qn=q*50/qrefOf(p),pr=rf/Math.max(1,s.price);
        const As=SEG.map(g=>base*Math.pow(qn/50,g.q)*Math.pow(1+c.brand[p]/g.b,g.bp)*Math.pow(pr,g.pe));list.push({b,s,c,As,q})}}
      if(WH.size){const sl=new Set(list.map(o=>o.c.id));for(const o of list)for(const x of sl){const h=warH(x,o.c.id);if(h)o.As=o.As.map(a=>a*(1-0.06*h))}}
      const mix=segMix(city),S=[0,0,0];list.forEach(o=>o.As.forEach((a,k)=>S[k]+=a));let pw=0,tot=0;
      for(const o of list){const sg=o.As.map((a,k)=>mix[k]*a/(1+S[k])),share=sg[0]+sg[1]+sg[2];o.s.sg=sg.map(x=>share>0?x/share:0);const cap=BT[o.b.type].cap*lvMul(o.b.lv)*effOf(o.c);let n=Math.min(D*share*(0.92+rnd()*0.16),cap);{const tk=take(o.c,p,n,o.b);n=tk.got;o.s.src=tk.src}
        const rev=n*o.s.price;pw+=rev;G.fl[p].d+=n;o.c.cash+=rev;o.c.m.rev+=rev;segAcc(o.b,'rev',rev);segAcc(o.b,'cogs',n*G.imp[p]);o.s.sold=n;o.s.share=share;o.s.q=o.q;tot+=n;storeRev[o.b.id]=(storeRev[o.b.id]||0)+rev;o.c.brand[p]=Math.min(100,o.c.brand[p]+n/D*0.25*(1+0.8*exS(o.c,'cmo')))}
      if(tot>0)city.avgP[p]=pw/tot;city.sales[p]={D,tot,n:list.length}}}
  // 批发价格 = 供需决定
  const infl=1+G.day*0.00004;
  for(const p of PK){const sd=G.sd[p],fl=G.fl[p];sd.s+=(fl.s-sd.s)*0.05;sd.d+=(fl.d-sd.d)*0.05;const K=P[p].rate*6;
    const f=clamp(1+0.3*((sd.d-sd.s)/(sd.d+sd.s+K)-0.3),0.6,1.4);const tg=P[p].imp*infl*f*(G.shock?.[p]||1)*(MM.price[p]||1);G.imp[p]+=(tg-G.imp[p])*0.03;G.imp[p]*=1+(rnd()-0.5)*0.008}
  if(G.shock)for(const p in G.shock){G.shock[p]=1+(G.shock[p]-1)*0.985}
  for(const b of G.b)if(isRetail(b)){const r=storeRev[b.id]||0;b.out=r;b.hist.push(r);if(b.hist.length>60)b.hist.shift();if(r>0&&b.o===0&&b.c===G.cur&&Q>0&&rnd()<0.3&&sfx('coin')!==1)floats.push({x:b.x+1,y:b.y+1,t:'+'+fmt(r),life:1})}
  // 互联网
  const yr=yearNow(),totPop=G.cities.reduce((s,c)=>s+c.pop*((CITY_DEF[c.id]||{}).net||1),0);
  G.adopt=clamp(0.04+0.96*Math.pow(clamp((yr-1990)/25,0,1),1.5)+MM.adopt,0.02,1);
  for(const k of NK){const U=totPop*NET[k].pen*G.adopt*netStage(k,yr);G.netU[k]=U;
    const list=alive.filter(c=>c.tech[k]>=1);let sum=0;const A={};
    for(const c of list){A[c.id]=Math.pow(techQ(c.tech[k])/50,2)*(1+c.brand[k]/40)*Math.pow(c.monet[k],-0.8)*(1+0.15*Math.log10(1+c.users[k]));sum+=A[c.id]}
    const totU=list.reduce((x,c)=>x+c.users[k],0),sat=U>0?Math.min(1,totU/U):1,gr=0.03*(1-0.7*sat*sat);G.netSat=G.netSat||{};G.netSat[k]=sat;
    for(const c of list){const target=U*A[c.id]/(0.4+sum),room=capOf(c)-usersOf(c)+c.users[k],dlt=target-c.users[k];
      c.users[k]=clamp(c.users[k]+dlt*(dlt>0?gr:0.03),0,Math.max(0,Math.min(room,U)));if(G.anti&&G.anti[c.id+'_'+k]>G.day)c.monet[k]=Math.min(c.monet[k],1);
      const r=c.users[k]*NET[k].arpu*c.monet[k];c.cash+=r;c.m.net+=r;if(c.id===0&&r>0){const nb=G.b.filter(x=>x.o===0&&x.type==='net'&&x.prod===k);nb.forEach(x=>segAcc(x,'rev',r/nb.length))}if(U>0)c.brand[k]=Math.min(100,c.brand[k]+c.users[k]/U*0.08)}}
  // 费用
  for(const c of alive){
    for(const p of FINAL.concat(NK)){c.brand[p]*=0.996;if(c.ad[p]>0){const a=c.ad[p];c.cash-=a;c.m.ad+=a;c.brand[p]=Math.min(100,c.brand[p]+Math.sqrt(a)/90*(1+0.8*exS(c,'cmo')))}}
    const srv=usersOf(c)*0.02;c.cash-=srv;c.m.op+=srv;if(c.id===0&&srv>0){const ds=G.b.filter(x=>x.o===0&&x.type==='dc');ds.forEach(x=>segAcc(x,'op',srv/ds.length))}
    for(let ci=0;ci<G.cities.length;ci++){const cap=capCity(c,ci);for(const p of PK){const cv=c.ci[ci][p];if(cv.q>cap){const ex=cv.q-cap,r=ex*G.imp[p]*0.8;cv.q=cap;c.inv[p].q=Math.max(0,c.inv[p].q-ex);c.cash+=r;c.m.whole+=r}}}
    if(c.loan>0){const i=c.loan*loanRate(c)/365;c.cash-=i;c.m.int+=i}if(c.cash>0){const dp=c.cash*depRate(c)/365;c.cash+=dp;c.m.dep+=dp}
    if(c.ai&&c.cash<0){c.loan+=-c.cash+300000;c.cash=300000}
  }
  if(WH.size)warDaily();
  const me=G.cos[0];
  if(me.cash<0){const cap=loanCap(me);if(cap>=-me.cash+50000){const a=Math.ceil((-me.cash+50000)/10000)*10000;me.loan+=a;me.cash+=a;toast(`⚠️ 现金不足，银行自动放贷 ${fmt(a)}`)}else{me.negDays++;if(me.negDays%10===1)toast('⚠️ 现金为负，请尽快止损！');if(me.negDays>90)gameOver()}}else me.negDays=0;
  {const me0=G.cos[0];if(me0.ex){let sal=0;for(const r in me0.ex)if(me0.ex[r])sal+=me0.ex[r].sal/30;me0.cash-=sal;me0.m.sal+=sal}if(G.day%3===0)autoMgr(me0)}
  if(G.day%7===0){for(const c of alive)if(c.ai)aiPrice(c);for(const c of alive){(c.ph=c.ph||[]).push(+sharePrice(c).toFixed(2));if(c.ph.length>260)c.ph.shift()}}
  for(const c of alive)c.sent=clamp(c.sent*(1+(rnd()-0.5)*0.03)+(MM.sent-c.sent)*0.02,0.3,1.8);
  if(d1.getUTCMonth()!==d0.getUTCMonth())monthEnd(d0);
  for(const k of NK)if(d0.getUTCFullYear()<NET[k].year&&d1.getUTCFullYear()>=NET[k].year){addNews(`🌐 互联网新风口：「${NET[k].n}」进入爆发期，用户需求全面成熟！`);toast(`🌐 风口来临：${NET[k].ic} ${NET[k].n} 市场进入爆发期`)}
  checkGoal();
}
function checkTech(c,p){while(c.rp[p]>=techNeed(c.tech[p])){c.rp[p]-=techNeed(c.tech[p]);c.tech[p]++;
  if(c.id===0)toast(`🔬 ${ic(p)} ${nm(p)} 技术 Lv${c.tech[p]}${NET[p]&&c.tech[p]===1?'，产品正式上线！':''}`);
  else if(NET[p]&&c.tech[p]===1)addNews(`${c.av} ${c.founder}：${c.name}旗下「${NET[p].n}」正式上线`)}}
const QN=['一季报','半年报','三季报','年报'];
const sumM=(arr)=>{const o={rev:0,net:0,rent:0,whole:0,purch:0,op:0,sal:0,logi:0,ad:0,int:0,dep:0,tax:0,profit:0};for(const m of arr)for(const k in o)o[k]+=m[k]||0;return o};
const mYear=m=>+String(m.label).split('.')[0],mMon=m=>+String(m.label).split('.')[1];
function buildReport(d){const me=G.cos[0],m=me.months[me.months.length-1];if(!m)return;const mo=d.getUTCMonth(),y=d.getUTCFullYear();
  notify('report',`${m.label} 经营简讯`,`当月净利润 ${fmt(m.profit)}`,false);
  if(mo%3!==2)return;const q=Math.floor(mo/3);
  const lab=(b)=>`${BT[b.type].ic}${BT[b.type].n}${isRetail(b)?'('+b.slots.map(x=>P[x.p].ic).join('')+')':b.prod?'('+ic(b.prod)+')':''}·${G.cities[b.c].n}`;
  const inY=(yy,from,to)=>me.months.filter(x=>mYear(x)===yy&&mMon(x)>=from&&mMon(x)<=to);
  const cum=sumM(inY(y,1,mo+1)),cumLY=sumM(inY(y-1,1,mo+1)),qs=sumM(inY(y,mo-1,mo+1)),qp=q>0?sumM(inY(y,mo-4,mo-2)):sumM(inY(y-1,10,12)),qLY=sumM(inY(y-1,mo-1,mo+1));
  const hasLY=inY(y-1,1,mo+1).length>0,hasQP=(q>0?inY(y,mo-4,mo-2):inY(y-1,10,12)).length>0;
  const bs=G.b.filter(b=>b.o===0&&b.pq).map(b=>({b,p:b.pq.rev-b.pq.cogs-b.pq.op,r:b.pq.rev}));const loss=bs.filter(x=>x.p<0).sort((a,b)=>a.p-b.p).slice(0,6),win=bs.filter(x=>x.p>0).sort((a,b)=>b.p-a.p).slice(0,5);
  G.b.forEach(b=>{if(b.o===0)b.pq={rev:0,cogs:0,op:0}});
  const SH=me.subHist||{},subs=(me.subs||[]).map(s2=>{const a2=(SH[s2.id]||[]).filter(x=>mYear(x)===y&&mMon(x)<=mo+1);return{n:s2.name,ic:s2.ic,rev:a2.reduce((x,z)=>x+z.rev,0),profit:a2.reduce((x,z)=>x+z.profit,0)}}).filter(x=>x.rev||x.profit).sort((a,b)=>b.profit-a.profit);
  G.impQ=G.impQ||{};const mine=new Set();G.b.forEach(b=>{if(b.o===0&&b.type==='factory'&&b.prod)Object.keys(P[b.prod].inp).forEach(k=>mine.add(k));if(b.o===0&&isRetail(b))b.slots.forEach(x=>mine.add(x.p))});
  const chg=PK.map(p=>({p,r:G.impQ[p]?G.imp[p]/G.impQ[p]-1:0,mine:mine.has(p)})).filter(x=>Math.abs(x.r)>=0.05).sort((a,b)=>(b.mine-a.mine)||Math.abs(b.r)-Math.abs(a.r)).slice(0,8);PK.forEach(p=>G.impQ[p]=G.imp[p]);
  const qStart=Date.UTC(y,mo-2,1),macro=(G.mlog||[]).filter(x=>x.t>=qStart).map(x=>MDEF(x.k).ic+' '+x.txt);
  const tips=[];const TA=Math.max(1,baseNW(me)+me.loan);if(me.cash<(m.op||0)*0.5)tips.push('现金不足半个月运营成本，注意资金链');if(me.loan/TA>0.5)tips.push(`资产负债率 ${(me.loan/TA*100).toFixed(0)}%，偏高`);
  G.b.forEach(b=>{if(b.o===0&&isRetail(b)&&b.slots.some(x=>x.sold>=BT[b.type].cap*lvMul(b.lv)*0.95))tips.push(`${lab(b)} 已满负荷，考虑扩建或提价`)});
  for(const p in GENP)if(me.inv[p].q>0&&techQ(me.tech[p])<qrefOf(p))tips.push(`${P[p].ic}${P[p].n} 自产品质落后当代基准 ${qrefOf(p)}，需加紧研发`);
  if((qs.logi||0)>REVof(qs)*0.04)tips.push(`物流费用占营收 ${((qs.logi||0)/Math.max(1,REVof(qs))*100).toFixed(1)}%，考虑在主要销售城市建仓库`);
  for(const r in ROLES){const e=(me.ex||{})[r];if(e&&e.sal<marketSal(e.skill,e.trait)*0.85)tips.push(`${ROLES[r].n} ${e.name} 薪资明显低于市场价，有被挖风险`)}
  if(scaleF(me)>1.15)tips.push(`管理成本系数 ×${scaleF(me).toFixed(2)}，可出售低效建筑以降低规模不经济`);
  const wars=(G.wars||[]).filter(w=>w.a===0||w.b===0).map(w=>G.cos[w.a===0?w.b:w.a].name),noco=[];for(const [k] of WH)if(k%100===0&&!wars.includes(G.cos[Math.floor(k/100)].name))noco.push(G.cos[Math.floor(k/100)].name);
  const ph=me.ph||[],sp=sharePrice(me),sp0=ph.length>13?ph[ph.length-14]:ph[0]||sp;
  const R={kind:QN[q],y,q,label:`${y} 年${QN[q]}`,cum,cumLY:hasLY?cumLY:null,qs,qp:hasQP?qp:null,qLY:hasLY?qLY:null,cash:me.cash,loan:me.loan,nw:netWorth(me),debt:me.loan/TA,sp,sp0,
    loss:loss.map(x=>({n:lab(x.b),p:x.p,id:x.b.id})),win:win.map(x=>({n:lab(x.b),p:x.p,id:x.b.id})),subs,chg,hr:G.mlogHR||[],wars,noco:[...new Set(noco)],macro,pend:(G.pend||[]).length,tips:tips.slice(0,8)};
  G.mlogHR=[];G.report=R;G.reports=G.reports||[];G.reports.unshift(R);if(G.reports.length>24)G.reports.length=24;repSel=0;
  notify('report',`📑 ${R.label}发布`,`本期累计净利润 ${fmt(cum.profit)}${hasLY?`，同比 ${pctS(cum.profit,cumLY.profit)}`:''}${loss.length?`，${loss.length} 处亏损`:''}`,true);
  if(G.autoReport!==false&&curWin!=='scn'){if(G.rpPause!==false&&speed){rpResume=speed;setSpeed(0);acc=0}openWin('report')}}
const pctS=(a,b)=>{if(b==null||!isFinite(b)||Math.abs(b)<1)return'—';const r=(a-b)/Math.abs(b)*100;return(r>=0?'+':'')+r.toFixed(1)+'%'};
let repSel=0;
const REVof=r=>r.rev+r.net+r.rent+r.whole;
function monthEnd(d){
  scnCheck();renderGoal();
  macroMonth();genMonth(d);hrMonth(G.cos[0]);warMonth();entrantMonth();
  // 楼市周期
  for(const city of G.cities){let ev='';
    if(rnd()<0.05){city.trend+=0.02;ev=`🔥 ${city.n}楼市火爆，地价快速上涨`}else if(rnd()<0.04){city.trend-=0.028;ev=`🧊 ${city.n}出台楼市调控，地价承压`}
    city.trend=clamp(city.trend*0.85+0.15*(0.0015+city.g*15)+(rnd()-0.5)*0.008+(MM?MM.re*0.6:0),-0.045,0.05);city.idx=clamp(city.idx*(1+city.trend),0.4,20);
    city.idxHist.push(+city.idx.toFixed(3));if(city.idxHist.length>120)city.idxHist.shift();if(ev)addNews(ev)}
  for(const city of G.cities){city.gd=true;city.popHist.push(Math.round(city.pop));if(city.popHist.length>120)city.popHist.shift();
    if(city.pop>(city.cap||1)*0.88){const n=growCity(city,Math.floor(1+city.g*8000+rnd()));if(n&&rnd()<0.15)addNews(`🏘️ ${city.n}城区向外扩张，人口 ${fnum(city.pop)}`)}}
  makeAuctions();
  for(const c of G.cos){if(c.dead)continue;const m=c.m;const pf=m.rev+m.net+m.rent+m.dep+m.whole-m.purch-m.op-(m.sal||0)-(m.logi||0)-m.ad-m.int;
    if(pf>0){m.tax=pf*Math.max(0,(MM?MM.tax:0.15)-(c.id===0&&buffOn('tax')?0.05:0));c.cash-=m.tax}m.profit=pf-m.tax;m.label=`${d.getUTCFullYear()}.${d.getUTCMonth()+1}`;
    m.cashEnd=c.cash;m.loanEnd=c.loan;m.fin=c.loan-(m.loan0??c.loan);m.inv=(c.cash-(m.cash0??c.cash))-m.profit-m.fin;if(c.id===0)subMonth(c,m.label,m);
    c.months.push(m);if(c.months.length>60)c.months.shift();c.m=blankM();c.m.cash0=c.cash;c.m.loan0=c.loan;c.nwHist.push(netWorth(c));if(c.nwHist.length>120)c.nwHist.shift();
    for(const b of G.b)if(b.o===c.id)b.dep*=0.996;if(c.ai)aiMonth(c)}
  {const me=G.cos[0];if(!me.dead){decMonth();buildReport(d);}}
  if(rnd()<0.5){const r=rnd();
    if(r<0.35){const p=pick([...RAW,...MID]);const up=rnd()<0.5;G.shock=G.shock||{};G.shock[p]=up?1.25:0.8;addNews(`${P[p].ic} 国际${P[p].n}价格${up?'大涨 18%':'下跌 14%'}`)}
    else if(r<0.65){const city=pick(G.cities),p=pick(FINAL),up=rnd()<0.6;city.dmul[p]=clamp(city.dmul[p]*(up?1.12:0.9),0.5,2.2);addNews(`${P[p].ic} ${city.n}市民对${P[p].n}的需求${up?'明显上升':'有所下降'}`)}
    else if(r<0.8){const city=pick(G.cities);growCity(city,6);addNews(`🏙️ ${city.n}政府规划新城区，大批住房开工`)}
    else{const c=G.cos[1+Math.floor(rnd()*(G.cos.length-1))];if(c&&!c.dead)addNews(`${c.av} ${c.founder}（${c.name}）：「${c.style.quote}」`)}}
}
function loanCap(c){return Math.max(0,Math.round((netWorth(c)+c.loan)*(c.perk==='fin'?0.575:0.5)*(MM?MM.loan:1)/10000)*10000-c.loan)}
function invVal(c){let v=0;for(const p of PK)v+=c.inv[p].q*G.imp[p]*0.7;return v}
function netVal(c){let v=0;for(const k of NK)v+=c.users[k]*NET[k].arpu*c.monet[k]*365*0.8;return v}
const reVal=c=>G.b.reduce((s,b)=>s+(b.o===c.id&&isRE(b)?bval(b):0),0);
