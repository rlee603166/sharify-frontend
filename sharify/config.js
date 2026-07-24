// Central API configuration.
//
// The server host can be overridden with the EXPO_PUBLIC_API_HOST env var —
// add a line like this to sharify/.env (or `export` it in your shell before
// running `expo start`):
//
//     EXPO_PUBLIC_API_HOST=47.144.165.155
//
// If it isn't set, the default below is used. Change servers by editing the
// .env value (or this default) — nothing else references the raw IP anymore.
const API_HOST = process.env.EXPO_PUBLIC_API_HOST || "47.144.165.155";

export const API_BASE_URL = `http://${API_HOST}:8000/api/v1`;
