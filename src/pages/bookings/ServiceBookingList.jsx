import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Table from '@components/Table'
import { Eye, Pencil, Trash2, Printer } from 'lucide-react'
import { getAllServiceBookings, getServiceBookingById, manageMiscService } from '@api/booking.api'
import { toast } from 'react-hot-toast'
import ServiceBookingViewModal from '@components/ServiceBookingViewModal'
import ConfirmModal from '@components/ConfirmModal'

const ServiceBookingList = () => {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [isFetchingDetail, setIsFetchingDetail] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

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

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        
        const booking = bookings.find(b => b.serviceId === deleteId)
        
        setIsDeleting(true)
        try {
            // Using ManageMiscService with spType: "D" for deletion
            // Including bookingId as requested
            const response = await manageMiscService({
                serviceId: deleteId,
                bookingId: booking?.bookingId || "",
                spType: "D"
            })
            
            if (response.data?.success) {
                toast.success("Booking deleted successfully")
                fetchBookings()
            } else {
                toast.error(response.data?.message || "Failed to delete booking")
            }
        } catch (error) {
            console.error("Error deleting service booking:", error)
            toast.error("An error occurred while deleting the booking")
        } finally {
            setIsDeleting(false)
            setIsDeleteModalOpen(false)
            setDeleteId(null)
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
                        onClick={() => handleDeleteClick(row.serviceId)}
                        disabled={isDeleting}
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

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Service Booking"
                message="Are you sure you want to delete this service booking? This action cannot be undone."
                isLoading={isDeleting}
            />
        </div>
    )
}

export default ServiceBookingList
