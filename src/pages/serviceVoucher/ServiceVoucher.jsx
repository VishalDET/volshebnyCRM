import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { manageQuery, manageConfirmQuery } from '@api/query.api'
import { manageClient, manageCountry } from '@api/masters.api'
import { getServiceVoucher } from '@api/voucher.api'
import { toast } from 'react-hot-toast'
import Loader from '@components/Loader'
import Button from '@components/Button'
import { Printer, ArrowLeft, Mail, Phone, MapPin } from 'lucide-react'

const ServiceVoucher = () => {
    const { id } = useParams()
    const navigate = useNavigate()

    // State
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState(null)
    const [client, setClient] = useState(null)
    const [voucherData, setVoucherData] = useState(null)
    const [confirmedQuery, setConfirmedQuery] = useState(null)
    const [locationNames, setLocationNames] = useState({})
    const [placardName, setPlacardName] = useState('')

    useEffect(() => {
        if (id) {
            fetchAllData()
        }
    }, [id])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            await Promise.all([
                fetchQueryData(),
                fetchVoucherData(),
                fetchConfirmedQueryDetails()
            ])
        } catch (error) {
            console.error("Error loading voucher data:", error)
            toast.error("Failed to load voucher data")
        } finally {
            setLoading(false)
        }
    }

    const fetchQueryData = async () => {
        const payload = {
            id: parseInt(id),
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
        const res = await manageQuery(payload)
        const qData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data

        if (qData) {
            setQuery(qData)
            if (qData.clientId) fetchClientDetails(qData.clientId)
            fetchCountriesAndMap()
        }
    }

    const fetchClientDetails = async (clientId) => {
        try {
            const payload = {
                id: clientId,
                firstName: "",
                lastName: "",
                mobileNo: "",
                companyName: "",
                emailId: "",
                isGSTIN: true,
                gstNumber: "",
                gstCertificate: "",
                address: "",
                landmark: "",
                countryId: 0,
                stateId: 0,
                cityId: 0,
                pincode: "",
                contacts: [],
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "E"
            }
            const res = await manageClient(payload)
            const clientData = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (clientData) setClient(clientData)
        } catch (e) { console.error(e) }
    }

    const fetchCountriesAndMap = async () => {
        try {
            const res = await manageCountry({ spType: "R", isDeleted: false })
            if (res.data?.data) {
                const updatedLocs = {}
                res.data.data.forEach(c => {
                    updatedLocs[`country_${c.countryId}`] = c.countryName
                })
                setLocationNames(prev => ({ ...prev, ...updatedLocs }))
            }
        } catch (e) { console.error(e) }
    }

    const fetchConfirmedQueryDetails = async () => {
        try {
            const payload = {
                queryId: parseInt(id),
                isVisaIncluded: true,
                finalItinerary: "string",
                miscellaneous: "string",
                spType: "R",
                tourLeads: [{ leadName: "string", gender: "string", age: 0, visaStatus: "string" }],
                services: [{ countryId: 0, cityId: 0, serviceType: "string", serviceCharge: 0, currencyId: 0, supplierId: 0, supplierName: "string", serviceDate: new Date().toISOString(), description: "string", checkInDate: new Date().toISOString(), checkOutDate: new Date().toISOString(), pickupLocation: "string", dropLocation: "string", mealType: "string" }],
                guides: [{ supplierId: 0, supplierName: "string", guideName: "string", gender: "string", contactNumber: "string", language: "string" }]
            }
            const res = await manageConfirmQuery(payload)
            const data = Array.isArray(res.data?.data) ? res.data.data[0] : res.data?.data
            if (data) setConfirmedQuery(data)
        } catch (e) { console.error(e) }
    }

    const fetchVoucherData = async () => {
        try {
            const res = await getServiceVoucher(id)
            if (res.data?.success) setVoucherData(res.data.data)
        } catch (e) { console.error(e) }
    }

    // Initialize placard name from voucher or confirmed query, but don't overwrite user edits
    useEffect(() => {
        if (!placardName && (voucherData || confirmedQuery)) {
            const initial = voucherData?.guestNames || confirmedQuery?.tourLeads?.[0]?.leadName || 'VOLSHEBNY GUESTS'
            setPlacardName(initial)
        }
    }, [voucherData, confirmedQuery])

    const handlePrint = () => {
        window.print()
    }

    if (loading) return <Loader fullScreen text="Generating Service Voucher..." />
    if (!query) return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600">Query Not Found</h2>
            <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:p-0 print:bg-white overflow-x-hidden">
            {/* Action Bar */}
            <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <Button variant="secondary" onClick={() => navigate(-1)} icon={<ArrowLeft size={16} />}>
                    Back to Query
                </Button>
                <Button variant="primary" onClick={handlePrint} icon={<Printer size={16} />}>
                    Print Voucher
                </Button>
            </div>

            {/* Voucher Canvas */}
            <div
                id="printable-voucher"
                className="bg-white shadow-xl mx-auto p-12 print:shadow-none print:p-8 border rounded-lg"
                style={{ width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}
            >
                {/* Logo & Company Header */}
                <div className="flex justify-between items-start mb-8 border-b-2 border-blue-900 pb-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">VOLSHEBNY</h1>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mt-1">Premium Destination Management</p>
                        <div className="mt-4 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2"><Mail size={14} /> contact@volshebny.com</div>
                            <div className="flex items-center gap-2"><Phone size={14} /> +1 234 567 890</div>
                            <div className="flex items-center gap-2"><MapPin size={14} /> 123 Luxury Avenue, Suite 456</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-blue-900 text-white px-4 py-2 font-bold text-xl mb-4">SERVICE VOUCHER</div>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p className="font-semibold">Voucher #: <span className="text-blue-900">VSB-{id}</span></p>
                            <p>Query ID: <span className="font-semibold">#{id}</span></p>
                            <p>Date: <span className="font-semibold">{new Date().toLocaleDateString('en-GB')}</span></p>
                        </div>
                    </div>
                </div>

                {/* Primary Info Grid (From Excel) */}
                <div className="grid grid-cols-4 border-2 border-gray-800 text-center mb-8 overflow-hidden rounded-sm">
                    <div className="bg-gray-100 border-r border-b border-gray-800 p-2 font-bold text-xs uppercase">Destination</div>
                    <div className="bg-gray-100 border-r border-b border-gray-800 p-2 font-bold text-xs uppercase">No. of Pax</div>
                    <div className="bg-gray-100 border-r border-b border-gray-800 p-2 font-bold text-xs uppercase">Date of Travel</div>
                    <div className="bg-gray-100 border-b border-gray-800 p-2 font-bold text-xs uppercase">Duration</div>

                    <div className="border-r border-gray-800 p-3 flex items-center justify-center text-sm font-medium">
                        {query.destinations?.map(d => d.countryName).join(', ') || '-'}
                    </div>
                    <div className="border-r border-gray-800 p-3 flex items-center justify-center text-sm font-medium">
                        {voucherData?.noOfPax || (query.adults + query.children + query.infants) || '-'}
                    </div>
                    <div className="border-r border-gray-800 p-3 flex items-center justify-center text-sm font-medium">
                        {voucherData?.dateOfTravel ? new Date(voucherData.dateOfTravel).toLocaleDateString('en-GB') : (query.travelDate ? new Date(query.travelDate).toLocaleDateString('en-GB') : '-')}
                    </div>
                    <div className="p-3 flex items-center justify-center text-sm font-medium">
                        {voucherData?.duration || (query.totalDays ? `${query.totalDays} Days` : '-')}
                    </div>
                </div>

                {/* Second Level Grid: Guest details & Placard */}
                <div className="grid grid-cols-2 border-2 border-t-0 border-gray-800 mb-8 rounded-sm">
                    <div className="border-r border-gray-800">
                        <div className="p-3 border-b border-gray-800 bg-gray-50 flex justify-between">
                            <span className="font-bold text-xs uppercase">Guest Names:</span>
                        </div>
                        <div className="p-4 text-sm min-h-[60px]">
                            {confirmedQuery?.tourLeads?.map(l => l.leadName).join(', ') || voucherData?.guestNames || '-'}
                        </div>
                    </div>
                    <div>
                        <div className="p-3 border-b border-gray-800 bg-gray-50 flex justify-between">
                            <span className="font-bold text-xs uppercase">Placard Name:</span>
                        </div>
                        <div className="p-4 text-xl font-black text-center text-blue-900 uppercase">
                            <input
                                type="text"
                                value={placardName}
                                onChange={(e) => setPlacardName(e.target.value)}
                                className="w-full text-center font-black text-xl text-blue-900 uppercase bg-transparent border-0 focus:outline-none"
                                aria-label="Placard Name"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="mb-8 card border-2 border-gray-800 p-0 rounded-sm">
                    <div className="bg-gray-800 text-white px-4 py-2 font-bold text-xs uppercase">Emergency Contact Support</div>
                    <div className="grid grid-cols-4 text-center divide-x divide-gray-800">
                        <div className="p-3">
                            <dt className="text-[10px] text-gray-500 uppercase font-bold">Guest Contact</dt>
                            <dd className="text-sm font-semibold">{client?.mobileNo || '-'}</dd>
                        </div>
                        <div className="p-3">
                            <dt className="text-[10px] text-gray-500 uppercase font-bold">Driver Info</dt>
                            <dd className="text-sm font-semibold">TBA</dd>
                        </div>
                        <div className="p-3">
                            <dt className="text-[10px] text-gray-500 uppercase font-bold">Local Support</dt>
                            <dd className="text-sm font-semibold">+1 234 567 890</dd>
                        </div>
                        <div className="p-3">
                            <dt className="text-[10px] text-gray-500 uppercase font-bold">Regional Office</dt>
                            <dd className="text-sm font-semibold">+1 987 654 321</dd>
                        </div>
                    </div>
                </div>

                {/* Final Itinerary / Program Details (This replaces the simple itinerary table if present) */}
                <div className="mb-8">
                    <h3 className="bg-blue-900 text-white px-4 py-2 font-bold text-xs uppercase mb-3">Service Itinerary & Program Details</h3>
                    {confirmedQuery?.finalItinerary ? (
                        /<\/?(table|tr|td|th|div|p|br|span)/i.test(confirmedQuery.finalItinerary) ? (
                            <div className="border-2 border-gray-800 p-4 text-sm leading-relaxed text-gray-700 min-h-[200px]" dangerouslySetInnerHTML={{ __html: confirmedQuery.finalItinerary }} />
                        ) : (
                            <div className="border-2 border-gray-800 p-4 text-sm leading-relaxed whitespace-pre-line text-gray-700 min-h-[200px]">
                                {confirmedQuery.finalItinerary}
                            </div>
                        )
                    ) : (
                        <div className="border-2 border-gray-800 border-dashed p-8 text-center text-gray-400 italic">
                            Refer to Detailed Program Document
                        </div>
                    )}
                </div>

                {/* Meals Details */}
                <div className="mb-8">
                    <h3 className="bg-blue-900 text-white px-4 py-2 font-bold text-xs uppercase mb-3">Meals Details</h3>
                    {((confirmedQuery?.services && confirmedQuery.services.length) || (voucherData?.services && voucherData.services.length)) ? (
                        <div className="border-2 border-gray-800 p-4 text-sm">
                            <div className="grid grid-cols-4 gap-2 font-semibold text-xs uppercase bg-gray-100 p-2">
                                <div>Date</div>
                                <div>Location</div>
                                <div>Service</div>
                                <div>Meals</div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {(confirmedQuery?.services || voucherData?.services || []).map((s, idx) => (
                                    <div key={idx} className="grid grid-cols-4 gap-2 p-2 items-center text-sm">
                                        <div>{s?.serviceDate ? new Date(s.serviceDate).toLocaleDateString('en-GB') : '-'}</div>
                                        <div>{s?.countryName || locationNames[`country_${s?.countryId}`] || '-'}</div>
                                        <div>{s?.supplierName || s?.description || '-'}</div>
                                        <div>{s?.mealType || '-'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="border-2 border-gray-800 border-dashed p-8 text-center text-gray-400 italic">No meal details available</div>
                    )}
                </div>

                {/* Footer Terms */}
                <div className="mt-auto pt-10 border-t border-gray-200 text-[10px] text-gray-500 italic">
                    <p className="mb-2"><strong>Terms & Conditions:</strong> This voucher is valid only for the services mentioned above. Any extra services availed strictly on direct payment basis. Please present a print or digital copy of this voucher at the time of service.</p>
                    <p className="text-center font-bold text-blue-900 uppercase tracking-tighter mt-4">Thank you for traveling with Volshebny Premium Services</p>
                </div>
            </div>
        </div>
    )
}

export default ServiceVoucher
