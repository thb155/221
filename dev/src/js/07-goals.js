/* ================= 目标 ================= */
const myB=t=>G.b.filter(b=>b.o===0&&(t==='retail'?isRetail(b):b.type===t));
const GOALS=[
 {t:'拥有一家门店（便利店/零售店/超市）',f:()=>myB('retail').length>=1},
 {t:'让门店同时卖 3 种商品',f:()=>myB('retail').some(b=>b.slots.length>=3)},
 {t:'建造工厂，自产商品',f:()=>myB('factory').some(b=>b.prod)},
 {t:'单月利润超过 ¥20万',f:()=>G.cos[0].months.some(m=>m.profit>2e5)},
 {t:'在第二座城市建造建筑',f:()=>new Set(G.b.filter(b=>b.o===0).map(b=>b.c)).size>=2},
 {t:'拥有一栋住宅楼或写字楼',f:()=>G.b.some(b=>b.o===0&&isRent(b))},
 {t:'任一产品技术达到 Lv3',f:()=>PK.some(p=>G.cos[0].tech[p]>=3)},
 {t:'上线一款互联网产品',f:()=>NK.some(k=>G.cos[0].tech[k]>=1)},
 {t:'净资产达到 ¥1000万',f:()=>netWorth(G.cos[0])>=1e7},
 {t:'持有房产总值超过 ¥2000万',f:()=>reVal(G.cos[0])>=2e7},
 {t:'互联网用户达到 10 万',f:()=>usersOf(G.cos[0])>=1e5},
 {t:'在股市收购一家竞争对手',f:()=>G.cos[0].acquired>0},
 {t:'净资产达到 ¥1亿，成为商业帝国！',f:()=>netWorth(G.cos[0])>=1e8},
];
function checkGoal(){let ch=false;while(G.goal<GOALS.length&&GOALS[G.goal].f()){notify('goal','目标达成：'+GOALS[G.goal].t,'',true);G.goal++;ch=true}if(ch)renderGoal()}
function renderGoal(){const sc=SCN[G.scn];if(sc&&sc.win&&!G.scnDone){const y=new Date(G.date).getUTCFullYear();$('#goal').innerHTML=`<div class="t">${sc.ic} ${sc.n}</div>${sc.goal}<div class="mu" style="font-size:11px;margin-top:3px">剩余约 ${Math.max(0,sc.deadline-y+1)} 年</div>`;return}const g=GOALS[G.goal];$('#goal').innerHTML=`<div class="t">🎯 目标 ${Math.min(G.goal+1,GOALS.length)}/${GOALS.length}</div>${g?g.t:'全部完成！你就是商业传奇。'}<div class="bar" style="margin-top:6px"><i style="width:${G.goal/GOALS.length*100}%"></i></div>`}

