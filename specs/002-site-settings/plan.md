# Implementation Plan: 網站設定管理

**Branch**: `002-site-settings` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-site-settings/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

實作網站設定管理功能，允許管理員從後台動態更新品牌資訊（Logo、Hero橫幅、品牌名稱、標語）、服務項目、最新消息、聯絡資訊與外部連結，以及控制商品價格顯示。採用 Django REST Framework 作為後端 API，Next.js 作為前端框架，遵循現有專案架構模式。新增三個核心實體：SiteSettings（單例）、News（最新消息）、Service（服務項目），並提供公開和管理 API 端點。

## Technical Context

**Language/Version**: 
- Python 3.11+ (Django 後端)
- TypeScript 5.x (Next.js 前端)
- SQL (PostgreSQL 15+)

**Primary Dependencies**: 
- **後端**: Django 4.2+, Django REST Framework, django-cors-headers, Pillow (圖片處理)
- **前端**: Next.js 14+, React 18+, TypeScript, Tailwind CSS
- **資料庫**: PostgreSQL 15+
- **認證**: JWT (djangorestframework-simplejwt)
- **圖標字體**: Font Awesome 或 Material Icons（前端整合）
- **容器化**: Docker, Docker Compose
- **部署**: Zeabur

**Storage**: 
- PostgreSQL (主要資料庫：SiteSettings, News, Service)
- 本地檔案系統 (媒體檔案儲存：`media/site/` 用於 Logo、Hero橫幅、服務項目圖標)

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
- 網站設定 API 回應時間 P95 < 200ms（讀取設定）
- 最新消息在首頁載入時間增加不超過 500ms
- 圖片上傳處理 < 5 秒（單張 5MB 以內）
- 支援 100 個並發訪客無性能降級

**Constraints**: 
- 必須遵循現有專案架構模式（Django apps 結構、DRF ViewSets、Next.js App Router）
- 必須與現有 admin portal 整合
- 必須符合 Constitution 原則（程式品質、測試標準、UX 一致性、效能需求）
- 單元測試覆蓋率 ≥ 80%
- API 回應格式必須統一（status/data/message 結構）

**Scale/Scope**: 
- SiteSettings：單例模式（系統中只存在一筆記錄）
- News：預期 < 100 則消息（首頁顯示最新 5 則）
- Service：預期 < 20 個服務項目
- 媒體檔案：Logo (SVG, ≤2MB), Hero橫幅 (≤5MB), 服務圖標 (≤1MB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ 程式品質 Gate
- **模組化設計**: 新增 `apps/site_settings` Django app，遵循 SRP 原則
- **程式碼風格**: 遵循 Python PEP 8, TypeScript ESLint 規則
- **靜態分析**: 所有程式碼必須通過 linter 檢查
- **複雜度控制**: 函數圈複雜度 ≤ 10，單一檔案行數 ≤ 500 行
- **文件完整性**: 所有公開 API、類別和方法必須包含文件字串

### ✅ 測試標準 Gate
- **TDD 流程**: 測試先寫 → 實作功能 → 重構
- **測試覆蓋率**: 單元測試覆蓋率 ≥ 80%，關鍵業務邏輯 ≥ 90%
- **測試分類**: 單元測試（Model、Serializer、ViewSet）、整合測試（API 端點）、前端測試（元件、頁面）
- **測試獨立性**: 所有測試可獨立執行
- **測試自動化**: CI/CD pipeline 自動執行測試

### ✅ 使用者體驗一致性 Gate
- **設計系統**: 遵循現有 Tailwind CSS 設計系統
- **響應式設計**: 所有頁面支援桌面（≥1024px）、平板（768-1023px）、手機（320-767px）
- **互動一致性**: 與現有 admin portal 保持一致的操作體驗
- **錯誤處理**: 友善、明確的錯誤訊息
- **載入狀態**: 所有非同步操作顯示載入狀態

### ✅ 效能需求 Gate
- **API 回應時間**: P95 < 200ms（網站設定讀取）
- **並發能力**: 支援 100+ 並發使用者
- **資源優化**: 圖片壓縮和優化
- **快取策略**: 合理使用快取機制

**Status**: ✅ All gates passed. Ready for Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/002-site-settings/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── openapi.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── apps/
│   │   └── site_settings/          # 新增：網站設定 Django app
│   │       ├── __init__.py
│   │       ├── models.py            # SiteSettings, News, Service 模型
│   │       ├── serializers.py      # 公開 API 序列化器
│   │       ├── admin_serializers.py # 管理 API 序列化器
│   │       ├── views.py             # 公開 API ViewSets
│   │       ├── admin_views.py      # 管理 API ViewSets
│   │       ├── urls.py              # 公開 API 路由
│   │       ├── admin_urls.py       # 管理 API 路由
│   │       ├── filters.py           # 篩選器（如需要）
│   │       ├── permissions.py        # 權限類別（如需要）
│   │       └── migrations/         # 資料庫遷移
│   │           └── 0001_initial.py
│   └── pinelab/
│       └── urls.py                  # 更新：註冊新路由
└── tests/
    ├── unit/
    │   └── test_site_settings_*.py # 單元測試
    └── integration/
        └── test_site_settings_api.py # 整合測試

frontend/
├── src/
│   ├── app/
│   │   ├── admin-portal/
│   │   │   ├── site-settings/      # 新增：網站設定管理頁面
│   │   │   │   └── page.tsx
│   │   │   ├── news/               # 新增：最新消息管理頁面
│   │   │   │   ├── page.tsx        # 列表頁
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx    # 編輯頁
│   │   │   └── services/           # 新增：服務項目管理頁面
│   │   │       ├── page.tsx        # 列表頁
│   │   │       └── [id]/
│   │   │           └── page.tsx    # 編輯頁
│   │   └── page.tsx                # 更新：整合網站設定資料
│   ├── components/
│   │   ├── HeroSection.tsx         # 新增：Hero section 元件
│   │   ├── NewsSection.tsx         # 新增：最新消息區塊
│   │   ├── ServicesSection.tsx     # 新增：服務項目區塊
│   │   └── admin/
│   │       ├── SiteSettingsForm.tsx # 新增：網站設定表單
│   │       ├── NewsForm.tsx         # 新增：最新消息表單
│   │       └── ServiceForm.tsx      # 新增：服務項目表單
│   ├── lib/
│   │   ├── api.ts                  # 更新：新增網站設定 API
│   │   └── admin-api.ts            # 更新：新增管理 API
│   └── types/
│       ├── site-settings.ts        # 新增：網站設定型別
│       ├── news.ts                  # 新增：最新消息型別
│       └── service.ts               # 新增：服務項目型別
└── tests/
    ├── unit/
    │   └── components/
    │       └── *.test.tsx           # 元件測試
    └── integration/
        └── pages/
            └── *.test.tsx           # 頁面測試
```

**Structure Decision**: 採用現有專案結構，新增 `apps/site_settings` Django app 和對應的前端頁面與元件。遵循現有的模組化設計原則，保持前後端分離架構。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

無違規項目。所有設計決策均符合 Constitution 原則。
