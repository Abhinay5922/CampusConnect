import React, { useEffect, useState } from 'react'
import API from '../utils/api'
import ExperienceCard from '../components/ExperienceCard'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, Loader2 } from 'lucide-react'

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
    <div className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {user?.role === 'alumni' ? 'Alumni Network' : 'Experience Feed'}
          </h1>
          <p className="text-text-secondary">
            Discover mentorship opportunities and career insights.
          </p>
        </div>
        {user?.role === 'alumni' && (
          <Link to="/new" className="btn btn-primary shadow-lg shadow-primary/30">
            <Plus size={20} /> Share Experience
          </Link>
        )}
      </div>

      {/* Filter Section */}
      {user?.role === 'student' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4 text-primary font-semibold">
            <Filter size={18} />
            <h3>Filter Posts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                name="company"
                value={filters.company}
                onChange={handleFilterChange}
                placeholder="Search by Company"
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                placeholder="Search by Role"
                className="pl-9"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                placeholder="Search by Department"
                className="pl-9"
              />
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <motion.div layout className="grid gap-6">
          <AnimatePresence>
            {filteredExps.map((exp) => (
              <ExperienceCard 
                key={exp._id} 
                exp={exp} 
                onUpdate={handleUpdatePost}
                onDelete={handleDeletePost}
              />
            ))}
          </AnimatePresence>
          
          {filteredExps.length === 0 && (
            <div className="text-center py-20 text-text-secondary glass-card">
              <p className="text-lg">No experiences found matching your criteria.</p>
              <button onClick={() => setFilters({ company: '', role: '', department: '' })} className="mt-4 text-primary hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
