# NEWCH29_OLDCH99_REWRITE · Advanced String Processing and Regex

> 주 소스: 신규 집필. `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`의 P2 판정에서 확정한 regex/SUBMATCHES advanced string processing 공백을 회수한다.
> 연결 위치: NEWCH28_OLDCH99 Dynamic ABAP 이후, 기존 OLDCH27 ALV event/editing 계열 이전.
> 목표: CH04에서 배운 단순 `FIND`/`REPLACE`를 넘어, PCRE 정규식으로 문자열 패턴을 찾고, 위치/길이/그룹을 검증하고, 실무 로그/이메일/코드 텍스트를 안전하게 검사하는 능력을 만든다.

## NEWCH29 전체 설계

CH04에서 문자열 처리는 입문자에게 아주 기본적인 도구였다.

```abap
FIND 'ABAP' IN gv_text.
REPLACE FIRST OCCURRENCE OF 'old' IN gv_text WITH 'new'.
```

이 정도면 "문장 안에 특정 단어가 있는가", "딱 한 단어를 바꾸는가"는 처리할 수 있다. 그러나 실무 텍스트는 그렇게 단순하지 않다.

```text
Booking B-2026-0007 failed for user HUNYOUNG at 2026-07-06 14:30:05
Contact: hunyoung@example.com
Amount: KRW 120,000
```

여기서 개발자가 원하는 것은 단순히 `FIND 'failed'`가 아니다.

- Booking 번호가 `B-YYYY-NNNN` 형식인지 확인하고 싶다.
- 로그에서 날짜, 시간, 사용자 ID를 따로 뽑고 싶다.
- 이메일 주소처럼 보이는 문자열을 찾고 싶다.
- 숫자만 남기거나, 여러 공백을 하나로 줄이고 싶다.
- HTML tag나 괄호 안 문자열을 너무 많이 잡아먹지 않게 찾고 싶다.
- 찾은 모든 위치를 표로 보고, 어느 group이 매칭됐는지 확인하고 싶다.

이때 필요한 도구가 정규식(Regular Expression, 문자열 패턴을 표현하는 작은 언어)이다. ABAP에서는 `FIND PCRE`, `REPLACE PCRE`, `SUBMATCHES`, `RESULTS`, `CL_ABAP_REGEX`, `CL_ABAP_MATCHER`, regex 기반 string function을 통해 정규식을 사용한다.

이 장의 목표는 정규식 문법 백과사전을 만드는 것이 아니다. IT 비전공 학습자가 다음 질문에 답할 수 있게 만드는 것이다.

| 질문 | 기대 답 |
|---|---|
| substring과 regex는 무엇이 다른가? | substring은 글자 그대로 찾고, regex는 숫자/문자/반복/선택/group 같은 패턴을 찾는다. |
| ABAP에서는 어떤 regex 문법을 우선 쓰는가? | 새 코드에서는 PCRE를 우선한다. POSIX 방식은 obsolete 경계로 둔다. |
| `MATCH OFFSET`/`MATCH LENGTH`는 왜 필요한가? | 찾은 문자열의 시작 위치와 길이로 원문을 다시 잘라 검증하기 위해 필요하다. |
| `SUBMATCHES`는 무엇을 가져오는가? | 괄호로 잡은 capture group의 내용을 변수로 가져온다. |
| `RESULTS`는 언제 쓰는가? | 여러 occurrence의 offset, length, submatch metadata를 table/structure로 검증할 때 쓴다. |
| `REPLACE PCRE`에서 `$1`은 무엇인가? | 첫 번째 capture group을 replacement text에 다시 끼워 넣는 group substitution이다. |
| `CL_ABAP_REGEX`/`CL_ABAP_MATCHER`는 왜 필요한가? | 같은 정규식을 여러 텍스트에 반복 적용하거나 matcher 상태와 submatch를 객체로 다룰 때 필요하다. |
| 정규식은 언제 피해야 하는가? | 단순 포함 여부, 고정 문자열 치환, 파서가 필요한 복잡한 문법에는 정규식보다 더 단순하거나 구조화된 도구를 우선한다. |

## NEWCH29 R15 경계

NEWCH29는 CH04 문자열 기초, CH18 Modern Syntax, CH20 Exception, NEWCH28 Dynamic ABAP 이후에 온다. 따라서 inline `DATA`, string template, `TRY...CATCH`, class method 사용은 가능하다. 그러나 regex가 모든 텍스트 처리의 최종 해답은 아니다.

| 구분 | NEWCH29에서 정식 사용 | NEWCH29에서 보류 |
|---|---|---|
| 검색 | `FIND PCRE`, `FIRST OCCURRENCE`, `ALL OCCURRENCES`, `RESPECTING/IGNORING CASE` | `FIND IN TABLE` 심화, 대용량 streaming parser |
| 결과 확인 | `MATCH COUNT`, `MATCH OFFSET`, `MATCH LENGTH`, `RESULTS`, `SUBMATCHES`, `sy-subrc` | 모든 `MATCH_RESULT` 세부 component 암기, table line 기반 다중 파일 검색 |
| PCRE 문법 | literal, escape, character class, `\d`, `\w`, `.`, `*`, `+`, `?`, `{m,n}`, `^`, `$`, alternation, grouping, greedy/non-greedy | lookaround 전체, backtracking control, callout, conditional pattern |
| 치환 | `REPLACE PCRE`, `REPLACEMENT COUNT/OFFSET/LENGTH`, `RESULTS`, `$1`, `$0`, `VERBATIM` 경계 | 모든 case conversion replacement syntax, 복잡한 conditional substitution |
| 객체 API | `CL_ABAP_REGEX=>CREATE_PCRE`, `CREATE_MATCHER`, `CL_ABAP_MATCHER->MATCH`, `GET_SUBMATCH` | callout handler, XPath/XSD regex, POSIX 직접 생성 |
| 함수형 처리 | `contains`, `matches`, `count`, `find`, `match`, `replace`의 `pcre` 인자 감각 | ABAP SQL `LIKE_REGEXPR`, `REPLACE_REGEXPR`, CDS regex 함수 |
| 실습 | 로그 파서, 이메일/예약번호 검증, 공백 정리, 코드 패턴 점검 | 완전한 이메일 RFC 검증기, HTML/XML parser 대체, 보안 스캐너 |

> 정규식은 텍스트를 빠르게 검사하고 추출하는 도구다. 그러나 구조화된 문서, 복잡한 프로그래밍 언어 문법, 보안 규칙 전체를 정규식 하나로 해결하려고 하면 학습자와 시스템 모두에게 위험하다.

## 공식 문서 수동 확인 근거

Classic ABAP 공식 문서는 자동 키워드 매칭으로 결론 내리지 않고 `C:\ABAP_DOCU_HTML`에서 관련 파일을 직접 열어 확인했다.

