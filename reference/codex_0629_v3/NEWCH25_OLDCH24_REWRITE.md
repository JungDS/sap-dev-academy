# CH24_REWRITE · 실무 데이터 변경과 트랜잭션 제어

> 주 소스: `content/abap/CH24/_chapter.md`, `content/abap/CH24/CH24-L01.md` ~ `CH24-L05.md`
> 보조 참고: `.project-docs/09_CURRICULUM_LEDGER.md`, `.project-docs/11_KEYWORD_AUDIT.md`, `reference/codex_0629_v3/NEWCH24_OLDCH23_REWRITE.md`
> 목표: CH24를 Track-2의 첫 실무 저장 장으로 재집필하여, 입문자가 "데이터를 바꾼다"는 일을 문법 암기가 아니라 복구 가능한 업무 트랜잭션 설계로 이해하게 한다.

## CH24 전체 설계

CH08까지의 SQL은 주로 읽기였다. 읽기는 실수해도 데이터가 망가지지 않는다. 하지만 CH24의 주제는 다르다. `INSERT`, `UPDATE`, `MODIFY`, `DELETE`는 실제 업무 데이터를 바꾼다. 예매가 생성되고, 취소되고, 상태가 바뀌고, 대량 업로드가 반영된다. 여기서 한 줄의 `WHERE` 누락은 수천 건을 바꿀 수 있고, 실패를 무시한 `COMMIT WORK`는 반쪽 저장을 만든다.

그래서 CH24는 단순히 DML 문법 네 개를 나열하지 않는다. 저장 프로그램을 만들 때 개발자가 반드시 가져야 하는 사고 순서로 구성한다.

| 질문 | 기대 답 |
|---|---|
| 무엇을 바꾸는가? | 새 행 추가, 기존 행 수정, upsert, 삭제 중 어떤 의도인지 먼저 정한다. |
| 몇 건이 바뀌었는가? | `sy-subrc`와 `sy-dbcnt`로 DB 변경 결과를 확인한다. |
| 언제 확정되는가? | DML 결과는 다음 database commit까지 되돌릴 수 있으며, ABAP에서는 `COMMIT WORK`가 SAP LUW를 닫고 새 LUW를 연다. |
| 실패하면 어떻게 되는가? | 같은 업무 단위의 변경은 `ROLLBACK WORK`로 취소하고, 실패 건은 로그와 재처리 대상으로 남긴다. |
| 대량이면 어떻게 처리하는가? | 전체를 한 번에 잡지 말고 패키지 단위로 처리하되, 재시작점과 마지막 commit을 관리한다. |

CH24의 핵심 메시지는 "저장 코드는 성공 코드보다 실패 코드가 더 중요하다"이다. 성공 경로만 보면 `INSERT` 한 줄이면 된다. 실무에서는 중복키, 누락된 `WHERE`, 표준 테이블 직접 변경, 중간 실패, 누락된 commit, 너무 큰 LUW가 사고를 만든다. CH24는 그 사고를 미리 보이게 만든다.

## CH24 R15 경계

CH24는 Track-2 시작 장이다. CH23의 RAP는 트랜잭션 앱 프레임워크였고, CH24는 Classic ABAP에서 직접 DB 변경과 LUW를 다루는 장이다.

| 구분 | CH24에서 정식 사용 | CH24에서 보류 |
|---|---|---|
| ABAP SQL DML | `INSERT`, `UPDATE`, `MODIFY`, `DELETE`, `FROM TABLE`, `SET`, `WHERE` | 복잡한 동적 SQL, DB-specific hint 심화 |
| 결과 확인 | `sy-subrc`, `sy-dbcnt`, 중복키와 no-row 처리 | DB exception hierarchy 전체 |
| 트랜잭션 | `COMMIT WORK`, `COMMIT WORK AND WAIT`, `ROLLBACK WORK`, 원자성 | RAP `COMMIT ENTITIES`, `ROLLBACK ENTITIES` |
| SAP LUW | `CALL FUNCTION ... IN UPDATE TASK`, `PERFORM ... ON COMMIT` 개념 | update task 운영 트러블슈팅 전체 |
| 오류 처리 | 실패 건 수집, 키와 사유 기록, 재처리, 멱등성 | Application Log 상세 구현, SLG1 운영은 CH35 |
| 대량 변경 | 패키지 처리, commit 크기 절충, 재시작점 | 병렬 처리, lock object 직접 설계는 CH25 이후 |
| 표준 데이터 | 표준 테이블 직접 DML 금지, BAPI/표준 API 경유 원칙 | BAPI/RFC 상세 구현은 CH30 |

