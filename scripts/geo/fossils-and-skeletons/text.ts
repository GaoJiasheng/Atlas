/** Accepted bilingual copy, independent of geometry and generated parts.json. */
import type { Part } from '../../../src/engines/space-scene/schema';
export const PART_TEXT: Record<string, Pick<Part, 'name' | 'short' | 'chainName' | 'summary' | 'detail'>> = {
  "bone-sample": {
    "name": {
      "en": "Bone",
      "zh": "骨化石"
    },
    "summary": {
      "en": "Records the shape of a body part.",
      "zh": "记录身体部分的形体。"
    },
    "detail": {
      "en": "A fossil bone preserves evidence of a body part. Its shape alone cannot give an exact age. This general model does not represent a named species or specimen. [S2, S58, S90]",
      "zh": "骨化石保存身体部分的证据。单凭形状不能确定精确年龄。这个通用模型不代表具名物种或标本。[S2, S58, S90]"
    }
  },
  "track-slab": {
    "name": {
      "en": "Footprint",
      "zh": "足迹板"
    },
    "summary": {
      "en": "Records contact with sediment during an activity.",
      "zh": "记录活动时与沉积物的接触。"
    },
    "detail": {
      "en": "A foot pressed into sediment and left this hollow mark. The slab records activity, rather than preserving a foot bone. Its three main toe marks show a general teaching shape, without identifying a species. [S2, S7, S48, S90]",
      "zh": "脚压进沉积物，留下这个凹痕。石板记录活动，没有保存脚骨。三个主要趾印是通用教学形状，不能据此确定物种。[S2, S7, S48, S90]"
    }
  },
  "leaf-slab": {
    "name": {
      "en": "Leaf imprint",
      "zh": "叶印痕板"
    },
    "summary": {
      "en": "Records a leaf shape as a shallow impression.",
      "zh": "用浅印痕记录叶的形状。"
    },
    "detail": {
      "en": "The shallow leaf shape remains without organic material or a carbon film. Since a leaf is a plant body part, this impression is body evidence. Its general outline does not identify a species. [S54, S2, S90]",
      "zh": "这里只留下浅浅叶形，没有有机物质或碳膜。叶是植物身体的一部分，所以叶印痕也是身体证据。通用轮廓不能确定物种。[S54, S2, S90]"
    }
  },
  "leaf-lid": {
    "name": {
      "en": "Upper slab",
      "zh": "覆盖片"
    },
    "summary": {
      "en": "Covers the impression until the slab is moved aside.",
      "zh": "移开后才露出下面的印痕。"
    },
    "detail": {
      "en": "Move this upper piece aside to see the hollow leaf impression below. The pieces illustrate the process; they are not a real matching fossil pair. [S54, S90]",
      "zh": "移开覆盖片，可见下方凹入的叶印痕。两片用来说明过程，不是真实配对的化石。[S54, S90]"
    }
  },
  "sediment-low": {
    "name": {
      "en": "Lower sediment",
      "zh": "下部沉积"
    },
    "summary": {
      "en": "Supports the younger beds above it.",
      "zh": "承托上方较新的沉积层。"
    },
    "detail": {
      "en": "The lower bed formed first in this upright, undisturbed example. Its thickness does not tell us how much time passed. The invented section has no real-time scale. [S59, S90]",
      "zh": "在这个没有倒转或受扰动的例子中，下层先形成。厚度不能告诉我们经过多久；虚构剖面没有真实时间比例。[S59, S90]"
    }
  },
  "sediment-mid": {
    "name": {
      "en": "Bone-bearing sediment",
      "zh": "含骨沉积"
    },
    "summary": {
      "en": "Encloses the buried remains.",
      "zh": "围住埋藏的遗存。"
    },
    "detail": {
      "en": "This layer surrounds the bone. X-ray view makes it transparent so we can look inside. Rapid burial helps protect remains, but does not guarantee a fossil. [S2, S90]",
      "zh": "这一层围住骨。X 光视图让它透明，方便看见里面。快速埋藏有助保护遗存，却不能保证形成化石。[S2, S90]"
    }
  },
  "sediment-high": {
    "name": {
      "en": "Covering sediment",
      "zh": "覆盖沉积"
    },
    "summary": {
      "en": "Covers the bone-bearing layer.",
      "zh": "覆盖含骨层。"
    },
    "detail": {
      "en": "Weathering and erosion can remove rock above a fossil. Moving this cover aside shows the exposed stage; the bone itself stays in place. [S3, S90]",
      "zh": "风化和侵蚀能移走化石上方的岩石。移开覆盖层，显示出露后的情况，骨本身仍在原处。[S3, S90]"
    }
  },
  "buried-bone": {
    "name": {
      "en": "Buried bone",
      "zh": "埋藏骨"
    },
    "summary": {
      "en": "Preserves a body part within the middle bed.",
      "zh": "在中层内保存身体部分。"
    },
    "detail": {
      "en": "One bone lies inside the middle bed. Switch to the enlarged pore view to look inside the same bone. During burial, minerals can settle in its natural spaces. [S2, S4, S90]",
      "zh": "一根骨位于中层内。放大孔隙视图显示同一根骨的内部。埋藏过程中，矿物可以沉积到天然空隙里。[S2, S4, S90]"
    }
  },
  "pore-shell": {
    "name": {
      "en": "Bone pores",
      "zh": "骨的孔隙"
    },
    "summary": {
      "en": "Shows original spaces within the bone wall.",
      "zh": "显示骨壁内原有的空隙。"
    },
    "detail": {
      "en": "The enlarged section shows irregular spaces inside the bone wall. The wall around them remains. Switch between this view and the whole bone. The shapes have no microscopic scale or named bone type. [S4, S90]",
      "zh": "放大剖面显示骨壁内不规则的空隙，周围骨壁仍在。可以切换整骨与剖面视图。形状没有显微比例，也不指定骨件类型。[S4, S90]"
    }
  },
  "pore-minerals": {
    "name": {
      "en": "Pore minerals",
      "zh": "孔隙矿物"
    },
    "summary": {
      "en": "Fills part of the existing pore space.",
      "zh": "充填部分原有孔隙。"
    },
    "detail": {
      "en": "Minerals fill some pores while the original wall remains. Replacement is different: minerals take the place of dissolved original material. Both processes can happen together. The blocks show minerals in general. [S4, S90]",
      "zh": "矿物填入部分孔隙，原有骨壁仍在。置换则是矿物取代已溶解的原来物质。两种过程可以同时发生。小块代表一般矿物。[S4, S90]"
    }
  },
  "ash-low": {
    "name": {
      "en": "Lower ash",
      "zh": "下方灰层"
    },
    "summary": {
      "en": "Provides the older bounding layer.",
      "zh": "提供较古老的边界地层。"
    },
    "detail": {
      "en": "Suitable minerals in this lower ash layer help set the older age limit. The ash was deposited here directly. All ages and errors in this example are invented SIM values. Colour does not identify the rock type. [S5, S58, S90]",
      "zh": "下灰层的合适矿物帮助确定较老的年龄界限。灰直接沉积在原地。这里的年龄和误差都是虚构 SIM 数值，颜色不能鉴定岩石种类。[S5, S58, S90]"
    }
  },
  "fossil-bed": {
    "name": {
      "en": "Fossil bed",
      "zh": "含化石层"
    },
    "summary": {
      "en": "Places fossil evidence between dated ash layers.",
      "zh": "把化石置于可测年的灰层之间。"
    },
    "detail": {
      "en": "The fossil lies between ash layers that were deposited here directly. The layers are upright and undisturbed, and the fossil was not moved from an older deposit. The dates give a range, rather than an exact age or an average. [S58, S59, S90]",
      "zh": "化石夹在直接沉积于原地的灰层之间。地层没有倒转或受扰动，化石未从老沉积搬来。测年结果给出范围，不是精确年龄或平均数。[S58, S59, S90]"
    }
  },
  "ash-high": {
    "name": {
      "en": "Upper ash",
      "zh": "上方灰层"
    },
    "summary": {
      "en": "Provides the younger bounding layer.",
      "zh": "提供较年轻的边界地层。"
    },
    "detail": {
      "en": "The upper ash is younger in this upright sequence. It was deposited here directly. Thickness alone cannot measure elapsed time. These invented ages do not date the Singapore museum fossils. [S5, S58, S59, S90]",
      "zh": "这里的地层没有倒转，上灰层较新，灰直接沉积于原地。单凭厚度不能计算经过的时间。这些虚构年龄不用于给新加坡馆藏化石定年。[S5, S58, S59, S90]"
    }
  },
  "dated-crystal": {
    "name": {
      "en": "Dated mineral",
      "zh": "测年矿物"
    },
    "summary": {
      "en": "Represents the material whose isotope clock is measured.",
      "zh": "代表测量同位素时钟的材料。"
    },
    "detail": {
      "en": "Radioactive changes in suitable ash minerals can date an event such as crystallisation. The estimate depends on the method's conditions and has uncertainty. Carbon fourteen cannot date Mesozoic dinosaur bones. This enlarged crystal has no named mineral type. [S5, S6, S58, S90]",
      "zh": "火山灰中合适矿物的放射性变化，可测定结晶等事件的年龄。估计值受测年条件限制，也有误差。碳十四不能给中生代恐龙骨定年。这颗放大晶体不指定矿种。[S5, S6, S58, S90]"
    }
  },
  "sk-skull": {
    "name": {
      "en": "Skull",
      "zh": "头骨"
    },
    "short": {
      "en": "Skull · Direct record",
      "zh": "头骨·直接记录"
    },
    "chainName": {
      "en": "Skull",
      "zh": "头骨"
    },
    "summary": {
      "en": "Supports the jaw and encloses the open skull framework.",
      "zh": "与下颌对应，呈现中空的骨性框架。"
    },
    "detail": {
      "en": "Supports the jaw and encloses the open skull framework.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: cast (a copy made in a mould) of a recorded original. A cast can preserve direct shape evidence. The openings are schematic; no tooth count or named specimen is shown. [S7, S55, S56, S90]",
      "zh": "与下颌对应，呈现中空的骨性框架。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：有记录原件的复制件。复制件也能保留直接形状证据。孔洞为示意，不表示牙数或具名标本。[S7, S55, S56, S90]"
    }
  },
  "sk-jaw": {
    "name": {
      "en": "Jaw",
      "zh": "下颌"
    },
    "short": {
      "en": "Jaw · Direct record",
      "zh": "下颌·直接记录"
    },
    "chainName": {
      "en": "Jaw",
      "zh": "下颌"
    },
    "summary": {
      "en": "Forms the lower outline beneath the skull.",
      "zh": "在头骨下方构成下颌轮廓。"
    },
    "detail": {
      "en": "Forms the lower outline beneath the skull.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossil. [S7, S55, S56, S90]",
      "zh": "在头骨下方构成下颌轮廓。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。[S7, S55, S56, S90]"
    }
  },
  "sk-neck": {
    "name": {
      "en": "Neck",
      "zh": "颈部"
    },
    "short": {
      "en": "Neck · Comparison",
      "zh": "颈部·比较依据"
    },
    "chainName": {
      "en": "Neck",
      "zh": "颈部"
    },
    "summary": {
      "en": "Joins the skull to the trunk in a curved axis.",
      "zh": "以弯曲的轴连接头骨与躯干。"
    },
    "detail": {
      "en": "Joins the skull to the trunk in a curved axis.\n\nIn this invented reconstruction:\nShape evidence: Comparison.\nDisplay material: cast of another specimen. [S7, S55, S56, S90]",
      "zh": "以弯曲的轴连接头骨与躯干。\n\n在这个虚构复原中：\n形状依据：比较依据。\n展示材料：另一标本的复制件。[S7, S55, S56, S90]"
    }
  },
  "sk-trunk": {
    "name": {
      "en": "Trunk",
      "zh": "躯干轴"
    },
    "short": {
      "en": "Trunk · Direct record",
      "zh": "躯干轴·直接记录"
    },
    "chainName": {
      "en": "Trunk",
      "zh": "躯干轴"
    },
    "summary": {
      "en": "Links the neck, ribs and pelvis along the back.",
      "zh": "沿背部连接颈、肋部与骨盆。"
    },
    "detail": {
      "en": "Links the neck, ribs and pelvis along the back.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossils. [S7, S55, S56, S90]",
      "zh": "沿背部连接颈、肋部与骨盆。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。[S7, S55, S56, S90]"
    }
  },
  "sk-ribs": {
    "name": {
      "en": "Ribs",
      "zh": "肋部"
    },
    "short": {
      "en": "Ribs · Comparison",
      "zh": "肋部·比较依据"
    },
    "chainName": {
      "en": "Ribs",
      "zh": "肋部"
    },
    "summary": {
      "en": "Outlines the open rib cage beneath the trunk.",
      "zh": "在躯干下方形成开放胸廓。"
    },
    "detail": {
      "en": "Outlines the open rib cage beneath the trunk.\n\nIn this invented reconstruction:\nShape evidence: Comparison.\nDisplay material: sculpted part based on comparisons. [S7, S55, S56, S90]",
      "zh": "在躯干下方形成开放胸廓。\n\n在这个虚构复原中：\n形状依据：比较依据。\n展示材料：依据比较的补塑。[S7, S55, S56, S90]"
    }
  },
  "sk-pelvis": {
    "name": {
      "en": "Pelvis",
      "zh": "骨盆"
    },
    "short": {
      "en": "Pelvis · Direct record",
      "zh": "骨盆·直接记录"
    },
    "chainName": {
      "en": "Pelvis",
      "zh": "骨盆"
    },
    "summary": {
      "en": "Connects the trunk with the hindlimbs and tail.",
      "zh": "连接躯干、后肢与尾。"
    },
    "detail": {
      "en": "Connects the trunk with the hindlimbs and tail.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossils. [S7, S55, S56, S90]",
      "zh": "连接躯干、后肢与尾。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。[S7, S55, S56, S90]"
    }
  },
  "sk-arm-l": {
    "name": {
      "en": "Left forelimb",
      "zh": "左前肢"
    },
    "short": {
      "en": "Left forelimb · Direct record",
      "zh": "左前肢·直接记录"
    },
    "chainName": {
      "en": "Left forelimb",
      "zh": "左前肢"
    },
    "summary": {
      "en": "Forms a short arm with two functional fingers.",
      "zh": "构成带两个功能性手指的短前肢。"
    },
    "detail": {
      "en": "Forms a short forelimb with two functional fingers.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossils. Each T. rex hand has two functional fingers; other dinosaurs can differ. [S9] [S7, S55, S56, S90]",
      "zh": "构成带两个功能指的短前肢。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。霸王龙每手有两个功能性手指，其他恐龙可以不同。[S9][S7, S55, S56, S90]"
    }
  },
  "sk-arm-r": {
    "name": {
      "en": "Right forelimb",
      "zh": "右前肢"
    },
    "short": {
      "en": "Right forelimb · Comparison",
      "zh": "右前肢·比较依据"
    },
    "chainName": {
      "en": "Right forelimb",
      "zh": "右前肢"
    },
    "summary": {
      "en": "Forms a short arm with two functional fingers.",
      "zh": "构成带两个功能性手指的短前肢。"
    },
    "detail": {
      "en": "Forms a short forelimb with two functional fingers.\n\nIn this invented reconstruction:\nShape evidence: Comparison.\nDisplay material: sculpted part based on the matching side. Each T. rex hand has two functional fingers; other dinosaurs can differ. [S9] [S7, S55, S56, S90]",
      "zh": "构成带两个功能指的短前肢。\n\n在这个虚构复原中：\n形状依据：比较依据。\n展示材料：参照对应侧的补塑。霸王龙每手有两个功能性手指，其他恐龙可以不同。[S9][S7, S55, S56, S90]"
    }
  },
  "sk-leg-l": {
    "name": {
      "en": "Left hindlimb",
      "zh": "左后肢"
    },
    "short": {
      "en": "Left hindlimb · Direct record",
      "zh": "左后肢·直接记录"
    },
    "chainName": {
      "en": "Left hindlimb",
      "zh": "左后肢"
    },
    "summary": {
      "en": "Supports the hindquarters through three main load-bearing toes.",
      "zh": "通过三个主要承重趾支撑后部身体。"
    },
    "detail": {
      "en": "Supports the hindquarters through three main load-bearing toes.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossils. Three main support toes bear weight, as in theropod feet. The smaller raised toe is outside this count. [S48] [S7, S55, S56, S90]",
      "zh": "通过三个主要承重趾支撑后部身体。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。兽脚类足部的三个主要承重趾支撑身体，较小的抬起脚趾不算在内。[S48][S7, S55, S56, S90]"
    }
  },
  "sk-leg-r": {
    "name": {
      "en": "Right hindlimb",
      "zh": "右后肢"
    },
    "short": {
      "en": "Right hindlimb · Direct record",
      "zh": "右后肢·直接记录"
    },
    "chainName": {
      "en": "Right hindlimb",
      "zh": "右后肢"
    },
    "summary": {
      "en": "Supports the hindquarters through three main load-bearing toes.",
      "zh": "通过三个主要承重趾支撑后部身体。"
    },
    "detail": {
      "en": "Supports the hindquarters through three main load-bearing toes.\n\nIn this invented reconstruction:\nShape evidence: Direct record.\nDisplay material: original fossils. Three main support toes bear weight, as in theropod feet. The smaller raised toe is outside this count. [S48] [S7, S55, S56, S90]",
      "zh": "通过三个主要承重趾支撑后部身体。\n\n在这个虚构复原中：\n形状依据：直接记录。\n展示材料：原化石。兽脚类足部的三个主要承重趾支撑身体，较小的抬起脚趾不算在内。[S48][S7, S55, S56, S90]"
    }
  },
  "sk-tail-base": {
    "name": {
      "en": "Tail base",
      "zh": "尾基"
    },
    "short": {
      "en": "Tail base · Inference",
      "zh": "尾基·推定"
    },
    "chainName": {
      "en": "Tail base",
      "zh": "尾基"
    },
    "summary": {
      "en": "Continues the backbone behind the pelvis.",
      "zh": "在骨盆后延续身体轴。"
    },
    "detail": {
      "en": "Continues the backbone behind the pelvis.\n\nIn this invented reconstruction:\nShape evidence: Inference.\nDisplay material: sculpted part. [S7, S55, S56, S90]",
      "zh": "在骨盆后延续身体轴。\n\n在这个虚构复原中：\n形状依据：推定。\n展示材料：补塑。[S7, S55, S56, S90]"
    }
  },
  "sk-tail-tip": {
    "name": {
      "en": "Tail tip",
      "zh": "尾端"
    },
    "short": {
      "en": "Tail tip · Inference",
      "zh": "尾端·推定"
    },
    "chainName": {
      "en": "Tail tip",
      "zh": "尾端"
    },
    "summary": {
      "en": "Tapers into a long tail raised clear of the platform.",
      "zh": "逐渐收细为抬离台面的长尾。"
    },
    "detail": {
      "en": "Tapers into a long tail raised clear of the platform.\n\nIn this invented reconstruction:\nShape evidence: Inference.\nDisplay material: sculpted part. [S7, S55, S56, S90]",
      "zh": "逐渐收细为抬离台面的长尾。\n\n在这个虚构复原中：\n形状依据：推定。\n展示材料：补塑。[S7, S55, S56, S90]"
    }
  },
  "myna-body": {
    "name": {
      "en": "Myna",
      "zh": "八哥"
    },
    "summary": {
      "en": "Shows the main outline of a local living bird.",
      "zh": "显示本地活鸟的大部位轮廓。"
    },
    "detail": {
      "en": "This model represents a Javan myna found in Singapore. Birds belong to theropod dinosaurs, so the myna is a local living dinosaur. It is not a Tyrannosaurus changing into a myna. [S8, S23, S90]",
      "zh": "模型代表新加坡能见到的爪哇八哥。鸟属于兽脚类恐龙，因此八哥是本地活恐龙。它不是由霸王龙变成的。[S8, S23, S90]"
    }
  },
  "myna-wing": {
    "name": {
      "en": "Wing",
      "zh": "翼"
    },
    "summary": {
      "en": "Represents the bird forelimb.",
      "zh": "代表鸟的前肢。"
    },
    "detail": {
      "en": "A wing is a bird's forelimb. The folded shape marks this body region without copying measured myna bones. Scientists use wider fossil and body evidence to establish ancestry; similar outlines alone are not enough. [S8, S10, S90]",
      "zh": "翼是鸟的前肢。折翼标出这个身体部位，没有复制实测八哥骨骼。科学家结合更多化石和身体证据判断祖先关系，相似轮廓还不够。[S8, S10, S90]"
    }
  },
  "myna-leg": {
    "name": {
      "en": "Bird hindlimbs",
      "zh": "鸟的后肢"
    },
    "summary": {
      "en": "Supports the living-bird outline.",
      "zh": "支撑活鸟的外形。"
    },
    "detail": {
      "en": "Both hindlimbs support the teaching bird. Their shape cannot identify the maker of the separate footprint. The model shows broad body regions, without exact measurements or detailed myna bone structure. [S8, S23, S90]",
      "zh": "两条后肢支撑教学鸟模型。它们的形状不能确定另一块足迹是谁留下的。模型显示主要部位，没有精确尺寸或细致的八哥骨骼结构。[S8, S23, S90]"
    }
  },
  "myna-feather": {
    "name": {
      "en": "Feather",
      "zh": "羽毛比较件"
    },
    "summary": {
      "en": "Enlarges a modern feather for comparison.",
      "zh": "放大现生鸟羽以便比较。"
    },
    "detail": {
      "en": "This modern-bird feather model is enlarged beyond the bird's scale. It is not a fossil. Archaeopteryx fossils preserve features useful for studying early birds, without proving it was the direct ancestor of every living bird. [S10, S90]",
      "zh": "现生鸟羽模型已放大，不与鸟身同一比例，也不是化石。始祖鸟化石的特征有助研究早期鸟类，却不能证明它是所有现生鸟的直接祖先。[S10, S90]"
    }
  },
  "prince-study": {
    "name": {
      "en": "Prince study",
      "zh": "Prince 示意"
    },
    "summary": {
      "en": "Introduces Prince, a long-necked sauropod displayed in Singapore.",
      "zh": "介绍在新加坡展出的长颈蜥脚类 Prince。"
    },
    "detail": {
      "en": "Prince is a diplodocid sauropod fossil at the Lee Kong Chian Natural History Museum. It was found at Dana Quarry in Wyoming's Jurassic Morrison Formation.\n\nThis general model does not copy its exact size or display pose. It does not identify its species, sex or original and restored bones. Finding the fossils together does not prove they were parents and a child. [S17, S57, S90]",
      "zh": "Prince 是李光前自然历史博物馆内的梁龙科蜥脚类化石，发现于怀俄明州 Dana 采石场的侏罗纪莫里森组。\n\n通用模型没有复制它的准确大小或展示姿态，也不标物种、性别或原骨与修复部分。一起发现不能证明这些动物是父母与孩子。[S17, S57, S90]"
    }
  },
  "apollonia-study": {
    "name": {
      "en": "Apollonia study",
      "zh": "Apollonia 示意"
    },
    "summary": {
      "en": "Introduces Apollonia, a long-necked sauropod displayed in Singapore.",
      "zh": "介绍在新加坡展出的长颈蜥脚类 Apollonia。"
    },
    "detail": {
      "en": "Apollonia is a diplodocid sauropod fossil at the Lee Kong Chian Natural History Museum. It was found at Dana Quarry in Wyoming's Jurassic Morrison Formation.\n\nThis general model does not copy its exact size or display pose. It does not identify its species, sex or original and restored bones. Finding the fossils together does not prove they were parents and a child. [S17, S57, S90]",
      "zh": "Apollonia 是李光前自然历史博物馆内的梁龙科蜥脚类化石，发现于怀俄明州 Dana 采石场的侏罗纪莫里森组。\n\n通用模型没有复制它的准确大小或展示姿态，也不标物种、性别或原骨与修复部分。一起发现不能证明这些动物是父母与孩子。[S17, S57, S90]"
    }
  },
  "twinky-study": {
    "name": {
      "en": "Twinky study",
      "zh": "Twinky 示意"
    },
    "summary": {
      "en": "Introduces Twinky, a long-necked sauropod displayed in Singapore.",
      "zh": "介绍在新加坡展出的长颈蜥脚类 Twinky。"
    },
    "detail": {
      "en": "Twinky is a diplodocid sauropod fossil at the Lee Kong Chian Natural History Museum. It was found at Dana Quarry in Wyoming's Jurassic Morrison Formation.\n\nThis general model does not copy its exact size or display pose. It does not identify its species, sex or original and restored bones. Finding the fossils together does not prove they were parents and a child. [S17, S57, S90]",
      "zh": "Twinky 是李光前自然历史博物馆内的梁龙科蜥脚类化石，发现于怀俄明州 Dana 采石场的侏罗纪莫里森组。\n\n通用模型没有复制它的准确大小或展示姿态，也不标物种、性别或原骨与修复部分。一起发现不能证明这些动物是父母与孩子。[S17, S57, S90]"
    }
  },
  "study-plinth": {
    "name": {
      "en": "Study platform",
      "zh": "示意底台"
    },
    "summary": {
      "en": "Supports the teaching models.",
      "zh": "承托教学模型。"
    },
    "detail": {
      "en": "Three low bevelled display plinths support the generic studies; they do not copy the museum mounts.",
      "zh": "三座带倒角的低展台分别承托通用示意模型，不复制馆藏的真实展台。"
    }
  }
};