| 주제 | 확인 문서 | NEWCH29 반영 포인트 |
|---|---|---|
| `FIND` pattern | `abapfind_pattern.htm` | `SUBSTRING`, `PCRE pcre`, `REGEX regex_ref` variant를 확인했다. `PCRE`는 character-like operand, `REGEX`는 `CL_ABAP_REGEX` object reference를 받는다. |
| `FIND` options | `abapfind_options.htm` | `MATCH COUNT`, `MATCH OFFSET`, `MATCH LENGTH`, `RESULTS`, `SUBMATCHES`, `RESPECTING/IGNORING CASE`, `sy-fdpos` 미사용을 확인했다. |
| `REPLACE` pattern | `abapreplace_pattern.htm` | `REPLACE`도 `SUBSTRING`, `PCRE`, `REGEX` pattern을 사용하며 `FIND`와 같은 search pattern 원리를 사용한다. |
| `REPLACE` options | `abapreplace_options.htm` | `VERBATIM`, `REPLACEMENT COUNT/OFFSET/LENGTH`, `RESULTS`, replacement `$1`과 literal 처리 경계를 확인했다. |
| PCRE 문법 | `abenregex_pcre_syntax.htm`, `abenregex_pcre_syntax_specials.htm` | ABAP statement/function의 PCRE는 extended mode가 기본이며, whitespace/# 처리, greedy/non-greedy, capture substitution, PCRE 우선 경계를 확인했다. |
| Regex system classes | `abenregex_system_classes.htm` | `CL_ABAP_REGEX`, `CL_ABAP_MATCHER`, `CREATE_PCRE`, `CREATE_MATCHER`, `MATCH`, `GET_SUBMATCH`, `CREATE_POSIX` obsolete 경계를 확인했다. |
| Regex string functions | `abenstring_functions_regex.htm` | string function의 `pcre` 인자, empty regex 예외, extended mode, `CX_SY_REGEX_TOO_COMPLEX` 가능성을 확인했다. |
| Regex exception | `abenregex_exceptions.htm` | invalid regex, runtime regex exception, `CX_SY_REGEX_TOO_COMPLEX`, 과도한 backtracking 위험을 확인했다. |

## NEWCH29-L01 · 왜 정규식이 필요한가: substring의 한계

### 왜 필요한가

단순 substring 검색은 "그 글자가 그대로 있는가"만 묻는다.

```abap
DATA(lv_text) = `Booking B-2026-0007 failed`.

FIND `failed` IN lv_text.
IF sy-subrc = 0.
  WRITE / `Failure log found`.
ENDIF.
```

이 코드는 좋다. `failed`라는 고정 단어를 찾는 요구에는 정규식이 필요 없다.

하지만 다음 요구는 다르다.

```text
Booking ID must look like B-2026-0007.
```

여기서 `B-2026-0007`만 찾으면 부족하다. `B-2026-0008`, `B-2027-1234`도 같은 형식으로 인정해야 한다. 반대로 `B-26-7`, `X-2026-0007`, `B-2026-ABC`는 거절해야 한다.

정규식은 바로 이런 "글자 그대로"가 아니라 "형식"을 찾을 때 필요하다.

### 무엇인가

정규식은 문자열 패턴을 표현하는 작은 언어다.

| 표현 | 의미 | 예 |
|---|---|---|
| `B-` | 문자 `B-` 그대로 | `B-2026-0007`의 시작 |
| `\d` | 숫자 한 자리 | `2`, `0`, `7` |
| `\d{4}` | 숫자 네 자리 | `2026` |
| `-` | 하이픈 그대로 | `-` |
| `\d{4}` | 숫자 네 자리 | `0007` |

따라서 예약번호 형식은 다음처럼 표현할 수 있다.

```text
B-\d{4}-\d{4}
```

ABAP에서는 PCRE 정규식을 다음처럼 사용한다.

```abap
DATA(lv_text) = `Booking B-2026-0007 failed`.

FIND PCRE `B-\d{4}-\d{4}` IN lv_text.

IF sy-subrc = 0.
  WRITE / `Booking ID pattern found`.
ENDIF.
```

### 어떻게 확인하는가

정규식은 "맞는 것"과 "틀린 것"을 함께 확인해야 한다.

| 입력 | 기대 |
|---|---|
| `B-2026-0007` | match |
| `B-2026-1234` | match |
| `B-26-0007` | no match |
| `X-2026-0007` | no match |
| `B-2026-ABCD` | no match |

검증용 코드는 다음처럼 만든다.

```abap
DATA lt_text TYPE STANDARD TABLE OF string WITH EMPTY KEY.

lt_text = VALUE #(
  ( `B-2026-0007` )
  ( `B-2026-1234` )
  ( `B-26-0007`   )
  ( `X-2026-0007` )
  ( `B-2026-ABCD` )
).

LOOP AT lt_text INTO DATA(lv_text).
  FIND PCRE `^B-\d{4}-\d{4}$` IN lv_text.

  IF sy-subrc = 0.
    WRITE / |OK: { lv_text }|.
  ELSE.
    WRITE / |Invalid: { lv_text }|.
  ENDIF.
ENDLOOP.
```

`^`와 `$`를 붙인 이유가 중요하다. `B-\d{4}-\d{4}`만 쓰면 긴 문자열 안에 해당 모양이 일부 들어 있어도 match가 된다. `^`는 시작, `$`는 끝을 뜻하므로 전체 문자열이 정확히 그 형식이어야 match된다.

### 실수/주의

- 단순 substring이면 `FIND 'text'`를 쓴다. 정규식은 필요할 때만 쓴다.
- 정규식은 읽는 사람에게 부담이 크다. 패턴이 길어지면 주석이나 단계 분해가 필요하다.
- `^`와 `$` 없이 검증하면 "전체 형식 검증"이 아니라 "일부 포함 여부"가 된다.
- PCRE pattern이 빈 문자열이면 예외가 날 수 있다. 사용자 입력 pattern은 먼저 비어 있지 않은지 확인한다.
- ABAP 문서 기준으로 새 코드에서는 PCRE를 우선하고, POSIX regex는 obsolete 경계로 둔다.

### 체험 설계

**Substring vs Pattern Comparator**를 만든다.

| 요소 | 설계 |
|---|---|
| 입력 | 텍스트 목록: `B-2026-0007`, `B-26-0007`, `prefix B-2026-0007 suffix` |
| 버튼 | `FIND substring`, `FIND PCRE`, `Add ^$ anchors`, `Run invalid cases`, `Reset` |
| 상태 | `pattern`, `useAnchors`, `sySubrc`, `matchedRows`, `invalidAccepted` |
| 피드백 | anchor 없이 긴 문자열이 match되면 "부분 포함 검사는 성공했지만 전체 형식 검증은 아닙니다" 표시 |
| 시각화 | match된 구간을 하이라이트하고, 시작/끝 anchor가 켜지면 전체 문자열 테두리를 강조 |

