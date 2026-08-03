# 커리큘럼 축 최종평가 — AG07 게이팅 · AG08 연속성 (본선: Fable 5)

> 평가일: 2026-08-03 · 입력 = AG07 4벌(81발견) + AG08 3구간 10벌(CH01～17 22 · CH18～24 26 · CH25～39 33) = **14벌 162발견** · 결측 1(AG08-CH01-17/agy — CANCELED 2회 후 재발사에서 `escalate_admin` 권한 헤드리스 자동 거부 2회, MISSING 마커 보존)
> 성격: 축 발견의 수정 대상은 전부 **배치 1(CH02～04) 밖** — 본 문서는 판정 + **후속 배치 라우팅 표**가 정본이다. 별도 지시 없이는 여기서 수정하지 않는다.

## 종합판정

- **게이팅 축(AG07): 커리큘럼 골격 건전** — 하드 게이트(STRUCT·PREREQ·R6) 0을 4모델·정적 도구가 합치 확인. 실위반은 국소 8건(전부 인접 레슨 간 무표시 선행 사용·기술 과잉), 나머지 대량 후보(EARLY 284)는 분류 전수 결과 적법 관례·도구 동음이의 오탐·원장(도구 매핑) 결함이었다.
- **연속성 축(AG08): 경미～중간 드리프트 축적** — 관통 서사·약속 회수는 견고(CH39가 CH01까지 닫음). 결함은 **데이터 정본 드리프트**(perf_no '01' 관행화·title 필드 발명·잔여석 집계 grain·시드 2개)와 **레슨 간 산출물 표기 흔들림**에 집중. 치명 0.

## AG07 판정

**실위반 채택 8 (높음 — 해당 챕터 배치에서 수정)**
| 위치 | 요지 | 근거 |
|---|---|---|
| CH08-L02 (×2) | `INTO TABLE`·`INTO CORRESPONDING FIELDS OF`를 L03·L04 정식 도입 전에 정의·코드로 선행 | sonnet(분류 전수) |
| CH10-L02 · CH11-L04 | `START-OF-SELECTION` 재사용에 [선행 사용] 표시·안내 부재(CH10-L01만 표기) | sonnet 확실 |
| CH17-L06 | `set_table_for_first_display` 5파라미터 완전 호출을 L07 '첫 완성 순간' 전에 선노출 | sonnet |
| CH24-L05 | `FOR VALIDATE ON SAVE` 핸들러 전체(시그니처+READ ENTITIES)를 L07 Validation 도입 전 노출 | sonnet |
| CH24-L09 | EML 3문장의 동작(버퍼·all-or-nothing)을 foreshadow 선언 수위 넘어 기술 | sonnet(분류 위반 확정) |
| CH28-L03 | `ASSIGN COMPONENT … ELSE UNASSIGN` 전체 문법을 L04 도입 전 사용 | sonnet |

**경계 채택 1 (낮음)** — CH29-L02의 `MATCH OFFSET/LENGTH` 실행 코드가 L03 정식 도입 직전 [선행 사용] 무표기(gpt). 분류 배치의 '오탐' 판정은 **도구 키 매핑**(cl_abap_matcher L06) 건이라 별개 — 본선은 표기 1줄 수위로 채택.

**gpt 엄격 판정 17건 → 14건 기각(관례 적법)** — 개요·경계 레슨의 로드맵 표(CH14-L08·CH15-L01·CH16-L01·CH17-L01·CH20-L01·CH24-L01·CH36-L01·CH39-L01)는 ①foreshadow/introduces 선언 동반 ②"지금 외울 필요 없음" 명시 ③코드 없음 조건에서 **집 관례로 적법**(opus·sonnet 분류 전수와 합치). 단 **정책 관찰**로 남긴다: R15의 L1 문언("1～2문장")과 개요 레슨 관례 사이에 간극이 있어, 관례 명문화(04 R15 보강) 여부는 사용자 결정 사항. gpt 17건 중 CH24-L09 등 3건은 위 채택과 합류.

