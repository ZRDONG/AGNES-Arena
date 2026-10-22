# Running AGNES Arena

Node.js 24.10–24.x、pnpm 10；原生双玩家配置使用 macOS 的 script 命令。

## Local arena

```bash
npm ci
npm run battle:build
npm run battle:test
npm run jev:test
npm run battle:serve
```
浏览器打开 **http://127.0.0.1:8788/**。规则引擎、对战界面和工具测试由本地 Node.js 进程提供。

## Two live AGH players

```bash
export AGH_SOURCE_DIR=/opt/agnes-harness
(cd "$AGH_SOURCE_DIR" && pnpm install --frozen-lockfile && pnpm --filter @agnes/cli build:local)
python scripts/prepare-agent.py
cp .env.example .env
npm run battle:live
```
在 `.env` 中填入模型服务和 Jev 的访问参数；模板中的实时对战地址为 `http://127.0.0.1:18795`。`models.example.json` 定义玩家显示名、路由和模型请求；每位玩家使用项目内独立 AGH 配置。

## Test commands

```bash
npm run battle:test
npm run jev:test
```

The native wire-client integration check uses `AGH_SOURCE_DIR` when provided. The project-only test suite runs without AGH; the external integration check is skipped until that dependency is configured.
