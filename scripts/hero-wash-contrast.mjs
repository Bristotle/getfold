const lin=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
const L=([r,g,b])=>0.2126*lin(r)+0.7152*lin(g)+0.0722*lin(b);
const over=([r,g,b],a,bg)=>[r,g,b].map((c,i)=>a*c+(1-a)*bg[i]);
const ratio=(f,b)=>{const x=L(f),y=L(b);const[h,l]=x>y?[x,y]:[y,x];return (h+0.05)/(l+0.05)};
const PAPER=[250,249,246], MUTED=[107,100,120], BLACK=[0,0,0];
console.log("  worst case: muted body text over the darkest part of the photo\n");
for (const a of [0.90,0.92,0.93,0.94,0.95,0.96]) {
  const r = ratio(MUTED, over(PAPER,a,BLACK));
  console.log(`  wash ${a}  ->  ${r.toFixed(2)}:1  ${r>=4.5?"PASS":"FAIL"}`);
}
