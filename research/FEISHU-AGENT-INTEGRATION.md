# 飞书与外部企业 Agent 协作能力研究

核验日期：2026-07-17

## 结论

飞书适合成为企业 Agent 的**人机协作控制面**，但不是外部 Agent 的完整运行时，也不是 ERP 的交易与主数据系统。

推荐架构：

```text
飞书应用与权限
-> Channel SDK 接收消息、卡片和评论事件
-> 自建 Agent/Harness 负责模型、状态、会话、规划、工具调用、重试和验证
-> lark-cli 操作飞书对象，ERP/SAP/SaaS 连接器操作外部系统
-> 飞书卡片、任务和审批承接人类责任门
-> 审计、指标和复盘结果回写飞书与业务知识库
```

## 必须区分的两个 CLI

| 工具 | 准确定位 | 当前版本 | 适用范围 |
| --- | --- | ---: | --- |
| `lark-cli` / `@larksuite/cli` | 飞书官方、面向人类和 AI Agent 的执行层 CLI | `v1.0.71`，2026-07-16 发布 | 消息、文档、Base、表格、日历、邮箱、任务、会议、审批、通讯录等 |
| `opdev` / `@lark-opdev/cli` | 飞书开发者工具命令行 | `3.4.4` | Gadget/Block 项目的创建、预览、上传和打开 |

用户所说的“飞书 CLI”在外部 Agent 协作语境中应指 `lark-cli`。`opdev` 不是 Agent 工具调用层，也不是后端或 Harness 部署器。

当前版本通过 npm、GitHub tag 和官方仓库交叉核验：

- <https://github.com/larksuite/cli>
- <https://www.npmjs.com/package/@larksuite/cli>
- <https://www.npmjs.com/package/@lark-opdev/cli>

## lark-cli 的作用

### 安装与认证

```bash
npx @larksuite/cli@latest install
lark-cli config init --new
lark-cli auth login --recommend
lark-cli auth status
```

它应安装在 Agent 实际运行的主机或容器内。不存在“用 CLI 把 Harness 部署到飞书”的能力。

### 调用能力

`lark-cli` 提供三层调用：

1. `+shortcut`：为人类和 Agent 封装的常用操作，参数较短，支持智能默认值和 dry-run。
2. API 命令：与飞书开放平台端点对应的精选命令。
3. `lark-cli api`：通用 OpenAPI 调用，用于未被上层命令覆盖的端点。

主要能力包括：

- 即时消息与群聊；
- 文档、云空间、Markdown、知识库和妙记；
- 多维表格、电子表格、视图、表单、仪表盘和记录；
- 任务、任务清单、子任务、评论和提醒；
- 日历、会议、邮箱、通讯录、考勤、OKR 和审批；
- WebSocket 实时事件消费；
- JSON、NDJSON、CSV 等结构化输出；
- `--as user` / `--as bot` 身份切换；
- `--dry-run`、schema 自省和稳定错误 envelope。

### 身份与权限

- `user` 身份需要应用后台开通 scope，并由具体用户 OAuth 授权。
- `bot` 身份使用应用凭据，只能访问应用被允许访问的资源。
- Bot 默认看不到用户个人日历、云空间或邮箱，也不能天然代表某位员工行动。
- 应用“谁可以使用”与“能读取哪些数据”是两套控制面，通常还涉及应用发布和管理员审核。
- Base、文档、任务等对象仍有资源级权限；安装 CLI 不等于获得租户管理员权限。

## Channel SDK：飞书会话接入层

官方 Node SDK：`@larksuite/channel`，当前仓库版本为 `0.4.0`。

- 仓库：<https://github.com/larksuite/channel-sdk-node>
- 官方文档：<https://open.feishu.cn/document/mcp_open_tools/integrating-agents-with-feishu/integrate-feishu-channel>

已验证能力：

- WebSocket 长连接、自动重连、心跳和 webhook 模式；
- 单聊、群聊、卡片动作、文档评论、表情和机器人入群事件；
- 消息格式归一化、引用消息展开、媒体上传和流式卡片回复；
- `requireMention`、私聊/群聊白名单、消息去重、过期丢弃、按群串行；
- `botLoopGuard`，降低多个机器人互相触发形成死循环的风险；
- 区分用户与 Bot，并支持查询群内用户与机器人。

Channel SDK 明确不承担：

- 模型与 Prompt 管理；
- Agent loop 与工具选择；
- 多用户隔离和 session 持久化；
- 企业业务状态机；
- 外部 ERP/SAP/SaaS 连接；
- 凭据与审计系统的完整生产治理。

这些正是外部 Harness 应负责的部分。

## 飞书产品在 Agent 系统中的职责

| 飞书能力 | 建议职责 | 不应承担的职责 |
| --- | --- | --- |
| IM / Channel SDK | 人类和 Agent 的消息入口、卡片交互、状态反馈 | 长期业务状态与 Agent 推理 |
| 多维表格 Base | 轻量业务台账、模拟数据、运营看板、流程可视化 | 大规模 ERP 交易账与复杂库存一致性 |
| 文档 / Wiki / 妙记 | 规则、会议、决策依据、复盘和知识沉淀 | 无验证的唯一事实源 |
| 任务 | 负责人、子任务、依赖、进度、评论和提醒 | 自动判定高风险业务责任 |
| 审批 | 价格、资源、权限等高风险动作的人类责任门 | 无限制自动审批 |
| 通讯录 / 组织架构 | 人类用户、部门、用户组、单位和角色 | 把 Bot 原生变成组织树中的员工节点 |
| Aily | 可选的飞书原生智能体能力 | 外部 Harness 的必选运行时 |

