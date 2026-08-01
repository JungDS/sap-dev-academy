# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-08-02 00:45 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**승인 플랜 3작업 실행 중(플랜 = `~/.claude/plans/track-a-drifting-donut.md`, W0+W1 승인 2026-08-02): ① 관통예제 배지(완료 — 브랜치 `struct/thread-badge`, CH32/34/35/38 `thread: false` + 로드맵 칩·레슨 태그) → ② CH37 Adobe 제거·OTF 재구성(브랜치 `content/ch37-otf` 예정) → ③ W0+W1 감사(축1 게이팅 도구·축3 Track 백지검토·축6 용어).** 관통 확정 범위 = CH01～31·33·36·37·39(독립 모듈 = 32·34·35·38, [09 §A](09_CURRICULUM_LEDGER.md)). 원칙: content 기준 + 게이팅(R10/R15) · 시뮬레이션 운영형 = [08 §10-12](08_LESSON_SHELL_SPEC.md).

## ▶️ 다음 할 일 (우선순위)
1. **작업 2 — CH37 재구성**(Adobe Forms 소개 금지 → Smart Forms→OTF→`CONVERT_OTF` 경로, 사실 조달 = 내 지식→NotebookLM→SAP Help 순): L02 전면 재작성 + L01/L03/L04/L05/CH38-L05 부분 수정 + 위젯 6 + glossary(Adobe/ADS 삭제·OTF 신규) + 스팟 시뮬레이션(은서 1+기술 감수 1).
2. **작업 3 — W0+W1 감사**(순서·게이팅 도구 신작 `tools/audit-gating.mjs` → 축1·축3(Track 구성 백지 검토 — 순서 유지 전제, 복수 안+권고 리포트만)·축6 → 웨이브 보고 후 W2 결정. 계획 상세 = 메모리 `full-curriculum-audit-plan.md` + 승인 플랜).
   ℹ️ **CH39 노트(2026-08-01)**: 9레슨 재구성(분할 없이 단일 유지). codex UUID 모델 기각(booking_id 정본 유지 + `local_last_changed_at`/`last_changed_at` TIMESTAMPL 2필드 확장 — 표준 관례). 기술 감수가 활성화 차단급 문법 2건 적발·교정: **`lock master total etag F`는 한 줄**(독립 절 아님)·**strict draft BO는 validation을 `draft determine action Prepare { validation …; }`에 배정 필수**(둘 다 cheat-sheets-rap 실행예제로 검증). 학습자 3인이 잡은 구조 결함: projection behavior 부재→신설, CreatedBy 자동/수동 모순→@Semantics 자동으로 통일, Status readonly 누락(완료 기준 2 불성립)→잠금, ZBOOKAUTH 자기부정 코드→"실습은 비워 둔다" 지시화. R1 5.9→R2 7.2(은서 7.8/준호 6.9/수민 6.8) 후 확정 지적 전량 반영.
   ℹ️ **CH38 노트(2026-08-01)**: 게이팅 실측 — ABAP Unit/DI/Mock 정식 도입 = **CH27-L05**(codex "CH26"은 구번호), `SUBMIT`·`CL_ABAP_TESTDOUBLE`·`CL_OSQL_TEST_ENVIRONMENT`·`TEST-SEAM` = CH38 첫 등장 L3. CL_ABAP_TESTDOUBLE 공식 패턴(CAST+create→configure_call→빈 호출 바인딩)은 cheat-sheets-main 실행예제로 검증(codex 스켈레톤의 동적 호출은 오류였음). 시뮬레이션 R1 6.0 → R2 은서 7.8/준호 6.8/수민 7.3 — R2가 재보강 유발 오류 2건(L06 롤백 문답·L02 회귀 서사 불성립)을 적발, 기술 감수 [확실] 20건+(CVA 라이선스·RC8 부분반영/RC12·선행 import 추월·ST22·동시실행 ENQUEUE·BAL 만료/SLG2 등) 반영. 잔여는 환경 의존(ADT/QAS/팀 부재)뿐.
   ℹ️ **codex 오류 패턴(계승)**: NEWCH32 `TYPE REF TO if_ex_...` · NEWCH33 RFC MESSAGE `TYPE string` · NEWCH35 customer_id · NEWCH36 필드 발명 · NEWCH37 구번호 잔재 · NEWCH37/38 게이팅 전제 오류(첫 등장 실측 필수) · NEWCH38 CL_ABAP_TESTDOUBLE 동적 호출 발명. codex 코드는 시그니처·타입·필드명·전제 계열 우선 의심.
   ⚠️ 잔여 컨벤션(각 챕터 패스, 대상은 grep 실측): 구조체 타입 `ts_`/`tt_` · "컴포넌트"→Component · 줄표(CH26+) · **병합 챕터 위젯 시드 정본화 잔재**('1001'/'C-NOVA' — `alv-events`(CH30)·`dml-playground`(CH25)·`enqueue-2session`(CH26) 미세 패스 1회. CH22 salv-* persid 1001은 별개 도메인이라 무관). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
3. **전면 리빌드 여부 결정(미정)** — 선택지 = *점진 개선 유지(현 보강 패스)* vs *골든 5종([08 §9·§10](08_LESSON_SHELL_SPEC.md)) 기준 전면 리빌드*. 리빌드 택하면 MD 작성 *전에* 커리큘럼 맵·개념 원장([09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md)) 확정 → 실행 절차 [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md). ⚠️ CH18 classic→modern 경계([04 R6](04_CONVENTIONS.md)) · R15 게이팅이 핵심 지표([04 R15](04_CONVENTIONS.md)/[05 P11](05_PITFALLS.md)).
4. **잔여 깊이갭 보강** — `node tools/audit-content-depth.mjs` 재생성 후 🟠빈약·🔴R2 플래그 레슨 우선(수치·대상은 [.archive/_generated/CONTENT_DEPTH_AUDIT.md](../.archive/_generated/CONTENT_DEPTH_AUDIT.md) 참조).
5. **시각 스모크테스트** — 셸 인터랙션·로드맵·임베드 렌더 눈 확인 + `index.html` 허브 → ABAP 카드 → 로드맵 연결 점검([07](07_BROWSER_TESTING.md)).

## 📍 현황은 라이브 소스에서 (02는 복창하지 않는다 — R16)
- **콘텐츠 깊이/DoD 갭** → `.archive/_generated/CONTENT_DEPTH_AUDIT.md` (재생성물).
- **학습수단(embed) 현황·위젯·엔진** → [embeds/abap/_index.md](../embeds/abap/_index.md).
- **챕터/레슨 구조·경계·관통예제** → [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) + 각 레슨 front-matter.
- **완료된 작업 이력**(키워드 감사·확장·Track2·embed 이관·다크모드 감사 등) → git log + `.archive/` 원장([00 아카이브 섹션](00_INDEX.md)).
- **셸·빌드·코드블록·glossary** → [08](08_LESSON_SHELL_SPEC.md)/[03](03_ARCHITECTURE.md)/[04](04_CONVENTIONS.md)·`reference/glossary.json`.
- **외부 참고 코퍼스·검색 규율** → [14_REFERENCE_CORPUS](14_REFERENCE_CORPUS.md).

## 🧠 메모리 핸드오프
`~/.claude/projects/…/memory/` — **`MEMORY.md`(인덱스)가 정본.** 새 세션은 그 인덱스로 재설명 없이 이어간다.
