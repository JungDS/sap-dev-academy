# CH03 · DDIC Domain·Data Element + PARAMETERS — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 3
> 🕒 생성: 2026-06-22T07:11:31.762Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH03 · DDIC Domain·Data Element + PARAMETERS _(난이도: 입문)_

> 프로그램마다 같은 타입을 또 정의… 전역으로 공유하고 싶다.

**키워드**: Domain, Data Element, DDIC, PARAMETERS, F4

**레슨 (3)**
- **CH03-L01 · Domain(얕게)** _(order 1)_ · T-code: `SE11`(신규)
  - 다룰 내용: 전역으로 — 타입의 기술 속성(타입·길이·대소문자·허용값)을 Domain에 한 번 정의하고, 저장 → 검사 → 활성화 흐름을 직접 체험한다.
  - 학습 목표: Domain의 속성(데이터 타입·길이·출력길이·소수·대소문자·허용값)을 이해하고, DDIC 객체는 활성화해야 런타임에 쓸 수 있음을 직접 체험한다.
  - 키워드: Domain, DDIC, SE11, 데이터타입, 값 테이블, 고정값, 활성화
- **CH03-L02 · Data Element(얕게)** _(order 2)_
  - 다룰 내용: Domain에 의미와 라벨을 입혀, 필드가 참조할 단위를 만든다.
  - 키워드: Data Element, Domain, 라벨, DDIC
- **CH03-L03 · PARAMETERS로 보상(F4·라벨)** _(order 3)_
  - 다룰 내용: DDIC의 수고가 화면에서 보상받는다 — PARAMETERS의 라벨·F4.
  - 키워드: PARAMETERS, F4, Data Element, Selection Screen
