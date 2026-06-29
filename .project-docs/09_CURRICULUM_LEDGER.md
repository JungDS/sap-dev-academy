# 09. CURRICULUM LEDGER — 커리큘럼 개념 원장 (개요 SSOT)

> 📅 최종수정: 2026-06-29 05:07 KST
> 🎯 **2트랙 36챕터의 챕터 맵 + 교차 설계 합의(경계·관통예제·도구 아크)의 단일 출처.**
> 🧭 **per-lesson `introduces`/`prereq`/`prevRel`/`foreshadow`/`advanceUse` = 각 레슨 `.md` front-matter가 라이브 SSOT**([04 R10](04_CONVENTIONS.md)) — 이 문서는 레슨별 데이터를 중복하지 않고 *그 위의 개요·경계·관통설계*만 담는다(§F). 게이팅([04 R15](04_CONVENTIONS.md)) 점검 = front-matter ↔ 본문 ↔ R15.
> ✅ 현행: 본문은 **CH01～36 전 레슨 작성 완료**(CH04 흐름제어 삽입·전 챕터 리넘버 반영 끝). 전면 리빌드는 *선택* — 실행 절차는 [10_REBUILD_EXECUTION](10_REBUILD_EXECUTION.md).

## 범례
- `prevRel`: **ps**=pain-solution · **par**=parallel · **deep**=deepening · **next**=next-step.
- 게이팅: **L0** 노출금지 · **L1** 예고(foreshadow) · **L2** 선행사용(advanceUse) · **L3** 정식.
- ⭐ 골든자산 · 🔶 경계주의 · 🟢 관통 학습장치.

---

## A. 트랙·챕터 맵 (현행 36챕터)

> 핵심 = 그 챕터가 **L3 정식 도입**하는 대표 개념(요지). 레슨별 상세는 front-matter.

### Track-1 — ABAP 기초～입문 실무 (CH01～23)
| CH | 챕터 | L | 핵심(introduces 요지) |
|---|---|---|---|
| 01 | 개발 환경과 첫 프로그램 | 7 | SAPGUI·SE38·REPORT·WRITE·개발 패키지/이송·SE93 |
| 02 | 변수·표준 타입·상수·Text Symbol | 6 | DATA·TYPE/LIKE·기본 타입(STRING/I/F/D/T·C/N/P)·offset·CONSTANTS·Text Symbol |
| 03 | DDIC Domain·Data Element + PARAMETERS | 3 | Domain·Data Element·PARAMETERS(라벨·F4) — DDIC 나선 1지점 |
| 04 | 연산자와 흐름 제어 | 7 | 산술·날짜 산술·문자열·IF·CASE·DO/WHILE·`sy-index`·디버깅 (🟢구구단) |
| 05 | Structure (Local·DDIC) | 5 | Structure·Work Area·MOVE-CORRESPONDING·DDIC Structure — DDIC 나선 2지점 |
| 06 | Internal Table | 6 | Internal Table·테이블 종류·READ/LOOP·컨트롤레벨·Field Symbol 기초 |
| 07 | Transparent Table (SE11) | 3 | Transparent Table·Key/MANDT·Create Entries — DDIC 나선 3지점 |
| 08 | Open SQL 기본 조회 | 7 | SELECT(classic)·INTO·WHERE·`sy-subrc` — **읽기 전용** |
| 09 | DDIC 관계와 입력도움말(F4) | 9 | Foreign Key·Check/Value Table·Search Help·Text Table |
| 10 | 모듈화 기초 | 7 | FORM/PERFORM·CALL FUNCTION·Local Class(static-first·본격 OO 비포함) |
| 11 | SALV 1차 | 6 | `CL_SALV_TABLE`·factory·display |
| 12 | SELECT-OPTIONS와 Range Table | 7 | SELECT-OPTIONS·Range Table·`WHERE … IN` |
| 13 | Open SQL 2차: JOIN·집계 | 8 | INNER/LEFT JOIN·GROUP BY·집계·FOR ALL ENTRIES (classic) |
| 14 | Classic DDIC View·유지보수 | 9 | Database/Projection/Maintenance View·TMG/SM30·SE16N |
| 15 | Report Event·Selection Screen 심화 | 12 | Report Event·INITIALIZATION·AT SELECTION-SCREEN·MESSAGE 정식·화면 UI |
| 16 | Screen Programming / Dynpro 기초 | 8 | Module Pool·Screen Painter·PBO/PAI·OK_CODE·BACK/EXIT |
| 17 | Grid ALV 기초 | 10 | `CL_GUI_ALV_GRID`·Field Catalog·Layout·행 색 |
| **18** | **Modern ABAP Syntax** | 7 | 🔶**문법 경계** — inline `DATA()`·`VALUE`·`CORRESPONDING`·Table Expr·`\|…\|`·`+=` |
| **19** | **New Open SQL / Modern ABAP SQL** | 8 | 🔶**SQL 경계** — `@`·`@DATA`·콤마·SQL식·Right/Full JOIN |
| 20 | OO ABAP 기본 설계 | 10 | Class·Visibility·Constructor·Interface·Inheritance·OO Event·예외 TRY/CATCH·CAST |
| 21 | SALV/Grid ALV 표시 제어 심화 | 8 | Cell Color/Style·Stable Refresh·SALV-OOP 이벤트 *체험* |
| 22 | CDS View Entity 기초 | 7 | View Entity·Association·Annotation·Metadata Extension·DCL |
| 23 | RAP / ABAP Cloud 입문 | 9 | RAP·`ZI_*`/`ZC_*`·BDEF/BIMP·Service Definition |

