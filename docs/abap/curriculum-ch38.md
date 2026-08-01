# CH38 · 운영 품질과 배포 관리 (이송 심화) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 6
> 🕒 생성: 2026-08-01T17:42:33.211Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH38 · 운영 품질과 배포 관리 (이송 심화) _(난이도: 고급)_

> 코드가 돈다에서 멈추지 않는다 — 자동 검사·회귀 방어·안전한 이송·무인 실행·표준 로그로 운영을 지킨다. (CH01-L06 이송요청의 2단 심화)

**키워드**: ATC, ABAP Unit, Test Double, Transport, Background Job, Application Log

**레슨 (6)**
- **CH38-L01 · ATC / Code Inspector — 자동 품질 게이트** _(order 1)_
  - 다룰 내용: 사람 눈이 놓치는 것을 기계가 잡는다 — 출시 전 자동 검사와 release gate.
  - 키워드: ATC, Code Inspector, SCI, Finding, Exemption
- **CH38-L02 · ABAP Unit 운영 — 회귀를 막는 게이트** _(order 2)_
  - 다룰 내용: 고친 코드가 기존 약속을 깨지 않았는가 — 테스트를 운영 게이트로 쓴다.
  - 키워드: ABAP Unit, 회귀, Regression, Release Gate
- **CH38-L03 · Test Double 심화 — 의존성을 끊는 도구들** _(order 3)_
  - 다룰 내용: DB·CDS·legacy 의존을 어떻게 끊나 — 의존성 모양별 test double 선택.
  - 키워드: Test Double, CL_ABAP_TESTDOUBLE, TEST-SEAM, SQL Test Double
- **CH38-L04 · Transport 관리 — DEV에서 PRD까지** _(order 4)_
  - 다룰 내용: 검증된 변경만, 올바른 순서로 — 이송요청의 2단 심화(release·import·의존).
  - 키워드: Transport, STMS, SE09, Import, Return Code
- **CH38-L05 · Background Job 운영 — 무인 실행** _(order 5)_
  - 다룰 내용: 사람이 없는 시간의 실행 — SUBMIT과 잡 스케줄, 상태와 증거.
  - 키워드: Background Job, SM36, SM37, SUBMIT
- **CH38-L06 · Application Log — 운영 표준 로그** _(order 6)_
  - 다룰 내용: "실패했다"가 아니라 "무엇이 왜"를 남긴다 — BAL 기록과 SLG1 조회.
  - 키워드: Application Log, BAL, SLG1, BAL_DB_SAVE
