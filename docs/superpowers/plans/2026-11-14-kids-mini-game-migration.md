# 몽실이와 놀이터 풀스택 전환 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 `index.html` 게임(원본 `Yunicode07/kids_game`)을 React + Spring Boot + FastAPI + PostgreSQL 모노레포로 옮기고 `heamcoding/kids-mini-game`에 올린다.

**Architecture:** React(Vite/TS)가 게임을 그린다. 보호자 설정은 Spring Boot가 PostgreSQL에 저장하고(`X-Device-Id` 헤더로 기기별 익명 사용자 식별), 플레이 기록은 FastAPI가 같은 DB의 `play_records`에 쓰고 통계를 읽는다. 설정은 항상 `localStorage`에도 같이 저장해 서버가 꺼져도 게임이 계속된다.

**Tech Stack:** React 18, Vite, TypeScript, Vitest / Spring Boot 3 (Java 21, Gradle, JPA, Flyway) / FastAPI, SQLAlchemy, pytest / PostgreSQL 16 / Docker Compose

**Spec:** `docs/superpowers/specs/2026-11-14-kids-mini-game-migration-design.md`
**원본 코드 위치(읽기 전용):** `/private/tmp/claude-501/-Users-yunhyerim-Documents/38410dda-8d82-42cf-8db4-56c7f0c29633/scratchpad/src/kids_game/index.html` (이하 `ORIG`)

## Global Constraints

- 원본 저장소 `Yunicode07/kids_game`에는 push하지 않는다. 결과물은 `heamcoding/kids-mini-game` `main`에만 올린다.
- 커밋 작성자: 이 저장소 로컬 설정으로 `user.email=heamcoding@gmail.com`. 커밋 메시지 끝에 `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- push는 `heamcoding` 계정으로 하고, push 직전에 사용자에게 한 번 확인받는다.
- 게임의 그림, 문구, 규칙은 바꾸지 않는다. 스프라이트/아이콘은 그대로 복사한다.
- 서버가 꺼져 있어도 게임은 멈추지 않는다.
- 이번 범위에서 로그인 UI와 계정 기능은 만들지 않는다 (`users` 테이블과 Spring Security 자리만).
- `docker compose up` 한 번으로 전체가 뜬다.
- 실행 중 발견한 오류와 수정 사항은 `docs/NOTES.md`에, 컨텍스트가 차기 전 `docs/HANDOFF.md`에 기록한다.
- 이미지는 파일로 두고 DB에 저장하지 않는다 (`frontend/public/sprites`). DB에는 이미지 컬럼이나 blob을 만들지 않는다. 사용자 업로드 이미지는 이번 범위 밖이며, 생기면 경로와 메타데이터만 DB에 둔다.
- 반복되는 UI와 폼은 `src/components/`의 공통 컴포넌트로 만들고, 화면과 게임은 그것만 쓴다 (같은 마크업/스타일을 화면마다 복사하지 않는다). 설정 패널의 슬라이더/선택 입력도 공통 폼 컴포넌트를 쓴다.
- 로직 이식과 리팩터링은 `codex:rescue`로 위임하고 결과는 직접 검토한다 (Task 5~8).

## Review Focus

1. 서버 응답이 없거나 5xx일 때 설정 읽기/쓰기: 게임은 `localStorage` 값으로 계속된다 (Task 4 테스트).
2. `localStorage`의 설정 JSON이 깨졌거나 일부 키만 있을 때: 깨진 값은 무시하고 `BASE`로 채운다 (Task 4 테스트).
3. 범위 밖 설정값(`rounds: 0`, `voiceVol: 500`, `age: 9`): 서버는 400, 클라이언트는 범위로 보정한다 (Task 2, 4 테스트).
4. `speechSynthesis`/`AudioContext`가 없는 브라우저: 소리 없이 진행하고 예외를 던지지 않는다 (Task 5 테스트).
5. 한글 조사/숫자 함수(`eul`, `iya`, `kor`): 받침 유무와 10 이상 수에서 원본과 같은 결과 (Task 5 테스트).

---

### Task 1: 저장소 골격과 문서 파일

**Files:**
- Create: `frontend/`, `backend-spring/`, `backend-fastapi/` (빈 디렉터리는 `.gitkeep`), `docs/NOTES.md`, `docs/HANDOFF.md`, `.gitignore`, `.gitattributes`
- Copy: `ORIG/../sprites/*`, `icons/*`, `manifest.webmanifest` → `frontend/public/` 아래 같은 이름

**Interfaces:**
- Produces: 디렉터리 구조, `docs/NOTES.md`(제목 `# 작업 메모`, 항목 형식 `- [날짜] [영역] 내용 — 상태(열림/해결)`), `docs/HANDOFF.md`(섹션: 현재 상태 / 다음 할 일 / 막힌 것).

- [ ] **Step 1:** `/Users/yunhyerim/Documents/kids-mini-game`에서 `git init -b main`, `git config user.name "heamcoding"`, `git config user.email "heamcoding@gmail.com"`, 원격 `origin`을 `https://github.com/heamcoding/kids-mini-game.git`으로 설정.
- [ ] **Step 2:** 위 디렉터리와 파일 생성. `.gitignore`는 `node_modules/`, `build/`, `.gradle/`, `__pycache__/`, `.venv/`, `.env`, `dist/`.
- [ ] **Step 3:** 스프라이트 38개와 아이콘 4개가 `frontend/public/`에 복사됐는지 확인: `ls frontend/public/sprites | wc -l` → `38`.
- [ ] **Step 4:** 설계 문서와 이 계획서를 포함해 커밋: `chore: scaffold monorepo and docs`.

### Task 2: Spring Boot — DB 스키마와 설정 API

**Files:**
- Create: `backend-spring/build.gradle`, `settings.gradle`, `src/main/resources/application.yml`, `src/main/resources/db/migration/V1__init.sql`
- Create: `src/main/java/com/kidsminigame/{KidsMiniGameApplication, user/User, user/UserRepository, settings/GuardianSettings, settings/SettingsRepository, settings/SettingsDto, settings/SettingsController, settings/SettingsService, config/CorsConfig, config/SecurityConfig}.java`
- Test: `src/test/java/com/kidsminigame/settings/SettingsControllerTest.java`

**Interfaces:**
- Produces (HTTP):
  - `GET /api/settings` + 헤더 `X-Device-Id`(UUID) → 200 `SettingsDto`, 저장된 값이 없으면 기본값 200.
  - `PUT /api/settings` + 같은 헤더, 본문 `SettingsDto` → 200 저장된 `SettingsDto`. 범위 밖이면 400.
  - 헤더가 없거나 UUID 형식이 아니면 400.
- `SettingsDto` 필드(원본 `BASE`와 동일): `Integer age`(null|3|4|5), `double scan`, `double touchTime`, `String control`(`both|touch|space`), `int voiceVol`, `int fxVol`, `int rounds`, `double rate`, `double pitch`, `double gap`, `String voiceName`.
- `V1__init.sql`: 테이블 `users(id uuid pk, device_id uuid unique not null, created_at timestamptz not null default now())`, `guardian_settings(user_id uuid pk references users(id), data jsonb not null, updated_at timestamptz not null default now())`, `play_records(id bigserial pk, device_id uuid not null, game_id text not null, age int, duration_ms int not null, completed boolean not null, played_at timestamptz not null default now())`, 인덱스 `play_records(device_id)`.

- [ ] **Step 1:** `ORIG`의 `openSettings`(약 585행)를 읽어 각 설정의 슬라이더 최소/최대/단위를 확인하고, `SettingsDto`의 검증 범위로 쓴다. 확인한 범위를 `docs/NOTES.md`에 한 줄씩 적는다.
- [ ] **Step 2: 실패하는 테스트.** `SettingsControllerTest`(MockMvc + Testcontainers PostgreSQL)에 아래 메서드를 쓴다.
  - `getReturnsDefaultsForUnknownDevice`: 처음 보는 UUID로 GET → 200, `rounds == 5`, `age == null`, `voiceVol == 80`.
  - `putThenGetRoundTrips`: `age=4, rounds=7` 저장 후 GET → 같은 값.
  - `putRejectsOutOfRange`: `rounds=0`, `voiceVol=500`, `age=9`, `control="x"` 각각 400.
  - `missingOrBadDeviceIdIs400`.
  - `twoDevicesAreIsolated`.
- [ ] **Step 3:** 실행해 실패를 확인: `cd backend-spring && ./gradlew test` → FAIL(컨트롤러 없음).
- [ ] **Step 4:** 위 파일들을 구현한다. GET/PUT 시 `device_id`로 `users`를 upsert한다. `SecurityConfig`는 지금은 `/api/**`를 모두 허용하고 `// TODO(accounts)` 주석으로 자리만 남긴다. `CorsConfig`는 `http://localhost:5173`, `http://localhost:3000`을 허용한다. 검증은 Bean Validation 애너테이션.
- [ ] **Step 5:** `./gradlew test` → 전부 PASS.
- [ ] **Step 6:** 커밋 `feat(spring): settings API with Flyway schema`.

### Task 3: FastAPI — 플레이 기록과 통계

**Files:**
- Create: `backend-fastapi/app/{main, db, models, schemas, routes}.py`, `requirements.txt`, `Dockerfile`
- Test: `backend-fastapi/tests/test_records.py`

**Interfaces:**
- Produces (HTTP):
  - `POST /records` + `X-Device-Id`, 본문 `{game_id: str, age: int|null, duration_ms: int>=0, completed: bool}` → 201 `{id}`.
  - `GET /stats` + `X-Device-Id` → 200 `{total_plays: int, by_game: [{game_id, plays, completed, avg_duration_ms}]}` (해당 기기만).
  - `GET /health` → 200 `{"status":"ok"}`.
- 테이블은 Task 2의 `play_records`를 쓴다. FastAPI는 스키마를 만들지 않는다. 테스트는 SQLite 인메모리에 같은 컬럼으로 만든 테이블을 쓴다 (`DATABASE_URL` 환경변수로 교체).

- [ ] **Step 1: 실패하는 테스트.** `test_records.py`:
  - `test_post_then_stats_counts_per_game`: 같은 기기로 `fruit` 2건(1건 completed), `mole` 1건 → `total_plays == 3`, `fruit.plays == 2`, `fruit.completed == 1`.
  - `test_stats_isolated_per_device`.
  - `test_negative_duration_is_422`, `test_bad_device_id_is_400`.
- [ ] **Step 2:** `cd backend-fastapi && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/pytest -q` → FAIL.
- [ ] **Step 3:** 구현. CORS는 Task 2와 같은 origin.
- [ ] **Step 4:** `.venv/bin/pytest -q` → PASS.
- [ ] **Step 5:** 커밋 `feat(fastapi): play records and stats`.

### Task 4: 프론트 — 설정 모델과 동기화 훅

**Files:**
- Create: `frontend/` Vite React TS 프로젝트 (`npm create vite` 후 정리), `src/settings/{types.ts, defaults.ts, storage.ts, api.ts, useSettings.ts, deviceId.ts}`
- Test: `src/settings/storage.test.ts`, `src/settings/useSettings.test.tsx` (Vitest + Testing Library)

**Interfaces:**
- Produces:
  - `type Settings = { age: 3|4|5|null; scan: number; touchTime: number; control: 'both'|'touch'|'space'; voiceVol: number; fxVol: number; rounds: number; rate: number; pitch: number; gap: number; voiceName: string }`
  - `BASE: Settings` (원본과 같은 값: `scan 3, touchTime 10, control 'both', voiceVol 80, fxVol 60, rounds 5, rate 0.9, pitch 1.5, gap 0.6`), `AGE_DEF`
  - `clampSettings(s: Partial<Settings>): Settings`
  - `loadLocal(): Settings` / `saveLocal(s: Settings): void` (키 `mongsil-settings`, 예외를 삼킨다)
  - `getDeviceId(): string` (없으면 UUID 생성해 `localStorage`에 저장)
  - `fetchSettings(): Promise<Settings>`, `pushSettings(s: Settings): Promise<void>` (기본 URL은 `VITE_SPRING_URL`, 실패 시 reject)
  - `useSettings(): { settings: Settings; update(patch: Partial<Settings>): void; syncState: 'idle'|'offline'|'synced' }`

- [ ] **Step 1: 실패하는 테스트.**
  - `storage.test.ts`: `loadLocal`이 깨진 JSON에서 `BASE`를 반환, 일부 키만 있을 때 나머지를 `BASE`로 채움, `clampSettings({rounds:0, voiceVol:500, age:9})` → `rounds`는 최소값, `voiceVol 100`, `age null`.
  - `useSettings.test.tsx`: `fetch`가 reject돼도 `settings`는 `loadLocal` 값이고 `syncState === 'offline'`; `update({rounds:7})`는 서버 실패 중에도 `localStorage`에 `7`을 쓴다; 서버가 200이면 서버 값이 `localStorage`보다 우선하고 `syncState === 'synced'`.
- [ ] **Step 2:** `cd frontend && npm test` → FAIL.
- [ ] **Step 3:** 구현. `update`는 먼저 로컬에 쓰고 화면에 반영한 뒤, 서버 전송은 비동기로 하며 실패해도 예외를 밖으로 내지 않는다. 서버로 다시 연결될 때(`online` 이벤트와 다음 `update`) 재시도한다.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** 커밋 `feat(frontend): settings model with offline-safe sync`.

### Task 5: 프론트 — 엔진(소리, 음성, 타이머, 선택기)

**Files:**
- Create: `src/engine/{audio.ts, speech.ts, scheduler.ts, chooser.ts, korean.ts, fit.ts}`
- Test: `src/engine/korean.test.ts`, `src/engine/speech.test.ts`, `src/engine/scheduler.test.ts`

**Interfaces:**
- Consumes: `Settings`(Task 4).
- Produces:
  - `korean.ts`: `eul(w: string): '을'|'를'`, `iya(w: string): '이야'|'야'`, `kor(n: number): string`, `splitT(t: string): string[]` (원본 `eul/iya/kor/splitT`와 동일 동작).
  - `audio.ts`: `getAudio(): AudioContext|null`, `tone(freqs: number[], dur?: number, type?: OscillatorType, gap?: number, fxVol?: number): void`, `sfx: Record<'tap'|'good'|'soft'|'roll'|'win'|'flip'|..., () => void>` (원본 `sfx`의 전체 키를 따른다).
  - `speech.ts`: `createSpeaker(getSettings: () => Settings): { speak(text: string, cb?: () => void): void; hush(): void; isSpeaking(): boolean }`.
  - `scheduler.ts`: `createScheduler(): { token(): number; bump(): number; later(fn: () => void, ms: number): number; isPaused(): boolean; setPaused(b: boolean): void }` — 화면이 바뀌면(`bump`) 이전 `later`는 실행되지 않는다.
  - `chooser.ts`: `createChooser(opts)` — 원본 `choose()` 동작(스캔 하이라이트, 스페이스로 선택, 터치 허용 여부는 `control` 설정).

- [ ] **Step 1: 실패하는 테스트.**
  - `korean.test.ts`: `eul('사과') === '를'`, `eul('곰') === '을'`, `iya('토끼') === '야'`, `iya('곰') === '이야'`, `kor(10) === '십'`, `kor(21) === '이십일'`, `kor(99) === '구십구'`.
  - `speech.test.ts`: `speechSynthesis`와 `Audio`가 없는 환경에서 `speak('안녕', cb)`가 예외 없이 `cb`를 호출한다 (fake timers로 폴백 시간 진행); `hush()` 이후에는 이전 `cb`가 호출되지 않는다.
  - `scheduler.test.ts`: `bump()` 후 이전 `later`는 실행 안 됨; `setPaused(true)` 중에는 실행 안 됨.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** `codex:rescue`로 `ORIG`의 107~175행(그리기 보조 제외)을 위 인터페이스에 맞게 TS 모듈로 옮기도록 위임한다. 결과를 읽고 인터페이스와 다르면 직접 고친다.
- [ ] **Step 4:** `npm test` → PASS. 발견한 원본의 문제는 `docs/NOTES.md`에 적는다.
- [ ] **Step 5:** 커밋 `feat(frontend): game engine modules`.

### Task 6: 프론트 — 공통 컴포넌트와 화면 틀(시작, 나이, 홈, 로딩, 쉬기, 설정, 모서리 길게 누르기)

**Files:**
- Create: `src/components/{Screen, Title, Hint, TapButton, ChoiceRow, Sprite, Mongsil, LongPressButton, Overlay}.tsx` (공통 UI)
- Create: `src/components/form/{Field, Slider, Segmented, Select}.tsx` (공통 폼: 설정 패널 전용 입력)
- Create: `src/App.tsx`, `src/shell/{Stage, StartScreen, AgeScreen, HomeScreen, LoadingScreen, RestScreen, SettingsPanel}.tsx`, `src/shell/games.ts`, `src/styles/app.css`
- Test: `src/components/TapButton.test.tsx`, `src/components/ChoiceRow.test.tsx`, `src/shell/HomeScreen.test.tsx`, `src/components/LongPressButton.test.tsx`

**Interfaces:**
- Consumes: `useSettings`, 엔진 모듈.
- Produces (공통 컴포넌트, Task 7의 모든 게임이 이것만으로 화면을 구성한다):
  - `Screen({ children, noGuide? })` — 원본 `.screen` 레이아웃 + 화면 전환 시 `scheduler.bump()`.
  - `Title({ children })`, `Hint({ children })` — 원본 `.title`, `.muted`.
  - `TapButton({ children, onPick, scanIndex?, label })` — 원본 `B()`/`.tap`, 스캔 하이라이트(`scan`)와 선택(`picked`) 상태 표시.
  - `ChoiceRow<T>({ items: T[], render(item): ReactNode, onPick(item, i), ... })` — `createChooser`를 연결해 스캔·터치·스페이스 선택을 한 곳에서 처리. 게임은 선택지를 직접 `choose()`하지 않고 이것을 쓴다.
  - `Sprite({ name, size, alt? })` — 원본 `img()`, `Mongsil({ size })` — 원본 `mongsilImg()`(눈 깜빡임 포함).
  - `LongPressButton({ ms, icon, onTrigger })`, `Overlay({ children })`.
  - 폼: `Field({ label, children })`, `Slider({ value, min, max, step, onChange })`, `Segmented<T>({ value, options, onChange })`, `Select({ value, options, onChange })`. 설정 패널의 모든 입력은 이 4개로 구성한다.
- Produces:
  - `games.ts`: `export const GAMES: { id: string; title: string; icon: string|null; component: React.ComponentType<GameProps> }[]`, 원본 `GAMES` 13개 id/제목 그대로 (`fruit 과일 따기`, `chick 병아리 세기`, `owl 부엉이 둥지로`, `squirrel 다람쥐 도토리`, `pop 깜짝 통`, `memory 짝 찾기`, `same 같은 그림 찾기`, `bear 곰돌이 간식`, `mole 두더지 잡기`, `size 크다 작다`, `num 숫자 찾기`, `abc ABC 찾기`, `kor 가나다 찾기`).
  - `type GameProps = { settings: Settings; engine: Engine; onFinish(msg?: string): void; onHome(): void }` (`Engine`은 `speak/say/later/choose/sfx`를 묶은 객체).
  - 길게 누르기: 톱니 3000ms, 홈 1500ms (원본 값).
  - `roundsPlayed >= settings.rounds`이면 `RestScreen`, 아니면 홈.

- [ ] **Step 1: 실패하는 테스트.** `HomeScreen.test.tsx`: 13개 버튼이 위 제목으로 렌더. `LongPressButton.test.tsx`: 2999ms에서는 콜백 호출 안 됨, 3000ms에서 호출됨 (3000 지정 시), 중간에 `pointerup`이면 취소. `TapButton.test.tsx`: 클릭 시 `onPick` 호출. `ChoiceRow.test.tsx`: `control='space'`에서는 클릭이 무시되고 스페이스로 선택, `control='touch'`에서는 스캔이 돌지 않음.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** `codex:rescue`로 `ORIG` 181~222, 574~614행과 CSS(1~100행)를 위 공통 컴포넌트 위에 React 화면으로 옮기도록 위임 후 검토. 화면에서 공통 컴포넌트와 같은 마크업을 직접 쓴 곳이 있으면 공통 컴포넌트로 바꾼다. 게임 컴포넌트는 이 단계에서 자리표시자로 둔다.
- [ ] **Step 4:** `npm test` → PASS, `npm run dev`로 시작→나이→홈 흐름을 브라우저에서 확인하고 문제를 `docs/NOTES.md`에 적는다.
- [ ] **Step 5:** 커밋 `feat(frontend): app shell and screens`.

### Task 7: 게임 13개 이식 (3묶음)

**Files:**
- Create: `src/games/{fruit, chick, owl, squirrel, pop, memory, same, bear, mole, size, num, abc, kor}/Game.tsx` 및 각 게임의 `config.ts`(원본 `cfg` 표 그대로)
- Test: `src/games/<id>/config.test.ts`, `src/games/smoke.test.tsx`

**Interfaces:**
- Consumes: `GameProps`, `Engine`(Task 6). 각 게임은 `export default function Game(props: GameProps)`.
- Produces: 각 `config.ts`는 나이별 설정(`3|4|5`)을 원본 값 그대로 담는다 (예: `fruit` → `{3:{kinds:['apple','pear','plum'],per:2,steps:6}, ...}`).

묶음 순서: ① `fruit, chick, owl, squirrel` ② `pop, memory, same, bear` ③ `mole, size, num, abc, kor`.

- [ ] **Step 1: 묶음마다 실패하는 테스트.** `config.test.ts`는 원본 `cfg`의 나이별 키와 값을 그대로 단언 (원본 해당 행을 읽어 옮긴다). `smoke.test.tsx`는 각 게임을 나이 3/4/5로 렌더해 예외가 없고 선택지가 1개 이상 나타남을 확인.
- [ ] **Step 2:** 묶음별로 `codex:rescue`에 해당 `ORIG` 행 범위(`fruitGame` 226행~, `memoryGame` 283행~ 등 `grep -n "Game("`로 찾기)를 주고 이식을 위임. 위임 때마다 "동작과 문구를 바꾸지 말 것, 인터페이스는 `GameProps`, 선택지/버튼/제목/스프라이트는 `src/components`의 공통 컴포넌트만 사용할 것"을 명시한다. 여러 게임에서 반복되는 부분(예: 문제 N개 출제하고 정답 판정하는 `quizGame` 계열, 원본 532행)은 `src/games/shared/`에 공통 훅이나 컴포넌트로 뽑고, 새로 필요한 공통 UI가 생기면 `src/components`에 추가한다.
- [ ] **Step 3:** 묶음마다 `npm test` → PASS, `npm run dev`에서 해당 게임을 3/4/5세로 끝까지 한 판 실행. 원본과 다른 점이 있으면 `docs/NOTES.md`에 적고 고친다. 막힌 것은 메모에 남기고 다음으로 간다.
- [ ] **Step 4:** 게임이 끝나면 `POST {FASTAPI}/records`를 호출하는 `recordPlay({gameId, age, durationMs, completed})`를 `onFinish`에서 호출한다 (실패는 무시). `recordPlay`에 대한 테스트: 서버가 reject돼도 `onFinish`가 정상 진행.
- [ ] **Step 5:** 묶음마다 커밋 `feat(games): port <bundle>`.

### Task 8: PWA와 오프라인

**Files:**
- Create: `frontend/public/sw.js` (원본 구조 유지, 파일 목록은 빌드 산출물 기준), `vite` PWA 설정 또는 수동 등록 `src/registerSw.ts`
- Modify: `frontend/index.html` (manifest, apple 메타 태그, 테마색 `#FFF3D6`, 제목 `몽실이와 놀이터`, 폰트 링크)

**Interfaces:**
- Produces: `registerSw(): void` (프로덕션 빌드에서만 등록). 캐시 이름 `mongsil-v3`부터 시작 (원본이 `v2`).

- [ ] **Step 1:** `npm run build && npm run preview`로 서비스 워커가 등록되고 `localhost`에서 네트워크를 끊어도 홈 화면이 뜨는지 확인한다. 안 되면 원인을 `docs/NOTES.md`에 적고 고친다.
- [ ] **Step 2:** 커밋 `feat(frontend): PWA offline support`.

### Task 9: Docker Compose와 통합 실행

**Files:**
- Create: `docker-compose.yml`, `backend-spring/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `.env.example`

**Interfaces:**
- Produces: 서비스 `db`(postgres:16, 볼륨), `spring`(8080), `fastapi`(8000), `frontend`(nginx, 3000). `.env.example`에 `POSTGRES_PASSWORD`, `VITE_SPRING_URL`, `VITE_FASTAPI_URL`. 비밀번호는 저장소에 넣지 않는다.

- [ ] **Step 1:** `docker compose up --build -d` 후 `curl -s localhost:8080/api/settings -H "X-Device-Id: $(uuidgen)"` → 기본 설정 JSON, `curl -s localhost:8000/health` → `{"status":"ok"}`, `localhost:3000` → 200.
- [ ] **Step 2: 통합 확인.** 브라우저에서 `localhost:3000`을 열어 설정 변경 후 새로고침해도 유지되는지, 한 판 끝낸 뒤 `GET /stats`에 1건이 보이는지 확인. 그다음 `docker compose stop spring fastapi` 상태에서도 게임이 진행되는지 확인한다.
- [ ] **Step 3:** 발견한 오류와 수정 필요 사항을 `docs/NOTES.md`에 정리하고 고친다.
- [ ] **Step 4:** 커밋 `feat: docker compose stack`.

### Task 10: README 전체 재작성과 마무리

**Files:**
- Create/Modify: `README.md`

**Interfaces:**
- Produces: 섹션 — 소개(스크린샷 자리 포함), 주요 기능, 아키텍처 다이어그램(텍스트), 기술 스택, 실행 방법(Docker, 로컬 개발 각각), API 표(Task 2, 3의 엔드포인트), 폴더 구조, PWA 설치 방법(원본 `README.txt`의 설치 안내를 옮김), 로드맵(계정/로그인, 통계 화면), 원본 저장소 출처 표기.

- [ ] **Step 1:** README 작성. 모든 명령은 실제로 실행해 동작을 확인한 것만 적는다.
- [ ] **Step 2:** `docs/HANDOFF.md`를 최종 상태로 갱신하고 `docs/NOTES.md`의 열린 항목을 정리한다.
- [ ] **Step 3:** 커밋 `docs: rewrite README`.
- [ ] **Step 4:** **사용자에게 push 확인을 받은 뒤** `heamcoding` 인증으로 `git push -u origin main`. 인증은 `gh auth token --user heamcoding`로 얻은 토큰을 일회성으로 쓰고 `gh`의 활성 계정은 바꾸지 않는다.
- [ ] **Step 5:** `gh api repos/heamcoding/kids-mini-game/commits --jq 'length'`(heamcoding 토큰)로 올라간 커밋 수를 확인한다.
