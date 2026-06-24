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
| CH04-L02-S01 | CH04-L02 | fill-blank | 문자열 함수 빈칸(INTO·AT·strlen·FIND) | ✅ |
| CH04-L07-S01 | CH04-L07 | fill-blank | 구구단 빈칸(TIMES·sy-index·*·ENDDO) | ✅ |
| CH04-L03-S01 | CH04-L03 | mermaid | IF/ELSEIF/ELSE 분기 흐름도(p_amt: 큰금액/소액/0·음수) | ✅ |
| CH04-L04-S01 | CH04-L04 | case-branch-sim | CASE…WHEN 시뮬(등급 A·B·C·그외→출력, OR묶기 토글) | ✅ |

## B. 엔진별 집계 (카테고리 현황 — 같은 종류 몇 개·어디서)
| 엔진 (embeds/_engine/) | 그룹 | 공통/standalone | 사용 인스턴스 | 비고 |
|---|---|---|---|---|
| step-debugger | 6 | 공통(_engine)·config 주도 ✅ | CH04-L01·L05·L06·CH05-L01·L05 (외 CH10-L07 예정) | `.stepper-config` 트레이스(이미 주도형·리팩터 불요·하이픈키 ls_x-y OK) |
| fill-blank | 3 | 공통(_engine)+_autoheight ✅ | CH02-L06·CH04-L02·L07 (전부 완료) | 데이터=마크업 |
| before-after | 2 | 공통(CSS-only)+_autoheight ✅ | CH02-L05-S01 (외 CH07-L03 예정) | 콘텐츠 정리(크롬 제거) |
| diff-mapper | 1 | 공통 | _(미작성)_ | 데이터=마크업 |
| select-query | 2 | 공통 | _(미작성)_ | config 주입 |
| salv-grid | 2 | 공통 | _(미작성)_ | config 주입 |
| relationship-map | 1 | 공통 | _(미작성)_ | CSS-only |
| state-change-grid | 1 | 공통 | _(미작성)_ | CSS-only |
| mermaid | 1 | 공통(+_vendor)+_autoheight ✅ | CH04-L03-S01 | 그래프=위젯 `.mermaid` 주입·CDN+로컬fallback·이벤트본 은퇴 |
| domain-builder | 1 | 공통(_engine) ✅ | CH03-L01-S01 | SE11 폼(단일사용·데이터 inline) |
| input-help-priority | 1 | 공통 | _(미작성)_ | F4 사다리 |
| write-output | 1 | 공통 ✅ | CH01-L04-S01 | WRITE 출력 파서 · config 주입 · **버그수정(따옴표無→오류)** |
| write-format | 1 | 공통 ✅ | CH01-L05-S01 | WRITE 서식 토글 · config 주입 |
| event-lifecycle | 2 | 공통(+mermaid) | _(미작성)_ | 이벤트 빌드업 |
| se38-first-program | 3 | 공통(_engine) ✅ | CH01-L02-S01 | 개발루프 상태머신(bespoke·단일사용·데이터 inline) |
| se93-tcode-create | 3 | 공통(_engine) ✅ | CH01-L07-S01 | SE93 생성+명령창 실행(bespoke·단일사용) |
| case-branch-sim | 2 | 공통(_engine)+_autoheight ✅ | CH04-L04-S01 | CASE…WHEN 시뮬·config 주도·OR묶기 토글(bespoke 신규) |
| join-aggregate-visualizer (신규) | 2 | 공통 | _(미작성)_ | JOIN+GROUP BY |
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
