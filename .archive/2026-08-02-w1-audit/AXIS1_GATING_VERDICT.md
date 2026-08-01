# 축1 — 순서·게이팅(R15/R6) 감사 판정 (W1)

> 산출: 2026-08-02 W1 감사. 파이프라인 = 정적 도구(`tools/audit-gating.mjs`, 신작) → 후보 추출 → 판정 에이전트 2(Opus, 141건 전수 실물 대조) → 본선 통합. **발견만 — 수정은 승인 후.**

## 결과 한 줄
**커리큘럼의 게이팅 상태는 건강하다.** 구조 검증(front-matter·prereq 그래프·R6 경계)은 전량 클린이고, 선노출 후보 141건 중 실질 위반은 **코드 3건**(동일 원인 1가지: `START-OF-SELECTION` 선행 사용 미관리), 다듬을 경계 10건뿐이다.

## 도구 결과 (전수 정적 검사 — 재생성: `node tools/audit-gating.mjs`)
| 검사 | 결과 |
|---|---|
| STRUCT (필수키·id↔파일명, 270레슨) | **0건** |
| PREREQ (실존·전방 참조, 전 선언) | **0건** |
| **R6 경계** (CH01～17 코드 블록의 modern 토큰 · ～CH18 New Open SQL 토큰) | **0건** — classic-first 규율 전면 준수 실측 |
| DUP-INTRO | 8건 → 본선 판정: 위반 0(나선 4·동음이의 2·인접 세분화 2) |
| EARLY-USE 후보 | 290건 → 자동 3분류: REVIEW 141 · LOW(챕터 내 인접) / DECLARED(선언된 예고) 149 |

## EARLY-USE 141건 판정 집계 (에이전트 2 전수 실물 대조)
| 등급 | 전반(CH01～15) | 후반(CH16～39) | 계 |
|---|---|---|---|
| **[위반-코드]** | 3 | 0 | **3** |
| [위반-설명] | 0 | 0 | **0** |
| [경계] | 4 | 6 | **10** |
| [허용-L1] | 44 | 51 | 95 |
| [오탐] | 23 | 10 | 33 |

특별주의 2건 해소: `COMMIT WORK`(CH16-L10) = 산문 예고뿐(코드 0) · `CL_GUI_FRONTEND_SERVICES`(CH33-L04) = 그 레슨이 `gui_upload`를 자기 범위로 도입 선언 — 학습순서 성립(원장 정리만 권고).

## 조치 목록 (승인 시 실행 — 전부 소규모)

### A. 위반-코드 3건 — `START-OF-SELECTION` (원인 동일)
CH01～09 리포트는 이벤트 라벨 없이 돌았고(암묵 블록), FORM이 등장하는 CH10부터 구조적으로 처음 필요해져 코드에 쓰였는데 정식 도입 선언은 CH15-L05다. 선행 사용 관리 누락.
1. CH10-L01 — `[선행 사용]` 콜아웃 1개(챕터당 1회) + `advanceUse: ["START-OF-SELECTION"]`
2. CH10-L02 — `advanceUse` 선언만 추가
3. CH11-L04 — 기존 advanceUse 배열에 `"START-OF-SELECTION"` 추가

### B. 경계 10건 (본문 소수정 또는 front-matter 선언)
4. CH12-L07 — advanceUse에 `"TABLES"` 추가(코드 실사용, CH12-L02가 이미 L2 처리)
5. CH15-L09 — `advanceUse: ["TABLES"]` 신설 + `TABLES sscrfields.` 옆 한 줄 안내
6. CH15-L04 — details "고급 맛보기"의 `ON BLOCK`/`ON RADIOBUTTON GROUP` 문법 골격을 이름 나열로 강등(L1화) — 2건 일괄
7. CH16-L02 — Flow Logic 골격 코드(`PROCESS BEFORE OUTPUT/AFTER INPUT`)를 CH16-L01~02 introduces에 "골격 개요"로 선언(본문 무수정) — 2건 일괄
8. CH24-L01 — 확인 체크리스트의 BDEF/SDL 문법 조각 2건에 "모양만 — 정식은 L04/L06" 부기
9. CH24-L09 — `foreshadow: ["EML 개념 지도(MODIFY/COMMIT/ROLLBACK ENTITIES)"]` 선언 추가(본문 경계 콜아웃은 기존재)
10. CH33-L04/CH37-L04 — introduces 상호 정리(`gui_upload` 명시 ↔ CH37은 `gui_download`로 좁힘)

### C. 도입 원장(introduces) 정리 — 도구 오탐 제거 겸 R15 "개념당 한 곳" 정합
- 중복/귀속 오류 5건: `offset`(CH02-L03이 정본, CH04-L02에서 제거) · `Value Table`(CH03-L01 정본 — CH09-L02는 "FK와의 관계"로 개명) · `NULL`(CH08-L05 "IS NULL" 정본) · `provider contract transactional_query`(CH24-L03이 실제 L3 — CH39-L03은 재방문이므로 제거) · `ASSIGN`(CH28-L03이 정본 — CH28-L05는 "ASSIGN (name) 동적 이름"으로 이미 구분됨, 도구 매칭만 조임)
- 경미 2건: CH06-L01 `Work Area`·CH15-L01 `INITIALIZATION` — introduces → prereq/foreshadow 이동

### D. 부수 발견 (게이팅 밖 — 별도 처리 후보)
- **링크 라벨↔href 챕터번호 불일치 4건**(구번호 잔재): CH09-L09 "Chapter 23 · RAP"→CH24 · CH14-L02/L08 "Chapter 22"→CH23 · CH10-L05 "Chapter 20"→CH21 · CH10-L03 "Chapter 30"→CH33. *리넘버 이전 라벨이 본문에 남은 패턴 — 전수 grep으로 일괄 교정 가치.*
- **챕터 내 순서 역전 1건**: CH15-L08(검증 예제가 라디오 파라미터 사용) ↔ 그 도입은 CH15-L09. L08/L09 순서 교환 또는 예제 소재 교체 검토.
- **링크 대상 정밀도(R5) 3건**: CH08-L05·CH11-L06("SELECT-OPTIONS"인데 CH12-L01 Range로) · CH08-L07("MESSAGE"인데 CH15-L05로 — 실도입 CH15-L04).

### E. 도구 개선 백로그 (`tools/audit-gating.mjs` v2)
- 동음이의 제외 규칙 4쌍: `TABLES`(함수 파라미터/Dynpro WA) · `Method`(Selection Method) · `CHECKBOX`/`RADIOBUTTON GROUP`(PARAMETERS 애드온/화면요소) · `.INCLUDE`/`.APPEND`(DDIC/내부테이블·SIGN)
- introduces 키워드 매칭을 접두 포함 → 정확 일치로 조임(ASSIGN 계열 오탐 2 제거)
- C항 원장 정리 반영 시 오탐 추가 감소 — 최종 오탐률 33/141 → 한 자릿수 목표
