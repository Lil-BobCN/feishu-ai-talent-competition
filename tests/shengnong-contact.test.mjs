import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.html', import.meta.url), 'utf8');
const js = await readFile(new URL('../output/html/圣农经营智能中枢_Aily叙事副本.js', import.meta.url), 'utf8');

test('联系页包含个人身份与教育背景', () => {
  assert.match(html, /data-view="contact"/);
  for (const text of ['刘清源', '南昌航空大学', '工商管理专业', '大二', '2026\.09']) {
    assert.match(html, new RegExp(text));
  }
});

test('联系页使用圣农品牌标识并保留低干扰文化语汇', () => {
  assert.match(html, /class="brand-logo"/);
  assert.match(html, /sunner-logo\.png/);
  assert.match(html, /不负信赖/);
  assert.match(html, /1983 — 2024/);
});

test('联系页呈现项目导师与两位成员的分工', () => {
  for (const text of ['PROJECT TEAM', '项目团队：三类关键分工', '梁小清', '班主任', '项目导师', '杜欣宇', '数据挖掘自动化', '丁铭浩', '前端开发']) {
    assert.match(html, new RegExp(text));
  }
});

test('顶部导航移除案例实战，并使用无边框的统一导航样式', () => {
  assert.doesNotMatch(html, />案例实战</);
  assert.match(html, /\.hash-home-header \.hash-button,\n\s*\.hash-home-header \.hash-contact/);
  assert.match(html, /min-height: 48px;/);
});

test('联系页有分阶段档案入场、阅读进度式团队揭示，并支持减弱动效', () => {
  for (const text of ['triggerContactEntrance', 'setupContactReveals', 'stopContactMotion', 'revealMargin', 'contact-rule-trace', 'contact-resume::before', 'contact-team.is-revealed', 'contact-team-head, .contact-team-card', 'contact-scroll-reveal', 'is-contact-entering', 'prefers-reduced-motion']) {
    assert.match(`${html}\n${js}`, new RegExp(text));
  }
});

test('联系页仅展示公开仓库入口，不暴露私人联系方式', () => {
  assert.match(html, /github\.com\/Lil-BobCN\/feishu-ai-talent-competition/);
  assert.doesNotMatch(html, /mailto:/);
  assert.doesNotMatch(html, /tel:/);
  assert.doesNotMatch(html, /data-copy-wechat/);
  assert.doesNotMatch(html, /点击后复制到剪贴板/);
  assert.doesNotMatch(js, /navigator\.clipboard/);
});

test('联系我们入口使用 contact 路由', () => {
  assert.match(html, /data-action="contact"/);
  assert.match(js, /location\.hash = '#contact'/);
  assert.match(js, /route\.view === 'contact'/);
});
