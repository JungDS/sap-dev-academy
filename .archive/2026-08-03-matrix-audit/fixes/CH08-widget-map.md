# CH08 위젯 반영 매핑 — 매트릭스 감사 배치 2

> 작업일: 2026-08-09 · 실행자: Opus (CH08 위젯 작업자 · 브라우저 실측 직렬 슬롯)
> 입력: `verdict/CH08.md` "위젯 작업(직렬)" 10건(정본) · `fixes/CH08-content-map.md` §D ★ 6건(본문 인계 좌표) · `merged/CH08.json` · `raw/CH08/AG02-*.json`
> 범위: **`embeds/abap/CH08-L01`～`L07-S01.html` 7파일 + `embeds/_engine/` 4엔진**. `content/**`·`docs/**` 미수정 · git commit 미실행(본선 몫).
> 실측: `http://localhost:8143/embeds/abap/CH08-*.html?v=w1`(전) → `?v=w2`～`w4`(후). 서버 기동·중지 없음.
> **엔진 캐시 함정 준수** — `?v=`는 HTML만 무효화하므로 재측정 전 `fetch(엔진URL,{cache:'reload'})`로 강제 갱신하고 `performance` 엔트리의 `encodedBodySize`로 실제 로드된 파일을 대조했다(예: `where-filter-lab.js` 5578→7380 B · `select-query-simulator.js` 10696→15366 B · `into-target-board.js` 9059→12585 B · `key-condition-lens.js` 6740→9300 B).

## 집계

| 처리 | 수 |
|---|---|
| 지시 클러스터 반영 | **10** (C011 · C012 · C031 · C032 · C033 · C034 · C058 · C059 · C060 · C061) |
| ★ 본문 연동 처리 | **6** (C002 정합 · C031 ★ · C032 ★ · C059 ★ · C061 ★ · §D 후단 3항) |
| 작업 중 자체 발견·수정 | **2** (§D) |
| 엔진 수정 | **4** (select-query-simulator · into-target-board · key-condition-lens · where-filter-lab) |

---

## A. 클러스터별 반영 [ID | 파일 | 변경 요지 | 실측(전→후)]

