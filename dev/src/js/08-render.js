/* ================= 绘制 ================= */
const MOBILE=matchMedia('(pointer:coarse)').matches||innerWidth<760;if(MOBILE){document.body.classList.add('m');$('#menu').prepend($('#spd'))}
function layout(){document.documentElement.style.setProperty('--toph',$('#top').offsetHeight+'px')}
window.toggleBuild=v=>{const on=v===undefined?!document.body.classList.contains('showb'):v;document.body.classList.toggle('showb',on);if(on)select(null)};
const cv=$('#c'),mainCtx=cv.getContext('2d',{alpha:false});let ctx=mainCtx,dpr=1,VW=0,VH=0;
function resize(){dpr=Math.min(window.devicePixelRatio||1,Q===2?2:Q===1?1.5:1);VW=innerWidth;VH=innerHeight;cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);layout()}
addEventListener('resize',resize);if(window.visualViewport)visualViewport.addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,300));resize();
const iso=(x,y)=>[(x-y)*TW/2,(x+y)*TH/2];
function centerCam(){const [ix,iy]=iso(W/2,H/2);cam.z=MOBILE?0.55:clamp(VW/1600,0.55,1.1);cam.x=VW/2-ix*cam.z;cam.y=VH/2-iy*cam.z}
function toGrid(sx,sy){const dx=(sx-cam.x)/cam.z,dy=(sy-cam.y)/cam.z;return[(dx/(TW/2)+dy/(TH/2))/2,(dy/(TH/2)-dx/(TW/2))/2]}
const shCache={};
function shade(hex,f){const key=hex+f;if(shCache[key])return shCache[key];let c=hex.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');const n=parseInt(c,16);let r=n>>16,g=(n>>8)&255,b=n&255;
  if(f<1){r*=f;g*=f;b*=f}else{r+=(255-r)*(f-1);g+=(255-g)*(f-1);b+=(255-b)*(f-1)}return shCache[key]=`rgb(${r|0},${g|0},${b|0})`}
