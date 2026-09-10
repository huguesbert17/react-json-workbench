import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import type { JsonNodeType, JsonRibbonActionGroup, JsonValue, JsonViewerProps, KeyChangeEvent } from '../types';
import { addAtPath, buildNodes, cloneJson, countNodes, deleteAtPath, formatJsonPath, formatNodeValueForCopy, renameAtPath, setAtPath } from '../utils';
import JsonNode from './JsonNode';
import CodeMirrorJsonEditor from './CodeMirrorJsonEditor';
import Ribbon from './Ribbon';
import { TreeIcon, CodeIcon, ExpandIcon, CollapseIcon, EditIcon, CancelIcon, CopyIcon, DownloadIcon, SearchIcon, MoonIcon, SunIcon, JsonIcon, CheckIcon, PathIcon, FormatIcon } from './icons';
import '../styles.css';

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function highlightJsonLine(line: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const tokenPattern = /("(?:\\.|[^"\\])*")(?=\s*:)|("(?:\\.|[^"\\])*")|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={`p-${lastIndex}`} className="rjv-token-punctuation">{line.slice(lastIndex, match.index)}</span>);
    }

    let className = 'rjv-token-number';
    if (match[1]) className = 'rjv-token-key';
    else if (match[2]) className = 'rjv-token-string';
    else if (match[3]) className = 'rjv-token-boolean';
    else if (match[4]) className = 'rjv-token-null';

    tokens.push(<span key={`t-${match.index}`} className={className}>{match[0]}</span>);
    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push(<span key={`p-${lastIndex}`} className="rjv-token-punctuation">{line.slice(lastIndex)}</span>);
  }
  return tokens;
}

function HighlightedJson({ text }: { text: string }) {
  const lines = text.split('\n');
  return <>{lines.map((line, i) => <span className="rjv-code-line" key={i}>{highlightJsonLine(line)}{i < lines.length - 1 ? '\n' : null}</span>)}</>;
}

function nodeAtPath(data: JsonValue, path: string[]): JsonNodeType | null {
  let value: JsonValue = data;
  let parentType: 'object' | 'array' | null = Array.isArray(data) ? 'array' : (data && typeof data === 'object' ? 'object' : null);
  for (let i = 0; i < path.length; i++) {
    if (value === null || typeof value !== 'object') return null;
    const key = path[i];
    const parent = value;
    value = Array.isArray(parent) ? parent[Number(key)] : (parent as Record<string, JsonValue>)[key];
    if (value === undefined) return null;
    if (i < path.length - 1) parentType = Array.isArray(value) ? 'array' : (value && typeof value === 'object' ? 'object' : null);
  }
  const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value === 'object' ? 'object' : typeof value as JsonNodeType['type'];
  return { key: path[path.length - 1] ?? '', value, type, path, level: Math.max(0, path.length - 1), parentType };
}

function mapJsonLinesToNodes(text: string, data: JsonValue): Array<JsonNodeType | null> {
  const result: Array<JsonNodeType | null> = [];
  const stack: Array<{ path: string[]; type: 'object' | 'array'; nextIndex: number }> = [];
  const lines = text.split('\n');

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '{' || line === '[') { result.push(null); continue; }
    if (/^[}\]]/.test(line)) { stack.pop(); result.push(null); continue; }

    const parent = stack[stack.length - 1];
    let path: string[] = [];
    let remainder = line;
    const keyMatch = line.match(/^"((?:\\.|[^"\\])*)"\s*:\s*(.*)$/);
    if (keyMatch) {
      let key = keyMatch[1];
      try { key = JSON.parse(`"${key}"`); } catch { }
      path = [...(parent?.path ?? []), key];
      remainder = keyMatch[2];
    } else if (parent?.type === 'array') {
      path = [...parent.path, String(parent.nextIndex++)];
    } else {
      result.push(null);
      continue;
    }

    const node = nodeAtPath(data, path);
    result.push(node);
    const valuePart = remainder.replace(/,$/, '').trim();
    if (valuePart === '{') stack.push({ path, type: 'object', nextIndex: 0 });
    else if (valuePart === '[') stack.push({ path, type: 'array', nextIndex: 0 });
  }
  return result;
}

