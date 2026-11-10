#!/usr/bin/env python3
"""Original schematic reef/polyp studies. Run from the repository root.

No external geometry, runtime texture, geographic data or biological scale.
The table contract is copied unchanged from authoring/sim-plan.json.
"""
import json
import math
import subprocess
from sculpt import planula, Mesh, dome as sculpt_dome, corallite, tissue as sculpt_tissue, mouth as sculpt_mouth, plate, branching, tentacles as sculpt_tentacles, reef_shelf, sand_patches, encrusting, write_glb
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TOPIC = ROOT / 'src/content/topics/coral-reef'
SIM = TOPIC / 'authoring/sim-plan.json'
PARTS = []


def bi(en, zh):
    return {'en': en, 'zh': zh}


def primitive(kind, at, color='tissue', tint='token:bone', **kwargs):
    return dict(kind=kind, at=at, color=color, tint=tint, **kwargs)


def sweep(at, path, radius, color='tissue', tint='token:bone', **kwargs):
    return primitive('sweep', at, color, tint, path=path, radius=radius,
                     radial=12, segments=24, **kwargs)


def sphere(at, radius, tint='token:food', **kwargs):
    return primitive('sphere', at, 'tissue', tint, size=[radius], **kwargs)


def lathe(at, profile, color='tissue', tint='token:bone', **kwargs):
    return primitive('lathe', at, color, tint, profile=profile, segments=40, **kwargs)


def circle(rx, ry=None, count=32):
    ry = rx if ry is None else ry
    return [[round(rx*math.cos(i*math.tau/count), 6),
             round(ry*math.sin(i*math.tau/count), 6)] for i in range(count)]


def part(id, en, zh, group, summary_en, summary_zh, detail_en, detail_zh, main, extra=None, **kwargs):
    assert len(summary_en) <= 60 and len(summary_zh) <= 60, id
    p = dict(id=id, name=bi(en, zh), group=group, summary=bi(summary_en, summary_zh),
             detail=bi(detail_en, detail_zh), primitive=main, **kwargs)
    p.setdefault('castShadow', False)
    if extra:
        assert len(extra) <= 32, (id, len(extra))
        p['extra'] = extra
    if group != 'polyp-closeup':
        p['clip'] = False
    PARTS.append(p)
    return p


def cups(at, radius, n=12):
    """A ring of small corallite cups on an upper dome (not a polyp count)."""
    out = []
    for k in range(n):
        a = math.tau*k/n
        x, z = radius*math.cos(a), radius*math.sin(a)
        out.append(lathe([at[0]+x, at[1]+.04*math.cos(2*a), at[2]+z],
                         [[.016, 0], [.029, .006], [.03, .020], [.024, .022], [.022, .010], [.016, 0]],
                         rotation=[10*math.sin(a), 0, -10*math.cos(a)]))
    return out


# Continuous adjacent zones. The front hole is a habitat-cavity study, not
# reconstructed coastal geology. All outline perturbations are deterministic.
flat_shape = [[-1.5,-.05],[-1.38,-.025],[-1.17,-.018],[-.94,-.028],[-.72,-.008],[-.5,.025],[-.5,-.75],[-1.5,-.75]]
flat_hole = [[-1.12+x,-.29+y] for x,y in circle(.14,.105)]
part('reef-flat','Reef flat','礁坪','reef-habitat',
     'Provides a shallow, relatively level reef zone.','提供较浅、较平坦的礁区。',
     'The reef flat is the relatively level part nearer shore in this schematic cross-section. Reef zones differ in exposure and environmental conditions. [S2, S4]\n\nThe model shows only the order flat–crest–slope. Its width and small cavity are original design choices, not a measured Singapore shoreline. [S50]',
     '礁坪是这个示意剖面中较靠岸、较平坦的一段；不同礁区的环境条件和受浪情况会有差别。[S2, S4]\n\n模型只表达礁坪、礁脊、礁坡的相邻顺序。这里的宽度和岩隙属于原创示意，并非新加坡某处海岸的实测形状。[S50]',
     primitive('extrude',[0,0,0],'abrasive','token:neutral',shape=flat_shape,holes=[flat_hole],depth=.86,bevel=0),castShadow=True)
part('reef-crest','Reef crest','礁脊','reef-habitat',
     'Forms the raised seaward edge of the reef.','形成礁区向海一侧较高的外缘。',
     'The crest is the raised outer part of a reef facing incoming waves. It joins the flat to the seaward slope. [S2, S4]\n\nThe connected profile is a teaching model. Its height does not set a universal depth boundary or reproduce the bathymetry of Sisters’ Islands or Pulau Hantu. [S50]',
     '礁脊是迎向海浪、较高的礁区外缘，连接礁坪和向海下降的礁坡。[S2, S4]\n\n连续的轮廓用于说明位置关系；其高度不是所有珊瑚礁共同的深度界线，也不重建姐妹岛或韩都岛的海底地形。[S50]',
     primitive('extrude',[0,0,0],'abrasive','token:neutral',shape=[[-.5,.025],[-.37,.11],[-.22,.20],[-.06,.22],[.10,.18],[.25,.105],[.25,-.75],[-.5,-.75]],depth=.86,bevel=0),castShadow=True)
part('reef-slope','Reef slope','礁坡','reef-habitat',
     'Continues from the crest down towards deeper water.','从礁脊向较深的海中下降。',
     'The reef slope descends seaward. Light and sediment conditions can change with depth; Singapore research describes reef communities in turbid water. [S4, S10]\n\nThe slope here is not a survival limit or a surveyed island profile. Real reef shapes and depth ranges vary among sites. [S10, S11, S50]',
     '礁坡向海中下降。光和沉积条件可随深度改变；新加坡研究也记录了浑浊水体中的珊瑚礁群落。[S4, S10]\n\n这里的斜面不是珊瑚存活极限，也不是某座岛的测绘剖面；实际形态和分布深度因地点而异。[S10, S11, S50]',
     primitive('extrude',[0,0,0],'abrasive','token:neutral',shape=[[.25,.105],[.43,.025],[.60,-.09],[.78,-.23],[.98,-.39],[1.2,-.51],[1.5,-.61],[1.5,-.75],[.25,-.75]],depth=.86,bevel=0),castShadow=True)

dome = [[0,-.018],[.25,-.018],[.30,.018],[.305,.075],[.275,.16],[.22,.235],[.13,.28],[0,.295]]
boulder_at = [-.88,.005,-.04]
part('colony-boulder','Boulder coral colony','圆丘状珊瑚群体','reef-habitat',
     'Joins many polyps over a shared rounded skeleton.','让许多珊瑚虫连接在圆丘状的共同骨骼上。',
     'A hard-coral colony can contain many connected polyps over a shared skeleton. The small cups mark places occupied by polyps; the skeleton itself is not living animal tissue. [S3, S5]\n\nThis irregular, pitted dome is an original boulder-form study, not an identified coral species. Visible cup number and size are design choices. Use the separate tissue layer to distinguish living tissue from mineral skeleton. [S21, S50]',
     '一个硬珊瑚群体可由许多相连的珊瑚虫组成，它们覆盖在共同的骨骼上。表面的小杯形结构是珊瑚虫所在的位置，骨骼本身不是动物的活组织。[S3, S5]\n\n这个表面起伏、有密集珊瑚杯凹穴的圆丘只表示圆丘状形态，不鉴定物种。珊瑚杯的大小和数量属于设计选择；可用独立的组织层观察活组织与矿物骨骼的区别。[S21, S50]',
     lathe(boulder_at,dome), cups([-.88,.20,-.04],.18,12)+cups([-.88,.285,-.04],.07,6), connects=['colony-tissue'],castShadow=True)

