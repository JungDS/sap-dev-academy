# CH10_REWRITE - 모듈화 기초 v1

> 목적: `content/abap/CH10`의 7개 레슨을 "IT 비전공자 입문자가 왜 필요한지부터 실습 확인까지 직관적으로 이해하고 따라갈 수 있는 완성 강의자료" 수준으로 재작성한 기준 원고다. 이 문서는 아직 `content/abap` 원본을 덮어쓴 결과가 아니라, 재작업 판정 이후 실제 반영 전 검수 가능한 v1 기준안이다.

## CH10 전체 설계

CH10의 한 문장 목표는 "FORM/PERFORM 의 Call Stack 점프·복귀 물리 흐름과 Clean ABAP 전면 폐기 통제, USING/CHANGING 의 Call by Reference(8바이트 주소 직접 결선) · Call by Value(로컬 복제 버퍼 할당) · Call by Value and Result(ENDFORM 정상 도달 시 Copy-back 역대입)의 3가지 물리 메모리 전달 기작, Function Module 의 EXPORTING/IMPORTING 방향 혼동 해소와 Function Group 전체 RAM 로딩 및 TOP 인클루드 글로벌 데이터 스택 공유 수명, 그리고 Global Class Static Method `=>` 팩토리 최선주의 수립으로 단위 로직 모듈화 통제력을 완성한다"이다.

IT 비전공자 입문자는 같은 코드를 5곳에 복사-붙여넣기로 산재시킨 뒤, 로직이 바뀌면 5곳을 일일이 수정하다가 1곳을 빠뜨려 운영 시스템 장애를 초래한다.
또한, `FORM` 의 파라미터 전달 방식에서 `USING` 으로 넘긴 변수가 원본을 직접 가리킨다는 사실(Call by Reference)을 모른 채, 서브루틴 안벽에서 값을 덮어 오염시키고 "원본이 왜 바뀌었지?" 하며 디버거만 붙들고 삽질한다.
따라서 본 챕터는 다음과 같은 단계적 해소 장치로 설계를 배치한다.

1. **FORM/PERFORM 호출 흐름**: Call Stack 의 프레임 점프·복귀 물리 기작 및 전역 변수 침범 오염 위험, Clean ABAP 전면 폐기(Deprecated) 통제 선언.
2. **USING/CHANGING 파라미터 기초**: 입력(USING)과 출력(CHANGING)의 역할 분리 관례, RETURN 즉시 탈출, STATICS 정적 지역 변수 수명 보존.
3. **3가지 전달 방식**: Call by Reference(주소 직결선) · Call by Value(복제 버퍼) · Call by Value and Result(Copy-back 역대입)의 RAM 물리 기작.
4. **Function Module(SE37)**: CALL FUNCTION 호출 구조, EXPORTING/IMPORTING 방향이 '호출자 기준'인 혼동 해소, EXCEPTIONS → sy-subrc 매핑, Function Group 전체 RAM 적재와 TOP 인클루드 글로벌 스택 공유 및 메모리 오염 가드.
5. **Local Class 정적 메서드**: DEFINITION/IMPLEMENTATION 이원 뼈대, CLASS-METHODS 정적 선언, `=>` 호출, PUBLIC/PRIVATE 캡슐 경계.
6. **Global Class 호출**: SE24 전역 클래스의 블랙박스 호출, 정적 `=>` 팩토리 우선, 인스턴스 `->` 는 CH20 격리.
7. **선택 기준 및 캡스톤**: FORM 폐지 / FM 특수 존치(RFC·BAPI) / Class Method 최선주의 판단 기준, 콘서트 앱 잔여석 계산·예매 판정 모듈화 실습.

---

## CH10-L01 - FORM / PERFORM 기본 호출

### 왜 필요한가

CH09 까지 데이터 사전(DDIC)과 입력 도움말(F4) 으로 테이블 뼈대와 무결성을 세웠다.
이제부터는 비즈니스 연산 로직을 빚는데, 같은 계산 로직이 프로그램 곳곳에 산재하여 터지는 '코드 중복 지옥' 이 장벽이다.
- " 잔여석 계산 코드를 5개 프로그램에 복사-붙여넣기로 뿌렸다.
정원 계산 공식이 바뀌자 3곳만 수정하고 2곳을 빠뜨려 동일 시스템 안에서 잔여석이 두 종류로 계산되는 무결성 붕괴를 초래했다."
반복되는 코드를 한 곳에 묶어 이름으로 부르는 가장 원시적인 도구, **FORM / PERFORM (서브루틴)** 의 Call Stack 점프·복귀 물리 기작을 이해해야 모듈화의 초석을 놓습니다.

**같은 코드 블록을 FORM 으로 정의하고 PERFORM 으로 이름을 불러 실행 흐름을 점프·복귀시키는 Call Stack 물리 동작과, Clean ABAP 스펙에서 FORM 이 전면 폐기(Deprecated) 통제된 레거시 문법인 아키텍처적 한계를 규명하는 기술**이 필요하다. 그것이 **서브루틴 기초**의 완수다.

### 무엇인가

#### 1. FORM / PERFORM 의 물리적 동작 (Call Stack 점프·복귀)
- **FORM (정의)**: **프로그램 소스 하단에 `FORM print_hello. ... ENDFORM.` 으로 코드 블록을 묶어 이름표를 붙이는 구문이다. FORM 블록은 정의만으로는 절대 실행되지 않는다. 오직 PERFORM 이 이름을 불러줄 때에만 커널이 코드 진입점으로 점프(Jump)하여 안벽 코드를 실행한다.**
- **PERFORM (호출)**: **`PERFORM print_hello.` 를 실행하는 그 찰나, 아바 런타임 엔진은 현재 실행 지점의 주소를 Call Stack (호출 스택) 프레임에 푸시(Push) 저장한 뒤, 점프 대상인 FORM print_hello 코드 블록의 첫 줄로 Instruction Pointer 를 순간이동 격발시킨다. ENDFORM 에 도달하면, Call Stack 에서 저장해 둔 원래 위치 주소를 팝(Pop) 하여 PERFORM 문 바로 다음 줄로 자동 복귀한다.**

#### ⚠️ [ 서브루틴의 전역 변수 침범 오염 위험 ]
- **FORM 블록 안벽에서 별도의 DATA 선언 없이 전역 변수(`gv_count` 등)를 직접 읽거나 덮어 쓸 수 있다. 이는 극히 위험하다.**
- 서브루틴 10개가 전역 변수 1개를 서로 다른 값으로 덮어쓰면서, 실행 순서에 따라 결과가 달라지는 '타이밍 의존 버그(Timing-dependent Bug)' 가 터진다.
- **원칙**: FORM 안벽에서는 파라미터(USING/CHANGING — L02)와 지역 변수(DATA)만 사용하고, 전역 변수 직접 참조를 금지하는 격리 코딩을 수호한다.

