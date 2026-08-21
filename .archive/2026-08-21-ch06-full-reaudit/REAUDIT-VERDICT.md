# CH06 신판 전면 재감사 — AG10 수합·판정 (2026-08-21)

> 대상 = CH06 자유 재작성판(15레슨+_chapter+위젯 21종, PR #56·#58 병합 후 main). 구성 = 발견자 7종(AG01～06·AG09) × 4모델 = **28벌, 수거 28/28·결측 0**. gemini는 3.7-flash-high + 엄격화 라이더(첫 적용 — 3.6 산출 7벌은 `raw/CH06/_superseded-gemini36/` 보관). 총 발견 **138건 → 클러스터 판정: 채택 ~46(치명 0) · 기각 24(사전 재발 8 포함)**.

## §1 등급 매트릭스 (유지 3 · 경미 18 · 보강 7 · 재집필 0)

| | opus | sonnet | gpt-5.6-sol | gemini-3.7 |
|---|---|---|---|---|
| AG01 은서 | 경미(8) | 경미(6) | 보강(4) | 경미(4) |
| AG02 준호 | 보강(8) | 유지(0) | 유지(0) | 경미(4) |
| AG03 경력자 | 경미(8) | 경미(8) | 보강(8) | 보강(7) |
| AG04 문장 | 경미(17) | 경미(6) | 경미(5) | 경미(3) |
| AG05 교수설계 | 경미(7) | 경미(1) | 보강(3) | 경미(6) |
| AG06 기술감수 | 경미(7) | 경미(3) | 보강(5) | 보강(6) |
| AG09 코드 | 경미(1) | 경미(2) | 경미(1) | 유지(0) |

- 환산 62/100(유지100·경미67·보강33). 참고치 — 축 구성이 달라 AG01 단독 재측정(67)과 직접 비교는 부적절.
- **명목 치명 2·높음 9 → 실질 치명 0**: 치명 2는 전부 기각 사전 ⑦ 재발(§2-1), 높음 9 중 6이 코퍼스 반증 기각.

## §2 기각 (24) — 전 건 코퍼스/설계 근거

1. **[사전 ⑦ 재발 x5 — 명목 치명 전량]** "HASHED에 SORT 불가/구문 오류"(AG03·AG06 gemini 치명, AG03·AG06 gpt 높음, AG05 gemini 중간) → `ABAPSORT_ITAB`: "expects a standard table **or a hashed table**" + 해시 정렬 실행 예제 2종 실재. 배치 2에서 확정된 사전 그대로 자동 재기각.
2. **[신규 기각 후보 ㉗] "standard key에서 string 제외"**(AG03·AG06 gemini 높음·확실 + 파생 "string 키로 WITH TABLE KEY 무효" 중간) → `ABENITAB_STANDARD_KEY`: standard key = "all components with **character-like** and byte-like data types" + `ABENCHARLIKE_DATA_TYPE_GLOSRY`: character-like에 **text string type 명문 포함**. 3벌 전면 오판.
3. **[신규 기각 후보 ㉘] "WITH HEADER LINE/OCCURS + string = 활성화 차단"**(AG09-sonnet 높음·추정 x2) → `ABAPDATA_HEADER_LINE`: 금지는 "**table-like line type**"뿐, "구조 행 타입은 table-like **컴포넌트까지 허용**" 명문. `ABAPDATA_BEGIN_OF_OCCURS`: 컴포넌트 규칙은 일반 `DATA BEGIN OF`와 동일.
4. **[사전 재발] "BINARY SEARCH 실패 8은 INDEX 전용"**(AG06-sonnet 낮음·추정) → B2R2 확정: `ABAPREAD_TABLE` 4 또는 8.
5. **[기각] "AT 마스킹은 string 포함 전 문자형"**(AG06-gemini) → `ABAPAT_ITAB`: "character-like **flat** data type ... set to *" — flat 한정 명문. 본문 "고정 길이 문자 필드"가 정확.
6. **[기각] "COLLECT는 flat 행 요구 — ts_person 불가"**(AG03-opus 중간·추정) → `ABAPCOLLECT`: 제약 = "비키 컴포넌트 numeric"뿐. ts_person(키 name/비키 age·숫자)도 실제 합법 — 본문 제약 서술이 코퍼스 그대로.
7. [설계 기각] "MODIFY 우선은 과도, ASSIGNING이 실무 표준"(AG03 gemini·gpt 계열) → 사용자 확정 설계(2026-08-19: MODIFY 기본기 강조 + FS 위험 격상). L08 말미 CH28 예고로 이미 균형.
8. [설계 기각] "STANDARD 기본 권고 부적절"(AG06-gpt) → 입문 단계 의도된 노선(측정 없는 조기 최적화 지양).
9. [게이팅 기각] "모던 경로(테이블 표현식·GROUP BY 순회) 미안내"(AG03-gpt L05·L12) → R6: CH18 전 노출 금지가 정답.
10. [재량 기각] L14 옛 코드에 string 고증 위화감(AG06-opus 추정) → 합법성 코퍼스 확정(§2-3) + ts_person 재사용의 학습 연속성 우선.
11. [재량 기각] 캡스톤을 L12 직후로 재배열(AG05-gpt) · L01 introduces 과다(AG05-gpt) · L04 비유 재설명(AG03-gpt) 등 구조 재배열 계열 → 3부 구성·기초 묶음은 설계 의도, 재배열 비용 > 이득. 경험자 동선은 §3-E 경량 보강으로 갈음.

## §3 채택 클러스터 (~46건 → 작업 5묶음)

### A. 사실·코드 (필수급 6)
- **A1 [4벌 수렴·확실] L05 sy-subrc "문장 하나가 실행될 때마다" 오서술** — 실제로는 결과를 정의한 문장(READ·LOOP·SELECT 등)만 설정, 그 외 문장은 직전 값 유지. 교정 + "그래서 READ *다음 줄*에서 바로 확인" 규율과 연결. ⚠️ 재측정 보강(2026-08-19)이 만든 문구 — "보강이 만든 결함" 계열.
- **A2 [2벌] L05 APPEND의 Index Table 전용 제약 누락** — `ABAPAPPEND` "appends ... to an internal **index table**". 넣기 3형제 표에 한 줄(HASHED는 INSERT INTO TABLE).
- **A3 [2벌·높음 확실] L14 한 블록 내 `it_person` 이중 선언** — ①(WITH HEADER LINE)·②(OCCURS)가 같은 펜스라 복붙 시 구문 오류. 블록 분리(각자 펜스 + "양자택일" 명시).
- **A4 [4벌 수렴] L04 사물함 비유 내부 충돌** — 해시 설명 "'몇 번 사물함'인지 바로 알아낸다"(번호 사용) vs Index Table 절 "사물함에 번호표가 없듯". 해시 쪽에서 번호 낱말 제거("어느 칸인지 바로").
- **A5 L07 비용 표 HASHED 각주 모순**(AG01-opus 중간) — 각주가 어느 행(WITH KEY vs WITH TABLE KEY)을 말하는지 재서술.
- **A6 L05 gt_person 키 전후 불일치**(AG01-opus) — L03에서 키 명시 선언을 보여 준 뒤라 "키를 안 적은 standard key" 부연을 조건문으로 교정.

### B. 게이팅·front-matter (R15/R10 — 5)
- **B1 [4벌 수렴] L07 LOOP 선행 노출 정리** — 본문 '훑는 길' 절 LOOP 언급 + 위젯 사용을 front-matter `advanceUse`로 승인 등재 + 본문 1곳 `[선행 사용]` 표기.
- **B2 L12 prereq에 `CH06-L08` 추가**(LOOP 전제) · **B3 L15 prereq에 `CH06-L02` 추가**.
- **B4 L05 "다다음 레슨" 위치 오기**(실제 세 레슨 뒤) 교정.
- **B5 L14 REFRESH 약속 회수**(L01 예고·keywords 실재, 본문 부재) — 옛 코드 한 줄(`REFRESH it_person.` = 본체 비우기, obsolete) 추가.

### C. 위젯 (AG02 축 — 7)
- **C1 [3벌 수렴] L08 기본기 체험 공백** — 본문이 "먼저 손에 익히라"는 LOOP+MODIFY(복사본 함정→반영)가 체험 0, ASSIGNING만 체험 존재. L08-S01에 함정→MODIFY 막 추가(또는 S02 앞 신설).
- **C2 [확실] L09-S01 시드 자기반증** — 중복 홍길동이 이미 인접(2·3행)이라 "반드시 먼저 SORT" 서사가 데이터에서 성립 안 함. gt_busan 순서 1줄 교체로 중복을 떨어뜨림.
- **C3 L13-S01 안쪽 LOOP/ENDLOOP 줄 하이라이트 누락**(중간) — 스텝 line 배열 보수.
- **C4 L14-S01 오른쪽 패널 DATA↔TYPES 순서 역전** — TYPES 먼저로 교체.
- **C5 L07 SORT→순회 순서 변화 미체험**(2벌) — L07-S01에 SORT 후 순회 스텝 추가.
- **C6 L08-S01 FROM 2 TO 5 구간 WRITE 스텝 생략**(3～5행) — 스텝 보완.
- **C7 [경량 백로그] L06 DELETE TABLE·IS INITIAL 체험, L02 LIKE 체험·위젯 위치, L01 통째 대입 위젯 순서.**

### D. 서술 보강 (중간급 — 12)
- D1 L03 '바이트를 담는 타입' 무풀이(2벌 수렴) — 한 줄 풀이 or 단순화.
- D2 L03 standard key에 n·d·t 포함 사실 누락(AG06-opus — "숫자처럼 보이는 NUMC·날짜도 자동 키에 들어간다") — 흔한 실수 절 보강.
- D3 L03 Primary Key ≠ DB PK(UNIQUE 통념) 대비 한 줄(AG03 2벌).
- D4 L04 '범위 탐색' 무풀이 — 한 줄. D5 L04 index ≠ DB 인덱스 구분 한 줄(AG03 2벌).
- D6 L05 INSERT INTO TABLE 중복 실패(subrc 4·미삽입) 한 줄(AG06 2벌 수렴).
- D7 L07 "정렬 자체 비용 — 단발 조회면 순차가 이득"(AG03-opus) + **BINARY SEARCH 후 삽입/삭제 시 정렬 붕괴 경고**(AG06-opus) — 흔한 실수 2줄.
- D8 L08 sy-index는 LOOP에서 미갱신 경고(AG03-opus — CH04 학습자 함정).
- D9 L12 '왼쪽/오른쪽' 방향어(3벌) — "선언에서 먼저 적은/나중에 적은 필드"로 재서술.
- D10 L10 "이름만 만난 적 있다" 축소 서술(AG05-opus) — L02 학습 사실 정직화.
- D11 L13 가변 요소 "셋" 단정(AG06-sonnet) — string의 바이트판 xstring 반 줄 병기.
- D12 L11 금액 `TYPE i` 실무 각주(AG06-opus) — "실무 금액은 소수·통화 타입, 뒤 챕터" 한 줄 절충.
- (+ L02 LIKE '값은 복사 안 됨' 한 줄, L05 경력자용 '예외 대신 반환 코드' 반 문장, L06 DELETE TABLE 첫 1건 명시, L01 메모리 한계 반 줄, L13 상품 셋↔코드 둘 정합, L15 CLEAR 입도 차이 반 줄, L03 낱말 표와 새 3종 관계 명시, _chapter·경험자 동선 1문장)

### E. 문장·표기 미세 패스 (AG04 계열 낮음 ~25 일괄)
볼드 뒤 조사 분리(챕터 전반 6+) · '못박다'→'못 박다' · 인용 "~라고" · '~처럼' 띄기 · '하늘과 땅이다' 비문+연속 중복 · 줄표 삽입절 과다(_chapter 첫 문장 등 3) · L14 당신/여러분 호칭 · L11 '비키 필드' 풀이 · L10 '사전'→DDIC·논문체 완화 · L01 front-matter 'REFRESH은' 조사 · L15 위젯 제목 '내부 테이블'→Internal Table · L13 n·p 표기/중첩 표기 통일 · L05 '이 형'→'이 형태' · L06 '정도다'→'정석이다' · L01 Work Area 괄호 gloss 등.

## §4 종합 판정

**"경미 수정" — 보강 1패스로 완결 가능, 재작성 불요.** 실질 치명 0·활성화 차단 0. 사실 결함은 전부 문장 단위 국소(A1～A6)이고, 구조 지적 중 수렴된 것(L05·L08 밀도)도 완화 장치 수준으로 대응 가능. 위젯 축은 AG02-opus 단독 심층이 실질 개선거리를 확정(C1·C2가 핵심). 신판의 뼈대(3속성 프레임·두 좌표·비유 체계·15레슨 분할)는 4모델 전 축에서 유효 판정.

## §5 기각 사전·코퍼스 신규 확정 (원장 반영 대기)
- 신규 기각 후보 **㉗** standard key string 제외 주장(ABENITAB_STANDARD_KEY+ABENCHARLIKE) · **㉘** Header Line/OCCURS deep 금지 주장(ABAPDATA_HEADER_LINE — 금지는 table-like line type뿐).
- 코퍼스 신규 확정: AT 마스킹 '*' = character-like **flat** 한정 · COLLECT 제약 = 비키 numeric 뿐 · APPEND = index table 전용 · sy-subrc는 정의된 문장만 설정.

## §6 수정 범위 — 사용자 결정 요청
① **전체 일괄**(A+B+C+D+E ~46건, 본문 작업자 2 + 위젯 작업자 1) ② **필수+수렴만**(A 전부 + B 전부 + C1~C4 + D 중 수렴분) ③ 보고만 하고 보류.
— 권고 = ①. 전 건이 국소 수정이라 1패스 비용이 낮고, C7(경량 백로그)만 재량 제외 가능.
