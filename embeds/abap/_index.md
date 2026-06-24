# embeds/abap — 학습수단 현황 인덱스

> 레슨 웹페이지가 `::embed CHnn-Lnn-Snn`으로 부르는 실제 학습수단 목록.
> 파일명만으론 종류를 모르므로(슬러그 없음) 여기서 **설명·엔진·연결레슨·상태**를 관리한다.
> 정본 엔진 = `embeds/_engine/` · 공통 토큰 = `embeds/_engine/_base.css` · Mermaid 백업 = `embeds/_vendor/`.
> 제작 계획 = [.project-docs/13_EMBED_BUILD_PLAN](../../.project-docs/13_EMBED_BUILD_PLAN.md) · 입력 감사 = `check/20260624_챕터별_점검결과/`.
> 상태: ⬜ 미작성 · 🔧 작성중 · ✅ 빌드+브라우저 검증 완료

## A. 인스턴스 목록 (레슨 순)
| 파일 (embeds/abap/) | 레슨 | 엔진 | 학습수단 설명 | 상태 |
|---|---|---|---|---|
| CH01-L04-S01 | CH01-L04 | write-output | WRITE 출력 시뮬(편집→F8→리스트, /·콜론체인·리터럴) | ✅ |
| CH01-L05-S01 | CH01-L05 | write-format | WRITE 서식 플레이그라운드(폭·정렬·COLOR·ULINE·SKIP) | ✅ |
| CH01-L02-S01 | CH01-L02 | se38-first-program | 가상 SE38 개발루프(생성→저장→$TMP·비활성→활성화→실행)+흔한실수 | ✅ |
| CH01-L07-S01 | CH01-L07 | se93-tcode-create | SE93 T-code 생성→명령창 실행(Hello, ABAP!)+흔한실수 | ✅ |
| CH02-L05-S01 | CH02-L05 | before-after | 매직넘버 vs 상수(고칠곳 2곳/1곳) | ✅ |
| CH02-L06-S01 | CH02-L06 | fill-blank | Text Symbol 빈칸(TEXT·001) | ✅ |
| CH03-L01-S01 | CH03-L01 | domain-builder | SE11 Domain 생성(저장→검사→활성화·예제칩 6) | ✅ |
| CH04-L01-S01 | CH04-L01 | step-debugger | 산술 트레이스(7+3·2**10·DIV·MOD) | ✅ |
| CH04-L05-S01 | CH04-L05 | step-debugger | DO·sy-index 트레이스(1→5) | ✅ |
| CH04-L06-S01 | CH04-L06 | step-debugger | 구구단 중첩DO 디버거 홈(F5·gv_mul/res) | ✅ |
| CH05-L01-S01 | CH05-L01 | step-debugger | Local Structure 트레이스(ls_person-name/age/amount 한 묶음 채움) | ✅ |
| CH05-L05-S01 | CH05-L05 | step-debugger | 구구단=구조체 캡스톤(ls_line-dan/mul/result·sy-index 반복 갱신) | ✅ |
| CH06-L06-S01 | CH06-L06 | state-change-grid | 구구단 lt_gugu 성장 스냅샷(APPEND 1→9→81행 + SORT result DESC) | ✅ |
| CH07-L03-S01 | CH07-L03 | before-after | 메모리(휘발) vs 디스크(영속) 두 운명 — 중립 톤(tone-warm/cool) | ✅ |
| CH08-L02-S01 | CH08-L02 | select-query-simulator | classic SELECT 빌더(projection·WHERE·sy-subrc)·ZTPERSON 연습 샌드박스 | ✅ |
| CH09-L07-S01 | CH09-L07 | input-help-priority | F4 입력도움 우선순위 4단계 사다리(코드F4→Search Help→Check/고정값→타입기본) | ✅ |
| CH10-L07-S01 | CH10-L07 | step-debugger | 잔여석 모듈화 FORM(lv_sum 누적·정원−합계=cv_left) | ✅ |
| CH11-L02-S01 | CH11-L02 | salv-grid-simulator | SALV factory→display 2단계(person·정렬·Σ급여·sy-tabix) | ✅ |
| CH11-L06-S01 | CH11-L06 | salv-grid-simulator | 예매목록 SALV(lt_book·set_all·Σ좌석수=17·STATUS N/C) | ✅ |
| CH12-L07-S01 | CH12-L07 | select-options-filter-sim | SELECT-OPTIONS Range Table(s_conc·s_stat·I/E·EQ/BT/CP→zbooking 필터) | ✅ |
| CH13-L08-S01 | CH13-L08 | join-aggregate-visualizer | LEFT OUTER JOIN+GROUP BY SUM(공연별 booked·LEFT/INNER 토글·취소 제외) | ✅ |
| CH04-L02-S01 | CH04-L02 | fill-blank | 문자열 함수 빈칸(INTO·AT·strlen·FIND) | ✅ |
| CH04-L07-S01 | CH04-L07 | fill-blank | 구구단 빈칸(TIMES·sy-index·*·ENDDO) | ✅ |
| CH04-L03-S01 | CH04-L03 | mermaid | IF/ELSEIF/ELSE 분기 흐름도(p_amt: 큰금액/소액/0·음수) | ✅ |
| CH04-L04-S01 | CH04-L04 | case-branch-sim | CASE…WHEN 시뮬(등급 A·B·C·그외→출력, OR묶기 토글) | ✅ |

