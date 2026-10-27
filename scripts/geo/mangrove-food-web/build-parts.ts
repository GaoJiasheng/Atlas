/** Original procedural teaching habitat (docs/53 §3). Dimensions are DESIGN,
 * never specimen measurements. External photos were read only for morphology;
 * no image, texture, traced outline or third-party mesh is used here.
 * Imported by build-topic.ts; invoking this script alone writes geometry only.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { partSchema, partsFileBase } from '../../../src/engines/space-scene/schema';
import { partBounds, partMaterialSlots } from '../../../src/engines/space-scene/lib/parts';
import { add, blade, box, ellipsoid, r3, sweep, wing, type Prim, type V3 } from '../living-things/kit';

const bi = (en: string, zh: string) => ({ en, zh });
const ink = 'token:ink-2';
const bark = { color: 'wood', tint: 'token:neutral' };
const foliage = { color: 'tissue', tint: 'token:seedling' };
const hard = { color: 'chitin', tint: 'token:neutral' };
const fish = { color: 'tissue', tint: 'token:ink-3' };
const line = (path: V3[], radius: number | number[], material = bark): Prim => sweep(path, radius, material.color, { tint: material.tint, radial: 8, segments: 18, caps: 'round' });
const oval = (at: V3, radius: number, scale: V3, material = hard): Prim => ellipsoid(at, radius, scale, material.color, { tint: material.tint });
const leaf = (at: V3, dir: V3, len = .18, width = .065): Prim => wing(at, blade(len, width, .44, 8), dir, [0, .2, 1], foliage.color, { tint: foliage.tint });
const camera = (position: V3, target: V3, fov = 32) => ({ position, target, fov });

/** Crab: 8 ambulatory legs, 2 chelipeds, 2 eye stalks; <=16 extras.
 * Local front is +Z. Vertical variant lays its walking feet against the trunk.
 */
function crab(at: V3, male: boolean, vertical = false) {
  const map = ([x, y, z]: V3): V3 => r3(add(at, vertical ? [x, z, y] : [x, y, z]));
  const extra: Prim[] = [];
  for (const side of [-1, 1]) {
    for (const z of [-.034, -.012, .012, .034]) {
      extra.push(line([map([side * .035, .034, z]), map([side * .070, .046, z + z * .30]), map([side * (vertical ? .028 : .10), .004, z + z * .65])], [.005, .0037, .0016], hard));
    }
  }
  for (const [i, side] of [-1, 1].entries()) {
    const big = male && i === 0;
    const size = big ? .068 : .031;
    extra.push(line([map([side * .028, .032, .035]), map([side * .052, .05, .062]), map([side * .055, .055, .084])], [.006, .007, .005], hard));
    // A palm and two tapering fingers separated by a visible opening.
    const shape = [[-.35,-.48],[.1,-.5],[.65,-.32],[1,-.06],[.8,-.04],[.35,-.21],[.12,-.16],[.15,.14],[.45,.3],[.85,.17],[1,.1],[.9,.36],[.35,.55],[-.25,.45],[-.48,.12]].map(([x,y]) => [x! * size,y! * size]);
    extra.push({ kind: 'extrude', at: map([side * .055, .055, .086]), shape, depth: big ? .017 : .01, rotation: vertical ? [0, 0, side * -28] : [90, 0, side * -28], color: hard.color, tint: hard.tint, ...(side < 0 ? { mirror: 'x' } : {}) });
    extra.push(line([map([side * .02, .046, .035]),map([side * .026, .083, .047])], [.004, .0028], hard));
    extra.push(oval(map([side * .026, .085, .047]), .005, [1, 1.2, 1], {color:'eye', tint:'token:ink'}));
  }
  return { primitive: oval(map([0, .035, 0]), .046, vertical ? [1,.80,.46] : [1,.46,.80]), extra };
}

