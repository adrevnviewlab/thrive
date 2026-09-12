/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_SANDBOX: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  /** When true, production builds still offer demo mode. */
  readonly VITE_ALLOW_DEMO: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
