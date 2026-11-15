/* ================= UI ================= */
function toast(t,kind){const d=document.createElement('div');d.className='toast'+(kind?' t-'+kind:'');d.innerHTML=t;$('#toasts').appendChild(d);setTimeout(()=>d.remove(),MOBILE?2600:3200);while($('#toasts').children.length>(MOBILE?2:4))$('#toasts').firstChild.remove()}
function addNews(t){const d=new Date(G.date);G.news.unshift(`[${d.getUTCFullYear()}/${d.getUTCMonth()+1}] ${t}`);G.news=G.news.slice(0,50);$('#news').textContent=G.news[0]}
function setSpeed(s){speed=s;document.querySelectorAll('#spd button').forEach(b=>b.classList.toggle('on',+b.dataset.s===s))}
document.querySelectorAll('#spd button').forEach(b=>b.onclick=()=>setSpeed(+b.dataset.s));
function setBuild(t){buildMode=t;hover=null;$('#bconf').classList.add('hidden');if(t&&MOBILE){document.body.classList.remove('showb');toast(`点击地图选择 ${BT[t].n} 的位置`)}document.querySelectorAll('.bbtn').forEach(b=>b.classList.toggle('on',b.dataset.t===t));if(!t)$('#tip').classList.add('hidden')}
let bgrp='retail';
function renderBuild(){$('#btabs').innerHTML=Object.entries(GROUPS).map(([k,v])=>`<button class="${k===bgrp?'on':''}" data-g="${k}">${v}</button>`).join('');
  document.querySelectorAll('#btabs button').forEach(b=>b.onclick=()=>{bgrp=b.dataset.g;renderBuild()});
  $('#blist').innerHTML=Object.entries(BT).filter(([k,v])=>v.g===bgrp).map(([k,v])=>`<button class="bbtn ${buildMode===k?'on':''}" data-t="${k}"><span class="ic">${v.ic}</span><span>${v.n}<small>${v.cost?fmt(v.cost)+' · ':'仅地价 · '}${v.d}</small></span></button>`).join('');
  document.querySelectorAll('#blist .bbtn').forEach(b=>b.onclick=()=>setBuild(buildMode===b.dataset.t?null:b.dataset.t))}
