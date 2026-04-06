# 모비데이즈 프론트엔드 과제 - 마케팅 캠페인 성과 대시보드

## 1. 프로젝트 개요
캠페인(`campaigns`)과 일별 성과(`daily_stats`) 데이터를 기반으로,
글로벌 필터/차트/테이블/등록 기능이 하나의 데이터 흐름으로 동기화되는 대시보드를 구현합니다.

핵심 목표:
- 확장 가능한 컴포넌트 설계
- 예외 데이터(0 분모, null, 포맷 불일치) 안전 처리
- 글로벌 필터 기준의 일관된 파생 지표 계산

## 2. 문서 구성
- 원문 보관: [ORIGINAL.md](./ORIGINAL.md)  
  과제 안내를 **처음 받은 그대로** 저장한 파일입니다.
- 설계 근거: [DESIGN.md](./DESIGN.md)
- 실행 계획: [ASSIGNMENT_PLAN.md](./ASSIGNMENT_PLAN.md)
- 데이터 예외 처리 기준: [DATA_SANITIZATION_PLAN.md](./DATA_SANITIZATION_PLAN.md)
- AI 활용 내역: [AI_USAGE.md](./AI_USAGE.md)

## 3. 실행 방법
### 3.1 요구 환경
- Node.js 20+
- npm 10+

### 3.2 설치
```bash
npm install
```

### 3.3 실행
동시 실행(권장):
```bash
npm run dev:all
```

개별 실행:
```bash
npm run server   # API: http://127.0.0.1:4000
npm run dev      # FE: http://localhost:5173
```

### 3.4 검증 명령
```bash
npm run lint
npm run build
```

### 3.5 주요 API
- `GET /campaigns`
- `GET /daily_stats`

## 4. 기술 스택 선택 근거
| 구분 | 선택 | 선택 이유 | 트레이드오프 |
| --- | --- | --- | --- |
| Framework | React + TypeScript + Vite | 컴포넌트 조합과 빠른 개발/빌드, 타입 안정성 확보 | SSR/파일 라우팅은 직접 구성 필요 |
| 서버 상태 | TanStack Query | 비동기 요청, 로딩/에러/캐시 흐름 표준화 | 초기 러닝커브 |
| 전역 상태 | Zustand | 글로벌 필터/로컬 등록/상태 override를 간결하게 관리 | 규칙 없이 커지면 난잡해질 수 있음 |
| 차트 | Recharts | 라인/도넛/바 차트를 빠르게 구성, 툴팁/반응형 지원 | 고급 커스텀 한계 |
| 날짜 처리 | dayjs | 월 시작/끝 계산, 날짜 포맷 정규화 단순화 | 의존성 추가 |
| Mock API | json-server | import 금지 + 비동기 통신 필수 요구사항 충족 | 실제 백엔드 제약과 차이 |

## 5. 폴더 구조
```txt
frontend-assignment-project/
├─ db.json
├─ ORIGINAL.md
├─ DESIGN.md
├─ ASSIGNMENT_PLAN.md
├─ DATA_SANITIZATION_PLAN.md
├─ AI_USAGE.md
├─ README.md
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ src/
   ├─ main.tsx
   ├─ index.css
   ├─ app/
   │  ├─ App.tsx
   │  └─ providers/QueryProvider.tsx
   ├─ entities/
   │  ├─ campaign/
   │  │  ├─ model/types.ts
   │  │  ├─ model/useCampaignsQuery.ts
   │  │  └─ lib/normalize.ts
   │  └─ daily-stat/
   │     ├─ model/types.ts
   │     ├─ model/useDailyStatsQuery.ts
   │     └─ lib/normalize.ts
   ├─ features/
   │  ├─ global-filter/model/store.ts
   │  ├─ campaign-table/ui/CampaignManagementTable.tsx
   │  └─ campaign-create/ui/CampaignCreateModal.tsx
   ├─ widgets/
   │  ├─ daily-trend-chart/ui/DailyTrendChart.tsx
   │  ├─ platform-performance-donut/ui/PlatformPerformanceDonut.tsx
   │  └─ top-campaign-ranking/ui/TopCampaignRankingChart.tsx
   └─ shared/
      ├─ api/
      ├─ lib/
      └─ ui/
```

