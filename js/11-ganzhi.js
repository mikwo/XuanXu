/* ==========================================================================
   玄枢 · 四柱排盘   11-ganzhi.js   干支推演
   shiShen 十神、csPos 长生、kongOf 空亡
   依赖：前序已加载的模块（00-base, 02-changsheng）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 十神 / 长生 / 空亡 ================= */
function ke(a,b){return (a+2)%5===b;}
function shiShen(dg,tg){
  var a=Math.floor(dg/2), b=Math.floor(tg/2), same=(dg%2)===(tg%2);
  if(a===b) return same?"比肩":"劫财";
  if((a+1)%5===b) return same?"食神":"伤官";
  if((a+2)%5===b) return same?"偏财":"正财";
  if((a+3)%5===b) return same?"七杀":"正官";
  return same?"偏印":"正印";
}
function csPos(gIdx,zIdx){
  var st=CS_START[GAN[gIdx]];
  return (gIdx%2===0)?((zIdx-st+12)%12):((st-zIdx+12)%12);
}
function kongOf(gz){
  var xun=gz-(gz%10);
  return [ZHI[(xun+10)%12],ZHI[(xun+11)%12]];
}
