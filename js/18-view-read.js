/* ==========================================================================
   玄枢 · 四柱排盘   18-view-read.js   视图·解读
   七段解读折叠
   依赖：前序已加载的模块（14-dom）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

function renderAccRead(c){
  var box=$("#accRead");
  var items=[
    ["壹","日主与性格",personText(c),true],
    ["贰","事业向",careerText(c),false],
    ["叁","财与守",moneyText(c),false],
    ["肆","婚恋",loveText(c),false],
    ["伍","健康",healthText(c),false],
    ["陆","六亲与晚运",familyText(c),false],
    ["柒","用神与改运",adviceText(c),false]
  ];
  box.innerHTML=items.map(function(x){ return accItem(x[0],x[1],x[2],x[3]); }).join("");
  settleAccs(box);
}
