import type { JsonNodeType, JsonRibbonAction, JsonRibbonActionGroup, JsonRibbonItem } from '../types';

interface RibbonProps {
  node: JsonNodeType;
  items?: JsonRibbonItem[];
  defaultGroups?: JsonRibbonActionGroup[];
  className: string;
}

function isGroup(item: JsonRibbonItem): item is JsonRibbonActionGroup {
  return 'actions' in item;
}

function visibleActions(actions: JsonRibbonAction[], node: JsonNodeType) {
  return actions.filter(action => action.visible?.(node) ?? true);
}

export default function Ribbon({ node, items = [], defaultGroups = [], className }: RibbonProps) {
  const groups: JsonRibbonActionGroup[] = [];
  let loose: JsonRibbonAction[] = [];
  let looseIndex = 0;

  const flushLoose = () => {
    const visible = visibleActions(loose, node);
    if (visible.length) groups.push({ id: `custom-${looseIndex++}`, actions: visible });
    loose = [];
  };

  for (const item of items) {
    if (isGroup(item)) {
      flushLoose();
      const actions = visibleActions(item.actions, node);
      if (actions.length) groups.push({ ...item, actions });
    } else {
      loose.push(item);
    }
  }
  flushLoose();

  for (const group of defaultGroups) {
    const actions = visibleActions(group.actions, node);
    if (actions.length) groups.push({ ...group, actions });
  }

  if (!groups.length) return null;

  return <span
    className={className}
    onMouseDown={event => event.preventDefault()}
    onClick={event => event.stopPropagation()}
  >
    {groups.map(group => <span
      key={group.id}
      className={`rjv-ribbon-group ${group.className ?? ''}`.trim()}
      aria-label={group.label}
    >
      {group.actions.map(action => {
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
    </span>)}
  </span>;
}
