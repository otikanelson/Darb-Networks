// src/main.jsx - Updated to include Bootstrap CSS
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { initializeApp } from './services/AppInitializer.js'
import { CountryProvider } from './context/CountryContext.jsx'

initializeApp();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CountryProvider>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { maxWidth: '420px' },
          error: { duration: 5000 },
          success: { duration: 3000 },
        }}
      />
    </CountryProvider>
  </StrictMode>,
)
