#!/bin/bash
# 快速啟動腳本

echo "🚀 啟動 Pinelab 專案..."
echo ""

# 檢查 Docker 是否運行
if ! docker info > /dev/null 2>&1; then
    echo "❌ 錯誤: Docker 未運行，請先啟動 Docker Desktop"
    exit 1
fi

# 檢查環境變數文件
if [ ! -f "backend/.env" ]; then
    echo "📝 複製後端環境變數文件..."
    cp backend/.env.example backend/.env
    echo "⚠️  請編輯 backend/.env 設定環境變數"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 複製前端環境變數文件..."
    cp frontend/.env.example frontend/.env.local
    echo "⚠️  請編輯 frontend/.env.local 設定環境變數"
fi

# 啟動服務
echo "🐳 啟動 Docker Compose 服務..."
cd infra
docker-compose up -d

echo ""
echo "⏳ 等待服務啟動..."
sleep 5

# 執行遷移
echo "📦 執行資料庫遷移..."
docker-compose exec -T backend python manage.py migrate

echo ""
echo "✅ 啟動完成！"
echo ""
echo "📍 服務地址："
echo "   - 前端: http://localhost:3000"
echo "   - 後端 API: http://localhost:8000/api"
echo "   - Django Admin: http://localhost:8000/admin"
echo "   - 健康檢查: http://localhost:8000/api/health/"
echo ""
echo "💡 提示："
echo "   - 查看日誌: docker-compose logs -f"
echo "   - 停止服務: docker-compose down"
echo "   - 建立管理員: docker-compose exec backend python manage.py createsuperuser"
