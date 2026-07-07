# 04. CONVENTIONS — 규칙 단일 홈 · 이름 풀 · 입문자 작성법

> 📅 최종수정: 2026-07-07 16:01 KST
> 🎯 **이 문서가 규칙(R)의 단일 출처.** 01·05·06 등은 여기 ID를 참조한다(재진술 금지).
> 🧭 **공통 원칙: 규칙은 형식을 강제하지 않는다 — 정직한 적합성이 우선.** 불편·시각요소·예고를 "칸을 채우려고" 인위적으로 만들지 말 것(맞는 곳에 맞는 것만).
> 📖 파일을 쓰기/고치기 직전. 중요도 순(필수→높음→중), 안정 ID `Rn`(추가만·번호 재사용 금지) — R15·R16은 중요도상 높음/중에 배치(번호 비순차는 안정 ID 유지).

## 🚨 규칙 (R = Rule, 위반 금지)

### 필수
**R1 · 빌드 락** — 빌드 생성물 `docs/abap/**`(HTML/JSON)는 원칙적으로 소스에서 고친다(다음 빌드에 덮어쓰임). 내용은 `content/abap/**.md` → `npm run build:abap`. **예외(디버그·실험·긴급): 생성물을 직접 고쳐도 되나 같은 변경을 반드시 소스(.md 또는 빌드 스크립트)에 backport**해 재현되게. ※ `sample/`·`assets/`는 손작성 파일=생성물 아님 → 자유 편집([03](03_ARCHITECTURE.md)).

**R2 · 코드 = 체험 필수** — 본문에 코드가 1줄이라도 나오면 그 페이지에서 직접 해보는 체험/시뮬레이션을 붙인다(구현은 R5의 `::embed::`). 정적 코드만 나열하면 미완.

**R3 · 입문자 작성법 ★** — 학습 대상 = 개발·전공 경험 없는 20대 전후 입문자(학습자용 콘텐츠 한정 — `.project-docs`·빌드 스크립트엔 비적용).
- 친근한 톤 · **이모지/SVG 둘 다 상황껏**(한 방식 강제 금지). [[audience-and-emoji-tone]]
- 용어 **첫 등장 1회** 인라인 한 줄 풀이(반복은 glossary 팝업). 예: "Internal Table(메모리에 잠깐 두는 표)". **단 "한 줄"은 *스쳐가는 부수 용어*의 노출 형식** — 그 용어가 *이번 레슨의 주제 개념*이면 한 줄로 끝내지 말고 R15 **L3**로 본문 전체가 풀이(필요성→정의→구조…).
- **ABAP 고유 용어는 영어 원문**(직역 금지): Internal Table·Data Element… 풀이는 괄호로. [[abap-terms-english]]
- 흐름: 왜 필요한가 → 무엇인가 → 어떻게 쓰나 → 실수/주의 → 정리. 압축 설명 금지.
- **줄표(—) 절제** — 제목·캡션·라벨의 "주제 — 부제" 구분에만 허용. **본문 문장 안 부연은 마침표 분리/괄호/콜론으로**(줄표 과용 = 호흡 길어져 입문자 가독성↓, 사용자 확정 2026-07-03). [[em-dash-restraint]]
- 시각화·체험 동반(길면 `details` 접기). 참고 구현: `sample/structure/beginner-lesson-template.html`. [[beginner-learning-page-style]]

**R4 · 검증 후 완료** — 관찰 가능한 변경은 빌드/콘솔/동작을 실제 확인한 뒤에만 "완료" 보고. 수정 후 또 고치면 **바뀐 부분만** 다시 검증([07](07_BROWSER_TESTING.md)).

