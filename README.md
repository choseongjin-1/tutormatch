# TutorMatch

1:1 튜터링/과외 예약 시스템. React + Spring Boot 풀스택 포트폴리오 프로젝트.

## 문서

- [설계 문서 (DB 스키마, API 명세, 기술 스택)](./tutormatch-design.md)

## 구조

```
.
├── backend/     # Spring Boot API 서버
├── frontend/    # React + TypeScript 클라이언트
└── tutormatch-design.md
```

## 진행 상태

- [x] 설계 (DB 스키마 / API 명세 / 아키텍처)
- [x] 백엔드 구현 (인증, 튜터 프로필, 예약 가능 시간, 예약, 리뷰)
- [x] 프론트엔드 구현 (로그인/회원가입, 튜터 검색/상세, 프로필/시간 관리, 예약 신청/승인/거절, 리뷰)
- [ ] 배포

## 로컬 실행 방법

### 요구 사항

- Java 17 이상
- Node.js 20 이상

### 백엔드 (`backend/`)

기본 프로필은 `dev`이며, 별도 설정 없이 인메모리 H2 DB로 바로 실행됩니다.

```bash
cd backend
./gradlew bootRun
```

- API 서버: http://localhost:8080
- H2 콘솔: http://localhost:8080/h2-console (JDBC URL: `jdbc:h2:mem:tutormatch`, 유저 `sa`, 비밀번호 없음)

테스트 실행 (동시 예약 락 통합 테스트 포함):

```bash
cd backend
./gradlew test
```

운영(MySQL) 프로필로 실행하려면 `SPRING_PROFILES_ACTIVE=prod`와 함께 `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` 환경변수를 설정하세요 (`backend/src/main/resources/application.yml` 참고).

### 프론트엔드 (`frontend/`)

```bash
cd frontend
npm install
npm run dev
```

- 개발 서버: http://localhost:5173
- `/api`로 시작하는 요청은 Vite dev 서버가 자동으로 `http://localhost:8080`으로 프록시합니다 (`frontend/vite.config.ts`) — 백엔드를 먼저 켜두면 별도 설정 없이 바로 연동됩니다.
- 배포 빌드처럼 API가 다른 origin에 있는 경우에만 `frontend/.env`에 `VITE_API_BASE_URL`을 설정하면 됩니다 (`frontend/.env.example` 참고).

### 둘 다 띄운 뒤 확인해볼 흐름

1. http://localhost:5173/signup 에서 튜터/학생 계정 각각 가입
2. 튜터 계정으로 로그인 → "내 프로필/시간"에서 프로필 등록 + 예약 가능 시간 추가
3. 학생 계정으로 로그인 → "튜터 찾기"에서 검색 → 상세 페이지에서 예약 신청
4. 튜터 계정으로 "내 예약"에서 승인/거절/완료 처리
5. 학생 계정으로 완료된 예약에 리뷰 작성 → 튜터 상세 페이지에서 평점 반영 확인
