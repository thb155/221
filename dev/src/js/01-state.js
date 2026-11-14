/* ================= 状态 ================= */
let G=null,speed=1,sel=null,buildMode=null,hover=null,acc=0;
let Q=1;try{const q=localStorage.getItem('cel-q');if(q!==null)Q=+q}catch(e){}
const cam={x:0,y:0,z:1};let cars=[],smoke=[],floats=[];
const CUR=()=>G.cities[G.cur];
function blankM(){return{rev:0,net:0,rent:0,dep:0,whole:0,purch:0,op:0,sal:0,logi:0,b2b:0,ad:0,int:0,tax:0}}
function newCompany(id,def,cash,ai){
  const c={id,name:def.n,founder:def.f,av:def.av||'😎',col:def.col,style:def,sk:def.k,cash,ai,loan:0,inv:{},brand:{},tech:{},rp:{},ad:{},monet:{},users:{},m:blankM(),months:[],nwHist:[],sent:1,dead:false,negDays:0,autoImport:true,maxStock:3000,acquired:0,perk:def.perk||null,home:def.home||0,ph:[]};
  ALLK.forEach(p=>{c.brand[p]=ai?5+rnd()*10:0;c.tech[p]=0;c.rp[p]=0;c.ad[p]=0;c.monet[p]=1;c.users[p]=0});
  PK.forEach(p=>c.inv[p]={q:0,ql:50});c.ci=CITY_DEF.map(()=>{const o={};PK.forEach(p=>o[p]={q:0,ql:50});return o});return c}
function genCity(def,ci){
  const N=W*H,t=new Array(N).fill(0),tree=new Array(N).fill(0),house=new Array(N).fill(null),I=(x,y)=>y*W+x;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){let w=0;
    if(def.map==='river'){const rx=Math.round(13+Math.sin(y/8)*4+y*0.15),d=Math.abs(x-rx);w=d<=1?1:d===2?4:0}
    else if(def.map==='coastE'){const e=W-9+Math.round(Math.sin(y/5)*1.5);w=x>e?1:x===e?4:0}
    else if(def.map==='delta'){const rx=Math.round(W*0.62+Math.sin(y/9)*3),d=Math.abs(x-rx),ry=Math.round(H*0.7+Math.sin(x/7)*2),d2=x<rx?Math.abs(y-ry):99;w=(d<=1||(d2<=0&&x>4))?1:(d===2||d2===1&&x>4)?4:0}
    else if(def.map==='lake'){const d=Math.hypot((x-W*0.3)/1.2,y-H*0.32);w=d<6?1:d<7?4:0}
    else if(def.map==='coastS'){const e=H-9+Math.round(Math.sin(x/5)*1.5);w=y>e?1:y===e?4:0}
    else{const d=Math.hypot(x-13,y-48);w=d<5?1:d<6?4:0}
    t[I(x,y)]=w}
  for(let y=2;y<H-2;y++)for(let x=2;x<W-2;x++)if(x%7===3||y%7===3){const i=I(x,y);if(t[i]===1){if(def.map==='river'||def.map==='delta')t[i]=5}else t[i]=2}
  const centers=[[W/2,H/2,def.r,1],[W*0.24,H*0.74,1.2,0.3],[W*0.76,H*0.24,1.2,0.3]];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=I(x,y);if(t[i]!==0)continue;
    const nearRoad=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const xx=x+a,yy=y+b;return xx>=0&&yy>=0&&xx<W&&yy<H&&t[I(xx,yy)]===2});
    let done=false;
    for(const [cx,cy,R,k] of centers){const d=Math.hypot(x-cx,y-cy),cf=Math.exp(-d/9);
      if(d<R&&rnd()<0.8){house[i]={h:Math.round(30+cf*150*k*(0.5+rnd())*def.r/5),c:Math.floor(rnd()*6),tower:true};done=true;break}
      if(d<R+3.5&&nearRoad&&rnd()<0.45){house[i]={h:Math.round(14+cf*50*rnd()),c:Math.floor(rnd()*6)};done=true;break}}
    if(!done&&Math.hypot(x-W/2,y-H/2)>def.r+4&&rnd()>0.76)tree[i]=1+Math.floor(rnd()*3)}
  const dmul={};FINAL.forEach(p=>dmul[p]=0.8+rnd()*0.4);
  const city={id:ci,seg:def.seg.slice(),n:def.n,pop:0,land:def.land,g:def.g,t,tree,house,occ:new Array(N).fill(-1),dmul,sales:{},avgP:{},dirty:true,gd:true,idx:1,trend:0.004,idxHist:[1],popHist:[]};
  ensureGrid(city);city.pop=city.dcap*0.95;city.popHist=[Math.round(city.pop)];return city;
}
function giveStart(c,list,ci){for(const [type,prod] of list){const city=G.cities[ci];const lot=findLot(city,BT[type].g==='retail'||isRentT(type));if(!lot)continue;
  const b=placeBuilding(c,type,ci,lot.x,lot.y,true);if(!b)continue;setupB(c,b,prod);if(prod&&P[prod]&&P[prod].tech)c.tech[prod]=Math.max(c.tech[prod],P[prod].tech)}}
