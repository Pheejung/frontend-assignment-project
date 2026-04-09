# 마케팅 캠페인 성과 대시보드

## 1. 프로젝트 개요

캠페인(`campaigns`)과 일별 성과(`daily_stats`) 데이터를 기반으로,
글로벌 필터 / 차트 / 테이블 / 등록 기능이 공통 필터 기준으로 동기화되는 대시보드입니다.

핵심 목표:
- **확장 가능한 컴포넌트 설계**
  FSD(Feature-Sliced Design) 레이어를 기준으로 `shared / entities / features / widgets / app` 책임을 분리하였습니다.
  이를 통해 기능 추가 시 기존 컴포넌트를 재사용하면서 변경 범위를 국소화하고,
  요구사항 확장(새 필터, 새 위젯, 새 테이블 액션)에도 구조를 크게 흔들지 않도록 설계했습니다.
- **예외 데이터(0 분모, null, 포맷 불일치) 안전 처리**
  실제 서비스 데이터에 가까운 `db.json`의 이상 케이스를 전처리 단계에서 정규화하고,
  계산 단계에서는 0 분모와 비정상 수치(`NaN`, `Infinity`)가 UI로 노출되지 않도록 방어 로직을 적용했습니다.
  즉, "문제가 있는 데이터를 제거/보정하는 단계"와 "지표 계산을 안전하게 수행하는 단계"를 분리해,
  화면이 깨지지 않고 의미 있는 수치만 일관되게 보여주도록 했습니다.
- **글로벌 필터 기준의 일관된 파생 지표 계산**
  필터 상태를 단일 소스로 관리하고, `filter → aggregate → derive` 파이프라인을 차트/테이블/요약 지표가 공통으로 사용하도록 통일했습니다.
  그 결과 특정 기간·상태·매체를 선택했을 때 각 위젯의 기준 데이터가 달라지는 문제를 방지하고,
  사용자가 어떤 화면을 보더라도 동일한 필터 해석 위에서 CTR/CPC/ROAS를 비교할 수 있도록 구현했습니다.

---

## 2. 실행 방법

### 2.1 요구 환경
- Node.js 20+
- npm 10+

### 2.2 설치
```bash
npm install
```

### 2.3 실행
동시 실행 (권장):
```bash
npm run dev:all
```

개별 실행:
```bash
npm run server   # API 서버: http://127.0.0.1:4000
npm run dev      # FE 개발서버: http://localhost:5173
```

### 2.4 기타 명령
```bash
npm run lint     # ESLint 검사
npm run build    # 프로덕션 빌드
npm run test     # 단위 테스트
```

### 2.5 주요 API 엔드포인트
- `GET /campaigns`
- `GET /daily_stats`

---

## 3. 기술 스택 선택 근거

| 구분 | 선택 | 선택 이유 | 트레이드오프 |
|------|------|----------|------------|
| Framework | React + TypeScript + Vite | 컴포넌트 조합과 빠른 개발/빌드, 타입 안정성 확보 | SSR/파일 라우팅은 직접 구성 필요 (본 과제는 SPA이므로 무관) |
| 서버 상태 | TanStack Query | SWR 대비 쿼리 무효화(invalidate)·devtools 지원이 풍부해 캐시 제어가 명시적 | 번들 크기가 SWR보다 크고 초기 설정 코드가 많음 |
| 전역 상태 | Zustand | Redux 대비 보일러플레이트 없이 slice 단위로 간결하게 관리. 필터·로컬 캠페인·override 등 여러 관심사를 하나의 스토어에서 분리 | 규칙을 별도로 정하지 않으면 스토어가 비대해질 수 있음 |
| 차트 | Recharts | React 컴포넌트 API 기반으로 라인·도넛·바 차트를 일관되게 구성. Chart.js 대비 ref 없이 선언적으로 사용 가능 | 고급 애니메이션·커스텀 렌더링은 D3 대비 한계 |
| 폼 유효성 | react-hook-form + Zod | 스키마를 코드로 선언하면 유효성 규칙과 에러 메시지가 한 곳에 집중됨. Formik 대비 리렌더 최소화 | 의존성 2개 추가 |
| 날짜 처리 | dayjs | date-fns 대비 번들 크기가 작고 불변(immutable) API. 월 시작/끝 계산과 포맷 정규화에 필요한 기능만 플러그인으로 추가 | Intl API만으로 해결 불가한 포맷 파싱이 필요해 의존성 추가 |
| Mock API | json-server | MSW 대비 Service Worker 등록 없이 `db.json` 하나로 실제 HTTP 서버를 바로 띄울 수 있어 네트워크 탭에서 요청·응답을 그대로 확인 가능 | MSW 대비 핸들러 커스텀(지연, 에러 시뮬레이션 등)이 어렵고 실제 백엔드와 달리 관계형 쿼리 불가 |

