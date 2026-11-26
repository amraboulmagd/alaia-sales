// smooth master-plan drag: per-frame response while dragging, glide settles on an angle, pills come back
const { launch, open, sleep } = require('./lib');
const [W,H]=(process.argv[2]||'1920x1080').split('x').map(Number); const touch=W<1000;
(async()=>{ const b=await launch(); const {page,ctx,errors}=await open(b,{w:W,h:H,touch});
 await page.evaluate(()=>window.__alaia.closeFilm&&window.__alaia.closeFilm('master')); await sleep(3000);
 const st=()=>page.evaluate(()=>window.__orbState());
 const s0=await st();
 await page.evaluate(()=>{ window.__fr=[]; const c=document.querySelector('.orb-cv'); let last=null, lt=performance.now(); const f=t=>{ const d=c.toDataURL?null:null; window.__fr.push(t-lt); lt=t; if(window.__on) requestAnimationFrame(f); }; window.__on=true; requestAnimationFrame(f); });
 const y=H*0.55, x0=W*0.7; const N=40; const changes=[];
 if(touch){ const cdp=await ctx.newCDPSession(page); const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((p,i)=>({x:p[0],y:p[1],id:i}))});
   await T('touchStart',[[x0,y]]); for(let k=1;k<=N;k++){ await T('touchMove',[[x0-k*W*0.012,y]]); await sleep(16); if(k%8===0) changes.push(await page.evaluate(()=>document.querySelector('.orb-cv').classList.contains('on'))); } await T('touchEnd',[]); }
 else { await page.mouse.move(x0,y); await page.mouse.down(); for(let k=1;k<=N;k++){ await page.mouse.move(x0-k*W*0.012,y); await sleep(16); if(k%8===0) changes.push(await page.evaluate(()=>document.querySelector('.orb-cv').classList.contains('on'))); } await page.mouse.up(); }
 await sleep(2500); await page.evaluate(()=>window.__on=false);
 const fr=await page.evaluate(()=>{ const a=window.__fr.slice(2).sort((x,y)=>x-y); return {n:a.length,p95:+a[Math.floor(a.length*.95)].toFixed(1),max:+a[a.length-1].toFixed(1),over50:a.filter(x=>x>50).length}; });
 const s1=await st(); const pills=await page.evaluate(()=>document.querySelectorAll('.orb-svg .pills g.pl').length); const cvOn=await page.evaluate(()=>document.querySelector('.orb-cv').classList.contains('on'));
 const shot='C:/Users/amrab/AppData/Local/Temp/claude/0c1797f587dd6ffe/35b7f4de-144a-446d-a774-4f3525a284c3/scratchpad/scrub_'+W+'.png'; await page.screenshot({path:shot});
 const R={vp:`${W}x${H}`,from:s0.i,to:s1.i,canvasDuringDrag:changes,canvasOffAfter:!cvOn,pillsAfter:pills,frames:fr,errors:errors.filter(e=>!/404|Failed to load/.test(e))};
 R.pass=changes.every(Boolean)&&!cvOn&&pills>0&&s1.i!==s0.i&&fr.over50===0&&!R.errors.length; console.log(JSON.stringify(R)); await b.close(); })();
