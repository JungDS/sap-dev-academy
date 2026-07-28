# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-29 02:02 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**CH34 IDoc/ALE/Gateway 재작성급 보강 완료(용어 나열 금지→운영 스토리·T-code 참조표 격리·실습 불가 프레이밍, 사용자 확정 지시 2026-07-30) → 다음 CH35(성능 분석과 튜닝) 순차 보강**(브랜치 `content/ch34-idoc`, main=`4f7edc7`). 원칙: content 기준, `reference/codex_0629_v3` 참고(QA+REWRITE 동시 대조) + 델타 사실검증([14 §5·§6](14_REFERENCE_CORPUS.md)) + 게이팅(R10/R15). **챕터 실행 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)**.

## ▶️ 다음 할 일 (우선순위)
1. **CH35(성능 분석과 튜닝)+ 순차 보강**. ⚠️ codex 파일명 = `NEWCH35_OLDCH32_*` · codex 본문 내 구번호·`:::embed`+구ID 잔재 복붙 금지 · 꼬리 링크 라벨 구번호 스테일 grep.
   ⚠️ **`embeds/abap/_index.md` 등재 갭**: CH35～39 위젯이 A/B 미등재 — 각 챕터 패스에서 자기 몫 등재(CH31~34 완료). CH35+ 엔진 'C-NOVA' 시드 잔재(bal-log·excel-upload는 완료, 잔여 확인)도 그 패스에서.
   ℹ️ **CH34 노트(2026-07-30)**: `SELECT … OFFSET`(페이징)은 CH34-L05에서 **L3 정식 도입**(그 전 커리큘럼 미도입이었음 — 09 행 반영). odata-tree 엔진 JS가 실종 상태였던 것 복구(신규 작성). IDoc status·T-code 화면·Gateway 클래스 시그니처(io_tech_request_context 등) = 미검증(도구영역/SE24, SAP Help 근거·대표값 프레이밍). 검증 확정분 = OFFSET엔 ORDER BY 필수(공식)·METHOD/REDEFINITION·CORRESPONDING/RANGE(기도입).
   ℹ️ **codex 오류 패턴(계승)**: NEWCH32 `TYPE REF TO if_ex_...` · NEWCH33 RFC MESSAGE `TYPE string`(flat 위반) — CH35 착수 시 codex 코드는 시그니처·타입 계열 우선 의심.
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