sheet_outline = [[(.23+.017*math.cos(7*a))*math.cos(a),(.18+.018*math.sin(5*a))*math.sin(a)] for a in [i*math.tau/48 for i in range(48)]]
sheet_extra = [primitive('extrude',[-.07,.30,.10],'tissue','token:food',shape=[[x*.75,y*.85] for x,y in sheet_outline],depth=.018,bevel=.002,rotation=[90,-8,0]),sweep([-.10,.12,.15],[[0,0,0],[0,.10,-.02],[.035,.18,-.05]],[.04,.03,.025],'tissue','token:food')]
for k in range(8):
    a=k*math.tau/8
    sheet_extra.append(lathe([-.1+.16*math.cos(a),.215,.15+.11*math.sin(a)],[[.009,0],[.017,.006],[.017,.012],[.011,.012],[.009,0]],'tissue','token:bone'))
part('colony-sheet','Sheet coral colony','片状珊瑚群体','reef-habitat',
     'Spreads connected polyps across a thin colony form.','让相连珊瑚虫沿较薄的片状群体分布。',
     'Some hard-coral colonies have thin sheet-like growth forms. A sheet is still a colony of animals over skeleton, not a plant leaf. [S3, S21]\n\nThe tiered plates and support are generic shape studies. They do not identify a species, age, growth rate or adaptation to a measured depth. [S50]',
     '一些硬珊瑚形成较薄的片状群体；薄片仍由覆盖骨骼的动物群体构成，并非植物的叶片。[S3, S21]\n\n这里的层片和支撑只展示一般形态，不据此判断物种、年龄、生长速度或某个实测深度的适应关系。[S50]',
     primitive('extrude',[-.1,.20,.15],'tissue','token:food',shape=sheet_outline,depth=.023,bevel=.003,rotation=[90,0,0]),sheet_extra)
part('colony-encrusting','Encrusting coral colony','覆生珊瑚群体','reef-habitat',
     'Covers a patch of hard substrate with joined polyps.','以相连珊瑚虫覆盖一片硬基底。',
     'An encrusting colony follows a surface rather than building a large projecting dome. It remains hard coral with living polyps over skeleton. [S3, S21]\n\nThe irregular crust follows the limestone slope and has recessed corallites. It compares growth forms. It does not claim a particular species is confined to the reef slope. [S50]',
     '覆生形态沿着基底表面铺展，而不是形成明显突起的大圆丘；它仍是骨骼上有活珊瑚虫的硬珊瑚。[S3, S21]\n\n不规则薄层沿石灰岩礁坡铺展，表面有凹入的珊瑚杯，用于比较形态；并不表示某一种珊瑚只生活在礁坡。[S50]',
     primitive('extrude',[.64,-.12,-.04],'tissue','token:food',shape=[[-.24,.07],[-.08,.018],[.12,-.13],[.25,-.21],[.25,-.185],[.12,-.105],[-.08,.044],[-.24,.095]],depth=.34,bevel=.003))

# Independent enlarged polyp. The hollow wall and oral annulus leave one
# central mouth. Dots lie between inner and outer soft-wall radii.
tissue_profile = [[.215,.13],[.242,.13],[.25,.28],[.26,.44],[.31,.58],[.30,.605],[.27,.61],[.235,.46],[.225,.28],[.215,.13]]
oral = primitive('extrude',[2.5,.602,0],'membrane','token:muscle-1',shape=circle(.30,count=48),holes=[circle(.073,.045,count=32)],depth=.018,bevel=.002,rotation=[90,0,0])
part('polyp-tissue','Living polyp tissue','珊瑚虫活组织','polyp-closeup',
     'Forms the living body around an internal cavity.','围成活的虫体，并包围内部腔室。',
     'A coral polyp is an animal with a soft body, a mouth and tentacles. Its living tissue is different from the external mineral skeleton. In this enlarged study the wall and oral disc remain separate from the skeletal cup. [S5, S6]\n\nAlgal partners live within the tissue, shown as enlarged dots in the wall. Translucency, wall thickness and all dimensions are teaching choices. White or pale appearance alone does not identify whether living tissue remains. [S7, S8, S50]',
     '珊瑚虫是动物，具有柔软身体、口和触手。活组织与外部的矿物骨骼不同；放大模型把虫体壁和口盘与下方骨骼杯分开显示。[S5, S6]\n\n共生藻生活在组织内，模型将它们放大为壁内的圆点。透明度、壁厚和所有尺寸均属教学示意；单看白色或苍白外观，不能判断是否仍有活组织。[S7, S8, S50]',
     lathe([2.5,0,0],tissue_profile,'membrane','token:muscle-1'),[oral],shell=True,connects=['polyp-mouth','polyp-tentacles','polyp-skeleton','polyp-symbionts'])
mouth_path = [[.073*math.cos(i*math.tau/32),0,.045*math.sin(i*math.tau/32)] for i in range(32)]
part('polyp-mouth','Single central mouth','中央唯一的口','polyp-closeup',
     'Takes in food and releases waste through one opening.','以同一个开口摄食并排出废物。',
     'Food enters through the central mouth; waste also leaves through this opening. A coral polyp does not have a second opening serving as an anus. [S5, S6]\n\nThe rounded oval lips surround one recessed mouth on a raised oral disc. The model does not show the detailed internal digestive filaments. Its size is schematic. [S50]',
     '食物由中央的口进入，废物也经同一开口排出；珊瑚虫没有另一个作为肛门的开口。[S5, S6]\n\n隆起的口盘上，圆钝的椭圆形口缘围着唯一的凹入口。模型省略了内部消化丝等细节，大小也只是示意。[S50]',
     sweep([2.5,.622,0],mouth_path,.012,'tissue','token:muscle-3',closed=True,caps='none'),connects=['polyp-tissue'])
tentacles=[]
for k in range(12):
    a=k*math.tau/12 + .025*math.sin(k*2.1)
    # Twelve simple tentacles with unequal extension, slender shafts and curls.
    reach=.22+.035*math.sin(k*1.7)
    height=.20+.055*math.cos(k*1.9)
    # Evenly spaced points on one smooth arc: the shaft rises from the oral
    # disc, then leans outward to a blunt tip (no back-folded hook).
    b0,c0,t0=(.232,.474),(.29,.50+.80*height),(.235+reach,.52+height)
    ss=[i/6 for i in range(7)]
    r=[(1-s)**2*b0[0]+2*(1-s)*s*c0[0]+s*s*t0[0] for s in ss]
    h=[(1-s)**2*b0[1]+2*(1-s)*s*c0[1]+s*s*t0[1] for s in ss]
    path=[[r[i]*math.cos(a+.025*i*math.sin(k+.7)),h[i],r[i]*math.sin(a+.025*i*math.sin(k+.7))] for i in range(7)]
    tentacles.append(primitive('sweep',[2.5,0,0],'tissue','token:muscle-1',path=path,
                              radius=[.021,.020,.017,.013,.010,.0072,.0040],radial=20,segments=48,
                              rings={'every':.012,'depth':.045}))
