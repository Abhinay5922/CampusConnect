import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GraduationCap, LogIn, UserPlus, PenSquare } from 'lucide-react'
import UserProfile from './UserProfile'

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    }
    navigate('/login', { replace: true })
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="nav-container">
        <Link to="/feed" className="nav-logo">
          <GraduationCap size={28} className="text-primary" />
          <span>CampusConnect</span>
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              {user.role === 'alumni' && (
                <Link 
                  to="/new" 
                  className={`nav-link ${location.pathname === '/new' ? 'active' : ''} flex items-center gap-2`}
                >
                  <PenSquare size={18} />
                  <span>Share Experience</span>
                </Link>
              )}
              <UserProfile user={user} onLogout={handleLogout} />
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="btn btn-primary">
                <UserPlus size={18} />
                <span>Signup</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