## B. 엔진별 집계 (카테고리 현황 — 같은 종류 몇 개·어디서)
| 엔진 (embeds/_engine/) | 그룹 | 공통/standalone | 사용 인스턴스 | 비고 |
|---|---|---|---|---|
| step-debugger | 6 | 공통(_engine)·config 주도 ✅ | CH04-L01·L05·L06·CH05-L01·L05·CH10-L07 (완료) | `.stepper-config` 트레이스(이미 주도형·리팩터 불요·하이픈키 ls_x-y OK) |
| fill-blank | 3 | 공통(_engine)+_autoheight ✅ | CH02-L06·CH04-L02·L07 (전부 완료) | 데이터=마크업 |
| before-after | 2 | 공통(CSS-only)+_autoheight ✅ | CH02-L05-S01·CH07-L03-S01 (완료) | 콘텐츠 정리 · 중립 톤 변형(tone-warm/cool) 추가 |
| diff-mapper | 1 | 공통 | _(미작성)_ | 데이터=마크업 |
| select-query-simulator | 1 | 공통(_engine)·자체 postHeight ✅ | CH08-L02-S01 | config 주입(SQL_CFG) · #N1 주석 CH19 정정 · (CH12-L07은 SELECT-OPTIONS 전용 신규엔진로 분리) |
| select-options-filter-sim (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH12-L07-S01 | SO_CFG 주도 · Range Table(SIGN I/E·OPTION EQ/NE/GT/LT/GE/LE/BT/CP) 평가 |
| salv-grid-simulator | 2 | 공통(_engine)·자체 postHeight ✅ | CH11-L02-S01·CH11-L06-S01 (완료) | config 주입(SALV_CFG: itab·cols·data·sumKey·code) · ALV제목/토글 엔진설정 |
| relationship-map | 1 | 공통 | _(미작성)_ | CSS-only |
| state-change-grid | 1 | 공통(CSS-only)+_autoheight ✅ | CH06-L06-S01 | 스냅샷=마크업(lt_gugu 성장·정렬) · 빈 .js 제거 |
| mermaid | 1 | 공통(+_vendor)+_autoheight ✅ | CH04-L03-S01 | 그래프=위젯 `.mermaid` 주입·CDN+로컬fallback·이벤트본 은퇴 |
| domain-builder | 1 | 공통(_engine) ✅ | CH03-L01-S01 | SE11 폼(단일사용·데이터 inline) |
| input-help-priority | 1 | 공통(CSS-only)+_autoheight ✅ | CH09-L07-S01 | F4 사다리(콘텐츠=마크업·빈 .js 제거) |
| write-output | 1 | 공통 ✅ | CH01-L04-S01 | WRITE 출력 파서 · config 주입 · **버그수정(따옴표無→오류)** |
| write-format | 1 | 공통 ✅ | CH01-L05-S01 | WRITE 서식 토글 · config 주입 |
| event-lifecycle | 2 | 공통(+mermaid) | _(미작성)_ | 이벤트 빌드업 |
| se38-first-program | 3 | 공통(_engine) ✅ | CH01-L02-S01 | 개발루프 상태머신(bespoke·단일사용·데이터 inline) |
| se93-tcode-create | 3 | 공통(_engine) ✅ | CH01-L07-S01 | SE93 생성+명령창 실행(bespoke·단일사용) |
| case-branch-sim | 2 | 공통(_engine)+_autoheight ✅ | CH04-L04-S01 | CASE…WHEN 시뮬·config 주도·OR묶기 토글(bespoke 신규) |
| join-aggregate-visualizer | 1 | 공통(_engine)·자체 postHeight ✅ | CH13-L08-S01 | JOIN_CFG 주도 · LEFT/INNER 토글·GROUP BY SUM·ON 필터(취소 제외) |
| gui-alv-grid-simulator (신규) | 2 | 공통 | _(미작성)_ | CL_GUI_ALV_GRID |
| dynpro-screen-elements (신규) | 2 | 공통 | _(미작성)_ | 화면 요소 |
| class-object / inheritance / class-structure (신규) | 1~2 | 공통 | _(미작성)_ | OO 다이어그램 |

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
