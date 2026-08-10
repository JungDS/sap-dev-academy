# 배치 4 본선 판정 노트 (CH13～16 — 작성 중)

> 본선(Fable) 실측·코퍼스 확정 기록. 최종 verdict/CHnn.md+json의 재료.

## CH13 (131발견/61클러스터 — 치명1·높음5)

- **C001 기각 — 기각 사전 ⑱ 신설**: "LEFT OUTER JOIN ON에 `<>` 불가·활성화 차단"(치명/추정 x5) —
  ABENNEWS-740-ABAP_SQL:40 "only equality comparisons ... **no longer applies**"(7.40 해제).
  `b~status <> 'C'` 합법. 5벌 전원 추정 = 레거시 제약 기억 재생. (선택: 7.40 미만 구시스템 주의 1문장은
  교육 재량 — 필수 아님.)
- **C002 채택(높음)**: L01:41 `gt_out` 등 결과 itab이 L01～L06 전 예제에서 선언 없이 사용(실측 — L01 선언문 0).
  x10. 교정 = 레슨별 예제에 결과 구조 TYPES+DATA 선언 추가(L03 별칭 결과 구조 포함).
- **C003 채택(높음)**: L08 advanceUse(REF TO·TRY/CATCH) [선행 사용] 표기 전무 — AG01-s·AG05-s 교차. 표기+안내 추가.
- **C004 채택(높음)**: L02 NULL introduces인데 정의·판별 부재(실측 L02:40～42 두 문장 절).
  교정 = NULL 정의+ABAP 전송 시 초기값 변환+IS NULL 판별 보강.
- **C005 채택(높음)**: JOIN+집계 결합이 L08에서 최초 등장 — 중간 결합 예제 1개 삽입(L03 또는 L04 끝).
- **C006 채택(높음)**: L02 LEFT JOIN 방향(예매 기준←회차)이 도메인 종속과 역행 — 기준 테이블 교체(zperf 기준
  ←zbooking 또는 zconcert 기준) + '없을 수도' 서사 정합. 시드 정본(C003 예매 0)과 궁합 좋은 방향으로.
- 등급 = **보강 권장**(높음 5 채택). 축 라우팅 합류: 잔여석 grain(A3)·위젯 C002 아티스트(신유빈→ABAP Trio).

## CH14 (150발견/74클러스터 — 높음13) — 전건 채택 방향, 보강 권장

- 위젯 하드코딩 오염 6(C002 basis table 라벨/zbooking 불일치+field-curtain.js 경고 필드 · C003 Chapter 22↔23 ·
  C004 ZHV_PERF/장르 유령 문구 · C005 공연장/좌석등급 레이블(view-cluster-tree.js) · C010 마스터 삭제 후 행 잔존
  (outer처럼 보임) · C012 C999 행 미제거) — AG02 양모델 보강 의견 정합. 전부 채택.
- 본문 7: C001 Delivery Class·Recording Routine 등 4용어 미풀이(x9 — B4 최다 지지) · C006 ZV_PERF 필드 구성
  분열(venue) · C007 명사구 파편 · C008 View 4종 생성 절차 부재(축 라우팅 CH14-L03 ZCONCERT_T 전제 인접) ·
  C009 TMG 입력값 안내 부재 · C011 Projection View "SQL view 안 만들어짐" vs SELECT 모순 —
  해소 1문장(DDIC 전용 객체·런타임이 기반 테이블 액세스로 변환) · C013 고아화 위험 무설명. 전부 채택.

## CH15 (175발견/89클러스터 — 치명1·높음15) — 보강 권장(치명 1 포함하나 국소 개명이라 재집필 아님, 사유 명기)

- **C001 치명 채택**: `pa_secret` 9자 — PARAMETERS 8자 제한 초과(활성화 차단)+R11 위반. 일괄 개명(예: pa_secr).
- **C007 전면 기각 — 기각 사전 ⑲ 신설**: "LOOP AT SCREEN INTO 구문 오류" 주장(AG06-gemini 단독 3건) —
  ABAPLOOP_AT_SCREEN:16 정식 문법이 `LOOP AT SCREEN INTO wa.`(단축형이 오히려 obsolete). 본문이 모범.
- 채택(높음): C002 header line/selection table 무풀이 · C003 축약 블록 미선언 요소(pa_from/b_date/g1 등 —
  선언 보충 또는 '축약' 명시) · C004+C011 캡스톤 위젯(상태 R/C→N/C + amount→seats) · C005 L02 위젯 부서
  시나리오→so_conc 정본 · C006 value_org 'S' 누락(2컬럼 value_tab 정설) · C008 L08↔L09 역순(기왕 W1 백로그
  동일 사안 — 이번 채택: 순서 교정 또는 [선행 사용] 최소 봉합, 판정=**[선행 사용]+선언 리드 문장**으로 최소 봉합
  유지·순서 교체는 리넘버 급이라 범위 밖 명기) · C009 sy-repid/dynnr 설명 · C010 sscrfields/TABLES 풀이 ·
  C012 캡스톤 회수 범위 1문장+MODIF ID 재사용 · C013 존재/권한 열거 오라클(순서·조건 1문장) · C014 L01 접기
  문구 L06 정합 · C015 SCREEN 정체(시스템 제공 특수 테이블) 1문장 · C016 START 재검사 1줄(심층 방어).

