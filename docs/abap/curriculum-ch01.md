# CH01 · 개발 환경과 첫 프로그램 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-01 · ABAP 기초 — Classic 완결** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 7
> 🕒 생성: 2026-08-01T21:23:19.686Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH01 · 개발 환경과 첫 프로그램 _(난이도: 입문)_

> 대망의 첫 번째 챕터다. 여기서는 ABAP 프로그램을 간단히 만들어 보고 실행하며, 프로그램이 어디에 보관되는지 배운다.

**학습 목표**
- SAPGUI로 시스템에 로그온하고 기본 화면 구성을 익힌다.
- T-code와 SE38(ABAP Editor)로 첫 프로그램을 생성·실행한다.
- 프로그램 기본 구조와 주석을 이해한다.
- WRITE로 문자열을 화면에 출력한다.
- WRITE의 폭·정렬·색·구분선으로 출력을 보기 좋게 다듬는다.
- 프로그램을 $TMP(Local)에 저장한 뒤, 개발 패키지와 이송요청의 필요를 이해한다.

**키워드**: SAPGUI, 로그온, T-code, SE38, REPORT, WRITE, 출력서식, 주석, $TMP, 개발 패키지, 이송요청

**레슨 (7)**
- **CH01-L01 · SAPGUI 로그온과 화면 구성** _(order 1)_
  - 다룰 내용: SAP 시스템에 접속해 개발을 시작할 환경을 연다.
  - 키워드: SAPGUI, 로그온, SAP Easy Access
- **CH01-L02 · T-code와 SE38 첫 실행** _(order 2)_ · T-code: `SE38,SE11,SE80`(신규)
  - 다룰 내용: 명령창과 SE38(ABAP Editor)로 첫 프로그램을 만들고 $TMP(Local Object)에 저장한다.
  - 키워드: T-code, SE38, ABAP Editor, $TMP, Local Object
- **CH01-L03 · 프로그램 구조와 주석** _(order 3)_
  - 다룰 내용: 프로그램의 기본 뼈대와, 코드에 설명을 남기는 법을 익힌다.
  - 키워드: REPORT, 주석, 문장 종결
- **CH01-L04 · WRITE로 문자열 출력** _(order 4)_ · T-code: `SE38`(복습)
  - 다룰 내용: WRITE로 화면에 첫 글자를 찍고, 줄바꿈·체인·리터럴을 직접 실행해 구분한다.
  - 학습 목표: WRITE로 화면에 출력하고, /(줄바꿈)·콜론(:) 체인·문자 리터럴의 동작을 직접 실행해 구분한다.
  - 키워드: WRITE, 리터럴, 출력, 줄바꿈, REPORT
- **CH01-L05 · WRITE 심화 — 정렬·폭·색·구분선** _(order 5)_ · T-code: `SE38`(복습)
  - 다룰 내용: 폭과 정렬로 칸을 맞추고, 색·구분선으로 강조해 출력을 보기 좋게 만든다.
  - 학습 목표: WRITE의 폭·정렬·색·강조·구분선 옵션으로 리스트 출력을 보기 좋게 다듬는다(classic 리스트 서식).
  - 키워드: WRITE, 정렬, COLOR, ULINE, SKIP, 출력서식
- **CH01-L06 · 개발 패키지와 이송요청 입문** _(order 6)_ · T-code: `SE80,SE21,SE09,SE10,STMS`
  - 다룰 내용: $TMP의 한계를 넘어, 개발 객체를 패키지에 보관하고 이송요청으로 관리하는 첫걸음.
  - 키워드: 개발 패키지, $TMP, 이송요청, Transport Organizer, SE09, SE10, SE80, SE21, STMS, Repository Object
- **CH01-L07 · T-code 생성 기초 (SE93)** _(order 7)_ · T-code: `SE93`(신규)
  - 다룰 내용: SE93으로 내 프로그램을 짧은 코드 하나로 실행되게 만든다.
  - 키워드: SE93, T-code, 트랜잭션 코드, 실행형
