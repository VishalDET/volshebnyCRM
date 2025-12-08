import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchQueryById } from '@redux/querySlice'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Loader from '@components/Loader'

const ViewQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { currentQuery, loading } = useSelector((state) => state.query)

    useEffect(() => {
        dispatch(fetchQueryById(id))
    }, [dispatch, id])

    if (loading) return <Loader fullScreen text="Loading query..." />
    if (!currentQuery) return <div>Query not found</div>

    return (
        <div>
            <PageHeader
                title={`Query #${currentQuery.id}`}
                subtitle={`Client: ${currentQuery.clientName}`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: `Query #${id}` }
                ]}
                actions={
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate(`/queries/${id}/details`)}>
                            Edit Details
                        </Button>
                        <Button variant="primary" onClick={() => navigate(`/queries/${id}/confirm`)}>
                            Confirm Query
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-secondary-600">Name</dt>
                                <dd className="font-medium">{currentQuery.clientName}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Email</dt>
                                <dd className="font-medium">{currentQuery.email}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Phone</dt>
                                <dd className="font-medium">{currentQuery.phone}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Destination</dt>
                                <dd className="font-medium">{currentQuery.destination}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Travel Details</h3>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-secondary-600">Travel Date</dt>
                                <dd className="font-medium">{currentQuery.travelDate}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Return Date</dt>
                                <dd className="font-medium">{currentQuery.returnDate}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Adults</dt>
                                <dd className="font-medium">{currentQuery.adults}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Children</dt>
                                <dd className="font-medium">{currentQuery.children}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Budget</dt>
                                <dd className="font-medium">₹{currentQuery.budget?.toLocaleString()}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Status</h3>
                        <span className={`badge ${currentQuery.status === 'confirmed' ? 'badge-success' :
                                currentQuery.status === 'pending' ? 'badge-warning' :
                                    'badge-info'
                            }`}>
                            {currentQuery.status}
                        </span>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/queries/${id}/pax`)}>
                                Manage Passengers
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/vouchers`)}>
                                Generate Voucher
                            </Button>
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/invoices/client/create`)}>
                                Create Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewQuery
