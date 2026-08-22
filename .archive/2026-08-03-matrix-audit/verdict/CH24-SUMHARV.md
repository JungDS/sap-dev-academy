# CH24 수합·표본검증 원장 (SUMHARV)

> 최종수정: 2026-08-22 KST · 작성 = AG10 수합자(Fable 5, 판정층 — 블라인드 비적용)
> 입력 = `.archive/2026-08-03-matrix-audit/raw/CH24/*.json` 28/28벌(결측 0 · gemini 7벌은 봉투 `structured_output` 파싱 · 나머지 직접 스키마 · 파싱 실패 0)
> 실측 = `content/abap/CH24/*.md` 10파일 전문 + `embeds/_engine/`(rap-layer-assembler·root-entity-picker·projection-contract-checker·behavior-pool-tracer·cloud-readiness-judge·rap-booking-runtime) + `reference/glossary.json` + 오프라인 코퍼스(ABENBDL_*·ABAPIN_LOCAL_MODE·ABENCDS_DEFINE_VIEW_ENTITY)
> **판정 확정은 본선 몫 — 이 문서는 수합·검증·추천까지만.**

---

## §1 수거·등급 매트릭스 (7종×4모델)

| AG | opus | sonnet | gpt-5.6-sol | gemini-3.7-flash-high |
|---|---|---|---|---|
| AG01 은서(입문자 통독) | 17 · 경미 수정 (높1) | 7 · 경미 수정 (높2) | 8 · **보강 권장** (치1·높5) | 10 · 경미 수정 |
| AG02 준호(체험 대조) | 8 · 경미 수정 | 3 · 경미 수정 (높1) | 4 · **보강 권장** (높2) | 3 · 경미 수정 |
| AG03 경력자 | 6 · 경미 수정 | 6 · 경미 수정 | 6 · **보강 권장** (높1) | 7 · 경미 수정 |
| AG04 교열 | 23 · **보강 권장** (높2) | 7 · 경미 수정 (높1) | 7 · **보강 권장** | 10 · 경미 수정 |
| AG05 교수설계 | 9 · **보강 권장** (높1) | 4 · 경미 수정 | 5 · **보강 권장** (높2) | 7 · **보강 권장** |
| AG06 아키텍트 | 9 · **보강 권장** (높1) | 2 · 경미 수정 (높1) | 5 · **보강 권장** (높3) | 5 · **보강 권장** (높2) |
| AG09 정적 검사 | 4 · 경미 수정 | 0 · 유지 | 0 · 유지 | 2 · 경미 수정 |

- 수거 **184발견/28벌** (opus 76 · gemini 44 · gpt 35 · sonnet 29). errors 기록 2건(AG02-gpt: localhost 접근 거부 → 소스 정독 대체 · AG02-sonnet: Browser pane 좌표 stale → DOM .click() 전환, 신뢰도 유지 선언).
- 심각도 분포: **치명 1**(AG01/gpt — C001 소속) · **높음 25** · 중간 86 · 낮음 72.
- 등급 의견: 유지 2 · 경미 수정 15 · 보강 권장 11 · 재집필 0.
- AG02 검증 수단: opus/sonnet/gemini = 브라우저 실조작(Playwright·DOM 클릭) · gpt = 소스 정독+Node 구문 검사.

---

## §2 클러스터 전량 (79클러스터 / 184발견 전량 귀속)

표기 — 수렴도: `n벌(모델)`. 검증: **[실측 확인]**(원문/코드/코퍼스로 전제 성립) / **[실측 반박]** / **[미확인]**(표본 검증 밖). 추천: 채택/기각/보류 + 한 줄 근거. 심각도 = 구성원 최고값, 확신 = 구성원 최저값.

### A. 구조·최중량 (다중 수렴)

**C001 · [챕터 관통] projection BDEF(ZC_Booking behavior) 전면 부재** — 치명(1)·높음(5) / 확실·일부 추정
- 수렴 **9벌**: AG01/gpt#7(치명), AG02/gpt#1, AG03/gpt#1, AG03/opus#1, AG05/gpt#1, AG06/gemini#3, AG06/gpt#1, AG06/opus#1, AG09/opus#1 — 4계열 중 3계열(opus·gpt·gemini) 합류, 7종 중 6종 교차. **본 챕터 최중량.**
- 대표 quote: "제시된 BDEF는 모두 `ZI_Booking`에만 연결된다. `ZC_Booking`을 위한 projection behavior와 create·update·delete·action의 사용 선언이 없는데도 마지막 체크리스트는 서비스에서 `cancel`이 노출된다고 기대한다."(AG01/gpt)
- 요지: L01 계층도/표(6계층)·L04·L09 BDEF·L09 산출물 표 어디에도 `projection; define behavior for ZC_Booking … use create/update/delete/use action cancel;`이 없다. 이대로면 ZC_Booking 서비스는 조회 전용 — L09 체크리스트의 "Booking 목록·`cancel` action 노출" 기대와 자기모순. L01 조립 보드(위젯)도 이 계층 없이 "완성" 판정(AG02/gpt 각도).
- **[실측 확인]** L01:30～49 계층도·표 6계층뿐, L09:20～27 산출물 6단계뿐, L09:44 BDEF는 `define behavior for ZI_Booking`뿐, L09:116 "cancel action 노출" 기대 실재. **코퍼스 부합**: `ABENBDL_USE_PROJECTION` — "The keyword use allows the reuse of … RAP BO operations **from the base BDEF in a projection BDEF**" + `ABENBDL_PROJECTION_BO:18`(projection BDEF가 base behavior의 부분집합을 노출).
- 추천: **채택** — 코퍼스가 메커니즘을 직접 뒷받침하고 챕터 내부 기대(체크리스트)와 자기모순. 최소 수선(L03 또는 L06에 use 선언 4줄 + L01 계층표·L09 산출물 표 1행 추가)이 9벌의 제안 공통분모.

