# NEWCH29_OLDCH99_QA · Advanced String Processing and Regex

> 대상 파일: `NEWCH29_OLDCH99_REWRITE.md`
> 판정일: 2026-07-06 KST
> 결론: 작성 완료. CH04에서 보류된 regex/SUBMATCHES advanced string processing 공백을 신규 장으로 회수했다.

## 1. 보강 대상과 판정

`00_CONCEPT_GAP_AUDIT.md`의 P2 정밀 판정은 CH04 문자열 기초 이후 다음 개념의 소유 장이 없다고 판단했다.

| 누락 후보 | 기존 상태 | NEWCH29 회수 상태 |
|---|---|---|
| PCRE 정규식 기본 문법 | CH04 `FIND`/`REPLACE` 기초 범위 밖 | L01-L02에서 substring과 pattern의 차이, 문자 class, quantifier, anchor, group, greedy/non-greedy를 설명 |
| `FIND PCRE` | 후속 문자열 심화 장 없음 | L01, L03에서 `FIRST OCCURRENCE`, `ALL OCCURRENCES`, case 옵션, `sy-subrc` 확인 흐름을 설명 |
| `MATCH COUNT/OFFSET/LENGTH` | CH04에서 다루기 과밀 | L03에서 "찾았다"보다 위치/길이 검증이 중요한 이유와 실수 포인트를 설명 |
| `RESULTS` | 여러 occurrence 결과 확인 방법 미소유 | L03-L04에서 match result table과 submatch metadata를 설명 |
| `SUBMATCHES` | 괄호 group 값 추출 미소유 | L04에서 capture group, optional group, non-capturing group, `RESULTS`와의 차이를 설명 |
| `REPLACE PCRE` | 단순 문자열 치환만 존재 | L05에서 pattern 기반 정리, `$1` group substitution, `VERBATIM`, replacement result를 설명 |
| `CL_ABAP_REGEX`/`CL_ABAP_MATCHER` | 객체 기반 regex 반복 사용 미소유 | L06에서 `CREATE_PCRE`, matcher 생성, submatch 조회, statement와 class API 선택 기준을 설명 |
| regex string functions | 조건식/표현식 안의 regex 독해 미소유 | L07에서 `pcre` 인자를 쓰는 함수형 읽기와 예외/과밀 주의를 설명 |
| 실무형 검증 실습 | 개별 문법만으로는 학습 전이가 어려움 | L08에서 로그, 이메일-like text, obsolete keyword 검사 시뮬레이터를 설계 |

## 2. 공식 문서 수동 확인

Classic ABAP 공식 문서는 자동 매칭이 아니라 `C:\ABAP_DOCU_HTML`에서 직접 확인한 항목만 근거로 사용했다.

| 확인 문서 | 반영 위치 | 핵심 확인 |
|---|---|---|
| `abapfind_pattern.htm` | L01, L03, L06 | `FIND`의 `SUBSTRING`, `PCRE`, `REGEX regex_ref` variant와 PCRE/object reference 경계를 확인 |
| `abapfind_options.htm` | L03-L04 | `MATCH COUNT`, `MATCH OFFSET`, `MATCH LENGTH`, `RESULTS`, `SUBMATCHES`, `sy-fdpos` 미사용 주의 확인 |
| `abapreplace_pattern.htm` | L05 | `REPLACE`도 `SUBSTRING`, `PCRE`, `REGEX` pattern을 사용한다는 점 확인 |
| `abapreplace_options.htm` | L05 | `VERBATIM`, `REPLACEMENT COUNT/OFFSET/LENGTH`, `RESULTS`, replacement `$1`/literal 처리 경계 확인 |
| `abenregex_pcre_syntax.htm` | L01-L02, L08 | ABAP statement/function에서 PCRE를 우선 사용하고 extended mode가 기본이라는 점 확인 |
| `abenregex_pcre_syntax_specials.htm` | L02, L05 | character class, quantifier, group, alternation, replacement syntax의 기본 subset 확인 |
| `abenregex_system_classes.htm` | L06 | `CL_ABAP_REGEX=>CREATE_PCRE`, `CREATE_MATCHER`, `CL_ABAP_MATCHER`, POSIX 생성 방식의 obsolete 경계 확인 |
| `abenstring_functions_regex.htm` | L07 | string function의 `pcre` 인자, empty regex 예외, extended mode, too-complex 예외 가능성 확인 |
| `abenregex_exceptions.htm` | L01, L07-L08 | invalid regex, runtime regex exception, `CX_SY_REGEX_TOO_COMPLEX`, 과도한 backtracking 위험 확인 |