### 정리

정규식은 "정확히 이 글자"가 아니라 "이런 모양의 글자들"을 찾는다. CH04의 `FIND`/`REPLACE`가 고정 문자열 처리였다면, NEWCH29는 패턴 검증과 추출을 다룬다.

## NEWCH29-L02 · PCRE 기본 문법: 숫자, 문자, 반복, 그룹

### 왜 필요한가

정규식이 어려운 이유는 기호가 많기 때문이다. 하지만 실무 초반에 자주 쓰는 기호는 생각보다 제한적이다. 이메일, 예약번호, 로그 날짜, 공백 정리 정도를 처리하려면 다음 묶음부터 충분히 익히면 된다.

### 무엇인가

| 기호 | 의미 | 예 |
|---|---|---|
| `.` | 줄바꿈을 제외한 임의 문자 하나 | `A.B`는 `A1B`, `A-B` |
| `\d` | digit, 숫자 한 자리 | `0`~`9` |
| `\D` | 숫자가 아닌 문자 | `A`, `-`, 공백 |
| `\w` | word character 계열 | 문자/숫자/underscore 감각 |
| `\s` | 공백류 | space, tab 등 |
| `[ABC]` | A/B/C 중 하나 | `A` 또는 `B` 또는 `C` |
| `[A-Z]` | A부터 Z 범위 | 대문자 |
| `[^0-9]` | 숫자가 아닌 문자 | `A`, `-` |
| `*` | 0번 이상 반복 | `\d*` |
| `+` | 1번 이상 반복 | `\d+` |
| `?` | 0번 또는 1번 | `-?` |
| `{4}` | 정확히 4번 | `\d{4}` |
| `{2,4}` | 2번 이상 4번 이하 | `\d{2,4}` |
| `()` | capture group | `(\d{4})` |
| `|` | 또는 | `OPEN|CLOSED` |

### 어떻게 확인하는가

예약 로그를 예로 든다.

```abap
DATA(lv_log) =
  `Booking B-2026-0007 failed at 2026-07-06 14:30:05`.

FIND PCRE `B-\d{4}-\d{4}` IN lv_log
     MATCH OFFSET DATA(lv_offset)
     MATCH LENGTH DATA(lv_length).

IF sy-subrc = 0.
  DATA(lv_booking_id) = substring(
    val = lv_log
    off = lv_offset
    len = lv_length
  ).

  WRITE / lv_booking_id.
ENDIF.
```

여기서 `MATCH OFFSET`은 match 시작 위치, `MATCH LENGTH`는 match 길이를 준다. 정규식 결과를 믿기만 하지 말고 원문을 다시 잘라 확인하는 습관을 들인다.

날짜는 group으로 나눌 수 있다.

```abap
DATA(lv_date) = `2026-07-06`.

FIND PCRE `^(\d{4})-(\d{2})-(\d{2})$`
     IN lv_date
     SUBMATCHES FINAL(lv_year) FINAL(lv_month) FINAL(lv_day).

IF sy-subrc = 0.
  WRITE: / lv_year, lv_month, lv_day.
ENDIF.
```

괄호 `()`가 세 개 있으므로 `SUBMATCHES` 변수도 세 개를 받을 수 있다.

| group | pattern | 값 |
|---|---|---|
| 1 | `(\d{4})` | `2026` |
| 2 | `(\d{2})` | `07` |
| 3 | `(\d{2})` | `06` |

### greedy와 non-greedy

정규식에서 `*`와 `+`는 기본적으로 greedy, 즉 가능한 많이 잡으려 한다.

```abap
DATA(lv_html) = `<i>ABAP</i><i>UI5</i>`.

FIND PCRE `<i>(.*)</i>` IN lv_html
     SUBMATCHES FINAL(lv_greedy).

FIND PCRE `<i>(.*?)</i>` IN lv_html
     SUBMATCHES FINAL(lv_non_greedy).
```

첫 번째 pattern은 첫 `<i>`부터 마지막 `</i>`까지 많이 잡을 수 있다. 두 번째 `.*?`는 가능한 적게 잡아서 첫 tag만 잡는다. 공식 문서에서도 PCRE의 non-greedy 동작은 `?`를 quantifier 뒤에 붙여 표현한다.

HTML/XML 전체를 정규식으로 파싱하라는 뜻은 아니다. 여기서는 greedy/non-greedy 차이를 눈으로 보기 위한 작은 예시로만 사용한다.

### 실수/주의

- `.`은 "아무거나"처럼 보이지만 무분별하게 쓰면 너무 넓게 match된다.
- `\d+`는 숫자가 1자리든 100자리든 잡는다. 길이가 정해져 있으면 `{4}` 같은 반복 수를 쓴다.
- 괄호는 group을 만든다. 단순 묶음인지, 나중에 `SUBMATCHES`로 꺼낼 group인지 의도를 분명히 한다.
- `.*`는 과도한 match와 성능 문제를 만들 수 있다. 가능한 구체적인 character class를 우선한다.
- ABAP PCRE는 extended mode가 기본이라 pattern 안의 escape되지 않은 공백이 무시될 수 있다. 공백 자체를 찾으려면 `\s` 또는 escaped space, 필요 시 `(?-x)`를 고려한다.

### 체험 설계

**PCRE Token Builder**를 만든다.

| 요소 | 설계 |
|---|---|
| 입력 | `B-2026-0007`, `2026-07-06`, `<i>ABAP</i><i>UI5</i>` |
| 토큰 버튼 | `\d`, `\w`, `[A-Z]`, `+`, `{4}`, `()`, `^`, `$`, `.*`, `.*?` |
| 상태 | `pattern`, `testText`, `matchOffset`, `matchLength`, `submatches`, `isGreedy` |
| 피드백 | `.*` 사용 시 "너무 넓게 잡을 수 있습니다" warning, anchor 없음 warning |
| 시각화 | 원문 위에 match range를 칠하고, group별 색상을 다르게 표시 |

### 정리

정규식은 기호를 많이 아는 것이 아니라, 필요한 만큼만 조합해 검증 가능한 pattern을 만드는 것이 중요하다. 숫자, 문자 class, 반복, anchor, group만 제대로 써도 대부분의 실무 초급 패턴을 읽을 수 있다.

## NEWCH29-L03 · `FIND PCRE`: 위치, 길이, 개수로 검증하기

### 왜 필요한가

`sy-subrc = 0`은 "찾았다"만 알려 준다. 하지만 실무에서는 이것만으로 부족하다.

- 몇 개나 찾았는가?
- 첫 번째가 어디에서 시작했는가?
- match 길이는 얼마인가?
- 모든 occurrence의 위치를 표로 볼 수 있는가?