| ID | 파일 | 변경 요지 | 실측 (전 → 후) |
|---|---|---|---|
| **C011** | `CH08-L01-S01.html` · `L03` · `L04` · `L06` cfg | fldate를 **DATS 8자리로 통일**. L01 5건(`2026-06-24`·`2026-07-01`×2·`2026-07-02`·`2026-08-15`) · L03 5건 · L04 2건 · L06 1건 = **13값** 치환. 본문 기준(챕터 전 코드 `'20260623'`)과 완전 일치 | 렌더된 대시 날짜: L01 **5→0** · L03 **5→0** · L04 **2→0** · L06 **1→0**. DATS 8자리 렌더 L01 8건·L03 8건, 4위젯 합산 대시 **13→0** |
| **C012** | `CH08-L05-S01.html:33` · `L06:36` · `L07:60` | 링크 3건 **대상 정정 + iframe 탈출**. L05 `CH12-L07.html`→`../../docs/abap/pages/CH12-L02.html` · L06 `CH35-L01.html`→`../../docs/abap/pages/CH35-L01.html`(대상 유지, 경로만) · L07 `CH15-L01.html`→`../../docs/abap/pages/CH15-L04.html`. 전부 `target="_top"` + 링크 텍스트를 본문과 같은 `Chapter NN · 제목`으로 | HTTP: `embeds/abap/CH12-L07·CH35-L01·CH15-L01.html` **404** → 정정 후 대상 3건 **200**. **레슨 페이지 iframe 안에서 실제 마우스 클릭** 3건 전수: CH08-L05→`/docs/abap/pages/CH12-L02.html`(h1 "SELECT-OPTIONS 기본 문법") · CH08-L06→`CH35-L01`(h1 "ST05 SQL Trace") · CH08-L07→`CH15-L04`(h1 "AT SELECTION-SCREEN 입력 검증"). 셋 다 **iframe이 아니라 페이지 전체가 이동** |
| **C031** | `_engine/into-target-board.js` | **부분 키 SELECT SINGLE 시범 제거** — '변수 묶음' 탭 WHERE에 `AND fldate = '20260623'` 추가(키 전체), CORRESPONDING의 SINGLE 변형도 키 전체로. 엔진 헤더에 규약 주석 명문화("SINGLE 생성 코드는 키 전체를 준다") | 탭별 생성 코드: vars `WHERE carrid AND connid` → `carrid AND connid AND fldate` · corr(wa) 동일. 엔진 내 `SELECT SINGLE` 생성기 **3곳 전부 fldate 포함**(grep 3/3) |
| **C032** | `_engine/key-condition-lens.js` | **선두 접두 규칙 판정으로 재작성** — 쓸 수 있는 건 선두부터 끊기지 않은 접두(prefix)뿐. 5분기(전체키 / 접두=준키 / 접두<준키 = 중간 건너뜀 / 접두0 = 선두 없음 / 조건없음)로 판정, 선두 없으면 행을 `scan`으로 칠하고 카드를 '**DB가 확인할 행 = 전체**'로 바꿔 amber. 지표도 '키 조건 완성도(준 키 개수)'→'**선두부터 이어진 키**'로 교체하고 '조건에 맞는 행' 카드 신설 | 8케이스 전수. `connid만`: "키 앞부분으로 범위 좁히기 · 후보 **2행**" → "**선두 carrid가 비어 색인을 못 탐 → 전체 훑기** · DB가 확인할 행 전체 7행"(scan 7행·amber 2). `fldate만`·`connid+fldate`도 동일 계열. `carrid+fldate`(중간 빠짐): "**선두 carrid까지만 색인 · 나머지는 그 안에서 확인**"(후보 4행·hit 3·cand 1). `carrid만`·`carrid+connid`·`전체키`는 green 유지 |
| **C033** | `_engine/select-query-simulator.js` | **`SELECT *` + `CORRESPONDING` 결합 차단** — `INTO` 짝을 `st.selAll`이 아니라 **실제 생성된 필드 목록**에서 유도(`isStar()`). "컬럼 선택 모드인데 0개 선택 = 전체로 간주"라는 기존 규칙과 짝이 이제 함께 움직인다. 위젯 안내문도 같은 문장으로 수정 | 컬럼 선택 모드 + 0개 선택: `SELECT * … INTO CORRESPONDING FIELDS OF TABLE`(모순) → `SELECT * … **INTO TABLE**`. 1개만 선택 시 `SELECT dan … INTO CORRESPONDING FIELDS OF TABLE`로 정상 전환 |
| **C034** | `_engine/select-query-simulator.js` | **빈 조건의 코드↔판정 모순 해소** — 값이 빈 조건은 **문장에도 넣지 않고 판정에서도 제외**하고, 빠졌다는 사실을 ABAP 주석 한 줄로 고지. `?`라는 가짜 리터럴을 화면에서 없앴다 | 조건 2개 켜고 값 비움: 코드 `WHERE persid >= ? AND city = '?'` + 결과 10행(sy-subrc 0)이라는 모순 → 코드에서 WHERE 소멸 + `" 값이 비어 있는 조건 2개는 문장에서 빠졌습니다` 주석, 결과 10행과 **일치**. 한쪽만 채우면 `WHERE age >= 33`만 남고 6행 |
| **C058** | `_engine/select-query-simulator.js` | **숫자 컬럼 LIKE 차단** — 연산자 목록을 컬럼 종류에 따라 생성(`opsFor`). 숫자 컬럼은 LIKE 제외, LIKE 선택 상태에서 숫자 컬럼으로 바꾸면 `=`로 폴백 | 숫자 컬럼 연산자: `=,<>,>=,<=,>,<,LIKE` → **`=,<>,>=,<=,>,<`**(문자 컬럼은 LIKE 유지). 이전엔 `WHERE age LIKE '3%'`가 sy-subrc=0·6행으로 성공했으나 이제 **생성 불가** |
| **C059** | `CH08-L02-S01.html` + 엔진 | **zgugudan 데이터셋 추가**(재량 중 상향안 채택) — 엔진에 `datasets[]` 다중 테이블 지원을 넣고 칩으로 전환. 본문 대표 예제(손입력 18행 되찾기)를 위젯에서 그대로 실행 가능. lead의 "본문 zgugudan 대신…" 회피성 문구 삭제 | 데이터셋 칩 2종. ZGUGUDAN 프리셋 실행 결과 = `SELECT * FROM zgugudan INTO TABLE gt_gugu.` **18행**(본문 코드와 문자 단위 일치) · projection 프리셋 = `SELECT dan mul result … INTO CORRESPONDING FIELDS OF TABLE gt_gugu.`(본문 두 번째 블록과 일치). 데이터셋 왕복 2회 후 프리셋 전수 결과 동일(상태 누수 0) |
| **C060** | `CH08-L05-S01.html` + `_engine/where-filter-lab.js` | **연산자 UI 확장**(재량 — 최소 `<>` 이상). 본문 L05 연산자 표 6종을 커버리지 기준으로 삼아 `<>`·`<`·`<=`·`>=` 칩 4종 신설(엔진 type `ne`/`lt`/`le`/`ge`) + **NOT( ) 뒤집기 토글** 신설(본문의 "괄호로 묶어 순서를 분명히" + NOT을 한 번에). 칩이 11개가 되어 `cond.group`으로 묶음 라벨 지원(`.connrow__lbl` 재사용 = CSS 신규 0) | 칩 7→**11** + NOT 토글. `<>`3행 · `<`1행 · `<=`2행 · `>=`3행 전수 검증. NOT 단일 `WHERE NOT ( carrid = 'KE' ).`→3행 · NOT+AND 2조건 3행 · 11칩 전부 ON은 AND 0행/OR 7행/OR+NOT 0행. 초기화가 NOT까지 되돌림. 가로 스크롤 0(750/750) |
| **C061** | `_engine/into-target-board.js` | **CORRESPONDING 탭을 본문 예제 형태로** — 기본을 본문 정본 `SELECT carrid connid fldate … INTO CORRESPONDING FIELDS OF TABLE gt_flight WHERE carrid = 'KE'`(복수 건·TABLE)로 바꾸고, `gs_brief` wa 변형은 **토글로 보존**하되 ★ C045 잔존값 경고와 함께 배지 처리 | corr 탭 코드: `SELECT SINGLE … INTO CORRESPONDING FIELDS OF gs_brief WHERE carrid AND connid`(본문과 형태 불일치·부분 키) → 기본 탭이 **본문 정본과 1:1**. wa 토글은 `직전 값 잔존` 경고 배지 1개 표시. 탭 3회 왕복 후에도 토글 버튼 2개 유지(리스너 중복 0) |

