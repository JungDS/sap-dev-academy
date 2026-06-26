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
| CH01-L02-S03 | CH01-L02 | sap-easy-access-mock | SAP 첫 화면(Easy Access) HTML 재현 + 명령창 위치 콜아웃(이미지1·2 참고·테마 자동) | ✅ |
| CH01-L02-S04 | CH01-L02 | tcode-prefix-cards | 접두어 4종 카드(숫자 요약→클릭 펼침 의미·핵심) + 함정 한 컷(SE11 SE38✕/​/nSE38✓) | ✅ |
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
| CH12-L07-S01 | CH12-L07 | select-options-filter-sim | SELECT-OPTIONS Range Table(s_conc·s_stat·I/E·EQ/BT/CP→zbooking 필터) | ✅ |
| CH13-L08-S01 | CH13-L08 | join-aggregate-visualizer | LEFT OUTER JOIN+GROUP BY SUM(공연별 booked·LEFT/INNER 토글·취소 제외) | ✅ |
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
| select-options-filter-sim (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH12-L07-S01 | SO_CFG 주도 · Range Table(SIGN I/E·OPTION EQ/NE/GT/LT/GE/LE/BT/CP) 평가 |
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
