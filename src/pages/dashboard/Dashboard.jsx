import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, CheckCircle2, DollarSign, Clock, TrendingUp, TrendingDown, Users, Ship, Flag, Calendar } from 'lucide-react'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Select from '@components/Select'
import { getGeneralStats, getClientStats, getSupplierStats, getFinancialReport } from '@api/dashboard.api'
import { manageQuery } from '@api/query.api'
import { manageClientInvoice } from '@api/clientInvoice.api'
import { manageSupplierInvoice } from '@api/supplierInvoice.api'

/**
 * Dashboard Page
 */
const Dashboard = () => {
    const [generalStats, setGeneralStats] = useState(null)
    const [clientStats, setClientStats] = useState([])
    const [supplierStats, setSupplierStats] = useState(null)
    const [financialReport, setFinancialReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState({
        filterType: "All",
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
    })

    // Advanced Widget State
    const [upcomingTours, setUpcomingTours] = useState([])
    const [ongoingTours, setOngoingTours] = useState([])
    const [recentTours, setRecentTours] = useState([])
    const [activeTourTab, setActiveTourTab] = useState('Upcoming')
    const [tourDays, setTourDays] = useState(7)
    const [pendingInvoices, setPendingInvoices] = useState([])
    const [recentActivity, setRecentActivity] = useState([])
    const [isRightColLoading, setIsRightColLoading] = useState(false)

    useEffect(() => {
        fetchInitialData()
        fetchAdvancedWidgets()
    }, [])

    useEffect(() => {
        fetchFinancialData()
    }, [filter])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            const [genRes, clientRes, supRes] = await Promise.all([
                getGeneralStats(),
                getClientStats(),
                getSupplierStats()
            ])
            setGeneralStats(genRes.data?.data)
            setClientStats(clientRes.data?.data || [])
            setSupplierStats(supRes.data?.data)
        } catch (error) {
            console.error('Failed to fetch initial dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAdvancedWidgets = async () => {
        try {
            setIsRightColLoading(true)
            const [qRes, cRes, sRes] = await Promise.all([
                manageQuery({ id: 0, queryNo: "", handlerId: 0, clientId: 0, originCountryId: 0, originCityId: 0, travelDate: null, returnDate: null, totalDays: 0, adults: 0, children: 0, infants: 0, budget: 0, queryStatus: "", specialRequirements: "", createdBy: 0, modifiedBy: 0, isActive: true, spType: "R", destinations: [], childAges: [] }),
                manageClientInvoice({ id: 0, queryId: 0, clientId: 0, invoiceNo: "string", invoiceDate: new Date().toISOString(), dueDate: new Date().toISOString(), currencyId: 0, isDomestic: true, totalAmount: 0, gst: 0, serviceCharge: 0, remittance: 0, rateOfExchange: 0, paymentMethod: "string", comments: "string", netAmount: 0, paymentStatus: "string", userId: 0, roleId: 0, isActive: true, isDeleted: false, spType: "R" }),
                manageSupplierInvoice({ id: 0, queryId: 0, supplierId: 0, serviceType: "", supplierInvNo: "", invoiceDate: new Date().toISOString(), dueDate: new Date().toISOString(), currencyId: 0, isDomestic: true, totalAmount: 0, gst: 0, serviceCharge: 0, bankName: "", bankDetails: "", remittance: 0, rateOfExchange: 0, paymentMethod: "", comments: "", netAmount: 0, paymentStatus: "", userId: 0, roleId: 0, isActive: true, isDeleted: false, spType: "R" })
            ])

            const allQueries = qRes.data?.data || []
            const allClientInvoices = cRes.data?.data || []
            const allSupplierInvoices = sRes.data?.data || []

            // 1. Process Tours (Confirmed queries)
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const confirmedQueries = allQueries
                .filter(q => q.queryStatus === 'Confirmed' && q.travelDate)
                .map(q => {
                    const travelDate = new Date(q.travelDate)
                    travelDate.setHours(0, 0, 0, 0)
                    // Calculate return date if not present, default to travelDate + totalDays or + 1
                    let returnDate = q.returnDate ? new Date(q.returnDate) : null
                    if (!returnDate && q.totalDays) {
                        returnDate = new Date(travelDate)
                        returnDate.setDate(returnDate.getDate() + q.totalDays)
                    } else if (!returnDate) {
                        returnDate = new Date(travelDate) // Fallback same day
                    }
                    returnDate.setHours(23, 59, 59, 999)

                    return { ...q, travelDate, returnDate }
                })

            // Ongoing: Started before or today, Ends today or later
            const ongoing = confirmedQueries.filter(q => q.travelDate <= today && q.returnDate >= today)
            setOngoingTours(ongoing)

            // Upcoming: Starts after today
            const upcoming = confirmedQueries
                .filter(q => q.travelDate > today)
                .sort((a, b) => a.travelDate - b.travelDate)
            setUpcomingTours(upcoming)

            // Recently Closed: Ended before today (last 30 days)
            const recentLimit = new Date(today)
            recentLimit.setDate(today.getDate() - 30)
            const recent = confirmedQueries
                .filter(q => q.returnDate < today && q.returnDate >= recentLimit)
                .sort((a, b) => b.returnDate - a.returnDate)
            setRecentTours(recent)

            // 2. Pending Invoices (Not Paid)
            const pending = allClientInvoices
                .filter(inv => (inv.paymentStatus || '').toLowerCase() !== 'paid')
                .sort((a, b) => new Date(a.dueDate || a.invoiceDate) - new Date(b.dueDate || b.invoiceDate))
            setPendingInvoices(pending)

            // 3. Recent Activity (Combined latest created/updated items)
            const activity = [
                ...allQueries.slice(0, 5).map(q => ({ type: 'query', title: `New Query: ${q.queryNo}`, desc: `Client: ${q.clientName || 'N/A'}`, date: q.createdDate || q.travelDate, id: q.id })),
                ...allClientInvoices.slice(0, 5).map(inv => ({ type: 'invoice', title: `Invoice Generated: ${inv.invoiceNo}`, desc: `Client: $${inv.totalAmount.toLocaleString()}`, date: inv.invoiceDate, id: inv.id })),
                ...allSupplierInvoices.slice(0, 5).map(inv => ({ type: 'supplier', title: `Supplier Bill: ${inv.supplierInvNo}`, desc: `Supplier: ${inv.supplierName || 'N/A'}`, date: inv.invoiceDate, id: inv.id }))
            ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

            setRecentActivity(activity)

        } catch (error) {
            console.error('Failed to fetch advanced widget data:', error)
        } finally {
            setIsRightColLoading(false)
        }
    }

    const fetchFinancialData = async () => {
        try {
            const res = await getFinancialReport(filter)
            setFinancialReport(res.data?.data)
        } catch (error) {
            console.error('Failed to fetch financial report:', error)
        }
    }

    const financialCards = [
        {
            title: 'Total Revenue',
            value: `$${financialReport?.totalRevenue?.toLocaleString() || 0}`,
            icon: TrendingUp,
            color: 'bg-green-100 text-green-600',
        },
        {
            title: 'Total Expenditure',
            value: `$${financialReport?.totalExpenditure?.toLocaleString() || 0}`,
            icon: TrendingDown,
            color: 'bg-red-100 text-red-600',
        },
        {
            title: 'Profit (BT)',
            value: `$${financialReport?.profitBeforeTax?.toLocaleString() || 0}`,
            icon: DollarSign,
            color: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Profit (AT)',
            value: `$${financialReport?.profitAfterTax?.toLocaleString() || 0}`,
            icon: CheckCircle2,
            color: 'bg-purple-100 text-purple-600',
        },
    ]

    const queryStatusStats = generalStats?.queryStats || []
    const clientInvoices = generalStats?.clientInvoices || { count: 0, totalValue: 0 }
    const supplierInvoices = generalStats?.supplierInvoices || { count: 0, totalValue: 0 }

    // Prepare Supplier Nightingale (Rose) Chart Data
    const SUPPLIER_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981']; // Indigo, Pink, Violet, Cyan, Emerald
    const supplierChartData = (() => {
        const suppliers = supplierStats?.bySupplier || [];
        const total = suppliers.reduce((sum, s) => sum + s.amount, 0) || 0;
        if (total === 0) return [];

        const topSuppliers = suppliers.slice(0, 5); // Take top 5
        const othersAmount = suppliers.slice(5).reduce((sum, s) => sum + s.amount, 0);

        let data = topSuppliers.map((s, i) => ({
            name: s.supplierName,
            value: s.amount,
            percentage: (s.amount / total) * 100,
            color: SUPPLIER_COLORS[i % SUPPLIER_COLORS.length]
        }));

        if (othersAmount > 0) {
            data.push({
                name: 'Others',
                value: othersAmount,
                percentage: (othersAmount / total) * 100,
                color: '#94a3b8' // Slate for others
            });
        }

        const maxValue = Math.max(...data.map(d => d.value));
        const anglePerSlice = 360 / data.length;

        return data.map((d, i) => {
            const startAngle = i * anglePerSlice;
            const endAngle = (i + 1) * anglePerSlice;
            // Radius scaling: minimum 30% radius + proportional up to 100%
            const radius = 15.9 * (0.3 + (0.7 * (d.value / maxValue)));

            return { ...d, startAngle, endAngle, radius };
        });
    })();

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
    const months = [
        { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
        { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
        { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
        { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 }
    ]

    return (
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">

            <div className="space-y-8 pb-12 col-span-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <PageHeader
                        title="Dashboard"
                        subtitle="VolshebnyCRM Performance Overview"
                        className="mb-0"
                    />
                    <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-secondary-200 shadow-sm">
                        <Select
                            className="w-32 border-0 bg-transparent"
                            value={filter.filterType}
                            options={[
                                { label: 'All Time', value: 'All' },
                                { label: 'Yearly', value: 'Yearly' },
                                { label: 'Monthly', value: 'Monthly' }
                            ]}
                            onChange={(e) => setFilter(prev => ({ ...prev, filterType: e.target.value }))}
                        />
                        {filter.filterType !== 'All' && (
                            <Select
                                className="w-28 border-0 bg-transparent"
                                value={filter.year}
                                options={years.map(y => ({ label: y.toString(), value: y }))}
                                onChange={(e) => setFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                            />
                        )}
                        {filter.filterType === 'Monthly' && (
                            <Select
                                className="w-32 border-0 bg-transparent"
                                value={filter.month}
                                options={months}
                                onChange={(e) => setFilter(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                            />
                        )}
                        <Button variant="primary" size="sm" onClick={() => fetchFinancialData()}>
                            <Calendar className="w-4 h-4 mr-2" />
                            Apply
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Financial Stats */}
                        <div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 card
  rounded-2xl
  bg-white
  backdrop-blur-xl
  border border-white/20
  shadow-md
  hover:shadow-lg
  transition-all duration-300
">
                            {financialCards.map((stat, index) => {
                                const Icon = stat.icon
                                return (
                                    <div key={index} className=" mx-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-secondary-400 uppercase tracking-normal mb-1">
                                                    {stat.title}
                                                </p>
                                                <p className="text-sm font-black text-secondary-900">
                                                    {stat.value}
                                                </p>
                                            </div>
                                            <div className={`w-6 h-6 ${stat.color} rounded-2xl flex items-center justify-center shadow-inner`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0  bg-gradient-to-br from-primary-600 to-primary-900 rounded-2xl">
                            {/* Query Counter */}
                            <div className="lg:col-span-3 p-0 overflow-hidden border-0 text-white">
                                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">Query Pipeline</h3>
                                        <p className="text-xs text-secondary-400">Current status of all active leads</p>
                                    </div>
                                    <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-0 text-white">
                                        <Link to="/queries/create">New Query +</Link>
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-white/10">
                                    {queryStatusStats.length > 0 ? queryStatusStats.map((stat, idx) => (
                                        <Link
                                            key={idx}
                                            to={`/queries?status=${stat.status}`}
                                            className="p-8 text-center hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <p className="text-4xl font-black mb-1 group-hover:scale-110 transition-transform">{stat.count}</p>
                                            <p className="text-xs font-bold text-secondary-400 uppercase tracking-widest group-hover:text-white transition-colors">{stat.status}</p>
                                        </Link>
                                    )) : (
                                        <div className="col-span-3 p-12 text-center text-secondary-500 italic">No query data available</div>
                                    )}
                                </div>
                            </div>

                            {/* Invoice Summary */}
                            <div className="card lg:col-span-2 rounded-2xl border-0 bg-gradient-to-br from-primary-600 to-primary-900 text-white shadow-xl relative overflow-hidden">
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className='flex justify-between items-center'>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg"><Users className="w-5 h-5 text-white" /></div>
                                                <div>
                                                    <h4 className="text-xs font-normal opacity-80 uppercase tracking-wider">Client Invoices</h4>
                                                    <p className="text-lg font-black">${clientInvoices.totalValue.toLocaleString()}</p>
                                                    <span className="text-xs opacity-60 font-normal">{clientInvoices.count} Invoices Generated</span>
                                                </div>
                                            </div>
                                            <div className=''>
                                                <Link to="/finance" className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-semibold tracking-wider text-xs text-center hover:bg-secondary-50 transition-colors">View</Link>
                                            </div>
                                        </div>
                                        <div className='flex justify-between items-center'>

                                            <div className="border-t border-white/10 pt-4 flex items-center gap-3">
                                                <div className="p-2 bg-white/20 rounded-lg"><Ship className="w-5 h-5 text-white" /></div>
                                                <div>
                                                    <h4 className="text-xs font-normal opacity-80 uppercase tracking-wider">Supplier Invoices</h4>
                                                    <p className="text-lg font-black">${supplierInvoices.totalValue.toLocaleString()}</p>
                                                    <span className="text-xs opacity-60 font-normal">{supplierInvoices.count} Invoices Received</span>
                                                </div>

                                            </div>
                                            <div className=''>
                                                <Link to="/finance" className="flex-1 bg-white/20 text-white py-2 px-4 rounded-lg font-semibold tracking-wider text-xs text-center hover:bg-secondary-50 transition-colors">View</Link>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="mt-4 flex gap-2">
                                        <Link to="/finance" className="flex-1 bg-white text-primary-700 py-2 rounded-lg font-semibold tracking-wider text-xs text-center hover:bg-secondary-50 transition-colors">TAX REPORT</Link>
                                        <div className="flex-1 bg-white/10 text-white py-2 rounded-lg font-semibold tracking-wider text-xs text-center border border-white/20">GST: ${financialReport?.gsT_Collected?.toLocaleString() || 0}</div>
                                    </div> */}
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Clients by Revenue */}
                            <div className="rounded-2xl bg-white border border-secondary-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                                <div className="p-4 border-b border-secondary-50 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest">Top Clients</h3>
                                        <p className="text-[11px] text-secondary-400 font-medium mt-1">Highest revenue achievers</p>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-xl">
                                        <Flag className="w-4 h-4 text-secondary-500" />
                                    </div>
                                </div>
                                <div className="p-2">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest border-b border-secondary-50">
                                                    <th className="pb-3 pl-4 pt-3">Client</th>
                                                    <th className="pb-3 pt-3">Tours</th>
                                                    <th className="pb-3 pr-4 pt-3 text-right">Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-secondary-50">
                                                {clientStats.slice(0, 5).map((c, i) => (
                                                    <tr key={i} className="group hover:bg-secondary-50/50 transition-colors">
                                                        <td className="py-3 pl-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-105 transition-transform">
                                                                    {c.clientName.charAt(0)}
                                                                </div>
                                                                <span className="text-xs font-bold text-secondary-700 group-hover:text-primary-700 transition-colors">{c.clientName}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-xs font-medium text-secondary-500">{c.noOfTours} Tours</td>
                                                        <td className="py-3 pr-4 text-xs font-black text-secondary-900 text-right">${c.totalRevenue.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Supplier Expenditure */}
                            <div className="rounded-2xl bg-white border border-secondary-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
                                <div className="p-4 border-b border-secondary-50 flex items-center justify-between shrink-0">
                                    <div>
                                        <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest">Supplier Stats</h3>
                                        <p className="text-[11px] text-secondary-400 font-medium mt-1">Expenditure volume by partner</p>
                                    </div>
                                    <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                        <Ship className="w-4 h-4 text-blue-500" />
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-center">
                                    {supplierChartData.length > 0 ? (
                                        <div className="flex items-center gap-8">
                                            {/* Nightingale (Rose) Chart */}
                                            <div className="relative w-32 h-32 shrink-0">
                                                <svg viewBox="0 0 42 42" className="w-full h-full rotate-[-90deg]">
                                                    {supplierChartData.map((d, i) => {
                                                        const startRad = (d.startAngle * Math.PI) / 180;
                                                        const endRad = (d.endAngle * Math.PI) / 180;
                                                        const x1 = 21 + d.radius * Math.cos(startRad);
                                                        const y1 = 21 + d.radius * Math.sin(startRad);
                                                        const x2 = 21 + d.radius * Math.cos(endRad);
                                                        const y2 = 21 + d.radius * Math.sin(endRad);

                                                        // A rx ry x-axis-rotation large-arc-flag sweep-flag x y
                                                        const largeArcFlag = d.endAngle - d.startAngle <= 180 ? "0" : "1";
                                                        const pathData = `
                                                            M 21 21
                                                            L ${x1} ${y1}
                                                            A ${d.radius} ${d.radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                                                            Z
                                                        `;

                                                        return (
                                                            <path
                                                                key={i}
                                                                d={pathData}
                                                                fill={d.color}
                                                                fillOpacity="0.8"
                                                                stroke="white"
                                                                strokeWidth="0.5"
                                                                className="transition-all duration-300 hover:fill-opacity-100 cursor-pointer origin-center hover:scale-105"
                                                            >
                                                                <title>{`${d.name}: $${d.value.toLocaleString()} (${d.percentage.toFixed(1)}%)`}</title>
                                                            </path>
                                                        );
                                                    })}
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="w-3 h-3 bg-white/50 backdrop-blur rounded-full shadow-sm"></div>
                                                </div>
                                            </div>

                                            {/* Custom Legend */}
                                            <div className="flex-1 space-y-3">
                                                {supplierChartData.map((d, i) => (
                                                    <div key={i} className="flex justify-between items-center group cursor-pointer">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }}></div>
                                                            <span className="text-xs font-bold text-secondary-600 group-hover:text-secondary-900 transition-colors line-clamp-1 max-w-[100px]" title={d.name}>{d.name}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs font-black text-secondary-900">${d.value.toLocaleString()}</p>
                                                            <p className="text-[9px] text-secondary-400 font-bold">{d.percentage.toFixed(0)}%</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                                            <div className="w-12 h-12 bg-secondary-50 rounded-full flex items-center justify-center mb-3">
                                                <Ship className="w-5 h-5 text-secondary-300" />
                                            </div>
                                            <p className="text-xs text-secondary-400 font-medium">No supplier expenditure recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <div className='space-y-6 col-span-2'>
                {isRightColLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        {/* Tours Widget */}
                        <div className="card shadow-md border-0 bg-white rounded-2xl">
                            <div className="flex flex-col gap-3 mb-4 border-b pb-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary-500" />
                                        Tour Operations
                                    </h3>
                                    {activeTourTab === 'Upcoming' && (
                                        <div className="flex gap-1">
                                            {[7, 15, 30].map(days => (
                                                <button
                                                    key={days}
                                                    onClick={() => setTourDays(days)}
                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded ${tourDays === days ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-500'}`}
                                                >
                                                    {days}d
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex p-1 bg-secondary-50 rounded-lg">
                                    {['Upcoming', 'Ongoing', 'Recent'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTourTab(tab)}
                                            className={`flex-1 py-1.5 text-[10px] font-bold uppercase transition-all rounded-md ${activeTourTab === tab ? 'bg-white text-secondary-900 shadow-sm' : 'text-secondary-400 hover:text-secondary-600'}`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {activeTourTab === 'Upcoming' && (
                                    <>
                                        {upcomingTours
                                            .filter(t => {
                                                const diff = (t.travelDate - new Date()) / (1000 * 60 * 60 * 24);
                                                return diff <= tourDays;
                                            })
                                            .map((tour, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer group">
                                                    <div>
                                                        <p className="text-xs font-bold text-secondary-900 group-hover:text-primary-700 transition-colors uppercase">{tour.queryNo}</p>
                                                        <p className="text-[10px] text-secondary-500 font-medium">{tour.clientName || 'Walk-in Client'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-secondary-400 uppercase tracking-tighter">
                                                            {tour.travelDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                        </p>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-black uppercase">Upcoming</span>
                                                    </div>
                                                </div>
                                            ))}
                                        {upcomingTours.filter(t => (t.travelDate - new Date()) / (1000 * 60 * 60 * 24) <= tourDays).length === 0 && (
                                            <p className="text-center py-8 text-xs text-secondary-400 italic font-medium">No tours in next {tourDays} days</p>
                                        )}
                                    </>
                                )}

                                {activeTourTab === 'Ongoing' && (
                                    <>
                                        {ongoingTours.map((tour, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-green-50/50 border border-green-100/50 hover:bg-green-50 transition-colors cursor-pointer group">
                                                <div>
                                                    <p className="text-xs font-bold text-secondary-900 group-hover:text-green-700 transition-colors uppercase">{tour.queryNo}</p>
                                                    <p className="text-[10px] text-secondary-500 font-medium">{tour.clientName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-tighter">
                                                        Ends: {tour.returnDate ? tour.returnDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'N/A'}
                                                    </p>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-black uppercase animate-pulse">Live Now</span>
                                                </div>
                                            </div>
                                        ))}
                                        {ongoingTours.length === 0 && (
                                            <p className="text-center py-8 text-xs text-secondary-400 italic font-medium">No live tours currently</p>
                                        )}
                                    </>
                                )}

                                {activeTourTab === 'Recent' && (
                                    <>
                                        {recentTours.map((tour, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-secondary-50 hover:bg-secondary-100 transition-colors cursor-pointer group opacity-75 hover:opacity-100">
                                                <div>
                                                    <p className="text-xs font-bold text-secondary-900 group-hover:text-primary-700 transition-colors uppercase">{tour.queryNo}</p>
                                                    <p className="text-[10px] text-secondary-500 font-medium">{tour.clientName}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-secondary-400 uppercase tracking-tighter">
                                                        Ended: {tour.returnDate ? tour.returnDate.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : 'N/A'}
                                                    </p>
                                                    <span className="text-[9px] px-1.5 py-0.5 bg-secondary-200 text-secondary-600 rounded font-black uppercase">Closed</span>
                                                </div>
                                            </div>
                                        ))}
                                        {recentTours.length === 0 && (
                                            <p className="text-center py-8 text-xs text-secondary-400 italic font-medium">No recent tours found</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Pending Invoices Widget */}
                        <div className="card shadow-md border-0 bg-white rounded-2xl">
                            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4 border-b pb-3 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                Payment Watchlist
                            </h3>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {pendingInvoices.map((inv, idx) => {
                                    const isOverdue = new Date(inv.dueDate || inv.invoiceDate) < new Date();
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-red-50/50 border border-red-100/50 hover:bg-red-50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    <FileText className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-secondary-900 uppercase">{inv.invoiceNo}</p>
                                                    <p className="text-[10px] text-secondary-500 font-medium">${inv.totalAmount.toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {isOverdue ? 'Overdue' : 'Upcoming'}
                                                </p>
                                                <p className="text-[9px] font-bold text-secondary-400 italic">
                                                    {new Date(inv.dueDate || inv.invoiceDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                {pendingInvoices.length === 0 && (
                                    <p className="text-center py-8 text-xs text-secondary-400 italic font-medium">No pending payments</p>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity Widget */}
                        <div className="card shadow-md border-0 bg-white rounded-2xl">
                            <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest mb-4 border-b pb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-500" />
                                Recent Activity
                            </h3>
                            <div className="space-y-2 h-[300px] overflow-y-auto custom-scrollbar pr-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-secondary-100 before:to-transparent">
                                {recentActivity.map((act, idx) => (
                                    <div key={idx} className="relative flex items-center justify-between group bg-primary-500/10 rounded-xl p-2">
                                        <div className="flex items-center w-full gap-3">
                                            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm shrink-0 ${act.type === 'query' ? 'bg-primary-600 text-white' : act.type === 'invoice' ? 'bg-secondary-900 text-white' : 'bg-orange-600 text-white'}`}>
                                                {act.type === 'query' ? <Clock className="w-4 h-4" /> : act.type === 'invoice' ? <FileText className="w-4 h-4" /> : <Ship className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-xs font-bold text-secondary-900 leading-none">{act.title}</h4>
                                                    <span className="text-[9px] text-secondary-400 font-medium whitespace-nowrap">
                                                        {new Date(act.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-secondary-500 mt-1 font-medium">{act.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {recentActivity.length === 0 && (
                                    <p className="text-center py-8 text-xs text-secondary-400 italic font-medium">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    )
}

export default Dashboard
