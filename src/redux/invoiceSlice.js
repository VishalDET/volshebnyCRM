import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as clientInvoiceAPI from '@api/clientInvoice.api'
import * as supplierInvoiceAPI from '@api/supplierInvoice.api'

// Async thunks for client invoices
export const fetchClientInvoices = createAsyncThunk(
    'invoice/fetchClientInvoices',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await clientInvoiceAPI.getAllClientInvoices(filters)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch client invoices')
        }
    }
)

export const createClientInvoice = createAsyncThunk(
    'invoice/createClientInvoice',
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await clientInvoiceAPI.createClientInvoice(invoiceData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create client invoice')
        }
    }
)

// Async thunks for supplier invoices
export const fetchSupplierInvoices = createAsyncThunk(
    'invoice/fetchSupplierInvoices',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const response = await supplierInvoiceAPI.getAllSupplierInvoices(filters)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch supplier invoices')
        }
    }
)

export const createSupplierInvoice = createAsyncThunk(
    'invoice/createSupplierInvoice',
    async (invoiceData, { rejectWithValue }) => {
        try {
            const response = await supplierInvoiceAPI.createSupplierInvoice(invoiceData)
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create supplier invoice')
        }
    }
)

// Initial state
const initialState = {
    clientInvoices: [],
    supplierInvoices: [],
    currentInvoice: null,
    loading: false,
    error: null,
}

// Slice
const invoiceSlice = createSlice({
    name: 'invoice',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        setCurrentInvoice: (state, action) => {
            state.currentInvoice = action.payload
        },
        clearCurrentInvoice: (state) => {
            state.currentInvoice = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch client invoices
            .addCase(fetchClientInvoices.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchClientInvoices.fulfilled, (state, action) => {
                state.loading = false
                state.clientInvoices = action.payload
            })
            .addCase(fetchClientInvoices.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create client invoice
            .addCase(createClientInvoice.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createClientInvoice.fulfilled, (state, action) => {
                state.loading = false
                state.clientInvoices.push(action.payload)
            })
            .addCase(createClientInvoice.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Fetch supplier invoices
            .addCase(fetchSupplierInvoices.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchSupplierInvoices.fulfilled, (state, action) => {
                state.loading = false
                state.supplierInvoices = action.payload
            })
            .addCase(fetchSupplierInvoices.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            // Create supplier invoice
            .addCase(createSupplierInvoice.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(createSupplierInvoice.fulfilled, (state, action) => {
                state.loading = false
                state.supplierInvoices.push(action.payload)
            })
            .addCase(createSupplierInvoice.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { clearError, setCurrentInvoice, clearCurrentInvoice } = invoiceSlice.actions
export default invoiceSlice.reducer