동시성 제어는 CH25의 정식 주제다. CH24에서는 DML이 commit/rollback 전까지 DB 자원과 변경 단위를 잡고 있다는 점까지만 설명하고, 여러 사용자가 같은 데이터를 동시에 바꾸는 충돌 제어는 다음 장으로 넘긴다.

## 공식 문서 수동 확인 근거

Classic ABAP 관련 문서는 `C:\ABAP_DOCU_HTML`에서 직접 확인했다. 같은 항목의 Markdown 사본도 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md`에서 대조했다.

| 주제 | 확인 문서 | 반영 포인트 |
|---|---|---|
| `INSERT` | `abapinsert_dbtab.htm`, `ABAPINSERT_DBTAB.md` | work area, `FROM TABLE`, `sy-subrc`, `sy-dbcnt`, 다음 database commit 전 rollback 가능 |
| `UPDATE` | `abapupdate.htm`, `ABAPUPDATE.md`, `ABAPUPDATE_SET_EXPRESSION.md` | `SET`, changed row count, `sy-subrc=4` 의미, `WHERE`의 중요성 |
| `MODIFY` | `abapmodify_dbtab.htm`, `ABAPMODIFY_DBTAB.md` | insert 또는 overwrite, `FROM TABLE`, upsert 성격 |
| `DELETE` | `abapdelete_dbtab.htm`, `ABAPDELETE_DBTAB.md` | `WHERE` 조건, 삭제 row count, 조건 없는 삭제 위험 |
| `COMMIT WORK` | `abapcommit.htm`, `ABAPCOMMIT.md` | SAP LUW 종료, update task 실행, `AND WAIT`, `sy-subrc` 차이 |
| `ROLLBACK WORK` | `abaprollback.htm`, `ABAPROLLBACK.md` | 현재 SAP LUW 변경 취소, update task 등록 삭제, rollback 뒤 `sy-subrc` 확인 불필요 |
| update task | `abapcall_function_update.htm`, `ABAPCALL_FUNCTION_UPDATE.md` | 즉시 실행이 아니라 등록이며, 실제 실행은 `COMMIT WORK` 시점 |
| `ON COMMIT` | `abapperform_on_commit.htm`, `ABAPPERFORM_ON_COMMIT.md` | subroutine 지연 등록, commit/rollback 안에서 금지되는 문장 |

## CH24-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준

### 왜 필요한가

업무 프로그램은 언젠가 데이터를 바꾼다. 콘서트 예매 앱을 예로 들면 조회 화면만으로는 아무 일도 일어나지 않는다. 고객이 예매 버튼을 눌렀을 때 `ZBOOKING`에 행이 생겨야 하고, 취소 버튼을 누르면 상태가 바뀌거나 삭제되어야 한다. 이때 사용하는 기본 문장이 DML이다.

입문자는 보통 "DB에 저장한다"를 한 가지 동작으로 생각한다. 그러나 실무에서는 의도를 먼저 나누어야 한다.

- 처음 생기는 데이터인가?
- 이미 있는 데이터의 일부 필드만 바꾸는가?
- 있으면 바꾸고 없으면 만들 것인가?
- 정말 지워야 하는가, 아니면 취소 상태로만 바꿀 것인가?

이 질문을 생략하면 `INSERT`로 중복키 덤프를 내거나, `UPDATE`로 아무 행도 바꾸지 못했는데 성공한 줄 알거나, `DELETE`로 복구 어려운 삭제를 만든다.

### 무엇인가

| 문장 | 의도 | 키가 이미 있으면 | 키가 없으면 | 실무 판단 |
|---|---|---|---|---|
| `INSERT` | 새 행 추가 | 중복키 오류 또는 `sy-subrc=4` 상황 | 추가 | 신규 생성이 확실할 때 |
| `UPDATE` | 기존 행 수정 | 수정 | 보통 `sy-subrc=4` | "반드시 이미 있어야 한다"를 확인할 때 |
| `MODIFY` | 있으면 수정, 없으면 추가 | 수정 | 추가 | 재처리나 동기화처럼 upsert가 필요할 때 |
| `DELETE` | 행 삭제 | 삭제 | `sy-subrc=4` | 물리 삭제가 업무적으로 허용될 때 |

```abap
INSERT zbooking FROM @ls_booking.
IF sy-subrc <> 0.
  " 같은 booking_id가 이미 있거나 DB 제약을 위반했다.
