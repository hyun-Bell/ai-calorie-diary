# AI 칼로리 다이어리 API 명세서

## 📋 개요

**AI 칼로리 다이어리**는 음식 사진을 분석하여 자동으로 칼로리를 계산하고, 사용자가 식단 일기를 작성할 수 있는 서비스입니다.

- **Version**: 1.0
- **Base URL**: `http://localhost:3000/api`
- **Swagger UI**: `http://localhost:3000/api` (서버 실행 시)
- **Protocol**: HTTP/HTTPS
- **Data Format**: JSON
- **File Upload**: Multipart/form-data

## 🔐 인증 방식

### JWT Bearer Token Authentication

모든 보호된 엔드포인트는 JWT Bearer 토큰을 사용합니다.

```http
Authorization: Bearer <your-jwt-token>
```

### 토큰 구조

- **Access Token**: API 요청 시 사용 (단기간 유효)
- **Refresh Token**: Access Token 갱신 시 사용 (장기간 유효)

## 📝 공통 응답 구조

### 성공 응답

```json
{
  "success": true,
  "data": {
    // 실제 데이터
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/endpoint"
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input data",
    "statusCode": 400,
    "details": "Bad Request"
  },
  "timestamp": "2023-05-20T12:34:56.789Z",
  "path": "/api/endpoint"
}
```

## ⚠️ 에러 코드

| Status Code | Error Code      | 설명                                   |
| ----------- | --------------- | -------------------------------------- |
| 400         | `INVALID_INPUT` | 잘못된 요청 데이터                     |
| 401         | `UNAUTHORIZED`  | 인증되지 않은 사용자                   |
| 403         | `FORBIDDEN`     | 접근 권한 없음                         |
| 404         | `NOT_FOUND`     | 리소스를 찾을 수 없음                  |
| 409         | `CONFLICT`      | 데이터 충돌 (예: 이미 존재하는 이메일) |
| 500         | `SERVER_ERROR`  | 서버 내부 오류                         |

## 📊 데이터 타입 정의

### FoodBreakdown

음식의 영양소 분석 결과를 나타내는 객체입니다.

```typescript
type Ingredient = {
  protein: { amount: number; unit: string; calories: number };
  fat: { amount: number; unit: string; calories: number };
  carbohydrate: { amount: number; unit: string; calories: number };
};

type FoodBreakdown = { [ingredient: string]: Ingredient };
```

**예시:**

```json
{
  "chicken": {
    "protein": { "amount": 25, "unit": "g", "calories": 100 },
    "fat": { "amount": 3, "unit": "g", "calories": 27 },
    "carbohydrate": { "amount": 0, "unit": "g", "calories": 0 }
  },
  "rice": {
    "protein": { "amount": 4, "unit": "g", "calories": 16 },
    "fat": { "amount": 0.5, "unit": "g", "calories": 4.5 },
    "carbohydrate": { "amount": 45, "unit": "g", "calories": 180 }
  }
}
```

---

# 🔑 Auth API

## POST /auth/register

사용자 회원가입

### 요청

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 요청 검증

- `email`: 유효한 이메일 형식
- `password`: 최소 6자 이상

### 응답

**성공 (201)**

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/auth/register"
  }
}
```

**에러 (409)**

```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "Email already exists",
    "statusCode": 409,
    "details": "Conflict"
  },
  "timestamp": "2023-05-20T12:34:56.789Z",
  "path": "/api/auth/register"
}
```

## POST /auth/login

사용자 로그인

### 요청

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com"
    }
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/auth/login"
  }
}
```

**에러 (401)**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials",
    "statusCode": 401,
    "details": "Unauthorized"
  },
  "timestamp": "2023-05-20T12:34:56.789Z",
  "path": "/api/auth/login"
}
```

## POST /auth/refresh

토큰 갱신

### 요청

```http
POST /api/auth/refresh
Content-Type: application/json
```

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/auth/refresh"
  }
}
```

## POST /auth/logout

로그아웃

### 요청

```http
POST /api/auth/logout
Authorization: Bearer <access-token>
```

### 응답

**성공 (200)**

```json
{
  "success": true,
  "data": {
    "message": "Logout successful"
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/auth/logout"
  }
}
```

---

# 📖 Diary API

모든 Diary API는 인증이 필요합니다.

## POST /diary

일기 작성

### 요청

