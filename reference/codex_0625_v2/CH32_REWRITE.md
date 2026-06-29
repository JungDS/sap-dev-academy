# CH32_REWRITE - 성능 분석과 튜닝

> 기준 자료: `content/abap/CH32`, `reference/codex_0625/CH32_성능-분석과-튜닝.md`, `reference/codex_0625/00_QUALITY_REVIEW.md`
> 재집필 목표: 성능 문제를 "느낌으로 고치는 일"이 아니라 `측정 -> 원인 분류 -> 수정 -> 재측정 -> 운영 기준 기록`의 반복 가능한 절차로 가르친다.
> Classic-first 경계: 이 장은 Classic ABAP 시스템에서 자주 쓰는 ST05, SAT, SQLM/SWLT, Open SQL 튜닝, 대량처리 설계를 중심으로 다룬다. ABAP Cloud와 Clean Core는 "released API, RAP, CDS 기반 pushdown을 우선 검토한다"는 경계로만 언급한다.

## CH32 전체 강의 지도

CH31에서는 IDoc/ALE와 Gateway/OData로 시스템을 연결하는 방법을 배웠다. 그런데 연계가 동작해도 사용자가 "너무 느리다"고 말하면 개발자는 곧바로 코드를 바꾸면 안 된다. 느린 이유가 DB 접근인지, ABAP loop인지, 외부 RFC인지, 너무 많은 데이터를 한 번에 처리해서인지 먼저 증명해야 한다.

성능 튜닝의 출발점은 추측을 멈추는 것이다. "아마 index가 없어서 느린 것 같다", "LOOP가 많아서 그런 것 같다"는 말은 출발 가설일 수는 있지만 결론은 아니다. 튜닝은 실행 전 가설, 측정 결과, 수정 내용, 수정 후 수치를 한 묶음으로 남길 때 운영 가능한 작업이 된다.

| 레슨 | 주제 | 학습 초점 | 대표 확인 지점 |
| --- | --- | --- | --- |
| CH32-L01 | ST05 SQL Trace | 한 실행에서 비싼 SQL, 반복 SQL, DB 왕복을 찾는다 | `ST05`, SQL list, execution count, total time |
| CH32-L02 | SAT Runtime Analysis | ABAP 코드 블록별 runtime과 호출 빈도를 본다 | `SAT`, Hit List, ABAP time, DB time |
| CH32-L03 | SQL Monitor / SQLM | 운영 기간 전체에서 누적 비용이 큰 SQL을 찾는다 | `SQLM`, `SWLT`, total time, executions |
| CH32-L04 | SELECT in LOOP 제거 | 1+N DB 왕복을 JOIN/FAE/사전 조회로 줄인다 | `FOR ALL ENTRIES`, `READ TABLE`, `BINARY SEARCH` |
| CH32-L05 | 대량 데이터 처리와 Package 설계 | 메모리, lock, commit, pushdown, 병렬 기준을 나눈다 | package size, restart point, `GROUP BY`, aggregate |

