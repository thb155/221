/* ===== 互联网细化：广告市场 · 变现渠道 · 平台策略 ===== */
// ad = 该产品收入中广告的占比；o = 其余收入来源
const NETX={portal:{ad:0.85,o:'增值服务（邮箱/会员）'},search:{ad:0.92,o:'企业服务（竞价工具）'},ecom:{ad:0.35,o:'交易佣金'},social:{ad:0.5,o:'游戏与会员'},video:{ad:0.6,o:'直播打赏与会员'}};
// 外部广告主行业：[名称, 图标, 1990 权重, 互联网普及后权重]
const EXT_ADV=[['快消日化','🧴',1,1],['汽车','🚗',0.5,1.3],['房地产','🏢',0.6,1.1],['金融保险','🏦',0.5,1.2],['游戏','🎮',0.1,1.5],['教育培训','📚',0.3,1.1],['本地生活','🍜',0.1,1.4],['医药保健','💊',0.5,0.8],['3C 数码','📱',0.3,1.2]];
const AD_BAN=[['全部接受','任何公司的广告都接'],['拒绝商战对手','正在与你商战/敌对的公司不能在你的平台投放'],['拒绝所有同行','货架上卖同类商品的公司都不能投放（份额高时有反垄断风险）']];
const adpOf=(c,k)=>{c.adp=c.adp||{};return c.adp[k]||(c.adp[k]={ban:c.ai?1:0,gray:c.ai&&c.id%4===1?1:0,self:1,take:0.05})};
const onlineShare=()=>clamp(0.04+0.66*(G.adopt||0),0.03,0.75);
const adMacro=()=>(MM.dem||1)*Math.sqrt(MM.sent||1);
function prodSets(){if(G._psd===G.day&&G._ps)return G._ps;const m={};for(const b of G.b)if(isRetail(b)){const s=m[b.o]||(m[b.o]=new Set());for(const sl of b.slots)s.add(sl.p)}G._ps=m;G._psd=G.day;return m}
const peersOf=(a,b)=>{const ps=prodSets(),A=ps[a],B=ps[b];if(!A||!B)return false;for(const p of A)if(B.has(p))return true;return false};
function adAccepts(owner,k,adv){if(owner.id===adv)return true;const p=adpOf(owner,k);if(p.ban>=1&&(atWar(owner.id,adv)||warH(owner.id,adv)>0))return false;if(p.ban>=2&&peersOf(owner.id,adv))return false;return true}
// 平台吸引力修正（佣金率、灰色广告）
const netAttr=(c,k)=>{const p=adpOf(c,k);return(k==='ecom'?Math.pow(p.take/0.05,-0.4):1)*(p.gray?0.93:1)};
const extW=()=>EXT_ADV.map(e=>e[2]+(e[3]-e[2])*(G.adopt||0));
function adBook(c){if(!c.adm)c.adm={byk:{},out:{},rej:0,trad:0,self:0};return c.adm}
function bookK(c,k){const m=adBook(c);return m.byk[k]||(m.byk[k]={ad:0,oth:0,gray:0,ext:{},co:{}})}

