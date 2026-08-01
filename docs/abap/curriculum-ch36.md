# CH36 · AMDP / ADBC / Pushdown — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 6
> 🕒 생성: 2026-08-01T16:40:30.521Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH36 · AMDP / ADBC / Pushdown _(난이도: 고급)_

> DB 가까이에서 연산을 밀어넣어 가속하고 싶다.

**키워드**: AMDP, ADBC, Code Pushdown, HANA

**레슨 (6)**
- **CH36-L01 · Code Pushdown과 수단 선택** _(order 1)_
  - 다룰 내용: 무엇을 내릴지는 배웠다 — 이제 무엇으로 내릴지 고른다.
  - 키워드: Code Pushdown, Code-to-Data, HANA, 수단 선택
- **CH36-L02 · AMDP 기본 구조** _(order 2)_
  - 다룰 내용: ABAP 클래스 메서드 안에 DB 프로시저를 담는다 — 만들고, 부르고, 체이닝한다.
  - 키워드: AMDP, SQLScript, BY DATABASE PROCEDURE, IF_AMDP_MARKER_HDB
- **CH36-L03 · ADBC Native SQL** _(order 3)_
  - 다룰 내용: DB 고유 SQL을 문자열로 직접 실행한다 — 보호막 없이.
  - 키워드: ADBC, Native SQL, CL_SQL_STATEMENT, SQL injection
- **CH36-L04 · 푸시다운 수단 비교와 선택** _(order 4)_
  - 다룰 내용: 속도 순위가 아니라 책임 순위로 고른다.
  - 키워드: Open SQL, CDS, AMDP, ADBC, 선택 기준
- **CH36-L05 · CDS Table Function과 AMDP Function** _(order 5)_
  - 다룰 내용: AMDP 함수의 결과를 CDS 뷰처럼 읽는 다리를 잇는다.
  - 키워드: CDS Table Function, BY DATABASE FUNCTION, FOR TABLE FUNCTION, AMDP
- **CH36-L06 · 운영 리스크와 DB 종속성** _(order 6)_
  - 다룰 내용: 강한 수단을 운영에 들이는 조건 — 책임의 목록을 만든다.
  - 키워드: DB 종속성, SQL injection, client, Clean Core, 운영 리스크
