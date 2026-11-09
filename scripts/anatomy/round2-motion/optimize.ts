export function leastSquares(fn:(x:number[])=>number[],initial:number[],iterations=60){
 let x=[...initial],lambda=.001;
 const cost=(r:number[])=>r.reduce((a,v)=>a+v*v,0);
 for(let iteration=0;iteration<iterations;iteration++){
  const r=fn(x),J=x.map((v,j)=>{const q=[...x];q[j]!+=.01;const s=fn(q);return s.map((a,i)=>(a-r[i]!)/.01);});
  const a=J.map((col,i)=>J.map((c,j)=>col.reduce((s,v,k)=>s+v*c[k]!,0)+(i===j?lambda:0))),b=J.map(col=>-col.reduce((s,v,k)=>s+v*r[k]!,0));
  for(let k=0;k<x.length;k++){let pivot=k;for(let i=k+1;i<x.length;i++)if(Math.abs(a[i]![k]!)>Math.abs(a[pivot]![k]!))pivot=i;[a[k],a[pivot]]=[a[pivot]!,a[k]!];[b[k],b[pivot]]=[b[pivot]!,b[k]!];const d=a[k]![k]!;if(Math.abs(d)<1e-14)continue;for(let j=k;j<x.length;j++)a[k]![j]!/=d;b[k]!/=d;for(let i=0;i<x.length;i++){if(i===k)continue;const t=a[i]![k]!;for(let j=k;j<x.length;j++)a[i]![j]!-=t*a[k]![j]!;b[i]!-=t*b[k]!;}}
  const q=x.map((v,i)=>v+Math.max(-12,Math.min(12,b[i]!)));if(cost(fn(q))<cost(r)){x=q;lambda=Math.max(1e-10,lambda*.4);}else lambda*=4;
 }
 return {x,best:cost(fn(x))};
}
