import type { JsonNodeType, JsonValue } from './types';

export const cloneJson = <T extends JsonValue>(value: T): T => JSON.parse(JSON.stringify(value));

export function kindOf(value: JsonValue): JsonNodeType['type'] {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return typeof value as JsonNodeType['type'];
}

export function buildNodes(data: JsonValue, maxDepth = 3): JsonNodeType[] {
  const walk = (key: string, value: JsonValue, path: string[], level: number, parentType: 'object'|'array'|null): JsonNodeType => {
    const type = kindOf(value);
    const expandable = type === 'object' || type === 'array';
    const node: JsonNodeType = { key, value, type, path, level, parentType, expanded: expandable ? level < maxDepth : false };
    if (expandable) {
      const entries = Array.isArray(value) ? value.map((v, i) => [String(i), v] as const) : Object.entries(value as Record<string, JsonValue>);
      node.children = entries.map(([k,v]) => walk(k, v as JsonValue, [...path, k], level + 1, type));
    }
    return node;
  };
  const rootType = kindOf(data);
  const entries = Array.isArray(data) ? data.map((v, i) => [String(i), v] as const) : rootType === 'object' ? Object.entries(data as Record<string, JsonValue>) : [['value', data] as const];
  return entries.map(([k,v]) => walk(k, v as JsonValue, [k], 0, rootType === 'array' ? 'array' : rootType === 'object' ? 'object' : null));
}

export function setAtPath(root: JsonValue, path: string[], value: JsonValue): JsonValue {
  const copy = cloneJson(root);
  if (path.length === 0) return value;
  let cursor: any = copy;
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
  cursor[path[path.length - 1]] = value;
  return copy;
}

export function deleteAtPath(root: JsonValue, path: string[]): JsonValue {
  const copy = cloneJson(root);
  if (!path.length) return copy;
  let cursor: any = copy;
  for (let i = 0; i < path.length - 1; i++) cursor = cursor[path[i]];
  const last = path[path.length - 1];
  if (Array.isArray(cursor)) cursor.splice(Number(last), 1); else delete cursor[last];
  return copy;
}

export function addAtPath(root: JsonValue, parentPath: string[], key: string, value: JsonValue): JsonValue {
  const copy = cloneJson(root);
  let cursor: any = copy;
  for (const part of parentPath) cursor = cursor[part];
  if (Array.isArray(cursor)) cursor.push(value); else cursor[key] = value;
  return copy;
}

export function renameAtPath(root: JsonValue, path: string[], newKey: string): JsonValue {
  if (!path.length) return root;
  const copy = cloneJson(root);
  let parent: any = copy;
  for (let i = 0; i < path.length - 1; i++) parent = parent[path[i]];
  if (Array.isArray(parent)) return copy;
  const oldKey = path[path.length - 1];
  if (oldKey === newKey || Object.prototype.hasOwnProperty.call(parent, newKey)) return copy;
  const rebuilt: Record<string, JsonValue> = {};
  for (const [k,v] of Object.entries(parent)) rebuilt[k === oldKey ? newKey : k] = v as JsonValue;
  for (const k of Object.keys(parent)) delete parent[k];
  Object.assign(parent, rebuilt);
  return copy;
}

export function parseLooseValue(input: string, original?: JsonValue): JsonValue {
  const text = input.trim();
  if (text === 'null') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (text !== '' && !Number.isNaN(Number(text)) && typeof original === 'number') return Number(text);
  try { return JSON.parse(text); } catch { return input; }
}

export function matchesNode(node: JsonNodeType, q: string): boolean {
  if (!q) return true;
  const query = q.toLowerCase();
  if (node.key.toLowerCase().includes(query)) return true;
  if (['string','number','boolean','null'].includes(node.type) && String(node.value).toLowerCase().includes(query)) return true;
  return !!node.children?.some(child => matchesNode(child, q));
}

export function countNodes(nodes: JsonNodeType[]): number {
  return nodes.reduce((n,node)=>n + 1 + (node.children ? countNodes(node.children) : 0), 0);
}

export function formatJsonPath(path: string[]): string {
  return path.reduce((acc, part) => {
    if (/^\d+$/.test(part)) return `${acc}[${part}]`;
    return `${acc}[${JSON.stringify(part)}]`;
  }, '$');
}

export function formatNodeValueForCopy(value: JsonValue): string {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
