# CH12 · SELECT-OPTIONS와 Range Table — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T18:57:10.063Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH12 · SELECT-OPTIONS와 Range Table _(난이도: 중급)_

> 단일 값(PARAMETERS)만으론 부족 — 범위·다중 조건으로 조회하고 싶다.

**키워드**: SELECT-OPTIONS, Range Table, SIGN, OPTION

**레슨 (7)**
- **CH12-L01 · Range Table 구조** _(order 1)_
  - 다룰 내용: 범위·다중 조건을 담는 그릇 — Range Table의 4컬럼(SIGN/OPTION/LOW/HIGH).
  - 키워드: Range Table, SIGN, OPTION, LOW, HIGH, CP
- **CH12-L02 · SELECT-OPTIONS 기본 문법** _(order 2)_
  - 다룰 내용: 화면 입력칸과 Range Table을 한 번에 만드는 SELECT-OPTIONS.
  - 키워드: SELECT-OPTIONS, Range Table, Selection Screen, TABLES, FOR
- **CH12-L03 · WHERE … IN (classic range)** _(order 3)_
  - 다룰 내용: Range Table을 조회 조건으로 — classic WHERE … IN과 sy-subrc·sy-dbcnt.
  - 키워드: WHERE, IN, Range Table, Open SQL, classic, sy-subrc, sy-dbcnt
- **CH12-L04 · Multiple Selection과 Include/Exclude** _(order 4)_
  - 다룰 내용: 다중 선택 팝업 — 여러 값·범위와 포함(I)/제외(E)가 결과를 정하는 법.
  - 키워드: Multiple Selection, Include, Exclude, SIGN
- **CH12-L05 · EQ / BT / CP 옵션 이해** _(order 5)_
  - 다룰 내용: 비교 방식 OPTION — EQ(같음)·BT(범위)·CP(패턴)를 SIGN과 함께 읽기.
  - 키워드: OPTION, EQ, BT, CP, SIGN, wildcard
- **CH12-L06 · Selection Table 직접 조작 기초** _(order 6)_
  - 다룰 내용: 화면 없이 코드로 Range Table 채우기 — TYPE RANGE OF·CLEAR·APPEND.
  - 키워드: Range Table, TYPE RANGE OF, APPEND, CLEAR, RANGES
- **CH12-L07 · 실습 — 공연·상태로 예매 필터** _(order 7)_
  - 다룰 내용: 콘서트앱 — SELECT-OPTIONS로 필요한 예매만 골라 SALV로.
  - 키워드: 실습, 콘서트앱, SELECT-OPTIONS, 필터, WHERE IN
