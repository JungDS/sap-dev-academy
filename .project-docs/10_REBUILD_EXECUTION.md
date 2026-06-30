# 10. REBUILD EXECUTION — ABAP 전 트랙 CONTENT MD 리빌드 실행 핸드오프

> 📅 최종수정: 2026-06-30 15:01 KST
> 🎯 이 문서 = **전면 품질 리빌드를 실행할 때** 새 세션에 그대로 전달하는 핸드오프 프롬프트. 스펙 출처 = [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md)(개요·경계·관통예제) + **각 레슨 `.md` front-matter**(per-lesson SSOT) + `check/` 체크리스트.
> ⚠️ **전제(중요):** 현재 **CH01～36 2트랙 본문은 이미 존재**하고, CH04(연산자·흐름 제어) 삽입과 전 챕터 리넘버도 **이미 반영 완료**다. 따라서 이 리빌드는 greenfield가 **아니라** 골든 5종 아키타입([08 §9](08_LESSON_SHELL_SPEC.md), *품질 참조·재사용 씨앗*)을 활용한 **품질 일괄 상향/재생성**이다 — **리넘버 단계 없음.**
> 표기: 범위는 전각 `～`(반각 `~`는 마크다운 취소선으로 깨짐). 단 ABAP 코드의 `table~field` 같은 *코드 틸드*는 반각 유지.

---

## 0. 목표·스코프 (엄수)
- **`content/abap/**.md`(소스 MD)만** 생성·수정한다. **`docs/**`(생성물)·빌드·브라우저 검증은 하지 않는다** — docs는 사용자가 최종에 별도로 한다(R1/P2).
- **양 트랙 전부**(Track-1 CH01～23 + Track-2 CH24～36) 한 번에. 누락 방지를 위해 Track-2도 포함.
- 산출물 = ① 전 트랙 content MD ② `check/REBUILD-REVIEW.md`(전수 재검토·수렴 이력).
- **샘플/임베드 HTML 신규 제작은 보류**: 본문엔 `::embed` 지시문만(기존 위젯 재사용은 경로 참조, 신규 필요분은 "필요 학습수단 목록"으로 모은다). 실제 위젯·docs는 이후 단계.

## 1. 먼저 정독 (SSOT)
1. `.project-docs/09_CURRICULUM_LEDGER.md` — 챕터 맵 · §B 경계 · §C 관통예제 · §D 도구/DML 경계 · §E Track-2 관계.
2. **각 레슨 `.md` front-matter** — `introduces`/`prereq`/`prevRel`/`foreshadow`/`advanceUse`가 **per-lesson 게이팅 SSOT**([04 R10](04_CONVENTIONS.md)). 09는 이를 표로 복제하지 않으므로, 레슨 단위 정보는 *해당 레슨 front-matter에서 직접* 읽는다.
3. `check/PLANNED-CURRICULUM.md`(타깃 전체본) · `check/RUNNING-EXAMPLES.md`(구구단/SFLIGHT/콘서트 스키마·정훈영) · `check/coverage-checklist*.md`(레슨별 요구 토픽).
4. `.project-docs/01_AI_SYNC.md`(DoD) · `04_CONVENTIONS.md`(규칙 단일 홈) · `05_PITFALLS.md`(함정) · `03_ARCHITECTURE.md`(소스 레이아웃) · `06_SAMPLE_LIBRARY.md`(샘플 카탈로그) · `08_LESSON_SHELL_SPEC.md`.
※ `docs/abap/**`는 생성물 — 읽기만. 손대지 않는다.
> ⚠️ **`check/`는 gitignore된 로컬 스크래치**(프레시 클론엔 없음). **권위 SSOT = 09 + 레슨 front-matter**이고, `check/`(PLANNED·coverage·RUNNING-EXAMPLES)는 그걸 펼친 *작업용 보조*다 — 없으면 09 §C·§F·front-matter에서 재구성한다. 산출물 `REBUILD-REVIEW.md`도 *로컬 수렴 이력*(커밋 대상 아님).

## 2. 적용할 "기능" + 에이전트 권장/비권장
- **TodoWrite**로 Phase A 단계·챕터, Phase B 라운드를 추적(하나씩 in_progress→completed).
- **git**: 새 브랜치, 챕터 단위 커밋(끝에 `Co-Authored-By: Claude ...`), main 금지([04 R7](04_CONVENTIONS.md)).
- **검증은 MD 레벨만**(빌드 X): front-matter 스키마·게이팅·cross-ref grep·구조 점검.

| 구간 | 에이전트 | 이유 |
|---|---|---|
| Phase A1 파운데이션 CH01～08 | ❌ 비권장 | 글로서리 기반·구구단 thread·게이팅 누적의 출발점 = 연속성 필수 |
| Phase A2 드래프팅 CH09～36 | ✅ 권장 | 챕터별 독립 폴더(파일 충돌 0) + tight brief로 병렬 |
| 글로서리/02_PROGRESS 편집 | ❌ 비권장 | 공유 파일 동시편집 충돌 → `[[term]]` 마킹만, 병합은 메인 |
| Phase B 전수 재검토 | ✅ 강력 권장 | 읽기전용 fan-out(선노출·누락 점검)에 최적 |