function poly(pts,fill,stroke){ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
function box(gx,gy,w,d,h,col,opt){opt=opt||{};
  const A=iso(gx,gy),B=iso(gx+w,gy),C=iso(gx+w,gy+d),D=iso(gx,gy+d),up=p=>[p[0],p[1]-h];
  if(Q>0&&!opt.ns){ctx.globalAlpha=0.2;poly([C,B,[B[0]+h*0.55,B[1]+h*0.12],[C[0]+h*0.55,C[1]+h*0.12]],'#000');ctx.globalAlpha=1}
  poly([D,C,up(C),up(D)],shade(col,0.78));poly([C,B,up(B),up(C)],shade(col,0.58));poly([A,B,C,D].map(up),opt.top||shade(col,1.1));
  if(opt.win&&Q===2){const rows=Math.max(1,Math.floor(h/opt.win)),wc=opt.wc||'rgba(254,240,138,.85)';
    const face=(P0,P1,cols)=>{for(let r=0;r<rows;r++)for(let k=0;k<cols;k++){const u0=(k+0.25)/cols,u1=(k+0.75)/cols,v0=h*(r+0.3)/rows+2,v1=h*(r+0.75)/rows+2;
      const lit=((gx*7+gy*3+r*5+k*11)%5)>1;
      poly([[P0[0]+(P1[0]-P0[0])*u0,P0[1]+(P1[1]-P0[1])*u0-v0],[P0[0]+(P1[0]-P0[0])*u1,P0[1]+(P1[1]-P0[1])*u1-v0],[P0[0]+(P1[0]-P0[0])*u1,P0[1]+(P1[1]-P0[1])*u1-v1],[P0[0]+(P1[0]-P0[0])*u0,P0[1]+(P1[1]-P0[1])*u0-v1]],lit?wc:'rgba(30,41,59,.55)')}};
    face(D,C,Math.max(1,Math.round(d*3)));face(C,B,Math.max(1,Math.round(w*3)))}
  else if(opt.win&&Q===1){ctx.strokeStyle=opt.wc||'rgba(254,240,138,.55)';ctx.lineWidth=1.2;const rows=Math.max(1,Math.floor(h/opt.win));ctx.beginPath();
    for(let r=0;r<rows;r++){const v=h*(r+0.55)/rows;ctx.moveTo(D[0]+(C[0]-D[0])*0.12,D[1]+(C[1]-D[1])*0.12-v);ctx.lineTo(D[0]+(C[0]-D[0])*0.88,D[1]+(C[1]-D[1])*0.88-v);ctx.moveTo(C[0]+(B[0]-C[0])*0.12,C[1]+(B[1]-C[1])*0.12-v);ctx.lineTo(C[0]+(B[0]-C[0])*0.88,C[1]+(B[1]-C[1])*0.88-v)}ctx.stroke()}
  return{A:up(A),B:up(B),C:up(C),D:up(D)}}
function diamond(x,y,w,d,fill,stroke){poly([iso(x,y),iso(x+w,y),iso(x+w,y+d),iso(x,y+d)],fill,stroke)}
const HCOL=['#cbd5e1','#e2c9a8','#a5b4fc','#99f6e4','#fda4af','#d6d3d1'],GRASS=['#4f9a4a','#57a352','#4b9446','#5aa856'];
function drawTile(city,x,y){const i=idx(x,y),t=city.t[i];const [ix,iy]=iso(x,y);const pts=[[ix,iy],[ix+32,iy+16],[ix,iy+32],[ix-32,iy+16]];
  if(t===1){poly(pts,(x*3+y*5)%4?'#2563eb':'#2f6fe4');return}
  if(t===5){poly(pts,'#2563eb');poly(pts.map(p=>[p[0],p[1]-4]),'#78716c');return}
  if(t===2){poly(pts,'#3f3f46');if(Q>0)roadMarks(city,x,y,ix,iy);return}
  if(t===4){poly(pts,'#d9c48f');return}
  poly(pts,city.house[i]?'#9ca3af':GRASS[(x*7+y*13)%4])}
function roadMarks(city,x,y,ix,iy){const r=(a,b)=>{const xx=x+a,yy=y+b;return xx>=0&&yy>=0&&xx<W&&yy<H&&(city.t[idx(xx,yy)]===2||city.t[idx(xx,yy)]===5)};
  const hx=r(1,0)||r(-1,0),hy=r(0,1)||r(0,-1);if(hx===hy)return;ctx.strokeStyle='rgba(250,204,21,.6)';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();
  if(hx){ctx.moveTo(ix-24,iy+12);ctx.lineTo(ix+24,iy+20)}else{ctx.moveTo(ix+24,iy+12);ctx.lineTo(ix-24,iy+20)}ctx.stroke();ctx.setLineDash([])}
function drawTree(x,y,k){const [cx,cy]=iso(x+0.5,y+0.5);
  for(let j=0;j<(Q===0?1:k);j++){const px=cx+((j*17+x*5)%3-1)*9,py=cy+((j*11+y*3)%3-1)*4+2;
    ctx.fillStyle='#6b4423';ctx.fillRect(px-1.2,py-8,2.4,8);ctx.fillStyle=(x+y+j)%2?'#2f7d32':'#277029';ctx.beginPath();ctx.arc(px,py-14,8,0,7);ctx.fill();
    if(Q>0){ctx.fillStyle='rgba(134,239,172,.35)';ctx.beginPath();ctx.arc(px-3,py-17,3.5,0,7);ctx.fill()}}}
function drawHouse(x,y,h){const col=HCOL[h.c];
  if(h.tower){box(x+0.12,y+0.12,0.76,0.76,h.h,col,{win:10,top:shade(col,1.2)});return}
  const r=box(x+0.18,y+0.18,0.64,0.64,h.h,col,{win:9});const roof=['#b91c1c','#7c2d12','#334155','#065f46'][h.c%4];
  const m1=[(r.A[0]+r.B[0])/2,(r.A[1]+r.B[1])/2-8],m2=[(r.D[0]+r.C[0])/2,(r.D[1]+r.C[1])/2-8];
  poly([r.D,r.C,m2],shade(roof,0.8));poly([r.C,r.B,m1,m2],shade(roof,0.6));poly([r.A,r.D,m2,m1],roof)}
function ownerBase(b,col){ctx.lineWidth=2.5;diamond(b.x+0.06,b.y+0.06,1.88,1.88,null,col)}
function awning(x1,y1,x2,y2,n,hh){const p1=iso(x1,y1),p2=iso(x2,y2);for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,a=[p1[0]+(p2[0]-p1[0])*u0,p1[1]+(p2[1]-p1[1])*u0-hh],e=[p1[0]+(p2[0]-p1[0])*u1,p1[1]+(p2[1]-p1[1])*u1-hh];poly([a,e,[e[0],e[1]+6],[a[0],a[1]+6]],k%2?'#fff':'#ef4444')}}
function drawBuilding(b){
  const col=G.cos[b.o].col,x=b.x,y=b.y,lh=b.lv*6;
  if(b.type==='farm'){const pc=b.prod?P[b.prod].col:'#a3a3a3',past=pc==='pasture';diamond(x+0.08,y+0.08,1.84,1.84,past?'#7cb55f':'#8b6b3d');
    if(b.prod&&!past){ctx.strokeStyle=pc;ctx.lineWidth=3;ctx.beginPath();for(let k=1;k<8;k++){const a=iso(x+0.15,y+0.1+k*0.23),e=iso(x+1.3,y+0.1+k*0.23);ctx.moveTo(a[0],a[1]);ctx.lineTo(e[0],e[1])}ctx.stroke()}
    if(past){ctx.fillStyle=b.prod==='hide'?'#78350f':'#fff';for(let k=0;k<5;k++){const [px,py]=iso(x+0.3+((k*37)%10)/10,y+0.4+((k*53)%12)/10);ctx.fillRect(px-4,py-5,8,4)}}
    ownerBase(b,col);const r=box(x+1.3,y+0.15,0.55,0.75,18+lh,'#b91c1c');poly([r.A,r.B,r.C,r.D],'#f5f5f4')}
  else if(b.type==='forest'){diamond(x+0.08,y+0.08,1.84,1.84,'#3f7d3a');ownerBase(b,col);for(let a=0;a<3;a++)for(let k=0;k<3;k++)if(!(a===2&&k===2))drawTree(x+a*0.6,y+k*0.6,1);box(x+1.4,y+1.4,0.45,0.45,12+lh,'#92400e')}
  else if(b.type==='mine'){const pc=b.prod?P[b.prod].col:'#8a6a55';diamond(x+0.08,y+0.08,1.84,1.84,'#8a6a55');ownerBase(b,col);
    const [px,py]=iso(x+0.6,y+1.3);ctx.fillStyle=pc;ctx.beginPath();ctx.moveTo(px-20,py);ctx.lineTo(px,py-18);ctx.lineTo(px+20,py);ctx.fill();
    box(x+1.1,y+0.3,0.6,0.6,30+lh,b.prod==='crude'?'#1f2937':'#475569',{win:12,wc:'rgba(251,191,36,.7)'})}
  else if(b.type==='factory'){diamond(x+0.08,y+0.08,1.84,1.84,'#52525b');ownerBase(b,col);
    const h=30+lh;box(x+0.2,y+0.35,1.6,1.4,h,'#64748b',{win:14,wc:'rgba(125,211,252,.75)'});
    for(let k=0;k<4;k++){const a=iso(x+0.2+k*0.4,y+0.35),e=iso(x+0.6+k*0.4,y+0.35),cc=iso(x+0.6+k*0.4,y+1.75),dd=iso(x+0.2+k*0.4,y+1.75);
      poly([[a[0],a[1]-h-9],[e[0],e[1]-h],[cc[0],cc[1]-h],[dd[0],dd[1]-h-9]],k%2?'#94a3b8':'#cbd5e1')}
    box(x+0.25,y+0.12,0.22,0.22,h+34,'#9a3412',{top:'#451a03',ns:1});box(x+1.3,y+1.55,0.4,0.25,10,col,{ns:1})}
  else if(b.type==='mini'){diamond(x+0.08,y+0.08,1.84,1.84,'#a8a29e');ownerBase(b,col);
    const r=box(x+0.55,y+0.55,1.0,1.0,16+lh,col,{win:10,wc:'rgba(255,255,255,.8)'});awning(x+0.55,y+1.6,x+1.55,y+1.6,4,10);poly([r.A,r.B,r.C,r.D],shade(col,1.3))}
  else if(b.type==='store'){diamond(x+0.08,y+0.08,1.84,1.84,'#a8a29e');ownerBase(b,col);
    const r=box(x+0.25,y+0.25,1.5,1.5,22+lh*1.5,col,{win:12,wc:'rgba(255,255,255,.8)'});awning(x+0.25,y+1.85,x+1.75,y+1.85,6,12);awning(x+1.85,y+1.75,x+1.85,y+0.25,6,12);poly([r.A,r.B,r.C,r.D],shade(col,1.3))}
  else if(b.type==='market'){diamond(x+0.04,y+0.04,1.92,1.92,'#52525b');ownerBase(b,col);
    ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();for(let k=0;k<5;k++){const a=iso(x+0.15+k*0.35,y+1.55),e=iso(x+0.15+k*0.35,y+1.9);ctx.moveTo(a[0],a[1]);ctx.lineTo(e[0],e[1])}ctx.stroke();
    const r=box(x+0.15,y+0.15,1.7,1.3,20+lh,'#f8fafc',{top:shade(col,1.2)});const s=box(x+0.6,y+1.4,0.8,0.08,26+lh,col,{ns:1});
    awning(x+0.15,y+1.45,x+1.85,y+1.45,8,12)}
  else if(b.type==='lab'){diamond(x+0.08,y+0.08,1.84,1.84,'#cbd5e1');ownerBase(b,col);box(x+0.3,y+0.3,1.4,1.4,20,'#e2e8f0',{win:10});
    const r=box(x+0.55,y+0.55,0.9,0.9,62+lh*2,'#0ea5e9',{win:8,wc:'rgba(224,242,254,.9)',top:'#7dd3fc'});const t=[(r.A[0]+r.C[0])/2,(r.A[1]+r.C[1])/2];ctx.fillStyle='#e0f2fe';ctx.beginPath();ctx.ellipse(t[0],t[1]-4,9,5,0,0,7);ctx.fill()}
  else if(b.type==='net'){diamond(x+0.08,y+0.08,1.84,1.84,'#86efac');ownerBase(b,col);
    box(x+0.2,y+0.25,1.6,1.0,26+lh,'#1e293b',{win:9,wc:'rgba(103,232,249,.85)',top:'#334155'});box(x+0.3,y+1.3,1.0,0.5,14+lh,col,{win:8,wc:'rgba(255,255,255,.8)'});
    const [lx,ly]=iso(x+1,y+0.75);ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(lx,ly-32-lh,10,5,0,0,7);ctx.fill()}
  else if(b.type==='wh'){diamond(x+0.04,y+0.04,1.92,1.92,'#57534e');ownerBase(b,col);
    const h=18+lh;box(x+0.15,y+0.15,1.7,1.3,h,'#a8a29e',{top:shade(col,0.95)});
    for(let k=0;k<4;k++){const a=iso(x+0.25+k*0.4,y+1.45),e=iso(x+0.55+k*0.4,y+1.45);poly([a,e,[e[0],e[1]-12],[a[0],a[1]-12]],'#44403c')}
    box(x+0.3,y+1.55,0.45,0.3,8,'#f8fafc',{ns:1});box(x+0.3,y+1.55,0.18,0.3,9,col,{ns:1});box(x+1.15,y+1.6,0.45,0.28,8,'#f8fafc',{ns:1})}
  else if(b.type==='dc'){diamond(x+0.08,y+0.08,1.84,1.84,'#475569');ownerBase(b,col);
    box(x+0.15,y+0.3,1.7,1.4,16+lh,'#334155',{win:6,wc:'rgba(74,222,128,.9)',top:'#64748b'});
    for(let k=0;k<3;k++){const [px,py]=iso(x+0.45+k*0.5,y+0.65);ctx.fillStyle='#1e293b';ctx.beginPath();ctx.ellipse(px,py-16-lh,7,3.5,0,0,7);ctx.fill()}}
  else if(b.type==='land'){diamond(x+0.08,y+0.08,1.84,1.84,'#a8875a');ctx.setLineDash([5,4]);ctx.lineWidth=2;diamond(x+0.12,y+0.12,1.76,1.76,null,col);ctx.setLineDash([]);
    const [px,py]=iso(x+1,y+1);ctx.fillStyle='#78350f';ctx.fillRect(px-1,py-22,2,22);ctx.fillStyle=col;ctx.fillRect(px-10,py-30,20,11)}
  else if(b.type==='apt'){diamond(x+0.08,y+0.08,1.84,1.84,'#9ca3af');ownerBase(b,col);
    const h=60+b.lv*16;box(x+0.4,y+0.4,1.2,1.2,h,'#e7e5e4',{win:8,wc:'rgba(253,224,71,.85)',top:shade(col,1.1)});box(x+0.4,y+0.4,1.2,1.2,6,col,{ns:1})}
  else if(b.type==='office'){diamond(x+0.08,y+0.08,1.84,1.84,'#94a3b8');ownerBase(b,col);
    const h=80+b.lv*20;box(x+0.45,y+0.45,1.1,1.1,h,'#1e3a5f',{win:7,wc:'rgba(125,211,252,.9)',top:shade(col,1.0)});
    const [tx,ty]=iso(x+1,y+1);ctx.fillStyle=col;ctx.fillRect(tx-2,ty-h-26,4,14)}
}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
const CB={ox:H*TW/2,oy:300,w:(W+H)*TW/2,h:(W+H)*TH/2+320};
const cache={cv:document.createElement('canvas'),cs:0,city:-1,q:-1};let lastZoomT=0;
function wantCS(){const mx=(MOBILE?[0.5,0.75,1.0]:[0.6,0.9,1.25])[Q];return clamp(Math.round(dpr*cam.z*4)/4,0.35,mx)}
function rebuildCache(){
  const city=CUR(),cs=wantCS(),cc=cache.cv;cc.width=Math.ceil(CB.w*cs);cc.height=Math.ceil(CB.h*cs);
  const g=cc.getContext('2d');ctx=g;g.setTransform(cs,0,0,cs,CB.ox*cs,CB.oy*cs);
  poly([iso(0,0),iso(W,0),iso(W,H),iso(0,H)].map(p=>[p[0],p[1]+8]),'#1e3a2a');
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)drawTile(city,x,y);
  const ds=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=idx(x,y);if(city.house[i])ds.push({d:x+y+2,x,k:0,i});else if(city.tree[i]&&city.occ[i]<0)ds.push({d:x+y+1.5,x,k:1,i})}
  for(const b of G.b)if(b.c===city.id)ds.push({d:b.x+b.y+4,x:b.x,k:2,b});
  ds.sort((a,b)=>a.d-b.d||a.x-b.x);
  for(const o of ds){if(o.k===0)drawHouse(o.i%W,(o.i/W)|0,city.house[o.i]);else if(o.k===1)drawTree(o.i%W,(o.i/W)|0,city.tree[o.i]);else drawBuilding(o.b)}
  ctx=mainCtx;cache.cs=cs;cache.city=city.id;cache.q=Q;city.dirty=false;miniDirty=true;
}
const LBLH={wh:40,lab:110,factory:80,net:66,dc:46,land:44,mini:48,market:58,apt:0,office:0};
function drawLabel(b){
  const col=G.cos[b.o].col,lh=b.lv*6;const [lx,ly]=iso(b.x+1,b.y+1);
  const hh=b.type==='apt'?80+b.lv*16:b.type==='office'?120+b.lv*20:(LBLH[b.type]||62)+lh;const yy=ly-hh;
  const icons=isRetail(b)?(b.slots.map(s=>P[s.p].ic).join('')||BT[b.type].ic):b.type==='dc'||isRE(b)?BT[b.type].ic:(b.prod?ic(b.prod):BT[b.type].ic);
  ctx.font='12px "Segoe UI Emoji","Apple Color Emoji",sans-serif';const tw=[...icons].length*8+14;
  ctx.fillStyle='rgba(15,23,42,.85)';rr(ctx,lx-tw/2,yy-10,tw,20,10);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(icons,lx,yy+1);
  {const co=G.cos[b.o],lxx=lx-tw/2-11;ctx.fillStyle=col;if(co.id%2){ctx.beginPath();ctx.arc(lxx,yy,9,0,7);ctx.fill()}else{rr(ctx,lxx-9,yy-9,18,18,4);ctx.fill()}ctx.fillStyle='#fff';ctx.font='bold 11px "PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(logoCh(co),lxx,yy+1)}
  if(b.lv>1){ctx.fillStyle=col;ctx.font='bold 10px sans-serif';ctx.fillText('★'+b.lv,lx+tw/2+9,yy)}
  if(b.o!==0&&(warH(b.o,0)||warH(0,b.o))){ctx.font='13px "Segoe UI Emoji","Apple Color Emoji",sans-serif';ctx.fillText('⚔️',lx+tw/2+(b.lv>1?24:10),yy)}
  if(b.o===0&&((isRetail(b)&&!b.slots.length)||(['farm','forest','mine','factory','lab','net'].includes(b.type)&&!b.prod))){ctx.fillStyle='#fbbf24';ctx.font='bold 14px sans-serif';ctx.fillText('⚠',lx,yy-18)}}
function mkSmoke(b){const [x,y]=iso(b.x+0.36,b.y+0.23);return{x,y:y-64-b.lv*6,vx:0.15+rnd()*0.2,vy:-0.35-rnd()*0.2,r:3+rnd()*2,life:1}}
const isRoad=(city,x,y)=>x>=0&&y>=0&&x<W&&y<H&&(city.t[idx(x,y)]===2||city.t[idx(x,y)]===5);
function spawnCars(){cars=[];const city=CUR(),roads=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(isRoad(city,x,y))roads.push([x,y]);
  const CC=['#f8fafc','#ef4444','#3b82f6','#facc15','#111827','#22c55e','#f97316'],n=[0,35,80][Q];
  for(let k=0;k<n;k++){const [x,y]=pick(roads);cars.push({x,y,tx:x,ty:y,p:1,dir:[1,0],col:CC[k%7],sp:0.6+rnd()*0.8})}}
function stepCars(dt){const city=CUR();for(const c of cars){c.p+=dt*c.sp;if(c.p>=1){c.x=c.tx;c.y=c.ty;c.p=0;
  const o=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>isRoad(city,c.x+d[0],c.y+d[1])&&!(d[0]===-c.dir[0]&&d[1]===-c.dir[1]));
  const d=o.find(v=>v[0]===c.dir[0]&&v[1]===c.dir[1]&&rnd()<0.75)||pick(o.length?o:[[-c.dir[0],-c.dir[1]]]);c.dir=d;c.tx=c.x+d[0];c.ty=c.y+d[1]}}}
