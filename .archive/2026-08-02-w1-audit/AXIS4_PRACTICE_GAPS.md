# 축4 — 실무 갭 리포트 (W2)

> 산출: 2026-08-02 W2 감사. 발견 주체 = **Codex CLI**(읽기 전용 샌드박스 — 역할 한정: 갭 발견·결함 리포트만, 사용자 2026-07-29 확정). 본선 스팟 검증: "이미 있는 주제를 없다고 하는" 오류 3건 표본 대조(ST22·SOST·CL_BCS_CONVERT) — 전부 introduces 기준 정확, 본문 언급 인지도 정확.
> **발견만 — 커리큘럼 확장 여부·우선순위는 사용자 결정 사항.** 참고: "Adobe Forms/ADS" 항목은 갭이 아니라 **사용자 확정 배제**(2026-08-02, 라이선스·설치물 전제 기술 배제)다 — codex가 낮음으로 정직 기록한 것을 맥락 주석으로 남긴다.

---

기준: [.project-docs/09_CURRICULUM_LEDGER.md](C:/SAP/sap-dev-academy/.project-docs/09_CURRICULUM_LEDGER.md)의 §A 챕터 맵과 `content/abap/**.md`의 `introduces` 전체를 대조했다. 아래는 “갭 발견”만이며, 수정안이나 재배열 제안은 넣지 않았다.

