import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, User, Mail, Lock, Building2, Calendar, AlertCircle, Loader2 } from 'lucide-react'
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container flex items-center justify-center min-h-[calc(100vh-100px)] py-8"
    >
      <div className="glass-card w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create Account</h2>
          <p className="text-text-secondary">Join the CampusConnect community today</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input 
                  id="name"
                  name="name" 
                  className="pl-10" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input 
                  id="email"
                  name="email" 
                  type="email"
                  className="pl-10" 
                  placeholder="your.email@example.com" 
                  value={form.email} 
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-2">I am a...</label>
              <div className="relative">
                <select 
                  id="role"
                  name="role" 
                  className="pl-4" 
                  value={form.role} 
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-text-secondary mb-2">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input 
                  id="department"
                  name="department" 
                  className="pl-10" 
                  placeholder="Computer Science" 
                  value={form.department} 
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-text-secondary mb-2">Batch Year</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                <input 
                  id="batch"
                  name="batch" 
                  className="pl-10" 
                  placeholder="2024" 
                  value={form.batch} 
                  onChange={handleChange}
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
                  name="password"
                  className="pl-10" 
                  placeholder="••••••••" 
                  type="password" 
                  value={form.password} 
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary w-full py-3 text-lg mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
        </div>
      </div>
    </motion.div>
  )
}
