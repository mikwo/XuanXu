/* ==========================================================================
   玄枢 · 四柱排盘   19-view-dict.js   视图·词解
   术语卡（十神/长生/神煞/五行/基础）每条标出处；另三卷：神煞生成规则、羊刃三说、规则与出处。
   古籍原文不在此页，见 20-view-classics.js。
   依赖：前序已加载的模块（14-dom, 22-sources）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ---- 出处行：每个词条都要指得出书；指不出的就直说指不出 ---- */
function dFoot(name, opt){
  opt = opt || {};
  if(opt.foot) return '<i class="dsrc"><em>出处</em>' + opt.foot + "</i>";
  var src = SRC(opt.from || name);
  var s = src && src.s, u = src && src.u;
  var left = s ? [].concat(s).join("／") : "本页概述 · 古籍无单条定义";
  var h = '<i class="dsrc"><em>出处</em>' + left;
  if(opt.u && u) h += '<b>｜</b><em>统系</em>' + u;
  return h + "</i>";
}

/* ---- 词条卡：名可悬停（有出处者才挂浮窗），释在下，出处压底 ---- */
function dCard(name, desc, opt){
  opt = opt || {};
  var has = !!SRC(opt.from || name);
  return '<div class="dict-item">'
    + '<b' + (has ? ' class="t" data-tip="' + name + '|"' : "") + ">" + name + "</b>"
    + "<span>" + desc + "</span>"
    + (opt.q ? '<div class="dq">' + opt.q + "</div>" : "")
    + dFoot(name, opt)
    + "</div>";
}

