const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');
const { chromium } = require('playwright');

// 转正后的公开看板（与四处镜像字节一致；repo 位置 fonts.css 相对路径可解析）
const pageUrl = pathToFileURL(path.resolve(
  __dirname,
  '../dashboard/index.html',
)).href;

function contrastRatio(foreground, background) {
  const luminance = color => {
    const channels = color.match(/\d+(?:\.\d+)?/g).slice(0, 3).map(Number);
    const linear = channels.map(channel => {
      const normalized = channel / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

async function withPage(viewport, fn, contextOptions = {}) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport, ...contextOptions });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  try {
    await page.goto(pageUrl, { waitUntil: 'load' });
    await fn(page);
    assert.deepEqual(errors, [], `browser errors: ${errors.join(' | ')}`);
  } finally {
    await browser.close();
  }
}

test('module tabs keep 01 detailed, 02 frozen and 03 in progress', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.locator('[data-module="evolution"]').first().click();
    await assert.doesNotReject(page.locator('[data-pane="evolution"]:visible').waitFor());
    assert.match(await page.locator('[data-pane="evolution"]').innerText(), /02_logic_final/);

    await page.locator('[data-module="expansion"]').first().click();
    await assert.doesNotReject(page.locator('[data-pane="expansion"]:visible').waitFor());
    assert.match(await page.locator('[data-pane="expansion"]').innerText(), /03_in_progress/);
    assert.equal(await page.locator('[data-pane="expansion"] button').count(), 0);

    await page.locator('[data-module="events"]').first().click();
    await assert.doesNotReject(page.locator('[data-pane="events"]:visible').waitFor());
  });
});

test('three roles render their own duty queues from the same case array', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    const home = page.locator('#roleHome');
    let text = await home.innerText();
    for (const token of ['待我决策', '需要关注', '治理线与经营影响线']) assert.match(text, new RegExp(token));
    assert.doesNotMatch(text, /\d+(?:\.\d+)?\s*(万元|元|吨)/, 'impact line must not show fabricated numbers');

    await page.locator('[data-role="regional"]').click();
    text = await home.innerText();
    for (const token of ['本区域待办', '升级事项', '本区域阶段分布']) assert.match(text, new RegExp(token));
    assert.match(text, /当前没有待你处理的事项；empty 不等于没有经营风险/);
    assert.match(text, /切回集团管理层可见待办队列演示/);

    await page.locator('[data-role="frontline"]').click();
    text = await home.innerText();
    for (const token of ['我的任务', '新人指导', '权限说明']) assert.match(text, new RegExp(token));
    assert.equal(await page.locator('body').getAttribute('data-current-role'), 'frontline');
    assert.match(await page.locator('#stripScope').innerText(), /本人责任任务/);

    await page.locator('[data-role="group"]').click();
    await page.locator('#roleHome >> text=待我决策').waitFor();
    assert.equal(await page.locator('#caseList .caserow').count(), 12);
  });
});

test('stage cells filter the case list and governance watch drills into two source states', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.locator('.vf-cell[data-stage="decision"]').click();
    assert.match(await page.locator('#listTitle').innerText(), /决策就绪/);
    let pills = await page.locator('#caseList .caserow .pill.state').allTextContents();
    assert.equal(pills.length, 1);
    assert.ok(pills.every(text => text === '决策就绪'));

    await page.locator('.vf-cell[data-stage="decision"]').click();
    assert.equal((await page.locator('#caseList .caserow .pill.state').allTextContents()).length, 12);

    await page.locator('.vf-cell[data-stage="governance_watch"]').click();
    await assert.doesNotReject(page.locator('#substatePanel:visible').waitFor());
    await page.locator('[data-substate="known_no_action"]').click();
    pills = await page.locator('#caseList .caserow .pill.state').allTextContents();
    assert.ok(pills.length > 0 && pills.every(text => text === '已知悉暂不处理'));
    await page.locator('[data-substate="risk_accepted"]').click();
    pills = await page.locator('#caseList .caserow .pill.state').allTextContents();
    assert.ok(pills.length > 0 && pills.every(text => text === '风险接受'));
  });
});

