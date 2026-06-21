# 04. CONVENTIONS — 규칙 단일 홈 (R1~R14) · 이름 풀 · 입문자 작성법

> 📅 최종수정: 2026-06-21 00:37 KST
> 🎯 **이 문서가 규칙(R)의 단일 출처.** 01·05·06 등은 여기 ID를 참조한다(재진술 금지).
> 📖 파일을 쓰기/고치기 직전. 중요도 순(필수→높음→중), 안정 ID `R1`~`R14`.

## 🚨 규칙 (R = Rule, 위반 금지)

### 필수
**R1 · 빌드 락** — 빌드 생성물 `docs/abap/**`(HTML/JSON)는 원칙적으로 소스에서 고친다(다음 빌드에 덮어쓰임). 내용은 `content/abap/**.md` → `npm run build:abap`. **예외(디버그·실험·긴급): 생성물을 직접 고쳐도 되나 같은 변경을 반드시 소스(.md 또는 빌드 스크립트)에 backport**해 재현되게. ※ `sample/`·`assets/`는 손작성 파일=생성물 아님 → 자유 편집([03](03_ARCHITECTURE.md)).

**R2 · 코드 = 체험 필수** — 본문에 코드가 1줄이라도 나오면 그 페이지에서 직접 해보는 체험/시뮬레이션을 붙인다(구현은 R5의 `::embed::`). 정적 코드만 나열하면 미완.

**R3 · 입문자 작성법 ★** — 학습 대상 = 개발·전공 경험 없는 20대 전후 입문자(학습자용 콘텐츠 한정 — `.project-docs`·빌드 스크립트엔 비적용).
- 친근한 톤 · **이모지/SVG 둘 다 상황껏**(한 방식 강제 금지). [[audience-and-emoji-tone]]
- 용어 **첫 등장 1회** 인라인 한 줄 풀이(반복은 glossary 팝업). 예: "Internal Table(메모리에 잠깐 두는 표)".
- **ABAP 고유 용어는 영어 원문**(직역 금지): Internal Table·Data Element… 풀이는 괄호로. [[abap-terms-english]]
- 흐름: 왜 필요한가 → 무엇인가 → 어떻게 쓰나 → 실수/주의 → 정리. 압축 설명 금지.
- 시각화·체험 동반(길면 `details` 접기). 참고 구현: `sample/structure/beginner-lesson-template.html`. [[beginner-learning-page-style]]

**R4 · 검증 후 완료** — 관찰 가능한 변경은 빌드/콘솔/동작을 실제 확인한 뒤에만 "완료" 보고. 수정 후 또 고치면 **바뀐 부분만** 다시 검증([07](07_BROWSER_TESTING.md)).

### 높음
**R5 · 본문(MD) 규칙**
- 섹션은 `##`(필요시 `###`) — 셸이 우측 "이 레슨의 여정" 스텝퍼로 자동 변환(스크롤스파이).
- 코드는 ```` ```abap … ``` ````. **빌드가 [code-copy-block 양식](../sample/structure/code-copy-block.html)(네이비 헤더+줄번호+ABAP 토큰색+복사)으로 자동 변환** → 다크/블랙 블록 금지([05 P10](05_PITFALLS.md)). 본문엔 fenced 코드만(직접 HTML 금지).
- 핵심용어 `[[WRITE]]` / `[[Internal Table|내부 테이블]]` → `term` 버튼(hover=임시·click=고정). 마킹 키는 glossary에 있어야(R12).
- 체험 임베드: `::embed <sample경로> | <제목>::` → `sample/` standalone을 iframe 위젯으로.
- 콜아웃은 `>` 블록인용. 챕터/레슨 끝에 다음 불편을 `→ CHxx`로(불편 체인).
- **코드 글꼴 = D2Coding 우선**(`--mono:'D2Coding',Consolas,…`; 빌드·샘플·SVG 코드 텍스트 공통).
- **코드 표시: 수직 스크롤만 허용, 수평 지양** — 한 줄 짧게(긴 문장 분할). 행번호(거터)와 코드 줄 수는 항상 1:1.

**R6 · classic-first SQL 경계 = CH18** — CH18 이전(특히 CH07~16 Open SQL)은 **순수 classic**: New Syntax(인라인 `DATA()`·`VALUE`/`NEW` 등)와 New Open SQL(`@`·콤마) **금지**. **CH18에서 modern을 도입한 뒤부터는 자유 사용.** + 스칼라·구조체는 **Local(프로그램 내 `DATA`/`TYPES`) → Global(DDIC: Domain·Data Element·Structure·Table) 나선**으로 — 한 번에 몰지 않고 같은 개념을 넓은 범위로 재방문(DDIC는 CH03/04/06에 분산). [[abap-curriculum-design]]

**R7 · git** — main 직접 작업 금지(별도 브랜치). `.gitignore`에 안 걸린 변경은 **전부** `git add -A` → commit → push. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

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
- `_chapter.md`: `id`(=폴더명)·`track`·`order`·`title`·`intro`·`keywords`·`difficulty`.
- 레슨 `.md`: `id`·`title`·`direction`·`keywords`·`order` · (선택) `tcode`·`tcodeBadge`·`goals`.

**R11 · 네이밍** — 챕터 폴더 = 챕터 ID(`CH01/`). 레슨 소스 = `<레슨ID>[-슬러그].md`. **생성물 HTML = `docs/abap/pages/<레슨ID>.html`**(슬러그 무관, 빌드 강제). 샘플 = `<카테고리>/<기능-케밥>.html`.

**R12 · glossary 패리티** — 본문에서 마킹한 모든 용어 키는 `content/abap/glossary.json`에 존재(미정의 0). 빌드 후 정적 점검.

**R13 · 타임스탬프** — 손작성 `.md`(content·.project-docs) 최상단 `최종수정: YYYY-MM-DD HH:MM KST`. **사용자 확인용이라 무조건 유지** — `.githooks/pre-commit`이 스테이징된 `.md`에 자동 스탬프하므로 수동 갱신 불필요.

**R14 · `../sapui5`(구 repo) 읽기 전용** — 이 저장소 옆 폴더의 **상세 커리큘럼 참고 원본**. 절대 수정 금지. **NotebookLM 질의는 sapui5 챕터ID로** 해야 답이 온다. [[sapui5-readonly]] [[notebooklm-sapui5-chapterids]]

## 빌드 & 서빙
```bash
npm run build:abap           # content/abap → docs/abap 재생성
python -m http.server 8137   # fetch 사용 → 반드시 HTTP
```