이 정보를 확인해야 로그 분석, 코드 검색, 데이터 품질 검사에서 실수가 줄어든다.

### 무엇인가

`FIND`의 주요 결과 option은 다음이다.

| option | 의미 |
|---|---|
| `MATCH COUNT` | 찾은 occurrence 개수 |
| `MATCH OFFSET` | match 시작 offset |
| `MATCH LENGTH` | match 길이 |
| `RESULTS` | offset, length, submatch metadata를 structure/table로 받음 |
| `SUBMATCHES` | current occurrence의 capture group 값을 변수로 받음 |

공식 문서상 `sy-fdpos`는 `FIND`가 채우지 않는다. 예전 감각으로 `sy-fdpos`를 보지 말고, `MATCH OFFSET`을 사용한다.

### 어떻게 확인하는가

로그 한 줄에서 오류 코드를 찾는다.

```abap
DATA(lv_log) =
  `E100: booking failed, W210: retry scheduled, E404: concert missing`.

FIND ALL OCCURRENCES OF PCRE `E\d{3}`
     IN lv_log
     MATCH COUNT DATA(lv_error_count).

WRITE / |Error codes: { lv_error_count }|.
```

첫 occurrence의 위치와 길이를 확인한다.

```abap
FIND FIRST OCCURRENCE OF PCRE `E\d{3}`
     IN lv_log
     MATCH OFFSET DATA(lv_offset)
     MATCH LENGTH DATA(lv_length).

IF sy-subrc = 0.
  DATA(lv_code) = substring(
    val = lv_log
    off = lv_offset
    len = lv_length
  ).

  WRITE / |First error code: { lv_code }|.
ENDIF.
```

모든 결과를 table로 받는다.

```abap
FIND ALL OCCURRENCES OF PCRE `E\d{3}|W\d{3}`
     IN lv_log
     RESULTS DATA(lt_match).

LOOP AT lt_match INTO DATA(ls_match).
  DATA(lv_token) = substring(
    val = lv_log
    off = ls_match-offset
    len = ls_match-length
  ).

  WRITE: / ls_match-offset, ls_match-length, lv_token.
ENDLOOP.
```

`RESULTS`를 쓰면 occurrence별 offset/length를 한 줄씩 볼 수 있다. `ALL OCCURRENCES`와 함께 쓰면 검사 결과를 표로 만들기 쉽다.

### 실수/주의

- `MATCH OFFSET`/`MATCH LENGTH`는 실패 시 이전 값이 남거나 초기값일 수 있다. 반드시 `sy-subrc`를 확인한다.
- `ALL OCCURRENCES`와 `MATCH OFFSET`을 함께 쓰면 마지막 occurrence 기준이 될 수 있다. 모든 위치가 필요하면 `RESULTS` table을 쓴다.
- `RESULTS` table은 검색 전 초기화되고 match마다 line이 추가된다.
- match 결과를 substring으로 다시 잘라 눈으로 확인하면 pattern 실수를 빨리 잡을 수 있다.
- case-insensitive 검색이 필요하면 `IGNORING CASE`를 명시한다. `CL_ABAP_REGEX` object를 `REGEX`로 넘기는 경우에는 object의 설정을 따른다.

### 체험 설계

**Match Result Inspector**를 만든다.

| 요소 | 설계 |
|---|---|
| 텍스트 | `E100: booking failed, W210: retry scheduled, E404: concert missing` |
| pattern | `E\d{3}`, `E\d{3}|W\d{3}`, `\d+` |
| 버튼 | `First occurrence`, `All occurrences`, `Show count`, `Show offset/length`, `Show RESULTS table` |
| 상태 | `sySubrc`, `matchCount`, `lastOffset`, `lastLength`, `resultRows` |
| 피드백 | `MATCH OFFSET`만 보고 모든 위치를 안다고 착각하면 "`ALL OCCURRENCES`의 전체 위치는 RESULTS table로 확인하세요" 표시 |
| 시각화 | 원문 위에 match마다 번호 badge를 붙이고, 아래 table의 row와 연결 |

### 정리

`FIND PCRE`는 찾았는지만 보는 도구가 아니다. `MATCH COUNT`, `MATCH OFFSET`, `MATCH LENGTH`, `RESULTS`를 함께 쓰면 pattern이 실제 원문에서 어디를 잡았는지 검증할 수 있다.

## NEWCH29-L04 · `SUBMATCHES`: 괄호로 필요한 값만 꺼내기

### 왜 필요한가

로그 한 줄에서 전체 match만 필요한 경우도 있지만, 보통은 그 안의 일부 값이 필요하다.

```text
Booking B-2026-0007 failed for user HUNYOUNG at 2026-07-06
```

필요한 값은 다음이다.

| 값 | 예 |
|---|---|
| booking year | `2026` |
| booking serial | `0007` |
| user | `HUNYOUNG` |
| date | `2026-07-06` |

이때 capture group과 `SUBMATCHES`를 사용한다.

### 무엇인가

괄호 `()`는 match 안의 subgroup을 만든다. `SUBMATCHES`는 그 subgroup 값을 변수에 넣는다.

```abap
DATA(lv_text) =
  `Booking B-2026-0007 failed for user HUNYOUNG`.

FIND PCRE `B-(\d{4})-(\d{4}).*user\s+(\w+)`
     IN lv_text
     SUBMATCHES FINAL(lv_year) FINAL(lv_serial) FINAL(lv_user).

IF sy-subrc = 0.
  WRITE: / lv_year, lv_serial, lv_user.
ENDIF.
```

| group | pattern | 값 |
|---|---|---|
| 1 | `(\d{4})` | `2026` |
| 2 | `(\d{4})` | `0007` |
| 3 | `(\w+)` | `HUNYOUNG` |

### 어떻게 확인하는가

`SUBMATCHES`는 current occurrence에 대한 group 값을 가져온다. `ALL OCCURRENCES`와 함께 쓰면 마지막 occurrence가 평가될 수 있으므로, 여러 occurrence의 group metadata가 필요하면 `RESULTS`를 사용한다.

```abap
DATA(lv_text) =
  `B-2026-0007 B-2026-0008`.

FIND ALL OCCURRENCES OF PCRE `B-(\d{4})-(\d{4})`
     IN lv_text
     RESULTS DATA(lt_results).

LOOP AT lt_results INTO DATA(ls_result).
  WRITE: / ls_result-offset, ls_result-length.

  LOOP AT ls_result-submatches INTO DATA(ls_submatch).
    WRITE: / `  submatch`,
             ls_submatch-offset,
             ls_submatch-length.
  ENDLOOP.
ENDLOOP.
```

`RESULTS`의 line에는 `offset`, `length`, `submatches`가 있다. `submatches`에는 capture group별 offset/length가 들어간다. 값 자체가 아니라 위치/길이가 들어간다는 점이 중요하다. 실제 값을 원하면 원문에서 substring으로 잘라야 한다.

