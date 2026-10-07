import api from '../lib/axios';
import { validateRecordImage } from '../lib/recordImage';
import type { RecordImageContentType } from '../lib/recordImage';

export interface ImageUploadUrlRequest {
  contentType: RecordImageContentType;
  fileSize: number;
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
  return await api.post<ImageUploadUrlResponse, ImageUploadUrlResponse>('/images/presigned-url', request);
}
