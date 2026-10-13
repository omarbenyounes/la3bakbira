// Dev server only: forwards API calls to the gateway so the browser stays on one origin (no CORS).
// Override the target when the gateway runs elsewhere, e.g.  API_GATEWAY_URL=http://localhost:8090 npm start
export default {
  '/api': {
    target: process.env.API_GATEWAY_URL ?? 'http://localhost:8080',
    secure: false,
    changeOrigin: true,
  },
};
