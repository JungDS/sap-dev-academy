# CH34 · IDoc / ALE / Gateway — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T21:23:19.709Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH34 · IDoc / ALE / Gateway _(난이도: 고급)_

> 표준 메시지(IDoc)·게이트웨이로 시스템을 연계하고 싶다.

**키워드**: IDoc, ALE, Gateway, OData

**레슨 (5)**
- **CH34-L01 · IDoc 기본 구조** _(order 1)_
  - 다룰 내용: 표준 메시지 봉투 — Control(송장)·Data(내용물)·Status(배송 이력) 3층을 읽는다.
  - 키워드: IDoc, Control Record, Segment, Status, WE02
- **CH34-L02 · ALE Distribution Model** _(order 2)_
  - 다룰 내용: 배송망 설계 — 주소록·배포 규칙·계약서·통로가 다 맞아야 흐른다.
  - 키워드: ALE, Distribution Model, Partner Profile, Port, BD64
- **CH34-L03 · IDoc 오류 추적과 재처리** _(order 3)_
  - 다룰 내용: 상태는 결과다 — 원인을 고친 뒤에만 재처리가 성공한다.
  - 키워드: IDoc, Status, BD87, 재처리, 상태코드
- **CH34-L04 · Gateway SEGW 프로젝트 구조** _(order 4)_
  - 다룰 내용: URL 하나가 열리기까지 — 메뉴판·주방·창구 등록·시식·불만 접수의 연결.
  - 키워드: Gateway, SEGW, OData, EntityType, DPC_EXT
- **CH34-L05 · OData V2 EntitySet 조회 구현** _(order 5)_
  - 다룰 내용: URL 쿼리를 SELECT로 번역한다 — $filter·$top·$skip과 OFFSET 페이징.
  - 키워드: OData, GET_ENTITYSET, $filter, 페이징, OFFSET
