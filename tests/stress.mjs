/* 玄枢 · 四柱排盘 压力测试（2000 造）    用法：node tests/stress.mjs */
import { loadPage } from "./harness.mjs";

const { api, doc } = loadPage();
const tip = doc.querySelector("#tip");

const bad=[]; const ssAll={};
let N=2000;
for(let i=0;i<N;i++){
  const y=1900+Math.floor(Math.random()*201), m=1+Math.floor(Math.random()*12), d=1+Math.floor(Math.random()*28),
        hh=Math.floor(Math.random()*24), mi=Math.floor(Math.random()*60), sex=(i%2?"男":"女"), lon=73+Math.floor(Math.random()*63);
  let c;
  try{ c=api.compute({y,m,d,hh,mi,sex,lon}); }catch(e){ bad.push("compute "+e.message); continue; }
  api.setCur(c);
  try{ api.renderChart(c); api.renderWuxing(c); api.renderCores(c); api.renderAccChart(c);
       api.renderDayun(c); api.renderAccRead(c); api.selectDy(Math.floor(Math.random()*10)); }catch(e){ bad.push("render "+y+"-"+m+"-"+d+" "+e.message); continue; }
  const txt=["#grid","#cores","#dayun","#dyDetail","#liunian","#lnDetail","#accChart","#accRead"]
    .map(s=>{const e=doc.querySelector(s);return (e.innerHTML||"")+(e.textContent||"");}).join("");
  if(/undefined|NaN/.test(txt)) bad.push("坏字符 "+y+"-"+m+"-"+d);
  c.pillars.forEach(p=>p.ss.forEach(n=>{
    ssAll[n]=1;
    try{
      const w=api.weigh(c,n);
      if(w && w.f && JSON.stringify(w.f).match(/undefined|NaN/)) bad.push("weigh 坏字符 "+n);
      const el={getAttribute(k){return k==="data-tip"?n+"|注":null;},getBoundingClientRect(){return{left:10,top:10,width:20,height:10,right:30,bottom:20};}};
      api.showTip(el);
      if(/undefined|NaN/.test(tip.innerHTML||"")) bad.push("tip 坏字符 "+n);
    }catch(e){ bad.push("tip "+n+" "+e.message); }
  }));
}
console.log("样本 "+N+" 造 · 神煞 "+Object.keys(ssAll).length+" 种 · 问题 "+bad.length);
bad.slice(0,10).forEach(x=>console.log("  ✗ "+x));
