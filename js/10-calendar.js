/* ==========================================================================
   玄枢 · 四柱排盘   10-calendar.js   历法与天文
   儒略日、低精度太阳黄经、节气求解、真太阳时
   依赖：前序已加载的模块（00-base）；本工程用经典脚本共享全局作用域，
   以便 index.html 双击即可运行。加载顺序见 index.html 与 README。
   ========================================================================== */
"use strict";

/* ================= 历法 ================= */
/* 两套时刻各司其职，不可混用：
   ① 节气（进而年柱、月柱、起运）是天文瞬时，须与世界时比较 —— jd 用「输入时刻 − 8h」求真值；
   ② 时柱与子初日界按当地真太阳时 —— 经度时差（每度 4 分钟）＋均时差，由 eotMin 自算。
   若把真太阳时也塞进 jd，节气会跟着偏，等于两次校正叠加；若时柱用标准时间，经度偏西者会差一个时辰。 */
var TZ=8;
function jdnOf(y,m,d){
  var a=Math.floor((14-m)/12), yy=y+4800-a, mm=m+12*a-3;
  return d+Math.floor((153*mm+2)/5)+365*yy+Math.floor(yy/4)-Math.floor(yy/100)+Math.floor(yy/400)-32045;
}
function rad(d){return d*Math.PI/180;}
function sunLon(jd){
  var T=(jd-2451545)/36525;
  var L0=280.46646+36000.76983*T+0.0003032*T*T;
  var M=357.52911+35999.05029*T-0.0001537*T*T;
  var C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(rad(M))
        +(0.019993-0.000101*T)*Math.sin(rad(2*M))+0.000289*Math.sin(rad(3*M));
  var tr=L0+C;
  var om=125.04-1934.136*T;
  return ((tr-0.00569-0.00478*Math.sin(rad(om)))%360+360)%360;
}
function solveTerm(year,lon){
  var jd=jdnOf(year,1,1)+(((lon-280)%360+360)%360)/0.9856;
  for(var i=0;i<8;i++){
    var d=((lon-sunLon(jd)+540)%360)-180;
    if(Math.abs(d)<1e-5) break;
    jd+=d*365.2422/360;
  }
  return jd;
}
var JIE_NAME={2:"立春",3:"惊蛰",4:"清明",5:"立夏",6:"芒种",7:"小暑",8:"立秋",9:"白露",10:"寒露",11:"立冬",0:"大雪",1:"小寒"};
var JIE=[[315,2],[345,3],[15,4],[45,5],[75,6],[105,7],[135,8],[165,9],[195,10],[225,11],[255,0],[285,1]];
function jieList(y){
  var out=[];
  for(var c=y-1;c<=y+1;c++){
    for(var i=0;i<JIE.length;i++){
      out.push({jd:solveTerm(c,JIE[i][0]),zhi:JIE[i][1],cal:c});
    }
  }
  out.sort(function(a,b){return a.jd-b.jd;});
  return out;
}

/* 均时差 EoT：真太阳时 − 平太阳时，单位分钟。
   EoT = 4 ×（平黄经 − 0.0057183° − 视赤经α）。视黄经仍用本页 sunLon（已含黄经章动近似）。 */
function eotMin(jd){
  var T=(jd-2451545)/36525;
  var L0=280.46646+36000.76983*T+0.0003032*T*T;
  var lam=sunLon(jd);
  var eps=23.4392911-0.0130042*T;
  var ra=Math.atan2(Math.cos(rad(eps))*Math.sin(rad(lam)),Math.cos(rad(lam)))*180/Math.PI;
  var d=((L0-0.0057183-ra)%360+360)%360;
  if(d>180) d-=360;
  return d*4;
}