---

## 4. 폴더 구조

```
src/
├── index.css                       # CSS 변수, 리셋, body
├── main.tsx                        # 앱 진입점 및 CSS import
│
├── app/                            # 최상위 화면 조립 (Provider, 라우팅, 전체 조합)
│   ├── App.tsx                     # 대시보드 루트 컴포넌트
│   ├── hooks/
│   │   ├── useDashboardData.ts     # 데이터 파이프라인 통합 훅
│   │   └── useFilterNotice.ts      # 토스트 알림 훅
│   └── providers/
│       └── QueryProvider.tsx
│
├── entities/                       # 도메인 모델 및 정규화
│   ├── campaign/
│   │   ├── api/campaigns.ts        # fetch + normalize (도메인 전용 API)
│   │   ├── model/types.ts
│   │   ├── model/useCampaignsQuery.ts
│   │   ├── lib/normalize.ts
│   │   └── lib/filter.ts           # filterCampaigns, GlobalFilters
│   └── daily-stat/
│       ├── api/dailyStats.ts       # fetch + normalize (도메인 전용 API)
│       ├── model/types.ts
│       ├── model/useDailyStatsQuery.ts
│       ├── lib/normalize.ts
│       ├── lib/filter.ts           # filterDailyStats
│       └── lib/aggregate.ts        # aggregateTotals, aggregateByDate 등
│
├── features/                       # 사용자 액션 중심 기능
│   ├── global-filter/
│   │   ├── model/store.ts          # Zustand 전역 스토어
│   │   ├── model/useGlobalFilter.ts # 스토어 accessor 훅
│   │   └── ui/GlobalFilterBar.tsx  # 글로벌 필터 UI
│   ├── campaign-table/
│   │   ├── ui/CampaignManagementTable.tsx
│   │   ├── ui/CampaignTableToolbar.tsx
│   │   ├── ui/CampaignTablePagination.tsx
│   │   ├── model/useCampaignTableState.ts
│   │   └── lib/tableUtils.ts
│   └── campaign-create/
│       ├── ui/CampaignCreateModal.tsx
│       └── model/campaignCreateSchema.ts
│
├── widgets/                        # 독립적인 시각화 블록
│   ├── daily-trend-chart/
│   │   └── ui/DailyTrendChart.tsx
│   ├── platform-performance-donut/
│   │   ├── model/usePlatformPerformanceData.ts # 도넛 전용 데이터 훅
│   │   └── ui/PlatformPerformanceDonut.tsx
│   ├── top-campaign-ranking/
│   │   └── ui/TopCampaignRankingChart.tsx
│   └── summary-stats/
│       └── ui/SummaryStatsSection.tsx          # 요약 지표 카드
│
└── shared/                         # 공통 모듈 (의존성 없음)
    ├── api/                        # 순수 HTTP 클라이언트 (client.ts, queryKeys.ts)
    ├── lib/                        # 도메인 무관 유틸 (date, metrics, number, id)
    ├── ui/                         # 공통 UI 컴포넌트
    │   ├── Button.tsx
    │   ├── Input.tsx
    │   ├── Select.tsx
    │   ├── Chip.tsx
    │   ├── Badge.tsx
    │   ├── Loading.tsx
    │   └── ErrorFallback.tsx
    └── styles/                     # 관심사별 분리된 CSS
        ├── layout.css
        ├── button.css
        ├── input.css
        ├── chip.css
        ├── filter.css
        ├── toast.css
        ├── table.css
        ├── modal.css
        ├── top3.css
        └── platform-donut.css
```

