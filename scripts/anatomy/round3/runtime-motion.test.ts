/** Executes the real MotionDriver frame callback, with only React/R3F scheduling
 * mocked. Three loader, rig, palm offsets, root/contact solver all execute. */
import {vi,it,expect} from 'vitest';
import fs from 'node:fs';
import {Group,Matrix4,Vector3,PropertyBinding,PerspectiveCamera,OrthographicCamera,type SkinnedMesh} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'meshoptimizer';
import {makeGrip,gripPoint} from '../../../src/engines/space-scene/stages/model3d/grip';
import {makeFoot} from '../../../src/engines/space-scene/stages/model3d/foot';
const schedule=vi.hoisted(()=>({frames:[] as ((s:any,delta?:number)=>void)[],runtime:null as any,refs:[]as any[]}));
vi.mock('react',()=>({lazy:(f:any)=>f,useMemo:(f:any)=>f(),useRef:(v:any)=>{const r={current:v};schedule.refs.push(r);return r;},useEffect:(f:any)=>{f();},useLayoutEffect:()=>{}}));
vi.mock('@react-three/fiber',()=>({useFrame:(f:any)=>schedule.frames.push(f)}));
vi.mock('../../../src/engines/space-scene/stages/model3d/runtime',()=>({MAX_DT:.25,useRuntime:()=>schedule.runtime,prefersReducedMotion:()=>true,keepAnimating:()=>{}}));
import {partsFile} from '../../../src/engines/space-scene/schema';
import {EXERCISE_VIEWS,exercisePosture,viewDirection,fitExerciseCamera,exerciseFraming} from '../../../src/engines/space-scene/lib/camera';
import {Equipment}from '../../../src/engines/space-scene/stages/model3d/Equipment';
import{gymGeometry,fitLatTower}from'../../../src/content/topics/muscles-core/runtime/gymGeometry';
import {MotionDriver} from '../../../src/engines/space-scene/stages/model3d/MotionDriver';
const json=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const rows:any[]=[];
for(const [topic,file,id] of [['chest','horizontal-push','barbell-bench-press'],['arms','arms','close-grip-bench-press']]as const)it(`actual MotionDriver ${id} projects above shoulder then onto sternum`,async()=>{
 schedule.frames=[];schedule.refs=[];
 const bytes=fs.readFileSync(`public/models/muscles-${topic}.glb`),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)as ArrayBuffer,'');gltf.scene.updateMatrixWorld(true);
 const data:any=partsFile.parse(json(`src/content/topics/muscles-${topic}/data/parts.json`)),exercise=json(`src/content/shared/fitness/exercises/${file}.json`).exercises.find((e:any)=>e.id===id);
 data.animations??=[];data.poses??={};
 const node=(name:string)=>gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(data.rig.joints[name].node))!;
 const grips={l:makeGrip(node('hand.l'),data.rig.joints['hand.l'].offset)!,r:makeGrip(node('hand.r'),data.rig.joints['hand.r'].offset)!};
 const group=new Group();group.matrixAutoUpdate=false;
 const runtime={root:new Matrix4(),contract:new Map(),energy:0,bonesMoved:0,shadowDirty:false};schedule.runtime=runtime;
 const input:any={pose:null,exercise:{id,phase:'start'},demo:null},body=gltf.scene.getObjectByName('skin-outline')as SkinnedMesh;
 const bridge:any={joints:new Map()};
 MotionDriver({data,fitness:{exercises:[exercise],muscles:[]}as any,rig:{root:gltf.scene,node:(n:string)=>gltf.scene.getObjectByName(PropertyBinding.sanitizeNodeName(n))??null,body:new Map()},input,playable:new Set([id]),rootRef:{current:group},center:[0,0,0],grips,feet:[0,-1,0],footing:{l:makeFoot(node('ankle.l'),-1),r:makeFoot(node('ankle.r'),-1)},modelFloor:-1,sweepMeshes:()=>[body],bridge,snapKey:1});
 const state={invalidate:()=>{},clock:{elapsedTime:0}};let clockMs=0;const now=vi.spyOn(performance,'now').mockImplementation(()=>clockMs);const tick=()=>schedule.frames[0]!(state);
 function read(){const l=new Vector3(),r=new Vector3(),axis=new Vector3();gripPoint(grips.l,l,axis);gripPoint(grips.r,r,axis);return{bar:l.add(r).multiplyScalar(.5).applyMatrix4(runtime.root),shoulder:node('shoulder.l').getWorldPosition(new Vector3()).applyMatrix4(runtime.root),elbow:node('elbow.l').getWorldPosition(new Vector3()).applyMatrix4(runtime.root),wrist:node('hand.l').getWorldPosition(new Vector3()).applyMatrix4(runtime.root),rightElbow:node('elbow.r').getWorldPosition(new Vector3()).applyMatrix4(runtime.root),rightWrist:node('hand.r').getWorldPosition(new Vector3()).applyMatrix4(runtime.root)};}
 tick();const start=read();input.exercise={id,phase:'end'};tick();const end=read();

 expect(Math.abs(start.bar.z-start.shoulder.z)).toBeLessThan(.003);
 const caudal=end.bar.z-end.shoulder.z;expect(caudal).toBeGreaterThan(.15);expect(caudal).toBeLessThan(.23);
 const forearm=end.wrist.clone().sub(end.elbow).normalize();expect(Math.hypot(forearm.x,forearm.z)).toBeLessThan(.03);const rightForearm=end.rightWrist.clone().sub(end.rightElbow).normalize();expect(Math.hypot(rightForearm.x,rightForearm.z)).toBeLessThan(.03);
 const points=Array.from({length:body.geometry.getAttribute('position').count},(_,i)=>body.getVertexPosition(i,new Vector3()).applyMatrix4(body.matrixWorld).applyMatrix4(runtime.root)),idx=body.geometry.index!;
 let skinY=-Infinity;
 for(let i=0;i<idx.count;i+=3){const a=points[idx.getX(i)]!,b=points[idx.getX(i+1)]!,c=points[idx.getX(i+2)]!,d=(b.z-c.z)*(a.x-c.x)+(c.x-b.x)*(a.z-c.z);if(Math.abs(d)<1e-12)continue;const u=((b.z-c.z)*(end.bar.x-c.x)+(c.x-b.x)*(end.bar.z-c.z))/d,v=((c.z-a.z)*(end.bar.x-c.x)+(a.x-c.x)*(end.bar.z-c.z))/d,w=1-u-v;if(Math.min(u,v,w)>=0)skinY=Math.max(skinY,u*a.y+v*b.y+w*c.y);}
 const clearanceMm=(end.bar.y-.014-skinY)*1000;expect(Math.abs(clearanceMm)).toBeLessThan(4);
 // Project every actual frame from the engine-fitted camera and an orthogonal
 // side camera. This reads the callback's bones/root, not a separate solver.
 const view=exercise.motion.camera??EXERCISE_VIEWS[exercisePosture(exercise.motion)],camSpec=fitExerciseCamera(bridge.exerciseFrame.points,viewDirection(view.azimuth,view.elevation),1920/1080,exerciseFraming(0,1080,exercise.motion.camera?.fill))!;
 const camera=new PerspectiveCamera(camSpec.fov,1920/1080,.01,100);camera.position.fromArray(camSpec.position);camera.lookAt(new Vector3(...camSpec.target));camera.updateMatrixWorld();
 const sideCam=new OrthographicCamera(-1.3,1.3,.8,-.8,.01,100);sideCam.position.set(3,end.shoulder.y,end.shoulder.z+.3);sideCam.lookAt(0,end.shoulder.y,end.shoulder.z+.3);sideCam.updateMatrixWorld();
 const project=(v:Vector3,camera:any)=>{const p=v.clone().project(camera);return [(p.x*.5+.5)*1920,(.5-p.y*.5)*1080];};
 const projections=[];input.exercise={id,phase:'loop'};
 for(let i=0;i<=100;i++){clockMs=exercise.motion.tempo[0]*1000*i/100;tick();const frame=read();expect(frame.bar.z-frame.shoulder.z).toBeGreaterThan(-.003);expect(frame.bar.z-frame.shoulder.z).toBeLessThan(.215);projections.push({sample:i,caudal:frame.bar.z-frame.shoulder.z,bar:project(frame.bar,camera),shoulder:project(frame.shoulder,camera),sternum:project(new Vector3(0,end.bar.y-.014,end.bar.z),camera),sideBar:project(frame.bar,sideCam)});}
 now.mockRestore();
 rows.push({id,clearanceMm,camera:camSpec,leftForearmDeg:Math.acos(forearm.y)*180/Math.PI,rightForearmDeg:Math.acos(rightForearm.y)*180/Math.PI,projections,start: start.bar.toArray(),end:end.bar.toArray(),shoulder:end.shoulder.toArray(),caudal});
 // Camera floats differ on every run: refresh the tracked report only on request.
 if(process.env.ATLAS_WRITE_RUNTIME_MOTION)fs.writeFileSync('scripts/anatomy/round3/runtime-motion.json',JSON.stringify(rows,null,2));
});

