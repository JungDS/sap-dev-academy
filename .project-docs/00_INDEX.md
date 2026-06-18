# 00. INDEX — 여기서 시작 (AI 부팅 진입점)

> 📅 **최종수정: 2026-06-18 KST**
> 🎯 **목적:** 이 저장소(SAP Developer Academy)에 투입된 AI가 가장 먼저 읽고 부팅하는 진입점.
> 📖 **읽을 때:** 항상 맨 처음. 작업 시작 전 1순위.
> ⚡ **TL;DR:**
> - `.project-docs`는 사람용 위키가 아니라 **AI가 부팅하는 컨텍스트 시스템**이다.
> - **한 파일만 읽는다면 → [01_AI_SYNC.md](01_AI_SYNC.md)** (지금 할 일 + 반드시 지킬 규칙).
> - 이력·완료된 과거는 여기 없다 → **git log + [02_PROGRESS.md](02_PROGRESS.md)**.
> - 루트 `CLAUDE.md`가 이 파일들을 `@`로 임포트하므로, 세션마다 자동 로드된다.

## 🚀 부팅 시퀀스 (번호 순 = 우선순위 순)

1. **[01_AI_SYNC.md](01_AI_SYNC.md)** — 단일 목표 + 완료 정의(DoD) + **반드시 지킬 행동 규칙**. (필수·최우선)
2. **[02_PROGRESS.md](02_PROGRESS.md)** — 목표가 어디까지 왔나 + 지금 무엇을 잡고 있나. 작업 시작·종료 시 갱신.
3. **[03_ARCHITECTURE.md](03_ARCHITECTURE.md)** — 폴더 역할 · 빌드 파이프라인 · 런타임 셸. "어디에 두는가"를 모를 때.
4. **[04_CONVENTIONS.md](04_CONVENTIONS.md)** — 파일을 쓰기/고치기 직전. 저술 규칙 · 이름 풀 · 네이밍 · git · 타임스탬프.
5. **[05_PITFALLS.md](05_PITFALLS.md)** — 자주 깨지는 지점(P1~). 막히면 즉시.
6. **[06_SAMPLE_LIBRARY.md](06_SAMPLE_LIBRARY.md)** — 학습수단·페이지 구조 샘플 카탈로그. 레슨/컴포넌트 만들 때.
7. **[07_BROWSER_TESTING.md](07_BROWSER_TESTING.md)** — 미리보기로 화면을 검증해야 할 때(스크린샷 한계·DOM 측정 우회).
8. **[08_LESSON_SHELL_SPEC.md](08_LESSON_SHELL_SPEC.md)** — 레슨 셸 표준(v2-C 확정)·실제 셸/빌드 이식 규칙. 셸·빌드 마크업 건드리기 직전.

## 🗺️ 문서 지도

| 문서 | 역할 | 언제 |
|---|---|---|
| [01_AI_SYNC.md](01_AI_SYNC.md) | **단일 목표 · DoD · 반드시 지킬 규칙 · git 정책** | 항상 (최우선) |
| [02_PROGRESS.md](02_PROGRESS.md) | 커리큘럼/샘플 진행 현황 · 다음 할 일 | 작업 시작·종료 시 |
| [03_ARCHITECTURE.md](03_ARCHITECTURE.md) | 폴더 역할 · MD→빌드→docs 파이프라인 · 런타임 셸 · 샘플 위치 | 구조가 헷갈릴 때 |
| [04_CONVENTIONS.md](04_CONVENTIONS.md) | 저술·빌드 표준 · **이름 풀** · **입문자 작성법** · 네이밍 · git · 타임스탬프 | 파일 쓰기 직전 |
| [05_PITFALLS.md](05_PITFALLS.md) | 자주 깨지는 함정(P1~) | 막혔을 때 |
| [06_SAMPLE_LIBRARY.md](06_SAMPLE_LIBRARY.md) | `sample/` 카탈로그 + 컴포넌트 재사용법 | 레슨/컴포넌트 설계 시 |
| [07_BROWSER_TESTING.md](07_BROWSER_TESTING.md) | preview 검증 워크플로 · 스크린샷 타임아웃 우회 | 브라우저 검증 시 |
| [08_LESSON_SHELL_SPEC.md](08_LESSON_SHELL_SPEC.md) | 레슨 셸 표준(v2-C)·이식 규칙·front-matter 확장 | 셸/빌드 이식 시 |

## 📐 이 폴더의 설계 원칙 (왜 이렇게 생겼나)
- **번호 규칙**: 모든 문서는 `NN_TITLE.md` 2자리 prefix. **번호 순 = 읽기 우선순위**(00→07).
- **무중복 SSOT**: 한 사실은 한 문서에만. 재진술 금지, 상대링크로 참조.
- **4줄 헤더**: 모든 문서 상단에 목적/읽을 때/TL;DR만 읽어도 관련성 판단 가능.
- **기계 스캔**: 산문보다 표·체크리스트·안정 ID(`R1`,`P3`).
- **토큰 경제**: 전체가 한 번에 통독 가능한 분량. 상세는 링크/git 뒤로.

> 이 구조는 구 repo `sapui5/.project-docs`의 체계를 계승해 현재 프로젝트에 맞게 재구성한 것이다. [[sapui5-readonly]]
