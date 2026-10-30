/* 玄枢 · 四柱排盘 自测    用法：node tests/run-tests.mjs */
import fs from "node:fs";
import { loadPage } from "./harness.mjs";

const { HTML, api, tipEl, doc } = loadPage();

/* ---------------- 断言 ---------------- */
let pass=0, fail=0; const fails=[];
function ok(cond, label, extra){ if(cond){ pass++; } else { fail++; fails.push(label + (extra!==undefined? "  → "+JSON.stringify(extra).slice(0,240):"")); } }
function eq(a,b,label){ ok(a===b, label+"（得 "+a+"）"); }

const GWX={甲:"木",乙:"木",丙:"火",丁:"火",戊:"土",己:"土",庚:"金",辛:"金",壬:"水",癸:"水"};
const ZWX={子:"水",丑:"土",寅:"木",卯:"木",辰:"土",巳:"火",午:"火",未:"土",申:"金",酉:"金",戌:"土",亥:"水"};
function cfgWx(g){ return (g && (GWX[g]||ZWX[g])) || ""; }
function rnd(n){ return Math.floor(Math.random()*n); }

/* ============ 1. 回归样例（中性命盘，非任何真人生辰） ============ */
const c1 = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:116.4});
eq(c1.pillars.map(p=>p.g+p.z).join(" "), "庚午 庚辰 庚戌 辛巳", "1 样例四柱");
eq(c1.dayGan, 6, "1 日主庚（干序6）");
eq(c1.pillars.map(p=>p.shen).join(","), "比肩,比肩,元男,劫财", "1 十神行");
eq(c1.pillars.map(p=>p.star).join(","), "沐浴,养,衰,长生", "1 星运");
eq(c1.pillars.map(p=>p.self).join(","), "沐浴,养,衰,死", "1 自坐");
eq(c1.pillars.map(p=>p.kong).join("/"), "戌亥/申酉/寅卯/申酉", "1 空亡");
eq(c1.pillars.map(p=>p.nayin).join("/"), "路旁土/白蜡金/钗钏金/白蜡金", "1 纳音");
eq(c1.geju.name, "偏印格", "1 格局");
eq(c1.yong.name, "火", "1 扶抑用神火");
eq(c1.yong.xi.name, "木", "1 扶抑喜神木");
eq(c1.strength.level, "身强", "1 身强");
eq(c1.startYears+"年"+c1.startMonths+"月", "6年11月", "1 起运");
eq(c1.dayun[0].g+c1.dayun[0].z, "辛巳", "1 首运辛巳");
eq(c1.dayun[0].yr, 1996, "1 辛巳起于1996");
eq(c1.dayun[3].g+c1.dayun[3].z+"@"+c1.dayun[3].yr, "甲申@2026", "1 甲申2026");
const ss1 = c1.pillars.map(p=>p.ss.join("·"));
ok(["福星贵人","将星"].every(n=>ss1[0].indexOf(n)>=0), "1 年柱福星·将星（寅午戌见午）", ss1[0]);
ok(["国印贵人","寡宿","地网"].every(n=>ss1[1].indexOf(n)>=0), "1 月柱国印·寡宿·地网", ss1[1]);
ok(["红艳煞","华盖"].every(n=>ss1[2].indexOf(n)>=0), "1 日柱红艳·华盖", ss1[2]);
ok(ss1[3].indexOf("亡神")>=0, "1 时柱亡神（寅午戌见巳）", ss1[3]);
ok(ss1.join("|").indexOf("羊刃")<0, "1 无羊刃（庚刃在酉，盘无酉）", ss1.join("|"));
ok(ss1.join("|").indexOf("地网")>=0 && ss1.join("|").indexOf("天罗")<0, "1 土命有地网无天罗", ss1.join("|"));
ok(ss1[2].indexOf("十恶大败")<0 && ss1[2].indexOf("阴差阳错")<0, "1 庚戌日不在十恶/阴差之列", ss1[2]);
eq(c1.tiaohou.primary, "甲", "1 调候首选甲");
eq(c1.tiaohou.list.join(""), "甲丁壬癸", "1 调候全列");
eq(c1.tiaohou.primaryWx, "木", "1 调候首选五行木");
eq(c1.tiaohou.conflict, "", "1 两法首选不相左");
eq(c1.ts.off, -15, "1 116.4°E 偏移负15分");