function drawCar(c){const fx=c.x+(c.tx-c.x)*c.p,fy=c.y+(c.ty-c.y)*c.p,l=0.18;const ox=c.dir[1]?(c.dir[1]>0?-l:l):0,oy=c.dir[0]?(c.dir[0]>0?l:-l):0;
  const w=c.dir[0]?0.34:0.2,d=c.dir[0]?0.2:0.34;box(fx+0.5+ox-w/2,fy+0.5+oy-d/2,w,d,5,c.col,{ns:1})}
let T=0,heat=0,trucks=[];
let FX={night:true,season:true,sound:true,music:false};try{Object.assign(FX,JSON.parse(localStorage.getItem('cel-fx')||'{}'))}catch(e){}
const saveFX=()=>{try{localStorage.setItem('cel-fx',JSON.stringify(FX))}catch(e){}};
function seasonTint(){const mo=new Date(G.date).getUTCMonth();return mo<=1||mo===11?'rgba(219,234,254,.16)':mo<=4?'rgba(187,247,208,.07)':mo<=7?'rgba(0,0,0,0)':'rgba(251,146,60,.10)'}
function nightAmt(){const ph=(T%150)/150;const v=Math.cos(ph*Math.PI*2);return clamp(-v*0.6+0.05,0,0.42)}
function drawScaffold(b){const age=G.day-(b.bt??-99);if(age<0||age>=25)return;const p=age/25,[cx,cy]=iso(b.x+1,b.y+1);const h=70*(1-p)+20;
  ctx.strokeStyle='rgba(251,191,36,.9)';ctx.lineWidth=1.5;for(let k=0;k<4;k++){const yy=cy-k*h/4;ctx.beginPath();ctx.moveTo(cx-40,yy);ctx.lineTo(cx,yy-20);ctx.lineTo(cx+40,yy);ctx.stroke()}
  ctx.beginPath();ctx.moveTo(cx+30,cy);ctx.lineTo(cx+30,cy-h-40);ctx.lineTo(cx-20,cy-h-40);ctx.stroke();const sw=Math.sin(T*2)*6;ctx.beginPath();ctx.moveTo(cx-10+sw,cy-h-40);ctx.lineTo(cx-10+sw,cy-h-10);ctx.stroke();
  ctx.fillStyle='rgba(15,23,42,.85)';rr(ctx,cx-26,cy+6,52,8,3);ctx.fill();ctx.fillStyle='#fbbf24';rr(ctx,cx-25,cy+7,50*p,6,3);ctx.fill()}
