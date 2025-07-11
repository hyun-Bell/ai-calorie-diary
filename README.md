<p align="center">
  <img width="571" alt="image" src="https://github.com/manOfBackend/ai-calorie-diary/assets/74768098/4dd1a702-7e64-488d-900f-b490f2684564">
</p>

## Overview

This project is the backend system of an application that allows users to take photos of food and keep a diary. The AI calculates the calories of each food item to help users manage their diet. This project is being created for learning purposes while studying the book [Clean Architecture: A Craftsman's Guide to Software Structure and Design] by Robert C. Martin, and it is built using NestJS, adhering to clean architecture and Domain-Driven Design (DDD) principles.

## Architecture

This project follows clean architecture principles and is designed as a microservices architecture. The system is composed of loosely coupled modules that communicate via events, promoting scalability and maintainability. Key architectural features include:

- **Hexagonal Architecture**: Each module is structured using the hexagonal (ports and adapters) pattern, separating core business logic from external concerns.
- **Event-Driven Communication**: Modules communicate asynchronously through events, using an in-memory event bus for local communication and Kafka for distributed event processing.
- **Microservices**: The application is divided into distinct services (auth, user, food, diary) that can be deployed and scaled independently.
- **Domain-Driven Design (DDD)**: Business logic is organized around domain concepts, with clear boundaries between different contexts.

## Project Structure

```
src/
├── main.ts
├── app.module.ts
├── auth/
│   ├── adapter/
│   │   ├── in/
│   │   │   └── rest/
│   │   │       ├── dto/
│   │   │       ├── auth.controller.spec.ts
│   │   │       └── auth.controller.ts
│   │   └── out/
│   │       └── persistence/
│   │           └── user-repository.adapter.ts
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   ├── dto/
│   │   │   │   └── auth.use-case.ts
│   │   │   └── out/
│   │   │       └── user-repository.port.ts
│   │   └── service/
│   │       ├── auth.service.spec.ts
│   │       └── auth.service.ts
│   ├── domain/
│   │   ├── refresh-token.ts
│   │   └── user.ts
│   └── auth.module.ts
├── common/
│   ├── decorators/
│   │   └── user.decorator.ts
│   ├── dto/
│   ├── events/
│   │   ├── event.interface.ts
│   │   ├── event-publisher.interface.ts
│   │   ├── event-subscriber.interface.ts
│   │   └── in-memory-event-bus.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── kafka/
│   ├── logger/
│   │   └── custom-logger.service.ts
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── s3/
│   │   └── s3.service.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── diary/
│   ├── adapter/
│   │   ├── in/
│   │   │   └── rest/
│   │   │       ├── dto/
│   │   │       ├── diary.controller.ts
│   │   │       └── swagger.decorator.ts
│   │   └── out/
│   │       └── persistence/
│   │           └── diary-repository.adapter.ts
│   ├── application/
│   │   ├── event-handlers/
│   │   │   └── food-analyzed.handler.ts
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   └── diary.use-case.ts
│   │   │   └── out/
│   │   │       └── diary-repository.port.ts
│   │   └── service/
│   │       ├── diary.service.spec.ts
│   │       └── diary.service.ts
│   ├── domain/
│   │   └── diary.ts
│   └── diary.module.ts
├── food/
│   ├── adapter/
│   │   ├── in/
│   │   │   └── rest/
│   │   │       ├── dto/
│   │   │       │   └── food-analysis.dto.ts
│   │   │       ├── food.controller.ts
│   │   │       └── swagger.decorator.ts
│   │   └── out/
│   │       └── api/
│   │           └── openai-api.adapter.ts
│   ├── application/
│   │   ├── port/
│   │   │   ├── in/
│   │   │   │   └── food.use-case.ts
│   │   │   └── out/
│   │   │       └── openai-api.port.ts
│   │   └── service/
│   │       └── food.service.ts
│   ├── domain/
│   │   ├── events/
│   │   │   └── food-analyzed.event.ts
│   │   └── food-analysis.ts
│   └── food.module.ts
└── user/
    ├── adapter/
    │   ├── in/
    │   │   └── rest/
    │   │       ├── dto/
    │   │       └── user.controller.ts
    │   └── out/
    │       └── persistence/
    │           └── user-repository.adapter.ts
    ├── application/
    │   ├── port/
    │   │   ├── in/
    │   │   │   └── user.use-case.ts
    │   │   └── out/
    │   │       └── user-repository.port.ts
    │   └── service/
    │       └── user.service.ts
    ├── domain/
    │   └── user.ts
    └── user.module.ts

```

## Installation

```bash
$ pnpm install
```

## Running the app

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Test

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

```

## 시작하기

### 데이터베이스 설정

```bash
# Prisma 클라이언트 생성
pnpm run generate

# 데이터베이스 마이그레이션
npx prisma db push

# 목업 데이터 시드 (개발용)
pnpm run db:seed

# 데이터베이스 리셋 + 시드 (전체 초기화)
pnpm run db:reset
```

### 목업 계정 정보

개발 및 테스트를 위한 사전 생성된 계정들:

| 이메일                  | 비밀번호      | 목표 칼로리 | 일기 개수 | 특징                      |
| ----------------------- | ------------- | ----------- | --------- | ------------------------- |
| `demo@example.com`      | `demo123456`  | 2000kcal    | 4개       | 기본 데모 사용자          |
| `test@example.com`      | `test123456`  | 1800kcal    | 5개       | 테스트용 사용자           |
| `user@example.com`      | `user123456`  | 2200kcal    | 6개       | 일반 사용자               |
| `poweruser@example.com` | `power123456` | 2500kcal    | 8개       | 많은 데이터를 가진 사용자 |

각 계정은 다양한 종류의 음식과 상세한 영양소 분석 데이터를 포함한 일기를 가지고 있습니다.

### 시드 데이터 특징

- **다양한 음식 타입**: 한식, 양식, 브런치, 운동 후 식단 등
- **상세한 영양소 분석**: 단백질, 지방, 탄수화물별 상세 데이터
- **현실적인 칼로리**: 실제 음식 칼로리를 반영한 데이터
- **날짜 분산**: 최근 7일간의 데이터로 분산 배치
- **사용자별 차별화**: 각 사용자마다 다른 일기 개수와 날짜

### 스크립트 명령어

```bash
# 개발 서버 시작
pnpm run start:dev

# 시드만 실행
pnpm run db:seed

# 데이터베이스 완전 리셋 후 시드
pnpm run db:reset

# API 문서 생성
pnpm run docs

# API 문서 생성 후 브라우저에서 열기
pnpm run docs:open
```

## API 문서

자세한 API 명세는 다음을 참고하세요:

- **Swagger UI**: http://localhost:3000/api (서버 실행 후)
- **상세 명세서**: [docs/API_SPECIFICATION.md](./docs/API_SPECIFICATION.md)
- **자동 생성된 문서**: `pnpm run docs` 실행 후 `docs/` 폴더

## 개발 환경

- Node.js 18+
- PostgreSQL
- Prisma ORM
- NestJS Framework