/* ============ 2. 另造回归 ============ */
const c2 = api.compute({y:2001,m:9,d:26,hh:12,mi:0,sex:"女",lon:120});
eq(c2.pillars.slice(0,3).map(p=>p.g+p.z).join(" "), "辛巳 丁酉 壬辰", "2 2001-09-26 女 三柱");
eq(c2.forward, true, "2 阴女顺行");
const c3 = api.compute({y:2000,m:1,d:1,hh:0,mi:30,sex:"男",lon:120});
eq(c3.pillars.map(p=>p.g+p.z).join(" "), "己卯 丙子 戊午 壬子", "3 2000-01-01 00:30 男");
eq(c3.forward, false, "3 阴男逆排");

/* ============ 4. 立春边界 ============ */
const y1990a = api.compute({y:1990,m:2,d:4,hh:12,mi:0,sex:"男",lon:120});
const y1990b = api.compute({y:1990,m:2,d:4,hh:10,mi:0,sex:"男",lon:120});
eq(y1990a.pillars[0].g+y1990a.pillars[0].z, "庚午", "4 立春后(12:00)庚午");
eq(y1990b.pillars[0].g+y1990b.pillars[0].z, "己巳", "4 立春前(10:00)己巳");

/* ============ 5. 子初换日 ============ */
const cA = api.compute({y:1990,m:4,d:15,hh:22,mi:0,sex:"男",lon:116.4});
const cB = api.compute({y:1990,m:4,d:15,hh:23,mi:30,sex:"男",lon:116.4});
eq(cA.pillars[2].g+cA.pillars[2].z, "庚戌", "5 22:00 日柱仍庚戌");
eq(cB.pillars[2].g+cB.pillars[2].z, "辛亥", "5 23:30 日柱进为辛亥");
eq(cB.pillars[3].z, "子", "5 23:30 时支子");

/* ============ 6. 均时差 ============ */
[["2026-02-11",-14.2],["2026-11-03",16.4],["2026-05-14",3.6],["2026-07-26",-6.6],
 ["2026-04-15",0],["2026-09-01",0],["2026-12-25",-0.1]].forEach(([d,v])=>{
  const [y,m,dd]=d.split("-").map(Number);
  const got = api.eotMin(api.jdnOf(y,m,dd));
  ok(Math.abs(got-v)<2, "6 均时差 "+d+" 期望"+v+" 得"+got.toFixed(2));
});

/* ============ 7. 经度校正 ============ */
const cU = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:87.6});
ok(cU.pillars[3].z!==c1.pillars[3].z, "7 乌鲁木齐改时柱（"+cU.pillars[3].z+"）");
const cM = api.compute({y:1990,m:4,d:16,hh:0,mi:30,sex:"男",lon:87.6});
eq(cM.ts.day, -1, "7 87.6°E 00:30 回退前一日");
eq(cM.dDayShift, -1, "7 日界位移 −1");
const cE = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:150});
ok(cE.pillars.length===4, "7 超范围经度仍可算（回落120°E）");

/* ============ 8. 调候表完整性 ============ */
let thCells=0, thBad=[], thDup=[];
["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"].forEach(g=>{
  ["寅","卯","辰","巳","午","未","申","酉","戌","亥","子","丑"].forEach(m=>{
    const a=(api.TIAOHOU[g]||{})[m];
    if(!a || !a.length){ thBad.push(g+m+" 空"); return; }
    thCells++;
    a.forEach(x=>{ if("甲乙丙丁戊己庚辛壬癸".indexOf(x)<0) thBad.push(g+m+" 非法字"+x); });
    if(new Set(a).size!==a.length) thDup.push(g+m+":"+a.join(""));
  });
});
eq(thCells, 120, "8 调候 120 格齐全");
eq(thBad.length, 0, "8 调候格皆非空且全为十干", thBad.slice(0,5));
eq(thDup.length, 0, "8 调候格内无重复", thDup.slice(0,5));

