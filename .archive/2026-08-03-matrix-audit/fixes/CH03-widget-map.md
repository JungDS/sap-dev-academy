# CH03 위젯 반영 매핑 — 매트릭스 감사 백로그

> 작업일: 2026-08-03 · 실행자: Opus (CH03 위젯 보강 실행자)
> 입력: `verdict/CH03.md` · `merged/CH03.json` · `fixes/CH03-content-map.md`(본문 선반영 좌표) · `embeds/_engine/AUTHORING.md`
> 범위: `embeds/abap/CH03-*.html` · CH03 위젯이 쓰는 엔진 3종 · `embeds/abap/_index.md`. **content·docs 직접 수정 0 · 타 챕터 위젯 0 · `.project-docs` 0 · git commit 미실행.**
> 검증: 로컬 서버 `http://localhost:8143`(기동/종료 안 함) 실로드 — 위젯 단독 + **레슨 페이지 iframe 양쪽** · 콘솔 오류 **0** · `npm run build:abap` **통과**(glossary 미정의 0 · pages 270) · `node tools/gen-embed-dark.mjs` 재생성 결과 **바이트 동일**(추가 CSS가 토큰 전용이라 다크 오버라이드 불필요).

## 집계

| 처리 | 수 |
|---|---|
| 반영(코드 수정) | **6** (C031 · C015 · C010 · C033 · C048 · C008 위젯 쪽) |
| 확인만(수정 불필요) | **2** (C020 위젯 쪽 · C032 위젯 쪽) |
| 보류 | 0 |
| 부수 정합(클러스터 밖 · 최소 수정) | 1 (L01 소수 힌트 문구 — 본문 C045 완화와 어긋나 있었음) |
| 범위 밖 발견(미수정 · 보고만) | 1 (`sample/interactive/domain-builder.html` 인라인 사본에 C031과 동일 결함) |

---

## 클러스터별 처리

| ID | 파일 | 처리 | 한 줄 설명 |
|---|---|---|---|
| **C031** | `embeds/_engine/domain-builder.js` | 반영 | `doActivate()` 진입부에 `doCheck()`과 같은 타입 미선택 가드 추가(`⛔ 활성화 불가`). 추가로 `validate()` 첫 줄에 `TYPES[…]` 미존재 시 조기 반환을 둬 **호출부 가드가 빠져도 터지지 않게** 방어(Ctrl+F3 키 경로 포함 전 경로 커버). |
| **C015** | `embeds/_engine/ddic-layer-board.{js,css}` + `CH03-L02-S01.html` | 반영 | 관람형(버튼 2·입력 0) → **입력 2·버튼 3**. ① DE 카드마다 **Field Label 입력칸**(`labelSlot` config, 기본 Medium) → 그 칸의 화면 라벨만 즉시 갱신(옆 DE·Domain 불변, 빈 칸은 `(빈 라벨)`로 표시해 L02 '흔한 실수'와 연결). ② `tryOk` config 신설 → **성공 선언**(`DATA gv_from TYPE zde_from_airp.`) 데모를 기존 실패 데모 옆에 배치. 안내문(note)도 "길이=기술 / 라벨=의미" 두 실험을 직접 지목하도록 교체 → 기존 문장("따로 바꿀 수 있다")이 이제 체험으로 닫힌다. |
| **C010** | `embeds/_engine/param-screen-lab.js` + `CH03-L03-S01.html` | 반영 | `pa_name` 길이를 **엔진 하드코딩 10 → config `nameField.len`**(CH03=20, 기본값 20)으로. 입력칸 `maxlength`와 생성 코드 `TYPE c LENGTH 20`이 한 값을 공유 → 본문 정본(20)과 일치. ※ 엔진에 레슨 데이터를 박지 않는다는 AUTHORING §2도 함께 해소. |
| **C033** | `embeds/_engine/param-screen-lab.js` | 반영 | `defOn && !valStat` 두 곳(렌더·실행)을 **`screenStat()` 한 곳**으로 합치고 `statTouched` 상태 신설 — 사용자가 타이핑/삭제/F4 선택으로 손댄 뒤에는 DEFAULT가 다시 채우지 않는다. 지운 채 실행하면 `OBLIGATORY`가 정상 차단하고, 차단 메시지에 **"DEFAULT는 미리 채워 줄 뿐"** 한 줄을 덧붙여 오학습을 되돌린다. DEFAULT를 **새로 켜는** 순간만 '프로그램 재실행 화면'으로 보고 기본값을 다시 채운다(껐다 켜기로 복구 가능). |
| **C048** | `embeds/_engine/param-screen-lab.js` | 반영 | 라벨 폴백을 `cfg.de.param` 원문 → **`toUpperCase()`**(`PA_STAT`)로. 표준 타입 모드와 Dictionary 참조 꺼짐 두 경우 모두 대문자 렌더 = 본문 `PA_AMT` 표기·SAP 화면 관례와 일치. |
| **C008**(위젯 쪽) | `embeds/_engine/param-screen-lab.{js,css}` + `CH03-L03-S01.html` | 반영 | **Selection Texts의 `Dictionary 참조` 체크 토글 신설**(캡션 `Goto → Text Elements → Selection Texts` = 본문 4단계 콜아웃과 같은 경로). 꺼짐 → 기술명 `PA_STAT`, 켜짐 → Field Label `예매 상태`. 표준 타입 모드에선 **비활성**(이어받을 DE가 없음). 이로써 라벨(체크 1회)과 F4(Domain Fixed Values)의 **출처 분리**가 위젯에서도 성립 — DE 모드·체크 꺼짐 상태에서 F4는 그대로 뜬다. 이름 칸(`pa_name`)에는 "직접 입력" 캡션을 달아 표준 타입 칸의 라벨이 손으로 적은 Selection Text임을 밝힌다(안 그러면 새 토글과 자기모순). |
| **C020**(위젯 쪽) | `CH03-L01-S01.html` | **확인만** | 칩 6종이 본문 열거(금액·상태·항공사·이메일·재고 증감·대기번호·연도)와 **1:1 일치**. Sign 체크는 INT4에서 노출·NUMC에서 숨김이고, 체크 없이는 검사 실패 → 체크 후 통과·활성화까지 실측 확인. 본문에 부호(Sign) 행이 신설됐으므로 **위젯 축소 불필요**. |
| **C032**(위젯 쪽) | `CH03-L03-S01.html` | **확인만** | config가 이미 `pa_stat`·`zde_status`·`예매 상태`·고정값 O/C로, 본문이 새로 고지한 실험 필드와 일치. 라벨/F4 조건 분리 서술도 위 C008 반영으로 위젯 동작과 정합. 초기 상태 표기 변경 불필요. |

