# CH04_QA - codex_0629_v3 품질 점검

> 대상 파일: `reference/codex_0629_v3/NEWCH04_OLDCH04_REWRITE.md`
> 작업 단위: CH04 모든 레슨
> 판정: CH04 v3 산출물 생성 완료. `content/abap` 원본을 기준으로 재집필했고, 기존 `codex_0625`의 템플릿 반복과 자동 매칭식 공식 힌트는 재사용하지 않았다.

## 1. 입력 소스 확인

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH04/_chapter.md` |
| 원본 레슨 | `CH04-L01.md` ~ `CH04-L07.md` 전부 확인 |
| 프로젝트 규칙 | R2 code=experience, R3 입문자 흐름, R6 classic-first, R15 concept gating 기준 적용 |
| 커리큘럼 원장 | `.project-docs/09_CURRICULUM_LEDGER.md`의 CH04 7레슨 구성 확인 |
| 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md`의 CH04 연산자/문자열/IF/CASE/루프/디버거 배치 확인 |
| 기존 reference | `reference/codex_0625/CH04_연산자와-흐름-제어.md` 확인. 템플릿 반복, L04 본문 빈약, 공식문서 힌트 자동 매칭 문제가 있어 본문 재사용하지 않음 |
| 기존 임베드 | `embeds/abap/CH04-L01-S01.html` ~ `CH04-L07-S01.html` 확인. 각 레슨의 체험 설계에 연결 |

## 2. 공식 문서 수동 확인

Classic ABAP 관련 공식 근거는 `C:\ABAP_DOCU_HTML`에서 파일명을 직접 확인했다. 자동 힌트 매칭은 사용하지 않았다.

| 레슨 | 확인 파일 | 반영 내용 |
|---|---|---|
| L01 | `abenarith_operators.htm` | `+`, `-`, `*`, `/`, `DIV`, `MOD`, `**`의 역할과 우선순위 반영 |
| L01 | `abapcompute_arith.htm` | arithmetic expression, arithmetic runtime error 가능성 확인 |
| L01 | `abapadd.htm`, `abapsubtract_multiply_divide.htm` | classic `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE` 읽기 능력 보강. zero divide 예외 위험 반영 |
| L01 | `abapclear.htm` | `CLEAR`가 타입별 initial value를 대입한다는 설명 반영 |
| L01 | `abendate_time_processing.htm`, `abendate_time_source_fields.htm` | 날짜/시간 필드 처리 범위 확인. CH04 본문은 날짜 + 일수, 날짜 차이 중심으로 제한 |
| L02 | `abapconcatenate.htm` | `CONCATENATE ... INTO`, `SEPARATED BY` 반영 |
| L02 | `abapsplit.htm` | `SPLIT ... AT ... INTO`가 문자열을 세그먼트로 나누는 동작 반영 |
| L02 | `abapfind.htm` | `FIND`가 search pattern을 찾고 `sy-subrc` 확인에 연결됨을 반영 |
| L02 | `abapreplace.htm` | pattern-based replacement와 position-based replacement 범위 중 입문용 `FIRST OCCURRENCE` 중심 반영 |
| L02 | `abapcondense.htm` | leading/trailing blanks 제거, 내부 blank 축약, `NO-GAPS` 반영 |
| L02 | `abapshift.htm` | shift와 leading character deletion 예시 반영 |
| L02 | `abaptranslate.htm` | 대소문자 변환 반영 |
| L02 | `abapoverlay.htm` | blank 또는 mask 위치를 덮는 레거시 문자열 처리로 소개 |
| L02 | `abapwrite_to.htm` | `WRITE TO`가 출력이 아니라 formatted character value를 target에 넣는 문장임을 반영 |
| L02 | `abenstring_functions.htm`, `abenstring_functions_val.htm` | string function과 `strlen( )` 설명 반영 |
| L03 | `abapif.htm` | `IF`, `ELSEIF`, `ELSE`, `ENDIF`가 최대 하나의 statement block을 실행한다는 설명 반영 |
| L03 | `abenlogexp.htm` | logical expression이 truth value를 만든다는 설명 반영 |
| L03 | `abenlogexp_and.htm`, `abenlogexp_or.htm`, `abenlogexp_not.htm`, `abenlogexp_bracket.htm` | `AND`, `OR`, `NOT`, parentheses 우선순위와 의미 반영 |
| L03 | `abenlogexp_initial.htm` | `IS INITIAL`이 타입별 initial value를 검사한다는 설명 반영 |
| L03 | `abenboole_functions.htm` | `boolc( )`, `xsdbool( )`이 논리식의 truth value를 타입별 값으로 표현한다는 설명 반영 |
| L04 | `abapcase.htm` | `CASE ... WHEN ... WHEN OTHERS ... ENDCASE`가 기준 값에 따라 최대 한 블록을 실행한다는 설명 반영 |
| L05 | `abapdo.htm` | `DO [n TIMES]`, 루프 종료 방식, `sy-index` 활용 반영 |
| L05 | `abapwhile.htm` | `WHILE log_exp` 조건 반복과 무한 루프 주의 반영 |
| L05 | `abapexit_loop.htm` | 루프 안 `EXIT`는 현재 루프를 끝내고 닫는 문장 뒤로 이동함을 반영 |
| L05 | `abapcontinue.htm` | `CONTINUE`는 현재 loop pass를 끝내고 다음 회차로 진행함을 반영 |
| L05 | `abapcheck_loop.htm` | 루프 안 `CHECK`가 조건 거짓 시 현재 회차를 종료한다는 설명 반영 |
| L05 | `abensystem_fields.htm` | 시스템 필드는 문서화된 영향이 있는 시점에만 신뢰해야 하며, `sy-subrc`를 바로 확인해야 한다는 주의 반영 |
| L06 | `abapbreak-point.htm` | `BREAK-POINT`가 active breakpoint에서 ABAP Debugger로 분기한다는 설명 반영 |