수동 확인한 공식 근거는 세 묶음이다. Classic ABAP 문법은 `C:\ABAP_DOCU_HTML`에서 `abenwhere_all_entries.htm`, `abapread_table.htm`, `abapread_table_key.htm`, `abapsort_itab.htm`, `abapselect_aggregate.htm`, `abapgroupby_clause.htm`, `abapselect_clause.htm`를 직접 확인했다. ABAP Cloud와 RAP 경계는 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\abap-docs-main\docs\cloud\md\ABENABAP_CLOUD_GLOSRY.md`, `ABENRELEASED_API_GLOSRY.md`, `ABENABAP_RAP_GLOSRY.md`, `ABENARAP_GLOSRY.md`를 확인했다. ST05, SAT, SQLM/SWLT 같은 성능 분석 도구는 ABAP Keyword Documentation의 문법 영역 밖이므로 SAP Help Portal의 ST05 Performance Trace, ABAP Runtime Analysis, SQL Monitor/SWLT 문서를 보충 근거로 확인했다.

R15 기준으로 CH32는 Track 2 구간이다. CH06의 Internal Table과 `READ TABLE`, CH08/CH13의 Open SQL과 JOIN/FAE, CH18/CH19의 modern ABAP SQL, CH24의 package/commit 관점, CH31의 연계 운영 관점을 이미 배운 뒤다. 따라서 modern Open SQL 예시와 `FOR ALL ENTRIES`, `GROUP BY`, aggregate, 측정 도구를 함께 다룰 수 있다. CH33의 AMDP와 고급 pushdown은 이 장에서 이름과 판단 기준만 예고하고, 구현 문법은 다음 장으로 넘긴다.

## CH32-L01 - ST05 SQL Trace

### 왜 필요한가

사용자가 "예매현황 리포트가 느려요"라고 말하면 초보 개발자는 먼저 코드 전체를 훑거나 index를 추가하고 싶어진다. 하지만 성능 문제는 눈으로 코드를 읽는 것만으로 잘 보이지 않는다. 1초짜리 느린 SQL 한 번이 문제일 수도 있고, 1ms짜리 SQL이 10,000번 반복되어 문제일 수도 있다. 둘은 해결 방법이 완전히 다르다.

ST05 SQL Trace는 한 실행 안에서 실제 DB 접근이 어떻게 일어났는지 보는 도구다. 어떤 SQL이 실행되었는지, 몇 번 실행되었는지, 총 시간이 얼마나 걸렸는지, 몇 건을 읽었는지 확인한다. 이 레슨의 핵심은 "느린 SQL을 찾는다"가 아니라 "느린 이유를 분류한다"이다.

ST05를 쓰면 세 가지 질문에 답할 수 있다. 첫째, 한 SQL 자체가 느린가. 둘째, 같은 SQL이 반복되는가. 셋째, 가져오는 row 수가 너무 많은가. 이 세 질문에 따라 index 검토, WHERE 조건 점검, SELECT-in-LOOP 제거, 필요한 column만 조회 같은 조치가 달라진다.

### 무엇인가

ST05는 SAP GUI에서 실행하는 Performance Trace 도구다. SAP Help 기준으로 ST05는 report나 transaction의 database access, lock, RFC, table buffer 같은 활동을 trace file로 기록할 수 있다. CH32에서는 그중 SQL Trace 관점에 집중한다.

Trace 결과를 볼 때 입문자가 먼저 봐야 할 column은 다음과 같다.

| 항목 | 의미 | 판단 질문 |
| --- | --- | --- |
| SQL statement | 실행된 SQL | 어떤 table을 어떤 조건으로 읽는가 |
| Executions | 실행 횟수 | 같은 SQL이 반복되는가 |
| Total time | 총 소요 시간 | 전체 병목에서 차지하는 비중이 큰가 |
| Records | 읽거나 반환한 row 수 | 너무 많은 데이터를 가져오는가 |
| Identical/Redundant Selects | 동일하거나 불필요하게 반복된 SELECT | 한 번 읽어 재사용할 수 있는가 |

ST05의 중요한 특징은 "한 실행의 실제 DB 대화"를 보여 준다는 점이다. 그래서 특정 사용자가 특정 조건으로 실행한 느린 프로그램을 분석할 때 좋다. 반대로 운영 전체에서 지난 일주일 동안 가장 비싼 SQL을 찾는 용도는 L03의 SQLM이 더 적합하다.

### 어떻게 확인하는가

첫 번째 단계는 범위 좁히기다. `ST05`에서 Trace On을 하기 전에 대상 user, transaction, program, 실행 조건을 정한다. 운영 시스템에서 여러 사용자를 오래 trace하면 부하와 로그가 커질 수 있으므로 가능한 짧게, 재현 가능한 조건으로 실행한다.

두 번째 단계는 측정이다. Trace On을 누르고 대상 프로그램을 한 번 실행한 뒤 Trace Off를 누른다. 여기서 중요한 것은 "한 번 실행"의 조건을 기록하는 것이다. 선택 화면 값, 데이터 건수, 실행 시간대, 사용자, client를 남겨야 나중에 수정 전후 비교가 가능하다.

세 번째 단계는 Display Trace에서 정렬하는 것이다. 먼저 total time이 큰 SQL을 찾고, 다음으로 execution count가 큰 SQL을 본다. total time이 큰 단일 SQL은 index, WHERE 조건, join 방식, 반환 column을 점검한다. execution count가 큰 동일 SQL은 SELECT-in-LOOP 가능성이 높다.

네 번째 단계는 code 위치와 연결하는 것이다. Trace에 나온 SQL을 보고 해당 ABAP 코드의 SELECT 위치를 찾는다. 같은 table을 읽는 SELECT가 여러 곳이면 program name, line, SQL text, 조건 값을 함께 보며 실제 병목 지점을 좁힌다.

다섯 번째 단계는 재측정이다. 수정 후 같은 조건으로 다시 ST05를 실행하고 total time, execution count, records를 비교한다. "빨라진 것 같다"가 아니라 "동일 SQL 1,000회가 2회로 줄었고 총 시간이 870ms에서 40ms로 줄었다"처럼 기록해야 한다.

### 실수와 주의

가장 흔한 실수는 측정 없이 index부터 추가하는 것이다. Index는 읽기를 빠르게 할 수 있지만 쓰기 비용과 저장 공간을 늘릴 수 있고, S/4HANA 환경에서는 무분별한 secondary index 추가가 권장되지 않는 경우가 많다. ST05로 실제 SQL과 조건을 본 뒤 판단해야 한다.

두 번째 실수는 총 시간만 보고 실행 횟수를 놓치는 것이다. 한 번에 800ms 걸리는 SQL도 문제지만, 1ms SQL이 10,000번 실행되면 더 큰 병목이 된다. L04에서 다룰 SELECT-in-LOOP는 보통 execution count에서 먼저 드러난다.

세 번째 실수는 운영에서 trace를 오래 켜 두는 것이다. Trace는 분석 도구이지 상시 모니터링 도구가 아니다. 대상과 시간을 제한해야 한다. 장기간 누적 분석은 SQLM으로 넘긴다.

네 번째 실수는 한 번의 trace만 보고 결론 내리는 것이다. 성능은 데이터 분포와 조건에 따라 달라진다. 최소한 정상적인 대표 데이터와 문제가 재현되는 조건을 구분해서 측정해야 한다.

### 체험형 학습 설계

기존 체험물 `CH32-L01-S01`은 ST05 trace 결과 table을 정렬하면서 병목 SQL을 찾는 시뮬레이터다. 화면에는 SQL statement, 실행횟수, 총 시간(ms), 레코드 수가 표시되고, header를 클릭하면 해당 column 기준으로 정렬된다. 빨간 행은 총 시간이 가장 큰 SQL이다.

학습자는 먼저 `총 시간(ms)` header를 눌러 가장 비싼 SQL을 찾는다. 다음으로 `실행횟수` header를 눌러 같은 쿼리가 1,000회 실행된 행을 찾는다. callout 영역은 "같은 쿼리 1,000회 실행 - LOOP 안 SELECT 신호"라고 알려 준다. 마지막으로 "이 문제는 index인가, SELECT-in-LOOP인가"를 판단하게 한다.

이 위젯은 L04와 직접 연결된다. L01에서는 trace 결과를 읽는 데 집중하고, L04에서는 같은 1,000회 SQL을 `FOR ALL ENTRIES`나 JOIN으로 줄이는 방법을 배운다. 따라서 본문에서는 "정답을 아직 고치지 말고, 먼저 병목을 분류하라"는 피드백을 둔다.

확장 설계로는 `Trace On`, `프로그램 실행`, `Trace Off`, `Display Trace` 버튼을 단계별로 두는 방식이 좋다. 각 단계가 끝날 때 trace 상태가 `비활성`, `수집 중`, `수집 완료`, `분석 중`으로 바뀌고, 잘못된 순서로 누르면 "Trace Off를 하지 않으면 결과가 고정되지 않는다"는 피드백을 준다.

### 정리

ST05는 한 실행에서 DB 접근 병목을 찾는 도구다. total time, execution count, records를 함께 보고 느린 단일 SQL인지, 반복 SQL인지, 과도한 데이터 조회인지 분류한다. 운영에서 오래 켜 두는 도구가 아니며, 수정 후 같은 조건으로 재측정해야 한다. 다음 레슨에서는 DB가 아니라 ABAP 코드 자체가 시간을 쓰는지 SAT로 확인한다.

## CH32-L02 - SAT Runtime Analysis

### 왜 필요한가

ST05로 DB 접근을 봤는데 SQL은 괜찮아 보일 수 있다. 그런데 프로그램은 여전히 느리다. 이때 원인은 ABAP 코드 안에 있을 수 있다. 예를 들어 내부 테이블을 매번 linear search로 읽거나, 큰 table을 반복 정렬하거나, 불필요한 method 호출이 너무 많거나, 문자열을 비효율적으로 조립할 수 있다.

SAT Runtime Analysis는 ABAP 코드가 어디에서 시간을 쓰는지 보여 준다. DB trace가 "DB와 어떤 대화를 했는가"를 보는 도구라면, SAT는 "ABAP 실행 흐름 안에서 어떤 statement, method, function, block이 시간을 먹었는가"를 보는 도구다.

이 레슨은 ST05와 SAT의 역할을 구분하는 것이 핵심이다. DB 시간이 크면 ST05로 깊게 들어가고, ABAP 시간이 크면 loop, sort, internal table access, method structure를 본다. 도구를 구분하지 못하면 DB 문제가 아닌데 index를 만지거나, ABAP loop 문제인데 SQL만 들여다보는 일이 생긴다.

### 무엇인가

SAT는 Runtime Analysis 도구다. SAP Help의 ABAP Runtime Analysis 문서 기준으로 Hit List는 runtime을 많이 소비한 항목을 찾는 데 사용하고, net runtime이나 hit 수를 보며 프로그램이 어디서 시간을 쓰는지 확인할 수 있다.

SAT 결과를 볼 때 입문자가 먼저 봐야 할 항목은 다음과 같다.

| 항목 | 의미 | 판단 질문 |
| --- | --- | --- |
| Hit List | 시간이 큰 호출 또는 statement 목록 | 어디가 가장 많은 runtime을 쓰는가 |
| Net time / Own time | 해당 항목 자체가 소비한 시간 | 내부 처리 자체가 무거운가 |
| Total time | 하위 호출까지 포함한 시간 | 이 block 전체가 병목인가 |
| Hits | 호출 횟수 | 반복 처리 때문에 커졌는가 |
| ABAP/DB/System 비율 | 시간의 성격 | DB 문제인가, ABAP 문제인가, 외부/시스템 문제인가 |

SAT는 상대 비교 도구로 이해하는 것이 좋다. 측정 자체가 오버헤드를 만들 수 있고, 환경에 따라 절대 시간은 달라진다. 그래서 수정 전후를 비교할 때 같은 데이터, 같은 조건, 같은 측정 범위로 비교해야 한다.

### 어떻게 확인하는가

첫 번째 확인은 측정 variant다. 측정 대상 program, transaction, user, statement 범위를 정한다. 너무 넓게 잡으면 결과가 많아지고, 너무 좁게 잡으면 병목이 빠질 수 있다. 처음에는 문제를 재현하는 작은 실행 흐름부터 잡는다.

두 번째 확인은 Hit List다. 결과에서 net time 또는 total time이 큰 항목을 정렬한다. SAP Help에서도 Hit List는 runtime 소비가 두드러진 항목을 찾는 도구로 설명된다. hits가 많은 항목은 반복 처리 문제일 수 있고, hits가 적지만 시간이 큰 항목은 비싼 단일 작업일 수 있다.

세 번째 확인은 ABAP time과 DB time의 비율이다. DB time이 크면 ST05로 해당 SQL을 추적한다. ABAP time이 크면 내부 테이블 접근 방식, loop 안 sort, 중복 계산, 불필요한 method 호출을 의심한다. External processing 시간이 크면 RFC, HTTP, GUI round trip 같은 외부 호출을 봐야 한다.

네 번째 확인은 code 위치다. Hit List에서 항목을 열어 실제 code 또는 call hierarchy로 이동한다. 병목 이름만 보고 끝내지 말고 "어느 line에서 어떤 data size로 반복되었는가"를 확인해야 한다.

다섯 번째 확인은 개선 후 비교다. 예를 들어 standard table을 매번 `READ TABLE ... WITH KEY`로 linear search하던 코드를 sorted key 또는 hashed access로 바꿨다면, 같은 데이터로 SAT를 다시 실행해 해당 block의 hits와 time이 줄었는지 본다.

### 실수와 주의

가장 흔한 실수는 SAT 결과의 1위 항목을 무조건 고치는 것이다. 1위 항목이 실제 업무상 필요한 큰 처리일 수도 있고, 하위 호출 시간이 포함된 total time일 수도 있다. Own time, total time, hits, call hierarchy를 함께 봐야 한다.

두 번째 실수는 대표성이 없는 데이터로 측정하는 것이다. 10건으로 실행하면 내부 테이블 접근 방식의 차이가 거의 보이지 않는다. 실제 운영에서 100,000건으로 느린 프로그램이라면 테스트도 병목이 드러날 정도의 데이터로 해야 한다.

세 번째 실수는 ST05와 SAT를 혼동하는 것이다. SAT에서 DB time이 큰 것을 봤다면 다음 단계는 SQL 상세 분석이다. 그때는 ST05가 더 적합하다. 반대로 ST05에서 SQL은 적은데 ABAP이 느리면 SAT를 봐야 한다.

네 번째 실수는 측정 도구가 만든 오버헤드를 절대 수치처럼 믿는 것이다. SAT는 특히 상대 비교에 유용하다. "정확히 142ms"보다 "수정 전에는 LOOP 집계가 전체의 70%였고 수정 후 15%로 줄었다"가 더 중요한 판단이다.

### 체험형 학습 설계

기존 체험물 `CH32-L02-S01`은 SAT Hit List를 막대 그래프로 보여 준다. 각 row는 code block을 나타내며, 막대 색은 ABAP processing과 database time의 비율을 보여 준다. 빨간 테두리는 1위 항목이다.

학습자는 먼저 1위 항목이 ABAP time 때문인지 DB time 때문인지 읽는다. 위젯의 callout은 1위 `LOOP 집계`가 ABAP time이 크므로 내부 테이블 접근과 loop 구조를 보라고 안내한다. 2위 항목은 DB time이 커서 ST05로 넘어가야 한다는 식으로 도구 선택을 연습한다.

이 위젯은 "어느 도구를 다음에 쓸 것인가"를 판단하게 만드는 것이 좋다. 각 row 옆에 `ST05로 이동`, `Internal Table 접근 점검`, `외부 호출 확인` 같은 선택 버튼을 두고, 학습자가 원인 성격에 맞는 버튼을 고르면 피드백을 준다. 틀린 선택을 하면 "DB 시간이 아닌데 ST05만 보면 ABAP loop 병목을 놓친다"처럼 이유를 알려 준다.

확장 상태는 `측정 전`, `Hit List 확인`, `원인 분류`, `수정 후 비교` 네 단계가 적합하다. 수정 전후 막대를 나란히 표시하면 입문자가 "튜닝은 코드를 바꾸는 일이 아니라 수치가 바뀌었는지 확인하는 일"이라는 원칙을 체감할 수 있다.

### 정리

SAT는 ABAP 실행 흐름 안에서 시간이 많이 쓰인 위치를 찾는 도구다. Hit List, hits, own time, total time, ABAP/DB/System 비율을 함께 봐야 한다. DB 시간이 크면 ST05로, ABAP 시간이 크면 loop와 internal table 접근으로, 외부 시간이 크면 RFC/HTTP 같은 외부 호출로 분석 방향을 나눈다. 다음 레슨에서는 한 실행이 아니라 운영 전체에서 누적 비용이 큰 SQL을 SQLM으로 찾는다.

## CH32-L03 - SQL Monitor / SQLM

### 왜 필요한가

ST05와 SAT는 특정 실행을 깊게 보는 데 좋다. 하지만 운영에서는 "어느 프로그램부터 고쳐야 가장 효과가 큰가"가 더 중요한 질문일 때가 많다. 어떤 SQL은 한 번 실행하면 빠르지만 하루에 200,000번 실행되어 전체 비용이 크고, 어떤 SQL은 한 번은 느리지만 거의 실행되지 않을 수 있다.

SQLM(SQL Monitor)은 운영 기간 동안 실행된 SQL 정보를 누적해서 보여 주는 도구다. 개발자가 특정 케이스를 재현하지 못해도, 실제 운영 사용량 기준으로 총 실행시간, 실행 횟수, 평균 시간, 영향 프로그램을 볼 수 있다. 그래서 SQLM은 "개별 병목 분석"보다 "튜닝 우선순위 선정"에 강하다.

이 레슨이 필요한 이유는 튜닝 자원이 항상 제한되어 있기 때문이다. 모든 느린 SQL을 다 고칠 수는 없다. 운영 전체에서 총 비용이 큰 것, 자주 실행되는 것, 사용자 영향이 큰 것부터 골라야 한다.

### 무엇인가

SQLM은 SQL Monitor transaction이며, 일정 기간 실제 SQL 실행 정보를 수집한다. SWLT(SQL Performance Tuning Worklist)는 SQL Monitor 데이터와 static check 결과를 결합해 성능 개선 후보를 찾는 데 사용한다. SAP Help의 SWLT 문서도 SQL Monitor snapshot과 static check 결과를 source position 기준으로 결합해 성능 개선 가능성이 있는 ABAP SQL 코드를 찾는다고 설명한다.

SQLM/SWLT를 볼 때 입문자가 먼저 봐야 할 항목은 다음과 같다.

| 항목 | 의미 | 판단 질문 |
| --- | --- | --- |
| Total execution time | 기간 전체 누적 시간 | 운영 전체 비용이 큰가 |
| Number of executions | 실행 횟수 | 자주 호출되어 비용이 쌓이는가 |
| Average time | 1회 평균 시간 | 단일 실행 자체가 느린가 |
| Records | 읽은 row 수 | 과도하게 많은 데이터를 읽는가 |
| Program / source position | 코드 위치 | 어느 프로그램을 고쳐야 하는가 |

SQLM과 ST05의 차이는 관찰 범위다. ST05는 특정 실행을 자세히 보고, SQLM은 기간 전체의 누적 경향을 본다. SQLM에서 후보를 고르고, ST05로 특정 실행을 깊게 파고, SAT로 ABAP 내부 처리까지 확인하는 흐름이 자연스럽다.

### 어떻게 확인하는가

첫 번째 확인은 수집 기간과 대상이다. SQLM을 활성화할 때 어떤 시스템, client, workload, 기간을 볼 것인지 정한다. 너무 짧으면 대표성이 없고, 너무 길면 최근 변경의 영향이 흐려질 수 있다.

두 번째 확인은 total execution time 기준 정렬이다. 평균 시간이 크지 않아도 실행 횟수가 많으면 전체 비용이 클 수 있다. 예를 들어 평균 0.4ms SQL이 210,000번 실행되면 총 시간은 무시할 수 없다.

세 번째 확인은 average time 기준 정렬이다. 평균 시간이 큰 SQL은 단일 실행 자체가 비싸다. 조건 누락, index 부적합, 대량 row 반환, join 조건 문제를 의심할 수 있다.

네 번째 확인은 program과 source position이다. 운영에서 비싼 SQL이 발견되어도 어떤 코드에서 나왔는지 모르면 고칠 수 없다. SQLM/SWLT는 runtime data와 static check 결과를 연결해 후보 위치를 좁히는 데 도움을 준다.

다섯 번째 확인은 개선 후보 분류다. 자주 실행되는 SQL은 buffer, 한 번 읽기, 호출 위치 줄이기, cache 검토가 후보가 된다. 평균 시간이 큰 SQL은 WHERE 조건, join, index, aggregate, pushdown이 후보가 된다. 모든 후보를 index로 해결하려고 하면 안 된다.

### 실수와 주의

가장 흔한 실수는 평균 시간만 보고 우선순위를 정하는 것이다. 평균 100ms SQL이 하루 10번 실행되는 것보다 평균 5ms SQL이 하루 200,000번 실행되는 것이 더 큰 비용일 수 있다. total time과 executions를 함께 봐야 한다.

두 번째 실수는 SQLM 결과만 보고 곧바로 수정하는 것이다. SQLM은 우선순위를 잡는 데 강하지만, 특정 실행의 상세 조건과 bind 값은 ST05로 더 자세히 봐야 한다. SQLM 후보를 ST05와 SAT로 재확인하면 오판을 줄일 수 있다.

세 번째 실수는 secondary index를 남발하는 것이다. CH08-L06에서 index 개념을 배웠지만, index는 읽기만 빠르게 하는 무료 옵션이 아니다. 쓰기 비용, 저장 공간, 유지보수 비용이 있다. S/4HANA에서는 HANA column store와 pushdown 전략을 고려해야 하므로 측정 근거 없이 index를 추가하면 안 된다.

네 번째 실수는 운영 데이터 수집 권한과 절차를 무시하는 것이다. SQLM과 SWLT는 운영 성능 데이터와 관련될 수 있으므로 권한, 수집 기간, 대상 범위를 운영 정책에 맞춰야 한다.

### 체험형 학습 설계

기존 체험물 `CH32-L03-S01`은 L01의 sql-trace 엔진을 재사용해 SQLM 누적 결과를 table로 보여 준다. 화면에는 SQL statement, 총 실행, 총 시간, 평균 시간이 있고, header 클릭으로 정렬한다.

학습자는 먼저 `총 시간(ms)`으로 정렬해 운영 전체 비용 1위를 찾는다. 다음으로 `총 실행`으로 정렬해 자주 호출되는 SQL을 찾는다. 마지막으로 `평균(ms)`를 보고 단일 실행이 비싼 SQL을 분리한다. callout은 "평균은 짧지만 총 5.3만 회라 전체 비용 420초"처럼 우선순위 판단을 도와준다.

이 위젯의 핵심 피드백은 "한 번 느린 SQL"과 "자주 실행되어 비싼 SQL"을 구분하는 것이다. 학습자에게 세 SQL 중 무엇을 먼저 개선할지 고르게 하고, 선택 이유를 total time, executions, average time 중 하나 이상으로 설명하게 한다.

확장 설계로는 `운영 1일`, `운영 7일`, `배치 시간대` 필터 버튼을 둘 수 있다. 필터를 바꾸면 순위가 바뀌고, 학습자는 "측정 기간이 바뀌면 튜닝 우선순위도 바뀐다"는 점을 체험한다. 또 `SWLT로 코드 위치 연결` 버튼을 두어 runtime SQL이 실제 source position과 연결되는 흐름을 보여 줄 수 있다.

### 정리

SQLM은 운영 기간 전체에서 누적 비용이 큰 SQL을 찾는 도구다. ST05가 특정 실행의 상세 trace라면, SQLM은 전체 workload의 우선순위 지도다. total time, executions, average time을 함께 보고, SWLT로 source position과 static check를 연결한다. 다음 레슨에서는 ST05와 SQLM에서 자주 발견되는 대표 병목인 SELECT-in-LOOP를 제거한다.

## CH32-L04 - SELECT in LOOP 제거

### 왜 필요한가

성능 문제 중 가장 자주 만나는 패턴이 SELECT-in-LOOP다. 예매 1,000건을 읽어 놓고 각 예매 건마다 공연명을 찾기 위해 DB에 `SELECT SINGLE`을 1,000번 보내는 식이다. 프로그램은 겉으로는 단순해 보이지만 DB 왕복이 1+N번으로 폭발한다.

이 문제는 개발 초기에 잘 드러나지 않는다. 테스트 데이터가 5건이면 빠르게 끝난다. 하지만 운영에서 50,000건이 되면 DB와 ABAP 서버 사이를 수만 번 왕복하면서 느려진다. ST05에서는 같은 SQL이 비정상적으로 많이 실행된 것으로 보인다.

이 레슨의 목표는 "LOOP 안 SELECT 금지"를 외우는 것이 아니다. 먼저 한 번에 필요한 데이터를 읽고, 메모리의 internal table에서 key로 찾는 구조를 익히는 것이다. 또는 CH13에서 배운 JOIN으로 한 번에 가져온다. 핵심은 DB 왕복을 줄이는 것이다.

### 무엇인가

나쁜 패턴은 다음과 같다.

```abap
LOOP AT lt_booking INTO DATA(ls_booking).
  SELECT SINGLE artist
    FROM zconcert
    WHERE concert_id = @ls_booking-concert_id
    INTO @DATA(lv_artist).
