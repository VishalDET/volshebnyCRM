import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { Eye, Pencil, Trash2, CheckCircle } from 'lucide-react'
import ConfirmModal from '@components/ConfirmModal'
import { manageQuery } from '@api/query.api'
import { toast } from 'react-hot-toast'

const QueryList = () => {
    const navigate = useNavigate()
    const { search } = useLocation()
    const urlStatus = new URLSearchParams(search).get('status')

    const [queries, setQueries] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [filters, setFilters] = useState({ status: urlStatus || '' })

    useEffect(() => {
        if (urlStatus) {
            setFilters({ status: urlStatus })
        }
    }, [urlStatus])

    useEffect(() => {
        fetchQueries()
    }, [filters])

    const [deleteId, setDeleteId] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    useEffect(() => {
        fetchQueries()
    }, [filters])

    const fetchQueries = async () => {
        setIsLoading(true)
        try {
            const payload = {
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
                queryStatus: filters.status || "",
                specialRequirements: "",
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R",
                destinations: [],
                childAges: []
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
        { key: 'queryNo', label: 'Query No', width: '15%' },
        {
            key: 'clientName',
            label: 'Client',
            width: '20%',
            render: (_, row) => row.clientName || `Client #${row.clientId}`
        },
        {
            key: 'travelDate',
            label: 'Travel Date',
            width: '15%',
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        { key: 'totalDays', label: 'Days', width: '10%' },
        {
            key: 'pax',
            label: 'Pax',
            width: '10%',
            render: (_, row) => `${(row.adults || 0) + (row.children || 0)}`
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
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate(`/queries/viewQuery/${row.id}`)}
                        className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors"
                        title="View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate(`/queries/edit/${row.id}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDeleteClick(row.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {(!row.queryStatus || row.queryStatus === 'Pending') && (
                        <button
                            onClick={() => navigate(`/queries/${row.id}/confirm`)}
                            className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Confirm Query"
                        >
                            <CheckCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )
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
                    <Button variant="primary" onClick={() => navigate('/queries/create')}>
                        + Create Query
                    </Button>
                }
            />

            <div className="card mt-4">
                <div className="mb-4 flex gap-4 pt-0 pb-4 border-b">
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
