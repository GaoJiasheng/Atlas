/** Curved forged lever: fixed clamp/housing lives on wheel-stand, so only the
 * blade and its concentric pivot rotate in the existing squeeze poses. */
import fs from 'node:fs';
import {Shape} from 'three';
const file='src/content/topics/forces/data/parts.json',data=JSON.parse(fs.readFileSync(file,'utf8'));
const p=data.parts.find((p:{id:string})=>p.id==='brake-lever');
const s=new Shape();s.moveTo(.003,.004);s.bezierCurveTo(-.004,.008,-.010,.004,-.011,-.005);s.bezierCurveTo(-.012,-.027,-.023,-.055,-.033,-.081);s.bezierCurveTo(-.039,-.092,-.036,-.097,-.031,-.097);s.bezierCurveTo(-.025,-.097,-.022,-.085,-.019,-.077);s.bezierCurveTo(-.010,-.051,.004,-.025,.007,-.006);s.bezierCurveTo(.008,-.001,.007,.002,.003,.004);
p.primitive={kind:'extrude',shape:s.getPoints(12).map(v=>v.toArray()),depth:.006,bevel:.0011,at:[.818,.512,-.075],color:'casing'};
p.extra=[{kind:'lathe',profile:[[0,-.011],[.004,-.011],[.0055,-.009],[.0055,-.007],[.0036,-.006],[.0036,.006],[.0055,.007],[.0055,.009],[.004,.011],[0,.011]],segments:48,at:[.818,.512,-.075],rotation:[90,0,0],color:'steel'}];
fs.writeFileSync(file,JSON.stringify(data,null,2)+'\n');