**도구(원장) 결함 채택 — 감사 도구 v2 백로그**
- intro 매핑 단일 소유 한계: NULL(CH08-L05 자체 선언 미인식) · Checkbox/Radiobutton(CH15-L09 자체 도입) · Selection Screen(CH03-L03 나선) · MATCH(cl_abap_matcher와 혼동) · 골격/내부 2단계(CH16-L02) 표현 불가.
- **CH22-L07 introduces 부정확**(Stable Refresh — CH17-L08 기도입 재선언, 유일한 실원장 결함) → CH22 배치에서 front-matter 수정.
- foreshadow 선언 갭 정비 대상: CH01-L04(PARAMETERS) · CH01-L06(STMS·DDIC 문자열 불일치) · CH09-L07(3종 중 1종만) · CH14-L08(범위 협소) · CH17-L01(전무) · CH24-L02(전무) · CH10-L05(표기) → 각 챕터 배치에서 front-matter만 정비.
- 동음이의 오탐 확정(도구 개선 입력): DATA/Data Element · APPEND/.APPEND STRUCTURE · INSERT INTO TABLE/SELECT INTO TABLE · ASSIGN 서술어 · sy-mandt/MANDT · SIGN(도메인 속성/RANGES) · Layout(화면/ALV) · Constructor(표현식/메서드) · LIKE(선언/SQL) · CAST(SQL/OO) — gemini 8건 보고는 전부 이 계열의 정확한 meta 판정.

## AG08 판정 — 주제 클러스터 채택·라우팅

**A. 데이터 정본 드리프트 (높음 우선)**
| # | 요지 | 지지 | 라우팅 |
|---|---|---|---|
| A1 | **perf_no '01' 드리프트** — CH18까지 '001' 준수, CH21에서 축약 시작 후 CH27·CH38·CH39까지 관행화(구간 3에서 '001' 등장 0회). CH33-L04 업로드 형식엔 perf_no 자체가 부재 | CH21 4모델 전원 · CH27/CH38/CH39 3모델 · CH33 gpt | CH21·CH27·CH33·CH38·CH39 배치에서 '001' 통일(+CH33 형식에 perf_no 추가). 정본(N3) 유지 — 캐논 변경 불요 |
| A2 | **공연명 필드 발명** — CH16-L10 `ZCONCERT-TITLE` 실재하지 않는 필드 · CH20-L07 실습 표 `title` 컬럼(값은 아티스트명) · CH37-L01/CH39-L07 공연명 출력 약속이 텍스트 테이블(ZCONCERT_T) 미연결로 불이행 | CH16 3모델 · CH20 4모델 전원 · CH37/CH39 gpt | CH16·CH20·CH37·CH39 배치 — ZCONCERT_T 경유로 통일 |
| A3 | **잔여석 집계 grain 위반** — 정본 '공연 정원 − 그 회차 소진'인데 공연 단위 합산: CH13-L08 · CH19-L08 · CH20-L07(전 챕터 스스로 '연습용 단순화' 명시 후 미복원) | 각 2모델(gpt+opus) | CH13·CH19·CH20 배치 — 회차 grain 복원 |
| A4 | **시드 공연 2개** — CH09-L09가 공연 2개만 생성(정본 C001·C002·C003) | 3모델 높음 | CH09 배치 |
| A5 | CH23-L04 — ZI_Flight에 없는 price·currency를 '있다' 단언(핵심 예제 활성화 차단급) | opus | CH23 배치 |
| A6 | CH36-L05 — concert_id `abap.char(10)`(정본 C4) | 3모델 | CH36 배치 |
| A7 | CH24-L01 취소=물리 삭제 서사(정본 status='C' 보존) · CH24-L09 골격·주석 상태로 '완성' 선언 | gpt | CH24 배치 |

