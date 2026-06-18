# 02. PROGRESS — 진행 현황 · 다음 할 일

> 📅 **최종수정: 2026-06-18 KST**
> 🎯 **목적:** 목표가 어디까지 왔고, 다음에 무엇을 할지. 작업 시작·종료 시 갱신.
> 📖 **읽을 때:** 작업 시작 전(현황 파악) · 종료 후(갱신).
> ⚡ **TL;DR:** ABAP 커리큘럼 골격+CH01~14 본문 완료(CH15+ 스텁). 이번에 `sample/` 독립형 라이브러리 구축 + 입문자 작성표준·이름 풀 확정.

## 📦 ABAP 커리큘럼

| 항목 | 상태 |
|------|------|
| 콘텐츠 파이프라인(`tools/build-curriculum.mjs`) | ✅ 동작 |
| 런타임 셸(`assets/shell.js`/`shell.css`) | ✅ 상단바·3탭 네비·이전다음·용어팝업 |
| 전체 spine(35챕터/192레슨 스캐폴딩) | ✅ |
| CH01~CH14 본문(88 레슨, classic 기초 전체) | ✅ 완료 |
| CH15~CH35 본문 | 🚧 스텁 골격 |
| 로드맵 `pages/abap.html`(데이터 주도, CH18 경계 표시) | ✅ |
| glossary(57용어, CH01~14 커버) | ✅ |
| 브라우저 시각 스모크테스트 | ⚠️ 일부 미실시(미리보기 깊은 URL 제약 → [07](07_BROWSER_TESTING.md)) |

## 🧪 샘플 라이브러리 (`sample/`) — 이번 세션 구축

- 카테고리별 **독립형(self-contained) 학습수단·구조 샘플** + 카탈로그(`sample/index.html`). 상세 [06_SAMPLE_LIBRARY](06_SAMPLE_LIBRARY.md).
- **디자인 결정 현황**:
  - 스텝 디버거: ✅ **A안(라이트 IDE) 확정** → `code-learning/step-debugger.html`(ABAP 구문강조·콘솔 현재행/전체 토글·강조=실행 직전). 비교본 제거됨.
  - Mermaid 흐름도: ✅ **A안(배지 카드) 확정** → `visuals/mermaid-flowchart.html`(역할 배지 카드·곡선 엣지·빈 라벨 박스 숨김·스타디움 라벨 클립 해제). 비교 시안 제거됨.
  - 레슨 셸: A/B 폐기(사용금지). **C안을 기준으로 종합 개선**(레일=E · 학습여정=F · 용어모음=G · 헤더 그라데이션 · T코드 미니페이지 모달 · 용어 hover/click · 전체화면 · **다크/글자크기/가독폭 localStorage** · **체험 슬롯(저장→검사→활성화, R4)** · **끝 미니퀴즈**). C가 유력 후보, D/E/F/G는 참고용. → 최종 확정 대기.
- **확정 규칙**(이번 세션): 입문자 작성표준([04 R5](04_CONVENTIONS.md)) · 이름 풀([04 R7](04_CONVENTIONS.md)).

## ▶️ 다음 할 일 (우선순위)
1. **레슨 셸 1종 선정** — 후보 C/D/E/F/G 중 1종 확정 후 본 셸/템플릿 반영(스텝 디버거·Mermaid는 ✅확정 완료).
2. **시각 스모크테스트** — 네비 3탭·이전다음·용어팝업·로드맵 렌더 눈으로 확인.
3. **CH15~ 본문 채우기** — 스텁(🚧)을 입문자 작성표준 + 체험 수단으로. CH15 Dynpro → CH16 Grid ALV → CH17 Modern → **CH18부터 modern SQL** → CH19 OO → … → TRACK-02(CH23~35). ⚠️ CH18 classic→modern 경계([04 R10](04_CONVENTIONS.md)).
4. `index.html` 허브에서 ABAP 카드 → 로드맵 연결 점검.

## 🧠 메모리 핸드오프
`~/.claude/projects/.../memory/`: sda-architecture · abap-curriculum-design · sapui5-readonly · user-working-style · example-name-pool · beginner-learning-page-style. 새 세션은 이걸로 재설명 없이 이어간다.

> 과거 세션 상세는 git log 참조. (구 `PROGRESS-20260618.md`·`AUTHORING.md`는 이 번호 체계로 흡수됨.)