function renderAccDict(){
  var box = $("#accDict");
  var i;

  /* ===== 壹 十神 ===== */
  var shen = "";
  Object.keys(SS_DESC).forEach(function(n){ shen += dCard(n, SS_DESC[n]); });

  /* ===== 贰 十二长生 ===== */
  var csz = "";
  CS.forEach(function(n){ csz += dCard(n, CS_DESC[n] || ""); });

  /* ===== 叁 神煞 ===== */
  var ssz = "";
  Object.keys(SS_ZH_DESC).forEach(function(n){ ssz += dCard(n, SS_ZH_DESC[n], {u:1}); });

  /* ===== 肆 五行与象 ===== */
  var wxz = "";
  WX.forEach(function(n){ wxz += dCard(n, WX_NATURE[n] + "。藏象在" + WX_ZANG[n] + "。宜从事：" + WX_JOB[n] + "。"); });

  /* ===== 伍 基础概念 ===== */
  var basez =
    dCard("日主", "日柱天干，代表「我」。全盘的十神、长生、强弱，都以它为坐标原点。", {from:"元男"})
    + dCard("藏干", "地支所含的天干。本气为主，中气、余气为辅；地支的力量全在藏干里。", {foot:"本页概述 · 古籍无单条定义"})
    + dCard("空亡", "六十甲子分六旬，每旬余二支配不上天干，此二支即空。落何柱，何柱之事易悬而不落。",
        {q:"甲子旬中戌亥空，甲戌旬中申酉空，甲申旬中午未空，甲午旬中辰巳空，甲辰旬中寅卯空，甲寅旬中子丑空。"})
    + dCard("纳音", "古法另一套五行，六十甲子各配一名。多用于气韵与象，不作主断。",
        {q:"六十甲子配五音，取象而名之，以见五行之变。"})
    + dCard("格局", "以月令本气所透取格，定整盘主旋律，本身不下吉凶。",
        {q:"八字用神，专求月令，以日干配月令地支，而生克不同，格局分焉。"})
    + dCard("用神", "让整盘转起来的那一行。不是「缺什么补什么」，而是「此盘最需要什么」。",
        {foot:"方法见《子平真诠·论用神》；本页所打分值属自设扶抑模型，非古法，见「玖」"})
    + dCard("大运", "十年一换的运势背景。干支各管一段，前五年重干，后五年重支。",
        {foot:"起法见「玖」· 大运；三日折一年见「玖」· 起运"})
    + dCard("流年", "一年一换。流年定「事」，大运定「势」；势不顺时，事再美也难成。",
        {foot:"与大运、流月的叠加，见「玖」· 流月"})
    + dCard("节气", "排盘以节气定月建、以立春为岁首、以子初（23:00）换日。这是四柱的地基，错一步全错。",
        {foot:"见「玖」· 年柱、月柱、日柱"})
    + dCard("刑冲合害", "冲主变与离，合主牵与机，害主暗中磨损，刑主内耗纠缠，破主裂而不合。",
        {foot:"称谓通行；本页按地支六冲、六合、六害、三刑、六破逐一列"});

  /* ===== 陆 神煞的生成规则 ===== */
  var palace = [
    ["沐浴 · 桃花", "洗濯未定之位，故拟情欲之动"],
    ["临官 · 禄神 / 亡神", "气最旺处，禄与亡一位两面"],
    ["帝旺 · 将星", "局中四正，居中制四方，故为将"],
    ["病 · 驿马", "病即长生之冲，冲主动，故为奔走"],
    ["墓 · 华盖", "库主闭藏，气至此而收，故孤高好玄艺"],
    ["绝 · 劫煞", "气断之处，故拟劫夺之扰"],
    ["胎 · 灾煞", "气尽将生，最脆之位"],
    ["长生·冠带·衰·死·养", "五位无专名——足见取象有取舍，不是每位都要安一个名字"]
  ];
  var ruleHTML = '<p class="note" style="margin:0 0 10px">几十个名字，只有六套生成法。最严的一套是「三合局 × 十二宫位」：一个局从长生推到养，落一位即得一星；每颗星的「统系」一栏写的正是它属哪一套。</p>'
    + '<div class="dict-grid">'
    + palace.map(function(x){ return '<div class="dict-item"><b>' + x[0] + "</b><span>" + x[1] + "</span></div>"; }).join("")
    + "</div>"
    + '<p class="note" style="margin:10px 0 0"><b>验算</b>：年支申属申子辰水局，水长生在申，顺行十二位——沐浴酉即桃花，临官亥即亡神，帝旺子即将星，病寅即驿马，墓辰即华盖，绝巳即劫煞。六个名字不是六条口诀，是同一台机器出的六个档位。其余五套：<b>日干口诀</b>（天乙、文昌、天厨、国印、太极、福星、红艳）· <b>月建</b>（天德、月德）· <b>日柱</b>（十恶大败＝禄落空亡；阴差阳错＝十二日干支不谐）· <b>岁神</b>（丧门）· <b>方局</b>（孤辰、寡宿）· <b>阴阳交界</b>（天罗、地网）。</p>'
    ;

  /* ===== 柒 一星三说：羊刃 ===== */
  var yr = '<p class="note" style="margin:0 0 10px">同一颗星，三种取法、两个层面；三派各有原文，故并列不合并。</p>'
    + '<div class="dict-grid">'
    + '<div class="dict-item"><b>《子平真诠》</b><span>「禄前一位，惟五阳有之。」甲卯 · 丙戊午 · 庚酉 · 壬子；阴干无刃。且刃须由月令定：「若非卯月而干透乙，或年日时支为卯，则应名之为劫而不名为刃。」</span><i class="dsrc"><em>出处</em>《子平真诠·论阳刃》</i></div>'
    + '<div class="dict-item"><b>《三命通会》</b><span>「羊刃常居禄前一辰」，十干全列——甲卯 · 乙辰 · 丙戊午 · 丁己未 · 庚酉 · 辛戌 · 壬子 · <b>癸丑</b>。癸在丑，不在亥。</span><i class="dsrc"><em>出处</em>《三命通会·论羊刃》</i></div>'
    + '<div class="dict-item"><b>近世 · 帝旺表</b><span>改取十二长生之帝旺——甲卯 · 乙寅 · 丙戊午 · 丁己巳 · 庚酉 · 辛申 · 壬子 · <b>癸亥</b>。二书皆无此文，是现代排盘软件的算法。</span><i class="dsrc"><em>出处</em>无古籍明文 · 由「刃者旺极」外推</i></div>'
    + "</div>"
    + '<p class="note" style="margin:10px 0 8px">前两条其实是同一条规则——<b>禄前一辰</b>，只在「认不认阴干」上分道；第三条换了规则，改用「旺极」。三者对阳干完全重合（甲禄寅→卯，正是甲之帝旺），分歧全在阴干。</p>'
    + '<p class="note" style="margin:0 0 8px">阴干为何分家，算一遍就明白：癸禄在子，前一辰是丑，而<b>丑是癸的冠带</b>（乙辰、丁未、辛戌皆同）——<b>「禄前一辰」用在阴干上，取到的是冠带，不是旺位</b>。名不副实，故子平说「长生禄旺，是一非二」，只留五刃；帝旺说守住「刃＝旺极」的本义，代价是弃掉形式规则。而通会引希夷语早已给「阴干之极」定了坐标：<b>「极盛之地，十干中正处是也……辰者，乙之正位，为阴木之极……丑者，癸之正位，为阴水之极。」</b>落点正在辰未戌丑。癸亥不是抄错某书，是把阳干上的「重合」认作「同一」，外推时把巧合当了定义。</p>'
    + '<p class="note" style="margin:0 0 8px">用途也差一层：子平的阳刃是「<b>格</b>」，须由月令定，断成败；通会的羊刃是「<b>煞</b>」，逐支贴签，不问月令。同名而异物。</p>'
    + '<p class="note" style="margin:0 0 8px"><b>本页取法</b>：默认通会「禄前一辰」，起盘栏可切子平一说，切完即重算；帝旺表无文献可指，不设切换。落到本盘——<b>严格按两家古法并无羊刃</b>（癸刃在丑而盘无丑；子平阴干无刃），婚恋一节「硬气长在夫妻宫」不依赖这颗标签，依据是日支自坐帝旺、伤官双透。</p>'
    + '<p class="note" style="margin:0"><b>遇两书相左，先问三句</b>：这条规则算「位」还是算「旺」？用在「格」还是「煞」？换一种取法，结论变不变？前两句定谁对，第三句定要不要紧。</p>';

  /* ===== 捌 调候用神 ===== */
  var thHead = '<tr><th style="padding:5px 6px;border-bottom:1px solid rgba(212,175,55,.28)"></th>'
    + TH_MONTHS.map(function(m){ return '<th style="padding:5px 4px;border-bottom:1px solid rgba(212,175,55,.28);color:#8c8578;font-weight:400;font-size:10.5px">' + m + "</th>"; }).join("")
    + "</tr>";
  var thBody = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"].map(function(g){
    return '<tr style="border-bottom:1px solid rgba(255,255,255,.05)"><td style="padding:6px;color:#e8d9a8;letter-spacing:.06em">' + g + "</td>"
      + TH_MONTHS.map(function(m){
          var a = (TIAOHOU[g] || {})[m] || [];
          return '<td style="padding:6px 4px;text-align:center">' + (a.length ? '<b style="color:#e8d9a8;font-weight:400">' + a[0] + "</b>" + a.slice(1).join("") : "—") + "</td>";
        }).join("") + "</tr>";
  }).join("");
  var th = '<p class="note" style="margin:0 0 10px"><b>扶抑治「虚」，调候治「偏」</b>：前者问这个盘缺不缺力气，后者问它冷不冷、燥不燥。月令极寒者非火不暖，极燥者非水不润，此时力气够不够是次要的。</p>'
    + '<p class="note" style="margin:0 0 10px">下表为《穷通宝鉴》通行程表，横月令、纵日主，<b>首字为首选用神</b>。原书是条件句（「有丙无癸」「有癸无丙」各论不同），<b>表可作参考，不可当原文读</b>；原文在「典籍」页，本命那一节见命盘「两法取用」。</p>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11.5px;line-height:1.7;min-width:680px"><thead>' + thHead + "</thead><tbody>" + thBody + "</tbody></table></div>"
    + '<p class="note" style="margin:12px 0 0"><b>两法相左时</b>：极寒极燥者调候优先，平和者扶抑为主。本页打分因此略重调候，理由逐条在运势页。</p>';

  /* ===== 玖 规则与出处 ===== */
  var rules = '<p class="note" style="margin:0 0 12px">每条算法都可在此查到出处。<b>只有两书皆有明文、且结论相左者才做成开关</b>，故起盘栏只剩「羊刃」一个；日界、长生、罗网三处只有近世说法、指不到宋元明原文，已撤，固定为子初换日、阳顺阴逆、罗网按年命纳音分命。</p>'
    + '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:11.5px;line-height:1.75;min-width:620px">'
    + '<thead><tr style="color:#8c8578;font-size:10px;letter-spacing:.16em">'
    + ['<th style="text-align:left;padding:6px 9px;border-bottom:1px solid rgba(212,175,55,.28);white-space:nowrap;font-weight:400">项目</th>',
       '<th style="text-align:left;padding:6px 9px;border-bottom:1px solid rgba(212,175,55,.28);font-weight:400">本页做法</th>',
       '<th style="text-align:left;padding:6px 9px;border-bottom:1px solid rgba(212,175,55,.28);font-weight:400">出处</th>',
       '<th style="text-align:left;padding:6px 9px;border-bottom:1px solid rgba(212,175,55,.28);font-weight:400">异说</th>'].join("");
    + "</tr></thead><tbody>"
    + RULES.map(function(r){
        return '<tr style="border-bottom:1px solid rgba(255,255,255,.05)"><td style="padding:8px 9px;color:#e8d9a8;white-space:nowrap;vertical-align:top;letter-spacing:.06em">' + r[0]
          + '</td><td style="padding:8px 9px;color:#ded8ca;vertical-align:top">' + r[1]
          + '</td><td style="padding:8px 9px;color:#a7a099;vertical-align:top">' + r[2]
          + '</td><td style="padding:8px 9px;color:#867f76;vertical-align:top">' + r[3] + "</td></tr>";
      }).join("")
    + "</tbody></table></div>"
    + '<p class="note" style="margin:14px 0 0"><b>三处自承</b>：① 强弱与用神的分值是<b>本页自设的扶抑模型</b>，古书只讲得令得地得势，没有数字；② 格局只取月令本气，<b>未做</b>透干、会支、成败救应；③ 大运流年只按五行喜忌打分，<b>不含</b>刑冲合害加减。</p>';

  box.innerHTML =
    accItem("壹","十神", '<div class="dict-grid">' + shen + "</div>", false) +
    accItem("贰","十二长生", '<div class="dict-grid">' + csz + "</div>", false) +
    accItem("叁","神煞", '<div class="dict-grid">' + ssz + "</div>", false) +
    accItem("肆","五行与象", '<div class="dict-grid">' + wxz + "</div>", false) +
    accItem("伍","基础概念", '<div class="dict-grid">' + basez + "</div>", false) +
    accItem("陆","神煞的生成规则", ruleHTML, false) +
    accItem("柒","一星三说：以羊刃为例", yr, false) +
    accItem("捌","调候用神（《穷通宝鉴》）", th, false) +
    accItem("玖","规则与出处", rules, false);
  settleAccs(box);
}