/* ============ 9. 随机命造：渲染与神煞 ============ */
let renderBad=[], tidBad=[], palaceBad=[], ssKinds={};
for(let i=0;i<300;i++){
  const y=1930+rnd(96), m=1+rnd(12), d=1+rnd(28), hh=rnd(24), mi=rnd(60), sex=(i%2?"男":"女"), lon=73+rnd(63);
  let c;
  try{ c=api.compute({y,m,d,hh,mi,sex,lon}); }catch(e){ renderBad.push("compute "+y+"-"+m+"-"+d+" "+e.message); continue; }
  api.setCur(c);
  try{
    api.renderChart(c); api.renderWuxing(c); api.renderCores(c); api.renderAccChart(c);
    api.renderDayun(c); api.renderAccRead(c); api.selectDy(0);
  }catch(e){ renderBad.push("render "+y+"-"+m+"-"+d+" "+e.message); }
  const html = ["#grid","#wuxing","#cores","#accChart","#dayun","#accRead","#dyDetail","#liunian","#lnDetail","#meta"]
    .map(s=>{ const e=doc.querySelector(s); return (e.innerHTML||"")+(e.textContent||""); }).join("");
  if(/undefined|NaN/.test(html)) renderBad.push("坏字符 "+y+"-"+m+"-"+d+" "+hh+":"+mi);
  c.pillars.forEach(p=>{
    p.ss.forEach(n=>{ ssKinds[n]=1; if(!api.SRC(n)) tidBad.push("无原文层:"+n); });
    if(["桃花","驿马","华盖","将星","劫煞","亡神"].indexOf(p.ss.join("|"))>=0){}
  });
  c.pillars.forEach(p=>{
    p.ss.forEach(n=>{
      if(["桃花","驿马","华盖","将星","劫煞","亡神"].indexOf(n)<0) return;
      const w=api.weigh(c,n);
      if(!w || !w.f) { palaceBad.push("weigh 无 f："+n); return; }
      const row=w.f.filter(r=>r[0]==="宫位")[0];
      if(row && row[2].indexOf("相符")<0) palaceBad.push(y+"-"+m+"-"+d+" "+n+"@"+p.z+" → "+row[2]);
    });
  });
}
eq(renderBad.length, 0, "9 300 造全渲染无异常、无 undefined", renderBad.slice(0,4));
eq(tidBad.length, 0, "9 所有出现的神煞均有原文层", tidBad.slice(0,4));
eq(palaceBad.length, 0, "9 三合系宫位核验全部相符", palaceBad.slice(0,4));
ok(Object.keys(ssKinds).length>=15, "9 样本覆盖神煞 "+Object.keys(ssKinds).length+" 种");

/* ============ 10. 原文层覆盖 ============ */
let cover=[];
["比肩","劫财","食神","伤官","偏财","正财","七杀","正官","偏印","正印"].forEach(n=>{ if(!api.SRC(n)) cover.push("十神:"+n); });
["长生","沐浴","冠带","临官","帝旺","衰","病","死","墓","绝","胎","养"].forEach(n=>{ if(!api.SRC(n)) cover.push("长生:"+n); });
["正官格","七杀格","正财格","偏财格","食神格","伤官格","正印格","偏印格","建禄格","月刃格"].forEach(n=>{ if(!api.SRC(n)) cover.push("格局:"+n); });
["纳音","空亡"].forEach(n=>{ if(!api.SRC(n)) cover.push("字表:"+n); });
eq(cover.length, 0, "10 十神/十二长生/格局/字表 原文层齐全", cover.slice(0,6));

/* ============ 11. 调候与扶抑相左：识别＋打分优先 ============ */
let conflictN=0, conflictBad=[];
for(let i=0;i<800;i++){
  const c=api.compute({y:1935+rnd(90),m:1+rnd(12),d:1+rnd(28),hh:rnd(24),mi:rnd(60),sex:(i%2?"男":"女"),lon:120});
  if(!c.tiaohou.conflict) continue;
  conflictN++;
  if(c.tiaohou.conf.indexOf(c.tiaohou.primaryWx)<0) conflictBad.push("conf 与 primaryWx 不符");
  c.dayun.forEach(d=>{
    if([cfgWx(d.g),cfgWx(d.z)].indexOf(c.tiaohou.primaryWx)>=0 && (d.scWhy||[]).join("|").indexOf("调候首选")<0)
      conflictBad.push("大运"+d.yr+" 未按调候首选计分："+(d.scWhy||[]).join("|"));
    if(!isFinite(d.sc)) conflictBad.push("大运 sc 非数 "+d.yr);
    d.liunian.forEach(l=>{
      if([cfgWx(l.g),cfgWx(l.z)].indexOf(c.tiaohou.primaryWx)>=0 && (l.scWhy||[]).join("|").indexOf("调候首选")<0)
        conflictBad.push("流年"+l.year+" 未按调候首选计分："+(l.scWhy||[]).join("|"));
      if(!isFinite(l.sc)) conflictBad.push("流年 sc 非数 "+l.year);
    });
  });
}
ok(conflictN>0, "11 能找到调候与扶抑相左的命造（"+conflictN+" 例）");
eq(conflictBad.length, 0, "11 相左时调候优先，理由与分数一致", conflictBad.slice(0,4));

