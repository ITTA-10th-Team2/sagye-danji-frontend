# 사계단지 🍂

계절에 맞는 활동을 추천받고, 사진과 짧은 글로 일상을 기록하는 토스인앱 서비스입니다.
기록은 계절별 단지에 모아볼 수 있습니다.

## 기술 스택

- React · TypeScript · Vite
- Tailwind CSS · Toss Design System
- React Router · Axios
- Apps in Toss SDK

## 실행 방법

```bash
npm install
npm run dev
```

## 환경변수

프로젝트 루트에 `.env` 파일을 생성합니다.

```dotenv
VITE_API_BASE_URL=https://api.sagye-danji.site/api
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_DEBUG=false
VITE_SERVICE_VERSION=1.0.0
```

출시 빌드는 위 설정을 사용합니다. 유입 경로를 테스트할 때만 `VITE_ANALYTICS_DEBUG=true`로 바꿉니다. 환경변수 변경 후에는 다시 빌드해야 합니다.

## 빌드

```bash
npm run build
```

타입 검사와 웹 빌드 후 토스 인앱 테스트용 `.ait` 파일을 생성합니다.

## 폴더 구조

- `src/apis` — API 요청 함수와 타입
- `src/pages` — 화면
- `src/components` — UI 컴포넌트
- `src/lib` — 인증·이미지 처리·분석 등 공통 기능
- `src/assets`, `public/assets` — 이미지와 정적 리소스

## 참고

- [사용자 행동 분석 안내](docs/analytics.md)
- [UTM 테스트 및 채널별 링크](docs/utm-links.md)

## 커밋 메시지 규칙

| 태그       | 설명                         |
| ---------- | ---------------------------- |
| `Feat`     | 새로운 기능 추가             |
| `Fix`      | 버그 수정                    |
| `Docs`     | 문서 수정                    |
| `Style`    | 코드 포맷팅 (기능 변경 없음) |
| `Refactor` | 코드 리팩토링                |
| `Test`     | 테스트 코드 작성             |
| `Chore`    | 기타 설정                    |
