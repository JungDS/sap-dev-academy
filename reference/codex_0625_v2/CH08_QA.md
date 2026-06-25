# CH08_QA - codex_0625_v2 재작업 검수

> 대상 파일: `reference/codex_0625_v2/CH08_REWRITE.md`
> 판정: CH08 v2 기준 원고는 재작업 준비 산출물로 통과. 실제 `content/abap/CH08` 반영과 HTML embed 구현은 아직 수행하지 않았다.

## 1. 재작업 판정 반영

`reference/codex_0625/00_QUALITY_REVIEW.md`의 핵심 판정은 v1이 "최종 강의자료"가 아니라 "재작업 준비용 진단표"에 머물렀다는 것이다. 특히 CH08은 코드가 많아 R2 체험 장치가 없으면 강의자료로 부족하다고 판정되었다.

v2에서는 다음 방식으로 수정했다.

| 항목 | v1 문제 | v2 처리 |
| --- | --- | --- |
| 템플릿 반복 | 모든 레슨에 비슷한 문구가 반복됨 | 레슨별 문제 상황, 개념, 실습, 실수, 정리를 새로 작성 |
| R2 체험성 | "시뮬레이터 필요" 수준의 선언 | 각 레슨에 버튼, 상태값, 데이터 흐름, 피드백을 구체화 |
| 공식 문서 | 자동 키워드 매칭으로 오연결 발생 | CH08 관련 ABAP_DOCU 문서를 수동 선별 |
| classic-first | modern 문법 혼입 위험 | 코드 예제는 classic Open SQL만 사용 |
| 범위 관리 | 미래 장 주제와 섞일 위험 | 메시지 체계 CH15, modern SQL CH18/19, 성능 심화 CH32로 경계 표시 |

## 2. 소스 커버리지

| 원본 | v2 반영 위치 | 확인 |
| --- | --- | --- |
| `CH08/_chapter.md` | "CH08 전체 설계", "CH08 마무리 학습 흐름" | 반영 |
| `CH08-L01.md` | `## CH08-L01 - SAP 데모 테이블과 Client 종속` | 반영 |
| `CH08-L02.md` | `## CH08-L02 - SELECT 4요소, 전체 컬럼과 필요한 컬럼` | 반영 |
| `CH08-L03.md` | `## CH08-L03 - SELECT 형태: SINGLE, INTO TABLE, ENDSELECT, UP TO n ROWS` | 반영 |
| `CH08-L04.md` | `## CH08-L04 - INTO 대상 형태` | 반영 |
| `CH08-L05.md` | `## CH08-L05 - WHERE 상세: 연산자와 wildcard` | 반영 |
| `CH08-L06.md` | `## CH08-L06 - 키 필드, 일반 필드, Index 기초` | 반영 |
| `CH08-L07.md` | `## CH08-L07 - 조회 실패와 MESSAGE 기초` | 반영 |

## 3. 공식 문서 수동 근거

CH08_REWRITE에는 아래 문서만 수동 근거로 남겼다.

| 문서 | 사용 이유 |
| --- | --- |
| `C:\ABAP_DOCU_HTML\abapselect.htm` | SELECT, ENDSELECT, sy-subrc, sy-dbcnt |
| `C:\ABAP_DOCU_HTML\abapselect_single.htm` | SELECT SINGLE의 정확한 한 행 조회 의미 |
| `C:\ABAP_DOCU_HTML\abapselect_up_to_offset.htm` | UP TO n ROWS |
| `C:\ABAP_DOCU_HTML\abapselect_into_target.htm` | INTO, INTO TABLE, APPENDING TABLE |
| `C:\ABAP_DOCU_HTML\abapinto_clause.htm` | 조회 결과 대상 |
| `C:\ABAP_DOCU_HTML\abapwhere.htm` | WHERE와 client column 주의 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_stmt_logexp.htm` | BETWEEN, LIKE, IN, IS NULL, 논리 연산 |
| `C:\ABAP_DOCU_HTML\abenabap_sql_hostvar_obsolete.htm` | classic host variable 구문 경계 |
| `C:\ABAP_DOCU_HTML\abapmessage.htm` | MESSAGE 기본 동작 |
| `C:\ABAP_DOCU_HTML\abapmessage_msg.htm` | 메시지 클래스는 CH15로 이월 |

자동 키워드 오연결로 문제가 된 `abapparameters.htm`는 CH08_REWRITE에 포함하지 않았다.

## 4. R2 체험 장치 점검

| 레슨 | 코드 있음 | 체험 설계 | 판정 |
| --- | --- | --- | --- |
| L01 | 있음 | Client 자동 필터 체험 카드 | 통과 |
| L02 | 있음 | 기존 `CH08-L02-S01.html` 활용 + 질문형 패널 보강 | 통과 |
| L03 | 있음 | SELECT 형태 비교 실험실 | 통과 |
| L04 | 있음 | INTO 대상 보드 | 통과 |
| L05 | 있음 | WHERE 필터 실험실 | 통과 |
| L06 | 있음 | 키 조건 렌즈 | 통과 |
| L07 | 있음 | 빈 결과와 메시지 피드백 | 통과 |

R2 관점에서 중요한 개선은 "시뮬레이터가 필요하다"가 아니라, 어떤 버튼을 누르고 어떤 데이터와 상태값을 보며 어떤 피드백을 받는지까지 지정했다는 점이다.

## 5. Classic-first 및 범위 검사

수동 점검 기준:

- 코드 예제에는 inline declaration을 넣지 않았다.
- 코드 예제에는 modern host-variable escape marker를 넣지 않았다.
- 코드 예제에는 string template을 넣지 않았다.
- 조회 전용 범위를 유지했다.
- 데이터 변경, 트랜잭션, 메시지 클래스 심화, Range Table, 성능 심화는 후속 장으로 넘겼다.

자동 검색 결과:

```text
rg -n "도입 불편|단순히 실행되는 예제|필요 학습수단|abapparameters" reference\codex_0625_v2\CH08_REWRITE.md
결과: 0건

rg -n "DATA\(|@DATA|@\w|VALUE #|NEW |\|.*\|" reference\codex_0625_v2\CH08_REWRITE.md
결과: 0건

rg -n "\b(INSERT|UPDATE|DELETE|MODIFY|COMMIT|ROLLBACK|JOIN)\b" reference\codex_0625_v2\CH08_REWRITE.md
결과: 0건

rg -n "^## CH08-L|C:\\ABAP_DOCU_HTML|[ \t]+$" reference\codex_0625_v2\CH08_REWRITE.md
결과: 레슨 heading 7개, ABAP_DOCU 근거 10개, trailing whitespace 0건
```

## 6. 남은 작업

현재 산출물은 CH08을 실제 강의자료로 바꾸기 위한 v2 기준 원고다. 다음 단계에서 사용자가 진행을 승인하면 아래 중 하나를 선택해야 한다.

1. `reference/codex_0625_v2/CH08_REWRITE.md`를 기준으로 `content/abap/CH08/*.md`를 실제 교체한다.
2. 먼저 L03-L07 embed HTML을 구현하고, 그 뒤 원본 lesson에 연결한다.
3. CH08과 같은 방식으로 다음 고위험 장을 v2로 재작성한다.

이번 턴에서는 사용자가 요청한 v2 준비 범위에 맞춰 reference 산출물만 작성했다.
