import api from '../lib/axios';
import type { ApiResponse } from '../lib/axios';

export interface RecordCreateRequest {
  recordDate: string;
  memo: string | null;
  objectKey: string;
}

/** 업로드된 사진의 객체 키로 기록 생성 */
export async function createRecord(request: RecordCreateRequest): Promise<RecordDetail> {
  const result = await api.post<RecordDetail | ApiResponse<RecordDetail>, RecordDetail | ApiResponse<RecordDetail>>('/records', request);
  const record = 'data' in result ? result.data : result;
  if (!record || !Number.isInteger(record.id) || record.id <= 0) throw new Error('기록 생성 응답을 확인하지 못했습니다.');
  return record;
}

export type RecordSeason = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export interface RecordImage {
  id: number;
  originalUrl: string;
  thumbnailUrl: string;
}

export interface RecordListItem {
  id: number;
  recordDate: string;
  season: RecordSeason;
  memo: string | null;
  image: RecordImage | null;
}

export interface RecordDetail {
  id: number;
  recordDate: string;
  season: RecordSeason;
  memo: string | null;
  image: RecordImage | null;
  createdAt: string;
  updatedAt: string;
}

export interface RecordPage {
  items: RecordListItem[];
  nextCursor: string | null;
  hasNext: boolean;
}

export async function getSeasonRecords(year: number, season: RecordSeason, signal?: AbortSignal): Promise<RecordListItem[]> {
  const items: RecordListItem[] = [];
  const visited = new Set<string>();
  let cursor: string | undefined;
  do {
    const result = await api.get<ApiResponse<RecordPage>, ApiResponse<RecordPage>>(`/records/seasons/${season}`, {
      params: { year, size: 50, ...(cursor ? { cursor } : {}) },
      signal,
    });
    items.push(...result.data.items);
    if (!result.data.hasNext) break;
    const next = result.data.nextCursor;
    if (!next || visited.has(next)) throw new Error('기록 목록의 다음 페이지를 확인하지 못했어요.');
    visited.add(next);
    cursor = next;
  } while (cursor !== undefined);
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

export async function getRecord(id: number, signal?: AbortSignal): Promise<RecordDetail> {
  const result = await api.get<ApiResponse<RecordDetail>, ApiResponse<RecordDetail>>(`/records/${id}`, { signal });
  return result.data;
}

export async function updateRecord(id: number, recordDate: string, memo: string): Promise<RecordDetail> {
  // objectKey를 생략하면 기존 사진이 유지된다. 날짜 수정 시에도 memo를 함께 보낸다.
  const result = await api.patch<ApiResponse<RecordDetail>, ApiResponse<RecordDetail>>(`/records/${id}`, { recordDate, memo });
  return result.data;
}

export async function deleteRecord(id: number): Promise<void> {
  await api.delete<ApiResponse<null>, ApiResponse<null>>(`/records/${id}`);
}

export interface RecordSummary {
  recordCount: number;
  recordingDayCount: number;
  seasonRecordCounts: Record<RecordSeason, number>;
}

/** 홈 - 전체 기록 수 / 기록 기간 조회 */
export async function getRecordSummary(signal?: AbortSignal): Promise<RecordSummary> {
  const result = await api.get<ApiResponse<RecordSummary>, ApiResponse<RecordSummary>>('/records/summary', { signal });
  return result.data;
}
