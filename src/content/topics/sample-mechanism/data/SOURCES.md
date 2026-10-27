# Sample mechanism design study (S1)

Draft engine fixture; no historical reconstruction or measured performance claim. All dimensions and tables are DESIGN / SIM from docs/52 §3.3–4. Original fixture files use the repository content license.

Pressure: D=0.47625m, d=0.04m, stroke=1.2192m, A=πD²/4, Ar=πd²/4, atmosphere=101.325kPa abs, hot=110kPa abs. F(top,bottom)=1000(top(A-Ar)+101.325Ar-bottom A) N; downward F(110,cold), upward -F(cold,110); W=(Fd+Fu)stroke/1000 kJ; Pi=W rate/60 kW. Comparison force=(101.325-cold)A kN has no rod-area term. Cold20/50/80 × rate8/10/12 gives nine complete rows.

Governor: L=0.5m, g=9.81m/s², ω=2πn/60, c=g/(Lω²), r=L√(1-c²), angle=acos(c), h=2L(1-c), J=(0,h), T=(1,0), M=circle(T,0.4,J,1.1,+1), ψ=atan2(My,Mx-1), ψ90=-2.814149273102258; u=0.5+(ψ-ψ90)/(π/2). Pose duration is zero; every upper/lower arm remains0.5m, JM1.1m, TM0.4m. Governor world origin [1,2,0.9]. No dynamic governor or engine-speed coupling.

Energy boundary is working-fluid heat input100 normalized units, useful work10/20/30 and rejection90/80/70, never measured Lap efficiency. One solid slice represents one normalized unit.

Geometry is exactly docs/52 §4.2, exported alongside this file in parts.json. Nine rod roles have θ0 local restEndpoints. World origin [0,5.6,0]. Distinct depths separate crossing radius/parallel rods, drive rod, gears, and rear flywheel. Piston display radial clearance0.003m. Valve travel0.015m and flow speed0.12m/s are display design.

Gears use48 identical involute teeth per wheel, module orbit/48, pitch radius orbit/2, pressure angle20°, addendum=module, dedendum=1.25 × module, total tangential backlash0.0003m divided equally. Each wheel is four90° sectors of12 teeth; each sector has146 outline points; each wheel uses one primitive and3 extra sectors. Exact involute flank samples and a rounded radial root blend are emitted by generate.mjs. Initial phases differ by half a tooth for tooth-to-gap engagement. Offline audit sampled256 relative phases over a full tooth period (which repeats48 times over a turn), both polygon boundaries at vertices and quarter-segment samples near contact: 174788 point-in-polygon checks, no overlap. This is a discrete polygon audit, not a manufacturing tolerance claim.
