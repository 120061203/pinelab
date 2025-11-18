# Tasks: 網站設定管理

**Input**: Design documents from `/specs/002-site-settings/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Tests**: Following TDD approach - tests are included and should be written FIRST before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/apps/site_settings/`
- **Frontend**: `frontend/src/`
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Django app creation

- [X] T001 Create Django app structure for site_settings in backend/src/apps/site_settings/
- [X] T002 [P] Create __init__.py in backend/src/apps/site_settings/__init__.py
- [X] T003 [P] Create migrations directory in backend/src/apps/site_settings/migrations/__init__.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models and migrations that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Create SiteSettings model in backend/src/apps/site_settings/models.py
- [X] T005 [P] Create News model in backend/src/apps/site_settings/models.py
- [X] T006 [P] Create Service model in backend/src/apps/site_settings/models.py
- [X] T007 Create initial migration file in backend/src/apps/site_settings/migrations/0001_initial.py
- [ ] T008 Run migration: python manage.py migrate site_settings
- [X] T009 [P] Create SiteSettings get_instance class method in backend/src/apps/site_settings/models.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - 管理品牌資訊與形象 (Priority: P1) 🎯 MVP

**Goal**: 管理員可以在後台管理品牌名稱、品牌標語、Logo和Hero橫幅，這些資訊會自動顯示在網站首頁和頁尾

**Independent Test**: 在後台更新品牌資訊，然後查看首頁和頁尾是否顯示更新後的內容

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for SiteSettings model in backend/tests/unit/test_site_settings_model.py
- [ ] T011 [P] [US1] Unit test for SiteSettingsSerializer in backend/tests/unit/test_site_settings_serializer.py
- [ ] T012 [P] [US1] Integration test for GET /api/site-settings/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T013 [P] [US1] Integration test for PUT /api/admin/site-settings/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T014 [P] [US1] Unit test for HeroSection component in frontend/tests/unit/components/HeroSection.test.tsx

### Implementation for User Story 1

- [X] T015 [US1] Create SiteSettingsSerializer in backend/src/apps/site_settings/serializers.py
- [X] T016 [US1] Create SiteSettingsAdminSerializer in backend/src/apps/site_settings/admin_serializers.py
- [X] T017 [US1] Create SiteSettingsViewSet in backend/src/apps/site_settings/views.py
- [X] T018 [US1] Create SiteSettingsAdminViewSet in backend/src/apps/site_settings/admin_views.py
- [X] T019 [US1] Create public API URLs in backend/src/apps/site_settings/urls.py
- [X] T020 [US1] Create admin API URLs in backend/src/apps/site_settings/admin_urls.py
- [X] T021 [US1] Register URLs in backend/src/pinelab/urls.py
- [X] T022 [US1] Implement file upload validation for Logo (SVG, ≤2MB) in backend/src/apps/site_settings/admin_serializers.py
- [X] T023 [US1] Implement file upload validation for Hero banner (jpg/jpeg/png/webp, ≤5MB) in backend/src/apps/site_settings/admin_serializers.py
- [X] T024 [US1] Implement file storage logic for Logo in backend/src/apps/site_settings/admin_views.py
- [X] T025 [US1] Implement file storage logic for Hero banner in backend/src/apps/site_settings/admin_views.py
- [X] T026 [US1] Create SiteSettings type definition in frontend/src/types/site-settings.ts
- [X] T027 [US1] Add getSiteSettings function in frontend/src/lib/api.ts
- [X] T028 [US1] Add updateSiteSettings function in frontend/src/lib/admin-api.ts
- [X] T029 [US1] Create HeroSection component in frontend/src/components/HeroSection.tsx
- [X] T030 [US1] Create SiteSettingsForm component in frontend/src/components/admin/SiteSettingsForm.tsx
- [X] T031 [US1] Create site-settings admin page in frontend/src/app/admin-portal/site-settings/page.tsx
- [X] T032 [US1] Update homepage to fetch and display site settings in frontend/src/app/page.tsx
- [X] T033 [US1] Update layout to display Logo in navigation in frontend/src/app/layout.tsx
- [X] T034 [US1] Update Footer to display brand name from site settings in frontend/src/components/Footer.tsx
- [X] T035 [US1] Add site-settings menu item in AdminLayout in frontend/src/components/admin/AdminLayout.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - 管理最新消息 (Priority: P2)

