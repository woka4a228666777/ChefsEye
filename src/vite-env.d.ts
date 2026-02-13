/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HUGGING_FACE_TOKEN: string
  readonly VITE_GOOGLE_VISION_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}