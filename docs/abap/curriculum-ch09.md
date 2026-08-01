# CH09 · DDIC 관계와 입력도움말(F4) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 9
> 🕒 생성: 2026-08-01T20:47:11.016Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH09 · DDIC 관계와 입력도움말(F4) _(난이도: 초급)_

> 아무 값이나 입력된다 — 올바른 값만 받도록 관계·검색도움말이 필요하다.

**키워드**: Foreign Key, Check Table, Search Help, F4

**레슨 (9)**
- **CH09-L01 · Foreign Key와 Check Table** _(order 1)_
  - 다룰 내용: 아무 값이나 막는다 — Foreign Key로 입력을 다른 테이블 값으로 제한.
  - 키워드: Foreign Key, Check Table, DDIC, 입력검증
- **CH09-L02 · Value Table과 Foreign Key의 차이** _(order 2)_
  - 다룰 내용: Domain의 Value Table은 '제안', Foreign Key는 '실제 관계'.
  - 키워드: Value Table, Foreign Key, Domain, Check Table, 변환루틴
- **CH09-L03 · Text Table — 코드 옆 이름표** _(order 3)_
  - 다룰 내용: 코드만 든 마스터에 사람이 읽을 이름을 — 언어별 Text Table.
  - 키워드: Text Table, SPRAS, Foreign Key, 언어
- **CH09-L04 · Elementary Search Help** _(order 4)_
  - 다룰 내용: F4 목록을 설계한다 — 단일 소스 Elementary Search Help.
  - 키워드: Search Help, Elementary, F4, SE11
- **CH09-L05 · Collective Search Help 기초** _(order 5)_
  - 다룰 내용: 여러 Elementary를 묶어 탭으로 — Collective Search Help.
  - 키워드: Collective Search Help, Elementary, F4
- **CH09-L06 · PARAMETERS와 DDIC F4 Help 연결** _(order 6)_
  - 다룰 내용: DDIC의 검증·F4가 PARAMETERS 화면으로 자동 연결되는 원리.
  - 키워드: PARAMETERS, F4, Search Help, Data Element
- **CH09-L07 · Input Help 호출 우선순위** _(order 7)_
  - 다룰 내용: F4를 누르면 어떤 도움말이 뜨나 — 위에서부터 정해지는 순서.
  - 키워드: Input Help, F4, Search Help, 우선순위, Fixed Values
- **CH09-L08 · DDIC 검증과 프로그램 검증의 역할 분리** _(order 8)_
  - 다룰 내용: 선언적 DDIC 검증과 코드 검증의 경계 — 무엇을 어디서.
  - 키워드: 입력검증, DDIC, 비즈니스 로직, 역할 분리
- **CH09-L09 · 실습 — 콘서트 모델 만들기 (DDIC)** _(order 9)_
  - 다룰 내용: 우리 앱의 토대 — ZCONCERT·ZPERF·ZBOOKING과 FK·F4를 직접 만든다.
  - 키워드: 실습, 콘서트앱, ZCONCERT, ZBOOKING, Foreign Key