```http
POST /api/diary
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Form Data:**

- `content` (string, required): 일기 내용
- `image` (file, optional): 음식 이미지 파일
- `totalCalories` (number, optional): 총 칼로리
- `calorieBreakdown` (string, optional): 칼로리 분석 데이터 (JSON 문자열)

### 응답

**성공 (201)**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "오늘 점심으로 맛있는 비빔밥을 먹었다.",
    "imageUrl": "https://example.com/images/bibimbap.jpg",
    "userId": "98765432-10ab-cdef-ghij-klmnopqrstuv",
    "createdAt": "2023-06-07T10:30:00Z",
    "updatedAt": "2023-06-07T10:30:00Z",
    "totalCalories": 600,
    "calorieBreakdown": {
      "밥": {
        "protein": { "amount": 3, "unit": "g", "calories": 12 },
        "fat": { "amount": 0.3, "unit": "g", "calories": 2.7 },
        "carbohydrate": { "amount": 28, "unit": "g", "calories": 112 }
      },
      "소고기": {
        "protein": { "amount": 20, "unit": "g", "calories": 80 },
        "fat": { "amount": 15, "unit": "g", "calories": 135 },
        "carbohydrate": { "amount": 0, "unit": "g", "calories": 0 }
      }
    }
  },
  "meta": {
    "timestamp": "2023-05-20T12:34:56.789Z",
    "path": "/api/diary"
  }
}
```

## GET /diary

사용자의 모든 일기 조회

### 요청

```http
GET /api/diary
Authorization: Bearer <access-token>
```

### 응답

**성공 (200)**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "오늘 점심으로 맛있는 비빔밥을 먹었다.",
    "imageUrl": "https://example.com/images/bibimbap.jpg",
    "userId": "98765432-10ab-cdef-ghij-klmnopqrstuv",
    "createdAt": "2023-06-07T10:30:00Z",
    "updatedAt": "2023-06-07T10:30:00Z",
    "totalCalories": 600,
    "calorieBreakdown": {
      /* ... */
    }
  }
]
```

## GET /diary/period

특정 기간의 일기 조회

### 요청

```http
GET /api/diary/period?startDate=2023-01-01&endDate=2023-12-31
Authorization: Bearer <access-token>
```

**Query Parameters:**

- `startDate` (string, required): 시작 날짜 (YYYY-MM-DD)
- `endDate` (string, required): 종료 날짜 (YYYY-MM-DD)

### 응답

**성공 (200)**

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "content": "오늘 점심으로 맛있는 비빔밥을 먹었다.",
    "imageUrl": "https://example.com/images/bibimbap.jpg",
    "userId": "98765432-10ab-cdef-ghij-klmnopqrstuv",
    "createdAt": "2023-06-07T10:30:00Z",
    "updatedAt": "2023-06-07T10:30:00Z",
    "totalCalories": 600,
    "calorieBreakdown": {
      /* ... */
    }
  }
]
```

## GET /diary/:id

특정 일기 조회

### 요청

```http
GET /api/diary/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <access-token>
```

### 응답

**성공 (200)**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "content": "오늘 점심으로 맛있는 비빔밥을 먹었다.",
  "imageUrl": "https://example.com/images/bibimbap.jpg",
  "userId": "98765432-10ab-cdef-ghij-klmnopqrstuv",
  "createdAt": "2023-06-07T10:30:00Z",
  "updatedAt": "2023-06-07T10:30:00Z",
  "totalCalories": 600,
  "calorieBreakdown": {
    /* ... */
  }
}
```

**에러 (404)**

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Diary not found",
  "errorCode": "NOT_FOUND"
}
```

## PUT /diary/:id

일기 수정

### 요청

```http
PUT /api/diary/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Form Data:**

- `content` (string, required): 수정할 일기 내용
- `image` (file, optional): 수정할 이미지 파일
- `totalCalories` (number, optional): 수정할 총 칼로리
- `calorieBreakdown` (string, optional): 수정할 칼로리 분석 데이터

### 응답

**성공 (200)**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "content": "수정된 일기 내용",
  "imageUrl": "https://example.com/images/updated-image.jpg",
  "userId": "98765432-10ab-cdef-ghij-klmnopqrstuv",
  "createdAt": "2023-06-07T10:30:00Z",
  "updatedAt": "2023-06-07T11:45:00Z",
  "totalCalories": 650,
  "calorieBreakdown": {
    /* ... */
  }
}
```

## DELETE /diary/:id

일기 삭제

### 요청

```http
DELETE /api/diary/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <access-token>
```

### 응답

**성공 (200)**

```json
{
  "message": "Diary successfully deleted"
}
```

