# React JSON Viewer

A lightweight, dependency-free JSON viewer and editor for React + TypeScript. It provides tree and text views, syntax highlighting, inline editing, search, copy/download actions, light and dark themes, and extensible hover ribbons for node-level actions.

This project is an independent React adaptation inspired by Better Stack UI and Jeevan Lal's MIT-licensed `vue3-json-viewer`.

## Features

- Tree and text JSON views
- Syntax highlighting in read and edit modes
- Expand/collapse individual nodes or the full tree
- Inline key and primitive-value editing
- Add and delete tree values
- Search, copy, and JSON download controls
- Optional line numbers
- Light and dark themes
- Hover ribbons in tree and read-only text views
- Built-in ribbon actions for copying values and JSON paths
- Custom node-level ribbon actions
- Header and footer can be hidden independently
- TypeScript-first public API
- No runtime editor/highlighter dependency

## Installation

Until the package is published to npm, copy the `src` directory into your project or install directly from your Git repository.

For local development:

```bash
npm install
npm run dev
```

## Basic usage

```tsx
import { useState } from "react";
import { JsonViewer, type JsonValue } from "./src";

export function Example() {
  const [data, setData] = useState<JsonValue>({
    name: "Ada",
    active: true,
    profile: { role: "engineer" },
  });

  return (
    <JsonViewer
      data={data}
      onChange={setData}
      theme="dark"
      defaultMode="tree"
      showLineNumbers
    />
  );
}
```

## Custom hover-ribbon actions

The same custom ribbon API is available in tree view and read-only text view. Any React node can be used as the icon.

```tsx
import { ExternalLink, Search } from "lucide-react";

<JsonViewer
  data={data}
  ribbonActions={[
    {
      id: "inspect",
      label: "Inspect value",
      icon: <Search size={16} />,
      onClick: (node) => console.log(node.path, node.value),
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

The ribbon is available even when `ribbonActions` is omitted. With `showDefaultRibbonActions` enabled, the viewer includes built-in **Copy value** and **Copy JSON path** actions. In tree edit mode it also exposes **Add item** for expandable nodes and **Delete row**.

Set `showDefaultRibbonActions={false}` when the ribbon should contain only your custom actions.

The ribbon is intentionally hidden while editing in **Text** view so it never interferes with caret placement or text selection. Syntax highlighting remains active while editing.

## Header and footer

Both areas are independently optional:

```tsx
<JsonViewer data={data} hideHeader hideFooter />
```

## Props

| Prop                       | Type                 | Default   | Description                                                            |
| -------------------------- | -------------------- | --------- | ---------------------------------------------------------------------- |
| `data`                     | `JsonValue`          | required  | JSON value to render                                                   |
| `onChange`                 | `(data) => void`     | —         | Called after committed data changes                                    |
| `editable`                 | `boolean`            | `true`    | Enables editing controls                                               |
| `theme`                    | `'light' \| 'dark'`  | `'light'` | Viewer theme                                                           |
| `defaultMode`              | `'tree' \| 'text'`   | `'tree'`  | Initial view mode                                                      |
| `showLineNumbers`          | `boolean`            | `false`   | Shows line numbers in text mode                                        |
| `maxDepth`                 | `number`             | `3`       | Initial tree expansion depth                                           |
| `hideHeader`               | `boolean`            | `false`   | Hides the complete toolbar/header                                      |
| `hideFooter`               | `boolean`            | `false`   | Hides mode, size, and node statistics                                  |
| `hideModeSwitcher`         | `boolean`            | `false`   | Hides tree/text controls                                               |
| `hideTreeControls`         | `boolean`            | `false`   | Hides expand/collapse-all control                                      |
| `hideEditControls`         | `boolean`            | `false`   | Hides edit/save/cancel controls                                        |
| `hideSearchButton`         | `boolean`            | `false`   | Hides search                                                           |
| `hideCopyButton`           | `boolean`            | `false`   | Hides copy                                                             |
| `hideDownloadButton`       | `boolean`            | `false`   | Hides download                                                         |
| `hideThemeButton`          | `boolean`            | `false`   | Hides the theme toggle                                                 |
| `ribbonActions`            | `JsonRibbonAction[]` | `[]`      | Custom node actions shown on hover                                     |
| `showDefaultRibbonActions` | `boolean`            | `true`    | Shows built-in Copy value/Copy JSON path actions and tree edit actions |

Additional callbacks include `onNodeClick`, `onNodeExpand`, `onNodeCollapse`, `onKeyChange`, `onEditStart`, `onEditSave`, `onEditCancel`, and `onThemeChange`.

## Styling

Import `src/styles.css` once in your application. The viewer is styled with scoped `rjv-*` classes and CSS custom properties, making it straightforward to override dimensions, colors, spacing, and toolbar treatment without replacing the component markup.

## Development

```bash
npm install
npm run dev
```

Run a production build with:

```bash
npm run build
```

## Contributing

Issues and pull requests are welcome. Keep changes focused, preserve TypeScript types, and avoid adding runtime dependencies unless they provide a substantial benefit over the current implementation.

## License

MIT. See [LICENSE](./LICENSE).
