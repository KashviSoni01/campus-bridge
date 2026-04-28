import http from 'node:http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/chat',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  res.on('end', () => {
    console.log('\nDONE');
  });
});

req.on('error', (e) => {
  console.error('ERROR', e.message);
});
req.end();
