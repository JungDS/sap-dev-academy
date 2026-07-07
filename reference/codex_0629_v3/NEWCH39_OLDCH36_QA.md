# NEWCH39_OLDCH36_QA · RAP + Fiori 실무 Capstone 검수

> 대상 파일: `NEWCH39_OLDCH36_REWRITE.md`
> 원본: `content/abap/CH36`
> 기준: `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md`

## 최종 판정

PASS.

CH36은 v3 감사에서 여러 보류 항목의 최종 회수 위치로 지정되어 있었다. 이번 `NEWCH39_OLDCH36_REWRITE.md`는 원본 CH36의 RAP + Fiori Capstone 흐름을 유지하면서, 기존 원본에 부족했던 EML 외부 consumer 실습, RAP BDEF lock/ETag/total ETag, Draft Resume 충돌 경계, authorization master, communication arrangement 운영 체크리스트를 추가했다.

## 산출물

| 항목 | 값 |
|---|---|
| 신규 번호 | `NEWCH39_OLDCH36` |
| 원본 번호 | `OLDCH36` |
| Rewrite | `reference/codex_0629_v3/NEWCH39_OLDCH36_REWRITE.md` |
| QA | `reference/codex_0629_v3/NEWCH39_OLDCH36_QA.md` |

## 원본 CH36 반영 확인

| 원본 레슨 | v3 반영 |
|---|---|
| CH36-L01 Capstone 업무 시나리오 | NEWCH39-L01 |
| CH36-L02 `ZI_*` Interface View | NEWCH39-L02 |
| CH36-L03 `ZC_*` Projection View | NEWCH39-L03 |
| CH36-L04 BDEF/BIMP | NEWCH39-L04 |
| CH36-L05 Action/Validation/Determination | NEWCH39-L05 |
| CH36-L06 Service Binding/Fiori Elements | NEWCH39-L07 |
| CH36-L07 Authorization/Draft/운영 | NEWCH39-L08, NEWCH39-L09 |
| 신규 보강 | NEWCH39-L06 외부 EML consumer, NEWCH39-L08 Draft/Lock/ETag/Auth 심화, NEWCH39-L09 Communication Arrangement/Clean Core |

## 감사 회수 항목 확인

| 감사 항목 | 회수 위치 | 판정 |
|---|---|---|
| CH22 advanced composition/to-parent association | L02에서 root, composition, to-parent association 지도 제공 | PASS |
| CH22 Clean Core 운영 상세 | L09에서 released API, release contract, ATC로 운영 체크리스트 반영 | PASS |
| CH23 Draft/Auth | L04, L08에서 `with draft`, draft table, authorization master, DCL/BDEF 권한 분리 | PASS |
| CH23/CH24 RAP EML transaction | L06에서 외부 consumer의 `MODIFY ENTITIES -> COMMIT ENTITIES/ROLLBACK ENTITIES` 실습 회수 | PASS |
| CH25 RAP ETag/BDEF lock | L04, L08에서 `lock master`, `lock dependent`, `etag master`, `etag dependent`, `total etag` 반영 | PASS |
| P2 RAP Draft/Auth 고급 중 ETag/BDEF lock | L08에서 Draft lock 만료 후 optimistic phase와 total ETag 설명 | PASS |
| P3 communication arrangement | L09에서 communication scenario/system/user/arrangement 운영 체크리스트 반영 | PASS |

## 공식 문서 수동 확인

Classic/RAP 로컬 문서와 ABAP Cloud 다운로드 문서를 수동 확인했다.

| 범위 | 확인 문서 |
|---|---|
| RAP lock | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENBDL_LOCKING.md`, `C:\ABAP_DOCU_HTML\abenbdl_locking.htm` |
| RAP ETag | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENBDL_ETAG.md`, `C:\ABAP_DOCU_HTML\abenbdl_etag.htm` |
| Draft | `ABENBDL_WITH_DRAFT.md`, `ABENBDL_DRAFT_TABLE.md` |
| Authorization | `ABENBDL_AUTHORIZATION.md` |
| EML | `ABAPMODIFY_ENTITIES_LONG.md`, `ABAPCOMMIT_ENTITIES.md`, `ABAPROLLBACK_ENTITIES.md`, `ABAPIN_LOCAL_MODE.md`, `ABENRAP_SAVE_SEQ_GLOSRY.md` |
| Release contract | `ABENABAP_RELEASE_CONTRACTS.md`, `ABENC0_CONTRACT_GLOSRY.md`, `ABENC1_CONTRACT_GLOSRY.md`, `ABENRELEASED_APIS.md`, `ABENRESTRICTED_APIS_ATC_CHECKS.md` |
| Communication arrangement | SAP Help Communication Management, Communication Arrangements, Create Communication Arrangement |

