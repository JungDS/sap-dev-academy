# CH27 · OO ABAP 고급 설계와 패턴 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T20:47:11.028Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH27 · OO ABAP 고급 설계와 패턴 _(난이도: 고급)_

> 규모가 커진다 — OO 설계 패턴으로 다스리고 싶다.

**키워드**: 디자인 패턴, Factory, Singleton, 의존성

**레슨 (5)**
- **CH27-L01 · Factory Pattern** _(order 1)_
  - 다룰 내용: 객체 생성을 한 곳에 모은다 — Factory.
  - 키워드: Factory, Pattern, 생성, OO
- **CH27-L02 · Singleton Pattern** _(order 2)_
  - 다룰 내용: 인스턴스를 단 하나만 — Singleton.
  - 키워드: Singleton, Pattern, 정적, OO
- **CH27-L03 · Strategy Pattern** _(order 3)_
  - 다룰 내용: 알고리즘을 갈아끼운다 — Strategy.
  - 키워드: Strategy, Pattern, Interface, 다형성
- **CH27-L04 · MVC 기반 Report 구조화** _(order 4)_
  - 다룰 내용: 화면·로직·데이터를 분리한다 — MVC.
  - 키워드: MVC, Model, View, Controller, 구조화
- **CH27-L05 · Testable Class 설계와 ABAP Unit** _(order 5)_
  - 다룰 내용: 검증 가능한 설계 — 의존성 분리와 단위 테스트.
  - 키워드: ABAP Unit, Testable, 의존성 주입, Mock
