# NEWCH34_OLDCH31_QA - IDoc / ALE / Gateway

## 최종 판정

PASS. `content/abap/CH31`의 다섯 레슨을 v3 파일명 규칙에 맞춰 `NEWCH34_OLDCH31_REWRITE.md`로 재집필했다. IDoc/ALE와 Gateway/OData를 용어 나열이 아니라 "메시지 구조 확인, 설정 확인, status 추적, 재처리, 서비스 모델/등록/테스트, `GET_ENTITYSET` 구현"의 운영 흐름으로 확장했다.

이번 장은 감사표에서 CH23이 "Gateway 운영"으로 남긴 예정 회수 항목을 닫는다. CH23의 RAP 개요에서 Classic Gateway 운영 세부를 앞당기지 않았고, 이번 CH31 v3에서 `SEGW`, `MPC_EXT`, `DPC_EXT`, `/IWFND/MAINT_SERVICE`, `$metadata`, `/IWFND/GW_CLIENT`, `/IWFND/ERROR_LOG`, `/IWBEP/ERROR_LOG`, `GET_ENTITYSET` 구현과 query option mapping을 회수했다.

## 입력 자료

| 구분 | 확인 내용 |
|---|---|
| 원본 챕터 | `content/abap/CH31/_chapter.md`, `CH31-L01.md` ~ `CH31-L05.md` |
| v2 보조 자료 | `reference/codex_0625_v2/CH31_REWRITE.md`, `CH31_QA.md` |
| v3 감사 기준 | `reference/codex_0629_v3/00_CONCEPT_GAP_AUDIT.md` |
| 프로젝트 키워드 감사 | `.project-docs/11_KEYWORD_AUDIT.md` CH31 메모 |
| Track 2 체험물 메모 | `.project-docs/TRACK2_ENRICHMENT.md` CH31 위젯/엔진 메모 |
| 기존 임베드 | `embeds/abap/CH31-L01-S01.html` ~ `CH31-L05-S01.html` |

## 레슨별 반영 점검

| v3 레슨 | 원본 | 보강 결과 | 판정 |
|---|---|---|---|
| NEWCH34-L01 | CH31-L01 IDoc 기본 구조 | `EDIDC`, `EDIDD`, `EDIDS`, Message Type, Basic Type, Segment, Extension, direction, `WE02`, `WE05`, `WE60` 확인 흐름 반영 | PASS |
| NEWCH34-L02 | CH31-L02 ALE Distribution Model | `BD64`, `WE20`, `WE21`, `BD54`, `SM59`, Logical System, Partner Profile, Port, model distribute, filter 조건 운영 문서화 반영 | PASS |
| NEWCH34-L03 | CH31-L03 IDoc 오류 추적과 재처리 | status `01`, `03`, `12`, `02`, `26`, `64`, `51`, `53`, `BD87`, 원인 수정 후 재처리, `WE19` 운영 경계, 대량 재처리 주의 반영 | PASS |
| NEWCH34-L04 | CH31-L04 Gateway SEGW 프로젝트 구조 | `SEGW`, `EntityType`, `EntitySet`, `Association`, `MPC_EXT`, `DPC_EXT`, `/IWFND/MAINT_SERVICE`, `$metadata`, Gateway Client, error log, RAP/service binding 경계 반영 | PASS |
| NEWCH34-L05 | CH31-L05 OData V2 EntitySet 조회 구현 | `GET_ENTITYSET`, `io_tech_request_context`, `$filter`, `$top`, `$skip`, `$orderby`, `ORDER BY`, `UP TO`, `OFFSET`, `et_entityset`, Gateway Client/debug/error log/성능 확인 반영 | PASS |

## 감사 회수 점검

| 감사 항목 | 이전 상태 | v3 처리 |
|---|---|---|
| CH23 Gateway 운영 | CH31 후속 원본 존재, 예정 회수 | `NEWCH34_OLDCH31` L04/L05에서 Classic Gateway 운영 구조와 OData 조회 구현 확인 흐름으로 회수 완료 |
| CH30 인터페이스 운영 원칙 | 다음 장 IDoc/Gateway로 연결 필요 | IDoc/ALE status/retry와 Gateway error log/query option 운영 구조로 연결 |
| CH31 공식성 | `.project-docs/11_KEYWORD_AUDIT.md`에서 keyword doc 밖 도구 영역, L05 modern SQL 정확 | v3에서도 도구 영역과 ABAP 문법 영역을 분리하고 L05 SQL 절 순서/`OFFSET` 경계를 유지 |