test('queue rows and case rows select a case and link the dossier', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.locator('.qrow[data-queue-case="C-260724-006"]').click();
    assert.equal(await page.locator('.caserow[aria-current="true"]').getAttribute('data-case-id'), 'C-260724-006');
    assert.match(await page.locator('#caseDetail').innerText(), /华北滞销库存调拨方案待管理决定/);

    const rows = page.locator('#caseList .caserow');
    const secondId = await rows.nth(1).getAttribute('data-case-id');
    await rows.nth(1).click();
    assert.equal(await page.locator('.caserow[aria-current="true"]').getAttribute('data-case-id'), secondId);
  });
});

test('the dossier renders all eleven sections with approved titles', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    const headings = await page.locator('#caseDetail .d-sec .sec-h h3').allTextContents();
    assert.deepEqual(headings, [
      '案件总览', '经营事实与未知项', 'Agent调查循环', '证据与查询轨迹',
      '责任人与下一动作', '管理决定', '责任任务与业务里程碑',
      '结果验证与关闭', '飞书协同送达状态', '原始证据与权限', '接口与字段映射',
    ]);
  });
});

test('new employee guidance opens an accessible dialog and restores focus', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    const opener = page.locator('[data-action="new-hire-guidance"]');
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.locator('[role="dialog"]:visible');
    await assert.doesNotReject(dialog.waitFor());
    const text = await dialog.innerText();
    for (const term of ['岗位职责', '所需证据', '下一里程碑', '升级路径', '历史同类案件']) {
      assert.match(text, new RegExp(term));
    }
    assert.match(text, /华东门店到手价低于批准价格/);
    assert.match(text, /集团经营管理者/);
    assert.ok(await dialog.evaluate(node => node.contains(document.activeElement)));

    await page.keyboard.press('Tab');
    assert.ok(await dialog.evaluate(node => node.contains(document.activeElement)));
    await page.keyboard.press('Escape');
    await assert.doesNotReject(page.locator('[role="dialog"]').waitFor({ state: 'hidden' }));
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.action), 'new-hire-guidance');
  });
});

test('Escape is canceled only while the guidance dialog is open', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    const dispatchEscape = () => page.evaluate(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(event);
      return event.defaultPrevented;
    });

    assert.equal(await dispatchEscape(), false);
    const opener = page.locator('[data-action="new-hire-guidance"]');
    await opener.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#guidanceBackdrop').isHidden(), false);
    assert.equal(await dispatchEscape(), true);
    assert.equal(await page.locator('#guidanceBackdrop').isHidden(), true);
  });
});

test('runtime inspector renders every state truthfully and the recover button restores normal', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.locator('#drawerBtn').click();
    await assert.doesNotReject(page.locator('#demoDrawer.open').waitFor());
    const select = page.locator('#runtimeState');

    await select.selectOption('loading');
    assert.ok(await page.locator('.skel').count() > 0, 'loading should render skeletons');
    assert.match(await page.locator('[data-rt-text]').innerText(), /正在读取案件投影/);

    await select.selectOption('empty');
    assert.match(await page.locator('#roleHome').innerText(), /当前没有待你处理的事项；empty 不等于没有经营风险/);
    assert.match(await page.locator('[data-rt-text]').innerText(), /没有可展示记录；不能据此判断企业没有异常/);

    const expectations = {
      forbidden: /无权读取/,
      stale: /数据已过期/,
      conflict: /版本冲突/,
      unavailable: /来源当前不可用/,
      projection_failed: /投影失败或同步失败/,
    };
    for (const [state, pattern] of Object.entries(expectations)) {
      await select.selectOption(state);
      const blocker = page.locator('#blocker:visible');
      await assert.doesNotReject(blocker.waitFor());
      assert.match(await blocker.innerText(), pattern, `${state} blocker copy`);
      assert.match(await blocker.innerText(), /停止展示/);
      assert.equal(await page.locator('[data-runtime-recover]:visible').count(), 1, `${state} recover button`);
      assert.equal(await page.locator('[data-pane="events"]').isHidden(), true, `${state} hides the console`);
      await page.locator('[data-runtime-recover]').click();
      assert.match(await page.locator('#stripProjection').innerText(), /synced_demo/i, `${state} recovers to normal`);
      assert.ok(await page.locator('#caseList .caserow').count() > 0, `${state} restores the case list`);
    }
  });
});

