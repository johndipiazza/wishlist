import { useState } from 'react'
import AuthPage from './components/AuthPage'
import MainApp from './components/MainApp'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Set to true for development; change to false for production testing

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
  }

  // authenticated interface is handled by MainApp
  return <MainApp onLogout={() => setIsAuthenticated(false)} />
}

export default App