## Classic ABAP 공식 문서 수동 확인 내역

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| Method 구현 | `C:\ABAP_DOCU_HTML\abapmethod.htm`, `abapmethods.htm` | `METHOD ... ENDMETHOD`, method declaration/implementation |
| Method redefinition | `C:\ABAP_DOCU_HTML\abapmethods_redefinition.htm` | `DPC_EXT`의 generated method redefinition 설명 |
| SELECT target | `C:\ABAP_DOCU_HTML\abapselect_into_target.htm` | `INTO CORRESPONDING FIELDS OF TABLE @et_entityset` |
| ORDER BY | `C:\ABAP_DOCU_HTML\abaporderby_clause.htm` | 정렬 없는 result set은 순서가 정의되지 않으며 paging에 안정 정렬 필요 |
| UP TO/OFFSET | `C:\ABAP_DOCU_HTML\abapselect_up_to_offset.htm` | `UP TO`, `OFFSET`, `OFFSET`은 `ORDER BY` 필요 |
| MESSAGE/예외 | `C:\ABAP_DOCU_HTML\abapmessage.htm`, `abaptry.htm`, `abapcatch_try.htm` | status message, Gateway error log, HTTP 500 분석 경계 |

## ABAP Cloud / Gateway / RAP 경계 확인

| 범위 | 확인 파일 | 본문 반영 |
|---|---|---|
| OData | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENODATA_GLOSRY.md` | OData는 RESTful API를 정의하고 소비하기 위한 표준 프로토콜 |
| SAP Gateway | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\standard\md\ABENSAP_GATEWAY_GLOSRY.md` | SAP Gateway는 AS ABAP을 OData 같은 open protocol로 접근하게 하는 framework |
| Service Binding | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENSERVICE_BINDING_GLOSRY.md` | RAP 신규 개발 경계 설명 |
| Business Service | `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENBUSINESS_SERVICE_GLOSRY.md` | RAP business service와 OData protocol 경계 |
| ABAP Cloud / Released API | `ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`, `ABENCLASSIC_ABAP_GLOSRY.md` | Classic Gateway 유지보수와 Cloud 신규 개발 우선순위 분리 |

## SAP Help Portal 보충 근거

로컬 ABAP Keyword Documentation은 IDoc/ALE customizing과 Gateway 운영 화면을 직접 다루는 문서가 아니므로 SAP Help Portal 공식 자료를 보충 확인했다.

| 범위 | URL | 본문 반영 |
|---|---|---|
| IDoc technical structure | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/8f3819b0c24149b5959ab31070b64058/4b38633ead7f74fee10000000a421937.html` | IDoc control/data/status record 구조 |
| IDoc display | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/8f3819b0c24149b5959ab31070b64058/4b4c78b74a712597e10000000a42189b.html` | `WE02` tree에서 control/data/status record 확인 |
| ALE Distribution Model | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/8f3819b0c24149b5959ab31070b64058/4abb4af3479926c4e10000000a42189b.html` | logical system, message type, BAPI/filter 관계가 distribution model에 정의됨 |
| Gateway Service Builder redefine | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/68bf513362174d54b58cddec28794093/c972141b977a4182930c192bfaf2c0b1.html` | Service Builder에서 generated source code를 redefine해 확장 |
| Activate OData Services | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/1b0aa06133bd47ce8843635a99ee8ef5/aeff6f6c319447f1b293c7cbcacd9f18.html` | `/IWFND/MAINT_SERVICE` 등록/활성화 확인 |
| OData `$filter` option | `https://help.sap.com/docs/ABAP_PLATFORM_NEW/68bf513362174d54b58cddec28794093/4186dfb43183416cae68c828ffe42f1f.html` | `$filter`는 EntitySet subset을 식별하는 query option |
| EntitySet request context APIs | `https://help.sap.com/doc/saphelp_nw75/7.5.5/en-US/0e/9b2451f8c0266ee10000000a445394/content.htm` | `$filter`, sorting, `$top/$skip` query option 처리 경계 |

