# CH06_QA - codex_0629_v3 품질 점검

> 대상 파일: `reference/codex_0629_v3/CH06_REWRITE.md`
> 작업 단위: CH06 모든 레슨
> 판정: CH06 v3 산출물 생성 완료. `content/abap` 원본 6개 레슨을 기준으로 재집필했고, 기존 `codex_0625`의 템플릿 반복과 빗나간 공식 힌트는 재사용하지 않았다.

## 1. 입력 소스 확인

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH06/_chapter.md` |
| 원본 레슨 | `CH06-L01.md` ~ `CH06-L06.md` 전부 확인 |
| 프로젝트 규칙 | R2 code=experience, R3 입문자 흐름, R6 classic-first, R15 concept gating 기준 적용 |
| 커리큘럼 원장 | `.project-docs/09_CURRICULUM_LEDGER.md`의 CH06 깊이 보강 요구 확인 |
| 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md`의 CH06 L03 `READ TABLE ... INDEX`, L04 `LOOP ... FROM ... TO` 보강 요구 확인 |
| 기존 reference | `reference/codex_0625/CH06_Internal-Table.md` 확인. 진단은 참고하되 selection screen/Open SQL 쪽으로 빗나간 힌트와 반복 템플릿은 재사용하지 않음 |
| 기존 임베드 | `embeds/abap/CH06-L06-S01.html` 확인. L01~L05는 신규 체험 설계를 글로 보강 |

## 2. 공식 문서 수동 확인

Classic ABAP internal table 관련 공식 근거는 `C:\ABAP_DOCU_HTML`에서 직접 파일명을 확인했다. 자동 매칭 힌트는 사용하지 않았다.

| 레슨 | 확인 파일 | 반영 내용 |
|---|---|---|
| L01 | `abenitab.htm` | internal table 처리 문장, 표현식, 함수 범위 확인 |
| L01 | `abenitab_data_type.htm` | table type의 기술 속성으로 line type, table category, table key가 있음을 반영 |
| L01 | `abapdata_itab.htm`, `abaptypes_itab.htm` | `DATA`/`TYPES` 기반 internal table 선언 확인 |
| L01 | `abapappend.htm` | `APPEND`가 internal index table 끝에 새 마지막 행을 만든다는 설명 반영 |
| L01 | `abapclear.htm`, `abaprefresh_itab.htm`, `abapfree_dataobject.htm` | `CLEAR`, `REFRESH`, `FREE` 차이와 header line 관련 주의 반영 |
| L01 | `abenitab_header_line.htm` | header line은 obsolete declaration 영역임을 확인하고 인식용으로만 설명 |
| L02 | `abenitab_data_type.htm` | line type, table category, key의 3속성 반영 |
| L02 | `abenitab_cat.htm` | STANDARD/SORTED/HASHED 선택 기준과 index 접근 차이 반영 |
| L02 | `abenitab_key.htm`, `abenitab_standard_key.htm` | internal table primary key와 standard key 설명 반영 |
| L03 | `abapinsert_itab.htm` | `INSERT`가 key 또는 index 위치에 행을 추가할 수 있음을 반영 |
| L03 | `abapread_table.htm` | `READ TABLE`이 table key, free key, index로 행을 읽는다는 설명 반영 |
| L03 | `abapread_table_index.htm` | `READ TABLE ... INDEX` 보강 요구 반영 |
| L03 | `abapread_table_key.htm` | `WITH TABLE KEY`와 table key 기반 검색 반영 |
| L03 | `abapread_table_transport_options.htm` | `TRANSPORTING NO FIELDS`로 존재 확인 시 복사를 생략하는 패턴 반영 |
| L03 | `abapmodify_itab.htm` | `MODIFY`가 key 또는 index로 단일/다중 행 내용을 바꿀 수 있음을 반영 |
| L03 | `abapdelete_itab.htm` | `DELETE`와 삭제 결과 `sy-subrc` 의미 반영 |
| L04 | `abaploop_at_itab.htm` | `LOOP AT`이 internal table 행을 순차적으로 읽고 statement block을 반복한다는 설명 반영 |
| L04 | `abaploop_at_itab_cond.htm` | `FROM`, `TO`, `WHERE` 조건으로 subset을 처리하는 문법 반영 |
| L04 | `abapfield-symbols.htm` | Field Symbol 이름은 angle bracket이 필수이며 operand position에서 사용할 수 있음을 반영 |
| L04 | `abapcollect.htm` | 같은 primary key가 있으면 숫자 component를 합산하고 없으면 삽입한다는 설명 반영 |
| L04 | `abapdelete_duplicates.htm` | `DELETE ADJACENT DUPLICATES`는 인접한 그룹에서 첫 행만 남긴다는 설명 반영 |
| L04 | `abapdescribe_table.htm` | `DESCRIBE TABLE ... LINES` 행 수 확인 반영 |
| L04/L06 | `abapsort_itab.htm` | `SORT ... BY ... ASCENDING/DESCENDING` 정렬 반영 |
| L05 | `abendeep_structure_glosry.htm`, `abennested_internal_tables_abexa.htm` | deep structure와 nested internal table 개념 확인 |

