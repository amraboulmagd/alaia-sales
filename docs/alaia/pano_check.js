const { launch, open, sleep } = require('./lib');
(async()=>{ const b=await launch(); const out=[];
 for (const [W,H] of [[1920,1080],[390,844]]) { const touch=W<1000;
  const {page,ctx,errors}=await open(b,{w:W,h:H,touch,path:'?pano=1'});
  await page.goto(require('./lib').BASE+'?pano=1',{waitUntil:'load'}); await sleep(1500);
  await page.evaluate(()=>window.__alaia.closeFilm&&window.__alaia.closeFilm('master')); await sleep(1200);
  await page.evaluate(()=>window.__alaia.go('unit',{u:window.__alaia.ALLU.find(x=>x.code==='T06-A-202')})); await sleep(1500);
  await page.evaluate(()=>{ const e=[...document.querySelectorAll('#dh-in')].pop(); e&&e.click(); }); await sleep(3000);
  const K=()=>page.evaluate(()=>({pano:window.__alaiaK.wk.pano, x:+window.__alaiaK.wk.x.toFixed(0), z:+window.__alaiaK.wk.z.toFixed(2)}));
  const s0=await K();
  // drag a long way left: must keep wrapping (never stop at an edge)
  const y=H*0.45; const xs=[];
  if(touch){ const cdp=await ctx.newCDPSession(page); const T=(t,p)=>cdp.send('Input.dispatchTouchEvent',{type:t,touchPoints:p.map((q,i)=>({x:q[0],y:q[1],id:i}))});
    for(let r=0;r<6;r++){ await T('touchStart',[[W*0.9,y]]); for(let k=1;k<=20;k++){ await T('touchMove',[[W*0.9-k*W*0.04,y]]); await sleep(12);} await T('touchEnd',[]); await sleep(300); xs.push((await K()).x); } }
  else { for(let r=0;r<6;r++){ await page.mouse.move(W*0.9,y); await page.mouse.down(); for(let k=1;k<=20;k++){ await page.mouse.move(W*0.9-k*W*0.04,y); await sleep(12);} await page.mouse.up(); await sleep(300); xs.push((await K()).x); } }
  // zoom out with the button
  for(let k=0;k<3;k++){ await page.evaluate(()=>document.querySelector('#wk-zo').click()); await sleep(300); }
  const s1=await K();
  await page.screenshot({path:`C:/Users/amrab/AppData/Local/Temp/claude/0c1797f587dd6ffe/35b7f4de-144a-446d-a774-4f3525a284c3/scratchpad/pano_${W}.png`});
  out.push({vp:`${W}x${H}`, start:s0, xsAfterDrags:xs, zoomOut:s1.z, errors:errors.filter(e=>!/404|Failed to load/.test(e))}); await page.close(); }
 console.log(JSON.stringify(out)); await b.close(); })();
