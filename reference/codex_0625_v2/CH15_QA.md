# CH15_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH15_REWRITE.md`
> 판정: CH15 v2 기준 원고는 재작업 준비 산출물로 통과 대상. 실제 `content/abap/CH15` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 반복 템플릿형 보강안에 가깝다고 판정했다. CH15 v1도 레슨마다 비슷한 "도입 불편", "학습수단 필요", "공식문서 힌트" 문구가 반복되었고, 자동 문서 매칭으로 CH15와 직접 관련 없는 문서 힌트가 섞였다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 레슨마다 유사한 보강 지시문 반복 | 12개 레슨을 각각 실제 강의 원고로 재작성 |
| 강의 흐름 | 왜 배우는지보다 "보강 필요" 중심 | 왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 체험 설계 -> 실수와 주의 -> 정리 흐름으로 직접 작성 |
| 공식 문서 | 자동 매칭 힌트와 무관 문서 혼입 | `C:\ABAP_DOCU_HTML`에서 CH15 관련 문서를 수동 확인 |
| 정확도 | `END-OF-SELECTION`을 일반 마무리 이벤트처럼 볼 위험 | obsolete/LDB 중심 이벤트로 교정하고 신규 리포트 표준으로 권장하지 않음 |
| classic-first | 짧은 `LOOP AT SCREEN.`와 modern 문법 혼입 위험 | `LOOP AT SCREEN INTO gs_screen`, `MODIFY SCREEN FROM gs_screen` 형태로 통일 |
| R15 경계 | OO/exception/batch/security 심화로 확장될 위험 | SALV/TRY는 CH11 재사용으로 한정, batch/role 설계/CH20 exception 심화 배제 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH15`의 12개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH15/_chapter.md` | "CH15 전체 설계", "CH15 마무리 학습 흐름" | 반영 |
| `CH15-L01.md` | `## CH15-L01 - Report Event 전체 흐름` | 반영 |
| `CH15-L02.md` | `## CH15-L02 - INITIALIZATION 기본값` | 반영 |
| `CH15-L03.md` | `## CH15-L03 - AT SELECTION-SCREEN OUTPUT과 동적 화면 제어` | 반영 |
| `CH15-L04.md` | `## CH15-L04 - AT SELECTION-SCREEN 입력 검증과 MESSAGE 정식` | 반영 |
| `CH15-L05.md` | `## CH15-L05 - START-OF-SELECTION 조회 시작` | 반영 |
| `CH15-L06.md` | `## CH15-L06 - END-OF-SELECTION의 위치와 경계` | 반영 |
| `CH15-L07.md` | `## CH15-L07 - AUTHORITY-CHECK 권한과 존재 검증` | 반영 |
| `CH15-L08.md` | `## CH15-L08 - Selection Screen 고급 이벤트` | 반영 |
| `CH15-L09.md` | `## CH15-L09 - Selection Screen UI 구성` | 반영 |
| `CH15-L10.md` | `## CH15-L10 - PARAMETERS와 SELECT-OPTIONS 옵션 정리` | 반영 |
| `CH15-L11.md` | `## CH15-L11 - 여러 Selection Screen, CALL, Variant` | 반영 |
| `CH15-L12.md` | `## CH15-L12 - 실습: 공연 예매 조회 리포트` | 반영 |

## 3. 공식 문서 수동 근거

