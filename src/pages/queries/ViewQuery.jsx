import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '@components/PageHeader'
import Button from '@components/Button'
import Loader from '@components/Loader'
import { manageQuery } from '@api/query.api'
import { manageClient, manageCity, manageCountry } from '@api/masters.api'
import { toast } from 'react-hot-toast'

const ViewQuery = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [query, setQuery] = useState(null)
    const [loading, setLoading] = useState(true)

    // Additional details for display
    const [client, setClient] = useState(null)
    const [locationNames, setLocationNames] = useState({}) // map ID to name

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

                // ... rest of the location name fetching logic ...
                fetchCountriesAndMap(queryData)
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

    if (loading) return <Loader fullScreen text="Loading query..." />
    if (!query) return <div className="p-8 text-center">Query not found</div>

    const clientName = client ? `${client.firstName} ${client.lastName}` : (query.clientName || 'Unknown')

    return (
        <div>
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
                        <Button variant="outline" onClick={() => navigate(`/queries/edit/${id}`)}>
                            Edit Details
                        </Button>
                        <Button variant="primary" onClick={() => navigate(`/queries/${id}/confirm`)}>
                            Confirm Query
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
                </div>

                <div className="space-y-6">
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
                                Generate Voucher
                            </Button>
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
                </div>
            </div>
        </div>
    )
}

export default ViewQuery
