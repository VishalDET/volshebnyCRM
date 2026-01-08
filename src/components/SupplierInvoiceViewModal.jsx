import Modal from '@components/Modal'
import Button from '@components/Button'
import { X, ExternalLink } from 'lucide-react'

const SupplierInvoiceViewModal = ({ isOpen, onClose, invoice, query, supplierName }) => {
    if (!invoice) return null

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
                        <p className="text-sm font-semibold">{supplierName}</p>
                        <p className="text-sm text-gray-600">Service: {invoice.serviceType}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-1">Query Context</h4>
                        {query ? (
                            <div className="space-y-1">
                                <p className="text-sm font-semibold">Query #{query.id}</p>
                                <p className="text-sm text-gray-600">{query.queryNo}</p>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Subtotal</p>
                            <p className="text-lg font-bold text-gray-900">₹{invoice.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">GST</p>
                            <p className="text-lg font-bold text-blue-600">₹{invoice.gst?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1 md:border-r border-gray-200">
                            <p className="text-xs text-gray-500 uppercase">Service Charge</p>
                            <p className="text-lg font-bold text-blue-600">₹{invoice.serviceCharge?.toLocaleString() || '0'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase font-bold text-blue-600">Net Amount</p>
                            <p className="text-xl font-black text-gray-900">₹{invoice.netAmount?.toLocaleString()}</p>
                        </div>
                    </div>

                    {(invoice.remittance > 0 || invoice.rateOfExchange > 1) && (
                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 text-center">
                            <div className="space-y-1">
                                <p className="text-xs text-gray-500 uppercase">Remittance</p>
                                <p className="text-md font-semibold text-gray-700">₹{invoice.remittance?.toLocaleString()}</p>
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
