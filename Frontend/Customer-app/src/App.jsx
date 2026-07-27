import { useState, useMemo, useEffect } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme'
import HomePage from './HomePage/Homepage'
import LoginPage from './Auth/LoginPage'
import SignupPage from './Auth/SignupPage'
import './App.css'

function App() {
  const [themeMode, setThemeMode] = useState('light')
  const [view, setView] = useState('home') // 'home' | 'login' | 'signup'
  const [currentUser, setCurrentUser] = useState(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('localmart_current_user')
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user', e)
      }
    }
  }, [])

  const theme = useMemo(() => getTheme(themeMode), [themeMode])

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const handleLoginSuccess = (user) => {
    setCurrentUser(user)
    localStorage.setItem('localmart_current_user', JSON.stringify(user))
    setView('home')
  };

  const handleSignupSuccess = (user) => {
    setCurrentUser(user)
    localStorage.setItem('localmart_current_user', JSON.stringify(user))
    setView('home')
  };

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('localmart_current_user')
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {view === 'home' && (
        <HomePage
          themeMode={themeMode}
          onToggleTheme={toggleTheme}
          currentUser={currentUser}
          onLogout={handleLogout}
          onNavigate={setView}
        />
      )}
      {view === 'login' && (
        <LoginPage
          themeMode={themeMode}
          onLoginSuccess={handleLoginSuccess}
          onNavigateToSignup={() => setView('signup')}
          onBackToHome={() => setView('home')}
        />
      )}
      {view === 'signup' && (
        <SignupPage
          themeMode={themeMode}
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={() => setView('login')}
          onBackToHome={() => setView('home')}
        />
      )}
    </ThemeProvider>
  )
}

export default App
