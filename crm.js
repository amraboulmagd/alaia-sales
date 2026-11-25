/* ALAIA · CRM adapter (single integration point for leads).
 * Every "Request details" on the kiosk, tablet or shared link goes through submitLead().
 * Lead shape: { unitCode, tower, floor, area, language, timestamp, mode }
 *
 * TODO(Enjaz): when Enjaz supplies the API endpoint, auth scheme and field mapping,
 * set ENDPOINT/headers below and remove the mock branch. Until then leads are queued
 * on this device (localStorage "alaia-leads") and exportable from Sales mode.
 */
(function(){
  'use strict';
  var ENDPOINT = null;            // TODO(Enjaz): e.g. 'https://<enjaz-host>/api/leads'
  var HEADERS  = {'Content-Type':'application/json'}; // TODO(Enjaz): auth header
  var KEY = 'alaia-leads';
  function queue(){ try{ return JSON.parse(localStorage.getItem(KEY)||'[]')||[]; }catch(e){ return []; } }
  function save(q){ try{ localStorage.setItem(KEY, JSON.stringify(q.slice(-500))); }catch(e){} }
  function valid(l){ return l && typeof l.unitCode==='string' && l.unitCode && typeof l.timestamp==='string'; }
  async function submitLead(lead){
    if(!valid(lead)) return {ok:false, error:'invalid lead'};
    var rec = {unitCode:lead.unitCode, tower:lead.tower, floor:lead.floor, area:lead.area,
               language:lead.language, timestamp:lead.timestamp, mode:lead.mode};
    var id = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    if(ENDPOINT){
      try{
        var r = await fetch(ENDPOINT, {method:'POST', headers:HEADERS, body:JSON.stringify(rec)});
        if(r.ok) return {ok:true, id:id, mock:false};
      }catch(e){}
      var q1 = queue(); q1.push(Object.assign({id:id, pending:true}, rec)); save(q1);
      return {ok:true, id:id, queued:true};
    }
    // Mock adapter (no Enjaz API yet)
    var q = queue(); q.push(Object.assign({id:id, mock:true}, rec)); save(q);
    if(window.console) console.info('[ALAIA CRM mock] lead', rec);
    await new Promise(function(r){ setTimeout(r, 350); });
    return {ok:true, id:id, mock:true};
  }
  window.ALAIA_CRM = {submitLead:submitLead, list:queue, clear:function(){ save([]); }, endpoint:function(){ return ENDPOINT; }};
})();