### Track-2 — 실무 심화 (CH24～36)
| CH | 챕터 | L | 핵심(introduces 요지) |
|---|---|---|---|
| 24 | 실무 데이터 변경과 트랜잭션 제어 | 5 | DML(INSERT/UPDATE/MODIFY/DELETE)·COMMIT/ROLLBACK·LUW·감사필드 stamp |
| 25 | Lock Object와 동시성 제어 | 5 | Lock Object·ENQUEUE/DEQUEUE |
| 26 | OO ABAP 고급 설계와 패턴 | 5 | 디자인 패턴·고급 OO 설계 |
| 27 | ALV 고급 Event 응용 | 5 | ALV 이벤트 본격(더블클릭·toolbar·user_command) |
| 28 | Editable Grid ALV와 입력 검증 | 6 | 편집형 Grid ALV·입력 검증 |
| 29 | Enhancement / BAdI / User Exit | 5 | Enhancement Framework·BAdI·User Exit |
| 30 | 인터페이스 실무: BAPI/RFC/BDC/File | 5 | BAPI·RFC·BDC·OPEN DATASET |
| 31 | IDoc / ALE / Gateway | 5 | IDoc·ALE·OData/Gateway |
| 32 | 성능 분석과 튜닝 | 5 | SQL Trace·런타임 분석·SELECT 최적화 |
| 33 | AMDP / ADBC / Pushdown | 5 | AMDP·ADBC·코드 푸시다운 |
| 34 | Forms / Output / PDF | 5 | SmartForms·Adobe Form·출력 |
| 35 | 운영 품질과 배포 관리 (이송 심화) | 5 | ATC·BAL 로그·SUBMIT VIA JOB·이송 |
| 36 | RAP + Fiori 실무 Capstone | 7 | RAP+Fiori 통합 캡스톤 |

> Track-1 = 입문 게이팅(R15)이 핵심. Track-2 = 챕터 내 순서만 게이팅(서로 독립 내용 많음 — 상세 정책은 아카이브 `TRACK2_ENRICHMENT.md` §규칙).

## B. classic↔modern 경계 (R6 요약 — 규칙 단일 홈 = [04 R6](04_CONVENTIONS.md))
- 순수 classic 구간 = **CH01～17**.
- **New Syntax**(인라인 `DATA()`·`VALUE`·`NEW`·`+=`·`\|…\|`): CH17까지 L0 → **CH18 L3**.
- **New Open SQL**(`@`·콤마): CH18까지 L0 → **CH19 L3** (CH08～17 Open SQL은 전부 classic).
- 🔶 예외 — `&&`(문자열 잇기)는 **CH04 조기 도입**(매우 간단·고빈도). 대가로 classic `ADD`/`SUBTRACT`/`MULTIPLY`/`DIVIDE`도 CH04에서 소개(`+=`/`-=`는 CH18로 미룸).
- DDIC 코어 나선 = **CH03**(Domain·Data Element)·**CH05**(Structure)·**CH07**(Transparent Table).

## C. 🟢 관통 학습장치

### C-1. 구구단 thread (CH04→08) — Local→영속→읽기의 점진
| 챕터 | 직전 불편 | 새 개념 | 캡스톤 |
|---|---|---|---|
| CH04 | 값을 받아도 계산·반복 불가 | 연산·IF·DO/WHILE·PARAMETERS | 구구단 전체/특정 단/범위(단일 변수) |
| CH05 | 단수·배수·결과 변수 3개 따로 | Structure 3필드 | 구구단 한 줄=Structure → 한 행 한계 |
| CH06 | Structure 한 행뿐 | Internal Table | 구구단 전체 APPEND→LOOP→SORT |
| CH07 | 메모리 휘발 | Transparent Table | `ZGUGUDAN`에 Create Entries로 2·3단 18행 손입력 |
| CH08 | 손입력 번거로움 / 되찾기 | SELECT (읽기) | 18행을 SELECT로 되찾아 출력 + 결과없음 시 MESSAGE |

→ "메모리 itab을 **통째로 INSERT**·감사필드 자동 stamp" = **CH24(DML)로 foreshadow**(L1). CH09부터 업무 데이터.

### C-2. 디버거 (자주 쓰는 관통 체험)
- 도입 = **CH04**(흐름 제어 직후). 첫 동기 = CH03 PARAMETERS 값 눈 확인 + 반복문 `sy-index` 변화.
- 범위: BREAK-POINT·`/h`·F5(Step)/F6/F7/F8·WATCH POINT·변수 확인/수정.
- 재사용 콜백: CH05(Structure 모습)·CH06(Internal Table 행들)·이후 SELECT 결과·LOOP 등에서 "디버거로 들여다보기" 반복.