**Goal**: 管理員可以在後台建立、編輯和刪除最新消息，這些消息會顯示在網站首頁

**Independent Test**: 在後台建立最新消息，然後查看首頁是否正確顯示

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T036 [P] [US2] Unit test for News model in backend/tests/unit/test_site_settings_model.py
- [ ] T037 [P] [US2] Unit test for NewsSerializer in backend/tests/unit/test_site_settings_serializer.py
- [ ] T038 [P] [US2] Integration test for GET /api/news/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T039 [P] [US2] Integration test for POST /api/admin/news/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T040 [P] [US2] Integration test for status toggle in backend/tests/integration/test_site_settings_api.py
- [ ] T041 [P] [US2] Unit test for NewsSection component in frontend/tests/unit/components/NewsSection.test.tsx

### Implementation for User Story 2

- [X] T042 [US2] Create NewsSerializer in backend/src/apps/site_settings/serializers.py
- [X] T043 [US2] Create NewsAdminSerializer in backend/src/apps/site_settings/admin_serializers.py
- [X] T044 [US2] Create NewsViewSet in backend/src/apps/site_settings/views.py
- [X] T045 [US2] Create NewsAdminViewSet in backend/src/apps/site_settings/admin_views.py
- [X] T046 [US2] Implement published news filtering in NewsViewSet.get_queryset() in backend/src/apps/site_settings/views.py
- [X] T047 [US2] Implement status toggle action in NewsAdminViewSet in backend/src/apps/site_settings/admin_views.py
- [X] T048 [US2] Add news endpoints to public URLs in backend/src/apps/site_settings/urls.py
- [X] T049 [US2] Add news endpoints to admin URLs in backend/src/apps/site_settings/admin_urls.py
- [X] T050 [US2] Create News type definition in frontend/src/types/news.ts
- [X] T051 [US2] Add getNews function in frontend/src/lib/api.ts
- [X] T052 [US2] Add createNews function in frontend/src/lib/admin-api.ts
- [X] T053 [US2] Add updateNews function in frontend/src/lib/admin-api.ts
- [X] T054 [US2] Add deleteNews function in frontend/src/lib/admin-api.ts
- [X] T055 [US2] Add toggleNewsStatus function in frontend/src/lib/admin-api.ts
- [X] T056 [US2] Create NewsSection component in frontend/src/components/NewsSection.tsx
- [X] T057 [US2] Create NewsForm component in frontend/src/components/admin/NewsForm.tsx
- [X] T058 [US2] Create news list page in frontend/src/app/admin-portal/news/page.tsx
- [X] T059 [US2] Create news edit page in frontend/src/app/admin-portal/news/[id]/page.tsx
- [X] T060 [US2] Update homepage to fetch and display news in frontend/src/app/page.tsx
- [X] T061 [US2] Add news menu item in AdminLayout in frontend/src/components/admin/AdminLayout.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - 管理服務內容 (Priority: P2)

**Goal**: 管理員可以在後台管理服務項目列表，每個服務項目包含標題、描述和可選的圖標，以卡片形式顯示在首頁

**Independent Test**: 在後台新增、編輯、刪除服務項目，然後查看首頁是否正確顯示

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T062 [P] [US3] Unit test for Service model in backend/tests/unit/test_site_settings_model.py
- [ ] T063 [P] [US3] Unit test for ServiceSerializer in backend/tests/unit/test_site_settings_serializer.py
- [ ] T064 [P] [US3] Integration test for GET /api/services/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T065 [P] [US3] Integration test for POST /api/admin/services/ endpoint in backend/tests/integration/test_site_settings_api.py
- [ ] T066 [P] [US3] Unit test for ServicesSection component in frontend/tests/unit/components/ServicesSection.test.tsx

### Implementation for User Story 3