**C002 · [L09:47] BDEF mapping 6필드→1필드 축소(표시 없음)** — 높음(1)·중간 / 확실～추정
- 수렴 **10벌**(최다): AG01/gemini#8, AG01/opus#15, AG01/sonnet#7, AG05/gemini#7, AG05/opus#7, AG05/sonnet#4, AG06/gemini#2(높음·확실), AG06/opus#7, AG06/sonnet#2, AG09/opus#3 — 4계열 전부.
- 요지: L04:40～48은 6필드 전부 mapping + "눈으로 확인하는 편이 안전" 교육, L09:47은 `mapping for zbooking { booking_id = booking_id; }` 한 줄. 생략 주석 없음(behavior pool 골격에는 생략 표시가 있어 대비됨).
- **[실측 확인]** 두 원문 대조 그대로. **단 사실 주장 분화**: AG06/gemini "기재 안 된 필드는 DB에 저장 안 됨/활성화 오류"(높음·확실), AG09/opus "명시 블록은 나열분만 대응" — **[실측 반박(코퍼스)]** `ABENBDL_TYPE_MAPPING:28` "If the names of the fields … are exactly the same, **no mapping is required**. Otherwise, it is mandatory (**syntax check warning**)" — 이름 전부 동일한 본 예제에서 mapping 자체가 선택이고, 공식 데모(`ABENBDL_ABSTRACT`의 DEMO_CDS_DEEP_PARAMETER)도 이름 다른 필드 1개만 부분 mapping. 미기재=미저장 단정과 '오류' 단정은 근거 없음(경고 사안도 이름 불일치 시).
- 추천: **채택(교육 일관성 결함으로)** — L04와의 자기 불일치·무표시가 실결함. 교정은 6필드 복원 또는 `corresponding;`(코퍼스 표준형) — 단 "미저장/오류" 서술을 근거로 삼지 말 것.