## 3. ABAP Cloud / Clean Core / NotebookLM 확인 범위

CH04는 Track 1의 Classic ABAP 입문 챕터이며 ABAP Cloud, Clean Core, RAP, released API, cloud extensibility를 도입하지 않는다. 따라서 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 기반 Cloud/Clean Core 문서 힌트는 생성하지 않았다. 관련 주장도 본문에 추가하지 않았다.

NotebookLM과 인터넷 검색은 사용하지 않았다. 로컬 원본, 프로젝트 SSOT, `C:\ABAP_DOCU_HTML` 수동 확인으로 충분했다.

## 4. R15 게이팅 점검

| 항목 | 판정 | 근거 |
|---|---|---|
| Classic-first | 통과 | `DATA(...)`, `VALUE`, `NEW`, constructor expression, modern Open SQL, string template 예제 없음 |
| `&&` 예외 | 통과 | 원장 승인 예외로 L02 문자열 연결에서만 사용. 문자열 템플릿은 CH18로 분리 |
| 복합 대입 | 통과 | 복합 대입 예제 없음. `gv_total = gv_total + 500.`로 classic-first 유지 |
| `COMPUTE` | 통과 | obsolete로 본문 예제화하지 않음 |
| `MOVE` | 통과 | 레거시 언급만 하고 기본 대입은 `=` 사용 |
| `SEARCH` | 통과 | obsolete 경계로만 언급하고 새 설명은 `FIND` 사용 |
| regex/SUBMATCHES | 통과 | CH04 범위 밖으로 두고 본문 예제화하지 않음 |
| Selection screen 심화 | 통과 | `PARAMETERS`는 CH03 선행 지식으로 사용. checkbox/radio/block/pushbutton은 CH15로 남김 |
| `START-OF-SELECTION` | 통과 | CH04 예제에는 사용하지 않음 |
| Internal Table | 통과 | `SPLIT ... INTO TABLE` 등 다건 문자열 처리는 CH06 이후로 미룸 |
| FORM/Function/Method | 통과 | 디버거 F6/F7 설명에서 후속 재방문으로만 언급 |
| Exception handling | 통과 | zero divide와 dump 위험만 설명. `TRY/CATCH`는 CH20로 남김 |

## 5. 레슨별 품질 점검

