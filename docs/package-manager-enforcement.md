# 强制使用 pnpm + Node 版本约束的机制说明

> 本文档说明本项目"只能使用 pnpm 安装依赖"及"Node 版本必须满足要求"的强制机制、工作原理及注意事项。

## 背景

本项目基于 pnpm（见 `pnpm-lock.yaml`、`.npmrc` 中的 pnpm 配置）。为防止误用 npm/yarn 安装依赖导致依赖树错乱，
以及团队 Node 版本不统一导致构建异常，项目配置了多重强制机制。

## 强制机制组成

| 配置位置 | 内容 | 作用 |
|---|---|---|
| `package.json` | `"packageManager": "pnpm@11.21.0"` | 声明标准包管理器；启用 corepack 的环境会强制校验，npm 会给出警告 |
| `package.json` | `engines.node: ">=22.23.2"` | **Node 版本约束**（npm 12 的最低要求；Node 20 已 EOL 不再支持） |
| `package.json` | `engines.pnpm: ">=11.0.0"` | pnpm 自身版本下限 |
| `package.json` | `scripts["pnpm:devPreinstall"]` | **pnpm 侧强制点**（pnpm 11 的 root 专属生命周期钩子） |
| `package.json` | `scripts.preinstall` | **npm 侧强制点**（npm 每次 install 必执行） |
| `scripts/check-package-manager.cjs` | 检查脚本 | ① Node 版本校验 ② 通过 `npm_execpath` 判断是否为 pnpm，否则报错退出码 1 |
| `.npmrc` | `engine-strict=true` | 让 npm/pnpm 对**依赖**的 engines 校验从警告升级为失败 |

> ⚠️ `pnpm:devPreinstall` 与 `preinstall` 指向同一个检查脚本，分别服务 pnpm 与 npm。

## 工作原理

### 拦截流程（npm 12+，方案 A，无 package-lock.json）

```
npm i / yarn / bun
  → npm 12 不再误判 pnpm 符号链接（已修复）
  → 解析依赖树
  → preinstall 钩子触发
  → ❌ 本项目强制使用 pnpm 安装依赖！（退出码 1）
```

### 拦截流程（npm 10/11，方案 B，需 package-lock.json）

```
npm i（npm 10/11）
  → 读取 package-lock.json（本地，毫秒级）→ 以它为基线增量解析（仅 fetch 缺失部分）
  → preinstall 钩子触发
  → ❌ 本项目强制使用 pnpm 安装依赖！（退出码 1）
```

> 方案 B 的根因：npm 10/11 无法正确识别 pnpm 的 `node_modules` 结构（顶层为指向 `.pnpm`
> 虚拟存储的符号链接）。**若无根目录的 `package-lock.json`**，npm 会把符号链接误判为
> workspace 包，把已安装包的 devDependencies（如 element-plus 的 babel/mocha/knip 等）全部拉入解析，
> 导致长时间"转圈"或 ERESOLVE 报错。lockfile 一旦存在（哪怕过期），npm 就始终以它为基线增量解析。

### 拦截流程（pnpm）

```
pnpm install / pnpm add（依赖树有变化时）
  → pnpm:devPreinstall 钩子触发（任何依赖安装之前）
  → Node 版本校验：不满足 engines.node 则报错中断（退出码 1）
  → pnpm 校验：npm_execpath 不指向 pnpm 则报错
  → ✅ 放行，继续安装
```

### Node 版本校验为何放在脚本里（关键知识点）

实测发现（pnpm 11.21）：

1. **pnpm 的 `engine-strict` 只管依赖的 engines**，对 root 项目自身的 `engines.node` 不满足时**只警告不拒绝**。
2. **pnpm 11 不执行 root 的 `preinstall` 钩子**（supply-chain 安全模型的一部分），因此 pnpm 侧必须用
   `pnpm:devPreinstall`（pnpm 11 新增的 root 专属钩子）作为强制点。
3. `pnpm:devPreinstall` 在"依赖树无变化（Already up to date）"时会跳过——此时没有安装动作，无破坏风险，可接受。
4. 检查脚本手写 semver range 匹配（支持 `^x.y.z` / `>=x.y.z` / `\|\|` 组合），因为 preinstall 阶段
   `node_modules` 可能不存在，不能依赖 semver 包。

## 已验证的行为（npm 10.9.3 / pnpm 11.21.0 / Node 22.18）

| 场景 | 结果 |
|---|---|
| `npm i`（npm 12，无 package-lock.json） | 解析后立即被 preinstall 拦截（用户实测） |
| `npm i`（npm 10/11 + package-lock.json，依赖无变化） | 秒级被 preinstall 拦截 |
| `npm i`（npm 10/11 + package-lock.json，`pnpm add` 新依赖后） | 秒级被拦截；npm 仅增量解析新包，且会自动把 lockfile 同步到与 package.json 一致 |
| `npm i`（npm 10/11，无 package-lock.json） | 转圈/ERESOLVE 后失败（最终仍拦截，但报错不友好）——方案 B 需避免 |
| `pnpm add`（Node 版本不满足） | `pnpm:devPreinstall` 报 Node 错误，**安装中断**（exit 1） |
| `pnpm install`（依赖有变化，Node 满足） | `pnpm:devPreinstall` 校验放行，正常安装 |
| `pnpm install`（Already up to date） | 跳过钩子（无安装动作，无危害） |
| `pnpm install`（依赖的 engines 不满足） | `engine-strict` 拒绝安装 |

## 已知边界

- `npm install --ignore-scripts` 可绕过 preinstall，但此类用法属于主动破坏约定。
- `pnpm:devPreinstall` 仅在**本地** `pnpm install` 时执行（CI/CD 环境不执行），CI 的 Node 版本由 CI 配置保证。
- npm 12 不内置在任何 Node 版本中（Node 24 带 npm 11.16、Node 26 带 npm 11.17），需单独安装 `npm i -g npm@12`。
- 若团队存在 Node < 22.23.2 的环境（无法使用 npm 12），需退回方案 B：补回 package-lock.json 并随依赖变更同步。
- npm 对 `.npmrc` 中 pnpm 专属配置（如 `verify-deps-before-run`）会打印 Unknown config 警告，属正常现象，不影响拦截。
