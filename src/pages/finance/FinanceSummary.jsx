import { useState, useEffect } from 'react'
import PageHeader from '@components/PageHeader'
import { ChevronDown, ChevronUp, DollarSign, TrendingUp, TrendingDown, FileText, Ship } from 'lucide-react'
import { manageQuery } from '@api/query.api'
import { manageClientInvoice } from '@api/clientInvoice.api'
import { manageSupplierInvoice } from '@api/supplierInvoice.api'
import Loader from '@components/Loader'
import Button from '@components/Button'

const FinanceSummary = () => {
    const [queries, setQueries] = useState([])
    const [clientInvoices, setClientInvoices] = useState([])
    const [supplierInvoices, setSupplierInvoices] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedQuery, setExpandedQuery] = useState(null)

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            setLoading(true)
            const [qRes, cRes, sRes] = await Promise.all([
                manageQuery({
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
                }),
                manageClientInvoice({
                    id: 0,
                    queryId: 0,
                    clientId: 0,
                    invoiceNo: "string",
                    invoiceDate: new Date().toISOString(),
                    dueDate: new Date().toISOString(),
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
                    roleId: 0,
                    isActive: true,
                    isDeleted: false,
                    spType: "R"
                }),
                manageSupplierInvoice({
                    id: 0,
                    queryId: 0,
                    supplierId: 0,
                    serviceType: "string",
                    supplierInvNo: "string",
                    invoiceDate: new Date().toISOString(),
                    dueDate: new Date().toISOString(),
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
                    roleId: 0,
                    isActive: true,
                    isDeleted: false,
                    spType: "R"
                })
            ])

            setQueries(qRes.data?.data || [])
            setClientInvoices(cRes.data?.data || [])
            setSupplierInvoices(sRes.data?.data || [])
        } catch (error) {
            console.error("Finance data fetch failed", error)
        } finally {
            setLoading(false)
        }
    }

    // Process data
    const queryWiseData = queries.map(q => {
        const qCInv = clientInvoices.filter(inv => inv.queryId === q.id || inv.queryID === q.id)
        const qSInv = supplierInvoices.filter(inv => inv.queryId === q.id || inv.queryID === q.id)

        const totalRevenue = qCInv.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        const totalExpense = qSInv.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
        const profit = totalRevenue - totalExpense

        return {
            ...q,
            clientInvoices: qCInv,
            supplierInvoices: qSInv,
            totalRevenue,
            totalExpense,
            profit
        }
    })

    const totalRevenue = queryWiseData.reduce((sum, q) => sum + q.totalRevenue, 0)
    const totalExpense = queryWiseData.reduce((sum, q) => sum + q.totalExpense, 0)
    const netProfit = totalRevenue - totalExpense

    const stats = [
        { label: 'Total Revenue', value: totalRevenue, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-50' },
        { label: 'Total Expenditure', value: totalExpense, icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-50' },
        { label: 'Net Profit', value: netProfit, icon: DollarSign, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    ]

    if (loading) return <Loader />

    return (
        <div className="space-y-6 pb-12">
            <PageHeader
                title="Finance Summary"
                subtitle="Query-wise financial breakdown"
                breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Finance' }]}
            />

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl bg-white p-6 shadow-sm">
                {stats.map((stat, i) => (
                    <div key={i} className="border-0 shadow-none flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-secondary-900">${stat.value.toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Query-wise List */}
            <div className="card p-0 overflow-hidden shadow-lg border-secondary-200 rounded-2xl bg-white">
                <div className="bg-primary-800 border-b border-primary-900 px-6 py-4 grid grid-cols-12 gap-4 text-[10px] font-bold text-primary-200 uppercase tracking-widest">
                    <div className="col-span-2">Query No</div>
                    <div className="col-span-3">Client</div>
                    <div className="col-span-2">Travel Date</div>
                    <div className="col-span-2 text-right">Budget</div>
                    <div className="col-span-2 text-right">Profit</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y divide-secondary-100">
                    {queryWiseData.map((query) => (
                        <div key={query.id} className={`transition-all duration-300 ${expandedQuery === query.id ? 'z-10 relative shadow-[0_0_20px_rgba(0,0,0,0.05)]' : ''}`}>
                            {/* Main Row */}
                            <div
                                className={`px-6 py-5 grid grid-cols-12 gap-4 items-center cursor-pointer hover:bg-secondary-50 transition-colors ${expandedQuery === query.id ? 'bg-white' : ''}`}
                                onClick={() => setExpandedQuery(expandedQuery === query.id ? null : query.id)}
                            >
                                <div className="col-span-2 font-bold text-secondary-900">{query.queryNo}</div>
                                <div className="col-span-3 text-sm text-secondary-700">{query.clientName || 'N/A'}</div>
                                <div className="col-span-2 text-sm text-secondary-600">
                                    {query.travelDate ? new Date(query.travelDate).toLocaleDateString() : 'TBD'}
                                </div>
                                <div className="col-span-2 text-right text-sm font-medium text-secondary-700">${(query.budget || 0).toLocaleString()}</div>
                                <div className={`col-span-2 text-right font-black ${query.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${query.profit.toLocaleString()}
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <ChevronUp className={`w-5 h-5 text-secondary-400 transition-transform duration-300 ${expandedQuery === query.id ? 'rotate-0' : 'rotate-180'}`} />
                                </div>
                            </div>

                            {/* Expanded Content */}
                            <div className={`grid transition-all duration-300 ease-in-out ${expandedQuery === query.id ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden">
                                    <div className="bg-white border-t border-secondary-100 px-6 py-8 space-y-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Client Invoices Table */}
                                            <div className="space-y-3">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-secondary-900">
                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                    Client Invoices
                                                </h4>
                                                <div className="bg-secondary-50 rounded-xl overflow-hidden border border-secondary-100">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-secondary-100/50 text-secondary-500 font-bold uppercase tracking-tighter">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left">Inv No</th>
                                                                <th className="px-4 py-2 text-left">Date</th>
                                                                <th className="px-4 py-2 text-right">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-secondary-100">
                                                            {query.clientInvoices.length > 0 ? query.clientInvoices.map(inv => (
                                                                <tr key={inv.id}>
                                                                    <td className="px-4 py-3 font-medium text-secondary-700">{inv.invoiceNo}</td>
                                                                    <td className="px-4 py-3 text-secondary-500">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                                                    <td className="px-4 py-3 text-right font-bold text-secondary-900">${inv.totalAmount.toLocaleString()}</td>
                                                                </tr>
                                                            )) : (
                                                                <tr>
                                                                    <td colSpan="3" className="px-4 py-6 text-center text-secondary-400 italic">No client invoices found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* Supplier Invoices Table */}
                                            <div className="space-y-3">
                                                <h4 className="flex items-center gap-2 text-sm font-bold text-secondary-900">
                                                    <Ship className="w-4 h-4 text-orange-500" />
                                                    Supplier Invoices
                                                </h4>
                                                <div className="bg-secondary-50 rounded-xl overflow-hidden border border-secondary-100">
                                                    <table className="w-full text-xs">
                                                        <thead className="bg-secondary-100/50 text-secondary-500 font-bold uppercase tracking-tighter">
                                                            <tr>
                                                                <th className="px-4 py-2 text-left">Supplier</th>
                                                                <th className="px-4 py-2 text-left">Service</th>
                                                                <th className="px-4 py-2 text-right">Amount</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-secondary-100">
                                                            {query.supplierInvoices.length > 0 ? query.supplierInvoices.map(inv => (
                                                                <tr key={inv.id}>
                                                                    <td className="px-4 py-3 font-medium text-secondary-700 truncate max-w-[120px]">{inv.supplierName || `Supplier #${inv.supplierId}`}</td>
                                                                    <td className="px-4 py-3 text-secondary-500">{inv.serviceType}</td>
                                                                    <td className="px-4 py-3 text-right font-bold text-secondary-900">${inv.totalAmount.toLocaleString()}</td>
                                                                </tr>
                                                            )) : (
                                                                <tr>
                                                                    <td colSpan="3" className="px-4 py-6 text-center text-secondary-400 italic">No supplier invoices found</td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Summary Bar */}
                                        <div className="bg-secondary-900 text-white rounded-2xl p-6 flex justify-between items-center shadow-inner">
                                            <div className="flex gap-12">
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-secondary-400 tracking-widest mb-1">Total Billable</p>
                                                    <p className="text-xl font-black">${query.totalRevenue.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-secondary-400 tracking-widest mb-1">Total Direct Cost</p>
                                                    <p className="text-xl font-black text-red-400">${query.totalExpense.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-secondary-400 tracking-widest mb-1">Net Margin</p>
                                                <p className={`text-3xl font-black ${query.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    ${query.profit.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {queryWiseData.length === 0 && (
                        <div className="py-20 text-center space-y-3">
                            <p className="text-secondary-400 font-medium">No financial records found to analyze.</p>
                            <Button variant="secondary" onClick={() => fetchAllData()}>Refresh Data</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FinanceSummary