### optional group 주의

다음 pattern은 좌석 수가 있을 수도 있고 없을 수도 있다고 가정한다.

```abap
FIND PCRE `Booking\s+(B-\d{4}-\d{4})(?:\s+seats=(\d+))?`
     IN lv_text
     SUBMATCHES FINAL(lv_booking_id) FINAL(lv_seats).
```

두 번째 group이 match에 참여하지 않으면 `lv_seats`는 initial이 될 수 있다. 따라서 optional group은 "없을 수 있음"을 업무적으로 처리해야 한다.

### 실수/주의

- 괄호는 group 순서를 만든다. group이 많아질수록 `SUBMATCHES s1 s2 ...`의 순서도 헷갈린다.
- 단순 묶음이 필요하지만 값을 꺼낼 필요가 없다면 non-capturing group `(?:...)`을 고려한다. 그래야 submatch 번호가 줄어든다.
- `SUBMATCHES` 변수 수가 group 수보다 적으면 남는 group은 무시된다. 많으면 남는 변수는 initial이 될 수 있다.
- `RESULTS`의 submatches는 값이 아니라 offset/length metadata다.
- 여러 occurrence의 group 값을 모두 다뤄야 하면 `SUBMATCHES`보다 `RESULTS` table이 적합하다.

### 체험 설계

**Capture Group Lab**을 만든다.

| 요소 | 설계 |
|---|---|
| 텍스트 | `Booking B-2026-0007 failed for user HUNYOUNG` |
| pattern | `B-(\d{4})-(\d{4}).*user\s+(\w+)` |
| 버튼 | `Run SUBMATCHES`, `Show group numbers`, `Make group optional`, `Switch to RESULTS`, `Use non-capturing group` |
| 상태 | `groupCount`, `submatchValues`, `unmatchedGroups`, `resultSubmatchRows` |
| 피드백 | optional group 미참여 시 "이 group은 pattern에는 있지만 이번 text에서는 match되지 않았습니다" 표시 |
| 시각화 | 원문에서 group 1/2/3을 서로 다른 색으로 표시하고, 오른쪽 변수 칸에 연결 |

### 정리

`SUBMATCHES`는 정규식의 괄호와 ABAP 변수를 연결한다. 전체 match에서 필요한 값만 꺼낼 때 강력하지만, group 순서와 optional group을 관리해야 한다. 여러 match의 group 정보를 표로 다뤄야 하면 `RESULTS`가 더 안전하다.

## NEWCH29-L05 · `REPLACE PCRE`: 패턴으로 바꾸고 group을 재사용하기

### 왜 필요한가

정규식은 찾기만 하는 도구가 아니다. 텍스트를 정리하고 표준화할 때도 사용한다.

실무 예시는 다음과 같다.

- 여러 공백을 하나로 줄인다.
- 전화번호에서 숫자만 남긴다.
- 날짜 `2026/07/06`을 `2026-07-06`으로 바꾼다.
- 민감 정보 일부를 mask한다.
- capture group을 replacement에 다시 넣어 형식을 바꾼다.

### 무엇인가

가장 단순한 예는 숫자가 아닌 문자를 제거하는 것이다.

```abap
DATA(lv_text) = `KRW 120,000`.

REPLACE ALL OCCURRENCES OF PCRE `\D`
        IN lv_text
        WITH ``.

WRITE / lv_text.
```

결과는 `120000`이다. `\D`는 숫자가 아닌 문자이므로, 숫자 외의 모든 글자를 빈 문자열로 치환했다.

여러 공백은 하나로 줄인다.

```abap
DATA(lv_name) = `정훈영    ABAP     Academy`.

REPLACE ALL OCCURRENCES OF PCRE `\s+`
        IN lv_name
        WITH ` `.

WRITE / lv_name.
```

### group substitution

날짜 separator를 표준화한다.

```abap
DATA(lv_date) = `2026/07/06`.

REPLACE FIRST OCCURRENCE OF PCRE
        `^(\d{4})/(\d{2})/(\d{2})$`
        IN lv_date
        WITH `$1-$2-$3`.

WRITE / lv_date.
```

`$1`, `$2`, `$3`은 capture group의 값을 replacement text에 다시 넣는다.

| replacement | 의미 |
|---|---|
| `$0` | 전체 match |
| `$1` | 첫 번째 capture group |
| `$2` | 두 번째 capture group |
| `${name}` | named capture group이 있을 때 이름 기반 참조 |

### `VERBATIM`

replacement text에서 `$1`을 진짜 문자 `$1`로 넣고 싶을 때가 있다. 이때 `VERBATIM`을 사용하면 replacement pattern의 특수 의미를 끈다.

```abap
DATA(lv_text) = `A123`.

REPLACE PCRE `A(\d+)`
        IN lv_text
        WITH `$1`
        VERBATIM.
```

이 경우 `$1`은 group 값이 아니라 문자 `$1`로 들어간다. 공식 문서도 `VERBATIM`이 PCRE/REGEX와 함께 사용되며 replacement pattern의 특수 문자를 literal로 처리한다고 설명한다.

### 어떻게 확인하는가

치환은 원문을 바꾸므로 더 조심해야 한다.

```abap
DATA(lv_text) = `A  B   C`.

REPLACE ALL OCCURRENCES OF PCRE `\s+`
        IN lv_text
        WITH ` `
        REPLACEMENT COUNT DATA(lv_count)
        REPLACEMENT OFFSET DATA(lv_offset)
        REPLACEMENT LENGTH DATA(lv_length).

WRITE: / lv_text,
       / lv_count,
       / lv_offset,
       / lv_length.
```

`REPLACEMENT COUNT`는 몇 번 바뀌었는지 알려 준다. `REPLACEMENT OFFSET`은 모든 occurrence를 치환할 때 이전 치환 때문에 위치가 밀릴 수 있으므로, `FIND`의 `MATCH OFFSET`과 같은 감각으로 보면 안 된다.

치환 결과 table이 필요하면 `RESULTS`를 사용한다.

```abap
REPLACE ALL OCCURRENCES OF PCRE `\s+`
        IN lv_text
        WITH ` `
        RESULTS DATA(lt_replace).
```

`REPLACE`의 `RESULTS`는 replacement 위치와 삽입된 문자열 길이를 담는다. `FIND`의 `MATCH_RESULT`와 달리 `REPLACE` 결과 type에는 `SUBMATCHES` component가 없다.

### 실수/주의

- `REPLACE`는 원본을 바꾼다. 실행 전 원본 보존이 필요한지 판단한다.
- `$1` 같은 group substitution은 편리하지만, group 번호가 바뀌면 결과가 달라진다.
- `$1`을 literal로 넣으려면 escape 또는 `VERBATIM`을 사용한다.
- fixed-length `c` 필드에 긴 replacement를 넣으면 잘릴 수 있다. string과 fixed-length 차이를 확인한다.
- `REPLACEMENT OFFSET`은 치환 후 위치 감각이므로 `FIND MATCH OFFSET`과 다를 수 있다.

