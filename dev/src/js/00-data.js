
'use strict';
/* ================= 数据 ================= */
const W=64,H=64,TW=64,TH=32;
const $=s=>document.querySelector(s);
const rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[Math.floor(rnd()*a.length)];
const P={
 wheat:{n:'小麦',ic:'🌾',cat:'raw',imp:8,src:'farm',rate:300,col:'#e9c46a'},
 cotton:{n:'棉花',ic:'☁️',cat:'raw',imp:10,src:'farm',rate:250,col:'#f1f5f9'},
 milk:{n:'牛奶',ic:'🥛',cat:'raw',imp:9,src:'farm',rate:280,col:'pasture'},
 sugarcane:{n:'甘蔗',ic:'🎋',cat:'raw',imp:7,src:'farm',rate:320,col:'#65a30d'},
 cocoa:{n:'可可豆',ic:'🫘',cat:'raw',imp:16,src:'farm',rate:200,col:'#92400e'},
 hide:{n:'生皮',ic:'🐄',cat:'raw',imp:15,src:'farm',rate:180,col:'pasture'},
 wood:{n:'木材',ic:'🪵',cat:'raw',imp:12,src:'forest',rate:240},
 iron:{n:'铁矿石',ic:'⛰️',cat:'raw',imp:14,src:'mine',rate:220,col:'#6b4f3f'},
 crude:{n:'原油',ic:'🛢️',cat:'raw',imp:18,src:'mine',rate:180,col:'#1f2937'},
 silica:{n:'硅砂',ic:'🏜️',cat:'raw',imp:10,src:'mine',rate:240,col:'#c9b37a'},
 goldore:{n:'金矿石',ic:'🪨',cat:'raw',imp:60,src:'mine',rate:60,col:'#a16207'},
 flour:{n:'面粉',ic:'🥣',cat:'mid',imp:22,inp:{wheat:2},rate:500},
 sugar:{n:'糖',ic:'🧂',cat:'mid',imp:18,inp:{sugarcane:2},rate:500},
 fabric:{n:'布料',ic:'🧵',cat:'mid',imp:27,inp:{cotton:2},rate:400},
 leather:{n:'皮革',ic:'🟫',cat:'mid',imp:40,inp:{hide:2},rate:250},
 steel:{n:'钢材',ic:'🔩',cat:'mid',imp:36,inp:{iron:2},rate:300},
 plastic:{n:'塑料',ic:'🧪',cat:'mid',imp:26,inp:{crude:1},rate:300},
 chem:{n:'化工原料',ic:'⚗️',cat:'mid',imp:30,inp:{crude:1},rate:300},
 glass:{n:'玻璃',ic:'🪟',cat:'mid',imp:16,inp:{silica:1},rate:400},
 chip:{n:'芯片',ic:'💾',cat:'mid',imp:34,inp:{silica:2},rate:200,tech:1},
 gold:{n:'黄金',ic:'🥇',cat:'mid',imp:150,inp:{goldore:2},rate:60},
 bread:{n:'面包',ic:'🍞',cat:'final',imp:45,ref:68,inp:{flour:1,milk:1},rate:300,dem:900},
 cheese:{n:'奶酪',ic:'🧀',cat:'final',imp:30,ref:48,inp:{milk:2},rate:300,dem:600},
 drink:{n:'饮料',ic:'🥤',cat:'final',imp:50,ref:75,inp:{sugar:1,glass:1},rate:400,dem:800},
 chocolate:{n:'巧克力',ic:'🍫',cat:'final',imp:85,ref:130,inp:{cocoa:2,sugar:1,milk:1},rate:200,dem:260},
 clothes:{n:'服装',ic:'👕',cat:'final',imp:75,ref:120,inp:{fabric:2},rate:150,dem:300},
 shoes:{n:'皮鞋',ic:'👞',cat:'final',imp:150,ref:240,inp:{leather:2,plastic:1},rate:100,dem:120},
 cosmetics:{n:'化妆品',ic:'💄',cat:'final',imp:145,ref:230,inp:{chem:2,plastic:1,glass:1},rate:120,dem:140},
 medicine:{n:'药品',ic:'💊',cat:'final',imp:160,ref:260,inp:{chem:2,glass:1},rate:80,dem:90,tech:2},
 furniture:{n:'家具',ic:'🪑',cat:'final',imp:80,ref:130,inp:{wood:2,steel:1},rate:100,dem:140},
 toys:{n:'玩具',ic:'🧸',cat:'final',imp:72,ref:110,inp:{plastic:2},rate:120,dem:220},
 jewelry:{n:'珠宝',ic:'💍',cat:'final',imp:220,ref:380,inp:{gold:1},rate:30,dem:25},
 phone:{n:'手机',ic:'📱',cat:'final',imp:175,ref:280,inp:{chip:2,plastic:1,steel:1},rate:60,dem:90,tech:1},
 pc:{n:'电脑',ic:'💻',cat:'final',imp:260,ref:420,inp:{chip:3,plastic:2,steel:1},rate:40,dem:55,tech:1},
 appliance:{n:'家电',ic:'📺',cat:'final',imp:250,ref:400,inp:{steel:2,plastic:2,chip:1,glass:1},rate:40,dem:70,tech:1},
 car:{n:'汽车',ic:'🚗',cat:'final',imp:620,ref:980,inp:{steel:6,plastic:3,chip:2,glass:2},rate:15,dem:16,tech:1},
};
const NET={
 portal:{n:'门户网站',ic:'🌐',year:1993,arpu:0.15,pen:0.3},
 search:{n:'搜索引擎',ic:'🔍',year:1997,arpu:0.3,pen:0.65},
 ecom:{n:'电商平台',ic:'🛒',year:2000,arpu:0.4,pen:0.55},
 social:{n:'社交软件',ic:'💬',year:2004,arpu:0.25,pen:0.85},
 video:{n:'短视频',ic:'🎬',year:2012,arpu:0.35,pen:0.75},
};
const PK=Object.keys(P),NK=Object.keys(NET),ALLK=PK.concat(NK);
const FINAL=PK.filter(k=>P[k].cat==='final'),MID=PK.filter(k=>P[k].cat==='mid'),RAW=PK.filter(k=>P[k].cat==='raw');
const BASIC=['bread','cheese','drink','clothes','toys','furniture','chocolate'];
const nm=k=>(P[k]||NET[k]).n,ic=k=>(P[k]||NET[k]).ic;
const BT={
 mini:{g:'retail',n:'便利店',ic:'🏪',cost:100000,op:700,slots:2,cap:150,d:'2 种商品 · 便宜'},
 store:{g:'retail',n:'零售店',ic:'🏬',cost:220000,op:1800,slots:3,cap:250,d:'3 种商品'},
 market:{g:'retail',n:'大型超市',ic:'🛍️',cost:650000,op:4200,slots:5,cap:420,d:'5 种商品 · 大容量'},
 farm:{g:'prod',n:'农场/牧场',ic:'🚜',cost:150000,op:800,d:'小麦棉花牛奶甘蔗可可生皮'},
 forest:{g:'prod',n:'林场',ic:'🌲',cost:120000,op:700,d:'木材'},
 mine:{g:'prod',n:'矿场',ic:'⛏️',cost:320000,op:1600,d:'铁·油·硅砂·金矿'},
 factory:{g:'prod',n:'工厂',ic:'🏭',cost:450000,op:1500,d:'加工中间品/成品'},
 wh:{g:'prod',n:'仓库/物流中心',ic:'📦',cost:300000,op:900,d:'省运费·扩库存'},
 lab:{g:'tech',n:'研发中心',ic:'🔬',cost:500000,op:3000,d:'提升实体产品品质'},
 net:{g:'tech',n:'互联网公司',ic:'🧑‍💻',cost:400000,op:2500,d:'开发互联网产品'},
 dc:{g:'tech',n:'数据中心',ic:'🗄️',cost:600000,op:2000,d:'+5万用户承载'},
 land:{g:'re',n:'土地储备',ic:'🚧',cost:0,op:0,d:'只买地，坐等升值'},
 apt:{g:'re',n:'住宅楼',ic:'🏠',cost:600000,op:1200,d:'向居民收租'},
 office:{g:'re',n:'写字楼',ic:'🏢',cost:900000,op:2000,d:'向企业收租'},
};
const GROUPS={retail:'🏬 零售',prod:'🏭 生产',tech:'🔬 科技',re:'🏠 地产'};
const isRetail=b=>BT[b.type].g==='retail',isRE=b=>BT[b.type].g==='re',isRent=b=>b.type==='apt'||b.type==='office';
const CITY_DEF=[
 {n:'上海',r:4.5,land:1.6,g:0.00012,map:'coastE',tag:'大城市',seg:[0.3,0.35,0.35]},
 {n:'北京',r:4,land:1.4,g:0.0001,map:'plain',tag:'大城市',seg:[0.32,0.36,0.32]},
 {n:'深圳',r:2.2,land:1.1,g:0.00026,map:'coastS',tag:'小渔村·发展极快',seg:[0.45,0.28,0.27]},
 {n:'成都',r:3,land:0.8,g:0.00014,map:'river',tag:'中等城市',seg:[0.55,0.25,0.2]},
 {n:'广州',r:3.6,land:1.2,g:0.00016,map:'delta',tag:'商贸大城·批发集散',seg:[0.42,0.3,0.28]},
 {n:'杭州',r:2.6,land:1.0,g:0.0002,map:'lake',tag:'西湖之城·电商之都',seg:[0.36,0.32,0.32],net:1.3},
];
// 虚构创业者：start=开局资产，w=扩张偏好（零售/工厂/产业链/研发/互联网/地产）
const AI_DEF=[
 {k:'spark',n:'星火科技',f:'陈凌',av:'🧑‍💻',col:'#f97316',style:'价格屠夫',desc:'薄利多销，用极致性价比抢份额',price:0.86,tech:0.5,exp:1,pref:['phone','pc','appliance'],start:[['lab','phone'],['store'],['mini']],w:[3,1,0.5,1,1,0],quote:'今年我们要打价格战'},
 {k:'aurora',n:'极光设计',f:'艾伦·斯通',av:'🧑‍🎨',col:'#a855f7',style:'完美主义者',desc:'只做高品质产品，敢定高价',price:1.2,tech:1,exp:0.8,pref:['phone','pc','cosmetics'],start:[['lab','phone'],['store']],w:[2,1.5,0.5,2,0.5,0],quote:'品质才是一切'},
 {k:'hongyuan',n:'宏远实业',f:'王建国',av:'👷',col:'#ef4444',style:'重资产实业家',desc:'原料、工厂、门店一条龙',price:1.0,tech:0.35,exp:1,pref:['bread','furniture'],start:[['farm','wheat'],['factory','flour'],['factory','bread'],['mini']],w:[1,3,3,0.3,0,0.3],quote:'我们会继续扩建工厂'},
 {k:'yunfan',n:'云帆网络',f:'周宇',av:'🧑‍🚀',col:'#eab308',style:'互联网信徒',desc:'流量为王，砸钱抢用户',price:1.0,tech:0.6,exp:0.8,pref:['phone'],start:[['net','portal'],['dc'],['mini']],w:[1,0.3,0,0.5,4,0.3],quote:'流量就是一切'},
 {k:'dingsheng',n:'鼎盛置业',f:'冯大富',av:'🤠',col:'#14b8a6',style:'地产大亨',desc:'囤地盖楼，靠地价周期发财',price:1.05,tech:0.2,exp:1.2,pref:[],start:[['apt'],['office'],['land'],['land']],w:[0.5,0,0,0,0,5],quote:'土地是唯一不会再生产的东西'},
 {k:'jinsui',n:'金穗食品',f:'李秋禾',av:'👩‍🌾',col:'#84cc16',style:'农业起家',desc:'深耕食品，从田间到餐桌',price:0.97,tech:0.4,exp:1,pref:['cheese','bread','chocolate'],start:[['farm','milk'],['factory','cheese'],['store']],w:[1.5,2,2.5,0.3,0,0.2],quote:'老百姓的餐桌就是我们的战场'},
 {k:'jinxiu',n:'锦绣服饰',f:'苏绣',av:'👩‍🎤',col:'#ec4899',style:'时尚品牌派',desc:'服装皮鞋化妆品，靠品牌溢价',price:1.12,tech:0.6,exp:0.9,pref:['clothes','shoes','cosmetics'],start:[['factory','clothes'],['store']],w:[2,2,1,0.5,0,0.3],quote:'品牌就是护城河'},
 {k:'panshi',n:'磐石重工',f:'赵铁',av:'🧔',col:'#78716c',style:'重工业狂人',desc:'钢铁、家具、汽车，越重越好',price:1.0,tech:0.5,exp:0.8,pref:['furniture','car','appliance'],start:[['mine','iron'],['factory','steel'],['factory','furniture']],w:[0.8,3,2.5,1,0,0.2],quote:'没有重工业就没有一切'},
 {k:'lanhai',n:'蓝海资本',f:'高远',av:'🕴️',col:'#0ea5e9',style:'资本运作者',desc:'加杠杆跑马圈地，零售地产两手抓',price:1.0,tech:0.3,exp:1.6,pref:[],start:[['store'],['apt'],['land']],w:[2,0.5,0,0,1,2],quote:'速度比利润更重要'},
 {k:'qinghe',n:'青禾优选',f:'林小满',av:'🙋‍♀️',col:'#10b981',style:'社区零售',desc:'便利店开遍每个小区',price:0.93,tech:0.3,exp:1.4,pref:['bread','drink','cheese'],start:[['mini'],['mini'],['mini']],w:[5,0.3,0,0,0.3,0],retail:'mini',quote:'把店开到每个小区门口'},
 {k:'quantum',n:'量子芯',f:'秦思远',av:'👨‍🔬',col:'#6366f1',style:'硬科技派',desc:'死磕芯片和研发投入',price:1.08,tech:1.3,exp:0.7,pref:['phone','pc','appliance','car'],start:[['lab','pc'],['mine','silica'],['factory','chip']],w:[1,2,1.5,2.5,0.5,0],quote:'核心技术必须掌握在自己手里'},
 {k:'lexiang',n:'乐享娱乐',f:'许乐',av:'🥳',col:'#f43f5e',style:'内容为王',desc:'玩具与互联网内容双线作战',price:1.0,tech:0.5,exp:1,pref:['toys'],start:[['factory','toys'],['store'],['net','portal']],w:[1.5,1,0.5,0.3,2.5,0],quote:'快乐是最好的生意'},
 {k:'dongfang',n:'东方百货',f:'钱多多',av:'🤵',col:'#d97706',style:'百货巨头',desc:'大型超市遍布全国，什么都卖',price:1.03,tech:0.3,exp:1.3,pref:['jewelry','clothes'],start:[['market'],['store']],w:[4,0.3,0,0,0.2,0.8],retail:'market',quote:'顾客要什么，我们就卖什么'},
 {k:'kangning',n:'康宁医药',f:'方仁心',av:'👩‍⚕️',col:'#22c55e',style:'医药世家',desc:'化工、药品、化妆品，高研发高毛利',price:1.1,tech:1.1,exp:0.8,pref:['medicine','cosmetics'],start:[['lab','medicine'],['factory','cosmetics'],['store']],w:[1.5,2,1.5,2,0,0.2],quote:'健康是刚需'},
 {k:'tianmi',n:'甜蜜食品',f:'唐蜜',av:'🍬',col:'#fb7185',style:'快消品之王',desc:'糖、饮料、巧克力，薄利走量',price:0.95,tech:0.4,exp:1.1,pref:['drink','chocolate'],start:[['farm','sugarcane'],['factory','sugar'],['factory','drink'],['mini']],w:[2,2,2,0.3,0,0.2],quote:'每个人每天都要喝一瓶'},
];
const MACRO=[
 {k:'hike',n:'央行加息',ic:'📈',p:0.035,desc:'基准利率上调，贷款变贵，存款收益提高，楼市和股市承压'},
 {k:'cut',n:'央行降息',ic:'📉',p:0.035,desc:'基准利率下调，贷款变便宜，楼市和股市受提振'},
 {k:'war',n:'地区战争',ic:'⚔️',p:0.006,dur:[6,18],desc:'原油+60%、金矿+30%、铁矿钢材+20%，消费萎缩，股市下跌'},
 {k:'oil',n:'石油危机',ic:'🛢️',p:0.01,dur:[4,12],desc:'原油+80%，塑料、化工原料+30%'},
 {k:'pandemic',n:'大型疫情',ic:'🦠',p:0.004,dur:[12,24],desc:'线下零售需求-25%，药品需求×1.8，互联网加速普及，写字楼空置'},
 {k:'tradewar',n:'贸易战',ic:'🚧',p:0.008,dur:[12,30],desc:'芯片+50%，手机电脑家电进口价+25~30%，股市承压'},
 {k:'crisis',n:'金融危机',ic:'💥',p:0.005,dur:[12,24],desc:'股市崩盘，楼市下跌，消费-15%，银行贷款额度减半'},
 {k:'boom',n:'经济繁荣',ic:'🚀',p:0.012,dur:[12,30],desc:'消费+12%，楼市股市上涨'},
 {k:'harvest',n:'农业大丰收',ic:'🌾',p:0.015,dur:[6,12],desc:'小麦棉花牛奶甘蔗可可价格-30%'},
 {k:'drought',n:'旱灾歉收',ic:'☀️',p:0.012,dur:[6,12],desc:'农产品价格+50%'},
 {k:'mine',n:'发现大型矿藏',ic:'⛏️',p:0.01,dur:[12,24],desc:'铁矿、金矿-25%，硅砂-20%'},
 {k:'tech',n:'科技突破',ic:'💡',p:0.008,dur:[12,24],desc:'芯片-25%，研发速度+30%，互联网普及加快'},
 {k:'disaster',n:'自然灾害',ic:'🌪️',p:0.01,dur:[3,6],desc:'某城市人口流失、部分建筑受损、地价下跌'},
 {k:'stimulus',n:'基建刺激计划',ic:'🏗️',p:0.01,dur:[12,24],desc:'钢铁、玻璃需求大增，楼市升温，消费回暖'},
 {k:'taxcut',n:'减税政策',ic:'🧾',p:0.008,dur:[24,36],desc:'企业所得税 15% → 10%'},
 {k:'taxup',n:'加税',ic:'🏛️',p:0.006,dur:[24,36],desc:'企业所得税 15% → 20%'},
 {k:'reban',n:'楼市调控',ic:'🧊',p:0.012,dur:[6,18],desc:'各地地价指数下行，住宅需求降温'},
];
const MDEF=k=>MACRO.find(x=>x.k===k);
let MM=null;
function macroMods(){const m={price:{},dem:1,demP:{},sent:1,re:0,loan:1,tax:0.15,rd:1,adopt:0,office:1,apt:1};
  const mul=(ps,v)=>ps.forEach(p=>m.price[p]=(m.price[p]||1)*v);
  for(const e of G.mev||[])switch(e.k){
    case 'war':mul(['crude'],1.6);mul(['goldore'],1.3);mul(['iron','steel'],1.2);m.dem*=0.92;m.sent*=0.85;m.re-=0.004;break;
    case 'oil':mul(['crude'],1.8);mul(['plastic','chem'],1.3);m.sent*=0.95;break;
    case 'pandemic':m.dem*=0.75;m.demP.medicine=(m.demP.medicine||1)*2.4;m.adopt+=0.08;m.office*=0.7;m.sent*=0.85;m.re-=0.005;break;
    case 'tradewar':mul(['chip'],1.5);mul(['phone','pc'],1.3);mul(['appliance'],1.25);mul(['car'],1.15);m.sent*=0.92;break;
    case 'crisis':m.dem*=0.85;m.sent*=0.6;m.re-=0.02;m.loan*=0.5;m.office*=0.85;break;
    case 'boom':m.dem*=1.12;m.sent*=1.2;m.re+=0.01;break;
    case 'harvest':mul(['wheat','cotton','milk','sugarcane','cocoa'],0.7);break;
    case 'drought':mul(['wheat','cotton','milk','sugarcane','cocoa'],1.5);break;
    case 'mine':mul(['iron','goldore'],0.75);mul(['silica'],0.8);break;
    case 'tech':mul(['chip'],0.75);m.rd*=1.3;m.adopt+=0.05;m.sent*=1.08;break;
    case 'stimulus':mul(['steel','glass'],1.2);mul(['iron'],1.15);m.dem*=1.05;m.re+=0.01;break;
    case 'taxcut':m.tax=0.10;break;case 'taxup':m.tax=0.20;break;
    case 'reban':m.re-=0.015;m.apt*=0.85;break}
  m.re+=(0.045-G.rate)*0.25;m.sent*=1+(0.045-G.rate)*3;return m}