**C003 · [L05:63·72] EML 약어 무풀이 선사용(정식 풀이는 L09:84)** — 높음 / 확실
- 수렴 **8벌**: AG01 4모델 전원(#5/#4/#10/#1), AG04/gemini#5, AG04/opus#15, AG04/sonnet#5, AG05/gemini#2.
- 요지: `loop 안 EML`·`loop 안 EML 금지`가 L05에 무풀이·무마킹 등장, EML(Entity Manipulation Language) 정식 도입은 4레슨 뒤. front-matter도 이 노출을 foreshadow로 선언 안 함(AG04/sonnet 각도). anti-pattern도 무풀이 동반.
- **[실측 확인]** L05:63·72 마킹·풀이 없음, L09:84 `[[EML]](Entity Manipulation Language)` 정식, glossary 등재 확인. R15 게이팅상 L2/L1 표시 없는 선노출.
- 추천: **채택** — 첫 사용 자리 괄호 한 줄+예고(또는 약어 회피)로 해소, 8벌 제안 일치.

**C004 · [L05:53] transactional buffer 무풀이·무마킹 선노출(풀이는 L09:81)** — 높음 / 확실
- 수렴 4벌: AG01/opus#9, AG01/sonnet#2(높음), AG04/opus#14, AG04/sonnet#4(높음).
- **[실측 확인]** L05:53 평문(마킹 없음) → L07:63 `[[ ]]` 마킹만 → L09:81 인라인 풀이. 첫 등장·풀이 순서 역전 실재. glossary 항목은 존재.
- 추천: **채택** — L09의 괄호 풀이를 L05 첫 등장으로 앞당기고 최소 `[[ ]]` 마킹.

**C005 · [L05:30] `Booking~validate_capacity`의 BDEF 선언 부재(선언은 L07:34에 첫 등장)** — 높음 / 확실
- 수렴 5벌: AG01/gpt#2(높음), AG01/sonnet#3, AG05/gemini#3, AG05/opus#2, AG09/opus#2.
- 요지: L04 BDEF에는 create/update/delete·field·mapping뿐 validation 선언이 없는데 L05 handler가 그 이름을 참조 — "method 이름이 BDEF 선언과 맞아야 연결"(L05:70) 자기 서술과 어긋나는 앵커 단절. 순서대로 따라 만들면 활성화 오류(AG09/opus 각도).
- **[실측 확인]** L04:34～48 validation 없음 · L05:30 참조 실재 · L07:34 첫 선언.
- 추천: **채택** — L05 코드 위에 대응 BDEF 1줄을 `[선행 사용]`으로 병기(+정식은 L07 안내)가 공통 제안.

**C006 · [L05↔L07] validation 구현이 V/D/A 개념 도입(L07)보다 선행 — 순서 역전** — 높음 / 확실
- 수렴 3벌: AG05/gpt#2, AG05/opus#1(높음), AG05/sonnet#2. (C005와 동전의 양면 — C005는 코드 앵커, 이쪽은 개념 순서.)
- **[실측 확인]** L05 유일 예제=validation handler, determination·action 용어도 L05:80～81에 무예고 사용, V/D/A 정식은 L07(introduces 선언 일치). AG05/opus는 재배치까지, sonnet은 "한 문장 예고"만.
- 추천: **채택(경량안)** — 레슨 재배치는 리스크 큼. L05 도입에 "세 갈래 중 검증 하나를 표본으로, 구분은 L07" 1～2문장 위치 안내(3벌 공통 최소안)로.

**C007 · [L05:27～45] 인지 과부하 — 한 예제에 신개념 약 10개** — 높음 / 확실 — 1벌: AG01/opus#8.
- **[실측 확인]** lhc_ 접두어·상속·FOR VALIDATE ON SAVE·`~`·keys·READ ENTITIES·IN LOCAL MODE·WITH CORRESPONDING·buffer·failed/reported 전부 이 레슨 첫 등장 사실. 과부하 여부는 판정 재량.
- 추천: **보류(본선)** — C003～C006 채택 시 상당 부분 완화. 표에 "지금 꼭/나중에" 구분 제안은 채택 가치 있음.

### B. 약어·핵심 용어 무풀이 (수렴 중)

**C008 · [L04:64·84] BDL 약어 무풀이(원어 부재)** — 중간 / 확실 — 4벌: AG01/gemini#3, AG01/opus#6, AG04/gemini#4, AG04/opus#10. **[실측 확인]** grep상 챕터 내 BDL 등장 2회 모두 무풀이, BDEF는 성실히 풀어 대비. 추천: **채택** — 첫 등장에 "BDL(Behavior Definition Language — BDEF를 적는 전용 문법)".

**C009 · [L06:22] SDL 약어 무풀이** — 중간 / 확실 — 5벌: AG01/gemini#7, AG01/opus#12, AG04/gemini#6, AG04/opus#16, AG04/sonnet#6. **[실측 확인]** 유일 등장·무풀이(glossary의 Service Definition 항목에는 SDL 원어 있음 — 본문만 공백). 추천: **채택**.

**C010 · [L01] OData·Fiori Elements 무풀이(마킹은 L06부터)** — 중간 / 확실 — 4벌: AG01/opus#1, AG01/sonnet#4, AG04/gpt#1, AG04/sonnet#1. **[실측 확인]** L01:20·31·33·49 무마킹·무풀이, `[[OData]]` 첫 마킹 = L06:14. glossary OData 항목 존재(풀이 양호) — 첫 등장 위치만 어긋남. 계층도 맨 위 두 이름이 계층 표(6행)에 없다는 세부도 사실. 추천: **채택** — L01 첫 등장 마킹+한 줄 풀이.

**C011 · [L03:49～51] composition tree 무풀이 + 표준문서 직역 톤** — 높음 / 확실～추정 — **7벌**: AG01/gemini#2, AG01/opus#4, AG01/sonnet#5, AG04/gpt#2, AG04/opus#7(높음), AG04/sonnet#2, AG05/opus#6. **[실측 확인]** 챕터 전체에서 단 1회 등장(grep), 무풀이. 같은 레슨 L03:63 'projection tree'와의 관계 불명(AG04/sonnet 각도)도 실재. 추천: **채택** — 문단을 root-1 구조 기준 일상어로 재서술+괄호 풀이.

**C012 · [L03:73] "runtime-specific syntax check를 기대하기 어렵다" 직역·무풀이** — 중간 / 확실 — 2벌: AG01/opus#5, AG04/opus#8. **[실측 확인]**. 추천: **채택** — 결과를 우리말로("활성화 때 이 시나리오 검사를 못 받는다").

**C013 · [L03:46] provider contract 풀이가 더 어려운 말("transactional query 시나리오")** — 높음 / 확실 — 2벌: AG01/gpt#1(높음), AG04/opus#6. **[실측 확인]** 표 풀이가 미정의 용어 재귀. glossary 항목은 양호 — 본문 표만 결함. 추천: **채택**.

**C014 · [L04:59] lock master 순환 정의("lock master임을 선언한다")** — 중간 / 확실 — 3벌: AG01/opus#7, AG04/gpt#4, AG03/gemini#3(용어충돌 각도 — 분산 락 마스터 오해). **[실측 확인]**. 추천: **채택** — "동시 수정을 막는 잠금의 기준 entity" 한 줄.

**C015 · [L04:89～90] enqueue/dequeue 용어 선노출(CH26 예고 안에서)** — 낮음 / 확실 — 1벌: AG01/gemini#4. **[실측 확인]** 문구 실재 — 단 L1 예고(링크+이름) 형식 안이라 게이팅 위반은 경미. 추천: **보류(본선)** — "classic 잠금"으로 순화 여지만.

**C016 · [L07:25] Validation 실행 시점 칸이 save sequence 단독(무 인라인 풀이)** — 중간 / 확실 — 4벌: AG01/opus#14, AG04/gpt#5, AG04/opus#18, AG05/opus#5. **[실측 확인]** 표 칸 = `[[save sequence]]`뿐 — 단 **glossary 팝업은 실재·풀이 충실**(수합자 실측: desc에 COMMIT ENTITIES 트리거·all-or-nothing까지). 인라인 0은 사실. 추천: **채택(경량)** — 칸을 "저장 확정 직전(save sequence)"로 병기. 발견자들의 "챕터 어디에도 풀이 없음" 서술은 팝업 존재로 과장.

**C017 · [L07:62～63] "validation 실패는 transactional buffer를 거부할 수 있으므로" 비문** — 높음 / 확실 — 2벌: AG04/gemini#8, AG04/opus#19(높음). **[실측 확인]** 거부 대상은 buffer가 아니라 저장(save) — L09:89의 정확한 서술과 대비. 추천: **채택**.

### C. 위젯 (AG02 계열)

**C018 · [L09 위젯 rap-booking-runtime] 체크리스트 '중복 취소' 도달 불가 — dup 분기가 죽은 코드** — 중간 / 확실
- 수렴 **4벌(AG02 전 모델)**: AG02/gemini#1, AG02/gpt#4, AG02/opus#2, AG02/sonnet#3. opus·sonnet은 브라우저 실측 재현.
- **[실측 확인]** `rap-booking-runtime.js:42` `(c?' disabled':'')` + `:82` `if(!b||b.disabled) return;` — `:27` dup 분기·`:76` "이미 취소된 예매입니다…no-op/실패 정책" 메시지가 UI로 도달 불가. 본문 L09:115 체크리스트는 실행 지시.
- 추천: **채택** — disabled 해제해 dup 분기 노출(준비된 메시지 활용) 또는 체크리스트 행 표기 수정. 전자가 4벌 다수안.

**C019 · [L08 위젯 cloud-readiness-judge] c1 카드 "표준 테이블 ZBOOKING" 오칭 + 판정 근거 오류** — 높음 / 확실
- 수렴 3벌: AG02/gemini#2, AG02/gpt#3(높음), AG02/opus#1.
- **[실측 확인]** `cloud-readiness-judge.js:7～8` — ZBOOKING은 이 챕터가 학습자 소유 Z 테이블로 쓰는 대상(L02:35 `as select from zbooking`). "표준 테이블"·"비released 테이블 직접 수정=Clean Core 위반" 근거는 자기 테이블에는 성립 안 함 — 다음 챕터(CH25)가 이 테이블 직접 DML을 가르치는 것과도 충돌.
- 추천: **채택** — 카드 대상을 실제 SAP 표준 객체로 교체하거나 판정 근거를 "RAP buffer/save sequence 우회"로 교체(3벌 공통 양자택일).

**C020 · [L02 위젯 root-entity-picker] '회차' 선택 시 concert_id·perf_no가 key와 일반 필드로 중복 출력** — 높음 / 확실
- 수렴 3벌: AG02/gpt#2, AG02/opus#4, AG02/sonnet#1(높음, 렌더 실측).
- **[실측 확인]** `root-entity-picker.js:53～58` — perf fields=`['concert_id','perf_no','perf_date']`, 기본 keyf=`'concert_id, perf_no'` → key 2줄+동일 필드 재출력. 활성화 불가 형태의 CDS를 예시로 노출.
- 추천: **채택** — fields에서 key 중복 제거(1줄 수정).

**C021 · [L01 위젯 rap-layer-assembler] 빠진 계층 라벨 `split(' ')[0]` — Service Definition/Binding 둘 다 "Service"** — 중간 / 확실 — 2벌: AG02/gemini#3, AG02/opus#8. **[실측 확인]** `rap-layer-assembler.js:55`, LAYERS nm 실측상 'Service Binding'/'Service Definition'/'Behavior Pool'이 잘림. "어느 계층이 빠졌나"가 핵심인 위젯에서 식별 불가. 추천: **채택** — `l.nm` 전체 출력.

**C022 · [L09 위젯] buffer→COMMIT 단계 부재 — 본문 EML 절이 세운 2단계 모델을 위젯이 반증** — 중간 / 확실 — 1벌: AG02/opus#3(실측: 타임라인 create→det→val→save 저장 성공, buffer/commit 노드 0). **[실측 확인]** 본문 L09:94 "MODIFY 직후 SELECT하면 아직 안 보일 수 있다"와 위젯 즉시 저장 표시의 긴장 실재. 추천: **채택(경량)** — 타임라인 끝에 buffer→COMMIT 노드/문구 추가. (위젯 헤더 주석 "EML 심화 보류"가 본문 개정 이전 상태 — 본문이 앞서 나간 사례.)

**C023 · [L05 위젯 behavior-pool-tracer] READ 결과 표에 entity에 없는 remaining 컬럼** — 낮음 / 확실 — 1벌: AG02/opus#5. **[실측 확인]** `behavior-pool-tracer.js:34` — ZI_Booking 6필드에 remaining 없음(L02:37～42), 본문 FIELDS 목록에도 없음. 추천: **채택** — remaining을 "회차 조회" 별도 출처 라벨로 이동.

**C024 · [L03 위젯 projection-contract-checker] 기반 ZI에 본문에 없는 created_by 7번째 필드** — 낮음 / 확실 — 1벌: AG02/opus#6. **[실측 확인]** `projection-contract-checker.js:9`. L03 본문 lead(감사 필드 숨김 시나리오)를 위한 의도적 추가로 보이나 본문 L02 모델과 불일치는 사실. 추천: **채택(경량)** — 위젯 lead에 "감사 필드는 예시로 덧붙임" 1줄(또는 본문 L02에 필드 추가 — 본선 선택).

**C025 · [L03 위젯] ZI 코드 마지막 필드 뒤 쉼표(활성화 불가 모양)** — 낮음 / 확실 — 1벌: AG02/opus#7. **[실측 확인]** `:34` ZI는 항상 `,` 부착 vs `:46` ZC는 마지막 생략 — 비대칭 실재. 추천: **채택**(1줄).

**C026 · [L02 위젯] "root를 공연로 두면" 조사 오류** — 낮음 / 확실 — 1벌: AG02/sonnet#2. **[실측 확인]** `root-entity-picker.js:35·64` '로' 하드코딩 — '공연'+로. 추천: **채택**(받침 판정 또는 문구 우회).

### D. 기술 사실·위험 생략 (AG06 계열)

**C027 · [L02:33·L03:26] `#NOT_REQUIRED` 무경고 + 챕터 전체 권한 개념 0** — 높음 / 확실
- 수렴 4벌: AG03/gpt#6, AG06/gpt#2(높음), AG06/opus#2, AG06/sonnet#1(높음).
- **[실측 확인]** 두 레슨 코드에 실재, L02 읽는 순서 표(48～54)는 이 줄만 건너뜀(AG01/opus#3 = C068 인접), BDEF에 authorization 선언 0, L08 포함 챕터 전체에 권한 언급 0. 코퍼스 데모(`ABENBDL_ACTION1_ABEXA`)는 `authorization master (global)`을 표준 골격으로 동반 — 대비 실재. 단 `#NOT_REQUIRED` 자체는 SAP 데모도 쓰는 학습 관례.
- 추천: **채택(L1 콜아웃)** — "학습용 단순화, 실무는 #CHECK+DCL·authorization master(후속 장)" 1～2문장. 4벌 공통 최소안.

**C028 · [L02·L09] 정원 검증의 동시 세션 경합 한계 미언급(Booking lock으로는 초과 예매 못 막음)** — 높음 / 확실
- 수렴 3벌: AG03/gpt#2, AG06/gpt#3(높음), AG06/opus#5.
- **[실측 확인(전제)]** lock master = Booking root(L04:32) — 서로 다른 booking 인스턴스 간 잠금 없음은 RAP 일반 원리로 타당. L09:122 흔한 실수가 집계 범위만 짚고 경합은 침묵 — 사실.
- 추천: **채택(L1 한 줄)** — "동시에 두 명이 마지막 좌석을 예매하면 둘 다 통과할 수 있다 — 공유 자원은 회차 단위 잠금 필요(CH26)" 콜아웃. BO 재설계 요구(AG06/gpt)는 **기각**(입문 범위 초과 — 챕터가 이미 '개념 골격' 명시).

**C029 · [L06:35·51] "Activate하면 URL·preview" — Publish(게시) 단계 누락** — 중간 / 확실~추정
- 수렴 4벌: AG03/gpt#3(추정), AG06/gemini#4(확실), AG06/gpt#4(추정), AG06/opus#8(추정 — V2/V4 분화 지적).
- **[미확인(코퍼스 밖 — ADT 도구 절차)]** 문구 실재는 실측 확인. 4벌이 방향 일치("Activate 외 Publish/게시 단계 존재, 환경·버전 의존")·확신은 3벌이 추정. ABAP 키워드 코퍼스에 ADT 절차 문서 없음.
- 추천: **채택(완곡형)** — "환경에 따라 Publish 단계가 더 있을 수 있다" 수준 절차 보정(단정 회피). gemini의 "Publish 필수" 단정 채용은 지양(환경 의존).

**C030 · [L08:63～64] Clean Core 확장 수단으로 Customer/User Exit 경로 연결** — 높음 / 확실
- 수렴 2벌: AG06/gemini#1(높음·확실), AG03/gpt#4.
- **[실측 확인(문구)]** "확장은 [Customer Exit / User Exit 개념](CH32-L01.html)부터 이어지는 enhancement·BAdI로 한다" 실재. classic Customer/User Exit가 ABAP Cloud에서 불가하다는 방향은 일반 사실로 타당. 단 링크는 커리큘럼 학습 경로(CH32 = 확장 개념 트랙 시작) 안내 성격 — "Cloud에서 classic exit를 쓰라"는 뜻은 아님. 오해 소지는 실재.
- 추천: **채택(문구 조정)** — "확장 기법은 CH32부터 배우며, ABAP Cloud에서는 그중 released BAdI 계열만 허용" 식으로 경계 한 줄 병기. 전면 재서술(gemini 안)은 과함.

**C031 · [L08:25] "다른 repository object 접근은 released API만" 범위 과대(자체 객체 예외 누락)** — 중간 / 추정 — 1벌: AG06/gpt#5. **[미확인(코퍼스 표본 밖)]** — 방향은 타당(자체 개발 객체는 release 불요가 일반 원리). 추천: **보류(본선)** — 입문 단순화로 볼 여지와 오해 소지가 팽팽.

**C032 · [L04·L09] booking_id 채번(numbering) 주체 미언급 — external numbering 상태** — 중간 / 확실～추정 — 2벌: AG06/opus#3(확실), AG03/opus#5(추정 — '키도 자동' 오해 각도). **[실측 확인(전제)]** BDEF에 numbering 선언 없음 사실. 추천: **채택(L1 한 줄)** — "이 예제 키는 생성 요청이 직접 넣는다(자동 채번은 별도 선언 — 심화)" 수준. BDEF 수정까지는 본선 재량.

**C033 · [L04] etag master 미언급(lost update 침묵)** — 중간 / 확실 — 1벌: AG06/opus#4. **[실측 확인(전제)]** BDEF에 etag 없음·모델에 타임스탬프 필드 없음 사실, 코퍼스 데모는 `etag master crea_date_time` 동반. 추천: **보류(본선)** — Draft·Lock·ETag는 L09:98이 이미 CH39로 명시 예고(L0～L1 게이팅 의도) — 채택 시 게이팅과 충돌 여지.

**C034 · [L09:60～64] validate_capacity 골격이 LOOP 안 개별 조회 유도(L05 규율과 모순)** — 중간 / 확실 — 1벌: AG06/opus#6. **[실측 확인]** 골격 주석 1(정원 찾기)이 LOOP 내부에 위치 — L05:72 "먼저 한 번에 읽고 loop는 처리만"과 어긋나는 배치 사실. 추천: **채택** — 주석 3단계 재배치(집계는 LOOP 밖).

**C035 · [L09:71～75] action cancel의 result [1] $self 선언 대비 골격에 result 채움 단계 부재** — 중간 / 확실 — 1벌: AG06/gemini#5. **[실측 확인(전제)]** L09:44 선언·골격 3주석에 result 없음 사실. 단 골격이 "전체 구현은 줄이고"(L09:68) 명시 축약이고 L07:72～73이 result 설계를 별도 교육. 추천: **채택(경량)** — 주석 4줄째 "result에 갱신 인스턴스 반환" 추가 정도.

**C036 · [L05:53] IN LOCAL MODE 풀이 부정확 — 핵심은 권한·feature control 배제** — 낮음 / 확실 — 1벌: AG03/gemini#5. **[실측 확인(코퍼스)]** `ABAPIN_LOCAL_MODE`: "The addition is used to **exclude feature controls and authorization checks**" — 본문 "buffer를 고려해 읽는다"는 buffer 접근(일반 EML도 동일)을 고유 기능처럼 서술. 추천: **채택** — 표 풀이에 "권한·기능 제어 검사 없이(같은 BO 내부 신뢰 모드)" 보정.

**C037 · [L01:23 + glossary] RAP 풀네임에 ABAP 누락("RESTful Application Programming Model")** — 중간 / 확실 — 3벌: AG04/gemini#1, AG06/opus#9, AG04/opus#1(+한국어 풀이 부재 각도). **[실측 확인]** 본문·glossary desc 모두 "ABAP" 부재 — 공식 명칭은 ABAP RESTful Application Programming Model. 추천: **채택** — 본문+glossary 동시 교정, AG04/opus의 한국어 한 줄 풀이 병기도 수용 가치.

### E. L09 실습 완결성·교수설계 (AG05 계열)

**C038 · [L09 전반] "직접 구현" 약속 대비 주석 골격+시뮬레이터 — 생성 절차·실행 검증 부재** — 높음 / 확실
- 수렴 3벌: AG01/gpt#8(높음), AG05/gpt#3(높음), AG01/opus#17(ADT 생성 절차·zbooking 출처 부재 각도).
- **[실측 확인]** validation·cancel 골격 = 주석뿐, determination 골격 0(→C039), 산출물 표에 생성 화면·순서 없음, L09:15～16은 "운영 배포가 목표 아님" 선언으로 완충. 시뮬레이터 체험은 실재.
- 추천: **보류(본선)** — 완전 구현 제공(gpt 안)은 사이트 방침(시뮬레이터 체험 정본) 밖일 수 있음. 최소안 = 도입에 "시뮬레이터로 흐름 확인" 명시(AG01/opus 안) + 제목/완료 문구 수위 조정 검토.

**C039 · [L09] set_status_new 골격 부재 — 선언 3 vs 구현 골격 2** — 낮음 / 추정 — 2벌: AG09/opus#4, AG01/gpt#8(부분 언급). **[실측 확인]** BDEF 3선언·골격 2개 사실. 추천: **채택(경량)** — 골격 1개 또는 "세 번째 handler도 같은 자리" 1줄.

**C040 · [L07:60～61] L05 역참조 — determination/action 핸들러 구문은 L05에 없음** — 낮음 / 확실 — 1벌: AG05/gemini#4. **[실측 확인]** L05는 FOR VALIDATE만 제시(FOR MODIFY·FOR ACTION은 L05:71에 이름만). 추천: **채택(경량)** — 참조 문구를 "L05의 handler 클래스 구조와 같은 방식"으로 조정.

**C041 · [L08:68～69] 트랙 완주 회고가 L09 앞 조기 배치(+L09 말미와 중복)** — 중간 / 확실 — 3벌(AG05 3모델): AG05/gemini#5, AG05/gpt#5, AG05/opus#3. **[실측 확인]** L08 말미 인용 블록 + L09:133～135 재회고 실재. 추천: **채택** — L08 블록을 L09 뒤로 통합(3벌 일치).

**C042 · [_chapter.md] intro 한 줄 = 본문 동일 문자열 — 챕터 동기 서사 부재** — 중간 / 확실～추정 — **4벌(AG05 전 모델)**: AG05/gemini#1, AG05/gpt#4, AG05/opus#9, AG05/sonnet#1. **[실측 확인]** front-matter intro와 본문이 같은 한 문장. L01이 동기를 충실히 세우는 점도 사실(완충). 추천: **채택** — 2～3문장 확장(CH23 한계+산출물). 타 챕터 _chapter 관례와의 정합은 본선 확인 사항.

**C043 · [L01:30～40] 계층도 상하 순서 vs 레슨 진행 순서 불일치(Pool·BDEF·ZC 3칸 역순)** — 중간 / 확실 — 1벌: AG05/opus#4. **[실측 확인]** 그림 아래→위 = ZI→Pool→BDEF→ZC vs 레슨 = ZI(L02)→ZC(L03)→BDEF(L04)→Pool(L05). "아래에서 위로 하나씩 쌓자"(L01:92) 예고와 어긋남 실재. 추천: **채택(경량)** — 그림은 실행 의존 관계 기준임을 1문장 주석(그림 재배열은 의존 관계상 부정확해질 수 있음 — 주석안 권장).

**C044 · [L09:78～99] EML 절 분량이 foreshadow 선언 초과·실습 흐름 중단** — 중간 / 확실～추정 — 3벌: AG05/gemini#6, AG05/opus#8, AG05/sonnet#3. **[실측 확인]** 절 구성(2문단+3행 표+불릿 2+콜아웃) vs front-matter introduces:[] · foreshadow 등재. 단 L09:97 콜아웃이 "개념 지도까지만" 경계를 이미 선언, AG05/sonnet도 "시뮬레이터 해석에 실제 필요" 인정. 추천: **보류(본선)** — 삭제/이동보다 front-matter 정합(선언 조정) 또는 절 서두 경계 문구 강화 중 택일.

### F. L09 미시·기타 문장 (단발～2벌)

**C045 · [L09:63] `failed-booking` 표기 미설명(L05 failed와 표기 상이)** — 중간 / 확실 — 2벌: AG01/gemini#9, AG01/opus#16. **[실측 확인]** 챕터 내 유일 등장·무설명. 추천: **채택** — "failed-booking = failed 안의 Booking 자리" 1줄.

**C046 · [L09:115] no-op 무풀이 + 기대 결과 칸의 양자택일("실패 메시지 또는 no-op")** — 중간 / 확실 — 2벌: AG01/gemini#10, AG04/opus#23. **[실측 확인]** 다른 행은 단일 기대값 — 이 행만 이원. 위젯은 no-op+메시지 정책(도달 불가 — C018)과 연동. 추천: **채택** — C018 수정과 함께 기대값 확정+no-op 병기 풀이.

**C047 · [L05:42·55] failed/reported 출처 미설명 — 코드에 선언·사용 없이 표에서만 설명** — 높음 / 확실 — 3벌: AG01/gemini#6, AG01/opus#11, AG01/gpt#3(높음 — 최소 기록 코드 부재). **[실측 확인]** 시그니처·본문 코드에 없음(주석만) — "자동 제공되는 응답 구조(선언 불필요)" 안내 부재. 추천: **채택** — 안내 1줄+기록 최소 코드 1줄(gpt 안)까지는 본선 재량.

**C048 · [L09:122] 정원 계산 나열 4항목 병렬 무너짐** — 낮음 / 확실 — 1벌: AG04/opus#22. **[실측 확인]**. 추천: **채택**(문장 재서술).

**C049 · [L09:89] all-or-nothing 무풀이** — 중간 / 확실 — 1벌: AG04/gpt#7. **[실측 확인]** 인라인 무풀이(glossary save sequence 항목에는 등장). 추천: **채택**(괄호 한 줄).

**C050 · [L09:95] '런타임'(음차)·'consumer'(원문) 한 문장 혼용 등 표기 기준 부재** — 낮음 / 확실 — 1벌: AG04/opus#21. **[실측 확인]**. 추천: **채택(경량)** — runtime/instance 계열 표기 통일.

**C051 · [L01:55 vs L09:95] provider 지칭 충돌(런타임 쪽 vs behavior pool 쪽)** — 중간 / 확실 — 1벌: AG04/sonnet#7. **[실측 확인]** 두 문장 실재 — RAP 용어상 둘 다 관용 사용례가 있으나 입문자 혼선 소지는 타당. 추천: **채택(경량)** — L09의 "(provider)" 병기 제거가 최소안.

**C052 · [L09:31～48] L04·L07 코드 재게시에 새 줄 하이라이트 부재** — 낮음 / 확실 — 1벌: AG03/opus#6. **[실측 확인]** 재게시 자체는 실습 장 관례로 정당(발견자도 인정). 추천: **보류(본선)** — "이번에 추가된 3줄" 캡션은 저비용 개선.

**C053 · [챕터] BO 명칭 5갈래(비즈니스 객체/RAP Business Object/업무 객체/RAP BO/business object) + BO 약어 무선언** — 중간 / 확실 — 1벌: AG04/opus#3. **[실측 확인]** L01 내 4표기 실재. 추천: **채택** — 최초 등장에 "Business Object(BO)" 고정.

**C054 · [L02] '장'/'챕터' 혼용** — 낮음 / 확실 — 1벌: AG04/opus#4. **[실측 확인]**. 추천: **채택**(챕터로 통일).

**C055 · [L03] Projection View ↔ transactional projection 두 이름 무연결** — 낮음 / 확실 — 1벌: AG04/opus#5. **[실측 확인]** glossary는 두 이름을 한 항목으로 연결 — 본문만 공백. 추천: **채택**("같은 것이다" 1문장).

**C056 · [L04:24 외 4회] repository object 무풀이** — 중간 / 확실～추정 — 2벌: AG04/opus#9, AG04/sonnet#3. **[실측 확인]** L04·L06·L08 총 4회 무풀이. 추천: **채택** — 첫 등장 1회 풀이.

**C057 · [L04:77] '어떻게 확인하는가' 1번이 점검 동작 아닌 정의문(동어반복)** — 낮음 / 확실 — 1벌: AG04/opus#11. **[실측 확인]**. 추천: **채택**.

**C058 · [L04:85～86] mapping 생략 가부 답변 모호("덜 복잡할 수 있지만")** — 낮음 / 확실 — 1벌: AG04/opus#12. **[실측 확인]** — C002 교정과 연동 필수(코퍼스: 이름 동일 시 생략 합법). 추천: **채택** — 판정 먼저 주는 문장으로(C002와 한 몸).

**C059 · [L05:23] "특수 class pool" 순환 정의 + pool 용어 충돌(자원 풀 연상)** — 중간 / 확실～추정 — 3벌: AG03/opus#2, AG03/sonnet#4, AG04/opus#13. **[실측 확인]**. 추천: **채택** — "여러 class를 하나로 담는 ABAP 소스 단위(자원 풀 아님)" 괄호.

**C060 · [L05] global class 껍데기(FOR BEHAVIOR OF)·Local Types 작성 위치 안내 부재** — 낮음 / 확실 — 1벌: AG03/gemini#4(AG03/opus#2 suggestion에도 동일 취지 부기). **[실측 확인]** 예제가 lhc_만 노출 — global class 헤더 없음. 추천: **채택(경량)** — 헤더 1～2줄 또는 ADT 위치 한 줄.

**C061 · [L06:33] "ADT의 form-based repository object" 직역투** — 중간 / 확실 — 2벌: AG04/gemini#7, AG04/opus#17. **[실측 확인]**. 추천: **채택**(역할 먼저 우리말로).

**C062 · [L06:34] binding V2/V4·UI/Web API 4갈래 제시 후 실습 선택값 미지정** — 중간 / 확실 — 1벌: AG01/gpt#5. **[실측 확인]** 추천: **채택(경량)** — "이 실습 기준 = OData V4 UI" 1줄(C029와 연동).

**C063 · [L06:52] $metadata 무풀이·여는 방법 부재** — 낮음 / 확실 — 1벌: AG01/opus#13. **[실측 확인]**. 추천: **채택**(한 줄 풀이).

**C064 · [L08:49～50] "release contract와 visibility를 본다" — 어디서 어떻게 보는지 부재** — 높음 / 확실 — 1벌: AG01/gpt#6. **[실측 확인]** 확인 위치(ADT 속성 화면) 미제시 사실. 추천: **채택(경량)** — ADT Properties/API state 확인 위치 1～2문장(스크린샷 수준 상세는 불요).

**C065 · [L08:24] "cloud-ready·upgrade-stable … development model" 영어 나열 정의문** — 중간 / 확실 — 2벌: AG04/gemini#9, AG04/opus#20. **[실측 확인]**. 추천: **채택**(우리말 재서술).

**C066 · [L08:30] Released API 풀이가 "release된"으로 동어반복** — 중간 / 확실 — 2벌: AG04/gemini#10, AG04/gpt#6. **[실측 확인]** glossary 항목은 충실 — 본문 표만. 추천: **채택**("SAP가 공식 공개·보증한" 풀이).

**C067 · [L01:77] behavior pool 행만 '지금은 모양만' 안내·링크 부재(형제 행과 비대칭)** — 낮음 / 확실 — 1벌: AG01/opus#2. **[실측 확인]** 76·78행엔 있음. 추천: **채택**(동일 형식 링크).

**C068 · [L02:48～54] 읽는 순서 표가 첫 줄 @AccessControl만 건너뜀** — 중간 / 확실 — 1벌: AG01/opus#3. **[실측 확인]** — C027과 같은 지점·다른 취지(표 완결성). 추천: **채택** — C027 콜아웃과 한 번에(표 1행 추가).

**C069 · [L04:56] `unique` 키워드 표 풀이 누락** — 낮음 / 확실 — 1벌: AG01/sonnet#6. **[실측 확인]**. 추천: **채택(경량)**.

**C070 · [L01:86] LUW 약어 무풀이(CH25 예고 문장 안)** — 낮음 / 확실 — 1벌: AG01/gemini#1. **[실측 확인]** L1 예고 형식(링크 동반)이라 위반은 경미 — 풀 스펠링만 없음. 추천: **채택(경량)** — "LUW(Logical Unit of Work)" 병기.

**C071 · [L01:27] "버려야 할 기대는 …찾는 것이다" 호응 어색** — 낮음 / 확실 — 1벌: AG04/gemini#2. **[실측 확인]**. 추천: **보류(본선)** — 문체 취향 경계선(의미 전달은 됨).

**C072 · [L01:19～21] "사용자는 … 검증해야 한다" 주술 호응(검증 주체는 앱)** — 중간 / 확실 — 1벌: AG04/opus#2. **[실측 확인]**. 추천: **채택**(주체 전환 지점에서 문장 분리).

**C073 · [L03:17] '감사 필드' 무풀이(+ '~수도 있고' 3연속)** — 낮음 / 확실 — 1벌: AG04/gemini#3. **[실측 확인]**. 추천: **채택(경량)** — "감사(audit — 생성자·수정일시 추적)" 괄호.

**C074 · [L03:74] "되어 보여도" 서술어 어색** — 낮음 / 확실 — 1벌: AG04/gpt#3. **[실측 확인]**. 추천: **채택**("동작하는 것처럼 보여도").

**C075 · [L03:45] ZC도 root로 선언하는 이유 설명 부족(트리 미러링 근거)** — 낮음 / 확실 — 1벌: AG03/gemini#2. **[실측 확인(부분)]** 표 45행·확인 2번에 간단 근거("기반이 root면 소비도 root") 이미 존재 — 심화 근거만 부재. 추천: **보류(본선)** — composition 개념(L0) 선노출 위험과 상충.

**C076 · [L01:55] managed ↔ C#/CLR managed 용어 충돌 미짚음** — 낮음 / 확실 — 1벌: AG03/gemini#1. **[실측 확인(부재)]**. 추천: **기각** — 1독자(비전공 입문자)에게 CLR 대조는 역효과, 경력자 대상 각주는 사이트 표준 장치 아님(C078과 동일 사유).

**C077 · [L02:23] Interface View의 Interface ≠ ABAP OBJECTS INTERFACE 미짚음** — 낮음 / 추정 — 1벌: AG03/opus#3. **[실측 확인(부재)]** CH21 직후 혼동 소지 논리는 타당, CH23에서 기설명 여부는 대상 밖(발견자 자인). 추천: **보류(본선)** — CH23-L02 원문 확인 후 결정.

**C078 · [챕터 관통] 경력자 유비·지름길 표지 부재 묶음(DDD aggregate root·DTO·@Column·N+1·Unit of Work·BindingResult·V/D/A 분류 스킵)** — 중간 / 추정 — **9발견/4벌(AG03 전 모델)**: AG03/gemini#6·#7, AG03/opus#4, AG03/sonnet#1·#2·#3·#5·#6, AG03/gpt#5.
- **[실측 확인(부재)]** 챕터에 경력자 안내 0은 사실. 단 사이트 1독자 = 비전공 입문자(R3) — 경력자 지름길은 사이트 표준 장치가 아니며, AG03 프로토콜 스스로 "경력자에겐 아는 내용 = 낮음/suggestion" 분류 지시.
- 추천: **기각(정책 사유)** — 전 배치 일관 처리와 동일. 단 AG03/sonnet#6(EML=UoW)처럼 각주 1줄짜리 저비용 후보는 본선이 선별 채택 여지.

### G. 코드 정적 (AG09)

**C079 · [L02:43·L03:38] "CDS 정의문 끝 세미콜론 필수·누락 시 활성화 차단" 주장** — 낮음 / 확실 — 2발견/1벌: AG09/gemini#1·#2.
- **[실측 반박(코퍼스)]** `ABENCDS_DEFINE_VIEW_ENTITY` 구문도가 `… AS select_statement [;]` — **세미콜론은 옵션**. 공식 데모 소스(`ABENBDL_ACTION1_ABEXA` 등)도 `}`로 종결.
- 추천: **기각** — 오탐. **기각 사전 신규 후보**: "CDS DDL 뷰 정의 끝 `;` 필수" 주장(ABENCDS_DEFINE_VIEW_ENTITY `[;]`).

---

## §3 사전 재기각 (known-facts.md A절 정확 일치 대조)

- **0건.** A절 ⑦～㉘(itab SORT·READ TABLE·Open SQL·Dynpro 계열)과 정확 일치하는 재제기 발견 없음 — CH24는 RAP 신영역이라 기존 기각 사전과 교집합이 없다.
- 신규 기각 사전 **후보 1**: C079(CDS `;` 옵션 — `ABENCDS_DEFINE_VIEW_ENTITY`). 등재는 본선 확정 후.
- 참고(기각 사전 아님 · 코퍼스 확정 후보): ① BDEF mapping은 이름 동일 시 불요·부분 명시 합법(`ABENBDL_TYPE_MAPPING:28`, C002에서 과잉 주장 반박에 사용) ② IN LOCAL MODE = feature control·권한 검사 배제(`ABAPIN_LOCAL_MODE`, C036 채택 근거).

---

## §4 등급 집계·종합 소견

**집계** — 발견 184 / 클러스터 79(전량 귀속·유실 0 · dropped 0). 치명 1(명목 — C001, 실질은 '구조 결손 높음'으로 재평가 여지) · 높음 25 · 중간 86 · 낮음 72. 등급 의견 분포: 유지 2 · 경미 수정 15 · **보강 권장 11**. 모델별 발견량: opus 76 > gemini 44 > gpt 35 > sonnet 29 — gpt는 소량·고심각(높음 13/35로 최고 밀도), opus는 광폭·실측 동반, gemini(3.7+라이더)는 낮음 편중이나 AG06에서 높음 2 기여, sonnet은 과작·정확(반박된 주장 0).

**수렴 최상위(3벌+)**: C001(9벌·치명 포함) > C002(10벌) > C003(8벌) > C011(7벌) > C005(5벌)·C009(5벌) > C004·C008·C010·C016·C018(AG02 전원)·C027·C029·C042(AG05 전원)·C078(AG03 전원, 기각 추천) 4벌 > 3벌 9건. 표본 검증 결과 **다중 수렴 클러스터의 전제 오류는 0** — 반박은 단독·소수 클러스터(C079 전체, C002 내부의 과잉 사실 주장)에 국한.

**종합 소견(등급 의견 — 확정은 본선)**: 본 수합자 의견 = **보강 권장**. 근거 — ① 유일 치명·9벌 수렴의 C001이 "챕터가 스스로 약속한 결과(cancel 노출)가 제시 코드로 성립 안 함"이라는 구조 결손이고 코퍼스로 확정됨, ② 높음 채택 후보가 C001 외에도 C003·C005·C011·C017·C019·C020·C027·C028·C047 등 국소 2건을 훌쩍 넘음(§5 경계 규칙상 '높음 3+ 또는 구조 결함'), ③ 다만 결함 대부분이 "약어·용어 첫 등장 처리와 L05↔L07·L09 앵커"라는 두 패턴에 몰려 있어 재집필감은 전혀 아니고, 위젯 4건(C018～C021)·본문 한 줄 풀이류가 수선 다수라 보강 규모는 중형. 챕터 골격(왜→무엇→확인→실수 흐름·조립 보드·시뮬레이터)은 7종 전원이 상찬 — 뼈대 보존 전제의 표적 보강이 적정하다.

**본선 확인 요청 3건**: ① C038/C044 — L09의 '실습' 수위(시뮬레이터 정본 방침과 제목·완료 선언의 정합) ② C033 — etag 언급이 CH39 게이팅과 충돌하는지 ③ C042 — _chapter intro 확장이 타 챕터 관례와 맞는지.