**파일 분리 기준 — 관심사 분리(Separation of Concerns) + FSD(Feature-Sliced Design)**

레이어별로 "무엇을 아는가"를 기준으로 분리합니다. 하위 레이어는 상위 레이어를 알지 못합니다.

| 레이어 | 역할 | 허용 의존 |
|--------|------|----------|
| `shared` | 순수 HTTP 클라이언트, 도메인 무관 유틸, 공통 UI | 외부 라이브러리만 |
| `entities` | 도메인 모델, 정규화, 도메인 전용 API fetch, 필터·집계 유틸 | shared |
| `features` | 사용자 액션(글로벌 필터, 테이블, 등록 모달) | entities, shared |
| `widgets` | 독립적인 시각화 블록 (차트, 랭킹, 요약 지표) | features, entities, shared |
| `app` | 최상위 조립, Provider, 앱 레벨 훅 | 모든 레이어 |

**레이어 간 의존 방향 준수 사항**

- `shared/api/` — `fetchJson`, `queryKeys` 등 도메인을 모르는 순수 HTTP 유틸만 위치. 도메인 타입·normalize에 의존하는 API 함수는 각 entity 슬라이스(`entities/campaign/api/`, `entities/daily-stat/api/`)로 분리
- `entities/` — `filter.ts`, `aggregate.ts` 등 도메인 타입에 의존하는 유틸을 해당 entity 슬라이스 내부에 위치. `shared`만 참조하며 다른 entity 슬라이스를 참조하지 않음
- `features/global-filter/` — store와 accessor 훅(`useGlobalFilter`)을 동일 슬라이스 내에 위치. GlobalFilterBar UI도 `app/ui/`가 아닌 `features/global-filter/ui/`에 위치
- `widgets/` — 각 widget의 데이터 훅(`usePlatformPerformanceData`)을 해당 widget 슬라이스 `model/`에 위치. `features`를 참조하는 것은 FSD 규칙상 허용

**경계선상 타협 (단일 페이지 구조)**

- `app` 레이어에 `pages` 없이 `useDashboardData` 등 앱 레벨 통합 훅을 직접 위치. 단일 페이지 구조에서 `pages` 레이어를 별도로 두는 것은 불필요한 복잡도이므로 `app`이 해당 역할을 겸함
- `widgets/top-campaign-ranking`이 `features/campaign-table/model/types`의 `CampaignTableRowData`를 참조. 랭킹 차트가 테이블과 동일한 row 구조를 입력으로 받아 별도 데이터 변환 없이 재사용하기 위한 선택이며, widgets → features 참조는 FSD에서 허용되므로 규칙 위반은 아님

CSS도 동일한 원칙으로 `button.css`, `input.css`, `chip.css` 등 관심사별로 분리하여 `shared/styles/`에 위치시키고, 특정 스타일 변경 시 영향 범위를 최소화했습니다.

---

## 5. 컴포넌트 설계

### 5.1 공통 UI 컴포넌트

`shared/ui`로 공통 컴포넌트를 추출하고 전체를 이 컴포넌트 기반으로 분리했습니다. 이후에는 스타일 변경이 필요할 때 `shared/ui` 한 파일만 수정하면 프로젝트 전체에 반영됩니다.

`Input`과 `Select`는 `forwardRef`로 감싸 react-hook-form의 `register`가 내부적으로 사용하는 ref를 전달받을 수 있도록 했습니다. 덕분에 `Controller` 없이 `register` 패턴으로 바로 연결됩니다.

