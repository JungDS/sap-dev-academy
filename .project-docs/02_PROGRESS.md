# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-24 10:49 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**CH23 CDS View Entity 보강 완료 → 다음 CH24(RAP) 순차 보강**(브랜치 `content/ch20-advanced-sql`). 리넘버·CH01～19 **main 병합**(PR #14·#15). 원칙: content 기준, `reference/codex_0629_v3` 참고(QA+REWRITE 동시 대조) + 델타 사실검증([14 §5·§6](14_REFERENCE_CORPUS.md)) + 게이팅(R10/R15). **챕터 실행 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)**. ⚠️ 리넘버 후 **우리 CHnn = codex NEWCHnn 일치**.

## ▶️ 다음 할 일 (우선순위)
1. **CH24(RAP)+ 순차 보강**. ⚠️ 리넘버 후 **codex 파일 = 우리 번호 일치**(CH24=`NEWCH24`…CH39=`NEWCH39`). 신규 CH28 Dynamic ABAP(8L)·CH29 Regex(8L)는 진도가 닿을 때 예약 슬롯에 집필(추가 리넘버 0).
   ℹ️ **CH24(RAP) 착수 = 공식 가이드 PDF(RAP_20260715, ~1,653p) 1차 출처**([14 §6](14_REFERENCE_CORPUS.md)) — 목차→절 범위 특정 후 `pdftotext -f/-l`(통독 금지). **CDS 코퍼스 교훈**(CH23서 확인): `abap-docs-main` MD 미러는 **코드 붕괴**(fenced 0·`\n\{` blob)라 *prose·문법만*, 코드 예제는 **PDF+`.asddls`**. `as projection on`(무contract)=obsolete(PDF p.44).
   ⚠️ **CH23→CH24 파급(미완)**: CH23-L02를 `as projection on`(obsolete)→**nesting(`as select from`)**로 재구성 → 제목 "Consumption View 계층"·용어 Projection→소비 뷰. CH24-L03이 이걸 참조해 **참조 2곳만 최소 정비**(링크텍스트·contrast 1문장)했고, **CH24-L03 본격 보강은 CH24 차례에** — 거기가 진짜 Projection View(`as projection on`+provider contract) L3 정식 도입처.
   ⚠️ 잔여 컨벤션(각 챕터 패스): 구조체 타입 `ts_`/`tt_`(CH01～23 — 잔여 `ty_`: 구 CH24=현 CH25 등 + 엔진 6종) · "컴포넌트"→Component(잔여 inline-target-viewer 엔진) · 줄표·`pa_`·R11 접두어(CH01～23 완료 — 잔여 CH24+). **잔여(저)**: 구 CH09/10 소소(델타 = git). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
2. **전면 리빌드 여부 결정(미정)** — 선택지 = *점진 개선 유지(현 보강 패스)* vs *골든 5종([08 §9·§10](08_LESSON_SHELL_SPEC.md)) 기준 전면 리빌드*. 리빌드 택하면 MD 작성 *전에* 커리큘럼 맵·개념 원장([09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md)) 확정 → 실행 절차 [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md). ⚠️ CH18 classic→modern 경계([04 R6](04_CONVENTIONS.md)) · R15 게이팅이 핵심 지표([04 R15](04_CONVENTIONS.md)/[05 P11](05_PITFALLS.md)).
3. **잔여 깊이갭 보강** — `node tools/audit-content-depth.mjs` 재생성 후 🟠빈약·🔴R2 플래그 레슨 우선(수치·대상은 [.archive/_generated/CONTENT_DEPTH_AUDIT.md](../.archive/_generated/CONTENT_DEPTH_AUDIT.md) 참조).
4. **시각 스모크테스트** — 셸 인터랙션·로드맵·임베드 렌더 눈 확인 + `index.html` 허브 → ABAP 카드 → 로드맵 연결 점검([07](07_BROWSER_TESTING.md)).

## 📍 현황은 라이브 소스에서 (02는 복창하지 않는다 — R16)
- **콘텐츠 깊이/DoD 갭** → `.archive/_generated/CONTENT_DEPTH_AUDIT.md` (재생성물).
- **학습수단(embed) 현황·위젯·엔진** → [embeds/abap/_index.md](../embeds/abap/_index.md).
- **챕터/레슨 구조·경계·관통예제** → [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) + 각 레슨 front-matter.
- **완료된 작업 이력**(키워드 감사·확장·Track2·embed 이관·다크모드 감사 등) → git log + `.archive/` 원장([00 아카이브 섹션](00_INDEX.md)).
- **셸·빌드·코드블록·glossary** → [08](08_LESSON_SHELL_SPEC.md)/[03](03_ARCHITECTURE.md)/[04](04_CONVENTIONS.md)·`reference/glossary.json`.
- **외부 참고 코퍼스·검색 규율** → [14_REFERENCE_CORPUS](14_REFERENCE_CORPUS.md).

## 🧠 메모리 핸드오프
`~/.claude/projects/…/memory/` — **`MEMORY.md`(인덱스)가 정본.** 새 세션은 그 인덱스로 재설명 없이 이어간다.
