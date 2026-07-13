# CH05_QA - codex_0629_v3 품질 점검

> 대상 파일: `reference/codex_0629_v3/NEWCH05_OLDCH05_REWRITE.md`
> 작업 단위: CH05 모든 레슨
> 판정: CH05 v3 산출물 생성 완료. `content/abap` 원본의 5개 레슨을 기준으로 재집필했고, 기존 `codex_0625`의 템플릿 반복과 자동 매칭식 공식 힌트는 재사용하지 않았다.

## 1. 입력 소스 확인

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH05/_chapter.md` |
| 원본 레슨 | `CH05-L01.md` ~ `CH05-L05.md` 전부 확인 |
| 프로젝트 규칙 | R2 code=experience, R3 입문자 흐름, R6 classic-first, R15 concept gating 기준 적용 |
| 커리큘럼 원장 | `.project-docs/09_CURRICULUM_LEDGER.md`의 CH05 Structure 축 확인 |
| 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md`의 CH05 "공식과 일치" 판정 및 modern `CORRESPONDING #( )` 미노출 경계 확인 |
| 기존 reference | `reference/codex_0625/CH05_Structure-Local--DDIC.md` 확인. 진단은 참고하되 반복 템플릿 본문은 재사용하지 않음 |
| 기존 임베드 | `embeds/abap/CH05-L01-S01.html`, `embeds/abap/CH05-L05-S01.html` 확인. L02~L04는 신규 체험 설계를 글로 보강 |

## 2. 실제 레슨 수 기준

원장 요약에는 CH05가 L01, L02, L03 구조체 다루기, 캡스톤의 4개 축으로 보이지만, 현재 `content/abap/CH05` 실제 파일은 5개다.

| 실제 파일 | 반영 |
|---|---|
| `CH05-L01.md` Local Structure | 반영 |
| `CH05-L02.md` DDIC Structure | 반영 |
| `CH05-L03.md` 중첩 · .INCLUDE · .APPEND | 반영. 다만 `.APPEND`는 표준 확장 입구만 설명하고 심화는 후속으로 제한 |
| `CH05-L04.md` 구조체 다루기 | 반영 |
| `CH05-L05.md` 구구단 캡스톤 | 반영 |

## 3. 공식 문서 수동 확인

Classic ABAP 및 DDIC 관련 공식 근거는 `C:\ABAP_DOCU_HTML`에서 직접 파일명을 확인했다. 자동 매칭 힌트는 사용하지 않았다.

| 레슨 | 확인 파일 | 반영 내용 |
|---|---|---|
| L01 | `abapdata_struc.htm` | `DATA BEGIN OF ... END OF`가 structure를 선언하고 component 사이에 `DATA` 문과 include 구문을 둘 수 있음을 확인 |
| L01 | `abendata_objects_structure.htm` | Structure는 component들로 구성된 structured data object이며 component가 메모리에 연속 저장된다는 설명 반영 |
| L01 | `abenstructure_component_selector.htm`, `abencomponent_selector_glosry.htm` | 구조체 component 접근은 `struct-comp`, 하이픈 `-`가 structure component selector임을 반영 |
| L01 | `abenwork_area_glosry.htm` | Work Area를 한 건을 담는 작업 영역으로 설명하는 근거 확인 |
| L02 | `abenddic_structures.htm` | DDIC Structure는 다른 data type들을 component로 포함하는 structured type임을 반영 |
| L02 | `abenddic_structures_tech.htm`, `abenddic_structures_sema.htm` | DDIC Structure의 technical/semantic 속성 범위 확인 |
| L02 | `abenddic_define_structure.htm` | DDIC Structure 정의와 ADT/metadata 기반 관리 범위 확인. 본문은 SE11 입문 흐름으로 유지 |
| L03 | `abennested_structure_glosry.htm` | nested structure는 substructure를 포함하는 구조임을 반영 |
| L03 | `abenddic_include_structure.htm`, `abeninclude_structure_glosry.htm` | Include Structure가 다른 DDIC 구조의 component를 포함하고 펼쳐 넣는다는 설명 반영 |
| L03 | `abenddic_append_structures.htm`, `abenappend_structure_glosry.htm` | Append Structure가 DDIC structure/table에 component를 추가하는 확장 방식이며 고객 시스템에서 SAP 제공 객체에 붙일 수 있음을 반영 |
| L04 | `abapclear.htm` | `CLEAR`가 data object를 타입별 initial value로 되돌리고 structure도 initial value가 됨을 반영 |
| L04 | `abapmove-corresponding.htm` | `MOVE-CORRESPONDING`은 이름이 같은 component를 구조체 간 또는 internal table 간 할당한다는 설명 반영. CH05 본문은 구조체 간 이동만 다룸 |
| L04 | `abenmove_corresponding_struc_abexa.htm` | 구조체 간 `MOVE-CORRESPONDING` 예시 근거 확인 |
| L05 | L01/L04 확인 파일 재사용 | 구구단 구조체 캡스톤은 Local Structure, component selector, `CLEAR`/디버거 흐름 적용 |

## 4. ABAP Cloud / Clean Core / NotebookLM 확인 범위

CH05는 Track 1의 Classic ABAP Structure 입문 챕터다. ABAP Cloud, Clean Core, RAP, released API, cloud extensibility를 도입하지 않는다. `.APPEND`는 표준 직접 수정 금지와 확장 방식의 입구로만 언급했고, Clean Core 전략이나 key user/developer extensibility의 세부 내용은 본문에 추가하지 않았다.

