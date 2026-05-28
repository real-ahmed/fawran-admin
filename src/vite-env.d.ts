/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RECAPTCHA_ENABLED?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_RECAPTCHA_ACTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
