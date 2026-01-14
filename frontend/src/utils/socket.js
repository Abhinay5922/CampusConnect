import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

// Enhanced socket configuration with better connection handling
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  transports: ['websocket', 'polling'],
  auth: (cb) => {
    const token = localStorage.getItem('token')
    cb({ token })
  }
})

// Connection event logging
socket.on('connect', () => {
  console.log('✅ Socket connected:', socket.id)
})

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason)
})

socket.on('connect_error', (error) => {
  console.error('🔴 Socket connection error:', error.message)
})

socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Socket reconnected after', attemptNumber, 'attempts')
})

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('🔄 Socket reconnection attempt:', attemptNumber)
})

socket.on('reconnect_error', (error) => {
  console.error('🔴 Socket reconnection error:', error.message)
})

socket.on('reconnect_failed', () => {
  console.error('🔴 Socket reconnection failed after all attempts')
})

export default socket
