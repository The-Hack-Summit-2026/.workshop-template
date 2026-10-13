const http = require('node:http');

const server = http.createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (request.method !== 'GET') {
    response.writeHead(405, { Allow: 'GET' });
    response.end();
    return;
  }

  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.url === '/config') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({
      providerTokenConfigured: Boolean(process.env.GH_PROVIDER_TOKEN),
      passwordConfigured: Boolean(process.env.DATABASE_PASSWORD),
      customTokenConfigured: Boolean(process.env.INTERNAL_SERVICE_TOKEN),
    }));
    return;
  }

  if (request.url === '/') {
    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(
      'Secret Protection workshop\n\n' +
      'GET /health: application health\n' +
      'GET /config: configuration presence only (not validity)\n\n' +
      'This demo never calls a provider or displays secret values.\n'
    );
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end('Not found\n');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Workshop demo listening on http://127.0.0.1:3000');
});
