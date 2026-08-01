# CH37 · Forms / Output / PDF — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T20:47:11.036Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH37 · Forms / Output / PDF _(난이도: 중급)_

> 출력 양식(PDF·폼)을 만들어야 한다.

**키워드**: Smart Forms, OTF, PDF, Output

**레슨 (5)**
- **CH37-L01 · Smart Forms 기본 구조** _(order 1)_
  - 다룰 내용: 화면 출력이 아니라 "문서"를 만든다 — 전통 양식의 구조와 호출.
  - 키워드: Smart Forms, SMARTFORMS, Form Interface, SSF_FUNCTION_MODULE_NAME
- **CH37-L02 · Smart Forms에서 PDF로 — OTF와 변환** _(order 2)_
  - 다룰 내용: 인쇄 대화상자 대신 출력의 원형(OTF)을 받아 CONVERT_OTF로 PDF 데이터를 만든다.
  - 키워드: OTF, CONVERT_OTF, getotf, SSFCTRLOP
- **CH37-L03 · Output Control 개요** _(order 3)_
  - 다룰 내용: 양식과 출력 결정은 다른 층이다 — 언제·무엇을·누구에게·어떤 채널로.
  - 키워드: Output Control, NAST, BRFplus, Output Management
- **CH37-L04 · PDF 바이트와 다운로드** _(order 4)_
  - 다룰 내용: PDF는 글자가 아니라 바이트다 — xstring으로 받아 BIN으로 저장한다.
  - 키워드: PDF, xstring, xstrlen, GUI_DOWNLOAD
- **CH37-L05 · 양식 오류 추적과 변경 대응** _(order 5)_
  - 다룰 내용: "안 나와요" 티켓을 다섯 단계로 좁힌다 — 그리고 양식도 코드처럼 이송한다.
  - 키워드: 양식 오류, SP01, Spool, 변경 통제
