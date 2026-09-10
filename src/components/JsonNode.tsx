import { useEffect, useMemo, useRef, useState } from 'react';
import type { JsonNodeType, JsonRibbonAction, JsonValue, KeyChangeEvent } from '../types';
import { formatJsonPath, formatNodeValueForCopy, matchesNode, parseLooseValue } from '../utils';
import { ChevronDownIcon, ChevronRightIcon, PlusIcon, TrashIcon, CheckIcon, CancelIcon, CopyIcon, PathIcon } from './icons';

interface Props {
  node: JsonNodeType;
  editable: boolean;
  searchQuery: string;
  ribbonActions?: JsonRibbonAction[];
  showDefaultRibbonActions?: boolean;
  onNodeClick?: (node: JsonNodeType) => void;
  onNodeExpand?: (node: JsonNodeType) => void;
  onNodeCollapse?: (node: JsonNodeType) => void;
  onValueChange: (node: JsonNodeType, value: JsonValue) => void;
  onKeyChange: (event: KeyChangeEvent) => void;
  onDelete: (node: JsonNodeType) => void;
  onAdd: (parent: JsonNodeType, key: string, value: JsonValue) => void;
}

export default function JsonNode(props: Props) {
  const { node, editable, searchQuery, ribbonActions = [], showDefaultRibbonActions = true } = props;
  const [expanded, setExpanded] = useState(!!node.expanded);
  const [editingKey, setEditingKey] = useState(false);
  const [editingValue, setEditingValue] = useState(false);
  const [editKey, setEditKey] = useState(node.key);
  const [editValue, setEditValue] = useState(String(node.value ?? 'null'));
  const [adding, setAdding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const keyRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef<HTMLInputElement>(null);

  useEffect(() => setExpanded(!!node.expanded), [node.expanded]);
  useEffect(() => { if (editingKey) keyRef.current?.focus(); }, [editingKey]);
  useEffect(() => { if (editingValue) valueRef.current?.focus(); }, [editingValue]);

  const expandable = node.type === 'object' || node.type === 'array';
  const highlighted = useMemo(() => {
    if (!searchQuery) return false;
    const q = searchQuery.toLowerCase();
    return node.key.toLowerCase().includes(q) || (!expandable && String(node.value).toLowerCase().includes(q));
  }, [searchQuery, node, expandable]);
  const children = useMemo(() => (node.children ?? []).filter(c => matchesNode(c, searchQuery)), [node.children, searchQuery]);
  const customActions = useMemo(
    () => ribbonActions.filter(action => action.visible?.(node) ?? true),
    [ribbonActions, node]
  );
  const hasDefaultRibbon = showDefaultRibbonActions;
  const hasRibbon = customActions.length > 0 || hasDefaultRibbon;

  const toggle = () => {
    if (!expandable) return;
    const next = !expanded;
    setExpanded(next);
    const eventNode = { ...node, expanded: next };
    next ? props.onNodeExpand?.(eventNode) : props.onNodeCollapse?.(eventNode);
  };

  const saveKey = () => {
    const next = editKey.trim();
    if (next && next !== node.key && node.parentType !== 'array') props.onKeyChange({ node, oldKey: node.key, newKey: next });
    setEditingKey(false);
  };
  const saveValue = () => {
    props.onValueChange(node, parseLooseValue(editValue, node.value));
    setEditingValue(false);
  };
  const add = () => {
    if (node.type === 'object' && !newKey.trim()) return;
    props.onAdd(node, newKey.trim(), parseLooseValue(newValue));
    setNewKey(''); setNewValue(''); setAdding(false); setExpanded(true);
  };
  const displayKey = node.parentType === 'array' ? `[${node.key}]` : `"${node.key}"`;
  const summary = node.type === 'array' ? `Array(${node.children?.length ?? 0})` : `Object{${node.children?.length ?? 0}}`;
  const formatted = node.type === 'string' ? `"${node.value}"` : node.type === 'null' ? 'null' : String(node.value);

  return <div className="rjv-node">
    <div className={`rjv-node-header ${expandable ? 'expandable' : 'leaf'}`} onClick={() => props.onNodeClick?.(node)}>
      <span className="rjv-indent" style={{ width: node.level * 20 }} />
      <span className={`rjv-node-content ${highlighted ? 'highlighted' : ''}`}>
        {expandable && <button className="rjv-chevron" onClick={(e) => { e.stopPropagation(); toggle(); }} disabled={!expandable} aria-label={expanded ? 'Collapse node' : 'Expand node'}>
          {expandable ? (expanded ? <ChevronDownIcon /> : <ChevronRightIcon />) : null}
        </button>}
        <span className={`rjv-key ${editable && node.parentType !== 'array' ? 'editable' : ''}`}>
          {editingKey ? <input ref={keyRef} className="rjv-inline-input key" value={editKey} onChange={e => setEditKey(e.target.value)} onBlur={saveKey} onKeyDown={e => { if (e.key === 'Enter') saveKey(); if (e.key === 'Escape') setEditingKey(false); }} /> :
            <span onDoubleClick={() => { if (editable && node.parentType !== 'array') { setEditKey(node.key); setEditingKey(true); } }}>{displayKey}</span>}
        </span>
        <span className="rjv-colon">:</span>
        <span className="rjv-value-wrap">
          {!expandable ? (editingValue ? <input ref={valueRef} className={`rjv-inline-input value-${node.type}`} value={editValue} onChange={e => setEditValue(e.target.value)} onBlur={saveValue} onKeyDown={e => { if (e.key === 'Enter') saveValue(); if (e.key === 'Escape') setEditingValue(false); }} /> :
            <span className={`rjv-value value-${node.type} ${editable ? 'editable' : ''}`} onDoubleClick={() => { if (editable) { setEditValue(String(node.value ?? 'null')); setEditingValue(true); } }}>{formatted}</span>) :
            <span className={`rjv-summary value-${node.type}`}>{summary}</span>}
        </span>


        {hasRibbon && <span className="rjv-node-ribbon" onClick={e => e.stopPropagation()}>
          {customActions.map(action => {
            const disabled = typeof action.disabled === 'function' ? action.disabled(node) : !!action.disabled;
            return <button
              key={action.id}
              type="button"
              className={action.className}
              disabled={disabled}
              title={action.label}
              aria-label={action.label}
              onClick={() => action.onClick(node)}
            >{action.icon}</button>;
          })}
          {showDefaultRibbonActions && <>
            <button
              type="button"
              title="Copy value"
              aria-label="Copy value"
              onClick={() => { void navigator.clipboard.writeText(formatNodeValueForCopy(node.value)); }}
            ><CopyIcon /></button>
            <button
              type="button"
              title="Copy JSON path"
              aria-label="Copy JSON path"
              onClick={() => { void navigator.clipboard.writeText(formatJsonPath(node.path)); }}
            ><PathIcon /></button>
            {editable && expandable && <button type="button" onClick={() => setAdding(v => !v)} title="Add item" aria-label="Add item"><PlusIcon /></button>}
            {editable && <button type="button" className="danger" onClick={() => props.onDelete(node)} title="Delete row" aria-label="Delete row"><TrashIcon /></button>}
          </>}
        </span>}
      </span>
    </div>
    {expandable && expanded && <div className="rjv-children">
      {children.map(child => <JsonNode key={child.path.join('.')} {...props} node={child} />)}
      {editable && adding && <div className="rjv-add-row">
        <span className="rjv-indent" style={{ width: (node.level + 1) * 20 }} />
        <span className="rjv-chevron" />
        {node.type === 'object' && <><input className="rjv-inline-input key" placeholder="Key" value={newKey} onChange={e => setNewKey(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }} /><span className="rjv-colon">:</span></>}
        <input className="rjv-inline-input" placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add(); if (e.key === 'Escape') setAdding(false); }} />
        <button onClick={add} title="Add"><CheckIcon /></button><button onClick={() => setAdding(false)} title="Cancel"><CancelIcon /></button>
      </div>}
    </div>}
  </div>;
}
