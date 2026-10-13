const base = process.argv[2];
if (!base) throw new Error('콘솔 QR의 intoss-private:// 주소 또는 intoss://sagye-danji 주소를 인수로 입력해주세요.');
const url = new URL(base);
if (!['intoss:', 'intoss-private:'].includes(url.protocol) || url.hostname !== 'sagye-danji') {
  throw new Error('사계단지 토스 스킴 주소를 입력해주세요.');
}
const isPrivate = url.protocol === 'intoss-private:';
if (isPrivate && !url.searchParams.get('_deploymentId')) throw new Error('테스트 스킴의 _deploymentId가 필요합니다.');
let originalParams = {};
if (url.searchParams.has('queryParams')) {
  originalParams = JSON.parse(url.searchParams.get('queryParams'));
  if (!originalParams || typeof originalParams !== 'object' || Array.isArray(originalParams)) {
    throw new Error('queryParams는 JSON 객체여야 합니다.');
  }
}
const campaign = process.argv[3] || '1020_launch';
if (!/^[a-z0-9_-]{1,64}$/.test(campaign)) throw new Error('캠페인은 소문자 영문·숫자·밑줄·하이픈 1~64자로 입력해주세요.');
for (const source of ['test', 'instagram', 'everytime', 'kakaotalk', 'threads', 'x']) {
  const link = new URL(url);
  const params = { utm_source: source, utm_campaign: source === 'test' ? 'check' : campaign };
  if (isPrivate) {
    link.searchParams.delete('utm_source');
    link.searchParams.delete('utm_campaign');
    link.searchParams.set('queryParams', JSON.stringify({ ...originalParams, ...params }));
  } else {
    link.searchParams.set('utm_source', params.utm_source);
    link.searchParams.set('utm_campaign', params.utm_campaign);
  }
  console.log(`${source}: ${link.href}`);
}
