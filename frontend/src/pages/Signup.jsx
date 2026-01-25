import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Loader2, GraduationCap } from 'lucide-react'
import API from '../utils/api'

export default function Signup({ onSignup }) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'student', 
    department: '', 
    batch: '' 
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!form.name || !form.email || !form.password || !form.department || !form.batch) {
      setError('Please fill in all fields')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const res = await API.post('/auth/register', form)
      
      // Validate response
      if (!res.data.token || !res.data.user) {
        throw new Error('Invalid response from server')
      }

      // Update auth state via callback
      onSignup(res.data.token, res.data.user)
      
      // Navigate to feed
      navigate('/feed', { replace: true })
      
    } catch (err) {
      const status = err.response?.status
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.'
      
      if (status >= 400 && status < 500) {
        console.warn(`Signup validation error (${status}):`, errorMessage)
      } else {
        console.error('Signup error:', err)
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
            CampusConnect
          </h1>
          <p className="text-gray-500 text-xs">Join the community</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs"
            >
              <AlertCircle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <input 
              name="name" 
              placeholder="Full name"
              value={form.name} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all placeholder-gray-400"
            />
            
            <input 
              name="email" 
              type="email"
              placeholder="Email"
              value={form.email} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all placeholder-gray-400"
            />
            
            <input 
              name="password"
              type="password"
              placeholder="Password (min 6 chars)"
              value={form.password} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all placeholder-gray-400"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <input 
                name="department" 
                placeholder="Department"
                value={form.department} 
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all placeholder-gray-400"
              />
              
              <input 
                name="batch" 
                placeholder="Batch year"
                value={form.batch} 
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all placeholder-gray-400"
              />
            </div>
            
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 focus:bg-white transition-all"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] mt-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>
          
          <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
            By signing up, you agree to our Terms & Privacy Policy.
          </p>
        </motion.div>

        {/* Login link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-lg border border-white/20 rounded-2xl p-4 text-center mt-4 shadow-lg"
        >
          <p className="text-xs text-gray-600">
            Have an account?{' '}
            <Link to="/login" className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
