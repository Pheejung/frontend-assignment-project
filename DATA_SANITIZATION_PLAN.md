# data.json 기반 데이터 정규화/예외처리 가이드

## 1. 왜 별도 정규화가 필요한가
제공 데이터에는 실무형 노이즈가 포함되어 있습니다. 이 단계 없이 바로 렌더링하면 필터/정렬/지표 계산에서 오류가 납니다.

---

## 2. 실제 발견된 이슈 (샘플)

### campaigns
- `status` 비정상 값 존재
  - 예: `stopped`, `running`
- `platform` 표기 불일치
  - 예: `네이버`, `Facebook`, `facebook`
- `startDate` 포맷 불일치/결측
  - 예: `2026/04/12`, `null`
- `name` 결측
  - 예: `META-002`의 `name: null`
- `budget` 타입 불일치/결측
  - 예: `null`, `"2000000원"`

### daily_stats
- 수치 필드 `null` 존재
  - 예: `impressions: null`, `clicks: null`, `cost: null`, `conversionsValue: null`
- 분모 0 위험 데이터 존재
  - `impressions = 0`, `clicks > 0` 같은 케이스
  - `clicks = 0`, `cost > 0` 같은 케이스
- 동일 `campaignId + date` 중복 가능성 존재
  - 집계 시 중복 행을 합산할지, 최신값 우선할지 정책 필요

---

## 3. 정규화 정책 (추천)

## 3.1 enum 표준화
- `status`
  - `active|paused|ended` 유지
  - `running -> active`
  - `stopped -> ended`
  - 그 외 미정의 값은 `paused`로 fallback
- `platform`
  - `Google|Meta|Naver`로 통일
  - `facebook|Facebook -> Meta`
  - `네이버 -> Naver`

## 3.2 문자열/날짜 정리
- `name`
  - `null`/빈문자열이면 `Unnamed Campaign ({id})`
- 날짜
  - `YYYY-MM-DD`/`YYYY/MM/DD` 모두 파싱 시도
  - 실패 시 해당 row 제외(권장) 또는 fallback 날짜 부여(비권장)

## 3.3 숫자 정리
- 공통 숫자 파서 규칙
  - `null/undefined/NaN -> 0`
  - 문자열에서 숫자만 추출 (`"2000000원" -> 2000000`)
  - 음수면 0으로 보정
- `budget`, `impressions`, `clicks`, `conversions`, `cost`, `conversionsValue`에 동일 적용

## 3.4 중복 row 처리
- 키: `campaignId + date`
- 추천: **합산(merge-sum)**
  - 노출/클릭/전환/비용/매출을 더해 하나의 일별 row로 통합
- 이유: 광고 로그 파이프라인에서는 같은 날짜 다중 source 유입이 흔함

---

## 4. 지표 계산 안전 규칙

```ts
const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
const cpc = clicks > 0 ? cost / clicks : 0;
const roas = cost > 0 ? (conversionsValue / cost) * 100 : 0;
```

- UI 포맷
  - `CTR/ROAS`: `%` + 소수 2자리
  - `CPC/Cost/Budget`: 원화 천단위
- 값이 원천 결측이라도 정규화 후 0으로 계산되도록 처리

---

## 5. 구현 위치 제안

- `src/shared/lib/normalize/campaign.ts`
- `src/shared/lib/normalize/dailyStat.ts`
- `src/shared/lib/metrics.ts`
- `src/shared/lib/aggregate.ts`

파이프라인:
1. API fetch
2. normalize
3. dedupe/merge
4. filter
5. metrics 계산
6. chart/table view model 생성

---

## 6. 면접에서 설명 포인트

- "왜 raw를 바로 쓰지 않고 정규화 레이어를 뒀는지"
- "enum 매핑 기준(running/stopped/facebook/네이버)"
- "중복 일자 row 처리 정책(합산 선택 근거)"
- "분모 0/null 방어로 대시보드 전체 안정성 확보"

---

## 7. 빠른 체크리스트

- [ ] status/platform 매핑 함수 적용
- [ ] 숫자 문자열 파서 적용 (`원` 제거)
- [ ] 날짜 strict 파싱 + 비정상 row 처리
- [ ] daily_stats 중복 키 처리
- [ ] CTR/CPC/ROAS 분모 0 방어
- [ ] 테이블/차트 동일 normalize 결과 사용