const loanRate=c=>Math.max(0.01,G.rate+0.02-(c.perk==='fin'?0.03:0)-0.015*exS(c,'cfo'));
const depRate=c=>Math.max(0,G.rate-0.02+(c?0.005*exS(c,'cfo'):0));
// ===== 员工 / 高管系统 =====
const ROLES={
 retail:{n:'零售总监',ic:'🏪',eff:s=>`门店客流 +${(8*s).toFixed(1)}%`,auto:{autoPrice:'自动定价（按销量和成本调价）',autoFill:'自动补齐空货架（挑最赚钱的商品）'}},
 cmo:{n:'营销总监',ic:'📣',eff:s=>`品牌积累 +${(80*s).toFixed(0)}%`,auto:{autoAd:'自动投放广告（上月零售额的 3%）'}},
 cto:{n:'技术总监',ic:'🧪',eff:s=>`研发速度 +${(60*s).toFixed(0)}%`,auto:{autoRD:'闲置研发中心/互联网公司自动选课题'}},
 coo:{n:'运营总监',ic:'⚙️',eff:s=>`运营成本 −${(15*s).toFixed(1)}%，产量 +${(10*s).toFixed(1)}%`,auto:{autoProd:'闲置工厂/农矿场自动选最赚钱的产品'}},
 cfo:{n:'财务总监',ic:'💹',eff:s=>`贷款利率 −${(1.5*s).toFixed(2)}%，存款利率 +${(0.5*s).toFixed(2)}%`,auto:{autoFin:'自动还贷 / 现金不足时自动借款'}},
 cre:{n:'地产总监',ic:'🏢',eff:s=>`租金收入 +${(10*s).toFixed(1)}%`,auto:{autoRent:'自动调整租金（目标出租率 92%）'}},
};
const TRAITS={steady:{n:'稳重',d:'从不跳槽'},ambit:{n:'野心勃勃',d:'成长快，但更容易被挖'},frugal:{n:'节俭',d:'薪资要求 −10%'},star:{n:'明星经理',d:'效果 +15%，薪资 +30%'},none:{n:'普通',d:''}};
const WAGE=[{n:'低薪',op:0.85,eff:0.9,d:'运营成本 −15%，效率 −10%，高管更易离职'},{n:'标准',op:1,eff:1,d:'行业平均水平'},{n:'高薪',op:1.2,eff:1.08,d:'运营成本 +20%，效率 +8%，高管更忠诚'}];
const STAFF={wh:25,mini:6,store:15,market:40,farm:20,forest:15,mine:40,factory:80,lab:30,net:40,dc:10,land:0,apt:5,office:8};
const SURN='王李张刘陈杨黄赵吴周徐孙马朱胡郭何林罗高郑梁谢宋唐许韩冯邓曹彭曾萧田董潘袁蔡蒋余杜叶程魏苏吕丁任卢姚沈钟姜崔谭陆范汪廖石金夏方邹熊白孟秦邱侯江薛段雷龙陶贺顾毛龚邵严武戴孔汤',GIVN='伟芳娜敏静丽强磊军洋勇艳杰涛明超秀霞平刚桂英华慧建国志红玲峰鹏辉宇浩然晨阳婷雪琳博文思远嘉怡子轩梓涵欣妍俊杰雨萱一鸣';
const EAV=['👨‍💼','👩‍💼','🧑‍💼','👨‍💻','👩‍💻','👨‍🔬','👩‍🔬','🧔','👩‍🦰','👨‍🦳','👩‍🦳','🧑‍🎓'];
const exS=(c,r)=>{const e=c&&c.ex&&c.ex[r];return e?e.skill/100*(e.trait==='star'?1.15:1):0};
const effOf=c=>c.ai?1:WAGE[c.wage??1].eff*(G&&buffOn('strike')?0.5:1),wageOp=c=>c.ai?1:WAGE[c.wage??1].op*(G&&buffOn('wageUp')?1.1:1);
const marketSal=(sk,tr)=>Math.round((15000+sk*sk*12)*(tr==='star'?1.3:tr==='frugal'?0.9:1)/1000)*1000;
function mkCand(role){const sk=Math.round(clamp(25+rnd()*55+(rnd()<0.12?25:0),20,98)),tr=pick(['steady','ambit','frugal','star','none','none','none']);
  return{id:G.nid++,name:SURN[Math.floor(rnd()*SURN.length)]+GIVN[Math.floor(rnd()*GIVN.length)]+(rnd()<0.5?GIVN[Math.floor(rnd()*GIVN.length)]:''),av:pick(EAV),role:role||pick(Object.keys(ROLES)),skill:sk,trait:tr,sal:marketSal(sk,tr)}}
