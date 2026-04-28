import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('NO_KEY');
  process.exit(1);
}

const models = ['models/gemini-1.5-flash', 'models/gemini-1.5', 'models/gemini-1.0', 'models/text-bison-001', 'models/chat-bison-001'];

for (const name of models) {
  try {
    const ai = new GoogleGenerativeAI(key);
    const model = ai.getGenerativeModel({ model: name });
    const result = await model.generateContent('Hello');
    console.log('MODEL', name, 'OK', result?.response?.text?.slice(0, 60));
  } catch (err) {
    console.log('MODEL', name, 'ERR', err?.message || err);
  }
}