function expandNodes(nodes: JsonNodeType[], expanded: boolean): JsonNodeType[] {
  return nodes.map(n => ({ ...n, expanded: (n.type === 'object' || n.type === 'array') ? expanded : n.expanded, children: n.children ? expandNodes(n.children, expanded) : undefined }));
}

export default function JsonViewer({
  data,
  onChange,
  editable = true,
  theme = 'light',
  defaultMode = 'tree',
  showLineNumbers = false,
  maxDepth = 3,
  hideActionText = false,
  hideHeader = false,
  hideFooter = false,
  hideModeSwitcher = false,
  hideTreeControls = false,
  hideEditControls = false,
  hideSearchButton = false,
  hideCopyButton = false,
  hideDownloadButton = false,
  hideThemeButton = false,
  hideFormatButton = false,
  ribbonActions = [],
  showDefaultRibbonActions = true,
  onNodeClick,
  onNodeExpand,
  onNodeCollapse,
  onKeyChange,
  onEditStart,
  onEditSave,
  onEditCancel,
  onThemeChange,
}: JsonViewerProps) {
  const [currentData, setCurrentData] = useState<JsonValue>(() => cloneJson(data));
  const [mode, setMode] = useState<'tree' | 'text'>(defaultMode);
  const [editMode, setEditMode] = useState(false);
  const [original, setOriginal] = useState<JsonValue | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));
  const [jsonError, setJsonError] = useState('');
  const [nodes, setNodes] = useState(() => buildNodes(data, maxDepth));
  const [allExpanded, setAllExpanded] = useState(false);
  const [hoveredTextLine, setHoveredTextLine] = useState<number | null>(null);
  const [hoveredTextRibbonLeft, setHoveredTextRibbonLeft] = useState(8);

  useEffect(() => {
    if (!editMode) {
      const next = cloneJson(data);
      setCurrentData(next);
      setJsonText(JSON.stringify(next, null, 2));
      setNodes(buildNodes(next, maxDepth));
    }
  }, [data, editMode, maxDepth]);

  const applyDraft = (next: JsonValue) => {
    setCurrentData(next);
    setJsonText(JSON.stringify(next, null, 2));
    setNodes(buildNodes(next, maxDepth));
  };

  const commit = (next: JsonValue) => {
    applyDraft(next);
    onChange?.(next);
  };

  const startEdit = () => {
    if (!editable) return;
    if (!editMode) {
      setOriginal(cloneJson(currentData));
      setEditMode(true);
      onEditStart?.();
    } else {
      setEditMode(false);
    }
  };

  const save = () => {
    let next = currentData;
    if (mode === 'text') {
      try {
        next = JSON.parse(jsonText) as JsonValue;
        setJsonError('');
      } catch (e) {
        setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
        return;
      }
    }
    commit(next);
    setEditMode(false);
    setOriginal(null);
    onEditSave?.(next);
  };

  const cancel = () => {
    if (original !== null) {
      setCurrentData(original);
      setJsonText(JSON.stringify(original, null, 2));
      setNodes(buildNodes(original, maxDepth));
    }
    setJsonError('');
    setEditMode(false);
    setOriginal(null);
    onEditCancel?.();
  };

  const validateText = (value: string) => {
    setJsonText(value);
    try { JSON.parse(value); setJsonError(''); } catch (e) { setJsonError(e instanceof Error ? e.message : 'Invalid JSON'); }
  };


  const handleValueChange = (node: JsonNodeType, value: JsonValue) => applyDraft(setAtPath(currentData, node.path, value));
  const handleDelete = (node: JsonNodeType) => applyDraft(deleteAtPath(currentData, node.path));
  const handleAdd = (parent: JsonNodeType, key: string, value: JsonValue) => applyDraft(addAtPath(currentData, parent.path, key, value));
  const handleKeyChange = (event: KeyChangeEvent) => {
    const next = renameAtPath(currentData, event.node.path, event.newKey);
    applyDraft(next);
    onKeyChange?.(event);
  };

  const copy = async () => { await navigator.clipboard.writeText(JSON.stringify(currentData, null, 2)); };
  const format = () => {
    if (mode !== 'text') return;
    try {
      const source = editMode ? jsonText : JSON.stringify(currentData);
      const parsed = JSON.parse(source) as JsonValue;
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError('');
      if (!editMode) applyDraft(parsed);
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  };
  const download = () => {
    const blob = new Blob([JSON.stringify(currentData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'data.json'; a.click(); URL.revokeObjectURL(url);
  };

  const toggleAll = () => {
    const next = !allExpanded;
    setNodes(expandNodes(nodes, next));
    setAllExpanded(next);
  };

  const pretty = JSON.stringify(currentData, null, 2);
  const lines = pretty.split('\n');
  const textRibbonData = useMemo(() => { try { return JSON.parse(jsonText) as JsonValue; } catch { return currentData; } }, [jsonText, currentData]);
  const textLineNodes = useMemo(() => mapJsonLinesToNodes(editMode ? jsonText : pretty, textRibbonData), [editMode, jsonText, pretty, textRibbonData]);
  const jsonSize = new Blob([JSON.stringify(currentData)]).size;
  const totalNodes = useMemo(() => countNodes(nodes), [nodes]);
  const handleTextMouseMove = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.currentTarget;
    const styles = getComputedStyle(target);
    const lineHeight = parseFloat(styles.lineHeight) || 20.625;
    const paddingTop = parseFloat(styles.paddingTop) || 0;
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const targetRect = target.getBoundingClientRect();
    const y = event.clientY - targetRect.top + target.scrollTop - paddingTop;
    const line = Math.max(0, Math.floor(y / lineHeight));
    setHoveredTextLine(line);

    // Keep the ribbon next to the actual line content instead of pinning it
    // to the far-right edge of the text view. Clamp it to the visible area
    // so long lines cannot push the ribbon off-screen.
    const lineText = pretty.split('\n')[line] ?? '';
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      context.font = `${styles.fontSize} ${styles.fontFamily}`;
      const lineWidth = context.measureText(lineText).width;
      const parent = target.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        const relativeStart = targetRect.left - parentRect.left;
        const desiredLeft = relativeStart + paddingLeft + lineWidth - target.scrollLeft + 6;
        const maxLeft = Math.max(8, parent.clientWidth - 44);
        setHoveredTextRibbonLeft(Math.max(8, Math.min(desiredLeft, maxLeft)));
      }
    }
  };

  const textDefaultRibbonGroups: JsonRibbonActionGroup[] = showDefaultRibbonActions ? [{
    id: 'copy',
    label: 'Copy',
    actions: [
      { id: 'copy-value', label: 'Copy value', icon: <CopyIcon />, onClick: node => { void navigator.clipboard.writeText(formatNodeValueForCopy(node.value)); } },
      { id: 'copy-path', label: 'Copy JSON path', icon: <PathIcon />, onClick: node => { void navigator.clipboard.writeText(formatJsonPath(node.path)); } },
    ],
  }] : [];

  return <div className={`react-json-viewer theme-${theme}`}>
    {!hideHeader && <div className="rjv-toolbar">
      <div className="rjv-brand"><JsonIcon /><span>JSON</span></div>

      <div className="rjv-toolbar-group right">
        {!hideTreeControls && mode === 'tree' && <button className="rjv-expand-all" onClick={toggleAll} title={allExpanded ? 'Collapse all' : 'Expand all'}>
          {allExpanded ? <CollapseIcon /> : <ExpandIcon />}<span>{allExpanded ? 'Collapse all' : 'Expand all'}</span>
        </button>}

        {!hideModeSwitcher && <div className="rjv-button-group" aria-label="View mode">
          <button className={mode === 'tree' ? 'active' : ''} onClick={() => setMode('tree')} title="Tree view" aria-label="Tree view"><TreeIcon /></button>
          <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')} title="Text view" aria-label="Text view"><CodeIcon /></button>
        </div>}

        {!hideEditControls && editable && <div className="rjv-button-group">
          {!editMode && <button onClick={startEdit} title="Edit JSON" aria-label="Edit JSON"><EditIcon /></button>}
          {editMode && <>
            <button className="save" onClick={save} title="Save changes"><CheckIcon /></button>
            <button className="danger" onMouseDown={e => e.preventDefault()} onClick={cancel} title="Cancel changes"><CancelIcon /></button>
          </>}
        </div>}

        {!hideFormatButton && mode === 'text' && <button className="rjv-format" onClick={format} title="Format JSON" aria-label="Format JSON"><FormatIcon />{!hideActionText && <span>Format</span>}</button>}
        {!hideSearchButton && <button onClick={() => setSearchOpen(v => !v)} title="Search JSON"><SearchIcon /></button>}
        {!hideDownloadButton && <button onClick={download} title="Download JSON"><DownloadIcon /></button>}
        {!hideCopyButton && <button onClick={copy} title="Copy JSON"><CopyIcon /></button>}
        {!hideThemeButton && <button onClick={() => onThemeChange?.(theme === 'light' ? 'dark' : 'light')} title="Toggle theme">{theme === 'light' ? <MoonIcon /> : <SunIcon />}</button>}
      </div>
    </div>}

    <div className="rjv-view-area">
      {searchOpen && <div className="rjv-search">
        <SearchIcon />
        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search JSON..." />
        <button onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
          <CancelIcon />
        </button>
      </div>}
      {mode === 'tree' ? <div className="rjv-tree">{nodes.filter(n => !searchQuery || n.key.toLowerCase().includes(searchQuery.toLowerCase()) || String(n.value).toLowerCase().includes(searchQuery.toLowerCase()) || n.children?.length).map(node =>
        <JsonNode key={node.path.join('.')} node={node} editable={editMode} searchQuery={searchQuery} ribbonActions={ribbonActions} showDefaultRibbonActions={showDefaultRibbonActions} onNodeClick={onNodeClick} onNodeExpand={onNodeExpand} onNodeCollapse={onNodeCollapse} onValueChange={handleValueChange} onKeyChange={handleKeyChange} onDelete={handleDelete} onAdd={handleAdd} />
      )}</div> : <div className="rjv-text-view" onMouseLeave={() => setHoveredTextLine(null)}>
        {editMode ? <div className={`rjv-editor ${jsonError ? 'error' : ''}`}>
          <CodeMirrorJsonEditor
            value={jsonText}
            onChange={validateText}
            theme={theme}
            showLineNumbers={showLineNumbers}
          />
        </div> :
          <div className="rjv-code-wrap">
            {showLineNumbers && <div className="rjv-line-numbers">{lines.map((_, i) => <span key={i}>{i + 1}</span>)}</div>}
            <pre className="rjv-highlighted-json" onMouseMove={handleTextMouseMove}><code><HighlightedJson text={pretty} /></code></pre>
            {hoveredTextLine !== null && textLineNodes[hoveredTextLine] && <span className="rjv-text-ribbon-anchor rjv-text-ribbon-readonly" style={{ top: `calc(14px + ${hoveredTextLine} * 1.65em)`, left: hoveredTextRibbonLeft }}>
              <Ribbon node={textLineNodes[hoveredTextLine]!} items={ribbonActions} defaultGroups={textDefaultRibbonGroups} className="rjv-text-ribbon" />
            </span>}
          </div>}
        {jsonError && <div className="rjv-error">Invalid JSON: {jsonError}</div>}
      </div>}
    </div>

    {!hideFooter && <div className="rjv-footer"><span>Mode: <strong>{mode}</strong></span><span>Size: <strong>{formatSize(jsonSize)}</strong></span>{mode === 'tree' && <span>Nodes: <strong>{totalNodes}</strong></span>}</div>}
  </div>;
}
