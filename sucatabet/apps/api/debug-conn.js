const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3006,
  path: '/operations',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

console.log('Testando conexão com o backend em http://localhost:3006/operations...');

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('RESPOSTA:');
    try {
      console.log(JSON.parse(data));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error(`ERRO: ${e.message}`);
});

req.end();
