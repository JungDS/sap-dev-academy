# Track 2 (CH24~36) 콘텐츠·체험·시각 보강 — 진행 원장

> 📅 최종수정: 2026-06-24 18:49 KST · 자동 작업(/loop goal) 진행 기록. **압축돼도 이 파일로 재개.**
> 🎯 Track 2(실무, CH24~36) 전 레슨을 초반부 골드 스탠다드(본문 1,500자±·섹션 5±·체험 1+·시각 동반) 수준으로 보강.

## 규칙·합의 (이 작업 한정 + 영구)
- **게이팅**: 후속 개념 선노출 금지(R15)는 **Track 1 기준만**. Track 2는 챕터 순서 영향 적음(독립 내용 많음). 단 **동일 챕터 내**에서 뒤 레슨 개념을 앞 레슨에 설명 없이 먼저 쓰면 안 됨. 불가피하면 **예외**: 한 줄 설명 + "자세히는 같은 챕터 Lx에서" 명시.
- **code-copy-block 헤더 = 오브젝트 유형별** (빌드 `CODE_LANGS` 매핑): ` ```abap `=ABAP · ` ```cds `=CDS View · ` ```bdef `=Behavior Definition · ` ```bimpl `=Behavior Implementation · ` ```service `=Service Definition · ` ```metadata `=Metadata Extension · ` ```dcl `=Access Control(DCL). **진행순서/흐름은 코드블록 금지** → mermaid/process-flow/static-svg로.
- **워크플로(레슨마다)**: ① MD에 "이 레슨에 넣을 디자인·체험·시각·퀴즈·데이터출력" **계획 먼저 기록** → ② 하나하나 정성껏 구현 → ③ `npm run build:abap` → ④ **브라우저(8141) 실제 검증** → ⑤ 커밋. **대충 금지.**
- **샘플 다양성**: 쓰던 것만 쓰지 말 것. 팔레트 = 퀴즈(ox/mini-exam/flashcards/drag-drop/card-sort/short-answer)·decision-tree·cheat-sheet-matrix·concept-storytelling·before-after·mermaid·process-flow·static-svg-architecture·relationship-map·state-change-grid·sample-data-table·interactive-data-chart·bug-hunt·step-debugger 등. 필요하면 신규 엔진/위젯 생성.
- **자료 보충**: NotebookLM(nlm CLI, 구 repo sapui5 챕터ID) + 로컬 ABAP Keyword Doc(C:\ABAP_DOCU_HTML, grep) + ABAP Cloud Keyword Doc.
- **체험 위젯**: `embeds/abap/CHnn-Lnn-Snn.html`(엔진 `embeds/_engine/`) ← `::embed CHnn-Lnn-Snn | 제목 | 높이::`. 현재 Track2 위젯 = 0.
- **챕터 단위 진행**, 챕터 시작 시 context ≥70%면 압축 후.

## 진행 현황
| CH | 제목 | 레슨 | 상태 |
|---|---|---|---|
| 24 | 실무 데이터 변경과 트랜잭션 제어 | 5 | ✅ 완료 (위젯5·엔진5) |
| 25 | Lock Object와 동시성 제어 | 5 | ✅ 완료 (위젯5·엔진4+mermaid+judge-quiz) |
| 26 | OO ABAP 고급 설계와 패턴 | 5 | ✅ 완료 (위젯5·엔진5) |
| 27 | ALV 고급 Event 응용 | 5 | ✅ 완료 (위젯5·엔진2: alv-events 4모드+alv-handler-wiring) |
| 28 | Editable Grid ALV와 입력 검증 | 6 | ⬜ 대기 |
| 29 | Enhancement / BAdI / User Exit | 5 | ⬜ 대기 |
| 30 | 인터페이스 실무: BAPI/RFC/BDC/File | 5 | ⬜ 대기 |
| 31 | IDoc / ALE / Gateway | 5 | ⬜ 대기 |
| 32 | 성능 분석과 튜닝 | 5 | ⬜ 대기 |
| 33 | AMDP / ADBC / Pushdown | 5 | ⬜ 대기 |
| 34 | Forms / Output / PDF | 5 | ⬜ 대기 |
| 35 | 운영 품질과 배포 관리 | 5 | ⬜ 대기 (CH35-L03 진행흐름 code-block 오용 → process-flow/mermaid로 교체) |
| 36 | RAP + Fiori 실무 Capstone | 7 | ⬜ 대기 |

---

## 레슨별 계획·결과 (챕터 진행하며 채움)

<!-- 형식:
### CHnn-Lxx · 제목
- 계획: 디자인/체험/시각/퀴즈/데이터출력 …
- 구현: 추가한 것 …
- 검증: 브라우저 확인 결과 …
- 이슈/결정: …
-->

## CH24 — 실무 데이터 변경과 트랜잭션 제어 (계획)
공통: 모든 레슨 본문을 왜→무엇→어떻게→주의→정리로 확장. 체험 1+·시각 동반. 게이팅 Track2(챕터 내 forward만 주의).

### CH24-L01 · DML 4종 + FROM TABLE + 감사필드 + 표준테이블 금지 ✅
- 구현완료: 본문 7섹션 확장 + 신규 엔진 `dml-playground` + `CH24-L01-S01`. 검증: INSERT/중복키오류/감사필드stamp/WHERE생략 전체삭제/ABAP echo 동작·콘솔0.
- 계획: **체험=DML 플레이그라운드**(ZBOOKING 미니 테이블에 INSERT/UPDATE/MODIFY/DELETE를 키·값 넣어 실행 → 행 변화+결과메시지. INSERT 중복키=오류, MODIFY=upsert, WHERE 없는 DELETE=전체삭제 경고). **시각=감사필드 자동 stamp 도식**(sy-uname/datum/uzeit). 본문: 읽기→쓰기 불편, 4종 차이 깊이, FROM TABLE, 감사필드 why, 표준테이블 금지 why. 퀴즈(선택): "이 상황엔 어떤 DML?" OX/단답.
- 신규 엔진: `dml-playground`(테이블 변이 시뮬, L02·L04·L05에도 변형 재사용 가능).

### CH24-L02 · COMMIT / ROLLBACK (원자성) ✅
- 구현완료: 본문 6섹션 확장 + 신규 엔진 `txn-atomicity` + `CH24-L02-S01`(미확정↔확정 2패널). 검증: 실패+COMMIT=반쪽저장(헤더만), 실패+ROLLBACK=DB깨끗, 성공+COMMIT=둘다·콘솔0.
- 계획: **체험=원자성 시뮬**(header INSERT + items INSERT, "항목 실패?" 토글 → COMMIT or ROLLBACK. 실패→ROLLBACK→둘 다 사라짐(반쪽저장 방지), 성공→COMMIT→둘 다 영속). **시각=전부 아니면 전무 도식**. 본문: 반쪽저장 위험, COMMIT/ROLLBACK, AND WAIT.

### CH24-L03 · DB LUW vs SAP LUW + Update Task
- 계획: **시각=SAP LUW 타임라인/시퀀스**(화면들→변경 모음(SAP LUW)→COMMIT WORK→update task 실행→DB LUW 기록) = mermaid sequence 또는 static-svg. **체험=언제 실행?**(IN UPDATE TASK 등록 후 COMMIT 전/후 실행여부 토글). 본문: 두 층, 타이밍, PERFORM ON COMMIT.

### CH24-L04 · 오류 로그와 재처리
- 계획: **체험=재처리 시뮬**(5건 배치 처리 중 일부 실패(중복키)→오류 테이블 적재→원인해결 후 재처리→성공). **시각=처리→실패수집→재처리 플로우**. 본문: sy-subrc 점검, BAL(SLG1, 정식 CH35-L05), 멱등성(MODIFY).

### CH24-L05 · 대량 변경 Package 처리
- 계획: **체험=패키지 커밋 시각화**(N건 진행바, 패키지크기 조절 → COMMIT 횟수·메모리 비움 시점 표시). **시각=단일 COMMIT vs 패키지 before-after**. 본문: 메모리 폭발 why, 재시작점, 크기 튜닝. 도전과제 유지·정비.

## CH25 — Lock Object와 동시성 제어 (계획)
다양성: 매트릭스·2세션 시뮬·퀴즈·타임라인·플로우차트로 골고루.

### CH25-L01 · Lock Object 설계 + 잠금 모드
- 계획: **체험=잠금 모드 호환 매트릭스**(보유 모드 E/S/X × 요청 모드 → 허용/거절 인터랙티브). 본문: 동시변경 문제, Lock Object 구성(Primary Table·Lock Argument), 모드, 활성화→ENQUEUE/DEQUEUE 생성. 엔진 `lock-mode-matrix`.

### CH25-L02 · ENQUEUE / DEQUEUE (센터피스)
- 계획: **체험=2세션 잠금 데모**(User A/B 패널 + 공유 잠금목록(SM12풍). A ENQUEUE 1001→성공, B ENQUEUE 1001→foreign_lock 거절, A DEQUEUE/COMMIT→B 가능). 본문: ENQUEUE 호출·foreign_lock·DEQUEUE·표준 5단계. 엔진 `enqueue-2session`.

### CH25-L03 · 해제·예외
- 계획: **체험=퀴즈("잠금은 언제 풀리나?")** — DEQUEUE/COMMIT/ROLLBACK/세션종료=풀림, SELECT/다른행=유지 OX 판별(변화 = 퀴즈 도입). 본문: 자동 해제, DEQUEUE_ALL, foreign_lock 정중거절, SM12, 장시간 잠금 주의. 엔진 `release-quiz`(범용 OX/판별 퀴즈).

### CH25-L04 · 충돌 시나리오 (Lost Update)
- 계획: **체험=Lost Update 타임라인 시뮬**(A·B 읽기/쓰기 순서 → A 갱신 소실. 전략 토글: Pessimistic=잠금으로 B 차단 / Optimistic=changed_at 비교로 거절). 본문: Lost Update, 낙관/비관, 타임스탬프 비교. 엔진 `lost-update-sim`.

### CH25-L05 · 통합 패턴
- 계획: **시각=안전 변경 5단계 플로우차트**(ENQUEUE→읽기→변경→COMMIT→DEQUEUE) = mermaid 엔진 재사용. 본문: 통합 패턴, 순서 주의. 도전과제 유지.

## CH26 — OO ABAP 고급 설계와 패턴 (계획)
패턴별 인터랙티브로 다양화. 게이팅: CH20(OO 기본) 전제, 챕터 내 forward 주의.

### CH26-L01 · Factory — 엔진 `factory-sim`
- 체험: type 선택(V=VIP/기타=일반) → 팩토리가 만든 **구체 클래스** 표시 + 호출부 코드 1줄 불변(`...=>create(type)`). without/with 대비.
### CH26-L02 · Singleton — 엔진 `singleton-sim`
- 체험: `get_instance()` ×N → **같은 인스턴스(동일 id)** vs `NEW` ×N → 매번 다른 id. 2열 비교.
### CH26-L03 · Strategy — 엔진 `strategy-sim`
- 체험: 요금 전략(일반/VIP/조기) 선택 + 좌석수 → 가격 계산, 호출부(checkout) 동일·전략만 교체. 새 전략=새 클래스(OCP).
### CH26-L04 · MVC — 시각 `mvc-diagram`(static-svg) 
- 체험/시각: Model/View/Controller 관계도 + "이 계층 바꾸면 영향 범위" 하이라이트(View 교체 시 Model 불변 등).
### CH26-L05 · ABAP Unit — 엔진 `abap-unit-runner`
- 체험: 테스트 메서드 목록 → Run → ✓/✗ + assert(act/exp). "버그 주입" 토글로 red 케이스. Mock=DB 없이. 도전과제 유지.

## CH27 — ALV 고급 Event 응용 (계획)
재사용 엔진 `alv-events`(mode 설정) 1개로 L01~L04, L05는 핸들러 배선 다이어그램.
- L01 double_click: 행 더블클릭 → on_double_click(e_row/e_column) 이벤트 로그.
- L02 hotspot: concert_id 링크 셀 → 단일 클릭 → on_hotspot(e_row_id→concert).
- L03 toolbar: 커스텀 버튼(ZCANCEL) 추가 표시(toolbar 이벤트).
- L04 user_command: 행 선택 + 버튼 클릭 → on_user_command(e_ucomm) + 선택행 취소·refresh.
- L05 핸들러 클래스: 이벤트→핸들러 메서드 SET HANDLER 배선 다이어그램(`alv-handler-wiring`), 도전과제 유지.