part('polyp-tentacles','Feeding tentacles','摄食触手','polyp-closeup',
     'Surround the mouth and help capture small food.','围绕着口，帮助捕捉小型食物。',
     'Tentacles surround the mouth and help capture food. Stinging cells in the outer tissues assist capture; the model enlarges surface batteries as small bumps without counting individual cells. [S5, S6]\n\nThis hard-coral study has twelve short, plump, unbranched tentacles in two staggered cycles, one example of a multiple-of-six arrangement. The count is a design example, not a claim about all species. RUN adds a slow schematic sway, not a measured feeding frequency. [S5, S50]',
     '触手环绕着口，帮助捕捉食物。外层组织中的刺细胞可协助捕食，模型以小突起放大表示刺细胞群，不计数单个细胞。[S5, S6]\n\n这个硬珊瑚示例画了分为两轮错列的十二根短而饱满、不分羽状枝的触手，是六的倍数排列的一例，不代表所有物种。RUN只加入缓慢的示意摆动，不是实测摄食频率。[S5, S50]',
     tentacles[0],tentacles[1:],connects=['polyp-mouth'])

cup_profile=[[0,-.035],[.24,-.035],[.29,.025],[.325,.20],[.33,.43],[.313,.455],[.291,.44],[.288,.23],[.253,.07],[0,.07]]
septa=[]
for k in range(24):
    a=k*math.tau/24
    # Solid radial plates, alternating inward reach; no invented tissue organ.
    length=.14 if k%2==0 else .105
    shape=[[-length/2,-.05],[length/2,-.05],[length/2,.15],[-length/2,.085]]
    r=.285-length/2
    septa.append(primitive('extrude',[2.5+r*math.cos(a),.24,r*math.sin(a)],'tissue','token:bone',shape=shape,depth=.008,bevel=.001,rotation=[0,-a*180/math.pi,0]))
part('polyp-skeleton','External skeletal cup','外部骨骼杯','polyp-closeup',
     'Supports the polyp in a hard mineral cup.','以坚硬的矿物杯状结构承托珊瑚虫。',
     'Reef-building hard corals secrete an external calcium-carbonate skeleton. The polyp sits in a cup; radial skeletal partitions project inwards. Living tissue is a different structure. [S3, S5, S6]\n\nThe cup and radial plates are an enlarged generic model, not a species specimen or a count of its septa. The skeleton remains when the tissue-evidence comparison hides soft parts; this does not simulate the time course of bleaching. [S8, S50]',
     '造礁硬珊瑚分泌外部的碳酸钙骨骼。珊瑚虫位于杯状结构中，杯内可见向内伸出的放射隔片；活组织是另一种结构。[S3, S5, S6]\n\n杯体和隔片是放大的一般模型，不代表某种标本，也不声称真实隔片数量。组织证据比较隐藏柔软部分时，骨骼仍保留；这不是白化过程的时间模拟。[S8, S50]',
     lathe([2.5,0,0],cup_profile),septa,shell=True,connects=['polyp-tissue'])