#### ⚠️ [ Clean ABAP — FORM/PERFORM 전면 폐기 통제 선언 ]
- **`FORM / PERFORM` 은 S/4HANA Clean ABAP 표준 스펙에서 전면 폐기(Deprecated) 통제된 레거시 문법이다.**
- **현실**: 20~30년 된 SAP 커스텀 시스템에는 FORM 이 수만 개 산재해 있으므로, 기존 코드를 읽고 유지보수하는 독해 능력은 100% 필수이다. 하지만 **신규 개발에서 FORM 을 새로 작성하는 행위는 전면 금지되며**, 반드시 클래스 메서드(L04~L05)로 모듈화해야 한다.

### 어떻게 확인하는가

```abap
REPORT zhello_form.

DATA gv_count TYPE i.  " 전역 변수.

START-OF-SELECTION.
  gv_count = 0.
  WRITE: / '★ PERFORM 호출 전 — 여기가 Call Stack 원점이다!'.

  PERFORM print_hello.    " 1차 점프 → FORM → 복귀!
  WRITE: / '★ 1차 복귀 완료. gv_count =', gv_count.

  PERFORM print_hello.    " 2차 점프 → FORM → 복귀!
  WRITE: / '★ 2차 복귀 완료. gv_count =', gv_count.

"---------- 서브루틴 정의 영역 (프로그램 하단에 배치) ----------
FORM print_hello.
  gv_count = gv_count + 1.   " ⚠️ 전역 변수를 직접 침범 조작!
  WRITE: / '  → FORM 안벽 진입. 호출 횟수 =', gv_count.
ENDFORM.
```

#### 체험/시뮬레이터 설계 (Call Stack 점프·복귀 레일)
- **프로세스 플로우**:
  1. 학습자가 [소스 코드 레일] 위에 [실행 커서 구슬] 이 올라가 있고, 하단에 [FORM print_hello 블록] 이 떨어져 있다.
  2. 커서가 `PERFORM print_hello` 를 밟는 순간, [Call Stack 선반] 에 현재 주소 '라인 7' 이 적힌 메모지가 쌓인다(Push).
  3. 커서가 [FORM 블록] 으로 순간이동하여 안벽 코드를 실행한다. 전역 `gv_count` 계기판이 0→1 로 올라간다.
  4. `ENDFORM` 을 밟자, [Call Stack 선반] 에서 메모지를 떼어(Pop) '라인 8' 로 복귀 점프하는 물리 이동 피드백을 감상한다.
- **상태 및 데이터**:
  - `FORM 정의 없이 PERFORM 만 쌩으로 코딩한 상태` → 런타임 결과: `Syntax error. Subroutine "PRINT_HELLO" is not defined` 하이라이트.
- **피드백**: FORM 은 코드 블록의 이름 묶음이며, PERFORM 은 Call Stack 에 복귀 주소를 쌓고 점프하는 물리 기작임을 터득한다.

### 실수/주의

- **FORM 을 START-OF-SELECTION 보다 위에 배치하면서 PERFORM 없이도 실행될 거라고 오해하여 아무 출력이 안 나오는 버그**:
  - FORM 블록은 PERFORM 호출 없이는 절대 기동되지 않으므로, 반드시 PERFORM 호출 문을 수호해야 합니다.

### 정리

- **`FORM`** 으로 코드 블록을 묶고, **`PERFORM`** 으로 이름을 불러 실행한다.
- PERFORM 실행 시 **`Call Stack`** 에 복귀 주소가 저장되고, ENDFORM 에서 자동 복귀한다.
- FORM 안벽에서 **전역 변수 직접 침범**은 타이밍 의존 버그를 낳으므로 지양한다.
- **`Clean ABAP`** 표준에서 FORM/PERFORM 은 **전면 폐기(Deprecated)** — 신규 코드는 클래스 메서드(L04~)로 수호한다.

---

## CH10-L02 - USING / CHANGING 파라미터

### 왜 필요한가

FORM/PERFORM 의 물리 점프·복귀까지 완수했다.
이제 서브루틴에 '값을 주고 결과를 돌려받는' 파라미터 배선이 장벽이다.
- " FORM add_tax 에 금액 1000 을 넘기고 세금 포함 결과를 돌려받고 싶다.
USING 과 CHANGING 은 각각 어떤 역할 규칙으로 배선해야 의도한 대로 입력과 출력이 격리 수송되는가?"
파라미터 없이 전역 변수로만 소통하면 10개 서브루틴이 1개 변수를 뒤섞어 시스템이 뇌사합니다.

**입력 전용 관례인 USING 과, 결과 반환 관례인 CHANGING 의 역할 분리 배선, 그리고 RETURN 즉시 탈출과 STATICS 정적 지역 변수 수명 보존 기술**이 필요하다. 그것이 **서브루틴 파라미터 기초**의 완수다.

### 무엇인가

#### 1. USING (입력 관례) / CHANGING (출력 관례)
- **USING**: **서브루틴에 데이터를 넘겨주는(입력) 관례적 수송 파이프다. `iv_` 접두어로 명명한다. "나는 이 값을 읽기만 할 테니 건네줘" 라는 설계 의도를 표현한다.**
- **CHANGING**: **서브루틴이 연산 결과를 돌려주는(출력) 관례적 반환 파이프다. `cv_` 접두어로 명명한다. "나는 이 값을 가공해서 돌려줄 거야" 라는 설계 의도를 표현한다.**

> **주의**: 관례상 USING 은 입력, CHANGING 은 출력이지만, 기본 전달 방식(Call by Reference)에서는 USING 으로 넘긴 변수도 서브루틴 안벽에서 덮어 바꿀 수 있다. 진정한 원본 보호는 `value(...)` 수식어가 필요하다(L03).

#### 2. RETURN — 서브루틴 즉시 탈출
- **`RETURN` 을 기동하면, ENDFORM 에 도달하기 전에 서브루틴 실행을 즉시 중단하고 호출자의 PERFORM 다음 줄로 강제 복귀시킨다.** 조건 판단 후 더 이상 연산이 무의미할 때 사용한다.

#### 3. STATICS — 정적 지역 변수 (호출 간 수명 보존)
- **일반 지역 변수 `DATA`**: 서브루틴 호출 시마다 Call Stack 프레임에 새로 할당되고, ENDFORM 복귀 시 프레임과 함께 즉시 파괴된다. 다음 호출 시 값이 0 으로 초기화된다.
- **`STATICS`**: **서브루틴 안벽에서 `STATICS sv_counter TYPE i.` 로 선언하면, 이 변수는 Call Stack 프레임이 아닌 프로그램 글로벌 힙 메모리의 특별한 슬롯에 배치된다. ENDFORM 복귀 후에도 값이 파괴되지 않고 존속하여, 다음 PERFORM 호출 시 이전에 남겨둔 값이 그대로 읽힌다.** 호출 횟수 카운터 등에 활용한다.

### 어떻게 확인하는가

