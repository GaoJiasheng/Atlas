/** Source-profile fascia; Z-Anatomy / BodyParts3D CC BY-SA 4.0. */
import fs from 'node:fs';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { meshopt } from '@gltf-transform/functions';
import { MeshoptEncoder,MeshoptDecoder } from 'meshoptimizer';
import { BufferGeometry,Float32BufferAttribute } from 'three';
const file='scripts/anatomy/round2-gym/linea-source.json';
if(!fs.existsSync(file)){const code=fs.readFileSync('src/engines/space-scene/stages/model3d/LineaAlba.tsx','utf8');fs.writeFileSync(file,code.match(/const SOURCE=(.*);/)![1]!);}
const source=JSON.parse(fs.readFileSync(file,'utf8')) as {positions:number[];indices:number[]},p=source.positions.slice();
for(let ring=0;ring<p.length;ring+=36){let x=0,z=0;for(let j=0;j<36;j+=3){x+=p[ring+j]!/12;z+=p[ring+j+2]!/12;}for(let j=0;j<36;j+=3){p[ring+j]=x+(p[ring+j]!-x)*.55;p[ring+j+2]=z+(p[ring+j+2]!-z)*.5;}}
const g=new BufferGeometry().setAttribute('position',new Float32BufferAttribute(p,3));g.setIndex(source.indices);g.computeVertexNormals();
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);const d=new Document(),b=d.createBuffer(),scene=d.createScene();d.getRoot().getAsset().copyright='Z-Anatomy / BodyParts3D; CC BY-SA 4.0. https://github.com/LluisV/Z-Anatomy . Source-profile fascia narrowed to a smooth tendon band by Atlas.';
const prim=d.createPrimitive();for(const [a,s]of [['position','POSITION'],['normal','NORMAL']]as const)prim.setAttribute(s,d.createAccessor().setType('VEC3').setArray(new Float32Array(g.getAttribute(a).array)).setBuffer(b));prim.setIndices(d.createAccessor().setType('SCALAR').setArray(new Uint16Array(source.indices)).setBuffer(b));scene.addChild(d.createNode('linea-alba').setMesh(d.createMesh().addPrimitive(prim)));
await d.transform(meshopt({encoder:MeshoptEncoder,level:'high',quantizePosition:16,quantizeNormal:10}));const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});const bytes=await io.writeBinary(d);fs.writeFileSync('public/models/muscles-core-linea.glb',bytes);console.log(bytes.length);