### 체험 설계

**Regex Replace Workshop**을 만든다.

| 요소 | 설계 |
|---|---|
| 원문 | `KRW 120,000`, `2026/07/06`, `A  B   C`, `A123` |
| pattern | `\D`, `^(\d{4})/(\d{2})/(\d{2})$`, `\s+`, `A(\d+)` |
| replacement | ``, `$1-$2-$3`, space, `$1` |
| 버튼 | `Replace first`, `Replace all`, `Use group substitution`, `Toggle VERBATIM`, `Show replacement count`, `Undo` |
| 상태 | `replacementCount`, `replacementOffset`, `replacementLength`, `verbatim`, `changedText` |
| 피드백 | `VERBATIM` off에서 `$1`이 group 값으로 바뀌고, on에서 literal `$1`로 들어가는 차이를 표시 |

### 정리

`REPLACE PCRE`는 텍스트 표준화와 마스킹에 강력하다. 하지만 원본을 바꾸는 문장이므로 count, offset, 결과 preview를 확인하고, group substitution과 `VERBATIM`의 차이를 명확히 이해해야 한다.

## NEWCH29-L06 · `CL_ABAP_REGEX`와 `CL_ABAP_MATCHER`: 반복 사용과 객체 상태

### 왜 필요한가

`FIND PCRE`는 한 번 찾기에 좋다. 그러나 같은 pattern을 여러 텍스트에 반복 적용하거나, matcher의 현재 상태를 객체로 다뤄야 한다면 class 기반 API가 더 적합하다.

예를 들어 수천 줄 로그에서 같은 오류 코드 pattern을 반복 검사한다고 하자.

```text
E100 booking failed
W210 retry scheduled
E404 concert missing
```

매번 pattern 문자열을 새로 해석하는 것보다, pattern을 regex object로 만들고 matcher를 생성해 쓰는 구조가 더 명확할 수 있다.

### 무엇인가

공식 문서 기준으로 regex system class는 두 개가 핵심이다.

| 클래스 | 역할 |
|---|---|
| `CL_ABAP_REGEX` | regular expression의 object-oriented representation을 만든다. `CREATE_PCRE` factory method를 사용한다. |
| `CL_ABAP_MATCHER` | regex를 텍스트나 internal table에 적용하고, match/replacement/current state를 다룬다. |

새 코드에서 PCRE regex object를 만들 때는 factory method를 사용한다.

```abap
DATA(lo_regex) = cl_abap_regex=>create_pcre(
  pattern     = `E(\d{3})`
  ignore_case = abap_true
).
```

직접 `NEW cl_abap_regex( )`처럼 생성하는 방식은 POSIX 쪽과 연결되는 deprecated 경계가 있으므로, `CREATE_PCRE`를 우선한다.

### 어떻게 확인하는가

matcher를 만들어 match와 submatch를 읽는다.

```abap
DATA(lo_matcher) =
  cl_abap_regex=>create_pcre(
    pattern     = `E(\d{3})`
    ignore_case = abap_true
  )->create_matcher(
    text = `E404 concert missing`
  ).

IF lo_matcher->match( ) = abap_true.
  DATA(lv_code) = lo_matcher->get_submatch( 1 ).
  WRITE / lv_code.
ENDIF.
```

`match( )`가 성공하면 전체 pattern이 텍스트에 맞았는지 확인하고, `get_submatch( 1 )`로 첫 번째 capture group을 읽는다.

공식 예제에서는 존재하지 않는 submatch 번호를 요청하면 `cx_sy_invalid_submatch`를 처리한다. 따라서 group 번호를 loop로 읽을 때는 예외 처리가 필요하다.

```abap
IF lo_matcher->match( ) = abap_true.
  DO.
    TRY.
        WRITE / lo_matcher->get_submatch( sy-index ).
      CATCH cx_sy_invalid_submatch.
        EXIT.
    ENDTRY.
  ENDDO.
ENDIF.
```

### 언제 statement가 낫고, 언제 class가 나은가

| 상황 | 선택 |
|---|---|
| 한 번 찾고 끝 | `FIND PCRE` |
| 간단히 바꾸고 끝 | `REPLACE PCRE` |
| 같은 pattern을 여러 텍스트에 반복 적용 | `CL_ABAP_REGEX=>CREATE_PCRE` + matcher |
| matcher state, submatch method, replacement method가 필요 | `CL_ABAP_MATCHER` |
| PCRE pattern을 statement에 직접 쓰기 충분 | class로 과하게 감싸지 않음 |

### 실수/주의

- `CL_ABAP_REGEX` object는 `FIND ... REGEX regex_ref`에서 사용한다. `FIND ... PCRE` 뒤에는 object reference가 아니라 character-like pattern이 온다.
- `CREATE_POSIX`와 직접 생성 방식은 obsolete POSIX 경계가 있으므로 새 설명의 중심에 두지 않는다.
- `ignore_case` 같은 설정을 statement의 `IGNORING CASE`와 혼동하지 않는다. object를 `REGEX`로 넘기는 경우 object 설정을 따른다.
- `get_submatch( n )`은 group 번호가 없으면 예외가 날 수 있다.
- callout은 PCRE의 고급 기능이며 이 장에서는 사용하지 않는다.

### 체험 설계

**Reusable Regex Matcher Lab**을 만든다.

| 요소 | 설계 |
|---|---|
| pattern | `E(\d{3})` |
| 텍스트 목록 | `E100 booking failed`, `W210 retry`, `E404 concert missing` |
| 버튼 | `Create regex`, `Create matcher`, `Match current text`, `Get submatch`, `Next text`, `Compare FIND PCRE` |
| 상태 | `regexCreated`, `currentText`, `matchOk`, `submatchIndex`, `submatchValue`, `invalidSubmatchCaught` |
| 피드백 | `W210`에서 match 실패 시 "pattern이 E로 시작하는 오류 코드만 허용합니다" 표시 |
| 시각화 | regex object는 reusable template, matcher는 현재 text에 붙는 실행 상태로 분리해 그림 |

### 정리

`FIND PCRE`와 `REPLACE PCRE`는 statement 중심의 빠른 도구다. `CL_ABAP_REGEX`와 `CL_ABAP_MATCHER`는 같은 pattern을 반복 적용하고 matcher 상태를 다뤄야 할 때 사용한다. 새 코드에서는 PCRE factory method인 `CREATE_PCRE`를 우선한다.

## NEWCH29-L07 · regex 기반 string functions: 조건식 안에서 읽기

### 왜 필요한가