```abap
REPORT zhello_using_changing.

START-OF-SELECTION.
  DATA: lv_out TYPE p LENGTH 8 DECIMALS 2.

  PERFORM add_tax USING 1000 CHANGING lv_out.
  WRITE: / '세금 포함 금액:', lv_out.       " 1100.00

  " ★ STATICS 호출 간 누적 테스트:
  PERFORM count_calls.   " 호출 1회차
  PERFORM count_calls.   " 호출 2회차
  PERFORM count_calls.   " 호출 3회차

"---------- 서브루틴 정의 ----------
FORM add_tax
  USING    iv_amount TYPE p
  CHANGING cv_result TYPE p.

  IF iv_amount <= 0.
    RETURN.               " ★ 음수/0 이면 즉시 탈출!
  ENDIF.

  cv_result = iv_amount * '1.1'.
ENDFORM.

FORM count_calls.
  STATICS sv_cnt TYPE i.     " ★ 호출 간 수명 보존!
  DATA    lv_tmp TYPE i.     " 매 호출마다 0으로 초기화됨.

  sv_cnt = sv_cnt + 1.
  lv_tmp = lv_tmp + 1.

  WRITE: / '  STATICS sv_cnt =', sv_cnt,   " 1, 2, 3 누적!
           '  DATA lv_tmp =', lv_tmp.       " 항상 1!
ENDFORM.
```

#### 체험/시뮬레이터 설계 (파라미터 이동 보드)
- **프로세스 플로우**:
  1. 학습자가 [호출자 영역: iv_amount=1000] 과 [FORM add_tax 안벽], 그리고 [USING 파이프] 와 [CHANGING 파이프] 를 본다.
  2. PERFORM 격발 — [USING 파이프] 에 파란 물약 1000 이 촥 흘러 FORM 안벽의 iv_amount 으로 전달된다.
  3. FORM 안벽에서 `iv_amount * 1.1 = 1100` 연산 완료 → [CHANGING 파이프] 에 초록 물약 1100 이 지잉 흘러 호출자의 lv_out 에 찰딱 대입된다.
  4. [STATICS 슬롯] 은 FORM 이 끝나도 계기판 숫자가 남아 있고, [DATA 슬롯] 은 매번 0 으로 리셋되는 비교 피드백을 감상한다.
- **상태 및 데이터**:
  - `iv_amount 에 음수 -500 을 넘긴 상태` → 런타임 결과: `RETURN 격발. cv_result 미변경. 즉시 복귀.` 하이라이트.
- **피드백**: USING 은 입력, CHANGING 은 출력 관례이며, STATICS 는 호출 간 값 보존, DATA 는 매 호출마다 파괴됨을 체득한다.

### 실수/주의

- **USING 과 CHANGING 의 순서를 호출(PERFORM)과 정의(FORM)에서 서로 다르게 적어 런타임에 변수 타입 불일치로 숏덤프(Short Dump) 기동**:
  - PERFORM 의 USING/CHANGING 순서와 FORM 정의의 순서가 1:1 로 완전 일치해야 합니다.

### 정리

- **`USING`** 은 입력 관례(`iv_`), **`CHANGING`** 은 출력 관례(`cv_`)로 역할을 분리한다.
- **`RETURN`** 은 ENDFORM 전에 서브루틴을 즉시 탈출한다.
- **`STATICS`** 는 호출 간 값이 보존되며, **`DATA`** 는 매 호출마다 초기화 파괴된다.
- PERFORM 과 FORM 의 **파라미터 순서·타입**은 1:1 정밀 일치를 수호한다.

---

## CH10-L03 - 파라미터 전달 방식 — Reference · Value · Value and Result

### 왜 필요한가

USING/CHANGING 배선 관례까지 완수했다.
이제 "USING 으로 넘긴 변수를 서브루틴 안벽에서 바꿨는데 원본까지 덩달아 바뀌어 버린" 물리 메모리 기작이 장벽이다.
- " 정훈영이 USING 으로 넘긴 gv_name 을 서브루틴 안에서 건드리지 말라고 했는데,
팀원이 FORM 안벽에서 gv_name 을 덮어썼더니 호출자의 원본 변수까지 동시에 오염됐다.
'읽기 전용' 이라고 관례적으로 적어둔 USING 이 왜 원본을 보호하지 못하는가?"
이 의문을 해소하기 위해 Call by Reference · Call by Value · Call by Value and Result 의 3가지 RAM 물리 기작을 정밀 이해해야 합니다.

**Call by Reference(8바이트 주소 직접 결선)와 Call by Value(로컬 복제 버퍼 할당), 그리고 Call by Value and Result(ENDFORM 정상 도달 시 Copy-back 역대입)의 3가지 파라미터 전달 방식의 RAM 물리 기작을 식별하는 기술**이 필요하다. 그것이 **전달 방식 장악**의 완수다.

### 무엇인가

#### 🧭 [ 3가지 파라미터 전달 방식 RAM 물리 기작 명세 ]

```text
[1] Call by Reference (주소 직접 결선) — 기본값! :
   - 문법 : USING iv_x  또는  CHANGING cv_x  (value 수식어 없음)
   - 물리 기작 : 호출자의 원본 변수가 차지하는 메모리 주소 (8바이트 포인터)를 FORM 안벽의 
                 파라미터 이름(iv_x)에 곧바로 결선한다.
                 iv_x 는 원본 변수의 '별명 이름표' 일 뿐, 둘은 동일한 메모리 셀을 가리킨다.
   - 결과 : FORM 안벽에서 iv_x 값을 바꾸면 = 호출자의 원본 변수가 동시에 바뀐다!
   - 장점 : 데이터 복사가 없어 수백 MB 내부 테이블을 넘겨도 메모리 낭비가 0 이다 (극고속).
   - ⚠️ 위험 : USING 으로 '입력 전용' 의도를 적어놨어도, 안벽에서 덮어쓰면 원본이 오염된다!
   │
[2] Call by Value (로컬 복제 버퍼) :
   - 문법 : USING value(iv_x)
   - 물리 기작 : PERFORM 실행 시, 원본 값의 전체 비트열을 Call Stack 프레임의 로컬 복제 버퍼에
                 바이트 단위 1:1 복사해 놓는다.
                 iv_x 는 이 복제 버퍼를 가리키며, 원본 주소와 완전히 독립 분리된다.
   - 결과 : FORM 안벽에서 iv_x 를 아무리 덮어써도, 호출자의 원본 변수는 0.0001% 도 안 바뀐다!
   - 장점 : 원본이 완벽 보호된다 (진정한 입력 전용).
   - 비용 : 대용량 내부 테이블을 통째 복사하면 메모리 2배 점유 및 복사 지연이 발생한다.
   │
[3] Call by Value and Result (Copy-back 역대입) :
   - 문법 : CHANGING value(cv_x)
   - 물리 기작 : ① PERFORM 진입 시, 원본을 로컬 복제 버퍼에 복사한다 (Value 와 동일).
                 ② FORM 안벽에서 cv_x 를 자유롭게 조작한다 (로컬 버퍼를 조작).
                 ③ ENDFORM 에 정상 도달하는 바로 그 찰나에만, 로컬 버퍼의 최종 값을
                    원본 변수로 역복사(Copy-back) 대입한다!
   - ★ 핵심 : 만약 중간에 런타임 에러나 강제 예외로 비정상 종료되면,
              로컬 버퍼가 폐기되어 원본은 절대 수정되지 않는다 (트랜잭션 안전성 확보)!
   - 비용 : 복사 2회(진입 + 복귀) 발생.
```

