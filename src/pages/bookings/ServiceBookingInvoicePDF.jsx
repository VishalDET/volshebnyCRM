import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getServiceBookingById } from '@api/booking.api'
import { manageClient, manageCurrency, manageSupplier } from '@api/masters.api'
import Button from '@components/Button'
import Loader from '@components/Loader'
import { Printer, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'react-hot-toast'
import logo from '../../assets/images/vol-logo.png'
import { numberToWords } from '@utils/formatters'

const ServiceBookingInvoicePDF = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // State
    const [loading, setLoading] = useState(true)
    const [booking, setBooking] = useState(null)
    const [client, setClient] = useState(null)
    const [supplier, setSupplier] = useState(null)
    const [currencySign, setCurrencySign] = useState('$')

    useEffect(() => {
        loadAllData()
    }, [id])

    const loadAllData = async () => {
        setLoading(true)
        try {
            const res = await getServiceBookingById(id)
            if (res.data?.success && res.data.data && res.data.data.length > 0) {
                const bookingData = res.data.data[0]
                setBooking(bookingData)
                await Promise.all([
                    fetchClient(bookingData.clientId),
                    fetchSupplier(bookingData.supplierId),
                    fetchCurrency(bookingData.currencyId)
                ])
            } else {
                toast.error("Booking not found")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load booking for printing")
        } finally {
            setLoading(false)
        }
    }

    const fetchClient = async (cId) => {
        try {
            const res = await manageClient({ id: parseInt(cId), spType: "E" })
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) setClient(data)
        } catch (e) { console.error(e) }
    }

    const fetchSupplier = async (sId) => {
        try {
            if (!sId) return
            const res = await manageSupplier({ id: parseInt(sId), spType: "E" })
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) setSupplier(data)
        } catch (e) { console.error(e) }
    }

    const fetchCurrency = async (currId) => {
        try {
            if (!currId) return
            const res = await manageCurrency({ id: 0, spType: "R" })
            const curr = res.data?.data?.find(c => (c.id || c.currencyId) === parseInt(currId))
            if (curr) setCurrencySign(curr.currencySign || "$")
        } catch (e) { console.error(e) }
    }

    const handlePrint = () => window.print()

    if (loading) return <Loader fullScreen text="Preparing Invoice..." />
    if (!booking) return <div className="p-8 text-center"><p className="text-red-600">Booking not found</p><Button onClick={() => navigate(-1)}>Back</Button></div>

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white overflow-x-hidden">
            <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>
                    Back
                </Button>
                <Button variant="primary" onClick={handlePrint} icon={<Printer size={16} />}>
                    Print Invoice
                </Button>
            </div>

            <div
                id="printable-voucher"
                className="bg-white shadow-2xl mx-auto p-10 print:shadow-none print:p-6 border rounded-sm font-serif"
                style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-4">
                    <div className="flex gap-4">
                        <img src={logo} alt="Logo" className='w-16 h-16 object-contain' />
                        <div>
                            <h2 className="text-xl font-black text-gray-900 leading-none">VOLSHEBNY HOLIDAYS LLP</h2>
                            <div className="mt-3 space-y-0.5 text-[10px] text-gray-600">
                                <p className="font-bold text-gray-800 uppercase">Registered Office:</p>
                                <p>G14, PRASAD CHAMBERS, TATA ROAD NO.2, OPERA HOUSE, MUMBAI</p>
                                <p className="font-bold text-gray-900 mt-1 uppercase">GSTIN: 07AAECV1234F1Z5</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-black text-dark bg-gray-100 px-2 py-1 inline-block mb-3 rounded text-secondary-600">SERVICE INVOICE</h2>
                        <div className="text-[10px] space-y-1">
                            <p><span className="text-gray-400 uppercase font-bold">Booking ID:</span> <span className="font-bold">{booking.bookingId}</span></p>
                            <p><span className="text-gray-400 uppercase font-bold">Date:</span> <span className="font-bold">{new Date().toLocaleDateString('en-GB')}</span></p>
                        </div>
                    </div>
                </div>

                {/* Billing & Supplier Section */}
                <div className="grid grid-cols-2 gap-0 border border-gray-600 mb-4 divide-x divide-gray-800">
                    <div className="p-3">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase mb-2">Details of Receiver (Billed To)</h3>
                        <p className="text-xs font-black text-gray-900 uppercase">{client?.firstName} {client?.lastName}</p>
                        {client?.companyName && <p className="text-[10px] font-bold text-gray-700">{client.companyName}</p>}
                        <p className="text-[10px] text-gray-600 mt-1 leading-tight">{client?.address}</p>
                        <div className="mt-2 text-[10px]">
                            <p><span className="font-bold uppercase tracking-tighter">GSTIN:</span> {client?.gstNumber || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="p-3">
                        <h3 className="text-[9px] font-black text-gray-400 uppercase mb-2">Service Provider (Supplier)</h3>
                        <p className="text-xs font-black text-gray-900 uppercase">{supplier?.companyName || supplier?.fullName || booking.supplierName}</p>
                        <p className="text-[10px] text-gray-600 mt-1 leading-tight">{supplier?.address || 'N/A'}</p>
                        <div className="mt-2 text-[10px]">
                            <p><span className="font-bold uppercase tracking-tighter">Service:</span> {booking.serviceTypeName}</p>
                            <p><span className="font-bold uppercase tracking-tighter">Date:</span> {new Date(booking.serviceDate).toLocaleDateString('en-GB')}</p>
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
                                <th className="px-3 py-2 text-right">Amount ({currencySign})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-[10px]">
                            <tr className="divide-x divide-gray-800 border-b border-gray-800 h-16">
                                <td className="px-2 py-2 text-center text-gray-500">1</td>
                                <td className="px-3 py-2">
                                    <p className="font-black text-gray-900 uppercase">{booking.serviceTypeName} Booking - {booking.bookingId}</p>
                                    <p className="text-[9px] text-gray-500 mt-1">Pax: {booking.adults} Adults, {booking.children} Children</p>
                                    {parseFloat(booking.rateOfExchange) > 1 && (
                                        <p className="text-[9px] text-blue-600 font-bold mt-1">Conversion: {currencySign}{parseFloat(booking.cost).toFixed(2)} @ {booking.rateOfExchange}</p>
                                    )}
                                    <p className="text-[9px] text-gray-500 italic mt-1">Remarks: {booking.remarks || 'None'}</p>
                                </td>
                                <td className="px-3 py-2 text-right font-black text-gray-900">
                                    ₹{(parseFloat(booking.cost) * parseFloat(booking.rateOfExchange || 1)).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="text-[10px] divide-x divide-gray-800">
                                <td colSpan="2" className="px-3 py-2 font-bold uppercase text-right bg-gray-50">Base Cost</td>
                                <td className="px-3 py-2 text-right font-black text-gray-900">₹{(parseFloat(booking.cost) * parseFloat(booking.rateOfExchange || 1)).toFixed(2)}</td>
                            </tr>
                            {booking.taxOption === 'Service Charge' && (
                                <>
                                    <tr className="text-[10px] divide-x divide-gray-800">
                                        <td colSpan="2" className="px-3 py-1.5 text-right text-gray-500">Service Charge</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-gray-700">₹{parseFloat(booking.serviceCharge || 0).toFixed(2)}</td>
                                    </tr>
                                    <tr className="text-[10px] divide-x divide-gray-800">
                                        <td colSpan="2" className="px-3 py-1.5 text-right text-gray-500 border-b border-gray-800">GST (18% on SC)</td>
                                        <td className="px-3 py-1.5 text-right font-bold text-gray-700 border-b border-gray-800">₹{parseFloat(booking.gstAmount || 0).toFixed(2)}</td>
                                    </tr>
                                </>
                            )}
                            {booking.taxOption === 'Remittance' && (
                                <tr className="text-[10px] divide-x divide-gray-800">
                                    <td colSpan="2" className="px-3 py-1.5 text-right text-gray-500 border-b border-gray-800">Remittance Charge</td>
                                    <td className="px-3 py-1.5 text-right font-bold text-gray-700 border-b border-gray-800">₹{parseFloat(booking.remittanceCharge || 0).toFixed(2)}</td>
                                </tr>
                            )}
                            <tr className="text-[11px] divide-x divide-gray-800 bg-gray-900 text-white">
                                <td colSpan="2" className="px-3 py-2.5 font-bold uppercase text-right">Grand Total</td>
                                <td className="px-3 py-2.5 text-right font-black text-base">₹{parseFloat(booking.totalAmount).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Words */}
                <div className="border border-gray-800 p-2 mb-4 bg-gray-50">
                    <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Total Amount in Words</p>
                    <p className="text-[10px] font-black uppercase text-gray-800 italic">{numberToWords(Math.round(booking.totalAmount))} Only</p>
                </div>

                {/* Bank & Sign */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div className="p-2 border border-blue-100 bg-blue-50/30 rounded-sm">
                            <h4 className="text-[8px] font-black text-blue-900 uppercase mb-1">Terms & Conditions</h4>
                            <ul className="text-[8px] text-gray-600 font-bold uppercase leading-tight list-decimal pl-3 space-y-0.5">
                                <li>E.& O.E. Payments should be made via Bank Transfer.</li>
                                <li>100% advance required 30 days prior to travel.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end items-end text-right">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase italic">Authorized Signatory</p>
                            <p className="text-xs font-black text-gray-900 uppercase">VOLSHEBNY HOLIDAYS LLP</p>
                            <div className="h-10"></div>
                            <div className="border-t border-gray-900 pt-1 px-4">
                                <p className="text-[9px] font-black text-gray-900 uppercase">Seal & Signature</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t-2 border-gray-900 flex justify-between items-center text-[8px] text-gray-400 font-bold uppercase italic">
                    <p>Designed with excellence for your premium travel experience.</p>
                    <p>Computer Generated Invoice - Needs No Signature</p>
                </div>
            </div>
        </div>
    )
}

export default ServiceBookingInvoicePDF