NotebookLM과 인터넷 검색은 사용하지 않았다. 로컬 원본, 프로젝트 SSOT, `C:\ABAP_DOCU_HTML` 수동 확인으로 충분했다.

## 5. R15 게이팅 점검

| 항목 | 판정 | 근거 |
|---|---|---|
| Classic-first | 통과 | `DATA(...)`, `VALUE`, `NEW`, constructor expression, modern Open SQL 예제 없음 |
| Modern `CORRESPONDING #( )` | 통과 | CH18 이후 주제로 명시하고 CH05 예제에는 classic `MOVE-CORRESPONDING`만 사용 |
| String template | 통과 | 예제 없음 |
| Internal Table | 통과 | CH06으로 예고만 함. CH05에서는 Structure 한 행 한계까지만 설명 |
| Transparent Table | 통과 | CH07 영속 저장 주제로 예고만 함 |
| DDIC Domain | 통과 | CH03 복습으로 Domain은 직접 타입으로 쓰지 않고 Data Element 경유라고 설명 |
| Append Structure | 통과 | 원본 L03에 있으므로 다루되, 표준 확장의 입구와 직접 수정 금지 수준으로 제한 |
| Debugger | 통과 | CH04 학습분 재사용. 새 디버거 기능을 과도하게 추가하지 않음 |

## 6. 레슨별 품질 점검

| 레슨 | 왜 필요한가 | 무엇인가 | 어떻게 확인 | 실수/주의 | 체험 설계 | 정리 |
|---|---|---|---|---|---|---|
| CH05-L01 | 통과 | 통과 | 통과 | 통과 | 기존 구조체 스텝 디버거 연결 | 통과 |
| CH05-L02 | 통과 | 통과 | 통과 | 통과 | Local/DDIC 비교 시뮬레이터 신규 설계 | 통과 |
| CH05-L03 | 통과 | 통과 | 통과 | 통과 | 중첩/Include/Append 비교형 시뮬레이터 신규 설계 | 통과 |
| CH05-L04 | 통과 | 통과 | 통과 | 통과 | source/target 구조체 이동 스텝퍼 신규 설계 | 통과 |
| CH05-L05 | 통과 | 통과 | 통과 | 통과 | 기존 구구단 구조체 디버거 연결 | 통과 |

## 7. 체험·시뮬레이터 설계 점검

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 Local Structure | 흩어진 변수 보기와 구조체 보기 전환, `ls_person` 펼침, component별 값 채움 상태 |
| L02 DDIC Structure | Local/DDIC 비교 카드, 활성화 상태, Data Element 사용 시 라벨/F4 연결 표시 |
| L03 구조 재사용 | 중첩/Include/Append 구조 다이어그램, 접근 경로 미니 퀴즈, 이름 충돌 경고 |
| L04 구조체 다루기 | source/target 구조체 카드, 같은 이름 component 연결선, `MOVE-CORRESPONDING`, `CLEAR` 버튼 |
| L05 구구단 캡스톤 | 구조체 카드와 출력 리스트 분리, `ls_line` 한 행 갱신과 화면 출력 누적 차이 표시 |

## 8. 기존 codex_0625 대비 개선

| 기존 문제 | v3 조치 |
|---|---|
| 레슨별 보강안이 템플릿 반복 | 실제 CH04 구구단 불편과 CH06 Internal Table 연결로 직접 서술 |
| L02~L04 체험 설계 추상적 | 버튼, 상태, 데이터, 피드백을 구체화 |
| L03 공식 힌트가 internal table 쪽으로 잘못 기울어짐 | DDIC include/append/nested structure 공식 파일로 수동 재확인 |
| L04 본문 빈약 | 통째 대입, `CLEAR`, `MOVE-CORRESPONDING`, target 잔존값 주의까지 보강 |
| 캡스톤의 다음 장 동기 약함 | Structure 한 행과 화면 출력 누적을 분리해 CH06 필요성을 명확히 설명 |

## 9. 코드 예제 점검

| 점검 항목 | 결과 |
|---|---|
| ABAP 문장 종결 마침표 | 통과 |
| classic `DATA`/`TYPES` 형식 | 통과 |
| inline declaration 없음 | 통과 |
| modern constructor expression 없음 | 통과 |
| `CORRESPONDING #( )` 없음 | 통과 |
| modern SQL 없음 | 통과 |
| `PARAMETERS` 남용 없음 | 통과 |
| `BREAK-POINT` 사용 | CH04 학습분 재사용. 디버거 확인용으로만 사용 |
| Internal Table 문법 | 본문 예제 없음. CH06으로 예고만 함 |

## 10. 최종 판정

CH05 v3 산출물은 생성 완료로 판정한다. 원본 `content/abap/CH05`의 5개 레슨을 모두 포함했고, 공식 문서 수동 확인 근거를 QA에 기록했으며, 기존 `codex_0625`의 템플릿 반복을 제거했다. 각 레슨은 입문자 기준의 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리" 흐름을 갖춘다.

이번 산출물 범위는 reference 재집필 자료이므로 실제 `content/abap/CH05` 파일은 수정하지 않았다. 다음 실제 이식 단계에서는 L02~L04 신규 체험을 embed로 구현할지, 우선 본문형 체험 설명으로 둘지 결정하면 된다.
