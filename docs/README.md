# AI 칼로리 다이어리 API

음식 사진을 분석하여 칼로리를 계산하고 일기를 작성하는 API

**Version:** 1.0

## 🔗 빠른 링크

- [Swagger UI](http://localhost:3000/api) - 서버 실행 후 접속
- [OpenAPI JSON](./openapi.json)
- [HTML 문서](./index.html)

## 🔐 인증

이 API는 JWT Bearer 토큰을 사용합니다.

```
Authorization: Bearer <your-jwt-token>
```

## 📋 API 엔드포인트

### AUTH

- **POST** `/auth/login` - 사용자 로그인
- **POST** `/auth/refresh` - 토큰 갱신
- **POST** `/auth/register` - 사용자 등록
- **POST** `/auth/logout` - 로그아웃

### DIARY

- **POST** `/diary` - 일기 작성
- **GET** `/diary` - 사용자의 모든 일기 조회
- **GET** `/diary/period` - 특정 기간의 일기 조회
- **GET** `/diary/{id}` - 특정 일기 조회
- **PUT** `/diary/{id}` - 일기 수정
- **DELETE** `/diary/{id}` - 일기 삭제

### FOOD

- **POST** `/food/analyze` - 음식 이미지 분석

### USER


## 🚀 사용법

### 1. 문서 생성
```bash
pnpm run docs
```

### 2. 브라우저에서 확인
```bash
# HTML 문서 열기
open docs/index.html

# 또는 서버 실행 후 Swagger UI 접속
pnpm run start:dev
# http://localhost:3000/api
```

