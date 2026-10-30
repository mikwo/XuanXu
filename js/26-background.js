/* ==========================================================================
   玄枢 · 四柱排盘   26-background.js   背景
   罗盘 SVG、星空 canvas、鼠标光晕
   依赖：前序已加载的模块（无）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ---- 背景 ---- */
(function(){
  var svgT=$("#ticks"), NS="http://www.w3.org/2000/svg";
  if(svgT){
    for(var i=0;i<120;i++){
      var a=i/120*Math.PI*2, major=(i%10===0);
      var r1=major?322:334, r2=348;
      var ln=document.createElementNS(NS,"line");
      ln.setAttribute("x1",400+Math.cos(a)*r1); ln.setAttribute("y1",400+Math.sin(a)*r1);
      ln.setAttribute("x2",400+Math.cos(a)*r2); ln.setAttribute("y2",400+Math.sin(a)*r2);
      ln.setAttribute("class",major?"tick tick-major":"tick");
      svgT.appendChild(ln);
    }
  }
  var zr=$("#zhiRing");
  if(zr){
    for(var j=0;j<12;j++){
      var ang=(j/12)*360-90, r=ang*Math.PI/180;
      var txt=document.createElementNS(NS,"text");
      txt.setAttribute("x",400+Math.cos(r)*264);
      txt.setAttribute("y",400+Math.sin(r)*264);
      txt.setAttribute("class","zhi");
      txt.textContent=ZHI[j];
      zr.appendChild(txt);
    }
  }
})();

/* ---- 星空 ---- */
(function(){
  var cv=$("#stars"); if(!cv) return;
  var ctx=cv.getContext("2d"), stars=[];
  function resize(){
    var dpr=window.devicePixelRatio||1;
    cv.width=window.innerWidth*dpr; cv.height=window.innerHeight*dpr;
    cv.style.width=window.innerWidth+"px"; cv.style.height=window.innerHeight+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars=[];
    var n=Math.min(180,Math.floor(window.innerWidth*window.innerHeight/9800));
    for(var i=0;i<n;i++){
      stars.push({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,
        r:Math.random()*1.1+.25,a:Math.random()*.5+.12,
        p:Math.random()*Math.PI*2,s:Math.random()*.014+.004});
    }
  }
  var last=0;
  function loop(t){
    if(t-last>42){
      last=t;
      ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
      for(var i=0;i<stars.length;i++){
        var s=stars[i]; s.p+=s.s;
        var al=s.a*(0.55+0.45*Math.sin(s.p));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,6.2832);
        ctx.fillStyle="rgba(232,222,196,"+al.toFixed(3)+")"; ctx.fill();
      }
    }
    requestAnimationFrame(loop);
  }
  resize(); window.addEventListener("resize",resize); requestAnimationFrame(loop);
})();

/* ---- 光晕 ---- */
(function(){
  var aura=$("#aura"); if(!aura) return;
  var raf=null, tx=0, ty=0;
  document.addEventListener("mousemove",function(e){
    tx=e.clientX; ty=e.clientY;
    if(raf) return;
    raf=requestAnimationFrame(function(){
      aura.style.opacity="1";
      aura.style.transform="translate("+tx+"px,"+ty+"px) translate(-50%,-50%)";
      raf=null;
    });
  });
  document.addEventListener("mouseleave",function(){ aura.style.opacity="0"; });
})();