CH15_REWRITE에는 아래 문서를 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapinitialization.htm` | `INITIALIZATION` 실행 시점과 기본값 초기화 경계 확인 |
| `C:\ABAP_DOCU_HTML\abapload-of-program.htm` | `LOAD-OF-PROGRAM`의 로드 시점 성격과 일반 report 기본값 위치 구분 |
| `C:\ABAP_DOCU_HTML\abapstart-of-selection.htm` | `START-OF-SELECTION`과 암묵적 processing block 규칙 확인 |
| `C:\ABAP_DOCU_HTML\abapend-of-selection.htm` | `END-OF-SELECTION`의 obsolete/LDB 중심 성격 확인 |
| `C:\ABAP_DOCU_HTML\abapat_selection-screen.htm` | selection screen event block 기본 성격 확인 |
| `C:\ABAP_DOCU_HTML\abapat_selection-screen_events.htm` | `OUTPUT`, `ON field`, `ON BLOCK`, `ON RADIOBUTTON GROUP`, F1/F4 이벤트 확인 |
| `C:\ABAP_DOCU_HTML\abaploop_at_screen.htm` | `LOOP AT SCREEN INTO wa`와 짧은 형식 회피 근거 확인 |
| `C:\ABAP_DOCU_HTML\abapmodify_screen.htm` | `MODIFY SCREEN FROM wa` 사용 위치와 PBO 성격 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters.htm` | `PARAMETERS`가 data object와 screen field를 함께 만든다는 근거 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters_screen.htm` | checkbox, radiobutton, `OBLIGATORY`, `USER-COMMAND`, `MODIF ID` 확인 |
| `C:\ABAP_DOCU_HTML\abapparameters_value.htm` | `DEFAULT`, `LOWER CASE`, `MEMORY ID`, `VALUE CHECK` 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options.htm` | selection table, low/high 입력, multiple selection 버튼 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options_screen.htm` | `NO-EXTENSION`, `NO INTERVALS`, `MODIF ID` 주의점 확인 |
| `C:\ABAP_DOCU_HTML\abapselect-options_value.htm` | `DEFAULT ... TO`, `OPTION`, `SIGN`, `MEMORY ID` 확인 |
| `C:\ABAP_DOCU_HTML\abapselection-screen*.htm` 계열 | block, line, comment, pushbutton, function key, tabbed block, `MODIF ID` 확인 |
| `C:\ABAP_DOCU_HTML\abapcall_selection_screen.htm` | `CALL SELECTION-SCREEN`, modal 위치, `sy-subrc`, selection-set variant 확인 |
| `C:\ABAP_DOCU_HTML\abapmessage*.htm` 계열 | `MESSAGE`, `WITH`, `INTO`, `RAISING`, message class, message type 확인 |
| `C:\ABAP_DOCU_HTML\abenabap_messages_types.htm` | message type별 흐름 영향이 context-dependent임을 확인 |
| `C:\ABAP_DOCU_HTML\abapauthority-check.htm` | `AUTHORITY-CHECK OBJECT`, `ID ... FIELD`, `ACTVT`, `sy-subrc` 확인 |

무관 문서 배제:

- 일반 `IF`, `CASE`, `DO`, `JOIN` 문서는 CH15 공식 근거로 남기지 않았다.
- CH15 v1의 자동 힌트처럼 `abapselect_join.htm` 등을 selection screen 근거로 사용하지 않았다.

## 4. 공식문서 기반 교정 사항

가장 중요한 교정은 `END-OF-SELECTION`이다.

| 항목 | v2 판정 |
| --- | --- |
| `INITIALIZATION` | 최초 selection screen 기본값 제안 위치 |
| `AT SELECTION-SCREEN OUTPUT` | 화면을 보내기 직전의 PBO 성격 제어 위치 |
| `AT SELECTION-SCREEN` | 입력 검증과 message 피드백 위치 |
| `START-OF-SELECTION` | selection screen 처리 뒤 본 처리 시작 위치 |
| `END-OF-SELECTION` | obsolete/LDB 중심 기존 코드 독해 포인트. 신규 단순 report 표준으로 권장하지 않음 |

추가 교정:

- `LOOP AT SCREEN.` 짧은 내장 work area 형태를 새 예제 코드에 쓰지 않았다.
- selection screen pushbutton, function key, tab command는 `SSCRFIELDS-UCOMM`으로 처리한다고 명시했다.
- `AT SELECTION-SCREEN OUTPUT`에서 값을 반복 대입하면 사용자 입력을 덮어쓸 수 있다는 주의를 넣었다.
- F1/F4 이벤트 중 다른 selection screen 값이 자동으로 ABAP 변수에 운반되지 않는다는 주의를 넣었다.
- `MESSAGE ... INTO`와 `MESSAGE ... RAISING`은 소개하되 CH15 report 입력 검증의 주력으로 확장하지 않았다.
- `AUTHORITY-CHECK`는 존재 검증과 분리하고, 권한 객체 설계 심화로 확장하지 않았다.

## 5. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | Report Event 타임라인, 실패 시 START 잠금 | 통과 |
| L02 | 있음 | 기본값 주입기, 최초 기본값과 반복 덮어쓰기 비교 | 통과 |
| L03 | 있음 | SCREEN 속성 조정 패널, `MODIFY SCREEN` 전후 비교 | 통과 |
| L04 | 있음 | 검증 게이트와 메시지 콘솔, `sy-msg*` 표시 | 통과 |
| L05 | 있음 | 조회 시작 게이트, 검증 통과 후 SELECT 활성화 | 통과 |
| L06 | 있음 | 기존 리포트 독해 모드, `END-OF-SELECTION` 경계 경고 | 통과 |
| L07 | 있음 | 존재 검증과 권한 검증 이중문 | 통과 |
| L08 | 있음 | Selection Screen 반응 실험실, F1/F4 비교 | 통과 |
| L09 | 있음 | Selection Screen 레이아웃 빌더, `SSCRFIELDS-UCOMM` 확인 | 통과 |
| L10 | 있음 | 옵션 스위치보드, `NO-EXTENSION`/`NO INTERVALS` 차이 | 통과 |
| L11 | 있음 | 보조 선택화면과 Variant 금고, `sy-subrc` 분기 | 통과 |
| L12 | 있음 | 공연 예매 리포트 실행 시뮬레이터, 단계별 게이트 | 통과 |

모든 레슨은 단순 설명이 아니라 버튼, 상태, 데이터, 실패 피드백을 가진 체험 설계로 연결된다.

## 6. Classic-first 및 R15 범위 검사

수동 점검 기준:

- ABAP 예제에는 inline declaration을 넣지 않았다.
- constructor expression, object creation expression, string template을 넣지 않았다.
- modern Open SQL host marker와 comma field list를 넣지 않았다.
- `LOOP AT SCREEN` 예제는 `TYPE screen` work area와 `INTO`, `FROM` 형태로 작성했다.
- `SELECT-OPTIONS ... FOR` 예제는 초심자 혼란을 줄이기 위해 전역 기준 변수를 먼저 선언하는 형태로 정리했다.
- `END-OF-SELECTION`은 legacy/LDB 중심 경계로 처리했다.
- SALV, `TYPE REF TO`, `TRY...CATCH`는 CH11 재사용으로만 표시하고 CH20 exception 원리로 확장하지 않았다.
- Authorization object 설계, SU24, role/profile 운영은 후속 보안 심화로 남겼다.
- Selection Screen Variant는 조건값 저장/불러오기까지만 다루고 batch job 운영으로 확장하지 않았다.

## 7. 자동 검색 결과

최종 파일 작성 후 아래 자동 검색을 실행했다.

```powershell
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|공식 문서 체크 힌트|자동 매칭|abapif\.htm|abapcase\.htm|abapselect_join\.htm" reference\codex_0625_v2\CH15_REWRITE.md
```

결과: 출력 없음. v1 템플릿 반복 문구와 무관 공식문서 힌트는 남아 있지 않다.

```powershell
rg -n "SELECT-OPTIONS s_\w+ FOR z\w+-|FOR zbooking-status|FOR ztperson|DATA\(|@DATA|@\w|VALUE #|NEW |FINAL\(|\+=|CREATE OBJECT" reference\codex_0625_v2\CH15_REWRITE.md
```

결과: 출력 없음. 주요 modern ABAP 금지 패턴과 모호한 `SELECT-OPTIONS ... FOR dbtab-field` 패턴은 발견되지 않았다.

```powershell
rg -n "## CH15-L[0-9][0-9]" reference\codex_0625_v2\CH15_REWRITE.md
```

결과: CH15-L01부터 CH15-L12까지 12개 레슨 heading이 모두 존재한다.

주의: `LOOP AT SCREEN.`과 `sy-ucomm` 문자열은 교정 설명과 금지/주의 문맥에서 의도적으로 등장한다. 코드 예제는 `LOOP AT SCREEN INTO gs_screen`과 `SSCRFIELDS-UCOMM` 기준으로 작성했다.

## 8. 잔여 리스크와 다음 단계

- `CH15_REWRITE.md`는 반영 전 원고다. 실제 `content/abap/CH15`로 옮길 때는 각 MD fragment의 금지 요소, front matter, embed 연결 규칙을 별도로 검증해야 한다.
- 예제의 `ZMC_CONCERT`, `Z_CONCERT`, `zconcert`, `zbooking`은 교육용 이름이다. 실제 실습 시스템 객체와 이름이 다르면 content 반영 시 조정이 필요하다.
- L08의 `F4IF_INT_TABLE_VALUE_REQUEST`는 classic report에서 흔히 쓰는 함수형 F4 예제다. 실제 화면에서 더 좋은 DDIC Search Help가 준비되어 있다면 직접 F4보다 DDIC 연결을 우선하도록 본문에 이미 경계를 넣었다.
- L12의 SALV 예제는 CH11 재사용 전제다. 실제 콘텐츠 반영 시 CH11에서 이미 설명한 `TYPE REF TO`, `TRY...CATCH` 수준과 표현을 맞춰야 한다.

## 9. 최종 판정

CH15 v2는 `00_QUALITY_REVIEW.md`의 재작업 판정에 맞춰 v1의 템플릿 반복을 제거했고, 각 레슨을 입문자 기준의 완성 강의자료 원고로 재작성했다. 공식문서 근거는 수동 확인으로 제한했고, R15 게이팅과 classic-first 경계를 지켰다.

판정: 통과.

