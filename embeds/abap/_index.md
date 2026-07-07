# embeds/abap — 학습수단 현황 인덱스

> 레슨 웹페이지가 `::embed CHnn-Lnn-Snn`으로 부르는 실제 학습수단 목록.
> 파일명만으론 종류를 모르므로(슬러그 없음) 여기서 **설명·엔진·연결레슨·상태**를 관리한다.
> 정본 엔진 = `embeds/_engine/` · 공통 토큰 = `embeds/_engine/_base.css` · Mermaid 백업 = `embeds/_vendor/`.
> 제작 계획(완료·아카이브) = [13_EMBED_BUILD_PLAN](../../.archive/2026-06-29-docs-cleanup/13_EMBED_BUILD_PLAN.md) · 입력 감사 = `check/20260624_챕터별_점검결과/`.
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
| CH01-L03-S01 | CH01-L03 | syntax-toggle-lab | 문법 상태 실험기 — 마침표 제거·별표 위치·인라인 *·키워드 소문자 토글→구문 검사 램프(ok/bad)+원인 설명 | ✅ |
| CH02-L01-S01 | CH02-L01 | before-after | (등재 보완) 리터럴 반복 vs 변수 하나 — 값 바꿀 때 고칠 곳 비교 | ✅ |
| CH02-L01-S02 | CH02-L01 | var-box | (등재 보완) 변수=타입 라벨 박스+값 쪽지 — 선언 직후(타입 기본값)↔값 대입 토글 | ✅ |
| CH02-L02-S01 | CH02-L02 | var-box | (재사용) Complete 타입 5종(STRING/I/F/D/T) 박스 — 모양+타입 기본값↔값 대입·D/T 자릿수 뼈대 | ✅ |
| CH02-L03-S01 | CH02-L03 | len-shape-grid | 길이 칸 실험실 — C 패딩/잘림·N 앞 0·P 바이트 칸(2×len−1)+부호 반 칸·offset 하이라이트/범위 초과/부분 쓰기 | ✅ |
| CH02-L04-S01 | CH02-L04 | type-stamp | TYPES 도면(0바이트)→DATA 실물 — DECIMALS 2↔3 토글 시 변수 3개 동시 반영·타입에 값 대입→오류 데모 | ✅ |
| CH02-L05-S01 | CH02-L05 | before-after | 매직넘버 pi(줄마다 '3.1415926'·'…27'·'3.14' 제각각·오타) vs 상수 gc_pi 하나 — bad/good + 변수 덮어쓰기 주의 note | ✅ |
| CH02-L06-S01 | CH02-L06 | fill-blank | Text Symbol 빈칸(TEXT·001) | ✅ |
| CH02-L06-S02 | CH02-L06 | text-symbol-lab | Text Symbol 실험기 — 등록/미등록×KO/EN 로그인→TEXT-001(미등록=빈칸·누락 들통) vs '금액'(001)(fallback·누락 숨음) 출력 비교 | ✅ |
| CH03-L01-S01 | CH03-L01 | domain-builder | SE11 Domain 생성(저장→검사→활성화·예제칩 6) | ✅ |
| CH03-L02-S01 | CH03-L02 | ddic-layer-board | Domain(기술)→Data Element(의미) 1:N 상속 보드 — 길이 토글→DE 2개+화면 미리보기 동시 반영·직접 TYPE 사용→오류 데모 | ✅ |
| CH03-L03-S01 | CH03-L03 | param-screen-lab | PARAMETERS 보상 실험 — pa_stat 타입 DE↔표준 타입 토글(라벨/F4 온·오프)·VALUE CHECK로만 고정값 검증(F4≠검증)·OBLIGATORY 차단·DEFAULT·LOWER CASE·실행 mock | ✅ |
| CH04-L01-S01 | CH04-L01 | step-debugger | 산술 트레이스(7+3·2**10·DIV·MOD) | ✅ |
| CH04-L05-S01 | CH04-L05 | step-debugger | DO·sy-index 트레이스(1→5) | ✅ |
| CH04-L06-S01 | CH04-L06 | step-debugger | 구구단 중첩DO 디버거 홈(F5·gv_mul/res) | ✅ |
| CH05-L01-S01 | CH05-L01 | step-debugger | §BEGIN OF+§Component 예제 통합 트레이스(선언→하이픈 대입→WRITE, 6스텝 — chain은 항목당 1스텝·출력 줄 점진 완성·TYPES 없음) | ✅ |
| CH05-L01-S05 | CH05-L01 | step-debugger | §LIKE 오해 반박 — 원본 gs_p1 채운 뒤 LIKE 선언, 워치에 gs_p1·gs_p4 동시 표시(모양만 복사·값은 초기값, 4스텝) | ✅ |
| CH05-L05-S01 | CH05-L05 | step-debugger | 구구단=구조체 캡스톤(ls_line-dan/mul/result·sy-index 반복 갱신) | ✅ |
| CH05-L01-S02 | CH05-L01 | struct-viz(strip) | gs_person(string·i·p) 변수 박스 — 좌측=변수명 먼저·칸 헤더=이름(좌)·타입(우) 한 줄·외곽=한 덩어리·§BEGIN OF 전용(하이픈 접근은 S03 몫)·트리 병행 보기 | ✅ |
| CH05-L01-S03 | CH05-L01 | struct-viz(strip+accessPick) | 포인팅 데모 — 전체 칩(gs_person=곡선 1가닥이 박스 자체+글로우 '한 몸') vs 필드 칩(-age=칸 하나+나머지 흐림)·곡선 커넥터(화살촉 없는 베지어+끝점 도트)·값 읽어주기·숫자 칸 우측 정렬 | ✅ |
| CH05-L01-S04 | CH05-L01 | struct-viz(strip) | ts_person=값 없는 헤더 스트립+변수 3행 정렬(칸=모양+값)·칼럼 폭=길이감 인코딩(SAP 표준 표기)·CH06 행 스택 예고 | ✅ |
| CH05-L01-S07 | CH05-L01 | before-after(.solo) | §도입 pain 시각화 — 단일 값 변수만으로 사람 셋(DATA 9줄 벽+칩 9개·해결책 미노출) + 숨은 실수 헌트(오타 gv_naem2·DECIMALS 누락·c 10, 점선 밑줄+정답 접기) | ✅ |
| CH05-L01-S06 | CH05-L01 | before-after | 번호 변수 참사(gv_name2·3… 9줄) vs TYPES+DATA(사람 1명=1줄) — pain 증폭 + 하단 메모리 도형(낱개 칩 9 ↔ 같은 모양 구조체 박스 3, 이름만) + 실무 스케일 접기(정보 +7 → 변수 30개 vs TYPES 7줄, 곱셈 vs 덧셈 + 200개 투영) | ✅ |
| CH05-L02-S02 | CH05-L02 | share-vs-local | 정의 위치 비교 — Local(프로그램마다 정의, 이름 같아도 구성 제각각=남남·수평 3열) vs DDIC(ZST_PERSON 한 곳→곡선 참조)·필드 추가 토글(수정 3곳 vs 1곳) | ✅ |
| CH05-L02-S01 | CH05-L02 | struct-viz | (재사용) ZST_PERSON 트리 — Component=Data Element(라벨 상속 표기)·name 대입 인터랙션 | ✅ |
| CH05-L03-S01 | CH05-L03 | struct-reuse-board | 중첩/.INCLUDE/.APPEND 세그→다이어그램(하위 박스/펼침 그룹/잠긴 표준+확장)+접근 경로+경로 퀴즈 3문 | ✅ |
| CH05-L04-S01 | CH05-L04 | move-mapping | MOVE-CORRESPONDING 매핑 보드(SAP BC400 표준 구도) — 상=원본·하=대상 스트립·같은 이름끼리 화살표(실행 전 점선→후 실선)·잔존 함정·CLEAR 토글 | ✅ |
| CH06-L01-S01 | CH06-L01 | step-debugger(itab워치) | Work Area→APPEND로 gt_person 성장 트레이스(11스텝·행 미니테이블 new 플래시·CLEAR/FREE·DESCRIBE·APPEND=복사 강조: WA age=99 바꿔도 쌓인 행 불변) | ✅ |
| CH06-L02-S01 | CH06-L02 | code-anatomy | 테이블 타입 선언 한 줄 해부(tt_person/kind=STANDARD/line=TABLE OF/key=WITH NON-UNIQUE KEY/use) — 3속성 클릭 | ✅ |
| CH06-L02-S02 | CH06-L02 | decision-tree | Table Kind 선택 트리(자주 하는 일→STANDARD/SORTED/HASHED·유일키·정렬유지 분기) | ✅ |
| CH06-L03-S01 | CH06-L03 | step-debugger(itab워치) | 한 행 제어 실험실(INSERT INDEX·READ INDEX/WITH KEY·MODIFY TRANSPORTING·DELETE, focus 강조·sy-subrc/sy-tabix·READ 실패 후 WA 잔존 함정) | ✅ |
| CH06-L03-S02 | CH06-L03 | step-debugger(itab워치) | BINARY SEARCH 함정 재현(정렬 없이→sy-subrc=4, SORT 후→발견) | ✅ |
| CH06-L04-S01 | CH06-L04 | step-debugger(itab워치) | 반복 회차 vs sy-tabix 괴리(WHERE 걸러 돌기·focus 강조) + ASSIGNING <fs> 원본 직접 수정(전 행 age+1) | ✅ |
| CH06-L04-S02 | CH06-L04 | step-debugger(itab워치) | COLLECT 키 합산(서울 100+30=130·행 불증) → 컨트롤레벨 AT NEW/END OF·SUM 지역 소계 리포트 | ✅ |
| CH06-L04-S03 | CH06-L04 | state-change-grid | DELETE ADJACENT DUPLICATES 함정 스냅샷(정렬 없이 0삭제→SORT→인접 첫행만 남김·COMPARING name) | ✅ |
| CH06-L05-S01 | CH06-L05 | judge-quiz | Flat vs Deep 판정 5문(전 숫자=Flat·string 하나=Deep·itab 포함=Deep·중첩≠deep·고정길이 회원카드) | ✅ |
| CH06-L05-S02 | CH06-L05 | code-anatomy | ts_order 해부 — order_id/customer=Flat, items TYPE tt_item 한 줄이 전체를 Deep으로(원본 코드블록 체험·R2) | ✅ |
| CH06-L06-S01 | CH06-L06 | state-change-grid | 구구단 gt_gugu 성장 스냅샷(APPEND 1→9→81행 + SORT result DESC) | ✅ |
| CH07-L01-S01 | CH07-L01 | se11-table-builder(신규) | SE11 Transparent Table 생성 시뮬(ZGUGUDAN 필드·키 토글·타입 Data Element↔Built-In·검사→활성화→DB 물리테이블 생성·키 연속성/DE 검증) | ✅ |
| CH07-L02-S01 | CH07-L02 | se11-create-entries(신규) | Create Entries 손입력 훈련기(DAN·MUL·RESULT 저장·키 중복 거부·RESULT≠DAN*MUL 경고+빨간행·MANDT 클라이언트 분리 100/200·2·3단 자동채움) | ✅ |
| CH07-L03-S01 | CH07-L03 | before-after | 메모리(휘발) vs 디스크(영속) 두 운명 — 중립 톤(tone-warm/cool)·MANDT(Key)/Data Element 표기로 L01 정합 교정·ts_line | ✅ |
| CH07-L03-S02 | CH07-L03 | compare-matrix | 같은 모양 네 쓰임 비교(Structure·Internal Table·Table Type·Transparent Table × 담는단위·사는곳·수명·선언예, 행 클릭 상세) | ✅ |
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
| CH12-L02-S01 | CH12-L02 | selopt-screen-mapper | 선택화면 From/To+다중선택→so_conc Range Table→LOOP AT 출력(From=EQ·From~To=BT·제외 E·8자) | ✅ |
| CH12-L03-S01 | CH12-L03 | select-options-filter-sim | (재사용) classic WHERE..IN 평가 + #soSys(sy-subrc/sy-dbcnt)·시나리오(전체=6·C999=0건subrc4·AND) | ✅ |
| CH12-L04-S01 | CH12-L04 | include-exclude-judge | 포함(I)/제외(E) 조건 쌓기→공연별 통과/탈락 판정·이유(포함 OR·제외 빼기·녹색/빨강=SIGN) | ✅ |
| CH12-L05-S01 | CH12-L05 | option-compare-lab | 단일 조건 SIGN·OPTION(EQ/BT/CP)·LOW/HIGH 토글→후보 통과 비교·CP wildcard(*,+)·E 반전 | ✅ |
| CH12-L06-S01 | CH12-L06 | range-append-stepper | 코드 한 줄씩(CLEAR→sign→option→low→APPEND→SELECT)·ls_stat↔lr_stat·APPEND 전 빈 table·결과 5행 | ✅ |
| CH12-L07-S01 | CH12-L07 | select-options-filter-sim | SELECT-OPTIONS Range Table(so_conc·so_stat·I/E·EQ/BT/CP→zbooking 필터) | ✅ |
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
| CH15-L02-S01 | CH15-L02 | init-default-injector | INITIALIZATION(1회·사용자 값 유지) vs OUTPUT(매번 덮어쓰기) 기본값 시연 | ✅ |
| CH15-L03-S01 | CH15-L03 | screen-modify-panel | AT SELECTION-SCREEN OUTPUT·LOOP AT SCREEN·MODIFY SCREEN(변수 변경≠화면 반영·p_mode→P_SECRET 숨김) | ✅ |
| CH15-L04-S01 | CH15-L04 | validation-gate-console | AT SELECTION-SCREEN 검증→MESSAGE(E001/002 &1&2·004)·sy-msg*·START-OF-SELECTION 잠금 | ✅ |
| CH15-L05-S01 | CH15-L05 | select-start-gate | 검증 통과→START-OF-SELECTION SELECT(조건별 결과·sy-subrc·0건 S메시지)·검증 실패 잠금 | ✅ |
| CH15-L06-S01 | CH15-L06 | legacy-event-reader | 리포트 3종(LDB연결/일반SELECT/END분리)으로 END-OF-SELECTION 호출·출력 위치 비교 독해·비-LDB 필수 오해 경고 | ✅ |
| CH15-L07-S01 | CH15-L07 | dual-gate-auth-check | 공연코드 3종을 존재검증(SELECT SINGLE)→권한검증(AUTHORITY-CHECK) 이중관문에 통과·없는코드(amber)vs권한없음(red) 분리·sy-subrc | ✅ |
| CH15-L08-S01 | CH15-L08 | selscreen-reaction-lab | 선택화면 4대 고급 이벤트(ON BLOCK/RADIO/F1/F4) 직접 호출·dynpro(PAI/POH/POV)·ABAP이벤트·F4목록→P_CARR 운반(다른필드 자동운반X) | ✅ |
| CH15-L09-S01 | CH15-L09 | selscreen-layout-builder | 선택화면 미리보기에서 PUSHBUTTON/FUNCTION KEY→SSCRFIELDS-UCOMM(REF/FC01)·sy-ucomm 처리누락 경고·COMMENT FOR FIELD 연결약함 경고 | ✅ |
| CH15-L10-S01 | CH15-L10 | option-switchboard | SELECT-OPTIONS 한 필드에 옵션(OBLIGATORY/LOWER CASE/NO-EXTENSION/NO INTERVALS) 토글→화면모양·내부행(SIGN/OPTION/LOW/HIGH)·복수선택·NO INTERVALS caveat | ✅ |
| CH15-L11-S01 | CH15-L11 | selscreen-call-variant | 보조화면(1100) CALL SELECTION-SCREEN modal·Execute=sy-subrc0(적용)/Cancel=4(미적용)·Variant 불러오기(유효 복원/무효 무시) | ✅ |
| CH15-L12-S01 | CH15-L12 | report-run-simulator | CH15 캡스톤·6시나리오×4이벤트(INIT→OUTPUT→검증→START) 흐름·통과/막힘·so_stat R/C 필터·결과테이블/S메시지/ALV | ✅ |
| CH16-L01-S01 | CH16-L01 | process-flow-pbo-pai | Module Pool 두 박자 순환(PBO→화면→입력→PAI→loop·다음박자 진행) | ✅ |
| CH16-L02-S01 | CH16-L02 | screen-painter-wiring | Dynpro 4조각(Layout/Element List/Flow Logic/ABAP Source) 연결지도·시나리오로 깨기(MODULE 누락/이름불일치/OK field 누락)→활성화 오류 | ✅ |
| CH16-L04-S01 | CH16-L04 | pbo-prep-stepper | PBO 6단계 진행(PF-STATUS·TITLEBAR·LOOP AT SCREEN·MODIFY SCREEN·표시)·잠금 토글→P_SEATS input=0 대기 vs MODIFY SCREEN 반영 체감 | ✅ |
| CH16-L05-S01 | CH16-L05 | okcode-branch-lab | PAI ok_code→save_ok→CLEAR→CASE 분기 추적·버튼(SAVE/BACK/EXIT/CANCEL/Enter)·CLEAR 생략 시 SAVE→Enter 재실행(reexec) 데모·EXIT=LEAVE PROGRAM | ✅ |
| CH16-L06-S01 | CH16-L06 | toolbar-fcode-map | GUI status 툴바 버튼→OK_CODE→PAI CASE 매핑·잠금→SAVE EXCLUDING·미처리 버튼(HELP) 경고·TITLEBAR WITH 치환 | ✅ |
| CH16-L07-S01 | CH16-L07 | screen-extension-designer | 화면 확장요소 4탭(Custom Control 이름매칭·Subscreen OK field 없음→main·Tabstrip activetab/subscreen·Status Icon) | ✅ |
| CH16-L08-S01 | CH16-L08 | dynpro-form-simulator | CH16 캡스톤·화면0100 PBO준비→좌석입력→SAVE(can_book 검증 S/E·화면유지)·BACK=LEAVE TO SCREEN0·EXIT=LEAVE PROGRAM·Enter 재실행방지 | ✅ |
| CH16-L03-S01 | CH16-L03 | dynpro-screen-elements | 예매 화면 요소↔변수(Input·Check·Radio·Dropdown VRM·Button→OK_CODE) | ✅ |
| CH17-L01-S01 | CH17-L01 | container-bind-stepper | CL_GUI_CUSTOM_CONTAINER 바인딩 3단계(Screen Painter 확인→PBO→CREATE OBJECT)·이름 매칭→go_cont initial→bound/오타 fail | ✅ |
| CH17-L02-S01 | CH17-L02 | alv-readiness-panel | CL_GUI_ALV_GRID 생성 2단계+준비 체크리스트(go_cont/go_grid ready·데이터/fcat/display 비어있음→표 안보이는게 정상)·i_parent 비움 fail | ✅ |
| CH17-L03-S01 | CH17-L03 | alv-data-query | SELECT INTO TABLE 3시나리오(C001=4건·C999=0건subrc4 빈표정상·조건없이=전체 경고)·sy-subrc/sy-dbcnt/행수·lt_booking 미리보기 | ✅ |
| CH17-L04-S01 | CH17-L04 | fieldcat-editor | lt_fcat coltext/outputlen 편집→lt_booking 헤더 라이브 변경·fieldname 대소문자 매칭(소문자→적용 안 됨) | ✅ |
| CH17-L05-S01 | CH17-L05 | alv-layout-toggles | LVC_S_LAYO 토글(zebra/cwidth_opt/grid_title/sel_mode)→미리보기 라이브·cwidth_opt off→긴 고객명 clip | ✅ |
| CH17-L06-S01 | CH17-L06 | alv-variant-store | Display Variant 사용자A/B 컬럼순서 저장·열기→미리보기 복원(표시방식≠데이터)·report 비움→경고+버튼 disabled | ✅ |
| CH17-L08-S01 | CH17-L08 | alv-refresh-sync | 내부 vs 화면 2테이블·상태변경(내부만 stale)→일반 Refresh(맨위로 튐)/Stable Refresh(위치 유지)·데이터변경/화면갱신/위치보존 3체크 | ✅ |
| CH17-L09-S01 | CH17-L09 | alv-row-color-lab | 매진 판정(점유/정원)→색코드 쓰기(C610)→info_fname 연결→표시→매진 행 색칠·틀린 필드명(ROW_COLOR)→색 안보임·3체크 | ✅ |
| CH17-L07-S01 | CH17-L07 | gui-alv-grid-simulator | CL_GUI_ALV_GRID 4단계(container→grid→fcat→set_table)·정렬·Σ | ✅ |
| CH17-L10-S01 | CH17-L10 | gui-alv-grid-simulator | 예매목록 Grid ALV 종합 5단계(SELECT→…→set_table·MERGE·layout) | ✅ |
| CH18-L01-S01 | CH18-L01 | inline-decl-judge | 문장 카드 4종 DATA() 인라인 허용/보류(READ/LOOP/계산 허용·SELECT 보류)·FINAL() 재대입 오류 데모 | ✅ |
| CH18-L02-S01 | CH18-L02 | value-builder | VALUE constructor 작업(make 3행·BASE 추가/없이 대체·FOR 9행·중복 key)→VALUE 식+결과테이블+경고·key 규칙 적용 | ✅ |
| CH18-L03-S01 | CH18-L03 | field-mapping-board | CORRESPONDING 원본→대상 매핑(같은이름 자동·MAPPING/EXCEPT 토글·created_by 버려짐)→생성 코드 라이브 | ✅ |
| CH18-L04-S01 | CH18-L04 | read-vs-tabexpr | 검색 id별 4방식 비교(READ TABLE sy-subrc·tab[ ] 없으면 예외·line_exists 안전·line_index 0)·B999→CX_SY_ITAB_LINE_NOT_FOUND | ✅ |
| CH18-L05-S01 | CH18-L05 | string-template-composer | CONCATENATE↔String Template 비교·DATE/NUMBER=USER 서식·substring(off/len) 범위 초과 오류 | ✅ |
| CH18-L06-S01 | CH18-L06 | diff-mapper | classic↔modern(VALUE·+=) hover 대응+설명 · 중립 톤 classic/modern | ✅ |
| CH18-L07-S01 | CH18-L07 | diff-mapper | 콘서트앱 모던리팩터(인라인DATA·+=·VALUE·Table Expr) | ✅ |
| CH19-L01-S01 | CH19-L01 | sql-modernize-stepper | classic→modern SQL 단계 변환(콤마·@·INTO 뒤로)·항공사 코드별 결과(행수·sy-subrc·sy-dbcnt) 동일 | ✅ |
| CH19-L02-S01 | CH19-L02 | host-escape-inspector | WHERE 오른쪽 operand(ABAP변수/식/DB컬럼/리터럴)×@ on·off→정오 판정(escape 필요/불필요/누락)·host식 lossless·SQL식↔host식 구분 | ✅ |
| CH19-L03-S01 | CH19-L03 | inline-target-viewer | SELECT 목록(*/필드/계산/계산+AS)×target(@DATA/DATA/@기존)→행 구조 chips·standard+empty key·계산 컬럼 AS 별칭 필요·@DATA↔DATA 구분 | ✅ |
| CH19-L04-S01 | CH19-L04 | sql-expression-lab | CASE/CAST/COALESCE×DB식↔ABAP LOOP 토글→결과 테이블(계산 컬럼·null 강조)·계산 위치만 다름·CASE 타입호환·CAST 길이·COALESCE null≠initial | ✅ |
| CH19-L05-S01 | CH19-L05 | sql-function-workbench | SQL 문자열·날짜 함수 7종 선택·SUBSTRING pos(1-기반)/len 인터랙티브+ABAP off(0-기반) 비교·DATS_ADD_DAYS days·DATS_DAYS_BETWEEN·null 전파 | ✅ |
| CH19-L06-S01 | CH19-L06 | itab-sql-console | 내부 테이블을 @itab source로·WHERE/ORDER BY/GROUP BY×SELECT↔LOOP/SORT/COLLECT 비교·원본/결과 테이블·@ 필요·DB 대용 아님 | ✅ |
| CH19-L07-S01 | CH19-L07 | module-choice-cards | (재사용) SQL Decision Cards 6문항→@host/@DATA/CASE/COALESCE/SELECT FROM @itab/ABAP·명시타입 분류·이유 | ✅ |
| CH19-L08-S01 | CH19-L08 | concert-agg-join-lab | 콘서트 집계: 취소 제외 조건 ON↔WHERE 토글(C003 보존/소멸)·COALESCE null↔0·LEFT OUTER JOIN+GROUP BY·결과/검증 테이블 | ✅ |
| CH20-L01-S01 | CH20-L01 | class-diagram | 클래스(설계도)→NEW→객체(인스턴스) 흐름 | ✅ |
| CH20-L02-S01 | CH20-L02 | visibility-gate-sim | 멤버(데이터/메서드)×visibility(PUBLIC/PROTECTED/PRIVATE)×호출자(외부/자기/자식)→접근 허용·차단(컴파일 단계)+캡슐화 조언+접근 매트릭스 | ✅ |
| CH20-L03-S01 | CH20-L03 | constructor-timeline | 객체 생성/정적 호출→constructor(객체별 count)·class_constructor(클래스 1회) 실행 순서 타임라인+카운터+객체 카드(상태) | ✅ |
| CH20-L04-S01 | CH20-L04 | selector-trainer | 왼쪽(클래스명/참조변수)×선택자(=>/->)×멤버(정적/인스턴스)→호출 정오 판정(class=>static OK·class=>instance 오류·ref->instance OK·ref->static 동작하나 권장X) | ✅ |
| CH20-L05-S01 | CH20-L05 | interface-contract-board | 인터페이스 1(zif_printable)+구현 클래스 3·계약 보드·인터페이스 참조에 클래스 담기→같은 print() 다른 출력(다형성)·구현 누락→활성화 실패 | ✅ |
| CH20-L06-S01 | CH20-L06 | exception-flow-console | 좌석(정상/정원초과)×CATCH 순서(구체/cx_root 먼저)→TRY/RAISE/CATCH 실행 흐름 단계+cx_root 먼저 시 구체 handler 도달불가 경고 | ✅ |
| CH20-L08-S01 | CH20-L08 | dynamic-type-inspector | 실제 객체(일반/VIP)×연산(CAST/CASE TYPE OF)→정적/동적 타입·CAST 성공/실패(CX_SY_MOVE_CAST_ERROR)·CASE TYPE OF 안전 분기 | ✅ |
| CH20-L09-S01 | CH20-L09 | event-wiring-panel | 발생 객체 lo_mgr + handler 2(monitor/logger) SET HANDLER 등록 토글·RAISE EVENT→등록된 handler만 동기 호출 로그·미등록 무반응·다중 handler 순서 미보장 | ✅ |
| CH21-L01-S01 | CH21-L01 | salv-control-panel | SALV display 전 설정 토글(표준기능/PERF_DATE 정렬/취소 제외 필터/필드명 오타)→표 재정렬·필터·코드 강조·필드명 오타 오류·필터≠DB조건 | ✅ |
| CH21-L02-S01 | CH21-L02 | salv-layout-lab | SALV 표시 설정(줄무늬/폭 최적화 ARTIST clip/CAPACITY 텍스트 기본·long만·셋다/컬럼명 오타)→표 변화·코드·long만 경고·cx_salv_not_found·variant=표시설정만 | ✅ |
| CH21-L03-S01 | CH21-L03 | fieldcat-builder | field catalog(MANDT 숨김/SEATS 합계/STATUS 가운데/PERF_NO 키/문자합계/오타)→카탈로그 행 변화+화면 preview 반영·문자합계 경고·오타 오류·카탈로그≠DB | ✅ |
| CH21-L04-S01 | CH21-L04 | cell-color-microscope | 셀 색 2단계(①색 계산 cellcolors 채움→armed ②ctab_fname 연결→painted)·fname 오타·매진 행 SEATSOCC 셀만 빨강·LVC_T_SCOL deep·flat↔deep 분리 | ✅ |
| CH21-L05-S01 | CH21-L05 | cell-style-board | 셀 스타일 2단계(①적용 cellstyles ②stylefname 연결)→disabled🔒/enabled 편집/button 표시·버튼 클릭→CH27 경계 info·LVC_T_STYL fieldname≠색 fname | ✅ |
| CH21-L06-S01 | CH21-L06 | module-choice-cards | (재사용) 색 단위 선택 퀴즈 5문항→행 색(info_fname)/컬럼 색(emphasize)/셀 색(ctab_fname)/색 안 쓰기 분류·이유 | ✅ |
| CH21-L07-S01 | CH21-L07 | refresh-shake-comparator | 실제 스크롤 표(40행)·28행 스크롤→데이터 갱신+refresh: is_stable-row on=위치 유지/off=첫줄 튐·컬럼 구조 변경=재초기화·refresh≠DB조회 | ✅ |
| CH21-L08-S01 | CH21-L08 | concert-alv-color-lab | (capstone) 회차 6행 잔여석(remaining)→≤0 빨강·≤5 노랑·회차 선택+예매 추가→seats_left 줄어 색 변화·ctab_fname 끄기→색 사라짐(데이터는 남음) | ✅ |
| CH20-L07-S01 | CH20-L07 | class-diagram | 상속 계층(부모 ZCL_BOOKING_MANAGER←자식 ZCL_VIP_BOOKING·REDEFINITION/super·ABSTRACT/FINAL) | ✅ |
| CH20-L10-S01 | CH20-L10 | class-diagram | UML 클래스 구조(PUBLIC 메서드·PRIVATE 속성·캡슐화·RAISING) | ✅ |
| CH22-L01-S01 | CH22-L01 | cds-activation-observer | CDS View Entity 활성화 관찰기 5단계(원본 테이블→DDL 작성→활성화→Data Preview→ABAP SQL 소비)·필드 오타 토글→활성화 실패→Preview/SQL 차단·행수 비교 배지·관점 전환 | ✅ |
| CH22-L02-S01 | CH22-L02 | projection-layer-lab | Interface(ZI_)/Projection(ZC_) 계층 분리·ZC_ 숨김=비파괴(ZI_ 불변)·ZI_ 제거=연쇄(ZC_ 노출불가)·필드별 토글→ZI/ZC 칩+DDL+SELECT 라이브 | ✅ |
| CH22-L03-S01 | CH22-L03 | relationship-map | CDS Association 관계도(공연 ZI_Concert→회차 ZI_Perf→예매 ZI_Booking) | ✅ |
| CH22-L03-S02 | CH22-L03 | association-path-simulator | (인터랙티브) 공연 선택→_Perf 경로 회차 따라가기·노출 토글(off→경로 못봄 warn)·concert_id 제거(ON source 사라짐 bad)·cardinality [1..1]↔회차 여러개 불일치 warn·JOIN으로 보기(CH13 INNER JOIN 비교) | ✅ |
| CH22-L04-S01 | CH22-L04 | annotation-effect-preview | Annotation 효과 미리보기 3패널(@EndUserText.label 토글→헤더 기술명↔업무라벨·@Semantics.amount.currencyCode 짝 currency_code=ok/자기참조 ticket_price=bad/없음=warn·@UI.lineItem ▲▼ 순서→position 재할당) | ✅ |
| CH22-L05-S01 | CH22-L05 | metadata-extension-lab | 본문(DDL)↔메타데이터(DDLX) 분리·UI 주석 위치 토글(본문 섞임↔DDLX 분리)·@Metadata.allowExtensions off→활성화 실패·DDLX 구분자 ;↔, 검사(쉼표=실패)·layer #CORE·annotation만(필드 추가 아님) | ✅ |
| CH22-L06-S01 | CH22-L06 | dcl-auth-comparator | DCL 권한 필터 결과 비교기·사용자(SEOUL/BUSAN/NO_AUTH)+PFCG 배지·@AccessControl #CHECK↔#NOT_REQUIRED 토글→같은 SELECT 다른 결과 행·#NOT_REQUIRED면 권한밖 venue 노출(unauth 행 빨강 tag·보안 실패 bad)·#CHECK 필터 ok | ✅ |
| CH22-L07-S01 | CH22-L07 | cds-builder-stepper | (capstone) 콘서트 CDS 빌더 6단계 순서 의존(①ZI_Perf②ZI_Concert+_Perf③ZC_Concert④DDLX⑤Data Preview⑥소비코드)·순서 어기면 target 없음 bad·산출물 4 active 다이어그램·preview ZI/ZC 행수 같음·도전과제 카드 | ✅ |
| CH23-L01-S01 | CH23-L01 | rap-layer-assembler | RAP 계층 조립 보드·6계층 토글(Root/Projection/BDEF/Behavior Pool/Service Def/Service Binding)→스택 채움·빠진 계층마다 막히는 사용자 행동(BDEF 없으면 CUD 불가 등)·다 채우면 RAP BO 완성 ok | ✅ |
| CH23-L02-S01 | CH23-L02 | root-entity-picker | RAP Root Entity 판정기(설계 판단)·후보 공연/회차/예매 선택→사용자 행동 모이나(예매만 belong)+key 후보 안정성(booking_id ok/status·customer bad)→define root view entity code·verdict 예매+안정key=ok/다른후보=warn/불안정key=bad | ✅ |
| CH23-L03-S01 | CH23-L03 | projection-contract-checker | Transactional Projection 계약 검사기·ZI_Booking→ZC_Booking·토글 contract(transactional_query)/projRoot/allowExt+노출필드 선택→DDL 라이브+payload chips·!projRoot=bad(root 불일치)·!contract=warn·정상 ok·감사필드 숨김=계약 제외 | ✅ |
| CH23-L04-S01 | CH23-L04 | bdef-contract-editor | RAP BDEF 계약 편집기·operation 체크(create/update/delete)→소비자 행동 able/unable·persistent table 일치/lock master/key readonly 토글→BDEF 코드 라이브·table 불일치=bad·lock off/key 수정가능=warn·ok(동작 선언이지 ABAP 코드 아님) | ✅ |
| CH23-L05-S01 | CH23-L05 | behavior-pool-tracer | RAP Behavior Pool 호출 추적기·4단계 순서(저장 요청 keys 3행→READ ENTITIES 집합 read→정원 검사 B002/B003 초과→failed/reported 기록)·loop 안 EML 토글=anti-pattern warn·keys=internal table(집합 지향)·validation은 실패 알림만 | ✅ |
| CH23-L06-S01 | CH23-L06 | service-exposure-board | RAP Service 노출 점검판·expose 토글(Service Definition)+binding type seg(V4 UI/V4 Web API/V2 UI)+Active 토글→SDL code+binding 카드+$metadata chip·expose+active=ok(UI=Preview/Web API=data-only)·expose+!active=warn(Activate 필요)·!expose+active=warn(metadata 비어 있음·다른 오류) | ✅ |
| CH23-L07-S01 | CH23-L07 | vda-classifier | RAP V/D/A 분류 퀴즈(4 상황 카드→Validation/Determination/Action·정원초과=V·status 기본값=D·취소버튼=A·감사필드=D·정오 피드백+score)+실행 타임라인(요청→modify phase determination→save phase validation→커밋/거부·action 별도 lane result $self) | ✅ |
| CH23-L08-S01 | CH23-L08 | cloud-readiness-judge | ABAP Cloud 준비도 판정 카드(5 시나리오→Cloud-ready/제한됨·표준테이블 UPDATE/Dynpro 신규/unreleased CL_ 호출=제한+대안·released CDS/RAP service=ok·정오+대안+score)+classic vs cloud split panel·released는 이름 추측 금지 | ✅ |
| CH23-L09-S01 | CH23-L09 | rap-booking-runtime | (capstone) 예매 RAP 런타임 시뮬레이터·정상예매(좌석2)→determination status=N+validation 통과→저장·정원초과(좌석12>잔여)→failed/reported 거부·취소(action)→status C·중복취소 no-op warn·실행 타임라인(create→det→val→save/reject)·잔여 라이브·직접 DML 우회 금지 | ✅ |
| CH04-L02-S01 | CH04-L02 | fill-blank | 문자열 함수 빈칸(INTO·AT·strlen·FIND) | ✅ |
| CH04-L07-S01 | CH04-L07 | fill-blank | 구구단 빈칸(TIMES·sy-index·*·ENDDO) | ✅ |
| CH04-L03-S01 | CH04-L03 | mermaid | IF/ELSEIF/ELSE 분기 흐름도(p_amt: 큰금액/소액/0·음수) | ✅ |
| CH04-L04-S04 | CH04-L04 | before-after(.ba__say) | §도입 "말로 읽기" — IF는 '하지만 그렇지 않다면 pa_grade가…' 반복 ↔ CASE는 한 호흡(사용자 문안) + 선택 기준 note(값=CASE·범위/복합=IF) | ✅ |
| CH04-L04-S01 | CH04-L04 | case-branch-sim | CASE…WHEN 시뮬(등급 A·B·C·그외→출력, OR묶기 토글) | ✅ |
| CH04-L03-S02 | CH04-L03 | (bespoke SVG) | (등재 보완) AND/OR/NOT·괄호 논리 다이어그램 — 조건 묶임을 한눈에 | ✅ |
| CH04-L03-S03 | CH04-L03 | (bespoke SVG) | (등재 보완) IS INITIAL 판정 다이어그램(pa_amt 0=참/500=거짓) | ✅ |
| CH04-L04-S02 | CH04-L04 | mermaid | (등재 보완) 기본 CASE 4분기 — 흐름도+코드 2칼럼 | ✅ |
| CH04-L04-S03 | CH04-L04 | mermaid | (등재 보완) WHEN 'A' OR 'B' 묶기 — 흐름도+코드 | ✅ |
| CH04-L05-S02 | CH04-L05 | mermaid | (등재 보완) DO n TIMES 루프 — 흐름도+코드 | ✅ |
| CH04-L05-S03 | CH04-L05 | mermaid | (등재 보완) WHILE 조건 루프 — 흐름도+코드 | ✅ |
| CH04-L05-S04 | CH04-L05 | mermaid | (등재 보완) EXIT·CHECK 루프 제어 — 흐름도+코드 | ✅ |
| CH04-L07-S02 | CH04-L07 | fill-blank | (등재 보완) 구구단 2단계 중첩 DO 빈칸(바깥 sy-index를 gv_dan에 담기) | ✅ |
| CH04-L07-S03 | CH04-L07 | fill-blank | (등재 보완) 구구단 3단계 범위 반복 빈칸(pa_from~pa_to·횟수 계산) | ✅ |