## R15 게이팅 확인

| 항목 | 판정 |
|---|---|
| CH18 이전 New Syntax를 앞당겨 쓰지 않음 | CH36은 후반 capstone이므로 CH18 이후 문법 사용 가능 |
| CH23 이전 RAP 개념을 앞당겨 쓰지 않음 | CH36은 CH23 학습 후 capstone이므로 RAP 심화 사용 가능 |
| CH25 이전 동시성 개념을 앞당겨 쓰지 않음 | CH36은 CH25 lock 학습 후 ETag와 RAP lock으로 확장 |
| CH35 이전 운영 품질을 앞당겨 쓰지 않음 | CH36은 CH35 이후 운영 마감 장으로 ATC/Unit/Transport를 참조 |
| Classic-first 경계 | Classic lock/권한/운영 감각을 RAP 운영 개념으로 연결 |

## 레슨별 품질 확인

| 레슨 | 확인 | 판정 |
|---|---|---|
| L01 | 요구사항, 계층 책임, 정상/실패/운영 완료 기준 | PASS |
| L02 | `ZI_Booking`, root, association, composition/to-parent, ETag 후보 필드 | PASS |
| L03 | `ZC_Booking`, `provider contract transactional_query`, `@UI`, Metadata Extension | PASS |
| L04 | BDEF에 draft, lock, total ETag, ETag, authorization, action/validation/determination 반영 | PASS |
| L05 | Handler 구현 흐름, `IN LOCAL MODE` 경계, `failed/reported/result` | PASS |
| L06 | 외부 EML consumer의 buffer/commit/rollback 확인 | PASS |
| L07 | Service Definition/Binding, OData V4 UI, Fiori Preview 검증 | PASS |
| L08 | Draft/Lock/ETag/Auth 차이, lock 만료 후 optimistic phase, total ETag | PASS |
| L09 | communication arrangement, release contract, released API, ATC 운영 체크리스트 | PASS |

## 체험형 학습 설계 확인

| 레슨 | 학습 수단 |
|---|---|
| L01 | Capstone Responsibility Board |
| L02 | RAP Data Model Inspector |
| L03 | Fiori Annotation Preview Lab |
| L04 | BDEF Contract Builder |
| L05 | Behavior Logic Simulator |
| L06 | RAP Transaction Console |
| L07 | Service to Fiori Flow |
| L08 | Concurrency and Authorization Lab |
| L09 | Service Operations Checklist |

모든 학습 수단은 버튼, 상태, 데이터, 피드백을 구체적으로 제시한다.

## 남은 실제 시스템 검증

문서 검수 기준으로는 PASS지만, 실제 SAP/ADT 환경이 없으므로 다음은 시스템에서 추가 검증해야 한다.

| 항목 | 이유 |
|---|---|
| CDS/BDEF 실제 활성화 | 시스템 릴리스와 필드 타입, annotation 지원 범위에 따라 차이가 날 수 있음 |
| Draft table 구조 | draft admin include, key, timestamp 필드가 실제 table과 일치해야 함 |
| Handler method signature | ADT quick fix와 릴리스별 BDEF syntax가 실제 생성 signature를 확정 |
| Fiori Preview | action 버튼, draft action, validation message 노출은 서비스 metadata와 UI annotation에 의존 |
| Communication arrangement | tenant/product별 app 이름과 인증 방식이 다를 수 있음 |
| ATC variant | 고객 시스템의 ATC check variant와 Cloud readiness 기준이 다를 수 있음 |

## 최종 결론

`NEWCH39_OLDCH36_REWRITE.md`는 CH36을 마지막 Capstone답게 재구성했다. 원본의 ZI/ZC/BDEF/BIMP/Service/Fiori/Auth/Draft 흐름을 유지하면서, 감사에서 요구된 EML 실행 실습, BDEF lock/ETag/total ETag, communication arrangement, release contract 운영 기준을 보강했다. 감사표의 CH36 관련 항목도 회수 완료로 갱신했다.
