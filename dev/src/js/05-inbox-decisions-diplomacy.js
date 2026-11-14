/* ===== 通知中心 ===== */
const NCAT={report:'📋',decision:'📩',war:'⚔️',hr:'👔',macro:'🌍',goal:'🎯',biz:'💡',dip:'🤝'};
function notify(cat,title,body,pop){if(pop&&G.day>2)sfx(cat==='war'||cat==='decision'||cat==='hr'?'alert':cat==='goal'?'good':'click');G.inbox=G.inbox||[];G.inbox.unshift({t:G.date,cat,title,body:body||'',read:false});if(G.inbox.length>120)G.inbox.length=120;updBadge();if(pop)toast(`${NCAT[cat]||'🔔'} <b>${title}</b>${body&&!MOBILE?'<br><span class="mu">'+String(body).replace(/<[^>]+>/g,'').slice(0,60)+'</span>':''}`,cat)}
function updBadge(){const n=(G&&G.inbox||[]).filter(x=>!x.read).length+(G&&G.pend||[]).length;const el=$('#ibadge');if(!el)return;el.textContent=n>99?'99+':n;el.classList.toggle('hidden',!n)}
/* ===== 临时状态 ===== */
const buffOn=k=>G.buff&&G.buff[k]&&G.buff[k]>G.day;
/* ===== 决策事件 ===== */
const DEC={
 infra:{t:'政府邀请参与基建投资',f:me=>{const cost=Math.round(clamp(netWorth(me)*0.08,5e5,3e7)/1e4)*1e4;return{body:`${G.cities[me.home].n}市政府邀请你出资 ${fmt(cost)} 参与新城基建。回报：5 年内企业所得税减免 5 个百分点，且${G.cities[me.home].n}地价上涨。`,opts:[['投资 '+fmt(cost),()=>{if(me.cash<cost){toast('资金不足');return false}me.cash-=cost;G.buff.tax=G.day+365*5;const c2=G.cities[me.home];c2.trend+=0.02;notify('biz','基建投资已完成',`5 年内所得税 −5%`);}],['婉拒',()=>{}]]}}},
 env:{t:'环保整改要求',need:me=>G.b.some(b=>b.o===0&&(b.type==='factory'||b.type==='mine')),f:me=>{const n=G.b.filter(b=>b.o===0&&(b.type==='factory'||b.type==='mine')).length,cost=n*80000;return{body:`环保部门要求你的 ${n} 座工厂/矿场升级排污设备，费用 ${fmt(cost)}。拒绝的话，3 个月后有一半概率被罚款 ${fmt(cost*3)}，品牌也会受损。`,opts:[['立即整改 '+fmt(cost),()=>{if(me.cash<cost){toast('资金不足');return false}me.cash-=cost;me.m.op+=cost}],['暂不整改',()=>{G.buff.envRisk=G.day+90;G.buff.envAmt=cost*3}]]}}},
 strike:{t:'员工集体要求加薪',need:me=>G.b.filter(b=>b.o===0).length>=4,f:me=>({body:'工会代表全体员工要求加薪 10%。同意：未来 12 个月运营成本 +10%；拒绝：40% 概率爆发罢工，一个月内效率减半。',opts:[['同意加薪',()=>{G.buff.wageUp=G.day+365}],['拒绝',()=>{if(rnd()<0.4){G.buff.strike=G.day+30;notify('hr','员工罢工！','一个月内产能和门店效率减半',true)}else notify('hr','风波平息','员工接受了现状')}]]})},
 pr:{t:'媒体负面报道',need:me=>G.b.some(b=>b.o===0&&isRetail(b)&&b.slots.length),f:me=>{const ps=[];G.b.forEach(b=>{if(b.o===0&&isRetail(b))b.slots.forEach(x=>ps.push(x.p))});const p=pick(ps),cost=300000;return{body:`有媒体曝光你的${P[p].ic}${P[p].n}存在质量问题。花 ${fmt(cost)} 做危机公关可以平息舆论；不处理的话，该商品品牌值会下降 30%。`,opts:[['危机公关 '+fmt(cost),()=>{if(me.cash<cost){toast('资金不足');return false}me.cash-=cost;me.m.ad+=cost}],['不予理会',()=>{me.brand[p]*=0.7}]]}}},
 tech:{t:'海外技术引进机会',f:me=>{const p=pick(['chip','phone','pc','appliance','car','medicine']),cost=1e6*(me.tech[p]+1);return{body:`一家海外企业愿意转让${P[p].ic}${P[p].n}的成熟技术，价格 ${fmt(cost)}，可以让你的该项技术直接提升 2 级（当前 Lv${me.tech[p]}）。`,opts:[['购买技术 '+fmt(cost),()=>{if(me.cash<cost){toast('资金不足');return false}me.cash-=cost;me.m.op+=cost;me.tech[p]+=2}],['放弃',()=>{}]]}}},
 distress:{t:'濒危对手寻求收购',need:me=>G.cos.some(c=>c.ai&&!c.dead&&c.loan>baseNW(c)*0.4&&stake(0,c.id)<0.51),f:me=>{const c=G.cos.filter(x=>x.ai&&!x.dead&&x.loan>baseNW(x)*0.4&&stake(0,x.id)<0.51)[0];const need=Math.max(0,SHARES*0.51-(G.hold[c.id]||0)),fair=Math.max(sharePrice(c),G.b.reduce((x,b)=>x+(b.o===c.id?bval(b):0),0)/SHARES*0.6),cost=need*fair*0.7;
   return{body:`${c.name}资金链紧张，创始人${c.founder}愿意以 7 折价格出让股份，让你持股达到 51%（控股并表），总价 ${fmt(cost)}。`,opts:[['接手控股 '+fmt(cost),()=>{if(me.cash<cost){toast('资金不足');return false}me.cash-=cost;c.cash+=cost*0.5;G.hold[c.id]=(G.hold[c.id]||0)+need;G.cost[c.id]=(G.cost[c.id]||0)+cost;addNews(`🤝 ${me.name}低价控股${c.name}`)}],['拒绝',()=>{}]]}}},
};
function decMonth(){G.pend=G.pend||[];G.buff=G.buff||{};const me=G.cos[0];
  for(let i=G.pend.length-1;i>=0;i--){if(G.pend[i].exp<=G.day){const d=G.pend[i];G.pend.splice(i,1);decApply(d,d.opts.length-1,true)}}
  if(G.buff.envRisk&&G.buff.envRisk<=G.day){if(rnd()<0.5){me.cash-=G.buff.envAmt;me.m.op+=G.buff.envAmt;for(const p of FINAL)me.brand[p]*=0.9;notify('biz','环保罚款',`被罚 ${fmt(G.buff.envAmt)}，品牌受损`,true)}delete G.buff.envRisk}
  if(G.pend.length<3&&rnd()<0.22*(G.mset?G.mset.g:1)){const ks=Object.keys(DEC).filter(k=>!DEC[k].need||DEC[k].need(me));if(ks.length){const k=pick(ks),x=DEC[k].f(me);const d={id:G.nid++,k,title:DEC[k].t,body:x.body,opts:x.opts.map(o=>o[0]),exp:G.day+60};DECFN[d.id]=x.opts.map(o=>o[1]);G.pend.push(d);notify('decision','待决策：'+d.title,d.body,true)}}
  updBadge()}
