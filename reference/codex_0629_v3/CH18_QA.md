# CH18_QA - codex_0629_v3 검수

## 1. 작업 범위

| 항목 | 결과 |
| --- | --- |
| 대상 챕터 | CH18 - Modern ABAP Syntax |
| 입력 소스 | `content/abap/CH18/_chapter.md`, `CH18-L01.md`부터 `CH18-L07.md` |
| 산출물 | `reference/codex_0629_v3/CH18_REWRITE.md`, `reference/codex_0629_v3/CH18_QA.md` |
| 작업 방식 | v3 기준 신규 재집필. v2는 보조 품질 기준으로만 사용 |
| 판정 | 완료 |

## 2. 소스 커버리지

| 원본 파일 | 반영 위치 | 반영 상태 |
| --- | --- | --- |
| `_chapter.md` | 전체 설계, CH18 문법 경계 | 반영 |
| `CH18-L01.md` | L01 Inline Declaration | 반영 |
| `CH18-L02.md` | L02 `VALUE` constructor, `BASE`, `FOR` | 반영 |
| `CH18-L03.md` | L03 `CORRESPONDING`, `MAPPING`, `EXCEPT` | 반영 |
| `CH18-L04.md` | L04 Table Expression, `line_exists`, `line_index` | 반영 |
| `CH18-L05.md` | L05 String Template, format option, string functions | 반영 |
| `CH18-L06.md` | L06 legacy to modern refactoring, calculation assignment | 반영 |
| `CH18-L07.md` | L07 콘서트앱 modern refactor 실습 | 반영 |

## 3. 공식 문서 수동 확인

Classic ABAP 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했다. CH18은 modern syntax가 정식으로 열리는 장이므로, 이전 CH01~CH17과 같은 modern 금지 기준을 적용하지 않는다.

| 확인 파일 | 확인 내용 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abeninline_declarations.htm` | Inline declarations 문서 확인 |
| `C:\ABAP_DOCU_HTML\abendata_inline.htm` | `DATA( )` inline declaration 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenfinal_inline.htm` | `FINAL( )` immutable inline declaration 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenconstructor_expression_value.htm` | `VALUE` value operator 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenvalue_constructor_params_struc.htm` | 구조체 `VALUE` parameter 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenvalue_constructor_params_itab.htm` | internal table `VALUE`, `BASE`, `FOR` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenconstructor_expr_corresponding.htm` | `CORRESPONDING` component operator 문서 확인 |
| `C:\ABAP_DOCU_HTML\abencorresponding_constr_mapping.htm` | `MAPPING`, `EXCEPT` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abentable_expressions.htm` | table expression 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenline_exists_function.htm` | `line_exists` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenline_index_function.htm` | `line_index` 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenstring_templates.htm` | string template 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenstring_templates_expressions.htm` | embedded expression 후보 파일 확인 |
| `C:\ABAP_DOCU_HTML\abenstring_templates_predef_format.htm` | predefined format option 후보 파일 확인 |
| `C:\ABAP_DOCU_HTML\abensubstring_functions.htm` | `substring` 계열 함수 문서 확인 |
| `C:\ABAP_DOCU_HTML\abenstring_processing_expr_func.htm` | string processing expression function 문서 확인 |
| `C:\ABAP_DOCU_HTML\abencalculation_assignments.htm` | calculation assignment 문서 확인 |

확인 중 교정한 파일명:

- `abenstring_template_expressions.htm`가 아니라 `abenstring_templates_expressions.htm` 계열 파일이 존재한다.
- String template format 예제는 `abenstring_template_date_abexa.htm`, `abenstring_template_number_abexa.htm` 등 예제 파일도 함께 존재한다.

## 4. v2 품질 이슈 반영

| v2 검수에서 중요했던 항목 | v3 처리 |
| --- | --- |
| 템플릿 반복 | 각 문법의 실제 실패 모델과 확인 방법 중심으로 재작성 |
| CH18 허용 범위 혼동 | CH18은 modern syntax 허용 장임을 명시 |
| SQL inline과 host marker 선노출 위험 | SQL modern 문법은 CH19로 분리 |
| OO, exception 본격 확장 위험 | CH20 이후 경계로 분리 |
| `VALUE ... FOR` 누락 위험 | CH18-L02에 정식 반영 |
| `CORRESPONDING` mapping 방향 혼동 | 대상 = 원본 방향을 본문에 명시 |
| table expression 실패 모델 부족 | `line_exists`, `line_index`, 예외 가능성을 함께 설명 |
| `+=`를 inline declaration처럼 오해할 위험 | 이미 존재하는 왼쪽 변수에 대한 calculation assignment로 분리 |

## 5. R15 게이팅 점검

| 항목 | 판정 |
| --- | --- |
| CH18 정식 modern syntax 사용 | 통과 |
| SQL modern syntax로 확장 없음 | 통과 |
| OO 본격 문법 확장 없음 | 통과 |
| 예외 처리 본격 구문 확장 없음 | 통과 |
| 고급 constructor expression 확장 없음 | 통과 |
| 데이터 생성/변경/저장 실습 없음 | 통과 |
| CH19, CH20 경계 명시 | 통과 |

## 6. 체험형 학습 설계 점검

| 레슨 | 체험 설계 | 상태 |
| --- | --- | --- |
| L01 | Inline 선언 위치 판정기 | 통과 |
| L02 | VALUE Builder | 통과 |
| L03 | 구조 매핑 보드 | 통과 |
| L04 | READ TABLE vs Table Expression 비교기 | 통과 |
| L05 | String Template 조립기 | 통과 |
| L06 | Legacy Refactor Diff Lab | 통과 |
| L07 | Concert Refactor Lab | 통과 |

## 7. 자동 검색 검수 기록

작성 후 다음 항목을 검사한다.

| 검사 항목 | 기대 결과 |
| --- | --- |
| whitespace와 patch 정합성 | 출력 없음 |
| CH19 SQL modern syntax 혼입 | 출력 없음 |
| CH20 OO 본격 문법 혼입 | 출력 없음 |
| 데이터 변경문과 transaction 제어 혼입 | 출력 없음 |
| 고급 constructor expression 확장 | 출력 없음 |
| v2 템플릿성 문구 반복 | 출력 없음 |

주의: `DATA( )`, `FINAL( )`, `VALUE`, `CORRESPONDING`, table expression, string template, calculation assignment는 CH18의 정식 학습 대상이므로 금지 패턴이 아니다.

## 8. 잔여 리스크

- `VALUE ... FOR`는 강력하지만 입문자에게 과밀하게 보일 수 있다. 본문에서는 단순 구구단 생성과 단순 테이블 변환만 사용했다.
- Table expression은 짧지만 실패 방식이 `READ TABLE`과 다르다. 실제 content 반영 시 tooltip이나 embed에도 `line_exists` 보호 안내를 넣는 것이 좋다.
- String Template은 읽기 쉽지만 내부 계산이 길어지면 다시 어려워진다. 복잡한 값은 별도 변수로 먼저 계산하도록 유지해야 한다.

## 9. 최종 판정

CH18 v3 원고는 원본 7개 레슨을 모두 반영했고, Modern ABAP Syntax를 "짧게 쓰기"가 아니라 "의도를 가까운 위치에 드러내기"라는 관점으로 재구성했다. CH18에서 정식 허용되는 modern syntax와 CH19/CH20 이후 경계를 분리했고, `VALUE ... FOR` 누락 보강도 반영했다.

판정: 통과.
