# embeds/abap — 학습수단 현황 인덱스

> 레슨 웹페이지가 `::embed CHnn-Lnn-Snn`으로 부르는 실제 학습수단 목록.
> 파일명만으론 종류를 모르므로(슬러그 없음) 여기서 **설명·엔진·연결레슨·상태**를 관리한다.
> 정본 엔진 = `embeds/_engine/` · 공통 토큰 = `embeds/_engine/_base.css` · Mermaid 백업 = `embeds/_vendor/`.
> 제작 계획 = [.project-docs/13_EMBED_BUILD_PLAN](../../.project-docs/13_EMBED_BUILD_PLAN.md) · 입력 감사 = `check/20260624_챕터별_점검결과/`.
> 상태: ⬜ 미작성 · 🔧 작성중 · ✅ 빌드+브라우저 검증 완료

## A. 인스턴스 목록 (레슨 순)
| 파일 (embeds/abap/) | 레슨 | 엔진 | 학습수단 설명 | 상태 |
|---|---|---|---|---|
| CH01-L01-S01 | CH01-L01 | image-figure | 실제 SAP 로그온 화면 스크린샷(assets/img/abap/CH01-L01-logon.png) | 🖼️ |
| CH01-L01-S02 | CH01-L01 | image-figure | 실제 SAP Easy Access 첫 화면 스크린샷(assets/img/abap/CH01-L01-easy-access.png) | 🖼️ |
| CH01-L04-S01 | CH01-L04 | write-output | WRITE 출력 시뮬(편집→F8→리스트, /·콜론체인·리터럴) | ✅ |
| CH01-L05-S01 | CH01-L05 | write-format | WRITE 서식 플레이그라운드(폭·정렬·COLOR·ULINE·SKIP) | ✅ |
| CH01-L02-S01 | CH01-L02 | se38-first-program | 가상 SE38 개발루프 — **3-step 진행형**(①명령창 SE38→②생성 ZHELLO→③저장·활성화·실행, 단계별 노출) | ✅ |
| CH01-L02-S02 | (보류) | command-field-sim | 풀 시뮬(Easy Access vs SE11 → 이동/오류/새창/로그오프). S03 mock+S04 카드로 대체 검토 — 파일 보존, 본문 미참조 | 🔁 |
| CH01-L02-S03 | CH01-L02 | sap-easy-access-mock | **2단 플레이그라운드** — 좌: Easy Access↔SE38/SE11/SE80 인터랙티브(접두어 없는 코드=Easy Access 전용·다른 화면 /n 필수·/nex 로그아웃+다시하기) / 우: 자주 쓰는 접두어 reference | ✅ |
| CH01-L02-S04 | (보류) | tcode-prefix-cards | 접두어 카드(클릭 펼침)+함정 한 컷. S03 2단에 통합 — 파일 보존, 본문 미참조 | 🔁 |
| CH01-L02-S05 | CH01-L02 | image-figure | 실제 SE38 ABAP Editor 첫 화면 스크린샷(§03) | ✅ |
| CH01-L02-S06 | CH01-L02 | image-figure | 실제 SE11 ABAP Dictionary 첫 화면 스크린샷(§04) | ✅ |
| CH01-L02-S07 | CH01-L02 | image-figure | 실제 SE80 Object Navigator 화면 스크린샷(§05) | ✅ |
| CH01-L07-S01 | CH01-L07 | se93-tcode-create | SE93 T-code 생성→명령창 실행(Hello, ABAP!)+흔한실수 | ✅ |
| CH02-L05-S01 | CH02-L05 | before-after | 매직넘버 pi(줄마다 '3.1415926'·'…27'·'3.14' 제각각·오타) vs 상수 gc_pi 하나 — bad/good + 변수 덮어쓰기 주의 note | ✅ |
| CH02-L06-S01 | CH02-L06 | fill-blank | Text Symbol 빈칸(TEXT·001) | ✅ |
| CH03-L01-S01 | CH03-L01 | domain-builder | SE11 Domain 생성(저장→검사→활성화·예제칩 6) | ✅ |
| CH04-L01-S01 | CH04-L01 | step-debugger | 산술 트레이스(7+3·2**10·DIV·MOD) | ✅ |
| CH04-L05-S01 | CH04-L05 | step-debugger | DO·sy-index 트레이스(1→5) | ✅ |
| CH04-L06-S01 | CH04-L06 | step-debugger | 구구단 중첩DO 디버거 홈(F5·gv_mul/res) | ✅ |
| CH05-L01-S01 | CH05-L01 | step-debugger | Local Structure 트레이스(ls_person-name/age/amount 한 묶음 채움) | ✅ |
| CH05-L05-S01 | CH05-L05 | step-debugger | 구구단=구조체 캡스톤(ls_line-dan/mul/result·sy-index 반복 갱신) | ✅ |
| CH06-L06-S01 | CH06-L06 | state-change-grid | 구구단 lt_gugu 성장 스냅샷(APPEND 1→9→81행 + SORT result DESC) | ✅ |
| CH07-L03-S01 | CH07-L03 | before-after | 메모리(휘발) vs 디스크(영속) 두 운명 — 중립 톤(tone-warm/cool) | ✅ |
| CH08-L01-S01 | CH08-L01 | client-scope-filter | Client(MANDT) 자동 종속 — 현재 client 바꿔 같은 SELECT 실행→결과 달라짐(MANDT 미기재) | ✅ |
| CH08-L02-S01 | CH08-L02 | select-query-simulator | classic SELECT 빌더(projection·WHERE·sy-subrc)·ZTPERSON 연습 샌드박스 | ✅ |
| CH08-L03-S01 | CH08-L03 | select-form-lab | SELECT 형태 비교(SINGLE/INTO TABLE/ENDSELECT/UP TO 3)·대상 모양·행수·반복 | ✅ |
| CH08-L04-S01 | CH08-L04 | into-target-board | INTO 대상 4탭(Work Area·변수묶음 순서·CORRESPONDING 이름매칭·APPENDING vs INTO) | ✅ |
| CH08-L05-S01 | CH08-L05 | where-filter-lab | WHERE 칩 조합(=,>,BETWEEN,LIKE,IN,IS NULL)·AND/OR·행별 통과/제외 사유 | ✅ |
| CH08-L06-S01 | CH08-L06 | key-condition-lens | 키 조건 좁히기 vs 일반필드 훑기 vs 보조인덱스 개념(속도 ms 단정 안 함) | ✅ |
| CH08-L07-S01 | CH08-L07 | empty-result-message | sy-subrc 분기(dan 2·3 있음/5 없음)·WRITE vs MESSAGE S(상태바)·I(팝업) | ✅ |
| CH09-L01-S01 | CH09-L01 | relation-gate | Foreign Key/Check Table 통과·거부(C001/C999/F4)·연결선 끊김 | ✅ |
| CH09-L02-S01 | CH09-L02 | value-vs-fk | Value Table(제안) vs Foreign Key(검증) 토글 4-state + ALPHA 변환 | ✅ |
| CH09-L03-S01 | CH09-L03 | text-table-viewer | Text Table 언어(KO/EN) 전환→F4 이름 변경·SPRAS 누락 경고 | ✅ |
| CH09-L04-S01 | CH09-L04 | search-help-builder | Elementary Search Help 역할 조립(검색/목록/EXP)·F4 미리보기·EXP 누락 | ✅ |
| CH09-L05-S01 | CH09-L05 | collective-search-help | 3탭(ID/아티스트/장소)→같은 CONCERT_ID 반환·매핑 끊기 | ✅ |
| CH09-L05-S02 | CH09-L05 | hierarchy-tree | (구성 §2 text→위젯) Collective→Elementary 트리·노드 클릭=F4 탭 역할 | ✅ |
| CH09-L06-S01 | CH09-L06 | f4-attach-scope | Search Help 부착 범위(Data Element 넓게↔MATCHCODE 좁게) 색 비교 | ✅ |
| CH09-L07-S01 | CH09-L07 | input-help-priority | F4 입력도움 우선순위 4단계 사다리(코드F4→Search Help→Check/고정값→타입기본) | ✅ |
| CH09-L07-S03 | CH09-L07 | (static-svg) | (구성 §2 text→다이어그램) F4 우선순위 사다리 SVG — F4 누름→①~④ 검사·있으면 채택/없으면 ▼ | ✅ |
| CH09-L07-S02 | CH09-L07 | f4-priority-lab | (S01 병행 추가) 후보 토글+F4→최상위 하나만 표시·억제 사유 | ✅ |
| CH09-L08-S01 | CH09-L08 | validation-router | 검증 책임 분류 퀴즈(존재·형식=DDIC / 잔여석·권한·종료=프로그램) | ✅ |
| CH09-L09-S01 | CH09-L09 | concert-model-checklist | DDIC 모델 제작 단계판+관계 미리보기+테스트(FK 활성화→C999 거부) | ✅ |
| CH10-L01-S01 | CH10-L01 | perform-call-map | PERFORM→FORM 점프·복귀·전역 누적 vs 지역, 정의 누락 오류 | ✅ |
| CH10-L02-S01 | CH10-L02 | param-passing-board | USING/CHANGING·VALUE 원본 보호/변경 + RETURN·STATICS 데모 | ✅ |
| CH10-L03-S01 | CH10-L03 | call-function-box | CALL FUNCTION 호출자 기준 방향·정상/음수 sy-subrc·EXCEPTIONS 제거 | ✅ |
| CH10-L04-S01 | CH10-L04 | local-class-stepper | Local Class DEFINITION/IMPLEMENTATION/=> 호출·PUBLIC/RETURNING 제거 | ✅ |
| CH10-L05-S01 | CH10-L05 | global-class-blackbox | 전역 클래스 정적 메서드 블랙박스 호출(계약만)·필수 param 누락 | ✅ |
| CH10-L06-S01 | CH10-L06 | module-choice-cards | 모듈화 도구 선택 퀴즈(Subroutine/FM/Class/옛코드) | ✅ |
| CH10-L07-S01 | CH10-L07 | step-debugger | 잔여석 모듈화 FORM(lv_sum 누적·정원−합계=cv_left) | ✅ |
| CH10-L07-S02 | CH10-L07 | can-book-toggle | (S01 병행 추가) can_book 판정(요청 3/5)·취소 포함 실수 재현 | ✅ |
| CH11-L01-S01 | CH11-L01 | write-vs-salv | WRITE 텍스트 vs SALV 표 — 정렬·합계 가능 여부 비교(예매 6행) | ✅ |
| CH11-L02-S01 | CH11-L02 | salv-grid-simulator | SALV factory→display 2단계(person·정렬·Σ급여·sy-tabix) | ✅ |
| CH11-L03-S01 | CH11-L03 | salv-function-switch | set_all(기능) ≠ display(표시) 시나리오·합계·function≠FM | ✅ |
| CH11-L04-S01 | CH11-L04 | salv-pipeline-stepper | SELECT→DESCRIBE→factory→set_all→display 3칸 파이프라인·건너뛰기 피드백 | ✅ |
| CH11-L05-S01 | CH11-L05 | module-choice-cards | (재사용) SALV 1차 범위 분류(지금 CH11 / CH17·21·27·28) | ✅ |
| CH11-L06-S01 | CH11-L06 | salv-grid-simulator | 예매목록 SALV(lt_book·set_all·Σ좌석수=17·STATUS N/C) | ✅ |
| CH12-L01-S01 | CH12-L01 | range-row-builder | 조건 카드(사람 말)→Range Table 4칸 행(SIGN/OPTION/LOW/HIGH)·I/E·EQ/BT/CP·행별 사람말 해석·OR/제외 규칙 | ✅ |
| CH12-L02-S01 | CH12-L02 | selopt-screen-mapper | 선택화면 From/To+다중선택→s_conc Range Table→LOOP AT 출력(From=EQ·From~To=BT·제외 E·8자) | ✅ |
| CH12-L03-S01 | CH12-L03 | select-options-filter-sim | (재사용) classic WHERE..IN 평가 + #soSys(sy-subrc/sy-dbcnt)·시나리오(전체=6·C999=0건subrc4·AND) | ✅ |
| CH12-L04-S01 | CH12-L04 | include-exclude-judge | 포함(I)/제외(E) 조건 쌓기→공연별 통과/탈락 판정·이유(포함 OR·제외 빼기·녹색/빨강=SIGN) | ✅ |
| CH12-L05-S01 | CH12-L05 | option-compare-lab | 단일 조건 SIGN·OPTION(EQ/BT/CP)·LOW/HIGH 토글→후보 통과 비교·CP wildcard(*,+)·E 반전 | ✅ |
| CH12-L06-S01 | CH12-L06 | range-append-stepper | 코드 한 줄씩(CLEAR→sign→option→low→APPEND→SELECT)·ls_stat↔lr_stat·APPEND 전 빈 table·결과 5행 | ✅ |
| CH12-L07-S01 | CH12-L07 | select-options-filter-sim | SELECT-OPTIONS Range Table(s_conc·s_stat·I/E·EQ/BT/CP→zbooking 필터) | ✅ |
| CH13-L01-S01 | CH13-L01 | join-match-board | INNER JOIN 짝 맞추기(사람3·부서2·ON dept_id·부서 숨김 실험→짝 없는 행 제외·sy-subrc/dbcnt) | ✅ |
| CH13-L02-S01 | CH13-L02 | outer-join-switch | INNER↔LEFT OUTER 토글(공연3·예매·C003 보존/제외)+WHERE 오른쪽필터 함정(LEFT라도 빠짐) | ✅ |
| CH13-L03-S01 | CH13-L03 | group-by-lab | 그룹 키(concert/status/복합)·모드(GROUP BY/DISTINCT) 토글→원본 색묶음→COUNT/SUM/MAX 접기 | ✅ |
| CH13-L04-S01 | CH13-L04 | where-having-pipeline | 원본→WHERE(행 제외)→GROUP BY→HAVING(그룹 제외) 4단계 스텝퍼·코드 하이라이트 | ✅ |
| CH13-L05-S01 | CH13-L05 | sort-priority-lab | ORDER BY 정렬 기준 토글(없음·age▼·age▼name▲·name▲)→재정렬·동률 2차기준·순서보장없음 경고 | ✅ |
| CH13-L06-S01 | CH13-L06 | fae-safety-sim | FOR ALL ENTRIES 기준목록×안전장치 토글→실행: 제한조회/빈목록보호/⚠️전체조회 위험·중복제거 | ✅ |
| CH13-L07-S01 | CH13-L07 | module-choice-cards | (재사용) 조회 전략 의사결정 카드 5문항→JOIN/FAE/ABAP/GROUP BY/LEFT OUTER 분류·이유 | ✅ |
| CH13-L08-S01 | CH13-L08 | join-aggregate-visualizer | LEFT OUTER JOIN+GROUP BY SUM(공연별 booked·LEFT/INNER 토글·취소 제외) | ✅ |
| CH14-L01-S01 | CH14-L01 | db-view-vs-join | 코드 JOIN vs Database View 비교(정상/마스터누락→inner-join 탈락/필드축소→구조계약) | ✅ |
| CH14-L02-S01 | CH14-L02 | field-curtain | Projection View 필드 선택(체크박스)→결과 컬럼 변화·기술필드 일괄숨김·key 경고·ABAP 구조 | ✅ |
| CH14-L03-S01 | CH14-L03 | f4-help-flow | Help View F4 흐름(F4→팝업→key 복귀)·설명누락 outer 보존·Export OFF 복귀안함 | ✅ |
| CH14-L04-S01 | CH14-L04 | fk-maintenance-gate | Foreign Key 토글→유지보수 input check(FK ON: 없는코드 거부 / OFF: orphan 통과) | ✅ |
| CH14-L05-S01 | CH14-L05 | sm30-gate-checklist | SM30 열리기까지 조건 게이트(활성화·유지보수허용·TMG·권한)→모두 충족 시 grid·파이프라인 | ✅ |
| CH14-L06-S01 | CH14-L06 | view-cluster-tree | View Cluster 계층 유지보수(공연장→좌석등급)·상위 선택이 하위 자동조건·하위 추가 | ✅ |
| CH14-L07-S01 | CH14-L07 | se16n-tracker | SM30 저장→SE16N 확인(원본 vs View·H03 inner-join 차이·H30 오타 0건 단정금지) | ✅ |
| CH14-L08-S01 | CH14-L08 | timeline-boundary | Classic↔CDS 경계 타임라인(지금=DDIC View/나중=CDS·RAP)·필터·나중 카드 챕터 안내 | ✅ |
| CH14-L09-S01 | CH14-L09 | concert-register-console | (캡스톤) F4→SM30 저장→원본 ZCONCERT/View ZV_CONCERT 비교·기준 삭제 inner-join 누락 | ✅ |
| CH15-L01-S01 | CH15-L01 | event-lifecycle-buildup | 이벤트 5단계 빌드업(mermaid 흐름도+코드·hover 연결·stage1 classic) | ✅ |
| CH16-L01-S01 | CH16-L01 | process-flow-pbo-pai | Module Pool 두 박자 순환(PBO→화면→입력→PAI→loop·다음박자 진행) | ✅ |
| CH16-L03-S01 | CH16-L03 | dynpro-screen-elements | 예매 화면 요소↔변수(Input·Check·Radio·Dropdown VRM·Button→OK_CODE) | ✅ |
| CH17-L07-S01 | CH17-L07 | gui-alv-grid-simulator | CL_GUI_ALV_GRID 4단계(container→grid→fcat→set_table)·정렬·Σ | ✅ |
| CH17-L10-S01 | CH17-L10 | gui-alv-grid-simulator | 예매목록 Grid ALV 종합 5단계(SELECT→…→set_table·MERGE·layout) | ✅ |
| CH18-L06-S01 | CH18-L06 | diff-mapper | classic↔modern(VALUE·+=) hover 대응+설명 · 중립 톤 classic/modern | ✅ |
| CH18-L07-S01 | CH18-L07 | diff-mapper | 콘서트앱 모던리팩터(인라인DATA·+=·VALUE·Table Expr) | ✅ |
| CH20-L01-S01 | CH20-L01 | class-diagram | 클래스(설계도)→NEW→객체(인스턴스) 흐름 | ✅ |
| CH20-L07-S01 | CH20-L07 | class-diagram | 상속 계층(부모 ZCL_BOOKING_MANAGER←자식 ZCL_VIP_BOOKING·REDEFINITION/super·ABSTRACT/FINAL) | ✅ |
| CH20-L10-S01 | CH20-L10 | class-diagram | UML 클래스 구조(PUBLIC 메서드·PRIVATE 속성·캡슐화·RAISING) | ✅ |
| CH22-L03-S01 | CH22-L03 | relationship-map | CDS Association 관계도(공연 ZI_Concert→회차 ZI_Perf→예매 ZI_Booking) | ✅ |
| CH04-L02-S01 | CH04-L02 | fill-blank | 문자열 함수 빈칸(INTO·AT·strlen·FIND) | ✅ |
| CH04-L07-S01 | CH04-L07 | fill-blank | 구구단 빈칸(TIMES·sy-index·*·ENDDO) | ✅ |
| CH04-L03-S01 | CH04-L03 | mermaid | IF/ELSEIF/ELSE 분기 흐름도(p_amt: 큰금액/소액/0·음수) | ✅ |
| CH04-L04-S01 | CH04-L04 | case-branch-sim | CASE…WHEN 시뮬(등급 A·B·C·그외→출력, OR묶기 토글) | ✅ |

