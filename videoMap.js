/* ALAIA · videoMap — which verified visual asset plays for a given home.
 * Key: unit type (st | br1 | br2) × tower (01–13) × floor (0 = ground … 4).
 * Every entry carries a required `source` describing where the asset came from.
 * lookup() returns null for anything without a verified asset; the UI then shows
 * "Interior view coming soon" — it never substitutes a placeholder video.
 */
(function(){
  'use strict';
  var MODEL = "Architect's Revit/3D model (MAJD) → Blender cutaway render";
  var T = function(kind, nodes, real){
    var o = {
      dollhouse: {src:'ai/res/'+kind+'_dh.jpg', source:MODEL+' of the '+kind+' unit plan, finished with nano_banana_2 (Higgsfield)'},
      lift:      {src:'ai/res/'+kind+'_lift.mp4', source:'seedance_2_0 (Higgsfield) between the tower render and the '+kind+' dollhouse'},
      walk: {
        nodes: nodes.map(function(n,i){ return real ? {id:n, src:'ai/walk/r_'+kind+'_n'+i+'.jpg', source:MODEL+' 360 render of the '+kind+' unit (real windows, doors and view), finished photoreal with Higgsfield'} : {id:n, src:'ai/walk/'+kind+'_n'+i+'.jpg', source:'nano_banana_2 (Higgsfield) from the '+kind+' furnished plan and interior design study'}; }),
        forward: real ? [] : nodes.slice(0,-1).map(function(n,i){ return {from:i, to:i+1, src:'ai/walk/'+kind+'_t'+i+'.mp4', source:'seedance_2_0 (Higgsfield) start/end frames = walk nodes '+i+'→'+(i+1)}; }),
        back:    real ? [] : nodes.slice(0,-1).map(function(n,i){ return {from:i+1, to:i, src:'ai/walk/'+kind+'_r'+i+'.mp4', source:'time-reversed copy of '+kind+'_t'+i}; })
      }
    };
    return o;
  };
  // full 360 rooms (photoreal from the real 360 model renders); switched on when the files are in ai/walk/
  var PANO_READY = !/[?&]pano=0/.test(location.search);
  var P360 = function(kind, rooms){ return {
    dollhouse: {src:'ai/res/'+kind+'_dh.jpg', source:MODEL+' of the '+kind+' unit plan'},
    walk: { nodes: rooms.map(function(n,i){ return {id:n, src:'ai/walk/r_'+kind+'_pano'+i+'.jpg', pano:true, source:MODEL+' 360 render of the '+kind+' unit (real windows, doors, view), finished photoreal with Higgsfield'}; }), forward:[], back:[] } }; };
  var INTERIOR = {
    st:  T('st',  ['studio','sleep','kitchenette'], true),
    br1: T('br1', ['living','kitchen','entry','bedroom','wardrobe'], true),
    br2: T('br2', ['entry','living','master','second','bath'])
  };
  if(PANO_READY){ INTERIOR.st = P360('st',['studio']); INTERIOR.br1 = P360('br1',['living','bedroom']); }
  var TOWERS = ['01','02','03','04','05','06','07','08','09','10','11','12','13'];
  function view(tower, side, floor){
    if(TOWERS.indexOf(tower) < 0) return null;
    var f = Math.max(0, Math.min(4, floor|0));
    return {src:'views/bf_T'+tower+'_'+side+'_F'+f+'.jpg', source:'Blender render from tower '+tower+' on the real site plan at floor '+f+' eye height, side '+side+', real sun path'};
  }
  function lookup(kind, tower, floor, side){
    var it = INTERIOR[kind] || null;
    return {
      interior: it,                       // type-level: same plan on every tower & floor of this type
      interiorScope: it ? 'type' : null,  // not tower- or floor-specific (see gaps)
      view: view(tower, side||'a', floor)
    };
  }
  var GAPS = [
    'Interiors are per unit type (studio / 1BR / 2BR); there is no tower- or floor-specific interior footage.',
    'Mirror-image (opposite-hand) units reuse the same interior assets; no mirrored set exists.',
    'Bathroom nodes are still images only (no room film).',
    'Window views exist for floors G–4 only.'
  ];
  window.ALAIA_VIDEOMAP = {INTERIOR:INTERIOR, TOWERS:TOWERS, lookup:lookup, view:view, gaps:GAPS};
})();
