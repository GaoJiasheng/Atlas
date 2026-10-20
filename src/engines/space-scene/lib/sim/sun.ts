/** NOAA Solar Calculator mathematical functions, ported from
 * https://gml.noaa.gov/grad/solcalc/main.js (retrieved 2026-10-20).
 * United States government work, public domain. Formula order and the
 * atmospheric refraction correction follow the original calculator.
 * Local time is hours in the exported convenience functions; NOAA uses minutes.
 */
import type { Vec3 } from '../math';
const degToRad = (degrees: number) => (degrees * Math.PI) / 180;
const radToDeg = (radians: number) => (radians * 180) / Math.PI;

export function calcTimeJulianCent(jd: number) {
  let T = (jd - 2451545.0) / 36525.0;
  return T;
}

export function calcGeomMeanLongSun(t: number) {
  let L0 = 280.46646 + t * (36000.76983 + t * 0.0003032);
  while (L0 > 360.0) {
    L0 -= 360.0;
  }
  while (L0 < 0.0) {
    L0 += 360.0;
  }
  return L0; // in degrees
}

export function calcGeomMeanAnomalySun(t: number) {
  let M = 357.52911 + t * (35999.05029 - 0.0001537 * t);
  return M; // in degrees
}

export function calcEccentricityEarthOrbit(t: number) {
  let e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t);
  return e; // unitless
}

export function calcSunEqOfCenter(t: number) {
  let m = calcGeomMeanAnomalySun(t);
  let mrad = degToRad(m);
  let sinm = Math.sin(mrad);
  let sin2m = Math.sin(mrad + mrad);
  let sin3m = Math.sin(mrad + mrad + mrad);
  let C = sinm * (1.914602 - t * (0.004817 + 0.000014 * t)) + sin2m * (0.019993 - 0.000101 * t) + sin3m * 0.000289;
  return C; // in degrees
}

export function calcSunTrueLong(t: number) {
  let l0 = calcGeomMeanLongSun(t);
  let c = calcSunEqOfCenter(t);
  let O = l0 + c;
  return O; // in degrees
}

export function calcSunApparentLong(t: number) {
  let o = calcSunTrueLong(t);
  let omega = 125.04 - 1934.136 * t;
  let lambda = o - 0.00569 - 0.00478 * Math.sin(degToRad(omega));
  return lambda; // in degrees
}

export function calcMeanObliquityOfEcliptic(t: number) {
  let seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813));
  let e0 = 23.0 + (26.0 + seconds / 60.0) / 60.0;
  return e0; // in degrees
}

export function calcObliquityCorrection(t: number) {
  let e0 = calcMeanObliquityOfEcliptic(t);
  let omega = 125.04 - 1934.136 * t;
  let e = e0 + 0.00256 * Math.cos(degToRad(omega));
  return e; // in degrees
}

export function calcSunDeclination(t: number) {
  let e = calcObliquityCorrection(t);
  let lambda = calcSunApparentLong(t);
  let sint = Math.sin(degToRad(e)) * Math.sin(degToRad(lambda));
  let theta = radToDeg(Math.asin(sint));
  return theta; // in degrees
}

export function calcEquationOfTime(t: number) {
  let epsilon = calcObliquityCorrection(t);
  let l0 = calcGeomMeanLongSun(t);
  let e = calcEccentricityEarthOrbit(t);
  let m = calcGeomMeanAnomalySun(t);

  let y = Math.tan(degToRad(epsilon) / 2.0);
  y *= y;

  let sin2l0 = Math.sin(2.0 * degToRad(l0));
  let sinm = Math.sin(degToRad(m));
  let cos2l0 = Math.cos(2.0 * degToRad(l0));
  let sin4l0 = Math.sin(4.0 * degToRad(l0));
  let sin2m = Math.sin(2.0 * degToRad(m));

  let Etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 - 0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m;
  return radToDeg(Etime) * 4.0; // in minutes of time
}

export function getJD(year: number, month: number, day: number) {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  let A = Math.floor(year / 100);
  let B = 2 - A + Math.floor(A / 4);
  let JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return JD;
}

export function calcRefraction(elev: number) {
  let correction: number;
  if (elev > 85.0) {
    correction = 0.0;
  } else {
    let te = Math.tan(degToRad(elev));
    if (elev > 5.0) {
      correction = 58.1 / te - 0.07 / (te * te * te) + 0.000086 / (te * te * te * te * te);
    } else if (elev > -0.575) {
      correction = 1735.0 + elev * (-518.2 + elev * (103.4 + elev * (-12.79 + elev * 0.711)));
    } else {
      correction = -20.774 / te;
    }
    correction = correction / 3600.0;
  }

  return correction;
}

