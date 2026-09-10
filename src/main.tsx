import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import JsonViewer from './components/JsonViewer';
import type { JsonRibbonItem, JsonValue } from './types';
import { PathIcon, SearchIcon } from './components/icons';
import './demo.css';

const INITIAL_DATA: JsonValue = {
  request: {
    id: 'req_01J8Y9ATPQ4FM2EZ0N8W1B6K3S',
    method: 'POST',
    path: '/v1/transfers',
    status: 200,
    duration_ms: 184,
  },
  customer: {
    name: 'Jane Doe',
    verified: true,
    email: 'jane@example.com',
    limits: {
      daily: 5000,
      monthly: 25000,
    },
  },
  transfer: {
    amount: 1250.75,
    currency: 'USD',
    destination: 'HT',
    tags: ['priority', 'mobile'],
  },
  meta: {
    environment: 'sandbox',
    attempts: 1,
    error: null,
  },
};

type DemoConfig = {
  theme: 'light' | 'dark';
  defaultMode: 'tree' | 'text';
  editable: boolean;
  showLineNumbers: boolean;
  maxDepth: number;
  showDefaultRibbonActions: boolean;
  showCustomRibbonActions: boolean;
  hideActionText: boolean;
  hideHeader: boolean;
  hideFooter: boolean;
  hideModeSwitcher: boolean;
  hideTreeControls: boolean;
  hideEditControls: boolean;
  hideSearchButton: boolean;
  hideCopyButton: boolean;
  hideDownloadButton: boolean;
  hideThemeButton: boolean;
  hideFormatButton: boolean;
};

const DEFAULT_CONFIG: DemoConfig = {
  theme: 'light',
  defaultMode: 'tree',
  editable: true,
  showLineNumbers: true,
  maxDepth: 4,
  showDefaultRibbonActions: true,
  showCustomRibbonActions: true,
  hideActionText: false,
  hideHeader: false,
  hideFooter: false,
  hideModeSwitcher: false,
  hideTreeControls: false,
  hideEditControls: false,
  hideSearchButton: false,
  hideCopyButton: false,
  hideDownloadButton: false,
  hideThemeButton: false,
  hideFormatButton: false,
};

function Toggle({ value, onChange, label }: { value: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <div className="control-row">
      <span className="control-label">{label}</span>
      <button
        type="button"
        className={`switch ${value ? 'on' : ''}`}
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
      />
    </div>
  );
}

