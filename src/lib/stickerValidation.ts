import type { JarStickerItem, StickerType } from '../apis/jars';

export const baseStickerSize = 24.533;
export const minStickerSize = 12.2665;
export const maxStickerSize = baseStickerSize * 2;
export const maxStickerCount = 20;

export type Sticker = {
  id: number;
  option: number;
  x: number;
  y: number;
  size: number;
  page: number;
  rotation: number;
  zIndex: number;
};

export function clampStickerSize(size: number): number {
  return Math.max(minStickerSize, Math.min(maxStickerSize, size));
}

// Stable sorting preserves DOM layer order when old zIndex values are tied.
export function normalizeStickerLayers(items: Sticker[]): Sticker[] {
  return [...items].sort((a, b) => a.zIndex - b.zIndex).map((item, zIndex) => ({ ...item, zIndex }));
}

export function addSticker(items: Sticker[], sticker: Sticker): Sticker[] {
  if (items.length >= maxStickerCount) return items;
  const ordered = normalizeStickerLayers(items);
  return [...ordered, { ...sticker, zIndex: ordered.length }];
}

export function removeSticker(items: Sticker[], id: number): Sticker[] {
  return normalizeStickerLayers(items.filter((item) => item.id !== id));
}

export function toStickerPayload(items: Sticker[], page: number, types: StickerType[]): JarStickerItem[] {
  const ordered = normalizeStickerLayers(items.filter((item) => item.page === page));
  if (ordered.length > maxStickerCount) throw new Error('Too many stickers');
  return ordered.map((item) => ({
    stickerType: types[item.option],
    xRatio: item.x / 100,
    yRatio: item.y / 100,
    scale: Math.max(0.5, Math.min(2, clampStickerSize(item.size) / baseStickerSize)),
    rotation: item.rotation,
    zIndex: item.zIndex,
  }));
}
