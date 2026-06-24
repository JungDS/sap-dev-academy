# Track 2 (CH24~36) 콘텐츠·체험·시각 보강 — 진행 원장

> 📅 최종수정: 2026-06-24 18:06 KST · 자동 작업(/loop goal) 진행 기록. **압축돼도 이 파일로 재개.**
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
| 24 | 실무 데이터 변경과 트랜잭션 제어 | 5 | 🔄 진행 |
| 25 | Lock Object와 동시성 제어 | 5 | ⬜ 대기 |
| 26 | OO ABAP 고급 설계와 패턴 | 5 | ⬜ 대기 |
| 27 | ALV 고급 Event 응용 | 5 | ⬜ 대기 |
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

### CH24-L02 · COMMIT / ROLLBACK (원자성)
- 계획: **체험=원자성 시뮬**(header INSERT + items INSERT, "항목 실패?" 토글 → COMMIT or ROLLBACK. 실패→ROLLBACK→둘 다 사라짐(반쪽저장 방지), 성공→COMMIT→둘 다 영속). **시각=전부 아니면 전무 도식**. 본문: 반쪽저장 위험, COMMIT/ROLLBACK, AND WAIT.

### CH24-L03 · DB LUW vs SAP LUW + Update Task
- 계획: **시각=SAP LUW 타임라인/시퀀스**(화면들→변경 모음(SAP LUW)→COMMIT WORK→update task 실행→DB LUW 기록) = mermaid sequence 또는 static-svg. **체험=언제 실행?**(IN UPDATE TASK 등록 후 COMMIT 전/후 실행여부 토글). 본문: 두 층, 타이밍, PERFORM ON COMMIT.

### CH24-L04 · 오류 로그와 재처리
- 계획: **체험=재처리 시뮬**(5건 배치 처리 중 일부 실패(중복키)→오류 테이블 적재→원인해결 후 재처리→성공). **시각=처리→실패수집→재처리 플로우**. 본문: sy-subrc 점검, BAL(SLG1, 정식 CH35-L05), 멱등성(MODIFY).

### CH24-L05 · 대량 변경 Package 처리
- 계획: **체험=패키지 커밋 시각화**(N건 진행바, 패키지크기 조절 → COMMIT 횟수·메모리 비움 시점 표시). **시각=단일 COMMIT vs 패키지 before-after**. 본문: 메모리 폭발 why, 재시작점, 크기 튜닝. 도전과제 유지·정비.
