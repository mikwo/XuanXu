/* ==========================================================================
   玄枢 · 四柱排盘   16-view-chart.js   视图·命盘
   四柱表、五行条、摘要卡、五个折叠
   依赖：前序已加载的模块（14-dom, 15-reading）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 渲染 ================= */
var cur=null, curDy=0, curLn=null, curSex="男";

function renderChart(c){
  var box=$("#grid");
  var H='<div class="lbl hd">四柱</div>';
  ["年柱","月柱","日柱","时柱"].forEach(function(n){ H+='<div class="hd">'+n+'</div>'; });
  H+='<div class="lbl">主星</div>';
  c.pillars.forEach(function(p,i){
    var shenTip = (i===2) ? (DM_DESC[c.pillars[2].g]||"") : (SS_DESC[p.shen]||"十神之一。");
    H+='<div><span class="t sm" data-tip="'+p.shen+'|'+shenTip+'">'+p.shen+'</span></div>';
  });
  H+='<div class="lbl">天干</div>';
  c.pillars.forEach(function(p,i){
    H+='<div><span class="gz"><span class="ch" style="color:'+WX_COLOR[GAN_WX[p.gi]]+';animation-delay:'+(i*0.11).toFixed(2)+'s">'+p.g+'</span></span></div>';
  });
  H+='<div class="lbl">地支</div>';
  c.pillars.forEach(function(p,i){
    H+='<div><span class="gz"><span class="ch" style="color:'+WX_COLOR[ZHI_WX[p.zi]]+';animation-delay:'+(0.06+i*0.11).toFixed(2)+'s">'+p.z+'</span></span></div>';
  });
  H+='<div class="lbl">藏干</div>';
  c.pillars.forEach(function(p){
    H+='<div><div class="cang">';
    p.cang.forEach(function(x){
      H+='<div class="c"><span class="t" data-tip="'+x.shen+'|'+SS_DESC[x.shen]+'" style="color:'+WX_COLOR[GAN_WX[GAN.indexOf(x.g)]]+'">'+x.g+'</span><em>'+x.shen+'</em></div>';
    });
    H+='</div></div>';
  });
  H+='<div class="lbl">星运</div>';
  c.pillars.forEach(function(p){
    H+='<div><span class="t sm" data-tip="'+p.star+'|'+CS_DESC[p.star]+'">'+p.star+'</span></div>';
  });
  H+='<div class="lbl">自坐</div>';
  c.pillars.forEach(function(p){
    H+='<div><span class="t sm" data-tip="'+p.self+'|'+CS_DESC[p.self]+'">'+p.self+'</span></div>';
  });
  H+='<div class="lbl">空亡</div>';
  c.pillars.forEach(function(p){
    H+='<div class="t sm" data-tip="空亡|旬中所缺之两支。落于何柱，何柱之事易落空、易延宕；落于日柱，多主心性上的「不被接住」。">'+p.kong+'</div>';
  });
  H+='<div class="lbl">纳音</div>';
  c.pillars.forEach(function(p){
    H+='<div class="t sm" data-tip="'+p.nayin+'|纳音是古法另一套五行，多用于看气韵与象，不作主断。">'+p.nayin+'</div>';
  });
  H+='<div class="lbl">神煞</div>';
  c.pillars.forEach(function(p){
    H+='<div class="tags rl">';
    if(!p.ss.length) H+='<span class="tg">—</span>';
    else p.ss.forEach(function(n){ H+=tg(n); });
    H+='</div>';
  });
  box.innerHTML=H;
}

function renderWuxing(c){
  var box=$("#wuxing");
  var H="";
  WX.forEach(function(w){
    H+='<div class="wx"><div class="t name" data-tip="'+w+'|'+WX_NATURE[w]+"。藏象："+WX_ZANG[w]+'。" style="color:'+WX_COLOR[w]+'">'+w+'</div>'+
      '<div class="cnt">'+c.cnt[w]+' 见</div>'+
      '<div class="bar"><i style="background:'+WX_COLOR[w]+'"></i></div>'+
      '<div class="pct">'+c.pct[w]+'%</div></div>';
  });
  box.innerHTML=H;
  var bars=box.querySelectorAll(".bar i");
  setTimeout(function(){
    for(var i=0;i<bars.length;i++) bars[i].style.width=c.pct[WX[i]]+"%";
  },80);
}

