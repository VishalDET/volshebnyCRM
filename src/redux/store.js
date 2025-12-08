import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import queryReducer from './querySlice'
import invoiceReducer from './invoiceSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        query: queryReducer,
        invoice: invoiceReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/login/fulfilled'],
                // Ignore these field paths in all actions
                ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
                // Ignore these paths in the state
                ignoredPaths: ['auth.user'],
            },
        }),
})

export default store
