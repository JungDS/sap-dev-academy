# CH07 위젯 반영 매핑 — 매트릭스 감사 배치 2

> 작업일: 2026-08-09 · 실행자: Opus (CH07 위젯 보강 작업자, 브라우저 실측 직렬 슬롯)
> 입력: `verdict/CH07.md` "위젯 작업(직렬)" 5건 · `fixes/CH07-content-map.md` **D절**(인계 좌표, ★ 3건) · `merged/CH07.json` · `raw/CH07/AG02-*.json`
> 범위: `embeds/abap/CH07-L02-S01·L03-S01·L03-S02.html` + 공통 엔진 `se11-table-builder.js` · `se11-create-entries.{js,css}` + 신규 조각 엔진 `type-borrow-lab.{js,css}` + `embeds/abap/_index.md`.
> **미수정(지시대로)**: `content/**` · `docs/**` · 타 챕터 위젯 · `.project-docs`. git commit 미실행(본선 몫).
> 실측: `http://localhost:8143`(기동·중지 안 함) · 수정 전 `?v=w1` → 후 `?v=w2~w4` · 콘솔 오류 0 · 라이트/다크 양쪽 · 디스크 진위는 `fetch no-store` 대조.
> ⚠️ **CH07-L01-S01.html은 무변경** — 결함(C014)이 공통 엔진 쪽이라 엔진만 고쳤다.

## 집계

| 처리 | 수 |
|---|---|
| 위젯 수정 | **3** (L02-S01 · L03-S01 · L03-S02) |
| 위젯 신설 | **0** (본문 `::embed` 4건 불변 — 새 임베드를 부르려면 content 수정이 필요해 범위 밖) |
| 지시 클러스터 해소 | **5 / 5** (C007 · C012 · C014 · C025 · C036) |
| 판정 밖 신규 정합(content-map D절 ★ 인계) | **2** (ZTT_LINE→ZTT_PERSON · '내부 테이블'→Internal Table) |
| 공통 엔진 수정 | **2** (se11-table-builder.js · se11-create-entries.js+css) |
| 조각 엔진 신설 | **1** (type-borrow-lab — 토큰 전용, 다크 오버라이드 불필요) |

---

## A. 클러스터별 반영 · 실측 (수정 전 → 후)

