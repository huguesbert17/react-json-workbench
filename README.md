# React JSON Workbench

A lightweight, extensible JSON viewer and editor for React and TypeScript.

React JSON Workbench combines an interactive tree inspector with a focused CodeMirror 6 text editor, contextual row actions, JSON formatting, theming, and a configurable toolbar without pulling in a full IDE-sized editor stack.

[Live playground](https://huguesbert17.github.io/react-json-workbench/) · [Issues](https://github.com/huguesbert17/react-json-workbench/issues)

## Features

- Tree and text JSON views
- Inline tree editing for keys and primitive values
- CodeMirror 6 text editing with accurate caret and selection behavior
- JSON syntax highlighting in read and edit modes
- Automatic closing for braces, brackets, and quotes
- Smart indentation, bracket matching, undo/redo, and Tab indentation
- JSON formatting from the header
- Expand/collapse controls and configurable initial depth
- Built-in copy-value and copy-path ribbon actions
- Grouped and custom ribbon actions
- Add/delete actions while editing the tree
- Search, copy, and download controls
- Optional line numbers
- Light and dark themes
- Optional header and footer
- TypeScript-first public API

## Installation

```bash
npm install react-json-workbench
```

Import the component and its stylesheet:

```tsx
import { JsonWorkbench, type JsonValue } from "react-json-workbench";
```

> The scoped package name is the current npm release name. The project and public component are both named **React JSON Workbench** / `JsonWorkbench`.

## Basic usage

```tsx
import { useState } from "react";
import { JsonWorkbench, type JsonValue } from "react-json-workbench";

export function Example() {
  const [data, setData] = useState<JsonValue>({
    name: "Ada",
    active: true,
    profile: {
      role: "engineer",
      languages: ["TypeScript", "Rust"],
    },
  });

  return (
    <JsonWorkbench
      data={data}
      onChange={setData}
      placeholder="Type your text to the editor"
      editable
      theme="dark"
      defaultMode="tree"
      showLineNumbers
      showDefaultRibbonActions
    />
  );
}
```

`JsonWorkbench` is the primary public component. `JsonNode` is an internal implementation detail and should not be imported directly.

For compatibility with early pre-release builds, `JsonViewer` remains exported as an alias of `JsonWorkbench`, but new code should use `JsonWorkbench`.

## Text editor

Text edit mode uses a deliberately narrow CodeMirror 6 integration rather than the umbrella `codemirror` package or a full IDE editor.

It provides:

- accurate caret and selection rendering
- JSON-aware syntax highlighting
- automatic closing of `{}`, `[]`, and quotes
- smart indentation
- bracket matching
- undo and redo
- Tab indentation
- optional line numbers

The hover ribbon is intentionally hidden while Text view is being edited so it cannot interfere with text selection.

### Format JSON

Text view includes a **Format** action in the header. Valid JSON is rewritten with two-space indentation. Invalid JSON is left untouched.

```tsx
<JsonWorkbench data={data} hideFormatButton />
```

## Ribbon actions

### Built-in actions

Enable the built-in ribbon:

```tsx
<JsonWorkbench data={data} showDefaultRibbonActions />
```

Built-in actions include a grouped **Copy value** and **Copy JSON path** segment. In Tree edit mode, add/delete actions are rendered as a separate edit group when applicable.

### Custom actions

```tsx
import { Search } from "lucide-react";

<JsonWorkbench
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

### Grouped actions

Actions can be grouped into separate ribbon segments:

```tsx
import { Copy, ExternalLink, Search } from "lucide-react";

<JsonWorkbench
  data={data}
  ribbonActions={[
    {
      id: "inspect-tools",
      label: "Inspect tools",
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
      id: "open-url",
      label: "Open URL",
      icon: <ExternalLink size={16} />,
      visible: (node) =>
        node.type === "string" && /^https?:\/\//.test(String(node.value)),
      onClick: (node) => window.open(String(node.value), "_blank"),
    },
  ]}
/>;
```

Consecutive standalone actions are automatically rendered together. Explicit `JsonRibbonActionGroup` objects create separate segments.

## Header and footer

Both can be disabled independently:

```tsx
<JsonWorkbench data={data} hideHeader hideFooter />
```

## Props

| Prop                       | Type                        | Default   | Description                                   |
| -------------------------- | --------------------------- | --------- | --------------------------------------------- |
| `data`                     | `JsonValue`                 | required  | JSON value to render                          |
| `onChange`                 | `(data: JsonValue) => void` | —         | Called after committed data changes           |
| `editable`                 | `boolean`                   | `true`    | Enables editing controls                      |
| `theme`                    | `'light' \| 'dark'`         | `'light'` | Viewer theme                                  |
| `defaultMode`              | `'tree' \| 'text'`          | `'tree'`  | Initial view mode                             |
| `showLineNumbers`          | `boolean`                   | `false`   | Shows line numbers in Text view/editor        |
| `maxDepth`                 | `number`                    | `3`       | Initial tree expansion depth                  |
| `hideActionText`           | `boolean`                   | `false`   | Hides toolbar action text where available     |
| `hideHeader`               | `boolean`                   | `false`   | Hides the complete header                     |
| `hideFooter`               | `boolean`                   | `false`   | Hides mode, size, and node statistics         |
| `hideModeSwitcher`         | `boolean`                   | `false`   | Hides Tree/Text controls                      |
| `hideTreeControls`         | `boolean`                   | `false`   | Hides expand/collapse-all controls            |
| `hideEditControls`         | `boolean`                   | `false`   | Hides edit/save/cancel controls               |
| `hideSearchButton`         | `boolean`                   | `false`   | Hides search                                  |
| `hideCopyButton`           | `boolean`                   | `false`   | Hides top-level copy action                   |
| `hideDownloadButton`       | `boolean`                   | `false`   | Hides JSON download                           |
| `hideThemeButton`          | `boolean`                   | `false`   | Hides theme toggle                            |
| `hideFormatButton`         | `boolean`                   | `false`   | Hides Text-view Format action                 |
| `ribbonActions`            | `JsonRibbonItem[]`          | `[]`      | Custom standalone and/or grouped node actions |
| `showDefaultRibbonActions` | `boolean`                   | `true`    | Shows built-in grouped ribbon actions         |
| `placeholder`              | `string`                    | `false`   | Text to display when empy                     |

Additional callbacks are available for node clicks, expansion/collapse, key changes, edit lifecycle, and theme changes:

```ts
onNodeClick?: (node: JsonNodeType) => void;
onNodeExpand?: (node: JsonNodeType) => void;
onNodeCollapse?: (node: JsonNodeType) => void;
onKeyChange?: (event: KeyChangeEvent) => void;
onEditStart?: () => void;
onEditSave?: (data: JsonValue) => void;
onEditCancel?: () => void;
onThemeChange?: (theme: "light" | "dark") => void;
```

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

## Package exports

The package ships compiled ESM, CommonJS, TypeScript declarations, and CSS from `dist/`.

```tsx
import { JsonWorkbench } from "react-json-workbench";
```

React and React DOM are peer dependencies. CodeMirror is kept as a focused runtime dependency and its modules are left external in the library build so consuming bundlers can deduplicate them normally.

## Playground

Run the interactive prop playground locally:

```bash
npm install
npm run dev
```

Build the GitHub Pages playground:

```bash
npm run build:demo
```

The generated site is written to `demo-dist/`.

## Library development

Type-check the project:

```bash
npm run typecheck
```

Build the publishable package:

```bash
npm run build
```

Inspect exactly what npm will publish:

```bash
npm run pack:check
```

The publishable files are intentionally restricted to `dist/`, `README.md`, and `LICENSE`.

## Publishing

For the current scoped package:

```bash
npm publish
```

`publishConfig.access` is set to `public`.

## Contributing

Issues and pull requests are welcome. Keep changes focused, preserve TypeScript types, and avoid turning the CodeMirror integration into a general-purpose IDE layer unless there is a clear JSON-workbench use case.

## License

MIT. See [LICENSE](./LICENSE).