| 심각도 | 주제명 | 왜 실무에서 만나는가 | 커리큘럼에 없다는 근거 |
|---|---|---|---|
| 높음 | 표준 업무 테이블 독해 패턴 | 첫 프로젝트에서 기존 리포트 수정 시 `MARA/MAKT`, `VBAK/VBAP`, `EKKO/EKPO`, `BKPF/BSEG/ACDOCA`, `KNA1/LFA1` 같은 표준 테이블을 바로 읽는다. 커스텀 테이블보다 표준 데이터 모델 추적이 더 먼저 나오는 경우가 많다. | §A에는 SFLIGHT와 커스텀 콘서트 모델, DDIC/FK/JOIN/CDS는 있으나 표준 모듈 테이블 독해가 없음. `introduces`에도 `MARA`, `VBAK`, `EKKO`, `BKPF`, `BSEG`, `ACDOCA` 계열 없음. |
| 높음 | Number Range / SNRO | 전표번호, 요청번호, 예약번호, 인터페이스 관리번호 등 신규 키 채번은 커스텀 개발 첫 과제에서 자주 나온다. 직접 `MAX + 1`을 하면 동시성 사고가 난다. | §A에는 Lock Object와 DML은 있으나 Number Range 없음. `introduces`에 `Number Range`, `SNRO`, `NRIV`, `NUMBER_GET_NEXT` 없음. |
| 높음 | Change Document / 변경 이력 추적 | “누가 언제 이 값을 바꿨나”는 운영 문의의 단골이다. 표준 변경 이력은 `CDHDR/CDPOS`, 커스텀은 Change Document Object로 설계하는 경우가 많다. | §A에는 감사필드 stamp와 RAP 변경 추적 필드는 있으나 classic Change Document 없음. `introduces`에 `CDHDR`, `CDPOS`, `SCDO`, `Change Document` 없음. |
| 높음 | 권한 운영 디버깅: SU53 / PFCG / SU24 | `AUTHORITY-CHECK` 코드는 배워도, 현장에서는 “왜 이 사용자만 안 되나”를 `SU53`, 역할, 권한 오브젝트 제안값과 연결해 봐야 한다. 첫 운영 수정에서 자주 부딪힌다. | §A에는 `AUTHORITY-CHECK`, DCL, RAP 권한이 있으나 SU53/PFCG/SU24 운영 흐름은 없음. `PFCG`는 CH23 본문/foreshadow에만 보이고 `introduces`에는 없음. `SU53`, `SU24`도 `introduces` 없음. |
| 높음 | 운영 장애 기본 트랜잭션: ST22 / SM21 / SM13 | 덤프, 시스템 로그, Update Task 실패는 “개발자 불러라”로 바로 넘어온다. 잡과 배치 입력보다 먼저 장애 원인 확인 능력이 필요할 때가 많다. | §A에는 ATC, Transport, Job, BAL은 있으나 ST22/SM21/SM13을 L3로 잡은 장이 없음. `ST22`, `SM13`은 본문 언급은 있으나 `introduces` 없음. `SM21` 없음. |
| 높음 | TVARVC 운영 파라미터 | 하드코딩 제거, 배치 기준일, 예외 플랜트/회사코드, 기능 on/off를 `TVARVC`로 빼 달라는 요구가 흔하다. 주니어 리포트 수정에서 바로 만난다. | §A에는 Selection Variant와 `MEMORY ID`는 있으나 TVARVC 없음. `introduces`에 `TVARVC` 없음. |
| 높음 | 이메일 발송 / SOST / CL_BCS | 배치 결과 통보, 오류 알림, 승인 요청 메일, 첨부 파일 발송은 리포트·인터페이스 개발에서 빈번하다. | §A에는 File, PDF, Background Job은 있으나 메일 발송 흐름 없음. `introduces`에 `CL_BCS` 메일 발송, `SOST`, `SO_DOCUMENT_SEND_API1` 없음. 단, `CL_BCS_CONVERT`는 PDF 바이너리 변환 본문에만 보임. |
| 중간 | Application Server 파일 운영: AL11 / Logical File Name | `OPEN DATASET`만 알아서는 운영 경로 확인, 권한, 논리 파일명, 서버 파일 업로드/다운로드 이슈 대응이 어렵다. 인터페이스 프로젝트에서 1년 내 자주 만난다. | §A에는 `OPEN DATASET`과 파일 재처리는 있으나 `AL11`, `FILE` 트랜잭션, Logical File/Path가 없음. `introduces`에도 해당 항목 없음. |
| 중간 | tRFC/qRFC/bgRFC 큐 모니터링 | RFC 호출 자체보다 `SM58`, `SMQ1`, `SMQ2`에 쌓인 큐 장애를 보는 일이 운영 인터페이스에서 흔하다. | §A에는 RFC와 SM59, RFC 예외는 있으나 tRFC/qRFC/bgRFC 큐 운영 없음. `introduces`에 `SM58`, `SMQ1`, `SMQ2`, `qRFC`, `bgRFC` 없음. |
| 중간 | IDoc 확장과 테스트 도구 | IDoc 기본 구조를 배운 뒤 실제로는 세그먼트 확장, user-exit/BAdI, WE19 테스트, WE02/WE05 추적을 만난다. 표준 IDoc 연동 프로젝트에서 빠르게 필요해진다. | §A에는 IDoc 3층 구조, ALE, BD87 재처리는 있으나 IDoc extension/test tooling은 없음. `introduces`에 `IDoc extension`, `WE19`, `WE02`, `WE05` 없음. |
| 중간 | AIF(Application Interface Framework) | S/4 프로젝트에서 인터페이스 오류 모니터링과 재처리 표준으로 AIF를 쓰는 곳이 많다. 주니어도 오류 원인 확인 요청을 받는다. | §A에는 BAPI/RFC/File, IDoc/ALE/Gateway는 있으나 AIF 없음. `introduces`에 `AIF` 없음. |
| 중간 | 통화·수량 참조 필드와 단위 변환 | 금액/수량 필드는 `CURR/QUAN` 참조 필드, TCUR/T006, 소수 자리, 단위 변환을 모르면 조회값이 틀려 보인다. MM/SD/FI 리포트에서 자주 발생한다. | §A에는 WRITE `CURRENCY` 출력과 CDS `@Semantics` 일부는 있으나 DDIC `CURR/QUAN` 참조 설계·단위 변환 L3가 없음. `introduces`에 `CURR`, `QUAN`, `T006`, `TCUR`, `CUNIT` 없음. |
| 중간 | SAP Memory / ABAP Memory | 트랜잭션 간 값 전달, `SUBMIT ... AND RETURN`, BDC/리포트 연계에서 `SET/GET PARAMETER ID`, `EXPORT/IMPORT TO MEMORY`를 만난다. | §A에는 Parameter ID 존재, `MEMORY ID`, `SUBMIT`은 있으나 SAP Memory/ABAP Memory 자체가 없음. `introduces`에 `EXPORT TO MEMORY`, `IMPORT FROM MEMORY`, `SAP Memory`, `ABAP Memory` 없음. |
| 중간 | SOAP Proxy / SOAMANAGER / SPROXY | Gateway/OData 외에도 레거시 기업 연동은 SOAP Proxy가 남아 있다. 외부 시스템 연동 유지보수에서 1년 내 만날 수 있다. | §A에는 RFC, BAPI, Gateway/OData, ADBC는 있으나 SOAP Proxy 없음. `introduces`에 `SPROXY`, `SOAMANAGER`, `Consumer Proxy`, `Provider Proxy` 없음. |
| 낮음 | Adobe Forms / ADS | 공공·대기업 출력물은 Smart Forms와 Adobe Forms가 혼재한다. 신규 S/4 출력 프로젝트에서는 Adobe를 요구받을 수 있다. | §A CH37에 오히려 “Adobe Forms/ADS 미소개”라고 명시됨. `introduces`에도 `Adobe Forms`, `ADS` 없음. |
| 낮음 | SAP Business Workflow | 승인, 결재, 구매 릴리스, 문서 상태 변경에서 Workflow 유지보수를 맡을 수 있다. 다만 ABAP 주니어 첫 업무보다는 특정 운영/확장 영역에서 만나는 편이다. | §A에는 RAP Action, Background Job, Output Control은 있으나 Workflow 없음. `introduces`에 `Workflow`, `SWDD`, `BOR`, `Work Item` 없음. |
| 낮음 | Web Dynpro ABAP / FPM | 오래된 ECC·초기 S/4 화면 유지보수에서 아직 남아 있다. 신규 교육의 중심은 아니지만 레거시 UI 수정에서는 갑자기 필요하다. | §A에는 Dynpro, ALV, Gateway/OData, RAP/Fiori는 있으나 Web Dynpro/FPM 없음. `introduces`에 `Web Dynpro`, `FPM` 없음. |