it('draws the actual pulldown frame opaque even beside the wire body',async()=>{
 schedule.frames=[];schedule.refs=[];const bytes=fs.readFileSync('public/models/muscles-back-pulldown.glb'),gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)as ArrayBuffer,'');gltf.scene.updateMatrixWorld(true);
 schedule.runtime={root:new Matrix4(),bonesMoved:0,exercise:{trunk:new Vector3(),hands:[new Vector3(.3,.8,0),new Vector3(-.3,.8,0)],palms:null,feet:null,knees:null,bar:null,floor:-.75,modelFloor:-.75}};
 const outer:any=Equipment({specs:[{kind:'lat-bar'},{kind:'machine-frame'}],held:false,grips:{l:null,r:null},footing:{l:null,r:null},trunk:null,style:{look:{color:'#8A8378'}}as any,solid:false});
 const element=outer.props.children((name:string,height?:number)=>{const mesh=gltf.scene.getObjectByName(name)as any;const g=gymGeometry(mesh);if(name==='lat-frame'&&height!==undefined)fitLatTower(g,height);return g;},{lineShape:()=>({primitive:{kind:'cylinder',size:[.003,.003,1],at:[0,.5,0],color:'rubber'}})});
 const tree=element.type(element.props),meshes:any[]=[];
 for(const group of tree.props.children){group.props.ref(new Group());const node=group.props.children;const mesh={geometry:node.props.geometry,material:node.props.material};node.props.ref(mesh);meshes.push(mesh);}
 for(let i=0;i<100;i++)schedule.frames[0]!({invalidate:()=>{},clock:{elapsedTime:i/60}},1/60);
 expect(meshes.at(-1).material.opacity).toBe(1);expect(meshes.at(-1).material.transparent).toBe(false);
});
