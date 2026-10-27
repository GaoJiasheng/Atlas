/** Original source-selection glue, CC BY-SA 4.0. No textbook artwork or text. */
export const ribs = ['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth','Tenth','Eleventh','Twelfth'];
const ordinals = ribs.map(x => x.toLowerCase());
export function selections(entries) {
  const names=entries.filter(e=>e.system==='skeleton'&&e.type==='MESH'&&!e.attachment).map(e=>e.name);
  const parts=[];
  const add=(id, sources, joint='trunk', station=[0,0,0])=>{
    if(!sources.length||sources.some(n=>!names.includes(n)))throw Error(`Missing source for ${id}: ${sources}`);
    parts.push({id,sources,joint,station});
  };
  const cranial=/^(Frontal bone|Parietal bone\.[lr]|Temporal bone\.[lr]|Occipital bone|Sphenoid bone|Ethmoid bone|(?:Anterior|Middle|Posterior) cells of ethmoid bone\.[lr]|Maxilla\.[lr]|Palatine bone\.[lr]|Zygomatic bone\.[lr]|Nasal bone\.[lr]|Lacrimal bone\.[lr]|Inferior nasal concha bone\.[lr]|Vomer)$/;
  add('skull',names.filter(n=>cranial.test(n)));add('mandible',['Mandible']);
  add('cervical-spine',names.filter(n=>/^(Atlas \(C1\)|Axis \(C2\)|Vertebra C[3-7])$/.test(n)));
  add('thoracic-spine',names.filter(n=>/^Vertebra T\d+$/.test(n)));add('lumbar-spine',names.filter(n=>/^Vertebra L\d+$/.test(n)));
  add('sacrum',['Sacrum']);add('coccyx',['Coccyx']);add('sternum',['Manubrium of sternum','Body of sternum','Xiphoid process']);
  for(const side of ['l','r'])add(`ribs-${side}`,[...ribs.map(n=>`${n} rib.${side}`),...ordinals.slice(0,10).map(n=>`Costal cartilage of ${n} rib.${side}`)]);
  const pairs=[['clavicle','Clavicle','clavicle'],['scapula','Scapula','scapula'],['humerus','Humerus','shoulder'],['radius','Radius','forearm'],['ulna','Ulna','elbow']];
  for(const[id,source,joint]of pairs)for(const side of ['l','r'])add(`${id}-${side}`,[`${source}.${side}`],`${joint}.${side}`);
  const hand=n=>/^(?:Scaphoid bone|Lunate bone|Capitate bone|Hamate bone|Pisiform bone|Trapezium bone|Trapezoid bone|Triquetrum bone|(?:First|Second|Third|Fourth|Fifth) metacarpal bone|(?:Proximal|Middle|Distal) phalanx of .* finger of hand)\.[lr]$/.test(n);
  for(const side of ['l','r'])add(`hand-${side}`,names.filter(n=>hand(n)&&n.endsWith(`.${side}`)),`hand.${side}`);
  for(const[id,source,joint]of [['hip-bone','Hip bone','trunk'],['femur','Femur','hip'],['patella','Patella','knee'],['tibia','Tibia','knee'],['fibula','Fibula','knee']])for(const side of ['l','r'])add(`${id}-${side}`,[`${source}.${side}`],joint==='trunk'?joint:`${joint}.${side}`);
  const foot=n=>/^(?:Calcaneus|Talus|Navicular bone|Cuboid bone|(?:Medial|Intermediate|Lateral) cuneiform bone|(?:First|Second|Third|Fourth|Fifth) metatarsal bone|(?:Proximal|Middle|Distal) phalanx of .* finger of foot|Sesamoid bones of foot)\.[lr]$/.test(n);
  for(const side of ['l','r'])add(`foot-${side}`,names.filter(n=>foot(n)&&n.endsWith(`.${side}`)),`ankle.${side}`);
  if(parts.length!==34)throw Error(`Skeleton count ${parts.length}`);
  const handDetail=[['carpal-scaphoid','Scaphoid bone.l'],['carpal-lunate','Lunate bone.l'],['carpal-capitate','Capitate bone.l'],['mcp-metacarpal','Second metacarpal bone.l'],['mcp-phalanx','Proximal phalanx of second finger of hand.l'],['thumb-trapezium','Trapezium bone.l'],['thumb-metacarpal','First metacarpal bone.l']];
  // Same translation for every source bone preserves their real relative positions.
  for(const[id,name]of handDetail)add(id,[name],null,[-2.27,.39,-.03]);
  return parts;
}
