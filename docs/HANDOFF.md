# 인수인계

## 현재 상태 (브랜치 feat/migration, 아직 push 안 함)
- Task 1~10 모두 구현·리뷰 완료: 골격, Spring 설정 API, FastAPI 기록/통계, 프론트 설정 동기화, 엔진, 공통 컴포넌트, 13개 게임 이식, PWA, Docker Compose, README 재작성.
- 남은 작업: 브랜치 전체 최종 리뷰, 아래 사용자 결정, 사용자 확인 후 push(계획서 Task 10 Step 4~5).

## 다시 시작하는 법
1. `.superpowers/sdd/2026-11-14-kids-mini-game-migration/progress.md`(git 제외)와 `git log`를 먼저 확인한다.
2. 계획서: docs/superpowers/plans/2026-11-14-kids-mini-game-migration.md
3. 실행은 README의 "실행 방법" 참고. Colima에서 Testcontainers 테스트는 `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock ./gradlew test`.

## 사용자에게 확인할 것
- push: heamcoding 계정으로(원격은 heamcoding/kids-mini-game), 사용자 확인 후. 활성 gh 계정은 바꾸지 않고 `gh auth token --user heamcoding` 토큰을 일회성으로 사용.
- recordPlay의 completed는 "종료 화면 도달" 기준. 중간에 나간 판도 기록할지 결정 필요.
- README 스크린샷 자리와 라이선스(현재 "미정") 결정.
- 로드맵 우선순위: 계정/로그인, 통계 화면, CORS_ORIGINS, 운영 보강.
- Codex CLI(0.142.5)가 낡아 이식에 못 썼음(필요하면 업그레이드).

## 막힌 것
- 없음
