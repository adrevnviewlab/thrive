/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLOVER_API_KEY: string
  readonly VITE_CLOVER_MERCHANT_ID: string
  readonly VITE_CLOVER_MERCHANT_NAME: string
  readonly VITE_CLOVER_WEBHOOK_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
