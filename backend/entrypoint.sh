#!/bin/bash
set -euo pipefail

PORT="${PORT:-8080}"
NODE_ENV="${NODE_ENV:-production}"

echo "[backend] Starting Node.js backend on port ${PORT}..."
cd /workspace
npm start