---

## B. ★ 본문 연동 처리 (content-map §D)

| ★ 항목 | 처리 | 근거 |
|---|---|---|
| **C002 정합** (최우선) | `CH08-L05-S01.html`에 **`.note` 하나를 신설** — "이 실험실은 그 장면을 보여 주려고 `connid 0712` 한 행의 `fltime`을 **일부러 비워 뒀습니다.** 실제 `SPFLI` 같은 DDIC 테이블은 컬럼을 비워 둘 수 없어 이 조건이 **늘 0건**입니다." 기존 note에 섞지 않고 분리해 눈에 걸리게 했다. cfg의 `fltime:null` 행은 **유지**(교육 목적) | 본문 L05가 "돌려 보면 늘 0건, 잘못 쓴 게 아니다"로 바뀌었는데 위젯은 `fltime IS NULL`에 1건을 돌려준다(실측 확인). 안내가 없으면 정면 충돌 |
| **C032 ★** | 판정 로직을 본문 L06 표 5행과 **1:1로** 맞춤(§A C032). 엔진 헤더 주석에 표 내용을 규약으로 못 박아 다음 수정자가 되돌리지 못하게 했다 | 본문 L06 "키는 앞에서부터 이어 채운다" 표 |
| **C031 ★** | 부분 키 SINGLE을 **키 전체로 교정**(경고 배지 대신). 본문 L03 흔한 실수가 "조건에 맞는 행이 여럿이면 아무 한 행이 온다"로 정밀화됐으므로, 위젯이 그 패턴을 정답처럼 시범하지 않는 쪽이 맞다. 본문 L04 `INTO (gv_occ, gv_max)` 예제도 키 전체를 준다 | 본문 L03 흔한 실수 · L04 변수 묶음 예제 |
| **C061 ★** | wa 변형을 남기되 **잔존값 경고와 함께**(§A C061). 근거는 코퍼스 재확인: `abapinto_clause.htm` — wa는 "The content of surplus components of wa **is not changed**", TABLE은 "**Before any assignment … an initial row of the internal table itab is created**" → wa=직전 값 잔존 / TABLE=초기값. 두 탭의 설명을 이 차이대로 갈라 썼다 | 본문 L04 ⚠️ 잔존값 경고(C045) |
| **C059 ★** | 데이터셋 추가로 처리(§A C059). 본문 L02가 C043 순서 역전으로 구구단 되찾기를 레슨 첫 코드로 올렸으므로 간극이 커졌다는 인계 판단을 그대로 수용 | 본문 L02 첫 절 |
| **§D 후단 3항** | ① `::embed` 7줄 **ID·캡션 무변경**(위젯 계약 보존) — 위젯 HTML의 `<title>`·파일명·엔진 바인딩 전부 그대로. ② L06 '보조 인덱스' 탭 톤 — 이미 "개념만"이라 톤 수정 불요였으나, 카드 문구가 본문이 방금 정정한 내용과 어긋나 함께 고침(§D 자체발견 2). ③ L01 KE 각색 고지 — 위젯 데이터 **교체 없음**(본문이 공인) | content-map §D |

