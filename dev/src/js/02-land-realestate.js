/* ================= 地块 / 地产 ================= */
const idx=(x,y)=>y*W+x;
function lotOk(city,x,y){for(let a=0;a<2;a++)for(let b=0;b<2;b++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=W||yy>=H)return false;const i=idx(xx,yy);
  if(!(city.t[i]===0||city.t[i]===4)||city.house[i]||city.occ[i]>=0)return false}return true}
const centerF=(x,y)=>Math.exp(-Math.hypot(x+1-W/2,y+1-H/2)/14);
const hcap=h=>h.tower?h.h*12:60;
function ensureGrid(city){if(city.dens&&!city.gd)return;const N=W*H,dens=new Float32Array(N),resd=new Float32Array(N);let dcap=0;
  const add=(x0,y0,m,p)=>{for(let dy=-6;dy<=6;dy++)for(let dx=-6;dx<=6;dx++){const x=x0+dx,y=y0+dy;if(x<0||y<0||x>=W||y>=H)continue;const d2=dx*dx+dy*dy;if(d2>36)continue;const i=y*W+x;if(d2<=16)dens[i]+=m;resd[i]+=p}};
  for(let i=0;i<N;i++){const h=city.house[i];if(!h)continue;const c=hcap(h);dcap+=c;add(i%W,(i/W)|0,h.tower?h.h/40:0.4,c)}
  for(const b of (G&&G.b)||[]){if(b.c!==city.id)continue;add(b.x+1,b.y+1,isRent(b)?3+b.lv:b.type==='land'?0:1.5+0.5*b.lv,b.type==='apt'?units(b)*(b.occ||0)*25:0)}
  for(let i=0;i<N;i++){dens[i]=Math.min(1.5,dens[i]/30);resd[i]=Math.min(1.5,resd[i]/15000)}
  city.dens=dens;city.resd=resd;city.dcap=dcap;city.gd=false}
const gAt=(city,arr,x,y)=>{ensureGrid(city);return city[arr][clamp(Math.round(y),0,H-1)*W+clamp(Math.round(x),0,W-1)]};
const landPrice=(city,x,y)=>Math.round(30000*city.land*city.idx*(0.6+3*centerF(x,y)+3*gAt(city,'dens',x+1,y+1))*4/1000)*1000;
const traffic=(city,x,y)=>0.3+0.6*centerF(x,y)+1.1*Math.min(1.3,gAt(city,'resd',x+1,y+1));
const demoCost=(city,i)=>{const h=city.house[i];if(!h)return 0;return Math.round((hcap(h)*600*city.land*Math.sqrt(city.idx)+landPrice(city,(i%W)-1,((i/W)|0)-1)*0.15)/1000)*1000};
function lotDemo(city,x,y){let cost=0;const hs=[];for(let a=0;a<2;a++)for(let b=0;b<2;b++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=W||yy>=H)return null;const i=yy*W+xx;
  if(!(city.t[i]===0||city.t[i]===4)||city.occ[i]>=0)return null;if(city.house[i]){hs.push(i);cost+=demoCost(city,i)}}return{hs,cost}}
function demolish(city,i,c){const h=city.house[i];if(!h)return;city.pop=Math.max(1000,city.pop-hcap(h)*0.6);city.house[i]=null;city.dirty=true;city.gd=true;if(c)c.demo=(c.demo||0)+1}
const refNow=p=>P[p].ref*Math.pow(G.imp[p]/P[p].imp,0.7);
function growCity(city,n){let added=0;const hs=[];for(let i=0;i<W*H;i++)if(city.house[i])hs.push(i);if(!hs.length)return 0;
  for(let k=0;k<n;k++)for(let tr=0;tr<60;tr++){const s0=pick(hs),x=s0%W+Math.round((rnd()-0.5)*5),y=((s0/W)|0)+Math.round((rnd()-0.5)*5);
    if(x<0||y<0||x>=W||y>=H)continue;const i=y*W+x;if(city.t[i]!==0||city.house[i]||city.occ[i]>=0)continue;const cf=Math.exp(-Math.hypot(x-W/2,y-H/2)/9);
    city.house[i]=cf>0.35&&rnd()<0.75?{h:Math.round(30+cf*130*(0.5+rnd())),c:Math.floor(rnd()*6),tower:true}:{h:Math.round(14+cf*40*rnd()),c:Math.floor(rnd()*6)};city.tree[i]=0;hs.push(i);added++;break}
  for(let k=0;k<2;k++){const i=pick(hs),h=city.house[i];if(h.tower&&h.h<230)h.h+=12}
  if(added){city.dirty=true;city.gd=true}return added}
function findLot(city,central){let best=null,bs=-1,found=0;
  const hs=[];if(central)for(let i=0;i<W*H;i++)if(city.house[i]&&centerF(i%W,(i/W)|0)>0.3)hs.push(i);
  for(let n=0;n<800&&found<(central?40:1);n++){let x,y;if(central&&hs.length&&n%3){const i=pick(hs);x=i%W+Math.round((rnd()-0.5)*9);y=((i/W)|0)+Math.round((rnd()-0.5)*9)}else{x=Math.floor(rnd()*(W-2));y=Math.floor(rnd()*(H-2))}if(!lotOk(city,x,y))continue;found++;
    if(!central)return{x,y};const sc=traffic(city,x,y)*(0.6+0.8*rnd());if(sc>bs){bs=sc;best={x,y}}}return best}
