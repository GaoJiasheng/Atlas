"""Write src/content/topics/brain-and-nerves/data/parts.json (docs/75 §3–§8).

Mesh parts come from public/models/brain-and-nerves.glb (scripts/anatomy/brain-nerves); flows from its
routes.json; the procedural spinal cord from cord.json; the elbow from landmarks.json. Everything on the
study bench is drawn here as engine primitives. Run: python3 scripts/geo/brain-and-nerves/content.py
"""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
ANAT = ROOT / 'scripts/anatomy/brain-nerves'
OUT = ROOT / 'src/content/topics/brain-and-nerves/data/parts.json'
ROUTES = json.loads((ANAT / 'routes.json').read_text())
CORD = json.loads((ANAT / 'cord.json').read_text())
ELBOW = json.loads((ANAT / 'landmarks.json').read_text())['elbow']
A = ROUTES['anchors']


def r4(v):
    return [round(float(x), 4) for x in v]


def add(a, b):
    return r4([x + y for x, y in zip(a, b)])


def T(en, zh):
    return {'en': en, 'zh': zh}


# ---------------------------------------------------------------- groups
GROUPS = [
    dict(id='brain-parts', name=T('Brain', '脑'), color='token:mat-tissue'),
    dict(id='spinal', name=T('Spinal cord', '脊髓'), color='token:mat-tissue'),
    dict(id='nerves', name=T('Nerves', '神经'), color='token:en-electrical'),
    dict(id='sense-markers', name=T('Eyes and inner ears', '眼和内耳'), color='token:ink-3', card=False),
    dict(id='protection', name=T('Skull, backbone and coverings', '颅骨、脊柱与被膜'), color='token:bone', card=False),
    dict(id='reflex-arm', name=T('Right arm', '右臂'), color='token:muscle-1', card=False),
    dict(id='neuron-study', name=T('Nerve cell, enlarged', '神经细胞（放大）'), color='token:ink-2', card=False,
         scale=dict(unit='um', magnification=4000)),
    dict(id='synapse-study', name=T('Synapse, enlarged', '突触（放大）'), color='token:ink-2', card=False,
         scale=dict(unit='um', magnification=40000)),
    dict(id='cord-study', name=T('Spinal cord slice, enlarged', '脊髓横切（放大）'), color='token:ink-2', card=False,
         scale=dict(unit='mm', magnification=12)),
    dict(id='layers-study', name=T('Layers round the brain · not to scale', '脑外的几层 · 不按比例'), color='token:ink-2', card=False),
    dict(id='helmet', name=T('Helmet', '头盔'), color='token:ink-2', card=False),
    dict(id='try-it', name=T('One metre of nerve, half size', '一米神经，画成一半'), color='token:ink-3', card=False),
    dict(id='ruler-test', name=T('Ruler drop', '尺子接落'), color='token:ink-3', card=False),
    dict(id='skeleton-context', name=T('Rest of the skeleton', '其余骨骼'), color='token:bone', card=False),
    dict(id='skin-context', name=T('Body outline', '身体轮廓'), color='token:mannequin', card=False),
    dict(id='study-table', name=T('Study bench', '工作台'), color='token:ink-3', card=False),
    dict(id='signals-down', name=T('Commands going out', '往外送的命令'), color='token:en-electrical'),
    dict(id='signals-up', name=T('Messages coming in', '往里送的消息'), color='token:en-electrical'),
    dict(id='signals-reflex', name=T('Reflex signals', '反射的信号'), color='token:en-electrical'),
    dict(id='signals-senses', name=T('Signals from the eyes and ears', '眼和耳的信号'), color='token:en-electrical'),
    dict(id='signals-reaction', name=T('Catching a ruler', '接尺子的信号'), color='token:en-electrical'),
    dict(id='signals-neuron', name=T('Signal along an axon', '沿轴突的信号'), color='token:en-electrical'),
    dict(id='chemical-signals', name=T('Chemical signal', '化学信号'), color='token:chemical-signal'),
]

TISSUE = {'color': 'tissue', 'tint': 'token:mat-tissue'}
# A light neutral tissue, so the region colours (highlight.custom, mixed in at 0.55) read clearly where a chapter turns them on.
BRAIN = {'color': 'tissue', 'tint': '#d8ccc2'}
# Nerves a deeper ochre than the family's pale yellow, so the network reads over the see-through body in both themes.
NERVE = {'color': 'nerve', 'tint': '#c08a1c'}
BONE = {'color': 'tissue', 'tint': 'token:bone'}


def mesh(id, group, name, summary, detail, node=None, bilateral=False, material=None, short=None, chain=None, explode=None,
         connects=None, **extra):
    p = dict(id=id, name=name, summary=summary, detail=detail, group=group, mesh=node or (id + '.l' if bilateral else id),
             material=material or TISSUE)
    if short:
        p['short'] = short
    if chain:
        p['chainName'] = chain
    if bilateral:
        p['bilateral'] = dict(axis='x', mesh=id + '.r')
    if explode:
        p['explode'] = explode
    if connects:
        p['connects'] = connects
    p.update(extra)
    return p


LOBE_NOTE = ('This lobe does not do only this one job; most tasks need several areas working together [S8].',
             '这一叶不只做这一件事；大多数事要好几个区一起做 [S8]。')


def lobe(id, name, short, chain, summary, first, explode):
    en = first[0] + '\n\n' + LOBE_NOTE[0] + '\n\nThe surface comes from one adult\'s brain scan; the folds of every brain differ a little [S41].'
    zh = first[1] + '\n\n' + LOBE_NOTE[1] + '\n\n这个表面来自一个成年人的脑扫描；每个人的脑褶皱都有一点不同 [S41]。'
    return mesh(id, 'brain-parts', name, summary, T(en, zh), bilateral=True, material=BRAIN, short=short, chain=chain,
                explode=dict(dir=explode, dist=0.02))


