# 14. REFERENCE CORPUS — 외부 참고 자료 인벤토리 · 관련성 · 활용 규칙

> 📅 최종수정: 2026-06-29 19:18 KST
> 🎯 `C:\ABAP_DOCU_DOWNLOAD\ABAP_DOCU\`에 모아둔 SAP 공식/오픈소스 자료를 **정밀 분석**한 결과와 **프로젝트 활용 규칙**. 이 코퍼스는 *참고 입력(input)*이며 빌드 파이프라인 밖이다 — `content/abap/**.md`를 쓸 때 사실·예제·구조의 **출처**로 쓴다.
> ✅ **저작권: 본 과정은 SAP Korea 주관 강의 → SAP 공식문서·cheat-sheet 본문·예제 verbatim(원문 그대로) 사용 허용.** 단 이는 *저작권 허가*일 뿐 — **입문자 가독성(R3)은 별개 규칙으로 유지**: 예제 코드는 공식 원문 그대로 자유 사용하되, **본문 prose가 입문자에게 어려운 곳(영어·압축·non-semantic)은 한국어 입문 톤으로 각색**([04 R3](04_CONVENTIONS.md)). = "verbatim 허용 + R3 각색 유지".
> 🔗 관련: 기존 오프라인 HTML 덤프(`C:\ABAP_DOCU_HTML\`)는 메모리 `abap-keyword-doc-links`가 단일 출처 — 본 문서는 그 **확장 코퍼스**의 카탈로그.

---

## 0. TL;DR — 관련성 등급 (우리 = classic-first 입문 커리큘럼, 1순위 CH01～17)

| 자료 | 한 줄 | 관련성 | 1순위 용도 |
|---|---|---|---|
| **abap-cheat-sheets** (758/816/main/rap) | SAP 공식 주제별 cheat sheet(36토픽)+실행예제 | ★★★★★ | **챕터 주제 1:1 매핑 · 예제/구조 출처**. 버전을 챕터에 맞춰 선택 |
| **abap-docs-main** | 공식 keyword doc 전체를 **Markdown**으로(standard 7,906 + cloud 5,244) | ★★★★☆ | **사실검증·grep**. HTML 덤프의 MD 업그레이드 + **ABAP Cloud판 추가**(R6 경계 검증) |
| **styleguides-main** (Clean ABAP) | Clean ABAP 스타일가이드 8개 언어(**한국어 포함**)+code-review | ★★★☆☆ | 모던 챕터 스타일 근거 · **한국어 용어 대조**. 단 R11과 충돌 주의 |

> 🗑️ **abap-skills(Claude Code 스킬 모음)는 2026-06-27 폴더 삭제됨** — 대부분 모던/Cloud 초점이라 classic-first 입문 콘텐츠 *저작*과 결이 달라 코퍼스에서 제외. 향후 모던 트랙에서 필요하면 원본 레포(`github.com/likweitan/abap-skills`)를 온디맨드로 재확인.

---

## 1. abap-cheat-sheets — ★★★★★ (가장 정렬도 높음)

**무엇** — SAP-samples 공식 레포(Apache-2.0). 36개 **주제별 MD**(ToC 포함, 예제 풍부)로 구성. 브랜치=용도/릴리스별 폴더로 받아둠:

| 폴더 | 정체 | 우리 매핑 |
|---|---|---|
| `abap-cheat-sheets-758` | **classic ABAP** release 7.58 예제 | **CH01～17(classic 구간) 1순위 출처** — 우리 HTML 덤프(758)와 릴리스 일치 |
| `abap-cheat-sheets-816` | classic ABAP 8.16 | 758에 없는 보강·신규 syntax 교차확인 |
| `abap-cheat-sheets-main` | **ABAP for Cloud Development**(모던) 초점 + 모든 36토픽 문서 보유 | **CH18+ 모던 구간** · 토픽 ToC 설계 참고 |
| `abap-cheat-sheets-rap` | RAP BO 예제 + 실제 `src/` ABAP 클래스 | RAP/EML(Track 후반) 전용 |

**36토픽**(main): 01 Internal Tables · 02 Structures · 03 ABAP SQL · 04 OO · 05 Constructor Expr · 06 Dynamic · 07 String · 08 EML/RAP · 13 Program Flow · 14 Unit Tests · 16 Data Types & Objects · 23 Date/Time · 24 Builtin Functions · 27 Exceptions · 28 Regex · 29 Numeric · 32 Performance · 34 OO Design Patterns · 35 BAdIs · 36 RAP BDL … → **우리 챕터 주제와 거의 1:1.**

**활용 규칙**
- 레슨 작성 시 해당 주제 cheat sheet를 **구조·예제의 출처**로 연다. 예제 코드는 **공식 원문 그대로 사용 가능**(SAP Korea 주관). 단 SAP 예제는 "non-semantic·best-practice 아님" → 입문자에게 맥락이 약하면 **입문자 시나리오·이름 풀([04 R9](04_CONVENTIONS.md))로 각색**(가독성 판단, 강제는 아님).
- **버전 선택이 곧 R6 준수**: classic 레슨(CH01～17)은 **758/816**을, 모던(CH18+)은 **main**을 본다. main은 Cloud 초점이라 classic-only(예: dynpro, `WRITE` 리스트)는 758/816에만 있음 — 섞으면 [05 P7](05_PITFALLS.md) 위반.
- 예제 코드 fence는 ```` ```abap ````로만(빌드가 code-copy-block 변환, [05 P10](05_PITFALLS.md)).

---

## 2. abap-docs-main — ★★★★☆ (사실검증 인프라 업그레이드)

**무엇** — 공식 ABAP Keyword Documentation을 **Markdown + YAML frontmatter**로 변환한 스크레이퍼 산출물(87MB). 각 파일에 `title/description/keywords/category/sourceUrl/abapFile` 메타. 두 라이브러리 동시 보유:
- `docs/standard/md/` — **Standard(classic) ABAP** 7,906파일
- `docs/cloud/md/` — **ABAP Cloud** 5,244파일

**기존 `C:\ABAP_DOCU_HTML\`(HTML, 758/8.16, 6천여 파일) 대비**
- ✅ **MD라 grep·읽기 쉬움**(script/태그 제거됨) · frontmatter `keywords`로 주제 검색 · `sourceUrl`로 공식 페이지 즉시 링크.
- ✅ **ABAP Cloud판이 추가** → "이 syntax가 Cloud에서 허용되나?"를 standard/cloud 두 폴더 존재 여부로 즉시 판정 → **R6(classic↔modern 경계)·[05 P7](05_PITFALLS.md) 검증의 결정적 근거**.
- ⚠️ 변환 아티팩트 존재: 이스케이프(`\{`), 인라인 `*.html` 링크 잔재, 일부 description 깨짐 → **정의·문법 확정은 원문(HTML 덤프 또는 sourceUrl)과 교차확인**.
- 콘텐츠 자체는 SAP 저작물이나 **SAP Korea 주관 강의라 verbatim 사용 허용**(예제 그대로, 어려운 본문은 R3 각색).

**활용 규칙** — 키워드 감사(완료·아카이브 [11_KEYWORD_AUDIT](../.archive/2026-06-29-docs-cleanup/11_KEYWORD_AUDIT.md))·용어 정의([04 R12](04_CONVENTIONS.md) glossary) 작업 시 **1차 grep 대상**으로 HTML 덤프와 병행. classic 사실은 `standard/md`, 경계 판정은 standard vs cloud 비교.

---

## 3. styleguides-main (Clean ABAP) — ★★★☆☆ (선별 적용)

**무엇** — SAP `styleguides` 레포(콘텐츠 **CC BY 3.0** → 출처표기 시 인용/번안 가능). 내용:
- `clean-abap/CleanABAP*.md` — Clean ABAP 스타일가이드 **8개 언어**(en/de/es/fr/**kr**/ru/zh/ja). **한국어 `CleanABAP_kr.md` 존재** → 입문자용 한국어 용어·원칙 대조에 유용.
- `clean-abap/cheat-sheet`, `sub-sections` — 요약·세부.
- `abap-code-review/ABAPCodeReview.md` — 코드리뷰 체크리스트.