## CH16 (135발견/68클러스터 — 높음11) — 보강 권장

- C001 gv_locked 미선언(x8) · C002 L05 실행문 모듈 밖 · C003 L10 화면 필드 3분열 · C005 L09 밀도(구성 —
  Tabstrip·Status Icon 보강) · C006 위젯 상태 R/W → 시드 정본 N/C(**축 라우팅 'CH16 상태 R 발명' 실측 적발**) ·
  C007 AT EXIT-COMMAND 부재(E 타입 1절) · C008 gv_conc 블록 미선언 · C009 FORM check_booking 미정의 ·
  C010 MODULE help_conc 미정의 · C011 Module Pool 생성 절차 부재. 전부 채택.
- **C004 CONFLICT 판정 = 다수설 채택**: dialog MODULE 안 DATA는 프로그램 전역(자체 로컬 데이터 영역 없음)
  → lv_ 접두어 오류·gv_로 정정 + 오개념 방지 1문장. 상시 점검(l 접두어 패턴)과 정합 — R11 계열.

## 코퍼스 확정 누계(배치 4)
- ⑱: outer join ON `=` 한정 주장 기각(ABENNEWS-740-ABAP_SQL:40 — 7.40 해제).
- ⑲: LOOP AT SCREEN INTO 불가 주장 기각(ABAPLOOP_AT_SCREEN:16 — INTO가 정식·단축형이 obsolete).
- SET TITLEBAR WITH 4개 제한 주장 기각(ABAPSET_TITLEBAR_DYNPRO:16 — `WITH text1 ... text9` 9개 허용,
  본문 "&1～&9" 정확 · AG06-sonnet의 MESSAGE WITH 관례 오유추). CH16 verdict의 해당 클러스터
  "(본선 재확인 대상)" 마킹 → **기각으로 정정** 완료 필요.

## 등급 종합(본선): CH13 보강 · CH14 보강 · CH15 보강(치명 1 국소) · CH16 보강 — 4챕터 전부 보강 권장.

## 보강 이행 부기 (2026-08-10)

- 이행: 본문 CH13 52/58 · CH14 59/65 · CH15 73/74 · CH16 56/57 + 위젯 W1 10/11(+핸드오프 5·부수 2) ·
  W2 24/24. 본선 직접 = glossary 4키+마킹 4곳(C035 완결) · 09 원장 ZPV_BOOKING 개명 · CH14-L03 위젯 공연명 시드 동기화.
- **작업자 계약 적발(본선 판정·지시 정정) 4건**: ① CH14 축 D 'ZCONCERT_T 전제' = 배치 3 커밋으로 기해소된
  stale 지시(안유진 오독만 실재·정정) ② CH15 C034 = 본문이 옳음(AUTHORITY-CHECK 12 = 사용자 마스터에
  권한 객체 없음 — 판정서 '개발자 오류 신호' 제안이 무근거) ③ CH15 C047 = '전 필드 나열 필수·DUMMY 구분'
  통설이 코퍼스 부재("빠뜨린 필드=DUMMY 지정과 동일하게 미검사") — 그대로면 새 오류를 심을 뻔 ④ C055 =
  위젯이 옳음(오류 복귀 시 AT SELECTION-SCREEN OUTPUT 미재실행) — 코퍼스 확정 후 위젯 무수정.
- C048(TYPE c LENGTH n) 유효 확정 — 무수정. C060(CH13-L01 위젯 행 뻥튀기 체험)은 본문 ::embed 마커
  필요 = 신설 사안이라 유보(백로그).
- 미이행 잔여 = 경력자 스킵 표지 계열(CH12 정책 기각 판례 준용 — CH13 C007·CH14 C044 등 5·CH15 C058)
  + prevRel `next-step` 값 개정(전역 26건 관행 — R10 개정 사안).
- 비채택 관찰(배치 5+ 위젯 시드 정본화 잔재 계열 등재): CH15-L07-S01 'C001 정훈영 콘서트'(시드=안유진) ·
  CH15-L12-S01 예매행 일부 상이(0002=유재석/C).
- 점검: 재빌드 통과(glossary 286·270페이지)·게이팅 STRUCT/PREREQ/R6=0·기각 3계열 바이트 보존
  (`<> 'C'`·`LOOP AT SCREEN INTO`·`&9`)·스팟 5/5·pa_secret 잔존 0·위젯 실측 콘솔 0(작업자 전수).