function refreshTalent(full){G.talent=G.talent||[];if(full){G.talent=[];for(const r in ROLES){G.talent.push(mkCand(r));G.talent.push(mkCand(r))}}
  else{for(let k=0;k<3&&G.talent.length;k++)G.talent.splice(Math.floor(rnd()*G.talent.length),1);while(G.talent.length<12)G.talent.push(mkCand())}}
function hrMonth(c){if(!c.ex)return;for(const r in c.ex){const e=c.ex[r];if(!e)continue;e.skill=Math.min(100,e.skill+(e.trait==='ambit'?0.8:0.35));
  const ratio=e.sal/marketSal(e.skill,e.trait),risk=(ratio<0.85?0.08:ratio<0.95?0.02:0.003)*(e.trait==='ambit'?2:1)*((c.wage??1)===0?1.6:(c.wage??1)===2?0.6:1);
  if(e.trait!=='steady'&&rnd()<risk){const ai=G.cos.filter(x=>x.ai&&!x.dead);c.ex[r]=null;const who=ai.length?pick(ai).name:'猎头';notify('hr',`${ROLES[r].n} ${e.name} 被${who}挖走了`,'薪资低于市场价时容易被挖，记得及时加薪',true);(G.mlogHR=G.mlogHR||[]).push(`${ROLES[r].n} ${e.name} → ${who}`);addNews(`👔 ${who}高薪挖走了${c.name}的${ROLES[r].n}${e.name}`)}}
  refreshTalent(false)}