renderBuild();
function switchCity(i){G.cur=i;trucks=[];select(null);setBuild(null);centerCam();spawnCars();smoke=[];floats=[];miniDirty=true;renderCities()}
function renderCities(){$('#cities').innerHTML=G.cities.map((c,i)=>`<button class="${i===G.cur?'on':''}" onclick="switchCity(${i})" title="人口 ${fnum(c.pop)} · 地价指数 ${c.idx.toFixed(2)}">${c.n}</button>`).join('')}
window.switchCity=switchCity;
function topUI(){const me=G.cos[0],d=new Date(G.date);if(!$('#cname').dataset.l){$('#cname').innerHTML=logo(me,14)+' '+me.name;$('#cname').dataset.l=1}$('#s-rate').textContent=`利率 ${(G.rate*100).toFixed(2)}%`;$('#s-mev').textContent=G.mev.length?G.mev.map(e=>MDEF(e.k).ic).join(''):'🌤️';$('#s-cash').textContent=fmt(me.cash);$('#s-cash').className=me.cash<0?'neg':'';$('#s-nw').textContent=fmt(netWorth(me));
  const pf=me.m.rev+me.m.net+me.m.rent+me.m.dep+me.m.whole-me.m.purch-me.m.op-me.m.sal-(me.m.logi||0)-me.m.ad-me.m.int;$('#s-pf').textContent=fmt(pf);$('#s-pf').className=pf>=0?'pos':'neg';
  $('#s-date').textContent=`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
const busy=()=>{const a=document.activeElement;return a&&(a.tagName==='INPUT'||a.tagName==='SELECT')};
function panelRefresh(){if(busy()||!speed)return;if(sel)renderSide();else if(selH)renderHouse();if(curWin&&curWin!=='settings')openWin(curWin,true)}
let selH=null;
function selectHouse(ci,i){sel=null;selH={c:ci,i};document.body.classList.add('sideopen');if(MOBILE)document.body.classList.remove('showb');$('#side').classList.remove('hidden');renderHouse()}
function renderHouse(){const city=G.cities[selH.c],h=city.house[selH.i];if(!h){select(null);return}const cost=demoCost(city,selH.i),me=G.cos[0],x=selH.i%W,y=(selH.i/W)|0;
  $('#side').innerHTML=`<div class="row"><div style="font-size:16px;font-weight:700">🏘️ ${h.tower?'高层住宅楼':'居民民房'}</div><button onclick="select(null)">✕</button></div>
  <div class="row"><span class="k">所属</span><span>城市居民（非公司资产）</span></div><div class="row"><span class="k">城市</span><span>${city.n}</span></div>
  <div class="row"><span class="k">楼高 / 居民</span><span>${h.tower?h.h+' 米':'低层'} · 约 ${fnum(hcap(h))} 人</span></div>
  <div class="row"><span class="k">所在地块地价</span><span>${fmt(landPrice(city,x-1,y-1))}</span></div>
  <div class="card"><h4>💥 拆迁</h4><div class="row"><span class="k">拆迁补偿费</span><b style="color:#fb923c;font-size:16px">${fmt(cost)}</b></div>
  <div class="mu" style="font-size:12px;line-height:1.6">支付补偿后居民楼被拆除，空出的地可以自由建造。城市住房容量会减少，约 60% 的居民会离开这座城市。<br>提示：建造时直接选在居民楼上，会自动计算并支付拆迁费。</div>
  <button class="dng" style="width:100%;margin-top:8px;padding:10px" ${me.cash<cost?'disabled':''} onclick="doDemo()">💥 支付 ${fmt(cost)} 拆迁</button></div>`}
window.doDemo=()=>{if(!selH)return;const city=G.cities[selH.c],me=G.cos[0],cost=demoCost(city,selH.i);if(me.cash<cost){toast('资金不足');return}
  me.cash-=cost;demolish(city,selH.i,me);addNews(`🏚️ ${me.name}在${city.n}拆迁一栋居民楼，支付拆迁费 ${fmt(cost)}`);toast(`🏚️ 拆迁完成，支付 ${fmt(cost)}`);select(null)};
function select(b){sel=b;selH=null;document.body.classList.toggle('sideopen',!!b);if(!b){$('#side').classList.add('hidden');return}if(MOBILE)document.body.classList.remove('showb');$('#side').classList.remove('hidden');renderSide()}
function radar(a,b){const dims=[['规模',c=>Math.log10(Math.max(1,netWorth(c)))],['盈利',c=>{const m=c.months.slice(-6);return m.reduce((x,y)=>x+(y.profit||0),0)/6}],['技术',c=>PK.reduce((x,p)=>x+c.tech[p],0)],['品牌',c=>FINAL.reduce((x,p)=>x+c.brand[p],0)],['互联网',c=>usersOf(c)],['地产',c=>reVal(c)],['门店',c=>G.b.filter(x=>x.o===c.id&&isRetail(x)).length]];
  const N=dims.length,R=90,cx=120,cy=110;let g='';for(let r=1;r<=4;r++){g+=`<polygon points="${dims.map((_,i)=>{const an=-Math.PI/2+i*2*Math.PI/N;return`${cx+Math.cos(an)*R*r/4},${cy+Math.sin(an)*R*r/4}`}).join(' ')}" fill="none" stroke="rgba(148,163,184,.2)"/>`}
  dims.forEach(([n],i)=>{const an=-Math.PI/2+i*2*Math.PI/N;g+=`<text x="${cx+Math.cos(an)*(R+14)}" y="${cy+Math.sin(an)*(R+14)+4}" fill="#94a3b8" font-size="11" text-anchor="middle">${n}</text>`});
  const vals=[a,b].map(c=>dims.map(d=>d[1](c)));const poly2=(v,col)=>`<polygon points="${v.map((x,i)=>{const mx=Math.max(1e-9,Math.abs(vals[0][i]),Math.abs(vals[1][i])),r=Math.max(0.05,x/mx);const an=-Math.PI/2+i*2*Math.PI/N;return`${cx+Math.cos(an)*R*r},${cy+Math.sin(an)*R*r}`}).join(' ')}" fill="${col}33" stroke="${col}" stroke-width="2"/>`;
  return`<svg viewBox="0 0 240 225" width="100%" style="max-width:340px;display:block;margin:auto">${g}${poly2(vals[1],b.col)}${poly2(vals[0],PLAYER_COL)}</svg><div class="row" style="justify-content:center;gap:16px;font-size:12px"><span>${logo(a,14)} 你</span><span>${logo(b,14)} ${b.name}</span></div>`}
function svgChart(series,labels,o){o=o||{};const W2=640,H2=o.h||190,pl=64,pr=12,pt=12,pb=24,n=Math.max(1,labels.length);
  const all=series.flatMap(s2=>s2.vals).filter(v=>isFinite(v));if(!all.length)return'<div class="mu" style="padding:20px;text-align:center">暂无数据，再经营一段时间就有了</div>';
  let mx=Math.max(o.zero===false?-Infinity:0,...all),mn=Math.min(o.zero===false?Infinity:0,...all);if(mx===mn){mx+=1;mn-=o.zero===false?1:0}const pad=(mx-mn)*0.08;if(o.zero===false){mn-=pad}mx+=pad;
  const bw=(W2-pl-pr)/n,X=i=>pl+(i+0.5)*bw,Y=v=>pt+(mx-v)/(mx-mn)*(H2-pt-pb),yf=o.yf||(v=>fmt(v));
  let g='';for(let k=0;k<=4;k++){const v=mn+(mx-mn)*k/4,y=Y(v);g+=`<line x1="${pl}" x2="${W2-pr}" y1="${y}" y2="${y}" stroke="rgba(148,163,184,.15)"/><text x="${pl-6}" y="${y+4}" fill="#94a3b8" font-size="11" text-anchor="end">${yf(v)}</text>`}
  if(mn<0&&mx>0)g+=`<line x1="${pl}" x2="${W2-pr}" y1="${Y(0)}" y2="${Y(0)}" stroke="rgba(226,232,240,.4)"/>`;
  const step=Math.max(1,Math.ceil(n/7));labels.forEach((l,i)=>{if(i%step===0||i===n-1)g+=`<text x="${X(i)}" y="${H2-6}" fill="#94a3b8" font-size="11" text-anchor="middle">${l}</text>`});
  const nb=series.filter(s2=>s2.type==='bar').length;let bi=0;
  for(const s2 of series){if(s2.type==='bar'){const w=Math.max(2,bw*0.7/nb),off=-bw*0.35+bi*w;bi++;s2.vals.forEach((v,i)=>{if(!isFinite(v))return;const y0=Y(0),y=Y(v);g+=`<rect x="${X(i)+off}" y="${Math.min(y,y0)}" width="${w-1}" height="${Math.max(1,Math.abs(y-y0))}" fill="${s2.sign?(v>=0?'#22c55e':'#f43f5e'):s2.col}" opacity=".85"><title>${s2.name} ${labels[i]}：${fmt(v)}</title></rect>`})}
    else{const pts=s2.vals.map((v,i)=>isFinite(v)?`${X(i)},${Y(v)}`:null).filter(Boolean);if(pts.length)g+=`<polyline points="${pts.join(' ')}" fill="none" stroke="${s2.col}" stroke-width="${s2.w||2.2}" stroke-linejoin="round"/>`+(pts.length<40?s2.vals.map((v,i)=>isFinite(v)?`<circle cx="${X(i)}" cy="${Y(v)}" r="2.5" fill="${s2.col}"><title>${s2.name} ${labels[i]}：${yf(v)}</title></circle>`:'').join(''):'')}}
  return`<svg viewBox="0 0 ${W2} ${H2}" width="100%" style="display:block">${g}</svg><div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;margin-top:2px">${series.map(s2=>`<span><i style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${s2.sign?'linear-gradient(90deg,#22c55e 50%,#f43f5e 50%)':s2.col};margin-right:4px"></i>${s2.name}</span>`).join('')}</div>`}
