import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Input from '@components/Input'
import Select from '@components/Select'
import { manageSupplierInvoice, getSupplierInvoiceById } from '@api/supplierInvoice.api'
import { manageQuery, manageConfirmQuery } from '@api/query.api'
import { manageSupplier, manageCurrency, manageServiceType } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'

const CreateSupplierInvoice = () => {
    const { id, queryId: routeQueryId } = useParams()
    const navigate = useNavigate()
    const isEdit = !!id

    // State
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)
    const [query, setQuery] = useState(null)
    const [suppliers, setSuppliers] = useState([]) // Master list
    const [querySupplierIds, setQuerySupplierIds] = useState(null)
    const [currencies, setCurrencies] = useState([])
    const [serviceTypes, setServiceTypes] = useState([])
    const [queries, setQueries] = useState([])
    const [existingInvoices, setExistingInvoices] = useState([])

    const [formData, setFormData] = useState({
        id: 0,
        queryId: routeQueryId ? parseInt(routeQueryId) : 0,
        supplierId: 0,
        serviceType: "",
        supplierInvNo: "",
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        currencyId: 0,
        isDomestic: true,
        totalAmount: 0,
        gst: 0,
        serviceCharge: 0,
        remittance: 0,
        rateOfExchange: 1,
        paymentMethod: "",
        comments: "",
        netAmount: 0,
        paymentStatus: "Unpaid",
        userId: 0,
        spType: "C"
    })

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
        }
    }, [id, isEdit])

    const fetchMetadata = async () => {
        try {
            // Fetch Currencies
            const curRes = await manageCurrency({
                id: 0,
                currencyCode: "",
                currencyName: "",
                spType: "R"
            })
            setCurrencies((curRes.data?.data || []).map(c => ({
                value: c.id || c.currencyId,
                label: c.currencyName
            })))

            // Fetch Suppliers
            const supRes = await manageSupplier({
                id: 0,
                supplierName: "",
                supplierType: "",
                spType: "R"
            })
            setSuppliers((supRes.data?.data || []).map(s => ({
                value: s.id,
                label: s.companyName || s.supplierName || s.fullName || `Supplier #${s.id}`
            })))

            // Fetch Service Types
            const serRes = await manageServiceType({
                id: 0,
                serviceName: "",
                spType: "R"
            })
            setServiceTypes((serRes.data?.data || []).map(s => ({
                value: s.serviceName,
                label: s.serviceName
            })))
        } catch (error) {
            console.error("Metadata fetch failed", error)
        }

        // Fetch Queries for selection
        try {
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
        } catch (err) {
            console.error("Query fetch failed", err)
        }
    }

    const fetchInvoiceData = async () => {
        try {
            const res = await getSupplierInvoiceById(id)
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) {
                const qId = data.queryId || data.queryID || 0
                setFormData({
                    ...data,
                    queryId: qId,
                    invoiceDate: data.invoiceDate?.split('T')[0],
                    dueDate: data.dueDate?.split('T')[0],
                    spType: "U"
                })
                if (qId) {
                    fetchQueryData(qId)
                    fetchExistingInvoices(qId)
                }
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
                spType: "R",
                destinations: [],
                childAges: []
            }
            const res = await manageQuery(payload)
            const qData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (qData) {
                setQuery(qData)
                // If query is confirmed, fetch suppliers from the query
                await fetchQuerySuppliers(qId)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setInitialLoading(false)
        }
    }

    const fetchQuerySuppliers = async (qId) => {
        try {
            const payload = {
                queryId: parseInt(qId),
                isVisaIncluded: true,
                finalItinerary: "",
                miscellaneous: "",
                spType: "E",
                tourLeads: [],
                services: [],
                guides: []
            }
            const res = await manageConfirmQuery(payload)
            const confirmedData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data

            if (confirmedData) {
                const ids = new Set()
                if (confirmedData.services) {
                    confirmedData.services.forEach(s => { if (s.supplierId) ids.add(s.supplierId) })
                }
                if (confirmedData.guides) {
                    confirmedData.guides.forEach(g => { if (g.supplierId) ids.add(g.supplierId) })
                }
                if (ids.size > 0) {
                    setQuerySupplierIds(ids)
                }
            }
        } catch (error) {
            console.error("Failed to fetch query suppliers", error)
        }
    }

    const filteredSuppliers = querySupplierIds
        ? suppliers.filter(s => querySupplierIds.has(s.value))
        : suppliers

    const fetchExistingInvoices = async (qId) => {
        try {
            const payload = {
                id: 0,
                queryId: parseInt(qId),
                supplierId: 0,
                serviceType: "string",
                supplierInvNo: "string",
                invoiceDate: null,
                dueDate: null,
                currencyId: 0,
                isDomestic: true,
                totalAmount: 0,
                gst: 0,
                serviceCharge: 0,
                remittance: 0,
                rateOfExchange: 0,
                paymentMethod: "string",
                comments: "string",
                netAmount: 0,
                paymentStatus: "string",
                userId: 0,
                spType: "R"
            }
            const res = await manageSupplierInvoice(payload)
            const invoices = res.data?.data || []
            setExistingInvoices(isEdit ? invoices.filter(inv => inv.id !== parseInt(id)) : invoices)
        } catch (error) {
            console.error("fetchExistingInvoices failed", error)
        }
    }

    const totalInvoiced = existingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const budget = query?.budget || 0

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const updated = { ...prev, [name]: value }

            // Recalculate netAmount if any component changes
            if (['totalAmount', 'gst', 'serviceCharge'].includes(name)) {
                const total = parseFloat(name === 'totalAmount' ? value : prev.totalAmount) || 0
                const gst = parseFloat(name === 'gst' ? value : prev.gst) || 0
                const sc = parseFloat(name === 'serviceCharge' ? value : prev.serviceCharge) || 0
                updated.netAmount = total + gst + sc
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
                supplierId: parseInt(formData.supplierId) || 0,
                serviceType: formData.serviceType || "string",
                supplierInvNo: formData.supplierInvNo || "string",
                invoiceDate: new Date(formData.invoiceDate).toISOString(),
                dueDate: new Date(formData.dueDate).toISOString(),
                currencyId: parseInt(formData.currencyId) || 0,
                isDomestic: formData.isDomestic,
                totalAmount: parseFloat(formData.totalAmount) || 0,
                gst: parseFloat(formData.gst) || 0,
                serviceCharge: parseFloat(formData.serviceCharge) || 0,
                remittance: parseFloat(formData.remittance) || 0,
                rateOfExchange: parseFloat(formData.rateOfExchange) || 0,
                paymentMethod: formData.paymentMethod || "string",
                comments: formData.comments || "string",
                netAmount: parseFloat(formData.netAmount) || 0,
                paymentStatus: formData.paymentStatus || "Unpaid",
                userId: 0,
                spType: isEdit ? "U" : "C"
            }
            const res = await manageSupplierInvoice(payload)
            if (res.data?.success) {
                toast.success(isEdit ? "Invoice updated" : "Invoice created")
                navigate(formData.queryId ? `/invoices/supplier/query/${formData.queryId}` : '/invoices/supplier')
            } else {
                toast.error(res.data?.message || "Failed to save")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading && isEdit) return <Loader fullScreen text="Loading details..." />

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <PageHeader
                title={isEdit ? "Edit Supplier Invoice" : "Create Supplier Invoice"}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Supplier Invoices', href: '/invoices/supplier' },
                    { label: isEdit ? 'Edit' : 'Create' }
                ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2">
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
                            <Select
                                label="Supplier"
                                name="supplierId"
                                value={formData.supplierId}
                                options={filteredSuppliers}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Service Type"
                                name="serviceType"
                                value={formData.serviceType}
                                options={serviceTypes}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                label="Supplier Invoice No"
                                name="supplierInvNo"
                                value={formData.supplierInvNo}
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                            <Select
                                label="Payment Status"
                                name="paymentStatus"
                                value={formData.paymentStatus}
                                options={[
                                    { value: 'Unpaid', label: 'Unpaid' },
                                    { value: 'Paid', label: 'Paid' },
                                    { value: 'Partially Paid', label: 'Partially Paid' },
                                    { value: 'Overdue', label: 'Overdue' }
                                ]}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Payment Method"
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleInputChange}
                                placeholder="Bank Transfer, Cash, etc."
                            />
                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    type="checkbox"
                                    id="isDomestic"
                                    name="isDomestic"
                                    checked={formData.isDomestic}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isDomestic: e.target.checked }))}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="isDomestic" className="text-sm font-medium text-gray-700 underline-offset-4 cursor-pointer">
                                    Domestic Payment
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 border-t pt-4">
                            <Input
                                type="number"
                                label="Total Amount"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                type="number"
                                label="GST"
                                name="gst"
                                value={formData.gst}
                                onChange={handleInputChange}
                            />
                            <Input
                                type="number"
                                label="Service Charge"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleInputChange}
                            />
                            <Input
                                type="number"
                                label="Net Amount"
                                name="netAmount"
                                value={formData.netAmount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                type="number"
                                label="Remittance"
                                name="remittance"
                                value={formData.remittance}
                                onChange={handleInputChange}
                            />
                            <Input
                                type="number"
                                label="Rate of Exchange"
                                name="rateOfExchange"
                                value={formData.rateOfExchange}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <Input
                                label="Comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                placeholder="Additional details..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                            <Button type="submit" variant="primary" loading={loading}>
                                {isEdit ? "Update Invoice" : "Create Invoice"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="card bg-secondary-900 text-white p-6 sticky top-24 shadow-xl border-0">
                        <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                            Cost Summary
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <span className="text-xs text-secondary-400 block uppercase font-bold tracking-widest mb-1">Target Query</span>
                                <span className="text-lg font-semibold text-secondary-100">{query?.queryNo || (query?.id ? `#${query.id}` : 'None Selected')}</span>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-secondary-400 block uppercase font-bold tracking-widest mb-1">Query Budget</span>
                                    <span className="text-2xl font-black text-white">₹{budget.toLocaleString()}</span>
                                </div>

                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-xs text-secondary-400 block uppercase font-bold tracking-widest mb-1">Total Purchase Cost</span>
                                    <span className="text-2xl font-black text-red-400">₹{totalInvoiced.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <span className="text-xs text-secondary-400 block uppercase font-bold tracking-widest mb-1">Current Invoice</span>
                                        <span className="text-2xl font-black text-blue-400">₹{(parseFloat(formData.totalAmount) || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-4 space-y-3">
                        <h4 className="text-sm font-bold text-secondary-900 border-b pb-2">Query Details</h4>
                        {query ? (
                            <div className="space-y-2 text-sm text-secondary-600">
                                <p><span className="font-medium">Client:</span> {query.clientName}</p>
                                <p><span className="font-medium">Travel Date:</span> {query.travelDate ? new Date(query.travelDate).toLocaleDateString() : 'TBD'}</p>
                                <p><span className="font-medium">Pax:</span> {query.adults}A + {query.children}C</p>
                            </div>
                        ) : (
                            <p className="text-sm text-secondary-400 italic">Select a query to see details</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateSupplierInvoice
