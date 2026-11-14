# 몽실이와 놀이터 (Kids Mini Game)

3~5세 아이를 위한 13가지 미니게임 모음입니다. 단일 `index.html`로 만들어진 원본 게임을
**React + TypeScript 프론트엔드, Spring Boot 설정 API, FastAPI 기록/통계 API, PostgreSQL** 구조의
모노레포로 옮겼습니다. 포트폴리오, 학습, 실제 서비스 출시를 함께 목표로 한 프로젝트입니다.

> English summary: a toddler mini-game collection (13 games, offline-capable PWA) migrated from a single-file
> prototype to a React/TypeScript frontend, a Spring Boot settings API, a FastAPI play-record/stats API and PostgreSQL,
> all runnable with one `docker compose up`.

<!-- TODO: 스크린샷 자리. docs/screenshots/ 에 이미지를 넣고 아래 줄의 주석을 풀어 주세요.
![시작 화면](docs/screenshots/home.png)
-->
*(스크린샷은 아직 없습니다. 준비되면 이 자리에 추가합니다.)*

## 주요 기능

- 13개 게임: 과일 따기, 병아리 세기, 부엉이 둥지로, 다람쥐 도토리, 깜짝 통, 짝 찾기, 같은 그림 찾기, 곰돌이 간식,
  두더지 잡기, 크다 작다, 숫자 찾기, ABC 찾기, 가나다 찾기. 화면과 동작은 원본과 같게 옮겼습니다.
- 터치와 스페이스 키 두 가지 조작(보호자 설정에서 선택), 음성 안내(Web Speech API)와 효과음.
- 보호자 설정(나이, 스캔/터치 시간, 조작 방식, 음량, 판 수, 목소리 등)을 서버 DB에 저장. 설정 버튼을 3초 길게 눌러 엽니다.
- 오프라인 우선: 서버가 꺼져 있어도 게임은 멈추지 않습니다. PWA로 설치하면 인터넷 없이도 놀 수 있습니다.
- 게임을 끝낼 때 플레이 기록(게임, 나이, 걸린 시간, 완료 여부)을 FastAPI에 남기고 `/stats`로 집계합니다.

## 아키텍처

```
 Browser (React SPA + Service Worker, localStorage)
    |  같은 출처(origin) 요청만 보냄. X-Device-Id 헤더로 기기를 구분
    v
 nginx :3000 (frontend 컨테이너)  정적 파일 + /api/* 리버스 프록시 + IP별 요청 제한(10r/s, burst 20, 초과 시 429)
    |
    +-- /api/settings ------> Spring Boot :8080   GET/PUT
    |                              |  JPA + Flyway (스키마 소유자)
    |                              v
    |                         PostgreSQL :5432  <-- users, guardian_settings, play_records
    |                              ^
    +-- /api/records, /api/stats -> FastAPI :8000  POST /records, GET /stats (nginx가 /api를 떼고 전달)
                                       SQLAlchemy (play_records를 읽고 씀)
```

- **스키마는 Flyway가 소유합니다.** `backend-spring/src/main/resources/db/migration/V1__init.sql`이 `users`,
  `guardian_settings`(jsonb), `play_records`를 만들고, Spring은 `ddl-auto: validate`로 검증만 합니다. FastAPI는
  `play_records` 모델을 따로 두되 테이블을 만들지 않으므로, compose에서 FastAPI는 Spring이 healthy가 된 뒤에 시작합니다.
- **오프라인 우선 설정.** 설정은 먼저 `localStorage`에 저장하고 서버에는 동기화합니다. 저장 요청이 실패하면
  "보류 중" 표시(`mongsil-settings-pending`)를 남겨 두었다가 다음 기회에 다시 보냅니다. 서버에서 받은 값은
  범위를 보정(clamp)해서 씁니다. 기록 전송은 3초 타임아웃에 실패해도 예외를 던지지 않아 게임 흐름을 막지 않습니다.
- **서비스 워커.** 빌드 때 `vite-plugins/swPrecache.ts`가 `dist`의 모든 파일(해시가 붙은 번들 포함)을 `public/sw.js`의
  프리캐시 목록에 채워 넣습니다. 같은 출처 GET과 구글 폰트는 런타임에도 cache-first로 처리합니다.
- **익명 기기 ID.** 로그인 없이 브라우저가 만든 UUID(`localStorage`의 `mongsil-device-id`)를 `X-Device-Id` 헤더로 보냅니다.
  Spring은 첫 저장(`PUT`) 때 `users(device_id)` 행을 만들어 설정을 연결합니다(`GET`은 조회만 하고 행을 만들지 않습니다). 이후 보호자 계정을 붙일 때 `users` 테이블과
  `SecurityConfig`(지금은 전부 허용, TODO 표시)가 그 자리입니다.
- **눈여겨볼 설계 결정**
  - 이미지는 DB blob이 아니라 파일(`frontend/public/sprites`)로 두고 서비스 워커가 캐시합니다.
  - 원본의 거대한 단일 스크립트를 엔진(`engine/`: 음성, 오디오, 스케줄러, 선택기, 한글 처리), 공용 컴포넌트와 훅
    (`components/`, `games/shared/useGame`, `QuizGame`), 설정 모듈로 나눴습니다. 숫자/ABC/가나다 찾기는 `QuizGame` 하나를 공유합니다.
  - 게임마다 e2e 성격의 테스트(`games/e2e.test.tsx`, `smoke.test.tsx`)가 있고, 무작위는 시드 주입이 가능하게 일원화했습니다.

## 기술 스택

| 영역 | 사용 기술 |
| --- | --- |
| 프론트엔드 | React 18, TypeScript, Vite, Vitest + Testing Library, Service Worker(PWA) |
| 설정 API | Spring Boot 3.5.7, Java 21, Gradle, Spring Data JPA, Flyway, Bean Validation, Spring Security(자리만) |
| 기록/통계 API | FastAPI, Pydantic, SQLAlchemy 2, psycopg 3, uvicorn, pytest |
| DB | PostgreSQL 16 |
| 배포 | Docker Compose, nginx |

## 실행 방법

### Docker (권장)

Docker와 Docker Compose가 필요합니다.

```bash
cp .env.example .env        # POSTGRES_PASSWORD 등을 원하는 값으로 바꾸세요
docker compose up --build
```

| 서비스 | 주소 |
| --- | --- |
| 게임(frontend) | http://localhost:3000 |
| API (nginx 경유) | http://localhost:3000/api/settings, `/api/records`, `/api/stats` |
| Spring (디버깅용, 이 컴퓨터에서만 접속) | http://localhost:8080 |
| FastAPI (디버깅용, 이 컴퓨터에서만 접속) | http://localhost:8000 (`/health`, `/docs`) |

종료는 `docker compose down`(DB 볼륨 `pgdata`는 유지, 데이터까지 지우려면 `-v`).
브라우저는 같은 출처의 `/api/*`만 부르므로 별도 주소 설정이 필요 없습니다. API를 다른 출처에 두는 경우에만
`.env`의 `VITE_API_URL`(빌드 시점 값)과 `CORS_ORIGINS`를 설정하고 `docker compose up --build`로 다시 빌드하세요.
두 백엔드 포트는 `127.0.0.1`에만 열려 있어 외부에서는 nginx를 거쳐야 합니다.

### 로컬 개발

**프론트엔드** (Node 필요)

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173 (Vite가 /api/*를 localhost:8080 / 8000으로 프록시)
npm test           # Vitest
npm run build      # 타입 검사 + 빌드
```

**PostgreSQL** (두 백엔드가 같은 DB를 씁니다). compose의 `db`는 포트를 호스트에 열지 않으므로, 로컬 개발용으로는 따로 띄웁니다.

```bash
docker run -d --name kids-pg -e POSTGRES_DB=kidsminigame -e POSTGRES_USER=kids \
  -e POSTGRES_PASSWORD=kids -p 5432:5432 postgres:16
```

**Spring** (Java 21)

```bash
cd backend-spring
./gradlew bootRun   # 기본값: localhost:5432/kidsminigame, kids/kids. 바꾸려면 DB_URL, DB_USER, DB_PASSWORD, PORT
./gradlew test      # Testcontainers가 Docker를 사용합니다
```

macOS에서 Colima를 쓰면 테스트 때 이렇게 실행해야 합니다.

```bash
DOCKER_HOST=unix://$HOME/.colima/default/docker.sock \
TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE=/var/run/docker.sock ./gradlew test
```

**FastAPI** (Python 3.12 권장. Spring을 먼저 한 번 실행해 Flyway가 테이블을 만든 뒤에 시작하세요)

```bash
cd backend-fastapi
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
DATABASE_URL=postgresql+psycopg://kids:kids@localhost:5432/kidsminigame uvicorn app.main:app --port 8000
pytest              # SQLite 인메모리로 실행, DB 불필요
```

### 테스트

2026-11-14에 직접 실행해 확인한 결과입니다.

| 영역 | 명령 | 결과 |
| --- | --- | --- |
| frontend | `npm test` | 45개 파일, 285 통과, 6 skipped |
| backend-fastapi | `pytest` | 12 통과 |
| backend-spring | `./gradlew test` | 8 통과 (Testcontainers/PostgreSQL) |

## API

모든 요청은 기기를 구분하는 `X-Device-Id: <UUID>` 헤더가 필요합니다. 헤더가 없거나 UUID가 아니면 `400`입니다.

| 서비스 | 메서드 · 경로 | 요청 | 응답 | 상태 코드 |
| --- | --- | --- | --- | --- |
| Spring | `GET /api/settings` | 헤더만 | `SettingsDto` JSON. 저장된 값이 없으면 기본값(행을 만들지 않는 순수 조회) | 200, 400 |
| Spring | `PUT /api/settings` | `SettingsDto` JSON | 저장된 `SettingsDto` | 200, 400(헤더 오류 또는 범위/형식 위반) |
| FastAPI | `POST /records` | `{game_id, age?, duration_ms, completed}` | `{id}` | 201, 400(헤더), 422(본문 검증 실패: `game_id`는 소문자 1~16자, `age`는 3~5 또는 null, `duration_ms`는 0~2147483647) |
| FastAPI | `GET /stats` | 헤더만 | `{total_plays, by_game:[{game_id, plays, completed, avg_duration_ms}]}` (해당 기기만) | 200, 400 |
| FastAPI | `GET /health` | 없음 | `{"status":"ok"}` | 200 |

`SettingsDto` 필드와 허용 범위(`backend-spring/.../SettingsDto.java`, 원본 설정 슬라이더 범위):

| 필드 | 타입 | 범위 | 기본값 |
| --- | --- | --- | --- |
| `age` | 정수, null 가능 | 3~5 | null |
| `scan` | 숫자 | 1.0~5.0 | 3 |
| `touchTime` | 숫자 | 5.0~30.0 | 10 |
| `control` | 문자열 | `both`, `touch`, `space` | `both` |
| `voiceVol`, `fxVol` | 정수 | 0~100 | 80, 60 |
| `rounds` | 정수 | 1~10 | 5 |
| `rate` | 숫자 | 0.5~1.3 | 0.9 |
| `pitch` | 숫자 | 0.6~1.8 | 1.5 |
| `gap` | 숫자 | 0.0~2.0 | 0.6 |
| `voiceName` | 문자열 | 최대 200자, null 불가 | `""` |

```bash
D=11111111-1111-4111-8111-111111111111
curl localhost:3000/api/settings -H "X-Device-Id: $D"
curl -X POST localhost:3000/api/records -H "X-Device-Id: $D" -H 'Content-Type: application/json' \
  -d '{"game_id":"num","age":4,"duration_ms":1234,"completed":true}'
curl localhost:3000/api/stats -H "X-Device-Id: $D"
```

## 폴더 구조

```
.
├── frontend/           Vite + React + TS. src/{engine,components,shell,settings,games/*,styles}, public/{sprites,icons,sw.js}
│   ├── vite-plugins/   빌드 시 서비스 워커 프리캐시 목록을 채우는 플러그인
│   ├── nginx.conf      SPA fallback과 캐시 헤더
│   └── Dockerfile
├── backend-spring/     설정 API. com.kidsminigame.{settings,config,user}, Flyway 마이그레이션
├── backend-fastapi/    기록/통계 API. app/{main,routes,models,schemas,db}.py, tests/
├── docker-compose.yml  db, spring, fastapi, frontend
├── .env.example        compose 환경 변수 예시 (.env는 커밋하지 않음)
└── docs/               NOTES.md(작업 메모), HANDOFF.md, superpowers/{specs,plans}
```

## PWA 설치 방법

https 주소(또는 `localhost`)에서 한 번 연 뒤에는 인터넷 없이도 놀 수 있습니다. 컴퓨터에서 `index.html`을 더블클릭해서
여는 방식으로는 설치할 수 없습니다.

- 안드로이드, PC(Chrome, Edge): 화면 오른쪽 위 톱니 버튼을 3초 길게 눌러 "앱 설치" 메뉴에서 "앱으로 설치하기"를 누릅니다.
  버튼이 안 보이면 브라우저 메뉴(⋮)에서 "앱 설치" 또는 "홈 화면에 추가"를 누릅니다.
- 아이폰, 아이패드: Safari로 주소를 열고 공유 버튼, "홈 화면에 추가"를 누릅니다.
- 그림이나 코드를 바꿔 다시 배포할 때: 원본은 `sw.js`의 캐시 이름을 손으로 올려야 했습니다. 이 프로젝트는 빌드가
  `dist`의 모든 파일 내용으로 캐시 이름(`mongsil-<해시>`)을 만들어 넣으므로, 그림 한 장만 바뀌어도 설치된 앱이 새로 받고
  옛 캐시는 지웁니다.

## 로드맵과 알려진 한계

계획:

- [x] API 리버스 프록시와 요청 제한(nginx `limit_req`)
- [ ] 보호자 계정/로그인 (Spring Security 자리 `SecurityConfig` 활용, 익명 기기 데이터를 계정으로 옮기는 흐름 포함)
- [ ] 개인정보·어린이 서비스 점검: 출시 전에 `docs/PRIVACY-CHECKLIST.md`의 질문을 전문가와 확인
- [ ] FastAPI `/stats`를 보여 주는 통계 화면 (지금은 API만 있고 화면이 없음)
- [x] `CORS_ORIGINS` 환경 변수로 허용 origin 설정
- [ ] 운영 보강: compose `restart` 정책, Spring actuator 헬스체크, nginx gzip과 보안 헤더
- [x] 중간에 나간 판은 기록하지 않기로 결정 (끝낸 판만 `completed: true`로 기록)

알려진 한계:

- 로그인이 없어 `X-Device-Id`만 알면 그 기기의 설정과 통계를 읽고 쓸 수 있습니다. 민감한 정보는 저장하지 않습니다.
- 공개 엔드포인트에 인증과 요청 제한(rate limiting)이 없습니다. 입력은 검증하지만(기록: `game_id` 소문자 1~16자,
  `age` 3~5, `duration_ms` 0~2147483647 / 설정: 범위·형식 검증, `GET /api/settings`는 행을 만들지 않음) 누구나 새
  기기 ID로 쓰기를 반복할 수 있습니다. nginx가 IP당 초당 10건(burst 20)으로 제한하지만 다른 프록시/CDN 뒤에 두면 실제 클라이언트 IP를 복원해야 하고(`nginx.conf` 주석 참고), 기기 ID는 누구나 바꿀 수 있어 인증을 대신하지 못합니다.
- 원본의 사소한 동작은 일부러 그대로 둡니다(예: 문제 제한 시간 직전 오답일 때 정답 공개 중에도 고를 수 있는 경우).
  목록은 `docs/NOTES.md`에 있습니다. 과일 게임의 "과일이 바구니로 날아가지 않는" 원본 버그만 고쳤습니다.
- 브라우저 검증은 자동화 스크립트로 했고 사람이 직접 모든 게임을 눌러 본 것은 아닙니다. 실제 설치(beforeinstallprompt)와
  iOS 동작, 오프라인에서의 구글 폰트는 확인하지 못했습니다.

## 원본과 라이선스

원본 게임은 [Yunicode07/kids_game](https://github.com/Yunicode07/kids_game)(단일 `index.html`)입니다. 게임 규칙, 화면, 문구는
그 저장소를 바탕으로 옮겼고, 스프라이트 PNG와 앱 아이콘도 원본에서 가져왔습니다. 원본 저장소는 수정하지 않았습니다.

라이선스: 미정