- `Button`: `variant` prop으로 primary/secondary/ghost/table-sort 변형 제어. 모든 버튼 관련 스타일을 한 곳에서 관리
- `Input`: `forwardRef` 기반, react-hook-form `register` 패턴과 완전 호환. checkbox, date, number, search 등 모든 input type 지원
- `Select`: `forwardRef` 기반, react-hook-form 호환. 커스텀 화살표 아이콘 등 스타일 포함
- `Chip`: `variant` prop으로 chip(필터/메트릭 토글)/segment(랭킹 토글) 변형 제어. `active`/`disabled` 상태 내장
- `Badge`: 선택 카운트 등 인라인 상태 표시용. className 확장 가능

### 5.2 테이블·상태 관리 분리

검색·정렬·페이지네이션 상태를 테이블 컴포넌트 내부에 두면 "어떻게 보여주는가(UI)"와 "어떤 데이터를 보여주는가(상태)"가 한 곳에 섞입니다. 상태 로직을 수정할 때 UI 코드를 함께 읽어야 하고, UI를 수정할 때 의도치 않게 상태 흐름을 건드릴 위험이 생깁니다.

이를 방지하기 위해 `CampaignManagementTable`은 `rows`를 props로 받는 순수 UI 컴포넌트로 설계하고, 검색·정렬·페이지네이션 상태는 `useCampaignTableState` 훅으로 분리했습니다. 덕분에 상태 로직과 UI를 각각 독립적으로 변경하고 테스트할 수 있습니다.

### 5.3 공통 필터 기반 데이터 파이프라인

차트·테이블·랭킹이 각자 필터를 적용하면 같은 화면에서 수치 기준이 달라지는 문제가 생깁니다. 이를 방지하기 위해 메인 화면은 `useDashboardData`를 기준 파이프라인으로 사용하고, 위젯 전용 훅에서도 동일한 글로벌 필터 규칙을 재사용하도록 설계했습니다.

```
API fetch (campaigns, daily_stats)
  → normalize (타입/포맷 보정, 중복 병합, 무효 데이터 제거)
  → merge (로컬 캠페인 + 상태 override 적용)
  → filter (기간/상태/매체 AND 조건)
  → aggregate (날짜별, 캠페인별 합산)
  → derive (CTR, CPC, ROAS 계산)
  → 차트 / 테이블 / 랭킹에 동일 결과셋 전달
```

---

## 6. 데이터 흐름

> 각 항목의 상세 분석(이상 케이스 목록, 정규화 판단 근거, 처리 결과)은 [`DATA_SANITIZATION_PLAN.md`](./docs/DATA_SANITIZATION_PLAN.md)에 정리되어 있습니다.

### 6.1 파생 지표 계산

| 지표 | 계산식 | 예외 처리 |
|------|--------|---------|
| CTR | clicks / impressions × 100 | impressions = 0 → 0 |
| CPC | cost / clicks | clicks = 0 → 0 |
| ROAS | conversionsValue / cost × 100 | cost = 0 → 0 |

### 6.2 예외 처리

- `conversionsValue: null` → 0으로 치환
- 날짜 포맷 불일치 (`YYYY/MM/DD` 등) → `YYYY-MM-DD` 정규화
- 잘못된 status 값 (`stopped` 등) → 유효한 enum으로 매핑
- 중복 daily_stat (동일 campaignId:date) → 수치 합산 후 단일 레코드로 병합
- `NaN`, `Infinity`가 UI에 노출되지 않도록 모든 계산에 방어 처리

---

## 7. 구현 범위

### 7.1 필수 요구사항

- [x] 3.1 글로벌 필터 (기간/상태/매체, AND 조건, 초기화)
- [x] 3.2 일별 추이 차트 (메트릭 토글, 최소 1개 유지, 툴팁)
- [x] 3.3 캠페인 관리 테이블 (정렬, 검색, 페이지네이션, 일괄 상태 변경)
- [x] 3.4 캠페인 등록 모달 (유효성 검사, 즉시 반영)

### 7.2 선택 요구사항

