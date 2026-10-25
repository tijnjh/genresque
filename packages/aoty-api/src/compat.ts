/** Small Python/BeautifulSoup compatibility surface used by the direct port. */
import { parseDocument } from 'htmlparser2';
import { isTag, hasChildren, type AnyNode } from 'domhandler';

type Attributes = Record<string, string>;
export class Soup {
    constructor(readonly node: AnyNode) {}
    get name(): string { return isTag(this.node) ? this.node.name : '[document]'; }
    attr(name: string): string {
        if (!isTag(this.node) || !(name in this.node.attribs)) throw new Error(`Missing attribute: ${name}`);
        return this.node.attribs[name];
    }
    find_all(name: string | string[] | null = null, attrs: Attributes = {}): Soup[] {
        const result: Soup[] = [];
        const visit = (node: AnyNode): void => {
            if (!hasChildren(node)) return;
            for (const child of node.children) {
                if (isTag(child) && (!name || (Array.isArray(name) ? name.includes(child.name) : child.name === name)) &&
                    Object.entries(attrs).every(([key, value]) => {
                        const actual = child.attribs[key];
                        return key === 'class' && !/\s/.test(value)
                            ? (actual ?? '').split(/\s+/).includes(value)
                            : actual === value;
                    })) result.push(new Soup(child));
                visit(child);
            }
        };
        visit(this.node);
        return result;
    }
    find(name: string | string[] | null = null, attrs: Attributes = {}): Soup | null {
        return this.find_all(name, attrs)[0] ?? null;
    }
    get_text(separator = '', strip = false): string {
        const texts: string[] = [];
        const visit = (node: AnyNode): void => {
            if (node.type === 'text') {
                const value = strip ? node.data.trim() : node.data;
                if (value) texts.push(value);
            } else if (hasChildren(node) && !['script', 'style'].includes(node.type)) {
                node.children.forEach(visit);
            }
        };
        visit(this.node);
        return texts.join(separator);
    }
    getText(strip = false): string { return this.get_text('', strip); }
}
export function BeautifulSoup(html: string | Uint8Array, _parser = 'html.parser'): Soup {
    return new Soup(parseDocument(typeof html === 'string' ? html : Buffer.from(html).toString('utf8')));
}
export function int(value: string | number): number {
    if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
    const text = String(value).trim();
    if (!/^[+-]?\d(?:_?\d)*$/.test(text)) throw new Error(`invalid literal for int(): ${JSON.stringify(value)}`);
    return Number(text.replaceAll('_', ''));
}
export function str(value: unknown): string {
    if (value === null) return 'None';
    if (value === true) return 'True';
    if (value === false) return 'False';
    return String(value);
}
/** Python json.dumps defaults: ASCII escaping and spaces after separators. */
export const json = {
    dumps(value: unknown, sort_keys = false, indent: number | null = null): string {
        const quote = (s: string) => JSON.stringify(s).replace(/[\u007f-\uffff]/g,
            c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
        const encode = (v: unknown): string => {
            if (typeof v === 'string') return quote(v);
            if (v === null) return 'null';
            if (Array.isArray(v)) {
                const parts = v.map(encode);
                return parts.length && indent === 0 ? `[\n${parts.join(',\n')}\n]` : `[${parts.join(', ')}]`;
            }
            if (typeof v === 'object') {
                let entries = Object.entries(v);
                if (sort_keys) entries = entries.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
                const parts = entries.map(([key, val]) => `${quote(key)}: ${encode(val)}`);
                return parts.length && indent === 0 ? `{\n${parts.join(',\n')}\n}` : `{${parts.join(', ')}}`;
            }
            if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
            return JSON.stringify(v);
        };
        return encode(value);
    },
};
/** Copy prototypes to mirror Python's multiple inheritance without extra modules. */
export function mixin(target: Function, bases: Function[]): void {
    for (const base of [...bases].reverse()) {
        for (const name of Object.getOwnPropertyNames(base.prototype)) {
            if (name !== 'constructor') Object.defineProperty(target.prototype, name,
                Object.getOwnPropertyDescriptor(base.prototype, name)!);
        }
    }
}
