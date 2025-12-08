import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQueries } from '@redux/querySlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'

const QueryList = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { queries, loading } = useSelector((state) => state.query)
    const [filters, setFilters] = useState({ status: '' })

    useEffect(() => {
        dispatch(fetchQueries(filters))
    }, [dispatch, filters])

    const columns = [
        { key: 'id', label: 'Query ID', width: '10%' },
        { key: 'clientName', label: 'Client Name', width: '20%' },
        { key: 'destination', label: 'Destination', width: '15%' },
        { key: 'travelDate', label: 'Travel Date', width: '15%' },
        { key: 'pax', label: 'Pax', width: '10%' },
        {
            key: 'status',
            label: 'Status',
            width: '15%',
            render: (value) => (
                <span className={`badge ${value === 'confirmed' ? 'badge-success' :
                        value === 'pending' ? 'badge-warning' :
                            'badge-info'
                    }`}>
                    {value}
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
                        onClick={() => navigate(`/queries/${row.id}`)}
                        className="text-primary-600 hover:text-primary-700"
                    >
                        View
                    </button>
                    <button
                        onClick={() => navigate(`/queries/${row.id}/details`)}
                        className="text-secondary-600 hover:text-secondary-700"
                    >
                        Edit
                    </button>
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

            <div className="card">
                <div className="mb-4 flex gap-4">
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input w-48"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                <Table
                    columns={columns}
                    data={queries}
                    loading={loading}
                    emptyMessage="No queries found"
                />
            </div>
        </div>
    )
}

export default QueryList
