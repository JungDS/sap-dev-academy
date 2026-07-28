# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-29 01:15 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**CH33 인터페이스(BAPI/RFC/BDC/File) 재작성급 보강 완료 → 다음 CH34(IDoc/ALE/Gateway) 순차 보강**(브랜치 `content/ch33-interface`, main=`82f7901`). 원칙: content 기준, `reference/codex_0629_v3` 참고(QA+REWRITE 동시 대조) + 델타 사실검증([14 §5·§6](14_REFERENCE_CORPUS.md)) + 게이팅(R10/R15). **챕터 실행 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)**.

## ▶️ 다음 할 일 (우선순위)
1. **CH34(IDoc/ALE/Gateway)+ 순차 보강**. ⚠️ codex 파일명 = `NEWCH34_OLDCH31_*` · codex 본문 내 구번호·`:::embed`+구ID 잔재 복붙 금지 · 꼬리 링크 라벨 "Chapter 구번호" 스테일 우선 grep(CH31~33 3연속 패턴, CH33은 이미 링크형이라 무사).
   ⚠️ **`embeds/abap/_index.md` 등재 갭**: CH34～39 위젯이 A/B 미등재 — 각 챕터 패스에서 자기 몫 등재(CH31~33 완료). CH34+ 엔진의 'C-NOVA' 시드 잔재(odata-query·bal-log 등)도 그 패스에서 정본화.
   ℹ️ **CH33 사실검증 노트(2026-07-30, 에이전트 중단으로 직접 grep 확정분)**: RFC `MESSAGE` 필드 = **flat character-like 필수(TYPE string 불가**, 동적 etab 변형만 string 허용 — ABAPCALL_FUNCTION_DESTINATION_PARA. 현행·codex 공통 오류였음 → `TYPE c LENGTH 255`로 교정) · OPEN DATASET `MESSAGE`는 공식 예제가 string 사용(허용) · CALL TRANSACTION `{MODE/UPDATE}↔OPTIONS FROM` **택일**·BDCDATA 5필드·BDCMSGCOLL·updmode S=동기 확정. **미검증 잔여** = 표준 FM 시그니처(SE37: BAPI_TRANSACTION_*·BDC_OPEN/INSERT/CLOSE·gui_upload·ALSM_EXCEL)·BAPIRET2 필드 구성(DDIC)·ZABAP_JHY 실코드 교차(에이전트 중단으로 미완 — 08 폴더에 BDC 코드 존재 확인만).
   ℹ️ **codex 오류 패턴(계승)**: NEWCH32 `TYPE REF TO if_ex_...`(GET BADI 참조=BAdI명이어야) · NEWCH33도 RFC MESSAGE에 `TYPE string` 사용(상기 flat 규칙 위반). Section 다중 plug-in=conflict resolution 1개만.
   ⚠️ **RAP 2단(입문 CH24 ↔ 심화 CH39)** — 사용자 지시 2026-07-24([09 §E CH39](09_CURRICULUM_LEDGER.md)·[[rap-intro-ch24-advanced-ch39]]): 심화는 CH39. **현행 CH39(7L)는 NEWCH39(9L) 미반영 — CH39 착수 시 재구성**. 그때 CH24-L09의 CH39-L01 링크가 정확한 EML consumer 레슨을 가리키는지 재확인.
   ℹ️ **코퍼스 교훈**: `abap-docs-main` MD 미러는 예제 코드 붕괴 → 코드는 **HTML 덤프/PDF+cheat-sheet/`.asbdef`/`.asddls`**, prose·문법만 MD. classic 주제(CH25~)는 HTML 덤프 758/8.16 + cheat-sheet 우선.
   ⚠️ 잔여 컨벤션(각 챕터 패스): 구조체 타입 `ts_`/`tt_`(CH01～25 — 잔여 `ty_`: 구 CH24=현 CH25 등 + 엔진 6종) · "컴포넌트"→Component(잔여 inline-target-viewer 엔진) · 줄표(잔여 CH26+ 톤 패스) · **병합 챕터 위젯 시드 정본화 잔재**('1001'/'C-NOVA' — `alv-events`(CH30)·`dml-playground`(CH25)·`enqueue-2session`(CH26), 미세 패스 1회 필요. CH33+ 엔진 동종 잔재는 각 챕터 패스에서. CH22 salv-*의 persid 1001은 별개 인사 도메인이라 무관). **잔여(저)**: 구 CH09/10 소소(델타 = git). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
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