function netRevDay(alive){
  const sOn=onlineShare(),mac=adMacro(),plats=[];let invTot=0;
  for(const c of alive)for(const k of NK){if(c.tech[k]<1||c.users[k]<=0)continue;const base=c.users[k]*NET[k].arpu*c.monet[k],x=NETX[k],p=adpOf(c,k);
    const inv=base*x.ad*(1+0.025*Math.min(c.tech[k],20));// 技术越高投放越精准，广告位越值钱
    let oth=base*(1-x.ad);if(k==='ecom')oth*=p.take/0.05;
    plats.push({c,k,inv,oth,p,int:0,from:null});invTot+=inv}
  // 内部广告主：每家公司商品广告预算的线上部分
  let intTot=0;
  for(const a of alive){let A=0;for(const p of FINAL)A+=a.ad[p]||0;a._adEff=1;if(A<=0)continue;
    const on=A*Math.min(0.95,sOn*adChMul(a));if(a.id===0){const m=adBook(a);m.trad+=A-on}
    if(!plats.length){if(a.id===0)adBook(a).trad+=on;continue}
    const el=plats.filter(q=>adAccepts(q.c,q.k,a.id)&&adPref(a,q.c.id)>0),wq=q=>q.inv*adPref(a,q.c.id),tot=el.reduce((s,q)=>s+wq(q),0),reach=el.reduce((s,q)=>s+q.inv,0),selfB=el.reduce((s,q)=>s+(q.c.id===a.id&&q.p.self?q.inv:0),0),f=Math.min(1.5,(reach+selfB)/invTot);
    const so=Math.min(0.95,sOn*adChMul(a));a._adEff=(1-so)+so*(0.6+0.6*f);// 自家平台优先展示：自家广告位权重翻倍
    if(tot<=0){if(a.id===0)adBook(a).rej+=on;continue}
    for(const q of el){const v=on*wq(q)/tot;
      if(q.c.id===a.id){a.cash+=v;a.m.ad-=v;if(a.id===0)adBook(a).self+=v;continue}// 自家平台：集团内部结算，不花钱
      q.int+=v;(q.from||(q.from={}))[a.id]=(q.from[a.id]||0)+v;intTot+=v;if(a.id===0){const o=adBook(a).out;o[q.c.id]=(o[q.c.id]||0)+v}}}
  const ext=invTot*0.82*mac,W=extW(),Ws=W.reduce((s,x)=>s+x,0);let adTot=0;
  for(const q of plats){const c=q.c,k=q.k,e=invTot?q.inv/invTot*ext:0,gr=q.p.gray?q.inv*0.35*mac:0,ad=e+q.int+gr,r=ad+q.oth;
    c.cash+=r;c.m.net+=r;c.m.netAd=(c.m.netAd||0)+ad;adTot+=ad;q.ad=ad;
    if(c.id===0){const bk=bookK(c,k);bk.ad+=ad;bk.oth+=q.oth;bk.gray+=gr;EXT_ADV.forEach((x,i)=>bk.ext[x[0]]=(bk.ext[x[0]]||0)+e*W[i]/Ws);if(q.from)for(const id in q.from)bk.co[id]=(bk.co[id]||0)+q.from[id];
      const nb=G.b.filter(x=>x.o===0&&x.type==='net'&&x.prod===k);nb.forEach(x=>segAcc(x,'rev',r/nb.length))}}
  G.adm={inv:invTot,ext,int:intTot,tot:adTot,px:invTot?(ext+intTot)/invTot/0.82:1,sOn,plats:plats.map(q=>({id:q.c.id,k:q.k,ad:q.ad,oth:q.oth}))}}

function netAdMonth(){const me=G.cos[0];
  for(const c of G.cos){if(c.dead)continue;c.adl=c.adm||null;c.adm=null}
  for(const c of G.cos){if(c.dead)continue;for(const k of NK){if(c.tech[k]<1||c.users[k]<=0)continue;const p=adpOf(c,k),U=G.netU[k]||0,sh=U?c.users[k]/U:0,mrev=c.users[k]*NET[k].arpu*c.monet[k]*30;
    // 灰色广告翻车
    if(p.gray&&rnd()<0.06){const fine=Math.round(mrev*1.3);c.cash-=fine;c.m.op+=fine;c.users[k]*=0.88;c.brand[k]*=0.85;
      addNews(`🚨 虚假广告曝光：${c.name}「${NET[k].n}」投放的 P2P/保健品广告引发维权，罚款 ${fmt(fine)}，用户流失 12%`);
      if(c.id===0)notify('biz',`🚨 虚假广告被曝光：${NET[k].n}`,`罚款 ${fmt(fine)}，用户流失 12%，品牌受损。可在「互联网 → 平台策略」关闭灰色广告。`,true)}
    // 滥用市场支配地位
    if(sh>0.45&&(p.ban>=2||(p.self&&sh>0.55))&&rnd()<0.07){const fine=Math.round(mrev*1.0);c.cash-=fine;c.m.op+=fine;p.ban=Math.min(p.ban,1);p.self=0;
      addNews(`⚖️ 监管认定 ${c.name}「${NET[k].n}」滥用市场支配地位（排斥同行广告/自我优待），罚款 ${fmt(fine)} 并责令整改`);
      if(c.id===0)notify('biz',`⚖️ 反垄断：${NET[k].n} 被责令整改`,`份额 ${(sh*100).toFixed(0)}%，罚款 ${fmt(fine)}。广告准入已改回「拒绝商战对手」，「自家商品优先展示」已关闭。`,true)}}}
  // 大客户年框履约
  const B=G.buff||{};if(B.frameK&&B.frameUntil>G.day&&me.monet[B.frameK]<1.5){const pen=Math.round(B.frameAmt*0.6);me.cash-=pen;me.m.op+=pen;notify('biz','📄 年框违约',`你降低了「${NET[B.frameK].n}」的广告位密度，违反年框合同，赔付 ${fmt(pen)}`,true);delete B.frameK}
  if(B.grayRisk&&B.grayRisk<=G.day){const k=B.grayK;if(rnd()<0.35&&me.users[k]>0){const fine=Math.round(B.grayAmt*2);me.cash-=fine;me.m.op+=fine;me.users[k]*=0.85;me.brand[k]*=0.8;notify('biz','🚨 保健品广告大单翻车',`消费者集体投诉，罚款 ${fmt(fine)}，「${NET[k].n}」用户流失 15%`,true)}else notify('biz','保健品广告大单平稳结束','这次没出事，但下次就不一定了');delete B.grayRisk}
  // AI 平台：份额高且与你关系很差时，会把你列入“同行拒投”
  for(const c of G.cos){if(c.dead||!c.ai)continue;for(const k of NK){if(c.tech[k]<1)continue;const p=adpOf(c,k),U=G.netU[k]||0,sh=U?c.users[k]/U:0;
    const want=(sh>0.35&&relOf(c.id,0)<-40)?2:1;if(want!==p.ban&&rnd()<0.3){p.ban=want;if(want===2&&G.cos[0].tech&&FINAL.some(x=>G.cos[0].ad[x]>0))notify('war',`📵 ${c.name} 的「${NET[k].n}」拒绝你的广告`,`对方以“同业竞争”为由拒绝你投放，你的广告效率下降。改善关系或自建平台可以破局。`,true)}}}}