| 클러스터 | 파일 | 변경 요지 | 실측 결과 (전 → 후) |
|---|---|---|---|
| **C014** 위젯 결함·성공 피드백 역전 (중간, AG02 3모델 수렴) | `_engine/se11-table-builder.js` | `showMsg(list, headOk)`가 목록이 비면 `headOk`를 무시하고 조기 반환하던 것을 **`if (!list.length && !headOk)`** 로 교정 — 경고 0건이어도 완료 문구를 남긴다. 헤더 인덱스 주석에 계약 한 줄 추가(R8) | **경고 0건 활성화**: 배지 `활성 (Active)`·DB 패널 생성인데 메시지줄은 `ln idle` "필드·키·타입을 정한 뒤…" → **`ln ok` "✔ 활성화 완료 — DB에 물리 테이블이 생성됐습니다."**. 나머지 4경로 불변 확인(검사 통과 `문제 없음` · 경고 1건 활성화 `완료+경고` · 키 gap `활성화 막힘`만 · 리셋 `idle`) |
| **C007** 위젯 결함·seed 자기모순 (높음, AG02 2모델) ★ | `abap/CH07-L02-S01.html` + `_engine/se11-create-entries.{js,css}` | ① `ce-cfg.seed`를 **`[]`로 비움** — 본문의 "빈 테이블"·"2×1부터"와 정합(판정 2안 중 content-map 권고안). ② **`↻ 처음으로`** 버튼 신설(엔진 `reset()` = seed 상태 복원 + 클라이언트 첫 칩 복귀). ③ 리드문을 빈 테이블 시작 순서로 재작성("2×1부터 차례로 → 방금 넣은 키를 한 번 더 → 틀린 값 → 클라이언트 전환"). `⚡ 2·3단 자동채움`은 판정대로 **존치** | 시작 **2행**(seed 선재) → **0행 + "아직 넣은 행이 없습니다"**. 리드문 실험 ② `2×2=5`: **✕ 저장 실패(키 중복)** → **⚠ 저장됨 + 빨간 행 1**(안내문대로 동작). 본문의 `2×1`도 전에는 즉시 거부 → **✔ 저장됨**. 실험 ①(중복 거부)·③(클라이언트 200 = 0행 격리) 정상. `처음으로` → **0행·MANDT 100 복귀**, 실험 재현 가능(전에는 회피 수단 0) |
| **C012** 불일치·수치 (중간, AG02 4모델 전원) | `abap/CH07-L03-S01.html` | 메모리 패널 주석 `" 81행 쌓기` → **`" 72행 쌓기`**(2~9단 × 9). 왼쪽 `ts_line`은 content-map 지시대로 대조 목적 유지 | 본문 텍스트 `81행` 1건 → **`81` 매치 0 · `72행` 존재**. (CH06-L06-S01이 이미 같은 81→72 교정을 마친 것과 일관) |
| **C036** 위젯 결함·안내문 어긋남 (낮음) ★ | `abap/CH07-L03-S02.html` | note에서 Table Type을 메모리 3인방에 묶던 "앞의 셋 … 메모리 세계의 도구" 폐기 → 본문 핵심 문단 문구에 맞춰 **"Structure·Internal Table은 메모리 / Transparent Table만 디스크 영속 / Table Type은 둘 중 어느 쪽도 아닌 설계도"** 로 재작성하고, 같은 위젯 표의 `사는 곳 = SE11 정의` 칸과 명시적으로 연결 | note에 `앞의 셋` 존재 → **매치 0**, Table Type이 메모리군에서 분리됨. 표 4행 전수 클릭 → 상세 표시·행 강조 1개 정상 |
| **C025** 체험 공백·L03 코드 대응 조작 (중간, 재량) ★ | `abap/CH07-L03-S01.html` + **신규** `_engine/type-borrow-lab.{js,css}` | 판정의 "S01 정적 그림에 **최소 조작**" 경로 채택. 두 운명 비교 아래 `.tb` 패널 신설 — **2축 세그**(모양 출처 `ts_line`↔`zgugudan` · 담는 개수 `TYPE`↔`TYPE TABLE OF`)로 본문 코드 두 줄을 실시간 생성하고, 메모리에 잡히는 모양(필드 칩·행 카드)을 함께 그린다. 판정줄은 조합과 무관하게 **"어느 쪽이든 메모리"** 고정 + `zgugudan` 선택 시 "모양만 빌려 온 것"(본문 AX-3 점검 항목) 경고 | **클릭 요소 0개(정적 그림)** → **버튼 4개·조합 4종 전수 동작**. 생성 선언이 본문과 문자열 일치: `DATA gs_line TYPE zgugudan.` / `DATA gt_line TYPE TABLE OF zgugudan.` 필드 수 **3개(ts_line) ↔ 4개(zgugudan, `mandt` 앰버 강조)**, 행 **1건 ↔ 3건+"⋮ 같은 모양으로 계속 쌓인다"**. `local` 복귀 시 경고 소멸 확인 |

### 판정 밖 신규 정합 (content-map D절이 인계한 ★ 항목)