ENDLOOP.
```

이 코드는 booking 한 건마다 DB에 다시 간다. `lt_booking`이 10건이면 10번, 10,000건이면 10,000번이다. ST05에서는 같은 SQL text가 반복되고 execution count가 커진다.

개선 패턴은 "먼저 필요한 key 목록을 만들고, 관련 데이터를 한 번에 읽고, loop 안에서는 internal table에서 찾는다"이다.

```abap
DATA lt_keys TYPE TABLE OF zbooking.

lt_keys = lt_booking.
SORT lt_keys BY concert_id.
DELETE ADJACENT DUPLICATES FROM lt_keys COMPARING concert_id.

IF lt_keys IS NOT INITIAL.
  SELECT concert_id, artist
    FROM zconcert
    FOR ALL ENTRIES IN @lt_keys
    WHERE concert_id = @lt_keys-concert_id
    INTO TABLE @DATA(lt_concert).

  SORT lt_concert BY concert_id.
ENDIF.

LOOP AT lt_booking INTO DATA(ls_booking2).
  READ TABLE lt_concert INTO DATA(ls_concert)
       WITH KEY concert_id = ls_booking2-concert_id
       BINARY SEARCH.

  IF sy-subrc = 0.
    " ls_concert-artist 사용
  ENDIF.
