# 인수인계

## 현재 상태 (브랜치 feat/migration, 아직 push 안 함)
- Task 1~10 모두 구현·리뷰 완료: 골격, Spring 설정 API, FastAPI 기록/통계, 프론트 설정 동기화, 엔진, 공통 컴포넌트, 13개 게임 이식, PWA, Docker Compose, README 재작성.
- 브랜치 전체 최종 리뷰도 끝났고 지적 사항(입력 제한, GET 부작용, 설정 동기화 타임아웃, 공통 컴포넌트 정리)은 모두 수정했다.
- 남은 작업: 사용자가 push/merge 여부를 결정한다(계획서 Task 10 Step 4~5).

## 다시 시작하는 법
1. `.superpowers/sdd/2026-11-14-kids-mini-game-migration/progress.md`(git 제외)와 `git log`를 먼저 확인한다.
2. 계획서: docs/superpowers/plans/2026-11-14-kids-mini-game-migration.md
3. 실행은 README의 "실행 방법" 참고. Colima에서 Testcontainers 테스트는 `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock ./gradlew test`.

## 결정된 것
- 중간에 나간 판은 기록하지 않는다(completed는 종료 화면 도달 기준).
- 과일 게임의 원본 버그(과일이 바구니로 날아가지 않음)는 사용자 결정으로 고쳤다.
- Codex는 사용자가 업그레이드했지만 이 환경에서 비대화형 실행이 여전히 실패(플래그 오류, stdin 대기)해, 모든 이식을 직접 작성하고 테스트와 리뷰로 검증했다.

## 사용자에게 확인할 것
- push/merge: heamcoding 계정으로(원격은 heamcoding/kids-mini-game), 사용자 확인 후. 활성 gh 계정은 바꾸지 않고 `gh auth token --user heamcoding` 토큰을 일회성으로 사용.
- README 스크린샷 자리와 라이선스(현재 "미정") 결정.
- 로드맵 우선순위: 계정/로그인, 통계 화면, 운영 보강(restart·actuator·gzip/보안 헤더). CORS_ORIGINS와 요청 제한은 chore/pre-launch에서 처리함.
- 이월한 경미 사항(서비스 워커 캐시 이름, 같은 출처 API 캐시, `??` 대 `||`, deviceId 검증 등)은 docs/NOTES.md 참고.

## 막힌 것
- 없음
