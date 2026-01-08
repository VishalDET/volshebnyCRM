import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { manageClientInvoice, getClientInvoiceById } from '@api/clientInvoice.api'
import { manageQuery } from '@api/query.api'
import { manageClient, manageCountry } from '@api/masters.api'
import Button from '@components/Button'
import Loader from '@components/Loader'
import { Printer, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'

const InvoicePDF = ({ isAccumulated = false }) => {
    const { id, queryId } = useParams()
    const navigate = useNavigate()

    // State
    const [loading, setLoading] = useState(true)
    const [invoices, setInvoices] = useState([])
    const [query, setQuery] = useState(null)
    const [client, setClient] = useState(null)

    useEffect(() => {
        loadAllData()
    }, [id, queryId])

    const loadAllData = async () => {
        setLoading(true)
        try {
            if (isAccumulated) {
                // Fetch all invoices for query
                const payload = {
                    id: 0,
                    queryId: parseInt(queryId),
                    clientId: 0,
                    invoiceNo: "string",
                    invoiceDate: new Date().toISOString(),
                    dueDate: new Date().toISOString(),
                    currencyId: 0,
                    isDomestic: true,
                    totalAmount: 0,
                    gst: 0,
                    serviceCharge: 0,
                    remittance: 0,
                    rateOfExchange: 0,
                    paymentMethod: "string",
                    comments: "string",
                    netAmount: 0,
                    paymentStatus: "string",
                    userId: 0,
                    spType: "R"
                }
                const res = await manageClientInvoice(payload)
                const invData = res.data?.data || []
                setInvoices(invData)
                if (invData.length > 0) fetchQueryAndClient(invData[0].queryId, invData[0].clientId)
            } else {
                // Fetch single invoice
                const res = await getClientInvoiceById(id)
                const inv = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
                if (inv) {
                    setInvoices([inv])
                    fetchQueryAndClient(inv.queryId, inv.clientId)
                }
            }
        } catch (error) {
            toast.error("Failed to load invoice for printing")
        } finally {
            setLoading(false)
        }
    }

    const fetchQueryAndClient = async (qId, cId) => {
        try {
            const queryPayload = {
                id: parseInt(qId),
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
                isActive: true,
                spType: "E",
                destinations: [],
                childAges: []
            }
            const clientPayload = {
                id: parseInt(cId),
                firstName: "string",
                lastName: "string",
                mobileNo: "string",
                companyName: "string",
                emailId: "string",
                isGSTIN: true,
                gstNumber: "string",
                gstCertificate: "string",
                address: "string",
                landmark: "string",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "string",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const [qRes, cRes] = await Promise.all([
                manageQuery(queryPayload),
                manageClient(clientPayload)
            ])
            const qData = Array.isArray(qRes.data?.data) ? qRes.data.data[0] : qRes.data?.data
            const cData = Array.isArray(cRes.data?.data) ? cRes.data.data[0] : cRes.data?.data
            if (qData) setQuery(qData)
            if (cData) setClient(cData)
        } catch (e) { console.error(e) }
    }

    const grandTotal = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const totalTax = invoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0)
    const netAmount = invoices.reduce((sum, inv) => sum + (inv.netAmount || 0), 0)

    const handlePrint = () => window.print()

    if (loading) return <Loader fullScreen text="Preparing Invoice..." />
    if (!invoices.length) return <div className="p-8 text-center"><p className="text-red-600">Invoice not found</p><Button onClick={() => navigate(-1)}>Back</Button></div>

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white overflow-x-hidden">
            {/* Control Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <Button variant="primary" onClick={handlePrint} icon={<Printer size={16} />}>
                    Print Invoice
                </Button>
            </div>

            {/* A4 Canvas */}
            <div
                id="printable-voucher"
                className="bg-white shadow-2xl mx-auto p-12 print:shadow-none print:p-8 border rounded-sm"
                style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">VOLSHEBNY</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">DMC & Premium Services</p>
                        <div className="mt-8 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail size={14} /> accounts@volshebny.com</div>
                            <div className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</div>
                            <div className="flex items-center gap-2 font-medium text-gray-700">GSTIN: 07AAE CV1234F1Z5</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-gray-900 mb-6 uppercase">INVOICE</div>
                        <div className="space-y-1 text-sm font-medium">
                            <p className="text-gray-500 text-xs">INVOICE NO</p>
                            <p className="text-lg font-bold">{isAccumulated ? `ACC-${queryId}` : (invoices[0].invoiceNo || `INV-00${invoices[0].id}`)}</p>
                            <div className="pt-4 h-1"></div>
                            <p className="text-gray-500 text-xs">DATE</p>
                            <p className="text-lg font-bold">{new Date().toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Billed To</h3>
                        <div className="border-l-4 border-gray-900 pl-6 h-full flex flex-col justify-center">
                            <p className="text-xl font-bold text-gray-900">{client?.firstName} {client?.lastName}</p>
                            {client?.companyName && <p className="font-semibold text-gray-700">{client.companyName}</p>}
                            <p className="text-sm text-gray-600 mt-2 max-w-[250px]">{client?.address}</p>
                            <p className="text-sm text-gray-600 italic">GST: {client?.gstNumber || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Service Details</h3>
                        <div className="bg-gray-50 p-6 space-y-3 rounded-sm border">
                            <div className="flex justify-between">
                                <span className="text-xs text-gray-500">QUERY ID:</span>
                                <span className="text-sm font-bold">#{query?.id}</span>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span className="text-xs text-gray-500">TRAVEL DATE:</span>
                                <span className="text-sm font-bold">{query?.travelDate ? new Date(query.travelDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                            </div>
                            <div className="flex justify-between border-t pt-3">
                                <span className="text-xs text-gray-500">PAX:</span>
                                <span className="text-sm font-bold">{query?.adults} ADT / {query?.children} CHD</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Table */}
                <div className="mb-12">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-900 text-white text-xs font-black uppercase tracking-widest">
                                <th className="px-6 py-4">Item Description</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-b border-gray-900">
                            {invoices.map((inv, idx) => (
                                <tr key={idx} className="text-sm bg-white">
                                    <td className="px-6 py-6 min-w-[300px]">
                                        <p className="font-black text-gray-900 text-base">{inv.invoiceNo || 'General Travel Services'}</p>
                                        <p className="text-gray-500 mt-1 italic">Services provided for Query #{query?.id}</p>
                                    </td>
                                    <td className="px-6 py-6 text-center font-bold text-gray-700">
                                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-6 text-right font-black text-gray-900 text-base">
                                        {inv.totalAmount?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary Section */}
                <div className="flex justify-end pr-1">
                    <div className="w-1/2 space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold text-gray-600">
                            <span>Tax Base (GST)</span>
                            <span>₹{totalTax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center border-t-4 border-gray-900 pt-6 mt-4">
                            <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Grand Total</span>
                            <span className="text-3xl font-black text-gray-900">₹{netAmount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info & Terms */}
                <div className="mt-16 pt-12 border-t border-gray-100 flex justify-between gap-12">
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Bank Details</h4>
                        <div className="text-xs font-bold text-gray-700 leading-relaxed uppercase">
                            <p>Bank: AXIS BANK LTD</p>
                            <p>A/c Name: VOLSHEBNY PREMIUM SERVICES</p>
                            <p>A/c No: 918020012345678</p>
                            <p>IFSC: AXIS0001234</p>
                        </div>
                    </div>
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Terms</h4>
                        <p className="text-[10px] text-gray-500 font-bold italic leading-relaxed uppercase">
                            1. All payments should be made in favor of VOLSHEBNY PREMIUM SERVICES.<br />
                            2. 100% Payment required before travel dates.<br />
                            3. Cancellation as per individual hotel/service policies.
                        </p>
                    </div>
                </div>

                {/* Signature / Footer */}
                <div className="mt-auto pt-24 text-center">
                    <div className="inline-block border-t-2 border-gray-200 px-12 pt-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Authorized Signatory</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InvoicePDF