### 높음
**R5 · 본문(MD) 규칙**
- 섹션은 `##`(필요시 `###`) — 셸이 우측 "이 레슨의 여정" 스텝퍼로 자동 변환(스크롤스파이).
- 코드는 ```` ```abap … ``` ````. **빌드가 [code-copy-block 양식](../sample/structure/code-copy-block.html)(네이비 헤더+줄번호+ABAP 토큰색+복사)으로 자동 변환** → 다크/블랙 블록 금지([05 P10](05_PITFALLS.md)). 본문엔 fenced 코드만(직접 HTML 금지).
- 핵심용어 `[[WRITE]]` / `[[Internal Table|내부 테이블]]` → `term` 버튼(hover=임시·click=고정). 마킹 키는 glossary에 있어야(R12).
- 체험 임베드: `::embed CHnn-Lnn-Snn | <제목> | <높이>::` → `embeds/abap/CHnn-Lnn-Snn.html`(공통 엔진 `embeds/_engine/` + 레슨 위젯)을 iframe으로. 구 `sample/` 직접참조는 제거 — `sample/`은 참고 카탈로그([06](06_SAMPLE_LIBRARY.md)).
- 콜아웃은 `>` 블록인용. **레슨 끝 연결은 관계대로**(R15): 진짜 pain→solution이면 다음 불편을 `→ CHxx`(불편 체인), 형제/대안(DO↔WHILE)·심화면 억지 불편 대신 "도구 선택"/"다음 단계"로 정직히 연결.
- **코드 글꼴 = D2Coding 우선**(`--mono:'D2Coding',Consolas,…`; 빌드·샘플·SVG 코드 텍스트 공통).
- **코드 표시: 수직 스크롤만 허용, 수평 지양** — 한 줄 짧게(긴 문장 분할). 행번호(거터)와 코드 줄 수는 항상 1:1.
- **다른 챕터/레슨 참조 = 링크(내부ID 비노출)** — `CHxx`를 본문에 그대로 노출 말고 `[Chapter NN · 제목](CHnn-Lmm.html)` 링크로(사람이 읽고 클릭 이동). **링크 대상 = 그 내용이 실제 있는 레슨**(특정 주제면 해당 `Lmm`, 챕터 전반이면 대표/첫 레슨) — **무조건 L01 금지**. 불편 체인 `→ CHxx`도 동일.

**R6 · classic-first 경계 (CH04 삽입 리넘버 반영)** — modern 문법·SQL은 정해진 챕터부터만 — **R15 게이팅의 특례(일반보다 강함)**, 도입(CH18/19) 후 자유 사용. [[abap-curriculum-design]]
- 순수 classic 구간 = **CH01～17**.
- **New Syntax**(인라인 `DATA()`·`VALUE`·`NEW`·`+=`·`|…|`): CH17까지 **L0(예고조차 금지)** → **CH18에서 L3** 정식 도입.
- **New Open SQL**(`@`·콤마): CH18까지 L0 → **CH19에서 L3** (CH08～17 Open SQL은 전부 classic).
- 🔶 예외 — **`&&`(문자열 잇기)는 CH04 조기 도입**(매우 간단·고빈도). 대가로 classic `ADD`/`SUBTRACT`/`MULTIPLY`/`DIVIDE`도 CH04에서 함께(`+=`/`-=`는 CH18로 미룸).
- 스칼라·구조체는 **Local(프로그램 내 `DATA`/`TYPES`) → Global(DDIC) 나선**으로 재방문 — **DDIC 코어 = CH03(Domain·Data Element)·CH05(Structure)·CH07(Transparent Table)에 분산**.

**R7 · git** — main 직접 작업 금지(별도 브랜치). `.gitignore`에 안 걸린 변경은 **전부** `git add -A` → commit → push. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