test('info popovers hover-show, click-pin, keep the hint pill until pinned, and close on Escape', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.waitForTimeout(1600);
    await page.locator('.qcard .imk[data-info="q-decision"]').hover();
    await assert.doesNotReject(page.locator('#infoPop:visible').waitFor());
    assert.match(await page.locator('#infoPop').innerText(), /待我决策/);
    assert.match(await page.locator('#infoPop').innerText(), /current_case_state = decision_ready/);
    assert.equal(await page.locator('#howto').isHidden(), false, 'hover must not dismiss the hint pill');

    await page.locator('.qcard .imk[data-info="q-decision"]').click();
    assert.equal(await page.locator('#howto').isHidden(), true, 'first pinned marker dismisses the hint pill');
    await page.mouse.move(10, 400);
    assert.equal(await page.locator('#infoPop').isHidden(), false, 'pinned popover survives mouse leave');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#infoPop').isHidden(), true);

    await page.locator('.vf-cell[data-stage="decision"]').hover();
    await assert.doesNotReject(page.locator('#infoPop:visible').waitFor());
    assert.match(await page.locator('#infoPop').innerText(), /决策就绪/);
    await page.keyboard.press('Escape');
  });
});

test('loading choreography settles into its final state and reduced motion renders it directly', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    await page.waitForTimeout(1600);
    const settled = await page.evaluate(() => ({
      console: getComputedStyle(document.querySelector('.console')).opacity,
      strip: getComputedStyle(document.querySelector('.dutystrip')).opacity,
      rail: getComputedStyle(document.querySelector('.rail')).opacity,
    }));
    assert.deepEqual(settled, { console: '1', strip: '1', rail: '1' });
  });

  await withPage({ width: 1440, height: 1000 }, async page => {
    const direct = await page.evaluate(() => ({
      console: getComputedStyle(document.querySelector('.console')).opacity,
      howtoAnimation: getComputedStyle(document.querySelector('#howto')).animationDuration,
      ledAnimation: getComputedStyle(document.querySelector('#stripLed')).animationDuration,
    }));
    assert.equal(direct.console, '1');
    assert.ok(parseFloat(direct.howtoAnimation) < 0.001, 'reduced motion must skip entrance animation');
    assert.ok(parseFloat(direct.ledAnimation) < 0.001, 'reduced motion must stop the LED pulse');
  }, { reducedMotion: 'reduce' });
});

test('role, scope and permission narrow the same case array', async () => {
  await withPage({ width: 1280, height: 900 }, async page => {
    assert.equal(await page.locator('#caseList .caserow').count(), 12);
    await page.locator('[data-role="frontline"]').click();
    const rows = page.locator('#caseList .caserow');
    assert.equal(await rows.count(), 3);
    assert.match(await page.locator('#caseDetail [data-role-field-profile]').innerText(), /一线责任人|本人任务/);
    assert.match(await page.locator('#caseDetail [data-evidence-access]').innerText(), /无权查看原始证据/);

    await page.locator('[data-role="regional"]').click();
    assert.equal(await page.locator('#caseList .caserow').count(), 3);
    await page.locator('.vf-cell[data-stage="governance_watch"]').click();
    await page.locator('[data-substate="risk_accepted"]').click();
    assert.equal(await page.locator('#caseList .caserow:visible').count(), 0);
    assert.match(await page.locator('#caseDetail').innerText(), /当前角色与筛选条件下没有可显示案件/);
    assert.doesNotMatch(await page.locator('#caseDetail').innerText(), /C-260724-\d{3}/);
  });
});