Statement는 명령문이다. 조건식이나 값 계산 안에서 바로 쓰고 싶을 때는 string function이 더 편하다.

예를 들어 이메일처럼 보이는지 판단해 상태를 만들고 싶다.

```abap
IF contains( val = lv_email pcre = `...` ).
  ...
ENDIF.
```

이 방식은 CH18 이후 expression을 읽을 수 있는 학습자에게 적합하다.

### 무엇인가

ABAP string function 중 regex 인자를 받는 함수는 `pcre = regex` 형태로 사용할 수 있다. 이 장에서는 다음 감각만 잡는다.

| 함수 감각 | 용도 |
|---|---|
| `contains( val = ... pcre = ... )` | pattern이 포함되는지 boolean처럼 판단 |
| `matches( val = ... pcre = ... )` | 전체가 pattern에 맞는지 판단하는 용도 |
| `count( val = ... pcre = ... )` | occurrence 개수 |
| `find( val = ... pcre = ... )` | match 위치 |
| `match( val = ... pcre = ... )` | match된 문자열 |
| `replace( val = ... pcre = ... with = ... )` | 바뀐 문자열을 expression 결과로 반환 |

공식 문서상 `pcre` 인자에는 PCRE regular expression이 들어가며, empty regex는 예외를 발생시킬 수 있다. extended mode 기본 동작도 statement와 같은 주의가 필요하다.

### 어떻게 확인하는가

포함 여부를 판단한다.

```abap
DATA(lv_email) = `hunyoung@example.com`.

IF contains(
     val  = lv_email
     pcre = `^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$`
   ).
  WRITE / `Email-like text`.
ENDIF.
```

전체 형식 검증이면 anchor를 넣는다. `contains`라는 함수 이름 때문에 부분 포함처럼 읽히지만, pattern 자체에 `^...$`를 넣으면 전체 검증처럼 사용할 수 있다. 다만 함수별 정확한 의미는 시스템 버전의 문서를 확인하며 사용한다.

개수를 센다.

```abap
DATA(lv_log) = `E100 W210 E404`.

DATA(lv_count) = count(
  val  = lv_log
  pcre = `E\d{3}`
).

WRITE / lv_count.
```

치환 결과를 값으로 받는다.

```abap
DATA(lv_normalized) = replace(
  val  = `A   B    C`
  pcre = `\s+`
  with = ` `
  occ  = 0
).

WRITE / lv_normalized.
```

`occ = 0`은 모든 occurrence 치환 감각으로 사용된다. statement의 `REPLACE ALL OCCURRENCES`와 비교해서 이해하면 된다.

### 실수/주의

- function은 원본을 직접 바꾸지 않고 결과 값을 반환한다. statement `REPLACE`와 다르다.
- regex function 안에서도 빈 pattern, 너무 복잡한 pattern, extended mode 공백 처리 위험이 있다.
- expression 안에 긴 regex를 직접 넣으면 읽기 어렵다. 먼저 `DATA(lv_pattern)`로 이름을 붙이는 편이 낫다.
- 이메일 검증 같은 주제는 생각보다 복잡하다. 실무에서는 "이메일처럼 보이는지 1차 검사"와 "표준 전체 검증"을 구분한다.
- ABAP SQL/CDS regex function은 이 장의 ABAP memory string processing과 다르다. DB에서 평가되는 regex는 별도 성능/DB 함수 경계를 갖는다.

### 체험 설계

**Regex Function Console**을 만든다.

| 요소 | 설계 |
|---|---|
| 입력 | `hunyoung@example.com`, `E100 W210 E404`, `A   B    C` |
| 함수 탭 | `contains`, `matches`, `count`, `find`, `match`, `replace` |
| pattern 입력 | `^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$`, `E\d{3}`, `\s+` |
| 상태 | `functionName`, `returnType`, `returnValue`, `patternEmpty`, `exceptionName` |
| 피드백 | statement와 function 비교: "statement는 작업을 수행하고, function은 값을 반환합니다" |

### 정리

regex 기반 string function은 조건식과 값 계산 안에서 정규식을 쓰게 해 준다. 짧고 명확한 경우에는 유용하지만, 긴 pattern은 별도 변수로 분리하고, statement형 `FIND`/`REPLACE`가 더 검증하기 쉬운 경우도 많다.

## NEWCH29-L08 · 실습: 로그/이메일/코드 패턴 검증기

### 왜 필요한가

마지막 실습은 이 장의 모든 기능을 하나로 묶는다. 목표는 "정규식 하나로 모든 문제 해결"이 아니라, 작은 검증기를 만들며 pattern, 결과, 실패 피드백을 분리하는 것이다.

검증 대상은 세 가지다.

| 대상 | 요구 |
|---|---|
| 로그 | 오류 코드 `E\d{3}`를 모두 찾고 위치를 표시 |
| 이메일 | 이메일처럼 보이는 문자열을 1차 검증 |
| 코드 텍스트 | 금지된 obsolete 키워드 `SEARCH` 사용 여부 확인 |

### 실습 데이터

```abap
TYPES:
  BEGIN OF ty_check_result,
    category TYPE string,
    pattern  TYPE string,
    input    TYPE string,
    ok       TYPE abap_bool,
    message  TYPE string,
  END OF ty_check_result,
  ty_check_result_tab TYPE STANDARD TABLE OF ty_check_result
    WITH EMPTY KEY.

DATA lt_input TYPE STANDARD TABLE OF string WITH EMPTY KEY.

lt_input = VALUE #(
  ( `E100 booking failed for hunyoung@example.com` )
  ( `W210 retry scheduled` )
  ( `E404 concert missing` )
  ( `SEARCH lv_text FOR 'ABAP'.` )
).
```

### 프로세스 플로우

```text
Start
  |
  v
Choose check type
  |
  +-- Log error code -> FIND ALL OCCURRENCES OF PCRE E\d{3} RESULTS table
  |
  +-- Email-like text -> contains/matches with anchored PCRE
  |
  +-- Obsolete keyword -> FIND PCRE \bSEARCH\b IGNORING CASE
  |
  v
Collect count, offset, length, submatches
  |
  v
Display result rows with feedback
```

### 로그 오류 코드 검사

```abap
DATA(lv_log) =
  `E100 booking failed, W210 retry scheduled, E404 concert missing`.

FIND ALL OCCURRENCES OF PCRE `E\d{3}`
     IN lv_log
     RESULTS DATA(lt_errors).

LOOP AT lt_errors INTO DATA(ls_error).
  DATA(lv_error_code) = substring(
    val = lv_log
    off = ls_error-offset
    len = ls_error-length
  ).

  WRITE: / lv_error_code,
           ls_error-offset,
           ls_error-length.
ENDLOOP.
```

### 이메일 1차 검증

