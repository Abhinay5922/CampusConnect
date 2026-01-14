import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, MoreVertical, Edit, Trash2, Building2, User, Calendar, GraduationCap } from 'lucide-react'
import EditPostModal from './EditPostModal'
import DeleteConfirmDialog from './DeleteConfirmDialog'

export default function ExperienceCard({ exp, onUpdate, onDelete }) {
  const [showMenu, setShowMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const userId = currentUser?._id || currentUser?.id
  const isOwnPost = userId === exp.author?._id
  
  // Check if roles are different
  const canMessage = !isOwnPost && currentUser?.role !== exp.author?.role

  const handleEdit = () => {
    setShowMenu(false)
    setShowEditModal(true)
  }

  const handleDelete = () => {
    setShowMenu(false)
    setShowDeleteDialog(true)
  }

  return (
    <>
      <motion.div 
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="experience-card"
      >
        <div className="experience-header">
          <div className="experience-info">
            <div className="author-info">
              <div className="author-avatar">
                {exp.author?.avatarImage ? (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: exp.author.avatarImage }} 
                  />
                ) : (
                  exp.author?.name?.[0] || 'U'
                )}
              </div>
              <div className="author-details">
                <div className="author-name">{exp.author?.name}</div>
                <div className="author-meta">
                  {exp.author?.department && (
                    <span>
                      <Building2 size={14} /> {exp.author.department}
                    </span>
                  )}
                  {exp.author?.batch && (
                    <span>
                      <Calendar size={14} /> Batch {exp.author.batch}
                    </span>
                  )}
                  <span>
                    <Calendar size={14} /> {new Date(exp.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <h3>{exp.role}</h3>
            <div className="experience-company">
              <Building2 size={20} /> {exp.company}
            </div>

            <div className="experience-meta">
               <span className="meta-tag">
                 <User size={14} /> {exp.author?.role === 'alumni' ? 'Alumni' : 'Student'}
               </span>
               {exp.author?.department && (
                 <span className="meta-tag">
                   <Building2 size={14} /> {exp.author.department}
                 </span>
               )}
               {exp.author?.batch && (
                 <span className="meta-tag">
                   <GraduationCap size={14} /> Batch {exp.author.batch}
                 </span>
               )}
            </div>

            <p className="experience-description">
              {exp.description}
            </p>
            
            {exp.tips && (
              <div className="tips-section">
                <strong>💡 Tips for Juniors</strong>
                <p>{exp.tips}</p>
              </div>
            )}
          </div>
          
          <div className="experience-actions">
            {canMessage && exp.author?._id && (
              <Link 
                to={`/chat/${exp.author._id}`} 
                className="message-btn"
              >
                <MessageCircle size={18} />
                <span>Message</span>
              </Link>
            )}
            
            {isOwnPost && (
              <div className="post-menu-container">
                <button 
                  className="post-menu-btn"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={20} />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <>
                      <div className="post-menu-overlay" onClick={() => setShowMenu(false)} />
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="post-menu"
                      >
                        <button onClick={handleEdit} className="post-menu-item">
                          <Edit size={16} /> Edit Post
                        </button>
                        <button onClick={handleDelete} className="post-menu-item delete">
                          <Trash2 size={16} /> Delete Post
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showEditModal && (
        <EditPostModal 
          exp={exp} 
          onClose={() => setShowEditModal(false)} 
          onSave={handleEditSave} 
        />
      )}

      {showDeleteDialog && (
        <DeleteConfirmDialog 
          onClose={() => setShowDeleteDialog(false)} 
          onConfirm={handleDeleteConfirm} 
        />
      )}
    </>
  )

  function handleEditSave(updatedExp) {
    setShowEditModal(false)
    if (onUpdate) onUpdate(updatedExp)
  }

  function handleDeleteConfirm() {
    setShowDeleteDialog(false)
    if (onDelete) onDelete(exp._id)
  }
}
