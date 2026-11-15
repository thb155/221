/* ===== 建造前的城市需求预览 ===== */
let prevOpen=true;
const tagS=(t,c)=>`<span class="tag" style="background:${c}22;color:${c};border-color:${c}55">${t}</span>`;
const sdTag=r=>r>1.15?tagS('供不应求','#22c55e'):r>0.9?tagS('平衡','#94a3b8'):tagS('过剩','#f43f5e');
const myMakes=()=>new Set(G.b.filter(b=>b.o===0&&b.prod&&P[b.prod]).map(b=>b.prod));
const payback=(inv,yr)=>yr>0?(inv/yr<1?'< 1 年':(inv/yr).toFixed(1)+' 年'):'<span class="neg">难以回本</span>';
// 住宅/写字楼：新建一栋 Lv1 后的预计入住率
function reForecast(city,type){const re=city.re||{},u=type==='apt'?80:50,dem=type==='apt'?(re.ten||0)*1.05*MM.apt:(re.od||0)*MM.office,sup=(type==='apt'?re.sa:re.so)||0;
  return{dem,sup,ratio:sup?dem/sup:9,occ:Math.min(0.97,0.97*clamp(dem/(sup+u),0.15,1.1)),u}}
function rePreview(city,type){const f=reForecast(city,type),bs=G.b.filter(b=>b.c===city.id&&b.type===type),mine=bs.filter(b=>b.o===0).length,
  avgOcc=bs.length?bs.reduce((s,b)=>s+(b.occ||0),0)/bs.length:0,avgRent=bs.length?bs.reduce((s,b)=>s+b.rent,0)/bs.length:0,apt=type==='apt';
  const st=f.ratio>1.15?tagS(apt?'缺房':'写字楼紧缺','#22c55e'):f.ratio>0.9?tagS('基本平衡','#94a3b8'):tagS(apt?'空置偏多':'空置偏多','#f43f5e');
  let h=`<div class="pv-kpis"><div><b>${fnum(f.dem)}</b><span>${apt?'租房需求（户）':'办公需求（单位）'}</span></div><div><b>${fnum(f.sup)}</b><span>现有供应（${bs.length} 栋，我的 ${mine} 栋）</span></div><div><b>${(f.occ*100).toFixed(0)}%</b><span>新建一栋预计入住率</span></div></div>
  <div class="row"><span>供需状态</span><span>${st} 需求/供应 ${f.sup?f.ratio.toFixed(2):'∞'}</span></div>`;
  if(bs.length)h+=`<div class="row"><span>本城同类平均入住率 / 租金</span><span>${(avgOcc*100).toFixed(0)}% / ¥${avgRent.toFixed(0)} 每${apt?'套':'单位'}日</span></div>`;
  if(apt)h+=`<div class="row"><span>城市人口 / 住房容量</span><span>${fnum(city.pop)} / ${fnum(city.cap||0)}</span></div><div class="row"><span>就业吸引力</span><span>${(city.attr||1).toFixed(2)} ${(city.attr||1)>1.05?'（就业多，人口会流入）':(city.attr||1)<0.95?'（就业少，人口增长慢）':''}</span></div>`;
  else h+=`<div class="row"><span>城内企业建筑数</span><span>${city.biz||0} 座（越多办公需求越大）</span></div>`;
  const mm=apt?MM.apt:MM.office;if(Math.abs(mm-1)>0.02)h+=`<div class="row"><span>宏观影响</span><span class="${mm>1?'pos':'neg'}">${apt?'住宅':'写字楼'}需求 ×${mm.toFixed(2)}</span></div>`;
  h+=`<div class="mu pv-tip">${f.ratio>1.15?'✅ 需求大于供应，新楼很快能租满。':f.ratio>0.9?'⚖️ 供需大致平衡，选市中心的位置租金更高。':'⚠️ 供应过剩，新楼入住率会偏低，可以先等人口增长或去别的城市。'}把鼠标移到地图上可看具体位置的租金和回本时间。</div>`;return h}