- [X] T067 [US3] Create ServiceSerializer in backend/src/apps/site_settings/serializers.py
- [X] T068 [US3] Create ServiceAdminSerializer in backend/src/apps/site_settings/admin_serializers.py
- [X] T069 [US3] Create ServiceViewSet in backend/src/apps/site_settings/views.py
- [X] T070 [US3] Create ServiceAdminViewSet in backend/src/apps/site_settings/admin_views.py
- [X] T071 [US3] Implement sort_order update action in ServiceAdminViewSet in backend/src/apps/site_settings/admin_views.py
- [X] T072 [US3] Implement icon file upload validation (SVG/PNG, ≤1MB) in backend/src/apps/site_settings/admin_serializers.py
- [X] T073 [US3] Implement icon file storage logic in backend/src/apps/site_settings/admin_views.py
- [X] T074 [US3] Add services endpoints to public URLs in backend/src/apps/site_settings/urls.py
- [X] T075 [US3] Add services endpoints to admin URLs in backend/src/apps/site_settings/admin_urls.py
- [X] T076 [US3] Create Service type definition in frontend/src/types/service.ts
- [X] T077 [US3] Add getServices function in frontend/src/lib/api.ts
- [X] T078 [US3] Add createService function in frontend/src/lib/admin-api.ts
- [X] T079 [US3] Add updateService function in frontend/src/lib/admin-api.ts
- [X] T080 [US3] Add deleteService function in frontend/src/lib/admin-api.ts
- [X] T081 [US3] Add updateServiceSortOrder function in frontend/src/lib/admin-api.ts
- [X] T082 [US3] Install icon font library (Font Awesome or Material Icons) in frontend/package.json
- [X] T083 [US3] Create ServicesSection component in frontend/src/components/ServicesSection.tsx
- [X] T084 [US3] Create ServiceForm component with icon selector in frontend/src/components/admin/ServiceForm.tsx
- [X] T085 [US3] Create services list page in frontend/src/app/admin-portal/services/page.tsx
- [X] T086 [US3] Create service edit page in frontend/src/app/admin-portal/services/[id]/page.tsx
- [X] T087 [US3] Update homepage to fetch and display services in frontend/src/app/page.tsx
- [X] T088 [US3] Add services menu item in AdminLayout in frontend/src/components/admin/AdminLayout.tsx

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - 管理聯絡資訊與外部連結 (Priority: P2)

**Goal**: 管理員可以在後台設定各種聯絡方式和外部連結，這些連結會顯示在網站頁尾和相關頁面

**Independent Test**: 在後台設定各種連結，然後查看頁尾和聯絡頁面是否正確顯示

**Note**: This story extends SiteSettings model (already created in US1), so implementation can be done together with US1 or separately.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T089 [P] [US4] Integration test for external links validation in backend/tests/integration/test_site_settings_api.py
- [ ] T090 [P] [US4] Unit test for Footer component with external links in frontend/tests/unit/components/Footer.test.tsx

### Implementation for User Story 4

- [X] T091 [US4] Add URL validation for external links in SiteSettingsAdminSerializer in backend/src/apps/site_settings/admin_serializers.py
- [X] T092 [US4] Update SiteSettingsForm to include external links fields in frontend/src/components/admin/SiteSettingsForm.tsx
- [X] T093 [US4] Update Footer to display external links from site settings in frontend/src/components/Footer.tsx
- [X] T094 [US4] Update contact page to display Shopee and Line@ links in frontend/src/app/contact/page.tsx

**Checkpoint**: At this point, User Stories 1-4 should all work independently

---

## Phase 7: User Story 5 - 控制價格顯示 (Priority: P3)

**Goal**: 管理員可以在後台控制商品價格是否顯示，當價格隱藏時，商品卡片和詳情頁面不顯示價格資訊

**Independent Test**: 在後台切換價格顯示設定，然後查看商品列表和詳情頁是否正確反映設定

**Note**: This story extends SiteSettings model (already created in US1), so implementation can be done together with US1 or separately.

### Tests for User Story 5

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T095 [P] [US5] Integration test for show_price setting in backend/tests/integration/test_site_settings_api.py
- [ ] T096 [P] [US5] Unit test for ProductCard component with price visibility in frontend/tests/unit/components/ProductCard.test.tsx
- [ ] T097 [P] [US5] Unit test for product detail page with price visibility in frontend/tests/unit/pages/products/[id].test.tsx

### Implementation for User Story 5