// 互联网相关的决策事件
Object.assign(DEC,{
  adFrame:{t:'大客户来谈年框',need:me=>NK.some(k=>me.users[k]>1e5),f:me=>{const k=NK.filter(x=>me.users[x]>1e5).sort((a,b)=>me.users[b]*NET[b].arpu-me.users[a]*NET[a].arpu)[0],e=pick(EXT_ADV.slice(1,5)),amt=Math.round(me.users[k]*NET[k].arpu*NETX[k].ad*60/1e4)*1e4;
    return{body:`${e[1]} 一家头部${e[0]}品牌想在你的「${NET[k].n}」签一年广告框架合同，预付 ${fmt(amt)}。条件：一年内该产品的广告位密度保持「高」，否则赔付六成。`,opts:[['签约（预付 '+fmt(amt)+'）',()=>{me.cash+=amt;me.m.net+=amt;me.m.netAd=(me.m.netAd||0)+amt;me.monet[k]=1.6;Object.assign(G.buff,{frameK:k,frameUntil:G.day+365,frameAmt:amt});notify('biz','📄 年框已签',`「${NET[k].n}」广告位密度已调为「高」，保持一年`)}],['婉拒',()=>{}]]}}},
  adGray:{t:'保健品广告大单',need:me=>NK.some(k=>me.users[k]>5e4),f:me=>{const k=NK.filter(x=>me.users[x]>5e4).sort((a,b)=>me.users[b]-me.users[a])[0],amt=Math.round(me.users[k]*NET[k].arpu*90/1e4)*1e4;
    return{body:`一家“神奇保健品”厂商出三倍价格，想在你的「${NET[k].n}」投放半年广告，一次性支付 ${fmt(amt)}。半年后有约 35% 概率被曝光：罚款两倍、用户流失 15%。`,opts:[['接单 '+fmt(amt),()=>{me.cash+=amt;me.m.net+=amt;me.m.netAd=(me.m.netAd||0)+amt;Object.assign(G.buff,{grayRisk:G.day+180,grayK:k,grayAmt:amt})}],['拒绝',()=>{me.brand[k]=Math.min(100,me.brand[k]+3);notify('biz','你拒绝了保健品大单','用户口碑小幅上升')}]]}}},
  adRival:{t:'对手想买你的广告位',need:me=>NK.some(k=>me.users[k]>5e4)&&G.cos.some(c=>c.ai&&!c.dead&&(atWar(0,c.id)||warH(0,c.id)>0)),f:me=>{const r=pick(G.cos.filter(c=>c.ai&&!c.dead&&(atWar(0,c.id)||warH(0,c.id)>0))),k=NK.filter(x=>me.users[x]>5e4).sort((a,b)=>me.users[b]-me.users[a])[0],amt=Math.round(clamp(r.cash*0.04,2e5,2e7)/1e4)*1e4;
    return{body:`${r.av} 正在与你商战的「${r.name}」想在你的「${NET[k].n}」包下一轮大促广告，出价 ${fmt(amt)}。接单能赚钱，但会帮对手把品牌推高。`,opts:[['接单 '+fmt(amt),()=>{if(r.cash<amt){toast('对方资金不足，撤单了');return}r.cash-=amt;me.cash+=amt;me.m.net+=amt;me.m.netAd=(me.m.netAd||0)+amt;for(const p of FINAL)if(r.ad[p]>0)r.brand[p]=Math.min(100,r.brand[p]+6);addRel(0,r.id,8)}],['拒绝',()=>{addRel(0,r.id,-5);notify('war','你拒绝了对手的广告',`${r.name}的大促声量受挫`)}]]}}}});

