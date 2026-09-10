import type { SVGProps } from 'react';
const Icon = ({ children, ...props }: SVGProps<SVGSVGElement>) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>;
export const ChevronRightIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m9 18 6-6-6-6" /></Icon>;
export const ChevronDownIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>;
export const TreeIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M6 3v12m0-8h6m-6 6h6m0-6v4m0 2v4m0-8h6m-6 6h6" /><circle cx="18" cy="7" r="1" /><circle cx="18" cy="15" r="1" /><circle cx="6" cy="18" r="1" /></Icon>;
export const CodeIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m8 9-3 3 3 3m8-6 3 3-3 3m-5 3 2-12" /></Icon>;
export const ExpandIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5" /></Icon>;
export const CollapseIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M8 8H3V3m13 5h5V3M8 16H3v5m13-5h5v5" /></Icon>;
export const EditIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></Icon>;
export const SaveIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M5 3h12l2 2v16H5z" /><path d="M8 3v6h8V3M8 21v-7h8v7" /></Icon>;
export const CancelIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m6 6 12 12M18 6 6 18" /></Icon>;
export const CopyIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3" /></Icon>;
export const DownloadIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M12 3v12m-4-4 4 4 4-4M5 21h14" /></Icon>;
export const SearchIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
export const MoonIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Icon>;
export const SunIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></Icon>;
export const PlusIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>;
export const TrashIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M4 7h16m-10 4v6m4-6v6M9 7l1-3h4l1 3m-9 0 1 14h10l1-14" /></Icon>;
export const CheckIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="m5 12 4 4L19 6" /></Icon>;

export const JsonIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><path d="M9 3H7a2 2 0 0 0-2 2v4c0 1.7-.7 3-2 3 1.3 0 2 1.3 2 3v4a2 2 0 0 0 2 2h2M15 3h2a2 2 0 0 1 2 2v4c0 1.7.7 3 2 3-1.3 0-2 1.3-2 3v4a2 2 0 0 1-2 2h-2" /></Icon>;

export const PathIcon = (p: SVGProps<SVGSVGElement>) => <Icon {...p}><circle cx="6" cy="6" r="2" /><circle cx="18" cy="18" r="2" /><path d="M8 6h3a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3" /></Icon>;
