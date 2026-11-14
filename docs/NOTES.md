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
- [2026-11-14] [frontend] Task 7① 원본 fruitGame의 fly(k)는 바구니 상자에서 `svg`를 찾지만 바구니는 `<img>`라 항상 바로 return → 과일이 바구니로 날아가는 애니메이션이 원본에서 한 번도 안 보임. 사용자 결정으로 수정: 목표를 바구니 이미지로 바꿔 과일 복제본이 가지에서 바구니로 날아가고(g.raf로 이동, g.timeout 650ms 뒤 제거) 바구니가 pop. 개수·이미지 교체 타이밍(120ms)은 원본 그대로 — 해결
- [2026-11-14] [frontend] Task 7① 원본 chickGame 3세: opts=3, max=3이라 보기는 항상 1·2·3(순서만 섞임) — 원본 그대로 — 해결
- [2026-11-14] [frontend] Task 7① 원본 fruitGame의 주사위 결과는 시작 때 정해짐(35% 확률로 까마귀 승, 그때 아이는 과일 F-1~F-3개만 받음) — makePlan()으로 분리·테스트, 원본 그대로 — 해결
- [2026-11-14] [frontend] Task 7① 게임 스크립트는 첫 렌더 직후 microtask에서 시작(useGame). 원본 innerHTML 즉시 반영을 흉내내려 상태 변경은 flushSync(commit)로 바로 DOM에 반영하고, 동적 class(attn/gone/pop/nope/picked/scan)는 chooser와 충돌하지 않게 classList로만 다룸 — 해결
- [2026-11-14] [frontend] Task 7① 공용 추가: engine chooser.pick(i)(과일 '아무 데나 탭' = 원본 chooser.pick(0)), fit getScale()(원본 SC), korean KNUM, Screen onClick, components/ColorTile(COLS/MARKS/tile), components/PressButton(주사위·카드·돌림판 + '눌러요!'), games/shared(useGame, armPress, flash/attn/anim, rnd/shuffle) — 해결
- [2026-11-14] [frontend] Task 7① recordPlay는 GAMES의 def()에서 withRecordPlay로 한 번 감쌈(아직 placeholder인 9개 게임도 '끝내기' 시 기록됨). completed는 onFinish 때만 보내므로 항상 true — 까마귀가 이긴 과일 판도 true. 중간에 홈/설정으로 나간 판은 기록 안 함(원본에 없는 기능이라 추가 안 함) — 열림(기록 정책 결정 필요)
- [2026-11-14] [frontend] Task 7① 다람쥐 하트 장식은 원본처럼 #sqr 안에 DOM으로 붙였다 1.5초 뒤 제거(React 밖의 임시 노드) — 해결
- [2026-11-14] [frontend] Task 7① 리뷰 수정: useGame에 g.say(콜백은 언마운트 후 무시), g.interval, g.raf 추가, 언마운트 시 타이머·interval·rAF·오버레이 정리와 engine.stopChoose(). 언마운트 뒤 늦게 끝난 말 콜백이 사라진 버튼에 choose를 걸어 TypeError 나던 버그(병아리) 해결 — 해결
- [2026-11-14] [frontend] Task 7① withRecordPlay가 onFinish 중복 호출 시 두 번 기록·두 번 셸 전달하던 것 → done ref로 1회만 — 해결
- [2026-11-14] [frontend] Task 7① 게임 무작위는 games/shared/random의 random()/setRandom()으로 일원화(테스트에서 시드 PRNG 주입). 테스트용 engine chooser.items() 추가 — 해결
- [2026-11-14] [frontend] Task 7② pop/memory/same/bear 이식. Codex(-s workspace-write)는 첫 시도에서 `--full-auto` 플래그가 없어 실패, 둘째 시도는 stdin 대기(`</dev/null` 필요) 후 10분 넘게 산출물 없이 멈춰 중단 → 4게임 모두 직접 작성 — 해결
- [2026-11-14] [frontend] Task 7② 공용 추가: games/shared/friends.ts(FRIENDS/friendKeys: size 게임이 재사용), components/DiceFace(원본 dots), components/SpeakerIcon, TapButton onPointerDown(곰 접시에서 눌린 사탕 판별) — 해결
- [2026-11-14] [frontend] Task 7② 원본 popGame 통 돌리기 애니메이션은 매 프레임 innerHTML 재구성 → logic.scene()이 구멍/막대 좌표를 계산하고 React가 그리며, setTimeout(16) 트윈은 g.timeout으로 이어 붙임(성능은 performance.now 기준 그대로). 토끼 오버레이는 g.overlay — 해결
- [2026-11-14] [frontend] Task 7② 원본 sameGame 보기 버튼에는 aria-label이 없음(img alt가 이름) — 원본 그대로, '다시 듣기' 버튼은 control!=='space'일 때만 말함 — 해결
- [2026-11-14] [frontend] Task 7② 원본 memoryGame 3라운드는 memoryGame(round+1)로 화면을 새로 그림 → 같은 컴포넌트에서 round state와 key로 카드를 새로 만들고 덱을 다시 섞음(화면 재마운트 아님이라 안내 말풍선이 지워지지 않고 이어짐) — 열림
- [2026-11-14] [frontend] Task 7② 검증: 브라우저에서 pop/memory/bear/same을 3·4·5세로 끝까지 실행(4세 same은 같은 연속 실행 중 콘솔 타임아웃으로 완료 로그를 못 받음, 3·5세는 확인). 사람이 직접 눌러 본 것은 아니고 JS 봇이 버튼을 클릭 — 열림