function spawnTrucks(){const city=CUR();if(Q===0){trucks=[];return}const src=G.b.filter(b=>b.c===city.id&&(b.type==='factory'||b.type==='wh'||b.type==='farm'||b.type==='mine'||b.type==='forest'));
  while(trucks.length<Math.min([0,10,24][Q],src.length*3)){const a=pick(src),ds=G.b.filter(b=>b.c===city.id&&b.o===a.o&&b!==a&&(isRetail(b)||b.type==='factory'||b.type==='wh'));if(!ds.length)break;const d=pick(ds);
    trucks.push({o:a.o,x0:a.x+1,y0:a.y+1,x1:d.x+1,y1:d.y+1,p:0,sp:0.12+rnd()*0.08})}}
function stepTrucks(dt){for(const t of trucks)t.p+=dt*t.sp;trucks=trucks.filter(t=>t.p<2);if(rnd()<0.05)spawnTrucks()}
function drawTruck(t){const q=t.p<1?t.p:2-t.p,mid={x:t.x1,y:t.y0};let x,y,horiz;if(q<0.5){const k=q*2;x=t.x0+(mid.x-t.x0)*k;y=t.y0;horiz=true}else{const k=(q-0.5)*2;x=mid.x;y=t.y0+(t.y1-t.y0)*k;horiz=false}
  const col=G.cos[t.o]?G.cos[t.o].col:'#fff';const w=horiz?0.5:0.28,d=horiz?0.28:0.5;box(x-w/2,y-d/2,w,d,9,'#e5e7eb',{ns:1});box(x-w/2+(horiz?0.3:0),y-d/2+(horiz?0:0.3),horiz?0.18:0.28,horiz?0.28:0.18,7,col,{ns:1})}
