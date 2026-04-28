import fetch from 'node-fetch';

try {
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'hi from test', userId: '69efb4f299b268b8ca2bb1d5' })
  });
  console.log('status', res.status);
  console.log(await res.text());
} catch (err) {
  console.error('ERROR', err);
}
