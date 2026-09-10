import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactJsonWorkbench from './components/ReactJsonWorkbench';
import type { JsonValue } from './types';
import { SearchIcon } from './components/icons';

function Demo() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [data, setData] = useState<JsonValue>({ name: 'John Doe', age: 30, active: true, hobbies: ['reading', 'coding'], address: { street: '123 Main St', city: 'Anytown' }, meta: null });
  return <main style={{ maxWidth: 1000, margin: '48px auto', padding: '0 20px' }}>
    <h1 style={{ fontFamily: 'system-ui' }}>React JSON Workbench</h1>
    <ReactJsonWorkbench data={data} onChange={setData} theme={theme} onThemeChange={setTheme} showLineNumbers

      ribbonActions={[
        {
          id: 'inspect',
          label: 'Inspect value',
          icon: <SearchIcon />,
          onClick: (node) => console.log(node.path, node.value),
        },
        // {
        //   id: 'open',
        //   label: 'Open related resource',
        //   icon: <ExternalLink size={16} />,
        //   visible: (node) => node.key === 'tenant_domain',
        //   onClick: (node) => window.open(`https://${node.value}`, '_blank'),
        // },
      ]}
    />
  </main>
}

createRoot(document.getElementById('root')!).render(<StrictMode>
  <Demo />
</StrictMode>);
