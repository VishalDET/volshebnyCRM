import { useState, useEffect } from 'react'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { X, ExternalLink } from 'lucide-react'
import { manageQuery } from '@api/query.api'
import { manageSupplier, manageCurrency } from '@api/masters.api'

const SupplierInvoiceViewModal = ({ isOpen, onClose, invoice, query, supplierName }) => {
    const [details, setDetails] = useState({
        supplier: null,
        query: null,
        currencySign: null
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && invoice) {
            fetchDetails()
        } else {
            setDetails({ supplier: null, query: null, currencySign: null })
        }
    }, [isOpen, invoice])

    const fetchDetails = async () => {
        setLoading(true)
        try {
            const updates = { ...details }

            // 1. Fetch Supplier if missing (for name)
            if (!supplierName && invoice.supplierId) {
                const res = await manageSupplier({
                    id: parseInt(invoice.supplierId),
                    fullName: "string",
                    companyContactNo: "string",
                    companyEmailId: "string",
                    companyName: "string",
                    gstCertificate: "string",
                    isGSTIN: true,
                    gstNumber: "string",
                    address: "string",
                    countryId: 0,
                    stateId: 0,
                    cityId: 0,
                    roleId: 0,
                    createdBy: 0,
                    modifiedBy: 0,
                    isActive: true,
                    spType: "E",
                    contacts: [{
                        contactId: 0,
                        supplierId: 0,
                        contactName: "string",
                        contactNumber: "string",
                        contactEmail: "string",
                        spType: "string"
                    }],
                    serviceIds: [0]
                })
                updates.supplier = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            }

            // 2. Fetch Query if missing
            if (!query && invoice.queryId) {
                const res = await manageQuery({
                    id: parseInt(invoice.queryId),
                    queryNo: "", handlerId: 0, clientId: 0, originCountryId: 0, originCityId: 0, travelDate: null, returnDate: null, totalDays: 0, adults: 0, children: 0, infants: 0, budget: 0, queryStatus: "", specialRequirements: "", createdBy: 0, modifiedBy: 0, isActive: true, spType: "E", destinations: [], childAges: []
                })
                updates.query = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            }

            // 3. Fetch Currency
            if (invoice.currencyId) {
                const res = await manageCurrency({
                    id: 0, roleId: 0, createdBy: 0, modifiedBy: 0, currencyName: "", currencySign: "", isActive: true, isDeleted: false, spType: "R"
                })
                const curr = res.data?.data?.find(c => c.id === parseInt(invoice.currencyId) || c.currencyId === parseInt(invoice.currencyId))
                updates.currencySign = curr?.currencySign || "$"
            }

            setDetails(updates)
        } catch (error) {
            console.error("Failed to fetch invoice details", error)
        } finally {
            setLoading(false)
        }
    }

    if (!invoice) return null

    const displaySupplierName = supplierName || details.supplier?.companyName || details.supplier?.fullName
    const displayQuery = query || details.query
    const currencySign = details.currencySign || (invoice.currencySign || "$")

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Supplier Invoice: ${invoice.supplierInvNo || `SUP-00${invoice.id}`}`}
            size="lg"
            footer={
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Invoice Info</h4>
                        <div className="space-y-1">
                            <p className="text-sm"><span className="text-gray-500">Date:</span> {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('en-GB') : '-'}</p>
                            <p className="text-sm"><span className="text-gray-500">Due Date:</span> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB') : '-'}</p>
                            <p className="text-sm"><span className="text-gray-500">Method:</span> {invoice.paymentMethod || '-'}</p>
                            <p className="text-sm">
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 badge ${invoice.paymentStatus?.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                    {invoice.paymentStatus || 'Unpaid'}
                                </span>
                            </p>
                            {invoice.isDomestic && (
                                <p className="text-xs font-bold text-blue-600 mt-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                                    Domestic Payment
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Supplier Details</h4>
                        <p className="text-sm font-semibold">{displaySupplierName || (loading ? 'Loading...' : 'Unknown Supplier')}</p>
                        <p className="text-sm text-gray-600">Service: {invoice.serviceType}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Query Context</h4>
                        {displayQuery ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Query #{displayQuery.queryNo || displayQuery.id}</p>
                                <p className="text-sm text-gray-600 truncate max-w-[150px]">{displayQuery.originCityId ? `${displayQuery.originCityId} Trip` : ''}</p>
                                <p className="text-sm text-gray-600">{displayQuery.travelDate ? new Date(displayQuery.travelDate).toLocaleDateString('en-GB') : '-'}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">{loading ? 'Loading...' : 'No query context'}</p>
                        )}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Financial Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">{currencySign}{invoice.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">GST</p>
                            <p className="text-lg font-bold text-blue-600">{currencySign}{invoice.gst?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Service Charge</p>
                            <p className="text-lg font-bold text-blue-600">{currencySign}{invoice.serviceCharge?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold text-blue-600">Net Amount</p>
                            <p className="text-xl font-black text-gray-900">{currencySign}{invoice.netAmount?.toLocaleString()}</p>
                        </div>
                    </div>

                    {(invoice.remittance > 0 || invoice.rateOfExchange > 1) && (
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 text-center">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase">Remittance</p>
                                <p className="text-md font-semibold text-gray-700">{currencySign}{invoice.remittance?.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase">Rate of Exchange</p>
                                <p className="text-md font-semibold text-gray-700">{invoice.rateOfExchange}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments */}
                {invoice.comments && (
                    <div className="pt-4 border-t">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Comments</h4>
                        <p className="text-sm text-gray-700 bg-white p-3 border rounded-lg italic font-inter text-secondary-600">
                            {invoice.comments}
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default SupplierInvoiceViewModal
