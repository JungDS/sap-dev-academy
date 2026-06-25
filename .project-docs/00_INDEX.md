# 00. INDEX — 문서 지도

> 📅 최종수정: 2026-06-24 09:31 KST
> `.project-docs`는 AI 부팅용 컨텍스트. 원칙: **한 사실은 한 문서에만(SSOT)** · 번호=우선순위 · 완료된 이력은 git+02.

## 자동 로드 (CLAUDE.md가 `@` 임포트 — 이미 컨텍스트에 있음)
- **01_AI_SYNC** — 단일 목표 · 완료 정의(DoD) · 행동 규칙 · 작업 전/후 체크리스트.
- **04_CONVENTIONS** — **규칙 단일 홈 (R1~R15)** · 이름 풀 · 입문자 작성법 · 네이밍 · git.
- **05_PITFALLS** — 반복 함정 (P1~P11).

## 필요 시 직접 읽기 (자동 로드 안 됨)
| 문서 | 역할 | 언제 |
|---|---|---|
| [02_PROGRESS](02_PROGRESS.md) | 진행 현황 · 다음 할 일 | 작업 시작·종료 시 |
| [03_ARCHITECTURE](03_ARCHITECTURE.md) | 폴더 · MD→빌드→docs 파이프라인 · 런타임 셸 | 구조가 헷갈릴 때 |
| [06_SAMPLE_LIBRARY](06_SAMPLE_LIBRARY.md) | `sample/` 카탈로그 · 컴포넌트 재사용 | 레슨/컴포넌트 설계 시 |
| [07_BROWSER_TESTING](07_BROWSER_TESTING.md) | preview 검증 · 스크린샷 한계 우회 | 브라우저 검증 시 |
| [08_LESSON_SHELL_SPEC](08_LESSON_SHELL_SPEC.md) | 레슨 셸 표준(v2-C) · 이식 규칙 | 셸/빌드 이식 시 |
| [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) | **리빌드 단일 스펙** — 레슨별 introduces/prereq/prevRel · 리넘버맵 · 경계 · 관통예제 | 리빌드 전·중 |
| [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md) | **전 트랙 CONTENT MD 생성 실행 프롬프트**(핸드오프) | 리빌드 실행 시 |
| [11_KEYWORD_AUDIT](11_KEYWORD_AUDIT.md) | **공식 ABAP keyword doc 대비 감사 원장** — 기준·챕터별 findings·진행현황 | 감사 패스 재개 시 |
| [12_EXPANSION_PLAN](12_EXPANSION_PLAN.md) | **51항목 체크리스트 기반 콘텐츠 확장 배치 계획** — 항목별 배치·진행추적 | 확장 작업 시 |
| [13_EMBED_BUILD_PLAN](13_EMBED_BUILD_PLAN.md) | **학습수단 수정·제작 계획** — embeds/ 구조·엔진 공통화·챕터 루프(입력=check 감사) | 학습수단 제작 시 |