| 항목 | 파일 | 근거 | 실측 |
|---|---|---|---|
| Table Type 선언 예 `ZTT_LINE` → **`ZTT_PERSON`** | `CH07-L03-S02.html` `cm-cfg` | 본문 비교표가 판정(C017)에 따라 **실제 만든 객체** `ZTT_PERSON`으로 확정 — 위젯만 만든 적 없는 이름을 남기면 C017이 위젯으로 이월된다 | `ZTT_LINE` 존재 → **매치 0** · `ZTT_PERSON` 존재. 상세에 "앞 챕터에서 만들어 둔 …"으로 재방문(C018) 표시 추가(R5대로 벌거벗은 `CHxx` 미노출) |
| '내부 테이블' → **Internal Table** | `CH07-L03-S02.html` 상세 2곳 | 본문 C023이 Work Area·Internal Table 영어 원문으로 전수 통일 — 같은 레슨 위젯만 한글 직역이면 R3 위반 | `내부 테이블` 매치 존재 → **매치 0** |

---

## B. 엔진 회귀 — 사용처 전수

`grep -rn 'se11-table-builder|se11-create-entries|compare-matrix|before-after' embeds/**/*.html` 로 `data-eng` 사용처를 전수 확인한 뒤 실측.

| 엔진 | 상태 | 사용처(전수) | 회귀 결과 |
|---|---|---|---|
| `se11-table-builder.js` | **수정**(showMsg) | **1종 — `CH07-L01-S01`** (공유 엔진이지만 실제 소비자는 하나) | 5개 메시지 경로 전수 재현: 초기 idle · 경고0 활성화 · 검사 통과 · 경고1 활성화 · 키 gap 차단 · 리셋. 배지·DB 패널 토글 불변. 콘솔 0 |
| `se11-create-entries.js` + `.css` | **수정**(reset 추가·seed 선택화) | **1종 — `CH07-L02-S01`** | 저장·중복 거부·값 미검증 경고·클라이언트 분리·자동채움(16행 추가→18행)·처음으로 전수 통과. `#ce-reset` 없으면 무시하도록 가드(`if (rb)`)라 미래 소비자 안전. 콘솔 0 |
| `type-borrow-lab.{js,css}` | **신설(조각)** | **1종 — `CH07-L03-S01`** | 조합 4종·경고 표시/소멸 전수 통과. `.wrap/.hd/.lead/.note`·리셋 **미보유**(주 엔진 몫) · `data-eng`는 주 엔진 `before-after` 유지 |
| `before-after.css` | **미수정**(조각만 동거) | 6종 — `CH02-L01-S01` · `CH02-L05-S01` · `CH04-L04-S04` · `CH05-L01-S06` · `CH05-L01-S07` · `CH07-L03-S01` | 타 5종 전수 로드: 오류 0 · `.ba__col` 2(단일 칼럼 위젯 `CH05-L01-S07`은 1) · **`.tb` 조각 누수 0** |
| `compare-matrix.js` | **미수정** | 4종 — `CH07-L03-S02` · `CH20-L01-S01` · `CH36-L04-S01` · `CH37-L02-S01` | 타 3종 전수 로드: 오류 0 · 행 렌더(4·5·2) · 행 클릭 상세 표시 정상 |

### 다크 CSS 계약 (`gen-embed-dark.mjs`)

- 신규 `type-borrow-lab.css`와 추가한 `.btn--reset`은 **전부 토큰/`color-mix`(하드코딩 hex 0)** — `const-lock-lab.css`와 같은 방식. 생성기가 hex를 찾지 못해 오버라이드 블록을 만들지 않는다.
- 이게 **필수 조건**인 이유: `_dark.css` 규칙은 `html.dark[data-eng="<엔진 css 파일명>"]` 스코프인데, 조각 엔진을 얹은 위젯의 `data-eng`는 **주 엔진**(`before-after`)이라 `[data-eng="type-borrow-lab"]` 규칙은 애초에 매칭되지 않는다. 하드코딩 색을 쓰면 다크에서 고칠 방법이 없다.
- `node tools/gen-embed-dark.mjs` 재실행 → **`_dark.css` git diff 없음(byte-identical, 190종 유지)**. 타 워커의 엔진 CSS 변경분도 이미 동기 상태라 덮어쓴 것 없음.
- 실측: `.tb` 패널 라이트/다크 전환에서 잉크 `rgb(28,34,51) ↔ rgb(232,234,240)`, 코드줄 배경 `#fff ↔ rgb(31,34,41)`, 선택 세그 `rgb(59,91,219) ↔ rgb(122,162,255)` — 토큰만으로 적응.

