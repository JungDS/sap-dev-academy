# CH18_QA · Modern ABAP Syntax 재작성 검수

> 대상 산출물: `reference/codex_0625_v2/CH18_REWRITE.md`  
> 기준 문서: `reference/codex_0625/00_QUALITY_REVIEW.md`  
> 작업 단위: CH18 1개 챕터

## 1. 재작업 판정 반영

`00_QUALITY_REVIEW.md`의 핵심 판정은 기존 `codex_0625`가 실제 완성 강의자료가 아니라 반복 템플릿에 가까웠다는 점이다. CH18 v2는 다음 방식으로 재작업했다.

| 품질 이슈 | v1 문제 | v2 조치 |
|---|---|---|
| 템플릿 반복 | 각 레슨이 비슷한 "왜 중요한가/보강 방향/공식 힌트" 구조로 반복됨 | 레슨별 문법의 실제 사용 맥락을 기준으로 직접 서술. 같은 문장 묶음을 반복하지 않음 |
| 입문자 설명 부족 | 코드 조각은 있으나 왜 필요한지와 실패 모델 설명이 얕음 | 모든 레슨을 `왜 필요한가 → 무엇인가 → 어떻게 확인하는가 → 실수/주의 → 정리` 흐름으로 재작성 |
| 체험 중심 부족 | 추상적인 학습 장치 제안에 머무름 | 각 레슨마다 데이터, 버튼, 상태, 피드백까지 구체화 |
| 공식문서 힌트 자동 매칭 | 넓은 키워드 기반으로 관련 없는 문서가 섞일 위험 | CH18 핵심 문법별 ABAP_DOCU 파일을 수동 확인하고 본문에 반영 |
| R15 위험 | Modern Syntax 장에서 SQL/OO/예외 처리까지 섞일 위험 | CH18 허용 범위와 CH19/CH20 보류 범위를 챕터 시작과 레슨별 주의에 명시 |

판정: v1의 반복 템플릿 문제를 그대로 확장하지 않고, CH18 전용 완성 강의자료로 재작성했다.

## 2. 소스 커버리지

| 원본 | v2 반영 위치 | 비고 |
|---|---|---|
| `content/abap/CH18/_chapter.md` | `CH18의 역할`, `CH18 마무리 정리` | "classic에서 modern으로"라는 장 목표를 R15 경계와 함께 재정의 |
| `CH18-L01.md` Inline Declaration | `CH18-L01 · Inline Declaration` | `DATA( )`, `FINAL( )`, 타입 추론, scope, SELECT inline 보류 |
| `CH18-L02.md` VALUE Constructor | `CH18-L02 · VALUE Constructor Expression` | structure, table, `BASE`, `VALUE #( FOR )`까지 반영 |
| `CH18-L03.md` CORRESPONDING | `CH18-L03 · CORRESPONDING과 구조 매핑` | same-name mapping, `MAPPING`, `EXCEPT`, 방향성 설명 |
| `CH18-L04.md` Table Expression | `CH18-L04 · Table Expression` | `itab[ ]`, `line_exists`, `line_index`, missing row 실패 모델 |
| `CH18-L05.md` String Template | `CH18-L05 · String Template과 내장 함수` | `{ }`, format option, string functions |
| `CH18-L06.md` Legacy Refactor | `CH18-L06 · Legacy 코드의 Modern ABAP 리팩터링` | 기존 `CH18-L06-S01` diff-mapper 중심으로 검증 흐름 보강 |
| `CH18-L07.md` Concert Refactor | `CH18-L07 · 실습: 콘서트앱 모던 리팩터` | 콘서트 예매 관통 예제에 CH18 범위만 적용 |

누락된 레슨 없음. CH18 원본 7개 레슨을 모두 별도 절로 반영했다.

## 3. 공식 문서 수동 확인 반영

자동 매칭 대신 `C:\ABAP_DOCU_HTML`에서 다음 문서를 수동 확인했다.

