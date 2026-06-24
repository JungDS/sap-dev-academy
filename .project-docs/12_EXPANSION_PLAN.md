# 12. EXPANSION PLAN — 51항목 체크리스트 기반 콘텐츠 확장 배치 계획

> 📅 최종수정: 2026-06-24 03:02 KST
> 🎯 **목적:** 사용자 제공 51항목 체크리스트(+ Input Help 우선순위 이미지)에서 **미수록/부분수록 38건**을 `content/abap/**`에 배치·보강. 진행 추적의 단일 출처.
> 📖 **읽을 때:** 확장 작업 재개 시. (키워드 감사 원장 = [11](11_KEYWORD_AUDIT.md), 별개 작업.)

## 기준 (사용자 합의 2026-06-24)
- 사용자 결정 = **"전면 확장 — 새 레슨 추가"** + 키워드 감사 루프 **일시정지**.
- **대상 = 여전히 입문자**([01]/[04 R3]). 따라서 중급·실무 항목은 **해당 챕터의 뒤 레슨/심화 섹션**에 배치하고, 앞 입문 레슨은 게이팅(R15) 유지. 압축 금지·체험 동반(R2).
- **obsolete/DBA급은 비중 절제**(아래 판단). 무조건 풀레슨화하지 않음 — 입문 적합성 우선([04 공통원칙]).
- 코드 1줄↑ → 체험/시뮬(R2). 코드블록은 ```abap (R5). glossary 새 용어는 reference/glossary.json 등록(R12).

## 작업 방식
- **클러스터 단위**로 진행(감사 루프처럼). 각 묶음 = MD 보강/신규 → 빌드(parity 0)·렌더 검증 → 커밋 → 본 계획서 진행표 갱신.
- 신규 레슨 = `content/abap/CHxx/CHxx-Lyy.md` + front-matter(id·title·direction·keywords·order·introduces·prereq). order는 기존 뒤에 append(리넘버 최소).

## ⚖️ 입문 적합성 판단 (사용자 이의 가능)
- **#10 Type Group(TYPE-POOLS)** = **obsolete**(클래스 CONSTANTS로 대체). → 풀레슨 ✗, "옛 코드 인지용 1단락"만(CH10 또는 CH02-L05).
- **#15 Table Fragmentation** = DBA 레벨. → #14 Technical Settings 보강에 **짧은 1단락**만(개념). 풀레슨 ✗.
- **#20 Cardinality** = FK 세부. → CH09-L01에 **짧은 표/문단**. 풀레슨 ✗.
- 나머지는 보강 또는 신규 레슨으로 정식 편성.

## 진행 현황
| 클러스터 | 대상 챕터 | 상태 |
|---|---|---|
| 즉시수정 #51 FM 오타 | CH15-L08 | ✅ 완료 |
| 누락문법 `VALUE #( FOR )` | CH18-L02 | ✅ 완료 (감사 후속·사용자 결정) |
| A — DDIC 타입·구조 | CH03·05·06 | ✅ 완료 (10건) |
| B — Transparent Table 실무 | CH07·09·(04 덤프) | ⬜ 대기 |
| C — JOIN 보강 | CH13·14 | ⬜ 대기 |
| D — View·유지보수 | CH14 | ⬜ 대기 |
| E — Search Help·Input Help(★우선순위 이미지) | CH09·15·16 | ⬜ 대기 |
| F — Selection Screen 심화(최대) | CH15(신규 L11+) | ⬜ 대기 |

## 항목별 배치 (38건)

### A. DDIC 타입·구조 (CH03/05/06)
| # | 배치 | 액션 |
|---|---|---|
|1|CH05-L02 또는 CH03 요약|보강: "DDIC에서 변수 타입으로 쓰는 것=DE/Structure/Transp/View/Table Type, Domain ✗" 표|
|2|CH03-L02|보강: Data Element의 SET/GET Parameter(파라미터 ID) 섹션|
|3|CH05-L02|보강: 컴포넌트 타입을 View/Transp/Table Type로도 줄 수 있음(주석)|
|4·5|✅ **CH05-L02에 "구조 재사용" 섹션으로 통합**(신규 L05 대신)|.INCLUDE(펼쳐 담기)·.APPEND(표준에 안전하게 더하기, CH29 연계). *설계 변경: L04가 캡스톤(→CH06)이라 그 뒤 신규 레슨은 서사 역전 → DDIC Structure 레슨에 묶음.*|
|7|CH05-L02|보강: 중첩 DDIC 구조 → 중첩 변수|
|8|CH06-L02|보강: Line Type을 DE/View/Transp로도|
|10|CH10 또는 CH02-L05|보강(절제): Type Group=obsolete 1단락|
|11|CH03-L02|보강: 같은 Domain·다른 DE(출발/도착 공항) 예시|
|13|CH12-L02 또는 CH16-L02|보강: `TABLES`=Dictionary Structure 명명|
|25|CH05-L02|보강: 전체-문자 구조=문자변수 트릭(`ls_date = sy-datum` 예시·체험)|

