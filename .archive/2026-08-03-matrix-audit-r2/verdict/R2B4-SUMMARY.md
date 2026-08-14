# 배치 4 R2 재감사 요약 — CH13～CH16 (2026-08-11)

> 목적: 배치 4 보강(본문 240건+위젯 34건) 결과의 실질 검증. 방식: R1 동일 조건 블라인드 재감사(배치 2·3 R2와 동일 프로토콜).
> 브랜치 `audit/r2-ch13-16` · 산출물: `raw/CH13～16`(112벌) · `merged/CH13～16` · 이 문서.
> 수거 중 사용한도 중단 1회(CH16 수합) — 컨텍스트 보존 재개로 유실 0.
> **수정(보강)은 미실행 — 사용자 결정 대기.**

## 1. 수거·수합 통계 (R1 대비)

| 챕터 | R2 발견/클러스터 | R1 발견/클러스터 | 볼륨비 | 비고 |
|---|---|---|---|---|
| CH13 | 94 / 56 | 131 / 61 | 72% | conflict 2(⑱ 재발·괄호 공백) |
| CH14 | 117 / 69 | 150 / 74 | 78% | conflict 1(MANDT 자동 포함) |
| CH15 | 125 / 91 | 175 / 89 | 71% | "치명 3" 전부 ⑲ 재발 = 실질 0 |
| CH16 | 106 / 68 | 135 / 68 | 79% | 최다 합류 x8 = AT EXIT-COMMAND |
| 계 | **442 / 284** | 591 / 292 | **75%** | **112/112 · 결측 0 · dropped 0** |

- 실질 치명 0(명목 3은 전부 기각 사전 ⑲ 계열 재발 — gemini 교차) · 높음 32(R1 44).
- 등급 의견 전 챕터 '경미 수정' 중심 하향(R1 4챕터 전부 보강 권장). AG09(코드 축)는 CH13～15에서
  0～3건으로 급감 — R1의 활성화 차단 계열(선언 부재·pa_secret·gv_locked)이 해소됐음을 교차 확인.

## 2. 보강 효과 판정

**부분 성공 — 배치 2·3 R2와 동일 패턴이나, 보강 규모가 컸던 만큼 보강 유발·불완전 잔여도 상대적으로 많다.**
R1 핵심 채택(결과 itab 선언·NULL 정의·pa_adv 개명·gv_locked·상태 N/C 정본화·Module Pool 절차 등)의 재적발은
사실상 0. 대신 아래 신규·잔존이 남았다.

## 3. 핵심 신규·잔존 (본선 선행 실측 2건 포함 — 최종 판정·교정은 수정 착수 시)

### 보강 유발·불완전 (배치 4 보강이 원인이거나 덜 끝난 것)
1. **CH13-L08 위젯↔본문 데이터 불일치** (C002 x4 + AG02-s 별도 확증): 본문은 회차 grain 복원 때 표를
   재산출(차은우=C002 취소 2석)했는데 위젯 데이터는 구시드(차은우=C001 정상 5석) — W1의 "문구 최소 정합"이
   데이터까지 못 맞춘 잔여. 위젯 데이터를 본문 표 기준으로 교체 필요.
2. **CH13-L03 "괄호 안 공백은 표기 습관" = 사실 오류** (C015 conflict — 본선 실측 확정): classic 집계
   구문(`COUNT( * )`·`SUM( f )`)에서 괄호 안 공백은 문법 요구(붙여 쓰면 구문 오류). 보강 때 신설된
   콜아웃(L03:42)이 원인 — "습관"→"classic 문법 요구(신형 ABAP SQL에서만 붙여쓰기 허용)"로 정정.
3. **CH14-L08 Help View 분류 자기모순** (C006 x2 + AG05-s 확증): R1 보강이 신설한 "네 가지 View를
   한자리에" 종합 절이 몇 문장 안에서 Help View를 두 기준으로 상반 분류(3:1 ↔ 2:2).