---

## C. 엔진 회귀 목록

**사용처 전수 grep 결과 — 이번에 만진 4엔진은 모두 CH08 전용(1:1), 타 챕터 회귀면 없음.**

| 엔진 | 사용 위젯 | 사용처 수 | 회귀 검증 |
|---|---|---|---|
| `select-query-simulator.js` | `CH08-L02-S01` | **1** | 프리셋 전수(구구단 4 + 인물 5) · 데이터셋 왕복 2회 후 결과 동일(상태 누수 0) · F8 단축키 · 컬럼 부분 선택 · AND/OR · 0건(sy-subrc 4) · 거터 줄번호와 코드 줄 수 1:1. **하위호환**: `datasets[]`가 없는 단일 config도 그대로 동작하도록 `[cfg]`로 감쌌다 |
| `into-target-board.js` | `CH08-L04-S01` | **1** | 4탭 × 3회 왕복 + 각 탭 내부 토글(swap·corr·append) 왕복 → 토글 버튼 중복 생성 0·최종 상태 정상. APPENDING 4행 / INTO 2행 유지 |
| `key-condition-lens.js` | `CH08-L06-S01` | **1** | 3모드 × 3회 왕복 · 키 체크박스 3종 토글 왕복 후 판정 동일 · `#keysel`은 key 모드에서만 표시(index 모드 `none`) |
| `where-filter-lab.js` / `.css` | `CH08-L05-S01` | **1** | 칩 11종 개별·전체 ON · AND/OR · NOT · 초기화 · NULL 행이 비교 연산자에 걸리지 않음 확인. CSS는 `.note a{color:var(--brand)}` 1줄만 추가(다른 엔진과 동일 패턴) |

**미변경 엔진**(cfg만 수정): `client-scope-filter`(L01) · `select-form-lab`(L03) · `empty-result-message`(L07) — 각각 client 3종 전환·4형태+상황칩 8회·dan/피드백 5조합 실행으로 정상 확인.

### 다크 CSS 계약
`node tools/gen-embed-dark.mjs` 재실행 → `_dark.css` **md5 `83b68ae9…` 불변 · diff 0**. 신규 CSS·인라인 색을 전부 `var(--…)` 토큰으로만 썼기 때문(하드코딩 hex 0 → 생성기가 잡을 것이 없음). 다크 실렌더 확인: L05(칩·묶음라벨·NOT 토글·note 2개·링크) · L02(데이터셋 칩·빌더·양쪽 표) · L04(corr wa 탭 잔존값 경고 핑크) 전부 정상 대비.

---

## D. 작업 중 자체 발견·수정 (지시 밖 2건 — 신고)

