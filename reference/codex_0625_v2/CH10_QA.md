# CH10_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH10_REWRITE.md`
> 판정: CH10 v2 기준 원고는 재작업 준비 산출물로 통과. 실제 `content/abap/CH10` 반영과 신규 embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`는 v1 산출물이 완성 강의자료가 아니라 템플릿형 보강 지시문에 가깝다고 판정했다. CH10 v1도 레슨마다 같은 문구가 반복되었고, 코드가 많은데도 L01~L06의 체험 설계가 추상적이었다.

v2에서는 다음 방식으로 처리했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | "도입 불편/실무 감각/필요 학습수단" 문구 반복 | CH10 7개 레슨을 각각 새 강의 원고로 직접 작성 |
| 코드 체험 | 코드 실행 스텝퍼 같은 일반 지시 | 호출 위치, 변수 상태, 파라미터 이동, `sy-subrc`, 실패 피드백을 레슨별로 구체화 |
| 공식 문서 | 관련 없는 제어문 문서와 과도한 OO 문서 혼입 | FORM/PERFORM, CALL FUNCTION, CLASS-METHODS, RETURN, STATICS, TYPE-POOL 문서만 수동 선별 |
| R15 경계 | OO 본격 설계가 앞당겨질 위험 | Local/Global Class는 static method 맛보기로 제한, 본격 OO는 CH20으로 경계 |
| classic-first | inline declaration, constructor expression, object creation expression 혼입 위험 | 코드 예제는 classic-safe 구문으로 작성 |

## 2. 소스 커버리지

현재 authoritative scope는 `content/abap/CH10`의 7개 레슨이다.

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH10/_chapter.md` | "CH10 전체 설계", "CH10 마무리 학습 흐름" | 반영 |
| `CH10-L01.md` | `## CH10-L01 - FORM / PERFORM 기본 호출` | 반영 |
| `CH10-L02.md` | `## CH10-L02 - USING / CHANGING 파라미터` | 반영 |
| `CH10-L03.md` | `## CH10-L03 - CALL FUNCTION 기본 구조` | 반영 |
| `CH10-L04.md` | `## CH10-L04 - Local Class로 모듈화: 정적 기준` | 반영 |
| `CH10-L05.md` | `## CH10-L05 - Global Class 호출 기초` | 반영 |
| `CH10-L06.md` | `## CH10-L06 - Subroutine / Function / Class 선택 기준` | 반영 |
| `CH10-L07.md` | `## CH10-L07 - 실습: 잔여석 계산과 예매 판정 모듈화` | 반영 |

## 3. 공식 문서 수동 근거

