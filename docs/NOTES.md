# 작업 메모

형식: `- [날짜] [영역] 내용 — 상태(열림/해결)`

- [2026-11-14] [spring] 원본 openSettings 슬라이더 범위: scan 1~5(0.1), touchTime 5~30(1), voiceVol 0~100(5), fxVol 0~100(5) — 해결
- [2026-11-14] [spring] 슬라이더 범위: rate 0.5~1.3(0.05), pitch 0.6~1.8(0.1), gap 0~2(0.1), rounds 1~10(1); age 3|4|5, control both|touch|space — 해결
- [2026-11-14] [spring] start.spring.io는 Boot 4.x만 제공(3.x 거부) → 4.1.2로 wrapper만 받고 build.gradle은 Boot 3.5.7로 직접 지정 — 해결
- [2026-11-14] [spring] Docker 29에서 Boot 3.5.7 기본 Testcontainers(1.21.3)가 Docker를 못 찾음 → testcontainers.version 1.21.4로 고정 — 해결