## B. 엔진별 집계 (카테고리 현황 — 같은 종류 몇 개·어디서)
| 엔진 (embeds/_engine/) | 그룹 | 공통/standalone | 사용 인스턴스 | 비고 |
|---|---|---|---|---|
| step-debugger | 6 | 공통(_engine)·config 주도 ✅ | CH04-L01·L05·L06·CH05-L01·L05·CH10-L07 (완료) | `.stepper-config` 트레이스(이미 주도형·리팩터 불요·하이픈키 ls_x-y OK) |
| fill-blank | 3 | 공통(_engine)+_autoheight ✅ | CH02-L06·CH04-L02·L07 (전부 완료) | 데이터=마크업 |
| before-after | 2 | 공통(CSS-only)+_autoheight ✅ | CH02-L05-S01·CH07-L03-S01 (완료) | 콘텐츠 정리 · 중립 톤(tone-warm/cool)·.note·.cmt 추가 · constant-circle-sim(폐기) 대체 |
| diff-mapper | 2 | 공통(_engine)+_autoheight ✅ | CH18-L06·L07 (완료) | 데이터=마크업(data-link/title/desc) · classic/modern 중립 톤 추가 |
| select-query-simulator | 1 | 공통(_engine)·자체 postHeight ✅ | CH08-L02-S01 | config 주입(SQL_CFG) · #N1 주석 CH19 정정 · (CH12-L07은 SELECT-OPTIONS 전용 신규엔진로 분리) |
| select-options-filter-sim | 2 | 공통(_engine)·자체 postHeight ✅ | CH12-L03-S01·CH12-L07-S01 | SO_CFG 주도 · Range Table(SIGN I/E·OPTION EQ/NE/GT/LT/GE/LE/BT/CP) 평가 · **opt-in `#soSys`**(있으면 sy-subrc/sy-dbcnt 표시, L03만) |
| range-row-builder (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH12-L01-S01 | RRB_CFG.cards 주도 · 조건 카드→SIGN/OPTION/LOW/HIGH 행 빌더·행/종합 사람말 해석 · 다크 자동(토큰+gen-embed-dark) |
| selopt-screen-mapper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH12-L02-S01 | SSM_CFG 주도 · 선택화면 From/To+다중선택→Range Table→LOOP 출력 · 다크 자동(토큰+gen-embed-dark) |
| include-exclude-judge (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH12-L04-S01 | IEJ_CFG 주도 · 포함/제외 조건→후보별 통과/탈락 판정+이유(matchOpt EQ/BT/CP…) · 다크 자동 |
| option-compare-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH12-L05-S01 | OCL_CFG 주도 · 단일 조건 SIGN/OPTION/LOW/HIGH 편집→후보 매칭·CP wildcard·HIGH BT시만 표시 · 다크 자동 |
| range-append-stepper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH12-L06-S01 | RAS_CFG 주도 · 코드 한 줄씩 실행→ls_stat/lr_stat/SELECT 결과·ABAP 하이라이트·result는 lr로 data 필터 · 다크 자동 |
| join-match-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L01-S01 | JMB_CFG 주도 · 사람·부서 카드 ON 매칭→INNER 결과·부서 숨김 실험·sy-subrc/dbcnt · 다크 자동 |
| outer-join-switch (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L02-S01 | OJS_CFG 주도 · INNER↔LEFT 토글+WHERE 오른쪽필터 함정·SQL 미리보기·보존 점검 · 다크 자동 |
| group-by-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L03-S01 | GBL_CFG 주도 · 그룹키/모드 토글→원본 색묶음·COUNT/SUM/MAX·DISTINCT 비교 · 다크 자동(seg base=surface) |
| where-having-pipeline (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L04-S01 | WHP_CFG 주도 · 4단계 스텝퍼(원본→WHERE→GROUP BY→HAVING)·행 vs 그룹 필터·코드 하이라이트 · 다크 자동 |
| sort-priority-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L05-S01 | SPL_CFG 주도 · ORDER BY 다중 기준 안정정렬·동률 2차기준·정렬없음 경고·헤더 화살표/우선순위 · 다크(chip base=surface) |
| fae-safety-sim (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH13-L06-S01 | FAE_CFG 주도 · 기준목록×안전장치 조합 실행·빈목록 함정 시뮬·코드 미리보기(IF guard 토글)·중복제거 · 다크(버튼 base=surface) |
| db-view-vs-join (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L01-S01 | DVJ_CFG 주도 · 코드JOIN/DB View 2카드·상태토글(정상/마스터누락 inner drop/필드축소) · 다크(seg base=surface) |
| field-curtain (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L02-S01 | FC_CFG 주도 · Projection View 필드 체크박스→결과 컬럼·기술필드 일괄숨김·key 경고·ABAP 구조 미리보기 · 다크 |
| f4-help-flow (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L03-S01 | F4_CFG 주도 · F4→Help View 팝업→key 복귀·설명누락(outer 보존)·Export OFF 토글 · 다크(toggle base=surface) |
| fk-maintenance-gate (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L04-S01 | FKM_CFG 주도 · FK 토글→유지보수 input check·orphan 시연·SM30 grid mock · 다크(toggle base=surface) |
| sm30-gate-checklist (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L05-S01 | SGC_CFG 주도 · 게이트(테이블/유지보수/TMG/권한) 체크→SM30 실행·파이프라인·결과 grid · 다크 |
| view-cluster-tree (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L06-S01 | VCT_CFG 주도 · 상위(공연장) 선택→하위(좌석등급) 자동 좁힘·하위 추가(부모 맥락)·트리 카운트 · 다크 |
| se16n-tracker (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L07-S01 | SE16_CFG 주도 · SM30 저장→SE16N(table/조건 토글)·원본 vs View inner-join 차이·0건 단정금지 · 다크 |
| timeline-boundary (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L08-S01 | TB_CFG 주도 · 지금/나중 경계 타임라인 카드·필터·나중 클릭→챕터 안내(R15 경계 시각화) · 다크 |
| concert-register-console (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH14-L09-S01 | CRC_CFG 주도 · CH14 캡스톤 F4+SM30 저장+원본/View 비교+기준삭제 inner-join · 다크(btn base=surface) |
| salv-grid-simulator | 2 | 공통(_engine)·자체 postHeight ✅ | CH11-L02-S01·CH11-L06-S01 (완료) | config 주입(SALV_CFG: itab·cols·data·sumKey·code) · ALV제목/토글 엔진설정 |
| relationship-map | 1 | 공통 | _(미작성)_ | CSS-only |
| state-change-grid | 1 | 공통(CSS-only)+_autoheight ✅ | CH06-L06-S01 | 스냅샷=마크업(lt_gugu 성장·정렬) · 빈 .js 제거 |
| mermaid | 1 | 공통(+_vendor)+_autoheight ✅ | CH04-L03-S01 | 그래프=위젯 `.mermaid` 주입·CDN+로컬fallback·이벤트본 은퇴 |
| domain-builder | 1 | 공통(_engine) ✅ | CH03-L01-S01 | SE11 폼(단일사용·데이터 inline) · 예제별 target 강제(검사/활성화는 목표 일치 시에만) |
| input-help-priority | 1 | 공통(CSS-only)+_autoheight ✅ | CH09-L07-S01 | F4 사다리(콘텐츠=마크업·빈 .js 제거) |
| write-output | 1 | 공통 ✅ | CH01-L04-S01 | WRITE 출력 파서 · config 주입 · **버그수정(따옴표無→오류)** |
| write-format | 1 | 공통 ✅ | CH01-L05-S01 | WRITE 서식 토글 · config 주입 |
| event-lifecycle-buildup | 1 | 공통(_engine·자체 mermaid+CDN/_vendor)·자체 postHeight ✅ | CH15-L01-S01 | bespoke 단일사용(STAGES inline) · #C15-1 stage1 inline DATA→classic 수정 |
| se38-first-program | 3 | 공통(_engine) ✅ | CH01-L02-S01 | 개발루프 상태머신(bespoke·단일사용·데이터 inline) |
| se93-tcode-create | 3 | 공통(_engine) ✅ | CH01-L07-S01 | SE93 생성+명령창 실행(bespoke·단일사용) |
| case-branch-sim | 2 | 공통(_engine)+_autoheight ✅ | CH04-L04-S01 | CASE…WHEN 시뮬·config 주도·OR묶기 토글(bespoke 신규) |
| join-aggregate-visualizer | 1 | 공통(_engine)·자체 postHeight ✅ | CH13-L08-S01 | JOIN_CFG 주도 · LEFT/INNER 토글·GROUP BY SUM·ON 필터(취소 제외) |
| gui-alv-grid-simulator (신규) | 2 | 공통(_engine·ALVG_CFG)·자체 postHeight ✅ | CH17-L07·L10 (완료) | 단계 빌드업+그리드 · config로 steps/data/cols 주입 |
| process-flow-pbo-pai (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH16-L01-S01 | PBO/PAI 두 박자 순환(클릭 진행) |
| dynpro-screen-elements (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH16-L03-S01 | 화면 요소↔변수 + FctCode→OK_CODE 시연 |
| class-diagram (신규) | 3 | 공통(CSS-only)+_autoheight ✅ | CH20-L01·L07·L10 (완료) | UML 박스·인스턴스·상속 — class-object/inheritance/class-structure 통합 1엔진 |
| relationship-map | 1 | 공통(CSS-only)+_autoheight ✅ | CH22-L03-S01 (완료) | A→B 관계 카드(CDS Association) · 빈 .js 제거 · static-svg-architecture 은퇴 |

## C. 재배치 보류 (원본 sample/ 보존 · 정적 홈은 후속 신규)
| 원본 콘텐츠 | 적정 홈(후속) |
|---|---|
| before-after = N+1 쿼리 | CH13-L06 / 성능 |
| diff-mapper = SELECT 성능 | CH12·CH13 |
| decision-tree = 내부테이블 타입 | CH06-L02 |
| relationship-map = HR/SD FK | CH09 / CH13 |
| static-svg = 풀스택 | CH31 / CH36 |
| sap-gui-sandbox = SE16N 조회 | CH07 / SELECT |
| mermaid = 이벤트 | (CH15에 더 우수본 있음 → 은퇴) |
| state-change-grid = person/salary APPEND→SORT→DELETE | CH06-L04(집단행 조작) — 단 L04 현재 embed 없음 → 신규 추가라 현 스코프 밖, 후속 |
