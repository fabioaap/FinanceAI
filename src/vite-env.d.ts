/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_PROVIDER?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SYNC_ENABLED?: string;
  readonly VITE_SYNC_ENDPOINT?: string;
  readonly VITE_SYNC_INTERVAL?: string;
  readonly VITE_SYNC_CONFLICT_STRATEGY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
