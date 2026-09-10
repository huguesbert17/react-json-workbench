import type { ReactNode } from 'react';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject { [key: string]: JsonValue }
export type JsonNodeKind = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
export interface JsonNodeType {
  key: string;
  value: JsonValue;
  type: JsonNodeKind;
  path: string[];
  level: number;
  expanded?: boolean;
  children?: JsonNodeType[];
  parentType?: 'object' | 'array' | null;
}
export interface KeyChangeEvent { node: JsonNodeType; oldKey: string; newKey: string }

export interface JsonRibbonAction {
  /** Stable action id used as the React key. */
  id: string;
  /** Any React icon: SVG, Lucide icon, component, etc. */
  icon: ReactNode;
  /** Accessible label and native tooltip. */
  label: string;
  onClick: (node: JsonNodeType) => void;
  /** Hide an action for nodes where it is not relevant. */
  visible?: (node: JsonNodeType) => boolean;
  disabled?: boolean | ((node: JsonNodeType) => boolean);
  /** Optional styling hook, e.g. `danger`. */
  className?: string;
}


export interface JsonRibbonActionGroup {
  /** Stable id for the group container. */
  id: string;
  /** Actions rendered together inside one ribbon segment. */
  actions: JsonRibbonAction[];
  /** Optional accessible label for the group. */
  label?: string;
  /** Optional styling hook for the group wrapper. */
  className?: string;
}

export type JsonRibbonItem = JsonRibbonAction | JsonRibbonActionGroup;

export interface JsonViewerProps {
  data: JsonValue;
  onChange?: (data: JsonValue) => void;
  editable?: boolean;
  theme?: 'light' | 'dark';
  defaultMode?: 'tree' | 'text';
  showLineNumbers?: boolean;
  maxDepth?: number;
  hideActionText?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  hideModeSwitcher?: boolean;
  hideTreeControls?: boolean;
  hideEditControls?: boolean;
  hideSearchButton?: boolean;
  hideCopyButton?: boolean;
  hideDownloadButton?: boolean;
  hideThemeButton?: boolean;
  hideFormatButton?: boolean;
  /** Custom ribbon actions. Plain actions are grouped together; explicit groups render as separate segments. */
  ribbonActions?: JsonRibbonItem[];
  /** Show built-in ribbon actions. Copy value/path are always available; add/delete appear when tree editing is active. */
  showDefaultRibbonActions?: boolean;
  onNodeClick?: (node: JsonNodeType) => void;
  onNodeExpand?: (node: JsonNodeType) => void;
  onNodeCollapse?: (node: JsonNodeType) => void;
  onKeyChange?: (event: KeyChangeEvent) => void;
  onEditStart?: () => void;
  onEditSave?: (data: JsonValue) => void;
  onEditCancel?: () => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}
