import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../output/html/圣农经营智能中枢_终局架构蓝图_滚动叙事副本.html', import.meta.url);
const jsPath = new URL('../output/html/圣农经营智能中枢_滚动叙事副本.js', import.meta.url);
const html = await readFile(htmlPath, 'utf8');
const js = await readFile(jsPath, 'utf8');
const routes = ['collection', 'transport', 'foundation', 'aily', 'decision', 'milestone', 'coaching', 'feedback'];

test('首页与详情页结构存在', () => {
  assert.match(html, /data-view="home"/);
  assert.match(html, /data-view="detail"/);
  assert.match(html, />联系我们</);
});

test('八节点 Hash 路由完整', () => {
  for (const route of routes) assert.match(js, new RegExp(`node/${route}`));
  assert.doesNotMatch(js, /routeObserver|setActiveRoute/);
});

test('流程条使用灰色底轨和动态填充', () => {
  assert.match(html, /route-segment/);
  assert.match(js, /setRouteProgress/);
  assert.match(js, /is-reached/);
});

test('精修导航、标签对比度和页面动效', () => {
  assert.match(html, />案例实战</);
  assert.match(html, /#hash-app \.hash-tab\.is-active/);
  assert.match(html, /hash-signal-scan/);
  assert.match(js, /setupScrollReveals/);
  assert.match(js, /is-entering/);
});

test('首页首次加载具有分层入场动效', () => {
  assert.match(html, /hash-home-enter/);
  assert.match(js, /triggerHomeEntrance/);
});
