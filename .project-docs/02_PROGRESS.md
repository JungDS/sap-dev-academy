# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-07-14 04:26 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**신규 3장 삽입 리넘버 완료 → 신규 장 집필 + CH21+ 보강** 단계(브랜치 `renumber/insert-new-chapters-2026-07-14`). **CH01～19 보강 완료·main 병합**(PR #14). **2026-07-14 리넘버**: 현 CH20(OO)～36 → **CH21～27(+1)/CH30～39(+3)**, 신규 슬롯 **CH20 Advanced SQL·CH28 Dynamic ABAP·CH29 Regex** 예약(미집필=폴더 없음, 로드맵 번호 공백·셸 정상). 원칙: content가 기준, `reference/codex_0629_v3` 참고 — 보수적 외과 보강 + 델타 사실검증([14 §5](14_REFERENCE_CORPUS.md)) + front-matter 게이팅(R10/R15). **챕터 실행 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)**(STEP 0～6·강도·신규장·codex 매핑). ⚠️ 리넘버 후 **우리 CHnn = codex NEWCHnn 일치**.

## ▶️ 다음 할 일 (우선순위)
1. **신규 장 CH20 Advanced ABAP SQL 집필**(Phase 2 — 리넘버 슬롯 확보됨, 폴더 미생성). codex `NEWCH20_OLDCH99`(7레슨: 필요성·CTE/`WITH`·Subquery/`EXISTS`·Set연산·Window·선택기준·실습). [10] STEP 0～6 [신규장]. ⚠️ **CH19의 "다음→" 링크를 새 CH20으로 재배선**(현재 리넘버로 CH21 OO를 가리킴). 위젯 5종·게이팅(CDS/RAP/Dynamic/Native SQL 선노출 0)·glossary.
2. **CH21 OO 보강**(구 CH20). 조사 완료(홀드, 세부=이 세션 워크플로): **L06 T100 예외 텍스트 + `THROW` expression 부재(high)** · L10 raise T100 미연결(med) · L01~05 low(L02 `mv_capacity`/`mv_booked`→관통예제 이름 정렬·L01 `CREATE PUBLIC` 설명·L03 없는 공연ID 주의). codex `NEWCH21_OLDCH20`.
3. **CH22+ 순차 보강**(구 CH21+). ⚠️ 리넘버 후 **codex 파일 = 우리 번호 일치**(CH21=`NEWCH21`…CH39=`NEWCH39`). 신규 CH28 Dynamic ABAP(8L)·CH29 Regex(8L)는 진도가 닿을 때 예약 슬롯에 집필(추가 리넘버 0).
   ⚠️ 잔여 컨벤션(각 챕터 패스): 구조체 타입 `ts_`/`tt_`(CH01～19 완료 — 잔여 `ty_` 구조체: 구 CH21·24=현 CH22·25 등 + 엔진 6종) · "컴포넌트"→Component(잔여 inline-target-viewer 엔진(CH19-L03 전용)) · 줄표(—) 절제(CH01～19 완료 — 잔여 CH21+) · PARAMETERS `pa_`(CH01～19 해당분 완료 — 잔여 CH21+). **잔여(저)**: 구 CH09/10 소소(class명 불일치·델타 = git). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
4. **전면 리빌드 여부 결정(미정)** — 선택지 = *점진 개선 유지(현 보강 패스)* vs *골든 5종([08 §9·§10](08_LESSON_SHELL_SPEC.md)) 기준 전면 리빌드*. 리빌드 택하면 MD 작성 *전에* 커리큘럼 맵·개념 원장([09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md)) 확정 → 실행 절차 [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md). ⚠️ CH18 classic→modern 경계([04 R6](04_CONVENTIONS.md)) · R15 게이팅이 핵심 지표([04 R15](04_CONVENTIONS.md)/[05 P11](05_PITFALLS.md)).
5. **잔여 깊이갭 보강** — `node tools/audit-content-depth.mjs` 재생성 후 🟠빈약·🔴R2 플래그 레슨 우선(수치·대상은 [.archive/_generated/CONTENT_DEPTH_AUDIT.md](../.archive/_generated/CONTENT_DEPTH_AUDIT.md) 참조).
6. **시각 스모크테스트** — 셸 인터랙션·로드맵·임베드 렌더 눈 확인 + `index.html` 허브 → ABAP 카드 → 로드맵 연결 점검([07](07_BROWSER_TESTING.md)).

## 📍 현황은 라이브 소스에서 (02는 복창하지 않는다 — R16)
- **콘텐츠 깊이/DoD 갭** → `.archive/_generated/CONTENT_DEPTH_AUDIT.md` (재생성물).
- **학습수단(embed) 현황·위젯·엔진** → [embeds/abap/_index.md](../embeds/abap/_index.md).
- **챕터/레슨 구조·경계·관통예제** → [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) + 각 레슨 front-matter.
- **완료된 작업 이력**(키워드 감사·확장·Track2·embed 이관·다크모드 감사 등) → git log + `.archive/` 원장([00 아카이브 섹션](00_INDEX.md)).
- **셸·빌드·코드블록·glossary** → [08](08_LESSON_SHELL_SPEC.md)/[03](03_ARCHITECTURE.md)/[04](04_CONVENTIONS.md)·`reference/glossary.json`.
- **외부 참고 코퍼스·검색 규율** → [14_REFERENCE_CORPUS](14_REFERENCE_CORPUS.md).

## 🧠 메모리 핸드오프
`~/.claude/projects/…/memory/` — **`MEMORY.md`(인덱스)가 정본.** 새 세션은 그 인덱스로 재설명 없이 이어간다.
