# CH23 수합·표본검증 보고 (AG10 SUMHARV)

> 최종수정: 2026-08-22 KST
> 수합자 = Fable 5(AG10, 판정층 — 블라인드 비적용). 입력 = `raw/CH23/` 28벌(AG01～06·09 × opus/sonnet/gpt-5.6-sol/gemini-3.7-flash-high). 산출 = 이 문서 1개.
> **판정 확정은 본선 몫** — 여기는 수거·클러스터링·기각 사전 대조·표본 실측·추천까지만.

---

## §1 수거·등급 매트릭스

- **수거 28/28 · 결측 0 · 파싱 실패 0** (gemini 7벌 = `response` 문자열 봉투 해제, gpt-5.6-sol 포함 나머지 21벌 = 직접 스키마) · dropped 0.
- **블라인드 위반 트레이스 0** (28벌 전체에서 `.archive`/`.project-docs`/`verdict` 참조 0 — 정례 스캔).
- 발견 총 **176** (치명 0 · 높음 17 · 중간 78 · 낮음 81) → 클러스터 **77** + 수합자 직권 부기 1(§2 말미 H1).

| 벌 | n | 치/높/중/낮 | 등급 의견 | | 벌 | n | 치/높/중/낮 | 등급 의견 |
|---|---|---|---|---|---|---|---|---|
| AG01-opus | 10 | 0/0/4/6 | 경미 | | AG04-opus | 14 | 0/1/7/6 | 경미 |
| AG01-sonnet | 7 | 0/3/3/1 | 경미 | | AG04-sonnet | 6 | 0/0/2/4 | 경미 |
| AG01-gpt | 6 | 0/5/1/0 | 보강 | | AG04-gpt | 11 | 0/0/4/7 | 보강 |
| AG01-gemini | 8 | 0/0/3/5 | 경미 | | AG04-gemini | 7 | 0/0/1/6 | 경미 |
| AG02-opus | 8 | 0/1/4/3 | 보강 | | AG05-opus | 9 | 0/0/5/4 | 경미 |
| AG02-sonnet | 6 | 0/1/2/3 | 경미 | | AG05-sonnet | 5 | 0/1/2/2 | 경미 |
| AG02-gpt | 6 | 0/1/3/2 | 보강 | | AG05-gpt | 5 | 0/0/5/0 | 보강 |
| AG02-gemini | 5 | 0/0/3/2 | 경미 | | AG05-gemini | 6 | 0/0/2/4 | 경미 |
| AG03-opus | 9 | 0/0/3/6 | 경미 | | AG06-opus | 9 | 0/0/7/2 | 경미 |
| AG03-sonnet | 6 | 0/0/2/4 | 경미 | | AG06-sonnet | 6 | 0/1/1/4 | 경미 |
| AG03-gpt | 6 | 0/1/4/1 | 보강 | | AG06-gpt | 4 | 0/1/3/0 | 보강 |
| AG03-gemini | 8 | 0/0/2/6 | 경미 | | AG06-gemini | 5 | 0/1/2/2 | 보강 |
| AG09-opus | 4 | 0/0/3/1 | 경미 | | AG09-gpt | 0 | — | 유지 |
| AG09-sonnet | 0 | — | 유지 | | AG09-gemini | 0 | — | 유지 |

등급 의견 분포: **유지 3 · 경미 수정 17 · 보강 권장 8 · 재집필 0**.

특기 사항
- **AG09 3/4모델 findings=0·유지** — CH23의 ```abap 블록은 L01·L02 각 1개(New Open SQL 조회문, CH19+ 적법)뿐이고 나머지 코드펜스는 ```cds/```metadata/```dcl(AG09-sonnet overall이 17개 펜스 전수 분류). AG09-gemini는 errors에 "후보 10건 검토 후 전부 비실재 판정"을 남김 — 엄격화 라이더 취지(억지 발견 금지)에 부합하는 정직한 0.
- **AG06-opus errors 1건**: 단어형 cardinality(`association of one to many`) 실재 여부를 오프라인 제약으로 미확인 자백(seq5=추정) → §2 C035에서 코퍼스로 해소(감사 주장이 오히려 반박됨).
- AG01-gpt의 높음 5는 동일 성향(생략·단절 계열 상향 마킹) — 클러스터 대응은 전부 다른 벌과 수렴.

---

## §2 클러스터 전량

표기 — **수렴**: 벌 수(에이전트 종 수/모델 계열 수). supporters의 모델 축약 o=opus·s=sonnet·g=gpt-5.6-sol·m=gemini-3.7. **sev/conf** = 구성원 최고/최저. **검증**: [실측 확인]=원문·cfg 대조로 사실 성립 / [실측 반박]=원문·코퍼스가 주장을 반박 / [코퍼스 확정]=오프라인 공식 문서 인용 / [미확인]=표본검증 미실시(소액).

### §2-0 최우선 표본검증 3건 (상세)

