# CH24 · RAP / ABAP Cloud 입문 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · Modern ABAP과 새 개발 모델** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 9
> 🕒 생성: 2026-08-01T21:23:19.702Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH24 · RAP / ABAP Cloud 입문 _(난이도: 고급)_

> 현대 SAP 표준 — 트랜잭션 앱을 RAP로 짓고 싶다.

**키워드**: RAP, Behavior Definition, ABAP Cloud, Fiori

**레슨 (9)**
- **CH24-L01 · RAP 아키텍처 개요** _(order 1)_
  - 다룰 내용: 현대 SAP 트랜잭션 앱의 표준 — RAP의 큰 그림.
  - 키워드: RAP, ABAP Cloud, managed, unmanaged, OData
- **CH24-L02 · Interface View ZI_* 설계 (Root)** _(order 2)_
  - 다룰 내용: RAP의 토대 — 트랜잭션 단위를 정하는 root Interface View.
  - 키워드: Interface View, root entity, define root view entity, RAP
- **CH24-L03 · Projection View ZC_* 설계** _(order 3)_
  - 다룰 내용: 서비스·화면에 노출할 소비용 뷰 — transactional projection.
  - 키워드: Projection View, ZC_, provider contract, transactional_query
- **CH24-L04 · Behavior Definition 기초** _(order 4)_
  - 다룰 내용: 무엇을 할 수 있나 — create·update·delete를 선언한다.
  - 키워드: Behavior Definition, BDEF, managed, create/update/delete, lock master
- **CH24-L05 · Behavior Implementation 기초** _(order 5)_
  - 다룰 내용: 동작의 실제 코드 — Behavior Pool과 집합 지향 handler.
  - 키워드: Behavior Implementation, BIMP, behavior pool, FOR VALIDATE ON SAVE, keys
- **CH24-L06 · Service Definition / Service Binding** _(order 6)_
  - 다룰 내용: 앱을 OData 서비스로 노출한다 — Definition + Binding.
  - 키워드: Service Definition, Service Binding, OData, expose, Fiori
- **CH24-L07 · Validation / Determination / Action 개요** _(order 7)_
  - 다룰 내용: 검증·자동결정·액션 — RAP의 비즈니스 로직 셋.
  - 키워드: Validation, Determination, Action, RAP
- **CH24-L08 · ABAP Cloud와 Released API 원칙** _(order 8)_
  - 다룰 내용: 클라우드 준비된 개발 — Released API·restricted scope·Clean Core.
  - 키워드: ABAP Cloud, Released API, Clean Core, ABAP for Cloud Development
- **CH24-L09 · 실습 — 예매 RAP 동작 구현** _(order 9)_
  - 다룰 내용: 콘서트 예매 RAP — 정원 validation·취소 action·상태 determination.
  - 키워드: 실습, 콘서트앱, RAP, Validation, Determination, Action
