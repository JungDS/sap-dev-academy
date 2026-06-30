# embeds — 학습수단 위젯 *집필 계약*

> 새 체험 위젯(`embeds/abap/CHnn-Lnn-Snn.html`)을 만들 때 지키는 계약. 레슨 MD의 `::embed CHnn-Lnn-Snn | 제목 | 높이::`가 이 위젯을 iframe으로 띄운다([04 R5](../../.project-docs/04_CONVENTIONS.md)).
> 📍 정본 참조 구현(베끼기 좋은 예) = config 주도형 **`inline-decl-judge`**(`embeds/abap/CH18-L01-S01.html`) · 공통 토큰 = `_base.css` · 현황·등록부 = [embeds/abap/_index.md](../abap/_index.md).
> ⚠️ 이 계약을 `.project-docs`가 아니라 *코드 곁*에 둔 이유: 위젯은 코드다(셸 자산을 인덱스 주석으로 다루는 [04 R8](../../.project-docs/04_CONVENTIONS.md)과 같은 원리). 규칙 단일 홈은 여전히 [04](../../.project-docs/04_CONVENTIONS.md).

## 1. 위젯 해부 (`CHnn-Lnn-Snn.html`)
- **최상단 주석 1줄**: `CHnn-Lnn-Snn · 엔진 · 콘텐츠 요약 · config=window.XXX_CFG · 게이팅(어느 챕터 개념까지 허용)`.
- `<html lang="ko" data-eng="<engine>">` — `data-eng`로 엔진 식별.
- `<head>`: **`../_engine/_base.css`를 *맨 먼저* `<link>`** → 그다음 `../_engine/<engine>.css`.
- `<body>`: `.wrap` > `.hd` · `.lead` · `<엔진 컨테이너>` · `.note`.
- 데이터 = `<script>window.XXX_CFG = {…}</script>`(인스턴스별 주입) → `<script src="../_engine/<engine>.js" defer>` → (자체 높이 없으면) `../_engine/_autoheight.js`.

## 2. 엔진 재사용 우선 · config 주도
- **재사용 먼저**: 같은 종류면 기존 엔진에 `XXX_CFG`만 갈아끼운다(`step-debugger`·`module-choice-cards`·`diff-mapper` 등은 여러 레슨 공용 — 현황 = `_index.md` 표 B).
- **로직/데이터 분리**: 엔진 로직은 `_engine/<name>.js`에, *레슨별 데이터는 인스턴스 HTML의 `XXX_CFG`* 에. **엔진에 레슨 데이터 하드코딩 금지.** (주입 보조 도구: `tools/_inject-cfg.mjs`.)
- 신규 엔진만 `embeds/_engine/<name>.js`(+선택 `<name>.css`) 추가.

## 3. 높이
- 자체 `postMessage({sda:'embed-height'})`가 없으면 **`_autoheight.js` 포함** — `.wrap` 바닥+body 마진을 부모에 전달(shell.js가 iframe 높이 설정). DOM 변화·`<details>` 토글·웹폰트 swap에 자동 재측정.
- 엔진이 자체 높이 로직을 가지면 `_autoheight.js` 생략.

## 4. 다크모드 (3층 — 회귀 빈발, 엄수)
1. 셸이 iframe `<html>`에 `.dark` 주입(shell.js embedTheme, same-origin).
2. `_base.css html.dark{}`가 **코어 토큰**만 어둡게 → **`var(--token)`을 쓰면 자동 적응.** 색은 항상 토큰(`--ink`·`--surface`·`--line`·`--good`·`--bad`·`--fill-*` …)으로 — **하드코딩 hex 금지.**
3. 엔진 css의 불가피한 하드코딩 라이트색은 생성물 `_dark.css`가 덮는다 → **엔진 css 추가/변경 후 반드시 `node tools/gen-embed-dark.mjs` 재생성.**
- 코드 블록 배경은 `base=var(--surface)`로 틴트(다크에서 안 깨짐) · 톤은 중립(`tone-warm`/`tone-cool`) · 상태는 명시 클래스(`.ok`/`.bad`).

## 5. 번호·등록
- `Snn` = 레슨 내 체험 순번(`S01`·`S02`…). 한 레슨에 여러 개 OK, 비연속 OK(보류분 파일 보존·본문 미참조). 본문 `::embed CHnn-Lnn-Snn`이 호출.
- **반드시 [`_index.md`](../abap/_index.md)에 등록**: 표 A(파일·레슨·엔진·설명·상태) + 표 B(엔진 집계). 상태 = ⬜미작성 · 🔧작성중 · ✅검증완료 · 🖼️이미지 · 🔁보류.

## 6. 검증
- HTTP 서빙으로 iframe 로드([05 P1](../../.project-docs/05_PITFALLS.md)) · 콘솔 0 · **라이트/다크 둘 다** · 높이 자동맞춤 확인([07](../../.project-docs/07_BROWSER_TESTING.md)).
