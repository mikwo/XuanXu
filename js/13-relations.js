/* ==========================================================================
   玄枢 · 四柱排盘   13-relations.js   刑冲合害
   HE6/HAI6/PO6/CHONG/xingOf 与关系文案
   依赖：前序已加载的模块（00-base）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 关系 ================= */
var CHONG={"子":"午","丑":"未","寅":"申","卯":"酉","辰":"戌","巳":"亥","午":"子","未":"丑","申":"寅","酉":"卯","戌":"辰","亥":"巳"};
var HE6={"子":"丑","丑":"子","寅":"亥","卯":"戌","辰":"酉","巳":"申","午":"未","未":"午","申":"巳","酉":"辰","戌":"卯","亥":"寅"};
var HAI6={"子":"未","丑":"午","寅":"巳","卯":"辰","辰":"卯","巳":"寅","午":"丑","未":"子","申":"亥","酉":"戌","戌":"酉","亥":"申"};
var PO6={"子":"酉","酉":"子","丑":"辰","辰":"丑","寅":"亥","亥":"寅","卯":"午","午":"卯","巳":"申","申":"巳","未":"戌","戌":"未"};
function xingOf(a,b){
  if(a===b && "辰午酉亥".indexOf(a)>=0) return "自刑";
  var g1="子卯", g2="寅巳申", g3="丑戌未";
  if(a!==b && g1.indexOf(a)>=0 && g1.indexOf(b)>=0) return "相刑";
  if(a!==b && g2.indexOf(a)>=0 && g2.indexOf(b)>=0) return "相刑";
  if(a!==b && g3.indexOf(a)>=0 && g3.indexOf(b)>=0) return "相刑";
  return "";
}
function relTags(c,z){
  var out=[], seen={};
  var names=["年支","月支","日支","时支"];
  c.pillars.forEach(function(p,i){
    if(p.z===z){ var kk="临"+names[i]; if(!seen[kk]){seen[kk]=1;out.push([kk,""]);} return; }
    if(CHONG[p.z]===z){ var a="冲"+names[i]; if(!seen[a]){seen[a]=1;out.push([a,"b"]);} }
    if(HE6[p.z]===z){ var b="合"+names[i]; if(!seen[b]){seen[b]=1;out.push([b,"g"]);} }
    if(HAI6[p.z]===z){ var c2="害"+names[i]; if(!seen[c2]){seen[c2]=1;out.push([c2,"b"]);} }
    if(PO6[p.z]===z){ var d="破"+names[i]; if(!seen[d]){seen[d]=1;out.push([d,"b"]);} }
    var x=xingOf(p.z,z); if(x){ var e=x+names[i]; if(!seen[e]){seen[e]=1;out.push([e,"b"]);} }
  });
  return out;
}
function relText(c,z){
  var t=relTags(c,z);
  if(!t.length) return "与四柱无显冲合，属平顺之年。";
  var chong=t.filter(function(x){return x[0].indexOf("冲")===0;});
  var he=t.filter(function(x){return x[0].indexOf("合")===0;});
  var hai=t.filter(function(x){return x[0].indexOf("害")===0||x[0].indexOf("破")===0||x[0].indexOf("刑")===0;});
  var s=[];
  if(chong.length) s.push("逢"+chong.map(function(x){return x[0];}).join("、")+"，主变动、分离、搬迁、易起冲突");
  if(he.length) s.push("逢"+he.map(function(x){return x[0];}).join("、")+"，主牵连、合作、机会上门");
  if(hai.length) s.push("逢"+hai.map(function(x){return x[0];}).join("、")+"，主暗中磨损、积怨、撕破脸");
  return s.join("；")+"。";
}
