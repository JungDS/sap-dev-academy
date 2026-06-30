# DOC VERIFICATION SCORECARD — `.project-docs` 00~14

> 📅 baseline 측정: 2026-06-30
> ♻️ **재생성물(re-runnable).** 측정 원형 = `scratchpad/phase0.cjs`(기계/링크/ID/토큰) + 분석단계(L4/L3/L2) 산출. 정착 시 `tools/lint-project-docs.mjs`로 이관.
> 🎯 우선축 = **②내구 · ⑦측정 · ③독자적합.** 파이프라인 = **L4 red-team → L3 SSOT → L2 의미 → 내구 하드닝.**
> 🧭 목표: 문서 품질을 *일회성 판정*이 아니라 *추적 가능한 수*로. "검증됨" = 아래 target 충족.

## 스코어카드
| 지표 | 축 | baseline | target | 상태 |
|---|---|---|---|---|
| M 기계계열(틸드·번호·stale수치·embed잔재) | ②⑦ | **0** | 0 | ✅ |
| S1 내부 링크·경로 실(實)미스 | ②③ | **0** (FP 1 별도) | 0 | ✅ |
| S2a 안정ID dangling(R>16·P>11) | ② | **0** | 0 | ✅ |
| R2 auto-load 부팅셋 크기 | ③① | **~16.5K자** (15.9K + V3 라우터 ~0.6K) | 상한 재합의 | ⚠️ V3로 +0.6K |
| D1 중복면 | ② | _Phase2_ | 0(또는 정당화) | ⬜ |
| D2 orphan / D3 포인터 비대칭 | ② | **0** (전 정본선언 실소유 일치 · P0 링크 0미스) | 0 | ✅ |
| D4 비반증 주장 | ②⑦ | _Phase3_ | 0 | ⬜ |
| R1 point-of-use 갭 / R3 매몰규칙 | ③ | _Phase4_ | 0 / 최소 | ⬜ |
| C1 추측 / C2 모순 / C3 놓친구속 (red-team) | L4 | **raw A12·B7·C12(31건) → triage 유효 V1～V6** | 0 | ✅수집 |
| D5 lint 커버리지 | ②⑦ | 0% | 기계계열 100% | ⬜ |

## Phase 진행
- **Phase 0 계측** ✅ — baseline 상세 아래.
- **Phase 1 L4 red-team** ✅ — T1 A6·B3·C6 · T2 A4·B4·C5 · T3 A1 · T4 A1·C1. **Triage 완료**(아래 synthesis): 유효 V1～V6 · false/by-design/already-fixed 4건 분리.
- **Phase 2 L3 SSOT(빠른확인)** ✅ — 정본/SSOT 선언 *비대칭 0* · 경계진술 전 문서 일관. **신규 V7**(경계 5중 복창=잠재 D1). · **Phase 3 L2** ⬜(B-lite로 생략) · **Phase 4 독자적합** ⬜(V3가 대표) · **Phase 5 lint** ⬜.

## lint 밴드 (Phase 5 사양 — 확정)
- **FAIL(게이트):** 기계계열 + S1 링크/경로 · S2a 안정ID · R2 토큰예산 · S3b 구조불변식(타임스탬프·헤딩·번호연속+allowlist).
- **WARN(자문):** 6 포인터 비대칭 · 8 point-of-use.
- **제외:** 7 중복면. **MANUAL(L2·L4):** 9 제목↔본문 정합.
- ⚠️ **S1 정제 TODO:** 플레이스홀더 링크(`CHnn-Lmm.html`·`Lnn`·`Snn` 등 예시 토큰)는 실링크 아님 → allowlist로 제외.
- ⚠️ **세션refs 정제 TODO:** 체인 참조(`08 §9·§10`의 `§10`)도 파싱하도록 정규식 보강.

## Phase 0 baseline 상세
- **S1 링크:** 134개 검사, 실미스 0. (1 FP = `04 R5`의 `[..](CHnn-Lmm.html)` *링크 형식 설명용 플레이스홀더* — 실링크 아님.)
- **S2a ID:** R-ref max 16(정의 일치)·dangling 0 / P-ref max 11·dangling 0. cross-doc §refs = `08§8 08§9 14§5` 전부 유효.
- **R2 부팅셋:** README 710 · 00 2,325 · 01 2,481 · **04 7,054(약 44%)** · 05 2,341 · CLAUDE 996 자. → **04가 절반.** 예산선 결정 필요(③ vs 커버리지 트레이드오프).
- **M 기계계열:** 0.

## Phase 1 synthesis (triaged) — red-team 31건 raw → 유효 6
**헤드라인 패턴:** 부팅 컨텍스트는 *가드레일·단일레슨 DoD*엔 잘 맞으나, **생성/프로세스 지식**(체험을 *어떻게 만드나* · 다중레슨 리빌드를 *어떻게 돌리나*)이 부팅 밖(on-demand 문서·gitignore된 `check/`·`embeds/_index.md` tribal 주석)에 있어 신선 에이전트가 *그럴듯하나 비준수*인 산출을 낸다. → 정확히 ②③④ 군집(택한 우선축과 일치).