PARTS = [
    lobe('frontal-lobe', T('Frontal lobe', '额叶'), T('Frontal', '额叶'), T('Frontal', '额叶'),
         T('Plans and reasons; sends the commands for movement.', '参与计划和推理；发出动作的命令。'),
         ('The front lobe of each half of the cerebrum. It takes part in planning, reasoning and solving problems, and holds the primary motor cortex, the strip that starts voluntary movements [S8]. That strip is the precentral gyrus, the fold just in front of the central groove [S11].',
          '大脑每一半最前面的叶。它参与计划、推理和解决问题，还有初级运动皮层，也就是发起随意动作的那一条区域 [S8]。这条区域是中央前回，就在中央沟前面的那条褶 [S11]。'),
         [0, 0.2, 1]),
    lobe('parietal-lobe', T('Parietal lobe', '顶叶'), T('Parietal', '顶叶'), T('Parietal', '顶叶'),
         T('Receives touch, warmth, pain and body position.', '接收触觉、冷热、痛觉和身体位置。'),
         ('The lobe at the top and back of each half, behind the central groove. It takes in touch, temperature and pain [S8]; its front strip, the postcentral gyrus, is the main area for fine touch and the sense of where the body\'s parts are [S11].',
          '每一半顶部偏后的叶，在中央沟后面。它接收触觉、温度和痛觉 [S8]；它最前面的一条，中央后回，是精细触觉和“身体各部分在哪里”的感觉的主要区域 [S11]。'),
         [0, 1, -0.4]),
    lobe('temporal-lobe', T('Temporal lobe', '颞叶'), T('Temporal', '颞叶'), T('Temporal', '颞叶'),
         T('Takes part in hearing and in forming memories.', '参与听和形成记忆。'),
         ('The lobe at the side of each half, below the deep side groove. It is important for hearing, recognising language and forming memories, and holds the primary auditory cortex, which receives signals from the ears [S8, S12].',
          '每一半侧面的叶，在深深的外侧沟下面。它对听、认出语言和形成记忆很重要，有接收耳朵信号的初级听觉皮层 [S8, S12]。'),
         [1, -0.3, 0]),
    lobe('occipital-lobe', T('Occipital lobe', '枕叶'), T('Occipital', '枕叶'), T('Occip.', '枕叶'),
         T('Handles the signals that come from the eyes.', '处理眼睛送来的信号。'),
         ('The lobe at the back of each half. It is the brain\'s main centre for seeing: the visual cortex is here [S8, S12].',
          '每一半最后面的叶。它是脑处理视觉的主要中心：视觉皮层就在这里 [S8, S12]。'),
         [0, 0.2, -1]),
    mesh('insula', 'brain-parts', T('Insula · further', '岛叶 · 再进一步'),
         T('A patch of cortex folded deep inside the side groove.', '藏在外侧沟深处的一块皮层。'),
         T('A part of the cerebral cortex hidden deep in the side groove, under the frontal, parietal and temporal lobes; you only see it when they are moved aside [S41].\n\nIn this model it keeps the cortex colour in every chapter.',
           '大脑皮层藏在外侧沟深处的一部分，被额叶、顶叶和颞叶盖住；只有把它们移开才看得见 [S41]。\n\n在这个模型里，它在每一章都用皮层的颜色。'),
         bilateral=True, material=BRAIN, short=T('Insula', '岛叶')),
    mesh('cerebrum-medial', 'brain-parts', T('Inner wall of the cerebrum', '大脑内侧面'),
         T('The inner faces of the two halves, facing each other.', '大脑两半相对的内侧面。'),
         T('Where the two halves of the cerebrum face each other, a band of cortex curves round above the bundle that joins them [S41]. You see it when the model is cut down the middle.',
           '大脑两半相对的地方，有一条皮层围着连接两半的那束纤维弯过去 [S41]。把模型从正中剖开就能看见。'),
         bilateral=True, material=BRAIN, short=T('Inner wall', '内侧面')),
    mesh('cerebrum-core', 'brain-parts', T('Inside of the cerebrum (plain fill)', '大脑内部（素色填充）'),
         T('A plain fill so the inside does not look empty.', '素色填充，让大脑里面不显得是空的。'),
         T('The source model has only the folded outer layer of the cerebrum, so Atlas fills each half with this plain, smooth shape, so that a cut or a spread-out view does not look empty. It does not show the real parts inside [S1].',
           '原始模型只有大脑折起的外层，所以 Atlas 用这个素色、光滑的形状把每一半填满，剖开或摊开时就不会显得是空的。它不表示里面真实的结构 [S1]。'),
         bilateral=True, material={'color': 'tissue', 'tint': '#e9e1d6'}, short=T('Inside', '内部')),
    dict(id='corpus-callosum', name=T('Corpus callosum', '胼胝体'), group='brain-parts',
         summary=T('A thick band of nerve fibres joining the two halves.', '连接左右两半的一大束神经纤维。'),
         detail=T('The two halves of the cerebrum are joined by a thick bundle of nerve fibres, the corpus callosum; information passes across it all the time [S10].\n\nIn this model it is drawn as a simple arch: the source model\'s fibre bundles are not used [S39].',
                  '大脑的左右两半由一大束神经纤维——胼胝体——连起来；信息一直在两边之间传递 [S10]。\n\n在这个模型里它画成一道简单的弧：没有使用原始模型里的纤维束 [S39]。'),
         primitive=dict(kind='sweep', path=[[0, 0.636, -0.084], [0, 0.648, -0.104], [0, 0.651, -0.13], [0, 0.648, -0.155], [0, 0.638, -0.174]],
                        radius=[0.0045, 0.0055, 0.0045, 0.0045, 0.006], section={'flat': 0.45}, up=[0, 1, 0], at=[0, 0, 0],
                        color='tissue', tint='#d9cfc4'),
         short=T('Callosum', '胼胝体')),
    mesh('cerebellum', 'brain-parts', T('Cerebellum', '小脑'),
         T('Keeps movements smooth and helps keep balance.', '让动作平稳协调，帮助保持平衡。'),
         T('The cerebellum sits behind the brainstem, below the back of the cerebrum. It coordinates the timing and force of the muscles so movements are smooth, and helps keep balance and posture [S9, S13], comparing the movement you meant to make with the one actually being made and correcting it [S47]. It is only about a tenth of the brain\'s mass, but it holds about four in five of the brain\'s neurons [S15].\n\nThis cerebellum is a different model from the rest of the brain (BodyParts3D), lined up with the brainstem. Its folds are drawn by Atlas as a regular pattern of grooves running across it, fewer and wider than the real ones; they are not traced from a real cerebellum [S1, S40].',
           '小脑在脑干后面、大脑后部的下方。它协调肌肉用力的时机和大小，让动作平稳，也帮助保持平衡和姿势 [S9, S13]；它把想做的动作和实际正在做的动作作比较，并加以纠正 [S47]。它只占脑质量的约十分之一，却有脑里约五分之四的神经元 [S15]。\n\n这个小脑和脑的其余部分来自不同的模型（BodyParts3D），按脑干对齐。它表面的褶由 Atlas 画成一道道横过小脑的规则沟纹，比真实的少、也宽；不是照真实小脑描的 [S1, S40]。'),
         material=BRAIN, chain=T('Cerebel.', '小脑'), explode=dict(dir=[0, -0.5, -1], dist=0.03)),
    mesh('midbrain', 'brain-parts', T('Midbrain', '中脑'),
         T('The top part of the brainstem.', '脑干最上面的一段。'),
         T('The topmost part of the brainstem, joining it to the cerebrum above [S9].', '脑干最上面的部分，把脑干和上面的大脑连起来 [S9]。'),
         material=BRAIN, chain=T('Stem', '脑干'), explode=dict(dir=[0, -1, 0], dist=0.02)),
    mesh('pons', 'brain-parts', T('Pons', '脑桥'),
         T('The bulge of the brainstem in front of the cerebellum.', '脑干在小脑前面鼓起的一段。'),
         T('The rounded middle part of the brainstem, in front of the cerebellum; its name is Latin for "bridge" [S9]. The nerve signals from the inner ear come into the brainstem here [S12].',
           '脑干中间圆鼓鼓的一段，在小脑前面；它的名字在拉丁文里是“桥” [S9]。内耳的神经信号就从这里进入脑干 [S12]。'),
         material=BRAIN, explode=dict(dir=[0, -1, 0], dist=0.02)),
    mesh('medulla', 'brain-parts', T('Medulla', '延髓'),
         T('Joins the spinal cord; helps control breathing and the heartbeat.', '往下接脊髓；参与控制呼吸和心跳。'),
         T('The lowest part of the brainstem, which carries on into the spinal cord. It contains centres that regulate breathing and the heart [S12]; the brainstem keeps these vital jobs going without you having to think [S9].',
           '脑干最下面的一段，往下接着脊髓。它有调节呼吸和心脏的中枢 [S12]；脑干让这些维持生命的事一直进行，不用你去想 [S9]。'),
         material=BRAIN, short=T('Medulla', '延髓'), explode=dict(dir=[0, -1, 0], dist=0.02)),
    dict(id='spinal-cord', name=T('Spinal cord', '脊髓'), group='spinal', chainName=T('Cord', '脊髓'),
         summary=T('The main pathway between the brain and the body.', '脑和身体之间的主干道。'),
         detail=T('The spinal cord is nerve tissue, not bone: it runs down a canal inside the backbone, from the base of the skull to about the level of the first lumbar vertebra, so it is shorter than the backbone [S5, S27]. Signals travel up it to the brain and down it to the muscles, and it can also turn a signal round by itself in a reflex [S25].\n\nIn this model the spinal cord is drawn as a smooth tube along the middle of its covering; its true outline is not used [S39].',
                  '脊髓是神经组织，不是骨头：它在脊柱里的管道中往下走，从颅底一直到约第一腰椎的高度，所以比脊柱短 [S5, S27]。信号沿它往上传到脑，往下传到肌肉；在反射里，它也能自己把信号“掉头” [S25]。\n\n在这个模型里，脊髓画成一条沿着被膜中央的平滑的管；没有使用它真实的外形 [S39]。'),
         primitive=dict(kind='sweep', path=CORD['path'], radius=CORD['radius'], at=[0, 0, 0], color='tissue', tint='#d9cfc4', caps='round'),
         connects=['medulla', 'spinal-roots']),
    mesh('cauda-equina', 'spinal', T('Cauda equina', '马尾'),
         T('The bundle of nerve roots below the end of the cord.', '脊髓末端以下的一束神经根。'),
         T('Below the end of the spinal cord, the nerve roots carry on down the canal as a bundle that looks like a horse\'s tail, which is what cauda equina means [S5].',
           '脊髓末端以下，神经根在管道里继续往下，聚成一束，像马的尾巴；cauda equina 就是“马尾”的意思 [S5]。'),
         material=NERVE, short=T('Cauda equina', '马尾')),
    mesh('spinal-roots', 'spinal', T('Nerve roots', '脊神经根'),
         T('Messages enter by the back roots; commands leave by the front.', '消息从后根进，命令从前根出。'),
         T('Each spinal nerve joins the cord by two roots. Sensory fibres come in through the back (dorsal) root, and their cell bodies sit in a swelling on it, the dorsal root ganglion; motor fibres leave through the front (ventral) root to the muscles [S4, S27].',
           '每条脊神经都由两条根连到脊髓。感觉纤维从后根（背根）进来，它们的细胞体在后根上鼓起的一处，叫背根神经节；运动纤维从前根（腹根）出去，到达肌肉 [S4, S27]。'),
         material=NERVE, short=T('Roots', '神经根')),
    mesh('arm-nerves', 'nerves', T('Arm nerves', '手臂的神经'),
         T('Carry touch from the hand in and commands to the arm out.', '把手的触觉送进去，把命令送到手臂。'),
         T('The nerves of the arm leave the spinal cord in the neck, mix in a network near the shoulder and run down the arm to the hand [S4]. A nerve is a bundle of nerve fibres wrapped in connective tissue: messages from the skin travel in along some fibres while commands to the muscles travel out along others [S4].\n\nOnly the main nerves are drawn; the finest branches are left out.',
           '手臂的神经从颈部离开脊髓，在肩附近交织成网，再沿手臂一直通到手 [S4]。一条神经是一束用结缔组织包着的神经纤维：皮肤的消息沿一些纤维往里送，给肌肉的命令沿另一些纤维往外送 [S4]。\n\n这里只画了主要的神经，最细的分支没有画。'),
         bilateral=True, material=NERVE, chain=T('Nerves', '神经'), short=T('Arm nerves', '臂神经')),
    mesh('arm-nerves-forearm', 'nerves', T('Right forearm nerves', '右前臂的神经'),
         T('The right arm\'s nerves below the elbow.', '右臂肘部以下的神经。'),
         T('The part of the right arm\'s nerves below the elbow, drawn separately so it can move with the forearm when the hand pulls away [S1].',
           '右臂神经在肘部以下的部分，单独画出，好让它在缩手时跟着前臂一起动 [S1]。'),
         material=NERVE, node='arm-nerves-forearm.r', short=T('Forearm nerves', '前臂神经')),
    mesh('leg-nerves', 'nerves', T('Leg nerves', '腿的神经'),
         T('The nerves of the leg; the sciatic nerve is the thickest.', '腿的神经；坐骨神经最粗。'),
         T('The nerves of the legs come from the lower part of the spinal canal. At the back of the thigh runs the sciatic nerve, which divides above the knee into the nerves of the lower leg and foot [S4].\n\nOnly the main nerves are drawn.',
           '腿的神经来自椎管的下段。大腿后面是坐骨神经，在膝盖上方分成通到小腿和脚的神经 [S4]。\n\n这里只画了主要的神经。'),
         bilateral=True, material=NERVE, short=T('Leg nerves', '腿神经')),
    mesh('trunk-nerves', 'nerves', T('Nerves between the ribs', '肋间神经'),
         T('Run along the ribs round the chest.', '沿着肋骨绕胸一圈。'),
         T('Nerves from the chest part of the spinal cord run round the body between the ribs [S4].', '从脊髓胸段出来的神经，沿肋骨之间绕到身体前面 [S4]。'),
         bilateral=True, material=NERVE, short=T('Rib nerves', '肋间神经')),
    mesh('optic-pathway', 'nerves', T('Optic nerves', '视神经'),
         T('Carry the signals from the eyes into the brain.', '把眼睛的信号送进脑。'),
         T('Electrical signals from the back of each eye travel along the optic nerve to the brain [S30]. The two optic nerves meet under the brain, then carry on as the optic tracts; the signals are handled in the occipital lobe at the back [S12].\n\nHow the eye makes these signals is in the topic Eyes and Ears.',
           '每只眼睛后部产生的电信号沿视神经传到脑 [S30]。两条视神经在脑的下方会合，再分成视束往后走；信号在后面的枕叶里处理 [S12]。\n\n眼睛怎样产生这些信号，在“眼与耳”主题里。'),
         material=NERVE, short=T('Optic nerves', '视神经')),
    mesh('hearing-nerve', 'nerves', T('Hearing nerve', '前庭蜗神经'),
         T('Carries the signals from the inner ear into the brainstem.', '把内耳的信号送进脑干。'),
         T('The eighth cranial nerve carries signals from the inner ear into the pons of the brainstem; from there they reach the hearing area of the temporal lobe [S12].\n\nThe inner ear itself is not drawn here; it is in the topic Eyes and Ears.',
           '第八对脑神经把内耳的信号送进脑干的脑桥；信号再从那里到颞叶的听觉区 [S12]。\n\n这里没有画内耳；它在“眼与耳”主题里。'),
         material=NERVE, short=T('Hearing nerve', '前庭蜗神经')),
    mesh('cranial-nerves', 'nerves', T('Other cranial nerves · further', '其他脑神经 · 再进一步'),
         T('Nerves that leave the brain itself, not the spinal cord.', '直接从脑出来、不经过脊髓的神经。'),
         T('There are twelve pairs of cranial nerves, which leave the underside of the brain itself, and thirty-one pairs of spinal nerves, which leave the spinal cord [S4]. The cranial nerves serve mostly the head and neck.\n\nThe smallest branches of these nerves are simplified.',
           '脑神经有 12 对，直接从脑的底面出来；脊神经有 31 对，从脊髓出来 [S4]。脑神经主要分布在头和颈部。\n\n这些神经最细的分支已简化。'),
         material=NERVE, short=T('Cranial nerves', '脑神经')),
    mesh('skull', 'protection', T('Skull', '颅骨'),
         T('A hard case of joined bones round the brain.', '围住脑的一个由几块骨头连成的硬壳。'),
         T('The bones of the skull fit together to make a hard case round the brain. How the bones join is in the topic Bones and Joints.',
           '颅骨的几块骨头拼在一起，在脑外围成一个硬壳。骨头怎样连接，在“骨与关节”主题里。'),
         material=BONE, shell=True, castShadow=False),
    mesh('vertebral-column', 'protection', T('Backbone', '脊柱'),
         T('Ring-shaped bones that surround the spinal cord.', '一节节环形的骨头围住脊髓。'),
         T('The bones of the backbone are stacked one on another; the holes through them line up to make the canal the spinal cord runs in [S5].',
           '脊柱的骨头一节叠一节；它们中间的孔连成一条管道，脊髓就在里面 [S5]。'),
         material=BONE, shell=True, castShadow=False, short=T('Backbone', '脊柱')),
    mesh('dura-folds', 'protection', T('Folds of the dura', '硬脑膜的褶'),
         T('Two sheets of the tough outer covering, between the brain\'s parts.', '坚韧的外层膜伸进脑各部分之间的两片。'),
         T('The dura, the tough outer covering of the brain [S5], dips in as a sheet between the two halves of the cerebrum and as another between the cerebrum and the cerebellum.',
           '硬脑膜是脑最外层的坚韧被膜 [S5]，它伸进大脑两半之间成为一片，又伸进大脑和小脑之间成为另一片。'),
         material={'color': 'membrane', 'tint': 'token:bone'}, short=T('Dura folds', '硬脑膜褶')),
    mesh('spinal-dura', 'protection', T('Spinal dura', '硬脊膜'),
         T('The tough tube round the spinal cord.', '包住脊髓的坚韧的管。'),
         T('Round the spinal cord the dura forms a tough tube, with the cerebrospinal fluid inside it [S5].', '在脊髓外面，硬膜围成一条坚韧的管，里面是脑脊液 [S5]。'),
         material={'color': 'membrane', 'tint': 'token:bone'}, shell=True, short=T('Spinal dura', '硬脊膜')),
    mesh('ventricles', 'protection', T('Ventricles', '脑室'),
         T('Four spaces in the brain filled with clear fluid.', '脑里四个充满透明液体的空腔。'),
         T('Four connected spaces inside the brain hold cerebrospinal fluid. Most of it is made in them, by the choroid plexus, about half a litre a day [S12, S28, S29]; there is only about 125 to 160 millilitres of it at any time, so it is replaced several times a day [S28, S29].',
           '脑里有四个相连的空腔，装着脑脊液。脑脊液大部分在这里由脉络丛产生，每天约半升 [S12, S28, S29]；任何时候身体里只有约 125 到 160 毫升，所以一天要更换好几次 [S28, S29]。'),
         material={'color': 'glass', 'tint': 'token:air'}),
    mesh('biceps-r', 'reflex-arm', T('Biceps (right)', '肱二头肌（右）'),
         T('Contracts to bend the elbow and lift the forearm.', '收缩时弯起手肘，把前臂抬起来。'),
         T('In a withdrawal reflex the motor neurons in the spinal cord make the muscles that pull the limb away contract [S25]. Here the biceps on the front of the upper arm bends the elbow. How muscles pull on bones is in the topic Muscles of the Arms.',
           '缩回反射时，脊髓里的运动神经元让把肢体拉开的肌肉收缩 [S25]。这里是上臂前面的肱二头肌，它弯起手肘。肌肉怎样拉动骨头，在“手臂肌肉”主题里。'),
         node='biceps-r', material={'color': 'muscle', 'tint': 'token:muscle-1'}, short=T('Biceps', '肱二头肌')),
    mesh('triceps-r', 'reflex-arm', T('Triceps (right)', '肱三头肌（右）'),
         T('The muscle on the back of the upper arm; it straightens the elbow.', '上臂后面的肌肉；它伸直手肘。'),
         T('The muscle on the back of the upper arm straightens the elbow, the opposite of the biceps. In a withdrawal reflex, relay neurons in the spinal cord hold back the muscles that would pull the other way [S25]; in this model it stays relaxed while the biceps contracts.',
           '上臂后面的肌肉，伸直手肘，和肱二头肌作用相反。缩手这类反射里，脊髓里的中间神经元会抑制往相反方向拉的肌肉 [S25]；在这个模型里，肱二头肌收缩时它保持放松。'),
         node='triceps-r', material={'color': 'muscle', 'tint': 'token:muscle-2'}, short=T('Triceps', '肱三头肌')),
    mesh('upper-arm-bone-r', 'reflex-arm', T('Upper arm bone', '上臂骨'),
         T('The bone of the upper arm.', '上臂的骨。'),
         T('The bone of the upper arm, which the forearm turns on at the elbow.', '上臂的骨；前臂在肘部绕着它转。'),
         node='upper-arm-bone-r', material=BONE, short=T('Arm bone', '上臂骨')),
    mesh('forearm-hand-r', 'reflex-arm', T('Forearm and hand (right)', '前臂与手（右）'),
         T('Turns at the elbow when the hand pulls away.', '缩手时在肘部转动。'),
         T('The bones of the right forearm and hand. In this model they turn 20 degrees about the elbow when the hand pulls away, slowed down; the skin is hidden in those steps because it does not bend with them [S1].',
           '右前臂和手的骨。在这个模型里，缩手时它们绕肘转 20 度，画面放慢了；那几步隐藏皮肤，因为皮肤不会跟着弯 [S1]。'),
         node='forearm-hand-r', material=BONE, short=T('Forearm', '前臂')),
]

