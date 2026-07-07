# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-08 02:07 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**reference 리라이트 코퍼스 기반 content MD 챕터별 보강** 진행 중(브랜치 `content/enrich-md-from-rewrite-refs-2026-06-30`). 원칙: **content가 기준**, `reference/`(codex_0629_v3 1순위 · codex_0625 · antigravity_0629_v1 선별)는 순수 참고 — 보수적 외과 보강 + 델타 사실검증([14 §5](14_REFERENCE_CORPUS.md)) + front-matter 게이팅 선언 보완(R10/R15). 순서 CH01→(기존 번호 기준, **CH01~16 완료**). **CH07~16 오버나이트 자율 배치 완료**(사용자 지시 2026-07-07, B안=자율 커밋·끝에 일괄 보고). CH17+는 사용자 지시 대기. v3에 레슨이 추가된 챕터는 보강 때 레슨 신설 가능 — 레슨 추가 시 커리큘럼 페이지 갱신 필수.

## ▶️ 다음 할 일 (우선순위)
1. **CH17+ 보강**(사용자 지시 대기 — 오버나이트 배치 **CH07~16 완료**, 챕터별 세부·사실교정 = git log). **선착수 금지.** 프로토콜(챕터 전 레슨 정독 → v3 `_REWRITE`+`_QA` **둘 다** 델타 → **오프라인 사실검증 두 루트 병행**(`C:\ABAP_DOCU_HTML` + `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`, 교차확인 = [14 §5-1](14_REFERENCE_CORPUS.md)) → R3/R6/R15 통과분만 → **R2 갭 위젯**(기존 엔진 재사용·신규는 [AUTHORING](../embeds/_engine/AUTHORING.md)) → sed류 닿은 위젯 **전수 브라우저 재확인**(✅ 유지 금지=변경=재검증) → 챕터 1커밋). **v3 `_QA.md`는 `_REWRITE.md`와 반드시 함께 대조**(§3 doc교정·§4 gotcha·§5/§8 게이팅·§2 커버리지맵 — 사용자 2회 지적). QA 소급 교차검증(CH07~16)에서 사실·gotcha·게이팅 **위반 0** 확인(REWRITE-only 배치가 실질 손실 없었음).
   ✅ **결정 반영 (2026-07-08)**: (a) **SELECT-OPTIONS = `so_`**(전면 전환 완료 129건, R11). (c) **CH16 화면필드 바인딩 DATA = `gv_` 확정**(사용자 Ⓐ 선택 — R11 무예외, `p_` 예외 안 둠; OK field는 프레임워크 관례명 `ok_code`/`save_ok` 유지, R11 명문화). CH16 현행 `p_`→`gv_` 전환 완료(80건: 레슨 5·엔진 5·위젯 3).
   ▶️ **진행 중 (b) CH16 8→10레슨 확장** — 신규 2개념: ① `TABLES dbtab`(Dictionary field↔work area PBO/PAI 운반) ② Dynpro 직접 F1/F4(`PROCESS ON VALUE-REQUEST/HELP-REQUEST`·`DYNP_VALUES_READ`·우선순위·Search Help exit 경계). v3 매핑: **L04·L05 신설 + 기존 L04~L08→L06~L10 리넘버**(파일·front-matter·상호링크·embed ID) + 커리큘럼 페이지 갱신 + L10(구 L08) 통합실습에 TABLES·POV 반영. 신규 필드 접두어 = `gv_`(standalone)·DDIC 바인딩은 `TABLES dbtab`. 프로토콜: 두 루트 사실검증(QA §3 doc목록 타깃) + R2 위젯 + 게이팅(TYPE REF TO/CREATE OBJECT는 [선행사용]→CH20·Table Control 제외).
   ⚠️ 잔여 컨벤션(각 챕터 패스에서 전환): 구조체 타입 `ts_`/Table Type `tt_`(CH05·06·07·13 완료 — 잔여 `ty_` 구조체: CH17·18·19·21·24 + 엔진 6종) · "컴포넌트"→Component(잔여 inline-target-viewer 엔진(CH19-L03 전용)) · 줄표(—) 절제(CH01～16 완료 — 잔여 CH17+) · PARAMETERS `pa_`(CH01～04·15 완료 — 잔여 CH17+). **codex_0629_v3 파일 체계**: `NEWCHxx_OLDCHxx_QA/_REWRITE`(OLDCH99=신규 장 NEW20 Advanced SQL·NEW28 Dynamic ABAP·NEW29 Regex, OLDCH20~26→NEW21~27 밀림, `00_CONCEPT_GAP_AUDIT.md`=R15 감사표). **리넘버링·신규 장 집필=보류(사용자 대기)**. **잔여(저순위)**: CH09 L05-S02/L06 person↔concert·CH10 L05-S01 위젯(zcl_booking_calc)↔본문(zcl_util) 클래스명 불일치·CH10 L01/L02 델타(scope/RETURN·STATICS 본문 코드 예). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). CH20+ 보조는 codex_0625(메타)·antigravity(선별). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
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