**R15 · 개념 노출 게이팅 + 선수지식 잠금 ★** (R6와 짝) — 레슨은 **그 시점까지 배운 것만으로** 이해·실습 가능해야 한다. 후속 개념의 정의·구조·문법·코드를 미리 당겨 설명하지 않는다(AI가 "완성도"를 이유로 앞당기는 게 대표 실수 → [05 P11](05_PITFALLS.md)). 같은 개념도 노출을 4단계로 관리:
- **L0 노출금지** — 용어·예고·코드 전부 금지(현재 레슨과 무관하거나 미리 보면 혼란 큰 개념).
- **L1 예고** — *존재/이름 + 배울 시점*만. 1～2문장·새 용어 1개·코드 없음·"지금 외울 필요 없음" 명시. **우리 불편 체인(`→ CHxx`, R5)이 곧 L1** — 도입/마무리에만, 중간 반복 금지. 실습·평가 제외.
- **L2 선행사용** — 명세가 *명시 허용*한 코드만 `[선행 사용]`으로 표시해 먼저 사용("분석/암기 불필요" + 정식 레슨 안내, 실습·평가 제외). AI 임의 결정 금지.
- **L3 정식 도입** — 필요성→정의→구조→동작→문법→예제→실습. **개념당 한 곳(최초 도입 레슨)에서만.**
- **불편-해결책과의 관계**: 도입부 불편(일상어, 미래 용어 미사용) → 필요성 → 그 해결책으로 **L3 정식 도입** → 끝에서 다음 불편을 **L1 예고**. 이 규칙은 불편-해결책을 *대체가 아니라 강제하는 가드레일.* **단, 불편 체인은 다음 레슨이 진짜 *이번 한계의 해소*(pain→solution)일 때만** — 형제/대안(DO↔WHILE 등)·심화면 억지 불편 금지, "도구 선택"/"다음 단계"로 정직히(레슨 관계는 R10 `prevRel`로 선언).
- **R6 나선과의 화해**: 나선 재방문은 "같은 개념 중복 정의"가 아니라 **범위가 다른 별개 개념**으로 본다(예: Local 구조체 ≠ DDIC 구조체 → 각자 L3 도입 지점). 경계는 R10 front-matter(`introduces`/`prereq`/`foreshadow`/`advanceUse`)로 선언. [[abap-curriculum-design]]

### 중
**R8 · 공통 자산 인덱스 주석** — `shell.js`·`base.css` 등 공통/큰 자산은:
- **작성**: 파일 맨 위에 "인덱스 주석"(섹션·주요 함수 목록)을 둔다.
- **읽기**: 수정·추가 전 인덱스 + grep으로 기존 구현 확인(인덱스로 부족할 때만 통독) — 중복·충돌 방지.
- **갱신**: 섹션/함수 추가·변경 때마다 인덱스 주석도 함께 갱신. 코드 임의 생략(`// 생략`) 금지.

**R9 · 이름 풀 ★** — 예제 사람 이름은 **아래 풀에서만**(즉석·어색한 작명 금지), **1번은 항상 정훈영**. 같은 캐릭터는 파일이 달라도 동일 이름. [[example-name-pool]]
- 주인공: **정훈영**
- 설화/고전: 홍길동, 심청, 이몽룡, 성춘향, 바보온달, 평강공주, 손오공
- 셀럽: 유재석, 손흥민, 강호동, 마동석, 박지성, 류현진, 차은우, 김연아, 아이유, 수지, 안유진, 신유빈, 전지현

**R10 · front-matter + 제목** — 제목=기술형(서사 문구 금지), 동기는 `intro`(챕터)/`direction`(레슨).
- `_chapter.md`: `id`(=폴더명)·`track`(리터럴 **`TRACK-01`/`TRACK-02`** — `_tracks.md`와 일치, 빌드 join 키)·`order`·`title`·`intro`·`keywords`·`difficulty`.
- 레슨 `.md`: `id`·`title`·`direction`·`keywords`·`order` · (선택) `tcode`·`tcodeBadge`·`goals`.
- 레슨 `.md` **학습 경계(R15)**: `introduces`(이번에 L3 정식 도입할 개념)·`prereq`(전제 개념) = **리빌딩 시 필수**(게이팅 검증 근거) · `foreshadow`(L1 예고 허용)·`advanceUse`(L2 선행 사용 허용)·`prevRel`(이전 레슨과의 관계: `pain-solution`/`parallel`/`deepening`) = 선택. 빌드는 무시(메타 전용) — 리빌딩 때 경계·관계 선언 + 후속 정적 점검 근거.