> ⚠️ 리넘버(구 PHASE 1)는 **이미 완료** — 다시 하지 않는다. CH04는 존재하고 36챕터 번호는 확정이다. 혹 챕터/레슨 추가가 필요하면 **리넘버 대신 append/분할**(ID 안정성 우선, [04 R11](04_CONVENTIONS.md)).

---

## PHASE A — 본문 리빌드 (content MD · 양 트랙)
공통: 모든 레슨은 **레슨 작성 루프(§3)**를 충족. 관통예제 스키마·인물은 `check/RUNNING-EXAMPLES.md` 고정값(`ZGUGUDAN`·`ZCONCERT`/`ZPERF`/`ZBOOKING`·정훈영·SFLIGHT).

### A1. 파운데이션 CH01～CH08 (메인 스레드 · 순차 · 에이전트 X)
- 이유: 핵심 글로서리·구구단 thread·디버거·SY·게이팅 누적의 출발점 = 연속성 필수.
- 기존 본문을 ledger(09) + DoD 기준으로 **업그레이드**(골든 5종은 *참조·씨앗*이지 맞출 틀 아님, 빈 곳은 신작). 압축 금지·체험 동반(R2).
- 이 구간 완료 후 커밋. (콘서트 모델 스키마를 CH09 첫 웨이브에 전달.)

### A2. 병렬 드래프팅 CH09～CH23 + CH24～CH36 (에이전트 ✅ · 챕터 단위)
- 챕터마다 서브에이전트 1개. 서로 다른 폴더만 쓰므로 동시 실행 안전.
- **각 에이전트 brief(반드시 전달)**:
  - (i) 담당 챕터 **각 레슨의 front-matter**(introduces·prereq·prevRel·foreshadow·advanceUse) + 해당 `coverage-checklist` 토픽.
  - (ii) **가용 개념 목록** = CH01～(담당 직전) `introduces` 합집합(오케스트레이터가 front-matter를 모아 계산해 전달).
  - (iii) **게이팅 규칙**: 가용 개념 + 자기 `introduces`만 사용. 후속 개념 정의/문법 선노출 금지. `foreshadow`는 L1(1～2문장·코드없음), `advanceUse`는 `[선행 사용]`만(특히 `START-OF-SELECTION`·`TRY/CATCH cx_salv_msg`).
  - (iv) 관통예제 컨텍스트(`RUNNING-EXAMPLES` 발췌: 그 챕터의 thread 역할·콘서트 스키마·SFLIGHT·정훈영).
  - (v) R규칙(R2/R3/R5/R6/R9/R10/R15)·sample-first(§3-5)·front-matter 스펙·금지(§4).
  - (vi) **출력 제약**: 자기 챕터 폴더 MD만. `reference/glossary.json`·`02_PROGRESS` 등 공유파일 편집 금지 — 용어는 `[[term]]` 마킹만, 신규 글로서리 후보·필요 학습수단은 리턴 메시지에 목록으로.
  - (vii) Track-2(CH24～36)는 09 §E 경계·Track-1 중복 금지 준수(독립 내용 많아 챕터 내 순서만 게이팅).
- 의존: 콘서트 모델은 CH09에서 정의되므로 CH09를 첫 웨이브에서 먼저 확정 후 스키마를 후속 에이전트에 전달.

### A3. 통합 (메인 스레드)
- 에이전트 산출 취합. `[[term]]` 마킹 수집 → 글로서리 후보 목록(병합은 docs 단계, 지금은 목록만).
- 챕터 간 cross-ref 정합 grep 점검. `02_PROGRESS` 갱신. 챕터(또는 트랙) 단위 커밋.

---

## PHASE B — 전수 재검토 · 수렴 루프 (반복; 검토=에이전트 ✅ 읽기전용 / 수정=메인)
> 원칙: **수정은 파급된다.** 한 군데 고치면 직·간접 영향처를 모두 다시 봐야 한다 → 수정이 생긴 라운드 뒤엔 **`content/abap/**` 전체를 처음부터 다시 점검**. 신규 수정 0건 라운드까지 반복(수렴).