dots=[]
for k in range(30):
    a=(k%10)*math.tau/10+.12*(k//10)
    y=.21+.105*(k//10)
    radius=[.211,.218,.230][k//10]*(1+.025*math.cos(12*a)+.012*math.sin(5*a))
    dots.append(sphere([2.5+radius*math.cos(a),y,radius*math.sin(a)],.008))
part('polyp-symbionts','Algal partners in tissue','组织内的共生藻','polyp-closeup',
     'Make food by photosynthesis while living in tissue.','在组织内生活，并通过光合作用制造食物。',
     'These algae live within coral tissue and make organic food by photosynthesis. Food products can pass to the host; the coral remains an animal. [S7]\n\nThe enlarged dots are inside the model’s tissue wall, not free in the digestive cavity or outside in seawater. Their spacing, count and apparent size are schematic. Bleaching can involve loss of algae or their pigments. [S8, S27, S50]',
     '这些藻类生活在珊瑚组织内，能通过光合作用制造有机食物，并把部分产物传给宿主；珊瑚仍然是动物。[S7]\n\n放大的圆点位于模型的组织壁内，不在消化腔中，也不漂浮在外面的海水里。间距、数量和大小皆为示意；白化可涉及失去共生藻或其色素。[S8, S27, S50]',
     dots[0],dots[1:],connects=['polyp-tissue'])

# Dedicated web specimens: none is shared with the anatomy platform.
part('web-symbionts','Algal-partner specimen','共生藻标本示意','web-specimens',
     'Represents the partner that supplies food products.','代表可向宿主传递食物产物的伙伴。',
     'This producer node represents photosynthetic algal partners of coral. The arrow to coral means transfer of food products, not swallowing whole algal cells. [S7]\n\nThe separate enlarged cluster is a diagram specimen, not algae floating outside the coral at this scale. It is a model copy; removing this node does not remove anatomy from the polyp platform. [S50]',
     '这个生产者节点代表珊瑚的光合藻伙伴。指向珊瑚的箭头表示食物产物转移，不表示吞食整颗藻细胞。[S7]\n\n独立放大的细胞簇是图解标本，并非按此比例漂浮在珊瑚外。它是模型复制件；从食物网移走此节点，不会删掉放大虫体台上的结构。[S50]',
     sphere([4.38,.91,0],.077),[sphere([4.38+x,.91+y,z],.055) for x,y,z in [[-.105,.04,.025],[.07,.10,-.025],[.115,-.03,.025],[-.045,-.105,.015]]])
part('web-phytoplankton','Phytoplankton specimen','浮游植物标本示意','web-specimens',
     'Represents photosynthetic producers drifting in water.','代表在水中漂浮的光合生产者。',
     'Phytoplankton are photosynthetic plankton. The selected food-web pathway links them to zooplankton that feed on them; it does not describe every plankton species. [S18, S19]\n\nSimple enlarged cells stand for this functional group. Their design is not a species identification, and they are separate from the algal partners within coral tissue. Sizes across the specimen platform cannot be compared as real body sizes. [S50]',
     '浮游植物是浮游的光合生物。本图选取了它们被浮游动物摄食的路径，不代表全部浮游生物的食谱。[S18, S19]\n\n放大的简单细胞只代表这一功能组，不用于鉴定物种；它们与珊瑚组织内的共生藻分开。标本台上各对象的画面大小不能作为真实体长比较。[S50]',
     primitive('sphere',[5.62,.93,0],'membrane','token:food',size=[.115],scale=[1,1,.65]),[sphere([5.62,.93,.02],.033),primitive('sphere',[5.77,1.015,-.03],'membrane','token:food',size=[.06])])
part('web-zooplankton','Zooplankton specimen','浮游动物标本示意','web-specimens',
     'Represents drifting animals in selected food paths.','代表选定食物路径中的漂浮动物。',
     'Zooplankton include drifting animals. In this selected pathway they consume phytoplankton and can be captured by coral tentacles. Other diets and links are omitted. [S6, S18]\n\nThe smooth, enlarged microanimal silhouette has no species-specific appendage claim. It is a functional-group diagram specimen. An animal with no shown food path remains visible: that diagram state does not prove immediate death. [S50]',
     '浮游动物包括随水漂浮的动物。本图选取摄食浮游植物、又可被珊瑚触手捕捉的一条路径；其他食物和关系没有画出。[S6, S18]\n\n平滑的放大微动物轮廓不声称某物种的附肢结构，只是功能组标本。没有已画食物路径的动物仍然可见；这种图状态不能证明动物立即死亡。[S50]',
     sweep([5.62,.42,0],[[-.055,.13,0],[0,.07,0],[.03,-.04,0],[.012,-.15,0]],[.025,.08,.065,.006],'membrane','token:cold',section={'flat':.65},up=[0,0,1]),[sphere([5.635,.42,.015],.04,'token:neutral',scale=[.65,1.45,.65])])
web_coral_at=[5,.01,0]
part('web-coral','Coral-animal specimen','珊瑚动物标本示意','web-specimens',
     'Represents the animal receiving two shown food paths.','代表接收两条已画食物路径的珊瑚动物。',
     'Coral is the animal consumer node. The selected graph shows food products from algal partners and captured zooplankton as two different pathways. Having photosynthetic partners does not turn the host into a plant. [S6, S7, S18]\n\nThis small colony copies the boulder-form study for the diagram only. A remaining pathway does not establish that enough food is available for survival. The graph does not model population change or energy quantities. [S50]',
     '珊瑚是动物消费者节点。本图分别画出伙伴传递的食物产物和捕获浮游动物两条路径；具有光合伙伴，不会使宿主变成植物。[S6, S7, S18]\n\n这个小群体仅为图解复制圆丘状形态。仍有一条路径，不等于食物足以维持生存；本图不计算种群变化或能量数量。[S50]',
     lathe(web_coral_at,[[r*.65,y*.65] for r,y in dome],'tissue','token:muscle-1'),cups([5,.15,0],.105,8))
algae=[]
for k in range(17):
    a=k*2.399963
    r=.115*math.sqrt(k/17)
    h=.13+.045*math.cos(k*1.6)
    algae.append(sweep([4.38+r*math.cos(a),-.48,r*math.sin(a)],[[0,0,0],[.01,h*.45,.005],[.026,h,0]],[.015,.011,.003],'tissue','token:food'))
part('web-turf-algae','Reef-surface algae','礁面藻类','web-specimens',
     'Grow on reef surfaces and supply a grazing food path.','生长在礁面，形成一条被啃食的食物路径。',
     'Reef-surface algae are separate from the algal partners living inside coral. NParks describes parrotfish grazing on reef surfaces. [S17]\n\nThe short tuft marks an external producer node; it is not a magnified coral organ. Its simplified blades and number have no species or population meaning. This diagram omits other parrotfish foods. [S50]',
     '礁面藻类与珊瑚组织内的共生藻是分开的对象。NParks描述了鹦嘴鱼在礁面啃食的行为。[S17]\n\n短藻丛代表外部的生产者节点，不是放大的珊瑚器官。简化的藻体及其数量不表示物种或种群数量；本图也省略鹦嘴鱼的其他食物。[S50]',
     algae[0],algae[1:])

fish_at=[5.68,-.43,0]
fish=sweep(fish_at,[[-.25,0,0],[-.14,.02,0],[.03,.02,0],[.18,.015,0],[.235,0,0]],[.035,.115,.14,.105,.04],'scales','token:cold',section={'flat':.50},up=[0,0,1])
fish_extra=[
    sphere([5.89,-.43,0],.092,'token:cold',scale=[.8,.94,.63]),
    primitive('extrude',[5.38,-.43,0],'tissue','token:cold',shape=[[.035,.025],[-.11,.13],[-.085,.015],[-.11,-.12],[.035,-.025]],depth=.018,bevel=.002),
    primitive('extrude',[5.65,-.285,0],'tissue','token:cold',shape=[[-.16,-.03],[-.12,.07],[-.07,.10],[.03,.085],[.12,.045],[.15,-.03]],depth=.014,bevel=.001),
    primitive('extrude',[5.62,-.55,0],'tissue','token:cold',shape=[[-.12,.025],[-.08,-.065],[.04,-.05],[.11,.025]],depth=.012,bevel=.001),
    sweep([5.95,-.425,0],[[0,.018,-.038],[.035,.018,0],[0,.018,.038]],.012,'tissue','token:bone'),
    sweep([5.95,-.445,0],[[0,0,-.035],[.025,-.002,0],[0,0,.035]],.012,'tissue','token:bone'),
]
for side in [-1,1]:
    fish_extra += [
        sphere([5.87,-.40,side*.058],.017,'token:ink',scale=[1,1,.45]),
        sphere([5.872,-.399,side*.065],.006,'token:bone'),
        sweep([5.74,-.45,side*.065],[[0,0,0],[-.055,-.04,side*.045],[-.12,-.10,side*.05]],[.032,.026,.005],'membrane','token:cold',section={'flat':.30},up=[0,0,1]),
        sweep([5.78,-.53,side*.04],[[0,0,0],[-.035,-.055,side*.025],[-.08,-.075,side*.02]],[.019,.016,.003],'tissue','token:cold',section={'flat':.30},up=[0,0,1]),
        sweep([5.80,-.44,side*.07],[[0,.065,0],[-.02,.02,side*.01],[0,-.065,0]],.004,'tissue','token:neutral'),
    ]
part('web-parrotfish','Parrotfish specimen','鹦嘴鱼标本示意','web-specimens',
     'Uses a beak-like jaw to graze reef surfaces.','用喙状颌在礁面啃食。',
     'Parrotfish have a beak-like mouth used in feeding on reef surfaces. The selected arrow from reef-surface algae represents a general grazing relationship described by NParks. [S17]\n\nThis unspecific functional-group model shows a compressed fish body, a beak-like jaw, paired pectoral and pelvic fins, and median fins. It does not identify a local species. Losing the only shown food path means no food in this diagram, not proven starvation in nature. [S50]',
     '鹦嘴鱼以喙状口部在礁面摄食。本图从礁面藻类指向它的箭头，代表NParks描述的一般啃食关系。[S17]\n\n这个不定种的功能组模型展示侧扁身体、喙状颌、成对胸鳍和腹鳍及中央各鳍，不鉴定本地物种。失去唯一已画路径，只表示本图没有食物路径，并非证明自然界中已经饿死。[S50]',
     fish,fish_extra)

# Independent environmental and conservation evidence studies.
haze=[]
for k in range(32):
    haze.append(sphere([7.67+.61*((k*13)%31)/31,.30+.65*((k*7)%29)/29,-.16+.27*((k*11)%23)/23],.006+.003*(k%3),'token:neutral'))
part('water-haze','Suspended particles','悬浮颗粒','evidence-tools',
     'Represents particles that can reduce light in water.','表示可减少水中透光的悬浮颗粒。',
     'Suspended particles affect underwater light. Local research examines both light limitation and sedimentation on Singapore’s turbid reefs. Turbid water does not imply that coral is absent. [S9, S10, S11]\n\nThese sparse, enlarged dots are a visibility cue for the water-case choice, not a particle concentration measurement. They are distinct from particles already deposited on a surface. The light table uses original design coefficients. [S50]',
     '悬浮颗粒会影响水下透光。本地研究讨论了新加坡浑水礁的光限制和沉积作用，水浑并不等于没有珊瑚。[S9, S10, S11]\n\n稀疏、放大的圆点只是水体选项的可见提示，不是颗粒浓度实测值。它们与已沉积在表面的颗粒不同；光指数表使用原创示意系数。[S50]',
     haze[0],haze[1:])
part('light-marker','Relative-light marker','相对光指数标记','evidence-tools',
     'Moves vertically to display a relative light index.','以竖直位置显示相对光指数。',
     'This marker reads an illustrative relative light index on the gauge, calculated as 100 × exp(−kz). The depth choices are 1, 3 and 7 metres; design coefficients are 0.1 and 0.5 per metre for the two water cases. [S50]\n\nIts height is the index, not a depth: read depth from the pointer on the metre scale. It cannot establish a coral survival threshold, water temperature, bleaching risk or measured Singapore irradiance. [S10, S50]',
     '标记在标尺上读取示意的相对光指数，计算为100 × exp(−kz)。深度选项为1、3和7米；两种水体采用每米0.1和0.5的设计衰减系数。[S50]\n\n标记的高度是指数，不是深度；深度请看米刻度上的指针。它不确定存活阈值、水温、白化风险或新加坡现场照度。[S10, S50]',
     primitive('extrude',[7.42,0,.15],'powder','token:signal',shape=[[-.10,-.014],[.025,-.014],[.025,-.036],[.092,0],[.025,.036],[.025,.014],[-.10,.014]],depth=.014,bevel=.003))
frame=primitive('bevelBox',[8.03,.10,0],'powder','token:neutral',size=[.64,.035,.43],bevel=.007)
frame_extra=[]
for x in [7.75,8.31]:
    for z in [-.17,.17]:
        frame_extra.append(primitive('cylinder',[x,-.035,z],'powder','token:neutral',size=[.018,.018,.25]))
for z in [-.11,0,.11]:
    frame_extra.append(primitive('box',[8.03,.13,z],'powder','token:neutral',size=[.60,.018,.014]))
part('nursery-frame','Coral nursery support','珊瑚苗圃支架','evidence-tools',
     'Supports corals during an illustrative nursery stage.','在示意的苗圃阶段承托珊瑚。',
     'A coral nursery can cultivate corals before suitable restoration work. NParks describes nursery work at Small Sister’s Island. [S13]\n\nThis generic support is original geometry, not a copy of a specific NParks or JTC engineering design. A support and planted fragments show an action; monitoring is needed to assess outcomes. [S14, S15, S50]',
     '珊瑚苗圃可先培育珊瑚，再供合适的修复工作使用；NParks介绍了小姐妹岛的苗圃工作。[S13]\n\n支架是原创的一般示意，不复制NParks或JTC某项具体工程设计。支架和栽植碎片展示的是行动；结果仍需监测评估。[S14, S15, S50]',
     frame,frame_extra,connects=['nursery-fragments'])
fragments=[]
for x,z,s in [(7.82,.07,.30),(8.03,-.06,.38),(8.23,.08,.26)]:
    fragments.append(lathe([x,.135,z],[[r*s,y*s] for r,y in dome],'tissue','token:muscle-1'))
    fragments.append(lathe([x-.025,.135+.20*s,z+.015],[[.008,0],[.020,.008],[.021,.018],[.013,.018],[.008,0]]))
part('nursery-fragments','Nursery coral fragments','苗圃珊瑚碎片','evidence-tools',
     'Represent corals cultivated for suitable restoration.','代表为合适修复工作而培育的珊瑚。',
     'Nursery corals may be used in restoration work. The 100k Corals Initiative was announced as a planting goal; later reports describe work carried out. A planting total is not itself a survival rate. [S13, S14, S15]\n\nThe three branching fragments here are illustrative copies with fused forks and open tip corallites. Their number, size and colour are not counts of real nursery stocks, transplantation success or future growth. [S50]',
     '苗圃珊瑚可用于修复。100k珊瑚计划宣布的是种植目标，后续报告介绍已开展的工作；种植数量本身不是成活率。[S13, S14, S15]\n\n这三株分枝碎片是示意复制件，可见融合的分叉和顶端珊瑚杯；数量、大小和颜色不表示真实苗圃存量、移植成功率或未来生长情况。[S50]',
     fragments[0],fragments[1:],connects=['nursery-frame'])
qpath=[[-.40,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[-.5,0,-.5],[-.40,0,-.5]]
qextra=[]
for t in [-.3,-.1,.1,.3]:
    for path in [[[t,0,-.5],[t,0,.5]],[[-.5,.001,t],[.5,.001,t]]]:
        qextra.append(primitive('sweep',[9.0,.028,0],'fabric','token:cold',path=path,radius=.0018,radial=8,segments=4,caps='flat'))
# Four elbow socket collars on each straight run; 25mm PVC outer diameter.
for x,z,rot in [(-.45,-.5,[0,0,90]),(.45,-.5,[0,0,90]),(-.45,.5,[0,0,90]),(.45,.5,[0,0,90]),(-.5,-.45,[90,0,0]),(-.5,.45,[90,0,0]),(.5,-.45,[90,0,0]),(.5,.45,[90,0,0])]:
    qextra.append(lathe([9+x,.028,z],[[.0125,-.025],[.015,-.023],[.015,.023],[.0125,.025]],'plastic','token:bone',rotation=rot))
for collar in qextra[8:]:
    collar['segments']=24
part('monitoring-quadrat','Monitoring quadrat','监测样方','evidence-tools',
     'Frames a repeatable patch for observation.','框出一片可重复观察的区域。',
     'Repeated observations help researchers compare communities over time. Museum collections and documented records provide another kind of evidence; LKCNHM maintains a cnidarian collection. [S16]\n\nThis square PVC frame has a nominal one-metre side and a string grid. It is an original generic quadrat, not the measured equipment of a particular study. It suggests returning to compare evidence; it does not produce a live reef count or prove a restoration outcome. [S50]',
     '重复观察有助研究者比较不同时期的群落。博物馆馆藏和有记录的标本提供另一类证据；LKCNHM保存刺胞动物馆藏。[S16]\n\n这个正方形PVC框每边示意为一米，内有细绳网格；它是原创的一般样方，不是某项研究仪器的实测复刻。它提示回到同一区域比较证据，不产生实时礁区数量，也不证明修复结果。[S50]',
     primitive('tube',[9,.028,0],'plastic','token:bone',path=qpath,radius=.0125,bendRadius=.035),qextra)

part('sediment-deposit','Deposited sediment','沉积颗粒层','evidence-tools',
     'Represents particles settled onto a surface.','表示已落在表面的颗粒。',
     'Sedimentation is different from particles suspended in water. Deposited material can cover reef surfaces and affect corals; local research separates light limitation from sediment effects. [S9, S10]\n\nThe thin grey layer is an enlarged schematic deposit on a small supporting patch. It has no measured thickness, mass or deposition rate. Heat stress is a separate pressure and is not calculated here. [S9, S50]',
     '沉积与颗粒悬浮在水中不同。落下的物质可覆盖礁面并影响珊瑚；本地研究把光限制和沉积影响分开讨论。[S9, S10]\n\n薄灰层是支撑面上放大的沉积示意，不具有实测厚度、质量或沉积速率。热胁迫是另一种压力，本模型没有计算它。[S9, S50]',
     primitive('extrude',[7.95,-.29,.09],'abrasive','token:neutral',shape=[[-.37,-.025],[-.39,.014],[-.21,.029],[0,.020],[.20,.035],[.38,.005],[.36,-.025]],depth=.46,bevel=.002),[primitive('bevelBox',[7.95,-.34,.09],'abrasive','token:bone',size=[.84,.065,.54],bevel=.012)])

layer_profile=[[r+.004 if r else 0,y+.006] for r,y in dome]
part('colony-tissue','Colony living-tissue layer','群体活组织层','reef-habitat',
     'Connects living polyps across the shared skeleton.','在共同骨骼表面连接活的珊瑚虫。',
     'Thin living tissue links neighbouring polyps over the colony skeleton. A colony is not simply a stone; the mineral skeleton and living animal layer are different. [S5, S6]\n\nThis translucent overlay makes that distinction visible. It is a schematic model layer, and its colour or transparency cannot diagnose bleaching or death. Use the polyp evidence comparison to examine which structures remain. [S8, S50]',
     '薄层活组织在群体骨骼表面连接相邻珊瑚虫。珊瑚群体不只是一块石头：矿物骨骼与活的动物层不同。[S5, S6]\n\n半透明覆盖层把这种区别显示出来，但它仍是示意模型；单凭颜色或透明度不能诊断白化或死亡。可在放大珊瑚虫的证据比较中观察哪些结构仍在。[S8, S50]',
     lathe(boulder_at,layer_profile,'membrane','token:muscle-1'),shell=True,connects=['colony-boulder'])
part('larva-inset','Swimming larva inset','游动幼体插图','polyp-closeup',
     'Represents the dispersing stage before settlement.','表示附着之前可扩散的幼体阶段。',
     'Coral larvae can disperse before settling on a suitable surface. The attached adult polyp does not walk to a new reef in the way a swimming larva disperses. [S26]\n\nA mature larva, or planula, is elongated from end to end and covered in cilia, the fine beating hairs it swims with. Many reported planulae travel with the aboral end first, and that end attaches at settling. The small pit at the narrow end marks the oral pore. [S28]\n\nThis enlarged model has no shared scale with the adult and identifies no species. Its cilia are drawn much thicker and fewer than real ones. [S50]',
     '珊瑚幼体可先扩散，再附着到合适的表面。已附着的成体珊瑚虫不会像游动幼体一样游到另一片礁区。[S26]\n\n成熟的幼体（浮浪幼体）沿身体长轴伸长，全身覆盖纤毛，靠摆动纤毛游动。许多研究记录的浮浪幼体以反口端在前游动，定居时也以这一端附着。较细一端的小凹坑表示口孔。[S28]\n\n这个放大模型与成体不共用比例尺，也不鉴定物种；纤毛画得比真实的粗得多、少得多。[S50]',
     sphere([3.12,.21,.04],.075,'token:muscle-1',scale=[.72,1.65,.68],rotation=[0,0,-22]),clip=False)
outer=[[-1.12+x,-.29+y] for x,y in circle(.165,.130)]
inner=[[-1.12+x,-.29+y] for x,y in circle(.14,.105)]
part('refuge-cavity','Shelter cavity','庇护岩隙','reef-habitat',
     'Provides a small sheltered space in the reef model.','在礁体模型中提供一处小型庇护空间。',
     'Reefs provide habitat and shelter for many organisms. Crevices and cavities contribute physical spaces within that habitat. [S2, S4]\n\nThe selectable inner rim marks an original small shelter opening. This is neither a mapped cave nor an observation of an animal occupying a named Singapore site. [S50]',
     '珊瑚礁为许多生物提供栖息地和庇护，缝隙与洞穴构成其中的空间。[S2, S4]\n\n可选中的内缘标出原创的小型庇护开口；它不是测绘洞穴，也不表示在新加坡某地点观察到某种动物居住。[S50]',
     primitive('extrude',[0,0,.39],'abrasive','token:bone',shape=outer,holes=[inner],depth=.08,bevel=.002))

part('substrate-context','Reef support context','礁体承托示意','reef-habitat',
     'Supports the connected schematic reef section.','承托连续的示意礁剖面。',
     'Irregular sand pockets occupy sheltered hollows in this original schematic cross-section. It is not surveyed geology, a sea-level plane or a Singapore map. [S50]',
     '不规则沙斑位于原创示意礁剖面的低洼处，不是实测地质、海平面或新加坡地图。[S50]',
     primitive('bevelBox',[0,-.78,0],'abrasive','token:neutral',size=[3.04,.05,.91],bevel=.009),context=True)
part('inset-base','Enlarged-study base','放大模型底缘','polyp-closeup',
     'Separates the enlarged animal study from the reef.','将放大的动物模型与礁体分开。',
     'This low unmarked base separates the enlarged polyp study from the reef platform. It supplies no biological scale or measured magnification. [S50]',
     '没有标记的低底缘将放大珊瑚虫与礁体台分开，不提供生物真实比例尺或实测放大倍数。[S50]',
     primitive('bevelBox',[2.5,-.075,0],'abrasive','token:neutral',size=[.76,.05,.69],bevel=.009),context=True,clip=False)

# Water-column study (S10, S11, S50): 1 m = 0.1 scene units, surface at y = 1.
X0,X1,Z0,Z1=14.62,15.34,-.20,.20
SURFACE=1.0
def plane_layers(depths):
    # Each sheet is one equal light-loss step (e^-0.5): every 1 m at k = 0.5, every 5 m at k = 0.1.
    return [primitive('plane',[(X0+X1)/2,(SURFACE-d*.1)/2,Z1+.001*i],'glass','token:cold',size=[X1-X0,SURFACE-d*.1]) for i,d in enumerate(depths)]
turbid=plane_layers(range(10)); clear=plane_layers([0,5])
part('water-column-turbid','Water column: more turbid','水柱：较高浑浊度','water-study',
     'Darkens with depth using the more turbid coefficient.','按较高浑浊度系数随深度变暗。',
     'Water absorbs and scatters light, and suspended particles reduce it further, so less light reaches deeper reefs. Singapore reef research describes this light limitation in turbid water. [S9, S10]\n\nEach darker step stands for one equal fall in the illustrative light index, reached every metre at this design coefficient of 0.5 per metre. The steps are a drawing of the design calculation, not a measured Singapore water profile. [S50]',
     '水会吸收和散射光，悬浮颗粒使透光进一步减少，所以较深的礁得到的光较少。新加坡的珊瑚礁研究描述了浑水中的这种光限制。[S9, S10]\n\n每加深一级颜色，代表示意光指数下降相同比例；在每米0.5的设计系数下，每1米下降一级。这些色阶画的是设计计算，不是新加坡海水的实测剖面。[S50]',
     turbid[0],turbid[1:],clip=False)
part('water-column-clear','Water column: less turbid','水柱：较低浑浊度','water-study',
     'Darkens more slowly using the less turbid coefficient.','按较低浑浊度系数较慢地变暗。',
     'With fewer suspended particles, light is reduced more slowly with depth. [S9, S10]\n\nEach darker step stands for the same fall in the illustrative light index as in the more turbid column, reached every 5 metres at this design coefficient of 0.1 per metre. It is a drawing of the design calculation, not a measurement. [S50]',
     '悬浮颗粒较少时，光随深度减弱得较慢。[S9, S10]\n\n每加深一级颜色，代表与较高浑浊度水柱相同比例的示意光指数下降；在每米0.1的设计系数下，每5米下降一级。这里画的是设计计算，不是实测。[S50]',
     clear[0],clear[1:],clip=False)
def bar(a,b):
    centre=[(a[i]+b[i])/2 for i in range(3)];size=[max(abs(a[i]-b[i]),.007) for i in range(3)]
    return primitive('box',centre,'powder','token:ink-3',size=size)
y0=SURFACE-1.0
edges=[]
for x in [X0,X1]:
    for z in [Z0,Z1]:
        edges.append(bar([x,y0,z],[x,SURFACE,z]))
for y in [y0,SURFACE]:
    for z in [Z0,Z1]:
        edges.append(bar([X0,y,z],[X1,y,z]))
    for x in [X0,X1]:
        edges.append(bar([x,y,Z0],[x,y,Z1]))
ticks=[primitive('box',[15.385 if m%5 else 15.375,SURFACE-m*.1,Z1],'powder','token:ink-2',size=[.03 if m%5 else .05,.006 if m%5 else .009,.012]) for m in range(11)]
part('depth-scale','Depth scale, 0 to 10 m','深度尺（0–10 米）','water-study',
     'Measures depth in metres below the surface.','以米为单位标出水面以下的深度。',
     'The scale starts at the water surface and marks every metre to 10 m, with longer marks at 0, 5 and 10 m. Singapore sources describe reef depths in this range: crests near 2–3 m, slopes near 7 m and typical coral limits near 8 m at studied sites. [S10, S11]\n\nThe frame around the water is a drawing aid. The width of the column has no scale. [S50]',
     '刻度从水面算起，每米一格直到10米，0、5、10米处刻线较长。新加坡的资料描述的礁区深度就在这一范围：礁脊约2–3米，礁坡约7米，研究地点的常见珊瑚深度界限约8米。[S10, S11]\n\n水柱外框只是绘图辅助，水柱宽度没有比例。[S50]',
     primitive('box',[15.40,SURFACE-.5,Z1],'powder','token:ink-2',size=[.012,1.0,.012]),ticks+edges,clip=False)
part('depth-pointer','Chosen depth','所选深度','water-study',
     'Points to the chosen depth on the scale.','指向深度尺上所选的深度。',
     'The pointer follows the illustrative depth control: 1, 3 or 7 metres. Read it against the metre marks. [S50]',
     '指针跟随示意深度控件，可选1、3或7米，请对照米刻度读数。[S50]',
     primitive('extrude',[15.42,SURFACE,Z1],'powder','token:cold',shape=[[.125,-.014],[.067,-.014],[.067,-.036],[0,0],[.067,.036],[.067,.014],[.125,.014]],depth=.014,bevel=.003),clip=False)
part('depth-crest-band','Crests studied at 2–3 m','研究中的礁脊：2–3 米','water-study',
     'Marks crest depths in a 2020 Singapore study.','标出2020年新加坡研究中的礁脊深度。',
     'A 2020 study at Kusu Island and Pulau Hantu compared reef crests at 2–3 m with reef slopes at 7 m. [S10]\n\nThese are the depths of that study, not a rule for every reef. [S10]',
     '2020年在龟屿与韩都岛的研究比较了2–3米深的礁脊和7米深的礁坡。[S10]\n\n这些是该研究的深度，不是所有礁区的规律。[S10]',
     primitive('box',[15.60,SURFACE-.25,Z1],'powder','token:signal',size=[.03,.10,.012]),clip=False)
part('depth-slope-mark','Slopes studied at 7 m','研究中的礁坡：7 米','water-study',
     'Marks the slope depth in the same 2020 study.','标出同一项2020年研究中的礁坡深度。',
     'The same 2020 study at Kusu Island and Pulau Hantu compared slopes at 7 m with crests at 2–3 m. [S10]\n\nThe mark is a study depth, not a survival limit. [S10]',
     '同一项2020年研究在龟屿与韩都岛比较了7米深的礁坡和2–3米深的礁脊。[S10]\n\n这条标记是研究深度，不是存活界限。[S10]',
     primitive('box',[15.60,SURFACE-.70,Z1],'powder','token:signal',size=[.03,.014,.012]),clip=False)
part('light-gauge','Relative-light gauge','相对光指数标尺','water-study',
     'Reads the light index from 0 at the foot to 100.','读取相对光指数，底部为0，顶部为100。',
     'Read the orange marker against this gauge: the foot is 0 and the top is 100, with marks every 25. The gauge shows the illustrative index, not depth, so it does not line up with the metre scale. [S50]',
     '请对照这把标尺读橙色标记：底部为0，顶部为100，每25一格。标尺显示的是示意指数，不是深度，因此不与米刻度对齐。[S50]',
     primitive('box',[14.53,.5,.15],'powder','token:ink-2',size=[.012,1.0,.012]),
     [primitive('box',[14.555,v*.01,.15],'powder','token:ink-2',size=[.04,.007,.012]) for v in (0,25,50,75,100)],clip=False)

groups=[dict(id=id,name=bi(en,zh),color=color) for id,en,zh,color in [
    ('reef-habitat','Reef zones','礁区','token:neutral'),
    ('polyp-closeup','Polyp close-up','珊瑚虫放大','token:muscle-1'),
    ('web-specimens','Food-web specimens','食物网标本','token:food'),
    ('evidence-tools','Environmental evidence','环境证据','token:cold'),
    ('water-study','Water column','水柱','token:cold'),
    ('feeding-flows','Shown food pathways','已画食物路径','token:food')]]

flows=[]
for id,path,parts in [
    ('e-symbionts-coral',[[4.43,.84,.10],[4.54,.57,.18],[4.74,.31,.17],[4.94,.18,.08]],['web-symbionts','web-coral']),
    ('e-phyto-zoo',[[5.62,.82,.08],[5.68,.67,.14],[5.65,.56,.10]],['web-phytoplankton','web-zooplankton']),
    ('e-zoo-coral',[[5.53,.35,.10],[5.36,.25,.17],[5.13,.17,.08]],['web-zooplankton','web-coral']),
    ('e-algae-parrotfish',[[4.48,-.39,.08],[4.85,-.27,.16],[5.20,-.24,.14],[5.47,-.35,.09]],['web-turf-algae','web-parrotfish'])]:
    flows.append(dict(id=id,group='feeding-flows',path=path,parts=parts,speed=.18,color='token:food',ends='open',count=16,size=.7,spread=.006,clip=False,whenRun=True))

cameras={
    'hero':([3,2.3,4],[0,-.1,0],bi('Overview','总览')),
    'reef':([2,1.4,3.7],[0,-.1,0],bi('Reef zones','礁区')),
    'polyp':([2.5,1.30,1.48],[2.5,.36,0],bi('Polyp','珊瑚虫')),
    'web':([5,1.8,3.4],[5,.3,0],bi('Food web','食物网')),
    'evidence':([9.5,2.0,3.7],[8.35,.28,0],bi('Evidence','环境证据')),
    'conservation':([9.4,1.8,3.3],[8.4,.15,0],bi('Conservation','保护')),
}
# Separate enlarged studies enough to keep neighbouring platforms out of
# local camera frames while preserving all named presets in every chapter.
layout_offsets = {'polyp-closeup': 2.5, 'web-specimens': 5, 'evidence-tools': 7}
for item in PARTS:
    dx = layout_offsets.get(item['group'], 0)
    for shape in [item['primitive'], *item.get('extra', [])]:
        shape['at'][0] += dx
for flow in flows:
    for point in flow['path']:
        point[0] += 5
for id, (position, target, _) in cameras.items():
    dx = {'polyp': 2.5, 'web': 5, 'evidence': 7, 'conservation': 7}.get(id, 0)
    position[0] += dx
    target[0] += dx

# High-detail, original sculpted surfaces replace the schematic primitives.
meshes={
    'colony-boulder':sculpt_dome([-.88,.005,-.04]),
    'colony-tissue':sculpt_dome([-.88,.005,-.04],overlay=True),
    'web-coral':sculpt_dome([10,.01,0],scale=.65),
    'polyp-skeleton':corallite(),
    'polyp-tissue':sculpt_tissue(),
    'polyp-mouth':sculpt_mouth(),
    'larva-inset':planula(),
    'colony-sheet':plate([-.1,.11,.15]),
    'polyp-tentacles':sculpt_tentacles(),
    'colony-encrusting':encrusting(),
    'substrate-context':sand_patches(),
    **reef_shelf(),
}
fragmesh=Mesh()
for x,z,s,seed in [(14.82,.07,.78,2),(15.03,-.06,.92,8),(15.23,.08,.70,11)]:
    branch=branching([x,.145,z],s,seed);fragmesh.add(branch.v,branch.f)
meshes['nursery-fragments']=fragmesh
# A welded open rack, rather than a solid table under the living fragments.
rack=[]
for z in [-.19,.19]:
    rack.append(primitive('tube',[15.03,.12,0],'powder','token:neutral',path=[[-.31,0,z],[.31,0,z]],radius=.009))
for x in [-.31,-.21,0,.20,.31]:
    rack.append(primitive('tube',[15.03,.12,0],'powder','token:neutral',path=[[x,0,-.19],[x,0,.19]],radius=.007))
for x in [-.28,.28]:
    for z in [-.17,.17]:
        rack.append(primitive('tube',[15.03,.12,0],'powder','token:neutral',path=[[x,0,z],[x,-.2,z]],radius=.009))
for x,z in [(-.21,.07),(0,-.06),(.20,.08)]:
    rack.append(primitive('sweep',[15.03,.135,0],'fabric','token:bone',path=[[x-.016,-.012,z-.015],[x-.017,.012,z],[x,.018,z+.012],[x+.018,.008,z],[x+.016,-.015,z-.015]],radius=.002,radial=8,segments=16))
for p in PARTS:
    if p['id'] in meshes:
        old=p.pop('primitive');p.pop('extra',None)
        p.update(mesh=p['id'],material={'color':old['color'],'tint':old['tint']})
    if p['id']=='polyp-mouth':
        p['material']['tint']='#65443b'
    if p['id']=='refuge-cavity':
        p['material']['tint']='token:neutral'
    if p['id']=='substrate-context':
        p['material']={'color':'abrasive','tint':'token:bone'}
    if p['id']=='nursery-frame':
        # The rack's manufactured straight members need no dense curved-pipe
        # longitudinal tessellation. Preserve diameter, open bore and joints.
        for bar in rack:
            if bar['kind']=='tube':
                bar['kind']='sweep';bar.update(radial=20,segments=4,hollow=.002,caps='flat')
        p['primitive']=rack[0];p['extra']=rack[1:]
    # Sparse microscopic dots need only 8–12 radial sides, not 2,976 triangles each.
    if p['id'] in ['polyp-symbionts','water-haze']:
        for shape in [p['primitive'],*p.get('extra',[])]:
            radius=shape.pop('size')[0];shape['kind']='lathe';shape['segments']=12 if p['id']=='polyp-symbionts' else 8
            shape['profile']=[[radius*math.sin(i*math.pi/8),-radius*math.cos(i*math.pi/8)] for i in range(9)]

# Four contextual arrows keep the food direction visible when animation is paused.
# They share the active-edge outputs with particles/card, not biological counts.
arrow_parts=[]
for flow in flows:
    suffix=flow['id'][2:]; path=[point[:] for point in flow['path']]
    for point in path:point[2]+=.13
    end=path[-1];prev=path[-2];dx,dy,dz=[end[i]-prev[i] for i in range(3)]
    length=math.sqrt(dx*dx+dy*dy+dz*dz);head=.045
    neck=[end[i]-(end[i]-prev[i])*head/length for i in range(3)]
    path[-1]=neck
    # Arrowhead cone's local Y axis points toward the recipient.
    pitch=math.degrees(math.atan2(dz,dy));roll=-math.degrees(math.asin(dx/length))
    head_at=[(neck[i]+end[i])/2 for i in range(3)]
    shaft=primitive('sweep',[0,0,0],'tissue','token:food',path=path,radius=.0035,radial=8,segments=18,caps='flat')
    arrow=part('food-arrow-'+suffix,'Food direction','食物方向','feeding-flows',
               'Points from a food source to its consumer.','从食物来源指向消费者。',
               'Diagram annotation: the source-to-consumer direction of this shown food path. [S19, S50]',
               '图解标注：这条已画食物路径从食物来源指向消费者。[S19, S50]',
               shaft,[primitive('cone',head_at,'tissue','token:food',size=[.016,head],rotation=[pitch,0,roll])],context=True,clip=False)
    arrow_parts.append(arrow)
# Existing table/control/outputs stay unchanged; only display bindings added.
polish_sim=json.loads(SIM.read_text())
polish_sim['bind']+=[{'output':'haze-shown','part':'water-column-turbid','visible':{'eq':1}},{'output':'haze-shown','part':'water-column-clear','visible':{'eq':0}},{'control':'depth-m','part':'depth-pointer','offset':{'axis':[0,1,0],'per':-.1,'origin':0}}]
for flow,arrow in zip(flows,arrow_parts):
    polish_sim['bind'].append({'output':'active-'+flow['id'],'part':arrow['id'],'visible':{'eq':1}})
generated=ROOT/'scripts/geo/coral-reef/refs/polish-build.glb'
write_glb(meshes,generated)
subprocess.run(['pnpm','tsx',str(ROOT/'scripts/geo/coral-reef/finish-mesh.ts'),str(generated)],cwd=ROOT,check=True)
# Publish only the finished asset: validators never see the dense intermediate.
generated.replace(ROOT/'public/models/coral-reef.glb')

# The schema caps hudFrame at 32; this mark shares the crest band's column, already framed.
HUD_FRAME_SKIP={'depth-slope-mark'}

def camera(id):
    p,t,_=cameras[id]
    return dict(position=p,target=t,fov=30)

data=dict(model='/models/coral-reef.glb',parts=PARTS,groups=groups,flows=flows,
          animations=[dict(id='tentacle-feeding-sway',target='polyp-tentacles',kind='oscillate',axis=[0,1,0],amplitude=3,hz=.10,pivot=[5,.60,0],whenRun=True)],
          presets=[dict(id=id,label=label,camera=camera(id)) for id,(_,_,label) in cameras.items()],
          views=dict(assembled=dict(camera=camera('hero')),cover=camera('hero'),section=dict(plane='xy'),
                     cutaway=dict(normal=[0,0,-1],offset=.02),
                     reference=dict(camera=dict(position=[0,.2,9],target=[0,-.1,0],fov=26)),
                     hudFrame=dict(parts=[p['id'] for p in PARTS if not p.get('context') and p['id'] not in HUD_FRAME_SKIP])),
          spec=[dict(key=bi('Scope','范围'),value=bi('Schematic habitat','栖息地示意'),tag='design'),
                dict(key=bi('Specimens','标本'),value=bi('Separately enlarged','分别放大'),tag='design')],
          sim=polish_sim)
assert len(PARTS)==39 and sum(not p.get('context') for p in PARTS)==33
out=TOPIC/'data/parts.json'
out.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print(f'{out.relative_to(ROOT)}: {len(PARTS)} parts, {len(groups)} groups, {len(flows)} flows')

# Keep beat authoring reproducible alongside the generated parts and asset.
subprocess.run(['pnpm','tsx',str(ROOT/'scripts/geo/coral-reef/author-views.ts')],cwd=ROOT,check=True)