# ---------------------------------------------------------------- the study bench (body's right side, screen left)
BX, BTOP = -0.85, 0.095          # bench centre x, table-top surface y
BENCH = dict(id='study-bench', name=T('Study bench', '工作台'), group='study-table', context=True, clip=False,
             summary=T('Holds the enlarged models.', '放放大模型的台子。'),
             detail=T('A table for the enlarged teaching models. They are not drawn to the scale of the body [S1].', '放放大教学模型的桌子。它们不按身体的比例画 [S1]。'),
             primitive=dict(kind='bevelBox', size=[0.62, 0.03, 0.84], bevel=0.004, at=[BX, BTOP - 0.015, 0], color='wood'),
             extra=[dict(kind='bevelBox', size=[0.03, 1.08, 0.03], bevel=0.004, at=[BX + sx * 0.27, BTOP - 0.03 - 0.54, sz * 0.38], color='wood')
                    for sx in (-1, 1) for sz in (-1, 1)])

# Neuron station: along x at y 0.20, z 0. Cell body on the left (x -1.08), terminals at x -0.72.
NY, NZ = 0.15, 0.0
BODYX = -1.08
AX0, AX1 = -1.045, -0.745


def sw(path, radius, color='membrane', tint=None, **kw):
    d = dict(kind='sweep', path=[r4(p) for p in path], radius=radius, at=[0, 0, 0], color=color, **kw)
    if tint:
        d['tint'] = tint
    return d


def sph(at, r, color='membrane', tint=None, scale=None):
    d = dict(kind='sphere', size=[r], at=r4(at), color=color)
    if tint:
        d['tint'] = tint
    if scale:
        d['scale'] = scale
    return d


dendrites = []
for k, ang in enumerate([110, 150, 190, 230, 270, 320]):
    a = math.radians(ang)
    tilt = 0.012 * math.sin(k * 1.7)
    p0 = [BODYX + 0.03 * math.cos(a), NY + 0.03 * math.sin(a), NZ + tilt]
    p1 = [BODYX + 0.06 * math.cos(a), NY + 0.06 * math.sin(a), NZ + tilt * 2]
    p2 = [BODYX + 0.085 * math.cos(a + 0.25), NY + 0.085 * math.sin(a + 0.25), NZ + tilt * 3]
    p3 = [BODYX + 0.08 * math.cos(a - 0.35), NY + 0.08 * math.sin(a - 0.35), NZ - tilt]
    dendrites.append(sw([p0, p1, p2], [0.004, 0.0028, 0.0012]))
    dendrites.append(sw([p1, p3], [0.0022, 0.0011]))
