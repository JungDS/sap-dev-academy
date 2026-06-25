# codex_0625 프로젝트 분석

> 생성 시각: 2026-06-25-13:22 KST

## 1. 읽은 프로젝트 문서와 결론

- `.project-docs/00_INDEX.md`: 자동 로드 문서와 필요 시 문서를 구분한다. 이번 작업에는 01, 04, 05, 09, 10, 12가 직접 관련된다.
- `.project-docs/01_AI_SYNC.md`: 사이트 목표는 "개발자 시선으로 0부터"이며, 완전 입문자에게 압축 없이 동기와 체험을 제공해야 한다.
- `.project-docs/04_CONVENTIONS.md`: R2 코드=체험, R3 입문자 작성법, R6 classic-first 경계, R10 front matter, R12 glossary, R15 선수지식 잠금이 핵심이다.
- `.project-docs/05_PITFALLS.md`: file:// 미리보기, docs 직접수정, dark code block, 후속 개념 선노출이 반복 함정이다.
- `.project-docs/09_CURRICULUM_LEDGER.md`: 현재 로컬 목표 구조는 CH01~CH36이며, CH18/19가 modern 문법/SQL 경계다.
- `.project-docs/12_EXPANSION_PLAN.md`: 51항목 기반 확장과 신규 레슨 승격이 이미 반영되어, 실제 로컬 콘텐츠는 237레슨이다.

## 2. 실제 콘텐츠 범위

| 항목 | 값 |
|---|---:|
| 챕터 | 36 |
| 레슨 | 237 |
| 코드 블록 | 664 |
| embed 지시문 | 104 |
| 용어 마킹 | 348 |
| R2 체험누락 후보 | 111 |
| 본문 빈약 후보 | 159 |
| 시각/체험 없음 후보 | 10 |

## 3. NotebookLM 사용 결과와 로컬 우선 판단

NotebookLM 노트북 `ad0e9cde-4dca-451e-b455-de200a9ed7b7`에 전체 보강 방향을 질의했다. 응답은 classic-first, 선후수 잠금, 코드=체험, 운영 실패 케이스 강화라는 큰 원칙을 확인하는 데 유용했다.

다만 NotebookLM은 v5.4 기준 34챕터/205레슨 소스를 근거로 답했고, 현재 로컬 저장소는 CH01~CH36, 237레슨이다. 따라서 이 산출물은 **로컬 `content/abap`과 `.project-docs`를 우선 기준**으로 삼고 NotebookLM은 보조 방향으로만 반영했다.

## 4. ABAP_DOCU 사용 방식

로컬 Classic ABAP 문서는 `C:/ABAP_DOCU_HTML/index.htm`에 있으며 SAP ABAP Keyword Documentation 7.58 HTML 세트다. 챕터별 파일에는 관련 키워드가 있을 때 `abapdata.htm`, `abapselect.htm`, `abapread_table.htm`, `abapmessage.htm`, `abapmethods_for_rap_behv.htm` 같은 로컬 파일명을 공식 확인 힌트로 붙였다.

이 산출물은 공식 문서를 길게 복사하지 않는다. 이후 실제 본문 작성자가 해당 파일을 열어 문법 세부와 예외를 확인할 수 있게 연결점만 남긴다.

## 5. 전역 보강 전략

1. **초반 CH01~08**: "실행 루프 -> 값 -> 타입 -> 구조 -> 테이블 -> DB -> SELECT"의 손맛을 유지한다. 지나친 실무 세부는 뒤로 보내고, 실행 결과를 직접 보는 체험을 늘린다.
2. **중반 CH09~17**: DDIC 관계, 모듈화, SALV, Selection Screen, Dynpro, Grid ALV는 화면/데이터 흐름이 복잡하므로 이벤트 타임라인과 관계도를 의무적으로 붙인다.
3. **경계 CH18~19**: modern 문법과 new Open SQL은 classic 지식을 대체하는 것이 아니라 리팩터링/표현력 강화 도구로 가르친다.
4. **후반 CH20~23**: OO, CDS, RAP는 파일명 암기가 아니라 책임 분리와 비즈니스 객체 생명주기로 설명한다.
5. **실무 CH24~36**: 성공 예제보다 실패, 재처리, 권한, 로그, 성능, 이송, 운영 품질을 같이 다룬다.

## 6. 생성 파일의 성격

각 챕터 파일은 다음을 포함한다.

- 원본 소스 진단: 본문 길이, 코드 수, embed 수, R2/빈약/압축 후보.
- 챕터 강의 목표: 그 장이 전체 커리큘럼에서 해결하는 불편.
- 레슨별 개선안: 도입 불편, 핵심 설명 방식, 초보자 보호, 실무 감각, 체험/시각화 설계, 공식문서 체크 힌트.

실제 `content/abap`에 반영할 때는 이 보강본을 그대로 붙여 넣기보다, 한 레슨씩 기존 front matter와 glossary/embedded widget 상태를 확인해 적용해야 한다.
