# Master plan: 72-frame real orbit (to replace the 16 fixed angles)

Goal: ≥72 frames per 360° rendered from the **real** model (`KAGGLE/dataset/site2.blend`), sunset first, no AI restyling, plus per-frame tower anchors from the same cameras. Free Kaggle GPU (T4/P100) is enough.

## Inputs you already have
- `KAGGLE/dataset/site2.blend` and `render_job.py` (Cycles setup: AgX, denoise, GPU auto-detect)
- The 16 current real angles `ORB_00..15` (1920×1080). Their camera ring is NOT saved in the project folder.

## Step 1: recover the ring from the model (2 min, CPU is fine)
Run in the Kaggle notebook: `blender -b site2.blend --python-expr "import bpy; [print(o.name, tuple(round(v,2) for v in o.location), o.type) for o in bpy.data.objects if o.type in ('CAMERA','EMPTY') or o.name.upper().startswith(('T0','T1','TOWER','BLD','BUILDING'))]"`
Send me the printed list. If an `ORB`/orbit camera or rig exists, its centre/radius/height/lens are used as-is. If not, I derive the ring from the tower anchors already measured for the 16 angles.

## Step 2: render (≈ 72 × 40 s on a T4 at 1920×1080, 128 spp)
Save as `orbit72.py` next to `render_job.py`, fill the 5 values from step 1, run:
`blender -b site2.blend -P orbit72.py -- /kaggle/working/orbit72 1920 1080 128`

```python
import bpy, sys, os, math, json
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
a = sys.argv[sys.argv.index('--')+1:]
OUT, W, H, SPP = a[0], int(a[1]), int(a[2]), int(a[3]); os.makedirs(OUT, exist_ok=True)
CENTER = Vector((0.0, 0.0, 0.0))   # FILL from step 1 (site centre)
RADIUS, HEIGHT, LENS = 0.0, 0.0, 0.0  # FILL from step 1 (same as the ORB shots)
START_DEG = 0.0                      # FILL so that frame 0 == ORB_00
TOWERS = {}                          # FILL: {'01': 'ObjectName', ...} from step 1
sc = bpy.context.scene; exec(open(os.path.join(os.path.dirname(__file__), 'render_job.py')).read().split('cam = bpy.data.objects.new')[0].split('SHOTS = {')[0])  # reuse device/Cycles setup only
sc.cycles.samples = SPP; sc.render.resolution_x, sc.render.resolution_y = W, H
cam = bpy.data.objects.new('ORB72', bpy.data.cameras.new('ORB72')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = LENS
anchors = {}
for f in range(72):
    th = math.radians(START_DEG + f * 5)
    cam.location = CENTER + Vector((RADIUS * math.cos(th), RADIUS * math.sin(th), HEIGHT))
    cam.rotation_euler = (CENTER - cam.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.view_layer.update(); fr = {}
    for tid, name in TOWERS.items():
        ob = bpy.data.objects[name]; pts = [world_to_camera_view(sc, cam, ob.matrix_world @ Vector(c)) for c in ob.bound_box]
        hull = [[round(p.x, 4), round(1 - p.y, 4)] for p in pts]; top = max(pts, key=lambda p: p.y)
        fr[tid] = {'hull': hull, 'top': [round(top.x, 4), round(1 - top.y, 4)], 'd': round((ob.matrix_world.translation - cam.location).length, 1)}
    anchors[f] = fr
    p = os.path.join(OUT, f'orb72_{f:02d}.jpg')
    if not os.path.exists(p): sc.render.filepath = p; bpy.ops.render.render(write_still=True)
json.dump(anchors, open(os.path.join(OUT, 'orbit72_anchors.json'), 'w'))
```

## Step 3: hand back
Zip `/kaggle/working/orbit72` (72 JPGs + `orbit72_anchors.json`) into the project folder. I then build 1920/1280/960 sets, the canvas scrubber (`createImageBitmap`, sliding decode window) and the contact-sheet proof. Other times of day: render the same 72 cameras with a different sun only after sunset is approved.