## B. 엔진별 집계 (카테고리 현황 — 같은 종류 몇 개·어디서)
| 엔진 (embeds/_engine/) | 그룹 | 공통/standalone | 사용 인스턴스 | 비고 |
|---|---|---|---|---|
| step-debugger | 12 | 공통(_engine)·config 주도 ✅ | CH04-L01·L05·L06·CH05-L01-S01/S05·CH05-L05·CH10-L07·**CH06-L01-S01·L03-S01/S02·L04-S01/S02** (완료) | `.stepper-config` 트레이스(주도형·하이픈키 ls_x-y OK). **CH06 확장**: vars 항목에 `itab:{cols,num}` 주면 값(2차원 배열)을 행 미니테이블로 렌더(new/chg 플래시·num 우측정렬)·steps[i].focus={key:행번호}로 현재 행 강조·키워드 TRANSPORTING/BINARY/ASSIGNING/COLLECT/SUM 등 추가·다크 .note 오버라이드 추가 |
| fill-blank | 5 | 공통(_engine)+_autoheight ✅ | CH02-L06-S01·CH04-L02-S01·CH04-L07-S01/S02/S03 (전부 완료) | 데이터=마크업 |
| before-after | 6 | 공통(CSS-only)+_autoheight ✅ | CH02-L01-S01·CH02-L05-S01·CH04-L04-S04·CH05-L01-S06·CH05-L01-S07·CH07-L03-S01 (완료) | 콘텐츠 정리 · 중립 톤(tone-warm/cool)·.note·.cmt·메모리 도형(칩/미니)·확장 접기·.solo(단일 칼럼 pain-only) 추가 · constant-circle-sim(폐기) 대체 |
| var-box | 2 | 공통(_engine)+_autoheight ✅ | CH02-L01-S02·CH02-L02-S01 | VB_CFG 주도 · 타입 라벨 박스+값 쪽지·선언 직후(기본값)→대입→재대입(value2 opt-in·"마지막 값만 기억") 사이클·initialFor(string/c/n/d/t/p-dec) 처리 |
| text-symbol-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH02-L06-S02 | TSL_CFG 주도 · 등록/미등록 seg×KO/EN seg→Text Elements 표 mock+출력 2줄 비교·미등록: TEXT-nnn=빈칸(bad dashed)·literal(nnn)=fallback(amber)·verdict ok/warn(교훈3)·근거 abentext_symbols.htm·토큰/color-mix만 · 다크 |
| len-shape-grid (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH02-L03-S01 | LSG_CFG 주도 · C/N 칸 그리드(패딩·잘림·앞0 자동채움)+P 바이트 칸(1칸=2자리·부호 반 칸=2×len−1·DECIMALS 점)+offset 패널(칸 하이라이트·범위초과 bad·부분쓰기 교체)·msg base 중립+ok/bad 명시(교훈3)·토큰/color-mix만 · 다크 |
| type-stamp (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH02-L04-S01 | TS_CFG 주도 · TYPES 도면 카드(점선·0바이트)→DATA 실물 박스(실선·값)·DECIMALS 세그→전 변수 동시 갱신 flash·타입 대입 시도→bad·verdict base 중립+ok/bad 명시(교훈3)·토큰/color-mix만 · 다크 |
| ddic-layer-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH03-L02-S01 | DLB_CFG 주도 · Domain 카드(기술·brand)→상속 케이블→DE 카드 2(의미·accent)+화면 미리보기(라벨=DE·칸수=Domain)·길이 토글→전층 동시 flash·직접 TYPE 시도→bad·verdict base 중립(교훈3)·토큰/color-mix만 · 다크 |
| param-screen-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH03-L03-S01 | PSL_CFG 주도 · 타입 세그(DE/표준 타입)→라벨·F4 온오프·VALUE CHECK 토글=고정값 검증 분리(F4≠검증·raw 모드 disabled)·F4 팝업=고정값 목록·OBLIGATORY 빈값 차단·DEFAULT 미리채움·LOWER CASE off 시 대문자 변조 경고·실행→WRITE mock·out base 중립(교훈3)·토큰/color-mix만 · 다크 |
| share-vs-local | 1 | 공통(_engine)+_autoheight ✅ | CH05-L02-S02 (완료) | SVL_CFG 주도 — 정의 공유(DDIC) vs 복제(Local) 비교 보드·필드 추가 토글·참조 곡선 |
| struct-viz | 4 | 공통(_engine)+_autoheight ✅ | CH05-L01-S02~S04·CH05-L02-S01 | SV_CFG 주도 · 트리(root/kind/comps·초기값 유도·assign 인터랙션) + layout:'strip'(타입=값 없는 헤더 스트립·변수=정렬 행들 — 타입은 값 없음 명시, 사용자 피드백 2026-07-03) |
| move-mapping (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH05-L04-S01 | MM_CFG 주도 · src/tgt 카드·같은 이름=초록 복사 flash·원본-only=주황 무시·대상-only=잔존(빨강 stale 함정)·CLEAR 먼저 토글→ok/warn verdict(교훈3)·classic 전용(FMB는 modern이라 미재사용)·토큰만 · 다크 |
| struct-reuse-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH05-L03-S01 | SRB_CFG 주도 · 3모드 세그(중첩=amber 하위/INCLUDE=good 점선 펼침/APPEND=잠긴 표준+accent 확장)+접근 경로 칩+선택형 퀴즈(정오 good/bad+why)·토큰만 · 다크 |
| syntax-toggle-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH01-L03-S01 | STL_CFG 주도 · 코드 패널(행번호·kw/cmt 토큰색)+토글 4(마침표/별표 위치/인라인 */소문자)→구문 램프 ok/bad+원인 목록·이름 풀 정훈영(R9)·코드 base=var(--surface) 틴트 · 다크 |
| diff-mapper | 2 | 공통(_engine)+_autoheight ✅ | CH18-L06·L07 (완료) | 데이터=마크업(data-link/title/desc) · classic/modern 중립 톤 추가 |
| inline-decl-judge (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH18-L01-S01 | IDJ_CFG 주도 · 문장 카드 4종(READ/LOOP/계산/SELECT) 허용/보류 판정·계산 카드 DATA()/FINAL() 토글→재대입 ok/bad · 다크 |
| value-builder (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH18-L02-S01 | key 토글·작업 버튼(make/base/replace/forgen/dup)→VALUE 식·결과 테이블(new 강조)·BASE 유무·중복 key 오류 · 다크 |
| field-mapping-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH18-L03-S01 | FMB_CFG 주도 · 원본/대상 필드 매핑표(자동/MAPPING/EXCEPT/초기값 배지)·MAPPING/EXCEPT 토글→CORRESPONDING 코드·원본only 버려짐 · 다크 |
| read-vs-tabexpr (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH18-L04-S01 | RVT_CFG 주도 · id 세그·데이터테이블(hit)·4 method 카드(READ TABLE/tab[ ]/line_exists/line_index)·없으면 예외(bad) · 다크 |
| string-template-composer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH18-L05-S01 | STC_CFG 주도 · mode(concat/template)·fmt(raw/user) 세그→코드/결과·substring 입력(범위초과 bad)·코드 base=var(--surface)로 틴트 다크 유지 · 다크 |
| sql-modernize-stepper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L01-S01 | SMS_CFG 주도 · stage 세그(classic/콤마/@/INTO 뒤로)→코드 변환(hl·esc 강조)·carr 세그(LH/AA/ZZ)→결과 카드(subrc 0/4·dbcnt)·표기 무관 결과 동일·base=var(--surface) · 다크 |
| host-escape-inspector (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L02-S01 | HEI_CFG.operands 주도 · op 세그(ABAP변수/식/DB컬럼/리터럴)×esc 세그(@ on/off)→WHERE 조건 렌더(col/esc/bad 강조)·정오 판정(correctOn=ABAP값만)·식=@( )·lossless·base=var(--surface) · 다크 |
| inline-target-viewer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L03-S01 | ITV_CFG 주도 · list 세그(*/2필드/계산/계산+AS)→행 구조 chips(이름없음=noname red)·tgt 세그(@DATA/DATA/@기존)→verdict(badEscape/existing/ok)·계산 alias missing 경고·standard+empty key·base=var(--surface) · 다크 |
| sql-expression-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L04-S01 | SEL_CFG.modes 주도 · mode 세그(CASE/CAST/COALESCE)×impl 세그(DB식/ABAP LOOP)→코드(fn·AS 강조)+결과 테이블(out 컬럼 teal·null 빨강·repl amber)·위치 배지(db/abap)·mode별 note·base=var(--surface) · 다크 |
| sql-function-workbench (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L05-S01 | SFW_CFG 주도 · fn 세그 7종(CONCAT/SUBSTRING/UPPER/LOWER/LENGTH/DATS_ADD_DAYS/DATS_DAYS_BETWEEN)→코드+결과·SUBSTRING pos(1-기반)/len 입력→범위밖 bad+SQL↔ABAP off 비교행·DATS_ADD_DAYS days·base=var(--surface) · 다크 |
| itab-sql-console (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L06-S01 | ICS_CFG 주도 · 원본 테이블 + op 세그(WHERE/ORDER BY/GROUP BY)×impl 세그(SELECT@itab/LOOP·SORT·COLLECT)→코드(fn·esc·as 강조)+결과 테이블(res teal·agg)·위치 배지·op별 note·base=var(--surface) · 다크 |
| concert-agg-join-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH19-L08-S01 | CAJL_CFG 주도 · zconcert/zbooking 원본+cond 세그(취소제외 ON/WHERE)×coal 세그(COALESCE 0/SUM)→aggregate()로 결과 테이블 계산(C003 ON=kept/WHERE=소멸·null↔0·FULL/OPEN)+코드 hot 강조+note good/warn·이름 풀(R9)·base=var(--surface) · 다크 |
| visibility-gate-sim (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L02-S01 | VGS_CFG.members 주도 · mem(데이터/메서드)×vis(PUBLIC/PROTECTED/PRIVATE)×caller(외부/자기/자식)→ALLOW 표로 접근 verdict(ok/bad=syntax)+kind별 캡슐화 advice(warn/ok)+접근 매트릭스(cur 강조)·base=var(--surface) · 다크 |
| constructor-timeline (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L03-S01 | CTL_CFG.presets 주도 · 액션 버튼(객체1/객체2/정적호출/리셋)→ctorCount(객체별++)·classCtorCount(최초 1회)·classInit 게이트→실행순서 타임라인(stat/inst/skip/state)+카운터+객체 카드(mv_concert/perf/cap)·base=var(--surface) · 다크 |
| selector-trainer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L04-S01 | ST_CFG 주도 · left(class/ref)×sel(=>/->)×mem(static/instance) 세그→호출 조립 코드+verdict(ok/bad/warn). 규칙: => 클래스만·-> 참조만, class=>instance 오류, ref->static warn(공식 ABENCLASS_COMPONENT_SELECTOR 허용·Clean ABAP 권장X)·base=var(--surface)·3색 verdict base 중립rgba+.ok 명시(교훈3) · 다크 |
| interface-contract-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L05-S01 | ICB_CFG.classes 주도 · 계약 보드(intf 카드+클래스 카드 sel/miss)+cls 세그×impl 세그(구현됨/누락)→인터페이스 참조 코드+out(ok 다형성 다른 출력/bad 활성화 실패)·intf 보라(#7c3aed)·base=var(--surface) · 다크 |
| exception-flow-console (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L06-S01 | EFC_CFG 주도 · seats 세그(정상2/초과100, remaining 40)×order 세그(구체/cx_root 먼저)→코드(cx_root 먼저 시 구체 handler dead)+실행 흐름 li(ran/raise/caught/skip)+verdict(ok 정상/bad 실패처리/warn 순서문제)·3색 verdict base 중립rgba+.ok 명시(교훈3)·base=var(--surface) · 다크 |
| dynamic-type-inspector (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L08-S01 | DTI_CFG 주도 · obj 세그(일반/VIP)×op 세그(CAST/CASE TYPE OF)→정적/동적 타입 패널+코드(hit 강조)+verdict(CAST: VIP ok/일반 bad=CX_SY_MOVE_CAST_ERROR; CASE TYPE OF 항상 ok 안전분기)·base 중립rgba+.ok/.bad 명시(교훈3)·base=var(--surface) · 다크 |
| event-wiring-panel (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH20-L09-S01 | EWP_CFG.handlers 주도 · 발행 박스(lo_mgr EVENTS)+handler 박스(등록 토글 on/off)·매진발생/리셋 버튼→RAISE EVENT 시 reg된 handler만 로그 호출(raise/call/none/warn)·다중 handler 순서 미보장 경고·prim 버튼 base=var(--surface) · 다크 |
| salv-control-panel (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L01-S01 | SCP_CFG.rows 주도 · 토글(func/sort/filter/bad)→코드 라인 on/off·bad 강조+표(sort 정렬·filter STATUS=C hidden·stat-c/f 색)+status(ok/bad)·필드명 오타→컬럼 못찾음·base=var(--surface)·3색 status 교훈3 패턴 · 다크 |
| salv-layout-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L02-S01 | SLL_CFG 주도 · striped/opt 토글+text 세그(none/long/all)+bad 버튼→코드 라인 on/off+표(striped zebra·opt clip 해제·CAPACITY 헤더 정렬 renamed)+status(ok/warn long만/bad cx_salv_not_found)·교훈3 3색·base=var(--surface) · 다크 |
| fieldcat-builder (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L03-S01 | FCB_CFG 주도 · 액션 버튼(MANDT no_out/SEATS do_sum/STATUS just/PERF_NO key/문자합계 warn/오타 bad/리셋)→attr per 컬럼→fcat 테이블(set teal)+preview 테이블(no_out 숨김·just 정렬·do_sum Σ행·key 강조)+status(ok/warn/bad 교훈3)·카탈로그≠DB·base=var(--surface) · 다크 |
| cell-color-microscope (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L04-S01 | CCM_CFG.rows 주도 · 버튼(①compute ②connect/typo/reset)·st(computed/connected/typo)→표(매진 full 막대·SEATSOCC armed 테두리→painted 빨강)+scol 패널(cellcolors 내용)+status(없음/warn 연결전·bad/warn 오타·ok 연결)·교훈3 3색·base=var(--surface) · 다크 |
| cell-style-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L05-S01 | CSB_CFG.rows 주도 · 버튼(①apply ②connect/reset)·st(applied/connected)→표(armed→cell-disabled 🔒/cell-enabled 편집테두리/cell-button .btn)+styl 패널(cellstyles fieldname)+버튼 클릭→info(CH27 경계)·status(warn 연결전/ok/info)·base=var(--surface) · 다크 |
| refresh-shake-comparator (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L07-S01 | RSC_CFG 주도 · opt 토글(is_stable row/col·i_soft_refresh)→코드 on/off + 실제 스크롤 div(40행)·act(28행 scroll/데이터 갱신 refresh/구조 변경/리셋)→stable row면 scrollTop 보존 ok/아니면 0 warn·구조 변경 bad 재초기화·target/mark 강조·scroll-behavior smooth 제거(교훈4)·base=var(--surface) · 다크 |
| concert-alv-color-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH21-L08-S01 | CACL_CFG.rows 주도(capstone) · sel 세그(회차)+act(+1/+5 예매·ctab 끄기·리셋)→added per row·leftOf=cap-booked·colorOf(≤0 red/≤5 yellow)→표 셀 left-red/left-yellow·예매 추가→색 변화·ctab off→색 제거 warn·status ok/warn·base=var(--surface) · 다크 |
| cds-activation-observer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L01-S01 | CAO_CFG 주도 · 5단계 레일(table/ddl/activate/preview/consume)+오타 토글→ok()면 Active·Preview(원본=CDS 행수 eq 배지)·SELECT FROM ZI_·아니면 활성화 실패+Preview/SQL blocked·status inactive/active/fail(교훈3 3색)·step base=var(--surface)·active=var(--brand)·DDL 영역 태그 · 다크 |
| projection-layer-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L02-S01 | PLL_CFG.fields 주도 · 필드별 inBase(ZI 포함/제거)·inProj(ZC 노출/숨김) 토글·key 잠금→ZI 칩(inBase)/ZC 칩(exposed)+DDL(as projection on)+SELECT 라이브·ZC 숨김=비파괴(ZI 불변)·ZI 제거=연쇄(proj 노출불가 disabled+warn)·toggle base=var(--surface) · 다크 |
| association-path-simulator (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L03-S02 | APS_CFG(concerts/perfs) 주도 · 공연 세그+토글(expose/keepId/cardinality/joinView)→src 카드(선택 공연·concert_id hl)+tgt 카드(_Perf 회차들/blocked)+DDL(association/[card]/$projection·gone 취소선)+JOIN 보기(CH13 INNER JOIN). 메시지 우선순위 bad(concert_id 제거 ON source)>warn(노출 off)>warn([1..1]↔여러 회차)>ok·교훈3(base 중립 rgba·ok/warn/bad 명시)·seg base=var(--surface)·active=var(--brand) · 다크 |
| annotation-effect-preview (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L04-S01 | AEP_CFG(labels/priceField/currencyField/order) 주도 · 3패널: ①label 토글→헤더 dt(기술 UPPERCASE↔업무라벨) ②@Semantics seg(currency_code/ticket_price/none)→code(자기참조 .bad span)+verdict ok/bad/warn(교훈3 base 중립rgba) ③lineItem ▲▼ 순서→position (i+1)*10 재할당+컬럼 미리보기·toggle base=var(--surface) · 다크 |
| metadata-extension-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L05-S01 | MXL_CFG(entity/base/fields pos) 주도 · 토글 3(uiLoc inline/ext·allow·sep ;/,)→DDL 파일(@Metadata.allowExtensions·inline 시 @UI.lineItem interleave)+DDLX 파일(annotate entity with·요소 뒤 sep·ext일 때만)·status: ext+!allow=bad·ext+sep,=bad(sep-bad span)·ext+;+allow=ok·inline=중립 base(교훈3)·활성화 badge act/fail·toggle base=var(--surface) · 다크 |
| dcl-auth-comparator (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L06-S01 | DAC_CFG(entity/users auth/concerts venue) 주도 · 사용자 seg+PFCG 배지·mode 토글(CHECK/NOT_REQUIRED)→DCL+@AccessControl code+SELECT code+결과 표(CHECK=venue∈auth만·NOT_REQUIRED=전부·권한밖 행 .unauth rgba 빨강+tag)·verdict: NOT_REQUIRED+leak=bad/CHECK=ok(0건도 정상)·교훈3 base 중립rgba·seg base=var(--surface) · 다크 |
| rap-layer-assembler (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L01-S01 | 데이터 내장 · 6계층 토글(root/proj/bdef/pool/svcdef/svcbind)→스택(present/missing·DB Table 고정)+verdict(누락 계층별 막히는 사용자 행동 ul·다 채우면 ok)·교훈3 base 중립rgba ok/warn·tog base=var(--surface) · 다크 |
| root-entity-picker (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L02-S01 | 데이터 내장(ENT concert/perf/booking) · 후보 카드 선택→행동(ACTIONS belong/stray)+key 후보(ok/bad why)→define root view entity code+verdict(booking+ok key=ok·non-booking=warn·bad key=bad 교훈3)·설계 판단 훈련·card/key base=var(--surface) · 다크 |
| rap-booking-runtime (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L09-S01 | (capstone) 데이터 내장(CAP 10) · create(좌석2 ok/12 over)→determination status=N+validation(seats vs remaining)→save/reject·bookings 표+취소(action→status C·중복 disabled/no-op warn)·실행 타임라인(create→det→val pass/fail→save/reject node)·failed/reported 패널(reject 시)·잔여 라이브·msg ok/bad/warn(교훈3)·btn base=var(--surface) · 다크 |
| cloud-readiness-judge (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L08-S01 | 데이터 내장(CARDS 5 binary) · 시나리오 카드 Cloud-ready/제한됨 판정→sel-ok/sel-bad+why+제한 시 대안 chip+score(전부 ok/일부 warn 교훈3)+classic vs cloud split(static HTML)·opt base=var(--surface) · 다크 |
| vda-classifier (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L07-S01 | 데이터 내장(CARDS 4) · 상황 카드 V/D/A 분류→sel-ok/sel-bad+why 피드백+score(전부정답 ok/일부 warn 교훈3)+실행 타임라인(req→det modify→val save→commit·action 별도 lane·legend D파랑/V앰버/A초록)·opt base=var(--surface) · 다크 |
| service-exposure-board (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L06-S01 | 데이터 내장(TYPES v4ui/v4web/v2ui) · expose 토글+binding type seg+active 토글→Definition SDL code+Binding 카드(kind UI/Web API)+$metadata chip(expose&&active만)·verdict 4분기(ok·expose+!active warn·!expose+active warn·둘다 off warn 교훈3)·seg base=var(--surface)·tog base=var(--surface) · 다크 |
| behavior-pool-tracer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L05-S01 | 데이터 내장(BK 3건) · 4 step 순서 의존(request keys 3행→read 집합→check seats vs remaining B002/B003 fail→record failed/reported)+eml 토글(loop 안 EML warn)·panel 누적·msg 단계별 ok/warn(교훈3 base 중립rgba)·fail 행 rgba 빨강·step done=#eef2ff · 다크 |
| bdef-contract-editor (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L04-S01 | 데이터 내장(OPS create/update/delete) · op 체크→소비자 행동 able/unable+토글3(table zbooking/zconcert·lock·keyRO)→BDEF 코드(managed implementation·define behavior·persistent table·lock master·field readonly·mapping)·verdict table 불일치=bad/lock off·key 수정가능=warn/ok(behavior pool 안내 교훈3)·tog base=var(--surface) · 다크 |
| projection-contract-checker (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH23-L03-S01 | 데이터 내장(FIELDS·created_by 감사) · 토글3(contract/projRoot/allowExt)+필드 칩(shown/hidden·key 잠금)→ZI 카드+ZC DDL(provider contract·define root view)+payload chips·verdict !projRoot=bad/!contract=warn/ok(숨김 필드 안내)·교훈3 base 중립rgba·tog base=var(--surface) · 다크 |
| cds-builder-stepper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH22-L07-S01 | (capstone) CBS_CFG(concerts) 주도 · 6 step 버튼(ziPerf/ziConcert/zcConcert/mdext/preview/consume)→st 의존 검사(ziConcert needs ziPerf·zcConcert needs ziConcert·mdext needs zcConcert·preview needs zi&zc·consume needs zc)→어기면 msg bad/ok·산출물 4 art(ZI_Perf/ZI_Concert/ZC_Concert/DDLX) active opacity·preview ZI/ZC 표 행수 eq 배지·consume SELECT FROM ZC·리셋·도전과제 ul·msg base 중립rgba ok/bad(교훈3)·step done=#eafaf3 · 다크 |
| select-query-simulator | 1 | 공통(_engine)·자체 postHeight ✅ | CH08-L02-S01 | config 주입(SQL_CFG) · #N1 주석 CH19 정정 · **R6: 상태줄 lines( ) 제거(sy-subrc·sy-dbcnt만)** · 위젯 라벨 GT_PERSON 통일 · (CH12-L07은 SELECT-OPTIONS 전용 신규엔진로 분리) |
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
| init-default-injector (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L02-S01 | IDI_CFG 주도 · INITIALIZATION(1회 보존) vs OUTPUT(매번 덮어쓰기) 기본값 차이·모드 토글 · 다크 |
| screen-modify-panel (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L03-S01 | SMP_CFG 주도 · OUTPUT의 LOOP AT SCREEN/MODIFY SCREEN·변수 변경≠화면 반영(stale)·active 토글 · 다크 |
| validation-gate-console (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L04-S01 | VGC_CFG 주도 · 시나리오 검증→MESSAGE E(class·&1&2)·sy-msg* 표·START 잠금/통과 · 다크(chip base=surface) |
| select-start-gate (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L05-S01 | SSG_CFG 주도 · 검증 게이트→START-OF-SELECTION SELECT·조건별 결과·sy-subrc·이벤트 타임라인 · 다크 |
| legacy-event-reader (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L06-S01 | LER_CFG 주도 · 리포트 3종 시나리오 세그·이벤트 타임라인·조회/표시 위치맵·공식 obsolete 배지·비-LDB 필수 오해 경고 · 다크 |
| dual-gate-auth-check (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L07-S01 | DGA_CFG 주도 · 케이스 세그→존재(SELECT SINGLE)→권한(AUTHORITY-CHECK) 2관문 파이프·검증 상세(DB hit·subrc)·존재/권한 실패 색·문구 분리 · 다크 |
| selscreen-reaction-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L08-S01 | SRL_CFG 주도 · 4탭(ON BLOCK 날짜검증·RADIO·F1·F4) 인터랙션→이벤트 콘솔(dynpro PAI/POH/POV·ABAP event·F4목록 클릭→필드 운반 안내) · 다크 |
| selscreen-layout-builder (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L09-S01 | SLB_CFG 주도 · 가짜 선택화면 미리보기(프레임·체크박스·라디오·본문버튼·툴바)→버튼 클릭 SSCRFIELDS-UCOMM·sy-ucomm/COMMENT 판단 토글 경고 · 다크 |
| option-switchboard (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L10-S01 | OSB_CFG 주도 · SELECT-OPTIONS 옵션 4종 토글→화면 미리보기·내부 selection table 첫 행(disp 대소문자)·복수선택 표시·NO INTERVALS&!NO-EXTENSION caveat · 다크 |
| selscreen-call-variant (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L11-S01 | SCV_CFG 주도 · 표준화면(1000)→고급조건→보조화면(1100) modal CALL·Execute/Cancel→sy-subrc 0/4·Variant 칩 불러오기(유효/무효) · 다크 |
| report-run-simulator (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH15-L12-S01 | RRS_CFG 주도 · CH15 캡스톤·시나리오 칩+so_stat 세그→▶실행→4 event 타임라인(pass/fail/lock)·검증 막힘 메시지·결과 ALV테이블/0건 S메시지 · 다크 |
| salv-grid-simulator | 2 | 공통(_engine)·자체 postHeight ✅ | CH11-L02-S01·CH11-L06-S01 (완료) | config 주입(SALV_CFG: itab·cols·data·sumKey·code) · ALV제목/토글 엔진설정 |
| relationship-map | 1 | 공통 | _(미작성)_ | CSS-only |
| state-change-grid | 2 | 공통(CSS-only)+_autoheight ✅ | CH06-L04-S03·CH06-L06-S01 | 스냅샷=마크업(gt_gugu 성장·정렬 / DELETE ADJACENT DUPLICATES 함정) · cell-new/cell-del 강조 · .note 추가(다크 자동) |
| mermaid | 6 | 공통(+_vendor)+_autoheight ✅ | CH04-L03-S01·L04-S02/S03·L05-S02/S03/S04 | 그래프=위젯 `.mermaid` 주입·CDN+로컬fallback·이벤트본 은퇴 |
| domain-builder | 1 | 공통(_engine) ✅ | CH03-L01-S01 | SE11 폼(단일사용·데이터 inline) · 예제별 target 강제(검사/활성화는 목표 일치 시에만) |
| input-help-priority | 1 | 공통(CSS-only)+_autoheight ✅ | CH09-L07-S01 | F4 사다리(콘텐츠=마크업·빈 .js 제거) |
| write-output | 1 | 공통 ✅ | CH01-L04-S01 | WRITE 출력 파서 · config 주입 · **버그수정(따옴표無→오류)** |
| write-format | 1 | 공통 ✅ | CH01-L05-S01 | WRITE 서식 토글 · config 주입 |
| event-lifecycle-buildup | 1 | 공통(_engine·자체 mermaid+CDN/_vendor)·자체 postHeight ✅ | CH15-L01-S01 | bespoke 단일사용(STAGES inline) · #C15-1 stage1 inline DATA→classic 수정 |
| se38-first-program | 3 | 공통(_engine) ✅ | CH01-L02-S01 | 개발루프 상태머신(bespoke·단일사용·데이터 inline) |
| se11-table-builder (신규) | 1 | 공통(_engine·STB_CFG)+_autoheight ✅ | CH07-L01-S01 | SE11 Transparent Table 생성 시뮬 · config 주도(fields/key/de/builtin) · 검사→활성화 라이프사이클·배지(신규/검사/활성)·설계도↔물리테이블 split·키 연속성/DE 검증 · 다크 |
| se11-create-entries (신규) | 1 | 공통(_engine·CE_CFG)+_autoheight ✅ | CH07-L02-S01 | Create Entries 손입력 훈련기 · config 주도(key/clients/seed) · 키 중복 거부·값 미검증 경고·클라이언트 분리 · 다크 |
| se93-tcode-create | 3 | 공통(_engine) ✅ | CH01-L07-S01 | SE93 생성+명령창 실행(bespoke·단일사용) |
| case-branch-sim | 2 | 공통(_engine)+_autoheight ✅ | CH04-L04-S01 | CASE…WHEN 시뮬·config 주도·OR묶기 토글(bespoke 신규) |
| join-aggregate-visualizer | 1 | 공통(_engine)·자체 postHeight ✅ | CH13-L08-S01 | JOIN_CFG 주도 · LEFT/INNER 토글·GROUP BY SUM·ON 필터(취소 제외) |
| gui-alv-grid-simulator (신규) | 2 | 공통(_engine·ALVG_CFG)·자체 postHeight ✅ | CH17-L07·L10 (완료) | 단계 빌드업+그리드 · config로 steps/data/cols 주입 |
| container-bind-stepper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L01-S01 | CBS_CFG 주도 · 컨테이너 바인딩 3단계·이름 토글(CONT100/오타)→화면 도식 강조·go_cont initial→bound/fail·상태패널 · 다크 |
| alv-readiness-panel (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L02-S01 | ARP_CFG 주도 · 컨테이너→그리드 2단계+준비 체크리스트(ready/pending/fail)·i_parent 토글·"표 안 보이는 게 정상" 메시지 · 다크 |
| alv-data-query (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L03-S01 | ADQ_CFG 주도 · SELECT 시나리오 3종→sy-subrc/sy-dbcnt/행수 박스·lt_booking 미리보기·빈테이블 정상 S·전체조회 경고 · 다크 |
| fieldcat-editor (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L04-S01 | FCE_CFG 주도 · lt_fcat coltext/outputlen 편집 input→미리보기 헤더 라이브·fieldname 대소문자 토글(소문자→불일치 적용X warn) · 다크 |
| alv-layout-toggles (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L05-S01 | ALT_CFG 주도 · zebra/cwidth_opt/grid_title 칩+sel_mode 세그→미리보기(제목바·줄무늬·clip·선택컬럼) 라이브 · 다크 |
| alv-variant-store (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L06-S01 | AVS_CFG 주도 · report 토글·사용자별 Variant 카드(컬럼순서 chip)→열기 시 미리보기 순서 복원(moved th)·report 비움 경고/disabled · 다크 |
| alv-refresh-sync (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L08-S01 | ARS_CFG 주도 · 내부/화면 2테이블·change(내부만 stale)·scroll·plain refresh(맨위)/stable refresh(위치유지)·3체크(데이터변경/화면갱신/위치보존) · 다크 |
| alv-row-color-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH17-L09-S01 | ARC_CFG 주도 · seatsocc 편집→상태 badge·색코드 쓰기/info_fname 토글(good/bad)/표시→매진 행 색칠·3체크(색코드/필드명/표시) · 다크 |
| process-flow-pbo-pai (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH16-L01-S01 | PBO/PAI 두 박자 순환(클릭 진행) |
| dynpro-screen-elements (신규) | 1 | 공통(_engine)·자체 postHeight ✅ | CH16-L03-S01 | 화면 요소↔변수 + FctCode→OK_CODE 시연 |
| screen-painter-wiring (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L02-S01 | SPW_CFG 주도 · 4패널(Layout/Element List/Flow Logic/ABAP Source) 연결 지도·시나리오로 깨기→활성화 오류(MODULE 누락·이름불일치·OK field) · 다크 |
| pbo-prep-stepper (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L04-S01 | PPS_CFG 주도 · PBO 단계 스텝퍼(steps config)·잠금 토글·sy-dynnr/pfkey/title·LOOP AT SCREEN input=0 대기 vs MODIFY SCREEN 반영·미리보기 · 다크 |
| okcode-branch-lab (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L05-S01 | OBL_CFG 주도 · PAI 버튼→ok_code/save_ok/CLEAR/CASE 추적·CLEAR 생략 시 okReg 유지→Enter 재실행(reexec red)·EXIT=LEAVE PROGRAM · 다크 |
| toolbar-fcode-map (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L06-S01 | TFM_CFG 주도 · GUI status 툴바·잠금→EXCLUDING(SAVE disabled)·버튼→OK_CODE→CASE(handled/unhandled 경고)·TITLEBAR WITH·sy-pfkey/title · 다크 |
| screen-extension-designer (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L07-S01 | SED_CFG 주도 · 4탭(Custom Control container_name 매칭·Subscreen OK field 없음→main flow·Tabstrip activetab↔subscreen·Status Icon 상태) · 다크 |
| dynpro-form-simulator (신규) | 1 | 공통(_engine)+_autoheight ✅ | CH16-L08-S01 | DFS_CFG 주도 · CH16 캡스톤·화면0100 미리보기(좌석 입력)·툴바→PAI(OK_CODE/save_ok/CLEAR/CASE)·can_book 검증 S/E·LEAVE TO SCREEN0/PROGRAM·Enter 재실행방지 · 다크 |
| class-diagram (신규) | 3 | 공통(CSS-only)+_autoheight ✅ | CH20-L01·L07·L10 (완료) | UML 박스·인스턴스·상속 — class-object/inheritance/class-structure 통합 1엔진 |
| relationship-map | 1 | 공통(CSS-only)+_autoheight ✅ | CH22-L03-S01 (완료) | A→B 관계 카드(CDS Association) · 빈 .js 제거 · static-svg-architecture 은퇴 |

## C. 재배치 보류 (원본 sample/ 보존 · 정적 홈은 후속 신규)
| 원본 콘텐츠 | 적정 홈(후속) |
|---|---|
| before-after = N+1 쿼리 | CH13-L06 / 성능 |
| diff-mapper = SELECT 성능 | CH12·CH13 |
| relationship-map = HR/SD FK | CH09 / CH13 |
| static-svg = 풀스택 | CH31 / CH36 |
| sap-gui-sandbox = SE16N 조회 | CH07 / SELECT |
| mermaid = 이벤트 | (CH15에 더 우수본 있음 → 은퇴) |
