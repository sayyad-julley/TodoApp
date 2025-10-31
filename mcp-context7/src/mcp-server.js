import http from 'node:http';
import https from 'node:https';
import AWSXRay from 'aws-xray-sdk-core';

// Enable outbound HTTP/S capture for X-Ray
AWSXRay.captureHTTPsGlobal(http);
AWSXRay.captureHTTPsGlobal(https);

// Minimal MCP-like JSON-RPC over HTTP (stub) to be expanded later.
// This does NOT implement the full MCP spec; it is a scaffold for future needs.

function handleRpc(method, params) {
  if (method === 'context7.ping') {
    return { ok: true, message: 'pong', timestamp: new Date().toISOString() };
  }
  if (method === 'context7.search') {
    return { ok: false, error: 'NotImplemented', message: 'Search is not implemented yet.' };
  }
  return { ok: false, error: 'MethodNotFound', message: `Unknown method: ${method}` };
}

export async function startServer({ host, port }) {
  const server = http.createServer(async (req, res) => {
    if (req.method !== 'POST' || req.url !== '/rpc') {
      res.statusCode = 404;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ error: 'Not Found' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { id, method, params } = payload;
        const result = handleRpc(method, params);
        res.statusCode = 200;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ jsonrpc: '2.0', id: id ?? null, result }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ error: 'Bad Request', message: err.message }));
      }
    });
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      console.log(`Context7 MCP server listening on http://${host}:${port}`);
      resolve();
    });
  });

  return server;
}


