/* ================= 存档 / 启动 ================= */
const SKEY='capital-empire-lab-v13';const SKIP=new Set(['style','dens','resd']);
const NSLOT=8;
const ser=()=>JSON.stringify(G,(k,v)=>SKIP.has(k)?undefined:v);
function gameDateStr(){const d=new Date(G.date);return`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`}
const metaOf=()=>({co:G.cos[0].name,founder:G.cos[0].founder,gd:gameDateStr(),nw:netWorth(G.cos[0]),t:Date.now(),v:SKEY});
let _db=null;
function idb(){return new Promise((res,rej)=>{if(_db)return res(_db);try{const r=indexedDB.open('cel-saves',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>{_db=r.result;res(_db)};r.onerror=()=>rej(r.error)}catch(e){rej(e)}})}
async function slotPut(k,rec){try{const db=await idb();await new Promise((res,rej)=>{const tx=db.transaction('s','readwrite');tx.objectStore('s').put(rec,k);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){localStorage.setItem('cel-slot-'+k,JSON.stringify(rec))}}
async function slotGet(k){try{const db=await idb();const v=await new Promise((res,rej)=>{const r=db.transaction('s').objectStore('s').get(k);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(v)return v}catch(e){}try{const s2=localStorage.getItem('cel-slot-'+k);return s2?JSON.parse(s2):null}catch(e){return null}}
async function slotDel(k){try{const db=await idb();await new Promise(res=>{const tx=db.transaction('s','readwrite');tx.objectStore('s').delete(k);tx.oncomplete=res;tx.onerror=res})}catch(e){}try{localStorage.removeItem('cel-slot-'+k)}catch(e){}}
async function renderSlots(){const el=$('#slots');if(!el)return;let h2='';
  let auto=null;try{const s2=localStorage.getItem(SKEY);if(s2){const m2=localStorage.getItem(SKEY+'-meta');auto=m2?JSON.parse(m2):{co:'自动存档',gd:'',nw:0,t:0}}}catch(e){}
  const card=(k,m,auto2)=>`<div class="card"><div class="row"><b>${auto2?'🔁 自动存档':'💾 存档 '+k}</b>${m?`<span class="mu" style="font-size:11px">${m.t?new Date(m.t).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):''}</span>`:'<span class="tag">空</span>'}</div>
    ${m?`<div style="margin:4px 0">${m.co||''}${m.founder?' · '+m.founder:''}</div><div class="row mu" style="font-size:12px"><span>游戏日期 ${m.gd||'-'}</span><span>净资产 ${fmt(m.nw||0)}</span></div>`:'<div class="mu" style="font-size:12px;margin:6px 0">空存档位</div>'}
    <div style="display:flex;gap:5px;margin-top:6px">${!auto2&&G?`<button class="pri" style="flex:1" onclick="saveSlot(${k})">${m?'覆盖保存':'保存到这里'}</button>`:''}${m?`<button style="flex:1" onclick="loadSlot(${auto2?"'auto'":k})">读取</button>`:''}${m&&!auto2?`<button class="dng" onclick="delSlot2(${k})">删除</button>`:''}</div></div>`;
  h2+=card(0,auto,true);for(let k=1;k<=NSLOT;k++){const r=await slotGet('slot'+k);h2+=card(k,r&&r.meta,false)}if($('#slots'))$('#slots').innerHTML=h2}
window.saveSlot=async k=>{if(!G)return;try{await slotPut('slot'+k,{meta:metaOf(),data:ser()});toast(`💾 已保存到存档 ${k}`)}catch(e){toast('保存失败：存储空间不足')}renderSlots()};
window.delSlot2=async k=>{await slotDel('slot'+k);toast('已删除');renderSlots()};
function applyLoaded(str){const g=JSON.parse(str);if(!g||!g.cities||!g.cos)throw new Error('bad');G=g;G.cities.forEach(c=>{c.dirty=true;c.gd=true;c.dens=null});MM=null;sel=null;selH=null;buildMode=null;
  G.cos.forEach(c=>{c.style=c.ai?(AI_DEF.find(a=>a.k===c.sk)||AI_DEF[0]):{price:1}});cache.city=-1;miniDirty=true}
function afterLoad(msg){closeModal();select(null);setBuild(null);boot();toast(msg||'📂 读档成功')}
window.loadSlot=async k=>{try{let str;if(k==='auto')str=localStorage.getItem(SKEY);else{const r=await slotGet('slot'+k);str=r&&r.data}if(!str){toast('存档为空');return}applyLoaded(str);afterLoad(`📂 已读取${k==='auto'?'自动存档':'存档 '+k}`)}catch(e){toast('读档失败：存档损坏或版本不兼容')}};
window.quickSave=()=>{save();renderSlots()};
window.exportSave=async mode=>{const str=ser();const name=`资本帝国_${G.cos[0].name}_${gameDateStr()}.json`;
  if(mode===0){try{const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;if(dl){await dl.save({filename:name,data:str});toast('⬇️ 存档文件已保存');return}}catch(e){toast('下载被取消或被拦截，可改用「复制存档代码」');return}
    try{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([str],{type:'application/json'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000);toast('⬇️ 已开始下载存档文件')}catch(e){toast('下载被拦截，请用「复制存档代码」')}}
  else{try{await navigator.clipboard.writeText(str);toast(`📋 已复制存档代码（${(str.length/1024).toFixed(0)} KB）`)}catch(e){const t2=$('#impTxt');if(t2){t2.value=str;t2.select();toast('无法直接复制，已放入下方文本框，请手动全选复制')}}}};
window.importFile=inp=>{const f2=inp.files&&inp.files[0];if(!f2)return;const r=new FileReader();r.onload=()=>{try{applyLoaded(r.result);afterLoad('📥 存档文件导入成功')}catch(e){toast('导入失败：不是有效的存档文件')}};r.readAsText(f2)};
window.importText=()=>{const v=($('#impTxt').value||'').trim();if(!v){toast('请先粘贴存档代码');return}try{applyLoaded(v);afterLoad('📥 存档代码导入成功')}catch(e){toast('导入失败：存档代码不完整或已损坏')}};
function save(){try{localStorage.setItem(SKEY,ser());localStorage.setItem(SKEY+'-meta',JSON.stringify(metaOf()));toast('💾 已快速存档（自动存档位）')}catch(e){toast('快速存档失败，请使用存档位')}}
function load(){try{const s=localStorage.getItem(SKEY);if(!s)return false;G=JSON.parse(s);G.cities.forEach(c=>{c.dirty=true;c.gd=true});MM=null;G.cos.forEach(c=>{c.style=c.ai?(AI_DEF.find(a=>a.k===c.sk)||AI_DEF[0]):{price:1}});return true}catch(e){return false}}
$('#btn-save').onclick=()=>{setTab='save';openWin('settings')};
const autoSave=()=>{if(G&&!G.over)try{localStorage.setItem(SKEY,ser());localStorage.setItem(SKEY+'-meta',JSON.stringify(metaOf()))}catch(e){}};
setInterval(autoSave,60000);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoSave()});addEventListener('pagehide',autoSave);
function gameOver(){G.over=true;setSpeed(0);$('#wnav').classList.add('hidden');$('#mt').textContent='💀 公司破产';$('#mb').innerHTML=`<p>连续 90 天资不抵债，${G.cos[0].name}宣告破产。</p><button class="pri" onclick="location.reload()">重新开始</button>`;$('#modal').classList.remove('hidden')}
const opt={ai:1,scn:'free',rename:{},macro:1,diff:1,perk:'sales',home:0,pkg:'retail',picks:['spark','aurora','hongyuan','yunfan','dingsheng','jinsui']};
function optBtns(sel,key,entries){$(sel).innerHTML=entries.map(([k,lab,sub])=>`<button data-k="${k}" class="${String(opt[key])===String(k)?'on':''}">${lab}${sub?`<small>${sub}</small>`:''}</button>`).join('');
  document.querySelectorAll(sel+' button').forEach(b=>b.onclick=()=>{opt[key]=typeof opt[key]==='number'?+b.dataset.k:b.dataset.k;optBtns(sel,key,entries)})}
optBtns('#pkg','pkg',Object.entries(PKGS).map(([k,v])=>[k,`${v.ic} ${v.n}`,v.d]));
optBtns('#perk','perk',Object.entries(PERKS).map(([k,v])=>[k,`${v.ic} ${v.n}`,v.d]));
optBtns('#scity','home',CITY_DEF.map((c,i)=>[i,c.n,`${c.tag} · 地价×${c.land}`]));
optBtns('#macroopt','macro',[[0.5,'🌤️ 平稳','宏观事件减半'],[1,'⛅ 正常','默认'],[2,'⛈️ 动荡','宏观事件翻倍']]);
optBtns('#scn','scn',Object.entries(SCN).map(([k,v])=>[k,`${v.ic} ${v.n}`]));
document.querySelector('#scn').addEventListener('click',()=>setTimeout(()=>{const sc=SCN[opt.scn];$('#scnd').textContent=sc.d+(sc.home!=null?`（剧本会覆盖起家方式、城市和资金）`:'')},0));
optBtns('#diff','diff',[[0,'轻松 ¥500万'],[1,'标准 ¥300万'],[2,'困难 ¥150万']]);
optBtns('#aiopt','ai',[[0,'😴 简单','对手资金少、扩张慢、定价笨'],[1,'🙂 普通','默认'],[2,'😈 困难','对手资金多、扩张快、研发强、定价精明']]);
function renderRivals(){$('#rivals').innerHTML=AI_DEF.map(a=>{const on=opt.picks.includes(a.k);return`<button data-k="${a.k}" class="rv ${on?'on':''}"><span style="font-size:17px">${a.av}</span> <b style="color:${on?'#fff':a.col}">${a.n}</b><small>${a.f} · ${a.style}</small><small>开局：${a.start.map(([t,p])=>t==='lab'||t==='net'?BT[t].n+'('+nm(p)+')':p?ic(p)+P[p].n:BT[t].n).join('、')}</small></button>`}).join('');
  $('#pickn').innerHTML=`已选 ${opt.picks.length}/${AI_DEF.length}，点击切换 · <a href="#" onclick="event.preventDefault();pickAll(1)" style="color:#7dd3fc">☑️ 全选</a> · <a href="#" onclick="event.preventDefault();pickAll(0)" style="color:#7dd3fc">↺ 恢复默认</a> · <a href="#" onclick="event.preventDefault();pickAll(2)" style="color:#7dd3fc">🎲 随机</a> · <a href="#" onclick="event.preventDefault();toggleRename()" style="color:#7dd3fc">✏️ 自定义对手名称</a>`;
  const re=$('#renbox');if(re&&!re.classList.contains('hidden'))re.innerHTML=`<div class="mu" style="font-size:12px;margin-bottom:6px">给已选的对手改公司名和创始人名（留空则用默认）：</div>`+opt.picks.map(k=>{const a=AI_DEF.find(x=>x.k===k),r=opt.rename[k]||{};return`<div class="row" style="gap:6px"><span style="width:26px">${a.av}</span><input type="text" placeholder="${a.n}" value="${r.n||''}" oninput="setRen('${k}','n',this.value)" style="flex:1;min-width:0"><input type="text" placeholder="${a.f}" value="${r.f||''}" oninput="setRen('${k}','f',this.value)" style="width:34%"></div>`}).join('');
  document.querySelectorAll('#rivals button').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(opt.picks.includes(k)){if(opt.picks.length>1)opt.picks=opt.picks.filter(x=>x!==k)}else opt.picks.push(k);renderRivals()})}
const DEF_PICKS=['spark','aurora','hongyuan','yunfan','dingsheng','jinsui'];
window.pickAll=m=>{if(m===1)opt.picks=AI_DEF.map(a=>a.k);else if(m===0)opt.picks=DEF_PICKS.slice();else{const n=4+Math.floor(rnd()*6);opt.picks=AI_DEF.map(a=>a.k).sort(()=>rnd()-0.5).slice(0,n)}renderRivals()};
window.toggleRename=()=>{$('#renbox').classList.toggle('hidden');renderRivals()};window.setRen=(k,f2,v)=>{(opt.rename[k]=opt.rename[k]||{})[f2]=v.trim()};
renderRivals();
function boot(){$('#start').classList.add('hidden');G.buff=G.buff||{};G.pend=G.pend||[];G.inbox=G.inbox||[];setTimeout(updBadge,60);MM=macroMods();setTimeout(layout,50);$('#cname').dataset.l='';centerCam();renderCities();spawnCars();setSpeed(1);topUI();renderGoal();$('#news').textContent=G.news[0]||'';
  const mine=G.b.filter(b=>b.o===0);if(mine.length){const b=mine[0];const [ix,iy]=iso(b.x+1,b.y+1);cam.x=VW/2-ix*cam.z;cam.y=VH/2-iy*cam.z;setTimeout(()=>{select(b);if(tutOn())toast('👉 点击你的建筑进行设置（选择产品、上架商品等）')},500)}
  else if(tutOn())setTimeout(()=>toast('👉 左侧选择建筑开始创业，比如「🏬 零售」里的便利店'),600)}
const rndCo=()=>pick(['星河','远航','鸿图','卓越','启明','腾跃','恒信','瑞丰'])+pick(['集团','控股','实业','商贸']);
const rndName=()=>pick(['李','张','刘','陈','杨','赵','周','吴'])+pick(['明','华','峰','磊','静','婷','宇','航']);
$('#btn-new').onclick=()=>{newGame({...opt,name:$('#in-name').value.trim()||rndCo(),founder:$('#in-founder').value.trim()||rndName()});boot()};
$('#btn-load').onclick=()=>{if(load()){boot();toast('已读取自动存档')}else toast('没有找到存档')};
$('#btn-slots').onclick=()=>{setTab='save';openWin('settings')};
try{if(!localStorage.getItem(SKEY))$('#btn-load').disabled=true}catch(e){$('#btn-load').disabled=true}
requestAnimationFrame(loop);
