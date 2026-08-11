#!/usr/bin/env bash
# ==========================================================
# 类型检查脚本（vue-tsc -b）
# 输出统一写入 logs/typecheck.log
# ==========================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${ROOT_DIR}/logs"
LOG_FILE="${LOG_DIR}/typecheck.log"

mkdir -p "${LOG_DIR}"

# 非交互环境下跳过 pnpm 的移除确认
export CI=true

echo "==> 开始类型检查: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${LOG_FILE}"
cd "${ROOT_DIR}"
pnpm exec vue-tsc -b --force 2>&1 | tee -a "${LOG_FILE}"
echo "==> 类型检查完成: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "${LOG_FILE}"