구조 원칙:
- `entities`: 도메인 모델, 정규화, API query
- `features`: 사용자 액션 중심 기능 UI/상태
- `widgets`: 대시보드 조합 단위 시각화 컴포넌트
- `shared`: 공통 API client, 유틸, 공용 UI
- `app`: 최상위 화면 조립 및 Provider 연결

## 6. 컴포넌트 설계 및 데이터 흐름
데이터 파이프라인:
1. API fetch (`campaigns`, `daily_stats`)
2. normalize (타입/포맷 보정)
3. 로컬 데이터 병합 (신규 캠페인, 상태 변경 override)
4. 글로벌 필터 적용 (기간/상태/매체, AND)
5. 집계/파생 지표 계산
6. 차트/테이블/랭킹에 동일 결과셋 전달

파생 지표:
- `CTR = clicks / impressions * 100` (impressions=0 -> 0)
- `CPC = cost / clicks` (clicks=0 -> 0)
- `ROAS = conversionsValue / cost * 100` (cost=0 -> 0)

예외 처리:
- `conversionsValue: null` -> 0
- 비정상 숫자/문자열 -> 안전한 숫자 변환
- 잘못된 날짜 포맷 -> 정규화 또는 제외
- `NaN`, `Infinity`가 UI에 노출되지 않도록 방어

## 7. 구현 범위
### 7.1 필수 요구사항
- [x] 3.1 글로벌 필터
- [x] 3.2 일별 추이 차트
- [x] 3.3 캠페인 관리 테이블
- [x] 3.4 캠페인 등록 모달

### 7.2 선택 요구사항
- [x] 4.1 플랫폼별 성과 도넛
- [x] 4.2 캠페인 랭킹 Top3

## 8. 요구사항 매핑 포인트
- 필터 변경 시 차트/테이블 동기화: 동일 `filteredCampaigns`, `filteredStats` 기반
- 테이블 검색은 테이블에만 적용: 검색 상태를 테이블 컴포넌트 내부로 분리
- 일괄 상태 변경: 체크박스 선택 + 드롭다운 적용 후 override 즉시 반영
- 등록 모달 검증:
  - 캠페인명 2~100자
  - 예산 100~10억 정수
  - 집행금액 0~10억 정수 및 예산 초과 불가
  - 종료일 > 시작일
  - 상태 active 고정, ID 자동 생성
  
## 9. 제출 체크 포인트
- `db.json` 원본 무수정
- import 방식 대신 API 비동기 통신
- `README.md`, `AI_USAGE.md` 필수 항목 포함

## 10. 요구사항 분류
### 10.1 기능 요구사항
- 글로벌 필터
  - 기간/상태/매체 필터를 AND 조건으로 적용
  - 초기값: 당월 1일~말일, 상태/매체 전체
  - 초기화 시 기본값 복원
- 일별 추이 차트
  - X축 날짜, Y축 수치, 범례, 툴팁 제공
  - 메트릭 토글(기본: 노출+클릭), 최소 1개 유지
- 캠페인 관리 테이블
  - 컬럼: 캠페인명/상태/매체/집행기간/총 집행금액/CTR/CPC/ROAS
  - 정렬, 검색(테이블 전용), 페이지네이션(10건), 일괄 상태 변경
- 캠페인 등록 모달
  - 필드 검증, 상태 active 고정, ID 자동 생성
  - 등록 성공 시 새로고침 없이 즉시 반영
- 선택 과제
  - 플랫폼 도넛(메트릭 토글, 필터 양방향 연동)
  - Top3 랭킹(ROAS/CTR/CPC 토글 및 정렬 규칙)

### 10.2 비기능 요구사항
- 데이터 무결성
  - `db.json` 원본 무수정
  - import 금지, API 비동기 통신 방식 사용
- 안정성
  - division by zero/null/포맷 불일치 방어
  - 예외 상황에서도 `NaN`, `Infinity` 노출 방지
- 일관성
  - 차트/테이블/요약이 동일 필터 결과를 사용하도록 단일 파이프라인 유지
- 성능
  - 파생 데이터 `useMemo` 기반 재계산 최소화
- 접근성/UX
  - 로딩/에러/빈 상태 구분 표시
  - 반응형 레이아웃 유지
- 유지보수성
  - 도메인/기능/공용 모듈 분리 구조 적용
