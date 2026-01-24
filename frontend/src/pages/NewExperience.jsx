import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Briefcase, FileText, MessageSquare, Lightbulb, ArrowLeft, Send, Loader2, Sparkles } from 'lucide-react'
import API from '../utils/api'

export default function NewExperience() {
  const [form, setForm] = useState({ 
    company: '', 
    role: '', 
    description: '', 
    interviewQuestions: '', 
    tips: '' 
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
    
    // Validation
    if (!form.company.trim() || !form.role.trim() || !form.description.trim()) {
      setError('Company, role, and description are required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const payload = { 
        ...form, 
        interviewQuestions: form.interviewQuestions
          .split('\n')
          .map(q => q.trim())
          .filter(Boolean) 
      }
      
      await API.post('/experiences', payload)
      navigate('/feed')
    } catch (err) {
      console.error('Failed to create experience:', err)
      setError(err.response?.data?.message || 'Failed to create experience. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container-lg py-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <button
          onClick={() => navigate('/feed')}
          className="btn btn-secondary mb-8 hover-lift"
        >
          <ArrowLeft size={18} />
          Back to Feed
        </button>
        
        <div className="content-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-full flex items-center justify-center mb-6 shadow-glow"
          >
            <Sparkles size={32} className="text-white" />
          </motion.div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Share Your Experience
          </h1>
          <p className="text-xl text-text-secondary max-w-3xl leading-relaxed">
            Help fellow students by sharing your interview experience, insights, and tips. 
            Your story could be the guidance someone needs for their next opportunity.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-8 hover-lift max-w-4xl mx-auto"
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="error-message mb-8"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company & Role */}
          <div className="form-grid-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="form-group"
            >
              <label htmlFor="company">
                <Building2 size={18} className="text-primary" />
                Company Name *
              </label>
              <input
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="e.g., Google, Microsoft, Amazon"
                required
                className="hover-lift"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="form-group"
            >
              <label htmlFor="role">
                <Briefcase size={18} className="text-primary" />
                Job Role *
              </label>
              <input
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                placeholder="e.g., Software Engineer, Data Analyst"
                required
                className="hover-lift"
              />
            </motion.div>
          </div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="form-group"
          >
            <label htmlFor="description">
              <FileText size={18} className="text-primary" />
              Experience Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Share your experience: interview process, work culture, challenges, learnings, etc. Be detailed to help others prepare better."
              rows="6"
              required
              className="hover-lift"
            />
            <p className="form-hint">
              Include details about the application process, interview rounds, company culture, and your overall experience.
            </p>
          </motion.div>

          {/* Interview Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="form-group"
          >
            <label htmlFor="interviewQuestions">
              <MessageSquare size={18} className="text-primary" />
              Interview Questions
            </label>
            <textarea
              id="interviewQuestions"
              name="interviewQuestions"
              value={form.interviewQuestions}
              onChange={handleChange}
              placeholder="List the interview questions you remember (one per line)&#10;&#10;Example:&#10;Tell me about yourself&#10;What are your strengths and weaknesses?&#10;Describe a challenging project you worked on"
              rows="5"
              className="hover-lift"
            />
            <p className="form-hint">
              Enter each question on a new line. This helps students prepare for similar interviews.
            </p>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="form-group"
          >
            <label htmlFor="tips">
              <Lightbulb size={18} className="text-primary" />
              Tips & Advice
            </label>
            <textarea
              id="tips"
              name="tips"
              value={form.tips}
              onChange={handleChange}
              placeholder="Share valuable tips and advice for future applicants. What would you do differently? What preparation helped you the most?"
              rows="4"
              className="hover-lift"
            />
            <p className="form-hint">
              Your advice could be the key insight that helps someone succeed in their interview.
            </p>
          </motion.div>

          {/* Submit Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="form-actions form-actions-between"
          >
            <button
              type="button"
              onClick={() => navigate('/feed')}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Publishing...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Share Experience
                </>
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>

      {/* Floating Background Elements */}
      <div className="fixed top-20 right-10 opacity-5 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-secondary"
        />
      </div>
      
      <div className="fixed bottom-20 left-10 opacity-5 pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-24 h-24 rounded-lg bg-gradient-to-r from-accent to-success transform rotate-45"
        />
      </div>
    </div>
  )
}
