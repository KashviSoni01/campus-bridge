import fetch from 'node-fetch';

const res = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'test', userId: '000000000000000000000000' }),
});

console.log(res.status);
console.log(await res.text());
