# 02. PROGRESS — 현재 초점 · 다음 할 일

> 📅 **최종수정: 2026-08-01 19:37 KST**
> 🎯 **현재 상태와 다음 할 일만 담는다.** 완료/과거 항목·세션 서사는 **즉시 제거** — 정본은 git 이력 + `.archive/` 원장 + 라이브 인덱스([04 R16](04_CONVENTIONS.md)). 코드·git·감사로 파생 가능한 현황은 **복창하지 말고 포인터**(아래 📍).
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 시 갱신 — **갱신은 같은 커밋에 포함**([01](01_AI_SYNC.md)).

## 🎯 현재 초점
**CH37 Forms/Output/PDF 보강 완료(2026-08-01, 브랜치 `content/ch36-pushdown`→`content/ch37-forms`) → 다음 CH38(ATC/Code Inspector 등 운영 품질) 순차 보강.** 원칙: content 기준, `reference/codex_0629_v3` 참고(QA+REWRITE 동시 대조) + 델타 사실검증([14 §5·§6](14_REFERENCE_CORPUS.md)) + 게이팅(R10/R15). **챕터 실행 = [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md)** · 시뮬레이션 운영형 = [08 §10-12](08_LESSON_SHELL_SPEC.md).

## ▶️ 다음 할 일 (우선순위)
1. **CH38+ 순차 보강**. ⚠️ codex 파일명 = `NEWCH38_OLDCH35_*` 예상 · codex 본문 내 구번호 잔재 복붙 금지 · 꼬리 링크 라벨 구번호 스테일 grep.
   ⚠️ **`embeds/abap/_index.md` 등재 갭**: CH38～39 위젯 미등재 — 각 챕터 패스에서 자기 몫 등재(CH31～37 완료). 엔진 'C-NOVA' 시드 잔재도 그 패스에서.
   ℹ️ **CH37 노트(2026-08-01)**: 시뮬레이션 운영형 확정 반영([08 §10-12](08_LESSON_SHELL_SPEC.md)) — 학습자 3인 = Opus(A/B 실측: 누락 0 + 본선 미발견 결함 다수), **기술 감수 1인(20년차) 시험 도입 성공**(USER_CANCELED·오류 경로 JOB_CLOSE·spool vs output request·NAST 전송 시점 등 [확실] 19건). 교훈 = 보강이 새 모순을 만들 수 있다(preview 옵션↔L04 충돌, MESSAGE E↔짝 규율) → R2 재평가가 그걸 잡았다. 도구 화면(SMARTFORMS/SFP 조작 세부) 요구는 환경 의존으로 종결 처리. 에이전트 체제 = 학습자 3 + 기술 감수 1로 확정(교재 디자인 감수는 미도입 — 사용자 2026-08-01).
   ℹ️ **codex 오류 패턴(계승)**: NEWCH32 `TYPE REF TO if_ex_...` · NEWCH33 RFC MESSAGE `TYPE string` · NEWCH35 customer_id · NEWCH36 필드 발명 · NEWCH37 구번호 잔재 + 게이팅 전제 오류(xstring "기배움" 오인 — 첫 등장 실측 필수). codex 코드는 시그니처·타입·필드명·전제 계열 우선 의심.
   ⚠️ **NotebookLM 인증 만료**(2026-08-01 질의 실패) — 다음 사용 전 사용자 `nlm login` 필요.
   ⚠️ **RAP 2단** — 경계·분할 여지 = [09 §A CH39 노트](09_CURRICULUM_LEDGER.md). **현행 CH39(7L)는 NEWCH39(9L) 미반영 — 착수 시 재구성 + CH24-L09 링크 재확인.**
   ⚠️ 잔여 컨벤션(각 챕터 패스, 대상은 grep 실측): 구조체 타입 `ts_`/`tt_` · "컴포넌트"→Component · 줄표(CH26+) · **병합 챕터 위젯 시드 정본화 잔재**('1001'/'C-NOVA' — `alv-events`(CH30)·`dml-playground`(CH25)·`enqueue-2session`(CH26) 미세 패스 1회. CH22 salv-* persid 1001은 별개 도메인이라 무관). CONSIDER 16건 보류([.archive/…/CONSIDER_BACKLOG.md](../.archive/2026-07-03-v3-recheck-ch01-05/CONSIDER_BACKLOG.md)). 잔여 R2 = `CONTENT_DEPTH_AUDIT`(재생성물).
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
