import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { manageClientInvoice, getClientInvoiceById } from '@api/clientInvoice.api'
import { manageQuery } from '@api/query.api'
import { manageClient, manageCountry } from '@api/masters.api'
import Button from '@components/Button'
import Loader from '@components/Loader'
import { Printer, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import logo from '../../assets/images/vol-logo.png'
import { numberToWords } from '@utils/formatters'

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
                className="bg-white shadow-2xl mx-auto p-10 print:shadow-none print:p-6 border rounded-sm font-serif"
                style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
                {/* Header: Company Details */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-4">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 rounded-sm flex items-center justify-center text-white font-black text-xl">
                            <img src={logo} alt="Logo" className='w-full h-full object-contain' />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-none">VOLSHEBNY HOLIDAYS LLP</h2>
                            {/* <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Premium Destination Management</p> */}
                            <div className="mt-3 space-y-0.5 text-[10px] text-gray-600">
                                <p className="font-bold text-gray-800 uppercase">Registered Office:</p>
                                <p>G14, PRASAD CHAMBERS
                                    TATA ROAD NO.2
                                    OPERA HOUSE
                                    MUMBAI</p>
                                <p className="font-bold text-gray-900 mt-1 uppercase">GSTIN: 07AAECV1234F1Z5 | PAN: AAECV1234F</p>
                                <p>CIN: AAG-0129</p>
                                <div className="flex gap-4 mt-1">
                                    <span><Mail size={10} className="inline mr-1" /> info@volshebnyholidays.co</span>
                                    <span><Phone size={10} className="inline mr-1" /> +91 98765 43210</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-black text-dark bg-gray-100 px-2 py-1 inline-block mb-3 rounded">TAX INVOICE</h2>
                        <div className="text-[10px] space-y-1">
                            <p><span className="text-gray-400 uppercase font-bold">Invoice No:</span> <span className="font-bold">{isAccumulated ? `ACC-${queryId}` : (invoices[0].invoiceNo || `INV-00${invoices[0].id}`)}</span></p>
                            <p><span className="text-gray-400 uppercase font-bold">Invoice Date:</span> <span className="font-bold">{new Date().toLocaleDateString('en-GB')}</span></p>
                            <p><span className="text-gray-400 uppercase font-bold">State Name:</span> <span className="font-bold">Maharashtra</span></p>
                        </div>
                    </div>
                </div>

                {/* Billing Section */}
                <div className="grid grid-cols-2 gap-0 border border-gray-600 mb-4 divide-x divide-gray-800">
                    <div className="p-3">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase mb-2">Details of Receiver (Billed To)</h3>
                        <p className="text-xs font-black text-gray-900 uppercase">{client?.firstName} {client?.lastName}</p>
                        {client?.companyName && <p className="text-[10px] font-bold text-gray-700">{client.companyName}</p>}
                        <p className="text-[10px] text-gray-600 mt-1 max-w-[200px] leading-tight">{client?.address}</p>
                        <div className="mt-2 text-[10px] space-y-0.5">
                            <p><span className="font-bold uppercase tracking-tighter">GSTIN:</span> {client?.gstNumber || 'N/A'}</p>
                            <p><span className="font-bold uppercase tracking-tighter">Place of Supply:</span> {client?.stateName || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase mb-2">Consignee (Ship To)</h3>
                        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-sm mb-2 border border-dashed border-gray-300">
                            <span className="text-[9px] font-bold text-gray-500 uppercase">Query Reference</span>
                            <span className="text-xs font-black text-gray-900 tracking-tighter">#{query?.id} / {query?.queryNo || 'N/A'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[10px]">
                            <div>
                                <p className="text-gray-400 uppercase font-bold text-[8px]">Nature of Service</p>
                                <p className="font-bold">Destination Management</p>
                            </div>
                            <div>
                                <p className="text-gray-400 uppercase font-bold text-[8px]">Reporting Date</p>
                                <p className="font-bold">{query?.travelDate ? new Date(query.travelDate).toLocaleDateString('en-GB') : 'TBD'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Particulars Table */}
                <div className="mb-4">
                    <table className="w-full text-left border-collapse border border-gray-800">
                        <thead>
                            <tr className="bg-gray-100 text-[9px] font-black uppercase text-gray-700 border-b border-gray-800 divide-x divide-gray-800">
                                <th className="px-2 py-2 w-10 text-center">S.No</th>
                                <th className="px-3 py-2">Description of Services</th>
                                <th className="px-3 py-2 w-20 text-center">Date</th>
                                <th className="px-3 py-2 w-28 text-right">Amount ($)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[10px]">
                            {invoices.map((inv, idx) => (
                                <tr key={idx} className="divide-x divide-gray-800 border-b border-gray-800 h-12">
                                    <td className="px-2 py-2 text-center text-gray-500">{idx + 1}</td>
                                    <td className="px-3 py-2">
                                        <p className="font-black text-gray-900 uppercase">Travel Package Services - {inv.invoiceNo}</p>
                                        <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">VOLSHEBNY HOLIDAYS LLP for Query #{query?.id}</p>
                                    </td>
                                    <td className="px-3 py-2 text-center font-bold text-gray-700">
                                        {inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-GB') : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right font-black text-gray-900">
                                        {inv.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="text-[10px] divide-x divide-gray-800">
                                <td colSpan="3" className="px-3 py-2 font-bold uppercase text-right bg-gray-50">Sub Total</td>
                                <td className="px-3 py-2 text-right font-black text-gray-900">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            </tr>
                            {invoices.some(i => i.isDomestic) && (
                                <>
                                    <tr className="text-[10px] divide-x divide-gray-800 whitespace-nowrap">
                                        <td colSpan="3" className="px-3 py-1.5 text-right text-gray-500">CGST (9%)</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-gray-700">${(totalTax / 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr className="text-[10px] divide-x divide-gray-800 whitespace-nowrap">
                                        <td colSpan="3" className="px-3 py-1.5 text-right text-gray-500 border-b border-gray-800">SGST (9%)</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-gray-700 border-b border-gray-800">${(totalTax / 2).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </>
                            )}
                            <tr className="text-[11px] divide-x divide-gray-800 bg-gray-900 text-white">
                                <td colSpan="3" className="px-3 py-2.5 font-bold uppercase text-right">Grand Total (Rounded)</td>
                                <td className="px-3 py-2.5 text-right font-black text-base">${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Amount in Words */}
                <div className="border border-gray-800 p-2 mb-4 bg-gray-50">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Amount in Words</p>
                    <p className="text-[10px] font-black uppercase text-gray-800 italic">{numberToWords(Math.round(grandTotal))} Only</p>
                </div>

                {/* Bottom Section: Bank & Terms */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-[9px] font-black text-gray-400 uppercase mb-1.5 underline decoration-gray-900 underline-offset-4">Bank Account Details</h3>
                            <table className="w-full text-[9px] border-collapse border border-gray-300">
                                <tbody>
                                    <tr className="border-b divide-x">
                                        <th className="px-2 py-1 bg-gray-50 w-24 text-left">Account Name</th>
                                        <td className="px-2 py-1 font-bold">VOLSHEBNY PREMIUM SERVICES</td>
                                    </tr>
                                    <tr className="border-b divide-x">
                                        <th className="px-2 py-1 bg-gray-50">Bank Name</th>
                                        <td className="px-2 py-1 font-bold">AXIS BANK LTD</td>
                                    </tr>
                                    <tr className="border-b divide-x">
                                        <th className="px-2 py-1 bg-gray-50">A/c Number</th>
                                        <td className="px-2 py-1 font-black text-gray-900">918020012345678</td>
                                    </tr>
                                    <tr className="divide-x">
                                        <th className="px-2 py-1 bg-gray-50">IFSC Code</th>
                                        <td className="px-2 py-1 font-black text-gray-900">UTIB0001234</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="p-2 border border-blue-100 bg-blue-50/30 rounded-sm">
                            <h4 className="text-[8px] font-black text-blue-900 uppercase mb-1">Terms & Conditions</h4>
                            <ul className="text-[8px] text-gray-600 font-bold uppercase leading-tight list-decimal pl-3 space-y-0.5">
                                <li>E.& O.E. Payments should be made via Bank Transfer.</li>
                                <li>100% advance required 30 days prior to travel.</li>
                                <li>Subject to Noida Jurisdiction.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col justify-between items-end text-right border-l border-gray-100 pl-4">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase italic">Digitally Signed By</p>
                            <p className="text-xs font-black text-gray-900 uppercase">VOLSHEBNY PREMIUM SERVICES</p>
                            <div className="h-10"></div>
                            <div className="border-t border-gray-900 pt-1 inline-block px-4">
                                <p className="text-[9px] font-black text-gray-900 uppercase">Authorized Signatory</p>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-between items-end">
                    <div className="flex gap-4">
                        <img src={logo} alt="Logo" className='w-12 h-12 object-contain' />
                        <div className="text-[8px] text-gray-400 font-bold italic">
                            <p>Thank you for choosing luxury destination management.</p>
                            <p>Designed with excellence for your premium travel experience.</p>
                        </div>
                    </div>
                    <div className="text-[8px] text-gray-400 font-bold flex items-center gap-3">
                        <span>Page 1 of 1</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>

                    </div>

                </div>
                <p className="text-[6px] text-gray-400 text-center font-bold uppercase tracking-tighter italic">This is a computer generated invoice and requires no physical signature.</p>

            </div>
        </div>
    )
}

export default InvoicePDF
