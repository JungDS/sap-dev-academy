# 07. BROWSER TESTING — 미리보기 검증 워크플로

> 📅 **최종수정: 2026-06-29 15:54 KST**
> 🎯 **목적:** 이 프로젝트에서 브라우저로 동작을 검증하는 **절차 + 서버 specifics**. (eval/DOM-우선 원리·헤드리스 함정의 *근거*는 [05 P3·P4](05_PITFALLS.md), 일반 preview 워크플로는 하네스 기본 지침 — 여기선 중복하지 않고 *이 프로젝트 고유분*만.)
> 📖 **읽을 때:** 브라우저로 동작을 확인해야 할 때.

## 서버 (이 프로젝트 specifics)
- `preview_start` **name=`static`** (포트 **8137**) — `.claude/launch.json`에 `python -m http.server 8137`로 등록됨.
- URL 예: `http://localhost:8137/docs/abap/pages/CH01-L01.html`, `.../sample/index.html`.
- 페이지가 `fetch`면 반드시 HTTP([05 P1](05_PITFALLS.md)). 빌드/서빙 명령 정본 = [03](03_ARCHITECTURE.md).

## 검증 순서
1. `preview_eval`로 이동(`location.href='…'`) → **다음 eval은 새로** 보낸다(네비 후 컨텍스트 끊김 — 근거 [05 P3](05_PITFALLS.md)).
2. `preview_eval`로 **DOM 측정**(요소 존재·텍스트·`getComputedStyle`·`getBoundingClientRect`·클래스 토글·클릭 후 상태) — **1순위**.
3. `preview_console_logs level=error` → **콘솔 에러 0** 확인.
4. (보조) `preview_screenshot` — 이 환경선 자주 타임아웃([05 P3](05_PITFALLS.md)). 실패해도 2(DOM 측정)로 결론 가능.

## 이 프로젝트 고유 함정 (05 P3·P4 외 추가분)
- **scrollspy 등 스크롤 검증**: programmatic `window.scrollTo`가 `scroll` 이벤트를 즉시 안 쏠 수 있음 → 필요 시 `dispatchEvent(new Event('scroll'))`로 핸들러 직접 호출해 확인.
- (헤드리스 트랜지션/애니메이션 멈춤 = [05 P4](05_PITFALLS.md).)

## 합격 기준
- 콘솔 에러 0 · 핵심 인터랙션(클릭/토글/입력) 동작 확인 · (해당 시) 빌드 정적 점검 통과 → [01 DoD](01_AI_SYNC.md).
