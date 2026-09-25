import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

// Runs the real public/sw.js in a minimal service worker sandbox
const source = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');

type Listener = (event: any) => void;

function loadServiceWorker({ online = true } = {}) {
  const listeners: Record<string, Listener> = {};
  const stored = new Map<string, Map<string, unknown>>();
  const puts: string[] = [];

  const cacheFor = (name: string) => {
    if (!stored.has(name)) stored.set(name, new Map());
    const entries = stored.get(name)!;
    return {
      addAll: vi.fn(async (urls: string[]) => urls.forEach((u) => entries.set(u, `cached:${u}`))),
      put: vi.fn(async (req: any) => { puts.push(typeof req === 'string' ? req : req.url); }),
      match: vi.fn(async (req: any) => entries.get(typeof req === 'string' ? req : new URL(req.url).pathname)),
    };
  };

  const caches = {
    open: vi.fn(async (name: string) => cacheFor(name)),
    keys: vi.fn(async () => [...stored.keys()]),
    delete: vi.fn(async (name: string) => stored.delete(name)),
    match: vi.fn(async (req: any) => {
      const key = typeof req === 'string' ? req : new URL(req.url).pathname;
      for (const entries of stored.values()) if (entries.has(key)) return entries.get(key);
      return undefined;
    }),
  };

  const fetchMock = vi.fn(async (req: any) => {
    if (!online) throw new TypeError('Failed to fetch');
    return { status: 200, type: 'basic', clone: () => ({}), url: typeof req === 'string' ? req : req.url, body: 'network' };
  });

  const self = {
    addEventListener: (type: string, fn: Listener) => { listeners[type] = fn; },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
    registration: { showNotification: vi.fn() },
  };

  vm.runInNewContext(source, { self, caches, fetch: fetchMock, console: { log() {}, error() {}, warn() {} }, URL, Promise });

  const request = (url: string, { mode = 'no-cors', accept = '*/*', headers = {} as Record<string, string> } = {}) => ({
    url: `https://porkyrios.test${url}`,
    method: 'GET',
    mode,
    headers: { get: (h: string) => (h.toLowerCase() === 'accept' ? accept : headers[h] ?? null) },
    clone() { return this; },
  });

  async function dispatchFetch(req: ReturnType<typeof request>) {
    let responded: Promise<unknown> | null = null;
    listeners.fetch({ request: req, respondWith: (p: Promise<unknown>) => { responded = p; } });
    return { handled: responded !== null, response: responded ? await responded : undefined };
  }

  async function install() {
    let done: Promise<unknown> = Promise.resolve();
    listeners.install({ waitUntil: (p: Promise<unknown>) => { done = p; } });
    await done;
  }

  async function activate() {
    let done: Promise<unknown> = Promise.resolve();
    listeners.activate({ waitUntil: (p: Promise<unknown>) => { done = p; } });
    await done;
  }

  return { listeners, stored, puts, caches, fetchMock, request, dispatchFetch, install, activate };
}

describe('public/sw.js', () => {
  let sw: ReturnType<typeof loadServiceWorker>;

  beforeEach(() => {
    sw = loadServiceWorker();
  });

  it('precaches only the offline page and static files, never app pages', async () => {
    await sw.install();

    const precached = [...sw.stored.values()].flatMap((m) => [...m.keys()]);
    expect(precached).toContain('/offline.html');
    for (const page of ['/', '/menu', '/cart', '/tracking', '/payment', '/admin']) {
      expect(precached).not.toContain(page);
    }
  });

  it('deletes caches from older versions (which contain cached pages) on activate', async () => {
    sw.stored.set('porkyrios-v2', new Map([['/menu', 'old html']]));
    await sw.install();

    await sw.activate();

    expect(sw.stored.has('porkyrios-v2')).toBe(false);
  });

  it('serves page navigations from the network and does not store them', async () => {
    const { handled, response } = await sw.dispatchFetch(sw.request('/menu', { mode: 'navigate', accept: 'text/html' }));

    expect(handled).toBe(true);
    expect((response as any).body).toBe('network');
    expect(sw.puts).toHaveLength(0);
  });

  it('never serves a stale cached copy of a page, even if one exists', async () => {
    sw.stored.set('porkyrios-v3', new Map([['/menu', 'stale html']]));

    const { response } = await sw.dispatchFetch(sw.request('/menu', { mode: 'navigate', accept: 'text/html' }));

    expect((response as any).body).toBe('network');
  });

  it('shows the self-contained offline page when a navigation fails without connection', async () => {
    sw = loadServiceWorker({ online: false });
    await sw.install();

    const { response } = await sw.dispatchFetch(sw.request('/menu', { mode: 'navigate', accept: 'text/html' }));

    expect(response).toBe('cached:/offline.html');
  });

  it('leaves Next.js page data (RSC) and API requests to the network untouched', async () => {
    expect((await sw.dispatchFetch(sw.request('/menu?_rsc=abc123', { headers: { RSC: '1' } }))).handled).toBe(false);
    expect((await sw.dispatchFetch(sw.request('/tracking?_rsc=xyz'))).handled).toBe(false);
    expect((await sw.dispatchFetch(sw.request('/api/products'))).handled).toBe(false);
    expect(sw.puts).toHaveLength(0);
  });

  it('still caches static assets', async () => {
    const { handled } = await sw.dispatchFetch(sw.request('/_next/static/chunks/main-abc123.js'));

    expect(handled).toBe(true);
    await vi.waitFor(() => expect(sw.puts).toContain('https://porkyrios.test/_next/static/chunks/main-abc123.js'));
  });
});