## 3. ABAP Cloud / Clean Core / NotebookLM 확인 범위

CH06은 Track 1 Classic ABAP internal table 입문 챕터다. ABAP Cloud, Clean Core, RAP, released API, cloud extensibility를 도입하지 않는다. 따라서 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU` 기반 Cloud/Clean Core 문서 힌트는 생성하지 않았다.

NotebookLM과 인터넷 검색은 사용하지 않았다. 로컬 원본, 프로젝트 SSOT, `C:\ABAP_DOCU_HTML` 수동 확인으로 충분했다.

## 4. R15 게이팅 점검

| 항목 | 판정 | 근거 |
|---|---|---|
| Classic-first | 통과 | inline `DATA( )`, `VALUE`, `NEW`, table expression, modern Open SQL 예제 없음 |
| Internal Table | 통과 | CH06 L3 정식 도입. 선언, APPEND, READ, LOOP, MODIFY, DELETE, SORT까지 범위 내 |
| Field Symbol | 통과 | L04에서 `LOOP ASSIGNING <fs>` 기초로만 도입. 동적 `ASSIGN (name)`, RTTS 등은 제외 |
| Header Line | 통과 | 옛 코드 인식용으로만 설명하고 새 코드 예제에서는 사용하지 않음 |
| Deep Structure | 통과 | 원본 L05 범위대로 개념만 설명. DB 저장/ALV 제약 심화는 후속으로 분리 |
| Transparent Table | 통과 | CH07 예고만. DB 저장 코드는 사용하지 않음 |
| Open SQL | 통과 | 예제 없음. CH08 이후로 유지 |
| Modern `VALUE #( FOR )` | 통과 | CH18 주제이므로 사용하지 않음 |

## 5. 레슨별 품질 점검

| 레슨 | 왜 필요한가 | 무엇인가 | 어떻게 확인 | 실수/주의 | 체험 설계 | 정리 |
|---|---|---|---|---|---|---|
| CH06-L01 | 통과 | 통과 | 통과 | 통과 | Internal Table 성장 그리드 신규 설계 | 통과 |
| CH06-L02 | 통과 | 통과 | 통과 | 통과 | Table Kind 선택 보드 신규 설계 | 통과 |
| CH06-L03 | 통과 | 통과 | 통과 | 통과 | 한 행 제어 실험실 신규 설계 | 통과 |
| CH06-L04 | 통과 | 통과 | 통과 | 통과 | 다중 행 조작 보드 신규 설계 | 통과 |
| CH06-L05 | 통과 | 통과 | 통과 | 통과 | Flat vs Deep 구조 카드 신규 설계 | 통과 |
| CH06-L06 | 통과 | 통과 | 통과 | 통과 | 기존 구구단 internal table 성장 스냅샷 연결 | 통과 |

## 6. 필수 보강 항목 점검