### 어떻게 확인하는가

```abap
REPORT zhello_call_modes.

DATA: gv_ref TYPE i VALUE 100,
      gv_val TYPE i VALUE 200,
      gv_vr  TYPE i VALUE 300.

WRITE: / '호출 전 — ref:', gv_ref, ' val:', gv_val, ' vr:', gv_vr.

PERFORM test_modes
  USING         gv_ref      " ① Call by Reference (기본)
  USING value(  gv_val )    " ② Call by Value
  CHANGING value( gv_vr ).  " ③ Call by Value and Result

WRITE: / '호출 후 — ref:', gv_ref, ' val:', gv_val, ' vr:', gv_vr.
" 결과: ref=999 (원본 오염!), val=200 (원본 보호!), vr=888 (정상 복귀 → Copy-back!)

"----------
FORM test_modes
  USING         iv_ref TYPE i
  USING value(  iv_val ) TYPE i
  CHANGING value( cv_vr ) TYPE i.

  iv_ref = 999.    " ① 원본 gv_ref 가 동시에 999 로 오염!
  iv_val = 777.    " ② 로컬 복제만 바뀜. 원본 gv_val = 200 보존!
  cv_vr  = 888.    " ③ 로컬 복제에 888 기입. ENDFORM 도달 시 원본에 역대입!
ENDFORM.
```

#### 체험/시뮬레이터 설계 (Copy-back 찰나 복제기)
- **프로세스 플로우**:
  1. 학습자가 [호출자 메모리 3칸: ref=100, val=200, vr=300] 과 [FORM 안벽 3칸], 그리고 [연결 전선 3종류] 를 본다.
  2. [Reference 전선] — 호출자 ref 칸과 FORM iv_ref 칸이 동일한 빨간 선으로 직결선되어 같은 칸을 가리킨다. FORM 안에서 999 를 쓰자 호출자 ref 칸도 동시에 999 로 깜빡인다!
  3. [Value 전선] — 호출자 val 칸의 200 이 파란 복사기를 통과해 FORM 로컬 칸에 복제된다. FORM 안에서 777 을 써도 호출자 val 칸은 200 그대로 미동도 없다!
  4. [Value-Result 전선] — 호출자 vr 칸의 300 이 초록 복사기를 통과해 FORM 로컬에 복제. FORM 안에서 888 을 쓰고, ENDFORM 에 도달하는 순간 초록 역복사 화살표가 격발되어 호출자 vr 칸이 888 로 깜빡인다!
  5. 만약 FORM 안에서 [강제 에러 트리거] 를 켜면, ENDFORM 에 도달하지 못해 역복사가 기각되고 호출자 vr 칸은 300 그대로 보존되는 안전 기작 피드백을 감상한다.
- **상태 및 데이터**:
  - `CHANGING 에 value() 수식어를 누락하고 서브루틴 안에서 연산 도중 에러 강제 기각 상태` → 런타임 결과: `원본 변수가 연산 중간값으로 오염됨 (부분 업데이트 참사). Copy-back 안전 장치 미작동!` 하이라이트.
- **피드백**: Reference 는 주소 직결선(위험+고속), Value 는 복제 보호(안전), Value-Result 는 정상 종료 시만 역대입(트랜잭션 안전)임을 각인한다.

### 실수/주의

- **수백 MB 짜리 대용량 내부 테이블을 USING value(...) 로 넘겨 메모리 2배 폭증 및 TIME_OUT 숏덤프 기동**:
  - 대용량 데이터는 Call by Reference 로 넘기되, FORM 안벽에서 원본을 변조하지 않도록 코딩 규율을 수호합니다.

### 정리

- **`Call by Reference`** (기본): 원본 주소 직결선. 고속이나 원본 오염 위험.
- **`Call by Value`** (`USING value(...)`): 로컬 복제. 원본 완벽 보호.
- **`Call by Value and Result`** (`CHANGING value(...)`): 복제 후 **ENDFORM 정상 도달 시에만 역대입(Copy-back)**. 트랜잭션 안전성 확보.
- 대용량 데이터는 **Reference** 로 넘기고, 원본 보호가 필요하면 **Value** 수식어를 수호한다.

---

## CH10-L04 - Function Module 기초 — CALL FUNCTION · Function Group

### 왜 필요한가

서브루틴의 3가지 전달 방식까지 완수했다.
그런데 서브루틴(FORM)은 '같은 프로그램 안벽' 에서만 호출할 수 있어 '전사 공유 재사용' 이 불가능한 구조적 한계가 장벽이다.
- " 잔여석 계산 FORM 을 프로그램 A 에 정의했다.
프로그램 B 와 프로그램 C 에서도 동일한 잔여석 계산을 호출하고 싶은데, FORM 은 다른 프로그램에서 이름을 불러도 접근할 수 없다."
여러 프로그램이 전역으로 공유하는 재사용 블록, **Function Module** 의 호출 구조와 방향 규칙, 그리고 소속 **Function Group** 의 RAM 로딩 기작을 이해해야 전사 모듈화를 장착합니다.

**SE37 에서 Function Module 을 정의하고 CALL FUNCTION 으로 호출하는 EXPORTING/IMPORTING/CHANGING/EXCEPTIONS 배선 구조, 파라미터 방향이 '호출자 기준'인 혼동 해소, 그리고 Function Group 전체 RAM 로딩 및 TOP 인클루드 글로벌 데이터 스택 공유 수명 기술**이 필요하다. 그것이 **Function Module 모듈화**의 완수다.

### 무엇인가

#### 1. Function Module (함수 모듈) 의 위상
- **전역 재사용 단위**: **프로그램 안벽에 갇히는 FORM 과 달리, Function Module 은 `SE37` 트랜잭션에서 전역 ABAP Repository 에 등록되는 독립 재사용 블록이다. 시스템 내의 어떤 프로그램이든 함수 이름만 알면 `CALL FUNCTION 'Z_ADD_TAX'` 로 전사 공유 호출할 수 있다.**

#### 2. CALL FUNCTION 호출 구조 및 방향 혼동 해소

```text
┌───────────────────────────────────────────────────────────────┐
│  호출자 프로그램 (내 리포트 소스)                                 │
│                                                               │
│  CALL FUNCTION 'Z_ADD_TAX'                                    │
│    EXPORTING  iv_amount = 1000     " 나(호출자)가 함수에 '내보낸다'│
│    IMPORTING  ev_result = lv_out   " 나(호출자)가 함수에서 '가져온다'│
│    CHANGING   cv_table  = lt_data  " 넘겼다 수정되어 돌아온다     │
│    EXCEPTIONS invalid   = 1       " 함수가 던진 예외를 sy-subrc 로 수신│
│               OTHERS    = 2.                                  │
│                                                               │
│  IF sy-subrc <> 0.                                            │
│    " 예외 처리                                                  │
│  ENDIF.                                                       │
└───────────────────────────────────────────────────────────────┘
```