const isRentT=t=>t==='apt'||t==='office';
const SCN={
 free:{n:'自由模式',ic:'🌐',d:'无时间限制，按目标清单自由发展'},
 sz:{n:'深圳渔村起家',ic:'🎣',d:'1990 年只带 ¥60 万来到深圳小渔村。2005 年底前净资产达到 ¥5000 万。',year:1990,home:2,cash:6e5,pkg:'cash0',deadline:2005,win:me=>netWorth(me)>=5e7,goal:'2005 年底前净资产 ¥5000 万'},
 soe:{n:'老国企改制',ic:'🏭',d:'接手北京一家濒临破产的老国企：3 座低效工厂、1 家门店、¥800 万银行债务。2000 年底前实现连续 12 个月盈利，且净资产超过 ¥3000 万。',year:1992,home:1,cash:1.2e6,loan:8e6,pkg:'soe',deadline:2000,win:me=>me.months.length>=12&&me.months.slice(-12).every(m=>m.profit>0)&&netWorth(me)>=3e7,goal:'2000 年底前连续 12 月盈利 + 净资产 ¥3000 万'},
 crisis:{n:'2008 金融危机抄底',ic:'💥',d:'2007 年手握 ¥3000 万现金。2008 年金融危机必然爆发。2012 年底前控股（≥51%）至少 2 家竞争对手。',year:2007,home:0,cash:3e7,pkg:'cash0',deadline:2012,force:[[14,'crisis']],win:me=>G.cos.filter(c=>c.ai&&!c.dead&&stake(0,c.id)>=0.51).length+me.acquired>=2,goal:'2012 年底前控股 2 家对手'},
 net:{n:'互联网创业',ic:'💻',d:'1998 年在成都车库创业，只有一家互联网公司和一个机房。2010 年底前互联网用户达到 30 万。',year:1998,home:3,cash:2e6,pkg:'tech2',deadline:2010,win:me=>usersOf(me)>=3e5,goal:'2010 年底前互联网用户 30 万'},
 pd:{n:'浦东地产大亨',ic:'🏙️',d:'1995 年浦东开发热潮，你带着 ¥1200 万和两块土地进入上海。2010 年底前持有的房地产总值达到 ¥2 亿，且净资产超过 ¥1.5 亿。',year:1995,home:0,cash:1.2e7,pkg:'re2',deadline:2010,force:[[30,'stimulus']],win:me=>reVal(me)>=2e8&&netWorth(me)>=1.5e8,goal:'2010 年底前房产 ¥2 亿 + 净资产 ¥1.5 亿'},
};
const PKG_EXTRA={re2:[['land'],['land'],['apt']],cash0:[],soe:[['factory','steel'],['factory','furniture'],['factory','toys'],['store']],tech2:[['net','portal'],['dc']]};
function scnCheck(){const sc=SCN[G.scn];if(!sc||!sc.win||G.scnDone)return;const me=G.cos[0],y=new Date(G.date).getUTCFullYear();
  if(sc.win(me)){G.scnDone='win';notify('goal',`🏆 剧本胜利：${sc.n}`,sc.goal,true);openScnEnd(true)}
  else if(y>sc.deadline){G.scnDone='lose';notify('goal',`剧本失败：${sc.n}`,'未在期限内达成目标，可继续自由游玩',true);openScnEnd(false)}
  for(const [m,k] of sc.force||[])if(G.day>=m*30&&!(G.scnF||{})[k]){(G.scnF=G.scnF||{})[k]=1;startMacro(k)}}
