import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { Eye, Pencil, Trash2, CheckCircle, Settings } from 'lucide-react'
import ConfirmModal from '@components/ConfirmModal'
import { manageQuery } from '@api/query.api'
import { manageCountry } from '@api/masters.api'
import { toast } from 'react-hot-toast'
import { useAuth } from '@hooks/useAuth'

const QueryList = () => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const urlStatus = new URLSearchParams(search).get('status')
    const { user } = useAuth()

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    };

    const [queries, setQueries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [countries, setCountries] = useState([])
    const [filters, setFilters] = useState({ 
        status: urlStatus || '',
        countryId: '' 
    })

    useEffect(() => {
        if (urlStatus) {
            setFilters(prev => ({ ...prev, status: urlStatus }))
        }
    }, [urlStatus])

    useEffect(() => {
        if (user?.officeId === 1) {
            fetchCountries()
        }
    }, [user])

    const fetchCountries = async () => {
        try {
            const res = await manageCountry({ spType: 'R' })
            setCountries(res.data?.data || [])
        } catch (error) {
            console.error("Error fetching countries:", error)
        }
    }

    const [deleteId, setDeleteId] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    useEffect(() => {
        fetchQueries()
    }, [filters, user])

    const fetchQueries = async () => {
        if (!user) return
        
        setIsLoading(true)
        try {
            // Determine the officeCountryId to pass
            // For HQ (officeId 1), use the selected filter countryId or 0 for all
            // For others, use their own countryId
            const officeCountryId = user.officeId === 1
                ? (filters.countryId ? parseInt(filters.countryId) : 0) 
                : (user.countryId || 0)

            // Determine the status filter
            // HQ can see all, branch offices only see Confirmed
            const queryStatus = user.officeId === 1 ? filters.status : "Confirmed"

            const payload = {
                id: 0,
                queryNo: "",
                handlerId: 0,
                clientId: 0,
                originCountryId: 0, // Using officeCountryId for filtering as per user request
                originCityId: 0,
                travelDate: null,
                returnDate: null,
                totalDays: 0,
                adults: 0,
                children: 0,
                infants: 0,
                budget: 0,
                queryStatus: queryStatus || "",
                specialRequirements: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R",
                destinations: [],
                childAges: [],
                officeId: user.officeId === 1 ? 0 : (user.officeId || 0),
                officeCountryId: officeCountryId
            }

            const response = await manageQuery(payload)
            const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
            setQueries(data)
        } catch (error) {
            console.error("Error fetching queries:", error)
            toast.error("Failed to fetch queries")
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const payload = {
                id: deleteId,
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
                isActive: false,
                spType: "D",
                destinations: [],
                childAges: []
            }

            const response = await manageQuery(payload)
            if (response.data && (response.data.success || response.status === 200)) {
                toast.success("Query deleted successfully")
                fetchQueries()
            } else {
                toast.error(response.data?.message || "Failed to delete query")
            }
        } catch (error) {
            console.error("Error deleting query:", error)
            toast.error("Failed to delete query")
        } finally {
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        }
    }

    const columns = [
        {
            key: 'queryNo',
            label: 'Query No',
            width: '15%',
            render: (val, row) => val || row.queryId || row.id || '-'
        },
        {
            key: 'clientName',
            label: 'Client',
            width: '20%',
            render: (_, row) => row.clientName || row.tourLeads?.[0]?.leadName || `Client #${row.clientId || '-'}`
        },
        {
            key: 'travelDate',
            label: 'Travel Date',
            width: '15%',
            render: (_, row) => {
                const date = row.travelDate || row.services?.[0]?.serviceDate || row.services?.[0]?.checkInDate;
                return formatDate(date);
            }
        },
        { key: 'totalDays', label: 'Days', width: '10%' },
        {
            key: 'pax',
            label: 'Pax',
            width: '10%',
            render: (_, row) => {
                if (row.adults !== undefined) return (row.adults || 0) + (row.children || 0);
                return row.tourLeads?.length || 0;
            }
        },
        {
            key: 'queryStatus',
            label: 'Status',
            width: '15%',
            render: (value) => (
                <span className={`badge ${(value || '').toLowerCase() === 'confirmed' ? 'badge-success' :
                    (value || '').toLowerCase() === 'pending' ? 'badge-warning' :
                        'badge-info'
                    }`}>
                    {value || 'Pending'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '15%',
            render: (_, row) => {
                const id = row.queryId || row.id;
                return (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/queries/viewQuery/${id}`)}
                            className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors"
                            title="View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => navigate(`/queries/${id}/confirm`)}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Manage Services"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        {user?.officeId === 1 && (
                            <>
                                <button
                                    onClick={() => navigate(`/queries/edit/${id}`)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                {(!row.queryStatus || row.queryStatus === 'Pending') && (
                                    <button
                                        onClick={() => navigate(`/queries/${id}/confirm`)}
                                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                                        title="Confirm Query"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )
            }
        },
    ]

    return (
        <div>
            <PageHeader
                title="Queries"
                subtitle="Manage all travel queries"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries' }
                ]}
                actions={
                    user?.officeId === 1 && (
                        <Button variant="primary" onClick={() => navigate('/queries/create')}>
                            + Create Query
                        </Button>
                    )
                }
            />

            <div className="card mt-4">
                <div className="mb-4 flex gap-4 pt-0 pb-4 border-b">
                    {user?.officeId === 1 ? (
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="input w-48"
                        >
                            <option value="">All Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    ) : (
                        <div className="flex items-center px-4 bg-green-50 rounded-lg border border-green-200 text-sm font-medium text-green-700">
                            Status: Confirmed Only
                        </div>
                    )}

                    {user?.officeId === 1 ? (
                        <select
                            value={filters.countryId}
                            onChange={(e) => setFilters({ ...filters, countryId: e.target.value })}
                            className="input w-48"
                        >
                            <option value="">All Countries</option>
                            {countries.map((c, idx) => (
                                <option key={c.id || c.countryId || idx} value={c.id || c.countryId}>{c.countryName}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="flex items-center px-4 bg-blue-50 rounded-lg border border-blue-200 text-sm font-medium text-blue-700">
                            Office: {user?.countryName || user?.countryId || 'Your Country'}
                        </div>
                    )}
                </div>

                <Table
                    columns={columns}
                    data={queries}
                    isLoading={isLoading}
                    emptyMessage="No queries found"
                />
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Query"
                message="Are you sure you want to delete this query? This action cannot be undone."
            />
        </div>
    )
}

export default QueryList
