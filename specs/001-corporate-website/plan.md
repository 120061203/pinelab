# Implementation Plan: 松果創意 Pinelab 企業官網

**Branch**: `001-corporate-website` | **Date**: 2025-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-corporate-website/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立松果創意 Pinelab 企業官網，提供品牌形象展示、商品展示與管理功能。採用前後端分離架構，前端使用 Next.js (React + TypeScript)，後端使用 Django REST Framework，資料庫使用 PostgreSQL。MVP 階段重點在於商品展示功能，管理員透過 API 管理內容，暫時不實作前端管理介面。

## Technical Context

**Language/Version**: 
- Python 3.11+ (Django 後端)
- TypeScript 5.x (Next.js 前端)
- SQL (PostgreSQL 15+)

**Primary Dependencies**: 
- **後端**: Django 4.2+, Django REST Framework, django-cors-headers, Pillow (圖片處理)
- **前端**: Next.js 14+, React 18+, TypeScript, Tailwind CSS (建議)
- **資料庫**: PostgreSQL 15+
- **認證**: JWT (djangorestframework-simplejwt)
- **容器化**: Docker, Docker Compose
- **部署**: Zeabur

**Storage**: 
- PostgreSQL (主要資料庫)
- 本地檔案系統 (圖片儲存：`media/products/`)

**Testing**: 
- **後端**: pytest, pytest-django, pytest-cov, factory-boy
- **前端**: Jest, React Testing Library, @testing-library/jest-dom
- **整合測試**: Docker Compose test containers
- **CI/CD**: GitHub Actions

**Target Platform**: 
- Web 應用（桌面與行動裝置響應式）
- 瀏覽器支援：Chrome, Firefox, Safari, Edge (最新 2 個版本)
- 行動裝置：iOS Safari, Chrome Mobile (最新 2 個版本)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: 
- 首頁載入時間 < 3 秒（標準寬頻）
- API 回應時間 < 1 秒（商品列表篩選）
- 商品搜尋 < 2 秒
- 支援 100 個並發訪客無性能降級
- 圖片上傳處理 < 5 秒（單張 5MB 以內）

**Constraints**: 
- MVP 階段不實作 AI 推薦功能
- 不實作購物車與支付功能
- 管理員後台僅提供 API，不實作前端介面
- 圖片本地儲存（未來可擴充至雲端）
- 必須支援 RWD（響應式網頁設計）

**Scale/Scope**: 
- 初期商品數量：約 2 個
- 預期訪客：100+ 並發使用者
- 資料量：小型企業網站規模（< 10,000 商品）
- 管理員數量：1-5 人

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### 核心原則檢查

1. **模組化 (Modular)** ✅
   - 前後端分離架構符合模組化原則
   - 每個模組（Auth、Product、Contact）獨立開發與測試
   - Django apps 結構確保單一職責原則

2. **簡單化 (Simplicity)** ✅
   - 清晰的資料流：Next.js → Django REST → PostgreSQL
   - 統一 API 規範與命名規則（已定義在技術決策文件）
   - Docker Compose 管理所有服務

3. **可測試 (Testable)** ✅
   - 每個模組有明確的行為規格（SDD 中定義）
   - 前端與後端皆需自動化測試（Jest, Pytest）
   - CI/CD pipeline 自動執行測試

### 技術決策符合性

- ✅ API 設計遵循 RESTful 原則
- ✅ 資料庫設計正規化且關聯清晰
- ✅ 安全性機制完整（JWT + 簽章驗證）
- ⚠️ MD5 簽章建議升級至 HMAC-SHA256（技術決策文件中已提出）

### Gate 狀態

**✅ PASS** - 所有核心原則與約束條件都符合要求。技術架構清晰，模組化設計良好。

## Project Structure

### Documentation (this feature)