ENDIF.

UPDATE zbooking
   SET status     = 'C',
       changed_by = @sy-uname,
       changed_on = @sy-datum
 WHERE booking_id = @lv_booking_id.

IF sy-subrc = 0.
  " sy-dbcnt에는 변경된 행 수가 들어간다.
ENDIF.

MODIFY zbooking FROM @ls_booking.

DELETE FROM zbooking
 WHERE booking_id = @lv_booking_id.
```

`sy-subrc`는 성공/실패의 첫 신호이고, `sy-dbcnt`는 몇 행이 실제로 처리되었는지 보는 숫자다. `UPDATE`나 `DELETE`에서 `sy-subrc=0`이어도 `WHERE`가 너무 넓으면 많은 행이 바뀐다. 그래서 실무에서는 "성공했는가"와 "몇 건이 바뀌었는가"를 함께 본다.

여러 행은 내부 테이블로 보낼 수 있다.

```abap
INSERT zbooking FROM TABLE @lt_new_booking.
MODIFY zbooking FROM TABLE @lt_booking_upsert.
```

단건 반복보다 의도는 선명하지만, 대량 처리에서는 실패 처리와 commit 단위가 더 중요해진다. 이 부분은 L04, L05에서 이어진다.

### 어떻게 확인하는가

1. 변경 대상이 내가 만든 `Z*` 테이블인지 확인한다.
2. 키 필드가 work area 또는 `WHERE`에 정확히 들어갔는지 확인한다.
3. `UPDATE`와 `DELETE`는 실행 전 `WHERE` 조건으로 같은 데이터를 `SELECT`해 예상 행 수를 본다.
4. 실행 직후 `sy-subrc`와 `sy-dbcnt`를 기록한다.
5. commit 전에는 같은 SAP LUW 안의 변경이고, 최종 확정은 L02의 `COMMIT WORK`에서 한다.

예매 취소를 물리 삭제로 할지 상태 변경으로 할지도 업무적으로 확인해야 한다. 감사와 이력 추적이 필요한 업무에서는 보통 `DELETE`보다 `UPDATE status = 'C'`가 안전하다.

### 감사필드 stamp

나중에 문제가 생겼을 때 "누가 언제 이 행을 만들었나"를 모르면 원인 추적이 어렵다. 업무 테이블에는 보통 생성자, 생성일, 생성시각, 변경자, 변경일 같은 감사필드를 둔다.

```abap
ls_booking-created_by = sy-uname.
ls_booking-created_on = sy-datum.
ls_booking-created_at = sy-uzeit.

INSERT zbooking FROM @ls_booking.
```

변경 시에는 생성 필드와 변경 필드를 구분한다. `UPDATE` 때 `created_by`를 덮어쓰면 최초 생성자를 잃는다.

```abap
UPDATE zbooking
   SET status     = 'C',
       changed_by = @sy-uname,
       changed_on = @sy-datum,
       changed_at = @sy-uzeit
 WHERE booking_id = @lv_booking_id.