1. **내가 만든 결함을 재측정에서 잡아 수정** — C058 처리 후 `city LIKE '서%'` 상태에서 숫자 컬럼 `age`로 바꾸면 연산자는 `=`로 폴백되는데 **값 `서%`가 남아 `WHERE age = 서%`라는 잘못된 ABAP이 화면에 찍혔다**(판정은 NaN→0건). C034가 세운 "화면 코드 = 도는 문장" 원칙을 내가 다시 깬 셈이라 두 겹으로 고쳤다: ① 컬럼을 바꾸면 값을 비운다 ② **숫자 컬럼에 숫자가 아닌 값은 자격 미달**로 보고 문장·판정 양쪽에서 빼고 전용 주석(`" 숫자 컬럼에 숫자가 아닌 값이 들어와 조건 N개가 빠졌습니다`)을 띄운다.
2. **L06 '보조 인덱스' 탭 카드 2개가 본문의 정정 내용과 어긋나 수정** — 지시 클러스터엔 없지만 본문 C030·C020이 방금 바로잡은 사실을 위젯이 그대로 반복하고 있었다. `S/4HANA 환경 / 컬럼 저장` → **`SAP HANA 위에서는 / 컬럼 저장이라 통째로 훑는 데 강함 — 예전 DB만큼 많이 만들지는 않음`**(HANA=DB, S/4HANA=그 위 애플리케이션이라는 계층 정정), 결론 카드 `설계 검토 후 꼭 필요한 곳만` → **`이 과정 실습 환경에선 직접 만들 일 거의 없음 — 필요 여부는 측정으로`**(본문 결론과 동일 문구). 두는 쪽이 새 결함이 되는 상황이라 함께 고쳤다.

### 부수 정합 (같은 파일 안, 문구만)
- `CH08-L04-S01` lead의 "네 가지 **도착지**" → "네 가지 **그릇**" — 본문 C039·C040이 그릇으로 통일했고 L04 절 제목도 "같은 SELECT, 다른 담는 그릇"이라 어휘 분기를 만들지 않기 위함.
- `CH08-L05-S01` note의 `%` 설명을 본문 C053 확정 문구("임의 길이(0글자여도 됩니다) / 정확히 한 글자")로 맞춤.
- `CH08-L02-S01` note를 새 규약 2줄(LIKE 문자 전용 · 자격 미달 조건 제외)로 보강.

---

## E. 검증 요약

- **콘솔 오류 0** — 7위젯 전수(`?v=w2`～`w4` 재로드 후 각각 확인).
- **인터랙션 전수** — L01 client 3종 · L02 프리셋 9 + 데이터셋 2 + 빌더 전 조합 + F8 · L03 형태 4 + 상황칩 4 · L04 탭 4 + 내부 토글 3종 · L05 칩 11 + AND/OR + NOT + 초기화 · L06 모드 3 + 키 8케이스 · L07 dan 3 × 피드백 3(팝업 열고 닫기 포함).
- **링크 404 해소** — 3건 모두 **실제 마우스 클릭**으로 iframe 탈출·목적지 도달 확인(§A C012). L07 대상 `CH15-L04`는 제목이 "AT SELECTION-SCREEN 입력 검증"이지만 `introduces`에 **`MESSAGE 타입(I/S/W/E/A/X)`·`메시지 클래스(SE91)`**를 보유한 정식 도입 레슨이라 R5("링크 대상 = 그 내용이 실제 있는 레슨")를 만족한다(본문 L07 링크와도 동일).
- **가로 스크롤 0** — 변경 위젯 전부 `scrollWidth === clientWidth`(L02 735/735 · L04 750/750 · L05 750/750 · L06 750/750, iframe 안 626/626).
- **다크 diff 0** — 위 §C.
- **범위 준수** — `content/**`·`docs/**` 무수정. `git diff`상 내 변경은 **엔진 4 + CH08 위젯 7 + `embeds/abap/_index.md`**뿐(같은 배치의 CH05～CH07 작업자 변경분이 diff에 함께 보이나 내 소관 아님).
- **`_index.md` 갱신** — CH08-L02·L04·L05·L06 인스턴스 행 + `select-query-simulator` 엔진 행(신규 계약 4항) 반영.
- **미실행** — `npm run build:abap`(본선 일괄) · git add/commit(본선 몫).

### 후속 제안 (범위 밖 · 별도 태스크로 등재함)
`embeds/abap/` 안에서 **CH09～CH11 위젯 10개**가 CH08과 똑같은 형태의 404 링크(`href="CHxx-Lyy.html"`)를 갖고 있다. CH08에서 검증된 `../../docs/abap/pages/…` + `target="_top"` 패턴을 그대로 적용하면 된다.
