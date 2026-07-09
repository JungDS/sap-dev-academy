# 10. CHAPTER EXECUTION — content MD 챕터 실행 (보강 = 리빌드, 단일 프로토콜)

> 📅 최종수정: 2026-07-09 18:39 KST
> 🎯 이 문서 = `content/abap` 챕터를 **실행**(보강/재작성)할 때의 단일 핸드오프. **리빌드와 보강은 같은 파이프라인이고 차이는 강도뿐** — 별도 문서로 나누지 않는다. 스펙 출처 = [09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md)(개요·경계·관통예제) + **각 레슨 `.md` front-matter**(per-lesson SSOT) + `reference/codex_0629_v3`(참고) + `check/` 체크리스트.
> 🧭 규칙은 여기서 **재진술하지 않는다** — [04](04_CONVENTIONS.md)(R) · [14 §5](14_REFERENCE_CORPUS.md)(사실검증) · [05](05_PITFALLS.md)(함정) · [09](09_CURRICULUM_LEDGER.md)(구조)로 포인터만(SSOT).
> 표기: 범위는 전각 `～`(반각 `~`는 취소선). ABAP 코드의 `table~field` 틸드는 반각 유지.

---

## 파라미터 (실행 시 지정)
- **대상** = `CHnn`(한 번에 한 챕터) — 또는 전 트랙(강도 [재작성] 시).
- **강도**:
  - **[보강]** 보수적 델타 — 현행 유지 + 외과 보강. **full loop**: content + R2 위젯 + `build:abap` + 브라우저 검증 + 챕터 1커밋·푸시. (CH07～16에서 검증된 기본 모드.)
  - **[재작성]** 전면 재생성 — 골든 5종([08 §9](08_LESSON_SHELL_SPEC.md)) 씨앗으로 대량 병렬. **content MD만**, docs/빌드/브라우저는 이후 사용자 단계. (세부 = 부록 A/B.)
- **모드**(대상 성격, STEP 0에서 판별):
  - **[기존]** 현행 content 있음 → STEP 1～6.
  - **[신규장]** codex `OLDCH99`(현행 repo에 없음) → 신규 집필 + 커리큘럼 삽입 + 하류 리넘버. **02_PROGRESS가 "보류(사용자 대기)"로 둔 트랙** → STEP 1 사인오프 없이 착수 금지.

---

## STEP 0 — 챕터 선결 조사 (집필 전 "지형"을 실측해 채운다)
1. **현행 상태**: `content/abap/CHnn/CHnn-L*.md`(레슨 수·제목) + `embeds/abap/CHnn-*`(위젯·엔진) + `::embed` 매핑.
2. **codex 파일 매핑(중요)**: 현행 CHnn에 대응하는 codex 파일 = 파일명의 `_OLDCHnn_`이 일치하는 것.
   - CH01～19: `NEWCHnn_OLDCHnn`(1:1).
   - CH20+: codex NEW 번호가 밀려 있으므로 **OLD 번호로 찾는다**(예: 우리 CH20 OO = `NEWCH21_OLDCH20`).
   - `OLDCH99` = codex가 제안하는 **신규 장**(현행 repo에 없음): NEW20 Advanced SQL · NEW28 Dynamic ABAP · NEW29 Regex.