// ===== 音效 =====
let AC=null,musicT=null;
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
addEventListener('pointerdown',()=>{if(FX.sound||FX.music)ac();if(FX.music&&!musicT)startMusic()},{once:false,passive:true});
function tone(f,d,type,vol,when){const a=ac();if(!a)return;const o=a.createOscillator(),g=a.createGain(),t0=a.currentTime+(when||0);o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(vol||0.08,t0+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t0+d);o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+d+0.05)}
let lastSfx=0;function sfx(k){if(!FX.sound)return;const n=performance.now();if(k==='coin'&&n-lastSfx<700)return;if(k==='coin')lastSfx=n;
  if(k==='coin'){tone(1318,0.12,'triangle',0.05);tone(1760,0.18,'triangle',0.05,0.07)}else if(k==='build'){tone(196,0.15,'square',0.05);tone(262,0.2,'square',0.04,0.12)}
  else if(k==='alert'){tone(660,0.15,'sawtooth',0.04);tone(440,0.25,'sawtooth',0.04,0.16)}else if(k==='good'){[523,659,784].forEach((f,i)=>tone(f,0.25,'sine',0.06,i*0.1))}else if(k==='click')tone(880,0.05,'sine',0.03)}
const CHORDS=[[261.6,329.6,392],[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7]];
function startMusic(){if(musicT)return;let i=0;const play=()=>{if(!FX.music){musicT=null;return}const a=ac();if(!a)return;const ch=CHORDS[i%4];ch.forEach((f,k)=>tone(f/2,3.6,'sine',0.018,k*0.04));tone(ch[(i*7)%3]*2,0.8,'triangle',0.012,1.2);tone(ch[(i*5+1)%3]*2,0.8,'triangle',0.012,2.4);i++;musicT=setTimeout(play,3800)};play()}
document.querySelectorAll('#heat button').forEach(b=>b.onclick=()=>{heat=+b.dataset.h;document.querySelectorAll('#heat button').forEach(x=>x.classList.toggle('on',x===b))});
let heatC={k:''};
function drawHeat(city){ensureGrid(city);const key=city.id+'_'+heat+'_'+G.day+'_'+city.dens.length;if(heatC.k!==key||heatC.d!==city.dens){const v=new Float32Array(W*H);let mx=0;
    for(let i=0;i<W*H;i++){const x=i%W,y=(i/W)|0;v[i]=heat===1?city.resd[i]:landPrice(city,x-1,y-1);mx=Math.max(mx,v[i])}for(let i=0;i<W*H;i++)v[i]=heat===1?Math.min(1,v[i]/1.2):v[i]/Math.max(1,mx);heatC={k:key,d:city.dens,v}}
  const [x0,y0]=toGrid(0,0),[x1,y1]=toGrid(VW,VH),[x2,y2]=toGrid(VW,0),[x3,y3]=toGrid(0,VH);
  const gx0=Math.max(0,Math.floor(Math.min(x0,x1,x2,x3))),gx1=Math.min(W-1,Math.ceil(Math.max(x0,x1,x2,x3))),gy0=Math.max(0,Math.floor(Math.min(y0,y1,y2,y3))),gy1=Math.min(H-1,Math.ceil(Math.max(y0,y1,y2,y3)));
  for(let y=gy0;y<=gy1;y++)for(let x=gx0;x<=gx1;x++){const v=heatC.v[y*W+x];if(v<0.03)continue;
    const hue=heat===1?200-v*200:120-v*120;ctx.fillStyle=`hsla(${hue},90%,55%,${0.15+v*0.45})`;const [ix,iy]=iso(x,y);ctx.beginPath();ctx.moveTo(ix,iy);ctx.lineTo(ix+32,iy+16);ctx.lineTo(ix,iy+32);ctx.lineTo(ix-32,iy+16);ctx.fill()}}