**B. 좌석 상한·검증 모순 (CH31 집중)** — L05 같은 IF 안 판정 100 vs 메시지 "1부터 10까지"(3모델·높음) · L02/L05(100)↔L06(10) 챕터 내 기준 분열 · L06 introduces '변경 행 수집' 미구현 · L03 전역 변수로 CH30-L05 캡슐화 설계 자파 · L04 `gt_perf_alv` 무예고 전환 → **CH31 배치**(+CH30-L04 `mo_grid` 미선언 사용 — 2모델 — CH30 배치).

**C. 산출물 표기·이름 흔들림** — CH33-L03 `ZBOOK-CONCERT`/`SAPMZBOOK`(2모델) → CH33 · CH36 L02↔L06 `zcl_booking_amdp`↔`zcl_booking_stats_amdp`+미정의 인터페이스(2모델) → CH36 · CH22 클러스터(CAPACITY 텍스트·SEATS/STATUS 필드·flat↔deep 자파·ts_perf_alv→ts_row·SFLIGHT 계열 오타, opus 5건) → CH22 · **CH18-L08 `ts_booking` 무정의 사용**(opus — 본선 grep 확증: CH28의 동명 4필드 축소판과 상이 맥락 재사용도 실재) → CH18(정의 추가)·CH28(이름 차별화 검토) · CH06 `ts_person` 필드 드리프트(sonnet) → CH06.

**D. 라벨·상태·예고 정합** — CH12 4곳 'N'='예약'(정본 N=신규, 2모델) → CH12 · CH16-L03 상태 `R`/'대기' 발명 → CH16 · CH14-L03 ZCONCERT_T 'CH09에서 만든 짝' 전제 오류+안유진 C003 오독 → CH14 · CH01-L05 [선행 사용] 안내가 sy-datum 부재 레슨(CH04-L01)을 지목(실재는 CH04-L05) → CH01 미세 수정 · CH06-L02→CH07 데모 약속 미회수 → CH07 · CH15-L09 SSCRFIELDS 예고 미회수 → CH16 · CH09-L02가 CH03-L01의 무존재 예고 회수 → CH09 · CH21-L09 이벤트 'ALV에서 그대로' 예고 vs CH22 미사용 → CH22 · CH38-L06 메시지 클래스 ZMSG↔ZBOOK(2챕터 상이) → CH38 · CH38-L03 perf_no 초기값 데이터 → CH38 · CH29-L08 offset 44→43 실측 오차(opus) → CH29 · CH35-L05 status='N' 집계(정본 <>'C') → CH35 · CH37-L05 '금액 0원' 예시(정본 무필드, 2모델·약) → CH37.

**E. 구조 관찰(수정 아닌 검토 항목)** — `thread: false` 선언 챕터(CH34·CH35·CH38)가 실제로는 관통 산출물 위에 직접 축적(opus) → **09 원장 검토**(선언 완화 or 유지 — 사용자 결정) · CH32 도입의 CH31 무연결(순수 새 주제 진입 — R15 정직 단절로 볼 여지 우세) · CH36-L01 관통 복귀 브릿지 부재(매끄러움 여지) · CH26 정훈영 부재는 **비위반 확정**(강호동·마동석=직원 역할, 고객 미명시 — 이름 풀 내 사용 적법. sonnet 최종본도 자체 제외).

**소급 확인** — CH04-L07 구구단 '1~9' 표기(AG08-opus)는 **배치 1 CH04-C003으로 이미 수정 완료**(2～9 통일). 축 발견 중 배치 1 챕터 재수정 필요 0.

## 결측·스코어 부기

- AG08-CH01-17/agy: 인증 만료 시간대 CANCELED 2회 → 재로그인 후 재발사에서 `escalate_admin` 요구 도구 자동 거부 2회 → MISSING 확정(마커 보존). 다른 두 구간 agy는 정상 완주 — 대구간(139파일)에서만 권한 요구 전략 선택. 수동 재실행은 사용자 판단.
- 검증기 개선 입력: AG08-CH01-17/sonnet의 `file`이 `CH01/…` 상대 표기라 validate 앵커 폴백 미적중(앵커 실존 자체는 본선 표본 grep으로 확인) — validate.mjs에 `content/abap/` 접두 폴백 추가 백로그.