function Demo() {
  const [config, setConfig] = useState<DemoConfig>(DEFAULT_CONFIG);
  const [data, setData] = useState<JsonValue>(INITIAL_DATA);
  const [copied, setCopied] = useState(false);

  const patch = <K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) => {
    setConfig(current => ({ ...current, [key]: value }));
  };

  const ribbonActions = useMemo<JsonRibbonItem[]>(() => {
    if (!config.showCustomRibbonActions) return [];
    return [
      {
        id: 'inspect-tools',
        label: 'Inspect tools',
        actions: [
          {
            id: 'inspect',
            label: 'Inspect node',
            icon: <SearchIcon />,
            onClick: node => console.log('Inspect node', node),
          },
          {
            id: 'log-path',
            label: 'Log path',
            icon: <PathIcon />,
            onClick: node => console.log('JSON path', node.path),
          },
        ],
      },
    ];
  }, [config.showCustomRibbonActions]);

  const jsxPreview = useMemo(() => {
    const props: string[] = [
      'data={data}',
      'onChange={setData}',
      `theme="${config.theme}"`,
      `defaultMode="${config.defaultMode}"`,
    ];

    if (!config.editable) props.push('editable={false}');
    if (config.showLineNumbers) props.push('showLineNumbers');
    if (config.maxDepth !== 3) props.push(`maxDepth={${config.maxDepth}}`);
    if (!config.showDefaultRibbonActions) props.push('showDefaultRibbonActions={false}');
    if (config.showCustomRibbonActions) props.push('ribbonActions={ribbonActions}');
    if (config.hideActionText) props.push('hideActionText');
    if (config.hideHeader) props.push('hideHeader');
    if (config.hideFooter) props.push('hideFooter');
    if (config.hideModeSwitcher) props.push('hideModeSwitcher');
    if (config.hideTreeControls) props.push('hideTreeControls');
    if (config.hideEditControls) props.push('hideEditControls');
    if (config.hideSearchButton) props.push('hideSearchButton');
    if (config.hideCopyButton) props.push('hideCopyButton');
    if (config.hideDownloadButton) props.push('hideDownloadButton');
    if (config.hideThemeButton) props.push('hideThemeButton');
    if (config.hideFormatButton) props.push('hideFormatButton');

    return `<JsonViewer\n  ${props.join('\n  ')}\n/>`;
  }, [config]);

  const copyExample = async () => {
    await navigator.clipboard.writeText(jsxPreview);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="playground-shell">
      <header className="playground-topbar">
        <div className="playground-brand">
          <span className="playground-logo">{'{}'}</span>
          <span>React JSON Workbench</span>
        </div>
        <span className="playground-topbar-copy">Interactive prop playground</span>
      </header>

      <div className="playground-layout">
        <aside className="playground-controls">
          <div className="playground-controls-header">
            <h1>Playground</h1>
            <p>Change component props and see the result immediately.</p>
          </div>

          <section className="control-section">
            <h2 className="control-section-title">Appearance</h2>
            <div className="segmented" aria-label="Theme">
              <button className={config.theme === 'light' ? 'active' : ''} onClick={() => patch('theme', 'light')}>Light</button>
              <button className={config.theme === 'dark' ? 'active' : ''} onClick={() => patch('theme', 'dark')}>Dark</button>
            </div>
            <div style={{ height: 9 }} />
            <div className="segmented" aria-label="Initial mode">
              <button className={config.defaultMode === 'tree' ? 'active' : ''} onClick={() => patch('defaultMode', 'tree')}>Tree</button>
              <button className={config.defaultMode === 'text' ? 'active' : ''} onClick={() => patch('defaultMode', 'text')}>Text</button>
            </div>
            <div style={{ height: 9 }} />
            <Toggle label="Line numbers" value={config.showLineNumbers} onChange={value => patch('showLineNumbers', value)} />
            <Toggle label="Compact action buttons" value={config.hideActionText} onChange={value => patch('hideActionText', value)} />
            <div className="control-row">
              <span className="control-label">Max depth</span>
              <input
                className="number-field"
                type="number"
                min={1}
                max={12}
                value={config.maxDepth}
                onChange={event => patch('maxDepth', Math.max(1, Math.min(12, Number(event.target.value) || 1)))}
              />
            </div>
          </section>

          <section className="control-section">
            <h2 className="control-section-title">Editing & ribbon</h2>
            <Toggle label="Editable" value={config.editable} onChange={value => patch('editable', value)} />
            <Toggle label="Default ribbon actions" value={config.showDefaultRibbonActions} onChange={value => patch('showDefaultRibbonActions', value)} />
            <Toggle label="Custom ribbon group" value={config.showCustomRibbonActions} onChange={value => patch('showCustomRibbonActions', value)} />
          </section>

          <section className="control-section">
            <h2 className="control-section-title">Chrome</h2>
            <Toggle label="Hide header" value={config.hideHeader} onChange={value => patch('hideHeader', value)} />
            <Toggle label="Hide footer" value={config.hideFooter} onChange={value => patch('hideFooter', value)} />
            <Toggle label="Hide mode switcher" value={config.hideModeSwitcher} onChange={value => patch('hideModeSwitcher', value)} />
            <Toggle label="Hide tree controls" value={config.hideTreeControls} onChange={value => patch('hideTreeControls', value)} />
            <Toggle label="Hide edit controls" value={config.hideEditControls} onChange={value => patch('hideEditControls', value)} />
          </section>

          <section className="control-section">
            <h2 className="control-section-title">Toolbar actions</h2>
            <Toggle label="Hide search" value={config.hideSearchButton} onChange={value => patch('hideSearchButton', value)} />
            <Toggle label="Hide copy" value={config.hideCopyButton} onChange={value => patch('hideCopyButton', value)} />
            <Toggle label="Hide download" value={config.hideDownloadButton} onChange={value => patch('hideDownloadButton', value)} />
            <Toggle label="Hide theme" value={config.hideThemeButton} onChange={value => patch('hideThemeButton', value)} />
            <Toggle label="Hide format" value={config.hideFormatButton} onChange={value => patch('hideFormatButton', value)} />
          </section>

          <section className="control-section">
            <h2 className="control-section-title">Demo data</h2>
            <div className="control-actions">
              <button className="subtle-button" onClick={() => setData(INITIAL_DATA)}>Reset data</button>
              <button className="subtle-button" onClick={() => setConfig(DEFAULT_CONFIG)}>Reset props</button>
            </div>
          </section>
        </aside>

        <main className="playground-main">
          <div className="preview-heading">
            <div>
              <h2>Preview</h2>
              <p>Hover rows to test ribbon actions. Toggle Edit and switch to Text to test CodeMirror.</p>
            </div>
          </div>

          <div className={`preview-card ${config.theme === 'dark' ? 'dark-canvas' : ''}`}>
            <JsonViewer
              key={config.defaultMode}
              data={data}
              onChange={setData}
              editable={config.editable}
              theme={config.theme}
              defaultMode={config.defaultMode}
              showLineNumbers={config.showLineNumbers}
              maxDepth={config.maxDepth}
              hideActionText={config.hideActionText}
              hideHeader={config.hideHeader}
              hideFooter={config.hideFooter}
              hideModeSwitcher={config.hideModeSwitcher}
              hideTreeControls={config.hideTreeControls}
              hideEditControls={config.hideEditControls}
              hideSearchButton={config.hideSearchButton}
              hideCopyButton={config.hideCopyButton}
              hideDownloadButton={config.hideDownloadButton}
              hideThemeButton={config.hideThemeButton}
              hideFormatButton={config.hideFormatButton}
              showDefaultRibbonActions={config.showDefaultRibbonActions}
              ribbonActions={ribbonActions}
              onThemeChange={theme => patch('theme', theme)}
            />
          </div>

          <section className="code-panel">
            <div className="code-panel-header">
              <span>Generated props</span>
              <button className="subtle-button" onClick={copyExample}>{copied ? 'Copied' : 'Copy JSX'}</button>
            </div>
            <pre><code>{jsxPreview}</code></pre>
          </section>
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Demo />
  </StrictMode>,
);
