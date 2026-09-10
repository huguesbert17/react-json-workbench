import { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { bracketMatching, HighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { json } from '@codemirror/lang-json';
import { tags } from '@lezer/highlight';

interface CodeMirrorJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  showLineNumbers?: boolean;
  ariaLabel?: string;
}

const jsonHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: 'var(--code-key)' },
  { tag: tags.string, color: 'var(--code-string)' },
  { tag: tags.number, color: 'var(--code-number)' },
  { tag: tags.bool, color: 'var(--code-boolean)' },
  { tag: tags.null, color: 'var(--code-null)' },
  { tag: tags.punctuation, color: 'var(--code-punctuation)' },
]);

const editorTheme = EditorView.theme({
  '&': {
    height: '100%',
    minHeight: '360px',
    backgroundColor: 'var(--bg)',
    color: 'var(--text)',
    fontSize: '12.5px',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    minHeight: '360px',
    overflow: 'auto',
    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    lineHeight: '1.65',
  },
  '.cm-content': {
    padding: '14px 16px',
    caretColor: 'var(--text)',
    fontVariantLigatures: 'none',
  },
  '.cm-line': {
    padding: '0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--text)',
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 35%, transparent)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--bg)',
    color: 'var(--muted2)',
    borderRight: '1px solid var(--border)',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 10px',
    minWidth: '0',
  },
  '.cm-activeLine, .cm-activeLineGutter': {
    backgroundColor: 'transparent',
  },
  '.cm-matchingBracket': {
    backgroundColor: 'color-mix(in srgb, var(--accent) 16%, transparent)',
    outline: '1px solid color-mix(in srgb, var(--accent) 45%, transparent)',
  },
});

export default function CodeMirrorJsonEditor({
  value,
  onChange,
  theme,
  showLineNumbers = false,
  ariaLabel = 'Edit JSON',
}: CodeMirrorJsonEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!hostRef.current) return;

    const extensions = [
      json(),
      history(),
      closeBrackets(),
      bracketMatching(),
      indentOnInput(),
      syntaxHighlighting(jsonHighlightStyle),
      editorTheme,
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        indentWithTab,
      ]),
      EditorView.contentAttributes.of({
        'aria-label': ariaLabel,
        spellcheck: 'false',
        autocapitalize: 'off',
        autocomplete: 'off',
      }),
      EditorView.updateListener.of(update => {
        if (update.docChanged) onChangeRef.current(update.state.doc.toString());
      }),
    ];

    if (showLineNumbers) extensions.push(lineNumbers());

    const view = new EditorView({
      doc: value,
      extensions,
      parent: hostRef.current,
    });

    viewRef.current = view;
    view.focus();

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Theme and gutter configuration are structural; rebuilding for those
    // infrequent changes keeps the integration small and predictable.
  }, [theme, showLineNumbers, ariaLabel]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;

    const head = Math.min(view.state.selection.main.head, value.length);
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
      selection: { anchor: head },
    });
  }, [value]);

  return <div ref={hostRef} className={`rjv-codemirror theme-${theme}`} />;
}
