import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getUserProfileByEmail, manageUser } from '@api/userRole.api'
import { login as loginApi } from '@api/auth.api'

// Async thunks
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            // 1. Login with Custom API
            console.log('[Auth] Calling /api/Auth/Login...')
            const response = await loginApi({ email, password })
            console.log('[Auth] Login response:', response.data)

            // ✅ Check success flag — backend returns HTTP 200 even on auth failure
            if (response.data?.success === false) {
                return rejectWithValue(response.data.message || 'Invalid email or password')
            }

            const loginData = response.data?.data || response.data

            // Handle different token field names from backend
            const token =
                loginData?.token ||
                loginData?.accessToken ||
                loginData?.jwtToken ||
                loginData?.authToken ||
                null

            if (!loginData) {
                return rejectWithValue('Invalid response from login API')
            }

            // 2. Fetch basic profile to get userId
            console.log('[Auth] Calling GetUserProfileByEmail...')
            let userData = { email }

            try {
                const profileRes = await getUserProfileByEmail(email)
                console.log('[Auth] Profile response:', profileRes.data)
                const profileData = profileRes.data?.data || profileRes.data

                if (profileData && profileData.userId) {
                    // 3. Fetch full user details using manageUser (spType: 'E')
                    console.log('[Auth] Calling ManageUser for full profile...')
                    const userRes = await manageUser({ id: profileData.userId, spType: "E" })
                    console.log('[Auth] ManageUser response:', userRes.data)
                    const fullUserDataArray = userRes.data?.data || []
                    const fullUserData = fullUserDataArray.length > 0 ? fullUserDataArray[0] : {}

                    userData = {
                        ...profileData,
                        ...fullUserData,
                        email: profileData.emailId || fullUserData.emailId || email
                    }
                } else {
                    // Profile not found — store minimal info from login response
                    console.warn('[Auth] User profile not found, using login data only')
                    userData = {
                        ...loginData,
                        email
                    }
                }
            } catch (profileError) {
                console.warn('[Auth] Profile fetch failed, using login data only:', profileError.message)
                userData = { ...loginData, email }
            }

            // Store in LocalStorage
            if (token) {
                localStorage.setItem('authToken', token)
            }
            localStorage.setItem('user', JSON.stringify(userData))
            localStorage.setItem('userEmail', userData.email)
            if (userData.userId) localStorage.setItem('userId', userData.userId)
            if (userData.roleId) localStorage.setItem('roleId', userData.roleId)
            if (userData.officeId) localStorage.setItem('officeId', userData.officeId)

            if (userData.userId) sessionStorage.setItem('userId', userData.userId)
            if (userData.roleId) sessionStorage.setItem('roleId', userData.roleId)
            if (userData.officeId) sessionStorage.setItem('officeId', userData.officeId)

            return { user: userData, token: token || 'no-token' }
        } catch (error) {
            console.error('[Auth] Login failed:', error.response?.data || error.message)
            return rejectWithValue(error.response?.data?.message || error.message || 'Login failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // 1. Clear LocalStorage
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
            localStorage.removeItem('userEmail')
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