function spark(arr,col){if(!arr||!arr.length)return'';const w=300,h=46,mx=Math.max(...arr),mn=Math.min(0,...arr),rg=Math.max(1e-9,mx-mn);const pts=arr.map((v,i)=>`${(i/Math.max(1,arr.length-1))*w},${h-(v-mn)/rg*(h-4)-2}`).join(' ');
  return`<svg width="100%" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="display:block;margin-top:5px"><polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2"/></svg>`}
function renderSide(){const b=sel;if(!b||!G.b.includes(b)){select(null);return}
  const c=G.cos[b.o],mine=b.o===0,bt=BT[b.type],city=G.cities[b.c];
  let h=`<div class="row"><div style="font-size:16px;font-weight:700">${bt.ic} ${bt.n} ${b.type!=='land'?`<span class="tag">★${b.lv}</span>`:''}</div><button onclick="select(null)">✕</button></div>
  <div class="row"><span class="k">所属</span><b style="color:${c.col}">${logo(c,18)} ${c.name}</b></div><div class="row"><span class="k">城市</span><span>${city.n}</span></div>
  <div class="row"><span class="k">日运营成本</span><span>${fmt(opCost(b))}</span></div><div class="row"><span class="k">资产估值</span><span>${fmt(bval(b))}（地价 ${fmt(landOf(b))}）</span></div>`;
  if(isRetail(b))h+=`<div class="row"><span class="k">客流指数</span><span>${traffic(city,b.x,b.y).toFixed(2)}（周边居民 ${(gAt(city,'resd',b.x+1,b.y+1)*100).toFixed(0)}）</span></div>`;
  const sel1=(opts)=>mine?`<select onchange="setProd(this.value)" style="width:100%"><option value="">— 选择 —</option>${opts.map(([v,t])=>`<option value="${v}" ${b.prod===v?'selected':''}>${t}</option>`).join('')}</select>`:(b.prod?ic(b.prod)+' '+nm(b.prod):'无');
  if(b.type==='farm'||b.type==='forest'||b.type==='mine'){
    h+=`<div class="card"><h4>生产品种</h4>${sel1(RAW.filter(p=>P[p].src===b.type).map(p=>[p,`${P[p].ic} ${P[p].n}（进口 ${fmt(G.imp[p])}）`]))}
    ${b.prod?`<div class="row"><span class="k">日产量</span><b>${fnum(b.out)}</b></div><div class="row"><span class="k">品质</span><span>${techQ(c.tech[b.prod])}</span></div><div class="row"><span class="k">库存</span><span>${fnum(c.inv[b.prod].q)}</span></div>`:''}</div>`}
  else if(b.type==='factory'){
    h+=`<div class="card"><h4>生产产品</h4>${sel1([...MID,...FINAL].map(p=>[p,`${P[p].ic} ${P[p].n}${P[p].tech&&c.tech[p]<P[p].tech?' 🔒Lv'+P[p].tech:''} · ${Object.keys(P[p].inp).map(k=>P[k].n+'×'+P[p].inp[k]).join('+')}`]))}`;
    if(b.prod){const pp=P[b.prod],lock=pp.tech&&c.tech[b.prod]<pp.tech;
      h+=`${lock?`<div class="neg" style="margin-top:6px">🔒 需研发中心将该产品研发到 Lv${pp.tech}</div>`:''}<div class="row"><span class="k">产能/日</span><span>${fnum(pp.rate*lvMul(b.lv))}</span></div><div class="row"><span class="k">今日产量</span><b>${fnum(b.out)}</b></div>
      <div class="row"><span class="k">原料</span><span>${Object.keys(pp.inp).map(k=>`${P[k].ic}${P[k].n} 库存${fnum(c.inv[k].q)}`).join('<br>')}</span></div>
      <div class="row"><span class="k">产出品质</span><span>${c.inv[b.prod].q>0?c.inv[b.prod].ql.toFixed(1):'-'}</span></div>
      <div class="row"><span class="k">比进口省/件</span><span class="pos">${fmt(G.imp[b.prod]-Object.keys(pp.inp).reduce((s,k)=>s+pp.inp[k]*G.imp[k],0))}</span></div>`}h+='</div>'}
  else if(b.type==='lab'||b.type==='net'){const keys=b.type==='lab'?PK:NK,yr=yearNow();
    h+=`<div class="card"><h4>${b.type==='lab'?'研究课题':'开发产品'}</h4>${sel1(keys.map(p=>[p,`${ic(p)} ${nm(p)} (Lv${c.tech[p]})${NET[p]&&yr<NET[p].year?' · '+NET[p].year+'年进入爆发期':''}`]))}`;
    if(b.prod){h+=`<div class="row"><span class="k">技术等级</span><b>Lv${c.tech[b.prod]} · 品质 ${techQ(c.tech[b.prod])}</b></div><div class="bar"><i style="width:${c.rp[b.prod]/techNeed(c.tech[b.prod])*100}%"></i></div><div class="row"><span class="k">进度</span><span>${c.rp[b.prod].toFixed(0)}/${techNeed(c.tech[b.prod])}（+${b.out.toFixed(1)}/日）</span></div>`;
      if(NET[b.prod]){const k=b.prod;h+=`<div class="row"><span class="k">状态</span><span>${c.tech[k]>=1?'🟢 运营中'+(yr<NET[k].year?`（市场成熟度 ${Math.round(netStage(k,yr)*100)}%，${NET[k].year} 年爆发）`:''):'🛠️ 开发中（Lv1 上线）'}</span></div><div class="row"><span class="k">用户</span><b>${fnum(c.users[k])}</b></div><div class="row"><span class="k">服务器容量</span><span>${fnum(usersOf(c))} / ${fnum(capOf(c))}</span></div>${capOf(c)===0?'<div class="neg">⚠ 需要建数据中心才能承载用户</div>':''}`}}
    h+='</div>'}
  else if(b.type==='wh'){const nwh=((LOG.wh[c.id]||{})[b.c]||[b]).length||1,items=PK.map(p=>[p,c.ci[b.c][p].q/nwh]).filter(x=>x[1]>=1).sort((a,b2)=>b2[1]*G.imp[b2[0]]-a[1]*G.imp[a[0]]);
    const served=G.b.filter(x=>x.o===c.id&&x.c===b.c&&(isRetail(x)||x.type==='factory')).length;
    h+=`<div class="card"><h4>📦 仓库存放：${logo(c,16)} ${c.name} 的商品</h4><div class="row"><span class="k">本仓容量</span><span>每种商品 ${fnum(3000*lvMul(b.lv))} 件</span></div><div class="row"><span class="k">本市库存上限</span><span>每种 ${fnum(capCity(c,b.c))} 件（无仓库 1000）</span></div>
    <div class="row"><span class="k">服务本城门店/工厂</span><span>${served} 座</span></div><div class="mu" style="font-size:12px;line-height:1.6">· 运往${G.cities[b.c].n}的跨城运费按仓库发货计算（更便宜）<br>· 本市门店从最近的仓库/工厂配送，距离越近运费越低<br>· 提高公司库存上限，减少低价甩卖</div>
    <h4 style="margin-top:8px">本市库存明细${nwh>1?'（多座仓库平均分摊）':''}</h4>${items.length?items.slice(0,12).map(([p,q])=>`<div class="row"><span>${P[p].ic} ${P[p].n}</span><span>${fnum(q)} 件 · ${fmt(q*G.imp[p])}</span></div>`).join(''):'<div class="mu">仓库目前是空的</div>'}</div>`}
  else if(b.type==='dc'){h+=`<div class="card"><div class="row"><span class="k">承载</span><b>${fnum(50000*lvMul(b.lv))} 用户</b></div><div class="row"><span class="k">公司总用户/容量</span><span>${fnum(usersOf(c))} / ${fnum(capOf(c))}</span></div></div>`}
  else if(isRent(b)){const ref=refRent(b);
    h+=`<div class="card"><h4>${b.type==='apt'?'住宅出租':'写字楼出租'}</h4><div class="row"><span class="k">租金/单元/日</span><b id="rv">${fmt(b.rent)}</b><span class="mu">市场参考 ${fmt(ref)}</span></div>
    ${mine?`<input type="range" min="${Math.round(ref*0.4)}" max="${Math.round(ref*2.2)}" value="${Math.round(b.rent)}" oninput="setRent(this.value)">`:''}
    <div class="row"><span class="k">单元数</span><span>${fnum(units(b))}</span><span class="k">出租率</span><b>${(b.occ*100).toFixed(1)}%</b></div>
    <div class="row"><span class="k">今日租金</span><b class="pos">${fmt(b.out)}</b></div><div class="row"><span class="k">城市供需</span><span>${((b.type==='apt'?city.re?.fa:city.re?.fo)||1)>0.9?'🟢 供不应求':'🟠 供应偏多'}</span></div>
    <div class="row"><span class="k">买入成本</span><span>${fmt(b.paid)}</span><span class="k">增值</span><span class="${bval(b)>=b.paid?'pos':'neg'}">${fmt(bval(b)-b.paid)}</span></div></div>`}
  else if(b.type==='land'){h+=`<div class="card"><h4>土地储备</h4><div class="row"><span class="k">买入价</span><span>${fmt(b.paid)}</span></div><div class="row"><span class="k">当前地价</span><b>${fmt(landOf(b))}</b></div><div class="row"><span class="k">浮盈</span><b class="${landOf(b)>=b.paid?'pos':'neg'}">${fmt(landOf(b)-b.paid)}</b></div><div class="row"><span class="k">城市地价指数</span><span>${city.idx.toFixed(2)}（月 ${(city.trend*100).toFixed(1)}%）</span></div><div class="mu" style="font-size:11px">每日缴纳地价 0.004% 的持有成本</div></div>`;
    if(mine)h+=`<div class="card"><h4>在此开发（免地价）</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">${Object.entries(BT).filter(([k])=>k!=='land').map(([k,v])=>`<button onclick="develop('${k}')" style="text-align:left;padding:5px 7px">${v.ic} ${v.n}<small style="display:block;color:var(--mu);font-size:11px">${fmt(v.cost)}</small></button>`).join('')}</div></div>`}
  else if(isRetail(b)){const mx=BT[b.type].slots,cap=BT[b.type].cap*lvMul(b.lv);h+=`<div class="card"><h4>货架（最多 ${mx} 种）· 今日营收 ${fmt(b.out)}</h4>`;
    b.slots.forEach((s,i)=>{const p=P[s.p],lo=Math.round(G.imp[s.p]*0.8),hi=Math.round(refNow(s.p)*2.2);
      h+=`<div style="padding:6px 0;border-bottom:1px solid var(--bd)"><div class="row"><b>${p.ic} ${p.n}</b>${mine?`<button onclick="delSlot(${i})" style="padding:2px 7px">移除</button>`:''}</div>
      <div class="row"><span class="k">售价</span><b id="pv${i}">${fmt(s.price)}</b><span class="mu">参考 ${fmt(refNow(s.p))}</span></div>${mine?`<input type="range" min="${lo}" max="${hi}" value="${Math.round(s.price)}" oninput="setPrice(${i},this.value)">`:''}
      <div class="row"><span class="k">日销量</span><span>${fnum(s.sold||0)}/${fnum(cap)}</span><span class="k">份额</span><span>${((s.share||0)*100).toFixed(1)}%</span></div>${s.sg?`<div class="row mu" style="font-size:11px"><span>客群构成</span><span>${SEG.map((g,k)=>`${g.ic}${(s.sg[k]*100).toFixed(0)}%`).join(' ')}</span></div>`:''}
      <div class="row"><span class="k">货源</span><span>${s.src===c.id?`${logo(c,16)} 自有库存 · 物流 ¥${frUnit(c,s.p,b).toFixed(2)}/件`:s.src>=0&&G.cos[s.src]?`${logo(G.cos[s.src],16)} 供应商：${G.cos[s.src].name}`:'🚢 进口 '+fmt(G.imp[s.p])}</span><span class="k">品质</span><span>${(s.q||G.qm).toFixed(0)}</span></div></div>`});
    if(mine&&b.slots.length<mx){const have=new Set(b.slots.map(s=>s.p));h+=`<select id="addp" style="width:100%;margin-top:7px">${FINAL.filter(p=>!have.has(p)).map(p=>`<option value="${p}">${P[p].ic} ${P[p].n}（进口 ${fmt(G.imp[p])} / 参考 ${fmt(refNow(p))}）</option>`).join('')}</select><button class="pri" style="width:100%;margin-top:6px" onclick="addSlot()">＋ 上架</button>`}
    h+='</div>'}
  if(b.type!=='dc'&&b.type!=='land')h+=`<div class="card"><h4>${isRetail(b)?'近 60 日营收':isRent(b)?'近 60 日租金':'近 60 日产出'}</h4>${spark(b.hist,c.col)}</div>`;
  if(mine){ensureSub(c,b);const pm=b.pm||{rev:0,cogs:0,op:0};h+=`<div class="card"><div class="row"><span class="k">所属子公司</span><select onchange="moveSub(${b.id},this.value)">${c.subs.map(x=>`<option value="${x.id}" ${x.id===b.sub?'selected':''}>${x.ic} ${x.name}</option>`).join('')}</select></div><div class="row"><span class="k">本月 营收/成本/运营费</span><span>${fmt(pm.rev)} / ${fmt(pm.cogs)} / ${fmt(pm.op)}</span></div><div class="row"><span class="k">本月利润</span><b class="${pm.rev-pm.cogs-pm.op>=0?'pos':'neg'}">${fmt(pm.rev-pm.cogs-pm.op)}</b></div></div>`}
  if(mine){const uc=BT[b.type].cost*0.6*b.lv;h+=`<div style="display:flex;gap:8px">${b.type==='land'?'':b.lv<5?`<button class="pri" style="flex:1" onclick="upgrade()">⬆ 扩建 ${fmt(uc)}</button>`:'<button disabled style="flex:1">已满级</button>'}<button class="dng" style="flex:1" onclick="sellB()">出售 ${fmt(sellVal(b))}</button></div>${isRE(b)?'':'<div class="mu" style="font-size:11px;margin-top:5px">非地产建筑出售时房屋部分只按 70% 回收</div>'}`}
  else if(isRE(b)&&!c.dead)h+=`<button class="pri" style="width:100%" onclick="buyRE(${b.id})">💰 收购此物业 ${fmt(bval(b)*1.12)}</button>`;
  $('#side').innerHTML=h}
