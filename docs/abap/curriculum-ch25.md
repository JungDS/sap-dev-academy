# CH25 · 실무 데이터 변경과 트랜잭션 제어 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T16:40:30.513Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH25 · 실무 데이터 변경과 트랜잭션 제어 _(난이도: 중급)_

> 실제로 데이터를 바꾸고 커밋·롤백을 제어해야 한다.

**키워드**: INSERT, UPDATE, MODIFY, COMMIT WORK, LUW

**레슨 (5)**
- **CH25-L01 · INSERT / UPDATE / MODIFY / DELETE 실무 기준** _(order 1)_
  - 다룰 내용: 직접 DB를 바꾼다 — 네 가지 DML과 감사필드.
  - 키워드: INSERT, UPDATE, MODIFY, DELETE, 감사필드
- **CH25-L02 · COMMIT WORK / ROLLBACK WORK** _(order 2)_
  - 다룰 내용: 변경을 확정하거나 되돌린다 — 트랜잭션 제어.
  - 키워드: COMMIT WORK, ROLLBACK WORK, 트랜잭션
- **CH25-L03 · DB LUW와 SAP LUW 차이** _(order 3)_
  - 다룰 내용: 트랜잭션의 두 단위 — DB LUW와 SAP LUW.
  - 키워드: LUW, SAP LUW, Update Module, CALL FUNCTION IN UPDATE TASK
- **CH25-L04 · 오류 로그와 재처리 구조** _(order 4)_
  - 다룰 내용: 변경이 실패했을 때 — 기록하고 다시 처리한다.
  - 키워드: 오류 로그, 재처리, BAL, sy-subrc
- **CH25-L05 · 대량 변경 시 Package 처리** _(order 5)_
  - 다룰 내용: 수십만 건을 나눠서 — 패키지 단위 COMMIT.
  - 키워드: Package, 대량처리, COMMIT, 메모리
