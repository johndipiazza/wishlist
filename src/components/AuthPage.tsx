import { useState } from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material'

interface AuthPageProps {
  onAuthSuccess: () => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    console.log(email, username, password, confirmPassword);
    

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Basic validation
    if (!email || !password || (!isLogin && !username)) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email')
      setLoading(false)
      return
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setLoading(false)
        return
      }
    }

    // Simulate successful authentication
    setLoading(false)
    onAuthSuccess()
  }

  const handleToggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setEmail('')
    setUsername('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        py: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isLogin ? 'Welcome back' : 'Join us today'}
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {!isLogin && (
              <TextField
                fullWidth
                label="Username"
                type="text"
                placeholder="choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                variant="outlined"
              />
            )}
            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />

            {!isLogin && (
              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                variant="outlined"
              />
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              disabled={loading}
              sx={{
                mt: 1,
                position: 'relative',
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ position: 'absolute' }} />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link
                component="button"
                variant="body2"
                onClick={(e) => {
                  e.preventDefault()
                  handleToggleMode()
                }}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}