**⚠️ 우리 규칙과의 충돌 — 반드시 인지**
- Clean ABAP는 **헝가리안 표기(접두어)를 *지양*** 한다. 그러나 우리는 **의도적으로** classic-first 입문 단계에서 `gv_/gs_/gt_`·`lv_/ls_/lt_` 스코프 접두어를 쓴다([04 R11](04_CONVENTIONS.md), 메모리 `abap-var-prefix-scope`). → **Clean ABAP를 R11의 상위 규칙으로 삼지 말 것.** 입문 단계 가독성 > 모던 컨벤션이라는 우리 결정이 우선.
- Clean ABAP는 모던/OO·functional 전제 → **CH18+ 모던 챕터·OO 챕터의 스타일 근거**로는 적합. classic 초반엔 부분 적용.

**활용 규칙** — 모던/OO 레슨의 "좋은 코드" 기준·명명 원칙 인용 시 출처표기. 한국어판은 **용어 번역 일관성** 참고(영어 원문 우선 원칙 [04 R3](04_CONVENTIONS.md)/메모리 `abap-terms-english`는 유지).

---

## 4. 레슨 페이지 개발 시 참고 루틴 (실행)

레슨 1개를 쓸 때 — [01 작업 전 체크리스트](01_AI_SYNC.md) 직후 — 아래를 표준 참고로 연다:

