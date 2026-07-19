import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workdir = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(path.dirname(workdir), "圣农经营智能中枢_评委版母方案.md");
const source = fs.readFileSync(sourcePath, "utf8");

const section5 = source.indexOf("## 5. 五组核心能力");
const contents = source.indexOf("## 目录");
const appendix = source.indexOf("## 附录 A：企业访谈与样本索取清单");

if (!(section5 > 0 && contents > section5 && appendix > contents)) {
  throw new Error("章节边界与预期不一致");
}

const cover = source.slice(0, section5).trimEnd();
const sections5to8 = source.slice(section5, contents).trim();
const sections1to4 = source.slice(contents, appendix).trim();
const appendices = source.slice(appendix).trimStart();

fs.writeFileSync(
  sourcePath,
  cover + "\n\n" + sections1to4 + "\n\n" + sections5to8 + "\n\n" + appendices,
  "utf8",
);

console.log(sourcePath);