/* ===== AI 广告策略：七种打法 + 渠道偏好 + 动态调整 ===== */
const AD_STRAT={
  ratio:{n:'比例稳投',ic:'📏',d:'按各商品销售额，固定拿收入的一定比例投广告'},
  blitz:{n:'品牌轰炸',ic:'💣',d:'重金砸向一两款高毛利旗舰商品，品牌落后时加码'},
  launch:{n:'新品冲量',ic:'🚀',d:'新上架、品牌落后的商品拿大头预算，抢认知'},
  sniper:{n:'竞争狙击',ic:'🎯',d:'盯住领先对手的广告投入跟投加码，商战时火力翻倍'},
  counter:{n:'逆周期',ic:'🔄',d:'经济差、广告便宜时加大投放，繁荣时收缩'},
  frugal:{n:'节俭维持',ic:'🪙',d:'几乎不打广告，只在品牌快掉光时补一点，把钱省下来打价格'},
  pulse:{n:'大促脉冲',ic:'🎉',d:'平时少投，双十一、年货节、618 前集中爆发'}};
const AD_CH={online:{n:'线上派',m:1.5},neutral:{n:'均衡',m:1},trad:{n:'传统媒体派',m:0.6}};
const AD_MAP={spark:['sniper','online'],aurora:['blitz','neutral'],hongyuan:['frugal','trad'],yunfan:['launch','online'],dingsheng:['ratio','trad'],jinsui:['counter','trad'],jinxiu:['blitz','neutral'],panshi:['frugal','trad'],lanhai:['counter','neutral'],qinghe:['pulse','trad'],quantum:['launch','online'],lexiang:['launch','online'],dongfang:['pulse','trad'],kangning:['ratio','neutral'],tianmi:['blitz','neutral']};
function adStratOf(c){if(!c.adS){const m=!c.entrant&&AD_MAP[c.sk];c.adS=m?m[0]:pick(Object.keys(AD_STRAT));c.adCh=m?m[1]:pick(['online','neutral','neutral','trad'])}return c.adS}
const adChMul=c=>c.ai?(AD_CH[c.adCh]||AD_CH.neutral).m:1;
// 广告主对平台的偏好：AI 不给商战对手送钱（抵制），更愿意投给同一股权联盟/控股方的平台
const adPref=(a,owner)=>{if(a.id===owner)return 1;if(a.ai&&(atWar(a.id,owner)||warH(a.id,owner)>0))return 0;return(GRP[a.id]!=null&&GRP[a.id]===GRP[owner])||stake(owner,a.id)>=0.51||stake(a.id,owner)>=0.51?2:1};
const PULSE=[2.5,1.2,0.5,0.5,0.6,2,0.6,0.5,0.6,0.8,3,2.5];// 1 月年货节 … 6 月 618 … 11 月双十一
function aiAdPlan(c){const s=adStratOf(c),lm=c.months[c.months.length-1],rev=lm?lm.rev:0,dk=[0.7,1,1.3][(G.aiLv??1)];
  const sv={},mg={};let tot=0;c.adFirst=c.adFirst||{};
  for(const b of G.b)if(b.o===c.id&&isRetail(b))for(const sl of b.slots){const v=(sl.sold||0)*sl.price;sv[sl.p]=(sv[sl.p]||0)+v;mg[sl.p]=(mg[sl.p]||0)+(sl.sold||0)*Math.max(0,sl.price-G.imp[sl.p]);tot+=v;if(c.adFirst[sl.p]==null)c.adFirst[sl.p]=G.day}
  const ps=Object.keys(sv);for(const p of FINAL)c.ad[p]=0;if(!ps.length||rev<=0){c.adMo=0;return}
  const rivalB=p=>{let m=0;for(const x of G.cos)if(x.id!==c.id&&!x.dead)m=Math.max(m,x.brand[p]||0);return m};
  const enemy=G.cos.filter(x=>!x.dead&&x.id!==c.id&&(atWar(c.id,x.id)||warH(c.id,x.id)>0));
  let bud=0,w={};
  if(s==='ratio'){bud=rev*0.025;w=sv}
  else if(s==='blitz'){const top=ps.slice().sort((a,b)=>mg[b]-mg[a]).slice(0,2);bud=rev*0.06*(top.some(p=>rivalB(p)>c.brand[p])?1.3:1);for(const p of ps)w[p]=sv[p]/tot*0.3+(top.includes(p)?0.7/top.length:0)}
  else if(s==='launch'){bud=rev*0.035;const avg=tot/ps.length;for(const p of ps){const isNew=G.day-c.adFirst[p]<150,gap=Math.max(0,rivalB(p)-c.brand[p]);w[p]=(sv[p]+(isNew?avg*2:0))*(1+gap/50)}}
  else if(s==='sniper'){for(const p of ps){let m=0,war=false;for(const x of G.cos){if(x.dead||x.id===c.id)continue;const a=(x.ad[p]||0)*30;if(a>m)m=a;if(a>0&&enemy.includes(x))war=true}const t=Math.max(sv[p]*0.01,m*1.2*(war?1.5:1));w[p]=t;bud+=t}bud=Math.min(bud,rev*0.07);}
  else if(s==='counter'){const cyc=MM.dem<0.97?1.9:MM.dem>1.05?0.6:1,px=(G.adm&&G.adm.px)||1;bud=rev*0.025*cyc*(px<1?1.2:1);w=sv}
  else if(s==='frugal'){for(const p of ps)if(c.brand[p]<25)w[p]=sv[p];bud=Object.keys(w).length?rev*0.008:0}
  else if(s==='pulse'){const m=new Date(G.date).getUTCMonth();bud=rev*0.02*PULSE[m];w=sv}
  // 商战：所有打法都在与敌人重叠的商品上加码 30%
  if(enemy.length)for(const p of ps)if(w[p]&&G.b.some(b=>isRetail(b)&&enemy.some(e=>e.id===b.o)&&b.slots.some(x=>x.p===p)))w[p]*=1.3;
  bud*=dk;if(c.cash<0)bud*=0.15;else if(c.cash<bud*3)bud*=0.5;
  const wt=Object.values(w).reduce((a,b)=>a+b,0);for(const p of ps)c.ad[p]=wt>0&&w[p]?Math.round(bud*w[p]/wt/30/100)*100:0;
  c.adMo=FINAL.reduce((a,p)=>a+c.ad[p],0)*30;c.adTop=ps.filter(p=>c.ad[p]>0).sort((a,b)=>c.ad[b]-c.ad[a]).slice(0,3)}
// 每年复盘：业绩下滑就换打法
function aiAdReview(c){const ms=c.months;if(ms.length<24||G.day%365>31)return;const y1=ms.slice(-12).reduce((a,m)=>a+m.rev,0),y0=ms.slice(-24,-12).reduce((a,m)=>a+m.rev,0),s=adStratOf(c);
  if(y0>0&&y1<y0*0.85&&rnd()<0.4){const opts=Object.keys(AD_STRAT).filter(k=>k!==s&&k!=='frugal'),n=pick(opts);c.adS=n;addNews(`📣 ${c.name} 营收下滑 ${((1-y1/y0)*100).toFixed(0)}%，广告策略由「${AD_STRAT[s].n}」改为「${AD_STRAT[n].n}」`)}
  else if(s!=='frugal'&&c.cash<0&&rnd()<0.3){c.adS0=s;c.adS='frugal';addNews(`📣 ${c.name} 现金吃紧，广告策略收缩为「节俭维持」`)}
  else if(s==='frugal'&&c.adS0&&c.cash>y1/12){c.adS=c.adS0;delete c.adS0;addNews(`📣 ${c.name} 资金回暖，恢复「${AD_STRAT[c.adS].n}」广告打法`)}}
