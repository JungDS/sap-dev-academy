# 04. CONVENTIONS — 저술·빌드 표준 · 이름 풀 · 입문자 작성법 · git

> 📅 **최종수정: 2026-06-18 20:48 KST**
> 🎯 **목적:** 파일을 쓰기/고치기 직전 따르는 규칙 모음(안정 ID `R1~`).
> 📖 **읽을 때:** 콘텐츠·코드를 작성/수정하기 직전.
> ⚡ **TL;DR:** R1 타임스탬프 · R2 front-matter · R3 본문MD · R4 빌드락 · **R5 입문자 작성법** · **R6 용어** · **R7 이름 풀** · R8 네이밍 · R9 git.

## R1. 타임스탬프
- 손작성하는 `.md`(content·.project-docs)는 최상단/헤더에 **`YYYY-MM-DD HH:MM KST`**(시간 포함) 갱신.
- **시간 필수**: 하루에도 여러 번 수정하므로 날짜만으로는 같은 날 파일을 구분할 수 없다. 분 단위까지 적는다.
- 파일을 고칠 때마다 그 시점의 현재 시각으로 갱신한다(추정·일괄 동일 시각 금지 — 각 파일의 실제 최종수정 시각).
- 생성물(`docs/**`)은 빌드가 관리하므로 손대지 않는다([03](03_ARCHITECTURE.md)).

## R2. front-matter 스키마
**_chapter.md**
```yaml
id: CH01            # = 폴더명
track: TRACK-01
order: 1
title: 개발 환경과 첫 프로그램   # 기술형(스캔 가능)
intro: "…불편 한 줄(동기 훅)…"   # 동기부여는 제목이 아니라 여기
keywords: [ … ]
difficulty: 입문
```
**레슨 .md**
```yaml
id: CH01-L01
title: SAPGUI 로그온과 화면 구성   # 기술형
direction: "…학습 방향 한 줄…"     # 동기/방향은 여기
keywords: [ … ]
order: 1
tcode: SE38            # (선택) 이 레슨 핵심 T-code → 셸이 라벨+공통 미니페이지 모달
tcodeBadge: 신규        # (선택) 복습|신규|처음 등 레슨별 관계 배지(미니페이지 본문은 공통)
goals: "…학습 목표 한 줄…"  # (선택) 없으면 direction으로 대체
```

## R3. 본문(MD) 규칙
- 섹션은 `##`(필요시 `###`) — 셸이 우측 "이 레슨의 여정" 스텝퍼로 자동 변환(스크롤스파이).
- 코드는 ```` ```abap … ``` ````.
- 핵심용어: `[[WRITE]]` 또는 `[[Internal Table|내부 테이블]]` → 셸이 `term` 버튼으로 변환, **hover=임시·click=고정** glossary 팝업. 마킹한 키는 glossary.json에 있어야 함(빌드가 미정의 경고).
- **체험 임베드(R4)**: `::embed <sample경로> | <제목>::` → 빌드가 `sample/`의 standalone을 "체험 위젯" iframe으로 펼침. 예: `::embed code-learning/step-debugger.html | 한 줄씩 실행 따라가기::`.
- 콜아웃은 `>` 블록인용. 챕터/레슨 끝에 다음 불편을 `→ CHxx`로 명시(불편 체인).

## R4. 빌드 락 (생성물은 소스 우선)
- **`docs/abap/**`(HTML/JSON)는 빌드 생성물** — 원칙적으로 `content/**.md`에서 고치고 `npm run build:abap`로 재생성.
- **예외:** 디버깅·실험·긴급 시 생성물을 직접 고칠 수 있다. 단, **같은 변경을 소스(.md/빌드 스크립트)에 반영**해 다음 빌드가 덮어써도 보존되게 한다.
- `sample/`·`assets/` 등 **손작성 파일은 생성물이 아니다** → 그 파일에서 직접 편집한다([01 R1](01_AI_SYNC.md)).

## R5. 입문자 작성법 (★ 핵심)
완전 입문자(SAP/ABAP 처음)가 따라올 수 있게 작성한다.
- **용어 첫 등장 시 그 자리에서 한 줄로 풀이**(인라인). 예: "내부 테이블(메모리에 잠깐 두는 표)".
- **흐름**: 왜 필요한가 → 무엇인가 → 어떻게 쓰나 → 실수/주의 → 정리.
- **아는 사람용 압축 설명 금지.** 친절하고 자세한 문장으로.
- **시각화·체험 동반.** 단, 길어지면 접기/펼치기(`details`)로 "페이지는 짧게, 정보는 풍성하게".
- 참고 구현: `sample/structure/beginner-lesson-template.html`. [[beginner-learning-page-style]]

## R6. 용어(glossary) 패리티
- 본문에서 마킹한 모든 용어 키는 `content/abap/glossary.json`에 있어야 한다(미정의 0건). 빌드 후 정적 점검 권장.

## R7. 이름 풀 (★ 사람 이름 규칙)
예제에 사람 이름이 필요하면 **아래 풀에서만** 고른다. 즉석 작명·풀 밖 이름(홍길순·김철수 등) 금지.
- **주인공(항상 1번): 정훈영**
- 조연 — 고전/설화: 홍길동, 심청, 이몽룡, 성춘향, 바보온달, 평강공주, 손오공, 사오정, 저팔계
- 조연 — 스포츠·연예·셀럽: 유재석, 손흥민, 강호동, 이병헌, 마동석, 지드래곤, 차은우, 박지성, 류현진, 아이유, 김연아, 이효리, 김혜수, 전지현, 송혜교, 김태희, 한가인, 장도연, 장윤정, 이영지, 수지, 윤아, 손예진, 김고은, 홍진경, 박세리, 신유빈, 안유진
- 일관성: 같은 "캐릭터"는 파일이 달라도 같은 풀 이름으로 매핑한다. [[example-name-pool]]

## R8. 네이밍
- 챕터 폴더 = 챕터 ID(`CH01/`). 레슨 파일 = `<레슨ID>[-슬러그].md`.
- 샘플 = `<카테고리>/<기능-케밥>.html`(예: `code-learning/step-debugger.html`).

## R9. git 정책
- **main에서 직접 작업 금지** — 별도 브랜치에서 작업.
- 내 파일만 `git add`(`-A` 지양) → `git commit` → `git push`.
- 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## R10. 도메인 설계 락 (ABAP)
- **classic-first SQL 경계 = CH18**(CH07~CH16 classic, CH18+ modern). [[abap-curriculum-design]]
- 스칼라·구조체는 Local → Global(DDIC) 나선. DDIC는 CH03/CH04/CH06에 분산.

## 빌드 & 서빙
```bash
npm run build:abap           # content/abap → docs/abap 재생성
python -m http.server 8137   # fetch 사용 → 반드시 HTTP
```
