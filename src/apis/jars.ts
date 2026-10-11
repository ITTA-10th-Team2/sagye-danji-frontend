import api from '../lib/axios';
import type { ApiResponse } from '../lib/axios';
import type { RecordListItem, RecordSeason } from './records';

export type StickerType = 'CLOVER' | 'BUBBLE' | 'SHOOTING_STAR' | 'FIREWORK' | 'CAMERA' | 'FLOWER' | 'BOUQUET';
export interface JarStickerItem {
  stickerType: StickerType;
  xRatio: number;
  yRatio: number;
  scale: number;
  rotation: number;
  zIndex: number;
}
export interface JarPage {
  jarPageId: number;
  year: number;
  season: RecordSeason;
  pageNumber: number;
  records: RecordListItem[];
  stickers: JarStickerItem[];
}
export interface JarStickers {
  items: JarStickerItem[];
}

export async function getJarPage(year: number, season: RecordSeason, page: number, signal?: AbortSignal): Promise<JarPage> {
  const result = await api.get<ApiResponse<JarPage>, ApiResponse<JarPage>>('/jar-pages', { params: { year, season, page }, signal });
  return result.data;
}

export async function getJarStickers(jarPageId: number, signal?: AbortSignal): Promise<JarStickers> {
  const result = await api.get<ApiResponse<JarStickers>, ApiResponse<JarStickers>>(`/jar-pages/${jarPageId}/stickers`, { signal });
  return result.data;
}

/** Empty items also deletes all saved stickers on this page. */
export async function saveJarStickers(jarPageId: number, items: JarStickerItem[]): Promise<JarStickers> {
  const result = await api.put<ApiResponse<JarStickers>, ApiResponse<JarStickers>>(`/jar-pages/${jarPageId}/stickers`, { items });
  return result.data;
}

export async function deleteJarStickers(jarPageId: number): Promise<void> {
  await api.delete<ApiResponse<null>, ApiResponse<null>>(`/jar-pages/${jarPageId}/stickers`);
}
