const http = require('http');

const credentials = {
  email: 'admin@sucatabet.com',
  password: 'Admin@2024'
};

async function request(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3006,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log('--- Fazendo Login ---');
    const loginRes = await request('/auth/login', 'POST', credentials);
    if (loginRes.status !== 201 && loginRes.status !== 200) {
      console.error('Falha no login:', loginRes.status, loginRes.data);
      return;
    }
    const token = loginRes.data.access_token;
    console.log('Login OK. Token obtido.');

    const routes = ['/auth/me', '/dashboard/summary', '/operations', '/accounts', '/houses', '/cpf-profiles'];
    
    for (const route of routes) {
      console.log(`--- Testando Rota: ${route} ---`);
      const res = await request(route, 'GET', null, token);
      console.log(`STATUS: ${res.status}`);
      if (res.status === 500) {
        console.error('ERRO 500 DETECTADO!');
        console.error(res.data);
      }
    }

  } catch (e) {
    console.error('Erro no script:', e.message);
  }
}

run();
