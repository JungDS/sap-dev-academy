# 12. EXPANSION PLAN — 51항목 체크리스트 기반 콘텐츠 확장 배치 계획

> 📅 최종수정: 2026-06-24 04:24 KST
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
| B — Transparent Table 실무 | CH07·09·(04 덤프) | ✅ 완료 (7건) |
| C — JOIN 보강 | CH13·14 | ✅ 완료 (4건) |
| D — View·유지보수 | CH14 | ✅ 완료 (3건) |
| E — Search Help·Input Help(★우선순위 이미지) | CH09·15·16 | ✅ 완료 (3건·신규 레슨 CH09-L06+SVG) |
| F — Selection Screen 심화(최대) | CH15(신규 L10·L11) | ✅ 완료 (9건·신규 레슨 2 + L08/L09 보강) |

## 항목별 배치 (38건)

### A. DDIC 타입·구조 (CH03/05/06)
| # | 배치 | 액션 |
|---|---|---|
|1|CH05-L02 또는 CH03 요약|보강: "DDIC에서 변수 타입으로 쓰는 것=DE/Structure/Transp/View/Table Type, Domain ✗" 표|
|2|CH03-L02|보강: Data Element의 SET/GET Parameter(파라미터 ID) 섹션|
|3|CH05-L02|보강: 컴포넌트 타입을 View/Transp/Table Type로도 줄 수 있음(주석)|
|4·5|✅ **신규 레슨 CH05-L03 "구조 재사용 — 중첩·.INCLUDE·.APPEND"**(승격 완료)|중첩·INCLUDE(펼쳐 담기)·APPEND(표준에 안전하게 더하기, CH29). *2026-06-24 승격: 다루기 L03→L04·캡스톤 L04→L05. L02는 슬림화.*|
|7|CH05-L02|보강: 중첩 DDIC 구조 → 중첩 변수|
|8|CH06-L02|보강: Line Type을 DE/View/Transp로도|
|10|CH10 또는 CH02-L05|보강(절제): Type Group=obsolete 1단락|
|11|CH03-L02|보강: 같은 Domain·다른 DE(출발/도착 공항) 예시|
|13|CH12-L02 또는 CH16-L02|보강: `TABLES`=Dictionary Structure 명명|
|25|CH05-L02|보강: 전체-문자 구조=문자변수 트릭(`ls_date = sy-datum` 예시·체험)|

### B. Transparent Table 실무 (CH07/CH09/CH04)
| # | 배치 | 액션 |
|---|---|---|
|14|✅ CH07-L01 보강(신규 L04 대신)|Technical Settings: Data Class·Size Category 섹션|
|15|✅ CH07-L01|Fragmentation=DBA 영역 1줄(절제)|
|20|✅ CH09-L01|Check Table Cardinality(1:n) 참고 문단(절제)|
|21|✅ **신규 레슨 CH09-L03 "Text Table — 코드 옆 이름표"**(승격 완료)|코드↔언어별 이름표·SPRAS·Foreign Key. *2026-06-24 승격: L03~L08을 L04~L09로 시프트, 교차참조 3건(CH09-L01·CH14-L09·CH15-L04) 교정. L02 슬림화.*|
|22|✅ CH07-L01|활성 후 타입/길이 변경 위험 ⚠️(흔한 실수)|
|23|✅ CH07-L01|Where-Used List 🔎 툴 소개|
|24|✅ CH04-L06|Short Dump란?+ST22로 지난 덤프 확인(glossary 등록)|

### C. JOIN 보강 (CH13/CH14)
| # | 배치 | 액션 |
|---|---|---|
|26|✅ CH13-L01|"직관적으로 — 두 표를 공통 번호로 나란히" 그림(text 표)|
|27|✅ CH13-L01|"조인 조건엔 전체 키가 등장"(concert_id+perf_no AND 예시·뻥튀기 경고)|
|28|✅ CH14-L01·L04|DB View=INNER only 📌 / Maintenance View=LEFT OUTER 📌|
|29|✅ CH13-L02|"한 SELECT에 INNER와 LEFT OUTER 섞기"(예매 thread 예시)|

### D. View·유지보수 (CH14)
| # | 배치 | 액션 |
|---|---|---|
|31|✅ CH14-L05|One Step(1단계)/Two Step(2단계) 상세|
|32|✅ CH14-L05|Maintenance Dialog 장단점 표|
|33|✅ **신규 레슨 CH14-L06 "View Cluster"**(승격 완료)|SE54·계층 유지보수·장단점 + glossary. *2026-06-24 승격: SE16N L06→L07·Classic/CDS L07→L08·실습 L08→L09. L05 슬림화.*|

### E. Search Help · Input Help (CH09/15/16)
| # | 배치 | 액션 |
|---|---|---|
|35|✅ CH09-L05|"부착 지점" 표(DE/필드/Structure 컴포넌트/MATCHCODE)|
|36 ★|✅ **신규 레슨 CH09-L06 "Input Help 호출 우선순위"**(리넘버 L06→L07·L07→L08, 교차참조 3건 교정)|우선순위 사다리(①POV=L1예고 CH15/16 → ②Search Help → ③Check/Text/Fixed → ④타입 기본) + **SVG 시각화** `sample/visuals/input-help-priority.html` ::embed|
|38|✅ CH16-L03|Dropdown(Listbox)=VRM `VRM_SET_VALUES`, Search Help 대체수단 섹션|

