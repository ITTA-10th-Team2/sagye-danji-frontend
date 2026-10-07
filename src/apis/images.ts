import api from '../lib/axios';
import { validateRecordImage } from '../lib/recordImage';
import type { RecordImageContentType } from '../lib/recordImage';
import axios from 'axios';
import { prepareRecordImage } from '../lib/recordImage';
import type { ApiResponse } from '../lib/axios';

export type ImageUploadStage = 'image-prepare' | 'upload-url' | 'storage-put';

export interface ImageUploadUrlRequest {
  contentType: RecordImageContentType;
  fileSize: number;
}

/** 발급된 URL에 사진 원본 업로드 */
export async function uploadRecordImage(data: string, onStage?: (stage: ImageUploadStage) => void): Promise<string> {
  onStage?.('image-prepare');
  const { blob, contentType, fileSize } = prepareRecordImage(data);
  onStage?.('upload-url');
  const upload = await issueImageUploadUrl({ contentType, fileSize });
  const headers: Record<string, string> = {};
  for (const [name, value] of Object.entries(upload.requiredHeaders)) {
    if (name.toLowerCase() !== 'content-length') headers[name] = value;
  }
  if (!Object.keys(headers).some((name) => name.toLowerCase() === 'content-type')) headers['Content-Type'] = contentType;
  onStage?.('storage-put');
  const response = await axios.put(upload.uploadUrl, blob, { headers, withCredentials: false, timeout: 60000 });
  console.info('[Image] 업로드 완료', { status: response.status });
  return upload.objectKey;
}

export interface ImageUploadUrlResponse {
  objectKey: string;
  uploadUrl: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
}

// 사진 타입/크기 검사 후 업로드 URL과 객체 키 발급받기
export async function issueImageUploadUrl(request: ImageUploadUrlRequest): Promise<ImageUploadUrlResponse> {
  validateRecordImage(request.contentType, request.fileSize);
  const result = await api.post<
    ImageUploadUrlResponse | ApiResponse<ImageUploadUrlResponse>,
    ImageUploadUrlResponse | ApiResponse<ImageUploadUrlResponse>
  >('/images/presigned-url', request);
  const upload = 'data' in result ? result.data : result;
  if (
    !upload ||
    typeof upload.uploadUrl !== 'string' ||
    !upload.uploadUrl ||
    typeof upload.objectKey !== 'string' ||
    !upload.objectKey ||
    !upload.requiredHeaders ||
    typeof upload.requiredHeaders !== 'object'
  ) {
    throw new Error('업로드 URL 응답의 필수 항목을 확인하지 못했습니다.');
  }
  return upload;
}
