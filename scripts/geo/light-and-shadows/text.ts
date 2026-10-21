/**
 * Texts for src/content/topics/light-and-shadows/data/parts.json (docs/35
 * §3.5): part names, the one-line summary that is also the leader label, and
 * the detail (paragraphs, [S#] = data/sources.json). English edited from the
 * Codex drafts (art/codex-drafts/light-and-shadows/); Chinese written on its
 * own (Singapore usage, docs/35 §1.6, §6.1).
 */
type T = { en: string; zh: string };
export interface PartText {
  name: T;
  summary: T;
  detail: T;
}

const t = (en: string, zh: string): T => ({ en, zh });
const part = (name: T, summary: T, detail: T): PartText => ({ name, summary, detail });

export const GROUP_TEXT: Record<string, T> = {
  source: t('Light source', '光源'),
  objects: t('Objects', '物体'),
  sheets: t('Sheets', '材料片'),
  screen: t('Screen', '屏幕'),
  'hole-cards': t('Cards with holes', '有孔的卡片'),
  'dark-box': t('Dark box', '暗箱'),
  outdoors: t('Courtyard', '户外空地'),
  rays: t('Light rays (drawn)', '光线（示意）'),
};

const CARD_SHAPE = t(
  'A shape cut from grey-brown cardboard 2 mm thick, clipped upright in the holder so that it faces the torch [S1]. Cardboard lets no light through in this model, so the card blocks every ray that reaches it and the screen behind shows its outline.\n\nTurn the card and its shadow narrows; edge-on to the torch it leaves only a thin strip. The shadow has the outline of the card as seen from the torch, never its colour or any pattern printed on it.',
  '从 2 毫米厚的灰褐色硬纸板上剪下的形状，竖着夹在支架上，正对手电筒 [S1]。在这个模型里，硬纸板不让光穿过，照到卡片的光全被挡住，后面的屏幕上就留下它的轮廓。\n\n转动卡片，影子会变窄；侧对手电筒时，只剩一条细细的影子。影子是从手电筒那边看过去卡片的轮廓，不会有卡片的颜色，也不会有印在上面的图案。',
);

/** Compact names for the four-column part chain; full names remain on the model and in the inspector. */
export const CHAIN_NAMES: Record<string, T> = {
  'torch-stand': t('Clamp', '夹座'),
  'card-circle': t('Round', '圆卡片'),
  'card-square': t('Square', '方卡片'),
  'card-triangle': t('Triangle', '三角卡片'),
  'card-circle-big': t('Big disc', '大圆卡片'),
  cone: t('Cone', '圆锥'),
  'screen-stand': t('Stand', '支架'),
  'light-sensor': t('Sensor', '传感器'),
  datalogger: t('Logger', '记录器'),
  'box-torch': t('Torch', '手电筒'),
  'box-ball': t('Ball', '球'),
  'box-inside': t('Darkness', '黑暗'),
};