### F. Selection Screen 심화 (CH15 — 최대, 신규 레슨)
| # | 배치 | 액션 |
|---|---|---|
|39·48|✅ **신규 CH15-L11**|`CALL SELECTION-SCREEN`(STARTING AT 팝업) + `AT SELECTION-SCREEN` 버튼서 호출|
|40|✅ **신규 CH15-L11**|기본 화면 1000·`BEGIN OF SCREEN nnnn AS WINDOW`|
|41|✅ **신규 CH15-L11**|Selection Screen Variant(저장·배치 잡 연계 CH35)|
|42|✅ **신규 CH15-L11**|`CALL SELECTION-SCREEN nnnn`·sy-subrc 분기|
|43|✅ **신규 CH15-L10**|PARAMETERS 옵션 표(TYPE/LIKE·DECIMALS·OBLIGATORY·DEFAULT·LOWER CASE·CHECKBOX/RADIO·MEMORY ID·VALUE CHECK·MODIF ID)|
|44|✅ **신규 CH15-L10**|SELECT-OPTIONS 옵션 표(DEFAULT~TO~·OBLIGATORY·LOWER CASE·NO-EXTENSION·NO INTERVALS·MEMORY ID·MODIF ID)|
|47|✅ CH15-L09|`BEGIN OF LINE`·`POSITION`·`POS_LOW`/`POS_HIGH` 위치 지정|
|49|✅ CH15-L09|TABBED BLOCK 각 탭=Subscreen 설명|
|51 ★|✅ CH15-L08|ON VALUE-REQUEST 실무패턴 — `F4IF_INT_TABLE_VALUE_REQUEST`(목록 조회→화면필드 반영→연관 추가조회). **classic SELECT로 게이팅 교정**|
→ **실제 구현**: 신규 **L10**(PARAMETERS/SELECT-OPTIONS 옵션 총정리·MODIF ID) + **L11**(화면번호·CALL·Variant·다중화면). 레이아웃(#47/#49)은 L09가 이미 광범위해 **L09 보강**으로 통합. 실습 **L10→L12 리넘버**(서사 보존). L13 불필요.

## 이미 충족 / 무수정
- **#16** Pooled/Cluster Table — 본문에 없음(제거 불필요). ✅
- **수록 항목**(6·9·12·17·18·19·30·34·37·45·46·50 등)은 유지.

---

## 🏁 확장 완료 총평 (2026-06-24)
**51항목 체크리스트의 미수록/부분수록 38건 = 전부 반영(클러스터 A~F).** 빌드 parity 0, 전체 **237 레슨**(231→237, 신규 6 + 리넘버 5회).

- **신규 레슨(6)**: **CH09-L06** Input Help 호출 우선순위(+SVG) · **CH15-L10** PARAMETERS/SELECT-OPTIONS 옵션 총정리 · **CH15-L11** 여러 선택화면·CALL·Variant · **CH05-L03** 구조 재사용(.INCLUDE/.APPEND) · **CH09-L03** Text Table · **CH14-L06** View Cluster.
- **glossary 신규(3)**: Text Table · Short Dump · View Cluster.
- **보강 클러스터**: A(10) · B(7) · C(4) · D(3) · E(3) · F(9). + 감사 후속 `VALUE #( FOR )`(CH18-L02).

### ✅ "신규 레슨 승격" 정책 적용 완료 (2026-06-24)
사용자 결정에 따라, 처음 기존 레슨에 통합했던 3건을 **독립 레슨으로 승격**:
- **#4·5 .INCLUDE/.APPEND** → **CH05-L03** 신규(다루기 L03→L04·캡스톤 L04→L05).
- **#21 Text Table** → **CH09-L03** 신규(L03~L08 → L04~L09 시프트, 외부참조 3건 교정).
- **#33 View Cluster** → **CH14-L06** 신규(L06~L08 → L07~L09 시프트).
- 모두 원 출처 레슨(CH05-L02·CH09-L02·CH14-L05)은 해당 섹션 제거로 **슬림화**(과적 완화 겸).

### 🔎 과적(過積) 레슨 전수 스캔 결과 (2026-06-24)
전 237 레슨을 분량+섹션 구성으로 스캔 — **명백한 과적은 위 승격 3건뿐**이었고, 나머지 대형 레슨(CH03-L01 Domain·CH01-L05 WRITE 서식·CH04-L01 산술·CH04-L02 문자열·CH06-L04 집단행·CH07-L01 투명테이블 등)은 **단일 개념을 충실히** 다룬 것(`압축 금지` R3 의도)이라 분리 시 흐름이 깨짐. 경계선 2건(CH15-L04 검증+MESSAGE, CH15-L09 UI 카탈로그)은 응집적이고 CH15 리넘버 비용이 커 **사용자 결정 = 그대로 유지**. → **추가 분리 없음.**

### 메타갭(공통)
- 보강분 다수가 표·콜아웃 위주로 새 `::embed` 미부착(R4 칸채우기 금지·기존 레슨 톤). 신규 레슨 중 #36만 시각화 부착. 향후 인터랙션 위젯 후보는 각 check 참조.
- `#36` SVG는 **브라우저 눈검수 1회 권장**(check/EXPANSION-E).