axon_path = [[AX0 + (AX1 - AX0) * t, NY + 0.004 * math.sin(t * 6), NZ] for t in [i / 10 for i in range(11)]]
term_paths = []
for k in range(5):
    a = math.radians(-50 + 25 * k)
    e = [AX1 + 0.035 * math.cos(a), NY + 0.035 * math.sin(a), NZ]
    term_paths.append((e, sw([[AX1, NY, NZ], [AX1 + 0.015 * math.cos(a), NY + 0.012 * math.sin(a), NZ], e], [0.0028, 0.002, 0.0016])))
# Myelin: 8 segments (schematic count), the first segment after the bare start of the axon.
MY0, MYL, MYGAP = -1.0, 0.026, 0.006
myelin_at = [MY0 + MYL / 2 + i * (MYL + MYGAP) for i in range(8)]

STUDY = [
    dict(id='neuron-body', name=T('Cell body', '细胞体'), group='neuron-study',
         summary=T('The main part of the cell, with its nucleus.', '细胞的主体，里面有细胞核。'),
         detail=T('The cell body holds the nucleus [S6]. A neuron is a kind of animal cell, with a cell membrane, cytoplasm and a nucleus like the cells in the topic Cells.\n\nThis cell is drawn about 4,000 times life size, and its shape is a drawing, not a copy of a real cell [S1].',
                  '细胞体里有细胞核 [S6]。神经元是一种动物细胞，和“细胞”主题里的细胞一样，有细胞膜、细胞质和细胞核。\n\n这个细胞画成真实大小的约 4,000 倍，形状是示意图，不是照着真实的细胞画的 [S1]。'),
         primitive=sph([BODYX, NY, NZ], 0.034, tint='#d9c8b6', scale=[1.1, 0.92, 0.85]),
         extra=[sph([BODYX - 0.004, NY + 0.004, NZ + 0.012], 0.012, color='tissue', tint='#8a6a5a'),
                dict(kind='cone', size=[0.012, 0.03], at=[BODYX + 0.036, NY, NZ], rotation=[0, 0, -90], color='membrane', tint='#d9c8b6')],
         connects=['dendrites', 'axon'], short=T('Cell body', '细胞体')),
    dict(id='dendrites', name=T('Dendrites', '树突'), group='neuron-study',
         summary=T('Short branches that pick up signals from other cells.', '接收其他细胞信号的短分支。'),
         detail=T('Dendrites are the short, branching parts of a neuron; they take in signals from other cells and carry them towards the cell body [S6, S23].',
                  '树突是神经元短而分叉的部分；它们接收其他细胞传来的信号，把信号传向细胞体 [S6, S23]。'),
         primitive=dendrites[0], extra=dendrites[1:], connects=['neuron-body']),
    dict(id='axon', name=T('Axon', '轴突'), group='neuron-study',
         summary=T('One long fibre that carries the signal away.', '一条把信号送走的长纤维。'),
         detail=T('Each neuron has one axon, which carries signals away from the cell body [S6]. Some axons are very long: from the base of the spine to the big toe, up to about a metre [S24].\n\nHere the axon is drawn far shorter than a real one, so the whole cell fits on the bench [S1].',
                  '每个神经元有一条轴突，把信号从细胞体送出去 [S6]。有的轴突非常长：从脊柱下端到大脚趾，最长约一米 [S24]。\n\n这里的轴突画得比真实的短很多，好让整个细胞放得进工作台 [S1]。'),
         primitive=sw(axon_path, 0.0035, tint='#d9c8b6'), connects=['myelin', 'axon-terminals']),
    dict(id='myelin', name=T('Myelin', '髓鞘'), group='neuron-study',
         summary=T('A fatty wrapping that makes the signal faster.', '一层脂质的外套，让信号传得更快。'),
         detail=T('Many axons are wrapped in myelin, in segments with short bare gaps between them, the nodes [S6]. Along a wrapped axon the signal seems to jump from one gap to the next, which is faster than creeping along a bare axon [S21].\n\nThe number of segments here is a drawing; a real long axon has many more [S1].',
                  '很多轴突外面包着一段段的髓鞘，段与段之间有一小截裸露的缝隙，叫郎飞结 [S6]。在包着髓鞘的轴突上，信号像是从一个缝隙“跳”到下一个，比在没有髓鞘的轴突上一点点往前传更快 [S21]。\n\n这里的段数是示意；真实的长轴突有多得多的段 [S1]。'),
         primitive=dict(kind='capsule', size=[0.0085, MYL - 0.017], at=[myelin_at[0], NY + 0.004 * math.sin((myelin_at[0] - AX0) / (AX1 - AX0) * 6), NZ],
                        rotation=[0, 0, 90], color='tissue', tint='#efe6d4'),
         extra=[dict(kind='capsule', size=[0.0085, MYL - 0.017], at=r4([x, NY + 0.004 * math.sin((x - AX0) / (AX1 - AX0) * 6), NZ]),
                     rotation=[0, 0, 90], color='tissue', tint='#efe6d4') for x in myelin_at[1:]],
         connects=['axon']),
    dict(id='axon-terminals', name=T('Axon endings', '轴突末梢'), group='neuron-study',
         summary=T('The branched end, where it meets the next cell.', '末端的分支，在这里和下一个细胞相接。'),
         detail=T('At its end the axon divides into fine branches, each swelling into a small knob where it meets the next cell [S6].',
                  '轴突末端分成细小的分支，每个分支末端鼓起一个小球，在那里和下一个细胞相接 [S6]。'),
         primitive=term_paths[0][1], extra=[t[1] for t in term_paths[1:]] + [sph(t[0], 0.004, tint='#d9c8b6') for t in term_paths],
         connects=['synapse-sending'], short=T('Endings', '末梢')),
]

# Synapse, enlarged a further ten times, beside the neuron: sending ending above, receiving membrane below.
SX, SY, SZ = -0.62, 0.125, 0.0
cup = [[0, 0.04], [0.02, 0.039], [0.034, 0.03], [0.04, 0.012], [0.04, 0], [0.036, 0], [0.036, 0.012], [0.031, 0.027], [0.019, 0.035], [0, 0.036]]
vesicles = []
for row, (yy, n) in enumerate([(0.010, 6), (0.018, 5), (0.026, 3)]):
    for i in range(n):
        x = (i - (n - 1) / 2) * 0.011
        vesicles.append(sph([SX + x, SY + yy, SZ - 0.006 + 0.004 * ((i + row) % 2)], 0.0034, tint='#e8c8d6'))
STUDY += [
    dict(id='synapse-sending', name=T('Sending ending', '发出信号的末梢'), group='synapse-study',
         summary=T('The knob at the end of the axon, cut open.', '轴突末端的小球，剖开了一半。'),
         detail=T('When a signal reaches the end of the axon, the ending releases a chemical into the narrow gap [S22]. Here one ending is drawn about 40,000 times life size and cut open to show the small sacs inside [S1].',
                  '信号到达轴突末端时，末梢把一种化学物质放进窄缝里 [S22]。这里画的一个末梢放大了约 40,000 倍，并剖开一半，露出里面的小泡 [S1]。'),
         primitive=dict(kind='lathe', profile=cup, segments=48, arc=180, at=[SX, SY, SZ], color='membrane', tint='#d9c8b6'),
         connects=['vesicles', 'synapse-receiving'], short=T('Ending', '末梢')),
    dict(id='vesicles', name=T('Small sacs', '小泡'), group='synapse-study',
         summary=T('Hold the chemical that carries the signal across.', '装着把信号带过缝的化学物质。'),
         detail=T('Inside the ending, small sacs hold the chemical messenger; they release it into the gap [S22]. Its names are not needed here.',
                  '末梢里的小泡装着化学信使，把它放进窄缝里 [S22]。这里不需要知道它们的名字。'),
         primitive=vesicles[0], extra=vesicles[1:], connects=['synapse-receiving']),
    dict(id='synapse-receiving', name=T('Receiving cell', '接收信号的细胞'), group='synapse-study',
         summary=T('Its receptors take up the chemical and start a new signal.', '它的受体接住化学物质，产生新的信号。'),
         detail=T('The chemical crosses the gap and binds to receptors on the next cell, which starts a new signal there [S22]. The gap is very narrow, about 20 to 40 nanometres [S23], and the crossing causes a delay of about half a millisecond to a millisecond [S22].\n\nThe gap is drawn wider than its true scale so you can see the chemical cross it [S1].',
                  '化学物质跨过窄缝，和下一个细胞上的受体结合，在那里产生新的信号 [S22]。这道缝非常窄，约 20 到 40 纳米 [S23]；跨过它要耽搁约半毫秒到一毫秒 [S22]。\n\n这道缝画得比按比例的宽，好让你看见化学物质跨过去 [S1]。'),
         primitive=dict(kind='bevelBox', size=[0.11, 0.012, 0.03], bevel=0.004, at=[SX, SY - 0.016, SZ], color='membrane', tint='#d9c8b6'),
         extra=[dict(kind='capsule', size=[0.0025, 0.002], at=r4([SX + (i - 4) * 0.009, SY - 0.0085, SZ]), color='membrane', tint='#b9a090') for i in range(9)],
         short=T('Receiving cell', '接收细胞')),
]

# Spinal-cord slice, enlarged about 12 times, facing the front (+Z), dorsal side up.
# The slice floats upright beside the right shoulder, facing the front, as a magnified inset of the cord at the
# neck (a leader runs to that level). Mirrored so its roots point away from the body, as the right nerves do.
CX0, CY0, CZ0, MX = -0.56, 0.37, 0.1, -1


def mirror_outline(right):
    """Right-half outline from the top midline round to the bottom midline -> full closed outline."""
    left = [[-x, y] for x, y in reversed(right[1:-1])]
    return right + left


GREY = mirror_outline([[0, 0.010], [0.008, 0.011], [0.015, 0.020], [0.021, 0.034], [0.025, 0.040], [0.028, 0.037], [0.024, 0.025],
                       [0.019, 0.010], [0.024, 0.000], [0.033, -0.010], [0.037, -0.022], [0.032, -0.031], [0.020, -0.028],
                       [0.011, -0.018], [0, -0.016]])
WHITE = [[round(0.062 * math.cos(t), 4), round(0.047 * math.sin(t), 4)] for t in [i * 2 * math.pi / 64 for i in range(64)]]
CANAL = [[round(0.0025 * math.cos(t), 4), round(0.0025 * math.sin(t), 4)] for t in [i * 2 * math.pi / 12 for i in range(12)]]