---

# 🍽️ Food API

## POST /food/analyze

음식 이미지 분석

### 요청

```http
POST /api/food/analyze
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

**Form Data:**

- `image` (file, required): 분석할 음식 이미지 파일
- `description` (string, required): 음식에 대한 추가 설명

**파일 제한:**

- 최대 크기: 3MB
- 지원 형식: JPG, JPEG, PNG

### 응답

**성공 (201)**

```json
{
  "ingredients": ["chicken", "rice", "broccoli"],
  "totalCalories": 500,
  "breakdown": {
    "chicken": {
      "protein": { "amount": 25, "unit": "g", "calories": 100 },
      "fat": { "amount": 3, "unit": "g", "calories": 27 },
      "carbohydrate": { "amount": 0, "unit": "g", "calories": 0 }
    },
    "rice": {
      "protein": { "amount": 4, "unit": "g", "calories": 16 },
      "fat": { "amount": 0.5, "unit": "g", "calories": 4.5 },
      "carbohydrate": { "amount": 45, "unit": "g", "calories": 180 }
    },
    "broccoli": {
      "protein": { "amount": 3, "unit": "g", "calories": 12 },
      "fat": { "amount": 0.4, "unit": "g", "calories": 3.6 },
      "carbohydrate": { "amount": 7, "unit": "g", "calories": 28 }
    }
  }
}
```

**에러 (400)**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "파일 크기는 3MB를 초과할 수 없습니다.",
  "errorCode": "INVALID_INPUT"
}
```

---

# 👤 User API

## GET /user/info

사용자 정보 조회

### 요청

```http
GET /api/user/info
Authorization: Bearer <access-token>
```

### 응답

**성공 (200)**

```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "targetCalories": 2000,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-06-07T10:30:00.000Z"
}
```

## PUT /user/target-calories

목표 칼로리 수정

### 요청

```http
PUT /api/user/target-calories
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "targetCalories": 1800
}
```

### 응답

**성공 (200)**

```json
{
  "message": "Target calories updated successfully",
  "targetCalories": 1800
}
```

**에러 (400)**

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Target calories must be a positive number",
  "errorCode": "INVALID_INPUT"
}
```

---

# 💡 사용 예시

## JavaScript/TypeScript 클라이언트 예시

### 1. 로그인

```typescript
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const { accessToken, refreshToken, user } = await loginResponse.json();

// 토큰 저장
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

### 2. 일기 작성

```typescript
const formData = new FormData();
formData.append('content', '오늘 점심으로 샐러드를 먹었다.');
formData.append('image', imageFile);
formData.append('totalCalories', '300');
formData.append('calorieBreakdown', JSON.stringify(calorieData));

const response = await fetch('/api/diary', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  body: formData,
});

const diary = await response.json();
```

### 3. 음식 이미지 분석

```typescript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('description', '치킨 샐러드');

const response = await fetch('/api/food/analyze', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
  body: formData,
});

const analysisResult = await response.json();
```

### 4. 일기 목록 조회

```typescript
const response = await fetch(
  '/api/diary/period?startDate=2023-01-01&endDate=2023-12-31',
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  },
);

const diaries = await response.json();
```

---

# 🔧 개발 참고사항

## 환경 설정

- **포트**: 기본 3000 (환경변수 `PORT`로 설정 가능)
- **CORS**: 활성화됨
- **파일 업로드**: Multer 사용
- **이미지 분석**: OpenAI GPT-4 Vision 사용

## 데이터베이스 스키마

### User 테이블

- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `password`: String (Hashed)
- `targetCalories`: Integer (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Diary 테이블

- `id`: UUID (Primary Key)
- `content`: String
- `imageUrl`: String (Optional)
- `userId`: UUID (Foreign Key)
- `totalCalories`: Float (Optional)
- `calorieBreakdown`: JSON (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### RefreshToken 테이블

- `id`: UUID (Primary Key)
- `token`: String (Unique)
- `userId`: UUID (Foreign Key)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## 보안 고려사항

1. **JWT 토큰**: 적절한 만료 시간 설정
2. **파일 업로드**: 크기 및 타입 검증
3. **입력 검증**: class-validator로 모든 입력 데이터 검증
4. **에러 처리**: 민감한 정보 노출 방지
5. **CORS**: 프로덕션에서는 특정 도메인만 허용 권장

---

_이 문서는 AI 칼로리 다이어리 백엔드 API v1.0 기준으로 작성되었습니다._