### 부수 정합 1 (클러스터 밖 · 최소 수정)

`CH03-L01-S01.html` 소수 힌트 `(DEC 전용)` → `(DEC 등 십진 타입에서 지정)`. 본문 C045가 속성 표를 "DEC 등 십진 타입에서 지정"으로 완화했는데 위젯만 단정형으로 남아 있었다(본문↔위젯 문구 불일치). 동작 변경 없음.

### 범위 밖 발견 1 (미수정 · 보고만)

`sample/interactive/domain-builder.html`은 엔진을 로드하지 않고 **인라인 사본**을 들고 있으며, 그 사본에 **C031과 동일한 결함**이 남아 있다(`doCheck()`엔 가드 있음 · `doActivate()`엔 없음 · `validate()`가 `t.maxLen` 역참조). 위젯 헤더 주석이 "엔진 수정은 `_engine/`에서"라고 못 박고 있어 학습자 경로(embeds)는 이번 수정으로 안전하지만, 샘플 카탈로그를 열면 같은 오류가 재현된다. `sample/`은 이번 지시의 수정 허용 목록 밖이라 **손대지 않았다.**

---

## 엔진 소비자 영향 (grep 전수)

| 엔진 | 소비자 전수 | 이번 수정 | 회귀 확인 |
|---|---|---|---|
| `domain-builder.js` | `embeds/abap/CH03-L01-S01.html` **1개**(+`sample/interactive/domain-builder.html`은 **인라인 사본**이라 이 파일을 로드하지 않음 · `sample/index.html`·`SAMPLE_NOTES.md`는 카탈로그 문자열) | 가드 2곳 추가(동작 확장 없음) | 정상 경로(입력→저장→검사→활성화) 통과·배지 `활성` 확인 · 미저장 가드(`⛔ 활성화 전`) 유지 · 예제 6칩 전부 로드 |
| `param-screen-lab.js` | `embeds/abap/CH03-L03-S01.html` **1개** | 상태 2개(`dictRef`·`statTouched`)·`screenStat()`·`nameField.len` 추가 | 기존 5기능(타입 세그·F4 팝업·VALUE CHECK·OBLIGATORY·LOWER CASE) 전부 재실측 통과 |
| `ddic-layer-board.js` | `embeds/abap/CH03-L02-S01.html` **1개** | 라벨 편집·`tryOk` 추가(기존 config 키 불변) | 길이 토글·직접 TYPE 오류 데모 유지 · 편집 라벨이 재렌더 후에도 보존 |

> 세 엔진 모두 **소비자 1개**라 타 챕터 파급 없음. `tryOk`·`labelSlot`·`nameField.len`은 **선택 키**라 값이 없으면 기존 동작 그대로(하위 호환).

