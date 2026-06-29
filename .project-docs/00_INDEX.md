# 00. INDEX — 문서 지도

> 📅 최종수정: 2026-06-29 15:36 KST
> `.project-docs`는 AI 부팅용 컨텍스트. 원칙: **한 사실은 한 문서에만(SSOT)** · 번호≈우선순위(낮을수록 핵심; 11～13 공백 = 아카이브) · **완료된 이력 = git + `.archive`**(라이브 인덱스 포함, [04 R16](04_CONVENTIONS.md)).

## 자동 로드 (CLAUDE.md가 `@` 임포트 — 이미 컨텍스트에 있음)
> README·00(이 문서)도 함께 임포트됨 — 아래는 그중 핵심 규칙·목표 문서.
- **01_AI_SYNC** — 단일 목표 · 완료 정의(DoD) · 행동 규칙 · 작업 전/후 체크리스트.
- **04_CONVENTIONS** — **규칙 단일 홈 (R1～R16)** · 이름 풀 · 입문자 작성법 · 네이밍 · git.
- **05_PITFALLS** — 반복 함정 (P1～P11).

## 필요 시 직접 읽기 (자동 로드 안 됨)
| 문서 | 역할 | 언제 |
|---|---|---|
| [02_PROGRESS](02_PROGRESS.md) | 현재 상태 · 다음 할 일 (**prune-only 스냅샷**, [04 R16](04_CONVENTIONS.md)) | 작업 시작·종료 시 |
| [03_ARCHITECTURE](03_ARCHITECTURE.md) | 폴더 · MD→빌드→docs 파이프라인 · 런타임 셸 | 구조가 헷갈릴 때 |
| [06_SAMPLE_LIBRARY](06_SAMPLE_LIBRARY.md) | `sample/` 참고 패턴 카탈로그(체험 정본은 `embeds/`) | 레슨 체험·컴포넌트 설계 시 |
| [07_BROWSER_TESTING](07_BROWSER_TESTING.md) | preview 검증 · 스크린샷 한계 우회 | 브라우저 검증 시 |
| [08_LESSON_SHELL_SPEC](08_LESSON_SHELL_SPEC.md) | 레슨 셸 표준(v2-C) · 이식 규칙 | 셸/빌드 이식 시 |
| [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) | **커리큘럼 개념 원장(개요 SSOT)** — 챕터 맵 · CH18 classic↔modern 경계 · 관통예제 (레슨별 introduces/prereq는 front-matter) | 커리큘럼 구조·게이팅(R15) 점검 시 |
| [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md) | **전 트랙 CONTENT MD 리빌드 실행 핸드오프**(새 세션 전달용 프롬프트) | 전면 리빌드 실행 시 |
| [14_REFERENCE_CORPUS](14_REFERENCE_CORPUS.md) | **외부 참고 코퍼스**(cheat-sheets·keyword doc·Clean ABAP) + **§5 사실검증·검색 규율**(웹검색 대신 오프라인·공식 URL·NotebookLM) | 레슨 집필·사실검증 시 |

## 아카이브 (`.archive/` — 부팅 컨텍스트 밖)
> 완료된 작업 원장·재생성물은 **루트 `.archive/`**(이 폴더 밖)로 분리 — `.project-docs` 통독 명령에 딸려오지 않게. 끝난 일의 정본 = **git 이력 + `.archive` 원장**(02는 prune-only·완료이력 비보유, [04 R16](04_CONVENTIONS.md)). 필요 시에만 직접 열어봄.
> 구조: **보관 묶음 = 날짜 배치 하위폴더**(`.archive/<날짜-주제>/`, 동명 충돌 방지·출처 보존) · **재생성물 = `.archive/_generated/`**(도구가 매번 덮어씀). 규약 = [[project-docs-archive-convention]].

**`.archive/2026-06-29-docs-cleanup/`** (frozen — 완료/대체된 원장)
- `11_KEYWORD_AUDIT` 공식 keyword doc 대비 감사(CH01～36) · `12_EXPANSION_PLAN` 체크리스트 확장 배치(38건) · `13_EMBED_BUILD_PLAN` 학습수단 제작 패스
- `TRACK2_ENRICHMENT` Track2(CH24～36) 보강 · `NAMING_REVIEW` 제목·설명 점검 · `09`·`10` 재작성 전 구버전(현행 = `.project-docs/09`·`/10`)

**`.archive/_generated/`** (재생성물 — 덮어쓰기)
- `CONTENT_DEPTH_AUDIT.md` 콘텐츠 깊이/DoD 결손 자동 진단 (`node tools/audit-content-depth.mjs`)
