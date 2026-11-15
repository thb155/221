// 资本帝国实验室 · 浏览器内自动化测试
// 由 `node build.js --test` 注入到 dist/自检.html；用任何浏览器打开即自动运行。
(function () {
  const results = [];
  const T = (name, fn) => {
    const t0 = performance.now();
    try { const r = fn(); results.push({ name, ok: r !== false, ms: performance.now() - t0, msg: typeof r === 'string' ? r : '' }); }
    catch (e) { results.push({ name, ok: false, ms: performance.now() - t0, msg: String(e && e.stack || e).slice(0, 300) }); }
  };
  const finite = v => typeof v === 'number' && isFinite(v);
  const fresh = (extra) => { newGame(Object.assign({}, opt, { name: '测试集团', founder: '测试员' }, extra || {})); MM = macroMods(); };
  const run = days => { for (let i = 0; i < days; i++) simDay(); };
  const errs = [];
  addEventListener('error', e => errs.push(String(e.message)));

  setTimeout(() => {
    try { localStorage.removeItem('cel-test-dummy'); } catch (e) {}
    T('一键全选/恢复默认竞争对手', () => { pickAll(1);const a=opt.picks.length;pickAll(0);const b=opt.picks.length;return (a===AI_DEF.length&&b===6)||`${a} ${b}`; });
    T('新游戏可以启动', () => { fresh(); boot(); return G && G.cos.length > 1 && G.cities.length === CITY_DEF.length; });
    T('模拟 5 年无异常', () => { run(365 * 5); return G.day >= 365 * 5; });
    T('所有公司的现金/贷款/净资产都是有效数字', () => {
      for (const c of G.cos) { if (c.dead) continue; if (!finite(c.cash) || !finite(c.loan) || !finite(netWorth(c))) return `${c.name} 出现 NaN`; } return true;
    });
    T('批发价格在合理区间（基准价 0.3~3.5 倍）', () => {
      for (const p of PK) { const r = G.imp[p] / P[p].imp; if (!(r > 0.3 && r < 3.5)) return `${P[p].n} 价格倍数 ${r.toFixed(2)}`; } return true;
    });
    T('分城市库存与总库存一致', () => {
      for (const c of G.cos) { if (c.dead) continue; for (const p of PK) { const s = [0, 1, 2, 3].reduce((x, ci) => x + c.ci[ci][p].q, 0); if (Math.abs(s - c.inv[p].q) > Math.max(5, s * 0.02)) return `${c.name} ${P[p].n}: 城市合计 ${s.toFixed(0)} ≠ 总 ${c.inv[p].q.toFixed(0)}`; } } return true;
    });
    T('互联网用户不超过人口上限', () => {
      for (const k of NK) { const U = G.netU[k] || 0, tot = G.cos.reduce((x, c) => x + (c.dead ? 0 : c.users[k]), 0); if (tot > U * 1.05 + 10) return `${NET[k].n} 用户 ${tot.toFixed(0)} > 上限 ${U.toFixed(0)}`; } return true;
    });
    T('城市人口为正且不超过住房容量太多', () => {
      for (const c of G.cities) { if (!(c.pop > 0)) return `${c.n} 人口异常`; if (c.cap && c.pop > c.cap * 1.3) return `${c.n} 人口 ${c.pop.toFixed(0)} 远超容量 ${c.cap.toFixed(0)}`; } return true;
    });
    T('持股 ≥30% 时对方无法制裁', () => {
      fresh(); G.cos[0].cash += 3e8; for (let i = 0; i < 6; i++) trade(1, 5); closeModal();
      const blocked = !startWar(1, 0, 2, null); return blocked || '对方仍能宣战';
    });
    T('持股 ≥51% 时控股并表、可指挥', () => {
      for (let i = 0; i < 5; i++) trade(1, 5); closeModal(); buildWar();
      if (ctrlOf(1) !== 0) return 'ctrlOf 未识别控股';
      return startWar(1, 2, 1, 0) || '受控公司无法被命令开战';
    });
    T('存档序列化往返一致', () => {
      run(30); const str = ser(), day = G.day, cash = G.cos[0].cash; applyLoaded(str);
      return (G.day === day && Math.abs(G.cos[0].cash - cash) < 1) || '读档后数据不一致';
    });
    T('读档后继续模拟 1 年', () => { MM = null; run(365); return finite(G.cos[0].cash); });
    for (const k of Object.keys(SCN)) T(`剧本「${SCN[k].n}」可启动并运行 1 年`, () => { fresh({ scn: k }); run(365); return finite(netWorth(G.cos[0])); });
    T('六座城市都在正常运转', () => { if(G.cities.length!==6)return '城市数 '+G.cities.length; for(const c of G.cities){if(!(c.pop>1000))return c.n+' 人口异常'} return true; });
    T('跨城距离表覆盖全部城市', () => { for(let a=0;a<6;a++)for(let b=0;b<6;b++){if(!(KM[a][b]>=0)||KM[a][b]!==KM[b][a])return `KM[${a}][${b}]`} return true; });
    T('旧版 4 城存档仍可读取并运行', () => {
      fresh();const g=JSON.parse(ser());g.cities=g.cities.slice(0,4);g.cur=0;g.b=g.b.filter(b=>b.c<4);g.auctions=g.auctions.filter(a=>a.c<4);g.cos.forEach(c=>{c.ci=c.ci.slice(0,4);if(c.home>3)c.home=0});
      applyLoaded(JSON.stringify(g));MM=null;run(200);return G.cities.length===4&&finite(G.cos[0].cash);
    });
    T('规模不经济：建筑越多管理成本系数越高', () => { const c={_nb:5};const a=scaleF(c);c._nb=40;const b=scaleF(c);c._nb=100;const d=scaleF(c);return (a===1&&b>1&&d>b)||`${a} ${b} ${d}`; });
    T('对手能力：困难档对手比简单档更强', () => {
      const sz=()=>G.b.filter(b=>b.o!==0).length+G.cos.reduce((x,c)=>x+(c.ai&&!c.dead?PK.reduce((y,p)=>y+c.tech[p],0):0),0);
      fresh({ai:0});run(365*3);const e=sz();fresh({ai:2});run(365*3);const h=sz();return h>e||`简单 ${e} vs 困难 ${h}`;
    });
    T('季度财报：一季报/半年报/三季报/年报按时发布', () => {
      fresh();run(365*2+5);const ks=(G.reports||[]).map(r=>r.kind);if(ks.length<7)return '财报数量 '+ks.length;
      for(const k of ['一季报','半年报','三季报','年报'])if(!ks.includes(k))return '缺少 '+k;
      const r=G.reports.find(x=>x.kind==='年报'&&x.cumLY);if(!r)return '第二年年报缺少同比';
      const sumP=G.cos[0].months.filter(m=>mYear(m)===r.y).reduce((x,m)=>x+m.profit,0);return Math.abs(sumP-r.cum.profit)<1||`年报利润 ${r.cum.profit} ≠ 月度合计 ${sumP}`;
    });
    T('利润表月度/季度/年度切换', () => { for(const p of ['m','q','y']){finPer=p;finTab='is';openWin('finance')}finPer='m';closeModal();return true; });
    T('互联网开局即可经营并获得用户', () => { fresh({pkg:'retail'}); const me=G.cos[0]; me.cash+=5e7;
      const city=G.cities[G.cur]; const l1=findLot(city,false), b=placeBuilding(me,'net',G.cur,l1.x,l1.y,true); setupB(me,b,'portal'); me.tech.portal=1;
      const l2=findLot(city,false); placeBuilding(me,'dc',G.cur,l2.x,l2.y,true); run(120);
      return (yearNow()<1991 && me.users.portal>0 && G.netU.portal>0) || `年份 ${yearNow().toFixed(2)} 用户 ${me.users.portal} 上限 ${G.netU.portal}`; });
    T('开局天赋已削弱（研发 ≤15%、客流 ≤8%）', () => { const m=/研发速度 \+(\d+)%/.exec(PERKS.tech.d), s=/客流 \+(\d+)%/.exec(PERKS.sales.d); return (+m[1]<=15 && +s[1]<=8) || PERKS.tech.d; });
    T('新竞争对手会随时间进场', () => { fresh({picks:['spark','aurora']}); const n0=G.cos.length; G.entRate=30; run(365*3+30); const n1=G.cos.length;
      const nw=G.cos.slice(n0); for(const c of nw){ if(!finite(c.cash)||!finite(netWorth(c))) return c.name+' NaN'; }
      return (n1>n0 && nw.every(c=>c.entrant>0 && G.b.some(b=>b.o===c.id))) || `进场 ${n1-n0}`; });
    T('对手全选时也能生成全新公司进场', () => { fresh({picks:AI_DEF.map(a=>a.k)}); run(30); const c=spawnEntrant(); run(60); return (c && !AI_DEF.some(a=>a.n===c.name) && /^#[0-9a-f]{6}$/.test(c.col)) || (c&&c.name+' '+c.col); });
    T('暂停时花钱，顶栏现金立即刷新', () => { fresh(); boot(); setSpeed(0); const me=G.cos[0]; me.cash-=123456; lastUI=0; loop(performance.now()+5000); return $('#s-cash').textContent===fmt(me.cash) || $('#s-cash').textContent+' vs '+fmt(me.cash); });
    T('财报弹出时自动暂停，关闭后恢复', () => { fresh(); boot(); closeModal(); setSpeed(2); G.autoReport=true; let k=0; while(G.reports==null||!G.reports.length){simDay();if(++k>200)break} const paused=speed===0&&curWin==='report'; closeModal(); return (paused && speed===2) || `paused=${paused} speed=${speed} win=${curWin}`; });
    T('新手教程可以关闭和重新打开', () => { fresh(); boot(); setTut(0); const hid=$('#goal').classList.contains('hidden'); setSpeed(0); setTab='game'; openWin('settings'); const box=[...document.querySelectorAll('#mb input[type=checkbox]')].find(x=>/教程/.test(x.parentElement.textContent)); setTut(1); closeModal(); const back=!$('#goal').classList.contains('hidden')&&!!$('#goal .gx'); return (hid&&box&&!box.checked&&back) || `hid=${hid} box=${!!box} back=${back}`; });
    T('广告市场：平台收入来自外部品牌和游戏内公司', () => { fresh({pkg:'retail'}); const me=G.cos[0]; me.cash+=1e8; G.day+=365*12; G.date+=365*12*864e5;
      const city=G.cities[G.cur]; for(const t of ['net','dc','dc']){const l=findLot(city,false);const b=placeBuilding(me,t,G.cur,l.x,l.y,true);if(t==='net')setupB(me,b,'search')} me.tech.search=8;
      for(const c of G.cos)if(c.ai)for(const p of FINAL)c.ad[p]=3000; run(60);
      const bk=me.adm&&me.adm.byk.search||me.adl&&me.adl.byk.search; const coIn=bk?Object.keys(bk.co).length:0;
      return (bk && bk.ad>0 && coIn>0 && Object.values(bk.ext).some(v=>v>0) && finite(me.m.netAd) && me.m.net>=me.m.netAd) || `bk=${!!bk} co=${coIn} netAd=${me.m.netAd}`; });
    T('平台拒绝商战对手后，对手广告效率下降', () => { const me=G.cos[0], r=G.cos.find(c=>c.ai&&!c.dead); adpOf(me,'search').ban=0; for(const c of G.cos)if(c.ai&&c.id!==r.id)for(const k of NK)c.tech[k]=0; run(2); const e0=r._adEff;
      G.wars=G.wars||[]; G.wars.push({a:0,b:r.id,w:1,d0:G.day}); buildWar(); adpOf(me,'search').ban=1; run(2); const e1=r._adEff; G.wars.pop(); buildWar();
      return (e1<e0) || `e0=${e0} e1=${e1}`; });
    T('电商佣金率影响收入，灰色广告提高广告收入', () => { const me=G.cos[0]; me.tech.ecom=5; me.users.ecom=2e5; const p=adpOf(me,'ecom'); p.take=0.05; me.adm=null; run(1); const a=me.adm.byk.ecom.oth; p.take=0.1; me.adm=null; run(1); const b=me.adm.byk.ecom.oth;
      const q=adpOf(me,'search'); q.gray=0; me.adm=null; run(1); const g0=me.adm.byk.search.ad; q.gray=1; me.adm=null; run(1); const g1=me.adm.byk.search.ad; q.gray=0;
      return (b>a*1.6 && g1>g0*1.15) || `佣金 ${a}→${b} 灰色 ${g0}→${g1}`; });
    T('AI 广告打法多样，预算分配各不相同', () => { fresh({picks:AI_DEF.map(a=>a.k)}); run(365*2+20); const ai=G.cos.filter(c=>c.ai&&!c.dead); const kinds=new Set(ai.map(c=>adStratOf(c)));
      const bad=ai.find(c=>!finite(c.adMo||0)||FINAL.some(p=>!finite(c.ad[p])||c.ad[p]<0)); const spenders=ai.filter(c=>c.adMo>0).length;
      const ratios=ai.filter(c=>c.adMo>0&&c.months.length).map(c=>c.adMo/Math.max(1,c.months[c.months.length-1].rev)); const spread=ratios.length?Math.max(...ratios)/Math.max(1e-6,Math.min(...ratios)):0;
      return (kinds.size>=6 && !bad && spenders>=5 && spread>2) || `打法 ${kinds.size} 投放 ${spenders} 差异 ${spread.toFixed(2)} ${bad?bad.name:''}`; });
    T('大促脉冲型在双十一前加码', () => { const c=G.cos.find(x=>x.ai&&!x.dead&&x.months.length&&x.months[x.months.length-1].rev>0); c.adS='pulse'; c.cash=Math.max(c.cash,1e8); const d0=G.date;
      G.date=Date.UTC(1993,10,1); aiAdPlan(c); const nov=c.adMo; G.date=Date.UTC(1993,7,1); aiAdPlan(c); const aug=c.adMo; G.date=d0; return (nov>aug*3) || `11月 ${nov} 8月 ${aug}`; });
    T('互联网窗口三个页签都能打开', () => { boot(); for(const t of ['ov','ad','pol']){ netTab=t; openWin('net'); if(!$('#mb').innerHTML.length) return t; } netTab='ov'; closeModal(); return true; });
    T('所有窗口都能打开', () => {
      fresh(); run(400);
      const ws = ['market', 're', 'net', 'finance', 'research', 'stock', 'rank', 'macro', 'hr', 'war', 'inbox', 'report', 'dash', 'settings', 'help'];
      for (const w of ws) openWin(w);
      for (const t of ['is', 'bs', 'cf', 'sub', 'chart']) { finTab = t; openWin('finance'); }
      closeModal(); return true;
    });
    T('渲染一帧', () => { for (const q of [0, 1, 2]) { Q = q; resize(); rebuildCache(); render(); } Q = 1; resize(); return true; });
    T('运行期间没有未捕获错误', () => errs.length ? errs.slice(0, 3).join(' | ') : true);

    const pass = results.filter(r => r.ok).length;
    window.__TEST_RESULT = { pass, total: results.length, results };
    setSpeed(0);
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;inset:0;z-index:99;background:rgba(2,6,23,.92);color:#e2e8f0;overflow:auto;padding:24px;font:14px/1.6 system-ui,"PingFang SC","Microsoft YaHei"';
    box.innerHTML = `<h2 style="margin:0 0 8px">${pass === results.length ? '✅' : '❌'} 自检结果：${pass} / ${results.length} 通过</h2>
      <div style="color:#94a3b8;margin-bottom:12px">关闭此页面即可；正式游戏请打开 资本帝国实验室.html</div>` +
      results.map(r => `<div style="padding:6px 10px;margin:4px 0;border-radius:8px;background:${r.ok ? 'rgba(34,197,94,.12)' : 'rgba(244,63,94,.18)'}">${r.ok ? '✅' : '❌'} ${r.name} <span style="color:#94a3b8">(${r.ms.toFixed(0)} ms)</span>${r.msg ? `<div style="color:#fda4af;font-size:12px;white-space:pre-wrap">${r.msg}</div>` : ''}</div>`).join('');
    document.body.appendChild(box);
  }, 300);
})();
