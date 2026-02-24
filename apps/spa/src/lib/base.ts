/** Returns the router basename derived from Vite's BASE_URL (no trailing slash). */
export const routerBase = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
