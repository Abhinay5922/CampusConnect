import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import NewExperience from './pages/NewExperience'
import Chat from './pages/Chat'
import Navbar from './components/Navbar'
import Messenger from './components/Messenger'
import { UserCacheProvider } from './contexts/UserCacheContext'

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
}

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const location = useLocation()

  // Check authentication status on mount and route changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    }

    checkAuth()
  }, [location.pathname])

  // Listen for storage changes (for multi-tab support)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
          setIsAuthenticated(true)
          setUser(JSON.parse(userData))
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Function to update auth state (can be passed to Login/Signup)
  const updateAuthState = (token, userData) => {
    if (token && userData) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(userData))
      setIsAuthenticated(true)
      setUser(userData)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  return (
    <UserCacheProvider>
      <div className="app-container">
        <Navbar user={user} onLogout={() => updateAuthState(null, null)} />
        
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route 
              path="/login" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Login onLogin={updateAuthState} />
                </motion.div>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <motion.div
                  initial="initial"
                  animate="in"
                  exit="out"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Signup onSignup={updateAuthState} />
                </motion.div>
              } 
            />
            <Route 
              path="/feed" 
              element={
                isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Feed />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/new" 
              element={
                isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <NewExperience />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/chat/:otherId" 
              element={
                isAuthenticated ? (
                  <motion.div
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <Chat />
                  </motion.div>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route path="/" element={<Navigate to="/feed" replace />} />
          </Routes>
        </AnimatePresence>
        
        {/* Floating Messenger - Available on all pages when logged in */}
        {isAuthenticated && <Messenger />}
      </div>
    </UserCacheProvider>
  )
}

export default App