window.select=select;
window.setProd=v=>{sel.prod=v||null;sel.hist=[];G.cities[sel.c].dirty=true;renderSide()};
window.setPrice=(i,v)=>{sel.slots[i].price=+v;$('#pv'+i).textContent=fmt(+v)};
window.setRent=v=>{sel.rent=+v;$('#rv').textContent=fmt(+v)};
window.addSlot=()=>{const p=$('#addp').value;if(!p)return;sel.slots.push({p,price:Math.round(refNow(p)),sold:0});renderSide()};
window.delSlot=i=>{sel.slots.splice(i,1);renderSide()};
window.upgrade=()=>{const me=G.cos[0],cost=BT[sel.type].cost*0.6*sel.lv;if(me.cash<cost){toast('资金不足');return}me.cash-=cost;sel.bc+=cost*0.8;sel.lv++;G.cities[sel.c].dirty=true;toast(`⬆ 扩建完成 ★${sel.lv}`);renderSide()};
window.sellB=()=>{const v=sellVal(sel);G.cos[0].cash+=v;toast(`已出售，回收 ${fmt(v)}`);removeBuilding(sel);select(null)};
window.develop=t=>{const me=G.cos[0],b=sel,cost=BT[t].cost;if(me.cash<cost){toast('资金不足');return}me.cash-=cost;b.type=t;b.bc=cost;b.dep=0.85;b.paid+=cost;b.hist=[];b.lv=1;b.slots=[];b.prod=null;if(isRent(b)){b.rent=Math.round(refRent(b));b.occ=0.3}if(!b.sub||b.sub.startsWith('d_'))ensureSub(me,b,true);G.cities[b.c].dirty=true;toast(`🏗️ 已在土地上建成${BT[t].n}`);renderSide()};
window.buyRE=id=>{const b=bById(id);if(!b)return;const me=G.cos[0],o=G.cos[b.o],price=bval(b)*1.12;if(me.cash<price){toast('资金不足');return}
  me.cash-=price;o.cash+=price;b.o=0;b.paid=price;ensureSub(me,b,true);G.cities[b.c].dirty=true;addNews(`🤝 ${me.name}从${o.name}手中收购${G.cities[b.c].n}一处${BT[b.type].n}，成交价 ${fmt(price)}`);toast('✅ 收购成功');if(sel===b)renderSide();if(curWin==='re')openWin('re',true)};
window.buyAuction=i=>{const a=G.auctions[i];if(!a)return;const city=G.cities[a.c],me=G.cos[0],price=landPrice(city,a.x,a.y)*a.k;
  if(!lotOk(city,a.x,a.y)){G.auctions.splice(i,1);toast('地块已被占用');openWin('re',true);return}if(me.cash<price){toast('资金不足');return}
  me.cash-=price;const b=placeBuilding(me,'land',a.c,a.x,a.y,true);b.paid=price;G.auctions.splice(i,1);addNews(`🔨 ${me.name}在${city.n}土地拍卖中竞得一块地，成交 ${fmt(price)}`);toast('🔨 竞拍成功！可在地块上开发');openWin('re',true)};

