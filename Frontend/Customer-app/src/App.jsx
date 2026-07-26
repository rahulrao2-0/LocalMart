import { useState, useMemo } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { getTheme } from './theme'
import HomePage from './HomePage/Homepage'
import './App.css'

function App() {
  const [themeMode, setThemeMode] = useState('light')

  const theme = useMemo(() => getTheme(themeMode), [themeMode])

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage themeMode={themeMode} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  )
}

export default App
