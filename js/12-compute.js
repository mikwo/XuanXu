/* ==========================================================================
   玄枢 · 四柱排盘   12-compute.js   主计算
   四柱、神煞、五行力量、强弱、用神、调候、格局、大运、流年、边界告警
   依赖：前序已加载的模块（以上全部数据与 lib）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 主计算 ================= */
function compute(o){
  var y=o.y,m=o.m,d=o.d,hh=o.hh,mi=o.mi,sex=o.sex;
  var jd=jdnOf(y,m,d)-0.5+(hh+mi/60)/24-TZ/24;   /* 换为世界时儒略日，与节气同一标度 */
  /* 真太阳时：出生地经度时差（每度 4 分钟）＋均时差。定日界与时柱，古法用当地真太阳时。
     经度取自表单；未填或越界时按东八区标准经线 120°E 计（即不校正）。 */
  var lon=parseFloat(o.lon);
  if(!isFinite(lon)||lon<-180||lon>180) lon=120;
  var eot=eotMin(jd);
  var tsOff=Math.round((lon-120)*4+eot);        /* 分钟：真太阳时 − 北京时间 */
  var tMin=hh*60+mi+tsOff, tsDay=0;
  while(tMin<0){ tMin+=1440; tsDay--; }
  while(tMin>=1440){ tMin-=1440; tsDay++; }
  var tsH=Math.floor(tMin/60), tsM=tMin%60;
  var list=jieList(y);
  var liChun=null,lastJie=null;
  for(var i=list.length-1;i>=0;i--){
    if(list[i].jd<=jd){
      if(!lastJie) lastJie=list[i];
      if(list[i].zhi===2){ liChun=list[i]; break; }
    }
  }
  if(!lastJie) lastJie=list[0];
  var solarYear=liChun?liChun.cal:y;
  var yIdx=((solarYear-4)%60+60)%60;
  /* 边界告警：节气用低精度太阳视黄经（实测与历书差数分钟，最坏按 0.01° 计约 15 分钟），真太阳时误差约 1 分钟。
     出生时刻离换节不足 20 分钟，月柱可能差一格；真太阳时离 23:00 不足 10 分钟，日柱在子初边界上。
     这两处是仅存会算错四柱的输入，不掩饰，直接报出来。 */
  /* 两侧都要看：晚于上一节的差值、早于下一节的差值，取更近的那一边。只在「刚过上一节」一侧报警会漏掉「还差几分钟就换节」这一侧，而那一侧的月柱恰恰最容易错。 */
  var nextJie=null;
  for(var ni=0;ni<list.length;ni++){ if(list[ni].jd>jd){ nextJie=list[ni]; break; } }
  var gapPrev=Math.round((jd-lastJie.jd)*1440);
  var gapNext=nextJie?Math.round((nextJie.jd-jd)*1440):99999;
  var jieGapMin=Math.min(gapPrev,gapNext);
  var jieWarn="";
  if(jieGapMin<=20){
    jieWarn = (gapNext<=gapPrev)
      ? ("距下一节「"+JIE_NAME[nextJie.zhi]+"」尚有 "+gapNext+" 分钟，本页节气按低精度太阳视黄经算（实测差数分钟），若交节时刻略早则月柱应为下一月，请与历书核对")
      : ("刚过「"+JIE_NAME[lastJie.zhi]+"」"+gapPrev+" 分钟，本页节气按低精度太阳视黄经算（实测差数分钟），若交节时刻略晚则月柱应为上一月，请与历书核对");
  }
  var dMin=tsH*60+tsM, gapA=Math.abs(dMin-23*60), gapB=Math.abs(dMin-24*60);
  var dayGapMin=Math.min(gapA,gapB), dayWarn="";
  if(dayGapMin<=10){
    var nearT=(gapA<=gapB)?"23:00":"24:00", nearN=(gapA<=gapB)?"子初换日":"午夜";
    var tsTxt=tsH+":"+(tsM<10?"0":"")+tsM;
    dayWarn = (dayGapMin===0)
      ? ("真太阳时 "+tsTxt+" 正当 "+nearT+" "+nearN+"之刻，日柱取前取后俱有可能，请核对")
      : ("真太阳时 "+tsTxt+" 距 "+nearT+" "+nearN+"不足 "+dayGapMin+" 分钟，日柱存疑，请核对");
  }
  var mZhi=lastJie.zhi;
  var mPos=(mZhi-2+12)%12;
  var mGan=((yIdx%10)*2+2+mPos)%10;
  var mIdx=(function(){for(var k=0;k<60;k++){if(k%10===mGan&&k%12===mZhi)return k;}return 0;})();
  var dJdn=jdnOf(y,m,d)+tsDay; if(tsH>=23) dJdn+=1;   /* 子初换日：《三命通会·论时刻》子时统属次日；时刻取真太阳时 */
  var dJdnBeijing=jdnOf(y,m,d); if(hh>=23) dJdnBeijing+=1;
  var dIdx=((dJdn+49)%60+60)%60;
  var hZ=Math.floor((tsH+1)/2)%12;
  var hGan=(dIdx%10*2+hZ)%10;
  var hIdx=(function(){for(var k=0;k<60;k++){if(k%10===hGan&&k%12===hZ)return k;}return 0;})();
  var gz=[yIdx,mIdx,dIdx,hIdx];
  var dayGan=dIdx%10, dayWx=GAN_WX[dayGan], dayWxIdx=WX.indexOf(dayWx);

  var pillars=gz.map(function(g,i){
    var gi=g%10, zi=g%12;
    var star=CS[csPos(dayGan,zi)];
    var self=CS[csPos(gi,zi)];
    var kk=kongOf(g);
    var ss=calcSS(dayGan,zi,gz[0]%12,gz[2]%12,gz[0]%10);
    return {
      gi:gi,zi:zi,g:GAN[gi],z:ZHI[zi],
      shen: i===2 ? (sex==="男"?"元男":"元女") : shiShen(dayGan,gi),
      cang:(CANG[ZHI[zi]]||[]).map(function(cg,j){
        return {g:cg,shen:shiShen(dayGan,GAN.indexOf(cg)),main:j===0};
      }),
      star:star, self:self, kong:kk.join(""), nayin:NAYIN[Math.floor(g/2)], ss:ss
    };
  });

  /* ---- 命局级神煞 ---- */
  function addSS(i,name){
    if(!pillars[i]||pillars[i].ss.indexOf(name)>=0) return;
    pillars[i].ss.push(name);
  }
  var zs=gz.map(function(g){ return ZHI[g%12]; });
  var dgz=GAN[gz[2]%10]+ZHI[gz[2]%12];
  if(SHIE[dgz]) addSS(2,"十恶大败");
  if(YINCHA[dgz]) addSS(2,"阴差阳错");
  var ALLGAN=gz.map(function(g){ return GAN[g%10]; });
  /* 天罗地网（《三命通会·论天罗地网》）：戌亥为天罗、辰巳为地网；
     又分命——火命人有天罗，水、土命人有地网，金木二命无之。命以年柱纳音取。 */
  var mingWx=NAYIN[Math.floor(gz[0]/2)].slice(-1);
  var hasTian=(zs.indexOf("戌")>=0 && zs.indexOf("亥")>=0);
  var hasDi=(zs.indexOf("辰")>=0 && zs.indexOf("巳")>=0);
  var tianOk=(mingWx==="火");
  var diOk=(mingWx==="水"||mingWx==="土");
  if(hasTian && tianOk){ for(var q4=0;q4<4;q4++) if(zs[q4]==="戌"||zs[q4]==="亥") addSS(q4,"天罗"); }
  if(hasDi && diOk){ for(var q5=0;q5<4;q5++) if(zs[q5]==="辰"||zs[q5]==="巳") addSS(q5,"地网"); }
  /* 丧门：年支顺行二位 */
  var sangZ=ZHI[(gz[0]%12+2)%12];
  for(var q1=0;q1<4;q1++) if(zs[q1]===sangZ) addSS(q1,"丧门");
  /* 天德 / 月德：以月建查，见于命局天干或地支者 */
  var mZ=ZHI[gz[1]%12];
  [[TIANDE[mZ],"天德贵人"],[YUEDE[mZ],"月德贵人"]].forEach(function(pair){
    var v=pair[0]; if(!v) return;
    var isGan=GAN.indexOf(v)>=0;
    for(var q2=0;q2<4;q2++){
      if(isGan && ALLGAN[q2]===v) addSS(q2,pair[1]);
      if(!isGan && zs[q2]===v) addSS(q2,pair[1]);
    }
  });

  /* ---- 神煞 ---- */
  function calcSS(dg,zi,yi,di,yg){
    var out=[];
    var ds=GAN[dg], yds=GAN[yg], zhi=ZHI[zi], yZhi=ZHI[yi], dZhi=ZHI[di];
    ["天乙贵人","文昌贵人","太极贵人","国印贵人","天厨贵人","福星贵人","禄神","红艳煞"].forEach(function(k){
      var starts=SS_GAN[k]||["日"];
      var hit=false;
      if(starts.indexOf("日")>=0){ var v=SS_TABLE[k][ds]; if(v && v.indexOf(zhi)>=0) hit=true; }
      if(!hit && starts.indexOf("年")>=0){ var w=SS_TABLE[k][yds]; if(w && w.indexOf(zhi)>=0) hit=true; }
      if(hit) out.push(k);
    });
    /* 羊刃：按 OPTS.yangRen 取说，日干起（《三命通会·论羊刃》以日干为例） */
    var yr=YANGREN[OPTS.yangRen] && YANGREN[OPTS.yangRen][ds];
    if(yr && yr.indexOf(zhi)>=0) out.push("羊刃");
    /* 三合系：年支起为主，日支起为辅（二者皆古法，合一即可） */
    ["桃花","驿马","华盖","将星","劫煞","亡神"].forEach(function(k){
      if(SS_SANHE[k][SANHE[yZhi]]===zhi || SS_SANHE[k][SANHE[dZhi]]===zhi) out.push(k);
    });
    /* 孤辰寡宿：古法只以年支查 */
    if(GU[yZhi]===zhi) out.push("孤辰");
    if(GUA[yZhi]===zhi) out.push("寡宿");
    return out;
  }

  /* ---- 五行力量 ---- */
  var score={木:0,火:0,土:0,金:0,水:0}, cnt={木:0,火:0,土:0,金:0,水:0};
  gz.forEach(function(g){
    var w=GAN_WX[g%10]; score[w]+=1; cnt[w]++;
    var cg=CANG[ZHI[g%12]];
    cg.forEach(function(c,j){
      var w2=GAN_WX[GAN.indexOf(c)];
      score[w2]+= j===0?1.2:(j===1?0.5:0.3);
      cnt[w2]++;
    });
  });
  var tot=0; WX.forEach(function(w){tot+=score[w];});
  var pct={}; WX.forEach(function(w){pct[w]=Math.round(score[w]/tot*100);});
  var sum=0; WX.forEach(function(w){sum+=pct[w];});
  pct["水"]+= 100-sum;

  /* ---- 强弱（扶抑简法）---- */
  var sheng=(dayWxIdx+4)%5, woSheng=(dayWxIdx+1)%5, woKe=(dayWxIdx+2)%5, keWo=(dayWxIdx+3)%5;
  var parts=[], sc=0;
  var mShenName=shiShen(dayGan,mGan);
  if(["正印","偏印","比肩","劫财"].indexOf(mShenName)>=0){ sc+=1.2; parts.push({k:"得令",v:"月令"+ZHI[mZhi]+"为"+mShenName+"，生扶日主　+1.2"}); }
  else parts.push({k:"失令",v:"月令"+ZHI[mZhi]+"为"+mShenName+"，不助日主　+0"});
  var de=0;
  pillars.forEach(function(p){
    p.cang.forEach(function(x,j){
      var t=WX.indexOf(GAN_WX[GAN.indexOf(x.g)]);
      if(t===dayWxIdx||t===sheng) de+= j===0?0.55:0.3;
    });
  });
  de=Math.round(de*100)/100;
  sc+=de; parts.push({k:"得地",v:"地支藏干中生我同我者，合计　+"+de});
  var shi=0,shiTxt=[];
  pillars.forEach(function(p,i){
    if(i===2) return;
    var t=WX.indexOf(GAN_WX[GAN.indexOf(p.g)]);
    if(t===dayWxIdx||t===sheng){ shi+=0.6; shiTxt.push(p.g+"(助)"); }
    else if(t===woSheng||t===woKe){ shi-=0.55; shiTxt.push(p.g+"(耗)"); }
    else shiTxt.push(p.g+"(平)");
  });
  shi=Math.round(shi*100)/100;
  sc+=shi; parts.push({k:"得势",v:"天干 "+shiTxt.join(" ")+"　"+(shi>=0?"+":"")+shi});
  sc=Math.round(sc*100)/100;
  var level = sc>=1.8?"身强" : sc>=0.8?"中和" : "身弱";
  parts.push({k:"结论",v:"扶抑分 "+sc+"，判为"+level});

  /* ---- 用神 ---- */
  var yongIdx, xiIdx, jiArr;
  if(sc>=1.8){ yongIdx=keWo; xiIdx=woKe; jiArr=[dayWxIdx,sheng]; }
  else if(sc>=0.8){ yongIdx=woKe; xiIdx=keWo; jiArr=[woSheng,dayWxIdx]; }
  else { yongIdx=sheng; xiIdx=dayWxIdx; jiArr=[woSheng,woKe,keWo]; }

  /* ---- 调候（《穷通宝鉴》）：与扶抑独立的一法 ---- */
  var thList=(TIAOHOU[GAN[dayGan]]||{})[ZHI[mZhi]]||[];
  var thP=thList[0]||"", thS=thList.slice(1);
  var thPwx=thP?GAN_WX[GAN.indexOf(thP)]:"";
  var thSwx=thS.map(function(g){ return GAN_WX[GAN.indexOf(g)]; }).filter(function(w,i,a){ return a.indexOf(w)===i; });
  var thWxs=[thPwx].concat(thSwx).filter(function(w,i,a){ return w&&a.indexOf(w)===i; });
  var thJi=jiArr.map(function(t){ return WX[t]; });
  /* 相左只算「首选」：次选本就是备而未用，与扶抑不同行不算冲突，只作附注 */
  var thConf=(thPwx && thJi.indexOf(thPwx)>=0) ? [thPwx] : [];
  var thSconf=thSwx.filter(function(w){ return thJi.indexOf(w)>=0; });
  var thConflict = thConf.length ? ("调候首选取"+thConf.join("、")+"，扶抑却以此为忌：一说该暖，一说该泄，须以月令寒暖为先") : "";

  /* ---- 格局 ---- */
  var benqi=CANG[ZHI[mZhi]][0];
  var benqiShen=shiShen(dayGan,GAN.indexOf(benqi));
  var geName=({"正官":"正官格","七杀":"七杀格","正财":"正财格","偏财":"偏财格","食神":"食神格","伤官":"伤官格","正印":"正印格","偏印":"偏印格","比肩":"建禄格","劫财":"月刃格"})[benqiShen];

  /* ---- 大运 ---- */
  var forward=(sex==="男")===(yIdx%10%2===0);
  var nextJie=null;
  for(var q=0;q<list.length;q++){ if(list[q].jd>jd){ nextJie=list[q]; break; } }
  var spanDays = forward ? (nextJie.jd-jd) : (jd-lastJie.jd);
  var totalMonths=Math.round(spanDays*4);
  var startYears=Math.floor(totalMonths/12);
  var startMonths=totalMonths%12;

  var dayun=[];
  for(var n=0;n<10;n++){
    var di=(mIdx+(forward?(n+1):-(n+1))+600)%60;
    var startYr=solarYear+startYears+n*10;
    /* 大运管十年之势，流年管一年之变：流年分数＝流年干支全额 ＋ 大运干支半额 */
    var dsc=luckScore(di%10,di%12);
    var lns=[];
    for(var k=0;k<10;k++){
      var calY=startYr+k;
      var li=((calY-4)%60+60)%60;
      var lsc=luckScore(li%10,li%12);
      lns.push({
        year:calY, g:GAN[li%10], z:ZHI[li%12],
        shen:shiShen(dayGan,li%10),
        sc:Math.round((lsc.s+dsc.s/2)*10)/10,
        scWhy:dsc.why.map(function(w){ return "运·"+w; }).concat(lsc.why.map(function(w){ return "年·"+w; })),
        scConf:dsc.conf.concat(lsc.conf)
      });
    }
    dayun.push({
      g:GAN[di%10], z:ZHI[di%12], gi:di%10, zi:di%12,
      age:startYears+n*10, yr:startYr, shen:shiShen(dayGan,di%10),
      sc:dsc.s, scWhy:dsc.why, scConf:dsc.conf,
      liunian:lns
    });
  }

  /* 打分口径：调候首选 +2 ＞ 扶抑用神 +1.6 ＞ 调候次选 +1 ＞ 扶抑喜神 +0.6 ＞ 忌 −1.2。
     调候有书，扶抑是本页模型，故调候权重在前；两法相左时调候压过扶抑，并记 conf。 */
  function luckScore(gi,zi){
    var s=0, why=[], conf=[];
    [GAN_WX[gi],ZHI_WX[zi]].forEach(function(w){
      var t=WX.indexOf(w), v=0, lab="";
      if(w===thPwx){ v=2; lab="调候首选"; }
      else if(thSwx.indexOf(w)>=0){ v=1; lab="调候次选"; }
      if(t===yongIdx && v<1.6){ v=1.6; lab="扶抑用神"; }
      else if(t===xiIdx && v<0.6){ v=0.6; lab="扶抑喜神"; }
      if(v===0 && jiArr.indexOf(t)>=0){ v=-1.2; lab="忌"; }
      if(jiArr.indexOf(t)>=0 && v>0) conf.push(w);
      s+=v; if(lab) why.push(w+"·"+lab);
    });
    return {s:Math.round(s*10)/10, why:why, conf:conf};
  }

  return {
    y:y,m:m,d:d,hh:hh,mi:mi,sex:sex,solarYear:solarYear,
    ts:{hh:tsH,mi:tsM,off:tsOff,lon:lon,eot:Math.round(eot*10)/10,day:tsDay},
    dDayShift:(dJdn-dJdnBeijing),
    jieWarn:jieWarn, dayWarn:dayWarn, jieGapMin:jieGapMin,
    yIdx:yIdx, mIdx:mIdx, dIdx:dIdx, hIdx:hIdx,
    dayGan:dayGan, dayWx:dayWx, dayWxIdx:dayWxIdx,
    pillars:pillars, score:score, cnt:cnt, pct:pct,
    strength:{score:sc,level:level,parts:parts},
    yong:{name:WX[yongIdx],idx:yongIdx,xi:{name:WX[xiIdx],idx:xiIdx},ji:jiArr.map(function(t){return WX[t];})},
    tiaohou:{g:GAN[dayGan],month:ZHI[mZhi],climate:TH_CLIMATE[ZHI[mZhi]]||"",list:thList,primary:thP,second:thS,
      primaryWx:thPwx,secondWx:thSwx,wxs:thWxs,conflict:thConflict,conf:thConf,subConflict:thSconf,
      text:(function(){ var qq=qtOf(dayGan,mPos+1); return qq?qq.t:""; })(), textMonth:(mPos+1),
      textMonths:(function(){ var qq=qtOf(dayGan,mPos+1); return qq?qq.ms:[]; })(),
      textKind:(function(){ var qq=qtOf(dayGan,mPos+1); return qq?qq.k:0; })(),
      textNote:(function(){ var qq=qtOf(dayGan,mPos+1); return qq?qq.note:""; })(),
      textLab:(function(){ var qq=qtOf(dayGan,mPos+1); return qq?qq.lab:""; })()},
    geju:{name:geName,benqi:benqi,shen:benqiShen,zhi:ZHI[mZhi]},
    hasShie: pillars.some(function(p){ return p.ss.indexOf("十恶大败")>=0; }),
    hasDaye: pillars.some(function(p){ return p.ss.indexOf("阴差阳错")>=0; }),
    dayun:dayun, forward:forward,
    startYears:startYears, startMonths:startMonths,
    jieZhi:ZHI[mZhi]
  };
}