1. **구조·예제** → 그 레슨 주제의 **cheat-sheet** 파일을 **버전 매칭**으로 연다(§1 표): classic 레슨(CH01～17)=`abap-cheat-sheets-758/`(없으면 `-816`), 모던(CH18+)=`-main`, RAP=`-rap`. **예제 코드는 원문 그대로 사용 가능**; 입문자에게 맥락이 약하면 시나리오·이름 풀([04 R9](04_CONVENTIONS.md))로 각색(가독성 판단).
2. **사실·문법·정의 검증** → `abap-docs-main/docs/standard/md`를 grep(classic 사실), 용어는 frontmatter `keywords`로 검색. 정의 확정은 `sourceUrl`/HTML 덤프와 교차확인.
3. **R6 경계 판정**("이 문법 Cloud 가능?") → `standard/md` vs `cloud/md` 동일 파일 존재 비교. classic-only면 classic 챕터에만, [05 P7](05_PITFALLS.md) 준수.
4. **스타일 근거**(모던/OO 레슨 한정) → `styleguides-main/clean-abap/CleanABAP.md`, 한국어 용어 대조는 `CleanABAP_kr.md`. ⚠️ **R11(접두어)·R6를 덮어쓰지 않는다** — 입문 단계 가독성이 우선.

**불변 가드레일**: SAP 본문·예제 **verbatim 사용 허용**(SAP Korea 주관) — 예제 코드는 그대로, 입문자에게 어려운 본문은 R3 각색([04 R3](04_CONVENTIONS.md)) · 우리 규칙(R6/R11/R15)이 외부 컨벤션보다 우선 · 사실은 항상 공식 원문과 교차확인.

---

## 5. 사실검증·검색 규율 (커밋된 단일 출처)

> 그동안 메모리(`abap-keyword-doc-links`·`notebooklm-nlm-cli`·`notebooklm-sapui5-chapterids`)에만 있던 운영 규칙을 **여기로 승격** — 메모리가 없어도 `.project-docs`만으로 자립하게. (메모리는 보조로 유지.)