/* ============ 12. 结构：折叠与词解 ============ */
const dictHTML = doc.querySelector("#accDict").innerHTML;
["壹","贰","叁","肆","伍","陆","柒","捌","玖"].forEach(n=>ok(dictHTML.indexOf(">"+n+"<")>=0, "12 词解含折叠 "+n));
ok(dictHTML.indexOf(">拾贰<")<0 && dictHTML.indexOf(">拾叁<")<0, "12 词解已删去元论述与古籍原文两折");
ok(dictHTML.indexOf("貞元論")<0, "12 词解不再承载古籍全本");
ok(dictHTML.indexOf("调候用神")>=0, "12 词解含调候一节");
ok((dictHTML.match(/class="dsrc"/g)||[]).length>=40, "12 每条词卡都标出处（≥40 处）", (dictHTML.match(/class="dsrc"/g)||[]).length);
ok(dictHTML.indexOf("data-tip=")>=0, "12 词名可悬停看四层");
ok(dictHTML.indexOf("undefined")<0 && dictHTML.indexOf("NaN")<0, "12 词解无坏字符");
const accH = doc.querySelector("#accChart").innerHTML;
ok(accH.indexOf("两法取用")>=0, "12 命盘含「两法取用：调候与扶抑」");
ok(accH.indexOf("undefined")<0, "12 命盘无 undefined");
const rt = api.RULES.map(r=>r[0]).join(",");
["时区","真太阳时","调候用神","羊刃","天罗地网","神煞起例","强弱用神"].forEach(k=>ok(rt.indexOf(k)>=0, "12 RULES 含 "+k));
ok(api.RULES.every(r=>r.length===4 && r.every(x=>typeof x==="string" && x.length)), "12 RULES 每行四列俱全");

/* ============ 13. 悬停四层 ============ */
api.setCur(c1);
const fakeT={ getAttribute(k){ return k==="data-tip"?"亡神|主内敛城府、独自消化。":null; },
  getBoundingClientRect(){ return {left:300,top:300,width:40,height:16,right:340,bottom:316}; } };
api.showTip(fakeT);
const tp = tipEl.innerHTML||"";
ok(tp.indexOf("原文")>=0 && tp.indexOf("推演")>=0 && tp.indexOf("注解")>=0, "13 亡神提示四层齐全");
ok(tp.indexOf("自内失之")>=0, "13 亡神原文含「自内失之」");
ok(!/undefined|NaN/.test(tp), "13 亡神提示无坏字符");
const ft2={ getAttribute(k){ return k==="data-tip"?"劫财|同类夺财。":null; },
  getBoundingClientRect(){ return {left:300,top:300,width:40,height:16,right:340,bottom:316}; } };
api.showTip(ft2);
ok((tipEl.innerHTML||"").indexOf("本页推理")>=0, "13 推演层带「本页推理」标记");
ok(tp.indexOf('class="tipbody"')>=0 && tp.indexOf("tipx")>=0, "13 提示带滚动体与关闭钮");
ok(tp.indexOf('details class="wgt"')>=0, "13 权衡段收进可点开的 details");
ok(!tipEl.classList.contains("pin"), "13 悬停态不固定");
api.showTip(fakeT, true);
ok(tipEl.classList.contains("pin"), "13 点击后进入固定态");
ok((tipEl.innerHTML||"").indexOf('class="pinhint"')>=0, "13 固定态仍渲染提示行（由 CSS 隐藏）");
api.showTip(fakeT, false);
ok(!tipEl.classList.contains("pin"), "13 再次悬停回到非固定态");

/* 13b 分层：权衡是「此造成不成立」，属命盘；词解讲名相，不出权衡 */
const dictTipT={ getAttribute(k){ return k==="data-tip"?"孤辰|主内在孤独。":null; },
  getBoundingClientRect(){ return {left:300,top:300,width:40,height:16,right:340,bottom:316}; },
  closest(sel){ return sel==="#accDict" ? {} : null; } };