---

## C. 게이팅 · 규칙 점검

- **R6** — 새 코드 문자열은 classic `DATA … TYPE` / `TYPE TABLE OF`뿐. 여러 건 행 라벨은 `1행·2행·3행`으로 두어 **표 표현식 `gt[ ]`(CH18+ New Syntax)로 오독될 표기를 회피**했다.
- **R11** — 변수명은 본문 확정값 `gs_line`·`gt_line`(`g*` 전역 접두어) 그대로. 로컬 타입은 `ts_line`(Structure 타입 접두어).
- **R2** — L03의 유일한 ABAP 코드에 조작형 체험이 생겨 "코드 = 체험" 결손 해소.
- **R5/R15** — 위젯 문구에 벌거벗은 `CHxx` 미노출("앞 챕터에서 만들어 둔"). `zgugudan` 경고의 "값을 읽거나 쓰려면 별도의 명령이 필요하다"는 **문법명·코드 없는 L1 수준**(본문 점검 항목과 동일 표현).
- **`::embed` 계약** — 본문이 부르는 ID 4건(`CH07-L01-S01`·`L02-S01`·`L03-S01`·`L03-S02`) 전부 불변. 파일 신설·리네임 0.
- **등록** — `embeds/abap/_index.md` 표 A 3행(L02-S01·L03-S01·L03-S02) 갱신 + 표 B에 `type-borrow-lab` 행 신설, `se11-table-builder`·`se11-create-entries`·`before-after` 비고 갱신.

## D. 남긴 관찰 (무수정 — 판정문 미등재)

1. **Technical Settings ↔ 위젯 모델 간극** — 본문 L01에 C003으로 "Data Class·Size Category를 비우면 활성화 거부"가 새로 명시됐지만, `se11-table-builder`는 기술 설정 없이도 활성화되는 단순화 모델(범위 = 필드·키·타입)이다. content-map도 같은 사항을 무수정으로 남겼다 — 위젯 확장 시 고려 대상.
2. **`Built-In … 라벨·F4·도움말이 없습니다` 경고 문구** — 본문 C015가 F4를 "Domain에 고정값 같은 준비가 돼 있으면"으로 정밀화했으나, 위젯 문구는 *Data Element가 없으면 셋 다 없다*는 **부정 진술**이라 정밀화 후에도 사실로 성립한다. 클러스터 미등재라 무수정.
3. **자동채움 메시지의 `(총 18행)`** — 2단·3단 합계를 뜻하며 표 전체 행 수와 다를 수 있다. C009가 3단을 선택으로 완화한 뒤에도 버튼은 둘 다 채우므로 수치는 정확. 무수정.

## E. 검증 함정 기록 (다음 작업자용)

**HTML에 `?v=` 캐시버스팅을 걸어도 `_engine/*.js`는 갱신되지 않는다.** 스크립트는 별도 요청이라 브라우저 HTTP 캐시에서 그대로 재사용된다 — 엔진을 고쳐 놓고 "수정이 안 먹었다"고 오판하기 쉽다(이번에 실제로 한 번 겪었고, `performance.getEntriesByType('resource')`의 `encodedBodySize`가 옛 파일 크기 8051로 남아 있어 발각됐다). Ctrl+Shift+R도 이 환경에선 반영되지 않았다.
→ **확실한 방법**: 페이지에서 `fetch('/embeds/_engine/<엔진>.js', { cache: 'reload' })` 로 캐시 엔트리 자체를 갱신한 뒤 재탐색. 진위 확인은 `fetch(..., { cache: 'no-store' })` + `performance` 항목의 `encodedBodySize`/`transferSize` 대조.