## 3. R15 게이팅 점검

NEWCH29는 NEWCH28 이후에 위치하므로 CH18 modern syntax, CH20 exception, CH28 runtime/dynamic 개념 일부를 읽을 수 있다. 하지만 정규식 장 자체가 과도한 parsing/보안/성능 장으로 변질되지 않도록 다음 경계를 유지했다.

| 점검 항목 | 판정 | 근거 |
|---|---|---|
| CH04 문자열 기초와 중복되지 않는가 | 통과 | CH04는 단순 `FIND`/`REPLACE`와 `sy-subrc` 중심이고, NEWCH29는 PCRE, result metadata, capture group, matcher class 중심 |
| CH18 New Syntax 이후에만 가능한 표현을 무리하게 앞당기지 않는가 | 통과 | `FINAL( )`, inline declaration, string template은 CH18에서 이미 학습한 뒤 사용하는 위치다 |
| CH20 이전 예외 지식을 요구하지 않는가 | 통과 | NEWCH29 위치상 `TRY...CATCH`, catchable exception 설명이 가능하며, regex exception은 안전 설계 맥락으로만 사용 |
| CH28 Dynamic ABAP과 섞이지 않는가 | 통과 | regex는 별도 문자열 심화 장으로 독립했고, dynamic type/RTTS와 혼합하지 않음 |
| 후속 ALV/event 장을 침범하지 않는가 | 통과 | 실습은 텍스트 검증기 수준으로 제한하고 ALV event/editing 구현으로 확장하지 않음 |
| PCRE 고급 기능을 과다 노출하지 않는가 | 통과 | lookaround, callout, backtracking control, full parser 설계는 보류 영역으로 명시 |
| Classic-first 경계를 지키는가 | 통과 | Classic ABAP statement인 `FIND`, `REPLACE`, `CL_ABAP_REGEX`, `CL_ABAP_MATCHER` 중심. POSIX/obsolete 경계도 명시 |

## 4. 입문자 강의 흐름 점검

각 레슨은 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 정리" 흐름을 유지한다. 비전공 학습자가 정규식을 기호 암기로 받아들이지 않도록, 모든 주요 개념을 업무 텍스트 문제에서 출발하도록 구성했다.

| 레슨 | 입문자 흐름 점검 |
|---|---|
| L01 substring의 한계 | `FIND 'B-'`가 왜 부족한지에서 시작해 예약번호 형식 검증으로 연결 |
| L02 PCRE 기본 문법 | token 표를 먼저 제시한 뒤 `\d`, `{4}`, `^...$`, group, greedy/non-greedy를 작은 예제로 확인 |
| L03 `FIND PCRE` 결과 검증 | "찾았다"가 아니라 "어디를 얼마나 찾았는가"를 count/offset/length/result로 검증 |
| L04 `SUBMATCHES` | 괄호가 단순 장식이 아니라 값을 꺼내는 통로라는 점을 설명하고 optional group 실수를 분리 |
| L05 `REPLACE PCRE` | 원본을 바꾸는 작업의 위험을 먼저 설명한 뒤 count/result/preview 설계로 안전하게 사용 |
| L06 Regex system classes | 같은 pattern 반복 적용이라는 현실 문제에서 class API 필요성을 도출 |
| L07 Regex string functions | 조건식 안에서 regex를 읽는 법과 statement보다 숨은 비용/예외가 보이지 않는 위험을 설명 |
| L08 종합 실습 | 로그/이메일/code pattern을 한 화면에서 검사하고 상태/데이터/피드백을 분리 |

## 5. 체험/시뮬레이터 설계 점검

요구사항의 "코드가 있으면 프로세스플로우/체험/시뮬레이터/버튼/상태/데이터/피드백 설계를 구체적으로 쓴다" 조건을 아래처럼 반영했다.