function openScnEnd(win){const sc=SCN[G.scn];setSpeed(0);curWin='scn';$('#modal').classList.remove('hidden');$('#wnav').classList.add('hidden');$('#mt').textContent=win?'🏆 剧本胜利':'⌛ 剧本结束';
  $('#mb').innerHTML=`<div style="text-align:center;padding:20px"><div style="font-size:54px">${win?'🏆':'⌛'}</div><h2>${sc.ic} ${sc.n}</h2><p>${win?'恭喜！你达成了目标：':'很遗憾，未能在期限内达成：'}${sc.goal}</p><p class="mu">用时 ${(G.day/365).toFixed(1)} 年 · 最终净资产 ${fmt(netWorth(G.cos[0]))}</p><button class="pri" onclick="closeModal();setSpeed(1)">继续自由经营</button> <button onclick="location.reload()">返回主菜单</button></div>`}
function newGame(o){const sc=SCN[o.scn||'free']||SCN.free;if(sc.home!=null)o.home=sc.home;window.__aiLv=o.ai??1;
  G={aiLv:o.ai??1,ver:4,scn:o.scn||'free',day:0,date:Date.UTC(sc.year||1990,0,1),qm:50,imp:{},cities:CITY_DEF.map(genCity),cur:o.home,b:[],nid:1,cos:[],hold:{},cost:{},goal:0,news:[],over:false,adopt:0,netU:{},auctions:[]};
  PK.forEach(p=>G.imp[p]=P[p].imp);
  const me=newCompany(0,{n:o.name,f:o.founder,av:'😎',col:PLAYER_COL,perk:o.perk,home:o.home},sc.cash??([5e6,3e6,1.5e6][o.diff]+(o.pkg==='cash'?8e5:0)),false);
  G.cos.push(me);giveStart(me,sc.pkg?PKG_EXTRA[sc.pkg]:PKGS[o.pkg].b,o.home);if(sc.loan)me.loan=sc.loan;if(sc.pkg==='soe')G.b.forEach(b=>{if(b.o===0){b.lv=2;b.dep=0.5}});
  if(sc.year&&sc.year>1990){G.qm=50+(sc.year-1990)*365*0.008;G.cities.forEach(c=>{const yrs=sc.year-1990;c.pop*=Math.pow(1+c.g,yrs*365*0.6);growCity(c,Math.round(yrs*4))});AI_DEF.length;}
  o.picks.map(k=>AI_DEF.find(a=>a.k===k)).forEach((a,i)=>{const c=newCompany(i+1,a,(2.2e6+rnd()*1e6)*AIK[o.ai??1].cash,true);const rn=(o.rename||{})[a.k];if(rn){if(rn.n)c.name=rn.n.slice(0,12);if(rn.f)c.founder=rn.f.slice(0,10)}c.home=(o.home+1+i)%CITY_DEF.length;G.cos.push(c);giveStart(c,a.start,c.home)});
  macroInit(o.macro);MM=macroMods();G.wars=[];G.own={};G.ownCost={};G.rel={};G.pacts=[];G.rep=60;G.inbox=[];G.pend=[];G.buff={};me.ex={};me.wage=1;me.b2b=true;me.b2bk=0.95;refreshTalent(true);me.m.cash0=me.cash;me.m.loan0=0;
  makeAuctions();
  addNews(`${o.founder} 创立 ${o.name}，总部设在${G.cities[o.home].n}。`);
  if(sc.year&&sc.year>1990)for(const c of G.cos)if(c.ai){c.cash*=1+(sc.year-1990)*0.25;for(const p of PK)c.tech[p]+=Math.floor((sc.year-1990)/4)}
  if(o.scn&&o.scn!=='free')setTimeout(()=>notify('goal',`${sc.ic} 剧本：${sc.n}`,sc.goal,true),900);
}