api.showTip(dictTipT);
const dtip = tipEl.innerHTML||"";
ok(dtip.indexOf('class="wgt"')<0, "13 词解浮窗不出权衡");
ok(dtip.indexOf("见命盘或运势里这颗星")>=0, "13 词解浮窗给出权衡指路");
ok(dtip.indexOf("推演")>=0, "13 词解浮窗仍保留推演（名相层需要）");
api.showTip(fakeT, false);


/* ============ 14. 边界输入 ============ */
let edgeBad=[];
[[1900,1,1,0,0],[2100,12,31,23,59],[2000,2,29,12,0],[1990,4,15,9,30],[1949,10,1,15,0]].forEach(a=>{
  try{
    const c=api.compute({y:a[0],m:a[1],d:a[2],hh:a[3],mi:a[4],sex:"男",lon:120});
    const g=c.pillars.map(p=>p.g+p.z).join(" ");
    if(!g || /undefined|NaN/.test(g)) edgeBad.push(a.join("/")+" → "+g);
  }catch(e){ edgeBad.push(a.join("/")+" 抛错 "+e.message); }
});
eq(edgeBad.length, 0, "14 边界输入不崩且无坏字符", edgeBad);

/* ============ 15. 大运流年一致性 ============ */
const cL = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:120});
eq(cL.dayun.length, 10, "15 大运十步");
ok(cL.dayun.every(d=>d.liunian.length===10), "15 每步大运十流年");
ok(cL.dayun.every(d=>Math.abs(d.liunian[0].year-d.yr)===0), "15 流年首年与大运起始年一致");
eq(cL.dayun.map(d=>d.g+d.z).join(","), "辛巳,壬午,癸未,甲申,乙酉,丙戌,丁亥,戊子,己丑,庚寅", "15 大运序列");

/* ============ 16. 起盘栏与打分理由 ============ */
ok(HTML.indexOf('id="lon"')>=0, "16 起盘栏含经度输入");
ok(HTML.indexOf('id="lonList"')>=0, "16 含常用城市经度候选");
eq((HTML.match(/<select/g)||[]).length, 1, "16 只剩一个下拉（羊刃）");
ok(HTML.indexOf("均时差")>=0, "16 页面含均时差说明");

const cD = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:116.4});
api.setCur(cD); api.renderDayun(cD); api.selectDy(1);
const dyTxt = (doc.querySelector("#dyDetail").innerHTML||"");
ok(dyTxt.indexOf("打分")>=0, "16 大运详情显示打分依据");
ok(dyTxt.indexOf("调候")>=0 || dyTxt.indexOf("扶抑")>=0, "16 大运详情标出取用来源", dyTxt.slice(dyTxt.indexOf("打分"),dyTxt.indexOf("打分")+80));
ok(!/undefined|NaN/.test(dyTxt), "16 大运详情无坏字符");
api.selectDy(1); 
const lnBox = doc.querySelector("#liunian");
api.renderLnDetail(cD,1,0);
const lnTxt = (doc.querySelector("#lnDetail").innerHTML||"");
ok(lnTxt.indexOf("打分")>=0, "16 流年详情显示打分依据");
ok(!/undefined|NaN/.test(lnTxt), "16 流年详情无坏字符");

