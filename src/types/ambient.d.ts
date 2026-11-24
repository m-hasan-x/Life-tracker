/**
 * ambient.d.ts
 * Comprehensive ambient declarations for React, ReactDOM, Lucide Icons, and JSX.
 * 
 * Why this file exists:
 * When node_modules is removed to keep a GitHub repository clean, IDEs like IntelliJ IDEA,
 * WebStorm, and VS Code require namespace, module, and JSX declarations to accurately parse
 * React imports, component type signatures (React.FC, React.PropsWithChildren), form events,
 * and icons without displaying red underlines or inspection warnings.
 */

// 1. Global React Namespace (supports React.FC, React.ChangeEvent, React.PropsWithChildren, etc.)
declare namespace React {
  export type ReactNode =
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | Iterable<ReactNode>;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: string | null;
  }

  export type JSXElementConstructor<P> = (props: P) => ReactElement<any, any> | null;

  export interface CSSProperties {
    [key: string]: any;
  }

  export type FC<P = {}> = (props: P) => ReactElement<any, any> | null;
  export type FunctionComponent<P = {}> = FC<P>;

  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };

  export interface ChangeEvent<T = Element> {
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
    currentTarget: EventTarget & T;
  }

  export interface Dispatch<A> {
    (value: A): void;
  }
  export type SetStateAction<S> = S | ((prevState: S) => S);

  export interface RefObject<T> {
    readonly current: T | null;
  }
  export interface MutableRefObject<T> {
    current: T;
  }

  export function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useState<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>];

  export function useEffect(effect: () => void | (() => void | undefined), deps?: readonly any[]): void;
  export function useLayoutEffect(effect: () => void | (() => void | undefined), deps?: readonly any[]): void;

  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export function useMemo<T>(factory: () => T, deps: readonly any[] | undefined): T;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;

  export interface Context<T> {
    Provider: FC<{ value: T; children?: ReactNode }>;
    Consumer: FC<{ children: (value: T) => ReactNode }>;
    displayName?: string;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;

  export const StrictMode: FC<{ children?: ReactNode }>;
  export const createElement: any;
  export const cloneElement: any;
}

// 2. React Module Declarations (supports import React, { useState } from 'react')
declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// 3. Ambient ReactDOM Declarations
declare module 'react-dom/client' {
  import { ReactNode } from 'react';

  export interface Root {
    render(children: ReactNode): void;
    unmount(): void;
  }

  export function createRoot(container: Element | DocumentFragment): Root;

  const ReactDOM: {
    createRoot: typeof createRoot;
  };
  export default ReactDOM;
}

declare module 'react-dom' {
  const ReactDOM: any;
  export default ReactDOM;
}

// 4. Ambient Lucide React Icon Declarations (all 74 icons utilized across project)
declare module 'lucide-react' {
  import { FC, CSSProperties } from 'react';

  export interface LucideProps {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
    className?: string;
    style?: CSSProperties;
    [key: string]: any;
  }

  export type LucideIcon = FC<LucideProps>;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const ArrowLeftRight: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const ArrowRightLeft: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const Award: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const BookOpen: LucideIcon;
  export const Bookmark: LucideIcon;
  export const BookmarkCheck: LucideIcon;
  export const Brain: LucideIcon;
  export const Building2: LucideIcon;
  export const Calendar: LucideIcon;
  export const Camera: LucideIcon;
  export const Check: LucideIcon;
  export const CheckCheck: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const Clock: LucideIcon;
  export const Coins: LucideIcon;
  export const CreditCard: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Download: LucideIcon;
  export const Edit3: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileText: LucideIcon;
  export const Film: LucideIcon;
  export const Filter: LucideIcon;
  export const Flag: LucideIcon;
  export const Flame: LucideIcon;
  export const Heart: LucideIcon;
  export const KeyRound: LucideIcon;
  export const Languages: LucideIcon;
  export const Layers: LucideIcon;
  export const Leaf: LucideIcon;
  export const Lightbulb: LucideIcon;
  export const LockKeyhole: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Mic: LucideIcon;
  export const Paperclip: LucideIcon;
  export const Pause: LucideIcon;
  export const Play: LucideIcon;
  export const Plus: LucideIcon;
  export const PlusCircle: LucideIcon;
  export const Receipt: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Search: LucideIcon;
  export const Settings2: LucideIcon;
  export const Share2: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Square: LucideIcon;
  export const Star: LucideIcon;
  export const Tag: LucideIcon;
  export const Target: LucideIcon;
  export const Timer: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const Video: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Wallet: LucideIcon;
  export const Wind: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;

  const icons: { [key: string]: LucideIcon };
  export default icons;
}

// 5. Global JSX Namespace (enables JSX element type recognition in IDE)
declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: {};
    }
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
