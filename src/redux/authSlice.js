import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserProfileByEmail } from '@api/userRole.api'
import { loginWithFirebase, logoutFromFirebase } from '../services/firebase.service'

// Async thunks
// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            // 1. Login with Firebase
            const { user: firebaseUser, error } = await loginWithFirebase(email, password)
            if (error) throw new Error(error)

            // 2. Get User Token (optional, if needed for backend calls immediately)
            const token = await firebaseUser.getIdToken()

            // 3. Get Backend User Details using Email (more reliable endpoint)
            const userResponse = await getUserProfileByEmail(firebaseUser.email)
            const backendUser = userResponse.data

            const userData = {
                ...backendUser,
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL
            }

            // Store in LocalStorage
            localStorage.setItem('authToken', token)
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('userEmail', firebaseUser.email)
            localStorage.setItem('userId', backendUser.userId)
            localStorage.setItem('roleId', backendUser.roleId)
            sessionStorage.setItem('userId', backendUser.userId)
            sessionStorage.setItem('roleId', backendUser.roleId)

            return { user: userData, token }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await logoutFromFirebase()
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            localStorage.removeItem('userId')
            localStorage.removeItem('roleId')
            sessionStorage.removeItem('userId')
            sessionStorage.removeItem('roleId')
            return null
        } catch (error) {
            return rejectWithValue(error.message || 'Logout failed')
        }
    }
)

// Initial state
const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('authToken') || null,
    isAuthenticated: !!localStorage.getItem('authToken'),
    loading: false,
    error: null,
}

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setUser: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = true
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token
                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.isAuthenticated = false
            })
            // Logout
            .addCase(logout.pending, (state) => {
                state.loading = true
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false
                state.isAuthenticated = false
                state.user = null
                state.token = null
                state.error = null
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
