---
id: CH23
track: TRACK-02
order: 23
title: "CDS View Entity 기초"
intro: "DB 계층에서 모델링하고 재사용하고 싶다."
keywords: ["CDS","View Entity","Association","Annotation"]
difficulty: "고급"
---

지금까지 조회는 프로그램 안의 SELECT였다. 그래서 같은 JOIN·필드 선택·라벨 맞추기가 리포트마다 반복되고, "이 금액은 어떤 통화와 짝인가", "이 공연은 어떤 회차와 이어지나" 같은 데이터의 뜻은 코드 밖에 흩어졌다. 이 챕터는 그 반복을 DB 계층의 **읽기 모델**로 끌어올린다. CDS View Entity로 모델을 선언하고, 재사용 기반(`ZI_`)과 소비 출구(`ZC_`)로 계층을 나누고, 관계(association)·뜻(annotation)·행 단위 권한(DCL)을 모델 가까이에 새기는 순서로 간다. 도착점은 콘서트앱의 `ZI_Concert`·`ZI_Perf`·`ZC_Concert` 계층이고, 이 읽기 모델은 다음 챕터에서 RAP(트랜잭션 프로그래밍 모델)가 올라설 기반이 된다.