const SECT={logi:{n:'物流',ic:'📦'},retail:{n:'零售',ic:'🏬'},res:{n:'资源',ic:'⛏️'},mfg:{n:'制造',ic:'🏭'},rd:{n:'研发',ic:'🔬'},net:{n:'互联网',ic:'🌐'},re:{n:'地产',ic:'🏠'}};
const sectOf=t=>t==='wh'?'logi':BT[t].g==='retail'?'retail':(t==='farm'||t==='forest'||t==='mine')?'res':t==='factory'?'mfg':t==='lab'?'rd':(t==='net'||t==='dc')?'net':'re';
const shortN=c=>(c.name.replace(/集团|公司|有限|控股|股份/g,'')||c.name).slice(0,4);
function ensureSub(c,b,force){c.subs=c.subs||[];if(b.sub&&!force&&c.subs.some(s2=>s2.id===b.sub))return;const sc=sectOf(b.type),id='d_'+sc;
  if(!c.subs.some(s2=>s2.id===id))c.subs.push({id,name:shortN(c)+SECT[sc].n,ic:SECT[sc].ic,sect:sc});b.sub=id}
const segAcc=(b,k,v)=>{if(b.o!==0)return;const pm=b.pm||(b.pm={rev:0,cogs:0,op:0});pm[k]+=v};
function subMonth(c,label,m){c.subHist=c.subHist||{};const tot={};for(const s2 of c.subs||[])tot[s2.id]={rev:0,cogs:0,op:0,n:0};
  for(const b of G.b){if(b.o!==c.id)continue;ensureSub(c,b);const t=tot[b.sub]||(tot[b.sub]={rev:0,cogs:0,op:0,n:0});const pm=b.pm||{rev:0,cogs:0,op:0};t.rev+=pm.rev;t.cogs+=pm.cogs;t.op+=pm.op;t.n++;b.lm=pm;b.pm={rev:0,cogs:0,op:0}}
  let seg=0;for(const id in tot){const t=tot[id];t.profit=t.rev-t.cogs-t.op;t.label=label;seg+=t.profit;(c.subHist[id]=c.subHist[id]||[]).push(t);if(c.subHist[id].length>36)c.subHist[id].shift()}
  (c.subHist._hq=c.subHist._hq||[]).push({label,profit:m.profit-seg});if(c.subHist._hq.length>36)c.subHist._hq.shift()}
function placeBuilding(c,type,ci,x,y,free,landPaid){const city=G.cities[ci];const lp=landPrice(city,x,y);const cost=BT[type].cost+(landPaid?0:lp);
  if(!free){if(c.cash<cost)return null;c.cash-=cost}
  const b={id:G.nid++,bt:G.day,type,c:ci,x,y,o:c.id,lv:1,prod:null,slots:[],hist:[],out:0,bc:BT[type].cost,dep:0.85,paid:BT[type].cost+lp};G.b.push(b);
  for(let a=0;a<2;a++)for(let k=0;k<2;k++){const i=idx(x+a,y+k);city.occ[i]=b.id;city.tree[i]=0}
  if(isRent(b)){b.rent=Math.round(refRent(b));b.occ=0.3}
  if(c.id===0)ensureSub(c,b);
  city.dirty=true;city.gd=true;return b}
function setupB(c,b,prod){if(isRetail(b)){b.slots=[];if(c.ai)aiFillSlots(c,b)}else if(prod)b.prod=prod;if(isRent(b)&&c.ai)b.rent=Math.round(refRent(b)*c.style.price)}
function removeBuilding(b){const city=G.cities[b.c];for(let a=0;a<2;a++)for(let k=0;k<2;k++)city.occ[idx(b.x+a,b.y+k)]=-1;G.b=G.b.filter(z=>z!==b);city.dirty=true;city.gd=true}
const bById=id=>G.b.find(b=>b.id===id);
const landOf=b=>landPrice(G.cities[b.c],b.x,b.y);
const bval=b=>b.bc*b.dep+landOf(b);
const sellVal=b=>isRE(b)?bval(b)*0.95:b.bc*b.dep*0.7+landOf(b)*0.95;
const units=b=>(b.type==='apt'?80:50)*lvMul(b.lv);
function refRent(b){const city=G.cities[b.c],cf=centerF(b.x,b.y),s=Math.sqrt(city.idx);return b.type==='apt'?22*city.land*(0.5+1.5*cf)*s:55*city.land*(0.4+1.6*cf)*s}
const opCost=b=>b.type==='land'?landOf(b)*0.00004:BT[b.type].op*opMul(b.lv);
const capOf=c=>G.b.reduce((s,b)=>s+(b.o===c.id&&b.type==='dc'?50000*lvMul(b.lv):0),0);
const usersOf=c=>NK.reduce((s,k)=>s+c.users[k],0);
const yearNow=()=>{const d=new Date(G.date);return d.getUTCFullYear()+d.getUTCMonth()/12};
function makeAuctions(){G.auctions=G.auctions.filter(a=>a.exp>G.day&&lotOk(G.cities[a.c],a.x,a.y));
  while(G.auctions.length<Math.max(4,G.cities.length)){const ci=Math.floor(rnd()*G.cities.length),city=G.cities[ci],lot=findLot(city,rnd()<0.6);if(!lot)break;G.auctions.push({c:ci,x:lot.x,y:lot.y,k:0.7+rnd()*0.45,exp:G.day+60+Math.floor(rnd()*60)})}}