test('role actions stay neutral and unknown configuration fails closed', async () => {
  await withPage({ width: 1280, height: 900 }, async page => {
    for (const caseId of ['C-260724-006', 'C-260724-010']) {
      await page.locator(`.caserow[data-case-id="${caseId}"]`).click();
      const colors = await page.locator('#caseDetail [data-role-actions] .action-button.secondary')
        .evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color));
      assert.ok(colors.length > 0, `${caseId} should expose role actions`);
      assert.ok(colors.every(color => color === 'rgb(66, 86, 106)'),
        `${caseId} ordinary actions must stay neutral ink: ${colors.join(', ')}`);
    }

    const implementation = await page.evaluate(() => renderRoleActions.toString());
    assert.doesNotMatch(implementation, /\|\|\s*\[['"]打开案件['"]\]/);
    const unknownRoleMarkup = await page.evaluate(() => {
      const previousRole = ui.role;
      ui.role = 'unknown_role';
      const markup = renderRoleActions(demoCases.find(item => item.caseId === ui.caseId));
      ui.role = previousRole;
      return markup;
    });
    assert.match(unknownRoleMarkup, /动作配置不可用|停止显示操作入口/);
    assert.doesNotMatch(unknownRoleMarkup, /<button/);

    await page.evaluate(() => {
      demoCases.find(item => item.caseId === ui.caseId).currentCaseState = 'unknown_state';
      renderAll();
    });
    const actionRegion = page.locator('[data-role-actions]');
    assert.match(await actionRegion.innerText(), /动作配置不可用|停止显示操作入口/);
    assert.equal(await actionRegion.locator('button').count(), 0);
  });
});

test('keyboard focus survives stage and case rerenders', async () => {
  await withPage({ width: 1280, height: 900 }, async page => {
    const stage = page.locator('.vf-cell[data-stage="analysis"]');
    await stage.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.stage), 'analysis');

    const caseRow = page.locator('.caserow[data-case-id="C-260724-005"]');
    await caseRow.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement?.dataset.caseId), 'C-260724-005');
  });
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
]) {
  test(`duty console fits ${viewport.width}px without page overflow`, async () => {
    await withPage(viewport, async page => {
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        textLength: document.body.innerText.trim().length,
      }));
      assert.ok(dimensions.textLength > 1000, 'page should render substantial visible content');
      assert.ok(
        dimensions.scrollWidth <= dimensions.clientWidth + 1,
        `horizontal overflow: ${dimensions.scrollWidth} > ${dimensions.clientWidth}`,
      );
      if (viewport.width === 390) {
        const tracks = await page.locator('.console').evaluate(node => (
          getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length
        ));
        assert.equal(tracks, 1, 'mobile console should use one grid column');
      }
    });
  });
}

test('key text probes keep contrast at or above 4.5:1', async () => {
  await withPage({ width: 1440, height: 1000 }, async page => {
    const probes = await page.evaluate(() => {
      const backgroundOf = element => {
        let node = element;
        while (node) {
          const color = getComputedStyle(node).backgroundColor;
          if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
          node = node.parentElement;
        }
        return 'rgb(255, 255, 255)';
      };
      const pick = selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return { color: style.color, background: backgroundOf(element) };
      };
      return {
        'kicker 小题': pick('.panel-h .el'),
        '队列标题': pick('.qcard-h h3'),
        '队列副标': pick('.qsub'),
        '状态 pill': pick('.caserow .pill.state'),
        '高风险 pill': pick('.caserow .pill.risk-high'),
        '脱敏徽章': pick('.demo-tag'),
        '阶段格阶段名': pick('.vf-cell .vf-name'),
        '真相提示条': pick('.truth-note'),
        'hero 状态徽章': pick('.d-state strong'),
        '案件行元信息': pick('.caserow .cmeta'),
      };
    });
    for (const [name, probe] of Object.entries(probes)) {
      assert.ok(probe, `probe ${name} should exist`);
      const ratio = contrastRatio(probe.color, probe.background);
      assert.ok(ratio >= 4.5, `${name} contrast ${ratio.toFixed(2)}:1 (${probe.color} on ${probe.background})`);
    }
  });
});
