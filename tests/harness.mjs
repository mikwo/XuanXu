/* ==========================================================================
   玄枢 · 四柱排盘   测试夹具（harness）
   做两件事：① 从 index.html 读出 CSS/JS 清单并按序拼装；
             ② 造一套最小 DOM stub，把页面脚本跑进 node:vm。
   两个测试文件（run-tests / stress）共用它，改页面结构只需改这里。
   ========================================================================== */
import fs from "node:fs";
import vm from "node:vm";

const ROOT = new URL("../", import.meta.url);
const read = p => fs.readFileSync(new URL(p, ROOT), "utf8");

export function listAssets(){
  const INDEX = read("index.html");
  const CSSF = [...INDEX.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map(m => m[1]);
  const JSF  = [...INDEX.matchAll(/<script src="([^"]+\.js)"><\/script>/g)].map(m => m[1]);
  if(!JSF.length) throw new Error("index.html 里没有 <script src>，无法加载模块");
  return { INDEX, CSSF, JSF };
}

function El(id){
  const ctx = new Proxy({}, { get:(t,k)=> (k in t? t[k] : function(){}), set:(t,k,v)=>{t[k]=v;return true;} });
  return {
    id, innerHTML:"", textContent:"", value:"", offsetLeft:0, offsetWidth:100, scrollHeight:200, clientHeight:200,
    style:new Proxy({},{get:(t,k)=>t[k]||"",set:(t,k,v)=>{t[k]=v;return true;}}),
    dataset:{}, _attr:{},
    classList:{ _s:new Set(), add(c){this._s.add(c);}, remove(c){this._s.delete(c);},
      toggle(c,v){ v===undefined? (this._s.has(c)?this._s.delete(c):this._s.add(c)) : (v?this._s.add(c):this._s.delete(c)); },
      contains(c){return this._s.has(c);} },
    appendChild(){}, addEventListener(){}, removeEventListener(){},
    setAttribute(k,v){ this._attr[k]=v; }, getAttribute(k){ return this._attr[k]||null; },
    getContext(){ return ctx; }, focus(){}, remove(){},
    getBoundingClientRect(){ return {left:0,top:0,width:300,height:200,right:300,bottom:200}; },
    querySelector(){ return El("q"); }, querySelectorAll(){ return []; }
  };
}

const INIT = "renderClassics();\nrenderAccDict();\nmoveInk();\nsetTimeout(function(){ moveInk(); },120);";

/* exports：导出给断言用的 api */
export const API_EXPORTS = "compute,weigh,showTip,SRC,TIAOHOU,RULES,eotMin,jdnOf,csPos,sunLon,jieList,QT,qtOf," +
  "DTS_CHAP,DTS_SHUAI,DTS_HAN,DTS_TIYONG,MM_CN,renderChart,renderWuxing,renderCores,renderAccChart," +
  "renderDayun,renderDyDetail,renderLiunian,renderLnDetail,renderAccRead,renderAccDict,selectDy,cast," +
  "setCur:function(v){cur=v;},getCur:function(){return cur;}," +
  "renderClassics,clsBodyHTML,clsIdxHTML,clsBioHTML,clsPaint," +
  "setBook:function(b){CLS_BOOK=b;clsBuild();},setClsSel:function(i){CLS_SEL=i;},"+
  "clsCount:function(){return CLS_ENTRIES.length;},smPianHTML:smPianHTML,SM_PIAN:function(){return SM_PIAN;}";

export function loadPage(){
  const { INDEX, CSSF, JSF } = listAssets();
  const CSS = CSSF.map(read);
  const JS  = JSF.map(read);
  const HTML = INDEX + "\n" + CSS.join("\n") + "\n" + JS.join("\n");
  const CODE = JS.join("\n;\n");
  if(CODE.indexOf(INIT) < 0) throw new Error("初始化块未找到（js/27-init.js 是否被改？）");

  const patched = CODE.replace(INIT,
    "globalThis.__api={"+API_EXPORTS+"};\n" +
    "try{ renderClassics(); renderAccDict(); globalThis.__dict='ok'; }catch(e){ globalThis.__dict='ERR '+e.message; }");

  const cache = {};
  const doc = {
    documentElement: El("html"), body: El("body"),
    createElement(t){ return El(t); }, createElementNS(ns,t){ return El(t); },
    querySelector(sel){ if(!cache[sel]) cache[sel]=El(sel); return cache[sel]; },
    querySelectorAll(){ return []; },
    getElementById(id){ return doc.querySelector("#"+id); },
    addEventListener(){}, removeEventListener(){}, readyState:"complete"
  };
  const sandbox = {
    document: doc, navigator:{userAgent:"node"},
    localStorage:{ getItem(){return null;}, setItem(){}, removeItem(){} },
    setTimeout:()=>0, clearTimeout:()=>{}, setInterval:()=>0, clearInterval:()=>{},
    requestAnimationFrame:()=>0, cancelAnimationFrame:()=>{},
    matchMedia:()=>({ matches:false, addEventListener(){} }),
    isFinite, parseInt, parseFloat, Math, Date, JSON, Number, String, Array, Object, RegExp, Error, console, Intl,
    devicePixelRatio:1, innerWidth:1200, innerHeight:800,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; }
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(patched, sandbox, { filename:"bazi.bundle.js" });
  const api = sandbox.__api;
  if(!api) throw new Error("__api 未导出");
  return { HTML, CODE, api, doc, files:{CSSF, JSF}, tipEl: doc.querySelector("#tip") };
}
