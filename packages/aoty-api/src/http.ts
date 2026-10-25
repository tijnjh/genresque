/** Shared HTTP helpers for fetching albumoftheyear.org pages. */
import { setTimeout as sleep } from 'node:timers/promises';
import { int, str } from './compat.js';

export const DEFAULT_HEADERS: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'en-US,en;q=0.9',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'sec-ch-ua': '"Chromium";v="154", "Google Chrome";v="154", "Not A(Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};
export type Cookies = Record<string, unknown> | string | null;
let _session_cookies: Record<string, string> = {};
let _session_user_agent: string | null = null;
let _last_request_at = 0;
export const DEFAULT_MIN_REQUEST_INTERVAL = 0.75;
export const DEFAULT_MAX_RETRIES = 5;

export class CloudflareBlockedError extends Error {
    constructor(public url: string, detail: string | null = null) {
        super('albumoftheyear.org is blocking this request with a Cloudflare ' +
            `challenge (${detail || 'forbidden'}). ` +
            'Install impit, then pass browser cookies (especially cf_clearance) via ' +
            'new AOTY(cookies, user_agent) or AOTY_COOKIES, using the same User-Agent as that browser. ' +
            `See the README. URL: ${url}`);
        this.name = 'CloudflareBlockedError';
    }
}
export class HTTPError extends Error {
    constructor(public url: string, public code: number, public reason: string, public headers: Record<string, string>) {
        super(`HTTP Error ${code}: ${reason}`);
        this.name = 'HTTPError';
    }
}