```

### 실수와 주의

- `WHERE` 없는 `UPDATE`는 전체 행 수정이다. 학습용 예제라도 조건 없는 변경은 위험 표시를 붙인다.
- `WHERE` 없는 `DELETE`는 전체 삭제다. 정말 전체 초기화가 목적일 때만 별도 승인 흐름을 둔다.
- 표준 테이블은 직접 DML 하지 않는다. SAP 표준 데이터는 BAPI나 표준 API가 내부 검증, 번호 채번, 후속 테이블 갱신을 함께 처리한다.
- `MODIFY`는 편하지만 의도를 흐릴 수 있다. "없으면 생성"이 정말 맞는 업무인지 확인한다.
- `sy-subrc`만 보고 끝내지 말고 `sy-dbcnt`로 영향 행 수를 확인한다.

### 체험형 학습 설계

**DML 플레이그라운드: ZBOOKING 직접 바꾸기**

| 요소 | 설계 |
|---|---|
| 데이터 | `booking_id`, `customer`, `seats`, `status`, `created_by`, `created_on`, `changed_by`, `changed_on`을 가진 미니 `ZBOOKING` |
| 버튼 | `INSERT`, `UPDATE 상태`, `MODIFY upsert`, `DELETE`, `WHERE 제거`, `중복키 만들기`, `되돌리기` |
| 상태 | selected key, pending statement, predicted row count, `sy-subrc`, `sy-dbcnt`, uncommitted changes |
| 피드백 | `WHERE` 제거 시 전체 행이 붉게 표시되고, `INSERT` 중복키 시 "신규 생성 의도와 실제 키 상태가 충돌"이라고 설명한다. |

### 정리

DML은 "저장한다" 한 단어로 뭉뚱그릴 수 없다. 새로 만들기, 수정하기, upsert, 삭제는 의도가 다르고 실패 신호도 다르다. CH24의 첫 단계는 올바른 DML을 고르고, 실행 결과를 숫자로 확인하는 습관을 만드는 것이다.

## CH24-L02 · COMMIT WORK / ROLLBACK WORK

### 왜 필요한가

DML을 실행했다고 해서 업무가 끝난 것은 아니다. 예매 저장은 보통 한 행으로 끝나지 않는다. 예매 헤더, 좌석 항목, 결제 요청, 감사 이력처럼 함께 성공해야 할 행들이 있다. 중간에 하나라도 실패했는데 먼저 실행된 변경만 남으면 데이터가 깨진다.

이 문제를 막기 위해 ABAP 프로그램은 변경을 논리 단위로 묶는다. 모두 성공하면 `COMMIT WORK`로 확정하고, 하나라도 실패하면 `ROLLBACK WORK`로 취소한다.

### 무엇인가

`COMMIT WORK`는 현재 SAP LUW를 닫고 새 SAP LUW를 연다. 현재 LUW에 모인 변경 요청은 확정 방향으로 처리된다. `ROLLBACK WORK`는 현재 SAP LUW의 변경 요청을 취소하고 새 SAP LUW를 연다.

입문자에게 중요한 관점은 "DML 한 줄마다 commit하는 것이 아니다"이다. commit은 업무상 함께 성공해야 하는 단위의 끝에서 한다.

```abap
DATA lv_failed TYPE abap_bool.

INSERT zbooking FROM @ls_booking.
IF sy-subrc <> 0.
  lv_failed = abap_true.
ENDIF.

IF lv_failed = abap_false.
  INSERT zbooking_item FROM TABLE @lt_items.
  IF sy-subrc <> 0.
    lv_failed = abap_true.
  ENDIF.
ENDIF.

IF lv_failed = abap_false.
  COMMIT WORK.
ELSE.
  ROLLBACK WORK.
