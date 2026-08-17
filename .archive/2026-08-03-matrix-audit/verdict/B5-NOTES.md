# 배치 5 (CH17～CH20) 본선 판정·이행 노트 — 2026-08-18

> 수거 112/112·결측 0(스트림 장애 스톨 17벌 전량 SendMessage 컨텍스트 보존 재개 + 앱 재시작 1회 → 작업자 5 전량 재개, 유실 0).
> 수합: CH17 149/66 · CH18 171/84(치명 2) · CH19 150/69 · CH20 126/64(치명 1) = **596발견/283클러스터**, dropped 0.
> 이행: 본문 4작업자(CH17～20) + 위젯 2작업자(W1=CH17·18, W2=CH19·20, 브라우저 직렬) + W1 연장(CH17 위젯 이관 6건).
> 본선 점검: 빌드 통과(패리티 0·270페이지)·게이팅 관문 0(STRUCT/PREREQ/**R6 0** — 경계 구간 무위반)·기각 앵커 보존 실측·diff 소관 일치.

## 1. 본선 코퍼스 확정 기각 (전 사실 쟁점 — 에스컬레이션 0)

| # | 클러스터 | 주장 | 기각 근거(루트 A) |
|---|---|---|---|
| 1 | CH17-C008 | 단축형 `meth( ... EXCEPTIONS ... )` 불가 | abapcall_method_static_short 구문도에 EXCEPTIONS 명문 |
| 2 | CH18-C002(치명) | `+=` 미존재 | abencalculation_assignments — 4종 연산자 명문 |
| 3 | CH18-C024 | line_index '-1 경로 없음' | abenline_index_function — hash key는 -1·미발견 0 (본문이 옳음) |
| 4 | CH19-C001 (x7 확실) | DATS_ADD_DAYS 3인자(on_error) 필수 | abensql_date_func — `DATS_ADD_DAYS( date,days )` 2인자 명문, invalid date는 초기화. **CDS 함수와의 혼동** |
| 5 | CH20-C001(치명) | ABAP SQL EXCEPT/INTERSECT 미지원 | abenselect_except_abexa·abenselect_intersect_abexa 실행 예제 실재 |

→ **명목 치명 3 중 2 기각, 실질 치명 1**(CH18-C001 위젯 EXCEPT 토글 — 채택·수정 완료).

## 2. 감사 주장이 뒤집힌 추가 사례 (작업자 코퍼스 검증)

- CH18-C006: 'EXCEPT는 source 기준' 주장이 오판 — ABENCORRESPONDING_CONSTR_MAPPING "components of the **target** structure". 본문 서술이 옳았고 예제 데이터 모델만 재구성(원본에 audit_user 존재하게 — 위젯과 정렬).
- CH18-C015: '괄호 안 공백은 관례' — ABENSTRING_TEMPLATES_EXPRESSIONS "**must** be included" = 문법 필수(주장 반대 방향으로 강화).
- CH18-C038: SWITCH ELSE 생략 시비 — 본문이 옳음(initial value 명문).
- CH19-C032·C037: 공백 구분 컬럼 obsolete·SUBSTRING NUMC 시비 — 본문이 옳음.
- CH20-C032: 'DISTINCT 명시 필수' — ABAPUNION: 3연산 모두 DISTINCT 생략 가능·기본값.
- **본선 지시 오기 적발(관례 ⑰ 재발)**: W2 발사 문구의 'CH19 위젯 접두어 g 전환' 전제가 본문 확정 상태(l 유지)와 상충 — 작업자가 본문 대조로 미전환 판정(옳음).

## 3. 핵심 채택·이행 (요지)

- **CH17**: L10 골격 gv_conc 선언·PAI 재조회 모듈(user_command_0100·gv_refresh 깃발) 신설, L09 선언 보충+CH13-L08 집계로 재현 가능화, L06 완성형 선노출 → L1 예고로 격하(게이팅), PBO 경로 E 메시지 4곳 → S+RETURN(ABENABAP_MESSAGE_DIALOG: MODULE OUTPUT의 E = A 동작), L03 Data Element 층위 교정. 위젯: fieldcat outputlen 실반영, L09 자동 재색칠 제거(display/refresh 원칙 정합), L10 7단계 재구성(재조회 체험), L07·L09 시드 정본화.
- **CH18**: 위젯 EXCEPT 토글 치명 수정(도달 불가 분기), FILTER key 제약 정밀화(ABENCONSTRUCTOR_EXPR_FILTER_BASIC 명문 + Sorted Table 선언 제시), classic/modern 블록 분리 3개소(중복 선언 복붙 제거), ::embed 3필드 규격화, EXACT 손실 비교 예제, 예외 첫 등장 한 줄 풀이, 위젯 구구단 잔재 → 콘서트 예제(시드 정본), L11 위젯 3자 일치+line_exists 보호 상시 노출.
- **CH19**: 별칭 없는 수식 컬럼+인라인 선언 = **구문 오류** 확정(ABAPSELECT_INTO_TARGET:124 "every SQL expression ... must have an alias") — 본문 재서술, FROM @itab 성능 서술 이원화 정직화(엔진 처리 vs DB 임시 테이블), pragma 콜아웃 입문 톤 재작성, 위젯 ON/WHERE 전환 이중 WHERE 수정, CAST CHAR(11) 동기.
- **CH20**: **정본 스키마 실측 — ZCONCERT에 title 없음, 코드(c~artist)가 옳고 표가 결함**(L07 표 artist 통일·"Closed Show"→김연아). 엔진 3종 title→artist 키(undefined 렌더 10벌 해소), 하드코딩 수치 cfg 주도화(50→80·79→49), L04 집합 결과표·L05 5행(취소 포함) 본문-위젯 정합, lt_→gt_ 통일(10곳).

## 4. 확정 기각 사전 등재 후보 (§1 원장 반영)

⑳ 'ABAP SQL DATS_ADD_DAYS 3인자 필수'(CDS 혼동) ㉑ '단축형 메서드 호출 EXCEPTIONS 불가' ㉒ '+= 미존재' ㉓ 'ABAP SQL EXCEPT/INTERSECT 미지원' ㉔ 'line_index -1 경로 없음'.

## 5. 코퍼스 신규 확정 (누적 사전)

수식 컬럼+인라인 선언 별칭 필수(ABAPSELECT_INTO_TARGET:124) · CORRESPONDING EXCEPT = target 컴포넌트(ABENCORRESPONDING_CONSTR_MAPPING) · FILTER 원본은 sorted/hashed key 필수(ABENCONSTRUCTOR_EXPR_FILTER_BASIC) · String Template 중괄호 안 공백 필수(ABENSTRING_TEMPLATES_EXPRESSIONS) · PBO MODULE의 MESSAGE E = A 동작(ABENABAP_MESSAGE_DIALOG) · FINAL = 7.57 신규(ABENNEWS-757) · 정수 연산 나눗셈 중간결과 상업 반올림(ABENARITH_TYPE) · UNION/INTERSECT/EXCEPT DISTINCT 기본값·INTERSECT/EXCEPT에 ALL 없음(ABAPUNION) · FROM @itab는 엔진 처리/DB 임시 테이블 이원(ABAPSELECT_ITAB — 내부 테이블 별칭 AS 필수 포함).

## 6. 사용자 결정 4건 — 확정·이행 (2026-08-18 "전체 추천안대로 진행")

1. **R11 예제 조각 접두어** — 추천 (b) 확정: CH10 이후 챕터의 껍데기 없는 예제 조각은 로컬 문맥 전제 `l` 허용, 전역 명시 코드는 `g`, 기존 g 통일 챕터도 합법(챕터 내 일관성만) → **R11 명문화 완료**. 횡단 재작업 없음.
2. **R10 `prevRel`** — `next-step` 정식 등재 + 비정식 `next` 5곳(CH01-L03·L06, CH02-L02·L03, CH03-L03)을 `next-step`으로 정리 → **완료**.
3. **CH18 glossary** — Inline Declaration·VALUE·CORRESPONDING·Table Expression·String Template 5키 등재 + CH18 본문 마킹 → **이행**(작업자, 패리티 검증 포함).
4. **표현식 내부 변수** — 맨 이름 허용(FOR·REDUCE INIT·LET — SAP 공식·Clean ABAP 관례) → **R11 명문화 완료**.

## 7. 잔여 백로그(미수정)

CH20 레슨별 데이터셋 2벌(L02·L03계 vs L07계 — 각자 본문 정합, 통일은 C024 구조 사안) · CH19-C054(L03 SELECT SINGLE 체험 축 — 기능 확장 제안) · 구조 재편성 기각군(CH17-C025, CH18-C020·C050·C065, CH19-C016~C018, CH20-C011·C015·C030 — [재작성] 강도 별도 착수 사안).
