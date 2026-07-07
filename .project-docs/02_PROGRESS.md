# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-07 21:34 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**reference 리라이트 코퍼스 기반 content MD 챕터별 보강** 진행 중(브랜치 `content/enrich-md-from-rewrite-refs-2026-06-30`). 원칙: **content가 기준**, `reference/`(codex_0629_v3 1순위 · codex_0625 · antigravity_0629_v1 선별)는 순수 참고 — 보수적 외과 보강 + 델타 사실검증([14 §5](14_REFERENCE_CORPUS.md)) + front-matter 게이팅 선언 보완(R10/R15). 순서 CH01→(기존 번호 기준, **CH01~10 완료**). **CH07~16 오버나이트 자율 배치 진행 중**(사용자 지시 2026-07-07: 챕터마다 풀 프로토콜→그 챕터 파일만 커밋→02 갱신→다음, B안=자율 커밋·중간 무중단·끝에 일괄 보고). v3에 레슨이 추가된 챕터는 보강 때 레슨 신설 가능 — 레슨 추가 시 커리큘럼 페이지 갱신 필수.

## ▶️ 다음 할 일 (우선순위)
1. **CH11~16 보강**(배치 진행 중, CH10 완료) — 동일 프로토콜(챕터 전 레슨 정독 → v3 델타 식별 → **오프라인 사실검증 두 루트 병행**(`C:\ABAP_DOCU_HTML` + `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`, 교차확인 = [14 §5-1](14_REFERENCE_CORPUS.md)) → R3/R6/R15 통과분만 반영 → 챕터 단위 검수·1커밋) + **R2 갭 위젯 제작**(기존 엔진 재사용 우선·신규는 [AUTHORING](../embeds/_engine/AUTHORING.md) 계약·"개념의 모양을 그린다") + **기존 위젯 콘텐츠 검수·개선**(최종 산출물=docs 렌더 페이지=본문+iframe: ① 결함 검수 — 톤/저급어휘·사실·컨벤션 R9/R11/`pa_`·본문 정합·자산 실존 ② sed류 **일괄 변경이 닿은 위젯은 전수 브라우저 재확인**(상태 ✅ 유지 금지 — 변경=재검증) ③ **개선 검토 — codex_0629_v3의 "체험형 학습 설계" 추천과 대조 + 자체 판단으로 기존 위젯 업그레이드/신규 제작**. "과거 검증됨 ≠ 손대지 않음" — v3 대조로 CH03 VALUE CHECK 사실 오류를 잡은 선례). **CH07+ 보강도 사용자 지시로 시작**(선착수 금지). ⚠️ 잔여 컨벤션(각 챕터 패스에서 전환): PARAMETERS `pa_`(CH01～04 완료 — 잔여 CH12·CH15~16 등·엔진 10종) · 구조체 타입 `ts_`/Table Type `tt_`(CH05·06·07 완료 — 잔여 `ty_` 구조체: CH13·17·18·19·21·24 + 엔진 6종) · "컴포넌트"→Component(CH05·06·09 완료 — 잔여 CH13-L08 MD + inline-target-viewer 엔진(CH19-L03 전용)) · 줄표(—) 절제(CH01～10 완료 — 잔여 CH11+) · 어휘("투명 테이블"→Transparent Table·"구조/구조체"→Structure: CH05·06·07·glossary 완료 — 잔여 CH14 · "감사필드"는 CH23~24 도입과 재검토). **codex_0629_v3 파일 체계**: `NEWCHxx_OLDCHxx_QA/_REWRITE` 세트(OLDCH99=완전 신규 장 — NEWCH20 Advanced SQL·NEWCH28 Dynamic ABAP·NEWCH29 Regex, OLDCH20~26→NEWCH21~27 밀림, `00_CONCEPT_GAP_AUDIT.md`=R15 보류/회수 감사표). **리넘버링·신규 장(NEW20/28/29) 집필 = 보류(사용자 지시 대기)** — CH19까지는 기존 번호로 보강만. CH01~08 보강 완료: 각 챕터 QA §6 필수항목·v3 REWRITE 델타 반영 + 공식 문서 사실검증 두 루트. CH07 신규 위젯 엔진 2종(se11-table-builder·se11-create-entries). CH08(Open SQL classic): 사실검증 13건 CONFIRMED + **R6 lines( ) 전수 제거**·DATS '20260623'·LT_→GT_PERSON. CH09(DDIC 관계·F4): 사실검증 12건 중 **F4 입력도움 우선순위 REFUTED→교정**(고정값이 Check Table보다 아래, DE-부착 Search Help는 Check보다 아래 — L07 레슨+위젯 3종 5단 사다리로 수정)·PARAMETERS F4는 제한적+VALUE CHECK 필요 NUANCE·컴포넌트→Component·pa_ 전환. **잔여(저순위)**: CH09 L05-S02/L06 person↔concert·CH10 L05-S01 위젯(zcl_booking_calc)↔본문(zcl_util) 클래스명 불일치·CH10 L01/L02 델타(scope/RETURN·STATICS 본문 코드 예)는 미해소(사실오류 아님·차기 정리). CH10(모듈화): 사실검증 8건 CONFIRMED(FORM obsolete·USING/CHANGING by-ref·CALL FUNCTION·Local/Global Class)·get_remaining sy-subrc 가드 추가·CHxx 링크화·문체 2·param-board cv_result. CONSIDER 16건 보류(정본 = [.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). CH20+ 보조는 codex_0625(메타)·antigravity(선별). 잔여 R2 목록 = `CONTENT_DEPTH_AUDIT`(재생성물).
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