def cp(x, y, z=0.0):
    return r4([CX0 + MX * x, CY0 + y, CZ0 + z])


GANG = (0.083, 0.050)
C6 = A['c6']
STUDY += [
    dict(id='cord-inset-leader', name=T('Where the slice is from', '横切取自哪里'), group='cord-study', context=True, clip=False,
         summary=T('Joins the enlarged slice to its place in the neck.', '把放大的横切连到它在颈部的位置。'),
         detail=T('The slice is the spinal cord at the neck, where the nerves of the arm join it, drawn about 12 times life size [S1].',
                  '这片横切是颈部的脊髓，手臂的神经在这里和它相连；画成真实大小的约 12 倍 [S1]。'),
         primitive=sw([cp(-0.064, 0.0, 0.0), r4([(CX0 + 0.064 + C6[0]) / 2, (CY0 + C6[1]) / 2 + 0.02, (CZ0 + C6[2]) / 2]), r4([C6[0] - 0.012, C6[1], C6[2]])],
                      0.0009, color='plastic', tint='token:ink-2', caps='flat'),
         extra=[dict(kind='torus', size=[0.012, 0.0012], at=r4(C6), rotation=[90, 0, 0], color='plastic', tint='token:ink-2')]),
    dict(id='cord-white', name=T('White matter', '白质'), group='cord-study',
         summary=T('Fibres carrying signals up and down the cord.', '在脊髓里上下传信号的纤维。'),
         detail=T('The outer part of the cord is made of nerve fibres running up to the brain and down from it. In this slice, drawn about 12 times life size, the back of the body is at the top [S1].',
                  '脊髓的外层由神经纤维组成，往上通到脑，从脑往下。这片横切放大了约 12 倍，身体的背面在上方 [S1]。'),
         primitive=dict(kind='extrude', shape=WHITE, holes=[GREY], depth=0.03, at=cp(0, 0, -0.015), color='tissue', tint='#e6ddd0'),
         connects=['cord-grey'], short=T('White matter', '白质')),
    dict(id='cord-grey', name=T('Grey matter', '灰质'), group='cord-study',
         summary=T('The butterfly of nerve cell bodies in the middle.', '中间像蝴蝶的一块，是神经细胞体所在。'),
         detail=T('The grey matter in the middle holds the nerve cell bodies. Its back horns (top here) receive the sensory fibres; cells in its front horns (bottom) send axons out to the muscles [S27].',
                  '中间的灰质是神经细胞体所在。它的后角（这里在上方）接收感觉纤维；前角（下方）里的细胞把轴突送到肌肉 [S27]。'),
         primitive=dict(kind='extrude', shape=GREY, holes=[CANAL], depth=0.032, at=cp(0, 0, -0.016), color='tissue', tint='#a58d82'),
         connects=['relay-neuron-study'], short=T('Grey matter', '灰质')),
    dict(id='root-ganglion', name=T('Roots and ganglion', '神经根与神经节'), group='cord-study',
         summary=T('Back root with its ganglion; front root.', '带神经节的后根，和前根。'),
         detail=T('The back root carries sensory fibres in; it swells into a ganglion, outside the cord, where the sensory cell bodies are. The front root carries motor fibres out. The two join into one spinal nerve [S4, S27].',
                  '后根把感觉纤维送进来；它在脊髓外鼓起成神经节，感觉神经元的细胞体就在里面。前根把运动纤维送出去。两条根合成一条脊神经 [S4, S27]。'),
         primitive=sw([cp(0.026, 0.040), cp(0.05, 0.05), cp(*GANG), cp(0.115, 0.03), cp(0.135, 0.005)], [0.005, 0.005, 0.007, 0.006, 0.006], color='nerve'),
         extra=[sph(cp(*GANG), 0.012, color='nerve', scale=[1.3, 1, 1]),
                sw([cp(0.035, -0.022), cp(0.07, -0.032), cp(0.11, -0.018), cp(0.135, 0.0)], [0.005, 0.005, 0.006, 0.006], color='nerve'),
                sw([cp(0.135, 0.002), cp(0.18, 0.004)], [0.008, 0.008], color='nerve')],
         short=T('Roots', '神经根')),
    dict(id='sensory-neuron-study', name=T('Sensory neuron', '感觉神经元'), group='cord-study',
         summary=T('Brings the signal from the skin into the cord.', '把皮肤的信号送进脊髓。'),
         detail=T('A sensory neuron carries a signal from the skin to the spinal cord; its cell body sits in the ganglion on the back root, outside the cord [S4, S27].',
                  '感觉神经元把信号从皮肤送到脊髓；它的细胞体在后根的神经节里，在脊髓外面 [S4, S27]。'),
         primitive=sw([cp(0.18, 0.008, 0.012), cp(0.135, 0.008, 0.012), cp(0.105, 0.04, 0.012), cp(*GANG, 0.012), cp(0.05, 0.05, 0.012),
                       cp(0.026, 0.038, 0.017), cp(0.018, 0.026, 0.017)], 0.0016, tint='#f2e2b5'),
         extra=[sph(cp(GANG[0], GANG[1] + 0.003, 0.016), 0.0045, tint='#f2e2b5')], short=T('Sensory', '感觉神经元')),
    dict(id='relay-neuron-study', name=T('Relay neuron', '中间神经元'), group='cord-study',
         summary=T('Passes the signal on inside the cord.', '在脊髓里把信号接下去。'),
         detail=T('Inside the spinal cord a relay neuron links the sensory neuron to the motor neuron; in a withdrawal reflex this turn happens in the cord, without waiting for the brain [S25, S26].',
                  '在脊髓里，中间神经元把感觉神经元和运动神经元接起来；缩回反射时，这个“转弯”在脊髓里完成，不用等脑 [S25, S26]。'),
         primitive=sw([cp(0.018, 0.024, 0.017), cp(0.014, 0.004, 0.017), cp(0.022, -0.012, 0.017), cp(0.028, -0.02, 0.017)], 0.0014, tint='#f2e2b5'),
         extra=[sph(cp(0.014, 0.006, 0.018), 0.0035, tint='#f2e2b5')], short=T('Relay', '中间神经元')),
    dict(id='motor-neuron-study', name=T('Motor neuron', '运动神经元'), group='cord-study',
         summary=T('Carries the command out to the muscle.', '把命令送到肌肉。'),
         detail=T('A motor neuron\'s cell body sits in the front horn of the grey matter; its axon leaves through the front root to a muscle [S27].',
                  '运动神经元的细胞体在灰质的前角；它的轴突从前根出去，到达肌肉 [S27]。'),
         primitive=sw([cp(0.03, -0.022, 0.017), cp(0.045, -0.03, 0.014), cp(0.07, -0.032, 0.012), cp(0.11, -0.018, 0.012), cp(0.135, -0.002, 0.012),
                       cp(0.18, -0.002, 0.012)], 0.0016, tint='#f2e2b5'),
         extra=[sph(cp(0.03, -0.022, 0.018), 0.005, tint='#f2e2b5')], short=T('Motor', '运动神经元')),
]

# Layers round the brain: an arched wedge facing the front, outermost on top. Thicknesses are not to scale.
LX, LY, LZ = -0.85, -0.01, -0.27   # centre of the arcs (below the wedge)
ANG0, ANG1 = math.radians(60), math.radians(120)


def band(r_in, r_out, wave=None, n=48):
    """Closed outline of an arc band in the xy plane; `wave(t)` bends a radius into sulci."""
    ts = [ANG0 + (ANG1 - ANG0) * i / (n - 1) for i in range(n)]
    ro = [r_out(t) if callable(r_out) else r_out for t in ts]
    ri = [r_in(t) if callable(r_in) else r_in for t in ts]
    outer = [[round(r * math.cos(t), 4), round(r * math.sin(t), 4)] for r, t in zip(ro, ts)]
    inner = [[round(r * math.cos(t), 4), round(r * math.sin(t), 4)] for r, t in zip(ri, ts)][::-1]
    return outer + inner


def gyri(base, depth):
    """A cortex surface radius with three sulci."""
    def f(t):
        u = (t - ANG0) / (ANG1 - ANG0)
        dip = sum(math.exp(-((u - c) / 0.055) ** 2) for c in (0.25, 0.5, 0.75))
        return base - depth * dip
    return f


CORTEX_TOP = gyri(0.150, 0.016)
PIA = (lambda t: CORTEX_TOP(t), lambda t: CORTEX_TOP(t) + 0.0015)


def layer(id, name, summary, detail, outline, color, tint=None, depth=0.06, z=0.0, extra=None, short=None):
    prim = dict(kind='extrude', shape=outline, depth=depth, at=r4([LX, LY, LZ + z - depth / 2]), color=color)
    if tint:
        prim['tint'] = tint
    p = dict(id=id, name=name, group='layers-study', summary=summary, detail=detail, primitive=prim)
    if extra:
        p['extra'] = extra
    if short:
        p['short'] = short
    return p


threads = []
for i in range(9):
    t = ANG0 + (ANG1 - ANG0) * (0.08 + 0.105 * i)
    r0, r1 = CORTEX_TOP(t) + 0.0015, 0.162
    threads.append(dict(kind='box', size=[0.0012, round(r1 - r0, 4), 0.0012], at=r4([LX + (r0 + r1) / 2 * math.cos(t), LY + (r0 + r1) / 2 * math.sin(t), LZ + 0.031]),
                        rotation=[0, 0, round(math.degrees(t) - 90, 2)], color='membrane', tint='#cfc7bd'))