- [X] T098 [US5] Add show_price toggle to SiteSettingsForm in frontend/src/components/admin/SiteSettingsForm.tsx
- [X] T099 [US5] Update ProductCard to conditionally hide price in frontend/src/components/ProductCard.tsx
- [X] T100 [US5] Update product detail page to conditionally hide price in frontend/src/app/products/[id]/page.tsx
- [X] T101 [US5] Fetch site settings in products list page in frontend/src/app/products/page.tsx
- [X] T102 [US5] Fetch site settings in product detail page in frontend/src/app/products/[id]/page.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T103 [P] Add error handling and validation messages in backend/src/apps/site_settings/admin_views.py
- [ ] T104 [P] Add loading states to all admin forms in frontend/src/components/admin/
- [ ] T105 [P] Add success/error toast notifications in admin pages
- [ ] T106 [P] Implement image deletion when replacing Logo/Hero banner in backend/src/apps/site_settings/admin_views.py
- [ ] T107 [P] Add responsive design validation for all new components
- [ ] T108 [P] Add accessibility attributes (ARIA labels) to all new components
- [ ] T109 [P] Update API documentation comments in backend/src/apps/site_settings/
- [ ] T110 [P] Run linter and fix all issues: backend (flake8, black) and frontend (eslint)
- [ ] T111 [P] Run type checking: backend (mypy) and frontend (tsc --noEmit)
- [ ] T112 [P] Generate and review test coverage report: pytest --cov and npm run test:coverage
- [ ] T113 [P] Update README.md with new API endpoints
- [ ] T114 [P] Validate quickstart.md steps work correctly

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, no dependencies on US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Independent, no dependencies on US1/US2
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Extends SiteSettings from US1, but can be done together
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Extends SiteSettings from US1, but can be done together

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before serializers
- Serializers before ViewSets
- ViewSets before URLs
- Backend API before frontend integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] (T004-T006) can run in parallel (models are independent)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for SiteSettings model in backend/tests/unit/test_site_settings_model.py"
Task: "Unit test for SiteSettingsSerializer in backend/tests/unit/test_site_settings_serializer.py"
Task: "Integration test for GET /api/site-settings/ endpoint in backend/tests/integration/test_site_settings_api.py"
Task: "Integration test for PUT /api/admin/site-settings/ endpoint in backend/tests/integration/test_site_settings_api.py"
Task: "Unit test for HeroSection component in frontend/tests/unit/components/HeroSection.test.tsx"

# Launch backend serializers together (after models):
Task: "Create SiteSettingsSerializer in backend/src/apps/site_settings/serializers.py"
Task: "Create SiteSettingsAdminSerializer in backend/src/apps/site_settings/admin_serializers.py"

# Launch frontend types and API functions together:
Task: "Create SiteSettings type definition in frontend/src/types/site-settings.ts"
Task: "Add getSiteSettings function in frontend/src/lib/api.ts"
Task: "Add updateSiteSettings function in frontend/src/lib/admin-api.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo (can be done with US1)
6. Add User Story 5 → Test independently → Deploy/Demo (can be done with US1)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Brand info) + User Story 4 (Links) + User Story 5 (Price control)
   - Developer B: User Story 2 (News)
   - Developer C: User Story 3 (Services)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- User Stories 4 and 5 extend SiteSettings from US1, but can be implemented together with US1 or separately

---

## Task Summary

- **Total Tasks**: 114
- **Phase 1 (Setup)**: 3 tasks
- **Phase 2 (Foundational)**: 6 tasks
- **Phase 3 (US1 - Brand Info)**: 26 tasks (5 tests + 21 implementation)
- **Phase 4 (US2 - News)**: 26 tasks (6 tests + 20 implementation)
- **Phase 5 (US3 - Services)**: 27 tasks (5 tests + 22 implementation)
- **Phase 6 (US4 - Links)**: 4 tasks (2 tests + 2 implementation)
- **Phase 7 (US5 - Price Control)**: 8 tasks (3 tests + 5 implementation)
- **Phase 8 (Polish)**: 12 tasks

### Parallel Opportunities

- **Phase 2**: 3 models can be created in parallel (T004-T006)
- **Each User Story**: All tests marked [P] can run in parallel
- **User Stories**: Can be developed in parallel after Phase 2 completes
- **Polish Phase**: Most tasks can run in parallel

### Independent Test Criteria

- **US1**: Update brand info in admin → Verify homepage and footer display updated content
- **US2**: Create news in admin → Verify homepage displays published news
- **US3**: Create service in admin → Verify homepage displays service cards
- **US4**: Set external links in admin → Verify footer and contact page display links
- **US5**: Toggle price display in admin → Verify product pages reflect setting

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1 only)**

This delivers the core brand information management functionality, allowing non-technical staff to update brand name, slogan, logo, and hero banner without code changes.

