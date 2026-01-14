import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import API from '../utils/api'
import { socket } from '../utils/socket'

export default function Messenger() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const user = JSON.parse(localStorage.getItem('user'))
  const userId = user?._id || user?.id
  const location = useLocation()
  const fetchTimeoutRef = useRef(null)
  const messengerRef = useRef(null)
  const panelRef = useRef(null)
  const openingRef = useRef(false)

  const fetchConversations = useCallback(async () => {
    if (!userId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await API.get('/conversations')
      const convData = res.data || []
      
      // Filter out self-conversations (where otherUser is the current user)
      const validConversations = convData.filter(conv => 
        conv.otherUser && conv.otherUser._id !== userId
      )
      
      setConversations(validConversations)
      
      // Calculate unread count
      const unread = validConversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0)
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      setError('Failed to load conversations')
      // Keep existing data on error
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) return

    // Initial fetch
    fetchConversations()

    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect()
    }

    // Emit user online status
    socket.emit('user-online', userId)

    // Listen for online users
    const handleOnlineUsers = (users) => {
      setOnlineUsers(new Set(users))
    }

    // Listen for new messages with debounce
    const handleReceiveMessage = (data) => {
      console.log('Messenger received message:', data)
      
      // Debounce conversation refresh
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = setTimeout(() => {
        fetchConversations()
      }, 500)
    }

    socket.on('online-users', handleOnlineUsers)
    socket.on('receive-message', handleReceiveMessage)

    // Refresh conversations when returning to app
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchConversations()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      socket.off('online-users', handleOnlineUsers)
      socket.off('receive-message', handleReceiveMessage)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(fetchTimeoutRef.current)
    }
  }, [userId, fetchConversations])

  // Refresh conversations when opening messenger
  useEffect(() => {
    console.log('isOpen changed to:', isOpen)
    if (isOpen) {
      fetchConversations()
    }
  }, [isOpen, fetchConversations])

  // Debug: Monitor component lifecycle
  useEffect(() => {
    console.log('Messenger component mounted/updated')
    return () => {
      console.log('Messenger component cleanup')
    }
  })

  // No click-outside handler - only overlay and close button can close messenger

  // Hide messenger on chat page
  const isOnChatPage = location.pathname.startsWith('/chat/')
  
  if (!user || isOnChatPage) return null

  return (
    <>
      {/* Floating Messenger Button */}
      <div ref={messengerRef}>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('FAB clicked, current isOpen:', isOpen)
            
            if (!isOpen) {
              // Opening messenger
              openingRef.current = true
              console.log('Opening messenger, setting protection flag')
              setTimeout(() => {
                openingRef.current = false
                console.log('Protection flag cleared')
              }, 500)
            }
            
            setIsOpen(prev => {
              console.log('Setting isOpen to:', !prev)
              return !prev
            })
          }}
          className="messenger-fab"
          aria-label="Open messenger"
        >
          <span className="messenger-icon">💬</span>
          {unreadCount > 0 && (
            <span className="messenger-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        {/* Messenger Panel */}
        {isOpen && (
          <div 
            ref={panelRef}
            className="messenger-panel" 
            onClick={(e) => {
              console.log('Panel clicked')
              e.stopPropagation()
            }}
          >
          <div className="messenger-header">
            <h3>Messages</h3>
            <button 
              onClick={() => fetchConversations()} 
              className="messenger-refresh"
              disabled={isLoading}
              title="Refresh"
            >
              {isLoading ? '⏳' : '🔄'}
            </button>
            <button onClick={() => setIsOpen(false)} className="messenger-close">
              ✕
            </button>
          </div>

          <div className="messenger-body">
            {error && (
              <div className="messenger-error">
                <p>{error}</p>
                <button onClick={fetchConversations} className="retry-small-btn">
                  Retry
                </button>
              </div>
            )}
            
            {isLoading && conversations.length === 0 ? (
              <div className="messenger-loading">
                <div className="loading-spinner"></div>
                <p>Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="messenger-empty">
                <span className="empty-icon">💬</span>
                <p>No conversations yet</p>
                <small>Start chatting with {user.role === 'student' ? 'alumni' : 'students'}!</small>
              </div>
            ) : (
              <div className="conversation-list">
                {conversations.map((conv) => (
                  <Link
                    key={conv._id || conv.otherUser._id}
                    to={`/chat/${conv.otherUser._id}`}
                    className="conversation-item"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="conversation-avatar">
                      <span className="avatar-text">
                        {conv.otherUser.name.charAt(0).toUpperCase()}
                      </span>
                      {onlineUsers.has(conv.otherUser._id) && (
                        <span className="online-indicator"></span>
                      )}
                    </div>
                    
                    <div className="conversation-info">
                      <div className="conversation-header-row">
                        <span className="conversation-name">{conv.otherUser.name}</span>
                        {conv.lastMessage && (
                          <span className="conversation-time">
                            {formatTime(conv.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      
                      <div className="conversation-details">
                        <span className="conversation-role">
                          {conv.otherUser.role === 'alumni' ? '🎓' : '📚'} {conv.otherUser.department}
                        </span>
                      </div>
                      
                      {conv.lastMessage && (
                        <p className="conversation-preview">
                          {conv.lastMessage.text}
                        </p>
                      )}
                      
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Overlay - Click to close */}
      {isOpen && (
        <div 
          className="messenger-overlay" 
          onClick={(e) => {
            console.log('Overlay clicked, openingRef:', openingRef.current)
            e.stopPropagation()
            
            // Don't close if we're still in the opening phase
            if (openingRef.current) {
              console.log('Ignoring overlay click - still opening')
              return
            }
            
            console.log('Closing messenger via overlay')
            setIsOpen(false)
          }}
          onMouseDown={(e) => {
            // Prevent mousedown from propagating
            e.stopPropagation()
          }}
        />
      )}
    </>
  )
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // Less than 1 minute
  if (diff < 60000) return 'Just now'
  
  // Less than 1 hour
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }
  
  // Less than 24 hours
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }
  
  // Less than 7 days
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}d ago`
  }
  
  // Show date
  return date.toLocaleDateString()
}
