import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workdir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.dirname(workdir);
const sourcePath = path.join(packageDir, "圣农经营智能中枢_评委版母方案.md");
const mainPath = path.join(workdir, "评委版正文.md");

const source = fs.readFileSync(sourcePath, "utf8");
const main = fs.readFileSync(mainPath, "utf8").trimEnd();
const appendixStart = source.indexOf("## 附录 A：企业访谈与样本索取清单");

if (appendixStart < 0) {
  throw new Error("未找到原稿附录起点");
}

let appendices = source.slice(appendixStart);

const replacements = [
  ["附录 B：Agent Skill 分层与工具域", "附录 B：智能助手的业务处置模板与受控工具"],
  ["B.1 Skill 不应做成一个巨型文件", "B.1 业务处置模板应按职责分层"],
  ["B.2 五个领域工具网关", "B.2 五类受控工具接口"],
  ["Aily Agent", "Aily 智能助手"],
  ["Agent Skill", "智能助手业务处置模板"],
  ["Agent", "智能助手"],
  ["Skill", "业务处置模板"],
  ["MCP", "受控工具接口"],
  ["Schema", "数据字段规范"],
  ["Workflow", "流程编排"],
  ["Prompt", "指令模板"],
  ["E2E", "端到端测试"],
  ["管理层责任门", "管理层审批机制"],
  ["后置质量门", "到达业务节点后的验收检查"],
  ["质量门", "阶段验收检查"],
  ["服务端写入闸门", "服务端执行前授权校验"],
  ["写入闸门", "执行前授权校验"],
  ["权限闸门", "权限控制"],
  ["效果策略门槛", "效果判断条件"],
  ["策略门槛", "判断条件"],
  ["策略门", "判断条件"],
  ["护栏", "权限与风险控制"],
  ["终局版", "完整版"],
  ["终局", "完整阶段"],
  ["中间态", "过程成果"],
  ["dry-run", "模拟执行"],
];

for (const [from, to] of replacements) {
  appendices = appendices.replaceAll(from, to);
}

const finalDocument = main + "\n\n" + appendices.trimStart();
fs.writeFileSync(sourcePath, finalDocument, "utf8");
console.log(sourcePath);