LAYERS = [
    layer('scalp-layer', T('Scalp', '头皮'), T('Skin and hair on the outside.', '最外面的皮肤和头发。'),
          T('The outermost layer: the skin of the head. All the layers here are drawn thicker than they really are [S1].', '最外面的一层：头部的皮肤。这里的每一层都画得比真实的厚 [S1]。'),
          band(0.192, 0.204), 'tissue', '#c9a48e'),
    layer('skull-layer', T('Skull bone', '颅骨'), T('Hard bone round the brain.', '围住脑的硬骨头。'),
          T('The bone of the skull, a hard case round the brain.', '颅骨的骨头，是脑外面的硬壳。'),
          band(0.172, 0.192), 'tissue', 'token:bone'),
    layer('dura-layer', T('Dura', '硬脑膜'), T('The tough outer covering.', '坚韧的外层被膜。'),
          T('The outer layer of the coverings of the brain and spinal cord, tough fibrous tissue [S5].', '包着脑和脊髓的被膜的外层，是坚韧的纤维组织 [S5]。'),
          band(0.166, 0.172), 'membrane', '#d8d2c4'),
    layer('arachnoid-layer', T('Arachnoid', '蛛网膜'), T('A thin layer with cobweb-like threads.', '一层薄膜，下面有像蛛网的细丝。'),
          T('The middle covering looks like a cobweb; the space under it holds cerebrospinal fluid [S5]. It stretches over the grooves of the brain.',
            '中间的一层被膜看上去像蛛网；它下面的空间装着脑脊液 [S5]。它跨过脑表面的沟。'),
          band(0.162, 0.1645), 'membrane', '#e2dbd0', extra=threads),
    layer('csf-space', T('Fluid layer', '脑脊液层'), T('Clear fluid that cushions the brain.', '给脑当软垫的透明液体。'),
          T('Cerebrospinal fluid fills the space under the arachnoid [S5]; it is a buffer that limits knocks between the brain and the skull [S7].',
            '脑脊液充满蛛网膜下面的空间 [S5]；它是一层缓冲，减少脑和颅骨之间的碰撞 [S7]。'),
          band(PIA[1], 0.162), 'glass', 'token:air', short=T('Fluid', '脑脊液')),
    layer('pia-cortex', T('Pia and brain surface', '软脑膜与脑表面'), T('The thinnest covering, tight on the folded brain.', '最薄的一层，紧贴着有褶的脑。'),
          T('The innermost covering, the pia, is bound tightly to the surface of the brain [S5], so it follows the folds. Under it is the grey outer layer of the brain.',
            '最里面的一层被膜叫软脑膜，紧紧贴在脑的表面 [S5]，所以跟着褶皱起伏。它下面就是脑灰色的外层。'),
          band(0.118, PIA[1]), 'tissue', '#a58d82', short=T('Pia', '软脑膜')),
]

# Helmet on the head (shown in chapter 7 only).
HC = [0, 0.598, -0.117]
def dome(r, h, n=14, start=0.0):
    return [[round(r * math.sin(a), 4), round(h * math.cos(a), 4)] for a in [start + (math.pi / 2 - start) * i / (n - 1) for i in range(n)]]


shell = dome(0.106, 0.118) + dome(0.1, 0.112)[::-1]
liner = dome(0.0985, 0.1105)[:-1] + [[0.0985, 0.006], [0.084, 0.006]] + dome(0.084, 0.096)[::-1]
HELMET = [
    dict(id='helmet-shell', name=T('Helmet shell', '头盔外壳'), group='helmet',
         summary=T('A smooth hard outer shell.', '光滑坚硬的外壳。'),
         detail=T('The hard outer shell of a bicycle helmet, drawn simply; it holds the foam lining in place.', '自行车头盔坚硬的外壳，简单画出；它把泡沫内衬固定住。'),
         primitive=dict(kind='lathe', profile=shell, segments=48, at=HC, scale=[1, 1, 1.25], color='plastic', tint='#5f7a8c'),
         short=T('Shell', '外壳'), connects=['helmet-liner']),
    dict(id='helmet-liner', name=T('Foam lining', '泡沫内衬'), group='helmet',
         summary=T('Crushes to soak up the energy of a knock.', '被压扁时吸收撞击的能量。'),
         detail=T('The foam inside a helmet crushes in a fall or crash and absorbs the energy of the knock, so much of it does not reach the head [S36]. In crashes, riders who wore helmets had far fewer serious head injuries [S35].',
                  '摔倒或碰撞时，头盔里的泡沫被压扁、吸收撞击的能量，所以很多能量到不了头上 [S36]。在碰撞中，戴头盔的人头部重伤少得多 [S35]。'),
         primitive=dict(kind='lathe', profile=liner, segments=48, at=HC, scale=[1, 1, 1.25], color='tissue', tint='#e8e2d4'),
         short=T('Lining', '内衬'), connects=['helmet-strap']),
    dict(id='helmet-strap', name=T('Chin strap', '下巴带'), group='helmet',
         summary=T('Holds the helmet on; it must be fastened.', '把头盔固定住；一定要扣好。'),
         detail=T('The strap under the chin keeps the helmet in place. A helmet only protects when it is on the head and fastened.', '下巴底下的带子让头盔待在原位。头盔只有戴在头上、扣好带子才能起保护作用。'),
         primitive=sw([[0.09, 0.6, -0.09], [0.08, 0.54, -0.055], [0.04, 0.488, -0.032], [0, 0.48, -0.03], [-0.04, 0.488, -0.032],
                       [-0.08, 0.54, -0.055], [-0.09, 0.6, -0.09]], 0.0035, color='fabric', tint='#3d4247', section={'flat': 0.3}),
         short=T('Strap', '带子')),
]

# Try-it models: one metre of nerve (drawn half size) at the bench front; the ruler drop beside the bench; the hot mug.
NERVE_Y, NERVE_Z, N0, N1 = BTOP + 0.012, 0.36, -1.12, -0.62
thick_myelin = [dict(kind='capsule', size=[0.0075, 0.012], at=r4([N0 + 0.016 + i * 0.0302, NERVE_Y, NERVE_Z]), rotation=[0, 0, 90], color='tissue', tint='#efe6d4')
                for i in range(1, 16)]
FINGER_Y, RX, RZ = 0.27, -1.24, 0.30
TIP = A['fingertip']
MUG = [round(TIP[0], 4), round(TIP[1] - 0.048, 4), round(TIP[2] + 0.034, 4)]
mug_profile = [[0, 0], [0.035, 0], [0.038, 0.005], [0.04, 0.045], [0.037, 0.045], [0.035, 0.007], [0, 0.007]]
TRY = [
    dict(id='one-metre-nerve-thick', name=T('One metre of thick, wrapped fibre', '一米粗的、有髓鞘的纤维'), group='try-it',
         summary=T('A thick fibre with myelin, drawn half size.', '粗的、有髓鞘的纤维，画成一半长。'),
         detail=T('A model of one metre of a thick nerve fibre with myelin, drawn half as long. In this model a signal crosses it at 100 metres per second, in a hundredth of a second; the screen slows it 200 times [S1, S20].',
                  '一米长的粗的、有髓鞘的神经纤维模型，画成一半长。在这个模型里，信号每秒走 100 米，百分之一秒走完；画面放慢了 200 倍 [S1, S20]。'),
         primitive=dict(kind='cylinder', size=[0.0035, 0.0035, N1 - N0], at=[round((N0 + N1) / 2, 4), NERVE_Y, NERVE_Z], rotation=[0, 0, 90], color='tissue', tint='#d9c8b6'),
         extra=thick_myelin + [dict(kind='box', size=[0.004, 0.03, 0.004], at=r4([x, NERVE_Y + 0.015, NERVE_Z]), color='plastic', tint='token:ink-2') for x in (N0, N1)],
         short=T('Thick fibre', '粗纤维')),
    dict(id='one-metre-nerve-thin', name=T('One metre of thin, bare fibre', '一米细的、没有髓鞘的纤维'), group='try-it',
         summary=T('A thin fibre without myelin, drawn half size.', '细的、没有髓鞘的纤维，画成一半长。'),
         detail=T('A model of one metre of a thin nerve fibre without myelin, drawn half as long. In this model a signal crosses it at 1 metre per second, taking a whole second; the screen slows it 2 times [S1, S20].',
                  '一米长的细的、没有髓鞘的神经纤维模型，画成一半长。在这个模型里，信号每秒走 1 米，要整整一秒；画面放慢了 2 倍 [S1, S20]。'),
         primitive=dict(kind='cylinder', size=[0.0015, 0.0015, N1 - N0], at=[round((N0 + N1) / 2, 4), NERVE_Y, NERVE_Z], rotation=[0, 0, 90], color='tissue', tint='#d9c8b6'),
         extra=[dict(kind='box', size=[0.004, 0.03, 0.004], at=r4([x, NERVE_Y + 0.015, NERVE_Z]), color='plastic', tint='token:ink-2') for x in (N0, N1)],
         short=T('Thin fibre', '细纤维')),
    dict(id='ruler', name=T('Ruler', '尺子'), group='ruler-test',
         summary=T('A 30 cm ruler; where it is caught gives the time.', '30 厘米的尺子；接住的位置给出时间。'),
         detail=T('One person holds the ruler at the top, with its zero mark level with the other person\'s open finger and thumb, and lets go without warning; the catcher reads the mark where they caught it. A ruler that has fallen d centimetres has been falling for √(2d ÷ 9.81) seconds [S43]. Try it sitting down, with the ruler hanging straight and only the finger and thumb closing.',
                  '一个人捏住尺子的上端，让零刻度和另一个人张开的拇指与食指对齐，不打招呼就松手；接的人读出接住处的刻度。尺子落了 d 厘米，就已经下落了 √(2d ÷ 9.81) 秒 [S43]。坐着做，让尺子竖直垂下，只用拇指和食指去捏。'),
         primitive=dict(kind='bevelBox', size=[0.03, 0.30, 0.003], bevel=0.0008, at=[RX, round(FINGER_Y + 0.15, 4), RZ], color='wood', tint='#d8c49a'),
         extra=[dict(kind='box', size=[0.012 if i % 5 else 0.02, 0.0008, 0.0035], at=r4([RX - 0.009 + (0 if i % 5 else 0.004), FINGER_Y + 0.01 * i, RZ]), color='plastic', tint='token:ink-2')
                for i in range(1, 30)],
         clip=False),
    dict(id='catch-hand', name=T('Catching finger and thumb', '接尺子的拇指和食指'), group='ruler-test',
         summary=T('Open, ready to pinch the falling ruler.', '张开，准备捏住下落的尺子。'),
         detail=T('The catcher\'s finger and thumb, open on either side of the ruler\'s zero mark. Catching it is not a reflex: the eyes see it move, the brain decides and a command goes to the fingers [S8, S11].',
                  '接的人张开的拇指和食指，在尺子零刻度的两边。接住尺子不是反射：眼睛看见它动，脑做决定，再把命令送到手指 [S8, S11]。'),
         primitive=dict(kind='capsule', size=[0.009, 0.05], at=[RX, FINGER_Y, round(RZ + 0.02, 4)], rotation=[90, 0, 0], color='tissue', tint='token:mat-tissue'),
         extra=[dict(kind='capsule', size=[0.01, 0.035], at=[RX, FINGER_Y, round(RZ - 0.018, 4)], rotation=[90, 0, 0], color='tissue', tint='token:mat-tissue')],
         clip=False, short=T('Finger and thumb', '拇指和食指')),
    dict(id='hot-mug', name=T('Hot mug', '很烫的杯子'), group='reflex-arm', context=True,
         summary=T('A mug of something very hot.', '一杯很烫的东西。'),
         detail=T('A mug the right hand touches in the reflex chapter.', '缩手反射那一章里右手碰到的杯子。'),
         primitive=dict(kind='lathe', profile=mug_profile, segments=40, at=MUG, color='enamel', tint='#efe7da'),
         extra=[dict(kind='torus', size=[0.016, 0.004], at=r4([MUG[0] + 0.04, MUG[1] + 0.024, MUG[2]]), rotation=[0, 0, 0], color='enamel', tint='#efe7da'),
                # A small side table under the mug.
                dict(kind='bevelBox', size=[0.34, 0.025, 0.3], bevel=0.003, at=r4([MUG[0] - 0.02, MUG[1] - 0.0125, MUG[2] + 0.02]), color='wood')]
               + [dict(kind='bevelBox', size=[0.025, round(MUG[1] + 1.02 - 0.025, 4), 0.025], bevel=0.003,
                       at=r4([MUG[0] - 0.02 + sx * 0.15, (MUG[1] - 0.025 - 1.02) / 2, MUG[2] + 0.02 + sz * 0.13]), color='wood') for sx in (-1, 1) for sz in (-1, 1)],
         clip=False),
]

