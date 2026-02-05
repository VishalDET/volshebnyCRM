import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { Eye, Pencil, Trash2, Printer } from 'lucide-react'
import { getAllServiceBookings, getServiceBookingById } from '@api/booking.api'
import { toast } from 'react-hot-toast'
import ServiceBookingViewModal from '@components/ServiceBookingViewModal'

const ServiceBookingList = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isFetchingDetail, setIsFetchingDetail] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        setIsLoading(true)
        try {
            const response = await getAllServiceBookings()
            const data = response.data?.data || []
            setBookings(data)
        } catch (error) {
            console.error("Error fetching service bookings:", error)
            toast.error("Failed to fetch bookings")
        } finally {
            setIsLoading(false)
        }
    }

    const handleView = async (id) => {
        setIsFetchingDetail(true)
        try {
            const response = await getServiceBookingById(id)
            if (response.data?.success && response.data.data && response.data.data.length > 0) {
                setSelectedBooking(response.data.data[0])
                setViewModalOpen(true)
            } else {
                toast.error("Failed to fetch booking details")
            }
        } catch (error) {
            console.error("Error fetching booking details:", error)
            toast.error("Error loading booking details")
        } finally {
            setIsFetchingDetail(false)
        }
    }

    const columns = [
        {
            key: 'serviceId',
            label: 'ID',
            width: '10%'
        },
        {
            key: 'clientName',
            label: 'Client',
            width: '20%',
            render: (value, row) => value || `Client #${row.clientId}`
        },
        {
            key: 'serviceTypeName',
            label: 'Service',
            width: '15%'
        },
        {
            key: 'supplierName',
            label: 'Supplier',
            width: '20%'
        },
        {
            key: 'serviceDate',
            label: 'Service Date',
            width: '15%',
            render: (value) => value ? new Date(value).toLocaleDateString() : '-'
        },
        {
            key: 'cost',
            label: 'Cost',
            width: '10%',
            render: (value) => value ? `$${value}` : '-'
        },
        {
            key: 'actions',
            label: 'Actions',
            width: '10%',
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleView(row.serviceId)}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                        title="View"
                        disabled={isFetchingDetail}
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate(`/service-bookings/edit/${row.serviceId}`)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => window.open(`/service-bookings/print/${row.serviceId}`, '_blank')}
                        className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Print Invoice"
                    >
                        <Printer className="w-4 h-4" />
                    </button>
                    <button
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete"
                        onClick={() => toast.error("Delete functionality not yet implemented")}
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ]

    return (
        <div>
            <PageHeader
                title="Service Bookings"
                subtitle="Manage individual service bookings"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Service Bookings' }
                ]}
                actions={
                    <Button variant="primary" onClick={() => navigate('/service-bookings/create')}>
                        + New Booking
                    </Button>
                }
            />

            <div className="card mt-4">
                <Table
                    columns={columns}
                    data={bookings}
                    isLoading={isLoading}
                    emptyMessage="No service bookings found"
                />
            </div>

            <ServiceBookingViewModal
                isOpen={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                booking={selectedBooking}
            />
        </div>
    )
}

export default ServiceBookingList
