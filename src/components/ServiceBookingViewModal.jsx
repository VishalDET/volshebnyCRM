import { useState, useEffect } from 'react'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { manageCurrency } from '@api/masters.api'

const ServiceBookingViewModal = ({ isOpen, onClose, booking }) => {
    const [currencyName, setCurrencyName] = useState('N/A')

    useEffect(() => {
        const fetchCurrency = async () => {
            if (booking?.currencyId && isOpen) {
                try {
                    const payload = {
                        id: 0,
                        currencyName: "",
                        currencySign: "",
                        isActive: true,
                        isDeleted: false,
                        spType: "R"
                    }
                    const response = await manageCurrency(payload)
                    if (response.data && response.data.data) {
                        const currencies = response.data.data
                        const currency = currencies.find(c => c.id === booking.currencyId)
                        if (currency) {
                            setCurrencyName(`${currency.currencyName} (${currency.currencySign})`)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching currency:', error)
                }
            }
        }
        fetchCurrency()
    }, [booking?.currencyId, isOpen])

    if (!booking) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString()
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Service Booking Details">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Basic Information */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Booking ID</label>
                            <p className="text-secondary-900 font-medium">{booking.bookingId || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Created Date</label>
                            <p className="text-secondary-900">{formatDateTime(booking.createdDate)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Service Type</label>
                            <p className="text-secondary-900">{booking.serviceTypeName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Booking Date</label>
                            <p className="text-secondary-900">{formatDate(booking.bookingDate)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Client Name</label>
                            <p className="text-secondary-900">{booking.clientName || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Supplier Name</label>
                            <p className="text-secondary-900">{booking.supplierName || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Service Details */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Service Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Service Date</label>
                            <p className="text-secondary-900">{formatDate(booking.serviceDate)}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Service Time</label>
                            <p className="text-secondary-900">{booking.serviceTime || 'N/A'}</p>
                        </div>
                        {booking.serviceTypeName?.toLowerCase() === 'hotels' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-600 mb-1">Check-out Date</label>
                                    <p className="text-secondary-900">{formatDate(booking.checkOutDate)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-600 mb-1">Nights</label>
                                    <p className="text-secondary-900">{booking.nights || 0}</p>
                                </div>
                            </>
                        )}
                        {(booking.source || booking.destination) && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-600 mb-1">Source</label>
                                    <p className="text-secondary-900">{booking.source || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-600 mb-1">Destination</label>
                                    <p className="text-secondary-900">{booking.destination || 'N/A'}</p>
                                </div>
                            </>
                        )}
                        {(booking.serviceTypeName?.toLowerCase().includes('restaurant')) && (
                            <div className="col-span-2 flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${booking.isLunch ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm font-medium text-secondary-700">Lunch</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${booking.isDinner ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    <span className="text-sm font-medium text-secondary-700">Dinner</span>
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Adults</label>
                            <p className="text-secondary-900">{booking.adults || 0}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Children</label>
                            <p className="text-secondary-900">{booking.children || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Financial Details */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Financial Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Base Cost</label>
                            <p className="text-secondary-900"> $ {booking.cost || 0}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">ROE</label>
                            <p className="text-secondary-900">{booking.rateOfExchange || 1}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Payment Option</label>
                            <p className="text-secondary-900">{booking.paymentOption || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Tax Option</label>
                            <p className="text-secondary-900">{booking.taxOption || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Service Charge</label>
                            <p className="text-secondary-900">{booking.serviceCharge || 0}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">Remittance Charge</label>
                            <p className="text-secondary-900">{booking.remittanceCharge || 0}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-secondary-600 mb-1">GST Amount</label>
                            <p className="text-secondary-900">{booking.gstAmount || 0}</p>
                        </div>
                        <div className="p-3 bg-primary-50 rounded-lg">
                            <label className="block text-sm font-bold text-primary-700 mb-1">Total Amount (₹)</label>
                            <p className="text-xl font-bold text-primary-600">{booking.totalAmount || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Remarks */}
                <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-3">Remarks</h3>
                    <div className="p-3 bg-gray-50 rounded-lg border">
                        <p className="text-secondary-900 whitespace-pre-wrap">{booking.remarks || 'No remarks provided.'}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t">
                <Button variant="secondary" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    )
}

export default ServiceBookingViewModal
