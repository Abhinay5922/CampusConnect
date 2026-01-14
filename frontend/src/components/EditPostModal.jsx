import { useState, useEffect } from 'react'
import API from '../utils/api'

export default function EditPostModal({ experience, onClose, onSave }) {
  const [form, setForm] = useState({
    company: '',
    role: '',
    description: '',
    interviewQuestions: '',
    tips: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Pre-fill form with existing data
    if (experience) {
      setForm({
        company: experience.company || '',
        role: experience.role || '',
        description: experience.description || '',
        interviewQuestions: experience.interviewQuestions?.join('\n') || '',
        tips: experience.tips || ''
      })
    }
  }, [experience])

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

      const res = await API.put(`/experiences/${experience._id}`, payload)
      onSave(res.data)
    } catch (err) {
      console.error('Failed to update post:', err)
      setError(err.response?.data?.message || 'Failed to update post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Experience</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="company">Company *</label>
            <input
              id="company"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role *</label>
            <input
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="e.g., Software Engineer, Data Analyst"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Share your experience, interview process, work culture, etc."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="interviewQuestions">Interview Questions</label>
            <textarea
              id="interviewQuestions"
              name="interviewQuestions"
              value={form.interviewQuestions}
              onChange={handleChange}
              placeholder="One question per line"
              rows="4"
            />
            <small className="form-hint">Enter each question on a new line</small>
          </div>

          <div className="form-group">
            <label htmlFor="tips">Tips</label>
            <textarea
              id="tips"
              name="tips"
              value={form.tips}
              onChange={handleChange}
              placeholder="Any advice or tips for future applicants"
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
