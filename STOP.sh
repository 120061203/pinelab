#!/bin/bash
# 停止服務腳本

echo "🛑 停止 Pinelab 專案服務..."

cd infra
docker-compose down

echo "✅ 服務已停止"
