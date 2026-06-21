# SAP Developer Academy

> **개발을 처음 배우는 비전공자**를 개발자의 시선으로 **0부터** 안내하는 SAP 학습 여정.

**주 학습 대상 = 개발·전공 경험 없는 20대 전후 입문자.** ("개발자 시선으로"는 *가르치는 관점*이지 독자 수준이 아니다.) 노션·인스타 세대가 친근하게 느끼도록 **이모지·아이콘·시각요소를 적극 활용**한 **동기부여형(motivation-first)** 사이트. "분류 순서로 쌓기" 대신 **불편을 먼저 체감 → 그 해결책으로 개념 도입**.

## 학습 도메인
- **ABAP 커리큘럼** — Chapter 1(SAPGUI/SE38)부터 시작하는 본 과정 (1순위)
- UI5/Fiori · SAP 모듈(FI/CO/MM/PP/SD) · 통합 실습(ABAP↔Gateway↔UI5) — 예정
- 글로서리·T-code 지도 등은 커리큘럼을 가로지르는 **보조 레이어**

## 구조 · 파이프라인
`content/abap/**.md`(소스) → `npm run build:abap` → `docs/abap/**`(생성물) → 런타임 셸. 손작성 자산 = `sample/`·`assets/`. (상세 [03_ARCHITECTURE](.project-docs/03_ARCHITECTURE.md))

## 비고
구 저장소 `JungDS/sapui5`를 대체. 구 repo는 읽기 전용 참고 원본([01 R2]).
