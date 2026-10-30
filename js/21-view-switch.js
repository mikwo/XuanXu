/* ==========================================================================
   玄枢 · 四柱排盘   21-view-switch.js   视图切换
   setView、toggleAcc、selectDy
   依赖：前序已加载的模块（16~19）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 视图与交互 ================= */
function moveInk(){
  var act=$(".tab.on"); if(!act) return;
  var ink=$("#ink"); if(!ink) return;
  ink.style.left=act.offsetLeft+"px";
  ink.style.width=act.offsetWidth+"px";
}
function setView(v){
  document.querySelectorAll(".view").forEach(function(s){ s.classList.toggle("on", s.dataset.view===v); });
  document.querySelectorAll(".tab").forEach(function(b){ b.classList.toggle("on", b.dataset.v===v); });
  moveInk();
  if(window.scrollTo) window.scrollTo({top:0,behavior:"smooth"});
}
function toggleAcc(h){
  var acc=h.parentElement, body=h.nextElementSibling;
  var open=acc.classList.toggle("open");
  body.style.maxHeight = open ? (body.scrollHeight+"px") : "0px";
}
function selectDy(i){
  curDy=i;
  document.querySelectorAll(".dy-item").forEach(function(x){ x.classList.toggle("act", +x.dataset.i===i); });
  renderDyDetail(cur,i);
  renderLiunian(cur,i);
  renderLnDetail(cur,i,0);
  document.querySelectorAll(".ln-item").forEach(function(x){ x.classList.toggle("act", +x.dataset.j===0); });
}

/* ---- 提示框 ---- */
