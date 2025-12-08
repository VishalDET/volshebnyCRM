import { createContext, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login as loginAction, logout as logoutAction } from '@redux/authSlice'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch()
    const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth)
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        // Check if user is already logged in on mount
        const token = localStorage.getItem('authToken')
        const savedUser = localStorage.getItem('user')

        if (token && savedUser) {
            setInitialized(true)
        } else {
            setInitialized(true)
        }
    }, [])

    const login = async (credentials) => {
        try {
            await dispatch(loginAction(credentials)).unwrap()
            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    const logout = async () => {
        try {
            await dispatch(logoutAction()).unwrap()
            return { success: true }
        } catch (error) {
            return { success: false, error }
        }
    }

    const value = {
        user,
        isAuthenticated,
        loading,
        error,
        initialized,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
