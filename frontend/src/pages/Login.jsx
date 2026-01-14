import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import API from '../utils/api'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      const res = await API.post('/auth/login', { email, password })
      
      // Validate response
      if (!res.data.token || !res.data.user) {
        throw new Error('Invalid response from server')
      }

      // Update auth state via callback
      onLogin(res.data.token, res.data.user)
      
      // Navigate to feed
      navigate('/feed', { replace: true })
      
    } catch (err) {
      const status = err.response?.status
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please try again.'
      
      if (status >= 400 && status < 500) {
        console.warn(`Login validation error (${status}):`, errorMessage)
      } else {
        console.error('Login error:', err)
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container flex items-center justify-center min-h-[calc(100vh-100px)]"
    >
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Welcome Back</h2>
          <p className="text-text-secondary">Login to your CampusConnect account</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2 text-sm border border-red-100"
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
              <input 
                id="email"
                type="email"
                className="pl-10" 
                placeholder="your.email@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
              <input 
                id="password"
                className="pl-10" 
                placeholder="••••••••" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary w-full py-3 text-lg"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Login'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account? <Link to="/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
        </div>
      </div>
    </motion.div>
  )
}