### 5-1. 검색 우선순위 — **웹검색은 최후수단**
사실·문법·정의 확인은 **일반 인터넷 검색(구글 등) 대신 오프라인 코퍼스를 먼저** 쓴다(사용자 지시 — 웹검색은 부정확·버전 혼선). 순서:
1. **`C:\ABAP_DOCU_HTML\`** (공식 keyword doc HTML 덤프, **AS ABAP 758/8.16**, 6천여 파일) — **1차 grep 대상**. 용어정의=`aben<term>_glosry.htm` · 예제=`*abexa*.htm` · ToC=`abap_docu_tree.htm` · 진입=`index.htm`. (추출 패턴: script블록 제거 → 태그 제거 → `class="h1"` 이후 본문.)
2. **`…\ABAP_DOCU\abap-docs-main\docs\standard\md`** (MD판) — grep·frontmatter `keywords` 검색이 쉬움. **R6 경계 판정 = `standard` vs `cloud` 동일 파일 존재 비교**(§2).
3. **구조·예제** = 버전매칭 cheat-sheet(§1: classic→`-758/-816`, 모던→`-main`, RAP→`-rap`).
4. 위에서 안 나올 때만 **공식 온라인 문서(§5-2 URL)** 또는 **NotebookLM(§5-3)**. 정의 확정은 항상 공식 원문(HTML 덤프 또는 `sourceUrl`)과 교차확인.

### 5-2. 공식 ABAP Keyword Doc — canonical URL (검색하지 말고 이 URL을 그대로)
- 최신 classic(Standard): `https://help.sap.com/doc/abapdocu_latest_index_htm/latest/en-US/ABENABAP.html`
- 최신 ABAP Cloud: `https://help.sap.com/doc/abapdocu_cp_index_htm/CLOUD/en-US/ABENABAP.html`
- 버전 고정: 8.16 홈 `…/abapdocu_816_index_htm/8.16/en-US/ABENABAP.html` · 7.5x News `…/8.16/en-US/ABENNEWS-75.html`
- URL 패턴: `https://help.sap.com/doc/abapdocu_<키>_index_htm/<버전>/en-US/<페이지>.html` — Standard=`<키>=latest`·`<버전>=latest`(또는 `816`/`752`) · Cloud=`<키>=cp`·`<버전>=CLOUD` · 문서 홈=`ABENABAP.html`.
- 🚫 죽은 링크(쓰지 말 것): `https://help.sap.com/docs/ABAP_PLATFORM_NEW`.
- 학습 사이트 내 노출 = `sample/foundations/official-links.html`.

### 5-3. NotebookLM — **`nlm` CLI로만**
- 접근 = `nlm` CLI(`c:\users\goott\.local\bin\nlm.exe`, Google 로그인 상시). 구 `notebooklm` MCP는 제거됨 → `mcp__notebooklm__*` 쓰지 말 것.
- 질의: `nlm notebook query <노트북ID> "<질문>" --timeout 540 [--json]` · 후속(맥락유지) `-c <conversation-id>` · 소스한정 `-s <source-ids>`. ⚠️ 구문 = `nlm notebook query`(O), 옛 `nlm query notebook`(X). 단발 ~60초.
- ⚠️ **질의는 구 repo `../sapui5`의 챕터ID로** 한다 — NotebookLM이 sapui5 커리큘럼 기준으로 구성됨. 새 `sap-dev-academy`의 `CHxx`로 물으면 답이 안 옴([04 R14](04_CONVENTIONS.md)).
- 등록 노트북(2026-06-23 확인): ABAP `ad0e9cde-4dca-451e-b455-de200a9ed7b7`(185소스·ABAP Curriculum v5.4) · UI5 `979f34d8-73c1-4d45-95d2-79db4eee7d41` · Delta 7.0→7.51 `d3f062f5-0fef-4bfb-a4f5-ef9ad2b08625` · S/4HANA+ABAP `fed24390-d189-4874-8d15-ada65a5b636b`. 병렬 검증은 챕터 분담 에이전트로.