ENDIF.
```

원본 예제처럼 마지막 DML의 `sy-subrc`만 보는 방식은 위험하다. 헤더 저장이 실패했는데 항목 저장이 우연히 성공하면 마지막 값만으로는 전체 실패를 놓칠 수 있다. 그래서 각 단계의 실패를 별도 플래그나 오류 테이블에 누적해야 한다.

### 어떻게 확인하는가

1. 업무 단위를 말로 정의한다. 예: "예매 헤더와 좌석 항목은 함께 성공해야 한다."
2. 각 DML 직후 `sy-subrc`, 필요하면 `sy-dbcnt`를 검사한다.
3. 실패가 하나라도 있으면 더 진행하지 않거나, 오류를 모은 뒤 `ROLLBACK WORK`로 취소한다.
4. 모두 성공했을 때만 `COMMIT WORK`를 실행한다.
5. update task 완료까지 기다려야 하는 업무라면 `COMMIT WORK AND WAIT`를 사용하고 `sy-subrc`를 본다.

`COMMIT WORK`는 `AND WAIT`가 없으면 `sy-subrc`가 항상 0으로 설정된다. 그래서 "commit이 성공했는가"를 `sy-subrc`로 판정하고 싶다면 어떤 update task를 쓰는지, `AND WAIT`가 필요한지 이해해야 한다.

### 실수와 주의

- 중간에 commit하면 rollback으로 되돌릴 수 있는 범위가 끊긴다.
- 실패 후 commit은 반쪽 저장을 만든다.
- commit 누락은 변경이 최종 반영되지 않는 문제를 만든다.
- `ROLLBACK WORK` 뒤 `sy-subrc`가 실패인지 확인하는 코드는 의미가 없다. 공식 문서상 rollback 후 `sy-subrc`는 0이다.
- 열린 cursor가 있는 `SELECT` 루프 안에서 commit/rollback을 섞는 설계는 위험하다. 커서가 닫혀 후속 fetch가 깨질 수 있다.

### 체험형 학습 설계

**원자성 시뮬레이터: COMMIT vs ROLLBACK**

| 요소 | 설계 |
|---|---|
| 데이터 | 예매 헤더 1건, 좌석 항목 2건, 실패를 유발하는 중복 좌석 항목 1건 |
| 버튼 | `헤더 INSERT`, `항목 INSERT`, `실패 주입`, `COMMIT`, `ROLLBACK`, `AND WAIT 비교` |
| 상태 | pending header, pending items, failure flag, committed table, rolled-back table |
| 피드백 | 실패 후 commit을 누르면 "예매는 있는데 좌석 일부가 없는 상태"를 화면에 보여 주고, rollback을 누르면 pending 변경이 모두 사라지는 것을 보여 준다. |

### 정리

`COMMIT WORK`와 `ROLLBACK WORK`는 저장의 끝처리다. DML은 변경 의도이고, commit/rollback은 그 의도를 업무 단위로 확정하거나 취소하는 제어다. 저장 프로그램은 "어디서 commit할지"보다 먼저 "무엇을 하나의 실패 단위로 볼지"를 정해야 한다.

## CH24-L03 · DB LUW와 SAP LUW 차이

### 왜 필요한가

SAP에서는 "트랜잭션"이라는 말이 한 층으로 끝나지 않는다. DB는 짧은 기술적 변경 단위를 관리하고, SAP 애플리케이션은 사용자가 여러 화면과 단계를 거치는 긴 업무 단위를 관리한다. 이 차이를 모르면 `CALL FUNCTION ... IN UPDATE TASK`를 호출했는데 왜 DB에 바로 보이지 않는지 이해하기 어렵다.

특히 오래된 SAP 업무 프로그램은 저장을 update function module에 등록해 두고, 마지막 `COMMIT WORK` 시점에 실행되도록 구성한다. 이것은 단순한 함수 호출이 아니라 SAP LUW의 bundling 기법이다.

### 무엇인가

| 용어 | 의미 | 입문자 비유 |
|---|---|---|
| DB LUW | 데이터베이스가 commit/rollback으로 보장하는 짧은 변경 단위 | 실제 장부에 쓰는 순간의 묶음 |
| SAP LUW | SAP 애플리케이션이 업무상 함께 처리해야 하는 긴 단위 | 여러 화면에서 모은 신청서를 마지막에 접수하는 묶음 |
| update task | commit 때 실행할 update function module 등록 | 접수함에 넣어 두었다가 마감 버튼 때 처리 |
| `PERFORM ... ON COMMIT` | commit 때 실행할 subroutine 등록 | 마감 때 할 정리 작업 예약 |

```abap
CALL FUNCTION 'Z_SAVE_BOOKING' IN UPDATE TASK
  EXPORTING
    is_booking = ls_booking.

" 이 시점에는 update function module이 즉시 실행된 것이 아니다.