function fishModel(at: V3, small = false) {
  const s = small ? .58 : 1;
  const pt = (p: V3) => r3(add(at, p.map((v) => v * s)));
  const extra: Prim[] = [];
  for (const side of [-1, 1]) {
    extra.push(oval(pt([.095,.046,side*.019]), .013*s,[.9,1.1,.8], fish));
    extra.push(oval(pt([.099,.053,side*.023]), .006*s,[1,1,1],{color:'eye',tint:'token:ink'}));
    extra.push(wing(pt([.047,.005,side*.024]),blade(.07*s,.048*s,.55,8),[-.5,-.1,side*.8],[0,1,0],fish.color,{tint:fish.tint}));
  }
  extra.push(wing(pt([-.12,.005,0]), [[0,0],[-.055*s,.035*s],[-.043*s,0],[-.055*s,-.035*s]], [1,0,0], [0,1,0],fish.color,{tint:fish.tint}));
  extra.push(wing(pt([-.04,.028,0]),blade(.095*s,.035*s,.48,8),[1,0,0],[0,1,0],fish.color,{tint:fish.tint}));
  return { primitive: line([pt([-.13,0,0]),pt([-.07,.008,0]),pt([.025,.018,0]),pt([.088,.026,0]),pt([.12,.018,0])],[.004*s,.017*s,.031*s,.035*s,.016*s],fish), extra };
}

function tree(at: V3, tall: boolean) {
  const pt = (p: V3) => r3(add(at,p));
  const top = tall ? .78 : .71;
  const extra: Prim[] = [];
  const tips: V3[] = [];
  for (const [dx,dy,dz] of [[-.18,.56,-.04],[.15,.62,.04],[-.08,top,.02],[.12,.47,-.16]] as V3[]) {
    const end = pt([dx,dy,dz]); tips.push(end);
    extra.push(line([pt([0,.31,0]),pt([dx*.55,dy-.10,dz*.55]),end],[.024,.015,.007]));
  }
  for (const end of tips) {
    extra.push(leaf(end,[-.85,.35,.1],.19,.067));
    extra.push(leaf(end,[.8,.5,-.2],.20,.07));
    extra.push(leaf(end,[.2,.6,.65],.17,.06));
  }
  return { primitive: line([pt([0,-.03,0]),pt([.015,.22,.005]),pt([-.018,.45,-.015]),pt([0,top,.015])],[.042,.034,.023,.009]), extra };
}

