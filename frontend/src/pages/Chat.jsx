import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, ArrowLeft, MoreVertical, Phone, Video, Loader2 } from 'lucide-react'
import { socket } from '../utils/socket'
import { useUserCache } from '../contexts/UserCacheContext'

export default function Chat() {
  const { otherId } = useParams()
  const navigate = useNavigate()
  const { getCachedUser } = useUserCache()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [otherUser, setOtherUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const user = JSON.parse(localStorage.getItem('user'))
  const messagesEndRef = useRef(null)
  const messageIdsRef = useRef(new Set())
  const typingTimeoutRef = useRef(null)
  const reconnectAttemptsRef = useRef(0)

  // Use _id instead of id for consistency
  const userId = user?._id || user?.id

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Fetch other user info
  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        if (otherId === userId) {
          navigate('/feed')
          return
        }
        const otherUserData = await getCachedUser(otherId)
        setOtherUser(otherUserData)
      } catch (err) {
        console.error('Failed to fetch user:', err)
        navigate('/feed')
      }
    }
    if (otherId && user) {
      fetchOtherUser()
    }
  }, [otherId, user, userId, navigate, getCachedUser])

  // Socket connection logic (simplified for brevity, similar to original)
  useEffect(() => {
    if (!userId) {
      navigate('/login')
      return
    }

    const connectSocket = () => {
      if (!socket.connected) socket.connect()
      else {
        setIsConnected(true)
        socket.emit('user-online', userId)
      }
    }

    connectSocket()
    
    const handleConnect = () => {
      setIsConnected(true)
      setError(null)
      socket.emit('user-online', userId)
    }

    const handleDisconnect = () => setIsConnected(false)
    
    const handleReceiveMessage = (data) => {
      const validConvoIds = [`${userId}_${otherId}`, `${otherId}_${userId}`]
      if (validConvoIds.includes(data.conversationId)) {
        const messageId = data._id || `${data.sender}_${data.createdAt}_${data.text}`
        if (!messageIdsRef.current.has(messageId)) {
          messageIdsRef.current.add(messageId)
          setMessages(prev => [...prev, { ...data, _id: messageId }])
        }
      }
    }

    const handleUserTyping = (data) => {
      if (data.userId === otherId) {
        setIsTyping(true)
        clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000)
      }
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('receive-msg', handleReceiveMessage)
    socket.on('user-typing', handleUserTyping)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('receive-msg', handleReceiveMessage)
      socket.off('user-typing', handleUserTyping)
    }
  }, [userId, otherId, navigate])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    const msgData = {
      sender: userId,
      recipient: otherId,
      text,
      createdAt: new Date().toISOString(),
      conversationId: `${userId}_${otherId}`
    }

    // Optimistic update
    const tempId = Date.now().toString()
    setMessages(prev => [...prev, { ...msgData, _id: tempId }])
    setText('')
    
    socket.emit('send-msg', msgData)
  }

  const handleTyping = (e) => {
    setText(e.target.value)
    socket.emit('typing', { sender: userId, recipient: otherId })
  }

  if (!otherUser) return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Loader2 className="animate-spin text-primary" size={48} />
    </div>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container max-w-4xl mx-auto h-[calc(100vh-120px)] mt-4"
    >
      <div className="glass-card h-full flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                dangerouslySetInnerHTML={{ __html: otherUser.avatarImage || '' }}
              >
                {!otherUser.avatarImage && otherUser.username[0].toUpperCase()}
              </div>
              {isConnected && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">{otherUser.username}</h3>
              <p className="text-xs text-text-secondary flex items-center gap-1">
                {isTyping ? (
                  <span className="text-primary font-medium">Typing...</span>
                ) : (
                  isConnected ? 'Online' : 'Offline'
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-text-secondary">
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Video size={20} />
            </button>
            <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/20">
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.sender === userId
              return (
                <motion.div
                  key={msg._id || index}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`
                      max-w-[70%] p-3 rounded-2xl shadow-sm
                      ${isMe 
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white rounded-tr-none' 
                        : 'bg-white text-text-primary rounded-tl-none border border-white/50'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/40 backdrop-blur-md border-t border-glass-border">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={text}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 bg-white/60 border-none focus:ring-2 ring-primary/20 transition-all shadow-inner"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!text.trim()}
              className={`
                p-3 rounded-xl flex items-center justify-center transition-all
                ${text.trim() 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Send size={20} />
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}
