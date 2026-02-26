import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import {app as firebaseApp} from './assets/firebase';

declare global {
  interface Window {
    firebaseApp: typeof firebaseApp
  }
}

window.firebaseApp = firebaseApp  // Expose the Firebase app instance for debugging purposes

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Failed to find the root element')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