4. **CH14-L05 TMG 생성 대상 객체명 미지정** (C004 x3): R1 보강이 입력값 4칸 표는 넣었으나 생성 대상
   (ZCONCERT용·ZMV_CONCERT용 각각)을 이름으로 지정하는 단계가 빠짐 — L09 전제(생성물 2개)와 어긋남.
5. **CH16-L10 캡스톤에 AT EXIT-COMMAND 미반영** (C001 x8 — R2B4 최다 합류): R1 보강이 L07에 절을
   신설했지만 L10 통합 Flow Logic·모듈에는 반영 안 됨(캡스톤이 function type E를 지시하면서 모듈 부재).

### 잔존·신규 일반 (높음 계열)
6. **CH14-L04 Maintenance View 필드 목록에 키 `CONCERT_ID` 부재** (C003 x3 — 본선 실측 L04:83 확정):
   ARTIST·VENUE·PERF_NO·PERF_DATE만 나열 — 행 식별·신규 입력 불가 급.
7. CH14-L07 위젯이 SM30 C999 저장을 성공시킴 ↔ L04의 "input check가 막는다"와 정면 모순(C005 x2).
8. CH15-L12 권한 재검사 미회수(C004 x6) — R1 C016 이행(콜아웃 1줄)이 불충분하다는 재지적. 통합 코드에
   실제 재검사 반영 여부 판단 필요.
9. CH13-L02 FK 무결성 과신 서술(C003 x3)·키 초기값 휴리스틱(C004)·L03 집계 NULL 순서(C005)·
   L07 READ TABLE 선형 탐색 비용(C006)·L08 SUM NULL→0 변환(C007) — 기술 정밀화 계열.
10. CH14-C002(L03 서사 순서 — Help View 불필요 고백이 실습 후에 나옴)·C007(L09 관찰 모순)·
    C008(Projection View MANDT 기술 필드)·C009(Maintenance View 1:N 종속 조인 가능 여부 — 코퍼스 확정 대기).

### conflict 확정 대기 (수정 착수 시 코퍼스로 확정)
- CH14-C001: client 종속 Database View의 MANDT 자동 포함 여부(L01 "다섯 필드" 단정 시비).
- CH14-C009: Maintenance View의 1:N 종속 테이블 조인 제약.

### 재발 오판 — 자동 재기각
- **CH13-C001 (x4 conflict)**: LEFT OUTER JOIN ON `<>` 불가 — 기각 사전 ⑱ 재발(7.40 해제).
- **CH15 명목 치명 3건 전부**: `LOOP AT SCREEN INTO`/`MODIFY SCREEN FROM` 구문 오류 주장 —
  기각 사전 ⑲ 계열 재발(INTO/FROM이 정식·단축형이 obsolete). gemini 교차 발생.

## 4. 본선 종합 판정(의견)

| 챕터 | R1 판정 | R2 본선 의견 | 골자 |
|---|---|---|---|
| CH13 | 보강 권장 | **경미 수정(필수 2)** | 위젯 데이터 정합·괄호 공백 정정 + 기술 정밀화 |
| CH14 | 보강 권장 | **경미 수정~보강 경계(필수 4)** | 키 누락·TMG 대상·L08 모순·위젯 SM30 — R2B4 최중량 |
| CH15 | 보강 권장 | **경미 수정(필수 1)** | 권한 재검사 회수 + 정밀화(명목 치명은 전부 재발 오판) |
| CH16 | 보강 권장 | **경미 수정(필수 1)** | 캡스톤 AT EXIT-COMMAND 반영 |

## 5. 사용자 결정 (확정)

1. **수정 착수 범위** — 사용자 확정(2026-08-15): **§3 전체(1～10) 일괄 교정.**
2. 규칙 개정급 쟁점 없음. (배치 4에서 이월된 `go_`/`lo_` R11 등재 확인 요청은 여전히 대기.)

## 6. 이행 부기 (2026-08-15 — §5 확정 후 일괄 이행 완료)

