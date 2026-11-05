/** Patch candidate for the shared orbit card. All lengths are illustration units,
 * never orbital inputs. Common tangents are solved from the depicted circles. */
import { useId } from 'react';
export type Disc = { x: number; y: number; r: number };
export function shadowCones(source: Disc, caster: Disc, end: number) {
  const d = caster.x - source.x;
  const su = (source.r - caster.r) / d, sp = (source.r + caster.r) / d;
  const cu = Math.sqrt(1 - su * su), cp = Math.sqrt(1 - sp * sp);
  const tip = caster.x + caster.r / su;
  const u = (x: number) => (caster.r - (x - caster.x) * su) / cu;
  const p = (x: number) => (caster.r + (x - caster.x) * sp) / cp;
  // Tangency points lie on the caster, rather than its vertical diameter.
  const ut = [caster.x + caster.r * su, caster.r * cu];
  const pt = [caster.x - caster.r * sp, caster.r * cp];
  const path = (points: number[][]) => points.map(([x,y],i) => `${i ? 'L' : 'M'}${x},${caster.y + y!}`).join(' ') + ' Z';
  return { tip, u, p,
    umbra: path([[ut[0]!,ut[1]!],[tip,0],[ut[0]!,-ut[1]!]]),
    penumbra: path([[pt[0]!,pt[1]!],[end,p(end)],[end,-p(end)],[pt[0]!,-pt[1]!]]),
    // The incident rays join exact corresponding/opposite solar tangent points.
    rays: `M${source.x + source.r * su},${source.y + source.r * cu} L${tip},${caster.y} L${source.x + source.r * su},${source.y - source.r * cu} M${source.x - source.r * sp},${source.y + source.r * cp} L${end},${caster.y - p(end)} M${source.x - source.r * sp},${source.y - source.r * cp} L${end},${caster.y + p(end)}`,
  };
}
export const solarLayout = { source:{x:30,y:86,r:24}, caster:{x:170,y:86,r:12}, earth:{x:332,y:86,r:25}, end:358 };
export const lunarLayout = { source:{x:30,y:88,r:24}, caster:{x:180,y:88,r:14}, total:{x:284,y:88,r:5}, partial:{x:316,y:81,r:5}, end:350 };
const txt = (zh: boolean, en: string, cn: string) => zh ? cn : en;
const line = {fill:'none',stroke:'var(--ink-3)',strokeWidth:.7};
const label = {fill:'var(--ink-2)',fontFamily:'var(--font-mono)',fontSize:12.5};
const body = {fill:'var(--panel-solid)',stroke:'var(--ink)',strokeWidth:.8};
export function EclipseShadowSchematic({zh, active, note}: {zh:boolean; active:'solar'|'lunar'; note?:{en:string;zh:string}}) {
  const id=useId().replaceAll(':','');
  const solar=shadowCones(solarLayout.source,solarLayout.caster,solarLayout.end);
  const lunar=shadowCones(lunarLayout.source,lunarLayout.caster,lunarLayout.end);
  const cones=(c:ReturnType<typeof shadowCones>) => <>
    <path d={c.penumbra} fill="var(--ink-3)" opacity=".16"/>
    <path d={c.umbra} fill="var(--ink)" opacity=".3"/>
    <path d={c.rays} style={line}/>
  </>;
  const sun=(s:Disc) => <circle cx={s.x} cy={s.y} r={s.r} fill="var(--en-light)" stroke="var(--ink-2)" strokeWidth=".7"/>;
  return <figure className="space-orbit__shadow" data-shadow-diagram="schematic">
    <figcaption style={{fontSize:11}}>{txt(zh,'Schematic, not to scale','示意，未按比例')}</figcaption>
    {active === 'solar' && <svg viewBox="0 0 362 156" role="img" style={{maxHeight:'none'}} aria-label={txt(zh,'Solar eclipse: converging lunar umbra just reaches Earth; partial eclipse in the diverging penumbra','日食：收敛的月球本影刚触及地球，发散的半影内可见日偏食')}>
      <defs><clipPath id={`${id}-earth`}><circle cx="332" cy="86" r="25"/></clipPath></defs>
      <text x="4" y="16" style={{...label,fill:active==='solar'?'var(--signal)':'var(--ink)'}}>{txt(zh,'SOLAR · Moon casts the shadow','日食 · 月球投影')}</text>
      {cones(solar)}{sun(solarLayout.source)}
      <circle cx="170" cy="86" r="12" style={body}/>
      <circle cx="332" cy="86" r="25" style={body}/>
      <g clipPath={`url(#${id}-earth)`}>{cones(solar)}</g>
      <circle cx="332" cy="86" r="25" fill="none" stroke="var(--ink)" strokeWidth=".8"/>
      <text x="30" y="125" textAnchor="middle" style={label}>{txt(zh,'Sun','太阳')}</text>
      <text x="170" y="115" textAnchor="middle" style={label}>{txt(zh,'Moon','月球')}</text>
      <text x="332" y="132" textAnchor="middle" style={label}>{txt(zh,'Earth','地球')}</text>
      <text x="205" y="48" style={label}>{txt(zh,'Penumbra','半影')}</text>
      <text x="213" y="101" style={label}>{txt(zh,'Umbra','本影')}</text>
      <circle cx="307" cy="86" r="1.8" fill="var(--signal)"/>
      <path d="M307 86 L288 119 L236 119" style={line}/>
      <text x="218" y="144" style={label}>{txt(zh,'Total','全食')}</text>
      <circle cx={332-Math.sqrt(625-225)} cy="71" r="1.8" fill="var(--signal)"/>
      <path d={`M${332-Math.sqrt(625-225)} 71 L315 37 H294`} style={line}/>
      <text x="287" y="31" style={label}>{txt(zh,'Partial','偏食')}</text>
    </svg>}
    {active === 'lunar' && <svg viewBox="0 0 362 164" role="img" style={{maxHeight:'none'}} aria-label={txt(zh,'Lunar eclipse: alternative positions of one Moon, wholly or partly inside Earth’s converging umbra','月食：同一月球的两个备选位置，分别全部或部分进入地球收敛的本影')}>
      <defs><clipPath id={`${id}-moons`}><circle {...{cx:284,cy:88,r:5}}/><circle {...{cx:316,cy:81,r:5}}/></clipPath></defs>
      <text x="4" y="16" style={{...label,fill:active==='lunar'?'var(--signal)':'var(--ink)'}}>{txt(zh,'LUNAR · Earth casts the shadow','月食 · 地球投影')}</text>
      {cones(lunar)}{sun(lunarLayout.source)}
      <circle cx="180" cy="88" r="14" style={body}/>
      <circle cx="284" cy="88" r="5" style={body}/><circle cx="316" cy="81" r="5" style={body}/>
      <g clipPath={`url(#${id}-moons)`}>{cones(lunar)}</g>
      <circle cx="284" cy="88" r="5" fill="none" stroke="var(--ink)" strokeWidth=".8"/>
      <circle cx="316" cy="81" r="5" fill="none" stroke="var(--ink)" strokeWidth=".8" strokeDasharray="2 1"/>
      <text x="30" y="128" textAnchor="middle" style={label}>{txt(zh,'Sun','太阳')}</text>
      <text x="180" y="121" textAnchor="middle" style={label}>{txt(zh,'Earth','地球')}</text>
      <text x="224" y="137" style={label}>{txt(zh,'Penumbra','半影')}</text>
      <text x="217" y="85" style={label}>{txt(zh,'Umbra','本影')}</text>
      <path d="M284 93 V108 H279 M316 76 V49 H292" style={line}/>
      <text x="270" y="121" style={label}>{txt(zh,'Total','全食')}</text>
      <text x="286" y="43" style={label}>{txt(zh,'Partial','偏食')}</text>
      <text x="181" y="157" textAnchor="middle" style={label}>{txt(zh,'Moon: alternative positions','月球：两个备选位置')}</text>
    </svg>}
    <p>{txt(zh,'Compare eclipse cases; the current observation is above. Umbra: no direct Sun. Penumbra: part of the Sun.','对照不同食型；当前观察结果见上方。本影：没有直射阳光。半影：部分太阳被遮。')}</p>
    {note && <p>{txt(zh,note.en,note.zh)}</p>}
  </figure>;
}
