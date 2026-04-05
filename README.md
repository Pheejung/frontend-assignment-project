# 모비데이즈 프론트엔드 과제 - 마케팅 캠페인 성과 대시보드

## 1. 프로젝트 개요
캠페인(`campaigns`)과 일별 성과(`daily_stats`) 데이터를 기반으로,
글로벌 필터/차트/테이블/등록 기능이 하나의 데이터 흐름으로 동기화되는 대시보드를 구현합니다.

핵심 목표:
- 확장 가능한 컴포넌트 설계
- 불완전 데이터 안전 처리(0 분모, null, 포맷 불일치)
- 필터 단일 소스 기반의 일관된 파생 계산

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

### 3.4 주요 API
- `GET /campaigns`
- `GET /daily_stats`

## 4. 기술 스택 선택 근거
| 구분 | 선택 | 이유 | 트레이드오프 |
| --- | --- | --- | --- |
| Framework | React + TypeScript + Vite | 빠른 개발 속도, 타입 안정성 | Next.js 대비 SSR/라우팅 내장 기능 없음 |
| 서버 상태 | TanStack Query | 비동기 데이터/로딩/에러/캐시 표준화 | 초기 학습 비용 |
| 전역 UI 상태 | Zustand | 필터/모달/로컬 병합 상태를 간결하게 관리 | 구조 규칙 없으면 난잡해질 수 있음 |
| 폼/검증 | react-hook-form + zod | 선언형 검증, 성능, 에러 메시지 매핑 용이 | 스키마 작성 비용 |
| 차트 | Recharts | 범례/툴팁/반응형 구현이 쉬움 | 고난도 커스텀 한계 |
| Mock API | json-server | import 없이 API 통신 요건 충족 | 실제 백엔드 제약은 미반영 |

## 5. 폴더 구조 및 아키텍처
```txt
src/
  app/
    App.tsx
    providers/QueryProvider.tsx
  entities/
    campaign/
      model/types.ts
      model/useCampaignsQuery.ts
      lib/normalize.ts
    daily-stat/
      model/types.ts
      model/useDailyStatsQuery.ts
      lib/normalize.ts
  features/
    global-filter/model/store.ts
  shared/
    api/
      client.ts
      campaigns.ts
      dailyStats.ts
      queryKeys.ts
    lib/
      date.ts
      number.ts
      filter.ts
      aggregate.ts
      metrics.ts
    ui/
      Loading.tsx
      ErrorFallback.tsx
```

분리 원칙:
- `entities`: 도메인 타입/정규화/쿼리
- `features`: 사용자 인터랙션 상태
- `shared`: API/순수 계산 유틸/공용 UI
- `app`: 앱 조립 및 Provider

## 6. 컴포넌트/데이터 설계 요약
- 데이터 흐름:
  1. API fetch
  2. normalize
  3. 로컬 데이터 병합
  4. 글로벌 필터 적용
  5. 집계/파생지표 계산
  6. 차트/테이블 렌더
- 파생 지표 계산:
  - CTR = `clicks / impressions * 100` (impressions=0이면 0)
  - CPC = `cost / clicks` (clicks=0이면 0)
  - ROAS = `conversionsValue / cost * 100` (cost=0이면 0)

## 7. 현재 구현 상태
- [x] Day1 기반 구축 완료 (API, normalize, 필터 스토어, 집계 파이프라인)
- [x] 3.1 글로벌 필터 완성
- [x] 3.2 일별 추이 차트 완성
- [ ] 3.3 캠페인 관리 테이블 완성
- [ ] 3.4 캠페인 등록 모달 완성
- [ ] 선택 과제(도넛/Top3)

## 8. 제출 체크 포인트
- `db.json` 원본 무수정
- import 방식 대신 API 비동기 통신
- `README.md`, `AI_USAGE.md` 필수 항목 포함

## 9. 요구사항 분류
### 9.1 기능 요구사항
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

### 9.2 비기능 요구사항
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
