# CH26 · Lock Object와 동시성 제어 — 커리큘럼 개요

> 🤖 **생성물** — `tools/export-curriculum-md.mjs`(= `npm run build:curriculum-md`)로 자동 생성. **직접 수정 금지**, 내용은 `content/abap/**.md` front-matter에서 고치고 재생성한다.
> 🎯 **TRACK-03 · ABAP 실무 심화** 소속 챕터 1개 전용 뷰 — 전체는 curriculum.md.
> 📊 레슨 5
> 🕒 생성: 2026-08-01T20:47:11.028Z

학습 철학: 분류 순서로 외우지 않고, **불편을 먼저 겪고 그 해결책으로 개념을 배우는** 동기부여형. SQL은 CH07~16 classic → CH18+ modern 경계.

---

### CH26 · Lock Object와 동시성 제어 _(난이도: 중급)_

> 여러 사용자가 동시에 같은 데이터를 건드린다 — 잠금이 필요하다.

**키워드**: Lock Object, ENQUEUE, DEQUEUE

**레슨 (5)**
- **CH26-L01 · Lock Object 설계 기준** _(order 1)_
  - 다룰 내용: 동시 변경을 막는 장치 — Lock Object와 잠금 모드.
  - 키워드: Lock Object, SE11, 잠금 모드, ENQUEUE
- **CH26-L02 · ENQUEUE / DEQUEUE Function Module** _(order 2)_
  - 다룰 내용: 잠그고 푼다 — 자동 생성된 ENQUEUE/DEQUEUE 호출.
  - 키워드: ENQUEUE, DEQUEUE, Function Module
- **CH26-L03 · Lock 해제와 예외 처리** _(order 3)_
  - 다룰 내용: 언제 풀리나 — COMMIT/ROLLBACK과 자동 해제.
  - 키워드: DEQUEUE_ALL, foreign_lock, 자동 해제
- **CH26-L04 · 다중 사용자 변경 충돌 시나리오** _(order 4)_
  - 다룰 내용: 다중 사용자 환경에서 발생하는 데이터 수정 손실 문제와 낙관/비관적 잠금.
  - 키워드: Lost Update, Optimistic, Pessimistic, 충돌
- **CH26-L05 · Lock Object와 COMMIT/ROLLBACK 연결** _(order 5)_
  - 다룰 내용: 잠금–읽기–변경–커밋–해제의 한 흐름.
  - 키워드: Lock, COMMIT, ROLLBACK, 패턴
