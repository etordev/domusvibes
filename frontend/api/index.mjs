export default async function handler(req, res) {
  const server = await import('../dist/domusvibes-frontend/server/server.mjs');
  return server.reqHandler(req, res);
}
