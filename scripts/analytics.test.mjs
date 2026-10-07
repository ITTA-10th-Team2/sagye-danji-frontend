import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

async function setup(enabled = true) {
  const requests = [];
  let handler = async (_url, options) => {
    const count = JSON.parse(options.body).events.length;
    return new Response(JSON.stringify({ success: true, data: { acceptedCount: count, duplicateCount: 0 } }));
  };
  let id = 0;
  const context = vm.createContext({
    crypto: { randomUUID: () => `id-${++id}` },
    Date,
    Set,
    Map,
    TextEncoder,
    Response,
    AbortSignal,
    console,
    setTimeout: () => 1,
    clearTimeout: () => {},
    fetch: async (...args) => {
      requests.push(args);
      return await handler(...args);
    },
  });
  const source = readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = new vm.SourceTextModule(output, {
    context,
    initializeImportMeta(meta) {
      meta.env = { VITE_ANALYTICS_ENABLED: String(enabled), VITE_SERVICE_VERSION: '1.2.3', VITE_API_BASE_URL: 'https://example.test/api' };
    },
  });
  await module.link(async (name) => {
    const values =
      name === './authStorage'
        ? { getAccessToken: () => 'test-token' }
        : { Environment: { environment: 'toss' }, getPlatformOS: () => 'ios' };
    return new vm.SyntheticModule(
      Object.keys(values),
      function () {
        for (const [key, value] of Object.entries(values)) this.setExport(key, value);
      },
      { context },
    );
  });
  await module.evaluate();
  return {
    api: module.namespace,
    requests,
    setHandler: (value) => {
      handler = value;
    },
  };
}

test('disabled analytics adds no headers and sends no requests', async () => {
  const { api, requests } = await setup(false);
  api.trackEvent('RECORD_START', { source: 'CAMERA' });
  await api.flushAnalytics();
  assert.equal(Object.keys(api.getAnalyticsHeaders()).length, 0);
  assert.equal(requests.length, 0);
});

test('batch shares session, preserves order, and flushes at ten events', async () => {
  const { api, requests } = await setup();
  for (let i = 0; i < 10; i++) api.trackEvent('RECORD_START', { source: 'GALLERY' });
  assert.equal(requests.length, 1);
  const [, options] = requests[0];
  const events = JSON.parse(options.body).events;
  assert.equal(events.length, 10);
  assert.equal(new Set(events.map((event) => event.eventId)).size, 10);
  assert.deepEqual(
    events.map((event) => event.sequence),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.ok(events.every((event) => event.sessionId === options.headers['X-Analytics-Session-Id'] && event.os === 'IOS'));
});

test('network failure retries identical event IDs and acknowledged duplicates leave queue', async () => {
  const { api, requests, setHandler } = await setup();
  setHandler(async () => {
    throw new Error('offline');
  });
  api.trackEvent('RECORD_START', { source: 'CAMERA' });
  await api.flushAnalytics();
  setHandler(async () => new Response(JSON.stringify({ success: true, data: { acceptedCount: 0, duplicateCount: 1 } })));
  await api.flushAnalytics();
  assert.equal(requests[0][1].body, requests[1][1].body);
  await api.flushAnalytics();
  assert.equal(requests.length, 2);
});

test('validation failure drops rejected batch without endless retry', async () => {
  const { api, requests, setHandler } = await setup();
  setHandler(async () => new Response('{}', { status: 400 }));
  api.trackEvent('HOME_VIEW', { entrySource: 'APP_OPEN' }, true);
  api.trackEvent('HOME_VIEW', { entrySource: 'APP_OPEN' }, true);
  await api.flushAnalytics();
  await api.flushAnalytics();
  assert.equal(requests.length, 1);
  assert.equal(JSON.parse(requests[0][1].body).events.length, 1);
});

test('in-flight lock prevents concurrent sends and hidden flush uses keepalive', async () => {
  const { api, requests, setHandler } = await setup();
  let finish;
  setHandler(
    async () =>
      await new Promise((resolve) => {
        finish = resolve;
      }),
  );
  api.trackEvent('RECORD_START', { source: 'CAMERA' });
  const pending = api.flushAnalytics(true);
  await api.flushAnalytics(true);
  assert.equal(requests.length, 1);
  assert.equal(requests[0][1].keepalive, true);
  finish(new Response(JSON.stringify({ success: true, data: { acceptedCount: 1, duplicateCount: 0 } })));
  await pending;
});
