#!/usr/bin/env node
/**
 * 强制使用 pnpm 安装依赖 + 校验 Node 版本（package.json 生命周期钩子）
 * 双钩子入口（pnpm / npm 各管各的）：
 *   1. pnpm:devPreinstall —— pnpm 11 的 root 专属钩子，依赖树有变化时在安装前执行
 *   2. preinstall —— npm 每次 install 必执行
 *
 * 校验内容（顺序）：
 *   1. Node 版本：必须满足 package.json engines.node 声明的范围（单一事实来源）
 *      说明：pnpm 的 engine-strict 只校验依赖的 engines，管不住 root 项目自身的 engines，
 *      所以这里手写 range 匹配（preinstall 时 node_modules 可能不存在，不能依赖 semver 包）。
 *   2. 包管理器：npm_execpath 必须指向 pnpm（否则 npm/yarn 安装直接失败）
 */

const fs = require('fs')
const path = require('path')

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'))

// ================= Node 版本校验 =================

/** '22.18.0' -> [22, 18, 0] */
function parseVersion(v) {
    return v.split('.').map(Number)
}

/** a 与 b 比较：大于返回 1，小于返回 -1，相等返回 0 */
function compare(a, b) {
    for (let i = 0; i < 3; i++) {
        if (a[i] !== b[i]) return a[i] > b[i] ? 1 : -1
    }
    return 0
}

/**
 * 匹配 semver 范围，支持以 '||' 连接的多子句，子句支持 '^x.y.z' 与 '>=x.y.z'
 * （覆盖本项目 engines 使用的格式：^20.19.0 || >=22.12.0）
 */
function matchesRange(version, range) {
    return range.split('||').some((clause) => {
        clause = clause.trim()
        if (clause.startsWith('^')) {
            const req = parseVersion(clause.slice(1))
            return version[0] === req[0] && compare(version, req) >= 0
        }
        if (clause.startsWith('>=')) {
            return compare(version, parseVersion(clause.slice(2))) >= 0
        }
        return false
    })
}

const nodeRange = pkg.engines?.node
const current = parseVersion(process.versions.node)

if (nodeRange && !matchesRange(current, nodeRange)) {
    console.error('')
    console.error('❌ Node 版本不满足项目要求！')
    console.error(`   当前版本: v${process.versions.node}`)
    console.error(`   要求版本: ${nodeRange}`)
    console.error('   请使用 nvm / fnm 等工具切换到受支持的 Node 版本后再试。')
    console.error('')
    process.exit(1)
}

// ================= 包管理器校验 =================

const npmExecPath = (process.env.npm_execpath ?? '').toLowerCase()

if (npmExecPath.includes('pnpm')) {
    console.log('✅ 检测到 pnpm，继续安装...')
    process.exit(0)
}

const used = npmExecPath || '未知的包管理器（如 bun / 直装脚本等）'
console.error('')
console.error('❌ 本项目强制使用 pnpm 安装依赖！')
console.error(`   当前检测到: ${used}`)
console.error('   请改用以下命令安装:')
console.error('       pnpm install')
console.error('')
process.exit(1)