function renderCores(c){
  var box=$("#cores");
  var t=topShen(c,1)[0];
  box.innerHTML=
    '<div class="card"><div class="k">日主</div><div class="v">'+GAN[c.dayGan]+' '+c.dayWx+'</div>'+
      '<div class="d">'+c.strength.level+'（扶抑分 '+c.strength.score+'）<br>最重十神：'+t[0]+'</div></div>'+
    '<div class="card"><div class="k">格局</div><div class="v">'+c.geju.name+'</div>'+
      '<div class="d">月令'+c.geju.zhi+'，本气'+c.geju.benqi+'为'+c.geju.shen+'<br>以月令取格</div></div>'+
    '<div class="card"><div class="k">用神</div><div class="v">'+c.yong.name+'</div>'+
      '<div class="d">扶抑：喜'+c.yong.xi.name+'，忌'+c.yong.ji.join('·')+'<br>'+
      '调候：'+c.tiaohou.primary+(c.tiaohou.second.length?'、'+c.tiaohou.second.join(''):'')+'（'+c.tiaohou.month+'月）</div></div>';
}

function renderAccChart(c){
  var box=$("#accChart");
  var sp=c.strength.parts.map(function(x){
    return '<div class="kv"><span class="k">'+x.k+'</span><span class="v">'+x.v+'</span></div>';
  }).join("");
  var s1=accItem("壹","日主强弱凭什么",sp+
    '<div class="note">得令（月令生扶）、得地（地支根气）、得势（天干比印多寡）三事；分值是本页的秤，不是古法。</div>',true);

  var s2=accItem("贰","格局怎么定",
    '<p>月令为提纲，月支本气所透之物即为格。此造月支<b>'+c.geju.zhi+'</b>，本气<b>'+c.geju.benqi+'</b>，对日主为<b>'+c.geju.shen+'</b>，故取<b>'+c.geju.name+'</b>。</p>'+
    '<p>格局定主旋律，不下吉凶；走向看格局与用神配不配。</p>'+
    '<div class="note">若本气不透而杂气透干，古法另取；此处从简，取本气。</div>',false);

  var s3=accItem("叁","用神喜忌",
    '<p>日主'+c.strength.level+'，故取<b>'+c.yong.name+'</b>为用神——'+(c.strength.level==="身弱"?"生我扶我，先把根扎稳":"泄我克我，让力气有去处")+'。</p>'+
    '<div class="kv"><span class="k">用神</span><span class="v">'+c.yong.name+'　'+WX_NATURE[c.yong.name]+'</span></div>'+
    '<div class="kv"><span class="k">喜神</span><span class="v">'+c.yong.xi.name+'</span></div>'+
    '<div class="kv"><span class="k">忌神</span><span class="v">'+c.yong.ji.join("、")+'</span></div>'+
    '<div class="note">用神不是「缺什么补什么」，是「什么能让这个盘转起来」。</div>',false);

  var allSS=[];
  c.pillars.forEach(function(p,i){
    p.ss.forEach(function(n){ if(allSS.indexOf(n)<0) allSS.push(n); });
  });
  var s4=accItem("肆","神煞与藏干",
    '<p>本盘神煞共 <b>'+allSS.length+'</b> 类：</p><div class="row" style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px">'+
    (allSS.length?allSS.map(function(n){return tg(n);}).join(""):'<span class="tg">无</span>')+'</div>'+
    '<div class="note">神煞是注释，不是结论：同一个四柱换个软件能差十几个，格局用神不会变。轻重：格局 &gt; 用神 &gt; 合冲 &gt; 神煞。</div>',false);

  var th=c.tiaohou;
  var same=(th.primaryWx===c.yong.name)?"调候首选与扶抑用神同属一行——两法在这一步上不争，可以放心用":"调候取"+th.primaryWx+"、扶抑取"+c.yong.name+"，两法不同行";
  var s5=
    accItem("伍","两法取用：调候与扶抑",
    '<div class="kv"><span class="k">扶抑（本页模型）</span><span class="v">用神 '+c.yong.name+'　喜 '+c.yong.xi.name+'　忌 '+c.yong.ji.join("、")+'</span></div>'+
    '<div class="kv"><span class="k">调候（《穷通宝鉴》）</span><span class="v">'+th.g+'日'+th.month+'月（'+th.climate+'）→ '+th.primary+
      (th.second.length?'　次 '+th.second.join("、"):"")+'</span></div>'+
    '<p><b>本盘：'+same+'。</b>'+(th.conflict?'<br>'+th.conflict+'。':'')+
      (th.subConflict && th.subConflict.length && !th.conflict ? '<br>调候次选中的'+th.subConflict.join("、")+'与扶抑忌神同行——次选备而未用；若用，先扶住身。' : '')+'</p>'+
    '<div class="note">两法相左时：月令极寒极燥者先调候，气候平和者以扶抑为主。本页打分时调候首选压过扶抑用神。</div>'+
    '<p><b>扶抑的原文</b>（《滴天髓輯要·體用論》《衰旺論》）：</p>'+
    '<div class="note" style="border-left:2px solid rgba(212,175,55,.45);padding-left:10px;margin:-2px 0 8px">「'+DTS_TIYONG.q+'」<br><span style="opacity:.7">——'+DTS_TIYONG.s+'</span><br>'+
      '「'+DTS_SHUAI.q+'」<br>注：「'+DTS_SHUAI.z+'」<br><span style="opacity:.7">——'+DTS_SHUAI.s+'</span></div>'+
    '<div class="note">原文给方向（旺宜泄伤、衰喜帮助；旺极不可损、衰极不可益），不给分值——得令 1.2、得地 0.55、得势 0.45 是本页自设的秤。</div>'+
    '<p><b>调候的原文</b>（《滴天髓輯要·寒暖論》）：</p>'+
    '<div class="note" style="border-left:2px solid rgba(212,175,55,.45);padding-left:10px;margin:-2px 0 8px">「'+DTS_HAN.q+'」<br>注：「'+DTS_HAN.z+'」<br><span style="opacity:.7">——'+DTS_HAN.s+'　（底本繁体，照录）</span></div>'+
    '<p><b>本月《穷通宝鉴》原文</b>（'+th.g+'日'+th.month+'月）：</p>'+
    (function(){ var mn=th.textMonth||0; var k=th.textKind||1;
        var ms=(th.textMonths&&th.textMonths.length?th.textMonths:[mn]).map(function(x){return MM_CN[x]||x;});
        var lab,src;
        if(k===2){ lab='原书此篇合论 '+ms.join('、')+'月'; src='——《穷通宝鉴·'+th.g+'日'+ms.join('、')+'月》　'+lab; }
        else if(k===3){ lab='此月原书未单列，只在其季总论中论及'; src='——《穷通宝鉴·'+(th.textLab||'季首总论')+'》　'+lab; }
        else if(k===4){ lab='原书此月未列（不强补）'; src='——《穷通宝鉴》　'+lab; }
        else { lab='本篇单论'+MM_CN[mn]+'月'; src='——《穷通宝鉴·'+(th.textLab||th.g+'日'+ms.join('、')+'月')+'》　'+lab; }
        var body=(th.text||'（原书此月未列，不代拟）');
        return '<div class="note" style="border-left:2px solid rgba(212,175,55,.45);padding-left:10px;margin:-2px 0 8px">'+body+
          (th.textNote?'<br><br><b style="opacity:.85">另按（同篇）</b><br>'+th.textNote:'')+
          '<br><span style="opacity:.7">'+src+'</span></div>'; })()+
    '<div class="note">原文是条件句，上表只取首用神一格，不可当原文读。</div>',false);

  box.innerHTML=s1+s2+s3+s4+s5;
  settleAccs(box);
}