#### C058 · L06 — `#NOT_REQUIRED` 시연이 사실과 반대 (본문+위젯 동시) — **실질 최고 심각**
- 수렴 **4벌(3종/2모델)**: AG02(g#5·o#1) · AG03(g#6) · AG06(g#4) — 전원 **높음·확실**.
- 대표 quote: "`#NOT_REQUIRED`면 권한 밖 venue까지 노출되는 것을 직접 확인할 수 있다."(L06:71, 위젯 lead 동문)
- 요지: 레슨·위젯이 `#NOT_REQUIRED`를 "존재하는 DCL을 끄는 스위치"로 시연하지만, 실제로는 **DCL이 존재하면 `#NOT_REQUIRED`에서도 평가된다**. 존재하는 DCL을 무시하는 값은 `#NOT_ALLOWED`(또는 `WITH PRIVILEGED ACCESS`).
- **[실측 확인+코퍼스 확정]**
  - 위젯 실측: `embeds/_engine/dcl-auth-comparator.js:47` `visible = ROWS.filter(... st.mode==='NOT_REQUIRED' ? true : allowed(r.venue))` — NOT_REQUIRED에서 무필터 노출을 하드코딩. `code()`는 그 상태에서도 `define role ZI_Concert_Role {...}`을 화면에 그대로 유지(= role 존재 상태) → "role이 있는데 annotation 한 줄로 필터가 풀린다"는 틀린 보안 모델을 체험으로 각인.
  - 코퍼스: `ABENCDS_1180334353_ANNO`(AccessControl.authorizationCheck) — `#NOT_REQUIRED`: "Like #CHECK, but there is no syntax check warning. … **When an access control exist, it is evaluated.**" · `#CHECK`: "The runtime behavior is **identical to #NOT_REQUIRED**, however there is a syntax warning … when no access control exists yet." · `#NOT_ALLOWED`: "When an access control exists, it is **ignored at runtime**." 추가로 `ABENCDS_F1_DEFINE_ROLE`: "Access control can be disabled … `#NOT_ALLOWED` … or `WITH PRIVILEGED ACCESS`".
  - 본문 자체 서술 중 L06:56 "`#NOT_REQUIRED`는 access control이 없어도 된다는 뜻"은 옳음 — 틀린 것은 **"직접 비교해 보기" 시연 축(70～71행)과 위젯 전체**.
- 추천: **채택(실질 치명～높음)**. 교정 축 = ① 토글을 `#CHECK ↔ #NOT_ALLOWED`로 바꾸거나 ② `#NOT_REQUIRED` 측을 "DCL이 아예 없는 뷰" 시나리오로 재설계(role 패널 비움). 본문 70～71행·위젯 lead·verdict 문구·흔한 실수 항목 동시 교정. B5의 CH18 EXCEPT 토글(실질 치명 판정)과 동형 — "사실을 반대로 가르치는 체험".

#### C046 · L04 — "L01 `ZI_Flight`에 `price`·`currency`가 실제로 있으니" — 존재하지 않음 — **최대 수렴**
- 수렴 **16벌(7종 전원/4모델 전원)**: AG01(m#1·g#5·o#7·s#5) · AG02(o#3) · AG03(g#4·o#1) · AG04(o#3) · AG05(m#1·g#4·o#4·s#3) · AG06(g#2·o#3·s#4) · AG09(o#2). sev 높음(4벌)/conf 확실.
- 대표 quote: "[L01](CH23-L01.html)의 항공편 모델 `ZI_Flight`에는 `price`와 `currency`가 실제로 있으니, 이 둘로 금액-통화 짝을 선언한다."(L04:58)
- **[실측 확인]**: L01:64～76 `ZI_Flight` select list = `key carrid, key connid, key fldate, seatsmax, seatsocc, seatsmax - seatsocc as seats_left` — price·currency 없음(원본 테이블 `sflight`에는 있음 — 뷰에 안 올림). L04가 스스로 세운 점검 규칙("같은 select list에 요소가 실제로 있어야")과 자기모순. 링크까지 걸어 "실제로 있으니"라고 단정 → 복습 장치가 역효과.
- 추천: **채택(높음)**. 교정 = (a) L01 `ZI_Flight`에 price·currency 추가(이후 재사용 자산, 다수 벌 권장) 또는 (b) L04 문장을 "원본 `sflight`의 price·currency를 select list에 추가한 뒤"로 수정 + 조각 코드를 전체 DDL 형태로. (a) 채택 시 CURR 필드 노출에 통화 참조 annotation 요구가 자연스러운 L04 도입 장치가 된다는 부기(AG09/o·AG06/o). C047·C048과 한 세트로 교정.

#### C020 · L02 — embed 캡션 "Interface vs **Projection**" — 레슨 자기 경고와 정면 충돌
- 수렴 **14벌(6종/3모델 — sonnet만 무보고)**: AG01(m#2·g#3) · AG02(m#1·g#1·o#2·o#8) · AG03(m#2) · AG04(m#3·g#3·o#2) · AG05(m#2·g#3·o#5) · AG06(m#4·o#9). sev 높음(AG01-g)/conf 확실.
- 대표 quote: "::embed CH23-L02-S01 | Interface vs Projection 계층 분리 실험실::"(L02:84)
- **[실측 확인]**: 본문 115～117행이 "'Projection View'라는 정식 뷰와 헷갈리기"를 흔한 실수로 못박는데 MD 캡션만 'Projection'. 위젯 자체 `<title>`(CH23-L02-S01.html:9)은 이미 "Interface vs **Consumption** 계층 분리 실험실"로 옳음 — **MD 캡션 한 줄이 결함의 뿌리**. 단 엔진 `projection-layer-lab.js:68～69` 런타임 메시지("projection ZC_ConcertList도 더는…")와 파일 머리 주석에도 projection 잔존(AG02/o#8).
- 추천: **채택(높음-표기, 교정 자체는 경미)**. MD 캡션 교체 + 엔진 메시지·주석의 projection→소비 뷰(Consumption) 통일. cfg 키 이름(`PLL_CFG.proj`)은 내부 식별자라 유지 가능.

### §2-1 _chapter (1)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C001** | 챕터 intro가 front-matter 문장 1줄 반복뿐 — 동기·로드맵·도착점(RAP 기반) 부재. quote: "DB 계층에서 모델링하고 재사용하고 싶다." | AG05(m#4·g#1·o#1·s#1) — 1종 4모델 전원 | 중/확실 | [실측 확인] _chapter.md 본문=intro 동일 1줄 | 채택 — 3～5문장 동기 블록(L01 불편 압축+도착점 ZC_Concert+CH24 연결) |

### §2-2 L01 (18)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C002** | ADT 미도입 — 챕터 전체가 ADT(Eclipse) 조작 전제인데 풀 스펠링·생성 절차·도입 레슨이 없음. quote: "ADT에서 DDL Source를 만들고 활성화한 뒤 세 가지를 본다." | AG01(g#1높·o#2·s#1)·AG04(g#1)·AG05(o#2) — 3종/3모델 | 높/추정 | **[실측 확인]** 커리큘럼 전체 grep: "ABAP Development Tools" 0건·ADT 도입 레슨 없음(CH21-L01에 "SE24(또는 ADT)" 스침만) → 추정 벌들의 유보가 사실로 확정 | 채택 — L01에 ADT 한 줄 풀이+DDL Source 생성 경로 1문장(또는 그림), prereq 정비 |
| C003 | 첫 코드의 `@`·`#` 표기 미풀이(annotation은 L04, `#`열거값은 끝까지 없음) | AG01(o#1) | 낮/확실 | [실측 확인] | 채택(한 줄 풀이) |
| **C004** | Calculated Element 체험 공백 — introduces 3호 개념인데 위젯(S01)은 ZI_Concert 필드 매핑만, seats_left/ZI_Flight 부재 | AG02(s#1높·m#5) | 높/확실 | [실측 확인] CAO_CFG에 seats_left·sflight 문자열 0 | 채택 — 위젯에 계산 요소 스텝/토글 추가 또는 별도 소형 위젯 |
| C005 | "Calculated Element" 용어가 RAP 공식 용어와 충돌한다는 주장(런타임 ABAP exit 가상 필드 전용 용어라는 취지) | AG03(m#1)·AG06(m#3) — gemini만 | 중/확실 | **[코퍼스 반박 기울임]** RAP의 해당 공식 용어는 **Virtual Element**(`ABENCDS_VIRTUAL_ELEMENT_GLOSRY`: "calculated during runtime, usually in ABAP classes… RAP query engine"). 'calculated element'는 analytics 계열 문서의 일반 명사 사용뿐 — 충돌 주장의 근거 부정확 | **기각 추천**(선택 보강: glossary 팝업에 "표현식 기반 요소를 부르는 이 교재의 명칭, RAP virtual element와 별개" 1줄) |
| C006 | CDS `key`를 Entity Key(@Id류) 프레임으로 연결 제안 | AG03(m#7) | 낮/확실 | [미확인] | 백로그(선택) |
| C007 | 경력자 지름길 부재·재확인 반복(L01↔L02 '원본 안 바뀜' 중복) | AG03(g#1·s#1) | 낮/추정 | [미확인] | 백로그(1독자=입문자, R3) |
| C008 | code-to-data(계산이 DB에서 실행) 관점 부재 — '왜 DB 계층인가' 미답 | AG03(o#3) | 중/추정 | [미확인] | 보강 후보(불편 목록에 1줄) |
| C009 | 구형 `define view`+sqlViewName 존재 미언급(실무 코드 해독 지도) | AG03(o#9) | 낮/추정 | [미확인] | 백로그(각주 1줄) |
| C010 | "문법의 심장은 다음 **한 줄**" ↔ 11줄 블록 | AG04(m#1) | 낮/확실 | [실측 확인] | 채택(문구 완화) |
| C011 | "결과 구조를 **읽는** 파일" 술어 호응(59행 '선언하는 자리'와 충돌) | AG04(m#2) | 낮/확실 | [실측 확인] | 채택(선언하는/으로 읽는) |
| C012 | "…어떻게 실패하는지(…)," 앞 절 서술어 누락 비문 | AG04(o#5) | 낮/확실 | [실측 확인] | 채택 |
| C013 | '소비처/소비하다' 핵심 어휘 첫 등장 미풀이(consume 직역) | AG04(o#7) | 중/추정 | [실측 확인] 55행 표에서 무풀이 첫 등장, 챕터 관통 | 채택(한 줄 풀이) |
| C014 | "읽기 모델을 재사용 가능한 이름으로 만든다" 중의문+'읽기 모델' 미풀이 | AG04(o#14) | 낮/추정 | [실측 확인] | 채택(문장 분리) |
| C015 | L01 인지부하 — 콘서트→sflight 도메인 전환+Calculated Element 조기 배치, 주 실습에서 미회수 | AG05(g#2) | 중/확실 | [실측 확인] L07 "잔여석 집계 구현 안 함" 명시 | 본선 판단(구성 변경 vs 콘서트 도메인 계산 예제로 교체) |
| **C016** | 정리(요약) 단계 결손 — L01～L06 전부 '흔한 실수→다음 예고'로 끝, 배운 것 되짚기 0(L07만 체크리스트) | AG05(o#3) | 중/확실 | [실측 확인] 전 레슨 말미 브리지 2문장 패턴 | 채택 — 브리지 앞 3줄 정리(챕터 공통) |
| C017 | `ZI_` 접두어 선사용(뜻은 L02 도입) — L01 무언급 | AG05(s#2) | 낮/확실 | [실측 확인] | 채택(예고 1줄) |
| C018 | 릴리스 전제 부재 — `define view entity`=ABAP Platform 2020(7.55)+ 콜아웃 없음 | AG06(o#7) | 중/확실 | [미확인 — 코퍼스 릴리스 표 미대조. 방향 타당] | 보강 후보(L1 예고 수위 콜아웃) |
| C019 | 첫 소비 예제가 `SELECT *` 전건 — L02는 필드 명시로 시연 습관 엇갈림 | AG06(o#8) | 낮/확실 | [실측 확인] L01:99↔L02:95 | 채택(필드 명시로 통일+한 줄) |

### §2-3 L02 (11)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C020** | (§2-0 상세) 캡션 Projection | 14벌/6종/3모델 | 높/확실 | [실측 확인] | 채택 |
| **C021** | annotation 상속 콜아웃 선노출 — annotation 정의(L04) 전에 상속·오버라이드 규칙부터 | AG01(m#3·g#2·o#3·s#2높)·AG04(g#2) — 2종/4모델 | 높/확실 | [실측 확인] L02:73～75, L04 front-matter introduces=Annotation | 채택 — 인라인 예고 풀이("@로 시작하는 뜻풀이 줄, L04에서") 또는 콜아웃 L04 이후 이동 |
| **C022** | "기반 뷰의 annotation은 자동으로 물려받는다" 과일반화 — entity annotation(@AccessControl·@Metadata.allowExtensions 등)은 비상속, 요소 annotation도 직접 투영 시에만 | AG03(g#2·o#2)·AG06(m#2·g#1·o#1) — 2종/3모델 | 중/추정 | **[코퍼스 부분확정 — 방향 지지]** `ABENCDS_ELEMENT_ANNOTATIONS_PV`: 직접 투영 요소만 상속·"If a field is not directly projected but used in an expression … annotations are **not inherited**"·`@Metadata.ignorePropagatedAnnotations`로 차단 가능. `ABENCDS_AMOUNT_FIELD:43` 통화 참조 annotation 전파 명문. entity 단위 비상속은 챕터 자체 코드가 방증(뷰마다 `@AccessControl` 재선언, L07 `@Metadata.allowExtensions`를 소비 뷰에 직접). 단 위 문서는 projection view 축이라 nesting view entity 세부 문구는 본선 재검 | 채택(범위 한정 교정) — "필드(요소) annotation은 그대로 투영될 때 물려받고, 뷰 전체 annotation은 뷰마다 다시 선언" |
| C023 | 점검표의 Metadata Extension 선노출(L05 개념, 무링크) | AG01(m#4·o#4) | 낮/확실 | [실측 확인] L02:107 | 채택(배울 시점 병기/링크) |
| C024 | Projection View 실수 항목 과부하 — as projection on·provider contract·RAP·트랜잭션 4연타, RAP 풀 스펠링 챕터 전체 부재 | AG01(o#5)·AG04(o#6) | 중/확실 | [실측 확인] RAP 풀 스펠링 grep 0 | 채택(RAP 첫 등장 풀 스펠링+부담 낮추기) |
| C025 | '어떻게 확인하는가'가 숨김 효과를 `ZC_Concert`(4필드 전부 노출)로 서술 — 숨김 예제는 `ZC_ConcertList`(위젯 proj도 이것) | AG02(m#4·s#2) | 중/확실 | [실측 확인] L02:90～97 ↔ 43～52·58～67, PLL_CFG.proj='ZC_ConcertList' | 채택 — 확인 절 엔티티를 ZC_ConcertList로 통일 |
| C026 | Interface 명칭이 OOP interface(구현 없는 계약)와 충돌 — 왜 Interface인지 무설명 | AG03(o#4·s#2) | 중/추정 | [실측 확인 — 설명 부재 확인] | 보강 후보(각주 1줄) |
| C027 | projection(일반 SQL 용어) 디스클레이머가 레슨 맨 끝 — 충돌 발생 지점(ZC_ConcertList 예제)보다 늦음 | AG03(s#3) | 낮/추정 | [실측 확인] | 백로그(위치 조정) |
| C028 | '계약' 이중 용법 — "같은 계약을 유지"(비유) ↔ "계약 없이 뷰를 쌓기만"(provider contract) 동일 레슨 충돌+미풀이 | AG04(o#4·s#1) | 중/추정 | [실측 확인] L02:100↔117 | 채택(앞쪽을 '필드 구성'으로 교체 또는 병기) |
| C029 | `ABC_Concert` 예시 — 커스텀 오브젝트 네임스페이스(Y/Z) 위반으로 실제론 활성화 안 될 공산 | AG06(s#1) | 낮/추정 | [미확인 — 코퍼스 명문 미대조, Basis 통설] | 채택 저비용(`ZABC_Concert`로 교체) |
| C030 | L02 불편 서사가 전부 가정·미래형("…필요할 수 있다") — 직전 산출물(4필드 뷰 1개)로 체감 불가 | AG05(o#6) | 낮/추정 | [실측 확인 — 서술 형식 확인] | 백로그(before 코드 제시안) |

### §2-4 L03 (15)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C031** | `ZI_Perf` 미존재 참조 — association 첫 예제 대상이 L07에서야 정의됨, "가정한다" 안내 부재 | AG01(g#4높·o#6·s#3) — 1종/3모델 | 높/확실 | [실측 확인] L03:33 ↔ L07:33～42(최초 정의). L06 마무리도 "만들자"고 L07로 미룸 | 채택 — "회차 뷰 `ZI_Perf`를 이미 만들어 뒀다고 가정(직접 만들기는 L07)" 1줄 |
| C032 | 관계도(S01) `_Booking [0..*] on perf_no` — 복합키(concert_id+perf_no) 중 절반만 표기, 안내문은 "키를 정확히 잇습니다" | AG02(o#5) | 중/확실 | [실측 확인] CH23-L03-S01.html:27 ↔ ZI_Perf 복합키(L07:38～39) — perf_no 단독 연결은 공연 간 회차 섞임 | 채택 — `on concert_id+perf_no` 2줄 표기 |
| C033 | 관계도가 미정의 `ZI_Booking`·역방향 `_Concert [1..1]`을 선확정 — L07 도전과제("_Booking을 어느 뷰에 둘지"=미해결)와 모순 | AG02(s#6) | 낮/확실 | [실측 확인] S01:27～32 ↔ L07-S01 cbs-chall:27 | 채택(관계도 해당 구간 점선/예고 처리 또는 도전과제 문구 조정) |
| C034 | S02 위젯 코드패널이 select list에서 capacity 누락(본문 코드는 5요소) | AG02(s#3) | 낮/확실 | [실측 확인] association-path-simulator.js:65 하드코딩 | 채택(1줄 추가) |
| **C035** | "(숫자 대신 단어로 `association of one to many to ZI_Perf`처럼 쓰는 표기도 있다)" = 비실재 구문이라는 주장 | AG06(m#1**높·확실**·o#5추정)·AG09(o#3추정) — 2종/2모델 | 높/추정 | **[실측 반박 — 코퍼스 확정]** `ABENCDS_CARDINALITY_V2`(Cardinality Syntax Written in Words): `OF {EXACT ONE\|MANY\|ONE} TO {EXACT ONE\|MANY\|ONE}` — **`OF ONE TO MANY` 9형 명문**, CDS view entity에서 가용, 심지어 "**recommended option**"(SAP 권장·성능 이점). 본문 표기 그대로 합법 | **기각** — 3벌 전면 오판(특히 gemini 높음·확실 마킹은 스코어카드 감점 대상). §3 신규 기각 사전 후보 |
| C036 | 위젯 cardinality 경고([1..1]인데 회차 여러 개→경고)가 실제 동작처럼 오인될 소지 — 실제 cardinality는 데이터 제약이 아님 | AG03(g#3) | 중/확실 | [코퍼스 부분지지] `ABENCDS_CARDINALITY_V2`: "The cardinality is mainly **descriptive, not prescriptive**. It does not force a matching result set" + 불일치는 "usually … **syntax check warning**"·결과 undefined | 채택(경량) — 위젯/본문에 "교육용 시뮬 경고" 명시+데이터 검증은 별도라는 1줄 |
| C037 | to-many 경로 행 증식(1행이 회차 수만큼 불어남) 미경고 — 성능 관점만 있고 결과집합 왜곡 없음 | AG06(o#6·s#3) | 중/추정 | [코퍼스 간접지지] 같은 문서의 잘못된 cardinality→행 수 상이 데모(CL_DEMO_CDS_WRONG_CRDNLTY_1) | 채택(흔한 실수 1줄 추가) |
| C038 | path↔경로·source/target↔대상 용어 혼용(레슨 내+챕터 간) | AG01(m#7)·AG04(m#4·g#5·o#9) — 2종/3모델 | 낮/확실 | [실측 확인] | 채택(첫 등장 병기 후 통일) |
| C039 | 도입부만 테이블명 대문자(ZCONCERT·ZPERF) — 챕터 코드·본문은 소문자 | AG04(o#13·s#5) | 낮/확실 | [실측 확인] L03:15 ↔ L01:38 등 | 채택(소문자 통일) |
| C040 | direction이 "경로로 따라간다"인데 경로 표현식 사용 코드(`_Perf.perf_date` 등)가 본문에 0 | AG05(m#5) | 중/확실 | [실측 확인] 본문 코드는 선언·노출뿐(위젯이 대행) | 보강 후보(소비 측 경로 사용 스니펫 1개 — 단 CH24 게이팅 확인 필요) |
| C041 | `_Perf` 밑줄 관습(관계 표시) 무설명 — 타 언어 private 오독 소지 | AG03(o#5) | 낮/확실 | [실측 확인] | 채택(1줄) |
| C042 | `$projection` 설명 압축 — 코드 조각과 짝짓는 문장 부재 | AG01(s#4) | 낮/확실 | [실측 확인] | 채택(경량) |
| C043 | "$projection 제약의 트리거=association 노출"이라는 인과 서술 부정확 주장($projection 사용 자체가 조건) | AG06(s#2) | 낮/추정 | [미확인 — 코퍼스 세부 문구 미대조] | 본선 재검(저위험 — 실습상 체감 동일) |
| C044 | ORM(JPA/EF) 비유 브리지 부재 | AG03(m#3·s#4) | 낮/추정 | [미확인] | 백로그(선택) |
| C045 | "대상인 회차를 몇 개" 수식 어색 | AG04(g#4) | 낮/확실 | [실측 확인] | 채택(문구) |

### §2-5 L04 (8)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C046** | (§2-0 상세) ZI_Flight price/currency 부재 | 16벌/7종/4모델 | 높/확실 | [실측 확인] | 채택 |
| **C047** | 레슨 내 통화 필드명 3종 혼재 — 예제 `'currency'` ↔ 점검 `'currency_code'`(+어느 예제에도 없는 `'unit'`) | AG01(o#8)·AG04(o#12·s#2) (+C046 다수 벌이 부수 지적) | 중/확실 | [실측 확인] L04:61↔86 | 채택 — 'currency'로 통일 또는 예시임을 명시 |
| **C048** | 위젯 필드명 `ticket_price`/`currency_code` — 본문 코드(price/currency)와 불일치, CH23 어느 레슨 코드에도 없는 이름 | AG02 4모델 전원(m#2·g#2·o#6·s#4) | 중/확실 | [실측 확인] AEP_CFG(CH23-L04-S01.html) | 채택 — 본문·위젯·점검 절 한 세트로 이름 통일(C046 교정 방향과 연동) |
| C049 | '지정 안 함' 토글 시 코드패널에 한국어 의사문장("…미지정") 출력 — 실문법 오인 소지 | AG02(g#3) | 중/확실 | [미확인 — 렌더 미실측(AG02-g 실조작 보고)] | 채택(annotation 줄 생략 방식으로) |
| **C050** | "사이에 **빈 줄**·다른 필드가 끼면 의도와 다른 필드에 붙을 수 있다" — 빈 줄은 무관(자유형식), 자기 예제(35～37행 빈 줄 포함)와 자기모순. 위젯 note에도 동문 | AG02(g#4)·AG06(o#2)·AG09(o#4) — 3종/2모델 | 중/확실 | [실측 확인 — 내부 모순 성립] L04:93～94 ↔ 34~39 예제. (CDS 자유형식 명문은 코퍼스 별도 미대조 — 단 예제 자체가 반증) | 채택 — '빈 줄' 삭제, "다른 요소가 끼면"으로 한정+빈 줄 무해 1줄. 위젯 note 동시 교정 |
| **C051** | annotation을 '주석'으로 호칭(챕터 전반: 'UI 주석'·'주석 위치 틀림'·L05 제목 '왜 주석을 따로 뺄까') ↔ L04 스스로 "일반 주석이 아니다" 경고 — comment와 구분 근거 붕괴 | AG04(o#1) | 높/확실 | [실측 확인] L04:72↔93, L02:23·107, L05·L07 다수 | 채택(높음-용어) — annotation(어노테이션)으로 통일, '주석'은 comment 전용 |
| C052 | Annotation 풀이("metadata 선언")의 metadata가 미풀이 — 풀이 속 더 어려운 말 | AG04(g#6·o#8·s#6) — 1종/3모델 | 중/추정 | [실측 확인] | 채택(metadata 한 줄 풀이) |
| C053 | Java Annotation/C# Attribute 대응 병기 제안 | AG03(m#4) | 낮/확실 | [미확인] | 백로그(선택) |

### §2-6 L05 (4)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| C054 | DDLX 약어 미풀이 — 괄호 안이 또 다른 약어, 풀 스펠링·역할 부재 | AG01(o#9)·AG04(m#5) | 낮/확실 | [실측 확인] L05:41 | 채택(1줄) |
| C055 | 쉼표/세미콜론 구분자 설명 4회 반복 | AG03(o#8) | 낮/확실 | [실측 확인 — 4개소] | 백로그(중복 2개 축소, 완전 제거 비권장 — 발견자 자신도 유보) |
| C056 | `@Metadata.layer: #CORE`의 layer 미풀이 — 뷰 '계층'과 혼동 소지 | AG04(o#11) | 낮/추정 | [실측 확인] | 채택(1줄+구분) |
| C057 | 관심사 분리(SoC) 프레임 병기 제안 | AG03(m#5) | 낮/확실 | [미확인] | 백로그(선택) |

### §2-7 L06 (13)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C058** | (§2-0 상세) #NOT_REQUIRED 시연 사실 역전 | 4벌/3종/2모델 | 높/확실 | [실측 확인+코퍼스 확정] | 채택(실질 치명～높음) |
| **C059** | `aspect pfcg_auth( Z_VENUE_AUTH, VENUE, ACTVT = '03' )` 3인자 미분해 — 표가 한 칸 뭉뚱그림, '03'=조회·소문자 venue(뷰 요소)↔대문자 VENUE(권한 필드) 구분 없음 | AG01(m#5·g#6높·o#10·s#6)·AG05(m#6·o#9) — 2종/4모델 | 높/추정 | [실측 확인] L06:31·40 | 채택 — 표를 3행 분해(권한 객체/필드/활동 03=조회)+ CH15 링크 상기 |
| **C060** | 권한 객체명 `Z_VENUE_AUTH` 12자 — SAP 권한 객체 기술명 10자 한도 초과, 예제 그대로 SU21 생성 불가 | AG03(g#5·o#7)·AG06(g#3·s#6)·AG09(o#1) — 3종/3모델 | 중/추정 | [실측 확인(12자 계산)+통설 일치·반론 0] 코퍼스 키워드 문서엔 이름 길이 명문 미발견(`ABENAUTHORIZATION_OBJECT_GLOSRY`는 SU21·필드 10개만) — 10자 한도는 DDIC(XUOBJECT CHAR10) 통설. 본선 확정 권장 | 채택 방향 — `Z_VENUE`(7자) 등으로 교체(본문 표·위젯 코드 동시) |
| **C061** | L02 "annotation은 물려받는다" ↔ L06 "DCL은 상속되지 않는다" — 같은 nesting에 반대 결론, 대비 설명 0 | AG01(s#7) | 높/확실 | [실측 확인] L06:59 콜아웃에 L02 참조 없음 | 채택 — "L02의 annotation 상속과 달리…" 대비 1문장(C022 교정과 연동 시 자연 해소) |
| **C062** | `@MappingRole: true` 표 설명("access control role임을 표시") 부정확 — **conflict**: opus="전 사용자 배정 선언·빠지면 미적용" vs sonnet="없어도 활성화·매핑 전용 표시(누락=오류 서술도 과함)" | AG06(o#4·s#5) | 중/추정 | **[코퍼스 확정 — opus 방향]** `ABENCDS_F1_DEFINE_ROLE`: "the annotation @MappingRole **must be specified** with the value true" · "**used to assign the CDS role to every user** regardless of the client" · "Every CDS role … is assigned to every user implicitly". → sonnet의 '없어도 활성화' 기각. 레슨의 "누락→활성화 단계에서 드러난다"(77행)는 옳음 | 부분 채택 — 표 설명을 "이 role을 모든 사용자에게 매핑(배정)한다는 필수 선언"으로 교정. sonnet 벌은 기각 |
| C063 | SU01/PFCG 약어 미풀이(PFCG 풀 스펠링 챕터 부재) | AG01(m#6)·AG04(g#8·o#10) — 2종/3모델 | 중/추정 | [실측 확인] | 채택(첫 등장 한 줄씩) |
| C064 | 점검 항목의 privileged access 미풀이 | AG04(m#6·g#9) | 중/확실 | [실측 확인] L06:89 (foreshadow 선언은 있음) | 채택(괄호 풀이 1줄) |
| C065 | DCL 약어에 한국어 풀이 부재(CDS·DDL 소개 방식과 비일관) | AG04(s#4) | 낮/확실 | [실측 확인] | 채택(경량) |
| C066 | "서울 venue만" 등 한국어 문장 속 필드명 혼용 | AG04(g#7) | 낮/확실 | [실측 확인] | 채택(경량) |
| C067 | `grant select` ↔ 표준 SQL GRANT(수여 대상 있는 실행문) 차이 미짚음 | AG03(o#6·s#6) | 중/추정 | [코퍼스 간접지지] DEFINE_ROLE: 접근 조건은 "evaluated as an additional selection condition" | 보강 후보(1줄) |
| C068 | DCL 비상속의 기술 배경(RLS가 아니라 SQL 계층 조건 주입) / RLS 경험자 브리지 부재 | AG03(m#6·s#5) | 중/추정 | [미확인 — 방향은 C062 코퍼스와 정합] | 백로그(1문장 선택) |
| C069 | L06-S01만 venue=도시명(SEOUL/BUSAN/JEJU)+C004·C005 추가 행 — 형제 위젯(올림픽홀·고척돔·KSPO돔)과 같은 엔티티 데이터 불일치 | AG02(o#7) | 낮/확실 | [실측 확인] DAC_CFG ↔ CAO_CFG/CBS_CFG | 채택 — 권한 축용 별도 필드(city) 또는 값 정합화. **H1(시드) 교정과 한 세트로** |
| C070 | L06 마무리 "모델링·노출·**보호**했다 … 모아 적용해" ↔ L07 실습에 권한 0(전부 #NOT_REQUIRED) | AG05(o#8) | 낮/확실 | [실측 확인] L06:99 ↔ L07 코드 3개 | 채택 — C073과 한 세트(브리지 범위 축소 또는 L07 범위 선언) |

### §2-8 L07 (7)

| ID | 주제 · 요지 | supporters | sev/conf | 검증 | 추천 |
|---|---|---|---|---|---|
| **C071** | prereq에 L02(ZI_/ZC_·nesting)·L06(DCL) 누락 — 본문이 직접 링크·전제하는데 선언은 4개뿐 | AG01(m#8)·AG05(m#3·o#7·s#4)·AG06(m#5) — 3종/3모델 | 낮/확실 | [실측 확인] L07:8 ↔ 61행(nesting)·120행(L06 링크) | 채택 — prereq에 CH23-L02·CH23-L06 추가(빌드 무영향·게이팅 근거 정합) |
| **C072** | 캡스톤 위젯 capacity 누락 — CBS_CFG 3필드뿐이라 ⑤Data Preview는 ZI/ZC 두 표가 완전 동일(안내문 "노출 필드는 달라도"가 헛말)·⑥소비 SELECT는 미리보기에 없는 capacity 조회 | AG02(m#3·o#4·s#5) — 1종/3모델 | 중/확실 | [실측 확인] CBS_CFG(3필드)·cds-builder-stepper.js:42(3열 하드코딩)·:51(SELECT 4필드) | 채택 — cfg에 capacity 추가+헤더 cfg 주도화, 또는 ZC가 실제로 열을 거르는 시나리오로 재설계 |
| C073 | 캡스톤 DCL 미적용·범위 미명시 — '통합' 표방 대비 L06 회수 0, 선택 과제도 없음 | AG03(m#8)·AG05(g#5) (+C070 연동) | 중/확실 | [실측 확인] | 채택 — 도입부 "권한은 이번 범위 밖(지점만 확인)" 1줄+체크리스트 항목, 또는 선택 과제 |
| C074 | 캡스톤이 버튼 순서 클릭 확인에 그침 — 코드 구성·판정 요소 없음(헛체험 성향) | AG02(g#6) | 중/확실 | [미확인 — 엔진 구조상 정황 부합] | 본선 판단(위젯 개편 비용 큼 — 빈칸/선택식 도입 여부) |
| C075 | "row-level filter" 용어 이탈 — L06이 정착시킨 '행 단위 권한' 대신 영어 직역 | AG04(m#7·g#10·s#3) — 1종/3모델 | 낮/확실 | [실측 확인] L07:22 | 채택(용어 통일) |
| C076 | 캡스톤이 L04 회수 실패 — @EndUserText/@Semantics 0(DDLX에 @UI.lineItem만), prereq의 L04 주장과 불일치 | AG05(s#5) | 중/확실 | [실측 확인] L07 grep EndUserText/Semantics 0 | 채택 — DDLX에 @EndUserText.label 1～2개 추가(저비용 고정합) |
| C077 | "(활성화 순서 무결성)" 표현 추상적 | AG04(g#11) | 낮/확실 | [실측 확인] | 채택(경량 — "활성화 의존 순서 확인") |

### §2-9 수합자 직권 부기 (28벌 밖 — known-facts 대조로 발견)

**H1 · CH23 위젯 시드가 관통예제 정본과 전면 불일치** — [실측 확인, 기각 사전 C절 대조]
- 실측: CH23-L01-S01·L03-S02·L06-S01·L07-S01 **4개 위젯 전부 C001 artist='아이유'** ↔ 정본 "C001 ARTIST = **안유진**"(known-facts C절, 배치 3에서 하류 CH16/19/20 정합까지 맞춘 확정 사항). capacity도 3000/16000/15000 ↔ 정원 정본 100/50/80. L06-S01은 추가로 C004(김연아)·C005(유재석) 행 신설+venue 도시명(C069와 동근).
- 발견자 28벌은 챕터 내부 정합만 봤으므로(배치 6 = 구 조건, known-facts 미주입) 적발 불가 구조 — AG02/opus#7(C069)만 위젯 간 상호 불일치를 부분 적발.
- 추천: **본선 채택 검토 필수** — AG08(연속성) 축 소관이나 CH23 verdict에서 일괄 교정이 경제적(위젯 cfg 4곳 artist/capacity 정합화). 시드 원칙 "표기와 시드가 다르면 시드 쪽이 정본".

---

## §3 기각 사전(known-facts §A) 대조

- **A절(⑦～㉘) 정확 일치 재제기: 0건.** CH23 발견은 전부 CDS/DCL/annotation 도메인 — 기존 A절(Internal Table·Open SQL·FORM/METHOD 계열)과 겹치는 주장 없음. 사전 재기각 대상 없음.
- **신규 기각 사전 후보(본선 확정 제안)**:
  - (㉙ 후보) "ABAP CDS에 단어형 cardinality(`association of one to many …`) 없음" → **반박**: `OF {EXACT ONE|MANY|ONE} TO {…}` 9형 명문·CDS view entity 가용·SAP **권장** 표기. `ABENCDS_CARDINALITY_V2`. (C035 — gemini '높음·확실' 오판 포함 3벌)
- **B절(코퍼스 확정 사실) 추가 후보**:
  - `#NOT_REQUIRED`는 **DCL이 존재하면 평가한다**(#CHECK와 런타임 동일 — 차이는 DCL 부재 시 경고 유무). 존재하는 DCL을 무력화하는 값은 `#NOT_ALLOWED`(또는 `WITH PRIVILEGED ACCESS`). `ABENCDS_1180334353_ANNO`·`ABENCDS_F1_DEFINE_ROLE`. (C058)
  - `@MappingRole: true`는 DEFINE ROLE 앞에 **필수**이며 의미는 "**이 CDS role을 모든 사용자에게(클라이언트 무관) 배정**". `ABENCDS_F1_DEFINE_ROLE`. (C062)
  - CDS 요소 annotation은 **직접 투영된 요소만 상속**(표현식 사용 시 비상속, `CAST PRESERVING TYPE` 예외·`@Metadata.ignorePropagatedAnnotations`로 차단), 통화 참조 annotation은 전파 명문. `ABENCDS_ELEMENT_ANNOTATIONS_PV`·`ABENCDS_AMOUNT_FIELD:43`. (C022)
  - cardinality는 "mainly **descriptive, not prescriptive**" — 데이터 강제 아님·불일치는 대개 구문 경고·결과 undefined. `ABENCDS_CARDINALITY_V2`. (C036)

---

## §4 등급 집계·종합 소견 (추천 — 확정은 본선)

**집계** — 발견자 의견: 유지 3 · 경미 17 · 보강 8. 명목 sev: 치명 0·높음 17·중간 78·낮음 81. 실측 후 실질 구도:

- **실질 치명～높음 축 3**: C058(#NOT_REQUIRED 사실 역전 체험 — 코퍼스 확정, B5 CH18 EXCEPT 토글과 동형) · C046(16벌 수렴 — 존재하지 않는 필드를 "실제로 있으니"로 단정, 따라 하면 활성화 실패) · C020(14벌 수렴 — 레슨이 금지한 용어를 자기 캡션이 사용).
- **높음 준위 국소 결함**: C002(ADT 전 커리큘럼 미도입 실측 확정) · C021(annotation 선노출) · C031(ZI_Perf 미존재 참조) · C051(주석↔annotation 호칭) · C059(pfcg_auth 미분해) · C061(L02↔L06 상속 대비 부재).
- **기각 추천 2**: C035(단어형 cardinality — 코퍼스 반박, 신규 기각 사전 후보) · C005(Calculated Element 용어 충돌 — RAP 공식 용어는 Virtual Element라 근거 부정확). C062는 conflict를 코퍼스로 해소(opus 채택·sonnet 기각).
- **위젯 결함군**(AG02 수렴): C048(L04 필드명)·C072(L07 capacity)·C034(L03 capacity)·C032(관계도 복합키)·C049·C069 — 전부 cfg/엔진 국소 수정.
- **직권 부기 H1**: 시드 정본 위반(C001=아이유·capacity 3000계) — 발견자 구조상 사각, 본선 라우팅 필수.

**종합 소견**: 챕터 골격(불편→해결 서사·계층 스토리·레슨 분할)은 4모델 공통으로 안정 평가(AG05 계열 summary 일치). 결함은 ① 사실 오류 3점(C058·C046·C050)과 ② 레슨 간 참조 정합(C020·C031·C047·C048·C071) ③ 용어·풀이 결손(C051·C052·C059·C063 등)에 집중되며 전부 국소 교정 가능. 다만 C058은 "체험이 잘못된 보안 모델을 각인"하는 유형이라 방치 비용이 크고, C046은 7종 전원·4모델 전원 수렴이라는 캠페인 최고 수렴 기록.

**등급 추천: 보강 권장** (경계 기준 "높음 3+" 충족: C058·C046·C020·C051·C061. 단 구조 결함이 아닌 국소 교정 집합이므로, 본선이 C058·C046·C020을 필수 교정으로 묶고 나머지를 백로그화하면 '경미 수정' 하향 재량도 성립 — 사유 명기 조건).

*(수정 실행은 별도 지시 — 이 문서는 발견·추천까지.)*