### C-3. SY 시스템 변수 (점진 도입)
- 첫 framing = **CH04**(DO/WHILE) — `sy-index` + 유용한 SY 필드 목록·용도(`sy-datum`/`uzeit`/`uname`/`mandt`/`langu`/`tcode`/`repid`/`subrc`).
- 이후 등장할 때마다 값 변화를 그 자리에서: `sy-tabix`(CH06 LOOP)·`sy-subrc`(CH06 READ / CH08 SELECT — 핵심)·`sy-datum` 기본값(CH15 INITIALIZATION)·감사 stamp(CH24). 한곳 몰아넣기 금지.

### C-4. 업무 관통예제 — SFLIGHT(읽기) · 콘서트 예매(빌드) (CH08→23)
구구단이 CH08에서 끝난 뒤를 잇는 2겹 thread. 동선: **SFLIGHT로 읽기를 익혀 → 같은 구조의 콘서트 앱을 직접 빌드.**
- **SFLIGHT 항공**(표준 데이터·*읽기*): CH08 SELECT(SCARR/SFLIGHT) → CH09 FK·검색도움말(SCARR↔SPFLI↔SFLIGHT) → CH11 SALV → CH12 SELECT-OPTIONS → CH13 JOIN·집계(탑승률) → CH19 modern → CH22 CDS(`ZI_Flight`).
- **콘서트 예매**(자체앱·*빌드*·전체 생명주기): 모델 `ZCONCERT`(공연)·`ZPERF`(회차)·`ZBOOKING`(예매, 예매자=이름 풀 **정훈영**). CH09 DDIC(FK·F4) → CH10 모듈화(잔여석·예매판정) → CH11 SALV → CH14 View/SM30 → CH15 선택화면·검증 → CH16 Dynpro → CH17 Grid ALV → CH18/19 modern → CH20 OO(`ZCL_BOOKING_MANAGER`·`ZCX_FULLY_BOOKED`) → CH21 색·이벤트 → CH22 CDS → CH23 RAP(action·validation).
- 매 전이는 pain→solution. 스키마·필드 상세 = `check/RUNNING-EXAMPLES.md`.

## D. 데이터 입력 도구 아크 · DML 경계
- 입력 도구 = **SE11 Create Entries(한 건씩, CH07)** → **TMG/SM30(다건, CH14)** → **SE16N(브라우저, CH14)**. 쉬운 도구를 먼저 보이면 유지보수 객체 가치가 소멸 → SE16N은 유지보수 뒤.
- **DML·감사필드·표준테이블 규율 = CH24(Track-2)로 이관.** Track-1 CH08은 **읽기 전용**(INSERT/UPDATE/DELETE 미포함). 표준 테이블(SCARR 등)은 읽기 전용·직접 DML 금지(BAPI 경유) 원칙도 CH24. Lock(ENQUEUE) = CH25.

## E. Track-2 다운스트림 관계 (CH24～36) — Track-1과의 잇기
| CH | 챕터 | Track-1과의 관계 |
|---|---|---|
| 24 | 실무 데이터 변경·트랜잭션(DML) | CH08 읽기 → 여기 쓰기 (감사 stamp·통째 INSERT·표준테이블 규율) |
| 25 | Lock·동시성 | CH24와 짝 |
| 26 | OO 고급 패턴 | CH20 기본 → 심화 |
| 27 | ALV 고급 Event | CH21 OOP 체험 → 본격 이벤트 |
| 28 | Editable Grid ALV | CH17 표시 → 입력 |
| 29～36 | Enhancement·인터페이스·IDoc·성능·AMDP·Forms·운영·Capstone | 실무 응용 |

## F. per-lesson 데이터 = 레슨 front-matter (SSOT)
- 레슨별 `introduces`/`prereq`/`prevRel`/`foreshadow`/`advanceUse`는 **각 레슨 `.md` front-matter가 정본**([04 R10](04_CONVENTIONS.md)). 이 문서에 표로 복제하지 않는다(SSOT — 한 사실은 한 곳).
- 게이팅 검증 = "그 레슨까지의 `introduces` 합집합 + 자기 `introduces`"만으로 본문이 성립하는지(R15). 변경 시 하류 레슨 재점검.
- 외부 설계 근거(읽기 전용 참고):
  - 타깃 전체본 = `check/PLANNED-CURRICULUM.md`
  - 관통예제 스키마·인물(`ZGUGUDAN`·`ZCONCERT`/`ZPERF`/`ZBOOKING`·SFLIGHT·정훈영) = `check/RUNNING-EXAMPLES.md`
  - 레슨별 요구 토픽 = `check/coverage-checklist*.md`
  - 공식 keyword doc 대비 감사 결과 = `.archive/2026-06-29-docs-cleanup/11_KEYWORD_AUDIT.md`(완료)
