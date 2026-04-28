import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('NO_KEY');
  process.exit(1);
}

const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
  headers: {
    'x-goog-api-key': key,
  },
});
console.log('STATUS', res.status);
console.log(await res.text());
