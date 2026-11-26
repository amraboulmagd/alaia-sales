const { launch, open, sleep } = require('./lib');
(async()=>{ const b=await launch(); const out=[];
 for (const [W,H,code] of [[1920,1080,'T06-B-210'],[1920,1080,'T06-A-202'],[390,844,'T06-B-210'],[390,844,'T06-A-202']]) {
  const {page,errors}=await open(b,{w:W,h:H,touch:W<1000}); const bad=[]; page.on('response',r=>{ if(r.status()>=400&&!/api\//.test(r.url())) bad.push(r.status()+' '+r.url()); });
  await page.evaluate(()=>window.__alaia.closeFilm&&window.__alaia.closeFilm('master')); await sleep(1500);
  await page.evaluate(c=>window.__alaia.go('unit',{u:window.__alaia.ALLU.find(x=>x.code===c)}),code); await sleep(1500);
  await page.evaluate(()=>{ const s=document.querySelector('.resov .rskip'); s&&s.click(); }); await sleep(800);
  await page.evaluate(()=>{ const e=[...document.querySelectorAll('#dh-in')].pop(); e&&e.click(); }); await sleep(3000);
  const nodes=[]; const n=await page.evaluate(()=>document.querySelectorAll('#wk .mm .rt button').length);
  for(let j=0;j<n;j++){ await page.evaluate(j=>document.querySelectorAll('#wk .mm .rt button')[j].click(),j); await sleep(1800);
    nodes.push(await page.evaluate(()=>{ const im=document.querySelector('#wk .pan img'); return {src:im.src.split('/').pop(), ok:im.complete&&im.naturalWidth>0, title:document.querySelector('#wk .top2 h3').textContent}; }));
    if(j===0) await page.screenshot({path:`C:/Users/amrab/AppData/Local/Temp/claude/0c1797f587dd6ffe/35b7f4de-144a-446d-a774-4f3525a284c3/scratchpad/wk_${W}_${code}.png`}); }
  out.push({vp:`${W}x${H}`,code,nodes,bad,errors:errors.filter(e=>!/404|Failed to load/.test(e))}); await page.close(); }
 console.log(JSON.stringify(out,null,0)); await b.close(); })();