| 주제 | 확인 문서 | 반영 내용 |
|---|---|---|
| Inline declaration | `abeninline_declarations.htm` | declaration position 개념, inline 선언의 의도 |
| `DATA( )` inline | `abendata_inline.htm` | 타입은 operand type에서 정적으로 유도되어야 함, 선언 위치 이후 사용 가능 |
| `FINAL( )` inline | `abenfinal_inline.htm` | 선언 후 write access 금지, loop 안 반복 대입과 일반 재대입 차이 |
| `VALUE` constructor | `abenconstructor_expression_value.htm` | `VALUE type( ... )`, `#`는 기대 타입이 명확해야 함 |
| structure `VALUE` | `abenvalue_constructor_params_struc.htm` | named component assignment, `BASE`의 복사 후 덮어쓰기 의미 |
| internal table `VALUE` | `abenvalue_constructor_params_itab.htm` | row parentheses, `BASE`, `FOR`, unique key 중복 위험 |
| `CORRESPONDING` | `abenconstructor_expr_corresponding.htm` | 구조체/테이블 constructor expression, same-name mapping |
| `MAPPING`/`EXCEPT` | `abencorresponding_constr_mapping.htm` | `MAPPING target = source`, `EXCEPT`의 대상 필드 기준 |
| Table expression | `abentable_expressions.htm` | missing row는 `READ TABLE`처럼 `sy-subrc`로 판단하지 않음 |
| `line_exists` | `abenline_exists_function.htm` | table expression 존재 여부 확인, `READ TABLE ... TRANSPORTING NO FIELDS` 성격 |
| `line_index` | `abenline_index_function.htm` | found index, not found `0`, hashed 접근의 `-1` 가능성 |
| String template | `abenstring_templates.htm` | `|...|`, embedded expression 구조 |
| Template expression | `abenstring_templates_expressions.htm` | `{ expr }`, 공백, 표현식 평가 |
| Template format | `abenstring_templates_predef_format.htm` | `DATE = USER`, `NUMBER = USER` 같은 표시 옵션 |
| String functions | `abensubstring_functions.htm`, `abenstring_processing_expr_func.htm` | `substring`, `to_upper`, `strlen`의 표현식 사용과 범위 주의 |
| Calculation assignment | `abencalculation_assignments.htm` | `+=`, `-=`, `*=`, `/=`는 기존 numeric lhs에 적용 |

공식 문서 확인 결과로 본문에 반영한 주요 교정:

- table expression은 `sy-subrc` 기반 판단이 아님을 반복해서 명시했다.
- `line_exists`와 `line_index`를 table expression의 안전 장치로 설명했다.
- `VALUE`에서 `BASE`가 없으면 기존 테이블 유지가 아니라 새 값 대입이라는 점을 강조했다.
- `VALUE #( FOR )`를 CH18-L02에 정식 포함했다.
- `CORRESPONDING`의 `MAPPING` 방향을 `대상 = 원본`으로 명확히 썼다.
- string template에서 날짜/숫자 형식 옵션과 embedded expression 공백 습관을 설명했다.
- `+=`는 inline 선언이 아니라 이미 존재하는 왼쪽 변수에 대한 계산 대입이라고 분리했다.

## 4. R15 및 classic-first 경계

CH18은 New Syntax가 열리는 장이므로 `DATA( )`, `FINAL( )`, `VALUE`, `CORRESPONDING`, table expression, string template, calculation assignment를 정식 사용했다. 동시에 다음 경계를 지켰다.

| 경계 | 처리 |
|---|---|
| New Open SQL | SELECT문의 modern SQL 문법은 설명 대상에서 제외. 본문에서는 CH19 보류로만 언급 |
| OO/객체 생성 | `NEW`, class 설계, OO 예외 처리는 다루지 않음 |
| 예외 처리 | table expression의 missing row 위험은 설명하되 예외 처리 구문 본격 코드는 CH20 보류 |
| 고급 constructor 식 | `COND`, `SWITCH`, `REDUCE`, `FILTER`, `CONV`는 CH18 본문에 도입하지 않음 |
| 과밀 expression | 한 줄에 여러 modern syntax를 몰아넣는 예를 "나쁜 교육용 코드"로 경고 |

주의: CH18은 classic-only 장이 아니다. `DATA( )`, `VALUE`, `|...|`, `+=` 등은 이번 장에서 허용되는 정식 학습 대상이다. 따라서 CH01~CH17과 같은 "modern syntax 미노출" 기준을 그대로 적용하면 안 된다.

## 5. 체험형 학습 설계 점검

