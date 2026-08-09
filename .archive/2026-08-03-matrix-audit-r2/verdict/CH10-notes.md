# CH10 R2 본선 판정 노트 (예비 — 소스 실측 완료분)

> 작성: 본선(Fable). 수합본 도착 전 선행 실측.

## 핵심 채택 확정 — R2 캠페인 대표 발견

- **L04 RETURNING 인라인 완전타입 = 활성화 차단(높음·확실)**: L04:35
  `RETURNING VALUE(rv_result) TYPE p LENGTH 8 DECIMALS 2.` — ABENTYPING_COMPLETE 확정:
  메서드 시그니처 typing 문법에 LENGTH/DECIMALS 부가어 없음(complete_type = DDIC/TYPES 선언 타입/비제네릭 내장 타입만).
  콜아웃(L04:53-56)도 같은 인라인 형태를 정답처럼 제시 — 동반 오류.
  **원인 = R1 본선 지시 문구**(제네릭 p 교정 지시가 인라인 형태를 제시) — 보강 유발 신규 결함, R2-SUMMARY 핵심 등재.
  교정 = `TYPES ty_amount TYPE p LENGTH 8 DECIMALS 2.` + `RETURNING VALUE(rv_result) TYPE ty_amount`
  + 콜아웃 "길이까지 적는다" → "명명 타입(TYPES)으로 완전 타입을 만들어 준다"로 재서술
  + 사용처(L04:68-72 gv 선언)와 위젯(CH10-L04-S01) 정합 확인.

## 기각 방향 확정 (코퍼스 재확인 후 판정서 반영)

- **AG06-sonnet "METHOD IMPORTING 제네릭 c/n/p/x 불가" 주장 = 기각**: IMPORTING/EXPORTING/CHANGING은
  제네릭 타이핑 허용(ABENTYPING_GENERIC), 완전 타입 강제는 RETURNING(함수형 메서드)만 —
  R1 판정과 동일(ABAPMETHODS_FUNCTIONAL). `IMPORTING iv_amount TYPE p`(L04:34)는 합법.
- **AG06-sonnet "FORM도 OPTIONAL/DEFAULT 지원 — 본문 사실 오류" 주장 = 기각**: FORM 파라미터
  인터페이스(ABAPFORM)에 OPTIONAL/DEFAULT 부가어 없음 — FUNCTION 모듈 전용. 본문 L02:104-107 정확.
  판정서에서 ABAPFORM.md grep으로 못 박기. → 기각 사전 신규 등재 후보 2건.

## 수합본 도착 후 (88발견/61클러스터/28벌/dropped 0 — R1 173발견 대비 51%)

높음 6 판정 방향:
- **C001 채택**(위 확정) · **C004 기각**(AG06-s 반대 주장 — IMPORTING 제네릭 합법).
- **C002 채택(높음→중간 하향)**: 실측 — L03:15 "SE37에서 만들고 관리" 언급뿐, '이 레슨은 부르는 쪽만'
  경계 선언 없음(L05는 명시 — 비대칭 확인). 교정 = 도입/마무리 경계 1문장 + 만들기 시점 L1 예고.
- **C003 채택(중간)**: L07 과제가 FORM(USING/CHANGING) → 정적 메서드 변환을 요구하나 대응 규칙
  (USING→IMPORTING·CHANGING cv_→RETURNING) 교육 부재 — 과제에 대응표 1줄 추가.
- **C005 채택(중간～높음)**: L05:30 `zcl_util=>format_amount` — Z 커스텀 클래스인데 생성 절차·
  "미리 만들어 뒀다 치자" 가정 선언 모두 부재. 그대로 치면 클래스 없음 오류. 교정 방향 판정서에서
  (가정 명시+위젯 시뮬 안내 vs 표준 클래스 교체).
- C007: L07:49 `-1` 센티널 실측 — 잔여석 계산이 음수 가능한지 get_remaining 로직 확인 후 낮음~중간.
- **C006 기각(재발 오판 — 기각 사전 ⑫)**: "TYPE table-field 구문 오류" 주장 — TYPE dbtab-field는 합법(ABENTYPES_REFERRING).

중간·낮음 주목:
- **C008 채택(중간)**: L02 div FORM이 0-나눗셈 시 cv_r 미설정 RETURN — 실패 신호 부재. x3.
- **C007 채택 후보(중간)**: L07 -1 센티널이 초과예매 음수와 충돌 — 실측.
- **C020 기각**(FORM OPTIONAL/DEFAULT — 위 확정, 본문이 옳음).
- **C036**: `/` 반올림(i 대입 시 truncation 아닌 rounding) — 기각 사전 ①(7/2 계산타입)과 교차 확인 후
  낮음 채택(콜아웃 1줄) 또는 기존 서술 충분 시 기각.
- **C014·C015 채택 후보(위젯)**: L01-S01 '런타임 오류' 오라벨(정적 구문 오류가 맞음)·L07-S01 sy-subrc '-' 잔존.
- **C029 채택 후보(중간)**: abap_bool = 길이 1 문자 타입 정체 미설명.
- C010(OTHERS 과대)·C011(RFC 명칭)·C012(EXCEPTIONS≠예외전파)·C021(RETURN 시 값-결과 복사)·
  C037(MESSAGE RAISING 예외)·C022(전역 메서드 예외 무언급) — 기술 감수 계열, 코퍼스 스팟 후 채택 다수 예상.
- C060·C061(front-matter) — 메타 정합, 경미.

grade 분포 R2: 보강 8 · 경미 12 · 유지 8 (R1 판정 = 보강 권장 → R2 의견 중심 = 경미).