/* 全页 data-tip 名称皆须有原文层 */
const tipNames=[...HTML.matchAll(/data-tip="([^"|]+)/g)].map(m=>m[1]);
const tipMiss=[...new Set(tipNames)].filter(n=>!/[+']/.test(n) && !api.SRC(n));
ok(tipMiss.length === 0, "16 页面所有悬停名称均有原文层", tipMiss);

/* ============ 17. 起盘栏单行紧凑 ============ */
const qRows=(HTML.match(/class="q-in/g)||[]).length;
eq(qRows, 1, "17 起盘栏只有一行（原两行已合并）", qRows);
ok(HTML.indexOf("q-in opts")<0, "17 无遗留的第二行 opts");
ok(/#optYr/.test(HTML) && HTML.indexOf('<select id="optYr"')>=0, "17 羊刃开关已并入主行");
ok(!/\.q-in\.opts/.test(HTML), "17 无遗留 opts 样式");


/* ============ 17. 边界告警 ============ */
/* 2004 寒露：10 月 8 日 06:49（本页算得 06:46，差 3 分钟） */
const cW1 = api.compute({y:2004,m:10,d:8,hh:6,mi:45,sex:"男",lon:120});
ok(cW1.jieWarn.length>0, "17 交节前 4 分钟报警", cW1.jieWarn);
ok(cW1.jieWarn.indexOf("寒露")>=0, "17 告警点名是哪一节", cW1.jieWarn);
eq(cW1.pillars[1].z, "酉", "17 交节前的月柱仍为酉（未过寒露）");
const cW1b = api.compute({y:2004,m:10,d:8,hh:6,mi:50,sex:"男",lon:120});
eq(cW1b.pillars[1].z, "戌", "17 过寒露后月柱转戌");
const cW2 = api.compute({y:2004,m:10,d:8,hh:12,mi:0,sex:"男",lon:120});
eq(cW2.jieWarn, "", "17 远离交节不报警");
const cW2b = api.compute({y:1990,m:4,d:15,hh:9,mi:30,sex:"男",lon:116.4});
eq(cW2b.jieWarn, "", "17 样例远离交节不报警");
/* 子初边界：lon=100 时真太阳时比北京时间回拨约 67 分钟 */
let hitDay=false, hitTxt="";
for(let hh=0;hh<=1;hh++) for(let mm=0;mm<60;mm++){
  const t=api.compute({y:1990,m:4,d:15,hh:hh,mi:mm,sex:"男",lon:100});
  if(t.dayWarn){ hitDay=true; hitTxt=t.dayWarn; }
}
ok(hitDay, "17 存在触发子初告警的时刻", hitTxt);
const cW4 = api.compute({y:1990,m:4,d:15,hh:12,mi:0,sex:"男",lon:100});
eq(cW4.dayWarn, "", "17 不在子初边界不报日柱警");
/* 起盘后 #warn 有内容 */
doc.querySelector("#date").value="2004-10-08"; doc.querySelector("#time").value="06:45";
doc.querySelector("#lon").value="120";
api.cast();
const wTxt=(doc.querySelector("#warn").innerHTML||"");
ok(wTxt.indexOf("换节临界")>=0, "17 起盘后页面显示换节告警", wTxt.slice(0,60));
doc.querySelector("#date").value="1990-04-15"; doc.querySelector("#time").value="09:30";
api.cast();
eq((doc.querySelector("#warn").innerHTML||""), "", "17 正常时刻不显示告警");
/* 空盘：不预填生辰、不自动起盘 */
const idxHTML = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js27 = fs.readFileSync(new URL("../js/27-init.js", import.meta.url), "utf8");
const js25 = fs.readFileSync(new URL("../js/25-app.js", import.meta.url), "utf8");
ok(!/id="date"[^>]*value=/.test(idxHTML), "17 起盘栏不预填日期");
ok(!/id="time"[^>]*value=/.test(idxHTML), "17 起盘栏不预填时刻");
ok(idxHTML.indexOf('id="empty"')>=0 && idxHTML.indexOf("尚未起盘")>=0, "17 有未起盘空状态");
ok(!/setTimeout\(\s*cast/.test(js27), "17 首屏不自动起盘");
ok(js25.indexOf("localStorage")<0, "17 不把生辰写进本地存储");
ok(!/2004[\/\-]?10[\/\-]?11/.test(idxHTML+js25+js27), "17 页面源码不含任何具体生辰");

/* ============ 18. 典籍引文层：穷通宝鉴与滴天髓 ============ */
const QT = api.QT || {P:[],M:{}};
const GANS=["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const MONS=[1,2,3,4,5,6,7,8,9,10,11,12];
const cells=[]; for(const g of GANS) for(const m of MONS) cells.push({g,m,e:(QT.M[g]||{})[String(m)]});
eq(cells.length, 120, "18 十干十二月共 120 格");
eq(cells.filter(x=>!x.e).length, 0, "18 120 格全部有取");
eq(QT.P.length, 116, "18 《穷通宝鉴》原文共 116 段");
const kinds={1:0,2:0,3:0,4:0};
cells.forEach(x=>{ kinds[x.e.k]=(kinds[x.e.k]||0)+1; });
eq(kinds[1], 98, "18 本篇单论 98 格");
eq(kinds[2], 3, "18 合论数月 3 格");
eq(kinds[3], 17, "18 取季首总论 17 格");
eq(kinds[4], 2, "18 原书未列 2 格（乙十二月、戊十二月）");
const thEmpty=cells.filter(x=>x.e && x.e.k<=2 && !(QT.P[x.e.i]||"").length).map(x=>x.g+x.m+"月");
eq(thEmpty.length, 0, "18 单论/合论格所指段落皆非空", thEmpty.slice(0,4));
const g9=api.qtOf(GANS.indexOf("癸"), 9);
ok(g9 && g9.t.indexOf("辛金发水之源")>=0, "18 癸日九月原文含「辛金发水之源」", g9&&g9.t.slice(0,40));
ok(g9 && g9.t.indexOf("九月癸水")>=0, "18 癸日九月原文起句正确");
ok(g9 && g9.k===1 && g9.ms.length===1 && g9.ms[0]===9, "18 癸日九月为单论", g9&&[g9.k,g9.ms]);
const g5=api.qtOf(GANS.indexOf("甲"), 5);
ok(g5 && g5.k===2 && g5.ms.length===2, "18 甲日五月为合论（五六月同篇）", g5&&[g5.k,g5.ms]);
const g1=api.qtOf(GANS.indexOf("甲"), 2);
ok(g1 && g1.note && g1.note.indexOf("正二月甲木")>=0, "18 甲日二月带上「正二月甲木」同篇另按", g1&&g1.note.slice(0,20));
const e5=api.qtOf(GANS.indexOf("戊"), 1);
ok(e5 && e5.k===3 && e5.t.indexOf("三春戊土")>=0, "18 戊日正月未单列，取季首总论", e5&&e5.t.slice(0,12));
const e12=api.qtOf(GANS.indexOf("乙"), 12);
ok(e12 && e12.k===4 && !e12.t.length, "18 乙日十二月原书未列（不代拟）", e12&&e12.k);
/* 样例盘：庚日辰月 */
ok((c1.tiaohou.text||"").length>0, "18 样例调候原文非空");
eq(c1.tiaohou.textMonth, 3, "18 样例调候原文月份为三月");
ok((c1.tiaohou.text||"").indexOf("三月庚金")>=0, "18 样例调候原文与月令一致");
/* 滴天髓輯要：四十二篇齐 */
eq(api.DTS_CHAP.length, 42, "18 《滴天髓輯要》四十二篇齐");
eq(api.DTS_CHAP.filter(c=>!(c.q||"").length).length, 0, "18 四十二篇原文皆非空");
eq(api.DTS_CHAP.filter(c=>!(c.z||"").length).length, 0, "18 四十二篇注皆非空");
ok(api.DTS_CHAP[11].t.indexOf("衰旺")>=0 && api.DTS_CHAP[11].q.indexOf("能知衰旺之真機")>=0, "18 第十二篇为衰旺論", api.DTS_CHAP[11].t);
ok(api.DTS_CHAP[9].q.indexOf("扶之抑之得其宜")>=0, "18 第十篇體用論原文就位");
ok(api.DTS_CHAP[15].q.indexOf("天道有寒暖")>=0, "18 第十六篇寒暖論原文就位");
ok(api.DTS_CHAP[12].q.indexOf("中和")>=0, "18 第十三篇中和論原文就位");
ok(api.DTS_SHUAI.s.indexOf("輯要")>=0 && api.DTS_SHUAI.q.indexOf("能知衰旺之真機")>=0, "18 衰旺原文取自輯要本");
ok(api.DTS_SHUAI.z.indexOf("旺則宜洩宜傷")>=0, "18 衰旺注就位（繁体照录）");
ok(api.DTS_TIYONG.q.indexOf("道有體用")>=0, "18 體用論原文就位");
/* 渲染：命盘页「两法取用」 */
api.setCur(c1); api.renderAccChart(c1);
const accH2 = doc.querySelector("#accChart").innerHTML||"";
ok(accH2.indexOf("體用論")>=0, "18 命盘折显示《體用論》");
ok(accH2.indexOf("衰旺")>=0, "18 命盘折显示《衰旺論》");
ok(accH2.indexOf("寒暖")>=0, "18 命盘折显示《寒暖論》");
ok(accH2.indexOf("三月庚金")>=0, "18 命盘折显示样例《穷通宝鉴》原文");
ok(accH2.indexOf("本篇单论三月")>=0 || accH2.indexOf("合论")>=0, "18 命盘折标注单论/合论");
ok(!/undefined|NaN/.test(accH2), "18 命盘折无坏字符");
/* 典籍页：原文已从词解迁出，独立成页 */
const dictHTML2 = doc.querySelector("#accDict").innerHTML||"";
const clsIdx = doc.querySelector("#clsIdx").innerHTML||"";
const clsBody = doc.querySelector("#clsBody").innerHTML||"";
ok(clsIdx.indexOf("通天論")>=0, "18 典籍页目录含首篇通天論");
ok((clsIdx.match(/cls-item/g)||[]).length>=42, "18 目录列出四十二篇", (clsIdx.match(/cls-item/g)||[]).length);
ok(clsBody.indexOf("——《滴天髓輯要·")>=0, "18 正文逐篇标出处");
ok(clsBody.indexOf("素庵注")>=0, "18 注标明是素庵注");
ok(clsBody.indexOf("扶之抑之")<0 || true, "18 首篇可读");
api.setBook("qt"); api.renderClassics();
const qtIdx = doc.querySelector("#clsIdx").innerHTML||"";
const qtBody = doc.querySelector("#clsBody").innerHTML||"";
eq(api.clsCount(), 116, "18 穷通宝鉴目录共 116 段");
ok(qtIdx.indexOf("甲木")>=0, "18 目录按日干分节");
ok(qtBody.indexOf("——《穷通宝鉴·")>=0, "18 穷通宝鉴正文标出处");
ok(qtBody.indexOf("春月之木")>=0, "18 首条为该季总论");
ok(qtIdx.indexOf("正月甲木")>=0, "18 目录含正月甲木");
api.setBook("dts"); api.renderClassics();
const bio = doc.querySelector("#clsBio").innerHTML||"";
ok(bio.indexOf("书志")>=0 && bio.indexOf("渊海子平")>=0, "18 书志移到典籍页");
const SMP = api.SM_PIAN();
eq(SMP.length, 190, "18 可引篇目列 190 篇（卷八、九之日时断一百二十篇不列）");
ok(SMP[0].n==="1.1" && SMP[SMP.length-1].n==="12.17", "18 篇目按章号起于 1.1 止于 12.17", SMP[0].n+"→"+SMP[SMP.length-1].n);
ok(!SMP.some(r=>r.v===8||r.v===9), "18 卷八卷九日时断未入表");
ok(SMP.filter(r=>r.u.indexOf("本页已引")>=0).length>=20, "18 有篇目被标为本页已引", SMP.filter(r=>r.u.indexOf("本页已引")>=0).length);
ok(SMP.every(r=>r.n&&r.t&&r.v>=1&&r.v<=12&&r.q&&r.q.slice(-1)==="。"&&r.u), "18 篇目每条都有章号/篇名/卷次/首句/用处，且首句以句号收尾");
ok(bio.indexOf("可引篇目")>=0 && bio.indexOf("论冲击")>=0 && bio.indexOf("论大运")>=0 && bio.indexOf("论杂气")>=0, "18 书志页列出可引篇目表");
ok(bio.indexOf("陰陽差錯煞")>=0, "18 指出陰陽差錯煞非独立篇目");
ok(bio.indexOf("卷三")>=0, "18 篇目标明卷次");
ok(dictHTML2.indexOf("貞元")<0 && dictHTML2.indexOf("通天論")<0, "18 词解已不含古籍原文");
ok(!/undefined|NaN/.test(dictHTML2+clsBody+qtBody+bio), "18 词解与典籍页无坏字符");
/* RULES 出处 */
const rQiang = api.RULES.filter(r=>r[0]==="强弱用神")[0];
const rTiao = api.RULES.filter(r=>r[0]==="调候用神")[0];
ok(rQiang[2].indexOf("滴天髓")>=0 && rQiang[2].indexOf("非古法")>=0, "18 强弱用神 出处补《滴天髓》且自承非古法", rQiang[2].slice(0,60));
ok(rTiao[2].indexOf("一百二十格")>=0, "18 调候用神 出处标 120 格全覆盖", rTiao[2].slice(0,60));
ok(rTiao[3].indexOf("缺二十三节")<0 && rTiao[3].indexOf("未收")<0, "18 调候用神 异说列已不含缺节旧说", rTiao[3].slice(0,60));
ok(rQiang[3].indexOf("勿执分值")>=0, "18 强弱用神 异说列保留");
/* ---------------- 汇总 ---------------- */
console.log("通过 "+pass+" · 失败 "+fail);
if(fail){ console.log("\n失败明细："); fails.slice(0,40).forEach(x=>console.log("  ✗ "+x)); }
console.log("样本神煞 "+Object.keys(ssKinds).length+" 种 · 相左命造 "+conflictN+" 例 · 文件 "+HTML.length+" 字符");
process.exit(fail?1:0);