function autoMgr(c){const ex=c.ex||{},on=(r,k)=>ex[r]&&ex[r].auto&&ex[r].auto[k];
  if(on('retail','autoPrice')){const s=exS(c,'retail');for(const b of G.b){if(b.o!==c.id||!isRetail(b))continue;const cap=BT[b.type].cap*lvMul(b.lv)*effOf(c);
    for(const sl of b.slots){const floor=G.imp[sl.p]*(1.03+0.07*s),ref=refNow(sl.p);if(sl.sold>=cap*0.93)sl.price*=1+0.02+0.03*s;else if(sl.sold<cap*0.45)sl.price*=0.97;else if(sl.sold<cap*0.75)sl.price*=0.995;
      sl.price=Math.round(clamp(sl.price,floor,ref*1.8))}}}
  if(on('retail','autoFill'))for(const b of G.b){if(b.o!==c.id||!isRetail(b)||b.slots.length>=BT[b.type].slots)continue;const city=G.cities[b.c],have=new Set(b.slots.map(x=>x.p));
    const best=FINAL.filter(p=>!have.has(p)).map(p=>{const sd=city.sales[p]||{D:P[p].dem,n:0};return[p,sd.D/(sd.n+1)*(refNow(p)-G.imp[p])*(c.inv[p].q>10?1.3:1)]}).sort((a,b)=>b[1]-a[1])[0];
    if(best)b.slots.push({p:best[0],price:Math.round(refNow(best[0])),sold:0})}
  if(on('cmo','autoAd')&&G.day%15===0){const lm=c.months[c.months.length-1],bud=(lm?lm.rev:c.m.rev)*0.03/30,w={};let tot=0;
    for(const b of G.b)if(b.o===c.id&&isRetail(b))for(const sl of b.slots){const v=(sl.sold||0)*sl.price;w[sl.p]=(w[sl.p]||0)+v;tot+=v}
    for(const p of FINAL)c.ad[p]=tot>0&&w[p]?Math.round(bud*w[p]/tot/100)*100:0}
  if(on('cto','autoRD')){const yr=yearNow();const mk=new Set(G.b.filter(b=>b.o===c.id&&b.prod&&P[b.prod]).map(b=>b.prod));const sells=new Set();G.b.forEach(b=>{if(b.o===c.id&&isRetail(b))b.slots.forEach(x=>sells.add(x.p))});
    for(const b of G.b){if(b.o!==c.id||b.prod)continue;
      if(b.type==='lab'){const cand=[...new Set([...mk,...sells])];const lock=PK.filter(p=>P[p].tech&&c.tech[p]<P[p].tech&&(sells.has(p)||mk.has(p)||rnd()<0.3));const pool=lock.length?lock:cand.length?cand:FINAL;
        b.prod=pool.sort((a,b2)=>c.tech[a]-c.tech[b2])[0];G.cities[b.c].dirty=true}
      else if(b.type==='net'){const av=NK.filter(k=>yr>=NET[k].year-1&&!G.b.some(x=>x.o===c.id&&x.type==='net'&&x.prod===k));if(av.length){b.prod=av.sort((a,b2)=>NET[b2].arpu*NET[b2].pen-NET[a].arpu*NET[a].pen)[0];G.cities[b.c].dirty=true}}}}
  if(on('coo','autoProd'))for(const b of G.b){if(b.o!==c.id||b.prod)continue;
    if(b.type==='factory'){const best=[...MID,...FINAL].filter(p=>!(P[p].tech&&c.tech[p]<P[p].tech)).map(p=>[p,(G.imp[p]-Object.keys(P[p].inp).reduce((s2,k)=>s2+P[p].inp[k]*G.imp[k],0))*P[p].rate]).sort((a,b2)=>b2[1]-a[1])[0];if(best){b.prod=best[0];b.hist=[];G.cities[b.c].dirty=true}}
    else if(b.type==='farm'||b.type==='forest'||b.type==='mine'){const best=RAW.filter(p=>P[p].src===b.type).sort((a,b2)=>G.imp[b2]*P[b2].rate-G.imp[a]*P[a].rate)[0];b.prod=best;b.hist=[];G.cities[b.c].dirty=true}}
  if(on('cfo','autoFin')){const opm=(c.months.length?c.months[c.months.length-1].op:c.m.op*3)||1e5;
    if(c.loan>0&&c.cash>opm*2.5){const r=Math.min(c.loan,c.cash-opm*2);if(r>0){c.loan-=r;c.cash-=r}}
    else if(c.cash<opm*0.4){const need=Math.min(loanCap(c),Math.ceil((opm*0.8-c.cash)/1e4)*1e4);if(need>0){c.loan+=need;c.cash+=need}}}
  if(on('cre','autoRent')&&G.day%6===0)for(const b of G.b){if(b.o!==c.id||!isRent(b))continue;const ref=refRent(b);if(b.occ>0.96)b.rent*=1.03;else if(b.occ<0.86)b.rent*=0.97;b.rent=Math.round(clamp(b.rent,ref*0.4,ref*2.2))}
}
function macroInit(gm){G.rate=0.045;G.rateHist=[0.045];G.mev=[];G.mlog=[];G.mset={g:gm,m:{}};MACRO.forEach(e=>G.mset.m[e.k]=1)}
function startMacro(k){const d=MDEF(k);let txt=d.n;
  if(k==='hike'||k==='cut'){const v=pick([0.0025,0.005,0.0075,0.01])*(k==='hike'?1:-1);G.rate=clamp(G.rate+v,0.005,0.15);txt=`${d.n} ${Math.abs(v*100).toFixed(2)}%，基准利率 ${(G.rate*100).toFixed(2)}%`}
  else{const e={k,left:d.dur[0]+Math.floor(rnd()*(d.dur[1]-d.dur[0]+1))};
    if(k==='disaster'){const city=pick(G.cities);e.c=city.id;city.pop*=0.94;city.trend-=0.03;for(const b of G.b)if(b.c===city.id&&rnd()<0.4)b.dep*=0.85;txt=`${city.n}遭遇${pick(['强台风','地震','特大洪水'])}，人口流失、部分建筑受损`}
    if(k==='crisis')for(const c of G.cos)c.sent*=0.75;
    G.mev=G.mev.filter(x=>x.k!==k);G.mev.push(e);txt+=`（预计持续 ${e.left} 个月）`}
  addNews(`${d.ic} 宏观：${txt}`);notify('macro',d.n,d.desc,true);G.mlog.unshift({t:G.date,k,txt});G.mlog=G.mlog.slice(0,40);MM=macroMods()}
