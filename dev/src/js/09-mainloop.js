/* ================= 主循环 ================= */
const SPD=[0,1,4,12];let lastT=performance.now(),lastFrame=0,lastUI=0,lastPanel=0,lastMini=0,uiDirty=false;
function loop(t){requestAnimationFrame(loop);
  const fps=[24,30,60][Q];if(t-lastFrame<1000/fps-2)return;lastFrame=t;
  const dt=Math.min(0.15,(t-lastT)/1000);lastT=t;T+=dt;
  if(G&&!G.over){acc+=dt*SPD[speed];let n=0;while(acc>=1&&n<20){acc-=1;simDay();n++;uiDirty=true}
    if(cars.length)stepCars(dt*(speed?1:0.3));stepTrucks(dt*(speed?1:0.2));
    for(const s of smoke){s.x+=s.vx;s.y+=s.vy;s.r+=0.05;s.life-=dt*0.5}if(smoke.length)smoke=smoke.filter(s=>s.life>0).slice(-120);
    for(const f of floats)f.life-=dt*0.7;if(floats.length)floats=floats.filter(f=>f.life>0).slice(-20);
    if(uiDirty&&t-lastUI>250){lastUI=t;topUI();uiDirty=false}
    if(t-lastPanel>1000){lastPanel=t;panelRefresh()}
    if(t-lastMini>400){lastMini=t;drawMini()}}
  render()}

