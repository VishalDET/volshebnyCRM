import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { login as loginAPI, logout as logoutAPI } from '@api/auth.api'

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginAPI(credentials)
            localStorage.setItem('authToken', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Login failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await logoutAPI()
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            return null
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Logout failed')
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
