/// <reference types="@cloudflare/workers-types" />

declare module '@cloudflare/next-on-pages' {
    interface CloudflareEnv {
        DB: D1Database;
        R2_ACCOUNT_ID?: string;
        R2_ACCESS_KEY_ID?: string;
        R2_SECRET_ACCESS_KEY?: string;
        R2_BUCKET_NAME?: string;
        R2_PUBLIC_URL?: string;
    }
}