3. **모드 판별**: [기존] vs [신규장]. 신규장이면 STEP 1 필수(삽입 위치·번호·리넘버 범위).
4. **구조 권고**: codex QA §2(커버리지 맵) vs 현행 → 레슨 추가/분리 필요 여부(챕터마다 다름: CH16=8→10 확장, CH17=권고 없음).
5. **게이팅 지형**: 이 챕터가 아직 안 배운 개념(modern 문법·OO·미래 API·이벤트·DML 등)을 어디서 쓰는가 → 각 개념을 L0/L1/L2 중 무엇으로 둘지 초안. 근거 = [04 R6](04_CONVENTIONS.md)·[09](09_CURRICULUM_LEDGER.md)·codex QA §4·§5·§8.
6. **관통예제·연결**: 이 챕터의 모델(`ZCONCERT`/`ZPERF`/`ZBOOKING` 또는 SFLIGHT) + 직전 챕터 산출물 연결점([09 §C-4](09_CURRICULUM_LEDGER.md)). 이름풀 1번 = 정훈영([04 R9](04_CONVENTIONS.md)).
7. **사실검증 커버리지**: 주제가 keyword doc으로 검증되는가, 아니면 GUI control·Class API처럼 코퍼스가 얇은가(codex QA §3이 "SE24/Class Builder 영역"이라 하면 얇음) → 얇으면 `zabap_jhy` repo·SE24 보완 계획.

## STEP 1 — 선결 사인오프 (코드 스타일·게이팅·구조를 좌우하는 결정만)
STEP 0에서 **전 챕터 코드 스타일/구조를 좌우하는 결정**이 나오면 집필 전 사용자 확인(p_→gv_ 선례, [[abap-var-prefix-scope]]).
- **[신규장]이면 항상 사인오프**(삽입 위치·번호·리넘버 범위).
- 예(CH17): "OO(`REF TO`·`CREATE OBJECT`·메서드)를 **L2 [선행 사용]** + 이론 확장 금지(정식=CH20)로 둔다 — codex 방침 유지?"

## STEP 2 — 규율 체크리스트 (전 레슨 공통)
1. **QA + REWRITE 동시 대조**([[codex-v3-qa-plus-rewrite]]) — REWRITE 델타 + QA **§2 커버리지·§4 gotcha·§5 게이팅·§8 잔여리스크**를 현행에 교차검증.
2. **사실검증 = 두 루트 병행**([14 §5-1](14_REFERENCE_CORPUS.md): `C:\ABAP_DOCU_HTML` + `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU`, 교차·불일치 보고). 코퍼스 얇은 주제(STEP 0-7)는 `zabap_jhy`([[zabap-jhy-reference-repo]], 이식 X)·공식 URL로 보완, **확인 불가 API는 단정 금지·"미검증" 표기**.
3. **게이팅(R6/R15)** — STEP 1 결정대로. modern·미래 개념 선노출 0, L2는 `[선행 사용]` 표기·이론 확장 금지, QA가 그은 후속 경계 당겨오지 않음. 해당 챕터 아니면 DML/lock/LUW 없음.
4. **컨벤션([04 R11](04_CONVENTIONS.md))** — 스코프 접두어(전역 `gv_/gs_/gt_` · 메서드 로컬 `l*_` · `it_`=헤더라인 있을 때만) · 타입 `ts_/tt_` · 선택화면 `pa_/so_`. 기존 잔여(`ty_` 구조체·`p_/s_` 등) 이 챕터분 전환.
5. **R2(코드=체험)** — 코드가 나오는 모든 레슨(신규 포함)에 위젯. 기존 엔진 재사용 우선, 신규는 [AUTHORING](../embeds/_engine/AUTHORING.md).
6. **톤·문체([04 R3](04_CONVENTIONS.md))** — 기존 CH 본문 기준(친근·용어 첫등장 한 줄·**줄표 절제**: 본문 부연은 마침표/괄호/콜론). **AI 말투·번역투·어색·저렴 표현 금지**([[em-dash-restraint]]·[[abap-terms-english]]·[[term-declare-over-define]]).
7. **참조 = 링크**([04 R5](04_CONVENTIONS.md), raw CHxx 금지) · 코드블록은 fenced만(빌드가 code-copy-block 변환·다크 금지).