**작업자 4(본문 A/B/C·위젯 W) 전량 완료.** 최종 빌드 통과(패리티 0·270페이지)·게이팅 관문 0(STRUCT/PREREQ/R6)·무단 수정 0(diff 실사 = 지정 범위 일치)·기각 앵커 바이트 보존 실측(⑱ `b~status <> 'C'`·C009 L04:81).

- **conflict 3건 전부 코퍼스 확정**(에스컬레이션 0):
  - C014-C001 **채택** — abenddic_database_views.htm "client dependency … determined by a column with the built-in dictionary type CLNT. This column must be the first column of the view."(Projection View도 동일 — abenddic_projection_views.htm). L01 "다섯" 단정 정정 + L09 전파분 정합.
  - CH14-C009 **기각(무수정)** — abenddic_maintenance_views.htm: secondary가 FK 테이블이라도 FK 필드가 그 테이블의 키면 허용 → ZCONCERT+ZPERF 합법.
  - CH13-C015 **채택** — abensql_agg_func.htm Variant 13·14 "The two spellings have the same meaning" + abenabap_words.htm 예약어 등재: **`COUNT(*)`만 붙여쓰기 별도 허용**, 그 외 집계 괄호 공백은 문법 요구. "습관" 콜아웃을 이 사실로 재작성(AG03-gemini의 "COUNT(*)도 오류" 측은 기각).
- **본문 A(CH13)**: C003·C004(FK 비강제·키 초기값 전제 명시)·C005(집계 NULL 순서)·C006(READ TABLE 순차 탐색 비용 — SORT+BINARY SEARCH·SORTED/HASHED 전부 CH06 기도입 실측, R15 무위반)·C007(SUM NULL→0 회수)·C015. 6/6.
- **본문 B(CH14)**: C001～C008 적용(C003은 코퍼스 명문 "All key fields of the primary table must be included…" 인용). **연장 채택 2**(관례 ⑯ 재적용): ① **Maintenance View = inner join 교정**(L04 콜아웃 "outer가 맞다" 폐기 + L08 표 — abenddic_maintenance_views.htm "A maintenance view implements an inner join." / outer 보존은 Help View 성질) ② L01 챕터 지도 3:1 → L08 확정 축(2:2, "프로그램이 읽는가") 정합.
- **본문 C**: CH15-C004 — L12 START-OF-SELECTION에 AUTHORITY-CHECK 재검사 정식 반영(+왜 S+RETURN인지 콜아웃 — abenabap_messages_types.htm "E/W는 대화 처리 전용" 근거). CH16-C001 — L10 Flow Logic `MODULE exit_0100 AT EXIT-COMMAND.` + 모듈 신설·user_command 나가기 분기 제거(dynpmodule.htm Addition 1 근거)·검증 시나리오/흔한 실수 정합.
- **위젯 W**: CH13-L08-S01 예매 데이터를 본문·CH09-L09 시드로 교체(실측 C001=8·C002=4·C003=0, INNER 토글 정상). CH14-L07-S01 'C999 저장 성공' 시나리오 폐기 → FK 통과 정상 저장 + 화면 밖 고아 행 관찰 2축 재구성(+se16n-tracker 엔진 cfg 완전 주도화 — 단일 사용 엔진 grep 확인, 회귀 0). CH15-L07-S01·CH15-L12-S01 시드 정본화(승인 백로그 소화 — 본문 충돌 없음 확인). 전 위젯 브라우저 실측 콘솔 0.
- **본선 지시 오기 적발(관례 ⑰ 재발)**: 발사 문구의 시드 "0002 손흥민 4석"·"본문 C001=14"가 저장소 정본(CH09-L09 표 = 1석)과 불일치 — 작업자 W가 계약(본문=정본)대로 1석 채택. 옳음.
- **잔여 백로그(미수정)**: ① CH15-L12 CATCH 블록 E 메시지(list processing 맥락 — 신설 콜아웃과 긴장) ② CH15-L12 so_stat 'C' 필터가 시드 정본상 0건 경로가 됨(취소 체험을 목록으로 원하면 시드 차원 결정 필요).
