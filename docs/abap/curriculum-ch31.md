# CH31 · Editable Grid ALV와 입력 검증 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 6
> 🕒 생성: 2026-08-01T20:47:11.031Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH31 · Editable Grid ALV와 입력 검증 _(난이도: 고급)_

> ALV에서 직접 입력·수정하고 검증하고 싶다.

**키워드**: Editable ALV, Data Changed, 입력검증

**레슨 (6)**
- **CH31-L01 · Editable Field Catalog 설정** _(order 1)_
  - 다룰 내용: ALV에서 직접 입력받게 — 편집 가능 컬럼 설정.
  - 키워드: edit, Field Catalog, Editable ALV
- **CH31-L02 · DATA_CHANGED Event** _(order 2)_
  - 다룰 내용: 셀이 바뀌는 순간 검증한다 — DATA_CHANGED.
  - 키워드: data_changed, CL_ALV_CHANGED_DATA_PROTOCOL, 검증
- **CH31-L03 · DATA_CHANGED_FINISHED Event** _(order 3)_
  - 다룰 내용: 변경이 모두 반영된 뒤 — 합계·연동 갱신.
  - 키워드: data_changed_finished, 재계산, 연동
- **CH31-L04 · Cell Style 기반 입력 제어** _(order 4)_
  - 다룰 내용: 셀마다 편집 가능/불가를 동적으로 — Cell Style.
  - 키워드: Cell Style, LVC_T_STYL, 입력 제어
- **CH31-L05 · Grid 입력값 검증과 오류 표시** _(order 5)_
  - 다룰 내용: 잘못된 입력을 셀에 빨갛게 표시한다.
  - 키워드: 검증, 오류 표시, add_protocol_entry
- **CH31-L06 · 변경 데이터 DB 반영 전 검증** _(order 6)_
  - 다룰 내용: 저장 직전 최종 점검 후 DML로 반영한다.
  - 키워드: 저장 검증, check_changed_data, DML