COMMIT WORK AND WAIT.
```

공식 문서 기준으로 `CALL FUNCTION ... IN UPDATE TASK`는 update function module을 즉시 실행하지 않고 등록한다. 실제 실행은 `COMMIT WORK`가 트리거한다. `ROLLBACK WORK`는 현재 SAP LUW의 update task 등록을 삭제한다.

### 어떻게 확인하는가

1. update function module이 Function Builder에서 update module로 설정되어 있는지 확인한다.
2. 호출 코드가 `IN UPDATE TASK`를 쓰는지 본다.
3. 호출 직후 DB에서 바로 결과가 보이지 않는 것을 확인한다.
4. `COMMIT WORK` 또는 `COMMIT WORK AND WAIT` 뒤 결과가 반영되는지 확인한다.
5. `ROLLBACK WORK`를 실행하면 등록된 update task가 실행되지 않는지 확인한다.

`PERFORM ... ON COMMIT`은 commit 시점에 subroutine을 실행하도록 등록한다. 다만 subroutine 자체는 신규 개발에서 권장되는 구조가 아니므로, CH24에서는 오래된 코드 읽기와 LUW 이해용으로 다룬다. 새 설계에서는 메서드, BAPI, RAP 같은 적절한 구조를 검토한다.

### 실수와 주의

- `IN UPDATE TASK`를 일반 함수 호출처럼 즉시 실행된다고 생각하면 확인 타이밍을 잘못 잡는다.
- 등록만 하고 commit하지 않으면 update task는 실행되지 않는다.
- `CALL FUNCTION ... IN UPDATE TASK` 뒤 `sy-subrc`로 등록 성공을 판정하지 않는다. 공식 문서상 이 문장 뒤 `sy-subrc`는 정의되지 않는다.
- update task나 `ON COMMIT` 처리 중에는 `COMMIT WORK`, `ROLLBACK WORK` 같은 트랜잭션 제어를 다시 실행하면 안 된다.
- `COMMIT WORK AND WAIT`는 기다림이 필요한 곳에만 쓴다. 무조건 붙이면 대기 시간이 늘고 흐름이 무거워진다.

### 체험형 학습 설계

**SAP LUW 타임라인: 등록과 실행 분리**

| 요소 | 설계 |
|---|---|
| 데이터 | `Z_SAVE_BOOKING` update task queue, pending parameters, DB table, rollback log |
| 버튼 | `IN UPDATE TASK 등록`, `DB 조회`, `COMMIT WORK`, `COMMIT WORK AND WAIT`, `ROLLBACK WORK` |
| 상태 | registered queue count, update started, update finished, DB visible rows |
| 피드백 | 등록 직후 DB 조회 시 "아직 실행 전"을 표시하고, rollback 후 queue가 사라지는 것을 단계별로 보여 준다. |

### 정리

DB LUW는 DB가 보장하는 짧은 단위이고, SAP LUW는 SAP 업무 프로그램이 모아 두는 긴 단위다. update task와 `ON COMMIT`은 "지금 실행"이 아니라 "commit 때 실행"이라는 지연 실행 개념으로 이해해야 한다.

## CH24-L04 · 오류 로그와 재처리 구조

### 왜 필요한가

저장 프로그램은 실패한다. 중복키가 있을 수 있고, 참조해야 할 마스터 데이터가 없을 수 있고, 일부 행만 형식이 틀릴 수 있다. 문제는 실패 자체가 아니라 실패를 잃어버리는 것이다. 실패 건을 남기지 않으면 나중에 "왜 100건 중 97건만 저장됐는가"를 설명할 수 없다.

대량 처리에서 좋은 프로그램은 성공 건만 빠르게 처리하는 프로그램이 아니다. 실패 건을 정확히 남기고, 원인 수정 후 실패분만 다시 처리할 수 있는 프로그램이다.

### 무엇인가

오류 재처리 구조는 보통 다음 흐름을 가진다.

```text
입력 데이터
  -> 사전 검증
  -> DML 실행
  -> 성공 건 확정 후보
  -> 실패 건 오류 테이블/로그 적재
  -> 원인 수정
  -> 실패 건만 재처리
```

간단한 학습용 구조는 내부 테이블에 실패 건을 모으는 것부터 시작한다.

```abap
TYPES: BEGIN OF ty_error,
         booking_id TYPE zbooking-booking_id,
         reason     TYPE string,
       END OF ty_error.

DATA lt_error TYPE STANDARD TABLE OF ty_error WITH EMPTY KEY.

LOOP AT lt_booking INTO DATA(ls_booking).
  INSERT zbooking FROM @ls_booking.

  IF sy-subrc <> 0.
    APPEND VALUE #(
      booking_id = ls_booking-booking_id
      reason     = |INSERT failed, sy-subrc={ sy-subrc }|
    ) TO lt_error.
  ENDIF.
ENDLOOP.

IF lt_error IS INITIAL.
  COMMIT WORK.
ELSE.
  ROLLBACK WORK.