| 항목 | 판정 | 반영 위치 |
|---|---|---|
| `READ TABLE ... INDEX n` | 통과 | CH06-L03 "번호로 읽기" 코드와 설명 |
| `WITH KEY` vs `WITH TABLE KEY` | 통과 | CH06-L03 검색 방식 비교 |
| `BINARY SEARCH` 전 `SORT` | 통과 | CH06-L03 실수/주의 |
| `LOOP ... FROM n TO m` | 통과 | CH06-L04 범위 순회 코드 |
| `WHERE` LOOP의 `sy-tabix` 주의 | 통과 | CH06-L04 확인/주의 |
| `LOOP ASSIGNING <fs>` | 통과 | CH06-L04 직접 수정 설명 |
| `COLLECT` | 통과 | CH06-L04 합산 삽입 설명 |
| 컨트롤레벨 `AT NEW/END OF`, `SUM` | 통과 | CH06-L04 그룹 처리 설명 |
| `DELETE ADJACENT DUPLICATES` 전 `SORT` | 통과 | CH06-L04 실수/주의 |
| `DESCRIBE TABLE` | 통과 | CH06-L01, L04, L06 행 수 확인 |
| Header Line 인식용 | 통과 | CH06-L01에서 obsolete/인식용으로만 설명 |

## 7. 체험·시뮬레이터 설계 점검

| 레슨 | 반영한 체험 설계 |
|---|---|
| L01 Internal Table 기초 | work area 카드와 internal table 행 목록, APPEND/CLEAR/FREE 버튼, 행 수 피드백 |
| L02 3속성·테이블 종류 | line type/key/table kind 카드, STANDARD/SORTED/HASHED 추천 보드 |
| L03 단일 행 제어 | APPEND/INSERT/READ/MODIFY/DELETE/BINARY SEARCH 버튼, `sy-subrc`·`sy-tabix` 표시 |
| L04 다중 행 제어 | LOOP/WHERE/FROM-TO/SORT/중복제거/COLLECT/DESCRIBE 버튼, 반복 순서와 실제 index 분리 표시 |
| L05 Deep Structure | flat/deep 분류 카드, internal table component 포함 시 deep 표시 |
| L06 구구단 캡스톤 | 1행/9행/81행/정렬 후 스냅샷, APPEND와 SORT 상태 변화 표시 |

## 8. 기존 codex_0625 대비 개선

| 기존 문제 | v3 조치 |
|---|---|
| 템플릿식 보강안 반복 | CH05 한 행 한계에서 CH06 여러 행 필요성으로 직접 서술 |
| 일부 공식 힌트가 selection screen/Open SQL 쪽으로 빗나감 | internal table 공식 파일로 전부 수동 재확인 |
| L01~L05 체험 누락 | 레슨별 버튼/상태/데이터/피드백 설계 추가 |
| `READ TABLE INDEX`, `LOOP FROM/TO` 보강 요구 | 본문과 QA에 명시 반영 |
| Header Line 설명 혼동 가능 | 새 코드에서는 미사용, 레거시 인식용으로만 정리 |
| Deep Structure 본문 빈약 | flat/deep 비교, 주문-항목 예시, DB 저장 오해 주의 보강 |

## 9. 코드 예제 점검

| 점검 항목 | 결과 |
|---|---|
| ABAP 문장 종결 마침표 | 통과 |
| classic `DATA`/`TYPES` 형식 | 통과 |
| inline declaration 없음 | 통과 |
| constructor expression 없음 | 통과 |
| table expression 없음 | 통과 |
| modern Open SQL 없음 | 통과 |
| `VALUE #( FOR )` 없음 | 통과 |
| `FIELD-SYMBOLS` 사용 | L04 기초 범위로만 사용 |
| DB 저장 코드 없음 | CH07로 분리 |

## 10. 최종 판정

CH06 v3 산출물은 생성 완료로 판정한다. 원본 `content/abap/CH06`의 6개 레슨을 모두 포함했고, 공식 문서 수동 확인 근거를 QA에 기록했으며, 기존 `codex_0625`의 템플릿 반복을 제거했다. 각 레슨은 입문자 기준의 "왜 필요한가 -> 무엇인가 -> 어떻게 확인하는가 -> 실수/주의 -> 체험 설계 -> 정리" 흐름을 갖춘다.

이번 산출물 범위는 reference 재집필 자료이므로 실제 `content/abap/CH06` 파일은 수정하지 않았다. 다음 실제 이식 단계에서는 L01~L05 신규 체험을 embed로 구현할지, 우선 본문형 체험 설명으로 둘지 결정하면 된다.