CH10_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapform.htm` | FORM과 subroutine obsolete 프레이밍 |
| `C:\ABAP_DOCU_HTML\abapperform.htm` | PERFORM 호출과 신규 생성 지양 |
| `C:\ABAP_DOCU_HTML\abapform_parameters.htm` | FORM formal parameter, typing, pass by value |
| `C:\ABAP_DOCU_HTML\abapperform_parameters.htm` | PERFORM USING/CHANGING/TABLES와 TABLES obsolete |
| `C:\ABAP_DOCU_HTML\abapperform_form.htm` | 외부 subroutine call 주의 |
| `C:\ABAP_DOCU_HTML\abapreturn.htm` | RETURN의 조기 종료 의미 |
| `C:\ABAP_DOCU_HTML\abapstatics.htm` | STATICS의 수명과 가시성 |
| `C:\ABAP_DOCU_HTML\abapcall_function.htm` | CALL FUNCTION 구조와 sy-subrc |
| `C:\ABAP_DOCU_HTML\abapcall_function_parameter.htm` | EXPORTING/IMPORTING/CHANGING/TABLES/EXCEPTIONS |
| `C:\ABAP_DOCU_HTML\abenfunction_module_glosry.htm` | Function Module glossary 근거 |
| `C:\ABAP_DOCU_HTML\abenfunction_modules_obsolete.htm` | Function Module obsolete 요소 |
| `C:\ABAP_DOCU_HTML\abapclass.htm` | CLASS DEFINITION/IMPLEMENTATION |
| `C:\ABAP_DOCU_HTML\abapclass-methods.htm` | CLASS-METHODS 선언 |
| `C:\ABAP_DOCU_HTML\abapclass-methods_functional.htm` | RETURNING이 있는 static method |
| `C:\ABAP_DOCU_HTML\abenlocal_class_glosry.htm` | Local Class glossary 근거 |
| `C:\ABAP_DOCU_HTML\abenglobal_class_glosry.htm` | Global Class glossary 근거 |
| `C:\ABAP_DOCU_HTML\abenstatic_method_glosry.htm` | Static Method glossary 근거 |
| `C:\ABAP_DOCU_HTML\abaptype-pool.htm`, `C:\ABAP_DOCU_HTML\abaptype-pools.htm` | Type Pool/TYPE-POOLS obsolete 인지용 |

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | PERFORM 호출 지도 | 통과 |
| L02 | 있음 | 파라미터 이동 보드 | 통과 |
| L03 | 있음 | CALL FUNCTION 상자 | 통과 |
| L04 | 있음 | Local Class 정적 메서드 스텝퍼 | 통과 |
| L05 | 있음 | 전역 클래스 블랙박스 호출기 | 통과 |
| L06 | 없음 | 모듈화 선택 카드 | 통과 |
| L07 | 있음 | 기존 `CH10-L07-S01.html` + can_book 판정 토글 | 통과 |

R2 관점에서 중요한 개선은 코드가 "본문에 놓인 정적 예제"가 아니라, 호출 위치, 변수 상태, 파라미터 방향, 정상/실패 상태를 같은 페이지에서 확인하도록 설계했다는 점이다.

## 5. Classic-first 및 R15 범위 검사

수동 점검 기준:

- 코드 예제에는 inline declaration을 넣지 않았다.
- 코드 예제에는 constructor expression이나 object creation expression을 넣지 않았다.
- New Open SQL escape marker와 string template을 넣지 않았다.
- Local/Global Class 설명은 static method 호출 맛보기로 제한했다.
- 객체 생성, 참조 변수, 인스턴스 설계, 상속, 인터페이스, class-based exception 체계는 CH20으로 경계 처리했다.
- Function Module의 RFC/BAPI/background/update 심화는 CH30 이후로 경계 처리했다.
- `VALUE(...)`는 FORM parameter pass-by-value와 method `RETURNING VALUE(...)` 문법으로만 사용했다. 이는 constructor expression `VALUE #(...)`와 다르므로 위반으로 보지 않는다.

자동 검색 결과:

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|abapif\.htm|abapcase\.htm|abaploop_at_itab|공식 문서 체크 힌트" reference\codex_0625_v2\CH10_REWRITE.md
결과: 0건

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\+=" reference\codex_0625_v2\CH10_REWRITE.md
결과: 0건

rg -n "\|[^\n`]*\{[^\n`]*\}|\{[^\n`]*\}[^\n`]*\|" reference\codex_0625_v2\CH10_REWRITE.md
결과: 0건

rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|TRY|CATCH|CREATE OBJECT)\b" reference\codex_0625_v2\CH10_REWRITE.md
결과: 0건

rg -n "[ \t]+$" reference\codex_0625_v2\CH10_REWRITE.md
결과: 0건

rg -n "^## CH10-L|C:\\ABAP_DOCU_HTML" reference\codex_0625_v2\CH10_REWRITE.md
결과: 레슨 heading 7개, ABAP_DOCU 근거 18개

섹션 카운트:
왜 필요한가 7개, 무엇인가 7개, 어떻게 확인하는가 7개, 체험 설계 7개, 실수와 주의 7개, 정리 7개
```

## 6. 남은 작업

현재 산출물은 CH10을 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH10_REWRITE.md`를 기준으로 `content/abap/CH10/*.md`를 실제 교체한다.
2. L01-L05의 신규 embed HTML을 구현하고 원본 lesson에 연결한다.
3. 기존 `CH10-L07-S01.html`에 `can_book` 판정 토글을 추가한다.
4. 같은 방식으로 다음 단일 챕터를 v2로 재작성한다.

이번 턴에서는 목표 범위에 맞춰 reference 산출물만 작성했다.