ENDIF.
```

이 예제는 전체 성공 아니면 전체 rollback 전략이다. 업무에 따라서는 성공 건은 commit하고 실패 건만 별도 오류 테이블에 남기는 부분 성공 전략도 있다. 어떤 전략이 맞는지는 업무 요구사항으로 결정한다.

### 어떻게 확인하는가

1. 실패 건마다 최소한 업무 키, 원인, 처리 시각, 처리 프로그램, 사용자 정보를 남긴다.
2. 오류 테이블이나 로그를 조회하면 "무엇이 실패했는지"가 재처리 가능한 수준으로 보여야 한다.
3. 재처리 버튼은 전체 입력을 다시 돌리지 않고 실패 건만 대상으로 삼는다.
4. 재처리해도 같은 데이터가 두 번 생성되지 않도록 멱등성을 점검한다.
5. 운영 수준의 Application Log, BAL, SLG1 상세는 CH35에서 다룬다는 경계를 명시한다.

멱등성은 같은 요청이 두 번 들어와도 결과가 망가지지 않는 성질이다. 예를 들어 "booking_id B001 생성"을 재처리할 때 이미 B001이 있으면 또 `INSERT`해서 실패시키는 것이 아니라, 기존 상태를 확인하거나 `MODIFY`를 쓰거나 처리 완료로 표시하는 전략이 필요하다.

### 실수와 주의

- 실패한 입력 전체를 버리면 재처리할 출발점이 없다.
- `sy-subrc`만 기록하고 업무 키를 기록하지 않으면 어떤 건이 실패했는지 찾을 수 없다.
- 오류 메시지를 너무 짧게 남기면 원인 수정이 어렵다.
- 재처리에서 다시 중복키가 나면 멱등성 설계가 빠진 것이다.
- 성공 건을 먼저 commit하고 나중에 실패를 발견하는 흐름은 부분 성공 전략인지 전체 원자성 전략인지 명확히 해야 한다.

### 체험형 학습 설계

**재처리 시뮬레이터: 실패 수집과 멱등성**

| 요소 | 설계 |
|---|---|
| 데이터 | 정상 예매 3건, 중복키 1건, 존재하지 않는 공연 ID 1건, 오류 테이블 |
| 버튼 | `일괄 처리`, `실패만 보기`, `원인 수정`, `실패분 재처리`, `INSERT 전략`, `MODIFY 전략` |
| 상태 | processed count, failed count, error table rows, retry attempt, idempotent flag |
| 피드백 | 전체 재실행 시 이미 성공한 건이 다시 중복키가 되는 장면을 보여 주고, 실패분만 재처리하면 안정적으로 끝나는 차이를 보여 준다. |

### 정리

실패는 예외 상황이 아니라 저장 프로그램의 정상 설계 대상이다. 오류 로그는 단순 기록이 아니라 재시작점이다. 좋은 CH24 저장 코드는 실패를 모으고, 설명하고, 다시 처리할 수 있게 만든다.

## CH24-L05 · 대량 변경 시 Package 처리

### 왜 필요한가

수십만 건을 하나의 SAP LUW와 하나의 database LUW 부담으로 밀어 넣으면 자원이 커진다. commit 전까지 변경과 rollback 가능성이 유지되고, 처리 대상이 많을수록 DB와 애플리케이션의 부담이 커진다. 한 건만 실패해도 전체를 다시 처리해야 하는 상황도 생긴다.

그래서 대량 변경은 보통 패키지 단위로 나누어 처리한다. 패키지는 "한 번에 처리하고 commit할 적당한 묶음"이다.

### 무엇인가

패키지 처리는 단순히 loop 안에 commit을 넣는 것이 아니다. commit 크기, 오류 처리 전략, 재시작점을 함께 설계하는 방식이다.

```abap
CONSTANTS c_pack_size TYPE i VALUE 5000.

DATA lv_count_in_pack TYPE i.
DATA lt_error TYPE STANDARD TABLE OF zbooking_error WITH EMPTY KEY.

LOOP AT lt_booking INTO DATA(ls_booking).
  MODIFY zbooking FROM @ls_booking.

  IF sy-subrc <> 0.
    APPEND VALUE #(
      booking_id = ls_booking-booking_id
      reason     = |MODIFY failed, sy-subrc={ sy-subrc }|
    ) TO lt_error.
  ENDIF.

  lv_count_in_pack += 1.

  IF lv_count_in_pack >= c_pack_size.
    IF lt_error IS INITIAL.
      COMMIT WORK.
    ELSE.
      ROLLBACK WORK.
      " 실제 프로그램에서는 이 패키지의 오류를 별도 로그에 남긴다.
      CLEAR lt_error.
    ENDIF.

    CLEAR lv_count_in_pack.
  ENDIF.
