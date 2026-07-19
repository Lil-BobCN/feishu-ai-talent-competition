import assert from "node:assert/strict";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const packageWorkdir = path.join(repoRoot, "docs", "评委版母方案", ".work");

async function createRelocatedPackage(t, scriptName, source, main = "") {
  const root = await mkdtemp(path.join(tmpdir(), "judge-package-relocation-"));
  const workdir = path.join(root, ".work");
  await mkdir(workdir);
  await copyFile(path.join(packageWorkdir, scriptName), path.join(workdir, scriptName));
  await writeFile(path.join(root, "圣农经营智能中枢_评委版母方案.md"), source);
  await writeFile(path.join(workdir, "评委版正文.md"), main);
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, sourcePath: path.join(root, "圣农经营智能中枢_评委版母方案.md"), scriptPath: path.join(workdir, scriptName) };
}

function run(scriptPath, cwd) {
  return spawnSync(process.execPath, [scriptPath], { cwd, encoding: "utf8" });
}

test("build script runs after the reviewer package is relocated", async (t) => {
  const fixture = await createRelocatedPackage(
    t,
    "build_judge_markdown.mjs",
    "封面\n\n## 附录 A：企业访谈与样本索取清单\n\nAily Agent 使用 Agent Skill 和 MCP。",
    "主报告",
  );

  const result = run(fixture.scriptPath, fixture.root);
  assert.equal(result.status, 0, result.stderr);

  const output = await readFile(fixture.sourcePath, "utf8");
  assert.match(output, /Aily 智能助手/);
  assert.match(output, /业务处置模板/);
  assert.match(output, /受控工具接口/);
});

test("reorder script runs after the reviewer package is relocated", async (t) => {
  const fixture = await createRelocatedPackage(
    t,
    "reorder_judge_markdown.mjs",
    "封面\n\n## 5. 五组核心能力\n\n第五章\n\n## 目录\n\n第一章至第四章\n\n## 附录 A：企业访谈与样本索取清单\n\n附录",
  );

  const result = run(fixture.scriptPath, fixture.root);
  assert.equal(result.status, 0, result.stderr);

  const output = await readFile(fixture.sourcePath, "utf8");
  assert.ok(output.indexOf("## 目录") < output.indexOf("## 5. 五组核心能力"));
});