const DECFN={};
function decApply(d,i,auto){const fns=DECFN[d.id];if(fns&&fns[i]){const r=fns[i]();if(r===false)return false}if(auto)notify('decision','已超时自动处理：'+d.title,`默认选择「${d.opts[i]}」`);return true}
window.decide=(id,i)=>{const k=G.pend.findIndex(x=>x.id===id);if(k<0)return;const d=G.pend[k];if(!DECFN[d.id]){const x=DEC[d.k].f(G.cos[0]);DECFN[d.id]=x.opts.map(o=>o[1])}if(decApply(d,i)===false)return;G.pend.splice(k,1);toast(`✅ 已决定：${d.opts[i]}`);updBadge();openWin(curWin||'inbox',true)};
/* ===== 外交：互不侵犯条约 / 信誉 ===== */
const pactOf=(a,b)=>(G.pacts||[]).find(x=>((x.a===a&&x.b===b)||(x.a===b&&x.b===a))&&x.until>G.day);
function startWar(a,b,w,cmd){if(a===b||atWar(a,b))return false;if(stake(b,a)>=0.3)return false;
  {const pc=pactOf(a,b);if(pc){if(a!==0&&cmd!==0)return false;G.pacts=G.pacts.filter(x=>x!==pc);if(a===0||cmd===0){G.rep=Math.max(0,(G.rep??60)-30);G.cos.forEach(c=>{if(c.id!==0&&!c.dead)addRel(0,c.id,-10)});addNews(`💔 ${G.cos[0].name}撕毁与${G.cos[b].name}的互不侵犯条约，商业信誉大跌`);notify('dip','你撕毁了互不侵犯条约','信誉 −30，所有公司对你的关系 −10',true)}}}G.wars=G.wars||[];G.wars.push({a,b,w,start:G.day,cmd:cmd??null});addRel(a,b,-30);
  const A=G.cos[a],B=G.cos[b];addNews(`⚔️ ${A.name}${cmd!=null&&cmd!==a?`（受${G.cos[cmd].name}指使）`:''}向${B.name}发起商战（强度 ${'🔥'.repeat(w)}）`);
  if(b===0)notify('war',`${A.name} 向你发起商战！`,'断供、价格战、负面公关、砸盘、挖角……打开「⚔️ 商战」应对',true);buildWar();return true}