ENDLOOP.

IF lv_count_in_pack > 0.
  IF lt_error IS INITIAL.
    COMMIT WORK.
  ELSE.
    ROLLBACK WORK.
  ENDIF.
ENDIF.
```

마지막 `IF lv_count_in_pack > 0`가 중요하다. 전체 건수가 패키지 크기의 배수가 아니면 마지막 나머지 묶음이 남는다. 이 commit을 빼먹으면 마지막 묶음 처리 의도가 불분명해진다.

### 어떻게 확인하는가

1. 총 건수, 패키지 크기, 예상 commit 횟수를 계산한다.
2. 한 패키지 안에서 실패가 났을 때 전체 패키지를 rollback할지, 성공 건만 commit하고 실패 건을 남길지 정한다.
3. 각 패키지 완료 후 처리 위치를 기록한다.
4. 장애 후 재시작할 때 처음부터가 아니라 마지막 안전 지점 다음부터 시작할 수 있는지 확인한다.
5. 패키지 크기를 바꾸며 처리 시간, DB 부담, 오류 복구 단위를 비교한다.

패키지 크기는 정답 숫자가 아니라 절충이다. 너무 작으면 commit 오버헤드가 커지고, 너무 크면 자원 부담과 재처리 범위가 커진다. 원본의 1천~1만 범위는 학습용 감각으로 좋지만, 실제 값은 시스템 성능, 테이블 크기, 업무 허용 시간, 오류 복구 정책에 따라 달라진다.

### 실수와 주의

- loop 안에서 무조건 `COMMIT WORK`를 자주 실행하면 논리 단위가 너무 작아진다.
- 전체 단일 commit은 실패 시 재처리 범위가 지나치게 커질 수 있다.
- 마지막 나머지 패키지 commit을 빠뜨리면 끝부분 처리가 불명확해진다.
- 패키지 commit을 쓰면 이미 commit된 이전 패키지는 나중 rollback으로 취소되지 않는다. 이 점을 사용자와 운영자에게 명확히 설명해야 한다.
- 재시작점 없이 패키지 처리하면 장애 후 어디서 다시 시작할지 모른다.

### 체험형 학습 설계

**패키지 커밋 시각화: 크기별 부담과 재시작점**

| 요소 | 설계 |
|---|---|
| 데이터 | 총 23,500건 입력, 패키지 크기 500/1,000/5,000/전체, 12,400번째 오류 |
| 버튼 | `패키지 크기 선택`, `처리 시작`, `오류 주입`, `장애 후 재시작`, `마지막 commit 누락 실험` |
| 상태 | current row, current package, committed packages, pending rows, rollback scope, restart position |
| 피드백 | 전체 commit은 오류 시 12,399건이 모두 pending으로 사라지고, 패키지 commit은 마지막 성공 패키지 이후부터 재시작하는 차이를 막대 그래프로 보여 준다. |

### 정리

대량 변경은 "빠르게 한 번에"가 아니라 "복구 가능하게 나누어"가 핵심이다. 패키지 크기는 성능과 복구 범위의 절충이고, commit 단위는 운영 사고가 났을 때 어디서 다시 시작할지까지 결정한다.

## CH24 최종 정리

CH24에서 배운 저장의 기본 원칙은 다음과 같다.

| 원칙 | 의미 |
|---|---|
| 의도를 먼저 고른다 | `INSERT`, `UPDATE`, `MODIFY`, `DELETE`는 각각 다른 업무 의도다. |
| 결과를 숫자로 확인한다 | `sy-subrc`와 `sy-dbcnt`를 함께 본다. |
| commit은 업무 단위 끝에서 한다 | 성공 경로 중간에 commit을 흩뿌리지 않는다. |
| 실패는 rollback하거나 기록한다 | 실패를 모르면 복구할 수 없다. |
| update task는 등록과 실행을 구분한다 | `IN UPDATE TASK`는 commit 때 실행된다. |
| 대량은 패키지와 재시작점이 핵심이다 | 패키지 크기, 오류 전략, 마지막 commit을 함께 설계한다. |

CH24는 데이터를 바꾸는 장이다. 다음 CH25에서는 여러 사용자가 동시에 같은 데이터를 바꾸려 할 때 어떻게 충돌을 막을지로 넘어간다.
