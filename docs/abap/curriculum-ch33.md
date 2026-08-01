# CH33 · 인터페이스 실무: BAPI/RFC/BDC/File — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-02 · ABAP 실무** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T15:40:09.603Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH33 · 인터페이스 실무: BAPI/RFC/BDC/File _(난이도: 고급)_

> 외부 시스템과 데이터를 주고받아야 한다.

**키워드**: BAPI, RFC, BDC, File, Excel

**레슨 (5)**
- **CH33-L01 · BAPI 호출과 Return 처리** _(order 1)_
  - 다룰 내용: 호출 성공이 아니라 Return 판정이 저장을 결정한다.
  - 키워드: BAPI, BAPIRET2, COMMIT, ROLLBACK, 경고 정책
- **CH33-L02 · RFC Function Module 설계** _(order 2)_
  - 다룰 내용: 원격 호출은 함수 로직이 아니라 연결·계약·예외·로그를 설계하는 일이다.
  - 키워드: RFC, Remote-Enabled, SM59, DESTINATION, communication_failure
- **CH33-L03 · BDC / Batch Input 실무 기준** _(order 3)_
  - 다룰 내용: 화면 입력을 흉내 내는 최후 수단 — 녹화·모드·메시지·재처리까지.
  - 키워드: BDC, Batch Input, CALL TRANSACTION, BDCDATA, SM35
- **CH33-L04 · Excel Upload 처리** _(order 4)_
  - 다룰 내용: 파일 읽기가 아니라 검증 관문을 만든다 — 파싱·행 검증·오류 피드백.
  - 키워드: Excel, Upload, GUI_UPLOAD, SPLIT, 검증
- **CH33-L05 · File Interface와 재처리** _(order 5)_
  - 다룰 내용: 서버 파일 입출력과 운영 구조 — 로그·재처리·멱등성까지가 인터페이스다.
  - 키워드: File Interface, OPEN DATASET, 재처리, 멱등성, 서버 파일
