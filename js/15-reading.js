/* ==========================================================================
   玄枢 · 四柱排盘   15-reading.js   解读文本
   日主·事业·财·婚·健康·六亲·改运七段文本生成
   依赖：前序已加载的模块（12-compute, 07/08/09 数据）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 文本生成 ================= */
function shenStats(c){
  var s={};
  c.pillars.forEach(function(p,i){
    if(i!==2){ s[p.shen]=(s[p.shen]||0)+1.2; }
    p.cang.forEach(function(x,j){ s[x.shen]=(s[x.shen]||0)+(j===0?1:0.5); });
  });
  return s;
}
function topShen(c,n){
  var s=shenStats(c);
  var arr=Object.keys(s).map(function(k){return [k,s[k]];});
  arr.sort(function(a,b){return b[1]-a[1];});
  return arr.slice(0,n||2);
}
function personText(c){
  var dg=GAN[c.dayGan];
  var t=topShen(c,2);
  var out=[];
  out.push("<p><b>"+dg+"日主</b>　"+DM_DESC[dg]+"</p>");
  out.push("<p>取象为<b>"+DM_IMG[dg]+"</b>。此造"+(c.strength.level==="身弱"?"日主偏弱":"日主"+(c.strength.level==="身强"?"偏旺":"中和"))+
    "，扶抑分 "+c.strength.score+"，故一生功课在「"+(c.strength.level==="身弱"?"承接":"收敛")+"」——"+
    (c.strength.level==="身弱"?"机会来了要接得住，别贪多，别硬扛。":"力气够用，怕的是用力过猛、四面开战。")+"</p>");
  out.push("<p>盘中最重者为<b>"+t[0][0]+"</b>　"+SS_READ[t[0][0]]+"</p>");
  if(t[1]) out.push("<p>次重者为<b>"+t[1][0]+"</b>　"+SS_READ[t[1][0]]+"</p>");
  return out.join("");
}
function careerText(c){
  var t=topShen(c,3);
  var y=c.yong.name;
  var p=[];
  var second=t[1]?("，次重<b>"+t[1][0]+"</b>"):"";
  p.push("<p>以<b>"+t[0][0]+"</b>立身者，最忌把长板收起来去做短板的事。此造首重<b>"+t[0][0]+"</b>"+second+(t[2]?"、<b>"+t[2][0]+"</b>":"")+"。</p>");
  p.push("<p>用神在<b>"+y+"</b>，故<b>"+y+"</b>性行业对你更顺：<b>"+WX_JOB[y]+"</b>。</p>");
  p.push("<p>用神之意，是「把力气放在能沉淀的地方」。凡是做完了留不下东西、只留人情与情绪的活，长期都不划算。</p>");
  return p.join("");
}
function moneyText(c){
  var p=[];
  var s=shenStats(c);
  var caiScore=(s["正财"]||0)+(s["偏财"]||0);
  if(caiScore>=1.5) p.push("<p>财星不弱，进项来源清楚，能赚。关键在于守——赚得到与留得住是两件事。</p>");
  else if(caiScore>0.3) p.push("<p>财星偏弱而藏，属「专业生财」型：钱从手艺、资质、作品里来，不从资本运作里来。</p>");
  else p.push("<p>财星极弱。此造不宜以「钱生钱」为主业，宜以「技生钱」为主业——先有可定价的本事，再谈资产。</p>");
  if(c.hasShie) p.push("<p>日柱带<b>十恶大败</b>——真义是「禄入空亡、钱易漏失」，与道德无关。风险在<b>流动性端</b>：不是投错，是随手就花掉了。</p>");
  p.push("<p>策略重点应是<b>降低流动性</b>，不只是降低风险。应急金留足，底仓放在不能随手取的地方，投资用自动扣款、不看盘的方式做。</p>");
  return p.join("");
}
function loveText(c){
  var p=[];
  var male=c.sex==="男";
  var spouseStar=male?"财":"官";
  var dz=c.pillars[2].z;
  p.push("<p>"+(male?"男命以财为妻":"女命以官为夫")+"。此造日支<b>"+dz+"</b>为夫妻宫，藏"+c.pillars[2].cang.map(function(x){return x.g+"("+x.shen+")";}).join("、")+"。</p>");
  p.push("<p>夫妻宫坐<b>"+c.pillars[2].self+"</b>，日主在此为<b>"+c.pillars[2].star+"</b>。宫位有气，说明关系的「位置」是稳的，问题多出在时机与表达，不在有没有。</p>");
  var ss=c.pillars[2].ss;
  if(ss.indexOf("孤辰")>=0) p.push("<p>日支带<b>孤辰</b>：孤独感是自己放大的。受挫时第一反应是关门，而对方读到的是「你不需要我」。</p>");
  if(ss.indexOf("羊刃")>=0) p.push("<p>日支带<b>羊刃</b>：硬气长在夫妻宫上。争执时不肯先软，赢了道理，输掉关系。</p>");
  p.push("<p>结论：婚缘偏晚不是坏事。太早定的关系，多半是拿情绪当判断。</p>");
  return p.join("");
}
function healthText(c){
  var arr=WX.map(function(w){return [w,c.score[w]];});
  arr.sort(function(a,b){return b[1]-a[1];});
  var strong=arr[0][0], weak=arr[4][0];
  var p=[];
  p.push("<p>最旺为<b>"+strong+"</b>（"+c.pct[strong]+"%），过旺则亢，易在<b>"+WX_ZANG[strong]+"</b>上出问题。</p>");
  p.push("<p>最弱为<b>"+weak+"</b>（"+c.pct[weak]+"%），偏枯则虚，<b>"+WX_ZANG[weak]+"</b>为先天短板。</p>");
  if(strong==="木") p.push("<p>木旺克土，<b>脾胃</b>最先受影响：饮食不规律、思虑过度，都会直接落到消化上。</p>");
  if(c.dayWx==="水") p.push("<p>水日主最忌熬夜。子时（23–1点）是水气归根之时，长期占用，等于天天从本金里取钱。</p>");
  p.push("<p>调养顺序：先睡，再动，最后才是吃。反过来做，多半无效。</p>");
  return p.join("");
}
function familyText(c){
  var p=[];
  var hour=c.pillars[3];
  p.push("<p>年柱主祖上与少年，月柱主父母兄弟，日柱主自身与配偶，时柱主子女与晚年。</p>");
  p.push("<p>时柱<b>"+hour.g+hour.z+"</b>带"+ (hour.ss.length?hour.ss.join("、"):"无明显神煞") +"。时柱为晚景之位，此处清吉，主晚运可期。</p>");
  p.push("<p>月柱为父母宫，"+ (c.pillars[1].ss.length?("带<b>"+c.pillars[1].ss.join("、")+"</b>，"):"") +"与长辈的相处，宜多主动、少期待对方先开口。</p>");
  return p.join("");
}
function adviceText(c){
  var y=c.yong, p=[];
  p.push('<div class="kv"><span class="k">用神</span><span class="v">'+y.name+"　"+WX_NATURE[y.name]+"。这是你最该补、最该靠近的一行。</span></div>");
  p.push('<div class="kv"><span class="k">喜神</span><span class="v">'+y.xi.name+"　可扶身、可通关，越多越好。</span></div>");
  p.push('<div class="kv"><span class="k">忌神</span><span class="v">'+y.ji.join("、")+"　不是不能碰，是别当主线。</span></div>");
  if(c.tiaohou && c.tiaohou.primary) p.push('<div class="kv"><span class="k">调候</span><span class="v">'+c.tiaohou.g+'日'+c.tiaohou.month+'月（'+c.tiaohou.climate+'），《穷通宝鉴》取 <b>'+c.tiaohou.primary+'</b>'+(c.tiaohou.second.length?'、次 '+c.tiaohou.second.join('、'):'')+'。调候看气候，扶抑看强弱，两者并行。</span></div>');
  p.push("<p style='margin-top:12px'>落到日常，补"+y.name+"最有效的三件事：颜色（衣物、物件）、方位（起居、办公朝向）、作息（该睡的时候睡）。饰品排在后面，它只是提醒，不是药。</p>");
  p.push("<p>命理能改的只有「习性」这一层。格局改不了，习惯改得了；习惯改久了，走势就跟着变。</p>");
  return p.join("");
}
