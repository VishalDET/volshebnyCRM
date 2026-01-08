import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { manageClientInvoice, getClientInvoiceById } from '@api/clientInvoice.api'
import { manageQuery } from '@api/query.api'
import { manageClient, manageCurrency } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'

const CreateClientInvoice = () => {
    const { id, queryId: routeQueryId } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    // State
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [query, setQuery] = useState(null)
    const [queries, setQueries] = useState([])
    const [client, setClient] = useState(null)
    const [currencies, setCurrencies] = useState([])
    const [existingInvoices, setExistingInvoices] = useState([])

    const [formData, setFormData] = useState({
        id: 0,
        queryId: routeQueryId ? parseInt(routeQueryId) : 0,
        clientId: 0,
        invoiceNo: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currencyId: 0,
        isDomestic: true,
        totalAmount: 0,
        taxAmount: 0,
        netAmount: 0,
        paymentStatus: "Pending",
        userId: 0,
        comments: "",
        spType: "C"
    })

    // UI-only states for now (as requested)
    const [paymentMethod, setPaymentMethod] = useState("") // Bank Account in India, Bank account overseas
    const [remittanceCharge, setRemittanceCharge] = useState(0)
    const [rateOfExchange, setRateOfExchange] = useState(1)
    const [gstAmount, setGstAmount] = useState(0)
    const [serviceCharge, setServiceCharge] = useState(0)
    const [isNettMode, setIsNettMode] = useState(false) // If true, manually override calculations

    useEffect(() => {
        fetchMetadata()
    }, [])

    useEffect(() => {
        if (formData.queryId) {
            fetchQueryData(formData.queryId)
            fetchExistingInvoices(formData.queryId)
        } else {
            setInitialLoading(false)
        }
    }, [formData.queryId])

    useEffect(() => {
        if (isEdit && id) {
            fetchInvoiceData()
        } else if (!routeQueryId) {
            setInitialLoading(false)
        }
    }, [id, isEdit, routeQueryId])

    // Advanced Calculations logic
    useEffect(() => {
        if (isNettMode) return

        let total = parseFloat(formData.totalAmount) || 0
        let tax = 0
        let sc = 0
        let rem = parseFloat(remittanceCharge) || 0
        let roe = parseFloat(rateOfExchange) || 1

        if (paymentMethod === "Bank Account in India") {
            // Apply 5% GST on total
            tax = total * 0.05
            // Apply 18% Service Charge on GST amount
            sc = tax * 0.18
        }

        setGstAmount(tax.toFixed(2))
        setServiceCharge(sc.toFixed(2))

        // Net Amount = (Total + GST + Service Charge) * ROE + Remittance
        // Since budget is in USD, we use ROE to convert to target currency
        let convertedTotal = total * roe
        let convertedTax = tax * roe
        let convertedSC = sc * roe

        const finalNet = convertedTotal + convertedTax + convertedSC + rem

        setFormData(prev => ({
            ...prev,
            taxAmount: (convertedTax + convertedSC).toFixed(2),
            netAmount: finalNet.toFixed(2)
        }))
    }, [formData.totalAmount, paymentMethod, remittanceCharge, rateOfExchange, isNettMode])

    const fetchMetadata = async () => {
        try {
            const payload = {
                id: 0,
                currencyCode: "",
                currencyName: "",
                currencySymbol: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const res = await manageCurrency(payload)
            if (res.data?.data) {
                const list = res.data.data.map(c => ({
                    value: c.id || c.currencyId,
                    label: c.currencyName
                }))
                setCurrencies(list)
                if (!isEdit && list.length > 0) {
                    setFormData(prev => ({ ...prev, currencyId: list[0].value }))
                }
            }

            // Fetch Queries
            const qPayload = {
                id: 0,
                queryNo: "",
                handlerId: 0,
                clientId: 0,
                originCountryId: 0,
                originCityId: 0,
                travelDate: null,
                returnDate: null,
                totalDays: 0,
                adults: 0,
                children: 0,
                infants: 0,
                budget: 0,
                queryStatus: "",
                specialRequirements: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R",
                destinations: [],
                childAges: []
            }
            const qRes = await manageQuery(qPayload)
            const qList = (qRes.data?.data || []).map(q => ({
                value: q.id,
                label: `${q.queryNo} - ${q.clientName || 'Unnamed'}`
            }))
            setQueries(qList)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchInvoiceData = async () => {
        try {
            const res = await getClientInvoiceById(id)
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) {
                const cId = data.clientId || data.clientID || 0
                const qId = data.queryId || data.queryID || 0

                setFormData({
                    ...data,
                    queryId: qId,
                    clientId: cId,
                    currencyId: data.currencyId || data.currencyID || 0,
                    invoiceDate: data.invoiceDate?.split('T')[0],
                    dueDate: data.dueDate?.split('T')[0],
                    spType: "U"
                })

                // Ensure side details are loaded
                if (qId) {
                    fetchQueryData(qId)
                    fetchExistingInvoices(qId)
                }
                if (cId) fetchClientDetails(cId)
            }
        } catch (error) {
            toast.error("Failed to load invoice details")
        } finally {
            setInitialLoading(false)
        }
    }

    const fetchQueryData = async (qId) => {
        try {
            const payload = {
                id: parseInt(qId),
                queryNo: "",
                handlerId: 0,
                clientId: 0,
                originCountryId: 0,
                originCityId: 0,
                travelDate: null,
                returnDate: null,
                totalDays: 0,
                adults: 0,
                children: 0,
                infants: 0,
                budget: 0,
                queryStatus: "",
                specialRequirements: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E",
                destinations: [],
                childAges: []
            }
            const res = await manageQuery(payload)
            const qData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            console.log("Fetched Query Details for Invoice:", qData)
            if (qData) {
                setQuery(qData)
                const cId = qData.clientId || qData.clientID || 0
                setFormData(prev => ({ ...prev, clientId: cId }))
                if (cId) fetchClientDetails(cId)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setInitialLoading(false)
        }
    }

    const fetchClientDetails = async (cId) => {
        try {
            const payload = {
                id: parseInt(cId),
                firstName: "",
                lastName: "",
                mobileNo: "",
                companyName: "",
                emailId: "",
                isGSTIN: true,
                gstNumber: "",
                gstCertificate: "",
                address: "",
                landmark: "",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const res = await manageClient(payload)
            const cData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (cData) setClient(cData)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchExistingInvoices = async (qId) => {
        try {
            const payload = {
                id: 0,
                queryId: parseInt(qId),
                clientId: 0,
                invoiceNo: "",
                invoiceDate: null,
                dueDate: null,
                currencyId: 0,
                totalAmount: 0,
                taxAmount: 0,
                netAmount: 0,
                paymentStatus: "",
                userId: 0,
                isActive: true,
                isDeleted: false,
                createdBy: 0,
                modifiedBy: 0,
                spType: "R"
            }
            const res = await manageClientInvoice(payload)
            const invoices = res.data?.data || []
            // Filter out current invoice if editing
            setExistingInvoices(isEdit ? invoices.filter(inv => inv.id !== parseInt(id)) : invoices)
        } catch (error) {
            console.error(error)
        }
    }

    const totalInvoiced = existingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const queryBudget = query?.budget || 0
    const remainingBudget = queryBudget - totalInvoiced

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updated = { ...prev, [name]: value }
            // Auto calculate net if total or tax changes
            if (name === 'totalAmount' || name === 'taxAmount') {
                const total = parseFloat(name === 'totalAmount' ? value : prev.totalAmount) || 0
                const tax = parseFloat(name === 'taxAmount' ? value : prev.taxAmount) || 0
                updated.netAmount = total + tax
            }
            return updated
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                id: isEdit ? parseInt(id) : 0,
                queryId: parseInt(formData.queryId) || 0,
                clientId: parseInt(formData.clientId) || (query?.clientId ? parseInt(query.clientId) : 0),
                invoiceNo: formData.invoiceNo || "string",
                invoiceDate: new Date(formData.invoiceDate).toISOString(),
                dueDate: new Date(formData.dueDate).toISOString(),
                currencyId: parseInt(formData.currencyId) || 0,
                isDomestic: paymentMethod === "Bank Account in India",
                totalAmount: parseFloat(formData.totalAmount) || 0,
                gst: parseFloat(gstAmount) || 0,
                serviceCharge: parseFloat(serviceCharge) || 0,
                remittance: parseFloat(remittanceCharge) || 0,
                rateOfExchange: parseFloat(rateOfExchange) || 0,
                paymentMethod: paymentMethod || "string",
                comments: formData.comments || "string",
                netAmount: parseFloat(formData.netAmount) || 0,
                paymentStatus: formData.paymentStatus || "Unpaid",
                userId: 0,
                spType: isEdit ? "U" : "C"
            }
            console.log("Submitting Invoice Payload:", payload)
            const res = await manageClientInvoice(payload)
            if (res.data?.success) {
                toast.success(isEdit ? "Invoice updated successfully" : "Invoice created successfully")
                navigate(`/invoices/client/query/${formData.queryId}`)
            } else {
                toast.error(res.data?.message || "Failed to save invoice")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred while saving")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading && !isEdit) return <Loader fullScreen text="Loading Query Details..." />

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <PageHeader
                title={isEdit ? "Edit Invoice" : "Create New Invoice"}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Invoices', href: '/invoices/client' },
                    { label: isEdit ? 'Edit' : 'Create' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="card space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Select Query"
                                name="queryId"
                                value={formData.queryId}
                                options={queries}
                                onChange={(e) => setFormData(prev => ({ ...prev, queryId: e.target.value }))}
                                required
                                disabled={isEdit || !!routeQueryId}
                            />
                            <Input
                                label="Invoice Number"
                                name="invoiceNo"
                                value={formData.invoiceNo}
                                onChange={handleInputChange}
                                placeholder="INV-2024-001"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="date"
                                label="Invoice Date"
                                name="invoiceDate"
                                value={formData.invoiceDate}
                                onChange={handleInputChange}
                                required
                            />
                            <Select
                                label="Currency"
                                name="currencyId"
                                value={formData.currencyId}
                                options={currencies}
                                onChange={(e) => setFormData(prev => ({ ...prev, currencyId: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="date"
                                label="Due Date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
                            <Select
                                label="Payment Status"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                options={[
                                    { value: 'Pending', label: 'Pending' },
                                    { value: 'Confirmed', label: 'Confirmed' },
                                    { value: 'Settled', label: 'Settled / Received' }
                                ]}
                                onChange={handleInputChange}
                            />
                            {(formData.paymentStatus === 'Settled' || formData.paymentStatus === 'Confirmed') && (
                                <Select
                                    label="Payment Method"
                                    value={paymentMethod}
                                    options={[
                                        { value: 'Bank Account in India', label: 'Bank Account in India' },
                                        { value: 'Bank account overseas', label: 'Bank Account Overseas' }
                                    ]}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                />
                            )}
                        </div>

                        {(formData.paymentStatus === 'Settled' || formData.paymentStatus === 'Confirmed') && (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-gray-700">Financial Adjustments</h4>
                                    <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600">
                                        <input
                                            type="checkbox"
                                            checked={isNettMode}
                                            onChange={(e) => setIsNettMode(e.target.checked)}
                                        />
                                        Manual (Nett) Mode
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="number"
                                        label="Rate of Exchange (ROE)"
                                        value={rateOfExchange}
                                        onChange={(e) => setRateOfExchange(e.target.value)}
                                        placeholder="1.0"
                                        disabled={isNettMode}
                                    />
                                    {paymentMethod === 'Bank account overseas' && (
                                        <Input
                                            type="number"
                                            label="Remittance Charge"
                                            value={remittanceCharge}
                                            onChange={(e) => setRemittanceCharge(e.target.value)}
                                            disabled={isNettMode}
                                        />
                                    )}
                                </div>

                                {paymentMethod === 'Bank Account in India' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50 p-3 rounded">
                                        <div>
                                            <span className="text-xs text-gray-500 block">GST (5%)</span>
                                            <span className="font-semibold">{gstAmount}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 block">Service Charge (18% on GST)</span>
                                            <span className="font-semibold">{serviceCharge}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4 mt-4">
                            <Input
                                type="number"
                                label="Total Amount (USD Budget)"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                type="number"
                                label="Tax/Adj Amount"
                                name="taxAmount"
                                value={formData.taxAmount}
                                onChange={handleInputChange}
                                readOnly={!isNettMode}
                                className={!isNettMode ? "bg-gray-50" : ""}
                            />
                            <Input
                                type="number"
                                label="Net Amount"
                                name="netAmount"
                                value={formData.netAmount}
                                onChange={isNettMode ? handleInputChange : undefined}
                                readOnly={!isNettMode}
                                className={!isNettMode ? "bg-gray-50 font-bold" : "font-bold"}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6">
                            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button type="submit" variant="primary" loading={loading}>
                                {isEdit ? "Update Invoice" : "Generate Invoice"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Overview Sidebar */}
                <div className="space-y-6">
                    {/* Budget Overview */}
                    <div className="card bg-blue-50 border-blue-100">
                        <h3 className="text-blue-900 font-bold text-lg mb-4 flex items-center gap-2">
                            Budget Overview
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center bg-white p-2 rounded border">
                                <span className="text-sm text-gray-500">Total Budget</span>
                                <span className="font-bold text-gray-900">₹{queryBudget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white p-2 rounded border">
                                <span className="text-sm text-gray-500">Invoiced to Date</span>
                                <span className="font-bold text-red-600">₹{totalInvoiced.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-100 p-3 rounded border border-blue-200">
                                <span className="text-sm font-semibold text-blue-900">Remaining Balance</span>
                                <span className={`font-black text-lg ${remainingBudget < formData.totalAmount ? 'text-orange-600' : 'text-blue-900'}`}>
                                    ₹{remainingBudget.toLocaleString()}
                                </span>
                            </div>
                            {remainingBudget < formData.totalAmount && (
                                <div className="text-[11px] text-orange-600 italic mt-1 font-medium bg-orange-50 p-2 rounded border border-orange-100">
                                    ⚠️ Warning: New invoice exceeds remaining budget!
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Query & Client Info */}
                    <div className="card divide-y">
                        <div className="pb-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Query Details</h4>
                            <p className="font-bold text-gray-900">{query?.queryNo || `#${query?.id}`}</p>
                            <p className="text-sm text-gray-600">{query?.adults} Adults, {query?.children} Children</p>
                            <p className="text-sm text-gray-600 italic">{query?.travelDate ? new Date(query.travelDate).toLocaleDateString() : 'Date TBD'}</p>
                        </div>
                        <div className="pt-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Client Information</h4>
                            <p className="font-bold text-gray-900">{client?.firstName} {client?.lastName}</p>
                            <p className="text-sm text-gray-600">{client?.emailId}</p>
                            <p className="text-sm text-gray-600">{client?.mobileNo}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateClientInvoice
