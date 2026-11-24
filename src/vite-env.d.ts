/**
 * vite-env.d.ts
 * Vite client environment declarations.
 * 
 * Provides types for import.meta.env and static asset imports without requiring
 * external node_modules to be present for IDE code inspection.
 */

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly BASE_URL?: string;
  readonly MODE?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.css' {
  const css: string;
  export default css;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