function retailPreview(city){const me=G.cos[0],mk=myMakes(),rows=[];
  for(const p of FINAL){const s=city.sales[p]||{D:P[p].dem||0,n:0,tot:0};let pw=0,pn=0;for(const b of G.b)if(isRetail(b)&&b.c===city.id)for(const sl of b.slots)if(sl.p===p){pw+=(sl.sold||0)*sl.price;pn+=sl.sold||0}
    const avg=pn?pw/pn:refNow(p),gap=Math.max(0,(s.D||0)-(s.tot||0)),mg=(avg-G.imp[p])/avg,score=(gap+(s.D||0)/((s.n||0)+1)*0.3)*Math.max(0,avg-G.imp[p]);rows.push({p,s,avg,gap,mg,score})}
  rows.sort((a,b)=>b.score-a.score);const stores=G.b.filter(b=>isRetail(b)&&b.c===city.id),mine=stores.filter(b=>b.o===0).length;
  let h=`<div class="pv-kpis"><div><b>${fnum(city.pop)}</b><span>城市人口</span></div><div><b>${stores.length}</b><span>门店总数（我的 ${mine} 家）</span></div><div><b>${SEG.map((g,k)=>g.ic+Math.round(segMix(city)[k]*100)).join(' ')}</b><span>消费者：价格/品质/品牌 %</span></div></div>
  <div class="mu pv-tip" style="margin:4px 0">按「机会」排序：需求缺口大、竞争店少、毛利高的商品排前面。</div>
  <table class="pv-t"><tr><th>商品</th><th>日需求</th><th>缺口</th><th>在售店</th><th>均价</th><th>毛利</th></tr>${rows.slice(0,8).map(r=>`<tr><td>${P[r.p].ic} ${P[r.p].n}${mk.has(r.p)?' <span class="tag">自产</span>':P[r.p].tech&&me.tech[r.p]<P[r.p].tech?' <span class="tag" title="需研发后自产或进口">进口</span>':''}</td><td>${fnum(r.s.D||0)}</td><td class="${r.gap>0?'pos':''}">${fnum(r.gap)}</td><td>${r.s.n||0}</td><td>${fmt(r.avg)}</td><td class="${r.mg>0.25?'pos':r.mg<0.1?'neg':''}">${(r.mg*100).toFixed(0)}%</td></tr>`).join('')}</table>
  <div class="mu pv-tip">门店选在人多、竞争少的地方：鼠标移到地图上可看客流指数和附近的竞争门店。</div>`;return h}
function factoryPreview(){const me=G.cos[0],rows=[];
  for(const p of [...MID,...FINAL]){const pp=P[p],cost=Object.keys(pp.inp||{}).reduce((s,k)=>s+pp.inp[k]*G.imp[k],0),val=FINAL.includes(p)?Math.max(G.imp[p],refNow(p)*0.85):G.imp[p],unit=val-cost,day=unit*pp.rate-BT.factory.op,sd=G.sd[p]||{s:0,d:0},lock=pp.tech&&me.tech[p]<pp.tech;
    rows.push({p,cost,val,unit,day,r:sd.s?sd.d/sd.s:(sd.d>0?9:1),lock})}
  rows.sort((a,b)=>(a.lock-b.lock)||(b.day-a.day));
  return`<div class="mu pv-tip" style="margin-bottom:4px">按每天毛利排序（Lv1 工厂满负荷、原料按当前批发价采购）。成品按 85% 零售参考价估算，可以进自家门店卖。</div>
  <table class="pv-t"><tr><th>产品</th><th>原料成本</th><th>产出价值</th><th>日毛利</th><th>市场</th></tr>${rows.slice(0,10).map(r=>`<tr${r.lock?' style="opacity:.55"':''}><td>${P[r.p].ic} ${P[r.p].n}${r.lock?` 🔒Lv${P[r.p].tech}`:''}</td><td>${fmt(r.cost)}</td><td>${fmt(r.val)}</td><td class="${r.day>0?'pos':'neg'}">${fmt(r.day)}</td><td>${sdTag(r.r)}</td></tr>`).join('')}</table>
  <div class="mu pv-tip">🔒 表示还没研发到所需技术等级。「供不应求」的中间品可以卖给别的公司（B2B），价格也在涨。</div>`}
function rawPreview(t){const ps=[...RAW].filter(p=>P[p].src===t);return`<table class="pv-t"><tr><th>产出</th><th>批发价</th><th>较基准</th><th>日收入</th><th>市场</th></tr>${ps.map(p=>{const sd=G.sd[p]||{s:0,d:0},r=sd.s?sd.d/sd.s:(sd.d>0?9:1);return`<tr><td>${P[p].ic} ${P[p].n}</td><td>${fmt(G.imp[p])}</td><td>${chg(p)}</td><td class="${P[p].rate*G.imp[p]>BT[t].op?'pos':'neg'}">${fmt(P[p].rate*G.imp[p]-BT[t].op)}</td><td>${sdTag(r)}</td></tr>`}).join('')}</table>
  <div class="mu pv-tip">日收入 = 日产量 × 批发价 − 运营费（Lv1）。原料价受宏观事件影响大，留意「宏观」窗口。</div>`}
