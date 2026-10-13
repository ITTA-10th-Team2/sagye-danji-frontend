# UTM 유입 링크

## 출시 전 테스트

`VITE_ANALYTICS_ENABLED=true`, `VITE_ANALYTICS_DEBUG=true`로 빌드하고 업로드합니다.
콘솔 QR에서 복사한 새 빌드의 전체 테스트 스킴을 아래 명령어에 넣습니다. 기존 `_deploymentId`와 다른 쿼리를 유지하고, UTM JSON을 `queryParams`에 URL 인코딩합니다.

```sh
node scripts/utm-links.mjs 'intoss-private://sagye-danji?_deploymentId=콘솔의실제배포ID'
```

첫 번째 `test` 링크는 `utm_source=test`, `utm_campaign=check`입니다. 나머지는 채널별 `1020_launch` 링크입니다. 캠페인을 바꾸려면 마지막 인수에 이름을 넣습니다.

```sh
node scripts/utm-links.mjs 'intoss-private://sagye-danji?_deploymentId=콘솔의실제배포ID' 1020_launch
```

테스트 링크로 미니앱을 새로 실행하고 `[Analytics] 시작 URL 확인`의 `search`, `initialURL`, `properties`를 확인합니다. 카카오톡에서 링크를 열 수 없으면 QR 생성 도구의 텍스트 유형에 링크 전체를 넣어 QR을 만든 뒤 토스에서 엽니다. 스킴 앞에 `https://`를 붙이지 않습니다.

정상적으로 읽으면 `properties`에 아래 값이 나옵니다.

```json
{ "utmSource": "test", "utmCampaign": "check" }
```

2026-10-13 인앱 테스트에서 `queryParams` JSON 전달, 위 두 값의 추출, events 성공 응답을 확인했습니다. 서버 저장과 시트 반영은 백엔드 확인이 남아 있습니다.

필드별로 현재 쿼리의 일반 UTM → 현재 쿼리의 JSON UTM → 초기 URL의 일반 UTM → 초기 URL의 JSON UTM 순서로 읽습니다. `URLSearchParams`가 디코딩한 값을 JSON으로 파싱합니다. 잘못된 JSON이나 배열은 무시하고, 문자열이 아닌 UTM은 `invalid`로 보냅니다. JSON 전체나 추가 필드는 서버로 보내지 않습니다.

`/analytics/events` 응답 성공과 백엔드의 SESSION_START·시트 기록을 확인합니다. 같은 앱 실행에서는 SESSION_START가 한 번만 발생하므로 채널을 바꿀 때마다 새 실행이 필요합니다. 확인 후 출시 빌드는 `VITE_ANALYTICS_DEBUG=false`로 다시 빌드합니다.

## 정식 출시용 링크 초안

출시 후 아래 링크의 실행과 UTM 전달을 확인합니다. 카카오톡 등에서 쓸 HTTPS 공유 링크는 별도로 만들어 테스트해야 합니다.

| 채널       | 스킴                                                                 |
| ---------- | -------------------------------------------------------------------- |
| Instagram  | `intoss://sagye-danji?utm_source=instagram&utm_campaign=1020_launch` |
| 에브리타임 | `intoss://sagye-danji?utm_source=everytime&utm_campaign=1020_launch` |
| 카카오톡   | `intoss://sagye-danji?utm_source=kakaotalk&utm_campaign=1020_launch` |
| Threads    | `intoss://sagye-danji?utm_source=threads&utm_campaign=1020_launch`   |
| X          | `intoss://sagye-danji?utm_source=x&utm_campaign=1020_launch`         |

게시물마다 `utm_campaign`을 구분합니다. 링크 생성 스크립트는 소문자 영문·숫자·밑줄·하이픈 1~64자만 받습니다.
