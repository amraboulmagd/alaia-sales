/* ALAIA · videoMap — which verified visual asset is shown for a given home.
 * Key: unit type (st | br1 | br2) × tower (01–13) × floor (0 = ground … 4).
 * Every entry carries a required `source`. Only real renders of the ALAIA 3D model are listed.
 * Generated (AI) interiors, dollhouses, lift/dive and walk clips were removed on 26 Nov 2026.
 * lookup() returns interior:null where no real render exists; the UI then shows the real
 * furnished plan and "Interior view coming soon" — it never substitutes a placeholder.
 */
(function(){
  'use strict';
  var MODEL = 'Blender render of the ALAIA 3D model (KAGGLE/renders)';
  var pano = function(id, file, slices){ return {id:id, src:'ai/real/'+file, pano:true, w:4095, h:900, start:0,
    source: MODEL+', 360° cylindrical panorama joined from '+slices+' (3 overlapping slices, overlap trimmed, no retouching)'}; };
  var INTERIOR = {
    st:  {walk:{nodes:[pano('studio','pano_st.jpg','upload6/P_st_0..2')], forward:[], back:[]}},
    br1: {walk:{nodes:[pano('livkit','pano_br1_liv.jpg','upload5/P_br1liv_0..2'), pano('bedroom','pano_br1_bed.jpg','upload5/P_br1bed_0..2')], forward:[], back:[]}},
    br2: null   // TODO(developer data): no real two-bedroom interior render exists
  };
  INTERIOR.br1.walk.nodes[1].w = 4093; INTERIOR.br1.walk.nodes[0].w = 4093;
  var PLAN = {st:'ai/real/plan_st.jpg', br1:'ai/real/plan_br1.jpg', br2:'ai/real/plan_br2.jpg'};
  var TOWERS = ['01','02','03','04','05','06','07','08','09','10','11','12','13'];
  function view(tower, side, floor){
    if(TOWERS.indexOf(tower) < 0) return null;
    var f = Math.max(0, Math.min(4, floor|0));
    var src = 'views/bf_T'+tower+'_'+side+'_F'+f+'.jpg';
    return {src:src, source: (tower==='06'&&side==='a') ? 'Original Blender render (KAGGLE/renders/upload7), unedited'
                                                       : 'Render-style view from the site; original render file not found in the project folder (unverified)'};
  }
  function lookup(kind, tower, floor, side){
    var it = INTERIOR[kind] || null;
    return {
      kind: kind, tower: tower, floor: floor,
      interior: it,
      interiorScope: it ? 'type' : null,
      plan: {src: PLAN[kind] || null, source: MODEL+' (upload8 PLAN_'+kind+')'},
      view: view(tower, side || 'a', floor),
      gaps: [
        'Interiors are per unit type, rendered from the 3D model; not tower- or floor-specific.',
        'Mirror-image units reuse the same renders; no mirrored set exists.',
        'Two-bedroom: no interior render exists (plan only).'
      ]
    };
  }
  var GAPS = ['Interiors are per unit type, rendered from the 3D model; not tower- or floor-specific.', 'Mirror-image units reuse the same renders.', 'Two-bedroom: no interior render exists (plan only).', 'Window views exist for floors G–4 only; only tower 06 side A is verified against the original render.'];
  window.ALAIA_VIDEOMAP = {INTERIOR: INTERIOR, PLAN: PLAN, TOWERS: TOWERS, lookup: lookup, view: view, gaps: GAPS};
})();