#### ⚠️ [ EXPORTING / IMPORTING 방향 — '호출자 기준' 혼동 해소 ]
- **모든 입문자가 100% 혼동하는 포인트다.**
- **`EXPORTING`**: **"나(호출자)가 함수 쪽으로 값을 내보낸다(Export)" 는 뜻이다. 함수 입장에서는 이 값을 받아들이는(Import) 셈이다.**
- **`IMPORTING`**: **"나(호출자)가 함수로부터 결과를 가져온다(Import)" 는 뜻이다. 함수 입장에서는 이 값을 내보내는(Export) 셈이다.**
- **기억법**: **"방향은 항상 호출자의 시선(My Perspective)이다."** `나`가 `보낸다` = EXPORTING. `나`가 `받는다` = IMPORTING.

#### 3. EXCEPTIONS → sy-subrc 매핑
- 함수 내벽에서 오류 조건이 충족되면 `RAISE invalid.` 를 쏴서 예외를 던진다.
- 호출자의 `EXCEPTIONS invalid = 1` 에 의해 `sy-subrc = 1` 로 세팅되어 돌아온다.
- **`sy-subrc` 체크를 누락하면, 함수가 실패해도 호출자는 성공으로 착각하고 오염 데이터를 후속 처리하는 뇌사를 초래한다.**

#### 🧭 [ Function Group 전체 RAM 로딩 및 TOP 글로벌 스택 공유 명세 ]
- **Function Group(함수 그룹)**: **여러 Function Module 들을 하나의 묶음 패키지로 포장한 논리적 라이브러리 단위다. SE37 에서 함수를 만들 때 반드시 소속 Function Group 을 지정해야 한다.**
- **RAM 전체 적재**: **프로그램이 `CALL FUNCTION 'Z_ADD_TAX'` 를 처음 격발하는 그 찰나, 아바 런타임은 Z_ADD_TAX 가 소속된 Function Group 전체(내부의 모든 함수 + TOP 인클루드 + 글로벌 변수)를 RAM 세션 메모리에 일제히 선제 적재(Load)한다.** 같은 그룹의 다른 함수를 나중에 호출하면 이미 RAM 에 적재되어 있으므로 재로딩이 발생하지 않는다.
- **TOP 인클루드 글로벌 데이터 스택 공유**: **Function Group 의 TOP 인클루드(자동 생성되는 글로벌 선언부)에 `DATA gv_cache TYPE string.` 같은 전역 변수를 선언하면, 이 변수는 프로그램 실행이 종료될 때까지 같은 그룹 내 모든 함수가 공유 접근할 수 있다.** 함수 A 가 gv_cache 에 값을 적재하면, 함수 B 가 호출될 때 그 값이 그대로 남아 있다.
- **⚠️ 메모리 오염 가드**: 이 공유 스택은 편리하지만, 이전 함수 호출의 찌꺼기 데이터가 잔존하여 다음 함수 호출 결과를 오염시키는 위험이 있다. **함수 진입 시 공유 변수를 CLEAR 로 초기화하는 수호 루틴을 수호해야 한다.**

### 어떻게 확인하는가

```abap
REPORT zhello_call_function.

DATA: lv_result TYPE p LENGTH 8 DECIMALS 2.

" ★ 함수 모듈 호출 — 방향은 '나(호출자)' 기준!
CALL FUNCTION 'Z_ADD_TAX'
  EXPORTING
    iv_amount = 1000          " 나 → 함수로 내보냄
  IMPORTING
    ev_result = lv_result     " 함수 → 나로 가져옴
  EXCEPTIONS
    invalid_amount = 1        " 음수 금액이면 sy-subrc = 1
    OTHERS         = 2.

IF sy-subrc = 0.
  WRITE: / '세금 포함:', lv_result.       " 1100.00
ELSEIF sy-subrc = 1.
  WRITE: / '★ 에러: 금액이 음수입니다!'.
ELSE.
  WRITE: / '★ 에러: 알 수 없는 예외 발생!'.
ENDIF.
```

#### 체험/시뮬레이터 설계 (Function Module 방향 상자)
- **프로세스 플로우**:
  1. 학습자가 [호출자 프로그램 박스] 와 [Z_ADD_TAX 함수 모듈 박스], 그리고 사이의 [EXPORTING 파이프 →] 와 [← IMPORTING 파이프] 를 본다.
  2. [EXPORTING 파이프] 에 1000 을 넣는다 → 파란 물약이 함수 박스 안으로 흐른다 (나 → 함수).
  3. 함수 박스 안에서 연산 후, [IMPORTING 파이프] 에 초록 물약 1100 이 반대로 흘러 호출자 lv_result 에 찰딱 도킹된다 (함수 → 나).
  4. [RAISE invalid 트리거] 를 켜면, IMPORTING 파이프가 텅 비고 대신 [sy-subrc 계기판] 이 0→1 로 빨갛게 점등되는 예외 피드백을 감상한다.
  5. [Function Group 메모리 뷰] 를 열면, Z_ADD_TAX 호출 시 같은 그룹의 Z_CHECK_LIMIT 함수까지 일제히 RAM 에 올라가 있는 전체 적재 구조를 본다.
- **상태 및 데이터**:
  - `EXCEPTIONS 절을 생략하고 sy-subrc 체크를 누락한 상태` → 런타임 결과: `Function raised exception but caller ignored it. ev_result contains garbage/initial value` 하이라이트.
- **피드백**: 방향은 호출자 기준이며, EXCEPTIONS 체크 누락은 단골 뇌사임을 터득한다.

### 실수/주의

- **EXPORTING 필수(REQUIRED) 파라미터를 누락하고 CALL FUNCTION 을 격발하여 Syntax error 기동**:
  - 함수 정의 시 `OPTIONAL` 플래그가 꺼져 있는 필수 파라미터는 호출 시 반드시 값을 수호해 기입해야 합니다.
- **Function Group 의 TOP 인클루드 글로벌 변수에 찌꺼기가 남은 채 다음 함수를 호출하여, 이전 호출의 데이터가 다음 호출 결과를 오염시키는 참사**:
  - 함수 진입 시 `CLEAR gv_cache.` 초기화 루틴을 수호합니다.

### 정리

- **`Function Module`** 은 SE37 에서 전역 Repository 에 등록되는 전사 공유 재사용 블록이다.
- **`EXPORTING`** = 나(호출자)가 보낸다. **`IMPORTING`** = 나(호출자)가 받는다. 방향은 항상 **호출자 기준**.
- **`EXCEPTIONS`** → **`sy-subrc`** 매핑 체크를 누락하면 실패를 성공으로 착각하는 뇌사를 초래한다.
- **`Function Group`** 전체가 첫 호출 시 RAM 에 일제히 적재되며, TOP 인클루드의 글로벌 변수는 **그룹 내 전 함수가 공유**한다. 찌꺼기 오염 방지를 위해 **CLEAR 초기화를 수호**한다.

---

## CH10-L05 - Local Class 정적 메서드 — DEFINITION / IMPLEMENTATION

### 왜 필요한가