function antiMonth(){G.anti=G.anti||{};for(const k of NK){const U=G.netU[k]||0;if(U<=0)continue;for(const c of G.cos){if(c.dead||c.users[k]/U<0.6)continue;if(rnd()<0.2){const rev=c.users[k]*NET[k].arpu*c.monet[k]*90;c.cash-=rev;c.m.op+=rev;G.anti[c.id+'_'+k]=G.day+365;c.monet[k]=Math.min(c.monet[k],1);
  addNews(`⚖️ 反垄断调查：${c.name}「${NET[k].n}」市场份额 ${(c.users[k]/U*100).toFixed(0)}%，被罚 ${fmt(rev)}，一年内商业化强度受限`);if(c.id===0)toast(`⚖️ <b>反垄断处罚</b>：「${NET[k].n}」份额过高，罚款 ${fmt(rev)}，一年内商业化强度不得高于「中」`)}}}}
function genMonth(d){antiMonth();G.qref=G.qref||{};G.gen=G.gen||{};G.genY=G.genY||{};const y=d.getUTCFullYear();
  for(const p in GENP){if(G.gen[p]==null){G.gen[p]=1;G.genY[p]=y;G.qref[p]=50}
    if(y-G.genY[p]>=GENP[p].every&&d.getUTCMonth()===8){G.gen[p]++;G.genY[p]=y;G.qref[p]+=8;const me=G.cos[0];
      addNews(`${P[p].ic} 第 ${G.gen[p]} 代${GENP[p].n}上市，市场品质基准提高到 ${G.qref[p]}，旧款贬值`);
      if(me.inv[p].q>0||G.b.some(b=>b.o===0&&(b.prod===p||(isRetail(b)&&b.slots.some(x=>x.p===p)))))toast(`${P[p].ic} 新一代${GENP[p].n}上市！旧款相对品质下降，请加紧研发（品质需 ≥ ${G.qref[p]}）`)}}
  for(const city of G.cities){if(!city.seg)city.seg=[0.4,0.3,0.3];const t=0.0004;city.seg=[Math.max(0.15,city.seg[0]-t),city.seg[1]+t*0.55,city.seg[2]+t*0.45]}}