MARKERS = [
    dict(id='eye-markers', name=T('Eyes', '眼睛'), group='sense-markers',
         summary=T('Where the signals for seeing start.', '视觉信号从这里开始。'),
         detail=T('Simple balls marking the eyes, where the signals for seeing start [S30]. How the eye works is in the topic Eyes and Ears.',
                  '标出眼睛位置的简单小球，视觉信号从这里开始 [S30]。眼睛怎样工作，在“眼与耳”主题里。'),
         primitive=sph(A['eyeL'], 0.0115, color='tissue', tint='#bdb3a6'), extra=[sph(A['eyeR'], 0.0115, color='tissue', tint='#bdb3a6')], short=T('Eyes', '眼睛')),
    dict(id='ear-marker', name=T('Inner ears', '内耳'), group='sense-markers',
         summary=T('Where the signals for hearing start.', '听觉信号从这里开始。'),
         detail=T('Small rings marking where the inner ears are, deep in the skull; the inner ear itself is drawn in the topic Eyes and Ears.',
                  '标出内耳位置的小环，在颅骨深处；内耳本身画在“眼与耳”主题里。'),
         primitive=dict(kind='torus', size=[0.005, 0.0016], at=r4(A['earL']), rotation=[0, 90, 0], color='plastic', tint='token:ink-2'),
         extra=[dict(kind='torus', size=[0.005, 0.0016], at=r4(A['earR']), rotation=[0, 90, 0], color='plastic', tint='token:ink-2')],
         short=T('Inner ears', '内耳')),
]

CONTEXT = [
    dict(id='skeleton-rest', name=T('Rest of the skeleton', '其余骨骼'), group='skeleton-context', mesh='skeleton-rest', material=BONE,
         summary=T('The other bones of the body, as context.', '身体的其他骨头，作背景。'),
         detail=T('The other bones of the adult reference body, drawn as context [S39].', '成年参考身体的其他骨头，画出来作背景 [S39]。'),
         shell=True, castShadow=False, context=True),
    dict(id='skin-outline', name=T('Body outline', '身体轮廓'), group='skin-context', mesh='skin-outline',
         material={'color': 'membrane', 'tint': 'token:mannequin'}, summary=T('Shows where everything sits in the body.', '显示各部分在身体里的位置。'),
         detail=T('The skin of the same reference body [S39].', '同一个参考身体的皮肤 [S39]。'), context=True, shell=True, castShadow=False),
    dict(id='skin-wire', name=T('Body outline · light', '身体轮廓 · 简化'), group='skin-context', mesh='skin-wire',
         material={'color': 'membrane', 'tint': 'token:mannequin'}, summary=T('Shows where everything sits in the body.', '显示各部分在身体里的位置。'),
         detail=T('A lighter outline of the same skin [S39].', '同一层皮肤的简化轮廓 [S39]。'), context=True, shell=True, castShadow=False),
]


# ---------------------------------------------------------------- flows
def P(flow):
    return ROUTES['flows'][flow]


def thin(points, n=120):
    """At most n points, evenly picked (keeps both ends)."""
    if len(points) <= n:
        return points
    step = (len(points) - 1) / (n - 1)
    return [points[round(i * step)] for i in range(n)]


def multi(flow):
    return [dict(id=k, path=thin(v['points'])) for k, v in P(flow).items()]


def single(flow):
    return thin(next(iter(P(flow).values()))['points'])


EL = 'token:en-electrical'
neuron_path = [r4([BODYX + 0.03, NY, NZ])] + [r4(p) for p in axon_path] + [r4(term_paths[2][0])]
sec_sensory = [cp(0.18, 0.008, 0.02), cp(0.135, 0.008, 0.02), cp(0.105, 0.04, 0.02), cp(GANG[0], GANG[1], 0.02), cp(0.05, 0.05, 0.02),
               cp(0.026, 0.038, 0.02), cp(0.018, 0.026, 0.02)]
sec_relay = [cp(0.018, 0.024, 0.02), cp(0.014, 0.004, 0.02), cp(0.022, -0.012, 0.02), cp(0.028, -0.02, 0.02)]
sec_motor = [cp(0.03, -0.022, 0.02), cp(0.045, -0.03, 0.02), cp(0.07, -0.032, 0.02), cp(0.11, -0.018, 0.02), cp(0.135, -0.002, 0.02), cp(0.18, -0.002, 0.02)]
chem = [dict(id=f'gap-{i}', path=[r4([SX + (i - 2.5) * 0.011, SY + 0.006, SZ]), r4([SX + (i - 2.5) * 0.011, SY - 0.003, SZ]),
                                   r4([SX + (i - 2.5) * 0.009, SY - 0.009, SZ])]) for i in range(6)]
FLOWS = [
    dict(id='overview-down', group='signals-down', paths=multi('overview-down'), speed=0.15, color=EL, count=220, size=0.38, spread=0.002,
         parts=['frontal-lobe', 'medulla', 'spinal-cord', 'arm-nerves'], clip=False),
    dict(id='overview-up', group='signals-up', paths=multi('overview-up'), speed=0.15, color=EL, count=180, size=0.38, spread=0.002,
         parts=['arm-nerves', 'spinal-cord', 'medulla', 'parietal-lobe'], clip=False),
    dict(id='reflex-touch', group='signals-reflex', path=single('reflex-touch'), speed=0.01, color=EL, count=20, size=0.4, spread=0.004),
    dict(id='reflex-sensory', group='signals-reflex', path=single('reflex-sensory'), speed=0.12, color=EL, count=140, size=0.45, spread=0.0012,
         ends='open', parts=['arm-nerves-forearm', 'arm-nerves', 'spinal-roots', 'spinal-cord'], clip=False),
    dict(id='reflex-relay', group='signals-reflex', path=single('reflex-relay'), speed=0.01, color=EL, count=12, size=0.3, spread=0.0005, ends='open', clip=False),
    dict(id='reflex-motor', group='signals-reflex', path=single('reflex-motor'), speed=0.12, color=EL, count=90, size=0.45, spread=0.0012, ends='open',
         parts=['spinal-cord', 'spinal-roots', 'arm-nerves', 'biceps-r'], clip=False),
    dict(id='reflex-to-brain', group='signals-reflex', path=single('reflex-to-brain'), speed=0.12, color=EL, count=60, size=0.3, spread=0.0015,
         parts=['spinal-cord', 'medulla', 'pons', 'parietal-lobe'], clip=False),
    dict(id='section-sensory', group='cord-study', path=sec_sensory, speed=0.03, color=EL, count=30, size=0.3, spread=0.0008, ends='open', clip=False),
    dict(id='section-relay', group='cord-study', path=sec_relay, speed=0.02, color=EL, count=15, size=0.3, spread=0.0006, ends='open', clip=False),
    dict(id='section-motor', group='cord-study', path=sec_motor, speed=0.03, color=EL, count=30, size=0.3, spread=0.0008, ends='open', clip=False),
    dict(id='axon-signal', group='signals-neuron', path=neuron_path, speed=0.08, color=EL, count=24, size=0.45, spread=0.002,
         parts=['neuron-body', 'axon', 'axon-terminals'], clip=False),
    dict(id='one-metre', group='signals-neuron', path=[[N0, NERVE_Y + 0.008, NERVE_Z], [N1, NERVE_Y + 0.008, NERVE_Z]], speed=0.25, color=EL, count=12,
         size=0.45, spread=0.001, clip=False),
    dict(id='chemical-cross', group='chemical-signals', paths=chem, speed=0.01, color='token:chemical-signal', count=60, size=0.3, spread=0.0015,
         parts=['vesicles', 'synapse-receiving'], clip=False),
    dict(id='sight-signal', group='signals-senses', paths=multi('sight-signal'), speed=0.06, color=EL, count=100, size=0.3, spread=0.0012,
         parts=['eye-markers', 'optic-pathway', 'occipital-lobe'], clip=False),
    dict(id='hearing-signal', group='signals-senses', paths=multi('hearing-signal'), speed=0.06, color=EL, count=60, size=0.3, spread=0.0012,
         parts=['ear-marker', 'hearing-nerve', 'pons', 'temporal-lobe'], clip=False),
    dict(id='reaction-route', group='signals-reaction', path=single('reaction-route'), speed=0.15, color=EL, count=140, size=0.3, spread=0.0015,
         parts=['occipital-lobe', 'frontal-lobe', 'medulla', 'spinal-cord', 'arm-nerves'], clip=False),
]

