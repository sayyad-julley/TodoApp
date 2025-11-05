import http from 'node:http';
import https from 'node:https';
import AWSXRay from 'aws-xray-sdk-core';

// Enable outbound HTTP/S capture for X-Ray
AWSXRay.captureHTTPsGlobal(http);
AWSXRay.captureHTTPsGlobal(https);

// Minimal MCP-like JSON-RPC over HTTP (stub) to be expanded later.
// This does NOT implement the full MCP spec; it is a scaffold for future needs.

/**
 * Fetch documentation from backstage.io
 * @param {string} query - Search query
 * @param {string} docPath - Specific documentation path (optional)
 * @returns {Promise<Object>} Documentation content
 */
async function fetchBackstageDocs(query, docPath = null, params = null) {
  return new Promise((resolve, reject) => {
    const baseUrl = 'https://backstage.io';
    let url;
    
    // If docPath is a full URL, use it directly
    if (docPath && docPath.startsWith('http')) {
      url = docPath;
    } else if (docPath) {
      // Fetch specific documentation page
      url = `${baseUrl}${docPath.startsWith('/') ? docPath : `/${docPath}`}`;
    } else if (query) {
      // Search for documentation
      // Use the docs API endpoint or search
      url = `${baseUrl}/docs/search?q=${encodeURIComponent(query)}`;
    } else {
      // Default to main docs page
      url = `${baseUrl}/docs`;
    }

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Context7-MCP-Server/1.0',
        'Accept': 'text/html,application/json',
      },
    };

    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        // Handle redirects (limit to 5 redirects to prevent infinite loops)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && (!params || !params._redirectCount || params._redirectCount < 5)) {
          const redirectUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : `${urlObj.protocol}//${urlObj.hostname}${res.headers.location}`;
          // Recursively follow redirect with count
          const redirectParams = { ...(params || {}), _redirectCount: ((params && params._redirectCount) || 0) + 1 };
          return fetchBackstageDocs(query, redirectUrl, redirectParams).then(resolve).catch(reject);
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            url,
            statusCode: res.statusCode,
            content: data,
            contentType: res.headers['content-type'],
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

/**
 * Handle search requests for backstage.io documentation
 */
async function handleSearch(params) {
  const { query, docPath } = params || {};
  
  try {
    const result = await fetchBackstageDocs(query, docPath, params);
    return {
      ok: true,
      query: query || 'general',
      docPath: docPath || null,
      url: result.url,
      content: result.content.substring(0, 50000), // Limit response size
      contentType: result.contentType,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}

async function handleRpc(method, params) {
  if (method === 'context7.ping') {
    return { ok: true, message: 'pong', timestamp: new Date().toISOString() };
  }
  if (method === 'context7.search') {
    return await handleSearch(params);
  }
  if (method === 'context7.getBackstageDocs') {
    return await handleSearch(params);
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
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { id, method, params } = payload;
        const result = await handleRpc(method, params);
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


