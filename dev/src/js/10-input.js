/* ================= 输入 ================= */
let drag=null,pinch=null;const ptrs=new Map();
cv.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{cv.setPointerCapture(e.pointerId)}catch(_){}
  if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.max(10,Math.hypot(a.x-b.x,a.y-b.y)),mx:(a.x+b.x)/2,my:(a.y+b.y)/2,z:cam.z,cx:cam.x,cy:cam.y};if(drag)drag.moved=true}
  else if(ptrs.size===1)drag={x:e.clientX,y:e.clientY,cx:cam.x,cy:cam.y,moved:false,touch:e.pointerType!=='mouse'}});
cv.addEventListener('pointermove',e=>{if(!G)return;if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2,nz=clamp(pinch.z*d/pinch.d,0.25,2.5);
    const wx=(pinch.mx-pinch.cx)/pinch.z,wy=(pinch.my-pinch.cy)/pinch.z;cam.z=nz;cam.x=mx-wx*nz;cam.y=my-wy*nz;lastZoomT=performance.now();return}
  const city=CUR();const [gx,gy]=toGrid(e.clientX,e.clientY);
  if(drag&&ptrs.size===1){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>(drag.touch?10:5)){drag.moved=true;cv.classList.add('drag')}if(drag.moved){cam.x=drag.cx+dx;cam.y=drag.cy+dy}}
  const tip=$('#tip');if(e.pointerType!=='mouse'){tip.classList.add('hidden');return}
  if(buildMode){hover={x:Math.floor(gx-0.5),y:Math.floor(gy-0.5)};const ok=lotOk(city,hover.x,hover.y);tip.classList.remove('hidden');tip.style.left=e.clientX+16+'px';tip.style.top=e.clientY+12+'px';tip.innerHTML=buildInfo(city,hover.x,hover.y)}
  else{const fx=Math.floor(gx),fy=Math.floor(gy);let h=null,au=null,hs=null;if(fx>=0&&fy>=0&&fx<W&&fy<H){const o=city.occ[idx(fx,fy)];if(o>=0)h=bById(o);else{au=G.auctions.find(a=>a.c===city.id&&fx>=a.x&&fx<=a.x+1&&fy>=a.y&&fy<=a.y+1);if(!au&&city.house[idx(fx,fy)])hs=idx(fx,fy)}}
    if(hs!=null&&!drag){const hh=city.house[hs];tip.classList.remove('hidden');tip.style.left=e.clientX+16+'px';tip.style.top=e.clientY+12+'px';tip.innerHTML=`🏘️ ${hh.tower?'高层住宅':'民房'} · 约 ${fnum(hcap(hh))} 位居民<br>拆迁费 ${fmt(demoCost(city,hs))} <span class="mu">点击可拆迁</span>`}
    else if((h||au)&&!drag){tip.classList.remove('hidden');tip.style.left=e.clientX+16+'px';tip.style.top=e.clientY+12+'px';
      tip.innerHTML=h?`<b style="color:${G.cos[h.o].col}">${G.cos[h.o].name}</b> · ${BT[h.type].n} ★${h.lv}<br>估值 ${fmt(bval(h))}`:`🔨 土地拍卖：起拍价 ${fmt(landPrice(city,au.x,au.y)*au.k)}<br><span class="mu">点击查看</span>`}else tip.classList.add('hidden')}});
