/** Build-time only NASA public-domain source reader. Draco never reaches runtime. */
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
export async function sourceIO(){
 const dir='node_modules/three/examples/jsm/libs/draco/gltf/';
 const context:any={module:{exports:{}},exports:{},require:createRequire(import.meta.url),__dirname:process.cwd()+'/'+dir,process,console,TextDecoder,TextEncoder,WebAssembly,performance,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(dir+'draco_wasm_wrapper.js','utf8'),context);
 const decoder=await context.module.exports({wasmBinary:fs.readFileSync(dir+'draco_decoder.wasm')});
 await MeshoptDecoder.ready;
 return new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'draco3d.decoder':decoder,'meshopt.decoder':MeshoptDecoder});
}
