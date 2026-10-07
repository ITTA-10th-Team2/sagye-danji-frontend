# MVP 사용자 행동 수집

서버 배포와 아래 헤더의 CORS 허용을 확인한 후 `.env`에 설정하고 다시 빌드합니다.

```dotenv
VITE_ANALYTICS_ENABLED=true
VITE_SERVICE_VERSION=1.0.0
```

기본값은 `false`입니다. 배포 전 분석 API로 요청하거나 새 헤더 때문에 기존 API가 실패하지 않도록 합니다.

허용할 헤더: `X-Analytics-Session-Id`, `X-Client-Version`, `X-Client-OS`.
<br /> 저장소 presigned PUT에는 이 헤더를 붙이지 않습니다.

## 현재 연결 (프론트엔드 담당)

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

- 10건 또는 첫 대기 이벤트 이후 5초 뒤에 전송됩니다. (최대 50건)
- 큐는 메모리에 최대 500건 보관하며 초과하면 오래된 이벤트부터 제거합니다. 종료/재시작 시 미전송 데이터 복구는 제공하지 않습니다.
- 체류시간은 document.visibilityState 기준 근사치이며 강제 종료 시 마지막 구간은 유실될 수 있습니다.
