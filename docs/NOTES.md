# 작업 메모

형식: `- [날짜] [영역] 내용 — 상태(열림/해결)`

- [2026-11-14] [spring] 원본 openSettings 슬라이더 범위: scan 1~5(0.1), touchTime 5~30(1), voiceVol 0~100(5), fxVol 0~100(5) — 해결
- [2026-11-14] [spring] 슬라이더 범위: rate 0.5~1.3(0.05), pitch 0.6~1.8(0.1), gap 0~2(0.1), rounds 1~10(1); age 3|4|5, control both|touch|space — 해결
- [2026-11-14] [spring] start.spring.io는 Boot 4.x만 제공(3.x 거부) → 4.1.2로 wrapper만 받고 build.gradle은 Boot 3.5.7로 직접 지정 — 해결
- [2026-11-14] [spring] Docker 29에서 Boot 3.5.7 기본 Testcontainers(1.21.3)가 Docker를 못 찾음 → testcontainers.version 1.21.4로 고정 — 해결
- [2026-11-14] [frontend] 원본 choose(): 한 칸만 있을 때 스페이스 선택 가능 여부는 step()이 idx=0을 세팅해야 하는데 control='touch'면 step이 안 돌아 idx=-1로 남음(의도된 동작) — 원본 그대로 이식 — 해결
- [2026-11-14] [frontend] 원본 speak(): 화자가 말하는 중 새 speak 호출 시 cb 없는 대기 항목은 버려짐(cb 있는 것만 유지) — 원본 그대로 이식, 의도 여부 불명 — 열림
- [2026-11-14] [frontend] codex CLI: 기본 모델 gpt-5.6-sol이 현 CLI(0.142)에서 400(newer version required), -m gpt-5도 거부 → Task 5 이식은 Codex 대신 직접 작성 — 열림
- [2026-11-14] [frontend] Task 5 speaker.setPreview는 pickVoice()를 호출하지 않아 설정 '들어보기'에서 고른 목소리가 바로 적용 안 됨(원본은 setPreview 후 pickVoice) → setPreview 안에서 pickVoice() 호출하도록 수정 — 해결
- [2026-11-14] [frontend] 원본 설치 안내는 서비스워커 등록 성공(swOK) 여부로 문구를 갈랐지만 sw.js가 아직 없어 항상 '브라우저 메뉴' 문구로 표시(미설치·비iOS) → PWA/서비스워커 태스크에서 재검토 — 열림
- [2026-11-14] [frontend] 원본은 설정을 열면 chooser를 멈추고 저장 시 home()을 다시 실행해 재무장함. 초기 이식은 같은 route라 리마운트되지 않아 타일이 죽는 버그 → App의 screenKey로 매 화면 전환마다 리마운트, App.test.tsx로 검증 — 해결
- [2026-11-14] [frontend] 원본 .screen 안에 가이드(#guide)가 #app 직속이었음. React에서는 Screen이 직접 렌더(noGuide로 생략), 화면 전환 리셋은 useLayoutEffect(자식 say()가 지워지지 않게) — 해결
- [2026-11-14] [frontend] 원본 settings 오버레이는 body에 붙음 → 스케일된 #app 안 fixed 왜곡을 피하려 Overlay를 portal로 렌더 — 해결
