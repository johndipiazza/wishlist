import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './assets/firebase'
import AuthPage from './components/AuthPage'
import MainApp from './components/MainApp'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  if (loading) {
    return null // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setIsAuthenticated(true)} />
  }

  // authenticated interface is handled by MainApp
  return <MainApp onLogout={() => setIsAuthenticated(false)} />
}

export default App
