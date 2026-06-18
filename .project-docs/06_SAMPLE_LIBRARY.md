# 06. SAMPLE LIBRARY — 학습수단·페이지구조 샘플 카탈로그

> 📅 **최종수정: 2026-06-18 KST**
> 🎯 **목적:** `sample/`의 독립형 샘플을 레슨 제작 시 골라 쓰기 위한 지도.
> 📖 **읽을 때:** 레슨에 시각화/체험/구조를 붙일 때(특히 코드→체험 필수일 때 [01 R4](01_AI_SYNC.md)).
> ⚡ **TL;DR:**
> - 각 샘플은 **완전 self-contained 단일 HTML**(CSS·JS 내장, 외부의존 0; mermaid만 CDN).
> - 카탈로그는 `sample/index.html`. 재사용은 그 파일의 `<style>`/`<script>` 블록만 옮기면 끝.
> - 원본 아이디어는 구 repo `sapui5/sample/learning-methods-v3`. [[sapui5-readonly]]

## 카테고리

| 폴더 | 성격 | 대표 |
|------|------|------|
| `structure/` | 페이지 골격·기술 | 레슨 셸(v1 + v2 후보 C/D/E/F/G 검토 중), 코드 복사 블록, 콜아웃, **입문자 레슨 템플릿** |
| `foundations/` | 정적 설명형 | 개념 스토리텔링, 치트시트, 접이식, 요약 회수, 공식 링크 |
| `code-learning/` | 코드 학습형 | 코드 투어, Bad/Good 매퍼, 빈칸 채우기, 버그 헌트, 스텝 디버거 |
| `interactive/` | 상호작용형 | **가상 SAP GUI 샌드박스**, 의사결정 트리, 체크리스트, 단축키 시뮬레이터 |
| `quizzes/` | 능동 회수 | 드래그&드롭, 카드 분류, 플래시카드, O/X 서바이벌, 단답형, 미니 시험 |
| `visuals/` | 시각화 | Mermaid 흐름도, 프로세스 플로우, 관계도, Before/After, 상태 변화, 데이터 테이블, 차트, SVG 아키텍처, 핫스팟 |

## "코드 → 체험" 추천 매핑 ([01 R4](01_AI_SYNC.md))
| 본문에 나오는 것 | 붙일 체험 샘플 |
|---|---|
| SAP GUI 화면/T-code 실행 | `interactive/sap-gui-sandbox.html` (입력→검증→ALV, 표준 T-code SE16N 예시) |
| 변수/루프 추적 | `code-learning/step-debugger.html` |
| 구문 작성 | `code-learning/fill-blank-code.html` · `quizzes/drag-drop-quiz.html` |
| 잘못된 코드 식별 | `code-learning/bug-hunt.html` · `code-learning/diff-mapper.html` |
| 실행 흐름/분기 | `visuals/mermaid-flowchart.html` · `visuals/process-flow.html` |
| 내부 테이블 변화 | `visuals/state-change-grid.html` · `structure/beginner-lesson-template.html`(APPEND/LOOP 빌더) |

## 규칙 연동
- 샘플의 사람 이름도 **이름 풀** 사용(정훈영 1번)([04 R7](04_CONVENTIONS.md)).
- 입문자 톤은 `structure/beginner-lesson-template.html`이 기준 구현([04 R5](04_CONVENTIONS.md)).

## 디자인 결정 현황
- 스텝 디버거: ✅ **A안 확정** → `code-learning/step-debugger.html`(ABAP 구문강조·콘솔 토글·강조=실행 직전). 비교 초안 제거됨.
- Mermaid 흐름도: ✅ **A안(배지 카드) 확정** → `visuals/mermaid-flowchart.html`(역할 배지 카드·곡선 엣지·빈 라벨 박스 숨김). 비교 시안(v2) 제거됨.
- 레슨 셸: A/B 폐기, **C/D/E/F/G 후보 검토 중**(index "디자인 후보" 섹션). 1종 선정 후 본 셸/템플릿에 반영.
