import { useState, useEffect } from 'react'
import Modal from '@components/Modal'
import Button from '@components/Button'
import { Printer, X, Download } from 'lucide-react'
import { manageQuery } from '@api/query.api'
import { manageClient, manageCurrency } from '@api/masters.api'

const InvoiceViewModal = ({ isOpen, onClose, invoice, query, client }) => {
    const [details, setDetails] = useState({
        client: null,
        query: null,
        currencySign: null
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && invoice) {
            fetchDetails()
        } else {
            setDetails({ client: null, query: null, currencySign: null })
        }
    }, [isOpen, invoice])

    const fetchDetails = async () => {
        setLoading(true)
        try {
            const updates = { ...details }

            // 1. Fetch Client if missing
            if (!client && invoice.clientId) {
                const res = await manageClient({
                    id: parseInt(invoice.clientId),
                    firstName: "", lastName: "", mobileNo: "", companyName: "", emailId: "", isGSTIN: true, gstNumber: "", gstCertificate: "", address: "", landmark: "", countryId: 0, stateId: 0, cityId: 0, pincode: "", contacts: [], createdBy: 0, modifiedBy: 0, isActive: true, spType: "E"
                })
                updates.client = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            }

            // 2. Fetch Query if missing
            if (!query && invoice.queryId) {
                const res = await manageQuery({
                    id: parseInt(invoice.queryId),
                    queryNo: "", handlerId: 0, clientId: 0, originCountryId: 0, originCityId: 0, travelDate: null, returnDate: null, totalDays: 0, adults: 0, children: 0, infants: 0, budget: 0, queryStatus: "", specialRequirements: "", createdBy: 0, modifiedBy: 0, isActive: true, spType: "E", destinations: [], childAges: []
                })
                updates.query = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            }

            // 3. Fetch Currency (always needed for sign if not passed, assuming parent doesn't pass currency object)
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

    const displayClient = client || details.client
    const displayQuery = query || details.query
    const currencySign = details.currencySign || (invoice.currencySign || "$") // Fallback

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Invoice Details: ${invoice.invoiceNo || `INV-00${invoice.id}`}`}
            size="lg"
            footer={
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Printer size={16} />}
                        onClick={() => window.open(`/invoices/client/preview/${invoice.id}`, '_blank')}
                    >
                        Print Invoice
                    </Button>
                </div>
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
                            <p className="text-sm">
                                <span className="text-gray-500">Status:</span>
                                <span className={`ml-2 badge ${invoice.paymentStatus?.toLowerCase() === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                    {invoice.paymentStatus || 'Unpaid'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Client Details</h4>
                        {displayClient ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">{displayClient.firstName} {displayClient.lastName}</p>
                                <p className="text-sm text-gray-600">{displayClient.email || displayClient.emailId}</p>
                                <p className="text-sm text-gray-600">{displayClient.phone || displayClient.mobileNo}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">{loading ? 'Loading...' : 'No client details available'}</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Query Context</h4>
                        {displayQuery ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Query #{displayQuery.queryNo || displayQuery.id}</p>
                                <p className="text-sm text-gray-600 truncate max-w-[150px]" title={displayQuery.originCityId}>
                                    {displayQuery.destinations?.length > 0 ? displayQuery.destinations.map(d => d.cityName).join(', ') : 'No Destinations'}
                                </p>
                                <p className="text-sm text-gray-600">{displayQuery.travelDate ? new Date(displayQuery.travelDate).toLocaleDateString('en-GB') : 'Date TBD'}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">{loading ? 'Loading...' : 'No query context'}</p>
                        )}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Financial Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-1 border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Subtotal (Budget)</p>
                            <p className="text-2xl font-black text-gray-900">{currencySign}{invoice.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Tax / Adjustments</p>
                            <p className="text-2xl font-black text-blue-600">{currencySign}{invoice.taxAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold text-blue-600">Net Amount</p>
                            <p className="text-3xl font-black text-gray-900">{currencySign}{invoice.netAmount?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Additional Details if available */}
                {(invoice.remarks || invoice.paymentMethod) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        {invoice.paymentMethod && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Payment Method</h4>
                                <p className="text-sm text-gray-700 bg-white p-3 border rounded-lg italic">
                                    {invoice.paymentMethod}
                                </p>
                            </div>
                        )}
                        {invoice.remarks && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Remarks</h4>
                                <p className="text-sm text-gray-700 bg-white p-3 border rounded-lg italic">
                                    {invoice.remarks}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default InvoiceViewModal
