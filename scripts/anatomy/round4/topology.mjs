/** Meshopt may rotate (a,b,c) to (b,c,a); orientation and triangle order stay identical. */
export function canonicalTriangles(array){const out=new array.constructor(array.length);for(let i=0;i<array.length;i+=3){const f=Array.from(array.subarray(i,i+3)),k=f.indexOf(Math.min(...f));for(let j=0;j<3;j++)out[i+j]=f[(k+j)%3];}return out;}