- [x] 4.1 플랫폼별 성과 도넛 (메트릭 토글, 글로벌 필터 양방향 연동)
- [x] 4.2 캠페인 랭킹 Top3 (ROAS/CTR/CPC 토글, 정렬 방향 준수)

---

## 8. 요구사항 상세

### 8.1 기능 요구사항

**글로벌 필터**
- 집행 기간 / 상태(진행중·일시중지·종료) / 매체(Google·Meta·Naver) 필터를 AND 조건으로 적용
- 집행 기간 해석: 선택 기간과 캠페인 집행 기간이 하루라도 겹치면 포함(Overlap 기준), 일별 성과는 선택한 기간의 데이터만 집계
- 초기값: 당월 1일~말일, 상태·매체 전체 선택
- 초기화 시 모든 조건 기본값 복원
- 필터 변경 시 차트·테이블 실시간 동기화
- 구현 정책: 상태/매체는 빈 선택을 허용하지 않고 최소 1개 이상 선택 상태를 유지(마지막 1개 해제 시 유지 + 안내 토스트)
- (상태/매체 필터의 "적용/해제" 문구는 마지막 1개까지 해제를 허용하는 해석도 가능하지만, 본 구현은 빈 선택으로 인한 전체 빈 화면을 방지하기 위해 최소 1개 선택 강제 정책을 채택)


**일별 추이 차트**
- X축 날짜, Y축 수치, 범례, 호버 툴팁 제공
- 메트릭 토글(노출수·클릭수), 초기값 둘 다 활성, 최소 1개 유지

**캠페인 관리 테이블**
- 컬럼: 캠페인명 / 상태 / 매체 / 집행기간 / 총 집행금액 / CTR / CPC / ROAS
- 집행기간·총집행금액·CTR·CPC·ROAS 컬럼 정렬 (멀티컬럼 우선순위 지원)
- 캠페인명 실시간 검색 (테이블 전용, 차트 미영향), 검색 결과·전체 건수 표시
- 페이지네이션 10건/페이지
- 체크박스 선택 후 드롭다운으로 상태 일괄 변경, 즉시 반영

**캠페인 등록 모달**
- 캠페인명(2 ~ 100자) / 광고 매체 / 예산(100 ~ 10억 정수) / 집행금액(0 ~ 10억, 예산 초과 불가) / 시작일 / 종료일(시작일보다 이후, 동일일 불가) 유효성 검사
- 상태 `active` 자동 고정, ID 자동 생성
- 등록 성공 시 새로고침 없이 대시보드·테이블 즉시 반영

**플랫폼별 성과 도넛 (선택)**
- 비용·노출수·클릭수·전환수 메트릭 토글, 기본값 비용
- 플랫폼별 수치·비중(%) 동시 표기
- 도넛 세그먼트 클릭 시 글로벌 매체 필터 양방향 연동

**캠페인 랭킹 Top3 (선택)**
- ROAS·CTR·CPC 메트릭 토글, 기본값 ROAS
- ROAS·CTR 높을수록 ↑, CPC 낮을수록 ↑ 정렬

---

### 8.2 비기능 요구사항

**데이터 무결성**
- `db.json` 원본 무수정
- import 방식 금지, json-server API 비동기 통신 방식 사용

**안정성**
- Division by zero / null / 포맷 불일치 방어
- `NaN`, `Infinity`가 UI에 노출되지 않도록 모든 계산에 방어 처리

**일관성**
- 차트·테이블·요약 지표가 공통 필터 기준과 동일 계산 규칙을 공유하도록 설계

**성능**
- 파생 데이터는 `useMemo` 기반으로 필요 시에만 재계산

**접근성 / UX**
- 로딩·에러·빈 상태 명시적 구분 표시
- 모달 포커스 트랩 및 ESC 닫기 지원
- 반응형 레이아웃

**유지보수성**
- entities / features / widgets / shared / app 레이어 분리
- CSS를 관심사별 파일로 분리 (button.css, input.css, chip.css 등)
- `shared/ui` 공통 컴포넌트로 UI 일관성 확보
