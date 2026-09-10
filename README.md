# React JSON Workbench

A lightweight JSON viewer and editor for React + TypeScript with tree and text views, inline tree editing, syntax highlighting, grouped hover actions, and a focused CodeMirror 6 integration for text editing.

The project is an independent React adaptation inspired by Better Stack's JSON UI and Jeevan Lal's MIT-licensed `vue3-json-viewer`.

## Features

- Tree and text JSON views
- Syntax highlighting in read and edit modes
- CodeMirror 6-powered text editing with accurate caret/selection behavior
- Automatic closing for `{}`, `[]`, and quotes
- Smart indentation, bracket matching, undo/redo, and Tab indentation
- Header **Format** action for pretty-printing JSON
- Expand/collapse individual nodes or the full tree
- Inline key and primitive-value editing
- Add and delete tree values
- Search, copy, and JSON download controls
- Optional line numbers
- Light and dark themes
- Hover ribbons in tree and read-only text views
- Built-in grouped ribbon actions
- Custom grouped or standalone ribbon actions
- Header and footer can be hidden independently
- TypeScript-first public API

## Installation

```bash
npm install @huguesbert17/react-json-workbench
```

For local development:

```bash
npm install
npm run dev
```

The text editor uses a deliberately small CodeMirror 6 surface rather than the umbrella `codemirror` package. Only the JSON language, editor view, language helpers, commands, bracket completion, and syntax-highlight tags are used.

## Basic usage

```tsx
import { useState } from "react";
import {
  ReactJsonWorkbench,
  type JsonValue,
} from "@huguesbert17/react-json-workbench";

export function Example() {
  const [data, setData] = useState<JsonValue>({
    name: "Ada",
    active: true,
    profile: { role: "engineer" },
  });

  return (
    <ReactJsonWorkbench
      data={data}
      onChange={setData}
      theme="dark"
      defaultMode="tree"
      showLineNumbers
    />
  );
}
```

## Text editor

Text edit mode uses CodeMirror 6 instead of a textarea/highlight overlay. This keeps the caret and selection aligned with the rendered text and provides editor behavior without bringing in a full IDE-style editor.

Typing an opening brace, bracket, or quote automatically inserts its matching closer. Enter uses language-aware indentation, matching brackets are highlighted, and normal undo/redo shortcuts work. Tab indents; press Escape and then Tab to move focus out of the editor.

The hover ribbon is intentionally hidden while Text view is being edited so it cannot interfere with text selection.

### Format JSON

Text view includes a **Format** button in the header. In edit mode it parses the current document and rewrites valid JSON using two-space indentation. Invalid JSON is left untouched and the existing error message is shown.

Hide the control with:

```tsx
<ReactJsonWorkbench data={data} hideFormatButton />
```

## Ribbon actions

Ribbons support both standalone actions and explicit groups. Existing standalone action arrays remain valid.

### Standalone actions

```tsx
import { Search } from "lucide-react";

<ReactJsonWorkbench
  data={data}
  ribbonActions={[
    {
      id: "inspect",
      label: "Inspect value",
      icon: <Search size={16} />,
      onClick: (node) => console.log(node.path, node.value),
    },
  ]}
/>;
```

Consecutive standalone actions are rendered together as one group.

### Grouped actions

Use `JsonRibbonActionGroup` when actions should be visually separated into their own button group:

```tsx
import { Copy, ExternalLink, Search } from "lucide-react";

<ReactJsonWorkbench
  data={data}
  ribbonActions={[
    {
      id: "inspect-group",
      label: "Inspect",
      actions: [
        {
          id: "inspect",
          label: "Inspect value",
          icon: <Search size={16} />,
          onClick: (node) => console.log(node),
        },
        {
          id: "copy-custom",
          label: "Copy raw value",
          icon: <Copy size={16} />,
          onClick: (node) => navigator.clipboard.writeText(String(node.value)),
        },
      ],
    },
    {
      id: "open",
      label: "Open URL",
      icon: <ExternalLink size={16} />,
      visible: (node) =>
        node.type === "string" && /^https?:\/\//.test(String(node.value)),
      onClick: (node) => window.open(String(node.value), "_blank"),
    },
  ]}
/>;
```

With `showDefaultRibbonActions` enabled, the built-in **Copy value** and **Copy JSON path** actions are grouped together. During Tree editing, **Add item** and **Delete row** are rendered as a separate edit group.

```tsx
<ReactJsonWorkbench data={data} showDefaultRibbonActions />
```

Set `showDefaultRibbonActions={false}` when the ribbon should contain only custom actions.

## Header and footer

Both areas are independently optional:

```tsx
<ReactJsonWorkbench data={data} hideHeader hideFooter />
```

## Props

| Prop                       | Type                | Default   | Description                                                     |
| -------------------------- | ------------------- | --------- | --------------------------------------------------------------- |
| `data`                     | `JsonValue`         | required  | JSON value to render                                            |
| `onChange`                 | `(data) => void`    | —         | Called after committed data changes                             |
| `editable`                 | `boolean`           | `true`    | Enables editing controls                                        |
| `theme`                    | `'light' \| 'dark'` | `'light'` | Viewer theme                                                    |
| `defaultMode`              | `'tree' \| 'text'`  | `'tree'`  | Initial view mode                                               |
| `showLineNumbers`          | `boolean`           | `false`   | Shows line numbers in text mode and the CodeMirror editor       |
| `maxDepth`                 | `number`            | `3`       | Initial tree expansion depth                                    |
| `hideActionText`           | `boolean`           | `false`   | Hides text labels on actions that provide one, including Format |
| `hideHeader`               | `boolean`           | `false`   | Hides the complete toolbar/header                               |
| `hideFooter`               | `boolean`           | `false`   | Hides mode, size, and node statistics                           |
| `hideModeSwitcher`         | `boolean`           | `false`   | Hides tree/text controls                                        |
| `hideTreeControls`         | `boolean`           | `false`   | Hides expand/collapse-all control                               |
| `hideEditControls`         | `boolean`           | `false`   | Hides edit/save/cancel controls                                 |
| `hideSearchButton`         | `boolean`           | `false`   | Hides search                                                    |
| `hideCopyButton`           | `boolean`           | `false`   | Hides copy                                                      |
| `hideDownloadButton`       | `boolean`           | `false`   | Hides download                                                  |
| `hideThemeButton`          | `boolean`           | `false`   | Hides the theme toggle                                          |
| `hideFormatButton`         | `boolean`           | `false`   | Hides the Text-view Format action                               |
| `ribbonActions`            | `JsonRibbonItem[]`  | `[]`      | Standalone and/or grouped custom node actions                   |
| `showDefaultRibbonActions` | `boolean`           | `true`    | Shows built-in grouped copy actions and Tree edit actions       |

Additional callbacks include `onNodeClick`, `onNodeExpand`, `onNodeCollapse`, `onKeyChange`, `onEditStart`, `onEditSave`, `onEditCancel`, and `onThemeChange`.

## Ribbon types

```ts
interface JsonRibbonAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: (node: JsonNodeType) => void;
  visible?: (node: JsonNodeType) => boolean;
  disabled?: boolean | ((node: JsonNodeType) => boolean);
  className?: string;
}

interface JsonRibbonActionGroup {
  id: string;
  actions: JsonRibbonAction[];
  label?: string;
  className?: string;
}

type JsonRibbonItem = JsonRibbonAction | JsonRibbonActionGroup;
```

## Styling

Import `src/styles.css` once when consuming the source directly. The viewer uses scoped `rjv-*` classes and CSS custom properties, so colors, dimensions, spacing, toolbar treatment, and ribbon surfaces can be overridden without replacing component markup.

CodeMirror is themed from the same viewer CSS variables, so Text edit mode stays visually consistent with Tree and read-only Text views.

## Development

```bash
npm install
npm run dev
```

Type-check and build with:

```bash
npm run typecheck
npm run build
```

## Contributing

Issues and pull requests are welcome. Keep changes focused, preserve TypeScript types, and keep runtime dependencies narrow. The CodeMirror integration should remain JSON-specific rather than growing into a general-purpose IDE layer.

## License

MIT. See [LICENSE](./LICENSE).
