import { createApp } from "./app.js";

export const config = { maxDuration: 30 };

/** Bundled to api/index.js for Vercel serverless. */
export default createApp();
