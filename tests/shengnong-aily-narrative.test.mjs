import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.js', import.meta.url), 'utf8');

test('Aily 叙事包含八个业务场景', () => {
  assert.equal((html.match(/<section[^>]+data-aily-scene=/g) || []).length, 8);
  for (const id of ['intake', 'assess', 'plan', 'evidence', 'parallel', 'scope', 'gate', 'dossier']) {
    assert.match(html, new RegExp(`data-aily-scene="${id}"`));
  }
});

test('有界调查的四个出口与人工审批边界存在', () => {
  for (const text of ['停止', '扩大', '等待补证', '转人工', 'approval_required']) assert.match(html, new RegExp(text));
});

test('副本脚本激活 Aily 场景并支持减弱动效', () => {
  assert.match(js, /initAilyNarrative/);
  assert.match(html, /prefers-reduced-motion/);
});
