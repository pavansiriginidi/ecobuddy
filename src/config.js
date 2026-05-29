// Default to same-origin /api so Vercel deployments hit serverless API routes.
// In local dev, Vite proxies /api to http://localhost:3001 (see vite.config.mjs).
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
