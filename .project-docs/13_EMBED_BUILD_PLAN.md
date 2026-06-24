# 13. EMBED BUILD PLAN — 학습수단 수정·제작 계획

> 📅 최종수정: 2026-06-24 09:31 KST
> 🎯 **목적:** 2026-06-24 학습수단 전수 점검 결과(`check/20260624_챕터별_점검결과/`)를 바탕으로, 오배치/불일치 학습수단을 **레슨 시나리오에 맞게 수정·제작**한다.
> 📥 **입력 사양:** `check/20260624_챕터별_점검결과/_수정필요_통합.md`(#Cxx-n 항목별 구현가능 설계안) · `_00_요약.md`(전체 집계·공유샘플 추적).
> 📖 **읽을 때:** 제작 패스 착수·재개 시.
> 🔒 브랜치: `feature/learning-asset-audit`.

---

## 1. 범위 (확정)
- **이번 패스 = 기존 학습수단 "수정"만.**
  - **수정 29건** (치명 ❌23 + 부분 ⚠️6) — #Cxx-n 설계안대로.
  - **정상 7건** (✅ golden) — `embeds/abap/`로 **복사+리네임**(내용 유지).
  - **경미 3건** — #C15-1(stage1 inline DATA→classic)·#N1(주석 CH18→CH19)·CH05-L04(본문 교차참조).
  - → 결과적으로 **현재 `::embed` 36건 전부**가 `embeds/abap/CHnn-Lnn-Snn.html`로 이관됨.
  - **수정에 새 엔진이 필요한 9건도 포함**(그것도 수정): CH13-L08·CH17-L07/L10·CH20-L01/L07/L10·CH01-L02/L07·CH16-L03·CH04-L04.
- **제외(후속) = "신규" = 학습수단이 아예 없는 레슨**: 체험 누락 보강(CH02~09 일부·CH19~36 전 구간) + **CDS/RAP/BDEF/MDE 신규 제작**(CH22·23·36).

## 2. 폴더·파일 구조
| 경로 | 역할 |
|---|---|
| `embeds/abap/CHnn-Lnn-Snn.html` | **레슨 인스턴스**(얇은 HTML = 골격 + 데이터, 공통 엔진 링크). S=레슨 내 학습수단 순번. 하이픈·2자리 0패딩·슬러그 없음 |
| `embeds/_engine/<engine>.js`·`.css` | **공통 엔진(SSOT)** |
| `embeds/_engine/_base.css` | 공통 토큰(`:root` --brand·--accent·--mono…) + 공통 프리미티브 — **전 위젯이 링크** |
| `embeds/_vendor/mermaid.min.js` | Mermaid **로컬 백업**(CDN 우선, 손상 시 전환) |
| `embeds/abap/_index.md` | **현황 인덱스**: 파일·설명·엔진종류·연결레슨·상태 **+ 카테고리(엔진)별 집계**(같은 종류 몇 개·어느 레슨) |
| `sample/` | **참고 카탈로그**(레슨 임베드 안 함). Group1·2 데모는 "엔진은 `embeds/_engine/` 참조" 주석만 달고 유지 |

## 3. `::embed` 문법 & 빌드 변경 (C안)
- MD: **`::embed CH04-L01-S01`** (옵션 `| 제목 | 높이` 그대로).
- 빌드(`tools/build-curriculum.mjs` `embedExt`)가 접두 `../../../embeds/abap/` + 접미 `.html` 자동 부여.
- **전환기 동시지원**: `^CH\d+-L\d+-S\d+$` 패턴 → `embeds/abap/…html`(신규) / 슬래시·`.html` 포함 경로 → `../../../sample/…`(레거시). **전 챕터 이관 완료 후 레거시 분기 제거.**

## 4. 엔진 정책 — 전면 공통화
- **재사용 엔진이 있는 모든 위젯 = 공통**(`_engine/` + 얇은 HTML). 1회짜리도 구조 통일 위해 `_engine/`에 둔다.
- **standalone 예외 = 재사용 엔진이 없는 고유물만**(예: `static-svg-architecture` 류 손그림 SVG).
- **공통 `_base.css`**(토큰) 도입 = 최대 이득(테마 일관·색 변경 한 곳).
- **엔진↔HTML 골격 계약**: 공통 엔진이 특정 DOM id/class를 쿼리하므로, 레슨별 HTML은 그 골격을 정확히 재현해야 한다 → 엔진별 "필수 골격" 주석을 `_engine/`에 명시(불일치=조용한 깨짐 방지).

### 4.1 엔진 인벤토리 (수정 범위)
| 엔진 | 그룹 | 리팩터 | 인스턴스(레슨) |
|---|---|---|---|
| step-debugger | 2 | **config 주입 리팩터** | CH04-L01·L05·L06 · CH05-L01·L05 · CH10-L07 |
| fill-blank | 1 | 데이터=마크업(소) | CH02-L06 · CH04-L02·L07 |
| before-after | 1 | CSS-only | CH02-L05 · CH07-L03 |
| diff-mapper | 1 | 데이터=마크업(소) | CH18-L06·L07 |
| select-query | 2 | **config 주입 리팩터** | CH08-L02(✅) · CH12-L07 |
| salv-grid | 2 | **config 주입 리팩터** | CH11-L02(✅) · CH11-L06 |
| relationship-map | 1 | CSS-only | CH22-L03 |
| state-change-grid | 1 | CSS-only | CH06-L06 |
| mermaid | 1 | +vendor | CH04-L03(IF) ※이벤트버전 은퇴 |
| domain-builder | 2 | 리팩터(프리셋) | CH03-L01(✅) |
| input-help-priority | 1 | 정적 | CH09-L07(✅) |
| write-output / write-format / event-lifecycle | 2 | 리팩터(프리셋) | CH01-L04(✅)·L05(✅) · CH15-L01(✅) |

### 4.2 신규 엔진 (수정에 필요 — 9건)
| 신규 엔진 | 레슨 | 비고 |
|---|---|---|
| se38-first-program | CH01-L02 | 개발 루프(작성→저장→활성화→실행) 상태머신 |
| se93-tcode-create | CH01-L07 | SE93 생성 + 명령창 실행 |
| case-branch-sim | CH04-L04 | 등급 입력→WHEN 분기 |
| join-aggregate-visualizer | CH13-L08 | LEFT OUTER JOIN + GROUP BY + SUM |
| gui-alv-grid-simulator | CH17-L07·L10 | CL_GUI_ALV_GRID(container·fieldcat·set_table) — SALV와 별개 |
| dynpro-screen-elements | CH16-L03 | 입력·버튼·체크박스·라디오·드롭다운(VRM) |
| class-object-diagram | CH20-L01 | 설계도↔인스턴스 |
| inheritance-hierarchy | CH20-L07 | 상속 트리(mermaid 활용 가능) |
| class-structure-diagram | CH20-L10 | PUBLIC/PRIVATE 멤버 |
| (process-flow 변형) | CH16-L01 | PBO/PAI 사이클(엔진 재사용 + 루프 화살표) |

## 5. 재배치 처리 (이번엔 보존+표시만)
- 오배치 레슨은 **올바른 레슨 전용 콘텐츠로 수정**(포함).
- 주인 없어진 원본 콘텐츠(before-after=N+1·diff-mapper=SELECT성능·decision-tree=내부테이블타입·relationship-map=HR/SD·static-svg=풀스택·sap-gui-sandbox=SE16N)는 **`sample/`에 보존 + `_index.md`에 "적정 홈 = CHxx (후속 신규)" 표시**. 실제 배치는 후속.
- mermaid 이벤트 버전 = CH15-L01에 더 우수한 event-lifecycle-buildup이 있으므로 **은퇴**(sample 참고로만).

## 6. 실행 — Pre-work (1회)
- **P0. shell.js 점검** — 위젯의 `postMessage({sda:'embed-height'})` 자동높이 핸드셰이크 리스너 존재 확인(없으면 추가). 실제 레슨 페이지 높이 정합 선결.
- **P1.** `embeds/{abap,_engine,_vendor}/` 생성.
- **P2.** `_engine/_base.css` 추출(공통 토큰/프리미티브).
- **P3.** Group1·2 엔진 → `_engine/<engine>.{js,css}` 추출. Group2(step-debugger·select-query·salv-grid·domain-builder·write-*·event-lifecycle)는 **데이터 외부주입(JSON 블록) 리팩터** + 엔진별 "필수 골격" 주석.
- **P4.** `mermaid.min.js` → `_vendor/` 로컬 백업, 위젯은 CDN 우선 + 실패 시 로컬 fallback.
- **P5.** `build-curriculum.mjs` `embedExt` 교체(신규/레거시 동시지원, §3).
- **P6.** `embeds/abap/_index.md` 골격 작성.

## 7. 실행 — 챕터 루프 (CH01 → CH36, 챕터당)
1. 수정 인스턴스 `embeds/abap/CHnn-Lnn-Snn.html` 생성(공통 엔진 링크 + 데이터 / 신규 엔진은 제작).
2. ✅ 정상 건 복사+리네임 · 경미 건 처리.
3. 레슨 MD `::embed` 경로 → `CHnn-Lnn-Snn` 갱신.
4. `_index.md` 갱신.
5. `npm run build:abap`(parity 0) → **HTTP 서빙 후 브라우저 전수 검증**(렌더·콘솔0·인터랙션; P3 우회=preview_eval DOM 측정, P4 애니메이션 유의).
6. 챕터 커밋(content·sample·embeds·docs 포함; check/는 gitignore).

## 8. Post
- 전 챕터 이관 완료 후 빌드 **레거시 embed 분기 제거** → 최종 빌드·전수 재검증.

## 9. 검증 & DoD (학습수단 1개당)
내용 일치(레슨 시나리오) · 게이팅 준수(classic 구간 미래문법 0) · 이름풀(R9) · 빌드 parity 0 · 콘솔 0 · **브라우저 렌더/인터랙션 확인** · `_index.md` 등재.

## 10. 산출물
`embeds/abap/*.html`(36) · `embeds/_engine/*`(+`_base.css`) · `embeds/_vendor/mermaid.min.js` · `embeds/abap/_index.md` · 갱신 `content/abap/**.md` · `tools/build-curriculum.mjs` · 재생성 `docs/abap/**`.

## 11. 후속 (이번 제외)
- 체험 누락 레슨 신규 제작(CH02~09 일부·CH19~36 전 구간) — 우선 CH28·CH30·CH36.
- CDS/RAP/BDEF/MDE 신규(CH22·23·36) + 재배치 원본의 정적 홈 실제 배치.