ENDLOOP.
```

`FOR ALL ENTRIES`는 internal table의 값을 SQL 조건에 사용하는 Open SQL 기능이다. 로컬 ABAP 문서 기준으로 `FOR ALL ENTRIES IN @itab`의 각 row에 대해 WHERE 조건이 평가되고, 결과에서 중복 row는 제거된다. 가장 중요한 경고는 driver internal table이 비어 있으면 WHERE 조건 전체가 무시되어 database table의 모든 row가 결과로 들어올 수 있다는 점이다. 그래서 `IF lt_keys IS NOT INITIAL.` 확인이 필수다.

`READ TABLE ... BINARY SEARCH`는 정렬된 internal table에서 빠르게 key를 찾는 방식이다. 로컬 ABAP 문서 기준으로 `READ TABLE`은 `sy-subrc`와 `sy-tabix`를 설정하고, binary search는 sorted key 또는 `BINARY SEARCH` 추가를 사용할 때 일어난다. 단, binary search를 쓰려면 해당 key 순서로 정렬되어 있어야 한다.

### 어떻게 확인하는가

첫 번째 확인은 ST05다. 수정 전 trace에서 같은 `SELECT SINGLE`이 몇 번 실행되는지 본다. 예매 1,000건에 대해 1,000회 실행된다면 SELECT-in-LOOP가 맞다.

두 번째 확인은 코드 구조다. `LOOP AT lt_booking` 안에 `SELECT`, `SELECT SINGLE`, `CALL FUNCTION` 같은 외부 접근이 있는지 본다. 모든 LOOP 안 SELECT가 무조건 나쁜 것은 아니지만, 대량 데이터 loop에서 key 조회를 반복하는 패턴은 우선 제거 대상이다.

세 번째 확인은 driver table 비어 있음 처리다. `FOR ALL ENTRIES`를 쓰기 전에 `IF lt_keys IS NOT INITIAL.`이 있는지 본다. 이 조건이 없으면 빈 테이블일 때 전체 조회가 발생할 수 있다. 이 경고는 공식 문서에도 명확히 나온다.

네 번째 확인은 결과 동등성이다. 성능만 빨라지고 결과가 달라지면 실패다. 수정 전후로 같은 입력에 대해 같은 booking 수, 같은 artist 매핑, 누락 건 처리, `sy-subrc` 처리 결과를 비교한다.

다섯 번째 확인은 수정 후 trace다. ST05에서 반복 SQL이 1,000회에서 1회 또는 2회로 줄었는지 본다. SAT에서는 ABAP loop 시간이 오히려 과하게 늘지 않았는지 확인한다. DB 왕복을 줄였지만 internal table 검색이 느리면 sorted key나 hashed table을 검토한다.

### 실수와 주의

가장 위험한 실수는 빈 driver table로 `FOR ALL ENTRIES`를 실행하는 것이다. 이 경우 WHERE 조건이 무시되어 전체 table을 읽을 수 있다. 항상 비어 있으면 건너뛰는 guard를 둔다.

두 번째 실수는 duplicate key를 정리하지 않는 것이다. 공식적으로 결과 중복은 제거될 수 있지만, driver key가 불필요하게 중복되면 DB에 전달되는 조건이 커질 수 있다. `SORT`와 `DELETE ADJACENT DUPLICATES`로 key 목록을 줄이면 trace와 가독성 모두 좋아진다.

세 번째 실수는 `BINARY SEARCH` 전에 정렬하지 않는 것이다. 정렬 기준과 검색 key가 맞지 않으면 잘못된 결과를 얻을 수 있다. 가능하면 sorted table 또는 secondary sorted key를 설계해 key 접근을 명확히 하는 편이 더 안정적이다.

네 번째 실수는 FAE와 JOIN 선택 기준을 무시하는 것이다. 두 table의 관계가 명확하고 한 번에 필요한 데이터를 가져올 수 있다면 JOIN이 더 단순할 수 있다. 이미 메모리에 driver table이 있고 buffered table을 다루는 등 상황에 따라 FAE가 적합할 수 있다. 선택은 ST05와 결과 동등성으로 검증한다.

### 체험형 학습 설계

기존 체험물 `CH32-L04-S01`은 예매 건수 N을 slider로 바꾸며 SELECT-in-LOOP와 사전 조회를 비교한다. 왼쪽 card는 `LOOP ... SELECT SINGLE ... ENDLOOP`이고, 오른쪽 card는 `SELECT ... FOR ALL ENTRIES -> READ`이다. N이 커질수록 왼쪽 DB 왕복 수는 1+N으로 늘고, 오른쪽은 2회 수준으로 유지된다.

학습자는 slider를 0, 10, 100, 1,000에 해당하는 단계로 움직이며 DB 왕복과 예상 시간을 비교한다. N이 0일 때는 특별히 "driver table이 비어 있으면 FAE를 실행하지 않는다"는 피드백을 표시해야 한다. N이 커질 때는 "문제는 SELECT 문법이 아니라 반복 왕복"이라는 문장을 보여 준다.

코드 연결 영역은 세 부분으로 나눈다. 나쁜 패턴 영역에는 loop 안 `SELECT SINGLE` 줄을 강조한다. 개선 패턴 영역에는 `IF lt_keys IS NOT INITIAL`, `FOR ALL ENTRIES`, `READ TABLE ... BINARY SEARCH`를 순서대로 강조한다. 결과 영역에는 "ST05 execution count가 1,000 -> 2로 줄었다"처럼 측정 언어로 피드백을 준다.

평가 과제는 trace table을 보고 SELECT-in-LOOP인지 판단하게 하는 방식이 좋다. SQL text가 같고 execution count가 input row 수와 비슷하면 왜 위험한지 설명하게 한다. 정답은 "FAE를 쓴다" 한 줄이 아니라 "빈 driver guard, key 중복 제거, 결과 동등성, 수정 후 ST05 재측정"까지 포함해야 한다.

### 정리

SELECT-in-LOOP는 DB 왕복을 1+N으로 늘리는 대표 병목이다. ST05에서 같은 SQL의 execution count가 크게 보이면 의심한다. 해결은 JOIN, `FOR ALL ENTRIES`, 사전 조회 후 internal table key 접근이다. FAE는 빈 driver table이면 전체 조회가 될 수 있으므로 반드시 guard가 필요하다. 다음 레슨에서는 데이터가 더 커질 때 package, pushdown, 병렬 기준으로 설계를 나눈다.

## CH32-L05 - 대량 데이터 처리와 Package 설계

### 왜 필요한가

SELECT-in-LOOP를 제거해도 수백만 건 처리는 여전히 위험할 수 있다. 한 번에 모든 데이터를 internal table에 담으면 memory가 커지고, 한 transaction에서 너무 오래 lock을 잡고, 실패했을 때 처음부터 다시 처리해야 할 수 있다. "빠른 SELECT"만으로는 대량 처리 운영을 해결할 수 없다.

대량 처리에서는 속도와 안정성을 함께 봐야 한다. 얼마씩 끊어 처리할지, 언제 commit할지, 실패한 package를 어떻게 다시 시작할지, 가공을 ABAP에서 할지 DB에서 할지, 병렬로 나눌 수 있는지 판단해야 한다.

이 레슨은 CH24-L05의 package 처리와 CH32-L04의 DB 왕복 줄이기를 연결한다. 또한 CH33에서 다룰 AMDP/ADBC/pushdown으로 넘어가기 전에, 어떤 일을 DB에 맡기고 어떤 일은 ABAP에서 나눠 처리해야 하는지 기준을 잡는다.

### 무엇인가

대량 처리 전략은 네 가지 질문으로 나눠 볼 수 있다.

| 질문 | 예 | 적합한 방향 |
| --- | --- | --- |
| DB가 잘하는 일인가 | 집계, 정렬, 필터, join | SQL `GROUP BY`, aggregate, CDS, pushdown |
| 한 번에 memory에 담아도 되는가 | 수천 건 vs 수백만 건 | 크면 package 처리 |
| 실패 후 다시 시작해야 하는가 | 야간 batch, 외부 파일 처리 | restart key, 처리 상태, 로그 |
| 독립 분할이 가능한가 | 회사코드, 기간, 문서번호 범위 | 병렬 처리 후보 |

가공을 DB에서 할 수 있다면 먼저 DB에서 줄인다. 로컬 ABAP 문서 기준으로 aggregate expression은 여러 row의 값을 집계해 하나의 값을 만들고, `GROUP BY`와 aggregate function을 쓰면 group과 aggregate가 database system에서 만들어지므로 DB에서 AS ABAP로 운반해야 하는 데이터 양을 줄일 수 있다.

예를 들어 ABAP으로 모든 항공편 row를 가져와 `LOOP`로 합계를 내기보다, DB에서 carrier별 합계를 만들어 결과만 가져온다.

```abap
SELECT carrid,
       SUM( seatsocc ) AS occupied_seats
  FROM sflight
  GROUP BY carrid
  INTO TABLE @DATA(lt_occupied_by_carrier).