Function Module 의 전사 공유 재사용까지 완수했다.
그런데 현대 ABAP 에서는 FORM 도 Function Module 도 아닌, 또 하나의 묶음 도구인 **클래스(Class)와 메서드(Method)** 가 모듈화의 주인공이다.
- " Clean ABAP 가이드가 신규 코드는 클래스를 쓰라고 한다.
객체(Object) 를 만들어야 메서드를 쓸 수 있다는데, 너무 어렵게 느껴진다.
객체를 만들지 않아도 되는 '정적 메서드' 를 먼저 맛보고 싶다."
**지금 단계에서는 객체지향의 전모를 배우지 않는다(CH20).** 오직 '객체 없이 이름만으로 부르는 정적 메서드' 를 FORM/FM 의 대체재로 활용하는 기초를 닦습니다.

**CLASS DEFINITION(계약서)과 IMPLEMENTATION(본문)의 이원 뼈대, CLASS-METHODS 정적 선언, `=>` 호출 연산자, 그리고 PUBLIC/PRIVATE 캡슐 경계의 설계 기술**이 필요하다. 그것이 **Local Class 정적 메서드 기초**의 완수다.

### 무엇인가

#### 1. DEFINITION (계약서) / IMPLEMENTATION (본문) 이원 뼈대
- **DEFINITION**: **"이 클래스에는 어떤 메서드가 있고, 파라미터가 뭐며, 뭘 돌려주는지" 외형 규격만 선언하는 계약서(Interface Blueprint)다. 실제 코드 본문은 일체 적지 않는다.**
- **IMPLEMENTATION**: **DEFINITION 에서 선언한 메서드의 실제 연산 코드 본문을 기입하는 구현 영역이다.**
- **왜 둘로 나누나**: 호출자(사용자)는 DEFINITION 만 보고 "이 메서드에 무엇을 넘기면 무엇이 돌아오는지" 계약만 파악하면 된다. 내부 구현이 바뀌어도 계약이 그대로면 호출 코드를 수정할 필요가 없다.

#### 2. CLASS-METHODS (정적 메서드) 와 `=>` 호출
- **CLASS-METHODS**: **객체(Object)를 생성하지 않고, 클래스 이름만으로 직접 부를 수 있는 메서드를 선언하는 키워드다.** 설계도(Class) 그 자체에 딱 붙어 있는 공용 도구라 생각하면 쉽다.
- **`=>` (정적 호출 연산자)**: **`lcl_calc=>add_tax( 1000 )` 처럼 클래스이름`=>`메서드이름 으로 즉시 격발한다.** 객체를 찍어낼 필요가 없다.

#### 3. PUBLIC SECTION / PRIVATE SECTION (캡슐 경계)
- **PUBLIC SECTION**: **외부(호출자)에서 접근 가능한 공개 구역. 메서드, 상수 등을 여기에 선언한다.**
- **PRIVATE SECTION**: **클래스 안벽에서만 접근 가능한 비공개 구역. 내부 연산용 보조 메서드나 변수를 숨긴다.** 외부에서 호출하려 시도하면 Syntax error 가 기동된다.

### 어떻게 확인하는가

```abap
REPORT zhello_local_class.

"---------- 계약서 (DEFINITION) ----------
CLASS lcl_calc DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS add_tax
      IMPORTING iv_amount        TYPE p
      RETURNING VALUE(rv_result) TYPE p.
  PRIVATE SECTION.
    CLASS-DATA cv_rate TYPE p LENGTH 5 DECIMALS 2 VALUE '1.1'.
ENDCLASS.

"---------- 본문 (IMPLEMENTATION) ----------
CLASS lcl_calc IMPLEMENTATION.
  METHOD add_tax.
    rv_result = iv_amount * cv_rate.   " PRIVATE 변수 접근 가능!
  ENDMETHOD.
ENDCLASS.

"---------- 호출 ----------
START-OF-SELECTION.
  DATA lv_out TYPE p LENGTH 8 DECIMALS 2.

  lv_out = lcl_calc=>add_tax( 1000 ).   " ★ 객체 없이 => 정적 호출!
  WRITE: / '세금 포함:', lv_out.         " 1100.00
```

#### 체험/시뮬레이터 설계 (Local Class 계약·본문 스텝퍼)
- **프로세스 플로우**:
  1. 학습자가 [DEFINITION 계약서 패널] 과 [IMPLEMENTATION 본문 패널], 그리고 [호출자 프로그램 패널] 을 본다.
  2. [계약서 패널] 에 `add_tax: IMPORTING p, RETURNING p` 명세가 적혀 있다. 호출자는 이것만 보고 사용법을 파악한다.
  3. [호출자] 가 `lcl_calc=>add_tax( 1000 )` 을 격발한다. [=> 화살표] 가 [IMPLEMENTATION 본문] 으로 직행하여 연산 후 결과 1100 이 RETURNING 파이프를 타고 호출자에게 복귀한다.
  4. [PRIVATE SECTION 잠금 영역] 에 접근 시도 → [🔒 자물쇠] 가 빨갛게 점등하며 `Syntax error: cv_rate is not accessible` 에러 피드백을 감상한다.
- **상태 및 데이터**:
  - `DEFINITION 만 적고 IMPLEMENTATION 을 빠뜨린 상태` → 런타임 결과: `Syntax error. Implementation missing for class "LCL_CALC"` 하이라이트.
- **피드백**: 클래스는 계약(DEFINITION)+본문(IMPLEMENTATION) 이원 구조이며, 정적 메서드는 => 로 즉시 호출 가능함을 체득한다.

### 실수/주의

- **정적 메서드(CLASS-METHODS)인데 객체를 먼저 생성하려 `CREATE OBJECT` 를 쓰다가 "왜 안 되지?" 하고 삽질하는 경우**:
  - CLASS-METHODS 는 객체 없이 `=>` 로 직행 호출합니다. 객체 생성은 인스턴스 메서드(METHODS — CH20) 에서만 필요합니다.

### 정리

- 클래스는 **`DEFINITION`** (계약서) + **`IMPLEMENTATION`** (본문)으로 이원 분리된다.
- **`CLASS-METHODS`** 로 선언한 정적 메서드는 객체 없이 **`클래스=>메서드`** 로 즉시 호출한다.
- **`PUBLIC SECTION`** 은 외부 공개, **`PRIVATE SECTION`** 은 내부 전용 캡슐 경계다.

---

## CH10-L06 - Global Class 호출 · Subroutine / Function / Class 선택 기준

### 왜 필요한가

Local Class 정적 메서드까지 완수했다.
Local Class 는 '같은 프로그램 안벽' 에서만 존재하므로, 다른 프로그램에서는 이름을 불러도 접근할 수 없는 구조적 한계가 있다.
- " Function Module 처럼 전역으로 공유되는 OO 버전이 있다면, 그걸 어떻게 불러 쓰나?
그리고 이제 모듈화 도구가 셋(FORM, FM, Class) 이나 되는데, 신규 개발에서는 어느 것을 골라야 하나?"
**Global Class** 의 전역 블랙박스 호출과, 3대 모듈화 도구의 선택 기준 판단표를 장착해야 실무 모듈화 설계가 완성됩니다.

**SE24 에서 관리하는 Global Class 의 정적 `=>` 블랙박스 호출과, FORM 폐지 / FM 특수 존치(RFC·BAPI) / Class Method 최선주의의 Clean ABAP 선택 기준 기술**이 필요하다. 그것이 **모듈화 선택 기준 장악**의 완수다.