| 레슨 | 설계한 학습 장치 | 데이터 | 버튼/상태/피드백 구체성 |
|---|---|---|---|
| L01 | Inline 선언 위치 판정기 | `lt_booking`, 선언 위치 카드 | `DATA()`, `FINAL()`, 한 줄 실행, 재대입 시도. allowed/blocked/readonly 상태 |
| L02 | VALUE Builder | `ty_line`, `lt_gugu`, key 모드 | 구조체/테이블/BASE/FOR/중복 key 버튼. before/expression/after/warning 상태 |
| L03 | Field Mapping Board | source/target 구조체 필드 | 자동 매칭, MAPPING, EXCEPT, 결과 보기. 방향 오류 피드백 |
| L04 | READ TABLE vs Table Expression 비교기 | 예매 3행, 검색 ID | READ TABLE, table expression, line_exists, line_index. sy-subrc/exception/index 상태 |
| L05 | Message Composer | 이름, 날짜, 합계, 구구단 행 | CONCATENATE/template/user format/substring 버튼. 출력 문자열과 범위 경고 |
| L06 | Legacy Refactor Diff Lab | classic/modern 코드 diff | 변경 줄 보기, 동작 결과 비교, R15 경계 검사, 되돌리기 |
| L07 | Concert Refactor Lab | `lt_book`, `lv_id`, capacity, 합계 | classic 실행, modern 실행, 결과 비교, 없는 예매번호 테스트, 경계 검사 |

판정: 단순히 "시뮬레이터 필요"라고 적지 않고, 구현자가 바로 위젯 설계로 옮길 수 있는 수준의 데이터/상태/피드백을 레슨마다 작성했다.

## 6. 남은 위험과 보완 권장

| 위험 | 상태 | 보완 |
|---|---|---|
| 기존 embed `CH18-L07-S01`에 보호 없는 table expression이 보일 수 있음 | rewrite 본문에서 보호 필요성을 명확히 보완 | 실제 content 반영 시 embed tooltip 또는 코드 패널에 `line_exists` 경고 추가 권장 |
| `VALUE #( FOR )`가 입문자에게 과밀하게 느껴질 수 있음 | L02와 최종 과제에서 "복잡하면 LOOP가 낫다"는 기준을 명시 | 실습 UI에서 `LOOP` 버전과 `FOR` 버전 비교 탭 권장 |
| CH18 이후 장에서 `COND`/`SWITCH` 등 미도입 constructor 식이 다시 필요할 가능성 | 현재 audit 기준 사용처 없음 | 향후 사용처가 생기면 CH18 확장 레슨 또는 Track-2 보강 필요 |
| release 차이 | ABAP_DOCU 758 기준으로 확인 | 실제 수강 시스템 release가 낮으면 문법 지원 여부 별도 확인 필요 |

## 7. 자동 점검 기록

작업 후 다음 점검을 수행했다.

| 점검 | 결과 |
|---|---|
| v1 반복 템플릿 문구 검색 | v1의 반복형 도입/예제/문서힌트 문구와 부정확한 자동 문서 힌트 파일명 모두 매치 없음 |
| CH18 이후 경계 문법 검색 | SELECT modern SQL, OO 생성/클래스 정의, 본격 예외 처리 구문, `COND/SWITCH/REDUCE/FILTER/CONV` 도입 패턴 매치 없음 |
| 레슨 헤딩 검색 | `CH18-L01` ~ `CH18-L07` 총 7개 확인 |
| Markdown whitespace 검사 | `git diff --check` 통과 |
| ABAP_DOCU 파일 존재 확인 | QA에 기재한 공식 문서 파일 모두 `C:\ABAP_DOCU_HTML`에서 존재 확인 |

## 8. 최종 판정

CH18 v2는 `00_QUALITY_REVIEW.md`의 재작업 필요 판정을 반영해 작성되었다.

- 기존 템플릿 반복 문구를 재사용하지 않았다.
- CH18의 7개 레슨을 모두 완성 강의자료 흐름으로 재서술했다.
- 입문자가 놓치기 쉬운 실패 모델과 검증 방법을 레슨마다 포함했다.
- 공식 ABAP Keyword Documentation을 수동 확인한 문법 근거를 반영했다.
- CH18에서 허용되는 modern syntax와 CH19/CH20 이후 경계를 분리했다.
- 체험형 학습 장치를 버튼/상태/데이터/피드백 수준으로 구체화했다.

판정: **통과**.  
단, 실제 `content/abap/CH18`에 반영할 때는 기존 embed의 table expression 안전 경고를 UI에도 함께 보강하는 것이 좋다.