function whPreview(){const me=G.cos[0];return`<table class="pv-t"><tr><th>城市</th><th>我的库存</th><th>单品上限</th><th>仓库</th></tr>${G.cities.map((c,ci)=>{const q=PK.reduce((s,p)=>s+me.ci[ci][p].q,0),n=G.b.filter(b=>b.o===0&&b.type==='wh'&&b.c===ci).length;return`<tr${ci===G.cur?' style="background:rgba(56,189,248,.08)"':''}><td>${c.n}</td><td>${fnum(q)}</td><td>${fnum(capCity(me,ci))}</td><td>${n}</td></tr>`}).join('')}</table><div class="mu pv-tip">每座仓库让本城单品库存上限 +3000 件，并降低本城的物流费用。</div>`}
function landPreview(city){const hst=city.idxHist||[],y=hst.length>12?city.idx/hst[hst.length-13]-1:0;return`<div class="pv-kpis"><div><b>${city.idx.toFixed(2)}</b><span>地价指数</span></div><div><b class="${y>=0?'pos':'neg'}">${(y*100).toFixed(1)}%</b><span>近一年涨幅</span></div><div><b>${(city.trend*1000).toFixed(1)}‰</b><span>当前月度趋势</span></div></div><div class="mu pv-tip">住宅越密集的地方地价越高。指数会周期波动，留意楼市调控等宏观事件。</div>`}
function netPreview(){const me=G.cos[0];return`<table class="pv-t"><tr><th>产品</th><th>用户上限</th><th>我的用户</th><th>领先者</th></tr>${NK.map(k=>{const lead=G.cos.filter(c=>!c.dead).sort((a,b)=>b.users[k]-a.users[k])[0];return`<tr><td>${NET[k].ic} ${NET[k].n}</td><td>${fnum(G.netU[k]||0)}</td><td>${fnum(me.users[k])}</td><td>${lead&&lead.users[k]>0?lead.name:'-'}</td></tr>`}).join('')}</table><div class="mu pv-tip">服务器：${fnum(usersOf(me))} / ${fnum(capOf(me))} 用户。数据中心每座 +5 万承载。</div>`}
function renderPrev(){const el=$('#bprev');if(!el)return;if(!G||!buildMode){el.classList.add('hidden');document.body.classList.remove('bprev');return}el.classList.remove('hidden');document.body.classList.toggle('bprev',prevOpen);
  const city=CUR(),t=buildMode,g=BT[t].g;
  if(!prevOpen){el.className='panel mini';el.innerHTML=`<button class="pv-open" onclick="prevOpen=true;renderPrev()">📋 ${city.n}需求预览</button>`;return}
  el.className='panel';let body;
  if(t==='apt'||t==='office')body=rePreview(city,t);else if(g==='retail')body=retailPreview(city);else if(t==='factory')body=factoryPreview();
  else if(t==='farm'||t==='forest'||t==='mine')body=rawPreview(t);else if(t==='wh')body=whPreview();else if(t==='land')body=landPreview(city);else if(t==='net'||t==='dc')body=netPreview();else body='<div class="mu">研发中心提升已有产品的品质，并解锁需要技术的新产品。</div>';
  const st=el.scrollTop;el.innerHTML=`<div class="pv-h"><b>📋 ${city.n} · ${BT[t].ic} ${BT[t].n} 需求预览</b><button class="gx" onclick="prevOpen=false;renderPrev()" title="收起">—</button></div>${body}`;el.scrollTop=st}
// 鼠标所在地块的具体估算（追加到建造提示里）
function lotEstimate(city,x,y){const t=buildMode;if(!t)return'';
  if(t==='apt'||t==='office'){const f=reForecast(city,t),rent=refRent({type:t,c:city.id,x,y}),inc=f.u*f.occ*rent*365-BT[t].op*365,inv=BT[t].cost+landPrice(city,x,y);
    return`<br>参考租金 ¥${rent.toFixed(0)}/${t==='apt'?'套':'单位'}·日 · 预计入住 ${(f.occ*100).toFixed(0)}%<br>预计年净收入 ${fmt(inc)} · 回本 ${payback(inv,inc)}`}
  if(BT[t].g==='retail'){const near={};for(const b of G.b)if(isRetail(b)&&b.c===city.id&&Math.hypot(b.x-x,b.y-y)<=7){const c=G.cos[b.o];near[c.id]=(near[c.id]||0)+1}
    const ks=Object.keys(near);return`<br>附近 7 格内门店：${ks.length?ks.map(id=>`<span style="color:${G.cos[id].col}">${+id===0?'我':G.cos[id].name}×${near[id]}</span>`).join(' '):'无，独占这片客流'}`}
  return''}
