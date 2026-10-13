# MVP 사용자 행동 수집

서버 배포와 아래 헤더의 CORS 허용을 확인한 후 `.env`에 설정하고 다시 빌드합니다.

```dotenv
VITE_ANALYTICS_ENABLED=true
VITE_SERVICE_VERSION=1.0.0
```

기본값은 `false`입니다. 배포 전 분석 API로 요청하거나 새 헤더 때문에 기존 API가 실패하지 않도록 설정해야 합니다.

허용할 헤더: `X-Analytics-Session-Id`, `X-Client-Version`, `X-Client-OS`.
<br /> 저장소 presigned PUT에는 이 헤더를 붙이지 않습니다.

## 현재 연결 (프론트엔드 담당)

- 로그인 성공 직후 SESSION_START (세션당 1회, 유입 쿼리가 없어도 전송)
- 홈/온보딩/작성 화면 노출 및 체류 구간
- 카메라/앨범 선택 버튼의 RECORD_START (선택 취소도 시작에 포함)
- 계절 단지 탭, 잠긴 계절 탭
- 공통 API의 분석 세션/버전/OS 헤더

건너뛰기/공유 UI가 없는 곳에 해당 이벤트를 임의로 만들지 않습니다.
<br />사진/메모/토큰/사진 URL은 이벤트에 포함하지 않습니다.

## 단지 부분 연결

단지 화면 내부의 view에 맞춰 아래 훅을 호출할 수 있습니다.

```tsx
import { useAnalyticsScreen } from '../lib/useAnalyticsScreen';
useAnalyticsScreen('JAR');
```

훅은 컴포넌트 최상위에서 호출하고, 내부 view에 따라 단지/상세 화면을 구분합니다. <br />
`trackEvent`로 세부 이벤트도 기록할 수 있습니다. 허용 properties 문자열은 백엔드 담당자와 추가 확인이 필요할 수도 있습니다.

## 전송 및 주의사항

- 앱 시작 시 쿼리를 보관합니다. `referrer`와 `shareScreen`은 현재 쿼리를 우선하고, 없는 필드만 `Environment.initialURL`에서 찾습니다.
- 테스트 링크에서 확인된 `toss_referrer`도 서버의 `referrer` 속성으로 보냅니다. 같은 주소에 두 키가 있으면 `referrer`를 우선합니다. `contentId`, `host`, `_deploymentId`는 이벤트에 포함하지 않습니다.
- `referrer`는 영문/숫자/밑줄/점/하이픈 1~64자만 허용하며 잘못된 값은 `invalid`로 보냅니다. `shareScreen`은 정의된 화면 이름만 보냅니다.
- 테스트 시 `VITE_ANALYTICS_DEBUG=true`로 빌드하면 `[Analytics] 시작 URL 확인`에 원본 쿼리와 초기 URL을 한 번 출력합니다. 서버로 주소 전체를 보내지는 않습니다. 유입 확인 후에는 이 플래그를 끄고 다시 빌드합니다.
- 현재 공유 기능은 없습니다. 추가할 때 `getTossShareLink('intoss://sagye-danji?shareScreen=JAR')`처럼 공유 화면을 넣습니다. `intoss-private` 테스트 링크는 토스가 요구하는 쿼리 인코딩 형식으로 생성하고 기존 `_deploymentId`를 유지합니다.

- 10건 또는 첫 대기 이벤트 이후 5초 뒤에 전송됩니다. (최대 50건)
- 큐는 메모리에 최대 500건 보관하며 초과하면 오래된 이벤트부터 제거합니다. 종료/재시작 시 미전송 데이터 복구는 제공하지 않습니다.