export function normalize_cookies(cookies: Cookies = null): Record<string, string> {
    if (cookies === null) return {};
    if (typeof cookies === 'object' && !Array.isArray(cookies)) {
        return Object.fromEntries(Object.entries(cookies).filter(([, v]) => v !== null && v !== undefined).map(([k, v]) => [k, str(v)]));
    }
    if (typeof cookies === 'string') {
        const parsed: Record<string, string> = {};
        for (let part of cookies.split(';')) {
            part = part.trim();
            if (!part || !part.includes('=')) continue;
            const index = part.indexOf('=');
            Object.defineProperty(parsed, part.slice(0, index).trim(), {
                value: part.slice(index + 1).trim(), enumerable: true, configurable: true, writable: true,
            });
        }
        return parsed;
    }
    throw new TypeError('cookies must be a dict, Cookie header string, or null');
}
export function set_cookies(cookies: Cookies = null, user_agent: string | null = null, replace = true): void {
    const parsed = normalize_cookies(cookies);
    if (replace || !Object.keys(_session_cookies).length) _session_cookies = parsed;
    else _session_cookies = { ..._session_cookies, ...parsed };
    if (user_agent !== null) _session_user_agent = user_agent;
}
export function clear_cookies(): void { _session_cookies = {}; _session_user_agent = null; }
export function get_cookies(): Record<string, string> { return { ..._session_cookies }; }
export function _cookies_from_env(): Record<string, string> { return normalize_cookies(process.env.AOTY_COOKIES ?? null); }
export function _effective_cookies(): Record<string, string> {
    return Object.keys(_session_cookies).length ? _session_cookies : _cookies_from_env();
}
export function _effective_user_agent(): string {
    return _session_user_agent || process.env.AOTY_USER_AGENT || DEFAULT_HEADERS['User-Agent'];
}
export function _min_request_interval(): number {
    const raw = process.env.AOTY_MIN_REQUEST_INTERVAL;
    if (!raw) return DEFAULT_MIN_REQUEST_INTERVAL;
    const value = Number(raw);
    if (!raw.trim() || Number.isNaN(value)) throw new Error(`could not convert string to float: ${raw}`);
    return Math.max(0, value);
}
export function _max_retries(): number {
    const raw = process.env.AOTY_MAX_RETRIES;
    return raw ? Math.max(0, int(raw)) : DEFAULT_MAX_RETRIES;
}
export function _build_headers(include_cookie_header = true): Record<string, string> {
    const headers: Record<string, string> = { ...DEFAULT_HEADERS, 'User-Agent': _effective_user_agent() };
    if (include_cookie_header) {
        const cookies = _effective_cookies();
        if (Object.keys(cookies).length) headers.Cookie = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    }
    return headers;
}
export function _looks_like_cloudflare(body_text: string, headers: Record<string, string> = {}): boolean {
    const mitigated = headers['Cf-Mitigated'] || headers['cf-mitigated'];
    if (mitigated && mitigated.toLowerCase().includes('challenge')) return true;
    const lowered = body_text.toLowerCase();
    return lowered.includes('just a moment...') || lowered.includes('cf-browser-verification') ||
        lowered.includes('performing security verification') ||
        (lowered.includes('<title>just a moment...</title>') && lowered.includes('cdn-cgi/challenge-platform'));
}
export function _raise_if_cloudflare(url: string, body_text: string, headers: Record<string, string> = {}, detail: string | null = null): void {
    if (_looks_like_cloudflare(body_text, headers)) throw new CloudflareBlockedError(url, detail || 'challenge page in body');
}
// Serialize throttle reservations so simultaneous calls still respect request spacing.
let _throttle_queue: Promise<void> = Promise.resolve();
export function _throttle(): Promise<void> {
    const current = _throttle_queue.then(async () => {
        const interval = _min_request_interval();
        const now = performance.now() / 1000;
        const wait = interval - (now - _last_request_at);
        if (interval > 0 && wait > 0) await sleep(wait * 1000);
        _last_request_at = performance.now() / 1000;
    });
    _throttle_queue = current.catch(() => {});
    return current;
}
export function _retry_after_seconds(headers: Record<string, string> | null, attempt: number): number {
    const retry_after = headers?.['Retry-After'] || headers?.['retry-after'];
    if (retry_after) {
        const seconds = Number(retry_after);
        if (retry_after.trim() && !Number.isNaN(seconds)) return Math.max(0, seconds);
        const retry_at = Date.parse(retry_after);
        if (!Number.isNaN(retry_at)) return Math.max(0, retry_at / 1000 - Date.now() / 1000);
    }
    return Math.min(2 ** attempt, 30);
}
async function _response_body(url: string, response: Pick<Response, 'arrayBuffer' | 'headers' | 'status' | 'statusText'>): Promise<Buffer> {
    const body = Buffer.from(await response.arrayBuffer());
    const text = body.toString('utf8');
    const headers = Object.fromEntries(response.headers.entries());
    if ([403, 503].includes(response.status) && _looks_like_cloudflare(text, headers)) {
        throw new CloudflareBlockedError(url, `HTTP ${response.status}`);
    }
    if (response.status >= 400) throw new HTTPError(url, response.status, response.statusText, headers);
    _raise_if_cloudflare(url, text, headers);
    return body;
}
export async function _impit_available(): Promise<boolean> {
    try { await import('impit'); return true; } catch { return false; }
}
export async function _fetch_with_impit(url: string, timeout = 30): Promise<Buffer> {
    const { Impit } = await import('impit');
    const client = new Impit({ browser: 'chrome', timeout: timeout * 1000 });
    const response = await client.fetch(url, { headers: _build_headers(), redirect: 'follow' });
    return _response_body(url, response);
}
export async function _fetch_with_fetch(url: string, timeout = 30): Promise<Buffer> {
    let response: Response;
    try {
        response = await fetch(url, { headers: _build_headers(), redirect: 'follow', signal: AbortSignal.timeout(timeout * 1000) });
    } catch (exc) {
        throw new CloudflareBlockedError(url, exc instanceof Error ? exc.message : String(exc));
    }
    return _response_body(url, response);
}
/** Fetch raw HTML bytes, preferring Chrome TLS impersonation and retrying HTTP 429. */
export async function fetch_html(url: string, timeout = 30): Promise<Buffer> {
    const attempts = _max_retries() + 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
        await _throttle();
        try {
            if (await _impit_available()) return await _fetch_with_impit(url, timeout);
            return await _fetch_with_fetch(url, timeout);
        } catch (exc) {
            if (exc instanceof HTTPError && exc.code === 429 && attempt < attempts - 1) {
                await sleep(_retry_after_seconds(exc.headers, attempt) * 1000);
                continue;
            }
            throw exc;
        }
    }
    throw new Error('No request attempts');
}