# ---------------------------------------------------------------- poses, animations
PIV = r4(ELBOW['pivot'])
FLEX_DEG = 20


def hinge_euler(axis, deg):
    """XYZ Euler angles (degrees; the engine's order, R = Rx·Ry·Rz) of a turn by `deg` about the unit `axis`."""
    n = math.sqrt(sum(a * a for a in axis))
    x, y, z = (a / n for a in axis)
    t = math.radians(deg)
    c, s, C = math.cos(t), math.sin(t), 1 - math.cos(t)
    m02, m12, m22 = x * z * C + y * s, y * z * C - x * s, c + z * z * C
    m01, m00 = x * y * C - z * s, c + x * x * C
    ry = math.asin(max(-1.0, min(1.0, m02)))
    return [round(math.degrees(math.atan2(-m12, m22)), 3), round(math.degrees(ry), 3), round(math.degrees(math.atan2(-m01, m00)), 3)]


# The measured elbow hinge (landmarks.json: the line between the epicondyles, oriented so + flexes the hand forward).
FLEX = hinge_euler(ELBOW['flexionAxis'], FLEX_DEG)
POSES = {
    'withdrawn': {'forearm-hand-r': {'pivot': PIV, 'rotation': FLEX},
                  'arm-nerves-forearm': {'pivot': PIV, 'rotation': FLEX},
                  'contract': {'biceps-r': 0.6}, 'duration': 0.35},
    'hemisphere-off': {'duration': 0.6},
}
ANIMATIONS = [
    dict(id='vesicle-release', target='vesicles', kind='pulse', scale=1.05, hz=0.5),
]

# ---------------------------------------------------------------- views and presets
BRAIN_CAM = dict(position=[0.52, 0.64, -0.1], target=[0.0, 0.585, -0.13], fov=30)
VIEWS = dict(
    assembled=dict(camera=BRAIN_CAM),
    xray=dict(camera=dict(position=[0.9, 0.35, 3.3], target=[-0.12, -0.12, -0.1], fov=30)),
    exploded=dict(camera=dict(position=[0.56, 0.67, -0.1], target=[0.0, 0.605, -0.13], fov=30)),
    cover=dict(position=[0.38, 0.66, -0.06], target=[0.0, 0.605, -0.13], fov=30),
    cutaway=dict(normal=[-1, 0, 0], offset=0.002),
    cuts=dict(midline=dict(normal=[-1, 0, 0], offset=0.002, label=T('Midline', '正中剖面'))),
    section=dict(plane='zy'),
    explodeLabel=T('Spread out', '摊开'),
)
PRESETS = [
    dict(id='body', label=T('Body', '全身'), camera=dict(position=[0.9, 0.35, 3.3], target=[-0.12, -0.12, -0.1], fov=30), view='xray'),
    dict(id='brain', label=T('Brain', '脑'), camera=BRAIN_CAM),
    dict(id='head', label=T('Head', '头部'), camera=dict(position=[-0.36, 0.71, 0.43], target=[0.0, 0.6, -0.11], fov=30)),
    dict(id='reflex', label=T('Reflex', '反射'), camera=dict(position=[-0.95, 0.12, 2.45], target=[-0.36, -0.04, 0.0], fov=30), view='xray'),
    dict(id='bench', label=T('Bench', '工作台'), camera=dict(position=[-0.62, 0.62, 1.08], target=[-0.88, 0.19, 0.02], fov=30)),
    dict(id='spine', label=T('Spine', '脊柱'), camera=dict(position=[0.75, 0.25, -1.75], target=[0, 0.12, -0.16], fov=30), view='xray'),
]

SPEC = [
    dict(key=T('Neurons in an adult brain', '成人脑里的神经元'), value=T('≈ 86 billion', '约 860 亿个'), tag='typical'),
    dict(key=T('Fastest nerve signals', '最快的神经信号'), value=T('up to ≈ 150 m/s', '最快约每秒 150 米'), tag='typical'),
    dict(key=T('Nerve pairs', '神经对数'), value=T('12 cranial · 31 spinal', '脑神经 12 对 · 脊神经 31 对'), tag='typical'),
    dict(key=T('Sleep, age 7–13', '7–13 岁睡眠'), value=T('≥ 9 h a night', '每晚至少 9 小时'), tag='typical'),
]
TELEMETRY = [
    dict(key=T('Signal speed', '信号速度'), follow='speed', unit='m/s', scope='observe'),
    dict(key=T('Time over 1 m', '走 1 米用时'), follow='time-ms', unit='ms', scope='observe'),
    dict(key=T('Slowed on screen', '画面放慢'), follow='slow', unit='×', scope='observe'),
    dict(key=T('Reaction time', '反应时间'), follow='reaction-ms', unit='ms', scope='observe'),
]

# ---------------------------------------------------------------- try-its (one table model, three experiments)
# Steps: every centimetre to 20, then every 2 cm to 30 (a step control has at most 24 values).
CATCH = list(range(3, 21)) + [22, 24, 26, 28, 30]
RULER = {d: round(math.sqrt(2 * d / 100 / 9.81) * 1000) for d in CATCH}
STOPS = [('whole', T('The whole reflex arc', '整条反射弧'), ['S25', 'S26']),
         ('skin', T('Receptors in the skin start a signal', '皮肤里的感受器产生信号'), ['S25']),
         ('sensory', T('A sensory neuron carries it to the spinal cord', '感觉神经元把它送进脊髓'), ['S4', 'S27']),
         ('relay', T('A relay neuron in the spinal cord passes it on', '脊髓里的中间神经元把它接过去'), ['S25']),
         ('motor', T('A motor neuron carries the command to the muscle', '运动神经元把命令送到肌肉'), ['S25', 'S27']),
         ('muscle', T('The biceps contracts and the hand pulls away', '肱二头肌收缩，手缩回'), ['S25']),
         ('brain', T('The message reaches the brain too', '消息也传到了脑'), ['S25', 'S26'])]
SIM = dict(
    kind='table',
    controls=[
        dict(id='fibre', kind='choice', default='thick-myelin', label=T('Nerve fibre', '神经纤维'),
             options=[dict(id='thick-myelin', label=T('Thick, with myelin', '粗的，有髓鞘')), dict(id='thin-bare', label=T('Thin, no myelin', '细的，没有髓鞘'))]),
        dict(id='stop', kind='step', values=list(range(7)), default=0, label=T('Step of the reflex', '反射的第几步')),
        dict(id='catch-cm', kind='step', values=CATCH, default=26, unit='cm', label=T('Where you caught it', '接住的位置')),
    ],
    outputs=[
        dict(id='speed', label=T('Signal speed', '信号速度'), unit='m/s', decimals=0, tag='sim'),
        dict(id='time-ms', label=T('Time over one metre', '走一米用时'), unit='ms', decimals=0, tag='sim'),
        dict(id='slow', label=T('Slowed down on screen', '画面放慢'), unit='×', decimals=0, tag='sim'),
        dict(id='where', label=T('Where the signal is', '信号在哪里'), kind='state', states={k: v for k, v, _ in STOPS}),
        dict(id='reaction-ms', label=T('Reaction time', '反应时间'), unit='ms', decimals=0, tag='sim'),
    ],
    table=dict(experiments=dict(
        speed=dict(keys=['fibre'], rows=[
            dict(when={'fibre': 'thick-myelin'}, set={'speed': 100, 'time-ms': 10, 'slow': 200}, source=['S1', 'S20']),
            dict(when={'fibre': 'thin-bare'}, set={'speed': 1, 'time-ms': 1000, 'slow': 2}, source=['S1', 'S20'])]),
        reflex=dict(keys=['stop'], rows=[dict(when={'stop': i}, set={'where': k}, source=s) for i, (k, _, s) in enumerate(STOPS)]),
        ruler=dict(keys=['catch-cm'], rows=[dict(when={'catch-cm': d}, set={'reaction-ms': t}, source=['S1', 'S43']) for d, t in RULER.items()]),
    )),
    bind=[
        dict(control='fibre', part='one-metre-nerve-thick', visible={'eq': 'thick-myelin'}),
        dict(control='fibre', part=['one-metre-nerve-thin'], visible={'eq': 'thin-bare'}),
        dict(control='fibre', part='myelin', visible={'eq': 'thick-myelin'}),
        dict(control='stop', flow='reflex-touch', visible={'in': [0, 1, 2]}),
        dict(control='stop', flow=['reflex-sensory', 'section-sensory'], visible={'in': [0, 2, 3]}),
        dict(control='stop', flow=['reflex-relay', 'section-relay'], visible={'in': [0, 3, 4]}),
        dict(control='stop', flow=['reflex-motor', 'section-motor'], visible={'in': [0, 4, 5]}),
        dict(control='stop', flow='reflex-to-brain', visible={'in': [0, 6]}),
        dict(control='stop', part=['forearm-hand-r', 'arm-nerves-forearm', 'biceps-r'], pose={'5': 'withdrawn', '6': 'withdrawn'}),
        dict(control='catch-cm', part='ruler', offset=dict(axis=[0, -1, 0], per=0.01)),
    ],
)

ALL = PARTS + STUDY + LAYERS + HELMET + TRY + MARKERS + [BENCH] + CONTEXT
for p in ALL:
    if p['id'] == 'skin-wire':
        p['group'] = 'skin-light'
GROUPS.insert(GROUPS.index(next(g for g in GROUPS if g['id'] == 'skin-context')) + 1,
              dict(id='skin-light', name=T('Body outline · light', '身体轮廓 · 简化'), color='token:mannequin', card=False))
doc = dict(model='/models/brain-and-nerves.glb', units=dict(modelUnit='m', scale=1), parts=ALL, groups=GROUPS, flows=FLOWS,
           animations=ANIMATIONS, poses=POSES, views=VIEWS, presets=PRESETS, spec=SPEC, telemetry=TELEMETRY, sim=SIM)
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
print('parts.json:', len(ALL), 'parts,', len(FLOWS), 'flows; ruler 20 cm ->', RULER[20], 'ms')