## STEP 3 — 파이프라인 (CH07～16 검증됨 · 강도 [보강])
`사실검증(두 루트[+코퍼스 얇으면 zabap_jhy]) → 게이팅(R6/R15) → REWRITE 델타 → QA 소급 대조(§2/§5/§8) → 톤·컨벤션 sweep → 위젯 리뷰(본문↔위젯 정합·다크·수평스크롤·콘솔)` → 판정 → 적용 → 검증 → 커밋.
- sed류 일괄 변경이 닿은 위젯은 **상태 유지 금지 = 전수 브라우저 재확인**([05 P3](05_PITFALLS.md)).
- 강도 [재작성]이면 이 STEP 대신 **부록 A(PHASE A 병렬 드래프팅) + 부록 B(PHASE B 수렴 루프)**.

## STEP 4 — codex 사용 원칙
- codex는 **참고**(정답 아님). 사실오류·과범위는 **있어도 배제**. 더 나은 설명/체험이 있으면 적극 채택(자체 판단+공식근거).
- 유래 오류 선례(의심하고 검증): F4 우선순위(CH09) · `CP`=Conforms(CH12) · View Cluster SM34(CH14).

## STEP 5 — 레슨 추가/분리 가드레일 (STEP 0-4가 필요하다 판단할 때, 또는 [신규장])
아래를 **모두** 통과할 때만 "과감히":
- R15 게이팅 + QA 후속 경계 준수(당겨오기 금지).
- **리넘버 리플 전수 처리**(커리큘럼 페이지 하나가 아니다): front-matter `id`/`order` · `::embed` ID · **위젯 파일 rename** · **내부 상호링크** · **외부 챕터 참조**(타 챕터 → `CHnn-Lmm`) · `foreshadow` 링크 · **09 원장 레슨 수** · `embeds/abap/_index.md`. (절차 선례 = CH16 리넘버 커밋.)
- 커리큘럼 반영 = 빌드가 `order`로 자동 + **[09_CURRICULUM_LEDGER](09_CURRICULUM_LEDGER.md) 챕터맵 수동 갱신**.

## STEP 6 — 완료 정의 · 종료 ([01 종료 체크리스트](01_AI_SYNC.md))
- **[보강]**: `npm run build:abap` 통과 + glossary parity 0 + 브라우저 검증(preview_eval: 본문↔위젯 정합·인터랙션·다크·**수평스크롤 없음·콘솔 0**) + CSS 변경 시 `node tools/gen-embed-dark.mjs` + 새 용어 glossary 등록([04 R12](04_CONVENTIONS.md)·약어 풀스펠) + **[02_PROGRESS](02_PROGRESS.md) 갱신(같은 커밋, prune-only [04 R16](04_CONVENTIONS.md))** + 브랜치 커밋·**푸시**(main 금지, `Co-Authored-By`).
- **[재작성]**: 부록 B 수렴 루프가 "연속 1라운드 무수정"으로 종료(또는 상한 도달 시 미해결 명시). 빌드/docs는 사용자 별도 단계.

---

# 부록 — 강도 [재작성] 세부 (전 트랙 대량 재생성 시에만)

> ⚠️ 전제: CH01～36 2트랙 본문은 **이미 존재**(CH04 삽입·리넘버 반영 완료) → greenfield 아님·**리넘버 단계 없음**. 골든 5종은 *품질 참조·재사용 씨앗*이지 맞출 틀이 아니다.
> 스코프: `content/abap/**.md`만 생성·수정. `docs/**`·빌드·브라우저 검증은 하지 않음(R1/P2 — docs는 사용자 최종 단계). 산출물 = 전 트랙 content MD + `check/REBUILD-REVIEW.md`(로컬 수렴 이력·커밋 대상 아님). 위젯 HTML 신규 제작 보류(본문엔 `::embed` 지시문·필요 학습수단 목록만).