### “Agent 成为组织节点”的准确表述

飞书组织架构的公开资源是用户、部门、用户组、单位和角色。Agent/Bot 是应用机器人，不是可直接挂到组织树中的“数字员工”。

可落地的做法是：

1. 沿用飞书组织、群组和角色作为人类责任结构；
2. 将应用机器人加入允许的群聊；
3. 在自建的 work graph 中记录 Agent 属于哪个业务团队、可调用哪些工具、需要谁审批；
4. Agent 用卡片、任务、评论和审批与人协作。

## 事件与 Harness 可靠性

飞书事件通常按至少一次语义投递，不能假设每个事件只出现一次。长耗时 Agent 工作也不应堵塞事件回调。

推荐处理：

```text
飞书事件到达
-> 3 秒内完成接收确认
-> 按 event_id 幂等去重
-> 写入任务队列
-> Harness 在后台执行
-> 每个工具动作记录输入、身份、权限和结果
-> 高风险写操作进入飞书审批/卡片确认
-> 结果回写并更新业务状态
```

`lark-cli event consume` 还提供 NDJSON 输出、ready marker、超时/事件数边界和结构化退出码，适合被外部 Agent 作为受控子进程调用。

## 企业级安全边界

`lark-cli` 官方明确警告：Agent 可能出现幻觉、提示词注入、越权操作和敏感数据泄露；用户授权后，Agent 可能在授权范围内以该用户身份执行操作。官方默认建议把它作为私人助手，不要未经治理直接放入开放群聊。

公司级使用必须增加：

1. 群聊入口使用 Bot 身份和最小 scope，避免默认使用高权限用户身份；
2. `requireMention`、群白名单、去重与 Bot 循环保护；
3. 命令白名单、按域/风险/身份的 fail-closed 策略；
4. 写操作 dry-run，高风险动作必须人工确认或审批；
5. 不把 raw API 直接暴露给模型；
6. 凭据与 Agent 沙箱分离，记录统一审计日志；
7. 租户、用户、会话和业务任务隔离；
8. 比赛 Demo 使用赛事隔离租户和合成数据。

`lark-cli` 的企业扩展机制提供 Credential、Transport、Restrict、Observer、Wrap 和生命周期钩子，可用于接入 Vault、统一审计、命令裁剪、风险等级、身份限制、限流与写操作审批。但官方 sidecar 是参考实现，不是可以直接宣称生产可用的完整安全产品。

## 对圣农命题的映射

```text
业务员/区域/集团成员
        |
        v
飞书群、卡片、任务、审批
        |
        v
Channel SDK 事件与交互
        |
        v
自建 Harness Loop
  - 观察 Agent
  - 诊断 Agent
  - 策略 Agent
  - 执行 Agent
  - 验证/复盘 Agent
        |
        +---- lark-cli：消息、Base、任务、文档、审批
        |
        +---- 模拟 ERP/POS/经销商/价格巡检适配器
```

飞书中的人类组织仍是“业务员—区域—集团”；Agent 不是替代这些岗位，而是推动信息、决策和任务在正确责任人之间流动。原有系统在第一阶段继续保存订单、价格、库存和经销商主数据，Harness 负责跨系统行动闭环。

## 不能过度承诺的能力

- `lark-cli` 不能天然替代 ERP 的交易账、库存、财务和主数据一致性。
- 多维表格自动化公开 API 不能据此宣称可以编程重建全部流程节点。
- Aily 能力可能受租户产品开通、同租户要求和应用可见范围限制。
- 远程 MCP 的公开能力范围与稳定性不足以作为完整企业管理执行面。
- Channel SDK 较新，目标租户中的权限、断线重连、重复事件、限流和多消息类型仍需 E2E 验证。

## 主要官方证据

- [Agent 集成能力总览](https://open.feishu.cn/document/mcp_open_tools/overview-of-lark-agent-integration-capabilities)
- [Agent 版飞书 CLI](https://open.feishu.cn/document/mcp_open_tools/feishu-cli-let-ai-actually-do-your-work-in-feishu)
- [CLI 企业扩展机制](https://open.feishu.cn/document/mcp_open_tools/feishu-cli/embed-feishu-cli-in-agent)
- [larksuite/cli 与安全警告](https://github.com/larksuite/cli#security--risk-warnings-read-before-use)
- [Channel SDK](https://open.feishu.cn/document/mcp_open_tools/integrating-agents-with-feishu/integrate-feishu-channel)
- [一键创建智能体应用](https://open.feishu.cn/document/mcp_open_tools/integrating-agents-with-feishu/overview)
- [Aily 自定义智能体](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/aily-v1/agent/agentuseguide)
- [事件订阅](https://open.feishu.cn/document/ukTMukTMukTM/uUTNz4SN1MjL1UzM)
- [多维表格](https://open.feishu.cn/document/ukTMukTMukTM/uUDN04SN0QjL1QDN/bitable-overview)
- [任务](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/task-v2/overview)
- [组织架构](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/directory-v1/overview)
- [审批](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/approval-v4/approval-overview)
- [另一套 opdev CLI](https://open.feishu.cn/document/uYjL24iN/uEzMzUjLxMzM14SMzMTN/ide-with-commands)

## 验证状态

- 公开产品与开源工具能力：`verified`。
- npm/GitHub 当前版本：`verified`，但属于会变化的运行时事实。
- 本用户当前飞书租户权限、Aily 套餐和应用审核状态：`unknown`。
- 圣农或其他目标企业的真实接口、数据字段和权限：`unknown`。
- 在赛事专属租户中的完整 E2E：`not executed`。