---

## 브라우저 실측 (http://localhost:8143 · 콘솔 오류 전 구간 0)

### 수정 전 → 수정 후

| 시나리오 | 수정 전(실측) | 수정 후(실측) |
|---|---|---|
| **C031** 저장 → 데이터 타입 `— 선택 —` → 활성화 | `Uncaught TypeError: Cannot read properties of undefined (reading 'maxLen')` · 메시지바가 "💾 저장되었습니다"에 멈춤(버튼 무응답) | `⛔ 활성화 불가` + "먼저 데이터 타입을 선택하세요" · **오류 0**. `Ctrl+F3` 경로도 동일 가드 |
| **C033** DEFAULT 켬 → 값 삭제 → 실행(OBLIGATORY 켜짐) | `psl-out ok` **통과** · 입력칸이 `O`로 복원 | `psl-out bad` **실행 차단** + "DEFAULT는 미리 채워 줄 뿐" 한 줄 · 입력칸 빈 채 유지 |
| **C010** `pa_name` 입력칸/코드 | `maxlength=10` · `TYPE c LENGTH 10` | `maxlength=20` · `TYPE c LENGTH 20` |
| **C048** 표준 타입 모드 라벨 | `pa_stat`(소문자) | `PA_STAT`(대문자) |
| **C008** Dictionary 참조 단계 | 컨트롤 없음 · DE만 주면 라벨 즉시 표시 | 토글 **양방향** 확인 — 꺼짐 `PA_STAT` ↔ 켜짐 `예매 상태` ↔ 다시 꺼짐 `PA_STAT` · 표준 타입 모드에선 `disabled` · **DE+꺼짐에서도 F4는 존재**(조건 분리) |
| **C015** L02 상호작용 | 버튼 2 · 입력 **0** | 버튼 3 · 입력 **2**. 라벨 편집 시 그 칸 화면 라벨만 변경(옆 칸 `도착 공항` 불변 · Domain `CHAR 3` 불변) · 빈 칸 → `(빈 라벨)` · 길이 토글 후에도 편집 라벨 보존 |

### 추가 실측

| 항목 | 결과 |
|---|---|
| 타이핑 중 포커스·캐럿 | 라벨 입력 6타 전부 `focus 유지 · 캐럿 끝` (전체 재렌더 대신 관련 노드만 갱신) |
| 레슨 페이지 iframe 로드 | `CH03-L01/L02/L03.html` 3개 모두 위젯 로드 · **iframe 오류 0** |
| 높이 자동맞춤(`_autoheight`) | L01 861 ↔ 내부 854 · L02 814→**835**(내용 증가 추종) ↔ 내부 833 · L03 656→**707** ↔ 내부 653 |
| 다크모드(셸 `#darkBtn` 실토글) | 신규 요소 전부 적응 — `.psl-chk` 배경/잉크 전환·on 상태 대비 유지(`rgb(52,211,153)`) · `.dlb-el__labin` 배경 `#fff → rgb(31,34,41)`·잉크 `rgb(28,34,51) → rgb(232,234,240)` · 라이트 복귀 정상 |
| `gen-embed-dark.mjs` | 재생성 결과 **`_dark.css` 바이트 동일**(추가 CSS가 토큰/`color-mix` 전용) — 다크 오버라이드 불필요, 타 작업자 파일에 부수 변경 0 |
| `npm run build:abap` | 통과 — glossary 미정의 0 · 3 tracks/39 chapters · pages 270 |
| 엔진 문법 | `node --check` 3/3 통과 |

---

## 무단 수정 0 확인

내가 변경한 파일은 아래 **9개뿐**이다(+ 이 보고서).

- `embeds/_engine/domain-builder.js` · `param-screen-lab.js` · `param-screen-lab.css` · `ddic-layer-board.js` · `ddic-layer-board.css`
- `embeds/abap/CH03-L01-S01.html` · `CH03-L02-S01.html` · `CH03-L03-S01.html`
- `embeds/abap/_index.md` — **CH03 행 4줄만**(표 A 2행 + 표 B 2행). 같은 파일의 CH02 행은 동시 진행 중인 작업자 변경분으로, 손대지 않았다.

- `content/**` 수정 0 · `docs/**` **직접** 수정 0 · 타 챕터 위젯(`CH02-*`·`var-box` 등) 0 · `.project-docs/**` 0 · `sample/**` 0 · `reference/glossary.json` 0 · git commit 미실행.
- `docs/**`는 `npm run build:abap`이 규정대로 재생성한 결과물이며(R1), 실행 시점에 이미 다른 작업자의 빌드 산출물이 워킹트리에 있었다.
- `embeds/_engine/_dark.css`는 재생성했으나 **내용 변화 0**(git diff 없음).
