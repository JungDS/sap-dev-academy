# CH39 · RAP + Fiori 실무 Capstone (RAP 심화) — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 9
> 🕒 생성: 2026-08-01T16:40:30.523Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH39 · RAP + Fiori 실무 Capstone (RAP 심화) _(난이도: 고급)_

> 배운 전부를 하나의 운영 가능한 앱으로 — 예매 RAP BO에 Draft·Lock·ETag·권한·EML·통신 설정까지 얹어 완성한다.

**키워드**: RAP, Draft, ETag, EML, Fiori Elements, Communication Arrangement

**레슨 (9)**
- **CH39-L01 · Capstone 업무 시나리오 정의** _(order 1)_
  - 다룰 내용: 마지막 장은 축하가 아니라 조립이다 — 요구를 계층 책임으로 번역한다.
  - 키워드: Capstone, 시나리오, RAP, 계층 책임
- **CH39-L02 · ZI_* Interface View 심화 — 관계와 변경 추적** _(order 2)_
  - 다룰 내용: CH24의 뼈대에 운영급 재료를 — association 노출·ETag 후보 필드·composition 지도.
  - 키워드: Interface View, Association, Composition, 변경 추적 필드
- **CH39-L03 · ZC_* Projection View와 UI Annotation 심화** _(order 3)_
  - 다룰 내용: 소비자 계약을 의도적으로 — provider contract·@UI 배치·Metadata Extension.
  - 키워드: Projection View, provider contract, @UI, Metadata Extension
- **CH39-L04 · BDEF 심화 — Draft·Lock·ETag·권한 계약** _(order 4)_
  - 다룰 내용: CH24의 계약에 운영 조항을 얹는다 — with draft·lock master·total etag·authorization master.
  - 키워드: BDEF, Draft, lock master, total etag, authorization master
- **CH39-L05 · Action / Validation / Determination 구현 완성** _(order 5)_
  - 다룰 내용: 계약이 약속한 판단을 채운다 — 다건 안전·failed/reported·action result.
  - 키워드: Validation, Determination, Action, failed/reported
- **CH39-L06 · 외부 EML Consumer — MODIFY에서 COMMIT까지** _(order 6)_
  - 다룰 내용: 화면 밖에서 RAP BO를 다룬다 — buffer·save sequence·FAILED/REPORTED 실전.
  - 키워드: EML, MODIFY ENTITIES, COMMIT ENTITIES, ROLLBACK ENTITIES
- **CH39-L07 · Service Binding과 Fiori Elements Preview** _(order 7)_
  - 다룰 내용: 계약이 화면이 되는 순간 — OData V4 노출과 Preview 검증 체크리스트.
  - 키워드: Service Definition, Service Binding, Fiori Elements, OData V4
- **CH39-L08 · Draft · Lock · ETag · Authorization 심화** _(order 8)_
  - 다룰 내용: 여럿이 같은 데이터를 만질 때 — 네 장치의 역할 분담과 충돌 시나리오.
  - 키워드: Draft, Lock, ETag, Authorization
- **CH39-L09 · Communication Arrangement와 운영 마감** _(order 9)_
  - 다룰 내용: 화면 너머의 소비자 — 통신 설정·release contract·최종 릴리스 보드.
  - 키워드: Communication Arrangement, Release Contract, Released API, Clean Core