export const PART_TEXT: Record<string, PartText> = {
  torch: part(
    t('Torch', '手电筒'),
    t('A light source: it gives out its own light.', '光源：自己发出光。'),
    t(
      'A small LED torch on a clamp. Light leaves the lens and spreads out in a cone; in this model it comes from a single point at the centre of the lens and the beam spreads 40° each side of its middle line [S1]. Because the source is a point, every shadow on the screen has a sharp edge.\n\nA real torch has an LED and a shiny reflector of some size, so the edge of its shadow is a little blurred [S7]. Never shine a torch into anyone’s eyes.',
      '一支夹在夹座上的小 LED 手电筒。光从镜片射出，向前散开成一个圆锥。在这个模型里，光从镜片中心的一个点发出，光束向中线两边各张开 40° [S1]。光源是一个点，所以屏幕上每个影子的边缘都是清楚的。\n\n真实的手电筒里，LED 和反光杯都有一定大小，影子的边缘会有点模糊 [S7]。不要用手电筒照别人的眼睛。',
    ),
  ),
  'torch-stand': part(
    t('Torch clamp', '手电筒夹座'),
    t('Holds the torch level, sliding along the track.', '把手电筒托平，可沿轨道滑动。'),
    t(
      'A ring clamp on an upright rod, fixed to a carriage that slides along the track. The clamp holds the torch so that the centre of its lens is level with the middle of the object and of the screen, 30 cm above the table [S1].\n\nMoving the carriage changes only one distance: from the torch to the object.',
      '立杆上的一个环形夹，立杆装在可以沿轨道滑动的滑座上。夹座把手电筒托住，让镜片中心与物体中心、屏幕中心一样高，都在桌面上方 30 厘米 [S1]。\n\n移动滑座，只改变一个距离：手电筒到物体的距离。',
    ),
  ),
  track: part(
    t('Track', '轨道'),
    t('Keeps the torch, object and screen in a line.', '让手电筒、物体、屏幕排成一线。'),
    t(
      'A straight aluminium rail 150 cm long, marked every centimetre with a longer mark every 10 cm [S1]. The torch, the object holder and the screen ride on it, so they always stay on one straight line.\n\nRead a distance from one carriage to the next. The marks have no numbers on this model.',
      '一条 150 厘米长的直铝轨，每 1 厘米一个刻度，每 10 厘米一条长刻度 [S1]。手电筒、物体支架和屏幕都装在它上面，所以总是在一条直线上。\n\n距离从一个滑座量到另一个滑座。这个模型的刻度上没有数字。',
    ),
  ),
  'object-holder': part(
    t('Holder', '物体支架'),
    t('Holds the object on the line of the light.', '把物体固定在光的路线上。'),
    t(
      'A thin steel rod, 4 mm across, with a small clip at the top, on a carriage fixed at the middle of the track [S1]. The cards and sheets stand in the clip; the tin, the cone and the ball rest on top of it.\n\nThe rod blocks light too. The thin line of shadow below the main shadow on the screen is the rod’s; a real holder makes one as well.',
      '一根直径 4 毫米的细钢杆，顶上有一个小夹子，装在固定于轨道中点的滑座上 [S1]。卡片和材料片夹在夹子里；罐子、圆锥和球放在夹子上面。\n\n细杆也会挡光。屏幕上主影子下面那条细细的影子就是细杆的；真实的支架也会有。',
    ),
  ),
  'card-circle': part(t('Round card', '圆形卡片'), t('Blocks light; its shadow has its round outline.', '挡住光，影子是它的圆形轮廓。'), CARD_SHAPE),
  'card-square': part(t('Square card', '正方形卡片'), t('Blocks light; its shadow has its square outline.', '挡住光，影子是它的正方形轮廓。'), CARD_SHAPE),
  'card-triangle': part(t('Triangle card', '三角形卡片'), t('Blocks light; its shadow has its triangle outline.', '挡住光，影子是它的三角形轮廓。'), CARD_SHAPE),
  'card-circle-big': part(
    t('Big round card', '大圆卡片'),
    t('A bigger card in the same place: a bigger shadow.', '同一个位置，卡片越大，影子越大。'),
    t(
      'A round card 12 cm across, cut from the same cardboard as the 8 cm card [S1]. In the same place, with the torch and the screen where they were, it makes a bigger shadow: 30 cm across instead of 20 cm in this model [S1].\n\nThe shadow keeps the card’s round outline; only its size changes.',
      '一张直径 12 厘米的圆卡片，和 8 厘米的卡片用同样的硬纸板做成 [S1]。放在同一个位置，手电筒和屏幕都不动，它的影子更大：在这个模型里，直径是 30 厘米，不是 20 厘米 [S1]。\n\n影子仍然是圆形的轮廓，变的只是大小。',
    ),
  ),
  tin: part(
    t('Tin', '罐子'),
    t('Side-on a rectangle, end-on a circle.', '侧对是长方形，端对是圆形。'),
    t(
      'A plain metal tin 6.6 cm across and 12 cm long, lying on its side across the line of the light [S1]. Seen from the torch, its outline is a rectangle, so its shadow is a rectangle. Turn its round end towards the torch and the same tin makes a round shadow.\n\nOne object can make shadows of different shapes: what counts is the outline it shows to the light.',
      '一只没有标签的铁罐，直径 6.6 厘米，长 12 厘米，横躺着，横过光的路线 [S1]。从手电筒那边看，它的轮廓是长方形，所以影子是长方形的。把圆圆的一头转向手电筒，同一个罐子的影子就变成圆形。\n\n同一个物体可以有不同形状的影子：要看它对着光源的那一面是什么轮廓。',
    ),
  ),
  cone: part(
    t('Paper cone', '纸圆锥'),
    t('Side-on a triangle, end-on a circle.', '侧对是三角形，端对是圆形。'),
    t(
      'A cone rolled from white paper, 8 cm across the base and 10 cm long, lying on its side [S1]. Side-on to the torch its outline is a triangle; turned so that its base faces the torch, it makes a round shadow.\n\nA round shadow alone cannot tell you whether it came from a cone, a ball, a tin or a card.',
      '用白纸卷成的圆锥，底面直径 8 厘米，长 10 厘米，横躺着 [S1]。侧对手电筒时，它的轮廓是三角形；把底面转向手电筒，影子就是圆形的。\n\n只看一个圆形的影子，说不出它是圆锥、球、罐子，还是卡片留下的。',
    ),
  ),
  ball: part(
    t('Ball', '球'),
    t('Makes a round shadow whichever way it turns.', '怎么转，影子都是圆的。'),
    t(
      'A ball 6.5 cm across with a dull, felt-like cover [S1]. From every direction its outline is a circle, so turning it never changes the shape of its shadow.\n\nIn this model its shadow is about 16 cm across with the torch 20 cm away and the screen 30 cm behind; it is slightly bigger than for a flat disc of the same size, because the torch sees a little round the curve of the ball [S1].',
      '一只直径 6.5 厘米的球，表面是毛毡一样的哑光面 [S1]。从哪个方向看，它的轮廓都是圆形，所以怎么转，影子的形状都不变。\n\n在这个模型里，手电筒在前面 20 厘米、屏幕在后面 30 厘米时，它的影子直径约 16 厘米。这比同样大小的扁圆片的影子略大一点，因为从手电筒那边能看到球面再往外绕过一点 [S1]。',
    ),
  ),
  'clear-glass': part(
    t('Clear glass', '透明玻璃'),
    t('Lets most light through; you can see through it.', '让大部分光穿过，看得清后面。'),
    t(
      'A square of clear glass 10 cm across and 4 mm thick [S1]. A glass maker gives 91 % light transmission for clear float glass of this thickness [S8]: most of the light goes straight through, so the shadow is so faint you can hardly see it and you can see clearly through the glass.\n\nThe 91 % in this model is that published figure for one product, not a measurement of this sheet.',
      '一块边长 10 厘米、厚 4 毫米的透明玻璃 [S1]。玻璃厂商给出这种厚度的透明浮法玻璃透光率为 91% [S8]：大部分光直穿过去，所以它的影子淡得几乎看不出来，隔着玻璃也看得清清楚楚。\n\n模型里的 91% 是一种产品公开的数据，不是在这块玻璃上量出来的。',
    ),
  ),
  'frosted-glass': part(
    t('Frosted glass', '磨砂玻璃'),
    t('Lets light through but scatters it.', '让光穿过，但把光散开。'),
    t(
      'A square of frosted glass 10 cm across and 4 mm thick; one face has been made rough with acid [S1]. The maker gives 83 % light transmission [S9], so most of the light gets through, but the rough face scatters it in every direction. You cannot see clearly through it, and less light reaches the screen straight behind.\n\nIn this model the sensor 10 cm behind reads 45 %; with the screen 30 cm behind, only 18 % [S1].',
      '一块边长 10 厘米、厚 4 毫米的磨砂玻璃，一面用酸蚀成粗糙的面 [S1]。厂商给出它的透光率是 83% [S9]：大部分光都能穿过，但粗糙的那一面把光向四面八方散开。隔着它看不清后面，照到正后方屏幕上的光也少了。\n\n在这个模型里，屏幕在后面 10 厘米时，传感器读数是 45%；屏幕在后面 30 厘米时，只有 18% [S1]。',
    ),
  ),
  'tracing-paper': part(
    t('Tracing paper', '描图纸'),
    t('Lets some light through and scatters it.', '让一部分光穿过，并把光散开。'),
    t(
      'A sheet of tracing paper 10 cm across, held by a clip [S1]. One measured sample of thick tracing paper, 70 g per square metre, let about 65 % of the light through, and scattered almost all of it [S10]. Thinner tracing papers let more through.\n\nIn this model it gives a lighter shadow than cardboard; the sensor 10 cm behind reads 35 % [S1].',
      '一张边长 10 厘米的描图纸，用夹子夹着 [S1]。一种较厚的描图纸（每平方米 70 克）实测让约 65% 的光穿过，而且几乎把这些光全部散开 [S10]；薄一些的描图纸透过的光更多。\n\n在这个模型里，它的影子比硬纸板的淡；屏幕在后面 10 厘米时，传感器读数是 35% [S1]。',
    ),
  ),
  'cardboard-sheet': part(
    t('Cardboard', '硬纸板'),
    t('Lets no light through.', '不让光穿过。'),
    t(
      'A square of grey-brown cardboard 10 cm across and 3 mm thick [S1]. All the light that reaches it is blocked, so its shadow is dark.\n\nThis model takes the light passing through cardboard as zero [S1]. That is a choice for the model, not a measured value for every kind of cardboard.',
      '一块边长 10 厘米、厚 3 毫米的灰褐色硬纸板 [S1]。照到它的光全被挡住，所以它的影子很深。\n\n这个模型把穿过硬纸板的光当作零 [S1]。这是模型的取值，不是每一种硬纸板的实测值。',
    ),
  ),
  'screen-board': part(
    t('Screen', '屏幕'),
    t('Catches the light and the shadow.', '接住光和影子。'),
    t(
      'A white board 60 cm wide and 50 cm high, standing square to the track with its centre on the line of the light [S1]. The bright patch on it is where the torch’s light lands; the shadow is the part of that patch the light cannot reach.\n\nA wall, the floor or a sheet of white paper can be a screen too. The screen does not make the shadow; it shows where the light is missing.',
      '一块 60 厘米宽、50 厘米高的白板，垂直立在轨道上，中心在光的路线上 [S1]。上面亮的一片是手电筒的光照到的地方；影子是这片亮光里光照不到的部分。\n\n墙、地面、一张白纸都可以当屏幕。影子不是屏幕造出来的，屏幕只是让我们看见哪里没有光。',
    ),
  ),
  'screen-stand': part(
    t('Screen stand', '屏幕支架'),
    t('Holds the screen upright, sliding along the track.', '让屏幕竖直立着，可沿轨道滑动。'),
    t(
      'A frame round the screen on a carriage that slides along the track, with a small shelf behind for the datalogger [S1]. Moving it changes only the distance from the object to the screen.',
      '屏幕四周的框架装在可沿轨道滑动的滑座上，后面有一个小托板放数据记录器 [S1]。移动它，只改变物体到屏幕的距离。',
    ),
  ),
  'light-sensor': part(
    t('Light sensor', '光传感器'),
    t('Measures how much light reaches the screen.', '测量照到屏幕的光有多少。'),
    t(
      'A small probe clipped behind the middle of the screen, looking through a hole in it [S1]. It measures the light reaching its own small window. A fair way to use it: first take a reading with nothing in the holder, then compare each sheet with that reading, with everything else unchanged [S11].\n\nIn this model the reading is given as a percentage of the empty-holder reading. It measures only its own small spot, not all the light that passes through a sheet.',
      '一个小探头，夹在屏幕中心的背面，从屏幕上的小孔往外“看” [S1]。它测量照到它那个小窗口的光。公平的用法是：先在支架上什么都不放，读一次数；再换上各种材料片，在其他条件都不变时和这个读数比较 [S11]。\n\n在这个模型里，读数写成“什么都不放时的百分之几”。它只测自己那一小块地方的光，不是穿过材料片的全部光。',
    ),
  ),
  datalogger: part(
    t('Datalogger', '数据记录器'),
    t('Shows and records the sensor’s readings.', '显示并记录传感器的读数。'),
    t(
      'A small box with a display, joined to the light sensor by a cable and riding on the screen’s carriage [S1]. It shows each reading and keeps a record, so the readings can be put in a table and drawn as a graph.\n\nNothing is written on its display in this model; the readings appear on the Try it card.',
      '一个带显示屏的小盒子，用线和光传感器连着，放在屏幕的滑座上 [S1]。它显示每次的读数并记录下来，方便填表、画图。\n\n这个模型的显示屏上不写字；读数显示在“试一试”卡片上。',
    ),
  ),
  'hole-card-1': part(
    t('Card with a hole 1', '有孔卡片 1'),
    t('Light passes only when the holes line up.', '小孔排成直线，光才穿得过。'),
    t(
      'A card 10 cm square with a hole 1.2 cm across in the middle, on its own stand 10 cm in front of the holder [S1]. With all three holes on one straight line from the torch, light passes through them and makes a bright dot on the screen.',
      '一张边长 10 厘米的卡片，中间有一个直径 1.2 厘米的小孔，立在自己的支架上，在物体支架前 10 厘米 [S1]。三个小孔和手电筒在一条直线上时，光穿过它们，在屏幕上照出一个亮点。',
    ),
  ),
  'hole-card-2': part(
    t('Card with a hole 2', '有孔卡片 2'),
    t('Move it 2 cm to one side and the dot is gone.', '往旁边挪 2 厘米，亮点就没了。'),
    t(
      'The middle card, clipped in the holder [S1]. Moved 2 cm to one side, its hole is no longer on the straight line through the other two, and the bright dot disappears: the light cannot bend round to reach it [S1, S3].',
      '中间那张卡片，夹在物体支架上 [S1]。往旁边挪 2 厘米，它的小孔就不在穿过另外两个小孔的那条直线上了，亮点随即消失：光不会拐弯去找那个小孔 [S1, S3]。',
    ),
  ),
  'hole-card-3': part(
    t('Card with a hole 3', '有孔卡片 3'),
    t('The third hole on the line to the screen.', '通往屏幕的直线上的第三个小孔。'),
    t(
      'The third card with a hole, on its own stand 10 cm behind the holder [S1]. Light that comes through all three holes travels on to the screen in the same straight line.',
      '第三张有孔卡片，立在自己的支架上，在物体支架后 10 厘米 [S1]。穿过三个小孔的光沿着同一条直线继续走到屏幕上。',
    ),
  ),
  box: part(
    t('Dark box', '暗箱'),
    t('A closed box: no light gets in except the torch’s.', '一只封闭的盒子，只有手电筒的光进得来。'),
    t(
      'A box about the size of a shoebox, 30 × 20 × 18 cm, painted black inside, with the lid closed [S1]. There is a viewing hole 1 cm across in the front and a small torch pushed through the left side. With the torch off, no light at all reaches what is inside.\n\nThe cut-open view lets you see inside for the explanation. Looking through the hole, you would see nothing until light from inside comes out of it.',
      '一只鞋盒大小的盒子，30 × 20 × 18 厘米，里面涂成黑色，盖子盖着 [S1]。正面有一个直径 1 厘米的观察孔，左侧插着一支小手电筒。手电筒关着时，箱里的东西一点光也照不到。\n\n透视图让我们看到箱子里面，是为了讲解。从小孔往里看，只有箱里的光从小孔出来，才看得见东西。',
    ),
  ),
  'box-torch': part(
    t('Small torch', '小手电筒'),
    t('The only light source inside the box.', '箱里唯一的光源。'),
    t(
      'A small torch pushed through the side of the box, shining across the inside [S1]. It is the only light source in the box: switch it off and nothing inside can be seen.',
      '一支从侧面插进箱里的小手电筒，光照向箱子里面 [S1]。它是箱里唯一的光源：关掉它，箱里什么也看不见。',
    ),
  ),
  'box-ball': part(
    t('Ball in the box', '箱里的球'),
    t('Seen only when it reflects light to your eye.', '把光反射进眼睛，才被看见。'),
    t(
      'A dull ball 6.5 cm across, lying on the floor of the box [S1]. It gives out no light of its own. Its rough surface reflects the torch’s light in many directions [S4], and some of that light leaves through the hole and enters your eye.\n\nWith the torch off, the model darkens the ball to show that no light reaches it. A pale ball is no exception: in complete darkness it cannot be seen.',
      '一只直径 6.5 厘米的哑光球，放在箱底 [S1]。它自己不发光。它粗糙的表面把手电筒的光向许多方向反射出去 [S4]，其中一部分从小孔出来，进入你的眼睛。\n\n手电筒关着时，模型把球画暗，表示没有光照到它。颜色浅的球也一样：完全没有光，它就看不见。',
    ),
  ),
  'box-mirror': part(
    t('Mirror', '镜子'),
    t('Reflects light very well.', '把光反射得很好。'),
    t(
      'A small flat mirror 6 cm square on a stand, turned so that the torch’s light reflects towards the hole [S1]. A mirror reflects light very well, so looking through the hole you would see a bright patch of torchlight.\n\nA dull ball reflects light too, but it spreads the light in many directions; the mirror sends it on together.',
      '一面边长 6 厘米的小平面镜，立在小架子上，转到能把手电筒的光反射向小孔的方向 [S1]。镜子把光反射得很好，所以从小孔看进去，会看到一片明亮的手电筒光。\n\n哑光的球也反射光，只是把光散向许多方向；镜子则把光整束地送出去。',
    ),
  ),
  'box-inside': part(
    t('Darkness in the box (drawn)', '箱里的黑暗（示意）'),
    t('Drawn while no light at all is inside the box.', '箱里完全没有光时画出的黑暗。'),
    t(
      'Not a real object: the model fills the box with this dark shading while the small torch is off, to show that no light is inside [S1]. The ball is still there, but nothing can be seen through the hole.\n\nThe cut-open view is lit by the light of the page, not of the box, so without this shading the ball would still look lit.',
      '这不是真实的东西：小手电筒关着时，模型用这层暗色把箱子里面填满，表示箱里没有光 [S1]。球还在箱里，可是从小孔看进去什么也看不见。\n\n透视图是靠画面本身的光照亮的，不是箱里的光；没有这层暗色，球看起来还是亮的。',
    ),
  ),
  pole: part(
    t('Pole', '杆子'),
    t('A 1 m pole: its shadow shows where the Sun is.', '1 米长的杆子，影子告诉你太阳在哪里。'),
    t(
      'A straight wooden pole 5 cm thick standing upright on a heavy round base, 1 m above the ground [S1]. Its shadow always points away from the Sun: long when the Sun is low, short when it is high.\n\nThe model works out the shadow from the Sun’s height and direction, which come from NOAA’s solar calculator for Singapore [S12].',
      '一根 5 厘米粗的木杆，竖直立在圆形重底座上，高出地面 1 米 [S1]。它的影子总是背着太阳：太阳低，影子长；太阳高，影子短。\n\n模型按太阳的高度和方向算出影子；太阳的高度和方向来自美国国家海洋和大气管理局（NOAA）的太阳计算器，地点是新加坡 [S12]。',
    ),
  ),
  'north-arrow': part(
    t('North arrow', '指北箭头'),
    t('Points north.', '指向北方。'),
    t(
      'A dark arrow painted on the ground, pointing north [S1]. Use it to read which way the pole’s shadow points.',
      '画在地上的箭头，指向北方 [S1]。用它来看杆子的影子指向哪个方位。',
    ),
  ),
  sun: part(
    t('Sun (not to scale)', '太阳（不按比例）'),
    t('The light source outdoors (not to scale).', '户外的光源（不按比例）。'),
    t(
      'The Sun is drawn as a small ball 5.5 m from the foot of the pole, in the direction of the real Sun at that time [S1, S12]. The real Sun is so far away that its light reaches the courtyard in almost parallel lines.\n\nNever look straight at the Sun.',
      '太阳画成一个小球，离杆脚 5.5 米，方向就是那一刻真实太阳的方向 [S1, S12]。真实的太阳非常远，照到空地上的光几乎是平行的。\n\n不要直视太阳。',
    ),
  ),
  'sun-path-oct': part(
    t('Sun’s path, 20 Oct', '太阳路径（10 月 20 日）'),
    t('The Sun’s path across the sky that day.', '那一天太阳在天上走过的路线。'),
    t(
      'The way the Sun seems to move across the sky on 20 October 2026, seen from the courtyard, worked out with NOAA’s solar calculator [S12]. The Sun seems to move because the Earth turns, once a day [S18].',
      '从空地上看，2026 年 10 月 20 日太阳在天上看起来走过的路线，用 NOAA 的太阳计算器算出 [S12]。太阳看起来在动，是因为地球每天自转一圈 [S18]。',
    ),
  ),
  'sun-path-jun': part(
    t('Sun’s path, 21 Jun', '太阳路径（6 月 21 日）'),
    t('The Sun’s path across the sky that day.', '那一天太阳在天上走过的路线。'),
    t(
      'The Sun’s path on 21 June 2026 [S12]. At midday it passes a little to the north of overhead, so the shadow at midday points south.',
      '2026 年 6 月 21 日太阳的路线 [S12]。中午时，太阳从头顶稍偏北的地方经过，所以中午的影子指向南边。',
    ),
  ),
  'sun-path-mar': part(
    t('Sun’s path, 24 Mar', '太阳路径（3 月 24 日）'),
    t('The Sun’s path across the sky that day.', '那一天太阳在天上走过的路线。'),
    t(
      'The Sun’s path on 24 March 2026 [S12]. Around midday it passes almost straight overhead, so the pole’s shadow is very short.',
      '2026 年 3 月 24 日太阳的路线 [S12]。中午前后，太阳几乎从头顶正上方经过，所以杆子的影子非常短。',
    ),
  ),
  courtyard: part(
    t('Courtyard', '水泥空地'),
    t('Level ground that catches the pole’s shadow.', '平整的地面，接住杆子的影子。'),
    t(
      'A round patch of level, pale concrete 11 m across, standing for an open school courtyard in Singapore at 1.3° N, 103.8° E [S1, S13]. The model takes the ground as perfectly flat and the sky as clear.\n\nIt is drawn 10 m from the light bench so that each can be shown on its own; the two are never on the same view.',
      '一块直径 11 米的浅色平整水泥地，代表新加坡（北纬 1.3°、东经 103.8°）一所学校里的空地 [S1, S13]。模型假设地面完全平整、天空无云。\n\n它画在光学实验台旁边 10 米外，两处各看各的，从不同框。',
    ),
  ),
  'bench-table': part(
    t('Classroom table', '教室桌'),
    t('The table the light bench stands on.', '放光学实验台的桌子。'),
    t(
      'An ordinary classroom table 180 × 60 cm, with its top 75 cm above the floor [S1]. It is here only to hold the bench and the dark box.',
      '一张普通的教室桌，180 × 60 厘米，桌面离地 75 厘米 [S1]。它只是用来放实验台和暗箱。',
    ),
  ),
};