| 레슨 | 체험 설계 | 포함 요소 |
|---|---|---|
| L01 | Substring vs Pattern Comparator | 입력 텍스트, substring/PCRE 버튼, anchor 추가 버튼, match highlight, 실패 케이스 피드백 |
| L02 | PCRE Token Builder | token button, pattern state, sample result, greedy/non-greedy toggle |
| L03 | Match Result Inspector | first/all occurrence, count, offset/length, `RESULTS` table, `sy-subrc` 상태 |
| L04 | Capture Group Lab | group number 표시, optional group, non-capturing group, `SUBMATCHES`/`RESULTS` 전환 |
| L05 | Regex Replace Workshop | 원본/preview/결과 분리, `$1` toggle, `VERBATIM`, replacement result grid |
| L06 | Reusable Regex Matcher Lab | regex object 생성, matcher 생성, current text index, submatch panel |
| L07 | Regex Function Console | function selector, pattern/input/result/error state, `pcre` 인자 확인 |
| L08 | Regex Quality Gate Simulator | 검사 탭, run buttons, resultRows, submatchValues, replacementPreview, warning/error feedback |

## 6. 주요 실수 방지 반영

| 실수 | 반영 위치 | 설명 |
|---|---|---|
| regex를 단순 substring보다 항상 좋은 도구로 오해 | 전체 설계, L01, 마무리 | 고정 문자열은 substring이 더 단순하다는 기준 제시 |
| `^...$` 없이 형식 검증을 해서 일부만 맞아도 통과 | L01, L07, L08 | 전체 문자열 검증에는 anchor가 필요하다고 반복 설명 |
| `MATCH OFFSET/LENGTH` 값을 실패 후에도 그대로 믿음 | L03 | 실패 시 초기화/이전값 착각 주의 |
| `sy-fdpos`를 `FIND` 결과로 사용 | L03 | 공식 문서 기준 `FIND`가 `sy-fdpos`를 채우지 않는다고 명시 |
| `SUBMATCHES`와 `RESULTS`를 같은 것으로 이해 | L03-L04, L08 | 값 추출과 metadata table의 차이를 분리 |
| optional group이 비었을 때 initial 값을 정상값으로 오해 | L04 | optional group 전후 상태 확인 필요 |
| replacement `$1`을 literal로 넣어야 하는데 group substitution으로 동작 | L05 | `VERBATIM`과 escaping 경계 설명 |
| `CL_ABAP_REGEX`를 직접 생성해 POSIX 쪽으로 흐름 | L06 | `CREATE_PCRE` factory method 우선 |
| regex string function의 예외 가능성을 숨김 | L07 | empty regex, invalid regex, too-complex 위험 명시 |
| 이메일/HTML/코드 분석을 정규식 하나로 완성하려 함 | L08, 마무리 | "1차 검증"과 parser/전용 도구 경계 명시 |

## 7. 자동 점검

| 점검 | 결과 |
|---|---|
| `NEWCH29_OLDCH99_REWRITE.md` 존재 | 통과 |
| `NEWCH29_OLDCH99_QA.md` 생성 | 통과 |
| 레슨 수 | 8개 레슨 + 전체 설계 + 마무리 |
| 공식 문서 경로 존재 확인 | 통과 |
| R15 보류 영역 명시 | 통과 |
| 체험형 실습 설계 포함 | 통과 |
| 실제 ABAP 시스템 컴파일 | 미수행. 이 작업은 문서 재집필이며, 예제 코드는 공식 문서 기준으로 검토했다 |

## 8. 남은 연결 작업

NEWCH29 자체는 작성 완료다. 다만 전체 커리큘럼 흐름상 다음 연결을 후속 작업에서 확인해야 한다.

1. OLDCH27 ALV event/editing 장이 새 번호 기준 NEWCH30 이후로 밀리는 흐름을 파일명/색인에서 유지한다.
2. CH04 문자열 기초에는 regex가 뒤에서 회수된다는 연결 문구를 나중에 필요하면 추가한다.
3. CH35/CH36 보강 시 regex를 test/report validation 예제로 재사용할 수 있지만, NEWCH29의 내용을 반복하지 않는다.

## 9. 최종 판정

`NEWCH29_OLDCH99_REWRITE.md`는 P2 정밀 판정의 regex/SUBMATCHES 공백을 신규 장으로 회수했다. 기존 `codex_0629_v3` 템플릿 반복 없이, 각 레슨이 입문자 흐름과 실무 검증 흐름을 갖춘 완성 강의자료 수준으로 작성되었다.

최종 판정: **통과**