```abap
DATA(lv_email) = `hunyoung@example.com`.
DATA(lv_email_pattern) =
  `^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$`.

IF contains( val = lv_email pcre = lv_email_pattern ).
  WRITE / `Email-like text`.
ELSE.
  WRITE / `Invalid email-like text`.
ENDIF.
```

이 pattern은 교육용 1차 검사다. 모든 국제 이메일 주소 규칙을 완벽하게 구현한다는 뜻이 아니다. 실무에서는 요구 수준을 먼저 정해야 한다.

### obsolete keyword 검사

```abap
DATA(lv_code) = `SEARCH lv_text FOR 'ABAP'.`.

FIND PCRE `\bSEARCH\b`
     IN lv_code
     IGNORING CASE
     MATCH OFFSET DATA(lv_offset)
     MATCH LENGTH DATA(lv_length).

IF sy-subrc = 0.
  WRITE / |Obsolete keyword found at { lv_offset }.|.
ENDIF.
```

`\b`는 word boundary 감각이다. `RESEARCH` 같은 단어 안의 `SEARCH`를 잘못 잡지 않도록 경계를 둔다.

### 체험형 시뮬레이터 설계

**Regex Quality Gate Simulator**를 만든다.

#### 화면 구성

```text
+-------------------------------------------------------------+
| Input Text                                                   |
| E100 booking failed for hunyoung@example.com                 |
| W210 retry scheduled                                         |
| E404 concert missing                                         |
| SEARCH lv_text FOR 'ABAP'.                                   |
+-------------------------------------------------------------+

+---------------------+  +------------------------------------+
| Check Type          |  | Pattern                            |
| [Log Error]         |  | E\d{3}                             |
| [Email-like]        |  | ^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$    |
| [Obsolete Keyword]  |  | \bSEARCH\b                         |
+---------------------+  +------------------------------------+

+-------------------------------------------------------------+
| Controls                                                    |
| [Run FIND] [Run RESULTS] [Run SUBMATCHES] [Run REPLACE]     |
| [Toggle IGNORING CASE] [Show Anchors] [Reset]               |
+-------------------------------------------------------------+

+-------------------------------------------------------------+
| Result                                                      |
| category | ok | offset | length | message                   |
| Log      | X  | 0      | 4      | E100                      |
| Log      | X  | 52     | 4      | E404                      |
| Code     | !  | 0      | 6      | SEARCH is obsolete        |
+-------------------------------------------------------------+
```

#### 버튼과 상태

| 버튼 | 상태 변화 | 피드백 |
|---|---|---|
| `Run FIND` | `sySubrc`, `firstOffset`, `firstLength` 갱신 | 첫 match만 표시 |
| `Run RESULTS` | `resultRows` 생성 | 모든 occurrence 위치 표시 |
| `Run SUBMATCHES` | `submatchValues` 생성 | group이 없는 pattern이면 "capture group이 없습니다" |
| `Run REPLACE` | `previewText` 생성 | 원본 변경 전 preview 표시 |
| `Toggle IGNORING CASE` | `caseMode` 변경 | `SEARCH/search` match 차이 표시 |
| `Show Anchors` | `anchorHint` 표시 | `^...$`가 전체 형식 검증에 필요함을 표시 |
| `Reset` | 모든 상태 초기화 | 결과 table 비움 |

#### 피드백 규칙

| 상황 | 피드백 |
|---|---|
| pattern empty | "빈 PCRE pattern은 예외가 될 수 있습니다. pattern을 입력하세요." |
| `.*`가 앞에 있음 | "너무 넓은 greedy pattern입니다. 더 구체적인 class를 고려하세요." |
| 이메일 pattern이 match | "이메일처럼 보이는 1차 형식입니다. 표준 전체 검증은 별도 요구사항입니다." |
| obsolete keyword 발견 | "CH04 기준으로 `SEARCH` 대신 `FIND`를 사용합니다." |
| `RESULTS`와 `SUBMATCHES` 혼동 | "`RESULTS`의 submatches는 값이 아니라 offset/length metadata입니다." |

### 실수/주의

- 로그 검사는 parser가 아니다. 복잡한 로그 포맷은 먼저 구조화된 필드를 쓰는 것이 더 좋다.
- 이메일 정규식은 완벽하게 만들기 어렵다. 업무에서 필요한 수준을 먼저 정한다.
- 코드 텍스트 검사는 단순 검색이다. ABAP syntax tree를 이해하는 정적 분석 도구가 아니다.
- 사용자가 입력한 regex를 그대로 실행하면 너무 복잡한 pattern으로 예외나 성능 문제가 날 수 있다.
- 교육용 simulator는 실패 피드백이 핵심이다. match 성공만 보여 주면 실무 위험을 가르치지 못한다.

### 정리

regex 검증기는 pattern, 입력, 결과, 피드백을 분리해야 안전하다. `FIND PCRE`, `RESULTS`, `SUBMATCHES`, `REPLACE PCRE`, string function, matcher class를 모두 배웠더라도, 실제 설계의 중심은 "무엇을 허용하고 무엇을 거절할 것인가"다.

## NEWCH29 마무리

NEWCH29는 CH04 문자열 기초의 심화 장이다. CH04에서는 `FIND`와 `REPLACE`를 "찾고 바꾸는 기본 도구"로 배웠고, NEWCH29에서는 그 도구를 정규식 기반으로 확장했다.

마지막 선택 기준은 다음이다.

| 상황 | 우선 선택 |
|---|---|
| 고정 단어 포함 여부 | `FIND substring` |
| 고정 단어 치환 | `REPLACE substring` |
| 형식 검증 | `FIND PCRE` 또는 regex string function + `^...$` |
| 값 추출 | `FIND PCRE ... SUBMATCHES` |
| 여러 occurrence 위치 확인 | `FIND ALL OCCURRENCES ... RESULTS` |
| 패턴 기반 표준화 | `REPLACE PCRE` |
| replacement에서 group 재사용 | `$1`, `$2`, `${name}` |
| `$1`을 문자 그대로 넣기 | `VERBATIM` 또는 escape |
| 같은 pattern 반복 적용 | `CL_ABAP_REGEX=>CREATE_PCRE` + `CL_ABAP_MATCHER` |
| 복잡한 문서 파싱 | 정규식만 고집하지 말고 parser/구조화된 데이터 사용 |

정규식은 강력하지만 읽기 어려운 도구다. 좋은 ABAP 코드는 "짧은 정규식 한 줄"이 아니라, pattern 이름, 테스트 케이스, 실패 피드백, 성능/예외 경계가 함께 있는 코드다.

후속 ALV event/editing, Enhancement, Interface, File/BDC 장에서는 텍스트 로그나 입력 파일을 다룰 일이 많아진다. NEWCH29를 지나면 학습자는 그 텍스트를 단순히 눈으로 훑지 않고, 패턴과 검증 결과로 설명할 수 있다.