### 유효 결함
- **V1 · embed 위젯 *집필 계약* 부재** [④③] (T1#1,2,3,15·T2#3) — 새 위젯 제작법(`_engine` 소비·`*_CFG` 주입·높이·`Snn`·다크 교훈3/4)이 어느 `.project-docs`에도 없음 → `embeds/_index.md` 주석 tribal. **최대 구멍.**
- **V2 · `check/` gitignore인데 10이 필수 SSOT 입력+산출로 참조** [②] (T2#1 *실측확정: `.gitignore:24`*) — 프레시 클론은 리빌드 불가.
- **V3 · 리빌드/집필 *프로세스* 구속이 부팅 미도달** [③R1] (T1#10-14·T2#9,11,12,13) — 수렴루프·게이팅 front-matter 합집합 계산·T코드 prose 금지·텍스트-only 보강·glossary/02 편집금지가 08/09/10/14에만.
- **V4 · 10 골든-5 프레이밍 내부 모순 + 08 §9 reframe와 어긋남** [L2] (T2#8 *확정*) — 10 L5/L44 "골든5 *기준*" vs L94 "*씨앗*이지 틀 아님"·08 §9 "양산 미실현". **08 수정의 미전파.**
- **V5 · `track` 리터럴 `TRACK-01` 미문서화** [④] (T2#7 *확정: 스키마=`TRACK-01`, 09 라벨="Track-1"*) — front-matter 재생성 시 build join 파손 위험.
- **V6 · 사실검증 규율이 "참고 루틴"으로 약하게 프레이밍** [③] (T4·T1#12·T2#12) — 14 §5 구속인데 01 지목이 soft.
- **V7 · classic↔modern 경계가 04/05/09/10/14에 5중 복창** [②잠재D1] (Phase2) — 현재 전부 일치하나 *이미 P7로 1회 드리프트*. R6=home, 타 문서는 CH숫자 재타이핑 대신 "경계=R6" 포인터로 축소 권장.

### Triage-out (수정 불요)
- P7 "stale" (T2#6) — **이미 수정됨**(현재 "CH01～17 classic·CH19+ modern" 정확). 경보 출처 = gitignore된 `check/REBUILD-REVIEW.md`의 옛 메모(→ V2의 부작용).
- 14 코퍼스 2경로 (T2#5) — by-design(L6이 "기존 HTML 덤프 vs 확장 코퍼스"로 구분·화해). 선택적 명료화만.
- 09가 레슨별 상세를 front-matter에 위임 (T1#8) · net-new 경로 부재 (T1#7, CH05-L02 기존재) — by-design / 과업 프레이밍 산물.

### 메트릭 환류
- R1 point-of-use 갭(③) ⊇ V3·V6 · D2/D3(②) 후보 = V2·V4 · ④커버리지 = V1·V5. → Phase 2/4에서 정량 확정.
- T3 = 가드레일 부팅 도달 **양호**(긍정 baseline).

## 수정 적용 — V1~V7 (2026-06-30)
- **V1** ✅ — `embeds/_engine/AUTHORING.md` 신설(위젯 집필 계약: 해부·config 주도·높이·**3층 다크+`gen-embed-dark.mjs`**·Snn·`_index.md` 등록). 포인터 = 01 라우터·03·06·08 §10.
- **V2** ✅ — 10 §1: "`check/`=gitignore 로컬 스크래치 · 권위 SSOT=09+front-matter · 없으면 재구성 · REBUILD-REVIEW=로컬 이력" 명시.
- **V3** ✅ — 01: "작업유형 → 필독 진입문서" 라우터 신설(집필/리빌드/셸 각 on-demand 구속 문서 라우팅).
- **V4** ✅ — 10 L5/L44 "골든5 기준" → "참조·재사용 씨앗"(08 §9·§3.5 정렬).
- **V5** ✅ — 04 R10 `track` 리터럴 `TRACK-01`/`TRACK-02` 명문화 + 09 "Track-1/2=표시 라벨" 주석.
- **V6** ✅ — 01 사실검증 "참고 루틴" → "필독 루틴(선택 아님)".
- **V7** ✅ — 09 §B의 R6 verbatim 불릿 → 메커니즘 포인터로 축소(09 New Syntax 중복 0). P7/10/14는 이미 R6 인용·문맥별 고유 → 유지.
- **검증:** S1 링크 148개 실미스 0(FP 1=`CHnn-Lmm.html` placeholder) · AUTHORING.md 경로 4/4 실존 · ID dangling 0.
- **남은 것:** Phase 5 **lint(`tools/lint-project-docs.mjs`) 미착수**(seed=`scratchpad/phase0.cjs`) · S1 placeholder allowlist · D5 lint 커버리지 0%.
