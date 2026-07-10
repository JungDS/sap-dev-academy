# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-10 18:15 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**reference 리라이트 코퍼스 기반 content MD 챕터별 보강** 진행 중(브랜치 `content/enrich-md-from-rewrite-refs-2026-06-30`). 원칙: **content가 기준**, `reference/`(codex_0629_v3 1순위 · codex_0625 · antigravity_0629_v1 선별)는 순수 참고 — 보수적 외과 보강 + 델타 사실검증([14 §5](14_REFERENCE_CORPUS.md)) + front-matter 게이팅 선언 보완(R10/R15). 순서 CH01→(기존 번호 기준, **CH01~17 완료**). CH18+는 사용자 지시 대기. **챕터 실행 프로토콜 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)**(보강=리빌드 단일·STEP 0～6·강도·신규 장 OLDCH99·codex NEW/OLD 매핑). v3에 레슨 추가 챕터는 신설 가능(리넘버 리플 전수 + 커리큘럼 갱신).

## ▶️ 다음 할 일 (우선순위)
1. **CH18+ 보강**(사용자 지시 대기 — **CH07~17 완료**, 챕터별 세부·사실교정 = git log). **선착수 금지.** 실행 프로토콜 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)(STEP 0～6·강도 [보강]/[재작성]·모드 [기존]/[신규장]·codex NEW/OLD 매핑). CH18/19 = `NEWCH18_OLDCH18`/`NEWCH19_OLDCH19`(1:1) · CH20+는 OLD 번호로 codex 파일 매칭. **신규 장(OLDCH99: Advanced SQL·Dynamic ABAP·Regex)·CH20+ 리넘버 = 보류(사용자 대기).**
   ✅ **CH17 Grid ALV 10레슨 완료 (2026-07-08)** — 사실검증 8/8 CONFIRMED(**zabap_jhy_07 실코드로 얇은 ALV API 검증** — 코퍼스 얇은 챕터의 보완원)·게이팅 0. **OO L2 직관 추가**(`REF TO`=리모컨·`CREATE OBJECT`=설계도 비유 + CH20-L01 언지, 사용자 결정)·**L09 이벤트 라우팅 CH21→CH27 교정**·전역 접두어 `lt_`/`ls_`→`gt_`/`gs_`(105건·`ty_perf_alv`→`ts_perf_alv`; 로컬 워크에어리어 `ls_fcat`/`ls_stable`/`ls_perf` 유지·CH18/21 엔진 침범분 되돌림)·델타(L01 조감도·L04 fcat표·L08 대비표·L09 4조건·L10 자가점검)·줄표. 잔여(저순위): L10 위젯이 L07과 유사(누락진단/refresh 차별화 미반영).
   ✅ **결정 반영(R11 명문화, 세부=git)**: SELECT-OPTIONS=`so_`(전환 129) · Module Pool 화면필드 DATA=`gv_`(CH16 p_→gv_) · CH16 8→10레슨 확장(신규 L04 TABLES·L05 Dynpro F1/F4).
   ⚠️ 잔여 컨벤션(각 챕터 패스에서 전환): 구조체 타입 `ts_`/Table Type `tt_`(CH05·06·07·13·17 완료 — 잔여 `ty_` 구조체: CH18·19·21·24 + 엔진 6종) · "컴포넌트"→Component(잔여 inline-target-viewer 엔진(CH19-L03 전용)) · 줄표(—) 절제(CH01～17 완료 — 잔여 CH18+) · PARAMETERS `pa_`(CH01～04·15 완료 — 잔여 CH18+) · 스코프 접두어 `gt_`/`gs_`(CH16·17 전역 전환 완료). **codex_0629_v3 파일 체계**: `NEWCHxx_OLDCHxx_QA/_REWRITE`(OLDCH99=신규 장 NEW20 Advanced SQL·NEW28 Dynamic ABAP·NEW29 Regex, OLDCH20~26→NEW21~27 밀림, `00_CONCEPT_GAP_AUDIT.md`=R15 감사표). **리넘버링·신규 장 집필=보류(사용자 대기)**. **잔여(저순위)**: CH09 L05-S02/L06 person↔concert·CH10 L05-S01 위젯(zcl_booking_calc)↔본문(zcl_util) 클래스명 불일치·CH10 L01/L02 델타(scope/RETURN·STATICS 본문 코드 예). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). CH20+ 보조는 codex_0625(메타)·antigravity(선별). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
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
