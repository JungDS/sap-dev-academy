# CH10 위젯 반영 매핑 — 매트릭스 감사 배치 3

> 작업일: 2026-08-09 · 실행자: Opus (CH10 위젯 보강 작업자 · 브라우저 실측 직렬 슬롯)
> 입력: `verdict/CH10.md` "위젯 작업(직렬)" 12건 · `fixes/CH10-content-map.md` ★①～⑨ · `merged/CH10.json` · 근거 역참조 `raw/CH10/AG02-*.json`
> 범위: `embeds/abap/CH10-*.html`(8) + `embeds/_engine/`(6엔진). **content/**·docs/** 무수정**(읽기만). `embeds/abap/_index.md` 갱신.
> 실측: `http://localhost:8143/embeds/abap/CH10-*.html?v=w1`(전) → `?v=w2…`(후). 엔진 JS/CSS는 `?v=`가 안 먹어 매번
> `fetch(엔진URL,{cache:'reload'})` 후 재로드 — `performance` 대조로 확인(예: call-function-box.js 최초 transferSize 0(캐시) → reload 4986). 서버 기동·중지 없음.

## 집계

| 처리 | 수 |
|---|---|
| 판정 목록 반영 | 12 / 12 |
| ★ 인계 처리 | ①～⑧ 전건 + ⑨(관찰건) |
| 신규 발견·동시 교정 | 1 (임베드 내부 챕터 링크 전량 404 — 아래 §3) |
| 파일 변경 | 임베드 8 · 엔진 JS 6 · 엔진 CSS 3 · `_index.md` 1 |

---

## 1. 클러스터별 반영 · 실측(전→후)

| ID | 파일 | 변경 요지 | 실측 (전 → 후) |
|---|---|---|---|
| **C009** | `_engine/call-function-box.js` | "EXCEPTIONS 안 적기" 실험을 **런타임 오류(덤프)** 로 교정. 미매핑 예외는 `sy-subrc`로 오지 않고 그 자리에서 프로그램이 멈춘다(본문 L03 신설 절과 동일 서술). 정상 경로는 EXCEPTIONS 유무와 무관하게 동일하도록 분기 정리. | 음수+제거: `sy-subrc = 0` · "잘못된 결과로 흐름이 계속될 수 있습니다"(오학습) → `sy-subrc = (설정 안 됨 — 덤프)` · `gv_out ← (도달 못 함)` · "💥 런타임 오류(덤프) … 다음 줄의 `IF sy-subrc <> 0`까지 가지도 못합니다". 정상+제거는 전후 동일(`sy-subrc = 0`, 1100) |
| **C018** | `_engine/global-class-blackbox.js` | 'static 여부 확인' 메시지의 `(→ CH20)` → **Chapter 21 링크**(설명형 텍스트·`target="_top"`). 하단 note의 raw `CH10`·`CH11`·`CH21`도 함께 해소. | `→ CH20` raw 노출 · 페이지 내 raw ID `[CH20, CH10, CH11, CH21]` → raw ID **0건**, 링크 3개 전부 `Chapter NN · 제목` 형식 |
| **C019** | `abap/CH10-L06-S01.html` | 근거 없는 **TYPE-POOLS 카드 + 4번째 선택지('옛 코드 인지') 제거** → 선택지 = 본문 비교표의 세 도구. 6번 카드를 본문 "흔한 실수"(신규에 FORM 사용) 근거 카드로 교체. 5번 카드의 `CH11` 무링크 노출은 **문구에서 챕터 지시 자체를 제거**(엔진이 카드 텍스트를 `esc()` 처리해 링크 삽입 불가). note의 TYPE-POOLS 문장도 제거. | 선택지 4·카드 6(TYPE-POOLS 1장 근거 0) · raw `CH11` 1건 → 선택지 3·카드 6(**전부 본문 근거**) · raw ID 0 · 채점 6/6·오답 피드백·리셋 정상 |
| **C020** | `abap/CH10-L07-S01.html` | step-debugger config에 본문 **`IF sy-subrc <> 0. / cv_left = -1. / RETURN. / ENDIF.`** 4줄 추가(★③대로 값은 `0`이 아니라 **`-1`**). 스텝 1개 추가 + `sy-subrc`를 변수 모니터에 등재. 라인 인덱스 전면 재산정(22 → 26). | 코드 23줄·6스텝·`sy-subrc` 워치 없음 → 27줄·**7스텝**·`sy-subrc` 워치 추가. 스텝 = 11→16×3→19→**21**→26, 콘솔 7행 완주. 에디터 가로 스크롤 없음(456/456) |
| **C030** | `_engine/local-class-stepper.js` (+`.css`) | 'PUBLIC 제거'·'RETURNING 제거'가 **메시지만 바꾸던 헛실험**을 실동작으로. `sections()`가 상태에 따라 매번 코드를 다시 만들고 `render()`를 호출 → 코드(취소선/빨간 띠)·공개 계약 카드·호출 형식이 모두 바뀐다. | 두 실험 모두 `codeChanged: false`(코드·계약 불변) → **`changed: true`**. PUBLIC 제거 = `PUBLIC SECTION` 취소선 + `PRIVATE SECTION` 추가 + 호출줄 빨간 띠, 계약 "공개 메서드 (없음 — PRIVATE)". RETURNING 제거 = RETURNING 줄 취소선 + `IMPORTING … TYPE p.`로 마침표 이동 + `rv_result` 줄·호출줄 표시, 계약 "RETURNING (없음)" |
| **C031** | `_engine/perform-call-map.js` | 건너뛰던 FORM 내부 `WRITE` 줄에 스텝 부여. 추가로 `DATA lv_local_calls` 줄도 스텝화해 **FORM 6줄 전체가 1:1 대응**. | 스텝 11개·방문 라인 `F1,F3,F4,F6`(F2·F5 미방문) → 스텝 **15개**·방문 `F1~F6` 전수 + `M6,M7,M8`. 시퀀스 `M6→F1→F2→F3→F4→F5→F6→M7→…→M8` |
| **C039** | `_engine/param-passing-board.js` | RETURN 데모의 존재하지 않는 함수형 표기를 **PERFORM 문법**으로. ★⑤의 본문 시그니처(`USING iv_a iv_b / CHANGING cv_r`) 채택. | `divide_safe( 10, 0 )` · `IF iv_right = 0 → cv_result = 0, RETURN` → `PERFORM divide_safe USING 10 0 CHANGING gv_r.` · `IF iv_b = 0. → 참이라 RETURN` · `결과 gv_r = 0 (cv_r을 건드리지 않아 처음 값 그대로)`. 페이지 내 `divide_safe(` 함수형 표기 **0건** |
| **C042** | `abap/CH10-L03-S01.html` + 엔진 | FM 이름 `Z_CH10_ADD_TAX`→**`Z_ADD_TAX`**, 예외 `invalid_amount=1`→**`invalid = 1 · OTHERS = 2`**, 본문에 없는 **`CHANGING cv_log` 행·변수 제거**, 수신 변수 `ev_result = gv_out` 명시. | 구 이름/예외/`cv_log` 전부 노출 → `Z_ADD_TAX`·`invalid`·`cv_log` **0건**. 인터페이스 3행(EXPORTING/IMPORTING/EXCEPTIONS) |
| **C045** | `_engine/local-class-stepper.js` | 호출 블록을 본문 정본으로 교체 — `lv_result`(선언줄 없음) → `START-OF-SELECTION` + `DATA: gv_amount/gv_out TYPE p LENGTH 8 DECIMALS 2.` + `gv_amount = 1000.` + `gv_out = lcl_calc=>add_tax( gv_amount ).` + `WRITE gv_out.` | `lv_result = lcl_calc=>add_tax( 1000 ).` 1줄 → 본문과 같은 7줄. 계약 카드 `IMPORTING iv_amount = gv_amount`, 호출 형식 `gv_out = lcl_calc=>add_tax( gv_amount )` |
| **C050** | `_engine/global-class-blackbox.js` (+`.css`, HTML) | 호출문 텍스트가 **한 줄도 없던** 위젯에 라이브 코드 패널(`#callCode`) 신설 — 버튼마다 코드가 바뀐다. | 페이지 내 `=>` 호출문 **0건** → `DATA gv_left TYPE i.` + `gv_left = zcl_booking_calc=>get_remaining( iv_concert = 'C001' iv_perf = '001' ).` 렌더. 정상=결과 주석, 누락=`✕ 필수 입력 iv_perf가 빠진 채 닫혔다`, static=`=>` 하이라이트. 가로 스크롤 없음(777/777) |
| **C051** | `abap/CH10-L07-S02.html` + 엔진 | ★③.4대로 '정원 초과'가 아니라 **`0석` 선택지 추가**(본문 과제 2의 "0석으로도 요청해 보자"). 판정 로직을 본문 3항으로 바꿔 0석이 실제로 걸러지게. | 선택지 `3석/5석` → **`0석/3석/5석`**. 0석: `(0 > 0) ✕` → `abap_false`(전이라면 `0 <= 4`로 **통과**했을 케이스). 5석: `(5 <= 4) ✕`로 기존 실패 시연 유지 |
| **C052** | `_engine/perform-call-map.js` + HTML | 메인 블록에 **`START-OF-SELECTION.`** 표지 + `REPORT z_form_scope.` 추가(★④ 본문 정본 순서). 블록 헤더도 "메인 (START-OF-SELECTION 아래가 실행문)". | 메인 5줄(표지 없음) → **8줄**: `REPORT z_form_scope.` / (빈) / `DATA gv_total_calls TYPE i.` / (빈) / `START-OF-SELECTION.` / `PERFORM`×2 / `WRITE: / '전역 누적:', gv_total_calls.` |

---

## 2. ★ 인계 좌표 처리 내역

| ★ | 지시 | 처리 |
|---|---|---|
| **①** C002 택1 = IF/ELSE + abap_true/abap_false | S02 판정식의 `boolc(...)` 교체·결과 표기 | `can_book = boolc( 5 <= 4 ) = abap_false` → **본문 3항 IF/ELSE 그대로 렌더**: `IF iv_want > 0 AND lv_left >= 0 AND iv_want <= lv_left.` + 항별 `(5 > 0)✓ AND (4 >= 0)✓ AND (5 <= 4)✕` + `→ ELSE → cv_ok = abap_false`. 참이면 `→ cv_ok = abap_true`. 페이지 내 `boolc` **0건** |
| **②** `gv_` 교정 후 위젯 라벨 정합 | 표의 3건 | ① `local-class-stepper` → `gv_out`/`gv_amount`(C045와 한 번에) · ② `global-class-blackbox` 메시지 `lv_left = 4` → **`gv_left = 4`** · ③ `CH10-L05-S01` 패널 헤더 `결과 lv_left` → **`결과 gv_left`** · ④ `perform-call-map`은 지시대로 **손대지 않음**(`gv_total_calls`/`lv_local_calls` 이미 정합). **표에 없던 1건 추가 교정** — `param-passing-board`의 호출자 원본 `lv_amount` → **`gv_amount`**(★② 본문 "FORM/METHOD 밖 변수를 lv_로 표기하는 곳을 함께 고쳐야" 적용 · 본문 L02 정본이 `gv_amount`) |
| **③** L07 코드 변경분 ↔ S01/S02 | 4항목 | 1) sy-subrc 4줄 `cv_left = -1` 포함 반영, 스텝 노트도 "공연이 없었다면 여기서 -1을 넣고 끝났다" · 2) S01 라인 인덱스 본문과 1:1 재산정 · 3) `can_book` IF/ELSE 5줄화를 S02 판정식에 반영, **시그니처 불변**이라 하류 `CH16-L10` 영향 없음 · 4) 5석>잔여4석 실패는 이미 시연되므로 정원 초과 케이스는 **미추가**, 대신 선택 사항이던 **0석 선택지를 채택**(본문 과제 2가 새로 요구) |
| **④** L01 위젯 C031·C052 동시 처리 | MAIN에 줄 추가 시 STEPS 인덱스 전부 밀림 | 두 건을 **한 번에** 처리 — MAIN 5→8줄 재작성과 STEPS 재산정을 같은 편집으로. 본문 정본 순서 그대로. 부수로 위젯 전반의 '지역 변수' 표기를 본문 신설 절의 **'로컬 변수'** 로 통일(lead·사이드 카드·스텝 노트·"(FORM 밖 — 로컬 변수 없음)") |
| **⑤** L02 위젯 C039 | 본문 `divide_safe` 시그니처·`count_visit`/`STATICS lv_count` 명명 | RETURN 데모 = 본문 시그니처로 교체. STATICS 데모도 `count_subroutine`/`sv_count` → **`count_visit`/`lv_count`**(R11에 없는 `sv_` 접두어 소거 — content-map 범위 밖 관찰 3과 일치). **단 수신 변수는 ★⑤ 예시의 `lv_r`이 아니라 `gv_r`** — 호출부가 전역 위치라 R11·★②가 우선(★⑤의 요지는 시그니처 일치로 판단) |
| **⑥** L03 위젯 C042·C009 | 본문 정본 이름 + 덤프 방향 일치 | 전건 반영(위 표). 위젯 note도 "주의 2가지"→**3가지**로 확장해 본문의 ①숫자 매핑 ②미선언=덤프 ③적어 놓고 안 보면 소용없음과 대응. 호출자 프로그램명 `zch10_l03` → **`z_call_tax`**(학습자 화면에 내부 챕터 ID가 그대로 보이던 자리) |
| **⑦** L04 위젯 C030·C045 | 바뀐 본문 계약과 제거 전/후 코드 일치 | `RETURNING VALUE(rv_result) TYPE p LENGTH 8 DECIMALS 2` 반영(C005 backport) · 호출 `gv_out = lcl_calc=>add_tax( gv_amount )` · 제거 실험의 전/후 코드가 이 정본 기준으로 렌더 |
| **⑧** L05 C050 · L06 C019 | L05 본문 호출 정본 2벌 · L06 Local/Global 구분 | **L05는 위젯 자체 시나리오(`zcl_booking_calc=>get_remaining`)로 렌더** — 판단 근거는 아래 §4. 본문 정본 2벌의 문법 요소(대입형 · 이름 붙여 넘기기)는 이 한 줄에 모두 들어간다. L06은 `TYPE-POOLS` 카드 교체 시 선택지를 본문 비교표 3도구로 맞춤(Class 행의 Local/Global 구분은 카드 근거를 바꿀 사유가 아니라 그대로 유지) |
| **⑨** (관찰건) `CH10-L07-S02` note의 `<a>CH13</a>` raw 텍스트 | content 작업자는 "판정 목록에 없어 손대지 않음" | **처리함** — 위젯 파일이고 C018·C019가 지목한 raw ID 노출과 같은 계열이라, 이미 편집 중인 파일에서 `Chapter 13 · JOIN·집계`로 교정. §3에서 링크 자체가 404였음이 드러나 동시 수정 |

---

## 3. 신규 발견 — 임베드 내부 챕터 링크가 전부 404 (동시 교정)

C018·C019의 "챕터 참조" 교정을 **실제로 클릭해 확인**하다가 드러난 건이다.

- 임베드는 `docs/abap/pages/*.html`에서 `src="../../../embeds/abap/…"`로 iframe된다 → 임베드 안의 `href="CH21-L01.html"`은 **`embeds/abap/CH21-L01.html`** 로 풀린다(존재하지 않음). shell.js에 링크 가로채기도 없다.
- 실측: `embeds/abap/CH21-L01.html` → **404** · `docs/abap/pages/CH21-L01.html` → 200.
- 저장소에 **이미 올바른 관례가 있다** — `CH08-L05/L06/L07`·`CH09-*` 임베드는 `href="../../docs/abap/pages/CHnn-Lmm.html" target="_top"` + 설명형 텍스트를 쓴다.
- 처리: **CH10 임베드 4개 + `global-class-blackbox.js` 인라인 링크 1개**(내가 이미 편집 중이던 파일)를 그 관례로 교정. 실클릭 검증 — `docs/abap/pages/CH10-L05.html`에서 iframe 안 링크를 눌러 **최상위 창이 `CH21-L01.html`로 이동**함을 확인(iframe 안에서 열리지 않음).
- **남은 동일 결함(미수정 · 인계)**: `CH11-L01-S01.html`(`href="CH31-L01.html"` — 텍스트도 raw `CH31`) · `CH11-L03-S01.html`(`href="CH10-L03.html"` — 텍스트 raw `CH10의 Function Module`). **CH11 위젯 작업자 담당 파일이라 손대지 않았다.** 저장소 전체로는 이 2건이 마지막 잔여분이다(`grep 'href="CH[0-9][0-9]-L'` 기준).

---

## 4. 판단·재량 기록

1. **C050을 본문 `zcl_util` 2벌 복사가 아니라 위젯 시나리오 코드로 렌더** — 위젯은 관통예제(콘서트 예매)의 `ZCL_BOOKING_CALC` 블랙박스가 서사이고, 계약이 `IMPORTING ×2 + RETURNING`이라 **본문 정본 두 패턴이 한 줄에 동시에** 나타난다(대입형 = `gv_text = zcl_util=>format_amount( … )` 꼴, 이름 붙여 넘기기 = `calc( EXPORTING … )` 꼴). 본문 코드를 그대로 붙이면 바로 위 본문과 중복되는 정적 텍스트가 되고 버튼과 연동되지 않아, "핵심 문법을 손으로 확인할 수단"이라는 클러스터의 실제 요구를 못 채운다. 클래스명은 본문 코드 표기와 맞춰 소문자(`zcl_booking_calc`), SE24 계약 패널은 기존대로 대문자 유지.
2. **C019에서 4번째 선택지를 없앤 이유** — TYPE-POOLS 카드를 빼면 '옛 코드 인지' 선택지에 정답 카드가 하나도 남지 않는다(근거 없는 오답 전용 보기). 본문 비교표가 정확히 3도구라 선택지를 3개로 맞추는 편이 본문↔체험 일치도가 높다.
3. **C031에서 `DATA` 선언줄까지 스텝을 준 이유** — 클러스터가 지적한 건 `WRITE` 한 줄이지만, 기존 점프 스텝이 FORM 헤더 줄에서 "로컬 변수 새로 생성=0"을 주장하고 있었다. 선언줄에 스텝을 주면 로컬이 *어디서* 생기는지가 줄과 맞고, FORM 6줄이 빠짐없이 1:1이 된다.
4. **C009에서 정상 경로는 건드리지 않음** — 덤프는 예외가 실제 발생할 때만이다. 'EXCEPTIONS 안 적기 + 정상 금액'은 전후 모두 `sy-subrc = 0`·1100으로 같아야 맞다(체크박스만 켜면 무조건 덤프가 되는 식은 또 다른 오학습).
5. **버튼 라벨 'EXCEPTIONS 제거' → '안 적기'** — 본문이 "하나도 적지 않으면"으로 서술하므로 문구를 맞췄다.

---

## 5. 엔진 회귀

`grep -rl` 로 엔진별 사용처를 먼저 확정한 뒤 회귀했다.

| 수정한 엔진 | 사용처 | 회귀 결과 |
|---|---|---|
| `perform-call-map.js` | CH10-L01-S01 **단독** | 외부 영향 없음 |
| `param-passing-board.js` | CH10-L02-S01 **단독** | 〃 |
| `call-function-box.js` | CH10-L03-S01 **단독** | 〃 (판정문의 "공유 엔진 사용처 회귀"는 실측상 단일 사용처였다) |
| `local-class-stepper.js`+`.css` | CH10-L04-S01 **단독** | 〃 |
| `global-class-blackbox.js`+`.css` | CH10-L05-S01 **단독** | 〃 |
| `can-book-toggle.js`+`.css` | CH10-L07-S02 **단독** | 〃 |

**엔진을 안 고치고 인스턴스 데이터만 바꾼 공유 엔진**(회귀 대상 — 전수 확인)

| 엔진 | 다른 사용처 | 결과 |
|---|---|---|
| `module-choice-cards` (C019는 `MCC_CFG`만 수정) | CH11-L05-S01 · CH13-L07-S01 · CH19-L07-S01 | 3/3 통과 — 카드/선택지 수(6·5 / 5·5 / 6·6) 무변화, 전 카드 정답 클릭 완주, 채점·리셋 정상, 콘솔 0 |
| `step-debugger` (C020은 `.stepper-config`만 수정 · 스키마 무변경) | 15개 인스턴스 | 대표 2건 확인 — CH06-L04-S01(itab 워치, 19/19 완주) · CH04-L06-S01(Watchpoint 레이어, 10/10 완주), 콘솔 0 |

---

## 6. 최종 실측 (8/8 · 최신 코드 기준 일괄)

전 엔진 캐시를 `cache:'reload'`로 무효화한 뒤 8개 임베드를 새 iframe에 순차 로드하고, 각 페이지의 **모든 버튼·체크박스를 전수 클릭**하며 `window.onerror`·`console.error`를 수집했다.

| 임베드 | 조작 대상 | 콘솔 오류 | 가로 스크롤 | raw 챕터 ID |
|---|---|---|---|---|
| CH10-L01-S01 | 버튼 3 + 체크박스 1 | 0 | 없음 | 0 |
| CH10-L02-S01 | 버튼 8 | 0 | 없음 | 0 |
| CH10-L03-S01 | 버튼 4 + 체크박스 1 | 0 | 없음 | 0 |
| CH10-L04-S01 | 버튼 6 | 0 | 없음 | 0 |
| CH10-L05-S01 | 버튼 4 | 0 | 없음 | 0 |
| CH10-L06-S01 | 버튼 19 | 0 | 없음 | 0 |
| CH10-L07-S01 | 버튼 4 | 0 | 없음 | 0 |
| CH10-L07-S02 | 버튼 3 + 체크박스 1 | 0 | 없음 | 0 |

- **스텝 전수 주파**: L01 15/15(F1～F6·M6～M8 전 라인) · L07-S01 7/7(콘솔 7행).
- **링크 실클릭**: CH10 임베드의 전 `href` 23개를 HTTP 상태로 확인 — **전부 200**. `docs/abap/pages/CH10-L05.html`의 iframe에서 실제 클릭 → 최상위 창이 `CH21-L01.html`로 이동.
- **다크 CSS 계약**: 새 CSS는 전부 `var()`/`rgba()`만 사용 → `node tools/gen-embed-dark.mjs` 재실행 결과 `_dark.css` **바이트 동일(diff 0)**. 다크 렌더 실측으로 토큰 전환 확인 — `--bad` `rgb(244,114,182)` · `--good` `rgb(52,211,153)` · `--brand` `rgb(122,162,255)`, 코드 패널 배경 `rgb(31,34,41)`.

## 7. 후속 인계

1. **CH11 임베드 2건의 404 링크**(§3 잔여분) — CH11 위젯 작업자 몫.
2. **본문 리빌드 미실행** — content 작업자와 동일하게 `npm run build:abap`은 돌리지 않았다(본선 몫). `docs/abap/pages/CH10-*.html`은 아직 구 빌드라, 본문↔위젯 최종 대조는 빌드 후 한 번 더 보는 편이 안전하다(임베드 iframe src는 불변이라 위젯 동작 자체는 영향 없음).
3. **`embeds/abap/_index.md` §B(엔진별 집계)에 CH10 엔진 행이 없다** — `module-choice-cards`는 사용처 4곳의 공유 엔진인데 §B에 미등재라 공유 사실이 인덱스만 봐서는 안 보인다. 이번엔 §A 행만 갱신했다(범위 밖 구조 변경 회피).