export function calcAzEl(T: number, localtime: number, latitude: number, longitude: number, zone: number) {
  let eqTime = calcEquationOfTime(T);
  let theta = calcSunDeclination(T);

  let solarTimeFix = eqTime + 4.0 * longitude - 60.0 * zone;
  let trueSolarTime = localtime + solarTimeFix;
  while (trueSolarTime > 1440) {
    trueSolarTime -= 1440;
  }
  let hourAngle = trueSolarTime / 4.0 - 180.0;
  if (hourAngle < -180) {
    hourAngle += 360.0;
  }
  let haRad = degToRad(hourAngle);
  let csz = Math.sin(degToRad(latitude)) * Math.sin(degToRad(theta)) + Math.cos(degToRad(latitude)) * Math.cos(degToRad(theta)) * Math.cos(haRad);
  if (csz > 1.0) {
    csz = 1.0;
  } else if (csz < -1.0) {
    csz = -1.0;
  }
  let zenith = radToDeg(Math.acos(csz));
  let azDenom = Math.cos(degToRad(latitude)) * Math.sin(degToRad(zenith));
  let azimuth: number;
  if (Math.abs(azDenom) > 0.001) {
    let azRad = (Math.sin(degToRad(latitude)) * Math.cos(degToRad(zenith)) - Math.sin(degToRad(theta))) / azDenom;
    if (Math.abs(azRad) > 1.0) {
      if (azRad < 0) {
        azRad = -1.0;
      } else {
        azRad = 1.0;
      }
    }
    azimuth = 180.0 - radToDeg(Math.acos(azRad));
    if (hourAngle > 0.0) {
      azimuth = -azimuth;
    }
  } else {
    if (latitude > 0.0) {
      azimuth = 180.0;
    } else {
      azimuth = 0.0;
    }
  }
  if (azimuth < 0.0) {
    azimuth += 360.0;
  }
  let exoatmElevation = 90.0 - zenith;

  // Atmospheric Refraction correction
  let refractionCorrection = calcRefraction(exoatmElevation);

  let solarZen = zenith - refractionCorrection;
  let elevation = 90.0 - solarZen;

  return { azimuth: azimuth, elevation: elevation };
}

export function calcSolNoon(jd: number, longitude: number, timezone: number) {
  let tnoon = calcTimeJulianCent(jd - longitude / 360.0);
  let eqTime = calcEquationOfTime(tnoon);
  let solNoonOffset = 720.0 - longitude * 4 - eqTime; // in minutes
  let newt = calcTimeJulianCent(jd - 0.5 + solNoonOffset / 1440.0);
  eqTime = calcEquationOfTime(newt);
  let solNoonLocal = 720 - longitude * 4 - eqTime + timezone * 60.0; // in minutes
  while (solNoonLocal < 0.0) {
    solNoonLocal += 1440.0;
  }
  while (solNoonLocal >= 1440.0) {
    solNoonLocal -= 1440.0;
  }

  return solNoonLocal;
}

/** Julian date at midnight of an ISO civil date. */
export function julianDate(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  return getJD(year!, month!, day!);
}
/** Apparent elevation and bearing clockwise from geographic north. */
export function sunPosition(date: string, hours: number, lat: number, lon: number, zone: number): { height: number; bearing: number } {
  const t = calcTimeJulianCent(julianDate(date) + (hours - zone) / 24);
  const at = calcAzEl(t, hours * 60, lat, lon, zone);
  return { height: at.elevation, bearing: at.azimuth };
}
/** Solar noon in local civil hours (the NOAA calculator's two iterations). */
export function solarNoon(date: string, lon: number, zone: number): number {
  return calcSolNoon(julianDate(date), lon, zone) / 60;
}
/** The direction toward the Sun, rotated to a horizontal scene north. */
export function sunVector(height: number, bearing: number, north: Vec3 = [0, 0, -1]): { x: number; y: number; z: number } {
  const h = degToRad(height),
    a = degToRad(bearing),
    c = Math.cos(h);
  return {
    x: (-north[2] * Math.sin(a) + north[0] * Math.cos(a)) * c,
    y: Math.sin(h),
    z: (north[0] * Math.sin(a) + north[2] * Math.cos(a)) * c,
  };
}
