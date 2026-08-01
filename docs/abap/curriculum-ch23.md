# CH23 · CDS View Entity 기초 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T16:40:30.511Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH23 · CDS View Entity 기초 _(난이도: 고급)_

> DB 계층에서 모델링하고 재사용하고 싶다.

**키워드**: CDS, View Entity, Association, Annotation

**레슨 (7)**
- **CH23-L01 · CDS View Entity 기본 구조** _(order 1)_
  - 다룰 내용: DB 계층의 현대적 읽기 모델 — define view entity.
  - 키워드: CDS, View Entity, define view entity, DDL, Data Preview, Calculated Element, ZI_Flight
- **CH23-L02 · Interface View와 Consumption View 계층** _(order 2)_
  - 다룰 내용: 재사용 기반 뷰 위에 소비용 뷰를 쌓는다 — nesting(ZI_/ZC_).
  - 키워드: Interface View, Consumption View, ZI_, ZC_, as select from, Nesting
- **CH23-L03 · Association 기초** _(order 3)_
  - 다룰 내용: 뷰끼리 관계를 선언하고 경로로 따라간다 — Association.
  - 키워드: Association, _Perf, $projection, cardinality, CDS
- **CH23-L04 · Annotation과 의미 부여** _(order 4)_
  - 다룰 내용: 뷰·필드에 업무 의미를 단다 — @Annotation.
  - 키워드: Annotation, @EndUserText, @UI.lineItem, @Semantics
- **CH23-L05 · Metadata Extension 기초** _(order 5)_
  - 다룰 내용: UI 주석을 본문에서 분리한다 — annotate entity (DDLX).
  - 키워드: Metadata Extension, annotate entity, @Metadata.allowExtensions, @Metadata.layer
- **CH23-L06 · DCL / Authorization 개요** _(order 6)_
  - 다룰 내용: 누가 어떤 행을 볼 수 있나 — CDS 접근 제어(DCL).
  - 키워드: DCL, Access Control, define role, aspect pfcg_auth
- **CH23-L07 · 실습 — 콘서트 CDS 뷰 (ZI_/ZC_)** _(order 7)_
  - 다룰 내용: 콘서트앱 — 데이터 모델을 재사용 가능한 CDS 계층으로.
  - 키워드: 실습, 콘서트앱, CDS, ZI_Concert, ZC_Concert, Association
