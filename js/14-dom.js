/* ==========================================================================
   玄枢 · 四柱排盘   14-dom.js   DOM 工具
   el/tg/tt/accItem/settleAccs/vd
   依赖：前序已加载的模块（无）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 输出工具 ================= */
function $(s,r){return (r||document).querySelector(s);}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function tg(name,cls){
  var d=SS_ZH_DESC[name]||"";
  return '<span class="tg '+(cls||(SS_GOOD[name]?"g":SS_BAD[name]?"b":""))+' t" data-tip="'+name+'|'+d+'">'+name+'</span>';
}
function tt(txt,title){
  return '<span class="t" data-tip="'+title+'|'+txt+'">';
}
function accItem(n,title,html,open){
  return '<div class="acc'+(open?" open":"")+'">'+
    '<button class="acc-h" type="button"><span class="n">'+n+'</span><span>'+title+'</span><i class="chev"></i></button>'+
    '<div class="acc-b"><div class="acc-i">'+html+'</div></div></div>';
}
function settleAccs(root){
  (root||document).querySelectorAll(".acc.open > .acc-b").forEach(function(b){
    b.style.maxHeight=b.scrollHeight+"px";
  });
}
function vd(s){
  if(s>=3) return ["大顺","good"];
  if(s>=1.2) return ["顺","good"];
  if(s>-1.2) return ["平","mid"];
  if(s>=-2.6) return ["滞","bad"];
  return ["逆","bad"];
}
