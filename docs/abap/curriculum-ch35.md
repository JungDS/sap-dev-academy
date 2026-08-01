# CH35 · 성능 분석과 튜닝 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T15:40:09.604Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH35 · 성능 분석과 튜닝 _(난이도: 고급)_

> 느리다 — 어디가 병목인지 찾아 튜닝하고 싶다.

**키워드**: SAT, ST05, SQL Trace, 성능

**레슨 (5)**
- **CH35-L01 · ST05 SQL Trace** _(order 1)_
  - 다룰 내용: 감이 아니라 측정 — 한 실행의 DB 대화를 기록해 병목을 분류한다.
  - 키워드: ST05, SQL Trace, 측정, 병목, 재측정
- **CH35-L02 · SAT Runtime Analysis** _(order 2)_
  - 다룰 내용: 전신 촬영 — 시간이 ABAP·DB·외부 중 어디서 새는지 가른다.
  - 키워드: SAT, Runtime Analysis, Hit List, 프로파일링
- **CH35-L03 · SQL Monitor / SQLM** _(order 3)_
  - 다룰 내용: 건강검진 통계 — 운영 전체에서 무엇부터 고칠지 우선순위를 정한다.
  - 키워드: SQLM, SQL Monitor, SWLT, 우선순위, 인덱스
- **CH35-L04 · SELECT in LOOP 제거** _(order 4)_
  - 다룰 내용: 1+N 왕복 폭발을 잡는다 — 키 모으기·한 번에 읽기·메모리에서 찾기.
  - 키워드: SELECT in LOOP, FOR ALL ENTRIES, JOIN, BINARY SEARCH
- **CH35-L05 · 대량 데이터 처리와 Package 설계** _(order 5)_
  - 다룰 내용: 수백만 건은 속도가 아니라 설계 — 푸시다운·패키지·재시작·병렬 기준.
  - 키워드: 대량처리, Package, Code Pushdown, 병렬, 재시작
