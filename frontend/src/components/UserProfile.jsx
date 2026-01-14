import { useState, useEffect, useRef } from 'react'
import API from '../utils/api'

export default function UserProfile({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [userDetails, setUserDetails] = useState(user)
  const [isLoading, setIsLoading] = useState(false)
  const profileRef = useRef(null)

  // Fetch fresh user data when profile opens
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isOpen && user?._id) {
        setIsLoading(true)
        try {
          const res = await API.get(`/users/${user._id}`)
          setUserDetails(res.data)
        } catch (err) {
          console.error('Failed to fetch user details:', err)
          // Fallback to existing user data
          setUserDetails(user)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchUserDetails()
  }, [isOpen, user])

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!user) return null

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleIcon = (role) => {
    return role === 'alumni' ? '🎓' : '📚'
  }

  return (
    <div className="profile-container" ref={profileRef}>
      {/* Profile Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="profile-icon-btn"
        aria-label="Open profile"
      >
        <div className="profile-avatar">
          <span className="profile-initials">{getInitials(user.name)}</span>
        </div>
      </button>

      {/* Profile Dropdown Panel */}
      {isOpen && (
        <>
          <div className="profile-overlay" onClick={() => setIsOpen(false)} />
          <div className="profile-panel">
            {isLoading ? (
              <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
              </div>
            ) : (
              <>
                {/* Profile Header */}
                <div className="profile-header">
                  <div className="profile-avatar-large">
                    <span className="profile-initials-large">
                      {getInitials(userDetails.name)}
                    </span>
                  </div>
                  <h3 className="profile-name">{userDetails.name}</h3>
                  <div className="profile-role-badge">
                    <span className="role-icon">{getRoleIcon(userDetails.role)}</span>
                    <span className="role-text">
                      {userDetails.role === 'alumni' ? 'Alumni' : 'Student'}
                    </span>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="profile-details">
                  <div className="profile-detail-item">
                    <span className="detail-icon">📧</span>
                    <div className="detail-content">
                      <label>Email</label>
                      <p>{userDetails.email}</p>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <span className="detail-icon">🏢</span>
                    <div className="detail-content">
                      <label>Department</label>
                      <p>{userDetails.department}</p>
                    </div>
                  </div>

                  <div className="profile-detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <label>Batch</label>
                      <p>{userDetails.batch}</p>
                    </div>
                  </div>

                  {userDetails.createdAt && (
                    <div className="profile-detail-item">
                      <span className="detail-icon">🗓️</span>
                      <div className="detail-content">
                        <label>Member Since</label>
                        <p>{new Date(userDetails.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Actions */}
                <div className="profile-actions">
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      onLogout()
                    }}
                    className="profile-logout-btn"
                  >
                    <span className="logout-icon">🚪</span>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