## A. PHASE A — 본문 재작성 (병렬)
- **A1 파운데이션 CH01～08 (메인 스레드·순차·에이전트 X)** — 글로서리·구구단 thread·게이팅 누적의 출발점 = 연속성 필수. 기존 본문을 09+DoD 기준 업그레이드(빈 곳은 신작). 완료 후 커밋.
- **A2 병렬 드래프팅 CH09～23 + CH24～36 (에이전트 ✅·챕터 단위)** — 챕터마다 서브에이전트 1개(서로 다른 폴더 = 충돌 0). 각 에이전트 brief 필수:
  - (i) 담당 챕터 각 레슨 front-matter(introduces/prereq/prevRel/foreshadow/advanceUse) + coverage 토픽.
  - (ii) **가용 개념** = CH01～직전 `introduces` 합집합(오케스트레이터가 계산해 전달).
  - (iii) 게이팅: 가용 개념 + 자기 introduces만. 선노출 금지. foreshadow=L1·advanceUse=`[선행 사용]`.
  - (iv) 관통예제 컨텍스트(RUNNING-EXAMPLES 발췌).
  - (v) R규칙(R2/R3/R5/R6/R9/R10/R15)·front-matter 스펙·금지.
  - (vi) **출력 제약**: 자기 챕터 폴더 MD만. `glossary.json`·`02_PROGRESS` 공유파일 편집 금지 — 용어는 `[[term]]` 마킹만, 신규 글로서리·필요 학습수단은 리턴 목록으로.
  - (vii) Track-2는 [09 §E](09_CURRICULUM_LEDGER.md) 경계·중복 금지.
  - 의존: 콘서트 모델은 CH09에서 정의 → CH09 먼저 확정 후 스키마를 후속 웨이브에 전달.
- **A3 통합(메인)** — 산출 취합·`[[term]]` 수집·cross-ref grep·02 갱신·커밋.

## B. PHASE B — 전수 재검토 · 수렴 루프 (검토=에이전트 ✅ 읽기전용 / 수정=메인)
> 원칙: **수정은 파급된다** — 수정이 생긴 라운드 뒤엔 `content/abap/**` 전체를 처음부터 다시 점검. 신규 수정 0건 라운드까지 반복(수렴).
1. **전수 검토(읽기전용 fan-out)** — 챕터 묶음(5～6)마다 read-only 에이전트 1개: (a) 선노출(R15·최우선) (b) front-matter 정합·coverage 누락 (c) R6/R9/R5/R2 (d) 관통예제 연속성·cross-ref·stale.
2. **수정(메인)** — findings 반영.
3. **영향 표면 판정(필수)** — introduces/prereq 변경→하류 게이팅 재검토 · 번호/제목/foreshadow 변경→참조 레슨 전부 · 용어 변경→그 용어 쓰는 레슨 · 관통예제 변경→thread 전 레슨 · 경계(R6) 변경→CH17～19 인근.
4. **수렴 판정** — 수정 1건↑ → 라운드 R+1 전수 재검토 반복 / 신규 findings 0건 → 수렴 종료.
5. **상한·기록** — 최대 5라운드. 미수렴이면 잔여를 "미해결"로 보고. 매 라운드 `check/REBUILD-REVIEW.md`에 누적. 각 라운드 끝 커밋.

## C. [재작성] 가드레일 (위반 금지)
- docs/ 생성·빌드·브라우저 검증 안 함(R1/P2). `content/abap/**.md`만.
- R6/P7: CH01～17 본문에 인라인 `DATA()`/`VALUE`/`NEW`/`@`/`+=`/`|…|` 금지(`&&`만 CH04 예외). New Open SQL은 CH19↑.
- R9: 임의 작명 금지 → 이름 풀(1번 정훈영). R5/P10: fenced ```` ```abap ````만·다크 금지. R15/P11: 선노출 금지·CH10은 static-first(본격 OO 0).
- 제외(합의): Screen Table Control · classic 인터랙티브 리스트(`AT LINE-SELECTION`/`HIDE`/`AT USER-COMMAND`/`TOP-OF-PAGE`) → ALV 대체.
- 공유파일(glossary·02) 동시편집 금지(에이전트는 마킹/리턴만).
> `check/`는 gitignore 로컬 스크래치(프레시 클론엔 없음) — 권위 SSOT = 09 + 레슨 front-matter. 없으면 09 §C·§F·front-matter에서 재구성.
