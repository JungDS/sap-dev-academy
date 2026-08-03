# CH02 위젯 반영 매핑 — 매트릭스 감사 백로그

> 작업일: 2026-08-03 · 실행자: Opus (CH02 위젯 보강 실행자)
> 입력: `verdict/CH02.md` · `merged/CH02.json`(위젯 몫 9클러스터) · `fixes/CH02-content-map.md`(좌표 변경 3건) · `embeds/_engine/AUTHORING.md`
> 범위: `embeds/abap/CH02-*.html`(기존 5 + 신규 1) · `embeds/_engine/`(신규 엔진 2 + var-box 가산 수정 1) · `embeds/abap/_index.md` · `content/abap/CH02/CH02-L02.md`의 **`::embed::` 선언 1줄만**. 본문 문장·docs 직접수정·타 챕터 위젯·`.project-docs` **무수정**. git commit 미실행.
> 검증: `npm run build:abap` **통과**(pages 270 · glossary parity 0 · 경고 0) + **브라우저 실측**(http://localhost:8143, 위젯 6종 · 레슨 페이지 1) 콘솔 오류 **0**.

## 집계

| 처리 | 수 |
|---|---|
| 반영 | **9** (C034는 부분 — 아래 사유) |
| 보류 | **0** |
| 신규 위젯 | **1** (`CH02-L02-S02`) |
| 신규 엔진 | **2** (`int-div-lab` · `const-lock-lab`) |
| 기존 엔진 수정 | **1** (`var-box` — 가산·opt-in) |

---

## 클러스터별 처리

| ID | 파일 | 처리 | 변경 |
|---|---|---|---|
| **C009** | `embeds/abap/CH02-L01-S02.html` | 반영 | 미도입 `p DECIMALS 2` 시드 변수(`gv_price`) 제거 → 기학습 `string`·`i`만으로 4박스 재구성(본문 C001·C011 교체와 정합). 위젯 전체에서 `P`·`DECIMALS` 문자열 **0** (DOM 실측 `hasP:false`). |
| **C030** | `embeds/abap/CH02-L01-S02.html` | 반영 | note의 "정수 박스엔 정수만, 문자열 박스엔 문자열만 담깁니다" 단정 삭제 → "정수 박스에 담기는 값은 언제나 정수 모양 … **타입에 맞는 값**을 넣는 것이 안전합니다"로 교정. L02 자동 변환은 **선노출하지 않음**(게이팅 유지). |
| **C034** | `embeds/abap/CH02-L01-S02.html` | 반영(부분) | 신규 위젯 없이 **L01-S02를 확장** — ① `VALUE 초기값`: `gv_qty`를 `TYPE i VALUE 10` 라벨 + 선언 직후 쪽지 `10`으로(다른 박스는 `0`) ② `LIKE 짝 변수`: `gv_total`을 `LIKE gv_price` 라벨로 붙여 같은 타입·짝 값(1200↔2400) 시연 ③ **선언 체인**은 리드 문장의 설명으로만 커버(조작 요소 아님 — 체인은 "여러 개를 한 번에 선언"이라 토글로 만들면 인위적이라 판단). 상태 문구도 `stageLabels`로 "선언 직후 — 기본값(VALUE를 적은 변수는 그 값)"으로 교정. |
| **C017** | `embeds/abap/CH02-L02-S02.html` **(신규)** | 반영 | 정수 나눗셈 실험실 신규 제작 — 피제수/제수 입력 2칸 + 프리셋 칩 6개(`7÷2`·`9÷2`·`10÷4`·`8÷2`·`1÷3`·`7÷0`) → `gv_r TYPE i`(반올림)와 `gv_amt TYPE p LENGTH 8 DECIMALS 2`(정확) 결과 카드 대조. `P`는 본문 C004 콜아웃과 동조해 **`선행 사용` 배지 + 리드 1줄**만(정식 도입은 L03로 안내). `CH02-L02.md` '정수 연산의 함정' 절 끝에 `::embed CH02-L02-S02 … | 720::` **1줄 추가** + `_index.md` 등재. |
| **C061** | `embeds/abap/CH02-L02-S01.html` | 반영 | `gv_today` 시드 `'20260702'` → **`'20260623'`**(본문 무수정, 위젯이 맞춤). |
| **C062** | `embeds/abap/CH02-L03-S01.html` | 반영 | `gv_date` 시드 `'20260630'` → **`'20260623'`**. 실측: `+6(2)` → **'23'**(본문 설명과 일치) · `+7(2)` 범위 초과 메시지도 새 값 기준("7번 칸('3')까지는 있지만")으로 정합. |
| **C024 연동**(좌표 변경 3) | `embeds/abap/CH02-L03-S01.html` | 반영 | P 항목 라벨 '압축 소수' → **'패킹 십진수'**(본문 표기와 통일). 위젯 내 '압축 소수' 잔존 0. |
| **C028** | `embeds/abap/CH02-L05-S01.html` | 반영 | 정적 패널(조작 0)에 **상수 재대입 시도 실험** 추가 — 선언 블록(`gv_seats`·`gc_max_seats`) + 값 칩(상수 🔒) + 문장 카드 4장. `gv_seats = gc_max_seats.`(→10)·`… + gc_max_seats.`(→20)·`gv_seats = 25.`(→25)는 성공, **`gc_max_seats = 20.`만 문법 오류** 판정 + "값은 그대로다. 실행 자체가 안 됐으니까" 부기(CH02-L04-S01 오류 데모 패턴 계승). 본문 좌표 변경 2의 이름(`gc_max_seats`/`gv_seats`) 그대로 사용. |
| **C063** | `embeds/abap/CH02-L05-S01.html` | 반영 | 비교 코드 **양쪽 패널**에 `DATA: gv_c TYPE p LENGTH 8 DECIMALS 2, gv_a TYPE p LENGTH 8 DECIMALS 2.` 선언 추가 → 그대로 옮겨 쳐도 `is unknown` 없음. |
| **C031** | `embeds/abap/CH02-L06-S01.html` | 반영 | `data-hint`를 빈칸 구조에 맞게 교정 — "힌트 — 첫 칸엔 키워드만 넣으세요(뒤의 `-001`은 이미 적혀 있습니다). 둘째 칸은 세 자리 번호입니다." **엔진(`fill-blank.js`) 무수정** — 실패 메시지가 같은 `data-hint`를 쓰므로 위젯 속성만으로 해결(오답 유도 `TEXT-nnn` 제거). |
| **좌표 변경 1** | `embeds/abap/CH02-L06-S01.html` | 반영 | 본문 C007로 추가된 선언을 위젯 코드 첫 줄에 반영 — `DATA gv_amt TYPE p LENGTH 8 DECIMALS 2 VALUE '1500.00'.`. (`CH02-L06-S02`는 엔진이 `WRITE` 2줄만 렌더하고 `gv_amt`를 쓰지 않아 **해당 없음** — grep 실측.) |
| **좌표 변경 2** | — | 확인만 | `CH02-L05-S01`의 before/after는 pi 예제라 `gc_10`/`gv_my_var` 이름 충돌 없음. 새로 추가한 재대입 실험은 처음부터 `gc_max_seats`/`gv_seats`로 작성해 본문과 일치. |

---

## 엔진 수정·추가 · 소비자 영향

| 엔진 | 종류 | 내용 | 다른 소비자 영향 |
|---|---|---|---|
| `_engine/var-box.js` | **수정(가산·opt-in)** | ① `v.decl` — 있으면 박스 라벨을 그대로 표기(`LIKE gv_price`·`TYPE i VALUE 10`), 없으면 종전대로 `'TYPE '+type`. 기본값 계산(`initialFor`)은 **언제나 `type` 기준**이라 무영향. ② `cfg.stageLabels` — 상태 문구 3종 덮어쓰기, 없으면 종전 문구. 인덱스 주석도 함께 갱신(R8). | **소비자 = `CH02-L01-S02`·`CH02-L02-S01` 둘뿐**(grep 실측, 둘 다 이번 작업 범위). 미사용 소비자 `CH02-L02-S01`을 브라우저로 회귀 확인 — 라벨 `TYPE d` 등 종전 표기·상태 문구 "선언 직후 — 타입 기본값" **그대로**. 타 챕터 영향 0. |
| `_engine/int-div-lab.{js,css}` | **신규** | IDL_CFG 주도 · 입력 2칸 + 프리셋 칩 → 코드 2줄 라이브 갱신 · 결과 카드 2장 · verdict(base 중립 + ok/bad 명시) · 상용 반올림(0에서 먼 쪽) · 제수 0 = bad. | 신규 파일이라 기존 소비자 0. |
| `_engine/const-lock-lab.{js,css}` | **신규** | CL_CFG 주도 · 선언 블록 + 값 칩(🔒) + 문장 카드 → ok(값 갱신)/bad(문법 오류·값 불변). **CSS는 `.cl-*` 조각만**(리셋·`.wrap`·`.hd`·`.note` 없음) — `CH02-L05-S01`이 주 엔진 `before-after`와 함께 로드하며 `data-eng="before-after"`를 유지해 기존 `.ba` 다크 오버라이드가 그대로 적용되게 했다. | 신규 파일이라 기존 소비자 0. |
| `_engine/_dark.css` | **재생성** | `node tools/gen-embed-dark.mjs` 실행(엔진 190종). | **생성 결과 diff 0바이트** — 신규 엔진 CSS를 토큰/`color-mix` 전용(하드코딩 hex 0)으로 작성해 덮을 라이트색이 없다. 전 위젯 공유 파일이지만 **내용 변화 없음 = 영향 0**. |

> `fill-blank`·`len-shape-grid`·`before-after` 엔진은 **무수정**(C031·C062·C063 모두 인스턴스 쪽에서 해결).

---

## 브라우저 실측 (http://localhost:8143 · DOM 측정 우선, P3/P4 유의)

| 위젯 | 콘솔 | 실조작 시나리오 · 실측 결과 |
|---|---|---|
| `CH02-L01-S02` | 오류 0 | 3단 토글 실클릭 — 선언직후 `gv_name=''`·**`gv_qty=10`(VALUE)**·`gv_price=0`·`gv_total=0` → 대입 `'정훈영'`/25/1200/2400 → 재대입 `'손흥민'`/3/900/1800 → 다시 선언직후로 순환 ✅. 라벨 **`TYPE i VALUE 10`**·**`LIKE gv_price`** 렌더 ✅. `P`/`DECIMALS` 문자열 0 ✅. note에 옛 단정 없음 ✅. |
| `CH02-L02-S01` | 오류 0 | (회귀 확인) 토글 2회 — `gv_today` 값 **`'20260623'`** ✅, 기본값 `'00000000'` ✅, 상태 문구·라벨 종전 그대로 ✅. |
| `CH02-L02-S02` (신규) | 오류 0 | 칩 6종 + 직접 입력 실조작 — `7/2`→I **4**/P **3.50**, `9/2`→5/4.50, `10/4`→**3**/2.50(상용 반올림), `8/2`→ok 판정·4/4.00, `1/3`→0/0.33(대조 줄 자동 숨김), `7/0`→**bad**("그 자리에서 멈춘다"), `100/3`→33/33.33, 음수 `-7/2`→**-4**/-3.50, 빈칸·소수 입력→안내 문구. 다크 시뮬 시 카드 배경·잉크 토큰 전환 ✅. |
| `CH02-L03-S01` | 오류 0 | offset 버튼 실클릭 — `+6(2)` → **'23'**(본문 일치) ✅, `+7(2)` → 범위 초과 bad ✅, 부분 쓰기 → `'20260601'` ✅. '패킹 십진수' 표기 ✅ / '압축 소수' 0 ✅. |
| `CH02-L05-S01` | 오류 0 | 문장 카드 4장 실클릭 — 읽기 2건 성공(seats 10→20), **`gc_max_seats = 20.` → bad + seats 20 그대로**(값 불변 실측: before 20 = after 20) ✅, 변수 재대입 25 ✅, 리셋 → 0 ✅. 상수 칩은 항상 🔒 10 ✅. 양 패널 첫 줄에 `DATA: gv_c …` 선언 ✅. 다크: `.ba`(기존 오버라이드)·`.cl-*`(토큰) 둘 다 전환 ✅ · 가로 overflow 없음 ✅. |
| `CH02-L06-S01` | 오류 0 | 채점 실행 — `TEXT`/`001` → 정답 ✅, 오답(`TEXT-001`/`1`) → 실패 메시지에 **교정된 힌트** 노출(옛 `TEXT-nnn` 유도 문구 소멸) ✅, 정답 보기 → `TEXT`·`001` ✅. 코드 첫 줄 `DATA gv_amt …` ✅. |
| 레슨 페이지 `docs/abap/pages/CH02-L02.html` | 오류 0 | iframe **2개**(S01·S02) 로드 ✅ · 신규 임베드 `_autoheight` 실측 **720px**(선언 높이도 720으로 맞춰 로딩 점프 제거) · 셸 다크 토글 시 iframe `<html>`에 `.dark` 주입돼 신규 엔진 색 전환 확인 ✅. |

---

## 무단 수정 0 — 자체 점검

이번 작업자의 산출(신규 파일 5 + 수정 7):

```
신규  embeds/abap/CH02-L02-S02.html
신규  embeds/_engine/int-div-lab.js · int-div-lab.css
신규  embeds/_engine/const-lock-lab.js · const-lock-lab.css
수정  embeds/abap/CH02-L01-S02.html · CH02-L02-S01.html · CH02-L03-S01.html
      CH02-L05-S01.html · CH02-L06-S01.html · _index.md
수정  embeds/_engine/var-box.js
수정  content/abap/CH02/CH02-L02.md  ← ::embed:: 1줄만
```

- `content/abap/CH02/CH02-L02.md`의 **이 작업자 기여는 `::embed CH02-L02-S02 …` 한 줄뿐**(diff의 나머지 `+`행은 먼저 실행된 content 작업자의 미커밋 변경). **본문 문장 수정 0.**
- `docs/**`는 `npm run build:abap` **재생성물**(손수정 0, R1 준수). 단 이 재생성물에는 **동시 진행 중인 다른 세션의 content 변경(CH02 본문·CH03 등)도 함께 반영**돼 있다 — 이 작업자 산출이 아님.
- 작업 트리에 보이는 `.project-docs/15_AUDIT_MATRIX.md`·`content/abap/CH03/**`·`reference/glossary.json`·CH02 본문 6파일의 modified는 **다른 세션 산출**(이 작업자 미수정).
- 타 챕터 위젯(`CH01-*`·`CH03-*` …) **무수정** · `.project-docs/**` **무수정** · git commit **미실행**.
- 엔진 수정은 `var-box.js` 1건뿐이며 **둘 다 CH02 소비자**임을 grep으로 확인하고 미변경 소비자를 브라우저로 회귀 검증했다.
