/* ALAIA · lead adapter (single integration point for "Request details").
 * submitLead(lead) -> { ok, id, status } where status is the TRUE state of the request:
 *   'received'      the ALAIA server stored it (sales team sees it in Sales mode > Leads)
 *   'pending_sync'  network/server unavailable; saved on this device, retried automatically
 * CRM (Engaz) delivery is tracked server-side (crm_status: not_configured | pending | delivered | failed).
 * TODO(Enjaz): server-side delivery in functions/api/leads.js once Engaz supplies endpoint, auth and field mapping.
 * No personal data is collected here: the lead is the unit the visitor asked about.
 */
(function () {
  'use strict';
  var ENDPOINT = '/api/leads';
  var KEY = 'alaia-leads-pending';
  function queue() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } }
  function save(q) { try { localStorage.setItem(KEY, JSON.stringify(q.slice(-200))); } catch (e) {} }
  function valid(l) { return l && typeof l.unitCode === 'string' && /^T\d{2}-[A-Z]-(G|\d)\d{2}$/.test(l.unitCode) && typeof l.timestamp === 'string'; }
  function cid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
  async function post(rec) {
    var r = await fetch(ENDPOINT, { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json', 'x-alaia': '1' }, body: JSON.stringify(rec) });
    var j = null; try { j = await r.json(); } catch (e) {}
    return { http: r.status, j: j || {} };
  }
  async function submitLead(lead) {
    if (!valid(lead)) return { ok: false, error: 'invalid lead' };
    var rec = { unitCode: lead.unitCode, tower: lead.tower, floor: lead.floor, area: lead.area, language: lead.language, timestamp: lead.timestamp, mode: lead.mode, clientId: cid() };
    try {
      var r = await post(rec);
      if (r.http >= 200 && r.http < 300 && r.j.ok) return { ok: true, id: r.j.id, status: 'received', crm: r.j.crm };
      if (r.http >= 400 && r.http < 500 && r.http !== 429) return { ok: false, error: r.j.error || 'rejected' };
    } catch (e) { /* offline: fall through to local queue */ }
    var q = queue(); q.push(rec); save(q);
    return { ok: true, id: 'L' + rec.clientId, status: 'pending_sync' };
  }
  var flushing = false;
  async function flush() {
    if (flushing) return; var q = queue(); if (!q.length) return; flushing = true;
    var left = [];
    for (var i = 0; i < q.length; i++) {
      try { var r = await post(q[i]); if (!(r.http >= 200 && r.http < 300) && !(r.http >= 400 && r.http < 500 && r.http !== 429)) left.push(q[i]); }
      catch (e) { left.push(q[i]); }
    }
    save(left); flushing = false;
  }
  addEventListener('online', flush);
  setInterval(flush, 60000); setTimeout(flush, 5000);
  window.ALAIA_CRM = { submitLead: submitLead, list: queue, flush: flush, endpoint: function () { return ENDPOINT; } };
})();
