# CH08 · Open SQL 기본 조회 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T20:47:11.015Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH08 · Open SQL 기본 조회 _(난이도: 초급)_

> 저장한 데이터를 다시 읽어오고 싶다. (classic 구문)

**키워드**: Open SQL, SELECT, INTO TABLE, WHERE, SELECT SINGLE, classic

**레슨 (7)**
- **CH08-L01 · SAP 데모 테이블과 Client 종속** _(order 1)_
  - 다룰 내용: 풍부한 연습 데이터 — SCARR·SPFLI·SFLIGHT와 Open SQL의 client 자동 종속.
  - 키워드: SCARR, SPFLI, SFLIGHT, Open SQL, MANDT, Client
- **CH08-L02 · SELECT 4요소 · `*` vs 필드** _(order 2)_ · T-code: `SE38`
  - 다룰 내용: SELECT의 네 가지 — 어느 테이블·어느 필드·어느 행·어디에 담을지.
  - 키워드: SELECT, INTO TABLE, projection, sy-subrc, classic
- **CH08-L03 · SELECT 형태 — SINGLE · INTO TABLE · UP TO n ROWS** _(order 3)_
  - 다룰 내용: 한 건만, 여러 건, 줄여 읽기 — 결과 형태에 맞는 SELECT.
  - 키워드: SELECT SINGLE, INTO TABLE, ENDSELECT, UP TO n ROWS, classic
- **CH08-L04 · INTO 대상 형태** _(order 4)_
  - 다룰 내용: 결과를 어디에 담나 — Work Area·개별 변수·CORRESPONDING·APPENDING.
  - 키워드: INTO, CORRESPONDING FIELDS, APPENDING, Work Area
- **CH08-L05 · WHERE 상세 — 연산자와 wildcard** _(order 5)_
  - 다룰 내용: 조건을 정교하게 — 비교·BETWEEN·LIKE·IN·IS NULL.
  - 키워드: WHERE, BETWEEN, LIKE, IN, IS NULL, classic
- **CH08-L06 · 키 필드 vs 일반 필드 · Index 기초** _(order 6)_
  - 다룰 내용: 무엇으로 찾느냐가 속도를 가른다 — 키와 인덱스.
  - 키워드: Primary Key, Secondary Index, 성능, SELECT
- **CH08-L07 · 조회 실패와 MESSAGE (기초)** _(order 7)_
  - 다룰 내용: 결과가 없을 때 — sy-subrc 분기와 MESSAGE 맛보기.
  - 키워드: sy-subrc, MESSAGE, 조회 실패
