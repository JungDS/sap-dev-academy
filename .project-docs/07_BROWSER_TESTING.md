# 07. BROWSER TESTING — 미리보기 검증 워크플로

> 📅 **최종수정: 2026-06-18 KST**
> 🎯 **목적:** 화면/인터랙션을 신뢰성 있게 검증하는 방법(이 환경의 한계 포함).
> 📖 **읽을 때:** 브라우저로 동작을 확인해야 할 때.
> ⚡ **TL;DR:**
> - 정적 서버: `python -m http.server 8137`(이미 `.claude/launch.json`의 `static`로 등록).
> - **검증은 `preview_eval`의 DOM 측정**이 1순위(스크린샷보다 정확·안정). 스크린샷은 보조.
> - 페이지가 `fetch`면 반드시 HTTP([05 P1](05_PITFALLS.md)).

## 서버 띄우기
- `preview_start` name=`static` (포트 8137). `.claude/launch.json`에 `python -m http.server 8137`로 정의됨.
- URL 예: `http://localhost:8137/sample/index.html`, `.../docs/abap/pages/CH01-L01-logon.html`.

## 검증 순서 (권장)
1. `preview_eval`로 페이지 이동: `location.href='http://localhost:8137/...'` → 다음 eval은 **새로** 보낸다(네비 후 이전 컨텍스트는 끊김, [05 P3](05_PITFALLS.md)).
2. `preview_eval`로 **DOM 측정**: 요소 존재·텍스트·`getComputedStyle`·`getBoundingClientRect`·클래스 토글·인터랙션 클릭 후 상태. (정확도 최고)
3. `preview_console_logs` level=`error` 로 **콘솔 에러 0** 확인.
4. (보조) `preview_screenshot` — 단, 본 환경에서 **자주 타임아웃**([05 P3](05_PITFALLS.md)). 실패해도 DOM 측정으로 결론 가능.

## 측정 함정 (헤드리스)
- CSS **트랜지션/애니메이션이 멈춰** 시작프레임으로 읽힐 수 있다([05 P4](05_PITFALLS.md)). 최종값은 `style.transition='none'` 후 측정.
- programmatic `window.scrollTo`가 `scroll` 이벤트를 즉시 발화 안 할 수 있다 → 필요시 `dispatchEvent(new Event('scroll'))`로 핸들러 직접 호출해 확인.

## 합격 기준
- 콘솔 에러 0 · 핵심 인터랙션(클릭/토글/입력) 동작 확인 · (해당 시) 빌드 정적 점검 통과. [01 DoD](01_AI_SYNC.md).
