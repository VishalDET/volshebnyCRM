import Modal from '@components/Modal'
import Button from '@components/Button'
import { Printer, X, Download } from 'lucide-react'

const InvoiceViewModal = ({ isOpen, onClose, invoice, query, client }) => {
    if (!invoice) return null

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
                        {client ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">{client.firstName} {client.lastName}</p>
                                <p className="text-sm text-gray-600">{client.email}</p>
                                <p className="text-sm text-gray-600">{client.phone}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No client details available</p>
                        )}
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Query Context</h4>
                        {query ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Query #{query.id}</p>
                                <p className="text-sm text-gray-600">{query.originCityId} to {query.destinations?.map(d => d.cityName).join(', ')}</p>
                                <p className="text-sm text-gray-600">{new Date(query.travelDate).toLocaleDateString('en-GB')}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No query context</p>
                        )}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-700 mb-4">Financial Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="space-y-1 border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Subtotal (USD)</p>
                            <p className="text-2xl font-black text-gray-900">${invoice.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Tax / Adjustments</p>
                            <p className="text-2xl font-black text-blue-600">₹{invoice.taxAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold text-blue-600">Net Amount</p>
                            <p className="text-3xl font-black text-gray-900">₹{invoice.netAmount?.toLocaleString()}</p>
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
