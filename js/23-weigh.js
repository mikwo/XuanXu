/* ==========================================================================
   玄枢 · 四柱排盘   23-weigh.js   权衡
   basisOf 依据、LU/XI_LIST/ACT、weigh 前提与力道
   依赖：前序已加载的模块（22-sources, 12-compute）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

function basisOf(src){
  if(src && src.wb) return src.wb;
  var u=(src&&src.u)||"";
  if(/三合十二宫/.test(u)) return "三合局×十二宫位（《三命通会》寄生十二宫位序）";
  if(/日干起例/.test(u)) return "日干起例口诀（原文层即其歌诀）";
  if(/日干口诀/.test(u)) return "日干对支的固定口诀表，位置由口诀给定，不由生克推出";
  if(/月建/.test(u)) return "月建三合（寅午戌见丙之类）";
  if(/日柱系统/.test(u)) return "日柱干支组合（《三命通会》所载固定日）";
  if(/岁神/.test(u)) return "年支顺推二位（岁神系统）";
  if(/方局/.test(u)) return "年支方局进／退一位（《三命通会·论孤辰寡宿》）";
  if(/阴阳交界/.test(u)) return "戌亥、辰巳为阴阳交界（《三命通会·论天罗地网》）";
  if(/旬空/.test(u)) return "六十甲子旬空";
  if(/纳音/.test(u)) return "六十甲子纳音五行";
  return "五行生克与阴阳同异（只用原文已给出的关系）";
}
/* ---- 权衡：先判前提成立否，再判力道，两层不混 ---- */
var LU={"甲":"寅","乙":"卯","丙":"巳","丁":"午","戊":"巳","己":"午","庚":"申","辛":"酉","壬":"亥","癸":"子"};
var XI_LIST={"亡神":1,"劫煞":1,"孤辰":1,"寡宿":1,"十恶大败":1,"阴差阳错":1,"天罗":1,"地网":1,"羊刃":1,"丧门":1,"红艳煞":1,"灾煞":1,"六厄":1,"勾煞":1,"大耗":1,"元辰":1,"劫煞":1};
var ACT={
  "亡神":"把内耗当结构管：少独自咀嚼、先把话说出口、留出消耗的预算",
  "劫煞":"防突发：合同、健康、出行三处留余量",
  "孤辰":"婚配之事宜晚、宜介绍型结识、宜主动去破（异地、长辈牵引、慢热推进）——位置有阻，不等于不能成",
  "寡宿":"与长辈缘薄一层，宜主动维持联系，不必当断语",
  "十恶大败":"治的是「留不住」：降低流动性、账户隔离、不担保不借贷",
  "阴差阳错":"婚缘易错拍：慢定，别在情绪高点作决定",
  "天罗":"受限感：主动划边界，别等被安排",
  "地网":"受限感＋久困：主动换场，别在原地熬",
  "羊刃":"刚气：用在攻坚，不用在对人",
  "红艳煞":"多情易动：慎在暧昧期许承诺",
  "丧门":"留意长辈健康，定期体检即可"
};
function wxRel(a,b){
  var ia=WX.indexOf(a), ib=WX.indexOf(b);
  if(ia<0||ib<0||ia===ib) return "同我";
  if(WX[(ia+1)%5]===b) return "我生";
  if(WX[(ib+1)%5]===a) return "生我";
  if(WX[(ia+2)%5]===b) return "我克";
  return "克我";
}
function weigh(c,name){
  if(!c||!c.pillars) return null;
  var pz=-1,i;
  for(i=0;i<4;i++){ if((c.pillars[i].ss||[]).indexOf(name)>=0){ pz=i; break; } }
  if(pz<0) return null;
  var p=c.pillars[pz], dg=c.pillars[2].gi, dwx=GAN_WX[dg], zwx=ZHI_WX[p.zi];
  var isXiong=!!XI_LIST[name], rel=wxRel(dwx,zwx);
  var f=[], up=0, dn=0, ZN=["年","月","日","时"][pz], ZPOS=["祖上、幼年","父母兄弟、青年","自身、配偶","子女、晚年"];
  var gate=null, gateTxt="";

  /* 三合系六星的宫位核验：把「这一支在起出它的那一局里是第几宫」独立算一遍，与星名的定义位对表。
     六星各对应一个宫位，且各宫恒落同类地支（沐浴·帝旺在四正，墓在四库，病·绝·临官在四生），
     故既能验定义，也能验引擎——星名若贴错位，这里会直接报不符。 */
  var PAL={"桃花":1,"驿马":6,"华盖":8,"将星":4,"劫煞":9,"亡神":3};
  var PALN=["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"];
  var GROUP_YANG={"申子辰":"壬","寅午戌":"丙","巳酉丑":"庚","亥卯未":"甲"};
  var GROUP_WX={"申子辰":"水","寅午戌":"火","巳酉丑":"金","亥卯未":"木"};
  var palOk=null, palRow=null, fromRow=null;
  if(PAL[name]!==undefined){
    var yZc=c.pillars[0].z, dZc=c.pillars[2].z;
    var cand=[SANHE[yZc],SANHE[dZc]], hitGrp=null, hitFrom=[];
    for(var ci=0;ci<cand.length;ci++){
      var g2=cand[ci];
      if(SS_SANHE[name] && SS_SANHE[name][g2]===p.z){ if(!hitGrp) hitGrp=g2; hitFrom.push(ci===0?"年支":"日支"); }
    }
    if(hitGrp){
      var gYang=GROUP_YANG[hitGrp];
      var pi=csPos(GAN.indexOf(gYang),p.zi), want=PAL[name];
      var leiZ=({"子":1,"午":1,"卯":1,"酉":1}[p.z])?"四正":(({"辰":1,"戌":1,"丑":1,"未":1}[p.z])?"四库":"四生");
      var wantLei=(want===8)?"四库":((want===1||want===4)?"四正":"四生");
      palOk=(pi===want && leiZ===wantLei);
      palRow=["宫位","本支"+p.z+"在"+hitGrp+"（"+GROUP_WX[hitGrp]+"局）里居第"+(pi+1)+"宫「"+PALN[pi]+"」、属"+leiZ+"；"+name+"的定义位是第"+(want+1)+"宫「"+PALN[want]+"」、应属"+wantLei
        , palOk?"相符（定义可验算）":"不符（星名与定义位对不上）"];
      var uniq=[]; hitFrom.forEach(function(s){ if(uniq.indexOf(s)<0) uniq.push(s); });
      fromRow=["局属",uniq.join("与")+"之三合局"+hitGrp+"起出"
        + (uniq.length>1 ? "，两处皆起得出，此位双临"
          : (uniq[0]==="年支" ? "（年支为祖上、早年至亲之象）" : "（日支为自身、婚姻之象）")), "—"];
    } else {
      palOk=false;
      palRow=["宫位","本支"+p.z+"不在年支或日支的任何三合局里与"+name+"的定义位相应","不符（星名与定义位对不上）"];
    }
  }

  /* 第一层：前提——这句断语立说的那个条件，在本盘成立否 */
  if(/^(孤辰|寡宿)$/.test(name)){
    var cw=WX[(WX.indexOf(dwx)+2)%5], yang={"木":"甲","火":"丙","土":"戊","金":"庚","水":"壬"}[cw];
    var isJue=(csPos(GAN.indexOf(yang),p.zi)===9);
    gate=isJue;
    gateTxt=isJue
      ? "原文以「妻绝」立说：本支正是"+cw+"（我所克之财）的绝地，那句「生于妻绝之中」在本盘字面成立"
      : "原文以「妻绝」立说：本支非"+cw+"之绝地，断语的前提在本盘不成立，只剩星名";
  } else if(name==="亡神"||name==="劫煞"){
    var leak=[],press=[];
    (p.cang||[]).forEach(function(x){
      var wx=GAN_WX[GAN.indexOf(x.g)], r=wxRel(dwx,wx);
      if(r==="我生") leak.push(x.g+"（"+x.shen+"）");
      if(r==="克我") press.push(x.g+"（"+x.shen+"）");
    });
    if(name==="亡神"){ gate=leak.length>0;
      gateTxt=leak.length ? "原文「亡者，失也，自内失之」，机制是本支藏"+leak.join("、")+"泄我——泄口确实在此" : "原文机制是藏干泄我，本支无泄我之神，前提不成立"; }
    else { gate=press.length>0;
      gateTxt=press.length ? "原文「劫者，夺也，自外夺之」，机制是本支藏"+press.join("、")+"克我——夺者确实在此" : "原文机制是藏干克我，本支无克我之神，前提不成立"; }
  } else if(name==="十恶大败"){
    var lu=LU[GAN[dg]], kok=p.kong||"";
    gate=!!(lu&&kok.indexOf(lu)>=0);
    gateTxt="取「禄入空亡」：本日之禄在"+lu+"，"+(gate?"正落本柱空亡（"+kok+"）之内，定义字面成立":"不在空亡（"+kok+"）之内，定义不成立");
  } else if(name==="阴差阳错"){
    gate=true; gateTxt="取日柱干支不谐（固定十二日）——本日"+GAN[dg]+ZHI[p.zi]+"在列，前提成立，但原文未给吉凶机制";
  } else if(name==="天罗"||name==="地网"){
    var mw=(c.pillars[0].nayin||"").slice(-1);
    gate=(name==="天罗")?(mw==="火"):(mw==="水"||mw==="土");
    gateTxt="《论天罗地网》分命：火命有天罗、水土命有地网、金木命无——本盘年命属"+mw+"，"+(gate?"合此条":"不合，故此星本不该出现");
  }
  if(palOk===false && gate!==true){ gate=false; gateTxt=(gateTxt?gateTxt+"；":"")+"且本支在局中并非"+name+"的定义位，星名本身即与定义不符"; }
  if(palRow) f.push(palRow);
  if(fromRow) f.push(fromRow);
  if(gateTxt) f.push(["前提", gateTxt, gate===true?"成立":(gate===false?"不成立":"未设")]);

  /* 第二层：力道——位置、同支吉凶、原文自带的加减 */
  if(isXiong){
    if(pz===2){ f.push(["位置","落日支（"+p.z+"）——日主坐处、也是夫妻宫，所指之事与自身相扣","加重"]); up++; }
    else f.push(["位置","落"+ZN+"柱（"+ZPOS[pz]+"），不在日主之坐","未加重"]);
    if(gate!==true){ /* 前提不成立者不再加重 */ }
    else if(rel==="克我"){ f.push(["性质","该支属"+zwx+"，克我——此处力道是压","加重"]); up++; }
    else if(rel==="我生"){ f.push(["性质","该支属"+zwx+"，为我所生——力道沿输出口向外走","持平"]); }
    else if(rel==="生我"){ f.push(["性质","该支属"+zwx+"，生我——凶被本气托住","减轻"]); dn++; }
    else if(rel==="我克"){ f.push(["性质","该支属"+zwx+"，为我所克——落在我能驾驭处","未加重"]); }
    else { f.push(["性质","该支与日主同属"+zwx+"，同气——不额外放大","未加重"]); }
    var others=(p.ss||[]).filter(function(x){ return x!==name && XI_LIST[x]; });
    if(others.length>=2 && gate!==false){ f.push(["叠见","同支另有"+others.join("、")+"，"+(others.length+1)+"者聚于一处","加重"]); up++; }
    else if(others.length===1){ f.push(["叠见","同支另见"+others[0]+"——同一位置被两件事共占，但各自只算一次","未加重"]); }
    else f.push(["叠见","同支无他凶星，不与别处重复计罪","未加重"]);
    var JI=/天乙|文昌|天厨|福星|将星|国印|太极|天德|月德/;
    var jg=(p.ss||[]).filter(function(x){ return JI.test(x); });
    if(jg.length){ f.push(["扶制","同支并有"+jg.join("、")+"，此位不孤","减轻"]); dn++; }
    else if(/长生|帝旺|临官|冠带/.test(p.star||"")){ f.push(["扶制","同支无吉星，但自坐「"+p.star+"」，本体之气足以撑住","未减"]); }
    else { f.push(["扶制","同支无吉星，自坐「"+(p.star||"?")+"」，此位无扶","未减"]); }
    var jc=0; c.pillars.forEach(function(q){ jc+=(q.ss||[]).filter(function(x){ return JI.test(x); }).length; });
    if(jc>=3){ f.push(["原文加减","原文有「若内有吉神相扶，贵气相辅，当为吉论」——本盘吉神共"+jc+"见","减轻"]); dn++; }
    else f.push(["原文加减","吉神共"+jc+"见，不足以援引「当为吉论」","未减"]);
    f.push(["断言","原文断语涉六亲、寿夭、绝嗣者不可核验，本页只取可用一层","不作断"]);
    var d=up-dn;
    var force = d>=2?"偏重":d===1?"中等偏重":d===0?"中等":d===-1?"偏轻":"很轻";
    var lv;
    if(gate===false) lv="不成立——只存星名，不作断";
    else if(gate===true) lv="前提成立 · 力道"+force;
    else lv="无原文前提可查 · 力道"+force+"（只按位置与扶制看）";
    return {f:f, lv:lv, up:up, dn:dn, xiong:true, c:(ACT[name]||"按条件取：可核者取，不可核者不作断")};
  }

  /* 吉神：不判「成立」，只判力道——它落在本盘能出多少力 */
  if(pz===2){ f.push(["位置","落日支，与自身同处——最贴身，最易用到","力大"]); up++; }
  else f.push(["位置","落"+ZN+"柱（"+ZPOS[pz]+"）","常位"]);
  if(rel==="克我"){ f.push(["性质","该支属"+zwx+"，克我——吉神坐在克我的位置，出力被打折","折力"]); dn++; }
  else if(rel==="我生"){ f.push(["性质","该支属"+zwx+"，为我所生——吉神之力随输出散出去，不聚","折力"]); dn++; }
  else if(rel==="生我"){ f.push(["性质","该支属"+zwx+"，生我——吉神得地，出力足","增力"]); up++; }
  else if(rel==="我克"){ f.push(["性质","该支属"+zwx+"，为我所克——可用，但须主动去拿","常位"]); }
  else { f.push(["性质","该支与日主同属"+zwx+"，同气——得力直接","增力"]); up++; }
  var jg2=(p.ss||[]).filter(function(x){ return /天乙|文昌|天厨|福星|将星|国印|太极|天德|月德/.test(x) && x!==name; });
  if(jg2.length){ f.push(["并见","同支另有"+jg2.join("、")+"，数吉同宫","增力"]); up++; }
  else f.push(["并见","同支无他吉星","常位"]);
  if(/长生|帝旺|临官|冠带/.test(p.star||"")){ f.push(["自坐","自坐「"+p.star+"」，此位有气","增力"]); up++; }
  else f.push(["自坐","自坐「"+(p.star||"?")+"」，此位气弱","折力"]); dn++;
  var d2=up-dn, lv2 = d2>=2?"力大":d2===1?"力中偏大":d2===0?"力中":d2===-1?"力偏弱":"力弱（须主动去取）";
  if(palOk===false) lv2="定义不符——星名与本支宫位对不上，先存疑 · 原判"+lv2;
  return {f:f, lv:lv2, up:up, dn:dn, xiong:false, c:"吉神不论凶吉成立与否，只看它在这一支出不出得上力；用在合适的事上，弱也能用，只是要主动。"};
}