NotebookLM은 사용하지 않았다. 로컬 공식 문서와 SAP Help Portal 자료로 필요한 근거가 충족되었다.

## R15 및 classic-first 점검

| 항목 | 점검 |
|---|---|
| IDoc/ALE | CH30 이후이므로 운영형 인터페이스, 로그, 재처리, RFC destination 감각을 사용할 수 있음 |
| Gateway 구조 | CH20 이후이므로 `MPC_EXT`, `DPC_EXT`, method redefinition 설명 가능 |
| OData 조회 코드 | CH18/CH19 이후이므로 inline `DATA`, host variable `@`, `SELECT ... ORDER BY ... UP TO ... OFFSET` 사용 가능 |
| RAP 경계 | CH23 이후이므로 RAP/service binding과 Classic Gateway의 차이를 설명하되 구현 세부 반복 없음 |
| 재처리 | CH24 이후이므로 원인 수정 후 `BD87`, status monitoring, 대량 재처리 주의 설명 가능 |
| Classic-first | 기존 IDoc/ALE/SEGW 자산 이해를 primary context로 두고 ABAP Cloud는 신규 개발 경계로 제한 |

## 체험형 학습 설계 점검

| 레슨 | 체험 설계 |
|---|---|
| NEWCH34-L01 | Control/Data/Status record를 클릭 탐색하고 Basic Type/Segment/status 원인 연결 |
| NEWCH34-L02 | ALE 설정 토글로 `BD64`, `WE20`, `WE21`, `BD54`, `SM59` 누락 상태 진단 |
| NEWCH34-L03 | `전송`, `수신 처리`, `오류 주입`, `원인 수정`, `BD87 재처리`로 status lifecycle 체험 |
| NEWCH34-L04 | `SEGW` project tree에서 Data Model, Runtime Artifacts, service registration, `$metadata`, 오류 상태 확인 |
| NEWCH34-L05 | `$filter`, `$top`, `$skip`, `ORDER BY` 토글을 URL, Gateway context, ABAP SELECT, response table과 연결 |

## 기계 점검 기준

작성 후 다음 항목으로 검증한다.

| 점검 | 기대값 |
|---|---|
| 레슨 헤더 | `NEWCH34-L01` ~ `NEWCH34-L05` 모두 존재 |
| IDoc | `EDIDC`, `EDIDD`, `EDIDS`, `WE02`, `WE05`, `WE60`, `Basic Type`, `Segment` 존재 |
| ALE | `BD64`, `WE20`, `WE21`, `BD54`, `SM59`, `Partner Profile`, `Port`, `Logical System` 존재 |
| 재처리 | `BD87`, status `51`, `53`, `64`, `03`, 원인 수정 후 재처리 설명 존재 |
| Gateway | `SEGW`, `EntityType`, `EntitySet`, `MPC_EXT`, `DPC_EXT`, `/IWFND/MAINT_SERVICE`, `$metadata`, `/IWFND/GW_CLIENT` 존재 |
| OData | `GET_ENTITYSET`, `$filter`, `$top`, `$skip`, `$orderby`, `io_tech_request_context`, `et_entityset`, `ORDER BY`, `UP TO`, `OFFSET` 존재 |
| 경계 | RAP/service binding 구현을 CH31 본문으로 반복하지 않음 |
| 문서 품질 | Markdown fence 균형, trailing whitespace 없음, `git diff --check` 통과 |

## 남은 리스크

이 산출물은 reference 재작성 문서이며 실제 `content/abap/CH31` 파일과 embed 구현은 수정하지 않았다. IDoc/ALE/Gateway 화면과 status 의미는 SAP release, add-on, hub/embedded Gateway 구성, partner profile 정책에 따라 차이가 있을 수 있다. 실제 교육 페이지로 이식할 때는 대상 실습 시스템의 T-code 화면, status sample, SEGW service name, URL, authorization 정책을 다시 확인해야 한다.

Classic Gateway와 IDoc/ALE는 기존 시스템 유지보수에서 중요하지만 신규 ABAP Cloud 설계의 기본 답은 아니다. 신규 개발은 released API, RAP business service, service binding, integration architecture를 별도로 검토해야 한다.
