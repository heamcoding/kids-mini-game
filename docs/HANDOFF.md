# 인수인계

## 현재 상태 (브랜치 feat/migration, 아직 push 안 함)
- 완료·리뷰 통과: Task 1 골격, 2 Spring 설정 API, 3 FastAPI 기록/통계, 4 프론트 설정 동기화, 5 엔진 모듈, 6 공통 컴포넌트와 화면 틀
- Task 7 게임 이식: 1묶음(fruit, chick, owl, squirrel) 구현 완료(커밋 c01cf5f). 리뷰 에이전트 결과 대기 중이었음. 2묶음(pop, memory, same, bear), 3묶음(mole, size, num, abc, kor)은 아직 플레이스홀더.
- 남은 작업: Task 7 리뷰와 2·3묶음, Task 8 PWA, Task 9 Docker Compose, Task 10 README 재작성과 push.

## 다시 시작하는 법
1. `.superpowers/sdd/2026-11-14-kids-mini-game-migration/progress.md`(git 제외)와 `git log`를 먼저 확인한다.
2. 계획서: docs/superpowers/plans/2026-11-14-kids-mini-game-migration.md, 실행 방식은 subagent-driven.
3. Docker: `colima start` 후 Testcontainers 테스트는 `DOCKER_HOST=unix://$HOME/.colima/default/docker.sock TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock ./gradlew test`.

## 사용자에게 확인할 것
- Codex CLI(0.142.5)가 너무 낡아 이식에 못 썼음. 쓰려면 업그레이드 필요.
- 원본 과일 게임 버그(과일이 바구니로 날아가지 않음)를 원본대로 유지 중. 고칠지 결정 필요.
- recordPlay의 completed는 "종료 화면 도달" 기준. 중간 종료 기록 여부 결정 필요.
- push는 heamcoding 계정으로, 마지막에 사용자 확인 후.

## 막힌 것
- 없음
