## 프로젝트 실행 방법

1. `npm install`
2. `npm run dev`

## 개발 안내

- 전체 레이아웃을 모바일 기준(390px~430px)으로 맞춰두었습니다.
- 토스 SDK 호출 시 PC 에러 방지를 위해 `src/lib/tossBridge.ts`를 사용합니다. (`tossBridge.ts` 주석 참고)

## 폴더 구조

```text
src/
├── components/
│   └── common/
│       └── Layout.tsx    # 공통 레이아웃
├── lib/
│   └── tossBridge.ts     # 웹에서 개발 시 오류 방어
├── pages/                # 각자 맡은 페이지들
│   └── ...
├── App.tsx
├── main.tsx
└── index.css             # 공통 레이아웃
```

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
