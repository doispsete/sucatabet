const http = require('http');

const routes = [
  '/auth/me',
  '/dashboard/summary',
  '/operations',
  '/accounts',
  '/houses',
  '/cpf-profiles'
];

async function testRoute(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3006,
      path: path,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`ROUTE: ${path} | STATUS: ${res.statusCode}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`ERRO ${path}: ${e.message}`);
      resolve();
    });
    req.end();
  });
}

async function run() {
  for (const route of routes) {
    await testRoute(route);
  }
}

run();
