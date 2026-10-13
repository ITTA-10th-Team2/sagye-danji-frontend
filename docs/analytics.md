# MVP 사용자 행동 수집

분석 API 배포와 CORS 설정은 완료됐습니다. 출시 빌드는 `.env`를 아래와 같이 설정합니다.

```dotenv
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_DEBUG=false
VITE_SERVICE_VERSION=1.0.0
```

분석 플래그가 없거나 `false`이면 이벤트와 분석 헤더를 보내지 않습니다. 환경변수를 변경하면 다시 빌드해야 합니다. `.env`는 Git에 포함되지 않으므로 다른 환경에서도 설정해야 합니다.

공통 API에는 `X-Analytics-Session-Id`, `X-Client-Version`, `X-Client-OS`를 보냅니다. 이벤트 본문과 같은 값을 사용하고 OS는 `IOS`, `ANDROID`, `WEB`, `OTHER` 중 하나입니다. 저장소 presigned PUT에는 분석 헤더를 붙이지 않습니다.

## 현재 연결 (프론트엔드 담당)

- 로그인 성공 직후 SESSION_START (세션당 1회, 유입 쿼리가 없어도 전송)
- 홈/온보딩/작성 화면 노출 및 체류 구간
- 카메라/앨범 선택 버튼의 RECORD_START (선택 취소도 시작에 포함)
- 계절 단지 탭, 잠긴 계절 탭
- 공통 API의 분석 세션/버전/OS 헤더

건너뛰기와 공유는 현재 UI가 없어 이벤트를 보내지 않습니다. 사진·메모·토큰·사진 URL은 이벤트에 포함하지 않습니다.

## 단지 부분 연결

단지 화면 내부의 view에 맞춰 아래 훅을 호출할 수 있습니다.

```tsx
import { useAnalyticsScreen } from '../lib/useAnalyticsScreen';
useAnalyticsScreen('JAR');
```

훅은 컴포넌트 최상위에서 호출합니다. 단지와 사진 상세를 같은 컴포넌트에서 전환한다면 현재 view에 맞는 화면 이름을 넘겨야 합니다. 위 예시는 단지 화면만 기록합니다. 세부 이벤트를 추가할 때는 서버 명세의 이벤트명과 properties를 확인합니다.

## 확인 결과 (2026-10-13)

- 인앱에서 `toss_referrer`를 읽어 SESSION_START의 `referrer`로 보내는 것을 확인했습니다.
- UTM은 테스트 스킴의 `queryParams` JSON으로 전달됩니다. JSON에서 `utmSource: "test"`, `utmCampaign: "check"`를 추출하고 events 성공 응답을 확인했습니다.
- 서버 저장과 시트 반영은 백엔드 확인이 남아 있습니다. 정식 출시 링크는 출시 후 확인합니다.

## 전송 및 주의사항

- UTM은 현재 쿼리의 `utm_source`, `utm_campaign`을 우선하고 없는 필드만 초기 URL에서 읽습니다. 소문자로 변환하고 영문·숫자·밑줄·점·하이픈 1~64자가 아니면 `invalid`로 보냅니다. 서버 키는 `utmSource`, `utmCampaign`입니다.
- UTM 테스트 링크와 채널별 홍보 링크 생성 방법은 [유입 링크 안내](./utm-links.md)를 참고합니다.
- 테스트 스킴에서 확인한 `queryParams` JSON 안의 UTM도 읽습니다. 현재 쿼리를 초기 URL보다 우선하고, 같은 주소에서는 일반 UTM을 JSON보다 우선합니다. JSON 전체는 전송하지 않습니다.
- 앱 시작 시 쿼리를 보관합니다. `referrer`와 `shareScreen`은 현재 쿼리를 우선하고, 없는 필드만 `Environment.initialURL`에서 찾습니다.
- 테스트 링크에서 확인된 `toss_referrer`도 서버의 `referrer` 속성으로 보냅니다. 같은 주소에 두 키가 있으면 `referrer`를 우선합니다. `contentId`, `host`, `_deploymentId`는 이벤트에 포함하지 않습니다.
- `referrer`는 영문/숫자/밑줄/점/하이픈 1~64자만 허용하며 잘못된 값은 `invalid`로 보냅니다. `shareScreen`은 정의된 화면 이름만 보냅니다.
- 테스트 시 `VITE_ANALYTICS_DEBUG=true`로 빌드하면 `[Analytics] 시작 URL 확인`에 원본 쿼리와 초기 URL을 한 번 출력합니다. 서버로 주소 전체를 보내지는 않습니다. 유입 확인 후에는 이 플래그를 끄고 다시 빌드합니다.
- 현재 공유 기능은 없습니다. 추가할 때 `getTossShareLink('intoss://sagye-danji?shareScreen=JAR')`처럼 공유 화면을 넣습니다. `intoss-private` 테스트 링크는 토스가 요구하는 쿼리 인코딩 형식으로 생성하고 기존 `_deploymentId`를 유지합니다.

- 10건 또는 첫 대기 이벤트 이후 5초 뒤에 전송됩니다. (최대 50건)
- 큐는 메모리에 최대 500건 보관하며 초과하면 오래된 이벤트부터 제거합니다. 종료/재시작 시 미전송 데이터 복구는 제공하지 않습니다.
