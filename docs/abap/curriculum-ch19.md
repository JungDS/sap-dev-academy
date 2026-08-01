# CH19 · New Open SQL / Modern ABAP SQL — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 8
> 🕒 생성: 2026-08-01T15:40:09.593Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH19 · New Open SQL / Modern ABAP SQL _(난이도: 중급)_

> 고전 Open SQL이 투박하다 — @·인라인으로 현대화. ★ 여기부터 modern SQL.

**키워드**: @, @DATA, 콤마 필드리스트, host 변수 escape

**레슨 (8)**
- **CH19-L01 · Classic Open SQL과 Modern ABAP SQL 비교** _(order 1)_
  - 다룰 내용: 같은 조회를 classic과 modern으로 — 무엇이, 왜 달라졌나.
  - 키워드: Open SQL, ABAP SQL, modern, 콤마, @, strict
- **CH19-L02 · @ Host Variable과 Host Expression** _(order 2)_
  - 다룰 내용: ABAP 값을 SQL에 안전하게 넣는다 — @변수와 @( 식 ).
  - 키워드: @, Host Variable, Host Expression, lossless
- **CH19-L03 · INTO TABLE @DATA(...) Inline Target** _(order 3)_
  - 다룰 내용: 결과 테이블을 SELECT 자리에서 바로 선언한다.
  - 키워드: @DATA, inline, INTO TABLE, AS alias, empty key
- **CH19-L04 · SQL Expression — CASE / CAST / COALESCE** _(order 4)_
  - 다룰 내용: SELECT 안에서 값을 계산·변환·치환한다 — DB가 직접.
  - 키워드: SQL Expression, CASE, CAST, COALESCE, AS alias
- **CH19-L05 · SQL String / Date Function** _(order 5)_
  - 다룰 내용: SELECT 안에서 문자열·날짜를 다루는 SQL 함수 — 단, ABAP 함수와 헷갈리지 않기.
  - 키워드: SQL Function, CONCAT, SUBSTRING, UPPER, DATS_ADD_DAYS
- **CH19-L06 · SELECT FROM @itab 기초** _(order 6)_
  - 다룰 내용: 내부 테이블을 SQL 소스처럼 조회한다 — DB 왕복 없이.
  - 키워드: SELECT FROM @itab, Internal Table, SQL, GROUP BY
- **CH19-L07 · ABAP SQL 정리 — 다음 단계로** _(order 7)_
  - 다룰 내용: 모던 ABAP SQL을 "언제 무엇을 쓸지"로 정리하고, 코드 구조의 OO로 넘어간다.
  - 키워드: ABAP SQL, 정리, 의사결정, CDS, OO
- **CH19-L08 · 실습 — 콘서트앱 모던 SQL** _(order 8)_
  - 다룰 내용: 콘서트앱 — 조회를 @·콤마·@DATA로 현대화하되, 업무 결과를 검증한다.
  - 키워드: 실습, 콘서트앱, 모던SQL, @DATA, COALESCE, LEFT OUTER JOIN
