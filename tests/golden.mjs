/* 玄枢 · 四柱排盘 金标回归    用法：node tests/golden.mjs
   本文件锁住 compute 的输出。金标由拆分前单文件版首次生成，用于证明拆分零语义改动；
   其后 compute 增补了调候原文的分类字段并更正《穷通宝鉴》逐月取文，core 未变，故重录一次。
   此后的任何重构，只要算法不变，本测试必须通过。 */
import fs from "node:fs";
import crypto from "node:crypto";
import { loadPage } from "./harness.mjs";

const G = JSON.parse(fs.readFileSync(new URL("./golden.json", import.meta.url), "utf8"));
const { api } = loadPage();
const hash = o => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0,16);

let fail = 0, pass = 0;
const bad = [];
G.cases.forEach((c, i) => {
  let h;
  try { h = hash(api.compute(c.in)); } catch (e) { bad.push(`#${i} 抛错 ${e.message}`); fail++; return; }
  if (h === c.h) pass++;
  else { fail++; bad.push(`#${i} ${JSON.stringify(c.in)} 金标 ${c.h} 实得 ${h}`); }
});
console.log("金标用例 " + G.cases.length + " · 通过 " + pass + " · 失败 " + fail);
bad.slice(0, 6).forEach(x => console.log("  ✗ " + x));
process.exit(fail ? 1 : 0);
