import { createContext, useContext, useState, useCallback } from 'react'
import API from '../utils/api'

const UserCacheContext = createContext()

export const useUserCache = () => {
  const context = useContext(UserCacheContext)
  if (!context) {
    throw new Error('useUserCache must be used within UserCacheProvider')
  }
  return context
}

export const UserCacheProvider = ({ children }) => {
  const [userCache, setUserCache] = useState(new Map())
  const [loadingUsers, setLoadingUsers] = useState(new Set())

  const getCachedUser = useCallback(async (userId) => {
    // Return cached user if available
    if (userCache.has(userId)) {
      return userCache.get(userId)
    }

    // Prevent duplicate requests
    if (loadingUsers.has(userId)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          if (userCache.has(userId)) {
            resolve(userCache.get(userId))
          } else {
            setTimeout(checkCache, 100)
          }
        }
        checkCache()
      })
    }

    // Fetch user data
    setLoadingUsers(prev => new Set(prev).add(userId))
    
    try {
      const res = await API.get(`/users/${userId}`)
      const userData = res.data
      
      // Cache the user data
      setUserCache(prev => new Map(prev).set(userId, userData))
      return userData
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    } finally {
      setLoadingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }, [userCache, loadingUsers])

  const clearCache = useCallback(() => {
    setUserCache(new Map())
    setLoadingUsers(new Set())
  }, [])

  const value = {
    getCachedUser,
    clearCache,
    userCache,
    isLoading: (userId) => loadingUsers.has(userId)
  }

  return (
    <UserCacheContext.Provider value={value}>
      {children}
    </UserCacheContext.Provider>
  )
}