| 레슨 | 왜 필요한가 | 무엇인가 | 어떻게 확인 | 실수/주의 | 체험 설계 | 정리 |
|---|---|---|---|---|---|---|
| CH04-L01 | 통과 | 통과 | 통과 | 통과 | 산술 스텝 디버거 연결 | 통과 |
| CH04-L02 | 통과 | 통과 | 통과 | 통과 | 문자열 빈칸, 공백/찾기/바꾸기 확장 설계 | 통과 |
| CH04-L03 | 통과 | 통과 | 통과 | 통과 | IF 흐름도와 조건 검사 상태 설계 | 통과 |
| CH04-L04 | 통과 | 통과 | 통과 | 통과 | CASE 분기 시뮬레이터 설계 | 통과 |
| CH04-L05 | 통과 | 통과 | 통과 | 통과 | DO/sy-index 스텝 디버거와 WHILE 안전 정지 설계 | 통과 |
| CH04-L06 | 통과 | 통과 | 통과 | 통과 | 디버거 버튼/F5/F8/watchpoint 시뮬레이터 설계 | 통과 |
| CH04-L07 | 통과 | 통과 | 통과 | 통과 | 구구단 빈칸과 2차원 표 시뮬레이터 설계 | 통과 |

## 6. 체험·시뮬레이터 설계 점검

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 산술 | 시작/다음/다시하기 버튼, 실행 전/후 라인 강조, 변수 모니터, 괄호/타입/0 나누기 실험 |
| L02 문자열 | 채점/정답/다시하기 버튼, 공백 정리/대문자 변환/찾기/바꾸기 확장 버튼, `sy-subrc` 피드백 |
| L03 IF | `p_amt` 입력, 조건 검사 단계, 첫 참 조건 이후 하위 조건 비활성화, `gv_is_large` 표시 |
| L04 CASE | 등급 입력, `WHEN` 검사 순서, `WHEN OTHERS` 도달, `OR` 묶기 비교 |
| L05 반복 | 회차 막대, `sy-index` 변수 모니터, `CONTINUE` 건너뛰기, WHILE 무한 루프 예방 피드백 |
| L06 디버깅 | breakpoint 도착, F5 한 줄 실행, F8 계속 실행, watchpoint 조건 정지, 변수 값 변경 주의 |
| L07 구구단 | 한 단/전체/범위 실행 버튼, 입력 검증, 2차원 표 현재 칸 강조, 디버거 모드 |

## 7. 기존 codex_0625 대비 개선

| 기존 문제 | v3 조치 |
|---|---|
| 템플릿식 "왜/무엇/어떻게" 반복 | 각 레슨의 업무 동기와 다음 장 연결을 직접 서술 |
| L04 CASE 본문 빈약 | `IF`와 비교, `WHEN OTHERS`, `WHEN 'A' OR 'B'`, 범위 조건과의 경계까지 보강 |
| 공식문서 힌트 자동 매칭 | 로컬 `C:\ABAP_DOCU_HTML`에서 파일명을 직접 확인하고 QA에 기록 |
| 체험 설계 추상적 | 버튼, 상태, 데이터, 피드백을 레슨별로 구체화 |
| R15 경계 약함 | `&&` 예외 외 modern syntax 차단, 문자열 템플릿/복합 대입/TRY/CATCH/START-OF-SELECTION 미사용 |
| 디버깅 설명 절차 부족 | `/h`, `BREAK-POINT`, F5/F8, watchpoint, 변수 변경 주의, ST22 학습 관점 보강 |

## 8. 코드 예제 점검

| 점검 항목 | 결과 |
|---|---|
| ABAP 문장 종결 마침표 | 통과 |
| classic `DATA gv TYPE ...` 형식 | 통과 |
| inline declaration 없음 | 통과 |
| 문자열 템플릿 없음 | 통과 |
| modern SQL 없음 | 통과 |
| `PARAMETERS` 사용 범위 | CH03 선행 지식으로 단순 입력만 사용 |
| `sy-index` 중첩 루프 주의 | 바깥 단수는 `gv_dan`에 저장하도록 설명 |
| `sy-subrc` 설명 | `FIND` 직후 확인으로 제한, CH06/CH08 심화 예고 수준 |

## 9. 최종 판정

CH04 v3 산출물은 생성 완료로 판정한다. 원본 `content/abap/CH04`의 모든 레슨을 포함했고, 공식 문서 수동 확인 근거를 QA에 기록했으며, 기존 `codex_0625`의 템플릿 반복을 제거했다. 각 레슨은 입문자 기준의 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리" 흐름을 갖춘다.

남은 후속 작업은 실제 사이트 MD로 이식할 때 임베드와 본문 문단을 연결하고, 브라우저에서 임베드 높이와 버튼 상태를 검증하는 것이다. 이번 산출물 범위는 reference 재집필 자료이므로 실제 `content/abap/CH04` 파일은 수정하지 않았다.
