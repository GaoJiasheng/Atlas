# Sample airfoil · original design study S58

Draft fixture, no aircraft performance measurements. Original fixture content/geometry: CC BY-NC-SA 4.0; engine code follows the repository software licence. No third-party coordinates, CAD, figures or software. No licence-family exceptions.

- S4 (= docs/45 S04): NASA lift equation, https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift-equation/
- S11: NASA metric average atmosphere, https://www.grc.nasa.gov/www/k-12/airplane/atmosmet.html
- S57: NASA mathematical mapping reference, https://www.grc.nasa.gov/WWW/K-12/airplane/map.html
- S58: Atlas original illustrative design, no external URL. F-D01–F-D06 are design choices, not measured facts. The spec's existing source review supplies these references; this engine session did not repeat the external factual review.

## Reproduction

ε=.08, R=1.08, zLE=−(1+2ε)−1/(1+2ε)=−2.0220689655172412; C=2−zLE=4.022068965517241; A=8πR/C=6.748606441044742. ζ=−ε+R exp(iθ), f=ζ+1/ζ, B=(f−zLE)/C. 128 distinct boundary vertices, physical chord 1 m, reference area 2 m²; drawn thickness .12 m is a cropped section, not the reference span. Quarter-chord rotation −α about origin+[.25c,0,0]. Field and pressure use the analytic Kutta circulation and complex-velocity equation of docs/45 §4.3. Code is independently implemented.

Cl=A sin(α) through |α|≤12°. Beyond that, signed linear interpolation through (12°,1), (16°,.85), (20°,.60), scaled by Cl12. These knots and 12° boundary are artificial, not wind-tunnel polar data; ideal flow cannot predict separation. No viscosity, finite-wing, drag, Reynolds correction, trim, mass or trajectory integration.

q=ρV²/2; L=q S Cl. The **fixed-density test template** uses ρ=1.225: at α4°, V40, S2, q980 Pa, Cl .47075898801417243, L922.687616507778 N. V20 gives L230.6719041269445 N. α8/12/16/20 gives L1840.8799916961648 / 2750.103784609618 / 2337.588216918175 / 1650.0622707657706 N; negative angles mirror signs. V0 keeps theoretical Cl but q=L=0 and no field/pressure.

The **page default** uses S11: T=15.04−.00649h; p=101.29((T+273.1)/288.08)^5.256 kPa; ρ=p/(.2869(T+273.1)). h0/5000/10000 gives ρ1.226613787410970/.7376745768470427/.4140080791698312 and α4/V40 lift923.9031443933111/555.6270996484747/311.8368390074898 N. At h0 p101.40093090454886 kPa, q981.291029928776 Pa. These are model results, not a real aircraft's cruise envelope.

Controls: −20…20° every4°, V=[0,20,30,40,50,60] m/s, h=[0,5000,10000] m. Fixed integration domain x[−1.5,3], y[−1.5,1.5], 16 upstream seeds, RK4 max .008c /2048 accepted steps, collision rejection and physical nondimensional tau. Display slows time80-fold; 8 markers/path (128 total) do not measure mass flow. Pressure64 surface midpoints is SIM, negative Cp below freestream static pressure; independent4096 midpoint pressure integration verifies Cl and x≈0 for the ideal 2D model only. No claim that real drag is zero. Stall lines are three static illustrative dashed paths, no prediction of separation onset location or unsteadiness.

Force block is a schematic, not an aircraft: L=W1000 N and T=D100 N are DESIGN composition values, hidden in the ordinary pupil view; bank20° is a fixed duration0 pose with lift world direction [0,cos20°,−sin20°], gravity unchanged. Arrow lengths may cap; readouts keep full signed force. No rotating force frame. No engine RPM or turbofan model is supplied by this fixture.