### B. Transparent Table 실무 (CH07/CH09/CH04)
| # | 배치 | 액션 |
|---|---|---|
|14|**신규 CH07-L04** 또는 CH07-L01 보강|Technical Settings: Size Category·Data Class 설명|
|15|위와 같은 곳|보강(절제): Table Fragmentation 짧게|
|20|CH09-L01|보강(절제): Check Table Cardinality 짧게|
|21|**신규 CH09-Lx** "Text Table"|텍스트 테이블 역할·생성|
|22|CH07-L01|보강: 활성 후 타입/길이 변경 위험 ⚠️|
|23|CH07 또는 CH14|보강: Where-Used List(어디서 쓰이나) 툴 소개|
|24|CH04-L06 보강|덤프란?+ST22로 지난 덤프 확인|

### C. JOIN 보강 (CH13/CH14)
| # | 배치 | 액션 |
|---|---|---|
|26|CH13-L01|보강: 직관적 JOIN 설명(시각/비유)|
|27|CH13-L01|보강: "조인 조건엔 한 테이블의 전체 키가 등장" 표현·예시|
|28|CH14-L01/L04|보강: DB View=Inner only, Maintenance View=Left Outer only|
|29|CH13-L02|보강: 한 SELECT에 Inner+Left Outer 혼용|

### D. View·유지보수 (CH14)
| # | 배치 | 액션 |
|---|---|---|
|31|CH14-L05|보강: One Step/Two Step 상세|
|32|CH14-L05|보강: Maintenance Dialog 장단점|
|33|**신규 CH14-Lx** 또는 L05 보강|View Cluster 소개·장단점·사용시점|

### E. Search Help · Input Help (CH09/15/16)
| # | 배치 | 액션 |
|---|---|---|
|35|CH09-L05|보강: 부착지점(DE/Table/필드/Structure 컴포넌트/프로그램·화면)|
|36 ★|**신규 CH09-Lx** "Input Help 호출 우선순위"|첨부 이미지의 우선순위 흐름(PROCESS ON VALUE-REQUEST→Search Help→Check/Text/Fixed→Calendar) + 시각화|
|38|CH16-L03 또는 CH15|보강: Listbox(VRM) 등 Input Help 대체수단|

### F. Selection Screen 심화 (CH15 — 최대, 신규 레슨)
| # | 배치 | 액션 |
|---|---|---|
|39·48|신규|다중 선택화면 + AT SELECTION-SCREEN에서 호출(팝업 포함)|
|40|신규|기본 1000번 화면·다른 번호 선언|
|41|신규|Selection Screen Variant(선택조건 저장)|
|42|신규|`CALL SELECTION-SCREEN nnnn`|
|43|신규/CH15-L09 보강|PARAMETERS 전옵션(TYPE/LIKE·DECIMALS·MEMORY ID·OBLIGATORY·DEFAULT·LOWER CASE·VALUE CHECK·AS CHECKBOX·RADIOBUTTON GROUP·MODIF ID)|
|44|신규/CH15-L09 보강|SELECT-OPTIONS 전옵션(SIGN·OPTION값·DEFAULT~TO~·MEMORY ID·LOWER CASE·OBLIGATORY·NO-EXTENSION·NO INTERVALS·MODIF ID)|
|47|CH15-L09 보강|SELECTION-SCREEN COMMENT/POSITION·POS_LOW·POS_HIGH|
|49|CH15-L09 보강|선택화면 Tabstrip/Subscreen|
|51 ★|CH15-L08 보강|ON VALUE-REQUEST 비중↑·F4IF_INT_TABLE_VALUE_REQUEST 실무패턴(SELECT→화면반영→연관필드 추가조회)|
→ **제안: CH15에 신규 L11~L13 신설**(L11 PARAMETERS/SELECT-OPTIONS 전옵션, L12 화면번호·Variant·CALL·다중화면, L13 레이아웃 COMMENT/POSITION·Tabstrip/Subscreen) + L08 보강. 번호는 append(리넘버 없음).

## 이미 충족 / 무수정
- **#16** Pooled/Cluster Table — 본문에 없음(제거 불필요). ✅
- **수록 항목**(6·9·12·17·18·19·30·34·37·45·46·50 등)은 유지.
