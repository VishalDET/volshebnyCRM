import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as queryAPI from '@api/query.api'

// Async thunks
export const fetchQueries = createAsyncThunk(
    'query/fetchQueries',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await queryAPI.getAllQueries(filters)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch queries')
        }
    }
)

export const fetchQueryById = createAsyncThunk(
    'query/fetchQueryById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await queryAPI.getQueryById(id)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch query')
        }
    }
)

export const createQuery = createAsyncThunk(
    'query/createQuery',
    async (queryData, { rejectWithValue }) => {
        try {
            const response = await queryAPI.createQuery(queryData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create query')
        }
    }
)

export const updateQuery = createAsyncThunk(
    'query/updateQuery',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await queryAPI.updateQuery(id, data)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update query')
        }
    }
)

export const deleteQuery = createAsyncThunk(
    'query/deleteQuery',
    async (id, { rejectWithValue }) => {
        try {
            await queryAPI.deleteQuery(id)
            return id
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete query')
        }
    }
)

// Initial state
const initialState = {
    queries: [],
    currentQuery: null,
    loading: false,
    error: null,
    filters: {},
}

// Slice
const querySlice = createSlice({
    name: 'query',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setFilters: (state, action) => {
            state.filters = action.payload
        },
        clearCurrentQuery: (state) => {
            state.currentQuery = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all queries
            .addCase(fetchQueries.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQueries.fulfilled, (state, action) => {
                state.loading = false
                state.queries = action.payload
            })
            .addCase(fetchQueries.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch query by ID
            .addCase(fetchQueryById.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchQueryById.fulfilled, (state, action) => {
                state.loading = false
                state.currentQuery = action.payload
            })
            .addCase(fetchQueryById.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create query
            .addCase(createQuery.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createQuery.fulfilled, (state, action) => {
                state.loading = false
                state.queries.push(action.payload)
            })
            .addCase(createQuery.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Update query
            .addCase(updateQuery.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(updateQuery.fulfilled, (state, action) => {
                state.loading = false
                const index = state.queries.findIndex(q => q.id === action.payload.id)
                if (index !== -1) {
                    state.queries[index] = action.payload
                }
                if (state.currentQuery?.id === action.payload.id) {
                    state.currentQuery = action.payload
                }
            })
            .addCase(updateQuery.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Delete query
            .addCase(deleteQuery.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(deleteQuery.fulfilled, (state, action) => {
                state.loading = false
                state.queries = state.queries.filter(q => q.id !== action.payload)
            })
            .addCase(deleteQuery.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearError, setFilters, clearCurrentQuery } = querySlice.actions
export default querySlice.reducer
