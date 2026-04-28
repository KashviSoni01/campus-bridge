import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="967885781335-dna0rsogcigc2vjggbrji65auj4cnb89.apps.googleusercontent.com">
    <App />
  </GoogleOAuthProvider>
)
