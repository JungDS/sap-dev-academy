# CH10 · SALV 1차 (간단 ALV) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-06-22T07:11:31.767Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH10 · SALV 1차 (간단 ALV) _(난이도: 초급)_

> WRITE 리스트는 투박하다 — 표 형태로 깔끔하게 보고 싶다.

**키워드**: SALV, CL_SALV_TABLE, ALV

**레슨 (5)**
- **CH10-L01 · SALV의 목적과 CL_SALV_TABLE 개요** _(order 1)_
  - 다룰 내용: WRITE 리스트를 넘어 — 표 형태 출력 SALV(CL_SALV_TABLE).
  - 키워드: SALV, ALV, CL_SALV_TABLE
- **CH10-L02 · FACTORY 메서드로 Internal Table 출력** _(order 2)_ · T-code: `SE38`(복습)
  - 다룰 내용: factory 한 번으로 내부 테이블을 SALV 객체로 만들고, display로 띄우는 두 단계를 직접 체험한다.
  - 학습 목표: cl_salv_table=>factory( )로 내부 테이블을 ALV 객체로 만들고, factory(객체 생성)와 display(화면 표시)가 별개의 단계임을 직접 확인한다.
  - 키워드: SALV, factory, CL_SALV_TABLE, Internal Table, ALV
- **CH10-L03 · 기본 Function 표시와 Display 실행** _(order 3)_
  - 다룰 내용: 표준 툴바를 켜고 display로 화면에 띄운다.
  - 키워드: SALV, get_functions, set_all, display
- **CH10-L04 · Internal Table → SALV 미니 리포트** _(order 4)_
  - 다룰 내용: SELECT → SALV까지 한 프로그램으로 — 첫 표 리포트 완성.
  - 키워드: SALV, Open SQL, Internal Table, 미니 리포트
- **CH10-L05 · SALV 1차 범위와 심화 항목 분리** _(order 5)_
  - 다룰 내용: 지금 다루는 SALV의 범위와, 뒤로 미루는 심화의 경계.
  - 키워드: SALV, 범위, Grid ALV, 심화
