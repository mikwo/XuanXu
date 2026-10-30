/* ==========================================================================
   玄枢 · 四柱排盘   24-tip.js   浮窗
   tipEl/placeTip/pinPos + showTip/hideTip + 事件代理
   依赖：前序已加载的模块（22-sources, 23-weigh）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

var tipEl=$("#tip"), tipOn=false, mx=0, my=0, tipPin=null, tipFix=null;
function placeTip(){
  if(!tipOn) return;
  var w=tipEl.offsetWidth, h=tipEl.offsetHeight, x, y;
  if(tipFix){ x=tipFix.x; y=tipFix.y; }
  else{
    x=mx+16; y=my+18;
    if(x+w>window.innerWidth-12) x=mx-w-16;
    if(y+h>window.innerHeight-12) y=my-h-14;
    if(x<12) x=12;
    if(y<12) y=12;
  }
  tipEl.style.left=x+"px"; tipEl.style.top=y+"px";
}
function pinPos(el){
  var r=el.getBoundingClientRect(), w=tipEl.offsetWidth, h=tipEl.offsetHeight, x, y;
  x=r.right+14;
  if(x+w>window.innerWidth-12) x=r.left-w-14;
  if(x<12) x=12;
  y=r.top-4;
  if(y+h>window.innerHeight-14) y=window.innerHeight-14-h;
  if(y<12) y=12;
  return {x:x,y:y};
}

function showTip(t, pin){
  var raw=t.getAttribute("data-tip")||"";
  var p=raw.split("|"), name=p[0]||"", body=p[1]||"";
  var src=SRC(name);
  var h='<div class="tiphd"><b>'+name+'</b><button class="tipx" type="button" aria-label="关闭">×</button></div><div class="tipbody">';
  var cq="", cn="", cw="";
  if(src && src.s){
    [].concat(src.s).forEach(function(x){
      if(/^(定名|定局)/.test(x)) cq+=(cq?"／":"")+x.replace(/^(定名|定局)/,"");
      else if(/^(位义见|位序见)/.test(x)) cq+=(cq?"／":"")+x;
      else if(/^(断义同篇|断义|理据同篇|理据|取象)/.test(x)) cn+=(cn?"／":"")+x.replace(/^(断义同篇|断义|理据同篇|理据|取象)/,"");
      else if(/^按语/.test(x)) cw+=(cw?"；":"")+x.replace(/^按语[:：]?/,"");
      else cq+=(cq?"／":"")+x;
    });
  }
  if(src && src.q) h+='<div class="tr q"><em>原文</em><span>'+src.q+(src.k?'<span class="kn">'+src.k+"</span>":"")+(cq?'<i class="ci">——'+cq+"</i>":"")+"</span></div>";
  if(src && src.w) h+='<div class="tr w"><em>推演</em><span><b class="lag">本页推理</b>'+src.w+(cw?'<span class="cn">（'+cw+"）</span>":"")+'<span class="basis">依据：'+basisOf(src)+"</span></span></div>";
  if(src && src.hd) h+='<div class="tr hd"><em>古断</em><span>'+src.hd.t+'<i class="ci">——'+"《"+src.hd.s+"》"+'</i></span></div>';
  if(body){
    var nb=src&&(src.nb||cn);
    h+='<div class="tr n"><em>注解</em><span>'+body;
    if(nb) h+='<i class="ci">——'+[].concat(nb).join("／")+"</i>";
    else h+='<i class="ns">无古籍明文 · 本页推演</i>';
    h+="</span></div>";
  }
  /* 权衡是「这句在当前这一造上成不成立」，属命盘判断，不是词义。
     词解页只讲名相，故此处不出权衡，只留一句指路。 */
  var inDict = !!(t && t.closest && t.closest("#accDict"));
  var wg=weigh(cur,name);
  if(wg && inDict){
    h+='<div class="src nw">此句在具体一造上成立与否，见命盘或运势里这颗星——那里逐条列前提。</div>';
    wg=null;
  }
  if(wg){
    h+='<details class="wgt"><summary>权衡 · 加 '+wg.up+' 减 '+wg.dn+'（逐条前提，点开看）</summary>';
    wg.f.forEach(function(x){ h+='<div class="src"><b>'+x[0]+'</b>'+x[1]+'<i class="ci">'+x[2]+"</i></div>"; });
    h+='<div class="src lv"><b>结论</b>'+wg.lv+"｜"+wg.c+"</div></details>";
  }
  if(src && src.u) h+='<div class="src"><b>统系</b>'+src.u+"</div>";
  h+='<div class="src">原文外者皆本页推理；凡标「本页」处无古书原文</div>';
  h+='</div><div class="pinhint">内容较长 · 点该词条即可固定滚动 · Esc 关闭</div>';
  tipEl.innerHTML=h;
  tipOn=true;
  tipEl.classList.toggle("pin", !!pin);
  tipPin = pin ? t : null;
  tipFix = pin ? pinPos(t) : null;
  tipEl.classList.add("on");
  placeTip();
}
function hideTip(){
  tipOn=false; tipPin=null; tipFix=null;
  tipEl.classList.remove("on");
  tipEl.classList.remove("pin");
}

/* ---- 事件代理 ---- */
document.addEventListener("click",function(e){
  if(e.target.closest(".tipx")){ hideTip(); return; }
  if(e.target.closest("#tip")) return;
  var tp=e.target.closest("[data-tip]");
  if(tp){ if(tipPin===tp && tipOn){ hideTip(); } else { showTip(tp,true); } return; }
  if(tipOn) hideTip();
  var tab=e.target.closest(".tab"); if(tab){ setView(tab.dataset.v); return; }
  var h=e.target.closest(".acc-h"); if(h){ toggleAcc(h); return; }
  var dy=e.target.closest(".dy-item"); if(dy){ selectDy(+dy.dataset.i); return; }
  var ln=e.target.closest(".ln-item");
  if(ln){ var i=curDy, j=+ln.dataset.j;
    document.querySelectorAll(".ln-item").forEach(function(x){ x.classList.toggle("act", +x.dataset.j===j); });
    renderLnDetail(cur,i,j); return;
  }
});
document.addEventListener("mouseover",function(e){
  if(tipPin) return;
  var t=e.target.closest("[data-tip]");
  if(t) showTip(t,false);
});
document.addEventListener("mouseout",function(e){
  if(tipPin) return;
  var t=e.target.closest("[data-tip]");
  if(t) hideTip();
});
document.addEventListener("mousemove",function(e){
  mx=e.clientX; my=e.clientY;
  if(tipOn && !tipFix) placeTip();
});
document.addEventListener("keydown",function(e){
  if((e.key==="Escape"||e.keyCode===27) && tipOn) hideTip();
});
window.addEventListener("resize",function(){
  moveInk();
  document.querySelectorAll(".acc.open > .acc-b").forEach(function(b){ b.style.maxHeight=b.scrollHeight+"px"; });
});

/* ---- 性别切换 ---- */
document.querySelectorAll(".sex button").forEach(function(b){
  b.addEventListener("click",function(){
    document.querySelectorAll(".sex button").forEach(function(x){ x.setAttribute("aria-pressed","false"); });
    b.setAttribute("aria-pressed","true");
    curSex=b.dataset.sex;
  });
});