export function buildParts() {
  const parts: unknown[] = [];
  const addPart = (id: string, name: ReturnType<typeof bi>, group: string | undefined, summary: ReturnType<typeof bi>, detail: ReturnType<typeof bi>, geometry: {primitive: Prim; extra?: Prim[]}, options: Record<string, unknown> = {}) => {
    if ((geometry.extra?.length ?? 0) > 16) throw new Error(`${id}: exceeds 16 extras`);
    if (summary.en.length > 60 || summary.zh.length > 60) throw new Error(`${id}: long summary`);
    parts.push({id,name,...(group ? {group} : {}),summary,detail,...geometry,explode:{dir:[0,1,0],dist:0},clip:false,castShadow:false,...options});
  };
  addPart('mud-bank',bi('Mud bank','泥岸'),'habitat',bi('Supports roots and marks the exposed habitat.','承托树根，标出露泥的生境。'),bi('The mud bank gives this teaching scene a surface, with a lower channel along the front. Tide poses change which surfaces appear covered. [S27, S30]\n\nThis is an independent habitat model. Its outline, dimensions and drawn numbers are design choices, not a survey of Sungei Buloh. [S30]','泥岸承托这幅教学场景，前缘有较低的潮沟；潮位姿态改变画面上被水覆盖的区域。[S27, S30]\n\n这是独立的生境模型；轮廓、尺寸和画出的数量都属于设计，不是双溪布洛测量结果。[S30]'),{primitive:{kind:'extrude',shape:[[-.8,-.5],[.8,-.5],[.8,.17],[.64,.20],[.44,.17],[.22,.24],[.03,.19],[-.2,.24],[-.42,.18],[-.8,.24]],depth:.24,at:[0,-.12,0],rotation:[90,0,0],color:'abrasive',tint:'token:neutral'},extra:[box([0,-.21,.35],[1.6,.06,.3],'abrasive',{tint:'token:neutral'})]},{shell:true,clip:true,castShadow:true});
  addPart('tidal-water',bi('Tidal water','潮水'),'habitat',bi('Shows low and high water as two schematic poses.','以两种示意姿态显示低潮和高潮。'),bi('Incoming tide changes the physical conditions around the mud bank. The water surface moves between two illustrative positions. [S27, S30]\n\nThese are not tide heights, a tide prediction or a water-volume calculation. The food graph uses the same links in both poses. [S30]','潮水涨落改变泥岸周围的条件；这里的水面只在两个示意位置间移动。[S27, S30]\n\n这些位置不是实测潮高或潮汐预报，也不计算水量；两种姿态使用相同的食物关系。[S30]'),{primitive:box([0,-.04,0],[1.58,.008,.99],'glass',{tint:'token:cold'})});
  addPart('burrow-mouth',bi('Burrow opening','洞口'),'habitat',bi('Marks a refuge used by fiddler crabs.','标示招潮蟹可躲藏的洞口。'),bi('Fiddler crabs retreat into burrows during high tide. The opening remains visible as a separate habitat feature. [S5]\n\nThis short opening does not reconstruct the shape, depth or air supply of a real burrow. [S30]','招潮蟹在高潮时会退入洞中；洞口是独立的生境结构，即使蟹隐藏也仍然保留。[S5]\n\n这里只显示一个短洞口，没有重建真实洞穴的形状、深度或供气情况。[S30]'),{primitive:{kind:'sweep',at:[-.26,.008,.12],path:[[0,0,0],[0,-.04,0]],radius:.026,hollow:.007,radial:16,segments:4,color:'abrasive',tint:'token:ink-2'}});
  addPart('api-tree',bi('Api-api Putih tree','Api-api Putih 红树'),'mangroves',bi('Leaves make food and can excrete salt.','叶片制造食物，并能排出盐分。'),bi('Api-api Putih (Avicennia alba) has leaves with salt glands. This salt-handling feature belongs to this named plant, not every mangrove. [S3]\n\nIts shallow lateral roots connect to upright pencil-shaped breathing roots. The neighbouring Bakau is a separate tree. [S2, S3]','Api-api Putih（Avicennia alba）的叶片有盐腺；这种排盐方式属于这株具名植物，不能推广到所有红树。[S3]\n\n它的浅侧根与直立的铅笔状呼吸根相连；旁边的 Bakau 是另一株独立的树。[S2, S3]'),tree([-.46,0,-.13],false),{connects:['api-lateral'],castShadow:true});
  const lateralPoints: V3[] = [[-.46,-.035,-.13],[-.52,-.045,-.025],[-.58,-.04,.095],[-.64,-.038,.16]];
  addPart('api-lateral',bi('Shallow lateral roots','浅侧根'),'mangroves',bi('Connects the tree to its breathing roots.','把树体与呼吸根连接起来。'),bi('Avicennia alba develops shallow lateral roots below the muddy surface. Upright breathing roots arise from this connected system. [S3]\n\nThe cutaway exposes the connection; the spacing and thickness here are schematic. [S30]','Avicennia alba 的浅侧根在泥面下延伸；直立的呼吸根从这套相连的根系长出。[S3]\n\n剖切让连接关系显露出来；这里的间距和粗细都是示意。[S30]'),{primitive:line(lateralPoints,[.022,.018,.014,.009]),extra:[line([[-.52,-.045,-.025],[-.37,-.045,.045],[-.29,-.04,.13]],[.016,.011,.006]),line([[-.58,-.04,.095],[-.73,-.04,.08]],[.01,.005])]},{connects:['api-tree','api-pencil'],explode:{dir:[-.5,0,.5],dist:.13}});
  const pencils: V3[] = [[-.52,-.045,-.025],[-.58,-.04,.095],[-.64,-.038,.16],[-.37,-.045,.045],[-.29,-.04,.13],[-.73,-.04,.08]];
  const pencilModels = pencils.map((p,i) => line([p,[p[0]+.003,.04+(i%3)*.026,p[2]],[p[0]+.005,.075+(i%3)*.026,p[2]+.002]],[.011,.008,.0025]));
  addPart('api-pencil',bi('Pencil breathing roots','铅笔状呼吸根'),'mangroves',bi('Protrudes above mud to help gas exchange.','伸出泥面，帮助气体交换。'),bi('Pencil-shaped breathing roots protrude vertically from the shallow lateral root system and take in oxygen. [S2, S3]\n\nEvery upright root in this model joins a lateral branch below the mud. The drawn heights are design values. [S30]','铅笔状呼吸根从浅侧根系统直立伸出泥面，吸收氧气。[S2, S3]\n\n模型中的每根直立根都在泥下接上侧根；画出的高度属于设计值。[S30]'),{primitive:pencilModels[0]!,extra:pencilModels.slice(1)},{connects:['api-lateral'],explode:{dir:[-.5,.5,.5],dist:.13}});
  addPart('bakau-tree',bi('Bakau Minyak tree','Bakau Minyak 红树'),'mangroves',bi('Makes food and supplies leaf material.','制造食物，并提供叶片物质。'),bi('This separate Bakau Minyak tree has prop roots descending from its trunk. Mangrove trees provide shelter and a supply of leaf material. [S2, S6, S8]\n\nThe food-web node represents continuing leaf supply. Removing that node does not make old fallen leaves disappear. [S30]','这株独立的 Bakau Minyak 有从树干向下延伸的支柱根；红树提供庇护和叶片物质。[S2, S6, S8]\n\n食物网节点表示持续的叶片供应；移走这个节点不会使已有落叶马上消失。[S30]'),tree([.18,0,-.25],true),{connects:['bakau-prop'],castShadow:true});
  const propEnds: V3[] = [[-.035,-.02,-.13],[.41,-.02,-.13],[.32,-.02,-.44],[.02,-.02,-.43],[.17,-.02,.035]];
  const propModels = propEnds.map((end,i) => line([[.18,.25+(i%2)*.09,-.25],[(.18+end[0])/2,.18,(end[2]-.25)/2],end],[.025,.02,.013]));
  addPart('bakau-prop',bi('Prop roots','支柱根'),'mangroves',bi('Anchors the tree and offers shelter.','支撑树体，并提供庇护。'),bi('Bakau prop roots extend from the trunk towards the mud and anchor the tree. Root spaces also shelter young animals. [S2]\n\nThese roots belong to the Bakau, separate from the neighbouring Api-api pencil roots. [S30]','Bakau 的支柱根从树干向泥地延伸，支撑树体；根之间的空间也能为幼小动物提供庇护。[S2]\n\n这套根属于 Bakau，与邻株 Api-api 的铅笔状根分开。[S30]'),{primitive:propModels[0]!,extra:propModels.slice(1)},{connects:['bakau-tree']});
  const fallen = [[-.13,.008,.11],[-.075,.009,.08],[-.16,.012,.06]] as V3[];
  const deadLeaves=fallen.map((p,i)=>({...leaf(p,[.8,.04,i%2 ? -.4:.4],.10,.04),tint:'token:neutral'}));
  addPart('fallen-leaves',bi('Fallen leaf material','落叶物质'),'mangroves',bi('Supplies organic material to feeding pathways.','给取食路径提供有机物质。'),bi('Some mangrove crabs eat fallen leaves and fragment them into smaller pieces. Dead leaf material still contains food energy. [S6, S24]\n\nExisting leaves stay visible when continuing tree supply is removed. Their disappearance and decomposition rate are not simulated. [S30]','有些红树林蟹取食落叶，把叶片弄成较小的碎片；死去的叶片仍含食物中的能量。[S6, S24]\n\n关闭树木持续供应时，已有落叶仍保留在画面里；这里没有模拟它们消失或分解的速率。[S30]'),{primitive:deadLeaves[0]!,extra:deadLeaves.slice(1)});
  addPart('algae-patch',bi('Surface algae','泥面藻类'),'closeups',bi('Makes food using sunlight.','利用阳光制造食物。'),bi('Algae are producers in these selected pathways. Some fiddlers and tree-climbing crabs consume algae, with evidence from different observations. [S7, S18, S24]\n\nThis patch marks a functional group on the surface; it is not a giant visible single cell or a measured local algal cover. [S30]','藻类是这些选入路径中的生产者；一些招潮蟹和树蟹会取食藻类，证据来自不同的观察。[S7, S18, S24]\n\n这个斑块标示泥面的功能组，不是一颗肉眼可见的巨大细胞，也不是当地藻类覆盖率测量。[S30]'),{primitive:oval([.055,.008,.13],.08,[1.5,.04,.65],foliage)});
  addPart('fiddler-crabs',bi('Fiddler crabs','招潮蟹'),'animals',bi('Small claw feeds; the enlarged male claw displays.','小螯取食，雄蟹的大螯用于展示。'),bi('A male fiddler has one enlarged claw and a smaller feeding claw, with eye stalks and four pairs of walking legs. [S5, S32]\n\nThe group node is represented by one specimen symbol. High tide hides it in the burrow; drawing one does not report abundance. [S5, S30]','雄招潮蟹有一只大螯和一只取食小螯，还有眼柄及四对步足。[S5, S32]\n\n群组节点用一个标本符号表示；高潮时它藏进洞中。画一只不代表野外数量。[S5, S30]'),crab([-.35,0,.04],true));
  addPart('tree-crabs',bi('Climbing crabs','攀爬蟹类'),'animals',bi('Eats leaf material and can climb above water.','取食叶片物质，也能爬到水面之上。'),bi('This teaching node groups several climbing crab kinds. Leaf material is supported by the Sungei Buloh report, while the separate algae input comes from an indexed account; these do not establish one Episesarma species diet. [S6, S7]\n\nThis specimen has four pairs of walking legs and two claws. The higher pose is schematic, with the feet against the Bakau trunk. [S32, S30]','这个教学节点合并几类会攀爬的蟹。双溪布洛报道支持叶片取食，另一个索引资料支持藻类输入；这些资料没有证实同一种 Episesarma 同时具有这份食谱。[S6, S7]\n\n这只示意标本有四对步足和一对螯；较高的姿态是示意，步足贴着 Bakau 树干。[S32, S30]'),crab([.19,.12,-.226],false,true));
  addPart('giant-mudskipper',bi('Giant mudskipper','弹涂鱼'),'animals',bi('Pectoral fins move this fish over exposed mud.','胸鳍帮助这条鱼在露泥上移动。'),bi('Giant mudskippers are fish. Modified gill chambers and skin help gas exchange out of water; fleshy pectoral fins help movement. [S4]\n\nGeneral guides include crabs as food, while local diet samples differ. The selected links are possibilities, not a measured menu. [S4, S13, S31]','弹涂鱼是鱼；特化的鳃腔和皮肤帮助它离水时进行气体交换，肉质胸鳍帮助移动。[S4]\n\n一般指南把蟹列为其食物，但不同当地样本有差异；这些线表示可能关系，不是实测食谱。[S4, S13, S31]'),fishModel([.30,.031,.145]));
  const heronExtra: Prim[]=[line([[.60,.31,-.02],[.53,.39,-.02],[.53,.49,-.02],[.62,.52,-.02],[.67,.45,-.02]],[.029,.024,.019,.021,.024],{color:'feathers',tint:'token:ink-3'}),oval([.675,.45,-.02],.032,[1.35,.8,.8],{color:'feathers',tint:'token:ink-3'}),line([[.71,.445,-.02],[.79,.36,-.02]],[.014,.0015],{color:'chitin',tint:'token:neutral'})];
  for(const z of [-.047,.007]) {
    heronExtra.push(line([[.575,.29,z],[.57,.15,z],[.59,.003,z]],[.007,.005,.003],hard));
    for(const dx of [-.025,.025]) heronExtra.push(line([[.59,.003,z],[.62,.0015,z+dx]],[.003,.0015],hard));
    heronExtra.push(oval([.687,.46,z<0?-.045:.005],.005,[1,1,1],{color:'eye',tint:'token:ink'}));
  }
  heronExtra.push(oval([.565,.34,-.044],.068,[1.6,.72,.47],{color:'feathers',tint:'token:ink-2'}));
  addPart('heron',bi('Heron','鹭'),'animals',bi('Long legs, neck and bill support feeding.','长腿、长颈与长喙帮助取食。'),bi('Herons have long necks and bills and eat fish and crustaceans. NParks lists herons among predators of giant mudskippers. [S4, S29]\n\nThis two-legged specimen represents herons generally, not a verified local feeding event by one named heron species. [S30]','鹭有长颈和长喙，会吃鱼和甲壳类；NParks 把鹭列为弹涂鱼的捕食者。[S4, S29]\n\n这只两腿的标本泛指鹭类，不声称已核实某种鹭在当地发生了一次具体捕食事件。[S30]'),{primitive:oval([.555,.33,-.02],.074,[1.48,.8,.72],{color:'feathers',tint:'token:ink-3'}),extra:heronExtra});
  addPart('small-fish',bi('Other small fish','其他小鱼'),'animals',bi('Shows prey outside the selected food graph.','表示选入食物网之外的其他猎物。'),bi('Herons and giant mudskippers can eat small fish. Real organisms may have food options outside a short teaching graph. [S4, S29]\n\nThis generic fish has no solver link. Its presence reminds us that no shown path is not the same as no possible food in nature. [S30]','鹭和弹涂鱼都可能吃小鱼；真实生物的食物选择可能超出简短教学图的范围。[S4, S29]\n\n这条普通小鱼没有求解连线；它提醒我们，图内没有路径，不等于自然界没有可能的食物。[S30]'),fishModel([.32,-.074,.34],true));
  addPart('bacteria-inset',bi('Bacteria schematic','细菌示意'),'closeups',bi('Helps explain decomposition of leaf material.','帮助说明叶片物质的分解。'),bi('Bacteria help break down mangrove leaf litter. They obtain energy from organic material in decomposition. [S10]\n\nThese separate enlarged shapes are schematic and not to scale. They are not giant bacteria living above the mud surface. [S30]','细菌参与红树林落叶的分解；它们在分解过程中从有机物质获得能量。[S10]\n\n旁置的放大形状是示意，不按比例；这不是生活在泥面上的巨大细菌。[S30]'),{primitive:oval([1.02,.21,-.06],.026,[1.8,.75,.75],{color:'tissue',tint:ink}),extra:[oval([1.07,.25,-.05],.024,[.8,1.7,.8],{color:'tissue',tint:ink}),oval([.98,.27,-.04],.022,[1.7,.8,.8],{color:'tissue',tint:ink})]});
  const hyphae: V3[][]=[[[.98,.12,.09],[1.03,.18,.10],[1.07,.23,.09]],[[1.03,.18,.10],[1.11,.18,.09],[1.14,.21,.09]],[[1.03,.18,.10],[1,.23,.10],[.96,.24,.10]],[[1.11,.18,.09],[1.13,.14,.10]]];
  const fungalModels=hyphae.map(p=>line(p,.004,{color:'tissue',tint:ink}));
  addPart('fungi-inset',bi('Fungal threads schematic','真菌丝体示意'),'closeups',bi('Breaks down dead organic material.','分解死亡的有机物质。'),bi('Fungi are among the organisms that break down mangrove leaf litter. They obtain energy from organic material, not from photosynthesis. [S10]\n\nThe branching threads are an enlarged schematic, not a species identification or a measured microscopic view. [S30]','真菌是参与红树林落叶分解的生物之一；它们从有机物质获得能量，不进行光合作用来制造食物。[S10]\n\n分枝丝体是放大示意，不是物种鉴定，也不是实测显微图像。[S30]'),{primitive:fungalModels[0]!,extra:fungalModels.slice(1)});
  addPart('gill-inset',bi('Gill-chamber schematic','鳃腔示意'),'closeups',bi('Marks a water-retaining gill chamber.','标示能保水的鳃腔。'),bi('The giant mudskipper has modified gill chambers that support breathing out of water, alongside skin gas exchange. It remains a fish. [S4]\n\nThis open cavity is an explanatory schematic, not a verified anatomical section or a lung. No detailed gill anatomy is claimed. [S30]','弹涂鱼的特化鳃腔与皮肤气体交换，帮助它离水时呼吸；它仍然是鱼。[S4]\n\n这个开放空腔只是解释示意，不是经核实的解剖断面，也不是肺；这里没有声称显示详细鳃部结构。[S30]'),{primitive:{kind:'sweep',at:[1.04,.13,.27],path:[[0,0,0],[.02,.04,0],[0,.09,0]],radius:[.044,.055,.04],section:'u',hollow:.006,radial:12,segments:16,up:[0,0,1],color:'tissue',tint:'token:ink-3'},extra:[oval([1.04,.145,.275],.028,[1,.35,.8],{color:'glass',tint:'token:cold'})]});
  addPart('boardwalk-edge',bi('Observation edge','观察边界'),undefined,bi('Marks the far observation edge.','标示远侧的观察边界。'),bi('A simple boardwalk edge suggests observing the habitat without collecting animals. It is scenery with no geographic claim. [S30]','简洁的步道边缘提示在栖地外观察；这是场景件，没有地理含义。[S30]'),{primitive:box([0,.025,-.54],[1.7,.045,.095],'wood',{tint:'token:ink-3'})},{context:true});
  addPart('specimen-base',bi('Teaching specimen base','教学标本底座'),undefined,bi('Supports the habitat and separate schematic insets.','承托生境和旁置的示意近景。'),bi('This base holds the habitat and the separate enlarged schematics. It is a display stand with no geographic meaning. [S30]','底座承托生境与旁置的放大示意，是没有地理含义的展示台。[S30]'),{primitive:box([.18,-.29,0],[2.02,.04,1.12],'plastic',{tint:'token:ink-3'}),extra:[box([1.04,.065,.08],[.29,.015,.55],'plastic',{tint:'token:neutral'})]},{context:true});
  const parsed=parts.map(p=>partSchema.parse(p));
  if(parsed.filter(p=>!p.context).length!==18 || parsed.filter(p=>p.context).length!==2) throw new Error('18 selectable + 2 context required');
  return {
    parts,groups:[{id:'habitat',name:bi('Habitat','生境'),color:'token:neutral'},{id:'mangroves',name:bi('Mangrove trees and roots','红树与树根'),color:'token:seedling'},{id:'animals',name:bi('Animals','动物'),color:'token:ink-2'},{id:'closeups',name:bi('Schematic closeups · not to scale','示意近景 · 不按比例'),color:'token:ink-3'},{id:'food-paths',name:bi('Selected food pathways','选入食物路径'),color:'token:en-light'}],
    views:{assembled:{camera:camera([2.2,1.7,2.6],[0,.35,0])},exploded:{camera:camera([2.2,1.7,2.6],[0,.35,0])},cutaway:{normal:[0,0,-1],offset:.045},cuts:{mud:{normal:[0,0,-1],offset:.045,label:bi('Mud section','泥层剖面')}},section:{plane:'xy'},cover:camera([2.5,1.8,3],[.13,.29,0]),shadows:'contact'},
    presets:[['hero','Complete habitat','完整生境',[2.2,1.7,2.6],[0,.35,0],32],['habitat-view','Habitat','生境',[1.8,1.1,2.2],[0,.2,0],32],['roots-view','Root connections','根系连接',[-1.1,.45,1.2],[-.35,.02,0],30],['tide-view','Tide poses','潮位姿态',[1.6,.5,1.6],[.1,.05,.1],32],['animal-view','Animal features','动物结构',[1.2,.45,1.3],[.2,.08,.2],28],['web-view','Food relationships','食物关系',[1.9,1.4,2.1],[.05,.25,.05],32]].map(([id,en,zh,position,target,fov])=>({id,label:bi(en as string,zh as string),camera:camera(position as V3,target as V3,fov as number)})),
    spec:[{key:bi('Model','模型'),value:bi('Habitat study','生境研究'),tag:'design'},{key:bi('Web','食物网'),value:bi('6 nodes · 6 links','6 节点 · 6 连线'),tag:'design'},{key:bi('Tide','潮位'),value:bi('Diagrammatic','示意'),tag:'design'},{key:bi('Sources','来源'),value:bi('Selected observations','选入的观察'),tag:'design'}],flows:[],animations:[],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const data=buildParts(); const parsed=partsFileBase.parse(data);
  const out=join(import.meta.dirname,'../../../src/content/topics/mangrove-food-web/data/parts.json');
  mkdirSync(join(out,'..'),{recursive:true}); writeFileSync(out,JSON.stringify(data,null,1)+'\n');
  let slots=0;
  for(const p of parsed.parts) { const b=partBounds(p)!; const n=partMaterialSlots(p).length; slots+=n; console.log(`${p.id}: ${n} slots; bbox ${JSON.stringify(b)}`); }
  console.log(`${parsed.parts.length} parts; ${slots} base material-slot calls (before contact shadow/engine passes; no GPU measurement)`);
}