**R11 · 네이밍** — 챕터 폴더 = 챕터 ID(`CH01/`). 레슨 소스 = `<레슨ID>[-슬러그].md`. **생성물 HTML = `docs/abap/pages/<레슨ID>.html`**(슬러그 무관, 빌드 강제). 샘플 = `<카테고리>/<기능-케밥>.html`.
- **ABAP 변수 접두어(스코프) ★** — Subroutine/Method(로컬 스코프) 도입 **전(=CH01～09)** 에는 모든 선언이 사실상 **전역**이다 → **`gv_`(스칼라)·`gs_`(Structure)·`gt_`(Internal Table)** 로 시작. 로컬 스코프(METHOD/FORM 안, **CH10 모듈화 기초↑**)에서 선언한 것만 `lv_`/`ls_`/`lt_`. 즉 g=global·l=local. **`it_`는 Header Line을 가진 Internal Table에만** (헤더라인 없는 일반 내부테이블은 `gt_`/`lt_`). [[abap-var-prefix-scope]]
- **로컬 TYPES 이름 접두어** — 스칼라 `ty_` · **Structure 타입 `ts_`** · **Table Type `tt_`** (BC400 표준 교재 관례, 사용자 확정 2026-07-03. `ty_s_`/`ty_t_` 대안 대신 채택). 기존 `ty_` 구조체 타입은 챕터별 보강 패스에서 전환.
- **PARAMETERS 접두어 = `pa_`** (표준 교재 관례 — 실무 축약 `p_`는 참고 언급만, 사용자 확정 2026-07-03). SELECT-OPTIONS는 `so_`(CH12 때 확인).

**R12 · glossary 패리티** — 본문에서 마킹한 모든 용어 키는 `reference/glossary.json`에 존재(미정의 0). 빌드 후 정적 점검.
- **약어 용어는 팝업에 풀 스펠링 필수**(사용자 확정 2026-07-03) — DDIC(Data Dictionary)·BAPI(Business Application Programming Interface)처럼 줄임말 용어의 title 또는 desc에 원어 전체가 반드시 등장. 공식 확장이 없는 약칭(SALV 등)은 유래(클래스명 등)를 밝힌다.

**R13 · 타임스탬프** — 손작성 `.md`(content·.project-docs) 최상단 `최종수정: YYYY-MM-DD HH:MM KST`. **사용자 확인용이라 무조건 유지** — `.githooks/pre-commit`이 스테이징된 `.md`에 자동 스탬프하므로 수동 갱신 불필요.

**R14 · `../sapui5`(구 repo) 읽기 전용** — 이 저장소 옆 폴더의 **상세 커리큘럼 참고 원본**. 절대 수정 금지. **NotebookLM 질의는 sapui5 챕터ID로** 해야 답이 온다. [[sapui5-readonly]] [[notebooklm-sapui5-chapterids]]

**R16 · `02_PROGRESS` = prune-only 스냅샷 ★** — `02_PROGRESS.md`는 **현재 상태·다음 할 일만** 담는다(누적 로그 아님). 완료/과거 항목·세션 서사는 **즉시 제거** — 끝난 일의 정본 = **git 이력 + `.archive/` 원장 + 라이브 인덱스**. ① 코드·git·감사로 **파생 가능한 현황은 복창 금지, 포인터만**(콘텐츠 깊이=`CONTENT_DEPTH_AUDIT`·embed=`embeds/abap/_index.md`·구조=`09`·완료이력=git/`.archive`) — 복창하는 순간 stale의 씨앗. ② **수정하면 같은 커밋에 포함**(과거를 파일에 누적할 이유가 없다 — git이 history). ③ 세션 종료 시 갱신([01](01_AI_SYNC.md) 종료 체크리스트). *stale한 진행 문서는 없는 것보다 나쁘다(중복작업·확인토큰 낭비) → 이 규칙으로 방지.* [[progress-doc-prune-only]]

## 빌드 & 서빙
> 빌드·로컬 서빙 명령의 정본 = [03_ARCHITECTURE](03_ARCHITECTURE.md). (빌드 락 = R1 · 서빙은 fetch라 HTTP 필수 = [05 P1](05_PITFALLS.md).)
