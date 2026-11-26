const { launch, open, sleep } = require('./lib');
(async()=>{ const b=await launch(); const {page,errors}=await open(b,{w:1920,h:1080});
 await page.evaluate(()=>window.__alaia.closeFilm&&window.__alaia.closeFilm('master')); await sleep(1200);
 await page.evaluate(()=>window.__alaiaK.openWalk(null,0,null,'st')); await sleep(2500);
 for(let k=0;k<5;k++){ await page.evaluate(()=>document.querySelector('#wk-zo').click()); await sleep(250); } await sleep(800);
 const r=await page.evaluate(()=>({z:window.__alaiaK.wk.z, w:document.querySelector('#wk .pan').getBoundingClientRect().width}));
 await page.screenshot({path:'C:/Users/amrab/AppData/Local/Temp/claude/0c1797f587dd6ffe/35b7f4de-144a-446d-a774-4f3525a284c3/scratchpad/zo.png'});
 console.log(JSON.stringify(r), errors); await b.close(); })();
