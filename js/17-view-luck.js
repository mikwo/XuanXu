/* ==========================================================================
   玄枢 · 四柱排盘   17-view-luck.js   视图·运势
   大运轨道、流年网格、两级详情
   依赖：前序已加载的模块（14-dom）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

function renderDayun(c){
  var box=$("#dayun");
  var H="";
  c.dayun.forEach(function(d,i){
    var v=vd(d.sc);
    H+='<div class="dy-item" data-i="'+i+'"><div class="gz">'+d.g+d.z+'</div>'+
      '<div class="age">'+d.age+'岁</div><div class="vd '+v[1]+'">'+v[0]+'</div></div>';
  });
  box.innerHTML=H;
}

function whyLine(why,sc){
  if(!why || !why.length) return '<div class="note" style="margin:6px 0 0;font-size:11.5px">打分 '+sc+'：干支五行皆不在调候与扶抑的取用之内，按平论。</div>';
  return '<div class="note" style="margin:6px 0 0;font-size:11.5px">打分 '+sc+' 的依据：'+why.join("　")+'</div>';
}
function renderDyDetail(c,i){
  var d=c.dayun[i];
  var v=vd(d.sc);
  var tags=relTags(c,d.z).map(function(x){return '<span class="tg '+x[1]+'">'+x[0]+'</span>';}).join("");
  var zh=GAN_WX[d.gi], zw=ZHI_WX[d.zi];
  var box=$("#dyDetail");
  box.innerHTML='<div class="detail"><h3>第 '+(i+1)+' 运 · '+d.g+d.z+'</h3>'+
    '<div class="sub">'+d.age+'–'+(d.age+9)+'岁 · '+d.yr+'–'+(d.yr+9)+' · '+d.shen+'</div>'+
    '<div class="row">'+
      '<span class="tg">干'+d.g+'（'+zh+'）</span><span class="tg">支'+d.z+'（'+zw+'）</span>'+
      '<span class="tg '+(v[1]==="good"?"g":v[1]==="bad"?"b":"")+'">'+v[0]+'　'+d.sc+'</span>'+tags+
    '</div>'+
    '<p>'+(d.sc>=2?"此运干支并助用神，是难得的发力期——机会会主动来，但接不接得住看你这十年怎么准备。":
        d.sc>=0.8?"此运偏向有利，宜进不宜退。把力气放在长期能留下东西的事上。":
        d.sc>-1.2?"此运平顺，无大助亦无大伤。适合打基础、补资质、稳节奏。":
        d.sc>=-2.6?"此运耗多于助，宜守。不是不能做事，是不宜重仓、不宜担保、不宜硬碰。":
        "此运干支皆为忌神，压力集中。此期最好的策略是「不折腾」：保底、保健康、保关系。")+'</p>'+
    whyLine(d.scWhy,d.sc)+
    (d.liunian.some(function(l){return l.year===new Date().getFullYear();})?'<p style="color:var(--gold3)">当前所处之运。</p>':'')+
    '</div>';
}

function renderLiunian(c,i){
  var box=$("#liunian");
  var d=c.dayun[i];
  var nowY=new Date().getFullYear();
  var H="";
  d.liunian.forEach(function(l,j){
    H+='<div class="ln-item'+(l.year===nowY?" now":"")+'" data-j="'+j+'">'+
      '<div class="y">'+l.year+'</div><div class="g">'+l.g+l.z+'</div>'+
      '<div class="s">'+l.shen+'</div></div>';
  });
  box.innerHTML=H;
}

function renderLnDetail(c,i,j){
  var d=c.dayun[i], l=d.liunian[j];
  var v=vd(l.sc);
  var tags=relTags(c,l.z).map(function(x){return '<span class="tg '+x[1]+'">'+x[0]+'</span>';}).join("");
  var box=$("#lnDetail");
  box.innerHTML='<div class="detail"><h3>'+l.year+' · '+l.g+l.z+'</h3>'+
    '<div class="sub">流年十神：'+l.shen+'　·　在「'+d.g+d.z+'」运中</div>'+
    '<div class="row"><span class="tg '+(v[1]==="good"?"g":v[1]==="bad"?"b":"")+'">'+v[0]+'　'+l.sc+'</span>'+tags+'</div>'+
    '<p><b>'+l.shen+'</b>　'+SS_READ[l.shen]+'</p>'+
    '<p>'+(relText(c,l.z))+'</p>'+
    '<p>'+(l.sc>=2?"今年气势在你这边，宜主动出击、宜定事。":
        l.sc>=0.8?"今年偏顺，可推进重要事项，但仍需守住底线。":
        l.sc>-1.2?"今年平淡，适合蓄力、补短板，不宜大动。":
        l.sc>=-2.6?"今年耗气，宜守。少做重大决定，别在情绪高点签字。":
        "今年压力集中，宜静。保健康、保现金流、保关系，别硬撑。")+'</p>'+
    whyLine(l.scWhy,l.sc)+
    '</div>';
}
