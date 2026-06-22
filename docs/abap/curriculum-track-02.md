# ABAP 커리큘럼 — TRACK-02 · ABAP 실무

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **목적** — ABAP 실무 트랙 전용 뷰. 전체는 curriculum.md.
> 📊 트랙 1 · 챕터 13 · 레슨 68
> 🕒 생성: 2026-06-22T07:11:31.761Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

## TRACK-02 · ABAP 실무

현업 시나리오로 응용·고급 개발을 다룬다.

### CH23 · 실무 데이터 변경과 트랜잭션 제어 _(난이도: 중급)_

> 실제로 데이터를 바꾸고 커밋·롤백을 제어해야 한다.

**키워드**: INSERT, UPDATE, MODIFY, COMMIT WORK, LUW

**레슨 (5)**
- **CH23-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L02 · COMMIT WORK / ROLLBACK WORK** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L03 · DB LUW와 SAP LUW 차이** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L04 · 오류 로그와 재처리 구조** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH23-L05 · 대량 변경 시 Package 처리** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH24 · Lock Object와 동시성 제어 _(난이도: 중급)_

> 여러 사용자가 동시에 같은 데이터를 건드린다 — 잠금이 필요하다.

**키워드**: Lock Object, ENQUEUE, DEQUEUE

**레슨 (5)**
- **CH24-L01 · Lock Object 설계 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L02 · ENQUEUE / DEQUEUE Function Module** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L03 · Lock 해제와 예외 처리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L04 · 다중 사용자 변경 충돌 시나리오** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH24-L05 · Lock Object와 COMMIT/ROLLBACK 연결** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH25 · OO ABAP 고급 설계와 패턴 _(난이도: 고급)_

> 규모가 커진다 — OO 설계 패턴으로 다스리고 싶다.

**키워드**: 디자인 패턴, Factory, Singleton, 의존성

**레슨 (5)**
- **CH25-L01 · Factory Pattern** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L02 · Singleton Pattern** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L03 · Strategy Pattern** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L04 · MVC 기반 Report 구조화** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH25-L05 · Testable Class 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH26 · ALV 고급 Event 응용 _(난이도: 고급)_

> ALV에서 사용자 상호작용(이벤트)을 처리하고 싶다.

**키워드**: ALV Event, Double Click, Toolbar, User Command

**레슨 (5)**
- **CH26-L01 · Double Click Event** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L02 · Hotspot Click Event** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L03 · Toolbar Event** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L04 · USER_COMMAND 처리** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH26-L05 · ALV Event Handler Class 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH27 · Editable Grid ALV와 입력 검증 _(난이도: 고급)_

> ALV에서 직접 입력·수정하고 검증하고 싶다.

**키워드**: Editable ALV, Data Changed, 입력검증

**레슨 (6)**
- **CH27-L01 · Editable Field Catalog 설정** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L02 · DATA_CHANGED Event** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L03 · DATA_CHANGED_FINISHED Event** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L04 · Cell Style 기반 입력 제어** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L05 · Grid 입력값 검증과 오류 표시** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH27-L06 · 변경 데이터 DB 반영 전 검증** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH28 · Enhancement / BAdI / User Exit _(난이도: 고급)_

> 표준 기능을 건드리지 않고 확장하고 싶다.

**키워드**: BAdI, Enhancement, User Exit

**레슨 (5)**
- **CH28-L01 · Customer Exit / User Exit 개념** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L02 · Enhancement Point / Section** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L03 · BAdI 정의와 구현** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L04 · Implicit / Explicit Enhancement 판단** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH28-L05 · Clean Core 관점의 확장 기준** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH29 · 인터페이스 실무: BAPI/RFC/BDC/File _(난이도: 고급)_

> 외부 시스템과 데이터를 주고받아야 한다.

**키워드**: BAPI, RFC, BDC, File, Excel

**레슨 (5)**
- **CH29-L01 · BAPI 호출과 Return 처리** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L02 · RFC Function Module 설계** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L03 · BDC / Batch Input 실무 기준** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L04 · Excel Upload 처리** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH29-L05 · File Interface와 재처리** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH30 · IDoc / ALE / Gateway _(난이도: 고급)_

> 표준 메시지(IDoc)·게이트웨이로 시스템을 연계하고 싶다.

**키워드**: IDoc, ALE, Gateway, OData

**레슨 (5)**
- **CH30-L01 · IDoc 기본 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L02 · ALE Distribution Model** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L03 · IDoc 오류 추적과 재처리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L04 · Gateway SEGW 프로젝트 구조** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH30-L05 · OData V2 EntitySet 조회 구현** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH31 · 성능 분석과 튜닝 _(난이도: 고급)_

> 느리다 — 어디가 병목인지 찾아 튜닝하고 싶다.

**키워드**: SAT, ST05, SQL Trace, 성능

**레슨 (5)**
- **CH31-L01 · ST05 SQL Trace** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L02 · SAT Runtime Analysis** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L03 · SQL Monitor / SQLM** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L04 · SELECT in LOOP 제거** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH31-L05 · 대량 데이터 처리와 Package 설계** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH32 · AMDP / ADBC / Pushdown _(난이도: 고급)_

> DB 가까이에서 연산을 밀어넣어 가속하고 싶다.

**키워드**: AMDP, ADBC, Code Pushdown, HANA

**레슨 (5)**
- **CH32-L01 · DB Pushdown 판단 기준** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L02 · AMDP 기본 구조** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L03 · ADBC Native SQL** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L04 · AMDP와 CDS/Open SQL 비교** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH32-L05 · 운영 리스크와 DB 종속성** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH33 · Forms / Output / PDF _(난이도: 중급)_

> 출력 양식(PDF·폼)을 만들어야 한다.

**키워드**: SmartForms, Adobe Form, SAPscript, Output

**레슨 (5)**
- **CH33-L01 · Smart Forms 기본 구조** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L02 · Adobe Forms 기본 구조** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L03 · Output Control 개요** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L04 · PDF 생성과 다운로드** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH33-L05 · 양식 오류 추적과 변경 대응** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH34 · 운영 품질과 배포 관리 (이송 심화) _(난이도: 고급)_

> 개발물을 안전하게 운영으로 배포·관리해야 한다. (CH01-L05 이송요청의 2단 심화)

**키워드**: Transport, Release, Import, CTS, Code Inspector

**레슨 (5)**
- **CH34-L01 · ATC / Code Inspector** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L02 · ABAP Unit과 회귀 방지** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L03 · Transport 관리** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L04 · Background Job 운영** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH34-L05 · Application Log와 오류 추적** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)

### CH35 · RAP + Fiori 실무 Capstone _(난이도: 고급)_

> 배운 걸 모아 RAP+Fiori로 실전 앱을 완성한다.

**키워드**: RAP, Fiori, Capstone, Full-Stack

**레슨 (7)**
- **CH35-L01 · Capstone 업무 시나리오 정의** _(order 1)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L02 · ZI_* Interface View 설계** _(order 2)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L03 · ZC_* Projection View 설계** _(order 3)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L04 · Behavior Definition / Implementation** _(order 4)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L05 · Action / Validation / Determination 구현** _(order 5)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L06 · Service Binding과 Fiori Elements 테스트** _(order 6)_
  - 다룰 내용: (골격 — 본문 작성 예정)
- **CH35-L07 · Authorization / Draft / 운영 고려사항** _(order 7)_
  - 다룰 내용: (골격 — 본문 작성 예정)

---
