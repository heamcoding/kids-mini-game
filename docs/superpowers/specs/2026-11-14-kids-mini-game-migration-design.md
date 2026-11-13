# 몽실이와 놀이터 — 풀스택 전환 설계

## 의도와 이유
`Yunicode07/kids_game`(단일 `index.html`, 90KB, 백엔드 없음)을 React + Spring Boot + FastAPI + PostgreSQL 구조로 전환한다.
목적은 포트폴리오, 기술 공부, 실제 서비스 출시다. 그래서 (1) 역할이 분명한 구조, (2) 계정 관리를 나중에 붙일 수 있는 자리, (3) 아이가 노는 중에는 절대 멈추지 않는 동작이 중요하다.
원본 저장소는 수정하지 않는다. 결과물은 `heamcoding/kids-mini-game`(main, 현재 비어 있음)에 올린다.

## 목표
- 게임 동작과 화면을 원본과 동일하게 React로 이식한다. PWA/오프라인도 유지한다.
- 보호자 설정(나이, 쉬는 판 수 등 원본 `S` 객체)을 서버 DB에 저장한다.
- 나중에 계정/로그인/권한을 붙일 수 있게 `users` 테이블과 인증 자리(Spring Security)를 미리 둔다.
- `docker compose up` 한 번으로 전체가 뜬다.
- README 전체 재작성 (소개, 아키텍처, 실행법, API, 로드맵).
- 실행하며 발견한 오류와 수정 필요 사항은 `docs/NOTES.md`에 메모한다.
- 컨텍스트가 차면 `docs/HANDOFF.md`로 인수인계한다 (별도 handoff 스킬이 없으면 이 파일로 대체).

## 비목표 / 안티목표
- 이번 범위에서 로그인 UI와 실제 계정 기능은 만들지 않는다 (구조만 준비).
- 게임의 그림, 문구, 규칙은 바꾸지 않는다.
- 서버가 꺼져 있다고 게임이 멈추면 실패다 (안티목표).
- 원본 저장소에는 아무것도 push하지 않는다.

## 제약
- 로컬 환경: Java 21, Node 25, Python 3.14, Docker, codex CLI.
- GitHub는 `heamcoding` 계정으로 push해야 한다 (활성 계정은 `Yunicode07`). 커밋 작성자 이메일은 기본 `yhrim9507@gmail.com`인데, 이 저장소에 쓸 이메일은 `heamcoding@gmail.com` 이다.
- 원본의 스프라이트 PNG와 아이콘은 그대로 복사해 쓴다.

## 접근 방식 (선택: A)
| | 내용 | 득실 |
|---|---|---|
| **A (선택)** | Spring Boot가 DB와 핵심 API(설정, 계정)를 맡고, FastAPI는 보조 서비스(플레이 기록과 통계)를 맡는다. React가 둘 다 호출한다. | 역할이 분명하고 계정 기능을 확장하기 좋다. 서비스가 둘이라 초기 설정이 늘어난다. |
| B | FastAPI가 메인 API, Java는 일부 | 가볍지만 Java의 존재 이유가 약하다. |
| C | Spring Boot 단독 후 FastAPI 추가 | 빠르지만 요청한 스택과 다르다. |

## 결정된 구조 (제 판단 표시: 🔸)
```
kids-mini-game/
  frontend/          React(Vite, TypeScript 🔸) 게임 + PWA
  backend-spring/    Spring Boot 3 🔸, Gradle 🔸, JPA, Flyway 🔸
  backend-fastapi/   FastAPI, SQLAlchemy 🔸 (플레이 기록, 통계)
  docker-compose.yml PostgreSQL 🔸 + 두 API + frontend
  docs/              설계, NOTES.md, HANDOFF.md
  README.md
```
- DB: PostgreSQL 🔸. 스키마는 Spring의 Flyway 마이그레이션이 소유한다. FastAPI는 `play_records`만 쓰고 읽는다.
- 테이블: `users`(id, created_at; 지금은 기기별 익명 사용자 1명 🔸), `guardian_settings`(user_id, age, rounds, 기타 설정 JSON), `play_records`.
- 이미지 저장 🔸: 게임 스프라이트와 아이콘은 파일(`frontend/public/`)로 두고 DB에는 넣지 않는다. 서비스 워커가 URL 단위로 캐시해야 오프라인이 되고, nginx/CDN 캐시를 쓸 수 있으며, git으로 버전 관리된다. 나중에 사용자 업로드 이미지가 생기면 파일/오브젝트 스토리지에 저장하고 DB에는 경로와 메타데이터만 둔다.
- 공통 컴포넌트: 반복되는 UI와 폼은 `frontend/src/components/`의 공통 컴포넌트(화면, 버튼, 선택지 줄, 스프라이트, 설정 폼 입력 등)로 만들고 화면과 게임은 그것만 쓴다.
- 설정 저장 흐름: React는 서버에 저장하되 `localStorage`에도 항상 같이 쓴다. 서버 호출이 실패하면 `localStorage` 값으로 계속 진행하고, 서버가 돌아오면 동기화한다.
- 원본의 `index.html` 단일 스크립트는 화면(컴포넌트), 오디오, 타이머, 설정 저장(훅/서비스) 단위로 나눈다. 로직은 Codex로 구조 개선하되, 동작이 바뀌면 안 된다.

## 작업 방식
1. 원본을 읽고 모듈 경계를 문서화한다.
2. `codex:rescue`로 로직 이식과 리팩터링을 위임하고, 결과를 제가 검토한다.
3. 각 단계마다 실제로 실행해 확인하고, 오류와 수정이 필요한 부분은 `docs/NOTES.md`에 적는다.
4. 컨텍스트가 차기 전에 `docs/HANDOFF.md`를 갱신한다.
5. 작은 단위로 커밋하고, 마지막에 `heamcoding/kids-mini-game` main에 push한다 (push 전에 한 번 확인받는다).

## 빌더에게 남기는 것 (🔸)
- 컴포넌트 분할 세부, 상태 관리 라이브러리 선택 (기본은 React 내장 훅).
- 플레이 기록의 필드 구성.
- 테스트 범위: Spring과 FastAPI는 API 테스트, React는 설정 훅 위주.