### 무엇인가

#### 1. Global Class (전역 클래스) — SE24
- **전역 재사용**: **`SE24` 트랜잭션(Class Builder)에서 `ZCL_BOOKING` 같은 이름으로 전역 Repository 에 등록하는 클래스다. 시스템 내 어떤 프로그램이든 클래스 이름만 알면 정적 메서드를 `zcl_booking=>get_remaining( )` 으로 호출할 수 있다.** Function Module 의 OO 버전이다.
- **블랙박스 호출**: **지금 단계에서는 Global Class 를 '직접 설계'하는 법은 배우지 않는다(CH20).** 이미 누군가(표준 또는 동료)가 만들어 놓은 Global Class 의 메서드를 **계약(IMPORTING/RETURNING)만 보고 블랙박스처럼 불러 쓰기만** 한다.

#### 2. 표준 Global Class 활용 예고
- `CL_` 로 시작하는 SAP 표준 Global Class 가 풍부하다. 대표적으로 다음 11장에서 표 출력(ALV)을 위해 `CL_SALV_TABLE` 의 정적 팩토리 메서드를 `=>` 로 호출하게 된다.

#### 🧭 [ 3대 모듈화 도구 선택 기준표 ]

```text
┌─────────────────────┬──────────────┬────────────┬──────────────────────────┐
│       도구           │    범위      │  권장도     │       언제 쓰나           │
├─────────────────────┼──────────────┼────────────┼──────────────────────────┤
│ Subroutine (FORM)   │ 프로그램 내부 │ ▲ 레거시    │ 기존 코드 읽기·유지보수만  │
│ Function Module     │ 전역 재사용  │ ○ 유효     │ RFC 원격호출, 표준 BAPI   │
│ Class / Method      │ 전역 재사용  │ ◎ 최선주의 │ 신규 개발 전반            │
└─────────────────────┴──────────────┴────────────┴──────────────────────────┘
```

#### 3. 선택 원칙 상세
- **신규 코드는 무조건 Class Method**: Clean ABAP 의 표준 가이드라인이다. 정적 메서드(`CLASS-METHODS`)로 충분하면 정적으로, 상태가 필요하면 인스턴스 메서드(`METHODS` — CH20)로 설계한다.
- **Function Module 은 특수 존치**: RFC(Remote Function Call — 원격 시스템 호출)와 BAPI(Business API — CH30) 는 함수 모듈 형태로만 지원된다. 이 두 경우에 한해 FM 을 신규 생성한다.
- **FORM 은 전면 폐지**: 새로 만들지 않는다. 기존 레거시 코드에서 만날 때 '읽고 이해하는 용도' 로만 활용한다.

### 어떻게 확인하는가

```abap
REPORT zhello_global_class.

" ★ 전역 클래스의 정적 메서드를 블랙박스처럼 호출!
DATA lv_text TYPE string.

lv_text = zcl_util=>format_amount( 1000 ).
WRITE: / '포맷된 금액:', lv_text.

" 파라미터가 여러 개인 경우 — 이름 지정 호출:
DATA lv_r TYPE i.
zcl_util=>calc(
  EXPORTING iv_a = 10
            iv_b = 20
  IMPORTING ev_r = lv_r ).
WRITE: / '계산 결과:', lv_r.
```

#### 체험/시뮬레이터 설계 (모듈화 선택 카드)
- **프로세스 플로우**:
  1. 학습자가 [상황 카드 5장] 을 본다: "신규 비즈니스 로직", "RFC 원격 호출", "레거시 코드 수정", "표준 BAPI 인터페이스", "프로그램 내 한 번만 쓰는 헬퍼".
  2. 각 카드를 [FORM 레일], [FM 레일], [Class 레일] 중 하나에 드래그한다.
  3. [정답 체크] 를 누르면 — "신규 비즈니스 로직" 과 "프로그램 내 헬퍼" 는 [Class 레일] 에, "RFC 원격 호출" 과 "표준 BAPI" 는 [FM 레일] 에, "레거시 코드 수정" 은 [FORM 레일] 에 정렬되는 피드백을 감상한다.
  4. 잘못 배치한 카드에는 ❌ 표시와 함께 이유 설명이 뜬다.
- **상태 및 데이터**:
  - `신규 개발에 FORM 을 새로 작성한 상태` → 런타임 결과: `Clean ABAP warning. FORM/PERFORM is deprecated. Use CLASS-METHODS instead` 하이라이트.
- **피드백**: 신규는 Class, RFC/BAPI 는 FM, 기존 읽기만 FORM 이라는 선택 원칙을 각인한다.

### 실수/주의

- **전역 클래스의 정적 메서드를 `->` (인스턴스 호출 연산자) 로 쓰려다 Syntax error 기동**:
  - 정적 메서드는 `=>`, 인스턴스 메서드는 `->` 입니다. 두 연산자를 혼동하지 않도록 수호합니다.

### 정리

- **`Global Class (SE24)`** 는 전역 Repository 에 등록된 OO 재사용 단위이며, 정적 메서드를 **`클래스=>메서드`** 로 즉시 호출한다.
- 신규 개발은 **`Class Method`** ◎ 최선주의, RFC/BAPI 특수 시 **`Function Module`** ○ 존치, FORM 은 **`전면 폐지 ▲`** 독해용만.
- 정적 호출은 **`=>`**, 인스턴스 호출은 **`->`** (CH20 격리).

---

## CH10-L07 - 실습 — 잔여석 계산 · 예매 판정 모듈화

### 왜 필요한가

3대 모듈화 도구의 선택 기준까지 완수했다.
이제 CH09 에서 구축한 콘서트 예매 데이터 모델(ZCONCERT/ZPERF/ZBOOKING)에 '잔여석 계산' 과 '예매 가능 판정' 이라는 핵심 비즈니스 로직을 빚어 모듈로 묶는 캡스톤 실습이 최종 관문이다.
- " ZCONCERT 마스터의 정원(CAPACITY) 이 100 석이고, 기존 ZBOOKING 의 예매 좌석 합계가 95 석이다.
신규 10석 예매 요청이 들어왔을 때, '잔여석 = 100 - 95 = 5석 < 10석 → 예매 불가!' 판정을 내리는 공용 모듈은 어떻게 빚어야 5개 프로그램이 나누어 쓸 수 있는가?"
이 캡스톤을 완수해야만 다음 11장에서 예매 결과를 표(ALV) 로 예쁘게 출력하는 단계로 도약합니다.

**ZBOOKING 예매 합계를 LOOP 로 집계하는 `get_remaining` 잔여석 계산 서브루틴과, 잔여석 대비 요청 좌석을 비교하는 `can_book` 예매 판정 서브루틴의 모듈화 설계, 그리고 동일 로직을 정적 클래스 메서드 `zcl_booking=>get_remaining` 으로 이식하는 Clean ABAP 이행 기술**이 필요하다. 그것이 **콘서트 앱 모듈화 캡스톤**의 완수다.

### 무엇인가

