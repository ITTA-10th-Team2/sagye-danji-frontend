export type RecordImageSource = 'CAMERA' | 'GALLERY';
export type RecordImageContentType = 'image/jpeg' | 'image/png';

export interface WritePhotoState {
  photos: string[];
  source: RecordImageSource;
}

export const MAX_RECORD_IMAGE_BYTES = 10 * 1024 * 1024;

// 업로드 가능한 이미지 타입과 실제 파일 크기 확인
export function validateRecordImage(contentType: string, fileSize: number): asserts contentType is RecordImageContentType {
  if (contentType !== 'image/jpeg' && contentType !== 'image/png') throw new Error('JPEG 또는 PNG 사진만 등록할 수 있어요.');
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0) throw new Error('사진 파일이 비어 있거나 크기가 올바르지 않아요.');
  if (fileSize > MAX_RECORD_IMAGE_BYTES) throw new Error('사진은 한 장당 최대 10MB까지 등록할 수 있어요.');
}

// SDK의 Base64 사진을 실제 파일 형식에 맞는 업로드용 Blob으로 변환
export function prepareRecordImage(data: string): { blob: Blob; contentType: RecordImageContentType; fileSize: number } {
  const payload = data.startsWith('data:') ? /^data:[^;,]+;base64,([\s\S]+)$/.exec(data)?.[1] : data;
  if (!payload) throw new Error('사진 데이터를 읽을 수 없어요.');
  const base64 = payload.replace(/\s/g, '');
  if (base64.length > Math.ceil(MAX_RECORD_IMAGE_BYTES / 3) * 4) throw new Error('사진은 한 장당 최대 10MB까지 등록할 수 있어요.');
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('사진 데이터를 읽을 수 없어요.');
  }
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const pngHeader = [137, 80, 78, 71, 13, 10, 26, 10];
  const contentType = pngHeader.every((value, index) => bytes[index] === value)
    ? 'image/png'
    : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      ? 'image/jpeg'
      : '';
  validateRecordImage(contentType, bytes.length);
  return { blob: new Blob([bytes], { type: contentType }), contentType, fileSize: bytes.length };
}

// 사진 미리보기에 MIME 타입 붙이기
export function sdkPhotoToDataUrl(data: string): string {
  const payload = data.startsWith('data:') ? data.slice(data.indexOf(',') + 1) : data;
  const base64 = payload.replace(/\s/g, '');
  if (!base64 || base64.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error('사진 데이터를 읽을 수 없어요.');
  }
  const fileSize = (base64.length / 4) * 3 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  const header = atob(base64.slice(0, 12));
  const pngHeader = [137, 80, 78, 71, 13, 10, 26, 10];
  const contentType = pngHeader.every((value, index) => header.charCodeAt(index) === value)
    ? 'image/png'
    : header.charCodeAt(0) === 255 && header.charCodeAt(1) === 216 && header.charCodeAt(2) === 255
      ? 'image/jpeg'
      : '';
  validateRecordImage(contentType, fileSize);
  return `data:${contentType};base64,${base64}`;
}