function macroMonth(){
  G.rate=clamp(G.rate+(0.045-G.rate)*0.03,0.005,0.15);
  for(const e of G.mev){e.left--;if(e.left<=0)addNews(`${MDEF(e.k).ic} ${MDEF(e.k).n}结束`)}G.mev=G.mev.filter(e=>e.left>0);
  const act=new Set(G.mev.map(e=>e.k));
  for(const d of MACRO){if(act.has(d.k))continue;let p=d.p*G.mset.g*(G.mset.m[d.k]??1);
    if(d.k==='hike')p*=act.has('boom')?3:(act.has('crisis')||act.has('pandemic'))?0.2:1;
    if(d.k==='cut')p*=(act.has('crisis')||act.has('pandemic')||act.has('war'))?4:act.has('boom')?0.3:1;
    if((d.k==='boom'&&act.has('crisis'))||(d.k==='harvest'&&act.has('drought'))||(d.k==='drought'&&act.has('harvest'))||(d.k==='taxcut'&&act.has('taxup'))||(d.k==='taxup'&&act.has('taxcut')))p=0;
    if(d.k==='crisis'&&act.has('boom'))p*=0.3;
    if(rnd()<p)startMacro(d.k)}
  G.rateHist.push(G.rate);if(G.rateHist.length>240)G.rateHist.shift();MM=macroMods()}
