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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <GraduationCap size={32} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CampusConnect</h1>
          <p className="text-gray-600 text-sm">Sign up to connect with alumni and students</p>
        </motion.div>

        {/* Signup Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-300 rounded-lg p-8"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700 text-sm"
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <input 
              name="name" 
              placeholder="Full name"
              value={form.name} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            />
            
            <input 
              name="email" 
              type="email"
              placeholder="Email"
              value={form.email} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            />
            
            <input 
              name="password"
              type="password"
              placeholder="Password"
              value={form.password} 
              onChange={handleChange}
              disabled={isLoading}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <input 
                name="department" 
                placeholder="Department"
                value={form.department} 
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
              
              <input 
                name="batch" 
                placeholder="Batch year"
                value={form.batch} 
                onChange={handleChange}
                disabled={isLoading}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
              />
            </div>
            
            <select 
              name="role" 
              value={form.role} 
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
          
          <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
            By signing up, you agree to our Terms, Data Policy and Cookies Policy.
          </p>
        </motion.div>

        {/* Login link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-300 rounded-lg p-6 text-center"
        >
          <p className="text-sm text-gray-600">
            Have an account?{' '}
            <Link to="/login" className="text-blue-500 font-semibold hover:text-blue-600 transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