```text
specs/001-corporate-website/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # OpenAPI 規範
│   └── README.md        # API 文件說明
└── tasks.md               # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── pinelab/              # Django project
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── auth/             # 認證模組
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── products/         # 商品模組
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   ├── filters.py    # 篩選與搜尋
│   │   │   └── urls.py
│   │   ├── categories/       # 分類模組
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   ├── tags/             # 標籤模組
│   │   │   ├── models.py
│   │   │   ├── views.py
│   │   │   ├── serializers.py
│   │   │   └── urls.py
│   │   └── contacts/         # 聯絡表單模組
│   │       ├── models.py
│   │       ├── views.py
│   │       ├── serializers.py
│   │       └── urls.py
│   ├── core/                 # 核心共用功能
│   │   ├── authentication.py # JWT 認證
│   │   ├── permissions.py    # 權限控制
│   │   └── signatures.py    # MD5/HMAC 簽章驗證
│   └── media/                # 媒體檔案（gitignore）
│       └── products/
└── tests/
    ├── unit/
    │   ├── test_models.py
    │   ├── test_views.py
    │   └── test_serializers.py
    ├── integration/
    │   ├── test_api_endpoints.py
    │   └── test_auth_flow.py
    └── fixtures/
        └── sample_data.json

frontend/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx           # 首頁
│   │   ├── contact/
│   │   │   └── page.tsx       # 聯絡頁面
│   │   ├── products/
│   │   │   ├── page.tsx       # 商品列表
│   │   │   └── [id]/
│   │   │       └── page.tsx   # 商品詳情
│   │   └── layout.tsx         # 根布局
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── ProductFilter.tsx
│   │   ├── ContactForm.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── api.ts             # API 客戶端
│   │   ├── auth.ts            # 認證工具（管理員用）
│   │   └── signatures.ts      # MD5/HMAC 簽章生成
│   ├── types/
│   │   ├── product.ts
│   │   ├── category.ts
│   │   └── contact.ts
│   ├── mocks/                 # Mock 資料（MVP 階段）
│   │   ├── products.json
│   │   ├── categories.json
│   │   └── tags.json
│   └── styles/
│       └── globals.css
├── public/                    # 靜態資源
│   └── images/
└── tests/
    ├── unit/
    │   ├── components/
    │   └── lib/
    └── integration/
        └── pages/

infra/
├── docker-compose.yml         # 開發環境
├── docker-compose.prod.yml    # 生產環境
├── Dockerfile.backend
├── Dockerfile.frontend
└── .github/
    └── workflows/
        └── ci.yml             # CI/CD 流程

db/
└── migrations/                # 資料庫遷移（由 Django 管理）
```

**Structure Decision**: 
採用前後端分離的 Web 應用架構（Option 2），符合 SDD 規格中的架構導向。後端使用 Django 模組化設計（apps 結構），前端使用 Next.js App Router。所有服務透過 Docker Compose 統一管理，便於開發與部署。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

目前沒有違反 Constitution 的複雜性需要特別說明。架構設計遵循模組化、簡單化和可測試原則。

---

## Phase 0: 研究與決策（已完成）

✅ **研究文件**: `research.md`  
✅ **狀態**: 所有技術決策已明確，無需澄清項目

所有技術決策已整合並記錄在 `research.md` 中，基於 `SDD/TECHNICAL_DECISIONS.md` 的 Senior Engineer 審查結果。

---

## Phase 1: 設計與合約（已完成）

✅ **資料模型**: `data-model.md`  
✅ **API 合約**: `contracts/openapi.yaml`  
✅ **快速開始**: `quickstart.md`  
✅ **Agent Context**: 已更新 Cursor IDE context

### 生成的設計文件

1. **資料模型設計** (`data-model.md`)
   - 完整的實體定義與關聯關係
   - 驗證規則與業務邏輯
   - 索引設計與效能優化

2. **API 合約** (`contracts/`)
   - OpenAPI 3.0 規範
   - 完整的端點定義
   - 請求/回應結構

3. **快速開始指南** (`quickstart.md`)
   - 環境設置步驟
   - 開發工作流程
   - 常見問題解決

### Constitution 複查（Phase 1 後）

✅ **PASS** - 所有設計文件符合 Constitution 原則：
- 模組化架構清晰
- 設計簡單直接
- 可測試性良好
