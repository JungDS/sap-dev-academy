# 축6 — glossary·tcodes 품질 감사 (W1)

> 산출: 2026-08-02 W1 감사. 감수 = 20년차 페르소나 에이전트(282키 **전수** + tcodes 전수 + shell.js 렌더 경로 크로스체크) → 본선 검증 완료. **발견만 — 수정은 승인 후.**

## 요약
| 지표 | 값 |
|---|---|
| 확인 범위 | glossary 282키 전량 · tcodes 10 T-code/15 object 전량 · 팝업 렌더 경로(shell.js) |
| 문제 키 | glossary ≈76키 · tcodes 4건 |
| **사실 오류 [확실]** | 3건(+범위 한정 1, 추정 1) — 본선 검증 완료(전건 동의) |
| 규칙 위반 | R12(약어 풀스펠) 20키 · R5(내부 챕터ID 노출) 3키 |

## 사실 오류 (본선 검증 [확실])
1. **`내장함수` — `mod`는 내장함수가 아니라 산술 연산자.** CH04-L01 본문("MOD는 + - * /와 같은 갈래의 산술 연산자")과 정면 모순 — 같은 사이트가 두 곳에서 반대로 가르침. → desc에서 `mod` 삭제, `lines( )` 등으로 대체.
2. **`CDS View Entity` — "DB 계층에서 정의"는 오류.** ABAP Dictionary의 DDL source로 정의하며, classic DDIC 뷰와 달리 **DB에 대응 뷰가 생성되지 않는다**(런타임 해석) — 그게 view entity의 핵심 차별점.
3. **tcodes `SE21` pitfall — "$TMP(로컬)는 패키지가 아니라 이송 대상이 아닙니다."** 문장 파손 + 사실 오류($TMP는 이송 안 되는 *로컬 패키지*가 맞음) + glossary `$TMP` 항목과 자기모순.
4. (범위 한정 [확실]) **`Nesting`** — annotation 상속은 element 수준만(entity 수준 비상속, `@Metadata.ignorePropagatedAnnotations`로 차단 가능). "아래 뷰의 annotation은 위로 상속" 과일반화.
5. ([추정]) **`Database View`** — 단일 base table이면 maintenance status에 따라 쓰기 가능. "읽기전용" 단정 한 구절 보강 권장.

## R12 약어 풀스펠 결손 (대표)
- 🔴 **`CDS` = Core Data Services가 코퍼스 전체 0회** — 17개 항목이 쓰는 약어에 정의처 자체가 없음(`CDS` 단독 키 부재). 최우선.
- DDL(3항목)·SDL·DDLX·RTTI/RTTC·SPA/GPA·BAL(Application Log 항목 내)·NAST 유래(NAchrichten-STatus)·SSCRFIELDS 유래·OSQL·FM(RFC 항목)·LVC(4항목)·REST/CRUD(OData)·**SQL/DB 풀스펠 전역 부재**(Open SQL 항목이 첫 관문인데 미풀이).

## 렌더·구조 결함
- 🔴 **백틱 47키가 팝업에 백틱 문자 그대로 노출**(shell.js `esc()`→`innerHTML` 경로에 마크다운 변환 없음 — 렌더 실측). 처리 방향 결정 필요: desc에서 백틱 제거 vs 팝업에 인라인 코드 변환 추가.
- 🔴 **tcodes objects 사전 누락 5종 → 클릭 시 빈 팝업**(Transaction Code·개발 패키지·Area Menu·Import Queue·Transport Route). `개발 패키지`만 한글 칩(명명 일관성 깨짐).
- **SE37 dangling related ×2**(SE11·SE80의 related가 미정의 SE37 참조 — 죽은 칩).
- **R5 위반 — 내부 챕터ID 노출 3키**(`Open SQL`·`관통예제`·`RAP Projection View` — "CH19~" 식 표기, 리넘버 시 즉시 stale. 다른 항목들은 이미 "OO ABAP 기본 설계 장" 방식 사용 중).
- **중복 쌍**: `값 테이블`↔`Value Table`(정의 두 벌), `TABLES`↔`table work area`(**같은 레슨 CH16-L04에서 둘 다 마킹**), `Application Log`↔`BAL`(전자는 dead).
- **dead 키 9건**(마킹 0회): ABAP·디버거·주석·Local Object·MEMORY ID·MODIF ID·Application Log·비트·LUW. (역방향 패리티는 정상 — 마킹 273키 전부 정의 존재.)

## 비유(analogy) 문제 (대표)
- 🔴 **`Deep Structure`** — desc가 "중첩과 별개"라고 경고하는데 analogy("서류철 안 서류철")가 정확히 그 오개념을 심음. 교체 필수.
- **`Optimistic Lock`** — 기술 대응 어긋남(확인 대상은 "남이 데이터를 바꿨는가") + 소재 부적절(탈의실). 교체 권장.
- **`Cardinality`** — 1:1/1:다 표기가 ER식으로 읽혀 오답 확정("학생↔담임"은 ER로는 N:1).
- `Subquery` 인용부호 누락(문장 파손처럼 읽힘) · `CONSTANTS` "매직넘버"(미정의 전문어) · `WRITE`("print/console.log" — 비전공자에게 미지로 미지 설명) · 소재 중복 2쌍(콘센트·이체).

## 품질 미달 (대표)
- 순환 정의: `SE93`("T-code를 만드는 트랜잭션")·`Global Class`("전역 클래스를 전역 클래스로").
- 빈약(30～44자 한 구절): WATCH POINT·Smart Forms·NAST·Application Log·ST05·SAT·Background Job·ROLLBACK WORK·Module Pool·PBO.
- `파라미터` — 선언부/호출부 키워드 방향 뒤집힘(ABAP 최다 혼동 지점) 미구분. `고정값` — "되돌아온다" 문장 파손 의심.

## 즉시 수정 권고 상위 10 (감수 원안 — 본선 동의)
1. `CDS` 키 신설 + Core Data Services 풀스펠
2. `내장함수`에서 `mod` 제거
3. SE21 pitfall $TMP 문장 교체
4. tcodes objects 5종 추가(빈 팝업 해소)
5. `Deep Structure` analogy 교체
6. `CDS View Entity` desc 수정
7. 백틱 47키 처리(방향 결정 필요 — desc 정리 vs 렌더 변환)
8. 내부 챕터ID 3건 → 챕터 제목 표기
9. 중복 2쌍 통합
10. DDL·SDL·DDLX·RTTI/RTTC·SPA/GPA 풀스펠 보강