function render(){
  ctx=mainCtx;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0f2236';ctx.fillRect(0,0,cv.width,cv.height);if(!G)return;
  const city=CUR();
  if(city.dirty||cache.city!==city.id||cache.q!==Q||(Math.abs(wantCS()-cache.cs)>=0.25&&performance.now()-lastZoomT>300))rebuildCache();
  ctx.setTransform(dpr*cam.z,0,0,dpr*cam.z,dpr*cam.x,dpr*cam.y);
  ctx.drawImage(cache.cv,-CB.ox,-CB.oy,CB.w,CB.h);
  if(FX.season)(()=>{const t2=seasonTint();if(t2!=='rgba(0,0,0,0)'){ctx.fillStyle=t2;poly([iso(0,0),iso(W,0),iso(W,H),iso(0,H)],t2)}})();
  if(heat)drawHeat(city);
  for(const a of G.auctions)if(a.c===city.id){ctx.setLineDash([6,5]);ctx.lineWidth=2;diamond(a.x+0.1,a.y+0.1,1.8,1.8,'rgba(251,191,36,.18)','#fbbf24');ctx.setLineDash([])}
  if(sel&&sel.c===city.id){ctx.lineWidth=3;diamond(sel.x-0.05,sel.y-0.05,2.1,2.1,'rgba(56,189,248,.15)','#7dd3fc')}
  if(buildMode&&hover){const ld=lotDemo(city,hover.x,hover.y),ok=!!ld,dm=ld&&ld.hs.length;diamond(hover.x,hover.y,2,2,!ok?'rgba(244,63,94,.45)':dm?'rgba(251,146,60,.5)':'rgba(34,197,94,.45)',!ok?'#fb7185':dm?'#fb923c':'#4ade80')}
  if(selH&&selH.c===city.id){ctx.lineWidth=3;diamond(selH.i%W-0.05,((selH.i/W)|0)-0.05,1.1,1.1,'rgba(251,146,60,.2)','#fb923c')}
  const vis=(gx,gy,pad)=>{const [ix,iy]=iso(gx,gy);const sx=ix*cam.z+cam.x,sy=iy*cam.z+cam.y;return sx>-pad&&sx<VW+pad&&sy>-pad&&sy<VH+pad};
  if(cam.z>0.45)for(const c of cars)if(vis(c.x,c.y,30))drawCar(c);
  if(cam.z>0.4)for(const t of trucks)drawTruck(t);
  for(const b of G.b)if(b.c===city.id&&G.day-(b.bt??-99)<25&&vis(b.x+1,b.y+1,150))drawScaffold(b);
  for(const s of smoke){ctx.fillStyle=`rgba(226,232,240,${s.life*0.45})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill()}
  if(cam.z>0.5)for(const b of G.b)if(b.c===city.id&&vis(b.x+1,b.y+1,200))drawLabel(b);
  ctx.textAlign='center';ctx.font='bold 13px sans-serif';
  for(const f of floats){const [x,y]=iso(f.x,f.y);ctx.globalAlpha=Math.min(1,f.life*1.5);ctx.fillStyle='#4ade80';ctx.fillText(f.t,x,y-75-(1-f.life)*40)}ctx.globalAlpha=1;
  if(FX.night&&Q>0){const na=nightAmt();if(na>0.02){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(8,12,40,${na})`;ctx.fillRect(0,0,cv.width,cv.height);ctx.setTransform(dpr*cam.z,0,0,dpr*cam.z,dpr*cam.x,dpr*cam.y);
    if(na>0.2&&cam.z>0.45){ctx.globalCompositeOperation='lighter';for(const b of G.b){if(b.c!==city.id||!vis(b.x+1,b.y+1,100))continue;const [lx,ly]=iso(b.x+1,b.y+1);const g=ctx.createRadialGradient(lx,ly-10,2,lx,ly-10,46);g.addColorStop(0,`rgba(253,224,71,${(na-0.15)*0.9})`);g.addColorStop(1,'rgba(253,224,71,0)');ctx.fillStyle=g;ctx.fillRect(lx-46,ly-56,92,92)}ctx.globalCompositeOperation='source-over'}}}
}
let miniDirty=true;const miniBase=document.createElement('canvas');miniBase.width=160;miniBase.height=90;
const MS=1.2,MOX=80,MOY=5;
function drawMini(){const m=$('#mini'),c=m.getContext('2d'),city=CUR();
  if(miniDirty){const g=miniBase.getContext('2d');g.clearRect(0,0,160,90);
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=idx(x,y),t=city.t[i];let col=t===1||t===5?'#2563eb':t===2?'#52525b':t===4?'#d9c48f':city.house[i]?'#94a3b8':city.tree[i]?'#2f6b2b':'#4f9a4a';
      const o=city.occ[i];if(o>=0){const b=bById(o);if(b)col=G.cos[b.o].col}g.fillStyle=col;g.fillRect(MOX+(x-y)*MS,MOY+(x+y)*MS*0.5,MS*1.5,MS*0.9)}miniDirty=false}
  c.clearRect(0,0,160,90);c.drawImage(miniBase,0,0);
  const cs=[[0,0],[VW,0],[VW,VH],[0,VH]].map(([a,b])=>toGrid(a,b));c.strokeStyle='#fff';c.beginPath();cs.forEach(([gx,gy],k)=>{const px=MOX+(gx-gy)*MS,py=MOY+(gx+gy)*MS*0.5;k?c.lineTo(px,py):c.moveTo(px,py)});c.closePath();c.stroke()}
$('#mini').addEventListener('click',e=>{const r=e.target.getBoundingClientRect();const mx=(e.clientX-r.left)*160/r.width,my=(e.clientY-r.top)*90/r.height;
  const a=(mx-MOX)/MS,b=(my-MOY)/(MS*0.5),gx=(a+b)/2,gy=(b-a)/2;const [ix,iy]=iso(gx,gy);cam.x=VW/2-ix*cam.z;cam.y=VH/2-iy*cam.z});