function buildInfo(city,x,y){const ld=lotDemo(city,x,y);return ld?`${BT[buildMode].ic} <b>${BT[buildMode].n}</b>（${city.n}）<br>${BT[buildMode].cost?'建造 '+fmt(BT[buildMode].cost)+' + ':''}地价 ${fmt(landPrice(city,x,y))}${ld.hs.length?`<br><span style="color:#fb923c">🏚️ 需拆迁 ${ld.hs.length} 栋居民楼，拆迁费 ${fmt(ld.cost)}</span>`:''}${BT[buildMode].g==='retail'?`<br>客流指数 ${traffic(city,x,y).toFixed(2)} · 周边居民 ${(gAt(city,'resd',x+1,y+1)*100).toFixed(0)}`:''}${lotEstimate(city,x,y)}`:'<span class="neg">此处无法建造，请换个位置</span>'}
function placeAt(x,y,keep){const city=CUR(),ld=lotDemo(city,x,y);if(!ld){toast('此处无法建造');return}
  const me=G.cos[0],cost=BT[buildMode].cost+landPrice(city,x,y)+ld.cost;if(me.cash<cost){toast('资金不足！可在财务中心贷款');return}
  if(ld.hs.length){me.cash-=ld.cost;me.m.op+=0;ld.hs.forEach(i=>demolish(city,i,me));addNews(`🏚️ ${me.name}在${city.n}拆迁 ${ld.hs.length} 栋居民楼，支付拆迁费 ${fmt(ld.cost)}`)}
  const b=placeBuilding(me,buildMode,city.id,x,y,false);sfx('build');toast(`✅ ${city.n}：${BT[buildMode].n}，共花费 ${fmt(cost)}${ld.hs.length?`（含拆迁费 ${fmt(ld.cost)}）`:''}`);if(!keep)setBuild(null);select(b)}
$('#bconf-ok').onclick=()=>{if(buildMode&&hover){placeAt(hover.x,hover.y,false)}$('#bconf').classList.add('hidden')};
$('#bconf-no').onclick=()=>{setBuild(null)};
const endPtr=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(ptrs.size===1){const [p]=[...ptrs.values()];drag={x:p.x,y:p.y,cx:cam.x,cy:cam.y,moved:true,touch:true}}};
cv.addEventListener('pointercancel',e=>{endPtr(e);if(!ptrs.size)drag=null});
cv.addEventListener('pointerup',e=>{const multi=ptrs.size>1;endPtr(e);cv.classList.remove('drag');if(!G){drag=null;return}if(multi||ptrs.size)return;
  const moved=drag&&drag.moved,touch=drag&&drag.touch;drag=null;if(moved)return;
  const city=CUR();const [gx,gy]=toGrid(e.clientX,e.clientY);
  if(buildMode){const x=Math.floor(gx-0.5),y=Math.floor(gy-0.5);
    if(touch){hover={x,y};$('#bconf-t').innerHTML=buildInfo(city,x,y);$('#bconf-ok').disabled=!lotDemo(city,x,y);$('#bconf').classList.remove('hidden');return}
    placeAt(x,y,e.shiftKey);return}
  const fx=Math.floor(gx),fy=Math.floor(gy);if(fx<0||fy<0||fx>=W||fy>=H){select(null);return}const o=city.occ[idx(fx,fy)];
  if(o<0&&G.auctions.some(a=>a.c===city.id&&fx>=a.x&&fx<=a.x+1&&fy>=a.y&&fy<=a.y+1)){openWin('re');return}
  if(o<0&&city.house[idx(fx,fy)]){selectHouse(city.id,idx(fx,fy));return}
  select(o>=0?bById(o):null)});
cv.addEventListener('wheel',e=>{e.preventDefault();const nz=clamp(cam.z*Math.exp(-e.deltaY*0.0015),0.25,2.5),k=nz/cam.z;cam.x=e.clientX-(e.clientX-cam.x)*k;cam.y=e.clientY-(e.clientY-cam.y)*k;cam.z=nz;lastZoomT=performance.now()},{passive:false});
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='s'&&G){e.preventDefault();save();return}if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;if(e.code==='Space'){e.preventDefault();setSpeed(speed?0:1)}
  if(e.key==='Escape'){setBuild(null);if(!$('#modal').classList.contains('hidden'))closeModal();else select(null)}if(e.key==='1')setSpeed(1);if(e.key==='2')setSpeed(2);if(e.key==='3')setSpeed(3)});

