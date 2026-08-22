[확정 사실 — 기각 사전·정본 (판정층이 코퍼스 원문으로 반증·확정한 항목)]
> 사용 규칙: 아래와 **정확히 같은 주장**은 다시 제기하지 마라(이미 공식 문서로 반증 확정). 단 **변형·신규 주장은 자유**다 — 이 목록은 탐색을 좁히라는 것이지 넓히지 말라는 뜻이 아니다. 근거는 오프라인 코퍼스 문서명이다.

## A. 반증 확정(기각 사전) — 아래 주장은 전부 틀린 주장이다
- ⑦ "HASHED 테이블에 SORT 불가" → SORT 대상 = standard **및 hashed**(SORTED만 불가). `ABAPSORT_ITAB`
- ⑧ "READ TABLE에서 결과절(TRANSPORTING NO FIELDS 등)이 키 지정보다 앞이면 오류" → 구문도상 result가 앞. `ABAPREAD_TABLE`
- ⑨ "classic에서 `IN (v1, v2)` 콤마 목록 불가" → 합법(콤마 금지 규율은 SELECT 필드 나열 한정). `ABENWHERE_LOGEXP_IN`
- ⑩ "SELECT (SINGLE) 실패 시 Work Area 자동 초기화" → remains unchanged. `ABAPINTO_CLAUSE`
- ⑪ "Check Table 입력도움말이 DE 부착 Search Help보다 우선" → 서열 반대. `ABENABAP_DYNPROS_VALUE_HELP_AUTO`
- ⑫ "`TYPE dbtab-field` 참조 불가" → 합법.
- ⑬ "CP는 축약형만 합법" → CP = Conforms to Pattern, 확장형 합법. `ABENLOGEXP_STRINGS`
- ⑭ "`TYPE RANGE OF` 불가" → 합법.
- ⑮ "METHOD IMPORTING에 제네릭 c/n/p/x 불가" → 완전 타입 강제는 RETURNING만. `ABAPMETHODS_FUNCTIONAL`
- ⑯ "FORM 파라미터도 OPTIONAL/DEFAULT 지원" → FORM엔 없음(FM 전용). `ABAPFORM`
- ⑰ "DDIC 이름 2·3위치 밑줄 제한은 없다" → 명문 규칙 실재. `ABENDDIC_STRUCTURES_NAMES`
- ⑱ "outer join ON은 `=`만" → 7.40부터 `<>` 등 해제. `ABENNEWS-740-ABAP_SQL`
- ⑲ "LOOP AT SCREEN INTO 불가" → INTO가 정식, 단축형이 obsolete. `ABAPLOOP_AT_SCREEN`
- ⑳ "ABAP SQL DATS_ADD_DAYS는 3인자 필수" → 2인자 정식(3인자는 CDS 함수 혼동).
- ㉑ "단축형 메서드 호출에 EXCEPTIONS 불가" → 합법.
- ㉒ "`+=` 같은 계산 대입 연산자는 없다" → 실재(신 문법).
- ㉓ "ABAP SQL에 EXCEPT/INTERSECT 없음" → 지원.
- ㉔ "line_index에 -1 경로 없음" → hash key = -1 · 미발견 = 0 명문.
- ㉕ "EXISTS 서브쿼리는 SELECT * 필요" → SELECT 목록 무관(리터럴 권장). `ABENWHERE_LOGEXP_EXISTS`
- ㉖ "윈도 함수 OVER 안에서 ASCENDING/DESCENDING 불가" → 구문도 명문. `ABAPSELECT_OVER`
- ㉗ "standard key에서 string 제외" → standard key = character-like(**string 포함**)+byte-like 전부. `ABENITAB_STANDARD_KEY` `ABENCHARLIKE_DATA_TYPE_GLOSRY`
- ㉘ "WITH HEADER LINE/OCCURS에 deep(string) 컴포넌트 불가" → 금지는 행 타입 자체가 테이블일 때뿐. `ABAPDATA_HEADER_LINE`
- ㉙ "CDS association의 단어형 cardinality(`OF ONE TO MANY` 등) 비실재" → 명문 문법·SAP 권장. `ABENCDS_CARDINALITY_V2`
- ㉚ "CDS 요소 목록 마지막에 세미콜론 필수" → 구문도상 `[;]` 선택 사항.
- ㉛ "VALUE 생성자에서 `구조필드-하위컴포넌트 =` 지정 불가" → 합법. `ABENVALUE_CONSTRUCTOR_PARAMS_STRUC`

## B. 코퍼스 확정 사실(자주 갈리는 지점)
- sy-subrc는 **결과를 정의한 문장만** 설정(그 외 문장은 직전 값 유지). `ABENSYSTEM_FIELDS`
- APPEND는 **index table 전용**(HASHED 불가 — INSERT INTO TABLE 사용). `ABAPAPPEND`
- BINARY SEARCH 실패 subrc = **4 또는 8** 둘 다 정식. `ABAPREAD_TABLE`
- AT NEW/END OF 마스킹의 `*` 채움 = character-like **flat**만(string 제외, string은 초기화). `ABAPAT_ITAB`
- COLLECT 제약 = **비키 컴포넌트 numeric**뿐. `ABAPCOLLECT`
- READ WITH KEY로 **키 필드 전부** 지정 = WITH TABLE KEY와 동일 효과(HASHED면 해시 접근). `ABAPREAD_TABLE_KEY`
- DELETE TABLE ... FROM/WITH TABLE KEY = **처음 만나는 한 행만** 삭제. `ABAPDELETE_ITAB_LINE`
- `COUNT(*)`만 예약어 붙여쓰기 허용, 그 외 집계함수 괄호 안 공백 = 문법 요구. `abensql_agg_func`
- Maintenance View = **inner join** 명문(outer 보존은 Help View 성질). `abenddic_maintenance_views`
- TYPE-POOLS 구문 = **obsolete**(타입 그룹 참조는 여전히 합법, 선언문이 불요). `ABAPTYPE-POOLS`
- ABAP SQL의 deep work area 제한 = **CORRESPONDING 없는 INTO 한정**(INTO CORRESPONDING FIELDS는 별개 규칙). `ABENABAP_SQL_WA` `ABAPINTO_CLAUSE`

## C. 시드·정본(관통예제 콘서트 앱)
- 공연 3종 = C001～C003, C001 ARTIST 정본 = **안유진**. ZCONCERT에는 title 필드가 없다(별칭 `c~artist`가 정본).
- 예매 정본 예: 행 0002 = 1석. 시드가 의심되면 저장소의 시드 정의(콘텐츠·위젯 cfg)를 실측하라 — 표기와 시드가 다르면 시드 쪽이 정본이다.