**라운드 R 절차:**
1. **전수 검토(읽기전용 fan-out)** — 챕터 묶음(5～6개)마다 read-only 에이전트 1개가 담당 범위 전부 점검, findings 리턴:
   - (a) **선노출(R15)** — "가용 개념"(CH01～직전 `introduces` 합집합) 밖 개념·키워드 정의/사용? (최우선)
   - (b) **front-matter 정합** — `introduces`/`prereq`/`prevRel` 선언 = 본문 실제와 일치? coverage-checklist 요구 토픽 누락?
   - (c) R6(인라인 `DATA`/`@` classic 침투)·R9(정훈영/이름 풀)·R5(fenced ```abap·다크 금지)·R2(코드=`::embed`)?
   - (d) 관통예제 연속성(구구단/SFLIGHT/콘서트 스키마·인물)·cross-ref·stale 참조?
2. **수정(메인 스레드)** — findings를 content MD에 반영.
3. **영향 표면 판정(반드시)** — 각 수정마다 파급 대상 분류(전수 검토 범위는 유지하되 우선 표시):
   - `introduces`/`prereq` 변경 → 개념 가용 시점 이동 → **하류 전 레슨 게이팅 재검토**.
   - 레슨 번호/제목/`foreshadow`/`advanceUse` 대상 변경 → 그걸 참조하는 모든 레슨.
   - 용어 정의/`[[term]]` 마킹 변경 → 그 용어 쓰는 모든 레슨.
   - 관통예제(스키마·필드·인물) 변경 → 그 thread 전 레슨.
   - 경계(R6 위치) 변경 → 경계 구간(CH17～19 인근) 레슨.
4. **수렴 판정**:
   - 이 라운드 **수정 1건 이상** → 라운드 R+1로 **전수 재검토 반복**(1로).
   - 이 라운드 검토 **신규 findings 0건(무수정)** → **수렴 종료**.
5. **상한·기록** — 최대 5라운드. 미수렴이면 잔여 findings를 "미해결"로 남기고 사용자에게 보고(무한루프 방지). 매 라운드 `check/REBUILD-REVIEW.md`에 [라운드 R: findings·수정·영향표면·수렴여부] 누적.
- 각 수렴 라운드 끝에 커밋.

---

## 3. 레슨 작성 루프 (모든 레슨 공통)
1. **스펙 로드**: 그 레슨 **front-matter**(introduces/prereq/prevRel) + `coverage-checklist` 토픽 + `PLANNED-CURRICULUM` 해당 줄.
2. **본문(DoD)**: 왜 필요 → 무엇 → 어떻게 → 실수/주의 → 정리. 용어 첫 등장 1줄 풀이 + `[[term]]`. 압축 금지. 친근 톤·이모지/SVG 상황껏(R3). 품질 기준선 = `sample/structure/beginner-lesson-template.html` + 인접 완성 레슨.
3. **게이팅(R15)**: 이미 배운 것만으로 이해·실습 가능. 선노출 0. 예고 L1·선행사용 `[선행 사용]`.
4. **관통예제(09 §C)**: 구구단(CH04→08)·SFLIGHT 읽기(CH08～13)·콘서트 빌드(CH09→23)·디버거 반복·SY 점진. 인물=이름 풀, 1번 정훈영(R9).
5. **체험 = 학습수단 우선**: ① 필요 체험 유형 판단 → ② 기존 위젯/엔진 점검(`embeds/abap/_index.md`·`embeds/_engine/`·`06_SAMPLE_LIBRARY.md`) → ③ 있으면 재사용/적응 `::embed CHnn-Lnn-Snn | 제목 | 높이::` → ④ 없으면 "필요 학습수단 목록"에 추가(HTML 제작은 보류). 코드 1줄이라도 정적이면 미완(R2). 골든 5종은 **재사용 씨앗**이지 "맞춰야 할 틀"이 아니다.
6. **front-matter(R10)**: id·title·direction·keywords·order + **introduces·prereq**(필수) + foreshadow·advanceUse·prevRel.
7. **MD 점검**: front-matter 스키마·게이팅 자체점검·`[[term]]` 일관·cross-ref(링크는 실존 레슨 ID, [04 R5](04_CONVENTIONS.md)).

## 4. 가드레일 (위반 금지)
- **docs/ 생성·빌드·브라우저 검증 안 함**. `content/abap/**.md` 만.
- **R1/P2**: `docs/abap/**` 손대지 않음.
- **R6/P7**: CH01～17 본문에 인라인 `DATA()`/`VALUE`/`NEW`/`@`/`+=`/`\|…\|` 금지(`&&`만 CH04 예외). New Open SQL은 CH19↑.
- **R9**: 'Kim'/'Lee' 등 임의 작명 금지 → 이름 풀(1번 정훈영).
- **R5/P10**: fenced ```abap 만, 다크/직접 HTML 금지(빌드가 code-copy-block로 변환).
- **R15/P11**: 선노출 금지. CH10 모듈화는 static-first·본격 OO 0·`NEW`/인라인 금지.
- **제외(합의)**: Screen Table Control · classic 인터랙티브 리스트(`AT LINE-SELECTION`/`HIDE`/`AT USER-COMMAND`/`TOP-OF-PAGE`) — ALV로 대체.
- 공유파일(glossary·02_PROGRESS) 동시편집 금지(에이전트는 마킹/리턴만).

## 5. 완료 기준
- 전 트랙(CH01～36) content MD 리빌드 완료(파운데이션 순차 + 나머지 병렬).
- **PHASE B 수렴 루프가 "연속 1라운드 무수정"으로 종료**(또는 상한 도달 시 미해결 명시) — `check/REBUILD-REVIEW.md` 이력 포함.
- 빌드/docs는 하지 않음 — 사용자 검토·수정 후 별도 단계.
