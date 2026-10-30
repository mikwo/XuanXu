/* ==========================================================================
   玄枢 · 四柱排盘   25-app.js   起盘
   cast() 组装与表单监听
   依赖：前序已加载的模块（全部）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 起盘 ================= */
function cast(){
  var sy=$("#optYr");
  OPTS.yangRen = (sy && sy.value.indexOf("子平")>=0) ? "子平" : "通会";
  var dv=$("#date").value, tv=$("#time").value||"12:00";
  if(!dv){ document.body.classList.remove("casted"); return; }
  var p=dv.split("-").map(Number), t=tv.split(":").map(Number);
  var loEl=$("#lon"), lo=loEl?parseFloat(loEl.value):120;
  if(!isFinite(lo)||lo<-180||lo>180) lo=120;
  var c=compute({y:p[0],m:p[1],d:p[2],hh:t[0],mi:t[1]||0,sex:curSex,lon:lo});
  cur=c;
  document.body.classList.add("casted");

  var fl=$("#flash"); fl.classList.remove("go"); void fl.offsetWidth; fl.classList.add("go");

  var tt=c.ts;
  var pad=function(n){ return (n<10?"0":"")+n; };
  var tstxt = tt.off===0 ? "真太阳时同北京时间（120°E，均时差"+tt.eot+"分）"
            : "真太阳时 "+pad(tt.hh)+":"+pad(tt.mi)+"（"+tt.lon+"°E，经度时差"+(Math.round((tt.lon-120)*4))+"分，均时差"+tt.eot+"分）";
  var wbox=$("#warn");
  if(wbox){
    var wn=(c.jieWarn?"【换节临界】"+c.jieWarn:"")+(c.dayWarn?"【子初临界】"+c.dayWarn:"");
    wbox.innerHTML = wn ? '<div class="warn">'+wn+'</div>' : "";
  }
  $("#meta").textContent = p[0]+"年"+p[1]+"月"+p[2]+"日 "+tv+" · "+(curSex==="男"?"乾造":"坤造")+" · "+tstxt+" · 年命"+c.pillars[0].nayin+"（"+c.pillars[0].nayin.slice(-1)+"命） · 虚岁"+(new Date().getFullYear()-p[0]+1);

  renderChart(c);
  renderWuxing(c);
  renderCores(c);
  renderAccChart(c);
  renderDayun(c);
  renderAccRead(c);

  var nowY=new Date().getFullYear();
  var idx=0;
  c.dayun.forEach(function(d,i){ if(nowY>=d.yr && nowY<d.yr+10) idx=i; });
  selectDy(idx);
}

$("#castBtn").addEventListener("click",cast);
var yrSel=$("#optYr"); if(yrSel) yrSel.addEventListener("change",cast);
var lonEl=$("#lon"); if(lonEl) lonEl.addEventListener("change",cast);

/* ---- 不预填出生数据：日期与时刻留空，等用户自己填 ---- */
(function(){
  curSex="男";
  document.querySelectorAll(".sex button").forEach(function(b){
    b.setAttribute("aria-pressed", b.dataset.sex==="男"?"true":"false");
  });
})();
