# 05. PITFALLS — 자주 깨지는 함정 (P = Pitfall)

> 📅 **최종수정: 2026-06-29 15:09 KST**
> 🎯 **목적:** 반복해서 발목 잡히는 지점을 안정 ID로 모아 빠르게 회피.
> 📖 **읽을 때:** 작업 중 막혔을 때 즉시.
> ⚡ **TL;DR:** P1 fetch는 HTTP필수 · P2 생성물 직접수정 금물 · P3 미리보기 깊은URL/스크린샷 한계 · P4 헤드리스 트랜지션 멈춤 · P5 mermaid 빈 라벨/HTML라벨 · **P10 코드블록 다크 금지(code-copy-block 강제)** · **P11 후속 개념 선노출 금지(R15 게이팅)**.

| ID | 함정 | 회피 |
|----|------|------|
| **P1** | 레슨/로드맵이 `fetch`라 `file://`로 열면 데이터가 안 보인다. | 반드시 `python -m http.server 8137` 등 **HTTP로 서빙**([03](03_ARCHITECTURE.md)). |
| **P2** | `docs/**`(HTML/JSON)를 손으로 고치면 다음 빌드에 날아간다. | 내용은 `content/**.md`에서만. `npm run build:abap` 재생성([04 R1](04_CONVENTIONS.md)). |
| **P3** | 미리보기 `preview_screenshot`이 자주 타임아웃되고, 깊은 URL 네비도 컨텍스트가 끊기기 쉽다. | **검증은 `preview_eval`의 DOM 측정**으로(정확도↑). 네비 후 별도 eval로 재측정. [07](07_BROWSER_TESTING.md). |
| **P4** | 백그라운드/헤드리스 탭에서는 CSS **트랜지션·애니메이션이 멈춰** 시작프레임 값으로 측정된다(예: 드로어 transform, 배경색 transition). | 최종 상태가 궁금하면 `el.style.transition='none'` 후 측정하거나, 클래스/속성으로 검증. 실제 브라우저에선 정상. |
| **P5** | Mermaid: HTML 라벨 쓰려면 `securityLevel:'loose'`. 라벨 없는 엣지도 빈 라벨 컨테이너가 생겨 배경을 주면 빈 박스로 보인다. 스타디움 라벨은 폭이 약간 좁아 끝 글자가 잘릴 수 있다. | 렌더 후 빈 `.edgeLabel` 숨김 + 라벨 `overflow:visible`/패딩. 참고: `sample/visuals/mermaid-flowchart.html`. |
| **P6** | 공통 자산(`shell.js`·`base.css`)을 안 읽고 고치면 중복/충돌. | 수정 전 **인덱스 주석+grep으로 기존 구현 확인**([04 R8](04_CONVENTIONS.md)). |
| **P7** | Open SQL 문법이 classic↔modern으로 갈린다 — 섞으면 규율 위반. | **CH01～17 classic · CH19+ modern(New Open SQL)**([04 R6](04_CONVENTIONS.md)). |
| **P8** | 즉석에서 사람 이름을 지어내면 톤 깨짐(김ABAP 등). | 이름은 풀에서만, 1번은 정훈영([04 R9](04_CONVENTIONS.md)). |
| **P9** | `~/.claude/settings.json` 등 startup config 자기수정은 auto-mode 분류기가 차단할 수 있다(특히 출처가 모호하면). | 사용자가 직접 하거나 명시적으로 확인. 우회 시도 금지. |
| **P10** | **(R5 규칙의 회귀 기록 — 새 규칙 아님)** 코드 블록을 다크/블랙으로 만들지 말 것. 합의된 양식 = **[code-copy-block](../sample/structure/code-copy-block.html)**(네이비 헤더 + 줄번호 + ABAP 토큰색 + 복사). 과거 `lesson.css .prose pre{background:#0f172a}`가 모든 블록을 검게 만들어 반복 지적됨. | 본문 MD엔 ```` ```abap ```` 만 쓰고 **빌드가 `.abap-editor` 마크업으로 강제 변환** → 손으로 검은 블록이 나올 수 없다. 새 코드 표시도 이 양식 재사용([04 R5](04_CONVENTIONS.md)). |
| **P11** | **후속 개념 선노출** — AI가 예제/설명 완성도를 높이려 아직 안 배운 문법·개념을 미리 정의·코드로 보여줘 인지부하↑·"이걸 지금 알아야 하나" 혼란(특히 리빌딩 때 빈발). | **R15 게이팅** 적용: 미래 개념은 L0/L1(예고는 1～2문장·코드없음)만, 불가피하면 `[선행 사용]`(L2) 명시. 생성 전/후 DoD의 학습순서 항목 점검([04 R15](04_CONVENTIONS.md)). |