#### 1. get_remaining — 잔여석 계산 모듈
- **입력**: 공연 ID(`iv_concert`), 회차 번호(`iv_perf`).
- **연산 로직**:
  1. ZBOOKING 에서 해당 공연·회차의 예매 레코드를 SELECT INTO TABLE 로 한 방에 적재한다. (취소 상태 `'C'` 는 `WHERE status <> 'C'` 로 배제.)
  2. 적재된 내부 테이블을 LOOP 로 순회하며 `seats` (좌석수) 를 합산한다. (집계 SQL `SUM` 은 CH13 에서 배우므로 지금은 LOOP 합산.)
  3. ZCONCERT 마스터에서 해당 공연의 정원(`CAPACITY`) 을 SELECT SINGLE 로 가져온다.
  4. **잔여석 = CAPACITY - 합산좌석** 을 계산해 CHANGING 으로 돌려준다.

#### 2. can_book — 예매 가능 판정 모듈
- **입력**: 공연 ID, 회차 번호, 요청 좌석수(`iv_want`).
- **연산 로직**:
  1. 내부적으로 `get_remaining` 을 호출해 잔여석을 구한다. (모듈이 모듈을 호출하는 재사용 조합!)
  2. **요청 좌석 ≤ 잔여석** 이면 `cv_ok = abap_true` (예매 가능), 초과하면 `cv_ok = abap_false` (예매 불가).

#### ⚠️ [ 취소 건 합산 주의 ]
- `status = 'C'` (취소) 건을 합산에 포함시키면, 이미 반납된 좌석이 차지한 것으로 계산되어 잔여석이 실제보다 적게 나오는 무결성 오류가 터진다. **취소 건은 반드시 쿼리 WHERE 에서 배제한다.**

#### 3. Clean ABAP 이행 — 정적 클래스 메서드로 이식 (도전)

```abap
" ★ FORM 버전을 Class 로 이식한 예시:
CLASS lcl_booking DEFINITION.
  PUBLIC SECTION.
    CLASS-METHODS get_remaining
      IMPORTING iv_concert TYPE zbooking-concert_id
                iv_perf    TYPE zbooking-perf_no
      RETURNING VALUE(rv_left) TYPE i.

    CLASS-METHODS can_book
      IMPORTING iv_concert TYPE zbooking-concert_id
                iv_perf    TYPE zbooking-perf_no
                iv_want    TYPE i
      RETURNING VALUE(rv_ok) TYPE abap_bool.
ENDCLASS.

CLASS lcl_booking IMPLEMENTATION.
  METHOD get_remaining.
    DATA: lt_book TYPE TABLE OF zbooking,
          ls_book TYPE zbooking,
          lv_sum  TYPE i,
          lv_cap  TYPE zconcert-capacity.

    SELECT * FROM zbooking INTO TABLE lt_book
      WHERE concert_id = iv_concert AND perf_no = iv_perf
        AND status <> 'C'.

    LOOP AT lt_book INTO ls_book.
      lv_sum = lv_sum + ls_book-seats.
    ENDLOOP.

    SELECT SINGLE capacity FROM zconcert INTO lv_cap
      WHERE concert_id = iv_concert.

    rv_left = lv_cap - lv_sum.
  ENDMETHOD.

  METHOD can_book.
    DATA lv_left TYPE i.
    lv_left = get_remaining( iv_concert = iv_concert
                              iv_perf    = iv_perf ).
    rv_ok = boolc( iv_want <= lv_left ).
  ENDMETHOD.
ENDCLASS.

" 호출:
" DATA(lv_ok) = lcl_booking=>can_book( iv_concert = 'C001'
"                                       iv_perf    = '01'
"                                       iv_want    = 10 ).
```

### 어떻게 확인하는가

```text
[1단계] FORM 버전으로 잔여석 계산 :
   - PERFORM get_remaining USING 'C001' '01' CHANGING lv_left.
   - WRITE: / '잔여석:', lv_left.  " 정원 100 - 예매 합산 95 = 5

[2단계] FORM 버전으로 예매 판정 :
   - PERFORM can_book USING 'C001' '01' 10 CHANGING lv_ok.
   - IF lv_ok = abap_true.  " → 10 > 5 이므로 abap_false! 예매 불가!

[3단계] (도전) Class 메서드 이식 :
   - lv_left = lcl_booking=>get_remaining( iv_concert = 'C001' iv_perf = '01' ).
   - lv_ok   = lcl_booking=>can_book( iv_concert = 'C001' iv_perf = '01' iv_want = 3 ).
   - 결과: 3 <= 5 → abap_true (예매 가능)!
```

#### 체험/시뮬레이터 설계 (잔여석 계산기 + 예매 판정 토글)
- **프로세스 플로우**:
  1. 학습자가 [ZCONCERT 정원 게이지 = 100], [ZBOOKING 예매 바 = 95/100], 그리고 [잔여석 = 5] 계기판을 본다.
  2. [get_remaining 모듈 기어] 를 격발하면, ZBOOKING 에서 취소 제외 좌석을 합산하는 LOOP 애니메이션이 돌아가고, CAPACITY 에서 빼서 잔여석 5 를 계산하는 흐름을 본다.
  3. [can_book 모듈 기어] 에 요청 좌석 10 을 넣으면, 10 > 5 이므로 [❌ 예매 불가] 빨간 판정이 뜬다.
  4. 요청 좌석을 3 으로 줄이면, 3 ≤ 5 이므로 [✅ 예매 가능] 초록 판정으로 전환되는 피드백을 감상한다.
  5. [취소 건 포함 스위치] 를 켜면, 취소된 좌석까지 합산에 포함되어 잔여석이 마이너스로 뜨는 무결성 오류를 확인한다.
- **상태 및 데이터**:
  - `get_remaining 내부에서 WHERE status <> 'C' 조건을 빠뜨린 상태` → 런타임 결과: `잔여석이 비정상 마이너스. 취소 건이 좌석 합산에 포함됨` 하이라이트.
- **피드백**: 모듈화는 단일 책임(잔여석 계산)을 묶어 재사용하는 설계 원칙이며, FORM 에서 Class 로 이식하는 Clean ABAP 이행 패턴을 체험한다.

### 실수/주의

- **can_book 내부에서 get_remaining 을 호출하지 않고, 잔여석 계산 코드를 또 복사-붙여넣기하여 중복 코드를 양산하는 실수**:
  - 모듈화의 핵심은 '한 곳에 묶어 재호출' 입니다. can_book 은 get_remaining 을 호출하여 재사용 조합을 수호합니다.

### 정리

- **`get_remaining`**: 정원 - 예매합계(취소 제외) = 잔여석을 계산하는 모듈.
- **`can_book`**: get_remaining 을 재호출하여 요청 좌석 ≤ 잔여석 판정을 내리는 모듈.
- 취소 건(`status = 'C'`)은 **WHERE 에서 반드시 배제**해 합산 오류를 방지한다.
- FORM 버전을 **Local Class 정적 메서드로 이식**하는 것이 **Clean ABAP 이행**의 시작이다.
- 이제 예매 결과 목록을 표(ALV)로 출력하는 **CH11** 로 도약한다.