```

이 코드는 모든 상세 row를 ABAP으로 끌고 와서 합산하는 방식보다 데이터 이동량이 적다. 물론 모든 업무 로직을 SQL로 밀어 넣어야 한다는 뜻은 아니다. 검증, 상태 변경, 재처리 로그, commit 단위가 필요한 업무 처리는 ABAP 쪽 package 설계가 필요하다.

### 어떻게 확인하는가

첫 번째 확인은 데이터 규모다. 예상 대상 건수, 한 건당 memory 크기, 총 처리 시간, commit 가능 단위, lock 범위를 추정한다. "운영에서 최대 몇 건인가"를 모르면 package size를 정할 수 없다.

두 번째 확인은 DB에서 줄일 수 있는지다. 단순 filter, join, aggregate, group by는 DB가 잘한다. ST05로 row 수와 SQL 시간을 보고, ABAP에서 loop로 계산하던 부분을 SQL aggregate로 바꿀 수 있는지 검토한다.

세 번째 확인은 package 단위다. package size는 너무 작으면 commit과 round trip이 많아지고, 너무 크면 memory와 lock이 커진다. 예를 들어 10,000건 단위로 읽고 처리한 뒤 commit하고, 마지막 처리 key를 로그에 남기는 방식을 검토한다. 단, commit 단위는 업무 원자성과 충돌하면 안 된다.

네 번째 확인은 실패 재시작이다. 대량 처리에서 실패는 예외가 아니라 설계 대상이다. 처리 상태 table, 성공/실패 count, 마지막 key, 오류 메시지, 재처리 대상 추출 기준을 남긴다. CH24의 재처리 관점이 여기서 다시 필요하다.

다섯 번째 확인은 병렬 가능성이다. 회사코드나 기간처럼 독립된 범위로 나눌 수 있으면 병렬 처리 후보가 된다. 하지만 병렬은 자원을 더 쓰고 lock 충돌과 순서 문제를 만들 수 있다. 병렬은 마지막 선택지이지 항상 정답이 아니다.

### 실수와 주의

가장 흔한 실수는 모든 데이터를 한 번에 internal table에 담는 것이다. 테스트에서는 잘 돌아가도 운영에서는 memory 부족, paging, 긴 lock, timeout으로 실패할 수 있다. 대량 데이터는 "한 번에"가 아니라 "안전한 단위로" 처리한다.

두 번째 실수는 ABAP에서 할 필요 없는 집계를 ABAP으로 가져오는 것이다. 합계, 개수, group by, 기본 filter는 DB가 잘한다. DB에서 100건으로 줄일 수 있는 데이터를 ABAP으로 1,000,000건 가져오면 네트워크와 memory를 낭비한다.

세 번째 실수는 commit을 너무 자주 하거나 너무 늦게 하는 것이다. 너무 자주 commit하면 성능과 원자성이 깨질 수 있고, 너무 늦게 commit하면 lock과 rollback 부담이 커진다. 업무적으로 함께 성공해야 하는 단위와 운영적으로 재시작 가능한 단위를 함께 봐야 한다.

네 번째 실수는 병렬을 성능 만능 해결책으로 보는 것이다. 병렬은 서로 독립적인 작업에만 적합하다. 같은 key를 갱신하거나 같은 lock object를 잡는 작업을 병렬화하면 오히려 충돌과 오류가 늘어난다.

다섯 번째 실수는 CH33의 pushdown 수단을 앞당겨 구현하려는 것이다. 이 장에서는 `GROUP BY`와 aggregate처럼 이미 배운 SQL로 가능한 pushdown 원칙을 다룬다. AMDP나 ADBC 구현 문법은 CH33에서 정식으로 다룬다.

### 체험형 학습 설계

기존 체험물 `CH32-L05-S01`은 대량 처리 전략을 고르는 decision tree다. 첫 질문은 "가공을 DB에서 할 수 있는가"이고, 가능하면 Code Pushdown 결과로 간다. 불가능하면 memory 위험 여부를 묻고, 크면 package 또는 병렬 후보를 고른다.

학습자는 세 가지 시나리오를 차례로 선택한다. 첫째, carrier별 좌석 합계처럼 DB 집계가 가능한 경우에는 `GROUP BY` pushdown이 권장된다. 둘째, 업무 검증 때문에 ABAP 처리가 필요하고 건수가 큰 경우에는 package 처리가 권장된다. 셋째, 회사코드별로 완전히 독립된 경우에는 병렬 처리 후보로 표시된다.

결과 card에는 전략명만 보여 주면 부족하다. 각 card는 "왜 이 전략인가", "무엇을 조심해야 하는가", "어디서 확인하는가"를 함께 보여 줘야 한다. Pushdown card는 ST05의 records 감소를 확인하라고 안내하고, package card는 memory와 commit/restart log를 확인하라고 안내하고, parallel card는 lock 충돌과 자원 사용량을 확인하라고 안내한다.

확장 설계로는 package size slider가 좋다. 학습자가 1,000, 10,000, 100,000건 단위를 고르면 예상 commit 횟수, peak memory, restart 손실 범위가 바뀐다. 예를 들어 package size가 너무 크면 "실패 시 다시 처리해야 할 범위가 커진다"는 피드백을 보여 주고, 너무 작으면 "commit overhead가 커진다"는 피드백을 준다.

### 정리

대량 처리 튜닝은 빠른 SQL 하나로 끝나지 않는다. 먼저 DB에서 줄일 수 있는 것은 `GROUP BY`와 aggregate로 줄이고, ABAP 업무 처리가 필요한 부분은 package 단위로 나누며, 실패 재시작과 로그를 설계한다. 병렬은 독립 분할이 가능할 때만 검토한다. CH33에서는 더 깊은 pushdown 수단인 AMDP, ADBC, database-specific 처리의 장단점을 다룬다.

## CH32 마무리

CH32의 핵심은 성능을 감으로 고치지 않는 것이다. ST05는 한 실행의 SQL 병목을, SAT는 ABAP runtime 병목을, SQLM은 운영 전체의 SQL 우선순위를 보여 준다. SELECT-in-LOOP는 DB 왕복을 줄이는 대표 튜닝이고, 대량 처리는 pushdown, package, restart, 병렬 기준으로 설계한다.

좋은 튜닝 기록은 수정 전후 수치를 남긴다. 실행 조건, 입력 데이터 규모, trace 결과, 수정 내용, 재측정 결과가 있어야 운영자가 신뢰할 수 있다. 다음 CH33에서는 DB 쪽에서 더 강하게 처리하는 AMDP, ADBC, Pushdown의 경계를 배운다.