function endWar(i,why){const w=G.wars[i];if(!w)return;G.wars.splice(i,1);addRel(w.a,w.b,15);addNews(`🕊️ ${G.cos[w.a].name}与${G.cos[w.b].name}${why||'停战'}`);if(w.a===0||w.b===0)toast(`🕊️ ${G.cos[w.a===0?w.b:w.a].name} ${why||'停战'}`);buildWar()}
function warDaily(){const al=G.cos.filter(c=>!c.dead);const sells={};al.forEach(c=>sells[c.id]=new Set());G.b.forEach(b=>{if(isRetail(b))b.slots.forEach(s2=>sells[b.o]&&sells[b.o].add(s2.p))});
  for(const [k,h] of WH){const x=G.cos[Math.floor(k/100)],y=G.cos[k%100];if(!x||!y||x.dead||y.dead)continue;
    const cost=5000*h;x.cash-=cost;x.m.ad+=cost;y.sent=Math.max(0.3,y.sent-0.002*h);
    for(const p of sells[y.id]||[])if(sells[x.id]&&sells[x.id].has(p))y.brand[p]*=1-0.002*h}}
function warMonth(){G.wars=G.wars||[];G.pacts=(G.pacts||[]).filter(x=>x.until>G.day);G.rep=Math.min(100,(G.rep??60)+1);
  {const al2=G.cos.filter(c=>c.ai&&!c.dead);if(al2.length>1&&rnd()<0.15){const a=pick(al2),b=pick(al2);if(a!==b&&relOf(a.id,b.id)>25&&!atWar(a.id,b.id)&&!pactOf(a.id,b.id)){G.pacts.push({a:a.id,b:b.id,until:G.day+365*3});addNews(`📜 ${a.name}与${b.name}签订互不侵犯条约`)}}}G.own=G.own||{};G.ownCost=G.ownCost||{};const al=G.cos.filter(c=>!c.dead);
  const ov={};G.b.forEach(b=>{if(isRetail(b))b.slots.forEach(s2=>{(ov[b.o]=ov[b.o]||new Set()).add(b.c+'|'+s2.p)})});
  for(let i=0;i<al.length;i++)for(let j=i+1;j<al.length;j++){const a=al[i].id,b=al[j].id,A=ov[a]||new Set(),B=ov[b]||new Set();let n=0;for(const k of A)if(B.has(k))n++;
    const k=relK(a,b);G.rel=G.rel||{};G.rel[k]=(G.rel[k]||0)*0.93;addRel(a,b,-n*1.3+((stake(a,b)>=0.1||stake(b,a)>=0.1)?8:0)+(atWar(a,b)?-3:0))}
  // AI 宣战
  for(const A of al){if(!A.ai||ctrlOf(A.id)>=0||A.cash<3e6||A.loan>baseNW(A)*0.3)continue;const ag=A.style.price<1?1.6:A.style.exp>1.2?1.3:1;
    for(const B of al){if(B===A||atWar(A.id,B.id)||stake(B.id,A.id)>=0.3||GRP[A.id]===GRP[B.id])continue;const r=relOf(A.id,B.id);if(r>-45)continue;
      if(rnd()<clamp((-r-50)/120,0,0.4)*0.15*ag){startWar(A.id,B.id,1+Math.floor(rnd()*(A.cash>5e6?3:2)),null);break}}}
  // 停战
  for(let i=G.wars.length-1;i>=0;i--){const w=G.wars[i],m=(G.day-w.start)/30;if(w.a!==0&&w.b!==0&&w.cmd!==0&&m>4&&rnd()<0.08+m*0.01)endWar(i,'达成停战');
    else if(G.cos[w.a].dead||G.cos[w.b].dead)G.wars.splice(i,1)
    else{const A=G.cos[w.a],B=G.cos[w.b],weak=x=>x.ai&&(x.cash<8e5||x.loan>Math.max(1e6,baseNW(x)*0.5));if(w.cmd!==0&&w.a!==0&&weak(A))endWar(i,'因资金紧张而停战');else if(w.a!==0&&w.cmd!==0&&weak(B)&&rnd()<0.5)endWar(i,'停战（对方求和）')}}
  // AI 交叉持股
  for(const A of al){if(!A.ai||A.cash<6e6)continue;if(rnd()>0.05*(A.sk==='lanhai'?3:1))continue;
    const ext=t=>al.reduce((s2,x)=>s2+(x.id!==t?stake(x.id,t):0),0);const cand=al.filter(B=>B!==A&&!atWar(A.id,B.id)&&stake(A.id,B.id)<(B.id===0?0.35:0.45)&&ext(B.id)<(B.id===0?0.4:0.6)).sort((x,y)=>relOf(A.id,y.id)-relOf(A.id,x.id));const B=rnd()<0.6?cand[0]:pick(cand);if(!B)continue;
    const n=SHARES*0.05,cost=n*sharePrice(B)*1.01;if(cost>A.cash*0.4)continue;A.cash-=cost;(G.own[A.id]=G.own[A.id]||{})[B.id]=(G.own[A.id][B.id]||0)+n;(G.ownCost[A.id]=G.ownCost[A.id]||{})[B.id]=(G.ownCost[A.id][B.id]||0)+cost;B.sent=Math.min(1.8,B.sent*1.02);addRel(A.id,B.id,10);
    const pct=(stake(A.id,B.id)*100).toFixed(0);addNews(`📈 ${A.name}增持${B.name}股份至 ${pct}%`);if(B.id===0&&stake(A.id,0)>=0.3&&stake(A.id,0)-0.05<0.3)toast(`⚠️ ${A.name} 持有你 ${pct}% 股份：你已无法对它发起任何制裁`)}
  // 交战中挖角
  const me=G.cos[0];if(me.ex)for(const [k,h] of WH){if(k%100!==0)continue;const x=G.cos[Math.floor(k/100)];for(const r in me.ex){const e=me.ex[r];if(e&&e.trait!=='steady'&&rnd()<0.03*h){me.ex[r]=null;notify('hr',`${x.name} 在商战中挖走了你的${ROLES[r].n} ${e.name}`,'',true);(G.mlogHR=G.mlogHR||[]).push(`${ROLES[r].n} ${e.name} → ${x.name}`);addNews(`👔 商战升级：${x.name}挖走${me.name}的${ROLES[r].n}`)}}}
}
function baseNW(c){let v=c.cash+invVal(c)+netVal(c)-c.loan+(c.ai?ownCostVal(c):0);for(const b of G.b)if(b.o===c.id)v+=bval(b);return v}
const SHARES=100000;
const sharePrice=c=>Math.max(0.5,baseNW(c)/SHARES*c.sent);
function netWorth(c){let v=baseNW(c);if(c.id===0)for(const k in G.hold){const o=G.cos[k];if(!o.dead)v+=G.hold[k]*sharePrice(o)}return v}
function bankrupt(c){for(const b of G.b.filter(b=>b.o===c.id))removeBuilding(b);c.dead=true;if(G.own){delete G.own[c.id];for(const h in G.own)delete G.own[h][c.id]}if(G.ownCost){delete G.ownCost[c.id];for(const h in G.ownCost)delete G.ownCost[h][c.id]}G.wars=(G.wars||[]).filter(w=>w.a!==c.id&&w.b!==c.id);
  if(G.hold[c.id]){toast(`📉 你持有的 ${c.name} 破产，股票归零`);delete G.hold[c.id];delete G.cost[c.id]}
  addNews(`💥 ${c.av} ${c.founder}的${c.name}资不抵债，宣告破产！`);if(sel&&sel.o===c.id)select(null)}

