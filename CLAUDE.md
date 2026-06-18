# SAP Developer Academy — AI 부팅 가이드

개발자 시선으로 0부터 안내하는 **동기부여형 SAP 학습 사이트**. MD 소스 → 빌드 → 정적 HTML 파이프라인.

> ℹ️ 아래 `@`로 임포트된 문서가 매 세션 자동 로드됩니다. **작업 시작 전 [.project-docs/00_INDEX.md](.project-docs/00_INDEX.md)부터** 읽고, 반드시 지킬 규칙은 `01_AI_SYNC`·`04_CONVENTIONS`를 따릅니다.

# 프로젝트 개요
@README.md

# 00. INDEX — 여기서 시작 (AI 부팅 진입점)
@.project-docs/00_INDEX.md

# 01. AI SYNC — 단일 목표 · 완료 정의 · 반드시 지킬 규칙(R1~R10)
@.project-docs/01_AI_SYNC.md

# 04. CONVENTIONS — 저술·빌드 표준 · 이름 풀 · 입문자 작성법 · git
@.project-docs/04_CONVENTIONS.md

# 05. PITFALLS — 자주 깨지는 함정(P1~)
@.project-docs/05_PITFALLS.md

# 필요 시 직접 읽기 (자동 로드 안 됨)
- 진행 현황·다음 할 일 → [.project-docs/02_PROGRESS.md](.project-docs/02_PROGRESS.md)
- 폴더 역할·빌드 파이프라인·런타임 셸 → [.project-docs/03_ARCHITECTURE.md](.project-docs/03_ARCHITECTURE.md)
- 학습수단·페이지구조 샘플 카탈로그 → [.project-docs/06_SAMPLE_LIBRARY.md](.project-docs/06_SAMPLE_LIBRARY.md)
- 미리보기 검증 워크플로 → [.project-docs/07_BROWSER_TESTING.md](.project-docs/07_BROWSER_TESTING.md)

# 핵심 하드 규칙 (요약 — 상세는 위 문서)
- **R1 생성물(HTML/JSON) 손수정 금지** — 내용은 `content/abap/**.md`에서만, `npm run build:abap`로 재생성.
- **R2 `sapui5/`(구 repo)는 읽기 전용 참고본** — 수정 금지.
- **R3 입문자용으로 작성** — 용어 첫 등장 시 한 줄 풀이, 왜→무엇→어떻게→주의→정리. 압축 설명 금지.
- **R4 코드가 나오면 그 페이지에서 체험/시뮬레이션 필수.**
- **R7 사람 이름은 고정 풀에서만, 1번은 항상 정훈영.**
- **R9 main 직접 작업 금지** — 별도 브랜치 · 커밋 끝에 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
