import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addSticker,
  baseStickerSize,
  clampStickerSize,
  maxStickerSize,
  normalizeStickerLayers,
  removeSticker,
  toStickerPayload,
} from '../src/lib/stickerValidation.ts';

const types = ['CLOVER', 'BUBBLE'];
const sticker = (id, zIndex = id, size = baseStickerSize, page = 0) => ({
  id,
  zIndex,
  size,
  page,
  option: id % 2,
  x: 38,
  y: 33,
  rotation: 15,
});
const layers = (items) => items.map((item) => item.zIndex);

test('normalizes empty, single and twenty sticker layers from zero', () => {
  for (const count of [0, 1, 20]) {
    const items = Array.from({ length: count }, (_, i) => sticker(i, i * 3 + 1));
    assert.deepEqual(
      layers(normalizeStickerLayers(items)),
      Array.from({ length: count }, (_, i) => i),
    );
  }
});

test('preserves visual order and tied DOM order without mutating the draft', () => {
  const items = [sticker(1, 9), sticker(2, 2), sticker(3, 9), sticker(4, -1)];
  const original = structuredClone(items);
  const normalized = normalizeStickerLayers(items);
  assert.deepEqual(
    normalized.map((item) => item.id),
    [4, 2, 1, 3],
  );
  assert.deepEqual(layers(normalized), [0, 1, 2, 3]);
  assert.deepEqual(items, original);
  assert.deepEqual(normalizeStickerLayers(normalized), normalized);
});

test('first add starts at zero; delete and re-add preserve layers and append on top', () => {
  assert.deepEqual(layers(addSticker([], sticker(1, 100))), [0]);
  for (const deletedId of [1, 2, 3]) {
    let items = [sticker(1, 2), sticker(2, 5), sticker(3, 9)];
    items = removeSticker(items, deletedId);
    assert.deepEqual(layers(items), [0, 1]);
    const remaining = items.map((item) => item.id);
    items = addSticker(items, sticker(4, -100));
    assert.deepEqual(
      items.map((item) => item.id),
      [...remaining, 4],
    );
    assert.deepEqual(layers(items), [0, 1, 2]);
  }
  assert.deepEqual(removeSticker([sticker(1)], 1), []);
});

test('UI resize clamps below, at and above both size boundaries', () => {
  for (const [input, expected] of [
    [10, 12.2665],
    [12.2664, 12.2665],
    [12.2665, 12.2665],
    [24.533, 24.533],
    [maxStickerSize, maxStickerSize],
    [maxStickerSize + 0.0001, maxStickerSize],
    [100, maxStickerSize],
  ])
    assert.equal(clampStickerSize(input), expected);
});

test('PUT payload clamps scale and normalizes only the saved page; preserves other fields', () => {
  const items = [sticker(1, 8, 10), sticker(2, 2, 100), sticker(3, 0, 24.533, 1)];
  const payload = toStickerPayload(items, 0, types);
  assert.deepEqual(payload, [
    { stickerType: 'CLOVER', xRatio: 0.38, yRatio: 0.33, scale: 2, rotation: 15, zIndex: 0 },
    { stickerType: 'BUBBLE', xRatio: 0.38, yRatio: 0.33, scale: 0.5, rotation: 15, zIndex: 1 },
  ]);
  for (const [size, scale] of [
    [12.2665, 0.5],
    [24.533, 1],
    [maxStickerSize, 2],
  ]) {
    assert.equal(toStickerPayload([sticker(1, 99, size)], 0, types)[0].scale, scale);
  }
  assert.deepEqual(toStickerPayload([], 0, types), []);
});

test('twentieth add succeeds, twenty-first is blocked, deletion frees a slot', () => {
  let items = Array.from({ length: 19 }, (_, i) => sticker(i, i * 2));
  items = addSticker(items, sticker(19));
  assert.equal(items.length, 20);
  assert.strictEqual(addSticker(items, sticker(20)), items);
  assert.equal(toStickerPayload(items, 0, types).length, 20);
  assert.throws(() => toStickerPayload([...items, sticker(20)], 0, types), /Too many stickers/);
  items = addSticker(removeSticker(items, 5), sticker(20));
  assert.equal(items.length, 20);
  assert.deepEqual(
    layers(items),
    Array.from({ length: 20 }, (_, i) => i),
  );
});

test('saveJarStickers sends validated items in the PUT body, including empty deletion', async () => {
  const { readFileSync } = await import('node:fs');
  const vm = await import('node:vm');
  const ts = (await import('typescript')).default;
  const calls = [];
  const context = vm.createContext({});
  const source = readFileSync(new URL('../src/apis/jars.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = new vm.SourceTextModule(output, { context });
  await module.link(
    async () =>
      new vm.SyntheticModule(
        ['default'],
        function () {
          this.setExport('default', {
            put: async (url, body) => {
              calls.push({ url, body });
              return { data: { items: body.items } };
            },
          });
        },
        { context },
      ),
  );
  await module.evaluate();
  const payload = toStickerPayload([sticker(1, 100, 10), sticker(2, 200, 100)], 0, types);
  assert.deepEqual(await module.namespace.saveJarStickers(70, payload), { items: payload });
  assert.equal(calls[0].url, '/jar-pages/70/stickers');
  assert.strictEqual(calls[0].body.items, payload);
  await module.namespace.saveJarStickers(70, []);
  assert.deepEqual(calls[1].body.items, []);
});
