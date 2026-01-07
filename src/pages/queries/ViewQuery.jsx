import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import { Eye, Pencil, Trash2, CheckCircle } from 'lucide-react'
import Loader from '@components/Loader'
import { manageQuery, manageConfirmQuery } from '@api/query.api'
import { manageClient, manageCity, manageCountry, manageSupplier, manageCurrency } from '@api/masters.api'

import { toast } from 'react-hot-toast'

import { Calendar, User, Building, Users, Banknote, FileText, Briefcase, Printer } from 'lucide-react'

const ViewQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [query, setQuery] = useState(null)
    const [loading, setLoading] = useState(true)

    // Additional details for display
    const [client, setClient] = useState(null)
    const [locationNames, setLocationNames] = useState({}) // map ID to name

    // Confirmed query details
    const [confirmedQuery, setConfirmedQuery] = useState(null)
    const [suppliers, setSuppliers] = useState([])
    const [currencies, setCurrencies] = useState([])

    // --- Voucher Handlers ---
    const handleGenerateVoucher = () => {
        navigate(`/service-voucher/${id}`)
    }

    useEffect(() => {
        if (id) {
            fetchQueryData()
        }
    }, [id])

    const fetchQueryData = async () => {
        setLoading(true)
        try {
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

            const response = await manageQuery(payload)
            const data = response.data?.data || (Array.isArray(response.data) ? response.data : [])
            const queryData = Array.isArray(data) ? data[0] : data

            if (queryData) {
                setQuery(queryData)
                // Fetch Full Client Details
                if (queryData.clientId) {
                    fetchClientDetails(queryData.clientId)
                }

                // Fetch location names
                fetchCountriesAndMap(queryData)

                // Fetch confirmed query details if status is Confirmed
                if (queryData.queryStatus?.toLowerCase() === 'confirmed') {
                    await fetchConfirmedQueryDetails(queryData.id)
                    await fetchSuppliers()
                    await fetchCurrencies()
                }
            } else {
                toast.error("Query not found")
            }
        } catch (error) {
            console.error("Error fetching query:", error)
            toast.error("Failed to load query")
        } finally {
            setLoading(false)
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
            const data = res.data?.data || []
            const clientData = Array.isArray(data) ? data[0] : data
            if (clientData) {
                setClient(clientData)
            }
        } catch (e) {
            console.error("Error fetching client details:", e)
        }
    }

    const fetchCountriesAndMap = async (qData) => {
        // Fetch all countries to map IDs
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

    const fetchConfirmedQueryDetails = async (queryId) => {
        try {
            const payload = {
                queryId: parseInt(queryId),
                isVisaIncluded: true,
                finalItinerary: "string",
                miscellaneous: "string",
                spType: "R",
                tourLeads: [
                    {
                        leadName: "string",
                        gender: "string",
                        age: 0,
                        visaStatus: "string"
                    }
                ],
                services: [
                    {
                        countryId: 0,
                        cityId: 0,
                        serviceType: "string",
                        serviceCharge: 0,
                        currencyId: 0,
                        supplierId: 0,
                        supplierName: "string",
                        serviceDate: new Date().toISOString(),
                        description: "string",
                        checkInDate: new Date().toISOString(),
                        checkOutDate: new Date().toISOString(),
                        pickupLocation: "string",
                        dropLocation: "string",
                        mealType: "string"
                    }
                ],
                guides: [
                    {
                        supplierId: 0,
                        supplierName: "string",
                        guideName: "string",
                        gender: "string",
                        contactNumber: "string",
                        language: "string"
                    }
                ]
            }
            const res = await manageConfirmQuery(payload)
            console.log("Confirmed Query Response:", res.data)

            // The API returns data directly in res.data.data, potentially as an array
            const rawData = res.data?.data
            const confirmedData = Array.isArray(rawData) ? rawData[0] : rawData

            if (confirmedData) {
                console.log("Setting confirmed query data:", confirmedData)
                setConfirmedQuery(confirmedData)
            }
        } catch (error) {
            console.error("Error fetching confirmed query details:", error)
        }
    }

    const fetchSuppliers = async () => {
        try {
            const payload = {
                id: 0,
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
                createdBy: 0,
                modifiedBy: 0,
                isActive: true,
                spType: "R"
            }
            const res = await manageSupplier(payload)
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []

            const uniqueSuppliers = []
            const sIds = new Set()
            data.forEach(s => {
                if (!sIds.has(s.id)) {
                    sIds.add(s.id)
                    uniqueSuppliers.push({
                        value: s.id,
                        label: s.companyName || s.supplierName || s.fullName || 'Unknown Supplier'
                    })
                }
            })
            setSuppliers(uniqueSuppliers)
        } catch (error) {
            console.error("Error fetching suppliers:", error)
        }
    }

    const fetchCurrencies = async () => {
        try {
            const payload = {
                id: 0,
                currencyName: "string",
                currencySign: "string",
                isActive: true,
                isDeleted: false,
                spType: "R"
            }
            const res = await manageCurrency(payload)
            const data = res.data?.data || (Array.isArray(res.data) ? res.data : []) || []

            const uniqueCurrencies = []
            const cIds = new Set()
            data.forEach(c => {
                if (!cIds.has(c.id)) {
                    cIds.add(c.id)
                    uniqueCurrencies.push({
                        value: c.id,
                        label: `${c.currencyName} (${c.currencySign})`
                    })
                }
            })
            setCurrencies(uniqueCurrencies)
        } catch (error) {
            console.error("Error fetching currencies:", error)
        }
    }

    if (loading) return <Loader fullScreen text="Loading query..." />
    if (!query) return <div className="p-8 text-center">Query not found</div>

    const clientName = client ? `${client.firstName} ${client.lastName}` : (query.clientName || 'Unknown')

    return (
        <div className="pb-10">
            <PageHeader
                title={`Query #${query.queryNo || query.id}`}
                subtitle={`Client: ${clientName}`}
                breadcrumbs={[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Queries', href: '/queries' },
                    { label: `View` }
                ]}
                actions={
                    <div className="flex gap-3">
                        {query.queryStatus?.toLowerCase() === 'confirmed' && (
                            <Button
                                variant="outline"
                                onClick={handleGenerateVoucher}
                                disabled={false}
                                icon={<Printer size={18} />}
                            >
                                Generate Service Voucher
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => navigate(`/queries/edit/${id}`)}>
                            Edit Details
                        </Button>
                        {query.queryStatus?.toLowerCase() !== 'confirmed' && (
                            <Button variant="primary" onClick={() => navigate(`/queries/${id}/confirm`)}>
                                Confirm Query
                            </Button>
                        )}
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Client Information</h3>
                        {client ? (
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm text-secondary-600">Full Name</dt>
                                    <dd className="font-medium">{client.firstName} {client.lastName}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600">Company Name</dt>
                                    <dd className="font-medium">{client.companyName || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600">Mobile No</dt>
                                    <dd className="font-medium">{client.mobileNo || '-'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm text-secondary-600">Email ID</dt>
                                    <dd className="font-medium">{client.emailId || '-'}</dd>
                                </div>
                                <div className="md:col-span-2">
                                    <dt className="text-sm text-secondary-600">Address</dt>
                                    <dd className="font-medium">
                                        {[client.address, client.landmark, client.pincode].filter(Boolean).join(', ') || '-'}
                                    </dd>
                                </div>
                                {client.isGSTIN && (
                                    <div>
                                        <dt className="text-sm text-secondary-600">GST Number</dt>
                                        <dd className="font-medium">{client.gstNumber || '-'}</dd>
                                    </div>
                                )}
                            </dl>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-secondary-600">Loading client details...</span>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Travel Details</h3>
                        <dl className="grid grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm text-secondary-600">Origin</dt>
                                <dd className="font-medium">
                                    {locationNames[`country_${query.originCountryId}`] || query.originCountryId || '-'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Total Days</dt>
                                <dd className="font-medium">{query.totalDays || 0}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Travel Date</dt>
                                <dd className="font-medium">{query.travelDate ? new Date(query.travelDate).toLocaleDateString() : '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Return Date</dt>
                                <dd className="font-medium">{query.returnDate ? new Date(query.returnDate).toLocaleDateString() : '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Pax</dt>
                                <dd className="font-medium">
                                    {query.adults} Adults, {query.children} Children, {query.infants} Infants
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm text-secondary-600">Budget</dt>
                                <dd className="font-medium">₹{query.budget?.toLocaleString()}</dd>
                            </div>
                        </dl>

                        {query.specialRequirements && (
                            <div className="mt-4 pt-4 border-t">
                                <dt className="text-sm text-secondary-600 mb-1">Special Requirements</dt>
                                <dd className="font-medium text-sm bg-gray-50 p-3 rounded">{query.specialRequirements}</dd>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Destinations</h3>
                        {query.destinations && query.destinations.length > 0 ? (
                            <div className="space-y-2">
                                {query.destinations.map((dest, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                        <span className="font-bold text-gray-500 w-6">{idx + 1}.</span>
                                        <span>
                                            {locationNames[`country_${dest.countryId}`] || dest.countryName || `Country ID: ${dest.countryId}`}
                                        </span>
                                        {dest.cityName && <span className="text-gray-400 mx-2">/</span>}
                                        <span>{dest.cityName}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">No destinations specified</p>
                        )}
                    </div>

                    {/* Confirmed Query Details - Show only if status is Confirmed */}
                    {query.queryStatus?.toLowerCase() === 'confirmed' && confirmedQuery && (
                        <>
                            {/* Tour Leads */}
                            {confirmedQuery.tourLeads && confirmedQuery.tourLeads.length > 0 && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tour Leads / Travellers</h3>
                                    <div className="space-y-3">
                                        {confirmedQuery.tourLeads.map((lead, idx) => (
                                            <div key={idx} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded">
                                                <div>
                                                    <dt className="text-xs text-secondary-600">Name</dt>
                                                    <dd className="font-medium">{lead.leadName || '-'}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-secondary-600">Gender</dt>
                                                    <dd className="font-medium">{lead.gender || '-'}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-secondary-600">Age</dt>
                                                    <dd className="font-medium">{lead.age || '-'}</dd>
                                                </div>
                                                <div>
                                                    <dt className="text-xs text-secondary-600">Visa Status</dt>
                                                    <dd className="font-medium">{lead.visaStatus || '-'}</dd>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Services by Destination */}
                            {confirmedQuery.services && confirmedQuery.services.length > 0 && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Services</h3>
                                    <div className="space-y-4">
                                        {/* Group services by destination */}
                                        {query.destinations && query.destinations.map((dest, dIdx) => {
                                            const destServices = confirmedQuery.services.filter(
                                                srv => srv.countryId === dest.countryId && srv.cityId === dest.cityId
                                            )

                                            if (destServices.length === 0) return null

                                            return (
                                                <div key={dIdx} className="border rounded-lg p-4 bg-gray-50">
                                                    <h4 className="font-bold text-blue-900 mb-3">
                                                        {locationNames[`country_${dest.countryId}`] || dest.countryName} - {dest.cityName}
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {destServices.map((srv, sIdx) => {
                                                            const supplier = suppliers.find(s => s.value === srv.supplierId)
                                                            const currency = currencies.find(c => c.value === srv.currencyId)

                                                            return (
                                                                <div key={sIdx} className="bg-white p-3 rounded border">
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                                                                        <div>
                                                                            <dt className="text-xs text-secondary-600">Service Type</dt>
                                                                            <dd className="font-medium text-sm">{srv.serviceType}</dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-xs text-secondary-600">Supplier</dt>
                                                                            <dd className="font-medium text-sm">{srv.supplierName || supplier?.label || '-'}</dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-xs text-secondary-600">Charge</dt>
                                                                            <dd className="font-medium text-sm">{srv.serviceCharge || 0}</dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-xs text-secondary-600">Currency</dt>
                                                                            <dd className="font-medium text-sm">{currency?.label || '-'}</dd>
                                                                        </div>
                                                                    </div>

                                                                    {/* Type-specific details */}
                                                                    {srv.serviceType === 'Transportation' && (srv.pickupLocation || srv.dropLocation) && (
                                                                        <div className="grid grid-cols-3 gap-3 mt-2 pt-2 border-t">
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">From</dt>
                                                                                <dd className="text-sm">{srv.pickupLocation || '-'}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">To</dt>
                                                                                <dd className="text-sm">{srv.dropLocation || '-'}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">Date</dt>
                                                                                <dd className="text-sm">{srv.serviceDate ? new Date(srv.serviceDate).toLocaleString() : '-'}</dd>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {srv.serviceType === 'Hotels' && (srv.checkInDate || srv.checkOutDate) && (
                                                                        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t">
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">Check-In</dt>
                                                                                <dd className="text-sm">{srv.checkInDate ? new Date(srv.checkInDate).toLocaleString() : '-'}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">Check-Out</dt>
                                                                                <dd className="text-sm">{srv.checkOutDate ? new Date(srv.checkOutDate).toLocaleString() : '-'}</dd>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {srv.serviceType === 'Restaurants' && (
                                                                        <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t">
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">Date</dt>
                                                                                <dd className="text-sm">{srv.serviceDate ? new Date(srv.serviceDate).toLocaleString() : '-'}</dd>
                                                                            </div>
                                                                            <div>
                                                                                <dt className="text-xs text-secondary-600">Meal Type</dt>
                                                                                <dd className="text-sm">{srv.mealType || '-'}</dd>
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {srv.description && (
                                                                        <div className="mt-2 pt-2 border-t">
                                                                            <dt className="text-xs text-secondary-600">Description</dt>
                                                                            <dd className="text-sm text-gray-700">{srv.description}</dd>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Guides */}
                            {confirmedQuery.guides && confirmedQuery.guides.length > 0 && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Guides</h3>
                                    <div className="space-y-3">
                                        {confirmedQuery.guides.map((guide, idx) => {
                                            const supplier = suppliers.find(s => s.value === guide.supplierId)

                                            return (
                                                <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-4 p-3 bg-gray-50 rounded">
                                                    <div>
                                                        <dt className="text-xs text-secondary-600">Supplier</dt>
                                                        <dd className="font-medium text-sm">{guide.supplierName || supplier?.label || '-'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-secondary-600">Guide Name</dt>
                                                        <dd className="font-medium text-sm">{guide.guideName || '-'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-secondary-600">Gender</dt>
                                                        <dd className="font-medium text-sm">{guide.gender || '-'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-secondary-600">Contact</dt>
                                                        <dd className="font-medium text-sm">{guide.contactNumber || '-'}</dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-xs text-secondary-600">Language</dt>
                                                        <dd className="font-medium text-sm">{guide.language || '-'}</dd>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Final Itinerary */}
                            {(confirmedQuery.finalItinerary || confirmedQuery.isVisaIncluded !== undefined) && (
                                <div className="card">
                                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">Final Details</h3>
                                    {confirmedQuery.isVisaIncluded !== undefined && (
                                        <div className="mb-4">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${confirmedQuery.isVisaIncluded
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {confirmedQuery.isVisaIncluded ? '✓ Visa Included' : 'Visa Not Included'}
                                            </span>
                                        </div>
                                    )}
                                    {confirmedQuery.finalItinerary && (
                                        <div>
                                            <dt className="text-sm font-medium text-secondary-600 mb-2">Final Itinerary</dt>
                                            <dd className="text-sm bg-gray-50 p-4 rounded whitespace-pre-wrap">{confirmedQuery.finalItinerary}</dd>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-6">

                    <div className='card py-3'>
                        <div className='flex justify-between items-center mb-4 border-b pb-2'>
                            <div className="text-lg font-semibold">Client Invoices</div>
                            <Button variant="outline" className="py-1 px-2 text-sm" onClick={() => navigate(`/invoice/${id}`)}>
                                Generate Invoice
                            </Button>
                        </div>
                        <div className="flex flex-wrap justify-between items-center gap-2 bg-blue-100 py-1 px-2 rounded-md">
                            <div className='text-blue-700 px-2 py-1 text-sm'>
                                <span>Invoice No.</span>
                            </div>
                            <Button variant="outline" onClick={() => navigate(`/invoice/${id}`)} className="text-blue-700 hover:text-blue-800 p-1 border-none rounded hover:bg-gray-50 transition-colors"
                                title="View">
                                <Eye className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className='card-footer mt-4'>
                            <div className='flex justify-between items-center px-2 bg-green-600 py-1 rounded-md'>
                                <div className='text-sm text-gray-100'>
                                    <span>Accumulated Invoice</span>
                                </div>
                                <Button variant="outline" className="py-0 px-2 text-sm text-gray-100 border-gray-100 hover:text-gray-800 hover:border-gray-100 transition-colors" onClick={() => navigate(`/invoice/${id}`)}>
                                    Generate
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Status</h3>
                        <span className={`badge ${(query.queryStatus || '').toLowerCase() === 'confirmed' ? 'badge-success' :
                            (query.queryStatus || '').toLowerCase() === 'pending' ? 'badge-warning' :
                                'badge-info'
                            }`}>
                            {query.queryStatus || 'Pending'}
                        </span>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/queries/edit/${id}`)}>
                                Edit Details
                            </Button>
                            {/* Placeholders for future features */}
                            <Button variant="outline" className="w-full" disabled title="Coming soon">
                                Create Invoice
                            </Button>
                        </div>
                    </div>

                    {query.childAges && query.childAges.length > 0 && (
                        <div className="card">
                            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Children Ages</h3>
                            <div className="flex flex-wrap gap-2">
                                {query.childAges.map((age, i) => (
                                    <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                        Age: {age.childAge}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Service Voucher */}
                    <div className="card">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Service Voucher</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" className="w-full" onClick={() => navigate(`/service-voucher/${id}`)}>
                                View Service Voucher
                            </Button>
                        </div>
                    </div>


                </div>
            </div>


        </div>
    )
}

export default ViewQuery
