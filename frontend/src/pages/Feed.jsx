import React, { useEffect, useState } from 'react'
import API from '../utils/api'
import ExperienceCard from '../components/ExperienceCard'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, Loader2, Users, BookOpen } from 'lucide-react'

export default function Feed() {
  const [exps, setExps] = useState([])
  const [filteredExps, setFilteredExps] = useState([])
  const [filters, setFilters] = useState({ company: '', role: '', department: '' })
  const [isLoading, setIsLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user'))

  const fetchExps = async () => {
    setIsLoading(true)
    try {
      const res = await API.get('/experiences')
      setExps(res.data)
      setFilteredExps(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchExps() }, [])

  useEffect(() => {
    let filtered = exps
    if (filters.company) {
      filtered = filtered.filter(e => e.company?.toLowerCase().includes(filters.company.toLowerCase()))
    }
    if (filters.role) {
      filtered = filtered.filter(e => e.role?.toLowerCase().includes(filters.role.toLowerCase()))
    }
    if (filters.department) {
      filtered = filtered.filter(e => e.author?.department?.toLowerCase().includes(filters.department.toLowerCase()))
    }
    setFilteredExps(filtered)
  }, [filters, exps])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleUpdatePost = (updatedExp) => {
    setExps(prevExps => 
      prevExps.map(exp => exp._id === updatedExp._id ? updatedExp : exp)
    )
  }

  const handleDeletePost = async (postId) => {
    try {
      await API.delete(`/experiences/${postId}`)
      setExps(prevExps => prevExps.filter(exp => exp._id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
      alert('Failed to delete post. Please try again.')
    }
  }

  return (
    <div className="container-md py-8">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="content-center mb-12"
      >
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6">
          <div className="content-center md:content-start flex-1">
            <div className="flex items-center gap-3 mb-4">
              {user?.role === 'alumni' ? (
                <Users size={32} className="text-primary" />
              ) : (
                <BookOpen size={32} className="text-primary" />
              )}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {user?.role === 'alumni' ? 'Alumni Network' : 'Experience Feed'}
              </h1>
            </div>
            <p className="text-lg text-text-secondary max-w-2xl">
              {user?.role === 'alumni' 
                ? 'Share your professional journey and help guide the next generation of students.'
                : 'Discover mentorship opportunities, career insights, and learn from alumni experiences.'
              }
            </p>
          </div>
          
          {user?.role === 'alumni' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link to="/new" className="btn btn-primary shadow-glow hover-lift">
                <Plus size={20} />
                Share Experience
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Filter Section */}
      {user?.role === 'student' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 mb-8 hover-lift"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-gradient rounded-full flex items-center justify-center">
              <Filter size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Filter Posts</h3>
              <p className="text-sm text-text-tertiary">Find experiences that match your interests</p>
            </div>
          </div>
          
          <div className="form-grid-3">
            <div className="form-group">
              <label htmlFor="company-filter">
                <Search size={16} className="text-primary" />
                Company
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input
                  id="company-filter"
                  name="company"
                  value={filters.company}
                  onChange={handleFilterChange}
                  placeholder="Search by Company"
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="role-filter">
                <Search size={16} className="text-primary" />
                Role
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input
                  id="role-filter"
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                  placeholder="Search by Role"
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="department-filter">
                <Search size={16} className="text-primary" />
                Department
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
                <input
                  id="department-filter"
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  placeholder="Search by Department"
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          
          {(filters.company || filters.role || filters.department) && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-glass-border">
              <p className="text-sm text-text-secondary">
                Showing {filteredExps.length} of {exps.length} experiences
              </p>
              <button 
                onClick={() => setFilters({ company: '', role: '', department: '' })} 
                className="text-primary hover:underline text-sm font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Content Section */}
      {isLoading ? (
        <div className="center-content py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="content-center"
          >
            <Loader2 className="animate-spin text-primary mb-4" size={48} />
            <p className="text-text-secondary">Loading experiences...</p>
          </motion.div>
        </div>
      ) : (
        <motion.div layout className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredExps.map((exp, index) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <ExperienceCard 
                  exp={exp} 
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredExps.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="empty-state"
            >
              <div className="empty-state-icon">📚</div>
              <h3 className="empty-state-title">No experiences found</h3>
              <p className="empty-state-message">
                {(filters.company || filters.role || filters.department) 
                  ? "No experiences match your current filters. Try adjusting your search criteria."
                  : user?.role === 'alumni' 
                    ? "Be the first to share your experience and help guide students!"
                    : "No experiences have been shared yet. Check back soon!"
                }
              </p>
              {(filters.company || filters.role || filters.department) && (
                <button 
                  onClick={() => setFilters({ company: '', role: '', department: '' })} 
                  className="btn btn-secondary mt-4"
                >
                  Clear all filters
                </button>
              )}
              {user?.role === 'alumni' && !filters.company && !filters.role && !filters.department && (
                <Link to="/new" className="btn btn-primary mt-4">
                  <Plus size={18} />
                  Share Your Experience
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