const SEG=[{n:'价格敏感',ic:'💸',q:0.5,b:80,bp:1,pe:3.6,d:'只看便宜'},{n:'品质优先',ic:'💎',q:2.6,b:60,bp:1,pe:1.5,d:'愿为好货多付钱'},{n:'品牌忠诚',ic:'🏷️',q:1.0,b:22,bp:1.5,pe:1.2,d:'认牌子'}];
const GENP={phone:{every:3,n:'手机'},pc:{every:4,n:'电脑'},appliance:{every:5,n:'家电'},car:{every:6,n:'汽车'}};
const qrefOf=p=>(G.qref&&G.qref[p])||50;
function segMix(city){let m=(city.seg||[0.4,0.3,0.3]).slice();if(MM&&MM.dem<0.97){const sh=Math.min(0.2,(1-MM.dem));m=[m[0]+sh,m[1]-sh/2,m[2]-sh/2]}return m}
const AIK=[{n:'简单',cash:0.7,exp:0.6,tech:0.6,price:1.06,smart:0},{n:'普通',cash:1,exp:1,tech:1,price:1,smart:0.5},{n:'困难',cash:1.5,exp:1.4,tech:1.5,price:0.97,smart:1}];
const aik=()=>AIK[(G&&G.aiLv)??1];
const scaleF=c=>{const n=c._nb||0;return 1+0.03*Math.max(0,n-10)/10*(1+Math.max(0,n-60)/60)};
const PERKS={sales:{n:'营销天才',ic:'📣',d:'门店客流 +15%'},tech:{n:'技术极客',ic:'🧠',d:'研发速度 +40%'},fin:{n:'资本玩家',ic:'💹',d:'利率 3.5%，授信 +50%'},ind:{n:'实业家',ic:'🏗️',d:'工厂/原料产能 +20%'},re:{n:'地产嗅觉',ic:'🏘️',d:'租金收入 +15%'}};
const PKGS={retail:{n:'零售起家',ic:'🏬',d:'市中心零售店 1 家',b:[['store']]},industry:{n:'实业起家',ic:'🏭',d:'牧场 + 奶酪工厂 + 便利店',b:[['farm','milk'],['factory','cheese'],['mini']]},tech:{n:'科技起家',ic:'🔬',d:'研发中心 + 互联网公司',b:[['lab','phone'],['net','portal']]},re:{n:'地产起家',ic:'🏠',d:'住宅楼 1 栋 + 土地 1 块',b:[['apt'],['land']]},cash:{n:'白手起家',ic:'💰',d:'额外现金 ¥80万',b:[]}};
const PLAYER_COL='#22d3ee';
const lvMul=lv=>1+0.6*(lv-1),opMul=lv=>1+0.4*(lv-1);
const techQ=t=>Math.min(100,40+t*7),techNeed=t=>Math.round(20*Math.pow(t+1,1.5));
function fmt(v){const s=v<0?'-':'';v=Math.abs(v);if(v>=1e8)return s+'¥'+(v/1e8).toFixed(2)+'亿';if(v>=1e4)return s+'¥'+(v/1e4).toFixed(v>=1e6?0:1)+'万';return s+'¥'+Math.round(v)}
function fnum(v){v=Math.round(v);return Math.abs(v)>=1e4?(v/1e4).toFixed(1)+'万':v.toLocaleString('zh-CN')}

