import fetch from 'node-fetch';

// Get a valid user ID - we'll use the one from database
const testUserId = '69efb4f299b268b8ca2bb1d5'; // This was working before

try {
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message: 'what opportunities are available for me', 
      userId: testUserId 
    })
  });
  
  const text = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', text);
  
  try {
    const json = JSON.parse(text);
    console.log('Parsed JSON:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.log('Could not parse as JSON');
  }
} catch (err) {
  console.error('ERROR:', err.message);
}
