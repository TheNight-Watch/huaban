#!/bin/bash
set -euo pipefail

# CRA 静态产物启动入口（含兜底构建，不建议生产长期使用）

PORT="${PORT:-3000}"
# 使用环境变量，支持灵活配置
APP_DIR="${APP_DIR:-/home/devbox/project/pilates-app}"
BUILD_DIR="$APP_DIR/build"

echo "[entrypoint] Starting frontend service..."
echo "[entrypoint] APP_DIR: $APP_DIR"
echo "[entrypoint] BUILD_DIR: $BUILD_DIR"
echo "[entrypoint] PORT: $PORT"

# 检查应用目录是否存在
if [ ! -d "$APP_DIR" ]; then
  echo "[entrypoint] ERROR: $APP_DIR not found."
  echo "[entrypoint] Please ensure the pilates-app directory is uploaded."
  exit 1
fi

# 若缺少构建产物，则现场构建
if [ ! -d "$BUILD_DIR" ]; then
  echo "[entrypoint] Build directory not found. Building now..."
  cd "$APP_DIR"
  
  # 安装依赖
  if [ -f package-lock.json ]; then
    echo "[entrypoint] Installing dependencies with npm ci..."
    npm ci --no-audit --no-fund
  else
    echo "[entrypoint] Installing dependencies with npm install..."
    npm install --no-audit --no-fund
  fi
  
  # 构建项目
  echo "[entrypoint] Building React app..."
  npm run build
  
  # 验证构建结果
  if [ ! -d "$BUILD_DIR" ]; then
    echo "[entrypoint] ERROR: Build failed - $BUILD_DIR not created."
    exit 1
  fi
  
  echo "[entrypoint] Build completed successfully."
else
  echo "[entrypoint] Using existing build at $BUILD_DIR"
fi

# 启动静态文件服务
echo "[entrypoint] Serving React app on 0.0.0.0:${PORT}..."
exec npx --yes serve -s "$BUILD_DIR" -l tcp://0.0.0.0:${PORT}
